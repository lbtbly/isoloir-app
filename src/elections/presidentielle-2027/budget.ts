// Fichier généré par tools/build-budget.mjs depuis research/presidentielle-2027/budget-levers.json : ne pas modifier à la main.
// « Faire les comptes » : 76 leviers sourcés, chargés à la demande par l'écran du jeu seulement.
import type { BudgetData } from '../../core/budget/types'

export const budget: BudgetData = {
  "version": "2026-10-18.2",
  "baseline": {
    "label": "PLF 2027 tel que déposé, projet non voté",
    "deficitPct": 5,
    "gdp": 3135,
    "source": {
      "title": "Projet de loi de finances pour 2027 (n° 3210)",
      "publisher": "Gouvernement, Assemblée nationale",
      "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
      "date": "2026-10-01",
      "accessedAt": "2026-10-17",
      "figure": "déficit public prévu de 5,0 % du PIB en 2027, PIB de 3 135 Md€"
    }
  },
  "levers": [
    {
      "id": "accise-carburants",
      "family": "impots",
      "label": "Accise sur les carburants (État)",
      "today": "16 303 M€ au PLF 2027 (produit net revenant à l’État)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % du produit de l’État (tarifs ajustés d’autant)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.16303,
        "hi": 0.16303
      },
      "base": {
        "value": 16.303,
        "label": "16,3 Md€ d’accise sur les carburants (produit net revenant à l’État) prévus au PLF 2027, état A, ligne 1501",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Accise sur les carburants, nette : 16 303 020 548 € prévus en 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 16.303,
        "label": "16 303 M€ d’accise sur les carburants revenant à l’État au PLF 2027 (produit net)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Statique, sans effet sur la consommation ; TVA sur l’accise et parts des collectivités non comptées. Pas de suppression (minima de la directive 2003/96/CE).",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Accise sur les carburants, nette : 16 303 020 548 € de recettes prévues en 2027"
        },
        {
          "title": "Directive 2003/96/CE du Conseil du 27 octobre 2003 restructurant le cadre communautaire de taxation des produits énergétiques et de l’électricité, article 4 et annexe I",
          "publisher": "Conseil de l’Union européenne (Journal officiel de l’Union européenne, EUR-Lex)",
          "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32003L0096",
          "date": "2003-10-31",
          "accessedAt": "2026-10-18",
          "figure": "Niveaux minima de taxation des carburants : gazole 330 €, essence sans plomb 359 € pour 1 000 litres"
        }
      ]
    },
    {
      "id": "accise-electricite",
      "family": "impots",
      "label": "Accise sur l’électricité (État)",
      "today": "5 115 M€ au PLF 2027 (produit net revenant à l’État)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % du produit de l’État (tarifs ajustés d’autant)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.05115,
        "hi": 0.05115
      },
      "base": {
        "value": 5.115,
        "label": "5,1 Md€ d’accise sur l’électricité (produit net revenant à l’État) prévus au PLF 2027, état A, ligne 1503",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Accise sur l’électricité, nette : 5 115 471 654 € prévus en 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 5.115,
        "label": "5 115 M€ d’accise sur l’électricité revenant à l’État au PLF 2027 (produit net)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Statique, sans effet sur la consommation ; TVA sur l’accise et parts des collectivités non comptées. Pas de suppression (minima de la directive 2003/96/CE).",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Accise sur l’électricité, nette : 5 115 471 654 € de recettes prévues en 2027"
        },
        {
          "title": "Directive 2003/96/CE du Conseil du 27 octobre 2003 restructurant le cadre communautaire de taxation des produits énergétiques et de l’électricité, article 4 et annexe I",
          "publisher": "Conseil de l’Union européenne (Journal officiel de l’Union européenne, EUR-Lex)",
          "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32003L0096",
          "date": "2003-10-31",
          "accessedAt": "2026-10-18",
          "figure": "Niveaux minima de taxation de l’électricité : 0,5 €/MWh (consommation professionnelle), 1,0 €/MWh (non professionnelle)"
        }
      ]
    },
    {
      "id": "age-legal-retraite",
      "family": "sociale",
      "label": "Âge légal de départ à la retraite",
      "today": "Suspension de la réforme de 2023 jusqu’au 1er janvier 2028",
      "kind": "options",
      "direction": "depense",
      "unit": {
        "label": "réglage",
        "short": "réglage"
      },
      "perUnit": {
        "lo": 0.8,
        "hi": 1.3
      },
      "base": {
        "value": 352.2,
        "label": "352,2 Md€ de pensions de retraite de droit direct versées par les administrations publiques en 2024, régimes de base et complémentaires compris (dernier chiffre publié pour tout le système de retraite ; DREES, comptes de la protection sociale)",
        "source": {
          "title": "La protection sociale en France et en Europe en 2024 – Résultats des comptes de la protection sociale, édition 2025, fiche 05 « Le risque vieillesse-survie », p. 54-55",
          "publisher": "Direction de la recherche, des études, de l’évaluation et des statistiques (DREES)",
          "url": "https://www.drees.solidarites-sante.gouv.fr/sites/default/files/2026-05/CPS2025%20-%20Fiche%2005%20-%20Le%20risque%20vieillesse-survie.pdf",
          "date": "2026-05",
          "accessedAt": "2026-10-18",
          "figure": "pensions de droit direct versées par les administrations publiques (régime général, régimes spéciaux, Agirc-Arrco, État…) : 352,2 Md€ en 2024 (+6,9 %) ; 359,7 Md€ avec les organismes d’assurance et fonds de pension ; réversions des administrations publiques à part (40,9 Md€)"
        }
      },
      "max": 1,
      "step": 1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "options": [
        {
          "id": "62-ans",
          "label": "62 ans : retour avant la réforme de 2023",
          "lo": 1.3,
          "hi": 1.3,
          "note": "Annule l’économie nette de la réforme en 2027 (2,1 Md€ moins 0,8 Md€ de suspension), sur les régimes alignés seulement (CCSS, octobre 2026)."
        },
        {
          "id": "suspension",
          "label": "Suspension jusqu’au 1er janvier 2028",
          "lo": 0,
          "hi": 0,
          "base": true,
          "note": "Le réglage du PLF 2027."
        },
        {
          "id": "reprise-64",
          "label": "Reprise du calendrier vers 64 ans dès 2027",
          "lo": -0.8,
          "hi": -0.8,
          "note": "Le coût de la suspension en 2027, sur le même champ (CCSS, octobre 2026). Pour tout le système, départs anticipés compris : 1,9 Md€ selon le Gouvernement (2025), hors fourchette."
        }
      ],
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "À terme, hors total (Cour des comptes, 2035, par rapport à 64 ans avant la suspension) : 63 ans coûterait 5,8 Md€ au système de retraite et 13 Md€ à l’ensemble des finances publiques ; 65 ans rapporterait jusqu’à 8,4 et 17,7 Md€. 65 ans n’a pas de chiffre pour 2027 : réglage non proposé.",
      "limits": "Régimes alignés seuls (59 % des pensions de base) : ni fonctionnaires, ni complémentaires, ni cotisations, donc en deçà de l’effet sur les APU. Système entier, départs anticipés compris : suspension à 1,9 Md€, hors fourchette. Une reprise n’annule pas les départs de 2026.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), synthèse (p. 20)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "régimes alignés (régime général et salariés agricoles) : réforme de 2023, 2,1 Md€ d’économies en 2027 ; suspension, 0,8 Md€ de coût en 2027 ; économie nette 1,3 Md€. D’où 62 ans = +1,3 Md€ et reprise vers 64 ans = −0,8 Md€"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), synthèse (p. 17)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "le champ des deux chiffres : 1,3 Md€ net pour le régime général et le régime agricole des salariés ; 0,8 Md€ de suspension sur le champ des régimes alignés (LURA), le même des deux côtés"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 2.5 « Les prestations de retraite » (p. 108)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "le champ des chiffres : les régimes alignés versent 59 % des pensions de base en 2026 (fonction publique 32 %, régimes spéciaux 6 %), sans les régimes complémentaires"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), encadré 3 de la fiche 2.5 (p. 113)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "la suspension touche aussi les fonctionnaires de l’État, la CNRACL et le FSPOEIE, hors du champ des 0,8 et 1,3 Md€"
        },
        {
          "title": "Rapport n° 131 (2025-2026) sur le projet de loi de financement de la sécurité sociale pour 2026, tome I, exposé général",
          "publisher": "Sénat, commission des affaires sociales",
          "url": "https://www.senat.fr/rap/l25-131-1/l25-131-1_mono.html",
          "date": "2025-11",
          "accessedAt": "2026-10-18",
          "figure": "note seulement, hors fourchette : coût de la suspension pour tout le système de retraite, départs anticipés compris, 1,9 Md€ en 2027 selon le Gouvernement (texte transmis au Sénat) ; aucun chiffre de ce champ pour un retour à 62 ans"
        },
        {
          "title": "Situation financière et perspectives du système de retraites, communication au Premier ministre, synthèse (p. 11)",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "à terme (2035) : 65 ans, jusqu’à 8,4 Md€ (système de retraite) et 17,7 Md€ (finances publiques) ; 63 ans, 5,8 Md€ et 13 Md€ de coût"
        }
      ]
    },
    {
      "id": "aides-logement-revalorisation",
      "family": "sociale",
      "label": "Revalorisation des aides au logement",
      "today": "Barème non revalorisé en 2027 (article 74 du PLF)",
      "kind": "options",
      "direction": "depense",
      "unit": {
        "label": "réglage de la révision au 1er octobre 2027",
        "short": "réglage"
      },
      "perUnit": {
        "lo": 0,
        "hi": 0
      },
      "base": {
        "value": 16.511,
        "label": "16,5 Md€ de charges du Fonds national d’aide au logement en 2027 (APL 7 482, ALS 5 582, ALF 3 282 et 165 M€ de frais de gestion), financées par l’État au PLF 2027 (programme 109) ; même ordre de grandeur que le levier « credits-aides-personnelles-logement » (16 520,5 M€ de crédits)",
        "source": {
          "title": "Projet annuel de performances 2027, mission Cohésion des territoires, programme 109, « Charges et ressources du Fnal en 2027 », p. 66",
          "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Charges prévisionnelles du Fnal et contribution de l’État : 16 511 M€ en 2027"
        }
      },
      "max": 1,
      "step": 1,
      "notches": [
        -1,
        0,
        1
      ],
      "baseLabel": "Gel",
      "options": [
        {
          "id": "baisse-miroir",
          "label": "Baisse d’autant au 1er octobre",
          "lo": -0.101,
          "hi": -0.101,
          "note": "Le miroir de la révision légale : les aides baisseraient en euros, aucune source ne chiffre ce cas."
        },
        {
          "id": "gel",
          "label": "Gel (PLF)",
          "lo": 0,
          "hi": 0,
          "base": true,
          "note": "Le réglage du PLF 2027 : paramètres non révisés en 2027."
        },
        {
          "id": "revision-legale",
          "label": "Révision légale au 1er octobre (IRL)",
          "lo": 0.101,
          "hi": 0.101,
          "note": "PLF 2027 : 101 M€ en 2027, la révision ne jouant que d’octobre à décembre."
        }
      ],
      "exclusiveWith": [
        "credits-aides-personnelles-logement"
      ],
      "operatorCaveat": false,
      "laterNote": "En année pleine, hors total : 404 M€ en 2028 (PLF 2027).",
      "limits": "Paramètres de loyer seulement, révisés au 1er octobre : trois mois comptent en 2027. En dessous du gel, le chiffre est le miroir de la révision : aucune source ne chiffre une baisse en euros. Gel des paramètres de ressources (décret) non chiffré ; loyers et recours non comptés.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, incidences budgétaires (p. 602)",
          "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "non-révision des paramètres de loyer au 1er octobre 2027 : 101 M€ d’économie en 2027, 404 M€ en 2028"
        },
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, tableau des incidences budgétaires (p. 602)",
          "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "les 101 M€ (2027) et 404 M€ (2028) valent pour l’ensemble des administrations publiques"
        },
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, situation actuelle (p. 596)",
          "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "calendrier : paramètres de loyer révisés au 1er octobre, paramètres de ressources au 1er janvier (d’où trois mois en 2027)"
        },
        {
          "title": "Projet annuel de performances 2027, mission Cohésion des territoires, programme 109 (p. 65)",
          "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "barème des APL non revalorisé en 2027 (point de départ)"
        },
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 « Effets budgétaires et redistributifs des mesures socio-fiscales », gel des prestations sociales (p. 46-47)",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "contexte, hors fourchette : gel de toutes les aides au logement en 2026 (inflation de 1,3 %), 200 M€ en année pleine"
        }
      ]
    },
    {
      "id": "allegements-generaux",
      "family": "impots",
      "label": "Allègements généraux de cotisations",
      "today": "72,8 Md€ prévus en 2027, moins 3,7 Md€ au PLFSS 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % du coût des allègements",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.69062,
        "hi": 0.702
      },
      "base": {
        "value": 72.762,
        "label": "72,8 Md€ d’allègements généraux prévus en 2027, tous attributaires, avant la mesure du PLFSS 2027 (−3,7 Md€ selon le HCFP, soit 69,1 Md€ calculé) ; chiffre publié du rapport CCSS d’octobre 2026, comme les autres lignes sociales",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.6 « Les dispositifs d’exonération en faveur de l’emploi », tableau 1, p. 67",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Allègements généraux : 72 762 M€ en 2027 (p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 69.062,
        "label": "69,1 Md€ d’allègements généraux en 2027 : 72,8 Md€ prévus (CCSS) moins 3,7 Md€ de mesure du PLFSS"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Une hausse des allègements est une recette en moins, comptée ici en dépenses. Bas : 1 % du coût 2027 avec le PLFSS ; haut : sensibilité de la DSS ramenée à ce coût. Emploi et impôt sur les sociétés non comptés.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, synthèse, tableau de sensibilité",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "−560 M€ de cotisations nettes des régimes de base pour 1 % de coût en plus (sensibilité publiée avec la prévision 2027 avant le PLFSS, coût de 72 762 M€) ; avec les 180 M€ de la note, 740 M€, soit 702 M€ ramenés au coût avec le PLFSS (× 69 062 / 72 762, calculé)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, synthèse, note du tableau de sensibilité",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "+180 M€ de charges pour les mécanismes de compensation de l’Agirc-Arrco et de l’Unédic : 740 M€ en tout avant le PLFSS"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.6, tableau 1 (dispositifs d’exonération)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "72 762 M€ d’allègements généraux en 2027 (p), tous attributaires, gel du barème de la RGDU compris, avant le PLFSS 2027"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.6 « Les dispositifs d’exonération en faveur de l’emploi »",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Le gel du barème de la RGDU décidé en 2026 joue en année pleine en 2027 (−5,6 Md€) : il est déjà compté dans les 72 762 M€"
        },
        {
          "title": "Avis n° 2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour 2027, tableau 7",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "3,7 Md€ d’allègements en moins en 2027 : mesure du PLFSS 2027 (compléments de salaire dans l’assiette), retirée des 72 762 M€"
        },
        {
          "title": "Avis n° 2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour 2027, tableau 7",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "Gel des allègements : 2,9 Md€ de plus en 2027, suite en année pleine du gel de 2026 (fiche 1.6 de la CCSS : −5,6 Md€ en 2027), donc déjà dans les 72 762 M€ et pas retiré une seconde fois"
        }
      ]
    },
    {
      "id": "c3s-taux",
      "family": "impots",
      "label": "Contribution de solidarité (C3S)",
      "today": "taux de 0,16 % du chiffre d’affaires, 5 466 M€ prévus en 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % du taux, soit 1 % du produit",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.044,
        "hi": 0.05466
      },
      "base": {
        "value": 5.466,
        "label": "5,5 Md€ de produit brut de la C3S prévus en 2027 (rapport CCSS d’octobre 2026, avant le PLFSS 2027)",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.4 « Les autres contributions, impôts et taxes », tableau 2, p. 61",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Produit brut de la C3S : 5 466 M€ en 2027 (p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "0,16 %",
      "amount": {
        "value": 5.466,
        "label": "5 466 M€ de C3S prévus en 2027 (CCSS)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Statique. Haut : 1 % du produit brut prévu en 2027. Bas : net du surcroît d’impôt sur les sociétés estimé par le Conseil des prélèvements obligatoires pour la suppression (chiffre 2025). Sans effet sur les prix, les marges ni l’activité.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, rapport à la Commission des comptes, octobre 2026, chapitre « Les recettes », tableau 2",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Produit brut de la C3S : 5 228 M€ (2024), 5 337 M€ (2025), 5 364 M€ (2026 p), 5 466 M€ (2027 p)"
        },
        {
          "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), orientation n° 2 « poursuivre l’allégement des impôts de production en privilégiant la suppression de la C3S », p. 126",
          "publisher": "Conseil des prélèvements obligatoires",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf",
          "date": "2025-09-22",
          "accessedAt": "2026-10-18",
          "figure": "Suppression de la C3S : rendement prévu de 5,4 Md€ en 2025 ; coût net estimé à 4,4 Md€ une fois compté le surcroît d’impôt sur les sociétés, soit 0,044 Md€ pour 1 % (bas de la fourchette)"
        },
        {
          "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), partie 3.4 « La C3S présente les plus forts effets de distorsion », p. 88",
          "publisher": "Conseil des prélèvements obligatoires",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf",
          "date": "2025-09-22",
          "accessedAt": "2026-10-18",
          "figure": "Taux nominal de la C3S : 0,16 % du chiffre d’affaires hors taxes des entreprises au-delà de 19 M€ (cran de base)"
        }
      ]
    },
    {
      "id": "contribution-exceptionnelle-grandes-entreprises",
      "family": "impots",
      "label": "Contribution exceptionnelle sur l’IS",
      "today": "15,7 % et 31,4 % de l’IS au PLF 2027, 5 Md€ (20,6 % et 41,2 % en 2026)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point du taux de 15,7 % (le taux de 31,4 % suit au double)",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.318,
        "hi": 0.34
      },
      "base": {
        "value": 5.2,
        "label": "5,2 Md€ de contribution exceptionnelle sur les bénéfices des grandes entreprises prévus au PLF 2027, état A, ligne 1441 (l’évaluation préalable de l’article 15 en attend 5 Md€ d’acomptes en 2027)",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Ligne 1441 : 5 200 000 000 € prévus en 2027"
        }
      },
      "max": 4.9,
      "step": 0.1,
      "notches": [
        -4.9,
        -2.5,
        0,
        2.5,
        4.9
      ],
      "baseLabel": "15,7 %",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "Les entreprises dont l’exercice ne se clôt pas au 31 décembre paient en 2028 : 500 M€ au taux du PLF, hors du total. La contribution ne vaut que pour cet exercice.",
      "limits": "Entreprises d’au moins 1,5 Md€ de chiffre d’affaires (31,4 % dès 3 Md€). Statique, proportionnel au taux, sans effet sur les bénéfices. Bas : 5 Md€ pour 15,7 points (acomptes de 2027, PLF) ; haut : 7 Md€ pour 20,6 points (2026, assiette de 2026). Plage : retour aux taux de 2026.",
      "sources": [
        {
          "title": "PLF 2027, évaluations préalables des articles, article 15 « Mise à contribution des grandes entreprises », p. 157",
          "publisher": "Gouvernement (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Prorogation d’un an aux taux de 15,7 % (première tranche) et 31,4 % (seconde), pour un chiffre d’affaires d’au moins 1,5 Md€"
        },
        {
          "title": "PLF 2027, évaluations préalables des articles, article 15 « Mise à contribution des grandes entreprises », p. 160",
          "publisher": "Gouvernement (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "5 Md€ d’acomptes en 2027 ; 500 M€ en 2028 (exercices dont la clôture est décalée)"
        },
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), exposé général des motifs, recettes fiscales, p. 20",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "5,0 Md€ en 2027, en diminution de 2,0 Md€ par rapport à 2026 (soit 7,0 Md€ en 2026)"
        },
        {
          "title": "Les notes du CPO n° 14, « Analyse de mesures nouvelles en recettes des projets de lois financières pour 2027 », § 4.1, p. 7",
          "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
          "url": "https://www.ccomptes.fr/sites/default/files/2026-10/20261015-note-CPO-Analyse-mesures-PLF-2027.pdf",
          "date": "2026-10-15",
          "accessedAt": "2026-10-18",
          "figure": "Seuil maintenu à 1,5 Md€, taux abaissés d’environ 24 % : 5 Md€ en 2027 contre 7 Md€ auparavant (2026)"
        },
        {
          "title": "BOFiP-Impôts, BOI-IS-AUT-60-20260812, « Contribution exceptionnelle sur les bénéfices des grandes entreprises », § 250",
          "publisher": "Direction générale des finances publiques (DGFiP)",
          "url": "https://bofip.impots.gouv.fr/bofip/14607-PGP.html/identifiant=BOI-IS-AUT-60-20260812",
          "date": "2026-08-12",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 20,6 % pour un chiffre d’affaires inférieur à 3 Md€ (deux premiers exercices clos à compter du 31 décembre 2025)"
        },
        {
          "title": "BOFiP-Impôts, BOI-IS-AUT-60-20260812, « Contribution exceptionnelle sur les bénéfices des grandes entreprises », § 260",
          "publisher": "Direction générale des finances publiques (DGFiP)",
          "url": "https://bofip.impots.gouv.fr/bofip/14607-PGP.html/identifiant=BOI-IS-AUT-60-20260812",
          "date": "2026-08-12",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 41,2 % pour un chiffre d’affaires d’au moins 3 Md€ (deux premiers exercices clos à compter du 31 décembre 2025), soit le double de 20,6 %"
        },
        {
          "title": "Rapport général n° 139 (2025-2026), tome II, fascicule 1, sur le projet de loi de finances pour 2026, p. 117",
          "publisher": "Sénat, commission des finances",
          "url": "https://www.senat.fr/rap/l25-139-21/l25-139-211.pdf",
          "date": "2025-11-24",
          "accessedAt": "2026-10-18",
          "figure": "8 Md€ en 2025 ; 4 Md€ en 2026 avec des taux divisés par deux à périmètre inchangé (rendement proportionnel au taux)"
        },
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Ligne 1441 : 5 200 000 000 € de recettes prévues en 2027 pour la contribution"
        }
      ]
    },
    {
      "id": "cotisations-exploitants-agricoles",
      "family": "impots",
      "label": "Agriculteurs : cotisations retraite",
      "today": "1 181 M€ prévus en 2027 (retraite de base des exploitants agricoles)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % des cotisations retraite de base",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.01181,
        "hi": 0.01181
      },
      "base": {
        "value": 1.181,
        "label": "1,2 Md€ de cotisations brutes de la retraite de base des exploitants agricoles prévus en 2027 (rapport CCSS d’octobre 2026, avant le PLFSS 2027)",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.9 « Régime des exploitants agricoles », tableau 2 (risque vieillesse du régime de base), p. 189",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cotisations sociales brutes du risque vieillesse de base des exploitants : 1 181 M€ en 2027 (p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 1.181,
        "label": "1 181 M€ de cotisations retraite de base des exploitants agricoles prévues en 2027 (CCSS)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Retraite de base seulement (hors complémentaire, maladie, famille, accidents du travail). Prévision avant le PLFSS 2027 ; l’effet sur l’impôt des exploitants n’est pas compté.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.9 « Régime des exploitants agricoles », tableau 2 (risque vieillesse du régime de base)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cotisations sociales brutes du risque vieillesse de base : 1 181 M€ en 2027 (p)"
        }
      ]
    },
    {
      "id": "cotisations-retraite",
      "family": "impots",
      "label": "Cotisations retraite de base",
      "today": "15,45 % sous plafond et 2,51 % déplafonné, inchangés en 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point de cotisation vieillesse",
        "short": "pt"
      },
      "perUnit": {
        "lo": 4.8,
        "hi": 7.6
      },
      "perUnitDown": {
        "lo": 4.8,
        "hi": 6.2
      },
      "base": {
        "value": 114.872,
        "label": "114,9 Md€ de cotisations sociales brutes de la CNAV prévues en 2027 (retraite de base du régime général, tous cotisants confondus, indépendants de l’ex-RSI compris), rapport CCSS d’octobre 2026, avant le PLFSS 2027",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.5 « Les comptes de la CNAV », tableau 1, p. 175",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cotisations sociales brutes de la CNAV : 114 872 M€ en 2027 (p), dernière colonne"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLFSS",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "Selon la Cour des comptes (modèle Mésange), 7 Md€ de cotisations en plus réduiraient l’année suivante le PIB de 0,13 point et l’emploi de 57 000 côté employeurs, de 0,17 point et 32 000 côté salariés. Hors du total.",
      "limits": "Valeurs 2025, nettes de l’allègement d’alors (jusqu’à 1,6 Smic), pas de la RGDU. Bas : part patronale sous plafond, faible part des employeurs publics comprise ; haut : part salariale déplafonnée (0,40 %). Une baisse vaut 4,8 à 6,2 Md€. Impôt sur le revenu, emploi non comptés.",
      "sources": [
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), page 76",
          "publisher": "Cour des comptes (tableau de la Direction de la sécurité sociale)",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "Entre 4,8 Md€ (part patronale sous plafond) et 7,6 Md€ (part salariale déplafonnée) par point, 2025"
        },
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), tableau n° 8",
          "publisher": "Cour des comptes (tableau de la Direction de la sécurité sociale)",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "Par point, 2025 : salariale sous plafond 6,2 Md€ ; patronale sous plafond 4,8 Md€ ; salariale déplafonnée 7,6 Md€ (taux 0,40 % : pas de baisse d’un point) ; patronale déplafonnée 6,2 Md€. Hausse 4,8 à 7,6 ; baisse 4,8 à 6,2"
        },
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), commentaire du tableau n° 8",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "Écart de 1,4 Md€ entre part salariale et part patronale, dû à la réduction générale : la part patronale est nette des allègements que l’État compense ; rendements « pour les finances publiques »"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.2 « Les cotisations », page 52 (cotisations des employeurs publics)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Les employeurs publics cotisent au régime général vieillesse pour leurs seuls contractuels : cette part, interne aux comptes publics, reste dans le bas patronal (4,8), faute de chiffre à part"
        },
        {
          "title": "1.4.1. Valeur du point de CSG et des points de cotisation du régime général",
          "publisher": "Direction de la sécurité sociale (REPSS)",
          "url": "https://evaluation.securite-sociale.fr/home/financement/1-4-1-valeur-du-point-de-csg-et.html",
          "date": "2026",
          "accessedAt": "2026-10-18",
          "figure": "Les points vieillesse portent « en quasi-totalité » sur le seul secteur privé : la part des employeurs publics dans le bas patronal est faible, contexte"
        },
        {
          "title": "1.4.1. Valeur du point de CSG et des points de cotisation du régime général",
          "publisher": "Direction de la sécurité sociale (REPSS)",
          "url": "https://evaluation.securite-sociale.fr/home/financement/1-4-1-valeur-du-point-de-csg-et.html",
          "date": "2026",
          "accessedAt": "2026-10-18",
          "figure": "6,3 Md€ (vieillesse plafonnée) et 7,3 Md€ (vieillesse déplafonnée) par point, 2025, valeurs théoriques avant exonérations : dans la fourchette, contexte"
        },
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), page 75 (taux)",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "15,45 % sous plafond (parts salariale et patronale) en 2025"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, synthèse, page 32 (recettes de la CNAV)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "+0,09 point de cotisation vieillesse en 2026 (part patronale déplafonnée de 2,02 % à 2,11 %)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.5 « Les comptes de la CNAV », page 176 (2027)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Pas de nouvelle hausse de taux en 2027 dans la prévision de la CCSS (avant les mesures du PLFSS)"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027, partie PLFSS « Équilibre financier et recettes », p. 6",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Pas de hausse générale des prélèvements sociaux au PLFSS 2027, ni de baisse de taux dans sa partie recettes : les taux de 2026 valent pour 2027"
        },
        {
          "title": "Les cotisations sociales (fiche du 20.06.2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Les-cotisations-sociales",
          "date": "2026-06-20",
          "accessedAt": "2026-10-18",
          "figure": "Taux au 1er juin 2026 au-dessus du plafond : retraite de base 2,11 % employeur et 0,4 % salarié, soit 2,51 % déplafonné (le total de 2,54 imprimé est une coquille)"
        },
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), page 76, note 138",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "Les valeurs 2025 de la part patronale déduisent l’allègement de l’époque, qui allait jusqu’à 1,6 Smic"
        },
        {
          "title": "Les cotisations sociales (fiche du 20.06.2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Les-cotisations-sociales",
          "date": "2026-06-20",
          "accessedAt": "2026-10-18",
          "figure": "Depuis 2026, la RGDU décroît jusqu’à 3,0 SMIC : la part patronale 2025 (allègement jusqu’à 1,6 Smic) n’est pas recalculée, contexte"
        },
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), page 76 (effets macroéconomiques, part patronale)",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "7 Md€ de cotisations patronales : −0,13 point de PIB et −57 000 emplois l’année suivante (note hors du total)"
        },
        {
          "title": "Situation financière et perspectives du système de retraites (février 2025), page 76 (effets macroéconomiques, part salariale)",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
          "date": "2025-02-20",
          "accessedAt": "2026-10-18",
          "figure": "7 Md€ de cotisations salariales : −0,17 point de PIB et −32 000 emplois l’année suivante (note hors du total)"
        }
      ]
    },
    {
      "id": "cotisations-sociales",
      "family": "impots",
      "label": "Cotisations maladie et famille",
      "today": "Employeur : maladie-autonomie 13,3 %, famille 5,25 % ; salarié : 0 %",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point de cotisation déplafonnée (maladie ou famille)",
        "short": "pt"
      },
      "perUnit": {
        "lo": 7.59,
        "hi": 10.92
      },
      "perUnitDown": {
        "lo": 7.59,
        "hi": 9.18
      },
      "base": {
        "value": 110.905,
        "label": "110,9 Md€ de cotisations sociales brutes de la branche maladie (CNAM) prévues en 2027, avant les mesures du PLFSS (rapport à la CCSS d’octobre 2026). C’est la plus grosse des deux lignes sur lesquelles joue le levier : un point porte sur la maladie ou sur la famille. La branche famille (CNAF) en compte 44,3 Md€ (tableau 12, p. 30). Aucune ligne publiée ne regroupe les deux.",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, synthèse, tableau 10 « Charges, produits et solde de la branche maladie (2024-2027) » (p. 25)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "110 905 M€ de cotisations sociales brutes de la branche maladie en 2027 (p), avant les mesures de la loi de financement"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLFSS",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "Selon le modèle macroéconomique de l’Insee et de la DG Trésor, cité par Fipeco, des cotisations en plus égales à 1 point de PIB réduiraient au bout de cinq ans le PIB de 1,0 % et l’emploi de 320 000 côté employeurs, de 0,8 % et 260 000 côté salariés. Hors du total.",
      "limits": "Valeurs 2026. Bas : employeurs privés du régime général ; haut : part salariale (0 % en 2026), agents publics compris. Employeurs publics exclus (flux interne) : une baisse vaut 7,59 à 9,18 Md€. Hausse des allègements (État) non retirée ; impôt sur le revenu, emploi non comptés.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.2 « Les cotisations », page 51, encadré 2 (valeurs de point de cotisation déplafonné par secteur)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "1 point déplafonné, tous régimes de base, 2026 : 10 920 M€ (haut de la hausse : part salariale payée par tous les actifs, agents publics compris), dont 1 740 M€ du secteur public ; sans le secteur public : 9 180 M€ (calculé, haut de la baisse : tous les cotisants hors employeurs publics, indépendants compris)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.2 « Les cotisations », page 48 (valeur du point par catégorie de cotisants)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "7,6 Md€ (7 590 M€ à l’encadré 2) pour les seuls employeurs du secteur privé affiliés au régime général, 2026 : bas, en hausse comme en baisse"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.2 « Les cotisations », page 52 (cotisations des employeurs publics)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Les employeurs publics cotisent aux branches maladie et famille pour tous leurs agents, titulaires et contractuels : une hausse ou une baisse de leur taux est un flux interne aux comptes publics, exclu de l’effet"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.2 « Les cotisations », page 51, encadré 2 (définition)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Rendement théorique : il suppose que l’État compense la hausse des exonérations et allègements (RGDU) qu’entraîne une hausse du taux ; ce coût pour l’État n’est pas retiré (dit dans les limites)"
        },
        {
          "title": "1.4.1. Valeur du point de CSG et des points de cotisation du régime général",
          "publisher": "Direction de la sécurité sociale (REPSS)",
          "url": "https://evaluation.securite-sociale.fr/home/financement/1-4-1-valeur-du-point-de-csg-et.html",
          "date": "2026",
          "accessedAt": "2026-10-18",
          "figure": "10,7 Md€ par point de cotisation déplafonnée maladie (champ quasi identique à la famille), régime général, 2025, valeur théorique avant exonérations : dans la fourchette, contexte"
        },
        {
          "title": "Les cotisations sociales (fiche du 20.06.2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Les-cotisations-sociales",
          "date": "2026-06-20",
          "accessedAt": "2026-10-18",
          "figure": "Assiette 2025 : 1 078 Md€, dont 171 Md€ de traitements des fonctionnaires, soit 10,8 Md€ par point dont 1,71 Md€ sur les fonctionnaires (calculé) : recoupe le secteur public de la CCSS, contexte"
        },
        {
          "title": "Les cotisations sociales (fiche du 20.06.2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Les-cotisations-sociales",
          "date": "2026-06-20",
          "accessedAt": "2026-10-18",
          "figure": "Taux au 1er juin 2026 (salaire de 3,0 à 8,5 SMIC) : maladie-maternité-autonomie 13,3 % employeur et 0 % salarié ; famille 5,25 % et 0 % (le réglage du PLFSS)"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027, partie PLFSS « Équilibre financier et recettes », p. 6",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Pas de hausse générale des prélèvements sociaux au PLFSS 2027, ni de baisse de taux dans sa partie recettes : les taux de 2026 sont le réglage du PLFSS"
        },
        {
          "title": "Les cotisations sociales (fiche du 20.06.2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Les-cotisations-sociales",
          "date": "2026-06-20",
          "accessedAt": "2026-10-18",
          "figure": "Modèle de l’Insee et de la DG Trésor, hausse de cotisations de 1 point de PIB, au bout de cinq ans : −1,0 % de PIB et −320 000 emplois (employeurs) ; −0,8 % et −260 000 (salariés). Note hors du total"
        }
      ]
    },
    {
      "id": "credits-administration-penitentiaire",
      "family": "depenses",
      "label": "Administration pénitentiaire",
      "today": "5 790,2 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits comptés (hors cotisations employeurs)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.042756,
        "hi": 0.042756
      },
      "base": {
        "value": 5.7902,
        "label": "5 790,2 M€ de crédits de paiement du programme 107 « Administration pénitentiaire » au PLF 2027, titre 2 compris (le levier en compte 4 275,6 M€, hors cotisations employeurs)",
        "source": {
          "title": "PAP 2027, mission Justice, programme 107 : éléments de synthèse du programme (p. 104)",
          "publisher": "Ministère de la justice (projet annuel de performances annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "5 790 230 570 € de CP en 2027 pour le programme 107"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 4.2756,
        "label": "4 275,6 M€ comptés sur les 5 790,2 M€ de crédits du PLF 2027, hors cotisations employeurs"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Crédits 2027 du programme 107, hors cotisations employeurs (règle de paie), subvention à l’ENAP comprise. Le levier règle des crédits, pas un nombre de places de prison ; ni l’effet sur les peines ni les chantiers déjà engagés ne sont comptés.",
      "sources": [
        {
          "title": "PAP 2027, mission Justice, programme 107 : éléments de synthèse du programme",
          "publisher": "Ministère de la justice (projet annuel de performances annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "5 790 230 570 € de crédits de paiement en 2027"
        },
        {
          "title": "PAP 2027, mission Justice, programme 107 : crédits par catégorie et contributions employeurs",
          "publisher": "Ministère de la justice (projet annuel de performances annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "1 514 646 152 € de cotisations employeurs, retirés de la base (règle de paie)"
        }
      ]
    },
    {
      "id": "credits-aide-publique-developpement",
      "family": "depenses",
      "label": "Aide publique au développement",
      "today": "2 605 M€ de CP au PLF 2027, sur 3 056 M€ (programmes 110, 209 et 384)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.02605457,
        "hi": 0.02605457
      },
      "base": {
        "value": 3.1708,
        "label": "3 170,8 M€ de crédits de paiement de la mission Aide publique au développement au PLF 2027, seule ligne publiée qui couvre le levier. Elle comprend le programme 365 (115 M€, fonds propres de l’AFD), qui n’est pas dans le levier. Les programmes 110, 209 et 384 font 3 055,8 M€, dont 2 605 M€ comptés par le levier.",
        "source": {
          "title": "PAP 2027, mission Aide publique au développement : récapitulation des crédits par programme et action, ligne « Totaux » (p. 13)",
          "publisher": "Ministère de l’économie et ministère de l’Europe et des affaires étrangères (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "3 170 780 421 € de CP au PLF 2027 pour l’ensemble de la mission"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 2.605457,
        "label": "2 605,5 M€ comptés sur les 3 055,8 M€ de crédits du PLF 2027 (programmes 110, 209 et 384), hors participations, collectivités, FED et lignes Ukraine"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "1 % de 2 605 M€ hors participations, versements aux collectivités, FED et lignes Ukraine du programme 110. Une partie paie des engagements pluriannuels (Fonds vert pour le climat : 181,6 M€). Effets induits non comptés.",
      "sources": [
        {
          "title": "PAP 2027, mission Aide publique au développement : récapitulation des crédits par programme et action (p. 13)",
          "publisher": "Ministère de l’économie et ministère de l’Europe et des affaires étrangères (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 110 : 1 090 913 775 € de CP au PLF 2027"
        },
        {
          "title": "PAP 2027, mission Aide publique au développement : récapitulation des crédits par programme et action (p. 13)",
          "publisher": "Ministère de l’économie et ministère de l’Europe et des affaires étrangères (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 209 : 1 226 866 646 € de CP au PLF 2027"
        },
        {
          "title": "PAP 2027, mission Aide publique au développement : récapitulation des crédits par programme et action (p. 13)",
          "publisher": "Ministère de l’économie et ministère de l’Europe et des affaires étrangères (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 384 : 738 000 000 € de CP au PLF 2027"
        },
        {
          "title": "PAP 2027, programme 110 : présentation des crédits par titre et catégorie (p. 32)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 110, exclus : 1 200 000 € de CP aux collectivités et 229 912 530 € de participations financières"
        },
        {
          "title": "PAP 2027, programme 209 : présentation des crédits par titre et catégorie (p. 78)",
          "publisher": "Ministère de l’Europe et des affaires étrangères (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 209, exclus : 10 972 641 € de CP aux collectivités"
        },
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, assistance macro-financière à l’Ukraine (p. 40)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : AMF+ 98,3 M€ en AE et CP (contribution fixée par un règlement européen)"
        },
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, Fonds vert pour le climat (p. 40)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Inclus : 181,6 M€ de CP en 2027 au titre d’un engagement pluriannuel (contribution 2024-2027 au Fonds vert pour le climat)"
        },
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, coopération technique (p. 47)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus (levier à part) : fonds de soutien aux infrastructures civiles ukrainiennes, 28 M€ de CP du programme 110"
        },
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, coopération technique (p. 47)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Le programme 209 cofinance ce fonds (21 M€ des 71 M€ d’AE) : sa part reste dans ce levier"
        },
        {
          "title": "PAP 2027, programme 209 : justification de l’action 07 « Coopération communautaire » (p. 106)",
          "publisher": "Ministère de l’Europe et des affaires étrangères (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : contribution au FED, 81 938 374 € de CP (contributions obligatoires fixées par un accord intergouvernemental)"
        }
      ]
    },
    {
      "id": "credits-aide-ukraine",
      "family": "depenses",
      "label": "Infrastructures civiles ukrainiennes",
      "today": "28 M€ de CP au PLF 2027 (fonds de soutien, programme 110)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.00028,
        "hi": 0.00028
      },
      "base": {
        "value": 0.028,
        "label": "28 M€ de crédits de paiement en 2027 pour le Fonds de soutien aux infrastructures civiles ukrainiennes (programme 110, PLF 2027)",
        "source": {
          "title": "PAP 2027, programme 110 : justification au premier euro, Fonds de soutien aux infrastructures civiles ukrainiennes (p. 47)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "28 M€ de CP en 2027"
        }
      },
      "max": 100,
      "step": 1,
      "notches": [
        -100,
        -50,
        0,
        50,
        100
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "1 % des 28 M€ du programme 110 (projets d’entreprises françaises en Ukraine). Le programme 209 cofinance ce fonds (21 M€ des 71 M€ d’engagements) : sa part reste dans le levier Aide publique au développement.",
      "sources": [
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, Fonds de soutien aux infrastructures civiles ukrainiennes (p. 47)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "28 M€ de CP en 2027"
        },
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, Fonds de soutien aux infrastructures civiles ukrainiennes (p. 47)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Versement de 28 M€ de CP prévu en 2027"
        },
        {
          "title": "PAP 2027, programme 110 : justification au premier euro, Fonds de soutien aux infrastructures civiles ukrainiennes (p. 47)",
          "publisher": "Ministère de l’économie (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128210/file/PAP%202027%20-%20Aide%20publique%20au%20d%C3%A9veloppement.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cofinancement : 50 M€ d’AE du programme 110 et 21 M€ du programme 209 (part du 209 hors levier)"
        }
      ]
    },
    {
      "id": "credits-aides-a-la-pierre",
      "family": "depenses",
      "label": "Rénovation du parc social",
      "today": "112,8 M€ de CP au PLF 2027 (action 01), dont 109,8 M€ dans le levier",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.0010981,
        "hi": 0.0010981
      },
      "base": {
        "value": 0.1128,
        "label": "112,8 M€ de crédits de paiement de l’action 01 « Construction locative et amélioration du parc » du programme 135 au PLF 2027 (le levier en compte 109,8 M€ ; les 352,8 M€ de fonds de concours du FNAP sont à part)",
        "source": {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 01 « Construction locative et amélioration du parc » (p. 102)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "112 810 000 € de CP en 2027 (8 250 000 € d’AE ; fonds de concours attendus : 352 773 586 € en CP)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.10981,
        "label": "109,8 M€ comptés sur les 112,8 M€ de crédits de l’action 01 du programme 135 au PLF 2027, hors gens du voyage"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "Les autorisations d’engagement de 2027 ne sont que de 8,25 M€ (SNE et gens du voyage) : une baisse des engagements nouveaux pèserait surtout sur les crédits de paiement des années suivantes.",
      "limits": "1 % de 109,8 M€ : rénovation énergétique du parc social (84,6 M€), cités minières (20,0 M€), SNE (5,3 M€), surtout pour des opérations déjà engagées. Hors gens du voyage (3,0 M€) et FNAP (352,8 M€ de fonds de concours).",
      "sources": [
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 01 « Construction locative et amélioration du parc » (p. 102)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "112 810 000 € de CP, dont 3 000 000 € aux collectivités (exclus) ; fonds de concours attendus 352 773 586 € (hors levier)"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 01 (p. 103)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Fonds pour la rénovation énergétique du parc social : 84,6 M€ de CP"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 01 (p. 103-104)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cités minières des Hauts-de-France : 20,0 M€ de CP, pour des opérations déjà engagées"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 01 (p. 104)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Système national d’enregistrement de la demande de logement social : 5,3 M€ en AE et CP"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 01 (p. 104)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : accueil des gens du voyage, 3,0 M€ en AE et CP (transferts aux collectivités)"
        }
      ]
    },
    {
      "id": "credits-aides-directes-etudiants",
      "family": "depenses",
      "label": "Bourses et aides aux étudiants",
      "today": "2 458,7 M€ de CP au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.024587,
        "hi": 0.024587
      },
      "base": {
        "value": 2.4587,
        "label": "2 458,7 M€ de crédits de paiement de l’action 01 « Aides directes » du programme 231 « Vie étudiante » au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Recherche et enseignement supérieur, programme 231 « Vie étudiante » : justification de l’action 01 « Aides directes » (p. 144)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "2 458 711 067 € de CP en 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "operatorCaveat": true,
      "limits": "1 % des crédits de l’action 01 (dont bourses sur critères sociaux 2 279,0 M€ et 39,3 M€ versés aux Crous). Effet statique en année pleine : l’évolution du nombre de boursiers n’est pas comptée.",
      "sources": [
        {
          "title": "PAP 2027, mission Recherche et enseignement supérieur, programme 231 « Vie étudiante » : justification de l’action 01 « Aides directes » (p. 144)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "2 458 711 067 € de CP, dont 2 419 103 194 € de transferts aux ménages et 39 301 282 € de subventions aux Crous"
        }
      ]
    },
    {
      "id": "credits-aides-indirectes-etudiants",
      "family": "depenses",
      "label": "Logement et repas étudiants (Crous)",
      "today": "635,2 M€ de CP au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.006352,
        "hi": 0.006352
      },
      "base": {
        "value": 0.6352,
        "label": "635,2 M€ de crédits de paiement de l’action 02 « Aides indirectes » (logement et restauration des Crous) du programme 231 au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Recherche et enseignement supérieur, programme 231 « Vie étudiante » : justification de l’action 02 « Aides indirectes » (p. 147)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "635 237 368 € de CP en 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "1 % des crédits de l’action 02, versés surtout au réseau des Crous (493,3 M€ de fonctionnement, repas à 1 € compris, 116,8 M€ d’investissement). Recettes propres des Crous et loyers non comptés.",
      "sources": [
        {
          "title": "PAP 2027, mission Recherche et enseignement supérieur, programme 231 « Vie étudiante » : justification de l’action 02 « Aides indirectes » (p. 147)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "635 237 368 € de CP (fonctionnement 493 334 906 €, investissement 116 838 706 €)"
        }
      ]
    },
    {
      "id": "credits-aides-personnelles-logement",
      "family": "sociale",
      "label": "Aides au logement (APL, ALS, ALF)",
      "today": "16 520,5 M€ au PLF 2027 (programme 109)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.163554,
        "hi": 0.163554
      },
      "base": {
        "value": 16.5205,
        "label": "16 520,5 M€ de crédits de paiement du programme 109 « Aide à l’accès au logement » au PLF 2027, dont 16 511,1 M€ d’aides personnelles (APL, ALS, ALF)",
        "source": {
          "title": "PAP 2027, mission Cohésion des territoires : récapitulation des crédits par programme et action (p. 19)",
          "publisher": "Ministère chargé du logement (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "16 520 517 313 € de CP au PLF 2027 pour le programme 109"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 16.3554,
        "label": "16 355 M€ comptés sur les 16 520,5 M€ de crédits du PLF 2027, hors frais de gestion versés aux caisses"
      },
      "exclusiveWith": [
        "aides-logement-revalorisation"
      ],
      "operatorCaveat": false,
      "limits": "Le 1 % porte sur les aides versées aux ménages et l’action d’information (16 355 M€), sans les frais de gestion versés aux caisses (165 M€), un transfert entre administrations publiques. Suppose un barème ajusté d’autant ; ne compte pas l’effet sur les loyers.",
      "sources": [
        {
          "title": "Projet annuel de performances 2027, mission Cohésion des territoires : crédits de paiement du programme 109 par action (p. 19)",
          "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "16 520 517 313 € en 2027, dont 16 511 117 313 € d’aides personnelles"
        },
        {
          "title": "Projet annuel de performances 2027, mission Cohésion des territoires : charges et ressources du Fonds national d’aide au logement en 2027 (p. 66)",
          "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "APL 7 482 M€, ALS 5 582 M€, ALF 3 282 M€, frais de gestion 165 M€ en 2027"
        }
      ]
    },
    {
      "id": "credits-aides-presse",
      "family": "depenses",
      "label": "Aides directes à la presse écrite",
      "today": "176,0 M€ de CP au PLF 2027, dont 166,8 M€ dans le levier",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.001668,
        "hi": 0.001668
      },
      "base": {
        "value": 0.176,
        "label": "176,0 M€ de crédits de paiement au PLF 2027 pour l’action 02 « Aides à la presse » du programme 180, dont 166,8 M€ dans le levier (hors 9,2 M€ compensés à la Sécurité sociale)",
        "source": {
          "title": "PAP 2027, mission Médias, livre et industries culturelles, programme 180 : éléments de synthèse du programme (p. 35)",
          "publisher": "Ministère de la culture (PAP annexé au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128246/file/PAP%202027%20-%20M%C3%A9dias%20livre%20et%20industries%20culturelles.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action 02 : 176 012 845 € de CP 2027 (AE : 176 995 757 €)"
        }
      },
      "max": 100,
      "step": 1,
      "notches": [
        -100,
        -50,
        0,
        50,
        100
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "1 % de 166,8 M€ : action 02 hors 9,2 M€ compensés à la Sécurité sociale (vendeurs-colporteurs). Hors levier : AFP, taux réduits de TVA de la presse. Effets sur les titres aidés non comptés.",
      "sources": [
        {
          "title": "PAP 2027, mission Médias, livre et industries culturelles, programme 180 : justification de l’action 02 « Aides à la presse » (p. 38)",
          "publisher": "Ministère de la culture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128246/file/PAP%202027%20-%20M%C3%A9dias%20livre%20et%20industries%20culturelles.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "176 012 845 € de CP, tous en transferts aux entreprises"
        },
        {
          "title": "PAP 2027, programme 180, action 02 : sous-action 15, exonération des vendeurs-colporteurs et porteurs de presse (p. 40)",
          "publisher": "Ministère de la culture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128246/file/PAP%202027%20-%20M%C3%A9dias%20livre%20et%20industries%20culturelles.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : 9,2 M€ compensés à la Sécurité sociale (transfert entre administrations publiques)"
        }
      ]
    },
    {
      "id": "credits-ame",
      "family": "depenses",
      "label": "Aide médicale de l’État (AME)",
      "today": "1 208,3 M€ de crédits au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.012083,
        "hi": 0.012083
      },
      "base": {
        "value": 1.2083,
        "label": "1 208,3 M€ de crédits de paiement au PLF 2027 pour l’action 02 « Aide médicale de l’État » du programme 183, dont 1 138,3 M€ dans le levier (hors 70 M€ de dotation forfaitaire versée à l’Assurance maladie pour les soins urgents, transfert entre administrations publiques)",
        "source": {
          "title": "PAP 2027, mission Santé, programme 183 : justification de l’action 02 « Aide médicale de l’État » (p. 83 ; soins urgents p. 83 et 89)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128269/file/PAP%202027%20-%20Sant%C3%A9.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "1 208 300 000 € de CP 2027, tous en transferts aux ménages ; dont 70 M€ de dotation forfaitaire de l’État pour les soins urgents (p. 89 : « La dotation versée par le programme 183 reste stable à 70 M€. »), retirés du levier"
        }
      },
      "max": 100,
      "step": 1,
      "notches": [
        -100,
        -50,
        0,
        50,
        100
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 1.2083,
        "label": "1 208,3 M€ de crédits au PLF 2027"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Effet statique de 1 % des crédits, dotation forfaitaire des soins urgents comprise (70 M€) : à −100 %, elle disparaît aussi. Ne compte ni le report vers les soins urgents ni les soins que les hôpitaux publics garderaient à leur charge.",
      "sources": [
        {
          "title": "PAP 2027, mission Santé, programme 183, justification de l’action 02 « Aide médicale de l’État » (p. 83)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128269/file/PAP%202027%20-%20Sant%C3%A9.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "1 208 300 000 € de crédits de paiement 2027, tous en transferts aux ménages"
        },
        {
          "title": "PAP 2027, mission Santé, programme 183, action 02 : ventilation de la dépense par type d’AME, soins urgents (p. 89)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128269/file/PAP%202027%20-%20Sant%C3%A9.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Les crédits de l’action comprennent la dotation forfaitaire de l’État pour les soins urgents : 70 M€ en 2027"
        }
      ]
    },
    {
      "id": "credits-anah-renovation",
      "family": "depenses",
      "label": "Subvention de l’État à l’Anah",
      "today": "1 232,9 M€ au PLF 2027 (1 450,3 M€ votés en LFI 2026)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.012329,
        "hi": 0.012329
      },
      "base": {
        "value": 1.2329,
        "label": "1 232,9 M€ de crédits de paiement versés par le programme 135 à l’Anah au PLF 2027 (1 535,3 M€ en LFI 2026)",
        "source": {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : récapitulation des crédits alloués aux opérateurs (p. 124)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Anah : 1 232 923 834 € de CP au PLF 2027 (LFI 2026 : 1 535 325 022 €)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 1.2329,
        "label": "1 232,9 M€ de crédits au PLF 2027 (subvention de l’État à l’Anah)"
      },
      "exclusiveWith": [],
      "operatorCaveat": true,
      "limits": "Finance MaPrimeRénov’, MaPrimeAdapt’, Ma Prime Logement Décent et le fonctionnement de l’Anah. Hors 600 M€ de quotas carbone affectés à l’Anah, certificats d’énergie et prêts à taux zéro.",
      "sources": [
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : récapitulation des crédits alloués aux opérateurs (p. 124)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Subvention 2027 à l’Anah : 1 232 923 834 € de crédits de paiement, dont 149 490 000 € de charges de service public et 26 200 000 € d’investissement (la colonne « LFI 2026 », 1 535 325 022 €, reprend le PLF 2026, voir la note)"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : note sous les crédits alloués à l’Anah (p. 124)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Subvention votée en LFI 2026 : 1 450 325 022 € de crédits de paiement, après un amendement de −85 M€ (le PAP écrit « M€ » par erreur)"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 135 : justification de l’action 04 (p. 108)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "La subvention finance les aides de l’Anah (MaPrimeRénov’, MaPrimeAdapt’, Ma Prime Logement Décent) et le fonctionnement de l’agence"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires : taxes affectées aux opérateurs (p. 90-91)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Hors levier : 600 M€ de recettes des quotas carbone affectées à l’Anah en 2027 (plafond 600 000 000 €)"
        }
      ]
    },
    {
      "id": "credits-asile",
      "family": "depenses",
      "label": "Asile : instruction et accueil",
      "today": "1 315,0 M€ au PLF 2027 (programme 303, action 02)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.01315,
        "hi": 0.01315
      },
      "base": {
        "value": 1.315,
        "label": "1 315,0 M€ de crédits de paiement au PLF 2027 pour l’action 02 « Garantie de l’exercice du droit d’asile » du programme 303 (1 369,6 M€ en LFI 2026)",
        "source": {
          "title": "PAP 2027, mission Immigration, asile et intégration, programme 303 : éléments de synthèse du programme (p. 37)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action 02 : 1 314 956 817 € de CP 2027, aucun crédit de titre 2"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 1.315,
        "label": "1 315,0 M€ de crédits au PLF 2027 (programme 303, action 02)"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Action 02 : OFPRA, hébergement, allocation des demandeurs d’asile. La directive (UE) 2024/1346 impose l’accueil sans en fixer le montant. Hors CNDA et hébergement généraliste.",
      "sources": [
        {
          "title": "PAP 2027, mission Immigration, asile et intégration, programme 303 : éléments de synthèse par action (p. 37)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action 02 « Garantie de l’exercice du droit d’asile » : 1 314 956 817 € de CP 2027, base retenue ; actions 01 (visas), 03 (éloignement, levier à part) et 04 (soutien) exclues ; aucun crédit de titre 2"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration, programme 303 : justification de l’action 02 (p. 42)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action 02 en CP 2027 : charges de service public 108 664 384 €, investissement 1 875 000 €, allocation aux ménages 264 976 075 €, hébergement (autres collectivités) 939 441 358 € ; aucun versement aux collectivités territoriales"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration, programme 303 : justification de l’action 02 (p. 42)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "L’allocation pour demandeur d’asile répond à la directive « Accueil » (UE) 2024/1346 : pas de cran de suppression (règle des traités)"
        }
      ]
    },
    {
      "id": "credits-audiovisuel-public",
      "family": "depenses",
      "label": "Audiovisuel public",
      "today": "3 816,5 M€ au PLF 2027 (3 863,3 M€ en LFI 2026)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des avances",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.038165,
        "hi": 0.038165
      },
      "base": {
        "value": 3.8165,
        "label": "3 816,5 M€ d’avances à l’audiovisuel public au PLF 2027 (compte de concours financiers ; 3 863,3 M€ en LFI 2026)",
        "source": {
          "title": "PAP 2027, compte de concours financiers « Avances à l’audiovisuel public » : récapitulation des crédits par programme (p. 13)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128306/file/PAP%202027%20-%20Avances%20%C3%A0%20l%27audiovisuel%20public.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Totaux : 3 816 514 211 € en 2027 (LFI 2026 : 3 863 312 945 €, -1,21 %)"
        }
      },
      "max": 100,
      "step": 1,
      "notches": [
        -100,
        -50,
        0,
        50,
        100
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 3.8165,
        "label": "3 816,5 M€ d’avances à l’audiovisuel public au PLF 2027"
      },
      "exclusiveWith": [],
      "operatorCaveat": true,
      "limits": "Effet statique de 1 % des avances, si les sociétés réduisent d’autant leur dépense. Ne compte ni leurs recettes publicitaires ni le produit d’une éventuelle vente, opération financière hors solde.",
      "sources": [
        {
          "title": "PAP 2027, compte de concours financiers « Avances à l’audiovisuel public » : récapitulation des crédits par programme (p. 13)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128306/file/PAP%202027%20-%20Avances%20%C3%A0%20l%27audiovisuel%20public.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "3 816 514 211 € d’avances en 2027 (LFI 2026 : 3 863 312 945 €, soit -1,21 %)"
        },
        {
          "title": "Fiche méthodologique base 2020 n° 6 : modification du périmètre des administrations publiques (p. 3)",
          "publisher": "Insee",
          "url": "https://insee.fr/fr/metadonnees/source/fichier/fichemethodo6_B2020_perimetre_apu.pdf",
          "date": "2024-05",
          "accessedAt": "2026-10-18",
          "figure": "Sociétés de l’audiovisuel public classées dans les organismes divers d’administration centrale (APU) depuis la base 2020"
        }
      ]
    },
    {
      "id": "credits-culture",
      "family": "depenses",
      "label": "Mission Culture",
      "today": "3 649,2 M€ au PLF 2027 (3 744,5 M€ en LFI 2026)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.030562,
        "hi": 0.030562
      },
      "base": {
        "value": 3.6492,
        "label": "3 649,2 M€ de crédits de paiement de la mission Culture au PLF 2027 (3 744,5 M€ en LFI 2026), dont 3 056,2 M€ retenus dans le levier",
        "source": {
          "title": "PAP 2027, mission Culture : récapitulation des crédits par programme et action (p. 16)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Mission Culture : 3 649 196 894 € de CP 2027 (LFI 2026 : 3 744 547 181 €, -2,55 %)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 3.0562,
        "label": "3 056,2 M€ comptés sur les 3 649,2 M€ de crédits du PLF 2027, hors collectivités, fonds propres et cotisations employeurs"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Hors médias, livre, CNC et audiovisuel public. Hors 301,8 M€ versés aux collectivités, cotisations des employeurs et fonds propres. Comprend la paie du ministère, d’où l’exclusion avec effectifs et point d’indice.",
      "sources": [
        {
          "title": "PAP 2027, mission Culture : récapitulation des crédits par programme et action (p. 16)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Mission Culture : 3 649 196 894 € de CP 2027 (LFI 2026 : 3 744 547 181 €)"
        },
        {
          "title": "PAP 2027, mission Culture, programme 175 : crédits par titre et catégorie (p. 36)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : 170 525 770 € de CP versés aux collectivités territoriales (transfert entre APU)"
        },
        {
          "title": "PAP 2027, mission Culture, programme 175 : crédits par titre et catégorie (p. 36)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : 2 602 697 € de CP en dotations en fonds propres (opération financière, sans effet sur le déficit)"
        },
        {
          "title": "PAP 2027, mission Culture, programme 131 : crédits par titre et catégorie (p. 124)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : 52 035 749 € de CP versés aux collectivités territoriales (transfert entre APU)"
        },
        {
          "title": "PAP 2027, mission Culture, programme 361 : crédits par titre et catégorie (p. 189)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : 79 242 494 € de CP versés aux collectivités territoriales (transfert entre APU)"
        },
        {
          "title": "PAP 2027, mission Culture, programme 224 : crédits par titre et catégorie (p. 263)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128219/file/PAP%202027%20-%20Culture.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exclus : 288 594 273 € de cotisations des employeurs (règle de paie). Gardés : 458 558 754 € de rémunérations d’activité et 8 348 745 € de prestations sociales, paie aussi comptée par les leviers effectifs et point d’indice"
        }
      ]
    },
    {
      "id": "credits-egalite-femmes-hommes",
      "family": "depenses",
      "label": "Égalité entre femmes et hommes",
      "today": "106,3 M€ au PLF 2027 (98,6 M€ en LFI 2026)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.001063,
        "hi": 0.001063
      },
      "base": {
        "value": 0.1063,
        "label": "106,3 M€ de crédits de paiement du programme 137 « Égalité entre les femmes et les hommes » au PLF 2027 (98,6 M€ en LFI 2026)",
        "source": {
          "title": "PAP 2027, mission Solidarité, insertion et égalité des chances : récapitulation des crédits par programme (p. 16)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 137 : 106 279 485 € de CP 2027 (LFI 2026 : 98 647 590 €, +7,74 %)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.1063,
        "label": "106,3 M€ de crédits au PLF 2027 (programme 137)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Effet statique de 1 % des crédits du programme 137, qui n’est qu’une partie de l’effort contre les violences faites aux femmes, réparti entre plusieurs programmes.",
      "sources": [
        {
          "title": "PAP 2027, mission Solidarité, insertion et égalité des chances : récapitulation des crédits par programme (p. 16)",
          "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 137 : 106 279 485 € de CP 2027 (LFI 2026 : 98 647 590 €)"
        }
      ]
    },
    {
      "id": "credits-france-2030",
      "family": "depenses",
      "label": "Crédits de France 2030",
      "today": "3 999,9 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.03552277,
        "hi": 0.03837277
      },
      "base": {
        "value": 3.99987,
        "label": "3 999,9 M€ de crédits de paiement de la mission « Investir pour la France de 2030 » au PLF 2027 (4 397,8 M€ en LFI 2026), aucune autorisation d’engagement nouvelle",
        "source": {
          "title": "PAP 2027, mission Investir pour la France de 2030 : récapitulation des crédits par programme et action (p. 15)",
          "publisher": "Secrétariat général pour l’investissement, PAP annexé au PLF 2027 (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128240/file/PAP%202027%20-%20Investir%20pour%20la%20France%20de%202030.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 de la mission : 3 999 870 000 € (LFI 2026 : 4 397 829 332 €, -9,05 %) ; AE 2027 : 0"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 3.837277,
        "label": "3 837,3 M€ comptés sur les 3 999,9 M€ de crédits du PLF 2027, hors fonds propres et prêts"
      },
      "exclusiveWith": [],
      "operatorCaveat": true,
      "laterNote": "Aucune autorisation d’engagement nouvelle en 2027 : ces crédits paient des engagements passés ; une baisse peut décaler des paiements vers 2028, une hausse avancer des paiements prévus en 2028-2029, plutôt que les supprimer ou en créer de nouveaux.",
      "limits": "Hors fonds propres et prêts, sans effet sur le déficit ; bas aussi hors aides à l’innovation (285 M€, prêts non isolés). La dépense compte au versement final. Effet sur la croissance non compté.",
      "sources": [
        {
          "title": "PAP 2027, mission Investir pour la France de 2030 : récapitulation des crédits par programme et action (total de la mission)",
          "publisher": "Secrétariat général pour l’investissement, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128240/file/PAP%202027%20-%20Investir%20pour%20la%20France%20de%202030.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 de la mission : 3 999 870 000 €"
        },
        {
          "title": "PAP 2027, mission Investir pour la France de 2030 : programme 424, action 05",
          "publisher": "Secrétariat général pour l’investissement, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128240/file/PAP%202027%20-%20Investir%20pour%20la%20France%20de%202030.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action « fonds propres » du programme 424 : 155 075 405 € de CP 2027"
        },
        {
          "title": "PAP 2027, mission Investir pour la France de 2030 : programme 422, crédits par titre et catégorie",
          "publisher": "Secrétariat général pour l’investissement, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128240/file/PAP%202027%20-%20Investir%20pour%20la%20France%20de%202030.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Prêts et avances du programme 422 : 7 517 712 € de CP 2027"
        },
        {
          "title": "PAP 2027, mission Investir pour la France de 2030 : programme 425, action 02",
          "publisher": "Secrétariat général pour l’investissement, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128240/file/PAP%202027%20-%20Investir%20pour%20la%20France%20de%202030.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Aides à l’innovation (subventions et prêts) : 285 000 000 € de CP 2027"
        },
        {
          "title": "PAP 2027, mission Investir pour la France de 2030 : récapitulation des crédits par programme et titre pour 2026 à 2029 (p. 17)",
          "publisher": "Secrétariat général pour l’investissement, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128240/file/PAP%202027%20-%20Investir%20pour%20la%20France%20de%202030.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP de la mission : 3 999 870 000 € en 2027, 4 087 455 582 € prévus en 2028 et 3 621 507 553 € en 2029 ; AE 2027 : 0"
        }
      ]
    },
    {
      "id": "credits-integration",
      "family": "depenses",
      "label": "Intégration, accès à la nationalité",
      "today": "363,9 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.00350589,
        "hi": 0.00350589
      },
      "base": {
        "value": 0.363889,
        "label": "363,9 M€ de crédits de paiement du programme 104 « Intégration et accès à la nationalité française » au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 104, éléments de synthèse du programme (p. 74)",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 104, total des CP 2027 : 363 889 193 € (dernière valeur de la ligne ; les trois premières sont les AE)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.350589,
        "label": "350,6 M€ comptés sur les 363,9 M€ de crédits du PLF 2027, hors collectivités"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Programme 104 hors 13,3 M€ aux collectivités. Comprend 255,5 M€ à l’OFII : fonctionnement, missions (contrat d’intégration, une partie de l’asile) et aide au retour volontaire des étrangers sous OQTF (17,9 M€).",
      "sources": [
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 104, crédits par titre et catégorie",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 du programme 104 : 363 889 193 €, dont 13 300 000 € aux collectivités territoriales"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 104, crédits par titre et catégorie",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Subventions à un opérateur en CP 2027 : 228 151 052 € (charges de service public) et 9 500 000 € (investissement)"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 104, crédits alloués aux opérateurs (p. 82)",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Crédits du programme 104 à l’OFII en CP 2027 : 255 523 052 €, dont 17,9 M€ d’aide au retour volontaire des étrangers sous OQTF"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 104, crédits alloués aux opérateurs (p. 82)",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Transferts de l’OFII : 17,9 M€ d’aide au retour volontaire en 2027"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : financement de l’OFII par le budget de l’État (p. 86)",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "La subvention du programme 104 couvre le fonctionnement général de l’OFII et la plupart de ses missions, dont une partie de l’asile"
        }
      ]
    },
    {
      "id": "credits-justice-judiciaire",
      "family": "depenses",
      "label": "Justice judiciaire (tribunaux)",
      "today": "4 813,4 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.03550799,
        "hi": 0.03550799
      },
      "base": {
        "value": 4.813406,
        "label": "4 813,4 M€ de crédits de paiement du programme 166 « Justice judiciaire » au PLF 2027, titre 2 compris",
        "source": {
          "title": "PAP 2027, mission Justice : programme 166, éléments de synthèse du programme (p. 54)",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 166, total des CP 2027 : 4 813 406 204 € (dont 3 311 159 651 € de titre 2)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 3.550799,
        "label": "3 550,8 M€ comptés sur les 4 813,4 M€ de crédits du PLF 2027, hors cotisations employeurs"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Programme 166 hors cotisations des employeurs (1 262,6 M€, flux internes aux APU), École nationale de la magistrature comprise (47 M€). Aide juridictionnelle non comprise. Effet sur les délais non compté.",
      "sources": [
        {
          "title": "PAP 2027, mission Justice : programme 166, crédits par titre et catégorie",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 du programme 166 : 4 813 406 204 €"
        },
        {
          "title": "PAP 2027, mission Justice : programme 166, crédits par titre et catégorie",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cotisations et contributions sociales en CP 2027 : 1 262 606 809 €"
        },
        {
          "title": "PAP 2027, mission Justice : programme 166, crédits par titre et catégorie",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Subventions pour charges de service public en CP 2027 : 47 000 000 €"
        }
      ]
    },
    {
      "id": "credits-lutte-immigration-irreguliere",
      "family": "depenses",
      "label": "Rétention et éloignements",
      "today": "314,5 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.00285155,
        "hi": 0.00285155
      },
      "base": {
        "value": 0.314459,
        "label": "314,5 M€ de crédits de paiement de l’action 03 « Lutte contre l’immigration irrégulière » (programme 303) au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 303, éléments de synthèse du programme (p. 37)",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action 03 du programme 303, CP 2027 : 314 459 351 € (dernière valeur de la ligne)"
        }
      },
      "max": 100,
      "step": 1,
      "notches": [
        -100,
        -50,
        0,
        50,
        100
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.285155,
        "label": "285,2 M€ comptés sur les 314,5 M€ de crédits du PLF 2027, hors soins en rétention versés aux hôpitaux"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Action 03 du programme 303, hors 29,3 M€ versés aux hôpitaux publics (soins en rétention) ; escortes et police aux frontières non comprises. Le levier règle des crédits, pas un nombre d’éloignements ; à −100 %, la conformité à la directive « retour » dépend de la rédaction.",
      "sources": [
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 303, action 03 « Lutte contre l’immigration irrégulière »",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 de l’action 03 : 314 459 351 €, dont 29 304 072 € de transferts aux autres collectivités"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 303, action 03, éléments de la dépense par nature",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Prise en charge sanitaire en rétention : 29 304 072 € de CP 2027"
        },
        {
          "title": "PAP 2027, mission Immigration, asile et intégration : programme 303, action 03, frais d’éloignement (p. 51)",
          "publisher": "Ministère de l’intérieur, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128237/file/PAP%202027%20-%20Immigration%20asile%20et%20int%C3%A9gration.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Les mesures d’éloignement sont prises en vertu de la directive « retour » : cadre juridique du cran −100 %, pas un montant"
        }
      ]
    },
    {
      "id": "credits-pjj",
      "family": "depenses",
      "label": "Protection judiciaire de la jeunesse",
      "today": "1 173,4 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.008958,
        "hi": 0.008958
      },
      "base": {
        "value": 1.173356,
        "label": "1 173,4 M€ de crédits de paiement du programme 182 « Protection judiciaire de la jeunesse » au PLF 2027, titre 2 compris",
        "source": {
          "title": "PAP 2027, mission Justice : programme 182, éléments de synthèse du programme (p. 154)",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 182, total des CP 2027 : 1 173 355 630 € (dont 728 284 568 € de titre 2)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.8958,
        "label": "895,8 M€ comptés sur les 1 173,4 M€ de crédits du PLF 2027, hors cotisations employeurs"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": false,
      "limits": "Programme 182 hors cotisations des employeurs (277,6 M€, flux internes aux APU), dont 288,8 M€ versés au secteur associatif habilité. Le levier règle des crédits, pas un nombre de places.",
      "sources": [
        {
          "title": "PAP 2027, mission Justice : programme 182, crédits par titre et catégorie",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 du programme 182 : 1 173 355 630 €, dont 297 255 722 € de transferts aux autres collectivités"
        },
        {
          "title": "PAP 2027, mission Justice : programme 182, crédits par titre et catégorie",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cotisations et contributions sociales en CP 2027 : 277 555 693 €"
        },
        {
          "title": "PAP 2027, mission Justice : programme 182, action 01, justification au premier euro (p. 166)",
          "publisher": "Ministère de la justice, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128243/file/PAP%202027%20-%20Justice.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Crédits du secteur associatif habilité : 288,8 M€ en AE et CP 2027"
        }
      ]
    },
    {
      "id": "credits-politique-de-la-ville",
      "family": "depenses",
      "label": "Politique de la ville",
      "today": "619,1 M€ de crédits de paiement au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.00456042,
        "hi": 0.00456042
      },
      "base": {
        "value": 0.619067,
        "label": "619,1 M€ de crédits de paiement du programme 147 « Politique de la ville » au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Cohésion des territoires : programme 147, éléments de synthèse du programme (p. 195)",
          "publisher": "Ministère chargé de la ville, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Programme 147, total des CP 2027 : 619 066 960 € (dernière valeur de la ligne)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.456042,
        "label": "456,0 M€ comptés sur les 619,1 M€ de crédits du PLF 2027, hors collectivités et cotisations employeurs"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Programme 147 hors 157,7 M€ aux collectivités et cotisations des employeurs ; dont 128,5 M€ versés à l’ANRU et 39,3 M€ à l’EPIDE. Rénovation urbaine financée hors État et services publics des quartiers non compris.",
      "sources": [
        {
          "title": "PAP 2027, mission Cohésion des territoires : programme 147, crédits par titre et catégorie (p. 191)",
          "publisher": "Ministère chargé de la ville, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 du programme 147 : 619 066 960 €, dont 157 686 642 € aux collectivités territoriales"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires : programme 147, crédits par titre et catégorie (p. 191)",
          "publisher": "Ministère chargé de la ville, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Cotisations et contributions sociales en CP 2027 : 5 338 328 €"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires : programme 147, crédits par titre et catégorie (p. 191)",
          "publisher": "Ministère chargé de la ville, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Subventions pour charges de service public en CP 2027 : 34 621 660 €"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires : programme 147, action 02, EPIDE (p. 203)",
          "publisher": "Ministère chargé de la ville, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Crédits du programme 147 pour l’EPIDE en 2027 : 39,3 M€ (dont 34,6 M€ de subvention pour charges de service public)"
        },
        {
          "title": "PAP 2027, mission Cohésion des territoires : programme 147, action 04, rénovation urbaine (p. 205)",
          "publisher": "Ministère chargé de la ville, PAP annexé au PLF 2027",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Versement à l’ANRU : 128 500 000 € de CP 2027"
        }
      ]
    },
    {
      "id": "credits-prime-activite-rsa",
      "family": "sociale",
      "label": "Prime d’activité et RSA de l’État",
      "today": "12 972,6 M€ au PLF 2027 (programme 304, action 11)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.129726,
        "hi": 0.129726
      },
      "base": {
        "value": 12.972592,
        "label": "12 972,6 M€ de crédits de paiement de l’action 11 « Prime d’activité et autres dispositifs » (programme 304) au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Solidarité, insertion et égalité des chances : programme 304, éléments de synthèse du programme (p. 38)",
          "publisher": "Ministère chargé des solidarités (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Action 11 du programme 304, CP 2027 : 12 972 591 939 € (dernière valeur de la ligne), dont 10,7 Md€ de prime d’activité"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 12.9726,
        "label": "12 972,6 M€ de crédits au PLF 2027 (programme 304, action 11)"
      },
      "exclusiveWith": [
        "minima-sociaux-revalorisation",
        "prime-activite-revalorisation"
      ],
      "operatorCaveat": false,
      "limits": "Prime d’activité (10,7 Md€, non revalorisée en 2027), prime de fin d’année et RSA payé par l’État ; le RSA des départements n’y est pas. Suppose un barème ajusté d’autant ; ne compte pas l’effet sur l’emploi.",
      "sources": [
        {
          "title": "Projet annuel de performances 2027, mission Solidarité, insertion et égalité des chances : crédits de paiement du programme 304 par action",
          "publisher": "Ministère chargé des solidarités (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "action 11 « Prime d’activité et autres dispositifs » : 12 972 591 939 € en 2027"
        },
        {
          "title": "Projet annuel de performances 2027, mission Solidarité, insertion et égalité des chances : justification de l’action 11 (p. 40-42)",
          "publisher": "Ministère chargé des solidarités (annexe au projet de loi de finances pour 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "prime d’activité 10,7 Md€ en 2027, non revalorisée ; prime de fin d’année 460,0 M€ ; RSA jeunes 4,5 M€ ; RSA recentralisé 1 805 M€"
        }
      ]
    },
    {
      "id": "credits-remunerations-enseignement-scolaire",
      "family": "depenses",
      "label": "Rémunérations, enseignement scolaire",
      "today": "49 853 M€ de rémunérations d’activité au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des rémunérations",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.498534,
        "hi": 0.498534
      },
      "base": {
        "value": 49.853359,
        "label": "49 853,4 M€ de rémunérations d’activité de la mission Enseignement scolaire au PLF 2027 : somme des lignes « 21 – Rémunérations d’activité » de ses six programmes, le PAP ne publiant pas de total pour la mission",
        "source": {
          "title": "PAP 2027, mission Enseignement scolaire : présentation des crédits par titre et catégorie des programmes 140 (p. 46), 141 (p. 93), 230 (p. 131), 139 (p. 186), 214 (p. 238) et 143 (p. 306)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21 au PLF 2027 (seconde valeur de chaque ligne ; la première est la LFI 2026) : P140 15 443 841 590 € + P141 22 562 301 548 € + P139 5 814 576 148 € + P143 724 651 385 € + P230 3 949 496 793 € + P214 1 358 491 528 € = 49 853 358 992 € ; la citation est la ligne du programme 141, la plus grosse"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 49.8534,
        "label": "49 853,4 M€ de rémunérations d’activité de la mission Enseignement scolaire au PLF 2027"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": false,
      "limits": "Toute la mission (programmes 140, 141, 139, 143, 230 et 214), 1 % de la paie brute, effet mécanique. Hors cotisations des employeurs et pensions ; l’impôt et les cotisations des agents ne sont pas comptés.",
      "sources": [
        {
          "title": "PAP 2027, mission Enseignement scolaire, programme 140 « Enseignement scolaire public du premier degré » : crédits par titre et catégorie (p. 46)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21, rémunérations d’activité : 15 443 841 590 € au PLF 2027 (seconde valeur de la ligne ; la première est la LFI 2026)"
        },
        {
          "title": "PAP 2027, mission Enseignement scolaire, programme 141 « Enseignement scolaire public du second degré » : crédits par titre et catégorie (p. 93)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21, rémunérations d’activité : 22 562 301 548 € au PLF 2027 (seconde valeur de la ligne ; la première est la LFI 2026)"
        },
        {
          "title": "PAP 2027, mission Enseignement scolaire, programme 139 « Enseignement privé du premier et du second degrés » : crédits par titre et catégorie (p. 186)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21, rémunérations d’activité : 5 814 576 148 € au PLF 2027 (seconde valeur de la ligne ; la première est la LFI 2026)"
        },
        {
          "title": "PAP 2027, mission Enseignement scolaire, programme 143 « Enseignement technique agricole » : crédits par titre et catégorie (p. 306)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21, rémunérations d’activité : 724 651 385 € au PLF 2027 (seconde valeur de la ligne ; la première est la LFI 2026)"
        },
        {
          "title": "PAP 2027, mission Enseignement scolaire, programme 230 « Vie de l’élève » : crédits par titre et catégorie (p. 131)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21, rémunérations d’activité : 3 949 496 793 € au PLF 2027 (seconde valeur de la ligne ; la première est la LFI 2026)"
        },
        {
          "title": "PAP 2027, mission Enseignement scolaire, programme 214 « Conduite et soutien des politiques de l’enseignement, de la recherche, de la jeunesse, de la vie associative et des sports » : crédits par titre et catégorie (p. 238)",
          "publisher": "Ministère de l’éducation nationale et ministère de l’agriculture (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128234/file/PAP%202027%20-%20Enseignement%20scolaire.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 21, rémunérations d’activité : 1 358 491 528 € au PLF 2027 (seconde valeur de la ligne ; la première est la LFI 2026)"
        }
      ]
    },
    {
      "id": "credits-universites-recherche",
      "family": "depenses",
      "label": "Universités et recherche (150, 172)",
      "today": "24 217 M€ de crédits (programmes 150 et 172) au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des crédits",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.234329,
        "hi": 0.234567
      },
      "base": {
        "value": 24.217145,
        "label": "24 217,1 M€ de crédits de paiement des programmes 150 (15 786,1 M€) et 172 (8 431,1 M€) au PLF 2027 : somme de deux lignes du PAP, aucun total commun publié",
        "source": {
          "title": "PAP 2027, mission Recherche et enseignement supérieur : programme 150, éléments de synthèse (p. 69) ; programme 172, éléments de synthèse (p. 185)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "CP 2027 : programme 150, 15 786 054 527 € (dernière valeur de la ligne « Total » p. 69 ; les trois premières sont les AE) ; programme 172, 8 431 090 298 € (« 8 556 290 955 € en autorisations d’engagement (AE) et 8 431 090 298 € en crédits de paiement (CP) », p. 185) ; total 24 217 144 825 € ; la citation est la ligne du programme 150, le plus gros"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 23.4567,
        "label": "23 456,7 M€ comptés sur les 24 217,1 M€ de crédits du PLF 2027 (programmes 150 et 172), hors cotisations employeurs, collectivités et contributions internationales"
      },
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Surtout des subventions aux universités et organismes. Hors cotisations des employeurs, collectivités et 581 M€ de contributions internationales (conventions) ; bas sans fonds propres. Ressources propres non comptées.",
      "sources": [
        {
          "title": "PAP 2027, mission Recherche et enseignement supérieur, programme 150 « Formations supérieures et recherche universitaire » : justification des crédits (p. 69)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "15 786 054 527 € de CP en 2027, dont 14 749 M€ de subventions pour charges de service public"
        },
        {
          "title": "PAP 2027, mission Recherche et enseignement supérieur, programme 172 « Recherches scientifiques et technologiques pluridisciplinaires » : justification des crédits (p. 185)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "8 431 090 298 € de CP en 2027"
        },
        {
          "title": "PAP 2027, programme 150 : crédits par titre et catégorie, cotisations des employeurs (p. 66)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 22, cotisations et contributions sociales : 178 319 418 € au PLF 2027 (retirées des deux bornes)"
        },
        {
          "title": "PAP 2027, programme 150 : crédits par titre et catégorie, dotations en fonds propres (p. 67)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 72, dotations en fonds propres : 23 861 347 € de CP au PLF 2027 (retirées du bas)"
        },
        {
          "title": "PAP 2027, programme 172 : crédits par titre et catégorie, transferts aux collectivités (p. 183)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Catégorie 63, transferts aux collectivités territoriales : 1 173 049 € de CP au PLF 2027 (retirés des deux bornes)"
        },
        {
          "title": "PAP 2027, programme 172, action 15 : contributions françaises à des organisations scientifiques internationales (p. 200)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "32,85 M€ (LEBM, CEBM, CIRC, HFSPO), retirés des deux bornes"
        },
        {
          "title": "PAP 2027, programme 172, action 17 : contributions françaises à des organisations ou projets scientifiques internationaux (p. 204)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "472,44 M€ (dont CERN 174,33 M€ et ITER 149,69 M€), retirés des deux bornes"
        },
        {
          "title": "PAP 2027, programme 172, action 18 : contributions françaises à des organisations ou projets scientifiques internationaux (p. 208)",
          "publisher": "Ministère de l’enseignement supérieur et de la recherche (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128257/file/PAP%202027%20-%20Recherche%20et%20enseignement%20sup%C3%A9rieur.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "75,63 M€ (dont ESO 32,58 M€), retirés des deux bornes"
        }
      ]
    },
    {
      "id": "csg-activite",
      "family": "impots",
      "label": "CSG sur les revenus d’activité",
      "today": "9,2 % sur les salaires et autres revenus d’activité",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 10.1,
        "hi": 12
      },
      "base": {
        "value": 111.9,
        "label": "111,9 Md€ de CSG sur les revenus d’activité en 2027 (prévision de la CCSS d’octobre 2026, tous affectataires)",
        "source": {
          "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "111 880 M€ en 2027 (colonne « 2027 (p) », en millions d’euros)"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "9,2 %",
      "exclusiveWith": [
        "csg-ensemble"
      ],
      "operatorCaveat": false,
      "limits": "Chiffrages 2024-2025, non portés à 2027. Statique : ni effet sur l’emploi ni sur les salaires. L’impôt sur le revenu perdu si la hausse est déductible n’est pas retiré.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "10,1 Md€ (part « CSG activité » d’un point sur tous les taux), 2024"
        },
        {
          "title": "Rapport d’information n° 901 (2024-2025) : Sécurité sociale, la boîte à outils du Sénat",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "12 Md€ pour les revenus d’activité"
        },
        {
          "title": "REPSS « Financement », 1.4.1. Valeur du point de CSG et des points de cotisation du régime général",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://evaluation.securite-sociale.fr/home/financement/1-4-1-valeur-du-point-de-csg-et.html",
          "date": "2026",
          "accessedAt": "2026-10-18",
          "figure": "17,9 Md€ × 67,1 % ≈ 12,0 Md€ en 2025 (calcul sur les chiffres publiés)"
        }
      ]
    },
    {
      "id": "csg-capital",
      "family": "impots",
      "label": "CSG sur les revenus du capital",
      "today": "10,6 % ; 9,2 % sur revenus fonciers, assurance-vie, épargne logement…",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 1.3,
        "hi": 1.9
      },
      "base": {
        "value": 19.2,
        "label": "19,2 Md€ de CSG sur les revenus et produits du capital en 2027 (patrimoine et placements, prévision de la CCSS d’octobre 2026, tous affectataires)",
        "source": {
          "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "19 171 M€ en 2027 (colonne « 2027 (p) »), dont 7 602 M€ sur le patrimoine et 11 569 M€ sur les placements"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "csg-ensemble"
      ],
      "operatorCaveat": false,
      "limits": "Le bas (IPP, 2024, ménages) et le haut (Sénat, vers 2025) précèdent la hausse de 2026 ; non portés à 2027. Statique : les réactions des épargnants ne sont pas comptées. Fourchette large.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "1,3 Md€ : part « CSG capital » d’une hausse d’un point de tous les taux de CSG, simulée en 2024 (TAXIPP, ménages) ; borne basse"
        },
        {
          "title": "Rapport d’information n° 901 (2024-2025) : Sécurité sociale, la boîte à outils du Sénat",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "0,8 Md€ (revenus du patrimoine) + 1,1 Md€ (revenus de placement) = 1,9 Md€ pour un point sur tous les taux, année non précisée (vers 2025) ; borne haute"
        },
        {
          "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Contexte, pas une borne : taux de 10,6 % en 2026 et 2027, sauf revenus fonciers, plus-values immobilières, assurance-vie, PEL, CEL et PEP (9,2 %)"
        }
      ]
    },
    {
      "id": "csg-ensemble",
      "family": "impots",
      "label": "CSG, tous les taux",
      "today": "9,2 % (salaires), 0 à 8,3 % (pensions), 9,2 ou 10,6 % (capital)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 12.3,
        "hi": 18
      },
      "base": {
        "value": 162.3,
        "label": "162,3 Md€ de CSG brute en 2027, toutes assiettes (prévision de la CCSS d’octobre 2026, tous affectataires)",
        "source": {
          "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "162 329 M€ de CSG brute en 2027 (colonne « 2027 (p) »), jeux compris (724 M€)"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "csg-activite",
        "csg-capital",
        "csg-pensions-taux-plein",
        "csg-remplacement"
      ],
      "operatorCaveat": false,
      "limits": "Chiffrages 2024-2025, non portés à 2027. Statique : ni effet sur l’emploi ni sur les salaires. Le bas suppose une hausse de la part déductible, donc 2,3 Md€ d’impôt sur le revenu en moins.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "12,3 Md€ sur le solde si la hausse porte sur la part déductible (14,6 Md€ de CSG, 2,3 Md€ d’IR en moins), 2024"
        },
        {
          "title": "Rapport d’information n° 901 (2024-2025) : Sécurité sociale, la boîte à outils du Sénat",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "18 Md€ pour un point sur tous les taux de CSG"
        },
        {
          "title": "REPSS « Financement », 1.4.1. Valeur du point de CSG et des points de cotisation du régime général",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://evaluation.securite-sociale.fr/home/financement/1-4-1-valeur-du-point-de-csg-et.html",
          "date": "2026",
          "accessedAt": "2026-10-18",
          "figure": "17,9 Md€ par point de CSG en 2025 (régime général)"
        },
        {
          "title": "L’impôt sur le revenu et la CSG (fiche de l’encyclopédie)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Limp%C3%B4t-sur-le-revenu-et-la-CSG",
          "date": "2026-06-01",
          "accessedAt": "2026-10-18",
          "figure": "18 Md€ en 2025 pour un point sur l’ensemble des taux"
        }
      ]
    },
    {
      "id": "csg-pensions-taux-plein",
      "family": "impots",
      "label": "CSG des pensions, taux de 8,3 %",
      "today": "8,3 % (taux plein) au-delà de 26 472 € de revenu fiscal (1 part, 2026)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 1.67,
        "hi": 2
      },
      "base": {
        "value": 30.6,
        "label": "30,6 Md€ de CSG sur les revenus de remplacement en 2027 (retraites, invalidité, indemnités journalières, chômage ; prévision de la CCSS d’octobre 2026, tous affectataires). Le taux plein des pensions n’en porte qu’une part.",
        "source": {
          "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "30 555 M€ en 2027 (colonne « 2027 (p) »)"
        }
      },
      "max": 0.9,
      "step": 0.1,
      "notches": [
        -0.9,
        -0.5,
        0,
        0.5,
        0.9
      ],
      "baseLabel": "8,3 %",
      "exclusiveWith": [
        "csg-ensemble",
        "csg-remplacement"
      ],
      "operatorCaveat": false,
      "limits": "Le haut (DSS, 2025) est brut, hors effet sur l’impôt sur le revenu ; le bas (IPP, 2027) est net de cet effet. Statique. Plage limitée à 0,9 point : l’écart avec les 9,2 % des salaires, seul chiffré.",
      "sources": [
        {
          "title": "Rapport d’information n° 901 (2024-2025) : Sécurité sociale, la boîte à outils du Sénat",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "valeur du point du taux de 8,3 % : 2 Md€ (1,8 Md€ pour l’aligner sur 9,2 %), selon le tableau DSS « en 2025 (hors effet sur l’impôt sur le revenu) » ; borne haute"
        },
        {
          "title": "Note IPP n° 129 : Comment mettre à contribution les retraités pour le redressement des finances publiques ?",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/09/Note_contribution_retraites_129.pdf",
          "date": "2026-09",
          "accessedAt": "2026-10-18",
          "figure": "1,5 Md€ net pour 0,9 point (de 8,3 % à 9,2 %), champ 2027, soit environ 1,67 Md€ par point (calcul) ; borne basse"
        },
        {
          "title": "CSG et CRDS sur les revenus d’activité et de remplacement",
          "publisher": "Direction de l’information légale et administrative (Service-public.fr)",
          "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2971",
          "date": "2026-06-01",
          "accessedAt": "2026-10-18",
          "figure": "Contexte, pas une borne : pensions au taux normal de 8,3 % au-delà de 26 472 € de revenu fiscal de référence 2024 pour 1 part (taux 2026)"
        }
      ]
    },
    {
      "id": "csg-remplacement",
      "family": "impots",
      "label": "CSG sur les revenus de remplacement",
      "today": "Pensions : 0 à 8,3 % selon le revenu ; chômage : 0 à 6,2 %",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 3.2,
        "hi": 4
      },
      "base": {
        "value": 30.6,
        "label": "30,6 Md€ de CSG sur les revenus de remplacement en 2027 (retraites, invalidité, indemnités journalières, chômage ; prévision de la CCSS d’octobre 2026, tous affectataires)",
        "source": {
          "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
          "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "30 555 M€ en 2027 (colonne « 2027 (p) »)"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "csg-ensemble",
        "csg-pensions-taux-plein"
      ],
      "operatorCaveat": false,
      "limits": "Un point sur chacun des taux en vigueur. Chiffrages 2024-2025, non portés à 2027. Statique ; l’impôt sur le revenu perdu si la hausse est déductible n’est pas retiré. Seuils des taux inchangés.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "3,2 Md€ (part « CSG remplacement » d’un point sur tous les taux), 2024"
        },
        {
          "title": "Rapport d’information n° 901 (2024-2025) : Sécurité sociale, la boîte à outils du Sénat",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "4 Md€ pour les revenus de remplacement"
        },
        {
          "title": "REPSS « Financement », 1.4.1. Valeur du point de CSG et des points de cotisation du régime général",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://evaluation.securite-sociale.fr/home/financement/1-4-1-valeur-du-point-de-csg-et.html",
          "date": "2026",
          "accessedAt": "2026-10-18",
          "figure": "17,9 Md€ × 21,8 % ≈ 3,9 Md€ en 2025 (calcul sur les chiffres publiés)"
        }
      ]
    },
    {
      "id": "cultes-alsace-moselle-emplois",
      "family": "depenses",
      "label": "Cultes d’Alsace-Moselle : emplois",
      "today": "1 141 emplois (ETPT) payés par l’État au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % des emplois",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.000266,
        "hi": 0.000301
      },
      "max": 100,
      "step": 1,
      "notches": [
        -100,
        -50,
        0,
        50,
        100
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics"
      ],
      "operatorCaveat": false,
      "limits": "1 % = 11,4 emplois ; paie brute, bas au coût d’un entrant, haut au coût moyen. Hors pensions et cotisations des employeurs. −100 % suppose une fin au 1er janvier 2027, sans garder les agents en place.",
      "sources": [
        {
          "title": "PAP 2027, mission Administration générale et territoriale de l’État, programme 216 : plafond d’emplois par catégorie (p. 107)",
          "publisher": "Ministère de l’intérieur (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128203/file/PAP%202027%20-%20Administration%20g%C3%A9n%C3%A9rale%20et%20territoriale%20de%20l%27Etat.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "1 141,05 ETPT de personnels des cultes au plafond demandé pour 2027"
        },
        {
          "title": "PAP 2027, programme 216 : coûts moyens d’entrée, globaux et de sortie par catégorie d’emplois (p. 111)",
          "publisher": "Ministère de l’intérieur (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128203/file/PAP%202027%20-%20Administration%20g%C3%A9n%C3%A9rale%20et%20territoriale%20de%20l%27Etat.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Rémunérations d’activité : 23 331 € (entrée), 26 354 € (coût global), 27 944 € (sortie) par emploi ; coût chargé hors CAS 32 335 €"
        }
      ]
    },
    {
      "id": "cvae-taux",
      "family": "impots",
      "label": "Cotisation sur la valeur ajoutée",
      "today": "taux de 0 à 0,28 % selon le chiffre d’affaires, 4 110 M€ au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % de tous les taux (1 % du produit brut)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.03,
        "hi": 0.0411
      },
      "base": {
        "value": 4.11,
        "label": "4,11 Md€ de cotisation sur la valeur ajoutée des entreprises prévus en 2027 à l’état A du PLF 2027 (produit brut)",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Ligne 1497 : 4 110 000 000 € évalués pour 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 4.11,
        "label": "4 110 M€ de CVAE au PLF 2027 (produit brut)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Bas : coût net publié d’une suppression en 2027 (prévision de 2024) ; haut : 1 % du produit brut. Une hausse, plus souvent plafonnée à la valeur ajoutée, rapporterait moins que le haut. Comportements non comptés.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A « Voies et moyens pour 2027 », p. 231",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Ligne 1497 : 4 110 000 000 € de CVAE prévus en 2027 (produit brut), soit 41,1 M€ par 1 % (haut)"
        },
        {
          "title": "Rapport général n° 144 (2024-2025), tome II, fascicule 1, sur le projet de loi de finances pour 2025, article 15 « Report de trois ans de la suppression progressive de la cotisation sur la valeur ajoutée des entreprises »",
          "publisher": "Sénat, commission des finances",
          "url": "https://www.senat.fr/rap/l24-144-21/l24-144-212.html",
          "date": "2024-11-21",
          "accessedAt": "2026-10-18",
          "figure": "D’après l’évaluation préalable, garder le taux de 0,28 % en 2027 au lieu de la suppression prévue par la loi de finances pour 2024 : 3 Md€ de CVAE en 2027, soit 30 M€ par 1 % (bas)"
        },
        {
          "title": "Rapport général n° 139 (2025-2026), tome II, fascicule 1, sur le projet de loi de finances pour 2026, article 11, p. 275",
          "publisher": "Sénat, commission des finances",
          "url": "https://www.senat.fr/rap/l25-139-21/l25-139-211.pdf",
          "date": "2025-11-24",
          "accessedAt": "2026-10-18",
          "figure": "D’après l’évaluation préalable, taux maximal ramené de 0,28 % à 0,09 % en 2027 (plafonnement à la valeur ajoutée ajusté) : 2,2 Md€ en 2027, soit environ 32 M€ par 1 %, dans la fourchette"
        },
        {
          "title": "Rapport d’information n° 942 (2025-2026) sur le poids des prélèvements obligatoires, p. 91",
          "publisher": "Sénat, mission d’information",
          "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
          "date": "2026-09-02",
          "accessedAt": "2026-10-18",
          "figure": "Barème en vigueur : de 0 à 0,28 % au titre de 2026 et 2027"
        }
      ]
    },
    {
      "id": "defense",
      "family": "depenses",
      "label": "Effort de défense",
      "today": "Mission Défense : 63,4 Md€ hors pensions en 2027 (LPM actualisée)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "0,1 point de PIB",
        "short": "pt"
      },
      "perUnit": {
        "lo": 3.135,
        "hi": 3.135
      },
      "base": {
        "value": 63.4,
        "label": "63,4 Md€ de crédits de paiement de la mission Défense hors pensions au PLF 2027",
        "source": {
          "title": "PAP 2027, mission Défense : présentation stratégique de la mission (p. 10)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "63,4 Md€ de CP hors pensions en 2027 (78,7 Md€ en AE)"
        }
      },
      "max": 3,
      "step": 1,
      "notches": [
        -3,
        -1,
        0,
        1,
        3
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "service-national-appeles"
      ],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": false,
      "laterNote": "La LPM actualisée prévoit d’autres hausses jusqu’en 2030 : elles ne comptent pas ici.",
      "limits": "Conversion d’une part du PIB 2027 du PLF en euros, exacte par construction. Ne dit pas ce qui est acheté ni quand c’est payé ; l’effet sur l’activité et les recettes n’est pas compté.",
      "sources": [
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour 2027, annexe : solde public en Md€ (p. 49)",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "PIB nominal 2027 : 3 135,0 Md€, soit 3,135 Md€ pour 0,1 point"
        },
        {
          "title": "PAP 2027, mission Défense : présentation stratégique de la mission (p. 10)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Mission Défense : 63,4 Md€ de CP hors pensions en 2027 (+6,5 Md€)"
        }
      ]
    },
    {
      "id": "depense-allocation-soutien-familial",
      "family": "sociale",
      "label": "Allocation de soutien familial",
      "today": "Montants gelés en 2027 au PLFSS : environ 3 646 M€ de dépense",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.03646,
        "hi": 0.03646
      },
      "base": {
        "value": 3.709,
        "label": "3 709 M€ d’allocation de soutien familial prévus en 2027 (CCSS octobre 2026, avant les mesures du PLFSS, donc avant le gel ; environ 3 646 M€ après). On garde le chiffre d’avant mesures, comme pour les autres prestations familiales de ce tableau.",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF » (p. 117 du PDF)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Allocation de soutien familial : 3 439 M€ (2025), 3 577 M€ (2026 p), 3 709 M€ (2027 p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 3.646,
        "label": "3 646 M€ d’allocation de soutien familial en 2027 avec le gel, calculés sur 3 709 M€ prévus avant (CCSS)"
      },
      "exclusiveWith": [
        "prestations-familiales-revalorisation"
      ],
      "operatorCaveat": false,
      "limits": "Montant calculé : 3 709 M€ prévus avant le gel, moins la hausse de 2,3 % du 1er avril 2027 (9 mois sur 12). Suppose un barème ajusté d’autant ; ne compte pas l’effet sur le recours.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 (dépenses de prestations financées par la CNAF)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "allocation de soutien familial : 3 709 M€ prévus en 2027 avant les mesures de la loi de financement (3 577 M€ en 2026)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, encadré 1 et tableau 3 (revalorisation de la base mensuelle des allocations familiales)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "sans le gel, hausse de 2,3 % au 1er avril 2027, qui joue d’avril à décembre (9/12) ; avec le report de la hausse d’avril 2026, +1,9 % en moyenne annuelle ; le chiffre de 3 709 M€ l’inclut, le gel en retire 0,75 × 2,3 % : 3 709 / 1,01725 = 3 646 M€ (calcul)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, encadré 1 (pondération de la revalorisation)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "En moyenne annuelle, 3/12 de la hausse de l’année précédente et 9/12 de celle de l’année : le gel retire les 9/12 de la hausse d’avril 2027 (tableau 3), pas toute la moyenne annuelle de 1,9 %, qui comprend le report de la hausse d’avril 2026"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027, partie PLFSS « Famille et petite enfance »",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "au PLFSS 2027, la base de calcul des prestations familiales est révisée au 1er avril 2027 pour que les montants restent ceux de 2026 (gel)"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "gel des prestations familiales en 2027 dans la prévision du PLF et du PLFSS : 0,5 Md€ (p. 27)"
        }
      ]
    },
    {
      "id": "depense-allocations-familiales",
      "family": "sociale",
      "label": "Allocations familiales",
      "today": "13,4 Md€ prévus en 2027 avant le gel du PLFSS, environ 13,2 Md€ après",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.131797,
        "hi": 0.131797
      },
      "base": {
        "value": 13.407,
        "label": "13 407 M€ d’allocations familiales prévus en 2027 (CCSS octobre 2026, avant les mesures du PLFSS, donc avant le gel).",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF » (p. 117 du PDF)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Allocations familiales : 13 909 M€ (2025), 13 711 M€ (2026 p), 13 407 M€ (2027 p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 13.1797,
        "label": "13 180 M€ d’allocations familiales en 2027 avec le gel, calculés sur 13 407 M€ prévus avant (CCSS)"
      },
      "exclusiveWith": [
        "prestations-familiales-revalorisation"
      ],
      "operatorCaveat": false,
      "limits": "Montant calculé : 13 407 M€ prévus avant le gel, moins la hausse de 2,3 % du 1er avril 2027 (9 mois sur 12). Effet statique en 2027, sans réaction des familles ; suppose un barème ajusté d’autant.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Allocations familiales : 13 909 M€ (2025), 13 711 M€ (2026 p), 13 407 M€ (2027 p), avant les mesures du PLFSS ; avec le gel : 13 407 / 1,01725 = 13 180 M€ (calcul)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, encadré 1 (pondération de la revalorisation)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "En moyenne annuelle, 3/12 de la hausse de l’année précédente et 9/12 de celle de l’année : le gel retire les 9/12 de la hausse d’avril 2027 (tableau 3), pas toute la moyenne annuelle de 1,9 %, qui comprend le report de la hausse d’avril 2026"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, tableau 3 « Calcul du taux de revalorisation appliqué à la BMAF »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Base mensuelle : +0,8 % au 1er avril 2026, +2,3 % prévu au 1er avril 2027 avant le gel, soit +1,9 % en moyenne annuelle en 2027"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027, partie PLFSS « Famille et petite enfance »",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "au PLFSS 2027, la base de calcul des prestations familiales est révisée au 1er avril 2027 pour que les montants restent ceux de 2026 (gel)"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "gel des prestations familiales en 2027 : 0,5 Md€"
        }
      ]
    },
    {
      "id": "depense-assurance-chomage-allocations",
      "family": "sociale",
      "label": "Allocations chômage et aides",
      "today": "38,7 Md€ en 2027 (prévision de l’Unédic)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.387,
        "hi": 0.387
      },
      "base": {
        "value": 38.7,
        "label": "38,7 Md€ d’allocations chômage et d’aides en 2027 selon la prévision de l’Unédic de juin 2026 (trajectoire reprise par le PLF 2027, art. 68), sans les cotisations aux caisses de retraite ni les autres dépenses de l’Unédic (47,5 Md€ au total).",
        "source": {
          "title": "Situation financière de l’Assurance chômage à horizon 2028 (prévisions financières, 17 juin 2026), p. 10",
          "publisher": "Unédic",
          "url": "https://www.unedic.org/storage/uploads/2026/06/17/situation-financiere-assurance-chomage-a-horizon-2028-juin-2026_uid_6a32884bd3186.pdf",
          "date": "2026-06-17",
          "accessedAt": "2026-10-18",
          "figure": "dépenses d’allocations et d’aides : près de 38,7 Md€ en 2027 (37,2 Md€ en 2025)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 38.7,
        "label": "38,7 Md€ d’allocations et d’aides prévues en 2027 par l’Unédic (juin 2026)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Statique : une règle changée ne joue que sur les nouveaux entrants, donc moins en 2027. Allocations brutes, dont une part revient aux APU (CSG, CRDS). Hors ASS, France Travail, retraites et dette. Scénario du PLF : prestations emploi stables (HCFP), ligne peut-être plus basse.",
      "sources": [
        {
          "title": "Situation financière de l’Assurance chômage à horizon 2028 (prévisions financières, juin 2026), tableau 4 « Recettes et dépenses de l’Unédic pour les années 2025 à 2028 » (p. 15)",
          "publisher": "Unédic (gestionnaire paritaire de l’assurance chômage)",
          "url": "https://www.unedic.org/storage/uploads/2026/06/17/situation-financiere-assurance-chomage-a-horizon-2028-juin-2026_uid_6a32884bd3186.pdf",
          "date": "2026-06-17",
          "accessedAt": "2026-10-18",
          "figure": "Allocations brutes et aides : 37,2 Md€ (2025), 38,1 Md€ (2026), 38,7 Md€ (2027), soit 0,387 Md€ par 1 % ; hors caisses de retraite (2,5 Md€), financement de France Travail (5,3 Md€) et dépenses nettes d’intérêt (0,9 Md€), sur 47,5 Md€ de dépenses en 2027 (tableau en image dans le PDF). Le PLF 2027 reprend cette prévision (article 68)"
        },
        {
          "title": "Situation financière de l’Assurance chômage à horizon 2028 (prévisions financières, juin 2026), p. 10",
          "publisher": "Unédic (gestionnaire paritaire de l’assurance chômage)",
          "url": "https://www.unedic.org/storage/uploads/2026/06/17/situation-financiere-assurance-chomage-a-horizon-2028-juin-2026_uid_6a32884bd3186.pdf",
          "date": "2026-06-17",
          "accessedAt": "2026-10-18",
          "figure": "dépenses d’allocations et d’aides : près de 38,7 Md€ en 2027, dans la prévision que reprend le PLF 2027"
        },
        {
          "title": "Projet de loi de finances pour 2027, évaluations préalables des articles, article 68 « Garantie de l’État à l’Unédic », tableau 1 (p. 547)",
          "publisher": "Gouvernement (évaluations préalables annexées au projet de loi de finances pour 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "dépenses de l’Unédic en 2027 au PLF : 47,5 Md€, les mêmes que dans la prévision de l’Unédic de juin 2026 : le PLF reprend cette prévision"
        },
        {
          "title": "Projet de loi de finances pour 2027, évaluations préalables des articles, article 68 « Garantie de l’État à l’Unédic », source du tableau 1 (p. 547)",
          "publisher": "Gouvernement (évaluations préalables annexées au projet de loi de finances pour 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "pour 2027, le PLF reprend la trajectoire de l’Unédic, retouchée seulement sur la compensation versée par l’État (une recette) : les dépenses restent celles de l’Unédic"
        },
        {
          "title": "Projet de loi de finances pour 2027, évaluations préalables des articles, article 68 « Garantie de l’État à l’Unédic », note du tableau 1 (p. 548)",
          "publisher": "Gouvernement (évaluations préalables annexées au projet de loi de finances pour 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "contexte, hors fourchette : la prévision propre du Gouvernement peut s’écarter de celle de l’Unédic"
        },
        {
          "title": "Rapport économique, social et financier, annexe au projet de loi de finances pour 2027, tableau 20 « Solde, recettes et dépenses des administrations de sécurité sociale (ASSO) », p. 132",
          "publisher": "Gouvernement (annexe au projet de loi de finances pour 2027, direction générale du Trésor)",
          "url": "https://www.tresor.economie.gouv.fr/Articles/03454e04-445d-4ce6-832b-cff601a11485/files/56839f98-37fc-48d8-b502-81cac5a48cad",
          "date": "2026-10-06",
          "accessedAt": "2026-10-18",
          "figure": "contexte, hors fourchette : l’Unédic est comptée parmi les administrations de sécurité sociale (ASSO), 46,8 Md€ de dépenses en 2027 en comptabilité nationale (total non consolidé, pas le montant des allocations)"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027 (p. 27)",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "contexte, hors fourchette : prestations emploi (champ plus large que l’Unédic) stables en 2027 dans le scénario du PLF (−0,3 %)"
        }
      ]
    },
    {
      "id": "depense-complement-mode-de-garde",
      "family": "sociale",
      "label": "Complément mode de garde (CMG)",
      "today": "7 690 M€ prévus en 2027 avant le gel du PLFSS, environ 7 622 M€ après",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.07622,
        "hi": 0.07622
      },
      "base": {
        "value": 7.69,
        "label": "7 690 M€ de complément mode de garde prévus en 2027 (CCSS octobre 2026, avant les mesures du PLFSS ; cotisations prises en charge comprises).",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF » (p. 117 du PDF)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Complément mode de garde : 7 372 M€ (2025), 7 546 M€ (2026 p), 7 690 M€ (2027 p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 7.622,
        "label": "7 622 M€ de complément de mode de garde en 2027 avec le gel, calculés sur 7 690 M€ prévus avant (CCSS)"
      },
      "exclusiveWith": [
        "places-creche",
        "prestations-familiales-revalorisation"
      ],
      "operatorCaveat": false,
      "limits": "Montant calculé : la part qui suit la base mensuelle (4 008 M€) perd la hausse de 2,3 % du 1er avril 2027 (9 mois sur 12) ; les cotisations prises en charge (3 682 M€) suivent le Smic. Effet statique, sans réaction des familles ni des modes de garde.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Complément mode de garde : 7 690 M€ (2027 p), dont cotisations prises en charge 3 455 M€ (assistante maternelle) et 227 M€ (employé à domicile) ; part qui suit la base mensuelle : 7 690 − 3 682 = 4 008 M€ ; avec le gel : 3 682 + 4 008 / 1,01725 = 7 622 M€ (calcul), p. 117"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 (garde à domicile)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "employé à domicile : 540 M€ en 2027, dont cotisations prises en charge 227 M€ (p. 117)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, encadré 1 « Méthodologie de la décomposition de l’évolution des prestations familiales »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "le CMG suit la base mensuelle, sauf les cotisations prises en charge, qui suivent le Smic (p. 119)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, encadré 1 (pondération de la revalorisation)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "En moyenne annuelle, 3/12 de la hausse de l’année précédente et 9/12 de celle de l’année : le gel retire les 9/12 de la hausse d’avril 2027 (tableau 3), pas toute la moyenne annuelle de 1,9 %, qui comprend le report de la hausse d’avril 2026"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, tableau 3 « Calcul du taux de revalorisation appliqué à la BMAF »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Base mensuelle : +0,8 % au 1er avril 2026, +2,3 % prévu au 1er avril 2027 avant le gel, soit +1,9 % en moyenne annuelle en 2027"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "gel des prestations familiales en 2027 : 0,5 Md€ (p. 27)"
        },
        {
          "title": "Budget 2027, dossier de présentation des projets de loi de finances et de financement de la sécurité sociale",
          "publisher": "Gouvernement (ministères économiques et sociaux)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "le gel de la base de calcul porte sur l’ensemble des prestations familiales (p. 144)"
        }
      ]
    },
    {
      "id": "depense-conge-naissance",
      "family": "sociale",
      "label": "Congé supplémentaire de naissance",
      "today": "300 à 400 M€ prévus en 2027, deuxième année du congé",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.003,
        "hi": 0.004
      },
      "base": {
        "value": 0.4,
        "label": "400 M€ en 2027 : ce que la CNAF verse à la CNAM pour le congé de naissance. Le texte de la CCSS dit 0,3 Md€ en 2026 et +0,1 Md€ en 2027 ; la ligne des prestations du tableau de la CNAM affiche encore 300 M€ en 2027.",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.3 « Les comptes de la CNAM – Maladie », tableau 2 « Charges et produits nets de la CNAM-Maladie », produits (p. 173 du PDF)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "transfert de la CNAF au titre du congé de naissance : 300 M€ (2026 p), 400 M€ (2027 p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 0.4,
        "lo": 0.3,
        "label": "300 à 400 M€ prévus en 2027 pour le congé de naissance (CCSS)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Effet statique en 2027, sans réaction des parents. Congé créé en 2026 et encore en montée en charge : 300 M€ de prestations au tableau de la CNAM, 400 M€ remboursés par la CNAF.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.3 « Les comptes de la CNAM – Maladie », tableau 2 « Charges et produits nets de la CNAM-Maladie »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "prestations au titre du congé de naissance : 300 M€ (2026 p), 300 M€ (2027 p)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 4.3 « Les comptes de la CNAM – Maladie », tableau 2 (produits)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "remboursement par la CNAF au titre du congé de naissance : 300 M€ (2026 p), 400 M€ (2027 p)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.4 « Les prestations maladie, AT-MP et autonomie hors ONDAM »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "0,3 Md€ en 2026, puis +0,1 Md€ de montée en charge en 2027"
        }
      ]
    },
    {
      "id": "depense-fiscale-heures-supplementaires",
      "family": "impots",
      "label": "Heures supplémentaires exonérées",
      "today": "5,69 Md€ au PLF 2027 (impôt 2,27 ; cotisations 3,42)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % du coût des exonérations",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.0569,
        "hi": 0.0569
      },
      "base": {
        "value": 5.69,
        "label": "5,69 Md€ en 2027, la somme de deux lignes du PAP Travail 2027 : la dépense fiscale n° 120146 (impôt sur le revenu, 2 273 M€, ordre de grandeur, p. 111, « 81 quater 2 212 2 219 2 273 ») et les crédits de la sous-action 05.02 « Exonérations TEPA » qui compensent les cotisations (3 416,8 M€, p. 18). Aucune ligne ne publie le total à elle seule.",
        "source": {
          "title": "PAP 2027, mission Travail, emploi et administration des ministères sociaux : sous-action 05-02 « Exonérations TEPA » (p. 18 du PDF) ; dépense fiscale n° 120146 (p. 111)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128284/file/PAP%202027%20-%20Travail%20emploi%20et%20administration%20des%20minist%C3%A8res%20sociaux.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Exonérations TEPA (cotisations) : 3 416 813 623 € en 2027 ; plus l’exonération d’impôt sur le revenu : 2 273 M€ en 2027 ; total 5,69 Md€ (calcul)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 5.69,
        "label": "5,69 Md€ de coût au PLF 2027 : 2,27 Md€ d’impôt sur le revenu et 3,42 Md€ de cotisations compensées"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Effet statique, volume d’heures inchangé ; coût de l’impôt en ordre de grandeur. Au-dessus de 0, une extension de même coût, sans dessin précis. La compensation à la Sécurité sociale mesure les cotisations perdues.",
      "sources": [
        {
          "title": "PAP 2027, mission Travail, emploi et administration des ministères sociaux : dépense fiscale n° 120146 (p. 111)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128284/file/PAP%202027%20-%20Travail%20emploi%20et%20administration%20des%20minist%C3%A8res%20sociaux.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "exonération d’impôt sur le revenu des heures supplémentaires : 2 273 M€ en 2027 (ordre de grandeur)"
        },
        {
          "title": "PAP 2027, mission Travail, emploi et administration des ministères sociaux : sous-action 05.02 « Exonérations TEPA » (p. 18 et 147-148)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128284/file/PAP%202027%20-%20Travail%20emploi%20et%20administration%20des%20minist%C3%A8res%20sociaux.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "3 416,8 M€ en 2027 (3 324,9 M€ en LFI 2026) pour compenser à la Sécurité sociale la réduction de cotisations salariales et la déduction patronale sur les heures supplémentaires"
        }
      ]
    },
    {
      "id": "depense-prepare",
      "family": "sociale",
      "label": "Congé parental indemnisé (PreParE)",
      "today": "652 M€ prévus en 2027 avant le gel du PLFSS, environ 641 M€ après",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.006409,
        "hi": 0.006409
      },
      "base": {
        "value": 0.652,
        "label": "652 M€ d’allocations versées pendant le congé parental (CLCA, PreParE) prévus en 2027 (CCSS octobre 2026, avant les mesures du PLFSS, donc avant le gel).",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF » (p. 117 du PDF)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Allocations versées pendant le congé parental (CLCA, PreParE) : 687 M€ (2025), 659 M€ (2026 p), 652 M€ (2027 p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 0.6409,
        "label": "641 M€ d’allocations de congé parental (CLCA, PreParE) en 2027 avec le gel, calculés sur 652 M€ prévus avant (CCSS)"
      },
      "exclusiveWith": [
        "prestations-familiales-revalorisation"
      ],
      "operatorCaveat": false,
      "limits": "Montant calculé : 652 M€ prévus avant le gel, moins la hausse de 2,3 % du 1er avril 2027 (9 mois sur 12). Effet statique en 2027, sans réaction des parents (durée du congé, partage).",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6 « Les prestations familiales », tableau 1 « Dépenses de prestations financées par la CNAF »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "allocations versées pendant le congé parental (CLCA, PreParE) : 687 M€ (2025), 659 M€ (2026 p), 652 M€ (2027 p), avant les mesures du PLFSS ; avec le gel : 652 / 1,01725 = 641 M€ (calcul), p. 117"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, encadré 1 (pondération de la revalorisation)",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "En moyenne annuelle, 3/12 de la hausse de l’année précédente et 9/12 de celle de l’année : le gel retire les 9/12 de la hausse d’avril 2027 (tableau 3), pas toute la moyenne annuelle de 1,9 %, qui comprend le report de la hausse d’avril 2026"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.6, tableau 3 « Calcul du taux de revalorisation appliqué à la BMAF »",
          "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Base mensuelle : +0,8 % au 1er avril 2026, +2,3 % prévu au 1er avril 2027 avant le gel, soit +1,9 % en moyenne annuelle en 2027"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "gel des prestations familiales en 2027 : 0,5 Md€ (p. 27)"
        }
      ]
    },
    {
      "id": "dmtg-tranche-20",
      "family": "impots",
      "label": "Droits de succession : taux de 20 %",
      "today": "20 % sur la part taxable de 15 932 à 552 324 € (après abattement)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point (successions et donations en ligne directe)",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.2,
        "hi": 0.24
      },
      "base": {
        "value": 22.029,
        "label": "22,0 Md€ de droits de mutation à titre gratuit au PLF 2027 : 5,0 Md€ de donations et 17,0 Md€ de successions, tous liens de parenté confondus (état A, lignes 1705 et 1706). Le levier ne porte que sur une tranche de la ligne directe.",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A, lignes 1705 « Mutations à titre gratuit entre vifs (donations) » et 1706 « Mutations à titre gratuit par décès » (p. 231)",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Donations : 5 009 335 142 € ; successions : 17 019 928 378 € prévus en 2027, soit 22,0 Md€"
        }
      },
      "max": 5,
      "step": 0.1,
      "notches": [
        -5,
        -1,
        0,
        1,
        5
      ],
      "baseLabel": "20 %",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Microsimulation sur le tarif 2025, comportements inchangés ; la hausse est le miroir de la baisse. Le PLF 2027 (art. 4) taxe à 6 % des dons d’argent du 1er semestre 2027, non chiffré : la base 2027 peut baisser.",
      "sources": [
        {
          "title": "Corriger les principales distorsions de l’imposition du patrimoine (décembre 2025), tableau n° 12 (p. 180)",
          "publisher": "Conseil des prélèvements obligatoires, d’après la microsimulation de la DG Trésor",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251201-Corriger-les-principales-distorsions-de-l-imposition-du-patrimoine.pdf",
          "date": "2025-12",
          "accessedAt": "2026-10-18",
          "figure": "fraction de part nette taxable de 15 932 € à 552 324 € : de 20 % à 19 %, 0,2 Md€ ; de 20 % à 15 %, 1,2 Md€"
        },
        {
          "title": "PLF 2027, évaluations préalables des articles, article 4 (p. 37 et 41)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "dons de sommes d’argent du 1er janvier au 30 juin 2027 à un descendant de 18 à 49 ans : taux unique de 6 % jusqu’à 100 000 €, coût non chiffrable en 2027 (contexte, hors fourchette)"
        }
      ]
    },
    {
      "id": "dmtg-tranche-45",
      "family": "impots",
      "label": "Droits de succession : taux de 45 %",
      "today": "45 % sur la part taxable au-delà de 1 805 677 € (après abattement)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point (successions et donations en ligne directe)",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.02,
        "hi": 0.02
      },
      "base": {
        "value": 22.029,
        "label": "22,0 Md€ de droits de mutation à titre gratuit au PLF 2027 : 5,0 Md€ de donations et 17,0 Md€ de successions, tous liens de parenté confondus (état A, lignes 1705 et 1706). Le levier ne porte que sur une tranche de la ligne directe.",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A, lignes 1705 « Mutations à titre gratuit entre vifs (donations) » et 1706 « Mutations à titre gratuit par décès » (p. 231)",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Donations : 5 009 335 142 € ; successions : 17 019 928 378 € prévus en 2027, soit 22,0 Md€"
        }
      },
      "max": 10,
      "step": 0.1,
      "notches": [
        -10,
        -5,
        0,
        5,
        10
      ],
      "baseLabel": "45 %",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Microsimulation sur le tarif 2025, chiffres arrondis au dixième de milliard, sans changement de comportement. Seule la baisse est chiffrée : la hausse en est le miroir. Les effets se croisent avec le pacte Dutreil.",
      "sources": [
        {
          "title": "Corriger les principales distorsions de l’imposition du patrimoine (décembre 2025), tableau n° 12 (p. 180)",
          "publisher": "Conseil des prélèvements obligatoires, d’après la microsimulation de la DG Trésor",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251201-Corriger-les-principales-distorsions-de-l-imposition-du-patrimoine.pdf",
          "date": "2025-12",
          "accessedAt": "2026-10-18",
          "figure": "fraction de part nette taxable au-delà de 1 805 677 € : de 45 % à 40 %, 0,1 Md€ ; de 45 % à 35 %, 0,2 Md€"
        }
      ]
    },
    {
      "id": "dutreil-exoneration",
      "family": "impots",
      "label": "Pacte Dutreil : taux d’exonération",
      "today": "75 % de la valeur des titres transmis exonérée, inchangé au PLF 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 point du taux d’exonération",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.0507,
        "hi": 0.052
      },
      "base": {
        "value": 3.8,
        "label": "3,8 Md€ : coût prévu en 2027 de l’exonération partielle du pacte Dutreil (dépense fiscale n° 520110, CGI art. 787 B et 787 C), donné comme un ordre de grandeur au PAP 2027 Économie.",
        "source": {
          "title": "PAP 2027, mission Économie : dépense fiscale n° 520110 (p. 38)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "3 800 M€ en 2025, en 2026 et en 2027 (fiabilité : ordre de grandeur)"
        }
      },
      "max": 25,
      "step": 0.1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "75 %",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Bas : PAP 2027 (3,8 Md€, ordre de grandeur). Haut : CPO (75 % → 50 % : 1,3 Md€, sur les 4 Md€ du PLF 2026). Sénat, d’après la Cour des comptes : 5,5 Md€ en 2024, avant le resserrement de 2026 (hors fourchette).",
      "sources": [
        {
          "title": "PAP 2027, mission Économie : dépense fiscale n° 520110 (p. 38)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "exonération partielle (CGI, art. 787 B et 787 C) : 3 800 M€ en 2025, 2026 et 2027 (ordre de grandeur), soit 50,7 M€ par point"
        },
        {
          "title": "Corriger les principales distorsions de l’imposition du patrimoine (décembre 2025), p. 209",
          "publisher": "Conseil des prélèvements obligatoires",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251201-Corriger-les-principales-distorsions-de-l-imposition-du-patrimoine.pdf",
          "date": "2025-12",
          "accessedAt": "2026-10-18",
          "figure": "taux ramené de 75 % à 50 % : 1,3 Md€, soit 52 M€ par point (le rapport cite l’estimation de 4 Md€ du PLF 2026)"
        },
        {
          "title": "Rapport d’information n° 760 (2025-2026) sur l’imposition des hauts patrimoines, p. 170",
          "publisher": "Sénat, commission des finances",
          "url": "https://www.senat.fr/rap/r25-760/r25-7601.pdf",
          "date": "2026-06-17",
          "accessedAt": "2026-10-18",
          "figure": "coût 2024 d’après les données de la Cour des comptes : 5,5 Md€, « borne basse », avant le resserrement de la loi de finances pour 2026 (contexte, hors fourchette)"
        }
      ]
    },
    {
      "id": "effectifs-publics",
      "family": "depenses",
      "label": "Effectifs de la fonction publique",
      "today": "Schéma d’emplois du PLF 2027 : État +8 025 ETP, opérateurs −1 209",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "10 000 emplois",
        "short": "emplois"
      },
      "perUnit": {
        "lo": 0.28,
        "hi": 0.406
      },
      "base": {
        "value": 247.557,
        "label": "247,6 Md€ de salaires et traitements bruts versés par les administrations publiques en 2025 (Insee). Le chiffre est hors cotisations des employeurs, comme le chiffrage du levier ; il atteint 370,0 Md€ cotisations comprises. C’est la dernière année publiée, et la même masse que pour le point d’indice.",
        "source": {
          "title": "Administrations publiques en 2025 (comptes nationaux annuels, base 2020), tableau 7.301 « Compte des administrations publiques (S13) »",
          "publisher": "Insee",
          "url": "https://www.insee.fr/fr/statistiques/8988833",
          "date": "2026-08-28",
          "accessedAt": "2026-10-18",
          "figure": "Salaires et traitements bruts (D11) des APU : 245,586 Md€ en 2024, 247,557 Md€ en 2025. Rémunération des salariés (D1) : 370,012 Md€ en 2025, dont cotisations sociales à la charge des employeurs (D12) : 122,455 Md€"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "overlapsWith": [
        "credits-administration-penitentiaire",
        "credits-aides-indirectes-etudiants",
        "credits-asile",
        "credits-culture",
        "credits-integration",
        "credits-justice-judiciaire",
        "credits-pjj",
        "credits-politique-de-la-ville",
        "credits-remunerations-enseignement-scolaire",
        "credits-universites-recherche",
        "cultes-alsace-moselle-emplois",
        "defense",
        "france-services-espaces",
        "ondam",
        "places-creche",
        "service-national-appeles"
      ],
      "operatorCaveat": false,
      "laterNote": "Une baisse par non-remplacement des départs s’étale sur plusieurs années ; seule l’année 2027 pleine entre dans le total.",
      "limits": "Bas : salaire brut d’un entrant ; haut : salaire brut moyen de 2024. Hors cotisations des employeurs et hausse des salaires d’ici 2027 ; postes au 1er janvier. Plage : les 10 000 agents que chiffre la Cour.",
      "sources": [
        {
          "title": "Le niveau et l’évolution de la masse salariale publique (fiche de l’encyclopédie, 6 juillet 2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Le-niveau-et-l%C3%A9volution-de-la-masse-salariale-publique",
          "date": "2026-07-06",
          "accessedAt": "2026-10-18",
          "figure": "1 000 postes : 28 M€ (territoriale), 31 M€ (État), 34 M€ (hospitalière), salaire brut des entrants ; bas de 0,28 Md€ pour 10 000"
        },
        {
          "title": "L’évolution des rémunérations dans la fonction publique en 2024 (Rapport annuel, édition 2026)",
          "publisher": "DGAFP (Portail de la fonction publique)",
          "url": "https://www.fonction-publique.gouv.fr/toutes-les-publications/levolution-des-remunerations-dans-la-fonction-publique-en-2024",
          "date": "2026-10-15",
          "accessedAt": "2026-10-18",
          "figure": "3 382 € brut par mois et par agent en 2024, soit 0,406 Md€ par an pour 10 000 emplois (3 382 × 12 × 10 000), haut de la fourchette"
        },
        {
          "title": "La masse salariale de l’État : enjeux et leviers (communication à la commission des finances du Sénat, juillet 2015), p. 87",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/EzPublish/20150909-rapport-masse-salariale-Etat.pdf",
          "date": "2015-07",
          "accessedAt": "2026-10-18",
          "figure": "10 000 agents de moins : environ 300 M€ par an pour l’État (coût d’un entrant de 2014, charges comprises hors pensions). Fixe la plage à 10 000 emplois, pas le montant"
        },
        {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), chiffres clés « Emplois État », p. 58-59",
          "publisher": "Ministères économiques et financiers (dossier de presse PLF et PLFSS 2027, Direction du budget)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Schéma d’emplois du PLF 2027 (budget général et budgets annexes) : État +8 025 ETP, opérateurs −1 209 ETP, État et opérateurs +6 816 ETP"
        }
      ]
    },
    {
      "id": "forfait-social-taux",
      "family": "impots",
      "label": "Forfait social : tous les taux",
      "today": "6 756 M€ prévus en 2027 (avant mesures du PLFSS)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % de tous les taux (1 % du produit)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.06756,
        "hi": 0.06756
      },
      "base": {
        "value": 6.756,
        "label": "6 756 M€ : produit du forfait social prévu en 2027, avant les mesures du PLFSS (rapport à la CCSS d’octobre 2026).",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, chapitre « Les recettes », tableau 2 (p. 61)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Forfait social : 6 300 M€ (2024), 6 552 (2025), 6 629 (2026 p), 6 756 (2027 p)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLFSS",
      "amount": {
        "value": 6.756,
        "label": "6 756 M€ de forfait social prévus en 2027, avant les mesures du PLFSS (CCSS)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Statique : ne compte pas la réaction des sommes versées (intéressement, participation, épargne salariale), ni les autres avantages fiscaux de l’épargne salariale.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, chapitre « Les recettes », tableau 2",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Produit du forfait social : 6 756 M€ en 2027 (p)"
        }
      ]
    },
    {
      "id": "france-services-espaces",
      "family": "depenses",
      "label": "Espaces France services",
      "today": "2 865 espaces au 1er septembre 2026 ; 3 000e prévu en 2027",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "100 espaces",
        "short": "espaces"
      },
      "perUnit": {
        "lo": 0.005,
        "hi": 0.011
      },
      "base": {
        "value": 0.0844,
        "label": "84,4 M€ (en AE et en CP) de crédits du programme 112 pour France services en 2027. N’y figure pas la part FNFS versée par les partenaires, rattachée plus tard par fonds de concours.",
        "source": {
          "title": "PAP 2027, mission Cohésion des territoires, programme 112, dépenses d’intervention (p. 167)",
          "publisher": "Ministère chargé de l’aménagement du territoire (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "France services : 84,4 M€ en AE et CP en 2027"
        }
      },
      "max": 5,
      "step": 1,
      "notches": [
        -5,
        -2,
        0,
        2,
        5
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "overlapsWith": [
        "effectifs-publics"
      ],
      "operatorCaveat": false,
      "limits": "Bas : forfait de 50 000 € seul, porteur privé (une part du fonds vient de La Poste, hors APU). Haut : coût moyen d’une structure (IGA 2021), compté en entier si le porteur est public. Année pleine ; hors investissement.",
      "sources": [
        {
          "title": "PAP 2027, mission Cohésion des territoires, programme 112 : France services, financement par structure (p. 168)",
          "publisher": "Ministère chargé de l’aménagement du territoire (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "25 000 € du FNADT et 25 000 € du FNFS (alimenté par les douze partenaires) par structure en 2027, soit 50 000 € de forfait"
        },
        {
          "title": "PAP 2027, programme 112 : France services, nombre de structures (p. 167)",
          "publisher": "Ministère chargé de l’aménagement du territoire (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "2 865 structures au 1er septembre 2026 ; la 3 000e ouvre en 2027"
        },
        {
          "title": "Programme France services (2020-2023), évaluation de politique publique (p. 79)",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2024-08/20240904-Programme-France-Services.pdf",
          "date": "2024-09",
          "accessedAt": "2026-10-18",
          "figure": "Coût annuel moyen d’une structure, tous porteurs : 100 000 € (Cour) ; 110 000 € (IGA, 2021)"
        }
      ]
    },
    {
      "id": "ifi-bareme",
      "family": "impots",
      "label": "Impôt sur la fortune immobilière",
      "today": "3,08 Md€ de recettes prévues au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % du produit de l’IFI (tous les taux relevés ou baissés de 1 %)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.0308,
        "hi": 0.0308
      },
      "base": {
        "value": 3.081,
        "label": "3,08 Md€ d’impôt sur la fortune immobilière prévus au PLF 2027 (état A, ligne 1406).",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A, ligne 1406 (p. 230)",
          "publisher": "Gouvernement (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur la fortune immobilière : 3 080 879 729 € prévus en 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 3.08,
        "label": "3,08 Md€ d’impôt sur la fortune immobilière prévus au PLF 2027"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Proportionnel à la recette prévue, sans départs ni changement des patrimoines. La décote, les réductions pour dons et le plafonnement à 75 % des revenus écartent l’effet réel de ce calcul, dans un sens non chiffré.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A, ligne 1406 (p. 230)",
          "publisher": "Gouvernement (Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "impôt sur la fortune immobilière : 3 080 879 729 € prévus en 2027"
        },
        {
          "title": "Corriger les principales distorsions de l’imposition du patrimoine (décembre 2025)",
          "publisher": "Conseil des prélèvements obligatoires",
          "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251201-Corriger-les-principales-distorsions-de-l-imposition-du-patrimoine.pdf",
          "date": "2025-12",
          "accessedAt": "2026-10-18",
          "figure": "2,3 Md€ en 2023 pour 175 980 déclarants (contexte, hors fourchette)"
        }
      ]
    },
    {
      "id": "impot-societes",
      "family": "impots",
      "label": "Impôt sur les sociétés",
      "today": "Taux normal de 25 % ; 58,5 Md€ de recette nette au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % de tous les taux (25 % → 25,25 %)",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.58516,
        "hi": 0.8389
      },
      "base": {
        "value": 58.516,
        "label": "58,5 Md€ d’impôt net sur les sociétés au PLF 2027 (état A, ligne 1301), hors contribution exceptionnelle des grandes entreprises",
        "source": {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A, ligne 1301 « Impôt sur les sociétés » (p. 230) et récapitulation des recettes du budget général (p. 236)",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Impôt net sur les sociétés : 58 515 984 932 € prévus en 2027 (hors contribution exceptionnelle, ligne 1441), soit 585,2 M€ par 1 % (bas de la fourchette)"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 58.516,
        "label": "58,5 Md€ d’impôt sur les sociétés prévus au PLF 2027 (produit net)"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Bas : 1 % du produit net ; haut : 1 % du brut, avant remboursements et crédits d’impôt (fixes, ces crédits portent l’effet au-dessus du bas). Statique, bénéfices inchangés ; surtaxes assises sur l’IS dû non comptées. Une part glisse en 2028.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), état A, ligne 1301 « Impôt sur les sociétés » (p. 230) et récapitulation des recettes du budget général (p. 236)",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Impôt net sur les sociétés : 58 515 984 932 € prévus en 2027 (hors contribution exceptionnelle, ligne 1441), soit 585,2 M€ par 1 % (bas de la fourchette)"
        },
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), exposé général des motifs, « Évaluation des recettes du budget général » (en millions d’euros), p. 25",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur les sociétés brut, avant remboursements et dégrèvements : 83 890 M€ prévus en 2027 (après 86 827 M€ en LFI 2026 et 85 029 M€ révisés), soit 838,9 M€ par 1 % (haut de la fourchette)"
        },
        {
          "title": "Projet de loi de finances pour 2027 (n° 3210), exposé général des motifs, tableau des recettes fiscales nettes, p. 20",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "Impôt net sur les sociétés : 58,5 Md€ au PLF 2027, contre 60,3 Md€ en 2026 (prévision révisée) et 59,9 Md€ exécutés en 2025"
        },
        {
          "title": "Impôt sur les sociétés (IS) : taux, déclaration, paiement",
          "publisher": "Direction de l’information légale et administrative (Entreprendre Service Public, Premier ministre)",
          "url": "https://entreprendre.service-public.gouv.fr/vosdroits/F23575",
          "date": "2026-02-17",
          "accessedAt": "2026-10-18",
          "figure": "Taux normal de 25 % (contexte, hors fourchette : les crans de ±25 % le portent à 18,75 % ou 31,25 %)"
        }
      ]
    },
    {
      "id": "indemnites-journalieres",
      "family": "sociale",
      "label": "Indemnités journalières maladie",
      "today": "50 % du salaire, plafond 1,4 Smic ; 1 Md€ d’économies à négocier",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 point de taux d’indemnisation",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.2,
        "hi": 0.25
      },
      "base": {
        "value": 12.747,
        "label": "12 747 M€ d’indemnités journalières maladie de la CNAM prévus en 2027, avant les mesures du PLFSS. Hors indemnités maternité et paternité, hors accidents du travail.",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026, tableau 2 « Charges et produits nets de la CNAM-Maladie » (p. 171)",
          "publisher": "Direction de la sécurité sociale (rapport à la CCSS)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Indemnités journalières (prestations légales maladie, soins de ville) : 11 775 M€ (2024), 11 998 (2025), 12 087 (2026 p), 12 747 (2027 p)"
        }
      },
      "max": 5,
      "step": 0.1,
      "notches": [
        -5,
        -2,
        0,
        2,
        5
      ],
      "baseLabel": "50 %",
      "exclusiveWith": [
        "ondam"
      ],
      "operatorCaveat": false,
      "limits": "Statique : ni le complément des employeurs, ni l’effet sur les arrêts. Le PLFSS compte déjà 1 Md€ d’économies à négocier sur ces indemnités ; une baisse du taux pourrait en faire partie.",
      "sources": [
        {
          "title": "Sécurité sociale : la boîte à outils du Sénat, rapport d’information n° 901 (2024-2025)",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "0,2 Md€ par point de pourcentage en moins (d’après la Cour des comptes, Ralfss 2024)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "indemnités journalières maladie de la CNAM : 12 747 M€ prévus en 2027, avant les mesures du PLFSS ; un point sur 50 % en vaut 2 %, soit environ 0,25 Md€ (calcul), 0,235 après le 1 Md€ d’économies"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "plafond abaissé à 1,4 Smic en avril 2025 ; objectif de 1 Md€ d’économies sur ces indemnités en 2027, confié à une négociation (point de départ)"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "1 Md€ d’économies sur les indemnités journalières maladie, comptées dans l’Ondam 2027 (point de départ)"
        }
      ]
    },
    {
      "id": "ir-credits-reductions",
      "family": "impots",
      "label": "Rabot des crédits et réductions d’IR",
      "today": "Crédits et réductions d’impôt sur le revenu en vigueur, sans rabot",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 % de leur montant en moins",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.11,
        "hi": 0.11
      },
      "base": {
        "value": 14.623,
        "label": "14,6 Md€ de réductions et crédits d’impôt sur le revenu en 2026 : c’est leur coût en dépenses fiscales, donné par le tome II des Voies et moyens du PLF 2026. Le tome II du PLF 2027 n’est pas publié sur le site de l’Assemblée, qui le cite sans lien. Le périmètre est plus large que celui de la simulation de l’IPP (1,1 Md€ pour un rabot de 10 %).",
        "source": {
          "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, tableau « Dépenses fiscales par impôt » (p. 16)",
          "publisher": "Direction de la législation fiscale (annexe au PLF 2026)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
          "date": "2025-10",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur le revenu, dont réduction et crédit d’impôt : 14 140 M€ (2024), 15 076 (2025), 14 623 (2026)"
        }
      },
      "max": 10,
      "step": 1,
      "notches": [
        -10,
        -5,
        0,
        5,
        10
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Rabot uniforme de tous les crédits et réductions d’impôt des ménages, législation 2025, une seule source (1,1 Md€ pour 10 %). Statique : dons, emploi à domicile… supposés inchangés.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "1,1 Md€ pour une baisse de 10 % du montant des crédits et réductions d’impôt, soit 0,11 Md€ par point de pourcentage (calcul)"
        }
      ]
    },
    {
      "id": "ir-indexation-bareme",
      "family": "impots",
      "label": "Impôt sur le revenu, sous-indexation",
      "today": "Seuils du barème revalorisés de 2,1 % (article 2 du PLF 2027)",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point de revalorisation en moins",
        "short": "pt"
      },
      "perUnit": {
        "lo": 1.38,
        "hi": 2
      },
      "base": {
        "value": 102.5,
        "label": "102,5 Md€ d’impôt sur le revenu net au PLF 2027 (recettes nettes de l’État, après remboursements et dégrèvements). La revalorisation des seuils joue sur l’impôt calculé au barème ; la ligne compte aussi l’impôt forfaitaire sur les revenus du capital (prélèvement forfaitaire unique), qu’elle ne touche pas, sauf option pour le barème.",
        "source": {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), tableau « Solde général du budget de l’État », p. 55 du PDF",
          "publisher": "Ministères économiques et financiers et ministères sociaux (Direction du budget, Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur le revenu net : 102,5 Md€ au PLF 2027 (colonnes : exécution 2025, LFI 2026, révisé 2026, PLF 2027)"
        }
      },
      "max": 2.1,
      "step": 0.1,
      "notches": [
        -2.1,
        -1,
        0,
        1,
        2.1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "Sans rattrapage, une moindre revalorisation pèse aussi sur les années suivantes ; cet effet après 2027 n’est pas compté.",
      "limits": "+2,1 points = gel des seuils. Le haut est le chiffrage du PLF 2027 (avis d’imposition et prélèvement à la source), le bas un gel de 2026 (IPP). Statique. Interaction avec les taux non comptée.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles du projet de loi, article 2",
          "publisher": "Gouvernement, direction de la législation fiscale (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "environ 4,2 Md€ d’impôt sur le revenu en 2027 pour 2,1 points, soit 2,0 Md€ par point (calcul)"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027, § 75",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "l’indexation sur l’inflation de 2026 pèserait 4,2 Md€ sur l’impôt sur le revenu en 2027"
        },
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "gel du barème en 2026 contre 1,3 % d’inflation : 1,8 Md€, soit environ 1,38 Md€ par point (calcul)"
        },
        {
          "title": "Rapport général n° 144 (2024-2025), tome II, fascicule 1 : projet de loi de finances pour 2025, commentaire de l’article 2",
          "publisher": "Sénat, commission des finances",
          "url": "https://www.senat.fr/rap/l24-144-21/l24-144-212.html",
          "date": "2024-11-21",
          "accessedAt": "2026-10-18",
          "figure": "3,7 Md€ en 2025 pour une indexation de 2,0 %, soit environ 1,85 Md€ par point (calcul)"
        }
      ]
    },
    {
      "id": "ir-taux-45",
      "family": "impots",
      "label": "Impôt sur le revenu, taux de 45 %",
      "today": "45 % sur la dernière tranche du barème",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.15,
        "hi": 0.15
      },
      "base": {
        "value": 102.5,
        "label": "102,5 Md€ d’impôt sur le revenu net au PLF 2027 (recettes nettes de l’État). Le levier ne porte que sur les plus hautes tranches du barème.",
        "source": {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), tableau « Solde général du budget de l’État », p. 55 du PDF",
          "publisher": "Ministères économiques et financiers et ministères sociaux (Direction du budget, Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur le revenu net : 102,5 Md€ au PLF 2027"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "45 %",
      "exclusiveWith": [
        "ir-taux-bareme",
        "ir-tranches-hautes"
      ],
      "operatorCaveat": false,
      "limits": "Barème 2025, une seule source, statique : les réactions des hauts revenus (optimisation, départs) ne sont pas comptées, ni la hausse des revenus jusqu’en 2027.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "150 M€ pour un point sur le taux de 45 %"
        }
      ]
    },
    {
      "id": "ir-taux-bareme",
      "family": "impots",
      "label": "Impôt sur le revenu, tous les taux",
      "today": "11 %, 30 %, 41 % et 45 %, seuils revalorisés de 2,1 %",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 6.4,
        "hi": 6.4
      },
      "base": {
        "value": 102.5,
        "label": "102,5 Md€ d’impôt sur le revenu net au PLF 2027 (recettes nettes de l’État). Le levier porte sur les quatre taux du barème ; la ligne compte aussi l’impôt forfaitaire sur les revenus du capital (prélèvement forfaitaire unique), que ces taux ne touchent pas, sauf option pour le barème. Même base que la sous-indexation.",
        "source": {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), tableau « Solde général du budget de l’État », p. 55 du PDF",
          "publisher": "Ministères économiques et financiers et ministères sociaux (Direction du budget, Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur le revenu net : 102,5 Md€ au PLF 2027"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "ir-taux-45",
        "ir-tranches-hautes"
      ],
      "operatorCaveat": false,
      "limits": "Barème 2025, une seule source, statique : ni réaction des contribuables ni hausse des revenus jusqu’en 2027. Un point sur chaque taux, seuils inchangés. Interaction avec la revalorisation non comptée.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "6,4 Md€ pour un point sur les taux de 11, 30, 41 et 45 %"
        }
      ]
    },
    {
      "id": "ir-tranches-hautes",
      "family": "impots",
      "label": "Impôt sur le revenu, 41 % et 45 %",
      "today": "41 % et 45 % sur les deux dernières tranches",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.45,
        "hi": 0.45
      },
      "base": {
        "value": 102.5,
        "label": "102,5 Md€ d’impôt sur le revenu net au PLF 2027 (recettes nettes de l’État). Le levier ne porte que sur les plus hautes tranches du barème.",
        "source": {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), tableau « Solde général du budget de l’État », p. 55 du PDF",
          "publisher": "Ministères économiques et financiers et ministères sociaux (Direction du budget, Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Impôt sur le revenu net : 102,5 Md€ au PLF 2027"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "41/45 %",
      "exclusiveWith": [
        "ir-taux-45",
        "ir-taux-bareme"
      ],
      "operatorCaveat": false,
      "limits": "Barème 2025, une seule source, statique : les réactions des hauts revenus (optimisation, départs) ne sont pas comptées, ni la hausse des revenus jusqu’en 2027.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "450 M€ pour un point sur les taux de 41 % et 45 %"
        }
      ]
    },
    {
      "id": "minima-sociaux-revalorisation",
      "family": "sociale",
      "label": "Revalorisation des minima sociaux",
      "today": "RSA, AAH et minimum vieillesse revalorisés sur l’inflation",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 point de revalorisation du RSA, de l’AAH et du minimum vieillesse",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.29,
        "hi": 0.35
      },
      "base": {
        "value": 29,
        "label": "29,0 Md€ d’allocations versées en 2023 pour le RSA (12,2), l’AAH (12,7) et le minimum vieillesse (4,1). Somme de trois lignes d’un tableau de la DREES (calcul) ; les 31,6 Md€ de l’ensemble des minima comptent aussi l’ASS et d’autres aides que le levier ne touche pas.",
        "source": {
          "title": "Minima sociaux et prestations de solidarité, édition 2025, fiche 07 « Les dépenses d’allocations », tableau 1",
          "publisher": "DREES",
          "url": "https://www.drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2007%20-%20Les%20d%C3%A9penses%20d%27allocations.pdf",
          "date": "2025-12",
          "accessedAt": "2026-10-18",
          "figure": "Dépenses 2023 : RSA 12 218 M€, AAH 12 717 M€, minimum vieillesse 4 109 M€, soit 29 044 M€ (somme, calcul)"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "credits-prime-activite-rsa"
      ],
      "operatorCaveat": false,
      "limits": "Statique, en année pleine. Le bas part des dépenses de 2023, plus basses qu’en 2027. Ni le non-recours, ni les effets sur la prime d’activité et les aides au logement. Le RSA est surtout payé par les départements.",
      "sources": [
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 « Effets budgétaires et redistributifs des mesures socio-fiscales »",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "gel de 1,3 point en 2026 : 450 M€ de minima sociaux dans une « année blanche », soit 0,35 Md€ par point (400 M€, soit 0,31, pour un gel isolé)"
        },
        {
          "title": "Les minima sociaux (fiche de l’encyclopédie, 10 décembre 2025)",
          "publisher": "Fipeco (données DREES)",
          "url": "https://www.fipeco.fr/fiche/Les-minima-sociaux",
          "date": "2025-12-10",
          "accessedAt": "2026-10-18",
          "figure": "RSA 12,2 Md€, AAH 12,7 Md€, ASPA 4,1 Md€ en 2023 (DREES), soit 0,29 Md€ par point"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "AAH, RSA et minimum vieillesse revalorisés sur l’inflation en 2027 (point de départ)"
        }
      ]
    },
    {
      "id": "ondam",
      "family": "sociale",
      "label": "Dépenses d’assurance maladie (Ondam)",
      "today": "+2,0 % en 2027 au PLFSS, soit 5,5 Md€ de plus qu’en 2026",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 point de progression de l’Ondam en 2027",
        "short": "pt"
      },
      "perUnit": {
        "lo": 2.65,
        "hi": 2.75
      },
      "base": {
        "value": 278.7,
        "label": "278,7 Md€ d’Ondam 2027 au PLFSS 2027 (contre 273,3 Md€ en 2026 révisé)",
        "source": {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), tableau « Objectif national de dépenses d’assurance maladie », p. 61 du PDF",
          "publisher": "Ministères économiques et financiers et ministères sociaux (Direction du budget, Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Ondam 2027 : 278,7 Md€ (révisé 2026 : 273,3 Md€)"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "+2,0 %",
      "exclusiveWith": [
        "indemnites-journalieres"
      ],
      "overlapsWith": [
        "effectifs-publics",
        "point-indice"
      ],
      "operatorCaveat": true,
      "limits": "Un objectif de dépense, sans dire par quelles mesures : l’effet dépend de l’exécution. Pour la part versée aux hôpitaux publics, il suppose qu’ils réduisent d’autant leur dépense. Bas calculé sur 2025.",
      "sources": [
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "hausse de 1 % des dépenses dans le champ de l’Ondam : 2 650 M€ tous régimes (sur les dépenses de 2025)"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Ondam à +2,0 % en 2027, soit +5,5 Md€ (2,75 Md€ par point)"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "progression de l’Ondam fixée à +2,0 % en 2027, contre 3,6 % avant toute mesure"
        }
      ]
    },
    {
      "id": "pensions-revalorisation",
      "family": "sociale",
      "label": "Revalorisation des retraites de base",
      "today": "Inflation sous 1 260 € par mois ; au-dessus, gel sauf décret",
      "kind": "options",
      "direction": "depense",
      "unit": {
        "label": "réglage de la revalorisation au 1er janvier 2027",
        "short": "réglage"
      },
      "perUnit": {
        "lo": 0,
        "hi": 0
      },
      "base": {
        "value": 314.5,
        "label": "314,5 Md€ de pensions nettes versées par les régimes de retraite de base en 2027 (prévision de la CCSS d’octobre 2026, avant les mesures du PLFSS 2027)",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 2.5 « Les prestations de retraite », p. 108",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "pensions nettes des régimes de retraite de base : 314,5 Md€ en 2027, avec la revalorisation légale de +1,7 % au 1er janvier 2027 (avant le gel différencié du PLFSS)"
        }
      },
      "max": 1,
      "step": 1,
      "notches": [
        -1,
        0,
        1
      ],
      "baseLabel": "PLFSS",
      "options": [
        {
          "id": "gel-toutes",
          "label": "Gel de toutes les pensions",
          "lo": -0.7,
          "hi": -0.7,
          "note": "Les pensions sous 1 260 € restent aussi au niveau de 2026 : 4,7 Md€ d’économie au lieu de 4,0 (DSS)."
        },
        {
          "id": "plfss",
          "label": "Règle du PLFSS",
          "lo": 0,
          "hi": 0,
          "base": true,
          "note": "Inflation sous 1 260 € par mois ; au-dessus, montant de 2026 sans décret."
        },
        {
          "id": "moitie-1260-2000",
          "label": "Moitié de l’inflation de 1 260 à 2 000 €",
          "lo": 0.6,
          "hi": 0.7,
          "note": "L’exemple de décret chiffré par la DSS : 3,4 Md€ d’économie au lieu de 4,0 ; 0,7 Md€ de dépense."
        },
        {
          "id": "inflation-toutes",
          "label": "Inflation pour toutes les pensions",
          "lo": 4,
          "hi": 4.3,
          "note": "La règle habituelle. Bas : DSS, net de CSG et de CASA ; haut : HCFP, 3,0 Md€ Sécurité sociale et 1,3 Md€ État."
        }
      ],
      "exclusiveWith": [],
      "operatorCaveat": false,
      "laterNote": "Le réglage de 2027 se garde les années suivantes : la règle du PLFSS vaut encore 4,3 Md€ en 2030 (DSS). Hors total.",
      "limits": "Statique. Bas : net de CSG et de CASA (DSS) ; haut : dépense (DSS) ou Sécurité sociale plus État (HCFP). Sans l’effet sur l’impôt sur le revenu ni sur les aides. Une baisse en euros n’est pas chiffrée.",
      "sources": [
        {
          "title": "PLFSS 2027, annexe 9 : fiches d’évaluation préalable des articles du projet de loi (article 35)",
          "publisher": "Direction de la sécurité sociale (annexe au PLFSS 2027)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/annexe-9.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "règle de l’article 35 (point de départ) : 4,0 Md€ de moins qu’une indexation de toutes les pensions de base, net de CSG et de CASA"
        },
        {
          "title": "PLFSS 2027, annexe 9 : fiches d’évaluation préalable des articles du projet de loi (article 35)",
          "publisher": "Direction de la sécurité sociale (annexe au PLFSS 2027)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/annexe-9.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "gel de toutes les pensions : 4,7 Md€ d’économie, soit 0,7 Md€ de plus que le PLFSS ; indexer les pensions sous 1 260 € coûte 0,7 Md€"
        },
        {
          "title": "PLFSS 2027, annexe 9 : fiches d’évaluation préalable des articles du projet de loi (article 35)",
          "publisher": "Direction de la sécurité sociale (annexe au PLFSS 2027)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/annexe-9.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "moitié de l’inflation entre 1 260 et 2 000 € : 3,4 Md€ d’économie au lieu de 4,0 (0,6 net), 0,7 Md€ de dépense"
        },
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "gel différencié : 3,0 Md€ pour la Sécurité sociale et 1,3 Md€ pour l’État (régime des fonctionnaires), soit 4,3 Md€"
        }
      ]
    },
    {
      "id": "places-creche",
      "family": "sociale",
      "label": "Places de crèche",
      "today": "Offre préservée au PLFSS 2027 (495 600 places en 2023)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "10 000 places",
        "short": "places"
      },
      "perUnit": {
        "lo": 0.169,
        "hi": 0.199
      },
      "base": {
        "value": 8.354,
        "label": "8,354 Md€ de dépense publique pour l’accueil collectif (crèches) en 2023, tous financeurs, pour 495 600 places",
        "source": {
          "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe VII, tableau 9 (p. 44 de l’annexe)",
          "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
          "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
          "date": "2026-06",
          "accessedAt": "2026-10-18",
          "figure": "Accueil collectif : coût total de 8 354 M€ en 2023 (7 490 M€ en 2019), 495 600 places"
        }
      },
      "max": 3.5,
      "step": 0.5,
      "notches": [
        -3,
        -1,
        0,
        1,
        3
      ],
      "baseLabel": "PLFSS",
      "exclusiveWith": [
        "depense-complement-mode-de-garde"
      ],
      "overlapsWith": [
        "effectifs-publics"
      ],
      "operatorCaveat": false,
      "limits": "Coût moyen de fonctionnement, tous financeurs publics, en année pleine : ni investissement, ni hausse des coûts depuis 2023. Ouvrir des places suppose aussi de recruter du personnel.",
      "sources": [
        {
          "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe VII",
          "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
          "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
          "date": "2026-06",
          "accessedAt": "2026-10-18",
          "figure": "accueil collectif : 8 354 M€ de dépense publique pour 495 600 places, soit 16 856 € par place en 2023 (0,169 Md€ pour 10 000 places)"
        },
        {
          "title": "La politique d’accueil du jeune enfant",
          "publisher": "Cour des comptes",
          "url": "https://www.ccomptes.fr/sites/default/files/2024-12/20241212-La-politique-daccueil-du-jeune-enfant.pdf",
          "date": "2024-12-12",
          "accessedAt": "2026-10-18",
          "figure": "695 M€ par an pour 35 000 places de crèche, soit environ 0,199 Md€ pour 10 000 places"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "offre de crèches préservée en 2027 (point de départ)"
        }
      ]
    },
    {
      "id": "point-indice",
      "family": "depenses",
      "label": "Point d’indice, fonction publique",
      "today": "Point gelé au PLF 2027 (59,07 € brut par an depuis juillet 2023)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 2.17,
        "hi": 2.5
      },
      "base": {
        "value": 247.557,
        "label": "247,6 Md€ de salaires et traitements bruts versés par les administrations publiques en 2025 (Insee), hors cotisations des employeurs, comme le chiffrage haut du levier ; 370,0 Md€ cotisations comprises. C’est la dernière année publiée, et la même masse que pour les effectifs.",
        "source": {
          "title": "Administrations publiques en 2025 (comptes nationaux annuels, base 2020), tableau 7.301 « Compte des administrations publiques (S13) »",
          "publisher": "Insee",
          "url": "https://www.insee.fr/fr/statistiques/8988833",
          "date": "2026-08-28",
          "accessedAt": "2026-10-18",
          "figure": "Salaires et traitements bruts (D11) des APU : 245,586 Md€ en 2024, 247,557 Md€ en 2025. Rémunération des salariés (D1) : 370,012 Md€ en 2025, dont cotisations sociales à la charge des employeurs (D12) : 122,455 Md€"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "overlapsWith": [
        "credits-administration-penitentiaire",
        "credits-aides-indirectes-etudiants",
        "credits-asile",
        "credits-culture",
        "credits-integration",
        "credits-justice-judiciaire",
        "credits-pjj",
        "credits-politique-de-la-ville",
        "credits-remunerations-enseignement-scolaire",
        "credits-universites-recherche",
        "defense",
        "ondam"
      ],
      "operatorCaveat": false,
      "limits": "Année pleine. Bas : hausses de 2022 et 2023 (Sénat), sans dire si les cotisations des employeurs y sont ; haut : hors ces cotisations, masse de 2026 (Fipeco). Hors garantie individuelle du pouvoir d’achat.",
      "sources": [
        {
          "title": "Avis n° 145 (2025-2026), tome V : projet de loi de finances pour 2026, Fonction publique",
          "publisher": "Sénat, commission des lois",
          "url": "https://www.senat.fr/rap/a25-145-5/a25-145-5_mono.html",
          "date": "2025-11-24",
          "accessedAt": "2026-10-18",
          "figure": "+3,5 % : 7,6 Md€ ; +1,5 % : 3,4 Md€ en année pleine, soit 2,17 à 2,27 Md€ pour 1 % (calcul) ; la page ne dit pas si les cotisations des employeurs sont comptées"
        },
        {
          "title": "Avis n° 145 (2025-2026), tome V : projet de loi de finances pour 2026, Fonction publique (valeur du point)",
          "publisher": "Sénat, commission des lois",
          "url": "https://www.senat.fr/rap/a25-145-5/a25-145-5_mono.html",
          "date": "2025-11-24",
          "accessedAt": "2026-10-18",
          "figure": "Valeur annuelle brute du point : 59,07 € depuis la hausse de juillet 2023"
        },
        {
          "title": "Le niveau et l’évolution de la masse salariale publique (fiche de l’encyclopédie, 6 juillet 2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/Le-niveau-et-l%C3%A9volution-de-la-masse-salariale-publique",
          "date": "2026-07-06",
          "accessedAt": "2026-10-18",
          "figure": "+1 % du point : 2,5 Md€ hors cotisations des employeurs, total publié (État 1,0 ; opérateurs 0,2 ; administrations locales 0,7 ; administrations sociales 0,7)"
        },
        {
          "title": "Budget 2027 : dossier de presse (PLF et PLFSS pour 2027), présentation générale du PLF, p. 11",
          "publisher": "Ministères économiques et financiers (dossier de presse PLF et PLFSS 2027, Direction du budget)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Point d’indice gelé en 2027 au PLF déposé"
        }
      ]
    },
    {
      "id": "prestations-familiales-revalorisation",
      "family": "sociale",
      "label": "Prestations familiales : indexation",
      "today": "Gel au 1er avril 2027, au lieu de +2,3 % (PLFSS 2027)",
      "kind": "options",
      "direction": "depense",
      "unit": {
        "label": "réglage de la revalorisation au 1er avril 2027",
        "short": "réglage"
      },
      "perUnit": {
        "lo": 0,
        "hi": 0
      },
      "base": {
        "value": 33.9,
        "label": "33,9 Md€ de prestations légales nettes de la branche famille en 2027 (prévision de la CCSS d’octobre 2026, avant les mesures du PLFSS 2027)",
        "source": {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 2.1, tableau 3 « Répartition des prestations légales nettes par branche », p. 75",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "prestations légales famille nettes des régimes de base : 33 896 M€ en 2027 (en millions d’euros ; colonnes 2024, 2025, 2026 (p), 2027 (p)), avant les mesures du PLFSS, revalorisation légale comprise"
        }
      },
      "max": 1,
      "step": 1,
      "notches": [
        -1,
        0,
        1
      ],
      "baseLabel": "Gel",
      "options": [
        {
          "id": "baisse-legale",
          "label": "−2,3 % au 1er avril",
          "lo": -0.52,
          "hi": -0.5,
          "note": "Le miroir de la hausse légale : les prestations baisseraient en euros, aucune source ne chiffre ce cas."
        },
        {
          "id": "baisse-moitie",
          "label": "−1,15 % au 1er avril",
          "lo": -0.26,
          "hi": -0.25,
          "note": "Le miroir de « +1,15 % » : les prestations baisseraient en euros, aucune source ne chiffre ce cas."
        },
        {
          "id": "gel",
          "label": "Gel (PLFSS)",
          "lo": 0,
          "hi": 0,
          "base": true,
          "note": "Base révisée pour que les montants restent ceux de 2026."
        },
        {
          "id": "moitie",
          "label": "+1,15 % au 1er avril",
          "lo": 0.25,
          "hi": 0.26,
          "note": "La moitié de la hausse légale, calculée sur les mêmes chiffres."
        },
        {
          "id": "legale",
          "label": "+2,3 % au 1er avril (règle légale)",
          "lo": 0.5,
          "hi": 0.52,
          "note": "Bas : HCFP ; haut : 300 M€ par point en année pleine, sur 9 mois (DSS, calcul)."
        }
      ],
      "exclusiveWith": [
        "depense-allocation-soutien-familial",
        "depense-allocations-familiales",
        "depense-complement-mode-de-garde",
        "depense-prepare"
      ],
      "operatorCaveat": false,
      "limits": "Effet en 2027 : le changement joue d’avril à décembre. En dessous du gel, le chiffre est le miroir de la hausse : aucune source ne chiffre une baisse des prestations en euros.",
      "sources": [
        {
          "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027 (p. 27)",
          "publisher": "Haut Conseil des finances publiques",
          "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
          "date": "2026-09-25",
          "accessedAt": "2026-10-18",
          "figure": "gel des prestations familiales en 2027 : 0,5 Md€ (point de départ)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), synthèse (p. 8)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "un point d’inflation sur la revalorisation légale, en année pleine : 300 M€ pour la branche famille (CNAF) ; +2,3 % sur 9 mois : environ 0,52 Md€ (calcul)"
        },
        {
          "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale) (p. 117)",
          "publisher": "Direction de la sécurité sociale",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "hausse légale de 2,3 % au 1er avril 2027 sans le gel (+1,9 % en moyenne annuelle)"
        },
        {
          "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027 (p. 144)",
          "publisher": "Ministères économiques et sociaux (Direction du budget et Direction de la sécurité sociale)",
          "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "base des prestations familiales révisée au 1er avril 2027 pour que les montants restent ceux de 2026 (point de départ)"
        }
      ]
    },
    {
      "id": "prime-activite-revalorisation",
      "family": "sociale",
      "label": "Prime d’activité : revalorisation",
      "today": "Gel en 2027 (article 74 du PLF) ; +2,3 % prévus sans gel",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 0.14,
        "hi": 0.23
      },
      "base": {
        "value": 10.7,
        "label": "10,7 Md€ de crédits de prime d’activité au PLF 2027 (programme 304, action 11), montant non revalorisé",
        "source": {
          "title": "PAP 2027, mission Solidarité, insertion et égalité des chances, programme 304, action 11 : 1) La prime d’activité (p. 40)",
          "publisher": "Gouvernement (PAP annexé au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Prime d’activité : 10,7 Md€ de crédits en 2027"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "Gel",
      "exclusiveWith": [
        "credits-prime-activite-rsa"
      ],
      "operatorCaveat": false,
      "laterNote": "Le PLF 2027 chiffre le même gel à 995 M€ en 2028, contre 332 M€ en 2027 (revalorisation au 1er avril) : environ 0,43 Md€ par point en 2028, hors total.",
      "limits": "Bas : PLF, effet en 2027 du gel de 2,3 % au 1er avril. Haut : IPP, année pleine, gel de 2026, législation de 2025 (avant la hausse du bonus). En dessous du gel, le chiffre est le miroir de la hausse : aucune source ne chiffre une baisse en euros. Sans réaction des ménages.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, incidences budgétaires (p. 602-603)",
          "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Gel de la prime d’activité : −332 M€ pour l’ensemble des APU en 2027 et −995 M€ en 2028 ; pour 2,3 points, 0,14 Md€ par point en 2027 (0,43 en 2028)"
        },
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, taux retenu (p. 602)",
          "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Revalorisation légale que le gel évite : 2,3 % au 1er avril 2027"
        },
        {
          "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, revalorisations récentes (p. 598)",
          "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Bonus individuel relevé en loi de finances pour 2026, après l’étude de l’IPP (contexte de la borne haute)"
        },
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales (p. 46-47)",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "Gel isolé des prestations en 2026 (inflation de 1,3 %), législation de 2025, statique : 300 M€ de prime d’activité, soit 0,23 Md€ par point"
        },
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : « année blanche » 2026 (p. 50)",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "Gel combiné des pensions, des prestations et du barème de l’IR en 2026 (1,3 %) : 250 M€ de prime d’activité, soit 0,19 Md€ par point (dans la fourchette)"
        }
      ]
    },
    {
      "id": "quotient-familial-plafond",
      "family": "impots",
      "label": "Plafond du quotient familial",
      "today": "1 845 € par demi-part, cas général, au PLF 2027 (1 807 € l’an passé)",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 % de tous les plafonds par demi-part",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.058,
        "hi": 0.058
      },
      "base": {
        "value": 15.6,
        "label": "15,6 Md€ : coût du quotient familial et des parts fiscales spécifiques en 2024 (IGF-IGAS, d’après la Cour des comptes). Le plafond ne joue que sur une partie de ce montant.",
        "source": {
          "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe III, p. 10",
          "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
          "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
          "date": "2026-06",
          "accessedAt": "2026-10-18",
          "figure": "Coût du quotient familial et des parts fiscales spécifiques : 15,6 Md€ en 2024"
        }
      },
      "max": 10,
      "step": 1,
      "notches": [
        -10,
        -5,
        0,
        5,
        10
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Microsimulation IGF (modèle Ines 2024, revenus 2022), comportements inchangés. Seule la baisse est chiffrée ; la hausse, son miroir, est un majorant. Le plafond suit aussi l’indexation du barème : les deux s’ajoutent.",
      "sources": [
        {
          "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe IV, p. 24-25 et tableau 15",
          "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
          "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
          "date": "2026-06",
          "accessedAt": "2026-10-18",
          "figure": "baisse de 10 % des plafonds de chaque demi-part : 580 M€ de recettes, 1 892 447 ménages concernés"
        },
        {
          "title": "PLF 2027, évaluations préalables des articles, article 2 (p. 10)",
          "publisher": "Gouvernement (annexe au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "plafond général porté de 1 807 € à 1 845 € par demi-part ; les autres plafonds (4 262, 1 079, 1 801 et 2 011 €) suivent la même indexation"
        }
      ]
    },
    {
      "id": "service-national-appeles",
      "family": "depenses",
      "label": "Service national : nombre d’appelés",
      "today": "4 000 appelés (ETPT) en 2027, service lancé en septembre 2026",
      "kind": "linear",
      "direction": "depense",
      "unit": {
        "label": "1 000 appelés",
        "short": "appelés"
      },
      "perUnit": {
        "lo": 0.01401,
        "hi": 0.04101
      },
      "max": 4,
      "step": 1,
      "notches": [
        -4,
        -2,
        0,
        2,
        4
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "defense"
      ],
      "overlapsWith": [
        "effectifs-publics"
      ],
      "operatorCaveat": false,
      "laterNote": "Cible de 10 000 appelés en 2030 (LPM actualisée) : le coût monte après 2027, hors du total.",
      "limits": "Bas : solde seule (14 010 €) ; haut : avec les 108 M€ d’infrastructures de 2027 répartis sur 4 000 appelés, qui préparent aussi 2030. Équipement, alimentation, encadrement non isolés ; année pleine supposée.",
      "sources": [
        {
          "title": "PAP 2027, mission Défense, programme 212 : coûts moyens d’entrée, globaux et de sortie (p. 245)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Coût par appelé : 15 953 € chargé hors CAS, dont 14 010 € de rémunérations d’activité"
        },
        {
          "title": "PAP 2027, programme 212 : politique immobilière, infrastructures du service national (p. 209)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Infrastructures d’accueil des appelés : 267 M€ d’engagements et 108 M€ de CP en 2027 (108 M€ / 4 000 = 27 000 € par appelé)"
        },
        {
          "title": "PAP 2027, programme 212 : schéma d’emplois et appelés du service national (p. 208)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "4 000 appelés en 2027, dont 3 500 au ministère des armées"
        },
        {
          "title": "PAP 2027, programme 212 : emplois rémunérés par le programme, plafond demandé pour 2027 (p. 236)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "4 000 ETPT d’appelés du service national au plafond demandé pour 2027"
        },
        {
          "title": "PAP 2027, mission Défense, programme 178 « Préparation et emploi des forces » : présentation stratégique, service national (p. 92)",
          "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf",
          "date": "2026-10",
          "accessedAt": "2026-10-18",
          "figure": "Objectif de 10 000 appelés en 2030 ; 4 000 appelés recrutés à la rentrée 2027"
        }
      ]
    },
    {
      "id": "tsn-taux",
      "family": "impots",
      "label": "Taxe sur les services numériques",
      "today": "980,8 M€ de recette au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 %",
        "short": "%"
      },
      "perUnit": {
        "lo": 0.009808,
        "hi": 0.009808
      },
      "base": {
        "value": 0.9808,
        "label": "980,8 M€ de taxe sur les services numériques prévus en 2027 (état A du PLF 2027, ligne 1430)",
        "source": {
          "title": "Projet de loi de finances pour 2027, état A, ligne 1430 « Taxe sur les services numériques » (p. 231)",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "980 834 006 € de recette prévue en 2027"
        }
      },
      "max": 25,
      "step": 1,
      "notches": [
        -25,
        -10,
        0,
        10,
        25
      ],
      "baseLabel": "PLF",
      "amount": {
        "value": 0.9808,
        "label": "980,8 M€ de taxe sur les services numériques prévus au PLF 2027"
      },
      "exclusiveWith": [],
      "operatorCaveat": false,
      "limits": "Effet statique : 1 % du produit prévu, le taux étant unique. Ne compte pas les réactions des entreprises redevables ni les effets sur d’autres impôts.",
      "sources": [
        {
          "title": "Projet de loi de finances pour 2027, état A, ligne 1430 « Taxe sur les services numériques »",
          "publisher": "Gouvernement, projet de loi de finances pour 2027 (Assemblée nationale, n° 3210)",
          "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
          "date": "2026-10-01",
          "accessedAt": "2026-10-18",
          "figure": "980 834 006 € de recette prévue en 2027"
        }
      ]
    },
    {
      "id": "tva-taux-intermediaire",
      "family": "impots",
      "label": "TVA, taux intermédiaire (10 %)",
      "today": "10 % au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 1.6,
        "hi": 1.9
      },
      "base": {
        "value": 215.4,
        "label": "TVA nette totale de toutes les administrations : 215,4 Md€ prévus en 2026 (Voies et moyens du PLF 2026 ; ce tome n’est pas encore publié pour le PLF 2027). Ce taux n’en porte qu’une part.",
        "source": {
          "title": "Évaluation des voies et moyens, tome I, PLF 2026 : TVA, passage à la TVA nette budgétaire (p. 33)",
          "publisher": "Gouvernement (annexe au PLF 2026, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf",
          "date": "2025-10",
          "accessedAt": "2026-10-18",
          "figure": "TVA nette totale (toutes administrations, comptabilité budgétaire) : 210,7 Md€ exécutés en 2024, 210,0 Md€ prévus en 2025, 215,4 Md€ prévus en 2026"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "10 %",
      "exclusiveWith": [
        "tva-tous-taux"
      ],
      "operatorCaveat": false,
      "laterNote": "La hausse des prix relève ensuite les pensions, les prestations et les seuils de l’impôt sur le revenu, surtout à partir de 2028 : le gain net devient plus faible.",
      "limits": "Bas : net de la TVA que paient les administrations sur leurs achats ; haut : brut. Chiffrage statique sur 2025, consommation inchangée, hors indexation des pensions, prestations et barème de l’IR.",
      "sources": [
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 1 (brut)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 10 % : 1,9 Md€ brut par point (2025)"
        },
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 2 (net de la TVA payée par les administrations publiques)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 10 % : 1,6 Md€ net par point (2025)"
        },
        {
          "title": "La taxe sur la valeur ajoutée (fiche de l’encyclopédie, 15 juin 2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/La-taxe-sur-la-valeur-ajout%C3%A9e",
          "date": "2026-06-15",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 10 % : 1,9 Md€ par point (reprend l’étude de la DG Trésor)"
        }
      ]
    },
    {
      "id": "tva-taux-normal",
      "family": "impots",
      "label": "TVA, taux normal (20 %)",
      "today": "20 % au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 7.5,
        "hi": 8.9
      },
      "base": {
        "value": 215.4,
        "label": "TVA nette totale de toutes les administrations : 215,4 Md€ prévus en 2026 (Voies et moyens du PLF 2026 ; ce tome n’est pas encore publié pour le PLF 2027). Ce taux n’en porte qu’une part.",
        "source": {
          "title": "Évaluation des voies et moyens, tome I, PLF 2026 : TVA, passage à la TVA nette budgétaire (p. 33)",
          "publisher": "Gouvernement (annexe au PLF 2026, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf",
          "date": "2025-10",
          "accessedAt": "2026-10-18",
          "figure": "TVA nette totale (toutes administrations, comptabilité budgétaire) : 210,7 Md€ exécutés en 2024, 210,0 Md€ prévus en 2025, 215,4 Md€ prévus en 2026"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "20 %",
      "exclusiveWith": [
        "tva-tous-taux"
      ],
      "operatorCaveat": false,
      "laterNote": "La hausse des prix relève ensuite les pensions, les prestations et les seuils de l’impôt sur le revenu, surtout à partir de 2028 : le gain net devient plus faible.",
      "limits": "Bas : net de la TVA que paient les administrations sur leurs achats ; haut : brut. Chiffrage statique sur 2025, consommation inchangée, hors indexation des pensions, prestations et barème de l’IR.",
      "sources": [
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 1 (brut)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 20 % : 8,9 Md€ brut par point (2025)"
        },
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 2 (net de la TVA payée par les administrations publiques)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 20 % : 7,5 Md€ net par point (2025)"
        },
        {
          "title": "La taxe sur la valeur ajoutée (fiche de l’encyclopédie, 15 juin 2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/La-taxe-sur-la-valeur-ajout%C3%A9e",
          "date": "2026-06-15",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 20 % : environ 8,9 Md€ par point (reprend l’étude de la DG Trésor)"
        }
      ]
    },
    {
      "id": "tva-taux-reduit",
      "family": "impots",
      "label": "TVA, taux réduit (5,5 %)",
      "today": "5,5 % au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point",
        "short": "pt"
      },
      "perUnit": {
        "lo": 2,
        "hi": 2.4
      },
      "base": {
        "value": 215.4,
        "label": "TVA nette totale de toutes les administrations : 215,4 Md€ prévus en 2026 (Voies et moyens du PLF 2026 ; ce tome n’est pas encore publié pour le PLF 2027). Ce taux n’en porte qu’une part.",
        "source": {
          "title": "Évaluation des voies et moyens, tome I, PLF 2026 : TVA, passage à la TVA nette budgétaire (p. 33)",
          "publisher": "Gouvernement (annexe au PLF 2026, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf",
          "date": "2025-10",
          "accessedAt": "2026-10-18",
          "figure": "TVA nette totale (toutes administrations, comptabilité budgétaire) : 210,7 Md€ exécutés en 2024, 210,0 Md€ prévus en 2025, 215,4 Md€ prévus en 2026"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "5,5 %",
      "exclusiveWith": [
        "tva-tous-taux"
      ],
      "operatorCaveat": false,
      "laterNote": "La hausse des prix relève ensuite les pensions, les prestations et les seuils de l’impôt sur le revenu, surtout à partir de 2028 : le gain net devient plus faible.",
      "limits": "Bas : net de la TVA que paient les administrations sur leurs achats ; haut : brut. Chiffrage statique sur 2025, consommation inchangée, hors indexation des pensions, prestations et barème de l’IR.",
      "sources": [
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 1 (brut)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 5,5 % : 2,4 Md€ brut par point (2025)"
        },
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 2 (net de la TVA payée par les administrations publiques)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 5,5 % : 2,0 Md€ net par point (2025)"
        },
        {
          "title": "La taxe sur la valeur ajoutée (fiche de l’encyclopédie, 15 juin 2026)",
          "publisher": "Fipeco",
          "url": "https://www.fipeco.fr/fiche/La-taxe-sur-la-valeur-ajout%C3%A9e",
          "date": "2026-06-15",
          "accessedAt": "2026-10-18",
          "figure": "Taux de 5,5 % : 2,4 Md€ par point (reprend l’étude de la DG Trésor)"
        }
      ]
    },
    {
      "id": "tva-tous-taux",
      "family": "impots",
      "label": "TVA, tous les taux",
      "today": "20 %, 10 %, 5,5 % et 2,1 % au PLF 2027",
      "kind": "linear",
      "direction": "recette",
      "unit": {
        "label": "1 point sur chaque taux",
        "short": "pt"
      },
      "perUnit": {
        "lo": 11.4,
        "hi": 13.7
      },
      "base": {
        "value": 215.4,
        "label": "215,4 Md€ de TVA nette totale prévus en 2026 pour toutes les administrations (Voies et moyens du PLF 2026). Ce tome n’est pas encore publié pour le PLF 2027, qui ne donne que la part de l’État (107,0 Md€).",
        "source": {
          "title": "Évaluation des voies et moyens, tome I, PLF 2026 : TVA, passage à la TVA nette budgétaire (p. 33)",
          "publisher": "Gouvernement (annexe au PLF 2026, Assemblée nationale)",
          "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf",
          "date": "2025-10",
          "accessedAt": "2026-10-18",
          "figure": "TVA nette totale (toutes administrations, comptabilité budgétaire) : 210,7 Md€ exécutés en 2024, 210,0 Md€ prévus en 2025, 215,4 Md€ prévus en 2026"
        }
      },
      "max": 1,
      "step": 0.1,
      "notches": [
        -1,
        -0.5,
        0,
        0.5,
        1
      ],
      "baseLabel": "PLF",
      "exclusiveWith": [
        "tva-taux-intermediaire",
        "tva-taux-normal",
        "tva-taux-reduit"
      ],
      "operatorCaveat": false,
      "laterNote": "Une fois les retraites et les prestations indexées sur la hausse des prix, le gain tombe à 8,2 Md€, puis à 7,6 Md€ avec les seuils de l’impôt sur le revenu (IPP) ; ces effets jouent surtout à partir de 2028.",
      "limits": "Bas : net de la TVA que paient les administrations ; haut : brut (DG Trésor, 2025). Chiffrage statique, consommation inchangée, hors indexation des pensions, des prestations et du barème de l’IR.",
      "sources": [
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 1 (brut)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Tous les taux : 13,7 Md€ brut par point (2025), haut de la fourchette"
        },
        {
          "title": "Trésor-Éco n° 371 : Analyse de la composition des recettes de TVA, tableau 2 (net de la TVA payée par les administrations publiques)",
          "publisher": "Direction générale du Trésor",
          "url": "https://www.tresor.economie.gouv.fr/Articles/c462ac7f-76db-4c33-9bb3-dcc6886ed898/files/f4d0d1ac-fc61-4cf3-ab3f-094385b218bd",
          "date": "2025-09",
          "accessedAt": "2026-10-18",
          "figure": "Tous les taux : 11,4 Md€ net par point (2025), bas de la fourchette"
        },
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "Après indexation des retraites et des prestations : 8,2 Md€ sur le solde (note « à terme », hors du total)"
        },
        {
          "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales (seuils de l’IR)",
          "publisher": "Institut des politiques publiques (IPP)",
          "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
          "date": "2025-06",
          "accessedAt": "2026-10-18",
          "figure": "Avec en plus la revalorisation des seuils de l’IR : 7,6 Md€ sur le solde (note « à terme », hors du total)"
        },
        {
          "title": "Rapport d’information n° 901 (2024-2025) : Sécurité sociale, la boîte à outils du Sénat",
          "publisher": "Sénat, commission des affaires sociales (MECSS)",
          "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
          "date": "2025-09-23",
          "accessedAt": "2026-10-18",
          "figure": "Un point sur tous les taux : 13 Md€ pour l’ensemble des administrations publiques (brut), dans la fourchette"
        }
      ]
    }
  ]
}
