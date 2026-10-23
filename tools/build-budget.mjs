// « Faire les comptes » : du fichier de recherche des leviers (research/<id>/budget-levers.json, fiches structurées et
// vérifiées par le workflow budget-lever-specs) au module du site (src/elections/<id>/budget.ts), sans rien écrire à la
// main. Chaque fiche passe des contrôles mécaniques ; une erreur arrête tout (sortie 1), un avertissement est écrit au
// journal (research/<id>/budget-build-log.txt). Les citations des sources restent dans la recherche : le site n'en garde
// que le titre, l'éditeur, l'adresse, les dates et le chiffre.
//
// Usage : node tools/build-budget.mjs [<id>]   (par défaut presidentielle-2027)

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { typo } from './typo.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const id = process.argv[2] ?? 'presidentielle-2027'
const RESEARCH = join(ROOT, 'research', id)
const OUT = join(ROOT, 'src/elections', id, 'budget.ts')
const OUT_EXPLAIN = join(ROOT, 'src/elections', id, 'budget-explain.ts')
// Les approches des questions reliées aux leviers, et « Comprendre » chaque levier (décisions du 18 octobre 2026) :
// facultatifs, écrits par la recherche (workflow budget-expansion)
const readOptional = name => (existsSync(join(RESEARCH, name)) ? JSON.parse(readFileSync(join(RESEARCH, name), 'utf8')) : null)
const linksIn = readOptional('budget-links.json')
const explainIn = readOptional('budget-explain.json')
// La mesure de neutralité du mode relié, publiée par la Méthode (tools/budget-pregate.mjs --links … --write-gate …)
const gateIn = readOptional('budget-gate.json')
const bank = JSON.parse(readFileSync(join(RESEARCH, 'bank.json'), 'utf8')).bank
const input = JSON.parse(readFileSync(join(RESEARCH, 'budget-levers.json'), 'utf8'))
// Les leviers ajoutés le 18 octobre 2026 (sous-options, reste du débat, estimations) et, pour les premiers, la plage
// au-delà de la source : deux fichiers de la recherche, à part, appliqués ici
{
  const v2 = existsSync(join(RESEARCH, 'budget-levers-v2.json')) ? JSON.parse(readFileSync(join(RESEARCH, 'budget-levers-v2.json'), 'utf8')) : null
  if (v2) {
    const known = new Set(input.levers.map(l => l.id))
    for (const l of v2.levers) if (!known.has(l.id)) input.levers.push(l)
    input.version = `${input.version}+${v2.version}`
  }
  const st = existsSync(join(RESEARCH, 'budget-stretch.json')) ? JSON.parse(readFileSync(join(RESEARCH, 'budget-stretch.json'), 'utf8')) : null
  for (const x of st?.stretches ?? []) {
    const l = input.levers.find(y => y.id === x.id)
    if (!l || x.none) continue
    if (x.stretch && l.kind === 'linear') l.stretch = x.stretch
    if (x.extraOptions?.length && l.kind === 'options') for (const o of x.extraOptions) if (!l.options.some(y => y.id === o.id)) l.options.push({ ...o, base: false })
  }
}
// Les corrections décidées après coup (revue de finition…), chacune avec sa raison : appliquées ici, champ par champ,
// plutôt que de retoucher le fichier de la recherche à la main
const CORRECTIONS = join(RESEARCH, 'budget-corrections.json')
const corrections = existsSync(CORRECTIONS) ? JSON.parse(readFileSync(CORRECTIONS, 'utf8')).corrections : []
const decisions = JSON.parse(readFileSync(join(RESEARCH, 'budget-decisions.json'), 'utf8'))

const errors = []
const warns = []
const err = (lever, msg) => errors.push(`ERROR ${lever}: ${msg}`)
const warn = (lever, msg) => warns.push(`WARN ${lever}: ${msg}`)

