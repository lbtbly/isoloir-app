// « Faire les comptes » : la vérification de l'étape 0 (aller ou non), avant toute interface. Elle lit la carte des
// approches vers les leviers (research/presidentielle-2027/budget-map.draft.json, produite par la recherche) et les
// seuils fixés AVANT la mesure (budget-decisions.json), puis rejoue l'amorce même du jeu (src/core/budget/seed.ts) sur
// les clones des candidats classés et sur les feuilles d'essai remplies par un programme (tests/fixtures/
// echiquier-profiles.ts). Aucune IA, aucun tirage : mêmes entrées, mêmes chiffres.
//
// Mesures :
// - leviers retenus (chiffrables et à régler) ; leviers qui comptent pour chaque bloc, dans son sens ;
// - lignes chiffrées d'un clone bruité du seul questionnaire rapide (médiane) ;
// - G1, couverture signée par bloc : parmi les approches que portent ses candidats, la part chiffrable ou à régler,
//   à part pour celles qui creusent et celles qui réduisent le déficit ; écart entre le bloc le mieux et le moins bien
//   servi, avec et sans chaque candidat ;
// - G0, colonnes brutes de l'amorce par bloc et sur les feuilles d'essai ;
// - G4, leviers atteignables dans le sens de chaque bloc ; G5, idées à trancher par bloc.
// Puis les règles d'arrêt du plan, avec leur verdict.
//
// Usage : node tools/budget-pregate.mjs [--map <fichier>] [--noisy 60] [--profiles 400] [--json]
// Il faut Node 22.18+ (TypeScript sans compilation).

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ROOT, importSite, useSiteModules } from './site-modules.mjs'

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(name)
  return i < 0 ? fallback : argv[i + 1]
}
const MAP_FILE = opt('--map', 'research/presidentielle-2027/budget-map.draft.json')
const NOISY = Number(opt('--noisy', 60))
const N = Number(opt('--profiles', 400))
const JSON_OUT = argv.includes('--json')
if (JSON_OUT) console.log = console.error

useSiteModules()
const { elections } = await importSite('src/elections/all.ts')
const pack = elections.find(p => p.election.id === 'presidentielle-2027')
const { seedBudget, directionOf } = await importSite('src/core/budget/seed.ts')
const { stance } = await importSite('src/core/score.ts')
const { SCHEMES, isQuick, profilesFor } = await importSite('tests/fixtures/echiquier-profiles.ts')
const { hashString, mulberry32 } = await importSite('src/core/rng.ts')

const decisions = JSON.parse(readFileSync(join(ROOT, 'research/presidentielle-2027/budget-decisions.json'), 'utf8'))
const draft = JSON.parse(readFileSync(resolve(ROOT, MAP_FILE), 'utf8'))
const map = draft.entries
const catalogue = draft.catalogue
const Q = pack.bank.questions
const P = profilesFor(pack)
const SH = pack.election.spectrum.axis.map(a => a.short)
const STOP = decisions.stopRules
const RATIO = decisions.gate.blocRatioMax
const MIN_VERDICT = decisions.gate.minPricedLeversPerBlocForVerdict
// Version du jeu : « a-regler » depuis la décision du 17 octobre 2026 (budget-decisions.json, variant) — l'amorce ne
// donne que des directions, la règle des lignes chiffrées au rapide ne s'applique plus, G4 devient une règle
const DIRECTIONS_ONLY = (opt('--variant', decisions.variant?.id ?? 'complet')) === 'a-regler'

const r1 = x => Math.round(x * 10) / 10
const pct = (a, b) => (b ? (100 * a) / b : 0)
const median = xs => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const mean = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const ratio = xs => {
  const v = xs.filter(x => x !== null)
  if (v.length < 2) return null
  const lo = Math.min(...v)
  return lo === 0 ? Infinity : Math.max(...v) / lo
}
const fmtRatio = x => (x === null ? 'n/a' : x === Infinity ? '∞' : x.toFixed(2))

// Complétude de la carte : chaque approche de la banque a exactement une entrée
const allIds = Q.flatMap(q => q.approaches.map(a => a.id))
const missing = allIds.filter(id => !map[id])
const extra = Object.keys(map).filter(id => !allIds.includes(id))
console.log(`« Faire les comptes » : vérification de l'étape 0 sur ${MAP_FILE}, version ${DIRECTIONS_ONLY ? '« À régler » (directions seulement)' : 'complète'}`)
console.log(`Carte : ${Object.keys(map).length} entrées pour ${allIds.length} approches${missing.length ? ` ; MANQUANTES ${missing.length} (${missing.slice(0, 8).join(', ')}…)` : ''}${extra.length ? ` ; inconnues ${extra.length}` : ''}`)

