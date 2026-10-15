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
  dataVersion: '2026-10-15.1',
  // Avancée au 15 octobre 2026 (convention de PIPELINE §12 : la date suit les positions relevées à nouveau) : les
  // positions de Bruno Retailleau et de Florian Philippot sur finances_publiques-1, et quatre autres de Bruno Retailleau
  // tirées du même plan, sont relevées le 15 (décisions du propriétaire du 2026-10-15), celles de Natacha Polony et des
  // deux approches ajoutées le 14 ; les autres sont
  // restées arrêtées au 9 octobre, ce que dit la première note (Méthode, juste après la date)
  dataFrozenAt: '2026-10-15',
  finalists: null,
  notes: [
    'Les positions de Bruno Retailleau tirées de son plan d’économies du 12 octobre 2026 (dette, agents publics, services publics, impôts, aides aux entreprises) et celle de Florian Philippot sur la stratégie face à la dette publique ont été relevées le 15 octobre 2026, celles de Natacha Polony, déclarée le 14 octobre 2026, et celles qui portent sur les deux approches ajoutées ce jour-là, le 14 octobre\u00a0; les autres n’ont pas été relevées à nouveau depuis le 9 octobre 2026.',
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
    'Nous sommes la France',
  ],
  // Noms de partis qui sont aussi des mots courants : jamais cherchés, même comme étiquette d'un candidat
  forbiddenTermsAllow: ['Renaissance', 'La Convention', 'Ensemble'],
  // Calculé par tools/audit-pack.mjs (questionnaire rapide, candidats notés) ; affiché sur l'accueil, vérifié par les tests
  audit: { profiles: 3000, minShare: 4, maxShare: 9 },
  quick: { step1: 10 },
  // Hors classement : un candidat connu sur moins de la moitié des questions comptées est montré sous le classement,
  // son score à titre indicatif (décision du propriétaire du 7 octobre 2026 ; l'audit montrait un candidat connu
  // sur 7 questions de la banque premier sur 24 % des profils aléatoires, par simple variance).
  // Non classés : les candidats dont les positions sont connues sur moins de la moitié des questions de la
  // banque (sept au 7 octobre 2026, de 7 à 47 sur 100 ; le moins connu des autres l'est sur 59) n'avaient ni score ni rang,
  // nulle part (décision du propriétaire du 7 octobre 2026 : « ça ne sera pas pertinent »). Assouplie par la décision du propriétaire
  // du 14 octobre 2026 : toujours sans rang ni comparaison, ils ont sous le classement un score indicatif, pour
  // information seulement, calculé sur leurs seules positions connues (core/score.ts, excludedResults). Liste révisable : un candidat y
  // revient quand ses positions sont connues, par exemple à la publication de son programme. Le motif affiché reste
  // factuel et le même pour tous. research/presidentielle-2027/config.json reprend la liste (scoringExcluded).
  ranking: {
    minCoverageShare: 0.5,
    excluded: {
      // Ségolène Royal ajoutée le 9 octobre 2026 avec les candidats de la primaire : connue sur 38 questions sur 100 ;
      // masquée depuis le 12 octobre (hidden), elle est retirée de cette liste au chargement du pack et y revient si on la montre.
      // Natacha Polony ajoutée le 14 octobre 2026, à sa déclaration (décision du propriétaire) : connue sur 28 questions sur 100
      ids: ['asselineau', 'batho', 'becht', 'bertrand', 'bouamrane', 'lalanne', 'markovic', 'polony', 'royal'],
      // Motif factuel, le même pour chacun, sans cause supposée ; le chiffre de chacun est donné à côté
      reason: 'positions connues sur trop peu de questions',
      since: '2026-10-07',
      // Entrés après la décision, à leur déclaration (Méthode et double JSON : « depuis sa déclaration »)
      joined: { polony: '2026-10-14' },
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
  // Page des candidats : la liste ne sera officielle qu'après les parrainages (Conseil constitutionnel, mars 2027)
  pending: [
    'La liste officielle des candidats sera arrêtée par le Conseil constitutionnel en mars 2027, après le dépôt des parrainages. D’ici là, cette page présente les personnes qui ont annoncé leur candidature\u00a0; d’autres peuvent s’y ajouter.',
  ],
  // Ordre de la page des candidats, de l'extrême gauche à l'extrême droite (demande du propriétaire du 8 octobre 2026) :
  // la grille officielle la plus récente des nuances politiques du ministère de l'Intérieur, dans son ordre, puis
  // l'ordre alphabétique au sein d'une même nuance. La présidentielle n'attribue pas de nuances : chaque candidat
  // reçoit celle de son parti dans la grille, ou à défaut celle que le ministère lui a donnée à sa dernière élection
  // (research/presidentielle-2027/parties-spectrum.json, recherche vérifiée le 9 octobre 2026). Quand cette nuance n'existe
  // plus dans la grille ou ne correspond plus au parti, une nuance de sensibilité (DVG, DIV, DVD…), ce que dit la Méthode
  // depuis le 14 octobre 2026 : Natacha Polony, déclarée ce jour-là, reçoit DIV par décision du propriétaire (mouvement
  // absent de la grille, seule candidature relevée en 2002, sous une nuance « Pôle républicain » qui n'y figure plus ;
  // candidates.ts). Couleurs de famille,
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
      date: '2026-10-15',
      // Décisions du propriétaire du 2026-10-15 (n° 3 et 4). En tête du dépouillement d'un visiteur qui revient (Results,
      // latestChange : à date égale, la première écrite) : ce qui change, pour qui ; le détail (avant, après, raison,
      // sources) est dans research/presidentielle-2027/positions-history.json et dans les notes de decisions.json
      text: 'Positions revues sur la question «\u00a0Quelle stratégie pour les finances publiques face à la dette\u00a0?\u00a0»\u00a0: pour Bruno Retailleau, résumés et sources mis à jour d’après son plan d’économies du 12 octobre 2026, ses approches restant les mêmes, comme sur quatre autres questions (nombre d’agents publics, accès aux services publics, niveau des impôts, aides aux entreprises)\u00a0; pour Florian Philippot, son approche principale devient les économies d’abord sur le fonctionnement de l’État, et celle qui vise l’immigration, l’aide internationale et la contribution européenne devient son approche compatible. Positions relevées le 15 octobre et vérifiées automatiquement par une IA contre leurs sources, sans relecture humaine une par une. Les chiffres publiés sur la page «\u00a0Mon profil politique\u00a0» ont été mesurés à nouveau.',
    },
    {
      date: '2026-10-15',
      // Décision du propriétaire du 2026-10-15 (n° 6) : fiches industrie_economie-3, education-2 et territoires-1,
      // alignées sur les faits vérifiés des vidéos corrigées ; sans effet sur le score
      text: 'Trois fiches «\u00a0Comprendre l’enjeu\u00a0» complétées\u00a0: l’État au capital des entreprises (le droit européen laisse chaque pays libre du régime de propriété\u00a0; règles sur les aides d’État), le financement des écoles privées sous contrat (part de l’État à l’école, au collège et au lycée, dans le privé et dans le public) et l’accès aux services publics (nombre de maternités depuis 2000, selon la Cour des comptes). Textes rédigés par IA et vérifiés automatiquement sur leurs sources, sans relecture humaine.',
    },
    {
      date: '2026-10-15',
      // Décisions du propriétaire du 2026-10-15 (n° 1 et 2). Écrite après les deux entrées du même jour : à date égale,
      // c'est la première écrite qui s'affiche en tête du dépouillement d'un visiteur qui revient (Results,
      // latestChange). Elle précise en partie l'entrée du 14 octobre sur le score indicatif. Les données ne changent
      // pas : pas de nouvelle dataVersion
      text: 'Le score indicatif d’un candidat non classé n’est plus montré que si sa position est connue sur au moins 5 de vos réponses, et l’affiche du dépouillement précise désormais «\u00a0parmi les candidats classés\u00a0».',
    },
    {
      date: '2026-10-14',
      // En tête du dépouillement d'un visiteur qui revient (Results, latestChange : à date égale, la première écrite) :
      // l'effet sur le classement d'abord (aucun : elle n'est pas classée), puis les deux questions à revoir (révision 2
      // de finances_publiques-1 et d'europe-3) ; le détail est dans l'entrée suivante, montrée par la seule Méthode
      text: 'Nouvelle candidate, Natacha Polony, déclarée le 14 octobre 2026\u00a0: elle n’est pas classée, ses positions n’étant connues que sur 28 questions sur 100 (23 candidats, dont 15 classés). Deux questions, sur les finances publiques et sur le marché unique européen, gagnent une approche\u00a0: si vous y aviez répondu, votre réponse est à revoir.',
    },
    {
      date: '2026-10-14',
      text: 'Détail de la mise à jour du 14 octobre\u00a0: les deux questions qui gagnent une approche sont «\u00a0Quelle stratégie pour les finances publiques face à la dette\u00a0?\u00a0» (relancer la production en France pour accroître les recettes publiques) et «\u00a0Comment faire évoluer les règles du marché unique européen\u00a0?\u00a0» (priorité, dans la commande publique, aux entreprises qui produisent en France). Sur ces deux questions, positions ajoutées ou revues pour François Asselineau, Bernard Cazeneuve, Nicolas Dupont-Aignan, Raphaël Glucksmann, Marine Le Pen, Jean-Luc Mélenchon et Édouard Philippe. Ces positions et celles de Natacha Polony ont été relevées le 14 octobre et vérifiées automatiquement par une IA contre leurs sources, sans relecture humaine une par une. Les chiffres publiés sur la page «\u00a0Mon profil politique\u00a0» ont été mesurés à nouveau.',
    },
    {
      date: '2026-10-14',
      // Décision du propriétaire du 14 octobre 2026. Écrite après les deux entrées du même jour : à date égale, c'est la
      // première écrite qui s'affiche en tête du dépouillement d'un visiteur qui revient (Results, latestChange). Les
      // données ne changent pas : pas de nouvelle dataVersion
      text: 'Les candidats non classés ont désormais, sous le classement, un score indicatif, calculé sur leurs seules positions connues et donné pour information seulement\u00a0: ils restent sans rang.',
    },
    {
      date: '2026-10-12',
      // Affichée aussi en tête du dépouillement d'un visiteur qui revient (Results, « mises à jour depuis votre dernier
      // passage ») : l'effet sur le classement d'abord, sans score ni nom des candidats masqués (le score est sur la fiche)
      text: 'Les quatre candidats de la primaire «\u00a0Choisir 2027\u00a0» qui n’ont pas été désignés ne sont plus présentés\u00a0: 22 candidats, dont 15 classés. Raphaël Glucksmann y a été désigné dès le premier tour, le 11 octobre 2026. Les pages et les vidéos propres à la primaire ne sont plus en ligne.',
    },
    {
      date: '2026-10-12',
      // Nouvelle page, sans effet sur le score (METHOD_VERSION reste 2.0) ; chiffres publiés : core/echiquierMethodCopy.ts.
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
