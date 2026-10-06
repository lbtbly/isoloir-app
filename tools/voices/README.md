# Voix des vidéos — génération hors ligne

Les voix des vidéos « Les sujets » sont synthétisées sur l'ordinateur du propriétaire, hors connexion, par
VoxCPM2 (`mlx-community/VoxCPM2-8bit`, via mlx-audio, déjà dans le cache Hugging Face : rien n'est téléchargé).
**Une seule voix** de synthèse, aucune personne réelle : la **voix aiguë** « v3.1a » (identifiant `aigue`,
référence `refs/aigue.wav`), créée par description avec VoxCPM2 (description dans `generate.py`). L'identifiant
sert partout : dossier `public/videos/audio/aigue/`, clé de `src/ui/videos/audio-files.json`
(`{ "voices": { "aigue": … } }`) et d'`etat.json` (`aigue/<passage>`), option `--voice` du générateur.

La **voix grave** « v5b » a été retirée le 5 octobre 2026 (décision du propriétaire) : sa référence, ses
97 passages publiés, ses lignes d'inventaire et d'état et sa description sont dans
`report/archives/voix-grave/` (non suivi par git ; `LISEZMOI.txt` dit comment la rétablir). Les mesures
d'étalonnage citées plus bas qui la concernent restent valables : c'est sur elle que le détecteur de sons
parasites a été réglé.

Python : `~/isoloir-tts/bin/python` (numpy, scipy, mlx-audio ; aucune autre dépendance). Le détecteur de sons
parasites utilise aussi `mlx-community/Qwen3-ForcedAligner-0.6B-8bit` (alignement forcé mot à mot, via mlx-audio),
déjà dans le cache Hugging Face et lu hors connexion.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `generate.py` | Génère, choisit les prises, assemble, encode, tient l'inventaire et le rapport. |
| `phrases.py` | Découpe un passage en phrases ; pauses entre phrases. `python phrases.py` vérifie le découpage. |
| `pitch.py` | Hauteur (F0) : YIN, seconde méthode SHS, contour de fin de phrase. `python pitch.py f.wav` affiche le contour. |
| `clean.py` | Nettoyage, niveau commun, mesures de pause et de débit, assemblage des phrases. |
| `texte.py` | Texte lu par la voix (nombres en lettres), syllabes. |
| `export-series.mjs` | Exporte `src/ui/videos/series.ts` en JSON (Node 24 ; séries rangées une par fichier dans `src/ui/videos/series/`, imports sans extension résolus par un crochet). |
| `file-attente.py` | Démon de la file d'attente : génère la voix des séries thème par thème, à mesure qu'elles sont prêtes (`queue/`, voir plus bas). |
| `echantillon.py` | Échantillon d'écoute : passages bout à bout, AAC 128 kb/s. |
| `artefacts.py` | Détecteur de sons parasites (rires, respirations, bruits, vocalises, mots étirés, manquants ou en trop), utilisé par `generate.py` ; compilation d'écoute des sons repérés. |
| `test_artefacts.py` | Tests du détecteur : audio synthétique, et référence (archivée) de la voix grave avec sons collés. `~/isoloir-tts/bin/python tools/voices/test_artefacts.py` |
| `etat.json` | État de la génération (texte, prises retenues, mesures) : sert à la reprise. |
| `queue/` | File d'attente : `<thème>.ready` (série prête), `<thème>.done`, `<thème>.essais`, `FIN`, `TERMINE`, `demon.pid`. Non suivi par git. |
| `report/` | `file-attente.log` (journal du démon), `journal.log`, `rapport-*.txt|json` (`dernier.*`), `scan-*.txt|json` et `a-refaire.json` (contrôle des passages publiés), et avec `--keep-takes` les prises (`prises/<voix>/`) et passages assemblés (`passages/<voix>/`) en WAV. Les WAV de travail (et `archives/`) ne sont pas suivis par git (`.gitignore`) ; les rapports texte, si. `archives/voix-grave/` : la voix retirée. |

## Usage

```sh
~/isoloir-tts/bin/python tools/voices/generate.py --voice aigue --dry-run          # ce qui serait généré, estimation
~/isoloir-tts/bin/python tools/voices/generate.py --voice aigue --only sante        # une série entière (son thème)
~/isoloir-tts/bin/python tools/voices/generate.py --voice aigue --only retraites-intro --keep-takes
~/isoloir-tts/bin/python tools/voices/generate.py --voice aigue                    # tout (reprise possible)
~/isoloir-tts/bin/python tools/voices/generate.py --segment retraites-intro-04 --segment logement-existant-06 --keep-takes
~/isoloir-tts/bin/python tools/voices/echantillon.py aigue retraites-intro 10 .impeccable/voix/essai.m4a
~/isoloir-tts/bin/python tools/voices/echantillon.py aigue --segment retraites-intro-04 --segment logement-existant-06 \
  --silence 0.6 .impeccable/voix/essai-sigles-voix-aigue.m4a
~/isoloir-tts/bin/python tools/voices/generate.py --scan --voice aigue             # contrôle des passages publiés, sans générer
~/isoloir-tts/bin/python tools/voices/generate.py --scan --voice aigue --listen .impeccable/voix/artefacts-reperes.m4a
~/isoloir-tts/bin/python tools/voices/generate.py --redo-flagged --voice aigue      # ne régénère que les passages marqués à refaire
~/isoloir-tts/bin/python tools/voices/artefacts.py prise.wav "Un jour, vous arrêterez de travailler."   # une prise, son texte
```

Options : `--only` (vidéo, ou série par son thème : `sante`, `retraites` ; répétable ou séparé par des
virgules ; une série encore à `null` est inconnue), `--segment` (passage précis, par son identifiant de
`series/<thème>.ts` ; répétable ou séparé par des virgules ; se combine avec `--only`, `--voice`, `--limit`,
`--force` et `--purge`), `--voice aigue` (la seule ; défaut), `--takes N` (3 par défaut, ou `--takes-aigue`),
`--extra-takes` (4), `--target-aigue` (cible de hauteur en Hz), `--limit N`, `--force`, `--purge`,
`--keep-takes`, `--steps` (16), `--cfg` (2,0), `--seed`, `--bitrate` (80 000), `--scan` (avec
`--listen sortie.m4a`), `--redo-flagged`, `--no-artifacts` (génération sans le détecteur de sons parasites).

`--scan` ne génère rien et n'écrit ni l'inventaire, ni `etat.json`, ni les fichiers publiés : il passe les passages
publiés à jour de la sélection (`--voice`, `--only`, `--segment`) au détecteur, écrit `report/scan-*.txt|json` et met
à jour `report/a-refaire.json` (un passage contrôlé y entre s'il a un défaut net, en sort sinon ; les autres entrées
restent). `--listen` y ajoute une compilation d'écoute : chaque son repéré avec 1,5 s de contexte avant et après,
0,8 s de silence entre deux extraits, AAC 128 kb/s, et à côté un `.txt` qui donne, dans le même ordre, le passage,
l'instant, le type et les mots autour. `--redo-flagged` régénère les passages de `a-refaire.json` (dans la sélection
`--voice`, `--only`, `--segment`), et eux seuls, même s'ils sont à jour ; un passage refait sans défaut net sort de la
liste. Les graines étant reproductibles, les prises sont les mêmes qu'avant : c'est le détecteur qui écarte celle qui
avait le son parasite (prises de secours au besoin, `--extra-takes` pour en autoriser plus).

