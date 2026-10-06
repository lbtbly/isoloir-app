# Découpage d'un passage en phrases, pour générer la voix phrase par phrase.
#
# Pourquoi : générée d'un bloc, une phrase affirmative suivie d'une question (« Un jour, vous arrêterez de
# travailler. Qui vous versera alors votre retraite ? ») prend parfois l'intonation de la question dès la
# première phrase (voix grave, prise retenue de l'essai précédent : « travailler. » monte de +1,2 à
# +7,8 demi-tons avant une pause de 0,1 s). Chaque phrase est donc générée seule, avec sa ponctuation
# finale, puis le passage est réassemblé avec une pause naturelle entre les phrases.
#
# Fin de phrase : « . », « ! », « ? », « … » (ou « ... »), suivis d'une espace ou de la fin du texte.
# Ne terminent PAS une phrase :
# - un sigle épelé à points (« P.I.B. », « D.P.E. ») : deux lettres isolées pointées ou plus ;
# - une lettre isolée suivie d'un point (initiale, « M. »), SAUF si le mot suivant est un mot-outil qui
#   ouvre ordinairement une phrase (« Il », « Elle », « Le », « C'est »…) : « ou C deux P. Il s'ouvre quand…»
#   (retraites-penibilite-03) est bien une fin de phrase, « M. Durand » n'en est pas une. « M. » n'en est
#   jamais une.
# « : » et « ; » restent à l'intérieur de la phrase.
import re

# Pause entre deux phrases, en secondes, selon la ponctuation qui termine la première. Réglage à l'écoute des
# mesures (détecteur de pause de clean.py, trames à plus de 45 dB sous la crête) :
# - voix aiguë retenue (validée à l'écoute), « …de travailler. Qui… » : 0,27 s ; voix grave jugée
#   fautive au même endroit : 0,08 s ;
# - pauses de virgule dans les références : 0,15 à 0,26 s ; une fin de phrase doit s'en distinguer ;
# - après « Bonjour ! » dans la référence de la voix aiguë : 0,36 s (celle de la voix grave, 0,80 s, marque une
#   salutation).
# D'où 0,30 s après « . » et « ! », 0,35 s après « ? » (un temps pour que la question porte), 0,40 s après
# « … » (suspension).
PAUSES = {".": 0.30, "!": 0.30, "?": 0.35, "…": 0.40}

# Mots-outils qui ouvrent une phrase (pour départager « P. Il s'ouvre » de « M. Durand »)
OUVRANTS = {
    "il", "elle", "ils", "elles", "on", "nous", "vous", "je", "tu", "ce", "c'est", "c'était", "cela", "ça",
    "le", "la", "les", "l'", "un", "une", "des", "du", "de", "en", "et", "mais", "or", "donc", "pour", "par",
    "dans", "depuis", "avec", "sans", "sur", "sous", "alors", "ainsi", "aujourd'hui", "cette", "cet", "ces",
    "son", "sa", "ses", "leur", "leurs", "qui", "que", "quand", "si", "à", "au", "aux", "tout", "tous", "toutes",
    "chaque", "plus", "moins", "selon", "entre", "après", "avant", "y", "qu'", "d'", "s'", "n'", "j'",
}

_FIN = re.compile(r"(\.\.\.|…|[.!?]+)([»\)\"']*)(?=\s|$)")


def _abreviation(texte, debut_ponct):
    """Le point en position debut_ponct suit-il une lettre isolée (initiale, sigle épelé) ?"""
    avant = texte[:debut_ponct]
    m = re.search(r"(?:^|[\s(\-'])([A-Za-zÀ-ÖØ-öø-ÿ])$", avant)
    if m:
        return "lettre"
    # Dernière lettre d'un sigle à points : « P.I.B » (le point final est à debut_ponct)
    if re.search(r"(?:^|[\s(\-'])(?:[A-Za-zÀ-ÖØ-öø-ÿ]\.){1,}[A-Za-zÀ-ÖØ-öø-ÿ]$", avant):
        return "sigle"
    return None


