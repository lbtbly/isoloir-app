// Audit de « Ce qui pèse le plus dans cette lecture » de « Mon profil politique » (lot 3, A3 ; core/echiquierWeigh.ts,
// ui/profile/Weigh.tsx) : le contrôle de neutralité bloc par bloc (D5, décision du propriétaire du 15 octobre 2026) d'un
// élément qui ne crée, ne change ni ne qualifie aucune lecture. Sur des clones bruités de chaque candidat classé (graines
// « n:<id>:<s> » et « nq:<id>:<s> » de tools/audit-echiquier.mjs), avec et sans le candidat dans le calcul, il imprime,
// bloc vrai par bloc vrai, pour les lignes lues nettement (rows.read) : la part qui montre une fiche (ou, sur des blocs
// non voisins, le renvoi au détail), puis, parmi les fiches, la part de chacune des quatre suites (approche principale ;
// compatible ; rejetée ; aucun ne la porte), avec leurs intervalles de Wilson à 95 %, l'écart entre blocs et sa
// fourchette, comparés à la référence du même passage (la part des sujets mis à l'épreuve lus nettement) : passe, ne passe
// pas, non établi. Puis les mêmes parts selon le bloc de la fiche ; la part de chaque candidat parmi les approches citées
// (les fiches des blocs où il compte, dont l'approche est la sienne en principal) ; « Aussi approche principale… » du
// détail ; les fiches où une question porte au moins la moitié de l'écart ; les restes de plus de 2 points (positions de
// confiance basse) ; enfin le temps d'ouverture d'une ligne de famille (le calcul de la fiche), et cinq fois plus pour un
// téléphone lent. Le calcul même de la page (readEchiquier, chartRows, weighOf). Les chiffres publiés sont dans
// ECHIQUIER_WEIGH (src/core/echiquierMethodCopy.ts) ; à refaire après une mise à jour des positions.
//
// Usage : node tools/audit-poids.mjs [<id>] [--noisy 60] [--quick]
//   <id>      : l'élection (par défaut presidentielle-2027) ; elle doit avoir un axe (election.spectrum.axis)
//   --noisy   : clones bruités par candidat (60 pour ECHIQUIER_WEIGH : la porte D5 en demande 60 pour un verdict, 30 ne
//               donnent qu'une indication)
//   --quick   : refaire la mesure sur le seul questionnaire rapide (lignes de famille surtout)
// Il faut Node 22.18+ (TypeScript sans compilation).
import { importSite, useSiteModules } from './site-modules.mjs'

const argv = process.argv.slice(2)
const OPTIONS = ['--noisy']
const opt = (name, fallback) => {
  const i = argv.indexOf(name)
  return i < 0 ? fallback : Number(argv[i + 1])
}
const id = argv.find((a, i) => !a.startsWith('--') && !OPTIONS.includes(argv[i - 1])) ?? 'presidentielle-2027'
const NOISY = opt('--noisy', 60)
const QUICK = argv.includes('--quick')