Avec `--segment`, seuls les passages nommés sont générés ; les autres passages de leurs vidéos ne sont ni
générés ni retirés. Le saut à l'enchaînement de la première phrase se mesure depuis la fin du passage précédent
s'il est déjà généré et à jour ; sinon, cette première phrase est jugée sans lui. Un passage généré ainsi est un
passage de production comme un autre : la génération complète le garde (reprise), sauf `--force`.

`echantillon.py` : `aigue <vidéo> <nombre> <sortie.m4a>` (les N premiers passages d'une vidéo) ou
`aigue --segment <passage> … <sortie.m4a>` (des passages précis, dans l'ordre donné, de vidéos différentes au
besoin) ; `--silence` entre deux passages (0,35 s).

Graines : chaque prise a une graine reproductible, tirée de `--seed`, de la phrase et de la voix. Le départ des
graines de la voix (`graines` dans `VOIX`) est figé : les graines inscrites à `etat.json` restent celles des
prises déjà générées, et `--force` les refait à l'identique.

## File d'attente (`file-attente.py`)

Les séries s'écrivent en parallèle (une par fichier, `src/ui/videos/series/<thème>.ts`) ; la voix, elle, ne se
génère qu'une exécution à la fois. Le démon fait le lien : quand une série est vérifiée, on pose
`tools/voices/queue/<thème>.ready` (`touch` suffit ; le reposer après une correction relance le thème, seuls les
passages changés sont refaits). Toutes les 60 s, il lance `generate.py --voice aigue --only <thème>` pour le plus
ancien `.ready` en attente, un thème à la fois : succès → `<thème>.done` (JSON : passages générés, alertes) ;
échec → nouvel essai 10 min plus tard au plus tôt, 3 essais au plus (`<thème>.essais`), puis `<thème>.echec`.
Une génération lancée à la main l'arrête jusqu'à ce qu'elle finisse.

Quand les 23 thèmes sont faits, ou quand `queue/FIN` existe et que plus rien n'est en attente, la passe finale
enchaîne `generate.py --voice aigue` (passages manquants ou périmés), `--scan`, `--redo-flagged --extra-takes 8`
et `--scan --listen .impeccable/voix/controle-final-toutes-videos.m4a`, puis écrit `queue/TERMINE` (passages
par vidéo, alertes, sons repérés) et le démon s'arrête.

```sh
nohup caffeinate -i ~/isoloir-tts/bin/python tools/voices/file-attente.py >> tools/voices/report/file-attente.log 2>&1 &
touch tools/voices/queue/sante.ready                 # la série sante est prête
tail -f tools/voices/report/file-attente.log          # le journal du démon
tail -f tools/voices/report/file-attente-en-cours.log # la génération en cours, ligne à ligne
touch tools/voices/queue/FIN                         # plus de série à attendre : passe finale dès que la file est vide
kill $(cat tools/voices/queue/demon.pid)              # arrêt (la génération en cours reçoit Ctrl-C)
```

## Fichiers à jour, fichiers périmés

Le lecteur (`src/ui/videos/audio.ts`) ne joue un fichier que s'il est inscrit à `src/ui/videos/audio-files.json`,
à sa place (`videos/audio/<voix>/<vidéo>/<passage>.m4a`) et avec `hash` égal à l'empreinte FNV-1a 32 bits du
texte dit de `series.ts` (`spoken`, sinon `say`, chaîne exacte : insécables et apostrophes typographiques
comprises ; la mise en forme de `texte.py` vient après). Une correction de `series.ts` rend donc le fichier
muet aussitôt. Une correction de `texte.py` ne change pas cette empreinte : `generate.py` retire alors, en début
d'exécution, toute inscription dont le texte à dire enregistré (`etat.json`) n'est plus celui que donne
`texte.py` (ou dont le mode n'est plus « clone-phrases ») ; `--dry-run` les signale sans rien retirer. Le test
`tests/voices.test.ts` fait la même vérification sur la machine qui a ce Python.

## Méthode

**Mode clone seulement** (`ref_audio` + texte, 16 pas, guidage 2,0). Le mode « continuation » (amorce = passage
précédent, `prompt_audio` + `prompt_text`) a été retiré : à l'écoute, accent anglais et voix robotique.

**Phrase par phrase.** Chaque passage est découpé en phrases (fin = `.` `!` `?` `…` suivis d'une espace ou de la
fin ; les sigles à points « P.I.B. », « D.P.E. » et les lettres isolées pointées ne terminent pas une phrase, sauf
« … ou C deux P. Il s'ouvre… » où le mot suivant ouvre une phrase ; `:` et `;` restent dans la phrase). Chaque
phrase est générée seule : générée d'un bloc, une affirmation suivie d'une question prenait l'intonation de la
question. Le passage est réassemblé avec 0,30 s de pause après `.` ou `!`, 0,35 s après `?` (mesures : 0,27 s
dans la voix aiguë validée, 0,15 à 0,26 s aux virgules des références), puis nettoyé et mis au niveau.

**Choix de la prise**, pour chaque phrase (3 prises, jusqu'à 4 de secours tant qu'aucune n'est acceptable ; la
voix grave, retirée, en prenait 5). Acceptable si :

- médiane de F0 à ±1,5 demi-ton de la **cible fixe de la voix**, la même pour toutes les vidéos de toutes les
  séries. Voix grave (retirée) : médiane de F0 de la partie lue de la référence (après « Bonjour ! », exclamation chantée 4 à 10
  demi-tons plus haut), 190,9 Hz — proche du passage jugé « mieux » à l'écoute (189,2 Hz). Voix aiguë : médiane des
  trois passages validés à l'écoute, 243,8 Hz (la partie lue de sa référence, 267,5 Hz, est 1,6 dt plus haut ; le
  clone parle plus bas que la référence, viser 267,5 Hz changerait la voix validée). Une cible qui suivrait les
  passages déjà retenus dériverait (189 → 181 → 167 Hz en trois passages, voix grave, essai précédent) ;
- saut à l'enchaînement ≤ 3 demi-tons (fin de la phrase précédente → début de la prise, médianes du dernier et
  du premier tiers des trames voisées), au-delà d'une tolérance de reprise vers le haut : après une fin qui
  descend de X dt, la phrase suivante repart naturellement X dt plus haut ; une question commence haut (+3 dt ;
  +3,3 dt dans la voix aiguë validée) ; tolérance plafonnée à 6 dt. Après une question, on part de sa
  médiane. Sans cette tolérance, sur l'essai de la voix grave, presque toutes les prises dans la cible étaient refusées
  (fins à −3,5/−6,6 dt, phrase suivante +5 à +6 dt plus haut). La stabilité de la note d'une phrase à l'autre est
  tenue par la cible fixe (toutes les phrases à ±1,5 dt d'elle) ;
- phrase affirmative : la fin ne monte pas de plus de +1,5 demi-ton (~150 dernières ms voisées contre les ~350 ms
  précédentes). Étalonnage : références −3,4 et −6,6 dt, fins d'affirmation de la voix aiguë validée −0,6 à
  −1,5 dt, « travailler. » de la prise de la voix grave jugée interrogative +4,4 dt ;
- débit ≤ 1,6 × celui de la référence (syllabes par seconde articulée, pauses ôtées : 5,1 voix aiguë, 4,8
  voix grave) et ≥ 0,7 × ; voix réellement voisée (trames voisées par seconde articulée ≥ 0,5 × la médiane des
  prises de la phrase et ≥ 0,3 × la référence : une prise soufflée ou craquée n'a pas de hauteur fiable) ;
  durée proche des autres prises ; pas de pause > 1,1 s ; dispersion raisonnable.

Score : écart à la cible + pénalité du saut au-delà de 2 demi-tons + pénalité de dispersion ; à score égal, une
fin franchement descendante l'emporte. Aucune prise acceptable : la meilleure est gardée, avec une alerte au
rapport.

**Mesure de F0 vérifiée** par une seconde méthode (sommation des sous-harmoniques) : 96 à 100 % de trames
d'accord, aucune erreur d'octave dans les médianes. Les rares sous-harmoniques (F0/3) et la voix craquée des fins
de phrase sont écartées des médianes et comptées comme graves dans le contour de fin.

## Sons parasites (`artefacts.py`)

À l'écoute, la voix grave faisait « parfois des sons bizarres (rires, respirations chelou) » ; la voix aiguë est
jugée « top ». Les critères de hauteur, de débit et de voisement ne voient pas ces sons, qui tombent entre les mots ou
au bord de la phrase. Chaque prise (nettoyée) passe donc par le détecteur, avec la phrase qu'elle doit dire ; le
passage assemblé aussi (alerte seulement).

**Méthode.** Alignement forcé mot à mot (Qwen3-ForcedAligner, « French » ; instants par pas de 80 ms ; mots composés
séparés : collé, « momentlà » était comprimé et laissait 0,16 à 0,24 s de parole hors mot). Trames de 10 ms : niveau,
part d'énergie sous 2,5 kHz, périodicité (autocorrélation normalisée, 60-500 Hz) et hauteur. Trame voisée :
périodique (≥ 0,75) à moins de 30 dB de la parole, sauf la voix craquée des fins de groupe (sous 0,6 × la hauteur
médiane et sous parole − 15 dB : naturelle, ignorée). Trame de souffle : apériodique (< 0,6), ou à demi périodique
(≤ 0,75) mais forte (à moins de 20 dB de la parole). Niveaux rapportés à la parole (médiane des mots) et au bruit de
fond (au plus parole − 45 dB : les prises n'ont ni bruit de fond ni silence de tête). Une zone hors des mots (active :
à moins de 35 dB de la parole) n'est retenue que si 30 ms au moins tombent hors des marges (80 ms avant un mot,
120 ms après), sinon c'est une fin de consonne ou l'imprécision de l'alignement. Sa part voisée est mesurée hors des
marges, sa part soufflée sur toute la zone ; les deux sont jugées, la plus grave l'emporte : **rire** (bouffées voisées
à 3-9 Hz), **vocalise** ou **parole en trop** (voisée, séparée des mots ; « en trop » avant le premier ou après le
dernier mot), **respiration** (souffle, énergie surtout sous 2,5 kHz), **bruit** (souffle aigu, chuintement),
**claquement** (≤ 30 ms) ; un souffle aigu bref près d'un mot (≤ 100 ms à 250 ms au plus de sa fin, ou collé et
≤ 150 ms) est un relâchement de consonne (« t », « s », « f » finals), ignoré. Une zone voisée collée à un mot est le
mot qui dure plus que l'alignement ne le voit : le mot est alors jugé avec elle (**mot étiré**, ou **parole en trop**
au bord, ou **vocalise** à +12 dB au-dessus de la parole). **Mot manquant ou bâclé** : un mot réduit à rien par l'alignement, qui tient avec ses voisins dans moins
de 30 % de la durée de leurs syllabes. Chaque événement : début, fin, type, niveau au-dessus du bruit de fond,
confiance, mots voisins.

