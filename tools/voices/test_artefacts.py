#!/usr/bin/env python3
# Tests du détecteur de sons parasites (artefacts.py).
#
# - Audio synthétique, sans modèle : deux « mots » (sons harmoniques voisés) séparés par un silence, avec ou sans
#   son parasite entre eux ; les mots alignés sont donnés tels quels.
# - Référence, avec l'aligneur (Qwen3-ForcedAligner, lu dans le cache, hors connexion) : la référence de la voix
#   grave (texte connu ; voix retirée le 5 octobre 2026, référence archivée dans
#   report/archives/voix-grave/refs/grave.wav) ne déclenche rien ; avec un souffle ou des bouffées voisées
#   collés dans la pause qui suit « Bonjour ! » (0,80 s, assez longue pour y coller un son), le son est
#   repéré, au bon endroit, du bon type. Sautés si le modèle d'alignement ou la référence archivée manquent.
# - Prises gardées de la voix grave (report/prises/, report/archives/, non suivies par git ; sautées si
#   absentes) : rire, souffles et « hah » repérés à la main, et une prise propre.
#
# Usage : ~/isoloir-tts/bin/python tools/voices/test_artefacts.py [-v]
import os
import sys
import unittest
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))

import artefacts  # noqa: E402

SR = 48000
REF_TEXTE = ("Bonjour ! Aujourd'hui, on prend deux minutes pour comprendre un sujet qui nous concerne tous, "
             "simplement, chiffres à l'appui.")
CACHE = Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub" / (
    "models--" + artefacts.MODELE_ALIGNEMENT.replace("/", "--"))


def harmonique(duree, f0=150.0, niveau_db=-20.0, graine=0):
    """Un son voisé : 12 harmoniques de f0 (amplitude 1/k), léger vibrato, attaque et chute de 20 ms"""
    t = np.arange(int(duree * SR)) / SR
    phase = 2 * np.pi * np.cumsum(f0 * (1 + 0.01 * np.sin(2 * np.pi * 5 * t))) / SR
    x = sum(np.sin(k * phase) / k for k in range(1, 13))
    return rampes(x / np.sqrt(np.mean(x ** 2)) * 10 ** (niveau_db / 20))


def bruit(duree, bande, niveau_db, graine=1):
    """Un souffle : bruit blanc filtré (« bas » sous 2 kHz, « haut » au-dessus de 4 kHz)"""
    rng = np.random.default_rng(graine)
    x = rng.standard_normal(int(duree * SR))
    sos = butter(4, 2000 if bande == "bas" else 4000, btype="lowpass" if bande == "bas" else "highpass", fs=SR,
                 output="sos")
    x = sosfilt(sos, x)
    return rampes(x / np.sqrt(np.mean(x ** 2)) * 10 ** (niveau_db / 20))


def rampes(x, ms=20):
    n = min(len(x) // 2, int(SR * ms / 1000))
    r = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))
    x = x.copy()
    x[:n] *= r
    x[-n:] *= r[::-1]
    return x


def deux_mots(parasite=None, a=0.75, silence_numerique=False):
    """Silence (bruit de fond à −80 dBFS, ou silence numérique comme dans les prises et passages réels),
    « un » de 0,1 à 0,5 s, « deux » de 1,3 à 1,7 s, et un son parasite collé à partir de a secondes. Rend
    (audio, mots alignés)."""
    rng = np.random.default_rng(7)
    audio = rng.standard_normal(int(2.0 * SR)) * (0.0 if silence_numerique else 10 ** (-80 / 20))
    for debut, f0 in ((0.1, 140.0), (1.3, 160.0)):
        s = harmonique(0.4, f0)
        audio[int(debut * SR): int(debut * SR) + len(s)] += s
    if parasite is not None:
        audio[int(a * SR): int(a * SR) + len(parasite)] += parasite
    return audio.astype(np.float32), [("un", 0.1, 0.5), ("deux", 1.3, 1.7)]


