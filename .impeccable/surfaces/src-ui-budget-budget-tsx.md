---
version: 1
slug: "src-ui-budget-budget-tsx"
primary_target: "src/ui/budget/Budget.tsx"
related_targets: ["src/core/budget","src/styles/budget.css"]
---

# Surface : « Faire les comptes » (#/comptes)

Mode : Operate (une personne, un téléphone d'abord ; un jeu sérieux de budget, assez ludique, sans score). Monde : « Le dépouillement », inchangé (DESIGN.md).

Tâche : choisir un objectif de déficit (ou aucun), régler des leviers officiels sourcés (76, en trois familles : 32 impôts et cotisations, 27 dépenses de l’État et des services publics, 17 protection sociale), voir le déficit 2027 en % du PIB bouger en fourchette, puis lire « Votre budget 2027 ». Le jeu ne lit pas la feuille de réponses ; rien n'est enregistré ni transmis.

Décisions du propriétaire (17-18/10/2026) : établi neutre sans amorce par les réponses (la porte G1/G4 a refusé l'amorce) ; accès par le menu, le pied de l'accueil et « Et maintenant » ; dans chaque famille, les 3 leviers sur les plus grosses lignes du budget d'abord (montant publié ; règle révisée le 18/10 après la revue), « Plus de leviers » pour le reste ; solde en déficit en % du PIB depuis la prévision du PLF 2027 (5,0 %, projet non voté, PIB 3 135 Md€) ; objectifs au choix : garder le déficit prévu, le réduire de moitié, revenir sous 3 %, pas d'objectif ; ludique permis ici (objectif, bande en direct, « objectif atteint »), jamais de points, classement, badge ni couleur par signe. Structure hybride choisie le 18/10 (voir FORM).

Non résolu : sens exact de « effet par cran » quand les unités diffèrent (point, %, ETP) ; TVA en brut ou net ; chaîne État-opérateur (audiovisuel public) ; crans au-delà de ce que chiffre la source ; image à partager (absente en v1) ; canal de correction (contact@isoloir.app sans DNS).

## Direction contract

THESIS : un budget se règle comme on parcourt des rayons : chaque famille défile de côté, la fiche touchée s'ouvre en carte et se règle au cran ou au curseur, et la bande du déficit répond à chaque geste ; refuse le simulateur-tableur à cinquante curseurs et le jeu à score.

OWN-WORLD : papier blanc, imprimé noir pour les faits (montants publiés, PLF, sources) ; fiches sur les aplats pastel du rideau dans l'ordre du drapé, sans aucun sens, coiffées du filet épais ; bleu bille pour tout ce que la personne règle (cran choisi, curseur, valeur, sa fourchette sur la bande) et pour l'action principale ; chiffres condensés tabulaires ; aucun rouge ni vert pour le signe.

STORY : la personne choisit un objectif, voit le déficit prévu, ouvre une fiche, règle, voit la bande et le total de la famille bouger, recommence, puis lit son budget : ce qu'elle a réglé, ce qui reste à trouver, ce que le calcul ne compte pas.

FIRST VIEWPORT : en-tête du site ; bande collante du déficit 2027 (fourchette en grand chiffre condensé, axe de 0 à 6 %, repère PLF 5,0 %, drapeau de l'objectif, fourchette en bille, phrase « encore X à Y Md€ ») ; trois rayons titrés (famille, total réglé, « 3 sur N ») de fiches pastel, la suivante dépassant du bord ; barre du bas : Objectif, « N leviers réglés », « Mon budget » en aplat bille. Signature : la bande qui suit le curseur en direct, avec le total de la famille.

FORM : hybride voulu par le propriétaire sur la page de décision : « Les rayons par famille » (challenger, rayons), la carte d'« Une carte par levier » (3e de ma liste) à l'ouverture d'une fiche, les crans en boutons de « La double page » (7e) en plus d'un curseur à pas fin. seed:f51c038bab506773

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
