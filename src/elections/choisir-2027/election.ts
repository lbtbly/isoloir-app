import type { ElectionInfo } from '../../core/types'

export const election: ElectionInfo = {
  id: 'choisir-2027',
  kind: 'primaire',
  // Espaces insécables dans les guillemets : le nom ne se coupe jamais avant « » »
  name: 'Primaire «\u00a0Choisir 2027\u00a0»',
  shortName: 'Primaire Choisir 2027',
  organizers: ['Parti socialiste', 'Place publique', 'Gauche républicaine et socialiste'],
  officialUrl: 'https://choisir2027.fr',
  rounds: [
    { label: '1er tour', start: '2026-10-09T08:00:00+02:00', end: '2026-10-10T20:00:00+02:00' },
    { label: '2nd tour', start: '2026-10-16T08:00:00+02:00', end: '2026-10-17T20:00:00+02:00' },
  ],
  dataVersion: '2026-10-03.1',
  dataFrozenAt: '2026-10-02',
  // Archive depuis l'arrivée de la présidentielle 2027 (décision du propriétaire du 6 octobre 2026 : bascule dès
  // qu'elle est prête, même pendant le vote ; la note ne s'affiche qu'après la fin du vote, votingUntil du registre)
  archived: { since: '2026-10-08', note: 'Le vote a eu lieu les 9-10 et 16-17 octobre 2026.' },
  finalists: null,
  notes: [
    'Les positions ont été relevées dans des sources publiques (professions de foi, programmes, débats télévisés, interviews) et peuvent avoir évolué depuis.',
    'Le troisième débat télévisé (BFMTV, 4 octobre 2026) n’est pas encore pris en compte.',
  ],
  forbiddenTerms: [
    'Parti socialiste',
    'socialiste',
    'Place publique',
    'GRS',
    'Gauche républicaine',
    'Zucman',
    'ordre juste',
    'France + juste',
    'Loi du plus juste',
    'bouclier logement',
    'Acte I',
  ],
  audit: { profiles: 3000, minShare: 17, maxShare: 25 },
  quick: { step1: 8 },
  // Les phrases propres à la primaire, telles qu'elles s'affichaient avant le passage à plusieurs élections
  copy: {
    theName: 'la primaire «\u00a0Choisir 2027\u00a0»',
    atName: 'à la primaire «\u00a0Choisir 2027\u00a0»',
    independence: {
      footer: 'sans lien avec les organisateurs de la primaire ni avec les candidats',
      method:
        'sans lien avec le Parti socialiste, Place publique, la Gauche républicaine et socialiste, le site de la primaire ni les équipes des candidats',
      legal: 'sans lien avec les organisateurs de la primaire, les partis ni les candidats',
    },
    sources:
      'professions de foi publiées sur le site officiel de la primaire, programmes, débats télévisés, interviews et votes',
    officialSite: { photos: 'du site de la primaire', links: 'celui de la primaire' },
    closeGapReason: 'Les candidats d’une même primaire sont proches',
    step1Reason: 'portent sur les grands désaccords de la primaire',
    officialPageLabel: 'Page sur le site de la primaire',
    shareDescription:
      'Outil indépendant pour la primaire «\u00a0Choisir 2027\u00a0»\u00a0: jugez des idées présentées sans le nom des candidats, et voyez de qui vous êtes proche. Vos réponses restent chez vous.',
  },
  // Phase de test : les questions bougent encore, les réponses sont gardées quoi qu'il arrive.
  // À passer à true au lancement, après `node tools/build-pack.mjs … --reset-revisions`.
  revisionTracking: false,
  changelog: [
    {
      date: '2026-10-02',
      text: 'Première version : 19 questions rapides et 50 approfondies, chaque attribution relue contre sa source. Les mesures du projet du Parti socialiste, présenté par le site de campagne d’Olivier Faure comme l’ensemble de ses propositions, lui sont attribuées avec une confiance moyenne.',
    },
    {
      date: '2026-10-03',
      text: 'Avis « d’accord », « sans avis » ou « pas d’accord », et lignes rouges à part ; premier dépouillement après 8 questions, la question sur les alliances en dernier. Positions des candidats inchangées.',
    },
    {
      date: '2026-10-04',
      text: 'Précision sur l’entrée du 2 octobre : la relecture de chaque attribution contre sa source est une vérification automatique, faite par une IA, sans relecture humaine une par une. Les textes rédigés par IA portent désormais la mention « Rédigé par IA ». Positions des candidats inchangées.',
    },
  ],
}
