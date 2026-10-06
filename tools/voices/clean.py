# Nettoyage d'un passage généré, puis mise au niveau commun de toutes les voix.
#
# Repris du nettoyage des échantillons (passe-haut, porte de bruit douce, coupe des silences de début et de
# fin), avec des marges plus généreuses : la fin d'un mot (« s », « f », « e » final, souffle) est faible et
# ne doit JAMAIS être rognée. Donc :
# - la porte de bruit n'éteint pas, elle atténue (−30 dB) ; elle s'ouvre 40 ms avant la voix et ne se
#   referme que 220 ms après, avec des fondus de 25 ms ;
# - les bords du passage se cherchent avec un seuil plus bas que la porte (−52 dB sous la crête) ; on garde
#   120 ms d'air avant le premier son et 320 ms après le dernier, puis fondu d'entrée de 15 ms et fondu de
#   sortie de 90 ms, pris dans ce silence gardé ;
# - niveau : même niveau de parole active (RMS des trames de voix) pour tous les passages,
#   puis limiteur de crête à anticipation (pas d'écrêtage) sous −1,5 dBFS.
import numpy as np
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, sosfiltfilt

# Niveau de parole active visé, et plafond des crêtes (dBFS), communs à tous les passages
NIVEAU_DB = -20.0
PLAFOND_DB = -1.5


def _trames_db(a, sr, win_ms):
    w = max(1, int(sr * win_ms / 1000))
    n = len(a) // w
    if n == 0:
        return np.zeros(0), w
    frames = a[: n * w].reshape(n, w)
    rms = np.sqrt(np.mean(frames.astype(np.float64) ** 2, axis=1) + 1e-14)
    return 20 * np.log10(rms + 1e-14), w


def _dilate(on, avant, apres):
    """Étend chaque trame de voix de « avant » trames vers le passé et de « apres » trames vers le futur"""
    out = on.copy()
    for k in range(1, avant + 1):
        out[:-k] |= on[k:]
    for k in range(1, apres + 1):
        out[k:] |= on[:-k]
    return out


def clean(a, sr, hp=70.0, gate_db=-50.0, sous_crete_db=40.0, bord_db=52.0, plancher_db=-30.0, win_ms=10,
          ouvre_ms=40, ferme_ms=220, fondu_ms=25, avant_ms=120, apres_ms=320, entree_ms=15, sortie_ms=90):
    a = np.asarray(a, dtype=np.float64)
    if len(a) < sr // 20:
        return a.astype(np.float32)
    a = sosfiltfilt(butter(4, hp, btype="highpass", fs=sr, output="sos"), a)
    db, w = _trames_db(a, sr, win_ms)
    if len(db) == 0:
        return a.astype(np.float32)
    crete = float(np.max(db))

    # Porte de bruit douce entre les mots
    on = db > max(gate_db, crete - sous_crete_db)
    keep = _dilate(on, int(ouvre_ms / win_ms), int(ferme_ms / win_ms))
    plancher = 10 ** (plancher_db / 20)
    gain = np.repeat(np.where(keep, 1.0, plancher), w)
    gain = np.concatenate([gain, np.full(len(a) - len(gain), gain[-1])])
    f = max(1, int(sr * fondu_ms / 1000))
    gain = uniform_filter1d(gain, f, mode="nearest")
    a = a * gain

    # Bords : seuil plus bas que celui de la porte, pour garder les fins de mots les plus faibles
    bord = db > max(gate_db - 8, crete - bord_db)
    idx = np.nonzero(bord)[0]
    if len(idx):
        debut = max(0, idx[0] * w - int(avant_ms * sr / 1000))
        fin = min(len(a), (idx[-1] + 1) * w + int(apres_ms * sr / 1000))
        a = a[debut:fin].copy()
        # Si le fichier brut s'arrêtait trop tôt, on ajoute le silence manquant (la fin reste entière)
        manque = (idx[-1] + 1) * w + int(apres_ms * sr / 1000) - fin
        if manque > 0:
            a = np.concatenate([a, np.zeros(manque)])
    ne = min(len(a) // 4, int(entree_ms * sr / 1000))
    ns = min(len(a) // 4, int(sortie_ms * sr / 1000))
    if ne > 1:
        a[:ne] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, ne))
    if ns > 1:
        a[-ns:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, ns))
    return a.astype(np.float32)


