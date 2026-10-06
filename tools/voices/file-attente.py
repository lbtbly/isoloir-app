#!/usr/bin/env python3
# File d'attente de la génération des voix : un démon qui génère la voix des séries thème par thème, à mesure
# qu'elles sont prêtes, sans jamais lancer deux generate.py à la fois.
#
# Plusieurs agents écrivent les séries en parallèle (src/ui/videos/series/<thème>.ts) ; quand une série est
# vérifiée, son agent de vérification pose tools/voices/queue/<thème>.ready (fichier vide ou non, seul compte
# son nom ; le reposer plus tard, après une correction, relance le thème). Toutes les 60 s, le démon :
#   1. prend le plus ancien <thème>.ready en attente (jamais fait, ou reposé depuis le dernier succès) et lance
#      `generate.py --voice aigue --only <thème>` (les passages déjà à jour sont gardés : un thème reposé ne
#      régénère que ce qui a changé) ;
#      succès → <thème>.done (résumé JSON : passages générés, alertes, rapport) ;
#      échec → nouvel essai 10 minutes plus tard au plus tôt, 3 essais au plus (<thème>.essais), puis
#      <thème>.echec ; tout est journalisé ;
#      une autre génération en cours (lancée à la main) → on attend qu'elle finisse, sans compter d'essai ;
#   2. quand les 23 thèmes de la banque sont faits, ou quand queue/FIN existe et que plus rien n'est en
#      attente : la passe finale, dans l'ordre
#        generate.py --voice aigue                              (comble tout passage manquant ou périmé)
#        generate.py --scan --voice aigue                       (contrôle des sons parasites)
#        generate.py --redo-flagged --voice aigue --extra-takes 8
#        generate.py --scan --voice aigue --listen .impeccable/voix/controle-final-toutes-videos.m4a
#      puis écrit queue/TERMINE (résumé : passages par vidéo, alertes, sons repérés) et s'arrête.
#
# Journal : tools/voices/report/file-attente.log (ce que le démon écrit sur sa sortie, à rediriger là) ; la
# sortie complète de la génération en cours : report/file-attente-en-cours.log (le détail de chaque prise
# est aussi dans report/journal.log, écrit par generate.py). queue/demon.pid : le démon en cours ; un second
# démon refuse de démarrer. queue/ n'est pas suivi par git.
#
# Lancement (détaché, sans mise en veille de la machine) :
#   nohup caffeinate -i ~/isoloir-tts/bin/python tools/voices/file-attente.py >> tools/voices/report/file-attente.log 2>&1 &
# Arrêt : kill <pid de queue/demon.pid> (la génération en cours reçoit Ctrl-C : l'inventaire reste à jour
# jusqu'au dernier passage terminé). Relancer après TERMINE : effacer queue/TERMINE.
# Options : --une-fois (un seul tour, pour essai), --intervalle N (secondes, 60).
import argparse
import json
import os
import signal
import subprocess
import sys
import time
from collections import deque
from datetime import datetime
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
QUEUE = ICI / "queue"
RAPPORTS = ICI / "report"
EN_COURS = RAPPORTS / "file-attente-en-cours.log"
GENERATE = ICI / "generate.py"
INVENTAIRE = RACINE / "src" / "ui" / "videos" / "audio-files.json"
BANQUE = RACINE / "research" / "choisir-2027" / "bank.json"
ECOUTE_FINALE = RACINE / ".impeccable" / "voix" / "controle-final-toutes-videos.m4a"
PID = QUEUE / "demon.pid"
FIN = QUEUE / "FIN"
TERMINE = QUEUE / "TERMINE"

VOIX = "aigue"
INTERVALLE_S = 60
ESSAIS_MAX = 3
DELAI_REESSAI_S = 600  # après un échec, 10 minutes au moins avant le prochain essai du même thème
OCCUPE = "Une autre exécution de generate.py est en cours"

enfant = None  # le generate.py en cours, pour le prévenir si le démon est arrêté


