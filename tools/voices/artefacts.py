#!/usr/bin/env python3
# Détecteur de sons parasites (rires, respirations, bruits, mots étirés ou en trop) dans une prise ou un
# passage de voix de synthèse.
#
# Pourquoi : à l'écoute, la voix grave fait « parfois des sons bizarres (rires, respirations chelou) » ; la voix
# aiguë est jugée « top ». Les critères de generate.py (hauteur, débit, contour, voisement) ne voient pas ces
# sons : ils tombent entre les mots ou au bord de la phrase.
#
# Méthode, pour un audio et le texte qu'il doit dire (forme orale, celle envoyée au modèle) :
# 1. Alignement forcé mot à mot : Qwen3-ForcedAligner (mlx-community/Qwen3-ForcedAligner-0.6B-8bit, déjà dans
#    le cache Hugging Face, lu hors connexion), langue « French ». Ses instants sont quantifiés par pas de
#    80 ms. Les mots composés lui sont donnés séparés (« moment-là » → « moment là ») : collés, il comprimait
#    « momentlà » et laissait hors mot 0,16 à 0,24 s de parole (voix aiguë comme grave).
# 2. Trames de 10 ms : niveau (dB), part d'énergie sous 2,5 kHz, périodicité (maximum de l'autocorrélation
#    normalisée entre 60 et 500 Hz) et hauteur. Niveaux rapportés à la parole (médiane des trames actives des
#    mots) et au bruit de fond (10e centile des trames non nulles, borné à [parole − 75, parole − 45] dB : le
#    silence numérique des pauses assemblées n'est pas un bruit de fond, et sans silence de tête le centile
#    tombe dans le déclin des mots). Trame voisée : périodique (≥ 0,75) à moins de 30 dB de la parole, sauf
#    la voix craquée (très grave, sous 0,6 × la hauteur médiane, et faible, sous parole − 15 dB). Trame de
#    souffle : apériodique (< 0,6), ou à demi périodique (≤ 0,75) mais forte (à moins de 20 dB de la parole).
# 3. Zones hors des mots : trames actives (> parole − 35 dB et > bruit + 10 dB) hors des mots. Une zone n'est
#    retenue que si 30 ms au moins tombent hors des MARGES autour des mots (80 ms avant le début, 120 ms après
#    la fin), sinon c'est une fin de consonne ou l'imprécision de l'alignement.
# 4. Classement d'une zone retenue. La part voisée se mesure sur son cœur (hors des marges : la fin d'une
#    voyelle que l'alignement coupe trop tôt n'en est pas), la part soufflée sur toute la zone (une
#    respiration entre deux mots tombe en partie dans leurs marges) ; les deux sont jugées, la plus grave
#    l'emporte :
#    - voisée (≥ 40 ms de trames voisées dans le cœur) :
#      · bouffées voisées (≥ 2, creux de 6 dB entre elles, à 0,11-0,33 s d'intervalle, soit 3 à 9 Hz) : RIRE ;
#      · collée à un mot (sans silence entre eux) et voisée sur la moitié au moins de sa durée : c'est le mot
#        qui dure plus longtemps que l'alignement ne le voit (allongement, montée de continuation) ; elle est
#        jugée avec le mot (point 5) ;
#      · sinon PAROLE EN TROP (avant le premier mot ou après le dernier) ou VOCALISE (entre deux mots) ;
#    - soufflée : CLAQUEMENT (≤ 30 ms), RELÂCHEMENT de consonne (aigu, ≤ 100 ms de souffle à 250 ms au plus
#      de la fin d'un mot, ou collé à un mot et ≤ 150 ms de souffle : ignoré), RESPIRATION (énergie surtout
#      sous 2,5 kHz) ou BRUIT (souffle aigu, chuintement). Dans le prolongement d'un mot, les trames fortes
#      à demi périodiques sont la voyelle, pas un souffle.
# 5. Mots : MOT ÉTIRÉ quand le mot, avec ses prolongements voisés collés, dure bien plus que ses syllabes au
#    débit de la prise ; PAROLE EN TROP quand ce prolongement (≥ 0,30 s) touche le premier ou le dernier mot ;
#    VOCALISE quand un prolongement monte à 12 dB au-dessus de la parole (cri, voyelle chantée) ; MOT MANQUANT
#    OU BÂCLÉ quand un mot réduit à rien par l'alignement et ses deux voisins tiennent dans moins de 30 % de
#    la durée attendue de leurs syllabes.
# 6. Gravité : « net » (la prise est refusée par generate.py) ou « léger » (pénalité de score). Verdict de la
#    prise : refus (au moins un événement net), pénalité (seulement des légers) ou ok.
#
# Étalonnage (sans vérité terrain : la voix aiguë, jugée « top », sert de témoin négatif ; la voix grave publiée
# et ses prises gardées servent à trouver les défauts) — voir SEUILS, chaque seuil y est justifié par les
# mesures. Le README résume. La voix grave est retirée depuis (5 octobre 2026) : ses mesures restent celles de
# l'étalonnage, ses fichiers sont archivés dans report/archives/voix-grave/.
#
# Usage : ~/isoloir-tts/bin/python tools/voices/artefacts.py fichier.wav|m4a "texte dit"
#         ~/isoloir-tts/bin/python tools/voices/artefacts.py --voice aigue [--segment retraites-intro-01]
#                [--ecoute sortie.m4a]   (passages publiés : lecture seule, n'écrit ni inventaire ni état)
#         generate.py --scan / --redo-flagged : voir README.md
import os

os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

import re
import subprocess
import sys
import tempfile
import time
import warnings
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

warnings.filterwarnings("ignore", message="Chunk .* not understood")

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))

from texte import syllabes  # noqa: E402

MODELE_ALIGNEMENT = "mlx-community/Qwen3-ForcedAligner-0.6B-8bit"
SR_ALIGNE = 16000  # l'aligneur travaille à 16 kHz
PAS_S = 0.01  # trames de 10 ms