def bouffees_voisees(n=3, periode=0.18, duree=0.07, f0=220.0, niveau_db=-20.0):
    """Des bouffées voisées à 1/periode Hz (5,6 Hz par défaut), comme un rire « ha-ha-ha »"""
    x = np.zeros(int((periode * (n - 1) + duree) * SR))
    b = harmonique(duree, f0, niveau_db)
    for k in range(n):
        i = int(k * periode * SR)
        x[i: i + len(b)] += b
    return x


def evenements(audio, mots):
    return artefacts.juge(artefacts.analyse(audio, SR, mots))


class Synthetique(unittest.TestCase):
    def test_silence_entre_deux_mots(self):
        audio, mots = deux_mots()
        self.assertEqual(evenements(audio, mots), [])

    def test_souffle_grave_entre_deux_mots(self):
        audio, mots = deux_mots(bruit(0.25, "bas", -26.0))
        evs = evenements(audio, mots)
        self.assertEqual(len(evs), 1, evs)
        e = evs[0]
        self.assertEqual((e["type"], e["gravite"]), ("respiration", "net"))
        self.assertAlmostEqual(e["debut"], 0.75, delta=0.05)
        self.assertAlmostEqual(e["fin"], 1.00, delta=0.05)
        self.assertGreater(e["niveau_db"], 40)  # au-dessus du bruit de fond (−80 dBFS)
        self.assertEqual((e["mot_avant"], e["mot_apres"]), ("un", "deux"))

    def test_souffle_aigu_entre_deux_mots(self):
        audio, mots = deux_mots(bruit(0.20, "haut", -26.0))
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"]) for e in evs], [("bruit", "net")])

    def test_souffle_doux_leger(self):
        audio, mots = deux_mots(bruit(0.15, "bas", -45.0))
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"]) for e in evs], [("respiration", "leger")])

    def test_rire_entre_deux_mots(self):
        audio, mots = deux_mots(bouffees_voisees())
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"]) for e in evs], [("rire", "net")])

    def test_vocalise_isolee(self):
        audio, mots = deux_mots(harmonique(0.2, 200.0, -24.0))
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"]) for e in evs], [("vocalise", "net")])

    def test_parole_en_trop_apres_le_dernier_mot(self):
        audio, mots = deux_mots()
        audio = np.concatenate([audio, np.zeros(int(0.3 * SR), np.float32)])
        s = harmonique(0.25, 150.0, -22.0)
        audio[int(1.95 * SR): int(1.95 * SR) + len(s)] += s
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"]) for e in evs], [("parole en trop", "net")])

    def test_fin_de_consonne_ignoree(self):
        # « t » relâché : 40 ms de bruit aigu, 90 ms après la fin alignée du mot (au-delà de la marge de 120 ms
        # pour une part) : ce n'est pas un son parasite
        audio, mots = deux_mots(bruit(0.04, "haut", -26.0), a=0.59)
        self.assertEqual(evenements(audio, mots), [])

    def test_mot_etire(self):
        # « deux » (au milieu) aligné 1,3-1,7 s, mais la voix continue, voisée, jusqu'à 2,2 s
        audio, mots = deux_mots()
        audio = np.concatenate([audio, np.zeros(int(1.2 * SR), np.float32)])
        for debut, duree in ((1.7, 0.5), (2.6, 0.4)):
            s = harmonique(duree, 160.0)
            audio[int(debut * SR): int(debut * SR) + len(s)] += s
        mots = mots + [("trois", 2.6, 3.0)]
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"], e.get("mot")) for e in evs], [("mot étiré", "net", "deux")])

    def test_dernier_mot_prolonge(self):
        # Le dernier mot continue, voisé, 0,5 s après sa fin alignée : parole en trop
        audio, mots = deux_mots()
        audio = np.concatenate([audio, np.zeros(int(0.6 * SR), np.float32)])
        s = harmonique(0.5, 160.0)
        audio[int(1.7 * SR): int(1.7 * SR) + len(s)] += s
        evs = evenements(audio, mots)
        self.assertEqual([(e["type"], e["gravite"], e.get("mot")) for e in evs], [("parole en trop", "net", "deux")])

    def test_souffle_doux_sans_bruit_de_fond(self):
        # Silence numérique autour des mots (prises et passages réels) : le bruit de fond estimé tombait dans le
        # déclin des mots et le souffle doux (parole − 25 dB, −45 dBFS pour un passage publié) n'était plus vu
        # (ancienne borne : bruit de fond jusqu'à parole − 20 dB, seuil d'activité à parole − 10 dB)
        audio, mots = deux_mots(bruit(0.15, "bas", -45.0), silence_numerique=True)
        self.assertEqual([(e["type"], e["gravite"]) for e in evenements(audio, mots)], [("respiration", "leger")])
        ancien = artefacts.juge(artefacts.analyse(audio, SR, mots, {"bruit_max_db": -20.0}))
        self.assertEqual(ancien, [])

    def test_voix_craquee_ignoree(self):
        # « hommes, [voix craquée] onze » : après « un » (140 Hz), 0,35 s de voix craquée à 70 Hz (0,47 × la
        # hauteur de la parole), 28 dB sous la parole, collée au mot : ni vocalise ni mot étiré ni souffle
        audio, mots = deux_mots(harmonique(0.35, 70.0, -48.0), a=0.5, silence_numerique=True)
        self.assertEqual(evenements(audio, mots), [])

    def test_voyelle_grave_forte_reste_un_son(self):
        # Même son, mais fort (parole − 4 dB) : ce n'est plus une voix craquée naturelle (grognement)
        audio, mots = deux_mots(harmonique(0.35, 70.0, -24.0), a=0.5, silence_numerique=True)
        self.assertTrue(evenements(audio, mots))

    def test_relachement_t_apres_occlusion(self):
        # « t » final de « retraite ? » : 60 ms d'occlusion silencieuse, puis 80 ms de souffle aigu à −6 dB
        audio, mots = deux_mots(bruit(0.08, "haut", -26.0), a=0.56, silence_numerique=True)
        self.assertEqual(evenements(audio, mots), [])

    def test_texte_et_syllabes(self):
        self.assertEqual(artefacts.texte_alignement("à ce moment-là : vingt-cinq"), "à ce moment là : vingt cinq")
        self.assertEqual(artefacts.syllabes_mot("PIB"), 3)
        self.assertEqual(artefacts.syllabes_mot("retraite"), 2)


