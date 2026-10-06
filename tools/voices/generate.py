#!/usr/bin/env python3
# Génération des voix des vidéos « Les sujets », hors ligne, sur l'ordinateur du propriétaire.
#
# Synthèse VoxCPM2 (mlx-audio, modèle mlx-community/VoxCPM2-8bit déjà dans le cache Hugging Face : rien
# n'est téléchargé, le cache est lu hors connexion). Une seule voix de synthèse, aucune personne réelle :
#   aigue : voix aiguë « v3.1a », référence refs/aigue.wav
# La voix grave « v5b » est retirée (décision du propriétaire, 5 octobre 2026) : sa référence, ses fichiers
# publiés, son état et sa description sont archivés dans report/archives/voix-grave/ (non suivi par git).
#
# Mode « clone » seulement : la voix de référence (ref_audio) et le texte, rien d'autre (16 pas de diffusion,
# guidage 2,0). Le mode « continuation » (amorce = passage précédent) est abandonné : accent anglais et voix
# robotique à l'écoute.
#
# Pour chaque voix, chaque vidéo, chaque passage :
# 1. Texte à dire : « spoken » s'il existe, sinon « say » mis en forme pour la voix (texte.py).
# 2. Découpage en phrases (phrases.py) : chaque phrase est générée SEULE, avec sa ponctuation finale. Générée
#    d'un bloc, une affirmation suivie d'une question prenait parfois l'intonation de la question.
# 3. Pour chaque phrase, des prises (3 par défaut), graines différentes et
#    reproductibles, puis des prises de secours (4 au plus) tant qu'aucune n'est acceptable. Une prise est
#    nettoyée (clean.py) puis mesurée : hauteur F0 (pitch.py), débit en syllabes par seconde articulée,
#    contour de la fin, plus longue pause. Elle est ACCEPTABLE si :
#    - sa médiane de F0 est à 1,5 demi-ton au plus de la CIBLE de la voix, fixe pour toutes les vidéos de
#      toutes les séries : la médiane des passages validés à l'écoute (voir VOIX ; sans cible inscrite, la
#      médiane de F0 de la partie lue de la référence, après « Bonjour ! ») ;
#    - le saut à l'enchaînement (fin de la phrase précédente → début de la prise, médianes du dernier et du
#      premier tiers des trames voisées) est de 3 demi-tons au plus, au-delà d'une tolérance de reprise vers
#      le haut : après une fin qui descend, la phrase suivante repart d'autant plus haut ; une question
#      commence haut (+3 dt) ; tolérance plafonnée à 6 dt. Après une question, on compare à sa médiane et non
#      à sa fin montante ;
#    - pour une phrase affirmative (« . », « ! » ou sans ponctuation), la fin ne MONTE pas : les ~150
#      dernières ms voisées à +1,5 demi-ton au plus des ~350 ms qui les précèdent (pas de contrainte pour une
#      question) ;
#    - sa dispersion de F0 est raisonnable, son débit n'est pas plus de 1,6 fois celui de la référence (mot
#      sauté, débit précipité) ni moins de 0,7 fois, la voix est réellement voisée (pas soufflée ni
#      craquée), sa durée est proche de celle des autres prises, aucune pause de plus de 1,1 s, et la
#      génération s'est arrêtée d'elle-même.
#    Parmi les prises acceptables : la plus proche de la cible, pénalisée au-delà de 2 demi-tons de saut et
#    pour une dispersion forte ; à score égal, une fin franchement descendante l'emporte. Sinon, la meilleure
#    est gardée avec une ALERTE au rapport.
#    Chaque prise passe aussi par le détecteur de sons parasites (artefacts.py : alignement forcé mot à mot,
#    puis rires, respirations, bruits, vocalises hors des mots, mots étirés, manquants ou en trop) : un défaut
#    net la rend inacceptable (comme les autres défauts : prises de secours, puis alerte), un défaut léger
#    pénalise son score.
# 4. Assemblage du passage : phrases au même niveau, pause de 0,30 s après « . » ou « ! », 0,35 s après « ? »
#    (phrases.py), puis nettoyage et mise au niveau commun (même niveau de parole active pour tous les
#    passages, limiteur de crête) du passage assemblé ; mono 48 kHz, AAC dans un .m4a (afconvert), écrit dans
#    public/videos/audio/<voix>/<vidéo>/<passage>.m4a.
# 5. Inventaire src/ui/videos/audio-files.json mis à jour après chaque passage (un arrêt ne perd que le
#    passage en cours) ; mesures et alertes dans tools/voices/report/.
#
# Reprise : un passage dont le fichier existe, inscrit à l'inventaire avec l'empreinte de son texte actuel,
# et produit par ce générateur avec le même texte (etat.json), n'est pas régénéré. --force pour tout refaire,
# --purge pour effacer fichiers, inscriptions et état d'une sélection.
#
# Périmés : en début d'exécution, toute inscription de l'inventaire (toutes les vidéos, pas seulement la
# sélection) dont le texte de series.ts, le texte à dire de texte.py ou le mode ne sont plus ceux de
# l'enregistrement est retirée (perimes()) : le lecteur ne vérifie que l'empreinte de series.ts et jouerait
# sinon une prononciation corrigée depuis. Avec --dry-run, elles sont seulement signalées.
#
# Contrôle des passages publiés : --scan les passe au détecteur sans rien générer et inscrit ceux qui ont un
# défaut net dans report/a-refaire.json ; --redo-flagged régénère ces passages-là, et eux seuls.
#
# Usage : ~/isoloir-tts/bin/python tools/voices/generate.py [--only retraites-intro|retraites] [--voice aigue]
#         [--segment retraites-intro-04] [--takes 3] [--limit 2] [--keep-takes] [--dry-run]
#         [--scan [--listen sortie.m4a]] [--redo-flagged]   (voir README.md)
# Plusieurs agents peuvent écrire des séries en même temps : tools/voices/file-attente.py lance ce générateur
# thème par thème, à mesure que les séries sont prêtes (tools/voices/queue/<thème>.ready).
import os

# Hors connexion : le modèle est lu dans le cache, aucune requête vers Hugging Face
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
import time
import warnings
from datetime import datetime
from pathlib import Path

import numpy as np
from scipy.io import wavfile

# afconvert ajoute au WAV un bloc de remplissage (FLLR) que scipy signale sans raison
warnings.filterwarnings("ignore", message="Chunk .* not understood")

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
sys.path.insert(0, str(ICI))

from artefacts import Aligneur, decrit, detecte, ecoute, scanne  # noqa: E402
from clean import (NIVEAU_DB, PLAFOND_DB, assemble, au_niveau, clean, duree_articulee, duree_parole,  # noqa: E402
                   normalise, pauses, plancher_bruit_db, plus_long_silence)
from phrases import decoupe, est_question, pause_apres  # noqa: E402
from pitch import accord, demi_tons, mesure  # noqa: E402
from texte import a_dire, mots, syllabes  # noqa: E402

MODELE = "mlx-community/VoxCPM2-8bit"
SR = 48000
# Échantillons par motif généré (patch_size 4 × decode_chunk_size 1920 à 48 kHz) : 0,16 s
ECH_PAR_MOTIF = 7680

# Texte dit dans la référence (créée par description avec VoxCPM2, voir README.md). La partie lue (après
# « Bonjour ! ») sert de mesure de la voix : la salutation, exclamative, monte de 4 à 10 demi-tons.
REF_TEXTE = (
    "Bonjour ! Aujourd'hui, on prend deux minutes pour comprendre un sujet qui nous concerne tous, "
    "simplement, chiffres à l'appui."
)
REF_LU = REF_TEXTE.split("! ", 1)[1]
# La voix, par identifiant (ASCII : dossiers, inventaire, état, options). « libelle » : le nom dit dans le
# journal et les rapports. Une seule voix depuis le 5 octobre 2026 : la voix grave (« v5b ») est retirée, sa
# référence et sa description archivées dans report/archives/voix-grave/ ; la table garde sa forme (une entrée
# par voix) pour l'inventaire, l'état et tests/voices.test.ts.
VOIX = {
    "aigue": {
        "libelle": "aiguë",
        "nom": "v3.1a",
        "ref": ICI / "refs" / "aigue.wav",
        # Départ des graines de la voix : l'état FNV-1a de son identifiant d'origine suivi de « / », figé pour
        # que les graines (inscrites à etat.json) restent celles des prises déjà générées : une prise se refait
        # à l'identique malgré le renommage de la voix
        "graines": 0x6709EC6B,
        "prises": 3,
        # Cible de hauteur : la voix aiguë a été VALIDÉE à l'écoute telle que générée en mode clone (essai
        # du 4 octobre, retraites-intro-01 à 03 : 243,8, 241,7 et 253,5 Hz) ; on vise la médiane de ces trois
        # passages. La partie lue de sa référence (267,5 Hz) est 1,6 dt plus haut : le clone parle plus bas que
        # la référence (médiane de 9 prises : 242 Hz), viser 267,5 Hz changerait la voix validée.
        "cible_f0": 243.8,
        # Voix aiguë (v3.1a) : la description qui a créé sa référence avec VoxCPM2. Consigne au modèle, en
        # anglais, gardée telle quelle (jamais affichée)
        "description": (
            "A French woman in her early thirties, bright and expressive voice with confidence and authority, "
            "energetic but composed, assured and precise diction, warm smiling tone, credible and knowledgeable, "
            "like a respected science communicator explaining a topic on social media, standard French accent, "
            "not childish"
        ),
    },
}

