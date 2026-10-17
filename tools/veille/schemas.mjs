// Schémas de la veille automatique d'Isoloir (tâches planifiées « isoloir-veille-candidats » et
// « isoloir-veille-positions », décision du propriétaire du 2026-10-17) : la forme de chaque fichier d'état, de chaque
// valeur de retour de workflow et de chaque rapport qu'échangent les scripts tools/veille/*.mjs, plus un validateur
// minimal sans dépendance. Référence unique : tools/veille/CONTRACT.md (§c). Aucun appel au réseau ni à une IA.
//
// Usage (depuis un script ou un test) :
//   import { SCHEMAS, validate, checkChange, DEFAULT_POLICY } from './schemas.mjs'
//   const errors = validate(SCHEMAS.REFRESH_RESULT, value)   // [] si la valeur est conforme
//   const more = checkChange(change)                          // règles croisées d'un changement (set, remove…)
//
// Le validateur couvre un sous-ensemble de JSON Schema, celui qu'emploient ces schémas : type (chaîne ou liste,
// « integer » compris), enum, const, anyOf, properties, required, additionalProperties (false ou schéma),
// propertyNames (pattern), minProperties, items, minItems, maxItems, uniqueItems, minimum, maximum, minLength,
// maxLength, pattern, format (date AAAA-MM-JJ, date-time ISO 8601 avec fuseau, uri http(s), https), et une extension
// maxWords (nombre de mots au plus, pour une citation courte). Les autres mots-clés (description…) sont ignorés.
// Chaque erreur est une chaîne « <chemin> : <message> », le chemin à la JSONPath ($.events[0].kind).
//
// Les schémas des agents (StructuredOutput) restent dans chaque workflow (un workflow ne peut rien importer) ; seules
// les VALEURS DE RETOUR des workflows 8 et 9 sont décrites ici (WATCH_RESULT, REFRESH_RESULT), et leurs tests les
// valident avec validate().

// ——— Briques ———

const DATE = { type: 'string', format: 'date' }
const DATE_OR_NULL = { type: ['string', 'null'], format: 'date' }
const DATETIME = { type: 'string', format: 'date-time' }
const DATETIME_OR_NULL = { type: ['string', 'null'], format: 'date-time' }
const URL = { type: 'string', format: 'uri' }
const URL_OR_NULL = { type: ['string', 'null'], format: 'uri' }
const TEXT = { type: 'string', minLength: 1 }
const STRINGS = { type: 'array', items: { type: 'string' } }
const INT0 = { type: 'integer', minimum: 0 }
const INT0_OR_NULL = { type: ['integer', 'null'], minimum: 0 }
const SHA = { type: 'string', pattern: '^[0-9a-f]{7,40}$' }

/** Identifiant de candidat (config.json : « dupontaignan », « lepen ») */
export const CANDIDATE_ID = '^[a-z][a-z0-9]*$'
/** Identifiant de question (« finances_publiques-1 », « fiscalite-x1 ») */
export const QUESTION_ID = '^[a-z][a-z_]*-x?[0-9]+$'
/** Identifiant d'approche publiée : la question, puis une lettre de a à p (tests/transfer.test.ts) */
export const APPROACH_ID = '^[a-z][a-z_]*-x?[0-9]+-[a-p]$'
/** Approche proposée, pas encore lettrée : « <question>-NEW<k> » ; apply.mjs lui donne la lettre libre suivante */
export const APPROACH_PLACEHOLDER = '^[a-z][a-z_]*-x?[0-9]+-NEW[0-9]+$'
/** Date d'une source nouvelle : AAAA-MM-JJ, AAAA-MM, ou l'une d'elles suivie de « (consultation) » (src/ui/format.ts) */
export const SOURCE_DATE = '^[0-9]{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?( \\(consultation\\))?$'
/** Identifiant d'une exécution de la veille : le nom de son worktree sans « veille- » (« 2026-10-19-hebdo ») */
export const RUN_ID = '^(accord-[a-z0-9-]+|[0-9]{4}-[0-9]{2}-[0-9]{2}-(quotidien|hebdo|candidat|retrait)(-[a-z0-9]+)*)$'
/** Identifiant d'un élément retenu : « H-AAAA-MM-JJ-<n> » */
export const HOLD_ID = '^H-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]+$'
/** Identifiant d'une attente du propriétaire : C- (candidat), R- (retrait), H- (retenu), Q- (question), D- (redéclaration),
 *  I- (réintégration d'un non-classé), O- (événement officiel), F- (fiche) */
export const PENDING_ID = '^(C|R|D|I|O|F)-[a-z0-9-]+$|^H-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]+$|^Q-[a-z0-9_-]+$'

const NATURES = ['proposition', 'declaration', 'inference']
const CONFIDENCES = ['high', 'medium', 'low']
const CAUSES = ['prise-de-position', 'relecture', 'nouvelle-approche']
const VERDICTS = ['confirmed', 'adjusted', 'refuted', 'unverifiable']
const RUN_KINDS = ['quotidien', 'hebdo', 'candidat', 'retrait', 'accord']

/** Source telle que publiée (positions.ts, bank.json) : date en texte libre */
const SOURCE_PUBLISHED = {
  type: 'object',
  required: ['title', 'url'],
  properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' }, publisher: { type: 'string' } },
  additionalProperties: false,
}
/** Source d'une position nouvelle : titre, adresse http(s), date normalisée et éditeur obligatoires */
const SOURCE_NEW = {
  type: 'object',
  required: ['title', 'url', 'date', 'publisher'],
  properties: {
    title: { type: 'string', minLength: 3 },
    url: URL,
    date: { type: 'string', pattern: SOURCE_DATE },
    publisher: TEXT,
  },
  additionalProperties: false,
}
/** Source d'un événement de la veille des candidats : primary = canal propre de la personne, du parti ou d'une institution */
const WATCH_SOURCE = {
  type: 'object',
  required: ['url', 'title', 'publisher', 'date', 'primary'],
  properties: { url: URL, title: TEXT, publisher: TEXT, date: DATE_OR_NULL, primary: { type: 'boolean' } },
  additionalProperties: false,
}