# Référence de la voix grave, retirée du site mais gardée pour ces tests (archives non suivies par git)
REF_GRAVE = ICI / "report" / "archives" / "voix-grave" / "refs" / "grave.wav"


@unittest.skipUnless(CACHE.exists() and REF_GRAVE.exists(),
                     f"modèle d'alignement absent du cache ({CACHE}) ou référence archivée absente ({REF_GRAVE})")
class Reference(unittest.TestCase):
    aligneur = None

    @classmethod
    def setUpClass(cls):
        cls.aligneur = artefacts.Aligneur()
        cls.ref = artefacts.lit_audio(REF_GRAVE)

    def detecte(self, audio):
        return artefacts.detecte(audio, SR, REF_TEXTE, self.aligneur)

    def test_reference_propre(self):
        d = self.detecte(self.ref)
        self.assertEqual(d["verdict"], "ok", [artefacts.decrit(e) for e in d["evenements"]])
        self.assertEqual(len(d["mots"]), 18)

    def test_reference_avec_souffle(self):
        # La pause après « Bonjour ! » (0,80-1,60 s) reçoit un souffle de 0,25 s, 6 dB sous la parole
        a = self.ref.copy()
        niveau = 10 * np.log10(np.mean(a[int(2.0 * SR): int(3.0 * SR)] ** 2))
        s = bruit(0.25, "bas", niveau - 6)
        a[int(1.05 * SR): int(1.05 * SR) + len(s)] += s
        d = self.detecte(a)
        nets = [e for e in d["evenements"] if e["gravite"] == "net"]
        self.assertEqual([e["type"] for e in nets], ["respiration"], [artefacts.decrit(e) for e in d["evenements"]])
        self.assertLess(abs(nets[0]["debut"] - 1.05), 0.1)
        self.assertEqual(d["verdict"], "refus")

    def test_reference_avec_rire(self):
        a = self.ref.copy()
        niveau = 10 * np.log10(np.mean(a[int(2.0 * SR): int(3.0 * SR)] ** 2))
        s = bouffees_voisees(niveau_db=niveau - 3)
        a[int(1.0 * SR): int(1.0 * SR) + len(s)] += s
        d = self.detecte(a)
        types = [e["type"] for e in d["evenements"] if e["gravite"] == "net"]
        self.assertTrue(types and types[0] in ("rire", "vocalise"), [artefacts.decrit(e) for e in d["evenements"]])
        self.assertEqual(d["verdict"], "refus")