# Mesure des zones hors des mots
PARAMS = {
    # Marges autour des mots. Balayage sur le corpus (voir SEUILS), événements nets / légers (revue du 5 octobre,
    # 97 passages publiés de la voix aiguë) :
    #   marges (avant/après)  aiguë publiée  aiguë retenue  grave publiée  grave retenue  grave autres
    #   40/60 ms              3 / 14         0 / 1          2 / 4          2 / 4          13 / 35
    #   60/100 ms             3 / 10         0 / 1          2 / 3          2 / 3          13 / 26
    #   80/120 ms (retenu)    2 / 8          0 / 1          2 / 3          2 / 3          13 / 23
    #   100/160 ms            1 / 6          0 / 1          2 / 2          2 / 2          12 / 16
    #   160/240 ms            1 / 3          0 / 0          2 / 0          2 / 0           7 / 1
    # À 40/60 ms, la voix aiguë déclenche sur des fins de consonnes (« f » de « neuf » dans un passage publié ;
    # « s » de « six », jusqu'à 120 ms après la fin alignée, dans une prise écartée) ; à 60/100 ms, la voix grave déclenche encore sur le « r » final dévoisé de
    # « partir ? » (souffle grave, 0,64-0,77 s) et sur l'attaque d'un mot ; au-delà de 80/120 ms, les respirations
    # placées aux virgules (100 à 200 ms après le mot) disparaissent (grave publiée : celle de logement-existant-06).
    # Avant : un pas de l'aligneur (80 ms) ; après : un pas plus 40 ms de relâchement.
    "marge_avant": 0.08,
    "marge_apres": 0.12,
    "actif_db": -35.0,  # trame active : à moins de 35 dB de la parole...
    "sur_bruit_db": 10.0,  # ... et à 10 dB au moins au-dessus du bruit de fond
    "bruit_max_db": -45.0,  # bruit de fond estimé : au plus parole − 45 dB (voir analyse())
    "nacf_voise": 0.75,  # trame voisée : périodicité ≥ 0,75 (souffle et bruit : 0,1 à 0,5 ; voyelles 0,85-1)
    "voise_db": -30.0,  # ... à moins de 30 dB de la parole (sinon queue de résonance)
    # trame de souffle : périodicité < 0,6 (souffle, bruit, « h » d'un rire : 0,1 à 0,6). Entre 0,6 et 0,75 :
    # souffle si elle est forte (à moins de 20 dB de la parole), sinon ni voisée ni souffle (voix craquée entre
    # deux impulsions)
    "nacf_souffle": 0.6,
    "craque_f0": 0.6, "craque_db": -15.0,  # voix craquée : sous 0,6 × la hauteur médiane, sous parole − 15 dB
    "fort_db": -20.0,  # trame « forte » : à moins de 20 dB de la parole (durée audible d'un souffle, trames non voisées)
    "regroupe_s": 0.15,  # bouffées voisées séparées de silences plus courts : regroupées (rire)
}

# Gravité des événements. Chiffres du corpus d'étalonnage (258 fichiers : voix aiguë 32 passages publiés,
# 11 prises retenues, 22 autres prises, 9 prises d'archive ; voix grave 12 passages publiés, 25 prises retenues,
# 138 autres prises, 9 d'archive), vérifiés à la revue du 5 octobre sur 323 fichiers (97 passages publiés de la
# voix aiguë).
SEUILS = {
    "voise_min_s": 0.04,  # zone voisée : 40 ms de trames voisées au moins
    # Rire : intervalles entre bouffées mesurés sur les rires de la voix grave 0,14/0,23 s (début de
    # retraites-intro-01) et 0,28 s (après « partir ? ») ; bornes 0,11-0,33 s (3 à 9 Hz)
    "rire_intervalles": (0.11, 0.33),
    "rire_net_db": -20.0,
    # Vocalise, parole en trop : voisé, séparé des mots par un silence. Rien de tel dans les prises retenues de
    # la voix aiguë ; net dès −15 dB sous la parole et 80 ms voisées (le plus faible repéré dans la voix grave :
    # −1,4 dB, 70 ms voisées) ; léger jusqu'à −25 dB
    "vocalise_net_db": -15.0, "vocalise_net_s": 0.08, "vocalise_leger_db": -25.0,
    # Respiration, bruit : net quand le souffle dure 100 ms au moins à moins de 20 dB de la parole (voix grave :
    # 100 à 210 ms, de −4,6 à +9 dB au-dessus de la parole, au début d'une phrase, à la virgule, après
    # « toucher ? » ; voix aiguë retenue : au plus 70 ms, un bref souffle après « répartition. ») ; léger dès
    # −30 dB et 50 ms (respirations douces aux virgules de la voix grave : −19 à −30 dB, 50 à 160 ms). Un
    # souffle de 0,22 s à −45 dBFS (parole − 25 dB) inséré dans un passage publié de la voix grave est léger
    # dans 12 cas sur 12 (6 sur 12 avant la correction du bruit de fond), net dès −40 dBFS dans 8 cas sur 12
    "souffle_net_fort_s": 0.10, "souffle_leger_db": -30.0, "souffle_leger_s": 0.05,
    "claquement_s": 0.03, "claquement_db": -15.0,
    # Relâchement de consonne, ignoré : aigu (énergie sous 2,5 kHz < 50 %), bref, juste après un mot (« t » de
    # « retraite » 90 à 180 ms après la fin alignée, 40 à 80 ms de souffle, −6 dB), ou collé à un mot et ≤ 150 ms
    # de souffle (« s », « f »)
    "relachement_s": 0.10, "relachement_ecart_s": 0.25, "relachement_colle_s": 0.15,
    # Prolongement voisé collé à un mot (voix craquée exclue) : voix aiguë publiée et retenue, au plus 0,26 s
    # (« paie, » montée de continuation ; avec la voix craquée, « privé, » allait à 0,40 s) ; voix grave et prises
    # écartées de la voix aiguë : 0,32 à 0,55 s (« la » crié, « Surtout » précédé d'un « euh », « comment ? »
    # prolongé)
    "prolongement_leger_s": 0.30, "prolongement_net_s": 0.35,
    # Mot étiré : durée (avec prolongements) rapportée à syllabes × durée moyenne d'une syllabe dans la prise.
    # Voix aiguë publiée et retenue : 3,08 au plus (allongement final : « France », « moyenne », « cinq »,
    # « plus », « paie ») ; voix grave publiée : 2,82 ; prises défectueuses : 3,3 à 4,9
    "etire_leger": 3.2, "etire_net": 3.8, "etire_exces_s": 0.25,
    "cri_db": 12.0,  # prolongement à +12 dB au-dessus de la parole : « la » crié à +18,9 dB (voix aiguë écartée)
    # Mot manquant : rapport le plus bas de la voix aiguë publiée 0,36 (« il y a » dit « y a ») ; 0,30
    "manquant": 0.30,
}

