# Hauteur de la voix (fréquence fondamentale, F0) d'un passage, en numpy et scipy seulement : aucune autre
# dépendance.
#
# - yin() : l'algorithme YIN (de Cheveigné et Kawahara, 2002), F0 trame par trame (fenêtre 40 ms, pas 10 ms).
# - trames() : les trames voisées FIABLES de YIN. YIN se trompe parfois d'un rapport entier : il prend un
#   sous-harmonique (F0/2, F0/3, mesuré sur les voix de synthèse : des trames à 85 Hz dans une voix à
#   250 Hz, où les harmoniques impairs de 85 Hz dominent, signe que la vraie F0 est 3 × 85 Hz) ou le double.
#   On écarte (1) les trames à plus de 10 demi-tons de la médiane du passage, (2) les trames isolées qui
#   sautent de plus de 5 demi-tons par rapport à leurs voisines à ±40 ms : une vraie voix glisse (au plus
#   ~1 demi-ton en 40 ms, même dans une montée de question), une erreur d'octave saute.
# - shs() : seconde méthode, indépendante, dans le domaine des fréquences : sommation des sous-harmoniques
#   (Hermes, 1988). accord() compare les deux méthodes trame par trame : vérification des erreurs d'octave
#   (sur les 18 prises gardées de l'essai précédent et les deux références : 96 à 100 % de trames d'accord à
#   ±1,5 demi-ton, aucune trame à l'octave ; les prises de la voix grave à 130-143 Hz sont donc réellement
#   plus basses, ce n'est pas une erreur de mesure).
# - mesure() : médiane, dispersion, début et fin d'un passage ; fin_de_phrase() : le contour de la fin
#   (montée ou descente des ~150 dernières ms de la partie voisée par rapport aux ~350 ms qui les précèdent) ;
#   contour() : la hauteur par tranches de 50 ms, en demi-tons autour de la médiane, pour l'écoute critique.
#
# En ligne de commande : python pitch.py fichier.wav [...] affiche médiane, fin de phrase, accord
# YIN/SHS et contour par tranches de 50 ms.
import sys

import numpy as np
from scipy.signal import resample_poly

# Analyse à 16 kHz : largement assez pour une voix parlée, et trois fois moins de calcul qu'à 48 kHz
SR_ANALYSE = 16000
TRAME_MS = 40.0
PAS_MS = 10.0
FMIN, FMAX = 60.0, 500.0