// Une position porte une approche (weight 1|2) ou la rejette explicitement (rejects: true, sans poids)
const WEIGHT_OR_REJECT = [
  { type: 'object', required: ['weight'] },
  { type: 'object', required: ['rejects'], properties: { rejects: { const: true } } },
]
/** Position publiée (Position de src/core/types.ts), telle que lire-banque la donne : le « before » d'un changement */
export const POSITION_PUBLISHED = {
  type: 'object',
  required: ['nature', 'confidence', 'summary', 'sources'],
  properties: {
    weight: { type: 'integer', enum: [1, 2] },
    rejects: { type: 'boolean' },
    nature: { enum: NATURES },
    confidence: { enum: CONFIDENCES },
    summary: { type: 'string' },
    sources: { type: 'array', items: SOURCE_PUBLISHED },
  },
  additionalProperties: false,
  anyOf: WEIGHT_OR_REJECT,
}
/** Position proposée par la veille : le « after » d'un changement (1 à 3 sources nouvelles, résumé d'une phrase) */
export const POSITION_NEW = {
  type: 'object',
  required: ['nature', 'confidence', 'summary', 'sources'],
  properties: {
    weight: { type: 'integer', enum: [1, 2] },
    rejects: { type: 'boolean' },
    nature: { enum: NATURES },
    confidence: { enum: CONFIDENCES },
    summary: { type: 'string', minLength: 20, maxLength: 400 },
    sources: { type: 'array', minItems: 1, maxItems: 3, items: SOURCE_NEW },
  },
  additionalProperties: false,
  anyOf: WEIGHT_OR_REJECT,
}

// ——— État versionné : research/presidentielle-2027/veille/ ———

const deepFreeze = o => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') deepFreeze(v)
  return Object.freeze(o)
}

/** Valeurs par défaut de policy.json (B6 en écrit la graine ; une clé absente du fichier prend cette valeur) */
export const DEFAULT_POLICY = deepFreeze({
  format: 'isoloir-veille-policy/1',
  electionId: 'presidentielle-2027',
  paused: false,
  pausedReason: null,
  softFreezeHours: 48,
  hebdoHorizonHours: 8,
  endAt: '2027-05-02T20:00:00+02:00',
  freezeFrom: 'election.freezeWindows',
  extraFreezeWindows: [],
  reportOnlyBetweenRounds: true,
  budgets: {
    dailyTokens: 800000,
    dailyWithPrepTokens: 3000000,
    weeklyTokens: 12000000,
    monthlyTokens: 45000000,
    monthlySoftShare: 0.8,
    usageStopPercent: 85,
  },
  caps: {
    changesPerRun: 15,
    changesPerCandidate: 5,
    newApproachesPerRun: 2,
    approachCooldownDays: 30,
    newQuestionsPerRun: 1,
    bankMax: 110,
    prepsPerDay: 1,
    prepsPerWeek: 2,
    programmePassesPerWeek: 2,
    verifyPacket: 60,
    // Vérificateurs adverses de la veille des candidats, au plus, par lancement (workflow 8, maxChecks)
    watchChecks: 8,
  },
  // watchMaxLookbackDays : borne de la fenêtre de la veille des candidats rattrapée après des jours sans exécution
  rotation: { unknownDeepPerCandidate: 10, overlapDays: 3, watchLookbackDays: 3, watchMaxLookbackDays: 21 },
  holdReversals: false,
  mepCountsAsNational: true,
  newQuestion: {
    minCandidates: 2,
    minCandidateBlocs: 2,
    minKnown: 10,
    minBlocs: 3,
    maxMainShare: 0.6,
    approachesMin: 4,
    approachesMax: 9,
    tier: 'approfondi',
  },
  lock: { staleHeartbeatHours: 4, maxAgeHours: 24 },
  retries: { moved: 2, data: 3 },
  minSearches: { watch: 10, triage: 8 },
  holdExpiryDays: 14,
  reminderHours: 48,
  cleanupDays: 14,
  remeasure: { profiles: 1000, noisy: 60 },
  ship: {
    port: 4371,
    accordPort: 4372,
    prodUrl: 'https://isoloir.vercel.app/',
    vercelProject: 'isoloir',
    vercelScope: 'lbtbly',
    checkAttempts: 3,
    checkDelaySeconds: 20,
  },
})

export const POLICY = {
  type: 'object',
  required: ['format', 'electionId', 'paused', 'softFreezeHours', 'endAt', 'freezeFrom', 'budgets', 'caps', 'rotation',
    'holdReversals', 'mepCountsAsNational', 'newQuestion'],
  properties: {
    format: { const: 'isoloir-veille-policy/1' },
    electionId: { const: 'presidentielle-2027' },
    paused: { type: 'boolean' },
    pausedReason: { type: ['string', 'null'] },
    softFreezeHours: { type: 'number', minimum: 0 },
    hebdoHorizonHours: { type: 'number', minimum: 0 },
    endAt: DATETIME,
    freezeFrom: { const: 'election.freezeWindows' },
    extraFreezeWindows: {
      type: 'array',
      items: { type: 'object', required: ['start', 'end'], properties: { start: DATETIME, end: DATETIME, reason: { type: 'string' } } },
    },
    reportOnlyBetweenRounds: { type: 'boolean' },
    budgets: {
      type: 'object',
      required: ['dailyTokens', 'dailyWithPrepTokens', 'weeklyTokens', 'monthlyTokens', 'monthlySoftShare'],
      properties: {
        dailyTokens: INT0, dailyWithPrepTokens: INT0, weeklyTokens: INT0, monthlyTokens: INT0,
        monthlySoftShare: { type: 'number', minimum: 0, maximum: 1 },
        usageStopPercent: { type: 'number', minimum: 0, maximum: 100 },
      },
    },
    caps: {
      type: 'object',
      required: ['changesPerRun', 'changesPerCandidate', 'newApproachesPerRun', 'approachCooldownDays', 'newQuestionsPerRun',
        'bankMax', 'prepsPerDay', 'prepsPerWeek', 'programmePassesPerWeek', 'verifyPacket'],
      additionalProperties: INT0,
    },
    rotation: {
      type: 'object',
      required: ['unknownDeepPerCandidate'],
      properties: { unknownDeepPerCandidate: INT0, overlapDays: INT0, watchLookbackDays: INT0, watchMaxLookbackDays: INT0 },
    },
    holdReversals: { type: 'boolean' },
    mepCountsAsNational: { type: 'boolean' },
    newQuestion: {
      type: 'object',
      required: ['minKnown', 'minBlocs', 'maxMainShare', 'approachesMin', 'approachesMax'],
      properties: {
        minCandidates: INT0, minCandidateBlocs: INT0, minKnown: INT0, minBlocs: INT0,
        maxMainShare: { type: 'number', minimum: 0, maximum: 1 },
        approachesMin: INT0, approachesMax: { type: 'integer', minimum: 1, maximum: 9 },
        tier: { const: 'approfondi' },
      },
    },
  },
}

