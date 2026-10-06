#!/usr/bin/env python3
# Échantillon d'écoute : des passages mis bout à bout, séparés par un silence (0,35 s par défaut), encodés en AAC
# 128 kb/s dans un .m4a (afconvert -f m4af -d aac -b 128000).
#
# Sources : les WAV des passages assemblés (report/passages/<voix>/<vidéo>/<passage>.wav, écrits par
# generate.py --keep-takes : une seule compression AAC, à l'encodage de l'échantillon), sinon les .m4a
# publiés (public/videos/audio/...), décodés.
#
# Usage : ~/isoloir-tts/bin/python tools/voices/echantillon.py <voix> <vidéo> <nombre de passages> <sortie.m4a>
#         ~/isoloir-tts/bin/python tools/voices/echantillon.py <voix> --segment <passage> [--segment …] <sortie.m4a>
#         options : --silence <secondes> (0,35)
#   <voix> : aigue (voix aiguë), l'identifiant de generate.py (la seule voix depuis le retrait de la voix grave,
#   5 octobre 2026)
#   ex. : echantillon.py aigue retraites-intro 10 .impeccable/voix/essai-retraites-intro-10-passages.m4a
#         echantillon.py aigue --segment retraites-intro-04 --segment logement-existant-06 --silence 0.6 essai.m4a
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
sys.path.insert(0, str(ICI))

from generate import SR, VOIX, lit_wav  # noqa: E402

SILENCE_S = 0.35


def passage(voix, seg, tmp):
    """Un passage par son identifiant (« retraites-intro-04 » : vidéo « retraites-intro »)"""
    video = seg.rsplit("-", 1)[0]
    wav = ICI / "report" / "passages" / voix / video / f"{seg}.wav"
    if wav.exists():
        return lit_wav(wav), wav
    m4a = RACINE / "public" / "videos" / "audio" / voix / video / f"{seg}.m4a"
    if not m4a.exists():
        sys.exit(f"Passage introuvable : {wav.relative_to(RACINE)} ni {m4a.relative_to(RACINE)}")
    dec = Path(tmp) / f"{seg}.wav"
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEF32@48000", "-c", "1", str(m4a), str(dec)], check=True,
                   capture_output=True)
    return lit_wav(dec), m4a


def main():
    ap = argparse.ArgumentParser(description="Échantillon d'écoute : passages bout à bout, AAC 128 kb/s")
    ap.add_argument("voix", choices=list(VOIX), help="aigue (voix aiguë)")
    ap.add_argument("reste", nargs="+", metavar="…",
                    help="<vidéo> <nombre de passages> <sortie.m4a>, ou <sortie.m4a> seule avec --segment")
    ap.add_argument("--segment", action="append", default=[],
                    help="passage à mettre dans l'échantillon, dans l'ordre donné ; répétable ou séparé par des virgules")
    ap.add_argument("--silence", type=float, default=SILENCE_S, help=f"silence entre deux passages, en secondes ({SILENCE_S})")
    args = ap.parse_args()
    choisis = [x.strip() for o in args.segment for x in o.split(",") if x.strip()]
    if choisis:
        if len(args.reste) != 1:
            ap.error("avec --segment, seulement la sortie : echantillon.py <voix> --segment <passage> … <sortie.m4a>")
        sortie = Path(args.reste[0])
    else:
        if len(args.reste) != 3:
            ap.error("echantillon.py <voix> <vidéo> <nombre de passages> <sortie.m4a>")
        video, nombre, sortie = args.reste[0], int(args.reste[1]), Path(args.reste[2])
        choisis = [f"{video}-{n:02d}" for n in range(1, nombre + 1)]
    with tempfile.TemporaryDirectory(prefix="isoloir-echantillon-") as tmp:
        morceaux = []
        for seg in choisis:
            a, source = passage(args.voix, seg, tmp)
            print(f"{source.relative_to(RACINE)} : {len(a) / SR:.2f} s")
            if morceaux:
                morceaux.append(np.zeros(int(round(args.silence * SR)), dtype=np.float32))
            morceaux.append(a)
        tout = np.concatenate(morceaux)
        wav = Path(tmp) / "echantillon.wav"
        wavfile.write(str(wav), SR, tout.astype(np.float32))
        sortie.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", str(wav), str(sortie)], check=True,
                       capture_output=True)
    print(f"→ {sortie} : {len(tout) / SR:.1f} s")


if __name__ == "__main__":
    main()
