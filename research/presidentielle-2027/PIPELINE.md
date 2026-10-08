# Chaîne de données de la présidentielle 2027

Ce document donne la suite exacte des commandes et des appels Workflow. Elle produit le pack `src/elections/presidentielle-2027/` à partir de la recherche en cours. Chaque **DÉCISION** revient au propriétaire. Aucun workflow ne se lance sans son accord.

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

**Construction du pack.** Une seule commande, notée BUILD ci-dessous. On la complète au fil des étapes :

```bash
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json   # [$D/expansion-merged-2.json …] [--include <gagnant>]
```

- BUILD écrit `src/elections/presidentielle-2027/bank.ts`, `positions.ts` et `videos.ts` (le dossier est créé s'il manque).
- BUILD écrit aussi `$D/bank.json`, `revisions.json` et `build-log.txt`.
- Après chaque BUILD :

  ```bash
  node tools/pipeline-helpers.mjs check-log $D   # code 1 = donnée perdue (orphan, edit-miss, gapfill-miss, reuse-miss, addcand-miss…)
  ```

**Garde-fou de la primaire.** Elle doit toujours se reconstruire à l'identique, avec un `git diff` vide :

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

## 12. Le 17 octobre au soir : résultat de la primaire

```bash
node tools/build-pack.mjs $D/question-bank-output.json $D src/elections/presidentielle-2027 $D/expansion-merged.json --include <gagnant>
node tools/audit-pack.mjs presidentielle-2027 && npx vitest run
```

Aucun workflow n'est à relancer. À faire ensuite :
- **Fiche.** Ajouter la fiche du gagnant à `candidates.ts`, à partir de `card` dans `$D/add-candidate/<gagnant>.json`, avec son portrait (`portrait`, `downloads`, `credits`).
- **`election.ts`.** Retirer le gagnant de `election.pending` ; mettre à jour `dataVersion` et `changelog`.
- **Archive.** Noter le résultat sourcé dans l'archive.
- **Configuration**, pour ne plus dépendre de `--include` :
  - dans `config.json`, retirer `pendingPrimary` du gagnant (il reste à sa place dans la liste, qui fixe l'ordre de `positions.ts`) ;
  - retirer les quatre autres de `candidates` ;
  - déplacer leurs fichiers `add-candidate/<id>.json` dans `add-candidate/non-retenus/`, que `build-pack` ne lit pas ;
  - BUILD.
- **Gel.** Hors fenêtres de gel (`freezeWindows`).

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

## Annexe : contrats entre les maillons

| Maillon | Lit | Écrit |
|---|---|---|
| `1-research.js` + `extract-journal.mjs` | `CONFIG` | `$D/dossier_<id>.json`, `refresh_<id>.json`, `cleavages_<famille>.json`, `facts-check.json` |
| `split-research.mjs` | `config.json`, les fichiers ci-dessus, `reuseDossier` (`research/choisir-2027/dossier_<id>.json`) | `$D/groups/<famille>.json` |
| `2-question-bank.js` | `groups/<famille>.json`, dossiers, `research/choisir-2027/bank.json` (questions reprises) | `drafts` (questions, approches et questions marquées `reuseOf`), `stats`, `neutrality`, `critic` → `question-bank-output.json` |
| `build-reuse.mjs` | `question-bank-output.json`, `decisions.json`, `research/choisir-2027/bank.json`, `src/ui/videos/series/` | `$D/reuse.json` `{ from, questions, approaches, videoTopics }` |
| `build-pack.mjs` | sortie de la banque, extensions, `config.json`, `decisions.json`, `explainers.json`, `explainer-charts.json`, `reuse.json`, `add-candidate/*.json` | `bank.ts`, `positions.ts`, `videos.ts` (`videoScope = { topics: série → thème, questions: question de la primaire → question d'ici }`), `$D/bank.json` (`bank`, `positions`, `prepared`), `revisions.json`, `build-log.txt` |
| `3-bank-expansion.js` + `merge-expansion.mjs` | `$D/bank.json`, dossiers, groupes | `expansion-merged.json` (`drafts`, `neutrality.edits`, `gapFills`) |
| `6-add-candidate.js` | `$D/bank.json`, dossier (+ `refresh`), `reuse.json` | `add-candidate/<id>.json` (`candidate`, `positions[]` avec `verdict`, plus `card` et `portrait` pour la session) |
| `4-explainers.js` + `merge-explainers.mjs` | `$D/bank.json`, explications publiées (`from`) | `explainers.json`, `explainer-charts.json`, `explainers-log.txt` |
| `7-spectrum-review.js` | `reuse.json`, `research/choisir-2027/{config,bank,explainers}.json`, séries | `spectrum-review.json` (corrections proposées, `excludedSeries`, `videoTopics`, `explanationsOnHold`) |
| `5-candidates.js` | `CONFIG` | `candidates`, `portraits`, `downloads`, `credits` → `candidates.ts`, `media/` |
| `audit-pack.mjs` | `bank.ts`, `positions.ts`, `candidates.ts` (sinon `config.json`), `config.quality` | `$D/audit.json` |

**Ce qui reste propre à la primaire, à dessein :**
- `tools/workflows/1-research.js`, non modifié pendant la recherche en cours. Son prompt de complément nomme la primaire et fixe une liste de thèmes à compléter. À rendre générique après la recherche, comme 2 à 7.
- Le chemin historique de `split-research.mjs`, choisi parce que la configuration de la primaire n'a ni `topics` ni `groups`.
- Les reconstructions de la primaire, qui doivent rester identiques.
