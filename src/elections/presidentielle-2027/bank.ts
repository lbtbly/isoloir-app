// Fichier généré par tools/build-pack.mjs depuis research/presidentielle-2027 : ne pas modifier à la main.
import type { QuestionBank } from '../../core/types'

export const bank: QuestionBank = {
  "topics": [
    {
      "id": "travail_salaires",
      "label": "Salaires et travail",
      "description": "Pouvoir d’achat, évolution des salaires, partage des bénéfices, temps de travail et droits des salariés."
    },
    {
      "id": "fiscalite",
      "label": "Impôts",
      "description": "Niveau et répartition des impôts et des prélèvements : revenus, patrimoine, héritages, entreprises, consommation."
    },
    {
      "id": "finances_publiques",
      "label": "Dette et dépenses publiques",
      "description": "Déficit et dette publics, niveau de la dépense publique, effectifs et organisation de l’État."
    },
    {
      "id": "industrie_economie",
      "label": "Industrie et entreprises",
      "description": "Stratégie de réindustrialisation, protection commerciale, aides publiques et règles pour les entreprises."
    },
    {
      "id": "retraites",
      "label": "Retraites",
      "description": "Âge de départ, financement des pensions et partage des décisions sur le système de retraite."
    },
    {
      "id": "sante",
      "label": "Santé et grand âge",
      "description": "Accès aux soins, prévention, place de la Sécurité sociale face aux complémentaires et accompagnement des personnes âgées dépendantes."
    },
    {
      "id": "logement",
      "label": "Logement",
      "description": "Loyers, construction et leviers pour rendre le logement plus abordable."
    },
    {
      "id": "solidarites",
      "label": "Solidarités et familles",
      "description": "Minima sociaux, assurance chômage, droits des personnes handicapées, politique familiale et natalité."
    },
    {
      "id": "egalite",
      "label": "Égalité femmes-hommes",
      "description": "Partage des responsabilités familiales, égalité salariale et lutte contre les violences faites aux femmes."
    },
    {
      "id": "droits_lgbtqia",
      "label": "Bioéthique et droits des personnes LGBTQIA+",
      "description": "Bioéthique de la procréation (procréation médicalement assistée, gestation pour autrui), filiation et adoption, changement de la mention du sexe à l’état civil, transidentité des mineurs, lutte contre les discriminations et éducation à la sexualité à l’école."
    },
    {
      "id": "education",
      "label": "École et jeunesse",
      "description": "Apprentissages et taille des classes, enseignement privé, université et recherche, mesures pour les jeunes."
    },
    {
      "id": "societe",
      "label": "Culture et audiovisuel public",
      "description": "Priorités de la politique culturelle, avenir de l’audiovisuel public et soutien à la création."
    },
    {
      "id": "numerique",
      "label": "Numérique",
      "description": "Intelligence artificielle, protection des mineurs face aux écrans et encadrement des grandes plateformes."
    },
    {
      "id": "ecologie_energie",
      "label": "Écologie, énergie et transports",
      "description": "Prix de l’énergie, nucléaire et renouvelables, transition écologique, transports, gestion de l’eau et adaptation au climat."
    },
    {
      "id": "agriculture",
      "label": "Agriculture, alimentation et animaux",
      "description": "Soutien aux agriculteurs, accès à l’alimentation, concurrence des produits importés et bien-être animal."
    },
    {
      "id": "territoires",
      "label": "Territoires et services publics",
      "description": "Services publics de proximité, pouvoirs des collectivités locales, égalité entre les territoires et outre-mer."
    },
    {
      "id": "securite_justice",
      "label": "Sécurité et justice",
      "description": "Police et gendarmerie, lutte contre la délinquance et le trafic de drogue, politique pénale et prisons."
    },
    {
      "id": "immigration",
      "label": "Immigration",
      "description": "Orientation de la politique migratoire, droit d’asile, intégration des étrangers, nationalité et expulsions."
    },
    {
      "id": "europe",
      "label": "Europe",
      "description": "Orientation de la construction européenne, budget de l’Union, règles du marché unique, élargissement, et maintien ou non dans l’Union européenne."
    },
    {
      "id": "ukraine_russie",
      "label": "Ukraine et Russie",
      "description": "Soutien à l’Ukraine et relation avec la Russie."
    },
    {
      "id": "proche_orient",
      "label": "Israël et Gaza",
      "description": "Position de la France sur la guerre à Gaza, l’État de Palestine et les relations avec le gouvernement israélien."
    },
    {
      "id": "defense",
      "label": "Défense",
      "description": "Budget et stratégie militaires, alliances dont l’OTAN, dissuasion nucléaire et service national."
    },
    {
      "id": "institutions",
      "label": "Institutions",
      "description": "Équilibre des pouvoirs entre président, gouvernement et Parlement, mode de scrutin, référendum et place des citoyens dans la décision."
    },
    {
      "id": "laicite_republique",
      "label": "Laïcité et mémoire",
      "description": "Conception de la laïcité, signes religieux, laïcité à l’école et mémoire de la colonisation."
    }
  ],
  "questions": [
    {
      "id": "retraites-1",
      "topicId": "retraites",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle suite donner à la réforme des retraites de 2023 ?",
      "context": "Aujourd’hui : la réforme de 2023, qui reporte l’âge légal de 62 à 64 ans, est suspendue jusqu’au 1er janvier 2028 ; l’âge de départ est gelé à 62 ans et 9 mois.",
      "explainer": {
        "summary": "L’âge légal de départ, porté de 60 à 62 ans par la réforme de 2010, doit atteindre 64 ans par étapes avec celle de 2023, dont la suspension retarde la hausse sans l’annuler. Les options vont d’un retour à 60 ans à un report à 65 ans ou à un âge lié à l’espérance de vie, en passant par un départ fondé sur la durée cotisée, la pénibilité ou le libre choix ; le débat porte sur le financement des retraites, l’emploi des seniors et les écarts d’espérance de vie et de santé selon les métiers et les catégories sociales.",
        "points": [
          {
            "text": "Deux règles se combinent : l’âge légal, avant lequel on ne peut pas partir sauf départ anticipé (carrière longue, par exemple), et la durée d’assurance, c’est-à-dire le nombre de trimestres à valider pour une pension à taux plein, sans réduction (« décote »). Depuis le 1er septembre 2026, une personne née en 1964 peut partir à 62 ans et 9 mois, et il lui faut 170 trimestres pour le taux plein, contre 63 ans et 171 trimestres avant la suspension. Suspendre la réforme ne l’annule pas : après les personnes nées au premier trimestre 1965, la hausse de l’âge légal reprend avec un trimestre de décalage, et l’âge de 64 ans s’appliquera aux personnes nées à partir de 1969, au lieu de 1968.",
            "source": {
              "title": "Suspension de la réforme des retraites : qui est concerné ?",
              "url": "https://www.service-public.gouv.fr/particuliers/actualites/A18825",
              "date": "2026-02-27",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "Pénibilité : le compte professionnel de prévention donne aux salariés exposés à certains risques des droits à formation, à temps partiel ou à des trimestres de retraite supplémentaires. Depuis une ordonnance de 2017, il retient six facteurs de risque au lieu de dix. Les quatre facteurs retirés (postures pénibles, manutention manuelle de charges, vibrations mécaniques, agents chimiques dangereux) relèvent depuis du départ anticipé pour pénibilité créé en 2010, lié à une maladie professionnelle.",
            "source": {
              "title": "Rapport au Président de la République relatif à l’ordonnance n° 2017-1389 du 22 septembre 2017",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035607467",
              "date": "2017-09-23",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Selon l’Insee, le taux d’emploi des 60-64 ans a augmenté de 3,4 points en 2024, sous l’effet principalement de la mise en œuvre de la réforme des retraites de 2023, puis de 2,0 points en 2025 (France, personnes vivant en logement ordinaire).",
            "source": {
              "title": "Une photographie du marché du travail en 2025 (Insee Première n° 2096)",
              "url": "https://www.insee.fr/fr/statistiques/8901327",
              "date": "2026-03-25",
              "publisher": "Insee"
            }
          }
        ],
        "figures": [
          {
            "value": "63,1 ans",
            "label": "Âge moyen de départ à la retraite en 2025, tous régimes obligatoires. Projection du COR : 64,6 ans en 2070, en tenant compte de la suspension de la réforme",
            "date": "2025",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (synthèse, p. 11)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "ans",
              "items": [
                {
                  "label": "2025",
                  "value": 63.1
                },
                {
                  "label": "2070",
                  "value": 64.6
                }
              ]
            }
          },
          {
            "value": "10,5 ans (hommes), 11,8 ans (femmes)",
            "label": "Espérance de vie sans incapacité à 65 ans, c’est-à-dire sans être limité par un problème de santé dans les activités quotidiennes (France hors Mayotte, 2024). Elle a augmenté de 1 an et 9 mois entre 2008 et 2024, pour les femmes comme pour les hommes, surtout avant 2019. L’espérance de vie à 65 ans, avec ou sans incapacité, est de 19,9 ans pour les hommes et de 23,6 ans pour les femmes (France, 2024)",
            "date": "2024",
            "source": {
              "title": "L’espérance de vie sans incapacité à 65 ans est de 11,8 ans pour les femmes et de 10,5 ans pour les hommes en 2024 (Études et Résultats n° 1363)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260122-ER-esperance-de-vie-sans-incapacite",
              "date": "2026-01-22",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "ans",
              "items": [
                {
                  "label": "Hommes",
                  "value": 10.5
                },
                {
                  "label": "Femmes",
                  "value": 11.8
                }
              ]
            }
          },
          {
            "value": "5,3 ans",
            "label": "Écart d’espérance de vie à 35 ans entre les hommes cadres et les hommes ouvriers (3,4 ans chez les femmes), France hors Mayotte, selon la mortalité observée en 2020-2022. Dans les années 1990 (France métropolitaine), cet écart était de 7,0 ans chez les hommes et de 2,6 ans chez les femmes",
            "date": "2020-2022",
            "source": {
              "title": "Les écarts d’espérance de vie entre cadres et ouvriers : 5 ans chez les hommes, 3 ans chez les femmes (Insee Première n° 2005)",
              "url": "https://www.insee.fr/fr/statistiques/8220688",
              "date": "2024-07-16",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "ans",
              "items": [
                {
                  "label": "Écart chez les hommes",
                  "value": 5.3
                },
                {
                  "label": "Écart chez les femmes",
                  "value": 3.4
                }
              ]
            }
          },
          {
            "value": "1,8 Md€ par an",
            "label": "Coût moyen de la suspension de la réforme de 2023, en année pleine, jusqu’en 2032 (chiffrage de la DREES repris par le COR). Selon la DREES et la DARES, citées par le COR, près d’un tiers des économies d’un recul de l’âge de départ est compensé à court terme par une hausse des autres dépenses sociales",
            "date": "2026",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (synthèse, p. 7 ; partie 4, p. 120)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "retraites-1-a",
          "text": "Ramener l’âge légal à 60 ans à taux plein, sans allonger la durée de cotisation"
        },
        {
          "id": "retraites-1-b",
          "text": "Ramener l’âge légal de départ à 62 ans, avec un départ plus tôt pour les carrières longues"
        },
        {
          "id": "retraites-1-c",
          "text": "Faire de la durée cotisée, modulée selon la pénibilité, le critère principal de départ plutôt que l’âge"
        },
        {
          "id": "retraites-1-d",
          "text": "Fixer des âges de départ différents selon la pénibilité et l’espérance de vie en bonne santé"
        },
        {
          "id": "retraites-1-e",
          "text": "Supprimer l’âge légal : partir au choix, avec une pension réduite ou majorée selon la durée cotisée"
        },
        {
          "id": "retraites-1-f",
          "text": "Reprendre le report à 64 ans, voire aller au-delà : 65 ans ou un âge lié à l’espérance de vie"
        }
      ]
    },
    {
      "id": "finances_publiques-1",
      "topicId": "finances_publiques",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quelle stratégie pour les finances publiques face à la dette ?",
      "context": "Aujourd’hui : la dette publique dépasse 115 % de la richesse produite en un an (PIB) et le déficit dépasse 5 % du PIB.",
      "explainer": {
        "summary": "Les administrations publiques dépensent plus qu’elles ne perçoivent : chaque année de déficit alourdit la dette, dont les intérêts augmentent. Les approches divergent : économiser sans hausse d’impôts (sur les prestations et les effectifs, les agences de l’État, ou l’immigration, l’aide internationale et la contribution européenne) ; taxer davantage les plus aisés, le capital ou les grandes entreprises, avec ou sans économies ; ou dépenser plus, en empruntant pour investir ou en prélevant sur les profits des entreprises.",
        "points": [
          {
            "text": "Dépenses et recettes : en 2025, les dépenses publiques représentent 57,3 % du PIB et les recettes 52,2 %, dont 43,6 % d’impôts et de cotisations sociales (les « prélèvements obligatoires »). Selon l’Insee, la baisse du déficit en 2025 s’explique surtout par la hausse des recettes : les mesures nouvelles sur les impôts et cotisations ont rapporté 23,0 Md€, dont 8,0 Md€ de contributions exceptionnelles sur les bénéfices des grandes entreprises et sur le fret maritime. Les dépenses ont ralenti (+2,5 %, après +4,0 % en 2024).",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106)",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            }
          },
          {
            "text": "Comparaison européenne : en 2025, selon Eurostat, les dépenses publiques représentent 49,5 % du PIB dans l’ensemble de l’Union européenne et les recettes 46,4 % ; le déficit public y atteint 3,1 % du PIB et la dette 81,7 %.",
            "source": {
              "title": "Euro area government deficit at 2.9 % and EU at 3.1 % of GDP (Euro indicators, 22 avril 2026)",
              "url": "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-22042026-ap",
              "date": "2026-04-22",
              "publisher": "Eurostat"
            }
          },
          {
            "text": "Règles européennes : depuis juillet 2024, la France fait l’objet d’une procédure de l’UE pour déficit excessif ; pour en sortir à l’échéance prévue, son déficit doit repasser sous 3 % du PIB en 2029. Le Gouvernement prévoit un déficit de 5,4 % du PIB en 2026 puis de 5,0 % en 2027, et une dette de 121,7 % du PIB fin 2027. Le Haut Conseil des finances publiques juge un retour sous 3 % en 2029 « très peu vraisemblable », sauf conjoncture très favorable.",
            "source": {
              "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
              "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
              "date": "2026-09-25",
              "publisher": "Haut Conseil des finances publiques"
            }
          }
        ],
        "figures": [
          {
            "value": "119,0 % du PIB",
            "label": "Dette publique selon la définition des règles européennes (« au sens de Maastricht »), soit 3 595,5 Md€ (117,5 % du PIB fin mars 2026)",
            "date": "fin juin 2026 (2e trimestre)",
            "source": {
              "title": "À la fin du deuxième trimestre 2026, le ratio de dette publique s’établit à 119,0 % du PIB (Informations rapides n° 239)",
              "url": "https://www.insee.fr/fr/statistiques/9053525",
              "date": "2026-09-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "fin mars 2026",
                  "value": 117.5
                },
                {
                  "label": "fin juin 2026",
                  "value": 119
                }
              ]
            }
          },
          {
            "value": "5,1 % du PIB",
            "label": "Déficit public, soit 152,5 Md€ (5,8 % du PIB en 2024)",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106)",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2024",
                  "value": 5.8
                },
                {
                  "label": "2025",
                  "value": 5.1
                }
              ]
            }
          },
          {
            "value": "1 714,2 Md€",
            "label": "Dépenses de l’ensemble des administrations publiques, dont 771,0 Md€ de prestations sociales (retraites, chômage, remboursements médicaux…), 548,8 Md€ de fonctionnement (dont 370,0 Md€ de rémunérations des agents publics), 192,1 Md€ de subventions et autres transferts, 132,2 Md€ d’investissement et 64,7 Md€ d’intérêts de la dette (en hausse de 11,2 % sur un an)",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106), figure 4",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            }
          },
          {
            "value": "30 906 M€",
            "label": "Contribution de la France au budget de l’Union européenne prévue pour 2027 par le projet de loi de finances (prélèvement sur les recettes de l’État), en hausse de 2,8 Md€ par rapport à la prévision révisée pour 2026",
            "date": "2027 (prévision)",
            "source": {
              "title": "Projet de loi de finances pour 2027 (n° 3210) : article 55 et exposé général des motifs",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/PRJLANR5L17B3210.html",
              "date": "2026-10-01",
              "publisher": "Assemblée nationale (projet déposé par le Gouvernement)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "finances_publiques-1-a",
          "text": "Réduire fortement la dépense publique, prestations sociales et effectifs publics compris, sans hausse d’impôts"
        },
        {
          "id": "finances_publiques-1-b",
          "text": "Économiser en priorité sur l’immigration, l’aide internationale et la contribution européenne, sans hausse d’impôts"
        },
        {
          "id": "finances_publiques-1-c",
          "text": "Répartir l’effort entre économies ciblées et nouveaux impôts sur les plus aisés et les grandes entreprises"
        },
        {
          "id": "finances_publiques-1-d",
          "text": "Emprunter pour investir massivement dans l’industrie et la transition écologique, plutôt que de réduire les dépenses"
        },
        {
          "id": "finances_publiques-1-e",
          "text": "Augmenter les dépenses de services publics en les finançant par un prélèvement sur les profits des entreprises"
        },
        {
          "id": "finances_publiques-1-f",
          "text": "Réduire le déficit surtout par de nouveaux impôts sur les plus hauts patrimoines et sur le capital"
        },
        {
          "id": "finances_publiques-1-g",
          "text": "Économiser d’abord sur le fonctionnement de l’État en supprimant agences et doublons administratifs, sans hausse d’impôts"
        }
      ]
    },
    {
      "id": "industrie_economie-1",
      "topicId": "industrie_economie",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Que faire des aides publiques aux entreprises ?",
      "context": "Aujourd’hui : une commission d’enquête du Sénat a estimé en 2025 ces aides (subventions, crédits d’impôt, allègements de cotisations, notamment sur les bas salaires) à environ 211 milliards d’euros par an ; les impôts de production portent sur le chiffre d’affaires, la valeur ajoutée ou les biens des entreprises, et non sur leurs bénéfices.",
      "explainer": {
        "summary": "Les aides aux entreprises prennent des formes très diverses (subventions, crédits d’impôt, baisses de cotisations), et leur montant total dépend de ce qu’on y inclut. Le débat porte sur leur coût pour les finances publiques, leur efficacité pour l’emploi et la compétitivité, les contreparties à exiger, le choix des bénéficiaires et l’arbitrage entre ces aides et une baisse des impôts et cotisations des entreprises.",
        "points": [
          {
            "text": "Devant la commission d’enquête du Sénat, le 15 mai 2025, le ministre de l’Économie a estimé ces aides à 150 Md€ : 40 Md€ de dépenses fiscales (réductions et crédits d’impôt), 30 Md€ de dépenses budgétaires et 80 Md€ d’allègements de cotisations sociales. Certaines aides comportent déjà des contreparties : clauses « anti-délocalisation » dans les zones dites « d’aide à finalité régionale » ; engagement des bénéficiaires d’un prêt garanti par l’État (PGE) de ne pas verser de dividendes ; dans certaines régions comme l’Occitanie, maintien de l’emploi pendant le projet et les cinq années suivantes pour les entreprises de taille intermédiaire aidées.",
            "source": {
              "title": "L’essentiel sur le rapport de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants (rapport n° 808, 2024-2025)",
              "url": "https://www.senat.fr/rap/r24-808-1/r24-808-1-syn.pdf",
              "date": "2025-07",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Selon les évaluations citées par la Cour des comptes, les baisses de cotisations ont un effet positif sur l’emploi au niveau du Smic, mais les études récentes sont plus incertaines ; une simulation faite avec le modèle du Trésor, pour un rapport d’économistes, chiffre à un million les emplois détruits si elles étaient toutes supprimées. La baisse des cotisations familiales sur les salaires intermédiaires (jusqu’à 3,3 Smic en 2025) « vise à renforcer la compétitivité du secteur manufacturier exportateur » ; ses effets sur l’emploi sont « jugés marginaux », ceux sur la compétitivité « complexes à caractériser ». La loi de financement de la sécurité sociale pour 2025 a prévu de fondre ces allègements, à compter de 2026, en une réduction unique limitée aux salaires jusqu’à 3 Smic.",
            "source": {
              "title": "Maîtriser la dynamique des allègements généraux de cotisations sociales (Sécurité sociale 2025, chapitre III)",
              "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf",
              "date": "2025-05-26",
              "publisher": "Cour des comptes"
            }
          },
          {
            "text": "Selon Eurostat, les « autres impôts sur la production » de la comptabilité nationale (impôts dus du seul fait de produire, hors TVA et autres impôts sur les produits) représentent 4,4 % du PIB en France en 2024, contre 2,4 % en moyenne dans l’Union européenne.",
            "source": {
              "title": "Main national accounts tax aggregates (gov_10a_taxag) : Other taxes on production (D29), administrations publiques et institutions de l’UE, % du PIB, 2024",
              "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/gov_10a_taxag?lang=en&unit=PC_GDP&sector=S13_S212&na_item=D29&geo=FR&geo=EU27_2020&time=2024",
              "date": "2026-07-21",
              "publisher": "Eurostat"
            }
          }
        ],
        "figures": [
          {
            "value": "de 108 à 211 Md€",
            "label": "Aides publiques aux entreprises en 2023 selon la commission d’enquête du Sénat : au moins 211 Md€ au sens large (subventions de l’État, aides de Bpifrance, dépenses fiscales et allègements de cotisations sociales) ; 108 Md€ au sens strict, sans les interventions de Bpifrance, les avantages fiscaux sur la TVA et ceux que l’État ne compte plus officiellement comme « dépenses fiscales »",
            "date": "2023",
            "source": {
              "title": "L’essentiel sur le rapport de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants (rapport n° 808, 2024-2025)",
              "url": "https://www.senat.fr/rap/r24-808-1/r24-808-1-syn.pdf",
              "date": "2025-07",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Au sens strict",
                  "value": 108
                },
                {
                  "label": "Au sens large",
                  "value": 211
                }
              ]
            }
          },
          {
            "value": "77,3 Md€",
            "label": "Allègements généraux de cotisations patronales du secteur privé en 2024, contre 20,9 Md€ en 2014. Sur cette hausse, 26,6 Md€ viennent des baisses de cotisations accordées en 2019 en échange de la suppression d’un crédit d’impôt (le CICE) : un « effet de périmètre », selon la Cour des comptes.",
            "date": "2024",
            "source": {
              "title": "Maîtriser la dynamique des allègements généraux de cotisations sociales (Sécurité sociale 2025, chapitre III)",
              "url": "https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf",
              "date": "2025-05-26",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2014",
                  "value": 20.9
                },
                {
                  "label": "2024",
                  "value": 77.3
                }
              ]
            }
          },
          {
            "value": "152,5 Md€",
            "label": "Déficit public de la France en 2025, soit 5,1 % du PIB (après 5,8 % en 2024)",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 – Insee Première n° 2106",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2024",
                  "value": 5.8
                },
                {
                  "label": "2025",
                  "value": 5.1
                }
              ]
            }
          },
          {
            "value": "2 267",
            "label": "Nombre d’aides publiques aux entreprises recensées en mai 2025 par le site de référence aides-entreprises.fr (État, sécurité sociale, collectivités, Union européenne…)",
            "date": "mai 2025",
            "source": {
              "title": "L’essentiel sur le rapport de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants (rapport n° 808, 2024-2025)",
              "url": "https://www.senat.fr/rap/r24-808-1/r24-808-1-syn.pdf",
              "date": "2025-07",
              "publisher": "Sénat"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "industrie_economie-1-a",
          "text": "En supprimer une large part et baisser d’autant les impôts de production payés par les entreprises"
        },
        {
          "id": "industrie_economie-1-b",
          "text": "Baisser fortement les impôts de production et les cotisations patronales, en gardant des aides ciblées"
        },
        {
          "id": "industrie_economie-1-c",
          "text": "Les conditionner à des engagements sur les salaires, l’emploi, l’investissement ou le climat"
        },
        {
          "id": "industrie_economie-1-d",
          "text": "Les recentrer sur les petites entreprises et les artisans, par des baisses de prélèvements ciblées"
        },
        {
          "id": "industrie_economie-1-e",
          "text": "Supprimer les aides aux grands groupes et interdire les licenciements, sous peine de réquisition"
        },
        {
          "id": "industrie_economie-1-f",
          "text": "Réduire nettement leur montant, en supprimant celles accordées sans contrepartie, pour baisser le déficit"
        }
      ]
    },
    {
      "id": "travail_salaires-1",
      "topicId": "travail_salaires",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quel levier privilégier pour augmenter le pouvoir d’achat des salariés ?",
      "context": "Aujourd’hui : le salaire minimum (SMIC) suit au moins l’inflation ; la contribution sociale généralisée (CSG) prélève environ 9 % du salaire brut pour financer la protection sociale.",
      "explainer": {
        "summary": "Le pouvoir d’achat dépend du salaire net et des prix : on peut agir sur le SMIC ou sur l’ensemble des salaires, sur les prélèvements des salariés (heures supplémentaires comprises), sur les allègements de cotisations patronales ou sur les prix. Chaque levier pèse d’abord sur un acteur différent : les employeurs pour une hausse des salaires, les finances publiques et sociales pour une baisse des prélèvements ou de nouvelles exonérations, les producteurs, les distributeurs ou l’État pour une baisse des prix.",
        "points": [
          {
            "text": "Le SMIC est revalorisé chaque 1er janvier : il suit l’inflation subie par les 20 % de ménages aux revenus les plus faibles, plus la moitié du gain de pouvoir d’achat du salaire horaire moyen des ouvriers et des employés. En cours d’année, il augmente automatiquement dès que les prix ont progressé d’au moins 2 % depuis la dernière hausse. Le gouvernement peut aussi décider à tout moment une hausse supplémentaire, le « coup de pouce ».",
            "source": {
              "title": "Smic (salaire minimum interprofessionnel de croissance)",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300",
              "date": "2026-06-01",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "Le salaire net, c’est le brut moins les cotisations salariales (surtout pour la retraite) et la CSG-CRDS, qui financent la protection sociale et le remboursement de sa dette. Baisser ces prélèvements augmente le net sans changer le coût pour l’employeur ; la recette perdue doit alors être compensée par d’autres recettes ou par des économies. Côté employeur, depuis le 1er janvier 2026, la réduction générale dégressive unique allège les cotisations patronales : elle est maximale au niveau du SMIC, diminue quand le salaire augmente et cesse à 3 SMIC (valeur du 1er janvier 2026).",
            "source": {
              "title": "Réduction générale dégressive unique (RGDU) de cotisations patronales",
              "url": "https://entreprendre.service-public.gouv.fr/vosdroits/F24542",
              "date": "2026-06-15",
              "publisher": "Service-public.gouv.fr Entreprendre (DILA)"
            }
          },
          {
            "text": "En principe, les prix sont libres. En cas de crise, de circonstances exceptionnelles ou de situation manifestement anormale du marché, le gouvernement peut toutefois prendre, par décret en Conseil d’État, des mesures temporaires contre des hausses ou des baisses excessives de prix dans un secteur donné. Ces mesures durent six mois au plus (code de commerce, art. L410-2).",
            "source": {
              "title": "Article L410-2 du code de commerce",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019798129",
              "date": "2008-11-15",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "12,31 €",
            "label": "SMIC horaire brut depuis le 1er juin 2026, contre 12,02 € avant (+2,41 %) : une hausse automatique, déclenchée par une inflation d’au moins 2 % depuis la précédente revalorisation. Pour un temps plein : 1 867,02 € brut et 1 477,93 € net par mois (France hors Mayotte, qui a son propre SMIC).",
            "date": "1er juin 2026",
            "source": {
              "title": "Revalorisation annuelle du SMIC au 1er juin 2026",
              "url": "https://normandie.dreets.gouv.fr/Revalorisation-annuelle-du-SMIC-au-1er-juin-2026",
              "date": "2026-05-22",
              "publisher": "DREETS Normandie (ministère du Travail et des Solidarités)"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Avant le 1er juin 2026",
                  "value": 12.02
                },
                {
                  "label": "Depuis le 1er juin 2026",
                  "value": 12.31
                }
              ]
            }
          },
          {
            "value": "12,4 %",
            "label": "Part des salariés du privé non agricole directement concernés par la hausse du SMIC du 1er novembre 2024, soit 2,2 millions de personnes, contre 14,6 % lors de la hausse du 1er janvier 2024 (France hors Mayotte, hors apprentis, stagiaires et intérimaires).",
            "date": "1er novembre 2024",
            "source": {
              "title": "La revalorisation du Smic au 1er novembre 2024 (Dares Résultats n° 52)",
              "url": "https://dares.travail-emploi.gouv.fr/publication/la-revalorisation-du-smic-au-1er-novembre-2024",
              "date": "2025-10-29",
              "publisher": "Dares (ministère du Travail)"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "1er janvier 2024",
                  "value": 14.6
                },
                {
                  "label": "1er novembre 2024",
                  "value": 12.4
                }
              ]
            }
          },
          {
            "value": "3,0 %",
            "label": "Hausse des prix à la consommation sur un an en septembre 2026 (estimation provisoire, France), après +2,4 % en août. Sur la même période : énergie +21,2 %, alimentation +1,5 %.",
            "date": "septembre 2026",
            "source": {
              "title": "En septembre 2026, les prix à la consommation augmenteraient de 3,0 % sur un an (Informations rapides n° 242)",
              "url": "https://www.insee.fr/fr/statistiques/9056956",
              "date": "2026-09-30",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "Août 2026",
                  "value": 2.4
                },
                {
                  "label": "Septembre 2026",
                  "value": 3
                }
              ]
            }
          },
          {
            "value": "−1,3 % puis −1,0 %",
            "label": "Évolution du salaire net moyen du privé, inflation déduite, en 2022 puis en 2023. Selon l’Insee, les hausses du SMIC ont alors préservé le bas de l’échelle, quand l’inflation rognait les salaires plus élevés. Après +0,8 % en 2024, le salaire moyen retrouve « à peine » son niveau de 2019 (France y compris Mayotte, apprentis et stagiaires compris, hors agriculture et particuliers employeurs)",
            "date": "2022 à 2024",
            "source": {
              "title": "Insee Première n° 2079 – Salaires dans le secteur privé en 2024 (23 octobre 2025)",
              "url": "https://www.insee.fr/fr/statistiques/8657156",
              "date": "2025-10-23",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2022",
                  "value": -1.3
                },
                {
                  "label": "2023",
                  "value": -1
                },
                {
                  "label": "2024",
                  "value": 0.8
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "travail_salaires-1-a",
          "text": "Relever nettement le salaire minimum (SMIC) par décision de l’État, au-delà de ce qu’impose l’inflation"
        },
        {
          "id": "travail_salaires-1-b",
          "text": "Augmenter tous les salaires et les indexer automatiquement sur la hausse des prix"
        },
        {
          "id": "travail_salaires-1-c",
          "text": "Baisser les prélèvements payés par les salariés (cotisations, CSG ou impôt sur le revenu) pour augmenter leur revenu net"
        },
        {
          "id": "travail_salaires-1-d",
          "text": "Exonérer de prélèvements les heures supplémentaires, pour augmenter le revenu des salariés qui en font"
        },
        {
          "id": "travail_salaires-1-e",
          "text": "Faire baisser les prix des produits de première nécessité et de l’énergie, par un blocage ou des baisses de taxes"
        },
        {
          "id": "travail_salaires-1-f",
          "text": "Revaloriser en priorité les salaires des métiers peu rémunérés du soin, des services et de l’industrie"
        },
        {
          "id": "travail_salaires-1-g",
          "text": "Conditionner les allègements de cotisations patronales à des hausses de salaires négociées dans chaque branche",
          "external": true
        },
        {
          "id": "travail_salaires-1-h",
          "text": "Revoir les allègements de cotisations pour qu’une hausse de salaire au-dessus du SMIC profite davantage au salarié"
        },
        {
          "id": "travail_salaires-1-i",
          "text": "Exonérer de cotisations patronales les hausses de salaire accordées par les entreprises",
          "external": true
        }
      ]
    },
    {
      "id": "fiscalite-1",
      "topicId": "fiscalite",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle imposition pour les grands patrimoines ?",
      "context": "Aujourd’hui : depuis 2018, seul le patrimoine immobilier de plus de 1,3 million d’euros est soumis à un impôt annuel ; un impôt minimum sur les plus grandes fortunes, adopté par l’Assemblée nationale en février 2025, a été rejeté par le Sénat en juin 2025 puis par l’Assemblée en octobre 2025.",
      "explainer": {
        "summary": "Faut-il alourdir, maintenir ou alléger l’imposition des grands patrimoines, et sous quelle forme ? Les approches vont d’un impôt sur la fortune élargi aux placements financiers ou d’un impôt minimum sur les très grandes fortunes à un impôt ciblé (placements financiers, biens peu productifs, revenus du capital), jusqu’au maintien ou à l’allègement de l’impôt actuel ; en jeu, les recettes et la répartition de l’impôt, l’investissement et les départs à l’étranger.",
        "points": [
          {
            "text": "Impôt minimum : une proposition de loi vise les foyers dont le patrimoine net dépasse 100 M€. L’impôt sur le revenu, l’impôt sur la fortune immobilière (IFI) et les prélèvements sociaux qu’ils paient devraient atteindre ensemble au moins 2 % de ce patrimoine. Le Sénat ne l’a pas adoptée le 12 juin 2025 et l’a transmise à l’Assemblée nationale pour une deuxième lecture.",
            "source": {
              "title": "Proposition de loi instaurant un impôt plancher de 2 % sur le patrimoine des ultra-riches (la loi en clair)",
              "url": "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-instaurant-un-impot-plancher-de-2-sur-le-patrimoine-des-ultrariches.html",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Départs et retours : sous l’ancien impôt de solidarité sur la fortune (ISF), 950 foyers assujettis partaient chaque année à l’étranger et 370 revenaient, en moyenne (2011-2016). Sous l’IFI, on compte 260 départs et 380 retours par an (moyenne 2018-2021), pour quelque 150 000 foyers assujettis à l’IFI. Le comité d’évaluation de France Stratégie juge l’enjeu budgétaire « vraisemblablement de second ordre », mais une étude qu’il a commandée suggère que l’activité des entreprises dont l’actionnaire de référence quitte la France évolue ensuite, en moyenne, moins bien que celle des autres.",
            "source": {
              "title": "Comité d’évaluation des réformes de la fiscalité du capital – Rapport final (avis du comité)",
              "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/Rapport/fs-2023-rapport-isf-quatrieme_rapport_complet_17octobre_avis_0.pdf",
              "date": "2023-10",
              "publisher": "France Stratégie"
            }
          },
          {
            "text": "Revenus du capital : depuis 2018, les revenus des placements financiers (dividendes, intérêts…) sont soumis, sauf exceptions, à un prélèvement forfaitaire unique de 12,8 % au titre de l’impôt sur le revenu, sauf option pour le barème progressif. S’y ajoutent les prélèvements sociaux, passés de 17,2 % à 18,6 % au 1er janvier 2026 ; l’assurance-vie et l’épargne logement (PEL, CEL) ouverte jusqu’au 31 décembre 2017 restent à 17,2 %.",
            "source": {
              "title": "Les revenus mobiliers",
              "url": "https://www.impots.gouv.fr/particulier/les-revenus-mobiliers",
              "date": "2026-04-08",
              "publisher": "DGFiP (impots.gouv.fr)"
            }
          }
        ],
        "figures": [
          {
            "value": "193 600 foyers",
            "label": "Foyers ayant reçu un avis d’impôt sur la fortune immobilière (IFI) en 2025 (près de 193 600), pour un total de 2,3 Md€ d’impôt (+8,0 % sur un an)",
            "date": "2025",
            "source": {
              "title": "Bulletin « DGFiP Statistiques » n° 45 – L’impôt sur la fortune immobilière en 2025",
              "url": "https://www.impots.gouv.fr/actualite/bulletin-dgfip-statistiques-ndeg45-limpot-sur-la-fortune-immobiliere-en-2025",
              "date": "2026-04-14",
              "publisher": "DGFiP (impots.gouv.fr)"
            }
          },
          {
            "value": "4,2 Md€",
            "label": "Recettes de l’impôt de solidarité sur la fortune (ISF) en 2017, sa dernière année. L’IFI, qui l’a remplacé, a rapporté 1,29 Md€ en 2018 et 1,83 Md€ en 2022 (hors contrôle fiscal et régularisation des avoirs non déclarés à l’étranger).",
            "date": "2017",
            "source": {
              "title": "Comité d’évaluation des réformes de la fiscalité du capital – Rapport final (avis du comité)",
              "url": "https://www.strategie-plan.gouv.fr/files/files/Publications/Rapport/fs-2023-rapport-isf-quatrieme_rapport_complet_17octobre_avis_0.pdf",
              "date": "2023-10",
              "publisher": "France Stratégie"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Recettes de l’ISF en 2017",
                  "value": 4.2
                },
                {
                  "label": "Recettes de l’IFI en 2018",
                  "value": 1.29
                },
                {
                  "label": "Recettes de l’IFI en 2022",
                  "value": 1.83
                }
              ]
            }
          },
          {
            "value": "3,5 %",
            "label": "Poids des impôts sur le patrimoine dans le PIB en France en 2023, contre 1,7 % en moyenne dans les pays de l’OCDE. Cette catégorie réunit les impôts fonciers, l’impôt sur la fortune, les droits de succession et de donation et les droits sur les transactions financières et immobilières. L’impôt annuel sur la fortune nette (l’IFI en France) en représente 0,08 % du PIB, contre 0,16 % en moyenne dans l’OCDE.",
            "date": "2023",
            "source": {
              "title": "Revenue Statistics – Comparative tax revenues (OCDE) : impôts sur le patrimoine (4000) et impôts périodiques sur l’actif net (4200), en % du PIB, 2023",
              "url": "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_REV_COMP_OECD@DF_RSOECD,/FRA+OECD_REP.TAX_REV.S13.T_4000+T_4200._T.PT_B1GQ.A?startPeriod=2023&endPeriod=2023&format=csvfilewithlabels",
              "date": "2025-12",
              "publisher": "OCDE"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "France",
                  "value": 3.5
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 1.7
                }
              ]
            }
          },
          {
            "value": "48 %",
            "label": "Part du patrimoine brut total détenue par les 10 % de ménages les mieux dotés ; les 1 % les mieux dotés en détiennent 15 %. Chez ces 1 %, l’immobilier représente 34 % du patrimoine brut, contre 61 % pour l’ensemble des ménages ; le patrimoine professionnel en représente 36 % et le financier 27 %. Selon l’Insee, seules des données administratives permettent d’observer finement le très haut de la distribution (France hors Mayotte, ménages en logement ordinaire).",
            "date": "début 2024 (enquête menée de juin 2023 à janvier 2024)",
            "source": {
              "title": "Les montants de patrimoine détenus par les ménages en 2024 (Insee Focus n° 371)",
              "url": "https://www.insee.fr/fr/statistiques/8672665",
              "date": "2025-12-09",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "part",
              "value": 48,
              "total": 100,
              "unit": "%",
              "whole": "du patrimoine brut total"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "fiscalite-1-a",
          "text": "Rétablir un impôt annuel sur la fortune incluant les placements financiers, comme avant 2018"
        },
        {
          "id": "fiscalite-1-b",
          "text": "Créer un impôt minimum de 2 % par an sur les patrimoines de plus de 100 millions d’euros"
        },
        {
          "id": "fiscalite-1-c",
          "text": "Remplacer l’impôt annuel sur le patrimoine immobilier par un impôt portant sur les seuls placements financiers"
        },
        {
          "id": "fiscalite-1-d",
          "text": "Plutôt qu’un impôt sur le patrimoine, taxer davantage les revenus du capital et freiner l’évasion fiscale"
        },
        {
          "id": "fiscalite-1-e",
          "text": "Ne pas alourdir l’imposition du patrimoine, voire alléger l’impôt actuel sur la fortune immobilière"
        },
        {
          "id": "fiscalite-1-f",
          "text": "Remplacer l’impôt annuel sur le patrimoine immobilier par un impôt sur les biens peu productifs : logements vacants, biens de luxe, liquidités",
          "external": true
        }
      ]
    },
    {
      "id": "fiscalite-2",
      "topicId": "fiscalite",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment imposer les héritages et les donations ?",
      "context": "Aujourd’hui : un enfant hérite sans impôt jusqu’à 100 000 euros de chaque parent, puis est taxé de 5 % à 45 %, ce dernier taux s’appliquant au-delà d’environ 1,8 million d’euros.",
      "explainer": {
        "summary": "Rapportés à la richesse nationale, les droits sur les héritages et les donations pèsent plus en France que dans les autres pays comparés, mais la plupart des héritages entre parents et enfants n’en paient pas et des régimes particuliers (entreprises familiales, assurance-vie) allègent l’impôt sur les plus grosses transmissions. Les approches divergent : taxer davantage les grosses successions, plafonner ce qu’on peut recevoir, alléger les héritages modestes, faciliter les donations, supprimer ces droits, ou conditionner ou réduire les exonérations.",
        "points": [
          {
            "text": "Donations : un parent peut donner à chaque enfant 100 000 € sans droits, et cet abattement se reconstitue tous les 15 ans. S’y ajoute un don d’argent exonéré jusqu’à 31 865 €, lui aussi renouvelable tous les 15 ans, si le donateur a moins de 80 ans et si le bénéficiaire est majeur. Au-delà, le barème va de 5 % à 45 %, comme pour les successions.",
            "source": {
              "title": "Quels sont les droits à payer sur une donation selon le lien avec le donateur ?",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F14203",
              "date": "2026-05-13",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "Entreprises familiales (« pacte Dutreil ») : 75 % de la valeur des parts d’une société industrielle, commerciale, artisanale, agricole ou libérale échappe aux droits, si les associés puis les héritiers ou donataires s’engagent à conserver ces parts. La loi de finances pour 2026 (19 février 2026) a porté l’engagement individuel de quatre à six ans et exclu de l’exonération certains biens non affectés à l’activité (yachts, bijoux, objets d’art, logements…). Le texte ne fixe aucune condition sur le lieu de l’activité ou de la production.",
            "source": {
              "title": "Article 787 B du code général des impôts (modifié par la loi n° 2026-103 du 19 février 2026 de finances pour 2026)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542700",
              "date": "2026-02-21",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Assurance-vie et taux réels : les capitaux d’assurance-vie issus de primes versées avant 70 ans sont taxés à part. Après un abattement de 152 500 € par bénéficiaire, ils sont taxés à 20 % jusqu’à 700 000 €, puis à 31,25 %. Avec ces régimes et le pacte Dutreil, le taux effectif des successions en ligne directe de plus de 1 M€ est de 15 %, contre plus de 20 % sans eux (données 2018, modèle de la direction générale du Trésor).",
            "source": {
              "title": "Les droits de succession – Communication à la commission des finances de l’Assemblée nationale (p. 8 et 66-67)",
              "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20240925-Droits-de-succession%C2%A0_1.pdf",
              "date": "2024-09-25",
              "publisher": "Cour des comptes"
            }
          }
        ],
        "figures": [
          {
            "value": "16,1 Md€",
            "label": "Droits de succession perçus par l’État en 2025, contre 16,0 Md€ en 2024 ; s’y ajoutent 5,1 Md€ de droits sur les donations.",
            "date": "2025",
            "source": {
              "title": "Exécution budgétaire 2025 des recettes fiscales nettes de l’État et des remboursements et dégrèvements – Synthèse (§ 7.1, p. 26)",
              "url": "https://www.budget.gouv.fr/documentation/file-download/33360",
              "date": "2026-02",
              "publisher": "Direction du Budget, DG Trésor, DGFiP (budget.gouv.fr)"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Droits de succession",
                  "value": 16.1
                },
                {
                  "label": "Droits sur les donations",
                  "value": 5.1
                }
              ]
            }
          },
          {
            "value": "24 %",
            "label": "Part des successions en ligne directe (entre parents et enfants) effectivement soumises à l’impôt, contre 60 % en ligne indirecte (frères, sœurs, neveux…). En ligne directe, un héritier paie en moyenne 6 835 € de droits ; la médiane (montant qui partage les héritiers en deux moitiés) est de 0 €.",
            "date": "2018 (modèle de microsimulation de la DG Trésor, cité par la Cour des comptes en 2024)",
            "source": {
              "title": "Les droits de succession – Communication à la commission des finances de l’Assemblée nationale (p. 76 et annexe 7)",
              "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20240925-Droits-de-succession%C2%A0_1.pdf",
              "date": "2024-09-25",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "En ligne directe",
                  "value": 24
                },
                {
                  "label": "En ligne indirecte",
                  "value": 60
                }
              ]
            }
          },
          {
            "value": "0,74 % du PIB",
            "label": "Poids des droits sur les successions et les donations en France en 2021 : le plus élevé des 39 pays de l’OCDE ou de l’Union européenne comparés par le Conseil des prélèvements obligatoires.",
            "date": "2021",
            "source": {
              "title": "Les droits de succession – Communication à la commission des finances de l’Assemblée nationale (p. 57)",
              "url": "https://www.ccomptes.fr/sites/default/files/2024-09/20240925-Droits-de-succession%C2%A0_1.pdf",
              "date": "2024-09-25",
              "publisher": "Cour des comptes"
            }
          },
          {
            "value": "5,5 Md€",
            "label": "Dépense fiscale liée au pacte Dutreil en 2024, estimée par la Cour des comptes, contre 1,2 Md€ en 2020 ; la hausse tient en partie à une très grosse donation en 2023 et une autre en 2024. C’est l’avantage fiscal par rapport au droit commun, et non un coût économique net. 65 % de cet avantage va à 1 % des bénéficiaires (110 personnes). Les entreprises ainsi transmises sont un peu moins souvent en faillite ou dissoutes (6 % contre 10 % au bout de neuf ans), sans investir ni employer davantage que les autres.",
            "date": "2024",
            "source": {
              "title": "Le pacte Dutreil – Rapport public thématique (synthèse, p. 11, 12 et 15)",
              "url": "https://www.ccomptes.fr/sites/default/files/2025-11/20251118-Synthese-Pacte%20Dutreil.pdf",
              "date": "2025-11-18",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2020",
                  "value": 1.2
                },
                {
                  "label": "2024",
                  "value": 5.5
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "fiscalite-2-a",
          "text": "Taxer davantage les plus grosses successions, au-delà d’environ 2 millions d’euros transmis"
        },
        {
          "id": "fiscalite-2-b",
          "text": "Plafonner le montant total qu’une personne peut recevoir en héritage et en dons au cours de sa vie"
        },
        {
          "id": "fiscalite-2-c",
          "text": "Alléger les droits sur les héritages modestes et moyens, par exemple sur la résidence principale"
        },
        {
          "id": "fiscalite-2-d",
          "text": "Relever fortement les montants que l’on peut donner sans impôt de son vivant, sans alourdir les successions"
        },
        {
          "id": "fiscalite-2-e",
          "text": "Supprimer entièrement les droits de succession et de donation, quel que soit le montant transmis"
        },
        {
          "id": "fiscalite-2-f",
          "text": "Réserver l’avantage fiscal sur la transmission d’entreprises familiales à celles qui produisent en France"
        },
        {
          "id": "fiscalite-2-g",
          "text": "Réduire les exonérations sur la transmission d’entreprises et l’assurance-vie, surtout pour les plus gros héritages"
        }
      ]
    },
    {
      "id": "finances_publiques-2",
      "topicId": "finances_publiques",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles règles pour l’endettement de l’État ?",
      "context": "Aujourd’hui : les règles européennes demandent de ramener le déficit public sous 3 % du PIB, les intérêts de la dette sont devenus l’un des premiers postes du budget de l’État, et près d’un cinquième de la dette française est détenu par la Banque centrale européenne et la Banque de France.",
      "explainer": {
        "summary": "L’État et les autres administrations publiques empruntent chaque année pour couvrir leur déficit, et la charge des intérêts augmente. Les approches divergent : encadrer le déficit par une règle inscrite dans la Constitution, imposer l’équilibre aux seuls comptes de la Sécurité sociale, ne plus compter certains investissements dans le déficit, ou changer la façon de financer la dette (banque centrale, monnaie nationale, épargne des Français).",
        "points": [
          {
            "text": "Dans le cadre des règles budgétaires européennes, la France a présenté un plan budgétaire pour 2025-2029. Visée par une procédure pour déficit excessif, elle doit ramener son déficit sous 3 % du PIB en 2029. En juin 2025, la Commission européenne a jugé que la France avait adopté une première série d’« actions suivies d’effets ».",
            "source": {
              "title": "Évaluation du rapport d’avancement annuel sur le plan budgétaire et structurel à moyen terme 2025-2029 de la France (paquet de printemps de la Commission européenne)",
              "url": "https://presse.economie.gouv.fr/evaluation-du-rapport-davancement-annuel-sur-le-plan-budgetaire-et-structurel-a-moyen-terme-2025-2029-de-la-france-paquet-de-printemps-de-la-commission-europeenne/",
              "date": "2025-06-04",
              "publisher": "Ministère de l’Économie et des Finances"
            }
          },
          {
            "text": "Les traités européens interdisent à la Banque centrale européenne et aux banques centrales nationales, dont la Banque de France, d’accorder des crédits aux États. Ils leur interdisent aussi d’acheter leurs titres de dette directement auprès d’eux (article 123 du traité sur le fonctionnement de l’UE).",
            "source": {
              "title": "Traité sur le fonctionnement de l’Union européenne, article 123",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:12016E123",
              "publisher": "EUR-Lex (Union européenne)"
            }
          },
          {
            "text": "La Constitution française prévoit des lois de programmation des finances publiques. Celles-ci « s’inscrivent dans l’objectif d’équilibre des comptes des administrations publiques », sans fixer de plafond chiffré au déficit ni à la dette.",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur (article 34)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "3 595,5 Md€",
            "label": "Dette publique de la France (définition européenne, dite « de Maastricht ») fin juin 2026, soit 119,0 % du PIB, contre 115,2 % un an plus tôt. Dont 2 942,1 Md€ pour l’État, 309,4 Md€ pour les administrations de sécurité sociale et 274,9 Md€ pour les administrations publiques locales.",
            "date": "fin du 2e trimestre 2026",
            "source": {
              "title": "À la fin du deuxième trimestre 2026, le ratio de dette publique s’établit à 119,0 % du PIB (Informations rapides n° 239)",
              "url": "https://www.insee.fr/fr/statistiques/9053525",
              "date": "2026-09-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "Fin juin 2025",
                  "value": 115.2
                },
                {
                  "label": "Fin juin 2026",
                  "value": 119
                }
              ]
            }
          },
          {
            "value": "152,5 Md€",
            "label": "Déficit public en 2025, soit 5,1 % du PIB, contre 5,8 % en 2024. Dont 128,1 Md€ pour l’État et 6,7 Md€ pour les administrations de sécurité sociale (22,1 Md€ hors CADES, la caisse qui amortit la dette sociale). La même année, l’investissement public atteint 132,2 Md€, dont 70,7 Md€ par les administrations locales.",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106)",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2024",
                  "value": 5.8
                },
                {
                  "label": "2025",
                  "value": 5.1
                }
              ]
            }
          },
          {
            "value": "64,7 Md€",
            "label": "Charges d’intérêts de l’ensemble des administrations publiques en 2025 (comptabilité nationale), en hausse de 11,2 % sur un an. Dont 53,3 Md€ pour les administrations centrales (État et organismes rattachés).",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106)",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "part",
              "value": 53.3,
              "total": 64.7,
              "unit": "Md€",
              "whole": "de charges d’intérêts publiques"
            }
          },
          {
            "value": "55,9 %",
            "label": "Part des titres de dette à long terme des administrations publiques françaises détenue par des investisseurs non résidents (établis hors de France) au 31 mars 2026, contre 54,6 % fin décembre 2025",
            "date": "31 mars 2026",
            "source": {
              "title": "Émission et détention de titres français - 2026-Q1",
              "url": "https://www.banque-france.fr/fr/statistiques/credit/emission-et-detention-de-titres-francais-2026-q1",
              "date": "2026-07-13",
              "publisher": "Banque de France"
            },
            "chart": {
              "kind": "part",
              "value": 55.9,
              "total": 100,
              "unit": "%",
              "whole": "des titres de dette publique à long terme"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "finances_publiques-2-a",
          "text": "Inscrire dans la Constitution une règle d’or qui limite le déficit et impose de réduire la dette"
        },
        {
          "id": "finances_publiques-2-b",
          "text": "Imposer l’équilibre aux seuls comptes de la Sécurité sociale, apprécié sur un cycle de cinq ans"
        },
        {
          "id": "finances_publiques-2-c",
          "text": "Ne plus compter dans le déficit les investissements écologiques et industriels, financés par l’emprunt"
        },
        {
          "id": "finances_publiques-2-d",
          "text": "Faire porter par la Banque centrale européenne une partie de la dette, sous forme de dette perpétuelle"
        },
        {
          "id": "finances_publiques-2-e",
          "text": "Revenir à une monnaie nationale et faire financer l’État directement par la Banque de France"
        },
        {
          "id": "finances_publiques-2-f",
          "text": "Racheter la dette publique détenue à l’étranger grâce à un grand emprunt réservé aux Français"
        }
      ]
    },
    {
      "id": "finances_publiques-3",
      "topicId": "finances_publiques",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle évolution pour le nombre d’agents publics ?",
      "context": "Aujourd’hui : près de 6 millions de personnes travaillent dans la fonction publique (État, collectivités locales, hôpitaux).",
      "explainer": {
        "summary": "La fonction publique emploie près de 5,9 millions de personnes (État, collectivités locales, hôpitaux), dont les rémunérations sont un poste important de la dépense publique. Le débat oppose maîtrise de la dépense et besoins de personnel des services publics ; il porte aussi sur les salaires et sur la place du statut de fonctionnaire, alors que le recours aux contractuels augmente.",
        "points": [
          {
            "text": "Chaque année, la loi de finances fixe, ministère par ministère, un plafond d’emplois rémunérés par l’État. Ce plafond ne porte que sur les emplois payés par l’État : il ne couvre pas les agents des collectivités locales ni ceux des hôpitaux publics.",
            "source": {
              "title": "Loi organique n° 2001-692 du 1er août 2001 relative aux lois de finances, article 7",
              "url": "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006321025",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Selon le code général de la fonction publique, les emplois civils permanents « ont vocation à être confiés à des fonctionnaires ». Dans la fonction publique de l’État, des exceptions permettent toutefois de recruter des contractuels sur ces emplois : pas de corps de fonctionnaires correspondant, compétences spécialisées, emploi à temps incomplet, établissements publics…",
            "source": {
              "title": "Les cas de recours aux agents contractuels au sein de la fonction publique de l’État",
              "url": "https://www.fonction-publique.gouv.fr/devenir-agent-public/les-cas-de-recours-aux-agents-contractuels-au-sein-de-la-fonction-publique-de-letat",
              "date": "2023-04-14",
              "publisher": "Direction générale de l’administration et de la fonction publique (DGAFP)"
            }
          },
          {
            "text": "Le traitement de base d’un fonctionnaire s’obtient en multipliant son indice par la valeur du point d’indice, fixée par décret. Cette valeur a été revalorisée de 1,5 % au 1er juillet 2023. Selon la DGAFP, elle était inchangée au 2e trimestre 2026.",
            "source": {
              "title": "Au deuxième trimestre 2026, l’indice de traitement brut - grille indiciaire est stable (Stats rapides n° 140)",
              "url": "https://www.fonction-publique.gouv.fr/files/files/publications/stats-rapides/itb_gi_2026_t2.pdf",
              "date": "2026-09",
              "publisher": "Direction générale de l’administration et de la fonction publique (DGAFP)"
            }
          }
        ],
        "figures": [
          {
            "value": "5 876 700",
            "label": "Agents de la fonction publique fin 2024 (France hors Mayotte, contrats aidés compris), en hausse de 0,6 % sur un an : 2 587 400 dans la fonction publique de l’État, 2 039 400 dans la territoriale et 1 249 900 dans l’hospitalière",
            "date": "31 décembre 2024",
            "source": {
              "title": "L’emploi dans la fonction publique en 2024 (Insee Première n° 2094)",
              "url": "https://www.insee.fr/fr/statistiques/8732435",
              "date": "2026-02-10",
              "publisher": "Insee et DGAFP"
            },
            "chart": {
              "kind": "compare",
              "unit": "agents",
              "items": [
                {
                  "label": "Fonction publique de l’État",
                  "value": 2587400
                },
                {
                  "label": "Fonction publique territoriale",
                  "value": 2039400
                },
                {
                  "label": "Fonction publique hospitalière",
                  "value": 1249900
                }
              ]
            }
          },
          {
            "value": "24,0 %",
            "label": "Part des contractuels parmi les agents publics fin 2024, en hausse de 0,7 point sur un an et de 7,6 points en dix ans. Les contractuels représentent 74 % des entrées dans la fonction publique en 2024.",
            "date": "2024",
            "source": {
              "title": "L’emploi dans la fonction publique en 2024 (Insee Première n° 2094)",
              "url": "https://www.insee.fr/fr/statistiques/8732435",
              "date": "2026-02-10",
              "publisher": "Insee et DGAFP"
            },
            "chart": {
              "kind": "part",
              "value": 24,
              "total": 100,
              "unit": "%",
              "whole": "des agents publics"
            }
          },
          {
            "value": "499 400",
            "label": "Agents civils sortis de la fonction publique en 2024 (départs à la retraite, fins de contrat, démissions…), soit 9,0 % des agents, pour 528 800 entrées (9,5 %)",
            "date": "2024",
            "source": {
              "title": "L’emploi dans la fonction publique en 2024 (Insee Première n° 2094)",
              "url": "https://www.insee.fr/fr/statistiques/8732435",
              "date": "2026-02-10",
              "publisher": "Insee et DGAFP"
            },
            "chart": {
              "kind": "compare",
              "unit": "agents civils",
              "items": [
                {
                  "label": "Sorties en 2024",
                  "value": 499400
                },
                {
                  "label": "Entrées en 2024",
                  "value": 528800
                }
              ]
            }
          },
          {
            "value": "370,0 Md€",
            "label": "Rémunérations versées par l’ensemble des administrations publiques en 2025, cotisations sociales comprises, sur 1 714,2 Md€ de dépenses publiques totales. Elles progressent de 1,9 % sur un an, après +4,8 % en 2024, année marquée par 5 points d’indice supplémentaires accordés en janvier et des mesures catégorielles.",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106)",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "part",
              "value": 370,
              "total": 1714.2,
              "unit": "Md€",
              "whole": "de dépenses publiques totales"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "finances_publiques-3-a",
          "text": "Réduire fortement les effectifs en ne remplaçant pas une grande partie des départs, sauf sur le terrain"
        },
        {
          "id": "finances_publiques-3-b",
          "text": "Réduire un peu les effectifs administratifs et redéployer des postes vers les services en tension"
        },
        {
          "id": "finances_publiques-3-c",
          "text": "Stabiliser le nombre d’agents publics et recruter en priorité là où les besoins sont les plus forts"
        },
        {
          "id": "finances_publiques-3-d",
          "text": "Recruter massivement, titulariser les agents contractuels et augmenter fortement les salaires publics"
        },
        {
          "id": "finances_publiques-3-e",
          "text": "Recruter les nouveaux agents sous contrat, en réservant le statut de fonctionnaire à certaines fonctions"
        },
        {
          "id": "finances_publiques-3-f",
          "text": "Augmenter les effectifs dans les services en tension (soins, école, justice) et revaloriser les salaires publics"
        }
      ]
    },
    {
      "id": "travail_salaires-2",
      "topicId": "travail_salaires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle évolution pour la durée et l’organisation du temps de travail ?",
      "context": "Aujourd’hui : la durée légale du travail est de 35 heures par semaine ; au-delà, les heures supplémentaires sont majorées et, dans une certaine limite, exonérées d’impôt sur le revenu.",
      "explainer": {
        "summary": "Les 35 heures fixent le seuil à partir duquel on compte des heures supplémentaires, pas un plafond : la durée réellement travaillée varie beaucoup d’un salarié à l’autre. Les approches divergent : réduire la durée du travail, fortement ou peu à peu, ou mieux faire respecter les 35 heures ; permettre de travailler davantage, par des heures supplémentaires exonérées ou par accord d’entreprise ; ou réorganiser la semaine, sur quatre jours par exemple, avec en jeu l’emploi, les revenus, la santé et la compétitivité.",
        "points": [
          {
            "text": "Sans accord collectif, les heures au-delà de 35 heures sont majorées de 25 % de la 36e à la 43e heure, puis de 50 % ; au-delà de 220 heures par salarié et par an (le contingent), elles ouvrent aussi droit à un repos obligatoire. Un accord d’entreprise ou de branche peut fixer d’autres taux, d’au moins 10 %, et un autre contingent. Ces heures sont exonérées d’impôt sur le revenu dans la limite de 7 500 € par an et de cotisations salariales de retraite dans la limite de 11,31 % du salaire.",
            "source": {
              "title": "Heures supplémentaires d’un salarié du secteur privé",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2391",
              "date": "2026-06-08",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "Heures supplémentaires comprises, la durée du travail effectif ne peut dépasser 10 heures par jour, 48 heures sur une même semaine et 44 heures en moyenne sur 12 semaines consécutives, sauf dérogations prévues par la loi (code du travail, art. L3121-18, L3121-20 et L3121-22). Une semaine de 35 heures peut donc tenir en quatre jours sans dérogation.",
            "source": {
              "title": "Code du travail, articles L3121-16 à L3121-26 (durées maximales de travail, dont L3121-18, L3121-20 et L3121-22)",
              "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006189630/",
              "date": "2016-08-10",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Selon Eurostat, en 2025, les salariés à temps plein ont travaillé en moyenne 37,0 heures par semaine en France, contre 37,9 heures dans l’Union européenne. Tous salariés confondus, temps partiel compris, c’est 34,7 heures contre 35,0 (heures effectivement travaillées dans l’emploi principal, salariés de 15 à 64 ans).",
            "source": {
              "title": "Nombre moyen d’heures effectivement travaillées par semaine dans l’activité principale, par statut professionnel et temps plein ou partiel (lfsa_ewhan2)",
              "url": "https://ec.europa.eu/eurostat/databrowser/view/lfsa_ewhan2/default/table?lang=fr",
              "date": "2026-09-10",
              "publisher": "Eurostat"
            }
          }
        ],
        "figures": [
          {
            "value": "1 613 heures",
            "label": "Durée annuelle moyenne travaillée en 2024 par les salariés du privé à temps complet dont le temps est compté en heures, contre 1 821 heures pour ceux au forfait en jours",
            "date": "2024",
            "source": {
              "title": "Qui sont les salariés au forfait en jours et comment leur travail s’organise-t-il ? (Dares Analyses n° 20)",
              "url": "https://dares.travail-emploi.gouv.fr/publication/qui-sont-les-salaries-au-forfait-en-jours-et-comment-leur-travail-sorganise-t-il",
              "date": "2026-05-12",
              "publisher": "Dares (ministère du Travail)"
            },
            "chart": {
              "kind": "compare",
              "unit": "heures",
              "items": [
                {
                  "label": "Temps compté en heures",
                  "value": 1613
                },
                {
                  "label": "Forfait en jours",
                  "value": 1821
                }
              ]
            }
          },
          {
            "value": "16,0 %",
            "label": "Part des salariés du privé à temps complet au forfait annuel en jours en 2025 (2,5 millions de personnes). Leur temps de travail se compte en jours (218 au maximum par an), et non en heures : les 35 heures ne s’appliquent pas à eux.",
            "date": "2025",
            "source": {
              "title": "Les salariés au forfait en jours (séries longues)",
              "url": "https://dares.travail-emploi.gouv.fr/donnees/les-salaries-au-forfait-en-jours",
              "date": "2026-07-16",
              "publisher": "Dares (ministère du Travail)"
            },
            "chart": {
              "kind": "part",
              "value": 16,
              "total": 100,
              "unit": "%",
              "whole": "des salariés du privé à temps complet"
            }
          },
          {
            "value": "54 %",
            "label": "Part des salariés du privé à temps complet, dont le temps est compté en heures, qui ont fait au moins une heure supplémentaire rémunérée en 2025. Ceux qui en ont fait en ont effectué 103 en moyenne (France hors Mayotte, hors intérim).",
            "date": "2025",
            "source": {
              "title": "Les heures supplémentaires (données)",
              "url": "https://dares.travail-emploi.gouv.fr/donnees/les-heures-supplementaires",
              "date": "2026-07-10",
              "publisher": "Dares (ministère du Travail)"
            },
            "chart": {
              "kind": "part",
              "value": 54,
              "total": 100,
              "unit": "%",
              "whole": "des salariés à temps complet comptés en heures"
            }
          },
          {
            "value": "1,50 €",
            "label": "Somme que l’employeur déduit de ses cotisations patronales pour chaque heure supplémentaire dans une entreprise de moins de 20 salariés (0,50 € à partir de 20 salariés)",
            "date": "2026",
            "source": {
              "title": "Déduction forfaitaire patronale",
              "url": "https://www.urssaf.fr/accueil/employeur/beneficier-exonerations/exonerations-heures/deduction-forfaitaire-patronale.html",
              "date": "2026-01-09",
              "publisher": "Urssaf"
            },
            "chart": {
              "kind": "compare",
              "unit": "€ par heure supplémentaire",
              "items": [
                {
                  "label": "Moins de 20 salariés",
                  "value": 1.5
                },
                {
                  "label": "À partir de 20 salariés",
                  "value": 0.5
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "travail_salaires-2-a",
          "text": "Réduire fortement la durée du travail pour tous, sans perte de salaire, afin de partager l’emploi"
        },
        {
          "id": "travail_salaires-2-b",
          "text": "Faire respecter réellement les 35 heures, mieux payer les heures supplémentaires et ajouter des congés"
        },
        {
          "id": "travail_salaires-2-c",
          "text": "Expérimenter la semaine de quatre jours en gardant le même nombre d’heures de travail"
        },
        {
          "id": "travail_salaires-2-d",
          "text": "Inciter à travailler davantage : heures supplémentaires sans plafond et exonérées de prélèvements"
        },
        {
          "id": "travail_salaires-2-e",
          "text": "Laisser chaque entreprise fixer sa durée du travail par accord, au-delà des 35 heures si besoin"
        },
        {
          "id": "travail_salaires-2-f",
          "text": "Aller progressivement vers les 32 heures par la négociation, avec des aides aux entreprises qui embauchent"
        }
      ]
    },
    {
      "id": "travail_salaires-3",
      "topicId": "travail_salaires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle orientation pour le droit du travail ?",
      "context": "Aujourd’hui : depuis les ordonnances de 2017, les indemnités pour licenciement injustifié sont plafonnées et les comités d’hygiène, de sécurité et des conditions de travail (CHSCT) ont été fusionnés dans le comité social et économique (CSE).",
      "explainer": {
        "summary": "Les approches ne visent pas le même levier : les règles de licenciement et les instances du personnel, la place de la loi face aux accords d’entreprise, la forme des contrats (contrats courts, stages, contrat unique) ou la santé au travail. Toutes touchent à l’équilibre entre la protection des salariés et la souplesse laissée aux employeurs pour embaucher et s’adapter.",
        "points": [
          {
            "text": "Si un licenciement est jugé sans cause réelle et sérieuse (injustifié), le juge fixe l’indemnité dans un barème : de 1 à 2 mois de salaire brut pour un an d’ancienneté, de 3 à 20 mois à partir de 29 ans d’ancienneté. Les minimums sont plus bas dans les entreprises de moins de 11 salariés. Le barème ne s’applique pas aux licenciements nuls (harcèlement, discrimination, atteinte à une liberté fondamentale…) : l’indemnité est alors d’au moins 6 mois de salaire (art. L1235-3 et L1235-3-1).",
            "source": {
              "title": "Code du travail, articles L1235-1 à L1235-6 (dont L1235-3, barème, et L1235-3-1, licenciements nuls)",
              "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006189445",
              "date": "2018-04-01",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Depuis les ordonnances de 2017, l’accord d’entreprise prévaut dans la plupart des domaines sur l’accord de branche (négocié pour tout un secteur d’activité), sans condition d’être plus favorable aux salariés. La branche prévaut dans 13 domaines, dont les salaires minimums et les grilles de classification des emplois, sauf si l’accord d’entreprise offre des garanties au moins équivalentes. Elle peut aussi se réserver 4 autres domaines, dont la prévention des risques professionnels (code du travail, art. L2253-1 à L2253-3).",
            "source": {
              "title": "Code du travail, articles L2253-1 à L2253-4 (rapports entre accords d’entreprise et accords de branche)",
              "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006177936",
              "date": "2018-04-01",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Un « bonus-malus » fait varier la contribution d’assurance chômage des employeurs (4 % depuis le 1er mai 2025) entre 2,95 % et 5 %, selon leur taux de séparation (fins de contrats rapportées à l’effectif) comparé à celui de leur secteur. Depuis le 1er mars 2026, seules les fins de contrats de moins de 3 mois sont comptées. Il concerne les entreprises d’au moins 11 salariés de six secteurs, dont l’hébergement-restauration et les transports.",
            "source": {
              "title": "Bonus-malus d’assurance chômage : nouveaux taux de séparation médians et évolution du dispositif",
              "url": "https://entreprendre.service-public.gouv.fr/actualites/A15776",
              "date": "2026-03-02",
              "publisher": "Service-public.gouv.fr Entreprendre (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "764",
            "label": "Décès consécutifs à un accident du travail en 2024 (régime général), 5 de plus qu’en 2023. Plus de la moitié font suite à un malaise ; 185 ont une origine professionnelle identifiée.",
            "date": "2024",
            "source": {
              "title": "Rapport annuel 2024 de l’Assurance Maladie – Risques professionnels (p. 2)",
              "url": "https://www.assurance-maladie.ameli.fr/sites/default/files/rapport_annuel_2024_de_lassurance_maladie_-_risques_professionnels_novembre_2025.pdf",
              "date": "2025-11",
              "publisher": "Assurance Maladie – Risques professionnels"
            }
          },
          {
            "value": "1 805",
            "label": "Affections psychiques liées au travail prises en charge comme maladies professionnelles en 2024 (régime général), contre 840 en 2020 ; 73 % sont des dépressions. Absentes de la liste officielle des maladies professionnelles (les « tableaux »), elles sont examinées au cas par cas par un comité régional : il exige une incapacité permanente d’au moins 25 % (ou un décès) et un lien « direct et essentiel » avec le travail. Selon l’Assurance maladie, l’épuisement professionnel se manifeste surtout par des dépressions graves ou des syndromes anxieux.",
            "date": "2024",
            "source": {
              "title": "Rapport annuel 2024 de l’Assurance Maladie – Risques professionnels (p. 2, 47, 52 et 152)",
              "url": "https://www.assurance-maladie.ameli.fr/sites/default/files/rapport_annuel_2024_de_lassurance_maladie_-_risques_professionnels_novembre_2025.pdf",
              "date": "2025-11",
              "publisher": "Assurance Maladie – Risques professionnels"
            },
            "chart": {
              "kind": "series",
              "items": [
                {
                  "label": "2020",
                  "value": 840
                },
                {
                  "label": "2024",
                  "value": 1805
                }
              ]
            }
          },
          {
            "value": "10,3 %",
            "label": "Part des salariés adhérant à un syndicat en 2019 : 7,8 % dans le privé, 18,4 % dans la fonction publique (France hors Mayotte).",
            "date": "2019",
            "source": {
              "title": "Léger repli de la syndicalisation en France entre 2013 et 2019 (Dares Analyses n° 6)",
              "url": "https://dares.travail-emploi.gouv.fr/publication/leger-repli-de-la-syndicalisation-en-france-entre-2013-et-2019",
              "date": "2023-02-01",
              "publisher": "Dares (ministère du Travail)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Ensemble des salariés",
                  "value": 10.3
                },
                {
                  "label": "Secteur privé",
                  "value": 7.8
                },
                {
                  "label": "Fonction publique",
                  "value": 18.4
                }
              ]
            }
          },
          {
            "value": "9,4 %",
            "label": "Part des CDD et de l’intérim dans l’emploi total en 2025. Elle baisse depuis 2023 et se situe 0,9 point sous son niveau d’avant la crise sanitaire. Chez les 15-24 ans en emploi, 39,8 % ont un emploi à durée indéterminée (76,2 % chez les 25 ans ou plus) et 30,5 % sont en alternance ou en stage (France, personnes vivant en logement ordinaire).",
            "date": "2025",
            "source": {
              "title": "Une photographie du marché du travail en 2025 (Insee Première n° 2096)",
              "url": "https://www.insee.fr/fr/statistiques/8901327",
              "date": "2026-03-25",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "part",
              "value": 9.4,
              "total": 100,
              "unit": "%",
              "whole": "de l’emploi total"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "travail_salaires-3-a",
          "text": "Revenir sur les ordonnances de 2017 : recréer les CHSCT, déplafonner les indemnités pour licenciement injustifié"
        },
        {
          "id": "travail_salaires-3-b",
          "text": "Réécrire le Code du travail autour de quelques grands principes et laisser le reste aux accords d’entreprise"
        },
        {
          "id": "travail_salaires-3-c",
          "text": "Remplacer les contrats à durée déterminée et indéterminée par un contrat unique, aux droits croissant avec l’ancienneté"
        },
        {
          "id": "travail_salaires-3-d",
          "text": "Interdire les licenciements et les suppressions de postes, sous peine de réquisition de l’entreprise"
        },
        {
          "id": "travail_salaires-3-e",
          "text": "Limiter les contrats courts et encadrer les stages pour refaire du contrat à durée indéterminée la norme"
        },
        {
          "id": "travail_salaires-3-f",
          "text": "Faire de la santé au travail la priorité : reconnaître l’épuisement professionnel, viser la fin des accidents mortels au travail"
        }
      ]
    },
    {
      "id": "travail_salaires-4",
      "topicId": "travail_salaires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment associer les salariés aux bénéfices et aux décisions des entreprises ?",
      "context": "Aujourd’hui : la participation aux bénéfices est obligatoire à partir de 50 salariés ; les grands groupes comptent un ou deux représentants des salariés dans leur conseil d’administration.",
      "explainer": {
        "summary": "Faut-il imposer ou encourager le partage des bénéfices, et donner aux salariés plus de poids dans les décisions de l’entreprise ? Les approches divergent : partage obligatoire ou encouragé par des avantages fiscaux, actionnariat salarié compris, représentants des salariés dans les conseils d’administration dès 50 à 100 salariés, contrôle de la production par les salariés ou plafonnement des écarts de rémunération, avec en jeu la part de la valeur qui revient aux salariés et la liberté de gestion des entreprises.",
        "points": [
          {
            "text": "La participation est obligatoire dans les entreprises d’au moins 50 salariés. Pour les exercices comptables ouverts depuis le 1er janvier 2025, celles de 11 à 49 salariés dont le bénéfice net fiscal atteint au moins 1 % du chiffre d’affaires 3 années de suite doivent aussi choisir un dispositif : participation, intéressement, versement sur un plan d’épargne salariale ou prime de partage de la valeur. Les sommes de participation sont exonérées de cotisations salariales, sauf CSG et CRDS, et d’impôt sur le revenu, dans une certaine limite, si elles sont placées sur un plan d’épargne salariale. L’entreprise les déduit de son bénéfice imposable ; à partir de 50 salariés, elle paie dessus une contribution, le forfait social, de 20 % en principe.",
            "source": {
              "title": "Participation",
              "url": "https://entreprendre.service-public.gouv.fr/vosdroits/F2141",
              "date": "2026-07-21",
              "publisher": "Service-public.gouv.fr Entreprendre (DILA)"
            }
          },
          {
            "text": "Les sociétés qui emploient, deux exercices de suite, au moins 1 000 salariés en France (filiales comprises) ou 5 000 en France et à l’étranger doivent compter des représentants des salariés dans leur conseil d’administration : au moins un, et au moins deux si le conseil compte plus de huit autres administrateurs (code de commerce, art. L225-27-1).",
            "source": {
              "title": "Article L225-27-1 du code de commerce",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042339592",
              "date": "2021-01-01",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "La loi ne plafonne pas les écarts de rémunération dans le privé. Les sociétés cotées doivent en revanche publier chaque année le rapport entre la rémunération de leurs dirigeants et les rémunérations moyenne et médiane de leurs salariés (code de commerce, art. L22-10-9). Dans les entreprises publiques contrôlées par l’État, la rémunération des dirigeants est plafonnée depuis 2012 à 450 000 € brut.",
            "source": {
              "title": "Décret n° 53-707 du 9 août 1953, article 3 (modifié par le décret n° 2012-915 du 26 juillet 2012)",
              "url": "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000026228693",
              "date": "2012-07-28",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "54,0 %",
            "label": "Part des salariés du privé non agricole couverts en 2024 par au moins un dispositif (participation, intéressement ou plan d’épargne salariale). 46,0 % ont effectivement reçu une prime (France hors Mayotte).",
            "date": "2024",
            "source": {
              "title": "L’épargne salariale en 2024 (Dares Résultats n° 23)",
              "url": "https://dares.travail-emploi.gouv.fr/publication/lepargne-salariale-en-2024",
              "date": "2026-06-10",
              "publisher": "Dares (ministère du Travail)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Couverts par un dispositif",
                  "value": 54
                },
                {
                  "label": "Ont reçu une prime",
                  "value": 46
                }
              ]
            }
          },
          {
            "value": "27,2 Md€",
            "label": "Montant brut des primes de participation et d’intéressement et des abondements aux plans d’épargne salariale versés en 2024 dans le privé non agricole (France hors Mayotte)",
            "date": "2024",
            "source": {
              "title": "L’épargne salariale en 2024 (Dares Résultats n° 23)",
              "url": "https://dares.travail-emploi.gouv.fr/publication/lepargne-salariale-en-2024",
              "date": "2026-06-10",
              "publisher": "Dares (ministère du Travail)"
            }
          },
          {
            "value": "32,2 %",
            "label": "Taux de marge des sociétés non financières en 2025, contre 32,7 % en 2024 : la part de leur valeur ajoutée qui leur reste une fois payés les salariés et les impôts sur la production, subventions d’exploitation comprises. Elles en paient ensuite intérêts, impôt sur les bénéfices et dividendes, et en financent leurs investissements : en 2025, leur épargne en couvre 88,8 % (taux d’autofinancement, contre 90,8 % en 2024).",
            "date": "2025",
            "source": {
              "title": "Les comptes de la Nation en 2025 (Insee Première n° 2105)",
              "url": "https://www.insee.fr/fr/statistiques/8996855?sommaire=8071406",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2024",
                  "value": 32.7
                },
                {
                  "label": "2025",
                  "value": 32.2
                }
              ]
            }
          },
          {
            "value": "10 261 €",
            "label": "Salaire net mensuel (en équivalent temps plein) au-dessus duquel se situent les 1 % de salariés du privé les mieux payés en 2024, soit 7,3 fois le SMIC. La moitié des salariés gagne moins de 2 190 €. Un sur dix gagne moins de 1 492 €, un sur dix plus de 4 334 € : ce rapport de 2,91 est stable en 2024, à son plus bas niveau depuis dix ans (France y compris Mayotte, apprentis et stagiaires compris, hors agriculture et particuliers employeurs).",
            "date": "2024",
            "source": {
              "title": "Insee Première n° 2079 – Salaires dans le secteur privé en 2024 (23 octobre 2025)",
              "url": "https://www.insee.fr/fr/statistiques/8657156",
              "date": "2025-10-23",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Seuil des 10 % les moins payés",
                  "value": 1492
                },
                {
                  "label": "Salaire médian",
                  "value": 2190
                },
                {
                  "label": "Seuil des 10 % les mieux payés",
                  "value": 4334
                },
                {
                  "label": "Seuil des 1 % les mieux payés",
                  "value": 10261
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "travail_salaires-4-a",
          "text": "Obliger les entreprises qui versent des dividendes à reverser aussi une part des profits aux salariés"
        },
        {
          "id": "travail_salaires-4-b",
          "text": "Faire siéger des représentants des salariés dans les conseils d’administration dès 50 à 100 salariés"
        },
        {
          "id": "travail_salaires-4-c",
          "text": "Plafonner l’écart entre la plus haute et la plus basse rémunération dans chaque entreprise"
        },
        {
          "id": "travail_salaires-4-d",
          "text": "Encourager l’intéressement, la participation et l’actionnariat salarié par des avantages fiscaux"
        },
        {
          "id": "travail_salaires-4-e",
          "text": "Lever le secret des comptes des entreprises et placer la production sous le contrôle des salariés"
        }
      ]
    },
    {
      "id": "industrie_economie-2",
      "topicId": "industrie_economie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle politique commerciale face à la concurrence internationale ?",
      "context": "Aujourd’hui : les droits de douane relèvent de l’Union européenne, qui applique depuis 2026 un prix du carbone à quelques importations (acier, ciment, engrais…).",
      "explainer": {
        "summary": "La France importe plus de biens qu’elle n’en exporte, et une partie de ses emplois dépend des exportations. Sa politique commerciale relève aujourd’hui de l’UE ; les approches divergent entre se protéger davantage, à l’échelle de l’UE ou de la France (droits de douane, normes sociales et environnementales imposées aux importations, achats publics), et refuser le protectionnisme, soit pour poursuivre l’ouverture par des accords de libre-échange, soit en imposant plutôt le maintien des emplois existants.",
        "points": [
          {
            "text": "Au nom des principes d’égalité d’accès et de non-discrimination, les clauses de préférence locale sont interdites dans les marchés publics. Les acheteurs publics peuvent en revanche écarter les entreprises de pays qui n’ont pas d’accord avec l’UE sur les marchés publics, comme la Chine et l’Inde, et fixer des exigences environnementales et sociales.",
            "source": {
              "title": "Rapport n° 830 (2024-2025) de la commission d’enquête sur la commande publique : « L’urgence d’agir pour éviter la sortie de route : piloter la commande publique au service de la souveraineté économique »",
              "url": "https://www.senat.fr/rap/r24-830-1/r24-830-1_mono.html",
              "date": "2025-07-08",
              "publisher": "Sénat"
            }
          },
          {
            "text": "En mars 2026, la Commission européenne a proposé d’exiger des produits « fabriqués dans l’UE » ou bas carbone dans certains achats et aides publics : acier, ciment, aluminium, voitures, technologies propres dites « zéro émission nette ». Ce projet de règlement doit être négocié par le Parlement européen et le Conseil de l’UE avant d’entrer en vigueur.",
            "source": {
              "title": "Commission proposes Industrial Accelerator Act to strengthen industry and create jobs in Europe",
              "url": "https://employment-social-affairs.ec.europa.eu/news/commission-proposes-industrial-accelerator-act-strengthen-industry-and-create-jobs-europe-2026-03-04_en",
              "date": "2026-03-04",
              "publisher": "Commission européenne"
            }
          },
          {
            "text": "L’accord intérimaire de commerce entre l’UE et le Mercosur (Argentine, Brésil, Paraguay, Uruguay) s’applique à titre provisoire depuis le 1er mai 2026. La Pologne conteste devant la Cour de justice de l’UE la décision du Conseil qui l’autorise, et le Parlement européen a demandé à la Cour un avis sur sa compatibilité avec les traités. Le 29 septembre 2026, le vice-président de la Cour a refusé de suspendre cette application en attendant le jugement du recours polonais. L’accord ne contient pas de clauses dites « miroirs », qui imposeraient des normes de production équivalentes ; selon le vice-président, les produits importés restent soumis aux règles de l’UE en matière de sécurité alimentaire, de santé, de protection des plantes et d’environnement.",
            "source": {
              "title": "Le vice-président de la Cour de justice rejette la demande de la Pologne visant à suspendre l’exécution de la décision du Conseil autorisant l’application provisoire de l’accord intérimaire UE – Mercosur sur le commerce (communiqué de presse n° 135/26, affaire C-460/26 R)",
              "url": "https://curia.europa.eu/site/upload/docs/application/pdf/2026-09/cp260135fr.pdf",
              "date": "2026-09-29",
              "publisher": "Cour de justice de l’Union européenne"
            }
          }
        ],
        "figures": [
          {
            "value": "−69,2 Md€",
            "label": "Solde commercial des biens de la France en 2025 (exportations : 614,7 Md€ ; importations : 683,9 Md€), en amélioration de 10,0 Md€ sur un an ; son point le plus bas était de −161,7 Md€ en 2022",
            "date": "2025",
            "source": {
              "title": "Le chiffre du commerce extérieur – Analyse annuelle 2025",
              "url": "https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf",
              "date": "2026-02-06",
              "publisher": "Direction générale des douanes et droits indirects"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Exportations de biens",
                  "value": 614.7
                },
                {
                  "label": "Importations de biens",
                  "value": 683.9
                }
              ]
            }
          },
          {
            "value": "13,5 %",
            "label": "Part des emplois en France qui dépendent des exportations hors UE, selon la Commission européenne : 3,46 millions d’emplois liés aux exportations françaises hors UE (489,4 Md€ en 2024) et 671 000 aux exportations hors UE des autres pays de l’UE",
            "date": "2024",
            "source": {
              "title": "Trade and Jobs: France",
              "url": "https://policy.trade.ec.europa.eu/analysis-and-assessment/statistics/trade-and-jobs/france_en",
              "publisher": "Commission européenne (DG Commerce et sécurité économique)"
            },
            "chart": {
              "kind": "part",
              "value": 13.5,
              "total": 100,
              "unit": "%",
              "whole": "des emplois en France"
            }
          },
          {
            "value": "de 7,8 % à 35,3 %",
            "label": "Droits compensateurs (anti-subventions) imposés par l’UE pour cinq ans, applicables depuis le 30 octobre 2024, sur les voitures électriques neuves importées de Chine ; le taux dépend du constructeur",
            "date": "depuis le 30 octobre 2024",
            "source": {
              "title": "EU Commission imposes countervailing duties on imports of battery electric vehicles (BEVs) from China",
              "url": "https://trade.ec.europa.eu/access-to-markets/en/news/eu-commission-imposes-countervailing-duties-imports-battery-electric-vehicles-bevs-china",
              "date": "2024-12-12",
              "publisher": "Commission européenne (Access2Markets)"
            }
          },
          {
            "value": "170,7 Md€",
            "label": "Montant des marchés publics recensés en France en 2023 (contrats d’au moins 90 000 € HT seulement), soit 6 % du PIB. Tous contrats confondus, la Cour des comptes européenne estime le poids de la commande publique à 14 % du PIB : près de 2 400 Md€ pour l’UE et près de 400 Md€ pour la France",
            "date": "2023",
            "source": {
              "title": "Rapport n° 830 (2024-2025) de la commission d’enquête sur la commande publique : « L’urgence d’agir pour éviter la sortie de route : piloter la commande publique au service de la souveraineté économique »",
              "url": "https://www.senat.fr/rap/r24-830-1/r24-830-1_mono.html",
              "date": "2025-07-08",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Marchés recensés en 2023",
                  "value": 170.7
                },
                {
                  "label": "Commande publique totale (est.)",
                  "value": 400
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "industrie_economie-2-a",
          "text": "Bâtir une préférence européenne : achats publics européens, réciprocité, barrières ciblées face à la Chine"
        },
        {
          "id": "industrie_economie-2-b",
          "text": "Relever fortement les droits de douane à l’entrée de l’Union européenne, sur une large gamme de produits"
        },
        {
          "id": "industrie_economie-2-c",
          "text": "Rétablir des droits de douane nationaux et sortir des accords de libre-échange signés par l’Union européenne"
        },
        {
          "id": "industrie_economie-2-d",
          "text": "Protéger selon des critères écologiques et sociaux : interdire d’importer ce qu’il est interdit de produire ici"
        },
        {
          "id": "industrie_economie-2-e",
          "text": "Refuser tout protectionnisme, national comme européen, et imposer le maintien des emplois existants"
        },
        {
          "id": "industrie_economie-2-f",
          "text": "Poursuivre l’ouverture commerciale par des accords de libre-échange négociés par l’Union européenne"
        }
      ]
    },
    {
      "id": "industrie_economie-3",
      "topicId": "industrie_economie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel rôle pour l’État dans le capital des entreprises stratégiques ?",
      "context": "Aujourd’hui : l’État détient tout le capital d’EDF et des participations dans de nombreuses grandes entreprises ; les autoroutes sont gérées par des sociétés privées sous concession.",
      "explainer": {
        "summary": "L’État est actionnaire de nombreuses entreprises jugées stratégiques et peut soumettre à autorisation le rachat d’entreprises de secteurs sensibles par des investisseurs étrangers. Le débat porte sur l’ampleur de ce rôle : nationaliser des secteurs entiers, exproprier sans indemnité de grands groupes, intervenir au cas par cas pour protéger des entreprises sensibles, ou s’en tenir à un rôle de client et de régulateur, quitte à privatiser.",
        "points": [
          {
            "text": "La Constitution permet de nationaliser des entreprises par la loi. Le Préambule de 1946 prévoit que toute entreprise ayant les caractères d’un service public national ou d’un monopole de fait « doit devenir la propriété de la collectivité ». Le Conseil constitutionnel a jugé le 16 janvier 1982 qu’une nationalisation doit respecter la Déclaration de 1789, qui exige une « juste et préalable indemnité ».",
            "source": {
              "title": "Décision n° 81-132 DC du 16 janvier 1982 – Loi de nationalisation",
              "url": "https://www.conseil-constitutionnel.fr/decision/1982/81132DC.htm",
              "date": "1982-01-16",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Les relations financières entre la France et l’étranger sont libres. Par exception, dans des secteurs précisément listés (défense nationale, ordre public, activités essentielles aux intérêts du pays), un investissement étranger doit recevoir une autorisation préalable de l’État (article L. 151-3 du code monétaire et financier).",
            "source": {
              "title": "Contrôle des investissements étrangers en France",
              "url": "https://www.tresor.economie.gouv.fr/services-aux-entreprises/investissements-etrangers-en-france",
              "publisher": "Direction générale du Trésor"
            }
          },
          {
            "text": "En 2006, l’État a vendu ses participations majoritaires dans trois sociétés concessionnaires d’autoroutes « historiques ». Les concessions historiques, qui concentrent 97,2 % du trafic du réseau autoroutier concédé, arrivent à échéance entre 2031 et 2036.",
            "source": {
              "title": "Rapport n° 709 (2019-2020) de la commission d’enquête sur le contrôle, la régulation et l’évolution des concessions autoroutières",
              "url": "https://www.senat.fr/rap/r19-709-1/r19-709-1_mono.html",
              "date": "2020-09-16",
              "publisher": "Sénat"
            }
          }
        ],
        "figures": [
          {
            "value": "209,1 Md€",
            "label": "Valeur des participations de l’État suivies par l’Agence des participations de l’État au 30 juin 2025 (86 entreprises), contre 179,5 Md€ un an plus tôt. Dont 67,9 Md€ dans des sociétés cotées en Bourse, contre 50 Md€ en 2024.",
            "date": "30 juin 2025",
            "source": {
              "title": "Rapport relatif à l’État actionnaire (annexe au projet de loi de finances pour 2026)",
              "url": "https://www2.assemblee-nationale.fr/static/17/Annexes-DL/PLF-2026/10-Jaune2026_Etat_actionnaire.pdf",
              "date": "2025-10",
              "publisher": "Agence des participations de l’État (annexe budgétaire publiée par l’Assemblée nationale)"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "Juin 2024",
                  "value": 179.5
                },
                {
                  "label": "Juin 2025",
                  "value": 209.1
                }
              ]
            }
          },
          {
            "value": "2 469 M€",
            "label": "Dividendes reçus en argent par l’État actionnaire en 2024. Pour l’année 2025, les entreprises à participation publique avaient déjà versé plus de 4,3 Md€ à la date du rapport. Ces dividendes sont versés au budget général de l’État.",
            "date": "2024",
            "source": {
              "title": "Rapport relatif à l’État actionnaire (annexe au projet de loi de finances pour 2026)",
              "url": "https://www2.assemblee-nationale.fr/static/17/Annexes-DL/PLF-2026/10-Jaune2026_Etat_actionnaire.pdf",
              "date": "2025-10",
              "publisher": "Agence des participations de l’État (annexe budgétaire publiée par l’Assemblée nationale)"
            }
          },
          {
            "value": "418",
            "label": "Dossiers déposés en 2025 au titre du contrôle des investissements étrangers en France, contre 392 en 2024. 167 autorisations ont été délivrées, dont 49 % assorties de conditions, et sept opérations ont été formellement refusées en quatre ans.",
            "date": "2025",
            "source": {
              "title": "Publication du rapport annuel sur le contrôle IEF en 2025",
              "url": "https://www.tresor.economie.gouv.fr/Articles/2026/07/28/publication-du-rapport-annuel-sur-le-controle-ief-en-2025",
              "date": "2026-09-24",
              "publisher": "Direction générale du Trésor"
            },
            "chart": {
              "kind": "series",
              "unit": "dossiers",
              "items": [
                {
                  "label": "2024",
                  "value": 392
                },
                {
                  "label": "2025",
                  "value": 418
                }
              ]
            }
          },
          {
            "value": "14,8 Md€",
            "label": "Somme perçue par l’État en 2006 lors de la privatisation de sociétés concessionnaires d’autoroutes, qui l’a aussi déchargé de 16,8 Md€ de dette de ces sociétés. Selon l’Autorité de la concurrence (avis de 2014), les sociétés concessionnaires d’autoroutes ont ensuite versé 14,9 Md€ de dividendes entre 2006 et 2013.",
            "date": "2006",
            "source": {
              "title": "Rapport n° 709 (2019-2020) de la commission d’enquête sur le contrôle, la régulation et l’évolution des concessions autoroutières",
              "url": "https://www.senat.fr/rap/r19-709-1/r19-709-1_mono.html",
              "date": "2020-09-16",
              "publisher": "Sénat"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "industrie_economie-3-a",
          "text": "Nationaliser des entreprises et secteurs stratégiques : énergie, sidérurgie, banques, autoroutes"
        },
        {
          "id": "industrie_economie-3-b",
          "text": "Exproprier sans indemnité les grands groupes et les placer sous le contrôle de leurs salariés"
        },
        {
          "id": "industrie_economie-3-c",
          "text": "Bloquer les rachats étrangers d’entreprises sensibles et entrer au capital de sociétés clés si besoin"
        },
        {
          "id": "industrie_economie-3-d",
          "text": "Limiter le rôle de l’État à celui de client et de régulateur, voire privatiser certains opérateurs"
        }
      ]
    },
    {
      "id": "retraites-2",
      "topicId": "retraites",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle place pour la capitalisation dans les retraites ?",
      "context": "Aujourd’hui : les pensions de base et complémentaires sont financées par les cotisations des actifs (répartition) ; l’épargne retraite individuelle reste surtout facultative.",
      "explainer": {
        "summary": "Les retraites obligatoires reposent très majoritairement sur la répartition : les cotisations des actifs paient les pensions versées la même année, tandis que la capitalisation, où des cotisations sont placées pour financer plus tard la retraite de ceux qui les versent, reste un complément. Les approches divergent sur la place à lui donner : aucune, un étage obligatoire géré collectivement, un capital public placé dès la naissance, une épargne volontaire encouragée par des avantages fiscaux, ou à terme l’essentiel du système.",
        "points": [
          {
            "text": "Selon le Conseil d’orientation des retraites (COR), les fonds de pension privés, qui fonctionnent par capitalisation, occupent une place importante aux États-Unis, au Canada, aux Pays-Bas et au Royaume-Uni. En France, comme en Allemagne, en Belgique, en Espagne ou en Italie, les retraites reposent très majoritairement sur des régimes publics par répartition.",
            "source": {
              "title": "Rapport annuel du COR, juin 2026 : Évolutions et perspectives des retraites en France (partie 2, chapitre 2, p. 67)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            }
          },
          {
            "text": "L’épargne retraite volontaire bénéficie déjà d’un avantage fiscal. Pour un salarié, les versements sur un plan d’épargne retraite (PER) individuel sont déductibles du revenu imposable. Pour les versements de 2026, la limite est de 10 % des revenus d’activité de 2025 (nets de frais professionnels), avec un maximum de 37 680 € et un minimum de 4 710 €.",
            "source": {
              "title": "Épargne retraite : déduction des cotisations du revenu imposable",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F14709",
              "date": "2026-04-15",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "En capitalisation, les cotisations sont placées, par exemple en actions ou en obligations, et la pension dépend de l’épargne accumulée et de son rendement. Chaque mode a sa fragilité : la répartition dépend du nombre de cotisants par retraité, la capitalisation du rendement des placements. Passer de l’une à l’autre suppose, pendant la transition, de continuer à payer les pensions déjà promises tout en épargnant pour les futures."
          }
        ],
        "figures": [
          {
            "value": "422 Md€",
            "label": "Dépenses brutes du système de retraite en 2025, soit 14,1 % du PIB et 24,3 % de l’ensemble des dépenses publiques. Projection du COR (scénario de référence) : 14,1 % du PIB en 2030, 14,2 % en 2045 et 15,3 % en 2070",
            "date": "2025",
            "source": {
              "title": "Rapport annuel du COR, juin 2026 (synthèse, p. 9)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2025",
                  "value": 14.1
                },
                {
                  "label": "2030",
                  "value": 14.1
                },
                {
                  "label": "2045",
                  "value": 14.2
                },
                {
                  "label": "2070",
                  "value": 15.3
                }
              ]
            }
          },
          {
            "value": "1,8",
            "label": "Nombre de cotisants par retraité en 2025 (chiffre estimé par le COR), contre 2,1 en 2002. Projection du COR : 1,3 en 2070 dans le scénario de référence",
            "date": "2025",
            "source": {
              "title": "Rapport annuel du COR, juin 2026 (partie 2, chapitre 2, p. 72)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "cotisants par retraité",
              "items": [
                {
                  "label": "2002",
                  "value": 2.1
                },
                {
                  "label": "2025",
                  "value": 1.8
                },
                {
                  "label": "2070",
                  "value": 1.3
                }
              ]
            }
          },
          {
            "value": "21,4 Md€",
            "label": "Cotisations versées en 2024 sur des contrats de retraite supplémentaire (épargne retraite individuelle ou d’entreprise, en plus des régimes obligatoires), dont 77 % sur des PER, contre 69 % en 2022. Ces contrats ont versé 8,9 Md€ de prestations ; 2,7 millions de personnes en percevaient fin 2024",
            "date": "2024",
            "source": {
              "title": "Les Plans épargne retraite représentent 77 % des cotisations de retraite supplémentaire en 2024",
              "url": "https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/les-plans-epargne-retraite-cotisation",
              "date": "2026-02-03",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2022",
                  "value": 69
                },
                {
                  "label": "2024",
                  "value": 77
                }
              ]
            }
          },
          {
            "value": "53,6 Md€",
            "label": "Actif net au 31 décembre 2025 de la retraite additionnelle de la fonction publique (RAFP), régime obligatoire par points créé en 2005 pour les fonctionnaires et financé par capitalisation, de façon collective. 4,4 millions d’agents y ont cotisé ; en 2025, il a perçu 2,23 Md€ de cotisations et versé 509 M€ de prestations",
            "date": "2025-12-31",
            "source": {
              "title": "Retraite additionnelle de la fonction publique – Rapport annuel 2025 (chiffres clés, p. 5 ; partie 1)",
              "url": "https://media.rafp.fr/s3fs-public/2026-06/RAFP-RA2025-V6_0.pdf",
              "date": "2026-06",
              "publisher": "Établissement de retraite additionnelle de la fonction publique (ERAFP)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "retraites-2-a",
          "text": "Financer les retraites par les cotisations sociales et écarter toute part de retraite par capitalisation"
        },
        {
          "id": "retraites-2-b",
          "text": "Ajouter un étage obligatoire de retraite par capitalisation, géré collectivement, à côté de la répartition"
        },
        {
          "id": "retraites-2-c",
          "text": "Verser à chaque enfant, dès sa naissance, un capital public placé jusqu’à sa retraite"
        },
        {
          "id": "retraites-2-d",
          "text": "Remplacer progressivement la répartition par la capitalisation, sur plusieurs décennies"
        },
        {
          "id": "retraites-2-e",
          "text": "Encourager l’épargne retraite volontaire et d’entreprise par des avantages fiscaux, sans la rendre obligatoire",
          "external": true
        }
      ]
    },
    {
      "id": "retraites-3",
      "topicId": "retraites",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment faire évoluer le montant des pensions de retraite ?",
      "context": "Aujourd’hui : les pensions sont en principe revalorisées chaque année selon l’inflation ; les retraités bénéficient d’un abattement fiscal de 10 % et d’un taux de CSG inférieur à celui des salariés.",
      "explainer": {
        "summary": "Les pensions de base sont en principe revalorisées chaque année selon la hausse des prix. Les approches divergent : préserver le niveau de vie de tous les retraités (revalorisation selon les prix pour toutes les pensions, voire selon les salaires, avec un minimum garanti), mettre davantage à contribution les retraités aisés, ou freiner la dépense par un gel temporaire épargnant les petites pensions.",
        "points": [
          {
            "text": "Indexation : sous l’effet des réformes engagées depuis le début des années 1990, les pensions de base suivent les prix et non plus les salaires ; les retraites complémentaires (Agirc-Arrco) évoluent selon les accords des partenaires sociaux. Selon une étude de l’Insee citée par le COR, sans ce passage à l’indexation sur les prix, les dépenses de retraite auraient été plus élevées de 1,7 point de PIB en 2018. Pour une carrière complète à temps plein au Smic, la loi fixe un repère, suivi par le Comité de suivi des retraites : une pension totale d’au moins 85 % du Smic net.",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (partie 2, chapitre 2, p. 71 ; annexes, p. 235)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            }
          },
          {
            "text": "Les pensions de base sont revalorisées selon la hausse des prix mesurée par l’Insee (hors tabac). Elles ont augmenté de 0,9 % le 1er janvier 2026 : le projet de budget de la Sécurité sociale pour 2026 prévoyait un gel, que les députés ont supprimé, et la loi définitivement adoptée le 16 décembre 2025 ne le contient pas.",
            "source": {
              "title": "Pensions de retraite de base : quelle revalorisation au 1er janvier 2026 ?",
              "url": "https://www.service-public.gouv.fr/particuliers/actualites/A17919",
              "date": "2025-12-24",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "Pour 2027, le projet de budget de la Sécurité sociale, soumis au Haut Conseil des finances publiques le 18 septembre 2026, prévoit un gel des pensions de base, sauf les plus basses (3,0 Md€ d’économies attendues, selon l’avis du Haut Conseil du 25 septembre 2026). Il suppose aussi des retraites complémentaires revalorisées moins vite que les prix, ce qui dépend des négociations entre partenaires sociaux.",
            "source": {
              "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
              "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
              "date": "2026-09-25",
              "publisher": "Haut Conseil des finances publiques"
            }
          }
        ],
        "figures": [
          {
            "value": "14,1 % du PIB",
            "label": "Dépenses de retraite en 2025, tous régimes obligatoires : 422 Md€, soit 24,3 % de l’ensemble des dépenses publiques. Projection du COR : 14,2 % du PIB en 2045 et 15,3 % en 2070. Parmi les pays suivis par le COR, la France est la deuxième, après l’Italie, pour la part des dépenses de retraite dans le PIB, et la sixième, en 2021, pour la dépense de retraite par habitant",
            "date": "2025",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (synthèse, p. 7 et 9 ; partie 2, chapitre 2, p. 66 et 68)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2025",
                  "value": 14.1
                },
                {
                  "label": "2045",
                  "value": 14.2
                },
                {
                  "label": "2070",
                  "value": 15.3
                }
              ]
            }
          },
          {
            "value": "−5,1 Md€",
            "label": "Solde du système de retraite en 2025 (régimes de base et complémentaires), hors charges et produits financiers, soit −0,2 % du PIB. En les comptant, le déficit est de 1,3 Md€. Projection à règles inchangées : −2,4 % du PIB en 2070 dans le scénario de référence, entre −1,7 % et −3,1 % selon la croissance de la productivité",
            "date": "2025",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (synthèse, p. 7 et 23 ; partie 2, chapitre 3, p. 91)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2025",
                  "value": -0.2
                },
                {
                  "label": "2070",
                  "value": -2.4
                }
              ]
            }
          },
          {
            "value": "1,8",
            "label": "Nombre de cotisants par retraité en 2025 (estimation), contre 2,1 en 2002. Projection : 1,3 en 2070 dans le scénario de référence",
            "date": "2025",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (p. 72)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "cotisants par retraité",
              "items": [
                {
                  "label": "2002",
                  "value": 2.1
                },
                {
                  "label": "2025",
                  "value": 1.8
                },
                {
                  "label": "2070",
                  "value": 1.3
                }
              ]
            }
          },
          {
            "value": "100,2 %",
            "label": "Niveau de vie moyen des retraités rapporté à celui de l’ensemble de la population en 2023 (103,2 % estimés en 2025 et 2026). Projection du COR : 90,3 % en 2070. En 2023, 10,5 % des retraités vivent sous le seuil de pauvreté, le niveau le plus haut depuis 1996, contre 15,4 % de l’ensemble de la population",
            "date": "2023",
            "source": {
              "title": "Évolutions et perspectives des retraites en France – Rapport annuel du COR, juin 2026 (synthèse, p. 12 ; partie 3, chapitres 2 et 3, p. 153 et 170)",
              "url": "https://www.cor-retraites.fr/sites/default/files/2026-07/RA_2026_def.pdf",
              "date": "2026-06",
              "publisher": "Conseil d’orientation des retraites"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2023",
                  "value": 100.2
                },
                {
                  "label": "2025",
                  "value": 103.2
                },
                {
                  "label": "2070",
                  "value": 90.3
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "retraites-3-a",
          "text": "Revaloriser chaque année toutes les pensions au rythme de l’inflation, y compris les plus élevées"
        },
        {
          "id": "retraites-3-b",
          "text": "Demander plus aux retraités aisés : hausse de leur CSG et pensions revalorisées moins vite que l’inflation"
        },
        {
          "id": "retraites-3-c",
          "text": "Geler temporairement les pensions et les prestations sociales, en épargnant les plus petites retraites"
        },
        {
          "id": "retraites-3-d",
          "text": "Indexer les pensions sur les salaires et garantir au moins le SMIC à toute pension d’une carrière complète"
        }
      ]
    },
    {
      "id": "sante-1",
      "topicId": "sante",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour améliorer l’accès aux soins ?",
      "context": "Aujourd’hui : plusieurs millions de personnes n’ont pas de médecin traitant, et les médecins manquent dans de nombreux territoires.",
      "explainer": {
        "summary": "Trouver un médecin traitant reste difficile pour une partie de la population, et l’accès aux médecins varie fortement d’un territoire à l’autre. Les approches divergent sur le levier à privilégier : encadrer l’installation des médecins ou l’encourager par des aides, en former davantage et faire exercer les internes là où ils manquent, confier des soins courants à d’autres soignants, renforcer l’hôpital public et les centres de santé, supprimer les agences régionales de santé ou recourir à l’intelligence artificielle.",
        "points": [
          {
            "text": "Une proposition de loi adoptée par l’Assemblée nationale crée une autorisation d’installation des médecins, délivrée par l’agence régionale de santé (ARS). Elle serait accordée automatiquement dans les zones sous-dotées ; ailleurs, seulement si le médecin remplace un praticien de la même spécialité qui cesse son activité. En commission, les sénateurs l’ont remplacée par une condition : un généraliste qui s’installe en zone bien dotée s’engage à exercer aussi à temps partiel en zone sous-dotée. L’examen en séance au Sénat, commencé le 11 juin 2026, a été suspendu : le texte n’est pas définitivement adopté.",
            "source": {
              "title": "Proposition de loi visant à lutter contre les déserts médicaux, d’initiative transpartisane (la loi en clair)",
              "url": "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-visant-a-lutter-contre-les-deserts-medicaux-dinitiative-transpartisane.html",
              "date": "2026-06",
              "publisher": "Sénat"
            }
          },
          {
            "text": "En 2025, 2 810 médecins généralistes se sont installés pour la première fois en libéral, contre 2 130 en 2024. Dans les zones d’intervention prioritaire, où les médecins manquent le plus, ils sont 891, soit près de 45 % de plus qu’en 2024. Selon l’Assurance maladie, cette reprise s’explique notamment par la hausse des places ouvertes en faculté de médecine au cours de la décennie précédente, ainsi que par les revalorisations tarifaires et les assistants médicaux.",
            "source": {
              "title": "Observatoire de l’accès aux soins : les résultats 2025 témoignent d’une dynamique positive sur l’ensemble du territoire",
              "url": "https://www.assurance-maladie.ameli.fr/presse/2026-06-11-cp-observatoire-de-l-acces-aux-soins",
              "date": "2026-06-11",
              "publisher": "Assurance maladie"
            }
          },
          {
            "text": "Depuis la loi de financement de la Sécurité sociale pour 2023, la formation des futurs médecins généralistes compte une quatrième année. L’étudiant y exerce comme « docteur junior », supervisé par un maître de stage, en cabinet, en centre de santé ou en maison de santé pluriprofessionnelle. Ses consultations ne sont pas payées par l’Assurance maladie : il est rémunéré comme les autres internes, sur les crédits des établissements de santé, vers lesquels 225 M€ sont transférés pour 2027.",
            "source": {
              "title": "Les comptes de la Sécurité sociale – Résultats 2025, prévisions 2026 et 2027 (rapport à la Commission des comptes de la Sécurité sociale)",
              "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
              "date": "2026-10",
              "publisher": "Commission des comptes de la Sécurité sociale (Direction de la Sécurité sociale)"
            }
          }
        ],
        "figures": [
          {
            "value": "6,3 millions",
            "label": "d’assurés adultes sans médecin traitant en 2025 (88,5 % de la population adulte en avait déclaré un)",
            "date": "2025",
            "source": {
              "title": "Le dispositif du médecin traitant",
              "url": "https://www.ccomptes.fr/fr/publications/le-dispositif-du-medecin-traitant",
              "date": "2026-09-30",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "part",
              "value": 88.5,
              "total": 100,
              "unit": "%",
              "whole": "de la population adulte, avec médecin traitant"
            }
          },
          {
            "value": "4,3 fois",
            "label": "plus d’accès aux médecins généralistes pour les 10 % de la population les mieux pourvus que pour les 10 % les moins pourvus (France hors Mayotte, 2024) : 5,7 consultations par an et par habitant, contre 1,3. La moyenne nationale est de 3,3.",
            "date": "2024",
            "source": {
              "title": "Accessibilité aux soins de premier recours en 2024",
              "url": "https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/260722-accessibilite-aux-soins-de-premier-recours-en-2024",
              "date": "2026-07-22",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "consultations par an et par hab.",
              "items": [
                {
                  "label": "10 % les mieux pourvus",
                  "value": 5.7
                },
                {
                  "label": "Moyenne nationale",
                  "value": 3.3
                },
                {
                  "label": "10 % les moins pourvus",
                  "value": 1.3
                }
              ]
            }
          },
          {
            "value": "11 245 places",
            "label": "ouvertes en médecine par les universités en 2024-2025 (capacités d’accueil), contre 10 986 en 2023-2024, selon le ministère de l’Enseignement supérieur. Depuis la suppression du numerus clausus, ces places découlent d’objectifs nationaux fixés pour 2021-2025 ; une nouvelle concertation a été lancée pour 2026-2030.",
            "date": "2024-2025",
            "source": {
              "title": "Question écrite n° 9042 – Insuffisance de places disponibles pour les étudiants en médecine (réponse du ministère publiée au JO le 4 novembre 2025)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE9042",
              "date": "2025-11-04",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "series",
              "unit": "places",
              "items": [
                {
                  "label": "2023-2024",
                  "value": 10986
                },
                {
                  "label": "2024-2025",
                  "value": 11245
                }
              ]
            }
          },
          {
            "value": "environ 2,3 Md€",
            "label": "de déficit des hôpitaux publics en 2025 selon une première estimation, soit 2,1 % de leurs recettes, contre 2,9 Md€ (2,7 % des recettes) en 2024. Leurs dépenses sont de l’ordre de 113,2 Md€ en 2025, contre 110,0 Md€ en 2024 (France, hors Service de santé des armées).",
            "date": "2025",
            "source": {
              "title": "Le déficit des hôpitaux publics diminue en 2025 mais reste à un niveau élevé – Premiers résultats sur les établissements de santé en 2025 (Études et résultats n° 1380)",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-07/ER1380_%C3%89tablissements_sant%C3%A9_2025.pdf",
              "date": "2026-07-28",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2024",
                  "value": 2.9
                },
                {
                  "label": "2025 (estimation)",
                  "value": 2.3
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "sante-1-a",
          "text": "Encadrer l’installation des médecins pour les orienter vers les territoires qui en manquent"
        },
        {
          "id": "sante-1-b",
          "text": "Ouvrir partout des centres de santé publics et rouvrir des hôpitaux et maternités de proximité"
        },
        {
          "id": "sante-1-c",
          "text": "Augmenter chaque année le budget de l’hôpital public et recruter massivement des soignants"
        },
        {
          "id": "sante-1-d",
          "text": "Supprimer les agences régionales de santé et reporter leurs moyens vers les soins"
        },
        {
          "id": "sante-1-e",
          "text": "Permettre de consulter directement pharmaciens, infirmiers et kinésithérapeutes pour les soins courants"
        },
        {
          "id": "sante-1-f",
          "text": "Recourir à l’intelligence artificielle pour faciliter l’accès aux soins et libérer du temps médical"
        },
        {
          "id": "sante-1-g",
          "text": "Former beaucoup plus de médecins et de soignants en ouvrant fortement les places en études de santé"
        },
        {
          "id": "sante-1-h",
          "text": "Faire exercer les internes en fin de cursus dans les territoires qui manquent de médecins",
          "external": true
        },
        {
          "id": "sante-1-i",
          "text": "Inciter financièrement les médecins à s’installer dans les territoires qui en manquent, sans contraindre leur installation"
        }
      ]
    },
    {
      "id": "solidarites-1",
      "topicId": "solidarites",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle orientation pour l’assurance chômage et les minima sociaux ?",
      "context": "Aujourd’hui : l’assurance chômage indemnise au plus 18 mois les moins de 55 ans, et les allocataires du revenu de solidarité active (RSA) doivent en principe consacrer 15 heures par semaine à des activités d’insertion.",
      "explainer": {
        "summary": "L’assurance chômage verse un revenu de remplacement aux salariés qui ont perdu leur emploi ; les minima sociaux, comme le revenu de solidarité active (RSA), garantissent un revenu minimum aux personnes qui ont peu ou pas de ressources. Le débat porte sur la durée de ces aides, leur niveau (que les uns comparent aux revenus du travail, les autres au seuil de pauvreté), leur financement, l’accès aux droits et les obligations des allocataires.",
        "points": [
          {
            "text": "Règle actuelle : la durée d’indemnisation est réduite de 25 % tant que le taux de chômage reste inférieur à 9 % et n’augmente pas de 0,8 point en un trimestre. Selon Service-public (juillet 2026), c’est le cas aujourd’hui. Hors rupture conventionnelle, la durée maximale est alors de 548 jours (environ 18 mois) avant 55 ans, de 685 jours à 55 ou 56 ans et de 822 jours à partir de 57 ans.",
            "source": {
              "title": "Allocation chômage d’aide au retour à l’emploi (ARE) d’un salarié du secteur privé dont la fin de contrat de travail intervient à compter du 1er avril 2025",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F38881",
              "date": "2026-07-23",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "Depuis le 1er juin 2025, un demandeur d’emploi ou un allocataire du RSA qui ne respecte pas son contrat d’engagement (les démarches de recherche d’emploi ou d’insertion convenues) peut être sanctionné. Au moins 30 % de son allocation peut alors être suspendu pendant un à deux mois, puis un à quatre mois en cas de récidive. Pour le RSA, dans un foyer de plusieurs personnes, la part suspendue ne peut pas dépasser 50 %. La suspension est levée si la personne se remet en règle. Si l’allocation chômage est supprimée en totalité pendant quatre mois, la personne est aussi radiée de la liste des demandeurs d’emploi pour la même durée.",
            "source": {
              "title": "Décret n° 2025-478 du 30 mai 2025 relatif aux sanctions applicables aux demandeurs d’emploi en cas de manquement à leurs obligations (art. R. 5412-1 du code du travail et R. 262-68 à R. 262-68-6 du code de l’action sociale et des familles)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051672648",
              "date": "2025-05-31",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "On peut avoir droit au RSA sans le percevoir, car il n’est pas versé automatiquement : il faut le demander. Selon la DREES, fin 2021, 33 % à 37 % des foyers qui y avaient droit ne le touchaient pas, soit 560 000 foyers (France métropolitaine). Par rapport aux allocataires, ces foyers sont plus souvent propriétaires de leur logement, plus diplômés et plus proches de l’emploi.",
            "source": {
              "title": "Non-recours au RSA : plus d’un tiers des foyers éligibles ne le percevaient pas fin 2021 (Études et résultats n° 1370)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260506-non-recours-au-rsa-fin-2021",
              "date": "2026-05-06",
              "publisher": "DREES"
            }
          }
        ],
        "figures": [
          {
            "value": "46,9 %",
            "label": "des inscrits à France Travail en catégories A, B et C (tenus de chercher un emploi, sans emploi ou en activité réduite) sont effectivement indemnisés fin décembre 2025. 67,9 % ont un droit ouvert à indemnisation ; parmi eux, 69,0 % sont indemnisés.",
            "date": "2025-12-31",
            "source": {
              "title": "Part des demandeurs d’emploi indemnisables : situation au 31 décembre 2025",
              "url": "https://statistiques.francetravail.org/indem/indempub/229912",
              "date": "2026-09-24",
              "publisher": "France Travail, service statistique"
            },
            "chart": {
              "kind": "part",
              "value": 46.9,
              "total": 100,
              "unit": "%",
              "whole": "des inscrits à France Travail (cat. A, B, C)"
            }
          },
          {
            "value": "−2,3 Md€",
            "label": "Solde de l’assurance chômage prévu pour 2026 par l’Unédic, qui gère le régime (+0,1 Md€ en 2025). Les dépenses monteraient à 46,6 Md€ (45,3 Md€ en 2025) et les recettes baisseraient à 44,3 Md€ (45,4 Md€ en 2025) ; selon l’Unédic, cette baisse vient de prélèvements de l’État et de pertes de CSG sur les travailleurs indépendants. Dette attendue fin 2026 : 61,5 Md€.",
            "date": "Prévision de juin 2026",
            "source": {
              "title": "Prévisions financières de l’Unédic – juin 2026",
              "url": "https://www.unedic.org/publications/previsions-financieres-de-lunedic-juin-2026",
              "date": "2026-06-17",
              "publisher": "Unédic"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Solde 2025",
                  "value": 0.1
                },
                {
                  "label": "Solde 2026 (prévision)",
                  "value": -2.3
                }
              ]
            }
          },
          {
            "value": "15 mois",
            "label": "Durée maximale d’indemnisation avant 55 ans après une rupture conventionnelle (fin d’un CDI décidée d’un commun accord entre employeur et salarié), pour les contrats rompus depuis le 1er septembre 2026, contre 18 mois auparavant. À partir de 55 ans, elle est de 20,5 mois, contre 22,5 mois (55-56 ans) ou 27 mois (57 ans et plus) auparavant. Dans les outre-mer hors Mayotte, elle est de 20 mois avant 55 ans, contre 24 mois. Ces règles viennent de la loi du 11 juin 2026, qui reprend un avenant du 25 février 2026 à l’accord du 10 novembre 2023 sur l’assurance chômage ; des textes d’application sont encore attendus.",
            "date": "2026-09-01",
            "source": {
              "title": "Rupture conventionnelle : ce qui change au 1er septembre 2026",
              "url": "https://www.service-public.gouv.fr/particuliers/actualites/A18945",
              "date": "2026-09-02",
              "publisher": "Service-public.gouv.fr (DILA)"
            },
            "chart": {
              "kind": "compare",
              "unit": "mois",
              "items": [
                {
                  "label": "Avant 55 ans, règles précédentes",
                  "value": 18
                },
                {
                  "label": "Avant 55 ans, depuis sept. 2026",
                  "value": 15
                }
              ]
            }
          },
          {
            "value": "873 €",
            "label": "de prestations par mois en janvier 2025 (572 € de RSA et 301 € d’aides au logement) pour une personne seule sans revenu d’activité, d’âge actif, sans handicap et locataire du parc privé. Avec un SMIC net à temps plein, son revenu disponible serait de 1 673 € (1 426 € de salaire et 246 € de prime d’activité). Selon la DREES, ces prestations ne permettent pas de franchir le seuil de pauvreté (60 % du niveau de vie médian). Le RSA comptait 1,84 million d’allocataires fin 2024.",
            "date": "Janvier 2025",
            "source": {
              "title": "Nombre d’allocataires de minima sociaux (communiqué)",
              "url": "https://drees.solidarites-sante.gouv.fr/communique-de-presse/communique-de-presse/251204-nombre-allocataires-minima-sociaux",
              "date": "2025-12-04",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "€ par mois",
              "items": [
                {
                  "label": "Sans revenu d’activité",
                  "value": 873
                },
                {
                  "label": "Avec un SMIC net à temps plein",
                  "value": 1673
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "solidarites-1-a",
          "text": "Réaliser des économies sur l’assurance chômage, en raccourcissant notamment la durée d’indemnisation"
        },
        {
          "id": "solidarites-1-b",
          "text": "Encadrer davantage les aides sociales : total plafonné sous le SMIC, activité exigée ou durée limitée"
        },
        {
          "id": "solidarites-1-c",
          "text": "Revenir sur les réformes récentes qui ont réduit la durée et le montant des allocations chômage"
        },
        {
          "id": "solidarites-1-d",
          "text": "Revaloriser chaque année toutes les allocations au moins au rythme de la hausse des prix, sans gel"
        },
        {
          "id": "solidarites-1-e",
          "text": "Garantir à chaque personne sans emploi un emploi ou une formation payés au niveau d’un salaire"
        },
        {
          "id": "solidarites-1-f",
          "text": "Simplifier et verser automatiquement les aides sociales à toutes les personnes qui y ont droit"
        },
        {
          "id": "solidarites-1-g",
          "text": "Ouvrir les minima sociaux aux jeunes dès 18 ans et les relever jusqu’au seuil de pauvreté",
          "external": true
        }
      ]
    },
    {
      "id": "logement-1",
      "topicId": "logement",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quel levier prioritaire face à la crise du logement ?",
      "context": "Aujourd’hui : près de 3 millions de ménages attendent un logement social, et la construction de logements neufs a fortement reculé depuis 2022.",
      "explainer": {
        "summary": "Le logement pèse lourd dans le budget des locataires, la demande de logement social dépasse largement les attributions annuelles, et l’on autorise moins de logements à construire qu’au cours des cinq années précédentes. Les leviers proposés (règles d’urbanisme, investissement locatif privé, logement social, loyers et logements vides, rénovation énergétique, règles d’attribution, accession à la propriété) n’agissent pas au même endroit et n’ont ni le même coût ni la même rapidité d’effet.",
        "points": [
          {
            "text": "La loi vise à interdire à terme la location des logements qui consomment le plus d’énergie, en les classant comme non décents. Le diagnostic de performance énergétique (DPE) classe les logements de A (le plus économe) à G (le plus énergivore). Les logements G sont considérés comme non décents depuis 2025. Ce sera le cas des F en 2028 et des E en 2034. Depuis août 2022, les loyers des logements F et G ne peuvent plus être augmentés.",
            "source": {
              "title": "Diagnostic de performance énergétique (DPE)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/diagnostic-performance-energetique-dpe",
              "date": "2025-12-19",
              "publisher": "Ministère de la Transition écologique"
            }
          },
          {
            "text": "Quand les prix montent de 1 %, la construction de logements ne progresse que de 0,5 % en moyenne dans les villes françaises. Selon une étude citée par le Trésor, environ deux tiers des écarts entre villes dans cette réaction de la construction viendraient des règles d’urbanisme locales, et le reste de contraintes géographiques. Ces règles poursuivent aussi des objectifs reconnus : protéger le patrimoine et les paysages, prévenir les risques naturels, limiter l’artificialisation des sols. Deux lois de 2025 ont facilité la transformation de bureaux en logements et simplifié certaines procédures d’urbanisme.",
            "source": {
              "title": "Trésor-Éco n° 405 – Logement : des tensions structurelles pesant sur l’offre et la mobilité (p. 9 et 10)",
              "url": "https://www.tresor.economie.gouv.fr/Articles/572b5c4f-81c1-4879-ba96-50962e878252/files/5b9eadf7-0c49-4398-b111-aa1208d9656e",
              "date": "2026-10-02",
              "publisher": "Direction générale du Trésor"
            }
          },
          {
            "text": "Règles d’attribution aujourd’hui : pour obtenir un logement social, il faut en faire la demande et ne pas dépasser un plafond de revenus, qui dépend du nombre de personnes à loger et du lieu. Un demandeur qui n’est ni français ni citoyen d’un pays de l’Union européenne, de l’Espace économique européen ou de la Suisse doit au minimum fournir un titre de séjour, ou l’un des récépissés prévus par un arrêté du 20 avril 2022. Certaines demandes sont prioritaires, par exemple celles des personnes handicapées, sans logement, menacées d’expulsion ou victimes de violences.",
            "source": {
              "title": "Quelles sont les conditions pour obtenir un logement social ?",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F869",
              "date": "2026-09-11",
              "publisher": "Service-Public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "29,6 %",
            "label": "Taux d’effort médian des locataires du parc privé : la moitié d’entre eux consacrent plus de 29,6 % de leur revenu au logement, aides déduites (26,6 % dans le parc social). Pour les locataires du parc privé qui font partie du quart le plus modeste en niveau de vie, il atteint 42,3 % (30,3 % dans le parc social) (France métropolitaine).",
            "date": "2023",
            "source": {
              "title": "Logement – France, portrait social, édition 2025",
              "url": "https://www.insee.fr/fr/statistiques/8612550?sommaire=8612596",
              "date": "2025-11-18",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Parc privé",
                  "value": 29.6
                },
                {
                  "label": "Parc social",
                  "value": 26.6
                },
                {
                  "label": "Privé, quart le plus modeste",
                  "value": 42.3
                },
                {
                  "label": "Social, quart le plus modeste",
                  "value": 30.3
                }
              ]
            }
          },
          {
            "value": "380 000",
            "label": "logements sociaux attribués en 2024, pour 2,76 millions de demandes actives fin 2024 (France). Les locataires partent moins : en 2024, 7 % des logements sociaux ont changé d’occupant, contre 12,5 % en 1999. Les logements aux loyers les plus bas (dits PLAI) représentent 7 % du parc social, alors que 60 % des demandeurs pourraient y prétendre.",
            "date": "2024",
            "source": {
              "title": "Rapport public annuel 2026 – Faciliter le parcours d’accès au logement social dans les territoires",
              "url": "https://www.ccomptes.fr/sites/default/files/2026-03/20260325-RPA-2026-I-4-Faciliter-le-parcours-d-acces-au-logement-social_0.pdf",
              "date": "2026-03-25",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "compare",
              "items": [
                {
                  "label": "Attributions en 2024",
                  "value": 380000
                },
                {
                  "label": "Demandes actives fin 2024",
                  "value": 2760000
                }
              ]
            }
          },
          {
            "value": "369 723",
            "label": "logements autorisés à la construction en douze mois, soit 9,7 % de moins que la moyenne des cinq années précédentes (France entière).",
            "date": "Septembre 2025 – août 2026",
            "source": {
              "title": "Construction de logements : résultats à fin août 2026 (France entière)",
              "url": "https://www.statistiques.developpement-durable.gouv.fr/construction-de-logements-resultats-fin-aout-2026-france-entiere",
              "date": "2026-09-29",
              "publisher": "SDES – Ministère de la Transition écologique"
            }
          },
          {
            "value": "45,9 Md€",
            "label": "d’aides publiques au logement en 2025, soit 1,5 % du PIB : 16,4 Md€ d’aides personnelles au logement (perçues par 17 % des ménages), 10,6 Md€ pour la rénovation, 9,9 Md€ pour le logement social, 2,2 Md€ pour l’investissement locatif privé et 1,6 Md€ pour l’accession à la propriété, surtout le prêt à taux zéro. Hors aides fiscales et avantages de taux, la dépense publique pour le logement atteignait 1 % du PIB en 2024, contre 0,6 % en moyenne dans l’Union européenne ; le Trésor juge ces comparaisons fragiles.",
            "date": "2025",
            "source": {
              "title": "Trésor-Éco n° 405 – Logement : des tensions structurelles pesant sur l’offre et la mobilité (p. 6 et 7)",
              "url": "https://www.tresor.economie.gouv.fr/Articles/572b5c4f-81c1-4879-ba96-50962e878252/files/5b9eadf7-0c49-4398-b111-aa1208d9656e",
              "date": "2026-10-02",
              "publisher": "Direction générale du Trésor"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "logement-1-a",
          "text": "Simplifier les normes de construction et assouplir les règles d’urbanisme et d’usage des sols"
        },
        {
          "id": "logement-1-b",
          "text": "Attirer l’investissement locatif privé en allégeant la fiscalité des bailleurs et en renforçant leurs droits"
        },
        {
          "id": "logement-1-c",
          "text": "Construire beaucoup plus de logements sociaux et publics, avec davantage de financements publics"
        },
        {
          "id": "logement-1-d",
          "text": "Encadrer strictement les loyers, voire les geler, et réquisitionner les logements vides"
        },
        {
          "id": "logement-1-e",
          "text": "Faire de la rénovation énergétique des logements la priorité, pour réduire les charges des ménages"
        },
        {
          "id": "logement-1-f",
          "text": "Attribuer en priorité aux Français les logements sociaux et leur réserver les aides au logement"
        },
        {
          "id": "logement-1-g",
          "text": "Faciliter l’accession à la propriété : prêt à taux zéro élargi, vente de logements sociaux à leurs occupants"
        }
      ]
    },
    {
      "id": "sante-2",
      "topicId": "sante",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel rôle pour la Sécurité sociale dans le remboursement des soins ?",
      "context": "Aujourd’hui : la Sécurité sociale finance environ les quatre cinquièmes des dépenses de soins ; les complémentaires santé (mutuelles, assurances) et les patients eux-mêmes paient le reste.",
      "explainer": {
        "summary": "Les soins sont payés en partie par la Sécurité sociale, en partie par les complémentaires santé (mutuelles, assurances, institutions de prévoyance) et, pour le reste, par les patients. Les approches divergent sur la part de chacun et sur la façon de tenir la dépense : étendre le rôle de la Sécurité sociale, garder les remboursements actuels, moduler ce que paie le patient selon ses revenus, augmenter les franchises et moins indemniser les arrêts courts, ou mieux organiser les soins.",
        "points": [
          {
            "text": "La branche maladie du régime général est en déficit de 15,9 Md€ en 2025. Il serait ramené à 11,7 Md€ en 2026, notamment grâce à 8,1 Md€ de mesures nouvelles en recettes, puis atteindrait 13,8 Md€ en 2027 avant les mesures de la loi de financement pour 2027. Depuis le 1er octobre 2026, les franchises médicales et les participations forfaitaires (sommes retenues sur les remboursements des patients) sont plafonnées à 70 € par an chacune. Au 1er janvier 2027, le taux de remboursement des dispositifs médicaux doit passer de 60 % à 50 %.",
            "source": {
              "title": "Les comptes de la Sécurité sociale – Résultats 2025, prévisions 2026 et 2027 (rapport à la Commission des comptes de la Sécurité sociale)",
              "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
              "date": "2026-10",
              "publisher": "Commission des comptes de la Sécurité sociale (Direction de la Sécurité sociale)"
            }
          },
          {
            "text": "En 2025, la dépense courante de santé au sens international atteint 353,2 Md€, soit 11,8 % du PIB, contre 11,7 % en 2024. Les administrations publiques (Sécurité sociale, État et collectivités locales) en financent 77,4 %. Le reste à charge des ménages en représente 9,7 %, soit 495 € par habitant.",
            "source": {
              "title": "Les dépenses de santé en 2025 – édition 2026 (Panorama de la DREES)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/261001-les-d%C3%A9penses-de-sant%C3%A9-en-2025-edition-2026-panorama-de-la-drees",
              "date": "2026-10-01",
              "publisher": "DREES"
            }
          },
          {
            "text": "En 2023, 44 % de la population est couverte par un contrat d’entreprise ou de la fonction publique, 42 % par un contrat individuel et 11 % par la complémentaire santé solidaire (C2S), attribuée sous conditions de ressources. Enfin, 3,4 % de la population n’a aucune complémentaire santé (France hors Mayotte) ; c’est le cas de 7 % des personnes sous le seuil de pauvreté.",
            "source": {
              "title": "En 2023, les personnes sous le seuil de pauvreté restent bien plus souvent sans complémentaire santé que les autres (Les Dossiers de la DREES n° 137)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/les-dossiers-de-la-drees/260401_DD_compl%C3%A9mentaire_sant%C3%A9",
              "date": "2026-04-01",
              "publisher": "DREES"
            }
          }
        ],
        "figures": [
          {
            "value": "12,3 %",
            "label": "part de la dépense courante de santé (au sens international) financée par les complémentaires en 2025. Elles prennent en charge 69 % de l’optique, 48 % des audioprothèses et 46 % des soins et prothèses dentaires.",
            "date": "2025",
            "source": {
              "title": "Les dépenses de santé en 2025 – édition 2026 (Panorama de la DREES)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/261001-les-d%C3%A9penses-de-sant%C3%A9-en-2025-edition-2026-panorama-de-la-drees",
              "date": "2026-10-01",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "part",
              "value": 12.3,
              "total": 100,
              "unit": "%",
              "whole": "de la dépense courante de santé"
            }
          },
          {
            "value": "9,2 Md€ et 7,2 Md€",
            "label": "frais de gestion en santé des complémentaires (52 % du total) et des régimes de Sécurité sociale (41 %) en 2025, sur 17,6 Md€ de dépenses de gestion du système de santé. La DREES précise que ces frais ne sont pas directement comparables : les deux n’ont pas les mêmes rôles ni exactement les mêmes tâches.",
            "date": "2025",
            "source": {
              "title": "Les dépenses de santé en 2025, édition 2026 – Fiche 28 : Les dépenses de gestion du système de santé",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-09/CNS2026%20-%20Fiche%2028%20-%20Les%20d%C3%A9penses%20de%20gestion%20du%20syst%C3%A8me%20de%20sant%C3%A9.pdf",
              "date": "2026-10-01",
              "publisher": "DREES"
            }
          },
          {
            "value": "11 122 M€",
            "label": "d’indemnités journalières versées en 2025 par le régime général pour les arrêts maladie (hors accidents du travail), puis 11 204 M€ prévus en 2026. Cette dépense a augmenté de 5,7 % par an en moyenne de 2019 à 2025. Sa faible hausse prévue en 2026 (+0,7 %) tiendrait surtout à l’abaissement du plafond de calcul des indemnités. En volume, les indemnités des arrêts de plus de trois mois augmenteraient de 5 % en 2026, après 6,2 % en 2025.",
            "date": "2025",
            "source": {
              "title": "Les comptes de la Sécurité sociale – Résultats 2025, prévisions 2026 et 2027 (rapport à la Commission des comptes de la Sécurité sociale), fiche 2.3 et chapitre 2.1",
              "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
              "date": "2026-10",
              "publisher": "Commission des comptes de la Sécurité sociale (Direction de la Sécurité sociale)"
            },
            "chart": {
              "kind": "series",
              "unit": "M€",
              "items": [
                {
                  "label": "2025",
                  "value": 11122
                },
                {
                  "label": "2026 (prévision)",
                  "value": 11204
                }
              ]
            }
          },
          {
            "value": "+18,8 Md€",
            "label": "de dépenses publiques et 3,7 Md€ de recettes en moins si la Sécurité sociale remboursait aussi le ticket modérateur (la part du tarif qu’elle ne prend pas en charge aujourd’hui) et les soins nécessaires d’optique, de dentaire et d’audioprothèses. Dans ce scénario du Haut Conseil pour l’avenir de l’assurance maladie (HCAAM, 2022), des prélèvements obligatoires remplacent une partie des cotisations aux complémentaires et les frais de gestion baissent de 5,4 Md€. La réforme serait favorable aux 8 premiers déciles (les 80 % de la population aux revenus les plus bas) et coûteuse pour les 2 derniers. Ces scénarios ne font pas consensus au sein du HCAAM.",
            "date": "2022-01",
            "source": {
              "title": "Sécurité sociale : la boîte à outils du Sénat (rapport d’information n° 901, reprise du rapport du HCAAM « Quatre scénarios polaires d’évolution de l’articulation entre Sécurité sociale et assurance maladie complémentaire »)",
              "url": "https://www.senat.fr/rap/r24-901/r24-90136.html",
              "date": "2025-09-23",
              "publisher": "Sénat"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "sante-2-a",
          "text": "Faire rembourser à 100 % les soins prescrits par la Sécurité sociale, qui intégrerait les complémentaires"
        },
        {
          "id": "sante-2-b",
          "text": "Créer partout une complémentaire santé publique et obligatoire, gérée par la Sécurité sociale"
        },
        {
          "id": "sante-2-c",
          "text": "Maintenir le niveau de remboursement actuel, sans hausse des franchises ni déremboursements"
        },
        {
          "id": "sante-2-d",
          "text": "Moduler ce qui reste à payer par les patients selon leurs revenus, les plus aisés payant davantage"
        },
        {
          "id": "sante-2-e",
          "text": "Réduire l’indemnisation des arrêts maladie courts et augmenter les franchises payées par les patients"
        },
        {
          "id": "sante-2-f",
          "text": "Stabiliser les dépenses de santé par une meilleure organisation et la prévention, sans moyens supplémentaires"
        }
      ]
    },
    {
      "id": "sante-3",
      "topicId": "sante",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle politique pour la fin de vie ?",
      "context": "Aujourd’hui : une loi adoptée définitivement en juillet 2026 crée, sous conditions, une aide à mourir pour les adultes atteints d’une maladie grave et incurable.",
      "explainer": {
        "summary": "La loi du 18 août 2026 ouvre, sous conditions, une aide à mourir aux personnes majeures atteintes d’une maladie grave et incurable, en phase avancée ou terminale. Le débat porte sur le principe même de l’aide à mourir, sur ses conditions et son contrôle, sur la place des soins palliatifs et sur la manière de trancher : loi, Constitution ou référendum.",
        "points": [
          {
            "text": "La loi fixe des conditions cumulatives : avoir au moins 18 ans ; être de nationalité française ou résider de façon stable et régulière en France ; être atteint d’une affection grave et incurable qui engage le pronostic vital, en phase avancée ou terminale ; éprouver une souffrance réfractaire aux traitements, ou insupportable selon la personne si elle a choisi de ne pas être traitée ; exprimer une volonté libre et éclairée. Une souffrance psychologique seule ne suffit pas. Le médecin se prononce dans les quinze jours, après une procédure collégiale. La personne s’administre la substance létale, ou un médecin ou un infirmier le fait si elle n’en est pas physiquement capable. Une commission placée auprès du ministre de la Santé vérifie après coup, pour chaque procédure, le respect des conditions. Un décret en Conseil d’État doit préciser les conditions d’application.",
            "source": {
              "title": "Loi n° 2026-794 du 18 août 2026 relative au droit à l’aide à mourir",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054706877",
              "date": "2026-08-19",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Les professionnels de santé chargés de la procédure peuvent refuser d’y participer (clause de conscience). Le 14 août 2026, le Conseil constitutionnel n’a censuré aucune disposition de la loi, mais a émis des réserves d’interprétation : les pharmaciens ne peuvent pas non plus être tenus d’y participer, et un établissement privé peut refuser qu’elle se déroule dans ses locaux si elle est manifestement contraire à ses missions ou à son projet, à condition que d’autres établissements puissent répondre aux besoins locaux.",
            "source": {
              "title": "Décision n° 2026-910 DC du 14 août 2026 – Loi relative au droit à l’aide à mourir",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026910DC.htm",
              "date": "2026-08-14",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Le 17 juin 2026, le Conseil constitutionnel a écarté une proposition de référendum d’initiative partagée (lancée par des parlementaires, puis soumise au soutien des électeurs) « visant à exclure de la notion de soin la provocation active de la mort ». Selon lui, les questions de société, dont les questions éthiques relatives à la fin de vie, ne font pas partie des sujets que l’article 11 de la Constitution permet de soumettre au référendum. Inscrire un droit dans la Constitution supposerait une révision votée dans les mêmes termes par l’Assemblée nationale et le Sénat, puis approuvée par référendum ou, si elle émane du gouvernement, par le Parlement réuni en Congrès (article 89).",
            "source": {
              "title": "Décision n° 2026-7 RIP du 17 juin 2026 – Proposition de loi visant à exclure de la notion de soin la provocation active de la mort",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/20267RIP.htm",
              "date": "2026-06-17",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "291 pour, 241 contre",
            "label": "Vote de l’Assemblée nationale en lecture définitive (dernier mot donné aux députés en cas de désaccord persistant avec le Sénat) sur la loi relative au droit à l’aide à mourir, le 15 juillet 2026 : 532 suffrages exprimés, 29 abstentions",
            "date": "2026-07-15",
            "source": {
              "title": "Scrutin public n° 8280 – Première séance du mercredi 15 juillet 2026",
              "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/8280",
              "date": "2026-07-15",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "députés",
              "items": [
                {
                  "label": "Pour",
                  "value": 291
                },
                {
                  "label": "Contre",
                  "value": 241
                },
                {
                  "label": "Abstentions",
                  "value": 29
                }
              ]
            }
          },
          {
            "value": "122 pour, 181 contre",
            "label": "Vote du Sénat en première lecture sur l’aide à mourir, le 28 janvier 2026 (texte non adopté) ; le même jour, il adoptait par 307 voix contre 17 la proposition de loi sur l’accompagnement et les soins palliatifs. Le Sénat a de nouveau rejeté le texte sur l’aide à mourir en deuxième lecture (12 mai 2026) et en nouvelle lecture (7 juillet 2026)",
            "date": "2026-01-28",
            "source": {
              "title": "Proposition de loi relative au droit à l’aide à mourir – La loi en clair",
              "url": "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-relative-au-droit-a-laide-a-mourir.html",
              "date": "2026",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "compare",
              "unit": "sénateurs",
              "items": [
                {
                  "label": "Pour",
                  "value": 122
                },
                {
                  "label": "Contre",
                  "value": 181
                }
              ]
            }
          },
          {
            "value": "48 %",
            "label": "Part des besoins en soins palliatifs couverts par l’offre existante, selon la Cour des comptes (rapport de juillet 2023). La dépense publique de soins palliatifs atteignait 1,45 Md€ en 2021, en hausse de 24,6 % depuis 2017",
            "date": "2023-07",
            "source": {
              "title": "Les soins palliatifs",
              "url": "https://www.ccomptes.fr/fr/publications/les-soins-palliatifs",
              "date": "2023-07-05",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "part",
              "value": 48,
              "total": 100,
              "unit": "%",
              "whole": "des besoins en soins palliatifs"
            }
          },
          {
            "value": "194 M€",
            "label": "Crédits nouveaux prévus pour 2026 par la loi du 26 mai 2026 au titre de la stratégie nationale de l’accompagnement et des soins palliatifs (crédits de paiement des mesures nouvelles), puis 192 M€ en 2027, 188 M€ en 2028, 194 M€ en 2029, 150 M€ en 2030, 210 M€ en 2031, 200 M€ en 2032, 244 M€ en 2033 et 222 M€ en 2034",
            "date": "2026-2034",
            "source": {
              "title": "Loi n° 2026-404 du 26 mai 2026 visant à garantir l’égal accès de tous à l’accompagnement et aux soins palliatifs (article 5)",
              "url": "https://www.legifrance.gouv.fr/eli/loi/2026/5/26/2026-404/jo/texte",
              "date": "2026-05-27",
              "publisher": "Légifrance"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "sante-3-a",
          "text": "Inscrire dans la Constitution le droit de mourir dans la dignité, y compris avec une assistance"
        },
        {
          "id": "sante-3-b",
          "text": "Appliquer la loi de 2026 sur l’aide à mourir et développer en parallèle les soins palliatifs"
        },
        {
          "id": "sante-3-c",
          "text": "Contrôler l’application de la loi de 2026 pour prévenir les abus, en donnant la priorité aux soins palliatifs"
        },
        {
          "id": "sante-3-d",
          "text": "Refuser l’aide à mourir et développer à la place les soins palliatifs et le traitement de la douleur"
        },
        {
          "id": "sante-3-e",
          "text": "Soumettre l’aide à mourir à un référendum, pour que les citoyens tranchent eux-mêmes la question"
        }
      ]
    },
    {
      "id": "sante-4",
      "topicId": "sante",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour la prévention en santé ?",
      "context": "Aujourd’hui : onze vaccins sont obligatoires pour les enfants nés depuis 2018, et le budget de l’assurance maladie, prévention comprise, est voté chaque année.",
      "explainer": {
        "summary": "La prévention cherche à éviter les maladies plutôt qu’à les soigner. Les approches divergent sur le levier à privilégier : le budget de la prévention et sa durée, l’étiquetage des aliments, l’exposition aux pesticides et aux polluants, la santé mentale ou les obligations vaccinales.",
        "points": [
          {
            "text": "Chaque année, à l’automne, le Parlement vote la loi de financement de la Sécurité sociale. Il y fixe l’objectif national de dépenses d’assurance maladie (Ondam) : un objectif de dépenses pour les soins de ville et l’hospitalisation, que la loi prévoit de ne pas dépasser.",
            "source": {
              "title": "Loi de financement de la sécurité sociale : présentation",
              "url": "https://www.securite-sociale.fr/la-secu-en-detail/loi-de-financement/presentation",
              "publisher": "Direction de la Sécurité sociale (securite-sociale.fr)"
            }
          },
          {
            "text": "Le Nutri-Score est affiché sur la base du volontariat : les entreprises qui le souhaitent s’enregistrent gratuitement auprès de Santé publique France. Le règlement européen n° 1169/2011 encadre l’étiquetage des aliments ; il permet ce type d’information nutritionnelle à titre volontaire, en plus de la déclaration nutritionnelle obligatoire. Un algorithme de calcul révisé s’applique progressivement en France depuis mars 2025.",
            "source": {
              "title": "Nutri-Score",
              "url": "https://www.santepubliquefrance.fr/nutrition-et-activite-physique/nutri-score",
              "date": "2026-03-19",
              "publisher": "Santé publique France"
            }
          },
          {
            "text": "Pour les enfants nés depuis 2018, la vaccination est obligatoire contre la diphtérie, le tétanos, la poliomyélite, la coqueluche, Haemophilus influenzae de type b, l’hépatite B, le pneumocoque, le méningocoque C, la rougeole, les oreillons et la rubéole. Pour les enfants nés à partir de 2023, l’obligation contre le méningocoque s’étend aux sérogroupes A, B, W et Y. Un enfant qui n’est pas à jour peut être admis provisoirement en crèche ou à l’école ; ses parents ont alors 3 mois pour le faire vacciner.",
            "source": {
              "title": "Vaccins obligatoires de l’enfant",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F767",
              "date": "2026-01-06",
              "publisher": "Service-public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "9,2 Md€",
            "label": "de dépenses de prévention comptées dans les comptes de la santé en 2025, en hausse de 6,8 % en un an du fait de la forte progression de la vaccination. L’État et les collectivités en financent 41,0 %, la Sécurité sociale 28,7 %, les entreprises 23,8 % (médecine du travail, risques professionnels) et les complémentaires 5,0 %. Une partie de la prévention faite en consultation est comptée dans les soins de ville ou d’hôpital.",
            "date": "2025",
            "source": {
              "title": "Les dépenses de santé en 2025, édition 2026 – Fiche 27 : Les dépenses de prévention",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-09/CNS2026%20-%20Fiche%2027%20-%20Les%20d%C3%A9penses%20de%20pr%C3%A9vention.pdf",
              "date": "2026-10-01",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "État et collectivités",
                  "value": 41
                },
                {
                  "label": "Sécurité sociale",
                  "value": 28.7
                },
                {
                  "label": "Entreprises",
                  "value": 23.8
                },
                {
                  "label": "Complémentaires",
                  "value": 5
                }
              ]
            }
          },
          {
            "value": "1 462 entreprises",
            "label": "engagées dans la démarche Nutri-Score en France en juin 2025, contre 1 377 en juin 2024. Selon une estimation de l’Oqali, leurs marques représentent 63 % des volumes de ventes des produits suivis en grande distribution en 2025, après 64 % en 2023 et 2024.",
            "date": "2025-06",
            "source": {
              "title": "Suivi du Nutri-Score par l’Oqali – Bilan annuel 2025 – Édition 2026",
              "url": "https://www.oqali.fr/media/2026/06/OQALI-2025_Suivi-du-Nutri-Score.pdf",
              "date": "2026-06",
              "publisher": "Oqali (observatoire public de l’alimentation, INRAE-Anses)"
            },
            "chart": {
              "kind": "series",
              "unit": "entreprises",
              "items": [
                {
                  "label": "juin 2024",
                  "value": 1377
                },
                {
                  "label": "juin 2025",
                  "value": 1462
                }
              ]
            }
          },
          {
            "value": "près de 40 000",
            "label": "décès par an seraient attribuables à l’exposition des personnes de 30 ans et plus aux particules fines (PM2,5), soit 7 % de la mortalité totale en France métropolitaine sur 2016-2019, contre 9 % sur 2007-2008. Estimation de Santé publique France publiée en avril 2021.",
            "date": "2016-2019",
            "source": {
              "title": "Pollution de l’air ambiant : nouvelles estimations de son impact sur la santé des Français",
              "url": "https://www.santepubliquefrance.fr/presse/pollution-de-lair-ambiant-nouvelles-estimations-de-son-impact-sur-la-sante-des-francais",
              "date": "2021-04-14",
              "publisher": "Santé publique France"
            },
            "chart": {
              "kind": "series",
              "unit": "% de la mortalité totale",
              "items": [
                {
                  "label": "2007-2008",
                  "value": 9
                },
                {
                  "label": "2016-2019",
                  "value": 7
                }
              ]
            }
          },
          {
            "value": "29,1 Md€",
            "label": "remboursés par l’Assurance maladie pour la santé mentale en 2024, soit 14 % des 212,6 Md€ remboursés cette année-là : 20,3 Md€ pour les maladies psychiatriques et 8,8 Md€ pour les traitements chroniques par psychotropes (anxiolytiques, hypnotiques…) hors maladie repérée.",
            "date": "2024",
            "source": {
              "title": "Améliorer la qualité du système de santé et maîtriser les dépenses : propositions de l’Assurance Maladie pour 2027 (rapport Charges et produits)",
              "url": "https://www.assurance-maladie.ameli.fr/sites/default/files/2026-07_rapport-propositions-pour-2027_assurance-maladie.pdf",
              "date": "2026-07",
              "publisher": "Assurance maladie (Cnam)"
            },
            "chart": {
              "kind": "part",
              "value": 29.1,
              "total": 212.6,
              "unit": "Md€",
              "whole": "remboursés par l’Assurance maladie"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "sante-4-a",
          "text": "Interdire les pesticides et polluants classés cancérigènes pour réduire les maladies environnementales"
        },
        {
          "id": "sante-4-b",
          "text": "Supprimer les obligations vaccinales et réexaminer la sécurité des vaccins à ARN messager"
        },
        {
          "id": "sante-4-c",
          "text": "Investir beaucoup plus dans la prévention, avec un budget voté pour plusieurs années"
        },
        {
          "id": "sante-4-d",
          "text": "Faire de la santé mentale une grande cause nationale, avec un plan pour la psychiatrie"
        },
        {
          "id": "sante-4-e",
          "text": "Rendre obligatoire sur tous les aliments emballés l’affichage d’une note nutritionnelle de A à E"
        }
      ]
    },
    {
      "id": "sante-5",
      "topicId": "sante",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour accompagner les personnes âgées en perte d’autonomie ?",
      "context": "Aujourd’hui : les EHPAD (établissements d’hébergement pour personnes âgées dépendantes) sont publics, associatifs ou privés à but lucratif ; une branche de la Sécurité sociale finance l’autonomie depuis 2021.",
      "explainer": {
        "summary": "Accompagner les personnes âgées qui perdent leur autonomie pose trois questions : où (en établissement ou à domicile), avec combien de personnel et avec quel financement. Les approches divergent sur le statut des EHPAD (publics, associatifs ou privés à but lucratif), la place du domicile, un nombre minimal de soignants, le recrutement du personnel ou l’automatisation de certaines tâches, la prévention des maltraitances et la source de financement.",
        "points": [
          {
            "text": "L’allocation personnalisée d’autonomie (APA), attribuée par les départements, aide les personnes de 60 ans ou plus en perte d’autonomie. La grille AGGIR classe ce besoin d’aide en six niveaux, du GIR 1 (le plus lourd) au GIR 6 : seuls les GIR 1 à 4 donnent droit à l’APA. Son montant dépend de ce niveau, des revenus et du plan d’aide. En décembre 2024, 1,39 million de personnes la perçoivent (832 100 à domicile, 560 600 en établissement), soit 7,4 % des 60 ans ou plus.",
            "source": {
              "title": "Les chiffres clés de l’aide à l’autonomie 2026",
              "url": "https://www.cnsa.fr/sites/default/files/2026-06/PUB-CNSA-CC2026-WEB-ACCESS.pdf",
              "date": "2026-06",
              "publisher": "CNSA"
            }
          },
          {
            "text": "Fin 2023, 697 000 personnes vivent ou sont accueillies dans un établissement pour personnes âgées, soit 4,5 % de moins qu’en 2019 ; 85 % des résidents sont en perte d’autonomie. Selon la DREES, ce recul pourrait s’expliquer par l’amorce d’un « virage domiciliaire », c’est-à-dire la volonté de privilégier le maintien à domicile, et par une baisse de la perte d’autonomie chez les seniors.",
            "source": {
              "title": "Établissements d’hébergement pour personnes âgées : des résidents aussi âgés et autant en perte d’autonomie qu’en 2019, mais moins nombreux (Études et résultats n° 1351)",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-11/ER%201351%20EHPA-MEL.pdf",
              "date": "2025-11",
              "publisher": "DREES"
            }
          },
          {
            "text": "La branche autonomie de la Sécurité sociale, gérée par la CNSA, tirerait 89 % de ses recettes de la contribution sociale généralisée (CSG) en 2026. Elle perçoit aussi deux contributions dédiées, sur les revenus d’activité (CSA) et sur les retraites (CASA). La loi de financement pour 2026 a relevé de 1,4 point la CSG sur une partie des revenus du capital, au profit de cette seule branche : 1,2 Md€ attendus en 2026. Excédentaire de 0,1 Md€ en 2025, la branche serait en déficit de 0,3 Md€ en 2026, puis de 0,1 Md€ en 2027 avant les mesures nouvelles.",
            "source": {
              "title": "Les comptes de la Sécurité sociale – Résultats 2025, prévisions 2026 et 2027 (rapport à la Commission des comptes de la Sécurité sociale)",
              "url": "https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf",
              "date": "2026-10",
              "publisher": "Commission des comptes de la Sécurité sociale (Direction de la Sécurité sociale)"
            }
          }
        ],
        "figures": [
          {
            "value": "609 970 places",
            "label": "en EHPAD fin 2023 : 292 840 dans le public, 179 440 dans le privé non lucratif et 137 690 dans le privé lucratif (France hors Mayotte)",
            "date": "fin 2023",
            "source": {
              "title": "L’aide sociale aux personnes âgées ou handicapées, édition 2025 – Fiche 09 : Les établissements d’hébergement pour personnes âgées",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-09/PAPH%20-%20Fiche%2009%20-%20Les%20%C3%A9tablissements%20d%E2%80%99h%C3%A9bergement%20pour%20personnes%20%C3%A2g%C3%A9es_0.pdf",
              "date": "2025-09",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "places",
              "items": [
                {
                  "label": "Public",
                  "value": 292840
                },
                {
                  "label": "Privé non lucratif",
                  "value": 179440
                },
                {
                  "label": "Privé lucratif",
                  "value": 137690
                }
              ]
            }
          },
          {
            "value": "66 ETP pour 100 places",
            "label": "de personnel en équivalent temps plein (ETP) dans les EHPAD fin 2023, tous métiers confondus : 402 500 ETP pour 609 970 places (France métropolitaine et DROM). Le personnel « au chevet » (infirmiers et aides-soignants) représente 29 ETP pour 100 places, un niveau stable depuis 2019.",
            "date": "fin 2023",
            "source": {
              "title": "L’aide sociale aux personnes âgées ou handicapées, édition 2025 – Fiche 09 : Les établissements d’hébergement pour personnes âgées",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-09/PAPH%20-%20Fiche%2009%20-%20Les%20%C3%A9tablissements%20d%E2%80%99h%C3%A9bergement%20pour%20personnes%20%C3%A2g%C3%A9es_0.pdf",
              "date": "2025-09",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "ETP pour 100 places",
              "items": [
                {
                  "label": "Tous métiers confondus",
                  "value": 66
                },
                {
                  "label": "Infirmiers et aides-soignants",
                  "value": 29
                }
              ]
            }
          },
          {
            "value": "3,36 Md€",
            "label": "mobilisés en 2026 par la journée de solidarité, selon la CNSA, au sein d’un « effort national » de 43,37 Md€ en faveur des personnes âgées et des personnes handicapées en perte d’autonomie.",
            "date": "2026",
            "source": {
              "title": "Journée de solidarité 2026 : derrière les chiffres, des vies accompagnées (communiqué de presse)",
              "url": "https://www.cnsa.fr/sites/default/files/2026-05/CP_Journee-de-solidarite-2026.pdf",
              "date": "2026-05-18",
              "publisher": "CNSA"
            },
            "chart": {
              "kind": "part",
              "value": 3.36,
              "total": 43.37,
              "unit": "Md€",
              "whole": "d’effort national pour l’autonomie"
            }
          },
          {
            "value": "31,1 Md€",
            "label": "d’argent public consacré en 2024 à la perte d’autonomie des personnes âgées, versé à 79 % par la Sécurité sociale, à 16 % par les départements et à 5 % par l’État. Ce montant ne comprend pas les dépenses des personnes elles-mêmes ni celles de leurs proches.",
            "date": "2024",
            "source": {
              "title": "Les chiffres clés de l’aide à l’autonomie 2026",
              "url": "https://www.cnsa.fr/sites/default/files/2026-06/PUB-CNSA-CC2026-WEB-ACCESS.pdf",
              "date": "2026-06",
              "publisher": "CNSA"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Sécurité sociale",
                  "value": 79
                },
                {
                  "label": "Départements",
                  "value": 16
                },
                {
                  "label": "État",
                  "value": 5
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "sante-5-a",
          "text": "Créer un service public de la dépendance et placer sous gestion publique les EHPAD à but lucratif"
        },
        {
          "id": "sante-5-b",
          "text": "Privilégier le maintien à domicile, avec plus de soins à domicile et un congé rémunéré pour les aidants"
        },
        {
          "id": "sante-5-c",
          "text": "Imposer dans tous les EHPAD un nombre minimal de soignants par résident, pour renforcer les effectifs"
        },
        {
          "id": "sante-5-d",
          "text": "Installer des caméras dans les EHPAD, avec l’accord des salariés, pour prévenir les maltraitances"
        },
        {
          "id": "sante-5-e",
          "text": "Automatiser les tâches physiques en EHPAD, pour réduire le recours à la main-d’œuvre immigrée"
        },
        {
          "id": "sante-5-f",
          "text": "Financer la perte d’autonomie par une ressource dédiée, comme une seconde journée de solidarité travaillée",
          "external": true
        }
      ]
    },
    {
      "id": "logement-2",
      "topicId": "logement",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles règles pour les loyers et les impayés de loyer ?",
      "context": "Aujourd’hui : l’encadrement des loyers, expérimenté dans des villes volontaires comme Paris, Lille ou Lyon, doit s’arrêter en novembre 2026 faute de nouvelle loi ; une loi de 2023 a accéléré les procédures contre les squats et les impayés.",
      "explainer": {
        "summary": "L’encadrement des loyers, en place depuis 2019 dans des villes volontaires, prend fin en novembre 2026 si aucune loi ne le prolonge : faut-il le supprimer, le garder là où il existe, l’étendre, voire geler les loyers ? Le débat porte aussi sur les impayés, entre protection des locataires d’un côté, sécurité des propriétaires et offre de logements à louer de l’autre.",
        "points": [
          {
            "text": "Il existe deux niveaux de règles. Dans la plupart des communes en zone tendue (où la demande de logements dépasse nettement l’offre), le propriétaire ne peut pas augmenter librement le loyer quand il change de locataire. Dans neuf territoires, le loyer lui-même est plafonné : Paris, deux territoires de Seine-Saint-Denis et six de province. Ce plafond est fixé par arrêté préfectoral. Il dépend du type de location (vide ou meublée), du nombre de pièces et de l’époque de construction. Un « complément de loyer » permet de le dépasser si le logement a des caractéristiques particulières.",
            "source": {
              "title": "En quoi consiste l’encadrement des loyers à respecter en zone tendue ?",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F1314",
              "date": "2026-08-01",
              "publisher": "Service-Public.fr (DILA)"
            }
          },
          {
            "text": "Le plafonnement est une expérimentation de huit ans, ouverte par la loi du 23 novembre 2018. Sans nouvelle loi, il s’arrête en novembre 2026. Le 11 décembre 2025, l’Assemblée nationale a adopté en première lecture une proposition de loi qui le rendrait permanent. Elle permettrait aussi à d’autres communes de le mettre en place, en zone tendue ou si elles connaissent de sérieuses difficultés d’accès au logement. Au 7 octobre 2026, le texte n’est pas définitivement adopté : le Sénat doit l’examiner en séance le 21 octobre 2026.",
            "source": {
              "title": "Proposition de loi pour retrouver la confiance et l’équilibre dans les rapports locatifs (dossier législatif, texte n° 217, 2025-2026)",
              "url": "https://www.senat.fr/dossier-legislatif/ppl25-217.html",
              "date": "2026-09-17",
              "publisher": "Sénat"
            }
          },
          {
            "text": "En cas de loyers impayés, le propriétaire peut faire délivrer un commandement de payer : le locataire a alors 6 semaines pour régler sa dette. Tout bail signé depuis le 29 juillet 2023 contient une clause résolutoire, qui permet au juge de le résilier en cas d’impayés. Le juge peut accorder jusqu’à 3 ans de délai au locataire qui a repris le paiement de son loyer et qui peut rembourser sa dette. Après un commandement de quitter les lieux, le locataire a en général 2 mois pour partir. S’il n’a pas de solution de relogement, il ne peut pas être expulsé du 1er novembre au 31 mars (trêve hivernale).",
            "source": {
              "title": "Loyers impayés et expulsion du locataire",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F31272",
              "date": "2026-08-06",
              "publisher": "Service-Public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "−2 à −4 %",
            "label": "Effet moyen estimé du plafonnement sur les loyers des annonces : −2 à −3 % dans les villes concernées hors Île-de-France, −3 à −4 % en Seine-Saint-Denis. Hors Île-de-France, l’effet semble se renforcer avec le temps (environ −5 % après deux ans). À Paris, les loyers ont baissé, mais le rapport ne peut pas attribuer toute cette baisse au dispositif.",
            "date": "Évaluation publiée en mai 2026",
            "source": {
              "title": "L’encadrement des loyers : effets économiques et redistributifs – Rapport de la mission d’évaluation (G. Chapelle, G. Fack, avec l’IGEDD et l’IGF), section 3.4, p. 41 à 43",
              "url": "https://www.clcv.org/storage/app/media/RAPPORT%20FACK%20CHAPELLE.pdf",
              "date": "2026-05",
              "publisher": "Mission d’évaluation remise au Gouvernement (copie à laquelle renvoie le Trésor-Éco n° 405, hébergée par la CLCV)"
            }
          },
          {
            "value": "−8 %",
            "label": "Effet estimé du plafonnement sur le nombre de nouvelles annonces de location publiées sur les principaux sites, dans les villes concernées hors Île-de-France. Le rapport ne peut pas dire si cela vient d’une baisse de l’offre à louer, de locataires qui restent plus longtemps ou d’annonces passées par d’autres canaux. À Paris, le nombre d’annonces a augmenté.",
            "date": "Évaluation publiée en mai 2026",
            "source": {
              "title": "L’encadrement des loyers : effets économiques et redistributifs – Rapport de la mission d’évaluation (G. Chapelle, G. Fack, avec l’IGEDD et l’IGF), section 3.5, p. 44 à 46",
              "url": "https://www.clcv.org/storage/app/media/RAPPORT%20FACK%20CHAPELLE.pdf",
              "date": "2026-05",
              "publisher": "Mission d’évaluation remise au Gouvernement (copie à laquelle renvoie le Trésor-Éco n° 405, hébergée par la CLCV)"
            }
          },
          {
            "value": "Plus d’un tiers",
            "label": "des baux récents étudiés ont un loyer hors charges supérieur au plafond. Selon le rapport, cela peut venir d’un complément de loyer autorisé, d’un non-respect de la règle ou d’un bail non soumis au plafond. L’étude porte sur environ 270 000 baux signés de 2020 à 2024, dans les communes entrées dans le dispositif avant 2024.",
            "date": "Baux signés de 2020 à 2024",
            "source": {
              "title": "L’encadrement des loyers : effets économiques et redistributifs – Rapport de la mission d’évaluation (G. Chapelle, G. Fack, avec l’IGEDD et l’IGF), section 2.2.4, p. 28",
              "url": "https://www.clcv.org/storage/app/media/RAPPORT%20FACK%20CHAPELLE.pdf",
              "date": "2026-05",
              "publisher": "Mission d’évaluation remise au Gouvernement (copie à laquelle renvoie le Trésor-Éco n° 405, hébergée par la CLCV)"
            }
          },
          {
            "value": "2 millions de logements",
            "label": "de plus seraient concernés si le plafonnement était étendu à toutes les zones tendues, avec des effets semblables à ceux observés (simulation). Le gain estimé pour les locataires serait de 1,1 Md€. Il serait payé par les propriétaires (787 M€) et par l’État, en recettes fiscales perdues (320 M€).",
            "date": "Simulation publiée en mai 2026",
            "source": {
              "title": "L’encadrement des loyers : effets économiques et redistributifs – Rapport de la mission d’évaluation (G. Chapelle, G. Fack, avec l’IGEDD et l’IGF), section 4.4.4, p. 66-67",
              "url": "https://www.clcv.org/storage/app/media/RAPPORT%20FACK%20CHAPELLE.pdf",
              "date": "2026-05",
              "publisher": "Mission d’évaluation remise au Gouvernement (copie à laquelle renvoie le Trésor-Éco n° 405, hébergée par la CLCV)"
            },
            "chart": {
              "kind": "compare",
              "unit": "M€",
              "items": [
                {
                  "label": "Payé par les propriétaires",
                  "value": 787
                },
                {
                  "label": "Recettes fiscales perdues (État)",
                  "value": 320
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "logement-2-a",
          "text": "Supprimer l’encadrement des loyers et accélérer les expulsions en cas d’impayés ou d’occupation illégale"
        },
        {
          "id": "logement-2-b",
          "text": "Créer une assurance publique contre les loyers impayés, pour inciter les propriétaires à louer"
        },
        {
          "id": "logement-2-c",
          "text": "Étendre l’encadrement des loyers à toutes les zones où le manque de logements est le plus fort"
        },
        {
          "id": "logement-2-d",
          "text": "Encadrer les loyers partout en France et interdire les expulsions sans solution de relogement"
        },
        {
          "id": "logement-2-e",
          "text": "Geler ou baisser les loyers, annuler les dettes de loyer et interdire toutes les expulsions"
        },
        {
          "id": "logement-2-f",
          "text": "Prolonger l’encadrement des loyers dans les seules villes volontaires, sans l’imposer ailleurs",
          "external": true
        }
      ]
    },
    {
      "id": "logement-3",
      "topicId": "logement",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle règle pour les logements mal isolés et leur rénovation ?",
      "context": "Aujourd’hui : les logements classés G au diagnostic de performance énergétique (DPE) ne peuvent plus être mis en location depuis 2025, et ce sera le cas des logements classés F en 2028.",
      "explainer": {
        "summary": "La loi interdit peu à peu de louer les logements les plus énergivores : pour les uns, un moyen d’avoir des logements moins coûteux à chauffer et moins émetteurs ; pour les autres, un risque de réduire l’offre de logements à louer. Le débat porte aussi sur la forme (subventions ou prêts), le montant et la stabilité des aides à la rénovation.",
        "points": [
          {
            "text": "Le diagnostic de performance énergétique (DPE) classe les logements de A (le plus économe) à G (le plus énergivore). La loi retire peu à peu de la location les plus énergivores en les jugeant non décents : les logements G depuis 2025, les F à partir de 2028 et les E à partir de 2034. Depuis août 2022, les loyers des logements F et G ne peuvent plus être augmentés.",
            "source": {
              "title": "Diagnostic de performance énergétique (DPE)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/diagnostic-performance-energetique-dpe",
              "date": "2025-12-19",
              "publisher": "Ministère de la Transition écologique"
            }
          },
          {
            "text": "Un projet de loi adopté par le Sénat, puis modifié en commission à l’Assemblée nationale (texte du 23 septembre 2026), assouplirait ces règles ; les députés doivent encore le voter en séance. Un logement resterait décent si les travaux sont impossibles techniquement ou refusés par l’administration ou par la copropriété (dans ce dernier cas, trois ans au plus), le propriétaire ayant fait ceux qui étaient possibles. Un contrat de travaux signé avant le 1er janvier 2030 donnerait aussi un délai : trois ans au plus après un acompte d’au moins 30 %, cinq ans si c’est la copropriété qui signe. Pour un bail en cours, la règle s’appliquerait à son renouvellement, au plus tard trois ans après l’échéance.",
            "source": {
              "title": "Texte de la commission des affaires économiques n° 3188 – Projet de loi visant la relance et la décentralisation du logement",
              "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b3188_texte-adopte-commission.pdf",
              "date": "2026-09-23",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "text": "Un prêt sans intérêts existe déjà pour ces travaux : l’éco-prêt à taux zéro (éco-PTZ). Il est accordé sans condition de ressources aux propriétaires occupants et aux bailleurs, pour une résidence principale construite depuis plus de deux ans. Il peut atteindre 50 000 € pour une rénovation globale et se cumuler avec MaPrimeRénov’ et les aides de l’Agence nationale de l’habitat (Anah).",
            "source": {
              "title": "Éco-prêt à taux zéro (éco-PTZ)",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F19905",
              "date": "2026-09-01",
              "publisher": "Service-Public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "1,1 million",
            "label": "logements classés F ou G dans le parc locatif privé, soit 13,8 % de ce parc, contre 14,0 % chez les propriétaires occupants et 5,8 % dans le parc social. Au total, 3,9 millions de résidences principales (12,7 %), ou 3,2 millions selon une simulation avec le calcul du DPE modifié au 1er janvier 2026 pour l’électricité. France métropolitaine",
            "date": "1er janvier 2025",
            "source": {
              "title": "Le parc de logements par classe de performance énergétique au 1er janvier 2025",
              "url": "https://www.statistiques.developpement-durable.gouv.fr/le-parc-de-logements-par-classe-de-performance-energetique-au-1er-janvier-2025",
              "date": "2025-11-12",
              "publisher": "SDES – Observatoire national de la rénovation énergétique"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Parc locatif privé",
                  "value": 13.8
                },
                {
                  "label": "Propriétaires occupants",
                  "value": 14
                },
                {
                  "label": "Parc social",
                  "value": 5.8
                },
                {
                  "label": "Ensemble des résidences",
                  "value": 12.7
                }
              ]
            }
          },
          {
            "value": "environ +25 %",
            "label": "Hausse estimée de la probabilité annuelle qu’un logement classé G soit mis en vente depuis l’annonce de l’interdiction de le louer. La probabilité qu’il soit remis en location dans les deux ans suivant la vente baisse de 10 % (étude universitaire de 2026 citée par la direction générale du Trésor)",
            "date": "Étude de 2026",
            "source": {
              "title": "Trésor-Éco n° 405 – Logement : des tensions structurelles pesant sur l’offre et la mobilité",
              "url": "https://www.tresor.economie.gouv.fr/Articles/572b5c4f-81c1-4879-ba96-50962e878252/files/5b9eadf7-0c49-4398-b111-aa1208d9656e",
              "date": "2026-10",
              "publisher": "Direction générale du Trésor"
            }
          },
          {
            "value": "71 %",
            "label": "des ménages en situation de vulnérabilité énergétique vivent dans un logement classé E, F ou G, contre 36 % de l’ensemble des ménages. Ces 4 815 000 ménages (17,4 % du total) ont des dépenses d’énergie théoriques pour leur logement, calculées à partir du DPE, supérieures à 9,2 % de leur revenu disponible (France métropolitaine)",
            "date": "2021 (étude publiée en avril 2025)",
            "source": {
              "title": "Près de 5 millions de ménages en situation de vulnérabilité énergétique pour leur logement en 2021 – Insee Analyses n° 106",
              "url": "https://www.insee.fr/fr/statistiques/8382704",
              "date": "2025-04-03",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "En vulnérabilité énergétique",
                  "value": 71
                },
                {
                  "label": "Ensemble des ménages",
                  "value": 36
                }
              ]
            }
          },
          {
            "value": "3,6 Md€",
            "label": "Budget 2026 de MaPrimeRénov’, la subvention de l’État à la rénovation, pour au moins 120 000 rénovations d’ampleur (globales) et 150 000 rénovations par geste (travaux ponctuels). Les dossiers en attente depuis fin 2025 devaient reprendre à la promulgation de la loi de finances 2026",
            "date": "2026",
            "source": {
              "title": "MaPrimeRénov’ : réouverture du guichet à la promulgation de la loi de finances",
              "url": "https://www.ecologie.gouv.fr/presse/maprimerenov-reouverture-du-guichet-promulgation-loi-finances",
              "date": "2026-02-06",
              "publisher": "Ministère de la Transition écologique (communiqué de presse)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "logement-3-a",
          "text": "Lever les interdictions de louer liées au diagnostic énergétique, qui deviendrait une simple information"
        },
        {
          "id": "logement-3-b",
          "text": "Suspendre pendant quelques années ces interdictions de louer, le temps de relancer l’offre locative"
        },
        {
          "id": "logement-3-c",
          "text": "Réduire les subventions publiques à la rénovation, en les remplaçant au besoin par des prêts à taux zéro"
        },
        {
          "id": "logement-3-d",
          "text": "Stabiliser les règles et les aides à la rénovation pendant cinq ans, par une loi de programmation"
        },
        {
          "id": "logement-3-e",
          "text": "Garder les interdictions de louer et lancer un plan public de rénovation massive des logements"
        }
      ]
    },
    {
      "id": "logement-4",
      "topicId": "logement",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Que faire de l’obligation de logements sociaux imposée aux communes ?",
      "context": "Aujourd’hui : la loi impose à la plupart des communes de plus de 3 500 habitants (1 500 en Île-de-France) d’atteindre 20 ou 25 % de logements sociaux, sous peine de pénalités.",
      "explainer": {
        "summary": "Depuis 2000, la loi impose aux communes urbaines une part minimale de logements sociaux, sous peine d’un prélèvement financier, puis de sanctions plus lourdes si le retard persiste. Pour les uns, c’est un levier de mixité sociale et de logements abordables ; pour les autres, une règle trop uniforme face aux contraintes locales (terrains disponibles, demande, choix des élus).",
        "points": [
          {
            "text": "La règle vise les communes de plus de 3 500 habitants (1 500 dans l’agglomération parisienne) situées dans une agglomération ou une intercommunalité de plus de 50 000 habitants comptant au moins une commune de plus de 15 000 habitants. Elles doivent atteindre 25 % de logements sociaux parmi leurs résidences principales, ou 20 % là où le logement est moins tendu. Une commune sous ce taux paie chaque année un prélèvement sur ses ressources, calculé selon sa richesse fiscale et son retard ; elle peut en déduire ses dépenses en faveur du logement social.",
            "source": {
              "title": "L’article 55 de la loi solidarité et renouvellement urbain (SRU)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/larticle-55-loi-solidarite-renouvellement-urbain-sru",
              "date": "Date affichée : 2 septembre 2024 (contenu complété en 2026)",
              "publisher": "Ministère chargé du Logement"
            }
          },
          {
            "text": "Sont comptés les logements HLM, les autres logements conventionnés avec l’État et réservés sous conditions de ressources, les logements-foyers (personnes âgées ou handicapées, jeunes travailleurs, travailleurs migrants, résidences sociales) et certaines places d’hébergement. Deux formes d’accession aidée à la propriété comptent aussi. Le bail réel solidaire compte depuis 2019 : le ménage achète le logement sans le terrain, ce qui en réduit le prix. La location-accession compte dès la signature du contrat, puis pendant cinq ans après l’achat.",
            "source": {
              "title": "Article L302-5 du code de la construction et de l’habitation",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038833969",
              "date": "Version en vigueur depuis le 1er janvier 2023",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Tous les trois ans, l’État fixe aux communes en retard des objectifs de rattrapage, puis en fait le bilan. Une commune qui ne les atteint pas peut être déclarée « carencée » par le préfet, après avis d’une commission nationale. Son prélèvement peut alors être majoré, et ses opérations de logements de taille significative doivent compter au moins 30 % de logements sociaux PLUS et PLAI (classiques et très sociaux). Une loi du 21 février 2022 a donné une portée juridique nouvelle aux contrats de mixité sociale, conclus entre l’État et les collectivités pour adapter le dispositif aux territoires.",
            "source": {
              "title": "L’article 55 de la loi solidarité et renouvellement urbain (SRU)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/larticle-55-loi-solidarite-renouvellement-urbain-sru",
              "date": "Date affichée : 2 septembre 2024 (contenu complété en 2026)",
              "publisher": "Ministère chargé du Logement"
            }
          }
        ],
        "figures": [
          {
            "value": "1 276",
            "label": "communes soumises à l’obligation n’atteignent pas leur taux cible de 20 ou 25 %, soit 58 % des 2 196 communes concernées ; 891 (41 %) l’atteignent ou le dépassent. Par ailleurs, 121 communes sont exemptées pour 2026-2028",
            "date": "2024",
            "source": {
              "title": "L’article 55 de la loi solidarité et renouvellement urbain (SRU)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/larticle-55-loi-solidarite-renouvellement-urbain-sru",
              "date": "Date affichée : 2 septembre 2024 (contenu complété en 2026)",
              "publisher": "Ministère chargé du Logement"
            },
            "chart": {
              "kind": "part",
              "value": 1276,
              "total": 2196,
              "whole": "communes concernées"
            }
          },
          {
            "value": "141 M€",
            "label": "Prélèvement payé par les communes sous leur taux cible, après déduction de leurs dépenses pour le logement social (240 M€ avant déduction). Il comprend 68 M€ de majorations pour les communes carencées",
            "date": "2024",
            "source": {
              "title": "L’article 55 de la loi solidarité et renouvellement urbain (SRU)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/larticle-55-loi-solidarite-renouvellement-urbain-sru",
              "date": "Date affichée : 2 septembre 2024 (contenu complété en 2026)",
              "publisher": "Ministère chargé du Logement"
            },
            "chart": {
              "kind": "compare",
              "unit": "M€",
              "items": [
                {
                  "label": "Avant déduction",
                  "value": 240
                },
                {
                  "label": "Après déduction",
                  "value": 141
                }
              ]
            }
          },
          {
            "value": "341",
            "label": "communes déclarées carencées à l’issue du bilan triennal 2020-2022, le dernier publié par le ministère",
            "date": "Bilan 2020-2022 (conduit en 2023)",
            "source": {
              "title": "L’article 55 de la loi solidarité et renouvellement urbain (SRU)",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/larticle-55-loi-solidarite-renouvellement-urbain-sru",
              "date": "Date affichée : 2 septembre 2024 (contenu complété en 2026)",
              "publisher": "Ministère chargé du Logement"
            }
          },
          {
            "value": "8 %",
            "label": "Taux d’attribution des logements sociaux (attributions rapportées aux demandes actives) dans les zones tendues (A bis, A et B1 du zonage officiel du logement), contre 14 % dans les zones détendues. Données de l’Agence nationale de contrôle du logement social (Ancols) citées par la direction générale du Trésor",
            "date": "2024",
            "source": {
              "title": "Trésor-Éco n° 405 – Logement : des tensions structurelles pesant sur l’offre et la mobilité",
              "url": "https://www.tresor.economie.gouv.fr/Articles/572b5c4f-81c1-4879-ba96-50962e878252/files/5b9eadf7-0c49-4398-b111-aa1208d9656e",
              "date": "2026-10",
              "publisher": "Direction générale du Trésor"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Zones tendues",
                  "value": 8
                },
                {
                  "label": "Zones détendues",
                  "value": 14
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "logement-4-a",
          "text": "Supprimer l’obligation de logements sociaux par commune et rendre la décision aux maires"
        },
        {
          "id": "logement-4-b",
          "text": "Remplacer le pourcentage imposé par des objectifs de construction de logements fixés selon les besoins"
        },
        {
          "id": "logement-4-c",
          "text": "Garder l’obligation, mais y compter aussi les logements vendus à prix réduit aux ménages modestes"
        },
        {
          "id": "logement-4-d",
          "text": "Garder l’obligation et rendre inéligibles les maires des communes qui ne la respectent pas"
        },
        {
          "id": "logement-4-e",
          "text": "Relever l’obligation à 30 % de logements sociaux, en y incluant des résidences pour étudiants"
        },
        {
          "id": "logement-4-f",
          "text": "Garder l’obligation actuelle et alourdir les pénalités des communes qui ne la respectent pas"
        }
      ]
    },
    {
      "id": "solidarites-2",
      "topicId": "solidarites",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour la politique familiale ?",
      "context": "Aujourd’hui : les allocations familiales sont versées à partir du deuxième enfant et réduites pour les hauts revenus depuis 2015 ; la fécondité est d’environ 1,6 enfant par femme.",
      "explainer": {
        "summary": "La politique familiale combine des prestations (allocations familiales, aides à la garde), un avantage fiscal lié aux enfants (le quotient familial) et des services comme les crèches. Alors que les naissances reculent, les priorités font débat : aider toutes les familles ou d’abord les plus modestes, verser des prestations ou développer l’offre de garde, soutenir la natalité ou réduire en priorité la pauvreté des enfants.",
        "points": [
          {
            "text": "Le quotient familial réduit l’impôt sur le revenu selon le nombre d’enfants. Un couple marié ou pacsé a 2 parts, plus une demi-part pour chacun des 2 premiers enfants à charge, puis une part entière à partir du 3e. Le gain d’impôt est plafonné à 1 807 € par demi-part supplémentaire.",
            "source": {
              "title": "Impôt sur le revenu - Quotient familial d’un couple marié ou pacsé",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2705",
              "date": "2026-04-15",
              "publisher": "Service-public.gouv.fr (DILA)"
            }
          },
          {
            "text": "La pension alimentaire versée pour un enfant mineur est déductible du revenu imposable du parent qui la verse, sauf si l’enfant est déjà pris en compte dans son impôt (par exemple en résidence alternée). En contrepartie, le parent qui a l’enfant à charge doit déclarer cette pension à l’impôt sur le revenu.",
            "source": {
              "title": "Je verse une pension alimentaire à mes enfants mineurs. Que puis-je déduire ?",
              "url": "https://www.impots.gouv.fr/particulier/questions/je-verse-une-pension-alimentaire-mes-enfants-mineurs-que-puis-je-deduire",
              "date": "2026-07-07",
              "publisher": "impots.gouv.fr (DGFiP)"
            }
          },
          {
            "text": "Depuis janvier 2025, les communes sont l’« autorité organisatrice » de l’accueil du jeune enfant. En 2022, les assistantes maternelles et les crèches ou autres établissements d’accueil assuraient 91 % de l’accueil des moins de 3 ans ; le reste relevait de l’école maternelle et de la garde à domicile.",
            "source": {
              "title": "Amélioration de l’accessibilité aux modes d’accueil des jeunes enfants entre 2017 et 2022 (Études et Résultats n° 1371)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260521-laccessibilite-modes-accueil-jeunes-enfants",
              "date": "2026-05-21",
              "publisher": "DREES"
            }
          }
        ],
        "figures": [
          {
            "value": "1,56",
            "label": "Nombre moyen d’enfants par femme (indicateur conjoncturel de fécondité) en France en 2025, contre 1,61 en 2024 (estimations de janvier 2026) : il faut remonter à la fin de la Première Guerre mondiale pour retrouver un niveau aussi bas. Les naissances de 2025 étaient alors estimées à 645 000 ; à champ constant (France hors Mayotte), elles sont inférieures de 23,6 % à leur niveau de 2010.",
            "date": "2025 (bilan démographique publié le 13 janvier 2026)",
            "source": {
              "title": "Bilan démographique 2025 – Insee Première n° 2087",
              "url": "https://www.insee.fr/fr/statistiques/8719824",
              "date": "2026-01-13",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "enfants par femme",
              "items": [
                {
                  "label": "2024",
                  "value": 1.61
                },
                {
                  "label": "2025",
                  "value": 1.56
                }
              ]
            }
          },
          {
            "value": "152,25 €",
            "label": "Allocations familiales mensuelles (montant de base) pour une famille de 2 enfants dont les ressources annuelles de 2024 sont de 79 980 € ou moins, contre 76,13 € entre 79 980 € et 106 604 €, et 38,07 € au-delà de 106 604 €. Elles sont versées à partir du 2e enfant",
            "date": "2026",
            "source": {
              "title": "Allocations familiales (famille de 2 enfants ou plus)",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F13213",
              "date": "2026-06-01",
              "publisher": "Service-public.gouv.fr (DILA)"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Jusqu’à 79 980 €",
                  "value": 152.25
                },
                {
                  "label": "De 79 980 € à 106 604 €",
                  "value": 76.13
                },
                {
                  "label": "Plus de 106 604 €",
                  "value": 38.07
                }
              ]
            }
          },
          {
            "value": "60,3",
            "label": "Places d’accueil (assistantes maternelles, crèches et autres établissements, école maternelle, garde à domicile) pour 100 enfants de moins de 3 ans en 2022, en France hors Mayotte, contre 58,9 en 2017. Cette hausse s’explique par la baisse du nombre d’enfants (−6,6 %), plus forte que celle du nombre de places (−3,4 %)",
            "date": "2022",
            "source": {
              "title": "Amélioration de l’accessibilité aux modes d’accueil des jeunes enfants entre 2017 et 2022 (Études et Résultats n° 1371)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260521-laccessibilite-modes-accueil-jeunes-enfants",
              "date": "2026-05-21",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "series",
              "unit": "places pour 100 enfants",
              "items": [
                {
                  "label": "2017",
                  "value": 58.9
                },
                {
                  "label": "2022",
                  "value": 60.3
                }
              ]
            }
          },
          {
            "value": "34,0 %",
            "label": "Taux de pauvreté des personnes vivant dans une famille monoparentale en 2024, en France métropolitaine, contre 14,3 % pour les couples avec enfant(s) et 15,4 % pour l’ensemble de la population. Le seuil de pauvreté, fixé à 60 % du niveau de vie médian, correspond à 1 337 € par mois pour une personne seule",
            "date": "2024",
            "source": {
              "title": "Niveau de vie et pauvreté en 2024 (Insee Première n° 2117)",
              "url": "https://www.insee.fr/fr/statistiques/9019316",
              "date": "2026-07-09",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Familles monoparentales",
                  "value": 34
                },
                {
                  "label": "Couples avec enfant(s)",
                  "value": 14.3
                },
                {
                  "label": "Ensemble de la population",
                  "value": 15.4
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "solidarites-2-a",
          "text": "Verser des allocations familiales dès le premier enfant, à toutes les familles quels que soient leurs revenus"
        },
        {
          "id": "solidarites-2-b",
          "text": "Augmenter l’avantage fiscal accordé pour chaque enfant (quotient familial), surtout dès le deuxième"
        },
        {
          "id": "solidarites-2-c",
          "text": "Aider en priorité les familles monoparentales : pensions alimentaires défiscalisées et versées sans délai"
        },
        {
          "id": "solidarites-2-d",
          "text": "Créer beaucoup plus de places en crèche et former massivement des professionnels de la petite enfance"
        },
        {
          "id": "solidarites-2-e",
          "text": "Bâtir un service public gratuit de la petite enfance, en réservant l’argent public aux crèches non lucratives"
        },
        {
          "id": "solidarites-2-f",
          "text": "Mieux préparer à la parentalité : maisons des parents, consultation de fertilité remboursée vers 20 ans"
        }
      ]
    },
    {
      "id": "solidarites-3",
      "topicId": "solidarites",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle réforme pour la protection de l’enfance ?",
      "context": "Aujourd’hui : l’aide sociale à l’enfance (ASE), qui prend en charge notamment les enfants placés hors de leur famille, est gérée par les départements.",
      "explainer": {
        "summary": "L’aide sociale à l’enfance (ASE) protège les enfants en danger ou risquant de l’être, par un suivi éducatif dans leur famille ou en les confiant à une famille d’accueil ou à un établissement. Alors que le nombre d’enfants suivis et les dépenses augmentent, le débat porte sur le pilotage et le contrôle de ce service (État ou départements), ses moyens, la place du maintien dans la famille et le statut des structures d’accueil.",
        "points": [
          {
            "text": "Les départements mettent en œuvre les mesures, mais la plupart sont décidées par un juge. Fin 2024, c’était le cas de 79 % des mesures d’accueil et de 70 % des actions éducatives (suivi de l’enfant dans sa famille).",
            "source": {
              "title": "L’aide sociale à l’enfance. Bénéficiaires, mesures et dépenses départementales associées - Édition 2026 (Les Dossiers de la DREES n° 138)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/les-dossiers-de-la-drees/260630-aide-sociale-enfance-2026",
              "date": "2026-06-30",
              "publisher": "DREES"
            }
          },
          {
            "text": "Un projet de loi du gouvernement relatif à la protection des enfants a été adopté en première lecture par l’Assemblée nationale le 21 juillet 2026, puis transmis au Sénat le 22 juillet : ce n’est pas encore une loi. Le texte permettrait au préfet de faire contrôler à tout moment, y compris sans prévenir, les établissements et lieux d’accueil. Il interdirait aussi d’autoriser une structure privée à but lucratif à accueillir des enfants confiés à l’ASE.",
            "source": {
              "title": "Projet de loi relatif à la protection des enfants (dossier législatif)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/projet_de_loi_relatif_a_la_protection_des_enfants",
              "date": "2026-07-22",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "text": "Depuis février 2024, la loi du 7 février 2022 impose que les enfants confiés à l’ASE soient accueillis par des personnes ou des établissements autorisés. Par exception, en urgence ou pour une mise à l’abri, ils peuvent être hébergés deux mois au plus dans d’autres structures d’hébergement. Cette exception ne s’applique pas aux mineurs en situation de handicap.",
            "source": {
              "title": "Loi n° 2022-140 du 7 février 2022 relative à la protection des enfants",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045133771",
              "date": "2022-02-08",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "392 600",
            "label": "Mineurs et jeunes majeurs bénéficiant d’au moins une mesure d’aide sociale à l’enfance fin 2024 (+1,5 % en un an), soit 2,4 % des moins de 21 ans. 224 700 relèvent d’une mesure d’accueil et 180 800 d’une action éducative, certains cumulant les deux",
            "date": "fin 2024",
            "source": {
              "title": "Fin 2024, 392 600 enfants et jeunes de moins de 21 ans bénéficient d’une mesure d’aide sociale à l’enfance",
              "url": "https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/fin-2024-392-600-enfants-et-jeunes-de-moins-de",
              "date": "2026-04-20",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "part",
              "value": 2.4,
              "total": 100,
              "unit": "%",
              "whole": "des moins de 21 ans"
            }
          },
          {
            "value": "35 %",
            "label": "Part des enfants confiés à l’ASE accueillis chez une assistante familiale (famille d’accueil) fin 2024, contre 40 % en établissement et 25 % selon d’autres modalités",
            "date": "fin 2024",
            "source": {
              "title": "Fin 2024, 392 600 enfants et jeunes de moins de 21 ans bénéficient d’une mesure d’aide sociale à l’enfance",
              "url": "https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/fin-2024-392-600-enfants-et-jeunes-de-moins-de",
              "date": "2026-04-20",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Assistante familiale",
                  "value": 35
                },
                {
                  "label": "Établissement",
                  "value": 40
                },
                {
                  "label": "Autres modalités",
                  "value": 25
                }
              ]
            }
          },
          {
            "value": "11,7 Md€",
            "label": "Dépenses des départements pour la protection de l’enfance en 2024, rémunération des assistants familiaux comprise (hors autres dépenses de personnel) : +6,7 % par rapport à 2023, et +4,6 % hors inflation. Entre 1998 et 2024, les dépenses totales d’ASE ont été multipliées par 2,7 (+78 % hors inflation) et le nombre de mesures par 1,5",
            "date": "2024",
            "source": {
              "title": "L’aide sociale à l’enfance. Bénéficiaires, mesures et dépenses départementales associées - Édition 2026 (Les Dossiers de la DREES n° 138)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/les-dossiers-de-la-drees/260630-aide-sociale-enfance-2026",
              "date": "2026-06-30",
              "publisher": "DREES"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "solidarites-3-a",
          "text": "Confier l’aide sociale à l’enfance à l’État, à la place des départements, avec des inspections inopinées"
        },
        {
          "id": "solidarites-3-b",
          "text": "Laisser la gestion aux départements, sous un contrôle indépendant qui sanctionne les défaillances"
        },
        {
          "id": "solidarites-3-c",
          "text": "Faire de la protection de l’enfance la première priorité de l’action publique pendant cinq ans"
        },
        {
          "id": "solidarites-3-d",
          "text": "Réduire le nombre de placements d’enfants hors de leur famille et mieux encadrer les services sociaux"
        },
        {
          "id": "solidarites-3-e",
          "text": "Inscrire la protection de l’enfance dans la Constitution, avec un service entièrement public"
        }
      ]
    },
    {
      "id": "egalite-1",
      "topicId": "egalite",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle priorité pour lutter contre les violences sexistes et sexuelles faites aux femmes et aux enfants ?",
      "context": "Aujourd’hui : l’Assemblée examine une proposition de loi d’ensemble contre ces violences ; le gouvernement annonce 1,5 milliard d’euros, les associations en réclament environ 3 milliards par an.",
      "explainer": {
        "summary": "Les violences sexuelles enregistrées par la police et la gendarmerie augmentent, mais peu de victimes portent plainte et, hors du couple, la majorité des affaires de viol ou d’agression sexuelle sont classées faute d’auteur identifié ou d’infraction suffisamment caractérisée. La question divise sur la priorité : moyens pour la prévention et l’accompagnement, police et justice spécialisées, peines et contrôles plus sévères, éloignement des condamnés étrangers, ou réponses d’abord sociales.",
        "points": [
          {
            "text": "Une proposition de loi déposée le 11 août 2026 prévoit des juridictions et des juges spécialisés, des unités d’enquête dédiées à ces violences et une autorité indépendante chargée de les combattre. Le gouvernement a engagé la procédure accélérée le 25 septembre ; l’examen en séance à l’Assemblée nationale a commencé le 1er octobre 2026.",
            "source": {
              "title": "Apporter une réponse intégrale au phénomène des violences sexuelles et sexistes contre les femmes et les enfants (dossier législatif)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N54776",
              "date": "2026-10-01",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "text": "Le juge peut déjà prononcer une interdiction du territoire français, en plus de la peine principale, à titre définitif ou pour dix ans au plus, contre un étranger coupable d’un crime (le viol en est un) ou d’un délit puni d’au moins trois ans de prison. Il doit tenir compte de la durée de sa présence en France et de ses liens avec le pays.",
            "source": {
              "title": "Code pénal, article 131-30 (version en vigueur depuis le 28 janvier 2024)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049050734",
              "date": "2024-01-28",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Les professionnels et bénévoles de la protection de l’enfance, de l’accueil du jeune enfant et des établissements pour enfants handicapés doivent fournir une attestation d’honorabilité. Elle vérifie qu’aucune condamnation inscrite au casier judiciaire ou au fichier des auteurs d’infractions sexuelles ou violentes ne leur interdit de travailler auprès de mineurs. Depuis septembre 2024, 1 178 602 attestations ont été délivrées et 7 102 personnes se la sont vu refuser.",
            "source": {
              "title": "Contrôle des antécédents judiciaires : attestation d’honorabilité",
              "url": "https://solidarites.gouv.fr/controle-des-antecedents-judiciaires-attestation-honorabilite",
              "date": "2026-09-01",
              "publisher": "Ministère du Travail et des Solidarités"
            }
          }
        ],
        "figures": [
          {
            "value": "132 300",
            "label": "victimes de violences sexuelles enregistrées par la police et la gendarmerie nationales en 2025, dont 76 200 mineures (58 %). Le nombre a augmenté de 8 % en un an, une hausse que le service statistique du ministère de l’Intérieur situe dans un contexte de libération de la parole et de meilleur accueil des victimes.",
            "date": "2025",
            "source": {
              "title": "Victimes de violences physiques et sexuelles enregistrées : en hausse en 2025, en particulier pour les violences physiques envers les mineurs (Interstats Analyse)",
              "url": "https://statistiques.interieur.gouv.fr/ssmsi/publications/victimes-de-violences-physiques-et-sexuelles-enregistrees-en-hausse-en-2025-en",
              "date": "2026-02-27",
              "publisher": "SSMSI (ministère de l’Intérieur)"
            },
            "chart": {
              "kind": "part",
              "value": 76200,
              "total": 132300,
              "whole": "victimes de violences sexuelles enregistrées"
            }
          },
          {
            "value": "7 %",
            "label": "des femmes de 18 ans et plus victimes de viol, de tentative de viol ou d’agression sexuelle en 2023 disent avoir porté plainte. Elles sont 277 000 à se déclarer victimes (enquête du ministère de l’Intérieur auprès des personnes vivant en logement ordinaire en France hexagonale, Guadeloupe, Martinique et à La Réunion).",
            "date": "2023",
            "source": {
              "title": "Lettre n° 25 de l’Observatoire national des violences faites aux femmes : les violences sexistes et sexuelles en France en 2024 (d’après l’enquête Vécu et ressenti en matière de sécurité du SSMSI)",
              "url": "https://arretonslesviolences.gouv.fr/sites/default/files/2025-11/Lettre-violences-sexistes-et-sexuelles-en-2024-novembre-2025.pdf",
              "date": "2025-11",
              "publisher": "Observatoire national des violences faites aux femmes (Miprof)"
            },
            "chart": {
              "kind": "part",
              "value": 7,
              "total": 100,
              "unit": "%",
              "whole": "des femmes victimes de violences sexuelles"
            }
          },
          {
            "value": "60 %",
            "label": "des personnes mises en cause pour viol, agression ou atteinte sexuelle hors du couple, dans une affaire avec au moins une victime majeure, ont vu leur affaire classée sans suite car non poursuivable : auteur non identifié ou infraction insuffisamment caractérisée (9 564 sur 15 814 en 2024, France hors COM). Ce taux est de 71 % quand au moins une victime est mineure. Quand l’affaire était poursuivable, 85 % des personnes mises en cause ont été poursuivies en justice.",
            "date": "2024",
            "source": {
              "title": "Lettre n° 25 de l’Observatoire national des violences faites aux femmes : les violences sexistes et sexuelles en France en 2024 (données ministère de la Justice, SSER)",
              "url": "https://arretonslesviolences.gouv.fr/sites/default/files/2025-11/Lettre-violences-sexistes-et-sexuelles-en-2024-novembre-2025.pdf",
              "date": "2025-11",
              "publisher": "Observatoire national des violences faites aux femmes (Miprof)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Au moins une victime majeure",
                  "value": 60
                },
                {
                  "label": "Au moins une victime mineure",
                  "value": 71
                }
              ]
            }
          },
          {
            "value": "8 953",
            "label": "condamnations définitives pour violences sexuelles inscrites au casier judiciaire en 2024 (France hors COM), dont 1 665 pour viol. 86 % comportaient une peine de prison, dont 49 % ferme ou en partie ferme ; pour le viol, ces parts sont de 99 % et 89 %. 20 % des condamnés étaient en récidive ou en réitération, c’est-à-dire déjà condamnés auparavant, pour des faits de même nature ou non.",
            "date": "2024",
            "source": {
              "title": "Lettre n° 25 de l’Observatoire national des violences faites aux femmes : les violences sexistes et sexuelles en France en 2024 (données ministère de la Justice, SSER, Casier judiciaire national)",
              "url": "https://arretonslesviolences.gouv.fr/sites/default/files/2025-11/Lettre-violences-sexistes-et-sexuelles-en-2024-novembre-2025.pdf",
              "date": "2025-11",
              "publisher": "Observatoire national des violences faites aux femmes (Miprof)"
            },
            "chart": {
              "kind": "part",
              "value": 1665,
              "total": 8953,
              "whole": "condamnations pour violences sexuelles"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "egalite-1-a",
          "text": "Porter les moyens publics au niveau réclamé par les associations, en priorité pour la prévention, l’hébergement et la formation"
        },
        {
          "id": "egalite-1-b",
          "text": "Spécialiser la police et la justice sur ces violences, avec des unités et juridictions dédiées, pour traiter vite chaque plainte"
        },
        {
          "id": "egalite-1-c",
          "text": "Alourdir les peines des auteurs et contrôler systématiquement les antécédents des adultes qui travaillent auprès d’enfants"
        },
        {
          "id": "egalite-1-d",
          "text": "Interdire définitivement le territoire français à tout étranger condamné pour des violences sexuelles, sans exception"
        },
        {
          "id": "egalite-1-e",
          "text": "Privilégier des réponses sociales plutôt que pénales : commissions indépendantes sur les lieux de travail, logement et revenus pour les victimes"
        }
      ]
    },
    {
      "id": "egalite-2",
      "topicId": "egalite",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour le partage des responsabilités familiales ?",
      "context": "Aujourd’hui : depuis juillet 2026, chaque parent peut prendre, s’il le souhaite, un congé de naissance d’un ou deux mois après le congé de maternité ou de paternité.",
      "explainer": {
        "summary": "L’écart de salaire entre femmes et hommes tient pour une grande part au temps de travail, dont le temps partiel, et aux emplois occupés ; le partage des congés et de la garde des enfants fait partie des leviers débattus. Faut-il que l’État intervienne davantage (part du congé réservée à chaque parent, accueil des jeunes enfants, aide aux parents seuls) ou qu’il laisse chaque famille libre de s’organiser ?",
        "points": [
          {
            "text": "Le congé de maternité dure 16 semaines pour un premier ou un deuxième enfant : 6 avant la naissance, 10 après. Au moins 8 semaines sont obligatoires, dont 6 après l’accouchement.",
            "source": {
              "title": "Congé de maternité d’une salariée du secteur privé",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2265",
              "date": "2026-06-01",
              "publisher": "Service-public.fr (DILA)"
            }
          },
          {
            "text": "Depuis le 1er janvier 2023, le versement des pensions alimentaires passe automatiquement par la Caf (ou la MSA) pour toute séparation : c’est l’« intermédiation financière ». L’organisme collecte la pension chaque mois auprès du parent qui la doit et la reverse à l’autre parent. Il doit recouvrer rapidement, dès le premier mois, les éventuels impayés. Ce service est gratuit.",
            "source": {
              "title": "Intermédiation financière des pensions alimentaires",
              "url": "https://solidarites.gouv.fr/intermediation-financiere-des-pensions-alimentaires",
              "date": "2023-02-09",
              "publisher": "Ministère chargé des Solidarités (solidarites.gouv.fr)"
            }
          },
          {
            "text": "Un parent qui arrête ou réduit son activité pour s’occuper d’un enfant de moins de 3 ans peut toucher la prestation partagée d’éducation de l’enfant (PreParE). Elle est de 459,70 € par mois en cas d’arrêt total, de 297,17 € pour un temps partiel à 50 % au plus et de 171,42 € entre 50 % et 80 %. Pour un couple avec un enfant, chaque parent peut la recevoir 6 mois, jusqu’au premier anniversaire de l’enfant. À partir de deux enfants, chaque parent peut la recevoir jusqu’à 24 mois, jusqu’aux 3 ans du plus jeune.",
            "source": {
              "title": "Prestation partagée d’éducation de l’enfant (PreParE)",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F32485",
              "date": "2026-06-01",
              "publisher": "Service-public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "21,8 %",
            "label": "écart de revenu salarial annuel moyen entre femmes et hommes dans le secteur privé en 2024 (22 060 € contre 28 220 €), tous temps de travail confondus (France hors Mayotte) ; il s’est réduit d’un tiers depuis 1995. À temps de travail égal, l’écart est de 14,0 %. Pour un même emploi dans le même établissement, il est de 3,6 % (estimation sur 25 % des établissements, qui représentent 40 % des emplois en équivalent temps plein). Selon l’Insee, ce dernier écart ne mesure pas au sens strict la discrimination : il ne tient pas compte de l’expérience, de l’ancienneté ou du diplôme, qui peuvent l’amplifier comme l’atténuer.",
            "date": "2024",
            "source": {
              "title": "Écart de salaire entre femmes et hommes en 2024 (Insee Focus n° 377)",
              "url": "https://www.insee.fr/fr/statistiques/8743657",
              "date": "2026-02-26",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "€ par an",
              "items": [
                {
                  "label": "Femmes",
                  "value": 22060
                },
                {
                  "label": "Hommes",
                  "value": 28220
                }
              ]
            }
          },
          {
            "value": "70 %",
            "label": "du salaire net : indemnisation du premier mois de congé supplémentaire de naissance, puis 60 % le second mois, dans la limite de 4 005 € par mois. Chaque parent peut choisir de prendre 1 ou 2 mois, en même temps que l’autre parent ou en alternance. Ce congé existe depuis le 1er juillet 2026, pour les enfants nés à partir du 1er janvier 2026.",
            "date": "2026-07-01",
            "source": {
              "title": "Congé supplémentaire de naissance d’un salarié du secteur privé",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F39685",
              "date": "2026-06-03",
              "publisher": "Service-public.fr (DILA)"
            }
          },
          {
            "value": "25 jours",
            "label": "durée du congé de paternité et d’accueil de l’enfant (secteur privé, un enfant). Il est ouvert au père ou à la personne qui vit en couple avec la mère. Quatre jours sont obligatoires et se prennent juste après les 3 jours ouvrables du congé de naissance.",
            "date": "2026",
            "source": {
              "title": "Congé de paternité et d’accueil de l’enfant d’un salarié du secteur privé",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F3156",
              "date": "2026-06-01",
              "publisher": "Service-public.fr (DILA)"
            }
          },
          {
            "value": "56 %",
            "label": "des enfants de moins de 3 ans sont gardés principalement par leurs parents en semaine (France métropolitaine, 2021). Si chaque famille avait obtenu son premier choix, cette part serait de 36 % (simulation). Les enfants accueillis surtout en crèche ou dans un autre établissement passeraient alors de 18 % à 35 %, et ceux gardés surtout par une assistante maternelle de 20 % à 23 %.",
            "date": "2021",
            "source": {
              "title": "La part des enfants de moins de 3 ans confiés principalement à une assistante maternelle ou une crèche a presque doublé entre 2002 et 2021 (Études et résultats n° 1257)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/la-part-des-enfants-de-moins-de-3-ans-confies",
              "date": "2023-02-14",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Situation en 2021",
                  "value": 56
                },
                {
                  "label": "Simulation : premier choix",
                  "value": 36
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "egalite-2-a",
          "text": "Aligner le congé du second parent sur le congé de maternité, en durée comme en caractère obligatoire"
        },
        {
          "id": "egalite-2-b",
          "text": "Allonger nettement le congé parental, mieux le rémunérer et en réserver une part à chaque parent"
        },
        {
          "id": "egalite-2-c",
          "text": "Prolonger le congé de naissance et laisser les parents choisir librement lequel des deux le prend"
        },
        {
          "id": "egalite-2-d",
          "text": "Faciliter la reprise du travail après un congé parental, par un temps partiel payé à taux plein"
        },
        {
          "id": "egalite-2-e",
          "text": "Soutenir en priorité les parents seuls : versement automatique des pensions alimentaires, aide à la garde"
        },
        {
          "id": "egalite-2-f",
          "text": "Confier à des services publics gratuits la garde des enfants et une large part des tâches domestiques"
        }
      ]
    },
    {
      "id": "egalite-3",
      "topicId": "egalite",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment agir sur les écarts de salaire et de retraite entre les femmes et les hommes ?",
      "context": "Aujourd’hui : dans le secteur privé, les femmes gagnent en moyenne 21,8 % de moins que les hommes, et environ 14 % de moins à temps de travail égal (Insee, 2024).",
      "explainer": {
        "summary": "Dans le secteur privé, l’écart de salaire entre femmes et hommes se réduit depuis 1995 mais persiste : il tient surtout au temps de travail, aux métiers et aux employeurs, augmente avec le nombre d’enfants et se retrouve, plus marqué, dans les retraites. La question divise sur le levier : obligations et sanctions pour les entreprises, transparence, revalorisation de métiers, incitations, règles de retraite plus favorables, ou maintien du cadre actuel.",
        "points": [
          {
            "text": "L’index de l’égalité professionnelle est une note sur 100 que déclarent les entreprises d’au moins 50 salariés. En 2026, 30 827 entreprises l’ont déclaré, sur les données de 2025. La note moyenne est de 89, comme en 2025, contre 88 en 2024.",
            "source": {
              "title": "Egapro : statistiques de l’index de l’égalité professionnelle",
              "url": "https://egapro.travail.gouv.fr/stats",
              "date": "2026",
              "publisher": "Ministère du Travail"
            }
          },
          {
            "text": "Le principe « à travail égal, salaire égal » figure dans le code du travail depuis 1972. Un projet de loi présenté en septembre 2026 transpose une directive européenne de 2023 qui le renforce : un an après la promulgation, l’index, créé en 2019, serait remplacé par 7 indicateurs d’écart de salaire à déclarer dès 50 salariés, dont 6 précalculés automatiquement. Un écart injustifié d’au moins 5 % devrait être corrigé, sous peine de pénalité et d’une possible exclusion des marchés publics pendant un an.",
            "source": {
              "title": "Projet de loi portant sur la transposition de la directive sur l’égalité des rémunérations entre les femmes et les hommes (dossier de presse)",
              "url": "https://www.fonction-publique.gouv.fr/files/files/Espace%20Presse/Amiel/DP_PJL_egalite_remuneration_transparence_salariale.pdf",
              "date": "2026-09-10",
              "publisher": "Gouvernement (dossier de presse)"
            }
          },
          {
            "text": "Pour la retraite, le régime général accorde aux mères 4 trimestres de durée d’assurance par enfant (maternité ou adoption), et 4 trimestres par enfant au père ou à la mère pour son éducation. Un parent qui en bénéficie voit sa retraite calculée sur ses 24 meilleures années de salaire (23 à partir de 2 enfants), au lieu de 25.",
            "source": {
              "title": "Comment est calculée la retraite de base du salarié ?",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F21552",
              "date": "2026-09-01",
              "publisher": "Service-public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "3,6 %",
            "label": "écart de salaire net en équivalent temps plein (c’est-à-dire à temps de travail égal) entre femmes et hommes qui occupent le même emploi dans le même établissement (secteur privé, 2024), contre 13,0 % tous emplois confondus sur le même champ (14,0 % sur l’ensemble du privé, en comptant les salaires que certains salariés tirent d’une activité secondaire dans le public). Estimation possible dans 25 % des établissements, qui emploient 40 % des salariés en équivalent temps plein. Selon l’Insee, ce n’est pas au sens strict une mesure de la discrimination : l’expérience, l’ancienneté ou le diplôme, non pris en compte, peuvent amplifier comme atténuer l’écart.",
            "date": "2024",
            "source": {
              "title": "Écart de salaire entre femmes et hommes en 2024 – Insee Focus n° 377",
              "url": "https://www.insee.fr/fr/statistiques/8743657",
              "date": "2026-02-26",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Même emploi, même établissement",
                  "value": 3.6
                },
                {
                  "label": "Tous emplois confondus",
                  "value": 13
                }
              ]
            }
          },
          {
            "value": "28,2 %",
            "label": "écart de salaire net en équivalent temps plein entre mères et pères de trois enfants ou plus (secteur privé, 2022), contre 20,4 % avec deux enfants, 13,6 % avec un enfant et 5,8 % entre femmes et hommes sans enfant",
            "date": "2022",
            "source": {
              "title": "Écart de salaire entre femmes et hommes en 2024 (Insee Focus n° 377), encadré sur le nombre d’enfants",
              "url": "https://www.insee.fr/fr/statistiques/8743657",
              "date": "2026-02-26",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Sans enfant",
                  "value": 5.8
                },
                {
                  "label": "Un enfant",
                  "value": 13.6
                },
                {
                  "label": "Deux enfants",
                  "value": 20.4
                },
                {
                  "label": "Trois enfants ou plus",
                  "value": 28.2
                }
              ]
            }
          },
          {
            "value": "26,6 %",
            "label": "des femmes salariées travaillent à temps partiel en 2025, contre 8,4 % des hommes (France hors Mayotte, hors apprentis). Parmi les salariées à temps partiel, 20,7 % le sont faute d’avoir trouvé un emploi à temps complet et 30,7 % pour s’occuper d’enfants ou de proches.",
            "date": "2025",
            "source": {
              "title": "Temps partiel − Emploi, chômage, revenus du travail (édition 2026)",
              "url": "https://www.insee.fr/fr/statistiques/8733075?sommaire=8733125",
              "date": "2026-07-02",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Femmes salariées",
                  "value": 26.6
                },
                {
                  "label": "Hommes salariés",
                  "value": 8.4
                }
              ]
            }
          },
          {
            "value": "36 %",
            "label": "écart entre la pension de retraite moyenne de droit direct des femmes et celle des hommes fin 2024, hors pension de réversion. En comptant la réversion, l’écart est de 25 %.",
            "date": "2024",
            "source": {
              "title": "Effectifs de retraités et montants des pensions versées : mise à disposition des données 2024",
              "url": "https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/effectifs-de-retraites-et-montants-des",
              "date": "2026-05-26",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Hors réversion",
                  "value": 36
                },
                {
                  "label": "Réversion comprise",
                  "value": 25
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "egalite-3-a",
          "text": "Sanctionner financièrement les employeurs qui ne respectent pas l’égalité salariale, jusqu’à l’exclusion des marchés publics"
        },
        {
          "id": "egalite-3-b",
          "text": "Rendre publics les écarts de salaire de chaque entreprise et réserver les aides publiques à celles qui respectent l’égalité"
        },
        {
          "id": "egalite-3-c",
          "text": "Revaloriser les salaires des métiers surtout exercés par des femmes et limiter le temps partiel imposé par l’employeur"
        },
        {
          "id": "egalite-3-d",
          "text": "Accorder un label et des avantages fiscaux aux entreprises qui garantissent l’égalité salariale entre femmes et hommes"
        },
        {
          "id": "egalite-3-e",
          "text": "Améliorer les retraites des femmes pénalisées par des carrières interrompues, avec des règles de calcul plus favorables"
        },
        {
          "id": "egalite-3-f",
          "text": "Laisser les entreprises s’organiser librement dans le cadre des règles actuelles, sans nouvelle obligation légale",
          "external": true
        }
      ]
    },
    {
      "id": "egalite-4",
      "topicId": "egalite",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle politique pour l’accès à l’interruption volontaire de grossesse (IVG) ?",
      "context": "Aujourd’hui : l’IVG est autorisée jusqu’à 14 semaines de grossesse ; depuis 2024, la Constitution garantit la liberté d’y recourir.",
      "explainer": {
        "summary": "Le nombre d’IVG augmente et leur pratique se déplace de l’hôpital vers la ville, avec des taux de recours très différents selon les territoires. La question divise sur les conditions d’accès : délai légal, clause de conscience, offre de soins de proximité, prévention par la contraception, inscription dans le droit européen, ou maintien du cadre actuel.",
        "points": [
          {
            "text": "Le code de la santé publique autorise l’IVG jusqu’à la fin de la 14e semaine de grossesse, délai fixé par la loi du 2 mars 2022. Elle est pratiquée par un médecin ou une sage-femme. Ceux-ci ne sont jamais tenus de la pratiquer (clause de conscience propre à l’IVG), mais doivent alors en informer sans délai la patiente et lui donner le nom de praticiens qui peuvent la réaliser.",
            "source": {
              "title": "Code de la santé publique, articles L2212-1 à L2212-11 (IVG pratiquée avant la fin de la 14e semaine de grossesse)",
              "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006171542/",
              "date": "2022-03-04",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Pour les moins de 26 ans, l’Assurance maladie prend en charge sans avance de frais les consultations de contraception et les contraceptifs remboursables. Le stérilet et l’implant sont remboursés à 100 %, comme certaines pilules ; à partir de 26 ans, ils le sont à 65 %.",
            "source": {
              "title": "Contraception",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F707",
              "date": "2026-09-28",
              "publisher": "Service-public.fr (DILA)"
            }
          },
          {
            "text": "Le 11 avril 2024, le Parlement européen a demandé, par 336 voix contre 163 et 39 abstentions, d’inscrire le droit à « un avortement sûr et légal » dans la Charte des droits fondamentaux de l’UE. Il rappelle que la santé, y compris sexuelle et reproductive, relève des compétences nationales, et qu’une telle modification de la Charte exigerait l’accord unanime des États membres.",
            "source": {
              "title": "Les femmes doivent avoir le contrôle total de leur santé et de leurs droits sexuels et génésiques (communiqué de presse)",
              "url": "https://www.europarl.europa.eu/news/fr/press-room/20240408IPR20314",
              "date": "2024-04-11",
              "publisher": "Parlement européen"
            }
          }
        ],
        "figures": [
          {
            "value": "259 400",
            "label": "IVG en France en 2025, soit 2,9 % de plus qu’en 2024. Le taux de recours atteint 17,8 IVG pour 1 000 femmes de 15 à 49 ans, contre environ 15 pour 1 000 jusqu’à la fin des années 2010.",
            "date": "2025",
            "source": {
              "title": "50 ans après la loi Veil, un quart des IVG sont réalisées en ville par des sages-femmes en 2025 (Études et résultats n° 1384)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260922-les-interruptions-volontaires-de-grossesse-IVG-en-2025",
              "date": "2026-09-22",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "IVG pour 1 000 femmes",
              "items": [
                {
                  "label": "Années 2010 (environ)",
                  "value": 15
                },
                {
                  "label": "2025",
                  "value": 17.8
                }
              ]
            }
          },
          {
            "value": "1 sur 4",
            "label": "IVG a été réalisée en 2025 par une sage-femme en ville, soit 54 % des IVG pratiquées en ville. Au total, la moitié des IVG ont lieu hors établissement de santé (cabinet libéral, centre de santé ou centre de santé sexuelle).",
            "date": "2025",
            "source": {
              "title": "50 ans après la loi Veil, un quart des IVG sont réalisées en ville par des sages-femmes en 2025 (Études et résultats n° 1384)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260922-les-interruptions-volontaires-de-grossesse-IVG-en-2025",
              "date": "2026-09-22",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "part",
              "value": 1,
              "total": 4,
              "whole": "IVG réalisées en 2025"
            }
          },
          {
            "value": "33,0 ‰",
            "label": "taux de recours à l’IVG (pour 1 000 femmes, à structure d’âge comparable) dans l’ensemble des départements et régions d’outre-mer en 2025, contre 17,0 ‰ en France métropolitaine. En métropole, il va de 12,6 ‰ (Pays de la Loire) à 23,0 ‰ (Provence-Alpes-Côte d’Azur).",
            "date": "2025",
            "source": {
              "title": "50 ans après la loi Veil, un quart des IVG sont réalisées en ville par des sages-femmes en 2025 (Études et résultats n° 1384)",
              "url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/260922-les-interruptions-volontaires-de-grossesse-IVG-en-2025",
              "date": "2026-09-22",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "‰",
              "items": [
                {
                  "label": "Outre-mer (DROM)",
                  "value": 33
                },
                {
                  "label": "France métropolitaine",
                  "value": 17
                }
              ]
            }
          },
          {
            "value": "445",
            "label": "maternités en France en 2024, soit 88 de moins qu’en 2014 (baisse de 16,5 %). Sur la même période, le nombre d’accouchements a baissé de 19,4 %.",
            "date": "2024",
            "source": {
              "title": "Les établissements de santé en 2024, édition 2026 – Fiche 19 : La naissance : les maternités",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-07/ES%202026%20-%20Fiche%2019%20-%20La%20naissance%20-%20les%20maternit%C3%A9s.pdf",
              "date": "2026-07",
              "publisher": "DREES"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Maternités, 2014-2024",
                  "value": -16.5
                },
                {
                  "label": "Accouchements, 2014-2024",
                  "value": -19.4
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "egalite-4-a",
          "text": "Allonger le délai légal pour avorter au-delà des 14 semaines de grossesse aujourd’hui autorisées"
        },
        {
          "id": "egalite-4-b",
          "text": "Supprimer la clause de conscience propre à l’IVG, qui s’ajoute à celle dont disposent déjà tous les médecins"
        },
        {
          "id": "egalite-4-c",
          "text": "Garantir partout un lieu pratiquant l’IVG à proximité, en mettant fin aux fermetures de maternités"
        },
        {
          "id": "egalite-4-d",
          "text": "Conserver le cadre légal actuel de l’IVG, sans allonger les délais ni modifier les conditions d’accès"
        },
        {
          "id": "egalite-4-e",
          "text": "Donner la priorité à l’information sur la contraception, pour prévenir les grossesses non désirées"
        },
        {
          "id": "egalite-4-f",
          "text": "Inscrire le droit à l’avortement dans la Charte des droits fondamentaux de l’Union européenne"
        }
      ]
    },
    {
      "id": "droits_lgbtqia-1",
      "topicId": "droits_lgbtqia",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Faut-il autoriser la gestation pour autrui (GPA) en France ?",
      "context": "Aujourd’hui : la GPA est interdite en France, mais la Cour de cassation a jugé en juillet 2026 que les décisions de filiation prononcées à l’étranger doivent, sous conditions, être reconnues.",
      "explainer": {
        "summary": "La gestation pour autrui (GPA) consiste, pour une femme, à porter un enfant pour d’autres personnes, les « parents d’intention », et à le leur remettre à la naissance. Le débat oppose le désir d’enfant et la liberté des femmes aux risques pour celles qui portent l’enfant et à la difficulté de garantir leur libre consentement ; il porte aussi sur la filiation des enfants nés d’une GPA à l’étranger.",
        "points": [
          {
            "text": "La GPA est interdite en France (article 16-7 du Code civil). Depuis la loi de bioéthique du 2 août 2021, un acte de naissance établi à l’étranger n’est inscrit sur les registres français (« transcrit ») qu’à l’égard du parent biologique ; l’autre parent d’intention doit passer par une adoption. Le 14 novembre 2024, la première chambre civile de la Cour de cassation a admis qu’une filiation établie à l’étranger puisse être reconnue même sans lien biologique ; le procureur général a alors demandé que l’assemblée plénière, formation la plus solennelle de la Cour, se prononce.",
            "source": {
              "title": "États généraux de la bioéthique 2026 : rapport de synthèse (p. 64)",
              "url": "https://www.ccne-ethique.fr/sites/default/files/2026-07/EGB26-RAPPORT-DE-SYNTHESE-2026-NUM-vf.pdf",
              "date": "2026-06",
              "publisher": "Comité consultatif national d’éthique (CCNE)"
            }
          },
          {
            "text": "Le 3 juillet 2026, l’assemblée plénière a jugé que l’interdiction de la GPA, liée à la « sauvegarde de la dignité de la personne humaine », est « un principe essentiel du droit français ». Cet interdit doit toutefois être concilié avec le droit de l’enfant au respect de sa vie privée. Un jugement étranger qui établit la filiation peut donc recevoir l’exequatur, c’est-à-dire produire ses effets en France, s’il permet de vérifier que la femme qui a porté l’enfant a consenti à la convention et à ses effets sur ses droits parentaux. La filiation est alors « reconnue en tant que telle en France », sans adoption.",
            "source": {
              "title": "Cour de cassation, assemblée plénière, 3 juillet 2026, pourvoi n° 24-50.028 (arrêt jumeau : n° 24-50.029)",
              "url": "https://www.legifrance.gouv.fr/juri/id/JURITEXT000054392426",
              "date": "2026-07-03",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Une GPA est dite « altruiste » quand la femme qui porte l’enfant reçoit au plus le remboursement de frais raisonnables liés à la grossesse, et « commerciale » quand elle vise un profit ; la limite entre les deux varie selon les États (en Grèce, jusqu’à 10 000 € au titre de la pénibilité physique d’une grossesse simple). Faute de consensus en Europe, la Cour européenne des droits de l’homme laisse aux États une large marge de décision ; mais un État qui ne reconnaît pas une filiation établie à l’étranger doit offrir un autre moyen de l’établir, par exemple une adoption rapide et effective. Une directive européenne de 2024 range l’exploitation de la GPA parmi les formes de traite des êtres humains : elle vise ceux qui contraignent ou trompent des femmes pour qu’elles portent un enfant.",
            "source": {
              "title": "Surrogacy: The legal situation in the EU (EPRS Briefing, PE 769.508)",
              "url": "https://www.europarl.europa.eu/RegData/etudes/BRIE/2025/769508/EPRS_BRI(2025)769508_EN.pdf",
              "date": "2025-02",
              "publisher": "Parlement européen, service de recherche (EPRS)"
            }
          }
        ],
        "figures": [
          {
            "value": "59,2 %",
            "label": "Part des personnes de 18 ans et plus favorables, en 2024, à ce que des couples hétérosexuels et/ou homosexuels puissent recourir à une GPA, contre 42,6 % en 2014. Les opposants représentent 36,2 % en 2024, contre 55,2 % en 2014",
            "date": "2024",
            "source": {
              "title": "Baromètre d’opinion de la DREES 2024 : tris à plat complets (question FA16 ; 4 002 personnes interrogées en face-à-face du 14 octobre au 20 décembre 2024)",
              "url": "https://data.drees.solidarites-sante.gouv.fr/api/explore/v2.1/catalog/datasets/431_le-barometre-d-opinion/attachments/2024_barometre_drees_tap_complets_v2_xlsx",
              "publisher": "DREES (ministère chargé de la Santé et des Solidarités)"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2014",
                  "value": 42.6
                },
                {
                  "label": "2024",
                  "value": 59.2
                }
              ]
            }
          },
          {
            "value": "4 États membres",
            "label": "États de l’Union européenne qui ont adopté une loi autorisant la GPA dite altruiste : Irlande, Grèce, Chypre et Portugal ; la GPA commerciale y reste interdite. En février 2025, les lois irlandaise et portugaise n’étaient pas encore appliquées. De nombreux autres États membres interdisent la GPA ; depuis novembre 2024, l’Italie l’interdit aussi à ses ressortissants à l’étranger",
            "date": "2025-02",
            "source": {
              "title": "Surrogacy: The legal situation in the EU (EPRS Briefing, PE 769.508), p. 1, 5, 6 et 8",
              "url": "https://www.europarl.europa.eu/RegData/etudes/BRIE/2025/769508/EPRS_BRI(2025)769508_EN.pdf",
              "date": "2025-02",
              "publisher": "Parlement européen, service de recherche (EPRS)"
            }
          },
          {
            "value": "51 enfants",
            "label": "Enfants nés d’une GPA en Grèce en 2023, contre 81 en 2022. La GPA y est autorisée depuis 2002, et un tribunal doit approuver le contrat avant le transfert de l’embryon",
            "date": "2023",
            "source": {
              "title": "Surrogacy: The legal situation in the EU (EPRS Briefing, PE 769.508), p. 5-6",
              "url": "https://www.europarl.europa.eu/RegData/etudes/BRIE/2025/769508/EPRS_BRI(2025)769508_EN.pdf",
              "date": "2025-02",
              "publisher": "Parlement européen, service de recherche (EPRS)"
            },
            "chart": {
              "kind": "series",
              "unit": "enfants",
              "items": [
                {
                  "label": "2022",
                  "value": 81
                },
                {
                  "label": "2023",
                  "value": 51
                }
              ]
            }
          },
          {
            "value": "1 an de prison et 15 000 € d’amende",
            "label": "Peine encourue en France pour avoir servi d’intermédiaire entre des parents d’intention et une femme acceptant de porter l’enfant. Elle est doublée si les faits sont habituels ou commis dans un but lucratif (article 227-12 du Code pénal)",
            "date": "2002",
            "source": {
              "title": "Code pénal, article 227-12 (version en vigueur depuis le 1er janvier 2002)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006418042",
              "date": "2002-01-01",
              "publisher": "Légifrance"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "droits_lgbtqia-1-a",
          "text": "Autoriser en France une GPA sans transaction commerciale, strictement encadrée par l’État"
        },
        {
          "id": "droits_lgbtqia-1-b",
          "text": "Maintenir l’interdiction en France tout en reconnaissant la filiation des enfants nés d’une GPA à l’étranger"
        },
        {
          "id": "droits_lgbtqia-1-c",
          "text": "Maintenir l’interdiction de toute GPA en France, y compris une GPA sans transaction commerciale"
        },
        {
          "id": "droits_lgbtqia-1-d",
          "text": "Maintenir l’interdiction et limiter la reconnaissance des filiations établies par une GPA à l’étranger"
        }
      ]
    },
    {
      "id": "droits_lgbtqia-2",
      "topicId": "droits_lgbtqia",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles règles pour les transitions de genre, en particulier chez les mineurs ?",
      "context": "Aujourd’hui : changer la mention du sexe à l’état civil passe par un tribunal ; un texte voté au Sénat en 2024, qui interdit avant 18 ans hormones et chirurgie de transition, attend son examen à l’Assemblée.",
      "explainer": {
        "summary": "Depuis 2016, changer la mention de son sexe à l’état civil n’exige plus de traitement médical, mais la décision revient à un juge ; le débat porte sur le maintien ou l’allègement de cette procédure et sur la prise en charge des transitions. Pour les mineurs, il oppose la prudence face à des traitements en partie irréversibles et peu documentés à long terme au souci de répondre à la souffrance psychique de certains jeunes et de leur éviter l’automédication ou des parcours sans suivi médical.",
        "points": [
          {
            "text": "Depuis la loi du 18 novembre 2016, une personne majeure ou mineure émancipée peut demander au tribunal judiciaire de modifier la mention de son sexe. La procédure est gratuite ; le tribunal ne peut ni exiger de pièces médicales ni refuser la demande faute de traitement, d’opération ou de stérilisation. En septembre 2025, le ministère de la Justice a recommandé d’engager une réflexion sur une procédure sans juge, tout en relevant l’absence de consensus sur ses contours. L’Allemagne, l’Espagne et la Suisse admettent une simple déclaration, ouverte aux mineurs sous conditions ; l’Italie et le Royaume-Uni exigent des éléments médicaux.",
            "source": {
              "title": "Rapport d’évaluation : application de la loi n° 2016-1547 du 18 novembre 2016 sur la procédure de modification de la mention du sexe à l’état civil (synthèse et annexe 4 de droit comparé)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/301707.pdf",
              "date": "2025-09",
              "publisher": "Ministère de la Justice, Direction des affaires civiles et du sceau (via vie-publique.fr)"
            }
          },
          {
            "text": "Chez les mineurs, selon la HAS, les soins sont en général assurés dans des centres pluridisciplinaires : bloqueurs de puberté, médicaments qui la suspendent et dont les effets sont considérés comme réversibles, puis hormones, commencées en général vers 15 ans, dont certains effets, notamment sur la fertilité, sont en partie irréversibles. Au Royaume-Uni et aux Pays-Bas, ces hormones ne peuvent pas débuter avant 16 ans. Pour ces deux traitements, la HAS relève que les données à long terme restent limitées ; elle prévoit de valider ses recommandations au second semestre 2027. Les soins de transition relèvent d’une affection de longue durée (ALD), qui ouvre droit à une prise en charge par l’Assurance maladie ; chez l’adulte, les soins couverts varient selon les caisses et certains, souvent considérés comme esthétiques, sont mal pris en charge.",
            "source": {
              "title": "Transidentité : accompagnement du mineur et de son entourage, et soins proposés. Note de cadrage (p. 8 à 11 et 15)",
              "url": "https://www.has-sante.fr/upload/docs/application/pdf/2026-03/transidentite_accompagnement_du_mineur_et_de_son_entourage_et_soins_proposes_note_de_cadrage.pdf",
              "date": "2026-02-25",
              "publisher": "Haute Autorité de santé (HAS)"
            }
          },
          {
            "text": "Le texte adopté par le Sénat le 28 mai 2024 interdirait de prescrire à un mineur des hormones qui développent les caractères sexuels du genre auquel il s’identifie, ainsi que tout acte chirurgical de réassignation de genre. Le diagnostic et le suivi des mineurs seraient confiés à des centres de référence spécialisés. Les bloqueurs de puberté y resteraient possibles après une réunion de plusieurs spécialistes et au moins deux ans après la première consultation. Les infractions seraient punies de deux ans de prison et de 30 000 € d’amende.",
            "source": {
              "title": "Proposition de loi, adoptée par le Sénat, visant à encadrer les pratiques médicales mises en œuvre dans la prise en charge des mineurs en questionnement de genre (n° 147)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b0147_proposition-loi.pdf",
              "date": "2024-07-23",
              "publisher": "Assemblée nationale"
            }
          }
        ],
        "figures": [
          {
            "value": "2 883",
            "label": "Demandes déposées devant les tribunaux en 2024 pour modifier la mention du sexe à l’état civil (France entière), contre 426 en 2018. Entre 2018 et 2024, quand le juge statue sur la demande, il l’accepte au moins en partie dans 99,1 % des cas",
            "date": "2024",
            "source": {
              "title": "Rapport d’évaluation : procédure de modification de la mention du sexe à l’état civil, annexe 3 (étude statistique 2018-2024)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/301707.pdf",
              "date": "2025-09",
              "publisher": "Ministère de la Justice, Direction des affaires civiles et du sceau (via vie-publique.fr)"
            },
            "chart": {
              "kind": "series",
              "unit": "demandes",
              "items": [
                {
                  "label": "2018",
                  "value": 426
                },
                {
                  "label": "2024",
                  "value": 2883
                }
              ]
            }
          },
          {
            "value": "Un peu plus de 22 000",
            "label": "Personnes suivies en affection de longue durée (ALD) pour « troubles de l’identité sexuelle » en 2023 (âge non précisé). Selon la HAS, ce chiffre « tend à augmenter » ces dernières années",
            "date": "2023",
            "source": {
              "title": "Transition de genre : la HAS publie les premières recommandations sur la prise en charge médicale de l’adulte (communiqué)",
              "url": "https://www.has-sante.fr/jcms/p_3636602/fr/transition-de-genre-la-has-publie-les-premieres-recommandations-sur-la-prise-en-charge-medicale-de-l-adulte",
              "date": "2025-07-18",
              "publisher": "Haute Autorité de santé (HAS)"
            }
          },
          {
            "value": "294",
            "label": "Mineurs bénéficiant d’une ALD pour « troubles de l’identité sexuelle » (intitulé de la Classification internationale des maladies) en 2020, contre 8 en 2013. C’est le chiffre le plus récent cité par la HAS en février 2026 ; elle souligne le manque de données fiables sur les mineurs",
            "date": "2020",
            "source": {
              "title": "Transidentité : accompagnement du mineur et de son entourage, et soins proposés. Note de cadrage (p. 4)",
              "url": "https://www.has-sante.fr/upload/docs/application/pdf/2026-03/transidentite_accompagnement_du_mineur_et_de_son_entourage_et_soins_proposes_note_de_cadrage.pdf",
              "date": "2026-02-25",
              "publisher": "Haute Autorité de santé (HAS)"
            },
            "chart": {
              "kind": "series",
              "unit": "mineurs",
              "items": [
                {
                  "label": "2013",
                  "value": 8
                },
                {
                  "label": "2020",
                  "value": 294
                }
              ]
            }
          },
          {
            "value": "46",
            "label": "Actes de chirurgie mammaire relevés en 2024 chez des mineurs hospitalisés avec un diagnostic de trouble de l’identité sexuelle, contre 0 en 2016 ; une même personne peut en avoir plusieurs. La HAS juge ce nombre faible mais en augmentation ; les autres chirurgies (du visage, ORL ou du périnée) sont très rares. Le nombre de mineurs hospitalisés avec ce diagnostic principal « semble s’être stabilisé » depuis 2023",
            "date": "2024",
            "source": {
              "title": "Transidentité : accompagnement du mineur et de son entourage, et soins proposés. Note de cadrage (p. 4, données PMSI/ATIH)",
              "url": "https://www.has-sante.fr/upload/docs/application/pdf/2026-03/transidentite_accompagnement_du_mineur_et_de_son_entourage_et_soins_proposes_note_de_cadrage.pdf",
              "date": "2026-02-25",
              "publisher": "Haute Autorité de santé (HAS)"
            },
            "chart": {
              "kind": "series",
              "unit": "actes",
              "items": [
                {
                  "label": "2016",
                  "value": 0
                },
                {
                  "label": "2024",
                  "value": 46
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "droits_lgbtqia-2-a",
          "text": "Permettre de changer la mention du sexe sur simple déclaration en mairie, y compris pour un mineur avec l’accord d’un parent"
        },
        {
          "id": "droits_lgbtqia-2-b",
          "text": "Rendre les transitions de genre libres et gratuites, avec une prise en charge intégrale par l’Assurance maladie"
        },
        {
          "id": "droits_lgbtqia-2-c",
          "text": "Simplifier les démarches pour les adultes et réserver les traitements des mineurs à des équipes médicales spécialisées",
          "external": true
        },
        {
          "id": "droits_lgbtqia-2-d",
          "text": "Interdire avant 18 ans les traitements hormonaux et la chirurgie de transition, au profit d’un suivi psychologique"
        }
      ]
    },
    {
      "id": "education-1",
      "topicId": "education",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle priorité pour l’école ?",
      "context": "Aujourd’hui : le nombre d’élèves diminue avec la baisse des naissances, et l’enquête internationale PISA montre un recul du niveau des élèves, notamment en mathématiques.",
      "explainer": {
        "summary": "Les résultats des élèves de 15 ans reculent en France, comme en moyenne dans l’OCDE ; en mathématiques, la baisse française est plus forte depuis 2022. Les propositions divergent sur le levier prioritaire : exigence et autorité, moyens humains et attractivité du métier, liberté laissée aux établissements et aux familles, ou mixité sociale.",
        "points": [
          {
            "text": "Dans les établissements privés sous contrat d’association, les classes sous contrat suivent les règles et programmes de l’enseignement public. Leurs enseignants sont payés par l’État, et leurs dépenses de fonctionnement sont prises en charge dans les mêmes conditions que dans le public.",
            "source": {
              "title": "Code de l’éducation, article L442-5 (version en vigueur depuis le 26 août 2021)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043982740",
              "date": "2021-08-26",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Depuis le 1er septembre 2022, l’instruction en famille doit être autorisée par l’administration, en principe pour une année scolaire au plus (plus longtemps pour raison de santé ou de handicap). Seuls quatre motifs sont admis : santé ou handicap de l’enfant ; activités sportives ou artistiques intensives ; itinérance de la famille ou éloignement de toute école publique ; situation propre à l’enfant motivant un projet éducatif.",
            "source": {
              "title": "Code de l’éducation, article L131-5 (version en vigueur depuis le 1er septembre 2022)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043982594",
              "date": "2022-09-01",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "En 2025, selon leur chef d’établissement, 45 % des élèves de 15 ans étaient dans un établissement où l’enseignement pâtissait au moins en partie d’un manque d’enseignants, contre 67 % en 2022 (moyenne de l’OCDE en 2025 : 39 %). Cette part est de 47 % pour le manque de personnel auxiliaire (moyenne de l’OCDE : 39 %).",
            "source": {
              "title": "Résultats du PISA 2025 (Volume I) – Note pays : France",
              "url": "https://www.oecd.org/content/dam/oecd/fr/publications/reports/2026/09/pisa-2025-results-volume-i-country-notes_88d1164e/france_69779694/9840dc6b-fr.pdf",
              "date": "2026-09",
              "publisher": "OCDE"
            }
          }
        ],
        "figures": [
          {
            "value": "458 points",
            "label": "score moyen des élèves de 15 ans en mathématiques à PISA 2025, dans la moyenne de l’OCDE (463 points). Il a baissé de 16 points depuis 2022 (moyenne de l’OCDE : 9 points), après 21 points de baisse entre 2018 et 2022. 36 % des élèves sont en difficulté (sous le niveau 2), contre 29 % en 2022 (moyenne de l’OCDE : 35 %)",
            "date": "2025",
            "source": {
              "title": "PISA 2025 : les acquis des élèves de 15 ans en compréhension de l’écrit et en culture mathématique en baisse en France et dans l’OCDE (Note d’information n° 26.40)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/depp-ni-2026-40pisa-mathspdf-520231.pdf",
              "date": "2026-09",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "points",
              "items": [
                {
                  "label": "France",
                  "value": 458
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 463
                }
              ]
            }
          },
          {
            "value": "47 %",
            "label": "des élèves de 15 ans disent que le bruit et l’agitation perturbent la plupart ou la totalité de leurs cours de sciences (moyenne de l’OCDE : 31 %). Selon l’OCDE, le climat de discipline s’est toutefois amélioré en France entre 2015 et 2025",
            "date": "2025",
            "source": {
              "title": "Résultats du PISA 2025 (Volume I) – Note pays : France",
              "url": "https://www.oecd.org/content/dam/oecd/fr/publications/reports/2026/09/pisa-2025-results-volume-i-country-notes_88d1164e/france_69779694/9840dc6b-fr.pdf",
              "date": "2026-09",
              "publisher": "OCDE"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France",
                  "value": 47
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 31
                }
              ]
            }
          },
          {
            "value": "95 points",
            "label": "d’écart en mathématiques entre les élèves de 15 ans très favorisés et très défavorisés socialement, contre 83 points en moyenne dans l’OCDE. La France fait partie des pays de l’OCDE où cet écart est le plus marqué",
            "date": "2025",
            "source": {
              "title": "PISA 2025 : les acquis des élèves de 15 ans en compréhension de l’écrit et en culture mathématique en baisse en France et dans l’OCDE (Note d’information n° 26.40)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/depp-ni-2026-40pisa-mathspdf-520231.pdf",
              "date": "2026-09",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "points",
              "items": [
                {
                  "label": "France",
                  "value": 95
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 83
                }
              ]
            }
          },
          {
            "value": "13,6 %",
            "label": "des élèves des écoles maternelles et élémentaires sont scolarisés dans le privé sous contrat à la rentrée 2025, contre 13,1 % en 2011. Dans les collèges et lycées, le public accueille 78,8 % des élèves, une part stable depuis 2010 (France, public et privé sous contrat)",
            "date": "rentrée 2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiches 3.01 et 4.01)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "Rentrée 2011",
                  "value": 13.1
                },
                {
                  "label": "Rentrée 2025",
                  "value": 13.6
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "education-1-a",
          "text": "Accroître l’exigence scolaire : notes chiffrées, examens de passage, groupes de niveau, voire fin du collège unique"
        },
        {
          "id": "education-1-b",
          "text": "Baisser nettement le nombre d’élèves par classe et recruter les enseignants et personnels qui manquent"
        },
        {
          "id": "education-1-c",
          "text": "Donner aux chefs d’établissement une large autonomie sur les méthodes, les horaires et l’organisation"
        },
        {
          "id": "education-1-d",
          "text": "Laisser les familles choisir leur école, publique ou privée, avec un financement public qui suit l’élève"
        },
        {
          "id": "education-1-e",
          "text": "Renforcer la mixité sociale entre établissements, pour que chaque école accueille des élèves de tous milieux"
        },
        {
          "id": "education-1-f",
          "text": "Donner aux familles un rôle central : instruction à la maison facilitée et droit de regard sur les programmes"
        },
        {
          "id": "education-1-g",
          "text": "Rendre le métier d’enseignant plus attractif : salaires revalorisés, formation et concours dès la licence"
        },
        {
          "id": "education-1-h",
          "text": "Renforcer l’autorité à l’école : uniforme, sanctions contre les élèves perturbateurs, soutien aux enseignants"
        }
      ]
    },
    {
      "id": "education-2",
      "topicId": "education",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles règles pour le financement public des écoles privées sous contrat ?",
      "context": "Aujourd’hui : les établissements privés sous contrat scolarisent environ un élève sur six ; ils sont financés en grande partie par l’argent public, complété par une contribution des familles, et ne sont pas soumis à la carte scolaire.",
      "explainer": {
        "summary": "Les écoles privées sous contrat suivent les programmes nationaux et sont financées surtout par l’État ; elles inscrivent leurs élèves hors de la carte scolaire, qui affecte ceux du public selon leur adresse. Les uns veulent réserver l’argent public aux écoles publiques ou le conditionner à la mixité sociale, d’autres veulent plus de liberté pour les familles et pour le privé, d’autres encore garder les règles actuelles avec plus de contrôles.",
        "points": [
          {
            "text": "Depuis la loi Debré du 31 décembre 1959, un établissement privé sous contrat enseigne selon les programmes du public et doit accueillir tous les enfants « sans distinction d’origine, d’opinion ou de croyances ». L’État paie ses enseignants. Son chef d’établissement a plus de pouvoirs que dans le public, notamment pour inscrire les élèves. Une règle non écrite réaffirmée depuis les années 1960, le « ratio de 20 % », calcule le nombre d’enseignants du privé sur la base de 20 % des moyens du public. En pratique, elle sert surtout à répartir les postes créés ou supprimés chaque année. Selon la Cour des comptes, elle limite les variations de la part du privé, dont l’évolution ne reflète donc qu’imparfaitement la demande des familles : 16,97 % des élèves en 2021, contre 16,55 % en 2011.",
            "source": {
              "title": "L’enseignement privé sous contrat (rapport public thématique)",
              "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230601-enseignement-prive-sous-contrat.pdf",
              "date": "2023-06-01",
              "publisher": "Cour des comptes"
            }
          },
          {
            "text": "En moyenne, les élèves du privé sous contrat obtiennent de meilleurs résultats que ceux du public. Mais ces résultats dépendent beaucoup du milieu social des élèves accueillis. Selon la Cour des comptes, les recherches disponibles ne permettent pas de dire si le privé apporte plus ou moins aux élèves que le public.",
            "source": {
              "title": "L’enseignement privé sous contrat (rapport public thématique)",
              "url": "https://www.ccomptes.fr/sites/default/files/2023-10/20230601-enseignement-prive-sous-contrat.pdf",
              "date": "2023-06-01",
              "publisher": "Cour des comptes"
            }
          },
          {
            "text": "Le 1er juin 2026, l’Assemblée nationale a adopté en première lecture une proposition de loi, qui n’est pas encore définitive. Elle prévoit un contrôle pédagogique, administratif et financier de chaque établissement privé sous contrat au moins une fois tous les cinq ans. Elle crée aussi dans chaque académie un conseil de l’enseignement privé, chargé notamment de veiller à la mixité sociale des élèves.",
            "source": {
              "title": "Proposition de loi visant à protéger les enfants et à lutter contre les violences en milieu scolaire – Texte adopté n° 294 (première lecture)",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/PIONANR5L17BTA0294.html",
              "date": "2026-06-01",
              "publisher": "Assemblée nationale"
            }
          }
        ],
        "figures": [
          {
            "value": "8 871 M€",
            "label": "de crédits votés pour 2026 dans le budget de l’État (loi de finances initiale) pour l’enseignement privé du premier et du second degré, soit 9,9 % des crédits de la mission budgétaire « Enseignement scolaire ». La dépense a été de 8 812 M€ en 2025 (France, y compris collectivités d’outre-mer)",
            "date": "loi de finances initiale 2026",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 10.03, le budget : analyse et évolution)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "part",
              "value": 9.9,
              "total": 100,
              "unit": "%",
              "whole": "des crédits « Enseignement scolaire »"
            }
          },
          {
            "value": "66 % contre 73 %",
            "label": "des moyens des collèges et lycées privés sous contrat viennent de l’État, contre 73 % pour les collèges et lycées publics. Le reste vient surtout des familles et d’autres acteurs privés dans le privé (25 %), des collectivités territoriales dans le public (22 %). Pour les écoles maternelles et élémentaires privées, l’État apporte 2 314 M€ sur 4 414 M€ (France)",
            "date": "2024",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 10.04, le financement des producteurs d’éducation)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Collèges et lycées privés",
                  "value": 66
                },
                {
                  "label": "Collèges et lycées publics",
                  "value": 73
                }
              ]
            }
          },
          {
            "value": "58 % contre 33 %",
            "label": "des collégiens du privé sous contrat sont de milieu favorisé ou très favorisé, contre 33 % dans le public. Les collégiens de milieu défavorisé y sont 16 %, contre 40 % dans le public (France hors Mayotte, élèves dont l’origine sociale est connue)",
            "date": "rentrée 2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 2.19, les élèves du second degré habitant dans un quartier prioritaire)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Privé : favorisés",
                  "value": 58
                },
                {
                  "label": "Public : favorisés",
                  "value": 33
                },
                {
                  "label": "Privé : défavorisés",
                  "value": 16
                },
                {
                  "label": "Public : défavorisés",
                  "value": 40
                }
              ]
            }
          },
          {
            "value": "24,2 contre 20,7",
            "label": "élèves par classe en moyenne en élémentaire dans le privé sous contrat, contre 20,7 dans le public ; en maternelle, 24,8 contre 21,3. Dans le premier degré, 45 % des classes du privé comptent plus de 25 élèves, contre 11 % dans le public. Dans le public, la taille des classes baisse depuis neuf ans : entre 2017 et 2021, surtout par le dédoublement de classes de CP, de CE1 puis de grande section dans l’éducation prioritaire (écoles des secteurs les plus défavorisés), puis avec la baisse du nombre d’élèves (France)",
            "date": "rentrée 2025",
            "source": {
              "title": "Taille des classes du premier degré : une neuvième année de baisse consécutive dans les écoles publiques (Note d’information n° 26.01)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/Education_nationale_DEPP_NI%20Taille%20des%20classes%2026-01.pdf-478592.pdf",
              "date": "2026-01",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "élèves par classe",
              "items": [
                {
                  "label": "Élémentaire, privé",
                  "value": 24.2
                },
                {
                  "label": "Élémentaire, public",
                  "value": 20.7
                },
                {
                  "label": "Maternelle, privé",
                  "value": 24.8
                },
                {
                  "label": "Maternelle, public",
                  "value": 21.3
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "education-2-a",
          "text": "Réserver à terme l’argent public de l’enseignement aux seules écoles publiques"
        },
        {
          "id": "education-2-b",
          "text": "Moduler l’argent public versé aux écoles privées selon leur mixité sociale"
        },
        {
          "id": "education-2-c",
          "text": "Intégrer les écoles privées sous contrat à la carte scolaire pour y imposer la mixité sociale"
        },
        {
          "id": "education-2-d",
          "text": "Supprimer la carte scolaire et faire suivre l’argent public par l’élève, en école publique ou privée"
        },
        {
          "id": "education-2-e",
          "text": "Supprimer la règle tacite qui plafonne la part des moyens publics allouée au privé sous contrat"
        },
        {
          "id": "education-2-f",
          "text": "Maintenir les règles actuelles de financement des écoles privées sous contrat, en renforçant les contrôles de l’État",
          "external": true
        }
      ]
    },
    {
      "id": "education-3",
      "topicId": "education",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment organiser la scolarité au collège ?",
      "context": "Aujourd’hui : tous les élèves suivent pour l’essentiel le même enseignement jusqu’à la fin de la 3e, dans un « collège unique ».",
      "explainer": {
        "summary": "Les élèves arrivent en 6e avec des niveaux déjà contrastés. Le débat porte sur la façon d’y répondre : garder un enseignement commun, différencier plus tôt (examen d’entrée, groupes de niveau, filières, apprentissage), laisser chaque collège s’organiser ou prolonger la scolarité obligatoire.",
        "points": [
          {
            "text": "L’instruction est obligatoire de 3 à 16 ans. La loi du 26 juillet 2019 y ajoute une obligation de formation jusqu’à 18 ans : après 16 ans, le jeune doit poursuivre sa scolarité, être apprenti ou en formation, occuper un emploi, effectuer un service civique ou suivre un dispositif d’accompagnement ou d’insertion.",
            "source": {
              "title": "Loi n° 2019-791 du 26 juillet 2019 pour une école de la confiance (articles 11 et 15)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000038829065",
              "date": "2019-07-26",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Depuis la rentrée 2024, le français et les mathématiques de 6e et de 5e devaient être enseignés en groupes, sur tout l’horaire. Un arrêté du 10 mars 2026, en vigueur depuis le 5 juillet 2026, supprime cette obligation. Chaque collège choisit désormais son organisation, qui peut inclure des groupes à effectifs réduits ou formés selon les besoins des élèves, sur tout ou partie de l’horaire.",
            "source": {
              "title": "Arrêté du 10 mars 2026 modifiant l’arrêté du 19 mai 2015 relatif à l’organisation des enseignements dans les classes de collège",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053652601",
              "date": "2026-03-12",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Un contrat d’apprentissage peut être signé à partir de 16 ans, ou dès 15 ans si le jeune a terminé la classe de 3e.",
            "source": {
              "title": "Contrat d’apprentissage",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2918",
              "date": "2026-09-08",
              "publisher": "Service-Public.fr (DILA)"
            }
          }
        ],
        "figures": [
          {
            "value": "28,0 %",
            "label": "des élèves entrant en 6e sont dans les deux groupes les moins performants (sur six) en français, contre 31,7 % en 2017 ; 32,6 % sont dans les deux plus performants, contre 29,1 %. En mathématiques, entre 2017 et 2025, le score moyen a gagné 4 points ; la part des moins performants a augmenté de 1,7 point, celle des plus performants de 3,8 points (évaluation nationale de début de 6e, France, public et privé sous contrat)",
            "date": "septembre 2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 5.14, l’évaluation en début de sixième)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2017",
                  "value": 31.7
                },
                {
                  "label": "2025",
                  "value": 28
                }
              ]
            }
          },
          {
            "value": "60,8 %",
            "label": "des élèves de 3e ont poursuivi en seconde générale et technologique à la rentrée 2024. 33,1 % sont entrés dans la voie professionnelle (dont 5,2 % en apprentissage), 2,2 % ont redoublé et 3,8 % sont sortis (formations sociales ou de santé, emploi, départ à l’étranger) (France, établissements scolaires et CFA, publics et privés)",
            "date": "rentrée 2024",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 4.28, les poursuites d’études après la troisième)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "2de générale et technologique",
                  "value": 60.8
                },
                {
                  "label": "Voie professionnelle",
                  "value": 33.1
                },
                {
                  "label": "Redoublement",
                  "value": 2.2
                },
                {
                  "label": "Sorties",
                  "value": 3.8
                }
              ]
            }
          },
          {
            "value": "6,7 %",
            "label": "des jeunes de 17 ans ne sont plus scolarisés (ni élèves, ni apprentis, ni étudiants) : 7,9 % des garçons et 5,5 % des filles. Estimation à lire avec prudence, issue du rapprochement de deux sources (France, public et privé)",
            "date": "2024-2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 1.06, la répartition des jeunes de 14 à 17 ans dans le système éducatif)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Ensemble",
                  "value": 6.7
                },
                {
                  "label": "Garçons",
                  "value": 7.9
                },
                {
                  "label": "Filles",
                  "value": 5.5
                }
              ]
            }
          },
          {
            "value": "7,2 %",
            "label": "des 18-24 ans ont quitté prématurément l’éducation et la formation (« sortants précoces » : au plus le brevet, et ni en études ni en formation), contre 9,1 % en moyenne dans l’Union européenne (France : définition nationale légèrement différente, selon Eurostat)",
            "date": "2025",
            "source": {
              "title": "Jeunes ayant quitté prématurément l’éducation et la formation par sexe (indicateur sdg_04_10)",
              "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_04_10?format=JSON&lang=fr&geo=FR&geo=EU27_2020&sex=T&time=2025",
              "date": "2026-09-10",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France",
                  "value": 7.2
                },
                {
                  "label": "Moyenne de l’UE",
                  "value": 9.1
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "education-3-a",
          "text": "Instaurer un examen d’entrée en 6e et des groupes de niveau en français et en mathématiques"
        },
        {
          "id": "education-3-b",
          "text": "Remplacer le collège unique par des filières différenciées, dont l’apprentissage dès 14 ans"
        },
        {
          "id": "education-3-c",
          "text": "Garder le même enseignement pour tous jusqu’en 3e et supprimer les groupes de niveau"
        },
        {
          "id": "education-3-d",
          "text": "Rendre l’école obligatoire jusqu’à 18 ans pour garder tous les jeunes en formation"
        },
        {
          "id": "education-3-e",
          "text": "Laisser chaque établissement organiser ses classes et le soutien aux élèves selon leurs besoins"
        }
      ]
    },
    {
      "id": "education-4",
      "topicId": "education",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour l’université et la recherche publique ?",
      "context": "Aujourd’hui : l’accès aux formations de l’enseignement supérieur passe par la plateforme nationale Parcoursup, et une partie croissante du financement de la recherche publique est attribuée par appels à projets.",
      "explainer": {
        "summary": "Le nombre d’étudiants a augmenté depuis 2010, dans le public comme dans le privé. Le débat porte sur la sélection à l’entrée, sur le niveau des moyens des universités et de la recherche et leur mode d’attribution, sur l’accueil et les droits d’inscription des étudiants étrangers, et sur l’encadrement du privé.",
        "points": [
          {
            "text": "Une partie du financement de la recherche passe par des appels à projets : des équipes proposent un projet, et une agence choisit ceux qu’elle finance. En 2025, l’appel principal de l’Agence nationale de la recherche (ANR) a retenu 1 737 projets sur 7 665 propositions éligibles, pour 834 M€. En 2024, il en avait retenu 1 713, pour 810,7 M€.",
            "source": {
              "title": "Les résultats définitifs de l’Appel à projets générique (AAPG) 2025",
              "url": "https://anr.fr/fr/actus/details/news/les-resultats-definitifs-de-lappel-a-projets-generique-aapg-2025/",
              "date": "2026-06-08",
              "publisher": "Agence nationale de la recherche (ANR)"
            }
          },
          {
            "text": "En 2026-2027, les droits d’inscription à l’université sont de 178 € par an en licence et de 255 € en master. Depuis avril 2019, les étudiants étrangers qui ne viennent ni de l’Union européenne, ni de l’Espace économique européen, ni de Suisse paient en principe plus. Leurs droits sont de 2 902 € par an en licence et de 3 950 € en master. Selon le ministère, ces montants couvrent moins du tiers du coût réel de la formation. Une université peut en exonérer une partie de ces étudiants, dans une limite fixée par un décret du 19 mai 2026 : 30 % en 2026-2027, 25 % en 2027-2028, puis 20 %.",
            "source": {
              "title": "Université : certains étudiants étrangers non-européens vont payer plus cher à partir de la rentrée 2026",
              "url": "https://www.service-public.gouv.fr/particuliers/actualites/A18927",
              "date": "2026-08-20",
              "publisher": "Service-Public.fr (DILA)"
            }
          },
          {
            "text": "Pour entrer en première année d’études supérieures, les candidats passent par Parcoursup, la procédure nationale de préinscription. La licence est une formation dite « non sélective » : ses candidats ne sont départagés que s’ils sont plus nombreux que les places. Le chef d’établissement décide alors, sur proposition d’une commission, en vérifiant que le projet et les acquis du candidat correspondent à la formation. Cette règle vient de l’article L. 612-3 du code de l’éducation, issu de la loi du 8 mars 2018.",
            "source": {
              "title": "Décision n° 2020-834 QPC du 3 avril 2020 (Union nationale des étudiants de France)",
              "url": "https://www.conseil-constitutionnel.fr/decision/2020/2020834QPC.htm",
              "date": "2020-04-03",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "12 460 €",
            "label": "dépensés en moyenne par étudiant à l’université en 2024 (donnée provisoire), en euros de 2024, c’est-à-dire hors effet de l’inflation. C’était 10 490 € en 2000, 12 870 € en 2010, 11 540 € en 2020 et 12 660 € en 2023. Pour un élève de classe préparatoire aux grandes écoles, la dépense est de 19 070 € (France, public et privé)",
            "date": "2024",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 10.05, les dépenses par élève et par étudiant)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "series",
              "unit": "€",
              "items": [
                {
                  "label": "2000",
                  "value": 10490
                },
                {
                  "label": "2010",
                  "value": 12870
                },
                {
                  "label": "2020",
                  "value": 11540
                },
                {
                  "label": "2023",
                  "value": 12660
                },
                {
                  "label": "2024",
                  "value": 12460
                }
              ]
            }
          },
          {
            "value": "2,18 % du PIB",
            "label": "consacrés à la recherche et développement réalisée en France, soit 61,5 Md€ (contre 2,22 % en 2022). Les entreprises en réalisent pour 1,44 % du PIB, les administrations (État, enseignement supérieur, institutions sans but lucratif) pour 0,74 %",
            "date": "2023",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 10.09, la recherche et le développement expérimental : vue d’ensemble)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP / SIES"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "Entreprises",
                  "value": 1.44
                },
                {
                  "label": "Administrations",
                  "value": 0.74
                }
              ]
            }
          },
          {
            "value": "26 %",
            "label": "des 3 049 600 étudiants du supérieur sont inscrits dans le privé, soit 786 800. Depuis 2010, les effectifs du privé ont augmenté de 76,1 %, contre 19,0 % dans le public ; depuis 2016, cette hausse vient en partie d’une meilleure collecte des données. En 2025, le privé recule de 1,7 % et le public progresse de 2,0 %. Par ailleurs, 352 800 étudiants étrangers sont venus en France pour leurs études : 12 % des effectifs, 7,2 % de plus en un an. À l’université, ils sont 10,0 % des inscrits en licence, 16,5 % en master et 35,0 % en doctorat (France)",
            "date": "rentrée 2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 7.01, les effectifs du supérieur : évolution ; fiche 7.17, les étudiants étrangers en mobilité internationale dans l’enseignement supérieur)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP / SIES"
            },
            "chart": {
              "kind": "part",
              "value": 26,
              "total": 100,
              "unit": "%",
              "whole": "des étudiants du supérieur"
            }
          },
          {
            "value": "94 %",
            "label": "des bacheliers 2025 inscrits sur Parcoursup ont reçu au moins une proposition, 1 point de moins qu’en 2024 : 97 % pour le bac général, 92 % pour le bac technologique et 83 % pour le bac professionnel. Parmi les étudiants entrés en licence en 2020, 39,5 % ont obtenu leur diplôme en 3 ou 4 ans : 45,7 % des bacheliers généraux, 15,4 % des bacheliers technologiques et 8,8 % des bacheliers professionnels (France)",
            "date": "session 2025 ; licence : étudiants entrés en 2020",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 7.20, les vœux d’orientation et propositions d’admission des nouveaux bacheliers ; fiche 8.16, la réussite en licence)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP / SIES"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Tous bacs",
                  "value": 94
                },
                {
                  "label": "Bac général",
                  "value": 97
                },
                {
                  "label": "Bac technologique",
                  "value": 92
                },
                {
                  "label": "Bac professionnel",
                  "value": 83
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "education-4-a",
          "text": "Laisser les universités sélectionner leurs étudiants selon leurs résultats et leurs capacités d’accueil"
        },
        {
          "id": "education-4-b",
          "text": "Supprimer Parcoursup et garantir à chaque bachelier l’accès sans sélection à la formation de son choix"
        },
        {
          "id": "education-4-c",
          "text": "Augmenter fortement les moyens des universités par étudiant et le budget de la recherche publique"
        },
        {
          "id": "education-4-d",
          "text": "Limiter le nombre d’étudiants étrangers et leur faire payer davantage le coût de leurs études"
        },
        {
          "id": "education-4-e",
          "text": "Encadrer plus strictement les établissements d’enseignement supérieur privés à but lucratif"
        }
      ]
    },
    {
      "id": "education-5",
      "topicId": "education",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment aider les étudiants à vivre pendant leurs études ?",
      "context": "Aujourd’hui : les bourses étudiantes sont attribuées selon les revenus des parents.",
      "explainer": {
        "summary": "L’aide publique aux étudiants combine des bourses ciblées sur les ressources de la famille et des aides plus larges, comme les aides au logement (APL) ou le repas à 1 €. Le débat porte sur la forme et le ciblage de l’aide : allocation pour tous, bourses plus fortes pour les plus modestes, hausse des aides au logement, aux transports et aux repas, prêt garanti par l’État, ou priorité aux étudiants français dans les résidences étudiantes.",
        "points": [
          {
            "text": "Les bourses sur critères sociaux dépendent surtout des revenus des parents, et non du fait que l’étudiant vive chez eux ou non. L’éloignement du domicile familial compte toutefois dans les « points de charge », qui modulent le montant. Les boursiers reçoivent aussi une aide au logement (APL) plus élevée.",
            "source": {
              "title": "Rapport public annuel 2025 – L’accès des jeunes au logement",
              "url": "https://www.ccomptes.fr/sites/default/files/2025-03/20250319-RPA2025-volume1-acces-des-jeunes-au-logement.pdf",
              "date": "2025-03-19",
              "publisher": "Cour des comptes"
            }
          },
          {
            "text": "Depuis le 4 mai 2026, le repas à 1 € des restaurants universitaires des Crous est ouvert à tous les étudiants. Il était jusque-là réservé aux boursiers et aux non-boursiers en situation de précarité ; les autres payaient 3,30 €.",
            "source": {
              "title": "Le repas à 1 € accessible à tous les étudiants à partir du 4 mai",
              "url": "https://www.service-public.gouv.fr/particuliers/actualites/A18811",
              "date": "2026-04-16",
              "publisher": "Service-Public.fr (DILA)"
            }
          },
          {
            "text": "Il existe un prêt étudiant garanti par l’État : jusqu’à 20 000 €, garanti à 70 % par l’État, sans caution ni condition de ressources, pour les moins de 28 ans (Français, ou ressortissants de l’UE ou de l’EEE résidant en France depuis au moins deux ans). Cinq banques partenaires le proposent, mais restent libres de l’accorder ou non.",
            "source": {
              "title": "Prêt étudiant garanti par l’État",
              "url": "https://www.etudiant.gouv.fr/fr/pret-etudiant-garanti-par-l-etat-1723",
              "date": "2025-02-19",
              "publisher": "Ministère de l’Enseignement supérieur – etudiant.gouv.fr"
            }
          }
        ],
        "figures": [
          {
            "value": "661 686",
            "label": "étudiants boursiers sur critères sociaux, soit 35,8 % des inscrits dans une formation ouvrant droit à bourse, contre 749 562 (38,4 %) en 2020-2021 et 681 078 (37,9 %) en 2015-2016. Le ministère attribue la baisse de 2024-2025 à l’absence de revalorisation du barème d’éligibilité malgré l’inflation (France)",
            "date": "2024-2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 10.07, l’aide aux étudiants)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP / SIES"
            },
            "chart": {
              "kind": "series",
              "unit": "boursiers",
              "items": [
                {
                  "label": "2015-2016",
                  "value": 681078
                },
                {
                  "label": "2020-2021",
                  "value": 749562
                },
                {
                  "label": "2024-2025",
                  "value": 661686
                }
              ]
            }
          },
          {
            "value": "de 1 454 € à 6 335 €",
            "label": "par an, montant de la bourse sur critères sociaux selon l’échelon (de l’échelon 0 bis à l’échelon 7), versé en dix mensualités ; majoration de 300 € par an en outre-mer",
            "date": "2026-2027",
            "source": {
              "title": "Bourse sur critères sociaux (étudiant)",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F12214",
              "date": "2026-04-10",
              "publisher": "Service-Public.fr (DILA)"
            },
            "chart": {
              "kind": "compare",
              "unit": "€ par an",
              "items": [
                {
                  "label": "Échelon 0 bis",
                  "value": 1454
                },
                {
                  "label": "Échelon 7",
                  "value": 6335
                }
              ]
            }
          },
          {
            "value": "2,3 Md€",
            "label": "d’aides au logement (APL) versées aux étudiants en 2023, soit 15 % de l’ensemble des APL, pour 1,6 million d’étudiants et d’apprentis allocataires. Elles couvrent autour de 49 % des loyers hors charges (2019-2023). Selon la Cour des comptes, elles ont été conçues pour être largement ouvertes aux étudiants, quelles que soient leurs ressources réelles, y compris l’aide de leur famille",
            "date": "2023",
            "source": {
              "title": "Le soutien public au logement des étudiants – synthèse du rapport public thématique",
              "url": "https://www.ccomptes.fr/sites/default/files/2025-07/20250703-synthese-Soutien-public-logement-etudiants.pdf",
              "date": "2025-07-03",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "part",
              "value": 15,
              "total": 100,
              "unit": "%",
              "whole": "de l’ensemble des APL versées"
            }
          },
          {
            "value": "36 %",
            "label": "des 159 994 résidents des logements gérés par les Crous sont de nationalité étrangère, contre 30 % en 2020-2021. Les boursiers sur critères sociaux, prioritaires lors de l’affectation, forment 54 % des résidents, contre 59 % en 2020-2021. Selon le Cnous, environ 11 % des places sont réservées, avant l’affectation des boursiers, à des étudiants en mobilité internationale (échanges comme Erasmus+, boursiers du gouvernement français) (2024-2025)",
            "date": "1er mars 2024",
            "source": {
              "title": "Le soutien public au logement des étudiants – rapport public thématique (tableau n° 6, données Cnous)",
              "url": "https://www.ccomptes.fr/sites/default/files/2025-07/20250703-Soutien-public-logement-etudiants.pdf",
              "date": "2025-07-03",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "part",
              "value": 36,
              "total": 100,
              "unit": "%",
              "whole": "des résidents des logements gérés par les Crous"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "education-5-a",
          "text": "Verser à chaque étudiant une allocation d’autonomie, quel que soit le revenu de ses parents"
        },
        {
          "id": "education-5-b",
          "text": "Augmenter les aides aux étudiants pour le logement, les transports et l’alimentation"
        },
        {
          "id": "education-5-c",
          "text": "Augmenter nettement les bourses des étudiants modestes pendant leurs premières années"
        },
        {
          "id": "education-5-d",
          "text": "Créer un prêt garanti par l’État pour que chaque étudiant puisse financer ses études"
        },
        {
          "id": "education-5-e",
          "text": "Donner la priorité aux étudiants français pour obtenir une place en résidence étudiante"
        }
      ]
    },
    {
      "id": "societe-1",
      "topicId": "societe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel avenir pour l’audiovisuel public ?",
      "context": "Aujourd’hui : l’audiovisuel public est financé par une part de la TVA depuis la suppression de la redevance en 2022.",
      "explainer": {
        "summary": "Chaque loi de finances fixe désormais les moyens de l’audiovisuel public, et la Cour des comptes juge « préoccupante » la situation financière de France Télévisions, dont le concours de l’État a baissé entre 2018 et 2022. Les approches divergent : le privatiser en tout ou en partie, laisser chaque foyer attribuer l’argent au média de son choix, le réformer en réduisant ses coûts, garantir ses moyens et son indépendance, ou contrôler davantage le pluralisme de ses programmes.",
        "points": [
          {
            "text": "Le Conseil constitutionnel a validé la suppression de la redevance en 2022, à une condition : le Parlement doit en fixer le montant de façon à permettre aux sociétés publiques de remplir leurs missions de service public. Pour le Conseil, la garantie des ressources de l’audiovisuel public « constitue un élément de son indépendance ».",
            "source": {
              "title": "Décision n° 2022-842 DC du 12 août 2022 – Loi de finances rectificative pour 2022",
              "url": "https://www.conseil-constitutionnel.fr/decision/2022/2022842DC.htm",
              "date": "2022-08-12",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "La loi impose aux sociétés de l’audiovisuel public d’assurer « l’honnêteté, l’indépendance et le pluralisme de l’information ainsi que l’expression pluraliste des courants de pensée et d’opinion ». Les présidents de France Télévisions, de Radio France et de France Médias Monde sont nommés pour cinq ans par l’Arcom, l’autorité de régulation de l’audiovisuel, à la majorité de ses membres. Cette décision doit être motivée et fondée sur leur compétence et leur expérience.",
            "source": {
              "title": "Loi n° 86-1067 du 30 septembre 1986 relative à la liberté de communication (articles 43-11 et 47-4, version en vigueur depuis le 27 octobre 2021)",
              "url": "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000512205",
              "date": "2021-10-27",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Une proposition de loi créerait une société mère (holding), « France Médias », chargée de définir les orientations stratégiques communes de France Télévisions, de Radio France et de l’INA. France Médias Monde n’en ferait pas partie. Le Sénat a adopté le texte en deuxième lecture le 11 juillet 2025, par 194 voix contre 113, puis l’a transmis à l’Assemblée nationale.",
            "source": {
              "title": "Proposition de loi relative à la réforme de l’audiovisuel public et à la souveraineté audiovisuelle – La loi en clair",
              "url": "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-relative-a-la-reforme-de-laudiovisuel-public-et-a-la-souverainete-audiovisuelle.html",
              "date": "2025-07-11",
              "publisher": "Sénat"
            }
          }
        ],
        "figures": [
          {
            "value": "3,863 Md€",
            "label": "Crédits votés pour l’audiovisuel public en 2026, dont 2,426 Md€ pour France Télévisions et 648 M€ pour Radio France (le reste va à Arte France, France Médias Monde, l’INA et TV5 Monde)",
            "date": "2026 (loi de finances, texte définitif du 2 février 2026)",
            "source": {
              "title": "Projet de loi de finances pour 2026 – Texte adopté n° 227 (texte définitif)",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/PRJLANR5L17BTA0227.html",
              "date": "2026-02-02",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "part",
              "value": 2.426,
              "total": 3.863,
              "unit": "Md€",
              "whole": "des crédits votés pour l’audiovisuel public"
            }
          },
          {
            "value": "80 %",
            "label": "Part des concours publics dans le budget de France Télévisions, stable à 3 Md€ de 2017 à 2023. Entre 2018 et 2022, le concours de l’État à ses ressources a baissé de 161 M€. En 2024, son chiffre d’affaires a atteint 3,3 Md€",
            "date": "2017-2024 (rapport publié le 23 septembre 2025)",
            "source": {
              "title": "France Télévisions (rapport portant sur une entreprise publique)",
              "url": "https://www.ccomptes.fr/fr/publications/france-televisions",
              "date": "2025-09-23",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "part",
              "value": 80,
              "total": 100,
              "unit": "%",
              "whole": "du budget de France Télévisions"
            }
          },
          {
            "value": "179 M€",
            "label": "Capitaux propres de France Télévisions en 2024, contre 294 M€ en 2017. Entre 2017 et 2024, ses résultats nets cumulés affichent un déficit de 81 M€. Selon la Cour, l’État, son actionnaire, doit avant le 31 décembre 2026 rétablir ces fonds propres ou réduire le capital",
            "date": "2017-2024 (rapport publié le 23 septembre 2025)",
            "source": {
              "title": "France Télévisions (rapport portant sur une entreprise publique)",
              "url": "https://www.ccomptes.fr/fr/publications/france-televisions",
              "date": "2025-09-23",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "series",
              "unit": "M€",
              "items": [
                {
                  "label": "2017",
                  "value": 294
                },
                {
                  "label": "2024",
                  "value": 179
                }
              ]
            }
          },
          {
            "value": "138 €",
            "label": "Montant annuel de la redevance (contribution à l’audiovisuel public) en métropole avant sa suppression en 2022, contre 88 € en outre-mer. Gelée depuis 2018, elle était payée par près de 23 millions de foyers et 80 000 entreprises",
            "date": "Montant gelé de 2018 à sa suppression en 2022 (rapport du 23 novembre 2023)",
            "source": {
              "title": "Projet de loi de finances pour 2024 : Médias, livre et industries culturelles – Avances à l’audiovisuel public (rapport général n° 128, tome III, annexe 19)",
              "url": "https://www.senat.fr/rap/l23-128-319/l23-128-31910.html",
              "date": "2023-11-23",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Redevance en métropole",
                  "value": 138
                },
                {
                  "label": "Redevance en outre-mer",
                  "value": 88
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "societe-1-a",
          "text": "Privatiser l’essentiel de l’audiovisuel public, à commencer par les chaînes de télévision"
        },
        {
          "id": "societe-1-b",
          "text": "Privatiser une partie des chaînes publiques et n’en garder que deux, l’une locale, l’autre culturelle"
        },
        {
          "id": "societe-1-c",
          "text": "Remplacer son financement public par un chèque que chaque foyer attribue au média de son choix"
        },
        {
          "id": "societe-1-d",
          "text": "Conserver un audiovisuel public en réformant ses structures et en réduisant ses coûts"
        },
        {
          "id": "societe-1-e",
          "text": "Garantir son financement et ses effectifs, sans fusion de sociétés, et renforcer son indépendance"
        },
        {
          "id": "societe-1-f",
          "text": "Conserver un audiovisuel public en contrôlant davantage le pluralisme et l’équilibre politique de ses programmes"
        }
      ]
    },
    {
      "id": "societe-2",
      "topicId": "societe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour la politique culturelle ?",
      "context": "Aujourd’hui : le pass Culture accorde aux jeunes un crédit individuel pour leurs achats et sorties culturels.",
      "explainer": {
        "summary": "L’État soutient la culture par le budget du ministère, le financement de l’audiovisuel public, un crédit pour les jeunes et des quotas imposés aux chaînes. Le débat porte sur le montant, à augmenter ou à réduire, et sur les priorités : patrimoine ou création, revenus des artistes, crédit individuel ou actions à l’école, aides liées ou non à des résultats, niveau des quotas.",
        "points": [
          {
            "text": "Le pass Culture individuel donne 50 € à 17 ans, puis 150 € à 18 ans, à dépenser en 3 ans. Un bonus de 50 € à 18 ans est annoncé « dans les mois à venir », sous conditions (handicap, ressources de la famille). Une « part collective », gérée par les enseignants, finance aussi des activités artistiques et culturelles pour les élèves, de la 6e à la terminale.",
            "source": {
              "title": "Le pass Culture, c’est quoi ?",
              "url": "https://pass.culture.fr/le-pass-culture-cest-quoi",
              "date": "consulté le 7 octobre 2026",
              "publisher": "pass Culture (organisme public chargé du dispositif)"
            }
          },
          {
            "text": "La loi et un décret du 17 janvier 1990 imposent des quotas aux chaînes de télévision. Au moins 60 % du temps consacré aux œuvres audiovisuelles doit aller à des œuvres européennes, et au moins 40 % à des œuvres dont la langue originale est le français. Pour les chaînes hertziennes, ces parts valent aussi aux heures de grande écoute (18 h à 23 h). Les films diffusés suivent les mêmes parts, sur toute la grille comme entre 20 h 30 et 22 h 30 : 60 % de films européens et 40 % de films en langue française.",
            "source": {
              "title": "Les quotas à la télévision",
              "url": "https://www.arcom.fr/nous-connaitre-nos-missions/promouvoir-et-proteger-la-creation/les-quotas-la-television",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Arcom"
            }
          },
          {
            "text": "Une loi organique du 13 décembre 2024 a rendu durable le financement de l’audiovisuel public par une part de la TVA. Une loi organique est un texte de rang supérieur aux lois ordinaires, mais inférieur à la Constitution. Le montant reste fixé chaque année par le Parlement, dans la loi de finances. Le cinéma et la production audiovisuelle sont aidés par le Centre national du cinéma et de l’image animée (CNC). Le CNC ne reçoit pas de crédits du budget de l’État : il est financé par des taxes qui lui sont réservées. En 2026, son fonds de soutien devrait dépenser 810,3 M€.",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Médias, livre et industries culturelles – Avances à l’audiovisuel public (rapport général n° 139, tome III, annexe 18)",
              "url": "https://www.senat.fr/rap/l25-139-318/l25-139-318_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            }
          }
        ],
        "figures": [
          {
            "value": "3,745 Md€",
            "label": "de crédits de paiement votés pour 2026 pour la mission budgétaire « Culture » : 1,137 Md€ pour les patrimoines, 998 M€ pour la création et 741 M€ pour la transmission des savoirs et la démocratisation de la culture ; le reste va au soutien des politiques du ministère. La presse, le livre et les industries culturelles relèvent d’une autre mission : 703 M€ votés pour 2026, dont 362 M€ pour la presse et les médias. L’audiovisuel public est financé à part",
            "date": "Loi de finances pour 2026 (texte définitif du 2 février 2026)",
            "source": {
              "title": "Projet de loi de finances pour 2026 – Texte adopté n° 227 (texte définitif)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17t0227_texte-adopte-seance.pdf",
              "date": "2026-02-02",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "value": "3,863 Md€",
            "label": "votés pour l’audiovisuel public pour 2026, dont 2,426 Md€ pour France Télévisions et 648 M€ pour Radio France. Le reste va à Arte France, France Médias Monde, l’INA et TV5 Monde",
            "date": "Loi de finances pour 2026 (texte définitif du 2 février 2026)",
            "source": {
              "title": "Projet de loi de finances pour 2026 – Texte adopté n° 227 (texte définitif)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17t0227_texte-adopte-seance.pdf",
              "date": "2026-02-02",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "value": "75 %",
            "label": "des jeunes ont utilisé leur pass Culture individuel, quand le crédit à 18 ans était de 300 €, et y ont dépensé en moyenne un peu plus de 250 €. 16 % n’y ont pas adhéré, « les publics les moins familiers des pratiques culturelles » selon la Cour, et 9 % ont téléchargé l’application sans l’utiliser. Dépense prévue pour 2024 : 244 M€ pour la part individuelle (93 M€ en 2021) et 80 M€ pour la part collective, financée par l’Éducation nationale",
            "date": "Fin août 2024 ; dépenses prévues pour 2024 (rapport du 17 décembre 2024)",
            "source": {
              "title": "Premier bilan du pass Culture",
              "url": "https://www.ccomptes.fr/fr/publications/premier-bilan-du-pass-culture",
              "date": "2024-12-17",
              "publisher": "Cour des comptes"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Ont utilisé leur pass",
                  "value": 75
                },
                {
                  "label": "N’ont pas adhéré",
                  "value": 16
                },
                {
                  "label": "Appli téléchargée sans usage",
                  "value": 9
                }
              ]
            }
          },
          {
            "value": "72 %",
            "label": "des élèves concernés par la part collective du pass Culture ont bénéficié d’au moins une action financée par elle (sortie, venue d’un professionnel en classe…). 96 % des établissements scolaires ont fait au moins une réservation",
            "date": "Année scolaire 2023-2024",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Culture (rapport général n° 139, tome III, annexe 7)",
              "url": "https://www.senat.fr/rap/l25-139-37/l25-139-37_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "part",
              "value": 72,
              "total": 100,
              "unit": "%",
              "whole": "des élèves concernés par la part collective"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "societe-2-a",
          "text": "Augmenter nettement le budget public de la culture et sécuriser les revenus des artistes"
        },
        {
          "id": "societe-2-b",
          "text": "Remplacer le crédit culturel individuel des jeunes par des interventions d’artistes dans les écoles"
        },
        {
          "id": "societe-2-c",
          "text": "Donner la priorité à la restauration du patrimoine et à la transmission de la culture française"
        },
        {
          "id": "societe-2-d",
          "text": "Lier les subventions culturelles à des résultats mesurés (public, diffusion) et au pluralisme"
        },
        {
          "id": "societe-2-e",
          "text": "Réduire les subventions publiques au cinéma, à la presse et à certaines associations"
        },
        {
          "id": "societe-2-f",
          "text": "Renforcer les quotas de diffusion d’œuvres françaises et européennes et le soutien au cinéma"
        }
      ]
    },
    {
      "id": "numerique-1",
      "topicId": "numerique",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité face au développement de l’intelligence artificielle (IA) ?",
      "context": "Aujourd’hui : un règlement européen, en vigueur depuis 2024, encadre les usages de l’IA selon leur niveau de risque.",
      "explainer": {
        "summary": "L’intelligence artificielle (IA) se diffuse vite dans les entreprises et dans la vie quotidienne, et ses effets sur l’emploi restent difficiles à mesurer. Le désaccord porte sur la priorité : alléger les règles pour innover plus vite, investir massivement ou accorder des avantages fiscaux, soumettre les IA les plus puissantes à une autorité publique et interdire certains usages, placer le développement de l’IA sous contrôle public, ou limiter les centres de données selon leur consommation d’eau et d’électricité.",
        "points": [
          {
            "text": "Le règlement européen sur l’IA s’applique par étapes. Les pratiques interdites le sont depuis le 2 février 2025. Les règles visant les grands modèles « à usage général », capables d’accomplir de nombreuses tâches, s’appliquent depuis le 2 août 2025. Une révision présentée par la Commission comme une simplification (« omnibus de l’IA ») est entrée en vigueur le 27 juillet 2026. Elle reporte les obligations des systèmes « à haut risque » au 2 décembre 2027 dans des domaines sensibles (biométrie, éducation, emploi, contrôle aux frontières…), et au 2 août 2028 pour les systèmes intégrés dans des produits (ascenseurs, jouets…).",
            "source": {
              "title": "Législation sur l’IA",
              "url": "https://digital-strategy.ec.europa.eu/fr/policies/regulatory-framework-ai",
              "date": "2026-08-03",
              "publisher": "Commission européenne"
            }
          },
          {
            "text": "Ce règlement interdit déjà certains usages, par exemple la notation sociale, la reconnaissance des émotions sur les lieux de travail et dans les établissements d’enseignement, ou la collecte non ciblée d’images sur internet ou de vidéosurveillance pour constituer des bases de reconnaissance faciale. Certains grands modèles « à usage général » peuvent comporter des « risques systémiques » s’ils sont très performants ou largement utilisés. Le Bureau de l’IA, un service de la Commission européenne, détient des pouvoirs d’exécution sur ces modèles : il peut notamment demander une documentation technique, évaluer les modèles et infliger des amendes.",
            "source": {
              "title": "Législation sur l’IA",
              "url": "https://digital-strategy.ec.europa.eu/fr/policies/regulatory-framework-ai",
              "date": "2026-08-03",
              "publisher": "Commission européenne"
            }
          },
          {
            "text": "En février 2025, la Commission européenne a lancé InvestAI, une initiative qui vise à mobiliser 200 milliards d’euros d’investissements dans l’IA. Elle comprend un fonds européen de 20 milliards d’euros pour des « giga-fabriques » d’IA : de très grands centres de calcul destinés à entraîner les modèles les plus complexes. Le financement initial devait venir de programmes européens existants, et les États membres peuvent y contribuer.",
            "source": {
              "title": "L’UE lance l’initiative InvestAI, destinée à mobiliser 200 milliards d’euros d’investissements dans l’intelligence artificielle (IP/25/467)",
              "url": "https://ec.europa.eu/commission/presscorner/detail/fr/ip_25_467",
              "date": "2025-02-11",
              "publisher": "Commission européenne"
            }
          }
        ],
        "figures": [
          {
            "value": "18,16 %",
            "label": "Part des entreprises d’au moins 10 personnes utilisant au moins une technologie d’IA, France (9,91 % en 2024 ; Union européenne : 13,48 % en 2024 et 19,95 % en 2025). Champ : industrie, construction, commerce et principaux services marchands, hors finance",
            "date": "2025",
            "source": {
              "title": "Use of artificial intelligence in enterprises (Statistics Explained)",
              "url": "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises",
              "date": "2025-12-10",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France, 2024",
                  "value": 9.91
                },
                {
                  "label": "France, 2025",
                  "value": 18.16
                },
                {
                  "label": "Union européenne, 2024",
                  "value": 13.48
                },
                {
                  "label": "Union européenne, 2025",
                  "value": 19.95
                }
              ]
            }
          },
          {
            "value": "34 %",
            "label": "Part de l’emploi exposé, au moins en partie, à l’IA générative dans les pays à revenu élevé (11 % dans les pays à faible revenu). Dans le monde, un travailleur sur quatre est concerné, et 3,3 % de l’emploi relève de la catégorie d’exposition la plus forte. Pour l’OIT, comme la plupart des métiers comportent des tâches qui exigent une intervention humaine, l’effet le plus probable est une transformation des emplois",
            "date": "2025-05-20",
            "source": {
              "title": "Generative AI and jobs: A refined global index of occupational exposure (ILO Working Paper 140)",
              "url": "https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure",
              "date": "2025-05-20",
              "publisher": "Organisation internationale du travail (OIT)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Pays à revenu élevé",
                  "value": 34
                },
                {
                  "label": "Pays à faible revenu",
                  "value": 11
                }
              ]
            }
          },
          {
            "value": "10 TWh",
            "label": "Consommation annuelle d’électricité des quelque 300 centres de données présents en France, estimée par RTE : environ 2 % de la consommation française d’électricité. Dans une trajectoire de « décarbonation rapide » étudiée par son Bilan prévisionnel 2025-2035, elle pourrait atteindre 15 à 20 TWh en 2030 (environ 3 %), puis 23 à 28 TWh en 2035 (4 %)",
            "date": "Estimation 2026 (page publiée le 21 mai 2025, mise à jour le 1er juin 2026)",
            "source": {
              "title": "Les data centers en chiffres clés",
              "url": "https://www.rte-france.com/bases-electricite/consommation-electricite/essor-data-centers-france",
              "date": "2026-06-01",
              "publisher": "RTE (Réseau de transport d’électricité)"
            },
            "chart": {
              "kind": "part",
              "value": 2,
              "total": 100,
              "unit": "%",
              "whole": "de la consommation française d’électricité"
            }
          },
          {
            "value": "575 000 m³",
            "label": "Volume d’eau, en quasi-totalité potable, prélevé en 2024 par les centres de données des 23 principaux opérateurs qui hébergent les équipements d’autres organisations (colocation), soit près de 160 centres en France ; les centres qu’une organisation exploite pour son propre usage ne sont pas couverts. Selon l’Arcep, ce volume « reste modeste » comparé aux usages industriels ou agricoles, mais peut créer des « conflits d’usage » de l’eau là où les centres sont implantés",
            "date": "2024 (édition 2026 de l’enquête, mise à jour le 21 mai 2026)",
            "source": {
              "title": "Enquête annuelle « Pour un numérique soutenable » – édition 2026 (données 2024)",
              "url": "https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees/impact-environnemental/derniers-chiffres.html",
              "date": "2026-05-21",
              "publisher": "Arcep (Autorité de régulation des communications électroniques, des postes et de la distribution de la presse)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "numerique-1-a",
          "text": "Alléger les règles européennes sur l’IA et les données pour laisser les entreprises innover plus vite"
        },
        {
          "id": "numerique-1-b",
          "text": "Investir massivement dans la puissance de calcul et dans des entreprises françaises ou européennes de l’IA"
        },
        {
          "id": "numerique-1-c",
          "text": "Accorder des avantages fiscaux aux entreprises qui investissent dans l’IA, le numérique ou les robots"
        },
        {
          "id": "numerique-1-d",
          "text": "Soumettre les IA les plus puissantes au contrôle d’une autorité publique et interdire certains usages"
        },
        {
          "id": "numerique-1-e",
          "text": "Placer le développement de l’IA sous contrôle public, au service de besoins collectifs comme la santé"
        },
        {
          "id": "numerique-1-f",
          "text": "Limiter l’implantation des centres de données selon leur consommation d’eau et d’électricité"
        }
      ]
    },
    {
      "id": "numerique-2",
      "topicId": "numerique",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment protéger les enfants et les adolescents face aux écrans et aux réseaux sociaux ?",
      "context": "Aujourd’hui : l’interdiction des réseaux sociaux avant 15 ans, votée en juillet 2026, a été censurée par le Conseil constitutionnel en août 2026.",
      "explainer": {
        "summary": "Les enfants accèdent tôt aux écrans et aux réseaux sociaux, et les autorités sanitaires documentent des risques pour le sommeil et la santé mentale des adolescents. Le désaccord porte sur l’outil : interdire les réseaux sociaux avant 15 ans, fixer des règles d’usage des écrans par âge, interdire aux mineurs certaines fonctions (défilement infini, notifications, publicité ciblée), miser sur l’éducation et le contrôle parental, ou refuser toute interdiction selon l’âge et toute vérification d’identité en ligne, au nom des libertés.",
        "points": [
          {
            "text": "Le Conseil constitutionnel admet que la protection des mineurs puisse justifier de limiter leur accès aux réseaux sociaux. Il a toutefois jugé que l’interdiction avant 15 ans portait à la liberté d’expression et de communication une atteinte qui n’est pas « adaptée, nécessaire et proportionnée ». Elle visait tous les réseaux, sans tenir compte de leurs fonctions ni de leurs contenus, et rien ne permettait aux parents de la lever ou de l’adapter. Elle imposait aussi à chacun, même majeur, de prouver son âge, sans que la loi fixe les garanties nécessaires pour protéger la vie privée.",
            "source": {
              "title": "Décision n° 2026-911 DC du 14 août 2026 – Loi visant à protéger les mineurs des risques auxquels les expose l’utilisation des réseaux sociaux",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026911DC.htm",
              "date": "2026-08-14",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "En janvier 2026, l’Anses a publié une expertise fondée sur plus d’un millier d’études scientifiques. Elle relève des risques surtout pour la santé mentale des adolescents (sommeil altéré, dévalorisation de soi, contenus liés à des comportements à risque, cyberharcèlement), plus marqués chez les filles. Elle recommande de n’ouvrir aux mineurs que des réseaux conçus et paramétrés pour protéger leur santé, et de faire respecter la limite d’âge prévue par le règlement européen sur la protection des données (pas d’accès avant 13 ans), avec une vérification fiable de l’âge et le recueil du consentement parental. Elle insiste aussi sur l’éducation au numérique et l’accompagnement parental.",
            "source": {
              "title": "Sécuriser les usages des réseaux sociaux pour protéger la santé des adolescents",
              "url": "https://www.anses.fr/fr/actualite/securiser-usages-reseaux-sociaux-proteger-sante-adolescents",
              "date": "2026-01-13",
              "publisher": "Anses (Agence nationale de sécurité sanitaire de l’alimentation, de l’environnement et du travail)"
            }
          },
          {
            "text": "Le 17 septembre 2026, la Commission européenne a proposé un texte, le « KIDS Act ». Il prévoit : pas de réseau social avant 13 ans ; de 13 à 15 ans, un « mini-compte » géré par un parent, aux fonctions limitées, une heure par jour au plus ; un compte personnel à partir de 15 ans. Il limiterait aussi des fonctions comme le défilement infini ou les notifications pendant les heures de sommeil, et imposerait une vérification de l’âge qui protège la vie privée. Le Parlement européen et le Conseil doivent encore l’examiner et en arrêter le texte.",
            "source": {
              "title": "EU KIDS Act: helping children navigate a safer online world",
              "url": "https://commission.europa.eu/news-and-media/news/eu-kids-act-helping-children-navigate-safer-online-world-2026-09-17_en",
              "date": "2026-09-17",
              "publisher": "Commission européenne"
            }
          }
        ],
        "figures": [
          {
            "value": "25 %",
            "label": "Part des enfants de 9 à 11 ans ayant accès aux réseaux sociaux (30 % chez les filles de cet âge ; moins de 2 % des 3-5 ans), alors que l’âge minimum pour s’y inscrire est de 13 ans en France, rappelle Santé publique France. Enfants scolarisés en France hexagonale",
            "date": "2022 (publié le 25 septembre 2025)",
            "source": {
              "title": "Temps d’écran des enfants de 3 à 11 ans : un usage précoce, quotidien et marqué par les inégalités sociales (étude Enabee)",
              "url": "https://www.santepubliquefrance.fr/presse/temps-decran-des-enfants-de-3-a-11-ans-un-usage-precoce-quotidien-et-marque-par-les",
              "date": "2025-09-25",
              "publisher": "Santé publique France"
            },
            "chart": {
              "kind": "part",
              "value": 25,
              "total": 100,
              "unit": "%",
              "whole": "des enfants de 9 à 11 ans"
            }
          },
          {
            "value": "2 h 33",
            "label": "Temps d’écran quotidien moyen des 9-11 ans sur leur temps de loisirs (1 h 22 chez les 3-5 ans). Enfants scolarisés en France hexagonale",
            "date": "2022 (publié le 25 septembre 2025)",
            "source": {
              "title": "Temps d’écran des enfants de 3 à 11 ans : un usage précoce, quotidien et marqué par les inégalités sociales (étude Enabee)",
              "url": "https://www.santepubliquefrance.fr/presse/temps-decran-des-enfants-de-3-a-11-ans-un-usage-precoce-quotidien-et-marque-par-les",
              "date": "2025-09-25",
              "publisher": "Santé publique France"
            }
          },
          {
            "value": "9 sur 10",
            "label": "Parents d’enfants de 3 à 11 ans qui déclarent limiter « toujours » ou « souvent » leur temps d’écran. Le contrôle des contenus est moins répandu et baisse avec l’âge : 52 % des parents de 3-5 ans et 36 % de ceux de 9-11 ans empêchent « souvent » l’accès à certains contenus. France hexagonale",
            "date": "2022 (publié le 25 septembre 2025)",
            "source": {
              "title": "Temps d’écran des enfants de 3 à 11 ans : un usage précoce, quotidien et marqué par les inégalités sociales (étude Enabee)",
              "url": "https://www.santepubliquefrance.fr/presse/temps-decran-des-enfants-de-3-a-11-ans-un-usage-precoce-quotidien-et-marque-par-les",
              "date": "2025-09-25",
              "publisher": "Santé publique France"
            },
            "chart": {
              "kind": "part",
              "value": 9,
              "total": 10,
              "whole": "parents d’enfants de 3 à 11 ans"
            }
          },
          {
            "value": "11 %",
            "label": "Part des jeunes de 11, 13 et 15 ans présentant des signes d’usage problématique des réseaux sociaux, c’est-à-dire des symptômes proches de l’addiction : perte de contrôle, manque, activités délaissées (7 % en 2018 ; filles 13 %, garçons 9 %). Enquête HBSC auprès de près de 280 000 jeunes de 44 pays et régions d’Europe, d’Asie centrale et du Canada",
            "date": "2022 (publié le 25 septembre 2024)",
            "source": {
              "title": "Teens, screens and mental health",
              "url": "https://www.who.int/europe/news/item/25-09-2024-teens--screens-and-mental-health",
              "date": "2024-09-25",
              "publisher": "Organisation mondiale de la santé, bureau régional pour l’Europe"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2018",
                  "value": 7
                },
                {
                  "label": "2022",
                  "value": 11
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "numerique-2-a",
          "text": "Interdire l’accès aux réseaux sociaux avant 15 ans, avec une vérification obligatoire de l’âge"
        },
        {
          "id": "numerique-2-b",
          "text": "Fixer des règles d’usage des écrans par âge : aucun écran avant 5 ans, pas de smartphone avant 15 ans"
        },
        {
          "id": "numerique-2-c",
          "text": "Interdire pour les mineurs le défilement infini, les notifications et la publicité ciblée"
        },
        {
          "id": "numerique-2-d",
          "text": "Miser sur l’éducation au numérique et le contrôle parental plutôt que sur des interdictions légales"
        },
        {
          "id": "numerique-2-e",
          "text": "Refuser toute interdiction selon l’âge et toute vérification d’identité en ligne, au nom des libertés"
        }
      ]
    },
    {
      "id": "numerique-3",
      "topicId": "numerique",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment encadrer les grandes plateformes numériques ?",
      "context": "Aujourd’hui : un règlement européen impose aux très grandes plateformes des obligations de modération et de transparence.",
      "explainer": {
        "summary": "Les très grandes plateformes sont surtout encadrées par le droit européen, en particulier le règlement sur les services numériques, que la Commission européenne fait appliquer. Le désaccord porte sur la priorité : encadrer et taxer davantage les plateformes (désinformation et ingérences étrangères, transparence des algorithmes, contribution à la culture et à la presse, démantèlement en cas d’abus de position dominante), ou bien faire primer la liberté d’expression en ligne, en abrogeant ces règles, en l’inscrivant plus largement dans la Constitution ou en empêchant les plateformes de retirer d’elles-mêmes des contenus légaux.",
        "points": [
          {
            "text": "Le règlement européen sur les services numériques encadre déjà la modération. Quand une plateforme supprime ou suspend un contenu, elle doit en expliquer les raisons. L’utilisateur peut contester cette décision auprès d’elle ou d’un organisme de règlement extrajudiciaire des litiges, plus rapide et moins coûteux qu’un procès. Sur les très grandes plateformes (plus de 45 millions d’utilisateurs par mois dans l’UE), chacun peut choisir un fil non personnalisé, qui ne tient pas compte de son profil.",
            "source": {
              "title": "Le règlement sur les services numériques",
              "url": "https://digital-strategy.ec.europa.eu/fr/policies/digital-services-act",
              "date": "2026-10-01",
              "publisher": "Commission européenne"
            }
          },
          {
            "text": "Une loi de 2018 contre la manipulation de l’information permet de saisir un juge en urgence (en référé) pendant les trois mois qui précèdent le mois d’une élection générale ou d’un référendum, et jusqu’au scrutin. Il peut faire cesser la diffusion d’allégations inexactes ou trompeuses de nature à altérer la sincérité du scrutin, si cette diffusion est à la fois délibérée, artificielle ou automatisée, et massive. Les opinions et les parodies ne sont pas visées. Le Conseil constitutionnel a validé ce dispositif, à condition que le caractère inexact ou trompeur, comme le risque pour le scrutin, soit « manifeste ».",
            "source": {
              "title": "Décision n° 2018-773 DC du 20 décembre 2018 – Loi relative à la lutte contre la manipulation de l’information",
              "url": "https://www.conseil-constitutionnel.fr/decision/2018/2018773DC.htm",
              "date": "2018-12-20",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Une loi de 2019 a créé un « droit voisin » au profit des éditeurs et agences de presse : la reprise en ligne de leurs publications doit être autorisée et rémunérée. Les négociations engagées en 2024 entre Meta et deux organismes de presse n’ont pas abouti (montant, usages et services concernés), et leurs membres ne perçoivent plus de rémunération de Meta depuis la fin des premiers accords. Le 8 juillet 2026, à titre provisoire, l’Autorité de la concurrence a ordonné à Meta de négocier de bonne foi, jugeant ses pratiques susceptibles de constituer un abus de position dominante. Meta a formé des recours, dont l’audience devant la cour d’appel de Paris était fixée au 17 septembre 2026.",
            "source": {
              "title": "Audience de la cour d’appel de Paris du 17 septembre 2026, dans des instances opposant Meta à l’Alliance de la presse d’information générale et à la Société des droits voisins de la presse",
              "url": "https://www.cours-appel.justice.fr/sites/default/files/2026-09/Communiqu%C3%A9%20de%20presse%20CA%20Paris%20audience%20META%2020260917%20%285-7%29_0.pdf",
              "date": "2026-09",
              "publisher": "Cour d’appel de Paris"
            }
          }
        ],
        "figures": [
          {
            "value": "550 M€",
            "label": "Amendes infligées par la Commission européenne au titre du règlement sur les services numériques : 550 M€ à AliExpress (juillet 2026), contre 200 M€ à Temu (mai 2026) et 120 M€ à X (décembre 2025)",
            "date": "Situation au 31 août 2026 (dernière mise à jour de la liste)",
            "source": {
              "title": "Supervision des très grandes plateformes en ligne et moteurs de recherche désignés au titre du règlement sur les services numériques",
              "url": "https://digital-strategy.ec.europa.eu/fr/policies/list-designated-vlops-and-vloses",
              "date": "2026-09-07",
              "publisher": "Commission européenne"
            },
            "chart": {
              "kind": "compare",
              "unit": "M€",
              "items": [
                {
                  "label": "AliExpress (juillet 2026)",
                  "value": 550
                },
                {
                  "label": "Temu (mai 2026)",
                  "value": 200
                },
                {
                  "label": "X (décembre 2025)",
                  "value": 120
                }
              ]
            }
          },
          {
            "value": "3 %",
            "label": "Taux de la taxe sur les services numériques, appliqué au chiffre d’affaires tiré en France de la publicité ciblée et des services d’intermédiation en ligne. Elle vise les entreprises dont ces services dépassent 750 millions d’euros de chiffre d’affaires dans le monde et 25 millions d’euros en France",
            "date": "Règle en vigueur (consultée le 7 octobre 2026)",
            "source": {
              "title": "Code des impositions sur les biens et services – Section 5 : Taxe sur certains services numériques (articles L453-45 à L453-83)",
              "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000044595989/LEGISCTA000048626177/",
              "date": "2024-01-01",
              "publisher": "Légifrance"
            }
          },
          {
            "value": "20 %",
            "label": "Part minimale de leur chiffre d’affaires annuel net que les services de vidéo à la demande par abonnement, y compris ceux établis à l’étranger qui visent la France, doivent consacrer chaque année à la production d’œuvres cinématographiques et audiovisuelles européennes ou d’expression originale française (25 % s’ils proposent un film moins de douze mois après sa sortie en salles en France)",
            "date": "Règle en vigueur (article 14 du décret du 22 juin 2021, version en vigueur depuis le 1er janvier 2022, consultée le 7 octobre 2026)",
            "source": {
              "title": "Décret n° 2021-793 du 22 juin 2021 relatif aux services de médias audiovisuels à la demande (version consolidée)",
              "url": "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043688681/",
              "date": "2022-01-01",
              "publisher": "Légifrance"
            },
            "chart": {
              "kind": "part",
              "value": 20,
              "total": 100,
              "unit": "%",
              "whole": "du chiffre d’affaires annuel net"
            }
          },
          {
            "value": "24 heures",
            "label": "Délai dans lequel une loi votée en 2020 prévoyait d’obliger les grands opérateurs de plateformes, sous peine de sanction pénale, à retirer les contenus haineux ou sexuels manifestement illicites qui leur étaient signalés. Le Conseil constitutionnel a censuré cette obligation, jamais entrée en vigueur : elle ne pouvait qu’inciter à retirer les contenus signalés, « qu’ils soient ou non manifestement illicites ». Il rappelle que la loi peut faire cesser les abus de la liberté d’expression, protégée par l’article 11 de la Déclaration de 1789, mais que toute atteinte à cette liberté doit être « nécessaire, adaptée et proportionnée »",
            "date": "Décision du 18 juin 2020",
            "source": {
              "title": "Décision n° 2020-801 DC du 18 juin 2020 – Loi visant à lutter contre les contenus haineux sur internet",
              "url": "https://www.conseil-constitutionnel.fr/decision/2020/2020801DC.htm",
              "date": "2020-06-18",
              "publisher": "Conseil constitutionnel"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "numerique-3-a",
          "text": "Renforcer la lutte contre la désinformation et les ingérences étrangères diffusées sur les plateformes"
        },
        {
          "id": "numerique-3-b",
          "text": "Imposer aux plateformes la transparence de leurs algorithmes, sans interdire de réseau social"
        },
        {
          "id": "numerique-3-c",
          "text": "Faire contribuer les plateformes au financement de la création culturelle et de la presse"
        },
        {
          "id": "numerique-3-d",
          "text": "Abroger le règlement européen sur les services numériques et les lois qui encadrent la parole en ligne"
        },
        {
          "id": "numerique-3-e",
          "text": "Inscrire dans la Constitution une liberté d’expression aussi étendue que celle des États-Unis"
        },
        {
          "id": "numerique-3-f",
          "text": "Interdire aux plateformes de supprimer d’elles-mêmes des contenus ou des comptes qui respectent la loi"
        },
        {
          "id": "numerique-3-g",
          "text": "Taxer davantage les grandes plateformes numériques et les démanteler en cas d’abus de position dominante"
        }
      ]
    },
    {
      "id": "numerique-4",
      "topicId": "numerique",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle place pour l’intelligence artificielle (IA) et les écrans à l’école ?",
      "explainer": {
        "summary": "La plupart des jeunes de 16 et 17 ans utilisent déjà l’IA générative, y compris pour leurs études, tandis que l’école encadre de plus en plus les écrans. Les approches divergent sur la place à leur donner : tenir l’IA et les écrans à distance des plus jeunes, former tous les élèves à l’IA, dès le plus jeune âge ou avec un assistant pour chacun, créer des outils publics et former les enseignants, ou miser d’abord sur l’esprit critique.",
        "points": [
          {
            "text": "Le Code de l’éducation impose une formation à l’usage responsable du numérique, qui doit développer l’esprit critique. Dans sa version de mai 2024, il prévoit une attestation de sensibilisation au bon usage des outils numériques et de l’IA, aux contenus qu’ils génèrent et aux risques de désinformation. Elle est obligatoire à la fin de la 6e et doit être renouvelée à la fin de la 3e.",
            "source": {
              "title": "Code de l’éducation – article L312-9 (version en vigueur depuis le 23 mai 2024)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049571494",
              "date": "2024-05-23",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Depuis 2018, le téléphone portable est interdit aux élèves des écoles et des collèges. Depuis la rentrée 2026, l’interdiction s’étend au lycée (loi du 24 août 2026). Chaque établissement peut prévoir des exceptions dans son règlement intérieur, et l’usage reste permis pour un motif médical.",
            "source": {
              "title": "Interdiction du téléphone portable au lycée dès la rentrée 2026 : quelles sont les modalités ?",
              "url": "https://www.service-public.gouv.fr/particuliers/actualites/A19051",
              "date": "2026-08-25",
              "publisher": "Service-public.fr (Direction de l’information légale et administrative)"
            }
          },
          {
            "text": "Selon le cadre d’usage de l’IA publié par le ministère de l’Éducation nationale le 14 juin 2025, les élèves ne peuvent utiliser seuls ces outils qu’à partir de la 4e. Faire un devoir avec l’IA générative sans autorisation explicite ni travail personnel est considéré comme une fraude. Le ministère a aussi prévu, à partir de la rentrée 2025, une courte formation à l’IA sur la plateforme en ligne Pix, obligatoire pour les élèves de 4e et de 2de.",
            "source": {
              "title": "Communiqué de presse – Publication du cadre d’usage de l’intelligence artificielle en éducation (14 juin 2025), mis en ligne par l’académie d’Orléans-Tours",
              "url": "https://pedagogie.ac-orleans-tours.fr/documents/pdf/cp_14062025_cadre_d_usage_ia.pdf",
              "date": "2025-06-14",
              "publisher": "Ministère de l’Éducation nationale, de l’Enseignement supérieur et de la Recherche"
            }
          }
        ],
        "figures": [
          {
            "value": "70,22 %",
            "label": "Part des jeunes de 16 et 17 ans ayant utilisé un outil d’IA générative pour leurs études au cours des trois derniers mois, en France ; 79,01 % tous usages confondus. Dans l’Union européenne : 51,72 % pour les études et 66,68 % tous usages confondus",
            "date": "2025 (données mises à jour le 5 juin 2026)",
            "source": {
              "title": "Individuals – use of generative AI tools (isoc_ai_iaiu)",
              "url": "https://ec.europa.eu/eurostat/databrowser/view/isoc_ai_iaiu/default/table?lang=fr",
              "date": "2026-06-05",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France, pour les études",
                  "value": 70.22
                },
                {
                  "label": "UE, pour les études",
                  "value": 51.72
                },
                {
                  "label": "France, tous usages",
                  "value": 79.01
                },
                {
                  "label": "UE, tous usages",
                  "value": 66.68
                }
              ]
            }
          },
          {
            "value": "58 %",
            "label": "Part des élèves de 15 ans en France qui déclarent avoir été distraits par l’utilisation d’appareils numériques pendant au moins quelques cours de mathématiques, contre 65 % en moyenne dans les pays de l’OCDE (enquête Pisa 2022)",
            "date": "2022 (enquête Pisa, étude publiée en mai 2024)",
            "source": {
              "title": "Élèves et écrans : performance académique et bien-être",
              "url": "https://www.oecd.org/content/dam/oecd/fr/publications/reports/2024/05/students-digital-devices-and-success_621829ff/b3c4552d-fr.pdf",
              "date": "2024-05",
              "publisher": "OCDE, Direction de l’éducation et des compétences"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France",
                  "value": 58
                },
                {
                  "label": "Moyenne OCDE",
                  "value": 65
                }
              ]
            }
          },
          {
            "value": "43 %",
            "label": "Part des élèves de 4e qui n’ont pas les compétences numériques de base selon l’enquête internationale ICILS de 2023 sur la maîtrise du numérique, un taux qui correspond à la moyenne de l’Union européenne. L’objectif de l’UE est de descendre sous les 15 %",
            "date": "2023 (rapport publié en 2025)",
            "source": {
              "title": "Rapport de suivi de l’éducation et de la formation 2025 – France",
              "url": "https://op.europa.eu/webpub/eac/education-and-training-monitor/fr/country-reports/france.html",
              "date": "2025",
              "publisher": "Commission européenne"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France et moyenne UE, 2023",
                  "value": 43
                },
                {
                  "label": "Plafond visé par l’UE",
                  "value": 15
                }
              ]
            }
          },
          {
            "value": "20 M€",
            "label": "Soutien public prévu (plan d’investissement de l’État « France 2030 ») pour un outil d’IA destiné à aider les enseignants à préparer et à évaluer leurs cours, attendu pour l’année scolaire 2026-2027",
            "date": "2026-2027 (prévision du rapport publié en 2025)",
            "source": {
              "title": "Rapport de suivi de l’éducation et de la formation 2025 – France",
              "url": "https://op.europa.eu/webpub/eac/education-and-training-monitor/fr/country-reports/france.html",
              "date": "2025",
              "publisher": "Commission européenne"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "numerique-4-a",
          "text": "Tenir l’IA à l’écart des élèves jusqu’au collège ou au lycée et retirer les écrans de l’école primaire"
        },
        {
          "id": "numerique-4-b",
          "text": "Doter chaque élève d’un assistant d’IA sécurisé et rendre obligatoire l’apprentissage de son usage"
        },
        {
          "id": "numerique-4-c",
          "text": "Former tous les enfants à l’usage de l’IA dès le plus jeune âge, à l’école et en dehors"
        },
        {
          "id": "numerique-4-d",
          "text": "Créer un service public de l’IA éducative et former tous les enseignants à ces outils"
        },
        {
          "id": "numerique-4-e",
          "text": "Développer à l’école l’esprit critique face aux écrans, aux réseaux sociaux et aux contenus d’IA"
        }
      ]
    },
    {
      "id": "ecologie_energie-1",
      "topicId": "ecologie_energie",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Face à la hausse des prix des carburants, quelle réponse privilégier ?",
      "context": "Aujourd’hui : les prix de l’essence et du gazole ont fortement augmenté en 2026 ; le prix à la pompe comprend le coût du pétrole, les marges de raffinage et de distribution et des taxes, qui en représentent une part importante.",
      "explainer": {
        "summary": "Depuis mars 2026, la hausse du prix du pétrole se répercute à la pompe et pèse davantage sur les ménages qui dépendent de leur voiture, notamment en zone rurale. Les approches divergent sur la réponse : baisse des taxes pour tous, aides ciblées, mise à contribution ou propriété publique du secteur pétrolier, ou réduction de l’usage du pétrole grâce à l’électricité et aux transports collectifs.",
        "points": [
          {
            "text": "Le prix à la pompe additionne le prix hors taxes et deux taxes : l’accise, un montant fixe par litre (60,75 centimes pour le gazole et 67,50 centimes pour le SP95-E10 au 1er août 2026), et la TVA, de 20 % sur le continent (13 % en Corse, pas de TVA outre-mer), qui s’applique au prix hors taxes et aussi à l’accise. Sur l’électricité, l’accise payée par les ménages est de 30,62 €/MWh depuis le 1er août 2026 ; pendant le « bouclier tarifaire », de février 2022 à janvier 2024, elle avait été abaissée à 1 €/MWh, le minimum permis par le droit européen pour les particuliers.",
            "source": {
              "title": "Guide 2026 sur la fiscalité des énergies",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies.pdf",
              "date": "2026",
              "publisher": "Ministères chargés de l’économie et de l’énergie (ecologie.gouv.fr)"
            }
          },
          {
            "text": "Après la forte hausse des prix des carburants à partir de mars 2026, l’État a créé un chèque de 100 € (50 € au départ), disponible à partir de juin, pour les ménages des cinq premiers déciles de revenus (la moitié la plus modeste) qui roulent plus de 8 000 km par an pour leur travail ou habitent à plus de 15 km de leur lieu de travail. Le Haut Conseil pour le climat relève qu’aucune aide n’est prévue pour les ménages précaires qui ne sont pas en emploi.",
            "source": {
              "title": "Rapport annuel 2026 – Chapitre 4 : suivi des émissions et des politiques publiques par secteur",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/RANC2026-Chapitre-4.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            }
          },
          {
            "text": "Pendant la crise de l’énergie, l’État a déployé près de 25 mesures exceptionnelles, surtout destinées aux ménages et, pour l’essentiel, non ciblées selon leurs revenus. Selon la Cour des comptes, les mesures sur le gaz et les carburants de 2021 et 2022 ont coûté plus de 17 Md€, et les boucliers tarifaires près de 72 Md€ bruts. Compte tenu notamment de 4,5 Md€ de contributions prélevées sur les marges des producteurs d’électricité et du secteur pétrolier, le besoin de financement net de l’État atteindrait 36 Md€ sur 2021-2024.",
            "source": {
              "title": "Les mesures exceptionnelles de lutte contre la hausse des prix de l’énergie",
              "url": "https://www.ccomptes.fr/fr/publications/les-mesures-exceptionnelles-de-lutte-contre-la-hausse-des-prix-de-lenergie",
              "date": "2024-03-15",
              "publisher": "Cour des comptes"
            }
          }
        ],
        "figures": [
          {
            "value": "235,55 centimes par litre",
            "label": "Prix moyen national du gazole à la pompe, toutes taxes comprises, semaine du 2 octobre 2026, contre 162,09 centimes un an plus tôt (+45,3 %). Hors taxes, il vaut 135,5 centimes : 106,7 pour la cotation internationale du gazole et 28,9 pour la part liée au transport et à la distribution ; le reste correspond aux taxes (accise et TVA). Au 25 septembre 2026, selon le bulletin pétrolier de la Commission européenne repris par la DGEC, le gazole valait 237,06 centimes TTC en France contre 223,72 en moyenne dans l’Union européenne ; hors taxes, 136,80 contre 137,51. SP95-E10 : 213,99 centimes (+26,2 % sur un an).",
            "date": "2026-10-02",
            "source": {
              "title": "Cours, prix et marges des produits pétroliers en France et dans l’Union européenne (données au 2 octobre 2026)",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/NPG-2026.10.02.pdf",
              "date": "2026-10-02",
              "publisher": "Ministère chargé de l’énergie (DGEC)"
            },
            "chart": {
              "kind": "series",
              "unit": "centimes par litre",
              "items": [
                {
                  "label": "Oct. 2025",
                  "value": 162.09
                },
                {
                  "label": "Oct. 2026",
                  "value": 235.55
                }
              ]
            }
          },
          {
            "value": "36,16 $ par baril",
            "label": "Marge brute de raffinage sur Brent en septembre 2026, soit 19,7 centimes par litre, contre 23,35 $ (12,7 centimes) en moyenne sur 2026 et 18,88 $ (10,5 centimes) début octobre (données provisoires). Cet indicateur de la DGEC mesure l’écart entre la valeur des produits raffinés et le prix du pétrole brut, avant les autres coûts des raffineurs.",
            "date": "2026-09",
            "source": {
              "title": "Cours, prix et marges des produits pétroliers en France et dans l’Union européenne (données au 2 octobre 2026)",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/NPG-2026.10.02.pdf",
              "date": "2026-10-02",
              "publisher": "Ministère chargé de l’énergie (DGEC)"
            },
            "chart": {
              "kind": "compare",
              "unit": "$ par baril",
              "items": [
                {
                  "label": "Moyenne 2026",
                  "value": 23.35
                },
                {
                  "label": "Septembre 2026",
                  "value": 36.16
                },
                {
                  "label": "Début octobre 2026",
                  "value": 18.88
                }
              ]
            }
          },
          {
            "value": "10,6 %",
            "label": "Part des ménages avec voiture qui ont consacré plus d’un mois de revenu annuel au carburant en 2021, soit 2,2 millions de ménages (13,5 % dans les intercommunalités rurales, 9,0 % dans les urbaines). Avec les prix du printemps 2026 appliqués aux revenus de 2021, cette part aurait été de 22,4 % (4,7 millions). France hors Mayotte.",
            "date": "2021",
            "source": {
              "title": "Les dépenses de carburant pèsent davantage sur le budget des ménages ruraux (Insee Première n° 2125)",
              "url": "https://www.insee.fr/fr/statistiques/9037833",
              "date": "2026-09-08",
              "publisher": "INSEE"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Aux prix de 2021",
                  "value": 10.6
                },
                {
                  "label": "Aux prix du printemps 2026",
                  "value": 22.4
                }
              ]
            }
          },
          {
            "value": "94 $ le baril",
            "label": "Prix moyen du Brent, pétrole brut de référence en Europe, de mars à mi-septembre 2026, soit 33 $ de plus qu’au début de l’année. Selon le Haut Conseil des finances publiques (HCFP), le conflit au Moyen-Orient perturbe la circulation maritime dans le détroit d’Ormuz. Côté budget, l’enveloppe de soutien liée aux carburants coûterait 0,7 Md€ en 2026, au lieu de 1,4 Md€ prévus, avant une prolongation des aides jusqu’à la fin de l’année que le Gouvernement chiffre à 450 M€.",
            "date": "mars à mi-septembre 2026 (avis du 25 septembre 2026)",
            "source": {
              "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027",
              "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
              "date": "2026-09-25",
              "publisher": "Haut Conseil des finances publiques"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-1-a",
          "text": "Baisser pour tous les automobilistes les taxes et prélèvements sur l’essence et le gazole"
        },
        {
          "id": "ecologie_energie-1-b",
          "text": "Faire payer le secteur pétrolier en bloquant les prix, en plafonnant ses marges ou en taxant ses profits"
        },
        {
          "id": "ecologie_energie-1-c",
          "text": "Réserver les aides aux ménages modestes et à ceux qui dépendent de leur voiture pour travailler"
        },
        {
          "id": "ecologie_energie-1-d",
          "text": "Placer les groupes pétroliers et énergétiques sous propriété publique pour décider des prix"
        },
        {
          "id": "ecologie_energie-1-e",
          "text": "Baisser le prix de l’électricité et développer les transports collectifs pour réduire l’usage du pétrole"
        }
      ]
    },
    {
      "id": "ecologie_energie-2",
      "topicId": "ecologie_energie",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quelle place donner au nucléaire et aux renouvelables dans la production d’électricité ?",
      "context": "Aujourd’hui : le nucléaire produit environ deux tiers de l’électricité française ; l’État prévoit six nouveaux réacteurs et en étudie huit de plus.",
      "explainer": {
        "summary": "Le débat porte sur la part du nucléaire et des renouvelables dans la production d’électricité, sur la place de la baisse de la consommation et sur qui doit décider et piloter ces choix, qui engagent le pays pour des décennies. Le nucléaire produit sans dépendre du vent ni du soleil, mais ses réacteurs sont longs et coûteux à construire ; les renouvelables s’installent plus vite, mais leur production varie avec la météo.",
        "points": [
          {
            "text": "La programmation pluriannuelle de l’énergie (PPE) fixe les priorités des pouvoirs publics pour l’énergie dans l’Hexagone continental. La troisième, adoptée par décret le 12 février 2026, couvre 2026-2035. Jusqu’au 31 décembre 2028, le rythme d’attribution des soutiens publics à l’éolien terrestre et au photovoltaïque ne peut dépasser celui de la programmation précédente, et le renouvellement des parcs éoliens existants est privilégié. Une « révision simplifiée » pourra être lancée en 2027 pour ajuster les capacités à attribuer après 2028, et le Gouvernement doit publier d’ici fin 2026 un rapport sur l’évolution de la consommation d’électricité.",
            "source": {
              "title": "Décret n° 2026-76 du 12 février 2026 relatif à la programmation pluriannuelle de l’énergie (JO n° 37 du 13 février 2026)",
              "url": "https://aida.ineris.fr/reglementation/decret-ndeg-2026-76-120226-relatif-a-programmation-pluriannuelle-lenergie",
              "date": "2026-02-12",
              "publisher": "INERIS (base AIDA, reproduction du Journal officiel)"
            }
          },
          {
            "text": "En 2021, RTE, gestionnaire du réseau de transport d’électricité, a comparé six scénarios pour atteindre la neutralité carbone en 2050. Selon l’étude, réduire la consommation d’énergie par l’efficacité, voire la sobriété, est indispensable, même si celle d’électricité augmente pour remplacer les énergies fossiles. La neutralité est impossible sans un développement significatif des renouvelables, devenues « compétitives », et construire de nouveaux réacteurs est « pertinent » économiquement. Se passer de nouveaux réacteurs impose de développer les renouvelables plus vite que les pays européens les plus dynamiques ; les scénarios à très forte part de renouvelables, ou celui qui suppose de prolonger les réacteurs actuels au-delà de 60 ans, reposent sur des « paris technologiques lourds ». Une mise à jour de l’étude est attendue fin 2026.",
            "source": {
              "title": "Futurs énergétiques 2050 : principaux résultats et réactualisation de l’étude",
              "url": "https://www.rte-france.com/donnees-publications/etudes-prospectives/futurs-energetique-2050",
              "date": "2021-10 (page mise à jour en 2026)",
              "publisher": "RTE"
            }
          },
          {
            "text": "Un référendum national sur l’énergie est possible : l’article 11 de la Constitution permet au président de la République, sur proposition du Gouvernement ou des deux assemblées, de soumettre au référendum un projet de loi portant sur des réformes relatives à la politique économique, sociale ou environnementale de la nation. Un tel référendum peut aussi être organisé à l’initiative d’un cinquième des parlementaires, soutenue par un dixième des électeurs inscrits.",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur (article 11)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "en vigueur au 2026-10-08",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "68,1 %",
            "label": "Part du nucléaire dans la production d’électricité de la France métropolitaine en 2025 (373,0 TWh sur 547,5 TWh produits). Elle a varié entre 63 et 77 % sur les dix dernières années. Les renouvelables ont fourni 27 % de la production (27,9 % en 2024) ; avec le nucléaire, l’électricité bas-carbone, peu émettrice de gaz à effet de serre, atteint 95,2 % de la production.",
            "date": "2025",
            "source": {
              "title": "Bilan électrique 2025 : production",
              "url": "https://analysesetdonnees.rte-france.com/bilan-electrique-2025/production",
              "date": "2026",
              "publisher": "RTE"
            },
            "chart": {
              "kind": "part",
              "value": 68.1,
              "total": 100,
              "unit": "%",
              "whole": "de la production d’électricité"
            }
          },
          {
            "value": "8 378,5 M€",
            "label": "Coût prévu en 2027 du soutien public aux énergies renouvelables électriques en France hexagonale, payé par le budget de l’État, contre 7 286,6 M€ prévus pour 2026 (+15 %). Photovoltaïque : 4 579,2 M€ ; éolien terrestre : 1 404,6 M€ ; éolien en mer : 1 306,7 M€ ; bioénergies : 855,1 M€ ; autres filières : 232,9 M€. Selon la CRE, la hausse tient surtout à la croissance du volume d’électricité soutenu (de 88,8 à 98,5 TWh, cogénération au gaz comprise) et, pour une plus faible part, à la baisse du prix de marché de cette électricité (de 48,2 à 42,7 €/MWh en moyenne), qui accroît l’écart à compenser.",
            "date": "2027 (évaluation de juillet 2026)",
            "source": {
              "title": "Délibération n° 2026-149 du 15 juillet 2026 – Annexe 1 : charges de service public de l’énergie prévisionnelles au titre de l’année 2027",
              "url": "https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260715_2026-149_CSPE_2026-2027_annexe_1.pdf",
              "date": "2026-07-15",
              "publisher": "Commission de régulation de l’énergie (CRE)"
            },
            "chart": {
              "kind": "series",
              "unit": "M€",
              "items": [
                {
                  "label": "2026",
                  "value": 7286.6
                },
                {
                  "label": "2027",
                  "value": 8378.5
                }
              ]
            }
          },
          {
            "value": "5,5 Md€",
            "label": "Recettes apportées au budget de l’État au titre de 2022 et 2023, années de prix de gros très élevés, par les renouvelables électriques, notamment l’éolien terrestre, et la cogénération au gaz sous contrat de soutien public : selon la CRE, elles ont alors « joué un rôle d’amortisseur ». Avec la baisse des prix de marché, le soutien est redevenu un coût : 91,9 € par MWh soutenu en 2025, un niveau comparable à celui de 2020 (89,8 €/MWh).",
            "date": "2022-2023 (délibération du 15 juillet 2026)",
            "source": {
              "title": "Délibération n° 2026-149 du 15 juillet 2026 relative à l’évaluation des charges de service public de l’énergie à compenser en 2027",
              "url": "https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260715_2026-149_CSPE_2026-2027.pdf",
              "date": "2026-07-15",
              "publisher": "Commission de régulation de l’énergie (CRE)"
            }
          },
          {
            "value": "72,8 Md€",
            "label": "Coût de construction visé pour six réacteurs EPR2 à Penly, Gravelines et Bugey, en euros de 2020 (hors inflation postérieure). En mars 2026, après un audit mené début 2026 par la Délégation interministérielle au nouveau nucléaire, EDF s’est engagé à tenir ce coût et le calendrier. Un prêt bonifié de l’État, financé par le fonds d’épargne de la Caisse des dépôts, couvre 60 % du montant total du programme. EDF vise une décision finale d’investissement avant fin 2026 et une première mise en service d’ici 2038 ; les discussions avec la Commission européenne doivent encore être finalisées.",
            "date": "2026-03-12",
            "source": {
              "title": "Cinquième Conseil de politique nucléaire",
              "url": "https://www.elysee.fr/emmanuel-macron/2026/03/12/cinquieme-conseil-de-politique-nucleaire",
              "date": "2026-03-12",
              "publisher": "Présidence de la République"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-2-a",
          "text": "Miser d’abord sur le nucléaire et cesser de soutenir le développement de nouvelles éoliennes"
        },
        {
          "id": "ecologie_energie-2-b",
          "text": "Construire de nouveaux réacteurs nucléaires tout en développant les énergies renouvelables"
        },
        {
          "id": "ecologie_energie-2-c",
          "text": "Faire de la baisse de la consommation d’énergie la priorité, avec des renouvelables produites localement"
        },
        {
          "id": "ecologie_energie-2-d",
          "text": "Sortir progressivement du nucléaire en le remplaçant par les énergies renouvelables"
        },
        {
          "id": "ecologie_energie-2-e",
          "text": "Laisser les citoyens décider de l’avenir du nucléaire par un référendum national"
        },
        {
          "id": "ecologie_energie-2-f",
          "text": "Exproprier les grandes entreprises de l’énergie et planifier collectivement la production"
        }
      ]
    },
    {
      "id": "territoires-1",
      "topicId": "territoires",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Comment garantir l’accès aux services publics dans tous les territoires ?",
      "context": "Aujourd’hui : l’État demande aux collectivités locales de participer aux économies budgétaires ; des fermetures de classes, de guichets ou de maternités sont contestées localement, et plus de 2 500 espaces de proximité regroupent les démarches de plusieurs administrations.",
      "explainer": {
        "summary": "L’enjeu est l’égalité d’accès aux services publics (école, maternité, guichets) d’un territoire à l’autre. Les approches divergent sur les moyens (investir davantage, ou faire participer l’État et les collectivités aux économies) et sur l’outil : temps d’accès garantis par la loi, guichets qui regroupent plusieurs administrations, numérique, place du privé et de la concurrence, ou services confiés aux collectivités avec plus d’autonomie financière.",
        "points": [
          {
            "text": "Lancé en 2019, le programme France services réunit en un même lieu 12 opérateurs nationaux, dont France Travail, les Finances publiques, l’Assurance maladie, les Allocations familiales et l’Assurance retraite. Plus de 2 800 maisons France services sont implantées ; l’objectif est que chacun en trouve une à moins de 20 minutes de chez soi.",
            "source": {
              "title": "France services",
              "url": "https://anct.gouv.fr/france-services-36",
              "date": "2026",
              "publisher": "Agence nationale de la cohésion des territoires (ANCT)"
            }
          },
          {
            "text": "Selon la Cour des comptes, la France a une performance « médiocre » face aux autres pays européens sur les principaux indicateurs de santé périnatale (mortinatalité, mortalité néonatale et maternelle). La Cour recommande de faire cesser sans délai l’activité des maternités qui ne permettent pas de garantir la sécurité et la qualité des prises en charge. Elle note aussi que des trajets plus longs sont une « source d’inquiétude légitime » pour les familles, qui craignent des risques accrus pour le nouveau-né.",
            "source": {
              "title": "La politique de périnatalité – Rapport public thématique",
              "url": "https://www.ccomptes.fr/sites/default/files/2024-05/20240506-Sante-perinatale.pdf",
              "date": "2024-05",
              "publisher": "Cour des comptes"
            }
          },
          {
            "text": "Depuis 1998, une maternité doit réaliser au moins 300 accouchements par an, sauf dérogation quand l’éloignement imposerait des « temps de trajet excessifs ». Depuis 2022, une femme enceinte vivant à plus de 45 minutes de trajet d’une maternité peut demander à être hébergée à proximité pendant les cinq derniers jours de sa grossesse.",
            "source": {
              "title": "La politique de périnatalité – Rapport public thématique",
              "url": "https://www.ccomptes.fr/sites/default/files/2024-05/20240506-Sante-perinatale.pdf",
              "date": "2024-05",
              "publisher": "Cour des comptes"
            }
          }
        ],
        "figures": [
          {
            "value": "445",
            "label": "maternités en France en 2024 (service de santé des armées compris), soit 88 de moins qu’en 2014 (- 16,5 %). Sur la même période, le nombre d’accouchements a baissé de 19,4 % (- 155 500), pour atteindre 646 100 en 2024",
            "date": "2024",
            "source": {
              "title": "Les établissements de santé en 2024 – Édition 2026, fiche 19 « La naissance : les maternités »",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-07/ES%202026%20-%20Fiche%2019%20-%20La%20naissance%20-%20les%20maternit%C3%A9s.pdf",
              "date": "2026",
              "publisher": "Direction de la recherche, des études, de l’évaluation et des statistiques (Drees)"
            }
          },
          {
            "value": "4 %",
            "label": "des maternités de France métropolitaine (hors service de santé des armées) ont pris en charge moins de 300 accouchements en 2024, contre 12 % en 1996 ; 37 % en ont accueilli au moins 1 500, contre 13 % en 1996. Les plus petites se situent surtout dans des départements de montagne ou ruraux",
            "date": "2024",
            "source": {
              "title": "Les établissements de santé en 2024 – Édition 2026, fiche 19 « La naissance : les maternités »",
              "url": "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-07/ES%202026%20-%20Fiche%2019%20-%20La%20naissance%20-%20les%20maternit%C3%A9s.pdf",
              "date": "2026",
              "publisher": "Direction de la recherche, des études, de l’évaluation et des statistiques (Drees)"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "1996",
                  "value": 12
                },
                {
                  "label": "2024",
                  "value": 4
                }
              ]
            }
          },
          {
            "value": "23 %",
            "label": "des ménages ayant fait une démarche administrative dans l’année ont rencontré au moins une difficulté ; 86 % des ménages avaient fait au moins une démarche (France hors Mayotte)",
            "date": "2023",
            "source": {
              "title": "Les difficultés rencontrées lors des démarches administratives – France, portrait social, édition 2025",
              "url": "https://www.insee.fr/fr/statistiques/8612560?sommaire=8612596",
              "date": "2025-11-18",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "part",
              "value": 23,
              "total": 100,
              "unit": "%",
              "whole": "des ménages ayant fait une démarche"
            }
          },
          {
            "value": "10,3 %",
            "label": "des ménages ayant rencontré une difficulté citent l’absence de service administratif près de chez eux, et 9,5 % l’absence d’accès à Internet ou la difficulté à se servir du site. Les difficultés les plus citées sont des délais d’attente trop longs (45,3 %), une procédure trop difficile à comprendre (29,3 %) et l’absence d’un interlocuteur compétent (22,7 %) (France hors Mayotte)",
            "date": "2023",
            "source": {
              "title": "Les difficultés rencontrées lors des démarches administratives – France, portrait social, édition 2025",
              "url": "https://www.insee.fr/fr/statistiques/8612560?sommaire=8612596",
              "date": "2025-11-18",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Délais d’attente trop longs",
                  "value": 45.3
                },
                {
                  "label": "Procédure trop difficile",
                  "value": 29.3
                },
                {
                  "label": "Pas de service près de chez soi",
                  "value": 10.3
                },
                {
                  "label": "Sans Internet ou site difficile",
                  "value": 9.5
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "territoires-1-a",
          "text": "Fixer par la loi des temps d’accès maximum aux services publics essentiels et encadrer les fermetures"
        },
        {
          "id": "territoires-1-b",
          "text": "Investir massivement dans les services publics et revenir sur leur ouverture au privé et à la concurrence"
        },
        {
          "id": "territoires-1-c",
          "text": "Recourir au numérique et à l’intelligence artificielle pour réduire les effectifs et renforcer l’accueil"
        },
        {
          "id": "territoires-1-d",
          "text": "Faire participer les collectivités aux économies en supprimant des doublons et en réduisant leurs dotations"
        },
        {
          "id": "territoires-1-e",
          "text": "Confier davantage de services de proximité aux collectivités, avec plus d’autonomie financière"
        },
        {
          "id": "territoires-1-f",
          "text": "Multiplier les guichets de proximité qui regroupent les démarches de plusieurs administrations"
        }
      ]
    },
    {
      "id": "ecologie_energie-3",
      "topicId": "ecologie_energie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment agir sur le prix de l’électricité ?",
      "context": "Aujourd’hui : la France participe au marché européen de l’électricité, où le prix de gros dépend souvent du coût de la dernière centrale appelée, fréquemment au gaz.",
      "explainer": {
        "summary": "Le prix de gros de l’électricité se forme sur un marché européen, où il est fixé par la dernière offre retenue pour couvrir la demande. Le débat porte sur le lien entre ce prix, les coûts de production en France et les factures, qui comprennent aussi le coût des réseaux et des taxes, et sur le rôle respectif de l’État et de l’Union européenne.",
        "points": [
          {
            "text": "Le réseau de transport, à haute et très haute tension, appartient à RTE, qui le gère. Les réseaux de distribution appartiennent aux communes, qui peuvent déléguer cette compétence ; Enedis les gère sur 95 % du territoire métropolitain continental, et quelque 160 régies ou entreprises locales ailleurs. Les règles européennes, transposées dans le code de l’énergie, imposent à ces gestionnaires d’être indépendants du groupe intégré auquel ils peuvent appartenir, notamment de ses activités de fourniture d’énergie.",
            "source": {
              "title": "Présentation des réseaux d’électricité",
              "url": "https://www.cre.fr/electricite/reseaux-delectricite/presentation-des-reseaux-delectricite.html",
              "date": "2024-04-10",
              "publisher": "Commission de régulation de l’énergie (CRE)"
            }
          },
          {
            "text": "L’ARENH, qui permettait aux concurrents d’EDF d’acheter à prix régulé une partie de sa production nucléaire, a pris fin le 31 décembre 2025 : les fournisseurs s’approvisionnent désormais sur les marchés ou avec leurs propres centrales. Depuis le 1er janvier 2026, le « versement nucléaire universel » (VNU) prélève par une taxe 50 %, puis 90 %, des revenus du parc nucléaire d’EDF au-delà de deux seuils de prix. Pour 2027, la CRE estime ces revenus à 63,82 €/MWh, et la baisse correspondante à appliquer à la consommation (« tarif unitaire de minoration ») à 0 €/MWh.",
            "source": {
              "title": "VNU – Estimation des revenus nucléaires d’EDF",
              "url": "https://www.cre.fr/electricite/marche-de-detail-de-lelectricite/vnu-estimation-des-revenus-nucleaires-dedf.html",
              "date": "2026-09-18",
              "publisher": "Commission de régulation de l’énergie (CRE)"
            }
          },
          {
            "text": "La réforme européenne de 2024 vise des prix plus stables et encourage les contrats de long terme. Quand un État soutient directement le prix de nouvelles centrales, renouvelables ou nucléaires, il doit passer par des « contrats d’écart compensatoire bidirectionnels » ou des mécanismes équivalents : le producteur est payé à un prix fixé, reçoit la différence quand le prix de marché est plus bas et la reverse quand il est plus haut ; ces recettes excédentaires doivent revenir aux consommateurs. En cas de crise des prix déclarée par le Conseil de l’UE, les États peuvent aussi intervenir sur les prix payés par les ménages et les PME, pour une partie de leur consommation.",
            "source": {
              "title": "Questions et réponses sur la réforme de l’organisation du marché de l’électricité",
              "url": "https://ec.europa.eu/commission/presscorner/detail/fr/qanda_24_2260",
              "date": "2024-05-21",
              "publisher": "Commission européenne"
            }
          }
        ],
        "figures": [
          {
            "value": "61,1 €/MWh",
            "label": "Prix moyen de l’électricité sur le marché de gros (prix « spot ») en France en 2025, contre 58 €/MWh en 2024, 275,9 €/MWh en 2022 au plus fort de la crise et 39,4 €/MWh en 2019.",
            "date": "2025",
            "source": {
              "title": "Bilan électrique 2025 : prix",
              "url": "https://analysesetdonnees.rte-france.com/bilan-electrique-2025/prix",
              "date": "2026",
              "publisher": "RTE"
            },
            "chart": {
              "kind": "series",
              "unit": "€/MWh",
              "items": [
                {
                  "label": "2019",
                  "value": 39.4
                },
                {
                  "label": "2022",
                  "value": 275.9
                },
                {
                  "label": "2024",
                  "value": 58
                },
                {
                  "label": "2025",
                  "value": 61.1
                }
              ]
            }
          },
          {
            "value": "Environ 30 % du temps",
            "label": "En mars et en novembre 2025, deux mois étudiés par RTE, le prix spot horaire a dépassé le coût variable minimal des centrales à gaz environ 30 % du temps : un ordre de grandeur du temps où le gaz a fixé le prix, d’autres moyens (barrages de lac, batteries) pouvant aussi caler leurs offres sur le prix du gaz. Les centrales à gaz ont produit environ 3 % de l’électricité en 2025. Depuis la seconde moitié de 2024, les prix à terme annuels (électricité achetée à l’avance pour l’année suivante) restent sous les coûts variables des centrales thermiques.",
            "date": "2025",
            "source": {
              "title": "Bilan électrique 2025 : prix",
              "url": "https://analysesetdonnees.rte-france.com/bilan-electrique-2025/prix",
              "date": "2026",
              "publisher": "RTE"
            },
            "chart": {
              "kind": "part",
              "value": 30,
              "total": 100,
              "unit": "%",
              "whole": "du temps en mars et novembre 2025"
            }
          },
          {
            "value": "92,3 TWh",
            "label": "Exportations nettes d’électricité de la France en 2025, un record pour la deuxième année consécutive (89 TWh en 2024), soit l’équivalent de 17 % de sa production. La France reste le premier exportateur net d’Europe en volume.",
            "date": "2025",
            "source": {
              "title": "Bilan électrique 2025 : synthèse",
              "url": "https://analysesetdonnees.rte-france.com/bilan-electrique-2025/synthese",
              "date": "2026",
              "publisher": "RTE"
            },
            "chart": {
              "kind": "series",
              "unit": "TWh",
              "items": [
                {
                  "label": "2024",
                  "value": 89
                },
                {
                  "label": "2025",
                  "value": 92.3
                }
              ]
            }
          },
          {
            "value": "30,62 €/MWh",
            "label": "Accise sur l’électricité payée par les ménages depuis le 1er août 2026, contre 30,85 €/MWh de février à juillet 2026, 29,98 €/MWh d’août 2025 à janvier 2026 et 33,70 €/MWh de février à juillet 2025. Depuis le 1er août 2025, toute la facture est soumise à la TVA à 20 %, y compris l’abonnement, auparavant taxé à 5,5 % pour les compteurs jusqu’à 36 kVA ; cette hausse a été compensée par une baisse de l’accise (de 33,70 à 29,98 €/MWh). La TVA s’applique aussi à l’accise. De février 2022 à janvier 2024, pendant le « bouclier tarifaire », l’accise avait été abaissée à 1 €/MWh, le minimum permis par le droit européen pour les particuliers.",
            "date": "2026-08-01",
            "source": {
              "title": "Guide 2026 sur la fiscalité des énergies",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies.pdf",
              "date": "2026",
              "publisher": "Ministère de la Transition écologique"
            },
            "chart": {
              "kind": "series",
              "unit": "€/MWh",
              "items": [
                {
                  "label": "Févr. 2025",
                  "value": 33.7
                },
                {
                  "label": "Août 2025",
                  "value": 29.98
                },
                {
                  "label": "Févr. 2026",
                  "value": 30.85
                },
                {
                  "label": "Août 2026",
                  "value": 30.62
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-3-a",
          "text": "Sortir la France du marché européen de l’électricité pour fixer les prix au niveau national"
        },
        {
          "id": "ecologie_energie-3-b",
          "text": "Rester dans le marché européen en calculant une partie de la facture sur les coûts de production"
        },
        {
          "id": "ecologie_energie-3-c",
          "text": "Placer la production, le transport et la distribution d’électricité sous un contrôle public unique"
        },
        {
          "id": "ecologie_energie-3-d",
          "text": "Baisser les taxes et prélèvements qui s’ajoutent à la facture d’électricité, dont la taxe sur la valeur ajoutée"
        },
        {
          "id": "ecologie_energie-3-e",
          "text": "Conserver les règles actuelles du marché européen de l’électricité, réformées en 2024",
          "external": true
        }
      ]
    },
    {
      "id": "ecologie_energie-4",
      "topicId": "ecologie_energie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel principe doit guider en priorité la politique climatique ?",
      "context": "Aujourd’hui : la loi fixe à la France un objectif de neutralité carbone en 2050.",
      "explainer": {
        "summary": "Les émissions françaises de gaz à effet de serre baissent, mais en 2025 moins vite que ne le prévoient les objectifs nationaux. Le débat porte sur le rythme à tenir et sur les leviers à privilégier : normes et obligations, prix du carbone, investissement et innovation, planification publique, ou effort ciblé sur certains secteurs ou sur les plus gros émetteurs.",
        "points": [
          {
            "text": "La stratégie nationale bas-carbone (SNBC) fixe la trajectoire en « budgets carbone » : des plafonds d’émissions par période de cinq ans. La troisième (version de juillet 2026) retient en moyenne 342 millions de tonnes d’équivalent CO₂ (Mt CO₂e) par an pour 2024-2028, 262 pour 2029-2033 et 194 pour 2034-2038, sans déduire le CO₂ absorbé par les forêts, les sols et les procédés de captage. Elle vise une baisse « de l’ordre de −50 % » des émissions entre 1990 (547 Mt) et 2030, soit environ 273 Mt CO₂e.",
            "source": {
              "title": "Stratégie nationale bas-carbone n° 3 – Partie 1 (version de juillet 2026)",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/SNBC3-Partie1-Juillet2026.pdf",
              "date": "2026-07",
              "publisher": "Ministère de la Transition écologique"
            }
          },
          {
            "text": "Les zones à faibles émissions mobilité (ZFE) permettent de restreindre la circulation de certaines catégories de véhicules pour lutter contre la pollution de l’air. Le Parlement avait voté leur suppression dans la loi de simplification de la vie économique. Le 21 mai 2026, le Conseil constitutionnel a censuré cette disposition pour une raison de procédure, sans se prononcer sur le fond : elle n’avait pas de lien, même indirect, avec le projet de loi initial. Tant qu’une autre loi ne les supprime pas, les ZFE restent donc prévues par la loi.",
            "source": {
              "title": "Décision n° 2026-903 DC du 21 mai 2026 – Loi de simplification de la vie économique",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026903DC.htm",
              "date": "2026-05-21",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Les centrales électriques, l’industrie et les vols intra-européens relèvent d’un marché européen du carbone : ils doivent restituer un quota pour chaque tonne de CO₂ émise. Depuis le 1er janvier 2026, un mécanisme d’ajustement carbone aux frontières taxe aussi le carbone de certains biens importés (acier, aluminium, ciment, engrais azotés, hydrogène, électricité), à mesure que disparaissent les quotas gratuits de l’industrie européenne. Un second marché, pour le transport routier et les bâtiments, doit démarrer en 2028 : selon le Haut Conseil pour le climat (HCC), un quota à 60 € la tonne ferait monter le gazole d’au moins 5 centimes par litre, même en ajustant au maximum la fiscalité existante. Un Fonds social pour le climat doit aider les ménages vulnérables (9,7 Md€ pour la France sur 2026-2032, dont 25 % de cofinancement national) ; en juillet 2026, la France n’avait pas encore présenté le plan exigé pour y accéder.",
            "source": {
              "title": "Rapport annuel 2026 – Chapitre 4 : suivi des émissions et des politiques publiques par secteur",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/RANC2026-Chapitre-4.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            }
          }
        ],
        "figures": [
          {
            "value": "359 Mt CO₂e",
            "label": "Émissions de gaz à effet de serre de la France (Hexagone et outre-mer inclus dans l’UE) en 2025, en millions de tonnes d’équivalent CO₂, sans déduire le CO₂ absorbé par les forêts et les sols, contre 367 Mt CO₂e en 2024. Elles ont baissé de 2,1 % sur un an, après −3,0 % en 2024. Au premier trimestre 2026, une première estimation les donne en baisse de 5,2 % sur un an (98,1 Mt CO₂e contre 103,5).",
            "date": "2025 (pré-estimation)",
            "source": {
              "title": "Rapport Secten 2026 – Synthèse et messages clés",
              "url": "https://www.citepa.org/wp-content/uploads/2026/06/Synthese-et-messages-cles-Secten-2026.pdf",
              "date": "2026-06-16",
              "publisher": "Citepa"
            },
            "chart": {
              "kind": "series",
              "unit": "Mt CO₂e",
              "items": [
                {
                  "label": "2024",
                  "value": 367
                },
                {
                  "label": "2025",
                  "value": 359
                }
              ]
            }
          },
          {
            "value": "plus de 4 % par an",
            "label": "Baisse annuelle moyenne des émissions nécessaire en 2026, 2027 et 2028 pour respecter le budget carbone 2024-2028, soit au moins le double du rythme de 2025 (−2,1 %), selon le Haut Conseil pour le climat (HCC).",
            "date": "2026-2028 (évaluation de juillet 2026)",
            "source": {
              "title": "Rapport annuel 2026 « Dangers climatiques : la France face à ses responsabilités » – Résumé exécutif et recommandations",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/HCC_RA2026-Resume-executif-Recommandations_1707.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            },
            "chart": {
              "kind": "compare",
              "unit": "% par an",
              "items": [
                {
                  "label": "Évolution en 2025",
                  "value": -2.1
                },
                {
                  "label": "Rythme minimal requis 2026-2028",
                  "value": -4
                }
              ]
            }
          },
          {
            "value": "−14 %",
            "label": "Évolution en 2025 des émissions soumises au marché européen du carbone (centrales électriques et de chaleur, industrie, vols intra-européens), après −17 % en 2023 et −10 % en 2024, contre −0,4 % pour les autres émissions (−4 % en 2023, −1 % en 2024). Dans l’industrie, la baisse tient aussi à un recul de la production.",
            "date": "2025",
            "source": {
              "title": "Rapport annuel 2026 « Dangers climatiques : la France face à ses responsabilités » – Résumé exécutif et recommandations",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/HCC_RA2026-Resume-executif-Recommandations_1707.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Émissions du marché carbone UE",
                  "value": -14
                },
                {
                  "label": "Autres émissions",
                  "value": -0.4
                }
              ]
            }
          },
          {
            "value": "3,9 millions",
            "label": "Résidences principales classées F ou G au diagnostic de performance énergétique (DPE) au 1er janvier 2025, soit 12,7 % des 30,9 millions de résidences principales (France métropolitaine, estimation du service statistique du ministère reprise par le HCC) ; 3,2 millions (10,4 %) avec le nouveau calcul du DPE pour l’électricité, appliqué depuis le 1er janvier 2026. La mise en location des logements les moins performants est progressivement interdite : classe G depuis 2025, F à partir de 2028, E à partir de 2034. Selon le Haut Conseil pour le climat (HCC), cette interdiction peut inciter à rénover, mais son efficacité « doit encore être démontrée » et son effet sur l’offre de logements pour les locataires les plus précaires doit être analysé ; en juillet 2026, le Gouvernement envisageait un premier assouplissement.",
            "date": "2025-01-01 (rapport du 9 juillet 2026)",
            "source": {
              "title": "Rapport annuel 2026 – Chapitre 4",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/RANC2026-Chapitre-4.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            },
            "chart": {
              "kind": "part",
              "value": 12.7,
              "total": 100,
              "unit": "%",
              "whole": "des résidences principales"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-4-a",
          "text": "Diviser par deux les émissions en dix ans et sortir des énergies fossiles en une quinzaine d’années"
        },
        {
          "id": "ecologie_energie-4-b",
          "text": "Faire de la transition écologique le moteur de la relance industrielle et de la création d’emplois"
        },
        {
          "id": "ecologie_energie-4-c",
          "text": "Miser sur l’innovation et la production en France plutôt que sur de nouvelles normes et taxes"
        },
        {
          "id": "ecologie_energie-4-d",
          "text": "Lever des obligations comme les zones à faibles émissions ou l’interdiction de louer les logements mal isolés"
        },
        {
          "id": "ecologie_energie-4-e",
          "text": "Cibler l’industrie lourde, le fret et la rénovation, avec un prix du carbone aux frontières de l’Europe"
        },
        {
          "id": "ecologie_energie-4-f",
          "text": "Planifier collectivement l’économie en expropriant les grands groupes industriels et énergétiques"
        },
        {
          "id": "ecologie_energie-4-g",
          "text": "Faire porter l’effort d’abord sur les plus gros émetteurs : ménages les plus aisés, jets privés, grandes entreprises"
        }
      ]
    },
    {
      "id": "ecologie_energie-5",
      "topicId": "ecologie_energie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour la gestion de l’eau ?",
      "context": "Aujourd’hui : la distribution de l’eau potable est assurée, selon les communes, par une régie publique ou par une entreprise privée, et des projets de grandes retenues d’eau pour l’irrigation agricole sont contestés.",
      "explainer": {
        "summary": "L’eau potable est un service public local : chaque commune ou intercommunalité le gère elle-même (en régie) ou le confie par contrat à un opérateur (délégation). Le débat porte sur ce choix, sur les fuites des réseaux, la réutilisation des eaux usées et la tarification sociale, et, face aux sécheresses, sur les retenues d’eau pour l’irrigation, que certains veulent développer et d’autres interdire.",
        "points": [
          {
            "text": "En 2024, environ un litre d’eau potable sur cinq s’échappait des réseaux de distribution par des fuites et retournait au milieu naturel. Cela représente environ 1,2 milliard de m³ par an, pour un « rendement » moyen des réseaux de 79,2 %. Les canalisations sont renouvelées au rythme moyen de 0,61 % par an sur les cinq dernières années, un taux proche en régie (0,60 %) et en délégation (0,61 %).",
            "source": {
              "title": "Observatoire des services publics d’eau et d’assainissement – Rapport national 2026 (données 2024), version complète",
              "url": "https://www.services.eaufrance.fr/cms/uploads/Rapport_Sispea_2024_VF_79c80d7b71.pdf",
              "date": "2026-06",
              "publisher": "Office français de la biodiversité (Sispea)"
            }
          },
          {
            "text": "Depuis une loi de décembre 2019, les services d’eau et d’assainissement peuvent, sans y être obligés, fixer des tarifs selon la composition ou les revenus du foyer et aider au paiement des factures. Les communes et intercommunalités peuvent y consacrer une part de leur budget, plafonnée à 2 % des redevances d’eau ou d’assainissement perçues (hors taxes). Pour repérer les foyers concernés, les organismes de sécurité sociale et ceux qui gèrent l’aide au logement et l’aide sociale leur fournissent les données nécessaires.",
            "source": {
              "title": "Loi n° 2019-1461 du 27 décembre 2019 relative à l’engagement dans la vie locale et à la proximité de l’action publique (article 15)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000039681877",
              "date": "2019-12-27",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Les retenues dites « de substitution » stockent de l’eau en hiver pour irriguer l’été, à la place de pompages estivaux. Une loi de 2025 présume « d’intérêt général majeur » les ouvrages de stockage d’eau à finalité principalement agricole situés dans une zone en déficit d’eau durable, s’ils sont issus d’une concertation locale et liés à un engagement des usagers à économiser l’eau. Le Conseil constitutionnel l’a validée le 7 août 2025 sous deux réserves : aucun prélèvement dans les nappes dites inertielles (qui se renouvellent lentement), et une présomption qui peut être contestée.",
            "source": {
              "title": "Décision n° 2025-891 DC du 7 août 2025 – Loi visant à lever les contraintes à l’exercice du métier d’agriculteur",
              "url": "https://www.conseil-constitutionnel.fr/decision/2025/2025891DC.htm",
              "date": "2025-08-07",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "61 %",
            "label": "Part de l’agriculture dans l’eau consommée (prélevée puis non restituée aux milieux aquatiques) en France métropolitaine, devant l’eau potable (24 %), le refroidissement des centrales électriques (11 %) et l’industrie (4 %). L’irrigation représente environ 10 % des prélèvements d’eau : 2,8 milliards de m³ sur 29 milliards de m³ prélevés",
            "date": "2023",
            "source": {
              "title": "Prélèvements de ressources naturelles en France – État des connaissances en 2025",
              "url": "https://www.statistiques.developpement-durable.gouv.fr/prelevements-de-ressources-naturelles-en-france-etat-des-connaissances-en-2025",
              "date": "2026-03-06",
              "publisher": "SDES, ministère de la Transition écologique"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Agriculture",
                  "value": 61
                },
                {
                  "label": "Eau potable",
                  "value": 24
                },
                {
                  "label": "Refroidissement des centrales",
                  "value": 11
                },
                {
                  "label": "Industrie",
                  "value": 4
                }
              ]
            }
          },
          {
            "value": "48 %",
            "label": "Part de la population desservie en eau potable par un service en régie. Les régies représentent 69 % des services ; les services délégués, moins nombreux (31 %), desservent 52 % de la population",
            "date": "2024",
            "source": {
              "title": "Observatoire des services publics d’eau et d’assainissement – Rapport national 2026 (données 2024), version complète",
              "url": "https://www.services.eaufrance.fr/cms/uploads/Rapport_Sispea_2024_VF_79c80d7b71.pdf",
              "date": "2026-06",
              "publisher": "Office français de la biodiversité (Sispea)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Population servie en régie",
                  "value": 48
                },
                {
                  "label": "Population servie en délégation",
                  "value": 52
                }
              ]
            }
          },
          {
            "value": "4,89 €/m³",
            "label": "Prix moyen de l’eau potable et de l’assainissement, taxes et redevances comprises (contre 4,69 €/m³ un an plus tôt), soit 586,80 € par an pour 120 m³. Il est de 4,81 €/m³ en régie et de 4,96 €/m³ en délégation, un écart de 3 % qui « s’est fortement réduit » ces dernières années. Selon l’Observatoire, les écarts de prix tiennent au contexte local (complexité technique du service, provenance des eaux, dispersion de l’habitat…), mais aussi aux choix d’investissement, de gestion et de qualité de service",
            "date": "1er janvier 2025",
            "source": {
              "title": "Observatoire des services publics d’eau et d’assainissement – Rapport national 2026 (données 2024), synthèse",
              "url": "https://www.services.eaufrance.fr/cms/uploads/Rapport_SISPEA_2024_resume_e9750182ae.pdf",
              "date": "2026-06",
              "publisher": "Office français de la biodiversité (Sispea)"
            },
            "chart": {
              "kind": "series",
              "unit": "€/m³",
              "items": [
                {
                  "label": "1er janvier 2024",
                  "value": 4.69
                },
                {
                  "label": "1er janvier 2025",
                  "value": 4.89
                }
              ]
            }
          },
          {
            "value": "508 installations",
            "label": "Installations qui valorisent des eaux non conventionnelles (eaux usées traitées, eaux de pluie…) recensées en France, dont 164 stations d’épuration et 344 industries agroalimentaires. Le Plan eau vise 1 000 projets d’ici fin 2027. Selon le ministère, la réutilisation des eaux usées traitées est « particulièrement pertinente » sur le littoral, où ces eaux partent à la mer ; à l’intérieur des terres, leurs rejets peuvent soutenir le débit des rivières en été",
            "date": "fin février 2026",
            "source": {
              "title": "Plan eau, 3 ans après – dossier de presse",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/09042026_PLAN%20EAU_3ans.pdf",
              "date": "2026-04-09",
              "publisher": "Ministère de la Transition écologique"
            },
            "chart": {
              "kind": "compare",
              "unit": "installations",
              "items": [
                {
                  "label": "Stations d’épuration",
                  "value": 164
                },
                {
                  "label": "Industries agroalimentaires",
                  "value": 344
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-5-a",
          "text": "Construire davantage de retenues d’eau pour sécuriser l’irrigation des cultures face aux sécheresses"
        },
        {
          "id": "ecologie_energie-5-b",
          "text": "Interdire les grandes retenues d’eau pour l’irrigation et restaurer le cycle naturel de l’eau"
        },
        {
          "id": "ecologie_energie-5-c",
          "text": "Confier dans toutes les communes le traitement et la distribution de l’eau à une régie publique"
        },
        {
          "id": "ecologie_energie-5-d",
          "text": "Réparer en priorité les réseaux d’eau qui fuient et réutiliser davantage les eaux usées traitées"
        },
        {
          "id": "ecologie_energie-5-e",
          "text": "Instaurer une tarification sociale de l’eau, avec une aide automatique pour les foyers modestes"
        }
      ]
    },
    {
      "id": "ecologie_energie-6",
      "topicId": "ecologie_energie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour protéger la population face aux canicules, aux incendies et aux catastrophes climatiques ?",
      "context": "Aujourd’hui : le plan national d’adaptation au changement climatique, adopté en 2025, prépare la France à un réchauffement de 4 °C d’ici 2100.",
      "explainer": {
        "summary": "L’été 2026 a été le plus chaud en France depuis 1900, avec trois vagues de chaleur et un danger de feux de forêt plus souvent très élevé qu’en 2025. Le débat porte sur la priorité : équiper en climatisation les lieux sensibles et les ménages, rénover les écoles, végétaliser les villes, renforcer les secours, ou confier l’adaptation à un organisme unique doté d’un budget garanti.",
        "points": [
          {
            "text": "Un plan de l’Éducation nationale du 28 mai 2026 demande à chaque académie de recenser les bâtiments scolaires vulnérables à la chaleur ; l’État a prévu d’étudier, à partir de septembre 2026, l’idée d’imposer une pièce rafraîchie dans les écoles. Depuis 2025, le Fonds vert ne finance la rénovation d’une école ou d’un autre bâtiment public local que si le projet tient compte de la chaleur. Selon le ministère, la climatisation peut réchauffer les rues en ville, mais reste utile en complément, surtout pour les publics fragiles. La loi de finances pour 2026 a prévu une TVA à 5,5 % pour les climatiseurs réversibles (pompes à chaleur air-air) les plus performants.",
            "source": {
              "title": "Renforcer notre endurance face aux vagues de chaleur – dossier de presse",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/20260617_DP_Endurance_vagues_de_chaleur.pdf",
              "date": "2026-06-17",
              "publisher": "Ministère de la Transition écologique"
            }
          },
          {
            "text": "Le troisième plan national d’adaptation, publié le 10 mars 2025, compte 52 mesures, de la préparation de la sécurité civile à la renaturation des villes. Sa mise en œuvre mobilise 18 ministères et 25 directions générales, sous la coordination de la Direction générale de l’énergie et du climat. Une « Mission adaptation » sert de guichet unique aux collectivités, et une partie du Fonds vert finance leurs projets d’adaptation.",
            "source": {
              "title": "Plan national d’adaptation au changement climatique : plus d’un an après, synthèse du point d’avancement",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/Synthese_du_point_d_avancement_du_PNACC_juin_2026_0.pdf",
              "date": "2026-06-17",
              "publisher": "Ministère de la Transition écologique"
            }
          },
          {
            "text": "Les services d’incendie et de secours sont financés en très grande partie par les collectivités, d’abord les départements (58 %). Leur budget (5,6 Md€ en 2022) est près de six fois supérieur aux crédits de l’État pour la sécurité civile inscrits au projet de budget 2026. Selon la Fédération nationale des sapeurs-pompiers, citée par le Sénat, seuls 3 des 12 Canadair étaient opérationnels à certaines périodes critiques de l’été 2024. Deux appareils commandés en 2024 sont attendus en 2028 ; deux autres, prévus au projet de budget 2026, seraient livrés entre fin 2032 et 2033.",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Sécurités (Sécurité civile) – rapport général",
              "url": "https://www.senat.fr/rap/l25-139-328-2/l25-139-328-2_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat (commission des finances)"
            }
          }
        ],
        "figures": [
          {
            "value": "53 jours",
            "label": "Jours de vague de chaleur en France à l’été 2026, en trois épisodes, contre 33 à l’été 2022. C’est l’été le plus chaud depuis 1900 (24,0 °C en moyenne, +3,6 °C au-dessus de la normale), devant 2003 (+2,7 °C) et 2022 (+2,3 °C)",
            "date": "été 2026",
            "source": {
              "title": "Bilan climatique de l’été 2026 (juin-juillet-août)",
              "url": "https://meteofrance.com/presse/bilan-climatique-de-lete-2026-juin-juillet-aout",
              "date": "2026-09-03",
              "publisher": "Météo-France"
            },
            "chart": {
              "kind": "compare",
              "unit": "jours",
              "items": [
                {
                  "label": "Été 2022",
                  "value": 33
                },
                {
                  "label": "Été 2026",
                  "value": 53
                }
              ]
            }
          },
          {
            "value": "au moins 5 764 décès",
            "label": "Décès en excès (toutes causes, au-delà du nombre attendu) estimés pendant la canicule du 17 juin au 2 juillet 2026. Il y en a eu au moins 1 243 du 3 au 20 juillet et au moins 817 du 27 juillet au 20 août. Ce sont des estimations provisoires, faites sur les départements de l’Hexagone touchés ; le bilan consolidé sera publié dans le bilan de l’été",
            "date": "été 2026",
            "source": {
              "title": "Canicule et santé : excès de mortalité durant l’épisode de canicule du 27 juillet au 20 août 2026",
              "url": "https://www.santepubliquefrance.fr/climat/fortes-chaleurs-canicule/bulletin-national/canicule-et-sante-exces-de-mortalite-durant-lepisode-de-canicule-du-27-juillet-au-20-aout-2026",
              "date": "2026-09-16",
              "publisher": "Santé publique France"
            },
            "chart": {
              "kind": "compare",
              "unit": "décès",
              "items": [
                {
                  "label": "17 juin – 2 juillet",
                  "value": 5764
                },
                {
                  "label": "3 – 20 juillet",
                  "value": 1243
                },
                {
                  "label": "27 juillet – 20 août",
                  "value": 817
                }
              ]
            }
          },
          {
            "value": "27 jours",
            "label": "Jours de l’été 2026 où au moins un département était en danger très élevé (rouge) de feux de forêt sur la carte du lendemain, contre 13 en 2025. Il y a eu 90 jours avec au moins un département en orange, contre 81 en 2025",
            "date": "été 2026 (bilan provisoire au 1er septembre)",
            "source": {
              "title": "Bilan climatique de l’été 2026 (juin-juillet-août)",
              "url": "https://meteofrance.com/presse/bilan-climatique-de-lete-2026-juin-juillet-aout",
              "date": "2026-09-03",
              "publisher": "Météo-France"
            },
            "chart": {
              "kind": "series",
              "unit": "jours",
              "items": [
                {
                  "label": "2025",
                  "value": 13
                },
                {
                  "label": "2026",
                  "value": 27
                }
              ]
            }
          },
          {
            "value": "1 100 hectares",
            "label": "Surfaces de renaturation (cours d’école, forêts urbaines, cours d’eau rouverts) cofinancées par le Fonds vert en deux ans, pour 223 M€ de subventions. Elles profitent à près de 6,4 millions d’habitants. L’État vise désormais 1 000 hectares renaturés par an, deux fois plus qu’aujourd’hui",
            "date": "2024-2026 (bilan de juin 2026)",
            "source": {
              "title": "Renforcer notre endurance face aux vagues de chaleur – dossier de presse",
              "url": "https://www.ecologie.gouv.fr/sites/default/files/documents/20260617_DP_Endurance_vagues_de_chaleur.pdf",
              "date": "2026-06-17",
              "publisher": "Ministère de la Transition écologique"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-6-a",
          "text": "Climatiser les écoles, les hôpitaux et les maisons de retraite, et aider les ménages à s’équiper"
        },
        {
          "id": "ecologie_energie-6-b",
          "text": "Rénover les écoles et aménager leurs cours pour mieux protéger les élèves de la chaleur"
        },
        {
          "id": "ecologie_energie-6-c",
          "text": "Végétaliser les villes en imposant à chaque commune une part minimale d’espaces verts"
        },
        {
          "id": "ecologie_energie-6-d",
          "text": "Renforcer fortement les effectifs et les équipements des pompiers et de la sécurité civile"
        },
        {
          "id": "ecologie_energie-6-e",
          "text": "Confier l’adaptation à un organisme unique doté d’un budget pluriannuel garanti"
        }
      ]
    },
    {
      "id": "ecologie_energie-7",
      "topicId": "ecologie_energie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles priorités pour les transports et les déplacements ?",
      "context": "Aujourd’hui : les lignes ferroviaires régionales s’ouvrent progressivement à la concurrence, et la plupart des autoroutes sont exploitées par des sociétés privées sous concession.",
      "explainer": {
        "summary": "Le débat porte sur la place de la voiture (fin programmée en 2035 des voitures neuves à moteur thermique dans l’Union européenne, restrictions de circulation, aide aux ménages modestes pour passer à l’électrique) et sur l’organisation et le financement des transports collectifs, du train en particulier. Il porte aussi sur l’avenir des autoroutes, dont les concessions arrivent à échéance entre 2031 et 2036.",
        "points": [
          {
            "text": "Les contrats des sociétés d’autoroutes « historiques » prennent fin entre 2031 et 2036 ; les concessionnaires doivent alors remettre gratuitement le réseau à l’État concédant. Depuis 2024, une taxe sur l’exploitation des infrastructures de transport de longue distance, assise sur les recettes de péage, vise notamment à accroître leur contribution au financement des infrastructures de transport : elle leur a coûté environ 0,5 Md€ en 2024.",
            "source": {
              "title": "Synthèse des comptes des sociétés concessionnaires d’autoroutes – exercice 2024",
              "url": "https://www.autorite-transports.fr/wp-content/uploads/2025/12/synthese_des_comptes_sca_2024.pdf",
              "date": "2025-12",
              "publisher": "Autorité de régulation des transports"
            }
          },
          {
            "text": "Depuis 2024, les ménages des cinq premiers déciles de revenus (la moitié la plus modeste) peuvent louer une voiture électrique neuve pour 100 à 200 € par mois : 50 000 véhicules début 2024, 50 000 de plus fin 2025 et 50 000 autres prévus en 2026. L’aide atteint environ 8 400 € par véhicule en 2026 ; elle est financée par les certificats d’économies d’énergie, un dispositif qui oblige les fournisseurs d’énergie à financer des économies d’énergie. Selon le Haut Conseil pour le climat, cette location aidée représente 2 % des achats de véhicules de ces ménages par an.",
            "source": {
              "title": "Rapport annuel 2026 – Chapitre 4 : suivi des émissions et des politiques publiques par secteur",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/RANC2026-Chapitre-4.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            }
          },
          {
            "text": "Les règles européennes fixent, à partir de 2035, un objectif de réduction de 100 % des émissions de CO₂ des voitures et camionnettes neuves : seuls des véhicules à zéro émission pourront alors être immatriculés. Le 16 décembre 2025, la Commission européenne a proposé de ramener l’objectif des voitures neuves à −90 % par rapport à 2021, le reste devant être compensé par de l’acier bas carbone produit dans l’Union ou par des carburants renouvelables durables. Le vote du Parlement européen est attendu le 23 novembre 2026 et la position du Conseil le 11 décembre 2026 ; tant que ce texte n’est pas adopté, la règle actuelle s’applique.",
            "source": {
              "title": "Legislative Train – CO2 emission standards for new light-duty vehicles and labelling",
              "url": "https://www.europarl.europa.eu/legislative-train/package-automotive-package/file-co2-emission-standards-for-new-light-duty-vehicles-and-labelling",
              "date": "2026-09-20",
              "publisher": "Parlement européen"
            }
          }
        ],
        "figures": [
          {
            "value": "55 %",
            "label": "Part des voitures particulières dans les émissions des transports, qui atteignent 122,9 millions de tonnes d’équivalent CO₂ (34 % des émissions de la France). Suivent les poids lourds (22 %), les utilitaires légers (13 %), l’avion sur les trajets intérieurs (4 %) et les bus et cars (2 %).",
            "date": "2025 (estimation provisoire)",
            "source": {
              "title": "Rapport annuel 2026 « Dangers climatiques : la France face à ses responsabilités » – Résumé exécutif et recommandations",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/HCC_RA2026-Resume-executif-Recommandations_1707.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Voitures particulières",
                  "value": 55
                },
                {
                  "label": "Poids lourds",
                  "value": 22
                },
                {
                  "label": "Utilitaires légers",
                  "value": 13
                },
                {
                  "label": "Avion (vols intérieurs)",
                  "value": 4
                }
              ]
            }
          },
          {
            "value": "118 milliards de passagers-km",
            "label": "Fréquentation des trains en France (un passager-km correspond à un voyageur transporté sur un kilomètre). C’est un record pour la quatrième année consécutive, en hausse de 4 % sur un an.",
            "date": "2025 (chiffres provisoires)",
            "source": {
              "title": "Marché français du transport ferroviaire – Premiers chiffres 2025",
              "url": "https://www.autorite-transports.fr/wp-content/uploads/2026/07/art-bilan-ferroviaire-france-premiers-chiffres-2025.pdf",
              "date": "2026-07",
              "publisher": "Autorité de régulation des transports"
            }
          },
          {
            "value": "15 lots sur plus de 50",
            "label": "Lots de trains financés par les régions ou l’État (TER, Intercités, Transilien) attribués après mise en concurrence à la mi-2026, sur plus de 50 prévus ; plus de 40 doivent encore être mis en concurrence d’ici 2033. SNCF Voyageurs en a remporté 10, plus 1 en groupement avec Keolis, soit 86,3 % de l’offre attribuée (mesurée en trains-km, les kilomètres parcourus par les trains) ; RATP et Transdev, 2 chacun (9,3 % et 4,4 %). Sur les trains non subventionnés, comme les TGV, la concurrence reste limitée à 2 % du marché national.",
            "date": "mi-2026",
            "source": {
              "title": "Marché français du transport ferroviaire – Premiers chiffres 2025",
              "url": "https://www.autorite-transports.fr/wp-content/uploads/2026/07/art-bilan-ferroviaire-france-premiers-chiffres-2025.pdf",
              "date": "2026-07",
              "publisher": "Autorité de régulation des transports"
            },
            "chart": {
              "kind": "compare",
              "unit": "% de l’offre attribuée",
              "items": [
                {
                  "label": "SNCF Voyageurs",
                  "value": 86.3
                },
                {
                  "label": "RATP",
                  "value": 9.3
                },
                {
                  "label": "Transdev",
                  "value": 4.4
                }
              ]
            }
          },
          {
            "value": "4,3 Md€",
            "label": "Résultat net des sociétés concessionnaires d’autoroutes en 2024 (−3,4 % sur un an), pour un chiffre d’affaires de 12,8 Md€, issu à 97 % des péages. La même année, elles ont investi 1,3 Md€, payé 1,6 Md€ d’impôt sur les sociétés et versé 4,4 Md€ de dividendes.",
            "date": "2024",
            "source": {
              "title": "Synthèse des comptes des sociétés concessionnaires d’autoroutes – exercice 2024",
              "url": "https://www.autorite-transports.fr/wp-content/uploads/2025/12/synthese_des_comptes_sca_2024.pdf",
              "date": "2025-12",
              "publisher": "Autorité de régulation des transports"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-7-a",
          "text": "Rendre les transports en commun gratuits, au moins dans les grandes agglomérations"
        },
        {
          "id": "ecologie_energie-7-b",
          "text": "Confier de nouveau le rail à un opérateur public unique et reprendre les autoroutes aux sociétés privées"
        },
        {
          "id": "ecologie_energie-7-c",
          "text": "Proposer aux ménages modestes la location de voitures électriques à prix réduit"
        },
        {
          "id": "ecologie_energie-7-d",
          "text": "Rénover le réseau ferroviaire par un grand plan d’investissement, des petites lignes au fret"
        },
        {
          "id": "ecologie_energie-7-e",
          "text": "Poursuivre l’ouverture des lignes ferroviaires à la concurrence entre plusieurs opérateurs",
          "external": true
        },
        {
          "id": "ecologie_energie-7-f",
          "text": "Revenir sur la fin programmée des voitures neuves à moteur thermique et ne plus restreindre l’usage de la voiture"
        }
      ]
    },
    {
      "id": "agriculture-1",
      "topicId": "agriculture",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Comment protéger les agriculteurs face aux produits importés ?",
      "context": "Aujourd’hui : les accords commerciaux sont négociés par l’Union européenne, et les aides agricoles passent en grande partie par la politique agricole commune (PAC).",
      "explainer": {
        "summary": "Une partie des produits agricoles importés est fabriquée selon d’autres règles de production que celles imposées aux agriculteurs français, et le libre-échange ouvre à la fois des débouchés à l’export et une concurrence accrue. Les approches divergent : sortir de la PAC, s’opposer aux accords de libre-échange ou les conditionner, interdire les importations non conformes aux normes françaises, aligner les normes françaises sur les règles européennes, ou soutenir les petites exploitations plutôt que protéger les frontières.",
        "points": [
          {
            "text": "L’accord commercial entre l’UE et le Mercosur (Brésil, Argentine, Uruguay, Paraguay) s’applique à titre provisoire depuis le 1er mai 2026. Il ouvre des quotas à droits réduits pour des produits agricoles sensibles comme le bœuf et la volaille. Il supprimera à terme 91 % des droits de douane du Mercosur sur les produits européens et y protège 344 indications géographiques européennes, comme le comté ou le champagne. Les importations doivent respecter les normes sanitaires de l’UE (pas de viande aux hormones, par exemple), sans que les normes de production soient forcément les mêmes. Une clause de sauvegarde permet d’ouvrir une enquête si, pour un produit sensible, les importations augmentent ou le prix baisse d’au moins 5 %, et que le produit importé est 5 % moins cher que son équivalent européen.",
            "source": {
              "title": "Accord commercial UE - Mercosur : distinguer le vrai du faux",
              "url": "https://france.representation.ec.europa.eu/informations/accord-commercial-ue-mercosur-distinguer-le-vrai-du-faux-2026-04-27_fr",
              "date": "2026-04-27",
              "publisher": "Représentation de la Commission européenne en France"
            }
          },
          {
            "text": "Le droit européen autorise l’importation d’aliments contenant des résidus de pesticides interdits dans l’UE, tant que ces résidus restent sous des « limites maximales de résidus » fixées au niveau européen. Par un arrêté du 5 janvier 2026, la France a suspendu en urgence l’importation d’une liste d’aliments venant de pays hors UE, surtout des fruits et légumes mais aussi des céréales, contenant des résidus de cinq de ces substances. Le Conseil d’État a jugé cette mesure légale le 13 mai 2026.",
            "source": {
              "title": "Fruits et légumes provenant de pays hors UE et contenant des résidus de pesticides interdits : le Gouvernement pouvait suspendre leur importation (communiqué, décision n° 511530)",
              "url": "https://www.conseil-etat.fr/content/download/239290/document/Communiqu%C3%A9%20de%20presse%20-%20Fruits%20et%20l%C3%A9gumes%20-%20web.pdf",
              "date": "2026-05-13",
              "publisher": "Conseil d’État"
            }
          },
          {
            "text": "La loi d’urgence agricole du 18 août 2026 permet au ministre de l’Agriculture d’interdire l’importation d’aliments contenant des résidus de certaines substances ou de médicaments vétérinaires interdits dans l’UE. Elle oblige aussi les cantines publiques (administrations, collectivités, écoles…) à s’approvisionner dans l’Union européenne, sauf rares exceptions.",
            "source": {
              "title": "La loi d’urgence pour la protection et la souveraineté agricoles promulguée par le président de la République",
              "url": "https://agriculture.gouv.fr/la-loi-durgence-pour-la-protection-et-la-souverainete-agricoles-promulguee-par-le-president-de-la",
              "date": "2026-08-19",
              "publisher": "Ministère de l’Agriculture, de l’Agro-alimentaire et de la Souveraineté alimentaire"
            }
          }
        ],
        "figures": [
          {
            "value": "200 M€",
            "label": "Excédent commercial agricole et agroalimentaire de la France en 2025, en baisse de 5 Md€ sur un an : son plus bas niveau depuis au moins 2000. Les importations progressent : 64,4 Md€ de produits des industries agroalimentaires (+8,5 %) et 19,7 Md€ de produits agricoles (+8,9 %, notamment cacao, colza et café). Les exportations atteignent 65 Md€ pour les industries agroalimentaires, leur plus haut niveau depuis au moins 2000 malgré le recul des boissons (-7,0 %), et 19,3 Md€ pour les produits agricoles.",
            "date": "2025",
            "source": {
              "title": "Le chiffre du commerce extérieur – Analyse annuelle 2025",
              "url": "https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf",
              "date": "2026-02-06",
              "publisher": "Direction générale des douanes et droits indirects"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Exportations agroalimentaires",
                  "value": 65
                },
                {
                  "label": "Importations agroalimentaires",
                  "value": 64.4
                },
                {
                  "label": "Exportations agricoles",
                  "value": 19.3
                },
                {
                  "label": "Importations agricoles",
                  "value": 19.7
                }
              ]
            }
          },
          {
            "value": "99 000 tonnes",
            "label": "Quota de viande bovine du Mercosur importable dans l’UE avec un droit réduit de 7,5 % selon l’accord UE-Mercosur, soit 1,5 % de la production bovine de l’UE. Sur les onze premiers mois de 2025, avant l’application de l’accord, l’UE a importé près de 190 000 tonnes de bœuf du Mercosur. Volaille : quota de 180 000 tonnes sans droits (1,3 % de la production de l’UE), pour plus de 164 000 tonnes importées sur la même période.",
            "date": "2025",
            "source": {
              "title": "Le chiffre du commerce extérieur – Analyse annuelle 2025 (focus 2 : échanges avec les pays du Mercosur)",
              "url": "https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf",
              "date": "2026-02-06",
              "publisher": "Direction générale des douanes et droits indirects"
            }
          },
          {
            "value": "9,4 Md€",
            "label": "Aides de la politique agricole commune perçues par la France en 2024 : 7,5 Md€ du fonds de garantie, qui verse les aides directes, et 1,9 Md€ du fonds de développement rural. La même année, 16,5 Md€ de financements européens ont bénéficié à la France, pour une contribution nette de la France au budget de l’UE de 7,9 Md€ (hors plan de relance).",
            "date": "2024",
            "source": {
              "title": "Rapport n° 1996 sur le projet de loi de finances pour 2026 – Annexe 47 : Affaires européennes",
              "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b1996-tiii-a47_rapport-fond.pdf",
              "date": "2025-10-23",
              "publisher": "Assemblée nationale, commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Fonds de garantie",
                  "value": 7.5
                },
                {
                  "label": "Fonds de développement rural",
                  "value": 1.9
                }
              ]
            }
          },
          {
            "value": "349 600",
            "label": "Nombre d’exploitations agricoles en France métropolitaine en 2023, soit environ 40 000 de moins qu’en 2020. Celles qui restent s’agrandissent : surface moyenne de 93 hectares en 2023, contre 89 en 2020 et 76 en 2010 (hors micro-exploitations).",
            "date": "2023",
            "source": {
              "title": "Enquête sur la structure des exploitations agricoles en 2023 – L’agrandissement des exploitations se poursuit depuis 2020 (Agreste Primeur n° 2, version révisée)",
              "url": "https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/Pri2502/Primeur2025-2_ESEA-2023_v2.pdf",
              "date": "2025-06",
              "publisher": "Agreste, ministère de l’Agriculture"
            },
            "chart": {
              "kind": "series",
              "unit": "ha",
              "items": [
                {
                  "label": "2010",
                  "value": 76
                },
                {
                  "label": "2020",
                  "value": 89
                },
                {
                  "label": "2023",
                  "value": 93
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "agriculture-1-a",
          "text": "Sortir de la politique agricole commune pour une politique nationale, avec des droits de douane aux frontières"
        },
        {
          "id": "agriculture-1-b",
          "text": "Aligner les normes agricoles françaises sur les règles européennes, sans exigence supplémentaire"
        },
        {
          "id": "agriculture-1-c",
          "text": "Rester dans la politique agricole commune et s’opposer au niveau européen aux accords de libre-échange agricoles"
        },
        {
          "id": "agriculture-1-d",
          "text": "Interdire d’office les importations non conformes aux normes françaises, quitte à déroger aux règles européennes"
        },
        {
          "id": "agriculture-1-e",
          "text": "Soutenir les petits paysans face à l’agro-industrie et à la grande distribution plutôt que miser sur le protectionnisme"
        },
        {
          "id": "agriculture-1-f",
          "text": "Accepter les accords de libre-échange agricoles s’ils imposent aux importations les normes européennes de production"
        }
      ]
    },
    {
      "id": "agriculture-2",
      "topicId": "agriculture",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle règle pour les pesticides interdits en France mais autorisés ailleurs en Europe ?",
      "context": "Aujourd’hui : le Parlement a adopté en juillet 2026 une loi qui réautorise par dérogation l’acétamipride, un insecticide interdit en France depuis 2018 mais autorisé ailleurs dans l’Union européenne.",
      "explainer": {
        "summary": "Certaines substances autorisées dans l’Union européenne sont interdites en France : pour les uns, ces interdictions protègent la santé et l’environnement ; pour les autres, elles désavantagent les producteurs français face à leurs concurrents européens et aux produits importés. Les approches vont de l’alignement complet sur les règles européennes à des interdictions plus larges, étendues au glyphosate et aux produits importés.",
        "points": [
          {
            "text": "Dans l’UE, les substances actives des pesticides, c’est-à-dire les molécules qui agissent, sont approuvées au niveau européen. Chaque État membre autorise ensuite, ou non, les produits qui les contiennent sur son territoire, après évaluation. L’approbation européenne du glyphosate a été renouvelée en 2023, jusqu’au 15 décembre 2033.",
            "source": {
              "title": "Glyphosate – Renewal of approval",
              "url": "https://food.ec.europa.eu/plants/pesticides/approval-active-substances-safeners-and-synergists/renewal-approval/glyphosate_en",
              "publisher": "Commission européenne (DG Santé et sécurité alimentaire)"
            }
          },
          {
            "text": "La loi d’urgence agricole permet à l’Anses, l’agence publique de sécurité sanitaire, de déroger à l’interdiction pour l’acétamipride (noisettes) et la flupyradifurone (betteraves sucrières, pommes, cerises). Il faut une menace grave sur la production, des alternatives inexistantes ou manifestement insuffisantes, et aucun risque significatif pour la santé humaine ni atteinte grave et irréversible à l’environnement. Chaque dérogation dure un an, renouvelable deux fois, et le dispositif doit être abrogé trois ans après la promulgation. Le Conseil constitutionnel l’a validé le 14 août 2026, avec des réserves. Il relève les incidences de ces produits sur les pollinisateurs, les oiseaux, l’eau, les sols et la santé humaine, et juge d’intérêt général l’objectif de préserver la production face aux distorsions de concurrence en Europe.",
            "source": {
              "title": "Décision n° 2026-914 DC du 14 août 2026 – Loi d’urgence pour la protection et la souveraineté agricoles",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026914DC.htm",
              "date": "2026-08-14",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Pour les aliments, y compris importés, l’UE fixe des limites maximales de résidus. Depuis le 7 mars 2026, un règlement européen abaisse celles de deux néonicotinoïdes, la clothianidine et le thiaméthoxame, interdits en plein air dans l’UE depuis 2018. Le règlement vise à ce que les produits importés ne contiennent plus de résidus issus d’usages en plein air, pour protéger les pollinisateurs dans le monde.",
            "source": {
              "title": "Règlement (UE) 2023/334 de la Commission du 2 février 2023 (limites maximales applicables aux résidus de clothianidine et de thiaméthoxame)",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32023R0334",
              "date": "2023-02-02",
              "publisher": "Commission européenne (EUR-Lex)"
            }
          }
        ],
        "figures": [
          {
            "value": "6 usages sur 130",
            "label": "Usages autorisés des néonicotinoïdes pour lesquels l’Anses n’a trouvé aucune alternative, chimique ou non, suffisamment efficace et opérationnelle (avis de mai 2018). Dans 89 % des cas, les solutions de remplacement reposent sur d’autres substances chimiques, notamment des pyréthrinoïdes ; dans 78 % des cas, au moins une solution non chimique existe.",
            "date": "2018",
            "source": {
              "title": "Risques et bénéfices des produits phytopharmaceutiques à base de néonicotinoïdes et de leurs alternatives",
              "url": "https://www.anses.fr/fr/content/risques-et-benefices-des-produits-phytopharmaceutiques-base-de-neonicotinoides-et-de-leurs",
              "date": "2018-05-30",
              "publisher": "Anses"
            },
            "chart": {
              "kind": "part",
              "value": 6,
              "total": 130,
              "whole": "usages autorisés de néonicotinoïdes"
            }
          },
          {
            "value": "8 269 tonnes",
            "label": "Ventes de glyphosate en France en 2024, contre 6 753 tonnes en 2023 et 8 683 tonnes en moyenne sur la période de référence 2015-2017",
            "date": "2024",
            "source": {
              "title": "Ventes de produits phytopharmaceutiques pour l’année 2024 (données définitives)",
              "url": "https://www.ecologie.gouv.fr/actualites/publication-ventes-produits-phytopharmaceutiques",
              "publisher": "Ministère de la Transition écologique (Service des données et études statistiques)"
            },
            "chart": {
              "kind": "compare",
              "unit": "tonnes",
              "items": [
                {
                  "label": "Moyenne 2015-2017",
                  "value": 8683
                },
                {
                  "label": "2023",
                  "value": 6753
                },
                {
                  "label": "2024",
                  "value": 8269
                }
              ]
            }
          },
          {
            "value": "98,2 %",
            "label": "Part des 86 449 échantillons d’aliments des programmes nationaux de contrôle des pays de l’UE conformes aux limites de résidus de pesticides en 2024, contre 98 % en 2023 et 97,8 % en 2022. Les limites étaient dépassées dans 3,3 % des cas, dont 1,8 % jugés non conformes. Lors des contrôles renforcés ciblant certaines importations, environ 5,5 % des 39 433 échantillons dépassaient les limites, dont 3,6 % non conformes, et ces lots ont été bloqués.",
            "date": "2024",
            "source": {
              "title": "Pesticide residues in food: latest data released",
              "url": "https://www.efsa.europa.eu/en/news/pesticide-residues-food-latest-data-released",
              "date": "2026-05-05",
              "publisher": "Autorité européenne de sécurité des aliments (EFSA)"
            },
            "chart": {
              "kind": "part",
              "value": 98.2,
              "total": 100,
              "unit": "%",
              "whole": "des échantillons des programmes nationaux"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "agriculture-2-a",
          "text": "Autoriser en France tout pesticide autorisé ailleurs dans l’Union européenne"
        },
        {
          "id": "agriculture-2-b",
          "text": "Accorder des dérogations limitées dans le temps aux cultures sans solution de remplacement"
        },
        {
          "id": "agriculture-2-c",
          "text": "Maintenir toutes les interdictions françaises actuelles, sans aucune dérogation"
        },
        {
          "id": "agriculture-2-d",
          "text": "Interdire aussi le glyphosate et l’importation de produits traités avec des pesticides interdits"
        }
      ]
    },
    {
      "id": "agriculture-3",
      "topicId": "agriculture",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité pour la protection des animaux ?",
      "context": "Aujourd’hui : le Code civil reconnaît les animaux comme des êtres sensibles mais les soumet au régime des biens ; l’élevage en cage, la chasse et, dans certaines communes, la corrida sont autorisés.",
      "explainer": {
        "summary": "Le droit punit la maltraitance animale, avec des peines alourdies en 2021, et encadre l’élevage, la chasse, l’abattage rituel sans étourdissement et, là où une tradition locale ininterrompue existe, la corrida. Les approches divergent : sortir de l’élevage intensif, interdire la chasse, l’élevage en cage ou la corrida, durcir les sanctions, imposer l’étourdissement, ou ne prévoir ni nouvelle norme ni nouvelle interdiction pour les éleveurs et les chasseurs.",
        "points": [
          {
            "text": "La loi du 30 novembre 2021 contre la maltraitance animale alourdit les peines. Elle impose un certificat d’engagement et de connaissance à toute personne qui acquiert pour la première fois un chat, un chien ou un autre animal de compagnie fixé par décret. Elle interdit les élevages de visons destinés à la fourrure. Elle prévoit la fin des spectacles de cétacés dans un délai de cinq ans, et celle des animaux d’espèces non domestiques dans les cirques itinérants dans un délai de sept ans.",
            "source": {
              "title": "Loi n° 2021-1539 du 30 novembre 2021 visant à lutter contre la maltraitance animale et conforter le lien entre les animaux et les hommes",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044387560",
              "date": "2021-11-30",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Le code pénal punit les sévices graves et les actes de cruauté envers un animal domestique ou tenu en captivité. Il exclut toutefois les courses de taureaux là où une « tradition locale ininterrompue » peut être invoquée. Le Conseil constitutionnel a jugé cette exception conforme à la Constitution en 2012.",
            "source": {
              "title": "Décision n° 2012-271 QPC du 21 septembre 2012 – Immunité pénale en matière de courses de taureaux",
              "url": "https://www.conseil-constitutionnel.fr/decision/2012/2012271QPC.htm",
              "date": "2012-09-21",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Le droit européen impose d’étourdir les animaux avant l’abattage, mais autorise par dérogation l’abattage rituel sans étourdissement, au nom de la liberté de religion. Le 17 décembre 2020, la Cour de justice de l’UE a jugé qu’un État membre peut imposer, y compris pour l’abattage rituel, un étourdissement réversible qui n’entraîne pas la mort de l’animal.",
            "source": {
              "title": "Communiqué de presse n° 163/20 – Arrêt dans l’affaire C-336/19, Centraal Israëlitisch Consistorie van België e.a.",
              "url": "https://curia.europa.eu/jcms/upload/docs/application/pdf/2020-12/cp200163fr.pdf",
              "date": "2020-12-17",
              "publisher": "Cour de justice de l’Union européenne"
            }
          }
        ],
        "figures": [
          {
            "value": "3 ans et 45 000 €",
            "label": "Peine maximale pour sévices graves ou acte de cruauté envers un animal domestique ou tenu en captivité depuis la loi du 30 novembre 2021, contre 2 ans et 30 000 € auparavant ; 5 ans et 75 000 € si l’animal meurt",
            "date": "2021",
            "source": {
              "title": "Loi n° 2021-1539 du 30 novembre 2021 visant à lutter contre la maltraitance animale (article 26, modifiant l’article 521-1 du code pénal)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044387560",
              "date": "2021-11-30",
              "publisher": "Légifrance"
            }
          },
          {
            "value": "155 UGB",
            "label": "Taille moyenne du cheptel des exploitations ayant des animaux en 2023, contre 151 en 2020 et 122 en 2010. L’unité de gros bétail (UGB) permet d’additionner des espèces différentes (France métropolitaine, hors micro-exploitations). Les exploitations spécialisées en élevage représentent 37,5 % des exploitations en 2023, contre 38,9 % en 2020.",
            "date": "2023",
            "source": {
              "title": "Enquête sur la structure des exploitations agricoles en 2023 – L’agrandissement des exploitations se poursuit depuis 2020 (Agreste Primeur n° 2, version révisée)",
              "url": "https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/Pri2502/Primeur2025-2_ESEA-2023_v2.pdf",
              "date": "2025-06",
              "publisher": "Agreste, ministère de l’Agriculture"
            },
            "chart": {
              "kind": "series",
              "unit": "UGB",
              "items": [
                {
                  "label": "2010",
                  "value": 122
                },
                {
                  "label": "2020",
                  "value": 151
                },
                {
                  "label": "2023",
                  "value": 155
                }
              ]
            }
          },
          {
            "value": "31,1 %",
            "label": "Part des capacités d’élevage de poules pondeuses en cages aménagées en France en 2024, sur 59,3 millions de places, d’après les données déclarées par la France à la Commission européenne. Dans le même tableau, cette part est de 35,5 % pour l’ensemble de l’UE (données 2025, plus anciennes pour quelques pays).",
            "date": "2024",
            "source": {
              "title": "Eggs – Market situation – Dashboard (tableau « % by farming method in respective country »)",
              "url": "https://agriculture.ec.europa.eu/document/download/9bdf9842-1eb6-41a2-8845-49738b812b2b_en?filename=eggs-dashboard_en.pdf",
              "date": "2026-10-07",
              "publisher": "Commission européenne (DG Agriculture et développement rural)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France (2024)",
                  "value": 31.1
                },
                {
                  "label": "Ensemble de l’UE (2025)",
                  "value": 35.5
                }
              ]
            }
          },
          {
            "value": "909 560",
            "label": "Validations du permis de chasser enregistrées pour la saison 2025-2026 : 445 956 validations nationales (dont 442 257 annuelles) et 463 604 validations départementales (dont 441 603 annuelles). Les autres sont des validations temporaires de trois ou neuf jours.",
            "date": "2025-2026",
            "source": {
              "title": "Question écrite n° 16616 – Nombre de validations nationales et départementales de permis de chasser (réponse du ministère de la Transition écologique publiée au JO le 22 septembre 2026)",
              "url": "https://questions.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE16616.pdf",
              "date": "2026-09-22",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "items": [
                {
                  "label": "Validations nationales",
                  "value": 445956
                },
                {
                  "label": "Validations départementales",
                  "value": 463604
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "agriculture-3-a",
          "text": "Sortir de l’élevage intensif en finançant la reconversion des éleveurs, et interdire la chasse"
        },
        {
          "id": "agriculture-3-b",
          "text": "Interdire progressivement l’élevage en cage, les fermes-usines, la fourrure et la corrida"
        },
        {
          "id": "agriculture-3-c",
          "text": "Sanctionner plus durement l’abandon et la maltraitance des animaux de compagnie"
        },
        {
          "id": "agriculture-3-d",
          "text": "Rendre obligatoire l’étourdissement des animaux avant tout abattage, y compris rituel"
        },
        {
          "id": "agriculture-3-e",
          "text": "Laisser les élevages s’agrandir et se moderniser, sans nouvelles normes de bien-être animal"
        },
        {
          "id": "agriculture-3-f",
          "text": "Préserver la chasse, l’élevage et les traditions rurales, sans nouvelles interdictions",
          "external": true
        }
      ]
    },
    {
      "id": "territoires-2",
      "topicId": "territoires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle évolution pour l’organisation et les pouvoirs des collectivités locales ?",
      "context": "Aujourd’hui : la France compte trois niveaux de collectivités (communes, départements, régions), auxquels s’ajoutent les intercommunalités ; les régions de l’Hexagone sont passées de 22 à 13 en 2016.",
      "explainer": {
        "summary": "Communes, départements et régions, avec les intercommunalités, gèrent de nombreux services de proximité et une large part de l’investissement public. Le débat porte sur leur organisation (nombre d’échelons, contours des régions, place des métropoles), sur le partage des compétences avec l’État, dans un sens ou dans l’autre, et sur leurs moyens (impôts locaux, dotations de l’État).",
        "points": [
          {
            "text": "La Constitution (article 72) nomme les communes, les départements et les régions, ainsi que les collectivités à statut particulier et d’outre-mer. La loi peut créer d’autres collectivités, « le cas échéant en lieu et place » d’une ou de plusieurs d’entre elles. Les collectivités « s’administrent librement » par des conseils élus. Quand la loi ou le règlement le prévoit, elles peuvent déroger à titre expérimental aux règles qui encadrent leurs compétences.",
            "source": {
              "title": "Constitution du 4 octobre 1958, texte intégral en vigueur (articles 72 et 72-2)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "2024-03-08",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Tout transfert de compétences entre l’État et les collectivités doit s’accompagner de ressources équivalentes. Leurs recettes fiscales et autres ressources propres doivent représenter une « part déterminante » de leurs ressources. La loi doit aussi prévoir une péréquation, c’est-à-dire une redistribution destinée à favoriser l’égalité entre collectivités (article 72-2).",
            "source": {
              "title": "Constitution du 4 octobre 1958, texte intégral en vigueur (articles 72 et 72-2)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "2024-03-08",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "En 2021, les collectivités ont perdu plusieurs impôts locaux : la taxe d’habitation sur les résidences principales pour les communes, la taxe foncière sur les propriétés bâties pour les départements, la CVAE (un impôt sur la valeur ajoutée des entreprises) pour les régions. Ces pertes ont été compensées notamment par des fractions de la TVA nationale, devenues leur ressource la plus importante (52,7 Md€ en 2025).",
            "source": {
              "title": "Rapport de l’OFGL 2026 – Vue d’ensemble sur l’année 2025",
              "url": "https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/OFGL/pre%20rapport%202026/1-%20Vue%20d%27ensemble.pdf",
              "date": "2026",
              "publisher": "Observatoire des finances et de la gestion publique locales (OFGL)"
            }
          }
        ],
        "figures": [
          {
            "value": "34 875",
            "label": "communes au 1er janvier 2026 : 34 871 sont regroupées dans l’une des 1 252 intercommunalités à fiscalité propre, qui lèvent leurs propres impôts (21 métropoles, 14 communautés urbaines, 230 communautés d’agglomération et 987 communautés de communes), ou dans la Métropole de Lyon, collectivité à statut particulier ; 4 sont isolées – France métropolitaine et départements d’outre-mer",
            "date": "1er janvier 2026",
            "source": {
              "title": "Les collectivités locales en chiffres 2026 – Chapitre 2, tableau 2.5a « Les groupements de collectivités territoriales » (fichier xlsx)",
              "url": "https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/DESL/2026/CLC/Chapitre%202%20-%20Les%20collectivit%C3%A9s%20locales%20et%20leur%20population-2026.xlsx",
              "date": "2026",
              "publisher": "Ministère de l’Intérieur – Direction générale des collectivités locales (DGCL)"
            },
            "chart": {
              "kind": "part",
              "value": 34871,
              "total": 34875,
              "whole": "communes"
            }
          },
          {
            "value": "70,7 Md€",
            "label": "Investissement des administrations publiques locales (collectivités et organismes locaux) au sens des comptes nationaux, contre 68,4 Md€ en 2024, soit une hausse de 3,4 % sur un an",
            "date": "2025",
            "source": {
              "title": "Rapport de l’OFGL 2026 – Vue d’ensemble sur l’année 2025",
              "url": "https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/OFGL/pre%20rapport%202026/1-%20Vue%20d%27ensemble.pdf",
              "date": "2026",
              "publisher": "Observatoire des finances et de la gestion publique locales (OFGL)"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2024",
                  "value": 68.4
                },
                {
                  "label": "2025",
                  "value": 70.7
                }
              ]
            }
          },
          {
            "value": "38,2 Md€",
            "label": "Dotations et autres concours financiers de l’État aux collectivités, en hausse de 0,4 % sur un an. Ils pèsent 16,8 % des recettes des communes, contre 6 % pour les régions et les collectivités territoriales uniques (qui exercent les compétences d’une région et d’un département)",
            "date": "2025",
            "source": {
              "title": "Rapport de l’OFGL 2026 – Vue d’ensemble sur l’année 2025",
              "url": "https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/OFGL/pre%20rapport%202026/1-%20Vue%20d%27ensemble.pdf",
              "date": "2026",
              "publisher": "Observatoire des finances et de la gestion publique locales (OFGL)"
            },
            "chart": {
              "kind": "compare",
              "unit": "% des recettes",
              "items": [
                {
                  "label": "Communes",
                  "value": 16.8
                },
                {
                  "label": "Régions, collectivités uniques",
                  "value": 6
                }
              ]
            }
          },
          {
            "value": "9,3 Md€",
            "label": "Déficit des collectivités locales au sens des comptes nationaux, après 12,0 Md€ en 2024 ; avec les organismes locaux comme Île-de-France Mobilités et la Société des grands projets (6,2 Md€), celui de l’ensemble des administrations publiques locales atteint 15,6 Md€, sur un déficit public total de 152,5 Md€. La même année, l’État a prélevé une partie de leurs recettes fiscales (« dispositif de lissage conjoncturel ») : 500 M€ sur 1 924 communes et 141 intercommunalités, restitués sur trois ans, 10 % étant réservés à la péréquation ; 220 M€ sur 50 départements ; 280 M€ sur 12 régions",
            "date": "2025",
            "source": {
              "title": "Les finances des collectivités locales en 2026 – Vue d’ensemble (pré-rapport)",
              "url": "https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/OFGL/pre%20rapport%202026/1-%20Vue%20d%27ensemble.pdf",
              "date": "2026",
              "publisher": "Observatoire des finances et de la gestion publique locales (OFGL)"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2024",
                  "value": 12
                },
                {
                  "label": "2025",
                  "value": 9.3
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "territoires-2-a",
          "text": "Supprimer les régions et recentrer l’organisation locale sur les communes et les départements"
        },
        {
          "id": "territoires-2-b",
          "text": "Supprimer ou fusionner un échelon de collectivités et donner davantage de pouvoirs aux élus locaux"
        },
        {
          "id": "territoires-2-c",
          "text": "Transférer de nouvelles compétences aux collectivités en clarifiant le partage des rôles avec l’État"
        },
        {
          "id": "territoires-2-d",
          "text": "Redécouper les régions selon les bassins des fleuves et des rivières, et supprimer les métropoles"
        },
        {
          "id": "territoires-2-e",
          "text": "Rendre à l’État certaines compétences des collectivités pour garantir l’égalité entre les territoires"
        }
      ]
    },
    {
      "id": "securite_justice-1",
      "topicId": "securite_justice",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle orientation pour la justice pénale ?",
      "context": "Aujourd’hui : les prisons françaises comptent nettement plus de détenus que de places.",
      "explainer": {
        "summary": "Les prisons sont surpeuplées, la France compte moins de juges par habitant que la médiane européenne, et 20,4 % des personnes condamnées pour un délit en 2024 étaient en récidive légale. Les approches divergent sur la priorité : peines minimales, places de prison supplémentaires, sanctions plus rapides, moins de prison (peines alternatives, plafond de détenus), expulsion des étrangers condamnés, abrogation des lois qui ont durci le droit pénal, ou recrutement de magistrats et de greffiers.",
        "points": [
          {
            "text": "Pour un délit, il y a « récidive légale » quand une personne déjà condamnée définitivement commet le même délit, ou un délit assimilé, dans les cinq ans qui suivent la fin ou la prescription de sa précédente peine. La peine maximale encourue (prison et amende) est alors doublée.",
            "source": {
              "title": "Code pénal, article 132-10",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006417367",
              "date": "en vigueur depuis le 1er mars 1994",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Un plan de 15 000 places de prison supplémentaires a été annoncé en 2018 ; un amendement à la loi de programmation de la justice 2023-2027 a porté l’objectif à 18 000 places nettes. À l’automne 2025, 24 établissements avaient été livrés : 7 384 places brutes, et 5 411 places nettes compte tenu de fermetures. Selon la commission des finances du Sénat, le plan était réalisé à 36,1 % de sa cible, ou à 30,1 % de l’objectif de 18 000 places.",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Justice – Rapport général n° 139 (2025-2026), tome III, annexe 17",
              "url": "https://www.senat.fr/rap/l25-139-317/l25-139-317_mono.html",
              "date": "24 novembre 2025",
              "publisher": "Sénat – commission des finances"
            }
          },
          {
            "text": "En France, au 1er janvier 2025, 13 778 des 58 758 condamnés détenus et 6 047 des 20 579 prévenus (en détention provisoire) étaient de nationalité étrangère.",
            "source": {
              "title": "Les chiffres clés de la justice – Édition 2025 (p. 23, « Caractéristiques des personnes écrouées au 1er janvier 2025 »)",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-03/Chiffres_Cles_2025_corrV2.pdf",
              "date": "édition 2025 (version corrigée mise en ligne en 2026)",
              "publisher": "Ministère de la Justice – SSER"
            }
          }
        ],
        "figures": [
          {
            "value": "142,1 %",
            "label": "de densité carcérale (détenus rapportés aux places) : 90 020 détenus pour 63 348 places, contre 134,7 % un an plus tôt. Elle atteint 176,1 % (contre 164,1 %) dans les maisons d’arrêt et quartiers de maison d’arrêt, qui accueillent les prévenus et les courtes peines. 8 347 détenus dorment sur un matelas au sol, contre 5 500 un an plus tôt ; 27,3 % des détenus sont des prévenus – France entière",
            "date": "1er septembre 2026",
            "source": {
              "title": "Mesure de l’incarcération – Indicateurs clés au 1er septembre 2026",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-10/mesure_mensuelle_01092026.pdf",
              "date": "octobre 2026",
              "publisher": "Ministère de la Justice – Direction de l’administration pénitentiaire"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "Sept. 2025",
                  "value": 134.7
                },
                {
                  "label": "Sept. 2026",
                  "value": 142.1
                }
              ]
            }
          },
          {
            "value": "20,4 %",
            "label": "des personnes condamnées pour un délit étaient en récidive légale ; 24,1 % étaient « réitérantes », c’est-à-dire déjà condamnées pour un crime ou un délit dans les cinq années précédentes, sans être en récidive légale (données provisoires) – France",
            "date": "2024",
            "source": {
              "title": "Les chiffres clés de la justice – Édition 2025 (p. 21)",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-03/Chiffres_Cles_2025_corrV2.pdf",
              "date": "édition 2025 (version corrigée mise en ligne en 2026)",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "En récidive légale",
                  "value": 20.4
                },
                {
                  "label": "Réitérantes, hors récidive",
                  "value": 24.1
                }
              ]
            }
          },
          {
            "value": "14 488",
            "label": "travaux d’intérêt général (TIG, un travail non rémunéré au profit de la collectivité) prononcés comme peine principale, et 121 057 peines de prison en tout ou partie ferme (durée ferme moyenne : 11,0 mois), sur 559 444 peines et mesures principales (données provisoires) – France",
            "date": "2024",
            "source": {
              "title": "Les chiffres clés de la justice – Édition 2025 (p. 20)",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-03/Chiffres_Cles_2025_corrV2.pdf",
              "date": "édition 2025 (version corrigée mise en ligne en 2026)",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "part",
              "value": 14488,
              "total": 559444,
              "whole": "peines et mesures principales"
            }
          },
          {
            "value": "11,3",
            "label": "juges professionnels pour 100 000 habitants en France, contre 10,7 en 2012 et une médiane européenne de 17,6 (données de la Commission européenne pour l’efficacité de la justice du Conseil de l’Europe, reprises par le Sénat). La loi de programmation de la justice 2023-2027 prévoit 10 000 emplois supplémentaires au ministère, dont 1 500 magistrats et 1 800 greffiers",
            "date": "2022",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Justice – Rapport général n° 139 (2025-2026), tome III, annexe 17 (d’après CEPEJ, Systèmes judiciaires européens – rapport d’évaluation 2024)",
              "url": "https://www.senat.fr/rap/l25-139-317/l25-139-317_mono.html",
              "date": "24 novembre 2025",
              "publisher": "Sénat – commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "juges pour 100 000 habitants",
              "items": [
                {
                  "label": "France, 2012",
                  "value": 10.7
                },
                {
                  "label": "France, 2022",
                  "value": 11.3
                },
                {
                  "label": "Médiane européenne",
                  "value": 17.6
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-1-a",
          "text": "Instaurer des peines minimales obligatoires, notamment pour les récidivistes et les infractions les plus graves"
        },
        {
          "id": "securite_justice-1-b",
          "text": "Construire davantage de places de prison pour exécuter toutes les peines d’emprisonnement prononcées"
        },
        {
          "id": "securite_justice-1-c",
          "text": "Juger et sanctionner beaucoup plus vite, quitte à prononcer des peines plus courtes mais exécutées sans délai"
        },
        {
          "id": "securite_justice-1-d",
          "text": "Réduire le recours à la prison, grâce aux peines alternatives ou à un plafond légal du nombre de détenus"
        },
        {
          "id": "securite_justice-1-e",
          "text": "Expulser systématiquement les étrangers condamnés, y compris ceux qui purgent une peine de prison"
        },
        {
          "id": "securite_justice-1-f",
          "text": "Abroger les lois qui ont durci le droit pénal ces dernières années et amnistier les manifestants condamnés"
        },
        {
          "id": "securite_justice-1-g",
          "text": "Recruter massivement magistrats, greffiers et conseillers d’insertion, pour juger plus vite et préparer la sortie de prison"
        }
      ]
    },
    {
      "id": "securite_justice-2",
      "topicId": "securite_justice",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle priorité pour la police et la sécurité du quotidien ?",
      "context": "Aujourd’hui : une proposition de loi créant une présomption de légitime défense pour les policiers et les gendarmes, adoptée par l’Assemblée en juillet 2026, attend son examen au Sénat ; les enquêtes visant ces agents sont le plus souvent confiées aux inspections internes de la police et de la gendarmerie (IGPN, IGGN).",
      "explainer": {
        "summary": "L’enjeu est la sécurité du quotidien et la relation entre les forces de l’ordre et les habitants. Les approches, qui peuvent se combiner, privilégient soit davantage de moyens et de pouvoirs (effectifs, présence sur la voie publique, polices municipales, vidéosurveillance, protection juridique des agents), soit un changement des pratiques et de leur contrôle (contrôles d’identité, usage de la force, police de proximité, contrôle indépendant).",
        "points": [
          {
            "text": "Depuis le 2 mars 2017, policiers et gendarmes peuvent faire usage de leurs armes « en cas d’absolue nécessité et de manière strictement proportionnée », dans cinq cas fixés par la loi. L’un d’eux vise un conducteur qui refuse de s’arrêter : il faut qu’on ne puisse pas immobiliser le véhicule autrement et que ses occupants soient susceptibles, dans leur fuite, de porter atteinte à la vie ou à l’intégrité physique des agents ou d’autrui.",
            "source": {
              "title": "Code de la sécurité intérieure, article L435-1",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034107970",
              "date": "en vigueur depuis le 2 mars 2017",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Modifiée le 18 août 2026, la loi autorise à titre expérimental, jusqu’au 31 décembre 2030, l’analyse par algorithme des images de vidéoprotection et des caméras installées sur des aéronefs, comme les drones, « à la seule fin de prévenir des risques d’actes de terrorisme ou d’atteintes graves à la sécurité des personnes ». Elle vise les manifestations sportives, récréatives ou culturelles particulièrement exposées, leurs abords et leurs transports, ainsi que des lieux ouverts au public fixés par arrêté. La reconnaissance faciale et toute identification biométrique restent exclues.",
            "source": {
              "title": "Loi n° 2023-380 du 19 mai 2023 relative aux jeux Olympiques et Paralympiques de 2024, article 10 (version modifiée par la loi n° 2026-798 du 18 août 2026, art. 50)",
              "url": "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000047561974",
              "date": "en vigueur depuis le 20 août 2026",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Les chiffres de la délinquance ne comptent que les faits enregistrés par la police et la gendarmerie, après une plainte, un signalement ou à leur propre initiative. Selon le service statistique du ministère de l’Intérieur, ils donnent une indication du volume réel surtout pour les faits que les victimes signalent souvent, comme les cambriolages ou les vols de véhicules.",
            "source": {
              "title": "Présentation du jeu de données « Principales caractéristiques des victimes enregistrées et des mis en cause » (SSMSI)",
              "url": "https://static.data.gouv.fr/resources/principales-caracteristiques-des-victimes-enregistrees-et-des-mis-en-cause-pour-des-infractions-elucidees-par-la-police-et-la-gendarmerie-nationales/20260129-113555/metadonnees-victimes-mec-caract-ssmsi-29012026.pdf",
              "date": "29 janvier 2026",
              "publisher": "Ministère de l’Intérieur – SSMSI (data.gouv.fr)"
            }
          }
        ],
        "figures": [
          {
            "value": "472 956",
            "label": "victimes de violences physiques enregistrées par la police et la gendarmerie en 2025, contre 449 819 en 2024 et 277 268 en 2016 ; 256 863 dans le cadre intrafamilial et 216 093 hors de ce cadre – France métropolitaine et départements et régions d’outre-mer",
            "date": "2025",
            "source": {
              "title": "Base nationale des caractéristiques des victimes enregistrées par la police et la gendarmerie nationales (fichier xlsx)",
              "url": "https://static.data.gouv.fr/resources/principales-caracteristiques-des-victimes-enregistrees-et-des-mis-en-cause-pour-des-infractions-elucidees-par-la-police-et-la-gendarmerie-nationales/20260129-160110/donnee-nat-caract-victimes-data.gouv-2025-produit-le-29012026.xlsx",
              "date": "29 janvier 2026",
              "publisher": "Ministère de l’Intérieur – SSMSI (data.gouv.fr)"
            },
            "chart": {
              "kind": "series",
              "unit": "victimes",
              "items": [
                {
                  "label": "2016",
                  "value": 277268
                },
                {
                  "label": "2024",
                  "value": 449819
                },
                {
                  "label": "2025",
                  "value": 472956
                }
              ]
            }
          },
          {
            "value": "4 fois",
            "label": "plus de risque d’avoir été contrôlés pour les jeunes hommes perçus comme noirs, arabes ou maghrébins que pour le reste de la population. Les contrôles ont progressé dans toute la population : 26 % des personnes disent avoir été contrôlées au moins une fois en cinq ans, contre 16 % en 2016 – France métropolitaine, 18-79 ans",
            "date": "enquête d’octobre 2024 à janvier 2025",
            "source": {
              "title": "Relations police/population : contrôles d’identité et dépôts de plainte – Enquête Accès aux droits, 2e édition, volume 1 (dossier de presse)",
              "url": "https://www.defenseurdesdroits.fr/sites/default/files/2025-07/ddd_EAD-2024_volume-1_relations-police-population_DP.pdf",
              "date": "juin 2025",
              "publisher": "Défenseur des droits"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2016",
                  "value": 16
                },
                {
                  "label": "2024-2025",
                  "value": 26
                }
              ]
            }
          },
          {
            "value": "50 %",
            "label": "des habitants se disent confiants ou rassurés en présence d’un policier ou d’un gendarme sur la voie publique ; 28 % se disent indifférents et 22 % méfiants ou inquiets – France métropolitaine, 18-79 ans",
            "date": "enquête d’octobre 2024 à janvier 2025",
            "source": {
              "title": "Relations police/population : contrôles d’identité et dépôts de plainte – Enquête Accès aux droits, 2e édition, volume 1 (dossier de presse)",
              "url": "https://www.defenseurdesdroits.fr/sites/default/files/2025-07/ddd_EAD-2024_volume-1_relations-police-population_DP.pdf",
              "date": "juin 2025",
              "publisher": "Défenseur des droits"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Confiants ou rassurés",
                  "value": 50
                },
                {
                  "label": "Indifférents",
                  "value": 28
                },
                {
                  "label": "Méfiants ou inquiets",
                  "value": 22
                }
              ]
            }
          },
          {
            "value": "+ 3 872",
            "label": "postes de policiers (équivalents temps plein) à créer de 2023 à 2027, et + 3 540 dans la gendarmerie, selon la trajectoire liée à la loi de programmation du ministère de l’Intérieur relevée par le Sénat (elle ne figure pas dans la loi elle-même). Après un gel des créations de postes en 2025, la police atteindrait son objectif dès 2026 avec le projet de budget 2026 (+ 4 041 postes de 2023 à 2026) ; la gendarmerie resterait à 1 145 postes du sien (+ 2 395 postes)",
            "date": "2023-2027",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Sécurités (Gendarmerie nationale – Police nationale) – Rapport général n° 139 (2025-2026), tome III, annexe 28",
              "url": "https://www.senat.fr/rap/l25-139-328-1/l25-139-328-1_mono.html",
              "date": "24 novembre 2025",
              "publisher": "Sénat – commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "postes",
              "items": [
                {
                  "label": "Police, objectif 2023-2027",
                  "value": 3872
                },
                {
                  "label": "Police, 2023-2026 (projet)",
                  "value": 4041
                },
                {
                  "label": "Gendarmerie, objectif 2023-2027",
                  "value": 3540
                },
                {
                  "label": "Gendarmerie, 2023-2026 (projet)",
                  "value": 2395
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-2-a",
          "text": "Recruter davantage de policiers, de gendarmes, de douaniers et d’enquêteurs, notamment pour des unités spécialisées"
        },
        {
          "id": "securite_justice-2-b",
          "text": "Redéployer sur la voie publique les policiers et les gendarmes aujourd’hui occupés à des tâches administratives"
        },
        {
          "id": "securite_justice-2-c",
          "text": "Recréer une police de proximité, tournée vers la prévention, la médiation et le contact avec les habitants"
        },
        {
          "id": "securite_justice-2-d",
          "text": "Renforcer la protection juridique des agents qui font usage de leur arme, jusqu’à présumer la légitime défense"
        },
        {
          "id": "securite_justice-2-e",
          "text": "Revoir les règles d’usage de la force et confier le contrôle des policiers à une autorité indépendante"
        },
        {
          "id": "securite_justice-2-f",
          "text": "Dissoudre les unités spéciales de police et abroger les lois qui ont étendu les pouvoirs des forces de l’ordre"
        },
        {
          "id": "securite_justice-2-g",
          "text": "Remettre un récépissé à chaque personne contrôlée, pour lutter contre les contrôles d’identité discriminatoires",
          "external": true
        },
        {
          "id": "securite_justice-2-h",
          "text": "Étendre les pouvoirs des polices municipales et multiplier les caméras de surveillance, y compris avec analyse automatique des images"
        }
      ]
    },
    {
      "id": "securite_justice-3",
      "topicId": "securite_justice",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment lutter contre le trafic de drogue ?",
      "context": "Aujourd’hui : l’usage de cannabis est interdit et peut être sanctionné par une amende forfaitaire.",
      "explainer": {
        "summary": "Le cannabis est interdit, et le trafic de drogues rapporte des milliards d’euros aux réseaux criminels. Les approches divergent sur la façon de les affaiblir : accroître la pression sur les consommateurs, instaurer un état d’urgence contre le trafic, renforcer les enquêtes et saisir l’argent du trafic, investir dans les quartiers touchés, légaliser une vente encadrée, ou confier la réflexion à des citoyens tirés au sort.",
        "points": [
          {
            "text": "L’usage de stupéfiants est un délit puni d’un an de prison et de 3 750 € d’amende. Le paiement d’une amende forfaitaire peut mettre fin aux poursuites, y compris en cas de récidive : depuis le 20 août 2026, elle est de 500 € (400 € si elle est payée rapidement, 1 000 € en cas de retard).",
            "source": {
              "title": "Code de la santé publique, article L3421-1 (version issue de la loi n° 2026-798 du 18 août 2026, art. 25)",
              "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006171219/2026-10-03",
              "date": "en vigueur depuis le 20 août 2026",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "La loi contre le narcotrafic, promulguée le 13 juin 2025, a créé un parquet national anti-criminalité organisée (Pnaco), c’est-à-dire un service de procureurs spécialisés. Elle a aussi renforcé la lutte contre le blanchiment, facilité le gel (blocage) des avoirs des trafiquants, permis la fermeture administrative des commerces de façade servant au blanchiment et créé une interdiction de paraître sur les points de vente de drogue.",
            "source": {
              "title": "Proposition de loi visant à sortir la France du piège du narcotrafic – La loi en clair",
              "url": "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-visant-a-sortir-la-france-du-piege-du-narcotrafic.html",
              "date": "juin 2025",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Légaliser, c’est autoriser et encadrer la production et la vente (âge minimal, lieux de vente, taxes). Dépénaliser, c’est seulement supprimer la sanction pénale de l’usage, sans créer de marché légal."
          }
        ],
        "figures": [
          {
            "value": "10,8 %",
            "label": "des 18-64 ans ont consommé du cannabis dans l’année, une proportion stable ; 50,4 % en ont déjà consommé au cours de leur vie. À 17 ans, 29,9 % des jeunes en avaient déjà fumé en 2022 : c’est le niveau le plus bas mesuré depuis 2000, 9 points de moins qu’en 2017 – France",
            "date": "2023 (17 ans : 2022)",
            "source": {
              "title": "Cannabis (résine, herbe, huile, CBD) – synthèse des connaissances",
              "url": "https://www.ofdt.fr/cannabis-resine-herbe-huile-cbd-synthese-des-connaissances-1724",
              "date": "2026",
              "publisher": "Observatoire français des drogues et des tendances addictives (OFDT)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Dans l’année",
                  "value": 10.8
                },
                {
                  "label": "Au moins une fois dans la vie",
                  "value": 50.4
                }
              ]
            }
          },
          {
            "value": "307 206",
            "label": "personnes mises en cause (identifiées comme auteurs présumés) par la police et la gendarmerie pour usage de stupéfiants, amendes forfaitaires délictuelles comprises, contre 290 776 en 2024 et 182 430 en 2016 ; 56 621 pour trafic de stupéfiants, contre 52 325 en 2024 et 40 719 en 2016 – France métropolitaine et départements et régions d’outre-mer",
            "date": "2025",
            "source": {
              "title": "Base nationale des caractéristiques des mis en cause pour des infractions élucidées par la police et la gendarmerie nationales (fichier xlsx)",
              "url": "https://static.data.gouv.fr/resources/principales-caracteristiques-des-victimes-enregistrees-et-des-mis-en-cause-pour-des-infractions-elucidees-par-la-police-et-la-gendarmerie-nationales/20260129-160126/donnee-nat-caract-mec-data.gouv-2025-produit-le-29012026.xlsx",
              "date": "29 janvier 2026",
              "publisher": "Ministère de l’Intérieur – SSMSI (data.gouv.fr)"
            },
            "chart": {
              "kind": "series",
              "unit": "personnes mises en cause",
              "items": [
                {
                  "label": "2016",
                  "value": 182430
                },
                {
                  "label": "2024",
                  "value": 290776
                },
                {
                  "label": "2025",
                  "value": 307206
                }
              ]
            }
          },
          {
            "value": "3,5 Md€",
            "label": "par an au minimum : sommes générées par le trafic de drogues en France, estimation basse avancée par le ministre de l’Économie devant la commission d’enquête du Sénat (audition du 26 mars 2024). Selon l’Office central de lutte contre la criminalité organisée, cité par la même commission, 80 à 90 % des règlements de comptes, des meurtres et des tentatives de meurtre entre délinquants sont liés au trafic de stupéfiants (estimation de décembre 2023)",
            "date": "2024",
            "source": {
              "title": "L’essentiel sur le rapport de la commission d’enquête sur l’impact du narcotrafic en France (rapport n° 588, 2023-2024)",
              "url": "https://www.senat.fr/rap/r23-588-1/r23-588-1-syn.pdf",
              "date": "7 mai 2024",
              "publisher": "Sénat"
            }
          },
          {
            "value": "117 M€",
            "label": "d’avoirs saisis en lien avec le trafic de stupéfiants, soit 14 % de l’ensemble des saisies de la police et de la gendarmerie",
            "date": "2023",
            "source": {
              "title": "L’essentiel sur le rapport de la commission d’enquête sur l’impact du narcotrafic en France (rapport n° 588, 2023-2024)",
              "url": "https://www.senat.fr/rap/r23-588-1/r23-588-1-syn.pdf",
              "date": "7 mai 2024",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "part",
              "value": 14,
              "total": 100,
              "unit": "%",
              "whole": "des saisies de la police et de la gendarmerie"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-3-a",
          "text": "Instaurer un état d’urgence contre le trafic, limité dans le temps et l’espace, avec perquisitions administratives"
        },
        {
          "id": "securite_justice-3-b",
          "text": "Renforcer les enquêteurs spécialisés et saisir l’argent du trafic en luttant contre le blanchiment"
        },
        {
          "id": "securite_justice-3-c",
          "text": "Légaliser et encadrer la vente de cannabis pour priver les réseaux de trafiquants de leurs revenus"
        },
        {
          "id": "securite_justice-3-d",
          "text": "Réunir des citoyens tirés au sort pour formuler des propositions sur la légalisation du cannabis"
        },
        {
          "id": "securite_justice-3-e",
          "text": "Accroître la pression sur les consommateurs, avec des amendes réellement recouvrées et des contrôles accrus"
        },
        {
          "id": "securite_justice-3-f",
          "text": "Investir durablement dans les quartiers touchés, par l’aménagement urbain, les services publics et l’emploi des jeunes"
        }
      ]
    },
    {
      "id": "securite_justice-4",
      "topicId": "securite_justice",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment répondre aux violences, notamment sexuelles, commises contre des enfants ?",
      "context": "Aujourd’hui : la peine la plus lourde est la réclusion à perpétuité ; la Constitution interdit la peine de mort depuis 2007.",
      "explainer": {
        "summary": "Face aux violences, notamment sexuelles, commises contre des enfants, les approches divergent : durcir les peines, jusqu’au rétablissement de la peine de mort pour les meurtres d’enfants, mieux contrôler les adultes à leur contact, traiter plus vite les plaintes, ou miser d’abord sur la protection de l’enfance et la prévention. Le débat porte autant sur la sévérité des peines que sur la capacité de la justice à établir les faits.",
        "points": [
          {
            "text": "Au-delà de la Constitution, deux traités internationaux abolissent la peine de mort. En 2005, saisi avant leur ratification, le Conseil constitutionnel a jugé que le protocole n° 13 à la Convention européenne des droits de l’homme peut être dénoncé. Le deuxième protocole au Pacte international relatif aux droits civils et politiques, lui, ne peut pas l’être et « lierait irrévocablement la France » : sa ratification exigeait donc une révision de la Constitution.",
            "source": {
              "title": "Décision n° 2005-524/525 DC du 13 octobre 2005 (engagements internationaux relatifs à l’abolition de la peine de mort)",
              "url": "https://www.conseil-constitutionnel.fr/decision/2005/2005524_525DC.htm",
              "date": "13 octobre 2005",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Une forme de « perpétuité réelle » existe déjà pour certains crimes, dont le meurtre d’un mineur de moins de 15 ans précédé ou accompagné d’un viol, de tortures ou d’actes de barbarie. La cour d’assises qui prononce la réclusion à perpétuité peut alors exclure tout aménagement de peine, comme la libération conditionnelle. Le tribunal de l’application des peines ne peut ensuite en accorder un qu’après au moins trente ans de détention et une expertise de trois experts médicaux sur la dangerosité du condamné (article 720-4 du code de procédure pénale).",
            "source": {
              "title": "Code pénal, article 221-4",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049531896",
              "date": "version en vigueur depuis le 12 mai 2024",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Les professionnels et bénévoles de la protection de l’enfance, de l’accueil du jeune enfant (crèches, assistants maternels et familiaux) et des structures pour enfants handicapés doivent présenter une « attestation d’honorabilité ». Elle garantit qu’aucune condamnation définitive, inscrite au casier judiciaire ou au fichier judiciaire des auteurs d’infractions sexuelles ou violentes (FIJAISV), ne leur interdit d’intervenir auprès de mineurs.",
            "source": {
              "title": "Qu’est-ce que l’attestation d’honorabilité ?",
              "url": "https://honorabilite.social.gouv.fr/qu-est-ce-que-l-attestation-d-honorabilite",
              "date": "page consultée le 7 octobre 2026",
              "publisher": "Ministères sociaux"
            }
          }
        ],
        "figures": [
          {
            "value": "178 300",
            "label": "personnes mises en cause pour viol ou agression sexuelle sur mineur dans les affaires traitées par les parquets de 2017 à 2024 : 61 600 poursuivables et 116 700 non poursuivables, dont l’affaire a été classée sans suite, trois fois sur quatre pour « infraction insuffisamment caractérisée » (preuves insuffisantes ou éléments de l’infraction non établis) – France",
            "date": "2017-2024",
            "source": {
              "title": "Viol et agression sexuelle sur mineur, quatre personnes mises en cause sur dix sont mineures au moment des faits – Infostat Justice n° 205",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-03/Infostat_Justice_205_corr.pdf",
              "date": "novembre 2025 (version corrigée, mars 2026)",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "compare",
              "unit": "personnes",
              "items": [
                {
                  "label": "Poursuivables",
                  "value": 61600
                },
                {
                  "label": "Non poursuivables",
                  "value": 116700
                }
              ]
            }
          },
          {
            "value": "491",
            "label": "condamnations de personnes majeures pour viol sur mineur, et 2 074 pour agression sexuelle sur mineur (données provisoires) ; en chiffres arrondis, 490 contre 340 en 2017 pour viol, 2 100 contre 1 800 en 2017 pour agression sexuelle – France",
            "date": "2023",
            "source": {
              "title": "Viol et agression sexuelle sur mineur, quatre personnes mises en cause sur dix sont mineures au moment des faits – Infostat Justice n° 205",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-03/Infostat_Justice_205_corr.pdf",
              "date": "novembre 2025 (version corrigée, mars 2026)",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "series",
              "unit": "condamnations",
              "items": [
                {
                  "label": "2017",
                  "value": 340
                },
                {
                  "label": "2023",
                  "value": 490
                }
              ]
            }
          },
          {
            "value": "39,4 %",
            "label": "des personnes mises en cause pour viol ou agression sexuelle sur mineur étaient elles-mêmes mineures au moment des faits, soit en moyenne 8 800 mineurs par an (sur 178 300 personnes mises en cause en huit ans) – France",
            "date": "2017-2024",
            "source": {
              "title": "Viol et agression sexuelle sur mineur, quatre personnes mises en cause sur dix sont mineures au moment des faits – Infostat Justice n° 205",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-03/Infostat_Justice_205_corr.pdf",
              "date": "novembre 2025 (version corrigée, mars 2026)",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "part",
              "value": 39.4,
              "total": 100,
              "unit": "%",
              "whole": "des personnes mises en cause"
            }
          },
          {
            "value": "30 ans",
            "label": "délai de prescription d’un viol, ou de certains autres crimes graves, commis sur un mineur, compté à partir de sa majorité ; pour un viol, ce délai est prolongé si l’auteur commet, avant son expiration, un nouveau viol, une agression ou une atteinte sexuelle sur un autre mineur",
            "date": "en vigueur depuis le 23 avril 2021",
            "source": {
              "title": "Code de procédure pénale, article 7",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043409351",
              "date": "version en vigueur depuis le 23 avril 2021",
              "publisher": "Légifrance"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-4-a",
          "text": "Soumettre à référendum le rétablissement de la peine de mort pour les auteurs de meurtres d’enfants"
        },
        {
          "id": "securite_justice-4-b",
          "text": "Alourdir les peines par la perpétuité réelle, l’imprescriptibilité ou une castration chimique imposée aux plus dangereux"
        },
        {
          "id": "securite_justice-4-c",
          "text": "Ficher les auteurs et contrôler les antécédents de tous les adultes qui travaillent au contact d’enfants"
        },
        {
          "id": "securite_justice-4-d",
          "text": "Traiter sans délai toutes les plaintes, grâce à des enquêteurs et des magistrats spécialisés supplémentaires"
        },
        {
          "id": "securite_justice-4-e",
          "text": "Donner la priorité à la protection de l’enfance et à la prévention plutôt qu’à l’alourdissement des peines"
        },
        {
          "id": "securite_justice-4-f",
          "text": "Installer des caméras de surveillance dans les écoles, les crèches et les lieux d’accueil périscolaire"
        }
      ]
    },
    {
      "id": "securite_justice-5",
      "topicId": "securite_justice",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment répondre à la délinquance des mineurs ?",
      "context": "Aujourd’hui : la majorité pénale est fixée à 18 ans et la peine encourue par un mineur est en principe réduite de moitié.",
      "explainer": {
        "summary": "La justice des mineurs repose sur des juridictions spécialisées, une priorité donnée à l’éducation et des peines atténuées selon l’âge. Les uns veulent juger plus vite et plus sévèrement les mineurs les plus âgés, voire comme des adultes, responsabiliser davantage les parents ou développer le placement en structure fermée ; les autres privilégient la prévention, l’éducation et l’insertion.",
        "points": [
          {
            "text": "En juin 2025, le Conseil constitutionnel a censuré deux mesures : le jugement en comparution immédiate des mineurs de 16 ans et plus, et la fin du caractère exceptionnel de la suppression, après 16 ans, de l’atténuation de peine liée à l’âge. Il s’appuie sur un principe constitutionnel propre aux mineurs : une responsabilité pénale atténuée selon l’âge et la recherche de leur « relèvement éducatif et moral ». Ce principe n’exclut ni les sanctions ni, au-delà de 13 ans, la détention. Le Conseil a validé l’alourdissement des peines des parents qui se soustraient à leurs obligations légales lorsque cela conduit leur enfant à commettre certaines infractions.",
            "source": {
              "title": "Décision n° 2025-886 DC du 19 juin 2025 (loi visant à renforcer l’autorité de la justice à l’égard des mineurs délinquants et de leurs parents)",
              "url": "https://www.conseil-constitutionnel.fr/decision/2025/2025886DC.htm",
              "date": "19 juin 2025",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Depuis l’entrée en vigueur du code de la justice pénale des mineurs, le 30 septembre 2021, un mineur est le plus souvent jugé en deux temps : d’abord sur sa culpabilité, puis sur la sanction, à l’issue d’une « période de mise à l’épreuve éducative ». En 2025, 27 113 mineurs ont été jugés en audience d’examen de la culpabilité et 14 434 en audience unique (culpabilité et sanction ensemble), selon des données provisoires.",
            "source": {
              "title": "Fiche de synthèse annuelle 2025 sur les indicateurs statistiques pénaux",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-04/Indicateurs_statistiques_penaux_2025.pdf",
              "date": "avril 2026",
              "publisher": "Ministère de la Justice – SSER"
            }
          },
          {
            "text": "Depuis le 1er septembre 2026, les centres éducatifs fermés (créés par la loi du 9 septembre 2002) et les unités éducatives d’hébergement collectif de la protection judiciaire de la jeunesse sont remplacés par des « unités judiciaires à priorité éducative ». Elles accueillent des jeunes de 13 à 21 ans placés par décision judiciaire à la suite d’une infraction : 85 ont ouvert à cette date, 123 sont prévues d’ici 2028.",
            "source": {
              "title": "Unités judiciaires à priorité éducative – brochure de présentation de la réforme",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-09/brochure_ouverture_ujpe.pdf",
              "date": "septembre 2026",
              "publisher": "Ministère de la Justice – Protection judiciaire de la jeunesse"
            }
          }
        ],
        "figures": [
          {
            "value": "9,0 %",
            "label": "de mineurs parmi les 2 234 400 personnes mises en cause dans les affaires reçues par les parquets (données provisoires)",
            "date": "2025",
            "source": {
              "title": "Fiche de synthèse annuelle 2025 sur les indicateurs statistiques pénaux",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-04/Indicateurs_statistiques_penaux_2025.pdf",
              "date": "avril 2026",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "part",
              "value": 9,
              "total": 100,
              "unit": "%",
              "whole": "des personnes mises en cause"
            }
          },
          {
            "value": "110 500",
            "label": "mineurs mis en cause dans des affaires poursuivables traitées par les parquets : 44 % ont exécuté une mesure alternative aux poursuites, 44 % ont été poursuivis devant une juridiction pour mineurs ou un juge d’instruction, et 12 % ont vu leur affaire classée pour inopportunité (données provisoires) – France",
            "date": "2025",
            "source": {
              "title": "Références statistiques Justice 2026 – fiche 17.2 « Les mineurs poursuivables »",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-07/RSJ2026%2017_2.pdf",
              "date": "juillet 2026",
              "publisher": "Ministère de la Justice – SSER"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Mesure alternative",
                  "value": 44
                },
                {
                  "label": "Poursuites devant un juge",
                  "value": 44
                },
                {
                  "label": "Classement pour inopportunité",
                  "value": 12
                }
              ]
            }
          },
          {
            "value": "8,2 mois",
            "label": "délai moyen entre l’arrivée de l’affaire au parquet et le jugement par une juridiction pour mineurs ; ce délai est inférieur à trois mois pour 41,1 % des mineurs (données provisoires)",
            "date": "2025",
            "source": {
              "title": "Fiche de synthèse annuelle 2025 sur les indicateurs statistiques pénaux",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-04/Indicateurs_statistiques_penaux_2025.pdf",
              "date": "avril 2026",
              "publisher": "Ministère de la Justice – SSER"
            }
          },
          {
            "value": "804",
            "label": "mineurs détenus, contre 829 un an plus tôt ; ils représentent 0,9 % des détenus, contre 1,0 % – France entière (métropole et outre-mer)",
            "date": "1er septembre 2026",
            "source": {
              "title": "Mesure de l’incarcération – Indicateurs clés au 1er septembre 2026",
              "url": "https://www.justice.gouv.fr/sites/default/files/2026-10/mesure_mensuelle_01092026.pdf",
              "date": "données au 1er septembre 2026",
              "publisher": "Ministère de la Justice – Direction de l’administration pénitentiaire"
            },
            "chart": {
              "kind": "series",
              "unit": "mineurs détenus",
              "items": [
                {
                  "label": "Sept. 2025",
                  "value": 829
                },
                {
                  "label": "Sept. 2026",
                  "value": 804
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-5-a",
          "text": "Abaisser l’âge de la majorité pénale afin de juger les mineurs les plus âgés comme des adultes"
        },
        {
          "id": "securite_justice-5-b",
          "text": "Juger les mineurs plus vite et plus sévèrement, sans atténuation automatique de la peine liée à leur âge"
        },
        {
          "id": "securite_justice-5-c",
          "text": "Rendre les parents responsables, en leur faisant payer les dégâts de leurs enfants ou en suspendant certaines aides"
        },
        {
          "id": "securite_justice-5-d",
          "text": "Placer les jeunes délinquants dans des internats ou des centres fermés, avec travail, formation et discipline"
        },
        {
          "id": "securite_justice-5-e",
          "text": "Donner la priorité à l’éducation, à la prévention et à l’insertion des jeunes, avec des dispositifs de seconde chance"
        }
      ]
    },
    {
      "id": "securite_justice-6",
      "topicId": "securite_justice",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles règles pour l’indépendance et la responsabilité des magistrats ?",
      "context": "Aujourd’hui : le Conseil supérieur de la magistrature sanctionne les magistrats, et depuis 2013 le ministre de la Justice ne peut plus donner d’instructions aux procureurs dans une affaire précise.",
      "explainer": {
        "summary": "La question met en balance deux exigences : que les magistrats, juges comme procureurs, décident sans pression politique, et que la justice rende des comptes, qu’il s’agisse des fautes des magistrats ou de la conduite de la politique pénale. Elle touche à la nomination des procureurs, aux instructions du gouvernement, à la discipline, au syndicalisme des magistrats et à l’application immédiate des peines d’inéligibilité.",
        "points": [
          {
            "text": "Le Conseil supérieur de la magistrature (CSM) réunit des magistrats, un conseiller d’État, un avocat et six personnalités extérieures, désignées par le président de la République et les présidents des deux assemblées. Les juges sont nommés sur sa proposition ou avec son accord (« avis conforme »), et il statue sur leur discipline. Pour les procureurs, il donne un avis, sur les nominations comme sur les sanctions. Un justiciable peut le saisir, dans les conditions fixées par une loi organique.",
            "source": {
              "title": "Constitution du 4 octobre 1958, article 65",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "texte en vigueur, à jour de la révision du 8 mars 2024",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Le statut des magistrats leur garantit le droit syndical. Il interdit au corps judiciaire « toute délibération politique », aux magistrats toute démonstration politique incompatible avec leur devoir de réserve, ainsi que toute action concertée de nature à arrêter ou entraver le fonctionnement des juridictions.",
            "source": {
              "title": "Ordonnance n° 58-1270 du 22 décembre 1958 portant loi organique relative au statut de la magistrature, articles 10 et 10-1",
              "url": "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000339259",
              "date": "version en vigueur",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Le juge pénal peut assortir une peine d’inéligibilité de l’« exécution provisoire » : elle s’applique dès le jugement, même en cas d’appel, et un élu municipal condamné est alors aussitôt déclaré démissionnaire d’office par le préfet. En mars 2025, le Conseil constitutionnel a jugé ce mécanisme conforme à la Constitution, à condition que le juge apprécie si l’atteinte à l’exercice du mandat en cours et à « la liberté de l’électeur » est proportionnée.",
            "source": {
              "title": "Décision n° 2025-1129 QPC du 28 mars 2025",
              "url": "https://www.conseil-constitutionnel.fr/decision/2025/20251129QPC.htm",
              "date": "28 mars 2025",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "3,2",
            "label": "procureurs pour 100 000 habitants en France, contre une médiane européenne de 11,2 ; pour les juges professionnels : 11,3, contre une médiane de 17,6 (données de la Commission européenne pour l’efficacité de la justice du Conseil de l’Europe, reprises par le Sénat)",
            "date": "2022",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Justice – Rapport général n° 139 (2025-2026), tome III, annexe 17 (d’après CEPEJ, rapport d’évaluation 2024)",
              "url": "https://www.senat.fr/rap/l25-139-317/l25-139-317_mono.html",
              "date": "24 novembre 2025",
              "publisher": "Sénat – commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "pour 100 000 habitants",
              "items": [
                {
                  "label": "Procureurs – France",
                  "value": 3.2
                },
                {
                  "label": "Procureurs – médiane européenne",
                  "value": 11.2
                },
                {
                  "label": "Juges – France",
                  "value": 11.3
                },
                {
                  "label": "Juges – médiane européenne",
                  "value": 17.6
                }
              ]
            }
          },
          {
            "value": "13",
            "label": "avis défavorables du CSM sur des projets de nomination de procureurs, contre 514 favorables (pour les juges : 13 avis non conformes, contre 1 111 conformes) ; l’avis sur les procureurs ne lie pas le ministre, mais ses avis défavorables ont été systématiquement respectés depuis 2008 – France",
            "date": "2025",
            "source": {
              "title": "Rapport d’activité 2025",
              "url": "https://www.conseil-superieur-magistrature.fr/sites/default/files/pdf/CSM_RA_2025_Web_compress%C3%A9_0.pdf",
              "date": "2026",
              "publisher": "Conseil supérieur de la magistrature"
            },
            "chart": {
              "kind": "compare",
              "unit": "avis",
              "items": [
                {
                  "label": "Avis défavorables",
                  "value": 13
                },
                {
                  "label": "Avis favorables",
                  "value": 514
                }
              ]
            }
          },
          {
            "value": "13",
            "label": "procédures disciplinaires engagées devant le CSM contre des magistrats (8 juges, 5 procureurs), contre 9 en 2024 et 6 en 2023 – France",
            "date": "2025",
            "source": {
              "title": "Rapport d’activité 2025",
              "url": "https://www.conseil-superieur-magistrature.fr/sites/default/files/pdf/CSM_RA_2025_Web_compress%C3%A9_0.pdf",
              "date": "2026",
              "publisher": "Conseil supérieur de la magistrature"
            },
            "chart": {
              "kind": "series",
              "unit": "procédures",
              "items": [
                {
                  "label": "2023",
                  "value": 6
                },
                {
                  "label": "2024",
                  "value": 9
                },
                {
                  "label": "2025",
                  "value": 13
                }
              ]
            }
          },
          {
            "value": "254",
            "label": "plaintes de justiciables enregistrées par le CSM ; sur 391 décisions rendues, 303 ont déclaré la plainte manifestement irrecevable, 87 l’ont rejetée et 1 a renvoyé le magistrat en audience disciplinaire – France",
            "date": "2025",
            "source": {
              "title": "Rapport d’activité 2025",
              "url": "https://www.conseil-superieur-magistrature.fr/sites/default/files/pdf/CSM_RA_2025_Web_compress%C3%A9_0.pdf",
              "date": "2026",
              "publisher": "Conseil supérieur de la magistrature"
            },
            "chart": {
              "kind": "compare",
              "unit": "décisions",
              "items": [
                {
                  "label": "Manifestement irrecevable",
                  "value": 303
                },
                {
                  "label": "Plainte rejetée",
                  "value": 87
                },
                {
                  "label": "Renvoi en audience disciplinaire",
                  "value": 1
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-6-a",
          "text": "Confier la discipline des magistrats à une cour comprenant des citoyens tirés au sort, saisissable par les justiciables"
        },
        {
          "id": "securite_justice-6-b",
          "text": "Permettre de nouveau au ministre de la Justice de donner des instructions aux procureurs dans une affaire précise"
        },
        {
          "id": "securite_justice-6-c",
          "text": "Restreindre le syndicalisme des magistrats, par la dissolution d’un syndicat ou le passage à des associations"
        },
        {
          "id": "securite_justice-6-d",
          "text": "Interdire toute instruction du gouvernement aux procureurs et faire voter la politique pénale par le Parlement"
        },
        {
          "id": "securite_justice-6-e",
          "text": "Garantir l’indépendance et les moyens de la justice, et protéger les magistrats contre les pressions"
        },
        {
          "id": "securite_justice-6-f",
          "text": "Faire nommer les procureurs sur avis conforme du Conseil supérieur de la magistrature, comme les juges",
          "external": true
        },
        {
          "id": "securite_justice-6-g",
          "text": "Supprimer l’exécution immédiate des peines d’inéligibilité, pour qu’un élu condamné puisse d’abord faire appel"
        }
      ]
    },
    {
      "id": "immigration-1",
      "topicId": "immigration",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quelle orientation donner à la politique d’immigration ?",
      "context": "Aujourd’hui : les premiers titres de séjour sont accordés surtout pour des études, des raisons familiales, le travail ou une protection humanitaire.",
      "explainer": {
        "summary": "Les approches divergent d’abord sur le niveau de l’immigration : la réduire très fortement, voire organiser le départ d’une partie des étrangers déjà installés ; réduire les entrées en choisissant les étrangers admis selon l’emploi, la langue et l’intégration ; la maîtriser sans objectif chiffré, en conciliant droit d’asile et lutte contre l’immigration irrégulière ; ou élargir les voies d’entrée légales, jusqu’à la liberté d’installation. Elles divergent aussi sur la place à donner à chaque motif d’entrée (études, famille, travail, asile), aux régularisations et aux éloignements.",
        "points": [
          {
            "text": "La loi du 26 janvier 2024 a ouvert une voie de régularisation pour les « métiers en tension », où les employeurs peinent à recruter (liste officielle par métier et par zone). Il faut y avoir travaillé 12 mois sur les 24 derniers, y occuper un emploi et résider en France depuis au moins 3 ans. Le titre est accordé « à titre exceptionnel » : le préfet n’est pas tenu de le délivrer. La loi a prévu ce dispositif jusqu’au 31 décembre 2026.",
            "source": {
              "title": "Article L435-4 du Code de l’entrée et du séjour des étrangers et du droit d’asile",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049044146",
              "date": "2024-01-28",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Le pacte européen sur la migration et l’asile, adopté en mai 2024, s’applique pour l’essentiel depuis le 12 juin 2026. Les personnes qui tentent d’entrer irrégulièrement dans l’Union, ou y sont débarquées après un sauvetage en mer, passent par un « filtrage » (contrôles d’identité, de santé et de sécurité). Une procédure d’asile à la frontière, de douze semaines au plus, est obligatoire notamment pour les nationalités dont le taux de protection dans l’Union est inférieur à 20 %. Le pacte change aussi les règles qui désignent le pays responsable d’une demande et organise une solidarité entre États : relocalisation de demandeurs, contribution financière ou autre soutien.",
            "source": {
              "title": "Projet de loi habilitant le Gouvernement à prendre, par ordonnances, les adaptations nécessaires par l’entrée en application des règlements (UE) n° 2024/1347 à 2024/1359 – Rapport n° 617 (2025-2026)",
              "url": "https://www.senat.fr/rap/l25-617/l25-617_mono.html",
              "date": "2026-05-13",
              "publisher": "Sénat, commission des lois"
            }
          },
          {
            "text": "En janvier 2024, le Conseil constitutionnel a censuré la disposition qui prévoyait un débat annuel au Parlement et la fixation par celui-ci, pour trois ans, du nombre d’étrangers admis à s’installer durablement en France, par catégorie de séjour, hors asile. Motif : aucune exigence constitutionnelle ne permet à une loi d’imposer au Parlement un tel débat, ni de fixer lui-même des objectifs chiffrés en matière d’immigration. Cela pourrait empiéter sur les prérogatives du Gouvernement et des assemblées pour fixer l’ordre du jour.",
            "source": {
              "title": "Décision n° 2023-863 DC du 25 janvier 2024 – Communiqué de presse",
              "url": "https://www.conseil-constitutionnel.fr/actualites/communique/decision-n-2023-863-dc-du-25-janvier-2024-communique-de-presse",
              "date": "2024-01-25",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "377 462",
            "label": "Premiers titres de séjour délivrés à des ressortissants de pays tiers (France), contre 345 587 en 2024 (+ 9,2 %). Selon le ministère, cette hausse est « totalement portée » par les titres pour motif humanitaire (+ 56,8 %). En 2025, 31,0 % ont été délivrés pour études, 24,1 % pour motif familial, 23,3 % pour motif humanitaire, 13,5 % pour motif économique et 8,2 % pour des motifs divers.",
            "date": "2025 (données provisoires)",
            "source": {
              "title": "Les titres de séjour en 2025 : les protections subsidiaires ont plus que doublé",
              "url": "https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "series",
              "unit": "premiers titres",
              "items": [
                {
                  "label": "2024",
                  "value": 345587
                },
                {
                  "label": "2025",
                  "value": 377462
                }
              ]
            }
          },
          {
            "value": "27 819",
            "label": "Régularisations (admissions exceptionnelles au séjour et titres « liens personnels et familiaux »), contre 31 252 en 2024 (– 11,0 %), dont 9 696 au titre du travail (France). Le ministère relie cette baisse à la loi de 2024 et à une circulaire de janvier 2025 qui recentre la régularisation sur des situations « strictement exceptionnelles ».",
            "date": "2025 (données provisoires)",
            "source": {
              "title": "Les titres de séjour en 2025 : les protections subsidiaires ont plus que doublé",
              "url": "https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "series",
              "unit": "régularisations",
              "items": [
                {
                  "label": "2024",
                  "value": 31252
                },
                {
                  "label": "2025",
                  "value": 27819
                }
              ]
            }
          },
          {
            "value": "4 470 970",
            "label": "Titres de séjour et documents provisoires de séjour valides détenus par des ressortissants de pays tiers (hors Union européenne), contre 4 331 326 un an plus tôt (+ 3,2 %) et 3 723 986 fin 2021. Les cartes de résident et de résident de longue durée en représentent 2 022 020. Rapportée à la population majeure, selon la méthode du ministère, cette présence étrangère régulière est en moyenne de 8,1 % (France). Les étrangers sans titre de séjour n’y figurent pas.",
            "date": "31 décembre 2025",
            "source": {
              "title": "Les titres de séjour en 2025 : les protections subsidiaires ont plus que doublé",
              "url": "https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "series",
              "unit": "titres et documents valides",
              "items": [
                {
                  "label": "Fin 2021",
                  "value": 3723986
                },
                {
                  "label": "Fin 2024",
                  "value": 4331326
                },
                {
                  "label": "Fin 2025",
                  "value": 4470970
                }
              ]
            }
          },
          {
            "value": "23 549",
            "label": "Éloignements d’étrangers en situation irrégulière, contre 21 196 en 2024 (+ 11,1 %) : 14 133 éloignements forcés, 4 564 aidés et 4 852 spontanés (France métropolitaine, majeurs). S’y ajoutent 24 512 éloignements depuis l’outre-mer, à près de 90 % depuis Mayotte.",
            "date": "2025",
            "source": {
              "title": "Les éloignements d’étrangers en situation irrégulière en 2025 : une dynamique ascendante",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/eloignements-detrangers-en-situation-irreguliere-en-2025-dynamique-ascendante",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "series",
              "unit": "éloignements",
              "items": [
                {
                  "label": "2024",
                  "value": 21196
                },
                {
                  "label": "2025",
                  "value": 23549
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-1-a",
          "text": "Faire baisser le nombre d’étrangers présents en organisant le départ d’une partie de ceux déjà installés"
        },
        {
          "id": "immigration-1-b",
          "text": "Réduire très fortement le nombre d’étrangers admis chaque année à s’installer en France"
        },
        {
          "id": "immigration-1-c",
          "text": "Réduire les entrées et choisir les étrangers admis selon l’emploi, la langue et l’intégration"
        },
        {
          "id": "immigration-1-d",
          "text": "Maîtriser l’immigration en conciliant droit d’asile, intégration et fermeté contre l’immigration irrégulière, sans objectif chiffré"
        },
        {
          "id": "immigration-1-e",
          "text": "Élargir les voies d’entrée légales en facilitant les visas et en allongeant la durée des titres de séjour"
        },
        {
          "id": "immigration-1-f",
          "text": "Instaurer la liberté de circulation et d’installation pour toutes les personnes migrantes"
        }
      ]
    },
    {
      "id": "immigration-2",
      "topicId": "immigration",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quel rôle donner à l’Union européenne dans le contrôle des frontières et l’asile ?",
      "context": "Aujourd’hui : la France appartient à l’espace Schengen de libre circulation et applique les règles européennes sur l’asile, réformées par un pacte entré en application en 2026.",
      "explainer": {
        "summary": "L’Union européenne fixe des règles communes pour ses frontières extérieures et pour l’asile, et l’espace Schengen supprime en principe les contrôles aux frontières entre pays membres. Le débat porte à la fois sur le niveau de décision (règles communes ou maîtrise nationale) et sur le contenu de ces règles : répartition des demandeurs d’asile, procédures à la frontière, rétention et expulsions.",
        "points": [
          {
            "text": "Dans l’espace Schengen, il n’y a en principe pas de contrôle aux frontières entre pays membres. Après les attentats de novembre 2015, la France a rétabli ces contrôles par dérogation et les a reconduits tous les six mois sans interruption. Le règlement Schengen, modifié en 2024, limite désormais leur prolongation à trois ans au plus. En mars 2025, le Conseil d’État a jugé conforme à ce règlement la décision du 4 octobre 2024 qui les rétablit pour six mois : c’est selon lui un premier rétablissement au titre des nouvelles règles, et non la prolongation des contrôles engagés en 2015.",
            "source": {
              "title": "Le rétablissement du contrôle aux frontières intérieures est conforme au nouveau règlement « Schengen » (décision n° 499702)",
              "url": "https://www.conseil-etat.fr/actualites/le-retablissement-du-controle-aux-frontieres-interieures-est-conforme-au-nouveau-reglement-schengen",
              "date": "2025-03-07",
              "publisher": "Conseil d’État"
            }
          },
          {
            "text": "Le pacte européen sur la migration et l’asile, adopté en 2024, s’applique depuis le 12 juin 2026, et depuis le 1er juillet 2026 pour la réforme des règles « Dublin ». Aux frontières extérieures, un « filtrage » de 7 jours au plus contrôle l’identité, la santé et la sécurité des personnes ; elles ne sont pas autorisées à entrer sur le territoire et peuvent être retenues. Des procédures d’asile et de retour à la frontière, de 12 semaines chacune au plus, sont obligatoires en cas de risque pour l’ordre public ou de fraude, ou si le demandeur vient d’un pays dont les ressortissants obtiennent une protection dans moins de 20 % des cas. Les règles « Dublin » confient toujours en principe la demande au pays de première entrée. Pour aider les pays sous pression migratoire, un mécanisme de solidarité obligatoire laisse aux autres États le choix : accueillir des demandeurs (« relocalisations »), verser une contribution financière ou apporter un autre soutien. Tant que la France n’a pas adapté son droit, ses dispositions contraires au pacte doivent être écartées.",
            "source": {
              "title": "Observations sur le projet de loi n° 526 (2025-2026), rapport d’information n° 606 (2025-2026) de la commission des affaires européennes",
              "url": "https://www.senat.fr/rap/r25-606/r25-606_mono.html",
              "date": "2026-05-07",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Selon le Conseil constitutionnel, la Constitution impose de transposer les directives européennes et de respecter les règlements européens ; les juges administratifs et judiciaires vérifient que les lois sont compatibles avec ces engagements. Mais dans l’ordre juridique français, la Constitution se situe « au sommet de l’ordre juridique interne » : la primauté du droit de l’Union ne vaut pas à son égard. Une loi qui transpose une directive ou adapte le droit français à un règlement ne peut aller contre un principe « inhérent à l’identité constitutionnelle de la France », sauf accord du constituant (le pouvoir qui révise la Constitution). Pour ratifier un engagement européen contraire à la Constitution, il faut d’abord réviser celle-ci.",
            "source": {
              "title": "Quel rapport à l’Europe fixe la Constitution ?",
              "url": "https://www.conseil-constitutionnel.fr/la-constitution/quel-rapport-a-l-europe-fixe-la-constitution",
              "date": "2020-02-11",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "116 400",
            "label": "personnes ayant demandé l’asile pour la première fois en France, soit 17 % du total de l’Union européenne (669 400, contre 912 400 en 2024). La France est derrière l’Espagne (141 000) et l’Italie (126 600), et devant l’Allemagne (113 200). Données arrondies à la centaine.",
            "date": "2025",
            "source": {
              "title": "27 % drop in first-time asylum applications in 2025",
              "url": "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260325-2",
              "date": "2026-03-25",
              "publisher": "Eurostat (Commission européenne)"
            },
            "chart": {
              "kind": "compare",
              "unit": "personnes",
              "items": [
                {
                  "label": "Espagne",
                  "value": 141000
                },
                {
                  "label": "Italie",
                  "value": 126600
                },
                {
                  "label": "France",
                  "value": 116400
                },
                {
                  "label": "Allemagne",
                  "value": 113200
                }
              ]
            }
          },
          {
            "value": "près de 178 000",
            "label": "franchissements irréguliers détectés aux frontières extérieures de l’UE, en baisse de 26 % sur un an : moins de la moitié du total de 2023. Ce sont des détections : une même personne peut être comptée plusieurs fois (données provisoires).",
            "date": "2025",
            "source": {
              "title": "Frontex: Irregular border crossings down 26 % in 2025, Europe must stay prepared",
              "url": "https://www.frontex.europa.eu/media-centre/news/news-release/frontex-irregular-border-crossings-down-26-in-2025-europe-must-stay-prepared-lyKpVb",
              "date": "2026-01-15",
              "publisher": "Frontex (agence de l’Union européenne)"
            }
          },
          {
            "value": "9 329",
            "label": "premières demandes d’asile enregistrées en France en 2025 en procédure « Dublin » (un autre État européen étant jugé responsable), puis examinées par la France la même année, notamment faute de transfert dans les délais. S’y ajoutent 10 799 demandes Dublin d’années antérieures passées sous la responsabilité de la France en 2025 (8 978 en 2024). Fin 2025, 14 989 premières demandes de l’année restaient en procédure Dublin, contre 20 072 fin 2024 (France).",
            "date": "2025",
            "source": {
              "title": "Les demandes d’asile en 2025 : une procédure sur deux aboutit à une protection",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/demandes-dasile-en-2025-procedure-sur-deux-aboutit-a-protection",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "compare",
              "unit": "demandes",
              "items": [
                {
                  "label": "Examinées par la France",
                  "value": 9329
                },
                {
                  "label": "Encore en Dublin fin 2025",
                  "value": 14989
                }
              ]
            }
          },
          {
            "value": "3 361",
            "label": "relocalisations de demandeurs d’asile que la France s’est engagée à assumer pour 2026 dans la réserve européenne de solidarité, fixée à 21 000 relocalisations et 420 millions d’euros de contributions financières. Selon le ministre de l’Intérieur, cité par le Sénat, la France y fera compter des demandes d’asile qu’elle traite déjà à la place de l’Italie et de la Grèce.",
            "date": "2026",
            "source": {
              "title": "Observations sur le projet de loi n° 526 (2025-2026), rapport d’information n° 606 (2025-2026) de la commission des affaires européennes",
              "url": "https://www.senat.fr/rap/r25-606/r25-606_mono.html",
              "date": "2026-05-07",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "part",
              "value": 3361,
              "total": 21000,
              "whole": "relocalisations de la réserve européenne"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-2-a",
          "text": "Sortir de l’espace Schengen pour rétablir des contrôles permanents aux frontières nationales"
        },
        {
          "id": "immigration-2-b",
          "text": "Rester dans l’Union européenne en faisant primer le droit national sur ses règles d’asile et de circulation"
        },
        {
          "id": "immigration-2-c",
          "text": "Renforcer les règles communes de l’Union sur les frontières extérieures, l’asile et les retours"
        },
        {
          "id": "immigration-2-d",
          "text": "Répartir les demandeurs d’asile entre pays européens au lieu de confier leur dossier au pays d’arrivée"
        },
        {
          "id": "immigration-2-e",
          "text": "Abandonner le pacte européen sur la migration et l’asile et ses règles de rétention et d’expulsion"
        }
      ]
    },
    {
      "id": "immigration-3",
      "topicId": "immigration",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Que faire des étrangers en situation irrégulière présents en France ?",
      "context": "Aujourd’hui : les préfectures régularisent au cas par cas, selon des critères resserrés en 2025, et une minorité des obligations de quitter le territoire français (OQTF) est exécutée.",
      "explainer": {
        "summary": "Le nombre d’étrangers vivant en France sans titre de séjour est mal connu. Les approches vont de la régularisation de tous à l’expulsion sans délai, en passant par la régularisation des travailleurs, au cas par cas ou à grande échelle, et par une exécution plus fréquente des obligations de quitter le territoire.",
        "points": [
          {
            "text": "La régularisation par le travail se fait au cas par cas, pour des situations exceptionnelles ou humanitaires. En général, la préfecture tient compte de l’insertion, dont la maîtrise du français, et peut exiger 7 ans de présence en France. Le demandeur ne doit pas menacer l’ordre public ni être visé par une obligation de quitter le territoire français (OQTF) non exécutée ; il doit s’engager à respecter les principes de la République. Pour un emploi dans un métier « en tension » (où les employeurs peinent à recruter), il faut 3 ans de séjour ininterrompu et 12 mois de travail sur les 24 derniers mois ; cette voie est ouverte jusqu’au 31 décembre 2026.",
            "source": {
              "title": "Qu’est-ce que la régularisation d’un étranger par le travail ?",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F16053",
              "date": "2025-06-03",
              "publisher": "Service-Public.fr (DILA, Premier ministre)"
            }
          },
          {
            "text": "Séjourner en France sans titre n’est plus un délit depuis une loi du 31 décembre 2012. En 2011, la Cour de justice de l’Union européenne avait jugé que la directive européenne « retour » de 2008 s’oppose à une peine de prison pour le seul séjour irrégulier, tant que la procédure d’éloignement n’a pas été menée à son terme. Le Parlement a voté en 2023 le retour de ce délit, puni d’une amende. Le Conseil constitutionnel l’a censuré en janvier 2024 pour un motif de procédure (un « cavalier législatif », c’est-à-dire un ajout sans lien avec le texte initial), sans juger le fond. L’entrée irrégulière en France reste punie d’un an de prison et de 3 750 € d’amende.",
            "source": {
              "title": "Rapport n° 1987 sur la proposition de loi visant au rétablissement du délit de séjour irrégulier (n° 1839)",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/RAPPANR5L17B1987.html",
              "date": "2025-10-22",
              "publisher": "Assemblée nationale – Commission des lois"
            }
          },
          {
            "text": "Selon la Cour des comptes (janvier 2024), le nombre d’étrangers en situation irrégulière est difficile à évaluer. On l’estime souvent à partir du nombre de bénéficiaires de l’aide médicale de l’État, une méthode qui a de « nombreuses limites ». La Cour jugeait « impossible » d’éloigner toutes les personnes visées par une OQTF : 20 à 30 % d’entre elles ne sont pas identifiées avec certitude, et les pays d’origine délivrent difficilement les laissez-passer consulaires nécessaires au retour.",
            "source": {
              "title": "La politique de lutte contre l’immigration irrégulière",
              "url": "https://www.ccomptes.fr/fr/publications/la-politique-de-lutte-contre-limmigration-irreguliere",
              "date": "2024-01-04",
              "publisher": "Cour des comptes"
            }
          }
        ],
        "figures": [
          {
            "value": "27 819",
            "label": "régularisations d’étrangers sans titre de séjour (admissions exceptionnelles au séjour et titres « liens personnels et familiaux »), contre 31 252 en 2024 (– 11,0 %). Parmi elles, 9 696 ont été accordées au titre du travail, contre 10 954 en 2024 (France, données provisoires).",
            "date": "2025",
            "source": {
              "title": "Les titres de séjour en 2025 : les protections subsidiaires ont plus que doublé",
              "url": "https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "series",
              "unit": "régularisations",
              "items": [
                {
                  "label": "2024",
                  "value": 31252
                },
                {
                  "label": "2025",
                  "value": 27819
                }
              ]
            }
          },
          {
            "value": "10,9 %",
            "label": "taux d’exécution des obligations de quitter le territoire français (OQTF) sur les neuf premiers mois de 2025, selon la commission des lois du Sénat, d’après les données du ministère de l’Intérieur. Cet indicateur « appelle toutefois des réserves d’ordre méthodologique » : de nombreuses OQTF sont prises sans être notifiées, et certaines ne sont plus d’actualité.",
            "date": "janvier à septembre 2025",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Immigration, asile et intégration (avis n° 145 (2025-2026), tome II, commission des lois)",
              "url": "https://www.senat.fr/rap/a25-145-2/a25-145-2_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "part",
              "value": 10.9,
              "total": 100,
              "unit": "%",
              "whole": "des OQTF prononcées"
            }
          },
          {
            "value": "175 051",
            "label": "interpellations d’étrangers en situation irrégulière (+ 19,0 % sur un an) et 23 549 éloignements réalisés (forcés, aidés ou spontanés), dont 14 133 éloignements forcés (France métropolitaine, personnes majeures)",
            "date": "2025",
            "source": {
              "title": "Les éloignements d’étrangers en situation irrégulière en 2025 : une dynamique ascendante",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/eloignements-detrangers-en-situation-irreguliere-en-2025-dynamique-ascendante",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            }
          },
          {
            "value": "458 681",
            "label": "bénéficiaires de l’aide médicale de l’État (AME) au 30 septembre 2025, contre 465 744 au 30 septembre 2024. L’AME est destinée aux étrangers en situation irrégulière en France depuis plus de trois mois et aux ressources modestes. Ce nombre sert souvent d’indicateur indirect, et imparfait, de la population en situation irrégulière.",
            "date": "30 septembre 2025",
            "source": {
              "title": "Projet de loi relative aux résultats de la gestion et portant approbation des comptes de l’année 2025 : Santé (rapport n° 736 (2025-2026), tome II, annexe 28, commission des finances)",
              "url": "https://www.senat.fr/rap/l25-736-228/l25-736-228_mono.html",
              "date": "2026-06-17",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "series",
              "unit": "bénéficiaires",
              "items": [
                {
                  "label": "30 sept. 2024",
                  "value": 465744
                },
                {
                  "label": "30 sept. 2025",
                  "value": 458681
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-3-a",
          "text": "Régulariser toutes les personnes sans titre de séjour et renoncer aux expulsions"
        },
        {
          "id": "immigration-3-b",
          "text": "Régulariser à grande échelle les travailleurs sans titre de séjour et les parents d’enfants scolarisés"
        },
        {
          "id": "immigration-3-c",
          "text": "Régulariser au cas par cas ceux qui travaillent et reconduire les autres à la frontière"
        },
        {
          "id": "immigration-3-d",
          "text": "Limiter les régularisations et faire exécuter davantage les obligations de quitter le territoire"
        },
        {
          "id": "immigration-3-e",
          "text": "Faire du séjour irrégulier un délit et expulser sans délai les étrangers sans titre de séjour"
        }
      ]
    },
    {
      "id": "immigration-4",
      "topicId": "immigration",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle règle de nationalité pour les enfants nés en France de parents étrangers ?",
      "context": "Aujourd’hui : un enfant né en France de parents étrangers devient français à sa majorité s’il y a résidé au moins cinq ans depuis ses 11 ans ; à Mayotte, des conditions de séjour des parents s’y ajoutent.",
      "explainer": {
        "summary": "Le droit du sol permet à un enfant né en France de parents étrangers de devenir français, sous condition de résidence. Le débat porte sur son maintien, sur l’obligation d’en faire la demande, sur sa suppression, et sur Mayotte, où les règles sont plus strictes : certains veulent les durcir encore, d’autres les aligner sur le reste du pays.",
        "points": [
          {
            "text": "Un enfant né en France de parents étrangers devient français à 18 ans s’il réside en France et y a eu sa résidence habituelle pendant au moins 5 ans depuis ses 11 ans. Il peut le devenir plus tôt par déclaration : à partir de 13 ans, à la demande de ses parents et avec son accord (5 ans de résidence depuis ses 8 ans), ou de lui-même dès 16 ans. Un enfant né en France d’un parent étranger lui-même né en France est français dès sa naissance.",
            "source": {
              "title": "Nationalité française d’un enfant né en France de parents étrangers",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F295",
              "date": "2025-08-19",
              "publisher": "Service-Public.fr (DILA, Premier ministre)"
            }
          },
          {
            "text": "À Mayotte, une loi de 2025 exige qu’à la naissance de l’enfant, ses deux parents résident en France de manière régulière et ininterrompue depuis plus d’un an ; auparavant, un seul parent devait être en séjour régulier depuis trois mois. Le Conseil constitutionnel l’a validée le 7 mai 2025. Selon lui, l’article 73 de la Constitution permet d’adapter « dans une certaine mesure » ces règles outre-mer, au vu de la forte proportion d’étrangers à Mayotte, dont beaucoup en situation irrégulière, et de flux migratoires très importants. Il rappelle aussi que les lois de 1889 et de 1927, qui ont rendu français à leur majorité, sous condition de résidence, les enfants nés en France d’un étranger, répondaient notamment aux besoins de la conscription. Elles n’ont donc pas créé de principe de valeur constitutionnelle garantissant à toute personne née en France l’accès à la nationalité « sans restriction ».",
            "source": {
              "title": "Décision n° 2025-881 DC du 7 mai 2025 – Loi visant à renforcer les conditions d’accès à la nationalité française à Mayotte",
              "url": "https://www.conseil-constitutionnel.fr/decision/2025/2025881DC.htm",
              "date": "2025-05-07",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "De 1994 à 1998, la loi du 22 juillet 1993 a exigé des jeunes nés en France de parents étrangers une « manifestation de volonté », entre 16 et 21 ans, pour devenir français. La loi du 16 mars 1998 y a mis fin : depuis, l’acquisition se fait de plein droit à la majorité. Selon un rapport du Sénat de 1997, cité par le ministère de la Justice, la très grande majorité des jeunes concernés avait demandé la nationalité. Environ 10 à 15 % ne l’auraient pas fait, sans qu’on puisse distinguer le manque d’information du refus délibéré de devenir français.",
            "source": {
              "title": "Conditions d’acquisition de la nationalité française pour un enfant né en France de parents étrangers (question écrite n° 05978 et réponse du ministère de la Justice)",
              "url": "https://www.senat.fr/questions/base/2018/qSEQ180705978.html",
              "date": "2018-12-27",
              "publisher": "Sénat (JO Sénat, réponse du ministère de la Justice)"
            }
          }
        ],
        "figures": [
          {
            "value": "87 936",
            "label": "naissances en France dont les deux parents sont de nationalité étrangère, sur 643 905 naissances au total. En 2020, elles étaient 80 365 sur 735 196 (France).",
            "date": "2025",
            "source": {
              "title": "Naissances selon la nationalité et le pays de naissance des parents – Données annuelles de 1998 à 2025",
              "url": "https://www.insee.fr/fr/statistiques/2381382",
              "date": "2026-07-06",
              "publisher": "INSEE"
            },
            "chart": {
              "kind": "part",
              "value": 87936,
              "total": 643905,
              "whole": "naissances en France"
            }
          },
          {
            "value": "32 923",
            "label": "jeunes nés en France de parents étrangers devenus français par déclaration anticipée, entre 13 et 17 ans (33 727 en 2024). Ce mode d’accès représente environ une acquisition de la nationalité sur trois, sur 98 139 au total (France).",
            "date": "2025",
            "source": {
              "title": "L’accès à la nationalité française pour l’année 2025 : moins d’acquisitions de la nationalité française par décret",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/lacces-a-nationalite-francaise-pour-lannee-2025-moins-dacquisitions-de-nationalite-francaise-par",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED), et ministère de la Justice"
            },
            "chart": {
              "kind": "part",
              "value": 32923,
              "total": 98139,
              "whole": "acquisitions de la nationalité française"
            }
          },
          {
            "value": "47 %",
            "label": "des bébés nés à Mayotte ont leurs deux parents de nationalité étrangère, contre 28 % en 2014. En 2025, 53 % ont au moins un parent français, sur 9 070 naissances (mères domiciliées à Mayotte).",
            "date": "2025",
            "source": {
              "title": "Les naissances repartent légèrement à la hausse – Bilan démographique 2025 (Insee Flash Mayotte n° 204)",
              "url": "https://www.insee.fr/fr/statistiques/8743599",
              "date": "2026-02-26",
              "publisher": "INSEE"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2014",
                  "value": 28
                },
                {
                  "label": "2025",
                  "value": 47
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-4-a",
          "text": "Supprimer le droit du sol : la nationalité ne passerait plus que par la filiation ou la naturalisation"
        },
        {
          "id": "immigration-4-b",
          "text": "Mettre fin à l’acquisition automatique : le jeune devrait demander la nationalité à l’adolescence"
        },
        {
          "id": "immigration-4-c",
          "text": "Garder le droit du sol dans l’Hexagone et le suspendre pendant plusieurs années à Mayotte"
        },
        {
          "id": "immigration-4-d",
          "text": "Maintenir le droit du sol selon les règles actuelles, sans nouvelle restriction"
        },
        {
          "id": "immigration-4-e",
          "text": "Appliquer les mêmes règles de droit du sol partout, en levant les conditions propres à Mayotte"
        }
      ]
    },
    {
      "id": "immigration-5",
      "topicId": "immigration",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel accès aux aides sociales pour les étrangers en situation régulière ?",
      "context": "Aujourd’hui : les étrangers en situation régulière ont accès à la plupart des aides non financées par des cotisations (minima sociaux, allocations familiales, aides au logement) ; certaines, comme le revenu de solidarité active (RSA), exigent déjà plusieurs années de séjour.",
      "explainer": {
        "summary": "Les étrangers en séjour régulier ont accès à la plupart des prestations sociales, certaines seulement après plusieurs années de séjour. Certains veulent donner la priorité aux Français, retarder ou supprimer cet accès, d’autres défendent l’égalité de traitement ; la Constitution et le droit européen encadrent ces choix.",
        "points": [
          {
            "text": "Pour toucher le RSA, un étranger non européen doit en principe détenir depuis au moins 5 ans un titre de séjour qui l’autorise à travailler. Cette condition ne s’applique pas aux titulaires d’une carte de résident, aux réfugiés, aux apatrides, aux bénéficiaires de la protection subsidiaire, ni aux ressortissants algériens.",
            "source": {
              "title": "RSA : demandeur de 25 ans et plus",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F19778",
              "date": "2026-04-01",
              "publisher": "Service-Public.fr (DILA, Premier ministre)"
            }
          },
          {
            "text": "Selon le Conseil constitutionnel, les étrangers qui résident en France de manière stable et régulière ont droit à la protection sociale. La loi peut soumettre certaines prestations à une durée de résidence ou d’activité, mais cette durée ne doit pas priver de garanties le droit à la solidarité nationale. En avril 2024, il a jugé disproportionné d’exiger des non-Européens 5 ans de résidence ou 30 mois d’activité professionnelle pour le droit au logement, les aides au logement, les prestations familiales et l’allocation personnalisée d’autonomie.",
            "source": {
              "title": "Décision n° 2024-6 RIP du 11 avril 2024",
              "url": "https://www.conseil-constitutionnel.fr/decision/2024/20246RIP.htm",
              "date": "2024-04-11",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Le droit européen accorde le statut de « résident de longue durée » après 5 ans de séjour légal et ininterrompu. Ce statut garantit l’égalité de traitement avec les nationaux dans plusieurs domaines : l’accès à l’emploi (hors exercice de l’autorité publique), la sécurité sociale, l’aide et la protection sociales, et l’accès aux procédures d’attribution d’un logement. En matière d’aide et de protection sociales, un État peut limiter cette égalité aux « prestations essentielles ».",
            "source": {
              "title": "Directive 2003/109/CE du Conseil du 25 novembre 2003 relative au statut des ressortissants de pays tiers résidents de longue durée",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32003L0109",
              "date": "2003-11-25",
              "publisher": "EUR-Lex (Union européenne)"
            }
          }
        ],
        "figures": [
          {
            "value": "près de 4,5 millions",
            "label": "titres de séjour valides et documents provisoires de séjour détenus par des ressortissants de pays hors UE au 31 décembre 2025, en hausse de 3,2 % sur un an et de 20 % depuis 2021 (France)",
            "date": "31 décembre 2025",
            "source": {
              "title": "Les titres de séjour en 2025 : les protections subsidiaires ont plus que doublé",
              "url": "https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            }
          },
          {
            "value": "11 % contre 6 %",
            "label": "part des prestations sociales (hors retraites et allocations chômage) dans le niveau de vie moyen des immigrés, contre celui des non-immigrés. L’écart s’explique entre autres par des familles plus souvent nombreuses chez les immigrés originaires d’Afrique. Les revenus d’activité en représentent 75 % contre 76 %. Un immigré est né étranger à l’étranger ; certains sont devenus français (France métropolitaine).",
            "date": "2021 (publié en 2024)",
            "source": {
              "title": "Niveau de vie et pauvreté des immigrés (Les revenus et le patrimoine des ménages, édition 2024)",
              "url": "https://www.insee.fr/fr/statistiques/7941405?sommaire=7941491",
              "date": "2024-10-17",
              "publisher": "INSEE Références"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Immigrés",
                  "value": 11
                },
                {
                  "label": "Non-immigrés",
                  "value": 6
                }
              ]
            }
          },
          {
            "value": "30,6 % contre 12,7 %",
            "label": "taux de pauvreté des immigrés et des non-immigrés (France métropolitaine)",
            "date": "2021 (publié en 2024)",
            "source": {
              "title": "Niveau de vie et pauvreté des immigrés (Les revenus et le patrimoine des ménages, édition 2024)",
              "url": "https://www.insee.fr/fr/statistiques/7941405?sommaire=7941491",
              "date": "2024-10-17",
              "publisher": "INSEE Références"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Immigrés",
                  "value": 30.6
                },
                {
                  "label": "Non-immigrés",
                  "value": 12.7
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-5-a",
          "text": "Donner aux Français la priorité pour le logement social et l’emploi, et leur réserver les aides au logement"
        },
        {
          "id": "immigration-5-b",
          "text": "Supprimer pour les étrangers toutes les aides sociales qui ne sont pas financées par des cotisations"
        },
        {
          "id": "immigration-5-c",
          "text": "Exiger plusieurs années de séjour régulier, voire d’activité, avant d’ouvrir ces aides aux étrangers"
        },
        {
          "id": "immigration-5-d",
          "text": "Garantir aux étrangers en situation régulière le même accès aux aides sociales que les Français"
        },
        {
          "id": "immigration-5-e",
          "text": "Conserver les règles actuelles, qui imposent une durée de séjour pour certaines aides seulement",
          "external": true
        }
      ]
    },
    {
      "id": "immigration-6",
      "topicId": "immigration",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle politique d’intégration pour les étrangers qui s’installent en France ?",
      "context": "Aujourd’hui : les nouveaux arrivants signent un contrat d’intégration républicaine qui peut inclure une formation au français.",
      "explainer": {
        "summary": "Les approches divergent sur ce qu’il faut exiger des étrangers qui s’installent (maîtrise du français, respect des valeurs républicaines, adoption des usages et du mode de vie français) et sur ce qu’il faut leur garantir (cours de français, accompagnement, lutte contre les discriminations). Elles divergent aussi sur l’accès aux titres de séjour de longue durée et à la nationalité.",
        "points": [
          {
            "text": "Le contrat d’intégration républicaine dure un an. Le signataire s’engage à suivre une formation civique de 4 jours et, selon son niveau de français, jusqu’à 600 heures de cours. Depuis juillet 2025, l’Office français de l’immigration et de l’intégration (OFII) ouvre ces cours à tous les signataires qui n’ont pas le niveau A2 (élémentaire). La loi du 26 janvier 2024 exige ce niveau A2 pour une carte de séjour pluriannuelle, le niveau B1 (intermédiaire) pour une carte de résident, et la réussite d’un examen civique à partir de 2026.",
            "source": {
              "title": "L’intégration des étrangers en 2025 : 46 600 BPI ont été accompagnés par le programme Agir",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/lintegration-des-etrangers-en-2025-46-600-bpi-ont-ete-accompagnes-par-programme-agir",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            }
          },
          {
            "text": "Pour être naturalisé, il faut en principe résider en France depuis au moins 5 ans (moins dans certains cas ; aucune durée n’est exigée des réfugiés), avoir des revenus stables et suffisants, et justifier de son « assimilation à la communauté française ». Celle-ci est vérifiée par un examen civique et par un entretien en préfecture, qui porte notamment sur l’adhésion aux principes et aux valeurs de la République. Une connaissance suffisante du français est aussi exigée. Même si ces conditions sont remplies, la demande peut être refusée ou reportée.",
            "source": {
              "title": "Naturalisation française par décret",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F2213",
              "date": "2026-07-16",
              "publisher": "Service-Public.fr (DILA, Premier ministre)"
            }
          },
          {
            "text": "Tout étranger qui demande un titre de séjour, ou son renouvellement, doit signer un contrat d’engagement à respecter les principes de la République : liberté personnelle, liberté d’expression et de conscience, égalité entre les femmes et les hommes, dignité de la personne humaine, devise et symboles de la République, intégrité du territoire, laïcité. Le préfet peut refuser le titre à qui ne signe pas, et ne pas renouveler ou retirer celui d’un étranger dont le comportement montre qu’il ne respecte pas ces principes. La signature reste facultative pour les étrangers soumis à des règles particulières, comme les ressortissants algériens ou les citoyens de l’Union européenne.",
            "source": {
              "title": "Le contrat d’engagement à respecter les principes de la République",
              "url": "https://www.immigration.interieur.gouv.fr/limmigration-en-france/l-administration-numerique-pour-les-etrangers-en-France/le-contrat-d-engagement-a-respecter-les-principes-de-la-republique",
              "publisher": "Ministère de l’Intérieur – Direction générale des étrangers en France (DGEF)"
            }
          }
        ],
        "figures": [
          {
            "value": "102 871",
            "label": "Contrats d’intégration républicaine signés par des ressortissants de pays tiers (France), contre 114 443 en 2024 (– 10,1 %) ; 51,2 % des signataires se sont vu prescrire une formation au français. Parmi ceux qui ont terminé cette formation, 67,6 % ont atteint le niveau A1 (débutant).",
            "date": "2025",
            "source": {
              "title": "L’intégration des étrangers en 2025 : 46 600 BPI ont été accompagnés par le programme Agir",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/lintegration-des-etrangers-en-2025-46-600-bpi-ont-ete-accompagnes-par-programme-agir",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, d’après l’OFII"
            },
            "chart": {
              "kind": "series",
              "unit": "contrats",
              "items": [
                {
                  "label": "2024",
                  "value": 114443
                },
                {
                  "label": "2025",
                  "value": 102871
                }
              ]
            }
          },
          {
            "value": "62,4 % contre 69,8 %",
            "label": "Part des immigrés et des non-immigrés de 15 à 64 ans qui occupent un emploi (France hors Mayotte, logements ordinaires). Pour les immigrés originaires de pays hors de l’Union européenne, elle est de 61,0 %.",
            "date": "2024",
            "source": {
              "title": "Activité, emploi et chômage des immigrés de 2014 à 2024",
              "url": "https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/activite-emploi-et-chomage-des-immigres-de-2014-a-2024.html",
              "date": "2025-10-22",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED), d’après l’INSEE (enquête Emploi)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Immigrés",
                  "value": 62.4
                },
                {
                  "label": "Non-immigrés",
                  "value": 69.8
                }
              ]
            }
          },
          {
            "value": "22,8 % contre 33,3 %",
            "label": "Taux de rappel par les recruteurs de candidatures fictives d’origine supposée maghrébine, contre des candidatures comparables sans ascendance migratoire supposée. Ce « testing » (envoi de candidatures fictives qui ne diffèrent que par l’origine supposée) a été mené pour la DARES sur 9 600 candidatures, pour 2 400 offres dans douze métiers du CAP au bac + 5 ; tous les candidats avaient obtenu leur diplôme en France.",
            "date": "2019-2021 (publié en 2023)",
            "source": {
              "title": "Les discriminations sur le marché du travail subies par les personnes d’origine maghrébine (Immigrés et descendants d’immigrés, édition 2023)",
              "url": "https://www.insee.fr/fr/statistiques/6793310?sommaire=6793391",
              "date": "2023-03-30",
              "publisher": "INSEE Références (étude de la DARES)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Origine supposée maghrébine",
                  "value": 22.8
                },
                {
                  "label": "Sans ascendance migratoire",
                  "value": 33.3
                }
              ]
            }
          },
          {
            "value": "42 246",
            "label": "Acquisitions de la nationalité française par décret (naturalisations et réintégrations dans la nationalité), contre 48 829 en 2024 (– 13,5 %). Selon le ministère, cette baisse s’explique notamment par une circulaire du 2 mai 2025 qui a durci les conditions. Parmi ces acquisitions, 9 196 enfants mineurs sont devenus français avec leurs parents. Depuis le 1er janvier 2026, la loi exige aussi le niveau B2 (avancé) en français pour être naturalisé. Toutes voies confondues (décret, mariage, naissance et résidence en France…), 98 139 personnes sont devenues françaises en 2025.",
            "date": "2025",
            "source": {
              "title": "L’accès à la nationalité française pour l’année 2025 : moins d’acquisitions de la nationalité française par décret",
              "url": "https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/lacces-a-nationalite-francaise-pour-lannee-2025-moins-dacquisitions-de-nationalite-francaise-par",
              "date": "2026-06-30",
              "publisher": "Ministère de l’Intérieur – DGEF, service statistique (DSED)"
            },
            "chart": {
              "kind": "series",
              "unit": "acquisitions par décret",
              "items": [
                {
                  "label": "2024",
                  "value": 48829
                },
                {
                  "label": "2025",
                  "value": 42246
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-6-a",
          "text": "Exiger l’assimilation : que les étrangers adoptent la langue, les usages et le mode de vie français"
        },
        {
          "id": "immigration-6-b",
          "text": "Conditionner l’admission et le séjour à la maîtrise du français et au respect des valeurs républicaines"
        },
        {
          "id": "immigration-6-c",
          "text": "Garantir à tous les arrivants des cours de français et un accompagnement, et lutter contre les discriminations"
        },
        {
          "id": "immigration-6-d",
          "text": "Faciliter l’installation durable par des titres de séjour de longue durée et une naturalisation simplifiée"
        }
      ]
    },
    {
      "id": "europe-1",
      "topicId": "europe",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quelle direction donner à la construction européenne ?",
      "context": "Aujourd’hui : la France est membre de l’Union européenne et de la zone euro ; en politique étrangère, en défense et en fiscalité, les décisions de l’Union exigent l’unanimité des 27 États membres.",
      "explainer": {
        "summary": "Au Conseil de l’UE, la majorité qualifiée est la règle par défaut, mais l’unanimité, qui donne un droit de veto à chaque État, reste exigée dans un nombre limité de domaines, dont la politique étrangère et la défense, la fiscalité, la protection sociale, le budget pluriannuel et l’adhésion de nouveaux pays, et pour réviser les traités. Parmi les orientations débattues : supprimer ce veto pour aller vers une Europe fédérale ; renforcer l’Union dans certains domaines en préservant la souveraineté des nations ; bâtir une Europe sociale ; renégocier les traités, ou cesser d’en appliquer certaines règles ; rendre des pouvoirs aux États ; quitter l’Union ; ou combattre l’Union actuelle sans revenir aux frontières nationales.",
        "points": [
          {
            "text": "Réviser les traités exige l’unanimité des États, puis une ratification dans chacun d’eux selon ses règles constitutionnelles (approbation parlementaire ou référendum). Le Parlement européen a demandé en juin 2022 une convention de révision ; à ce jour, le Conseil européen ne l’a pas convoquée. Un État peut aussi quitter l’Union : l’article 50 du traité sur l’UE prévoit alors une période de négociation de deux ans, prolongeable. Le Royaume-Uni l’a quittée en 2020.",
            "source": {
              "title": "Le traité de Lisbonne – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/5/le-traite-de-lisbonne",
              "date": "2026-04",
              "publisher": "Parlement européen"
            }
          },
          {
            "text": "Sans réviser les traités, sept « clauses passerelles » permettent de passer de l’unanimité à la majorité qualifiée dans un domaine. Leur activation exige elle-même l’unanimité, et elles ont été rarement utilisées. La « coopération renforcée » permet aussi à au moins neuf États d’avancer ensemble, comme pour le Parquet européen.",
            "source": {
              "title": "Le traité de Lisbonne – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/5/le-traite-de-lisbonne",
              "date": "2026-04",
              "publisher": "Parlement européen"
            }
          },
          {
            "text": "En 2005, le projet de traité établissant une Constitution pour l’Europe a été rejeté par référendum en France et aux Pays-Bas. Le traité de Lisbonne, dont le contenu est, selon le Parlement européen, « à peu de choses près » identique, a été ratifié en France par voie parlementaire, et en Irlande lors d’un second référendum, après un premier « non » et des garanties sur la neutralité, la fiscalité et des questions éthiques. La primauté du droit de l’Union sur le droit national repose sur une jurisprudence de longue date de la Cour de justice de l’UE : les traités ne l’énoncent pas, mais une déclaration annexée, non contraignante, y fait référence.",
            "source": {
              "title": "Le traité de Lisbonne – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/5/le-traite-de-lisbonne",
              "date": "2026-04",
              "publisher": "Parlement européen"
            }
          }
        ],
        "figures": [
          {
            "value": "55 % des États, 65 % de la population",
            "label": "Seuil de la majorité qualifiée au Conseil de l’UE : au moins 15 États sur 27, représentant au moins 65 % des habitants de l’Union",
            "date": "Règle en vigueur (article 16 du traité sur l’UE)",
            "source": {
              "title": "Le Conseil de l’Union européenne – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/24/le-conseil-de-l-union-europeenne",
              "date": "2026-09",
              "publisher": "Parlement européen"
            }
          },
          {
            "value": "305 pour, 276 contre",
            "label": "Vote du Parlement européen sur ses propositions de révision des traités, qui prévoient notamment davantage de décisions à la majorité qualifiée au Conseil (29 abstentions)",
            "date": "22 novembre 2023",
            "source": {
              "title": "Avenir de l’UE : les propositions du Parlement pour modifier les traités",
              "url": "https://www.europarl.europa.eu/news/fr/press-room/20231117IPR12217/avenir-de-l-ue-les-propositions-du-parlement-pour-modifier-les-traites",
              "date": "2023-11-22",
              "publisher": "Parlement européen"
            },
            "chart": {
              "kind": "compare",
              "unit": "voix",
              "items": [
                {
                  "label": "Pour",
                  "value": 305
                },
                {
                  "label": "Contre",
                  "value": 276
                },
                {
                  "label": "Abstentions",
                  "value": 29
                }
              ]
            }
          },
          {
            "value": "69,1 millions sur 452,0 millions",
            "label": "Habitants de la France (69 112 309) et de l’UE à 27 (451 990 314), données provisoires. Ce poids démographique compte dans les votes à la majorité qualifiée.",
            "date": "1er janvier 2026",
            "source": {
              "title": "Population au 1er janvier (tps00001)",
              "url": "https://ec.europa.eu/eurostat/databrowser/view/tps00001/default/table?lang=fr",
              "date": "2026-09-30",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "part",
              "value": 69112309,
              "total": 451990314,
              "whole": "habitants de l’UE à 27"
            }
          },
          {
            "value": "620 € à 2 771 €",
            "label": "Salaire minimum brut mensuel dans l’UE, du plus bas (Bulgarie) au plus élevé (Luxembourg) ; 1 867 € en France. Une fois corrigé des différences de prix (en standards de pouvoir d’achat, SPA), il va de 935 SPA (Estonie) à 2 164 SPA (Allemagne). 22 des 27 États ont un salaire minimum national ; au Danemark, en Italie, en Autriche, en Finlande et en Suède, les salaires minimums sont fixés par des conventions collectives propres à certains secteurs.",
            "date": "1er juillet 2026",
            "source": {
              "title": "Minimum wage statistics (Statistics Explained)",
              "url": "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Minimum_wage_statistics",
              "date": "2026-07-31",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Bulgarie (le plus bas)",
                  "value": 620
                },
                {
                  "label": "France",
                  "value": 1867
                },
                {
                  "label": "Luxembourg (le plus élevé)",
                  "value": 2771
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "europe-1-a",
          "text": "Supprimer le droit de veto des États et aller vers une Europe fédérale, au besoin avec un noyau de pays volontaires"
        },
        {
          "id": "europe-1-b",
          "text": "Renforcer l’Union dans la défense, l’industrie et l’écologie, tout en préservant la souveraineté des nations"
        },
        {
          "id": "europe-1-c",
          "text": "Rendre des pouvoirs aux États : primauté du droit national sous conditions, droit de veto garanti, compétences de l’Union réduites"
        },
        {
          "id": "europe-1-d",
          "text": "Renégocier les traités pour sortir des règles de concurrence, de libre-échange et de déficit, et sinon cesser de les appliquer"
        },
        {
          "id": "europe-1-e",
          "text": "Quitter l’Union européenne, soit tout de suite, soit après une négociation et un référendum sur la sortie"
        },
        {
          "id": "europe-1-f",
          "text": "Combattre à la fois l’Union actuelle et le retour aux frontières nationales, en unissant les travailleurs de toute l’Europe"
        },
        {
          "id": "europe-1-g",
          "text": "Bâtir une Europe sociale : salaire minimum européen, harmonisation fiscale, lutte contre le dumping social"
        }
      ]
    },
    {
      "id": "europe-2",
      "topicId": "europe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle politique budgétaire pour l’Union européenne ?",
      "context": "Aujourd’hui : le budget de l’Union représente environ 1 % du revenu national des États membres, et ses règles encadrent les déficits publics de chaque État.",
      "explainer": {
        "summary": "Le budget européen est financé surtout par des contributions des États calculées sur leur revenu national, et son cadre pour 2028-2034 est en cours de négociation. Le débat porte sur sa taille et son financement (contributions des États, emprunt commun, impôts européens), sur la contribution de la France, sur les règles qui encadrent les déficits nationaux et sur le rôle de la Banque centrale européenne face aux dettes publiques.",
        "points": [
          {
            "text": "Les contributions calculées sur le revenu national brut (RNB) fournissent environ 60 à 70 % des ressources propres de l’UE. Créer une nouvelle ressource, par exemple un impôt européen, exige l’unanimité des États au Conseil, puis une ratification par chacun d’eux. En juillet 2025, la Commission en a proposé plusieurs, assises notamment sur les quotas carbone, le tabac, les déchets électroniques et les grandes entreprises.",
            "source": {
              "title": "Recettes de l’Union – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/27/recettes-de-l-union",
              "date": "2026-05",
              "publisher": "Parlement européen"
            }
          },
          {
            "text": "Le projet de loi de finances pour 2027, déposé le 1er octobre 2026, évalue la contribution de la France au budget de l’UE à 30 906 M€ pour 2027, hors droits de douane, contre 28 118 M€ pour 2026 selon l’évaluation révisée. Cette évaluation repose notamment sur les paiements inscrits au projet de budget européen pour 2027 : 212,0 Md€, contre 190,1 Md€ au budget initial 2026, une hausse due en partie au rattrapage des fonds gérés avec les États.",
            "source": {
              "title": "Projet de loi de finances pour 2027 (n° 3210)",
              "url": "https://www.assemblee-nationale.fr/dyn/docs/PRJLANR5L17B3210.raw",
              "date": "2026-10-01",
              "publisher": "Assemblée nationale (projet déposé par le Gouvernement)"
            }
          },
          {
            "text": "Les règles européennes fixent deux valeurs de référence : 3 % du PIB pour le déficit public et 60 % pour la dette. Depuis la réforme de 2024, chaque État suit une trajectoire de dépenses sur quatre ou cinq ans, prolongeable jusqu’à sept ans s’il s’engage à investir et à réformer. Une clause dérogatoire nationale permet de s’en écarter temporairement face à des circonstances exceptionnelles indépendantes de sa volonté.",
            "source": {
              "title": "Le cadre de l’Union européenne pour les politiques budgétaires – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/89/le-cadre-de-l-union-europeenne-pour-les-politiques-budgetaires",
              "date": "2026-04",
              "publisher": "Parlement européen"
            }
          }
        ],
        "figures": [
          {
            "value": "1 763 Md€",
            "label": "Budget 2028-2034 proposé par la Commission (prix de 2025), soit 1,26 % du revenu national brut de l’UE, dont 0,11 %, environ 25 Md€ par an, pour rembourser le plan de relance NextGenerationEU (750 Md€ aux prix de 2018), financé par des emprunts de l’UE sur les marchés financiers. Le budget 2021-2027 représentait 1,13 % à son adoption.",
            "date": "Proposition du 16 juillet 2025, en négociation",
            "source": {
              "title": "Cadre financier pluriannuel – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/29/cadre-financier-pluriannuel",
              "date": "2025-11",
              "publisher": "Parlement européen"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du RNB de l’UE",
              "items": [
                {
                  "label": "Budget 2021-2027, à l’adoption",
                  "value": 1.13
                },
                {
                  "label": "Proposition 2028-2034",
                  "value": 1.26
                }
              ]
            }
          },
          {
            "value": "−7,9 Md€",
            "label": "Solde net de la France avec le budget européen, selon la méthode comptable (ce que la France verse moins ce que l’UE dépense en France), contre −9,3 Md€ en 2023 : deuxième contributeur net, derrière l’Allemagne (contribution nette de 18,8 Md€). Avec 16,456 Md€ de dépenses de l’UE en France hors plan de relance, dont 58 % au titre de la politique agricole commune, elle est aussi le premier bénéficiaire en volume, mais 22e par habitant (240 €). Elle est enfin le premier financeur des rabais accordés à cinq pays (Allemagne, Pays-Bas, Suède, Autriche, Danemark) : 1,5 Md€.",
            "date": "2024 (rabais : 2025)",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Affaires européennes – Rapport général n° 139 (2025-2026), tome II, fascicule 2",
              "url": "https://www.senat.fr/rap/l25-139-22/l25-139-22_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2023",
                  "value": -9.3
                },
                {
                  "label": "2024",
                  "value": -7.9
                }
              ]
            }
          },
          {
            "value": "11 sur 27",
            "label": "États de l’UE dont le déficit public atteint ou dépasse 3 % du PIB. Les plus forts déficits sont ceux de la Roumanie (– 7,9 %), de la Pologne (– 7,3 %), de la Belgique (– 5,2 %) et de la France (– 5,1 %). Douze États ont une dette publique de plus de 60 % du PIB. Pour l’ensemble de l’UE, le déficit est de 3,1 % du PIB et la dette de 81,7 % (zone euro : 2,9 % et 87,8 %).",
            "date": "2025 (données publiées le 22 avril 2026)",
            "source": {
              "title": "Euro area government deficit at 2.9 % and EU at 3.1 % of GDP – Provision of deficit and debt data for 2025, first notification",
              "url": "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-22042026-ap",
              "date": "2026-04-22",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "part",
              "value": 11,
              "total": 27,
              "whole": "États de l’UE"
            }
          },
          {
            "value": "488 Md€",
            "label": "Titres de dette publique détenus par la Banque de France au titre de deux programmes d’achats de l’Eurosystème (la BCE et les banques centrales nationales de la zone euro), contre 546 Md€ au 31 décembre 2025 (valeur « en coût amorti »). Il s’agit du programme d’achats d’actifs (APP) et du programme d’achats d’urgence face à la pandémie (PEPP), lancé en mars 2020. La baisse vient uniquement des titres arrivés à échéance, qui ne sont plus réinvestis depuis juillet 2023 (APP) et janvier 2025 (PEPP) ; aucun titre n’a été vendu sur les marchés.",
            "date": "30 juin 2026",
            "source": {
              "title": "Précisions sur le programme de détention de la dette publique par la Banque de France (communiqué de presse)",
              "url": "https://www.banque-france.fr/fr/communiques-de-presse/precisions-sur-le-programme-de-detention-de-la-dette-publique-par-la-banque-de-france",
              "date": "2026-09-12",
              "publisher": "Banque de France"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "31 déc. 2025",
                  "value": 546
                },
                {
                  "label": "30 juin 2026",
                  "value": 488
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "europe-2-a",
          "text": "Doter l’Union d’un budget plus important, financé par des emprunts communs et des impôts européens"
        },
        {
          "id": "europe-2-b",
          "text": "Assouplir les règles européennes de déficit pour que chaque État puisse emprunter et investir"
        },
        {
          "id": "europe-2-c",
          "text": "Réduire la contribution de la France au budget européen, ou la conditionner, en la renégociant avec les autres États"
        },
        {
          "id": "europe-2-d",
          "text": "Cesser de verser toute contribution au budget européen, en la suspendant ou en quittant l’Union"
        },
        {
          "id": "europe-2-e",
          "text": "Respecter les règles budgétaires européennes actuelles, en refusant d’annuler la dette détenue par la Banque centrale européenne"
        },
        {
          "id": "europe-2-f",
          "text": "Mobiliser la Banque centrale européenne pour financer l’investissement public ou alléger la dette qu’elle détient"
        }
      ]
    },
    {
      "id": "europe-3",
      "topicId": "europe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment faire évoluer les règles du marché unique européen ?",
      "context": "Aujourd’hui : les règles européennes ont ouvert à la concurrence l’électricité, le gaz, le transport ferroviaire et d’autres services publics.",
      "explainer": {
        "summary": "Dans le marché unique, fondé sur la libre circulation des marchandises, des personnes, des services et des capitaux, l’Union contrôle les ententes, les fusions et les aides publiques aux entreprises, et elle a ouvert à la concurrence d’anciens monopoles publics. Plusieurs orientations s’opposent : assouplir les règles de concurrence pour faire émerger de grandes entreprises européennes, revenir à des monopoles publics nationaux à prix réglementés, approfondir le marché unique en levant les obstacles nationaux aux échanges, alléger les normes européennes et interdire leur durcissement en droit français, ou garder le cadre actuel.",
        "points": [
          {
            "text": "Le droit européen interdit les ententes (accords entre entreprises qui restreignent la concurrence) et l’abus de position dominante, mais pas le fait d’être dominant (articles 101 et 102 du traité sur le fonctionnement de l’UE). Les lignes directrices de la Commission sur les fusions sont en cours de réexamen en 2026. Les règles qui encadrent les compensations versées aux services publics (« services d’intérêt économique général ») ont été révisées : la nouvelle décision est entrée en vigueur le 8 janvier 2026.",
            "source": {
              "title": "Politique de concurrence – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/82/politique-de-concurrence",
              "date": "2026-04",
              "publisher": "Parlement européen"
            }
          },
          {
            "text": "Le 6 février 2019, la Commission a interdit le rachat d’Alstom par Siemens, qui aurait réuni les deux plus grands fournisseurs européens de signalisation ferroviaire et de matériel roulant. Selon elle, l’opération aurait réduit la concurrence dans la signalisation et les trains à très grande vitesse, et les mesures correctives proposées étaient insuffisantes.",
            "source": {
              "title": "Concentrations : la Commission interdit le projet d’acquisition d’Alstom par Siemens (IP/19/881)",
              "url": "https://ec.europa.eu/commission/presscorner/detail/fr/ip_19_881",
              "date": "2019-02-06",
              "publisher": "Commission européenne"
            }
          },
          {
            "text": "En 2024, deux rapports commandés par les dirigeants de l’Union, ceux d’Enrico Letta et de Mario Draghi, ont conclu que le marché unique restait « très fragmenté » et désigné comme prioritaires, entre autres, la finance, l’énergie et les télécommunications. En mai 2025, la Commission a présenté une stratégie pour lever les obstacles qui subsistent, accompagnée de trains de mesures « omnibus » de simplification des règles pour les entreprises. En mars 2026, les dirigeants de l’Union ont lancé le plan « Une Europe, un marché », qui doit s’achever d’ici fin 2027.",
            "source": {
              "title": "Le marché intérieur : principes généraux – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/33/le-marche-interieur-principes-generaux",
              "date": "2026-03",
              "publisher": "Parlement européen"
            }
          }
        ],
        "figures": [
          {
            "value": "33 sur 10 164",
            "label": "Fusions interdites par la Commission européenne, sur l’ensemble des opérations qui lui ont été notifiées. Sur la même période, 370 ont été autorisées sous conditions dès le premier examen et 152 après une enquête approfondie ; 206 notifications ont été retirées pendant le premier examen et 57 pendant une enquête approfondie.",
            "date": "21 septembre 1990 – 30 septembre 2026",
            "source": {
              "title": "Merger cases statistics",
              "url": "https://competition-policy.ec.europa.eu/document/download/4b083559-e36c-44c2-a604-f581abd6b42c_en?filename=Merger_cases_statistics.pdf",
              "date": "2026-09-30",
              "publisher": "Commission européenne, DG Concurrence"
            },
            "chart": {
              "kind": "part",
              "value": 33,
              "total": 10164,
              "whole": "opérations notifiées"
            }
          },
          {
            "value": "49 %",
            "label": "Part des sites de consommation d’électricité en offre de marché, dont 34 % chez un fournisseur autre que les fournisseurs historiques. Les autres restent au tarif réglementé, fixé par les pouvoirs publics et proposé par EDF et un peu plus de 100 entreprises locales de distribution. En volume, 77 % de l’électricité consommée passe par des offres de marché. Le marché est totalement ouvert à la concurrence depuis le 1er juillet 2007.",
            "date": "30 juin 2026",
            "source": {
              "title": "Marché de détail de l’électricité – Présentation",
              "url": "https://www.cre.fr/electricite/marche-de-detail-de-lelectricite/presentation.html",
              "date": "2026-09-30",
              "publisher": "Commission de régulation de l’énergie (CRE)"
            },
            "chart": {
              "kind": "part",
              "value": 49,
              "total": 100,
              "unit": "%",
              "whole": "des sites de consommation d’électricité"
            }
          },
          {
            "value": "48 %",
            "label": "Part des sites de gaz naturel servis par un fournisseur autre que les fournisseurs historiques ; en volume, 66 % du gaz consommé. Depuis la fin des tarifs réglementés du gaz, le 30 juin 2023, tous les sites sont en offre de marché.",
            "date": "30 juin 2026",
            "source": {
              "title": "Marché de détail du gaz naturel – Présentation",
              "url": "https://www.cre.fr/gaz/marche-de-detail-du-gaz-naturel/presentation.html",
              "date": "2026-09-30",
              "publisher": "Commission de régulation de l’énergie (CRE)"
            },
            "chart": {
              "kind": "part",
              "value": 48,
              "total": 100,
              "unit": "%",
              "whole": "des sites de gaz naturel"
            }
          },
          {
            "value": "près de 20 %",
            "label": "Part de l’offre nationale que représentent les lots de trains conventionnés (services financés par une autorité publique, comme les TER) déjà attribués après appel d’offres, selon le régulateur des transports",
            "date": "Juin 2026",
            "source": {
              "title": "Ouverture du marché ferroviaire : de premiers bénéfices concrets, trois défis pour les pérenniser",
              "url": "https://www.autorite-transports.fr/actualites/ouverture-du-marche-ferroviaire-de-premiers-benefices-concrets-trois-defis-pour-les-perenniser/",
              "date": "2026-06-28",
              "publisher": "Autorité de régulation des transports (ART)"
            },
            "chart": {
              "kind": "part",
              "value": 20,
              "total": 100,
              "unit": "%",
              "whole": "de l’offre nationale de trains conventionnés"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "europe-3-a",
          "text": "Assouplir les règles européennes de concurrence pour faire émerger de grandes entreprises européennes"
        },
        {
          "id": "europe-3-b",
          "text": "Revenir sur l’ouverture à la concurrence pour rétablir des monopoles publics nationaux à prix réglementés"
        },
        {
          "id": "europe-3-c",
          "text": "Approfondir le marché unique : supprimer les règles nationales qui freinent les échanges, unifier les marchés de capitaux"
        },
        {
          "id": "europe-3-d",
          "text": "Alléger les normes européennes et interdire leur surtransposition, c’est-à-dire leur durcissement en droit français"
        },
        {
          "id": "europe-3-e",
          "text": "Conserver les règles de concurrence actuelles et l’ouverture des services publics à la concurrence",
          "external": true
        }
      ]
    },
    {
      "id": "ukraine_russie-1",
      "topicId": "ukraine_russie",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle stratégie face à la guerre menée par la Russie en Ukraine ?",
      "context": "Aujourd’hui : la guerre déclenchée par l’invasion russe de février 2022 se poursuit ; la France et l’Union européenne aident l’Ukraine militairement et financièrement.",
      "explainer": {
        "summary": "Plus de quatre ans après l’invasion à grande échelle de l’Ukraine par la Russie, le 24 février 2022, la guerre continue. Le débat porte sur l’aide de la France (l’accroître, la maintenir, la réduire ou l’arrêter) et sur son financement, sur la place de la négociation et de la médiation, et sur la sécurité de l’Ukraine après un éventuel cessez-le-feu.",
        "points": [
          {
            "text": "Le 24 février 2026, l’UE a adopté un prêt à l’Ukraine de 90 Md€ au plus pour 2026 et 2027 : à titre indicatif, 60 Md€ pour ses capacités industrielles de défense et 30 Md€ d’aide budgétaire. L’Union emprunte ces fonds sur les marchés, avec la garantie de son budget. La République tchèque, la Hongrie et la Slovaquie n’y participent pas ; les dépenses qui en découlent sont à la charge des États participants, dont la France. L’Ukraine ne devra rembourser que si la Russie lui verse des réparations, ou en cas de fraude ou de manquement aux conditions du prêt ; l’Union se réserve le droit d’utiliser les avoirs russes immobilisés dans l’Union pour rembourser ce prêt.",
            "source": {
              "title": "Règlement (UE) 2026/467 du Parlement européen et du Conseil du 24 février 2026 mettant en œuvre une coopération renforcée concernant l’établissement du prêt de soutien à l’Ukraine pour 2026 et 2027",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32026R0467",
              "date": "2026-02-24",
              "publisher": "EUR-Lex – Journal officiel de l’Union européenne"
            }
          },
          {
            "text": "Le 13 juillet 2026, après une réunion à Paris de la « Coalition des volontaires », qui réunit des pays soutenant l’Ukraine, ses coprésidents ont appelé à un cessez-le-feu complet et immédiat et à la reprise de négociations directes entre l’Ukraine et la Russie. Ils prévoient, une fois un cessez-le-feu entré en vigueur, des garanties de sécurité « défensives par nature » et une aide militaire de long terme. Une force multinationale se tient prête à apporter à l’Ukraine, à sa demande et une fois un cessez-le-feu crédible en place, une réassurance sur son territoire, sur terre, dans les airs et en mer.",
            "source": {
              "title": "Déterminés à accélérer les progrès vers la paix : déclaration des coprésidents de la Coalition des volontaires",
              "url": "https://www.elysee.fr/emmanuel-macron/2026/07/13/determines-a-accelerer-les-progres-vers-la-paix-declaration-des-copresidents-de-la-coalition-des-volontaires",
              "date": "2026-07-13",
              "publisher": "Présidence de la République (elysee.fr)"
            }
          },
          {
            "text": "La France et la Russie sont toutes deux membres permanents du Conseil de sécurité de l’ONU. Le vote négatif d’un seul des cinq membres permanents suffit à bloquer une résolution.",
            "source": {
              "title": "Vote | Conseil de sécurité",
              "url": "https://main.un.org/securitycouncil/fr/content/voting-system",
              "publisher": "Nations unies, Conseil de sécurité"
            }
          }
        ],
        "figures": [
          {
            "value": "17 257 tués, 53 693 blessés",
            "label": "Civils tués et blessés en Ukraine depuis le 24 février 2022, vérifiés par la mission de l’ONU. De janvier à août 2026 : 2 222 tués et 13 058 blessés, contre 1 694 tués et 8 165 blessés sur la même période de 2025, soit 55 % de plus. En août 2026, les missiles et drones à longue portée ont causé 47 % des victimes civiles, surtout dans des villes éloignées du front. Selon la mission, le bilan réel est probablement bien plus élevé, faute d’accès à certaines zones.",
            "date": "Du 24 février 2022 à fin août 2026",
            "source": {
              "title": "Ukraine – Protection of civilians in armed conflict, August 2026 update (PDF)",
              "url": "https://ukraine.ohchr.org/sites/default/files/2026-09/Ukraine%20-%20protection%20of%20civilians%20in%20armed%20conflict%20%28August%29_ENG.pdf",
              "date": "2026-09-16",
              "publisher": "Mission de surveillance des droits de l’homme des Nations unies en Ukraine (HCDH)"
            },
            "chart": {
              "kind": "compare",
              "unit": "civils",
              "items": [
                {
                  "label": "Tués, janv.-août 2025",
                  "value": 1694
                },
                {
                  "label": "Tués, janv.-août 2026",
                  "value": 2222
                },
                {
                  "label": "Blessés, janv.-août 2025",
                  "value": 8165
                },
                {
                  "label": "Blessés, janv.-août 2026",
                  "value": 13058
                }
              ]
            }
          },
          {
            "value": "228,7 Md€",
            "label": "Soutien total de l’UE à l’Ukraine depuis 2022, selon la Commission. Il comprend 114,4 Md€ financés ou garantis par le budget de l’UE, 77,9 Md€ d’aide militaire, jusqu’à 17 Md€ pour l’accueil des Ukrainiens dans l’UE, 15,5 Md€ de soutien des États membres et 3,8 Md€ tirés des revenus des avoirs russes immobilisés.",
            "date": "Page mise à jour le 7 octobre 2026",
            "source": {
              "title": "Aide de l’UE à l’Ukraine",
              "url": "https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine_fr",
              "date": "2026-10-07",
              "publisher": "Commission européenne"
            },
            "chart": {
              "kind": "part",
              "value": 114.4,
              "total": 228.7,
              "unit": "Md€",
              "whole": "du soutien total de l’UE à l’Ukraine"
            }
          },
          {
            "value": "6,5 Md€",
            "label": "Soutien militaire de la France à l’Ukraine, estimé par le ministère des Armées. Il comprend la part française du financement de la Facilité européenne pour la paix, un mécanisme alimenté par les États membres de l’UE : environ 18 % de leurs engagements, soit jusqu’à 2,1 Md€ sur toute la période. Plus de 22 000 soldats ukrainiens ont été formés par les armées françaises, en Pologne et en France.",
            "date": "Du 24 février 2022 au 31 décembre 2025",
            "source": {
              "title": "Rapport au Parlement 2026 sur les exportations d’armement de la France (p. 34, « Mesures en faveur de l’Ukraine »)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/304339_0.pdf",
              "date": "2026-08",
              "publisher": "Ministère des Armées et des Anciens combattants (publié sur vie-publique.fr)"
            }
          },
          {
            "value": "4 363 130",
            "label": "Ukrainiens sous protection temporaire dans l’UE, dont 47 215 en France (définition française légèrement différente, selon Eurostat).",
            "date": "Fin juillet 2026",
            "source": {
              "title": "Personnes bénéficiant d’une protection temporaire à la fin du mois par nationalité, âge et sexe (migr_asytpsm)",
              "url": "https://ec.europa.eu/eurostat/databrowser/view/migr_asytpsm/default/table?lang=fr",
              "date": "2026-10-07",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "part",
              "value": 47215,
              "total": 4363130,
              "whole": "Ukrainiens protégés dans l’UE"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ukraine_russie-1-a",
          "text": "Augmenter fortement l’aide militaire à l’Ukraine, défense aérienne comprise, en la finançant par les avoirs russes gelés"
        },
        {
          "id": "ukraine_russie-1-b",
          "text": "Continuer l’aide militaire et financière à l’Ukraine tant que la Russie refuse de négocier une paix durable"
        },
        {
          "id": "ukraine_russie-1-c",
          "text": "Donner la priorité à une négociation de paix immédiate plutôt qu’à l’effort militaire, la France servant de médiatrice"
        },
        {
          "id": "ukraine_russie-1-d",
          "text": "Arrêter l’aide financière à l’Ukraine pour raisons budgétaires, en gardant la formation de ses soldats et l’aide en matériel"
        },
        {
          "id": "ukraine_russie-1-e",
          "text": "Arrêter dès le début du mandat toute aide financière et militaire de la France à l’Ukraine, matériel compris"
        },
        {
          "id": "ukraine_russie-1-f",
          "text": "Refuser de soutenir militairement l’un ou l’autre camp et appeler les travailleurs russes et ukrainiens à s’unir contre la guerre"
        },
        {
          "id": "ukraine_russie-1-g",
          "text": "Continuer d’aider l’Ukraine à se défendre tout en réunissant une conférence de paix sous l’égide des Nations unies"
        },
        {
          "id": "ukraine_russie-1-h",
          "text": "Garantir la sécurité de l’Ukraine après un cessez-le-feu, avec une force européenne déployée sur son sol"
        }
      ]
    },
    {
      "id": "ukraine_russie-2",
      "topicId": "ukraine_russie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle relation avoir avec la Russie ?",
      "context": "Aujourd’hui : l’Union européenne applique des sanctions économiques contre la Russie, renforcées depuis l’invasion de l’Ukraine en 2022.",
      "explainer": {
        "summary": "Depuis l’invasion de l’Ukraine par la Russie en février 2022, l’Union européenne a adopté des sanctions de plus en plus larges contre la Russie et fortement réduit ses échanges avec elle, y compris pour l’énergie. Les uns veulent maintenir les sanctions jusqu’à une paix acceptée par l’Ukraine ; d’autres veulent rouvrir un dialogue avec Moscou, obtenir un cessez-le-feu sous l’égide de l’ONU, lever les sanctions pour renouer un partenariat, ou ne soutenir aucun des deux gouvernements.",
        "points": [
          {
            "text": "L’UE a adopté 21 « paquets » de sanctions contre la Russie depuis le 23 février 2022, le dernier le 23 juillet 2026. Ils combinent des sanctions individuelles (gel des avoirs, interdiction de voyager), des restrictions commerciales, financières, énergétiques et de transport, et le blocage des réserves de la Banque centrale de Russie.",
            "source": {
              "title": "Sanctions adopted following Russia’s military aggression against Ukraine",
              "url": "https://finance.ec.europa.eu/eu-and-world/sanctions-restrictive-measures/sanctions-adopted-following-russias-military-aggression-against-ukraine_en",
              "date": "2026-07-23",
              "publisher": "Commission européenne, DG Stabilité financière (FISMA)"
            }
          },
          {
            "text": "À l’ONU, le Conseil de sécurité a la « responsabilité principale du maintien de la paix et de la sécurité internationales » (article 24 de la Charte). La France et l’URSS, dont la Russie occupe aujourd’hui le siège, en sont membres permanents (article 23). Hors questions de procédure, ses décisions exigent les voix de tous les membres permanents (article 27) : chacun peut donc opposer son veto.",
            "source": {
              "title": "Charte des Nations unies – Chapitre V : Le Conseil de sécurité (articles 23, 24 et 27)",
              "url": "https://www.un.org/fr/about-us/un-charter/chapter-5",
              "publisher": "Nations unies"
            }
          },
          {
            "text": "Le 7 juin 2026, les dirigeants de la France, du Royaume-Uni, de l’Allemagne et de l’Ukraine ont appelé le président russe à accepter un cessez-le-feu immédiat et complet. Selon eux, la ligne de contact actuelle doit servir de point de départ aux négociations, et les avoirs russes doivent rester immobilisés jusqu’à ce que la Russie cesse sa guerre et indemnise l’Ukraine. Ils soutiennent un dialogue direct entre l’Ukraine et la Russie, avec la participation des États-Unis et de l’Europe.",
            "source": {
              "title": "Déclaration conjointe des dirigeants de la France, du Royaume-Uni, de l’Allemagne et de l’Ukraine",
              "url": "https://www.elysee.fr/emmanuel-macron/2026/06/07/declaration-conjointe-des-dirigeants-de-la-france-du-royaume-uni-de-lallemagne-et-de-lukraine",
              "date": "2026-06-07",
              "publisher": "Présidence de la République"
            }
          }
        ],
        "figures": [
          {
            "value": "210 Md€",
            "label": "Avoirs de la Banque centrale de Russie immobilisés dans l’UE, sur 260 Md€ dans le monde. Fin mai 2026, plus de 2 700 personnes et entités figuraient sur la liste des sanctions de l’UE. Depuis 2014, les sommets UE-Russie et les dialogues institutionnels prévus par leur accord de partenariat sont suspendus.",
            "date": "Mai 2026",
            "source": {
              "title": "La Russie – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/177/la-russie",
              "date": "2026-05",
              "publisher": "Parlement européen"
            },
            "chart": {
              "kind": "part",
              "value": 210,
              "total": 260,
              "unit": "Md€",
              "whole": "d’avoirs immobilisés dans le monde"
            }
          },
          {
            "value": "1,1 %",
            "label": "Part de la Russie dans les importations de biens de l’UE venues du reste du monde (27,9 Md€), contre 7,7 % en 2021 (163,6 Md€). Côté exportations de l’UE : 1,1 % en 2025, contre 4,1 % en 2021.",
            "date": "2025",
            "source": {
              "title": "Commerce extra-UE par partenaire (ext_lt_maineu) – UE à 27 / Russie, 2021 et 2025",
              "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/ext_lt_maineu?format=JSON&lang=FR&geo=EU27_2020&partner=RU&time=2021&time=2025",
              "date": "2026-09-15",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2021",
                  "value": 7.7
                },
                {
                  "label": "2025",
                  "value": 1.1
                }
              ]
            }
          },
          {
            "value": "10,2 %",
            "label": "Part de la Russie dans les importations de gaz naturel par gazoduc de l’UE, contre 51,2 % pour la Norvège. Pour le gaz naturel liquéfié (GNL), la part russe est passée de 21,2 % au 1er trimestre 2021 à 17,3 %, et celle des États-Unis de 24,1 % à 63,2 %. Pour le pétrole, la part russe est tombée à 1,0 %. Jusqu’à fin 2021, la Russie était le premier fournisseur de pétrole et de gaz de l’UE.",
            "date": "2e trimestre 2026",
            "source": {
              "title": "EU imports of energy products – latest developments",
              "url": "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=EU_imports_of_energy_products_-_latest_developments",
              "date": "2026-09",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Russie",
                  "value": 10.2
                },
                {
                  "label": "Norvège",
                  "value": 51.2
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ukraine_russie-2-a",
          "text": "Maintenir les sanctions contre la Russie et laisser l’Ukraine fixer elle-même les conditions de la paix"
        },
        {
          "id": "ukraine_russie-2-b",
          "text": "Soutenir l’Ukraine tout en rouvrant un dialogue régulier avec Moscou, comme pendant la guerre froide"
        },
        {
          "id": "ukraine_russie-2-c",
          "text": "Obtenir un cessez-le-feu sous l’égide des Nations unies, puis bâtir un système de sécurité européen qui inclue la Russie"
        },
        {
          "id": "ukraine_russie-2-d",
          "text": "Rester neutre dans ce conflit, lever les sanctions contre la Russie et renouer un partenariat avec elle, notamment pour l’énergie"
        },
        {
          "id": "ukraine_russie-2-e",
          "text": "Refuser de soutenir l’un ou l’autre gouvernement et appeler les travailleurs russes et ukrainiens à rejeter la guerre"
        }
      ]
    },
    {
      "id": "proche_orient-1",
      "topicId": "proche_orient",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle politique mener envers le gouvernement israélien ?",
      "context": "Aujourd’hui : la guerre à Gaza, déclenchée par l’attaque du Hamas du 7 octobre 2023, a fait plusieurs dizaines de milliers de morts ; un cessez-le-feu est entré en vigueur en octobre 2025, suivi de la libération des otages encore en vie ; un accord d’association appliqué depuis 2000 encadre les échanges commerciaux et politiques entre l’Union européenne et Israël.",
      "explainer": {
        "summary": "Faut-il faire pression sur le gouvernement israélien, ou maintenir la coopération avec Israël, sans sanctions, en misant sur le plan de paix pour Gaza et le désarmement du Hamas ? Pour faire pression, les approches diffèrent par l’outil (armes, accord entre l’UE et Israël, mesures contre la colonisation, justice internationale, ONU), par la cible (le pays, ses dirigeants ou les acteurs de la colonisation) et par l’instance qui décide : la France seule, les Vingt-Sept ou le Conseil de sécurité de l’ONU.",
        "points": [
          {
            "text": "Lors de l’attaque du 7 octobre 2023, plus de 1 200 Israéliens et ressortissants étrangers ont été tués et 251 personnes prises en otage. Selon le ministère de la Santé de Gaza, cité par l’ONU le 5 octobre 2026, la guerre qui a suivi a fait plus de 74 000 morts dans la bande de Gaza. L’accord de cessez-le-feu du 10 octobre 2025 a permis, au terme de sa première phase, la libération des derniers otages israéliens, en échange de prisonniers palestiniens. Sa deuxième phase devait organiser le désarmement du Hamas, le retrait progressif des forces israéliennes, une nouvelle gouvernance palestinienne et la reconstruction de Gaza ; selon l’ONU, ces chantiers restent largement bloqués.",
            "source": {
              "title": "7-Octobre : trois ans après, Guterres appelle à transformer un cessez-le-feu inachevé en paix durable",
              "url": "https://news.un.org/fr/story/2026/10/1159611",
              "date": "2026-10-05",
              "publisher": "ONU Info (Nations unies)"
            }
          },
          {
            "text": "Selon le ministère des Armées, la France a livré à Israël 19,8 M€ de matériels militaires en 2025, soit 0,2 % de ses livraisons dans le monde. Le ministère affirme que la France « ne livre pas d’armes à Israël » et se limite à des composants : un tiers pour des matériels défensifs, deux tiers pour des matériels réexportés vers des pays tiers. Le montant autorisé par les licences d’exportation vers Israël, 119 M€, a baissé de 69 % par rapport à 2024.",
            "source": {
              "title": "Rapport au Parlement 2026 sur les exportations d’armement de la France (p. 60, « Diminution tendancielle des flux vers Israël »)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/304339_0.pdf",
              "date": "2026-08",
              "publisher": "Ministère des Armées et des Anciens combattants (publié sur vie-publique.fr)"
            }
          },
          {
            "text": "L’accord d’association entre l’UE et Israël fait du respect des droits de l’homme un « élément essentiel » (article 2). En juin 2025, un réexamen européen a relevé des éléments indiquant qu’Israël violerait cet article. En septembre 2025, la Commission a proposé de suspendre certaines concessions commerciales : les produits israéliens perdraient leur accès préférentiel au marché européen. Cette mesure se décide à la majorité qualifiée, où aucun État ne peut bloquer seul ; les sanctions proposées en même temps, visant des ministres israéliens, des colons violents et des membres du bureau politique du Hamas, exigent l’unanimité.",
            "source": {
              "title": "La Commission propose des sanctions et la suspension des concessions commerciales avec Israël",
              "url": "https://france.representation.ec.europa.eu/informations-et-evenements/informations/la-commission-propose-des-sanctions-et-la-suspension-des-concessions-commerciales-avec-israel-2025-09-17_fr",
              "date": "2025-09-17",
              "publisher": "Commission européenne – Représentation en France"
            }
          },
          {
            "text": "Le 19 juillet 2024, dans un avis consultatif non contraignant, la Cour internationale de justice a jugé illicite la présence continue d’Israël dans le Territoire palestinien occupé. Selon elle, Israël doit cesser toute nouvelle activité de colonisation, et les États ne doivent ni reconnaître cette situation comme licite ni aider à la maintenir. Selon la presse, Israël a rejeté cet avis, qu’il juge « fondamentalement erroné ».",
            "source": {
              "title": "La CIJ déclare que l’occupation des territoires palestiniens par Israël viole le droit international",
              "url": "https://news.un.org/fr/story/2024/07/1147211",
              "date": "2024-07-19",
              "publisher": "ONU Info (Nations unies)"
            }
          },
          {
            "text": "Le 21 novembre 2024, la Cour pénale internationale (CPI) a émis des mandats d’arrêt contre le Premier ministre israélien et son ancien ministre de la Défense, pour des crimes de guerre et des crimes contre l’humanité présumés commis dans le cadre de la guerre à Gaza. Elle en a émis un autre contre le chef de la branche armée du Hamas, pour des crimes présumés commis à partir du 7 octobre 2023 ; Israël avait affirmé en août 2024 l’avoir tué. Israël conteste la compétence de la Cour.",
            "source": {
              "title": "Gaza : la CPI émet des mandats d’arrêt contre les Israéliens Nétanyahou et Gallant et Deif du Hamas",
              "url": "https://news.un.org/fr/story/2024/11/1150771",
              "date": "2024-11-21",
              "publisher": "ONU Info (Nations unies)"
            }
          }
        ],
        "figures": [
          {
            "value": "31,7 %",
            "label": "Part de l’UE dans le commerce de biens d’Israël, dont elle est le premier partenaire commercial. Les échanges de biens atteignent 43,3 Md€ : 28 Md€ d’exportations de l’UE vers Israël et 15,3 Md€ d’importations. À l’inverse, Israël pèse près de 0,8 % du commerce de biens de l’UE (27e partenaire).",
            "date": "2025",
            "source": {
              "title": "EU trade relations with Israel",
              "url": "https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/israel_en",
              "date": "2026",
              "publisher": "Commission européenne – DG Commerce"
            },
            "chart": {
              "kind": "part",
              "value": 31.7,
              "total": 100,
              "unit": "%",
              "whole": "du commerce de biens d’Israël"
            }
          },
          {
            "value": "3 personnes et 4 entités",
            "label": "Dirigeants et organisations liés à la colonisation israélienne en Cisjordanie, ajoutés par l’UE à la liste de son régime de sanctions en matière de droits de l’homme. Le 19 mars 2026, le Conseil européen avait condamné « la violence persistante et croissante des colons contre les civils palestiniens ».",
            "date": "28 mai 2026",
            "source": {
              "title": "Décision (PESC) 2026/1176 du Conseil du 28 mai 2026 modifiant la décision (PESC) 2020/1999 concernant des mesures restrictives en réaction aux graves violations des droits de l’homme et aux graves atteintes à ces droits",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32026D1176",
              "date": "2026-05-28",
              "publisher": "EUR-Lex – Journal officiel de l’Union européenne"
            }
          },
          {
            "value": "14 voix contre 1",
            "label": "Vote au Conseil de sécurité de l’ONU sur un projet de résolution exigeant un cessez-le-feu à Gaza. Le texte a été rejeté : la voix contre était celle des États-Unis, membre permanent, qui ont jugé qu’il « ne reconnaît pas le droit d’Israël à se défendre ». Le vote contre d’un seul des cinq membres permanents (Chine, États-Unis, France, Royaume-Uni, Russie) suffit à bloquer une résolution.",
            "date": "18 septembre 2025",
            "source": {
              "title": "La 10.000e réunion du Conseil de sécurité marquée par un veto américain",
              "url": "https://news.un.org/fr/story/2025/09/1157508",
              "date": "2025-09-18",
              "publisher": "ONU Info (Nations unies)"
            },
            "chart": {
              "kind": "compare",
              "unit": "voix",
              "items": [
                {
                  "label": "Pour",
                  "value": 14
                },
                {
                  "label": "Contre",
                  "value": 1
                }
              ]
            }
          },
          {
            "value": "13 voix pour, 0 contre",
            "label": "Vote au Conseil de sécurité de l’ONU sur la résolution 2803, qui approuve le plan de paix pour Gaza présenté par les États-Unis, avec 2 abstentions (Chine, Russie). Elle autorise jusqu’au 31 décembre 2027 une force internationale de stabilisation temporaire ; l’armée israélienne doit se retirer de Gaza, hors un périmètre de sécurité, par étapes liées à la démilitarisation de Gaza. L’abstention d’un membre permanent ne bloque pas une résolution.",
            "date": "17 novembre 2025",
            "source": {
              "title": "Security Council Authorizes International Stabilization Force in Gaza, Adopting Resolution 2803 (2025) (SC/16225)",
              "url": "https://press.un.org/en/2025/sc16225.doc.htm",
              "date": "2025-11-17",
              "publisher": "Nations unies – Couverture des réunions"
            },
            "chart": {
              "kind": "compare",
              "unit": "voix",
              "items": [
                {
                  "label": "Pour",
                  "value": 13
                },
                {
                  "label": "Contre",
                  "value": 0
                },
                {
                  "label": "Abstentions",
                  "value": 2
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "proche_orient-1-a",
          "text": "Décréter un embargo sur les armes vers Israël, suspendre l’accord d’association et adopter des sanctions économiques"
        },
        {
          "id": "proche_orient-1-b",
          "text": "Suspendre l’accord d’association entre l’Union européenne et Israël et interdire les produits des colonies israéliennes"
        },
        {
          "id": "proche_orient-1-c",
          "text": "Utiliser les clauses commerciales de l’accord avec Israël pour viser son gouvernement, sans suspendre l’accord"
        },
        {
          "id": "proche_orient-1-d",
          "text": "Faire appliquer les mandats d’arrêt de la Cour pénale internationale et saisir le Conseil de sécurité des Nations unies"
        },
        {
          "id": "proche_orient-1-e",
          "text": "Mettre fin à tout soutien économique et militaire de la France à Israël et retirer les forces françaises de la région"
        },
        {
          "id": "proche_orient-1-f",
          "text": "Défendre le droit d’Israël à se défendre et faire du désarmement du Hamas le préalable à la paix"
        },
        {
          "id": "proche_orient-1-g",
          "text": "Sanctionner individuellement les colons violents et les ministres israéliens qui les soutiennent, sans suspendre l’accord d’association",
          "external": true
        },
        {
          "id": "proche_orient-1-h",
          "text": "Maintenir l’accord d’association et la coopération avec Israël, sans sanctions, en soutenant le plan de paix pour Gaza"
        }
      ]
    },
    {
      "id": "proche_orient-2",
      "topicId": "proche_orient",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle position sur l’État de Palestine ?",
      "context": "Aujourd’hui : la France a reconnu l’État de Palestine le 22 septembre 2025, aux Nations unies.",
      "explainer": {
        "summary": "La reconnaissance de l’État de Palestine par la France, en même temps que dix autres pays occidentaux, divise sur son opportunité comme sur ses suites. Les uns veulent en faire un levier pour mettre fin à l’occupation et à la colonisation, d’autres la lier à la sécurité d’Israël et à la mise à l’écart du Hamas ; d’autres encore la jugent prématurée, ou préfèrent à la solution à deux États un État unique ou une fédération.",
        "points": [
          {
            "text": "La reconnaissance française s’inscrit dans la Déclaration de New York, adoptée à l’Assemblée générale de l’ONU le 12 septembre 2025. Ce texte prévoit un État de Palestine souverain et indépendant, aux côtés d’Israël, dans la paix et la sécurité. Il demande aussi le désarmement du Hamas et son exclusion de toute gouvernance future à Gaza, la remise des otages (finalisée en janvier 2026) et des garanties de sécurité collectives intégrant Israël. Il prend acte de l’engagement du président de l’Autorité palestinienne (lettre du 9 juin 2025) à tenir des élections générales sous supervision internationale dans un délai d’un an.",
            "source": {
              "title": "Comprendre la reconnaissance par la France de l’État de Palestine",
              "url": "https://www.diplomatie.gouv.fr/fr/le-ministere-en-action/agir-pour-la-paix-et-le-respect-des-droits-de-l-homme/agir-pour-la-securite-le-desarmement-et-la-non-proliferation/crises-et-conflits/comprendre-la-reconnaissance-par-la-france-de-l-etat-de-palestine",
              "date": "2026-09-21",
              "publisher": "Ministère de l’Europe et des Affaires étrangères (France Diplomatie)"
            }
          },
          {
            "text": "Le 24 septembre 2026, à l’ONU, le président de l’Autorité palestinienne a promis un État palestinien démilitarisé, vivant en paix aux côtés d’Israël. Il a confirmé des élections législatives le 28 novembre 2026, les premières depuis 2006. Selon ONU Info, leur tenue reste incertaine, en raison de divisions au sein de son propre parti, de l’opposition du Hamas à Gaza et d’obstacles importants à l’organisation du scrutin dans ce territoire. Le Premier ministre israélien a affirmé de son côté que le conflit « ne concerne pas les territoires » mais « l’existence d’un État juif, quelles que soient ses frontières ».",
            "source": {
              "title": "À l’ONU, le dialogue impossible entre Abbas et Nétanyahou",
              "url": "https://news.un.org/fr/story/2026/09/1159547",
              "date": "2026-09-24",
              "publisher": "ONU Info (Nations unies)"
            }
          },
          {
            "text": "Le 19 juillet 2024, la Cour internationale de justice a rendu un avis consultatif, non contraignant. Elle juge illicite la présence continue d’Israël dans le Territoire palestinien occupé (notamment la Cisjordanie, Gaza et Jérusalem-Est). Selon elle, Israël doit y mettre fin « dans les plus brefs délais » et cesser immédiatement toute nouvelle activité de colonisation. Israël a rejeté cet avis, qu’il juge « fondamentalement erroné ».",
            "source": {
              "title": "La CIJ déclare que l’occupation des territoires palestiniens par Israël viole le droit international",
              "url": "https://news.un.org/fr/story/2024/07/1147211",
              "date": "2024-07-19",
              "publisher": "ONU Info (Nations unies)"
            }
          }
        ],
        "figures": [
          {
            "value": "142 voix pour",
            "label": "à l’Assemblée générale de l’ONU pour la Déclaration de New York : deux États vivant côte à côte, et un Hamas qui cesse d’exercer son autorité sur Gaza et remet ses armes à l’Autorité palestinienne. Contre : 10 États, dont Israël et les États-Unis ; abstentions : 12.",
            "date": "12 septembre 2025",
            "source": {
              "title": "Israël-Palestine : l’Assemblée générale tente de relancer la solution à deux États",
              "url": "https://news.un.org/fr/story/2025/09/1157458",
              "date": "2025-09-12",
              "publisher": "ONU Info (Nations unies)"
            },
            "chart": {
              "kind": "compare",
              "items": [
                {
                  "label": "Pour",
                  "value": 142
                },
                {
                  "label": "Contre",
                  "value": 10
                },
                {
                  "label": "Abstentions",
                  "value": 12
                }
              ]
            }
          },
          {
            "value": "11 pays",
            "label": "occidentaux, dont la France, ont reconnu l’État de Palestine en deux jours. Ils s’ajoutent aux 147 États qui le reconnaissaient déjà, sur les 193 membres de l’ONU. Depuis 2012, la Palestine est un « État non membre observateur » de l’ONU. Quatre des cinq membres permanents du Conseil de sécurité la reconnaissent désormais (France, Royaume-Uni, Chine, Russie), mais pas les États-Unis.",
            "date": "21-22 septembre 2025",
            "source": {
              "title": "La France et plusieurs autres pays occidentaux reconnaissent l’État de Palestine à l’ONU",
              "url": "https://news.un.org/fr/story/2025/09/1157534",
              "date": "2025-09-22",
              "publisher": "ONU Info (Nations unies)"
            }
          },
          {
            "value": "plus de 27 900",
            "label": "logements de colonisation approuvés par les autorités israéliennes en 2025, contre 12 349 en 2023, selon le ministère français de l’Europe et des Affaires étrangères",
            "date": "2025",
            "source": {
              "title": "Israël / Palestine : 8 clés pour comprendre la position de la France",
              "url": "https://www.diplomatie.gouv.fr/fr/priorites-et-actions/grands-dossiers/l-action-humanitaire-de-la-france-en-palestine/israel-palestine-8-cles-pour-comprendre-la-position-de-la-france",
              "date": "2026-09-22",
              "publisher": "Ministère de l’Europe et des Affaires étrangères (France Diplomatie)"
            },
            "chart": {
              "kind": "series",
              "unit": "logements",
              "items": [
                {
                  "label": "2023",
                  "value": 12349
                },
                {
                  "label": "2025",
                  "value": 27900
                }
              ]
            }
          },
          {
            "value": "251",
            "label": "personnes enlevées lors de l’attaque menée par le Hamas et d’autres groupes armés palestiniens le 7 octobre 2023, qui a fait environ 1 200 morts. Le cessez-le-feu entré en vigueur le 10 octobre 2025 a permis le retour des derniers otages. En octobre 2026, aucun otage, vivant ou mort, ne se trouve plus à Gaza.",
            "date": "7 octobre 2023 (bilan rappelé le 6 octobre 2026)",
            "source": {
              "title": "7-Octobre : à l’ONU, Israël commémore ses morts sur fond de fortes tensions avec l’institution",
              "url": "https://news.un.org/fr/story/2026/10/1159617",
              "date": "2026-10-06",
              "publisher": "ONU Info (Nations unies)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "proche_orient-2-a",
          "text": "Approuver cette reconnaissance comme une première étape et exiger la fin de l’occupation et de la colonisation"
        },
        {
          "id": "proche_orient-2-b",
          "text": "Approuver cette reconnaissance en liant l’État palestinien à la sécurité d’Israël et à la mise à l’écart du Hamas"
        },
        {
          "id": "proche_orient-2-c",
          "text": "Juger cette reconnaissance prématurée, décidée avant la libération des otages et alors que le Hamas restait actif"
        },
        {
          "id": "proche_orient-2-d",
          "text": "Défendre un État unique ou une fédération sur toute la région, avec les mêmes droits pour tous ses habitants"
        }
      ]
    },
    {
      "id": "defense-1",
      "topicId": "defense",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quelle place pour la France dans l’OTAN ?",
      "context": "Aujourd’hui : la France est membre de l’Alliance atlantique (OTAN) et a réintégré son commandement militaire intégré en 2009.",
      "explainer": {
        "summary": "Membre de l’Alliance atlantique depuis sa fondation en 1949, la France participe aujourd’hui à toutes ses structures militaires, sauf au groupe chargé des plans nucléaires. Le débat met en balance la défense collective prévue par le traité, la dépendance envers les États-Unis et l’indépendance de décision du pays ; les options vont du maintien plein dans l’OTAN au refus de toute alliance militaire.",
        "points": [
          {
            "text": "Selon l’article 5 du traité de l’Atlantique Nord, une attaque armée contre un allié en Europe ou en Amérique du Nord est considérée comme dirigée contre tous. Chaque allié aide alors l’allié attaqué par l’action qu’il juge nécessaire, y compris la force armée. L’article 13 permet à un État de quitter le traité un an après avoir notifié son retrait au gouvernement des États-Unis.",
            "source": {
              "title": "Le Traité de l’Atlantique Nord",
              "url": "https://www.nato.int/fr/about-us/official-texts-and-resources/official-texts/1949/04/04/the-north-atlantic-treaty",
              "date": "1949-04-04",
              "publisher": "OTAN"
            }
          },
          {
            "text": "En 1966, la France a quitté la structure militaire intégrée de l’OTAN (ses commandements communs) tout en restant membre de l’Alliance : ses forces ont quitté les commandements alliés et le siège de l’OTAN a été transféré en Belgique. En 2009, elle a annoncé sa pleine participation, sans rejoindre le Groupe des plans nucléaires. À l’OTAN, les décisions se prennent par consensus entre tous les pays membres.",
            "source": {
              "title": "Pays membres de l’OTAN",
              "url": "https://www.nato.int/fr/about-us/organization/nato-member-countries",
              "date": "2024-03-11",
              "publisher": "OTAN"
            }
          },
          {
            "text": "Selon l’OTAN, l’Alliance dépend des États-Unis pour certaines capacités essentielles : renseignement, surveillance et reconnaissance, ravitaillement en vol, défense antimissile balistique et guerre électromagnétique aérienne. L’OTAN précise aussi que les dépenses militaires américaines couvrent des engagements hors de la zone euro-atlantique.",
            "source": {
              "title": "Le financement de l’OTAN",
              "url": "https://www.nato.int/fr/what-we-do/introduction-to-nato/funding-nato",
              "date": "2026-04-14",
              "publisher": "OTAN"
            }
          }
        ],
        "figures": [
          {
            "value": "32 pays",
            "label": "Membres de l’OTAN : 29 pays européens, plus la Turquie, le Canada et les États-Unis. Quatre États de l’Union européenne n’en font pas partie : l’Irlande, l’Autriche, Malte et Chypre.",
            "date": "2025 (rapport du 24 novembre 2025)",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Défense – Rapport général n° 139 (2025-2026), tome III, annexe 8",
              "url": "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "part",
              "value": 29,
              "total": 32,
              "whole": "pays membres de l’OTAN"
            }
          },
          {
            "value": "5 % du PIB en 2035",
            "label": "Objectif adopté par les 32 pays de l’OTAN : 3,5 % du PIB pour la défense elle-même et 1,5 % pour la résilience et l’innovation en matière de sécurité. L’objectif précédent était de 2 %.",
            "date": "Sommet de La Haye, 24-25 juin 2025",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Défense – Rapport général n° 139 (2025-2026), tome III, annexe 8",
              "url": "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "Objectif précédent",
                  "value": 2
                },
                {
                  "label": "2035 : défense seule",
                  "value": 3.5
                },
                {
                  "label": "2035 : défense et résilience",
                  "value": 5
                }
              ]
            }
          },
          {
            "value": "58 %",
            "label": "Part des États-Unis dans les importations d’armes majeures des 29 pays européens de l’OTAN. La Corée du Sud en fournit 8,6 %, Israël 7,7 % et la France 7,4 %.",
            "date": "2021-2025 (publié le 9 mars 2026)",
            "source": {
              "title": "Global arms flows jump nearly 10 per cent as European demand soars",
              "url": "https://www.sipri.org/media/press-release/2026/global-arms-flows-jump-nearly-10-cent-european-demand-soars",
              "date": "2026-03-09",
              "publisher": "SIPRI"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "États-Unis",
                  "value": 58
                },
                {
                  "label": "Corée du Sud",
                  "value": 8.6
                },
                {
                  "label": "Israël",
                  "value": 7.7
                },
                {
                  "label": "France",
                  "value": 7.4
                }
              ]
            }
          },
          {
            "value": "Environ 6,5 %",
            "label": "Dépenses militaires de la France rapportées à celles des États-Unis. Elles représentent 43 % de celles de la Russie, 73 % de celles de l’Allemagne et 79 % de celles du Royaume-Uni. La France est au 4e rang de l’OTAN en volume de dépenses.",
            "date": "2024 (rapport du 24 novembre 2025)",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Défense – Rapport général n° 139 (2025-2026), tome III, annexe 8",
              "url": "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Rapporté aux États-Unis",
                  "value": 6.5
                },
                {
                  "label": "Rapporté à la Russie",
                  "value": 43
                },
                {
                  "label": "Rapporté à l’Allemagne",
                  "value": 73
                },
                {
                  "label": "Rapporté au Royaume-Uni",
                  "value": 79
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "defense-1-a",
          "text": "Rester pleinement dans l’OTAN, y compris dans son commandement intégré, en y donnant plus de poids aux Européens"
        },
        {
          "id": "defense-1-b",
          "text": "Rester dans l’OTAN mais bâtir une défense européenne capable de protéger l’Europe sans les États-Unis"
        },
        {
          "id": "defense-1-c",
          "text": "Quitter le commandement militaire intégré de l’OTAN, comme entre 1966 et 2009, en restant membre de l’Alliance"
        },
        {
          "id": "defense-1-d",
          "text": "Quitter l’OTAN, immédiatement ou par étapes, pour une diplomatie non alignée ou une sécurité collective européenne"
        },
        {
          "id": "defense-1-e",
          "text": "Rejeter à la fois l’OTAN et la défense européenne, au nom du refus de toute alliance militaire entre puissances"
        }
      ]
    },
    {
      "id": "defense-2",
      "topicId": "defense",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel budget pour les armées ?",
      "context": "Aujourd’hui : la loi de programmation militaire actualisée en juillet 2026 ajoute 36 milliards d’euros d’ici 2030 et vise environ 2,5 % du produit intérieur brut (PIB) pour la défense en 2030.",
      "explainer": {
        "summary": "Le budget des armées augmente depuis plusieurs années, et la loi votée en 2026 pour actualiser la programmation militaire prolonge cette hausse jusqu’en 2030. Le débat met en balance, d’un côté, l’évaluation des menaces et les engagements pris à l’OTAN, de l’autre, les autres dépenses publiques et l’état des finances publiques.",
        "points": [
          {
            "text": "Deux mesures coexistent. Les crédits de la « mission Défense » sont votés chaque année dans le budget de l’État. L’effort de défense au sens de l’OTAN est plus large : il compte aussi, par exemple, les pensions des militaires retraités. Les objectifs en pourcentage du PIB fixés à l’OTAN reposent sur cette définition.",
            "source": {
              "title": "Dépenses de défense et engagement des 5 %",
              "url": "https://www.nato.int/fr/what-we-do/introduction-to-nato/defence-expenditures-and-natos-5-commitment",
              "date": "2026-04-14",
              "publisher": "OTAN"
            }
          },
          {
            "text": "En juin 2025, à La Haye, les pays de l’OTAN se sont fixé 3,5 % du PIB pour la défense d’ici 2035, plus 1,5 % pour la résilience et l’innovation. Selon la commission des finances du Sénat, 3,5 % du PIB en 2035 représenterait pour la France un budget de l’ordre de 140 Md€, pensions comprises.",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Défense – Rapport général n° 139 (2025-2026), tome III, annexe 8",
              "url": "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            }
          },
          {
            "text": "Ce budget s’inscrit dans l’ensemble des finances publiques. En 2025, le déficit public de la France atteint 5,1 % du PIB et la dette publique 115,6 % du PIB, contre 3,1 % et 81,7 % pour l’ensemble de l’Union européenne.",
            "source": {
              "title": "Déficit/excédent, dette publique et données associées (gov_10dd_edpt1)",
              "url": "https://ec.europa.eu/eurostat/databrowser/view/gov_10dd_edpt1/default/table?lang=fr",
              "date": "2026-04-22",
              "publisher": "Eurostat"
            }
          }
        ],
        "figures": [
          {
            "value": "75,7 Md€",
            "label": "Crédits de paiement (sommes dépensables dans l’année) de la mission Défense prévus en 2030 par la loi actualisée, hors charges de pensions et à périmètre constant, contre 47,2 Md€ en 2024 et 57,1 Md€ en 2026 ; 63,3 Md€ sont prévus en 2027. La programmation initiale de 2023 visait 67,4 Md€ en 2030.",
            "date": "Loi n° 2026-791 du 16 août 2026",
            "source": {
              "title": "Programmation militaire pour les années 2024 à 2030 – tableau historique du projet de loi",
              "url": "https://www.senat.fr/tableau-historique/pjl25-635.html",
              "date": "2026-08-16",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "series",
              "unit": "Md€",
              "items": [
                {
                  "label": "2024",
                  "value": 47.2
                },
                {
                  "label": "2026",
                  "value": 57.1
                },
                {
                  "label": "2027",
                  "value": 63.3
                },
                {
                  "label": "2030",
                  "value": 75.7
                }
              ]
            }
          },
          {
            "value": "2,22 % du PIB",
            "label": "Dépenses de défense de la France au sens de l’OTAN (estimation, hors volet résilience de 1,5 %), contre 1,82 % en 2014. Ensemble des alliés européens et du Canada : 2,53 % ; États-Unis : 3,17 %.",
            "date": "2026 (estimation, données des alliés au 3 juillet 2026)",
            "source": {
              "title": "Defence Expenditure of NATO Countries (2014-2026)",
              "url": "https://www.nato.int/content/dam/nato/webready/documents/finance/def-exp-2026-en.pdf",
              "date": "2026-07",
              "publisher": "OTAN"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "France",
                  "value": 2.22
                },
                {
                  "label": "Alliés européens et Canada",
                  "value": 2.53
                },
                {
                  "label": "États-Unis",
                  "value": 3.17
                }
              ]
            }
          },
          {
            "value": "Près de 94 Md€",
            "label": "Crédits qu’il aurait fallu inscrire au budget des armées en 2030 pour atteindre 3 % du PIB, selon une estimation du rapporteur de la commission de la défense du Sénat.",
            "date": "Rapport du 27 mai 2026 (estimation pour 2030)",
            "source": {
              "title": "Rapport n° 666 (2025-2026) sur le projet de loi actualisant la programmation militaire pour les années 2024 à 2030",
              "url": "https://www.senat.fr/rap/l25-666/l25-666_mono.html",
              "date": "2026-05-27",
              "publisher": "Sénat, commission des affaires étrangères, de la défense et des forces armées"
            }
          },
          {
            "value": "3,2 %",
            "label": "Part de la défense dans l’ensemble des dépenses publiques en France (État, collectivités, Sécurité sociale), contre 41,5 % pour la protection sociale, 15,6 % pour la santé et 8,9 % pour l’enseignement. Ensemble de l’UE pour la défense : 3,0 %.",
            "date": "2024 (données provisoires pour la France, mise à jour du 16 septembre 2026)",
            "source": {
              "title": "Dépenses des administrations publiques par fonction (COFOG) (gov_10a_exp)",
              "url": "https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=fr",
              "date": "2026-09-16",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Défense",
                  "value": 3.2
                },
                {
                  "label": "Enseignement",
                  "value": 8.9
                },
                {
                  "label": "Santé",
                  "value": 15.6
                },
                {
                  "label": "Protection sociale",
                  "value": 41.5
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "defense-2-a",
          "text": "Porter le budget des armées à au moins 3 % du PIB, soit environ 100 milliards d’euros par an, d’ici la fin du quinquennat"
        },
        {
          "id": "defense-2-b",
          "text": "Porter le budget des armées à environ 2,5 % du PIB en 2030, comme le prévoit la loi votée en 2026"
        },
        {
          "id": "defense-2-c",
          "text": "Renoncer à la hausse de 36 milliards prévue d’ici 2030 et réorienter les crédits vers la défense du territoire, l’espace et le numérique"
        },
        {
          "id": "defense-2-d",
          "text": "Réduire fortement le budget militaire, voire le supprimer, et consacrer cet argent aux services publics"
        }
      ]
    },
    {
      "id": "defense-3",
      "topicId": "defense",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel rôle pour la dissuasion nucléaire française en Europe ?",
      "context": "Aujourd’hui : la France est le seul pays de l’Union européenne doté de l’arme nucléaire, dont le président décide seul l’emploi ; depuis mars 2026, elle associe une dizaine de pays européens à une « dissuasion avancée ».",
      "explainer": {
        "summary": "La dissuasion nucléaire vise à empêcher tout adversaire de s’en prendre aux intérêts vitaux de la France, sous peine de dommages dont il ne pourrait se relever. Des pays européens y sont désormais associés, sans partage de la décision, et le débat porte sur la suite : étendre cette protection aux autres pays de l’Union, dialoguer avec les Européens sur ce qu’elle leur apporte, la réserver à la seule protection de la France sans armes stationnées à l’étranger, la garder en œuvrant à un désarmement négocié entre puissances, ou y renoncer sans attendre.",
        "points": [
          {
            "text": "Le 2 mars 2026, le président de la République a annoncé une « dissuasion avancée » : les pays partenaires pourront participer aux exercices de la dissuasion, et des éléments des forces stratégiques françaises pourront être déployés chez eux selon les circonstances. Il n’y aura « aucun partage de la décision ultime, ni de sa planification, ni de sa mise en œuvre ». Le nombre de têtes nucléaires va augmenter et ne sera plus rendu public.",
            "source": {
              "title": "Déplacement sur la base opérationnelle de l’Île Longue (discours du 2 mars 2026)",
              "url": "https://www.elysee.fr/emmanuel-macron/2026/03/02/deplacement-sur-la-base-operationnelle-de-lile-longue",
              "date": "2026-03-02",
              "publisher": "Présidence de la République (elysee.fr)"
            }
          },
          {
            "text": "Le « partage nucléaire » de l’OTAN repose sur des armes américaines. En 2025, plusieurs États européens, dont l’Allemagne, ont souhaité le compléter par des accords comparables avec la France et le Royaume-Uni.",
            "source": {
              "title": "Communiqué de presse : parution du Sipri Yearbook 2026 (version française, PDF)",
              "url": "https://www.sipri.org/sites/default/files/WNF%202026%20PR%20FRE.pdf",
              "date": "2026-06-08",
              "publisher": "SIPRI"
            }
          },
          {
            "text": "Côté désarmement, le traité New Start entre les États-Unis et la Russie a expiré en février 2026 sans traité de remplacement. La conférence d’examen du traité sur la non-prolifération des armes nucléaires (TNP) s’est achevée le 22 mai 2026 sans document final, pour la troisième fois de suite.",
            "source": {
              "title": "Communiqué de presse : parution du Sipri Yearbook 2026 (version française, PDF)",
              "url": "https://www.sipri.org/sites/default/files/WNF%202026%20PR%20FRE.pdf",
              "date": "2026-06-08",
              "publisher": "SIPRI"
            }
          }
        ],
        "figures": [
          {
            "value": "290 ogives",
            "label": "Stock militaire de la France (ogives utilisables) estimé par le SIPRI, sur environ 9 745 dans le monde ; Royaume-Uni : 225. La Russie et les États-Unis en détiennent environ 83 %. La Chine en a environ 620 et, selon le SIPRI, développe son arsenal plus vite que tout autre pays.",
            "date": "Janvier 2026",
            "source": {
              "title": "Communiqué de presse : parution du Sipri Yearbook 2026 (version française, PDF)",
              "url": "https://www.sipri.org/sites/default/files/WNF%202026%20PR%20FRE.pdf",
              "date": "2026-06-08",
              "publisher": "SIPRI"
            },
            "chart": {
              "kind": "part",
              "value": 290,
              "total": 9745,
              "whole": "ogives dans le monde"
            }
          },
          {
            "value": "7,4 Md€",
            "label": "Crédits de la dissuasion nucléaire prévus pour 2026, soit 11,1 % des crédits de paiement (les dépenses autorisées dans l’année) de la mission Défense, qui atteignent 66,7 Md€ en 2026, pensions comprises.",
            "date": "2026 (projet de loi de finances pour 2026)",
            "source": {
              "title": "Rapport général sur le projet de loi de finances pour 2026 – Mission Défense",
              "url": "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat (commission des finances)"
            },
            "chart": {
              "kind": "part",
              "value": 7.4,
              "total": 66.7,
              "unit": "Md€",
              "whole": "des crédits de paiement de la mission Défense"
            }
          },
          {
            "value": "10 pays",
            "label": "Pays européens associés à la « dissuasion avancée » française : huit ont accepté un partenariat (Royaume-Uni, Allemagne, Pologne, Pays-Bas, Belgique, Grèce, Suède, Danemark), rejoints par la Norvège le 27 mai 2026 puis par la Finlande le 14 septembre 2026.",
            "date": "Au 15 septembre 2026",
            "source": {
              "title": "La dissuasion avancée, une évolution de la doctrine nucléaire française",
              "url": "https://www.vie-publique.fr/en-bref/302309-la-dissuasion-avancee-une-evolution-de-la-doctrine-nucleaire-francaise",
              "date": "2026-09-14",
              "publisher": "Vie publique (DILA)"
            }
          },
          {
            "value": "75 États parties",
            "label": "États parties au traité de l’ONU sur l’interdiction des armes nucléaires, en vigueur depuis le 22 janvier 2021 (96 signataires). Aucun État doté de l’arme nucléaire n’y est partie ; dans l’UE, l’Autriche, l’Irlande et Malte l’ont ratifié.",
            "date": "Au 7 octobre 2026",
            "source": {
              "title": "Traité sur l’interdiction des armes nucléaires – état des signatures et ratifications",
              "url": "https://treaties.un.org/Pages/ViewDetails.aspx?src=TREATY&mtdsg_no=XXVI-9&chapter=26&clang=_fr",
              "date": "2026-10-07",
              "publisher": "Nations unies, Collection des traités"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "defense-3-a",
          "text": "Étendre la protection nucléaire française aux autres pays de l’Union, la France gardant seule la décision"
        },
        {
          "id": "defense-3-b",
          "text": "Garder seule la décision tout en ouvrant un dialogue avec les Européens sur ce que la dissuasion apporte à leur sécurité"
        },
        {
          "id": "defense-3-c",
          "text": "Réserver la dissuasion à la seule protection de la France, sans partage avec d’autres pays ni armes stationnées à l’étranger"
        },
        {
          "id": "defense-3-d",
          "text": "Garder l’arme nucléaire pour l’instant et œuvrer à un désarmement nucléaire négocié entre toutes les puissances"
        },
        {
          "id": "defense-3-e",
          "text": "Renoncer à la dissuasion nucléaire et démanteler l’arsenal français, sans attendre un accord entre puissances"
        }
      ]
    },
    {
      "id": "defense-4",
      "topicId": "defense",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle place pour l’Europe dans la défense de la France ?",
      "context": "Aujourd’hui : l’Union européenne a adopté des programmes communs pour financer l’armement, mais chaque État garde le commandement de ses armées.",
      "explainer": {
        "summary": "Les dépenses militaires augmentent en Europe depuis l’invasion de l’Ukraine par la Russie en 2022, et l’Union européenne a créé des instruments de prêt et de financement pour l’armement. Le débat porte sur la place de l’Europe dans la défense de la France : une défense commune, avec des achats et des financements partagés ; une coopération entre États au cas par cas, la défense restant nationale ; la priorité à l’armée et à l’industrie françaises ; ou le refus de tout réarmement, européen comme national.",
        "points": [
          {
            "text": "Selon le traité sur l’Union européenne (article 42), la politique de sécurité et de défense commune « conduira à une défense commune » seulement si les chefs d’État ou de gouvernement, réunis en Conseil européen, le décident à l’unanimité. Ses décisions se prennent à l’unanimité, avec des moyens civils et militaires fournis par les États. Un État membre agressé sur son territoire doit recevoir des autres « aide et assistance par tous les moyens en leur pouvoir » ; pour les membres de l’OTAN, celle-ci reste le fondement de leur défense collective.",
            "source": {
              "title": "Traité sur l’Union européenne (version consolidée), article 42",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:12016M042",
              "publisher": "EUR-Lex – Journal officiel de l’Union européenne"
            }
          },
          {
            "text": "Avec l’instrument SAFE, l’UE prête aux États jusqu’à 150 Md€, empruntés par la Commission sur les marchés, pour des achats d’armement en principe communs à au moins deux pays. Dix-neuf États, dont la France, ont présenté des plans d’investissement. Au moins 65 % du coût des composants doit venir de l’UE, d’Ukraine ou, sous conditions, de Norvège, d’Islande et du Liechtenstein (Espace économique européen).",
            "source": {
              "title": "SAFE | Security Action for Europe",
              "url": "https://defence-industry-space.ec.europa.eu/eu-defence-industry/safe-security-action-europe_en",
              "publisher": "Commission européenne, DG Industrie de la défense et espace"
            }
          },
          {
            "text": "Le Fonds européen de défense dispose de près de 7,3 Md€ pour 2021-2027. Il finance des projets communs de recherche et de développement d’équipements de défense, menés en principe par des entreprises d’au moins trois États membres ou pays associés (Norvège, Ukraine).",
            "source": {
              "title": "European Defence Fund (EDF) – Official webpage of the European Commission",
              "url": "https://defence-industry-space.ec.europa.eu/eu-defence-industry/european-defence-fund-edf-official-webpage-european-commission_en",
              "publisher": "Commission européenne, DG Industrie de la défense et espace"
            }
          }
        ],
        "figures": [
          {
            "value": "3,5 % du PIB en 2035",
            "label": "Objectif de dépenses militaires adopté par les 32 pays de l’OTAN, contre 2 % jusque-là. S’y ajoute un objectif de 1,5 % du PIB pour la résilience et l’innovation en matière de sécurité et de défense.",
            "date": "Sommet de La Haye, 24-25 juin 2025",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Défense – Rapport général n° 139 (2025-2026), tome III, annexe 8",
              "url": "https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "Objectif précédent",
                  "value": 2
                },
                {
                  "label": "Objectif pour 2035",
                  "value": 3.5
                }
              ]
            }
          },
          {
            "value": "2,22 % du PIB",
            "label": "Dépenses de défense proprement dites de la France au sens de l’OTAN (estimation), contre 1,82 % en 2014. Pour l’ensemble des alliés européens et du Canada : 2,53 %.",
            "date": "2026 (estimation, données arrêtées au 3 juillet 2026)",
            "source": {
              "title": "Defence Investment of NATO Countries (2014-2026)",
              "url": "https://www.nato.int/content/dam/nato/webready/documents/finance/def-exp-2026-en.pdf",
              "date": "2026-07",
              "publisher": "OTAN"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "France, 2014",
                  "value": 1.82
                },
                {
                  "label": "France, 2026",
                  "value": 2.22
                },
                {
                  "label": "Alliés européens et Canada, 2026",
                  "value": 2.53
                }
              ]
            }
          },
          {
            "value": "435,7 Md€",
            "label": "Enveloppe de la loi de programmation militaire 2024-2030, qui fixe les moyens des armées sur sept ans, après la loi d’actualisation du 16 août 2026 (+36 Md€ entre 2026 et 2030). Pour 2027, le projet de loi de finances porte la mission Défense à 63,4 Md€ hors pensions, contre 56,96 Md€ en 2026 (+6,4 Md€). Il gèle en euros courants, c’est-à-dire sans compenser l’inflation, les moyens des autres ministères.",
            "date": "2024-2030 ; projet de loi de finances pour 2027",
            "source": {
              "title": "Budget 2027 – Projet de loi de finances pour 2027 (présentation générale et fiches missions)",
              "url": "https://www.budget.gouv.fr/documentation/file-download/33484",
              "date": "2026",
              "publisher": "Ministère de l’Économie et des Finances – budget.gouv.fr"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Mission Défense 2026",
                  "value": 56.96
                },
                {
                  "label": "Mission Défense 2027 (projet)",
                  "value": 63.4
                }
              ]
            }
          },
          {
            "value": "58 %",
            "label": "Part des États-Unis dans les importations d’armes majeures des 29 pays européens de l’OTAN en 2021-2025, contre 7,4 % pour la France. Ces importations ont augmenté de 143 % par rapport à 2016-2020. La France est le deuxième exportateur mondial d’armes majeures (9,8 % des exportations) ; près de 80 % de ses exportations partent hors d’Europe.",
            "date": "2021-2025 (publié le 9 mars 2026)",
            "source": {
              "title": "Global arms flows jump nearly 10 per cent as European demand soars",
              "url": "https://www.sipri.org/media/press-release/2026/global-arms-flows-jump-nearly-10-cent-european-demand-soars",
              "date": "2026-03-09",
              "publisher": "SIPRI"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "États-Unis",
                  "value": 58
                },
                {
                  "label": "France",
                  "value": 7.4
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "defense-4-a",
          "text": "Bâtir une défense européenne commune, avec des achats d’armement et des financements partagés"
        },
        {
          "id": "defense-4-b",
          "text": "Coopérer entre États au cas par cas, par des traités bilatéraux et des programmes choisis, la défense restant nationale"
        },
        {
          "id": "defense-4-c",
          "text": "Renforcer en priorité l’armée française et refuser les programmes européens au profit d’une industrie nationale"
        },
        {
          "id": "defense-4-d",
          "text": "Refuser tout réarmement, européen comme national, et reconvertir l’industrie d’armement vers d’autres productions"
        }
      ]
    },
    {
      "id": "defense-5",
      "topicId": "defense",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel service national pour les jeunes ?",
      "context": "Aujourd’hui : le service militaire obligatoire est suspendu depuis 1997 ; un service militaire volontaire de dix mois a été lancé en 2026.",
      "explainer": {
        "summary": "Le service militaire obligatoire est suspendu depuis une loi de 1997 mais peut être rétabli par la loi ; un service national militaire fondé sur le volontariat a été créé en 2026. Le débat porte sur les besoins des armées, la cohésion nationale, la liberté de choix des jeunes et le coût : il va du retour d’une obligation, militaire ou civique, au refus de tout service militaire.",
        "points": [
          {
            "text": "La loi de 1997 a suspendu, sans le supprimer, l’appel sous les drapeaux (le service militaire obligatoire) pour les Français nés après le 31 décembre 1978 : il est « rétabli à tout moment par la loi » si la défense de la Nation l’exige. Le recensement et la journée défense et citoyenneté, renommée « journée de mobilisation » en 2026, restent obligatoires ; cette journée accueille près de 800 000 jeunes par an.",
            "source": {
              "title": "Rapport n° 666 (2025-2026) sur le projet de loi actualisant la programmation militaire pour les années 2024 à 2030",
              "url": "https://www.senat.fr/rap/l25-666/l25-666_mono.html",
              "date": "2026-05-27",
              "publisher": "Sénat, commission des affaires étrangères, de la défense et des forces armées"
            }
          },
          {
            "text": "Le nouveau service national est militaire, volontaire et sélectif : dix mois, dont un mois de formation initiale, pour les 18-25 ans, avec des missions uniquement sur le territoire national, en métropole et outre-mer. La solde est d’au moins 800 € brut par mois. Les jeunes rejoignent ensuite la réserve pendant cinq ans, sans période obligatoire à effectuer.",
            "source": {
              "title": "Le service national",
              "url": "https://www.defense.gouv.fr/nous-rejoindre/service-national",
              "publisher": "Ministère des Armées et des Anciens combattants"
            }
          },
          {
            "text": "En Europe, la Lituanie (2015), la Suède (2017) et la Lettonie (2024) ont réintroduit le service militaire, et dix pays, dont l’Autriche, la Finlande et la Suisse, ne l’ont jamais supprimé. La Hongrie (2021), la Pologne (2022), les Pays-Bas (2023) et l’Allemagne (loi du 5 décembre 2025) ont opté pour un service militaire volontaire ; le ministre allemand de la Défense a annoncé qu’un nombre insuffisant de volontaires conduirait à rétablir une forme de service obligatoire.",
            "source": {
              "title": "Rapport n° 666 (2025-2026) sur le projet de loi actualisant la programmation militaire pour les années 2024 à 2030",
              "url": "https://www.senat.fr/rap/l25-666/l25-666_mono.html",
              "date": "2026-05-27",
              "publisher": "Sénat, commission des affaires étrangères, de la défense et des forces armées"
            }
          }
        ],
        "figures": [
          {
            "value": "3 000 appelés en 2026",
            "label": "Jeunes à recruter dans le nouveau service national, puis 4 000 en 2027, 5 000 en 2028, 7 500 en 2029 et 10 000 en 2030. Cible : 50 000 volontaires en 2035. Financement prévu : 2,3 Md€ sur 2026-2030.",
            "date": "Objectifs 2026-2035 du rapport annexé à la loi de programmation (rapport du 27 mai 2026)",
            "source": {
              "title": "Rapport n° 666 (2025-2026) sur le projet de loi actualisant la programmation militaire pour les années 2024 à 2030",
              "url": "https://www.senat.fr/rap/l25-666/l25-666_mono.html",
              "date": "2026-05-27",
              "publisher": "Sénat, commission des affaires étrangères, de la défense et des forces armées"
            },
            "chart": {
              "kind": "series",
              "unit": "appelés",
              "items": [
                {
                  "label": "2026",
                  "value": 3000
                },
                {
                  "label": "2027",
                  "value": 4000
                },
                {
                  "label": "2028",
                  "value": 5000
                },
                {
                  "label": "2029",
                  "value": 7500
                },
                {
                  "label": "2030",
                  "value": 10000
                }
              ]
            }
          },
          {
            "value": "3,5 à 5 Md€",
            "label": "Coût estimé du séjour de cohésion du service national universel (SNU), en hébergement collectif, s’il était étendu à toute une classe d’âge (850 000 jeunes). Le SNU, doté de 160 M€ en 2024 et de 65,9 M€ en 2025, n’avait plus de crédits dans le projet de budget 2026.",
            "date": "Estimation citée en novembre 2025",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Sport, jeunesse et vie associative – Rapport général n° 139 (2025-2026), tome III, annexe 30",
              "url": "https://www.senat.fr/rap/l25-139-330/l25-139-330_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            }
          },
          {
            "value": "Jusqu’à 135 000 jeunes",
            "label": "Volontaires en service civique visés en 2026 par le budget voté, contre 110 000 prévus dans le projet de budget initial. Mission volontaire de 6 à 12 mois, pour les 16-25 ans, indemnisée 620 € par mois.",
            "date": "Budget 2026 (communiqué du 23 février 2026)",
            "source": {
              "title": "Reprise des entrées en mission de Service Civique – L’objectif de 135 000 jeunes confirmé suite à l’adoption du budget",
              "url": "https://www.service-civique.gouv.fr/api/media/assets/document/cp-reprise-des-entrees-en-mission-de-service-civique-23022026.pdf",
              "date": "2026-02-23",
              "publisher": "Agence du Service Civique (groupement d’intérêt public, opérateur de l’État)"
            },
            "chart": {
              "kind": "compare",
              "unit": "jeunes",
              "items": [
                {
                  "label": "Projet de budget initial",
                  "value": 110000
                },
                {
                  "label": "Budget voté",
                  "value": 135000
                }
              ]
            }
          },
          {
            "value": "Environ 47 000",
            "label": "Réservistes des armées, en plus d’environ 201 500 militaires d’active. L’Allemagne compte 60 000 réservistes.",
            "date": "Au 31 décembre 2025",
            "source": {
              "title": "Rapport n° 666 (2025-2026) sur le projet de loi actualisant la programmation militaire pour les années 2024 à 2030",
              "url": "https://www.senat.fr/rap/l25-666/l25-666_mono.html",
              "date": "2026-05-27",
              "publisher": "Sénat, commission des affaires étrangères, de la défense et des forces armées"
            },
            "chart": {
              "kind": "compare",
              "unit": "réservistes",
              "items": [
                {
                  "label": "France",
                  "value": 47000
                },
                {
                  "label": "Allemagne",
                  "value": 60000
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "defense-5-a",
          "text": "Rétablir un service militaire obligatoire et court pour tous les jeunes, en caserne et en uniforme"
        },
        {
          "id": "defense-5-b",
          "text": "Créer un service national obligatoire et rémunéré, mêlant formation militaire initiale et missions civiles"
        },
        {
          "id": "defense-5-c",
          "text": "Rendre obligatoire un service civique pour tous les jeunes, le service militaire restant volontaire"
        },
        {
          "id": "defense-5-d",
          "text": "Développer fortement la réserve et le service militaire volontaire, sans rétablir d’obligation"
        },
        {
          "id": "defense-5-e",
          "text": "Refuser toute forme de service militaire, volontaire ou obligatoire, et la militarisation de la jeunesse"
        }
      ]
    },
    {
      "id": "institutions-1",
      "topicId": "institutions",
      "tier": "essentiel",
      "step": 1,
      "rev": 1,
      "prompt": "Quelle évolution des institutions privilégier ?",
      "context": "Aujourd’hui : le président est élu pour cinq ans et peut dissoudre l’Assemblée nationale, le gouvernement peut faire adopter un texte sans vote (article 49.3) et le Conseil constitutionnel peut censurer une loi contraire à la Constitution.",
      "explainer": {
        "summary": "La Constitution de 1958 donne au président des pouvoirs qu’il exerce seul, comme nommer le Premier ministre ou dissoudre l’Assemblée, au gouvernement des outils pour faire adopter ses textes, et au Conseil constitutionnel le pouvoir de censurer une loi. Le débat met en balance la capacité de l’exécutif à agir, le poids du Parlement et des citoyens et le contrôle du juge : garder ces règles, les retoucher (pouvoirs du président, durée de son mandat, nombre d’élus et de mandats, référendum, censures du Conseil constitutionnel) ou les remplacer par une nouvelle Constitution ou d’autres institutions.",
        "points": [
          {
            "text": "Le président nomme le Premier ministre ; l’Assemblée n’a pas à l’approuver par un vote. Le gouvernement reste en place tant que l’Assemblée ne le renverse pas, en adoptant une motion de censure ou en lui refusant la confiance qu’il a lui-même demandée. Le Premier ministre doit alors remettre la démission du gouvernement (article 50). Une motion de censure a été adoptée en 1962, une autre le 4 décembre 2024.",
            "source": {
              "title": "Fiche de synthèse n° 64 : La mise en cause de la responsabilité du Gouvernement",
              "url": "https://www.assemblee-nationale.fr/dyn/synthese/fonctionnement-assemblee-nationale/evaluation-politiques-publiques-controle-gouvernement/la-mise-en-cause-de-la-responsabilite-du-gouvernement",
              "date": "actualisée le 6 décembre 2024",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "text": "Avec l’article 49, alinéa 3 (le « 49.3 »), le gouvernement engage sa responsabilité sur un texte : celui-ci est considéré comme adopté, sauf si l’Assemblée vote une motion de censure, qui renverse alors le gouvernement. Depuis la révision du 23 juillet 2008, le 49.3 ne peut servir que pour les budgets de l’État et de la Sécurité sociale, et pour un autre texte par session. Auparavant, il n’avait pas de limite.",
            "source": {
              "title": "Fiche de synthèse n° 64 : La mise en cause de la responsabilité du Gouvernement",
              "url": "https://www.assemblee-nationale.fr/dyn/synthese/fonctionnement-assemblee-nationale/evaluation-politiques-publiques-controle-gouvernement/la-mise-en-cause-de-la-responsabilite-du-gouvernement",
              "date": "actualisée le 6 décembre 2024",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "text": "Pour réviser la Constitution (article 89), l’Assemblée et le Sénat doivent d’abord voter le même texte. La révision est ensuite approuvée par référendum ; si elle a été proposée par l’exécutif, le président peut choisir de la soumettre plutôt au Parlement réuni en Congrès, qui doit l’adopter à la majorité des trois cinquièmes des suffrages exprimés. Le Conseil constitutionnel peut examiner une loi avant sa promulgation par le président. Pendant un procès, il peut aussi juger, sur renvoi du Conseil d’État ou de la Cour de cassation, une loi déjà en vigueur qui porterait atteinte aux droits et libertés garantis par la Constitution. Ses décisions sont sans recours et s’imposent aux pouvoirs publics. Enfin, la Constitution interdit au président plus de deux mandats consécutifs et plafonne le nombre de députés à 577 et celui des sénateurs à 348.",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur (articles 6, 24, 61, 61-1, 62 et 89)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "à jour de la révision constitutionnelle du 8 mars 2024 (consulté le 7 octobre 2026)",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "116",
            "label": "recours au 49.3 entre 1959 et septembre 2025, sur 61 textes, selon le bilan de l’Assemblée nationale. Parmi eux, 28 ont eu lieu sous un même Premier ministre, de 1988 à 1991, et 23 sous un autre, de 2022 à 2024. Le tableau détaillé de la même page y ajoute 2 recours pour le budget 2026, les 20 et 23 janvier 2026, en nouvelle lecture.",
            "date": "1959 – janvier 2026 (bilan mis à jour le 9 septembre 2025)",
            "source": {
              "title": "Engagements de responsabilité du Gouvernement et motions de censure depuis 1958",
              "url": "https://www.assemblee-nationale.fr/dyn/engagements_responsabilite-motions_censures/engagements-de-responsabilite-du-gouvernement-et-motions-de-censure-depuis-1958",
              "date": "mise à jour du 9 septembre 2025, lignes de janvier 2026 ajoutées (consulté le 7 octobre 2026)",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "recours",
              "items": [
                {
                  "label": "Premier ministre de 1988 à 1991",
                  "value": 28
                },
                {
                  "label": "Premier ministre de 2022 à 2024",
                  "value": 23
                }
              ]
            }
          },
          {
            "value": "6",
            "label": "dissolutions de l’Assemblée nationale depuis 1958 : en 1962, 1968, 1981, 1988, 1997 et 2024",
            "date": "9 juin 2024 (dernière dissolution)",
            "source": {
              "title": "Dissolution de l’Assemblée nationale : Emmanuel Macron procède à la sixième dissolution depuis 1958",
              "url": "https://lcp.fr/actualites/dissolution-de-l-assemblee-nationale-emmanuel-macron-procede-a-la-sixieme-dissolution",
              "date": "10 juin 2024",
              "publisher": "LCP-Assemblée nationale (chaîne parlementaire)"
            }
          },
          {
            "value": "364",
            "label": "députés ont voté contre la déclaration de politique générale sur laquelle le gouvernement engageait sa responsabilité, le 8 septembre 2025, et 194 pour. Le Premier ministre a dû remettre la démission du gouvernement (article 50 de la Constitution).",
            "date": "8 septembre 2025",
            "source": {
              "title": "Vote de confiance : l’Assemblée nationale a désapprouvé la déclaration de politique générale du Gouvernement",
              "url": "https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/vote-de-confiance-l-assemblee-nationale-a-desapprouve-la-declaration-de-politique-generale-du-gouvernement",
              "date": "8 septembre 2025",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "députés",
              "items": [
                {
                  "label": "Contre",
                  "value": 364
                },
                {
                  "label": "Pour",
                  "value": 194
                }
              ]
            }
          },
          {
            "value": "25",
            "label": "révisions de la Constitution depuis 1958. Celle du 2 octobre 2000, adoptée par référendum, a réduit la durée du mandat présidentiel de 7 à 5 ans. L’une de celles du 8 juillet 1999 a permis de revenir sur une décision du Conseil constitutionnel de 1982 qui s’opposait aux quotas de femmes aux élections municipales. La dernière révision date du 8 mars 2024.",
            "date": "8 mars 2024",
            "source": {
              "title": "Quand la Constitution a-t-elle été modifiée ?",
              "url": "https://www.conseil-constitutionnel.fr/la-constitution/quand-la-constitution-a-t-elle-ete-modifiee",
              "date": "mise à jour du 11 mars 2024",
              "publisher": "Conseil constitutionnel"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "institutions-1-a",
          "text": "Faire rédiger une nouvelle Constitution par une assemblée constituante, élue ou tirée au sort"
        },
        {
          "id": "institutions-1-b",
          "text": "Remplacer les institutions actuelles, présidence et Sénat compris, par un pouvoir des travailleurs"
        },
        {
          "id": "institutions-1-c",
          "text": "Donner l’essentiel du pouvoir au Parlement et au Premier ministre, en réduisant celui du président"
        },
        {
          "id": "institutions-1-d",
          "text": "Rétablir un mandat présidentiel de sept ans, distinct du calendrier des élections législatives"
        },
        {
          "id": "institutions-1-e",
          "text": "Permettre au peuple par référendum, ou au Parlement, de passer outre une censure du Conseil constitutionnel"
        },
        {
          "id": "institutions-1-f",
          "text": "Garder les pouvoirs actuels du président et du Parlement, en recourant davantage au référendum"
        },
        {
          "id": "institutions-1-g",
          "text": "Réduire le nombre de députés et de sénateurs et limiter le nombre de mandats successifs d’un même élu"
        }
      ]
    },
    {
      "id": "institutions-2",
      "topicId": "institutions",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment élire les députés ?",
      "context": "Aujourd’hui : les 577 députés sont élus au scrutin majoritaire à deux tours, chacun dans une circonscription.",
      "explainer": {
        "summary": "Le mode de scrutin décide comment les voix deviennent des sièges : le scrutin majoritaire lie chaque député à une circonscription et peut donner une majorité nette à la formation arrivée en tête, mais la répartition des sièges peut alors s’éloigner de celle des voix ; la proportionnelle suit les voix, mais une majorité exige alors souvent une coalition. Entre les deux existent des formules mixtes et la proportionnelle avec une prime en sièges pour la liste en tête.",
        "points": [
          {
            "text": "Les députés ont déjà été élus à la proportionnelle : aux législatives du 16 mars 1986, organisées selon une loi du 10 juillet 1985, on votait pour des listes dans chaque département. Chaque siège allait à la liste qui avait, avant de le recevoir, « le plus grand nombre de suffrages par député » : c’est la règle de la plus forte moyenne.",
            "source": {
              "title": "Décision n° 86-1000 AN du 1er avril 1986 (élections du 16 mars 1986 dans le Bas-Rhin)",
              "url": "https://www.conseil-constitutionnel.fr/decision/1986/861000AN.htm",
              "date": "1er avril 1986",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Le mode de scrutin relève de la loi : l’article 34 de la Constitution lui confie le « régime électoral des assemblées parlementaires ». Le 2 juillet 1986, en validant la loi qui rétablissait le scrutin majoritaire, le Conseil constitutionnel a jugé qu’une loi ordinaire suffit pour changer le mode d’élection des députés, à condition de respecter leur nombre.",
            "source": {
              "title": "Décision n° 86-208 DC du 2 juillet 1986 (loi relative à l’élection des députés), considérants 2 et 3",
              "url": "https://www.conseil-constitutionnel.fr/decision/1986/86208DC.htm",
              "date": "2 juillet 1986",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "La prime à la liste en tête existe déjà aux élections régionales. La liste qui obtient la majorité absolue au premier tour, ou le plus de voix au second, reçoit d’emblée un quart des sièges. Les autres sièges sont répartis à la proportionnelle entre toutes les listes qui ont au moins 5 % des suffrages exprimés.",
            "source": {
              "title": "Code électoral, article L338",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006353944",
              "date": "version en vigueur depuis le 12 avril 2003",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "12,5 %",
            "label": "des électeurs inscrits : c’est le score minimal à obtenir au premier tour pour se présenter au second. Pour être élu dès le premier tour, il faut la majorité absolue des suffrages exprimés et au moins un quart des électeurs inscrits ; au second tour, la majorité relative suffit.",
            "date": "septembre 2023",
            "source": {
              "title": "Fiche de synthèse n° 3 : L’élection des députés",
              "url": "https://www.assemblee-nationale.fr/dyn/synthese/deputes-groupes-parlementaires/l-election-des-deputes",
              "date": "septembre 2023",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "part",
              "value": 12.5,
              "total": 100,
              "unit": "%",
              "whole": "des électeurs inscrits"
            }
          },
          {
            "value": "313",
            "label": "députés (309 membres et 4 apparentés) dans le groupe le plus nombreux de l’Assemblée nationale au 28 juin 2017, au début de la législature élue en juin 2017, sur 577 sièges pourvus",
            "date": "28 juin 2017",
            "source": {
              "title": "Bilan statistique de la XVe législature (21 juin 2017 – 21 juin 2022), tableau 1.1 « Effectifs des groupes »",
              "url": "https://www2.assemblee-nationale.fr/static/15/statistiques/Bilan-XVe-l%C3%A9gislature.pdf",
              "date": "juin 2022",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "part",
              "value": 313,
              "total": 577,
              "whole": "sièges pourvus"
            }
          },
          {
            "value": "118",
            "label": "députés (115 membres et 3 apparentés) dans le groupe le plus nombreux de l’Assemblée nationale au 7 octobre 2026, sur 577 sièges, dont 569 pourvus",
            "date": "état au 7 octobre 2026",
            "source": {
              "title": "Effectif des groupes politiques (XVIIe législature)",
              "url": "https://www2.assemblee-nationale.fr/instances/liste/groupes_politiques/effectif",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "part",
              "value": 118,
              "total": 577,
              "whole": "sièges"
            }
          },
          {
            "value": "630",
            "label": "sièges au Bundestag allemand. Chaque électeur y a deux voix : la première pour un candidat dans l’une des 299 circonscriptions, la seconde pour une liste de parti. Chaque parti reçoit un nombre de sièges proportionnel à ses secondes voix ; ses gagnants de circonscription occupent ces sièges en priorité, dans la limite de ce total. Il faut en principe 5 % des secondes voix au niveau national pour avoir des élus.",
            "date": "règle en vigueur au 7 octobre 2026",
            "source": {
              "title": "Election of Members of the German Bundestag",
              "url": "https://www.bundestag.de/en/parliament/elections/arithmetic",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Deutscher Bundestag"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "institutions-2-a",
          "text": "Élire tous les députés à la proportionnelle, sur des listes départementales ou régionales"
        },
        {
          "id": "institutions-2-b",
          "text": "Élire les députés à la proportionnelle, avec une prime en sièges pour la liste arrivée en tête"
        },
        {
          "id": "institutions-2-c",
          "text": "Élire la moitié des députés en circonscription et répartir l’ensemble des sièges à la proportionnelle"
        },
        {
          "id": "institutions-2-d",
          "text": "Garder l’élection en circonscription pour la plupart des députés et en élire une partie à la proportionnelle"
        },
        {
          "id": "institutions-2-e",
          "text": "Garder l’élection de chaque député au scrutin majoritaire à deux tours dans sa circonscription"
        }
      ]
    },
    {
      "id": "institutions-3",
      "topicId": "institutions",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle place donner aux citoyens dans les décisions publiques ?",
      "context": "Aujourd’hui : un référendum d’initiative partagée exige le soutien d’un cinquième des parlementaires et d’un dixième des électeurs inscrits.",
      "explainer": {
        "summary": "En France, les citoyens décident surtout en élisant leurs représentants : le dernier référendum national date de 2005, et les électeurs ne peuvent pas en déclencher un seuls. Le débat oppose plusieurs logiques : des citoyens qui proposent, révoquent ou délibèrent (initiative citoyenne, révocation des élus, conventions tirées au sort), un président qui consulte plus souvent ou sur plus de sujets, ou des élus qui décident, le référendum restant exceptionnel.",
        "points": [
          {
            "text": "Sur proposition du gouvernement ou des deux assemblées, le président peut soumettre au référendum un projet de loi sur l’organisation des pouvoirs publics, sur des réformes de la politique économique, sociale ou environnementale et des services publics, ou autorisant la ratification de certains traités. Sur les mêmes sujets, le référendum d’initiative partagée part d’une proposition de loi d’un cinquième des parlementaires, contrôlée par le Conseil constitutionnel. Elle ne peut pas abroger une loi promulguée depuis moins d’un an. Elle doit réunir le soutien d’un dixième des électeurs inscrits ; si les deux assemblées ne l’examinent pas ensuite dans le délai prévu, le président la soumet au référendum. Le président, lui, ne peut être destitué que par le Parlement réuni en Haute Cour, à la majorité des deux tiers, en cas de « manquement à ses devoirs manifestement incompatible avec l’exercice de son mandat ».",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur (articles 11 et 68)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "à jour de la révision constitutionnelle du 8 mars 2024 (consulté le 7 octobre 2026)",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Sept propositions de ce type ont été soumises au Conseil constitutionnel depuis 2019. Une seule, sur les aéroports de Paris (2019), a été jugée conforme et a pu recueillir des soutiens. Les six autres, d’août 2021 à juin 2026, ont été jugées non conformes, ce qui a arrêté la procédure.",
            "source": {
              "title": "Les décisions – type : Référendum d’initiative partagée (RIP)",
              "url": "https://www.conseil-constitutionnel.fr/les-decisions/type/RIP",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Au niveau local, un référendum n’est adopté que si au moins la moitié des électeurs inscrits a voté et si le projet obtient la majorité des suffrages exprimés.",
            "source": {
              "title": "Code général des collectivités territoriales, article LO1112-7",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006389054",
              "date": "en vigueur depuis le 1er janvier 2005",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "9",
            "label": "référendums nationaux organisés sous la Ve République en application des articles 11 et 89 de la Constitution, le dernier le 29 mai 2005",
            "date": "29 mai 2005",
            "source": {
              "title": "L’histoire du référendum sous la Ve République",
              "url": "https://www.conseil-constitutionnel.fr/la-constitution/l-histoire-du-referendum-sous-la-ve-republique",
              "date": "mise à jour du 11 février 2020",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "value": "69,81 %",
            "label": "d’abstention au référendum de 2000 sur le quinquennat, contre 30,63 % à celui de 2005 sur le traité constitutionnel européen (en % des inscrits)",
            "date": "2000 et 2005",
            "source": {
              "title": "Tableau récapitulatif des référendums de la Vème République",
              "url": "https://www.conseil-constitutionnel.fr/referendum-sous-la-ve-republique/tableau-recapitulatif-des-referendums-de-la-veme-republique",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Conseil constitutionnel"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Quinquennat (2000)",
                  "value": 69.81
                },
                {
                  "label": "Traité européen (2005)",
                  "value": 30.63
                }
              ]
            }
          },
          {
            "value": "1 093 030",
            "label": "soutiens recueillis en neuf mois pour le seul référendum d’initiative partagée arrivé à la collecte (aéroports de Paris), sur 4 717 396 nécessaires",
            "date": "12 mars 2020 (fin de la collecte)",
            "source": {
              "title": "Décision n° 2019-1-8 RIP du 26 mars 2020",
              "url": "https://www.conseil-constitutionnel.fr/decision/2020/201918RIP.htm",
              "date": "26 mars 2020",
              "publisher": "Conseil constitutionnel"
            },
            "chart": {
              "kind": "part",
              "value": 1093030,
              "total": 4717396,
              "whole": "soutiens nécessaires"
            }
          },
          {
            "value": "150",
            "label": "citoyens tirés au sort pour la Convention citoyenne pour le climat. Après plus de huit mois de travail, ils ont remis leurs propositions au gouvernement le 21 juin 2020 : 149 au total.",
            "date": "juin 2020",
            "source": {
              "title": "Après 8 mois de travail, la Convention Citoyenne pour le Climat a rendu ses propositions",
              "url": "https://www.lecese.fr/actualites/apres-8-mois-de-travail-la-convention-citoyenne-pour-le-climat-rendu-ses-propositions",
              "date": "30 juin 2020",
              "publisher": "Conseil économique, social et environnemental (CESE)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "institutions-3-a",
          "text": "Créer un droit d’initiative citoyenne permettant de déclencher des référendums locaux et nationaux"
        },
        {
          "id": "institutions-3-b",
          "text": "Permettre aux électeurs de révoquer un élu en cours de mandat par référendum, président compris"
        },
        {
          "id": "institutions-3-c",
          "text": "Abaisser le nombre de signatures nécessaires pour organiser un référendum d’initiative partagée"
        },
        {
          "id": "institutions-3-d",
          "text": "Permettre au président de soumettre tout sujet au référendum, y compris l’immigration ou la Constitution"
        },
        {
          "id": "institutions-3-e",
          "text": "Organiser régulièrement des référendums à plusieurs questions, à l’initiative du président ou du gouvernement"
        },
        {
          "id": "institutions-3-f",
          "text": "Laisser les décisions aux parlementaires élus et réserver le référendum à des circonstances exceptionnelles",
          "external": true
        },
        {
          "id": "institutions-3-g",
          "text": "Associer des citoyens tirés au sort à la préparation des grandes réformes, par des conventions citoyennes",
          "external": true
        }
      ]
    },
    {
      "id": "laicite_republique-1",
      "topicId": "laicite_republique",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle approche de la laïcité privilégier ?",
      "context": "Aujourd’hui : les élèves de l’école publique ne peuvent pas porter de signes religieux ostensibles, le voile intégral est interdit dans l’espace public, les agents publics doivent rester neutres et une loi de 2021 renforce le contrôle des associations et des lieux de culte.",
      "explainer": {
        "summary": "La République est laïque, mais la façon d’appliquer ce principe divise. Les approches portent sur les signes religieux (garder les règles actuelles ou étendre les interdictions, jusqu’à tout l’espace public), sur le contrôle des associations et des lieux de culte renforcé en 2021 et sur de nouveaux délits, sur la lutte contre les discriminations, sur une mention de l’héritage chrétien ou judéo-chrétien dans la Constitution et sur les règles particulières de certains territoires, comme l’Alsace-Moselle.",
        "points": [
          {
            "text": "La Constitution qualifie la République de « laïque » dès son article 1er, sans définir le mot. En 2013, le Conseil constitutionnel en a précisé le contenu : neutralité de l’État, respect de toutes les croyances, égalité de tous devant la loi sans distinction de religion, libre exercice des cultes, aucun culte reconnu ni salarié par la République. Il a aussi jugé que la Constitution n’avait pas « entendu remettre en cause » les règles particulières de certains territoires. En Alsace-Moselle, par exemple, la loi de 1905 de séparation des Églises et de l’État n’a pas été rendue applicable, et l’État rémunère des ministres du culte.",
            "source": {
              "title": "Décision n° 2012-297 QPC du 21 février 2013 (traitement des pasteurs dans le Bas-Rhin, le Haut-Rhin et la Moselle)",
              "url": "https://www.conseil-constitutionnel.fr/decision/2013/2012297QPC.htm",
              "date": "21 février 2013",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "L’Observatoire de la laïcité, créé en 2007, a été supprimé en juin 2021. Depuis, un comité interministériel de la laïcité, présidé par le Premier ministre et réuni au moins une fois par an, coordonne l’action du gouvernement.",
            "source": {
              "title": "Décret n° 2021-716 du 4 juin 2021 instituant un comité interministériel de la laïcité",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043604820",
              "date": "4 juin 2021",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "La loi du 24 août 2021 « confortant le respect des principes de la République » renforce le contrôle des associations. Celles qui demandent une subvention doivent signer un contrat d’engagement républicain ; certaines de celles qui reçoivent des ressources de l’étranger doivent les inscrire à part dans leurs comptes. Le préfet peut fermer un lieu de culte jusqu’à deux mois si les propos qui y sont tenus, les idées qui y sont diffusées ou les activités qui s’y déroulent provoquent à la haine ou à la violence. Enfin, les organismes chargés d’un service public doivent veiller à ce que leurs salariés qui y participent ne manifestent pas leurs opinions politiques ou religieuses.",
            "source": {
              "title": "Loi n° 2021-1109 du 24 août 2021 confortant le respect des principes de la République (articles 1er, 12, 21 et 87)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043964778",
              "date": "24 août 2021",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "51 %",
            "label": "des 18-59 ans se disent sans religion ; 29 % se déclarent catholiques, 10 % musulmans et 10 % d’une autre religion – France métropolitaine",
            "date": "2019-2020",
            "source": {
              "title": "La diversité religieuse en France : transmissions intergénérationnelles et pratiques selon les origines (enquête Trajectoires et Origines 2)",
              "url": "https://www.insee.fr/fr/statistiques/6793308?sommaire=6793391",
              "date": "30 mars 2023",
              "publisher": "Insee – Ined"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Sans religion",
                  "value": 51
                },
                {
                  "label": "Catholiques",
                  "value": 29
                },
                {
                  "label": "Musulmans",
                  "value": 10
                },
                {
                  "label": "Autre religion",
                  "value": 10
                }
              ]
            }
          },
          {
            "value": "26 %",
            "label": "des femmes musulmanes de 18 à 49 ans disent porter un voile, contre 18 % en 2008-2009 – France métropolitaine",
            "date": "2019-2020",
            "source": {
              "title": "La diversité religieuse en France : transmissions intergénérationnelles et pratiques selon les origines – encadré « Qui porte le voile ? »",
              "url": "https://www.insee.fr/fr/statistiques/6793308?sommaire=6793391",
              "date": "30 mars 2023",
              "publisher": "Insee – Ined"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2008-2009",
                  "value": 18
                },
                {
                  "label": "2019-2020",
                  "value": 26
                }
              ]
            }
          },
          {
            "value": "7 %",
            "label": "des personnes ayant déclaré une discrimination ou un traitement inégalitaire au cours des cinq dernières années citent leur religion comme motif. Cette part est de 30 % chez les immigrés et descendants d’immigrés du Maroc et de Tunisie, contre 2 % chez les personnes sans ascendance migratoire ni originaires d’outre-mer. La mention de ce motif a augmenté en dix ans – France métropolitaine, 18-59 ans",
            "date": "2019-2020",
            "source": {
              "title": "Immigrés et descendants d’immigrés en France – fiche Discriminations",
              "url": "https://www.insee.fr/fr/statistiques/6793302?sommaire=6793391",
              "date": "30 mars 2023",
              "publisher": "Insee – Ined"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Ensemble",
                  "value": 7
                },
                {
                  "label": "Origine Maroc ou Tunisie",
                  "value": 30
                },
                {
                  "label": "Sans ascendance migratoire",
                  "value": 2
                }
              ]
            }
          },
          {
            "value": "210 voix contre 81",
            "label": "vote du Sénat, en première lecture, sur une proposition de loi, c’est-à-dire un texte d’origine parlementaire. Elle interdit les signes ou tenues manifestant ostensiblement une appartenance politique ou religieuse lors des compétitions organisées par les fédérations sportives, et impose le respect des principes de neutralité et de laïcité dans les piscines. Transmise à l’Assemblée nationale, elle n’y avait pas été adoptée au 7 octobre 2026.",
            "date": "18 février 2025",
            "source": {
              "title": "Proposition de loi visant à assurer le respect du principe de laïcité dans le sport – La loi en clair",
              "url": "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-visant-a-assurer-le-respect-du-principe-de-laicite-dans-le-sport.html",
              "date": "février 2025 (statut « En cours », consulté le 7 octobre 2026)",
              "publisher": "Sénat"
            },
            "chart": {
              "kind": "compare",
              "unit": "voix",
              "items": [
                {
                  "label": "Pour",
                  "value": 210
                },
                {
                  "label": "Contre",
                  "value": 81
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "laicite_republique-1-a",
          "text": "Interdire le port du voile islamique dans tout l’espace public, sous peine d’amende"
        },
        {
          "id": "laicite_republique-1-b",
          "text": "Étendre l’interdiction des signes religieux à d’autres lieux ou créer de nouveaux délits contre l’islamisme"
        },
        {
          "id": "laicite_republique-1-c",
          "text": "Conserver les règles actuelles sur les signes religieux, sans y ajouter de nouvelle interdiction"
        },
        {
          "id": "laicite_republique-1-d",
          "text": "Mettre l’accent sur la lutte contre les discriminations, y compris celles qui visent les musulmans"
        },
        {
          "id": "laicite_republique-1-e",
          "text": "Abroger la loi de 2021 qui renforce le contrôle des associations et des lieux de culte"
        },
        {
          "id": "laicite_republique-1-f",
          "text": "Reconnaître dans la Constitution l’héritage chrétien ou judéo-chrétien de la France, à côté de la laïcité"
        },
        {
          "id": "laicite_republique-1-g",
          "text": "Appliquer la loi de 1905 sur tout le territoire, en mettant fin au régime concordataire d’Alsace-Moselle"
        }
      ]
    },
    {
      "id": "laicite_republique-2",
      "topicId": "laicite_republique",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment la France doit-elle aborder l’histoire de la colonisation ?",
      "context": "Aujourd’hui : la France a reconnu plusieurs crimes commis pendant la guerre d’Algérie, sans présenter d’excuses officielles ; une commission mixte d’historiens français et algériens a été créée en 2022.",
      "explainer": {
        "summary": "Depuis 2021, l’État a pris plusieurs décisions sur la mémoire de la colonisation : rapport officiel, ouverture d’archives, reconnaissance envers les harkis, lois de restitution. Le débat porte sur son rôle : commission officielle ou travail laissé aux historiens, histoire nationale commune, qualification ou non de la colonisation elle-même comme crime, excuses officielles ou refus d’en présenter, accent mis sur les crimes commis ou sur ce que la colonisation a apporté.",
        "points": [
          {
            "text": "En 2022, une loi a reconnu la « responsabilité » de la Nation du fait de « l’indignité des conditions d’accueil et de vie » réservées en France, après 1962, aux harkis et à leurs familles. Elle a aussi créé une réparation forfaitaire pour ceux qui ont séjourné dans certaines structures d’accueil entre 1962 et 1975.",
            "source": {
              "title": "Loi n° 2022-229 du 23 février 2022 portant reconnaissance de la Nation envers les harkis et les autres personnes rapatriées d’Algérie…",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045220741",
              "date": "23 février 2022",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Depuis une loi du 26 décembre 2023, des restes humains conservés dans les collections publiques peuvent être restitués à un État qui le demande, à des fins funéraires, par un décret en Conseil d’État, s’il s’agit de personnes mortes après l’an 1500.",
            "source": {
              "title": "Loi n° 2023-1251 du 26 décembre 2023 relative à la restitution de restes humains appartenant aux collections publiques",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048668800",
              "date": "26 décembre 2023",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "En 2001, une loi a reconnu la traite et l’esclavage comme un crime contre l’humanité et demandé aux programmes scolaires de leur accorder « la place conséquente qu’ils méritent ». En 2005, une autre loi a demandé aux programmes scolaires de reconnaître « le rôle positif de la présence française outre-mer ». La disposition de 2005, elle, a été abrogée par décret en 2006 : le Conseil constitutionnel avait jugé que le contenu des programmes ne relève pas de la loi. En 2008, une mission de l’Assemblée nationale a conclu que le rôle du Parlement n’est pas d’adopter des lois « qualifiant ou portant une appréciation sur des faits historiques ». Selon elle, les résolutions sont un meilleur outil pour s’exprimer sur l’histoire.",
            "source": {
              "title": "Rapport d’information n° 1262 fait au nom de la mission d’information sur les questions mémorielles",
              "url": "https://www.assemblee-nationale.fr/13/rap-info/i1262.asp",
              "date": "18 novembre 2008",
              "publisher": "Assemblée nationale"
            }
          }
        ],
        "figures": [
          {
            "value": "Une trentaine",
            "label": "de préconisations dans le rapport remis en janvier 2021 au président de la République par un historien, à sa demande. Il propose notamment une commission « Mémoire et vérité », des commémorations, la restitution de l’épée de l’émir Abdelkader et une commission mixte d’historiens sur les enlèvements et assassinats d’Européens à Oran en juillet 1962. Il propose aussi le transfert de certaines archives.",
            "date": "20 janvier 2021",
            "source": {
              "title": "Les questions mémorielles portant sur la colonisation et la guerre d’Algérie",
              "url": "https://www.vie-publique.fr/rapport/278186-rapport-stora-memoire-sur-la-colonisation-et-la-guerre-dalgerie",
              "date": "20 janvier 2021",
              "publisher": "vie-publique.fr (DILA) – rapport commandé par la Présidence de la République"
            }
          },
          {
            "value": "1954-1966",
            "label": "période couverte par l’ouverture anticipée des archives d’enquêtes de police judiciaire et d’affaires judiciaires liées à la guerre d’Algérie (du 1er novembre 1954 au 31 décembre 1966)",
            "date": "22 décembre 2021",
            "source": {
              "title": "Arrêté du 22 décembre 2021 portant ouverture d’archives relatives à la guerre d’Algérie",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044546979",
              "date": "22 décembre 2021",
              "publisher": "Légifrance"
            }
          },
          {
            "value": "1815-1972",
            "label": "période d’appropriation (vol, pillage, cession obtenue par contrainte ou violence) visée par la loi du 9 mai 2026. Les biens culturels publics concernés peuvent être restitués à un État qui le demande, par un décret en Conseil d’État.",
            "date": "9 mai 2026",
            "source": {
              "title": "Loi n° 2026-351 du 9 mai 2026 – restitution de biens culturels ayant fait l’objet d’une appropriation illicite (art. L. 115-10 à L. 115-16 du code du patrimoine)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054049788",
              "date": "9 mai 2026 (JORF du 10 mai 2026)",
              "publisher": "Légifrance"
            }
          },
          {
            "value": "67 voix contre 11",
            "label": "vote de l’Assemblée nationale, le 28 mars 2024, sur une proposition de résolution « relative à la reconnaissance et la condamnation du massacre des Algériens du 17 octobre 1961 ». Elle a été adoptée avec 4 abstentions, sur 82 votants.",
            "date": "28 mars 2024",
            "source": {
              "title": "Scrutin public n° 3623 – Unique séance du jeudi 28 mars 2024",
              "url": "https://www.assemblee-nationale.fr/dyn/16/scrutins/3623",
              "date": "28 mars 2024",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "députés",
              "items": [
                {
                  "label": "Pour",
                  "value": 67
                },
                {
                  "label": "Contre",
                  "value": 11
                },
                {
                  "label": "Abstention",
                  "value": 4
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "laicite_republique-2-a",
          "text": "Créer une commission officielle chargée d’établir les faits de la colonisation et de favoriser la réconciliation"
        },
        {
          "id": "laicite_republique-2-b",
          "text": "Reconnaître officiellement les crimes de la colonisation, ouvrir les archives et restituer des biens culturels"
        },
        {
          "id": "laicite_republique-2-c",
          "text": "Enseigner une histoire nationale commune, sans concurrence des mémoires entre groupes"
        },
        {
          "id": "laicite_republique-2-d",
          "text": "Reconnaître les crimes commis pendant la colonisation, sans qualifier la colonisation elle-même de crime"
        },
        {
          "id": "laicite_republique-2-e",
          "text": "Refuser toute excuse officielle pour la colonisation et dépassionner la relation avec l’Algérie"
        },
        {
          "id": "laicite_republique-2-f",
          "text": "Mettre en avant dans le discours officiel ce que la colonisation a apporté aux pays colonisés"
        }
      ]
    },
    {
      "id": "fiscalite-x1",
      "topicId": "fiscalite",
      "tier": "essentiel",
      "step": 2,
      "rev": 1,
      "prompt": "Quelle évolution pour le niveau global des impôts et des cotisations ?",
      "context": "Aujourd’hui : les impôts et cotisations sociales ont représenté 43,6 % de la richesse produite (PIB) en 2025.",
      "explainer": {
        "summary": "Le niveau des impôts et des cotisations dépend des choix faits sur les dépenses publiques et sur le déficit. Les approches divergent : baisser les prélèvements en réduisant les dépenses, les stabiliser, déplacer la charge du travail vers le capital, les augmenter pour les plus aisés et les grandes entreprises, ou exproprier les grands groupes et les grandes fortunes.",
        "points": [
          {
            "text": "Prévisions : selon les projets de budget pour 2027 que le Gouvernement a soumis au Haut Conseil des finances publiques, le taux de prélèvements obligatoires (impôts et cotisations sociales rapportés au PIB) passerait à 43,9 % en 2026, puis à 44,2 % en 2027. Les prélèvements atteindraient alors 1 386,3 Md€.",
            "source": {
              "title": "Avis n° HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027 (§ 58 et 70)",
              "url": "https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf",
              "date": "2026-09-25",
              "publisher": "Haut Conseil des finances publiques"
            }
          },
          {
            "text": "Limite constitutionnelle de l’impôt : selon l’article 13 de la Déclaration de 1789, la contribution commune est répartie entre les citoyens « en raison de leurs facultés ». Le Conseil constitutionnel en déduit qu’un impôt ne doit pas avoir de « caractère confiscatoire » ni faire peser sur une catégorie de contribuables une charge excessive au regard de leurs facultés contributives.",
            "source": {
              "title": "Décision n° 2012-662 DC du 29 décembre 2012 (loi de finances pour 2013), considérants 15 et 70",
              "url": "https://www.conseil-constitutionnel.fr/decision/2012/2012662DC.htm",
              "date": "2012-12-29",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Expropriation : selon l’article 17 de la Déclaration de 1789, nul ne peut être privé de sa propriété, sauf « nécessité publique » légalement constatée et « sous la condition d’une juste et préalable indemnité ». En janvier 1982, le Conseil constitutionnel n’a pas remis en cause la nécessité des nationalisations votées par le Parlement. Il a toutefois censuré la loi, notamment pour ses règles d’évaluation des actions servant à indemniser les actionnaires.",
            "source": {
              "title": "Décision n° 81-132 DC du 16 janvier 1982 (loi de nationalisation)",
              "url": "https://www.conseil-constitutionnel.fr/decision/1982/81132DC.htm",
              "date": "1982-01-16",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "43,5 %",
            "label": "Impôts et cotisations sociales rapportés au PIB en France en 2024 (données provisoires, mesure de l’OCDE, qui diffère du taux de prélèvements obligatoires calculé par l’Insee) : deuxième niveau de l’OCDE, après le Danemark (45,2 %). La moyenne des pays de l’OCDE est de 34,1 %.",
            "date": "2024",
            "source": {
              "title": "Statistiques des recettes publiques 2025 – Tendances des recettes fiscales 1965-2024",
              "url": "https://www.oecd.org/fr/publications/statistiques-des-recettes-publiques-2025_f7a1e5e4-fr/full-report/tax-revenue-trends-1965-2024_98c75833.html",
              "date": "2025-12",
              "publisher": "OCDE"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "France",
                  "value": 43.5
                },
                {
                  "label": "Danemark",
                  "value": 45.2
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 34.1
                }
              ]
            }
          },
          {
            "value": "57,3 %",
            "label": "Dépenses de l’ensemble des administrations publiques rapportées au PIB en 2025 (57,0 % en 2024), pour des recettes de 52,2 % du PIB (51,2 % en 2024). Le déficit public atteint 5,1 % du PIB (5,8 % en 2024).",
            "date": "2025",
            "source": {
              "title": "Le compte des administrations publiques en 2025 (Insee Première n° 2106)",
              "url": "https://www.insee.fr/fr/statistiques/8997691",
              "date": "2026-05-29",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "Dépenses publiques",
                  "value": 57.3
                },
                {
                  "label": "Recettes publiques",
                  "value": 52.2
                }
              ]
            }
          },
          {
            "value": "41 %",
            "label": "Part de la protection sociale (retraites, chômage, famille, invalidité…) dans les 1 672 Md€ de dépenses publiques de 2024, soit 693 Md€. Suivent la santé (16 %), les services généraux (11 %), qui comprennent l’essentiel des intérêts de la dette, les affaires économiques (10 %) et l’enseignement (9 %).",
            "date": "2024 (données provisoires)",
            "source": {
              "title": "Les dépenses publiques par fonction en 2024 – Insee Première n° 2093",
              "url": "https://www.insee.fr/fr/statistiques/8735252",
              "date": "2026-02-05",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "part",
              "value": 41,
              "total": 100,
              "unit": "%",
              "whole": "des dépenses publiques"
            }
          },
          {
            "value": "33,2 %",
            "label": "Part des cotisations de sécurité sociale dans l’ensemble des impôts et cotisations en France en 2023, contre 25,5 % en moyenne dans l’OCDE. L’impôt sur le revenu en représente 21,5 % (23,7 % dans l’OCDE), les impôts sur le patrimoine 7,9 % (5,1 %) et l’impôt sur les sociétés 5,4 % (11,9 %).",
            "date": "2023",
            "source": {
              "title": "Tendances des recettes fiscales, 1965-2024 – Statistiques des recettes publiques 2025 (tableau 1.1)",
              "url": "https://www.oecd.org/fr/publications/statistiques-des-recettes-publiques-2025_f7a1e5e4-fr/full-report/tax-revenue-trends-1965-2024_98c75833.html",
              "date": "2025-12",
              "publisher": "OCDE"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France",
                  "value": 33.2
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 25.5
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "fiscalite-x1-a",
          "text": "Baisser nettement les impôts et les cotisations, en finançant cette baisse par des économies sur les dépenses"
        },
        {
          "id": "fiscalite-x1-b",
          "text": "Maintenir le niveau actuel des impôts, sans hausse ni forte baisse, avec des règles fiscales stables et simplifiées"
        },
        {
          "id": "fiscalite-x1-c",
          "text": "Garder le même niveau global d’impôts, mais alléger la charge sur le travail et taxer davantage le capital"
        },
        {
          "id": "fiscalite-x1-d",
          "text": "Augmenter les recettes en taxant davantage les plus hauts revenus, les grandes fortunes et les grandes entreprises"
        },
        {
          "id": "fiscalite-x1-e",
          "text": "Exproprier les grands groupes et les grandes fortunes pour en faire une propriété collective, plutôt que de seulement les taxer"
        }
      ]
    },
    {
      "id": "education-x1",
      "topicId": "education",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle priorité face à la violence et au harcèlement à l’école ?",
      "context": "Aujourd’hui : le harcèlement scolaire est un délit depuis 2022 ; à l’école, la sanction la plus lourde est l’exclusion définitive, prononcée par un conseil de discipline, et un élève de moins de 16 ans doit alors être scolarisé ailleurs.",
      "explainer": {
        "summary": "Le harcèlement et les violences à l’école sont mesurés par des enquêtes auprès des élèves et par les signalements des chefs d’établissement. Les propositions divergent sur la place de la sanction, de l’encadrement et de la prévention : sanctions plus fermes pour les élèves ou leurs parents, davantage d’adultes et de soignants, dialogue avec élèves et parents, ou fin des punitions, de la police et de la vidéosurveillance dans les établissements.",
        "points": [
          {
            "text": "Pour un auteur majeur, le harcèlement scolaire est passible de 3 ans de prison et 45 000 € d’amende au plus, et jusqu’à 10 ans et 150 000 € si la victime s’est suicidée ou a tenté de le faire. Les peines sont réduites pour un mineur de plus de 13 ans (au plus 1 an et demi et 7 500 € dans le cas le moins grave) ; avant 13 ans, ni prison ni amende. L’élève auteur peut être radié et affecté dans un autre établissement si son comportement présente un risque pour la sécurité ou la santé des autres élèves.",
            "source": {
              "title": "Harcèlement scolaire au collège et au lycée",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F31985",
              "date": "2025-11-04",
              "publisher": "Service-Public.fr (DILA)"
            }
          },
          {
            "text": "Des dispositifs relais accueillent temporairement des collégiens en rupture avec l’école. En 2024-2025, 8 298 élèves ont fait au moins un séjour dans l’un des 378 dispositifs : 242 classes relais, 130 ateliers relais et 6 internats tremplin. 41 % de ces élèves avaient une scolarité intermittente ou étaient absents depuis plus de deux mois.",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 4.25, les élèves de collège accueillis en dispositifs relais)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP / DGESCO"
            }
          },
          {
            "text": "Le code pénal punit le parent qui, sans motif légitime, manque à ses obligations légales au point de compromettre la santé, la sécurité, la moralité ou l’éducation de son enfant mineur : jusqu’à 2 ans de prison et 30 000 € d’amende. La peine passe à 3 ans et 45 000 € si ce manquement a directement conduit l’enfant à commettre un crime ou plusieurs délits ayant donné lieu à une condamnation définitive (version en vigueur depuis le 25 juin 2025).",
            "source": {
              "title": "Code pénal, article 227-17",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051785973",
              "date": "2025-06-25",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "18 %",
            "label": "des élèves de 15 ans disent subir au moins une forme de harcèlement quelques fois par mois ou plus, contre 20 % en moyenne dans l’OCDE. Cette part a augmenté en France entre 2022 et 2025, comme dans la grande majorité des pays participants",
            "date": "2025",
            "source": {
              "title": "Résultats du PISA 2025 (Volume I) – Note pays : France",
              "url": "https://www.oecd.org/content/dam/oecd/fr/publications/reports/2026/09/pisa-2025-results-volume-i-country-notes_88d1164e/france_69779694/9840dc6b-fr.pdf",
              "date": "2026-09",
              "publisher": "OCDE"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "France",
                  "value": 18
                },
                {
                  "label": "Moyenne de l’OCDE",
                  "value": 20
                }
              ]
            }
          },
          {
            "value": "7 %",
            "label": "des collégiens déclarent au moins cinq atteintes répétées dans l’année (« forte multivictimation », qui peut s’apparenter à du harcèlement), contre 6 % en 2017 ; 46 % disent avoir subi au moins une violence de façon répétée (France, collèges publics et privés sous contrat)",
            "date": "printemps 2022",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 2.12, le climat scolaire du point de vue des élèves de collège)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2017",
                  "value": 6
                },
                {
                  "label": "2022",
                  "value": 7
                }
              ]
            }
          },
          {
            "value": "14 pour 1 000 élèves",
            "label": "incidents graves déclarés en moyenne par les chefs d’établissement des collèges et lycées : 16 pour 1 000 dans les collèges, 20 dans les lycées professionnels, contre 4 dans les écoles. Ces taux baissent par rapport à 2023-2024 dans les écoles, collèges et lycées professionnels ; 80 % des incidents du second degré sont des atteintes aux personnes. Entre élèves, seuls les faits les plus graves sont comptés (France, public et privé sous contrat)",
            "date": "2024-2025",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 2.16, les incidents graves signalés)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "pour 1 000 élèves",
              "items": [
                {
                  "label": "Collèges et lycées (moyenne)",
                  "value": 14
                },
                {
                  "label": "Collèges",
                  "value": 16
                },
                {
                  "label": "Lycées professionnels",
                  "value": 20
                },
                {
                  "label": "Écoles",
                  "value": 4
                }
              ]
            }
          },
          {
            "value": "59 400",
            "label": "assistants d’éducation (surveillants) et 600 assistants prévention et sécurité sont payés par l’Éducation nationale ; 13 100 agents du ministère exercent des missions de santé et d’accompagnement social (France, agents rémunérés par le ministère, en poste au 30 novembre 2025)",
            "date": "2025-2026",
            "source": {
              "title": "Repères et références statistiques 2026 (fiche 9.16, les personnels non enseignants de l’enseignement scolaire)",
              "url": "https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf",
              "date": "2026-08",
              "publisher": "Ministère de l’Éducation nationale – DEPP"
            },
            "chart": {
              "kind": "compare",
              "unit": "agents",
              "items": [
                {
                  "label": "Assistants d’éducation",
                  "value": 59400
                },
                {
                  "label": "Assistants prévention-sécurité",
                  "value": 600
                },
                {
                  "label": "Santé et accompagnement social",
                  "value": 13100
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "education-x1-a",
          "text": "Durcir les sanctions et placer les élèves violents ou exclus à répétition dans des établissements spécialisés"
        },
        {
          "id": "education-x1-b",
          "text": "Recruter davantage de surveillants, d’infirmiers, de médecins et de psychologues scolaires dans chaque établissement"
        },
        {
          "id": "education-x1-c",
          "text": "Sanctionner les parents des élèves en cause par des amendes, la suspension de certaines allocations ou la réparation des dégâts"
        },
        {
          "id": "education-x1-d",
          "text": "Supprimer les punitions et les conseils de discipline et retirer la police et la vidéosurveillance des établissements"
        },
        {
          "id": "education-x1-e",
          "text": "Associer élèves et parents aux décisions des établissements et y développer le dialogue pour prévenir les conflits"
        }
      ]
    },
    {
      "id": "societe-x1",
      "topicId": "societe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles règles pour la concentration et l’indépendance des médias ?",
      "context": "Aujourd’hui : des lois de 1986 plafonnent la part qu’un même groupe peut détenir dans la télévision, la radio et la presse quotidienne ; l’édition et Internet ne relèvent que du droit de la concurrence.",
      "explainer": {
        "summary": "La question porte sur le pluralisme et l’indépendance de l’information : qui peut posséder chaînes, radios et journaux, quelle liberté laisser aux rédactions face aux propriétaires, et quel rôle donner à l’État. Les approches divergent : durcir les règles contre la concentration et les étendre à tous les supports, édition comprise, rendre les rédactions indépendantes des actionnaires, supprimer les aides à la presse et l’autorité de régulation de l’audiovisuel, ou garder les règles actuelles.",
        "points": [
          {
            "text": "Depuis une loi du 14 novembre 2016, tout journaliste a le droit de refuser toute pression, de ne pas révéler ses sources et de refuser de signer un contenu modifié à son insu ou contre sa volonté. Il ne peut pas être contraint d’accepter un acte contraire à sa conviction professionnelle, formée dans le respect de la charte de déontologie de son entreprise.",
            "source": {
              "title": "Loi du 29 juillet 1881 sur la liberté de la presse – article 2 bis (version en vigueur depuis le 16 novembre 2016)",
              "url": "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000033386692",
              "date": "2016-11-16",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Depuis le 8 août 2025, le règlement européen sur la liberté des médias s’applique en France. Chaque État doit prévoir des règles pour évaluer les rachats de médias qui pourraient peser fortement sur le pluralisme et l’indépendance éditoriale, en plus du contrôle de la concurrence. Les médias doivent aussi publier le nom de leurs propriétaires, recensés dans des bases de données nationales.",
            "source": {
              "title": "Règlement (UE) 2024/1083 du 11 avril 2024 établissant un cadre commun pour les services de médias dans le marché intérieur (règlement européen sur la liberté des médias), articles 6, 22 et 29",
              "url": "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32024R1083",
              "date": "2024-04-11",
              "publisher": "Journal officiel de l’Union européenne (EUR-Lex)"
            }
          },
          {
            "text": "L’Arcom est une autorité publique indépendante, née le 1er janvier 2022 de la fusion du Conseil supérieur de l’audiovisuel (CSA) et de la Hadopi. Elle régule la télévision et la radio, contrôle certaines obligations des plateformes en ligne et lutte contre le piratage. En 2024, elle a reçu plus de 100 000 saisines du public (demandes d’examen) sur des programmes, contre 30 000 à 50 000 les deux années précédentes.",
            "source": {
              "title": "Rapport d’information n° 68 (2025-2026) relatif à l’Autorité de régulation de la communication audiovisuelle et numérique",
              "url": "https://www.senat.fr/rap/r25-068/r25-068_mono.html",
              "date": "2025-10-23",
              "publisher": "Sénat, commission des finances"
            }
          }
        ],
        "figures": [
          {
            "value": "30 %",
            "label": "Seuil de diffusion nationale des quotidiens imprimés d’information politique et générale : une même personne ou un même groupe ne peut pas racheter ni prendre le contrôle d’un tel quotidien si l’opération lui fait dépasser ce seuil",
            "date": "Règle en vigueur (version du 21 septembre 2000)",
            "source": {
              "title": "Loi n° 86-897 du 1er août 1986 portant réforme du régime juridique de la presse – article 11",
              "url": "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006275056",
              "date": "2000-09-21",
              "publisher": "Légifrance"
            }
          },
          {
            "value": "7",
            "label": "Nombre maximal d’autorisations de chaînes nationales de la télévision numérique terrestre (TNT) qu’une même personne peut détenir, directement ou indirectement",
            "date": "Règle en vigueur (version du 27 octobre 2021)",
            "source": {
              "title": "Loi n° 86-1067 du 30 septembre 1986 relative à la liberté de communication – article 41",
              "url": "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000044259392",
              "date": "2021-10-27",
              "publisher": "Légifrance"
            }
          },
          {
            "value": "178,29 M€",
            "label": "Aides budgétaires à la presse écrite prévues pour 2026 par le projet de loi de finances, en baisse de 5,8 % sur un an. S’y ajoutent 65 M€ d’avantages fiscaux, dont 58 M€ pour le taux de TVA « super réduit » sur la presse",
            "date": "2026 (projet de loi de finances, rapport du 24 novembre 2025)",
            "source": {
              "title": "Projet de loi de finances pour 2026 : Médias, livre et industries culturelles (rapport général n° 139, tome III, annexe 18)",
              "url": "https://www.senat.fr/rap/l25-139-318/l25-139-318_mono.html",
              "date": "2025-11-24",
              "publisher": "Sénat, commission des finances"
            },
            "chart": {
              "kind": "compare",
              "unit": "M€",
              "items": [
                {
                  "label": "Aides budgétaires 2026",
                  "value": 178.29
                },
                {
                  "label": "Avantages fiscaux 2026",
                  "value": 65
                }
              ]
            }
          },
          {
            "value": "49,9 M€",
            "label": "Subvention de l’État à l’Arcom votée pour 2025, en baisse de plus de 1 M€ par rapport à 2024. Son plafond d’emplois est de 379 équivalents temps plein travaillés ; l’autorité en comptait 363 en 2025",
            "date": "2025 (loi de finances initiale)",
            "source": {
              "title": "Rapport d’information n° 68 (2025-2026) relatif à l’Autorité de régulation de la communication audiovisuelle et numérique",
              "url": "https://www.senat.fr/rap/r25-068/r25-068_mono.html",
              "date": "2025-10-23",
              "publisher": "Sénat, commission des finances"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "societe-x1-a",
          "text": "Durcir les règles contre la concentration des médias et les étendre à tous les supports, édition comprise"
        },
        {
          "id": "societe-x1-b",
          "text": "Rendre les rédactions indépendantes de leurs actionnaires, par un statut dédié ou une détention par des fondations"
        },
        {
          "id": "societe-x1-c",
          "text": "Supprimer les aides publiques versées à la presse ainsi que l’autorité chargée de réguler l’audiovisuel"
        },
        {
          "id": "societe-x1-d",
          "text": "Conserver les règles actuelles sur la concentration, sans nouvelle contrainte pour les propriétaires de médias",
          "external": true
        }
      ]
    },
    {
      "id": "territoires-x3",
      "topicId": "territoires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel statut donner à la Corse ?",
      "context": "Aujourd’hui : l’Assemblée nationale a adopté en juin 2026 un projet de révision de la Constitution donnant à la Corse une autonomie, avec le pouvoir d’adapter certaines lois ; le Sénat doit encore l’examiner.",
      "explainer": {
        "summary": "Faut-il inscrire dans la Constitution une autonomie de la Corse, avec le pouvoir d’adapter certaines lois ? Ses partisans invoquent l’insularité et le vote de l’Assemblée de Corse ; ses opposants, l’égalité devant la loi ; d’autres préfèrent une autonomie plus limitée, ou des pouvoirs nouveaux pour toutes les collectivités ou pour celles qui le demandent.",
        "points": [
          {
            "text": "Le texte adopté par les députés créerait un article 72-5 donnant à la Corse un « statut d’autonomie au sein de la République ». Une loi organique pourrait l’habiliter à adapter des lois et règlements, et à fixer ses propres normes dans ses domaines de compétence, sous le contrôle du Conseil d’État et du Conseil constitutionnel. Nationalité, droits civiques, justice, droit pénal, défense, sécurité, monnaie et droit électoral resteraient exclus, et ces normes devraient assurer « l’égalité de tous sans distinction ». Le Gouvernement pourrait aussi adapter des lois par ordonnance. Les électeurs inscrits en Corse seraient consultés sur le projet de statut.",
            "source": {
              "title": "Projet de loi constitutionnelle adopté par l’Assemblée nationale pour une Corse autonome au sein de la République (Sénat, n° 782, 2025-2026)",
              "url": "https://www.senat.fr/leg/pjl25-782.pdf",
              "date": "2026-06-24",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Adopté par l’Assemblée nationale le 23 juin 2026, le projet a été transmis au Sénat le lendemain. Sa discussion en séance publique y est prévue le 26 octobre 2026.",
            "source": {
              "title": "Une Corse autonome au sein de la République – dossier législatif",
              "url": "https://www.senat.fr/dossier-legislatif/pjl24-869.html",
              "date": "2026-09-23",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Une révision de la Constitution doit être votée dans les mêmes termes par les deux assemblées. Elle est ensuite approuvée par référendum ou, pour un projet du Gouvernement, par le Parlement réuni en Congrès, à la majorité des trois cinquièmes des suffrages exprimés (article 89). Sans statut particulier, toute collectivité peut déjà, si la loi le prévoit, déroger à titre expérimental à certaines règles, pour un objet et une durée limités (article 72). Les départements et régions d’outre-mer peuvent aussi être habilités à adapter des lois (article 73).",
            "source": {
              "title": "Constitution du 4 octobre 1958, texte intégral en vigueur (articles 72, 73 et 89)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "271",
            "label": "voix des députés pour le projet de révision constitutionnelle sur la Corse le 23 juin 2026, face à 202 voix contre et 64 abstentions (537 votants, 473 suffrages exprimés)",
            "date": "2026-06-23",
            "source": {
              "title": "Scrutin public n° 7454 – Première séance du mardi 23 juin 2026",
              "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/7454",
              "date": "2026-06-23",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "députés",
              "items": [
                {
                  "label": "Pour",
                  "value": 271
                },
                {
                  "label": "Contre",
                  "value": 202
                },
                {
                  "label": "Abstentions",
                  "value": 64
                }
              ]
            }
          },
          {
            "value": "49",
            "label": "voix de l’Assemblée de Corse pour les alinéas donnant un pouvoir normatif à la Corse, le 27 mars 2024, face à 13 voix contre et 1 abstention ; l’ensemble du texte avait recueilli 62 voix pour et 1 contre",
            "date": "2024-03-27",
            "source": {
              "title": "Rapport n° 2865 fait au nom de la commission des lois sur le projet de loi constitutionnelle pour une Corse autonome au sein de la République",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/RAPPANR5L17B2865.html",
              "date": "2026-06-03",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "élus",
              "items": [
                {
                  "label": "Pour",
                  "value": 49
                },
                {
                  "label": "Contre",
                  "value": 13
                },
                {
                  "label": "Abstention",
                  "value": 1
                }
              ]
            }
          },
          {
            "value": "57",
            "label": "demandes d’adaptation de lois ou de règlements adressées au Premier ministre par la Corse depuis 1991, au titre de son droit actuel de proposition, selon le recensement de la Collectivité de Corse : 4 ont reçu une suite favorable, 3 un rejet explicite, les autres aucune réponse",
            "date": "1991-2026",
            "source": {
              "title": "Rapport n° 2865 fait au nom de la commission des lois sur le projet de loi constitutionnelle pour une Corse autonome au sein de la République",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/RAPPANR5L17B2865.html",
              "date": "2026-06-03",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "part",
              "value": 4,
              "total": 57,
              "whole": "demandes d’adaptation"
            }
          },
          {
            "value": "4",
            "label": "expérimentations menées depuis 2003 par des collectivités au titre de leur droit de déroger, à titre expérimental, à des lois ou règlements (article 72 de la Constitution), contre 28 expérimentations concernant les collectivités décidées par l’État (article 37-1)",
            "date": "2003-2026",
            "source": {
              "title": "Rapport n° 2865 fait au nom de la commission des lois sur le projet de loi constitutionnelle pour une Corse autonome au sein de la République",
              "url": "https://www.assemblee-nationale.fr/dyn/opendata/RAPPANR5L17B2865.html",
              "date": "2026-06-03",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "expérimentations",
              "items": [
                {
                  "label": "Collectivités (article 72)",
                  "value": 4
                },
                {
                  "label": "État (article 37-1)",
                  "value": 28
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "territoires-x3-a",
          "text": "Inscrire l’autonomie de la Corse dans la Constitution, avec le pouvoir d’adapter certaines lois, après un vote des Corses"
        },
        {
          "id": "territoires-x3-b",
          "text": "Accorder à la Corse une autonomie encadrée, sans lui donner le pouvoir d’adapter elle-même les lois"
        },
        {
          "id": "territoires-x3-c",
          "text": "Refuser tout nouveau statut pour la Corse, afin que les mêmes lois s’appliquent sur tout le territoire"
        },
        {
          "id": "territoires-x3-d",
          "text": "Étendre les libertés locales de toutes les collectivités, plutôt que de créer un statut propre à la Corse"
        },
        {
          "id": "territoires-x3-e",
          "text": "Permettre à d’autres régions ou territoires qui le demandent d’obtenir eux aussi des pouvoirs propres"
        }
      ]
    },
    {
      "id": "territoires-x4",
      "topicId": "territoires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel avenir institutionnel pour la Nouvelle-Calédonie ?",
      "context": "Aujourd’hui : trois référendums ont rejeté l’indépendance, le dernier (2021) boycotté par les indépendantistes ; l’accord de 2025 prévoyait un État de la Nouvelle-Calédonie au sein de la République, mais l’Assemblée nationale a rejeté en avril 2026 la révision de la Constitution nécessaire.",
      "explainer": {
        "summary": "Après trois référendums, les émeutes de mai 2024 et un accord signé en 2025, l’avenir institutionnel de la Nouvelle-Calédonie reste à fixer. Le débat porte sur l’indépendance, le partage des pouvoirs avec l’État et la composition du corps électoral, sur fond de crise économique.",
        "points": [
          {
            "text": "Signé le 12 juillet 2025 et complété par un accord du 19 janvier 2026, l’accord de Bougival se présente comme une « nouvelle étape sur la voie de la décolonisation et de l’émancipation ». Il prévoit un « État de la Nouvelle-Calédonie » appartenant à l’ensemble national, doté d’une Loi fondamentale et d’une nationalité calédonienne indissociable de la nationalité française. Le Congrès local pourrait demander, à la majorité de 36 membres, le transfert de compétences régaliennes (celles liées à la souveraineté, comme la défense ou la justice) ; un projet conjoint avec l’État serait ensuite soumis aux Calédoniens. L’une des forces politiques historiques favorables à l’indépendance s’est retirée de l’accord le 9 août 2025 et n’a pas participé aux négociations de janvier 2026.",
            "source": {
              "title": "L’essentiel sur le rapport législatif – Projet de loi constitutionnelle relatif à la Nouvelle-Calédonie",
              "url": "https://www.senat.fr/lessentiel/pjl25-023.pdf",
              "date": "2026-02",
              "publisher": "Sénat (commission des lois)"
            }
          },
          {
            "text": "Le Sénat a adopté le 24 février 2026 la révision de la Constitution qui devait traduire ces accords. L’Assemblée nationale l’a rejetée le 2 avril 2026. Le texte a été transmis au Sénat en deuxième lecture le 3 avril 2026 ; au 7 octobre 2026, il n’avait pas été réexaminé.",
            "source": {
              "title": "Projet de loi constitutionnelle relatif à la Nouvelle-Calédonie – dossier législatif",
              "url": "https://www.senat.fr/dossier-legislatif/pjl25-023.html",
              "date": "2026-10-07",
              "publisher": "Sénat"
            }
          },
          {
            "text": "Le statut actuel découle de l’accord de Nouméa du 5 mai 1998. Le Congrès et les assemblées de province sont élus par un corps électoral restreint, défini par référence au scrutin de 1998 : il réunit pour l’essentiel les électeurs installés avant cette date et leurs enfants. Une loi organique, jugée conforme à la Constitution le 28 mai 2026, y a ajouté les personnes nées en Nouvelle-Calédonie et inscrites sur la liste électorale générale.",
            "source": {
              "title": "Décision n° 2026-905 DC du 28 mai 2026 – Loi organique portant régularisation des natifs dans le corps électoral pour les élections au congrès et aux assemblées de province de Nouvelle-Calédonie",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026905DC.htm",
              "date": "2026-05-28",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "96,50 %",
            "label": "de « non » à l’indépendance au troisième référendum (12 décembre 2021), contre 53,26 % en 2020 et 56,67 % en 2018 (part des suffrages exprimés)",
            "date": "2021-12-12",
            "source": {
              "title": "Résultats définitifs des référendums de 2018, 2020 et 2021 proclamés par la commission de contrôle",
              "url": "https://www.nouvelle-caledonie.gouv.fr/index.php/contenu/telechargement/9258/71413/file/R%C3%A9sultats%20d%C3%A9finitifs%20R%C3%A9f%C3%A9rendum%20NC%20du%2012%20d%C3%A9cembre%202021.pdf",
              "date": "2021-12-13",
              "publisher": "Haut-commissariat de la République en Nouvelle-Calédonie"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2018",
                  "value": 56.67
                },
                {
                  "label": "2020",
                  "value": 53.26
                },
                {
                  "label": "2021",
                  "value": 96.5
                }
              ]
            }
          },
          {
            "value": "43,87 %",
            "label": "de participation au référendum du 12 décembre 2021, contre 85,69 % en 2020 et 81,01 % en 2018",
            "date": "2021-12-12",
            "source": {
              "title": "Résultats définitifs des référendums de 2018, 2020 et 2021 proclamés par la commission de contrôle",
              "url": "https://www.nouvelle-caledonie.gouv.fr/index.php/contenu/telechargement/9258/71413/file/R%C3%A9sultats%20d%C3%A9finitifs%20R%C3%A9f%C3%A9rendum%20NC%20du%2012%20d%C3%A9cembre%202021.pdf",
              "date": "2021-12-13",
              "publisher": "Haut-commissariat de la République en Nouvelle-Calédonie"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2018",
                  "value": 81.01
                },
                {
                  "label": "2020",
                  "value": 85.69
                },
                {
                  "label": "2021",
                  "value": 43.87
                }
              ]
            }
          },
          {
            "value": "37 492",
            "label": "électeurs inscrits sur la liste électorale générale mais non admis à voter aux élections provinciales en avril 2026 (« tableau annexe »), avant la loi organique sur les natifs, dont 10 575 natifs, contre 8 868 en 1998 ; le corps électoral provincial comptait alors 181 188 électeurs",
            "date": "2026-04",
            "source": {
              "title": "Rapport n° 630 (2025-2026) sur la proposition de loi organique portant intégration des natifs dans le corps électoral pour les élections au congrès et aux assemblées de province de la Nouvelle-Calédonie",
              "url": "https://www.senat.fr/rap/l25-630/l25-630_mono.html",
              "date": "2026-05-18",
              "publisher": "Sénat (commission des lois)"
            },
            "chart": {
              "kind": "compare",
              "unit": "électeurs",
              "items": [
                {
                  "label": "Corps électoral provincial",
                  "value": 181188
                },
                {
                  "label": "Non admis (tableau annexe)",
                  "value": 37492
                }
              ]
            }
          },
          {
            "value": "11 000",
            "label": "emplois privés perdus (« près de » 11 000) à la suite des émeutes de 2024, ainsi que 1 200 emplois publics ; près de 800 entreprises ont disparu, selon la commission des lois du Sénat",
            "date": "2026-02",
            "source": {
              "title": "L’essentiel sur le rapport législatif – Projet de loi constitutionnelle relatif à la Nouvelle-Calédonie",
              "url": "https://www.senat.fr/lessentiel/pjl25-023.pdf",
              "date": "2026-02",
              "publisher": "Sénat (commission des lois)"
            },
            "chart": {
              "kind": "compare",
              "unit": "emplois perdus",
              "items": [
                {
                  "label": "Emplois privés",
                  "value": 11000
                },
                {
                  "label": "Emplois publics",
                  "value": 1200
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "territoires-x4-a",
          "text": "Accompagner la Nouvelle-Calédonie vers l’indépendance, en organisant le transfert des pouvoirs de l’État"
        },
        {
          "id": "territoires-x4-b",
          "text": "Appliquer l’accord signé en 2025, qui crée un État et une nationalité calédoniens au sein de la République"
        },
        {
          "id": "territoires-x4-c",
          "text": "Reprendre la négociation entre toutes les forces calédoniennes pour aboutir à un nouvel accord global"
        },
        {
          "id": "territoires-x4-d",
          "text": "Prolonger le cadre actuel pendant plusieurs décennies, en donnant la priorité au redressement économique"
        },
        {
          "id": "territoires-x4-e",
          "text": "Maintenir définitivement la Nouvelle-Calédonie dans la France, sans nouveau référendum sur l’indépendance"
        }
      ]
    },
    {
      "id": "territoires-x5",
      "topicId": "territoires",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Que faire de l’objectif de zéro artificialisation nette des sols ?",
      "context": "Aujourd’hui : la loi vise zéro artificialisation nette des sols en 2050 ; un assouplissement voté en 2026 a été censuré par le Conseil constitutionnel pour une raison de procédure.",
      "explainer": {
        "summary": "La loi vise zéro artificialisation nette des sols en 2050 : à partir de cette date, les surfaces nouvellement artificialisées devront être compensées par autant de surfaces rendues à la nature. Ses défenseurs y voient une protection des terres agricoles et de la biodiversité, et certains veulent l’avancer ; ses critiques jugent qu’elle freine le logement, l’industrie et les communes rurales, et veulent l’assouplir ou la supprimer.",
        "points": [
          {
            "text": "La loi Climat et résilience (2021) fixe une étape : réduire de moitié, entre 2021 et 2031, la consommation d’espaces naturels, agricoles et forestiers par rapport à 2011-2021. À partir de 2031, on comptera l’artificialisation « nette », c’est-à-dire le solde entre les sols artificialisés et ceux rendus à la nature (renaturés).",
            "source": {
              "title": "Analyse de la consommation d’espaces naturels agricoles et forestiers – Période du 1er janvier 2011 au 1er janvier 2025",
              "url": "https://artificialisation.developpement-durable.gouv.fr/sites/artificialisation/files/fichiers/2026/06/determinants_2011-2025.pdf",
              "date": "2026-05",
              "publisher": "Cerema, pour le ministère de la Transition écologique"
            }
          },
          {
            "text": "Une loi du 20 juillet 2023 a modifié le dispositif. Sur 2021-2031, toute commune couverte par un document d’urbanisme prescrit, arrêté ou approuvé avant le 22 août 2026 peut consommer au moins un hectare. Les grands projets d’envergure nationale ou européenne d’intérêt général majeur sont comptés au niveau national, hors des surfaces allouées à chaque territoire.",
            "source": {
              "title": "Artificialisation des sols",
              "url": "https://www.ecologie.gouv.fr/politiques-publiques/artificialisation-sols",
              "date": "2025-10-27",
              "publisher": "Ministère de la Transition écologique"
            }
          },
          {
            "text": "Le 21 mai 2026, le Conseil constitutionnel a censuré des dispositions ajoutées en cours de débat à la loi de simplification de la vie économique, faute de lien, même indirect, avec le projet initial. Elles retiraient du décompte certains projets industriels d’intérêt national majeur et permettaient, sous conditions, de dépasser l’objectif local de consommation d’espaces. Le Conseil ne s’est pas prononcé sur leur contenu.",
            "source": {
              "title": "Décision n° 2026-903 DC du 21 mai 2026 – Loi de simplification de la vie économique",
              "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026903DC.htm",
              "date": "2026-05-21",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "15 119 ha",
            "label": "d’espaces naturels, agricoles et forestiers consommés en 2024 (France entière, Hexagone et DROM, chiffre provisoire), plus bas niveau mesuré depuis 2011 : contre 29 470 ha en 2011 et 20 130 ha en 2021, dans un contexte de baisse de la production de logements et de locaux d’activité depuis 2020",
            "date": "2024",
            "source": {
              "title": "Analyse de la consommation d’espaces naturels agricoles et forestiers – Période du 1er janvier 2011 au 1er janvier 2025",
              "url": "https://artificialisation.developpement-durable.gouv.fr/sites/artificialisation/files/fichiers/2026/06/determinants_2011-2025.pdf",
              "date": "2026-05",
              "publisher": "Cerema, pour le ministère de la Transition écologique"
            },
            "chart": {
              "kind": "series",
              "unit": "ha",
              "items": [
                {
                  "label": "2011",
                  "value": 29470
                },
                {
                  "label": "2021",
                  "value": 20130
                },
                {
                  "label": "2024",
                  "value": 15119
                }
              ]
            }
          },
          {
            "value": "65 %",
            "label": "des espaces consommés entre 2011 et 2021 l’ont été pour l’habitat, contre 22 % pour les activités économiques et 7 % pour les infrastructures ; la part de l’habitat reste stable sur 2021-2025",
            "date": "2011-2021",
            "source": {
              "title": "Analyse de la consommation d’espaces naturels agricoles et forestiers – Période du 1er janvier 2011 au 1er janvier 2025",
              "url": "https://artificialisation.developpement-durable.gouv.fr/sites/artificialisation/files/fichiers/2026/06/determinants_2011-2025.pdf",
              "date": "2026-05",
              "publisher": "Cerema, pour le ministère de la Transition écologique"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Habitat",
                  "value": 65
                },
                {
                  "label": "Activités économiques",
                  "value": 22
                },
                {
                  "label": "Infrastructures",
                  "value": 7
                }
              ]
            }
          },
          {
            "value": "68 %",
            "label": "de la consommation d’espaces sur 2021-2025 réalisée dans les communes rurales, qui représentent 88 % des communes, contre 65 % sur 2011-2021",
            "date": "2021-2025",
            "source": {
              "title": "Analyse de la consommation d’espaces naturels agricoles et forestiers – Période du 1er janvier 2011 au 1er janvier 2025",
              "url": "https://artificialisation.developpement-durable.gouv.fr/sites/artificialisation/files/fichiers/2026/06/determinants_2011-2025.pdf",
              "date": "2026-05",
              "publisher": "Cerema, pour le ministère de la Transition écologique"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2011-2021",
                  "value": 65
                },
                {
                  "label": "2021-2025",
                  "value": 68
                }
              ]
            }
          },
          {
            "value": "30 %",
            "label": "des communes ont réalisé 80 % de la consommation d’espaces entre 2011 et 2025, avec en moyenne 1,64 ha par an chacune ; la consommation annuelle moyenne d’une commune est passée de 0,65 ha sur 2011-2021 à 0,52 ha sur 2021-2025",
            "date": "2011-2025",
            "source": {
              "title": "Analyse de la consommation d’espaces naturels agricoles et forestiers – Période du 1er janvier 2011 au 1er janvier 2025",
              "url": "https://artificialisation.developpement-durable.gouv.fr/sites/artificialisation/files/fichiers/2026/06/determinants_2011-2025.pdf",
              "date": "2026-05",
              "publisher": "Cerema, pour le ministère de la Transition écologique"
            },
            "chart": {
              "kind": "series",
              "unit": "ha par an et par commune",
              "items": [
                {
                  "label": "2011-2021",
                  "value": 0.65
                },
                {
                  "label": "2021-2025",
                  "value": 0.52
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "territoires-x5-a",
          "text": "Supprimer cet objectif et laisser chaque commune décider de l’usage de ses terrains"
        },
        {
          "id": "territoires-x5-b",
          "text": "Assouplir cet objectif selon les territoires, par exemple pour les friches ou les projets industriels"
        },
        {
          "id": "territoires-x5-c",
          "text": "Maintenir cet objectif et son calendrier actuel, sans l’assouplir ni en avancer l’échéance"
        },
        {
          "id": "territoires-x5-d",
          "text": "Renforcer cet objectif et l’appliquer plus tôt, en construisant moins sur les terres agricoles et naturelles"
        }
      ]
    },
    {
      "id": "agriculture-x4",
      "topicId": "agriculture",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Comment garantir le revenu des agriculteurs ?",
      "context": "Aujourd’hui : des lois adoptées depuis 2018 encadrent les négociations entre agriculteurs, industriels et distributeurs pour mieux protéger le prix payé aux producteurs.",
      "explainer": {
        "summary": "Les exploitants agricoles vivent plus souvent sous le seuil de pauvreté que l’ensemble de la population, leurs revenus varient fortement d’une année à l’autre, et le prix payé par le consommateur se partage entre de nombreux maillons, de la ferme au magasin. Les approches divergent : prix planchers fixés par l’État, encadrement des marges, baisse des charges et des normes, renforcement des règles de négociation, ou allocation versée à chacun pour acheter des aliments conventionnés.",
        "points": [
          {
            "text": "Depuis le 1er janvier 2023, la loi du 18 octobre 2021, dite EGalim 2, impose en principe un contrat écrit pour la vente d’un produit agricole, avec une clause de révision automatique du prix. Entre industriels et distributeurs, la part de la matière première agricole dans le prix n’est pas négociable. Un décret peut aussi rendre obligatoire un « tunnel de prix », c’est-à-dire des bornes minimale et maximale entre lesquelles le prix évolue : c’est le cas pour la viande bovine.",
            "source": {
              "title": "Tout comprendre de la loi EGalim 2",
              "url": "https://agriculture.gouv.fr/tout-comprendre-de-la-loi-egalim-2",
              "date": "2023-04-13",
              "publisher": "Ministère de l’Agriculture"
            }
          },
          {
            "text": "La loi d’urgence agricole du 18 août 2026 renforce ces règles. Les contrats doivent se référer en priorité aux indicateurs de coûts de production, sauf si les deux parties choisissent ensemble d’autres indicateurs. Dans un tunnel de prix, la borne basse repose sur ces indicateurs en cas d’accord de l’interprofession (l’organisation qui réunit les acteurs d’une filière) ou, à défaut, d’un décret ; les parties restent libres d’en choisir un autre. Les clauses obligeant l’agriculteur à baisser son prix si un concurrent a vendu moins cher sont nulles. Entre industriel et distributeur, la clause de révision automatique du prix devient non négociable, si l’industriel affiche l’origine de ses matières agricoles.",
            "source": {
              "title": "La loi d’urgence pour la protection et la souveraineté agricoles promulguée par le président de la République",
              "url": "https://agriculture.gouv.fr/la-loi-durgence-pour-la-protection-et-la-souverainete-agricoles-promulguee-par-le-president-de-la",
              "date": "2026-08-19",
              "publisher": "Ministère de l’Agriculture, de l’Agro-alimentaire et de la Souveraineté alimentaire"
            }
          }
        ],
        "figures": [
          {
            "value": "6,4 €",
            "label": "Valeur ajoutée de l’agriculture française pour 100 € de dépenses alimentaires en France en 2021, contre 9,4 € pour les industries agroalimentaires et 18,8 € pour le commerce (petits commerces, grande distribution, grossistes…). Mesurée en valeur de production, et non en valeur ajoutée, l’agriculture française représente 13,2 € sur ces 100 €. L’année 2021, la plus récente disponible, reste marquée par les confinements, qui ont reporté des dépenses de la restauration vers le commerce alimentaire.",
            "date": "2021",
            "source": {
              "title": "Rapport au Parlement 2026 de l’Observatoire de la formation des prix et des marges des produits alimentaires (chapitre 2, schémas 6 et 7)",
              "url": "https://observatoire-prixmarges.franceagrimer.fr/sites/default/files/PDF/2026_rapport_ofpm_v2.pdf",
              "date": "2026",
              "publisher": "Observatoire de la formation des prix et des marges des produits alimentaires (FranceAgriMer)"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Agriculture française",
                  "value": 6.4
                },
                {
                  "label": "Industries agroalimentaires",
                  "value": 9.4
                },
                {
                  "label": "Commerce",
                  "value": 18.8
                }
              ]
            }
          },
          {
            "value": "1,1 €",
            "label": "Marge nette moyenne des rayons alimentaires frais des grandes surfaces pour 100 € de chiffre d’affaires en 2024, une fois payés les achats, le personnel, les autres charges et l’impôt sur les sociétés. Leur marge brute est de 29,4 € (sept rayons, six enseignes).",
            "date": "2024",
            "source": {
              "title": "Rapport au Parlement 2026 de l’Observatoire de la formation des prix et des marges des produits alimentaires (section 11, tableau 32)",
              "url": "https://observatoire-prixmarges.franceagrimer.fr/sites/default/files/PDF/2026_rapport_ofpm_v2.pdf",
              "date": "2026",
              "publisher": "Observatoire de la formation des prix et des marges des produits alimentaires (FranceAgriMer)"
            },
            "chart": {
              "kind": "compare",
              "unit": "€",
              "items": [
                {
                  "label": "Marge brute",
                  "value": 29.4
                },
                {
                  "label": "Marge nette",
                  "value": 1.1
                }
              ]
            }
          },
          {
            "value": "17,7 %",
            "label": "Part des exploitants agricoles vivant sous le seuil de pauvreté monétaire en 2020, contre 14,4 % dans l’ensemble de la population (France métropolitaine)",
            "date": "2020",
            "source": {
              "title": "Les exploitants agricoles vivent plus souvent sous le seuil de pauvreté que l’ensemble de la population (Emploi et revenus des indépendants, édition 2025)",
              "url": "https://www.insee.fr/fr/statistiques/8376591?sommaire=8376600",
              "date": "2025-05-21",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Exploitants agricoles",
                  "value": 17.7
                },
                {
                  "label": "Ensemble de la population",
                  "value": 14.4
                }
              ]
            }
          },
          {
            "value": "+10,4 %",
            "label": "Évolution en 2025 de la valeur ajoutée agricole par emploi, en termes réels, après -12,0 % en 2024 et -10,2 % en 2023 (compte provisoire). Cette valeur ajoutée « au coût des facteurs » atteint 44,4 Md€ en 2025. Elle part de la production (94,9 Md€), dont on retire les consommations intermédiaires comme les aliments pour animaux, les engrais ou l’énergie (57,3 Md€), puis ajoute les subventions d’exploitation (8,0 Md€) et déduit les autres impôts sur la production (1,3 Md€).",
            "date": "2025",
            "source": {
              "title": "Le compte provisoire de l’agriculture en 2025 – Les prix et les volumes rebondissent après la chute de 2024 (Insee Première n° 2116)",
              "url": "https://www.insee.fr/fr/statistiques/9018334?sommaire=9019233",
              "date": "2026-07-07",
              "publisher": "Insee"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2023",
                  "value": -10.2
                },
                {
                  "label": "2024",
                  "value": -12
                },
                {
                  "label": "2025",
                  "value": 10.4
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "agriculture-x4-a",
          "text": "Fixer par l’État des prix planchers garantis aux producteurs, au moins égaux à leurs coûts de production"
        },
        {
          "id": "agriculture-x4-b",
          "text": "Encadrer les marges de l’industrie agroalimentaire et de la grande distribution sur les produits agricoles"
        },
        {
          "id": "agriculture-x4-c",
          "text": "Alléger les cotisations, les impôts de production et les normes applicables aux exploitations agricoles"
        },
        {
          "id": "agriculture-x4-d",
          "text": "Renforcer les règles qui protègent le prix agricole dans les négociations avec l’industrie et la distribution"
        },
        {
          "id": "agriculture-x4-e",
          "text": "Verser à chacun une allocation réservée à l’achat d’aliments conventionnés, en privilégiant les productions locales",
          "external": true
        }
      ]
    },
    {
      "id": "ecologie_energie-x9",
      "topicId": "ecologie_energie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle place donner à la croissance économique ?",
      "explainer": {
        "summary": "Faut-il continuer de faire de la hausse du produit intérieur brut (PIB), qui mesure la richesse produite, un objectif central ? Le débat porte sur ce que la croissance permet de financer, comme les services publics, sur la possibilité de produire plus tout en réduisant les émissions et les ressources consommées, et sur ce qui doit guider la production : le marché et l’innovation, ou une planification selon les besoins.",
        "points": [
          {
            "text": "Le PIB vise à mesurer la richesse créée par tous les acteurs, privés et publics, sur le territoire national pendant une période donnée. La « croissance » désigne sa hausse. Une partie du débat porte sur le « découplage » : peut-on augmenter le PIB tout en réduisant les émissions de gaz à effet de serre et la consommation d’énergie et de matières ?",
            "source": {
              "title": "Définition : Produit intérieur brut aux prix du marché (PIB)",
              "url": "https://www.insee.fr/fr/metadonnees/definition/c1365",
              "publisher": "INSEE"
            }
          },
          {
            "text": "Une loi du 13 avril 2015 oblige le gouvernement à remettre au Parlement, avant le 1er juin de chaque année, un rapport sur de « nouveaux indicateurs de richesse » qui complètent le PIB : inégalités, qualité de vie, développement durable. Ce rapport doit aussi évaluer l’impact des principales réformes engagées.",
            "source": {
              "title": "Loi n° 2015-411 du 13 avril 2015 visant à la prise en compte des nouveaux indicateurs de richesse dans la définition des politiques publiques",
              "url": "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030478182",
              "date": "2015-04-14",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Le code de l’énergie fixe un objectif de baisse de la consommation finale d’énergie, celle des utilisateurs : −50 % en 2050 par rapport à 2012, avec une étape à −20 % en 2030. Il vise aussi une baisse de 40 % de la consommation primaire d’énergies fossiles d’ici 2030, par rapport à 2012.",
            "source": {
              "title": "Code de l’énergie, article L100-4 (version en vigueur depuis le 24 juin 2023)",
              "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047717642",
              "date": "2023-06-24",
              "publisher": "Légifrance"
            }
          }
        ],
        "figures": [
          {
            "value": "0,4 %",
            "label": "Croissance du PIB de la France prévue en 2026 par la Banque de France, puis 0,9 % en 2027 et 1,2 % en 2028 (projections de septembre 2026). Principale source d’incertitude : le conflit au Moyen-Orient et ses effets sur les prix de l’énergie.",
            "date": "2026-09-15",
            "source": {
              "title": "Projections macroéconomiques intermédiaires – Septembre 2026",
              "url": "https://www.banque-france.fr/fr/publications-et-statistiques/publications/projections-macroeconomiques-intermediaires-septembre-2026",
              "date": "2026-09-15",
              "publisher": "Banque de France"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2026",
                  "value": 0.4
                },
                {
                  "label": "2027",
                  "value": 0.9
                },
                {
                  "label": "2028",
                  "value": 1.2
                }
              ]
            }
          },
          {
            "value": "plus de 37 %",
            "label": "Baisse des émissions de gaz à effet de serre de l’Union européenne entre 1990 et 2024 (39 % hors transport aérien et maritime international). Sur la même période, son économie a progressé de 71 %, selon la Commission européenne. Ce chiffre concerne l’ensemble de l’UE, pas la France seule.",
            "date": "1990-2024 (page mise à jour le 7 janvier 2026)",
            "source": {
              "title": "Progress made in cutting emissions",
              "url": "https://climate.ec.europa.eu/eu-action/climate-strategies-targets/progress-climate-action_en",
              "date": "2026-01-07",
              "publisher": "Commission européenne"
            }
          },
          {
            "value": "−6 %",
            "label": "Baisse des émissions « importées » de la France entre 2015 et 2024, c’est-à-dire produites à l’étranger pour fabriquer ce que la France importe. Sur le territoire, les émissions brutes ont baissé de 22 % entre 2015 et 2025. Selon le Haut Conseil pour le climat, les émissions importées forment la majorité de l’empreinte carbone de la France.",
            "date": "2015-2024",
            "source": {
              "title": "Rapport annuel 2026 « Dangers climatiques : la France face à ses responsabilités » – Résumé exécutif et recommandations",
              "url": "https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/HCC_RA2026-Resume-executif-Recommandations_1707.pdf",
              "date": "2026-07-09",
              "publisher": "Haut Conseil pour le climat"
            }
          },
          {
            "value": "plus de 2 points de PIB",
            "label": "Investissement supplémentaire nécessaire en 2030 pour décarboner l’économie, par rapport à un scénario sans action pour le climat, selon un rapport de France Stratégie de mai 2023. Pendant la transition, la productivité progresserait moins vite, d’environ un quart de point par an.",
            "date": "2023-05-22",
            "source": {
              "title": "Les incidences économiques de l’action pour le climat",
              "url": "https://www.strategie-plan.gouv.fr/publications/incidences-economiques-de-laction-climat",
              "date": "2023-05-22",
              "publisher": "France Stratégie (aujourd’hui Haut-commissariat à la Stratégie et au Plan)"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ecologie_energie-x9-a",
          "text": "Faire de la croissance économique la priorité, pour créer des richesses et financer les services publics"
        },
        {
          "id": "ecologie_energie-x9-b",
          "text": "Viser une croissance qui réduit les émissions, grâce à l’innovation et aux technologies bas carbone"
        },
        {
          "id": "ecologie_energie-x9-c",
          "text": "Abandonner l’objectif de croissance du produit intérieur brut et réduire les consommations d’énergie et de matières"
        },
        {
          "id": "ecologie_energie-x9-d",
          "text": "Planifier collectivement la production selon les besoins et les limites de la planète, plutôt que selon le marché"
        }
      ]
    },
    {
      "id": "securite_justice-x1",
      "topicId": "securite_justice",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel rôle donner aux polices municipales ?",
      "context": "Aujourd’hui : chaque commune décide de se doter ou non d’une police municipale ; l’armement de ses agents est autorisé par le préfet à la demande du maire.",
      "explainer": {
        "summary": "Les polices municipales, placées sous l’autorité des maires, ont vu leurs effectifs augmenter, et leurs agents sont de plus en plus souvent dotés d’armes à feu. Le débat porte sur leur rôle : recevoir davantage d’armes et de pouvoirs (amendes, accès aux fichiers, contrôles d’identité), laisser chaque commune décider, ou s’en tenir à la prévention et à la tranquillité publique, voire désarmer leurs agents.",
        "points": [
          {
            "text": "Les policiers municipaux sont des « agents de police judiciaire adjoints » : ils ne constatent que les infractions que la loi leur attribue, ne peuvent pas procéder à des contrôles d’identité et peuvent seulement relever l’identité des auteurs de ces infractions. En 2011 et en 2021, le Conseil constitutionnel a censuré des extensions de leurs pouvoirs, notamment faute de contrôle direct et effectif du procureur de la République.",
            "source": {
              "title": "Rapport n° 315 (2025-2026) sur le projet de loi relatif à l’extension des prérogatives, des moyens, de l’organisation et du contrôle des polices municipales et des gardes champêtres",
              "url": "https://www.senat.fr/rap/l25-315/l25-315_mono.html",
              "date": "28 janvier 2026",
              "publisher": "Sénat – commission des lois"
            }
          },
          {
            "text": "Un projet de loi sur les polices municipales, en procédure accélérée, a été adopté par le Sénat en première lecture le 10 février 2026, puis examiné par la commission des lois de l’Assemblée nationale (texte de la commission du 29 avril 2026). Au 7 octobre 2026, il n’avait pas encore été examiné en séance publique à l’Assemblée.",
            "source": {
              "title": "Projet de loi relatif à l’extension des prérogatives, des moyens, de l’organisation et du contrôle des polices municipales et des gardes champêtres – dossier législatif",
              "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N53096",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Assemblée nationale"
            }
          },
          {
            "text": "Dans la version adoptée par la commission des lois du Sénat, ce texte laisse chaque commune libre de créer un service de police municipale « à compétence judiciaire élargie », encadré par des responsables habilités par le procureur général et offrant des garanties équivalentes à celles d’un officier de police judiciaire. Ses agents pourraient constater certains délits (vente à la sauvette, usage de stupéfiants, conduite sans permis…), dresser des amendes forfaitaires délictuelles (qui sanctionnent un délit sans passage devant le tribunal, sauf contestation) et accéder, sous conditions, à certains fichiers de police. Le texte élargit aussi les cas de relevé d’identité.",
            "source": {
              "title": "Rapport n° 315 (2025-2026) sur le projet de loi relatif à l’extension des prérogatives, des moyens, de l’organisation et du contrôle des polices municipales et des gardes champêtres",
              "url": "https://www.senat.fr/rap/l25-315/l25-315_mono.html",
              "date": "28 janvier 2026",
              "publisher": "Sénat – commission des lois"
            }
          }
        ],
        "figures": [
          {
            "value": "28 161",
            "label": "policiers municipaux, employés par 3 812 communes ou intercommunalités ; hausse de 45 % depuis 2012 – France",
            "date": "2023",
            "source": {
              "title": "Rapport n° 315 (2025-2026) sur le projet de loi relatif à l’extension des prérogatives, des moyens, de l’organisation et du contrôle des polices municipales et des gardes champêtres",
              "url": "https://www.senat.fr/rap/l25-315/l25-315_mono.html",
              "date": "28 janvier 2026",
              "publisher": "Sénat – commission des lois"
            }
          },
          {
            "value": "77,2 %",
            "label": "des policiers municipaux sont armés (21 762 agents, contre 15 765 en 2012), une part restée proche de 80 % ; 3 168 communes ou intercommunalités, soit 83,1 % de celles qui ont une police municipale, l’ont armée, contre 2 516 en 2016 – France",
            "date": "31 décembre 2023",
            "source": {
              "title": "Rapport d’information n° 671 (2024-2025) « 25 propositions pour donner aux polices municipales les moyens de lutter contre l’insécurité du quotidien » (d’après les données du ministère de l’Intérieur)",
              "url": "https://www.senat.fr/rap/r24-671/r24-671_mono.html",
              "date": "28 mai 2025",
              "publisher": "Sénat – commission des lois"
            },
            "chart": {
              "kind": "part",
              "value": 77.2,
              "total": 100,
              "unit": "%",
              "whole": "des policiers municipaux"
            }
          },
          {
            "value": "58 %",
            "label": "des policiers municipaux sont dotés d’une arme à feu de poing (16 546 agents), contre 38 % (7 360 agents) en 2012 – France",
            "date": "31 décembre 2023",
            "source": {
              "title": "Rapport d’information n° 671 (2024-2025) « 25 propositions pour donner aux polices municipales les moyens de lutter contre l’insécurité du quotidien » (d’après les données du ministère de l’Intérieur)",
              "url": "https://www.senat.fr/rap/r24-671/r24-671_mono.html",
              "date": "28 mai 2025",
              "publisher": "Sénat – commission des lois"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2012",
                  "value": 38
                },
                {
                  "label": "2023",
                  "value": 58
                }
              ]
            }
          },
          {
            "value": "1 905",
            "label": "des 3 812 communes ou intercommunalités dotées d’une police municipale emploient moins de trois agents ; 525 en emploient plus de 10, dont 24 plus de 100 – France",
            "date": "2023",
            "source": {
              "title": "Rapport n° 315 (2025-2026) sur le projet de loi relatif à l’extension des prérogatives, des moyens, de l’organisation et du contrôle des polices municipales et des gardes champêtres",
              "url": "https://www.senat.fr/rap/l25-315/l25-315_mono.html",
              "date": "28 janvier 2026",
              "publisher": "Sénat – commission des lois"
            },
            "chart": {
              "kind": "part",
              "value": 1905,
              "total": 3812,
              "whole": "communes ou intercommunalités"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "securite_justice-x1-a",
          "text": "Faire des polices municipales armées la règle dans les villes moyennes et grandes, avec contrôles d’identité et accès aux fichiers"
        },
        {
          "id": "securite_justice-x1-b",
          "text": "Confier aux policiers municipaux de nouveaux pouvoirs contre les trafics et les incivilités : amendes, saisies, accès aux fichiers"
        },
        {
          "id": "securite_justice-x1-c",
          "text": "Laisser chaque commune libre d’armer sa police municipale et de lui confier de nouveaux pouvoirs, sans aucune obligation"
        },
        {
          "id": "securite_justice-x1-d",
          "text": "Ne pas étendre les pouvoirs des polices municipales ni généraliser leur armement, et miser sur la médiation et la prévention"
        },
        {
          "id": "securite_justice-x1-e",
          "text": "Désarmer les polices municipales existantes et renoncer à en créer de nouvelles comme à étendre leurs missions"
        }
      ]
    },
    {
      "id": "immigration-x1",
      "topicId": "immigration",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Que faire de l’aide médicale de l’État (AME), qui prend en charge les soins des étrangers sans titre de séjour ?",
      "context": "Aujourd’hui : l’AME prend en charge à 100 % les soins des étrangers sans titre de séjour qui résident en France depuis plus de trois mois et ont des revenus modestes, certains soins non urgents n’étant couverts qu’après neuf mois.",
      "explainer": {
        "summary": "L’aide médicale de l’État (AME) prend en charge les soins des étrangers sans titre de séjour aux revenus modestes, pour un coût en hausse continue ces dernières années. Les uns veulent la supprimer ou la réduire, pour maîtriser la dépense et ne pas encourager le séjour irrégulier ; d’autres, la contrôler davantage ; d’autres encore, la maintenir ou l’intégrer à l’assurance maladie, au nom de la santé publique et de l’accès aux soins.",
        "points": [
          {
            "text": "L’AME est réservée aux personnes dont les ressources ne dépassent pas 10 421 € par an pour une personne seule en métropole. Sauf pour les mineurs, elle ne couvre ni la procréation médicalement assistée, ni les cures thermales, ni les médicaments jugés de faible intérêt thérapeutique (remboursés à 15 %). Sans AME, une personne sans titre peut recevoir à l’hôpital des « soins urgents » : soins vitaux ou évitant une atteinte grave et durable à la santé, soins évitant la propagation d’une maladie, soins de la femme enceinte et du nouveau-né, interruptions de grossesse.",
            "source": {
              "title": "Aide médicale de l’État (AME)",
              "url": "https://www.service-public.gouv.fr/particuliers/vosdroits/F3079",
              "date": "2026-04-01",
              "publisher": "Service-Public.fr (DILA, Premier ministre)"
            }
          },
          {
            "text": "Un décret du 6 février 2026, entré en vigueur le 1er avril 2026, a modifié les pièces à fournir pour demander l’AME. Certains justificatifs d’identité doivent désormais comporter une photo pour les adultes. Les justificatifs de résidence doivent dater de moins de douze mois. Une personne hébergée doit joindre une attestation sur l’honneur de son hébergeant.",
            "source": {
              "title": "Décret n° 2026-67 du 6 février 2026 modifiant le décret n° 2005-860 du 28 juillet 2005 relatif aux modalités d’admission des demandes d’aide médicale de l’Etat (JORF n° 0033 du 8 février 2026)",
              "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053449019",
              "date": "2026-02-08",
              "publisher": "Légifrance"
            }
          },
          {
            "text": "Une mission remise au gouvernement en décembre 2023 a comparé huit pays d’Europe de l’Ouest. Hors Espagne, où le panier de soins est le même que pour les résidents en règle, tous distinguent un « noyau dur » de soins urgents ou essentiels des autres soins, régis par d’autres règles : l’Allemagne exige ainsi une autorisation préalable pour les traitements hospitaliers non urgents. La mission concluait que l’AME « n’apparaît pas comme un facteur d’attractivité » pour les candidats à l’immigration, mais qu’elle « contribue au maintien en situation de clandestinité ».",
            "source": {
              "title": "Rapport sur l’aide médicale de l’État – mission remise au gouvernement (p. 22-25)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/292122.pdf",
              "date": "2023-12",
              "publisher": "vie-publique.fr (DILA) – mission appuyée par l’IGA et l’IGAS"
            }
          }
        ],
        "figures": [
          {
            "value": "458 681",
            "label": "bénéficiaires de l’AME au 30 septembre 2025, contre 465 744 au 30 septembre 2024 (France ; dernières données transmises au Sénat)",
            "date": "30 septembre 2025",
            "source": {
              "title": "Rapport n° 736 (2025-2026) sur le projet de loi relatif aux résultats de la gestion et portant approbation des comptes de l’année 2025 – Annexe n° 28 : Santé",
              "url": "https://www.senat.fr/rap/l25-736-228/l25-736-228_mono.html",
              "date": "2026-06-17",
              "publisher": "Sénat – commission des finances"
            },
            "chart": {
              "kind": "series",
              "items": [
                {
                  "label": "30 sept. 2024",
                  "value": 465744
                },
                {
                  "label": "30 sept. 2025",
                  "value": 458681
                }
              ]
            }
          },
          {
            "value": "1 470 M€",
            "label": "coût total réel de l’AME en 2025, toutes formes incluses (dont les soins urgents), contre 1 386,8 M€ en 2024 ; les dépenses moyennes ont progressé de 14 % en 2025, contre 8 % entre 2023 et 2024 (France)",
            "date": "2025",
            "source": {
              "title": "Rapport n° 736 (2025-2026) sur le projet de loi relatif aux résultats de la gestion et portant approbation des comptes de l’année 2025 – Annexe n° 28 : Santé",
              "url": "https://www.senat.fr/rap/l25-736-228/l25-736-228_mono.html",
              "date": "2026-06-17",
              "publisher": "Sénat – commission des finances"
            },
            "chart": {
              "kind": "series",
              "unit": "M€",
              "items": [
                {
                  "label": "2024",
                  "value": 1386.8
                },
                {
                  "label": "2025",
                  "value": 1470
                }
              ]
            }
          },
          {
            "value": "439 006",
            "label": "bénéficiaires de l’AME fin juin 2023, dont 107 967 mineurs, contre 316 314 fin 2015 (France ; données de la Caisse nationale d’assurance maladie réunies par la mission)",
            "date": "30 juin 2023",
            "source": {
              "title": "Rapport sur l’aide médicale de l’État – mission remise au gouvernement (p. 9, tableau 1)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/292122.pdf",
              "date": "2023-12",
              "publisher": "vie-publique.fr (DILA) – mission appuyée par l’IGA et l’IGAS"
            },
            "chart": {
              "kind": "series",
              "items": [
                {
                  "label": "Fin 2015",
                  "value": 316314
                },
                {
                  "label": "Fin juin 2023",
                  "value": 439006
                }
              ]
            }
          },
          {
            "value": "51 %",
            "label": "des étrangers sans titre de séjour éligibles à l’AME en bénéficieraient, selon une enquête de l’Irdes publiée en 2019 auprès de 1 083 adultes (Paris et agglomération bordelaise). La mission qui la cite appelle à la prudence : échantillon limité, étude restée isolée.",
            "date": "2019 (enquête publiée)",
            "source": {
              "title": "Rapport sur l’aide médicale de l’État – mission remise au gouvernement (p. 9 et 18)",
              "url": "https://www.vie-publique.fr/files/rapport/pdf/292122.pdf",
              "date": "2023-12",
              "publisher": "vie-publique.fr (DILA) – mission appuyée par l’IGA et l’IGAS"
            },
            "chart": {
              "kind": "part",
              "value": 51,
              "total": 100,
              "unit": "%",
              "whole": "des étrangers sans titre de séjour éligibles"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-x1-a",
          "text": "Supprimer l’AME et ne prendre en charge que les soins urgents des étrangers sans titre de séjour"
        },
        {
          "id": "immigration-x1-b",
          "text": "Réduire la liste des soins couverts par l’AME et le nombre de personnes qui peuvent en bénéficier"
        },
        {
          "id": "immigration-x1-c",
          "text": "Maintenir l’AME en soumettant davantage de soins à un accord préalable et en renforçant les contrôles"
        },
        {
          "id": "immigration-x1-d",
          "text": "Maintenir l’AME dans sa forme actuelle, qui couvre l’essentiel des soins sous conditions de ressources"
        },
        {
          "id": "immigration-x1-e",
          "text": "Fondre l’AME dans l’assurance maladie commune, ouverte à toute personne qui réside en France"
        }
      ]
    },
    {
      "id": "immigration-x2",
      "topicId": "immigration",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Que faire de l’accord franco-algérien de 1968 sur l’entrée et le séjour des Algériens ?",
      "context": "Aujourd’hui : l’accord de 1968 fixe pour les Algériens des règles de séjour propres, distinctes du droit commun des étrangers, et l’Assemblée a adopté en octobre 2025 une résolution sans portée juridique demandant sa dénonciation.",
      "explainer": {
        "summary": "Depuis 1968, un accord bilatéral fixe pour les Algériens un régime de séjour à part : plus favorable que le droit commun sur plusieurs points, surtout pour la famille, et moins favorable sur quelques autres, notamment pour les étudiants. Les uns veulent y mettre fin pour appliquer aux Algériens le droit commun, voire pour faire pression sur Alger, dont la coopération sur les retours s’est dégradée en 2025 ; d’autres préfèrent le renégocier ou le conserver, en misant sur le dialogue relancé en 2026.",
        "points": [
          {
            "text": "Selon une mission du Sénat (février 2025), l’accord est « pour l’essentiel » plus favorable que le droit commun, surtout pour la famille. Le conjoint algérien d’une personne française obtient de droit un certificat de résidence de dix ans après un an de mariage, contre trois ans en droit commun, et la famille regroupée reçoit le même titre que la personne qui la fait venir. L’accord est moins favorable aux étudiants, qui ne peuvent travailler que 50 % de leur temps (60 % en droit commun), et il ne donne pas accès aux cartes « talents », réservées aux profils recherchés pour leurs compétences. Comme sa dernière révision date de plus de vingt ans, les lois votées depuis sur l’admission au séjour ne s’appliquent pas aux Algériens.",
            "source": {
              "title": "Rapport d’information n° 304 (2024-2025) sur les accords internationaux conclus par la France en matière migratoire",
              "url": "https://www.senat.fr/rap/r24-304/r24-30424.html",
              "date": "2025-02-05",
              "publisher": "Sénat – commission des lois"
            }
          },
          {
            "text": "L’accord ne prévoit pas de clause de dénonciation. En février 2025, une mission du Sénat a conclu qu’« aucun obstacle juridique » n’empêcherait la France de le dénoncer, avec un préavis de douze mois selon le gouvernement de l’époque : les Algériens relèveraient alors du droit commun des étrangers. La même mission jugeait « inévitables » des mesures de rétorsion de l’Algérie dans tous les domaines de coopération.",
            "source": {
              "title": "Rapport d’information n° 304 (2024-2025) sur les accords internationaux conclus par la France en matière migratoire",
              "url": "https://www.senat.fr/rap/r24-304/r24-30427.html",
              "date": "2025-02-05",
              "publisher": "Sénat – commission des lois"
            }
          },
          {
            "text": "L’accord ne contient aucune disposition sur l’éloignement des étrangers en situation irrégulière. Les retours vers l’Algérie reposent sur un protocole de 1994 sur les laissez-passer consulaires, documents de voyage délivrés par le consulat quand la personne n’a pas de passeport valide. Selon le ministère de l’Intérieur, cette coopération, qui s’était améliorée de 2022 à 2024, s’est de nouveau dégradée début 2025 ; le dialogue a repris après une visite du ministre de l’Intérieur en Algérie en février 2026, et un travail de révision de l’accord de 1968 a été engagé.",
            "source": {
              "title": "Question écrite n° 01567 (17e législature) – Accord franco-algérien de 1968, réponse du ministère de l’Intérieur",
              "url": "https://www.senat.fr/questions/base/2024/qSEQ241001567.html",
              "date": "2026-09-03",
              "publisher": "Sénat (JO Sénat du 3 septembre 2026, p. 4155)"
            }
          }
        ],
        "figures": [
          {
            "value": "649 991",
            "label": "Algériens titulaires d’un titre ou d’un document de séjour valide au 31 décembre 2024 (+ 0,5 % sur un an), soit 15,6 % du total : première nationalité, devant les Marocains (France)",
            "date": "31 décembre 2024",
            "source": {
              "title": "Rapport d’information n° 1963 sur les implications juridiques et budgétaires des accords bilatéraux conclus en matière de circulation, de séjour, de santé et d’emploi : l’exemple de l’Algérie (p. 69)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b1963_rapport-information.pdf",
              "date": "2025-10-15",
              "publisher": "Assemblée nationale – commission des finances, d’après le ministère de l’Intérieur"
            },
            "chart": {
              "kind": "part",
              "value": 15.6,
              "total": 100,
              "unit": "%",
              "whole": "des titulaires d’un titre ou document de séjour"
            }
          },
          {
            "value": "54,6 %",
            "label": "part des motifs familiaux dans les premiers titres de séjour délivrés à des Algériens en 2024, contre 32,4 % pour les Marocains et 38,4 % pour les Tunisiens ; pour les Algériens, motifs étudiants : 27,2 %, motifs économiques : 9,4 %",
            "date": "2024",
            "source": {
              "title": "Rapport d’information n° 1963 sur les implications juridiques et budgétaires des accords bilatéraux conclus en matière de circulation, de séjour, de santé et d’emploi : l’exemple de l’Algérie (p. 74)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b1963_rapport-information.pdf",
              "date": "2025-10-15",
              "publisher": "Assemblée nationale – commission des finances, d’après la DGEF (ministère de l’Intérieur)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Algériens",
                  "value": 54.6
                },
                {
                  "label": "Marocains",
                  "value": 32.4
                },
                {
                  "label": "Tunisiens",
                  "value": 38.4
                }
              ]
            }
          },
          {
            "value": "185",
            "label": "voix pour, contre 184, lors de l’adoption par l’Assemblée nationale de la proposition de résolution invitant à dénoncer les accords franco-algériens de 1968 (369 suffrages exprimés)",
            "date": "30 octobre 2025",
            "source": {
              "title": "Compte rendu intégral – première séance du jeudi 30 octobre 2025 (Dénonciation des accords franco-algériens du 27 décembre 1968)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/premiere-seance-du-jeudi-30-octobre-2025",
              "date": "2025-10-30",
              "publisher": "Assemblée nationale"
            },
            "chart": {
              "kind": "compare",
              "unit": "voix",
              "items": [
                {
                  "label": "Pour",
                  "value": 185
                },
                {
                  "label": "Contre",
                  "value": 184
                }
              ]
            }
          },
          {
            "value": "50 %",
            "label": "objectif de refus des demandes de visa déposées en Algérie, fixé par la France en septembre 2021 pour protester contre les refus de réadmission ; 50,46 % ont été refusées en 2022, contre 39,66 % en 2021. La restriction a pris fin en janvier 2023, après la reprise de la coopération consulaire.",
            "date": "septembre 2021 – janvier 2023",
            "source": {
              "title": "Rapport d’information n° 1963 sur les implications juridiques et budgétaires des accords bilatéraux conclus en matière de circulation, de séjour, de santé et d’emploi : l’exemple de l’Algérie (p. 41)",
              "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b1963_rapport-information.pdf",
              "date": "2025-10-15",
              "publisher": "Assemblée nationale – commission des finances, d’après le ministère de l’Intérieur"
            },
            "chart": {
              "kind": "series",
              "unit": "%",
              "items": [
                {
                  "label": "2021",
                  "value": 39.66
                },
                {
                  "label": "2022",
                  "value": 50.46
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "immigration-x2-a",
          "text": "Mettre fin à l’accord et ne plus délivrer de visas aux Algériens, sans négocier avec l’Algérie"
        },
        {
          "id": "immigration-x2-b",
          "text": "Dénoncer l’accord unilatéralement pour soumettre les Algériens au droit commun des étrangers"
        },
        {
          "id": "immigration-x2-c",
          "text": "Renégocier l’accord avec l’Algérie pour rapprocher les Algériens du droit commun des étrangers",
          "external": true
        },
        {
          "id": "immigration-x2-d",
          "text": "Conserver l’accord en l’état et apaiser la relation avec l’Algérie en privilégiant le dialogue"
        }
      ]
    },
    {
      "id": "europe-x4",
      "topicId": "europe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Faut-il élargir l’Union européenne, notamment à l’Ukraine ?",
      "context": "Aujourd’hui : l’Ukraine, la Moldavie et plusieurs pays des Balkans négocient leur adhésion à l’Union européenne ; toute adhésion exige l’accord unanime des 27 États membres.",
      "explainer": {
        "summary": "Élargir l’Union, notamment à l’Ukraine, pose la question du calendrier, de la préparation des pays candidats et de la capacité de l’Union à fonctionner avec davantage de membres. Certains veulent accueillir les candidats dès qu’ils remplissent les critères, d’autres après une réforme des règles de décision de l’Union, ou plus tard, après une harmonisation sociale, fiscale et agricole ; d’autres refusent tout nouvel élargissement.",
        "points": [
          {
            "text": "Un pays candidat doit remplir les « critères de Copenhague » (1993), dont des institutions stables garantissant la démocratie, l’État de droit et les droits de l’homme. Chaque étape (ouverture des négociations, ouverture puis clôture provisoire de chaque chapitre) est décidée à l’unanimité des États. Le traité d’adhésion doit ensuite être approuvé par le Parlement européen et ratifié par tous les États signataires.",
            "source": {
              "title": "L’élargissement de l’Union – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/167/l-elargissement-de-l-union",
              "date": "2026-04",
              "publisher": "Parlement européen"
            }
          },
          {
            "text": "L’Ukraine a demandé à adhérer le 28 février 2022 et obtenu le statut de candidat le 23 juin 2022. Les négociations ont été ouvertes le 25 juin 2024. Elles sont organisées en six groupes de chapitres : deux ont été ouverts, les « fondamentaux » le 15 juin 2026 et les « relations extérieures » le 14 juillet 2026.",
            "source": {
              "title": "Ukraine’s path towards EU accession",
              "url": "https://commission.europa.eu/topics/eu-solidarity-ukraine/ukraines-path-towards-eu-accession_en",
              "date": "2026-08-21",
              "publisher": "Commission européenne"
            }
          },
          {
            "text": "En France, la loi autorisant la ratification d’un traité d’adhésion d’un nouvel État est soumise au référendum (article 88-5 de la Constitution). Le Parlement peut toutefois l’éviter : il faut pour cela qu’une motion soit adoptée en termes identiques par l’Assemblée nationale et par le Sénat, à la majorité des trois cinquièmes. Le texte est alors voté par le Congrès (députés et sénateurs réunis).",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "35 %",
            "label": "Part des Français favorables à « l’élargissement de l’Union européenne à d’autres pays dans les années à venir », en baisse de 5 points depuis l’automne 2025, contre 54 % d’opposés et 11 % sans avis. Dans l’UE à 27 : 53 % pour, 40 % contre, 7 % sans avis.",
            "date": "Mars-avril 2026",
            "source": {
              "title": "Eurobaromètre Standard 105 – Printemps 2026, annexe de données (QB2.6, p. 158)",
              "url": "https://webgate.ec.europa.eu/ebsm/api/public/deliverable/download?doc=true&deliverableId=105498",
              "date": "2026-05",
              "publisher": "Commission européenne (Eurobaromètre)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "Favorables, France",
                  "value": 35
                },
                {
                  "label": "Opposés, France",
                  "value": 54
                },
                {
                  "label": "Favorables, UE à 27",
                  "value": 53
                },
                {
                  "label": "Opposés, UE à 27",
                  "value": 40
                }
              ]
            }
          },
          {
            "value": "18 sur 33",
            "label": "Chapitres de négociation provisoirement clos par le Monténégro, qui a ouvert l’ensemble de ses 33 chapitres",
            "date": "Juillet 2026",
            "source": {
              "title": "EU and Montenegro close accession negotiations on competition policy and customs union",
              "url": "https://www.eeas.europa.eu/delegations/montenegro/eu-and-montenegro-close-accession-negotiations-competition-policy-and-customs-union_en",
              "date": "2026-07-15",
              "publisher": "Service européen pour l’action extérieure (SEAE), délégation de l’UE au Monténégro"
            },
            "chart": {
              "kind": "part",
              "value": 18,
              "total": 33,
              "whole": "chapitres de négociation"
            }
          },
          {
            "value": "18 905 $",
            "label": "PIB par habitant de l’Ukraine, corrigé des écarts de prix entre pays (parité de pouvoir d’achat, en dollars internationaux courants), contre 65 503 $ dans l’UE et 63 975 $ en France. Pour comparaison, la Pologne, entrée dans l’UE en 2004, est passée de 13 413 $ en 2004 (UE : 25 911 $) à 54 262 $ en 2025.",
            "date": "2025 (Pologne et UE : 2004 et 2025)",
            "source": {
              "title": "World Development Indicators – GDP per capita, PPP (current international $) (NY.GDP.PCAP.PP.CD)",
              "url": "https://api.worldbank.org/v2/country/POL;EUU;UKR;FRA/indicator/NY.GDP.PCAP.PP.CD?format=json&date=2004:2025&per_page=200",
              "date": "2026-07-13",
              "publisher": "Banque mondiale"
            },
            "chart": {
              "kind": "compare",
              "unit": "$",
              "items": [
                {
                  "label": "Ukraine",
                  "value": 18905
                },
                {
                  "label": "Union européenne",
                  "value": 65503
                },
                {
                  "label": "France",
                  "value": 63975
                }
              ]
            }
          },
          {
            "value": "413 110 km²",
            "label": "Terres agricoles de l’Ukraine (terres arables, cultures permanentes et pâturages permanents), contre 282 972 km² en France et 1 608 330 km² dans l’UE à 27",
            "date": "2023",
            "source": {
              "title": "World Development Indicators – Agricultural land (sq. km) (AG.LND.AGRI.K2)",
              "url": "https://api.worldbank.org/v2/country/UKR;EUU;FRA/indicator/AG.LND.AGRI.K2?format=json&date=2023",
              "date": "2026-07-13",
              "publisher": "Banque mondiale"
            },
            "chart": {
              "kind": "compare",
              "unit": "km²",
              "items": [
                {
                  "label": "Ukraine",
                  "value": 413110
                },
                {
                  "label": "France",
                  "value": 282972
                },
                {
                  "label": "UE à 27",
                  "value": 1608330
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "europe-x4-a",
          "text": "Accueillir l’Ukraine et les autres pays candidats après avoir réformé les règles de décision de l’Union"
        },
        {
          "id": "europe-x4-b",
          "text": "Accueillir l’Ukraine et les autres pays candidats dès qu’ils remplissent les critères, sans attendre de réforme",
          "external": true
        },
        {
          "id": "europe-x4-c",
          "text": "Accepter l’élargissement à terme, sans adhésion accélérée, après une harmonisation sociale, fiscale et agricole"
        },
        {
          "id": "europe-x4-d",
          "text": "Refuser tout nouvel élargissement de l’Union européenne, en particulier l’adhésion de l’Ukraine"
        }
      ]
    },
    {
      "id": "ukraine_russie-x3",
      "topicId": "ukraine_russie",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelles garanties de sécurité offrir à l’Ukraine, et faut-il y engager des soldats français ?",
      "context": "Aujourd’hui : la guerre se poursuit ; en janvier 2026, la France, le Royaume-Uni et l’Ukraine ont signé une déclaration prévoyant de déployer plusieurs milliers de soldats en Ukraine après un cessez-le-feu.",
      "explainer": {
        "summary": "Une garantie de sécurité vise à dissuader la Russie d’attaquer de nouveau l’Ukraine après un éventuel cessez-le-feu ; reste à savoir qui la fournit et avec quels moyens. Plusieurs voies s’opposent : une force européenne en Ukraine avec des soldats français, l’entrée de l’Ukraine dans l’OTAN, le seul renforcement de l’armée ukrainienne, un accord sous l’égide de l’ONU ou de l’OSCE (Organisation pour la sécurité et la coopération en Europe, dont la Russie et l’Ukraine sont membres), ou le refus de tout engagement militaire français.",
        "points": [
          {
            "text": "Le 6 janvier 2026 à Paris, les pays de la « coalition des volontaires », réunis avec l’Ukraine et les États-Unis, se sont dits prêts à des garanties « politiquement et juridiquement contraignantes », activées dès l’entrée en vigueur d’un cessez-le-feu. Elles prévoient une surveillance du cessez-le-feu menée par les États-Unis, un soutien durable à l’armée ukrainienne et une coopération de défense à long terme. Une force multinationale dirigée par l’Europe serait mise en œuvre à la demande de l’Ukraine, après une cessation crédible des hostilités. Les engagements en cas de nouvelle attaque armée de la Russie restent à finaliser.",
            "source": {
              "title": "Des garanties de sécurité robustes pour une paix solide et durable en Ukraine",
              "url": "https://www.elysee.fr/emmanuel-macron/2026/01/06/des-garanties-de-securite-robustes-pour-une-paix-solide-et-durable-en-ukraine",
              "date": "2026-01-06",
              "publisher": "Présidence de la République"
            }
          },
          {
            "text": "Un pays ne peut entrer dans l’OTAN que sur invitation des membres, décidée par « accord unanime » (article 10 du traité). Un membre bénéficie de l’article 5 : une attaque armée contre l’un d’eux est considérée comme une attaque contre tous. Chaque partie au traité assiste alors celle qui est attaquée par « telle action qu’elle jugera nécessaire, y compris l’emploi de la force armée ».",
            "source": {
              "title": "Le Traité de l’Atlantique Nord",
              "url": "https://www.nato.int/cps/fr/natohq/official_texts_17120.htm",
              "publisher": "OTAN"
            }
          },
          {
            "text": "Selon l’article 35 de la Constitution, le gouvernement informe le Parlement de toute intervention des forces armées à l’étranger au plus tard trois jours après son début. Cette information peut donner lieu à un débat, sans vote. Au-delà de quatre mois, la prolongation de l’intervention doit être autorisée par le Parlement.",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "17 257 tués, 53 693 blessés",
            "label": "Civils tués et blessés en Ukraine depuis le 24 février 2022, vérifiés par la mission de surveillance des droits de l’homme de l’ONU, qui juge le bilan réel probablement bien plus élevé. De janvier à août 2026 : 2 222 tués et 13 058 blessés.",
            "date": "24 février 2022 – 31 août 2026",
            "source": {
              "title": "Ukraine – Protection of civilians in armed conflict, August 2026 update (PDF)",
              "url": "https://ukraine.ohchr.org/sites/default/files/2026-09/Ukraine%20-%20protection%20of%20civilians%20in%20armed%20conflict%20%28August%29_ENG.pdf",
              "date": "2026-09-17",
              "publisher": "Mission de surveillance des droits de l’homme des Nations unies en Ukraine (HCDH)"
            }
          },
          {
            "value": "35 pays",
            "label": "Membres de la coalition des volontaires réunie à Paris le 6 janvier 2026, en présence de 28 chefs d’État ou de gouvernement. Le soutien à l’armée ukrainienne y a été planifié sur la base d’un format de 800 000 hommes.",
            "date": "6 janvier 2026",
            "source": {
              "title": "Sommet de la coalition des volontaires",
              "url": "https://www.elysee.fr/emmanuel-macron/2026/01/06/sommet-de-la-coalition-des-volontaires",
              "date": "2026-01-06",
              "publisher": "Présidence de la République"
            }
          },
          {
            "value": "228,7 Md€",
            "label": "Soutien total de l’UE à l’Ukraine depuis le début de l’invasion russe, selon la Commission : budget de l’UE, aide militaire, accueil des réfugiés, contributions des États membres et revenus des avoirs russes immobilisés. Dont 114,4 Md€ apportés ou garantis par le budget de l’UE et 77,9 Md€ d’aide militaire.",
            "date": "Page mise à jour le 7 octobre 2026",
            "source": {
              "title": "EU assistance to Ukraine",
              "url": "https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine_fr",
              "date": "2026-10-07",
              "publisher": "Commission européenne"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Soutien total depuis 2022",
                  "value": 228.7
                },
                {
                  "label": "Dont via le budget de l’UE",
                  "value": 114.4
                },
                {
                  "label": "Dont aide militaire",
                  "value": 77.9
                }
              ]
            }
          },
          {
            "value": "52 %",
            "label": "Part des Français d’accord pour que l’UE finance l’achat et la livraison d’équipements militaires à l’Ukraine, contre 41 % pas d’accord et 7 % sans avis. Dans l’UE à 27 : 56 % d’accord, 39 % pas d’accord.",
            "date": "Mars-avril 2026",
            "source": {
              "title": "Eurobaromètre Standard 105 – Printemps 2026, annexe de données (QD2.2, p. 259)",
              "url": "https://webgate.ec.europa.eu/ebsm/api/public/deliverable/download?doc=true&deliverableId=105498",
              "date": "2026-05",
              "publisher": "Commission européenne (Eurobaromètre)"
            },
            "chart": {
              "kind": "compare",
              "unit": "%",
              "items": [
                {
                  "label": "D’accord, France",
                  "value": 52
                },
                {
                  "label": "Pas d’accord, France",
                  "value": 41
                },
                {
                  "label": "D’accord, UE à 27",
                  "value": 56
                },
                {
                  "label": "Pas d’accord, UE à 27",
                  "value": 39
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "ukraine_russie-x3-a",
          "text": "Déployer en Ukraine une force européenne avec des soldats français après un cessez-le-feu, voire protéger son ciel"
        },
        {
          "id": "ukraine_russie-x3-b",
          "text": "Faire entrer l’Ukraine dans l’OTAN, pour qu’elle bénéficie de la clause de défense collective de l’Alliance"
        },
        {
          "id": "ukraine_russie-x3-c",
          "text": "Continuer d’armer et de former l’armée ukrainienne pour qu’elle assure sa défense, sans soldats français sur son sol"
        },
        {
          "id": "ukraine_russie-x3-d",
          "text": "Garantir la sécurité de l’Ukraine par un accord sous l’égide de l’ONU ou de l’OSCE, l’Ukraine restant hors de l’OTAN"
        },
        {
          "id": "ukraine_russie-x3-e",
          "text": "Refuser tout engagement militaire de la France en Ukraine, ni soldats français ni garanties de sécurité"
        }
      ]
    },
    {
      "id": "europe-x5",
      "topicId": "europe",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quelle relation la France doit-elle avoir avec les États-Unis ?",
      "context": "Aujourd’hui : la France est alliée des États-Unis au sein de l’OTAN ; un accord commercial conclu en 2025 prévoit des droits de douane américains de 15 % sur la plupart des produits européens.",
      "explainer": {
        "summary": "Les États-Unis sont l’allié militaire de la France au sein de l’OTAN, l’un des premiers partenaires commerciaux de l’Union européenne et le principal fournisseur d’armes des pays européens de l’Alliance. Le débat porte sur le degré de proximité avec eux : resserrer l’alliance, rester allié sans s’aligner, rendre l’Europe autonome, diversifier les partenariats ou ne s’allier à aucune puissance.",
        "points": [
          {
            "text": "L’OTAN, alliance de défense collective, a été créée en 1949 par 12 États, dont la France. En 1966, la France a quitté le commandement militaire intégré de l’Alliance, sans quitter l’Alliance elle-même ; elle l’a réintégré en 2009.",
            "source": {
              "title": "L’Alliance atlantique : le cadre de sécurité UE-OTAN",
              "url": "https://www.diplomatie.gouv.fr/fr/le-ministere-en-action/promouvoir-une-europe-souveraine/l-europe-de-la-defense/l-alliance-atlantique-le-cadre-de-securite-ue-otan",
              "date": "2026-07-08",
              "publisher": "Ministère de l’Europe et des Affaires étrangères"
            }
          },
          {
            "text": "Un accord commercial entre l’UE et les États-Unis, conclu le 27 juillet 2025, a été confirmé par une déclaration commune le 21 août 2025. Depuis le 1er juillet 2026, l’UE a supprimé tous ses droits de douane sur les produits industriels américains. Le 31 juillet 2026, la Commission a prolongé la suspension de ses contre-mesures (dites de « rééquilibrage ») visant les exportations américaines.",
            "source": {
              "title": "EU trade relations with the United States",
              "url": "https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/united-states_en",
              "date": "2026-07-31",
              "publisher": "Commission européenne, DG Commerce"
            }
          },
          {
            "text": "En mars 2025, la Commission a présenté un plan selon lequel jusqu’à 800 Md€ pourraient être consacrés à la défense de l’Union sur la période 2026-2030. Ce montant combine la hausse des dépenses nationales et un instrument de prêts européens à long terme aux États membres (SAFE).",
            "source": {
              "title": "La politique de sécurité et de défense commune – Fiches thématiques sur l’Union européenne",
              "url": "https://www.europarl.europa.eu/factsheets/fr/sheet/159/la-politique-de-securite-et-de-defense-commune",
              "date": "2026-03",
              "publisher": "Parlement européen"
            }
          }
        ],
        "figures": [
          {
            "value": "554,7 Md€",
            "label": "Exportations de biens de l’UE vers les États-Unis, soit 21 % de ses exportations hors de l’Union. Elle en importe pour 356,7 Md€ (14,1 % de ses importations), d’où un excédent de 198,0 Md€ sur les biens.",
            "date": "2025",
            "source": {
              "title": "Commerce extra-UE par partenaire (ext_lt_maineu) – UE à 27 / États-Unis, 2025",
              "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/ext_lt_maineu?format=JSON&lang=FR&geo=EU27_2020&partner=US&time=2025",
              "date": "2026-09-15",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Exportations de biens",
                  "value": 554.7
                },
                {
                  "label": "Importations de biens",
                  "value": 356.7
                }
              ]
            }
          },
          {
            "value": "−178,4 Md€",
            "label": "Solde des échanges de services de l’UE avec les États-Unis : 343,4 Md€ d’exportations contre 521,8 Md€ d’importations",
            "date": "2025",
            "source": {
              "title": "Commerce international de services (bop_its6_det) – UE à 27 / États-Unis, 2025",
              "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_its6_det?format=JSON&lang=FR&geo=EU27_2020&partner=US&bop_item=S&currency=MIO_EUR&time=2025",
              "date": "2026-04-16",
              "publisher": "Eurostat"
            },
            "chart": {
              "kind": "compare",
              "unit": "Md€",
              "items": [
                {
                  "label": "Exportations de services",
                  "value": 343.4
                },
                {
                  "label": "Importations de services",
                  "value": 521.8
                }
              ]
            }
          },
          {
            "value": "58 %",
            "label": "Part des États-Unis dans les importations d’armes majeures des 29 pays européens membres de l’OTAN ; ces importations ont augmenté de 143 % par rapport à 2016-2020. La France est le 2e exportateur mondial, avec 9,8 % des exportations (mesure en volume).",
            "date": "2021-2025",
            "source": {
              "title": "Global arms flows jump nearly 10 per cent as European demand soars",
              "url": "https://www.sipri.org/media/press-release/2026/global-arms-flows-jump-nearly-10-cent-european-demand-soars",
              "date": "2026-03-09",
              "publisher": "Institut international de recherche sur la paix de Stockholm (SIPRI)"
            },
            "chart": {
              "kind": "part",
              "value": 58,
              "total": 100,
              "unit": "%",
              "whole": "des importations d’armes des alliés européens"
            }
          },
          {
            "value": "2,3 % du PIB",
            "label": "Dépenses de défense cumulées des alliés européens et du Canada, contre 1,4 % en 2014. Au sommet de La Haye en 2025, les alliés se sont engagés à atteindre 5 % du PIB par an d’ici 2035, dont au moins 3,5 % pour les besoins de défense au sens strict.",
            "date": "2025",
            "source": {
              "title": "Funding NATO – Defence expenditures",
              "url": "https://www.nato.int/cps/en/natohq/topics_49198.htm",
              "date": "2026-06-29",
              "publisher": "OTAN"
            },
            "chart": {
              "kind": "series",
              "unit": "% du PIB",
              "items": [
                {
                  "label": "2014",
                  "value": 1.4
                },
                {
                  "label": "2025",
                  "value": 2.3
                }
              ]
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "europe-x5-a",
          "text": "Resserrer l’alliance avec les États-Unis et régler les différends commerciaux par la négociation, sans représailles",
          "external": true
        },
        {
          "id": "europe-x5-b",
          "text": "Rester l’allié des États-Unis sans s’aligner sur eux, en défendant fermement les intérêts européens face à leurs pressions"
        },
        {
          "id": "europe-x5-c",
          "text": "Rendre l’Europe autonome des États-Unis pour sa défense et ses technologies, en réduisant ses dépendances envers eux"
        },
        {
          "id": "europe-x5-d",
          "text": "Diversifier les partenariats de la France, notamment avec la Russie et les pays émergents, pour réduire le poids des États-Unis"
        },
        {
          "id": "europe-x5-e",
          "text": "Ne nouer d’alliance privilégiée ni avec les États-Unis ni avec aucune autre puissance, en restant à l’écart de tous les blocs"
        },
        {
          "id": "europe-x5-f",
          "text": "Refuser de prendre parti entre puissances rivales, américaine comme européennes, au nom de la solidarité internationale des travailleurs"
        }
      ]
    },
    {
      "id": "institutions-x1",
      "topicId": "institutions",
      "tier": "approfondi",
      "rev": 1,
      "prompt": "Quel rôle donner au Conseil constitutionnel ?",
      "context": "Aujourd’hui : le Conseil constitutionnel peut censurer une loi contraire à la Constitution, avant sa promulgation ou à la demande d’un justiciable, et ses membres sont nommés par le président de la République et les présidents des deux assemblées.",
      "explainer": {
        "summary": "Le Conseil constitutionnel peut empêcher l’entrée en vigueur de tout ou partie d’une loi votée, ou abroger une disposition déjà appliquée, s’il la juge contraire à la Constitution : pour les uns, ce contrôle protège les droits et libertés face à la majorité parlementaire ; pour d’autres, il donne trop de poids à des membres nommés face aux élus et aux électeurs. Les approches vont du maintien de son rôle actuel à sa suppression, en passant par un contrôle plus restreint, des nominations plus encadrées ou la possibilité de maintenir une loi censurée, par le Parlement ou par référendum.",
        "points": [
          {
            "text": "Le Conseil juge les lois au regard de la Constitution, mais aussi de la Déclaration des droits de l’homme de 1789 et du Préambule de 1946 (depuis sa décision « Liberté d’association » du 16 juillet 1971), ainsi que de la Charte de l’environnement de 2004. Depuis 1974, 60 députés ou 60 sénateurs peuvent le saisir d’une loi votée. Depuis le 1er mars 2010, une partie à un procès peut aussi contester une loi déjà appliquée : c’est la question prioritaire de constitutionnalité (QPC), que le Conseil d’État ou la Cour de cassation lui transmet.",
            "source": {
              "title": "Présentation générale du Conseil constitutionnel",
              "url": "https://www.conseil-constitutionnel.fr/le-conseil-constitutionnel/presentation-generale",
              "date": "consulté le 8 octobre 2026",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Une disposition censurée avant sa promulgation « ne peut être promulguée ni mise en application ». Les décisions du Conseil « ne sont susceptibles d’aucun recours » et « s’imposent aux pouvoirs publics » (article 62). Pour adopter malgré tout une mesure censurée, il faut réviser la Constitution (article 89). Les deux assemblées votent le même texte ; la révision est ensuite approuvée par référendum ou, si le président de la République soumet son projet au Parlement réuni en Congrès, à la majorité des trois cinquièmes des suffrages exprimés.",
            "source": {
              "title": "Texte intégral de la Constitution du 4 octobre 1958 en vigueur (articles 62 et 89)",
              "url": "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",
              "date": "à jour de la révision constitutionnelle du 8 mars 2024",
              "publisher": "Conseil constitutionnel"
            }
          },
          {
            "text": "Le Conseil ne contrôle pas une loi après son adoption par référendum. Saisi de la loi adoptée par le référendum du 28 octobre 1962, il s’est déclaré incompétent le 6 novembre 1962 : une telle loi constitue « l’expression directe de la souveraineté nationale ».",
            "source": {
              "title": "Décision n° 62-20 DC du 6 novembre 1962",
              "url": "https://www.conseil-constitutionnel.fr/decision/1962/6220DC.htm",
              "date": "6 novembre 1962",
              "publisher": "Conseil constitutionnel"
            }
          }
        ],
        "figures": [
          {
            "value": "407",
            "label": "décisions censurant une partie du texte (non-conformité partielle) et 20 le censurant en entier (non-conformité totale), contre 464 le jugeant conforme et 10 autres solutions : textes examinés avant leur entrée en vigueur (décisions DC), du 1er janvier 1959 au 30 juin 2026",
            "date": "30 juin 2026",
            "source": {
              "title": "Bilan statistique – premier semestre 2026",
              "url": "https://www.conseil-constitutionnel.fr/bilan-statistique",
              "date": "mise à jour du 30 juin 2026",
              "publisher": "Conseil constitutionnel"
            },
            "chart": {
              "kind": "compare",
              "unit": "décisions",
              "items": [
                {
                  "label": "Non-conformité partielle",
                  "value": 407
                },
                {
                  "label": "Non-conformité totale",
                  "value": 20
                },
                {
                  "label": "Conformité",
                  "value": 464
                },
                {
                  "label": "Autres solutions",
                  "value": 10
                }
              ]
            }
          },
          {
            "value": "269",
            "label": "décisions QPC déclarant la disposition contestée entièrement contraire à la Constitution (non-conformité totale) et 79 en partie, contre 697 la jugeant conforme et 46 autres solutions (du 1er mars 2010 au 30 juin 2026)",
            "date": "30 juin 2026",
            "source": {
              "title": "Bilan statistique – premier semestre 2026",
              "url": "https://www.conseil-constitutionnel.fr/bilan-statistique",
              "date": "mise à jour du 30 juin 2026",
              "publisher": "Conseil constitutionnel"
            },
            "chart": {
              "kind": "compare",
              "unit": "décisions",
              "items": [
                {
                  "label": "Non-conformité totale",
                  "value": 269
                },
                {
                  "label": "Non-conformité partielle",
                  "value": 79
                },
                {
                  "label": "Conformité",
                  "value": 697
                },
                {
                  "label": "Autres solutions",
                  "value": 46
                }
              ]
            }
          },
          {
            "value": "540",
            "label": "saisines du Conseil par des députés et 345 par des sénateurs, sur 1 229 saisines de textes avant leur entrée en vigueur (décisions DC) au 30 juin 2026 ; les autres viennent du Premier ministre (222), du président du Sénat (54), du président de l’Assemblée nationale (52) et du président de la République (16)",
            "date": "30 juin 2026",
            "source": {
              "title": "Bilan statistique au 30 juin 2026 (fichier Excel, onglet « Saisines DC_QPC »)",
              "url": "https://www.conseil-constitutionnel.fr/sites/default/files/2026-07/2026_06_30_bilan_statistique_titrevii.xlsx",
              "date": "30 juin 2026",
              "publisher": "Conseil constitutionnel"
            },
            "chart": {
              "kind": "part",
              "value": 540,
              "total": 1229,
              "whole": "saisines de textes avant entrée en vigueur"
            }
          },
          {
            "value": "9",
            "label": "membres nommés pour neuf ans, sans renouvellement possible ; les anciens présidents de la République sont en outre membres de droit à vie. Depuis la révision du 23 juillet 2008, le président de la République ne peut pas nommer un membre si les votes contre atteignent au moins trois cinquièmes des suffrages exprimés dans les commissions compétentes des deux assemblées ; les nominations faites par les présidents des assemblées passent par l’avis de la seule commission de leur assemblée.",
            "date": "règle en vigueur au 7 octobre 2026",
            "source": {
              "title": "Statut des membres",
              "url": "https://www.conseil-constitutionnel.fr/les-membres/statut-des-membres",
              "date": "consulté le 7 octobre 2026",
              "publisher": "Conseil constitutionnel"
            }
          }
        ]
      },
      "approaches": [
        {
          "id": "institutions-x1-a",
          "text": "Supprimer le Conseil constitutionnel, dans le cadre d’un changement complet des institutions"
        },
        {
          "id": "institutions-x1-b",
          "text": "Permettre au Parlement, à une majorité renforcée, de maintenir une loi censurée par le Conseil constitutionnel"
        },
        {
          "id": "institutions-x1-c",
          "text": "Permettre aux électeurs, par référendum, de maintenir une loi censurée par le Conseil constitutionnel"
        },
        {
          "id": "institutions-x1-d",
          "text": "Limiter les textes sur lesquels s’appuie le Conseil constitutionnel, ou supprimer les recours des justiciables"
        },
        {
          "id": "institutions-x1-e",
          "text": "Faire approuver les nominations au Conseil constitutionnel par une majorité renforcée de parlementaires"
        },
        {
          "id": "institutions-x1-f",
          "text": "Conserver le rôle actuel du Conseil constitutionnel, sans permettre de maintenir une loi qu’il a censurée"
        }
      ]
    }
  ],
  "consensus": [
    {
      "topicId": "retraites",
      "text": "Quel que soit l’âge de départ retenu, la plupart des candidats prévoient des départs anticipés pour les carrières longues et les métiers pénibles."
    },
    {
      "topicId": "retraites",
      "text": "Relever le taux d’emploi des seniors est un objectif largement partagé ; les moyens diffèrent (exonérations, retraite progressive, lutte contre les discriminations à l’embauche)."
    },
    {
      "topicId": "industrie_economie",
      "text": "La réindustrialisation et la réduction des dépendances stratégiques (énergie, médicaments, numérique, composants) sont revendiquées par presque tous les candidats ; le désaccord porte sur les outils."
    },
    {
      "topicId": "industrie_economie",
      "text": "Orienter la commande publique vers la production locale, française ou européenne, est largement partagé ; le désaccord porte sur l’échelle (nationale ou européenne) et sur l’intensité."
    },
    {
      "topicId": "industrie_economie",
      "text": "Garantir aux entreprises, en particulier industrielles, une électricité moins chère et plus stable est un objectif commun à la plupart des candidats."
    },
    {
      "topicId": "industrie_economie",
      "text": "Alléger les normes et les procédures imposées aux entreprises (fin des règles nationales ajoutées aux textes européens, procédures accélérées pour l’industrie) est défendu par une large majorité des candidats qui se sont exprimés ; les désaccords portent sur l’ampleur et sur les protections sociales et environnementales à préserver."
    },
    {
      "topicId": "fiscalite",
      "text": "Renforcer la lutte contre la fraude et l’évasion fiscales est mis en avant par des candidats de tous horizons."
    },
    {
      "topicId": "finances_publiques",
      "text": "Supprimer des doublons administratifs (agences, organismes, échelons) est proposé par de nombreux candidats de sensibilités différentes ; les structures visées varient."
    },
    {
      "topicId": "sante",
      "text": "Former beaucoup plus de médecins : aucun candidat ne défend de limiter les places en études de médecine, et plusieurs veulent les augmenter fortement."
    },
    {
      "topicId": "sante",
      "text": "Produire davantage en France ou en Europe les médicaments essentiels, pour limiter les pénuries."
    },
    {
      "topicId": "sante",
      "text": "Mieux soutenir les proches aidants des personnes âgées ou malades : indemnisation, congés, solutions de répit."
    },
    {
      "topicId": "logement",
      "text": "Relancer fortement la construction de logements : le désaccord porte sur les moyens (normes, aides publiques ou marché)."
    },
    {
      "topicId": "logement",
      "text": "Transformer les bureaux et bâtiments vacants en logements."
    },
    {
      "topicId": "solidarites",
      "text": "Faire de l’accompagnement des élèves en situation de handicap (AESH) un vrai métier, mieux payé et plus stable."
    },
    {
      "topicId": "droits_lgbtqia",
      "text": "Aucun candidat qui s’est exprimé ne défend une GPA commerciale, rémunérée comme un service : le désaccord porte sur une GPA sans transaction commerciale, encadrée par l’État, que la plupart refusent aussi."
    },
    {
      "topicId": "egalite",
      "text": "Tous les candidats qui se sont exprimés présentent la lutte contre les violences sexistes et sexuelles comme une priorité ; la proposition de loi d’ensemble examinée à l’automne 2026 a été approuvée en commission sans aucun vote contre. Les désaccords portent sur les moyens, le volet pénal et le volet migratoire."
    },
    {
      "topicId": "education",
      "text": "Augmenter la rémunération des enseignants fait l’objet d’un très large accord, de la gauche à la droite ; les candidats divergent sur le montant, le financement et les contreparties."
    },
    {
      "topicId": "education",
      "text": "La plupart des candidats qui s’expriment veulent utiliser la baisse du nombre d’élèves pour éviter des fermetures de classes « à l’aveugle » ou réduire les effectifs, plutôt que pour faire des économies."
    },
    {
      "topicId": "education",
      "text": "Recentrer l’école primaire sur la lecture, l’écriture et le calcul est une priorité partagée ; aucun candidat ne s’y oppose explicitement."
    },
    {
      "topicId": "societe",
      "text": "Développer l’éducation artistique et culturelle à l’école, de la maternelle au lycée, fait consensus entre des candidats de bords différents."
    },
    {
      "topicId": "numerique",
      "text": "Réduire la dépendance aux géants américains et chinois du numérique fait quasi consensus ; les candidats divergent sur la méthode (règles, investissement, contrôle public)."
    },
    {
      "topicId": "numerique",
      "text": "Les candidats reconnaissent largement que les mécanismes addictifs des réseaux sociaux nuisent aux mineurs ; le désaccord porte sur l’interdiction par l’âge et la vérification d’identité."
    },
    {
      "topicId": "ecologie_energie",
      "text": "Électrifier massivement les usages (transports, chauffage, industrie) : cap partagé par les principaux courants ; le désaccord porte sur la part du nucléaire et des renouvelables."
    },
    {
      "topicId": "ecologie_energie",
      "text": "Renforcer les moyens de lutte contre les feux de forêt (bombardiers d’eau, recrutement de pompiers) : demandé par des candidats de tous bords après l’été 2026 ; seuls l’ampleur et le financement diffèrent."
    },
    {
      "topicId": "agriculture",
      "text": "Refuser l’accord de libre-échange entre l’Union européenne et le Mercosur (Amérique du Sud) : la quasi-totalité des candidats qui se sont exprimés y sont opposés."
    },
    {
      "topicId": "agriculture",
      "text": "Exiger des produits importés le respect des normes imposées aux agriculteurs français : revendiqué d’un bout à l’autre de l’échiquier ; le désaccord porte sur le cadre (Union européenne ou politique nationale) et sur le niveau des normes françaises."
    },
    {
      "topicId": "agriculture",
      "text": "Faciliter l’installation des jeunes agriculteurs et la transmission des exploitations, alors qu’environ 170 000 départs à la retraite sont attendus d’ici 2030."
    },
    {
      "topicId": "territoires",
      "text": "Lutter contre la vie chère dans les outre-mer (prix des produits de première nécessité, coût du fret, octroi de mer, situations de monopole) : proposé par des candidats très différents."
    },
    {
      "topicId": "territoires",
      "text": "Donner davantage de pouvoir et de confiance aux maires, présentés comme l’échelon le plus légitime."
    },
    {
      "topicId": "territoires",
      "text": "Garantir l’accès aux services publics essentiels dans les territoires ruraux et ne plus fermer de classes ou de services sans concertation : objectif affiché par presque tous ; les moyens proposés divergent (voir la question sur les services publics)."
    },
    {
      "topicId": "securite_justice",
      "text": "Augmenter les moyens de la justice, en recrutant magistrats, greffiers et enquêteurs, est réclamé par la plupart des candidats, y compris par ceux qui insistent d’abord sur la sévérité des peines."
    },
    {
      "topicId": "securite_justice",
      "text": "Saisir les avoirs des trafiquants et lutter contre le blanchiment figurent dans presque tous les projets, quelle que soit la stratégie principale défendue contre le trafic de drogue."
    },
    {
      "topicId": "securite_justice",
      "text": "Les candidats qui se sont exprimés ont tous apporté leur soutien aux maires menacés par des trafiquants ; leurs désaccords portent sur les outils juridiques à employer."
    },
    {
      "topicId": "immigration",
      "text": "Presque tous les candidats qui détaillent une politique d’intégration placent l’apprentissage du français au centre, comme condition à remplir ou comme droit à garantir."
    },
    {
      "topicId": "immigration",
      "text": "Aucun candidat ne propose de supprimer le principe du droit d’asile : les désaccords portent sur le lieu de dépôt des demandes, leur suspension en cas de crise et les conditions d’accueil des demandeurs."
    },
    {
      "topicId": "immigration",
      "text": "Du centre-gauche à la droite, les candidats veulent conditionner les visas, l’aide au développement ou les accords avec les pays d’origine à la reprise de leurs ressortissants expulsés ; seuls les partisans de la liberté de circulation rejettent cette logique."
    },
    {
      "topicId": "europe",
      "text": "Presque tous les candidats veulent une politique commerciale européenne plus protectrice (réciprocité, mesures miroirs, prix du carbone aux frontières, préférence européenne dans les secteurs stratégiques) et ceux qui s’expriment rejettent l’accord avec le Mercosur."
    },
    {
      "topicId": "europe",
      "text": "Aucun candidat favorable au maintien dans l’Union ne propose de quitter l’euro : la sortie de la monnaie unique n’est défendue que par des candidats qui veulent aussi quitter l’Union."
    },
    {
      "topicId": "ukraine_russie",
      "text": "Presque tous les candidats condamnent l’invasion russe de l’Ukraine, y compris plusieurs de ceux qui veulent cesser l’aide ou ne soutenir aucun camp."
    },
    {
      "topicId": "proche_orient",
      "text": "La plupart des candidats qui s’expriment se réfèrent à une solution à deux États, y compris certains qui ont jugé prématurée la reconnaissance de 2025."
    },
    {
      "topicId": "defense",
      "text": "Presque tous les candidats veulent conserver la dissuasion nucléaire, y compris ceux qui veulent quitter l’OTAN ; seule une petite minorité envisage de la démanteler."
    },
    {
      "topicId": "institutions",
      "text": "Recourir plus souvent au référendum : la plupart des candidats qui se sont exprimés le souhaitent (le dernier date de 2005) ; ils divergent sur son champ et sur qui peut le déclencher."
    },
    {
      "topicId": "institutions",
      "text": "Réviser la Constitution en début de mandat : la plupart des candidats annoncent une réforme constitutionnelle d’ampleur, avec des contenus très différents."
    },
    {
      "topicId": "laicite_republique",
      "text": "Maintenir l’interdiction des signes religieux ostensibles pour les élèves de l’école publique (loi de 2004) : la quasi-totalité des candidats qui se sont exprimés la défendent ; un seul en demande l’abrogation."
    },
    {
      "topicId": "laicite_republique",
      "text": "Combattre l’antisémitisme : tous les candidats qui s’expriment sur le sujet le condamnent, avec des réponses différentes (sanctions, inéligibilité, éducation)."
    }
  ]
}
