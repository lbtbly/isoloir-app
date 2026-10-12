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
  dataVersion: '2026-10-12.1',
  dataFrozenAt: '2026-10-09',
  finalists: null,
  notes: [
    'Les positions ont été relevées dans des sources publiques récentes (déclarations, interviews, propositions de loi, votes, programmes des partis) et peuvent avoir évolué depuis.',
    'Beaucoup de candidats n’ont pas encore publié leur programme : les positions inconnues sont donc fréquentes.',
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
  audit: { profiles: 3000, minShare: 5, maxShare: 9 },
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
      // Ségolène Royal ajoutée le 9 octobre 2026 avec les candidats de la primaire : connue sur 38 questions sur 100 ;
      // masquée depuis le 12 octobre (hidden), elle est retirée de cette liste au chargement du pack et y revient si on la montre
      ids: ['asselineau', 'batho', 'becht', 'bertrand', 'bouamrane', 'lalanne', 'markovic', 'royal'],
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
  // Ordre de la page des candidats, de l'extrême gauche à l'extrême droite (demande du propriétaire du 8 octobre 2026) :
  // la grille officielle la plus récente des nuances politiques du ministère de l'Intérieur, dans son ordre, puis
  // l'ordre alphabétique au sein d'une même nuance. La présidentielle n'attribue pas de nuances : chaque candidat
  // reçoit celle de son parti dans la grille, ou à défaut celle que le ministère lui a donnée à sa dernière élection
  // (research/presidentielle-2027/parties-spectrum.json, recherche vérifiée le 9 octobre 2026). Couleurs de famille,
  // Cartes aux quatre pastels du site, par bloc (demande du propriétaire du 10 octobre 2026) : rouge à gauche, jaune au
  // centre, bleu à droite, vert pour le bloc « Autres » de la grille (écologistes, divers, régionalistes).
  spectrum: {
    nuances: [
      { code: 'EXG', label: 'Extrême gauche', bloc: 'extreme-gauche' },
      { code: 'FI', label: 'La France insoumise', bloc: 'extreme-gauche' },
      { code: 'COM', label: 'Parti communiste français', bloc: 'gauche' },
      { code: 'SOC', label: 'Parti socialiste', bloc: 'gauche' },
      { code: 'GEN', label: 'Génération.s', bloc: 'gauche' },
      { code: 'PLP', label: 'Place Publique', bloc: 'gauche' },
      { code: 'RDG', label: 'Parti radical de gauche', bloc: 'gauche' },
      { code: 'VEC', label: 'Les Écologistes', bloc: 'gauche' },
      { code: 'DVG', label: 'Divers gauche', bloc: 'gauche' },
      { code: 'REG', label: 'Régionalistes', bloc: 'autres' },
      { code: 'ECO', label: 'Ecologiste', bloc: 'autres' },
      { code: 'DIV', label: 'Divers', bloc: 'autres' },
      { code: 'REN', label: 'Renaissance', bloc: 'centre' },
      { code: 'MDM', label: 'Modem', bloc: 'centre' },
      { code: 'HOR', label: 'Horizons', bloc: 'centre' },
      { code: 'PR', label: 'Parti Radical', bloc: 'centre' },
      { code: 'DVC', label: 'Divers centre', bloc: 'centre' },
      { code: 'UDI', label: 'Union des Démocrates et Indépendants', bloc: 'centre' },
      { code: 'LR', label: 'Les Républicains', bloc: 'droite' },
      { code: 'DVD', label: 'Divers droite', bloc: 'droite' },
      { code: 'DSV', label: 'Droite souverainiste', bloc: 'droite' },
      { code: 'UDR', label: 'Union des Droites pour la République', bloc: 'extreme-droite' },
      { code: 'RN', label: 'Rassemblement National', bloc: 'extreme-droite' },
      { code: 'REC', label: 'Reconquête', bloc: 'extreme-droite' },
      { code: 'EXD', label: 'Extrême droite', bloc: 'extreme-droite' },
    ],
    blocs: [
      { id: 'extreme-gauche', label: 'Extrême gauche', pastel: 'rouge' },
      { id: 'gauche', label: 'Gauche', pastel: 'rouge' },
      { id: 'autres', label: 'Autres', pastel: 'vert' },
      { id: 'centre', label: 'Centre', pastel: 'jaune' },
      { id: 'droite', label: 'Droite', pastel: 'bleu' },
      { id: 'extreme-droite', label: 'Extrême droite', pastel: 'bleu' },
    ],
    source: { title: 'Circulaire NOR INTP2618666C du 23 août 2026, annexe 1 : grille des nuances individuelles (élections sénatoriales 2026)', url: 'https://www.legifrance.gouv.fr/circulaire/id/45684', date: '2026-08-23', publisher: 'Ministère de l’Intérieur' },
    // L'axe de la page « Mon profil politique » (décision du propriétaire du 12 octobre 2026) : les cinq blocs de la
    // grille, de l'extrême gauche à l'extrême droite, avec leurs formes dans les phrases ; le bloc « Autres » n'en est
    // pas (une liste, pas une place entre la gauche et le centre). Les libellés sont ceux de la grille, toujours
    // attribués à elle dans les phrases (« que la grille classe à droite »).
    axis: [
      { bloc: 'extreme-gauche', short: 'Ext. gauche', where: 'à l’extrême gauche', from: 'de l’extrême gauche', to: 'à l’extrême gauche' },
      { bloc: 'gauche', short: 'Gauche', where: 'à gauche', from: 'de la gauche', to: 'à la gauche' },
      { bloc: 'centre', short: 'Centre', where: 'au centre', from: 'du centre', to: 'au centre' },
      { bloc: 'droite', short: 'Droite', where: 'à droite', from: 'de la droite', to: 'à la droite' },
      { bloc: 'extreme-droite', short: 'Ext. droite', where: 'à l’extrême droite', from: 'de l’extrême droite', to: 'à l’extrême droite' },
    ],
  },
  // Primaire « Choisir 2027 » remportée par Raphaël Glucksmann dès le premier tour, le 11 octobre 2026 : les quatre autres
  // candidats sont masqués, fiches et positions gardées (demande du propriétaire du 12 octobre 2026, « cache-les
  // uniquement pour l'instant »). Les montrer à nouveau : réécrire d'abord leur mention « primary » et rétablir leur
  // portrait et leur logo, gardés en commentaire (candidates.ts), les retirer d'ici et de hiddenCandidateIds du registre
  // (src/elections/index.ts), les remettre dans candidateIds, puis node tools/audit-pack.mjs presidentielle-2027 pour
  // les chiffres de « audit », et une entrée de journal.
  hidden: ['faure', 'guedj', 'maurel', 'royal'],
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
      date: '2026-10-12',
      // Affichée aussi en tête du dépouillement d'un visiteur qui revient (Results, « mises à jour depuis votre dernier
      // passage ») : l'effet sur le classement d'abord, sans score ni nom des candidats masqués (le score est sur la fiche)
      text: 'Les quatre candidats de la primaire «\u00a0Choisir 2027\u00a0» qui n’ont pas été désignés ne sont plus présentés\u00a0: 22 candidats, dont 15 classés. Raphaël Glucksmann y a été désigné dès le premier tour, le 11 octobre 2026. Les pages et les vidéos propres à la primaire ne sont plus en ligne.',
    },
    {
      date: '2026-10-12',
      // Nouvelle page, sans effet sur le score (METHOD_VERSION reste 2.0) ; chiffres publiés : core/echiquierCopy.ts.
      // Écrite après l'entrée du même jour : à date égale, c'est la première écrite qui s'affiche en tête du dépouillement
      // d'un visiteur qui revient (Results, latestChange), et c'est elle qui dit ce qui change dans son classement
      text: 'Nouvelle page «\u00a0Mon profil politique\u00a0», après le dépouillement\u00a0: lecture de vos réponses, thème par thème, au regard de la grille des nuances du ministère de l’Intérieur. Le score et le classement ne changent pas.',
    },
    {
      date: '2026-10-10',
      text: 'Retour des vidéos « Les sujets », dans une version propre à la présidentielle : chiffres mis à jour et formulations rééquilibrées après une relecture par IA sous trois sensibilités (gauche, centre, droite), 93 passages réenregistrés et redessinés. Les vidéos sans question correspondante dans cette élection ne sont pas montrées ; elles restent dans l’archive de la primaire [précision du 12 octobre\u00a0: cette archive n’est plus en ligne]. Chaque question renvoie à ses vidéos (« En vidéo »).',
    },
    {
      date: '2026-10-09',
      text: 'Ajout des cinq candidats de la primaire «\u00a0Choisir 2027\u00a0» (Olivier Faure, Raphaël Glucksmann, Jérôme Guedj, Emmanuel Maurel, Ségolène Royal), présentés jusqu’à son second tour du 17 octobre\u00a0: seule la personne désignée restera ensuite [précision du 12 octobre\u00a0: il n’y a pas eu de second tour]. Ségolène Royal n’est pas classée, ses positions n’étant connues que sur 38 questions sur 100. Positions de Gabriel Attal et de Jérôme Guedj complétées sur la protection des agriculteurs face aux importations. La page des candidats les présente de l’extrême gauche à l’extrême droite, selon la grille des nuances politiques du ministère de l’Intérieur, à la couleur et avec le logo de chaque parti.',
    },
    {
      date: '2026-10-08',
      text: 'Première version en ligne : 21 candidats déclarés au 6 octobre 2026, dont deux (Éric Zemmour, Xavier Bertrand) qui ont annoncé leur candidature sans l’avoir encore officialisée ; positions relevées et vérifiées automatiquement par une IA contre leurs sources, sans relecture humaine une par une. Sept candidats ne sont pas classés, faute de positions connues sur au moins la moitié des questions (de 7 à 47 sur 100) : leurs fiches et leurs positions restent consultables, et la liste sera revue à mesure que leurs programmes seront publiés. Un candidat connu sur moins de la moitié de vos réponses apparaît sous le classement, avec son score à titre indicatif (voir la méthode).',
    },
  ],
}