INVENTAIRE = RACINE / "src" / "ui" / "videos" / "audio-files.json"
PUBLIC = RACINE / "public"
RAPPORTS = ICI / "report"
# État de la génération : pour chaque voix et passage, le texte dit, son empreinte, les prises retenues et
# leurs mesures. Un fichier sans état (écrit par un autre outil, fichier d'essai) est toujours régénéré.
ETAT = ICI / "etat.json"

# Acceptation d'une prise (voir l'en-tête et README.md pour l'étalonnage de chaque seuil)
ECART_CIBLE_DT = 1.5  # |médiane F0 − cible|
SAUT_DT = 3.0  # saut à l'enchaînement
SAUT_PENALITE_DES_DT = 2.0  # le score pénalise le saut au-delà
FIN_MONTANTE_DT = 1.5  # phrase affirmative : la fin ne monte pas de plus
FIN_DESCENDANTE_DT = -1.5  # « franchement descendante » : petit avantage à score égal
DEBIT_MAX = 1.6  # × débit articulé de la référence : plus rapide, mot sauté ou débit précipité
DEBIT_MIN = 0.7  # plus lent : bégaiement, voyelles étirées
PAUSE_MAX = 1.1  # secondes de silence à l'intérieur d'une phrase
ECART_PRISES = (0.75, 1.40)  # durée articulée d'une prise rapportée à la médiane des prises de la phrase
# Voisement : trames voisées fiables par seconde articulée. Une prise soufflée ou craquée en a peu, et sa
# médiane de F0 ne repose que sur une poignée de trames (essai : une prise de la voix grave à 13 trames/s, pour 42
# en médiane chez les autres prises de la même phrase et 44 dans la référence). Le voisement dépend du texte
# (« C'est la répartition. » : 24 trames/s en médiane, consonnes sourdes) : on compare donc d'abord aux autres
# prises de la même phrase, avec un plancher absolu rapporté à la référence.
VOISEMENT_MIN_PRISES = 0.5  # × la médiane des prises de la phrase
VOISEMENT_MIN_REF = 0.3  # × la référence
# Saut à l'enchaînement : après une fin qui descend (affirmation), la phrase suivante repart naturellement
# vers le haut d'autant (« reset » de la ligne mélodique). On tolère donc, vers le haut, la descente finale
# de la phrase précédente, plus 3 demi-tons pour une question (elle commence haut), le tout plafonné à
# 6 demi-tons. Vers le bas, aucune tolérance. Sans cela, sur l'essai de la voix grave, presque toutes les prises
# dans la cible étaient refusées : fin de phrase à −3,5/−6,6 dt (la référence grave finit à −6,6 dt),
# début de la suivante +5 à +6 dt plus haut.
TOLERANCE_REPRISE_MAX_DT = 6.0
ACCORD_MIN = 0.85  # part des trames où YIN et la seconde méthode (SHS) s'accordent, sous laquelle on alerte
PRISES_SECOURS = 4
# Sons parasites (artefacts.py) : un défaut net rend la prise inacceptable ; chaque défaut léger ajoute
# PENALITE_ARTEFACT au score (unité du score : le demi-ton d'écart à la cible ; un défaut léger, une respiration
# douce à une virgule par exemple, pèse comme un demi-ton d'écart), au plus PENALITE_ARTEFACT_MAX
PENALITE_ARTEFACT = 0.5
PENALITE_ARTEFACT_MAX = 1.5
# Quand aucune prise n'est sans défaut (secours épuisés), la moins mauvaise est gardée avec une alerte : entre
# deux prises écartées (+100 chacune), celle qui a un son parasite net passe après l'autre (+5 par son net), car
# c'est ce qui s'entend (« rires, respirations chelou »). Une prise seulement hors critères de hauteur, de saut
# ou de fin (+10) passe toujours avant une prise qui a un son parasite net.
PENALITE_SON_NET = 5.0
# Passages publiés marqués à refaire par --scan (défaut net), régénérés par --redo-flagged
A_REFAIRE = RAPPORTS / "a-refaire.json"


def journal(msg, fichier=None):
    print(msg, flush=True)
    if fichier:
        with open(fichier, "a", encoding="utf-8") as f:
            f.write(msg + "\n")


def fnv(texte, h=0x811C9DC5):
    """Empreinte FNV-1a 32 bits de l'UTF-8, comme textPrint() de src/ui/videos/audio.ts ; h : l'état de départ
    (par défaut celui de FNV-1a, sinon l'état laissé par un préfixe déjà haché, voir graine())"""
    for b in texte.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def dit(seg):
    """Le texte dit d'un passage, comme spokenOf() de src/ui/videos/audio.ts"""
    sp = seg.get("spoken")
    return sp if isinstance(sp, str) and sp.strip() else seg["say"]