useSiteModules()
const { elections } = await importSite('src/elections/all.ts')
const pack = elections.find(p => p.election.id === id)
if (!pack?.election.spectrum?.axis?.length) {
  console.error(`${id} : élection inconnue, ou sans axe de la grille (${elections.map(p => p.election.id).join(', ')})`)
  process.exit(2)
}
const { readEchiquier } = await importSite('src/core/echiquier.ts')
const { weighOf } = await importSite('src/core/echiquierWeigh.ts')
const { stance } = await importSite('src/core/score.ts')
const { chartRows } = await importSite('src/ui/profile/rows.ts')
const { profilesFor, isQuick } = await importSite('tests/fixtures/echiquier-profiles.ts')
const P = profilesFor(pack)
const SH = pack.election.spectrum.axis.map(a => a.short)
const names = new Map(pack.candidates.map(c => [c.id, c.name]))
const groups = pack.topicGroups
const label = u => u.id
const r1 = x => Math.round(x * 10) / 10
const pct = (a, b) => (b ? (100 * a) / b : 0)
const wilson = (k, n) => {
  if (!n) return [0, 0]
  const z = 1.959964
  const p = k / n
  const d = 1 + (z * z) / n
  const c = (p + (z * z) / (2 * n)) / d
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d
  return [100 * (c - h), 100 * (c + h)]
}
/** Écart entre le bloc le plus haut et le plus bas, et sa fourchette tirée des intervalles (comme l'audit de la croix) */
const gapOf = cells => {
  const ok = cells.filter(c => c.n)
  const ps = ok.map(c => pct(c.k, c.n))
  const ci = ok.map(c => wilson(c.k, c.n))
  return {
    gap: Math.max(...ps) - Math.min(...ps),
    low: Math.max(0, Math.max(...ci.map(x => x[0])) - Math.min(...ci.map(x => x[1]))),
    high: Math.max(...ci.map(x => x[1])) - Math.min(...ci.map(x => x[0])),
    min: Math.min(...ps),
    max: Math.max(...ps),
  }
}
const verdictOf = (g, ref) => (g.high < ref ? 'passe' : g.low > ref ? 'ne passe pas' : 'non établi')
const row = cells => cells.map((c, b) => `${SH[b]} ${c.n ? `${c.k}/${c.n} ${r1(pct(c.k, c.n))} % [${r1(wilson(c.k, c.n)[0])}–${r1(wilson(c.k, c.n)[1])}]` : '–'}`).join(' | ')
const blank = () => SH.map(() => ({ k: 0, n: 0 }))
const SUITES = ['principale', 'compatible', 'rejet', 'aucun']

/** Le temps de chaque ouverture d'une ligne de famille, en ms : le calcul de sa fiche */
const famTimes = []