**Gravité et effet sur la génération.** Défaut **net** : la prise est inacceptable (prises de secours, puis alerte
comme pour les autres défauts). Défaut **léger** : +0,5 au score (l'unité du score est le demi-ton d'écart à la
cible), au plus +1,5. Si aucune prise n'est sans défaut, la moins mauvaise est gardée avec une alerte ; entre deux
prises écartées, celle qui a un son parasite net passe après (+5 par son net), et une prise seulement hors critères
de hauteur, de saut ou de fin (+10) passe avant toute prise écartée (+100). Le journal et le rapport donnent les sons
de chaque prise (`!` net, `?` léger dans la colonne des prises).

**Une seule exécution à la fois.** `generate.py` refuse de démarrer (sauf `--dry-run`) si un autre `generate.py` tourne
(`pgrep`, hors ses propres processus parents et enfants, `caffeinate` compris) : deux exécutions écriraient en même
temps l'inventaire, `etat.json`, les fichiers publiés ou `report/a-refaire.json`. `artefacts.py --voice` reste
utilisable pendant une génération (lecture seule).

**Étalonnage, sans vérité terrain** (258 fichiers : voix aiguë, 32 passages publiés, 11 prises retenues, 22 autres
prises, 9 d'archive ; voix grave, 12 passages publiés, 25 prises retenues, 138 autres, 9 d'archive). La voix aiguë sert
de témoin négatif, la grave de terrain de recherche. Seuils (détail et mesures dans `SEUILS` et `PARAMS`) :