const byStatus = {}
for (const id of allIds) {
  const s = map[id]?.status ?? 'absente'
  byStatus[s] = (byStatus[s] ?? 0) + 1
}
console.log(`Statuts : ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(' · ')}`)

// Leviers retenus
const groups = new Map((catalogue?.groups ?? []).map(g => [g.id, g.leverIds]))
const eligible = new Set((catalogue?.levers ?? []).filter(l => l.eligible).map(l => l.id))
const expand = lever => (groups.has(lever) ? groups.get(lever) : [lever])
const pricedLevers = new Set(allIds.filter(id => map[id]?.status === 'chiffrable').map(id => map[id].lever ?? id))
const openLevers = new Set(allIds.filter(id => map[id]?.status === 'a-regler' && map[id].lever).flatMap(id => expand(map[id].lever)).filter(l => eligible.has(l)))
const unknownOpen = new Set(allIds.filter(id => map[id]?.status === 'a-regler' && map[id].lever).flatMap(id => expand(map[id].lever)).filter(l => !eligible.has(l)))
const usable = new Set([...pricedLevers, ...openLevers])
console.log(`\nLeviers : ${pricedLevers.size} chiffrables (${[...pricedLevers].join(', ')})`)
console.log(`          ${openLevers.size} à régler du catalogue éligible (${[...openLevers].join(', ')})`)
if (unknownOpen.size) console.log(`          ${unknownOpen.size} à régler HORS catalogue éligible, non comptés (${[...unknownOpen].join(', ')})`)
console.log(`          ${usable.size} leviers retenus en tout ; catalogue : ${eligible.size} leviers éligibles`)

// Ce que porte chaque bloc (positions, sans bruit)
const carried = P.panel.map(ids => {
  const out = new Map()
  for (const cid of ids)
    for (const q of Q)
      for (const a of q.approaches) {
        if (stance(pack.positions[cid]?.[a.id]) <= 0) continue
        if (!out.has(a.id)) out.set(a.id, new Set())
        out.get(a.id).add(cid)
      }
  return out
})
const budgetIds = allIds.filter(id => map[id] && map[id].status !== 'sans-effet')
const covered = id => map[id].status === 'chiffrable' || map[id].status === 'a-regler'
const coverageOf = (ids, sign) => {
  const xs = ids.filter(id => map[id].deficit === sign)
  return { n: xs.length, covered: xs.filter(covered).length, priced: xs.filter(id => map[id].status === 'chiffrable').length }
}
const blocIds = (b, without) => [...carried[b].entries()].filter(([, who]) => !without || [...who].some(c => c !== without)).map(([id]) => id).filter(id => budgetIds.includes(id))

console.log('\nG1, couverture signée (approches que portent les candidats du bloc, part chiffrable ou à régler)')
const g1 = { creuse: [], reduit: [], pricedCreuse: [], pricedReduit: [] }
for (const [b] of P.panel.entries()) {
  const ids = blocIds(b)
  const c = coverageOf(ids, 'creuse')
  const r = coverageOf(ids, 'reduit')
  g1.creuse.push(c.n ? c.covered / c.n : null)
  g1.reduit.push(r.n ? r.covered / r.n : null)
  g1.pricedCreuse.push(c.n ? c.priced / c.n : null)
  g1.pricedReduit.push(r.n ? r.priced / r.n : null)
  const levers = new Set(ids.filter(id => map[id].status === 'chiffrable').map(id => map[id].lever ?? id))
  console.log(
    `  ${SH[b].padEnd(11)} creusent : ${c.covered}/${c.n} couvertes (${r1(pct(c.covered, c.n))} %), chiffrables ${c.priced} · ` +
      `réduisent : ${r.covered}/${r.n} (${r1(pct(r.covered, r.n))} %), chiffrables ${r.priced} · leviers chiffrables ${levers.size}${levers.size < MIN_VERDICT ? ' (non établi)' : ''}`,
  )
}
// Avec et sans chaque candidat : le pire écart entre blocs
let worst = { creuse: ratio(g1.creuse), reduit: ratio(g1.reduit) }
const worstWho = { creuse: null, reduit: null }
for (const cid of P.ranked) {
  const b = P.blocOf(cid)
  for (const sign of ['creuse', 'reduit']) {
    const xs = g1[sign].slice()
    const c = coverageOf(blocIds(b, cid), sign)
    xs[b] = c.n ? c.covered / c.n : null
    const r = ratio(xs)
    if (r !== null && (worst[sign] === null || r > worst[sign])) {
      worst[sign] = r
      worstWho[sign] = `sans ${cid} : ${SH[b]} ${c.covered}/${c.n}`
    }
  }
}
const g1Pass = worst.creuse !== null && worst.reduit !== null && worst.creuse <= RATIO && worst.reduit <= RATIO
console.log(`  écart (meilleur / moins bon bloc) : creusent ${fmtRatio(ratio(g1.creuse))}, réduisent ${fmtRatio(ratio(g1.reduit))} ; pire avec ou sans un candidat : ${fmtRatio(worst.creuse)} / ${fmtRatio(worst.reduit)} (seuil ${RATIO})`)
console.log(`  pire cas : creusent ${worstWho.creuse ?? 'avec tous'} · réduisent ${worstWho.reduit ?? 'avec tous'}`)
console.log(`  chiffrables seulement : creusent ${fmtRatio(ratio(g1.pricedCreuse))}, réduisent ${fmtRatio(ratio(g1.pricedReduit))}`)