function run(kind, makeClones) {
  console.log(`\n=== ${kind} : ${NOISY} clones bruités par candidat, ${P.ranked.length} candidats ===`)
  const summary = {}
  for (const without of [false, true]) {
    const ref = blank()
    const shown = blank() // lignes lues nettement qui montrent une fiche ou le renvoi, par bloc vrai
    const bySuiteTrue = Object.fromEntries(SUITES.map(s => [s, blank()]))
    const bySuiteFiche = Object.fromEntries(SUITES.map(s => [s, blank()]))
    const cited = new Map(P.ranked.map(c => [c, { k: 0, n: 0 }]))
    let fiches = 0
    let renvois = 0
    let none = 0
    let also = 0
    let half = 0
    let rest2 = 0
    for (const cid of P.ranked) {
      const t = P.blocOf(cid)
      const opts = without ? { without: [cid] } : {}
      const panel = without ? P.panel.map(ids => ids.filter(x => x !== cid)) : P.panel
      for (const v of makeClones(cid)) {
        const answers = P.toAnswers(v)
        const reading = readEchiquier(pack, answers, opts)
        const rows = chartRows(groups, reading, label)
        ref[t].n += rows.read.length + rows.apart.length + rows.flat.length
        ref[t].k += rows.read.length
        for (const u of rows.read) {
          const t0 = performance.now()
          const ws = weighOf(pack, answers, u, opts)
          if (u.kind === 'famille' && !without) famTimes.push(performance.now() - t0)
          const card = ws.length === 1 && ws[0].suite
          const elsewhere = ws.length > 1 && ws.every(w => w.suite)
          shown[t].n++
          if (card || elsewhere) shown[t].k++
          if (elsewhere) renvois++
          if (!card && !elsewhere) none++
          if (!card) continue
          const w = ws[0]
          fiches++
          for (const s of SUITES) {
            bySuiteTrue[s][t].n++
            if (w.suite === s) bySuiteTrue[s][t].k++
            for (const b of w.seg) {
              bySuiteFiche[s][b].n++
              if (w.suite === s) bySuiteFiche[s][b].k++
            }
          }
          if (w.alsoBlocs.length) also++
          if (Math.max(...w.parts) >= w.gap / 2) half++
          if (Math.abs(w.rest) > 2) rest2++
          // Les candidats des blocs de la fiche : l'approche citée est-elle leur approche principale ?
          for (const b of w.seg)
            for (const c of panel[b]) {
              const x = cited.get(c)
              x.n++
              if (stance(pack.positions[c]?.[w.approach]) === 2) x.k++
            }
        }
      }
    }
    const w = without ? 'sans le candidat' : 'avec le candidat'
    const rg = gapOf(ref)
    const sg = gapOf(shown)
    console.log(`\n-- ${w}`)
    console.log(`  référence, sujets lus nettement : ${row(ref)} · écart ${r1(rg.gap)} pts [${r1(rg.low)}–${r1(rg.high)}]`)
    console.log(`  fiche ou renvoi montrés : ${row(shown)} · écart ${r1(sg.gap)} pts [${r1(sg.low)}–${r1(sg.high)}] : ${verdictOf(sg, rg.gap)}`)
    console.log(`  ${fiches} fiches, ${renvois} renvois au détail, ${none} lignes sans fiche ; « Aussi approche principale » ${r1(pct(also, fiches))} % ; une question porte la moitié de l’écart ou plus ${r1(pct(half, fiches))} % ; reste de plus de 2 points ${r1(pct(rest2, fiches))} %`)
    summary[w] = { ref: rg, shown: sg, shownVerdict: verdictOf(sg, rg.gap), fiches, renvois, none, also: pct(also, fiches), half: pct(half, fiches), rest2: pct(rest2, fiches), suites: {} }
    for (const s of SUITES) {
      const cells = bySuiteTrue[s]
      const g = gapOf(cells)
      const tot = cells.reduce((a, c) => ({ k: a.k + c.k, n: a.n + c.n }), { k: 0, n: 0 })
      const verdict = verdictOf(g, rg.gap)
      console.log(`  ${s.padEnd(11)} ${tot.k}/${tot.n} fiches, ${r1(pct(tot.k, tot.n))} %`)
      console.log(`    par bloc vrai : ${row(cells)}`)
      console.log(`    écart ${r1(g.gap)} pts [${r1(g.low)}–${r1(g.high)}] ; référence ${r1(rg.gap)} pts : ${verdict}`)
      console.log(`    par bloc de la fiche : ${row(bySuiteFiche[s])}`)
      summary[w].suites[s] = { all: pct(tot.k, tot.n), min: g.min, max: g.max, gap: g, verdict, fiche: bySuiteFiche[s].map(c => (c.n ? r1(pct(c.k, c.n)) : null)) }
    }
    const per = [...cited].filter(([, x]) => x.n).map(([c, x]) => [c, pct(x.k, x.n), x.n])
    console.log(`  approche citée, l’approche principale du candidat (parmi les fiches de son bloc) : ${per.map(([c, p, n]) => `${names.get(c)} ${r1(p)} % (${n})`).join(' · ')}`)
    const ps = per.map(x => x[1])
    summary[w].cited = { min: Math.min(...ps), max: Math.max(...ps), low: names.get(per.find(x => x[1] === Math.min(...ps))[0]), high: names.get(per.find(x => x[1] === Math.max(...ps))[0]) }
  }
  return summary
}

const t0 = Date.now()
console.log(`Ce qui pèse le plus : audit de ${id}, ${P.ranked.length} candidats sur l'axe, ${NOISY} clones bruités par candidat`)
const bank = run('banque', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`)))
console.log(`\n${JSON.stringify(bank)}`)
if (QUICK) {
  const quick = run('questionnaire rapide seul', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`)))
  console.log(`\n${JSON.stringify(quick)}`)
}
famTimes.sort((a, b) => a - b)
const q = f => famTimes[Math.min(famTimes.length - 1, Math.floor(f * famTimes.length))]
console.log(
  `\nOuverture d’une ligne de famille (calcul de la fiche, ${famTimes.length} lignes) : médiane ${r1(q(0.5))} ms, 99e centile ${r1(q(0.99))} ms, au plus ${r1(famTimes.at(-1))} ms ; × 5 (téléphone lent) : ${r1(5 * q(0.5))}, ${r1(5 * q(0.99))} et ${r1(5 * famTimes.at(-1))} ms`,
)
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`)