/** Une personne « à surveiller » (veille des candidats), ou refusée par le propriétaire */
const WATCH_ENTRY = {
  type: 'object',
  required: ['key', 'name', 'reason', 'firstSeen', 'lastSeen'],
  properties: {
    key: { type: 'string', pattern: CANDIDATE_ID },
    name: TEXT,
    party: { type: ['string', 'null'] },
    reason: { enum: ['condition', 'seuil', 'sources', 'non-confirmé', 'déjà-en-attente', 'plafond-préparations', 'déclaration-contestée', 'retrait-incertain', 'autre'] },
    detail: { type: 'string' },
    firstSeen: DATE,
    lastSeen: DATE,
    sources: { type: 'array', items: WATCH_SOURCE },
  },
}

export const STATE = {
  type: 'object',
  required: ['format', 'electionId', 'candidates', 'watch', 'refused', 'lastRuns'],
  properties: {
    format: { const: 'isoloir-veille-state/1' },
    electionId: { const: 'presidentielle-2027' },
    // Un candidat présenté par entrée (jamais les masqués) ; checkedAt n'avance que dans le commit publié
    candidates: {
      type: 'object',
      propertyNames: { pattern: CANDIDATE_ID },
      additionalProperties: {
        type: 'object',
        required: ['checkedAt', 'rotationCursor'],
        properties: {
          checkedAt: DATE,
          rotationCursor: INT0,
          lastRunId: { type: ['string', 'null'] },
          programmeSeen: { type: ['string', 'null'] },
        },
        additionalProperties: false,
      },
    },
    watch: { type: 'array', items: WATCH_ENTRY },
    refused: {
      type: 'array',
      items: { type: 'object', required: ['key', 'name', 'decidedAt'], properties: { key: { type: 'string' }, name: TEXT, decidedAt: DATE, note: { type: 'string' } } },
    },
    // Événements officiels attendus (liste du Conseil constitutionnel, éligibilité, résultats) : rapport seulement
    expected: {
      type: 'array',
      items: { type: 'object', required: ['id', 'label', 'status'], properties: { id: TEXT, label: TEXT, from: DATE_OR_NULL, status: { enum: ['attendu', 'publié'] }, url: URL_OR_NULL } },
    },
    // Dernières exécutions PUBLIÉES (hebdo, accord) ; les exécutions quotidiennes ne laissent rien ici (état local)
    lastRuns: {
      type: 'object',
      additionalProperties: { type: 'object', required: ['runId', 'at'], properties: { runId: { type: 'string', pattern: RUN_ID }, at: DATE, dataVersion: { type: ['string', 'null'] } } },
    },
  },
}

export const LOCKS = {
  type: 'object',
  required: ['format', 'locks'],
  properties: {
    format: { const: 'isoloir-veille-locks/1' },
    locks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['candidateId', 'reason', 'since'],
        properties: {
          candidateId: { type: 'string', pattern: CANDIDATE_ID },
          // L'un des deux : une question entière (« * » : toutes ses questions) ou une seule approche
          questionId: { type: 'string', pattern: `${QUESTION_ID}|^\\*$` },
          approachId: { type: 'string', pattern: APPROACH_ID },
          reason: { enum: ['droit-de-réponse', 'correction', 'propriétaire'] },
          since: DATE,
          until: DATE_OR_NULL,
          note: { type: 'string' },
        },
        anyOf: [{ type: 'object', required: ['questionId'] }, { type: 'object', required: ['approachId'] }],
      },
    },
  },
}

const LEDGER_STATUSES = ['published', 'held', 'dropped']
export const LEDGER = {
  type: 'object',
  required: ['format', 'claims', 'approaches', 'questions'],
  properties: {
    format: { const: 'isoloir-veille-ledger/1' },
    // Clés triées à l'écriture ; une clé = claimKey (CONTRACT §c, « claimKey »)
    claims: {
      type: 'object',
      propertyNames: { pattern: '^[0-9a-f]{40}$' },
      additionalProperties: {
        type: 'object',
        required: ['candidateId', 'kind', 'status', 'runId', 'firstSeen', 'lastSeen'],
        properties: {
          candidateId: { type: 'string', pattern: CANDIDATE_ID },
          questionId: { type: ['string', 'null'] },
          approachId: { type: ['string', 'null'] },
          kind: { enum: ['set', 'remove', 'addApproach'] },
          cause: { enum: CAUSES },
          statedAt: DATE_OR_NULL,
          status: { enum: LEDGER_STATUSES },
          reason: { type: ['string', 'null'] },
          holdId: { type: ['string', 'null'], pattern: HOLD_ID },
          runId: { type: 'string', pattern: RUN_ID },
          firstSeen: DATE,
          lastSeen: DATE,
          publishedIn: { type: ['string', 'null'] },
          sourceKeys: STRINGS,
        },
        additionalProperties: false,
      },
    },
    approaches: {
      type: 'array',
      items: { type: 'object', required: ['questionId', 'approachId', 'addedAt', 'runId'], properties: { questionId: { type: 'string', pattern: QUESTION_ID }, approachId: { type: 'string', pattern: APPROACH_ID }, addedAt: DATE, runId: TEXT } },
    },
    questions: {
      type: 'array',
      items: { type: 'object', required: ['questionId', 'addedAt', 'runId', 'transferSlot'], properties: { questionId: { type: 'string', pattern: QUESTION_ID }, addedAt: DATE, runId: TEXT, transferSlot: INT0 } },
    },
  },
}

// ——— Valeur de retour du workflow 8 (tools/workflows/8-candidate-watch.js) ———

