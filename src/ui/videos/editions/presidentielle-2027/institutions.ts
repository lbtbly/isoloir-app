// Édition « présidentielle 2027 » de la série « Institutions » (src/ui/videos/series/institutions.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/institutions.json).
// Datée : recours au 49.3 arrêtés au 30 janvier 2026 (3 pour le budget 2026), motions de censure au 6 juillet
// 2026, refus de confiance au 8 septembre 2025, référendums d'initiative partagée au 3 octobre 2026, révisions de
// la Constitution au 8 mars 2024. À revoir après l'examen des budgets de l'État et de la Sécurité sociale pour 2027
// (49.3 et motions de censure possibles d'octobre à décembre 2026), et si une dissolution, un vote de confiance,
// une révision ou un nouveau référendum, national ou d'initiative partagée, survient avant le premier tour de
// l'élection présidentielle (18 avril 2027).
// Questions (institutions-23) : la banque de la primaire n'a que deux questions sur ce thème (institutions-1 :
// l'équilibre des pouvoirs ; institutions-2 : la place des citoyens). Pour la présidentielle 2027
// (src/elections/presidentielle-2027/videos.ts), institutions-2 est montrée sous institutions-3 ; la question
// institutions-2 de la présidentielle (élection des députés) n'a pas de vidéo. Aucune correction ne change les
// questions des vidéos : elles restent celles que donne le périmètre.
// Passage ajouté (institutions-18) : la relecture le numérotait -07 et décalait la question finale en -08 ; une
// édition ne renumérote pas les passages d'origine (leurs voix sont enregistrées), il est donc inséré après -06
// sous l'identifiant institutions-constitution-06-conseil-p27.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const AN_RESPONSABILITE: VideoSource = {
  title: 'Fiche de synthèse n° 64 : La mise en cause de la responsabilité du Gouvernement',
  url: 'https://www.assemblee-nationale.fr/dyn/synthese/fonctionnement-assemblee-nationale/evaluation-politiques-publiques-controle-gouvernement/la-mise-en-cause-de-la-responsabilite-du-gouvernement',
  publisher: 'Assemblée nationale',
  date: 'actualisée le 6 décembre 2024',
}

const AN_ENGAGEMENTS: VideoSource = {
  title: 'Engagements de responsabilité du Gouvernement et motions de censure depuis 1958',
  url: 'https://www.assemblee-nationale.fr/dyn/engagements_responsabilite-motions_censures/engagements-de-responsabilite-du-gouvernement-et-motions-de-censure-depuis-1958',
  publisher: 'Assemblée nationale',
  date: 'mise à jour du 9 septembre 2025',
}

const LCP_DISSOLUTIONS: VideoSource = {
  title: 'Dissolution de l’Assemblée nationale : Emmanuel Macron procède à la sixième dissolution depuis 1958',
  url: 'https://lcp.fr/actualites/dissolution-de-l-assemblee-nationale-emmanuel-macron-procede-a-la-sixieme-dissolution',
  publisher: 'LCP-Assemblée nationale',
  date: '10 juin 2024',
}

const CC_REVISIONS: VideoSource = {
  title: 'Quand la Constitution a-t-elle été modifiée ?',
  url: 'https://www.conseil-constitutionnel.fr/la-constitution/quand-la-constitution-a-t-elle-ete-modifiee',
  publisher: 'Conseil constitutionnel',
  date: 'mise à jour du 11 mars 2024',
}

const CC_HISTOIRE_REFERENDUM: VideoSource = {
  title: 'L’histoire du référendum sous la Ve République',
  url: 'https://www.conseil-constitutionnel.fr/la-constitution/l-histoire-du-referendum-sous-la-ve-republique',
  publisher: 'Conseil constitutionnel',
  date: 'mise à jour du 11 février 2020',
}

/* ——— Les sources ajoutées ou corrigées par la relecture ——— */

/** institutions-7 : le recours du 30 janvier 2026 (titre de la page, « PLF2026 » sans espace) */
const AN_PLF2026_LECTURE_DEFINITIVE: VideoSource = {
  title: 'Adoption du PLF2026, en lecture définitive, après l’engagement de la responsabilité du Gouvernement sur le projet de loi et le rejet de 2 motions de censure (49.3)',
  url: 'https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/adoption-du-plf2026-en-lecture-definitive-apres-l-engagement-de-la-responsabilite-du-gouvernement-sur-le-projet-de-loi-et-le-rejet-de-2-motions-d',
  publisher: 'Assemblée nationale',
  date: 'février 2026',
}

