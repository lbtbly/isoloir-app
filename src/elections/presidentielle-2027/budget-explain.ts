// Fichier généré par tools/build-budget.mjs depuis research/presidentielle-2027/budget-explain.json : ne pas modifier à la main.
// « Faire les comptes » : « Comprendre » chaque levier (163 textes), chargé à l'ouverture d'une fiche.
import type { LeverExplainer } from '../../core/budget/types'

export const explain: Record<string, LeverExplainer> = {
  "accise-carburants": {
    "what": "Une taxe fixe par litre, quel que soit le prix : 60,75 centimes pour le gazole, 67,50 pour le SP95-E10 en 2026 (minimum européen : 33 et 35,9). La TVA s’applique au prix, accise comprise. L’État en garde 16,3 Md€ en 2027, régions et départements une part.",
    "who": "Les automobilistes et les entreprises : 82 % des ménages ont un véhicule thermique (2019). En 2025, gazole et essence ont rapporté 27,2 Md€ d’accise en tout. Transport routier, cars et taxis paient des tarifs réduits.",
    "up": "+10 % sur tous les tarifs : +1,7 Md€ pour l’État si les parts locales suivent (2,7 Md€ en tout, 2025). Si la hausse passe dans les prix : +7 à 8 c/L TTC, +80 à 90 € par an par ménage motorisé (2019).",
    "down": "−10 % sur tous les tarifs : −1,7 Md€ pour l’État si les parts locales suivent (2,7 Md€ en tout, 2025). Si la baisse passe dans les prix : −7 à 8 c/L TTC, −80 à 90 € par an par ménage motorisé (2019).",
    "argsUp": [
      "Un prix plus haut réduit la consommation : −2 à −4 % pour 10 % de plus à la pompe (Insee) ; la part « carbone » est gelée depuis 2018 (CPO).",
      "L’essence est taxée 29 % de plus que le gazole à énergie égale : le CPO propose d’aligner le gazole, après le second marché carbone de l’UE."
    ],
    "argsDown": [
      "Plus lourd pour les modestes : +10 % à la pompe coûte 0,67 % du revenu des 10 % les plus modestes, 0,17 % des plus aisés (CGDD, 2019).",
      "Les taxes font 45 à 50 % du prix à la pompe (CPO) ; les baisser aide surtout hors des villes, où la facture est presque double (CGDD, 2019)."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), état D, compte « Avances aux collectivités territoriales », programme 835",
        "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf#page=242",
        "date": "2026-10-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, annexe 3 (situation au 1er août 2026)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=37",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, tarifs réduits",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=24",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, chapitre II (rendement)",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=79",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, partage du produit",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=54",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, élasticité au prix",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, composante carbone",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=61",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, écart gazole-essence",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=131",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, recommandation n° 4",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=25",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, part des taxes dans le prix",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=55",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le modèle Prometheus de microsimulation de la facture énergétique des ménages, document de travail n° 70, variante « hausse de 10 % du prix des carburants »",
        "publisher": "Commissariat général au développement durable (CGDD), ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/publications/document_travail_70_prometheus_microsimulation_facture_energetique_menage_mars2025.pdf#page=82",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le modèle Prometheus de microsimulation de la facture énergétique des ménages, document de travail n° 70, variante carburants, effet selon le revenu et le lieu",
        "publisher": "Commissariat général au développement durable (CGDD), ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/publications/document_travail_70_prometheus_microsimulation_facture_energetique_menage_mars2025.pdf#page=83",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "accise-electricite": {
    "what": "Une taxe par mégawattheure (1 000 kWh) d’électricité ; la TVA s’applique au prix, accise comprise. Ménages : 30,62 € par MWh depuis août 2026, −0,4 € prévu en février 2027 avant indexation (minimum européen : 1 €). L’État en garde 5,1 Md€ en 2027.",
    "who": "Tous les consommateurs ; communes et départements reçoivent une part. Ménage moyen : 4,5 MWh et environ 140 € d’accise par an hors TVA. Au-delà de 36 kVA, 26,35 € par MWh ; l’industrie très consommatrice paie moins.",
    "up": "+10 % : 0,52 Md€ de plus pour l’État si les parts locales suivent. Ménage moyen : environ 3 € de plus par MWh, 16 à 17 € de plus par an TVA comprise, 1,5 % d’une facture de 1 072 € (CRE).",
    "down": "−10 % : 0,52 Md€ de moins pour l’État si les parts locales suivent. Ménage moyen : environ 3 € de moins par MWh, 16 à 17 € de moins par an TVA comprise, 1,5 % d’une facture de 1 072 € (CRE).",
    "argsUp": [
      "Une baisse de taxe face aux hausses de prix ne cible pas les plus exposés et est difficile à retirer (CPO ; bouclier 2022-2024 : 19,4 Md€).",
      "En euros, une baisse d’un tiers de l’accise (10 € par MWh) rendrait 47 € par an aux 10 % les plus modestes, 70 € aux plus aisés (CGDD)."
    ],
    "argsDown": [
      "Pour aider à électrifier, le CPO propose, vers 2030, de baisser la taxe sur l’électricité des ménages et de monter celle du gaz et du fioul.",
      "En part du revenu, une hausse d’un tiers de l’accise (10 € par MWh) coûte 0,39 % aux 10 % les plus modestes, 0,07 % aux plus aisés (CGDD)."
    ],
    "sources": [
      {
        "title": "Communiqué : évolution des tarifs réglementés de vente de l’électricité au 1er août 2026",
        "publisher": "Commission de régulation de l’énergie (CRE), autorité administrative indépendante",
        "url": "https://www.cre.fr/fileadmin/Documents/Communiques_de_presse/2026/260716_CP_TRVE_Aout_2026.pdf",
        "date": "2026-07-16",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, indexation du tarif",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=12",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, tarifs de l’électricité",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=13",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, parts des collectivités",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=11",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, bouclier tarifaire",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=68",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, constat n° 4",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=21",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, recommandation n° 5",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=25",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ?, calendrier de la recommandation n° 5",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=134",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le modèle Prometheus de microsimulation de la facture énergétique des ménages, document de travail n° 70, variante « hausse de l’accise sur l’électricité de 10 €/MWh »",
        "publisher": "Commissariat général au développement durable (CGDD), ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/publications/document_travail_70_prometheus_microsimulation_facture_energetique_menage_mars2025.pdf#page=90",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le modèle Prometheus de microsimulation de la facture énergétique des ménages, document de travail n° 70, variante électricité, effet selon le revenu",
        "publisher": "Commissariat général au développement durable (CGDD), ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/publications/document_travail_70_prometheus_microsimulation_facture_energetique_menage_mars2025.pdf#page=91",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "age-legal-retraite": {
    "what": "L’âge légal est le premier âge où l’on peut prendre sa retraite, hors départs anticipés (carrières longues, invalidité). La réforme de 2023 le porte de 62 à 64 ans ; la hausse est suspendue jusqu’au 1er janvier 2028 : 62 ans et 9 mois pour la génération 1964.",
    "who": "Surtout les personnes nées en 1964 (878 000 naissances), qui atteignent l’âge en 2027, et début 1965. Les chiffres ne comptent que le régime général et celui des salariés agricoles, 59 % des pensions de base.",
    "up": "Reprise vers 64 ans dès 2027 : né en 1964, on peut partir au plus tôt à 63 ans au lieu de 62 ans et 9 mois, avec 171 trimestres au lieu de 170. Environ 0,8 Md€ de pensions versées en moins en 2027.",
    "down": "Retour à 62 ans : né en 1964, on peut partir au plus tôt à 62 ans au lieu de 62 ans et 9 mois, avec 169 trimestres au lieu de 170. Environ 1,3 Md€ de pensions versées en plus en 2027.",
    "argsUp": [
      "La Cour des comptes (2025) prévoit 25 à 30 Md€ de déficit du régime général en 2045 ; jouer sur l’âge a « un effet puissant à court terme ».",
      "Après le recul de 2010, 49 personnes de 60 ans sur 100 travaillaient, contre 33 avant (Insee, cité par la Cour) : plus de cotisations."
    ],
    "argsDown": [
      "À la naissance, les 5 % les plus modestes vivent 9 à 13 ans de moins que les plus aisés (femmes, hommes ; Insee) : un recul les touche plus.",
      "Reculer l’âge accroît aussi chômage, arrêts maladie et minima sociaux : environ 20 % des économies (Drees et Dares, cités par la Cour)."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), encadré 3 de la fiche 2.5",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=115",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), synthèse",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=22",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 2.5 (génération 1964)",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=111",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 2.5 (champ)",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=110",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Situation financière et perspectives du système de retraites, communication au Premier ministre, synthèse",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf#page=9",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Situation financière et perspectives du système de retraites, communication au Premier ministre, synthèse (leviers)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf#page=11",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Situation financière et perspectives du système de retraites, communication au Premier ministre, chapitre II (effets de la réforme de 2010)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf#page=67",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Situation financière et perspectives du système de retraites, communication au Premier ministre, chapitre II (autres effets du recul de l’âge)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf#page=66",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "De 2012-2016 à 2020-2024, l’écart d’espérance de vie entre les personnes modestes et aisées s’est accru, Insee Première n° 2085",
        "publisher": "Institut national de la statistique et des études économiques (Insee)",
        "url": "https://www.insee.fr/fr/statistiques/fichier/8679561/ip2085.pdf",
        "date": "2025-12-15",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "aides-logement-revalorisation": {
    "what": "Les aides au logement (APL, ALF, ALS) aident les ménages modestes à payer leur loyer, selon leurs revenus, leur famille et leur loyer, pris en compte jusqu’à un plafond. Ces plafonds suivent chaque 1er octobre l’indice des loyers (IRL) ; le PLF 2027 les gèle.",
    "who": "5,6 millions de ménages en 2025, surtout locataires. Aide moyenne en location : 218 à 343 € par mois selon l’aide. L’État paie : 16,5 Md€ en 2027.",
    "up": "Révision au 1er octobre : 0,11 Md€ de plus en 2027 (404 M€ en 2028, année pleine), environ 6 € de plus par mois en moyenne par ménage aidé, dès octobre. En 2026 (+1,15 %) : 4 à 6 € selon les cas.",
    "down": "Baisse d’autant au 1er octobre (le miroir de la révision, qu’aucune source ne chiffre) : 0,11 Md€ de moins en 2027, environ 6 € de moins par mois en moyenne par ménage aidé, dès octobre.",
    "argsUp": [
      "Des aides ciblées : 86,8 % des locataires aidés (hors étudiants) gagnent moins que le Smic net (documents du PLF 2027).",
      "Sans révision, l’aide perd de sa valeur quand les loyers montent ; l’IPP (2025) juge « largement régressif » un gel des prestations."
    ],
    "argsDown": [
      "L’aide expliquerait jusqu’à 58 % de la hausse des loyers des modestes en 1988-2002 (étude citée au PLF) : une part finit dans les loyers.",
      "Les aides coûtent 16,7 Md€ en 2025 ; sans révision des plafonds, 101 M€ d’économie en 2027 et 404 M€ en 2028 (évaluation du PLF)."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, incidences budgétaires",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=602",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, situation actuelle",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=596",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, cas-types de la révision 2026",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=600",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, effet sur les loyers",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=599",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 : évaluations préalables des articles, article 74, coût des aides",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=597",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet annuel de performances 2027, mission Cohésion des territoires, programme 109 « Aide à l’accès au logement », ciblage",
        "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf#page=64",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet annuel de performances 2027, mission Cohésion des territoires, programme 109 « Aide à l’accès au logement », chiffres-clés",
        "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf#page=65",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet annuel de performances 2027, mission Cohésion des territoires, programme 109 « Aide à l’accès au logement », financement",
        "publisher": "Ministère chargé du logement (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf#page=66",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "allegements-generaux": {
    "what": "Des réductions des cotisations des employeurs sur les salaires, maximales au Smic et de plus en plus faibles quand le salaire monte (une réduction unique depuis 2026). Elles baissent le coût du travail ; l’État compense en principe la Sécurité sociale.",
    "who": "Les employeurs du privé, surtout sur les bas salaires : au Smic, ils payaient 6,9 % de cotisations en 2024, contre 45 % en 1993. Coût : 69,1 Md€ en 2027. Le commerce pèse le plus (13,2 Md€ en 2022, toutes exonérations).",
    "up": "+10 % : 6,9 à 7,1 Md€ de recettes publiques en moins en 2027. Employeurs : environ 1 % de masse salariale en moins (2 % dans la restauration, 1,6 % sous 10 salariés, 0,8 % à 250 et plus ; taux 2022).",
    "down": "−10 % : 6,9 à 7,1 Md€ de recettes publiques en plus en 2027. Employeurs : environ 1 % de masse salariale en plus (2 % dans la restauration, 1,6 % sous 10 salariés, 0,8 % à 250 et plus ; taux 2022).",
    "argsUp": [
      "Effet positif sur l’emploi au Smic, plus net dans les années 1990 (Cour) ; tout supprimer ôterait un million d’emplois (modèle du Trésor).",
      "En soutenant l’emploi et l’activité, ils contribuent à des recettes fiscales et sociales et à moins de dépenses sociales (Cour des comptes)."
    ],
    "argsDown": [
      "Avec la baisse d’autres aides, leur sortie dégressive porte jusqu’à 80 % la part prélevée sur une hausse du coût du travail (Bozio-Wasmer).",
      "Coût : 77,3 Md€ en 2024, sans condition (Cour) ; pertinents, mais moins efficaces pour l’emploi que dans les années 1990 (Bozio-Wasmer)."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 1.6 (réduction unique depuis 2026)",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=68",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), fiche 1.6, tableau 1",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=69",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport sur l’application des lois de financement de la sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales », présentation",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=3",
        "date": "2025-05-26",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport sur l’application des lois de financement de la sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales », effets sur l’emploi",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=17",
        "date": "2025-05-26",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport sur l’application des lois de financement de la sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales », conditions",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=8",
        "date": "2025-05-26",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les politiques d’exonérations de cotisations sociales : une inflexion nécessaire, rapport final de la mission confiée par le Premier ministre, chapitre 1",
        "publisher": "Antoine Bozio (EHESS, IPP) et Étienne Wasmer (NYU Abu Dhabi, Sciences Po), avec l’IGF, la DG Trésor, la DSS, la Dares et l’Insee",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295596.pdf#page=47",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les politiques d’exonérations de cotisations sociales : une inflexion nécessaire, rapport final de la mission confiée par le Premier ministre, taux d’exonération par taille d’entreprise",
        "publisher": "Antoine Bozio (EHESS, IPP) et Étienne Wasmer (NYU Abu Dhabi, Sciences Po), avec l’IGF, la DG Trésor, la DSS, la Dares et l’Insee",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295596.pdf#page=72",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les politiques d’exonérations de cotisations sociales : une inflexion nécessaire, rapport final de la mission confiée par le Premier ministre, secteurs",
        "publisher": "Antoine Bozio (EHESS, IPP) et Étienne Wasmer (NYU Abu Dhabi, Sciences Po), avec l’IGF, la DG Trésor, la DSS, la Dares et l’Insee",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295596.pdf#page=73",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les politiques d’exonérations de cotisations sociales : une inflexion nécessaire, rapport final de la mission confiée par le Premier ministre, synthèse (diagnostic)",
        "publisher": "Antoine Bozio (EHESS, IPP) et Étienne Wasmer (NYU Abu Dhabi, Sciences Po), avec l’IGF, la DG Trésor, la DSS, la Dares et l’Insee",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295596.pdf#page=9",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les politiques d’exonérations de cotisations sociales : une inflexion nécessaire, rapport final de la mission confiée par le Premier ministre, synthèse (trappes à bas salaires)",
        "publisher": "Antoine Bozio (EHESS, IPP) et Étienne Wasmer (NYU Abu Dhabi, Sciences Po), avec l’IGF, la DG Trésor, la DSS, la Dares et l’Insee",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295596.pdf#page=10",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "c3s-taux": {
    "what": "Un impôt payé par les sociétés sur leur chiffre d’affaires (leurs ventes hors taxes), et non sur leur bénéfice : 0,16 % de la part qui dépasse 19 M€. Créé en 1970, il finance la retraite de base (CNAV), dont le déficit est prévu à 8,9 Md€ en 2027 (CCSS).",
    "who": "Les sociétés de plus de 19 M€ de ventes : 5,5 Md€ attendus en 2027 (CCSS), aux trois quarts versés par le commerce, l’industrie et la finance (CPO). Pour 100 M€ de ventes, environ 130 000 € par an (calculé).",
    "up": "À +25 % (taux de 0,20 %) : 1,1 à 1,4 Md€ de recettes publiques en plus ; la CNAV reçoit 1,4 Md€, l’impôt sur les sociétés baisse un peu. 100 M€ de ventes : 32 400 € de plus par an (calculé).",
    "down": "À −25 % (taux de 0,12 %) : 1,1 à 1,4 Md€ de recettes publiques en moins ; la CNAV perd 1,4 Md€, l’impôt sur les sociétés monte un peu. 100 M€ de ventes : 32 400 € de moins par an (calculé).",
    "argsUp": [
      "Taux bas, large assiette : 5,2 à 5,5 Md€ par an, stables de 2024 à 2027 ; les sociétés sous 19 M€ de ventes n’y sont pas soumises (CCSS).",
      "Selon le CPO, la supprimer coûterait encore 4,4 Md€ nets, une fois compté le surcroît d’impôt sur les sociétés qu’elle entraînerait."
    ],
    "argsDown": [
      "Le CPO y voit l’impôt de production le plus pénalisant à l’export : il renchérit un bien industriel d’environ deux fois son taux effectif.",
      "D’après le CAE, cité par le CPO, les entreprises sorties de la C3S en 2015-2016 ont vu leurs exportations croître d’environ 1 % de plus."
    ],
    "sources": [
      {
        "title": "Code de la sécurité sociale, article L137-32 (version en vigueur à partir du 1er janvier 2027, issue de l’ordonnance n° 2025-1247 du 17 décembre 2025, art. 34 et 35)",
        "publisher": "Légifrance",
        "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053151640/2027-01-01",
        "date": "2025-12-17",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "contribution-exceptionnelle-grandes-entreprises": {
    "what": "Un supplément temporaire d’impôt sur les sociétés (IS) des très grandes entreprises : 15,7 % de leur IS en plus (31,4 % dès 3 Md€ de ventes). Leur taux d’IS passe d’environ 25,8 % à 29,8 % (33,7 %), calculé comme le CPO. Les autres restent à 25 %.",
    "who": "Les entreprises d’au moins 1,5 Md€ de chiffre d’affaires. En 2025, au seuil de 1 Md€, environ 450 en étaient redevables, pour 18 M€ en moyenne chacune (Sénat). 5 Md€ sont attendus en 2027 (PLF).",
    "up": "À +2,5 points : 0,79 à 0,85 Md€ de plus ; pour 100 M€ d’IS dû, 2,5 M€ de plus (5 M€ dès 3 Md€ de ventes). À +4,9 points (20,6 % et 41,2 %, taux de 2026) : 1,5 à 1,7 Md€ de plus.",
    "down": "À −2,5 points : 0,79 à 0,85 Md€ de moins ; pour 100 M€ d’IS dû, 2,5 M€ de moins (5 M€ dès 3 Md€ de ventes). À −4,9 points (10,8 % et 21,6 %) : 1,5 à 1,7 Md€ de moins.",
    "argsUp": [
      "Le gouvernement vise les « plus fortes capacités contributives » ; temporaire, la mesure aurait un effet « limité » sur la compétitivité.",
      "Une recette forte pour peu de redevables : 8 Md€ attendus en 2025 d’environ 450 entreprises (Sénat), sans toucher aux autres sociétés."
    ],
    "argsDown": [
      "Selon le CPO, elle a porté leur taux d’IS à 31 % et 36 % en 2025, effaçant en tout ou partie la baisse à 25 % menée de 2016 à 2022.",
      "Prévue pour un an puis reconduite, elle crée « une incertitude dommageable » pour l’investissement, note le CPO, qui vise le niveau de 2024."
    ],
    "sources": []
  },
  "cotisations-exploitants-agricoles": {
    "what": "Les cotisations que les chefs d’exploitation agricole versent à la MSA, leur caisse de Sécurité sociale, pour leur retraite de base, sur leur revenu professionnel, en général moyenné sur trois ans. Les pensions versées en 2027 n’en dépendent pas.",
    "who": "Environ 396 000 exploitants cotisants en 2027, pour 1,05 million de retraités (CCSS) : 1,2 Md€, soit près de 3 000 € par cotisant et par an en moyenne (calculé).",
    "up": "À +10 % : 118 M€ de plus, soit environ 300 € de plus par exploitant et par an en moyenne (calculé). L’excédent prévu du régime en 2027 passerait de 72 à 190 M€ (CCSS, calculé).",
    "down": "À −10 % : 118 M€ de moins, soit environ 300 € de moins par exploitant et par an en moyenne (calculé). Le régime passerait d’un excédent prévu de 72 M€ à un déficit d’environ 46 M€ (CCSS, calculé).",
    "argsUp": [
      "+10 % représente environ 300 € par an et par exploitant, soit environ 1,4 % du revenu moyen prévu pour 2025 (21 500 €, CCSS, calculé).",
      "Son excédent tient aux 2,6 Md€ versés par les autres régimes : 0,4 million de cotisants pour 1,1 million de retraités en 2025 (CCSS)."
    ],
    "argsDown": [
      "Les revenus agricoles reculent : 21 500 € de revenu moyen prévus pour 2025, contre 30 100 € en 2022 (CCSS).",
      "La branche est en excédent depuis 2018 et le nombre de ses retraités baisse (−2,3 % en 2027, CCSS)."
    ],
    "sources": []
  },
  "cotisations-retraite": {
    "what": "Les cotisations sur les revenus du travail pour la retraite de base du régime général (CNAV) : 15,45 % du salaire jusqu’au plafond de la Sécurité sociale (4 005 € par mois en 2026), partagés entre salarié et employeur, plus 2,51 % sur tout le salaire.",
    "who": "Salariés du privé (6,90 % sous plafond, 0,40 % sur tout le salaire), employeurs (8,55 % et 2,11 %), indépendants : 114,9 Md€ prévus en 2027 pour la CNAV, qui prévoit 8,9 Md€ de déficit (CCSS).",
    "up": "1 point de plus : 4,8 à 7,6 Md€ de plus pour les comptes publics, selon la part (Cour des comptes, valeurs 2025). Part salariale : 18,67 € nets de moins par mois au Smic, 40 € au plafond (calculé).",
    "down": "1 point de moins : 4,8 à 6,2 Md€ de moins pour les comptes publics, selon la part (Cour des comptes, valeurs 2025). Part salariale : 18,67 € nets de plus par mois au Smic, 40 € au plafond (calculé).",
    "argsUp": [
      "Selon la Cour des comptes, le déficit des retraites passerait de 6,6 Md€ en 2025 à près de 15 Md€ en 2035 et 30 Md€ en 2045, hors inflation.",
      "La Cour range les prélèvements parmi les trois leviers de l’équilibre ; les relever laisse inchangés l’âge de départ et les pensions."
    ],
    "argsDown": [
      "Modèle Mésange cité par la Cour : 7 Md€ de cotisations en plus ôteraient l’an suivant 57 000 emplois (part employeur) ou 32 000 (salariés).",
      "Selon la Cour, une hausse « pourrait avoir des effets négatifs sur l’économie » : coûts de production plus hauts ou salaire net plus bas."
    ],
    "sources": [
      {
        "title": "Sécurité sociale : quel sera le plafond annuel en 2026 ? (actualité du 24 octobre 2025, mise à jour le 23 décembre 2025)",
        "publisher": "Service-Public.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/actualites/A15386",
        "date": "2025-12-23",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Smic (salaire minimum interprofessionnel de croissance), fiche vérifiée le 1er juin 2026",
        "publisher": "Service-Public.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "cotisations-sociales": {
    "what": "Les cotisations qui financent l’assurance maladie et l’autonomie (13,3 % du salaire au taux plein) et la famille (5,25 %). Sur les salaires, seuls les employeurs les paient ; une réduction générale (RGDU) les efface au Smic, puis s’annule à 3 Smic.",
    "who": "Surtout les employeurs privés : 1 point vaut 7,5 à 11,0 Md€, d’eux seuls à tous les cotisants (secteur public, indépendants…), valeurs 2026 (CCSS). La branche maladie reçoit 110,9 Md€ de cotisations en 2027.",
    "up": "1 point de plus : en théorie 7,5 à 11,0 Md€ de plus pour la Sécurité sociale, l’État en payant une part via la réduction générale. À 6 000 € brut par mois, l’employeur paie 60 € de plus (calculé).",
    "down": "1 point de moins : en théorie 7,5 à 9,2 Md€ de moins pour la Sécurité sociale, l’État compensant alors moins d’allègements. À 6 000 € brut par mois, l’employeur paie 60 € de moins (calculé).",
    "argsUp": [
      "Déficit de la branche maladie : 13,8 Md€ prévus en 2027 avant les mesures du PLFSS (CCSS) ; 1 point en couvrirait plus de la moitié.",
      "Le CPO juge « incertaine » l’incidence des allègements de cotisations sur les salaires qui s’éloignent du Smic."
    ],
    "argsDown": [
      "Selon le modèle Mésange cité par la Cour, 7 Md€ de cotisations patronales en plus coûteraient 57 000 emplois l’année suivante.",
      "CPO : les coûts hors salaire (cotisations comprises) font 31,4 % du coût du travail industriel en 2023, le plus haut de l’UE après la Suède."
    ],
    "sources": [
      {
        "title": "Situation financière et perspectives du système de retraites (février 2025), p. 76 (effets macroéconomiques)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), orientation n° 2, partie 3.1, p. 125",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf",
        "date": "2025-09-22",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Smic (salaire minimum interprofessionnel de croissance), fiche vérifiée le 1er juin 2026",
        "publisher": "Service-Public.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-administration-penitentiaire": {
    "what": "Le budget des prisons et du suivi des condamnés hors de prison (programme 107) : salaires des surveillants et des conseillers de probation, construction et entretien des établissements, bracelets électroniques, réinsertion. Cotisations employeurs non comptées.",
    "who": "Il paie jusqu’à 47 023 emplois en équivalent temps plein et prend en charge 90 173 personnes détenues. Financé par l’impôt : environ 62 € par habitant et par an (4 275,6 M€ comptés, 69,1 millions d’habitants).",
    "up": "+10 % : 428 M€ de plus en 2027, environ 6 € par habitant ou 4 700 € par personne détenue, à répartir entre la paie (2 111,7 M€), l’immobilier (705,9 M€) et le reste du fonctionnement.",
    "down": "−10 % : 428 M€ de moins en 2027, environ 6 € par habitant ou 4 700 € par personne détenue, à trouver sur la paie (2 111,7 M€), l’immobilier (705,9 M€) ou le reste du fonctionnement.",
    "argsUp": [
      "90 173 détenus pour 63 303 places, dont 8 538 sur un matelas au sol (PAP 2027) ; le Sénat jugeait déjà ce taux excessif en 2025.",
      "Selon l’administration pénitentiaire, citée par le Sénat, il manque 3 000 emplois ; 5 711 places nettes livrées sur 15 000 (PAP 2027)."
    ],
    "argsDown": [
      "Selon le Sénat (budget 2026), des prisons livrées ces dernières années ont trop de malfaçons ou de coûts inutiles ; il demande un audit.",
      "Le PLF 2027 relève déjà ces crédits de 6,3 % hors pensions (+268,9 M€) : avec −10 %, ils seraient environ 4 % sous leur niveau de 2026."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2026 : Justice (rapport général n° 139, tome III, annexe 17)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-317/l25-139-317_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aide-publique-developpement": {
    "what": "L’aide aux pays en développement : dons pour des projets de l’Agence française de développement, baisse du coût de ses prêts, fonds mondiaux, aide humanitaire. Hors prises de capital, Ukraine, Fonds européen de développement et versements aux collectivités.",
    "who": "Reçoivent : des pays en développement (60 % des crédits prévus pour les plus vulnérables), des ONG, des fonds (Fonds mondial contre le sida : 280,7 M€ ; Fonds vert pour le climat : 181,6 M€). Environ 38 € par habitant.",
    "up": "+10 % : 0,27 Md€ de plus en 2027, près de 4 € par habitant, de quoi augmenter les dons pour des projets, les contributions aux fonds ou l’aide humanitaire.",
    "down": "−10 % : 0,27 Md€ de moins en 2027, près de 4 € par habitant, à trouver sur les dons pour des projets, les contributions aux fonds ou l’aide humanitaire.",
    "argsUp": [
      "Selon le Sénat, l’aide est passée de 0,48 % du revenu national en 2024 à 0,43 % prévu en 2025 ; le PLF 2027 réduit la mission de 11 %.",
      "Les ministères (PAP 2027) y voient de la prévention : éviter une épidémie ou l’effondrement de services vitaux protège aussi les Français."
    ],
    "argsDown": [
      "Selon le Sénat, les fonds pour l’environnement sont trop nombreux et profitent surtout à des pays à revenu intermédiaire comme la Chine.",
      "Le Sénat juge l’évaluation insuffisante ; sa commission des finances a proposé de revenir au niveau de 2019, corrigé de l’inflation."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2026 : Aide publique au développement (rapport général n° 139, tome III, annexe 4)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-34/l25-139-34_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "L’essentiel sur le projet de loi de finances pour 2026 : mission « Aide publique au développement »",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-34/l25-139-34-syn.pdf",
        "date": "2025-11",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aide-ukraine": {
    "what": "Un fonds qui finance, en dons, la remise en état d’infrastructures civiles en Ukraine (énergie, eau, santé, déminage…), à la demande du gouvernement ukrainien ; les travaux sont confiés à des entreprises françaises.",
    "who": "Reçoivent : l’Ukraine, sous forme de projets réalisés par des entreprises françaises (au moins 50 % de part française, 7 M€ au plus par projet). Coût en 2027 : environ 0,40 € par habitant.",
    "up": "+50 % : 14 M€ de plus en 2027, environ 0,20 € par habitant, l’équivalent de deux projets au plafond de 7 M€, ou des projets de la tranche de 71 M€ lancés plus vite.",
    "down": "−50 % : 14 M€ de moins en 2027, environ 0,20 € par habitant, l’équivalent de deux projets au plafond de 7 M€, ou des projets de la tranche de 71 M€ repoussés.",
    "argsUp": [
      "Le fonds sert aussi à consolider la présence d’entreprises françaises en Ukraine (PAP 2027) ; sa 2e tranche a reçu 100 candidatures.",
      "Il aide à remettre en état des infrastructures critiques et à faire fonctionner le pays, sur demande de l’Ukraine (PAP 2027, DG Trésor)."
    ],
    "argsDown": [
      "La France aide aussi l’Ukraine via l’Union : 98 M€ en 2027 pour les intérêts de prêts européens (PAP 2027), plus de trois fois ce fonds.",
      "Sur les 19 projets du premier fonds, créé en 2024, 7 sont finalisés et un a dû être abandonné (PAP 2027) : les projets avancent lentement."
    ],
    "sources": [
      {
        "title": "Fonds Ukraine II : financement de projets de reconstruction des infrastructures critiques ukrainiennes",
        "publisher": "Direction générale du Trésor",
        "url": "https://www.tresor.economie.gouv.fr/Articles/2026/01/27/fonds-ukraine-ii-financement-de-projets-de-reconstruction-des-infrastructures-critiques-ukrainiennes",
        "date": "2026-02-19",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aides-a-la-pierre": {
    "what": "Des crédits de l’État pour le logement social : surtout un fonds d’aide à la rénovation énergétique des HLM (isolation, chauffage), la rénovation des cités minières du Nord et du Pas-de-Calais, et le fichier national des demandes de logement social.",
    "who": "Reçoivent : les organismes HLM et sociétés d’économie mixte qui rénovent, et leurs locataires (factures d’énergie) ; 5,3 M€ vont au fichier national des demandes. Coût : environ 1,60 € par habitant.",
    "up": "+10 % : 11 M€ de plus en 2027, surtout des versements plus rapides sur des chantiers engagés ; à terme, environ 1 300 rénovations de plus si l’État engage de nouvelles opérations (calcul Isoloir).",
    "down": "−10 % : 11 M€ de moins en 2027, surtout des versements retardés sur des chantiers engagés ; à terme, environ 1 300 rénovations de moins si la baisse porte sur de nouveaux engagements (calcul Isoloir).",
    "argsUp": [
      "Selon l’IGF et l’IGEDD, à hypothèses constantes, les bailleurs ne peuvent tenir à la fois les objectifs de construction et de rénovation.",
      "Selon le Sénat, l’enveloppe de 1,2 Md€ sur 3 ans annoncée en 2023 n’est pas atteinte ; louer un logement classé G est interdit depuis 2025."
    ],
    "argsDown": [
      "Selon l’IGF et l’IGEDD, les bailleurs sociaux ont une situation financière solide, qui leur permet d’accentuer leur effort d’investissement.",
      "Le parc social est plus sobre que le privé (23 % classés E à G, contre 38 %) ; l’IGF et l’IGEDD proposent des loyers relevés après travaux."
    ],
    "sources": [
      {
        "title": "Revue des dépenses publiques en faveur du logement social (synthèse, p. 1)",
        "publisher": "Inspection générale des finances et Inspection générale de l’environnement et du développement durable",
        "url": "https://igedd.documentation.developpement-durable.gouv.fr/documents/Affaires-0014341/016298-01_rapport_publi%C3%A9.pdf",
        "date": "2025-11",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "L’essentiel sur le rapport pour avis sur le projet de loi de finances pour 2026 : crédits « Logement et hébergement » de la mission « Cohésion des territoires »",
        "publisher": "Sénat, commission des affaires économiques",
        "url": "https://www.senat.fr/rap/a25-140-6/a25-140-6-syn.pdf",
        "date": "2025-11-26",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aides-directes-etudiants": {
    "what": "Les bourses sur critères sociaux, versées aux étudiants selon les revenus et les charges de leurs parents (de 1 454 € à 6 335 € par an selon l’échelon), et des aides annexes : mérite, mobilité, aides d’urgence des Crous.",
    "who": "Reçoivent : 662 000 boursiers en 2024-2025 (35,8 % des inscrits), environ 3 400 € par an en moyenne (2 279 M€ de bourses en 2027, calcul Isoloir) ; 31 % touchent moins de 150 € par mois.",
    "up": "+10 % : 246 M€ de plus en 2027, environ 3,60 € par habitant, soit à peu près 370 € de plus par boursier et par an, ou davantage d’étudiants aidés.",
    "down": "−10 % : 246 M€ de moins en 2027, environ 3,60 € par habitant, soit à peu près 370 € de moins par boursier et par an, ou moins d’étudiants aidés.",
    "argsUp": [
      "Selon le Sénat, faute de barème revalorisé, les boursiers ont reculé de 2,6 % en un an ; la suite de la réforme (400 M€) reste suspendue.",
      "Selon le ministère (PAP 2027), ces aides réduisent le nombre d’étudiants dont la réussite est freinée par un travail à côté des études."
    ],
    "argsDown": [
      "Selon le Sénat, la réforme de 2023 a davantage profité aux boursiers aux plus petites aides, qu’on peut considérer comme moins précaires.",
      "Le nombre de boursiers recule (−2,6 % en un an, baisse attendue aussi en 2025-2026 selon le Sénat) : à aide égale, il faut moins de crédits."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2026 : Recherche et enseignement supérieur (rapport général n° 139, tome III, annexe 23)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-323/l25-139-323_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-ame": {
    "what": "L’aide médicale de l’État (AME) paie les soins des étrangers sans titre de séjour, présents en France depuis plus de trois mois et aux revenus faibles, qui n’ont pas droit à l’Assurance maladie. L’État la finance, l’Assurance maladie la gère.",
    "who": "454 111 bénéficiaires fin 2025 (−2,4 %), dont 46 % de femmes et un peu moins d’un quart de mineurs. Hôpital : 65 % de la dépense, pour 15 % des bénéficiaires. Payé par l’État : environ 2 500 € par bénéficiaire et par an.",
    "up": "+50 % : 0,61 Md€ de plus, environ 1 250 € par bénéficiaire et par an : plus de soins couverts ou de bénéficiaires. Rembourser seulement l’Assurance maladie ne changerait pas le déficit public.",
    "down": "−50 % : 0,61 Md€ de moins, environ 1 250 € par bénéficiaire et par an. Dépense de guichet : sans changer la loi (soins couverts, accès), l’Assurance maladie paie l’écart, sans économie.",
    "argsUp": [
      "Soigner tôt plutôt qu’en « situation dégradée » ; une aide limitée à l’urgence n’apporterait pas d’économie sûre (mission sur l’AME, 2023).",
      "Non-recours élevé : 51 % seulement des éligibles auraient l’AME selon une étude de 2019, à lire avec prudence (mission sur l’AME, 2023)."
    ],
    "argsDown": [
      "Coût : +6 % par an en moyenne depuis 2009 (PAP) ; parmi les plus généreuses d’Europe (IGF-IGAS, 2019), comparaison jugée difficile en 2023.",
      "Revenus du conjoint comptés, accord préalable aux soins non urgents, pour « maîtriser les dépenses » (Sénat) ; pistes non chiffrées en 2023."
    ],
    "sources": [
      {
        "title": "Rapport sur les résultats de la gestion 2025, annexe n° 28 « Santé » (n° 736), p. 14",
        "publisher": "Sénat, commission des finances (rapporteur spécial)",
        "url": "https://www.senat.fr/rap/l25-736-228/l25-736-2281.pdf",
        "date": "2026-06-17",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport sur l’aide médicale de l’État (mission de C. Evin et P. Stefanini, avec l’appui de l’IGA et de l’IGAS), p. 18",
        "publisher": "Mission remise aux ministres de l’intérieur et de la santé (vie-publique.fr)",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/292122.pdf",
        "date": "2023-12-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aides-personnelles-logement": {
    "what": "Les aides personnelles au logement (APL, ALS, ALF) réduisent chaque mois le loyer ou le remboursement d’emprunt des ménages modestes. Les CAF et la MSA les versent ; l’État les paie par un fonds (Fnal). Le PLF 2027 gèle leur barème.",
    "who": "5,6 millions de ménages en 2025, surtout locataires ; en location, 218 € à 343 € par mois en moyenne selon l’aide (159 € à 215 € en accession). 86,8 % des locataires aidés (hors étudiants) gagnent moins que le Smic net.",
    "up": "+10 % : 1,7 Md€ de plus, en moyenne 290 € par ménage aidé et par an (24 € par mois) ; à +25 %, environ 730 €. Suppose un barème relevé d’autant. L’effet sur les loyers n’est pas compté.",
    "down": "−10 % : 1,7 Md€ de moins, en moyenne 290 € par ménage aidé et par an (24 € par mois) ; à −25 %, environ 730 €. Suppose un barème baissé d’autant. L’effet sur les loyers n’est pas compté.",
    "argsUp": [
      "Aide très ciblée : plus des trois quarts des montants vont aux 20 % les plus modestes ; −1,1 point de taux de pauvreté (DREES, 2022).",
      "Ne pas revaloriser ces aides pèse d’abord sur les plus modestes : un gel des prestations a un effet « largement régressif » (IPP, 2025)."
    ],
    "argsDown": [
      "Une partie finit dans les loyers : jusqu’à 78 % des aides dans les années 1990 (étude citée par la Banque de France), moins si l’offre suit.",
      "La dépense progresse : +493 M€ en 2025 (+3 %), à 16,8 Md€, après +344 M€ en 2024 (Cour des comptes, 2026)."
    ],
    "sources": [
      {
        "title": "Minima sociaux et prestations de solidarité, édition 2025, fiche 03 : les effets des transferts sociaux et fiscaux sur la réduction de la pauvreté monétaire",
        "publisher": "DREES",
        "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2003%20-%20Les%20effets%20des%20transferts%20sociaux%20et%20fiscaux%20sur%20la%20r%C3%A9duction%20de%20la%20pauvret%C3%A9%20mon%C3%A9taire.pdf",
        "date": "2025-12",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Perspectives budgétaires (juin 2025), chapitre 2 : effets budgétaires et redistributifs des mesures socio-fiscales",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
        "date": "2025-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Aides au logement : un moindre effet haussier sur les loyers si l’offre s’ajuste (Bloc-notes Éco n° 302, C. Grislain-Letrémy et C. Trevien)",
        "publisher": "Banque de France",
        "url": "https://www.banque-france.fr/fr/publications-et-statistiques/publications/aides-au-logement-un-moindre-effet-haussier-sur-les-loyers-si-loffre-sajuste",
        "date": "2023-01-30",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Note d’exécution budgétaire 2025, missions Cohésion des territoires (p. 44)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aides-indirectes-etudiants": {
    "what": "Subvention de l’État au réseau des Crous pour loger et nourrir les étudiants : résidences à loyer social et restaurants universitaires, où le repas coûte 1 € à tous les étudiants depuis mai 2026. Elle paie aussi une part du personnel et des travaux.",
    "who": "Les étudiants : 175 000 places de logement Crous ; en 2024-2025, 500 000 ont pris au moins un repas à 1 € et 930 000 un repas à 3,30 €. Payé par l’État : 635 M€, dont 143 M€ (22 %) pour étendre le repas à 1 € à tous.",
    "up": "+10 % : 64 M€ de plus pour les Crous, l’équivalent d’environ 1,20 € par repas sur les 52 millions attendus en 2027, ou plus de logements et de travaux. À +25 % : 159 M€.",
    "down": "−10 % : 64 M€ de moins, l’équivalent d’environ 1,20 € par repas servi. À −25 % : 159 M€. Prix, loyers ou travaux à revoir, sauf économies des Crous.",
    "argsUp": [
      "Un repas coûte 7,89 € ; aide de l’État importante mais « insuffisante » ; investir dans les restaurants (rapporteur spécial, Assemblée).",
      "Besoins de logement étudiant « immenses » (rapporteur spécial, Assemblée, 2026) : 25,7 places Crous pour 100 boursiers en 2025 (PAP)."
    ],
    "argsDown": [
      "Le repas à 1 € sans condition de ressources aide aussi les plus aisés : un choix « contestable » (rapporteur spécial, Assemblée, 2026).",
      "Des tarifs selon les revenus aideraient l’équilibre des Crous (rapporteur spécial, Assemblée) ; leurs loyers ont été gelés de 2020 à 2025."
    ],
    "sources": [
      {
        "title": "Rapport d’information sur la mise en œuvre des repas CROUS à 1 euro (n° 3008), p. 16",
        "publisher": "Assemblée nationale, commission des finances (rapporteur spécial)",
        "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b3008_rapport-information.pdf",
        "date": "2026-07-02",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aides-presse": {
    "what": "Aides directes de l’État aux éditeurs de presse écrite, presque toutes réservées à l’information politique et générale : aide par exemplaire posté ou porté, aide à la vente au numéro, aide aux titres à faibles ressources publicitaires, modernisation.",
    "who": "Les éditeurs de journaux et magazines d’information, nationaux et locaux. 166,8 M€ comptés, dont 89,7 M€ d’aide aux exemplaires postés ou portés et 23,2 M€ d’aides au pluralisme. Payé par l’État.",
    "up": "+50 % : 0,084 Md€ de plus pour les éditeurs aidés, répartis entre transport et portage, vente au numéro, pluralisme ou modernisation. À +100 %, les aides doublent : 0,17 Md€ de plus.",
    "down": "−50 % : 0,084 Md€ de moins pour les éditeurs aidés. À −100 %, ces aides disparaissent : les éditeurs paient l’essentiel de la distribution, ou en reportent le coût sur leurs prix.",
    "argsUp": [
      "Ces aides baissent le prix des journaux ; coûts de distribution en hausse et points de vente en baisse menacent le pluralisme (PAP 2027).",
      "Ventes au numéro 2019-2023 : −60 % pour les quotidiens nationaux, −36 % pour les régionaux ; chiffre d’affaires −43 % en 20 ans (Sénat)."
    ],
    "argsDown": [
      "Ces aides appellent des économies « structurelles », par une refonte en une aide unique par titre (rapporteur spécial, Sénat, 2025).",
      "La presse reçoit déjà 65 M€ par an d’avantages fiscaux en plus de ces crédits, surtout un taux de TVA « super réduit » (Sénat, 2025)."
    ],
    "sources": [
      {
        "title": "Rapport général sur le PLF 2026, annexe n° 18 « Médias, livre et industries culturelles » (n° 139)",
        "publisher": "Sénat, commission des finances (rapporteur spécial)",
        "url": "https://www.senat.fr/rap/l25-139-318/l25-139-3181.pdf",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-anah-renovation": {
    "what": "L’Agence nationale de l’habitat (Anah) verse des primes pour rénover des logements privés : MaPrimeRénov’ (isolation, chauffage, deux classes de DPE gagnées au moins), MaPrimeAdapt’ (vieillesse, handicap), habitat indigne. L’État lui verse cette subvention.",
    "who": "Propriétaires et copropriétés. Rénovations d’ampleur aidées en 2025 : plus de 120 000 selon le Gouvernement, 91 000 selon la Cour des comptes ; parcours accompagné : plus de 80 % des montants à des ménages modestes.",
    "up": "+10 % : 0,13 Md€ de plus : de l’ordre de 3 000 rénovations d’ampleur de ménages modestes (aide moyenne prévue : 42 500 €), ou des dossiers en attente payés plus vite. À +25 % : 0,31 Md€.",
    "down": "−10 % : 0,13 Md€ de moins : de l’ordre de 3 000 rénovations d’ampleur aidées en moins, ou des primes payées plus tard. À −25 % : 0,31 Md€.",
    "argsUp": [
      "3,9 millions de passoires énergétiques à rénover, priorité aux propriétaires modestes ; logements F non décents à louer dès 2028 (PAP).",
      "83 000 dossiers attendaient fin 2025 : dispositif « presque saturé » début 2026, après une suspension partielle en 2025 (Cour des comptes)."
    ],
    "argsDown": [
      "Isoler une maison réduit bien moins la consommation que prévu : −5 % d’électricité, −6,6 % de gaz (document de travail Insee-SDES, 2026).",
      "Fin 2025, 2,26 Md€ de primes accordées restaient à payer et « rigidifient » le budget à venir ; dispositif instable (Cour des comptes)."
    ],
    "sources": [
      {
        "title": "Note d’exécution budgétaire 2025, missions Cohésion des territoires (p. 78)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Effets de l’isolation thermique des logements sur la consommation réelle d’énergie résidentielle (document de travail n° 2025-16, version révisée), avertissement (p. 5)",
        "publisher": "Insee et SDES (document de travail, n’engage que ses auteurs)",
        "url": "https://www.insee.fr/fr/statistiques/fichier/version-html/8607754/DT2025-16.pdf",
        "date": "2026-09-17",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-asile": {
    "what": "L’argent de l’État pour instruire les demandes d’asile (OFPRA) et accueillir les demandeurs : 113 410 places pour demandeurs et réfugiés (1 700 payées par l’UE) et l’allocation (ADA), majorée pour qui n’a pas de place. 1 315,0 M€ au PLF 2027.",
    "who": "Reçoivent : les demandeurs d’asile (environ 108 000 en 2027 ; ADA : 65 944 par mois, 212 € en moyenne), 15 454 personnes sous protection temporaire, les gestionnaires des centres, l’OFPRA (106,2 M€). 19 € par habitant.",
    "up": "+10 % : +0,14 Md€ (2 € par habitant), l’équivalent de plus de 16 000 places de CADA sur un an.",
    "down": "−10 % : −0,14 Md€ (2 € par habitant), l’équivalent de plus de 16 000 places de CADA sur un an. Une directive européenne impose l’accueil.",
    "argsUp": [
      "Le PAP 2027 indique que 72 % des demandeurs d’asile étaient hébergés fin 2025 (78 % fin juin 2026), contre une cible de 85 % en 2027.",
      "Le PAP 2027 prévoit un parc stable (113 410 places, contre 113 555 en 2026) alors que la demande repartirait à la hausse (+3 % en 2027)."
    ],
    "argsDown": [
      "Environ 9 % des places sont occupées par des réfugiés ou déboutés n’y ayant plus droit (PAP 2027) : les libérer permet d’accueillir plus.",
      "Le PAP 2027 vise une procédure de six mois : décider plus vite raccourcit le séjour en centre, donc plus de demandeurs logés par place."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-audiovisuel-public": {
    "what": "Ce sont les sommes que l’État verse chaque année aux sociétés publiques de télévision et de radio (France Télévisions, Radio France, Arte…) et à l’INA. Depuis la fin de la redevance en 2022, elles sont payées par une part de la TVA. 3 816,5 M€ au PLF 2027.",
    "who": "Reçoivent : France Télévisions 2 378,7 M€ (80 % de ses ressources), Radio France 645,6 M€, France Médias Monde 307,0 M€, Arte France 298,1 M€, INA 102,9 M€, TV5 Monde 84,2 M€. Environ 55 € par habitant.",
    "up": "+50 % : +2,0 Md€ (environ 28 € de plus par habitant). +100 % : +3,9 Md€ (55 € de plus par habitant), si les sociétés dépensent le double ; effet statique.",
    "down": "−50 % : −2,0 Md€ (environ 28 € de moins par habitant). −100 % : −3,9 Md€ (55 € de moins par habitant), ce qui suppose la fermeture ou la vente des sociétés ; coûts et produits non comptés.",
    "argsUp": [
      "Selon la Cour des comptes (2025), France Télévisions est l’information à laquelle les Français font le plus confiance (75 % en 2023).",
      "Un règlement européen (2024) impose aux États d’assurer aux médias publics des ressources « suffisantes, durables et prévisibles »."
    ],
    "argsDown": [
      "La Cour des comptes (2025) juge France Télévisions non soutenable sans réformes structurelles, dont la renégociation de son accord de 2013.",
      "La Cour des comptes (2025) juge nécessaires d’autres mises en commun au sein de France Télévisions (finances, achats, informatique)."
    ],
    "sources": [
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Avances à l’audiovisuel public (p. 9)",
        "publisher": "Cour des comptes",
        "url": "https://program-evaluation.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Avances-audiovisuel-public.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "France Télévisions, exercices 2017-2024 : observations définitives (synthèse, p. 8)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250923-S2025-1126-1-France-Televisions.pdf",
        "date": "2025-09-23",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Règlement (UE) 2024/1083 du 11 avril 2024 (règlement européen sur la liberté des médias), article 5, paragraphe 3",
        "publisher": "Parlement européen et Conseil de l’Union européenne (EUR-Lex)",
        "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32024R1083",
        "date": "2024-04-11",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-culture": {
    "what": "La mission Culture finance le patrimoine (monuments, musées, archives), la création (spectacle, arts visuels), la transmission (écoles d’art, pass Culture) et le ministère, paie des agents comprise. 3 649,2 M€ au PLF 2027, dont 3 056,2 M€ comptés ici.",
    "who": "Patrimoines 1 116,3 M€, Création 963,0 M€ dont spectacle vivant 737,6 M€, Transmission 712,0 M€ dont pass Culture 137,5 M€, soutien et personnel 857,9 M€. Environ 53 € par habitant, 44 € pour la part comptée.",
    "up": "+10 % : +0,31 Md€ (4,4 € par habitant), plus de deux fois le pass Culture (137,5 M€). +25 % : +0,77 Md€ (11 € par habitant), un peu plus que les crédits du spectacle vivant (737,6 M€).",
    "down": "−10 % : −0,31 Md€ (4,4 € par habitant), plus de deux fois le pass Culture (137,5 M€). −25 % : −0,77 Md€ (11 € par habitant), un peu plus que les crédits du spectacle vivant (737,6 M€).",
    "argsUp": [
      "La Cour des comptes (2025) relève qu’un quart des monuments historiques, tous propriétaires confondus, reste en mauvais état ou en péril.",
      "Le PLF 2027 baisse les crédits de la mission Culture de 2,55 % par rapport à 2026 (PAP 2027)."
    ],
    "argsDown": [
      "Selon la Cour des comptes (2024), le pass Culture a surtout renforcé des pratiques établies (premières cohortes) : risque d’effet d’aubaine.",
      "La Cour des comptes (2022) note qu’une partie des spectacles financés est très peu jouée : 2,3 à 3,7 représentations en moyenne (2019)."
    ],
    "sources": [
      {
        "title": "Les collectivités territoriales face aux enjeux de leur patrimoine monumental (p. 26)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250917-Collectivites-territoriales-face-enjeux-de-leur-patrimoine-monumental.pdf",
        "date": "2025-09-17",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Premier bilan du pass Culture, synthèse du rapport public thématique (p. 11)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-12/20241217-synthese-Premier-bilan-pass-Culture_1.pdf",
        "date": "2024-12-17",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le soutien du ministère de la culture au spectacle vivant (synthèse, p. 10)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20220530-rapport-soutien-Etat-spectacle-vivant.pdf",
        "date": "2022-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-egalite-femmes-hommes": {
    "what": "Le programme 137 « Égalité entre les femmes et les hommes » finance une part de l’effort pour les droits des femmes : aide d’urgence aux victimes de violences conjugales, écoute (3919), centres d’information, sortie de la prostitution. 106,3 M€ au PLF 2027.",
    "who": "Reçoivent : les victimes de violences conjugales (aide d’urgence : 33,3 M€, 898 € par aide) ; le reste va surtout à des associations (violences et prostitution : 47,5 M€ ; accès aux droits : 24,7 M€). 1,5 € par habitant.",
    "up": "+10 % : 0,011 Md€ de plus (0,15 € par habitant), l’équivalent de 22 % de l’action contre les violences et la prostitution. L’aide d’urgence est un droit fixé par la loi : elle suit la demande.",
    "down": "−10 % : 0,011 Md€ de moins (0,15 € par habitant), l’équivalent de 22 % de l’action contre les violences et la prostitution. L’aide d’urgence est un droit fixé par la loi : elle suit la demande.",
    "argsUp": [
      "Selon le PAP 2027, l’aide d’urgence (fin 2023) a été versée près de 90 000 fois, avec près de 25 % d’aides en plus au premier semestre 2026.",
      "La Cour des comptes (2023) relève que la prévention par l’éducation, qui demande un effort dans la durée, a été peu mise en œuvre."
    ],
    "argsDown": [
      "La Cour des comptes (2023) relève que bien des mesures ne reposent pas sur un diagnostic précis des situations et des besoins.",
      "Les crédits du programme ont triplé en cinq ans, de 30 M€ (2020) à 98,65 M€ (2026), selon le PAP 2027."
    ],
    "sources": [
      {
        "title": "La politique d’égalité entre les femmes et les hommes menée par l’État, synthèse du rapport public thématique (p. 9)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230914-synthese-Politique-egalite-femmes-hommes_0.pdf",
        "date": "2023-09-14",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-france-2030": {
    "what": "France 2030 est un plan d’investissement de 54 Md€ lancé en 2021 : l’État finance, par des opérateurs (Bpifrance, ADEME, ANR, Caisse des dépôts), des projets d’innovation. Les 4,0 Md€ de 2027 couvrent des engagements déjà pris, sans engagement nouveau.",
    "who": "Reçoivent : entreprises, start-up, laboratoires et universités, environ 7 000 bénéficiaires pour 9 200 projets ; 42,1 Md€ d’engagements autorisés et 19,5 Md€ versés au 30 juin 2026. En 2027, environ 58 € par habitant.",
    "up": "+10 % : +0,35 à 0,39 Md€ versés aux opérateurs (5,1 à 5,6 € par habitant). Le déficit 2027 ne se creuse que s’ils paient plus aux bénéficiaires ; sinon la somme reste dans leur trésorerie.",
    "down": "−10 % : −0,35 à 0,39 Md€ versés aux opérateurs (5,1 à 5,6 € par habitant). Le déficit 2027 ne baisse que s’ils paient moins aux bénéficiaires ; sinon ils puisent dans leur trésorerie.",
    "argsUp": [
      "La Cour des comptes (2026) observe que les aides à la décarbonation auraient accru l’investissement des industriels déjà engagés.",
      "La Cour des comptes (2026) relève 27,9 Md€ d’engagements restant à payer fin 2025 et un report progressif de la charge vers 2028 et au-delà."
    ],
    "argsDown": [
      "La Cour des comptes (2026) juge relativement élevée la trésorerie des opérateurs : 4,96 Md€ fin 2025, soit 422 jours de versements.",
      "La Cour des comptes (2026) n’observe pas, à ce stade, d’effet des aides à la décarbonation sur la production ni sur l’emploi."
    ],
    "sources": [
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Investir pour la France de 2030 (p. 14)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Investir-pour-France-2030.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les aides à la décarbonation de l’industrie du plan de relance et de France 2030, synthèse de l’évaluation (p. 13)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-03/20260311-synthese-Aides-a-decarbonation-de-l-industrie-du-plan-de-relance-et-de-France-2030.pdf",
        "date": "2026-03-11",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-integration": {
    "what": "Les crédits de l’État pour l’accueil des étrangers qui s’installent durablement : cours de français et formation civique du contrat d’intégration républicaine (CIR), organisés par l’OFII, aide aux réfugiés, naturalisations ; une part de l’asile à l’OFII.",
    "who": "Plus de 100 000 signataires du CIR par an (102 871 en 2025), dont un tiers de personnes protégées (réfugiés ou protection subsidiaire). L’OFII reçoit 255,5 M€, dont 17,9 M€ d’aide au retour volontaire. Payé par l’État.",
    "up": "+10 % = 0,036 Md€ de plus en 2027 : au coût moyen de 7,40 € l’heure de cours (2024), l’équivalent de 46 heures de français en plus par signataire du CIR de 2025.",
    "down": "−10 % = 0,036 Md€ de moins : au coût moyen de 7,40 € l’heure de cours (2024), l’équivalent de 46 heures de français en moins par signataire du CIR de 2025.",
    "argsUp": [
      "Sénat (2024) : un allongement d’au moins 100 heures « semble nécessaire » pour le niveau A2 exigé depuis 2026 ; au moins 100 M€ (ministère).",
      "Cour des comptes (2026) : AGIR (suivi des réfugiés) ramené de 78 à 57,6 M€ en 2025 ; 25 000 suivis, contre 36 000 au rythme initial."
    ],
    "argsDown": [
      "Sénat (2024) : crédits de formation passés de 36,8 à 116,9 M€ de 2016 à 2023 ; résultats « décevants », 68 % au niveau A1 en 2023.",
      "Cour des comptes (2025) : prix très inégaux d’un marché à l’autre, de 157 € à 644 € pour un même test de niveau en français."
    ],
    "sources": [
      {
        "title": "Sénat, commission des finances : L’essentiel sur le rapport d’information « Apprentissage du français et des valeurs civiques » (contrat d’intégration républicaine) (p. 3)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r23-772/r23-772-syn.pdf",
        "date": "2024-09-24",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Immigration, asile et intégration (p. 42)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Immigration.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les missions, le financement et le contrôle par l’État des associations intervenant au titre de la politique d’immigration et d’intégration (communication à la commission des finances du Sénat) (p. 35)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-02/20250211-Missions-financement-controle-Etat-associations-dans-politique-dimmigration-et-d-integration.pdf",
        "date": "2025-02-11",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-justice-judiciaire": {
    "what": "Les moyens des tribunaux et cours de l’ordre judiciaire (affaires civiles, pénales, commerciales, prud’hommes) : salaires des magistrats et greffiers, frais de justice (écoutes, géolocalisations, gardiennage de véhicules), locaux, fonctionnement courant.",
    "who": "Tous les justiciables : 164 tribunaux judiciaires, 36 cours d’appel, 210 conseils de prud’hommes. 39 875 emplois en 2027 (621 créations), dont 11 080 magistrats, et 787 M€ de frais de justice. Payé par l’État.",
    "up": "+10 % = 0,36 Md€ de plus en 2027 : l’équivalent des rémunérations (hors cotisations) d’environ 4 100 magistrats, ou 45 % des frais de justice. Un magistrat recruté exerce après 31 mois de formation.",
    "down": "−10 % = 0,36 Md€ de moins : l’équivalent des rémunérations (hors cotisations) d’environ 4 100 magistrats, ou 45 % des frais de justice ; en pratique, moins de recrutements, de travaux, d’équipement.",
    "argsUp": [
      "Cour des comptes (2021), d’après le Conseil de l’Europe : 11 juges professionnels pour 100 000 habitants en France, 21 en Europe, à nuancer.",
      "Cour des comptes (2026) : l’immobilier judiciaire, prioritaire selon la loi, sert de « gisement d’économies » alors que le parc vieillit."
    ],
    "argsDown": [
      "Cour des comptes (2021) : budget +22 % en dix ans, délais civils en hausse ; la justice a « moins besoin d’être réformée que mieux gérée ».",
      "Cour des comptes (2026) : frais de justice stabilisés en 2025 (785 M€ de mémoires), effet attribué au plan de maîtrise, à poursuivre."
    ],
    "sources": [
      {
        "title": "Améliorer la gestion du service public de la justice (note structurelle) (synthèse, p. 7)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2021-10/20211021-NS-Justice.pdf",
        "date": "2021-10-21",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Justice (synthèse, p. 7)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Justice.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-lutte-immigration-irreguliere": {
    "what": "Les crédits pour retenir puis renvoyer les étrangers en situation irrégulière : fonctionnement et construction des centres de rétention administrative (CRA, lieux fermés avant un départ forcé), transport des éloignements, aide juridique aux retenus.",
    "who": "Des étrangers visés par une mesure d’éloignement : 15 569 retours forcés en 2025 ; 36 % des personnes placées en CRA éloignées en 2025 ; 2 247 places en métropole prévues en 2027. Payé par l’État.",
    "up": "+50 % = 0,15 Md€ de plus en 2027 : plus que l’investissement prévu (117,2 M€), ou 3,5 fois le marché du CRA de Dunkerque (40,8 M€, 140 places). À +100 %, cette ligne double (0,29 Md€ de plus).",
    "down": "−50 % = 0,15 Md€ de moins : plus que l’investissement prévu (117,2 M€), ou 3,5 fois le marché du CRA de Dunkerque. À −100 %, cette ligne ne paie plus ni les CRA ni les vols d’éloignement.",
    "argsUp": [
      "Cour des comptes (2024) : près de la moitié des placés en CRA éloignés (36 % en 2025 selon le PAP) ; la rétention est « indispensable ».",
      "Cour des comptes (2024) : de 2019 à 2022, 5 % des personnes sous OQTF placées en CRA (1 717 places) ; objectif 3 000, repoussé à fin 2029."
    ],
    "argsDown": [
      "Cour des comptes (2024) : environ 10 % des OQTF exécutées, freinées entre autres par les laissez-passer ; l’aide au retour coûte bien moins.",
      "Cour des comptes (2026) : de 2018 à 2025, seuls 53 % des crédits votés pour bâtir des CRA ont été dépensés (terrains, études, recours)."
    ],
    "sources": [
      {
        "title": "La politique de lutte contre l’immigration irrégulière, synthèse du rapport public thématique (p. 17)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-01/20240104-synthese-Politique-lutte-contre-immigration-irreguliere.pdf",
        "date": "2024-01-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Immigration, asile et intégration (p. 40)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Immigration.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-pjj": {
    "what": "Les moyens de la protection judiciaire de la jeunesse (PJJ) : éducateurs qui suivent, sur décision d’un juge, des mineurs délinquants ou en danger, chez eux (« milieu ouvert ») ou en foyer, et associations habilitées qui en accueillent.",
    "who": "Des mineurs confiés par les juges : 138 468 mesures de milieu ouvert en 2024 ; 555 services et foyers (223 publics, 332 associatifs) ; 9 751 emplois. Les associations reçoivent 288,8 M€. Payé par l’État.",
    "up": "+10 % = 0,090 Md€ de plus en 2027 : l’équivalent des rémunérations (hors cotisations) d’environ 2 100 éducateurs, sur 5 789 emplois éducatifs, ou 31 % des sommes versées aux associations.",
    "down": "−10 % = 0,090 Md€ de moins : l’équivalent des rémunérations (hors cotisations) d’environ 2 100 éducateurs, sur 5 789 emplois éducatifs, ou 31 % des sommes versées aux associations.",
    "argsUp": [
      "Sénat (2025) : mesures de milieu ouvert +19,7 % de 2018 à 2024, effectifs en légère baisse ; besoin de 322 éducateurs selon l’inspection.",
      "Sénat (2025) : nombre de places en structures de placement « largement insuffisant », selon magistrats, éducateurs et administration."
    ],
    "argsDown": [
      "Cour des comptes (2023) : journée en centre éducatif fermé à 571-705 € selon le secteur en 2019, places occupées aux deux tiers.",
      "Sénat (2025) : de 2020 à 2026, emplois créés surtout dans l’encadrement (+771), l’éducatif en recul (−53) ; doublons possibles (inspection)."
    ],
    "sources": [
      {
        "title": "Sénat, commission des lois : L’essentiel sur l’avis budgétaire « Protection judiciaire de la jeunesse » (projet de loi de finances pour 2026) (p. 2)",
        "publisher": "Sénat, commission des lois",
        "url": "https://www.senat.fr/rap/a25-145-8/a25-145-8-syn.pdf",
        "date": "2025-11",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les centres éducatifs fermés et les établissements pénitentiaires pour mineurs (observations définitives) (synthèse, p. 3)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20231016-S2023-0733-Centres-educatifs-fermes-etablissements-penitentiaires-pour-mineurs.pdf",
        "date": "2023-07",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-politique-de-la-ville": {
    "what": "Les crédits propres de l’État pour les quartiers prioritaires (QPV, à faible revenu médian, délimités par décret) : contrats de ville, cités éducatives, réussite éducative, adultes-relais (médiateurs), rénovation urbaine (ANRU), EPIDE (insertion des jeunes).",
    "who": "Les habitants des 1 584 QPV, plus de 6 millions de personnes, via associations, communes et organismes publics. Les 619,1 M€ font environ 100 € par habitant de QPV et par an. Payé par l’État.",
    "up": "+10 % = 0,046 Md€ de plus en 2027 (environ 7,6 € par habitant des QPV) : l’équivalent de l’aide de l’État à environ 2 300 postes d’adultes-relais, ou plus de la moitié du budget des cités éducatives.",
    "down": "−10 % = 0,046 Md€ de moins (environ 7,6 € par habitant des QPV) : l’équivalent de l’aide de l’État à environ 2 300 postes d’adultes-relais, ou plus de la moitié du budget des cités éducatives.",
    "argsUp": [
      "Cour des comptes (2026) : dans les QPV, pauvreté trois fois plus fréquente et chômage deux fois plus élevé qu’en moyenne en métropole.",
      "Cour des comptes (2026) : chômage en QPV passé de 25 % à 18 % de 2014 à 2022 (moins de 3 points ailleurs), lien avec ces crédits non établi."
    ],
    "argsDown": [
      "Cour des comptes (2026) : des moyens importants « éparpillés en de multiples actions », aux effets difficiles à mesurer.",
      "Cour des comptes (2026) : risque de substitution, les cités éducatives payant des actions que communes, CAF ou école financent ailleurs."
    ],
    "sources": [
      {
        "title": "Rapport public annuel 2026, chapitre « Articuler davantage la politique de la ville et les politiques de droit commun dans les quartiers prioritaires de la ville » (p. 388)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-03/20260325-RPA-2026-III-1-Articuler-davantage-la%20politique-de-la-ville_0.pdf",
        "date": "2026-03-25",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-prime-activite-rsa": {
    "what": "La prime d’activité complète chaque mois le revenu des travailleurs modestes (jusqu’à 1,5 Smic environ). La ligne paie aussi la prime de fin d’année (RSA, ASS…) et le RSA versé par l’État en Guyane, à Mayotte, à La Réunion et dans trois départements pilotes.",
    "who": "Reçoivent : 4,58 millions de foyers (8,79 millions de personnes), 184 € par mois en moyenne (Cnaf, mi-2026), plus des allocataires du RSA et de l’ASS. Paie : l’État, 12,97 Md€ en 2027, dont 10,7 Md€ de prime d’activité.",
    "up": "+10 % = +1,3 Md€ : environ 18 € de plus par mois pour le foyer moyen si le barème suit (10 % de 184 €), ou de nouveaux foyers éligibles. À +86 %, estimé : 11,1 à 13,6 Md€ de plus.",
    "down": "−10 % = −1,3 Md€ : environ 18 € de moins par mois pour le foyer moyen si le barème suit (10 % de 184 €), ou des foyers qui sortent du dispositif. À −86 %, estimé : 9,1 à 11,2 Md€ de moins.",
    "argsUp": [
      "DREES (2026) : fin 2021, la moitié des foyers éligibles ne la touchaient pas ; si tous la touchaient, la pauvreté baisserait de 0,5 point.",
      "Cour des comptes (2026) : un soutien efficace au revenu des travailleurs, qui a largement fait reculer la pauvreté de ceux à temps plein."
    ],
    "argsDown": [
      "Cour des comptes (2026) : effet sur l’emploi non démontré, renfort de 2019 compris ; près de 80 % des sondés disent ne pas en tenir compte.",
      "Cour des comptes (2026) : versée aussi au-dessus du seuil de pauvreté ; exclure apprentis et cumul emploi-retraite : plus de 300 M€/an."
    ],
    "sources": [
      {
        "title": "Prime d’activité, conjoncture au 2e trimestre 2026 (n° 38)",
        "publisher": "Caisse nationale des allocations familiales (Cnaf), direction des statistiques, des études et de la recherche",
        "url": "https://www.caf.fr/sites/default/files/medias/cnaf/Nous_connaitre/Recherche_et_statistiques/PPA%20Conjoncture/PA%20Conjoncture_2026T2.pdf",
        "date": "2026-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Non-recours à la prime d’activité : la moitié des foyers éligibles ne la perçoivent pas fin 2021 (Études et Résultats n° 1379)",
        "publisher": "Direction de la recherche, des études, de l’évaluation et des statistiques (DREES)",
        "url": "https://www.drees.solidarites-sante.gouv.fr/sites/default/files/2026-07/ER1379_Non-recours_PA.pdf",
        "date": "2026-07",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La prime d’activité : un soutien efficace au revenu des travailleurs, une trop faible incitation à l’activité (communication à la commission des finances du Sénat, annexée au rapport d’information n° 728, 2025-2026), conclusion du chapitre (p. 94)",
        "publisher": "Cour des comptes",
        "url": "https://www.senat.fr/rap/r25-728/r25-728-annexe.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-remunerations-enseignement-scolaire": {
    "what": "La paie brute des personnels de l’Éducation nationale et de l’enseignement agricole : enseignants du public et du privé sous contrat, accompagnants d’élèves handicapés (AESH), surveillants, administratifs. Hors cotisations des employeurs et pensions.",
    "who": "Reçoivent : environ 1,11 million d’emplois à temps plein (ETPT) au PLF 2027, dont environ 850 000 enseignants (hors stagiaires). Paie : l’État, 49,85 Md€ de rémunérations d’activité.",
    "up": "+10 % : +5,0 Md€. Chaque 1 % : environ 450 € brut de plus par an et par agent à temps plein (49,85 Md€ pour 1,11 million d’ETPT), ou environ 11 000 postes de plus au salaire brut moyen.",
    "down": "−10 % : −5,0 Md€. Chaque 1 % : environ 450 € brut de moins par an et par agent à temps plein (49,85 Md€ pour 1,11 million d’ETPT), ou environ 11 000 postes de moins au salaire brut moyen.",
    "argsUp": [
      "Sénat (2025) : au primaire, salaire à 74 % de celui des actifs de même diplôme (OCDE : 83 %) ; candidats aux concours −30,8 % en 2016-2024.",
      "IPP (2025) : garder les postes (classes du primaire de 22,4 à 18,2 élèves d’ici 2034) serait plus rentable socialement à long terme."
    ],
    "argsDown": [
      "IPP (2025) : à taille de classe égale, la baisse des élèves du primaire permettrait 50 000 postes de moins d’ici 2034 (3,4 Md€/an en 2034).",
      "Sénat (2025) : suivre la baisse des élèves (−1 %) aurait supprimé 9 415 postes en 2026, plus du double des 4 018 prévus."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2026 : Enseignement scolaire (rapport général n° 139, 2025-2026, tome III, annexe 13) : B. Des rémunérations encore très insuffisantes des enseignants",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-313/l25-139-3138.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2026 : Enseignement scolaire (rapport général n° 139, 2025-2026, tome III, annexe 13) : C. La baisse démographique, une opportunité pour les politiques de l’Éducation nationale",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-313/l25-139-3136.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Perspectives budgétaires (juin 2025), chapitre 4 : Taille des classes et inégalités territoriales, quelle stratégie face à la baisse démographique ?",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_demographie_scolaire-1.pdf",
        "date": "2025-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-universites-recherche": {
    "what": "Les crédits que l’État verse aux universités et écoles (programme 150 : enseignement, recherche universitaire, salaires) et aux organismes de recherche comme le CNRS, l’Inserm, l’Inrae ou l’Inria (programme 172). Ces établissements gèrent eux-mêmes ces sommes.",
    "who": "Reçoivent : universités et écoles (208 000 emplois à temps plein qu’elles paient) et organismes de recherche (86 500), pour un supérieur de 2,97 millions d’étudiants (2024). Paie : l’État, 24,2 Md€.",
    "up": "+10 % : +2,4 Md€ si les établissements dépensent d’autant plus : environ 17,5 % de la masse salariale que l’État finance dans les universités ; postes, formations, recherche en plus.",
    "down": "−10 % : −2,4 Md€ si les établissements dépensent d’autant moins : environ 17,5 % de la masse salariale que l’État finance dans les universités ; postes, formations, recherche en moins.",
    "argsUp": [
      "PAP 2027 : R&D à 2,18 % du PIB en 2024, sous l’objectif de 3 % ; pour le Sénat, la trajectoire de la loi de programmation n’est plus tenue.",
      "Sénat (2025) : +15 % d’étudiants de 2015 à 2024 ; hors inflation, la subvention aux universités a reculé en 2018, 2022 et 2023."
    ],
    "argsDown": [
      "Sénat (2025), d’après l’IGF : droits d’inscription (1,9 % des recettes) relevés selon le revenu du foyer : 500 M€/an économisés par l’État.",
      "Sénat (2025) : subvention aux universités +23 % en euros courants (2014-2025) ; fonds européens mieux captés : 783 M€ sans coût public."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2026 : Recherche et enseignement supérieur (rapport général n° 139, 2025-2026, tome III, annexe 23) : la trajectoire de la loi de programmation de la recherche",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-323/l25-139-3233.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2026 : Recherche et enseignement supérieur (rapport général n° 139, 2025-2026, tome III, annexe 23) : l’essentiel, droits d’inscription",
        "publisher": "Sénat, commission des finances (d’après une mission de l’inspection générale des finances)",
        "url": "https://www.senat.fr/rap/l25-139-323/l25-139-3230.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "csg-activite": {
    "what": "La contribution sociale généralisée (CSG) est un prélèvement proportionnel sur presque tous les revenus. Sur les revenus d’activité, son taux est de 9,2 %, sur 98,25 % du brut pour un salaire ; la CSG payée au taux de 6,8 % est déductible du revenu imposable.",
    "who": "Paient : salariés du privé (69,7 % du produit en 2026), agents publics (18,9 %), indépendants (7,7 %) : 111,9 Md€ en 2027. Reçoivent : assurance maladie (4,25 points sur 9,2), autonomie, Unédic, famille, Cades.",
    "up": "+1 point : 10,1 à 12,0 Md€ de recettes en plus. Environ 20 € net de moins par mois (236 € par an) pour un salaire de 2 000 € brut, 49 € (590 € par an) pour 5 000 € brut.",
    "down": "−1 point : 10,1 à 12,0 Md€ de recettes en moins. Environ 20 € net de plus par mois (236 € par an) pour un salaire de 2 000 € brut, 49 € (590 € par an) pour 5 000 € brut.",
    "argsUp": [
      "IPP (2025) : un point sur tous les taux de CSG : 14,6 Md€ (10,1 sur l’activité), effort réparti sur toute l’échelle, plutôt progressif.",
      "Sénat (2025), d’après Trésor et OFCE : la première année, une hausse de CSG réduit le déficit de presque tout son montant."
    ],
    "argsDown": [
      "IPP (2025) : un point sur tous les taux de CSG : 57 % des ménages perdraient au moins 1 % de niveau de vie, la moitié la moins aisée 0,75 %.",
      "Sénat (2025), d’après Trésor et OFCE : comme elle réduit le PIB, l’effet d’une hausse sur le déficit est divisé par deux en dix ans."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG » (p. 54-56)",
        "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "csg-capital": {
    "what": "La CSG prélevée sur les revenus de l’épargne et du patrimoine : dividendes, intérêts, plus-values, loyers, assurance-vie. Taux de 10,6 % depuis 2026, mais 9,2 % sur les loyers, plus-values immobilières, assurance-vie, épargne logement (PEL, CEL) et PEP.",
    "who": "Paient : les ménages qui touchent des revenus de placements (intérêts, dividendes, assurance-vie…) ou louent un bien : 19,2 Md€ en 2027. Reçoivent : surtout la Cnav (retraites) et la CNSA (autonomie).",
    "up": "+1 point : 1,3 à 1,9 Md€ de recettes en plus : 10 € de prélèvement en plus pour 1 000 € de revenus du capital ; prélèvements sociaux de 18,6 % à 19,6 % au taux principal.",
    "down": "−1 point : 1,3 à 1,9 Md€ de recettes en moins : 10 € de prélèvement en moins pour 1 000 € de revenus du capital ; prélèvements sociaux de 18,6 % à 17,6 % au taux principal.",
    "argsUp": [
      "France Stratégie (2023) : en 2021, 1 % des foyers déclarent 96 % des dividendes et 0,01 % 70 % des plus-values mobilières.",
      "CCSS (2026), en prévision : la hausse de 1,4 point décidée pour 2026 sur une partie des revenus du capital rapporterait 1,2 Md€."
    ],
    "argsDown": [
      "France Stratégie (2023) : la baisse en 2018 de l’impôt sur le revenu des dividendes (PFU) aurait été autofinancée les premières années.",
      "France Stratégie (2023) : les dividendes ont chuté en 2013 avec leur passage au barème de l’impôt sur le revenu, puis remonté en 2018."
    ],
    "sources": [
      {
        "title": "Comité d’évaluation des réformes de la fiscalité du capital : rapport final, avis du comité",
        "publisher": "France Stratégie",
        "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/Rapport/fs-2023-rapport-isf-quatrieme_rapport_complet_17octobre_avis_0.pdf",
        "date": "2023-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "csg-ensemble": {
    "what": "La CSG (contribution sociale généralisée) est prélevée sur presque tous les revenus, souvent à la source : salaires, retraites, chômage, revenus du capital. Elle finance surtout l’assurance maladie et l’autonomie. Le levier bouge d’autant chaque taux non nul.",
    "who": "Presque tous les ménages la paient : 162,3 Md€ en 2027 (111,9 sur l’activité, 30,6 sur le remplacement, 19,2 sur le capital), pour la Sécurité sociale, l’Unédic et la Cades. Un point rapporte 12,3 à 18,0 Md€.",
    "up": "+1 point : 12,3 à 18,0 Md€ de recettes en plus. Sur un salaire ou une retraite de 2 000 € brut par mois soumis à la CSG, environ 20 € de CSG en plus chaque mois.",
    "down": "−1 point : 12,3 à 18,0 Md€ de recettes en moins. Sur un salaire ou une retraite de 2 000 € brut par mois soumis à la CSG, environ 20 € de CSG en moins chaque mois.",
    "argsUp": [
      "Assiette très large : un point rapporte 12 à 18 Md€, contre 6,4 Md€ pour un point sur chaque taux de l’impôt sur le revenu (IPP, Sénat).",
      "Hausse plutôt progressive selon l’IPP : perte de 0,4 % de niveau de vie pour les 5 % les plus modestes, de 1,3 % pour le 1 % le plus aisé."
    ],
    "argsDown": [
      "Une baisse relèverait le niveau de vie de presque tous : selon l’IPP, un point pèse au moins 1 % du niveau de vie de 57 % des ménages.",
      "Pour la moitié la plus modeste, un point coûte 0,75 % de niveau de vie, contre 0,09 % pour un point d’impôt sur le revenu (IPP)."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
        "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "CSG et CRDS sur les revenus d’activité et de remplacement",
        "publisher": "Direction de l’information légale et administrative (Service-public.fr)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2971",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "csg-pensions-taux-plein": {
    "what": "Les retraites et pensions d’invalidité paient la CSG à 0 %, 3,8 %, 6,6 % ou 8,3 % selon le revenu fiscal du foyer : le taux plein de 8,3 % au-delà de 26 472 € de revenu fiscal de référence 2024 pour une part. Les salaires paient 9,2 %, sur 98,25 % du brut.",
    "who": "Les retraités dont le foyer paie le taux plein : environ 38 % des retraités, pension moyenne 2 623 € brut par mois (IPP, 2027). Ceux de la moitié la plus modeste de la population ne sont presque pas concernés.",
    "up": "+0,9 point (9,2 %, le taux affiché des salaires) : 1,5 à 1,8 Md€ de recettes en plus. Une pension de 2 500 € brut par mois au taux plein paierait 22,50 € de CSG en plus chaque mois.",
    "down": "−0,9 point (7,4 %) : 1,5 à 1,8 Md€ de recettes en moins. Une pension de 2 500 € brut par mois au taux plein paierait 22,50 € de CSG en moins chaque mois.",
    "argsUp": [
      "Le CPO (2024) voit dans ce taux un avantage « centré sur les retraités les plus aisés » : 990 € par an pour 2,5 fois le salaire moyen.",
      "Selon le COR (2026), cité par l’IPP, le niveau de vie moyen des retraités est proche de celui de l’ensemble de la population."
    ],
    "argsDown": [
      "Une mission du Sénat (2025) : Casa des pensions (0,3 %) et abattement des salaires comptés, l’écart réel n’est que de 0,43 point.",
      "Le COR (2025), cité par une mission du Sénat, observe que les retraités ont un niveau de vie légèrement inférieur à celui des actifs."
    ],
    "sources": []
  },
  "csg-remplacement": {
    "what": "Revenus qui remplacent un salaire : retraites, pensions d’invalidité, indemnités journalières, allocations chômage. Leur CSG va de 0 à 8,3 % selon le revenu et sa nature (6,2 % pour les indemnités journalières). Le levier bouge d’autant chaque taux non nul.",
    "who": "Payée d’abord par les retraités : 30,6 Md€ en 2027, dont 27,6 sur les retraites, le reste surtout sur l’invalidité, les indemnités journalières et le chômage (CCSS). Un point rapporte 3,2 à 4,0 Md€. Les exonérés le restent.",
    "up": "+1 point : 3,2 à 4,0 Md€ de recettes en plus. Sur une retraite médiane soumise à la CSG, 1 639 € brut par mois (IPP), environ 16 € de CSG en plus chaque mois.",
    "down": "−1 point : 3,2 à 4,0 Md€ de recettes en moins. Sur une retraite médiane soumise à la CSG, 1 639 € brut par mois (IPP), environ 16 € de CSG en moins chaque mois.",
    "argsUp": [
      "Selon le COR (2026), cité par l’IPP, le niveau de vie moyen des retraités est proche de celui de l’ensemble de la population.",
      "Une mission du Sénat (2025) note que « les retraités ne paient pas de cotisations sociales », hors une cotisation maladie (CCSS)."
    ],
    "argsDown": [
      "La CCSS (2026) note que le taux moyen de CSG des retraités a déjà monté en 2026, les seuils ayant moins augmenté que les pensions.",
      "Pour l’IPP (2026), aligner les taux médian et plein sur 9,2 % pèserait surtout sur les retraités des classes moyennes."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale : rapport à la Commission des comptes de la Sécurité sociale, octobre 2026, fiche 1.3 « La CSG », tableau 1 « Rendement de la CSG par assiette, tous affectataires » (p. 55)",
        "publisher": "Commission des comptes de la Sécurité sociale (direction de la sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "CSG et CRDS sur les revenus d’activité et de remplacement (indemnités journalières, allocations chômage)",
        "publisher": "Direction de l’information légale et administrative (Service-public.fr)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2971",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Note IPP n° 129 : Comment mettre à contribution les retraités pour le redressement des finances publiques ? (p. 5)",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2026/09/Note_contribution_retraites_129.pdf",
        "date": "2026-09",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "cultes-alsace-moselle-emplois": {
    "what": "En Alsace-Moselle (Bas-Rhin, Haut-Rhin, Moselle), la loi de 1905 sur la séparation des Églises et de l’État ne s’applique pas : l’État paie des ministres des cultes catholique, protestants et juif. Ce levier règle le nombre de ces emplois.",
    "who": "1 141 emplois payés par l’État en 2027, pour 26 354 € de paie brute moyenne par an, soit environ 30 M€ (calcul sur le PAP 2027), hors cotisations et pensions. Quatre cultes : catholique, luthérien, calviniste, juif.",
    "up": "+50 % : environ 570 emplois de plus, 0,013 à 0,016 Md€ de dépense en plus. Doubler ces emplois (+100 %) : 0,026 à 0,031 Md€ de plus (bas au coût d’un entrant, haut au coût moyen).",
    "down": "−50 % : environ 570 emplois de moins, 0,013 à 0,016 Md€ de dépense en moins. Supprimer ces emplois au 1er janvier 2027 (−100 %) : 0,026 à 0,031 Md€ de dépense en moins.",
    "argsUp": [
      "Pour le garder : le Conseil constitutionnel (2013) a jugé la paie des pasteurs conforme, la Constitution n’ayant pas entendu l’abolir.",
      "Pour le garder : selon une mission du Sénat (2016), ce régime, maintenu après 1918 par attachement local, favorise le dialogue État-cultes."
    ],
    "argsDown": [
      "Ailleurs en France, la République « ne salarie » aucun culte (loi de 1905) ; le Conseil constitutionnel y voit une suite de la laïcité.",
      "L’islam, implanté après ce régime, n’en bénéficie pas (Sénat, 2016) : une inégalité que lèverait la fin du régime ou son extension."
    ],
    "sources": [
      {
        "title": "Décision n° 2012-297 QPC du 21 février 2013, Association pour la promotion et l’expansion de la laïcité [Traitement des pasteurs des églises consistoriales dans les départements du Bas-Rhin, du Haut-Rhin et de la Moselle]",
        "publisher": "Conseil constitutionnel",
        "url": "https://www.conseil-constitutionnel.fr/decision/2013/2012297QPC.htm",
        "date": "2013-02-21",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 757 (2015-2016) : De l’Islam en France à un Islam de France, établir la transparence et lever les ambiguïtés",
        "publisher": "Sénat, mission d’information sur l’organisation, la place et le financement de l’Islam en France",
        "url": "https://www.senat.fr/rap/r15-757/r15-757_mono.html",
        "date": "2016-07-05",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "cvae-taux": {
    "what": "La CVAE (cotisation sur la valeur ajoutée des entreprises) taxe ce qu’une entreprise produit moins ce qu’elle achète, salaires non déduits. Son taux monte avec le chiffre d’affaires, de 0 à 0,28 %. La loi prévoit sa fin en 2030.",
    "who": "Les entreprises de plus de 500 000 € de chiffre d’affaires : 4,11 Md€ en 2027. Les grandes et celles de taille intermédiaire en payaient 82 % en 2020, l’industrie un quart en 2022. Le produit va à l’État depuis 2023.",
    "up": "+25 % de tous les taux : 0,7 à 1,1 Md€ de recettes en plus en 2027, soit 700 € de plus par million d’euros de valeur ajoutée au taux maximal (2 800 € aujourd’hui).",
    "down": "−25 % de tous les taux : 0,7 à 1,1 Md€ de recettes en moins en 2027, soit 700 € de moins par million d’euros de valeur ajoutée au taux maximal (2 800 € aujourd’hui).",
    "argsUp": [
      "Le CPO (2025) suggère de supprimer la C3S avant la CVAE, d’une « plus grande neutralité fiscale par rapport à la structure de production ».",
      "La commission des finances du Sénat (2024) a soutenu le report de sa suppression : le déficit interdit selon elle des baisses non financées."
    ],
    "argsDown": [
      "Le CAE (2019, taux maximal alors à 1,5 %) : en taxant les amortissements, elle « affecte directement les capacités d’investissement ».",
      "Le CPO (2025) la juge « défavorable aux entreprises industrielles » ; seule l’Italie a un impôt comparable en Europe (Sénat, 2026)."
    ],
    "sources": [
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française, synthèse (p. 8) et chapitre 4 (p. 126)",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf",
        "date": "2025-09",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "defense": {
    "what": "Les crédits de la mission Défense : salaires des militaires et des civils des armées, achat et entretien des équipements (avions, navires, munitions), renseignement. 63,4 Md€ en 2027 hors pensions, réglés ici en points de PIB.",
    "who": "Reçoivent : les 265 000 agents du ministère des Armées et les entreprises qui équipent les forces (27 Md€ d’équipement en 2027). Les crédits viennent du budget de l’État.",
    "up": "+0,1 point de PIB : 3,2 Md€ de dépense en plus en 2027, environ 5 % de la mission, au-dessus de la trajectoire de la loi du 16 août 2026, qui prévoit 3,3 Md€ de plus pour 2027.",
    "down": "−0,1 point de PIB : 3,2 Md€ de dépense en moins en 2027, environ 5 % de la mission, en dessous de la trajectoire de la loi du 16 août 2026, qui prévoit 3,3 Md€ de plus pour 2027.",
    "argsUp": [
      "Affaires étrangères : à La Haye en 2025, les Alliés de l’OTAN, dont la France, ont visé au moins 3,5 % du PIB pour la défense d’ici 2035.",
      "Loi du 16 août 2026 : réarmer pour « être prêts à répondre à un engagement majeur », en tirant les leçons de la guerre en Ukraine."
    ],
    "argsDown": [
      "HCFP : les économies prévues pour 2027 ne suffisent pas à contenir la hausse des crédits militaires (+6,5 Md€), des intérêts et de l’UE.",
      "Cour des comptes (2026) : réduire les paiements reportés (8,1 Md€) tient plus aux crédits en hausse qu’à « un réel effort de maîtrise »."
    ],
    "sources": [
      {
        "title": "L’Alliance atlantique : le cadre de sécurité UE-OTAN",
        "publisher": "Ministère de l’Europe et des Affaires étrangères",
        "url": "https://www.diplomatie.gouv.fr/fr/le-ministere-en-action/promouvoir-une-europe-souveraine/l-europe-de-la-defense/l-alliance-atlantique-le-cadre-de-securite-ue-otan",
        "date": "2026-07-08",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi actualisant la programmation militaire pour les années 2024 à 2030, texte définitif adopté le 1er juillet 2026 (TA n° 325), rapport annexé (p. 91-92) ; promulgué loi n° 2026-791 du 16 août 2026",
        "publisher": "Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17t0325_texte-adopte-seance.pdf",
        "date": "2026-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense (avril 2026), synthèse (p. 7)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-allocation-soutien-familial": {
    "what": "Une aide de la CAF pour élever un enfant privé de l’un de ses parents ou des deux : parent seul sans pension alimentaire ou avec une pension trop faible, enfant recueilli. Jusqu’à 200,78 € par enfant et par mois (267,63 € s’il est recueilli), gelés en 2027.",
    "who": "Environ 3,6 Md€ en 2027, versés par la CAF, surtout à des familles monoparentales modestes : 38 % vont aux 10 % les plus modestes avant impôts et prestations, 81 % aux 40 % du bas (IGF-IGAS).",
    "up": "+10 % : environ 20 € de plus par enfant et par mois au taux plein, soit environ 0,37 Md€ de dépense en plus en 2027.",
    "down": "−10 % : environ 20 € de moins par enfant et par mois au taux plein, soit environ 0,37 Md€ de dépense en moins en 2027.",
    "argsUp": [
      "DREES (2025, citée par l’IGF-IGAS) : la hausse de 50 % de l’ASF fin 2022 a fait baisser la pauvreté des familles monoparentales.",
      "IGF-IGAS (2026) : en 2021, 22,7 % des familles monoparentales à un enfant et 38,6 % des autres étaient pauvres, contre 14,5 % en moyenne."
    ],
    "argsDown": [
      "IGF-IGAS (2026) : autre voie, relever les pensions alimentaires fixées par les juges : 310 M€ de dépense en moins à terme, surtout d’ASF.",
      "IGF-IGAS (2026) : sans condition de revenus, la hausse de 2022 a valu +17 € aux 20 % de parents seuls les plus aisés, +25 € aux 20 % du bas."
    ],
    "sources": [
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe V, 2.2.2.1 (p. 248 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-allocations-familiales": {
    "what": "Les allocations familiales : versées chaque mois par la CAF dès le 2e enfant de moins de 20 ans. Depuis 2015, leur montant est divisé par 2 ou par 4 au-dessus de certains revenus. Le PLFSS 2027 les gèle au niveau de 2026.",
    "who": "Environ 13,2 Md€ en 2027 pour les familles d’au moins deux enfants. Pour deux enfants : 152,25 € par mois sous 79 980 € de revenus, 76,13 € jusqu’à 106 604 €, 38,07 € au-delà.",
    "up": "+10 % : environ 15 € de plus par mois pour deux enfants (taux plein), 35 € pour trois ; environ 1,4 Md€ de dépense en plus en 2027.",
    "down": "−10 % : environ 15 € de moins par mois pour deux enfants (taux plein), 35 € pour trois ; environ 1,4 Md€ de dépense en moins en 2027.",
    "argsUp": [
      "IGF-IGAS (2026) : l’aide à toutes les familles, au nom de l’universalité, rapproche leur niveau de vie de celui des ménages sans enfant.",
      "IGF-IGAS (2026) : vu leur masse, elles réduisent nettement les écarts de revenus, même si elles ne ciblent pas les seules familles modestes."
    ],
    "argsDown": [
      "IGF-IGAS (2026) : sur les naissances et l’emploi des femmes, accueil des enfants et congés de naissance bien payés pèsent plus que l’argent.",
      "IGF-IGAS (2026) : autre voie, baisser de 20 % les seuils des 2e et 3e tranches : 530 M€ de dépense en moins, sur les hauts revenus."
    ],
    "sources": [
      {
        "title": "Allocations familiales (famille de 2 enfants ou plus)",
        "publisher": "Service-Public (Direction de l’information légale et administrative, Premier ministre)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F13213",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), rapport, 2.3 (p. 31 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-assurance-chomage-allocations": {
    "what": "Les allocations chômage (ARE) et aides à la reprise d’emploi que verse l’Unédic aux personnes qui ont perdu leur emploi après avoir assez travaillé : de 6 à 18 mois de droits, jusqu’à 27 mois pour les plus âgés. 38,7 Md€ prévus en 2027.",
    "who": "Environ 2,6 millions de personnes indemnisées, payées par l’Unédic : en moyenne environ 1 240 € brut par mois et par personne, aides comprises (calcul). Le levier joue sur le montant ou la durée.",
    "up": "+10 % : 3,9 Md€ de dépense en plus en année pleine (en montant : environ 124 € brut de plus par mois et par personne) ; une règle nouvelle touche d’abord les nouveaux inscrits, donc moins en 2027.",
    "down": "−10 % : 3,9 Md€ de dépense en moins en année pleine (en montant : environ 124 € brut de moins par mois et par personne) ; une règle nouvelle touche d’abord les nouveaux inscrits, donc moins en 2027.",
    "argsUp": [
      "Unédic (2025) : de mars 2023 à mars 2025, les fins de droit passent de 41 000 à 70 000 ; relais par l’ASS : 20 % mi-2025, 13 % mi-2022.",
      "Unédic (2025) : baisser l’allocation (2019-2021) n’a hâté que l’emploi de moins de 6 mois, « via des concessions sur la qualité »."
    ],
    "argsDown": [
      "Cour des comptes (2026) : en zone euro, des pays ayant réduit leur déficit ont pu soutenir l’emploi par des réformes de l’assurance chômage.",
      "Unédic (2025) : baisser jusqu’à 30 % les hautes allocations (2019-2021) a hâté la reprise d’emploi, d’autant plus que la baisse était forte."
    ],
    "sources": [
      {
        "title": "Réforme 2023 : premiers effets de la réforme de contracyclicité (analyse, décembre 2025)",
        "publisher": "Unédic (gestionnaire de l’assurance chômage)",
        "url": "https://www.unedic.org/publications/reforme-2023-premiers-effets-de-la-reforme-de-contracyclicite",
        "date": "2025-12-18",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Réforme 2019-2021 : principaux enseignements de l’évaluation, synthèse (mars 2025), p. 2",
        "publisher": "Unédic (gestionnaire de l’assurance chômage)",
        "url": "https://www.unedic.org/storage/uploads/2025/07/01/Synthese-Principaux-enseignements-de-l-evaluation_uid_68639c1553b33.pdf",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Évaluation de la dégressivité des allocations les plus élevées, synthèse (mars 2025), p. 1-2",
        "publisher": "Unédic (gestionnaire de l’assurance chômage)",
        "url": "https://www.unedic.org/storage/uploads/2025/03/19/Synthese-Evaluation-de-la-degressivite-des-allocations-les-plus-elevees_uid_67db34f477b9d.pdf",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La situation et les perspectives des finances publiques, synthèse du rapport (juin 2026), enseignements des consolidations en zone euro (p. 20)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-07/20260625_synthese-RSPFP-2026.pdf",
        "date": "2026-06-25",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-complement-mode-de-garde": {
    "what": "Une aide de la CAF pour faire garder un enfant de moins de 6 ans : en emploi direct (assistante maternelle, garde à domicile ; jusqu’à 12 ans pour un parent seul), une part du salaire et des cotisations, à l’heure depuis 2025 ; un forfait en micro-crèche.",
    "who": "7,7 Md€ prévus en 2027 avant le gel : 6,0 Md€ pour une assistante maternelle (dont 3,5 Md€ de cotisations, prises en charge à 100 %), 1,2 en micro-crèche, 0,5 à domicile ; surtout aux revenus moyens (IGF-IGAS, 2024).",
    "up": "+10 % : 0,77 Md€ de dépense en plus en 2027, sur la part hors cotisations d’assistante maternelle (+18 %) : environ 64 € de plus par mois sur l’aide moyenne de 352 €, donc moins de reste à charge.",
    "down": "−10 % : 0,77 Md€ de dépense en moins en 2027, sur la part hors cotisations d’assistante maternelle (−18 %) : environ 64 € de moins par mois sur l’aide moyenne de 352 €, donc plus de reste à charge.",
    "argsUp": [
      "IGF-IGAS (2026) : avant 2025, une assistante maternelle à temps plein coûtait 9 à 11 % des revenus d’un foyer au Smic : un frein au recours.",
      "Cour des comptes (2024) : fin 2022, ni place ni aide pour 29 % des parents d’enfants de moins de 3 ans ; moins d’assistantes maternelles."
    ],
    "argsDown": [
      "IGF-IGAS (2026) : l’aide à l’heure peut faire monter les tarifs des assistantes maternelles et les heures prises par les plus aisés.",
      "IGF-IGAS (2026) : les besoins sont forts avant 3 ans ; diviser par deux le CMG des 3-6 ans hors temps scolaire : 75 M€ de dépense en moins."
    ],
    "sources": [
      {
        "title": "Complément de libre choix de mode de garde (CMG) : emploi direct",
        "publisher": "Service-Public (Direction de l’information légale et administrative, Premier ministre)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F39152",
        "date": "2026-06-26",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe VII, encadré 10 (p. 383-384 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La politique d’accueil du jeune enfant, évaluation de politique publique (décembre 2024), synthèse (p. 11)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-12/20241212-La-politique-daccueil-du-jeune-enfant.pdf",
        "date": "2024-12-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-conge-naissance": {
    "what": "Depuis le 1er juillet 2026, chaque parent d’un enfant né ou adopté peut prendre, en plus des congés maternité et paternité, 1 ou 2 mois de congé payés par la Sécurité sociale : 70 % du salaire net le premier mois, 60 % le second, sous un plafond.",
    "who": "Les parents d’un nouveau-né (645 000 naissances en 2025) qui prennent ce congé. Coût en 2027 : 300 M€ de prestations, 400 M€ remboursés par la branche famille (CNAF), soit 465 à 620 € par naissance (calcul).",
    "up": "+10 % : 30 à 40 M€ de plus si autant de parents le prennent, par exemple 77 % puis 66 % au lieu de 70 % puis 60 % : +140 € le premier mois, +120 € le second pour 2 000 € net par mois (calcul).",
    "down": "−10 % : 30 à 40 M€ de moins si autant de parents le prennent, par exemple 63 % puis 54 % au lieu de 70 % puis 60 % : −140 € le premier mois, −120 € le second pour 2 000 € net par mois (calcul).",
    "argsUp": [
      "Dans des enquêtes (IGF-IGAS), congés de naissance bien payés et crèches sont les aides jugées les plus propices aux projets d’enfant.",
      "Un mois de congé maternité ou paternité en plus réduirait de 3 % les besoins d’accueil des jeunes enfants (IGF-IGAS, à titre illustratif)."
    ],
    "argsDown": [
      "Les dépenses familiales ont crû de 4,5 % par an en moyenne depuis 2021 malgré moins de naissances ; l’IGF-IGAS appelle à les prioriser.",
      "Aucune analyse coût-bénéfice ne pèse ces congés (places de garde évitées, désorganisation des entreprises), à la connaissance de l’IGF-IGAS."
    ],
    "sources": [
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (rapport IGF n° 2026-E-006-03, IGAS n° 2026-016R), annexe VII (p. 334 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-fiscale-heures-supplementaires": {
    "what": "Les heures au-delà de la durée légale sont payées avec une majoration. Cette paie est exonérée d’impôt sur le revenu jusqu’à 7 500 € par an et de cotisations retraite du salarié (dans la limite de 11,31 %) ; l’employeur déduit 0,5 à 1,5 € par heure.",
    "who": "Salariés : 2,27 Md€ d’impôt et 2,44 Md€ de cotisations en moins ; employeurs : 0,98 Md€ (l’État compense les cotisations). Sur 1 000 € bruts d’heures, jusqu’à 113 € de cotisations en moins, plus l’impôt (calcul).",
    "up": "+10 % : 0,57 Md€ d’exonérations en plus, sans dessin précis : les salariés gardent plus de cette paie ou les employeurs la paient moins cher. +25 % : 1,5 Md€ (calcul, volume d’heures inchangé).",
    "down": "−10 % : 0,57 Md€ d’exonérations en moins, sans dessin précis : les salariés gardent moins de cette paie ou les employeurs la paient plus cher. −25 % : 1,5 Md€ (calcul, volume d’heures inchangé).",
    "argsUp": [
      "Le salarié gagne plus net sur chaque heure supplémentaire ; l’employeur paie moins cher la majoration lors d’un pic d’activité (PAP 2027).",
      "La mesure est favorable à l’activité, car elle augmente le PIB potentiel (la production possible à terme), note la mission du Sénat (2025)."
    ],
    "argsDown": [
      "Selon des études citées par le CPO, l’exonération accroît peu le total des heures ; il propose de la supprimer pour baisser la C3S (2025).",
      "Pour le CAE (2025), le problème est le taux d’emploi, pas les heures des actifs : centrer le débat sur ces heures lui semble peu pertinent."
    ],
    "sources": [
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (septembre 2025), p. 127-128",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf",
        "date": "2025-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Sécurité sociale : la boîte à outils du Sénat, rapport d’information n° 901 (2024-2025) de la mission d’évaluation et de contrôle de la sécurité sociale, encadré « Les niches sociales relatives aux heures supplémentaires » et note 383",
        "publisher": "Sénat, commission des affaires sociales",
        "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
        "date": "2025-09-23",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "depense-prepare": {
    "what": "La PreParE est une allocation versée au parent qui arrête ou réduit son travail pour garder son enfant de moins de 3 ans : 459,70 € par mois s’il arrête, moins à temps partiel. Durée : 6 mois par parent pour un premier enfant, jusqu’à 24 mois ensuite.",
    "who": "Environ 410 000 ménages en 2023, 1 965 € par an en moyenne (enquête ERFS, IGF-IGAS) ; les mères aux salaires les plus faibles sont les plus nombreuses à la prendre. Coût en 2027 avec le gel : environ 641 M€ (calcul).",
    "up": "+10 % : environ +46 € par mois pour un parent qui arrête de travailler (459,70 €), +30 € à mi-temps, soit 0,065 Md€ de plus, si autant de parents la demandent ; +25 % : 0,17 Md€ (calcul).",
    "down": "−10 % : environ −46 € par mois pour un parent qui arrête de travailler, −30 € à mi-temps, soit 0,065 Md€ de moins, si autant de parents la demandent ; −25 % : 0,17 Md€ (calcul).",
    "argsUp": [
      "Hors maternité et paternité, la France est parmi les pays d’Europe aux congés parentaux les moins bien payés (IGF-IGAS, 2026).",
      "L’enfant profite de premiers mois avec ses parents, surtout les deux, puis d’un mode d’accueil dès un an au moins (études, IGF-IGAS)."
    ],
    "argsDown": [
      "Long, ce congé peut nuire à l’emploi des mères : 38 % des bénéficiaires à taux plein étaient à temps plein avant, 25 % après (IGF-IGAS).",
      "Depuis 2015, le congé payé des mères est plus court ; plus y renoncent, et elles gagnent 8 % de plus deux ans après la naissance (IGF-IGAS)."
    ],
    "sources": [
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (rapport IGF n° 2026-E-006-03, IGAS n° 2026-016R), annexe VII, tableaux 2 et 3 et graphique 13 (p. 334 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "dmtg-tranche-20": {
    "what": "Les droits de succession et de donation sont payés par ceux qui reçoivent. Un enfant ne paie rien sur les 100 000 € reçus de chaque parent ; au-delà, l’impôt monte par tranches. La part entre 15 932 € et 552 324 € après cet abattement est taxée à 20 %.",
    "who": "Les enfants qui reçoivent d’un parent plus de 115 932 € ; en 2022, 47 % des successions déclarées ont payé des droits (CPO). Pour 300 000 € d’un parent : 38 194 € ; un point vaut au plus 5 364 € par parent (calcul).",
    "up": "+1 point (21 %) : 0,20 à 0,24 Md€ de plus ; +5 points (25 %) : 1,0 à 1,2 Md€ (miroir de la baisse chiffrée par le CPO, comportements inchangés). Pour 300 000 € d’un parent, 1 841 € de plus par point.",
    "down": "−1 point (19 %) : 0,20 à 0,24 Md€ de moins ; −5 points (15 %) : 1,0 à 1,2 Md€ (le CPO chiffre 0,2 et 1,2 Md€). Pour 300 000 € d’un parent, 1 841 € de moins par point (calcul sur le barème).",
    "argsUp": [
      "L’héritage pèse de plus en plus : 60 % du patrimoine total, contre 35 % au début des années 1970, selon le CAE (2021).",
      "En ligne directe, le taux effectif des droits était d’environ 3 % en 2016 ; plus d’un tiers des sondés le croyaient au-dessus de 20 % (CPO)."
    ],
    "argsDown": [
      "Selon le CAE (2021), ces droits pèsent assez fort sur les « classes moyennes supérieures », ce qui nuit à leur acceptation.",
      "La France en tire plus que tout pays de l’OCDE (0,7 point de PIB) ; le CPO recommande d’alléger le barème en élargissant l’assiette."
    ],
    "sources": [
      {
        "title": "Repenser l’héritage, Les notes du conseil d’analyse économique n° 69 (décembre 2021), p. 2 et 6",
        "publisher": "Conseil d’analyse économique",
        "url": "https://cae-eco.fr/static/pdf/cae-note069.pdf",
        "date": "2021-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "dmtg-tranche-45": {
    "what": "Les droits de succession et de donation montent par tranches. Pour un enfant, après 100 000 € d’abattement par parent, la part au-delà de 1 805 677 € est taxée à 45 %, le taux le plus haut en ligne directe. Pour 3 M€ reçus d’un parent : 1 067 394 € (calcul).",
    "who": "Les enfants qui reçoivent d’un même parent plus de 1 905 677 € : environ 0,1 % des héritages dépassent 2 M€ (France Stratégie, cité par le CPO). Un point vaut environ 20 M€, dans un sens comme dans l’autre.",
    "up": "+5 points (50 %) : environ 0,1 Md€ de plus ; +10 points (55 %) : environ 0,2 Md€ (miroir de la baisse chiffrée par le CPO, comportements inchangés). Pour 3 M€ d’un parent, 10 943 € de plus par point.",
    "down": "−5 points (40 %) : environ 0,1 Md€ de moins ; −10 points (35 %) : environ 0,2 Md€ (CPO). Pour 3 M€ d’un parent, 10 943 € de moins par point (calcul sur le barème).",
    "argsUp": [
      "Le 0,1 % des héritiers les mieux dotés reçoit en moyenne, sur sa vie, environ 13 M€, 180 fois l’héritage médian (CAE, 2021).",
      "Avec les exonérations, ce 0,1 % ne paie qu’à peine 10 % de droits sur ce qu’il hérite, loin des 45 % affichés au barème (CAE, 2021)."
    ],
    "argsDown": [
      "Les taux maximaux français sont élevés en comparaison internationale (CAE, 2021) ; le CPO (2025) chiffre une baisse à 40 ou 35 %.",
      "Pour le CPO (2025), des taux plus bas rendraient plus acceptable un impôt contesté, la perte étant compensée par une assiette plus large."
    ],
    "sources": [
      {
        "title": "Repenser l’héritage, Les notes du conseil d’analyse économique n° 69 (décembre 2021), p. 3 et 6",
        "publisher": "Conseil d’analyse économique",
        "url": "https://cae-eco.fr/static/pdf/cae-note069.pdf",
        "date": "2021-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "dutreil-exoneration": {
    "what": "Le pacte Dutreil allège les droits de donation ou de succession sur les parts d’une entreprise transmise : 75 % de leur valeur est exonérée, si les titres sont gardés 8 ans en tout et si un signataire du pacte dirige l’entreprise 3 ans après.",
    "who": "Les familles qui transmettent une entreprise : environ 5 000 pactes en 2024. L’avantage : 3,8 Md€ prévus en 2027 (ordre de grandeur). En 2024, 65 % allait à 1 % des bénéficiaires, soit 110 personnes (CPO).",
    "up": "+10 points (85 %) coûtent 0,50 à 0,52 Md€ par an (ordre de grandeur). À 100 %, plus rien n’est taxé (au lieu de 25 % de la valeur) : environ 1,3 Md€, estimation à comportements inchangés.",
    "down": "−10 points (65 %) rapportent 0,50 à 0,52 Md€ par an (ordre de grandeur). À 50 %, le taux de 2003, la part taxée double (de 25 % à 50 % de la valeur) : environ 1,3 Md€ (CPO), à comportements inchangés.",
    "argsUp": [
      "Cour des comptes (2025), via le CPO : avec le pacte, actionnariat plus stable, un peu moins de faillites ou de dissolutions en neuf ans.",
      "Sénat (2026) : 15 autres pays de l’OCDE allègent la transmission d’entreprise, souvent plus qu’en France ; deux taxent plus les plus-values."
    ],
    "argsDown": [
      "Cour des comptes (2025), via le CPO : avec ou sans pacte, pas de différence notable d’emploi ni d’investissement.",
      "CPO (2025), cas type : 50 M€ de titres donnés à un enfant ; avec le pacte et un démembrement, l’impôt passe de 44,4 % à 5,1 % de la valeur."
    ],
    "sources": []
  },
  "effectifs-publics": {
    "what": "Le nombre d’agents de l’État, de ses opérateurs, des collectivités et des hôpitaux, en plus ou en moins par rapport au « schéma d’emplois » du PLF 2027 (embauches moins départs) : +8 025 à l’État, dont 4 742 pour former les enseignants ; opérateurs −1 209.",
    "who": "Les agents publics, les usagers des services publics et les contribuables qui les financent. Salaires bruts des administrations publiques : 247,6 Md€ en 2025 (Insee) ; 10 000 emplois en font 0,11 à 0,16 %.",
    "up": "10 000 emplois de plus : de 0,28 à 0,41 Md€ par an en salaires bruts (28 000 à 41 000 € par emploi), créés dès janvier, hors cotisations patronales. Par concours, les embauches s’étalent.",
    "down": "10 000 emplois de moins : de 0,28 à 0,41 Md€ par an en salaires bruts (28 000 à 41 000 € par emploi), supprimés dès janvier, hors cotisations patronales. Par départs non remplacés, l’effet s’étale.",
    "argsUp": [
      "France Stratégie (2017) : près de 90 emplois publics pour 1 000 habitants, une « moyenne haute », bien en deçà des pays scandinaves.",
      "Cour des comptes (2021) : 11 juges pour 100 000 habitants en France, 21 en moyenne en Europe, une comparaison à prendre « avec prudence »."
    ],
    "argsDown": [
      "Cour des comptes (2015) : réduire les effectifs, « levier puissant » de maîtrise de la masse salariale, laisse de la marge aux salaires.",
      "France Stratégie (2017) : 89 emplois publics pour 1 000 habitants en 2015, bien au-dessus de la médiane des pays comparés (70)."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), exposé des motifs, emplois de l’État (p. 174)",
        "publisher": "Gouvernement (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
        "date": "2026-10-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Administrations publiques en 2025 (comptes nationaux annuels, base 2020), tableau 7.301 « Compte des administrations publiques (S13) »",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8988833",
        "date": "2026-08-28",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Comment la France se compare-t-elle en matière d’emploi public ? (note de synthèse du Tableau de bord de l’emploi public, p. 1)",
        "publisher": "France Stratégie (Haut-commissariat à la Stratégie et au Plan)",
        "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/2017%20SP/2017-12-21%20-%20Tableau%20de%20bord%20de%20l%E2%80%99emploi%20public/ns-emploi_public-22decembre2017-14h_0.pdf",
        "date": "2017-12-21",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Améliorer la gestion du service public de la justice (Les enjeux structurels pour la France, octobre 2021), p. 15",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2021-10/20211021-NS-Justice.pdf",
        "date": "2021-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "forfait-social-taux": {
    "what": "Le forfait social est une contribution payée par l’employeur sur des sommes versées aux salariés sans cotisations sociales : surtout l’intéressement, la participation et les abondements à l’épargne salariale. Le taux normal est de 20 %.",
    "who": "Les employeurs, surtout sur l’intéressement (dès 250 salariés), la participation et l’épargne salariale (dès 50), et les salariés qui reçoivent ces sommes. 6,8 Md€ prévus en 2027, versés à la Sécurité sociale.",
    "up": "Taux relevés de 10 % : 22 % au lieu de 20 % (220 € au lieu de 200 € sur 1 000 € d’intéressement), environ 676 M€ de plus par an. À +25 % : 25 % et 1,7 Md€. À sommes versées inchangées.",
    "down": "Taux baissés de 10 % : 18 % au lieu de 20 % (180 € au lieu de 200 € sur 1 000 € d’intéressement), environ 676 M€ de moins par an. À −25 % : 15 % et 1,7 Md€. À sommes versées inchangées.",
    "argsUp": [
      "Étude d’impact du PLFSS 2027 : ces régimes incitent les employeurs à verser ces sommes plutôt qu’un salaire soumis à cotisations.",
      "Cour des comptes (2024), via le Sénat : réduire les exemptions des compléments de salaire, en alignant les taux réduits sur 20 %."
    ],
    "argsDown": [
      "Étude d’impact du PLFSS 2027 : l’exemption sous 50 ou 250 salariés rend l’épargne salariale plus attractive à ces entreprises et salariés.",
      "Étude d’impact du PLFSS 2027 : des cotisations dès le 1er euro pèseraient sur le pouvoir d’achat des moins aisés et sur le coût du travail."
    ],
    "sources": [
      {
        "title": "PLFSS 2027, annexe 9 (évaluations préalables), article 7, tableau (p. 36)",
        "publisher": "Direction de la sécurité sociale (annexe au PLFSS 2027)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/annexe-9.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Sécurité sociale : la boîte à outils du Sénat, rapport d’information n° 901 (2024-2025)",
        "publisher": "Sénat, commission des affaires sociales (MECSS)",
        "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
        "date": "2025-09-23",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "france-services-espaces": {
    "what": "Les espaces France services sont des guichets d’aide aux démarches de douze administrations et organismes (impôts, CAF, retraite…). Chacun reçoit 50 000 € par an de l’État et de ces partenaires, 10 000 € de plus en zone France Ruralités Revitalisation.",
    "who": "Les usagers : près de 1,2 million de démarches par mois ; 58 % ont plus de 55 ans. Un espace coûte en moyenne 100 000 à 110 000 € par an ; le porteur (deux fois sur trois une collectivité) paie le reste.",
    "up": "200 espaces de plus : de 10 à 22 M€ par an. À la fréquentation moyenne, environ 1 million de démarches par an, soit de 10 à 22 € chacune, nouvelles ou venues d’un autre guichet.",
    "down": "200 espaces de moins : de 10 à 22 M€ d’économie par an. À la fréquentation moyenne, environ 1 million de démarches par an, soit de 10 à 22 € chacune, à faire à un autre guichet, ou pas du tout.",
    "argsUp": [
      "Cour des comptes (2024) : le réseau aide « incontestablement » à réduire les fractures territoriales ; 96,4 % de satisfaits (PAP 2027).",
      "Cour des comptes (2024) : certains espaces gèrent plus de 150 demandes par jour, au point de saturer."
    ],
    "argsDown": [
      "Cour des comptes (2024) : fréquentation inégale, certains espaces ne traitent qu’une ou deux demandes par jour.",
      "Cour des comptes (2024) : presque tous les espaces sont à moins de 30 minutes des usagers ; elle demande un développement soutenable."
    ],
    "sources": []
  },
  "ifi-bareme": {
    "what": "L’impôt sur la fortune immobilière (IFI) est dû chaque année par les foyers dont l’immobilier, net des dettes, dépasse 1,3 M€. Six tranches, jusqu’à 1,5 % au-delà de 10 M€ ; 30 % d’abattement sur la résidence principale. Il remplace l’ISF depuis 2018.",
    "who": "Environ 189 000 foyers en 2024 (Sénat, d’après la DGFiP). En 2023, 2,3 Md€ pour 175 980 foyers, environ 13 000 € par foyer en moyenne (CPO ; calcul Isoloir) ; 3,08 Md€ sont prévus en 2027.",
    "up": "Taux relevés de 10 % : environ 308 M€ de plus par an, un taux du haut à 1,65 % au lieu de 1,5 %, en moyenne 1 300 € de plus par foyer (niveau de 2023). À +25 % : 770 M€, taux du haut à 1,875 %.",
    "down": "Taux baissés de 10 % : environ 308 M€ de moins par an, un taux du haut à 1,35 % au lieu de 1,5 %, en moyenne 1 300 € de moins par foyer (niveau de 2023). À −25 % : 770 M€, taux du haut à 1,125 %.",
    "argsUp": [
      "CPO (2025), d’après l’Insee : la taxe foncière pèse 0,67 % de l’immobilier des plus petits patrimoines, 0,22 % du centième le plus doté.",
      "CPO (2025), d’après la DGFiP : de 2018 à 2021, environ 260 foyers soumis à l’IFI sont partis par an, moins qu’il n’en est revenu (380)."
    ],
    "argsDown": [
      "CPO (2025) : depuis 2018, seul l’immobilier est taxé chaque année sur sa valeur, d’où un écart d’imposition avec les placements financiers.",
      "CPO (2025) : en 2022, la détention et les mutations du patrimoine sont taxées à 3,7 % du PIB en France, 4e de l’OCDE (moyenne 1,8 %)."
    ],
    "sources": [
      {
        "title": "Rapport d’information n° 760 (2025-2026) sur l’imposition des hauts patrimoines, p. 41",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r25-760/r25-7601.pdf",
        "date": "2026-06-17",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Impôt sur la fortune immobilière (IFI) : personnes et biens concernés (vérifié le 6 mars 2026)",
        "publisher": "Service-public.fr (Dila, Premier ministre)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F563",
        "date": "2026-03-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "impot-societes": {
    "what": "L’impôt des sociétés sur leur bénéfice (recettes moins charges) : 25 % au taux normal (25,8 % avec la contribution sociale sur l’IS), 15 % pour les PME sur leurs premiers 42 500 €. Le levier change tous les taux du même pourcentage : +1 % porte 25 % à 25,25 %.",
    "who": "Les sociétés bénéficiaires : 1,5 million en 2022, sur 2,4 millions soumises à l’IS (étude Insee-DGFiP). L’État en attend 58,5 Md€ nets en 2027 (PLF). Exemple : une PME à 100 000 € de bénéfice doit 20 750 € d’IS.",
    "up": "+10 % (taux normal à 27,5 %) : 5,8 à 8,4 Md€ de plus ; 2 075 € pour cette PME, 10 M€ pour un groupe qui doit 100 M€ (calcul). À +25 % : 14,6 à 21,0 Md€, taux normal à 31,25 %, sous les 33,3 % de 2016.",
    "down": "−10 % (taux normal à 22,5 %) : 5,8 à 8,4 Md€ de moins ; 2 075 € pour cette PME, 10 M€ pour ce groupe (calcul). À −25 % : 14,6 à 21,0 Md€, taux normal à 18,75 %, au-dessus du minimum mondial de 15 %.",
    "argsUp": [
      "Selon une étude Insee-DGFiP, de 2016 à 2022 l’impôt rapporté au profit a reculé de 5 points pour les grandes entreprises, 1,7 pour les PME.",
      "Pour l’industrie, le CPO juge les impôts de production plus pénalisants que l’IS, qui repose sur le bénéfice : ils créent des distorsions."
    ],
    "argsDown": [
      "Le CPO avait recommandé en 2017 de baisser le taux pour la compétitivité : il est passé de 33,3 % en 2016 à 25 % en 2022.",
      "Selon le CPO, le taux français (25,8 %) dépasse la moyenne OCDE (23,9 %), et l’imposition des bénéfices peut influer sur les implantations."
    ],
    "sources": [
      {
        "title": "Analyse de mesures nouvelles en recettes des projets de lois financières pour 2027 (Les notes du CPO n° 14), § 4.1, p. 7",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-10/20261015-note-CPO-Analyse-mesures-PLF-2027.pdf",
        "date": "2026-10-15",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La réforme du taux statutaire de l’impôt sur les sociétés (document de travail Insee n° 2025-18), § 2 (p. 9) et conclusion (p. 49-51)",
        "publisher": "O. Arnal, U. Di Nallo, J.-P. Martin (économistes de l’Insee et de la DGFiP), document de travail publié avec le rapport du CPO sur l’industrie, qui n’engage que ses auteurs",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-reforme-taux-statutaire-impot-sur-les-societes.pdf",
        "date": "2025-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française, p. 55 (et note 53), 63, 67 et 80",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf",
        "date": "2025-09",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "indemnites-journalieres": {
    "what": "Quand un salarié est arrêté pour maladie, l’Assurance maladie lui verse, après 3 jours de carence, une indemnité par jour : 50 % de son salaire brut, dans la limite de 1,4 Smic (42,97 € par jour au plus). Le levier change ce taux de 50 %.",
    "who": "Les assurés du régime général en arrêt maladie, surtout des salariés : 12,7 Md€ prévus en 2027 (CCSS). Environ deux tiers des entreprises maintiennent le salaire malgré la carence (Sénat).",
    "up": "Chaque point de plus coûte 0,20 à 0,25 Md€. À 55 %, l’indemnité au plafond gagne 4,30 € par jour, 116 € sur 30 jours d’arrêt dont 27 payés (calcul). Si l’employeur maintient le salaire, il paie moins.",
    "down": "Chaque point de moins économise 0,20 à 0,25 Md€. À 45 %, l’indemnité au plafond perd 4,30 € par jour, 116 € sur 30 jours d’arrêt dont 27 payés (calcul), sauf si l’employeur compense, à ses frais.",
    "argsUp": [
      "Selon Service-public.fr, sans complément, l’indemnité vaut la moitié du salaire brut ; plafond abaissé de 1,8 à 1,4 Smic en avril 2025.",
      "Selon le Sénat, les arrêts d’au moins un mois font plus de 80 % de la dépense : une baisse du taux pèserait d’abord sur les arrêts longs."
    ],
    "argsDown": [
      "Selon le Sénat, la dépense a crû de 6,4 % l’an en 2019-2023, contre 2,9 % avant ; 1,5 point de l’écart vient de changements de comportement.",
      "La Cour des comptes (2024) a proposé de baisser de 5 points la prise en charge par l’Assurance maladie : 45 % du salaire au lieu de 50 %."
    ],
    "sources": [
      {
        "title": "Arrêt maladie : indemnités journalières versées au salarié",
        "publisher": "Direction de l’information légale et administrative (Service-public.fr, Premier ministre)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F3053",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ir-credits-reductions": {
    "what": "Des avantages qui remboursent une part de dépenses : emploi à domicile, garde d’enfants, dons… Une réduction ne baisse que l’impôt dû ; un crédit est versé même aux foyers non imposables. Le levier les réduit (rabot) ou les relève tous du même pourcentage.",
    "who": "Les foyers qui déclarent ces dépenses : 14,6 Md€ prévus en 2026 (Voies et moyens). En 2025 (Cour des comptes), crédit emploi à domicile : 7,0 Md€, 4,9 millions de foyers ; réduction pour dons : 2,2 Md€, 5,6 millions.",
    "up": "À +10 % (rabot de 10 %) : +1,1 Md€ (IPP, 0,11 Md€ par point) ; un foyer ayant 2 000 € de crédit pour 4 000 € d’emploi à domicile perd 200 € (calcul). Effet sur les dons et l’emploi déclaré non compté.",
    "down": "À −10 % (crédits et réductions relevés de 10 %) : −1,1 Md€ (0,11 Md€ par point) ; ce foyer reçoit 200 € de plus (calcul). Effet sur les dons et l’emploi déclaré non compté.",
    "argsUp": [
      "Selon la Cour des comptes, les dépenses fiscales restent 474 malgré l’objectif d’en supprimer ; celles de l’IR valent 46,4 % de son produit.",
      "Selon la Cour des comptes, citée par le CPO, un crédit emploi à domicile à 40 % au lieu de 50 % suffirait contre le travail non déclaré."
    ],
    "argsDown": [
      "Le CPO cite des études : 1 € d’avantage fiscal en plus accroît les dons de 0,3 à 0,9 € ; un rabot pèserait sur les dons aux associations.",
      "Un rabot uniforme touche des dépenses contraintes : le crédit pour la garde d’un enfant de moins de 6 ans profite à tous les revenus (CPO)."
    ],
    "sources": [
      {
        "title": "Analyse de l’exécution budgétaire 2025 : mission Dépenses fiscales (note d’exécution budgétaire), synthèse et p. 26-37",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Depenses-fiscales.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Conforter l’égalité des citoyens devant l’imposition des revenus, p. 104-108 et 114",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20241010-Conforter-egalite-des-citoyens-devant-imposition-des-revenus.pdf",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, tableau « Dépenses fiscales par impôt » (p. 16)",
        "publisher": "Direction de la législation fiscale (annexe au PLF 2026)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ir-indexation-bareme": {
    "what": "Chaque année, la loi relève les seuils des tranches du barème (11 600 €, 29 579 €…) comme les prix, pour qu’un revenu qui suit l’inflation ne paie pas plus d’impôt. Le PLF 2027 prévoit 2,1 % ; le levier relève moins (jusqu’au gel) ou plus (jusqu’à 4,2 %).",
    "who": "Les 18,5 millions de foyers imposés, sur 40,2 millions (CPO). Selon le sens, des foyers proches du seuil entrent dans l’impôt ou en sortent ; d’autres seuils (impôts locaux, contributions sociales) suivent le barème.",
    "up": "Chaque point de revalorisation en moins rapporte 1,3 à 2,0 Md€, 75 à 108 € par foyer imposé en moyenne (calcul). Le gel (+2,1 points) rapporte 2,8 à 4,2 Md€ (4,2 selon le PLF), 155 à 230 € par foyer.",
    "down": "Chaque point de revalorisation en plus coûte 1,3 à 2,0 Md€, 75 à 108 € de moins par foyer imposé en moyenne (calcul). À 4,2 % de revalorisation, le coût atteint 2,8 à 4,2 Md€, 155 à 230 € par foyer.",
    "argsUp": [
      "Selon l’IPP, l’indexation, pratique courante, n’est pas une règle légale, à la différence des retraites ; relever moins rapporte dès 2027.",
      "Selon l’IPP, un gel coûte 0,03 % de niveau de vie à la moitié la plus modeste, 0,15 % aux 40 % suivants, 0,19 % aux 10 % les plus aisés."
    ],
    "argsDown": [
      "Selon le Gouvernement (PLF), sans indexation l’impôt monte même si le niveau de vie stagne ou baisse, et des foyers deviennent imposables.",
      "Le Gouvernement note aussi que des seuils d’exonération des ménages modestes (impôts locaux, contributions sociales) suivent le barème."
    ],
    "sources": [
      {
        "title": "Conforter l’égalité des citoyens devant l’imposition des revenus, p. 24",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20241010-Conforter-egalite-des-citoyens-devant-imposition-des-revenus.pdf",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ir-taux-45": {
    "what": "Le taux le plus haut de l’impôt sur le revenu : 45 % sur la seule part du revenu au-delà de 185 737 € par part au PLF 2027 (181 917 € aujourd’hui) ; le reste garde les taux inférieurs. Avec la contribution sur les hauts revenus, le taux du haut atteint 49 %.",
    "who": "Peu de foyers : les tranches à 41 % et 45 % en réunissent environ 300 000, sur 40 millions de foyers fiscaux (rapport pour le CPO, revenus 2023).",
    "up": "Un point de plus rapporte 0,15 Md€ (IPP ; au-delà d’un point, estimation). Par point, un célibataire à 250 000 € de revenu imposable paie 643 € de plus par an, un couple à 500 000 €, 1 285 € (calcul).",
    "down": "Un point de moins coûte 0,15 Md€ (chiffrage de la hausse, en miroir ; au-delà d’un point, estimation). Par point, 643 € de moins pour ce célibataire, 1 285 € pour ce couple (calcul).",
    "argsUp": [
      "Selon l’IPP, un point de plus fait perdre au moins 1 % de niveau de vie à 0,02 % des ménages, et 0,19 % en moyenne au centième le plus aisé.",
      "Selon le CPO, de 2009 à 2021, 19 des 28 pays de l’Union ont relevé leur taux le plus haut, sans revenir au niveau de 1995."
    ],
    "argsDown": [
      "Selon le CPO, avec les prélèvements sociaux, le taux marginal des plus hauts revenus d’activité peut dépasser 56 %, niveau qu’il juge élevé.",
      "Selon le CPO, la concurrence fiscale sur les particuliers passe en large partie par la résidence ; le chiffrage statique ignore les départs."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2027 : article 2 et évaluations préalables des articles du projet de loi, article 2 (p. 10 et 13)",
        "publisher": "Gouvernement, direction de la législation fiscale (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La progressivité de l’imposition des revenus des personnes physiques, rapport particulier n° 2 au rapport « Conforter l’égalité des citoyens devant l’imposition des revenus », p. 83",
        "publisher": "F. Belkhir et M. Garrigue, rapport particulier publié par le Conseil des prélèvements obligatoires, établi sous la seule responsabilité des auteurs (il n’engage pas le CPO)",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-10/20241014-Note-Conforter-egalite-des-citoyens-devant-imposition-des-revenus-rapport-particulier2.pdf",
        "date": "2024-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Conforter l’égalité des citoyens devant l’imposition des revenus, p. 26-27 et 129",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20241010-Conforter-egalite-des-citoyens-devant-imposition-des-revenus.pdf",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ir-taux-bareme": {
    "what": "L’impôt sur le revenu se calcule par tranches : rien jusqu’à 11 844 € de revenu imposable par part, puis 11 %, 30 %, 41 % et 45 % sur chaque tranche suivante (barème 2027 du PLF). Le levier déplace les quatre taux d’autant de points.",
    "who": "Paient : 18,5 millions de foyers imposés sur 40,2 millions (CPO, revenus 2023). Les 21,7 millions de foyers non imposés ne sont presque pas touchés, dans un sens comme dans l’autre. Recette 2027 : 102,5 Md€.",
    "up": "+1 point (12, 31, 42 et 46 %) : +6,4 Md€, soit environ 350 € de plus par an en moyenne par foyer imposé ; un célibataire à 40 000 € de revenu imposable paierait environ 280 € de plus (calcul).",
    "down": "−1 point (10, 29, 40 et 44 %) : −6,4 Md€, soit environ 350 € de moins par an en moyenne par foyer imposé ; un célibataire à 40 000 € de revenu imposable paierait environ 280 € de moins (calcul).",
    "argsUp": [
      "IPP : hausse très progressive : quasi nulle pour les 30 % les moins aisés, jusqu’à −0,9 % de niveau de vie pour les 2 % les plus aisés.",
      "CPO : impôt sur le revenu et CSG : 9,5 % du PIB en 2021, un peu au-dessus de l’OCDE (8,3 %), mais sous l’Allemagne, la Belgique et l’Italie."
    ],
    "argsDown": [
      "CPO : de 2010 à 2023, la hausse des prélèvements obligatoires (+1,8 point de PIB) a porté sur l’imposition des revenus.",
      "CPO : taux marginaux cumulés jusqu’à 60 % sur les salaires ; Fipeco et CPO : des taux élevés peuvent pousser à s’expatrier."
    ],
    "sources": [
      {
        "title": "Conforter l’égalité des citoyens devant l’imposition des revenus (rapport, octobre 2024), p. 35 du PDF",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20241010-Conforter-egalite-des-citoyens-devant-imposition-des-revenus.pdf",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "L’impôt sur le revenu et la CSG (fiche de l’encyclopédie, 1er juin 2026)",
        "publisher": "Fipeco",
        "url": "https://www.fipeco.fr/fiche/Limp%C3%B4t-sur-le-revenu-et-la-CSG",
        "date": "2026-06-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Budget 2027 : dossier de presse du PLF et du PLFSS pour 2027, tableau « Solde général du budget de l’État », p. 55 du PDF",
        "publisher": "Ministères économiques et financiers et ministères sociaux (Direction du budget, Direction de la sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), article 2 : barème de l’impôt sur le revenu, p. 33 du PDF",
        "publisher": "Gouvernement, Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
        "date": "2026-10-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ir-tranches-hautes": {
    "what": "Le barème taxe chaque tranche à un taux qui monte : 41 % de 86 353 à 185 737 € de revenu imposable par part, 45 % au-delà (PLF 2027). Le levier ne bouge que ces deux taux : sous 86 353 € par part, rien ne change, sauf plafonnement du quotient familial.",
    "who": "Paient : environ 300 000 foyers, 1 % des foyers, ceux dont le revenu atteint la tranche à 41 % (CPO, revenus 2023) ; le levier ne touche pas les autres, dans un sens comme dans l’autre.",
    "up": "+1 point (42 et 46 %) : +0,45 Md€, soit environ 1 500 € de plus par an en moyenne par foyer concerné ; un célibataire à 120 000 € de revenu imposable paierait 336 € de plus (calcul).",
    "down": "−1 point (40 et 44 %) : −0,45 Md€, soit environ 1 500 € de moins par an en moyenne par foyer concerné ; un célibataire à 120 000 € de revenu imposable paierait 336 € de moins (calcul).",
    "argsUp": [
      "IPP : la hausse est très ciblée : 0,1 % des ménages perdraient au moins 1 % de niveau de vie ; le centième le plus aisé, 0,47 % en moyenne.",
      "CPO : taux le plus haut (49 %, contribution sur les hauts revenus incluse) atteint à 14 salaires moyens ; en Europe, généralement 1 à 5."
    ],
    "argsDown": [
      "CPO : au sommet, impôt sur le revenu et prélèvements sociaux peuvent dépasser 56 % à la marge sur les revenus d’activité.",
      "CPO : de trop grands écarts d’impôt entre travail et capital poussent des dirigeants à se payer en dividendes plutôt qu’en salaire."
    ],
    "sources": [
      {
        "title": "Conforter l’égalité des citoyens devant l’imposition des revenus (rapport, octobre 2024), p. 37 du PDF",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20241010-Conforter-egalite-des-citoyens-devant-imposition-des-revenus.pdf",
        "date": "2024-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), article 2 : barème de l’impôt sur le revenu, p. 34 du PDF",
        "publisher": "Gouvernement, Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
        "date": "2026-10-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "minima-sociaux-revalorisation": {
    "what": "Les minima sociaux garantissent un revenu plancher sous conditions de ressources : RSA, allocation aux adultes handicapés (AAH) et minimum vieillesse (Aspa). La loi les relève chaque année comme les prix ; le levier ajoute ou retire des points.",
    "who": "Reçoivent : 1,85 million d’allocataires du RSA, 1,35 million de l’AAH, 723 000 du minimum vieillesse (DREES, fin 2023). Paient : surtout les départements (RSA), l’État (AAH, 15,5 Md€), l’assurance vieillesse (Aspa).",
    "up": "+1 point : +6,5 € par mois sur un RSA de personne seule, +10,4 € sur une AAH ou une Aspa d’environ 1 040 € (calcul). RSA et AAH changent au 1er avril : 9 mois comptent en 2027 : 0,23 à 0,27 Md€.",
    "down": "−1 point : −6,5 € par mois sur un RSA de personne seule, −10,4 € sur une AAH ou une Aspa d’environ 1 040 € (calcul). RSA et AAH changent au 1er avril : 9 mois comptent en 2027 : 0,23 à 0,27 Md€.",
    "argsUp": [
      "IPP : geler les prestations sous conditions de ressources est « largement régressif » : la perte touche d’abord les ménages modestes.",
      "PAP 2027 : de 2017 à 2026, l’AAH a été relevée au-delà des prix « afin de lutter contre la pauvreté » des personnes handicapées."
    ],
    "argsDown": [
      "PAP 2027 : même sans mesure, le coût de l’AAH monte de 4,5 % en 2027, surtout par la hausse du nombre de bénéficiaires (+3,5 % par an).",
      "Cour des comptes : l’inflation de 2026, plus forte que prévu, alourdit de 1,7 Md€ en 2027 la revalorisation légale des prestations sociales."
    ],
    "sources": [
      {
        "title": "Minima sociaux et prestations de solidarité, édition 2025, fiche 07 « Les dépenses d’allocations », p. 2 du PDF",
        "publisher": "DREES",
        "url": "https://www.drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2007%20-%20Les%20d%C3%A9penses%20d%27allocations.pdf",
        "date": "2025-12",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), p. 19 du PDF",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Revenu de solidarité active (RSA) : conditions et montant",
        "publisher": "Service-public.gouv.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F19778",
        "date": "2026-04-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PAP 2027, mission « Solidarité, insertion et égalité des chances », p. 62 du PDF",
        "publisher": "Ministère du travail et des solidarités (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Allocation de solidarité aux personnes âgées (Aspa)",
        "publisher": "Service-public.gouv.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F16871",
        "date": "2026-06-23",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La sécurité sociale, rapport sur l’application des lois de financement de la sécurité sociale (mai 2026), p. 55 du PDF",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-05/20260527-RALFSS-2026_0.pdf",
        "date": "2026-05-27",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ondam": {
    "what": "L’Ondam est l’objectif voté chaque année pour les dépenses de santé remboursées : consultations, médicaments, hôpitaux, soins en Ehpad, arrêts maladie. 278,7 Md€ en 2027, soit +2,0 % ; le levier règle ce rythme, point par point.",
    "who": "Reçoivent : médecins, pharmacies, infirmiers et autres soins de ville (118,3 Md€), hôpitaux et cliniques (116,0 Md€), établissements pour âgés et handicapés (35,1 Md€) ; au bout, les patients.",
    "up": "+1 point (+3,0 %) : 2,6 à 2,8 Md€ de plus, environ 40 € par habitant (calcul) ; un peu plus de la moitié des 5 Md€ d’économies prévues (HCFP) ne serait plus nécessaire.",
    "down": "−1 point (+1,0 %) : 2,6 à 2,8 Md€ de moins, environ 40 € par habitant (calcul), en plus des 5 Md€ d’économies prévues (HCFP) : prix, remboursements, tarifs ou budgets des hôpitaux.",
    "argsUp": [
      "HCFP : sans mesure, la dépense croîtrait de 3,6 % en 2027 ; tenir +2,0 % exige 5 Md€ d’économies, dont 0,7 Md€ reportés aux complémentaires.",
      "Cour des comptes : en 2025, la maîtrise a surtout pesé sur les hôpitaux et le médico-social, dont la situation financière est fragilisée."
    ],
    "argsDown": [
      "PLFSS 2027 : même à +2,0 %, la branche maladie resterait en déficit de 7,8 Md€ en 2027 (13,8 Md€ sans mesure).",
      "Cour des comptes : séjours évitables ou trop longs à l’hôpital : 4,2 Md€ en 2024 ; réorganiser les parcours : 1,3 Md€ d’économie en 4 ans."
    ],
    "sources": [
      {
        "title": "Population par sexe et groupe d’âges en 2026 (données provisoires)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/2381474",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La sécurité sociale, rapport sur l’application des lois de financement de la sécurité sociale (mai 2026), p. 22 du PDF",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-05/20260527-RALFSS-2026_0.pdf",
        "date": "2026-05-27",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "pensions-revalorisation": {
    "what": "Chaque 1er janvier, les retraites de base suivent les prix : +1,7 % prévu en 2027. Le PLFSS garantit cette hausse quand le total des pensions, base et complémentaire, est sous 1 260 € par mois ; au-dessus, le montant reste celui de 2026, sauf décret.",
    "who": "Reçoivent : 18,3 millions de retraités, dont 6,1 millions sous 1 260 € par mois (toutes pensions), 5,2 millions de 1 260 à 2 000 € et 7,0 millions au-dessus (DSS). 314,5 Md€ de pensions de base.",
    "up": "Inflation pour toutes : au-dessus de 1 260 €, 12,2 millions ont aussi la hausse, +25,50 € par mois pour 1 500 € de base (calcul) : 4,0 à 4,3 Md€. Moitié de 1 260 à 2 000 € : 0,6 à 0,7 Md€.",
    "down": "Gel de toutes : sous 1 260 €, 6,1 millions n’ont pas non plus la hausse, 17 € de moins par mois pour 1 000 € de base (calcul) : 0,70 Md€ d’économie. C’est le seul réglage sous la règle du PLFSS.",
    "argsUp": [
      "DSS : la règle du PLFSS laisse 67 % des retraités sans hausse, dont 5,2 millions touchant de 1 260 à 2 000 € par mois au total.",
      "DSS : la hausse non versée en 2027 n’est pas rattrapée ensuite ; l’écart vaut encore 4,3 Md€ en 2030."
    ],
    "argsDown": [
      "Comité de suivi des retraites (avis 2025 et 2026, cité par la DSS) : sous-indexer l’ensemble des pensions de 2 points cumulés d’ici 2030.",
      "Cour des comptes : niveau de vie moyen des retraités similaire aux actifs, 25 % d’épargne ; moins revaloriser pèserait peu sur l’économie."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026 (rapport à la Commission des comptes de la Sécurité sociale), p. 19 du PDF",
        "publisher": "Direction de la sécurité sociale",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Situation financière et perspectives du système de retraites (février 2025), p. 7 et 77 du PDF",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "places-creche": {
    "what": "Les places en crèche (accueil collectif des enfants de moins de 3 ans) financées par l’argent public : 495 600 en 2023, pour 16 856 € de dépense publique par place et par an en moyenne. Le levier en ajoute ou en retire, par pas de 5 000 places.",
    "who": "Crèches en PSU : la branche famille (Caf) apporte 60,1 % du financement, les collectivités, communes en tête, 30,0 % (2024). La Caf paie 66 % du coût horaire, dans une limite, moins la part payée par les familles.",
    "up": "+10 000 places (+2 %) : 0,16 à 0,20 Md€ de plus par an, hors travaux. Brut : la plupart des enfants quitteraient une assistante maternelle (9 050 € publics par place) ; l’effet net serait plus faible.",
    "down": "−10 000 places : 0,16 à 0,20 Md€ de moins par an. Brut : la plupart des familles se reporteraient sur une assistante maternelle (9 050 € publics par place) ; l’économie nette serait plus faible.",
    "argsUp": [
      "IGF-IGAS (2026) : avec moins d’assistantes maternelles, il manquerait environ 135 000 places en 2033 pour garder la couverture de 2023.",
      "IGF-IGAS (2026) : à milieu égal, un enfant en crèche dit 12 mots de plus qu’un enfant gardé par ses parents, surtout en famille modeste."
    ],
    "argsDown": [
      "Insee (2020, via IGF-IGAS) : 1 M€ dépensé en places de crèche évite au plus à quatre mères une année d’interruption de carrière.",
      "IGF-IGAS (2026) : les plans crèches restent chroniquement sous-exécutés et des crèches accueillent moins d’enfants, faute de personnel."
    ],
    "sources": []
  },
  "point-indice": {
    "what": "Le traitement de base des agents publics se calcule en multipliant l’indice de leur échelon par la valeur du point : 59,07 € brut par an depuis juillet 2023, gelée au PLF 2027. Le levier la relève ou la baisse, en %. Les primes fixées en euros ne bougent pas.",
    "who": "5,8 millions d’agents publics (fin 2023). Pour 1 %, 2,1 à 2,5 Md€ par an : État 1,0 Md€, opérateurs 0,2, collectivités 0,7, hôpitaux et autres administrations sociales 0,7 (Fipeco, montants arrondis).",
    "up": "+1 % : 2,1 à 2,5 Md€ de plus par an, soit 31 à 36 € par mois et par agent en moyenne (calcul) ; +20 € brut par mois pour un traitement de base de 2 000 €.",
    "down": "−1 % : 2,1 à 2,5 Md€ d’économie par an, soit 31 à 36 € de moins par mois et par agent (calcul) ; un traitement tombé sous le Smic serait complété jusqu’au Smic. −20 € brut sur 2 000 €.",
    "argsUp": [
      "Sénat (2025) : le point a pris 3,5 % puis 1,5 % en 2022 et 2023, sans compenser la hausse des prix ; inchangé depuis, gelé en 2027 (PLF).",
      "Sénat (2025) : le Smic tasse les grilles ; en mai 2023, près de 6,7 % des agents de l’État avaient un traitement de base au niveau du Smic."
    ],
    "argsDown": [
      "Cour des comptes (2025) : hors point, les avancements, moins l’effet des départs, ajoutent 0,4 % par an à la masse salariale (2017-2023).",
      "Sénat (2025) : les hôpitaux et les collectivités voient déjà leurs cotisations retraite d’employeur monter de 12 points en 4 ans."
    ],
    "sources": [
      {
        "title": "Rapport n° 337 (2024-2025) sur la proposition de loi visant à indexer les salaires sur l’inflation, examen de l’article 2 (point d’indice)",
        "publisher": "Sénat, commission des affaires sociales",
        "url": "https://www.senat.fr/rap/l24-337/l24-337_mono.html",
        "date": "2025-02-12",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Situation financière et perspectives du système de retraites (communication au Premier ministre, février 2025), p. 89-90",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250220-Situation-financiere-et-perspectives-du-systeme-de%20retraites.pdf",
        "date": "2025-02-20",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "prestations-familiales-revalorisation": {
    "what": "Les prestations familiales (allocations familiales, de rentrée scolaire, aides à la petite enfance…) se calculent sur une base, 478,16 € par mois depuis avril 2026, relevée chaque 1er avril selon les prix. Le PLFSS 2027 la gèle ; le levier choisit le taux.",
    "who": "Versées par les Caf (branche famille de la Sécurité sociale) : 33,9 Md€ de prestations prévues en 2027. Les allocations familiales seules vont à environ 4,95 millions de ménages (2024).",
    "up": "+2,3 % (la règle légale) : 0,50 à 0,52 Md€ de plus en 2027, d’avril à décembre ; deux enfants au taux plein : +3,50 € par mois ; trois : +7,99 € (calcul).",
    "down": "−2,3 % : 0,50 à 0,52 Md€ d’économie en 2027, d’avril à décembre (estimation, miroir de la hausse chiffrée) ; deux enfants au taux plein : −3,50 € par mois ; trois : −7,99 € (calcul).",
    "argsUp": [
      "IPP (2025), pour un gel de 1,3 % de toutes les prestations sociales : effet « largement régressif », pesant plus sur les ménages modestes.",
      "IGF-IGAS (2026) : la natalité restant faible, ces dépenses monteraient moins vite que les prix d’ici 2030, sans mesure nouvelle."
    ],
    "argsDown": [
      "IGF-IGAS (2026) : l’indexation sur les prix est le premier moteur de la hausse de ces dépenses, 2,5 points par an en moyenne de 2020 à 2024.",
      "IPP (2025), pour un gel de 1,3 % de toutes les prestations sociales : 2,1 % des ménages perdraient 1 % de niveau de vie ou plus."
    ],
    "sources": [
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe V, p. 2",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Perspectives budgétaires (juin 2025), chapitre 2 : Effets budgétaires et redistributifs des mesures socio-fiscales (p. 46-47)",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2026/04/chapitre_2_fiscalite_web.pdf",
        "date": "2025-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "prime-activite-revalorisation": {
    "what": "Un complément de revenu versé chaque mois par la Caf ou la MSA aux travailleurs modestes. Son montant de base, 638,28 € pour une personne seule, suit les prix chaque 1er avril ; le PLF 2027 le gèle. Le levier la relève ou la baisse, en points.",
    "who": "4,58 millions de foyers la reçoivent par les Caf (8,79 millions de personnes), 184 € par mois en moyenne (Cnaf, 2e trimestre 2026). L’État la paie : 10,7 Md€ prévus en 2027.",
    "up": "+1 point au 1er avril 2027 : 0,14 à 0,17 Md€ de plus en 2027 (0,23 en année pleine, IPP) ; environ 8 € de plus par mois pour une personne seule au Smic, 11 € pour un parent seul de deux enfants.",
    "down": "−1 point : 0,14 à 0,17 Md€ d’économie en 2027 (estimation, miroir de la hausse chiffrée) ; environ 8 € de moins par mois pour une personne seule au Smic, 11 € pour un parent seul de deux enfants.",
    "argsUp": [
      "PLF 2027 (évaluation de l’article 74) : le gel réduit le pouvoir d’achat des bénéficiaires, 19 € par mois pour une personne seule au Smic.",
      "Cour des comptes (2026) : la prime a largement contribué à faire disparaître la pauvreté des actifs à temps plein, parents seuls compris."
    ],
    "argsDown": [
      "Cour des comptes (2026) : 5,6 Md€ en 2018, 10,6 Md€ en 2024, pour 3,2 puis 4,8 millions de bénéficiaires ; effet sur l’emploi non démontré.",
      "PLF 2027 : le gel suit la hausse du bonus en loi de finances pour 2026, environ 50 € de plus par mois pour près de 3 millions de ménages."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Solidarité, insertion et égalité des chances, programme 304, action 11 : 1) La prime d’activité (p. 40)",
        "publisher": "Gouvernement (PAP annexé au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Prime d’activité, conjoncture au 2e trimestre 2026 (n° 38)",
        "publisher": "Caisse nationale des allocations familiales (Cnaf), direction des statistiques, des études et de la recherche",
        "url": "https://www.caf.fr/sites/default/files/medias/cnaf/Nous_connaitre/Recherche_et_statistiques/PPA%20Conjoncture/PA%20Conjoncture_2026T2.pdf",
        "date": "2026-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La prime d’activité : un soutien efficace au revenu des travailleurs, une trop faible incitation à l’activité (communication à la commission des finances du Sénat, annexée au rapport d’information n° 728, 2025-2026), synthèse (p. 11)",
        "publisher": "Cour des comptes",
        "url": "https://www.senat.fr/rap/r25-728/r25-728-annexe.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "quotient-familial-plafond": {
    "what": "L’impôt sur le revenu divise le revenu en parts ; un enfant ajoute une demi-part (une part dès le troisième). La baisse d’impôt qui en résulte est plafonnée : 1 845 € par demi-part, cas général (PLF 2027). Le levier relève ou baisse ce plafond, en %.",
    "who": "Le plafond ne joue que pour les foyers assez imposés (couple avec un enfant : dès 70 641 € en 2024). Une baisse de 10 % toucherait 1,9 million de ménages ; les 20 % aux plus hauts revenus en paieraient l’essentiel.",
    "up": "+5 % : jusqu’à 92,25 € d’impôt en moins par an et par demi-part, au plus 0,29 Md€ en tout (miroir de la baisse chiffrée). +10 % : au plus 0,58 Md€, pour les seuls foyers déjà au plafond.",
    "down": "−5 % : jusqu’à 92,25 € d’impôt en plus par an et par demi-part, au plus 0,29 Md€ en tout. −10 % : 0,58 Md€, payés par 1,9 million de ménages, 26 € par mois en moyenne (IGF-IGAS).",
    "argsUp": [
      "IGF-IGAS (2026) : une règle de calcul de l’impôt, pas une dépense fiscale ; les plus aisés en tirent bien moins que leur part de l’impôt.",
      "IGF-IGAS (2026), justifications citées : rapprocher les niveaux de vie des familles et des ménages sans enfant ; consentement à l’impôt."
    ],
    "argsDown": [
      "IGF-IGAS (2026) : le quotient profite surtout au haut de l’échelle ; les 20 % les plus aisés touchent 43,2 % de la baisse d’impôt totale.",
      "IGF-IGAS (2026) : l’aide en argent joue peu sur la natalité et, aux hauts revenus, peut nourrir l’épargne plus que la consommation."
    ],
    "sources": []
  },
  "tva-taux-normal": {
    "what": "La TVA est l’impôt compris dans le prix de ce qu’on achète ; le vendeur la reverse. Le taux normal de 20 % vaut pour la plupart des achats, sauf la restauration (10 %), la plupart des aliments (5,5 %), la presse et les médicaments remboursables (2,1 %).",
    "who": "Ménages : 65 % de la TVA ; administrations : 14 % ; entreprises qui ne la déduisent pas : 19 % (DG Trésor 2025, données 2022). 215 Md€ prévus en 2026, moitié à l’État, moitié à la Sécurité sociale et aux collectivités.",
    "up": "+1 point (21 %) : +7,5 à +8,9 Md€ (chiffrage 2025), 109 à 129 € par habitant ; 100 € d’achats coûtent 100,83 € si tout est répercuté. Jusqu’à 25 %, taux danois, estimé au-delà d’un point.",
    "down": "−1 point (19 %) : −7,5 à −8,9 Md€ (chiffrage 2025), 109 à 129 € par habitant ; 100 € d’achats coûtent 99,17 € si tout est répercuté. Jusqu’à 15 %, plancher de l’UE, estimé au-delà d’un point.",
    "argsUp": [
      "Le CPO (2023) : la TVA pèse une part plus faible des prélèvements qu’ailleurs en Europe, notamment par un taux normal parmi les plus bas.",
      "Selon le Sénat (2026), la TVA frappe autant les importations que les produits français, et son assiette large la rend peu volatile."
    ],
    "argsDown": [
      "La DG Trésor (2025) : un point sur tous les taux ôte 0,7 % de pouvoir d’achat aux 20 % les plus modestes, 0,4 % aux 20 % les plus aisés.",
      "Des économistes entendus par le Sénat (2026) : une hausse passe dans les prix et réduit le salaire réel, qui n’est pas indexé."
    ],
    "sources": [
      {
        "title": "Évaluation des voies et moyens, tome I, PLF 2026 : TVA, passage à la TVA nette budgétaire (p. 33)",
        "publisher": "Gouvernement (annexe au PLF 2026, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087930/file/PLF%202026%20-%20V%26M%20TI%20-%20Evaluations%20des%20recettes.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 942 (2025-2026) : Poids des prélèvements obligatoires en France : les quatre taux de TVA (p. 162)",
        "publisher": "Sénat, mission d’information sur le poids des prélèvements obligatoires",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
        "date": "2026-09-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques, synthèse, constat n° 1 (p. 7)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "VAT Rates (taux de TVA dans l’Union)",
        "publisher": "Commission européenne, direction générale de la fiscalité et de l’union douanière",
        "url": "https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Directive (UE) 2018/912 du Conseil du 22 juin 2018 (taux normal minimal de TVA), article 1er",
        "publisher": "Union européenne, Conseil",
        "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32018L0912",
        "date": "2018-06-22",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-taux-intermediaire": {
    "what": "La TVA est l’impôt compris dans le prix. Le taux de 10 % vaut surtout pour des services : restauration sur place ou à emporter, transport de voyageurs, travaux d’entretien des logements (hors rénovation énergétique), logement social.",
    "who": "Payée par les clients des restaurants, des transports et des artisans du bâtiment. L’écart avec le taux de 20 % : 3,3 Md€ sur les travaux, 3,0 sur la restauration, 2,8 sur les transports (CPO 2023, chiffres 2020).",
    "up": "+1 point (11 %) : +1,6 à +1,9 Md€ (chiffrage 2025), 23 à 27 € par habitant ; 100 € d’addition : 100,91 € si tout est répercuté. Jusqu’à 15 %, autant qu’à la baisse, estimé au-delà d’un point.",
    "down": "−1 point (9 %) : −1,6 à −1,9 Md€ (chiffrage 2025), 23 à 27 € par habitant ; 100 € d’addition : 99,09 € si tout est répercuté. Jusqu’à 5 %, plancher de l’UE hors transports, estimé au-delà d’un point.",
    "argsUp": [
      "Le CPO (2023) : le 10 % sur restauration et travaux n’a pas prouvé son efficacité ; il propose d’étudier une hausse, par exemple à 12,5 %.",
      "L’IPP (2018, cité par le Sénat) : la baisse de 2009 dans la restauration a surtout profité aux propriétaires, bénéfices +24 %, prix −1,9 %."
    ],
    "argsDown": [
      "Le CPO (2023) : passer au taux normal serait abrupt, aux effets mal prévisibles ; même 12,5 % devrait être compensé par des mesures ciblées.",
      "Des économistes entendus par le Sénat (2026) : une hausse de TVA passe dans les prix et réduit le salaire réel, qui n’est pas indexé."
    ],
    "sources": [
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques, tableau 2 : dix mesures dérogatoires de TVA les plus coûteuses en 2020 (p. 33)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 942 (2025-2026) : Poids des prélèvements obligatoires en France : les quatre taux de TVA (p. 162)",
        "publisher": "Sénat, mission d’information sur le poids des prélèvements obligatoires",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
        "date": "2026-09-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Directive (UE) 2022/542 du Conseil du 5 avril 2022 (taux de TVA), article 98 et annexe",
        "publisher": "Union européenne, Conseil",
        "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32022L0542",
        "date": "2022-04-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-taux-reduit": {
    "what": "La TVA est l’impôt compris dans le prix. Le taux de 5,5 % vaut pour la plupart des produits alimentaires, l’eau, les boissons sans alcool, les travaux de rénovation énergétique, l’accès au logement social, des équipements pour personnes handicapées.",
    "who": "Payée par tous les consommateurs, surtout sur les courses. L’écart avec le taux de 20 % sur l’alimentation, l’eau et les boissons sans alcool représente environ 20 Md€ (CPO 2023, chiffre 2020, à consommation inchangée).",
    "up": "+1 point (6,5 %) : +2,0 à +2,4 Md€ (chiffrage 2025), 29 à 35 € par habitant. Jusqu’à 11 %, au-delà du taux intermédiaire (10 %). Estimé au-delà d’un point.",
    "down": "−1 point (4,5 %) : −2,0 à −2,4 Md€ (chiffrage 2025), 29 à 35 € par habitant. Sous 5 %, l’UE ne l’admet que pour des besoins de base (alimentation, eau…), pas les travaux. Estimé au-delà d’un point.",
    "argsUp": [
      "Le CPO (2023) : les taux réduits font gagner plus d’euros aux ménages aisés, qui consomment plus ; rapporté aux achats, le gain varie peu.",
      "Le CPO (2023) relève qu’aucune évaluation détaillée des taux à 5,5 % n’existe ; il recommande de relever les taux réduits jugés inefficaces."
    ],
    "argsDown": [
      "La DG Trésor et le CPO : ce taux vise des achats plus présents chez les ménages modestes ; sa baisse les allège plus en part de leur revenu.",
      "Des économistes entendus par le Sénat (2026) : une hausse de TVA passe dans les prix et réduit le salaire réel, qui n’est pas indexé."
    ],
    "sources": [
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques, tableau 2 : dix mesures dérogatoires de TVA les plus coûteuses en 2020 (p. 33)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 942 (2025-2026) : Poids des prélèvements obligatoires en France : les quatre taux de TVA (p. 162)",
        "publisher": "Sénat, mission d’information sur le poids des prélèvements obligatoires",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
        "date": "2026-09-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Directive (UE) 2022/542 du Conseil du 5 avril 2022 (taux de TVA), considérant 6 et article 98",
        "publisher": "Union européenne, Conseil",
        "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32022L0542",
        "date": "2022-04-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tsn-taux": {
    "what": "Taxe de 3 % sur le chiffre d’affaires (les ventes, pas le bénéfice) que font en France les grands groupes du numérique par la mise en relation d’utilisateurs (places de marché) et la publicité ciblée. Seuils de 2019 : 750 M€ dans le monde, 25 M€ en France.",
    "who": "Moins d’une trentaine de groupes la paient (Sénat, 2026) : 980,8 M€ prévus en 2027, plus de 30 M€ par groupe en moyenne. Une part peut passer à leurs utilisateurs, vendeurs ou annonceurs (Sénat, 2019). Effet statique.",
    "up": "+10 % (taux de 3,3 %) : +99 M€ ; +25 % (3,75 %) : +0,25 Md€, plus de 8 M€ par groupe en moyenne. +100 % (6 %, voté par l’Assemblée en 2025, non retenu) : +0,62 à 0,99 Md€ (estimation).",
    "down": "−10 % (taux de 2,7 %) : −99 M€ ; −25 % (2,25 %) : −0,25 Md€, plus de 8 M€ par groupe en moyenne. −100 %, la taxe supprimée : 0,80 à 0,99 Md€ de moins (estimation ; 785 M€ encaissés en 2024).",
    "argsUp": [
      "Une étude de la Commission (2018) citée par le Sénat : les multinationales du numérique étaient imposées 14 points de moins que les autres.",
      "Pour la mission du Sénat (2026), après un économiste du CEPII : le chiffre d’affaires, à l’inverse du bénéfice, se déplace mal à l’étranger."
    ],
    "argsDown": [
      "Le Sénat (2019) prévient que, vu leur position de marché, les groupes visés peuvent reporter une partie de la taxe sur leurs utilisateurs.",
      "Pour le Sénat (2019), assise sur les ventes, elle frappe des groupes même non rentables ; il la voulait temporaire, en attendant l’OCDE."
    ],
    "sources": [
      {
        "title": "Rapport d’information n° 942 (2025-2026) : Poids des prélèvements obligatoires en France : la taxe sur les services numériques (p. 89)",
        "publisher": "Sénat, mission d’information sur le poids des prélèvements obligatoires",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
        "date": "2026-09-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Note de synthèse du rapport n° 496 (2018-2019) sur le projet de loi créant une taxe sur les services numériques (p. 1-3)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l18-496/l18-496-syn.pdf",
        "date": "2019-05-20",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Compte rendu intégral de la deuxième séance du mardi 28 octobre 2025 (projet de loi de finances pour 2026) : amendement n° 655, taxe sur les services numériques",
        "publisher": "Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/deuxieme-seance-du-mardi-28-octobre-2025",
        "date": "2025-10-28",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "service-national-appeles": {
    "what": "Un service militaire volontaire et sélectif de 10 mois pour les 18-25 ans, lancé en septembre 2026 : un mois de formation, puis des missions en France, métropole et outre-mer, sans opération extérieure. Solde d’au moins 800 € brut par mois.",
    "who": "Payé par l’État. Les appelés, 4 000 en 2027 dont 3 500 aux armées, sont nourris et logés. Par appelé et par an (PAP 2027) : 14 010 € de solde et primes, 15 953 € avec des cotisations qui restent dans les comptes publics.",
    "up": "+2 000 appelés en temps plein, sur une année pleine : 0,028 à 0,083 Md€ de plus, de la solde seule à la solde plus 27 000 € de locaux par appelé. Doubler, à 8 000 : 0,05 à 0,17 Md€ de plus.",
    "down": "−2 000 appelés en temps plein, sur une année pleine : 0,028 à 0,083 Md€ de moins, de la solde seule à la solde plus 27 000 € de locaux par appelé. Arrêter le service : 0,05 à 0,17 Md€ de moins.",
    "argsUp": [
      "Le ministère des armées (PAP 2027) : réserve et dispositifs jeunesse, dont ce service, donnent « l’épaisseur » qu’exige la haute intensité.",
      "Selon le ministère (PAP 2027), un appelé coûte 15 953 € par an, un militaire du rang 37 528 € ; le service vise aussi la cohésion nationale."
    ],
    "argsDown": [
      "Sur le SNU, dispositif civil distinct, la Cour des comptes (2024) relevait un coût sous-estimé, des objectifs « incertains et mal compris ».",
      "La Cour des comptes (2026) juge la mission Défense « à la limite de la soutenabilité » ; la paie contrainte a freiné l’embauche en 2025."
    ],
    "sources": [
      {
        "title": "Le service national",
        "publisher": "Ministère des armées et des anciens combattants",
        "url": "https://www.defense.gouv.fr/service-national",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le service national universel (SNU)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/fr/publications/le-service-national-universel-snu",
        "date": "2024-09-13",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense, synthèse (p. 6-7)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-tous-taux": {
    "what": "Taxe incluse dans la plupart des prix (deux tiers des achats des ménages ; loyers, santé, éducation exonérés), supportée en principe par le client final. Même écart sur les 4 taux : 20 %, 10 % (ex. restaurant), 5,5 % (ex. alimentation), 2,1 % (ex. presse).",
    "who": "Payée en 2022 : ménages 65 %, entreprises ne la récupérant pas 19 %, administrations 14 %. Environ la moitié à l’État (107 Md€ prévus en 2027), le reste à la Sécurité sociale, aux collectivités, à l’audiovisuel public.",
    "up": "+1 point : 11,4 à 13,7 Md€ de déficit en moins. Si les prix suivent, 120 € à 20 % passent à 121 € ; un ménage moyen, 270 à 280 € de plus par an. Au-delà de 1 point : estimation, sans plafond de l’UE.",
    "down": "−1 point : 11,4 à 13,7 Md€ de déficit en plus. Si les prix suivent, 120 € passent à 119 € ; un ménage moyen, 270 à 280 € de moins par an. Dès −0,6 point, le 5,5 % est sous le plancher de l’UE (5 %).",
    "argsUp": [
      "Elle est jugée efficace pour lever des recettes, avec des effets limités sur le travail, rapporte l’IPP.",
      "Le taux normal de 20 % est parmi les plus bas de l’UE et la TVA pèse peu dans les prélèvements (24e sur 27), relève le CPO."
    ],
    "argsDown": [
      "Un point retire 0,7 % de pouvoir d’achat aux 20 % les plus modestes, 0,4 % aux 20 % les plus aisés (0,5 % en moyenne), selon la DG Trésor.",
      "Pensions et prestations suivent les prix (hors gels de 2027), pas la plupart des salaires : une hausse pèse plus sur les actifs, note l’IPP."
    ],
    "sources": [
      {
        "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027, § 62 (recettes de TVA en 2026)",
        "publisher": "Haut Conseil des finances publiques",
        "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
        "date": "2026-09-25",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 942 (2025-2026) : Poids des prélèvements obligatoires en France : les quatre taux de TVA (p. 162)",
        "publisher": "Sénat, mission d’information sur le poids des prélèvements obligatoires",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
        "date": "2026-09-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques : poids de la TVA en France comparé à l’UE (p. 17)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Synthèse du budget pour 2027 (dossier de présentation des PLF et PLFSS 2027) : prestations sociales (p. 25)",
        "publisher": "Gouvernement (ministères économiques et sociaux)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/DP_Budget-2027.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), exposé général : recettes de l’État (p. 20)",
        "publisher": "Gouvernement, Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
        "date": "2026-10-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Taille des ménages : données annuelles de 1968 à 2023",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/2381486",
        "date": "2026-06-25",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Directive 2006/112/CE relative au système commun de TVA, version consolidée au 1er janvier 2025, article 97",
        "publisher": "Union européenne (EUR-Lex)",
        "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:02006L0112-20250101",
        "date": "2025-01-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "VAT rates (taux de TVA dans l’Union)",
        "publisher": "Commission européenne, direction générale de la fiscalité et de l’union douanière",
        "url": "https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Directive (UE) 2022/542 du Conseil du 5 avril 2022 (taux de TVA), article 98, paragraphe 2",
        "publisher": "Union européenne, Conseil",
        "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32022L0542",
        "date": "2022-04-05",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "cehr-taux": {
    "what": "Un impôt en plus de l’impôt sur le revenu des plus aisés : 3 % de la part du revenu fiscal de référence (capital compris) entre 250 000 et 500 000 € pour une personne seule, 4 % au-delà ; seuils doublés en couple. Le levier bouge les deux taux ensemble.",
    "who": "Environ 65 600 foyers dépassent ces seuils (modèle de l’IPP pour 2025, revenu ajusté) ; 1,5 Md€ payés en 2025 (Sénat). Chez les redevables de la CDHR, celle-ci compense en tout ou partie une hausse ou une baisse.",
    "up": "+1 point (4 et 5 %) : à 400 000 € de revenu (personne seule), 1 500 € de plus (4 500 € aujourd’hui) ; à 1 million, 7 500 € de plus. Estimé : +0,25 à 0,45 Md€, le bas si le revenu déclaré réagit.",
    "down": "−1 point (2 et 3 %) : à 400 000 € de revenu (personne seule), 1 500 € de moins ; à 1 million, 7 500 € de moins. Estimé : −0,25 à −0,45 Md€, le bas si le revenu déclaré réagit.",
    "argsUp": [
      "Au sommet, l’impôt rapporté au revenu, bénéfices des sociétés contrôlées compris, est plus faible, voire baisse (études citées par le CPO).",
      "Assise sur le revenu fiscal de référence, elle touche aussi les revenus du capital au taux forfaitaire, hors barème (Sénat, CPO)."
    ],
    "argsDown": [
      "Sur les plus hauts revenus d’activité, le taux marginal peut dépasser 56 % ; le Conseil d’État situe le risque de censure à 66 % (CPO).",
      "Créée en 2012 et pensée comme temporaire, elle dure désormais jusqu’à l’année d’un déficit public nul, sans date fixée (Sénat)."
    ],
    "sources": []
  },
  "cdhr-taux-plancher": {
    "what": "Un impôt plancher : au-delà de 250 000 € de revenu fiscal de référence (500 000 € en couple), un foyer dont l’impôt sur le revenu, CEHR comprise, reste sous 20 % de ce revenu paie la différence, jusqu’à l’année où le déficit de l’État repasse sous 3 % du PIB.",
    "who": "7 117 foyers ont payé l’acompte fin 2025, 54 000 € en moyenne, 0,02 % des foyers (Sénat). 90 % de leurs revenus sont imposés hors barème, surtout des revenus du capital au taux forfaitaire (IPP). 0,6 Md€ prévus en 2027.",
    "up": "À 25 % : une personne seule à 400 000 € de revenu, dont l’impôt sur le revenu est de 56 000 €, paie 44 000 € de complément au lieu de 24 000 €. Estimé : +0,4 à 1,6 Md€ ; à 30 %, +0,8 à 3,8 Md€.",
    "down": "Retrait : la même personne ne paie plus ses 24 000 € de complément. −0,6 Md€, toute la ligne du PLF 2027 ; au titre de 2025, la CDHR rapporterait 388 M€ (Sénat).",
    "argsUp": [
      "Selon l’IPP, ses redevables paient 14,2 % de leur revenu en impôt sur le revenu avant elle (18,9 % avec), les autres hauts revenus 32,3 %.",
      "Pour l’administration fiscale, elle rend progressif l’impôt au taux forfaitaire et limite le cumul de réductions et crédits d’impôt (Sénat)."
    ],
    "argsDown": [
      "Elle ne neutralise ni le pilotage des revenus imposables ni le recours aux holdings ; son rendement est près de 81 % sous l’attendu (Sénat).",
      "Son calcul, laissé au contribuable, est jugé d’une grande complexité, au point qu’un expert-comptable peut être nécessaire (Sénat)."
    ],
    "sources": []
  },
  "pfu-taux-ir": {
    "what": "Le prélèvement forfaitaire unique (« flat tax ») taxe à taux fixe dividendes, intérêts et plus-values sur titres : 12,8 % d’impôt sur le revenu et 18,6 % de prélèvements sociaux (assurance vie à part), sauf option pour le barème. Le levier bouge les 12,8 %.",
    "who": "13,5 millions de foyers, 7,2 Md€ d’impôt en 2022 (Sénat). À revenus constants, ce taux leur fait payer 8,7 Md€ de moins que le barème, à 91 % au centième le plus aisé, sans perte de recettes au début (CPO).",
    "up": "+1 point (13,8 %) : 100 € de plus pour 10 000 € de dividendes (3 140 € aujourd’hui, prélèvements sociaux compris). Estimé : +0,35 à 0,8 Md€, le bas avec moins de dividendes versés, comme après 2013.",
    "down": "−1 point (11,8 %) : 100 € de moins pour 10 000 € de dividendes (3 040 € au lieu de 3 140 €). Estimé : −0,35 à −0,8 Md€, le bas avec plus de dividendes versés, comme après 2018.",
    "argsUp": [
      "Pour de très hauts revenus surtout tirés du capital, le taux forfaitaire explique un impôt sur le revenu sous 20 % du revenu (IPP).",
      "Avec des salaires taxés jusqu’à 60 % à la marge, la France taxe relativement moins le capital que le travail (CPO)."
    ],
    "argsDown": [
      "Les propriétaires d’entreprise auraient versé environ 20 % de dividendes de moins après la hausse de 2013, autant de plus après 2018 (CPO).",
      "À la marge, impôt sur les sociétés compris, l’impôt sur les dividendes reste parmi les plus élevés de l’OCDE malgré le PFU (CPO)."
    ],
    "sources": [
      {
        "title": "Prélèvements sociaux (CSG, CRDS...) sur les revenus du patrimoine et de placements (vérifié le 30 juin 2026)",
        "publisher": "Service-public.gouv.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2329",
        "date": "2026-06-30",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "quotient-conjugal-plafond": {
    "what": "Un couple marié ou pacsé paie deux fois l’impôt de la moitié de ses revenus : à revenus inégaux, moins que deux célibataires, sans plafond légal. Vers le haut, le levier plafonne l’avantage ; vers le bas, il aligne la décote des couples sur deux célibataires.",
    "who": "Par rapport à une imposition séparée, le quotient conjugal fait payer 10,6 à 13,5 Md€ de moins, dont 5,9 Md€ au dixième le plus aisé (CPO). Un plafond toucherait 100 000 à 400 000 foyers, surtout de ce dixième.",
    "up": "Plafond à 10 000 € par couple : environ 200 000 foyers paient 1,1 Md€ de plus, 5 500 € chacun en moyenne. À 7 000 € : 400 000 foyers, +1,9 Md€ ; à 15 000 € : 100 000, +0,50 Md€ (CPO, chiffrage 2024).",
    "down": "Décote des couples (allègement des petits impôts) alignée sur deux célibataires, 1 830 € : 4,9 millions de foyers, du 6e au 9e dixième, paient 1,3 Md€ de moins, 265 € en moyenne (CPO, chiffrage 2024).",
    "argsUp": [
      "L’avantage croît avec le revenu du couple, jusqu’à 35 355 € par foyer, et va pour près de la moitié au dixième le plus aisé (CPO).",
      "L’avantage des parts d’enfants est plafonné depuis 1982, pas celui du conjoint ; le CPO ne voit pas d’obstacle juridique à le plafonner."
    ],
    "argsDown": [
      "Le quotient assure que deux couples au même revenu total paient le même impôt, quel que soit le partage entre conjoints (CPO).",
      "La décote fait payer plus en couple que séparés à 3 millions de foyers, surtout de classe moyenne ; l’aligner y remédie largement (CPO)."
    ],
    "sources": []
  },
  "plafonnement-global-niches": {
    "what": "La plupart des réductions et crédits d’impôt sur le revenu (emploi à domicile, garde d’enfants, une partie des investissements aidés) ne peuvent baisser l’impôt d’un foyer de plus de 10 000 € par an ; 18 000 € avec l’outre-mer et les Sofica. Dons exclus.",
    "who": "Peu de foyers l’atteignent : 17 041 en 2021, qui ont payé 45 M€ de plus, 2 630 € en moyenne (CPO, d’après la DGFiP). Un plafond plus bas toucherait aussi des foyers aujourd’hui en dessous.",
    "up": "À 5 000 € : jusqu’à 5 000 € de plus pour les foyers plafonnés en 2021 ; le crédit emploi à domicile, jusqu’à 6 000 €, peut seul le dépasser. Estimé : +0,2 à 1,0 Md€ ; à 7 500 €, +0,05 à 0,15 Md€.",
    "down": "À 15 000 € : les foyers plafonnés en 2021 récupéreraient ce qui dépassait, jusqu’à 5 000 € (2 630 € en moyenne). Estimé : −26 à −60 M€ ; à 20 000 €, −30 à −70 M€.",
    "argsUp": [
      "À 10 000 €, il ne concerne que 17 041 foyers (2021, CPO) : plus bas, il limiterait davantage le cumul des réductions et crédits d’impôt.",
      "Certains avantages sous plafond, comme le crédit pour l’emploi à domicile, sont coûteux et concentrés sur les plus aisés (CPO)."
    ],
    "argsDown": [
      "Non revalorisé depuis 2013, le plafond a perdu 16,5 % de sa valeur réelle de 2013 à 2024 (CPO) : le relever compenserait cette érosion.",
      "Il touche des dépenses contraintes (garde de plusieurs enfants, aide à un membre invalide) ; le CPO suggère de le moduler selon le foyer."
    ],
    "sources": [
      {
        "title": "Impôt sur le revenu - Crédit d’impôt pour l’emploi d’un salarié à domicile (vérifié le 15 avril 2026)",
        "publisher": "Service-public.gouv.fr (Direction de l’information légale et administrative)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F12",
        "date": "2026-04-15",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "aga-stock-options": {
    "what": "Une entreprise peut donner à des salariés ou dirigeants des actions gratuites, ou le droit d’acheter ses actions plus tard à un prix fixé (stock-options). Ces gains ne paient pas de cotisations de salaire mais des contributions propres, à la Sécurité sociale.",
    "who": "Surtout les entreprises (30 % sur les actions gratuites), et les bénéficiaires (10 % sur certains gains). En 2025, 17 362 foyers ont déclaré des gains d’actions gratuites avec abattement d’impôt. 1,70 Md€ prévus en 2027.",
    "up": "Taux relevés de 10 % : 170 M€ de plus par an pour la Sécurité sociale ; sur 10 000 € d’actions gratuites, l’employeur verse 3 300 € au lieu de 3 000 €. Taux doublés : 1,3 à 1,7 Md€ (estimation).",
    "down": "Taux baissés de 10 % : 170 M€ de moins par an pour la Sécurité sociale ; sur 10 000 € d’actions gratuites, l’employeur verse 2 700 € au lieu de 3 000 €. Les supprimer : 1,70 Md€ de moins.",
    "argsUp": [
      "Sénat (2025) : remise à 30 % en 2025 comme le préconisait la Cour des comptes, la taxe patronale sur les actions gratuites rapporte 0,5 Md€.",
      "CPO (2024) : ces contributions visent à taxer plus lourdement des revenus non soumis aux cotisations sociales, comme les stock-options."
    ],
    "argsDown": [
      "France Stratégie (2023) : après une hausse fin 2012, la loi a allégé en 2015 l’impôt des actions gratuites pour relancer leur attrait.",
      "Sénat (2025) : actions gratuites et stock-options associent plus étroitement les salariés au capital de l’entreprise qui les emploie."
    ],
    "sources": [
      {
        "title": "Comité d’évaluation des réformes de la fiscalité du capital, rapport final (octobre 2023), p. 40",
        "publisher": "France Stratégie (Premier ministre)",
        "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/Rapport/fs-2023-rapport-isf-quatrieme_rapport_complet_17octobre_2.pdf",
        "date": "2023-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Conforter l’égalité des citoyens devant l’imposition des revenus (octobre 2024), p. 15",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20241010-Conforter-egalite-des-citoyens-devant-imposition-des-revenus.pdf",
        "date": "2024-10-14",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Sécurité sociale : la boîte à outils du Sénat, rapport d’information n° 901 (2024-2025)",
        "publisher": "Sénat, commission des affaires sociales (MECSS)",
        "url": "https://www.senat.fr/rap/r24-901/r24-901_mono.html",
        "date": "2025-09-23",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Projet annuel de performances 2027, mission « Économie », programme 134, dépenses fiscales (p. 39)",
        "publisher": "Gouvernement, annexe au projet de loi de finances pour 2027",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I, p. 202",
        "publisher": "Sénat, commission d’enquête",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf",
        "date": "2025-07-01",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "isf-retablissement": {
    "what": "L’ISF taxait chaque année le patrimoine net (logements, placements, comptes) des foyers au-delà de 1,3 M€, par tranches de 0,5 % (dès 0,8 M€) à 1,5 %, biens professionnels exonérés. Depuis 2018, l’IFI, même barème, ne taxe que l’immobilier.",
    "who": "En 2017, 324 000 foyers payaient l’ISF ; environ les deux tiers n’ont pas payé l’IFI en 2018. L’IFI : 189 060 foyers (données fiscales 2024), 3,08 Md€ prévus en 2027 pour l’État.",
    "up": "Retour à l’ISF de 2017 : 4,0 à 7,5 Md€ de plus par an (bas : chiffre de 2022 ; haut : porté à 2027, estimation). Les anciens redevables paieraient environ 6 500 € de plus en moyenne (écart 2017-2018).",
    "down": "Supprimer l’IFI : 3,1 Md€ de moins par an. Les quelque 189 000 foyers redevables ne paieraient plus d’IFI, environ 13 000 € par foyer en moyenne au niveau de 2023.",
    "argsUp": [
      "CPO (2025), citant l’évaluation : impact nul de la fin de l’ISF sur l’investissement des entreprises, pas d’effet décelable sur l’emploi.",
      "France Stratégie (2023) : l’IFI devait pousser l’épargne vers les titres financiers ; à ce stade, aucun recul de l’immobilier n’est observé."
    ],
    "argsDown": [
      "CPO (2025) : sous l’ISF, environ 600 départs nets de redevables par an (2011-2016) ; sous l’IFI, plus de retours que de départs (2018-2021).",
      "CPO (2025), sur l’ISF : taux nominaux importants, large part du patrimoine exonérée, et un plafond pour qu’il ne soit pas confiscatoire."
    ],
    "sources": [
      {
        "title": "Comité d’évaluation des réformes de la fiscalité du capital, rapport final (octobre 2023), p. 31",
        "publisher": "France Stratégie (Premier ministre)",
        "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/Rapport/fs-2023-rapport-isf-quatrieme_rapport_complet_17octobre_2.pdf",
        "date": "2023-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 760 (2025-2026) sur l’imposition des hauts patrimoines, p. 10",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r25-760/r25-7601.pdf",
        "date": "2026-06-17",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "impot-plancher-tres-hauts-patrimoines": {
    "what": "Un impôt minimum : un foyer dont le patrimoine net dépasse 100 M€, entreprises comprises, devrait au moins 2 % de ce patrimoine par an, ses impôts sur le revenu et l’IFI déduits. Voté par l’Assemblée en 2025, puis rejeté par le Sénat.",
    "who": "Les foyers au-delà de 100 M€ de patrimoine net : résidents pour leurs biens du monde entier, non-résidents pour leurs biens en France. Le Sénat cite 1 228 Md€ pour les 500 plus grandes fortunes (classement de presse).",
    "up": "À 2 % : 3,5 à 5,5 Md€ par an après effets de comportement (DG Trésor). Exemple : à 200 M€ de patrimoine et 1 M€ d’impôts déjà payés, il resterait 3 M€ à verser. À 3 % : 4,5 à 9,2 Md€ (estimation).",
    "down": "Le PLF 2027 n’en prévoit pas : rien à baisser. Des variantes légères rapportent moins : 1,0 à 3,0 Md€ à 1 % ; 0,3 à 3,0 Md€ à 2 % si l’impôt sur les sociétés payé en amont est déduit (estimations).",
    "argsUp": [
      "IPP (2023), cité par le Sénat : selon ses auteurs, tous impôts directs compris, le taux d’imposition baisse de 46 % à 26 % au tout sommet.",
      "Sénat (2025), tout en rejetant le texte : une régressivité au sommet pourrait justifier de limiter les mécanismes qui y mènent."
    ],
    "argsDown": [
      "Conseil d’État (avis, 2025), vu la jurisprudence : 3 % au-delà de 10 M€ sans plafond selon le revenu méconnaîtrait l’égalité devant l’impôt.",
      "Sénat (2026) : certains pourraient devoir vendre des titres ou emprunter pour payer, surtout les actionnaires d’entreprises innovantes."
    ],
    "sources": []
  },
  "contribution-differentielle-patrimoine": {
    "what": "Un impôt minimum plus léger : au-delà de 2 à 10 M€ de patrimoine net (biens professionnels exonérés), un foyer devrait au moins 0,5 % ou 1 % de ce patrimoine, impôts sur le revenu et IFI déduits. Bercy a étudié 0,5 % en 2025, sans l’inscrire au budget 2026.",
    "who": "Selon le seuil, de 41 000 foyers (au-delà de 5 M€) à 133 000 (au-delà de 2 M€) paieraient, d’après la DGFiP (données de 2023 projetées sur les années suivantes) ; moins au-delà de 10 M€ (non publié).",
    "up": "À 0,5 %, avant effets de comportement : 2,1 Md€ par an au-delà de 2 M€ (environ 16 000 € par foyer redevable) ; 1,4 à 1,5 Md€ au-delà de 5 M€ (37 000 €). À 1 % dès 5 M€ : 2,2 à 5,2 Md€ (estimation).",
    "down": "Le PLF 2027 n’en prévoit pas : rien à baisser. Plus le seuil monte, moins il y a de redevables et de recettes : 2,1 Md€ dès 2 M€, mais 0,8 à 1,4 Md€ (estimation) au-delà de 10 M€, à 0,5 %.",
    "argsUp": [
      "CPO (2025) : un impôt différentiel non plafonné limiterait la baisse du taux d’imposition au sommet des patrimoines, à un taux très modéré.",
      "CPO (2025) : ses effets sur les entreprises seraient limités ; l’évaluation n’a relevé aucun effet de l’ISF sur les ETI avant 2018."
    ],
    "argsDown": [
      "Direction de la législation fiscale : il toucherait des foyers qui n’optimisent pas, comme des retraités au patrimoine immobilier important.",
      "Rapporteur général du Sénat (2026) : prélèvements à 43,6 % du PIB ; risque de départs de hauts patrimoines et de recettes bien moindres."
    ],
    "sources": []
  },
  "ifi-assiette": {
    "what": "L’IFI taxe chaque année l’immobilier net de dettes, détenu en direct ou via des sociétés, au-delà de 1,3 M€ par foyer. Le levier change ce qu’il taxe : seuil relevé à 2 M€, ou placements financiers (actions, assurance-vie, comptes…) au lieu de l’immobilier.",
    "who": "189 060 foyers paient l’IFI (données fiscales 2024). En 2022, 120 800 des 160 200 redevables connus à l’impôt sur le revenu étaient dans la tranche à 0,7 % (1,3 à 2,57 M€). 3,08 Md€ prévus en 2027 pour l’État.",
    "up": "Placements financiers au lieu de l’immobilier : +0,3 à +4,5 Md€ par an (estimation). Les patrimoines surtout immobiliers sortiraient de l’IFI ; les patrimoines surtout financiers y entreraient.",
    "down": "Seuil à 2 M€ : 0,50 à 0,85 Md€ de moins par an (estimation, avec décote au seuil). Environ la moitié des redevables sortent ; ils payaient en moyenne 2 200 à 6 000 € environ selon le décile (DGFiP).",
    "argsUp": [
      "DGFiP, citée par le Sénat (2026) : le patrimoine financier est concentré dans le dernier décile, et sa part croît avec la fortune.",
      "CPO (2025) : depuis 2018, seul l’immobilier est taxé chaque année sur sa valeur, d’où un écart d’imposition avec les patrimoines financiers."
    ],
    "argsDown": [
      "France Stratégie (2023) : le seuil de 1,3 M€ n’a pas bougé depuis 2011 ; de 2018 à 2022, les redevables sont passés de 133 000 à 164 000.",
      "France Stratégie (2023) : en 2018, ne taxer que l’immobilier visait notamment à orienter les placements vers les actions et autres titres."
    ],
    "sources": [
      {
        "title": "Corriger les principales distorsions de l’imposition du patrimoine (décembre 2025), p. 45",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251201-Corriger-les-principales-distorsions-de-l-imposition-du-patrimoine.pdf",
        "date": "2025-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "taxe-holdings-patrimoniales": {
    "what": "Une société holding gérant surtout un patrimoine privé (au moins 5 M€ d’actifs, contrôle familial à 50 %) paie, depuis une loi de 2026, 20 % de la valeur de biens non professionnels listés : yacht, avion, bijoux, vins, logement réservé à l’actionnaire…",
    "who": "Les holdings qui gardent de tels biens (à l’étranger, leurs associés en France) : 0,1 Md€ prévus en 2027. Le texte initial en visait 4 000 selon le Gouvernement, 20 000 selon l’administration fiscale (Sénat).",
    "up": "Texte initial (2 %, placements compris) : +0,65 à 0,90 Md€ (estimation : 1 Md€ du Gouvernement, dont doute le Sénat, moins la taxe actuelle). Taxer les revenus gardés : +0,9 à 1,0 Md€ (CPO).",
    "down": "Supprimer la taxe : 0,1 Md€ de moins en 2027. Un bien visé de 1 M€ (bateau, bijoux, logement réservé à l’actionnaire…) gardé dans une holding visée n’y paierait plus 200 000 € de taxe (20 %).",
    "argsUp": [
      "CPO : des dividendes gardés dans une holding sont taxés au plus à 1,25 %, contre 31,4 % s’ils sont versés à la personne : une « cash box ».",
      "Sénat : États-Unis et Irlande surtaxent à 20 % les sociétés tenues par cinq personnes au plus, selon revenus passifs ou trésorerie."
    ],
    "argsDown": [
      "Sénat (2025) : du milliard annoncé, « il est permis d’en douter » ; les holdings pourraient se réorganiser ou se scinder sous 5 M€.",
      "Sénat : une holding n’a pas toujours un but fiscal ; 2 % sans plafond sur une holding étrangère heurterait la Constitution (Conseil d’État)."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2027, évaluations préalables des articles, article 5 (p. 43)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Note du CPO n° 14 : analyse de mesures nouvelles en recettes des projets de lois financières pour 2027 (octobre 2026), § 2 (p. 3)",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-10/20261015-note-CPO-Analyse-mesures-PLF-2027.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "taxe-rachats-actions": {
    "what": "Quand une grande société rachète ses actions puis les annule, elle paie depuis 2025 une taxe de 8 %, surtout sur leur valeur « nominale » (d’origine), souvent plus basse que le prix payé. Cotée et valant plus de 1 Md€, elle paie aussi la TTF (0,4 % du prix).",
    "who": "Les sociétés au siège en France réalisant plus de 1 Md€ de chiffre d’affaires : 0,2 Md€ prévus en 2027. Les groupes du SBF 120 ont racheté 32,3 Md€ d’actions en 2023 (Sénat).",
    "up": "16 %, le double : +0,12 à 0,2 Md€ (estimation). 8 % du prix de tous les rachats, au lieu de la valeur nominale : 8 € pour 100 € rachetés, +0,4 à 2,2 Md€ (estimation), avec un risque en droit européen.",
    "down": "Supprimer la taxe : 0,2 Md€ de moins en 2027, soit 8 € de moins pour 100 € de valeur nominale annulée. À 4 % : 0,06 à 0,1 Md€ de moins (estimation).",
    "argsUp": [
      "Sénat : sur la valeur nominale, la taxe pèse inégalement, « bien peu dissuasive », quand les rachats peuvent détourner l’investissement.",
      "Sénat (2026) : les rachats rémunèrent l’actionnaire avec un impôt différé, quand les dividendes sont taxés dès leur versement."
    ],
    "argsDown": [
      "Sénat (2024), rappelant la loi de 1998 : une société mûre rend au marché l’argent qu’elle n’investit pas, qui finance d’autres entreprises.",
      "Sénat : les rachats peuvent rendre l’entreprise attractive pour les investisseurs ; taxer le prix payé serait risqué en droit européen."
    ],
    "sources": [
      {
        "title": "Rapport d’information n° 760 (2025-2026) sur l’imposition des hauts patrimoines, p. 146",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r25-760/r25-7601.pdf",
        "date": "2026-06-17",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "ttf-taux": {
    "what": "La taxe sur les transactions financières (TTF) est due sur les achats d’actions de sociétés cotées au siège en France valant plus de 1 Md€ en Bourse : 0,4 % du prix depuis 2025, contre 0,3 % avant. Les achats revendus dans la journée y échappent.",
    "who": "L’acheteur des actions (particulier, fonds, ou société qui rachète ses propres titres) : 2 973 M€ prévus en 2027. Pour 1 000 € d’actions achetées, 4 € de taxe.",
    "up": "0,5 % : +0,65 à 0,75 Md€ (calcul Isoloir), 1 € de plus pour 1 000 € d’actions. 0,8 %, le double : +1,9 à 3,0 Md€ (estimation, le bas tient compte d’achats en recul), 4 € de plus.",
    "down": "0,3 %, le taux d’avant 2025 : 0,65 à 0,75 Md€ de moins (calcul Isoloir), 1 € de moins pour 1 000 € d’actions. Suppression : 2,6 à 3,0 Md€ de moins, 4 € de moins.",
    "argsUp": [
      "Recherche (AMF, 2025) : la TTF a « peu d’effet distorsif » ; sa création en 2012 n’a changé ni la liquidité ni la volatilité des actions.",
      "Recherche (AMF, 2025) : la TTF rapporte peu face au Royaume-Uni (1,9 Md€ à 0,3 % en 2022) et pèse pour moitié sur des étrangers."
    ],
    "argsDown": [
      "AMF (2025) : hausser le taux expose à des arbitrages, la base pouvant se délocaliser ; en Suède, taxer les dérivés a fait fuir le marché.",
      "Recherche (AMF, 2025) : la création de la TTF en 2012 a réduit de 10 % les volumes d’échanges des actions taxées."
    ],
    "sources": [
      {
        "title": "Rapport général n° 144 (2024-2025), tome II, fascicule 1, sur le projet de loi de finances pour 2025, article 26, p. 478",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l24-144-21/l24-144-211.pdf",
        "date": "2024-11-21",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Réunion du Conseil scientifique de l’AMF du 2 octobre 2025 (compte rendu), p. 2",
        "publisher": "Autorité des marchés financiers, Conseil scientifique",
        "url": "https://www.amf-france.org/sites/institutionnel/files/pdf/79707/fr/Reunion_du_Conseil_scientifique_de_l%27AMF_-_2_octobre_2025.pdf?1786114126",
        "date": "2025-10-02",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Rapport d’information n° 760 (2025-2026) sur l’imposition des hauts patrimoines, p. 147",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r25-760/r25-7601.pdf",
        "date": "2026-06-17",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "apport-cession-report": {
    "what": "Avant de vendre son entreprise, un associé peut apporter ses parts à une holding qu’il contrôle, qui les revend. L’impôt sur sa plus-value est calculé mais reporté (si revente en 3 ans, 70 % du prix réinvesti). Le PLF 2027 le rend dû à la transmission.",
    "who": "Des dirigeants et associés qui vendent leur entreprise, surtout parmi les foyers les plus aisés : 8 400 en 2023, au revenu moyen de 700 000 € hors plus-values. 127 Md€ de plus-values restaient en report en 2023.",
    "up": "Imposer dès l’apport, payé sur 5 ans : +0,2 à 0,68 Md€ (estimation large ; la directive européenne « Fusions » encadre ce choix, CPO). Exiger que tout soit réinvesti : presque rien en 2027.",
    "down": "Retirer l’article 5 : 0,5 Md€ de moins en 2027. Exemple du CPO (vente à 1 M€) : 310 860 € reportés s’effaceraient au décès, comme pour des titres gardés en direct ; restent les droits de succession.",
    "argsUp": [
      "CPO (2025) : 16 Md€ mis en report en 2021, dont 13 Md€ pour le dernier dix-millième des revenus ; 0,5 Md€ sorti du report cette année-là.",
      "CPO (2025) : imposer à la transmission serait possible au regard du Conseil constitutionnel, la plus-value étant déjà calculée à l’apport."
    ],
    "argsDown": [
      "Conseil constitutionnel (2019), cité par le Sénat : le report évite au contribuable de vendre une partie de ses titres pour payer l’impôt.",
      "CPO (2025) : durcir le régime pourrait pénaliser la France face à ses voisins européens, les holdings aidant la compétitivité des groupes."
    ],
    "sources": []
  },
  "exit-tax": {
    "what": "Quand on quitte la France, l’impôt sur les plus-values de ses importantes participations non vendues est calculé au départ. Dans 95 % des cas, il n’est dû qu’à la vente, et s’efface si les titres sont gardés 2 à 5 ans. Effet sur les départs non chiffré.",
    "who": "Ceux qui partent avec d’importantes participations : 3 362 dossiers en cours en mai 2025 (toutes années de départ), contre 2 110 en 2017. 345,7 M€ encaissés de 2011 à mars 2025, un peu moins de 25 M€ par an (CPO).",
    "up": "Effacement à 15 ans : rien en 2027, au plus de l’ordre de 25 M€ par an dès 2029 (estimé). Partir avec 990 000 € de plus-value et vendre 6 ans après : 310 860 € dus (calcul Isoloir, exemple du CPO).",
    "down": "Supprimer : 0 à 5 M€ de moins en 2027, au plus environ 25 M€ par an ensuite (estimation). Dans cet exemple, partir puis vendre ne coûterait rien en France si le nouveau pays ne taxe pas ces gains.",
    "argsUp": [
      "CPO : sans exit tax, un an dans un pays exonérant les plus-values suffit à y échapper ; assouplie, elle est plus aisément contournable.",
      "Sénat, d’après une étude : une exit tax « suffisamment dissuasive » pourrait contrebalancer les départs face à un impôt sur la fortune."
    ],
    "argsDown": [
      "CPO (2025) : un impôt complexe « dont l’efficacité n’est pas prouvée » et à l’impact « peu évalué », au produit faible.",
      "CPO (2024) : elle impose des démarches complexes à tous les investisseurs concernés qui partent, d’où son assouplissement en 2019."
    ],
    "sources": [
      {
        "title": "Projet de loi de finances pour 2027, évaluations préalables des articles, article 5 (p. 43)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Note du CPO n° 14 : analyse de mesures nouvelles en recettes des projets de lois financières pour 2027 (octobre 2026), § 2 (p. 3)",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-10/20261015-note-CPO-Analyse-mesures-PLF-2027.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport d’information n° 760 (2025-2026) sur l’imposition des hauts patrimoines, p. 202",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r25-760/r25-7601.pdf",
        "date": "2026-06-17",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "plus-values-immobilieres-abattement": {
    "what": "Vendre un bien autre que sa résidence principale (résidence secondaire, bien loué…) : gain taxé à 36,2 % (+2 à 6 % au-delà de 50 000 € imposables), allégé dès la 6e année ; exonéré d’impôt sur le revenu après 22 ans, de prélèvements sociaux après 30.",
    "who": "Les vendeurs : 578 000 ont payé 3,5 Md€ en 2023 (Cour des comptes). En 2022, le dixième qui payait le moins versait 160 € en moyenne ; l’essentiel venait de peu de vendeurs, surtout aux plus hauts revenus.",
    "up": "Inflation déduite, sans limite de durée : −0,2 à +1,9 Md€ selon la méthode et l’année (2024 ou 2022). 100 000 € de gain en 20 ans : 1 000 à 18 600 € d’impôt selon le prix d’achat, au lieu de 14 800 €.",
    "down": "Exonération après 15 ans (règle d’avant 2011) : 2,4 Md€ en moins sur les ventes de 2022 (Cour), 1,5 ramené à 2024 (estimation). Ce même gain de 100 000 € en 20 ans ne paierait plus rien.",
    "argsUp": [
      "Le minimum constitutionnel est de déduire l’inflation ; s’y tenir, au taux actuel, rapporterait −0,2 à +1,9 Md€ selon la méthode et l’année.",
      "L’abattement peut faire garder des biens sous-utilisés (CPO), effet difficile à prouver (Cour) ; taxer sans limite de durée l’éviterait."
    ],
    "argsDown": [
      "Deux études citées par la Cour lient la réforme de 2011-2013 (exonération de 15 à 30 ans) à un recul temporaire des ventes et des prix.",
      "Le CPO rappelle ses buts : détention longue, frein à la spéculation, prise en compte de l’inflation. L’Allemagne exonère plus tôt (Cour)."
    ],
    "sources": []
  },
  "assurance-vie-transmission": {
    "what": "Au décès, l’assurance-vie est versée aux bénéficiaires choisis, hors héritage. Primes versées avant 70 ans : les 152 500 premiers euros reçus par chacun sont sans impôt, puis 20 % jusqu’à 852 500 €, 31,25 % au-delà. Conjoint, partenaire de Pacs exonérés.",
    "who": "En 2018, 857 649 bénéficiaires ont reçu 37 Md€ ; 94,6 % ont reçu moins de 152 500 €, sous l’abattement, 46 700 ont reçu plus (CAE). Face aux droits de succession, l’avantage est estimé à 5 Md€ en 2024 (DG Trésor).",
    "up": "Barème des héritages au-delà de 20 % : +1,3 Md€ à terme (CPO) ; 3 500 héritiers (7 M€ transmis par défunt en moyenne), taux moyen porté de 22 à 25 %. Droits ordinaires : +3,5 à 5,0 Md€ (statique).",
    "down": "Abattement à 200 000 € : 0,2 à 0,44 Md€ en moins (estimation). Au plus 46 700 bénéficiaires (5 %, en 2018) y gagnent : 9 500 € de 200 000 à 852 500 € reçus, jusqu’à 14 800 € au-delà, moins en dessous.",
    "argsUp": [
      "Selon le CPO, abattement et barème concentrent l’avantage sur les plus gros patrimoines ; 70 % des encours sont aux 10 % les plus aisés.",
      "Pour le CAE, ce régime à part, sans justification économique forte, complique le système : il faudrait l’intégrer au barème des successions."
    ],
    "argsDown": [
      "But affiché (budget de l’État, cité par la Cour) : l’épargne longue qui finance l’économie ; 41 % des ménages ont un contrat (CPO).",
      "Le CPO note que l’assurance-vie aide à transmettre aux beaux-enfants, taxés à 60 % comme des non-parents dans les droits de succession."
    ],
    "sources": [
      {
        "title": "Impôt sur le revenu - Comment sont imposés les revenus d’un contrat d’assurance-vie ? (fiche F22414, section « décès de l’assuré »)",
        "publisher": "Service-Public.fr (Direction de l’information légale et administrative, Premier ministre)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F22414",
        "date": "2026-04-15",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "dmtg-abattement-ligne-directe": {
    "what": "Chaque parent peut donner ou léguer 100 000 € à chacun de ses enfants sans droits, une fois tous les 15 ans. Au-delà, la part reçue est taxée par tranches de 5 à 45 % (20 % de 15 932 à 552 324 € taxables). Dons d’argent : 31 865 € de plus, sous conditions.",
    "who": "Les enfants recevant plus de 100 000 € d’un parent : 24 % des successions en ligne directe paient ; un héritier paie 6 835 € en moyenne, la moitié rien (Cour). Les enfants ont payé 7,1 Md€ de droits de succession (2018).",
    "up": "+20 000 € (120 000 € par enfant) : 0,6 à 1,4 Md€ de recettes en moins (estimation). Un enfant qui hérite de 136 000 à 652 000 € d’un parent paie 4 000 € de moins (20 000 € exonérés de plus, à 20 %).",
    "down": "−20 000 € (80 000 € par enfant) : 0,8 à 2,0 Md€ en plus (estimation), plus qu’à la hausse : de nouveaux héritiers paient. Un enfant qui hérite de 116 000 à 632 000 € d’un parent paie 4 000 € de plus.",
    "argsUp": [
      "Gelé depuis 2012, l’abattement de 100 000 € ne vaut plus que 82 290 € de 2012 (CPO) : l’inflation alourdit l’impôt sans décision nouvelle.",
      "Le CPO juge la France moins favorable aux enfants : 400 000 € exonérés par enfant en Allemagne, 1 M€ en Italie, moins en Belgique, Espagne."
    ],
    "argsDown": [
      "Un enfant reçoit sans droits au moins 200 000 € de ses parents en 15 ans ; la moitié des gens hérite en tout de moins de 70 000 € (CAE).",
      "Le CAE note que les plus gros héritiers reçoivent plusieurs dons et héritages, et profitent ainsi plusieurs fois des abattements."
    ],
    "sources": [
      {
        "title": "Repenser l’héritage, Les notes du conseil d’analyse économique n° 69 (décembre 2021), p. 3",
        "publisher": "Conseil d’analyse économique",
        "url": "https://www.cae-eco.fr/staticfiles/pdf/cae-note069.pdf",
        "date": "2021-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "dmtg-ligne-indirecte-taux": {
    "what": "Hors conjoint et ligne directe (enfants, petits-enfants, parents), l’héritage est plus taxé : 35 puis 45 % entre frères et sœurs (après 15 932 € d’abattement), 55 % pour neveux, nièces, cousins germains, 60 % au-delà et hors parenté, beaux-enfants compris.",
    "who": "Frères et sœurs, neveux, cousins, beaux-enfants, amis : 6,0 Md€ de droits (2018) ; 35 % des droits pour 13 % des sommes (Cour). 60 % de ces successions paient ; 33 367 € en moyenne par héritier, la moitié moins de 245 €.",
    "up": "+5 points par taux : +0,35 à 0,6 Md€. Un neveu qui hérite de 100 000 € paie 50 600 € (55 % après 7 967 € d’abattement) : 4 600 € de plus. Jusqu’à +15 points (taux de 50 à 75 %), estimé au-delà de 5.",
    "down": "−5 points par taux : 0,35 à 0,6 Md€ de recettes en moins ; ce neveu paierait 4 600 € de moins. Jusqu’à −15 points (taux de 20 à 45 %), estimé au-delà de 5.",
    "argsUp": [
      "Ces taux ne visent que 13 % des sommes héritées : conjoints et enfants, qui reçoivent l’essentiel, n’y sont pas soumis (Cour).",
      "Selon des études citées par la Cour, ces droits font peu partir les plus riches et pèsent peu sur l’épargne (taux +1 % : −0,25 % transmis)."
    ],
    "argsDown": [
      "Pour le CPO, les baisser pourrait répondre au besoin croissant de transmettre hors ligne directe ; le CAE juge ces écarts contestables.",
      "Pour 69 % des offices notariaux ayant répondu au CPO, ce barème a déjà fait renoncer ou réduire des transmissions à des beaux-enfants."
    ],
    "sources": [
      {
        "title": "Les droits de succession (septembre 2024), synthèse (p. 7)",
        "publisher": "Cour des comptes",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295513.pdf",
        "date": "2024-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Repenser l’héritage, Les notes du conseil d’analyse économique n° 69 (décembre 2021), p. 8",
        "publisher": "Conseil d’analyse économique",
        "url": "https://www.cae-eco.fr/staticfiles/pdf/cae-note069.pdf",
        "date": "2021-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "dmtg-ensemble": {
    "what": "Les droits sur ce qu’on reçoit par héritage (succession) ou de son vivant (donation), après un abattement selon le lien de parenté. Ce levier relève ou baisse tous les taux d’un même pourcentage, dont le taux de 6 % prévu pour certains dons de début 2027.",
    "who": "Les héritiers (les conjoints sont exonérés) et ceux qui reçoivent un don : 22,0 Md€ prévus en 2027. 47 % des successions déclarées en 2022 ont payé des droits ; 62 % des successions portent sur moins de 30 000 € (CPO).",
    "up": "+10 % : +2,3 Md€ (calcul statique, sans réaction des familles). Un enfant qui paie 6 835 € (moyenne) paierait 680 € de plus, un neveu qui paie 50 600 €, 5 060 €. +100 % : 13,0 à 22,1 Md€ (estimation).",
    "down": "−10 % : 2,3 Md€ de moins (même calcul) ; 680 € de moins pour cet enfant, 5 060 € pour ce neveu. À −100 %, plus aucun droit de succession ni de donation : 22,1 Md€ en moins.",
    "argsUp": [
      "Pour la Cour, la théorie économique juge ces droits favorablement (rôle redistributif) ; leur effet mesuré sur l’épargne est faible.",
      "Selon le CAE, l’héritage fait 60 % du patrimoine contre 35 % vers 1970, et se concentre : moins de 10 % héritent de plus de 500 000 €."
    ],
    "argsDown": [
      "La France est 1re de l’OCDE pour le poids de ces droits dans le PIB (Cour) ; douze pays de l’OCDE ont supprimé l’impôt sur l’héritage.",
      "Impôt très impopulaire et mal connu : en 2017, 87 % des Français voulaient le voir baisser, 9 % le relever (Cour)."
    ],
    "sources": [
      {
        "title": "PLF 2027, évaluations préalables des articles, article 4, I (p. 37)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Repenser l’héritage, Les notes du conseil d’analyse économique n° 69 (décembre 2021), p. 1",
        "publisher": "Conseil d’analyse économique",
        "url": "https://www.cae-eco.fr/staticfiles/pdf/cae-note069.pdf",
        "date": "2021-12",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "demembrement-propriete": {
    "what": "Quand un parent donne un bien en gardant l’usufruit (l’habiter ou le louer), l’enfant reçoit la nue-propriété, taxée sur 10 à 90 % de la valeur selon l’âge du parent (50 % de 51 à 60 ans). Au décès, il devient plein propriétaire sans nouveaux droits.",
    "who": "Les familles qui donnent en nue-propriété : 45 % des donations en valeur (CAE, données de 2006). Avantage estimé : 2 à 3 Md€ par an (CAE, données de 2006), 0,9 à 3,2 Md€ pour l’immobilier (CPO, moyenne 2013-2020).",
    "up": "+10 points : 0,20 à 0,80 Md€ de plus par an (+40 : 0,6 à 3,2 Md€, moins de démembrements). Logement de 500 000 € donné par un parent de 65 ans (taxé sur 60 %) : +10 points, 10 000 € de droits en plus.",
    "down": "−10 points : 0,20 à 0,80 Md€ de moins par an (−40 : 0,8 à 3,5 Md€, plus de démembrements). Même logement : −10 points, 10 000 € de droits en moins.",
    "argsUp": [
      "Pour le CPO (2025), le démembrement, sans justification économique probante et concentré sur les hauts patrimoines, pourrait être resserré.",
      "Un bien de 500 000 € donné en nue-propriété à 55 ans paie 1 % d’impôt, contre 15 % transmis en entier au décès à 90 ans (CPO)."
    ],
    "argsDown": [
      "Outil courant pour transmettre tôt et protéger le conjoint survivant : à 55 ans, près d’un quart des ménages sont nus-propriétaires (CPO).",
      "Certains jugent le barème trop éloigné de la réalité, note le CPO : une nue-propriété vaudrait en fait bien moins que ce qu’il retient."
    ],
    "sources": []
  },
  "grandes-transmissions-plancher": {
    "what": "Un impôt minimum par héritier ou donataire, sur la pleine valeur reçue (démembrement compris), droits déjà payés déduits. Le pacte Dutreil exonère 75 % d’une entreprise familiale gardée plusieurs années : 100 M€ donnés paient environ 5 %.",
    "who": "Ceux qui reçoivent plus de 5 ou 10 M€ en payant peu de droits, surtout par le pacte Dutreil, qui coûte 3,8 Md€ en 2027 (PAP) : 500 000 € d’avantage moyen pour ses quelque 11 000 bénéficiaires (Cour des comptes).",
    "up": "100 M€ donnés sous Dutreil : environ 5 M€ payés (jusqu’à 11 M€ en succession). Minimum : 7,5 M€ (7,5 % du tout, si plus de 5 M€ reçus), 18 M€ (20 % au-delà de 10 M€), 40,5 M€ (45 % au-delà de 10 M€).",
    "down": "Le PLF ne prévoit aucun impôt minimum : ce levier ne descend pas plus bas. L’exonération Dutreil a son propre levier, qui va dans les deux sens ; les deux ne se cumulent pas.",
    "argsUp": [
      "Avantage Dutreil très concentré (65 % pour 110 personnes en 2024), sans hausse de l’investissement ni de l’emploi (Cour des comptes, 2025).",
      "Le CPO propose un impôt minimum à la transmission contre la suroptimisation : la richesse créée serait taxée au moins une fois."
    ],
    "argsDown": [
      "Le pacte préserve le contrôle familial : 5 ans après, moins de 30 % de changements de contrôle, contre plus de 40 % sans (Cour des comptes).",
      "Payer exige des liquidités (CPO) ; 15 pays de l’OCDE sont en général plus favorables (Sénat), souvent à conditions plus strictes (Cour)."
    ],
    "sources": []
  },
  "contribution-benefices-exceptionnels": {
    "what": "Taxe ponctuelle sur la part du bénéfice 2027 des groupes d’au moins 1,5 Md€ de chiffre d’affaires dépassant leur moyenne 2017-2019 (prix corrigés). Inspirée de la taxe de l’UE 2022-2023, limitée aux énergies fossiles, au-delà de 120 % de la moyenne 2018-2021.",
    "who": "Les grands groupes dont le bénéfice 2027 dépasse leur moyenne d’avant 2020. La contribution de 2025, au seuil de 1 Md€ de chiffre d’affaires, prévoyait environ 450 redevables (Sénat) ; moins au seuil de 1,5 Md€.",
    "up": "Un groupe qui gagne 1 Md€ en 2027, contre 700 M€ en moyenne aux prix de 2027, paie 25 % ou 33 % de 300 M€ : 75 ou 99 M€. Total estimé : 1,5 à 7,2 Md€ (25 %), 2,0 à 9,5 Md€ (33 %).",
    "down": "Le PLF n’en prévoit pas : ce levier ne descend pas plus bas. La contribution exceptionnelle déjà prévue sur ces groupes (5,2 Md€) a son propre levier, qui va dans les deux sens.",
    "argsUp": [
      "Pour l’UE (2022), les bénéfices 2022 des énergies fossiles et du raffinage n’étaient pas réguliers : ils venaient d’événements imprévus.",
      "Selon le CPO (2023), la taxe européenne de 2022 atténue à court terme des écarts de rentabilité temporaires entre secteurs."
    ],
    "argsDown": [
      "Rendement incertain : pour la taxe européenne de 2022, estimations de 0,2 à 3,9 Md€ ; les montants déclarés confortent la plus basse (CPO).",
      "Pour le CPO (2023), les taxes d’urgence de l’UE devaient rester limitées à 2022-2023 et à l’énergie ; à prix normaux, plus de base à taxer."
    ],
    "sources": [
      {
        "title": "Les différences d’imposition sur les bénéfices entre PME et grandes entreprises (juin 2023), p. 34",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230703-Differences-taxation-entre-PME-et-grandes-entreprises.pdf",
        "date": "2023-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "remunerations-au-dela-1m": {
    "what": "Une taxe payée par l’employeur sur la part de chaque rémunération annuelle (salaire, primes, actions gratuites…) au-delà de 1 M€, plafonnée à 5 % de son chiffre d’affaires. Elle a existé, à 50 %, pour les rémunérations de 2013 et 2014.",
    "who": "Les entreprises qui versent plus de 1 M€ par an à quelqu’un : 470 pour 1 000 personnes (chiffrage de 2013, Assemblée nationale). Part au-delà de 1 M€ en 2026 : 1 à 1,8 Md€, extrapolée par Isoloir de 715 M€ en 2011.",
    "up": "Sur une rémunération de 1,2 M€ versée en 2026, 200 000 € sont taxés en 2027 : l’employeur paie 50 000 € à 25 %, 100 000 € à 50 %. Total estimé : 0,15 à 0,37 Md€ (25 %), 0,27 à 0,67 Md€ (50 %).",
    "down": "Le PLF n’en prévoit pas : ce levier ne descend pas plus bas. Pour alléger l’impôt des très hauts revenus : leviers « Impôt sur le revenu, taux de 45 % » et « Contribution sur les hauts revenus ».",
    "argsUp": [
      "Taxer l’employeur cible la part au-delà de 1 M€ (Conseil d’État) ; due sur une charge, elle n’est pas confiscatoire (Assemblée nationale).",
      "Elle vise les entreprises qui peuvent verser plus de 1 M€ ; temporaire, elle pèserait peu sur l’attractivité (Assemblée nationale, 2013)."
    ],
    "argsDown": [
      "Recruter des profils de haut niveau coûte très cher en France : en haute technologie, cela peut faire choisir d’autres sites (Sénat, 2026).",
      "Contournement par l’étranger : le texte de 2013 le visait, sans garantie sur les contrôles (rapporteur général, Assemblée nationale)."
    ],
    "sources": [
      {
        "title": "BOI-TPS, Taxes et participations sur les salaires (version du 30/04/2014), § 5",
        "publisher": "Direction générale des finances publiques (BOFiP-Impôts)",
        "url": "https://bofip.impots.gouv.fr/bofip/7321-PGP.html/identifiant%3DBOI-TPS-20140430",
        "date": "2014-04-30",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Rapport d’information n° 942 (2025-2026), « Poids des prélèvements obligatoires en France : quelles conséquences sur la compétitivité des entreprises, l’investissement et les salaires ? », p. 143",
        "publisher": "Sénat, mission d’information",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf",
        "date": "2026-09-02",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credit-impot-recherche-innovation": {
    "what": "Le crédit d’impôt recherche accorde aux entreprises un crédit égal à 30 % de leurs dépenses de recherche jusqu’à 100 M€ par an (5 % au-delà). Le crédit d’impôt innovation, plus petit, s’arrête avec les dépenses de 2027.",
    "who": "17 079 entreprises reçoivent le crédit recherche et 11 566 le crédit innovation (2025, PAP 2027). En 2019, les grandes entreprises en avaient 45 %, pour 52 % de la recherche privée (CPO).",
    "up": "+10 % : 0,58 à 0,97 Md€ de dépense en plus, environ 43 000 € par bénéficiaire ; si la hausse passait par le taux, 330 000 € au lieu de 300 000 € pour 1 M€ de recherche. +100 % : 5,2 à 8,3 Md€.",
    "down": "−10 % : 0,58 à 0,97 Md€ de dépense en moins, environ 43 000 € par bénéficiaire ; par le taux, 270 000 € pour 1 M€ de recherche. −100 %, fin des deux crédits : 5,2 à 7,8 Md€, au plus leur coût prévu.",
    "argsUp": [
      "Un euro de crédit entraîne environ un euro de recherche privée en plus (France Stratégie, repris au PAP 2027) ; 1,4 dans 21 pays (OCDE).",
      "La DG Trésor attribue à la réforme de 2008 +0,5 point de PIB et 30 000 emplois vers 2023, et y voit un atout d’attractivité (CPO, 2023)."
    ],
    "argsDown": [
      "Effets nets pour les seules PME (IPP, France Stratégie) ; grands groupes : 0,4 € de recherche en plus par euro d’aide (OCDE, via le CPO).",
      "Coût jugé élevé face au budget de la recherche publique, sans empêcher, semble-t-il, la perte d’attrait pour la recherche étrangère (CPO)."
    ],
    "sources": [
      {
        "title": "Les différences d’imposition sur les bénéfices entre PME et grandes entreprises (juin 2023), p. 29",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230703-Differences-taxation-entre-PME-et-grandes-entreprises.pdf",
        "date": "2023-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-restauration": {
    "what": "La TVA est l’impôt compris dans le prix. Au restaurant, sur les plats à emporter à manger tout de suite et en cantine, elle est de 10 % au lieu de 20 % (alcools à 20 %). Taux réduit depuis 2009 au restaurant (10 % depuis 2014), depuis 1968 en cantine.",
    "who": "Payée surtout par les ménages, et par les administrations pour les cantines. Coût face au taux normal : 2,51 Md€ en 2027, 36 € par habitant. Buts officiels : l’emploi en restauration, aider la restauration collective.",
    "up": "Taux de 20 % : 2,1 à 2,6 Md€ de déficit en moins, 31 à 36 € par habitant. Un repas de 22 € (20 € hors taxe) : 24 € si tout est répercuté, 22,80 à 23 € si la hausse passe comme en 2012 et 2014 (IPP).",
    "down": "Taux de 5,5 %, le plus bas possible ici (estimation) : 0,7 à 1,3 Md€ de déficit en plus, 11 à 19 € par habitant. Repas de 22 € : 21,10 € si tout est répercuté, 21,90 € au rythme de 2009 (IPP).",
    "argsUp": [
      "Selon l’IPP (2018), la baisse de 2009 a surtout profité aux propriétaires de restaurants (56 %) ; prix −1,9 %, sans hausse des effectifs.",
      "Pour le CPO (2023), ce taux n’a pas fait la preuve de son efficacité ; des mesures ciblées sur l’emploi coûteraient moins."
    ],
    "argsDown": [
      "Selon l’IPP (2018), la baisse de 2009 a aussi profité aux salariés (18,6 % du gain, coût par salarié +4,1 %) et aux fournisseurs (12,1 %).",
      "Contre un retour à 20 %, le CPO (2023) : ce serait une « évolution abrupte », aux effets difficiles à prévoir, et mal acceptée."
    ],
    "sources": [
      {
        "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, mesure 730221 (p. 167)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2026)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Qui a bénéficié de la baisse de la TVA dans la restauration en 2009 ? (Les notes de l’IPP n° 32), résumé (p. 1)",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2018/05/n32-notesIPP-mai2018.pdf",
        "date": "2018-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques : taux de 10 % de la restauration et des travaux (p. 39)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-hebergement": {
    "what": "La TVA est l’impôt compris dans le prix. Pour une nuit d’hôtel, un meublé loué avec services ou un camping classé, elle est de 10 % au lieu de 20 %. Ici, le droit de l’UE n’admet pas moins de 5 %, et deux taux réduits au plus (en France 5,5 et 10 %).",
    "who": "Payée par les clients des hôtels, meublés et campings. Coût face au taux normal : 965 M€ en 2027, 14 € par habitant. But officiel : aider le secteur hôtelier (43 900 entreprises d’hôtels et meublés, Voies et moyens).",
    "up": "Taux de 20 % : 0,97 Md€ de déficit en moins, 14 € par habitant. Nuit de 110 € (100 € hors taxe) : 120 € si tout est répercuté, 113,80 à 115 € comme en 2012-2014 (restauration, IPP).",
    "down": "Taux de 5,5 %, le plus bas possible ici (estimation) : 0,32 à 0,55 Md€ de déficit en plus, 5 à 8 € par habitant. La nuit : 105,50 € si tout est répercuté, 109,40 € comme en 2009 (restauration, IPP).",
    "argsUp": [
      "Règle générale du CPO (2023), sans avis sur ce taux : évaluer chaque taux réduit et relever ceux dont l’inefficacité est confirmée.",
      "Selon l’IPP (2018), la baisse de 2009 dans la restauration a peu fait baisser les prix (−1,9 %) et a surtout profité aux propriétaires."
    ],
    "argsDown": [
      "Le CPO (2023) : via les plateformes, des locations courtes échappent à la TVA que paient les hôtels ; il soutient une réforme européenne.",
      "L’État vise 100 Md€ de recettes du tourisme international d’ici 2030, sur un marché en « forte concurrence internationale » (PAP 2027)."
    ],
    "sources": [
      {
        "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, mesure 730205 (p. 164)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2026)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques : recommandations n° 4 et n° 5 (p. 8)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Qui a bénéficié de la baisse de la TVA dans la restauration en 2009 ? (Les notes de l’IPP n° 32), résumé (p. 1)",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2018/05/n32-notesIPP-mai2018.pdf",
        "date": "2018-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-travaux-logement": {
    "what": "La TVA est l’impôt compris dans le prix. Les travaux d’amélioration, de transformation, d’aménagement et d’entretien d’un logement achevé depuis plus de deux ans sont à 10 % au lieu de 20 % ; la rénovation énergétique a son propre taux, 5,5 %.",
    "who": "Payée par les propriétaires et locataires qui font ces travaux, facturés par 305 284 entreprises (2025). Coût face au taux normal : 2,47 Md€ en 2027, 36 € par habitant. But officiel : aider à l’amélioration du logement.",
    "up": "Taux de 20 % : 2,5 Md€ de déficit en moins, 36 € par habitant. Travaux de 11 000 € (10 000 € hors taxe) : 12 000 € si tout est répercuté, 11 380 à 11 500 € comme en 2012-2014 (restauration, IPP).",
    "down": "Taux de 5,5 %, le plus bas possible ici (estimation) : 0,8 à 1,4 Md€ de déficit en plus, 12 à 20 € par habitant. Facture : 10 550 € si tout est répercuté, 10 940 € comme en 2009 (restauration, IPP).",
    "argsUp": [
      "Pour le CPO (2023), ce 10 % n’a pas prouvé son efficacité et pourrait céder la place à des aides plus ciblées sur l’emploi, moins coûteuses.",
      "Pour le CPO (2023), qui s’appuie sur la Cour des comptes (2016), le coût de ce taux est disproportionné par rapport aux objectifs atteints."
    ],
    "argsDown": [
      "Contre un retour à 20 %, le CPO (2023) : ce serait une « évolution abrupte », aux effets difficiles à prévoir, et mal acceptée.",
      "L’IPP (2018) : une hausse de TVA passe plus dans les prix qu’une baisse (38 à 50 % en restauration) ; les clients en paieraient une part."
    ],
    "sources": [
      {
        "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, mesure 730213 (p. 166)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2026)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques : taux de 10 % de la restauration et des travaux (p. 39)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Qui a bénéficié de la baisse de la TVA dans la restauration en 2009 ? (Les notes de l’IPP n° 32), résumé (p. 1)",
        "publisher": "Institut des politiques publiques (IPP)",
        "url": "https://www.ipp.eu/wp-content/uploads/2018/05/n32-notesIPP-mai2018.pdf",
        "date": "2018-05",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "tva-renovation-energetique": {
    "what": "La TVA est l’impôt compris dans le prix. Les travaux de rénovation énergétique d’un logement de plus de deux ans (isolation, chauffage plus économe) sont à 5,5 % au lieu de 20 %. Pour ces travaux, le droit de l’UE n’admet pas de taux sous 5 %.",
    "who": "Payée par les ménages et bailleurs qui font ces travaux, facturés par 101 124 entreprises (2025). Coût face au taux normal : 980 M€ en 2027, 14 € par habitant. But officiel : moins d’énergie consommée par les logements.",
    "up": "Taux de 10 % : 0,31 Md€ de déficit en moins (4 € par habitant) ; 20 % : 0,98 Md€ (14 €), à volume égal. Travaux de 10 550 € (10 000 € hors taxe) : 11 000 € ou 12 000 € si tout est répercuté.",
    "down": "Pas de réglage plus bas : 5,5 % est le plus bas des deux taux réduits, et l’UE n’admet pas moins de 5 % ici. Étendre le 5,5 % : levier « TVA des travaux de logement » ; aides de l’Anah : autre levier.",
    "argsUp": [
      "Cour des comptes (2016) : effet d’aubaine très élevé sur l’entretien (chaudière…), car une réparation inévitable se fait à tout taux.",
      "Le CPO (2023) juge limitée la capacité des taux réduits de TVA à changer les comportements ; il préfère les accises pour l’environnement."
    ],
    "argsDown": [
      "Cour des comptes (2016) : plus simple qu’un crédit d’impôt, ce taux sert aussi aux bailleurs, or les logements classés G sont surtout loués.",
      "Une incitation fiscale doit rester stable pour être efficace (Cour des comptes, 2016) ; le « budget vert » cote ce taux « favorable »."
    ],
    "sources": [
      {
        "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, mesure 730223 (p. 168)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2026)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "L’efficience des dépenses fiscales relatives au développement durable : une efficience contrariée par des effets d’aubaine (p. 63)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/EzPublish/20161108-efficience-depenses-fiscales-developpement-durable.pdf",
        "date": "2016-11",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "La taxe sur la valeur ajoutée (TVA), un impôt à recentrer sur son objectif de rendement pour les finances publiques : TVA et environnement (p. 35, 57 et 58)",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/system/files/2023-02/20230209-TVA_0.pdf",
        "date": "2023-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "accise-gazole-transport-routier": {
    "what": "L’accise est la taxe sur les carburants, par MWh (gazole : 1 MWh = 1 hectolitre). Camions de 7,5 t et plus, cars et bus, taxis s’en font rembourser une partie : camions à 45,19 €/MWh au lieu de 60,75. Ce gazole ne peut descendre sous son niveau de 2003 (UE).",
    "who": "1 557 M€ remboursés en 2027 : 1 306 M€ aux camions de 7,5 t et plus (33 271 entreprises en 2025, 39 000 € chacune en moyenne), 185 M€ aux cars et bus, 66 M€ aux taxis. But officiel : aider le transport routier.",
    "up": "Remboursement plus grand : camions au tarif des cars (39,19 €/MWh), plancher retenu (estimation) : 0,37 à 0,63 Md€ de déficit en plus, −6 c par litre, 11 000 à 19 000 € par entreprise en moyenne.",
    "down": "Remboursement plus petit : camions à mi-chemin, 0,66 Md€ de déficit en moins ; au tarif normal, 1,4 Md€, +15,6 c par litre, 39 000 € par entreprise en moyenne ; tous au tarif normal, 1,6 Md€.",
    "argsUp": [
      "Le CPO (2026) : une hausse nationale anticipée nuirait face aux concurrents, ce gazole étant déjà plus taxé que la moyenne de l’UE.",
      "Pour la Cour des comptes (2016), sa fin pénaliserait les camions français, qui ne peuvent guère faire le plein chez des voisins moins taxés."
    ],
    "argsDown": [
      "Loi climat (2021) : tarif normal visé d’ici 2030, selon l’offre de camions ; le CPO (2026) propose d’y aller par étapes, avec l’UE.",
      "Le CAE et son homologue allemand (2025) : les coûts externes du fret sont peu pris en compte ; l’UE doit inciter à quitter le diesel."
    ],
    "sources": [
      {
        "title": "Évaluation des voies et moyens, tome II : dépenses fiscales, annexe au PLF 2026, mesure 800221 (p. 179)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2026)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1087933/file/Voies_et_moyens_Tome_2_2026.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "L’efficience des dépenses fiscales relatives au développement durable : un soutien au transport routier en voie de réduction (p. 82)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/EzPublish/20161108-efficience-depenses-fiscales-developpement-durable.pdf",
        "date": "2016-11",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Décarboner le transport routier de marchandises, déclaration commune du Conseil d’analyse économique et du German Council of Economic Experts (p. 1 et 4)",
        "publisher": "Conseil d’analyse économique (CAE) et German Council of Economic Experts",
        "url": "https://www.cae-eco.fr/static/pdf/cae-svg-joint-statement-fret-250320-fr.pdf",
        "date": "2025-03",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "accise-gazole-non-routier": {
    "what": "Le gazole non routier (GNR, teinté en rouge) fait tourner tracteurs, engins de chantier et moteurs fixes. Son accise est réduite : 3,86 centimes par litre en agriculture, 42,78 en 2027 pour la plupart des autres usages, contre 60,75 pour le gazole ordinaire.",
    "who": "Gazole, fioul lourd et GPL des travaux agricoles et forestiers : 1 719 M€ d’avantage en 2027 pour 102 461 entreprises (2025), environ 16 800 € chacune en moyenne (calcul). Hors agriculture, surtout le BTP (CPO) : 398 M€.",
    "up": "Agriculture à tarif nul (permis par l’UE) : 3,86 centimes de moins par litre, 0,08 à 0,15 Md€, environ 1 100 € par entreprise (calcul). Tout au minimum de l’UE : 0,7 à 1,3 Md€. Estimations d’Isoloir.",
    "down": "Agriculture au tarif normal : 57 centimes de plus par litre de gazole, environ 1,8 Md€ à volumes inchangés, environ 16 800 € par entreprise (calcul). Hors agriculture, fin dès 2027 : environ 0,4 Md€.",
    "argsUp": [
      "CPO (2026) : exposée à la concurrence internationale, sans engin décarboné au point, l’agriculture pourrait garder son tarif réduit.",
      "Précédent : face à la hausse des prix des carburants, le Gouvernement a annoncé un GNR agricole sans accise pour avril 2026 (CPO, 2026)."
    ],
    "argsDown": [
      "CPO (2026) : le GNR agricole est taxé environ 15 € par tonne de CO2 émise, contre 170 à 230 € pour le gazole des camions et des voitures.",
      "Cour des comptes (2026) : la hausse de taxe du GNR du BTP, prévue depuis 2020 pour inciter à la transition, a été repoussée maintes fois."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Agriculture et alimentation, programme 149 : bénéficiaires de la dépense fiscale n° 800229 (p. 37)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128206/file/PAP%202027%20-%20Agriculture%20et%20alimentation.pdf#page=37",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, tarifs normaux des carburants (p. 22)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=22",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, gazole non routier à usage non agricole (p. 23)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=23",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, gazole des travaux agricoles et forestiers (p. 25)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=25",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, annexe 3 : fiscalité comparée en volume et en énergie (p. 37)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=37",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 121",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=123",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 122",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=124",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 123, note 89",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=125",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 69",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=71",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Économie (avril 2026), p. 33",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Economie.pdf#page=33",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "accise-energie-industrie": {
    "what": "L’accise, une taxe par MWh, est réduite pour les centres de données et des industries très consommatrices d’énergie, certaines exposées à la concurrence : 0,5 à 10 € d’électricité au lieu de 26,35 aujourd’hui, 1,52 ou 1,60 € de gaz au lieu de 16,66.",
    "who": "Des sites de la métallurgie, de la chimie, du papier… (CPO) et les centres de données : 1 087 M€ d’avantage sur l’électricité en 2027 ; de gros consommateurs de gaz : 605 M€. Nombre d’entreprises non publié.",
    "up": "Tarifs à 0, permis par l’UE sous conditions (centres de données à 0,5 €) : 0,07 à 0,38 Md€ de recettes en moins, estimation d’Isoloir. Un site de 100 GWh à 5,5 € le MWh ne paierait plus 550 000 €.",
    "down": "Tarif normal : environ 1,7 Md€ de recettes en plus (coût publié) ; ce site paierait 2,6 M€ au lieu de 550 000 € (calcul). Avantages divisés par 2 : environ 0,85 Md€ de recettes en plus.",
    "argsUp": [
      "En 2024, l’industrie française payait l’électricité 2 à 2,5 fois plus cher qu’aux États-Unis et en Chine (AIE, citée par le CPO, 2026).",
      "CPO (2026) : le marché carbone européen s’étendant, garder ces tarifs aux secteurs exposés évite de creuser l’écart de compétitivité."
    ],
    "argsDown": [
      "Cour des comptes (2026) : l’administration ne peut pas identifier directement les entreprises aidées par ces tarifs sur l’électricité.",
      "Cour des comptes (2026) : ces tarifs peuvent réduire l’intérêt de maîtriser sa consommation d’électricité, à l’inverse de la compensation."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Économie, programme 134 : dépense fiscale n° 820203 (p. 38)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf#page=38",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PAP 2027, mission Économie, programme 134 : dépense fiscale n° 820201 (p. 39)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf#page=39",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PAP 2027, mission Économie, programme 134 : dépense fiscale n° 820206 (p. 40)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf#page=40",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 174 : dépense fiscale n° 830201 (p. 334)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=334",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 174 : dépense fiscale n° 830202 (p. 335)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=335",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, tarifs normaux de l’électricité (p. 13)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=13",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, tarifs réduits des électro-intensifs (p. 14)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=14",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, annexe : grille des tarifs réduits des électro-intensifs depuis le 1er janvier 2026 (p. 36)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=36",
        "date": "2026",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Guide 2026 sur la fiscalité des énergies, gaz naturels à usage combustible (p. 18)",
        "publisher": "Ministère de la Transition écologique",
        "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies%202026.pdf#page=18",
        "date": "2026",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (CPO, septembre 2025), p. 109",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf#page=121",
        "date": "2025-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 126",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=128",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), synthèse des recommandations, p. 23",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=25",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Économie (avril 2026), p. 33",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Economie.pdf#page=33",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Économie (avril 2026), p. 34",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Economie.pdf#page=34",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "compensation-carbone": {
    "what": "Le marché carbone européen fait payer leurs émissions aux centrales électriques, qui en répercutent le coût dans le prix de l’électricité. L’État rembourse aux industries grosses consommatrices d’électricité et exposées une part de ce coût « indirect ».",
    "who": "Des sites électro-intensifs exposés à la concurrence (aluminium, sidérurgie…) : 814,1 M€ prévus en 2027, payés par l’État ; 0,3 à 0,4 Md€ par an de 2020 à 2022, 0,8 et 0,9 Md€ en 2023 et 2024 (Cour des comptes).",
    "up": "Pas de réglage plus haut : le PLF prévoit déjà 75 % des coûts indirects de 2026, le maximum des règles européennes (2021-2030), plus un complément pour les entreprises les plus touchées.",
    "down": "Aide divisée par 2 (37,5 % des coûts) : 0,41 Md€ d’économie ; un site dont le carbone payé via l’électricité a coûté 10 M€ en 2026 recevrait 3,75 M€ au lieu de 7,5 M€ (calcul). Suppression : 0,82 Md€.",
    "argsUp": [
      "Objectif (PAP 2027) : éviter que l’aluminium, l’acier et d’autres activités électro-intensives ne délocalisent à cause du prix du CO2.",
      "Cour des comptes (2026) : l’aide pousse à l’efficacité, 25 % du coût du carbone restant à payer, avec un audit énergétique obligatoire."
    ],
    "argsDown": [
      "Études citées par le CPO (2026) : peu de délocalisations dues au prix du CO2 quand il était bas, sans savoir si c’est grâce aux aides.",
      "Cour des comptes (2026) : une évaluation régulière de ces aides à l’énergie est souhaitable pour justifier leur maintien, vu leur coût."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Économie, programme 134, action 23 : dépenses d’intervention (p. 64)",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128228/file/PAP%202027%20-%20Economie.pdf#page=64",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Économie (avril 2026), tableau n° 7 (p. 32)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Economie.pdf#page=32",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Économie (avril 2026), p. 33",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Economie.pdf#page=33",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Économie (avril 2026), p. 34",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Economie.pdf#page=34",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 94",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=96",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (CPO, juin 2026), p. 95",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf#page=97",
        "date": "2026-06",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "is-taux-reduit-brevets": {
    "what": "Les bénéfices tirés de brevets, de logiciels protégés ou de procédés issus de la recherche peuvent être imposés à 10 %, au lieu de 25 % à l’impôt sur les sociétés, à proportion des dépenses de recherche engagées par l’entreprise.",
    "who": "1 243 entreprises en 2025, 1 554 M€ d’avantage en 2026 (PAP). En moyenne 1,2 M€ par bénéficiaire ; les grandes entreprises font 77 % de l’assiette (Sénat, 2025).",
    "up": "Taux de 5 % : sur 10 M€ de bénéfices tirés de brevets, 0,5 M€ d’impôt au lieu de 1 M€ (calcul) ; 0,33 à 0,65 Md€ de recettes en moins. Exonération (0 %) : 0,6 à 1,3 Md€. Estimations d’Isoloir.",
    "down": "Taux de 15 % : 1,5 M€ d’impôt sur ces 10 M€ de bénéfices au lieu de 1 M€ (calcul) ; 0,33 à 0,65 Md€ de recettes en plus. Fin du taux réduit (25 %) : 1,0 à 2,0 Md€. Estimations d’Isoloir.",
    "argsUp": [
      "CPO (2025) : une hausse bute sur les taux comparables : 3,75 % en Belgique, 10 % en Espagne ou au Royaume-Uni, 13 à 16 % aux États-Unis.",
      "Les brevets sont des actifs mobiles : un taux réduit attire leurs revenus dans le pays qui l’applique (travaux cités par le Sénat, 2025)."
    ],
    "argsDown": [
      "CPO (2025) : effet sur l’innovation mis en doute (brevets en stagnation, peu d’effet sur les innovateurs clés) ; un taux relevé est évoqué.",
      "Aucune évaluation par l’administration depuis la réforme de 2019, selon l’Inspection générale des finances, citée par le Sénat (2025)."
    ],
    "sources": [
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (CPO, septembre 2025), p. 97",
        "publisher": "Conseil des prélèvements obligatoires (institution associée à la Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf#page=109",
        "date": "2025-09",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I (p. 260)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=260",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I (p. 261)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=261",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I (p. 262)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=262",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I, annexe (p. 412)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=412",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I, annexe (p. 413)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=413",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "taxe-tonnage": {
    "what": "Les armateurs qui le choisissent (pour 10 ans) paient l’impôt sur les sociétés, pour l’exploitation de leurs navires, sur un bénéfice forfaitaire fixé d’après leur tonnage : une fraction du bénéfice réel. Leurs autres activités sont imposées normalement.",
    "who": "83 entreprises en 2025 (PAP). Coût lié au prix du fret : 5,6 Md€ en 2023, 0,6 en 2024, 1,4 en 2025, 0,32 prévu en 2027. Le PLF 2027 prélève aussi 8 % du résultat d’exploitation des plus grandes, pour un an (0,3 Md€).",
    "up": "+10 %, par exemple un barème plus bas par navire : 24 à 37 M€ d’avantage en plus (calcul). +100 %, miroir de la suppression : 240 à 370 M€, estimation d’Isoloir sans les nouveaux venus au régime.",
    "down": "−10 %, par exemple un barème plus haut par navire : 24 à 37 M€ de recettes en plus (calcul). Suppression : 150 à 370 M€, estimation d’Isoloir, élargie vers le bas car des armateurs pourraient partir.",
    "argsUp": [
      "PLF 2027 : un régime « appliqué communément parmi les principaux pays portuaires », pour attirer les activités maritimes en France.",
      "Fret très cyclique (ministère de l’Économie, cité par le Sénat) : un impôt calculé d’après le tonnage reste stable d’une année à l’autre."
    ],
    "argsDown": [
      "Sénat (2025) : un coût moyen de 1,1 Md€ par an de 2015 à 2025, pour un nombre « très restreint » d’entreprises.",
      "Cour des comptes (2026) : le coût a doublé en 2025 ; ses causes doivent être documentées et les modalités du régime réinterrogées."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 205 : dépense fiscale n° 320119 (p. 126)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=126",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PLF 2027, évaluations préalables des articles, article 15 « Mise à contribution des grandes entreprises » (p. 155)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=155",
        "date": "2026-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "PLF 2027, évaluations préalables des articles, article 15 « Mise à contribution des grandes entreprises » (p. 157)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=157",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PLF 2027, évaluations préalables des articles, article 15 « Mise à contribution des grandes entreprises » (p. 160)",
        "publisher": "Gouvernement (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=160",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I (p. 259)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=259",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Rapport n° 808 (2024-2025) de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants, tome I (p. 260)",
        "publisher": "Sénat, commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants",
        "url": "https://www.senat.fr/rap/r24-808-1/r24-808-11.pdf#page=260",
        "date": "2025-07-01",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Écologie, développement et mobilités durables (avril 2026), synthèse (p. 9)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Ecologie-developpement-mobilite-durables.pdf#page=9",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Écologie, développement et mobilités durables (avril 2026), p. 100",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Ecologie-developpement-mobilite-durables.pdf#page=100",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "reduction-impot-mecenat-entreprises": {
    "what": "Une entreprise qui donne à un organisme d’intérêt général (association, fondation, musée, recherche…) déduit de son impôt 60 % du don (40 % au-delà de 2 M€), sur 20 000 € de dons au plus, ou 0,5 % du chiffre d’affaires si c’est plus ; l’excédent est reporté.",
    "who": "L’État : 1 811 M€ en 2025 pour 178 673 entreprises, environ 10 100 € chacune (calcul), et 1 894 M€ prévus en 2027. Les dons vont aux associations, fondations, musées et organismes de recherche.",
    "up": "+10 % : 66 % au lieu de 60 % ; pour un don de 10 000 €, la réduction passe de 6 000 à 6 600 € (calcul). Coût pour l’État : 189 M€ par an, dont 0,0019 à 0,0095 Md€ en 2027 (estimation, dons inchangés).",
    "down": "−10 % : 54 % au lieu de 60 % ; pour un don de 10 000 €, la réduction passe de 6 000 à 5 400 € (calcul). L’État économise 189 M€ par an, dont 0,0019 à 0,0095 Md€ en 2027 (estimation, dons inchangés).",
    "argsUp": [
      "Les dons soutiennent largement le social, l’éducation et la santé, pas seulement la culture, partout en France (Cour des comptes, 2018).",
      "L’avantage a contribué à décupler le nombre d’entreprises qui y recourent : buts de la loi « largement atteints » (Cour des comptes, 2018)."
    ],
    "argsDown": [
      "Avantage concentré : en 2016, les 24 premières entreprises bénéficiaires en recevaient 44 % (Cour des comptes, 2018).",
      "En 2018, la Cour notait l’absence d’évaluation récente et presque aucun contrôle ; la créance a crû de 65 % de 2016 à 2023 (Sénat)."
    ],
    "sources": [
      {
        "title": "Mécénat d’entreprise : dons en faveur d’organismes sans but lucratif",
        "publisher": "Direction de l’information légale et administrative et ministère chargé des finances (Entreprendre Service Public)",
        "url": "https://entreprendre.service-public.gouv.fr/vosdroits/F22263",
        "date": "2026-07-20",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Le soutien public au mécénat des entreprises, un dispositif à mieux encadrer, synthèse (p. 10)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20181128-rapport-soutien-public-mecenat-entreprises.pdf",
        "date": "2018-11-28",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "credits-impot-culture": {
    "what": "Six crédits d’impôt remboursent aux producteurs une part de leurs dépenses en France (jusqu’à 30 % au cinéma ; aussi séries, tournages étrangers, jeux vidéo, spectacles, musique). Le CNC, payé par des taxes sur télévision, vidéo et billets, aide la filière.",
    "who": "Environ 2 150 bénéficiaires cumulés des six crédits en 2025. Le CNC aide producteurs, distributeurs et salles ; ses 847 M€ de taxes portent sur la télévision (426 M€), la vidéo à la demande (264), les billets (147).",
    "up": "+10 % : 0,10 à 0,19 Md€ de plus en 2027 : 46 à 76 M€ de crédits d’impôt (cinéma à 33 % au lieu de 30 % : +30 000 € par million de dépenses éligibles) et 64 à 106 M€ du CNC, s’il dépense d’autant plus.",
    "down": "−10 % : 0,10 à 0,19 Md€ de moins : 46 à 76 M€ de crédits d’impôt (cinéma à 27 % au lieu de 30 % : −30 000 € par million de dépenses éligibles) et 64 à 106 M€ du CNC, s’il dépense d’autant moins.",
    "argsUp": [
      "Selon l’IGF (2024), le soutien au cinéma a d’« indubitables succès » ; la France compte 2,6 entrées par habitant, 1,5 dans le reste de l’UE.",
      "La hausse du crédit cinéma a vraisemblablement ramené en France le tournage des films aux plus gros budgets, selon l’IGF (2024)."
    ],
    "argsDown": [
      "L’argent public dans les films agréés est passé de 16 % en 2012 à environ 30 % ; 40 % avec France TV et les SOFICA (IGF, 2024).",
      "Pour la plupart des films, le crédit cinéma est une aubaine : son effet sur le lieu de tournage n’est prouvé qu’au-delà de 7 M€ (IGF, 2024)."
    ],
    "sources": [
      {
        "title": "Revue de dépenses relative aux aides au cinéma, rapport de septembre 2024 publié le 16 juillet 2025, synthèse (p. 4 du PDF)",
        "publisher": "Inspection générale des finances",
        "url": "https://www.igf.gouv.fr/files/igf/files/contributed/Rapports%20de%20mission/2025/2024-M-017-03_RDD-Aides_au_cinema.pdf",
        "date": "2024-09",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), article 12 « Soutien au secteur culturel » (p. 55)",
        "publisher": "Gouvernement (projet de loi déposé à l’Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
        "date": "2026-10-01",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Actualité du 5 août 2026 (ACTU-2026-00089) : crédit d’impôt audiovisuel, plafond des œuvres d’animation (loi de finances pour 2026, art. 85)",
        "publisher": "Direction générale des finances publiques (BOFiP-Impôts)",
        "url": "https://bofip.impots.gouv.fr/bofip/15075-PGP.html",
        "date": "2026-08-05",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Revue de dépenses relative aux aides au cinéma, présentation du rapport",
        "publisher": "Inspection générale des finances",
        "url": "https://www.igf.gouv.fr/rapports-de-mission/revue-de-depenses-relative-aux-aides-au-cinema",
        "date": "2025-07-16",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "aide-fiscale-investissement-outre-mer": {
    "what": "Trois aides fiscales à l’achat de machines, véhicules… outre-mer : un crédit d’impôt pour l’entreprise ; une réduction d’impôt pour des ménages qui financent l’achat, dont 56 à 66 % reversés à l’entreprise ; une réduction d’IS (COM et Nouvelle-Calédonie).",
    "who": "L’État : 1 171 M€ en 2027 (hors déduction de 19 M€). En 2025, 53 525 ménages (environ 14 000 € de réduction chacun, dont 56 à 66 % reversés) et 3 385 entreprises au crédit d’impôt (environ 110 000 € chacune) (calculs).",
    "up": "+10 % : 26 à 43 M€ de crédit d’impôt en plus en 2027, 8 000 à 13 000 € par entreprise ; 82 M€ de réductions en plus en 2028, 1 500 € par ménage, en partie reversés (calcul). Investissement inchangé.",
    "down": "−10 % : 26 à 43 M€ de crédit d’impôt en moins en 2027, 8 000 à 13 000 € par entreprise ; 82 M€ de réductions en moins en 2028, 1 500 € par ménage, en partie reversés (calcul). Investissement inchangé.",
    "argsUp": [
      "Le financement y est « particulièrement complexe » ; l’aide vise à attirer des capitaux, à réduire le coût d’investir (Gouvernement, 2026).",
      "La réduire dans un contexte difficile (Mayotte, Nouvelle-Calédonie) serait un risque pour ces économies, selon le Sénat (2025)."
    ],
    "argsDown": [
      "Sans juger l’aide inefficace, l’IGF (2023) ne mesure pas d’effet significatif sur les bénéficiaires ; l’État connaît mal les biens financés.",
      "Via des ménages, les intermédiaires captent environ un tiers de l’avantage ; une aide directe coûterait moins à gérer (IGF, 2023)."
    ],
    "sources": [
      {
        "title": "Rapport général n° 139 (2025-2026), tome II, fascicule 1, sur le projet de loi de finances pour 2026, article 7 (p. 189)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-21/l25-139-211.pdf",
        "date": "2025-11-24",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Évaluation du régime d’aide fiscale à l’investissement productif en outre-mer, synthèse (p. 6 du PDF)",
        "publisher": "Inspection générale des finances",
        "url": "https://www.igf.gouv.fr/files/igf/files/contributed/Rapports%20de%20mission/2023/2023-M-047-04_Rapport_public_Investissement_OM.pdf",
        "date": "2023-07",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Évaluation du régime d’aide fiscale à l’investissement productif en outre-mer, présentation du rapport",
        "publisher": "Inspection générale des finances",
        "url": "https://www.igf.gouv.fr/rapports-de-mission/evaluation-du-regime-daide-fiscale-linvestissement-productif-en-outre-mer",
        "date": "2023-07-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "exonerations-outre-mer": {
    "what": "Dans les départements d’outre-mer, une entreprise de moins de 11 salariés ou de certains secteurs est exonérée de cotisations patronales jusqu’à 1,3 à 2 Smic selon le régime, puis de moins en moins. La réduction générale efface autant au Smic, moins au-dessus.",
    "who": "L’État rembourse 1 931 M€ en 2027 (indépendants et particuliers employeurs compris). En 2023 : 316 505 salariés, 50 120 établissements ; 694 M€ de plus que la réduction générale, 45 % du coût (IGF-IGAS).",
    "up": "+10 % de l’avantage sur la réduction générale (0,54 à 1,26 Md€ en 2027, estimation) : 54 à 126 M€ de plus pour les entreprises, 170 à 400 € par salarié et par an (calcul sur 2023, hors Mayotte).",
    "down": "−10 % de l’avantage sur la réduction générale (0,54 à 1,26 Md€ en 2027, estimation) : 54 à 126 M€ de cotisations en plus, 170 à 400 € par salarié et par an (calcul sur 2023, hors Mayotte).",
    "argsUp": [
      "Selon des simulations du Sénat (2026), elles permettraient environ 8 300 emplois, à 67 000 € l’emploi (59 000 € pour la réduction générale).",
      "Elles compensent les surcoûts de l’éloignement (Sénat, 2026) ; chômage de 11 à 19 % en 2023, contre 7 % dans l’Hexagone (IGF-IGAS)."
    ],
    "argsDown": [
      "La refonte des barèmes de 2019 n’a presque pas eu d’effet mesuré sur l’emploi, les salaires ou la rentabilité (IGF-IGAS, 2024).",
      "Les entreprises aidées ont des marges supérieures à l’Hexagone (IGF-IGAS, 2024) ; l’aide couvre des salaires bien au-dessus du Smic (Sénat)."
    ],
    "sources": [
      {
        "title": "Exonérations de cotisations patronales en outre-mer : Lodéom et Lopom, des dispositifs efficients, rapport d’information n° 662 (2025-2026), synthèse (p. 4)",
        "publisher": "Sénat, mission d’évaluation et de contrôle de la sécurité sociale (Mecss), commission des affaires sociales",
        "url": "https://www.senat.fr/rap/r25-662/r25-662-syn.pdf",
        "date": "2026-05-27",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Évaluation des mesures d’exonération de cotisations sociales spécifiques aux outre-mer (IGF n° 2024-M-033-02, IGAS n° 2024-065R), rapport (p. 12 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://www.igf.gouv.fr/files/igf/files/contributed/Rapports%20de%20mission/2025/2024-M-033-02_Rapport_Cotisations_sociales_OM.pdf",
        "date": "2024-11",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "exonerations-saisonniers-agricoles": {
    "what": "Un employeur agricole qui embauche un saisonnier (récolte, vendanges…) ne paie pas de cotisations patronales jusqu’à 1,25 Smic, puis l’exonération décroît (l’État compense). Sans elle, la réduction générale effacerait presque autant au Smic, moins au-dessus.",
    "who": "Plus de 70 000 employeurs, près de la moitié de ceux de la production agricole ; 31 % des heures salariées. Coût : 593,5 M€, dont 60 à 179 M€ en plus de la réduction générale (estimation ; 143 M€ prévus en 2026).",
    "up": "+10 % de l’avantage sur la réduction générale : 6 à 18 M€ de plus pour les employeurs (estimation), 85 à 255 € par employeur et par an (calcul), par exemple un plateau d’exonération totale plus haut.",
    "down": "−10 % de l’avantage sur la réduction générale : 6 à 18 M€ de cotisations en plus (estimation), 85 à 255 € par employeur et par an (calcul), par exemple un plateau d’exonération totale plus bas.",
    "argsUp": [
      "Le coût du travail pourrait désavantager un secteur très concurrentiel : d’où l’importance de l’aide, selon les rapporteurs du Sénat (2025).",
      "Elle permet de lutter contre le travail non déclaré et la dégradation des conditions de travail, selon les rapporteurs du Sénat (2025)."
    ],
    "argsDown": [
      "Avec la réduction générale renforcée en 2019, l’aide profiterait surtout à la vigne et aux cultures spécialisées (Gouvernement, 2018).",
      "En 2009, l’IGF et l’IGAS jugeaient l’aide d’alors mal ciblée, sans effet mesurable sur l’emploi ni le travail non déclaré (cité en 2015)."
    ],
    "sources": [
      {
        "title": "Exonérations de cotisations patronales en outre-mer : Lodéom et Lopom, des dispositifs efficients, rapport d’information n° 662 (2025-2026), synthèse (p. 4)",
        "publisher": "Sénat, mission d’évaluation et de contrôle de la sécurité sociale (Mecss), commission des affaires sociales",
        "url": "https://www.senat.fr/rap/r25-662/r25-662-syn.pdf",
        "date": "2026-05-27",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Fiches d’évaluation préalable des articles du PLFSS 2019 (annexe 9), article 8, mesure relative au dispositif TO-DE (p. 44)",
        "publisher": "Gouvernement (annexe au projet de loi de financement de la sécurité sociale pour 2019, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/15/textes/l15b1297_etude-impact.pdf",
        "date": "2018-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Revue de dépenses sur les exonérations et exemptions de charges sociales spécifiques (IGF n° 2015-M-016-01, IGAS n° 2015-029R), annexe III, fiche TO-DE (p. 386 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://www.igf.gouv.fr/files/igf/files/contributed/Rapports%20de%20mission/2015/2015-M-016.pdf",
        "date": "2015-06",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "exonerations-apprentis": {
    "what": "Un apprenti ne paie pas ses cotisations salariales de retraite (base et complémentaire : 11,31 % du salaire dans le privé) sur la part de sa paie qui ne dépasse pas la moitié du Smic (79 % pour un contrat d’avant mars 2025). L’État les rembourse aux caisses.",
    "who": "Les apprentis (plus de 847 000 entrées en 2025) : jusqu’à 106 € net de plus par mois (calcul, privé). En 2027, 1,23 Md€, dont 1,09 à 1,14 comptés hors employeurs publics (2,6 % des entrées, exonérés sur toute la paie).",
    "up": "+10 % : coûterait 0,12 Md€ ; +100 % (doubler) : 0,9 à 1,2 Md€ (estimation). Revenir au plafond de 79 % du Smic : jusqu’à 61 € net de plus par mois dans le privé (calcul, avant prime d’activité).",
    "down": "−10 % : rapporterait 0,12 Md€ ; −100 % (supprimer) : 0,9 à 1,2 Md€ (estimation), et jusqu’à 106 € net de moins par mois dans le privé, contrat récent (calcul, avant prime d’activité).",
    "argsUp": [
      "Elle relève la paie nette d’apprentis le plus souvent moins payés qu’un salarié (gouvernement, 2025), pour développer l’apprentissage (PAP).",
      "L’OFCE (2023) juge l’apprentissage très efficace pour l’insertion professionnelle des jeunes, surtout peu qualifiés."
    ],
    "argsDown": [
      "Le gouvernement, qui voulait la supprimer (2025), la juge difficile à justifier selon les règles des cotisations, dues même à temps partiel.",
      "La même évaluation : rien ne prouve qu’elle pousse fortement à l’apprentissage, qui dépend surtout des places en formation et en entreprise."
    ],
    "sources": [
      {
        "title": "Annexe 9 au PLFSS 2026, article 9 « Rationaliser certaines exonérations spécifiques », mesure proposée par le gouvernement (p. 52)",
        "publisher": "Direction de la sécurité sociale, pour le gouvernement (annexe 9 au PLFSS 2026, fiches d’évaluation préalable des articles)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2026/PLFSS2026-Annexe09-GenerationXBOOK_avec%20couverture.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Montant du Smic, fiche F2300 (vérifiée le 1er juin 2026)",
        "publisher": "Service-public.gouv.fr (DILA)",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300",
        "date": "2026-06-01",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Apprentissage : un bilan des années folles, OFCE Policy brief n° 117 (Bruno Coquet), résumé p. 1",
        "publisher": "OFCE (Sciences Po)",
        "url": "https://www.ofce.fr/pdf/pbrief/2023/OFCEpbrief117.pdf",
        "date": "2023-06-14",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "aides-employeurs-apprentis": {
    "what": "Une aide de l’État à l’employeur d’un apprenti, la première année : 5 000 € au plus pour une entreprise de moins de 250 salariés et un apprenti jusqu’au bac, moins sinon, 6 000 € pour un apprenti handicapé. En 2023-2024 : 6 000 € au plus pour tout contrat.",
    "who": "Les employeurs d’apprentis, surtout des entreprises (plus de 825 000 des 847 000 entrées de 2025) : 2,0 Md€ en 2027, de l’ordre de 2 400 € par contrat (calcul : crédits de 2027 rapportés aux entrées de 2025).",
    "up": "+10 % : 0,21 Md€ de dépense en plus, soit 5 500 € au lieu de 5 000 € pour une entreprise de moins de 250 salariés et un apprenti jusqu’au bac. +100 % : 10 000 € ; 2,0 à 2,4 Md€ (estimation).",
    "down": "−10 % : 0,21 Md€ de dépense en moins, soit 4 500 € au lieu de 5 000 € pour une entreprise de moins de 250 salariés et un apprenti jusqu’au bac. −100 % : plus d’aide ; 1,7 à 2,1 Md€ (estimation).",
    "argsUp": [
      "L’OFCE (2023) attribue à l’aide exceptionnelle de 2020-2022 l’essentiel de la hausse : +460 000 apprentis sur +543 000 entre 2018 et 2022.",
      "Le Haut Conseil des finances publiques (2026) : le resserrement du soutien à l’apprentissage pourrait peser sur les embauches en 2027."
    ],
    "argsDown": [
      "Selon la Cour des comptes (2022), l’aide exceptionnelle couvrait en 2020-2021 près de 90 % des contrats, d’où des effets d’aubaine.",
      "L’OFCE (2023) : mieux ciblée sur les jeunes les plus éloignés de l’emploi, l’aide exceptionnelle aurait coûté 5 Md€ de moins en 2021."
    ],
    "sources": [
      {
        "title": "Apprentissage : un bilan des années folles, OFCE Policy brief n° 117 (Bruno Coquet), résumé p. 1",
        "publisher": "OFCE (Sciences Po)",
        "url": "https://www.ofce.fr/pdf/pbrief/2023/OFCEpbrief117.pdf",
        "date": "2023-06-14",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "La formation en alternance, rapport public thématique, juin 2022 (p. 46)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20220623-Formation-en-alternance.pdf",
        "date": "2022-06-23",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour 2027, § 55 (p. 18)",
        "publisher": "Haut Conseil des finances publiques",
        "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
        "date": "2026-09-25",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "exonerations-jeunes-entreprises": {
    "what": "Deux exonérations de cotisations pour de jeunes entreprises : les jeunes entreprises innovantes ou de croissance (JEI, JEC) en paient moins sur leurs salariés de recherche, huit ans au plus ; les créateurs aidés (Acre), la première année.",
    "who": "Les JEI et JEC (207 M€ en 2027) et les créateurs ou repreneurs aidés, micro-entrepreneurs compris (204 M€) ; fin 2024, 114 876 indépendants, hors micro-entrepreneurs, avaient l’Acre. L’État rembourse les caisses.",
    "up": "+10 % : coûterait 0,024 à 0,042 Md€ (estimation). Doubler (+100 %) : 0,21 à 0,42 Md€. Le bas tient compte de la réduction générale que la hausse remplacerait sur une part des salaires des JEI.",
    "down": "−10 % : rapporterait 0,024 à 0,042 Md€ (estimation). Supprimer (−100 %) : 0,21 à 0,42 Md€. Le bas tient compte de la réduction générale, qui reprendrait une part des salaires des JEI et coûte aussi.",
    "argsUp": [
      "L’Insee (2021) voit un effet positif, mais faible et incertain, sur l’emploi, recherche comprise, des JEI entrées dès leur 2e année (16 %).",
      "Depuis 2026, l’Acre, ramenée à 25 % des cotisations, va surtout aux créateurs les plus vulnérables : chômeurs, RSA, jeunes (PAP 2027)."
    ],
    "argsDown": [
      "Le gouvernement, qui proposait en 2025 de la réduire, juge la JEI trop coûteuse au regard de son apport limité à l’emploi et à l’innovation.",
      "Pour l’Acre, la même évaluation relève qu’aucune étude ne montre d’effet sur le nombre de créations d’entreprises, déjà très élevé."
    ],
    "sources": [
      {
        "title": "Dispositif « jeune entreprise innovante » : un effet faible et incertain sur l’emploi des entreprises bénéficiaires, Insee Analyses n° 68 (S. Quantin, S. Bunel, C. Lenoir)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/5759583",
        "date": "2021-10-28",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Travail, emploi et administration des ministères sociaux, programme 103, sous-action 05.06 « Exonérations de soutien à la création d’entreprise » (p. 152)",
        "publisher": "Ministère du travail, PAP annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128284/file/PAP%202027%20-%20Travail%20emploi%20et%20administration%20des%20minist%C3%A8res%20sociaux.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Annexe 9 au PLFSS 2026, article 9, diagnostic du gouvernement : ACRE (p. 49)",
        "publisher": "Direction de la sécurité sociale, pour le gouvernement (annexe 9 au PLFSS 2026, fiches d’évaluation préalable des articles)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2026/PLFSS2026-Annexe09-GenerationXBOOK_avec%20couverture.pdf",
        "date": "2025-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "zones-aidees-entreprises": {
    "what": "Dans des zones prioritaires (rurales : ZRR, FRR ; zones d’aide régionale, bassins d’emploi à redynamiser ; urbaines : zones franches, quartiers prioritaires), des entreprises paient moins d’impôt sur leurs bénéfices, parfois moins de cotisations.",
    "who": "Environ 74 000 entreprises en 2025 (somme des régimes), dont 52 100 en ZRR, environ 9 000 € d’impôt en moins chacune (calcul), et 12 000 en zone franche urbaine. Coût 2027 : 570 M€ d’impôt, 82 M€ de cotisations.",
    "up": "+10 % : coûterait 0,031 à 0,066 Md€, environ 900 € d’impôt en moins par an pour une entreprise moyenne en ZRR (calcul, 2025). +100 % : 0,26 à 0,66 Md€. Estimation ; une part ne jouerait qu’en 2028.",
    "down": "−10 % : rapporterait 0,031 à 0,066 Md€, environ 900 € d’impôt en plus par an pour une entreprise moyenne en ZRR (calcul, 2025). −100 % : 0,26 à 0,66 Md€. Estimation ; une part ne jouerait qu’en 2028.",
    "argsUp": [
      "L’Insee (étude de 2012, citée par le Sénat en 2025) attribue aux premières zones franches urbaines 9 700 à 12 200 établissements de plus.",
      "Selon le PAP 2027, les zones rurales et d’aide régionale créent toujours moins d’entreprises que la moyenne : 1,6 point de moins en 2025."
    ],
    "argsDown": [
      "La Cour des comptes (2026) demande d’évaluer ces dépenses fiscales, parmi d’autres, et de supprimer celles à l’efficacité non démontrée.",
      "Pour le Sénat (2025), les zones franches ont surtout attiré des professions libérales, de santé notamment, qui emploient peu : effet réduit."
    ],
    "sources": [
      {
        "title": "Rapport général n° 139 (2025-2026) sur le PLF 2026, tome II, fascicule 1, article 12 (zones franches et quartiers prioritaires), citant Givord et Trevien, « Les zones franches urbaines : quel effet sur l’activité économique ? », Insee Analyses n° 4, mars 2012",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-21/l25-139-212.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Note d’exécution budgétaire 2025, missions Cohésion des territoires, recommandation 4 (p. 9)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "credits-aides-agriculture": {
    "what": "Les aides agricoles de l’État (programme 149) : surtout sa part de l’ICHN, aide de la PAC aux zones de montagne et défavorisées cofinancée par l’Europe, le sucre d’outre-mer, l’eau, les MAEC et le bio ; en haut de fourchette, 156 M€ de calamités agricoles.",
    "who": "Surtout des exploitations : 89 029 bénéficiaires de l’ICHN estimés en 2026, environ 4 260 € par an chacun de la part de l’État (calcul) ; avec l’Europe, l’ICHN dépasse 1 Md€ par an, dont 367 M€ de l’État.",
    "up": "+10 % : 84 à 100 M€ de dépense en plus ; sur l’ICHN seule, environ 430 € de plus par an et par bénéficiaire (calcul). +100 % : 0,62 à 1,00 Md€ (estimation : une part serait payée après 2027).",
    "down": "−10 % : 84 à 100 M€ de dépense en moins ; sur l’ICHN seule, environ 430 € de moins par an et par bénéficiaire (calcul). −100 % : 0,33 à 1,00 Md€ (estimation : une part paie des engagements passés).",
    "argsUp": [
      "Le PAP 2027 juge toujours marqué l’écart de revenu entre zones défavorisées et plaine, ce qui justifie selon lui de maintenir l’ICHN.",
      "Le Sénat (2026) veut négocier après 2028 un plafond plus haut d’aide nationale à la canne, filière de près de 40 000 emplois outre-mer."
    ],
    "argsDown": [
      "La Cour des comptes (2023) : l’aide publique par tonne de sucre d’outre-mer vaut 2 à 4 fois sa valeur ; la canne a reculé de 22 % en 10 ans.",
      "Le Sénat (2025) jugeait qu’une baisse des crédits agricoles ne bloquait pas les engagements, l’aide publique totale restant de 25,2 Md€."
    ],
    "sources": [
      {
        "title": "Les subventions à l’agriculture et à la pêche en outre-mer, observations définitives, synthèse (p. 6)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230907-S2023-0828-Subventions-agriculture-outremer.pdf",
        "date": "2023-09-07",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Financement public des filières sucrières, rapport d’information n° 784 (2025-2026), synthèse, recommandation n° 3 (p. 2)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/r25-784/r25-784-syn.pdf",
        "date": "2026-06-24",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Rapport général n° 139 (2025-2026) sur le PLF 2026, tome III, annexe 3 « Agriculture, alimentation, forêts et affaires rurales »",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-33/l25-139-33_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "soutien-energies-renouvelables": {
    "what": "L’État garantit aux producteurs d’électricité renouvelable (solaire, éolien) et de biométhane un prix fixé par contrat, sur 15 à 20 ans. Il paie l’écart avec le prix de marché : quand ce prix monte, la dépense baisse, et l’inverse.",
    "who": "Le budget de l’État : 125 € par habitant. Il paie à EDF et aux autres acheteurs le surcoût des contrats : solaire 3,6 Md€ (après −0,7 Md€ de prix de gros, tout imputé au solaire), éolien 2,6, biométhane 1,3, autres 1,1.",
    "up": "+1 % : 43 à 87 M€ de plus, 0,6 à 1,2 € par habitant (estimation). Jusqu’à +23 %, comme à la baisse : 0,1 à 2,0 Md€ de plus. Les 10 GW d’éolien en mer attribués en 2027 coûteront surtout après 2027.",
    "down": "−1 % : 43 à 87 M€ de moins, 0,6 à 1,2 € par habitant (estimation). Jusqu’à −23 % (2 Md€, coût 2024 des contrats solaires 2006-2010) : 0,1 à 2,0 Md€ de moins, au-delà des 13 M€ de résiliations du PLF.",
    "argsUp": [
      "La programmation vise 48 GW de solaire installé en métropole continentale en 2030 ; le parc français en avait 31,3 GW fin 2025 (PAP 2027).",
      "Quand le marché dépasse les tarifs, l’écart revient à l’État : 4,8 Md€ net en 2022 et 2023, années de prix élevés (Cour des comptes, 2026)."
    ],
    "argsDown": [
      "Selon le PLF 2027, des contrats solaires de 2006-2010 paient 270 à 600 € le MWh, quand le coût d’installation a été divisé par quatre.",
      "Selon la Cour des comptes (2026), ce soutien a coûté 3,9 Md€ en 2024, 7,3 Md€ prévus en 2025, et les contrats en cours engagent 87 Md€."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 345, action 09 : objet de la dépense (p. 385)",
        "publisher": "Ministère chargé de l’énergie (PAP annexé au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=385",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 345 : crédits par sous-action (p. 379)",
        "publisher": "Ministère chargé de l’énergie (PAP annexé au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=379",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 345 : dépenses pluriannuelles (p. 381)",
        "publisher": "Ministère chargé de l’énergie (PAP annexé au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=381",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 345, sous-action 09.02 « Éolien en mer » (p. 386)",
        "publisher": "Ministère chargé de l’énergie (PAP annexé au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=386",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 345, sous-action 09.03 « Solaire photovoltaïque » (p. 387)",
        "publisher": "Ministère chargé de l’énergie (PAP annexé au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=387",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Évaluations préalables des articles du projet de loi de finances pour 2027, article 82 : contrats photovoltaïques de 2006 et 2010 (p. 662)",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=662",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Évaluations préalables des articles du projet de loi de finances pour 2027, article 82 : problème à résoudre (p. 663)",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=663",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Évaluations préalables des articles du projet de loi de finances pour 2027, article 82 : incidences budgétaires et méthode (p. 666)",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=666",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Le soutien aux énergies renouvelables à travers les charges de service public de l’énergie (rapport public thématique, mars 2026), synthèse, p. 7",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-03/20260318-Soutien-energies-renouvelables-a-travers-charges-service-public-energie_0.pdf#page=7",
        "date": "2026-03",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Le soutien aux énergies renouvelables à travers les charges de service public de l’énergie (rapport public thématique, mars 2026), tableau n° 6, p. 55",
        "publisher": "Cour des comptes (d’après la CRE)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-03/20260318-Soutien-energies-renouvelables-a-travers-charges-service-public-energie_0.pdf#page=55",
        "date": "2026-03",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "is-taux-reduit-pme": {
    "what": "L’impôt sur les sociétés (IS) est de 25 % du bénéfice. Les PME (chiffre d’affaires sous 10 M€, capital détenu à 75 % au moins par des particuliers) paient 15 % sur leurs premiers 42 500 € de bénéfice. Le levier règle ce taux réduit.",
    "who": "Les PME qui font des bénéfices : 760 000 en 2019, pour 2,2 Md€ d’impôt en moins (CPO), quand le taux normal était plus haut. À 25 %, une PME y gagne au plus 4 250 € par an (10 points sur 42 500 €, calcul).",
    "up": "+1 point (16 %), estimation : 0,17 à 0,34 Md€ de plus ; 425 € de plus par an pour une PME au plafond. À +10 points (25 %, fin du taux réduit) : 1,5 à 3,4 Md€ de plus, jusqu’à 4 250 € par PME.",
    "down": "−1 point (14 %), estimation : 0,17 à 0,34 Md€ de moins ; 425 € de moins par an pour une PME au plafond. À −10 points (5 %, même écart qu’à la hausse) : 1,7 à 3,6 Md€ de moins, jusqu’à 4 250 € par PME.",
    "argsUp": [
      "Pour le CPO (2023), ce taux réduit peut freiner la croissance des PME en créant des effets de seuil.",
      "Pour le CPO (2016), ce taux n’a pas favorisé l’émergence d’entreprises moyennes capables de se développer à l’international."
    ],
    "argsDown": [
      "Le CPO (2023) rappelle les justifications : gérer l’impôt coûte plus, en proportion, à une PME ; les grands groupes optimisent davantage.",
      "Selon une étude d’auteurs de l’Insee et de la DGFiP (2025), l’IS pèse 21,4 % du profit des PME en 2022, 14,3 % pour les grandes entreprises."
    ],
    "sources": [
      {
        "title": "Les différences d’imposition sur les bénéfices entre PME et grandes entreprises (rapport, juin 2023), p. 17",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230703-Differences-taxation-entre-PME-et-grandes-entreprises.pdf#page=25",
        "date": "2023-07",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Les différences d’imposition sur les bénéfices entre PME et grandes entreprises (rapport, juin 2023), p. 18",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230703-Differences-taxation-entre-PME-et-grandes-entreprises.pdf#page=26",
        "date": "2023-07",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Les différences d’imposition sur les bénéfices entre PME et grandes entreprises (rapport, juin 2023), annexe 2, p. 46",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230703-Differences-taxation-entre-PME-et-grandes-entreprises.pdf#page=54",
        "date": "2023-07",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Projet de loi de finances pour 2027, évaluations préalables des articles, article 15 (p. 155)",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf#page=155",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "La réforme du taux statutaire de l’Impôt sur les Sociétés, document de travail n° 2025-18, résumé (p. 4 du PDF)",
        "publisher": "Insee, document de travail (auteurs de l’Insee et de la DGFiP ; n’engage que ses auteurs)",
        "url": "https://www.insee.fr/fr/statistiques/fichier/version-html/8635773/DT2025-18.pdf#page=4",
        "date": "2025-09",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "plus-values-titres-participation": {
    "what": "Quand une société revend des parts d’une autre détenues depuis au moins deux ans (titres de participation), 88 % de sa plus-value sont taxés à 0 % et 12 % au taux normal de 25 % : environ 3 % en tout. Le levier règle ces 12 %.",
    "who": "Environ 12 000 sociétés par an, dans tous les secteurs ; 70 % des sommes viennent de sièges sociaux et de holdings, et les dix premières déclarent 35 % des plus-values. Le régime rapporte environ 1 Md€ par an.",
    "up": "Part à 25 % : 6,25 M€ d’impôt pour 100 M€ de plus-value, contre 3 M€ ; 0,5 à 1,5 Md€ de plus. À 100 %, estimation : 2,0 à 9,9 Md€ de plus, large : des ventes peuvent être reportées ou faites ailleurs.",
    "down": "Part à 0 % : aucun impôt pour 100 M€ de plus-value, contre 3 M€ ; 0,5 à 1,4 Md€ de moins. C’est la borne : pas de part négative. Statique : ventes avancées ou faites en France non comptées.",
    "argsUp": [
      "La Cour des comptes (2026) rapporte un coût, face au taux normal, estimé à 5,7 Md€ (2025), peut-être 7 Md€ par an en moyenne (2019-2024).",
      "Selon des auteurs de l’Insee et de la DGFiP (2025), ces taux ôtent 12,4 points au taux d’impôt des grandes entreprises en 2021, 4,9 en 2022."
    ],
    "argsDown": [
      "Pour la Cour des comptes (2026), le taux nul est devenu la norme en Europe, et la part imposée en France est plus haute qu’ailleurs.",
      "La Cour (2026) rapporte qu’il viserait aussi à éviter une double imposition des bénéfices des filiales, comme pour les dividendes."
    ],
    "sources": [
      {
        "title": "La fiscalité des plus-values de long terme sur les cessions de titres de participation, au cœur de la concurrence fiscale européenne (observations définitives, juin 2026), synthèse, p. 7",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260609-S2026-0514-Niche-Cope.pdf#page=7",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "La fiscalité des plus-values de long terme sur les cessions de titres de participation, au cœur de la concurrence fiscale européenne (observations définitives, juin 2026), synthèse, p. 8",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260609-S2026-0514-Niche-Cope.pdf#page=8",
        "date": "2026-06",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "La fiscalité des plus-values de long terme sur les cessions de titres de participation, au cœur de la concurrence fiscale européenne (observations définitives, juin 2026), synthèse, p. 9",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260609-S2026-0514-Niche-Cope.pdf#page=9",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "La réforme du taux statutaire de l’Impôt sur les Sociétés, document de travail n° 2025-18, section 4 (p. 41)",
        "publisher": "Insee, document de travail (auteurs de l’Insee et de la DGFiP ; n’engage que ses auteurs)",
        "url": "https://www.insee.fr/fr/statistiques/fichier/version-html/8635773/DT2025-18.pdf#page=45",
        "date": "2025-09",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "valeurs-locatives-industrielles": {
    "what": "Usines et ateliers lourds paient la taxe foncière et la cotisation foncière des entreprises (CFE) sur une « valeur locative », un loyer théorique tiré de leur prix de revient. Depuis 2021, elle est réduite de moitié. Le levier règle cette réduction.",
    "who": "Environ 32 000 entreprises industrielles (86 000 sites) : un gain brut évalué à 3,3 Md€ en 2021, environ 100 000 € par entreprise en moyenne (calcul). L’État compense communes et intercommunalités : 4,06 Md€ en 2027.",
    "up": "+10 points (60 %), estimation : 0,6 à 1,1 Md€ d’impôt en moins, 19 000 à 34 000 € par entreprise en moyenne. À 100 % (aucun impôt foncier dû) : 2,8 à 5,5 Md€ en moins, pour les communes ou l’État.",
    "down": "−10 points (40 %), estimation : 0,6 à 1,1 Md€ d’impôt en plus, 19 000 à 34 000 € par entreprise en moyenne. À 0 % (valeur entière, comme avant 2021) : 2,8 à 5,5 Md€ en plus ; l’État ne compense plus.",
    "argsUp": [
      "Le CPO (2025) relève que l’industrie paie 24,4 % de la CFE, alors qu’elle représente 6,2 % des entreprises qui la doivent.",
      "D’après l’IPP, cité par le CPO (2025), les allègements des impôts de production de 2010 et 2021 ont baissé les coûts de l’industrie."
    ],
    "argsDown": [
      "Le CPO (2025) : aucune étude ne montre d’effet de la CFE seule sur la compétitivité ; un effet sur le choix entre territoires est réfuté.",
      "Selon le PLF 2027, la compensation a été minorée de 19,3 % en 2026, dans la limite de 2 % des recettes : les communes en portent une part."
    ],
    "sources": [
      {
        "title": "Rapport sur la situation des finances publiques locales, annexe au projet de loi de finances pour 2027, encadré « La baisse de moitié de la CFE et de la TFPB des établissements industriels », p. 68",
        "publisher": "Gouvernement (annexe au PLF 2027, Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128183/file/Rapport%20sur%20la%20situation%20des%20finances%20publiques%20locales.pdf#page=68",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), article 41, état A, ligne 3145 (p. 126)",
        "publisher": "Gouvernement, projet de loi de finances pour 2027 déposé à l’Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf#page=126",
        "date": "2026-10-01",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), p. 81 et 82",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf#page=93",
        "date": "2025-09",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), p. 82 (travaux de l’IPP pour le CPO)",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf#page=94",
        "date": "2025-09",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), p. 84 et 85",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf#page=96",
        "date": "2025-09",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Tracer un cadre fiscal et social pluriannuel pour l’industrie française (rapport, septembre 2025), p. 85",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-09/20250922-Tracer-cadre-fiscal-et-social-pluriannuel%20pour-industrie-francaise.pdf#page=97",
        "date": "2025-09",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "smic-coup-de-pouce": {
    "what": "Le Smic est le salaire horaire minimum. La loi le relève chaque 1er janvier (inflation et moitié du gain de pouvoir d’achat du salaire ouvrier et employé), et en cours d’année si les prix montent de 2 % ou plus ; l’État peut ajouter un « coup de pouce ».",
    "who": "Salariés : 12,4 % touchés par la hausse de novembre 2024. Employeurs : la hausse, moins les exonérations. Public : ces allègements et la paie des agents, nets de cotisations et d’impôt en plus, de prestations en moins.",
    "up": "+2 % : 0,25 € l’heure, 37,5 € brut par mois à temps plein ; coût public estimé 0,5 à 1,1 Md€ si les allègements suivent, bien moins s’ils restent gelés. À +10 % : 2,5 à 7,7 Md€, emploi non compté.",
    "down": "Pas de réglage sous la revalorisation légale, plancher fixé par le Code du travail. Revenir au PLF annule le coût ; une hausse décidée en cours d’année ne compte que pour les mois restants.",
    "argsUp": [
      "Pour les experts du Smic (2025), le salaire minimum allemand de 2015 a surtout réduit les minijobs, sans effet notable sur l’emploi total.",
      "Espagne, 2019 : +22 % a accru le revenu des ménages visés, réduit la pauvreté, malgré des emplois perdus dans les firmes exposées (experts)."
    ],
    "argsDown": [
      "Le Smic vaut 62,5 % du salaire médian, ratio le plus haut d’Europe ; le risque pour les peu qualifiés croît près du médian (experts, 2025).",
      "Pour les experts (2017), 23 % des bénéficiaires d’une hausse vivent dans un ménage pauvre ; la prime d’activité cible mieux la pauvreté."
    ],
    "sources": [
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (1er décembre 2017), tableau 9, p. 82",
        "publisher": "Groupe d’experts sur le Smic (chiffrage de la DG Trésor, modèle Saphir)",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/174000842.pdf#page=82",
        "date": "2017-12-01",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (1er décembre 2017), éléments de synthèse, p. 5",
        "publisher": "Groupe d’experts sur le Smic",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/174000842.pdf#page=5",
        "date": "2017-12-01",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), synthèse, p. 5",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=9",
        "date": "2025-11-25",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), synthèse, p. 7",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=11",
        "date": "2025-11-25",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), synthèse, p. 6",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=10",
        "date": "2025-11-25",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), principaux résultats, p. 28",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=32",
        "date": "2025-11-25",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), p. 43",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=47",
        "date": "2025-11-25",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), encadré I.4, p. 74",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=78",
        "date": "2025-11-25",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance, rapport du groupe d’experts (25 novembre 2025), chapitre 5, tableau des règles nationales, p. 179",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la DG Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716#page=183",
        "date": "2025-11-25",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.6 « Les dispositifs d’exonération en faveur de l’emploi » (p. 68)",
        "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=68",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "minimum-pension-carriere-complete": {
    "what": "Plancher de la pension de base du privé, au prorata des trimestres, si le départ est à taux plein. Il vise depuis 2023 une retraite de 85 % du Smic net (1 256 € par mois) après une carrière complète au Smic. Le réglage vaut aussi pour les retraités actuels.",
    "who": "4,7 millions de retraités touchent ce « minimum contributif » à la Cnav, près de 1 million à la MSA (2023) : 7,5 Md€ par an avec les minima agricoles. La hausse de 2023 a rapporté 30 à 45 € par mois en moyenne.",
    "up": "+1 point : jusqu’à 14,78 € de plus par mois, 0,14 à 0,24 Md€ de dépense en plus en 2027 (estimation). +7 points, la hausse de 2023 doublée : 1,0 à 1,7 Md€ (estimation). Jusqu’à 100 % du Smic net.",
    "down": "−1 point : jusqu’à 14,78 € de moins par mois, 0,14 à 0,24 Md€ de dépense en moins en 2027 (estimation). −7 points, la hausse de 2023 annulée : 1,0 à 1,7 Md€ (estimation). Jusqu’à 70 % du Smic net.",
    "argsUp": [
      "Pour la Cour des comptes (2026), 28 % des retraités à petite pension sont pauvres, près du triple de l’ensemble des retraités (10 %).",
      "La Cour (2026) note que les femmes, aux pensions de 40 % plus basses que celles des hommes, sont les trois quarts des bénéficiaires."
    ],
    "argsDown": [
      "Pour la Cour (2026), les niveaux de vie varient : avec les revenus du ménage, un quart de ces retraités dépasse le niveau de vie médian.",
      "La Cour (2026) juge que la hausse de 2023 aurait pu être mieux ciblée, en ne relevant que les trimestres cotisés."
    ],
    "sources": []
  },
  "capital-naissance": {
    "what": "L’État verserait une somme sur un compte au nom de chaque enfant né en 2027, placée et bloquée jusqu’à sa retraite : une épargne par capitalisation, dont la valeur à la sortie dépendra des placements. Le PLF 2027 ne prévoit rien de tel.",
    "who": "Les quelque 630 000 enfants nés en 2027 (645 000 naissances en 2025, Insee) le recevraient. L’État paierait l’année de la naissance : 0,23 à 4,0 Md€ selon le montant (estimation). Le coût revient chaque année.",
    "up": "500 € par enfant : 0,23 à 0,40 Md€ en 2027. 1 000 € : 0,47 à 0,79 Md€, environ 9 € par habitant (calcul). 2 000 € : 0,9 à 1,6 Md€. 5 000 € : 2,3 à 4,0 Md€ (estimations).",
    "down": "C’est le réglage du PLF 2027 : aucun versement, aucun coût. Le levier ne descend pas plus bas ; revenir à « Aucun » retire tout le coût du montant choisi.",
    "argsUp": [
      "Le CAE (2021) défend un capital garanti à tous, pour réduire les écarts de patrimoine au bas de l’échelle.",
      "Le COR note que la répartition dépend de la démographie (1,3 cotisant par retraité en 2070), la capitalisation surtout des marchés."
    ],
    "argsDown": [
      "Le CAE (2021) le veut versé à la majorité, pour aider à se former ou se loger, et non bloqué jusqu’à la retraite.",
      "France Stratégie (2017) note qu’un capital versé à tous pose des questions de montant, de financement et de conditions d’usage."
    ],
    "sources": [
      {
        "title": "Repenser l’héritage, Les notes du Conseil d’analyse économique n° 69 (p. 10)",
        "publisher": "Conseil d’analyse économique",
        "url": "https://cae-eco.fr/static/pdf/cae-note069.pdf",
        "date": "2021-12",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Peut-on éviter une société d’héritiers ?, La note d’analyse n° 51 (p. 12)",
        "publisher": "France Stratégie (aujourd’hui Haut-commissariat à la stratégie et au plan)",
        "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/2017%20SP/2017-01-04%20-%20NA%2051%20-%20Peut-on%20%C3%A9viter%20une%20soci%C3%A9t%C3%A9%20d%27h%C3%A9ritiers/na_51-transmissions-ok_0.pdf",
        "date": "2017-01",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Rapport annuel du COR, juin 2026 : Évolutions et perspectives des retraites en France (partie 2, chapitre 2, p. 72)",
        "publisher": "Conseil d’orientation des retraites",
        "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Répartition, réserves et capitalisation : quels enjeux pour les retraites ? Le dossier en bref, séance plénière du 18 décembre 2025 (p. 2)",
        "publisher": "Conseil d’orientation des retraites (secrétariat général)",
        "url": "https://www.cor-retraites.fr/sites/default/files/2025-12/Dossier%20en%20bref_18.12.2025.pdf",
        "date": "2025-12-18",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "epargne-retraite-per": {
    "what": "Les versements sur un plan d’épargne retraite (PER), bloqués en principe jusqu’à la retraite, sont déduits du revenu puis imposés à la sortie. Plafond : 10 % des revenus d’activité, de 4 710 à 37 680 € par personne en 2026, plus les plafonds non utilisés.",
    "who": "1,6 million d’épargnants (hors indépendants) déduisaient des versements de 2021. Coût : au moins 1,8 Md€ par an, impôt de sortie déduit (Cour des comptes) ; 3,4 Md€ de recettes perdues sur l’année 2027 (estimation).",
    "up": "+50 % : 1,2 à 2,2 Md€ de recettes en moins en 2027 (estimation). Pour 1 700 € versés, un foyer imposé à 30 % a 510 € d’impôt de moins, 765 € à +50 % ; à 11 %, 187 € (calcul). Jusqu’à +100 %.",
    "down": "−50 % : 1,2 à 2,2 Md€ de recettes en plus (estimation) ; le foyer imposé à 30 % aurait 255 € d’impôt de moins au lieu de 510 € (calcul). Jusqu’à la suppression (−100 %).",
    "argsUp": [
      "Selon la Cour des comptes (2024), le PER complète la retraite de ceux dont la pension sera faible au regard de leur salaire.",
      "L’étude d’impact de la loi Pacte (2018) en attendait une épargne longue orientée vers les fonds propres des entreprises."
    ],
    "argsDown": [
      "Pour la Cour des comptes (2024), l’avantage profite surtout à des épargnants aisés et relativement âgés : près de 45 % sont imposés à 30 %.",
      "La Cour (2024) note que la déduction n’est plus comptée parmi les dépenses fiscales depuis 2011, bien qu’elle coûte au budget."
    ],
    "sources": [
      {
        "title": "Épargne retraite : déduction des cotisations du revenu imposable",
        "publisher": "Direction de l’information légale et administrative (Premier ministre), Service-Public.fr",
        "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F14709",
        "date": "2026-04-15",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Projet de loi relatif à la croissance et la transformation des entreprises (n° 1088), étude d’impact, article 20 « Réforme de l’épargne retraite », impacts économiques (p. 259)",
        "publisher": "Gouvernement (étude d’impact jointe au projet de loi déposé à l’Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/15/textes/l15b1088_etude-impact.pdf",
        "date": "2018-06-20",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "franchises-medicales": {
    "what": "Sommes retenues sur les remboursements, que la complémentaire ne peut pas rembourser : 2 € par consultation, analyse ou radio (participation), 1 € par boîte ou acte paramédical et 4 € par transport (franchises). Chacune des deux plafonnée à 70 € par an.",
    "who": "48 millions d’assurés les paient, 18 millions en sont exemptés (mineurs, complémentaire santé solidaire, grossesse). En moyenne 52 € par an et par assuré ; 78 € en ALD, 41 € pour les autres (Cour, plafonds de 50 €).",
    "up": "+100 % (4 € par consultation, 2 € par boîte, plafonds de 140 €) : 2,2 à 2,9 Md€ de remboursements en moins en 2027, soit 46 à 59 € de plus par an et par assuré concerné en moyenne (calcul).",
    "down": "−100 %, la suppression : 2,5 à 2,9 Md€ de remboursements en plus, soit 52 à 59 € de moins par an et par assuré concerné en moyenne (calcul).",
    "argsUp": [
      "Pour la Cour (2026), elles sont « nécessaires » au rééquilibrage de la branche maladie, à des niveaux limités face à d’autres pays.",
      "La Cour (2026) note que la part des dépenses de santé payée par les ménages (10,2 % en 2023) reste l’une des plus faibles de l’OCDE."
    ],
    "argsDown": [
      "Pour la Cour (2026), l’effet sur la consommation n’est pas démontré : en 2024, année du doublement, 200 millions de boîtes de plus.",
      "Une étude de la DREES citée par la Cour (2026) : relever montants et plafonds pèserait deux fois plus sur les ménages en mauvaise santé."
    ],
    "sources": []
  },
  "prise-en-charge-assurance-maladie": {
    "what": "Le « ticket modérateur » est la part d’un soin que la Sécurité sociale laisse au patient ou à sa complémentaire. Il monte en janvier 2027 (dentaire, dispositifs médicaux, médicaments) et le PLFSS fait passer 0,7 Md€ de remboursements aux complémentaires.",
    "who": "Les complémentaires ont payé 33,5 Md€ de soins en 2025, les ménages 19,7 Md€ de leur poche (DREES). Ce que la Sécurité sociale cesse de rembourser passe aux patients ou, par les primes, aux assurés des complémentaires.",
    "up": "Garder 2026 : 1,9 Md€ (HCFP), 27 € par habitant. Sécu à 100 % des soins remboursables : 22,3 à 37,1 Md€ (estimation) ; primes de 250 à 1 110 € de moins par an, prélèvements en hausse (HCAAM, 2017).",
    "down": "Autant de transferts en plus : 1,4 à 2,4 Md€ d’économies (estimation), 20 à 35 € par habitant. Pas au-delà : le transfert plus large du HCAAM rembourse le reste à 100 % et coûte 2,9 Md€ (2017).",
    "argsUp": [
      "Le HCAAM (2022) rappelle que 4 % des personnes n’ont pas de complémentaire, « un facteur important du renoncement aux soins ».",
      "Selon le HCAAM (2022), la Sécu à 100 % éviterait 5,4 Md€ de frais de gestion (2017), le gain net des assurés et des employeurs."
    ],
    "argsDown": [
      "Pour le HCAAM (2022), la Sécurité sociale à 100 % ferait monter des prélèvements obligatoires déjà très élevés : 22,5 Md€ à financer (2017).",
      "La CCSS (2026) prévoit 13,8 Md€ de déficit pour l’assurance maladie en 2027 avant mesures ; ces transferts le réduisent."
    ],
    "sources": [
      {
        "title": "Les dépenses de santé en 2025, édition 2026, fiche 06 « Le financement par les organismes complémentaires », tableau 1 (p. 2)",
        "publisher": "DREES (comptes de la santé)",
        "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-09/CNS2026%20-%20Fiche%2006%20-%20Le%20financement%20par%20les%20organismes%20compl%C3%A9mentaires.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "journee-solidarite-csa": {
    "what": "Depuis la loi de 2004, les salariés travaillent une journée de plus par an sans être payés (7 heures) : la journée de solidarité. En contrepartie, l’employeur verse la CSA, 0,3 % de sa masse salariale, à la branche autonomie (personnes âgées, handicap).",
    "who": "Les employeurs, privés et publics : 2,42 Md€ prévus en 2027, avant les mesures du PLFSS. Les salariés travaillent 7 heures sans salaire. La branche autonomie reçoit tout ; elle serait alors en déficit de 0,1 Md€.",
    "up": "+1 jour (CSA à 0,6 %) : 1,5 à 2,6 Md€ de recettes en plus par an. Salariés : 7 h non payées (86 € brut au Smic). Employeur : 7 h de travail et 67 € de CSA en plus au Smic (avant réduction générale).",
    "down": "−1 jour : 1,5 à 2,2 Md€ de recettes en moins par an (au plus la CSA nette). Salariés : 7 h gardées (86 € brut au Smic). Employeur : 7 h et 67 € de CSA en moins. Aucune source retenue ne le propose.",
    "argsUp": [
      "Pour les personnes âgées, il manque 2,1 Md€ en 2030 ; parmi d’autres pistes, dont la CSG, trois Hauts Conseils citent une CSA à 0,6 %.",
      "La DG Trésor, citée par le Sénat (2025), juge qu’une journée travaillée de plus, du type journée de solidarité, peut accroître le PIB."
    ],
    "argsDown": [
      "Le CAE (Sénat, 2025) : le problème en France est le taux d’emploi, non les heures des actifs ; réduire les congés semble peu pertinent.",
      "Pour un jour de plus payé, le Sénat (2025) note que, sous le potentiel d’activité, il pourrait détruire des emplois et creuser le déficit."
    ],
    "sources": [
      {
        "title": "Revalorisation annuelle du SMIC au 1er juin 2026",
        "publisher": "DREETS Normandie (ministère du Travail et des Solidarités)",
        "url": "https://normandie.dreets.gouv.fr/Revalorisation-annuelle-du-SMIC-au-1er-juin-2026",
        "date": "2026-05-22",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Salaire minimum interprofessionnel de croissance : rapport du Groupe d’experts (25 novembre 2025), chapitre 4, graphique IV.6 (p. 143)",
        "publisher": "Groupe d’experts sur le Smic (rapport publié par la Direction générale du Trésor)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/284b121f-b187-4280-b327-05f18064c3fa/files/1d1d1848-48bb-40a9-a14f-585b8072e716",
        "date": "2025-11-25",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "conge-second-parent": {
    "what": "Après une naissance, le second parent a 3 jours payés par l’employeur, puis le congé de paternité et d’accueil de l’enfant : 25 jours (32 pour des jumeaux), dont 4 obligatoires, indemnisés par la Sécurité sociale jusqu’à 101,94 € par jour (2025).",
    "who": "Branche famille : 700 M€ prévus en 2027 (avant les mesures du PLFSS) ; agents publics : salaire maintenu par l’employeur. En 2023, 310 000 pères du régime général l’ont pris, 23 jours en moyenne, à 70 € par jour.",
    "up": "Aligné sur la mère (10 semaines) : 1,3 à 1,8 Md€ de dépenses en plus par an (le haut est un majorant). Un père payé 70 € par jour (moyenne 2023) toucherait jusqu’à 45 jours de plus, environ 3 150 €.",
    "down": "11 jours, comme avant juillet 2021 : 0,29 à 0,49 Md€ de dépenses en moins par an (estimation ; aucune source retenue ne le propose). Un père perdrait 14 jours indemnisés, environ 980 €.",
    "argsUp": [
      "Le CAE (2024), cité par l’Assemblée (2025), part de l’idée que si les pères s’arrêtaient davantage, la carrière des mères en pâtirait moins.",
      "L’IGF et l’IGAS (2026) jugent nécessaire d’allonger les congés, surtout du second parent : un mois de plus, −3 % de besoins de garde."
    ],
    "argsDown": [
      "L’IGF et l’IGAS (2026) notent que ce congé est en France plus long qu’en moyenne (OCDE 2,5 semaines, UE 3,2), celui de la mère plus court.",
      "L’IGF et l’IGAS (2026) veulent évaluer le congé supplémentaire de naissance (2026) avant de réfléchir à allonger les congés des parents."
    ],
    "sources": [
      {
        "title": "Revue de dépenses relative à l’efficacité des politiques familiales (juin 2026), annexe VII (p. 332 du PDF)",
        "publisher": "Inspection générale des finances et Inspection générale des affaires sociales",
        "url": "https://igas.gouv.fr/sites/igas/files/2026-08/Revue%20de%20d%C3%A9penses_politiques%20familiales%20%282026%29.pdf",
        "date": "2026-06",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "rsa-18-24-ans": {
    "what": "Le RSA, revenu minimum : 652 € par mois pour une personne seule sans revenu (2026), dès 25 ans, avant pour les parents et ceux qui ont travaillé deux ans sur trois. Sinon, le contrat d’engagement jeune verse jusqu’à 566 € par mois, contre un parcours.",
    "who": "Les départements versent l’essentiel du RSA : 12,2 Md€ en 2023, 1,85 million de foyers. Environ 0,87 million de 18-24 ans sont sans emploi, études ni formation (estimation) ; 0,08 million de moins de 25 ans ont le RSA.",
    "up": "Dès 21 ans : 0,09 à 0,22 million de jeunes au RSA, 0,4 à 1,5 Md€ de dépenses en plus ; dès 18 ans : 0,14 à 0,35 million, 0,6 à 2,4 Md€ (estimations). Chacun : jusqu’à 667 € par mois en 2027.",
    "down": "Dès 29 ans : 0,4 à 1,1 Md€ de dépenses en moins (estimation ; aucune source retenue ne le propose). 0,11 à 0,15 million d’allocataires de 25 à 28 ans sans enfant perdraient jusqu’à 667 € par mois.",
    "argsUp": [
      "La Cour des comptes (2022) note que la France est l’un des six pays de l’Union qui n’ouvrent pas le revenu minimum dès la majorité.",
      "Une étude citée par la Cour (2022) ne voit pas d’effet désincitatif marqué sur l’emploi des jeunes qui atteignent 25 ans, l’âge du RSA."
    ],
    "argsDown": [
      "Pour la Cour des comptes (2022), l’âge de 25 ans suit l’idée qu’avant, la solidarité familiale joue d’abord, puis la solidarité nationale.",
      "La Cour (2022) note que les aides des 18-24 ans exigent formation ou parcours ; aujourd’hui, le CEJ verse jusqu’à 566 € par mois (PAP 2027)."
    ],
    "sources": [
      {
        "title": "Projet annuel de performances 2027, mission Solidarité, insertion et égalité des chances : RSA recentralisé (p. 42)",
        "publisher": "Ministère chargé des solidarités (annexe au projet de loi de finances pour 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Minima sociaux et prestations de solidarité, édition 2025, fiche 07 « Les dépenses d’allocations », tableau 1",
        "publisher": "DREES",
        "url": "https://www.drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2007%20-%20Les%20d%C3%A9penses%20d%27allocations.pdf",
        "date": "2025-12",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Le revenu de solidarité active, évaluation de politique publique (janvier 2022) (p. 62)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2022-01/20220113-rapport-RSA.pdf",
        "date": "2022-01-13",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "non-recours-versement-automatique": {
    "what": "Beaucoup de foyers qui ont droit au RSA (revenu minimum) ou à la prime d’activité (complément des travailleurs modestes) ne les demandent pas : c’est le non-recours. Ici, une part de ces droits est versée d’office, sur les revenus connus des caisses.",
    "who": "Fin 2021, 3,4 millions de foyers éligibles n’avaient pas la prime d’activité (130 € par mois en moyenne ; petits droits pour un sur trois), 0,56 million pas le RSA (370 €). L’État paie la prime, les départements le RSA.",
    "up": "D’office, un quart des droits non réclamés : 2,0 à 3,8 Md€ de plus versés par an ; la moitié : 4,1 à 7,5 Md€ ; tout : 7,6 à 15,8 Md€ (estimation). Par foyer touché : 130 à 370 € par mois en moyenne.",
    "down": "Pas de réglage à la baisse : le PLF, sans versement d’office, est le plancher (0 Md€), le non-recours y reste ce qu’il est. Aucune source retenue ne propose de l’aggraver.",
    "argsUp": [
      "Selon la DREES (2026), sans non-recours à la prime d’activité, 500 000 ménages pauvres gagneraient 130 € par mois en moyenne.",
      "La Cour (2022) : « en première approche », verser d’office répond aux causes du non-recours (manque d’information, démarches difficiles)."
    ],
    "argsDown": [
      "La DREES (2026) : 15 % des non-recourants à la prime sont pauvres (19 % des recourants) ; y mettre fin réduirait « un peu » la pauvreté.",
      "La Cour (2022) : verser sans demande imposerait d’office les devoirs du RSA ; aucun pays de l’UE ne le faisait alors pour le revenu minimum."
    ],
    "sources": [
      {
        "title": "Non-recours au RSA : plus d’un tiers des foyers éligibles ne le percevaient pas fin 2021, Études et Résultats n° 1370 (p. 1)",
        "publisher": "DREES",
        "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-05/ER1370_Non-recours_RSA.pdf",
        "date": "2026-05",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Le revenu de solidarité active, évaluation de politique publique (janvier 2022), encadré « L’automatisation de l’attribution comme réponse au non-recours ? » (p. 65)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2022-01/20220113-rapport-RSA.pdf",
        "date": "2022-01-13",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "emplois-garantis": {
    "what": "Dans 85 territoires, des entreprises à but d’emploi, tenues de ne pas concurrencer les entreprises locales, embauchent en CDI des personnes privées d’emploi depuis plus d’un an. En 2026, l’État paie 95 % du Smic par temps plein, plus une aide à l’embauche.",
    "who": "L’État : 63,06 M€ au PLF 2027 ; les départements, au moins 15 % de la part de l’État (7,5 M€ en 2024). 4 322 salariés en avril 2026. Une partie des emplois évite du RSA, moins qu’escompté selon l’IGF et l’IGAS (2019).",
    "up": "+10 000 emplois : 0,12 à 0,3 Md€ de dépenses nettes en plus par an ; +100 000 : 1,2 à 3 Md€ (estimations, 12 000 à 30 000 € par emploi). Un emploi pour 566 000 chômeurs de longue durée : 6,8 à 17 Md€.",
    "down": "Fin de l’expérimentation : 9 à 37 M€ de dépenses nettes en moins en 2027 (estimation). Les 4 322 salariés perdraient leur CDI ; indemnisés, ils toucheraient 62 à 70 % de leur salaire au Smic.",
    "argsUp": [
      "La Cour des comptes (2025) juge que l’expérimentation a remis en emploi des personnes très éloignées : handicap, seniors, parents isolés.",
      "Selon la Cour (2025), les activités créées répondent à des besoins réels non couverts : isolement, vieillissement, réemploi, réparation."
    ],
    "argsDown": [
      "La Cour (2025) chiffre à 28 000 € par emploi à temps plein l’aide publique en 2023 et juge le déséquilibre financier « patent ».",
      "La Cour (2025) note un résultat d’exploitation agrégé souvent déficitaire et, sans plafond d’embauches, un risque de dépense mal contrôlée."
    ],
    "sources": [
      {
        "title": "L’expérimentation « Territoire zéro chômeur de longue durée » (juin 2025), synthèse (p. 9)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-06/20250620-Experimentation-territoire-zero-ch%C3%B4meur-de-longue-duree.pdf",
        "date": "2025-06-20",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "pensions-alimentaires-defiscalisation": {
    "what": "Après une séparation, le parent qui n’a pas la garde principale verse une pension alimentaire pour l’enfant, 190 € par mois et par enfant en moyenne. Elle est déduite du revenu imposable de qui la verse, imposée chez qui la reçoit. Le levier change ce partage.",
    "who": "Les parents qui versent une pension (non dénombrés) et ceux qui la reçoivent, parmi 2 millions de familles monoparentales, en majorité non imposables. Ordre de grandeur : 10 Md€ de pensions alimentaires en 2023.",
    "up": "Sans déduction chez qui verse : 0,75 à 0,86 Md€ de recettes (2022, actualisé). Pour 190 € par mois, 251 € d’impôt de plus par an à 11 %, 684 € à 30 % (calcul) ; pension imposée des deux côtés.",
    "down": "Exonérer chez qui reçoit : 0,10 à 0,90 Md€ de coût (estimé) ; 226 € de moins par an à 11 %, 616 € à 30 % (calcul). Hors impôt et aides : 1,5 à 1,8 Md€ ; inversion : 0,81 à 0,93 Md€ (2022, actualisés).",
    "argsUp": [
      "IGF-IGAS (2026) étudie un plafond : déduction illimitée pour un enfant mineur, plafonnée pour un majeur (par exemple 6 999 € au PLF 2027).",
      "Sénat (2024) : exonérer la pension reçue devrait aller avec la fin de la déduction de qui la verse, pour ne pas peser sur le budget."
    ],
    "argsDown": [
      "IGF-IGAS (2026), qui écarte un plafond : la pension serait alors imposée deux fois (qui verse, qui reçoit), contre une fois dans un couple.",
      "Sénat (2024) : au Smic, quand la pension remplace l’ASF, chaque euro reçu fait perdre l’ASF et 42 centimes d’aides (taux marginal de 142 %)."
    ],
    "sources": [
      {
        "title": "Rapport d’information n° 485 (2023-2024), tome I, « Familles monoparentales : pour un changement des représentations sociétales »",
        "publisher": "Sénat, délégation aux droits des femmes et à l’égalité des chances entre les hommes et les femmes",
        "url": "https://www.senat.fr/rap/r23-485-1/r23-485-1_mono.html",
        "date": "2024-03-28",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), article 2, G (p. 10)",
        "publisher": "Gouvernement, Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf",
        "date": "2026-10-01",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PLF 2027, évaluations préalables des articles, article 2, p. 13",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "gratuite-creches": {
    "what": "Dans les crèches financées par la Caf (PSU), les familles paient par heure une part de leurs revenus mensuels (barème national). Le levier en fait payer une part par l’argent public, jusqu’à la gratuité, ou plus aux familles, jusqu’au double.",
    "who": "Familles : 1,252 Md€ en 2022 (17 % du coût, Caf 45,8 %, collectivités et employeurs 37,2 %), moins un crédit d’impôt compté la même année. Enfants de familles à bas revenus : 18 % des accueillis, 29 % des moins de 3 ans.",
    "up": "+50 % : 0,52 à 0,93 Md€ de dépense en plus ; l’heure passe de 0,62 à 0,31 € à 1 000 € de revenus, de 3,71 à 1,86 € à 6 000 € (calcul). Gratuité : 1,0 à 2,1 Md€, crédit d’impôt évité non déduit.",
    "down": "−50 % : 0,52 à 0,93 Md€ d’économie ; l’heure passe de 0,62 à 0,93 € à 1 000 € de revenus, de 3,71 à 5,57 € à 6 000 € (calcul). Prix doublé : 0,8 à 1,9 Md€, crédit d’impôt en plus non déduit.",
    "argsUp": [
      "IGF-IGAS (2026) : l’accueil des jeunes enfants aide au développement et réduit les inégalités héritées, surtout si la mère est peu diplômée.",
      "IGF-IGAS (2026) : un enfant de moins de 3 ans réduit l’activité des mères ; l’accès à une garde peut être décisif pour leur emploi."
    ],
    "argsDown": [
      "Cour des comptes (2024) : la crèche coûte déjà le moins aux familles ; elle propose que les plus aisées paient la même part de revenus.",
      "IGF-IGAS (2026) : des crèches accueillent déjà moins d’enfants faute de personnel, et les plans de création de places restent sous-exécutés."
    ],
    "sources": [
      {
        "title": "Fiche méthodologique n° 8 : L’enregistrement des crédits d’impôt en base 2020 (p. 2)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/metadonnees/source/fichier/fichemethodo8_B2020_credit_impots.pdf",
        "date": "2024-05",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "depense-fiscale-ptz": {
    "what": "Sous plafonds de revenus, le prêt à taux zéro aide un premier achat de logement et, au PLF 2027, celui de familles attendant ou ayant un enfant de moins de 3 ans. L’État compense les intérêts à la banque en crédit d’impôt. Le levier règle les prêts de 2027.",
    "who": "Des ménages qui achètent : 72 906 prêts en 2025, 82 900 prévus en 2026 (39 % aux revenus les plus modestes). Par prêt, 23 000 à 25 000 € d’intérêts (calcul), que l’État verse à la banque à la place de l’emprunteur.",
    "up": "+10 % : 0,10 à 0,23 Md€ de dépense en plus, comptée dès 2027 (comptes nationaux) : environ 8 300 prêts de plus ou 2 300 à 2 500 € de plus par prêt (calcul). +100 % : 1,0 à 2,7 Md€ (estimation).",
    "down": "−10 % : autant d’économie, environ 8 300 prêts de moins ou 2 300 à 2 500 € de moins par prêt. −100 %, aucun PTZ en 2027 : 0,8 à 2,3 Md€ (estimation) ; restent dus 1 165 M€ pour les prêts d’avant.",
    "argsUp": [
      "Évaluation annexée au PLF 2027 : le PTZ, simple à obtenir, accroît directement ce que peuvent emprunter les ménages, notamment modestes.",
      "Évaluation annexée au PLF 2027 : élargi en 2025 pour relancer la construction neuve, le PTZ passe de 44 466 prêts (2024) à 72 906 (2025)."
    ],
    "argsDown": [
      "Évaluation annexée au PLF 2027 : les prêts d’une année pèsent sur les cinq budgets suivants, ce qui rend le coût moins facile à maîtriser.",
      "Cour des comptes (2026) : réduire le nombre et le coût des avantages fiscaux du logement, et évaluer tout dispositif avant de le prolonger."
    ],
    "sources": [
      {
        "title": "Rapport évaluant l’efficacité des dépenses fiscales en faveur du développement et de l’amélioration de l’offre de logements (annexe au PLF 2027), mesure n° 210313, p. 40",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1129741/file/9-Jaune%202027%20-%20Evaluation%20des%20d%C3%A9penses%20fiscales%20en%20faveur%20du%20logement.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Note d’exécution budgétaire 2025, mission Cohésion des territoires, p. 74",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "depense-fiscale-eco-ptz": {
    "what": "L’éco-prêt à taux zéro finance, sans intérêts ni condition de revenus, des travaux de rénovation énergétique, jusqu’à 50 000 € sur 20 ans en rénovation globale. L’État compense les intérêts aux banques en crédit d’impôt. Le levier règle les prêts de 2027.",
    "who": "Des ménages qui rénovent un logement qui est ou sera une résidence principale, et des copropriétés : 125 978 éco-prêts individuels et 10 417 logements en copropriété en 2025 ; 146 000 logements prévus en 2027.",
    "up": "+10 % : 34 à 68 M€ de dépense en plus, comptée dès 2027 (comptes nationaux) : environ 13 600 éco-prêts de plus (rythme de 2025) ou un avantage accru. +100 % : 0,34 à 0,81 Md€ (estimation).",
    "down": "−10 % : autant d’économie, environ 13 600 éco-prêts de moins (rythme de 2025) ou un avantage réduit. −100 %, aucun éco-prêt en 2027 : 0,28 à 0,68 Md€ (estimation) ; restent dus 354 M€ (prêts d’avant).",
    "argsUp": [
      "Annexe au PLF 2027 (rénovation) : le plafond de 50 000 € sur 20 ans aide les ménages à payer leur reste à charge après les aides.",
      "PAP 2027 : l’objectif est de rénover 3,9 millions de résidences principales classées F ou G ; l’éco-prêt est l’un des outils prévus."
    ],
    "argsDown": [
      "Annexe au PLF 2027 (rénovation) : avec la remontée des taux, l’État compense plus d’intérêts aux banques ; la dépense peut encore croître.",
      "Direction du budget (Cour, 2026), en général : aides fiscales au logement peu lisibles, crédits d’impôt qui n’aident pas les plus modestes."
    ],
    "sources": [
      {
        "title": "Effort financier de l’État en faveur de la rénovation énergétique des bâtiments (annexe au PLF 2027), p. 23",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1129795/file/28-Jaune%202027%20-%20R%C3%A9novation%20%C3%A9nerg%C3%A9tique%20des%20b%C3%A2timents.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "incitations-bailleurs-prives": {
    "what": "Quatre avantages fiscaux pour qui loue : Relance logement (déduire 3 à 5,5 % par an du prix hors terrain, 12 000 € au plus, loyer abordable), Loc’Avantages (loyer sous le marché), Denormandie (ancien rénové), travaux énergétiques plus largement déductibles.",
    "who": "Des bailleurs imposables et leurs locataires (loyer plafonné ou abordable pour trois des quatre). En 2025 : 6 575 ménages en Loc’Avantages, 2 769 en Denormandie, 7 900 pour les travaux énergétiques. Coût : 57 M€ en 2027.",
    "up": "+10 % : 5,7 M€ de dépense en plus, 180 € de plus par an pour un bailleur Loc’Avantages moyen. +100 % : 46 à 57 M€ (estimation), 1 800 € de plus pour lui (calcul). Effet sur l’offre non compté.",
    "down": "−10 % : 5,7 M€ d’économie, 180 € de moins par an pour un bailleur Loc’Avantages moyen. −100 % (fin des quatre) : 46 à 57 M€ (estimation) ; 1 800 € de moins pour lui, 1 450 € en Denormandie (calcul).",
    "argsUp": [
      "PAP 2027 : Relance logement doit accroître l’offre privée à loyer abordable, louée au moins neuf ans comme résidence principale.",
      "Annexe au PLF 2027 : pour les inspections (2023), Denormandie aide à économiser les sols ; crise sanitaire et durées courtes l’ont freiné."
    ],
    "argsDown": [
      "Évaluation annexée au PLF 2027 : Loc’Avantages visait 20 000 logements par an ; il en a mobilisé 9 685 en 2022, 6 533 en 2025.",
      "CPO (2025), en général : l’aide à l’investissement locatif a orienté l’épargne des ménages moyens vers un patrimoine très peu diversifié."
    ],
    "sources": [
      {
        "title": "PLF 2027, évaluations préalables des articles, article 7, p. 57-58",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128179/file/PLF%202027%20-%20Evaluations%20pr%C3%A9alables.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Rapport évaluant l’efficacité des dépenses fiscales en faveur du développement et de l’amélioration de l’offre de logements (annexe au PLF 2027), mesures n° 130218 et 110269, p. 37",
        "publisher": "Gouvernement (annexe au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1129741/file/9-Jaune%202027%20-%20Evaluation%20des%20d%C3%A9penses%20fiscales%20en%20faveur%20du%20logement.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Corriger les principales distorsions de l’imposition du patrimoine (décembre 2025), p. 58",
        "publisher": "Conseil des prélèvements obligatoires",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251201-Corriger-les-principales-distorsions-de-l-imposition-du-patrimoine.pdf",
        "date": "2025-12",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "credits-service-civique": {
    "what": "Le service civique permet à un jeune de 16 à 25 ans (30 ans en situation de handicap) de s’engager 6 à 12 mois, au moins 24 h par semaine, dans une mission d’intérêt général, contre une indemnité. L’État le finance par l’Agence du service civique.",
    "who": "Jusqu’à 135 000 missions en 2027. Le volontaire touche 619,83 € net par mois, dont 504,98 € de l’État, qui paie 865 € par mois et par jeune. Accueil en 2020 : associations 63 %, État et établissements publics 29 %.",
    "up": "+10 % : 0,026 à 0,046 Md€ de plus, environ 13 500 missions de plus (calcul). +100 % : 0,26 à 0,54 Md€ (estimation), quelque 270 000 missions, 1,8 fois le plus haut atteint (149 878 volontaires, 2024).",
    "down": "−10 % : 0,026 à 0,046 Md€ de moins, environ 13 500 missions de moins (calcul). −100 % : 0,26 à 0,46 Md€ (estimation), plus aucune mission (le fonctionnement de l’Agence, 34,2 M€, n’est pas compté).",
    "argsUp": [
      "Les enquêtes « s’accordent » sur ses « effets durables » sur l’engagement des jeunes ; la Cour veut le conforter (Cour des comptes, 2021).",
      "Crédits passés de 579 M€ en 2025 à 485 M€ en 2027 (−16 %) : 135 000 missions au plus, contre 149 878 volontaires en 2024 (Sénat ; PAP 2027)."
    ],
    "argsDown": [
      "Risque de remplacer des emplois, « souligné par tous les observateurs » ; peu de contrôles : 11 % en 2018 (Cour des comptes, 2021).",
      "Les décrocheurs scolaires restent 17 à 18 % des volontaires, sous l’objectif fixé : 20 % en 2020 (Cour des comptes, 2021)."
    ],
    "sources": [
      {
        "title": "La formation à la citoyenneté (rapport public thématique), encadré « Qu’est-ce que le service civique ? » (p. 53)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20211116-rapport-formation-citoyennete_0.pdf",
        "date": "2021-11-16",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "depense-aide-sociale-enfance": {
    "what": "L’aide sociale à l’enfance (ASE), confiée aux départements, protège les enfants en danger ou qui risquent de l’être : suivi éducatif et aides à domicile, et surtout accueil hors de la famille (famille d’accueil, foyer), le plus souvent décidé par un juge.",
    "who": "392 600 mineurs et jeunes majeurs suivis fin 2024, dont 224 700 accueillis hors de chez eux. Les départements décident et paient : 11,7 Md€ en 2024, dont 63 % environ pour des accueils décidés par un juge (calcul).",
    "up": "+10 % : 1,0 à 1,7 Md€ de plus en 2027 (estimation), 2 600 à 4 300 € de plus par an et par jeune suivi (calcul), par exemple plus de places d’accueil ou d’aides à domicile.",
    "down": "−10 % : 1,0 à 1,7 Md€ de moins en 2027 (estimation), 2 600 à 4 300 € de moins par an et par jeune suivi (calcul), par exemple moins de places d’accueil ou d’aides à domicile.",
    "argsUp": [
      "Les placements montent : plus de 220 000 enfants confiés en 2023 (+18,3 % depuis 2018) ; hébergement +9,5 % en 2024 (Sénat, 2025).",
      "Retard scolaire fréquent : à 11 ans, 40 % des enfants vivant en foyer de l’ASE sont encore en primaire, contre 7 % en moyenne (DREES, 2026)."
    ],
    "argsDown": [
      "Dépense multipliée par 2,7 depuis 1998 (+78 % hors inflation), payée par les départements sans compensation dédiée (DREES, 2024 et 2026).",
      "Financement des foyers « très hétérogène » selon les départements, sans référentiel de coût, souvent reconduit (Cour des comptes, 2020)."
    ],
    "sources": [
      {
        "title": "Rapport général n° 139 (2025-2026) sur le projet de loi de finances pour 2026, tome III, annexe 29 « Solidarité, insertion et égalité des chances »",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-329/l25-139-329_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "La protection de l’enfance : une politique inadaptée au temps de l’enfant (rapport public thématique), « L’absence de référentiel de tarification et de référentiels de coûts » (p. 80) et « La procédure de tarification » (p. 83)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20201130-rapport-protection-enfance_0.pdf",
        "date": "2020-11-30",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "allocation-autonomie-etudiants": {
    "what": "Une somme versée chaque mois à chaque étudiant, quel que soit le revenu de ses parents. Elle n’existe pas aujourd’hui : la principale aide directe, la bourse sur critères sociaux, dépend des revenus des parents (de 1 454 à 6 335 € par an).",
    "who": "Recevraient : 2,26 à 3,12 millions d’étudiants (3 049 600 inscrits à la rentrée 2025). Paierait : l’État, 2,2 à 4,2 Md€ à 100 € par mois (estimation).",
    "up": "100 € par mois : 1 000 à 1 200 € par an et par étudiant, 2,2 à 4,2 Md€ (estimation). 300 € : 6,8 à 12,3 Md€. 634 €, la plus haute bourse : 14,3 à 26,1 Md€. 1 000 € : 22,6 à 41,1 Md€.",
    "down": "Revenir à « pas d’allocation » (PLF) : rien ne change ; les quelque 662 000 boursiers (2024-2025) gardent 1 454 à 6 335 € par an. Baisser les bourses relève d’un autre levier.",
    "argsUp": [
      "Conditions de vie : « un facteur essentiel » de réussite ; les aides directes réduisent le besoin de travailler (ministère, PAP 2027).",
      "20 % des étudiants n’ont pu faire face à leurs besoins et 13 % disent ne pas avoir assez à manger (enquête de l’OVE, 2023)."
    ],
    "argsDown": [
      "La loi privilégie l’aide « sous condition de ressources » ; le repas à 1 € va aussi aux plus aisés (rapporteur spécial à l’Assemblée, 2026).",
      "Une aide pour tous : « une charge trop importante pour les finances publiques », qui ne compléterait plus l’aide familiale (Sénat, 2023)."
    ],
    "sources": [
      {
        "title": "Rapport général n° 139 (2025-2026) sur le projet de loi de finances pour 2026, tome III, annexe 23 « Recherche et enseignement supérieur »",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-323/l25-139-323_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Rapport d’information n° 3008 sur la mise en œuvre des repas CROUS à 1 euro, citant l’enquête « Conditions de vie étudiante » 2023 de l’Observatoire national de la vie étudiante (p. 28)",
        "publisher": "Assemblée nationale, commission des finances",
        "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b3008_rapport-information.pdf",
        "date": "2026-07-02",
        "accessedAt": "2026-10-18"
      },
      {
        "title": "Proposition de loi visant à créer une allocation autonomie universelle d’études, « L’essentiel » de l’examen en commission (6 décembre 2023)",
        "publisher": "Sénat, commission des affaires sociales",
        "url": "https://www.senat.fr/lessentiel/ppl23-015.pdf",
        "date": "2023-12-06",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "aides-logement-etudiants": {
    "what": "Les étudiants locataires peuvent toucher une aide au logement (APL, ALS ou ALF). Elle est calculée sur un revenu forfaitaire, pas sur celui des parents : environ 215 € par mois pour un boursier, 180 € pour un non-boursier.",
    "who": "Plus de 700 000 étudiants aidés (calcul), dont 494 000 non-boursiers. Dépense : 2 Md€ par an. Le PLF compte 72 M€ de moins en 2027 : les foyers les plus aisés choisiront entre l’APL de l’étudiant et un avantage fiscal.",
    "up": "+10 % : 160 à 200 M€ de plus, 18 à 22 € de plus par mois et par étudiant aidé (calcul). +100 % : l’aide double, 1,6 à 2,3 Md€ (estimation, haut relevé : de nouveaux demandeurs).",
    "down": "−10 % : 160 à 200 M€ de moins, 18 à 22 € de moins par mois et par étudiant aidé (calcul). −100 % : plus aucune aide, 1,3 à 2,0 Md€ (estimation, bas abaissé : certains la garderaient à un autre titre).",
    "argsUp": [
      "Les restreindre « fait davantage reposer le financement des études » sur la famille (PLF 2027) ; le barème est gelé en 2027 (PAP 2027).",
      "Logements étudiants en retard : 36 000 places livrées en 2018-2022 sur 60 000 prévues ; « fortes tensions » à la rentrée (Sénat, 2025)."
    ],
    "argsDown": [
      "Environ un tiers des aidés ont des parents parmi les 20 % les plus aisés : « peu redistributif » (PLF 2027, qui cite la Cour des comptes).",
      "Une part va aux loyers : dans les années 1990, ils ont monté de 78 % des aides versées ; moins si l’offre suit (Banque de France, 2023)."
    ],
    "sources": [
      {
        "title": "Rapport général n° 139 (2025-2026) sur le projet de loi de finances pour 2026, tome III, annexe 23 « Recherche et enseignement supérieur »",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-323/l25-139-323_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Aides au logement : un moindre effet haussier sur les loyers si l’offre s’ajuste (Bloc-notes Éco, C. Grislain-Letrémy et C. Trevien)",
        "publisher": "Banque de France",
        "url": "https://www.banque-france.fr/fr/publications-et-statistiques/publications/aides-au-logement-un-moindre-effet-haussier-sur-les-loyers-si-loffre-sajuste",
        "date": "2023-01-30",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "droits-inscription-etudiants-etrangers": {
    "what": "Les universités font payer aux étudiants venus hors de l’Union européenne des droits plus élevés : en 2026-2027, 2 902 € par an en licence et 3 950 € en master, contre 178 € et 255 € pour les autres. Les exonérations sont plafonnées.",
    "who": "Paient aux universités : 82 000 à 149 000 étudiants hors UE (licence, master) en 2027-2028, 0,29 à 0,51 Md€ (estimation). Le déficit public bouge si elles n’en dépensent pas l’écart ou si l’État ajuste leur subvention.",
    "up": "+1 000 € : 3 902 € en licence, 4 950 € en master, 0,08 à 0,15 Md€ de plus (estimation). +2 700 € : 5 602 € en licence, 0,16 à 0,41 Md€, encore sous le coût moyen d’un étudiant (12 500 €).",
    "down": "−1 000 € : 1 902 € en licence, 2 950 € en master, 0,08 à 0,15 Md€ de moins (estimation). −2 700 € : environ 200 € en licence, près des 178 € des autres, 0,16 à 0,41 Md€.",
    "argsUp": [
      "France : droits « plus faibles que ses voisins » parmi les pays étudiés ; hors UE, 5 000 à 18 000 € au Danemark, en Finlande (Sénat, 2025).",
      "Ces droits financent l’accueil des étudiants étrangers, jusque-là « l’un des points faibles » de l’attractivité (ministère, PAP 2027)."
    ],
    "argsDown": [
      "Leur application « beaucoup plus large » peut freiner les candidatures ; objectif : 500 000 étudiants étrangers (ministère, PAP 2027).",
      "Les droits doivent rester « modiques » au vu du coût ; ceux de 2019, près de 30 % du coût d’une licence, l’étaient (Conseil d’État, 2020)."
    ],
    "sources": [
      {
        "title": "Rapport général n° 139 (2025-2026) sur le projet de loi de finances pour 2026, tome III, annexe 23 « Recherche et enseignement supérieur »",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-323/l25-139-323_mono.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Décision n° 430121 et autres du 1er juillet 2020 (droits d’inscription dans l’enseignement supérieur public), points 15, 17 et 19",
        "publisher": "Conseil d’État",
        "url": "https://www.conseil-etat.fr/fr/arianeweb/CE/decision/2020-07-01/430121",
        "date": "2020-07-01",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "tarif-solidarite-billets-avion": {
    "what": "Taxe fixe par passager partant de métropole ou d’un département d’outre-mer, due par la compagnie, répercutée dans le billet. Elle varie selon la distance et la classe ; tarif réduit sur les lignes de service public, correspondances exonérées sous conditions.",
    "who": "Les voyageurs, dans le billet : 7,40 à 40 € en économique, 30 à 120 € en affaires, 210 à 2 100 € en avion d’affaires. 1 478,8 M€ prévus en 2027 : 271 M€ au plus pour l’AFITF (transports), le reste à l’État.",
    "up": "+10 % : 0,15 Md€ de plus ; 8,14 € contre 7,40 € (économique, Europe), 44 € contre 40 € (vol lointain). Doublée : 1,2 à 1,5 Md€ (estimation, moins de trafic), jusqu’à 2 100 € de plus par passager.",
    "down": "−10 % : 0,15 Md€ de moins ; 6,66 € contre 7,40 € (économique, Europe), 36 € contre 40 € (vol lointain). Supprimée : 1,5 Md€ (statique, trafic inchangé), jusqu’à 2 100 € de moins par passager.",
    "argsUp": [
      "CPO (2026) : le kérosène est exonéré d’accise (droit de l’UE) ; la loi Climat visait dès 2025 un prix du carbone aérien au niveau du marché.",
      "SDES (2023) : sur longue distance, les 25 % les plus aisés émettent 3,7 fois plus que les 25 % les moins aisés ; l’avion en fait la moitié."
    ],
    "argsDown": [
      "Sénat (2025) : au 1er semestre 2025, le trafic intérieur était 26 % sous 2019, un recul « vraisemblablement amplifié » par la hausse.",
      "CPO (2026), d’après la DGAC : la hausse de 2025 a affecté la compétitivité de l’aérien français ; il plaide pour une réforme supranationale."
    ],
    "sources": [
      {
        "title": "Taxes aéronautiques : tarif de solidarité de la taxe sur le transport aérien de passagers (page mise à jour le 6 août 2026)",
        "publisher": "Ministères Transition écologique, Aménagement du territoire, Transports (direction générale de l’aviation civile)",
        "url": "https://www.ecologie.gouv.fr/politiques-publiques/taxes-aeronautiques",
        "date": "2026-08-06",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Rapport général n° 139 (2025-2026), tome III, annexe 10, volume 3 : projet de loi de finances pour 2026, Écologie, développement et mobilité durables (budget annexe Contrôle et exploitation aériens)",
        "publisher": "Sénat, commission des finances",
        "url": "https://www.senat.fr/rap/l25-139-310-3/l25-139-310-3.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Le quart des ménages les plus aisés à l’origine de 35 % des émissions de gaz à effet de serre des mobilités (Datalab Essentiel n° 314, juillet 2023)",
        "publisher": "Service des données et études statistiques (SDES), ministère de la transition écologique",
        "url": "https://www.statistiques.developpement-durable.gouv.fr/sites/default/files/2023-07/datalab_essentiel_314_emission_ges_mobilites_juillet2023_0.pdf",
        "date": "2023-07",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "tva-electricite": {
    "what": "La TVA est la taxe ajoutée au prix payé par le consommateur. Sur l’électricité des ménages : 20 % sur toute la facture, abonnement compris depuis 2025 (hausse compensée par une baisse de l’accise). Le droit européen permet un taux réduit, pas sous 5 %.",
    "who": "Les ménages : 4 Md€ par an en moyenne passée (Sénat, 2024) ; 4,4 à 7,6 Md€ avec les prix récents et l’abonnement à 20 % (estimation). Ménage moyen : environ 270 € par an. Les entreprises, elles, la récupèrent.",
    "up": "Pas de taux au-dessus de 20 % : le droit européen impose un seul taux normal pour tous les biens et services, 20 % en France. Le réglage du PLF 2027 est déjà le plus haut possible.",
    "down": "À 5,5 % sur la seule consommation de base (proposition du Sénat) : 1 à 3,1 Md€. À 10 % partout : environ 136 € de moins par an pour un ménage moyen, 2,2 à 3,8 Md€ ; à 5,5 % : 198 € et 3,2 à 5,5 Md€.",
    "argsUp": [
      "CPO (2026, rappelant 2023) : face à une flambée des prix, le chèque énergie a mieux protégé les ménages modestes qu’une baisse de TVA.",
      "Sénat (2024) : baisser la TVA sur toute l’électricité profiterait surtout aux consommations de confort et serait « extrêmement coûteuse »."
    ],
    "argsDown": [
      "Sénat (2024) : bien de première nécessité, l’électricité doit être moins taxée ; 5,5 % sur la consommation de base : −175 € par an à 6 MWh.",
      "CPO (2026) : en 2019, l’énergie pesait 17,4 % du revenu des 20 % les plus modestes, 5,2 % des plus aisés ; TVA : 1,3 point en moyenne."
    ],
    "sources": []
  },
  "aide-carburant-ciblee": {
    "what": "Une somme versée une fois, sur demande, aux actifs modestes qui roulent beaucoup pour travailler, pour amortir la hausse des carburants. En 2026, face au conflit au Moyen-Orient : 100 € par véhicule et par personne. Le PLF 2027 n’en prévoit pas.",
    "who": "Les actifs au revenu par part d’au plus 16 880 € (50 % les plus modestes) faisant au moins 15 km pour aller travailler (30 km aller-retour) ou 8 000 km par an pour leur métier : 2,9 millions. Paie : l’État.",
    "up": "100 € comme en 2026 : 70 à 320 M€ selon le recours ; 200 € (20 centimes par litre sur un an) : 0,14 à 0,64 Md€ ; 300 € : 0,21 à 0,96 Md€ ; 100 € aux 10 millions d’actifs de 2023 : 0,2 à 1,0 Md€.",
    "down": "Le PLF 2027 ne prévoit aucune aide carburant : c’est le point de départ, rien à baisser. En 2026, l’aide de 100 € avait 320 M€ de crédits ; 70 à 80 M€ au recours constaté en juin.",
    "argsUp": [
      "CGDD (2025), cité par l’Assemblée : +10 % sur les carburants coûte 0,67 % du revenu aux 10 % les plus modestes, 0,17 % aux plus aisés.",
      "Assemblée (2026) : 100 € est « très insuffisant » pour les ménages ruraux ; +10 % sur les carburants leur coûte 176 € par an (CGDD)."
    ],
    "argsDown": [
      "Assemblée (2026) : à la mi-juin, 24 % seulement des ayants droit avaient demandé l’aide de 2026, ouverte fin mai jusqu’au 30 juillet.",
      "CPO (2026) : même ciblées, les aides contre la hausse de l’énergie doivent rester proportionnées, sans dégrader durablement les comptes."
    ],
    "sources": [
      {
        "title": "Quel avenir pour la fiscalité de l’énergie ? (rapport, juin 2026), p. 107",
        "publisher": "Conseil des prélèvements obligatoires (Cour des comptes)",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-06/20260603-Quel-avenir-pour-la-fiscalite-de-l-energie.pdf",
        "date": "2026-06-03",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "gratuite-transports-urbains": {
    "what": "La part du prix des bus, trams, métros et RER payée par l’argent public plutôt que par les voyageurs et leurs employeurs : plus, jusqu’à la gratuité ; moins, tarifs en hausse. En 2019, une trentaine de petits ou moyens réseaux étaient gratuits, dont Dunkerque.",
    "who": "Aujourd’hui les voyageurs : en Île-de-France en 2017, 2,7 Md€ payés par eux, 0,9 Md€ par les employeurs (Sénat). Ces recettes vont aux autorités locales ou allègent leurs subventions. En 2027 : 4 à 8,2 Md€ (estimation).",
    "up": "+10 % : voyageurs et employeurs paient 10 % de moins ; 0,40 à 0,82 Md€ de plus pour l’argent public, plus avec des renforts. Gratuité totale : 3,7 à 9,4 Md€ (estimation), 53 à 136 € par habitant.",
    "down": "−10 % : voyageurs et employeurs paient 10 % de plus ; 0,40 à 0,82 Md€ de moins pour l’argent public, moins si des voyageurs partent. Prix doublés : 2,5 à 6,6 Md€ (estimation), 36 à 95 € par habitant.",
    "argsUp": [
      "Sénat (2019) : Dunkerque gratuit, fréquentation +65 à +125 % ; selon de premiers résultats, 48 % des reports viendraient de la voiture.",
      "Sénat (2019) : les ménages modestes paient souvent leurs billets à l’unité, plus chers, et beaucoup ne demandent pas les tarifs réduits."
    ],
    "argsDown": [
      "Sénat (2019) : en Île-de-France, +10 % de trajets sur le réseau RATP ; à offre égale, 6 à 7 lignes de métro saturées en 2030, selon la RATP.",
      "Sénat (2019) : près de 700 000 Franciliens voyagent déjà gratuitement sous conditions ; la gratuité totale irait aussi à qui peut payer."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025, Insee Première n° 2087",
        "publisher": "Institut national de la statistique et des études économiques (Insee)",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "allocation-alimentaire": {
    "what": "Chaque habitant, enfants compris, recevrait chaque mois une somme à dépenser seulement en aliments, chez des commerçants ou producteurs conventionnés (agréés). Rien de tel à l’échelle nationale ; des collectivités expérimentent des chèques alimentaires.",
    "who": "Recevraient : les 69,3 millions d’habitants de 2027. Paie : l’argent public, 15,6 à 156,0 Md€ par an selon le montant (estimation). Le PLF 2027 prévoit 183,4 M€ de crédits d’aide alimentaire (159 M€ en 2026).",
    "up": "25 € par mois : 15,6 à 26 Md€ par an ; 50 € : 31,2 à 52 Md€ ; 100 € : 62,4 à 104 Md€ (estimations). À 50 € : 600 € par habitant et par an d’argent public, 2 400 € pour un foyer de quatre.",
    "down": "Le PLF 2027 n’en prévoit pas : rien à baisser. L’aide alimentaire de l’État, 183,4 M€ en 2027, vise les personnes en situation de précarité et passe surtout par les associations.",
    "argsUp": [
      "Sénat (2025) : la précarité alimentaire ne recule pas ; selon les associations, plus de jeunes et de personnes en emploi stable sont aidés.",
      "Sénat (2021) : malgré son surcoût, un chèque fléché vers des produits de qualité soutiendrait ces filières et limiterait les importations."
    ],
    "argsDown": [
      "Gouvernement (2023, réponse au Sénat) : un chèque alimentaire soulève des « difficultés opérationnelles » ; à expérimenter d’abord.",
      "Le chèque envisagé visait les revenus les plus faibles (Gouvernement, 2023) ; versée à tous, l’allocation irait aussi aux plus aisés."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Solidarité, insertion et égalité des chances, programme 304, action 14 « Aide alimentaire » (p. 45)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128278/file/PAP%202027%20-%20Solidarit%C3%A9%20insertion%20et%20%C3%A9galit%C3%A9%20des%20chances.pdf",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Avis n° 142 (2025-2026), tome V : projet de loi de finances pour 2026, Solidarité, insertion et égalité des chances",
        "publisher": "Sénat, commission des affaires sociales",
        "url": "https://www.senat.fr/rap/a25-142-5/a25-142-5.html",
        "date": "2025-11-24",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Rapport d’information n° 620 (2020-2021) sur l’alimentation durable et locale, partie « Concrétiser l’idée d’un « chèque alimentation » pour reconquérir notre marché agricole intérieur »",
        "publisher": "Sénat, commission de l’aménagement du territoire et du développement durable et commission des affaires économiques",
        "url": "https://www.senat.fr/rap/r20-620/r20-620_mono.html",
        "date": "2021-05-19",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Question écrite n° 01154 « Chèque alimentaire », réponse du ministère chargé des comptes publics (JO Sénat du 19 janvier 2023, p. 368)",
        "publisher": "Gouvernement (ministère chargé des comptes publics), réponse publiée au Journal officiel du Sénat",
        "url": "https://www.senat.fr/questions/base/2022/qSEQ220701154.html",
        "date": "2023-01-19",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "cannabis-legal-taxe": {
    "what": "Aujourd’hui, produire et vendre du cannabis est interdit : l’État n’en tire aucune recette fiscale. Le levier autorise une vente encadrée, interdite aux mineurs, taxée par un droit d’accise (50 % dans le scénario du CAE), impôt propre au produit, plus la TVA.",
    "who": "Les acheteurs (5 millions d’usagers dans l’année, OFDT) paieraient à l’État 4 € de taxes par gramme vendu 9 €. Le CAE retient 500 tonnes par an, bien plus que ne l’implique le marché de 1,2 Md€ estimé par l’OFDT (2017).",
    "up": "Vente légale en 2027 : 0,1 à 1,4 Md€ la première année (estimation), 2 à 2,8 Md€ par an à terme (CAE). À 4 € de taxes par gramme, 5 g par mois font 240 € de taxes par an (calcul).",
    "down": "Pas de cran sous le PLF, qui garde l’interdiction : aucune recette fiscale. Non comptés : la dépense publique contre le cannabis (568 M€, CAE, 2019) et le coût d’une régulation et de la prévention.",
    "argsUp": [
      "CAE (2019) : sous l’interdiction, 41,4 % des 15-64 ans en France avaient déjà consommé du cannabis en 2016 ; moyenne européenne : 18,9 %.",
      "CAE (2019) : la criminalité baisse en général avec la légalisation ; dans deux États américains, l’usage des mineurs aurait baissé de 12 %."
    ],
    "argsDown": [
      "Académie de médecine (2025) : au Canada, nouveaux cas de schizophrénie liés au cannabis : 3,7 % avant la légalisation, 10,3 % après.",
      "CAE (2019) : l’usage des réguliers augmente avec la légalisation ; dans l’État de Washington, le marché noir garde environ 50 % des ventes."
    ],
    "sources": [
      {
        "title": "Cannabis : résine, herbe, huile, CBD, synthèse des connaissances",
        "publisher": "Observatoire français des drogues et des tendances addictives (OFDT)",
        "url": "https://www.ofdt.fr/cannabis-resine-herbe-huile-cbd-synthese-des-connaissances-1724",
        "date": "2026",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "« La légalisation de l’usage “récréatif” du cannabis causerait de graves problèmes en termes de santé publique », communiqué du 9 avril 2025",
        "publisher": "Académie nationale de médecine",
        "url": "https://www.academie-medecine.fr/la-legalisation-de-lusage-recreatif-du-cannabis-causerait-de-graves-problemes-en-termes-de-sante-publique/",
        "date": "2025-04-09",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "condition-residence-prestations": {
    "what": "Un étranger hors Union en séjour régulier peut recevoir aides au logement et prestations familiales sans durée minimale. Le PLFSS 2027 prévoit d’exiger un an de séjour, surtout pour les aides au logement, d’ici au 1er juillet 2027 ; RSA et ASPA inchangés.",
    "who": "Paie l’État (Fnal). Jusqu’à 25 000 des 82 000 ménages hors Union ayant demandé une première aide au logement en 2025 (820 259 aidés) l’auraient jusqu’à un an plus tard : environ 2 400 € par ménage en moyenne (calcul).",
    "up": "Aucune durée (droit de 2026) : jusqu’à 25 000 ménages reçoivent l’aide dès leur demande ; 30,9 M€ de dépense en 2027, 61,8 M€ en année pleine.",
    "down": "Deux ans : 3 000 à 16 000 ménages de plus, en séjour depuis 1 à 2 ans, attendraient l’aide en 2027 (estimation), 3 à 23 M€ d’économie. Censurés (2024) : 5 ans de résidence ou 30 mois d’activité.",
    "argsUp": [
      "Conseil constitutionnel (2024) : l’étranger qui réside de manière stable et régulière en France a droit à la protection sociale.",
      "PLFSS 2027 : la mesure peut baisser le revenu disponible des familles nouvellement installées, et toucher tout le foyer, jusqu’à un an."
    ],
    "argsDown": [
      "PLFSS 2027 : lier l’accès à ces aides à une durée minimale d’installation régulière, comme pour le RSA (cinq ans) et l’ASPA (dix ans).",
      "Conseil constitutionnel (2024) : exiger une durée de résidence pour certaines aides est permis, si elle n’est pas excessive."
    ],
    "sources": []
  },
  "referendums-nationaux": {
    "what": "Un référendum national demande à tous les électeurs d’approuver ou non un texte, projet de loi ou révision de la Constitution. L’État en paie l’organisation matérielle. Neuf sous la Ve République, le dernier en 2005.",
    "who": "L’État paie (programme 232 : 505 M€ pour organiser les élections en 2027) ; 49,5 millions d’inscrits aux européennes de 2024 (Insee). Les communes tiennent les bureaux de vote.",
    "up": "1 date de vote à part : 0,10 à 0,19 Md€, soit 2,0 à 3,8 € par inscrit (calcul) ; 4 dates : 0,40 à 0,76 Md€. Le même jour qu’un scrutin, s’il a lieu : 0,02 à 0,11 Md€ (estimations).",
    "down": "Pas de cran sous le PLF 2027, qui n’inscrit aucun référendum : revenir à « Aucun » retire ces dépenses. Le PLF paie déjà la présidentielle de 2027 et d’éventuelles législatives.",
    "argsUp": [
      "Comité sur les institutions (2007) : élargir le champ de la démocratie, par un référendum à l’initiative de parlementaires et d’électeurs.",
      "Conseil constitutionnel : la pratique référendaire reste occasionnelle, mais le peuple a été consulté sur des sujets de première importance."
    ],
    "argsDown": [
      "Comité sur les institutions (2007) : les circonstances politiques du moment prennent parfois le pas sur la question posée au référendum.",
      "Conseil constitutionnel : jusqu’à 69,8 % d’abstention (référendum de 2000), 30,6 % en 2005, en part des inscrits."
    ],
    "sources": [
      {
        "title": "49,5 millions d’électeurs inscrits pour les élections européennes de 2024, Insee Focus n° 328",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8192479",
        "date": "2024-05-30",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "L’histoire du référendum sous la Ve République",
        "publisher": "Conseil constitutionnel",
        "url": "https://www.conseil-constitutionnel.fr/la-constitution/l-histoire-du-referendum-sous-la-ve-republique",
        "date": "2020-02-11",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Tableau récapitulatif des référendums de la Vème République",
        "publisher": "Conseil constitutionnel",
        "url": "https://www.conseil-constitutionnel.fr/referendum-sous-la-ve-republique/tableau-recapitulatif-des-referendums-de-la-veme-republique",
        "date": "2005",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "« Une Ve République plus démocratique », rapport du Comité de réflexion et de proposition sur la modernisation et le rééquilibrage des institutions de la Ve République, chapitre III, « Instaurer un droit d’initiative populaire », p. 74 (p. 75 du PDF)",
        "publisher": "Comité de réflexion et de proposition sur la modernisation et le rééquilibrage des institutions de la Ve République (rapport public, vie-publique.fr)",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/074000697.pdf",
        "date": "2007-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "polices-municipales": {
    "what": "Créées sur décision du maire et sous son autorité, les polices municipales veillent à la tranquillité publique, à la circulation et à la sécurité du quotidien, en complément de la police et de la gendarmerie nationales. Chaque commune décide de leur dépense.",
    "who": "Les communes paient 2,59 Md€ en 2024, 48,3 € par habitant en moyenne dans celles qui ont une police (OFGL) ; 28 161 policiers municipaux en 2023 (Sénat). Dans les deux sens, l’effet suppose qu’elles suivent.",
    "up": "+10 % des 2,17 Md€ estimés pour 2027, hors cotisations des employeurs : 0,16 à 0,28 Md€ de plus, environ 3 € par habitant, autant qu’environ 2 800 agents (calcul).",
    "down": "−10 % de ces 2,17 Md€ : 0,16 à 0,28 Md€ de moins, environ 3 € par habitant, autant qu’environ 2 800 des 28 161 policiers municipaux (calcul).",
    "argsUp": [
      "Sénat (2025) : leur essor témoigne d’un besoin croissant de sécurité et, sans doute, d’un sentiment d’éloignement des forces nationales.",
      "Sénat (2025) : proches de la population, elles s’appuient sur leur connaissance du territoire pour la sécurité du quotidien."
    ],
    "argsDown": [
      "Cour des comptes (2020) : coûteuses pour les communes, pour un coût mal connu ; dépense de fonctionnement +41 % en sept ans (OFGL).",
      "Cour des comptes (2020), Sénat (2025) : la police nationale intervient moins là où elles sont étoffées ; risque d’inégalités de sécurité."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025, Insee Première n° 2087",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Les polices municipales, rapport public thématique (octobre 2020), synthèse",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/fr/publications/les-polices-municipales",
        "date": "2020-10-20",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "credits-ferroviaires": {
    "what": "L’État paie à SNCF Réseau, gestionnaire des voies, le péage (redevance d’accès) des TER et Intercités ; il couvre le déficit des Intercités, aide le fret et paie des tarifs sociaux. L’effet passe surtout par la dépense de SNCF Réseau, administration publique.",
    "who": "SNCF Réseau reçoit 3,33 Md€ : péages des TER (payés à la place des régions) et Intercités, compensation fret. Les exploitants, 0,48 Md€ : déficit des Intercités, aides au fret, tarifs sociaux. 55 € par habitant (calcul).",
    "up": "+10 % : 0,39 Md€ de plus, environ 5,5 € par habitant (calcul) ; effet sur le déficit surtout si SNCF Réseau dépense d’autant en entretien ou en travaux.",
    "down": "−10 % : 0,39 Md€ de moins, environ 5,5 € par habitant (calcul) ; effet surtout si SNCF Réseau réduit d’autant entretien ou travaux. Si les régions payaient ce péage, le déficit ne bougerait pas.",
    "argsUp": [
      "SDES : le train atteint en 2024 une fréquentation inégalée, +14,5 % sur 2019 ; beaucoup veulent un trajet plus écologique (PAP 2027).",
      "PAP 2027 : le projet de contrat de performance de SNCF Réseau prévoit 1,5 Md€ de plus par an dès 2028 pour régénérer le réseau."
    ],
    "argsDown": [
      "SDES : toutes administrations comprises, les versements publics à l’exploitant SNCF Voyageurs atteignent 11,5 Md€ en 2024, +47,5 % sur 2019.",
      "PAP 2027 : 18,4 € de contribution publique par train-km d’Intercités en 2025, au plus 17,0 € visés en 2027 (concurrence, rames neuves)."
    ],
    "sources": [
      {
        "title": "Bilan démographique 2025, Insee Première n° 2087",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Bilan annuel des transports en 2024, synthèse (p. 10)",
        "publisher": "Service des données et études statistiques (SDES), ministère chargé des transports",
        "url": "https://www.statistiques.developpement-durable.gouv.fr/media/8868/download?inline",
        "date": "2025-11",
        "accessedAt": "2026-10-18"
      }
    ]
  },
  "agences-eau-interventions": {
    "what": "Les six agences de l’eau, organismes publics de l’État, perçoivent des redevances sur l’eau prélevée ou polluée, surtout sur la facture d’eau, et les reversent en aides : eau potable, assainissement, rivières, pollutions agricoles. Le levier règle ces aides.",
    "who": "Les usagers paient 2 535 M€ de redevances en 2027 (37 € par habitant, calcul), les agences en gardant 2 482,6 M€ (plafond) ; le levier n’y touche pas. Aides : 1,8 à 2,1 Md€, pour moitié au moins aux communes.",
    "up": "+10 % : 0,2 Md€ d’aides en plus, 0,03 à 0,22 Md€ de coût : la part des communes compte si leurs travaux suivent. À +100 %, estimé : 0,2 à 2,2 Md€ (bas : projets lents ; haut : tout payé en 2027).",
    "down": "−10 % : 0,2 Md€ d’aides en moins, 0,03 à 0,22 Md€ d’économie : la part des communes compte si leurs travaux suivent. À −100 %, estimé : 0,2 à 2,2 Md€ (bas : promesses tenues ; haut : plus rien).",
    "argsUp": [
      "Le ministère (PAP 2027) relève une dégradation de l’état des eaux depuis 2019 : −5 points pour l’état écologique, −6 pour le quantitatif.",
      "PAP : 37 % des communes en tension sur l’eau potable en 2022 avaient une solution en 2025 ; cible 2026 revue de 90 à 79 % au vu des moyens."
    ],
    "argsDown": [
      "PAP 2027 : la hausse du plafond des redevances (2024, 2026) et le redéploiement d’une prime dégagent 435 M€ par an de moyens d’intervention.",
      "Fin 2024, 4,6 Md€ d’aides promises restaient à payer, 500 M€ de plus qu’un an avant (annexe au PLF 2026)."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 113, opérateur « Agences de l’eau » : missions (p. 193)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=193",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Projet de loi de finances pour 2027 (n° 3210), article 42, tableau des ressources affectées à des tiers (p. 129)",
        "publisher": "Gouvernement, projet de loi déposé à l’Assemblée nationale",
        "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi.pdf#page=129",
        "date": "2026-10-01",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Écologie, développement et mobilité durables, programme 113 : taxes affectées plafonnées (p. 171)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=171",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, programme 113, opérateur « Agences de l’eau » : financement (p. 195)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=195",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Annexe au PLF 2026 « Agences de l’eau » (jaune) : présentation générale des redevances (p. 6)",
        "publisher": "Gouvernement, annexe au projet de loi de finances pour 2026 « Agences de l’eau » (article L. 213-9-1 du code de l’environnement), publiée par les agences de l’eau",
        "url": "https://www.lesagencesdeleau.fr/sites/default/files/medias/documents/1-Jaune2026_Agences_Eau.pdf#page=6",
        "date": "2025-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Annexe au PLF 2026 « Agences de l’eau » (jaune), tableau 2 : paiements des 11es programmes en 2024, domaine 2 (p. 31)",
        "publisher": "Gouvernement, annexe au projet de loi de finances pour 2026 « Agences de l’eau » (article L. 213-9-1 du code de l’environnement), publiée par les agences de l’eau",
        "url": "https://www.lesagencesdeleau.fr/sites/default/files/medias/documents/1-Jaune2026_Agences_Eau.pdf#page=31",
        "date": "2025-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, programme 113, objectif 1 « Assurer la gestion intégrée de la ressource en eau » (p. 162)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=162",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, programme 113, indicateur 1.1 « Plan eau - Réduction des fuites et sécurisation de l’approvisionnement en eau potable » (p. 162-163)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128225/file/PAP%202027%20-%20Ecologie%20developpement%20et%20mobilite%20durables.pdf#page=163",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Annexe au PLF 2026 « Agences de l’eau » (jaune), soutenabilité budgétaire (p. 25)",
        "publisher": "Gouvernement, annexe au projet de loi de finances pour 2026 « Agences de l’eau » (article L. 213-9-1 du code de l’environnement), publiée par les agences de l’eau",
        "url": "https://www.lesagencesdeleau.fr/sites/default/files/medias/documents/1-Jaune2026_Agences_Eau.pdf#page=25",
        "date": "2025-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "opex-surcouts": {
    "what": "Les opérations extérieures (OPEX) sont les engagements des armées hors de France, au Proche et au Moyen-Orient notamment, hors forces de présence (Djibouti…). Le surcoût couvre vivres, carburant, entretien (payé avec retard), transport, télécoms et primes.",
    "who": "Les militaires déployés (140 M€ de rémunérations), les fournisseurs et les opérations de l’UE et de l’OTAN (59,7 M€) : 680 M€, 10 € par habitant (calcul). Au-delà, la loi prévoit un financement interministériel.",
    "up": "+50 % : 340 M€ de plus en 2027, 5 € par habitant (calcul), si les engagements augmentent d’autant ; +100 % double la provision, 680 M€ de plus.",
    "down": "−50 % : 340 M€ d’économie en 2027, 5 € par habitant (calcul), si les engagements reculent d’autant ; −100 %, 680 M€ d’économie, la fin des OPEX.",
    "argsUp": [
      "Cour des comptes (2026) : « tendance à une sous-budgétisation systématique » ; en 2025, 732 M€ hors paie (avec Sentinelle) pour 621,5 M€.",
      "PAP : 12 000 militaires à l’étranger en 2028-2029 (toutes missions), dont stabilisation si cessez-le-feu en Ukraine et au Moyen-Orient."
    ],
    "argsDown": [
      "Selon la Cour des comptes (2026), les surcoûts des opérations sont passés de 1 560 M€ en 2021 à 954 M€ en 2025, avec le retrait d’Afrique.",
      "PAP : 10 500 militaires à l’étranger en 2027 (toutes missions), autant qu’en 2025 à périmètre égal, moins que la cible 2026 (11 000)."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Défense, programme 178, action 06 « Surcoûts liés aux engagements opérationnels » : contenu de l’action (p. 189)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=189",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 178, opération stratégique OPEX : description et crédits (p. 190)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=190",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 212, action 59 « Surcoûts liés aux engagements opérationnels - Personnel » : sous-action 59.01 (p. 232)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=232",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 178, indicateur 1.4 « Efficacité du prépositionnement des forces » : précisions méthodologiques (p. 97)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=97",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense : surcoûts opérationnels du programme 178 (p. 54)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf#page=54",
        "date": "2026-04",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Défense, programme 178, indicateur 1.3 « Volume de personnel militaire déployé » : cibles et justification (p. 96)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=96",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense : coûts complets des OPEX et MISSINT (p. 29)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf#page=29",
        "date": "2026-04",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense, synthèse : la provision OPEX-MISSINT (p. 7)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf#page=7",
        "date": "2026-04",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "credits-dissuasion": {
    "what": "La dissuasion repose sur des sous-marins (SNLE) et des avions, armés des missiles M51 et ASMPA. Les crédits paient leur mise en œuvre (entretien, transmissions), leur renouvellement (SNLE 3G, M51.4, ASN4G), les armes et la simulation qui remplace les essais.",
    "who": "L’État paie, environ 115 € par habitant (calcul). L’argent va surtout aux industriels (ArianeGroup, Naval Group, MBDA, Thales, Safran, TechnicAtome) et au CEA (têtes nucléaires ; simulation, 750 M€ en 2027).",
    "up": "+10 % : 0,80 Md€ de plus en 2027, 11,5 € par habitant (calcul). Au-delà de +25 %, estimé : un contrat nouveau se paie sur plusieurs années, +100 % ne coûterait que 4,0 à 6,5 Md€ en 2027.",
    "down": "−10 % : 0,80 Md€ d’économie en 2027, 11,5 € par habitant (calcul). Au-delà de −25 %, estimé : les contrats signés restent dus ; l’abandon (−100 %) n’épargnerait que 2,6 à 3,4 Md€, hors démantèlement.",
    "argsUp": [
      "La loi de programmation militaire actualisée (2026) range la dissuasion nucléaire parmi ses priorités (« moyens de souveraineté »).",
      "Le PAP 2027 prévoit de remplacer les quatre SNLE après 2035 et le missile ASMPA après 2030 ; le M51.4 est en réalisation depuis 2025."
    ],
    "argsDown": [
      "Cour des comptes (2026) : +813 M€ pour la dissuasion en 2025 ; un « éventuel effort nouveau » sur munitions, espace, innovation attend 2027.",
      "Fin 2025, la dissuasion avait au moins 23,4 Md€ à payer (PAP) ; la Cour juge la Défense d’une rigidité « à la limite de la soutenabilité »."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Défense, programme 146 « Équipement des forces » : éléments de synthèse, action 06 « Dissuasion » (p. 327)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=327",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Défense, programme 178 : répartition des crédits par opération stratégique, CP 2027 (p. 119)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=119",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146, sous-action 06.22 « soutien et mise en œuvre des forces » (p. 343)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=343",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146, sous-action 06.23 « crédibilité technique de la posture » (p. 344)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=344",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146, sous-action 06.14 « M51 » (p. 334)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=334",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146, sous-action 06.18 « Simulation » (p. 339-340)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=339",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146, sous-action 06.19 « Autres opérations » (p. 340-341)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=341",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146, sous-action 06.24 « SNLE 3G » (p. 346)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=346",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Défense, programme 146 : échéancier des paiements associés aux engagements, opération stratégique DIS (p. 331)",
        "publisher": "Ministère des armées (PAP annexé au PLF 2027)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128221/file/PAP%202027%20-%20D%C3%A9fense.pdf#page=331",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Loi n° 2026-791 du 16 août 2026 actualisant la programmation militaire pour les années 2024 à 2030 et portant diverses dispositions intéressant la défense, rapport annexé",
        "publisher": "Journal officiel de la République française (Légifrance)",
        "url": "https://www.legifrance.gouv.fr/jorf/id/JORFSCTA000054694833",
        "date": "2026-08-16",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense : dépenses par opération stratégique (p. 28)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf#page=28",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense, synthèse (p. 5-6)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf#page=5",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, mission Défense, synthèse (p. 6)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Defense.pdf#page=6",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "exoneration-hausses-salaire": {
    "what": "Les employeurs paient des cotisations sociales sur les salaires. La mesure exonérerait de cotisations patronales la part de salaire due aux hausses accordées en 2027. Le levier règle la part des hausses exonérée ; sous 0, une cotisation en plus.",
    "who": "Les employeurs du privé et leurs salariés augmentés. Les caisses (Sécurité sociale, retraites complémentaires, chômage) perdent ces cotisations, compensées en principe par l’État. Hausses de 2027 : 21,3 Md€ (calcul).",
    "up": "+50 % : 3,5 à 7,0 Md€ de coût, estimé à hausses inchangées. À 100 %, 7,0 à 14,0 Md€ : de 33 à 66 € de cotisations en moins pour 100 € de hausse (calcul). Si la mesure dure, le coût s’ajoute.",
    "down": "−50 % : cotisation sur la moitié des hausses, 1,5 à 5,3 Md€, estimé. À −100 %, 3,0 à 10,5 Md€ (hausses freinées) : au moins 40 € de plus pour 100 € de hausse. Si elle dure, la recette s’ajoute.",
    "argsUp": [
      "Rapport Bozio-Wasmer (2024) : au Smic, 100 € de revenu disponible en plus coûtaient 483 € à l’employeur (2023), aides perdues comprises.",
      "Le Sénat (2026) relève que passer un salarié du Smic au salaire médian accroît le coût employeur de 78,9 %, pour 45,3 % de net en plus."
    ],
    "argsDown": [
      "La Cour des comptes (2025) nuance le risque de « trappe à bas salaires » : pas de concentration des salariés aux seuils des allègements.",
      "La Cour des comptes (2025) appelle à maîtriser les allègements de cotisations, montés à 77,3 Md€ en 2024 sous l’effet de l’inflation."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026, synthèse, tableau 1 « Principales hypothèses macroéconomiques du PLFSS pour 2027 »",
        "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=9",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.2 « Les cotisations », encadré « Valeurs de point de cotisation »",
        "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=50",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 1.6 « Les dispositifs d’exonération en faveur de l’emploi »",
        "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=68",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Les politiques d’exonérations de cotisations sociales : une inflexion nécessaire, rapport final, chapitre 3 (p. 126)",
        "publisher": "Antoine Bozio (EHESS, IPP) et Étienne Wasmer (NYU Abu Dhabi, Sciences Po), mission confiée par le Premier ministre, avec l’IGF, la DG Trésor, la DSS, la Dares et l’Insee",
        "url": "https://www.vie-publique.fr/files/rapport/pdf/295596.pdf#page=126",
        "date": "2024-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Rapport d’information n° 942 (2025-2026) « Poids des prélèvements obligatoires en France : quelles conséquences sur la compétitivité des entreprises, l’investissement et les salaires ? » (p. 81)",
        "publisher": "Sénat, mission d’information",
        "url": "https://www.senat.fr/rap/r25-942/r25-9421.pdf#page=81",
        "date": "2026-09-02",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales » (p. 133)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=17",
        "date": "2025-05-26",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales », présentation",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=3",
        "date": "2025-05-26",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales » : la compensation (p. 5)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=5",
        "date": "2025-05-26",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Sécurité sociale 2025, chapitre III « Maîtriser la dynamique des allègements généraux de cotisations sociales » : une fragilisation du financement (p. 18)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf#page=18",
        "date": "2025-05-26",
        "accessedAt": "2026-10-23"
      }
    ]
  },
  "credits-hebergement-urgence": {
    "what": "L’État finance l’hébergement d’urgence (centres, hôtels), les centres d’hébergement et de réinsertion sociale (CHRS), le logement adapté (pensions de famille…) et la veille sociale (115, maraudes, accueils de jour) pour les personnes sans abri.",
    "who": "Surtout des associations, qui gèrent les places : 1 827 financées en 2025, 72 % des sommes (Cour). 203 000 places ouvertes chaque soir ; en tout, 47 € par habitant (calcul). Le PLF 2027 prévoit 190 M€ de plus qu’en 2026.",
    "up": "+10 % : 0,33 Md€ de plus, l’équivalent de 29 000 places à 11 300 € par an, 31 € la nuit (2,3 Md€ pour 203 000 places, calcul). Au-delà de +25 %, estimé à 50 à 100 % du cran : places longues à ouvrir.",
    "down": "−10 % : 0,33 Md€ d’économie, l’équivalent de 29 000 places (calcul). Au-delà de −25 %, estimé à 50 à 100 % du cran : reports sur d’autres dépenses ; la loi prévoit l’accueil des personnes en détresse.",
    "argsUp": [
      "Les inspections (2025) relevaient 200 M€ par an manquants sur trois ans ; la Cour veut financer les 203 000 places dès la loi de finances.",
      "En 2025, 2 000 places d’urgence prévues pour des femmes et des enfants n’ont pas été ouvertes lors d’un arbitrage budgétaire (Cour, 2026)."
    ],
    "argsDown": [
      "Pour la direction du Budget (citée par la Cour), le besoin est mal documenté : 34 % des crédits ajoutés fin 2024 n’ont pas été dépensés.",
      "Inspections (2025) : aligner les coûts par place épargnerait 10,5 à 63 M€ ; mieux remplir le parc hébergerait 4 700 personnes de plus."
    ],
    "sources": [
      {
        "title": "PAP 2027, mission Cohésion des territoires, programme 177 : éléments de synthèse du programme (p. 39)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf#page=39",
        "date": "2026-10",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "PAP 2027, mission Cohésion des territoires, programme 177 : présentation stratégique (p. 28)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf#page=28",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PAP 2027, mission Cohésion des territoires, programme 177, action 12 : hébergement d’urgence (p. 46)",
        "publisher": "Gouvernement, projet annuel de performances annexé au PLF 2027 (Assemblée nationale)",
        "url": "https://www.assemblee-nationale.fr/dyn/contenu/visualisation/1128212/file/PAP%202027%20-%20Coh%C3%A9sion%20des%20territoires.pdf#page=46",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, missions Cohésion des territoires : le suivi des opérateurs d’hébergement d’urgence (p. 66)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf#page=66",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, missions Cohésion des territoires : budgétisation du programme 177 (p. 64)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf#page=64",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, missions Cohésion des territoires : divergences sur la budgétisation du programme 177 (p. 65)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf#page=65",
        "date": "2026-04",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Analyse de l’exécution budgétaire 2025, missions Cohésion des territoires : revues de dépenses (p. 32)",
        "publisher": "Cour des comptes",
        "url": "https://www.ccomptes.fr/sites/default/files/2026-04/NEB-2026-Cohesion-territoires.pdf#page=32",
        "date": "2026-04",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Bilan démographique 2025 (Insee Première n° 2087)",
        "publisher": "Insee",
        "url": "https://www.insee.fr/fr/statistiques/8719824",
        "date": "2026-01-13",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "allocation-proche-aidant": {
    "what": "Qui arrête ou réduit son travail pour aider un proche âgé, handicapé ou en perte d’autonomie (congé de proche aidant, non payé par l’employeur) peut toucher 66,64 € par jour en 2026 : 22 jours par mois, 66 par proche, 264 sur la carrière au plus.",
    "who": "Reçoivent : les aidants en congé, via la Caf ou la MSA. Paie : la branche autonomie de la Sécurité sociale, 22 M€ prévus en 2027, soit environ 330 000 journées au montant de 2026 (calcul).",
    "up": "+10 % : 2,2 M€ de plus, par exemple 73,30 € par jour au lieu de 66,64 €, jusqu’à 440 € de plus pour 66 jours. +100 % : 22 M€, 133,28 € par jour, jusqu’à 4 398 € de plus par proche aidé (calcul).",
    "down": "−10 % : 2,2 M€ d’économie, par exemple 59,98 € par jour, jusqu’à 440 € de moins pour 66 jours. −100 % : 17 à 22 M€, congé sans allocation, jusqu’à 4 398 € de moins par proche aidé (calcul).",
    "argsUp": [
      "58 % des 7,1 millions d’aidants travaillent, cherchent un emploi ou étudient (DREES, 2025) ; recours à l’AJPA jugé insuffisant (2023).",
      "Les pouvoirs publics l’ont déjà renforcée : portée au niveau du Smic en 2022, puis versée pour 4 proches au plus (264 jours) depuis 2025."
    ],
    "argsDown": [
      "Hausse rapide, de 18 à 22 M€ en 2027 (+19 %), dans une branche autonomie en déficit : −279 M€ en 2026, −93 M€ en 2027 avant mesures (CCSS).",
      "Le PLFSS 2026 proposait de ne pas la revaloriser, pour freiner la dépense sociale ; elle l’a été : 65,80 € en 2025, 66,64 € en 2026."
    ],
    "sources": [
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026, fiche 2.4 « Les prestations maladie, AT-MP et autonomie hors ONDAM » (p. 106 ; p. 108 du PDF)",
        "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=108",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Les comptes de la Sécurité sociale, octobre 2026, synthèse, tableau 14 « Charges, produits et solde de la branche autonomie (2024-2027) » (p. 35 ; p. 37 du PDF)",
        "publisher": "Direction de la sécurité sociale (rapport à la Commission des comptes de la Sécurité sociale)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf#page=37",
        "date": "2026-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "« Trois aidants sur dix accompagnent seuls leur proche, six sur dix sont en activité ou étudiants », Études et résultats n° 1358",
        "publisher": "Direction de la recherche, des études, de l’évaluation et des statistiques (DREES), avec l’Institut des politiques publiques",
        "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/251217-ER-etudes-et-resultats/proches-aidants",
        "date": "2025-12-17",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Étude d’impact du projet de loi de financement rectificative de la sécurité sociale pour 2023, article 12 « Création d’une assurance vieillesse pour les aidants (AVA) », impacts économiques et sociaux (p. 134)",
        "publisher": "Gouvernement, étude d’impact déposée à l’Assemblée nationale (projet de loi n° 760)",
        "url": "https://www.assemblee-nationale.fr/dyn/16/textes/l16b0760_etude-impact.pdf#page=134",
        "date": "2023-01-23",
        "accessedAt": "2026-10-19"
      },
      {
        "title": "Aidants : l’accès au congé et à l’allocation journalière du proche aidant sont simplifiés",
        "publisher": "Ministère des Solidarités (solidarites.gouv.fr)",
        "url": "https://solidarites.gouv.fr/aidants-lacces-au-conge-et-lallocation-journaliere-du-proche-aidant-sont-simplifies",
        "date": "2022-07-27",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "Ce qui change au 1er janvier 2025, rubrique « La revalorisation de l’allocation journalière du proche aidant » (mis à jour le 10 janvier 2025)",
        "publisher": "Portail national pour les personnes âgées et leurs proches (pour-les-personnes-agees.gouv.fr), édité par le Service public de l’autonomie",
        "url": "https://www.pour-les-personnes-agees.gouv.fr/actualites/ce-qui-change-au-1er-janvier-2025",
        "date": "2025-01-10",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "L’allocation journalière du proche aidant : qu’est-ce que c’est ? (mis à jour le 1er juin 2026)",
        "publisher": "Portail national pour les personnes âgées et leurs proches (pour-les-personnes-agees.gouv.fr), édité par le Service public de l’autonomie",
        "url": "https://www.pour-les-personnes-agees.gouv.fr/solutions-pour-les-aidants/soutien-financier/lallocation-journaliere-du-proche-aidant-quest-ce-que-cest",
        "date": "2026-06-01",
        "accessedAt": "2026-10-23"
      },
      {
        "title": "PLFSS 2026, annexe 9 « Fiches d’évaluation préalable des articles du projet de loi », article 44 « Stabiliser le montant des prestations sociales (dont pensions) » (p. 420-421)",
        "publisher": "Gouvernement, annexe 9 au projet de loi de financement de la sécurité sociale pour 2026 (securite-sociale.fr)",
        "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2026/PLFSS2026-Annexe09-GenerationXBOOK_avec%20couverture.pdf#page=420",
        "date": "2025-10",
        "accessedAt": "2026-10-19"
      }
    ]
  },
  "operateurs-fonctions-support": {
    "what": "Les opérateurs, souvent appelés « agences », sont des organismes publics distincts des ministères, financés et contrôlés par l’État (France Travail, Météo-France…). Fonctions support : paie, ressources humaines, comptabilité, informatique, achats, locaux.",
    "who": "Les agents de ces services, leurs fournisseurs, et l’État qui finance : 434 opérateurs et 402 218 emplois au PLF 2025, plus de la moitié dans les universités et la recherche (hors levier). Coût : 2,2 à 3,3 Md€ (calcul).",
    "up": "+10 % : 0,21 à 0,33 Md€ de plus en 2027, par exemple davantage de personnel ou d’outils pour la paie, l’informatique ou les locaux des opérateurs. +20 % : 0,43 à 0,66 Md€ (calcul).",
    "down": "−10 % : 0,21 à 0,33 Md€ d’économie en 2027, par exemple moins de personnel ou de moyens pour ces fonctions ; fusionner n’économise qu’à moyen-long terme (Sénat). −20 % : 0,43 à 0,66 Md€ (calcul).",
    "argsUp": [
      "Cybersécurité : faute de moyens ou d’expertise, les failles risquent d’augmenter (DINUM) ; une quarantaine de musées attaqués en 2024.",
      "Mutualiser peut échouer : la paie unique de l’État (ONP, 2007-2014) a coûté 346 M€ pour des « résultats quasi nuls » (Cour des comptes)."
    ],
    "argsDown": [
      "Le Sénat estime à 15 % les effectifs de gestion des grands opérateurs ; 11 à 12 % dans l’industrie et la banque (ancienne base DGME).",
      "La moitié des opérateurs a moins de 257 emplois ; une commission d’enquête du Sénat recommande de mutualiser paie, achats, informatique."
    ],
    "sources": [
      {
        "title": "Agencification : une méthodologie repensée pour une action publique renforcée, « L’essentiel » de la commission d’enquête sur les missions des agences, opérateurs et organismes consultatifs de l’État",
        "publisher": "Sénat",
        "url": "https://www.senat.fr/rap/r24-807-1/r24-807-1-syn.pdf",
        "date": "2025-07",
        "accessedAt": "2026-10-19"
      }
    ]
  }
}