// Les noms des candidats et des partis : aucune source ni aucun texte d'un levier ne les nomme
const NAMES = new Set()
{
  const src = readFileSync(join(ROOT, 'src/elections', id, 'candidates.ts'), 'utf8')
  for (const m of src.matchAll(/\n {4}name: '([^']+)'/g)) {
    const parts = m[1].split(' ')
    NAMES.add(parts.slice(1).join(' ') || parts[0])
  }
  for (const m of src.matchAll(/party: \{ name: '([^']+)'/g)) if (m[1].length > 3) NAMES.add(m[1])
}
const slug = s =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
const NAME_SLUGS = [...NAMES].map(slug).filter(s => s.length >= 4)
const namesIn = text => NAME_SLUGS.filter(n => new RegExp(`(^|-)${n}(-|$)`).test(slug(text)))

// Le registre des sources (budget-decisions.json) : qui peut être une borne
const BOUND_KINDS = new Set(['administration', 'organe-independant', 'parlement', 'recherche'])
const WITH_SECOND = new Set(['expert-independant', 'think-tank'])
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/
const DAY = /^\d{4}-\d{2}-\d{2}$/
const FAMILIES = new Set(['impots', 'depenses', 'sociale'])
const num = x => typeof x === 'number' && Number.isFinite(x)

const applied = []
// Corrections d'un texte « Comprendre » ({ explain: id, set }) ou d'un lien vers une approche ({ link: { approach, lever },
// set }) : appliquées à leur fichier de la recherche, ici, avant ses contrôles
for (const c of corrections.filter(c => c.explain)) {
  const x = explainIn?.explainers?.find(e => e.id === c.explain)
  if (!x) errors.push(`ERROR ${c.explain}: correction d’un texte « Comprendre » absent (${c.why})`)
  else {
    Object.assign(x, c.set)
    applied.push(`CORRECTION comprendre ${c.explain}: ${Object.keys(c.set).join(', ')} — ${c.why}`)
  }
}
for (const c of corrections.filter(c => c.link)) {
  const k = linksIn?.links?.find(l => l.approach === c.link.approach && l.lever === c.link.lever)
  if (!k) errors.push(`ERROR lien ${c.link.approach} → ${c.link.lever}: correction d’un lien absent (${c.why})`)
  else {
    Object.assign(k, c.set)
    applied.push(`CORRECTION lien ${c.link.approach} → ${c.link.lever}: ${Object.keys(c.set).join(', ')} — ${c.why}`)
  }
}
for (const c of corrections.filter(c => !c.explain && !c.link)) {
  const target = input.levers.find(l => l.id === c.id)
  if (!target) {
    errors.push(`ERROR ${c.id}: correction pour un levier absent (${c.why})`)
    continue
  }
  Object.assign(target, c.set)
  applied.push(`CORRECTION ${c.id}: ${Object.keys(c.set).join(', ')} — ${c.why}`)
}