- bruit de fond au plus parole − 45 dB : les prises et passages n'ont ni bruit de fond (silence numérique) ni
  silence de tête ; le 10e centile des trames tombait dans le déclin des mots (−20 à −40 dB sous la parole dans 60 %
  du corpus), et l'ancienne borne (parole − 20 dB) montait le seuil d'activité jusqu'à parole − 10 dB : un souffle à
  −45 dBFS (parole − 25 dB) inséré dans un passage publié de la voix grave n'était vu que 6 fois sur 12 ; il l'est
  12 fois sur 12 (léger), et net dès −40 dBFS (8 fois sur 12) ;
- marges 80/120 ms : à 40/60 ms, fins de consonnes repérées dans la voix aiguë (« f » de « neuf », « s » de « six »
  jusqu'à 120 ms après la fin alignée) ; à 60/100 ms, « r » final dévoisé de « partir ? » dans la voix grave ; au-delà
  de 80/120 ms, les respirations placées aux virgules (100 à 200 ms après le mot) disparaissent ;
- voix craquée (« hommes, », « privé, » de la voix aiguë : 0,24 à 0,40 s à 80-90 Hz, −22 à −35 dB) : ignorée ; elle
  donnait une vocalise ou un mot étiré nets dans deux passages publiés de la voix aiguë ;
- souffle (respiration, bruit) net dès 100 ms non voisées à moins de 20 dB de la parole : voix grave 100 à 210 ms, de
  −4,6 à +9 dB, au début d'une phrase, à une virgule, après « toucher ? » ; voix aiguë retenue au plus 70 ms (un bref
  souffle après « répartition. », passage validé à l'écoute : léger). Léger dès −30 dB et 50 ms ;
- rire : bouffées à 0,11-0,33 s d'intervalle (mesurés 0,14/0,23 s et 0,28 s) ; net à −20 dB ;
- vocalise, parole en trop : net à −15 dB et 80 ms voisées, léger à −25 dB ;
- prolongement voisé collé à un mot (voix craquée exclue) : voix aiguë publiée et retenue au plus 0,26 s ; défauts
  0,32 à 0,55 s (« la » crié à +18,9 dB, « euh » avant « Surtout », « comment ? » prolongé) : léger dès 0,30 s, net dès
  0,35 s ;
- mot étiré (durée / syllabes × durée moyenne d'une syllabe) : voix aiguë au plus 3,08 (« France »), voix grave
  publiée 2,82, prises défectueuses 3,3 à 4,9 : léger 3,2, net 3,8 ;
- sigles épelés : « P.I.B. », « D.P.E. » (3 syllabes, une par lettre), « C deux P », « F ou G » : rapports 0,8 à 1,5,
  aucun événement ; pauses entre phrases (silence numérique) et fondus : aucun événement créé par l'assemblage (les
  trois sons repérés près d'un raccord sont dans les prises : syllabe en trop en tête de la phrase suivante, souffle) ;
- mot manquant : rapport le plus bas de la voix aiguë publiée 0,36 (« il y a » dit « y a ») : seuil 0,30.

Résultat sur le corpus (revue du 5 octobre, 323 fichiers) : voix aiguë retenue, aucun défaut net, un léger (le
souffle après « répartition. ») ; voix aiguë, 97 passages publiés : deux défauts nets (retraites-intro-09, syllabe
voisée en trop isolée entre « toucher ? » et « Et » ; retraites-pensions-02, expiration puis inspiration fortes après
« privé, ») et 8 légers ; voix grave publiée, deux défauts nets (le rire du début de retraites-intro-01, un souffle aigu
entre « toucher ? » et « Et » dans retraites-intro-09) et trois légers (respirations douces à la virgule de
logement-existant-06 et au point-virgule de retraites-intro-08, bref souffle en tête de retraites-penibilite-03) ;
voix grave, autres prises, 13 défauts nets dans 10 prises, dont 7 de retraites-intro-09 (questions : rires,
souffles, « hah »).

**Limites.** Le rire ou le souffle à l'intérieur d'un mot (voix rieuse, voyelle soufflée) n'est vu que s'il allonge le
mot ou déborde de lui ; la voyelle soufflée ne se distingue pas, sur ce corpus, du « r » dévoisé de « tr ». Un son qui
tient dans les marges d'un mot (120 ms après sa fin alignée, 80 ms avant son début, ou une pause de moins de 0,2 s
entre deux mots) lui est attribué : souffle bref collé à une fin de mot, « r » dévoisé ou respiration, sans
distinction. Tests d'insertion dans les 12 passages publiés de la voix grave : un rire de 2 ou 3 bouffées est repéré,
collé ou non (10 à 12 fois sur 12) ; un « ha » seul de 0,12 s ou un « euh » collés à un mot ne le sont presque pas
(« euh » de 0,20 s : 1 fois sur 12, de 0,45 s : 8 fois sur 12), car l'aligneur étire les mots voisins par-dessus ; une
voyelle tenue ne suffit pas à les distinguer (la voix aiguë publiée a des voyelles tenues jusqu'à 0,43 s). Séparés
des mots par un silence, ils sont repérés (« euh » : 9 à 11 fois sur 12). Un mot sauté n'est vu que s'il est assez
long (le contrôle du débit de `generate.py` reste le premier filet).

**Temps.** Modèle d'alignement chargé une fois (5,6 s), premier contrôle 0,8 à 5 s (mise en route) ; ensuite 0,27 s
par prise en moyenne (médiane 0,23 s, alignement 0,23 s compris), soit 3 % du calcul d'une prise (8,65 s en moyenne,
`etat.json`) ; mesuré pendant une génération concurrente. `--scan` : 54 s pour 81 passages publiés pendant une
génération, 16 s pour 109 passages sans (chargement compris).
