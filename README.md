# Isoloir

Isoloir est une boussole électorale indépendante qui tourne **entièrement dans le navigateur**. Il fonctionne ainsi :

1. Vous donnez votre avis sur des approches **anonymes** (personne n'est nommé pendant le questionnaire), sur une réglette à trois crans : pas d'accord, sans avis, d'accord.
2. Vous pouvez tracer une **ligne rouge** sur celles qui vous sont inacceptables.
3. Une **première tendance** arrive après 8 questions : l'ordre des candidats en bâtons et en paliers (sans pourcentage), présenté comme provisoire, et « qui porte quoi » sur ces 8 questions, sources à l'appui. Onze questions de plus donnent le **dépouillement** complet : pourcentages d'affinité, détail par thème, affiche à partager.

Première élection couverte : la primaire **Choisir 2027** (PS, Place publique, GRS ; 9-10 et 16-17 octobre 2026).

- **Aucune réponse ne quitte l'appareil.** Pas de serveur qui reçoive les réponses, pas de compte, pas de cookie, pas d'analytics. Une `Content-Security-Policy` (`connect-src 'none'`) interdit toute connexion sortante depuis la page. Comme pour toute page web, l'hébergeur voit seulement l'adresse IP, la page demandée et le navigateur (notice de confidentialité, `#/confidentialite`).
- **« Fermez l'isoloir ».** Une fois la page chargée, tout marche en **mode avion**, jusqu'au résultat, à l'image et à l'export, y compris après un rechargement. Un service worker garde une copie des fichiers du site ; il ne fait que les servir, et le build vérifie qu'il n'envoie rien.
- **Sauvegarde locale** de la progression (localStorage), avec un bouton « Tout effacer ».
- **Export** de vos réponses et de vos scores en JSON (avec réimport), et **image JPG** de partage générée en Canvas sur l'appareil.
- **Aperçu des liens** : une image fixe (`public/og.png`) s'affiche sous l'adresse partagée dans WhatsApp, Signal, iMessage, etc.
- **Comprendre l'enjeu** : chaque question a un contexte (explications et chiffres clés), chaque chiffre vérifié automatiquement, par une IA, contre sa source officielle (`research/<id>/explainers.json`).
- **Textes rédigés par IA, étiquetés** : questions, approches, fiches de contexte, résumés des positions, parcours et textes des vidéos sont rédigés par une IA (Claude, d'Anthropic) à partir des sources citées et vérifiés automatiquement, sans être relus un par un par une personne. Chacun porte en tête, là où il apparaît, une mention « Rédigé par IA » ou équivalente (`src/ui/components/AiLabel.tsx`), y compris sur chaque question de la feuille, qui renvoie à la rubrique « Usage de l'IA » de la méthode (`#/methode/ia`). Le calcul, lui, n'utilise aucune IA.
- **Les candidats** : une page par candidat, avec un portrait sous licence libre (provenance dans `src/elections/<id>/media/CREDITS.md`), un parcours sourcé, le lien vers son site de campagne et toutes ses positions, thème par thème, avec leurs sources. Le questionnaire, lui, reste anonyme.

## Démarrer

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # moteur de score + intégrité et audits de chaque élection
pnpm build      # site statique dans dist/, CSP injectée, service worker généré, contrôles de dist/
pnpm preview    # sert dist/ en local
pnpm e2e        # après pnpm build : parcours complet en mode avion (Playwright)
```

Le dossier `dist/` est un site statique (chemins relatifs, routage par `#`). On peut le déposer tel quel sur GitHub Pages, Netlify, Vercel, un hébergement OVH, etc.

Avant la mise en ligne, vérifiez `APP_URL` dans `src/core/app.ts` et complétez `src/core/legal.ts`. `APP_URL` (actuellement `https://isoloir.vercel.app`) est l'adresse affichée sur l'image ; les balises d'aperçu d'`index.html` (`og:url`, `og:image`, `twitter:image`) la répètent en dur : changez-les ensemble.

`src/core/legal.ts` est la seule source de l'identité de l'éditeur (nom, adresse, téléphone : il est aussi directeur de la publication) et de l'adresse de contact (`CONTACT_EMAIL`, avec le fournisseur de la messagerie, `CONTACT_MESSAGERIE`, que la notice de confidentialité nomme). Les pages « Mentions légales » (`#/mentions-legales`) et « Confidentialité » l'affichent ; `REPORT_URL` (lien « Signalez-la » de la méthode) en est tiré en `mailto:`. Tant qu'une valeur commence par « [à compléter », elle s'affiche encadrée de tirets, aucun lien n'est actif, et `tools/check-dist.mjs` avertit au build (sans échouer). Le nom figure aussi, à la main, dans `LICENSE`.

## Architecture

```
src/core/          moteur générique : types, score, hasard seedé, stockage, export, image, marque (brand.ts)
src/elections/     un dossier par élection (« pack ») + registre index.ts
src/ui/questionnaire/  feuille de pointage : n'a PAS accès aux candidats ni aux positions
src/ui/screens/    accueil, priorités, résultats, qui porte quoi, approfondir, partage, notices
research/<id>/     dossiers de recherche sourcés, banque fusionnée, décisions éditoriales
tools/             extraction et construction des données, scripts de workflow réutilisables, marque et aperçu
public/            logo (brand/), icônes, favicon, image d'aperçu des liens (og.png)
PRODUCT.md, DESIGN.md, .impeccable/   contexte produit et système visuel (Impeccable) ; logo d'origine dans .impeccable/brand/
```

**Anonymat structurel.** Les modules de `src/ui/questionnaire/` ne peuvent importer ni les candidats ni les positions. Deux garde-fous le vérifient : une règle ESLint et un test qui parcourt le graphe d'imports.

## Méthode de calcul (résumé)

La méthode complète est publiée dans l'app, page « Méthode ».

- **Vote évaluatif.** Chaque cran de la réglette vaut un avis : pas d'accord −1, sans avis 0, d'accord +1. Chaque candidat a, par question, une approche principale (poids 2), parfois une approche compatible (poids 1), et peut en rejeter explicitement une (−1).
- **Score d'une question.** `x = Σ poids × avis / Σ |poids|`, ramené entre 0 et 100 % par `(x + 1) / 2`. 50 % est le neutre : aucun avis sur ce que porte le candidat.
- **Positions inconnues.** Elles sont exclues du calcul du seul candidat concerné. On lisse vers 50 % selon la couverture (k = 2), et la couverture est affichée.
- **Pondération.** Les thèmes pèsent autant, quel que soit leur nombre de questions. On peut choisir jusqu'à 3 thèmes prioritaires, qui comptent double.
- **Lignes rouges.** C'est un filtre visible et non une pénalité : les candidats qui portent l'approche sont classés après les autres, avec leur score inchangé. Une ligne rouge place toujours la réglette sur « pas d'accord ».
- **Garde-fous.** Les ex aequo sont départagés au hasard, jamais par l'ordre du code. Un écart de moins de 5 points est signalé comme non significatif. On vérifie aussi que le premier reste stable avec une méthode simplifiée.

## Marque et aperçu des liens

Le logo n'a qu'une source : `src/core/brand.ts` (géométrie et couleurs : disque, « i » en réserve, rideau en quatre pastels, mot « isoloir » dessiné sans police). Le composant `Logo` l'affiche dans l'en-tête, `drawLogo` le dessine sur l'image partagée, et deux scripts en tirent les fichiers statiques, avec Playwright (Chromium) :

```bash
node tools/build-brand.mjs   # public/brand/*.svg (9 fichiers), favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png
node tools/build-og.mjs      # public/og.png, 1200 × 630, image d'aperçu des liens (échoue au-delà de 300 Ko)
```

Il faut Node 22.18+ ou 23.6+ : `brand.ts` est importé tel quel. Les SVG existent en trois dispositions (`horizontal`, `stacked`, `mark`) et trois versions (`color`, `grey`, `white`). Règles d'usage (taille minimale, zone de protection, fonds) : DESIGN.md, « Logo ».

Les quatre pastels de l'interface (`--pastel-*` dans `src/styles/tokens.css`) sont les bandes du rideau, éclaircies : un décor distribué dans un ordre fixe, qui ne désigne ni un candidat ni un parti.

## Ajouter une élection

1. Créer `src/elections/<id>/` qui exporte un `ElectionPack` (`election`, `candidates`, `bank`, `positions`), puis l'ajouter à `src/elections/index.ts`.
2. Renseigner `forbiddenTerms` : partis des candidats, slogans, noms de mesures signatures. Les tests vérifient qu'aucun ne figure dans les questions.
3. Produire les données avec les workflows de `tools/workflows/`, à adapter : liste des candidats, thèmes, quotas.
   - `1-research.js` : un dossier sourcé par candidat, les lignes de fracture et la méthodologie.
   - `2-question-bank.js` : questions neutres et matrice des positions par groupe de thèmes, fact-check adversarial de chaque attribution, contrôle de neutralité et critique de complétude (passes menées par une IA).
   - `3-bank-expansion.js` : exploitation des documents officiels (professions de foi, programmes), questions approfondies supplémentaires, compléments de positions inconnues, nouveau fact-check.
4. Puis :
   ```bash
   node tools/extract-journal.mjs <journal.jsonl> research/<id>
   node tools/split-research.mjs research/<id>
   node tools/merge-expansion.mjs <sortie-extension.json> research/<id>/expansion-merged.json
   node tools/build-pack.mjs <sortie-workflow.json> research/<id> src/elections/<id> research/<id>/expansion-merged.json
   pnpm test
   pnpm build && node tools/capture.mjs   # captures de revue dans .impeccable/review/
   ```
   `research/<id>/decisions.json` consigne les arbitrages éditoriaux : changements de niveau, suppressions, refus de reformulation, corrections de positions, `step1`, la liste des questions du premier temps (la première tendance), et `lastInStep`, les questions qui ferment toujours leur temps au lieu d'être placées au hasard (ici la question sur LFI, dernière du premier temps).

## Versions des questions

`tools/build-pack.mjs` tient à jour `research/<id>/revisions.json` : chaque question y a un numéro de révision et son texte de référence.

- **Retouche de forme** : moins de 15 % de caractères modifiés sur l'énoncé et sur chaque approche, sans approche ajoutée ni retirée. La révision est gardée, et les réponses restent valables.
- **Changement de fond** : la révision augmente. Le build les liste.

Quand `revisionTracking` est actif dans `election.ts`, une réponse donnée sur une autre révision est retirée du calcul et proposée dans une feuille de révision (`#/revision`), y compris à l'import d'un double.

- **Phase de test** : `revisionTracking: false`. Les réponses sont gardées quoi qu'il arrive.
- **Mise en production** : reconstruire avec `node tools/build-pack.mjs … --reset-revisions`, puis passer `revisionTracking` à `true`.

`pnpm test` applique les tests d'intégrité et les audits à toutes les élections du registre :
- sources présentes ;
- au plus une approche principale par candidat et par question ;
- au moins 4 candidats sur 5 connus dans le questionnaire rapide, les 5 sur chaque question du premier temps ;
- aucun nom dans les textes ;
- auto-cohérence, sur tout le questionnaire et sur le premier temps seul ;
- « tout noter au même cran » donne une égalité ;
- distribution des premières places sur des profils aléatoires (la fourchette affichée sur l'accueil est vérifiée).

## Mettre à jour les données d'une élection en cours

- Après un débat : relancer le fact-check sur les thèmes concernés, mettre à jour `dataVersion`, `dataFrozenAt` et `changelog` dans `election.ts`.
- Entre deux tours : renseigner `finalists` dans `election.ts`. Les résultats proposent alors de n'afficher que les finalistes.

## Licences

Le dépôt est privé pour l'instant. Quand il sera rendu public :

- **le code** est sous licence MIT (fichier `LICENSE`) ;
- **les contenus propres au site** (questions, approches, positions rédigées, fiches de contexte rédigées) sont sous licence [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.fr).

Ne sont pas couverts par ces licences :

- **le logo** d'Isoloir (`src/core/brand.ts`, `public/brand/`, `.impeccable/brand/`, icônes, et l'image d'aperçu `public/og.png` qui le reprend), dessiné par l'éditeur : tous droits réservés ;
- **les photos des candidats** (`src/elections/<id>/media/`) : chacune garde sa licence, détaillée dans `media/CREDITS.md` et affichée dans les mentions légales ;
- **les citations et données publiques** reprises des sources (positions citées, chiffres de contexte) : elles restent soumises aux conditions de leurs auteurs ;
- **Preact** (MIT, © Jason Miller) et **la police Archivo** (SIL Open Font License 1.1, © The Archivo Project Authors) : leurs notices complètes sont dans `src/core/notices.ts` et affichées dans les mentions légales.

Avant de rendre le dépôt public, relire `research/`, qui contient de longs extraits de sources (voir `research/juridique/inventaire-2026-10-04.md`, § 16).

Isoloir est un outil indépendant, sans lien avec les organisateurs ni avec les candidats. Ce n'est pas une consigne de vote.
