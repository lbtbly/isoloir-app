// Édition « présidentielle 2027 » de la série « Territoires et services publics » (src/ui/videos/series/territoires.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/territoires.json).
// Datée : valeur du point d'indice inchangée depuis le 1er juillet 2023 (chiffres du 2e trimestre 2026, DGAFP,
// septembre 2026) ; Smic brut et traitement minimum de Service-Public.fr, page vérifiée le 1er juin 2026. À revoir
// si le point est revalorisé (le projet de loi de finances pour 2027 annonce qu'il ne le sera pas en 2027), à la
// revalorisation du Smic du 1er janvier 2027 (territoires-agents-04) et à la parution des trimestres suivants
// (territoires-agents-03).
// Datée : projet de loi de finances pour 2027, n° 3210, déposé le 1er octobre 2026 (concours de l'État aux
// collectivités ; article 84 : reversement du dispositif de lissage de 2025 étalé, un tiers en 2026 puis le reste
// de 2027 à 2031 : fiche territoires-x2, territoires-collectivites-07) ; révision de la Constitution sur la Corse,
// adoptée par l'Assemblée nationale le 23 juin 2026, examen en séance au Sénat prévu le 26 octobre 2026
// (territoires-collectivites-02). À revoir après leur adoption.
// Datée : effectifs publics fin 2023 (territoires-intro-03, territoires-agents-06), à remplacer par ceux de fin 2024
// dès qu'une source sûre les donne (Insee, DGAFP) ; vie chère outre-mer : protocole martiniquais d'octobre 2024
// (territoires-outre-mer-06 et -07) ; le projet de loi de lutte contre la vie chère dans les outre-mer, adopté par
// le Sénat le 28 octobre 2025, attend son examen à l'Assemblée nationale : à revoir s'il est adopté.
// (territoires-17. Dans cette édition, territoires-intro-03 et les vidéos territoires-agents et territoires-outre-mer
// ne sont pas montrés : les échéances qui les visent ne valent ici que s'ils y reviennent. Restent, pour les vidéos
// montrées, le projet de loi de finances pour 2027 (territoires-collectivites-07 et le passage inséré après lui,
// dont le libellé dit « en plusieurs années » pour rester juste quel que soit le sort de l'article 84) et la
// révision sur la Corse (territoires-collectivites-02).)
// Choix de territoires-16 : option (a) de l'arbitrage. Les questions de cette élection sous ce thème sont
// territoires-1, -2, -x3 (Corse), -x4 (Nouvelle-Calédonie) et -x5 (zéro artificialisation nette) ; aucune ne porte
// sur la fonction publique ni sur la vie chère outre-mer. L'option (b) rattacherait « Fonction publique » à
// finances_publiques-3, question d'un autre thème (finances_publiques), contre la règle « chaque vidéo mène à des
// questions de son thème » que tests/videos.test.ts vérifie pour les séries d'origine ; sa fiche, écrite le
// 8 octobre, donne les effectifs de fin 2024 (5 876 700 agents, 24,0 % de contractuels), pas ceux de la vidéo
// (5,80 millions et 23 % fin 2023) ni ses chiffres de salaires : la vidéo serait d'abord à reprendre sur cette
// fiche. Les vidéos territoires-agents et territoires-outre-mer restent donc dans la série d'origine ;
// l'introduction annonce deux questions et ne garde ni les agents publics (03) ni l'écart de prix outre-mer (05),
// absents des fiches de ses questions, ni leurs sources : le chiffre de l'investissement (04) change d'index de source.
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/territoires.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
// Reste à trancher par le propriétaire (hors de cette correction) : la fiche territoires-1 de cette élection porte
// désormais 445 maternités en 2024 (Drees) et plus la série 721, 557, 471 que dit territoires-services-06 (source :
// le rapport de la Cour des comptes, dans les sources de la vidéo) ; territoires-8 non appliquée : sa condition
// (territoires-7) n'est pas remplie, la fiche territoires-1 montrant désormais 445 maternités en 2024 (Drees) ; à
// reprendre avec l'alignement de territoires-services-06 sur la fiche. La voix de territoires-services-04 garde la
// sélection de trois difficultés sans la deuxième (29,3 %), seul son libellé écrit les donne toutes (territoires-4).
// Le libellé du passage inséré territoires-collectivites-07-comptes-p27 est celui proposé par territoires-10 ; la
// fiche territoires-2 de cette élection (8 octobre) ne l'a pas repris (500, 220 et 280 M€ « restitués sur trois
// ans », plus 15,6 et 152,5 Md€) : la fiche ou ce libellé est à aligner avant la séance de voix.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de l'introduction, copiées de la série (la liste est donnée en entier) ——— */

