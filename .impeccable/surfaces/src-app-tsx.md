---
version: 1
slug: "src-app-tsx"
primary_target: "src/app.tsx"
related_targets: ["src/ui", "src/core/brand.ts", "src/styles/brand.css", "src/core/shareImage.ts"]
---

# Surface : application Isoloir (accueil, questionnaire, priorités, résultats, proximité, méthode)

Mode : Operate. Le visiteur accomplit une tâche : se positionner et comprendre sa proximité avec les candidats.

- **Audience et tâche :** des électeurs sur mobile, souvent arrivés via une image partagée ou l'aperçu d'un lien. Ils obtiennent une première tendance après 8 questions (amendé le 2026-10-04 : ce n'est plus un « premier dépouillement »), la complètent avec 11 de plus jusqu'au dépouillement, puis approfondissent (~50 questions) s'ils le souhaitent.
- **Actions :**
  - placer un repère sur la réglette d'avis de chaque approche (pas d'accord, sans avis, d'accord) ;
  - tracer une ligne rouge sur celles qui sont inacceptables ;
  - passer une question ;
  - fermer l'isoloir : passer en mode avion, tout continue de marcher (le cadenas de la barre du bas ouvre une fenêtre de détails) ;
  - lire « Comprendre l'enjeu » : contexte et chiffres clés sourcés de chaque question, dans la colonne de gauche ;
  - consulter « Les candidats » : parcours, portrait sous licence libre, site de campagne, toutes leurs positions avec leurs sources ;
  - choisir jusqu'à 3 thèmes prioritaires ;
  - lire le dépouillement ;
  - télécharger son double (JSON) ;
  - partager l'image (JPG) ;
  - tout effacer.
- **Preuve :** les positions sourcées (URL, titre, date), la date de vérification des données, la méthode publiée, la CSP qui interdit toute connexion, et le mode avion (le site marche hors ligne jusqu'au bout).
- **Contraintes :**
  - jamais d'attribution visible pendant le questionnaire ;
  - aucune couleur ni aucun code de parti ;
  - rien de ludique : pas de badges, pas de confettis ;
  - français, RGAA/WCAG AA, 390 px d'abord.
- **Moment mémorable :** le dépouillement. Vos avis sont comptés en bâtons, candidat par candidat, et l'imprimé révèle qui porte chaque approche.
- **Retours du premier test utilisateur (2026-10-03) :** trop long avant un premier résultat ; il manquait un « pas d'accord » entre « me convient » et « inacceptable » ; autocensure par peur que les réponses partent sur Internet.
- **Retours du premier bêta-testeur (2026-10-04) :** le point d'étape à 8 questions n'était pas clair (on aurait dit que c'était fini, et trop peu pour vraiment savoir) ; la réponse neutre n'était pas lisible, faute d'être entourée comme les autres ; dans « Qui porte quoi », sans curseur sur mobile pour ouvrir les infobulles, des testeurs ont cru que les candidats d'accord avec une approche étaient alignés sur leur propre avis. Voir l'amendement du 2026-10-04.
- **Non résolu :**
  - nom définitif ;
  - hébergeur ;
  - finalistes du 2nd tour (11/10).

## Direction contract

THESIS: Isoloir est une feuille de pointage de bureau de vote. On place un repère sur la réglette d'avis de chaque approche anonyme (pas d'accord, sans avis, d'accord), puis un dépouillement révèle qui les porte. On refuse l'arrangement par défaut de la catégorie : cartes arrondies, barre de progression bleue, résultats en barres avec photos.

AMENDMENT (2026-10-04, à la demande du propriétaire, après le retour d'un bêta-testeur ; le propriétaire a fourni en même temps le logo et demandé un quatrième pastel, bleu, pour couvrir l'échiquier). La thèse tient. Ce qui change :
- **La tendance à 8 questions.** Le point d'étape ne ressemble plus à un verdict. L'écran s'intitule « Une première tendance » et garde le tampon « Résultat provisoire » ; à la place de l'affiche du plus proche, une fiche imprimée « Où vous en êtes » compte les questions en bâtons (8 sur 19 au bleu bille, les 11 à venir en crans pointillés), dit que la suite peut encore changer l'ordre et porte un bouton large « Continuer : 11 questions », repris par la barre du bas. « La tendance pour l'instant » classe en bâtons et en paliers nommés, sans pourcentage ; ni affiche, ni « Par thème », ni « Ce qui les sépare », ni partage ; « Sans attendre » ne propose que « Qui porte quoi ». L'accueil y renvoie par « Voir la tendance », et la fin du film annonce « Une première tendance dès 8 questions. ».
- **« Sans avis » entouré.** Le cran neutre est un cran comme les autres : dès l'état de départ, point plein gris, boucle grise, mot « Sans avis » écrit dessous. Chaque ligne réserve la place du mot.
- **« Qui porte quoi » lisible sans survol.** Une légende encadrée en tête de page sépare « Votre avis » (les quatre mini-réglettes) de « Ce qu'en pensent les candidats » (quatre pastilles d'exemple nommées) et dit en clair que les pastilles disent ce que le candidat pense de l'approche, pas s'il pense comme vous. Les pastilles d'initiales prennent le code de la réglette : vert plein (approche principale), vert pâle (compatible), orangé-brun en tirets barrés (rejet ; jamais le rouge, réservé à la ligne rouge), gris en pointillé (inconnue) ; la forme double toujours la couleur. Mêmes pastilles sur les fiches bristol. À partir de 46rem, des en-têtes « Vous, Approche, Candidats ».
- **Le logo.** L'horizontal (pictogramme, puis le mot « isoloir ») remplace la marque « ISOLOIR » en capitales dans l'en-tête de chaque écran ; pictogramme seul quand la place manque. Il signe aussi l'affiche JPG, l'image d'aperçu des liens et les icônes (onglet, écran d'accueil). Source unique : `src/core/brand.ts`.
- **Quatre pastels.** Les bandes du rideau (vert, rouge, jaune, bleu), éclaircies, remplacent les teintes bristol et les aplats pris dans l'échelle d'affinité : fiches bristol, index des candidats, « Et maintenant », toujours dans l'ordre du drapé selon la place. Un décor qui couvre tout l'échiquier ensemble et ne désigne personne ; l'échelle d'affinité garde ses propres teintes pour les avis et les scores.

OWN-WORLD:
- **Papier :** papier blanc froid sous une grille de formulaire pré-imprimée en noir d'imprimerie (filets, cases, numéros de ligne, étiquettes de champ).
- **Encres de l'électeur :** son avis sur la réglette est tracé dans le ton de son cran (échelle rouge → vert des résultats, toujours doublé de son libellé) ; ses lignes rouges au stylo rouge ; le bleu bille compte (bâtons, ×2). Jaune autocopiant pour le double (export, image). Tampon daté pour la vérification des données, tampon « provisoire » pour la première tendance (amendé le 2026-10-04).
- **Pastels du rideau (amendé le 2026-10-04) :** les quatre bandes du logo, éclaircies, en fond des aplats et des fiches, dans l'ordre du drapé ; un décor sans sens, jamais une donnée.
- **Interdits :** aucun gris décoratif, aucune couleur de parti, aucune couleur sans libellé (seule exception, amendée le 2026-10-04 : les quatre pastels du rideau, qui ne qualifient rien).

STORY (amendé le 2026-10-04) : Le visiteur comprend qu'il remplit une feuille anonyme et que rien ne sort de l'isoloir. Il donne son avis vite, d'un toucher par approche (le centre, « Sans avis », est entouré tant qu'il n'y touche pas), et voit ses bâtons s'additionner par cinq ; une première tendance arrive après 8 questions, qui l'invite à continuer. Il assiste au dépouillement, sources à l'appui, lit « Qui porte quoi » grâce à sa légende, puis garde son double ou partage l'affiche.

FIRST VIEWPORT:
- **En haut :** l'en-tête de formulaire (logo Isoloir, feuille de pointage, nom de l'élection ; amendé le 2026-10-04).
- **Titre :** à l'échelle d'une affiche, à gauche.
- **Règles :** une consigne à la première question (repère sur la réglette, ligne rouge, passer).
- **Garantie :** la mention « rien ne quitte cet appareil » imprimée en pied.
- **Marge :** le tampon de date de vérification.
- **Action primaire :** « Commencer la feuille », pleine largeur, dans la zone du pouce.
- **Interaction signature :** les bâtons de pointage tracés à l'encre dans la marge, groupés par cinq.

FORM: Le dépouillement (procès-verbal et feuilles de pointage), position 5 de la liste ordonnée, seed key 08895c43.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