const levers = []
for (const s of input.levers) {
  if (s.drop) {
    warn(s.id, `écarté : ${s.drop.reason}`)
    continue
  }
  const L = s.id
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(L)) err(L, 'identifiant mal formé')
  if (levers.some(x => x.id === L)) err(L, 'identifiant en double')
  if (!FAMILIES.has(s.family)) err(L, `famille inconnue : ${s.family}`)
  if (!s.label || s.label.length > 40) err(L, `nom absent ou trop long (${s.label?.length})`)
  if (!s.today || s.today.length > 90) err(L, `« aujourd'hui » absent ou trop long (${s.today?.length})`)
  if (!['recette', 'depense'].includes(s.direction)) err(L, `sens inconnu : ${s.direction}`)
  if (!s.limits || s.limits.length > 280) err(L, `« ce que le chiffre ne compte pas » absent ou trop long (${s.limits?.length})`)
  for (const t of [s.label, s.today, s.limits, s.laterNote ?? '']) if (namesIn(t).length) err(L, `nomme un candidat ou un parti : ${namesIn(t).join(', ')}`)

  if (s.kind === 'linear') {
    const { lo, hi } = s.perUnit ?? {}
    if (!num(lo) || !num(hi) || lo <= 0 || hi < lo) err(L, `effet par unité invalide (${lo} à ${hi})`)
    if (hi > 3 * lo && hi - lo > 1) warn(L, `fourchette large : ${lo} à ${hi} (×${(hi / lo).toFixed(1)})`)
    const max = s.range?.max
    const step = s.range?.step
    if (!num(max) || max <= 0) err(L, `plage invalide (${max})`)
    if (!num(step) || step <= 0 || Math.abs(max / step - Math.round(max / step)) > 1e-6 || max / step > 400) err(L, `pas invalide (${step} pour ${max})`)
    const n = [...(s.notches ?? [])].sort((a, b) => a - b)
    if (!n.includes(0)) err(L, 'les crans n’ont pas de 0 (le PLF)')
    if (n.some(x => Math.abs(x) > max + 1e-9)) err(L, `un cran dépasse la plage (${n.join(', ')} pour ±${max})`)
    if (n.some((x, i) => Math.abs(x + n[n.length - 1 - i]) > 1e-9)) err(L, `crans non symétriques (${n.join(', ')})`)
    if (n.length < 3 || n.length > 7) err(L, `nombre de crans hors de 3 à 7 (${n.length})`)
  } else if (s.kind === 'options') {
    const o = s.options ?? []
    if (o.length < 2) err(L, 'moins de deux réglages')
    const bases = o.filter(x => x.base)
    if (bases.length !== 1) err(L, `il faut un seul réglage du PLF (${bases.length})`)
    if (bases[0] && (bases[0].lo !== 0 || bases[0].hi !== 0)) err(L, 'le réglage du PLF doit valoir 0')
    for (const x of o) if (!num(x.lo) || !num(x.hi) || x.hi < x.lo) err(L, `réglage ${x.id} invalide (${x.lo} à ${x.hi})`)
  } else err(L, `genre inconnu : ${s.kind}`)

  const sources = s.sources ?? []
  if (!sources.length) err(L, 'aucune source')
  for (const src of sources) {
    if (!/^https:\/\//.test(src.url)) err(L, `adresse non https : ${src.url}`)
    if (!DATE.test(src.date ?? '')) err(L, `date de publication mal formée : ${src.date}`)
    if (!DAY.test(src.accessedAt ?? '')) err(L, `« consulté le » mal formé : ${src.accessedAt}`)
    if (!src.title || !src.publisher || !src.figure) err(L, 'source incomplète (titre, éditeur ou chiffre)')
    const named = namesIn(`${src.title} ${src.url} ${src.publisher}`)
    if (named.length) err(L, `source qui nomme un candidat ou un parti (${named.join(', ')}) : ${src.url}`)
    // Un texte juridique (une directive, un article de loi) dit le cadre, jamais un montant : admis en contexte seulement
    const context = /^texte-juridique/.test(src.kind ?? '')
    if (!BOUND_KINDS.has(src.kind) && !WITH_SECOND.has(src.kind) && !context) err(L, `source hors du registre (${src.kind}) : ${src.url}`)
  }
  if (sources.length && sources.every(x => /^texte-juridique/.test(x.kind ?? ''))) err(L, 'aucune source ne chiffre : un texte juridique seul')
  if (sources.length && sources.every(x => WITH_SECOND.has(x.kind))) err(L, 'un institut ou un expert seul, sans seconde source éligible')
  if (s.perUnitDown && (!num(s.perUnitDown.lo) || !num(s.perUnitDown.hi) || s.perUnitDown.lo <= 0 || s.perUnitDown.hi < s.perUnitDown.lo)) err(L, 'effet à la baisse invalide')
  // Une estimation d'Isoloir dit sa méthode ; une plage au-delà de la source dit sa borne et son effet (18 octobre 2026)
  if (s.estimate && (typeof s.estimate.method !== 'string' || s.estimate.method.length < 40 || s.estimate.method.length > 600)) err(L, 'estimation sans méthode lisible (40 à 600 signes)')
  if (s.stretch) {
    const st = s.stretch
    const okPu = pu => pu && num(pu.lo) && num(pu.hi) && pu.lo >= 0 && pu.hi >= pu.lo
    if (s.kind !== 'linear') err(L, 'plage au-delà de la source sur un levier à réglages')
    else if (!num(st.max) || st.max <= s.range.max) err(L, `borne au-delà de la source invalide (${st.max} pour une plage de ${s.range.max})`)
    else if (Math.abs(st.max / s.range.step - Math.round(st.max / s.range.step)) > 1e-6) err(L, `borne au-delà de la source hors du pas (${st.max})`)
    if (!okPu(st.perUnit) || (st.perUnitDown && !okPu(st.perUnitDown))) err(L, 'effet au-delà de la source invalide')
    if (typeof st.why !== 'string' || st.why.length < 20 || st.why.length > 320) err(L, 'plage au-delà de la source sans raison lisible (20 à 320 signes)')
  }
  for (const o of s.options ?? []) if (o.estimate !== undefined && (typeof o.estimate !== 'string' || o.estimate.length < 30)) err(L, `réglage ${o.id} estimé sans méthode`)
  {
    const named = namesIn(`${s.estimate?.method ?? ''} ${s.stretch?.why ?? ''} ${(s.options ?? []).map(o => `${o.label} ${o.note ?? ''} ${o.estimate ?? ''}`).join(' ')}`)
    if (named.length) err(L, `texte qui nomme un candidat ou un parti (${named.join(', ')})`)
  }
  if (s.base) {
    if (!num(s.base.value) || s.base.value <= 0) warn(L, `taille de ligne absente : ${s.base.label}`)
    else if (!s.base.source || !/^https:\/\//.test(s.base.source.url ?? '')) err(L, 'taille de ligne sans source https')
  }

  // Les textes affichés prennent la typographie française du site (typo, comme tools/build-pack.mjs)
  levers.push({
    id: L,
    family: s.family,
    label: typo(s.label),
    today: typo(s.today),
    kind: s.kind,
    direction: s.direction,
    unit: { label: typo(s.unit.label), short: s.unit.short },
    perUnit: { lo: s.perUnit.lo, hi: s.perUnit.hi },
    ...(s.perUnitDown ? { perUnitDown: { lo: s.perUnitDown.lo, hi: s.perUnitDown.hi } } : {}),
    ...(s.base && num(s.base.value) && s.base.value > 0
      ? // La fiche ne montre de cette source que l'éditeur, en lien : le reste reste dans la recherche
        { base: { value: s.base.value, label: typo(s.base.label), source: { title: typo(s.base.source.title), publisher: typo(s.base.source.publisher), url: s.base.source.url } } }
      : {}),
    max: s.range.max,
    step: s.range.step,
    notches: [...s.notches].sort((a, b) => a - b),
    baseLabel: s.baseLabel,
    ...(s.kind === 'options' ? { options: s.options.map(o => ({ id: o.id, label: typo(o.label), lo: o.lo, hi: o.hi, ...(o.base ? { base: true } : {}), ...(o.note ? { note: typo(o.note) } : {}), ...(o.estimate ? { estimate: typo(o.estimate) } : {}) })) } : {}),
    ...(s.estimate ? { estimate: { method: typo(s.estimate.method) } } : {}),
    ...(s.stretch && s.kind === 'linear'
      ? { stretch: { max: s.stretch.max, perUnit: { lo: s.stretch.perUnit.lo, hi: s.stretch.perUnit.hi }, ...(s.stretch.perUnitDown ? { perUnitDown: { lo: s.stretch.perUnitDown.lo, hi: s.stretch.perUnitDown.hi } } : {}), why: typo(s.stretch.why) } }
      : {}),
    ...(s.amount ? { amount: { value: s.amount.value, ...(num(s.amount.lo) ? { lo: s.amount.lo } : {}), label: typo(s.amount.label) } } : {}),
    exclusiveWith: [...(s.exclusiveWith ?? [])],
    ...(s.overlapsWith?.length ? { overlapsWith: [...s.overlapsWith] } : {}),
    operatorCaveat: !!s.operatorCaveat,
    ...(s.laterNote ? { laterNote: typo(s.laterNote) } : {}),
    limits: typo(s.limits),
    sources: sources.map(x => ({ title: typo(x.title), publisher: typo(x.publisher), url: x.url, date: x.date, accessedAt: x.accessedAt, figure: typo(x.figure) })),
  })
}

// Les leviers sur la même base se répondent : si A recoupe B, B recoupe A (complété ici, et dit au journal)
const ids = new Set(levers.map(l => l.id))
for (const l of levers) {
  l.exclusiveWith = l.exclusiveWith.filter(o => {
    if (ids.has(o)) return true
    warn(l.id, `recoupe un levier absent : ${o}`)
    return false
  })
}
for (const l of levers)
  for (const o of l.exclusiveWith) {
    const other = levers.find(x => x.id === o)
    if (other && !other.exclusiveWith.includes(l.id)) {
      other.exclusiveWith.push(l.id)
      warn(other.id, `recoupe aussi ${l.id} (réciproque ajoutée)`)
    }
  }
for (const l of levers) l.exclusiveWith.sort()

// Les recoupements partiels (la paie publique et les crédits d'une mission…) : les deux se règlent ensemble, la fiche
// prévient seulement ; réciproques comme les exclusifs, jamais les deux à la fois
for (const l of levers) {
  if (!l.overlapsWith) continue
  l.overlapsWith = l.overlapsWith.filter(o => {
    if (!ids.has(o)) warn(l.id, `recoupe en partie un levier absent ou écarté, ignoré : ${o}`)
    else if (l.exclusiveWith.includes(o)) err(l.id, `à la fois exclusif et recoupement partiel de ${o}`)
    else return true
    return false
  })
}
for (const l of levers)
  for (const o of l.overlapsWith ?? []) {
    const other = levers.find(x => x.id === o)
    if (other && !(other.overlapsWith ?? []).includes(l.id)) {
      other.overlapsWith = [...(other.overlapsWith ?? []), l.id]
      warn(other.id, `recoupe aussi en partie ${l.id} (réciproque ajoutée)`)
    }
  }
for (const l of levers) l.overlapsWith?.sort()

// Les approches reliées : une approche de la banque, un levier gardé, un sens, un réglage lisible pour ce levier
const approachQuestion = new Map(bank.questions.flatMap(q => q.approaches.map(a => [a.id, q.id])))
const links = []
for (const k of linksIn?.links ?? []) {
  const q = approachQuestion.get(k.approach)
  const lever = levers.find(l => l.id === k.lever)
  const where = `lien ${k.approach} → ${k.lever}`
  if (!q) err('liens', `${where} : approche absente de la banque`)
  else if (!lever) warn('liens', `${where} : levier absent ou écarté, lien ignoré`)
  else if (k.dir !== 1 && k.dir !== -1) err('liens', `${where} : sens invalide (${k.dir})`)
  else if (!['exact', 'direction', 'partial'].includes(k.fit)) err('liens', `${where} : ajustement inconnu (${k.fit})`)
  else {
    let setting = k.setting
    if (typeof setting === 'string' && /^[+\-−]?\d+([.,]\d+)?$/.test(setting.trim())) setting = Number(setting.trim().replace('−', '-').replace(',', '.'))
    if (lever.kind === 'options' && typeof setting === 'string' && setting !== 'dir' && !lever.options.some(o => o.id === setting)) {
      warn('liens', `${where} : réglage inconnu (${setting}), sens seulement`)
      setting = 'dir'
    }
    if (lever.kind === 'linear' && typeof setting === 'string' && setting !== 'dir') {
      warn('liens', `${where} : réglage illisible (${setting}), sens seulement`)
      setting = 'dir'
    }
    links.push({ approach: k.approach, question: q, lever: k.lever, dir: k.dir, setting, fit: k.fit })
  }
}
links.sort((a, b) => a.approach.localeCompare(b.approach) || a.lever.localeCompare(b.lever))

// « Comprendre » : un texte par levier gardé, sourcé, sans nom de candidat ni de parti
const explain = {}
for (const x of explainIn?.explainers ?? []) {
  const L = `comprendre ${x.id}`
  if (!levers.some(l => l.id === x.id)) {
    warn(L, 'levier absent ou écarté, texte ignoré')
    continue
  }
  const texts = [x.what, x.who, x.up, x.down, ...(x.argsUp ?? []), ...(x.argsDown ?? [])]
  if (texts.some(t => typeof t !== 'string' || t.length < 10 || t.length > 420)) err(L, 'texte manquant ou trop long')
  if ((x.argsUp ?? []).length !== 2 || (x.argsDown ?? []).length !== 2) err(L, 'deux arguments de chaque côté')
  const named = namesIn(texts.join(' '))
  if (named.length) err(L, `texte qui nomme un candidat ou un parti (${named.join(', ')})`)
  // Les sources d'un texte « Comprendre » : sans doublon, et sans celles que la fiche du levier cite déjà (elle les
  // montre plus bas) ; leur chiffre n'est pas affiché, il reste dans la recherche
  const shown = new Set((levers.find(l => l.id === x.id)?.sources ?? []).map(src => src.url))
  const seen = new Set()
  const srcs = (x.sources ?? []).filter(src => {
    if (shown.has(src.url) || seen.has(src.url)) return false
    seen.add(src.url)
    if (!/^https:\/\//.test(src.url ?? '') || !DAY.test(src.accessedAt ?? '') || !DATE.test(src.date ?? '')) return warn(L, `source mal formée écartée : ${src.url}`), false
    if (namesIn(`${src.title} ${src.url} ${src.publisher}`).length) return err(L, `source qui nomme un candidat ou un parti : ${src.url}`), false
    if (!BOUND_KINDS.has(src.kind) && !WITH_SECOND.has(src.kind) && !/^texte-juridique/.test(src.kind ?? '')) return err(L, `source hors du registre (${src.kind}) : ${src.url}`), false
    return true
  })
  if (!srcs.length && !(x.sources ?? []).length) err(L, 'aucune source')
  explain[x.id] = {
    what: typo(x.what),
    who: typo(x.who),
    up: typo(x.up),
    down: typo(x.down),
    argsUp: x.argsUp.map(typo),
    argsDown: x.argsDown.map(typo),
    sources: srcs.map(src => ({ title: typo(src.title), publisher: typo(src.publisher), url: src.url, date: src.date, accessedAt: src.accessedAt })),
  }
}

const families = Object.fromEntries([...FAMILIES].map(f => [f, levers.filter(l => l.family === f).length]))
for (const [f, n] of Object.entries(families)) if (n < 3) err(f, `moins de 3 leviers dans la famille (${n})`)

const log = [
  `budget-build ${id} : ${levers.length} leviers (${Object.entries(families).map(([f, n]) => `${f} ${n}`).join(', ')}), ${input.levers.length - levers.length} écartés`,
  ...applied,
  ...errors,
  ...warns,
].join('\n')
writeFileSync(join(RESEARCH, 'budget-build-log.txt'), log + '\n')
console.log(log)
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) : budget.ts n'est pas écrit`)
  process.exit(1)
}