// G4 : leviers atteignables dans le sens de chaque bloc
console.log('\nG4, leviers que chaque bloc peut faire bouger dans son sens (chiffrables et à régler)')
const reach = P.panel.map((_, b) => {
  const s = new Set()
  for (const id of blocIds(b)) {
    const e = map[id]
    if (!covered(id)) continue
    if (e.status === 'chiffrable') s.add(`${e.lever ?? id}|${e.setting ?? ''}`)
    else for (const l of expand(e.lever ?? id)) if (eligible.has(l)) s.add(`${l}|${directionOf(e) ?? '?'}`)
  }
  return s
})
const reachLevers = reach.map(s => new Set([...s].map(k => k.split('|')[0])))
reach.forEach((s, b) => console.log(`  ${SH[b].padEnd(11)} ${reachLevers[b].size} leviers, ${s.size} réglages`))
const g4Ratio = ratio(reachLevers.map(s => s.size))
console.log(`  écart : ${fmtRatio(g4Ratio)} (seuil ${RATIO})`)

// L'amorce sur les clones et les feuilles d'essai
const lean = (base, seed) => {
  // Un clone qui dit aussi « d'accord » à une approche de plus, sur 30 % des questions qu'il a remplies
  const rand = mulberry32(hashString(seed))
  const out = new Map()
  for (const q of Q) {
    const v = base.get(q.id)
    if (!v) continue
    const o = v.slice()
    if (rand() < 0.3) {
      const others = o.map((x, i) => (x !== 1 ? i : -1)).filter(i => i >= 0)
      if (others.length) o[others[Math.floor(rand() * others.length)]] = 1
    }
    out.set(q.id, o)
  }
  return out
}
const measure = answers => {
  const s = seedBudget(Q, answers, map, { directionsOnly: DIRECTIONS_ONLY })
  const pricedConflicts = s.conflicts.filter(c => c.approachIds.every(id => map[id]?.status === 'chiffrable')).length
  return {
    priced: s.priced.length + pricedConflicts,
    creuse: s.priced.filter(l => l.entry.deficit === 'creuse').length,
    reduit: s.priced.filter(l => l.entry.deficit === 'reduit').length,
    open: s.open.length,
    unpriced: s.unpriced.length,
    conflicts: s.conflicts.length,
  }
}
const kinds = [
  ['large', cid => [P.cloneLarge(cid)]],
  ['bruité', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`))],
  ['rapide, bruité', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`))],
  ['plusieurs accords', cid => Array.from({ length: NOISY }, (_, s) => lean(P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`), `l:${cid}:${s}`))],
  ['rapide, plusieurs accords', cid => Array.from({ length: NOISY }, (_, s) => lean(P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`), `lq:${cid}:${s}`))],
]
const seeds = {}
console.log(`\nG0 et G5, l'amorce (${NOISY} clones bruités par candidat classé) : lignes chiffrées, dont creusent / réduisent, leviers à régler, idées sans chiffre, à trancher ; part des amorces où les lignes qui creusent l'emportent`)
for (const [kind, make] of kinds) {
  const perBloc = P.panel.map(() => [])
  for (const cid of P.ranked) for (const v of make(cid)) perBloc[P.blocOf(cid)].push(measure(P.toAnswers(v)))
  seeds[kind] = perBloc
  console.log(`  ${kind}`)
  perBloc.forEach((ms, b) =>
    console.log(
      `    ${SH[b].padEnd(11)} chiffrées médiane ${median(ms.map(m => m.priced))} (creusent ${r1(mean(ms.map(m => m.creuse)))} / réduisent ${r1(mean(ms.map(m => m.reduit)))}) · ` +
        `à régler ${r1(mean(ms.map(m => m.open)))} · sans chiffre ${r1(mean(ms.map(m => m.unpriced)))} · à trancher ${r1(mean(ms.map(m => m.conflicts)))} · ` +
        `creusent > réduisent ${r1(pct(ms.filter(m => m.creuse > m.reduit).length, ms.length))} %`,
    ),
  )
}
console.log(`\nFeuilles d'essai (${N} par schéma, banque entière ; autant sur le seul questionnaire rapide)`)
const fake = {}
for (const scope of ['banque', 'rapide']) {
  for (const scheme of SCHEMES) {
    const ms = Array.from({ length: N }, (_, s) => measure(P.toAnswers(P.randomProfile(`budget:${scope}:${scheme}:${s}`, scheme, scope === 'rapide' ? isQuick : undefined))))
    fake[`${scope}.${scheme}`] = ms
    console.log(
      `  ${scope.padEnd(6)} ${scheme.padEnd(14)} chiffrées médiane ${median(ms.map(m => m.priced))} (creusent ${r1(mean(ms.map(m => m.creuse)))} / réduisent ${r1(mean(ms.map(m => m.reduit)))}) · ` +
        `à régler ${r1(mean(ms.map(m => m.open)))} · à trancher ${r1(mean(ms.map(m => m.conflicts)))} · creusent > réduisent ${r1(pct(ms.filter(m => m.creuse > m.reduit).length, ms.length))} %`,
    )
  }
}