def decoupe(texte):
    """Phrases d'un passage : liste de (phrase, ponctuation finale). La ponctuation finale vaut « . », « ! »,
    « ? », « … » ou « » (pas de ponctuation finale : dernière phrase sans point)."""
    texte = texte.strip()
    phrases = []
    debut = 0
    for m in _FIN.finditer(texte):
        ponct = m.group(1)
        if ponct[0] == ".":
            ponct = "…" if ponct == "..." else "."
        else:
            ponct = "?" if "?" in ponct else ("!" if "!" in ponct else "…" if "…" in ponct else ".")
        if ponct == ".":
            sorte = _abreviation(texte, m.start(1))
            if sorte == "sigle":
                continue
            if sorte == "lettre":
                lettre = texte[m.start(1) - 1]
                suite = re.match(r"\s+([\wÀ-ÿ']+)", texte[m.end():])
                mot = suite.group(1).lower() if suite else ""
                if "'" in mot and mot not in OUVRANTS:
                    mot = mot.split("'")[0] + "'"  # « l'employeur » → « l' »
                # Fin de texte, ou mot-outil d'ouverture : vraie fin de phrase (jamais après « M. »)
                if lettre == "M" or not (suite is None or mot in OUVRANTS):
                    continue
        phrase = texte[debut: m.end()].strip()
        if phrase:
            phrases.append((phrase, ponct))
        debut = m.end()
    reste = texte[debut:].strip()
    if reste:
        phrases.append((reste, ""))
    # Une phrase d'un ou deux mots (« Non. », « Oui. », « Et vous ? ») générée seule sort souvent chuchotée,
    # vide ou criée : elle est dite d'un même souffle avec la phrase qui suit
    fusion = []
    for phrase, ponct in phrases:
        if fusion and fusion[-1][1] in (".", "!", "?") and len(fusion[-1][0].split()) <= 2:
            fusion[-1] = (fusion[-1][0] + " " + phrase, ponct)
        else:
            fusion.append((phrase, ponct))
    return fusion


def est_question(ponct):
    return ponct == "?"


def pause_apres(ponct):
    """Pause (s) entre une phrase terminée par ponct et la suivante"""
    return PAUSES.get(ponct, PAUSES["."])


if __name__ == "__main__":
    # Vérifications du découpage
    cas = {
        "Un jour, vous arrêterez de travailler. Qui vous versera alors votre retraite ?":
            ["Un jour, vous arrêterez de travailler.", "Qui vous versera alors votre retraite ?"],
        "C'est quatorze virgule un pour cent du P.I.B., la richesse produite en un an.":
            ["C'est quatorze virgule un pour cent du P.I.B., la richesse produite en un an."],
        "Un nouveau calcul du D.P.E., depuis deux mille vingt-six, en fait sortir environ sept cent mille.":
            ["Un nouveau calcul du D.P.E., depuis deux mille vingt-six, en fait sortir environ sept cent mille."],
        "Le P.I.B. progresse. Ensuite, on verra.": ["Le P.I.B. progresse.", "Ensuite, on verra."],
        "Un outil existe : le compte professionnel de prévention, ou C deux P. Il s'ouvre quand l'employeur déclare.":
            ["Un outil existe : le compte professionnel de prévention, ou C deux P.", "Il s'ouvre quand l'employeur déclare."],
        "M. Durand a dit oui. J. Martin aussi.": ["M. Durand a dit oui.", "J. Martin aussi."],
        "Pour partir, il faut avoir l'âge minimum ; pour une pension sans réduction, assez de trimestres. En deux mille vingt-cinq, on part.":
            ["Pour partir, il faut avoir l'âge minimum ; pour une pension sans réduction, assez de trimestres.", "En deux mille vingt-cinq, on part."],
        "Alors, quatre questions se posent. À quel âge partir ? Qui paie, et comment ? Combien toucher ?":
            ["Alors, quatre questions se posent.", "À quel âge partir ?", "Qui paie, et comment ?", "Combien toucher ?"],
        "Et après… on verra ! Vraiment ?! Oui": ["Et après…", "on verra !", "Vraiment ?!", "Oui"],
        "Environ un euro sur quatre de toutes les dépenses publiques.": ["Environ un euro sur quatre de toutes les dépenses publiques."],
        "Il gagne 3.5 fois plus. Fin": ["Il gagne 3.5 fois plus.", "Fin"],
    }
    echecs = 0
    for texte, attendu in cas.items():
        obtenu = [p for p, _ in decoupe(texte)]
        if obtenu != attendu:
            echecs += 1
            print(f"ÉCHEC « {texte} »\n  attendu {attendu}\n  obtenu  {obtenu}")
    print(f"{len(cas) - echecs}/{len(cas)} cas justes")