const OFFICES = ['président-de-la-république', 'premier-ministre', 'gouvernement', 'député', 'sénateur', 'député-européen']
const NATIONAL_ELECTED = {
  type: ['object', 'null'],
  required: ['deputies', 'senators', 'meps', 'url'],
  properties: { deputies: INT0_OR_NULL, senators: INT0_OR_NULL, meps: INT0_OR_NULL, url: URL_OR_NULL, asOf: DATE_OR_NULL },
  additionalProperties: false,
}
const OFFICE = {
  type: 'object',
  required: ['office', 'url'],
  properties: { office: { enum: OFFICES }, from: DATE_OR_NULL, to: DATE_OR_NULL, url: URL_OR_NULL, detail: { type: 'string' } },
  additionalProperties: false,
}
const NATIONAL_OFFICE = {
  type: ['object', 'null'],
  required: ['current', 'former'],
  properties: { current: { type: 'array', items: OFFICE }, former: { type: 'array', items: OFFICE } },
  additionalProperties: false,
}
export const WATCH_EVENT = {
  type: 'object',
  required: ['ref', 'kind', 'person', 'party', 'date', 'summary', 'unconditional', 'condition', 'partyNationalElected',
    'nationalOffice', 'official', 'sources', 'checker'],
  properties: {
    ref: { type: 'string', pattern: '^e[0-9]+$' },
    kind: { enum: ['declaration', 'withdrawal', 'condition', 'official', 'redeclaration'] },
    // knownId : l'identifiant de config.json si la personne y figure (présentée ou masquée), sinon null
    person: {
      type: 'object',
      required: ['name', 'knownId'],
      properties: { name: TEXT, knownId: { type: ['string', 'null'], pattern: CANDIDATE_ID } },
      additionalProperties: false,
    },
    party: { type: ['string', 'null'] },
    date: DATE_OR_NULL,
    summary: TEXT,
    unconditional: { type: ['boolean', 'null'] },
    condition: { type: ['string', 'null'] },
    conditionChange: { enum: ['levée', 'ajoutée', null] },
    partyNationalElected: NATIONAL_ELECTED,
    nationalOffice: NATIONAL_OFFICE,
    official: {
      type: ['object', 'null'],
      required: ['type', 'detail'],
      properties: { type: { enum: ['liste-officielle', 'eligibilite', 'parrainages', 'resultats', 'autre'] }, detail: TEXT },
      additionalProperties: false,
    },
    sources: { type: 'array', minItems: 1, items: WATCH_SOURCE },
    // Vérificateur adverse, un par événement ; null s'il est absent ou mort (l'événement ne peut alors pas qualifier)
    checker: {
      type: ['object', 'null'],
      required: ['verdict', 'reasons'],
      properties: {
        verdict: { enum: ['confirmed', 'refuted', 'uncertain'] },
        reasons: { type: 'array', items: TEXT },
        unconditional: { type: ['boolean', 'null'] },
        partyNationalElected: NATIONAL_ELECTED,
        nationalOffice: NATIONAL_OFFICE,
        sources: { type: 'array', items: WATCH_SOURCE },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
}
export const WATCH_RESULT = {
  type: 'object',
  required: ['format', 'electionId', 'today', 'since', 'searches', 'events', 'stillDeclared', 'log'],
  properties: {
    format: { const: 'isoloir-veille-watch/1' },
    electionId: { const: 'presidentielle-2027' },
    today: DATE,
    since: DATE,
    searches: INT0,
    events: { type: 'array', items: WATCH_EVENT },
    // Une entrée par candidat présenté (args.visible), dans leur ordre
    stillDeclared: {
      type: 'array',
      items: {
        type: 'object',
        required: ['candidateId', 'declared'],
        properties: { candidateId: { type: 'string', pattern: CANDIDATE_ID }, declared: { type: ['boolean', 'null'] }, url: URL_OR_NULL, note: { type: 'string' } },
        additionalProperties: false,
      },
    },
    // Événements attendus (args.expected) vérifiés : publié ou non
    expectedChecked: {
      type: 'array',
      items: { type: 'object', required: ['id', 'status'], properties: { id: TEXT, status: { enum: ['attendu', 'publié'] }, url: URL_OR_NULL } },
    },
    log: STRINGS,
  },
}

// ——— Valeur de retour du workflow 9 (tools/workflows/9-refresh-positions.js) ———

const SUBJECT = {
  type: 'object',
  required: ['topicId', 'subject', 'proposal'],
  properties: { topicId: { type: 'string', pattern: '^[a-z][a-z_]*$' }, subject: TEXT, proposal: TEXT },
  additionalProperties: false,
}
export const CHANGE = {
  type: 'object',
  required: ['kind', 'candidateId', 'questionId', 'approachId', 'proposedApproachText', 'before', 'after', 'cause', 'statedAt',
    'evidence', 'verifier', 'blindRecode', 'rationale'],
  properties: {
    kind: { enum: ['set', 'remove', 'addApproach', 'newQuestionSubject'] },
    candidateId: { type: 'string', pattern: CANDIDATE_ID },
    questionId: { type: ['string', 'null'], pattern: QUESTION_ID },
    // Approche existante, ou « <question>-NEW<k> » pour une approche proposée (addApproach et positions posées dessus)
    approachId: { type: ['string', 'null'], pattern: `${APPROACH_ID}|${APPROACH_PLACEHOLDER}` },
    proposedApproachText: { type: ['string', 'null'], minLength: 10, maxLength: 180 },
    // Copiée telle quelle de lire-banque (la position publiée), null si le candidat n'avait rien sur cette approche
    before: { anyOf: [{ type: 'null' }, POSITION_PUBLISHED] },
    after: { anyOf: [{ type: 'null' }, POSITION_NEW] },
    cause: { enum: CAUSES },
    statedAt: DATE_OR_NULL,
    evidence: {
      type: 'object',
      required: ['primarySource', 'independentOutlets', 'shortQuote'],
      properties: { primarySource: { type: 'boolean' }, independentOutlets: INT0, shortQuote: { type: 'string', maxWords: 14 } },
      additionalProperties: false,
    },
    verifier: {
      type: 'object',
      required: ['verdict', 'notes'],
      properties: { verdict: { enum: VERDICTS }, notes: { type: 'string' } },
      additionalProperties: false,
    },
    blindRecode: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          required: ['approachId', 'weight', 'rejects', 'agrees'],
          properties: {
            approachId: { type: ['string', 'null'] },
            weight: { type: 'integer', enum: [0, 1, 2] },
            rejects: { type: 'boolean' },
            agrees: { type: 'boolean' },
          },
          additionalProperties: false,
        },
      ],
    },
    rationale: TEXT,
    subject: { anyOf: [{ type: 'null' }, SUBJECT] },
    programmeDetected: { type: 'boolean' },
  },
  additionalProperties: false,
}
const PROGRAMME = {
  type: 'object',
  required: ['title', 'url', 'date'],
  properties: { title: TEXT, url: URL, date: DATE },
  additionalProperties: false,
}
export const REFRESH_RESULT = {
  type: 'object',
  required: ['format', 'electionId', 'mode', 'today', 'candidates', 'newQuestionSubjects', 'programmes', 'log'],
  properties: {
    format: { const: 'isoloir-veille-refresh/1' },
    electionId: { const: 'presidentielle-2027' },
    mode: { enum: ['candidates', 'programme', 'questions'] },
    today: DATE,
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['candidateId', 'since', 'triageCompleted', 'searches', 'findings', 'changes'],
        properties: {
          candidateId: { type: 'string', pattern: CANDIDATE_ID },
          since: DATE,
          // true seulement si la recherche de l'agent de tri est allée au bout (au moins policy.minSearches.triage
          // recherches, canaux propres d'abord) : checkedAt n'avance que pour ceux-là
          triageCompleted: { type: 'boolean' },
          searches: INT0,
          findings: INT0,
          rotation: { type: 'array', items: { type: 'string', pattern: QUESTION_ID } },
          programmeDetected: { anyOf: [{ type: 'null' }, PROGRAMME] },
          changes: { type: 'array', items: CHANGE },
          log: STRINGS,
        },
      },
    },
    newQuestionSubjects: {
      type: 'array',
      items: {
        type: 'object',
        required: ['topicId', 'subject', 'proposal', 'candidates', 'rationale'],
        properties: {
          topicId: { type: 'string', pattern: '^[a-z][a-z_]*$' },
          subject: TEXT,
          proposal: TEXT,
          candidates: {
            type: 'array',
            items: {
              type: 'object',
              required: ['candidateId', 'summary', 'sources'],
              properties: { candidateId: { type: 'string', pattern: CANDIDATE_ID }, summary: TEXT, sources: { type: 'array', minItems: 1, items: SOURCE_NEW }, confidence: { enum: CONFIDENCES } },
              additionalProperties: false,
            },
          },
          rationale: TEXT,
        },
        additionalProperties: false,
      },
    },
    programmes: {
      type: 'array',
      items: { type: 'object', required: ['candidateId', 'title', 'url', 'date'], properties: { candidateId: { type: 'string', pattern: CANDIDATE_ID }, title: TEXT, url: URL, date: DATE } },
    },
    // Décisions du workflow sur les approches proposées (relecture, anonymat, termes interdits, plafond), pour le rapport
    proposedApproaches: {
      type: 'array',
      items: {
        type: 'object',
        required: ['questionId', 'placeholder', 'text', 'kept'],
        properties: {
          questionId: { type: 'string', pattern: QUESTION_ID },
          placeholder: { type: 'string', pattern: APPROACH_PLACEHOLDER },
          text: TEXT,
          kept: { type: 'boolean' },
          reason: { type: 'string' },
          review: { type: 'object' },
          forbiddenHits: STRINGS,
        },
      },
    },
    log: STRINGS,
  },
}

