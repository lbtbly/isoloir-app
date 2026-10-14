---
version: 1
slug: "src-ui-table-table-tsx"
primary_target: "src/ui/table/Table.tsx"
related_targets: ["src/ui/questionnaire/table","src/core/table","src/styles/table.css"]
---

# Surface : « À table » (#/a-table)

Mode : Operate (un groupe de 3 à 12 personnes (dès 3 depuis le 2026-10-14), un seul téléphone, autour d'une table). Monde : « Le dépouillement », inchangé (DESIGN.md).

Tâche : chacun vote en secret, sur la réglette du site (pas d'accord / sans avis / d'accord, plus la ligne rouge), sur 2 à 4 questions tirées d'un vivier fixé par une règle ; puis la table lit son dépouillement ensemble, à voix haute, une idée après l'autre ; puis « Qui porte ces idées ? ». Rien n'est enregistré ni transmis ; le propriétaire du téléphone ne voit jamais les bulletins, ni sa propre feuille pendant la séance.

Décisions du propriétaire (14/10/2026) : nom « À table » (pas « Ce qui nous rassemble », écho au RN) ; bulletin = la réglette du site ; dépouillement sur pastels ; structure « À voix haute » (choisie sur la page de décision, esquisse .impeccable/mocks/decision/a-voix-haute.html). Mode à distance refusé.

Non résolu : seuils exacts (après simulation et essai réel), 2 ou 3 sujets par défaut, partage de l'image (absent en v1), Wake Lock.

## Direction contract

THESIS : le résultat d'un groupe se lit à voix haute, une idée par écran, comme on lit les résultats d'un bureau de vote ; refuse la liste-tableau de bord où l'on cherche son propre vote.

OWN-WORLD : papier blanc et imprimé noir ; un bandeau pastel du rideau par verdict, coiffé du filet épais (vert « vous réunit », rouge « la table refuse », jaune « vous divise », blanc « pas d'avis net ») ; bâtons bleu bille par paquets de cinq ; croix rouge stylo pour les lignes rouges ; mots aux deux bouts au lieu de nombres.

STORY : la table comprend d'abord ce qui la réunit, puis ce qu'elle refuse, puis ce qui la divise ; elle peut en parler et refaire un tour de table ; elle découvre ensuite qui porte ces idées, sans jamais savoir qui a voté quoi.

FIRST VIEWPORT : en-tête fermé (logo sans lien, « À table », « Idée 2 sur 7 ») ; bandeau du verdict en 30 px 850 sur toute la largeur ; question en gris ; idée en 27 px 750 ; tableau D'accord / Sans avis / Pas d'accord en bâtons ou en mots ; points de pagination ; barre du bas Précédente / Suivante, l'action principale à droite.

FORM : « À voix haute », 2e de ma liste ordonnée (dealt 3, 2, 5) ; seed 53d027e5.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
