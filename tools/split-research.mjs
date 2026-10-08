// Découpe les dossiers de recherche par groupe de thèmes pour les agents de conception.
// Usage : node tools/split-research.mjs research/<id> [--exclude-pending]
//
// Deux modes :
// - research/<id>/config.json existe et définit topics et groups (nouvelles élections) : familles lues
//   dans config.groups, candidats dans config.candidates, sorties du workflow tools/workflows/1-research.js extraites par
//   tools/extract-journal.mjs :
//     dossier_<id>.json  : dossier neuf d'un candidat ;
//     refresh_<id>.json  : complément d'un dossier réutilisé (chemin reuseDossier de la config) sur les
//                          thèmes nouveaux ou élargis, avec « updates » (positions changées depuis) ;
//     cleavages_<groupe>.json : lignes de fracture et points de consensus d'une famille de thèmes.
//   Un dossier réutilisé est fusionné avec son complément : positions du complément marquées
//   « refresh: true ». Ses anciens thèmes absents de la config sont rangés grâce à LEGACY_TOPICS
//   (ou config.legacyTopics) et marqués « legacyTopic » ; ceux qui ne mènent à aucun thème sont écartés.
//   Les candidats sont rangés par identifiant (ordre neutre), ceux en attente de la primaire marqués
//   « pendingPrimary » (--exclude-pending les retire).
// - sinon (primaire « Choisir 2027 », dont la config minimale n'a ni topics ni groups) : groupes historiques
//   ci-dessous, dossier_*.json et cleavages+debates.json. Sortie inchangée, octet pour octet : ne pas
//   modifier ce chemin.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const dir = argv.find(a => !a.startsWith('--'))
if (!dir) {
  console.error('Usage : node tools/split-research.mjs research/<id> [--exclude-pending]')
  process.exit(1)
}

// Thèmes de la primaire qui n'existent plus tels quels : thèmes de la nouvelle élection qu'ils couvrent.
// « strategie » (alliances de la gauche) n'a pas d'équivalent : ses positions sont écartées.
const LEGACY_TOPICS = {
  international_defense: ['ukraine_russie', 'proche_orient', 'defense'],
  strategie: [],
}

const configPath = join(dir, 'config.json')
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : null
if (Array.isArray(config?.topics) && Array.isArray(config?.groups)) splitFromConfig(config)
else splitPrimaire()

// Primaire « Choisir 2027 » : groupes de la conception d'origine (2 octobre 2026)
function splitPrimaire() {
  const GROUPS = {
    strategie_institutions: ['strategie', 'institutions'],
    economie: ['fiscalite', 'travail_salaires', 'industrie_economie'],
    social: ['retraites', 'sante', 'education', 'logement'],
    ecologie: ['ecologie_energie', 'agriculture', 'territoires'],
    monde: ['europe', 'international_defense'],
    societe: ['immigration', 'laicite_republique', 'securite_justice', 'numerique', 'societe'],
  }
  const dossiers = readdirSync(dir).filter(f => f.startsWith('dossier_')).map(f => JSON.parse(readFileSync(join(dir, f), 'utf8')))
  const cleav = JSON.parse(readFileSync(join(dir, 'cleavages+debates.json'), 'utf8'))
  mkdirSync(join(dir, 'groups'), { recursive: true })
  for (const [g, topics] of Object.entries(GROUPS)) {
    const out = {
      group: g,
      topics,
      candidates: dossiers.map(d => ({
        candidate: d.candidate,
        affiliation: d.affiliation,
        overview: d.overview,
        distinctive_vs_others: d.distinctive_vs_others,
        signature_proposals: d.signature_proposals.filter(s => topics.includes(s.topic_id)),
        topics: d.topics.filter(t => topics.includes(t.topic_id)),
      })),
      cleavages: cleav.cleavages.filter(c => topics.includes(c.topic_id)),
      consensus: cleav.consensus_points.filter(c => topics.includes(c.topic_id)),
      debates: cleav.debates,
    }
    writeFileSync(join(dir, 'groups', `${g}.json`), JSON.stringify(out, null, 2))
    const n = out.candidates.reduce((a, c) => a + c.topics.reduce((x, t) => x + t.positions.length, 0), 0)
    console.log(g, 'positions:', n, 'cleavages:', out.cleavages.length, 'candidates:', out.candidates.length)
  }
}