/** institutions-15 : le refus de confiance du 8 septembre 2025 */
const AN_CONFIANCE_2025: VideoSource = {
  title: 'Vote de confiance : l’Assemblée nationale a désapprouvé la déclaration de politique générale du Gouvernement',
  url: 'https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/vote-de-confiance-l-assemblee-nationale-a-desapprouve-la-declaration-de-politique-generale-du-gouvernement',
  publisher: 'Assemblée nationale',
  date: '8 septembre 2025',
}

/** institutions-15 : la motion de censure votée le 6 juillet 2026 (compte rendu de séance) */
const AN_CENSURE_2026: VideoSource = {
  title: 'Compte rendu de la séance du lundi 6 juillet 2026',
  url: 'https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-extraordinaire-de-2025-2026/seance-du-lundi-06-juillet-2026',
  publisher: 'Assemblée nationale',
  date: '6 juillet 2026',
}

/** institutions-18 : CC_ARTICLE_89, au titre élargi aux articles sur le contrôle des lois */
const CC_ARTICLES_61_89: VideoSource = {
  title: 'Texte intégral de la Constitution du 4 octobre 1958 en vigueur (articles 61, 61-1, 62 et 89)',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
  date: 'à jour de la révision constitutionnelle du 8 mars 2024',
}

/* ——— Les chiffres corrigés, repris dans plusieurs vidéos (libellé, date) ——— */

/** institutions-6 : RECOURS_49_3, trois recours en janvier 2026 (institutions-intro-04, institutions-49-3-05) */
const RECOURS_49_3 = {
  value: '116',
  label: 'recours au 49.3 entre 1959 et septembre 2025, sur 61 textes, selon le bilan de l’Assemblée nationale. Le gouvernement y a encore eu recours 3 fois pour le budget 2026, les 20, 23 et 30 janvier 2026',
  date: '9 septembre 2025',
}

/** institutions-10 : CENSURES, vote du 6 juillet 2026 et refus de confiance du 8 septembre 2025
 *  (institutions-intro-05, institutions-pouvoirs-04) */
const CENSURES = {
  value: '2',
  label: 'motions de censure adoptées depuis 1958 : en octobre 1962 et le 4 décembre 2024. Aucune autre n’a atteint la majorité requise jusqu’au vote du 6 juillet 2026. Par ailleurs, le 8 septembre 2025, l’Assemblée a refusé la confiance que le gouvernement lui demandait : 364 voix contre, 194 pour',
  date: 'état au 6 juillet 2026',
}