def _en_16k(a, sr):
    a = np.asarray(a, dtype=np.float64)
    if sr != SR_ANALYSE:
        g = np.gcd(int(sr), SR_ANALYSE)
        a = resample_poly(a, SR_ANALYSE // g, int(sr) // g)
    return a


def yin(a, sr, fmin=FMIN, fmax=FMAX, frame_ms=TRAME_MS, hop_ms=PAS_MS, seuil=0.15):
    """F0 trame par trame. Rend (f0, voisé) : f0 en Hz (0 hors voisement), voisé en booléens.
    La trame i commence à i × hop_ms."""
    a = _en_16k(a, sr)
    sr = SR_ANALYSE
    w = int(sr * frame_ms / 1000)
    hop = int(sr * hop_ms / 1000)
    tau_min = max(2, int(sr / fmax))
    tau_max = int(sr / fmin)
    span = w + tau_max
    if len(a) < span + hop:
        return np.zeros(0), np.zeros(0, dtype=bool)
    n = 1 + (len(a) - span) // hop
    idx = np.arange(span)[None, :] + hop * np.arange(n)[:, None]
    x = a[idx]  # (n, span)

    # Fonction de différence d(τ) = Σ x[j]² + Σ x[j+τ]² − 2 Σ x[j]·x[j+τ], j de 0 à w−1
    nfft = 1 << int(np.ceil(np.log2(span + w)))
    fa = np.fft.rfft(x[:, :w], nfft)
    fb = np.fft.rfft(x, nfft)
    corr = np.fft.irfft(np.conj(fa) * fb, nfft)[:, : tau_max + 1]
    sq = np.concatenate([np.zeros((n, 1)), np.cumsum(x * x, axis=1)], axis=1)
    e0 = sq[:, w][:, None]
    taus = np.arange(tau_max + 1)
    et = sq[:, taus + w] - sq[:, taus]
    d = np.maximum(e0 + et - 2 * corr, 0.0)

    # Différence normalisée cumulée (CMNDF)
    cm = np.ones_like(d)
    cs = np.cumsum(d[:, 1:], axis=1)
    cm[:, 1:] = d[:, 1:] * taus[1:][None, :] / np.maximum(cs, 1e-12)

    f0 = np.zeros(n)
    voise = np.zeros(n, dtype=bool)
    # Énergie de trame : on ignore les silences et le souffle
    rms = np.sqrt(e0[:, 0] / w)
    plancher = max(1e-4, np.percentile(rms, 95) * 10 ** (-35 / 20)) if n else 1e-4
    seg = cm[:, tau_min:]
    for i in range(n):
        if rms[i] < plancher:
            continue
        row = seg[i]
        sous = np.nonzero(row < seuil)[0]
        if len(sous):
            k = sous[0]
            # Descendre jusqu'au creux local
            while k + 1 < len(row) and row[k + 1] < row[k]:
                k += 1
        else:
            continue
        # Interpolation parabolique autour du creux
        t = k + tau_min
        if 1 <= t < tau_max:
            y0, y1, y2 = cm[i, t - 1], cm[i, t], cm[i, t + 1]
            den = y0 - 2 * y1 + y2
            dt = 0.5 * (y0 - y2) / den if abs(den) > 1e-12 else 0.0
            t = t + float(np.clip(dt, -1, 1))
        f0[i] = sr / t
        voise[i] = True
    return f0, voise


def shs(a, sr, fmin=FMIN, fmax=FMAX, frame_ms=TRAME_MS, hop_ms=PAS_MS, harmoniques=15, h=0.84, fmax_spectre=1250.0):
    """Seconde méthode : sommation des sous-harmoniques (Hermes, 1988), sur les mêmes trames que yin().
    Pour chaque F0 candidate (48 par octave), somme pondérée (h^(k−1)) du spectre aux harmoniques k × F0 ;
    la F0 retenue est celle qui recueille le plus d'énergie harmonique. Rend f0 (Hz) pour toutes les trames
    (y compris non voisées : à croiser avec le voisement de yin())."""
    a = _en_16k(a, sr)
    sr = SR_ANALYSE
    w = int(sr * frame_ms / 1000)
    hop = int(sr * hop_ms / 1000)
    span = w + int(sr / fmin)  # même nombre de trames que yin()
    if len(a) < span + hop:
        return np.zeros(0)
    n = 1 + (len(a) - span) // hop
    idx = np.arange(w)[None, :] + hop * np.arange(n)[:, None]
    nfft = 4096
    spectre = np.abs(np.fft.rfft(a[idx] * np.hanning(w), nfft))
    df = sr / nfft
    spectre[:, int(fmax_spectre / df) + 1:] = 0.0
    spectre[:, : int(50 / df)] = 0.0
    cands = fmin * 2 ** (np.arange(int(48 * np.log2(fmax / fmin)) + 1) / 48)
    score = np.zeros((n, len(cands)))
    for k in range(1, harmoniques + 1):
        pos = cands * k / df
        ok = pos < spectre.shape[1] - 1
        i0 = np.floor(pos[ok]).astype(int)
        fr = pos[ok] - i0
        score[:, ok] += (h ** (k - 1)) * (spectre[:, i0] * (1 - fr) + spectre[:, i0 + 1] * fr)
    return cands[np.argmax(score, axis=1)]


def demi_tons(f, ref):
    """Écart en demi-tons de la fréquence f par rapport à ref"""
    return 12.0 * np.log2(f / ref)


def trames(a, sr):
    """Trames voisées fiables : (temps du centre de trame en s, F0 en Hz), erreurs d'octave écartées"""
    f0, v = yin(a, sr)
    t = np.arange(len(f0)) * PAS_MS / 1000 + TRAME_MS / 2000
    t, f = t[v], f0[v]
    if len(f) < 3:
        return t, f
    # 1. Loin de la médiane : sous-harmonique ou doublement (deux passes, la première médiane est biaisée par
    #    les erreurs elles-mêmes)
    m = np.median(f)
    ok = np.abs(demi_tons(f, m)) < 12
    if ok.sum() >= 3:
        m = np.median(f[ok])
    ok = np.abs(demi_tons(f, m)) < 10
    t, f = t[ok], f[ok]
    # 2. Sauts isolés : comparaison à la médiane des trames voisées à ±40 ms
    garde = np.ones(len(f), dtype=bool)
    for i in range(len(f)):
        voisins = f[np.abs(t - t[i]) <= 0.0405]
        if len(voisins) >= 3 and abs(demi_tons(f[i], np.median(voisins))) > 5:
            garde[i] = False
    return t[garde], f[garde]


def accord(a, sr, tolerance_dt=1.5):
    """Part des trames voisées où YIN et SHS donnent la même F0 (à tolerance_dt près), et part où ils
    diffèrent d'une octave (vérification des erreurs d'octave)"""
    f0, v = yin(a, sr)
    s = shs(a, sr)
    n = min(len(f0), len(s))
    f0, v, s = f0[:n], v[:n], s[:n]
    if not v.any():
        return {"accord": 0.0, "octave": 0.0}
    r = demi_tons(f0[v], s[v])
    return {"accord": round(float(np.mean(np.abs(r) < tolerance_dt)), 3),
            "octave": round(float(np.mean(np.abs(np.abs(r) - 12) < 2)), 3)}


def fin_de_phrase(a, sr, f0_median, fin_s=0.15, avant_s=0.35):
    """Contour de la fin d'une phrase, en demi-tons : médiane de F0 des ~150 dernières ms de la partie voisée
    par rapport à celle des ~350 ms qui les précèdent. Positif : la fin monte (intonation de question) ;
    négatif : elle descend (affirmation). None si la phrase est trop courte pour en juger.

    Fenêtres en temps, ancrées sur la dernière trame voisée (et non en nombre de trames voisées, qui
    mêlerait des syllabes séparées par des consonnes sourdes). Les trames de YIN y sont traitées à part :
    - plus de 10 demi-tons AU-DESSUS de la médiane, ou saut isolé vers le haut de plus de 5 demi-tons :
      doublement (erreur), écartées ;
    - plus de 10 demi-tons AU-DESSOUS : voix craquée (« creaky voice ») ou sous-harmonique d'une voix qui
      s'éteint — à l'oreille, une fin grave : comptées à −10 demi-tons au lieu d'être écartées (sinon une fin
      qui descend dans le grave paraîtrait monter)."""
    f0, v = yin(a, sr)
    if f0_median <= 0 or v.sum() < 8:
        return None
    t = (np.arange(len(f0)) * PAS_MS / 1000 + TRAME_MS / 2000)[v]
    d = demi_tons(f0[v], f0_median)
    garde = d <= 10
    for i in np.nonzero(garde)[0]:
        voisins = d[(np.abs(t - t[i]) <= 0.0405) & garde]
        if len(voisins) >= 3 and d[i] - np.median(voisins) > 5:
            garde[i] = False
    t, d = t[garde], np.maximum(d[garde], -10.0)
    if len(d) < 8:
        return None
    fin_t = t[-1]
    fin = d[t > fin_t - fin_s]
    if len(fin) < 3:
        fin = d[-3:]
    debut_fin = fin_t - fin_s if len(fin) > 3 else t[-3]
    avant = d[(t <= debut_fin) & (t > debut_fin - avant_s)]
    if len(avant) < 3:
        avant = d[t <= debut_fin][-10:]
    if len(avant) < 3:
        return None
    return round(float(np.median(fin) - np.median(avant)), 2)


def mesure(a, sr):
    """Mesures de hauteur d'un passage ou d'une phrase : médiane, dispersion (écart interquartile en
    demi-tons), centiles, début et fin (médianes du premier et du dernier tiers des trames voisées : là
    où s'entend un saut de note d'un passage à l'autre), contour de la fin, part voisée."""
    t, f = trames(a, sr)
    n_trames = max(0, int((len(a) / sr * 1000 - TRAME_MS) / PAS_MS))
    if len(f) < 3:
        return {"f0_median": 0.0, "f0_iqr_st": 0.0, "f0_p10": 0.0, "f0_p90": 0.0, "f0_debut": 0.0, "f0_fin": 0.0,
                "fin_dt": None, "voiced": 0.0, "frames": n_trames}
    med = float(np.median(f))
    tiers = max(1, len(f) // 3)
    st = demi_tons(f, med)
    q1, q3 = np.percentile(st, [25, 75])
    return {
        "f0_median": round(med, 1),
        "f0_iqr_st": round(float(q3 - q1), 2),
        "f0_p10": round(float(np.percentile(f, 10)), 1),
        "f0_p90": round(float(np.percentile(f, 90)), 1),
        "f0_debut": round(float(np.median(f[:tiers])), 1),
        "f0_fin": round(float(np.median(f[-tiers:])), 1),
        "fin_dt": fin_de_phrase(a, sr, med),
        "voiced": round(len(f) / max(n_trames, 1), 3),
        "frames": n_trames,
    }


def contour(a, sr, tranche_ms=50, ref=None):
    """Hauteur par tranches de tranche_ms : liste de (début de tranche en s, demi-tons autour de ref ou de
    la médiane, None si la tranche n'a pas au moins 2 trames voisées fiables)"""
    t, f = trames(a, sr)
    if len(f) == 0:
        return []
    ref = ref or float(np.median(f))
    pas = tranche_ms / 1000
    out = []
    for k in range(int(len(a) / sr / pas) + 1):
        sel = (t >= k * pas) & (t < (k + 1) * pas)
        out.append((round(k * pas, 3), round(float(demi_tons(np.median(f[sel]), ref)), 1) if sel.sum() >= 2 else None))
    return out


def lit(chemin):
    from scipy.io import wavfile

    sr, a = wavfile.read(str(chemin))
    entier = np.issubdtype(a.dtype, np.integer)
    a = a.astype(np.float64)
    if entier:
        a = a / 32768.0
    if a.ndim > 1:
        a = a.mean(axis=1)
    return a, sr


if __name__ == "__main__":
    for chemin in sys.argv[1:]:
        a, sr = lit(chemin)
        m = mesure(a, sr)
        ac = accord(a, sr)
        print(f"{chemin}\n  F0 médiane {m['f0_median']} Hz, dispersion {m['f0_iqr_st']} dt, début {m['f0_debut']} Hz, "
              f"fin {m['f0_fin']} Hz, fin de phrase {m['fin_dt']} dt ; accord YIN/SHS {ac['accord']:.0%}, "
              f"à l'octave {ac['octave']:.0%}")
        c = contour(a, sr)
        print("  " + " ".join(f"{t:.2f}:{'·' if d is None else f'{d:+.1f}'}" for t, d in c))