def exporte_series():
    """Les séries de src/ui/videos/series.ts, par tools/voices/export-series.mjs (Node 24)"""
    node = os.environ.get("NODE") or shutil.which("node")
    if not node:
        sys.exit("Node introuvable (il faut Node 24 ; ou NODE=/chemin/vers/node)")
    p = subprocess.run([node, str(ICI / "export-series.mjs")], cwd=RACINE, capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit(f"Export des séries impossible :\n{p.stderr}")
    data = json.loads(p.stdout)
    for s in data["series"]:
        for v in s["videos"]:
            for seg in v["segments"]:
                # Garde-fou : l'empreinte calculée par audio.ts et celle de Python doivent coïncider
                if seg["print"] != fnv(dit(seg)):
                    print(f"⚠ empreinte {seg['id']} : audio.ts {seg['print']}, Python {fnv(dit(seg))} "
                          "(audio.ts a changé de texte dit ? on garde son empreinte)", flush=True)
    return data["series"]


def lit_json(chemin, defaut):
    try:
        return json.loads(Path(chemin).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return defaut


def ecrit_json(chemin, data):
    """Écriture atomique (fichier temporaire puis renommage) : jamais de JSON à moitié écrit"""
    chemin = Path(chemin)
    tmp = chemin.with_name(chemin.name + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, chemin)


def inscrit(voix, video_id, seg_id, entree):
    """Inscrit (ou retire, entree=None) un passage à l'inventaire. Relu juste avant d'écrire : les autres clés,
    et ce qu'un autre outil y aurait écrit entre-temps, sont gardés."""
    inv = lit_json(INVENTAIRE, {})
    # Une table par voix, même vide (forme attendue par le lecteur et tests/voices.test.ts) ; plus aucune table
    # d'une voix retirée (la voix grave, archivée dans report/archives/voix-grave/)
    for v in VOIX:
        inv.setdefault("voices", {}).setdefault(v, {})
    for v in [v for v in inv["voices"] if v not in VOIX]:
        del inv["voices"][v]
    vids = inv["voices"].setdefault(voix, {})
    if entree is None:
        vids.get(video_id, {}).pop(seg_id, None)
        if video_id in vids and not vids[video_id]:
            del vids[video_id]
    else:
        vids.setdefault(video_id, {})[seg_id] = entree
    ecrit_json(INVENTAIRE, inv)
    return inv


def perimes(series, etat_tout):
    """Inscriptions périmées de l'inventaire, toutes voix et toutes vidéos confondues (pas seulement la
    sélection --only) : liste de (voix, vidéo, passage, raison). Le lecteur ne vérifie que l'empreinte du texte
    de series.ts ; il ne voit donc pas qu'un fichier a été enregistré sur un autre texte à dire que celui que
    donne texte.py aujourd'hui (une correction de texte.py, « un euros » → « un euro », laisserait jouer
    l'ancienne prononciation), ni dans un mode abandonné (« continuation » : accent anglais, voix robotique).
    Ces inscriptions sont retirées de l'inventaire en début d'exécution : le passage se lit en sous-titres seuls
    jusqu'à sa régénération. Un fichier sans état (autre outil) ne peut pas être vérifié : il est signalé."""
    segs = {seg["id"]: seg for s in series for v in s["videos"] for seg in v["segments"]}
    out = []
    for voix, vids in lit_json(INVENTAIRE, {}).get("voices", {}).items():
        if voix not in VOIX:
            continue  # voix retirée : sa table disparaît à la prochaine écriture de l'inventaire (inscrit())
        for vid, entrees in vids.items():
            for sid, entree in entrees.items():
                seg = segs.get(sid)
                if seg is None:
                    continue  # orphelin : jamais lu par le lecteur, signalé au rapport (fin de main)
                etat = etat_tout.get(f"{voix}/{sid}")
                if (entree or {}).get("hash") != seg["print"]:
                    out.append((voix, vid, sid, "texte de series.ts changé depuis l'enregistrement"))
                elif etat is None:
                    out.append((voix, vid, sid, None))
                elif etat.get("mode") != "clone-phrases":
                    out.append((voix, vid, sid, f"enregistré en mode « {etat.get('mode')} », abandonné"))
                elif etat.get("texte") != a_dire(seg)[0]:
                    out.append((voix, vid, sid, "texte à dire changé depuis l'enregistrement (texte.py)"))
    return out


def entrees_publiees(series, voix_liste, passages=None, videos=None):
    """Passages publiés à jour (inscrits à l'inventaire avec l'empreinte du texte actuel de series.ts, fichier
    présent), avec leur texte à dire (etat.json, sinon texte.py) : [{voix, video, passage, fichier, texte}].
    Lecture seule. passages : identifiants retenus (tous si vide) ; videos : vidéos retenues (toutes si None)."""
    inv = lit_json(INVENTAIRE, {}).get("voices", {})
    etat = lit_json(ETAT, {})
    ids = {v["id"] for v in videos} if videos is not None else None
    out = []
    for voix in voix_liste:
        for s in series:
            for v in s["videos"]:
                if ids is not None and v["id"] not in ids:
                    continue
                for seg in v["segments"]:
                    if passages and seg["id"] not in passages:
                        continue
                    e = inv.get(voix, {}).get(v["id"], {}).get(seg["id"])
                    if not e or e.get("hash") != seg["print"] or not (PUBLIC / e["file"]).exists():
                        continue
                    texte = (etat.get(f"{voix}/{seg['id']}") or {}).get("texte") or a_dire(seg)[0]
                    out.append({"voix": voix, "video": v["id"], "passage": seg["id"], "fichier": PUBLIC / e["file"],
                                "texte": texte})
    return out


def scan(args, series, videos, voix_liste, passages_voulus, horodatage):
    """--scan : passe les passages publiés de la sélection au détecteur de sons parasites, sans rien générer ni
    toucher à l'inventaire, à l'état ou aux fichiers publiés. Écrit report/scan-*.txt|json et met à jour
    report/a-refaire.json (passages contrôlés : ajoutés s'ils ont un défaut net, retirés sinon ; les autres
    entrées restent). --listen : compilation d'écoute des sons repérés."""
    entrees = entrees_publiees(series, voix_liste, passages_voulus, videos)
    journal(f"Contrôle des sons parasites : {len(entrees)} passage(s) publié(s) "
            f"({', '.join(VOIX[v]['libelle'] for v in voix_liste)})", args.journal)
    debut = time.time()
    res = scanne(entrees, Aligneur(), journal=lambda m: journal(m, args.journal))
    duree = time.time() - debut
    flag = lit_json(A_REFAIRE, {})
    flag.setdefault("passages", {})
    for r in res:
        cle = f"{r['voix']}/{r['passage']}"
        if r["verdict"] == "refus":
            flag["passages"][cle] = {"voix": r["voix"], "video": r["video"], "passage": r["passage"], "scan": horodatage,
                                     "evenements": [e for e in r["evenements"] if e["gravite"] == "net"]}
        elif r["verdict"] != "inconnu":
            flag["passages"].pop(cle, None)
    flag["date"] = horodatage
    ecrit_json(A_REFAIRE, flag)
    a_refaire = [r for r in res if r["verdict"] == "refus"]
    lignes = [f"Contrôle des sons parasites — {horodatage}", f"Commande : generate.py {' '.join(sys.argv[1:])}",
              "Détecteur : artefacts.py (alignement Qwen3-ForcedAligner, seuils étalonnés : voir artefacts.py et README.md). "
              "Net : à refaire ; léger : signalé seulement.", ""]
    for r in res:
        signe = {"refus": "À REFAIRE", "penalite": "léger", "ok": "ok", "inconnu": "non contrôlé"}[r["verdict"]]
        lignes.append(f"{r['voix']} / {r['passage']} — {r.get('duree_s', 0):.2f} s : {signe}"
                      + (f" ({r['erreur']})" if r.get("erreur") else ""))
        lignes += [f"    {decrit(e)}" for e in r["evenements"]]
    lignes += ["", f"À refaire ({len(a_refaire)}) : " + (", ".join(f"{r['voix']}/{r['passage']}" for r in a_refaire) or "aucun")]
    if flag["passages"]:
        lignes.append(f"Liste report/a-refaire.json ({len(flag['passages'])}) : {', '.join(sorted(flag['passages']))}")
        lignes.append("→ ~/isoloir-tts/bin/python tools/voices/generate.py --redo-flagged   (ne régénère que ceux-là ; "
                      "--voice pour une seule voix)")
    lignes.append(f"Temps : {duree:.0f} s pour {len(res)} passage(s), chargement du modèle d'alignement compris.")
    if args.listen:
        n = ecoute(res, args.listen)
        lignes.append(f"Compilation d'écoute : {args.listen} ({n} extrait(s), liste dans "
                      f"{Path(args.listen).with_suffix('.txt')})")
    nom = datetime.now().strftime("scan-%Y%m%d-%H%M%S")
    ecrit_json(RAPPORTS / f"{nom}.json", {"date": horodatage, "commande": " ".join(sys.argv[1:]), "passages": res,
                                         "a_refaire": [f"{r['voix']}/{r['passage']}" for r in a_refaire],
                                         "temps_s": round(duree, 1)})
    texte = "\n".join(lignes) + "\n"
    (RAPPORTS / f"{nom}.txt").write_text(texte, encoding="utf-8")
    journal("\n" + texte, args.journal)


def autres_generations():
    """Autres generate.py en cours (pgrep), hors ce processus, ses ascendants (shell qui l'a lancé) et ses
    descendants (caffeinate -i garde un processus enfant dont la ligne de commande contient generate.py) :
    liste de « pid commande ». Deux exécutions écriraient en même temps l'inventaire, etat.json, les fichiers
    publiés et report/a-refaire.json ; et la seconde partagerait le processeur graphique."""
    try:
        sortie = subprocess.run(["pgrep", "-ilf", r"python.*generate\.py"], capture_output=True, text=True).stdout
        table = subprocess.run(["ps", "-A", "-o", "pid=,ppid="], capture_output=True, text=True).stdout
    except FileNotFoundError:
        return []
    parent = {}
    for ligne in table.splitlines():
        champs = ligne.split()
        if len(champs) == 2 and champs[0].isdigit() and champs[1].isdigit():
            parent[int(champs[0])] = int(champs[1])
    moi = os.getpid()
    famille, pid = set(), moi
    while pid > 1 and pid not in famille:  # ascendants
        famille.add(pid)
        pid = parent.get(pid, 1)
    for pid in parent:  # descendants
        q, vus = pid, set()
        while q > 1 and q not in vus:
            if q == moi:
                famille.add(pid)
                break
            vus.add(q)
            q = parent.get(q, 1)
    out = []
    for ligne in sortie.splitlines():
        champs = ligne.split(None, 1)
        if champs and champs[0].isdigit() and int(champs[0]) not in famille:
            out.append(ligne.strip())
    return out


def lit_wav(chemin):
    sr, a = wavfile.read(str(chemin))
    entier = np.issubdtype(a.dtype, np.integer)
    a = a.astype(np.float32)
    if entier:
        a = a / 32768.0
    if a.ndim > 1:
        a = a.mean(axis=1)
    if sr != SR:
        from scipy.signal import resample_poly

        g = math.gcd(sr, SR)
        a = resample_poly(a, SR // g, sr // g).astype(np.float32)
    return a


def encode_m4a(audio, dest, tmpdir, debit):
    """Mono 48 kHz → AAC-LC dans un conteneur MP4 (.m4a), qualité voix"""
    wav = Path(tmpdir) / (Path(dest).stem + ".wav")
    wavfile.write(str(wav), SR, np.asarray(audio, dtype=np.float32))
    Path(dest).parent.mkdir(parents=True, exist_ok=True)
    tmp = Path(dest).with_name(Path(dest).stem + ".tmp.m4a")
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-c", "1", "-b", str(debit), "-s", "1", "-q", "127",
                    str(wav), str(tmp)], check=True, capture_output=True)
    os.replace(tmp, dest)


def graine(base, voix, cle, k):
    """Graine de la prise k d'une phrase dans une voix : reproductible, différente d'une voix, d'une phrase et
    d'une prise à l'autre (l'empreinte de la clé de la phrase, à partir de l'état de départ de la voix)"""
    return base + (int(fnv(cle, VOIX[voix]["graines"]), 16) % 100000) * 10 + k


def ecart(f, ref):
    return float(demi_tons(f, ref)) if f and ref and f > 0 and ref > 0 else 0.0


def partie_lue(ref_audio):
    """La référence sans « Bonjour ! » : ce qui suit la première pause de 0,2 s ou plus"""
    p = [x for x in pauses(ref_audio, SR, min_s=0.2) if x[0] < 2.5]
    if not p:
        return ref_audio
    debut, duree = p[0]
    return ref_audio[int((debut + duree - 0.05) * SR):]


class Generateur:
    def __init__(self, args):
        self.args = args
        self.modele = None
        self.mx = None
        self.temps_prises = []  # (secondes de calcul, secondes d'audio brut)
        self.aligneur = Aligneur()  # détecteur de sons parasites : modèle d'alignement chargé au premier usage
        self.temps_artefacts = []  # secondes de détection par prise (alignement compris)

    def charge(self):
        if self.modele is None:
            import mlx.core as mx
            from mlx_audio.tts.utils import load

            self.mx = mx
            t = time.time()
            self.modele = load(MODELE)
            journal(f"Modèle {MODELE} chargé en {time.time() - t:.1f} s", self.args.journal)

    def prise(self, texte, ref, graine_, max_motifs):
        """Une prise brute (48 kHz), mode clone ; rend (audio, secondes de calcul, plafond atteint)"""
        self.charge()
        mx = self.mx
        mx.random.seed(graine_)
        kw = dict(text=texte, ref_audio=str(ref), inference_timesteps=self.args.steps, cfg_value=self.args.cfg,
                  max_tokens=max_motifs)
        t = time.time()
        parts = [np.array(r.audio, dtype=np.float32) for r in self.modele.generate(**kw)]
        dt = time.time() - t
        audio = np.concatenate(parts) if parts else np.zeros(0, dtype=np.float32)
        if hasattr(mx, "clear_cache"):
            mx.clear_cache()
        motifs = len(audio) / ECH_PAR_MOTIF
        self.temps_prises.append((dt, len(audio) / SR))
        return audio, dt, motifs >= max_motifs - 1

    def sons(self, audio, texte):
        """Sons parasites d'une prise nettoyée ou d'un passage (artefacts.detecte) ; None avec --no-artifacts"""
        if self.args.no_artifacts:
            return None
        premier = self.aligneur.modele is None
        d = detecte(audio, SR, texte, self.aligneur)
        if premier and self.aligneur.temps_chargement is not None:
            journal(f"Modèle d'alignement {self.aligneur.temps_chargement:.1f} s de chargement, premier contrôle "
                    f"{d['temps_s']:.1f} s (mise en route)", self.args.journal)
        elif d["verdict"] != "inconnu":
            self.temps_artefacts.append(d["temps_s"])
        if d.get("erreur"):
            journal(f"      ⚠ détecteur de sons parasites : {d['erreur']}", self.args.journal)
            if self.aligneur.modele is None:
                # Modèle d'alignement introuvable : la génération continue sans le détecteur
                journal("      ⚠ détecteur de sons parasites désactivé pour cette exécution", self.args.journal)
                self.args.no_artifacts = True
        return d


def prec_de(etat):
    """La dernière phrase d'un passage déjà généré (etat.json), départ de l'enchaînement du passage suivant"""
    dernier = (etat.get("phrases") or [{}])[-1]
    return {"f0_median": dernier.get("f0_median") or etat.get("f0_median"),
            "f0_fin": dernier.get("f0_fin") or etat.get("f0_fin"), "fin_dt": dernier.get("fin_dt"),
            "question": dernier.get("question", False)}


def voisement(m, articule):
    """Trames voisées fiables par seconde articulée"""
    return m["voiced"] * m["frames"] / articule if articule > 0 else 0.0


def evalue(audio, syll, debit_ref, voisement_ref):
    """Mesures d'une prise nettoyée, et ses défauts rédhibitoires (liste vide si rien à redire)"""
    articule = duree_articulee(audio, SR)
    m = mesure(audio, SR)
    debit = syll / articule if articule > 0 else 0.0
    vo = voisement(m, articule)
    defauts = []
    if articule < 0.25 or m["f0_median"] <= 0:
        defauts.append("pas de parole")
    else:
        if vo < VOISEMENT_MIN_REF * voisement_ref:
            defauts.append(f"voix peu voisée ({vo:.0f} trames/s, {vo / voisement_ref:.2f} × la référence)")
        if debit > DEBIT_MAX * debit_ref:
            defauts.append(f"trop rapide ({debit:.1f} syll/s, {debit / debit_ref:.2f} × la référence)")
        if debit < DEBIT_MIN * debit_ref:
            defauts.append(f"trop lente ({debit:.1f} syll/s, {debit / debit_ref:.2f} × la référence)")
    pause = plus_long_silence(audio, SR)
    if pause > PAUSE_MAX:
        defauts.append(f"silence de {pause:.2f} s")
    return {"parole_s": round(duree_parole(audio, SR), 3), "articule_s": round(articule, 3),
            "debit_syll_s": round(debit, 2), "debit_rel": round(debit / debit_ref, 2) if debit_ref else None,
            "voisement_s": round(vo, 1),
            "pause_max_s": round(pause, 2), **m}, defauts


def saut_vers(prec, p, question):
    """Saut à l'enchaînement (demi-tons) de la phrase précédente vers la prise p ; None sans précédent.
    Après une question, on part de sa médiane (sa fin monte par nature)."""
    if not prec or not p["f0_debut"]:
        return None
    depart = prec["f0_median"] if prec.get("question") else prec["f0_fin"]
    return round(ecart(p["f0_debut"], depart), 2) if depart else None


def tolerance_reprise(prec, question):
    """Montée tolérée au début d'une phrase : la descente finale de la précédente (affirmation), plus 3 dt
    pour une question, au plus TOLERANCE_REPRISE_MAX_DT"""
    descente = 0.0
    if prec and not prec.get("question") and prec.get("fin_dt") is not None:
        descente = max(0.0, -prec["fin_dt"])
    return min(TOLERANCE_REPRISE_MAX_DT, descente + (SAUT_DT if question else 0.0))


def saut_effectif(saut, tolerance):
    """La part du saut qui compte : vers le haut, au-delà de la tolérance de reprise ; vers le bas, tout"""
    if saut is None:
        return 0.0
    return max(0.0, saut - tolerance) if saut >= 0 else -saut


def juge(p, cible, iqr_max, question, tolerance):
    """Contraintes d'acceptation non tenues (liste vide : prise acceptable) et score (plus bas = meilleur)"""
    ecarts = []
    e = abs(p["ecart_cible_dt"])
    if e > ECART_CIBLE_DT:
        ecarts.append(f"hauteur {p['ecart_cible_dt']:+.2f} dt de la cible")
    se = saut_effectif(p["saut_dt"], tolerance)
    if se > SAUT_DT:
        ecarts.append(f"saut de {p['saut_dt']:+.2f} dt à l'enchaînement (tolérance de reprise {tolerance:.1f} dt)")
    if p["f0_iqr_st"] > iqr_max:
        ecarts.append(f"dispersion {p['f0_iqr_st']:.1f} dt")
    fin = p["fin_dt"]
    if not question and fin is not None and fin > FIN_MONTANTE_DT:
        ecarts.append(f"fin montante ({fin:+.1f} dt) sur une affirmation")
    s = e + max(0.0, se - SAUT_PENALITE_DES_DT) + 0.5 * max(0.0, p["f0_iqr_st"] - iqr_max)
    if not question and fin is not None:
        s += max(0.0, fin - FIN_MONTANTE_DT)
        if fin <= FIN_DESCENDANTE_DT:
            s -= 0.3
        elif fin <= 0:
            s -= 0.15
    s += min(PENALITE_ARTEFACT_MAX, PENALITE_ARTEFACT * p.get("sons_legers", 0))
    s += PENALITE_SON_NET * p.get("sons_nets", 0)
    if ecarts:
        s += 10
    if p["defauts"]:
        s += 100
    return ecarts, round(s, 3)


def main():
    ap = argparse.ArgumentParser(description="Génère les voix des vidéos (VoxCPM2, mode clone, hors ligne)")
    ap.add_argument("--only", action="append", default=[],
                    help="vidéo(s) ou série(s) à générer : retraites-intro, retraites (toute la série) ; répétable ou séparé par des virgules")
    ap.add_argument("--voice", choices=list(VOIX), default=next(iter(VOIX)),
                    help="voix à générer : aigue (voix aiguë, la seule depuis le retrait de la voix grave ; défaut)")
    ap.add_argument("--takes", type=int, default=0, help="prises par phrase (sinon : celles de la voix, 3)")
    ap.add_argument("--takes-aigue", type=int, default=0, help="prises par phrase, voix aiguë (3)")
    ap.add_argument("--extra-takes", type=int, default=PRISES_SECOURS,
                    help=f"prises de secours par phrase tant qu'aucune n'est acceptable ({PRISES_SECOURS})")
    ap.add_argument("--target-aigue", type=float, default=0.0,
                    help="cible de hauteur (Hz) de la voix aiguë (défaut : 243,8 Hz, passages validés à l'écoute)")
    ap.add_argument("--segment", action="append", default=[],
                    help="passage(s) à générer seulement : retraites-intro-04 ; répétable ou séparé par des virgules "
                         "(se combine avec --only, --voice, --limit, --force, --purge)")
    ap.add_argument("--limit", type=int, default=0, help="seulement les N premiers passages de chaque vidéo (essai)")
    ap.add_argument("--dry-run", action="store_true", help="montre ce qui serait généré, sans rien générer")
    ap.add_argument("--force", action="store_true", help="régénère même les passages à jour")
    ap.add_argument("--purge", action="store_true",
                    help="efface les fichiers, inscriptions à l'inventaire et état de la sélection (--only, --segment, --voice, --limit), sans rien générer")
    ap.add_argument("--keep-takes", action="store_true",
                    help="garde toutes les prises (report/prises/) et les passages assemblés (report/passages/) en WAV pour écoute")
    ap.add_argument("--steps", type=int, default=16, help="pas de diffusion (16)")
    ap.add_argument("--cfg", type=float, default=2.0, help="guidage (2.0)")
    ap.add_argument("--seed", type=int, default=2027, help="base des graines (2027)")
    ap.add_argument("--bitrate", type=int, default=80000, help="débit AAC en bit/s (80000)")
    ap.add_argument("--scan", action="store_true",
                    help="sans rien générer : passe les passages publiés de la sélection (--voice, --only, --segment) au "
                         "détecteur de sons parasites et inscrit ceux qui ont un défaut net dans report/a-refaire.json")
    ap.add_argument("--listen", metavar="SORTIE.m4a",
                    help="avec --scan : compilation d'écoute des sons repérés (1,5 s de contexte, AAC 128 kb/s) et SORTIE.txt")
    ap.add_argument("--redo-flagged", action="store_true",
                    help="régénère seulement les passages marqués à refaire par --scan (report/a-refaire.json), dans la "
                         "sélection --voice, --only, --segment")
    ap.add_argument("--no-artifacts", action="store_true",
                    help="sans le détecteur de sons parasites (artefacts.py) pendant la génération")
    args = ap.parse_args()
    if args.listen and not args.scan:
        ap.error("--listen va avec --scan")
    if args.scan and (args.redo_flagged or args.purge):
        ap.error("--scan ne génère ni n'efface rien : sans --redo-flagged ni --purge")
    if args.redo_flagged and args.purge:
        ap.error("--redo-flagged et --purge sont incompatibles")
    # Une seule exécution à la fois, sauf --dry-run (lecture seule) : --scan écrit report/a-refaire.json, les
    # autres modes l'inventaire, etat.json et les fichiers publiés
    if not args.dry_run:
        autres = autres_generations()
        if autres:
            sys.exit("Une autre exécution de generate.py est en cours ; attendre qu'elle se termine (ou --dry-run) :\n  "
                     + "\n  ".join(autres))

    RAPPORTS.mkdir(parents=True, exist_ok=True)
    args.journal = RAPPORTS / "journal.log"
    debut = time.time()
    horodatage = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    journal(f"\n=== {horodatage} : generate.py {' '.join(sys.argv[1:])}", args.journal)

    series = exporte_series()
    voulus = {x.strip() for o in args.only for x in o.split(",") if x.strip()}
    videos = []
    for s in series:
        for v in s["videos"]:
            if not voulus or v["id"] in voulus or s["topicId"] in voulus:
                videos.append(v)
    connus = {v["id"] for s in series for v in s["videos"]} | {s["topicId"] for s in series}
    inconnus = voulus - connus
    if inconnus:
        sys.exit(f"Inconnu(s) : {', '.join(sorted(inconnus))}. Vidéos : {', '.join(sorted(connus))}")
    # --segment : des passages précis, dans les vidéos retenues par --only (toutes sans --only)
    passages_voulus = {x.strip() for o in args.segment for x in o.split(",") if x.strip()}
    if passages_voulus:
        tous = {seg["id"] for s in series for v in s["videos"] for seg in v["segments"]}
        if passages_voulus - tous:
            sys.exit(f"Passage(s) inconnu(s) : {', '.join(sorted(passages_voulus - tous))} "
                     "(identifiants de src/ui/videos/series.ts, ex. retraites-intro-04)")
        hors = passages_voulus - {seg["id"] for v in videos for seg in v["segments"]}
        if hors:
            sys.exit(f"Passage(s) hors de la sélection --only : {', '.join(sorted(hors))}")
        videos = [v for v in videos if any(seg["id"] in passages_voulus for seg in v["segments"])]
    voix_liste = [args.voice]

    if args.scan:
        scan(args, series, videos, voix_liste, passages_voulus, horodatage)
        return

    # --redo-flagged : les passages marqués à refaire par --scan, dans la sélection, et eux seuls
    a_refaire = {}
    if args.redo_flagged:
        ids_videos = {v["id"] for v in videos}
        a_refaire = {k: x for k, x in lit_json(A_REFAIRE, {}).get("passages", {}).items()
                     if x["voix"] in voix_liste and x["video"] in ids_videos
                     and (not passages_voulus or x["passage"] in passages_voulus)}
        if not a_refaire:
            journal("Aucun passage marqué à refaire dans la sélection (report/a-refaire.json ; --scan pour contrôler "
                    "les passages publiés).", args.journal)
            return
        journal(f"Passages marqués à refaire ({len(a_refaire)}) : {', '.join(sorted(a_refaire))}", args.journal)
        videos = [v for v in videos if any(x["video"] == v["id"] for x in a_refaire.values())]

    def nb_prises(voix):
        return getattr(args, f"takes_{voix}") or args.takes or VOIX[voix]["prises"]

    def retenu(seg, voix):
        """Le passage est-il dans la sélection (--segment, ou la liste à refaire avec --redo-flagged) ?"""
        if args.redo_flagged:
            return f"{voix}/{seg['id']}" in a_refaire
        return not passages_voulus or seg["id"] in passages_voulus

    if args.purge:
        n = 0
        etat_tout = lit_json(ETAT, {})
        for voix in voix_liste:
            for video in videos:
                for seg in (video["segments"][: args.limit] if args.limit else video["segments"]):
                    if not retenu(seg, voix):
                        continue
                    f = PUBLIC / f"videos/audio/{voix}/{video['id']}/{seg['id']}.m4a"
                    if f.exists():
                        f.unlink()
                        n += 1
                    inscrit(voix, video["id"], seg["id"], None)
                    etat_tout.pop(f"{voix}/{seg['id']}", None)
                d = PUBLIC / f"videos/audio/{voix}/{video['id']}"
                if d.exists() and not any(d.iterdir()):
                    d.rmdir()
            d = PUBLIC / f"videos/audio/{voix}"
            if d.exists() and not any(d.iterdir()):
                d.rmdir()
        ecrit_json(ETAT, etat_tout)
        journal(f"Purge : {n} fichier(s) effacé(s), inscriptions et état retirés.", args.journal)
        return

    mesures = lit_json(ETAT, {})
    calcul = mesures.get("_calcul", {"secondes_calcul": 0.0, "secondes_audio": 0.0, "prises": 0})
    gen = Generateur(args)
    tmpdir = tempfile.mkdtemp(prefix="isoloir-voix-")
    rapport = {"date": horodatage, "modele": MODELE, "commande": " ".join(sys.argv[1:]),
               "parametres": {k: (str(v) if isinstance(v, Path) else v) for k, v in vars(args).items()},
               "niveau_db": NIVEAU_DB, "plafond_db": PLAFOND_DB, "voix": {}, "alertes": []}
    # Rien de périmé ne reste inscrit : retiré avant de générer (signalé seulement avec --dry-run)
    for voix, vid, sid, raison in perimes(series, mesures):
        if raison is None:
            journal(f"⚠ {voix}/{sid} : inscrit sans état de génération (etat.json), texte à dire invérifiable", args.journal)
            rapport["alertes"].append({"voix": voix, "passage": sid, "alerte": "inscrit sans état de génération"})
        elif args.dry_run:
            journal(f"⚠ {voix}/{sid} : périmé ({raison}), sera retiré de l'inventaire", args.journal)
        else:
            inscrit(voix, vid, sid, None)
            journal(f"⚠ {voix}/{sid} : périmé ({raison}), retiré de l'inventaire : sous-titres seuls jusqu'à sa "
                    "régénération", args.journal)
            rapport["alertes"].append({"voix": voix, "passage": sid, "alerte": f"périmé, retiré de l'inventaire : {raison}"})
    a_generer = 0
    interrompu = False

    try:
        for voix in voix_liste:
            conf = VOIX[voix]
            ref_audio = lit_wav(conf["ref"])
            ref_m = mesure(ref_audio, SR)
            lu = partie_lue(ref_audio)
            lu_m = mesure(lu, SR)
            # Cible de hauteur FIXE pour la voix, dans toutes les vidéos et les deux séries : la médiane de F0
            # de la partie lue de la référence. Une cible qui suivrait les passages retenus dériverait (essai
            # précédent, voix grave : 189 → 181 → 167 Hz en trois passages).
            cible = getattr(args, f"target_{voix}") or conf["cible_f0"] or lu_m["f0_median"]
            # Débit de référence : syllabes par seconde articulée de la partie lue
            debit_ref = syllabes(REF_LU) / max(duree_articulee(lu, SR), 0.1)
            voisement_ref = voisement(lu_m, duree_articulee(lu, SR))
            iqr_max = max(8.0, ref_m["f0_iqr_st"] + 2.0)
            n_prises = nb_prises(voix)
            rv = rapport["voix"][voix] = {
                "libelle": conf["libelle"], "nom": conf["nom"], "prises": n_prises, "cible_f0": round(cible, 1), "debit_ref": round(debit_ref, 2),
                "voisement_ref": round(voisement_ref, 1),
                "reference": {**ref_m, "partie_lue_f0_median": lu_m["f0_median"], "partie_lue_fin_dt": lu_m["fin_dt"],
                              "bruit_db": round(plancher_bruit_db(ref_audio, SR), 1)},
                "passages": []}
            journal(f"\n## Voix {conf['libelle']} ({voix}, {conf['nom']}) : référence F0 médiane {ref_m['f0_median']} Hz (partie lue "
                    f"{lu_m['f0_median']} Hz, fin {lu_m['fin_dt']:+.1f} dt) ; cible {cible:.1f} Hz ; débit articulé "
                    f"{debit_ref:.2f} syll/s ; voisement {voisement_ref:.0f} trames/s ; {n_prises} prises par phrase", args.journal)

            for video in videos:
                segs = video["segments"][: args.limit] if args.limit else video["segments"]
                prec = None  # dernière phrase retenue : {"f0_median", "f0_fin", "question"}
                choisis = [seg["id"] for seg in segs if retenu(seg, voix)]
                journal(f"\n# {voix} / {video['id']} ({len(segs)} passages)" if len(choisis) == len(segs)
                        else f"\n# {voix} / {video['id']} (passage(s) {', '.join(choisis)} sur {len(segs)})", args.journal)
                for seg in segs:
                    texte, auto = a_dire(seg)
                    phrases = decoupe(texte)
                    cle = f"{voix}/{seg['id']}"
                    rel = f"videos/audio/{voix}/{video['id']}/{seg['id']}.m4a"
                    dest = PUBLIC / rel
                    entree = lit_json(INVENTAIRE, {}).get("voices", {}).get(voix, {}).get(video["id"], {}).get(seg["id"])
                    etat = mesures.get(cle)
                    a_jour = (dest.exists() and entree and entree.get("hash") == seg["print"]
                              and entree.get("file") == rel and etat is not None
                              and etat.get("texte") == texte and etat.get("print") == seg["print"]
                              and etat.get("mode") == "clone-phrases")
                    if not retenu(seg, voix):
                        # Hors sélection --segment : rien à générer ; sa dernière phrase, s'il est à jour, sert de
                        # départ à l'enchaînement du passage suivant (sinon, pas de contrôle du premier saut)
                        prec = prec_de(etat) if a_jour else None
                        continue
                    if a_jour and not args.force and not args.redo_flagged:
                        journal(f"{seg['id']} : à jour, gardé", args.journal)
                        prec = prec_de(etat)
                        continue
                    a_generer += 1
                    if args.dry_run:
                        journal(f"{seg['id']} : à générer, {len(phrases)} phrase(s) — "
                                + " | ".join(f"« {p} »" for p, _ in phrases)
                                + (" [nombres écrits en lettres]" if auto else ""), args.journal)
                        continue

                    journal(f"{seg['id']} : {len(phrases)} phrase(s)", args.journal)
                    retenues = []
                    for j, (phrase, ponct) in enumerate(phrases):
                        question = est_question(ponct)
                        tolerance = tolerance_reprise(prec, question)
                        syll = syllabes(phrase)
                        attendu = syll / debit_ref
                        max_motifs = int(math.ceil(max(attendu * 2.2, 3.0) * SR / ECH_PAR_MOTIF)) + 10
                        cle_phrase = seg["id"] if j == 0 else f"{seg['id']}/{j + 1}"
                        journal(f"  [{j + 1}] « {phrase} » ({syll} syll., ~{attendu:.1f} s"
                                + (", question" if question else "") + ")", args.journal)
                        prises = []
                        k = 0
                        while k < n_prises + args.extra_takes:
                            if k >= n_prises and any(not q["defauts"] and not q["ecarts"] for q in prises):
                                break
                            if k == n_prises:
                                journal("      aucune prise acceptable : prises de secours", args.journal)
                            g = graine(args.seed, voix, cle_phrase, k)
                            try:
                                brut, dt, plafond = gen.prise(phrase, conf["ref"], g, max_motifs)
                            except Exception as e:  # une prise ratée n'arrête pas la série
                                journal(f"      prise {k + 1} (graine {g}) : échec {e!r}", args.journal)
                                k += 1
                                continue
                            propre = clean(brut, SR)
                            m, defauts = evalue(propre, syll, debit_ref, voisement_ref)
                            if plafond:
                                defauts.append("plafond de longueur atteint (la voix ne s'arrêtait pas)")
                            # Sons parasites : un défaut net rend la prise inacceptable, un léger pénalise son score
                            sons = gen.sons(propre, phrase)
                            nets = [e for e in (sons or {}).get("evenements", []) if e["gravite"] == "net"]
                            if nets:
                                defauts.append("son parasite (" + ", ".join(f"{e['type']} {e['debut']:.2f}-{e['fin']:.2f} s"
                                                                            for e in nets) + ")")
                            p = {"prise": k + 1, "graine": g, "calcul_s": round(dt, 2), "brut_s": round(len(brut) / SR, 3),
                                 **m, "ecart_cible_dt": round(ecart(m["f0_median"], cible), 2),
                                 "sons": sons["evenements"] if sons else None, "sons_legers": sons["n_leger"] if sons else 0,
                                 "sons_nets": sons["n_net"] if sons else 0,
                                 "sons_s": sons["temps_s"] if sons else None,
                                 "defauts": defauts, "_audio": propre}
                            p["saut_dt"] = saut_vers(prec, p, question)
                            prises.append(p)
                            if args.keep_takes:
                                d = RAPPORTS / "prises" / voix / video["id"]
                                d.mkdir(parents=True, exist_ok=True)
                                wavfile.write(str(d / f"{seg['id']}-ph{j + 1}-p{k + 1}.wav"), SR, propre)
                            k += 1
                            # Durées et voisement comparés entre prises (dès 3 prises) : bégaiement, mot sauté,
                            # voix soufflée ou craquée
                            if len(prises) >= 3:
                                med = float(np.median([q["articule_s"] for q in prises if q["articule_s"] > 0] or [0]))
                                med_vo = float(np.median([q["voisement_s"] for q in prises]))
                                for q in prises:
                                    q["defauts"] = [x for x in q["defauts"] if not x.startswith(("durée", "voix soufflée"))]
                                    r = q["articule_s"] / med if med else 1
                                    if not (ECART_PRISES[0] <= r <= ECART_PRISES[1]):
                                        q["defauts"].append(f"durée {r:.2f} × la médiane des prises")
                                    if med_vo and q["voisement_s"] < VOISEMENT_MIN_PRISES * med_vo:
                                        q["defauts"].append(f"voix soufflée ou craquée ({q['voisement_s']:.0f} trames voisées/s, "
                                                            f"{q['voisement_s'] / med_vo:.2f} × la médiane des prises)")
                            for q in prises:
                                q["ecarts"], q["score"] = juge(q, cible, iqr_max, question, tolerance)
                            journal(f"      prise {p['prise']} (graine {g}) : {dt:.1f} s de calcul, {m['articule_s']:.2f} s "
                                    f"articulées, {m['debit_syll_s']:.1f} syll/s ({m['debit_rel']:.2f} × réf.), F0 "
                                    f"{m['f0_median']} Hz ({p['ecart_cible_dt']:+.2f} dt cible), fin "
                                    + ("—" if m["fin_dt"] is None else f"{m['fin_dt']:+.1f} dt")
                                    + (f", saut {p['saut_dt']:+.2f} dt" if p["saut_dt"] is not None else "")
                                    + f", dispersion {m['f0_iqr_st']} dt"
                                    + (f" → écartée : {', '.join(defauts)}" if defauts else "")
                                    + (f" → hors critères : {', '.join(p['ecarts'])}" if p["ecarts"] and not defauts else "")
                                    + "".join(f"\n        son : {decrit(e)}" for e in (p["sons"] or [])),
                                    args.journal)
                        if not prises:
                            break
                        best = min(prises, key=lambda q: q["score"])
                        best["question"] = question
                        best["texte"] = phrase
                        best["ponct"] = ponct
                        best["n_prises"] = len(prises)
                        best["_prises"] = [{k_: v_ for k_, v_ in x.items() if k_ not in ("_audio", "_prises")} for x in prises]
                        best["accord"] = accord(best["_audio"], SR)
                        best["alertes"] = []
                        if best["defauts"]:
                            best["alertes"].append("aucune prise sans défaut : " + ", ".join(best["defauts"]))
                        elif best["ecarts"]:
                            best["alertes"].append("aucune prise acceptable : " + ", ".join(best["ecarts"]))
                        if best["accord"]["accord"] < ACCORD_MIN:
                            best["alertes"].append(f"mesure de F0 incertaine (YIN et SHS d'accord sur "
                                                   f"{best['accord']['accord']:.0%} des trames)")
                        retenues.append(best)
                        best["tolerance_dt"] = round(tolerance, 2)
                        prec = {"f0_median": best["f0_median"], "f0_fin": best["f0_fin"], "fin_dt": best["fin_dt"],
                                "question": question}
                        journal(f"    → prise {best['prise']} retenue sur {len(prises)} : F0 {best['f0_median']} Hz "
                                f"({best['ecart_cible_dt']:+.2f} dt), fin "
                                + ("—" if best["fin_dt"] is None else f"{best['fin_dt']:+.1f} dt")
                                + f", {best['debit_syll_s']:.1f} syll/s"
                                + (f", saut {best['saut_dt']:+.2f} dt" if best["saut_dt"] is not None else "")
                                + "".join(f"\n    ⚠ {a}" for a in best["alertes"]), args.journal)

                    if len(retenues) < len(phrases):
                        journal(f"  ⚠ {seg['id']} : une phrase sans aucune prise, passage sauté", args.journal)
                        rapport["alertes"].append({"voix": voix, "passage": seg["id"], "alerte": "phrase sans aucune prise générée"})
                        continue

                    # Assemblage : phrases au même niveau, pauses entre elles, nettoyage et niveau commun
                    parties = [au_niveau(q["_audio"], SR) for q in retenues]
                    pauses_s = [pause_apres(q["ponct"]) for q in retenues[:-1]]
                    assemble_ = assemble(parties, pauses_s, SR)
                    if len(parties) > 1:
                        assemble_ = clean(assemble_, SR)
                    final, gain = normalise(assemble_, SR)
                    encode_m4a(final, dest, tmpdir, args.bitrate)
                    if args.keep_takes:
                        d = RAPPORTS / "passages" / voix / video["id"]
                        d.mkdir(parents=True, exist_ok=True)
                        wavfile.write(str(d / f"{seg['id']}.wav"), SR, np.asarray(final, dtype=np.float32))
                    duree = round(len(final) / SR, 3)
                    mp = mesure(final, SR)
                    # Pauses mesurées entre les phrases (détecteur de clean.py), pour contrôle
                    pauses_mesurees = [round(d_, 2) for _, d_ in pauses(final, SR, min_s=0.15)]
                    # Contrôle du passage assemblé (raccords compris) : alerte seulement, chaque prise est déjà jugée
                    sons_p = gen.sons(final, texte)
                    nets_p = [e for e in (sons_p or {}).get("evenements", []) if e["gravite"] == "net"]
                    inscrit(voix, video["id"], seg["id"], {"file": rel, "duration": duree, "hash": seg["print"]})
                    champs = ("prise", "graine", "f0_median", "f0_iqr_st", "f0_debut", "f0_fin", "fin_dt", "debit_syll_s",
                              "debit_rel", "ecart_cible_dt", "saut_dt", "tolerance_dt", "question", "texte", "n_prises",
                              "sons")
                    etat = {"mode": "clone-phrases", "texte": texte, "auto": auto, "print": seg["print"], "duree": duree,
                            "gain_db": gain, "cible_f0": round(cible, 1),
                            **{c: mp[c] for c in ("f0_median", "f0_iqr_st", "f0_debut", "f0_fin")},
                            "phrases": [{c: q[c] for c in champs} for q in retenues],
                            "sons": sons_p["evenements"] if sons_p else None, "date": horodatage}
                    mesures[cle] = etat
                    n_nouvelles = sum(q["n_prises"] for q in retenues)
                    for dt_, au_ in gen.temps_prises[-n_nouvelles:]:
                        calcul["secondes_calcul"] += dt_
                        calcul["secondes_audio"] += au_
                        calcul["prises"] += 1
                    mesures["_calcul"] = calcul
                    ecrit_json(ETAT, mesures)
                    alertes = [f"phrase {i + 1} : {x}" for i, q in enumerate(retenues) for x in q["alertes"]]
                    alertes += [f"son parasite dans le passage assemblé : {decrit(e)}" for e in nets_p]
                    journal(f"  → {seg['id']} : {duree:.2f} s, F0 {mp['f0_median']} Hz, gain {gain:+.1f} dB"
                            + (f", pauses {pauses_mesurees} s" if len(retenues) > 1 else "")
                            + "".join(f"\n    son (passage) : {decrit(e)}" for e in (sons_p or {}).get("evenements", [])),
                            args.journal)
                    if args.redo_flagged:
                        # Refait : retiré de la liste, sauf s'il garde un défaut net (aucune prise sans défaut)
                        flag = lit_json(A_REFAIRE, {})
                        reste = nets_p or any(e["gravite"] == "net" for q in retenues for e in (q.get("sons") or []))
                        if reste:
                            flag.setdefault("passages", {}).setdefault(cle, a_refaire[cle])["refait_sans_succes"] = horodatage
                        else:
                            flag.setdefault("passages", {}).pop(cle, None)
                        ecrit_json(A_REFAIRE, flag)
                        journal(f"  {cle} : " + ("défaut net restant, reste à refaire" if reste else "refait, retiré de la liste à refaire"),
                                args.journal)
                    rv["passages"].append({
                        "video": video["id"], "passage": seg["id"], "texte": texte, "nombres_en_lettres": auto,
                        "syllabes": syllabes(texte), "mots": mots(texte), "fichier": rel, "duree_s": duree,
                        "f0_median": mp["f0_median"], "pauses_s": pauses_mesurees,
                        "phrases": [{**{c: q[c] for c in champs + ("accord", "calcul_s")},
                                     "prises": q["_prises"]}
                                    for q in retenues],
                        "sons": sons_p["evenements"] if sons_p else None,
                        "alertes": alertes,
                    })
                    for a in alertes:
                        rapport["alertes"].append({"voix": voix, "passage": seg["id"], "alerte": a})
    except KeyboardInterrupt:
        interrompu = True
        journal("\nInterrompu : l'inventaire et les mesures sont à jour jusqu'au dernier passage terminé.", args.journal)
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    # Orphelins : inscrits à l'inventaire, mais plus dans les séries
    ids = {seg["id"] for s in series for v in s["videos"] for seg in v["segments"]}
    for voix, vids in lit_json(INVENTAIRE, {}).get("voices", {}).items():
        for vid, segs in vids.items():
            for sid in segs:
                if sid not in ids:
                    rapport["alertes"].append({"voix": voix, "passage": sid, "alerte": "inscrit à l'inventaire mais absent des séries"})

    rapport["temps"] = temps_et_estimation(gen.temps_prises, calcul, series, rapport, time.time() - debut,
                                           {v: nb_prises(v) for v in VOIX}, gen.temps_artefacts)
    rapport["interrompu"] = interrompu
    if not args.dry_run:
        nom = datetime.now().strftime("rapport-%Y%m%d-%H%M%S")
        ecrit_json(RAPPORTS / f"{nom}.json", rapport)
        texte_rapport = rapport_texte(rapport)
        (RAPPORTS / f"{nom}.txt").write_text(texte_rapport, encoding="utf-8")
        shutil.copyfile(RAPPORTS / f"{nom}.json", RAPPORTS / "dernier.json")
        shutil.copyfile(RAPPORTS / f"{nom}.txt", RAPPORTS / "dernier.txt")
        journal("\n" + texte_rapport, args.journal)
    else:
        t = rapport["temps"]
        journal(f"\n{a_generer} passage(s) à générer. Estimation pour tout ({t['hypothese']}) : "
                f"~{t['estimation_tout_min']:.0f} min.", args.journal)
    if interrompu:
        sys.exit(130)


def temps_et_estimation(tp, calcul, series, rapport, total, prises_par_voix, ts=()):
    """Temps de calcul de cette exécution, et estimation pour tout (tous les passages des séries, chaque voix).
    Modèle : calcul d'une prise = a + b × secondes d'audio brut (ajusté sur les prises de l'exécution, sinon
    sur le cumul d'etat.json) ; audio brut d'une phrase ≈ syllabes / débit + 0,5 s ; prises par phrase = le
    nombre de prises de la voix × (1 + part de prises de secours observée). ts : secondes du détecteur de sons
    parasites par prise (ajoutées à a)."""
    a, b = 1.0, (calcul["secondes_calcul"] / calcul["secondes_audio"]) if calcul.get("secondes_audio") else 2.2
    if len(tp) >= 5:
        x = np.array([au for _, au in tp])
        y = np.array([t for t, _ in tp])
        if np.ptp(x) > 0.5:
            b, a = np.polyfit(x, y, 1)
    sons = float(np.mean(ts)) if len(ts) else None
    a += sons or 0.0
    # Débit observé des prises (syllabes par seconde articulée), et part de prises de secours
    debits, n_prises, n_base = [], 0, 0
    for voix, v in rapport["voix"].items():
        for p in v["passages"]:
            for q in p["phrases"]:
                debits.append(q["debit_syll_s"])
                n_prises += q["n_prises"]
                n_base += v["prises"]
    debit = float(np.median(debits)) if debits else 6.0
    secours = (n_prises / n_base - 1) if n_base else 0.15
    phrases = [p for s in series for v in s["videos"] for seg in v["segments"] for p, _ in decoupe(a_dire(seg)[0])]
    par_phrase = [a + b * (syllabes(p) / debit + 0.5) for p in phrases]
    total_min = sum(par_phrase) * sum(prises_par_voix.values()) * (1 + secours) / 60
    return {
        "total_s": round(total, 1), "prises": len(tp),
        "calcul_moyen_par_prise_s": round(float(np.mean([t for t, _ in tp])), 2) if tp else None,
        "audio_moyen_par_prise_s": round(float(np.mean([au for _, au in tp])), 2) if tp else None,
        "modele_calcul": f"{a:.2f} s + {b:.2f} s par seconde d'audio",
        "phrases_series": len(phrases), "passages_series": sum(len(v["segments"]) for s in series for v in s["videos"]),
        "part_prises_secours": round(secours, 3),
        "hypothese": " + ".join(f"voix {VOIX[v]['libelle']} {n} prises" for v, n in prises_par_voix.items())
                     + f", {secours:.0%} de secours",
        "estimation_tout_min": round(total_min, 1),
        "sons_moyen_par_prise_s": round(sons, 3) if sons is not None else None,
        "sons_max_par_prise_s": round(float(np.max(ts)), 3) if len(ts) else None,
        "sons_part_du_calcul": round(sons / float(np.mean([t for t, _ in tp])), 3) if sons and tp else None,
    }


def rapport_texte(r):
    lignes = [f"Rapport de génération des voix — {r['date']}", f"Commande : generate.py {r['commande']}",
              f"Mode clone, phrase par phrase. Niveau de parole active {r['niveau_db']} dBFS, crêtes sous {r['plafond_db']} dBFS", ""]
    for voix, v in r["voix"].items():
        ref = v["reference"]
        lignes.append(f"Voix {v.get('libelle', voix)} ({voix}, {v['nom']}) — référence : F0 médiane {ref['f0_median']} Hz (partie lue "
                      f"{ref['partie_lue_f0_median']} Hz, fin {ref['partie_lue_fin_dt']:+.1f} dt) ; cible {v['cible_f0']} Hz ; "
                      f"débit articulé {v['debit_ref']} syll/s ; {v['prises']} prises par phrase")
        lignes.append(f"  {'phrase':<30} {'prise':>7} {'F0':>6} {'cible':>6} {'fin':>6} {'saut':>6} {'tol.':>4} {'syll/s':>6} {'×réf':>5}  "
                      "prises (F0 Hz, ×: écartée, ~: hors critères, !: son parasite net, ?: son parasite léger)")
        for p in v["passages"]:
            lignes.append(f"  {p['passage']} — {p['duree_s']:.2f} s, F0 {p['f0_median']} Hz"
                          + (f", pauses entre phrases {p['pauses_s']} s" if len(p["phrases"]) > 1 else ""))
            for i, q in enumerate(p["phrases"]):
                def signe(x):
                    sons = x.get("sons") or []
                    return "!" if any(e["gravite"] == "net" for e in sons) else ("?" if sons else "")
                autres = " ".join(f"{x['prise']}:{x['f0_median']:.0f}{'×' if x['defauts'] else '~' if x['ecarts'] else ''}{signe(x)}"
                                  for x in q["prises"])
                debut = q["texte"][:27] + ("…" if len(q["texte"]) > 27 else "")
                fin = "—" if q["fin_dt"] is None else f"{q['fin_dt']:+.1f}"
                saut = "—" if q["saut_dt"] is None else f"{q['saut_dt']:+.1f}"
                lignes.append(f"    {i + 1}. {debut:<27} {q['prise']:>3}/{q['n_prises']:<3} {q['f0_median']:>6.1f} {q['ecart_cible_dt']:>+6.2f} "
                              f"{fin:>6} {saut:>6} {q['tolerance_dt']:>4.1f} {q['debit_syll_s']:>6.1f} {q['debit_rel']:>5.2f}  {autres}")
                # Sons parasites, prise par prise
                for x in q["prises"]:
                    for e in x.get("sons") or []:
                        lignes.append(f"         prise {x['prise']} : {decrit(e)}")
            for e in p.get("sons") or []:
                lignes.append(f"      passage assemblé : {decrit(e)}")
            for a in p["alertes"]:
                lignes.append(f"      ⚠ {a}")
        lignes.append("")
    if r["alertes"]:
        lignes.append(f"Alertes ({len(r['alertes'])}) :")
        lignes += [f"  {a['voix']} / {a['passage']} : {a['alerte']}" for a in r["alertes"]]
    else:
        lignes.append("Aucune alerte.")
    t = r["temps"]
    lignes += ["", f"Temps : {t['total_s']:.0f} s pour {t['prises']} prise(s)"
               + (f", {t['calcul_moyen_par_prise_s']} s de calcul par prise en moyenne ({t['audio_moyen_par_prise_s']} s d'audio)"
                  if t["calcul_moyen_par_prise_s"] else "")
               + f" ; calcul d'une prise ≈ {t['modele_calcul']}."
               + (f" Détecteur de sons parasites : {t['sons_moyen_par_prise_s']} s par prise en moyenne (au plus "
                  f"{t['sons_max_par_prise_s']} s), {t['sons_part_du_calcul']:.0%} du calcul d'une prise."
                  if t.get("sons_moyen_par_prise_s") and t.get("sons_part_du_calcul") else ""),
               f"Estimation pour les {t['passages_series']} passages ({t['phrases_series']} phrases) "
               f"({t['hypothese']}) : ~{t['estimation_tout_min']:.0f} min."]
    return "\n".join(lignes) + "\n"


if __name__ == "__main__":
    main()
