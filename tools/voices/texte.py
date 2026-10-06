# Le texte que la voix de synthèse lit : celui d'un passage (« spoken » s'il existe, sinon « say »), mis en
# forme pour la lecture à voix haute. Les sous-titres, eux, gardent la typographie du « say ».
#
# - espaces insécables (U+00A0, U+202F) ramenées à des espaces ordinaires, apostrophe typographique à
#   l'apostrophe droite, guillemets français retirés (la voix ne les prononce pas) ;
# - quand le passage n'a pas de « spoken », les nombres sont écrits en lettres (« 17,3 » → « dix-sept virgule
#   trois », « 1 705 » → « mille sept cent cinq », « 1er » → « premier », « 2e » → « deuxième », « XXe » →
#   « vingtième », « % » → « pour cent », « 5,90 € » → « cinq euros quatre-vingt-dix », « 1,8 Md€ » → « un
#   virgule huit milliard d'euros », « 60-64 » → « soixante à soixante-quatre », « −5 » → « moins cinq ») :
#   lus en chiffres, ils sont la première source d'erreurs du modèle. Pour un cas que ces règles lisent mal,
#   écrire un « spoken » dans series.ts plutôt que d'enrichir les règles.
#
# Sert aussi à compter les syllabes, pour repérer une prise trop courte (mot sauté) ou trop longue
# (bégaiement, silence).
import re
from decimal import Decimal

UNITES = [
    "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
    "onze", "douze", "treize", "quatorze", "quinze", "seize",
]
DIZAINES = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"]

# Noms féminins qui suivent un « 1 » dans les textes : « 1 demande sur 7 » se dit « une demande »
FEMININS = {"demande", "résidence", "personne", "année", "fois", "semaine", "heure", "part", "maison", "voix"}

# Sigles contenant un chiffre, et autres graphies que le modèle lit mal : remplacés tels quels
GRAPHIES = {
    "C2P": "cé deux pé",
}


def _moins_de_cent(n):
    if n < 17:
        return UNITES[n]
    if n < 20:
        return "dix-" + UNITES[n - 10]
    if n < 70:
        d, u = divmod(n, 10)
        if u == 0:
            return DIZAINES[d]
        return DIZAINES[d] + (" et un" if u == 1 else "-" + UNITES[u])
    if n < 80:
        return "soixante et onze" if n == 71 else "soixante-" + _moins_de_cent(n - 60)
    if n == 80:
        return "quatre-vingts"
    return "quatre-vingt-" + _moins_de_cent(n - 80)


def _moins_de_mille(n):
    c, r = divmod(n, 100)
    if c == 0:
        return _moins_de_cent(r)
    tete = "cent" if c == 1 else UNITES[c] + (" cents" if r == 0 else " cent")
    return tete if r == 0 else tete + " " + _moins_de_cent(r)


def nombre(n):
    """Un entier positif en toutes lettres (orthographe traditionnelle, sans importance pour la voix)"""
    if n == 0:
        return "zéro"
    morceaux = []
    for valeur, sing, plur in ((10**9, "un milliard", "milliards"), (10**6, "un million", "millions")):
        q, n = divmod(n, valeur)
        if q:
            morceaux.append(sing if q == 1 else f"{nombre(q)} {plur}")
    q, n = divmod(n, 1000)
    if q:
        # « mille » est invariable, et « cents », « vingts » perdent leur s devant lui
        morceaux.append("mille" if q == 1 else re.sub(r"(cent|vingt)s$", r"\1", _moins_de_mille(q)) + " mille")
    if n:
        morceaux.append(_moins_de_mille(n))
    return " ".join(morceaux)


def _decimal(entier, frac):
    mots = nombre(int(entier))
    if frac is None:
        return mots
    zeros = len(frac) - len(frac.lstrip("0"))
    reste = frac.lstrip("0")
    apres = " ".join(["zéro"] * zeros + ([nombre(int(reste))] if reste else []))
    return f"{mots} virgule {apres}"


def ordinal(n):
    """Un ordinal en toutes lettres : 2 → « deuxième », 21 → « vingt et unième », 80 → « quatre-vingtième »"""
    if n == 1:
        return "premier"
    mots = re.sub(r"(cent|vingt|million|milliard)s$", r"\1", nombre(n))
    if mots.endswith("cinq"):
        return mots + "uième"
    if mots.endswith("neuf"):
        return mots[:-1] + "vième"
    return (mots[:-1] if mots.endswith("e") else mots) + "ième"


ROMAINS = {"I": 1, "V": 5, "X": 10}


def _romain(chiffres):
    total = 0
    for i, c in enumerate(chiffres):
        v = ROMAINS[c]
        total += -v if i + 1 < len(chiffres) and ROMAINS[chiffres[i + 1]] > v else v
    return total


# Un nombre : groupes de milliers séparés par une espace insécable (fine ou non), décimales après la virgule
NOMBRE_MOTIF = r"(?<![\w,])(\d{1,3}(?:[\u202f\u00a0]\d{3})+|\d+)(?:,(\d+))?(?!\d)"
NOMBRE = re.compile(NOMBRE_MOTIF)

# Un nombre suivi d'une unité abrégée ou du mot « euro(s) » : l'unité s'accorde au singulier sous 2 (« 1,8
# milliard », comme dans les sous-titres), au pluriel à partir de 2
UNITES_ABREGEES = {
    "Md€": ("milliard d'euros", "milliards d'euros"),
    "M€": ("million d'euros", "millions d'euros"),
    "€/m²": ("euro le mètre carré", "euros le mètre carré"),
    "m²": ("mètre carré", "mètres carrés"),
}
AVEC_UNITE = re.compile(NOMBRE_MOTIF + r"[\s\u00a0\u202f]*(Md€|M€|k€|€/m²|m²|€|euros?\b)")


