# Chaîne de données de la présidentielle 2027

Ce document donne la suite exacte des commandes et des appels Workflow. Elle produit le pack `src/elections/presidentielle-2027/` à partir de la recherche en cours. Chaque **DÉCISION** revient au propriétaire. Aucun workflow ne se lance sans son accord. Seule exception : la veille automatique, dans le périmètre exact de l'accord permanent du 17 octobre 2026 (§15).

Plan d'origine : `~/.claude/plans/enchanted-cuddling-spring.md`, phases 2 et 3. Les formats de fichiers sont décrits en tête de chaque outil, notamment `tools/build-pack.mjs` et `tools/workflows/*.js`.

## 0. Conventions

```bash
cd /Users/lambertbouley/Claude/Politique/primaire-de-gauche     # R, la racine du dépôt
D=research/presidentielle-2027
P=~/.claude/projects/-Users-lambertbouley-Claude-Politique-primaire-de-gauche   # sessions Claude Code de ce projet
```

**Arguments des workflows.**
- `CONFIG` désigne le contenu de `$D/config.json`. La session principale le lit et le passe tel quel, en objet JSON, jamais en chaîne.
- `{ ...CONFIG, root: R, x: … }` signifie : toutes les clés de `config.json`, plus `root` (le chemin absolu de R) et les clés listées.
- Tous les workflows (2 à 7) prennent `root` = racine du dépôt.
- `scriptPath` : `R/tools/workflows/<n>-….js`.

**Sorties des workflows.**
- Résultat d'un workflow : `$P/<session>/workflows/wf_<runId>.json`, la valeur de retour étant sous `result`. Le runId est donné par le résultat de l'appel Workflow.
- Journal des agents : `$P/<session>/subagents/workflows/wf_<runId>/journal.jsonl`.
- Les outils lisent indifféremment le fichier entier ou sa seule clé `result`. On copie donc le fichier tel quel.

**Environnement.** Il faut Node 22.18 ou plus récent. `build-pack`, `build-reuse` et `audit-pack` importent du TypeScript.

**Construction du pack.** Une seule commande, notée BUILD ci-dessous, lancée depuis la racine du worktree (la veille automatique la lance par son chemin absolu, `node <WT>/tools/veille/build.mjs`) :

```bash
node tools/veille/build.mjs                # BUILD : build-pack, puis check-log et positions-history check
node tools/veille/build.mjs --dry-run      # imprime la commande build-pack exacte, sans rien lancer
node tools/veille/build.mjs --no-history   # BUILD d'essai : rien n'est consigné dans positions-history.json
```

Ses arguments ne s'écrivent plus à la main : ils viennent tous de `$D/build.json`, seule source du BUILD (sortie du workflow 2, dossiers, extensions dans l'ordre, `include`). Une nouvelle extension s'ajoute **en fin de `expansions` dans ce fichier** (pour la veille, `tools/veille/apply.mjs --question` le fait), jamais dans une commande à part : une session qui relancerait l'ancienne commande la perdrait. `build.mjs` refuse `--reset-revisions` (étape 11), toute option inconnue et tout argument (code 2). Il s'arrête avant de lancer quoi que ce soit (code 30) si `build.json` n'est pas conforme, si un fichier manque, ou si `include` n'est pas exactement l'ensemble des candidats `pendingPrimary` de `config.json`. Un échec de build-pack, une perte au `check-log` ou un historique incohérent sortent aussi en 30.

La commande qu'il lance aujourd'hui, celle de la version en ligne (depuis le 12 octobre 2026, vérifiée : bank.ts, positions.ts, videos.ts, `bank.json` et `revisions.json` inchangés, `check-log` sans perte). Elle n'est donnée qu'en explication (`tests/veille-build.test.ts` vérifie que `build.json` la reproduit) ; on ne la lance plus à la main :

```bash
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json $D/expansion-merged-2.json --include faure,guedj,maurel,royal
```

