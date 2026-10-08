import type { ElectionInfo } from '../../core/types'

// Réglages de l'élection présidentielle 2027. Ce fichier n'importe que des types : vite.config.ts,
// tools/build-og.mjs, tools/check-dist.mjs et tools/audit-pack.mjs le lisent tel quel avec Node.
// Les seuils (checks), les termes interdits et les périodes de gel reprennent research/presidentielle-2027/config.json,
// source des outils de données : les tests vérifient que checks et config.quality restent identiques.
export const election: ElectionInfo = {
  id: 'presidentielle-2027',
  kind: 'presidentielle',
  name: 'Élection présidentielle 2027',
  shortName: 'Présidentielle 2027',
  // Élection publique : aucun organisateur à nommer (les mentions légales n'en parlent pas quand la liste est vide)
  organizers: [],
  // Le Conseil constitutionnel reçoit les parrainages, arrête la liste officielle des candidats et proclame les résultats
  officialUrl: 'https://www.conseil-constitutionnel.fr',
  // Vote la veille (le samedi) en Guadeloupe, Martinique, Guyane, à Saint-Pierre-et-Miquelon, Saint-Barthélemy,
  // Saint-Martin, en Polynésie française et dans les bureaux du continent américain ; clôture le dimanche à 20 h à Paris
  rounds: [
    { label: 'Premier tour', start: '2027-04-17T08:00:00-04:00', end: '2027-04-18T20:00:00+02:00' },
    { label: 'Second tour', start: '2027-05-01T08:00:00-04:00', end: '2027-05-02T20:00:00+02:00' },
  ],
  dataVersion: '2026-10-08.1',
  dataFrozenAt: '2026-10-07',
  finalists: null,
  notes: [
    'Les positions ont été relevées dans des sources publiques récentes (déclarations, interviews, propositions de loi, votes, programmes des partis) et peuvent avoir évolué depuis.',
    'Beaucoup de candidats n’ont pas encore publié leur programme : les positions inconnues sont donc fréquentes.',
    'Le ou la candidate de la primaire « Choisir 2027 » sera ajoutée après son second tour, le 17 octobre 2026.',
  ],
  forbiddenTerms: [
    'Rassemblement national',
    'RN',
    'France insoumise',
    'LFI',
    'Les Républicains',
    'Horizons',
    'Parti communiste',
    'PCF',
    'Génération écologie',
    'Lutte ouvrière',
    'Debout la France',
    'UPR',
    'Les Patriotes',
    'Révolution permanente',
    'NPA',
    'France Libre',
    'Parti animaliste',
    'Nouvelle Énergie',
    'La France humaine et forte',
    'Parti socialiste',
    'Place publique',
    'Reconquête',
    'Écologistes',
    'Nouveau Front populaire',
    'NFP',
    'macronie',
    'extrême droite',
    'extrême gauche',
    'Nous France',
  ],
  // Noms de partis qui sont aussi des mots courants : jamais cherchés, même comme étiquette d'un candidat
  forbiddenTermsAllow: ['Renaissance', 'La Convention', 'Ensemble'],
  // Calculé par tools/audit-pack.mjs (questionnaire rapide, candidats notés) ; affiché sur l'accueil, vérifié par les tests
  audit: { profiles: 3000, minShare: 5, maxShare: 10 },
  quick: { step1: 10 },
  // Hors classement : un candidat connu sur moins de la moitié des questions comptées est montré sous le classement,
  // son score à titre indicatif (décision du propriétaire du 7 octobre 2026 ; l'audit montrait un candidat connu
  // sur 7 questions de la banque premier sur 24 % des profils aléatoires, par simple variance).
  // Non classés : les sept candidats dont les positions sont connues sur moins de la moitié des questions de la
  // banque (de 7 à 47 sur 100 ; le moins connu des autres l'est sur 59) n'ont ni score ni rang, nulle part
  // (décision du propriétaire du 7 octobre 2026 : « ça ne sera pas pertinent »). Liste révisable : un candidat y
  // revient quand ses positions sont connues, par exemple à la publication de son programme. Le motif affiché reste
  // factuel et le même pour tous. research/presidentielle-2027/config.json reprend la liste (scoringExcluded).
  ranking: {
    minCoverageShare: 0.5,
    excluded: {
      ids: ['asselineau', 'batho', 'becht', 'bertrand', 'bouamrane', 'lalanne', 'markovic'],
      // Motif factuel, le même pour chacun, sans cause supposée ; le chiffre de chacun est donné à côté
      reason: 'positions connues sur trop peu de questions',
      since: '2026-10-07',
    },
  },
  checks: {
    // Mira Markovic, candidature centrée sur la cause animale : exemptée de la seule couverture par candidat de
    // l'étape 1 (décision du propriétaire du 7 octobre 2026)
    step1: { count: 10, minKnownShare: 0.85, minKnownPerCandidate: 8, exempt: ['markovic'] },
    quick: { min: 22, max: 26, minKnownShare: 0.75, minCandidateShare: 0.7, maxSpread: 6 },
    bank: { min: 85, max: 100, approachesMin: 4, approachesMax: 9, maxMainShare: 0.6, maxMainShareScope: 'quick', minCandidateShare: 0.4 },
    audit: { step1: [3, 2], quick: [4, 2.5] },
  },
  // Veille et jours de vote : du vendredi, 0 h à Paris (veille du vote du samedi outre-mer), à la clôture du dimanche
  freezeWindows: [
    { start: '2027-04-16T00:00:00+02:00', end: '2027-04-18T20:00:00+02:00' },
    { start: '2027-04-30T00:00:00+02:00', end: '2027-05-02T20:00:00+02:00' },
  ],
  pending: [
    'Le ou la candidate désignée par la primaire « Choisir 2027 » (vote les 9-10 et 16-17 octobre 2026) sera ajoutée après le second tour.',
  ],
  copy: {
    theName: 'l’élection présidentielle 2027',
    atName: 'à l’élection présidentielle 2027',
    independence: {
      footer: 'sans lien avec les candidats, leurs partis ni les pouvoirs publics',
      method: 'sans lien avec les candidats, leurs partis, leurs équipes de campagne ni les pouvoirs publics',
      legal: 'sans lien avec les candidats, les partis ni les pouvoirs publics',
    },
    sources:
      'programmes et déclarations des candidats, interviews, votes, propositions de loi et programmes récents des partis',
    // Pas d'officialSite : le site du Conseil constitutionnel ne publie pas de photos des candidats, et les
    // mentions légales le citent déjà par officialUrl
    closeGapReason: 'Les candidats sont nombreux et beaucoup de programmes sont encore incomplets',
    // La couverture des positions (part des candidats connus sur ces questions) est calculée par la Méthode
    step1Reason: 'portent sur les grands clivages de l’élection',
    // Libellé du lien Candidate.website, qu'aucune fiche n'a : aucun site officiel n'a de page par candidat avant la
    // liste officielle du Conseil constitutionnel (mars 2027)
    officialPageLabel: 'Page sur le site du Conseil constitutionnel',
    shareDescription:
      'Outil indépendant pour l’élection présidentielle 2027 : jugez des idées présentées sans le nom des candidats, et voyez de qui vous êtes proche. Vos réponses restent chez vous.',
  },
  // En ligne depuis le 8 octobre 2026 (révisions remises à 1 par `node tools/build-pack.mjs … --reset-revisions`) :
  // une réponse donnée sur une version antérieure d'une question est mise de côté, à revoir.
  revisionTracking: true,
  changelog: [
    {
      date: '2026-10-08',
      text: 'Première version en ligne : 21 candidats déclarés au 6 octobre 2026, dont deux (Éric Zemmour, Xavier Bertrand) qui ont annoncé leur candidature sans l’avoir encore officialisée ; positions relevées et vérifiées automatiquement par une IA contre leurs sources, sans relecture humaine une par une. Sept candidats ne sont pas classés, faute de positions connues sur au moins la moitié des questions (de 7 à 47 sur 100) : leurs fiches et leurs positions restent consultables, et la liste sera revue à mesure que leurs programmes seront publiés. Un candidat connu sur moins de la moitié de vos réponses apparaît sous le classement, avec son score à titre indicatif (voir la méthode).',
    },
  ],
}