TYPES = ("rire", "vocalise", "parole en trop", "respiration", "bruit", "claquement", "mot étiré",
         "mot manquant ou bâclé")


def en_16k(a, sr):
    a = np.asarray(a, dtype=np.float64)
    if sr == SR_ALIGNE:
        return a
    g = np.gcd(int(sr), SR_ALIGNE)
    return resample_poly(a, SR_ALIGNE // g, int(sr) // g)


def texte_alignement(texte):
    """Le texte donné à l'aligneur : mots composés séparés (« moment-là » → « moment là »)"""
    return re.sub(r"(?<=\w)[-‐‑](?=\w)", " ", texte.replace("’", "'"))


class Aligneur:
    """Alignement forcé mot à mot (Qwen3-ForcedAligner), modèle chargé une fois, au premier appel"""

    def __init__(self):
        self.modele = None
        self.temps_chargement = None

    def charge(self):
        if self.modele is None:
            from mlx_audio.stt.utils import load_model

            t = time.time()
            self.modele = load_model(MODELE_ALIGNEMENT)
            self.temps_chargement = time.time() - t
        return self.modele

    def aligne(self, audio, sr, texte):
        """[(mot, début s, fin s)] ; les mots sont ceux de l'aligneur (ponctuation ôtée)"""
        m = self.charge()
        a16 = en_16k(audio, sr).astype(np.float32)
        r = m.generate(a16, texte_alignement(texte), language="French")
        return [(it.text, float(it.start_time), float(it.end_time)) for it in r]


def syllabes_mot(mot):
    """Syllabes dites d'un mot aligné : un sigle (« PIB », « DPE ») se dit lettre par lettre"""
    lettres = re.sub(r"[^A-Za-zÀ-ÿ]", "", mot)
    if len(lettres) >= 2 and lettres.isupper():
        return len(lettres)
    return max(1, syllabes(mot))


def caracteristiques(a, sr):
    """Trames de 10 ms (centrées sur k × 10 ms) : niveau (dB), part d'énergie sous 2,5 kHz, périodicité, hauteur"""
    a = np.asarray(a, dtype=np.float64)
    hop = int(sr * PAS_S)
    n = len(a) // hop
    win = int(sr * 0.025)
    nfft = 1 << int(np.ceil(np.log2(win)))
    pad = np.pad(a, (win // 2, win))
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    brut = pad[idx]
    niveau = 10 * np.log10(np.mean(brut * brut, axis=1) + 1e-14)
    spec = np.abs(np.fft.rfft(brut * np.hanning(win), nfft)) ** 2
    f = np.fft.rfftfreq(nfft, 1 / sr)
    bas = spec[:, (f >= 80) & (f < 2500)].sum(axis=1)
    haut = spec[:, (f >= 2500) & (f < 12000)].sum(axis=1)
    part_bas = bas / (bas + haut + 1e-20)
    # Périodicité : maximum de l'autocorrélation normalisée entre 60 et 500 Hz, à 16 kHz, fenêtre de 40 ms
    a16 = en_16k(a, sr)
    w = int(SR_ALIGNE * 0.04)
    lag_min, lag_max = int(SR_ALIGNE / 500), int(SR_ALIGNE / 60)
    h16 = int(SR_ALIGNE * PAS_S)
    span = w + lag_max
    p16 = np.pad(a16, (w // 2, span))
    idx = np.arange(span)[None, :] + h16 * np.arange(n)[:, None]
    x = p16[idx]
    nf = 1 << int(np.ceil(np.log2(span + w)))
    corr = np.fft.irfft(np.conj(np.fft.rfft(x[:, :w], nf)) * np.fft.rfft(x, nf), nf)[:, : lag_max + 1]
    sq = np.concatenate([np.zeros((n, 1)), np.cumsum(x * x, axis=1)], axis=1)
    lags = np.arange(lag_max + 1)
    et = sq[:, lags + w] - sq[:, lags]
    nacf = corr / np.sqrt(sq[:, w][:, None] * et + 1e-20)
    r = nacf[:, lag_min:]
    mx = r.max(axis=1)
    # Hauteur (Hz) : le plus petit décalage qui soit un maximum local à 90 % au moins du maximum (évite de
    # prendre le double de la période) ; 0 si la trame n'est pas périodique
    pic = np.zeros_like(r, dtype=bool)
    pic[:, 1:-1] = (r[:, 1:-1] >= r[:, :-2]) & (r[:, 1:-1] >= r[:, 2:])
    pic &= r >= 0.9 * mx[:, None]
    lag = lag_min + np.argmax(pic, axis=1)
    f0 = np.where(pic.any(axis=1) & (mx > 0.5), SR_ALIGNE / lag, 0.0)
    return {"niveau": niveau, "part_bas": part_bas, "nacf": mx, "f0": f0, "n": n}


def bouffees(niv, voise, plancher, creux_db=6.0, ecart_min=10):
    """Bouffées : maxima locaux du niveau (lissé sur 30 ms), voisés, au-dessus de plancher, séparés de leurs
    voisines par un creux d'au moins creux_db, à ecart_min trames (100 ms) au moins. Rend leurs indices."""
    if len(niv) < 5:
        return []
    lisse = np.convolve(niv, np.ones(3) / 3, mode="same")
    pics = []
    for i in range(1, len(lisse) - 1):
        if not (lisse[i] >= lisse[i - 1] and lisse[i] > lisse[i + 1] and lisse[i] >= plancher
                and voise[max(0, i - 2): i + 3].any()):
            continue
        if pics:
            j = pics[-1]
            if i - j < ecart_min or min(lisse[i], lisse[j]) - lisse[j: i + 1].min() < creux_db:
                if lisse[i] > lisse[j]:
                    pics[-1] = i
                continue
        pics.append(i)
    return pics


def _suites(masque):
    """Suites de True : liste de (début, fin incluse)"""
    out = []
    k, n = 0, len(masque)
    while k < n:
        if masque[k]:
            j = k
            while j + 1 < n and masque[j + 1]:
                j += 1
            out.append((k, j))
            k = j + 1
        else:
            k += 1
    return out


def analyse(audio, sr, mots, params=None):
    """Zones sonores hors des mots, avec leurs mesures, et mesures des mots. mots : [(mot, début, fin)] en s.
    Pas de verdict ici (voir juge())."""
    p = {**PARAMS, **(params or {})}
    c = caracteristiques(audio, sr)
    niv, nacf, pb, f0, n = c["niveau"], c["nacf"], c["part_bas"], c["f0"], c["n"]
    t = np.arange(n) * PAS_S
    dans = np.zeros(n, bool)
    pres = np.zeros(n, bool)
    for _, s, e in mots:
        dans[(t >= s - 1e-6) & (t < e - 1e-6)] = True
        pres[(t >= s - p["marge_avant"] - 1e-6) & (t < e + p["marge_apres"] - 1e-6)] = True
    if n == 0:
        return {"ref_db": 0.0, "bruit_db": 0.0, "d_syll": 0.0, "zones": [], "mots": [], "duree": 0.0}
    actifs_mots = dans & (niv > niv.max() - 40)
    ref = float(np.median(niv[actifs_mots])) if actifs_mots.any() else float(np.percentile(niv, 90))
    nz = niv[niv > -100]
    bruit = float(np.percentile(nz, 10)) if len(nz) else ref - 75
    # Borne haute parole − 45 dB (p["bruit_max_db"]) : le bruit de fond ne relève jamais le seuil d'activité
    # au-dessus de parole − 35 dB. Les prises et passages n'ont pas de bruit de fond (silence numérique, porte
    # de clean.py à −30 dB) ni de silence de tête : le 10e centile tombe dans la parole ou son déclin
    # (−20 à −40 dB sous la parole dans 60 % du corpus). Avec l'ancienne borne (parole − 20 dB), le seuil
    # d'activité montait à parole − 10 dB et un souffle à −45 dBFS dans un passage publié (parole − 23 dB)
    # n'était pas vu (retraites-intro-06, -07, -10 de la voix grave).
    bruit = min(max(bruit, ref - 75), ref + p["bruit_max_db"])
    actif = (niv > ref + p["actif_db"]) & (niv > bruit + p["sur_bruit_db"])
    voise = (nacf > p["nacf_voise"]) & (niv > ref + p["voise_db"])
    # Voix craquée (« vocal fry ») en fin de groupe : périodique mais très grave (sous 0,6 × la hauteur médiane
    # de la parole) et faible (sous parole − 15 dB). Naturelle, elle n'est ni un son voisé en trop ni un
    # prolongement de mot : voix aiguë, « privé, [0,40 s de voix craquée à 80-90 Hz, −22 à −35 dB] surtout »
    # (passage publié logement-existant-03), « hommes, [0,24 s à 80 Hz] onze » (retraites-age-10)
    voix_mots = dans & voise & (niv > ref - 10) & (f0 > 0)
    f0_parole = float(np.median(f0[voix_mots])) if voix_mots.sum() >= 5 else 0.0
    craque = voise & (f0 > 0) & (f0 < p["craque_f0"] * f0_parole) & (niv < ref + p["craque_db"])
    voise = voise & ~craque
    # Zones : suites de trames actives hors des mots, trous de 20 ms au plus (hors mots) comblés
    hors = actif & ~dans
    comble = hors.copy()
    for k0, k1 in _suites(~hors & ~dans):
        if k1 - k0 < 2 and k0 > 0 and k1 + 1 < n and hors[k0 - 1] and hors[k1 + 1]:
            comble[k0: k1 + 1] = True

    def zone(k0, k1):
        sl = slice(k0, k1 + 1)
        lv = niv[sl]
        t0, t1 = float(t[k0]), float(t[k1] + PAS_S)
        # Mots réduits à rien par l'aligneur à l'intérieur de la zone, mots avant et après
        dedans = [i for i, (_, s, e) in enumerate(mots) if s >= t0 - 1e-6 and e <= t1 + 1e-6]
        i_av = max((i for i, (_, s, e) in enumerate(mots) if e <= t0 + 1e-6 and i not in dedans), default=None)
        i_ap = min((i for i, (_, s, e) in enumerate(mots) if s >= t1 - 1e-6 and i not in dedans), default=None)
        e_av = round(t0 - mots[i_av][2], 2) if i_av is not None else None
        e_ap = round(mots[i_ap][1] - t1, 2) if i_ap is not None else None
        a0, a1 = max(0, k0 - 5), min(n, k1 + 6)
        pics = [a0 + i for i in bouffees(niv[a0:a1], voise[a0:a1], float(lv.max()) - 12) if k0 <= a0 + i <= k1]
        # Part voisée : mesurée sur le CŒUR de la zone (hors des mots et de leurs marges). Mesurée sur toute la
        # zone, elle prenait la fin d'un mot que l'alignement coupe trop tôt (voyelle à +2 dB juste après la fin
        # alignée) pour le son : « hommes, » suivi d'une voix craquée à −30 dB devenait une vocalise nette à
        # +1,9 dB (voix aiguë, retraites-age-10).
        coeur = hors[sl] & ~pres[sl]
        lc = lv[coeur] if coeur.any() else lv
        # Part apériodique (souffle) : sur toute la zone, car une respiration de 0,2 s entre deux mots tombe en
        # bonne partie dans leurs marges (voix grave, archive, « travailler. [souffle à −10 dB] Qui » : 40 ms
        # seulement hors des marges). Trames apériodiques (périodicité < nacf_souffle), ou à demi périodiques
        # (≤ nacf_voise) mais fortes (à moins de 20 dB de la parole : « hah » soufflé à +6 dB, périodicité 0,6 à
        # 0,75, voix grave, après « toucher ? ») ; une trame périodique faible (voix craquée entre deux
        # impulsions, queue de voyelle) n'est pas un souffle.
        souffle = hors[sl] & ((nacf[sl] < p["nacf_souffle"]) | (
            (nacf[sl] <= p["nacf_voise"]) & (lv > ref + p["fort_db"])))
        fort = souffle & (lv > ref + p["voise_db"])
        souffle_prol = souffle & ~((nacf[sl] >= 0.5) & (lv >= ref - 10))
        return {
            "debut": round(t0, 2), "fin": round(t1, 2), "duree": round(t1 - t0, 2),
            "coeur_s": round(float(coeur.sum()) * PAS_S, 2),
            "pic_db": round(float(lc.max() - ref), 1), "sur_bruit_db": round(float(lc.max() - bruit), 1),
            # pic de toute la zone (prolongement d'un mot, voir juge())
            "pic_zone_db": round(float(lv.max() - ref), 1),
            # durée audible du souffle : trames fortes apériodiques
            "forte_s": round(float((souffle & (lv > ref + p["fort_db"])).sum()) * PAS_S, 2),
            "souffle_s": round(float(souffle.sum()) * PAS_S, 2),
            "souffle_db": round(float(lv[souffle].max() - ref), 1) if souffle.any() else None,
            "souffle_sur_bruit_db": round(float(lv[souffle].max() - bruit), 1) if souffle.any() else None,
            # Les mêmes sans les trames fortes à demi périodiques (≥ 0,5, à moins de 10 dB de la parole) : dans le
            # prolongement d'un mot, c'est la voyelle dont la hauteur bouge vite, pas un souffle (voix aiguë,
            # « paie, » prolongé à +6 dB, périodicité 0,61-0,74 au changement de hauteur)
            "forte_prol_s": round(float((souffle_prol & (lv > ref + p["fort_db"])).sum()) * PAS_S, 2),
            "souffle_prol_s": round(float(souffle_prol.sum()) * PAS_S, 2),
            "souffle_prol_db": round(float(lv[souffle_prol].max() - ref), 1) if souffle_prol.any() else None,
            "voise_s": round(float((voise[sl] & coeur).sum()) * PAS_S, 2),
            "voise_zone_s": round(float(voise[sl].sum()) * PAS_S, 2),
            "part_bas": round(float(np.median(pb[sl][fort])) if fort.any() else (
                float(np.median(pb[sl][souffle])) if souffle.any() else float(np.median(pb[sl]))), 2),
            "bouffees": len(pics), "intervalles": [round((b - a) * PAS_S, 2) for a, b in zip(pics, pics[1:])],
            "dedans": dedans, "i_avant": i_av, "i_apres": i_ap, "ecart_avant": e_av, "ecart_apres": e_ap,
            "colle_avant": e_av is not None and e_av <= 0.015, "colle_apres": e_ap is not None and e_ap <= 0.015,
            "position": "debut" if i_av is None and not dedans else ("fin" if i_ap is None and not dedans else "entre"),
            "k": (k0, k1),
        }

    zones = [zone(k0, k1) for k0, k1 in _suites(comble)]
    # Rire « ha . ha . ha » : des bouffées voisées séparées de silences forment plusieurs zones. Des zones
    # voisées voisines (silences de 150 ms au plus, sans mot entre elles), hors des marges, sont regroupées ;
    # le groupe remplace ses zones s'il a l'allure d'un rire (voir juge())
    groupes, g = [], []
    for z in zones:
        ok = z["voise_zone_s"] >= 0.03 and z["coeur_s"] >= 0.03
        if ok and g and z["k"][0] - g[-1]["k"][1] - 1 <= p["regroupe_s"] / PAS_S and not dans[g[-1]["k"][1]: z["k"][0]].any():
            g.append(z)
            continue
        if len(g) >= 2:
            groupes.append(g)
        g = [z] if ok else []
    if len(g) >= 2:
        groupes.append(g)
    for g in groupes:
        gz = zone(g[0]["k"][0], g[-1]["k"][1])
        if gz["bouffees"] >= 2:
            gz["groupe"] = len(g)
            i = zones.index(g[0])
            zones[i: i + len(g)] = [gz]
    syll = [syllabes_mot(m) for m, _, _ in mots]
    d_syll = sum(e - s for _, s, e in mots) / max(1, sum(syll))
    return {"ref_db": round(ref, 1), "bruit_db": round(bruit, 1), "d_syll": round(d_syll, 3), "zones": zones,
            "mots": [{"mot": m, "debut": s, "fin": e, "duree": round(e - s, 3), "syllabes": sy}
                     for (m, s, e), sy in zip(mots, syll)],
            "duree": round(len(audio) / sr, 2)}


def _confiance(marge_db, duree_s=0.0, base=0.3):
    """Confiance (0,2 à 0,95) : d'autant plus haute que l'événement dépasse le seuil léger (dB) et dure"""
    return round(float(np.clip(base + 0.015 * marge_db + duree_s, 0.2, 0.95)), 2)


def juge(r, seuils=None):
    """Événements à partir d'analyse() : liste de dicts (début, fin, type, gravité « net » ou « leger »,
    niveau_db au-dessus du bruit de fond, pic_parole_db par rapport à la parole, confiance, mots voisins)"""
    S = {**SEUILS, **(seuils or {})}
    m = r["mots"]
    ds = r["d_syll"]
    evs = []
    prolongements = {}  # indice de mot → zones qui le prolongent

    def nom(i):
        return m[i]["mot"] if i is not None and 0 <= i < len(m) else None

    lo, hi = S["rire_intervalles"]
    rang = {None: 0, "leger": 1, "net": 2}
    for z in r["zones"]:
        if z["coeur_s"] < 0.03:
            continue  # toute dans les marges : fin de consonne, imprécision de l'alignement
        rire = z["bouffees"] >= 2 and all(lo <= x <= hi for x in z["intervalles"])
        voisee = z["voise_s"] >= S["voise_min_s"]
        colle = z["colle_avant"] or z["colle_apres"]
        cote = z["i_avant"] if z["colle_avant"] else z["i_apres"]
        prolonge = False
        if not rire:
            # Mot que l'aligneur a réduit à rien dans la zone, ou mot réduit à rien collé à la zone : la zone,
            # c'est (au moins en partie) ce mot
            nul = [i for i in z["dedans"]] + [i for i in (z["i_avant"] if z["colle_avant"] else None,
                                                          z["i_apres"] if z["colle_apres"] else None)
                                              if i is not None and m[i]["duree"] < 0.04]
            if nul:
                prolongements.setdefault(nul[0], []).append(z)
                prolonge = True
            # Voisée (sur toute la zone) et collée à un mot : le mot dure plus longtemps que l'alignement ne le voit
            elif colle and z["voise_zone_s"] >= S["voise_min_s"] and z["voise_zone_s"] >= 0.5 * z["duree"]:
                prolongements.setdefault(cote, []).append(z)
                prolonge = True
        ev = {"debut": z["debut"], "fin": z["fin"], "niveau_db": z["sur_bruit_db"], "pic_parole_db": z["pic_db"],
              "mot_avant": nom(z["i_avant"]), "mot_apres": nom(z["i_apres"])}
        # Deux jugements, le plus grave l'emporte (à gravité égale, le son voisé) : la part voisée du cœur (rire,
        # vocalise, parole en trop ; pas pour un prolongement de mot, jugé avec le mot) et sa part apériodique
        # (respiration, bruit). Une zone qui commence par un « hah » soufflé à +9 dB et finit voisée sur 40 ms
        # n'était jugée que comme son voisé, trop court pour être net (voix grave, retraites-intro-09, « Combien »)
        cands = []
        if rire:
            grav = "net" if z["pic_db"] >= S["rire_net_db"] else "leger"
            cands.append(("rire", grav, _confiance(z["pic_db"] - S["rire_net_db"], z["voise_s"],
                                                   0.5 + 0.1 * (z["bouffees"] - 2))))
        elif voisee and not prolonge:
            grav = None
            if z["pic_db"] >= S["vocalise_net_db"] and z["voise_s"] >= S["vocalise_net_s"]:
                grav = "net"
            elif z["pic_db"] >= S["vocalise_leger_db"]:
                grav = "leger"
            cands.append(("parole en trop" if z["position"] != "entre" else "vocalise", grav,
                          _confiance(z["pic_db"] - S["vocalise_leger_db"], z["voise_s"])))
        if z["duree"] <= S["claquement_s"]:
            # Très bref : claquement s'il n'est pas voisé ; un bref voisement est un bout de mot mal aligné
            if z["pic_db"] >= S["claquement_db"] and z["voise_s"] < 0.02:
                cands.append(("claquement", "leger", _confiance(z["pic_db"] - S["claquement_db"], 0.0, 0.3)))
        else:
            sf = "_prol" if prolonge else ""
            forte, s_s, s_db = z["forte" + sf + "_s"], z["souffle" + sf + "_s"], z["souffle" + sf + "_db"]
            # Relâchement de consonne (« t », « s », « f » finals), ignoré : apériodique et aigu (énergie sous
            # 2,5 kHz < 50 %), collé au mot et 150 ms au plus de souffle (collé, on compte la part apériodique
            # seule : « neuf, » = voyelle, « f » de 110 ms, puis voix craquée, voix aiguë, retraites-age-05), ou
            # 100 ms au plus à 250 ms au plus de la fin d'un mot (« t » final de « retraite ? » après 50 à 70 ms
            # d'occlusion : 60 à 80 ms, jusqu'à 180 ms après la fin alignée, voix aiguë)
            relache = z["part_bas"] < 0.5 and ((colle and s_s <= S["relachement_colle_s"]) or (
                s_s <= S["relachement_s"] and z["ecart_avant"] is not None
                and z["ecart_avant"] <= S["relachement_ecart_s"]))
            if s_s >= 0.03 and not relache:
                grav = None
                if forte >= S["souffle_net_fort_s"]:
                    grav = "net"
                elif s_db >= S["souffle_leger_db"] and s_s >= S["souffle_leger_s"]:
                    grav = "leger"
                cands.append(("respiration" if z["part_bas"] >= 0.5 else "bruit", grav,
                              _confiance(s_db - S["souffle_leger_db"], forte)))
        cands = [c for c in cands if c[1]]
        if cands:
            typ, grav, conf = max(cands, key=lambda c: rang[c[1]])
            if typ in ("respiration", "bruit") and z["souffle_db"] is not None:
                # niveaux du souffle lui-même (mesuré sur toute la zone), pas du cœur
                ev["pic_parole_db"], ev["niveau_db"] = z["souffle_db"], z["souffle_sur_bruit_db"]
            evs.append({**ev, "type": typ, "gravite": grav, "confiance": conf})
    # Mots étirés (avec leurs prolongements), parole en trop au bord, vocalise criée, mots manquants
    for i, w in enumerate(m):
        zs = prolongements.get(i, [])
        e = sum(z["duree"] for z in zs)
        tot = w["duree"] + e
        attendu = w["syllabes"] * ds
        rapport = tot / attendu if attendu > 0 else 0.0
        exces = tot - attendu
        pic = max((z["pic_zone_db"] for z in zs), default=None)
        grav = typ = None
        if pic is not None and pic >= S["cri_db"]:
            grav, typ = "net", "vocalise"
        elif (rapport >= S["etire_net"] and exces >= S["etire_exces_s"]) or e >= S["prolongement_net_s"]:
            grav, typ = "net", "mot étiré"
        elif (rapport >= S["etire_leger"] and exces >= S["etire_exces_s"]) or e >= S["prolongement_leger_s"]:
            grav, typ = "leger", "mot étiré"
        if grav:
            if typ == "mot étiré" and e >= S["prolongement_leger_s"] and (i == 0 or i == len(m) - 1):
                typ = "parole en trop"
            evs.append({"debut": round(min([w["debut"]] + [z["debut"] for z in zs]), 2),
                        "fin": round(max([w["fin"]] + [z["fin"] for z in zs]), 2), "type": typ, "gravite": grav,
                        "niveau_db": max((z["sur_bruit_db"] for z in zs), default=None), "pic_parole_db": pic,
                        "mot_avant": nom(i - 1) if i > 0 else None, "mot_apres": nom(i + 1), "mot": w["mot"],
                        "rapport": round(rapport, 2), "prolongement_s": round(e, 2),
                        "confiance": round(float(np.clip(0.4 + 0.3 * (rapport - S["etire_leger"]) + e, 0.3, 0.9)), 2)})
        if w["duree"] < 0.04 and 0 < i < len(m) - 1 and ds > 0:
            span = m[i + 1]["fin"] - m[i - 1]["debut"]
            q = span / ((m[i - 1]["syllabes"] + w["syllabes"] + m[i + 1]["syllabes"]) * ds)
            if q < S["manquant"]:
                evs.append({"debut": round(m[i - 1]["debut"], 2), "fin": round(m[i + 1]["fin"], 2),
                            "type": "mot manquant ou bâclé", "gravite": "leger", "niveau_db": None,
                            "pic_parole_db": None, "mot": w["mot"], "mot_avant": nom(i - 1), "mot_apres": nom(i + 1),
                            "rapport": round(q, 2), "confiance": 0.3})
    # Mots autour (trois de chaque côté), pour retrouver le son à l'écoute
    for ev in evs:
        av = [w["mot"] for w in m if w["fin"] <= ev["debut"] + 0.05 and w.get("mot") != ev.get("mot")][-3:]
        ap = [w["mot"] for w in m if w["debut"] >= ev["fin"] - 0.05 and w.get("mot") != ev.get("mot")][:3]
        ev["contexte"] = (" ".join(av) or "(début)") + " [·] " + (" ".join(ap) or "(fin)")
    evs.sort(key=lambda x: x["debut"])
    return evs


def detecte(audio, sr, texte, aligneur, params=None, seuils=None):
    """Détection complète sur un audio (prise nettoyée ou passage) et son texte dit. Rend un dict : verdict
    (« refus », « penalite », « ok », ou « inconnu » si l'alignement a échoué), n_net, n_leger, événements,
    mots alignés, niveaux de référence, temps de calcul. Ne lève pas d'exception."""
    t = time.time()
    try:
        mots = aligneur.aligne(audio, sr, texte)
    except Exception as e:  # un échec de l'aligneur ne doit pas arrêter une génération
        return {"verdict": "inconnu", "erreur": repr(e), "n_net": 0, "n_leger": 0, "evenements": [], "mots": [],
                "temps_s": round(time.time() - t, 3)}
    t_al = time.time() - t
    r = analyse(audio, sr, mots, params)
    evs = juge(r, seuils)
    n_net = sum(e["gravite"] == "net" for e in evs)
    n_leger = sum(e["gravite"] == "leger" for e in evs)
    return {"verdict": "refus" if n_net else ("penalite" if n_leger else "ok"), "n_net": n_net, "n_leger": n_leger,
            "evenements": evs, "mots": [(w, round(s, 3), round(e, 3)) for w, s, e in mots],
            "ref_db": r["ref_db"], "bruit_db": r["bruit_db"],
            "temps_alignement_s": round(t_al, 3), "temps_s": round(time.time() - t, 3)}


def decrit(ev):
    """Un événement en une ligne : « rire 0,00-0,43 s (net, +42 dB, confiance 0,95) [début | Un] »"""
    niv = f", {ev['niveau_db']:+.0f} dB" if ev.get("niveau_db") is not None else ""
    mot = f" « {ev['mot']} »" if ev.get("mot") and ev["type"] in ("mot étiré", "mot manquant ou bâclé", "vocalise",
                                                               "parole en trop") else ""
    return (f"{ev['type']}{mot} {ev['debut']:.2f}-{ev['fin']:.2f} s ({ev['gravite']}{niv}, confiance "
            f"{ev['confiance']:.2f}) [{ev.get('mot_avant') or 'début'} | {ev.get('mot_apres') or 'fin'}]")


def lit_audio(chemin, sr=48000):
    """WAV ou .m4a (décodé par afconvert en LEF32 mono 48 kHz), en float32 mono à sr"""
    chemin = Path(chemin)
    with tempfile.TemporaryDirectory(prefix="isoloir-artefacts-") as tmp:
        if chemin.suffix.lower() != ".wav":
            dec = Path(tmp) / "dec.wav"
            subprocess.run(["afconvert", "-f", "WAVE", "-d", f"LEF32@{sr}", "-c", "1", str(chemin), str(dec)],
                           check=True, capture_output=True)
            chemin = dec
        fs, a = wavfile.read(str(chemin))
    entier = np.issubdtype(a.dtype, np.integer)
    a = a.astype(np.float32)
    if entier:
        a = a / 32768.0
    if a.ndim > 1:
        a = a.mean(axis=1)
    if fs != sr:
        g = np.gcd(int(fs), sr)
        a = resample_poly(a, sr // g, int(fs) // g).astype(np.float32)
    return a


def scanne(entrees, aligneur, journal=print, sr=48000):
    """Passe des passages publiés au détecteur. entrees : [{voix, video, passage, fichier, texte}]. Rend la même
    liste complétée (verdict, événements, durée). Lecture seule."""
    out = []
    for x in entrees:
        try:
            a = lit_audio(x["fichier"], sr)
        except Exception as e:
            journal(f"  {x['voix']}/{x['passage']} : lecture impossible ({e!r})")
            out.append({**x, "verdict": "inconnu", "erreur": repr(e), "evenements": [], "n_net": 0, "n_leger": 0})
            continue
        d = detecte(a, sr, x["texte"], aligneur)
        d.pop("mots", None)
        res = {**x, "fichier": str(x["fichier"]), "duree_s": round(len(a) / sr, 2), **d}
        out.append(res)
        signe = {"refus": "À REFAIRE", "penalite": "léger", "ok": "ok", "inconnu": "?"}[d["verdict"]]
        journal(f"  {x['voix']}/{x['passage']} : {signe}" + "".join(f"\n      {decrit(e)}" for e in d["evenements"])
                + (f" ({d['erreur']})" if d.get("erreur") else ""))
    return out


def ecoute(resultats, sortie, contexte=1.5, silence=0.8, sr=48000, voix=None):
    """Compilation d'écoute : chaque événement, avec contexte s avant et après, séparés par silence s, dans
    l'ordre des passages ; AAC 128 kb/s (afconvert -f m4af -d aac -b 128000). Écrit aussi sortie.txt (même
    ordre : passage, instant, type, mots voisins). Rend le nombre d'extraits."""
    sortie = Path(sortie)
    morceaux, lignes, sans = [], [], []
    pos = 0.0
    for r in resultats:
        if voix and r["voix"] != voix:
            continue
        if not r.get("evenements"):
            sans.append(f"{r['voix']}/{r['passage']}")
            continue
        a = lit_audio(r["fichier"], sr)
        for ev in r["evenements"]:
            d0 = max(0.0, ev["debut"] - contexte)
            d1 = min(len(a) / sr, ev["fin"] + contexte)
            if morceaux:
                morceaux.append(np.zeros(int(round(silence * sr)), dtype=np.float32))
                pos += silence
            morceaux.append(a[int(d0 * sr): int(d1 * sr)])
            lignes.append(f"{len(lignes) + 1:2d}. extrait à {pos:.1f} s, son à {pos + ev['debut'] - d0:.1f} s — "
                          f"{r['voix']}/{r['passage']} à {ev['debut']:.2f}-{ev['fin']:.2f} s : {ev['type']}"
                          + (f" « {ev['mot']} »" if ev.get("mot") else "")
                          + f" ({'défaut net' if ev['gravite'] == 'net' else 'léger'}, confiance {ev['confiance']:.2f})"
                          f"\n      « {ev.get('contexte', '')} »")
            pos += d1 - d0
    if not morceaux:
        return 0
    sortie.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="isoloir-ecoute-") as tmp:
        wav = Path(tmp) / "ecoute.wav"
        wavfile.write(str(wav), sr, np.concatenate(morceaux).astype(np.float32))
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", str(wav), str(sortie)], check=True,
                       capture_output=True)
    entete = (f"Compilation d'écoute des sons repérés : {sortie.name} ({len(lignes)} extrait(s), {pos:.1f} s ; {contexte:.1f} s "
              f"de contexte avant et après chaque son, {silence:.1f} s de silence entre deux extraits ; dans l'ordre des "
              "passages).\nPour chaque extrait : où il commence dans la compilation, où le son commence, le passage et "
              "l'instant dans le passage, le type, et les mots autour ([·] marque la place du son).\n\n")
    pied = ("\n\nPassages contrôlés sans aucun son repéré : " + (", ".join(sans) if sans else "aucun") + "\n")
    sortie.with_suffix(".txt").write_text(entete + "\n".join(lignes) + pied, encoding="utf-8")
    return len(lignes)


def main():
    import argparse

    ap = argparse.ArgumentParser(description="Détecteur de sons parasites (rires, respirations, bruits, mots étirés)")
    ap.add_argument("fichier", nargs="?", help="un audio (WAV ou m4a)")
    ap.add_argument("texte", nargs="?", help="le texte qu'il doit dire (forme orale)")
    ap.add_argument("--voice", choices=["aigue"], help="passages publiés de la voix (lecture seule)")
    ap.add_argument("--segment", action="append", default=[], help="passage(s) publiés seulement")
    ap.add_argument("--ecoute", help="compilation d'écoute des événements repérés (.m4a, et .txt à côté)")
    args = ap.parse_args()
    al = Aligneur()
    if args.fichier:
        if not args.texte:
            ap.error("il faut le texte dit")
        a = lit_audio(args.fichier)
        d = detecte(a, 48000, args.texte, al)
        print(f"{args.fichier} : {d['verdict']} ({d['n_net']} net, {d['n_leger']} léger), alignement "
              f"{d.get('temps_alignement_s')} s, total {d['temps_s']} s")
        print("  " + " ".join(f"{w}[{s:.2f}-{e:.2f}]" for w, s, e in d["mots"]))
        for e in d["evenements"]:
            print("  " + decrit(e))
        return
    if not args.voice:
        ap.error("un fichier et son texte, ou --voice")
    from generate import entrees_publiees, exporte_series  # lecture seule

    segs = {x.strip() for o in args.segment for x in o.split(",") if x.strip()}
    entrees = entrees_publiees(exporte_series(), [args.voice], segs)
    res = scanne(entrees, al)
    print(f"{sum(r['verdict'] == 'refus' for r in res)} passage(s) à refaire sur {len(res)}")
    if args.ecoute:
        n = ecoute(res, args.ecoute)
        print(f"→ {args.ecoute} : {n} extrait(s)")


if __name__ == "__main__":
    main()