def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)


def lit_json(chemin, defaut=None):
    try:
        return json.loads(Path(chemin).read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return defaut


def ecrit_json(chemin, data):
    tmp = Path(chemin).with_name(Path(chemin).name + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, chemin)


def themes():
    """Les thèmes de la banque (23), dans l'ordre de bank.json"""
    return [t["id"] for t in lit_json(BANQUE, {})["bank"]["topics"]]


def vivant(pid):
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def commande_de(pid):
    return subprocess.run(["ps", "-o", "command=", "-p", str(pid)], capture_output=True, text=True).stdout.strip()


def autres_generations():
    """Les generate.py en cours (lancés à la main, ou laissés par un démon précédent)"""
    sortie = subprocess.run(["pgrep", "-ilf", r"python.*generate\.py"], capture_output=True, text=True).stdout
    return [ligne.strip() for ligne in sortie.splitlines() if ligne.strip()]


def mtime(chemin):
    try:
        return Path(chemin).stat().st_mtime
    except FileNotFoundError:
        return None


def etat_theme(t):
    """« attente » (à lancer maintenant), « reessai » (en attente d'un nouvel essai), « fait », « echec »,
    ou None (pas de .ready)"""
    pret = mtime(QUEUE / f"{t}.ready")
    if pret is None:
        return None
    fait = lit_json(QUEUE / f"{t}.done")
    if fait and fait.get("ready_mtime") == pret:
        return "fait"
    essais = lit_json(QUEUE / f"{t}.essais")
    if essais and essais.get("ready_mtime") == pret:
        if essais.get("essais", 0) >= ESSAIS_MAX:
            return "echec"
        if time.time() - essais.get("dernier_essai", 0) < DELAI_REESSAI_S:
            return "reessai"
    return "attente"


def lance(args, titre):
    """Lance generate.py avec ces arguments ; sa sortie va dans report/file-attente-en-cours.log, les dernières
    lignes sont gardées pour le journal. Rend (code de sortie, dernières lignes, durée en secondes)."""
    global enfant
    cmd = [sys.executable, str(GENERATE), *args]
    log(f"→ {titre} : generate.py {' '.join(args)}")
    debut = time.time()
    queue_lignes = deque(maxlen=40)
    RAPPORTS.mkdir(parents=True, exist_ok=True)
    with open(EN_COURS, "w", encoding="utf-8") as f:
        f.write(f"=== {datetime.now():%Y-%m-%d %H:%M:%S} : generate.py {' '.join(args)}\n")
        enfant = subprocess.Popen(cmd, cwd=RACINE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                                  bufsize=1, env={**os.environ, "PYTHONUNBUFFERED": "1"})
        for ligne in enfant.stdout:
            f.write(ligne)
            f.flush()
            queue_lignes.append(ligne.rstrip("\n"))
        code = enfant.wait()
        enfant = None
    return code, list(queue_lignes), time.time() - debut


def occupe(lignes):
    return any(OCCUPE in ligne for ligne in lignes)


def resume_rapport(depuis):
    """Le dernier rapport de génération écrit après « depuis » (report/dernier.json) : passages générés, alertes"""
    r = lit_json(RAPPORTS / "dernier.json")
    if not r or mtime(RAPPORTS / "dernier.json") < depuis:
        return {"passages_generes": 0, "alertes": [], "rapport": None}
    passages = [p["passage"] for v in r.get("voix", {}).values() for p in v.get("passages", [])]
    return {"passages_generes": len(passages), "alertes": r.get("alertes", []), "rapport": r.get("date"),
            "interrompu": r.get("interrompu", False)}


def traite(t):
    """Lance la génération d'un thème : « fait », « echec », ou « attente » (une autre génération occupe la
    machine : rien n'a été tenté)"""
    pret = mtime(QUEUE / f"{t}.ready")
    autres = autres_generations()
    if autres:
        log(f"{t} : une autre génération est en cours, on attend ({autres[0]})")
        return "attente"
    debut = time.time()
    code, lignes, duree = lance(["--voice", VOIX, "--only", t], f"thème {t}")
    if code != 0 and occupe(lignes):
        log(f"{t} : generate.py a refusé de démarrer (autre génération en cours) ; essai non compté")
        return "attente"
    if code == 0:
        res = resume_rapport(debut)
        ecrit_json(QUEUE / f"{t}.done", {"theme": t, "ready_mtime": pret, "date": datetime.now().isoformat(timespec="seconds"),
                                         "duree_s": round(duree), **res})
        (QUEUE / f"{t}.essais").unlink(missing_ok=True)
        (QUEUE / f"{t}.echec").unlink(missing_ok=True)
        log(f"✓ {t} : {res['passages_generes']} passage(s) généré(s) en {duree / 60:.1f} min, "
            f"{len(res['alertes'])} alerte(s) → queue/{t}.done")
        return "fait"
    essais = lit_json(QUEUE / f"{t}.essais")
    if not essais or essais.get("ready_mtime") != pret:
        essais = {"theme": t, "ready_mtime": pret, "essais": 0, "erreurs": []}
    essais["essais"] += 1
    essais["dernier_essai"] = time.time()
    essais["erreurs"].append({"date": datetime.now().isoformat(timespec="seconds"), "code": code, "fin": lignes[-12:]})
    ecrit_json(QUEUE / f"{t}.essais", essais)
    log(f"✗ {t} : échec (code {code}, essai {essais['essais']}/{ESSAIS_MAX}) ; dernières lignes :\n    "
        + "\n    ".join(lignes[-12:]))
    if essais["essais"] >= ESSAIS_MAX:
        (QUEUE / f"{t}.echec").write_text(json.dumps(essais, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        log(f"✗ {t} : abandonné après {ESSAIS_MAX} essais → queue/{t}.echec (reposer {t}.ready pour réessayer)")
    else:
        log(f"  {t} : nouvel essai dans {DELAI_REESSAI_S // 60} min au plus tôt")
    return "echec"


def exporte_series():
    node = os.environ.get("NODE") or "node"
    p = subprocess.run([node, str(ICI / "export-series.mjs")], cwd=RACINE, capture_output=True, text=True)
    if p.returncode != 0:
        return None
    return json.loads(p.stdout)["series"]


def passe_finale(debut_demon):
    """generate.py complet, contrôle, reprise des passages marqués, contrôle avec compilation d'écoute"""
    etapes = [
        (["--voice", VOIX], "génération complète (passages manquants ou périmés)"),
        (["--scan", "--voice", VOIX], "contrôle des sons parasites"),
        (["--redo-flagged", "--voice", VOIX, "--extra-takes", "8"], "reprise des passages marqués à refaire"),
        (["--scan", "--voice", VOIX, "--listen", str(ECOUTE_FINALE)], "contrôle final et compilation d'écoute"),
    ]
    ECOUTE_FINALE.parent.mkdir(parents=True, exist_ok=True)
    bilan = []
    for args, titre in etapes:
        for essai in range(1, ESSAIS_MAX + 1):
            while autres_generations():
                log(f"passe finale ({titre}) : une autre génération est en cours, on attend")
                time.sleep(INTERVALLE_S)
            code, lignes, duree = lance(args, f"passe finale, {titre}")
            if code != 0 and occupe(lignes):
                time.sleep(INTERVALLE_S)
                continue
            if code == 0:
                log(f"✓ {titre} ({duree / 60:.1f} min)")
                bilan.append((titre, "ok", duree))
                break
            log(f"✗ {titre} : échec (code {code}, essai {essai}/{ESSAIS_MAX}) ; dernières lignes :\n    " + "\n    ".join(lignes[-12:]))
            if essai == ESSAIS_MAX:
                bilan.append((titre, f"échec (code {code})", duree))
            else:
                time.sleep(INTERVALLE_S)
    ecrit_termine(bilan, debut_demon)


def ecrit_termine(bilan, debut_demon):
    lignes = [f"File d'attente des voix : terminé le {datetime.now():%Y-%m-%d %H:%M:%S} (voix {VOIX})", ""]
    lignes.append("Passe finale :")
    lignes += [f"  {titre} : {etat} ({duree / 60:.1f} min)" for titre, etat, duree in bilan]

    # Passages par vidéo : inscrits à l'inventaire et à jour (empreinte du texte actuel), sur le total
    series = exporte_series()
    inv = (lit_json(INVENTAIRE, {}) or {}).get("voices", {}).get(VOIX, {})
    lignes += ["", "Passages par vidéo (avec voix à jour / passages) :"]
    total = avec = 0
    if series is None:
        lignes.append("  export des séries impossible (node tools/voices/export-series.mjs)")
    else:
        for s in series:
            for v in s["videos"]:
                n = len(v["segments"])
                ok = sum(1 for seg in v["segments"] if (inv.get(v["id"], {}).get(seg["id"]) or {}).get("hash") == seg["print"])
                total += n
                avec += ok
                lignes.append(f"  {v['id']:<40} {ok:>3} / {n:<3}" + ("" if ok == n else "  ← incomplet"))
        lignes.append(f"  Total : {avec} / {total} passages, {sum(len(s['videos']) for s in series)} vidéos, "
                      f"{len(series)} séries")

    # Thèmes : faits, abandonnés, jamais posés
    lignes += ["", "Thèmes :"]
    for t in themes():
        e = etat_theme(t)
        fait = lit_json(QUEUE / f"{t}.done") or {}
        lignes.append(f"  {t:<22} {e or 'jamais posé'}"
                      + (f" ({fait.get('passages_generes', 0)} générés, {len(fait.get('alertes', []))} alertes)" if e == "fait" else ""))

    # Alertes : celles des rapports écrits depuis le lancement du démon
    alertes = []
    for f in sorted(RAPPORTS.glob("rapport-*.json")):
        if (mtime(f) or 0) >= debut_demon:
            r = lit_json(f, {})
            alertes += [(f.name, a) for a in r.get("alertes", [])]
    lignes += ["", f"Alertes des rapports de génération depuis le lancement ({len(alertes)}) :"]
    lignes += [f"  {nom} : {a.get('voix')}/{a.get('passage')} : {a.get('alerte')}" for nom, a in alertes[:200]]
    if len(alertes) > 200:
        lignes.append(f"  … et {len(alertes) - 200} autres (report/rapport-*.json)")

    # Sons repérés : le dernier contrôle (scan)
    scans = sorted(RAPPORTS.glob("scan-*.json"))
    scan = lit_json(scans[-1], {}) if scans else {}
    lignes += ["", f"Sons parasites, dernier contrôle ({scans[-1].name if scans else 'aucun'}) :"]
    if scan:
        passages = scan.get("passages", [])
        sons = [(p["passage"], e) for p in passages for e in p.get("evenements", [])]
        nets = [x for x in sons if x[1].get("gravite") == "net"]
        lignes.append(f"  {len(passages)} passages contrôlés, {len(sons)} sons repérés dont {len(nets)} nets ; "
                      f"à refaire : {', '.join(scan.get('a_refaire', [])) or 'aucun'}")
        for sid, e in nets[:100]:
            lignes.append(f"  net : {sid} {e.get('type')} {e.get('debut', 0):.2f}-{e.get('fin', 0):.2f} s")
    reste = (lit_json(RAPPORTS / "a-refaire.json", {}) or {}).get("passages", {})
    lignes.append(f"  Liste report/a-refaire.json : {', '.join(sorted(reste)) or 'vide'}")
    if ECOUTE_FINALE.exists():
        lignes.append(f"  Compilation d'écoute : {ECOUTE_FINALE.relative_to(RACINE)} "
                      f"(liste : {ECOUTE_FINALE.with_suffix('.txt').relative_to(RACINE)})")
    TERMINE.write_text("\n".join(lignes) + "\n", encoding="utf-8")
    log("TERMINE écrit (queue/TERMINE) :\n" + "\n".join(lignes))


def fini_ou_fin():
    """Les 23 thèmes faits, ou FIN posé et plus rien en attente (ni à lancer, ni à réessayer)"""
    etats = {t: etat_theme(t) for t in themes()}
    if etats and all(e == "fait" for e in etats.values()):
        return "les 23 thèmes sont faits"
    if FIN.exists() and not any(e in ("attente", "reessai") for e in etats.values()):
        return "queue/FIN posé, plus rien en attente"
    return None


def arret(signum, _frame):
    log(f"Arrêt demandé (signal {signum})")
    if enfant and enfant.poll() is None:
        log("  la génération en cours reçoit Ctrl-C (l'inventaire reste à jour jusqu'au dernier passage terminé)")
        enfant.send_signal(signal.SIGINT)
        try:
            enfant.wait(timeout=120)
        except subprocess.TimeoutExpired:
            enfant.kill()
    PID.unlink(missing_ok=True)
    sys.exit(0)


def main():
    ap = argparse.ArgumentParser(description="File d'attente de la génération des voix (un thème à la fois)")
    ap.add_argument("--une-fois", action="store_true", help="un seul tour de la boucle (essai)")
    ap.add_argument("--intervalle", type=int, default=INTERVALLE_S, help=f"secondes entre deux tours ({INTERVALLE_S})")
    args = ap.parse_args()
    QUEUE.mkdir(parents=True, exist_ok=True)
    if TERMINE.exists():
        sys.exit("queue/TERMINE existe : la file est terminée (l'effacer pour relancer)")
    ancien = PID.read_text().strip() if PID.exists() else ""
    if ancien.isdigit() and int(ancien) != os.getpid() and vivant(int(ancien)) and "file-attente" in commande_de(int(ancien)):
        sys.exit(f"Un démon tourne déjà (pid {ancien}, queue/demon.pid)")
    PID.write_text(f"{os.getpid()}\n")
    signal.signal(signal.SIGTERM, arret)
    signal.signal(signal.SIGINT, arret)
    debut = time.time()
    log(f"Démon lancé (pid {os.getpid()}), file {QUEUE.relative_to(RACINE)}, voix {VOIX}, tour toutes les "
        f"{args.intervalle} s ; thèmes de la banque : {len(themes())}")
    vus = {}
    try:
        while True:
            etats = {t: etat_theme(t) for t in themes()}
            inconnus = sorted(p.stem for p in QUEUE.glob("*.ready") if p.stem not in etats)
            for t in inconnus:
                if vus.get(t) != "inconnu":
                    log(f"⚠ queue/{t}.ready : thème inconnu de la banque, ignoré")
                    vus[t] = "inconnu"
            for t, e in etats.items():
                if e and vus.get(t) != e:
                    log(f"{t} : {e}")
                    vus[t] = e
            # Le plus ancien .ready en attente d'abord
            a_lancer = sorted((t for t, e in etats.items() if e == "attente"), key=lambda t: mtime(QUEUE / f"{t}.ready"))
            if a_lancer:
                issue = traite(a_lancer[0])
                vus.pop(a_lancer[0], None)
                if args.une_fois:
                    break
                if issue == "attente":
                    time.sleep(args.intervalle)
                continue  # un thème fini (ou en échec) : on regarde aussitôt s'il en reste
            raison = fini_ou_fin()
            if raison:
                log(f"Passe finale : {raison}")
                passe_finale(debut)
                break
            if args.une_fois:
                break
            time.sleep(args.intervalle)
    finally:
        if PID.exists() and PID.read_text().strip() == str(os.getpid()):
            PID.unlink()
    log("Démon arrêté")


if __name__ == "__main__":
    main()