// ——— Ce que consomme apply.mjs, et ce qu'il rend ———

export const CHANGESET = {
  type: 'object',
  required: ['format', 'runId', 'electionId', 'baseCommit', 'today', 'since', 'results'],
  properties: {
    format: { const: 'isoloir-veille-changeset/1' },
    runId: { type: 'string', pattern: RUN_ID },
    electionId: { const: 'presidentielle-2027' },
    // origin/main au départ de l'exécution (run.mjs start) : le « before » des changements est lu à ce commit
    baseCommit: SHA,
    today: DATE,
    since: { type: 'object', propertyNames: { pattern: CANDIDATE_ID }, additionalProperties: DATE },
    // Les valeurs de retour du workflow 9, dans l'ordre où persist.mjs les a reçues
    results: { type: 'array', items: REFRESH_RESULT },
    // Retenus par l'orchestrateur après un échec de données (code 30) : paquets « candidat:<id> », « approche:<question> »,
    // « question:<id> », « cle:<claimKey> »
    holds: { type: 'array', items: { type: 'string', pattern: '^(candidat|approche|question|cle):[a-z0-9_-]+$' } },
    // Retenus approuvés par le propriétaire (« OK H-… »), et, s'il est donné, le seul sous-ensemble à appliquer
    approve: { type: 'array', items: { type: 'string', pattern: HOLD_ID } },
    only: { type: 'array', items: { type: 'string', pattern: HOLD_ID } },
  },
}

export const CHANGE_CLASSES = ['forme', 'secondaire', 'principale', 'renversement', 'nouvelle-approche']
export const HOLD_REASONS = ['source-invérifiable', 'preuve-insuffisante', 'recodage-absent', 'recodage-en-désaccord', 'avant-mal-lu',
  'verrou', 'entrée-du-propriétaire', 'renversement', 'plafond-run', 'plafond-candidat', 'plafond-approches', 'approche-délai',
  'approches-max', 'lettre-épuisée', 'réintégration', 'état-final-invalide', 'retenu-par-le-run', 'paquet-lié']
export const DROP_REASONS = ['invalide', 'réfutée', 'confiance-basse', 'inférence-de-fond', 'étiquette', 'source-invalide',
  'source-invérifiable', 'résumé-sans-source-neuve', 'sans-effet', 'déjà-publiée', 'hors-cible', 'date-future', 'terme-interdit',
  'nom-masqué', 'paquet-lié']
