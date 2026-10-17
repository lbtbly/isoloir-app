# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + Preact + TypeScript (choisi par l'utilisateur). Site 100 % statique, sans serveur ni API : build dans `dist/`, hébergeable sur n'importe quel hébergeur statique. Tests avec Vitest. Hébergeur de production : non décidé ; l'adresse inscrite dans le code (`APP_URL`, reprise par l'image partagée et les balises d'aperçu) est `https://isoloir.vercel.app`.

## Users

Les électrices et électeurs français qui envisagent de voter à une élection et hésitent entre plusieurs candidats. L'élection couverte est la présidentielle 2027 (candidats déclarés, premier tour le 18 avril 2027). La première avait été la primaire « Choisir 2027 » (PS, Place publique, GRS ; 5 candidats, vote en ligne du 9 au 11 octobre 2026) : elle n'est plus en ligne depuis le 12 octobre 2026.

Ils consultent l'outil surtout sur téléphone, souvent après avoir vu le résultat d'un proche partagé en image sur les réseaux sociaux ou en messagerie. Leur tâche : comprendre quel candidat porte les idées les plus proches des leurs, sans se laisser influencer par les noms, en quelques minutes, puis éventuellement approfondir.

## Product Purpose

Isoloir aide un citoyen à se positionner par rapport aux candidats d'une élection.

1. **Questionnaire rapide.** Une vingtaine de questions (22 pour la présidentielle) sur les grands sujets, en deux temps : une **première tendance après 8 questions**, puis le reste jusqu'au dépouillement. La tendance est présentée comme provisoire (ordre et paliers, sans pourcentage ni affiche) et invite à continuer : un bêta-testeur avait pris l'ancien « premier dépouillement » pour une fin, et le jugeait trop maigre pour vraiment savoir. Chaque question propose plusieurs approches présentées **sans dire qui les porte**. Pour chacune, l'utilisateur dit s'il est **d'accord**, **sans avis** ou **pas d'accord**, et peut tracer une **ligne rouge** sur celles qu'il juge inacceptables.
2. **Score d'affinité.** Un pourcentage par candidat, détaillé par thème. Ensuite seulement, l'outil révèle qui porte quelle approche, pour montrer la proximité.
3. **Questionnaire approfondi.** Environ 50 questions supplémentaires, pour affiner le score.
4. **Sortie.** L'utilisateur peut télécharger ses données (JSON) et partager son positionnement en image JPG (une fois la tendance devenue dépouillement).

Le succès, c'est un électeur qui termine le questionnaire, comprend pourquoi tel candidat lui ressemble et en sort mieux informé, que l'outil confirme ou contredise son intuition de départ.

## Positioning