def _avec_unite(m):
    entier, frac, unite = re.sub(r"[\u202f\u00a0]", "", m.group(1)), m.group(2), m.group(3)
    valeur = Decimal(f"{entier}.{frac}" if frac else entier)
    if unite == "k€":
        # « 10 k€ » → « dix mille euros », « 1,5 k€ » → « mille cinq cents euros »
        milliers = valeur * 1000
        if milliers == milliers.to_integral_value():
            return f"{nombre(int(milliers))} euros"
        return f"{_decimal(entier, frac)} mille euros"
    if unite in UNITES_ABREGEES:
        singulier, pluriel = UNITES_ABREGEES[unite]
        return f"{_decimal(entier, frac)} {singulier if valeur < 2 else pluriel}"
    # Un prix : « 5,90 € » se dit « cinq euros quatre-vingt-dix », « 0,90 € » « quatre-vingt-dix centimes »
    if frac is None or len(frac) <= 2:
        euros, centimes = int(entier), int((frac or "0").ljust(2, "0"))
        if euros == 0 and centimes:
            return f"{nombre(centimes)} centime" + ("s" if centimes > 1 else "")
        dits = f"{nombre(euros)} euro" + ("s" if euros > 1 else "")
        return dits + (f" {nombre(centimes)}" if centimes else "")
    return f"{_decimal(entier, frac)} euros"


def en_lettres(texte):
    """Écrit en lettres les nombres d'un texte, avec quelques règles d'usage (1er, 2e, %, €, 1 + nom féminin)"""
    for graphie, dite in GRAPHIES.items():
        texte = re.sub(rf"\b{re.escape(graphie)}\b", dite, texte)
    texte = re.sub(r"\b1er\b", "premier", texte)
    texte = re.sub(r"\b1(?:re|ère)\b", "première", texte)
    # Ordinaux : « 2e », « 3ème » → « deuxième », « troisième » ; « XXe siècle » → « vingtième siècle »
    texte = re.sub(r"(?<![\w,])(\d+)(?:e|ème)(s?)\b", lambda m: ordinal(int(m.group(1))) + m.group(2), texte)
    texte = re.sub(r"\b([IVX]+)(?:e|ème)(s?)\b", lambda m: ordinal(_romain(m.group(1))) + m.group(2), texte)
    # Intervalle : « 60-64 ans » → « 60 à 64 ans » (sinon « soixante-soixante-quatre »)
    texte = re.sub(r"(?<=\d)[-\u2010\u2011\u2013](?=\d)", " à ", texte)
    # Signe devant un nombre : « +3,4 » → « plus 3,4 », « −5,1 » → « moins 5,1 »
    texte = re.sub(r"(?<![^\s\u00a0\u202f(])\+(?=\d)", "plus ", texte)
    texte = re.sub(r"(?<![^\s\u00a0\u202f(])[\u2212\u2013-](?=\d)", "moins ", texte)

    def remplace(m):
        entier = re.sub(r"[\u202f\u00a0]", "", m.group(1))
        frac = m.group(2)
        mots = _decimal(entier, frac)
        # « 1 demande » → « une demande », « 21 personnes » → « vingt et une personnes »
        if frac is None and mots.endswith("un"):
            suite = re.match(r"[\s\u00a0\u202f]+(\w+)", texte[m.end():])
            mot = suite.group(1).lower() if suite else ""
            if mot in FEMININS or (mot.endswith("s") and mot[:-1] in FEMININS):
                mots = mots[:-2] + "une"
        return mots

    # Un nombre et son unité d'abord (« 5,90 € », « 1,8 Md€ »), puis les nombres seuls
    texte = AVEC_UNITE.sub(_avec_unite, texte)
    texte = NOMBRE.sub(remplace, texte)
    # « de 1 % » se dit « d'un pour cent »
    texte = re.sub(r"\bde (une?)\b", r"d'\1", texte)
    texte = re.sub(r"[\s\u00a0\u202f]*%", " pour cent", texte)
    texte = re.sub(r"[\s\u00a0\u202f]*€", " euros", texte)
    return texte


def a_dire(segment):
    """Le texte envoyé au modèle pour un passage, et s'il a été réécrit automatiquement (pas de « spoken »)"""
    spoken = segment.get("spoken")
    auto = not (isinstance(spoken, str) and spoken.strip())
    texte = segment["say"] if auto else spoken
    if auto:
        texte = en_lettres(texte)
    texte = texte.replace("’", "'").replace("ʼ", "'")
    texte = re.sub(r"«[\s\u00a0\u202f]*", "", texte)
    texte = re.sub(r"[\s\u00a0\u202f]*»", "", texte)
    texte = re.sub(r"\s+[—–]\s+", ", ", texte)
    texte = re.sub(r"[\u00a0\u202f]", " ", texte)
    texte = re.sub(r"\s+", " ", texte).strip()
    texte = texte[:1].upper() + texte[1:]
    return texte, auto


VOYELLES = re.compile(r"[aeiouyàâäéèêëîïôöùûüœæ]+")


def syllabes(texte):
    """Nombre approximatif de syllabes dites (groupes de voyelles, sans le e muet final)"""
    n = 0
    for mot in re.findall(r"[a-zàâäçéèêëîïôöùûüœæ]+", texte.lower()):
        g = len(VOYELLES.findall(mot))
        if g > 1 and re.search(r"[^aeiouyàâäéèêëîïôöùûüœæ](e|es|ent)$", mot):
            g -= 1
        n += max(g, 1 if g else 0)
    return n


def mots(texte):
    return len(re.findall(r"\w+", texte))