`--include faure,guedj,maurel,royal` est indispensable tant que ces quatre-là restent `pendingPrimary` dans `config.json` : ils sont masqués (`election.hidden`, voir l'étape 12), pas retirés, et leurs positions doivent rester dans `positions.ts`. Sans l'option, rien ne change à l'écran, mais `tests/hidden.test.ts` échoue.

- BUILD écrit `src/elections/presidentielle-2027/bank.ts`, `positions.ts` et `videos.ts` (le dossier est créé s'il manque).
- BUILD écrit aussi `$D/bank.json`, `revisions.json` et `build-log.txt`.
- BUILD consigne enfin dans `$D/positions-history.json` chaque position qui change, à la date du jour (étape 14). Rien n'est ajouté si rien ne change.
- Après chaque BUILD, `build.mjs` lance lui-même ces deux contrôles (le second sauf `--no-history`) ; à la main :

  ```bash
  node tools/pipeline-helpers.mjs check-log $D   # code 1 = donnée perdue (orphan, edit-miss, gapfill-miss, reuse-miss, addcand-miss…)
  node tools/positions-history.mjs check $D src/elections/presidentielle-2027   # code 1 = historique incohérent (étape 14)
  ```

**Garde-fou de la primaire.** Retirée du site le 12 octobre 2026, elle reste dans le dépôt comme pack de référence (séries vidéo, élection factice essai-20, référence figée du moteur), et `research/choisir-2027/bank.json` sert à toute reconstruction de la présidentielle (`reuse.json`). Elle doit toujours se reconstruire à l'identique, avec un `git diff` vide :

```bash
node tools/build-pack.mjs research/choisir-2027/question-bank-output.json research/choisir-2027 src/elections/choisir-2027 research/choisir-2027/expansion-merged.json
git diff --stat src/elections/choisir-2027/bank.ts src/elections/choisir-2027/positions.ts research/choisir-2027/bank.json
```

## 1. Recherche : extraction

**État.** La recherche tourne : run `wf_caa394ce-da5`, lancé dans la session `157e5e56-5df4-4285-80f7-e25003d46142` avec `1-research.js` et `args = CONFIG`. Elle couvre :
- 19 dossiers neufs ;
- 5 compléments des dossiers de la primaire ;
- les lignes de fracture des 9 familles ;
- la vérification des faits.

**Quand elle est finie :**

```bash
node tools/extract-journal.mjs $P/157e5e56-5df4-4285-80f7-e25003d46142/subagents/workflows/wf_caa394ce-da5/journal.jsonl $D
node tools/pipeline-helpers.mjs research-status $D
```

Fichiers attendus dans `$D` :
- `dossier_<id>.json` pour les 19 candidats ;
- `refresh_<id>.json` pour faure, glucksmann, guedj, maurel et royal ;
- `cleavages_<famille>.json` pour les 9 familles ;
- `facts-check.json`.

**Relance des manquants.** `research-status` affiche les arguments exacts. Par exemple :

```
Workflow({ scriptPath: 'R/tools/workflows/1-research.js', args: { ...CONFIG, only: ['lisnard'], skipCleavages: true, skipFacts: true } })
```

Pour relancer seulement les lignes de fracture, on passe `only: ['-']` : un identifiant qui ne désigne aucun candidat.

Après une relance, on extrait le nouveau journal dans `$D` : seuls les fichiers relancés sont réécrits.

> **DÉCISION 1. Liste des candidats.** Lire `$D/facts-check.json`, rubrique `changes_vs_config` : nouvelles déclarations, retraits, conditions levées, éligibilité.
> - Un nouveau déclaré n'entre pas maintenant : voir la section 13.
> - Un retrait : le retirer de `candidates` dans `config.json` avant l'étape 3.

## 2. Découpage par famille

```bash
node tools/split-research.mjs $D
```

- Écrit `$D/groups/<famille>.json` pour les 9 familles.
- Les candidats en attente (`pendingPrimary`) y figurent, marqués.
- Lire les avertissements : dossiers absents, positions écartées sur un thème sans équivalent (`strategie`).

**Fiches en avance.** L'étape 9 (`5-candidates.js`) n'a besoin que de la configuration. On peut la lancer dès maintenant, en parallèle des étapes 3 à 7.

## 3. Banque de questions (2-question-bank.js)

```
Workflow({ scriptPath: 'R/tools/workflows/2-question-bank.js', args: { ...CONFIG, root: R } })
```

**Ce que fait le workflow.**
- 9 concepteurs, un par famille.
- La vérification des faits, par paquets d'environ 60 attributions.
- 4 relecteurs : gauche, centre, droite, anonymat.
- Une critique et un arbitre.

Coût : environ 13 à 16 M de jetons, 2 à 3 h.

**Seuils.** Ils sont tirés de `CONFIG.quality`. Les candidats en attente ne sont pas codés.

**Questions reprises.** Celles de la primaire portent `reuseOf`, sur la question et sur ses approches.

**Ensuite :**

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/question-bank-output.json
node tools/review-bank.mjs $D/question-bank-output.json --bank            # banque complète, qui porte quoi
node tools/review-bank.mjs $D/question-bank-output.json --edits --critic --checks
node tools/review-bank.mjs $D/question-bank-output.json --proposals       # étape 1, règles chiffrées, sujets absents, propositions
node tools/pipeline-helpers.mjs decisions-draft $D --out $D/decisions.draft.json
```

**Familles manquantes ou à refaire.** Relancer seulement ces familles :

```
Workflow({ scriptPath: 'R/tools/workflows/2-question-bank.js', args: { ...CONFIG, root: R, only: ['egalite_droits'] } })
```

Puis fusionner la sortie partielle dans la sortie complète :

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/question-bank-partial.json
node tools/pipeline-helpers.mjs merge-families $D/question-bank-output.json $D/question-bank-partial.json $D/question-bank-output.json
```

> **DÉCISION 2. `$D/decisions.json`.** Partir de `decisions.draft.json`. Le format est décrit en tête de `tools/build-pack.mjs`. À trancher :
> - `step1`, exactement 10 questions essentielles. La critique en propose une, avec la proposition calculée `stats.step1Proposal`.
> - `tierChanges` et `drops`.
> - `addApproaches` : les approches manquantes signalées par les relecteurs.
> - `edits` et `rejectEdits` : reformulations à imposer ou à refuser.
> - `positions` : attributions contestées.
> - Les reformulations de thèmes (`proposals.topicEdits`) : les reporter à la fois dans `config.json` (`topics`) et dans `decisions.edits` (champ `label` ou `description`). La sortie du workflow garde les anciens libellés.
> - **Sujets absents** (`critic.missingSubjects`, par exemple la fin de vie). Pour en ajouter un : nouveau thème dans `config.json` (`topics` et une famille de `groups`), relance de `split-research` puis de `2-question-bank.js` avec `only` sur cette famille, puis `merge-families`.

## 4. Reprise de la primaire, puis premier BUILD

```bash
node tools/build-reuse.mjs $D        # écrit $D/reuse.json : { from: "choisir-2027", questions, approaches, videoTopics }
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027
node tools/pipeline-helpers.mjs check-log $D
```

**Ce que fait `build-reuse`.**
- Il relie les questions et les approches marquées `reuseOf`.
- Il apparie par le texte les approches non marquées d'une question reprise, avec moins de 15 % d'écart.
- Il reprend les 22 séries vidéo des thèmes identiques. `strategie` n'a pas de thème ici, donc elle n'est pas reprise.
- À la relance, il garde les `videoTopics` déjà présents dans `reuse.json`. L'option `--reset-videos` les recalcule.

**Ce que reprend BUILD.**
- Les explications et graphiques des questions reprises.
- Les positions déjà vérifiées des 5 candidats de la primaire, rangées sous `prepared` dans `bank.json` et non publiées.
- `videos.ts` : `videoScope = { topics, questions }`.

Ce premier BUILD sert surtout à écrire `$D/bank.json`, que lit l'extension.

## 5. Extension (3-bank-expansion.js)

```
Workflow({ scriptPath: 'R/tools/workflows/3-bank-expansion.js', args: { ...CONFIG, root: R, ...INPUTS } })
```

`INPUTS` désigne le contenu de `$D/expansion-inputs.json`, écrit après la décision 2 (7 octobre 2026) : `subjects`, les 13 sujets absents à concevoir en questions approfondies, et `addedApproaches`, les 40 approches ajoutées par `decisions.addApproaches`, encore sans candidat.

**Ce que fait le workflow.**
- Un explorateur des documents officiels par candidat codé.
- Des compléments de positions inconnues (`gapFills`).
- Des questions approfondies nouvelles, jusqu'à environ 93 questions au total.
- La vérification des faits, la relecture par trois sensibilités et l'anonymat, et une critique de couverture.

Coût : environ 12 à 15 M de jetons, 2 à 3 h.

**Ensuite :**

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/expansion-output.json
node tools/review-bank.mjs $D/expansion-output.json --proposals     # doublons, candidats sous les seuils, paires, étape 1, sujets absents
node tools/merge-expansion.mjs $D/expansion-output.json $D/expansion-merged.json
node tools/review-bank.mjs $D/expansion-merged.json --bank
```

> **DÉCISION 3.** Compléter `decisions.json` :
> - `tierChanges`, `step1` et `drops` (doublons signalés) ;
> - les reformulations à refuser ;
> - les nouveaux sujets absents.

## 6. BUILD complet et audit

```bash
node tools/build-reuse.mjs $D                      # garde videoTopics ; à relancer si decisions.json a changé des textes repris
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json
node tools/pipeline-helpers.mjs check-log $D
node tools/audit-pack.mjs presidentielle-2027      # seuils de config.quality ; écrit $D/audit.json ; code 1 si un contrôle dur échoue
```

**Si l'audit échoue**, combler de façon ciblée. Les cas : candidats sous les seuils de couverture, étape 1 non conforme, paires non distinguées, parts de premières places hors de la fourchette.

```
Workflow({ scriptPath: 'R/tools/workflows/3-bank-expansion.js', args: { ...CONFIG, root: R, only: ['<candidat>', …] } })
```

- Avec `only`, le workflow ne produit que des compléments. Ajouter `newQuestions: true` pour qu'il conçoive aussi des questions, par exemple pour séparer une paire.
- Fusionner dans un fichier à part, puis l'ajouter à BUILD à la suite des autres :

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/expansion-output-2.json
node tools/merge-expansion.mjs $D/expansion-output-2.json $D/expansion-merged-2.json
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json $D/expansion-merged-2.json
```

> **DÉCISION 4.** Le lissage (k = 2) ne change qu'en dernier recours, avec l'accord du propriétaire et une ligne au journal des modifications. La banque est **figée** quand l'audit passe : les étapes 7 et 8 en dépendent.

## 7. Précalcul des 5 candidats de la primaire (6-add-candidate.js, ×5)

Lancer une fois par candidat (`faure`, `glucksmann`, `guedj`, `maurel`, `royal`), en parallèle des étapes 8 et 9 :

```
Workflow({ scriptPath: 'R/tools/workflows/6-add-candidate.js', args: { ...CONFIG, root: R, candidate: 'faure', checkedAt: '<AAAA-MM-JJ du jour>' } })
```

**Ce que fait le workflow.**
- Il code les positions par famille et les vérifie par paquets.
- Il reprend les positions déjà vérifiées par `reuse.json`.
- Il produit la fiche et le portrait par `5-candidates.js`, en sous-étape.

Coût : environ 1,5 à 2 M de jetons et 1 à 3 h par candidat.

**Ensuite :**

```bash
mkdir -p $D/add-candidate
cp $P/<session>/workflows/wf_<runId>.json $D/add-candidate/faure.json    # le nom du fichier = l'identifiant
```

> **DÉCISION 5.** Pour chaque fichier :
> - `review` et `coverage` ;
> - `proposedApproaches`, jamais appliquées d'office : si on les retient, les reporter dans `decisions.addApproaches` et `decisions.positions`, sachant qu'elles changent la question pour tous ;
> - `externalFlags`, à reporter dans `decisions.externalFlags`.
>
> Exception : les approches proposées par la relève hebdomadaire des positions (workflow 9) se publient sans cette décision, dans les limites du §15.

**Puis BUILD**, sans `--include`. Le journal doit montrer `addcand …` et `prepared <id> N positions`.

**Audit de chaque hypothèse de victoire**, sans rien écrire dans le dépôt :

```bash
for g in faure glucksmann guedj maurel royal; do
  T=$(mktemp -d); mkdir -p $T/research && cp -R $D research/choisir-2027 $T/research/
  node tools/build-pack.mjs $T/$D/question-bank-output.json $T/$D $T/src $T/$D/expansion-merged.json --include $g
  node tools/audit-pack.mjs presidentielle-2027 --src $T/src --research $T/$D --quiet; echo "$g : code $?"
done
```

## 8. Explications et relecture d'équilibre (en parallèle)

**8a. Explications des questions nouvelles (4-explainers.js).**

```bash
node tools/pipeline-helpers.mjs explainers-todo $D --out $D/explainers-todo.json
```

Le fichier liste :
- les questions sans explication, environ 40 ;
- les questions reprises dont l'énoncé a changé, avec `from`.

```
Workflow({ scriptPath: 'R/tools/workflows/4-explainers.js', args: { ...CONFIG, root: R, questions: <contenu de explainers-todo.json>, today: '<AAAA-MM-JJ>' } })
```

Coût : environ 6 à 8 M de jetons, 1 h 30. Repère : 10 M pour les 69 questions de la primaire.

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/explainers-output.json
node tools/merge-explainers.mjs $D/explainers-output.json $D --config $D/config.json --merge   # code 1 = ERREUR dans $D/explainers-log.txt, à corriger avant BUILD
```

Puis BUILD. `build-pack` contrôle à nouveau les sources https et les graphiques.

**8b. Relecture des contenus repris (7-spectrum-review.js).**

```
Workflow({ scriptPath: 'R/tools/workflows/7-spectrum-review.js', args: { ...CONFIG, root: R, excludeSeries: ['strategie'] } })
```

Ce que relit le workflow :
- les explications reprises, sauf celles que `$D/explainers.json` remplace déjà ;
- les 22 séries vidéo, sous trois sensibilités.

Coût : environ 6 à 9 M de jetons, 1 h 30 à 2 h 30.

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/spectrum-review.json
```

> **DÉCISION 6.** Relire `corrections`, triées par gravité, et `rejected`. Puis appliquer ce qui est retenu :
> - Séries : `node tools/pipeline-helpers.mjs spectrum-videos $D $D/spectrum-review.json`, puis `--write`. Cela retire de `reuse.json` les séries écartées (`excludedSeries`). Les corrections de séries se font dans `src/ui/videos/series/<thème>.ts`, avec la voix à réenregistrer quand `needsVoice` est vrai. Une série corrigée peut revenir dans `videoTopics`.
> - Explications : on génère la liste des explications à refaire, en attente ou corrigées, avec `from` et les corrections en note :
>   ```bash
>   node tools/pipeline-helpers.mjs explainers-todo $D --spectrum $D/spectrum-review.json --out $D/explainers-todo-2.json
>   ```
>   Si 8a est terminée et suivie d'un BUILD, la liste ne contient que ces explications reprises. Celles qui ont déjà leur explication propre sont signalées à part, et leurs corrections se vérifient à la main. Puis on relance `4-explainers.js` avec `questions` = cette liste, et `merge-explainers … --merge`. Une explication propre à la présidentielle remplace alors la reprise : le journal de BUILD note `reuse-explainer-local`.
> - BUILD.

## 9. Fiches et portraits (5-candidates.js)

On peut lancer cette étape dès l'étape 2.

```
Workflow({ scriptPath: 'R/tools/workflows/5-candidates.js', args: { ...CONFIG, root: R, today: '<AAAA-MM-JJ>' } })
```

- Couvre les 19 candidats déclarés.
- Les 5 de la primaire ont leur fiche par l'étape 7.
- Rien n'est téléchargé.

Coût : environ 5 à 7 M de jetons, 1 à 2 h. Repère : 1,7 M pour 5 candidats.

```bash
cp $P/<session>/workflows/wf_<runId>.json $D/candidates-output.json
```

> **DÉCISION 7.**
> - Relire `issues`, puis les fiches.
> - Les portraits se téléchargent **fichier par fichier, avec l'accord du propriétaire** (`downloads`). Pour chacun :
>   1. télécharger depuis `imageUrl` ;
>   2. recadrer en carré sur le visage (`crop`) ;
>   3. réduire à 400 px : `sips -Z 400 -s format jpeg -s formatOptions 78` ;
>   4. enregistrer dans `src/elections/presidentielle-2027/media/<id>.jpg`.
> - `media/CREDITS.md` = `credits.markdown`.
> - `candidates.ts` se rédige à partir de `candidates`. `photo.file` devient un `import <id>Photo from './media/<id>.jpg'` et `photo.src`. Les candidats sans portrait libre affichent leurs initiales.

## 10. Pack, BUILD final et contrôles

**Le pack** (`src/elections/presidentielle-2027/`, avec l'agent du shell) :
- `index.ts` exporte `{ election, candidates, bank, positions, topicGroups, videoScope }`. `videoScope` vient de `./videos`.
- `groups.ts` = `CONFIG.groups`, limité aux thèmes qui ont des questions dans `bank.ts`.
- `election.ts` :
  - `checks` = `CONFIG.quality` ;
  - `pending` = les 5 identifiants de la primaire ;
  - `freezeWindows` = `CONFIG.freezeWindows` ;
  - `forbiddenTerms` = `CONFIG.forbiddenTerms` ;
  - `audit` = les parts mesurées par `audit-pack` (`$D/audit.json`).
- Inscription au registre : `src/elections/index.ts` et `all.ts`.
- `transfer.ts` (codes de transfert des réponses, depuis le 15 octobre 2026) : **après tout ajout de question ou de
  thème, lui donner le numéro libre suivant**, à la main ; ne jamais changer ni réutiliser un numéro, même quand une
  question disparaît. `tests/transfer.test.ts` refuse un pack dont une question ou un thème n'a pas de numéro, et
  `tests/fixtures/transfer-slots-presidentielle-2027.json` fige les numéros déjà donnés.

**Les contrôles :**

```bash
node tools/build-reuse.mjs $D && node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json
node tools/pipeline-helpers.mjs check-log $D
node tools/audit-pack.mjs presidentielle-2027
npx tsc --noEmit && npx vitest run
node tools/review-bank.mjs $D/question-bank-output.json --bank > /tmp/presidentielle-relecture.txt   # export pour le propriétaire
```

> **DÉCISION 8. Relecture du propriétaire.**
> - À relire : l'export, l'étape 1, les fiches, Méthode, les mentions légales et l'image de partage.
> - Déploiement d'aperçu, puis e2e sur les deux élections (agent du shell).

## 11. Mise en production

```bash
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json --reset-revisions
```

Puis, dans `election.ts`, passer `revisionTracking: true` et renseigner `dataVersion` et `changelog`. On n'ajoute plus jamais `--reset-revisions` ensuite.

## 12. Résultat de la primaire (fait le 12 octobre 2026)

Raphaël Glucksmann a remporté la primaire « Choisir 2027 » dès le premier tour, le 11 octobre 2026, avec 66,13 % des voix (Toute l'Europe, 11 octobre 2026) ; le vote, perturbé par une cyberattaque, avait été prolongé jusqu'au 11 octobre à 18 h. Pas de second tour. Ce qui a été fait, à la demande du propriétaire (« cache-les uniquement pour l'instant ») :
- **Gagnant.** Dans `config.json`, `pendingPrimary` retiré de `glucksmann` (avec `declaredAt`, `declarationSource` et une `note` sur sa désignation) ; dans `candidates.ts`, sa mention `primary` retirée (pas de pastille, comme pour tout candidat désigné par son parti) et une entrée de parcours sourcée ajoutée.
- **Les quatre autres, masqués, pas retirés.** `faure`, `guedj`, `maurel` et `royal` sont dans `election.hidden` (`election.ts`) et dans `hiddenCandidateIds` du registre (`src/elections/index.ts`), et ne sont plus dans `candidateIds`. Leurs fiches restent dans `candidates.ts`, leurs positions dans `positions.ts` (BUILD avec `--include faure,guedj,maurel,royal`, étape 0) ; le pack les retire à son export (`src/core/visible.ts`), et `tools/audit-pack.mjs` applique la même règle. Leurs portraits et les logos qui ne servent qu'à eux (`ps.svg`, `grs.png`) ne sont plus importés par `candidates.ts` : un fichier importé serait publié et préchargé par le service worker sans être montré ni crédité ; les deux lignes `party` et `photo` d'origine sont gardées en commentaire dans chaque fiche, les fichiers et leur provenance dans `media/`. Les trois résumés de Raphaël Glucksmann qui nommaient Ségolène Royal (`ukraine_russie-1-b`, `-1-c`, `-2-b`, dans `add-candidate/glucksmann.json`) ont été réécrits sans la nommer ; les titres de presse cités restent tels quels. `royal` reste dans `ranking.excluded` et `scoringExcluded` : retirée au chargement, elle y revient si on la montre.
- **`election.ts`.** `pending` et la note sur la primaire retirés, `dataVersion` 2026-10-12.1 (`dataFrozenAt` inchangé : aucune position relevée à nouveau), chiffres d'`audit` refaits (`node tools/audit-pack.mjs presidentielle-2027` : 5 à 9 %), une entrée de `changelog` (sans score ni nom des masqués : elle s'affiche aussi en tête du dépouillement d'un visiteur qui revient), et une précision entre crochets dans les entrées du 9 et du 10 octobre (second tour, archive).
- **Site.** La primaire n'est plus au registre ni dans `all.ts` ; ses adresses (`#/choisir-2027`, `#/primaire`) et l'ancienne page `#/archives` sont corrigées vers la présidentielle (`RETIRED_PREFIXES`) ; un ancien lien vers la fiche d'un candidat masqué mène à `#/candidats`, et un ancien lien de comparaison perd ses candidats masqués sans avis (`#/comparer/glucksmann,faure` → `#/comparer/glucksmann`). Son pack reste dans le dépôt, hors du site (étape 0, garde-fou).

**Montrer à nouveau un candidat masqué.** Réécrire d'abord sa mention `primary` (elle annonce encore un second tour le 17 octobre) ; rétablir l'import de son portrait et de son logo, et ses lignes `party` et `photo` gardées en commentaire (`candidates.ts`) ; retirer son identifiant de `hidden` et de `hiddenCandidateIds`, le remettre dans `candidateIds` ; `node tools/audit-pack.mjs presidentielle-2027` et reporter les chiffres dans `audit` ; nouvelle `dataVersion` et entrée de `changelog` ; tests.

**Retrait définitif, plus tard (si le propriétaire le décide).** Avant le BUILD, consigner la raison dans `decisions.json`, `historyNotes` (`"faure:*": { "note": "…", "cause": "candidat-retiré" }`, une par candidat) : l'historique des positions (étape 14) en garde un « retrait » par position. BUILD sans les quatre dans `--include` (ou les retirer de `config.json` et déplacer leurs fichiers `add-candidate/<id>.json` dans `add-candidate/non-retenus/`, que `build-pack` ne lit pas) ; supprimer leurs fiches de `candidates.ts` (portraits et logos ne sont déjà plus importés), `royal` de `ranking.excluded` et de `scoringExcluded`, la liste `hidden` et `hiddenCandidateIds` ; audit, tests. Rien d'eux n'est alors livré : aujourd'hui, leurs données restent dans le fichier du pack, sans être affichées.

**Gel.** Hors fenêtres de gel (`freezeWindows`).

## 13. Candidat qui se déclare plus tard (ex. `zemmour`)

1. **Recherche.** On n'écrit pas encore le candidat dans `config.json`. `NEW` désigne son entrée : `id`, `name`, `initials`, `party`, `declaredAt`, `declarationSource`, `docs`.
   ```
   Workflow({ scriptPath: 'R/tools/workflows/1-research.js', args: { ...CONFIG, candidates: [...CONFIG.candidates, NEW], only: ['zemmour'], skipCleavages: true, skipFacts: true } })
   ```
   Puis `node tools/extract-journal.mjs <journal> $D`.
2. **Placement sur la banque.** Environ 1,5 à 2 M de jetons. La fiche et le portrait sont compris.
   ```
   Workflow({ scriptPath: 'R/tools/workflows/6-add-candidate.js', args: { ...CONFIG, candidates: [...CONFIG.candidates, NEW], root: R, candidate: NEW, checkedAt: '<AAAA-MM-JJ>' } })
   ```
   Puis `cp … $D/add-candidate/zemmour.json`.
3. **DÉCISION.** Approches proposées, couverture, fiche et portrait, comme à la décision 5.
4. **Configuration.** Ajouter `NEW` à `config.json` (`candidates`, sans `pendingPrimary`) et son parti à `forbiddenTerms`, dans `config.json` et dans `election.ts`.
5. **Construction.** BUILD, `audit-pack`, tests, puis `candidates.ts` et le portrait, puis déploiement.

## 14. Historique des positions (depuis le 15 octobre 2026)

Décision du propriétaire du 2026-10-15 : garder chaque changement de position, candidat par candidat, pour pouvoir le retracer et dresser plus tard une « carte des changements » de position par candidat. Pas d'interface sur le site pour l'instant.

**Le fichier.** `$D/positions-history.json`, format 2 (types et règles : `src/core/positionsHistory.ts` ; outil : `tools/positions-history.mjs`). Une entrée par position (un candidat sur une approche) qui change un jour donné, rangée par date :
- `id` stable (`AAAA-MM-JJ:<candidat>:<approche>`, suffixé `:2`… si la clé revient le même jour), `date`, `candidateId`, `questionId`, `approachId`, `rev` (révision de la question ce jour-là) ;
- `kinds` : `ajout`, `retrait`, `poids` (principale, compatible, rejet), `résumé`, `confiance`, `nature`, `sources`, plusieurs possibles ;
- `change` : `fond` (ajout, retrait ou poids : la position elle-même change) ou `forme` (seule sa justification change) ;
- `stance` : place du candidat avant et après (`principale`, `compatible`, `rejet`, `inconnue`), le sens du changement pour la carte ;
- `cause` : pourquoi, en champ structuré. `prise-de-position` (le candidat a dit ou publié quelque chose de nouveau ; sa date dans `statedAt`), `relecture` (notre lecture ou notre rédaction change, pas le candidat), `première-publication`, `nouveau-candidat`, `candidat-retiré`, `nouvelle-approche`, `approche-retirée`, `question-retirée`, `non-précisée` (rien ne le dit ; `check` les compte) ;
- `statedAt` : date de la prise de position (null pour les autres causes) ;
- `dataVersion` avant et après (`after` vaut null jusqu'à la nouvelle version, voir plus bas) ;
- `origin` (`rétroactif-git` ou `build-pack`), `commit` (rétroactif seulement) ;
- `reason` et `reasonFrom` : note de la position dans `decisions.json`, note de vérification (`add-candidate/<id>.json`, banque, extension), note d'historique, raison consignée ou titre du commit ;
- `before` et `after` : la position telle que publiée dans `positions.ts`, null quand elle est inconnue.

En tête du fichier, `labels` garde, datés, les énoncés des questions et les textes des approches tels que publiés (une version par changement, `text` null quand ils quittent la banque) : une approche reformulée plus tard garde, pour les anciennes entrées, le texte publié ce jour-là (`labelAt`).

Rejouer les entrées depuis une table vide redonne `positions.ts` (`tests/positions-history.test.ts`). Les candidats masqués et non classés y figurent comme les autres. Pour la carte : regrouper par candidat puis par question (`byCandidate`), lire le sens dans `stance`, la portée dans `change`, et **ne présenter comme un changement du candidat que les causes de `CANDIDATE_CAUSES`** (`prise-de-position`) : une relecture, une approche ajoutée ou l'arrivée d'un candidat ne sont pas des changements d'avis (même traitement pour tous).

**Raisons et causes, dans `decisions.json`.** Une position de `positions` porte sa `note` (la raison) et, quand elle change une position publiée, `historyCause` (`prise-de-position` ou `relecture`, le plus souvent) et, pour une prise de position, `statedAt` (date de la déclaration ou du programme ; à défaut, la source datée la plus récente). Un changement sans position propre (retrait d'un candidat, question retirée) prend sa raison dans `historyNotes` : `{ "<candidat>:<approche>" | "<candidat>:*" | "question:<id>": { "note", "cause"?, "statedAt"? } }` ; une question de `drops` sans note propre reprend `_drops_note`. Sinon, la cause est inférée (première publication, candidat ou approche qui entre ou sort de la table ou de la banque), ou reste `non-précisée`.

**Rétroactif.** Rempli le 15 octobre 2026 depuis les quatre commits qui ont touché `positions.ts` (5bbbdd5 du 8 octobre, 63ef2b6 du 9, a9c9e61 du 12, 3912fda du 14), sans rien extraire dans l'arbre (`git show`) :

```bash
node tools/positions-history.mjs rebuild $D src/elections/presidentielle-2027 --until 3912fda
```

À ne relancer que pour corriger le rétroactif : il réécrit ses entrées et garde à la suite celles de BUILD (et met au format courant un fichier plus ancien). Une raison ou une cause à corriger se consigne dans `RETRO_REASONS` ou `RETRO_CAUSES` (en tête de l'outil), pas dans le fichier. Causes relues le 15 octobre 2026 : aucun changement du 9 au 14 octobre ne vient d'une prise de position nouvelle d'un candidat (relectures, nouveaux candidats, approches ajoutées).

**Chaque BUILD.** `build-pack` compare la table qu'il va écrire à l'état que l'historique connaît (son rejeu, qui redonne le `positions.ts` publié) et consigne les écarts à la date du jour (`origin: build-pack`), avec la note de la position retenue comme raison : **toute décision qui change une position porte donc sa `note` dans `decisions.json`**, datée et sourcée, avec son `historyCause`. Plusieurs BUILD le même jour se fondent en une entrée par position ; une position revenue à son état du matin n'en laisse aucune (un BUILD lancé sans `--include` puis relancé avec ne laisse rien). Sans `positions-history.json` (la primaire), sans `positions.ts` existant (dossier neuf, comme l'audit des hypothèses de l'étape 7) ou dans un dossier qui ne porte pas le nom de l'élection, rien n'est fait. `--no-history` saute la consignation pour un essai : le BUILD suivant, ou `node tools/positions-history.mjs append $D src/elections/presidentielle-2027`, consigne les écarts depuis l'état que l'historique connaît (un essai annulé ne laisse rien). `append --from <rev>` compare plutôt au `positions.ts` d'un commit, si le rejeu était faux.

**Nouvelle dataVersion.** BUILD d'abord (l'avant d'une entrée est la `dataVersion` lue au moment du BUILD), puis la nouvelle `dataVersion` dans `election.ts`, puis :

```bash
node tools/positions-history.mjs stamp $D src/elections/presidentielle-2027
```

(le BUILD suivant le fait aussi). Le test échoue tant qu'une entrée attend une version déjà dépassée. Si une version pas encore publiée a déjà été estampillée et qu'un nouveau changement s'ajoute le même jour (cas du 15 octobre 2026), remettre l'ancienne `dataVersion` le temps du BUILD, puis la nouvelle, puis `stamp`.

## 15. Veille automatique (depuis le 17 octobre 2026)

**Accord permanent du propriétaire, daté du 2026-10-17.** Deux tâches planifiées tiennent le pack à jour sans session à la main, jusqu'au 2 mai 2027 à 20 h :

| Tâche | Horaire (heure de Paris) | Ce qu'elle fait |
|---|---|---|
| `isoloir-veille-candidats` | `0 7 * * 0,2-6` | veille des candidatures (workflow 8) ; ne publie jamais rien |
| `isoloir-veille-positions` | `0 6 * * 1` | veille des candidatures, puis relève des positions de chaque candidat présenté (workflow 9) et publication |
| `isoloir-fin-de-veille` | une fois, le 2027-05-03 à 9 h | rappel : désactiver les deux tâches |

**Ce qui part en production sans lui demander**, depuis la seule exécution hebdomadaire et seulement après tous les contrôles de `tools/veille/ship.mjs` :

- les positions changées : forme, compatibles et rejets, changement d'approche principale, renversement prouvé ;
- les positions nouvelles sur les questions où un candidat est encore inconnu ;
- les approches nouvelles : au plus 2 par exécution, une par question et par 30 jours, 9 au plus par question, une lettre jamais réutilisée, chaque autre candidat présenté recodé sur la question ; « votre réponse est à revoir » au journal ;
- les questions nouvelles : au plus une par exécution, dans la limite de **110 questions** (`quality.bank.max` de `config.json` et `checks.bank.max` d'`election.ts`, portés de 100 à 110 le même jour) ;
- et les champs qui en découlent : `dataVersion`, `dataFrozenAt`, `notes[0]`, `changelog`, `audit`, les trois constantes exactes de la Méthode, `contextDate`.

**Ce qui attend son « OK <id> »**, préparé sur une branche, avec rapport et notification :

- un nouveau candidat, préparé d'office (recherche, codage de chaque question, fiche) quand il est déclaré sans condition et soutenu par un parti qui compte des élus nationaux (députés, sénateurs, députés européens élus en France : interprétation à confirmer) ou qu'il exerce ou a exercé une fonction nationale ; les autres sont « à surveiller » ;
- un retrait (masquage préparé) ;
- la réintégration d'un non-classé ;
- la redéclaration d'un candidat masqué, la fiche d'un candidat présenté, un événement officiel ;
- un changement retenu par les règles de publication (`H-…`) ;
- **chaque portrait et chaque logo**, téléchargé fichier par fichier après son accord.

**Ce que l'accord remplace, et seulement dans ce périmètre.** La règle d'en-tête (« Aucun workflow ne se lance sans son accord ») ne s'applique pas :

- aux workflows 8 et 9 ;
- aux workflows 1 et 6 d'une préparation de candidat (rien n'en est publié sans « OK ») ;
- aux workflows 3 (`subjectsOnly`) et 4 d'une question nouvelle.

La DÉCISION 5 ne s'applique pas aux approches proposées par le workflow 9 : elles sont relues (anonymat, termes interdits), puis publiées dans les limites ci-dessus. Partout ailleurs, rien ne change : les DÉCISIONS 1 à 8 et les étapes 1 à 14, les sessions ordinaires, et les approches que propose 6-add-candidate pour un nouveau candidat, qui relèvent de son « OK C-… ».

**Règles qui restent en vigueur** :

- étiquetage IA, sans relecture humaine ; une attribution douteuse reste inconnue ; jamais une position déduite de l'étiquette ;
- User-Agent « IsoloirBot/1.0 », aucune donnée personnelle, aucun e-mail aux candidats ;
- gel du 16/04/2027 0 h au 18/04 20 h et du 30/04 0 h au 02/05/2027 20 h, plus 48 h de gel souple avant chacun ; entre les deux tours, rapport seulement ;
- jamais `--reset-revisions` ; `--include faure,guedj,maurel,royal` (dans `build.json`) ; `transfer.ts` en ajout seul ;
- chaque changement porte `note` et `historyCause` ; les candidats masqués ne sont jamais nommés ;
- D5 : ne jamais élargir un écart publié.

**Où tout se trouve.**

- `$D/VEILLE.md` : la marche à suivre des tâches, en français, lue par elles à `origin/main`.
- `tools/veille/CONTRACT.md` : formes, règles de publication, codes de sortie. `tools/veille/*.mjs` : les seuls scripts qui écrivent, valident, poussent et déploient.
- `tools/workflows/8-candidate-watch.js` (veille des candidatures) et `tools/workflows/9-refresh-positions.js` (relève des positions). Contrairement aux workflows 2 à 7, ils prennent `root` = le worktree de l'exécution, jamais R.
- `tools/lire-banque.mjs` : lecture de la banque pour les agents, sans `node -e`.
- `$D/veille/` : l'état versionné. `state.json`, `ledger.json`, `runs/` et `rapports/` avancent dans le commit publié. `policy.json`, `locks.json` et `d5-baseline.json` sont les fichiers de contrôle du propriétaire.
- `R/.claude/veille/` : l'état local, jamais versionné (verrou, dépense, attentes, `STOP`, `PAUSE`, traces).

**Ce que le propriétaire garde en main.**

- `STOP` ou `PAUSE` dans `R/.claude/veille/`, ou `"paused": true` dans `veille/policy.json`, arrêtent tout.
- `locks.json` protège une paire (candidat, question ou approche) : droit de réponse, correction.
- Les fichiers de contrôle (`VEILLE.md`, ce fichier, `policy.json`, `locks.json`, `d5-baseline.json`) se lisent à `origin/main` et ne changent que par un commit du propriétaire : aucune exécution ne peut les valider.

**Pour les autres sessions.**

- Les branches `veille/*` et `accord/*` et les worktrees `veille-*` et `accord-*` appartiennent à la veille : ne pas y toucher.
- Le lundi, `origin/main` avance par une fusion « Fusion de la branche veille/… ». Récupérer `origin/main` avant de pousser.
- Une entrée de `decisions.json` écrite par la veille porte une clé `veille` ; une entrée sans cette clé est du propriétaire. La veille ne la remplace que par une prise de position plus récente que l'entrée et que sa source la plus récente.
- Un BUILD à la main passe par `tools/veille/build.mjs` (étape 0) : une question ajoutée par la veille est dans `build.json`, jamais dans une commande.
- Une personne déjà dans `config.json` (même nom normalisé) n'est jamais proposée comme nouveau candidat : un candidat ajouté à la main n'est pas préparé une seconde fois.

## Annexe : contrats entre les maillons

| Maillon | Lit | Écrit |
|---|---|---|
| `1-research.js` + `extract-journal.mjs` | `CONFIG` | `$D/dossier_<id>.json`, `refresh_<id>.json`, `cleavages_<famille>.json`, `facts-check.json` |
| `split-research.mjs` | `config.json`, les fichiers ci-dessus, `reuseDossier` (`research/choisir-2027/dossier_<id>.json`) | `$D/groups/<famille>.json` |
| `2-question-bank.js` | `groups/<famille>.json`, dossiers, `research/choisir-2027/bank.json` (questions reprises) | `drafts` (questions, approches et questions marquées `reuseOf`), `stats`, `neutrality`, `critic` → `question-bank-output.json` |
| `build-reuse.mjs` | `question-bank-output.json`, `decisions.json`, `research/choisir-2027/bank.json`, `src/ui/videos/series/` | `$D/reuse.json` `{ from, questions, approaches, videoTopics }` |
| `build-pack.mjs` | sortie de la banque, extensions, `config.json`, `decisions.json`, `explainers.json`, `explainer-charts.json`, `reuse.json`, `add-candidate/*.json`, `positions.ts` existant | `bank.ts`, `positions.ts`, `videos.ts` (`videoScope = { topics: série → thème, questions: question de la primaire → question d'ici }`), `$D/bank.json` (`bank`, `positions`, `prepared`), `revisions.json`, `build-log.txt`, `positions-history.json` (s'il existe) |
| `positions-history.mjs` | historique git de `positions.ts`, `bank.ts`, `election.ts`, `decisions.json`, `add-candidate/` (rebuild) ; `positions-history.json`, `decisions.json` (`note`, `historyCause`, `statedAt`, `historyNotes`), `positions.ts`, `bank.ts`, `election.ts` | `$D/positions-history.json` |
| `3-bank-expansion.js` + `merge-expansion.mjs` | `$D/bank.json`, dossiers, groupes | `expansion-merged.json` (`drafts`, `neutrality.edits`, `gapFills`) |
| `6-add-candidate.js` | `$D/bank.json`, dossier (+ `refresh`), `reuse.json` | `add-candidate/<id>.json` (`candidate`, `positions[]` avec `verdict`, plus `card` et `portrait` pour la session) |
| `4-explainers.js` + `merge-explainers.mjs` | `$D/bank.json`, explications publiées (`from`) | `explainers.json`, `explainer-charts.json`, `explainers-log.txt` |
| `7-spectrum-review.js` | `reuse.json`, `research/choisir-2027/{config,bank,explainers}.json`, séries | `spectrum-review.json` (corrections proposées, `excludedSeries`, `videoTopics`, `explanationsOnHold`) |
| `5-candidates.js` | `CONFIG` | `candidates`, `portraits`, `downloads`, `credits` → `candidates.ts`, `media/` |
| `audit-pack.mjs` | `bank.ts`, `positions.ts`, `candidates.ts` (sinon `config.json`), `config.quality` | `$D/audit.json` |
| `audit-{echiquier,croix,poids,facon}.mjs --json` | le pack, les profils de `tests/fixtures/echiquier-profiles.ts` | une ligne JSON (`AUDIT_JSON`) sur stdout, le rapport lisible sur stderr |
| `lire-banque.mjs` (lecture seule) | `$D/bank.json` | stdout : `questions`, `preflight`, `candidat`, `question-all`, `unknown` |
| `veille/build.mjs` (BUILD, étape 0) | `$D/build.json`, `config.json` | comme `build-pack.mjs`, puis `check-log` et `positions-history check` |
| `veille/run.mjs` | `veille/{policy,state}.json` (la politique à `origin/main`), `election.ts`, `config.json`, `R/.claude/veille/` | verrou, `runs/<runId>/run.json`, dépense, attentes (`pending`), rapport (`report`) ; imprime les arguments des workflows 8 et 9 |
| `8-candidate-watch.js` + `veille/persist.mjs` + `veille/classify.mjs` | `CONFIG` et les arguments de `run.mjs start` | `WATCH_RESULT` → `runs/<runId>/watch.json`, puis `classify.json` et les « à surveiller » locaux |
| `9-refresh-positions.js` + `veille/persist.mjs` | `CONFIG`, les arguments de `run.mjs start`, la banque par `lire-banque.mjs` | `REFRESH_RESULT` → `runs/<runId>/refresh-<n>.json` et `changeset.json` (local et `$D/veille/runs/<runId>/`) |
| `veille/apply.mjs` | le changeset, `bank.json`, `decisions.json`, `config.json`, `election.ts`, `candidates.ts`, `positions-history.json`, `veille/{policy,locks}.json` (à `origin/main`), `veille/{ledger,state}.json` | `decisions.json` (entrées à clé `veille`), `veille/{ledger,state}.json`, `apply-report.json`, attentes `H-…` et `I-…` ; avec `--question` : `build.json`, `transfer.ts` et sa fixture |
| `veille/remeasure.mjs` | le pack, les quatre audits `--json`, `veille/d5-baseline.json` (à `origin/main`) | `election.ts` (`audit`), `$D/audit.json`, `src/core/echiquierMethodCopy.ts` (nombres des trois constantes exactes) |
| `veille/election-fields.mjs` | `apply-report.json`, `veille/state.json`, sortie de `remeasure` | `election.ts` (`dataVersion`, `dataFrozenAt`, `notes[0]`, `changelog`), `config.json` (`contextDate`), `positions-history.json` (`stamp`) |
| `veille/commit.mjs`, `veille/ship.mjs`, `veille/rederive.mjs` | le worktree de l'exécution, `R/.claude/veille/` | commit sur `veille/*` ou `accord/*` ; fusion poussée sur main, sans forcer ; déploiement Vercel ; `last-ship.json` ; reprise dans un worktree neuf |
| `veille/gate-time.mjs`, `veille/prod-check.mjs`, `veille/cleanup.mjs` | `src/core/freeze.ts`, `policy.json`, la production, les worktrees `veille-*` | rien (portes horaires, contrôle de l'asset servi) ; retrait des vieux worktrees `veille-*` |

**Ce qui reste propre à la primaire, à dessein :**
- `tools/workflows/1-research.js`, non modifié pendant la recherche en cours. Son prompt de complément nomme la primaire et fixe une liste de thèmes à compléter. À rendre générique après la recherche, comme 2 à 7.
- Le chemin historique de `split-research.mjs`, choisi parce que la configuration de la primaire n'a ni `topics` ni `groups`.
- Les reconstructions de la primaire, qui doivent rester identiques.