PRISES = ICI / "report" / "prises"
ARCHIVES = ICI / "report" / "archives" / "essai-20261004-2226" / "prises"


@unittest.skipUnless(CACHE.exists() and PRISES.exists(), "modèle d'alignement ou prises gardées (report/prises/) absents")
class Prises(unittest.TestCase):
    """Sons repérés à la main (niveau, périodicité, alignement) dans des prises gardées de la voix grave
    (report/prises/, report/archives/ : WAV de travail non suivis par git ; sautés s'ils manquent)"""
    aligneur = None

    @classmethod
    def setUpClass(cls):
        cls.aligneur = artefacts.Aligneur()

    def nets(self, chemin, texte):
        if not chemin.exists():
            self.skipTest(f"{chemin.name} absent")
        d = artefacts.detecte(artefacts.lit_audio(chemin), SR, texte, self.aligneur)
        return [e for e in d["evenements"] if e["gravite"] == "net"], d

    def test_rire_en_tete(self):
        # Prise retenue (passage publié retraites-intro-01) : rire de 0,44 s avant « Un jour »
        nets, d = self.nets(PRISES / "grave/retraites-intro/retraites-intro-01-ph1-p16.wav",
                            "Un jour, vous arrêterez de travailler.")
        self.assertEqual([e["type"] for e in nets], ["rire"], [artefacts.decrit(e) for e in d["evenements"]])
        self.assertLess(nets[0]["debut"], 0.1)

    def test_souffle_apres_question(self):
        # Prise retenue (passage publié retraites-intro-09) : souffle aigu à +6,7 dB, 0,56 s après « toucher ? »
        nets, d = self.nets(PRISES / "grave/retraites-intro/retraites-intro-09-ph4-p6.wav", "Combien toucher ?")
        self.assertEqual(len(nets), 1, [artefacts.decrit(e) for e in d["evenements"]])
        self.assertAlmostEqual(nets[0]["debut"], 1.2, delta=0.1)

    def test_hah_souffle_a_demi_periodique(self):
        # « hah » soufflé à +5,7 dB, 0,14 s, périodicité 0,3 à 0,9, après « toucher ? »
        nets, d = self.nets(PRISES / "grave/retraites-intro/retraites-intro-09-ph4-p1.wav", "Combien toucher ?")
        self.assertEqual(len(nets), 1, [artefacts.decrit(e) for e in d["evenements"]])
        self.assertAlmostEqual(nets[0]["debut"], 1.14, delta=0.1)

    def test_souffle_dans_les_marges(self):
        # Archive (passage d'un bloc) : souffle de 0,18 s à −10 dB entre « travailler. » et « Qui », dont 40 ms
        # seulement hors des marges des deux mots
        nets, d = self.nets(ARCHIVES / "grave/retraites-intro/retraites-intro-01-p2.wav",
                            "Un jour, vous arrêterez de travailler. Qui vous versera alors votre retraite ?")
        self.assertIn("respiration", [e["type"] for e in nets], [artefacts.decrit(e) for e in d["evenements"]])

    def test_prise_propre(self):
        # Prise retenue sans son parasite : « Environ un euro sur quatre de toutes les dépenses publiques. »
        nets, d = self.nets(PRISES / "grave/retraites-intro/retraites-intro-05-ph1-p1.wav",
                            "Environ un euro sur quatre de toutes les dépenses publiques.")
        self.assertEqual(d["verdict"], "ok", [artefacts.decrit(e) for e in d["evenements"]])


if __name__ == "__main__":
    unittest.main()