const INSEE_DEMARCHES: VideoSource = {
  title: 'Les difficultés rencontrées lors des démarches administratives – France, portrait social, édition 2025',
  url: 'https://www.insee.fr/fr/statistiques/8612560?sommaire=8612596',
  publisher: 'Insee',
  date: '2025-11-18',
}

const OFGL: VideoSource = {
  title: 'Rapport de l’OFGL 2026 – Vue d’ensemble sur l’année 2025',
  url: 'https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/OFGL/pre%20rapport%202026/1-%20Vue%20d%27ensemble.pdf',
  publisher: 'Observatoire des finances et de la gestion publique locales (OFGL)',
  date: '2026',
}

/** Libellé de l'investissement local, repris de la série */
const INVEST_LABEL = 'Investissement des administrations publiques locales (collectivités et organismes locaux), en hausse de 3,4 % sur un an'

export const TERRITOIRES: SeriesPatch = {
  videos: {
    /* ——— Introduction ——— */
    // territoires-16 (option a) : les deux questions de cette élection qui ont leur fiche et leur vidéo, dans l'ordre
    // des vidéos qui suivent ; sans les passages 03 (agents publics) et 05 (prix outre-mer), ni leurs sources
    // (DGAFP, Insee Première sur les prix des DOM).
    'territoires-intro': {
      questionIds: ['territoires-1', 'territoires-2'],
      sources: [INSEE_DEMARCHES, OFGL],
      segments: {
        'territoires-intro-03': 'omit',
        // L'OFGL passe de sources[2] à sources[1]
        'territoires-intro-04': {
          figure: { value: '70,7 Md€', label: INVEST_LABEL, date: '2025', sourceIndex: 1 },
        },
        'territoires-intro-05': 'omit',
        // La question des collectivités vaut pour les deux élections (organisation, pouvoirs, moyens)
        'territoires-intro-06': {
          say: 'Alors, deux questions se posent. Comment garantir l’accès aux services publics partout ? Quelle organisation, quels pouvoirs et quels moyens pour les collectivités ?',
          draw: 'Deux pictogrammes côte à côte, dessinés l’un après l’autre : un guichet, un bâtiment public.',
          emphasis: ['deux questions'],
        },
        'territoires-intro-07': {
          say: 'Ce sont les deux sujets des vidéos qui suivent.',
          draw: 'Le sommaire des deux vidéos qui suivent, chacune avec son pictogramme.',
        },
      },
    },

    /* ——— Services publics ——— */
    'territoires-services': {
      questionIds: ['territoires-1'],
      segments: {
        // territoires-4 : le libellé écrit suit celui de la fiche corrigée (les trois difficultés les plus citées, et
        // l'accès à Internet) ; la voix et le dessin ne changent pas.
        'territoires-services-04': {
          figure: {
            value: '10,3 %',
            label: 'des ménages ayant rencontré une difficulté citent l’absence de service administratif près de chez eux, et 9,5 % l’absence d’accès à Internet ou la difficulté à se servir du site. Les difficultés les plus citées sont des délais d’attente trop longs (45,3 %), une procédure trop difficile à comprendre (29,3 %) et l’absence d’un interlocuteur compétent (22,7 %) (France hors Mayotte)',
            date: '2023',
            sourceIndex: 1,
          },
        },
        // territoires-6 : la conclusion de la Cour sur la sécurité des soins, avant son constat sur les trajets ; le
        // passage 09 garde la balance qualité / proximité.
        'territoires-services-07': {
          say: 'Selon la Cour des comptes, la France a des résultats périnatals médiocres par rapport aux autres pays européens, et la sécurité des soins doit primer. Elle note aussi que réduire l’offre allonge les temps de trajet, ce qui inquiète les familles.',
          draw: 'Une croix de soin au trait sous un petit bouclier, la sécurité ; puis une maison au bout d’une route : la maternité, d’abord proche, en pointillé, s’éloigne au bout de la route, et un sablier se pose à côté.',
          emphasis: ['doit primer', 'allonge les temps de trajet'],
        },
      },
    },

    /* ——— Fonction publique ——— */
    // territoires-16 (option a) : aucune question de cette élection sous ce thème ; la vidéo reste dans la série
    // d'origine, hors du site.
    'territoires-agents': {
      omit: true,
    },

    /* ——— Collectivités ——— */
    'territoires-collectivites': {
      questionIds: ['territoires-2'],
      // territoires-13 : l'état des comptes des collectivités, après les dotations (fiche territoires-2, figures[3] ;
      // source OFGL, sources[1]). Nouvel identifiant (pas de renumérotation dans une édition) ; libellé proposé par
      // territoires-10 ; la fiche territoires-2 de cette élection (8 octobre) ne l'a pas repris (500, 220 et 280 M€
      // « restitués sur trois ans », plus 15,6 et 152,5 Md€) : la fiche ou ce libellé est à aligner avant la séance
      // de voix.
      insert: [
        {
          after: 'territoires-collectivites-07',
          segment: {
            id: 'territoires-collectivites-07-comptes-p27',
            say: 'Et leurs comptes ? En 2025, les collectivités locales sont en déficit de 9,3 milliards d’euros, contre 12 milliards en 2024.',
            spoken: 'Et leurs comptes ? En deux mille vingt-cinq, les collectivités locales sont en déficit de neuf virgule trois milliards d’euros, contre douze milliards en deux mille vingt-quatre.',
            visual: 'figure',
            draw: 'Deux barres au trait, à la même échelle depuis zéro : le déficit de 2024, puis celui de 2025, plus court.',
            emphasis: ['9,3 milliards d’euros'],
            figure: {
              value: '9,3 Md€',
              label: 'Déficit des collectivités locales au sens des comptes nationaux, après 12,0 Md€ en 2024. La même année, l’État a prélevé 1 Md€ sur les recettes fiscales de certaines communes, intercommunalités, départements et régions (dispositif de lissage conjoncturel), à leur restituer en plusieurs années, sauf 10 % réservés à la péréquation',
              date: '2025',
              sourceIndex: 1,
            },
            chart: {
              kind: 'series',
              unit: 'Md€',
              items: [
                { label: '2024', value: 12 },
                { label: '2025', value: 9.3 },
              ],
            },
          },
        },
      ],
      segments: {
        // territoires-12 : l'organisation d'abord, objet de la question de cette élection ; cinq curseurs dans l'ordre
        // des sujets dits.
        'territoires-collectivites-08': {
          say: 'Le débat porte sur leur organisation et le nombre d’échelons, et sur le partage des compétences avec l’État. Il porte aussi sur leur autonomie fiscale, le niveau des dotations, et leur droit d’adapter les règles nationales.',
          draw: 'Cinq curseurs au trait, côte à côte, chacun sous un pictogramme : trois bâtiments empilés, mallette, pièces, enveloppe, document ; aucun n’est poussé.',
        },
        // territoires-14 : la question de fin, valable pour les deux élections
        'territoires-collectivites-09': {
          say: 'Alors, quelle organisation, quels pouvoirs et quels moyens pour les collectivités locales ?',
          emphasis: ['quelle organisation', 'quels pouvoirs', 'quels moyens'],
        },
      },
    },

    /* ——— Vie chère outre-mer ——— */
    // territoires-16 (option a) : aucune question de cette élection sous ce thème ; la vidéo reste dans la série
    // d'origine, hors du site.
    'territoires-outre-mer': {
      omit: true,
    },
  },
}