const REPORTED_CHANGE = {
  type: 'object',
  required: ['claimKey', 'candidateId', 'questionId', 'approachId', 'kind', 'class', 'cause', 'statedAt', 'before', 'after'],
  properties: {
    claimKey: { type: 'string', pattern: '^[0-9a-f]{40}$' },
    candidateId: { type: 'string', pattern: CANDIDATE_ID },
    questionId: { type: ['string', 'null'] },
    approachId: { type: ['string', 'null'] },
    kind: { enum: ['set', 'remove', 'addApproach'] },
    class: { enum: CHANGE_CLASSES },
    cause: { enum: CAUSES },
    statedAt: DATE_OR_NULL,
    before: { type: ['object', 'null'] },
    after: { type: ['object', 'null'] },
    text: { type: 'string' },
  },
}
export const APPLY_REPORT = {
  type: 'object',
  required: ['format', 'runId', 'today', 'dryRun', 'published', 'held', 'dropped', 'approaches', 'checked', 'newQuestion', 'bundles', 'files'],
  properties: {
    format: { const: 'isoloir-veille-apply/1' },
    runId: { type: 'string', pattern: RUN_ID },
    today: DATE,
    dryRun: { type: 'boolean' },
    published: { type: 'array', items: REPORTED_CHANGE },
    held: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'reason', 'change'],
        properties: { id: { type: 'string', pattern: HOLD_ID }, reason: { enum: HOLD_REASONS }, detail: { type: 'string' }, claimKey: { type: 'string' }, change: { type: 'object' } },
      },
    },
    dropped: {
      type: 'array',
      items: {
        type: 'object',
        required: ['reason', 'change'],
        properties: { reason: { enum: DROP_REASONS }, detail: { type: 'string' }, claimKey: { type: ['string', 'null'] }, change: { type: 'object' } },
      },
    },
    // Approches ajoutées : la lettre donnée à chaque approche proposée
    approaches: {
      type: 'array',
      items: { type: 'object', required: ['questionId', 'placeholder', 'approachId', 'text'], properties: { questionId: TEXT, placeholder: TEXT, approachId: { type: 'string', pattern: APPROACH_ID }, text: TEXT } },
    },
    // Candidats dont la recherche est allée au bout : checkedAt avancé à today dans state.json
    checked: { type: 'array', items: { type: 'string', pattern: CANDIDATE_ID } },
    // Sujet retenu pour une nouvelle question (au plus caps.newQuestionsPerRun), ou null ; et ceux qui n'ont pas suffi
    newQuestion: {
      type: ['object', 'null'],
      required: ['topicId', 'subject', 'proposal', 'candidates', 'blocs'],
      properties: { topicId: TEXT, subject: TEXT, proposal: TEXT, candidates: STRINGS, blocs: STRINGS },
    },
    newQuestionRejected: { type: 'array', items: { type: 'object', required: ['subject', 'reason'], properties: { subject: TEXT, reason: TEXT } } },
    // Paquets de cette application (pour retenir un paquet après un code 30) : « candidat:<id> » → clés, etc.
    bundles: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
    counts: { type: 'object', additionalProperties: INT0 },
    // Fichiers écrits, relatifs à la racine du worktree ([] en --dry-run)
    files: STRINGS,
  },
}

// ——— État local : <racine principale>/.claude/veille/ ———

export const PENDING_ITEM = {
  type: 'object',
  required: ['id', 'kind', 'branch', 'createdAt', 'runId', 'summary', 'approveWith', 'status'],
  properties: {
    id: { type: 'string', pattern: PENDING_ID },
    kind: { enum: ['candidat', 'retrait', 'hold', 'redeclaration', 'reintegration', 'official', 'fiche', 'question'] },
    branch: { type: ['string', 'null'] },
    worktree: { type: ['string', 'null'] },
    createdAt: DATETIME,
    runId: { type: 'string', pattern: RUN_ID },
    baseCommit: { type: ['string', 'null'] },
    summary: TEXT,
    approveWith: { type: 'string', pattern: '^OK [A-Za-z0-9_-]+$' },
    status: { enum: ['attente', 'accordé', 'refusé', 'caduc'] },
    remindedAt: { type: 'array', items: DATETIME },
    decidedAt: DATETIME_OR_NULL,
    details: { type: 'object' },
  },
}
export const PENDING_FILE = {
  type: 'object',
  required: ['format', 'items'],
  properties: { format: { const: 'isoloir-veille-pending/1' }, items: { type: 'array', items: PENDING_ITEM } },
}

export const LOCK = {
  type: 'object',
  required: ['runId', 'kind', 'worktrees', 'startedAt', 'heartbeatAt', 'phase'],
  properties: {
    runId: { type: 'string', pattern: RUN_ID },
    kind: { enum: RUN_KINDS },
    // Le worktree de l'exécution, puis ceux lancés sous le même verrou : préparations (candidat, retrait : leur propre
    // runId) et worktrees de rederive (le runId de l'exécution qu'ils rejouent)
    worktrees: {
      type: 'array',
      minItems: 1,
      items: { type: 'object', required: ['path', 'runId'], properties: { path: TEXT, runId: { type: 'string', pattern: RUN_ID } }, additionalProperties: false },
    },
    startedAt: DATETIME,
    heartbeatAt: DATETIME,
    phase: { type: 'string' },
    pid: { type: 'integer' },
    takenOverFrom: { type: ['string', 'null'] },
  },
}

export const RUN = {
  type: 'object',
  required: ['format', 'runId', 'kind', 'worktree', 'branch', 'baseCommit', 'startedAt', 'today', 'status'],
  properties: {
    format: { const: 'isoloir-veille-run/1' },
    runId: { type: 'string', pattern: RUN_ID },
    kind: { enum: RUN_KINDS },
    parent: { type: ['string', 'null'] },
    essai: { type: 'boolean' },
    mode: { enum: ['publication', 'rapport'] },
    worktree: TEXT,
    branch: { type: ['string', 'null'] },
    baseCommit: SHA,
    startedAt: DATETIME,
    finishedAt: DATETIME_OR_NULL,
    today: DATE,
    status: { enum: ['en-cours', 'ok', 'rien', 'partiel', 'gel', 'budget', 'échec', 'attente', 'interrompu'] },
    note: { type: 'string' },
    workflows: { type: 'array', items: { type: 'object', required: ['wfRunId', 'kind'], properties: { wfRunId: TEXT, kind: TEXT, tokens: INT0_OR_NULL, persistedAt: DATETIME } } },
  },
}

export const SPEND_LINE = {
  type: 'object',
  required: ['at', 'runId', 'kind', 'stage', 'tokens'],
  properties: { at: DATETIME, runId: { type: 'string', pattern: RUN_ID }, kind: { enum: RUN_KINDS }, stage: TEXT, wfRunId: { type: ['string', 'null'] }, tokens: INT0 },
}

export const LAST_SHIP = {
  type: 'object',
  required: ['sha', 'tree', 'dataVersion', 'indexAsset', 'at', 'runId', 'deployed', 'checked'],
  properties: {
    sha: SHA,
    tree: SHA,
    dataVersion: { type: 'string' },
    indexAsset: { type: 'string', pattern: '^assets/index-[A-Za-z0-9_-]+\\.js$' },
    at: DATETIME,
    runId: { type: 'string', pattern: RUN_ID },
    deployed: { type: 'boolean' },
    checked: { type: 'boolean' },
    deployUrl: URL_OR_NULL,
  },
}

