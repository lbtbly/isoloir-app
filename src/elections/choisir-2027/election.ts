import type { ElectionInfo } from '../../core/types'

export const election: ElectionInfo = {
  id: 'choisir-2027',
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
