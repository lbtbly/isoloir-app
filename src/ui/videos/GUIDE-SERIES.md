# Écrire une série de vidéos « Les sujets »

Pour l'agent qui écrit **une** série (un thème de la banque), en même temps que d'autres agents qui en écrivent
d'autres, sans se parler. Modèles à lire en entier avant d'écrire : `series/retraites.ts`, `series/logement.ts`
(textes validés par le propriétaire) et `pistes/planches/retraites.tsx`, `pistes/planches/logement.tsx`
(dessins). Le contrat des données et du dessin : `types.ts` (à lire en entier). Le monde visuel : `DESIGN.md`
(« Le dépouillement »), et `src/styles/videos-c.css` pour la piste.

## 0. En bref

1. Vous ne modifiez que **deux fichiers** : `src/ui/videos/series/<thème>.ts` et
   `src/ui/videos/pistes/planches/<thème>.tsx`. Ils existent déjà (série à `null`, planches vides) et sont
   branchés partout. Ne touchez à rien d'autre : ni `index.ts`, ni la bibliothèque `pistes/dessin/`, ni les
   styles, ni les tests, ni les séries des autres. Il manque un pictogramme ? Dessinez-le dans votre fichier de
   planches (§ 10.6).
2. Lisez les fiches de votre thème (§ 2) : c'est votre **seule** matière, chiffres compris.
3. Écrivez l'introduction, puis un approfondissement par levier ou question (§ 3), au ton des modèles (§ 4),
   strictement neutre (§ 5), avec les chiffres exacts des fiches (§ 6).
4. Écrivez le `spoken` de chaque passage qui a un chiffre, un sigle ou un symbole (§ 7), avec la typographie
   française (§ 8) et des identifiants stables (§ 9).
5. Dessinez une planche par passage (§ 10), vérifiez en images (§ 11), corrigez, recommencez.
6. Ne lancez jamais la génération des voix : quand la série est vérifiée, l'agent de vérification pose
   `tools/voices/queue/<thème>.ready`, et le démon de `tools/voices/file-attente.py` s'en charge.

## 1. Vos deux fichiers

```ts
// src/ui/videos/series/sante.ts : remplacez « VideoSeries | null = null » par la série
import type { VideoSeries } from '../types'

export const SANTE: VideoSeries = {
  topicId: 'sante',            // l'identifiant du thème, celui du nom du fichier
  familyId: 'social',          // celui de groups.ts (écrit en tête du fichier)
  label: 'Santé et grand âge', // exactement le libellé du thème dans la banque
  videos: [ /* l'introduction, puis les approfondissements */ ],
}
```

```tsx
// src/ui/videos/pistes/planches/sante.tsx : une planche par passage, clé = identifiant du passage
import type { Board } from './types'
// … vos planches …
export const SANTE: Record<string, Board> = { 'sante-intro-01': intro01, /* … */ }
```

Le nom de la constante est l'identifiant du thème en capitales (`TRAVAIL_SALAIRES`, `PROCHE_ORIENT`…), déjà
écrit dans les deux fichiers. `series/index.ts` range la série dans le fil (ordre des familles de `groups.ts`) ;
`planches/index.ts` fusionne les planches. Un passage sans planche prend le dessin générique, mais le test
`tests/piste-c.test.ts` exige une planche **par passage**, qui ne rend pas `null`.

## 2. La matière : les fiches de votre thème