const data = {
  version: input.version,
  baseline: {
    label: decisions.baseline.label,
    deficitPct: input.baseline.deficitPct,
    gdp: input.baseline.gdp,
    source: input.baseline.source,
  },
  levers: levers.sort((a, b) => a.id.localeCompare(b.id)),
  ...(links.length ? { links } : {}),
  ...(gateIn && links.length
    ? {
        gate: {
          threshold: gateIn.threshold,
          creuse: gateIn.creuse,
          reduit: gateIn.reduit,
          worstCreuse: gateIn.worstCreuse,
          worstReduit: gateIn.worstReduit,
          reach: gateIn.reach,
          pass: !!gateIn.pass,
          ...(gateIn.preset ? { preset: { creuse: gateIn.preset.creuse, reduit: gateIn.preset.reduit, worstCreuse: gateIn.preset.worstCreuse, worstReduit: gateIn.preset.worstReduit, pass: !!gateIn.preset.pass } } : {}),
        },
      }
    : {}),
}
const ts = `// Fichier généré par tools/build-budget.mjs depuis research/${id}/budget-levers.json : ne pas modifier à la main.
// « Faire les comptes » : ${levers.length} leviers sourcés, chargés à la demande par l'écran du jeu seulement.
import type { BudgetData } from '../../core/budget/types'

export const budget: BudgetData = ${JSON.stringify(data, null, 2)}
`
writeFileSync(OUT, ts)
console.log(`écrit : ${OUT.replace(ROOT, '')}`)
writeFileSync(
  OUT_EXPLAIN,
  `// Fichier généré par tools/build-budget.mjs depuis research/${id}/budget-explain.json : ne pas modifier à la main.
// « Faire les comptes » : « Comprendre » chaque levier (${Object.keys(explain).length} textes), chargé à l'ouverture d'une fiche.
import type { LeverExplainer } from '../../core/budget/types'

export const explain: Record<string, LeverExplainer> = ${JSON.stringify(explain, null, 2)}
`,
)
console.log(`écrit : ${OUT_EXPLAIN.replace(ROOT, '')}`)