def niveau_actif_db(a, sr, sous_crete_db=35.0, win_ms=20):
    """Niveau RMS de la parole active : trames à moins de 35 dB de la plus forte"""
    db, w = _trames_db(np.asarray(a, dtype=np.float64), sr, win_ms)
    if len(db) == 0:
        return -120.0
    actif = db > float(np.max(db)) - sous_crete_db
    p = 10 ** (db[actif] / 10)
    return float(10 * np.log10(np.mean(p) + 1e-14))


def limite(a, sr, plafond_db=PLAFOND_DB, bloc_ms=1.0, tenue_ms=6.0, lissage_ms=3.0):
    """Limiteur de crête à anticipation : le gain baisse avant la crête, sans écrêtage ni distorsion"""
    a = np.asarray(a, dtype=np.float64)
    plafond = 10 ** (plafond_db / 20)
    b = max(1, int(sr * bloc_ms / 1000))
    n = -(-len(a) // b)
    pad = np.concatenate([np.abs(a), np.zeros(n * b - len(a))]).reshape(n, b)
    crete = pad.max(axis=1)
    g = np.minimum(1.0, plafond / np.maximum(crete, 1e-9))
    tenue = int(tenue_ms / bloc_ms)
    lis = int(lissage_ms / bloc_ms)
    # Minimum glissant large puis moyenne glissante plus étroite : le gain lissé ne dépasse jamais le gain
    # requis d'aucun bloc
    g = minimum_filter1d(g, 2 * tenue + 1, mode="nearest")
    g = uniform_filter1d(g, 2 * lis + 1, mode="nearest")
    centres = (np.arange(n) + 0.5) * b
    gs = np.interp(np.arange(len(a)), centres, g)
    out = a * gs
    # Filet de sécurité (l'interpolation entre deux blocs peut laisser passer un échantillon)
    return np.clip(out, -plafond, plafond).astype(np.float32)


def normalise(a, sr, niveau_db=NIVEAU_DB, plafond_db=PLAFOND_DB):
    """Mise au niveau commun : parole active à niveau_db, crêtes sous plafond_db. Rend (audio, gain en dB)."""
    gain_db = niveau_db - niveau_actif_db(a, sr)
    out = limite(np.asarray(a, dtype=np.float64) * 10 ** (gain_db / 20), sr, plafond_db)
    return out, round(gain_db, 2)


def plancher_bruit_db(a, sr, win_ms=20):
    """Plancher de bruit : 10e centile des trames"""
    db, _ = _trames_db(np.asarray(a, dtype=np.float64), sr, win_ms)
    return float(np.percentile(db, 10)) if len(db) else -120.0


def plus_long_silence(a, sr, sous_crete_db=45.0, win_ms=10):
    """Plus longue pause à l'intérieur de la parole, en secondes (un silence anormal trahit une prise ratée)"""
    db, _ = _trames_db(np.asarray(a, dtype=np.float64), sr, win_ms)
    if len(db) == 0:
        return 0.0
    on = db > float(np.max(db)) - sous_crete_db
    idx = np.nonzero(on)[0]
    if len(idx) < 2:
        return 0.0
    on = on[idx[0]: idx[-1] + 1]
    # Longueur des suites de trames muettes
    best = run = 0
    for v in on:
        run = 0 if v else run + 1
        best = max(best, run)
    return best * win_ms / 1000


def duree_parole(a, sr, sous_crete_db=45.0, win_ms=10):
    """Durée entre le premier et le dernier son, en secondes"""
    db, _ = _trames_db(np.asarray(a, dtype=np.float64), sr, win_ms)
    if len(db) == 0:
        return 0.0
    idx = np.nonzero(db > float(np.max(db)) - sous_crete_db)[0]
    return (idx[-1] - idx[0] + 1) * win_ms / 1000 if len(idx) else 0.0


def pauses(a, sr, min_s=0.1, sous_crete_db=45.0, win_ms=10):
    """Pauses à l'intérieur de la parole : liste de (début en s, durée en s), d'au moins min_s"""
    db, _ = _trames_db(np.asarray(a, dtype=np.float64), sr, win_ms)
    if len(db) == 0:
        return []
    on = db > float(np.max(db)) - sous_crete_db
    idx = np.nonzero(on)[0]
    if len(idx) < 2:
        return []
    out = []
    run = 0
    for i in range(idx[0], idx[-1] + 1):
        if not on[i]:
            run += 1
            continue
        if run * win_ms / 1000 >= min_s:
            out.append(((i - run) * win_ms / 1000, run * win_ms / 1000))
        run = 0
    return out


def duree_articulee(a, sr):
    """Durée de parole sans les pauses de 100 ms ou plus : le temps où la voix articule. Le débit en
    syllabes par seconde articulée compare une phrase seule, un passage et la référence (qui a de longues
    pauses après « Bonjour ! » et aux virgules) sans que les pauses le faussent."""
    return max(0.0, duree_parole(a, sr) - sum(d for _, d in pauses(a, sr)))


def au_niveau(a, sr, niveau_db=NIVEAU_DB):
    """Gain seul (sans limiteur) pour amener la parole active au niveau visé : avant l'assemblage des
    phrases d'un passage, générées séparément et donc de niveaux différents"""
    return (np.asarray(a, dtype=np.float64) * 10 ** ((niveau_db - niveau_actif_db(a, sr)) / 20)).astype(np.float32)


def bornes(a, sr, sous_crete_db=52.0, win_ms=10):
    """Premier et dernier échantillon de son (même seuil que les bords de clean())"""
    db, w = _trames_db(np.asarray(a, dtype=np.float64), sr, win_ms)
    idx = np.nonzero(db > max(-58.0, float(np.max(db)) - sous_crete_db))[0] if len(db) else []
    if len(idx) == 0:
        return 0, len(a)
    return idx[0] * w, min(len(a), (idx[-1] + 1) * w)


def assemble(parties, pauses_s, sr, avant_ms=90, fondu_entree_ms=15, fondu_sortie_ms=70):
    """Assemble les phrases d'un passage (chacune nettoyée par clean(), au même niveau) avec, entre la fin
    du son d'une phrase et le début du son de la suivante, pauses_s[i] secondes. La fin d'une phrase garde
    tout son déclin jusqu'à la pause moins l'amorce de la suivante (au plus avant_ms), avec un fondu de
    sortie pris dans ce silence : aucune fin de mot n'est rognée. La première phrase garde son début
    d'origine, la dernière sa fin d'origine."""
    if len(parties) == 1:
        return np.asarray(parties[0], dtype=np.float32)
    parties = [np.asarray(p, dtype=np.float64) for p in parties]
    b = [bornes(p, sr) for p in parties]
    # Amorce gardée avant le son de chaque phrase (sauf la première) : ce qu'il y a, au plus avant_ms ou le
    # tiers de la pause
    amorces = [0] + [min(b[i][0], int(min(avant_ms / 1000, pauses_s[i - 1] / 3) * sr)) for i in range(1, len(parties))]
    out = []
    for i, p in enumerate(parties):
        debut, fin = b[i]
        if i > 0:
            p = p[debut - amorces[i]:].copy()
            fin -= debut - amorces[i]
            ne = min(amorces[i], int(fondu_entree_ms * sr / 1000))
            if ne > 1:
                p[:ne] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, ne))
        if i == len(parties) - 1:
            out.append(p)
            break
        garde = max(0, int(pauses_s[i] * sr) - amorces[i + 1])
        queue = min(len(p) - fin, garde)
        p = p[: fin + queue].copy()
        ns = min(queue, int(fondu_sortie_ms * sr / 1000))
        if ns > 1:
            p[-ns:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, ns))
        out.append(p)
        # Silence complémentaire si la phrase n'avait pas assez de silence après elle
        out.append(np.zeros(garde - queue))
    return np.concatenate(out).astype(np.float32)