/** research/presidentielle-2027/build.json : la seule commande BUILD de la présidentielle (tools/veille/build.mjs) */
export const BUILD_CONFIG = {
  type: 'object',
  required: ['format', 'workflowOutput', 'researchDir', 'srcDir', 'expansions', 'include'],
  properties: {
    format: { const: 'isoloir-build/1' },
    _note: { type: 'string' },
    workflowOutput: { type: 'string', pattern: '^research/presidentielle-2027/[^/]+\\.json$' },
    researchDir: { const: 'research/presidentielle-2027' },
    srcDir: { const: 'src/elections/presidentielle-2027' },
    expansions: { type: 'array', uniqueItems: true, items: { type: 'string', pattern: '^research/presidentielle-2027/expansion-merged(-[0-9]+)?\\.json$' } },
    include: { type: 'array', uniqueItems: true, items: { type: 'string', pattern: CANDIDATE_ID } },
  },
  additionalProperties: false,
}

export const CLASSIFY_RESULT = {
  type: 'object',
  required: ['qualifying', 'deferred', 'withdrawals', 'redeclarations', 'conditions', 'official', 'watch', 'unchanged'],
  properties: {
    qualifying: { type: 'array', items: { type: 'object', required: ['ref', 'slug', 'name', 'reasons'], properties: { ref: TEXT, slug: { type: 'string', pattern: CANDIDATE_ID }, name: TEXT, party: { type: ['string', 'null'] }, reasons: STRINGS, sources: { type: 'array', items: WATCH_SOURCE } } } },
    deferred: { type: 'array', items: { type: 'object', required: ['ref', 'slug', 'reason'], properties: { ref: TEXT, slug: TEXT, reason: TEXT } } },
    withdrawals: { type: 'array', items: { type: 'object', required: ['ref', 'candidateId'], properties: { ref: TEXT, candidateId: { type: 'string', pattern: CANDIDATE_ID }, sources: { type: 'array', items: WATCH_SOURCE } } } },
    redeclarations: { type: 'array', items: { type: 'object', required: ['ref', 'candidateId'], properties: { ref: TEXT, candidateId: TEXT } } },
    conditions: { type: 'array', items: { type: 'object', required: ['ref'], properties: { ref: TEXT } } },
    official: { type: 'array', items: { type: 'object', required: ['ref'], properties: { ref: TEXT } } },
    watch: { type: 'array', items: WATCH_ENTRY },
    unchanged: { type: 'array', items: { type: 'string' } },
    stillDeclaredFalse: { type: 'array', items: { type: 'string' } },
  },
}

/** Sortie --json de tools/audit-{echiquier,croix,poids,facon}.mjs (B3) ; lue par remeasure.mjs (B7) */
export const AUDIT_JSON = {
  type: 'object',
  required: ['tool', 'electionId', 'options', 'measured', 'extra'],
  properties: {
    tool: { enum: ['audit-echiquier', 'audit-croix', 'audit-poids', 'audit-facon'] },
    electionId: TEXT,
    options: { type: 'object' },
    // Même forme que la constante publiée (ECHIQUIER_PUBLISHED, _CROSS, _WEIGH, _MANNER), clés mesurées seulement
    measured: { type: 'object' },
    extra: {
      type: 'object',
      required: ['verdicts'],
      properties: {
        verdicts: { type: 'object', additionalProperties: { enum: ['passe', 'ne passe pas', 'non établi'] } },
        blocs: { type: 'array', items: TEXT },
      },
    },
  },
}

/** La ligne JSON que tout script imprime sur stdout en sortant (lib/common.mjs, exit) */
export const EXIT_PAYLOAD = {
  type: 'object',
  required: ['script', 'code', 'ok'],
  properties: {
    script: TEXT,
    code: { enum: [0, 2, 10, 11, 12, 13, 20, 21, 22, 30, 31, 40, 41] },
    ok: { type: 'boolean' },
    reason: { type: 'string' },
    bundles: STRINGS,
  },
}

export const SCHEMAS = Object.freeze({
  POSITION_PUBLISHED, POSITION_NEW, POLICY, STATE, LOCKS, LEDGER, WATCH_EVENT, WATCH_RESULT, CHANGE, REFRESH_RESULT, CHANGESET,
  APPLY_REPORT, PENDING_ITEM, PENDING_FILE, LOCK, RUN, SPEND_LINE, LAST_SHIP, BUILD_CONFIG, CLASSIFY_RESULT, AUDIT_JSON, EXIT_PAYLOAD,
})

// ——— Validateur ———

const typeOf = v => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
const isType = (v, t) => {
  switch (t) {
    case 'null': return v === null
    case 'array': return Array.isArray(v)
    case 'object': return v !== null && typeof v === 'object' && !Array.isArray(v)
    case 'integer': return Number.isInteger(v)
    case 'number': return typeof v === 'number' && Number.isFinite(v)
    case 'string': return typeof v === 'string'
    case 'boolean': return typeof v === 'boolean'
    default: return false
  }
}
const sameValue = (a, b) => (a === b) || (typeof a === 'object' && typeof b === 'object' && JSON.stringify(a) === JSON.stringify(b))
const key = k => (/^[A-Za-z_$][\w$]*$/.test(k) ? `.${k}` : `[${JSON.stringify(k)}]`)

function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}
const FORMATS = {
  date: validDate,
  'date-time': s => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(s) && !Number.isNaN(Date.parse(s)) && validDate(s.slice(0, 10)),
  uri: s => /^https?:\/\/[^\s/]+\.[^\s]*$/.test(s),
  https: s => /^https:\/\/[^\s/]+\.[^\s]*$/.test(s),
}
const FORMAT_LABEL = { date: 'une date AAAA-MM-JJ', 'date-time': 'une date-heure ISO 8601 avec fuseau', uri: 'une adresse http(s)', https: 'une adresse https' }

/**
 * Erreurs de value au regard de schema ([] si conforme). Chaque erreur : « <chemin> : <message> ».
 */
export function validate(schema, value, path = '$') {
  const errors = []
  walk(schema, value, path, errors)
  return errors
}