- **Tout reste dans l'isoloir.** Les réponses ne quittent jamais l'appareil (sauf si l'utilisateur exporte lui-même son double ou son affiche) : pas de serveur qui les reçoive, pas de compte, pas d'analytics, pas de cookie. Une Content-Security-Policy interdit techniquement tout envoi en arrière-plan. L'éditeur ne traite ainsi aucune donnée d'opinion politique ; seul l'hébergeur voit, comme pour toute page web, l'adresse IP et la page demandée (voir la notice de confidentialité).
- **Les idées avant les noms.** Les approches sont anonymes pendant le questionnaire, et l'attribution, sourcée, n'arrive qu'à la fin, question par question : dès la première tendance pour les questions déjà vues, jamais pour celles qui restent à voir.
- **Une base réutilisable.** Le moteur est générique et chaque élection est un « pack » de données. La primaire Choisir 2027 a été la première, la présidentielle 2027 la deuxième ; d'autres suivront.

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
- **À table (`#/a-table`, depuis le 2026-10-14) :** de 3 à 12 personnes, un seul téléphone (à 3, le secret est plus fragile, et la page le dit). Chacun vote en secret sur la feuille du site (réglette et ligne rouge), sur 2 à 4 sujets tirés d'un vivier fixé par une règle publiée ; la table lit ensuite son dépouillement à voix haute, une idée par écran (« vous réunit », « la table refuse », « vous divise »), peut en parler et refaire un tour de table, puis découvre qui porte ces idées. Rien n'est enregistré ni transmis : des compteurs en mémoire, aucun bulletin, aucun nombre exact aux deux bouts. Pendant une séance, le mode est fermé (ni menu, ni lien, ni vidéo, ni la feuille du propriétaire du téléphone). L'image de la table, sans valeur statistique, n'est fabriquée qu'avec l'accord de toute la table et jamais pendant le gel. Ce n'est pas un sondage : un groupe privé compté en entier, sur l'appareil.
- **Installer l'application (`#/installer`, depuis le 2026-10-17) :** Isoloir sur l'écran d'accueil, le Dock ou le menu Démarrer, sans magasin d'applications ni compte (manifeste d'application web). La page reconnaît sur place l'appareil et le navigateur, et montre leurs gestes, schémas au trait ; les autres sont dans une liste repliée. Sur iPhone, iPad et le Safari du Mac, l'application a son propre espace, vide au départ : on copie d'abord le code de ses réponses dans le navigateur (« Copier le code »), puis on le colle dans l'application (« Importer mes réponses », « Coller le code ») ; Isoloir vide ensuite le presse-papiers (jamais un texte sans rapport collé puis effacé). Firefox sous Windows : l'application peut démarrer vide, le code se colle alors dans le champ de l'import. Sur Android et avec Chrome ou Edge, l'application lit les réponses du navigateur ; le bouton « Installer Isoloir » n'apparaît que si le navigateur sait installer, et jamais d'invite de lui-même. Sur ordinateur, un QR code n'ouvre que l'adresse de la page. Dans l'application ouverte vide, l'accueil dit comment faire passer ses réponses (« Je n'avais pas répondu » ferme l'avis). Au démarrage, Isoloir demande au navigateur de ne pas effacer de lui-même les réponses gardées (sauf dans Firefox, qui poserait une question). Les libellés des menus non vus sur un vrai appareil restent prudents, à relever.
- **Non décidé :** hébergeur, nom de domaine, nom définitif (« Isoloir » est provisoire et défini par une constante ; le mot du logo, lui, est dessiné dans `src/core/brand.ts` et serait à redessiner).

## Brand Commitments

- **Nom de travail :** Isoloir. Il ne doit jamais imiter l'identité visuelle ni le nom du site officiel « Choisir 2027 » ou des partis.
- **Logo (depuis le 2026-10-04, fourni par le propriétaire) :** un isoloir vu de face, disque d'encre parfaitement rond où la personne se découpe en « i », rideau tiré en quatre bandes pastel (vert, rouge, jaune, bleu) ; le mot « isoloir » en bas de casse. À la demande du propriétaire, les quatre couleurs couvrent ensemble tout l'échiquier politique, pour que la marque n'en privilégie aucune partie ; aucune n'est associée à une position de l'échiquier ; dans l'interface, les mêmes pastels éclaircis habillent les aplats, dans un ordre fixe et sans aucun sens. Ils ne servent jamais à désigner un candidat, un parti ou un avis.
- **Éditeur :** un citoyen indépendant, sans affiliation à un candidat, un parti ou un organisateur. C'est affiché clairement.
- **À ne jamais faire :**
  - rien de partisan ou militant : pas de ton de tract, et pas de couleurs ni de codes visuels de parti, sauf sur la page des candidats de la présidentielle, où, à la demande du propriétaire (8 octobre 2026), chaque carte porte le logo du parti, dans l'ordre de la grille officielle des nuances du ministère de l'Intérieur, sur le pastel de son bloc (rouge à gauche, jaune au centre, bleu à droite, vert pour « Autres » : décision du 10 octobre 2026, jamais les couleurs des partis) ; jamais dans le questionnaire ni dans le résultat, sauf la page « Mon profil politique » (décision du 12 octobre 2026), qui reprend les blocs de la grille pour situer les réponses après le dépouillement, sujet par sujet, sans couleur de bloc ni logo : chaque case y prend la couleur de l'échelle d'affinité du site, du rouge foncé de « très éloigné » au vert foncé de « très proche », selon l'affinité moyenne avec les candidats du bloc sur ce sujet, toujours avec le mot de son palier (décision du propriétaire du 12 octobre 2026 au soir, « pour simplifier », qui remplace les couleurs de blocs de l'après-midi : le rouge y aurait dit à la fois « gauche » et « loin » ; prise en connaissance de cause, une mesure ayant montré qu'un « début de tendance » statistique ne tient pas). Les symboles ▲ et ▽ en sont retirés (« ils ne servent plus à rien avec les couleurs ») : ce qui se distingue nettement des autres façons de poser les mêmes avis se dit en mots (« nettement plus près », « nettement plus loin »), par le compte en tête, le rangement des sujets et la phrase d'une ligne ouverte ; jamais de synthèse globale, de point ni d'étiquette. Depuis le 15 octobre 2026 (décisions du propriétaire), la page ne tire plus rien au sort : les mêmes réponses donnent toujours la même lecture, comparée à toutes les autres façons de poser les mêmes avis (comptées jusqu'à cent mille, au-delà une borne prudente, qui peut manquer une lecture mais n'en invente jamais, l'avant et l'après, mesurés sur les mêmes réponses, publiés dans la Méthode et au journal) ; les sujets y sont groupés domaine par domaine ; quand les réponses ne permettent pas de conclure (une seule question, rien de net, trop peu de façons, des avis tous pareils), un affichage dédié le dit comme un constat, sans cause prêtée à la personne, et seulement ce qui est vrai de ses réponses ; le chapeau rappelle que c'est une lecture, pas un conseil de vote, et que le classement est dans Résultats ; le mot « hasard » n'y dit plus la comparaison. Ensuite (lot 2), la page pose sur ses lignes ce qu'elle sait déjà de la feuille, sans rien changer aux lectures : sous un bloc nettement plus près d'une ligne ouverte, une croix nomme ceux de ses candidats qui franchissent une ligne rouge posée sur ce sujet (« pourrait franchir » quand leur position est déduite), et le détail dit qui franchit chaque ligne rouge ; un thème prioritaire le dit sur sa ligne (« prioritaire »), dans son détail (il compte double dans le classement, pas dans cette lecture) et dans la fiche « Pour lire plus de thèmes » ; la neutralité de la croix, bloc par bloc, avec et sans le candidat, est mesurée et publiée dans la Méthode, sur la banque comme au seul questionnaire rapide, et celle de « pourrait franchir » aussi, avec ce qui n'est pas établi. Puis (lot 3), une ligne ouverte d'une lecture nette dit ce qui pèse le plus dans cette lecture : la question dont les avis changent le plus l'affinité avec le bloc, posés de toutes les autres façons sur ses approches, l'avis qui y compte le plus, le texte entier de l'approche, et ce qu'elle est pour les candidats que la grille classe là, en nombres, sans aucun nom (« Approche principale de 2 des 4 candidats que la grille classe… », « … des 2 candidats connus ici… » quand d'autres n'ont pas de position sur le sujet) ; le détail donne la part de chaque question, en points, qui font exactement l'écart affiché ; calcul exact, sans tirage, fait à l'ouverture de la ligne seulement ; sa neutralité, bloc par bloc, avec et sans le candidat, est mesurée et publiée dans la Méthode, avec ce qui n'est pas établi. Enfin (lot 4), après les domaines, une phrase sans titre dit la façon de répondre, seulement quand elle pèse sur les couleurs (« Sur 31 questions sur 41, vos réponses sont en majorité des « pas d'accord » : une case « éloigné », seule, dit peu ; les lectures nettes en tiennent compte. », ou « d'accord » et « proche ») : quand au moins 9 des cases mises à l'épreuve sur 10 ont leur point de comparaison du même côté (sur les seuls sujets qui ont une autre façon de poser les mêmes avis) et que plus de la moitié des questions répondues vont dans ce sens, donc jamais avec des avis uniformes ; son taux d'affichage, par façon de répondre puis bloc par bloc, avec et sans le candidat, est mesuré et publié dans la Méthode, avec ce qui n'est pas établi (l'ordre entre blocs compris) et ce qu'il suit, feuille par feuille, la part des « pas d'accord ». Depuis le 14 octobre 2026 (« trop caché »), la page s'annonce dès l'accueil, par une grille fictive et neutre étiquetée « Exemple fictif », et suit l'affiche du plus proche au dépouillement complet ; avant la fin du questionnaire rapide, elle dit ce qui manque et ramène aux questions, et ensuite elle encourage à approfondir les thèmes qui n'ont qu'une question ; toujours sans couleur de bloc ni logo ;
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
