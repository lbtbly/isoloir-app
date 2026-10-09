# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + Preact + TypeScript (choisi par l'utilisateur). Site 100 % statique, sans serveur ni API : build dans `dist/`, hébergeable sur n'importe quel hébergeur statique. Tests avec Vitest. Hébergeur de production : non décidé ; l'adresse inscrite dans le code (`APP_URL`, reprise par l'image partagée et les balises d'aperçu) est `https://isoloir.vercel.app`.

## Users

Les électrices et électeurs français qui envisagent de voter à une élection et hésitent entre plusieurs candidats. La première élection couverte est la primaire « Choisir 2027 » (PS, Place publique, GRS), avec 5 candidats et un vote en ligne les 9-10 et 16-17 octobre 2026.

Ils consultent l'outil surtout sur téléphone, souvent après avoir vu le résultat d'un proche partagé en image sur les réseaux sociaux ou en messagerie. Leur tâche : comprendre quel candidat porte les idées les plus proches des leurs, sans se laisser influencer par les noms, en quelques minutes, puis éventuellement approfondir.

## Product Purpose

Isoloir aide un citoyen à se positionner par rapport aux candidats d'une élection.

1. **Questionnaire rapide.** Environ 20 questions sur les grands sujets, en deux temps : une **première tendance après 8 questions**, puis le reste jusqu'au dépouillement. La tendance est présentée comme provisoire (ordre et paliers, sans pourcentage ni affiche) et invite à continuer : un bêta-testeur avait pris l'ancien « premier dépouillement » pour une fin, et le jugeait trop maigre pour vraiment savoir. Chaque question propose plusieurs approches présentées **sans dire qui les porte**. Pour chacune, l'utilisateur dit s'il est **d'accord**, **sans avis** ou **pas d'accord**, et peut tracer une **ligne rouge** sur celles qu'il juge inacceptables.
2. **Score d'affinité.** Un pourcentage par candidat, détaillé par thème. Ensuite seulement, l'outil révèle qui porte quelle approche, pour montrer la proximité.
3. **Questionnaire approfondi.** Environ 50 questions supplémentaires, pour affiner le score.
4. **Sortie.** L'utilisateur peut télécharger ses données (JSON) et partager son positionnement en image JPG (une fois la tendance devenue dépouillement).

Le succès, c'est un électeur qui termine le questionnaire, comprend pourquoi tel candidat lui ressemble et en sort mieux informé, que l'outil confirme ou contredise son intuition de départ.

## Positioning