function walk(s, v, path, errors) {
  if (!s || typeof s !== 'object') return
  if (s.anyOf) {
    const ok = s.anyOf.some(branch => validate(branch, v, path).length === 0)
    if (!ok) {
      const firsts = s.anyOf.map(branch => validate(branch, v, path)[0]).filter(Boolean)
      errors.push(`${path} : ne correspond à aucune des formes admises (${firsts.join(' | ')})`)
    }
  }
  if (s.type !== undefined) {
    const types = Array.isArray(s.type) ? s.type : [s.type]
    if (!types.some(t => isType(v, t))) {
      errors.push(`${path} : type ${typeOf(v)}, attendu ${types.join(' ou ')}`)
      return
    }
  }
  if ('const' in s && !sameValue(v, s.const)) errors.push(`${path} : vaut ${JSON.stringify(v)}, attendu ${JSON.stringify(s.const)}`)
  if (s.enum && !s.enum.some(x => sameValue(x, v))) errors.push(`${path} : ${JSON.stringify(v)} hors de la liste (${s.enum.map(x => JSON.stringify(x)).join(', ')})`)
  if (typeof v === 'string') {
    if (s.minLength != null && [...v].length < s.minLength) errors.push(`${path} : moins de ${s.minLength} caractères`)
    if (s.maxLength != null && [...v].length > s.maxLength) errors.push(`${path} : plus de ${s.maxLength} caractères`)
    if (s.pattern && !new RegExp(s.pattern, 'u').test(v)) errors.push(`${path} : « ${v.slice(0, 80)} » ne suit pas le motif ${s.pattern}`)
    if (s.format && FORMATS[s.format] && !FORMATS[s.format](v)) errors.push(`${path} : « ${v.slice(0, 80)} » n'est pas ${FORMAT_LABEL[s.format]}`)
    if (s.maxWords != null && v.trim() && v.trim().split(/\s+/).length > s.maxWords) errors.push(`${path} : plus de ${s.maxWords} mots`)
  }
  if (typeof v === 'number') {
    if (s.minimum != null && v < s.minimum) errors.push(`${path} : ${v} < ${s.minimum}`)
    if (s.maximum != null && v > s.maximum) errors.push(`${path} : ${v} > ${s.maximum}`)
  }
  if (Array.isArray(v)) {
    if (s.minItems != null && v.length < s.minItems) errors.push(`${path} : moins de ${s.minItems} éléments`)
    if (s.maxItems != null && v.length > s.maxItems) errors.push(`${path} : plus de ${s.maxItems} éléments`)
    if (s.uniqueItems && new Set(v.map(x => JSON.stringify(x))).size !== v.length) errors.push(`${path} : éléments en double`)
    if (s.items) v.forEach((x, i) => walk(s.items, x, `${path}[${i}]`, errors))
  }
  if (isType(v, 'object')) {
    for (const k of s.required ?? []) if (!(k in v)) errors.push(`${path} : clé « ${k} » manquante`)
    if (s.minProperties != null && Object.keys(v).length < s.minProperties) errors.push(`${path} : moins de ${s.minProperties} clés`)
    const props = s.properties ?? {}
    for (const [k, x] of Object.entries(v)) {
      if (s.propertyNames?.pattern && !new RegExp(s.propertyNames.pattern, 'u').test(k)) errors.push(`${path} : clé « ${k} » hors du motif ${s.propertyNames.pattern}`)
      if (k in props) walk(props[k], x, `${path}${key(k)}`, errors)
      else if (s.additionalProperties === false) errors.push(`${path} : clé inattendue « ${k} »`)
      else if (s.additionalProperties && typeof s.additionalProperties === 'object') walk(s.additionalProperties, x, `${path}${key(k)}`, errors)
    }
  }
}

/** Lève une erreur (message en français, erreurs en liste) si value ne suit pas schema ; rend value sinon */
export function assertValid(schema, value, what = 'valeur') {
  const errors = validate(schema, value)
  if (errors.length) {
    const e = new Error(`${what} non conforme : ${errors.slice(0, 10).join(' ; ')}${errors.length > 10 ? ` ; … ${errors.length - 10} autres` : ''}`)
    e.errors = errors
    throw e
  }
  return value
}

/**
 * Règles croisées d'un changement (CHANGE), que JSON Schema n'exprime pas ; [] si tout est cohérent. Les tests des
 * workflows 9 et apply.mjs les appliquent toutes.
 */
export function checkChange(c, path = '$') {
  const errors = []
  const isPlaceholder = typeof c?.approachId === 'string' && new RegExp(APPROACH_PLACEHOLDER).test(c.approachId)
  const onQuestion = typeof c?.approachId === 'string' && typeof c?.questionId === 'string' && c.approachId.startsWith(`${c.questionId}-`)
  switch (c?.kind) {
    case 'set':
      if (!c.after) errors.push(`${path} : set sans « after »`)
      if (!c.approachId || !onQuestion) errors.push(`${path} : set sans approche de la question ${c.questionId}`)
      if (c.proposedApproachText !== null) errors.push(`${path} : proposedApproachText réservé à addApproach`)
      break
    case 'remove':
      if (c.after !== null) errors.push(`${path} : remove avec un « after »`)
      if (!c.before) errors.push(`${path} : remove sans « before » (rien à retirer)`)
      if (!c.approachId || !onQuestion || isPlaceholder) errors.push(`${path} : remove sans approche publiée de la question ${c.questionId}`)
      if (c.proposedApproachText !== null) errors.push(`${path} : proposedApproachText réservé à addApproach`)
      break
    case 'addApproach':
      if (!isPlaceholder || !onQuestion) errors.push(`${path} : addApproach sans identifiant provisoire « ${c?.questionId}-NEW<k> »`)
      if (!c.proposedApproachText) errors.push(`${path} : addApproach sans texte`)
      if (c.before !== null || c.after !== null) errors.push(`${path} : addApproach porte l'approche seule (before et after à null ; la position du candidat est un set sur l'identifiant provisoire)`)
      break
    case 'newQuestionSubject':
      if (c.questionId !== null || c.approachId !== null) errors.push(`${path} : newQuestionSubject sans question ni approche`)
      if (!c.subject) errors.push(`${path} : newQuestionSubject sans « subject »`)
      if (c.before !== null || c.after !== null) errors.push(`${path} : newQuestionSubject sans position`)
      break
    default:
      errors.push(`${path} : kind inconnu`)
  }
  if (c && c.kind !== 'newQuestionSubject' && c.subject != null) errors.push(`${path} : « subject » réservé à newQuestionSubject`)
  if (c?.cause === 'prise-de-position' && !c.statedAt) errors.push(`${path} : prise-de-position sans statedAt`)
  if (c?.cause !== 'prise-de-position' && c?.statedAt != null) errors.push(`${path} : statedAt réservé à prise-de-position`)
  if (c?.after?.weight && c.after.rejects) errors.push(`${path} : poids et rejet à la fois`)
  if (c?.after?.nature === 'inference' && c.after.weight === 2) errors.push(`${path} : une inférence ne dépasse pas le poids 1`)
  return errors
}