// Règles d'arrêt
const quickAll = seeds['rapide, bruité'].flat()
const quickMedian = median(quickAll.map(m => m.priced))
const perBlocLevers = reachLevers.map(s => s.size)
const quickOpenMedian = median(quickAll.map(m => m.open))
const fullOpenMedian = median(seeds['bruité'].flat().map(m => m.open))
const rules = [
  { rule: `au moins ${STOP.minLevers} leviers retenus`, value: usable.size, pass: usable.size >= STOP.minLevers },
  { rule: `au moins ${STOP.minLeversPerBloc} leviers qui comptent pour chaque bloc`, value: perBlocLevers.join(' / '), pass: perBlocLevers.every(n => n >= STOP.minLeversPerBloc) },
  ...(DIRECTIONS_ONLY
    ? [{ rule: `G4 : écart entre blocs au plus ${RATIO} (leviers dans leur sens)`, value: fmtRatio(g4Ratio), pass: g4Ratio !== null && g4Ratio <= RATIO }]
    : [{ rule: `au moins ${STOP.minQuickPricedLines} lignes chiffrées au rapide (${STOP.quickPricedLinesStatistic})`, value: quickMedian, pass: quickMedian >= STOP.minQuickPricedLines }]),
  { rule: `G1 : écart entre blocs au plus ${STOP.g1RatioMax}, avec et sans chaque candidat`, value: `${fmtRatio(worst.creuse)} / ${fmtRatio(worst.reduit)}`, pass: g1Pass },
]
if (DIRECTIONS_ONLY) console.log(`\nLeviers à régler amorcés (médiane des clones bruités) : ${quickOpenMedian} au seul questionnaire rapide, ${fullOpenMedian} à la banque entière`)
console.log('\nRègles d\'arrêt (budget-decisions.json, fixées le 17/10 avant la mesure)')
for (const r of rules) console.log(`  ${r.pass ? 'passe     ' : 'NE PASSE PAS'}  ${r.rule} : ${r.value}`)
const go = rules.every(r => r.pass)
console.log(`\nVerdict : ${go ? (DIRECTIONS_ONLY ? 'ALLER — la version « À régler » peut passer aux maquettes' : 'ALLER — le jeu complet peut passer à la recherche des chiffrages') : DIRECTIONS_ONLY ? 'NE PASSE PAS — retirer la composante en cause, ne jamais retoucher les bornes ni les seuils' : `REPLI — ${STOP.fallback}`}`)

if (JSON_OUT)
  process.stdout.write(
    JSON.stringify({
      tool: 'budget-pregate',
      map: MAP_FILE,
      statuses: byStatus,
      levers: { priced: [...pricedLevers], open: [...openLevers], outside: [...unknownOpen], usable: usable.size },
      g1: { ...g1, worst },
      g4: perBlocLevers,
      quickMedian,
      variant: DIRECTIONS_ONLY ? 'a-regler' : 'complet',
      rules,
      go,
    }) + '\n',
  )