function splitFromConfig(C) {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const excludePending = argv.includes('--exclude-pending')
  const load = p => JSON.parse(readFileSync(p, 'utf8'))
  const topicIds = new Set(C.topics.map(t => t.id))
  const legacy = { ...LEGACY_TOPICS, ...(C.legacyTopics ?? {}) }
  const warnings = []

  // Contrôle de la config : chaque thème dans une seule famille, aucune famille sur un thème inconnu
  const groupOfTopic = new Map()
  for (const g of C.groups) {
    for (const t of g.topicIds) {
      if (!topicIds.has(t)) warnings.push(`famille ${g.id} : thème inconnu ${t}`)
      if (groupOfTopic.has(t)) warnings.push(`thème ${t} dans deux familles (${groupOfTopic.get(t)}, ${g.id})`)
      else groupOfTopic.set(t, g.id)
    }
  }
  for (const t of topicIds) if (!groupOfTopic.has(t)) warnings.push(`thème ${t} dans aucune famille`)

  /** Thèmes de la config couverts par un identifiant de thème, ancien ou actuel */
  const targets = tid => (topicIds.has(tid) ? [tid] : (legacy[tid] ?? []).filter(x => topicIds.has(x)))
  const inGroup = (g, tid) => targets(tid).some(x => g.topicIds.includes(x))

  // Dossiers : neuf (dossier_<id>.json) ou réutilisé (reuseDossier), complété par refresh_<id>.json
  const people = []
  const missing = []
  const dropped = new Map()
  for (const c of [...C.candidates].sort((a, b) => a.id.localeCompare(b.id))) {
    if (excludePending && c.pendingPrimary) continue
    const own = join(dir, `dossier_${c.id}.json`)
    const reusePath = c.reuseDossier ? resolve(ROOT, c.reuseDossier) : null
    const basePath = existsSync(own) ? own : reusePath && existsSync(reusePath) ? reusePath : null
    if (!basePath) {
      missing.push(c.id)
      continue
    }
    const refreshPath = join(dir, `refresh_${c.id}.json`)
    const refresh = existsSync(refreshPath) ? load(refreshPath) : null
    const reused = basePath === reusePath
    if (reused && !refresh) warnings.push(`${c.id} : dossier réutilisé sans complément (${refreshPath} absent)`)
    const d = mergeRefresh(load(basePath), refresh)
    for (const t of d.topics ?? []) {
      if (targets(t.topic_id).length) continue
      const n = (t.positions ?? []).length
      if (n) dropped.set(`${c.id}:${t.topic_id}`, n)
    }
    people.push({ c, d, reused, refreshed: !!refresh })
  }
  if (missing.length) warnings.push(`dossiers absents : ${missing.join(', ')}`)
  for (const [k, n] of dropped) warnings.push(`${k} : ${n} position(s) sur un thème sans équivalent, écartée(s)`)

  // Lignes de fracture : chaque entrée rejoint la famille de son thème, à défaut celle de son fichier
  const cleav = new Map(C.groups.map(g => [g.id, { cleavages: [], consensus: [] }]))
  let debates = null
  const route = (tid, fallback) => groupOfTopic.get(targets(tid)[0]) ?? (cleav.has(fallback) ? fallback : null)
  const addCleavages = (x, fallback, label) => {
    for (const c of x.cleavages ?? []) {
      const g = route(c.topic_id, fallback)
      if (g) cleav.get(g).cleavages.push(c)
      else warnings.push(`${label} : fracture sur un thème inconnu (${c.topic_id}) écartée`)
    }
    for (const c of x.consensus_points ?? []) {
      const g = route(c.topic_id, fallback)
      if (g) cleav.get(g).consensus.push(c)
      else warnings.push(`${label} : consensus sur un thème inconnu (${c.topic_id}) écarté`)
    }
  }
  const cleavFiles = readdirSync(dir).filter(f => /^cleavages_.+\.json$/.test(f)).sort()
  for (const f of cleavFiles) addCleavages(load(join(dir, f)), f.slice('cleavages_'.length, -'.json'.length), f)
  if (!cleavFiles.length && existsSync(join(dir, 'cleavages+debates.json'))) {
    const x = load(join(dir, 'cleavages+debates.json'))
    addCleavages(x, null, 'cleavages+debates.json')
    debates = x.debates ?? null
  }
  for (const g of C.groups) {
    if (cleavFiles.length && !cleavFiles.includes(`cleavages_${g.id}.json`)) warnings.push(`famille ${g.id} : cleavages_${g.id}.json absent`)
  }

  const pending = people.filter(p => p.c.pendingPrimary).map(p => p.c.id)
  mkdirSync(join(dir, 'groups'), { recursive: true })
  for (const g of C.groups) {
    const out = {
      group: g.id,
      label: g.label,
      topics: g.topicIds,
      topicInfo: g.topicIds.map(id => {
        const t = C.topics.find(x => x.id === id)
        return { id, label: t?.label, description: t?.description }
      }),
      candidates: people.map(({ c, d, reused, refreshed }) => ({
        id: c.id,
        candidate: d.candidate ?? c.name,
        affiliation: d.affiliation ?? c.party,
        ...(c.pendingPrimary ? { pendingPrimary: true } : {}),
        ...(reused
          ? {
              reusedDossier: c.reuseDossier,
              reuseNote: `Dossier de la primaire « Choisir 2027 » (arrêté au 2 octobre 2026) : « distinctive_vs_others » le compare aux autres candidats de la primaire.${refreshed ? ` Positions marquées « refresh » : complément du ${C.contextDate} ; « updates » : changements depuis le dossier.` : ' Pas encore de complément pour les nouveaux thèmes.'}`,
            }
          : {}),
        overview: d.overview,
        distinctive_vs_others: d.distinctive_vs_others,
        signature_proposals: (d.signature_proposals ?? []).filter(s => inGroup(g, s.topic_id)),
        topics: (d.topics ?? [])
          .filter(t => inGroup(g, t.topic_id))
          .map(t => (topicIds.has(t.topic_id) ? t : { ...t, legacyTopic: true, mapsTo: targets(t.topic_id) })),
        ...(d.updates ? { updates: d.updates.filter(u => inGroup(g, u.topic_id)) } : {}),
      })),
      cleavages: cleav.get(g.id).cleavages,
      consensus: cleav.get(g.id).consensus,
      ...(debates ? { debates } : {}),
      ...(pending.length ? { pendingPrimary: pending } : {}),
      ...(missing.length ? { missingDossiers: missing } : {}),
    }
    writeFileSync(join(dir, 'groups', `${g.id}.json`), JSON.stringify(out, null, 2))
    const n = out.candidates.reduce((a, c) => a + c.topics.reduce((x, t) => x + (t.positions ?? []).length, 0), 0)
    const empty = out.candidates.filter(c => !c.topics.some(t => (t.positions ?? []).length)).map(c => c.id)
    console.log(g.id, 'positions:', n, 'cleavages:', out.cleavages.length, 'candidates:', out.candidates.length, empty.length ? `sans position : ${empty.join(', ')}` : '')
  }
  for (const w of warnings) console.warn(`attention : ${w}`)
}

/** Dossier réutilisé + complément : positions ajoutées thème par thème, « updates » repris */
function mergeRefresh(base, refresh) {
  if (!refresh) return base
  const topics = (base.topics ?? []).map(t => ({ ...t, positions: [...(t.positions ?? [])] }))
  for (const rt of refresh.topics ?? []) {
    const added = (rt.positions ?? []).map(p => ({ ...p, refresh: true }))
    const t = topics.find(x => x.topic_id === rt.topic_id)
    if (t) {
      t.found = !!(t.found || rt.found || added.length)
      t.positions.push(...added)
    } else topics.push({ topic_id: rt.topic_id, found: !!(rt.found || added.length), positions: added })
  }
  return { ...base, topics, updates: [...(base.updates ?? []), ...(refresh.updates ?? [])] }
}
