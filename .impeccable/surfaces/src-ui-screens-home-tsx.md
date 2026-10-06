---
version: 1
slug: "src-ui-screens-home-tsx"
primary_target: "src/ui/screens/Home.tsx"
related_targets: ["src/ui/film", "src/styles/film.css", "src/ui/components/FormHeader.tsx", "src/ui/components/Journey.tsx", "src/ui/components/Logo.tsx", "src/styles/brand.css", "index.html", "public/og.png"]
---

# Surface : accueil d'Isoloir

Mode : Persuade, dans le monde établi « Le dépouillement » (DESIGN.md). Le visiteur doit comprendre l'outil, lui faire confiance et commencer la feuille.

- **Public :** électeurs arrivés par un lien ou par l'image partagée par un proche, souvent sur mobile.
- **Ce qu'il faut croire :**
  - l'outil est sans biais (approches sans nom, ordre aléatoire, audit) ;
  - les positions sont sourcées et vérifiées ;
  - rien ne quitte l'appareil (RGPD).
- **Preuve :** le film en cinq scènes sur un exemple fictif (héros), un exemple fictif manipulable en trois panneaux reliés (« À vous d'essayer »), les schémas au trait, des chiffres calculés depuis les données, la section « Les candidats ».
- **Contraintes :**
  - l'exemple est fictif et étiqueté comme tel, pour ne jamais influencer les vraies réponses (dans le film comme dans la démonstration) ;
  - pas de candidat réel dans le film ni dans la démonstration ;
  - pas de couleur de parti.

## Direction contract

THESIS: L'accueil raconte le geste en trois grands panneaux colorés, vivants et reliés : je donne mon avis, on dépouille, je partage. On refuse la page d'accueil de catégorie (gros chiffres, cartes d'icônes, arguments en slogans) et la feuille blanche austère que l'utilisateur a jugée « terne et triste ».

AMENDMENT (2026-10-03, à la demande du propriétaire, après le test du film sur la page #/film : le film « doit s'intégrer dans la page, c'est tout le hero » ; « simplifier la page au maximum »). La thèse tient, mais l'accueil s'ouvre désormais sur un film qui montre, avant la démonstration qui fait toucher :
- **Le héros est le film en cinq scènes** (Des idées, Votre avis, Le dépouillement, Rien ne part, Votre affiche), sur un exemple fictif, dessiné dans les encres de la feuille. Sans cadre ni filet autour de la scène : il est posé sur la page. Sans titre visible (le h1 « Isoloir : pointez les idées qui vous ressemblent » reste réservé aux lecteurs d'écran) et sans surtitre « Comment marche Isoloir » : chaque scène porte son propre titre et sa phrase. Sous la scène, un bouton lecture/pause au trait et les cinq chapitres en règles numérotées ; la mention « Exemple fictif : ces candidats n'existent pas, et les pourcentages sont illustratifs. » ferme le film.
- **Une seule barre :** l'appel principal passe dans l'en-tête collant, toujours visible, à droite de la marque : « Commencer la feuille », « Reprendre la feuille », « Voir mon dépouillement » ou « Répondre aux N nouvelles questions », réduit sur écran étroit à « Commencer », « Reprendre », « Mon dépouillement », « Répondre ». Plus de barre d'actions en bas de l'accueil, plus d'appel final en bas de page, plus de lien « Passer et commencer » : il n'y a rien à sauter, l'appel est toujours là. La fin de la scène 5 reprend le même appel (même lien, même libellé), avec « Un premier résultat en 8 questions. » au premier passage seulement.
- **La démonstration devient « À vous d'essayer »**, sous le film et la preuve : mêmes trois panneaux reliés, même geste, sous un titre de partie.
- **Sous le film :** pour qui revient, l'état de la feuille (feuille en cours, date des 19 réponses, questions ajoutées, questions à revoir) ; puis, pour tous, la liste de confiance et le tampon daté sur un filet.
- **Mouvement réduit :** le film ne démarre pas. Chaque chapitre montre son image fixe, l'état final de sa scène, et se choisit d'un toucher ; « Lire le film » lance l'animation à la demande, depuis le chapitre affiché.
- La page de test #/film est supprimée.

AMENDMENT (2026-10-04, à la demande du propriétaire, après le retour d'un bêta-testeur ; le propriétaire a fourni le logo et demandé d'ajouter un bleu pastel aux trois couleurs existantes pour couvrir tout l'échiquier). La thèse et le film tiennent. Ce qui change sur l'accueil :
- **Le logo dans l'en-tête.** Le logo horizontal (le pictogramme, isoloir rond au rideau en quatre pastels, puis le mot « isoloir » en bas de casse) remplace la marque « ISOLOIR » en capitales, à gauche de l'appel ; il se centre dans la hauteur de l'appel, le nom de l'élection garde la ligne de base du mot. En texte très agrandi, il reste entier (1.5rem) et l'appel passe dessous. L'onglet porte le pictogramme (favicon), l'écran d'accueil du téléphone ses icônes.
- **Quatre aplats au lieu de trois.** Les aplats de « À vous d'essayer » prennent les pastels du rideau, dans l'ordre du drapé : vert pâle (votre avis), rouge pâle (le dépouillement), puis le jaune autocopiant de l'affiche, qui reste celui du double ; le bleu pastel, quatrième bande, devient le fond de « Fermez l'isoloir », juste après. Les teintes « Très proche » et « Éloigné » de l'échelle d'affinité ne servent plus de fonds. Aucun pastel ne désigne un parti ni un candidat : ensemble, ils couvrent l'échiquier.
- **« Sans avis » entouré dans la démonstration.** La réglette de « À vous d'essayer » est celle de la feuille : au départ, chaque approche porte déjà le cran central entouré de gris, avec « Sans avis » écrit dessous.
- **Tendance plutôt que résultat.** La note de fin du film devient « Une première tendance dès 8 questions. » ; sous le film, pour une feuille en cours dont le premier temps est fini, le lien devient « Voir la tendance ».
- **L'aperçu des liens.** Partagé dans WhatsApp, Signal, iMessage et les autres, le lien de l'accueil s'affiche avec une image fixe (`public/og.png`, 1200 × 630) qui reprend la feuille : logo, double filet, « Pointez les idées qui vous ressemblent. » avec « idées » entouré au stylo vert, la promesse (des idées sans le nom des candidats, rien ne quitte votre téléphone) et une réglette où « D'accord » est entouré. C'est désormais, avec l'affiche JPG, une porte d'entrée de l'accueil ; rien n'y est animé ni fictif à étiqueter, puisqu'aucun candidat n'y figure.

OWN-WORLD: Le monde « Le dépouillement » (DESIGN.md), réchauffé pour l'accueil :
- feuille blanche et imprimé noir pour le texte ;
- le logo en tête (amendé le 2026-10-04) ;
- les aplats pris dans les quatre pastels du rideau, dans l'ordre du drapé (amendé le 2026-10-04 ; avant : vert pâle de « Très proche » et orangé pâle de « Éloigné ») : vert pâle (votre avis), rouge pâle (le dépouillement), jaune autocopiant (l'affiche, qui est bien le double qu'on emporte), bleu pâle (« Fermez l'isoloir ») ;
- réglette d'avis dans le ton de son cran, stylo rouge pour la ligne rouge, bleu bille pour compter ;
- bâtons de pointage, tampon daté, schémas au trait ;
- le film reprend ces mêmes encres et ces mêmes tracés, sans rien ajouter : le jaune n'y apparaît que sur le double de la scène 5 ;
- aucune couleur de parti.

STORY (amendé le 2026-10-03) : Le visiteur arrive sur le film, qui se joue seul : on juge des idées sans les noms, on pose son avis sur la réglette et une ligne rouge, on dépouille en bâtons sur l'appareil, l'isoloir se ferme en mode avion, on garde son affiche. Il peut sauter à un chapitre, mettre en pause, ou commencer à tout moment depuis l'en-tête. Plus bas, il vérifie la liste de confiance et le tampon, puis essaie lui-même dans « À vous d'essayer » : il touche une réglette dans le premier panneau ; dans le deuxième, les bâtons des trois candidats fictifs se comptent sous ses yeux ; dans le troisième, l'affiche se met à jour. Il vérifie les garanties (mode avion, sans biais, sources), découvre les cinq candidats, et commence sa feuille par l'en-tête. (Avant cet amendement, il lisait d'abord une promesse et touchait la démonstration en premier.)

FIRST VIEWPORT (amendé le 2026-10-03 ; remplace le titre-affiche « Pointez les idées… », sa promesse, le bouton large « Commencer la feuille » et la barre fixe du bas) :
- **Mobile :** l'en-tête collant, une seule barre : logo horizontal (amendé le 2026-10-04 ; avant : marque ISOLOIR), nom de l'élection sous le logo, appel au libellé court à droite (« Commencer »). Dessous, la scène 1 du film : le numéro condensé devant le titre « Des idées, pas des noms. » (« idées » entouré au stylo vert), la phrase, puis l'image (la question fictive et ses trois approches, dont les noms basculent en « ? ») ; ensuite lecture/pause, les chapitres 1 à 5 en numéros seuls, et « Exemple fictif ». On parle en nombre de questions, jamais en minutes. Texte très agrandi : la marque, puis l'appel sur toute une rangée.
- **Bureau :** l'appel complet (« Commencer la feuille ») à droite de l'en-tête, sur la ligne de la marque. Dès 48rem de largeur de film, légende à gauche (5fr) et image à droite (7fr), centrées l'une sur l'autre ; la scène remplit l'écran sous l'en-tête en gardant visibles lecture/pause et les cinq chapitres titrés.

SIGNATURE INTERACTION (amendé le 2026-10-03) : le film se joue seul, une fois (cinq scènes de 6 à 7,5 s), et se pilote par ses chapitres : toucher une règle numérotée reprend cette scène à son début ; le filet de la scène en cours se trace en noir pendant sa durée, les scènes vues gardent un filet épais ; à la fin, « Revoir ». Il se met en pause quand la page est masquée ou qu'il sort de l'écran. La démonstration « À vous d'essayer » garde son geste, un seul geste, trois réponses : toucher un cran dans le panneau 1 (exemple fictif étiqueté) redessine en direct les bâtons et les pourcentages du panneau 2 et l'affiche jaune du panneau 3 ; sur téléphone, après le premier avis, un repère invite à glisser vers le panneau suivant.

MOTION: les bâtons se tracent au trait (55ms par bâton), les pourcentages roulent, l'affiche se réimprime d'un fondu court. Amendement du 2026-10-03, à la demande du propriétaire (« plus dynamique, sans en faire trop ») : sous le premier écran, chaque bloc entre une fois d'un léger glissé (1.25rem, 520-760ms, ease-out), en cascade de 110ms entre voisins ; les trois panneaux du parcours entrent ensemble ; le filet des titres de section se trace de gauche à droite (sauf en contraste forcé). Rien de ce qui est visible au chargement ne bouge ; rien d'autre ne bouge ; tout est instantané sous mouvement réduit. Second amendement du 2026-10-03, à la demande du propriétaire : le film est la seule chose qui bouge d'elle-même au chargement, parce qu'il explique. Ses gestes sont ceux de la feuille (trait d'encre qui se dessine, fondu, montée de 0.6rem, tampon qui se pose, croix au stylo rouge, bâtons, pourcentage qui roule, rideau qui se tire, double jaune qui sort de sous la feuille), en ease-out, sans rebond ; la pause fige tout. Les entrées au défilement ne concernent que ce qui est sous le film. Sous mouvement réduit : le film ne démarre pas, chaque chapitre montre son image fixe, « Lire le film » l'anime à la demande ; aucune entrée au défilement.

FORM: Le héros est « Le film du principe » (test #/film validé par le propriétaire le 2026-10-03, intégré sans cadre ni titre, l'appel principal fusionné dans l'en-tête). Dessous, « Le parcours en trois gestes », choisi par l'utilisateur le 2026-10-03 (tirage Impeccable d982a1d1, scope surface, construction guidée par le code : pas de génération d'images), devenu « À vous d'essayer ». Le parcours remplaçait « La démonstration en direct » (seed bd77387f) ; le film remplace, en tête de page, le titre-affiche, la promesse et le bouton large.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