- **Tout reste dans l'isoloir.** Les réponses ne quittent jamais l'appareil (sauf si l'utilisateur exporte lui-même son double ou son affiche) : pas de serveur qui les reçoive, pas de compte, pas d'analytics, pas de cookie. Une Content-Security-Policy interdit techniquement tout envoi en arrière-plan. L'éditeur ne traite ainsi aucune donnée d'opinion politique ; seul l'hébergeur voit, comme pour toute page web, l'adresse IP et la page demandée (voir la notice de confidentialité).
- **Les idées avant les noms.** Les approches sont anonymes pendant le questionnaire, et l'attribution, sourcée, n'arrive qu'à la fin, question par question : dès la première tendance pour les questions déjà vues, jamais pour celles qui restent à voir.
- **Une base réutilisable.** Le moteur est générique et chaque élection est un « pack » de données. La primaire Choisir 2027 est la première, d'autres suivront.

## Operating Context

- Ouverture depuis un lien partagé, sur mobile, entre deux tâches. La première tendance (8 questions) prend environ 5 minutes, le questionnaire rapide complet une dizaine : l'interface parle en nombre de questions, jamais en minutes.
- La progression est sauvegardée automatiquement dans le navigateur (localStorage). Un bouton « Tout effacer » supprime tout.
- L'image JPG partagée sert de porte d'entrée pour de nouveaux visiteurs, tout comme l'aperçu du lien dans les messageries (WhatsApp, Signal, iMessage…) : une image fixe, `public/og.png`, qui donne envie d'ouvrir sans montrer aucun candidat.
- Les données ont une date de vérification. Elles sont mises à jour entre les débats et entre les deux tours : il faudra renseigner les finalistes du 2nd tour le 11/10/2026.

## Capabilities and Constraints

- **Interface :** en français.
- **Anonymat structurel :** le questionnaire n'a pas accès aux positions des candidats.
- **Sources :** chaque attribution candidat → approche est sourcée (URL, titre, date). Une attribution incertaine devient « position inconnue », jamais une supposition.
- **Ligne rouge :** une approche peut être marquée inacceptable. Elle est notée « pas d'accord », et les candidats qui la portent sont classés après les autres avec leur score inchangé : c'est un filtre visible, pas une pénalité.
- **Pondération :** l'utilisateur peut choisir jusqu'à 3 thèmes prioritaires.
- **Comparaison :** deux à quatre candidats côte à côte, comme dans le comparateur d'un site marchand (`#/comparer/<id>,<id>…`, adresse partageable) : un tableau, une colonne par candidat sous un en-tête collant, une ligne par question rangée par thème, la position de chacun en clair dans sa case ; même approche, approche compatible, opposition radicale et position inconnue se lisent dans la ligne, et déplier un thème montre les résumés et les sources. Une lecture des positions, pas un score : ni réponses de la personne, ni pondération, ni classement ; une position inconnue reste inconnue. La sélection n'est enregistrée nulle part (mémoire de la page et adresse).
- **Export / import :** JSON des réponses et des scores.
- **Partage :** image JPG générée localement (Canvas), via la Web Share API ou en téléchargement ; elle porte le logo. L'aperçu des liens partagés est une image fixe, servie avec le site et lue par les applications de messagerie (balises Open Graph) ; la page ne la charge pas.
- **Non décidé :** hébergeur, nom de domaine, nom définitif (« Isoloir » est provisoire et défini par une constante ; le mot du logo, lui, est dessiné dans `src/core/brand.ts` et serait à redessiner).

## Brand Commitments

- **Nom de travail :** Isoloir. Il ne doit jamais imiter l'identité visuelle ni le nom du site officiel « Choisir 2027 » ou des partis.
- **Logo (depuis le 2026-10-04, fourni par le propriétaire) :** un isoloir vu de face, disque d'encre parfaitement rond où la personne se découpe en « i », rideau tiré en quatre bandes pastel (vert, rouge, jaune, bleu) ; le mot « isoloir » en bas de casse. À la demande du propriétaire, les quatre couleurs couvrent ensemble tout l'échiquier politique, pour que la marque n'en privilégie aucune partie ; aucune n'est associée à une position de l'échiquier ; dans l'interface, les mêmes pastels éclaircis habillent les aplats, dans un ordre fixe et sans aucun sens. Ils ne servent jamais à désigner un candidat, un parti ou un avis.
- **Éditeur :** un citoyen indépendant, sans affiliation à un candidat, un parti ou un organisateur. C'est affiché clairement.
- **À ne jamais faire :**
  - rien de partisan ou militant : pas de ton de tract, et pas de couleurs ni de codes visuels de parti, sauf sur la page des candidats de la présidentielle, où, à la demande du propriétaire (8 octobre 2026), chaque carte porte la couleur et le logo du parti, dans l'ordre de la grille officielle des nuances du ministère de l'Intérieur ; jamais dans le questionnaire ni dans le résultat ;
  - rien de ludique ou gamifié : pas de badges, de confettis ni de ton de quiz, qui banaliseraient le vote.

## Evidence on Hand

- Dossiers de recherche sourcés sur les 5 candidats, les lignes de fracture et les débats (LCI 23/09, France 2 01/10), plus une étude méthodologique des boussoles électorales. Le tout est dans `research/choisir-2027/`.
- Retours de tests, consignés dans `.impeccable/surfaces/src-app-tsx.md` : premier test utilisateur (03/10/2026) ; premier bêta-testeur (04/10/2026 : point d'étape à 8 questions pris pour une fin, réponse neutre peu lisible, pastilles de « Qui porte quoi » lues comme un accord avec l'utilisateur).
- Logo : l'image d'origine fournie par le propriétaire (`.impeccable/brand/logo-reference.webp`) et la planche de contrôle des SVG redessinés (`.impeccable/brand/planche.png`).
- **Absences à ne pas combler par invention :**
  - pas de photos des candidats : on utilise leurs initiales ;
  - pas de logos officiels, sauf ceux des partis sur la page des candidats de la présidentielle (décision du propriétaire, 8 octobre 2026) ;
  - pas de témoignages, de chiffres d'utilisation ni de partenariats ;
  - pas de sondages présentés comme résultats de l'outil.

## Product Principles

1. **La neutralité est une propriété du système, pas un slogan.** Elle passe par l'ordre mélangé, des formulations sans signature, l'équilibre entre candidats, des sources visibles et une méthode publiée.
2. **La vie privée se prouve par construction.** On ne promet que ce que la technique garantit.
3. **Mieux vaut dire « inconnu » que deviner.** L'incertitude est affichée, pas masquée.
4. **Le citoyen comprend son résultat.** Chaque pourcentage peut être déplié jusqu'aux positions et à leurs sources.
5. **Rapide d'abord, profond ensuite.** Le parcours court suffit pour avoir un résultat ; l'approfondissement est un choix.

## Accessibility & Inclusion

Conformité visée : RGAA 4.1 / WCAG 2.2 AA.

- Navigation complète au clavier et au lecteur d'écran.
- Contrastes AA.
- Texte courant ≥ 16 px.
- Respect de `prefers-reduced-motion`.
- Mobile d'abord (390 px), sans dépendre du survol : aucune information réservée à une infobulle (« Qui porte quoi » a une légende visible).
- Langage clair : approches formulées sans jargon, sigles explicités.