export const INSTITUTIONS: SeriesPatch = {
  videos: {
    'institutions-intro': {
      // institutions-8 : les sources des libellés corrigés, ajoutées en fin de liste (index 0 à 4 inchangés)
      sources: [
        AN_RESPONSABILITE,
        LCP_DISSOLUTIONS,
        AN_ENGAGEMENTS,
        CC_REVISIONS,
        CC_HISTOIRE_REFERENDUM,
        AN_PLF2026_LECTURE_DEFINITIVE,
        AN_CONFIANCE_2025,
        AN_CENSURE_2026,
      ],
      segments: {
        // institutions-6 : libellé affiché seulement, le « say » (116 fois jusqu'en septembre 2025) reste exact
        'institutions-intro-04': {
          figure: { ...RECOURS_49_3, sourceIndex: 2 },
        },
        // institutions-10 : libellé affiché seulement, le « say » (2 motions de censure) reste exact
        'institutions-intro-05': {
          figure: { ...CENSURES, sourceIndex: 0 },
        },
      },
    },
    'institutions-pouvoirs': {
      // institutions-15 : les sources du refus de confiance et du vote du 6 juillet 2026, en fin de liste
      sources: [AN_RESPONSABILITE, LCP_DISSOLUTIONS, AN_CONFIANCE_2025, AN_CENSURE_2026],
      segments: {
        // institutions-10 à 14 : le refus de confiance du 8 septembre 2025, dit et dessiné à part des censures
        'institutions-pouvoirs-04': {
          say: 'Depuis 1958, l’Assemblée a adopté 2 motions de censure : en octobre 1962, et le 4 décembre 2024. Et le 8 septembre 2025, elle a refusé sa confiance au gouvernement.',
          spoken: 'Depuis mille neuf cent cinquante-huit, l’Assemblée a adopté deux motions de censure : en octobre mille neuf cent soixante-deux, et le quatre décembre deux mille vingt-quatre. Et le huit septembre deux mille vingt-cinq, elle a refusé sa confiance au gouvernement.',
          draw: 'Une ligne du temps de 1958 à 2026 ; deux repères au bleu bille, octobre 1962 et 4 décembre 2024 ; puis un troisième, au trait seul, 8 septembre 2025, marqué « confiance refusée ».',
          alt: 'Sur une ligne du temps de 1958 à 2026, deux repères de censure : octobre 1962 et 4 décembre 2024 ; un repère de confiance refusée : 8 septembre 2025.',
          emphasis: ['2 motions de censure', 'refusé sa confiance'],
          figure: { ...CENSURES, sourceIndex: 0 },
        },
      },
    },
    'institutions-49-3': {
      // institutions-7 : la source du recours du 30 janvier 2026, en fin de liste (index 0 et 1 inchangés)
      sources: [AN_RESPONSABILITE, AN_ENGAGEMENTS, AN_PLF2026_LECTURE_DEFINITIVE],
      segments: {
        // institutions-2 à 6 : trois recours en janvier 2026, pas deux
        'institutions-49-3-05': {
          say: 'Entre 1959 et septembre 2025, il a servi 116 fois, sur 61 textes. Puis 3 fois en janvier 2026, pour le budget 2026.',
          spoken: 'Entre mille neuf cent cinquante-neuf et septembre deux mille vingt-cinq, il a servi cent seize fois, sur soixante et un textes. Puis trois fois en janvier deux mille vingt-six, pour le budget deux mille vingt-six.',
          draw: 'Une grille de 116 petites cases au bleu bille, puis trois cases de plus, à l’écart, marquées janvier 2026.',
          alt: 'Une grille de 116 cases, une par recours, puis trois cases de plus.',
          figure: { ...RECOURS_49_3, sourceIndex: 1 },
        },
      },
    },
    'institutions-constitution': {
      // institutions-18 : titre de CC_ARTICLE_89 élargi aux articles 61, 61-1 et 62 (même place, index inchangés)
      sources: [CC_ARTICLES_61_89, CC_REVISIONS],
      insert: [
        {
          // institutions-18 : le contrôle des lois par le Conseil constitutionnel, avant la question finale
          after: 'institutions-constitution-06',
          segment: {
            id: 'institutions-constitution-06-conseil-p27',
            say: 'La Constitution s’impose aussi aux lois. Le Conseil constitutionnel peut censurer une loi qui ne la respecte pas, et ses décisions ne sont susceptibles d’aucun recours.',
            visual: 'point',
            draw: 'Le livre de la Constitution au-dessus d’une feuille de texte ; entre les deux, une loupe au bleu bille, le Conseil constitutionnel.',
            emphasis: ['Le Conseil constitutionnel', 'aucun recours'],
          },
        },
      ],
    },
    'institutions-citoyens': {
      segments: {
        // institutions-21 : le référendum que le président peut décider (article 11, source déjà dans la vidéo)
        'institutions-citoyens-02': {
          say: 'En France, vous décidez surtout en élisant vos représentants. Le président peut soumettre au référendum certains projets de loi, sur proposition du gouvernement ou des deux assemblées. Et aucune procédure ne permet aux seuls électeurs de lancer un référendum national.',
          draw: 'Une personne, une urne, puis l’hémicycle des représentants ; à côté, le président au trait, une feuille de texte et trois étiquettes : pouvoirs publics, économie-social-environnement, traités ; dessous, des électeurs et une flèche en pointillé vers une urne restée en pointillé.',
          alt: 'À côté du président, trois étiquettes : pouvoirs publics ; politique économique, sociale ou environnementale ; traités.',
          emphasis: ['en élisant vos représentants', 'aux seuls électeurs', 'certains projets de loi'],
        },
      },
    },
  },
}