- `research/choisir-2027/bank.json` (clé `bank`) : `topics` (votre thème, son libellé) et `questions` dont le
  `topicId` est le vôtre : `prompt` (la question posée à l'électeur), `context`, `explainer`. **N'utilisez pas
  les `approaches`** : ce sont les positions en débat, une vidéo ne les présente jamais.
- `research/choisir-2027/explainers.json` (clé `explainers`, une entrée par `questionId`) : `summary`,
  `points` (un texte et sa `source` `{ title, url, publisher, date }`), `figures` (`value`, `label`, `date`,
  `quote`, `source`).
- `research/choisir-2027/explainer-charts.json` (clé `charts`) : `{ questionId, index, chart }`, le graphique
  (`FigureChart`) du chiffre n° `index` de la fiche de `questionId`.

Vous n'avez ni le droit ni le moyen de chercher ailleurs (pas de web, aucun téléchargement). Les deux séries
d'essai citent aussi quelques chiffres vérifiés directement dans leurs sources pendant l'essai : ne les imitez
pas sur ce point, restez dans les fiches.

## 3. La structure d'une série

| | Introduction (`kind: 'intro'`) | Approfondissement (`kind: 'deep'`) |
| --- | --- | --- |
| Rôle | L'essentiel du thème, puis les questions qu'il pose | Un levier, ou une question de la banque |
| `short` | `'Introduction'` (exigé par le test) | Nom court du levier : « Loyers », « Âge de départ » |
| Arc type | accroche → 3 à 6 points ou chiffres qui posent l'enjeu → les questions du thème (une par approfondissement, `visual: 'question'`) → la fin (`'outro'` : le sommaire des vidéos, dessiné tout seul) | accroche (une situation, une question) → le mécanisme → les chiffres → les deux côtés du débat (`'compare'`) → une question ouverte (`'question'`) |

- **Approfondissements** : un par levier ou par question de la banque ; regroupez deux questions qui parlent
  du même levier, scindez une question qui en mêle deux. Au moins un (le test l'exige), quatre en général.
- **6 à 12 passages par vidéo**, **45 au plus pour toute la série** (par exemple 9 + 4 × 9). Un passage :
  une à trois phrases courtes, 4 à 12 secondes à l'oral. Une vidéo dure de 45 s à 1 min 30.
- **Titre** (`title`) : 45 signes au plus, une question ou un groupe nominal (« À quel âge partir à la
  retraite ? », « Encadrer les loyers »). `register: 'vous'` partout.
- `questionIds` : les questions **de votre thème** que la vidéo éclaire (la première mène à « Voir la fiche »).
- `visual` de chaque passage : `hook` (accroche), `point` (une idée), `figure` (un chiffre, avec `figure`),
  `timeline` (des dates), `compare` (deux côtés, deux grandeurs), `question`, `outro` (fin d'introduction).
- `draw` : une phrase qui dit le dessin voulu (jamais montrée) ; gardez-la d'accord avec la planche.
- `emphasis` : 1 à 3 mots ou nombres du `say`, **écrits exactement comme dans le `say`** (insécables
  comprises) : la planche les écrit en gros au moment où la voix les dit.
- `alt` : ce que la planche écrit en plus du `say` et du chiffre (graduations, légendes : « 60, 62, 64 et
  66 ans »). L'image est masquée aux lecteurs d'écran : tout ce qu'elle montre doit être dit quelque part.
- `sources` : les sources des chiffres et des faits cités, copiées des fiches (§ 6).

## 4. Le ton : les modèles, annotés

Vouvoiement, langue orale simple, phrases courtes, un fait par phrase, aucun jargon sans son explication.
Ni ironie, ni dramatisation, ni adjectif qui juge (« seulement », « énorme », « explose », « hélas »).

- **Accroche, du concret à la question** — « Un jour, vous arrêterez de travailler. Qui vous versera alors
  votre retraite ? » ; « Vous changez d'appartement. Le propriétaire peut-il fixer le loyer comme il veut ? »
  Une situation que la personne connaît, puis la question du thème. Pas de chiffre choc.
- **Le mécanisme, puis son nom** — « Surtout ceux qui travailleront à ce moment-là : leurs cotisations paient
  les pensions de la même année. C'est la répartition. » On explique d'abord, on nomme ensuite.
- **Le sigle expliqué au passage** — « C'est 14,1 % du PIB, la richesse produite en un an. »
- **Le chiffre ramené à l'échelle d'une personne** (calcul exact et simple sur un chiffre de la fiche) —
  « Pour la moitié des locataires du privé, c'est plus de 29,6 %, aides au logement déduites. Presque 30 euros
  sur 100. »
- **L'analyse attribuée à sa source**, jamais prise à son compte — « Selon le Conseil d'orientation des
  retraites, reculer l'âge rapporte deux fois : plus de cotisations, et des pensions versées moins longtemps. »
  Puis, dans le passage suivant, ce qui tempère : « Mais à court terme, près d'un tiers des économies repart en
  autres dépenses sociales… ».
- **Les deux côtés, à égalité** — « Pour les uns, c'est une protection des locataires. Pour d'autres, un risque
  de voir moins de logements à louer. » ; « Financement et emploi d'un côté, santé de l'autre : c'est la
  balance du débat. » Même longueur, même construction, sans dernier mot pour l'un.
- **La question de fin, ouverte** — « Alors, jusqu'où encadrer les loyers ? » ; « Alors, quel levier, pour qui,
  et à quel prix ? » Jamais de réponse, jamais d'invitation à donner son avis.
- **La fin d'une introduction** — « Dans les vidéos suivantes, on regarde chacun de ces leviers de plus près. »

## 5. La neutralité : règles fermes

- **Aucun nom** de candidat, de parti, de mouvement, d'alliance électorale ni de personnalité politique, même
  quand la fiche en cite (fiche « Alliances » comprise : on parle d'accords, de coalitions, sans dire entre
  qui). Les institutions et organismes publics se nomment (Insee, Cour des comptes, Conseil d'orientation des
  retraites, Assemblée nationale, Sénat, Commission européenne, ONU…), pour attribuer un chiffre ou une analyse.
- **Jamais les approches ni les propositions** défendues dans la primaire, même sans dire qui les porte :
  « certains proposent de… » est interdit. On décrit ce qui existe, ce qui est mesuré, et les questions.
- **Deux côtés à égalité** dès qu'un débat est évoqué : même nombre de phrases, même ton, même place à
  l'image ; l'ordre ne suggère pas un vainqueur ; la vidéo ne finit pas sur l'argument d'un camp.
- **Aucun cadrage** : vocabulaire des fiches et des institutions, sans mot de camp (« assistanat », « cadeaux
  fiscaux », « casse », « submersion », « matraquage »…). Sur un sujet où les mots eux-mêmes sont disputés
  (Proche-Orient, Ukraine, immigration, laïcité), reprenez les termes de la fiche et attribuez-les (« selon
  l'ONU »). Un chiffre qui sert un côté ne s'accompagne d'aucun commentaire ; si la fiche donne celui qui
  compte pour l'autre côté, montrez-le aussi.
- **Aucun appel** à voter ou à « donner son avis », aucune mention d'Isoloir dans ce qui est dit (le test le
  vérifie, avec les noms des candidats).
- La neutralité vaut aussi pour l'image (§ 10.5).

## 6. Les chiffres : exacts, sourcés, rien d'inventé

- **Seulement les nombres écrits dans les fiches de votre thème** (§ 2) : `summary`, `points[].text`,
  `figures[]`, et leurs graphiques. Aucun chiffre de mémoire, aucune estimation, aucun arrondi qui change la
  valeur. Une conversion exacte et simple est permise (« 29,6 % » → « presque 30 euros sur 100 »).
- **Même valeur, même unité, même date, même périmètre** que la fiche (« hors Île-de-France », « en deux ans »,
  « résidences principales » : on garde la précision, ou on ne cite pas le chiffre).
- Un passage qui **montre** un chiffre porte `figure` :
  `{ value, label, date, sourceIndex }`. `value` : la valeur de la fiche, à la lettre (seule la typographie
  change : insécables, « − » U+2212 pour un nombre négatif) ; `label` : le libellé de la fiche (raccourci si
  besoin, jamais changé de sens) ; `date` : celle de la fiche ; `sourceIndex` : l'index, dans `sources` de la
  vidéo, de la source de ce chiffre.
- **`sources`** : chaque source citée, copiée de la fiche (`title`, `url`, `publisher`, `date`), typographie
  française appliquée au titre. Tout nombre dit dans la vidéo doit venir d'une source de la liste, même sans
  `figure`. Une source par objet, sans doublon dans une vidéo.
- **`chart`** (facultatif) : seulement pour le chiffre d'une fiche qui a un graphique dans
  `explainer-charts.json` (même `questionId`, même `index`) : copiez son `chart` tel quel. `chartOf()` (model.ts)
  le vérifie, le test aussi. Une planche peut le tracer (§ 10.4) ; sinon le dessin générique le fait.
- Un fait daté qui peut changer avant le vote (un texte examiné, une échéance) : notez-le en tête du fichier,
  « Datée : … À revoir après cette date. », comme dans les modèles.

## 7. La voix : le champ `spoken`

La voix de synthèse lit le `spoken` s'il existe, sinon le `say`. Le `say` reste le sous-titre.

- **Obligatoire** dès que le `say` contient un chiffre (le test l'exige), et dès qu'il contient un sigle épelé,
  un symbole (`%`, `€`, `Md€`, `m²`), un ordinal (`1er`, `2e`), un chiffre romain ou une abréviation.
- C'est **le même texte**, mot pour mot, avec la même ponctuation, où ces éléments sont écrits **en toutes
  lettres**, comme les dirait un présentateur. Espaces simples seulement (aucune insécable : le test le
  vérifie), aucun chiffre. Apostrophes typographiques gardées.

| `say` | `spoken` |
| --- | --- |
| `En 2025` | `En deux mille vingt-cinq` |
| `la génération 1969` | `la génération mille neuf cent soixante-neuf` |
| `17,3 millions` | `dix-sept virgule trois millions` |
| `14,1 % du PIB` | `quatorze virgule un pour cent du P.I.B.` |
| `422 milliards d’euros`, `5,1 Md€` | `quatre cent vingt-deux milliards d’euros`, `cinq virgule un milliards d’euros` |
| `380 000` | `trois cent quatre-vingt mille` |
| `plus 0,9 % au 1er janvier 2026` | `plus zéro virgule neuf pour cent au premier janvier deux mille vingt-six` |
| `2 à 4 %` | `deux à quatre pour cent` |
| `−5,1` | `moins cinq virgule un` |
| `un nouveau calcul du DPE` | `un nouveau calcul du D.P.E.` |

- Sigle qui s'épelle : lettres pointées (`P.I.B.`, `D.P.E.`, `H.L.M.`) ; sigle qui se dit comme un mot :
  tel quel (`Insee`, `Unédic`). Orthographe traditionnelle des nombres (« quatre-vingts », « deux cents »).
- **Découpage en phrases** (`tools/voices/phrases.py`) : chaque phrase est générée seule, puis assemblée. Une
  phrase finit par `.`, `!`, `?` ou `…` suivis d'une espace. Donc : pas de `etc.`, `env.`, `M.`, `av.` ni
  d'initiale pointée (ils couperaient la phrase ou la souderaient à la suivante) ; pas de sigle pointé en fin
  de phrase (« … du P.I.B. Ensuite… » ne se coupe pas : reformulez « … du P.I.B., la richesse… ») ; une question
  par phrase, terminée par `?` (l'intonation en dépend) ; 25 mots au plus par phrase.
- Vérifiez ce que dira la voix, phrase par phrase :
  `~/isoloir-tts/bin/python tools/voices/generate.py --voice aigue --dry-run --only <thème>`
  (lecture seule : rien n'est généré ; chaque passage s'affiche avec ses phrases telles qu'envoyées à la voix).
  `tools/voices/texte.py` met aussi en lettres les nombres d'un passage sans `spoken`, mais ne comptez pas
  dessus : écrivez le `spoken`.

## 8. La typographie

Composée dans les chaînes, avec les échappements des modèles (` `, ` `) plutôt que des caractères
invisibles :

- ` ` (fine insécable) avant `?`, `!`, `;` et comme séparateur des milliers (`380 000`) ;
- ` ` (insécable) avant `:` et `%`, à l'intérieur des guillemets (`« Retraite »`), entre un
  nombre et son unité ou son mot (`64 ans`, `422 milliards`, `5,1 Md€`, `1er janvier`) ;
- apostrophe `’`, guillemets `« »` (jamais `'` ni `"` dans un texte : le test le vérifie), « − » (U+2212)
  pour un nombre négatif, `…` d'un seul caractère ;
- dans `say`, `title`, `short`, `draw`, `alt`, `figure.label` et les titres de sources ; **pas** dans `spoken`
  (§ 7). Aucune espace ordinaire avant `? ! : ; %` (le test le vérifie).

## 9. Les identifiants

- Vidéos : `<préfixe>-intro`, puis `<préfixe>-<mot>` (minuscules ASCII, sans accent, tirets) ; passages :
  `<vidéo>-01`, `-02`… dans l'ordre, sans trou (le test le vérifie). Ils nomment les fichiers de la voix :
  **une fois la voix générée, ne les changez plus** (et changer un `say` ou un `spoken` oblige à la refaire).
- Préfixes, pour qu'aucun ne recouvre un autre :

| Thème | Préfixe | Thème | Préfixe | Thème | Préfixe |
| --- | --- | --- | --- | --- | --- |
| travail_salaires | `travail` | education | `ecole` | europe | `europe` |
| fiscalite | `impots` | societe | `culture` | ukraine_russie | `ukraine` |
| industrie_economie | `industrie` | numerique | `numerique` | proche_orient | `proche-orient` |
| egalite | `egalite` | ecologie_energie | `ecologie` | defense | `defense` |
| sante | `sante` | agriculture | `agriculture` | institutions | `institutions` |
| solidarites | `solidarites` | territoires | `territoires` | laicite_republique | `laicite` |
| securite_justice | `securite` | immigration | `immigration` | strategie | `alliances` |

(`retraites` et `logement` sont pris.)

## 10. Le dessin : les planches

### 10.1 Une planche

`type Board = (p: P) => JSX.Element | null`, où `P` est `PisteSegmentProps` (`types.ts`) : `p.segment` (le
passage), `p.script` (la vidéo), `p.still` (image fixe), `p.progress` (0 à 1), `p.context`. La scène fait de
**300 × 360 px** (petit téléphone) à **520 × 560 px** ; elle est masquée aux lecteurs d'écran.

Règles de construction :

- **Les mots et les nombres viennent du script**, jamais recopiés dans la planche : `cuesOf(p)` (les
  `emphasis`), `word(p, /…/)` (un mot du passage), `said(p, /…/)` (dans la vidéo), `num()`, `ratioOf()`… Si le
  script ne donne plus ce qu'il faut, la planche **rend `null`** (le passage prend le dessin générique). Seules
  de courtes étiquettes neutres qui nomment ce qui est dessiné s'écrivent en dur (« recettes », « dépenses »),
  et elles vont dans `alt`.
- **Tout arrive quand la voix le dit** : `heard(p, texte)`, `cue.shown`, `word(…)?.shown`. En image fixe tout est
  « dit » : `heard()` rend vrai.
- **La règle « still »** (mouvement réduit, affiche d'une vidéo voisine) : on doit voir l'état final, sans
  aucun geste. Les gestes de la bibliothèque vont tous « de l'état de départ vers l'état normal » et le lecteur
  coupe les animations : ce qui est dans le DOM s'affiche dans son état normal. Donc : ne cachez jamais quelque
  chose par une fin d'animation ; décidez de ce qui est présent avec `shown`/`heard()` ; n'utilisez
  `p.progress` qu'à travers `heard()` (ou comptez `p.still` comme `progress = 1`).
- `t0` : départ d'un geste en millisecondes depuis le début du passage ; `kept` : déjà au tableau, sans geste.
- Unités : la feuille d'un dessin (`<Art h={…}>`) fait **300 de large** et `h` de haut ; elle se réduit si la
  scène manque de hauteur. Restez dans `0 ≤ x ≤ 300` et `0 ≤ y ≤ h` (le harnais signale ce qui sort).

### 10.2 La bibliothèque (`pistes/dessin/`) — à utiliser, pas à modifier

**`encre.tsx`, les gestes et la lecture du script**

| Export | Pour |
| --- | --- |
| `W` | largeur de la feuille (300) |
| `Art({ h, y? })` | la feuille d'un dessin : un SVG de 300 × `h` qui garde ses proportions |
| `Ink({ d, t0?, dur?, kept?, class? })` | un trait d'encre qui se trace une fois (chemin SVG `d`) |
| `Fade({ t0?, kept?, class? })` | un groupe qui arrive en fondu (aplats, pointillés) |
| `Txt({ x, y, text, size?, max?, anchor?, up?, tone?, big?, t0?, kept?, halo? })` | un texte du dessin, coupé à `max` signes par ligne ; `big` pour un nombre ; `halo` sur un trait |
| `Arrow({ x1, y1, x2, y2, dash?, tone?, head? })`, `Brace(…)`, `Ask({ x, y, h })` | flèche, accolade, point d'interrogation à la main |
| `cuesOf(p)`, `cueOf(p, i)` | les mots mis en valeur, `{ text, shown }` |
| `word(p, re)`, `said(p, re)` | un mot du passage (avec `shown`) ; un mot de la vidéo |
| `heard(p, texte)` | la voix a-t-elle atteint ce texte (toujours vrai en image fixe) |
| `num(s)`, `nums(s)`, `ratioOf(s)`, `fractionOf(s)`, `yearsOf(s)` | nombres à la française, « 1 sur 7 », « deux tiers », années |
| `sentencesOf(s)`, `sentenceWith(say, mot)`, `plain(s)`, `SP`, `wrap()`, `at()`, `cls()` | outils de texte et de style |

**`mises.tsx`, la mise en page d'un passage (HTML composé, qui se coupe seul)**

| Export | Pour |
| --- | --- |
| `Seg({ kind? })` | le passage : blocs centrés l'un sous l'autre ; `kind` : `'fig'` (chiffre), `'ask'` (question), `'end'` (fin) |
| `Head({ lines })`, `HeadCues({ p, ask?, only? })`, `lineOf(cue)`, `leadOf(p)` | le titre en gros, mot par mot quand la voix le dit |
| `Chiffre({ p })`, `Libelle({ p })`, `Src({ p })` | le chiffre de `figure` à la lettre et son libellé ; la source et sa date |
| `Note({ p, text })`, `Question({ p })` | une phrase dite écrite sous le dessin ; la question du passage |
| `Sur100({ p, kind, low, high?, mode?, caption })` | cent unités, dont certaines comptées (« 30 euros sur 100 ») |
| `Panel({ items, cols? })` | des pictogrammes légendés (les questions d'une introduction) |
| `Sommaire({ p })`, `Signature({ p })` | la fin d'une introduction : la liste des approfondissements (automatique) |
| `listAfterColon(say)` | les éléments d'une liste dite après « : » |

**`pictos.tsx`, les pictogrammes au trait** — `Picto({ n, x, y, size?, tone?, filled?, text?, t0?, kept? })`
place un pictogramme (carré de 48 unités) qui se dessine trait après trait ; `Glyphe({ n })` le met seul dans
un SVG (listes HTML) ; `pictoFor(texte)` en choisit un d'après les mots. Disponibles : `personne`, `maison`,
`immeuble`, `piece`, `pieces`, `enveloppe`, `calendrier`, `sablier`, `cle`, `etiquette`, `tirelire`, `grue`,
`barriere`, `document`, `lune`, `bruit`, `repetition`, `alternance`, `thermometre`, `scaphandre`, `loupe`,
`coeur`, `mallette`, `parapluie`, `pancarte` (avec `text`), `fenetre`, `porte`, `radiateur`, `valise`, `cadenas`,
`epingle`, `livre`, `carte`, `soin`, `arbre`, `collines`, `monument`, `billet`, `cadran`, `trimestres`,
`drapeau` (un fanion de repère, sans couleur), `portemonnaie`, `guichet`, `cible`, `pyramide`, `bourse`,
`chaleur`, `fauteuil`, `metre`, `compteur`, `terrain`, `escalier`, `toile`, `hausse`, `baisse`, `carte_france`
(et `VILLES` pour y poser une ville).

**`schemas.tsx`, les schémas paramétrables**

| Export | Pour |
| --- | --- |
| `Rang({ n, picto, count?, ghost?, cols?, max?, gap? })`, `rangCells()` | n pictogrammes, certains comptés (bleu bille) ou manquants (pointillé) : « 1 sur 7 » |
| `Cent({ kind, low, high?, mode? })` | cent unités en dix rangées |
| `barres({ items, max?, room? })` | grandeurs comparées, à l'horizontale, **depuis zéro, à la même échelle** ; rend `{ el, h, geo }` |
| `colonnes({ items })` | une grandeur à plusieurs dates ; projection en pointillé (`ghost`) |
| `Disque({ cx, cy, r, part })`, `partPoint()` | une part d'un tout |
| `frise({ y, from, to, ticks?, labels? })` | une ligne du temps ou des âges ; rend `{ el, X }` pour y poser des repères |
| `balance({ left, right, labels, shown })` | **les deux côtés d'un débat** : plateaux égaux, fléau horizontal |
| `manettes({ items })`, `effets({ items })` | des leviers (celui dont on parle bouge) ; ce qu'entraîne un choix |
| `Cases({ n, cols, count?, ghost? })`, `casesH()` | une grille de cases (trimestres, jours) |
| `Qui`, `Signe`, `Barriere`, `Pause`, `Plafond`, `Move` | une personne ou un pictogramme légendés ; petits dessins ; déplacer un groupe |

### 10.3 Trois exemples

**Un rapport dit, compté** (`retraites.tsx`, `retraites-intro-05`, « Environ un euro sur quatre de toutes les
dépenses publiques. ») : tout vient du script ; s'il ne dit plus de rapport, la planche rend `null`.

```tsx
const intro05: Board = p => {
  const cue = cueOf(p, 0)                       // « un euro sur quatre », mot mis en valeur
  const r = ratioOf(cue?.text)                  // { k: 1, n: 4 }
  if (!cue || !r || r.n > 12) return null       // plus de rapport : dessin générique
  const { cells, h } = rangCells({ n: r.n, y: 44, max: 60, gap: 18 })
  const all = word(p, /toutes les dépenses publiques/)
  const first = cells[0]!
  const last = cells[cells.length - 1]!
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={44 + h + 64}>
        <Rang n={r.n} picto="piece" y={44} max={60} gap={18} count={range(r.k)} shown={cue.shown} t0={200} stagger={200} />
        {cue.shown ? <Picto n="enveloppe" x={first.x + first.size / 2 - 17} y={2} size={34} tone="count" t0={400} /> : null}
        <Brace x1={first.x} y1={44 + h + 10} x2={last.x + last.size} y2={44 + h + 10} t0={1200} />
        {all ? <Txt x={W / 2} y={44 + h + 52} text={all.text} size={15} t0={1500} /> : null}
      </Art>
    </Seg>
  )
}
```

**Deux grandeurs à la même échelle** (`logement.tsx`, `logement-social-05`, « 19 mois en moyenne, 39,5 mois
en Île-de-France ») : le chiffre de la fiche en tête, deux barres depuis zéro, la source.

```tsx
const social05: Board = p => {
  const a = cueOf(p, 0)
  const b = word(p, /\d+,\d+[\s ]mois/)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: word(p, /en moyenne/)?.text, value: va, text: a.text, shown: a.shown },
      { label: word(p, /Île-de-France/)?.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4, size: 26, gap: 28, room: 92, t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}
```

**Les deux côtés d'un débat** (`logement.tsx`, `logement-loyers-08`, « Pour les uns, c'est une protection
des locataires. Pour d'autres, un risque de voir moins de logements à louer. ») : une balance au fléau
horizontal, deux plateaux de même taille, chaque étiquette quand la voix la dit, aucun côté au bleu bille.

```tsx
const loyers08: Board = p => {
  const [a, b] = cuesOf(p)
  const sign = word(p, /à louer/)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="parapluie" x={cx - 28} y={base - 82} size={56} t0={900} />
        <Picto n="personne" x={cx - 16} y={base - 34} size={32} t0={1100} />
      </>
    ),
    right: (cx, base) => <Picto n="pancarte" x={cx - 30} y={base - 60} size={60} t0={1200} text={sign?.text} />,
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}
```

D'autres patrons utiles dans les modèles : une foule qui se compte (`retraites-intro-03` : `Chiffre`, `Rang` de
40, `Src`), une frise des âges avec un drapeau (`retraites-intro-08`), une grandeur à plusieurs dates
(`datees()` dans `retraites.tsx`), les questions d'une introduction (`retraites-intro-09` : `Panel`), la fin
d'une introduction (`retraites-intro-10` : `Sommaire`), une question finale (`logement-loyers-09` : un dessin
puis `Question`).

### 10.4 Les tons, et le graphique d'une fiche

Seulement les tons de la piste, par classe ou par `tone` : l'encre d'imprimerie (par défaut) dessine ;
`vc-soft` / `tone="soft"` (gris) habille les axes et repères ; `vc-count` / `tone="count"` (**bleu bille**)
compte ce dont parle le passage, et rien d'autre ; `vc-ghost` / `tone="ghost"` (pointillé gris) dit ce qui
manque, a disparu ou n'est que projeté ; `vc-dash` (pointillé), `vc-thin`, `vc-bold`, `vc-tint` (aplat léger),
`vc-tint-count`, `vc-paper` (cache couleur papier). Gestes en plus : `vc-slide` / `vc-slide-y` (avec
`--from`), `vc-shrink`, `vc-grow-from`. **Aucune couleur écrite à la main** (`fill="#…"`, `style={{ color }}`),
ni rouge (réservé aux lignes rouges de l'électeur), ni pastel, ni nouvelle classe CSS.

Le graphique d'une fiche (`chart`) se trace comme dans `generique.tsx` : `chartOf(p.segment)` (de `../../model`)
et le composant `FigureChart` (de `../../../components/FigureChart`), dans un `<div class="vc-chart">`.

### 10.5 À éviter

- **Texte trop petit** : 14 unités au moins pour une étiquette, 18 à 22 pour un nombre (`big`) ; le harnais
  signale tout texte de moins de 11 px. Peu de mots par dessin : le `say` est déjà sous-titré.
- **Débordement** : rien hors de la feuille (`x` de 0 à 300, `y` de 0 à `h`) ; une planche doit tenir de
  300 × 360 à 520 × 560 px, titre, chiffre et source compris (vérifiez `--formats petit,grand`). Un dessin haut
  (`Art h` au-delà de 220) avec un `Chiffre` et une `Src` sera réduit : préférez moins d'éléments.
- **Cadrage par l'image** : dans une comparaison, même échelle depuis zéro, mêmes tailles, plateaux égaux ; un
  écart impossible à dessiner à l'échelle se montre du doigt (`retraites-intro-07`), il ne se grossit pas.
  Le bleu bille compte, il ne désigne jamais le « bon » côté.
- **Visages et personnes réelles** : une personne n'est qu'une tête et des épaules (`personne`), sans genre,
  âge, métier ni trait. Ni portrait, ni caricature, ni silhouette reconnaissable.
- **Symboles connotés** : aucune couleur ni aucun symbole de parti (rose, poing, flamme, faucille…), aucun logo,
  aucun drapeau national ou emblème officiel, aucun symbole religieux, aucune carte de frontières disputées,
  aucune arme ni scène de violence dessinée. Préférez les objets neutres (document, monument, guichet, balance).
- **Gadgets** : ni confettis, ni rebonds, ni badge ; un geste sert à montrer, dans l'ordre où la voix parle.

### 10.6 Un pictogramme qui manque

N'ajoutez rien à `pictos.tsx` (fichier commun à toutes les séries). Dessinez-le dans votre fichier, au trait,
dans un carré de 48 unités, traits dans l'ordre de la main, sans attribut (pas de visage, pas de texte) :

```tsx
/** Un bouclier, au trait ; (x, y) : coin haut gauche, s : côté en unités de la feuille */
const Bouclier = ({ x, y, s = 48, t0 = 0 }: { x: number; y: number; s?: number; t0?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 48})`} style={{ '--k': String(48 / s) }}>
    <Ink d="M24 4L42 10V24C42 34 34 41 24 45C14 41 6 34 6 24V10Z" t0={t0} dur={600} />
  </g>
)
```

(`--k` garde l'épaisseur du trait de la feuille à toutes les tailles.)

## 11. Vérifier

```sh
npx tsc --noEmit -p tsconfig.json
npx vitest run tests/videos.test.ts tests/piste-c.test.ts
npx eslint src/ui/videos/series/<thème>.ts src/ui/videos/pistes/planches/<thème>.tsx
~/isoloir-tts/bin/python tools/voices/generate.py --voice aigue --dry-run --only <thème>   # la voix, phrase par phrase
node tools/videos-snap.mjs .impeccable/videos-snap/<thème> <thème>                        # 390 × 844 et 1280 × 800, clair et sombre
node tools/videos-snap.mjs .impeccable/videos-snap/<thème> <thème> --planche --formats petit,grand
```

- `tests/videos.test.ts` vérifie, pour toutes les séries : thème et famille, `short` de l'introduction, 6 à 12
  passages par vidéo, 45 par série, titres de 45 signes au plus, identifiants, questions du thème, sources en
  `https://`, `emphasis` présents dans le `say`, `figure.sourceIndex` valide, `chart` lisible, `spoken`
  (présent dès qu'il y a un chiffre, sans chiffre ni insécable), noms de candidats et de partis, typographie,
  planches rattachées à un passage de la série. `tests/piste-c.test.ts` : une planche par passage, qui ne rend
  pas `null` et ne lève pas d'erreur. Une erreur dans le fichier d'une autre série n'est pas la vôtre :
  signalez-la, ne la corrigez pas.
- `tools/videos-snap.mjs` (serveur de dev `http://localhost:5173`, Chromium sans écran, son coupé) écrit une
  image par passage (`<vidéo>/<NN>-<format>-<thème>.png`), une planche d'ensemble par vidéo
  (`<vidéo>-planche-<format>-<thème>.png`) et `rapport.json` ; il liste à la fin les passages en défaut :
  **dessin générique** (planche absente, `null` ou en erreur), texte **coupé**, dessin **hors feuille**, texte
  **trop petit**. Regardez les images (outil Read), en clair et en sombre : une planche lisible au premier
  coup d'œil, qui dit la même chose que le sous-titre, sans rien ajouter.
- Relisez enfin chaque `say` à voix haute dans votre tête : vouvoiement, une idée par phrase, aucun mot de
  camp, deux côtés à égalité, chaque nombre retrouvé dans la fiche.
