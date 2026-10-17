// Audit de la croix des lignes rouges de « Mon profil politique » (lot 2, A1 ; ui/profile/rows.ts, crossingsOf) : le
// contrôle de neutralité bloc par bloc (D5, décision du propriétaire du 15 octobre 2026) d'un élément qui ne crée, ne
// change ni ne qualifie aucune lecture. Sur des clones bruités de chaque candidat classé (graines « n:<id>:<s> » et
// « nq:<id>:<s> » de tools/audit-echiquier.mjs), avec et sans le candidat dans le calcul, deux lignes rouges posées parmi
// leurs « pas d'accord » (une entrée de test, tirée d'une graine) selon trois scénarios : sans viser personne ; parmi les
// approches que porte un candidat d'un bloc voisin ; parmi celles d'un candidat de l'autre côté du centre (pour un clone
// du centre, les deux bouts). Il imprime, bloc vrai par bloc vrai, la part des lignes lues nettement (rows.read) qui
// montrent une croix, ses intervalles de Wilson à 95 %, l'écart entre blocs et sa fourchette, comparés à la référence du
// même passage (la part des sujets mis à l'épreuve lus nettement) : passe, ne passe pas, non établi ; puis la part de
// « pourrait franchir » parmi les noms cités, par bloc de la croix et par bloc vrai, avec son issue, les trois scénarios
// réunis, contre la même référence ; les noms « mêlés » (une ligne rouge sûrement franchie, une autre seulement
// possible, sur la même ligne : seule la première compte) ; enfin les feuilles remplies par un programme, sans suivre
// aucun candidat (schéma « audit »), avec deux lignes rouges de même. Le calcul même de la page
// (readEchiquier, chartRows, crossingsOf, computeResults). Les chiffres publiés sont dans ECHIQUIER_CROSS
// (src/core/echiquierMethodCopy.ts) ; à refaire après une mise à jour des positions.
//
// Usage : node tools/audit-croix.mjs [<id>] [--noisy 30] [--quick] [--sheets 200] [--json]
//   <id>      : l'élection (par défaut presidentielle-2027) ; elle doit avoir un axe (election.spectrum.axis)
//   --noisy   : clones bruités par candidat (60 pour ECHIQUIER_CROSS : la porte D5 en demande 60 pour un verdict, 30
//               ne donnent qu'une indication)
//   --quick   : refaire la mesure sur le seul questionnaire rapide (lignes de famille surtout)
//   --sheets  : feuilles d'essai sur la banque entière (cinq fois plus au rapide) ; 0 pour s'en passer
//   --json    : le même calcul ; le rapport lisible passe sur stderr, et stdout ne reçoit qu'une ligne JSON (contrat de
//               la veille, tools/veille/CONTRACT.md, c.10 AUDIT_JSON), pour tools/veille/remeasure.mjs :
//               { tool: 'audit-croix', electionId, options: { noisy, quick, sheets }, measured, extra }
//     measured : la forme de ECHIQUIER_CROSS, sans measured ni clones, à 0,1 près : random, neighbour, other
//                ({ withMin, withMax, withoutMin, withoutMax }), gapMax, reference ([avec, sans]), possible ([min, max]),
//                possibleBlocs ({ low, lowWhere, high, highWhere, withoutLow, withoutHigh }, par bloc de la croix) et
//                deduced ({ low, lowWhere, high, highWhere }, des données : le calcul de tests/echiquier-copy.test.ts) ;
//                avec --quick, en plus (le passage refait aussi la banque, aux mêmes graines) : quick ({ random,
//                neighbour, other, gapMax des deux scénarios qui passent, neighbourGap [avec, sans], reference }),
//                possibleQuick et possibleBlocsQuick ;
//     extra    : blocs (election.spectrum.axis[].bloc, dans l'ordre) et where (leurs mots) ; verdicts, par écart
//                D5 : « random|neighbour|other|possibleBlocs|possibleTrue » + « .with|.without », préfixés « quick. »
//                au rapide (possibleBlocs : par bloc de la croix ; possibleTrue : par bloc vrai) ; gaps, aux mêmes
//                clés : { gap, low, high, reference } en points ; deducedBlocs (les 5 parts de deduced, dans l'ordre
//                de l'axe) ; possibleBlocsByBloc (et possibleBlocsQuickByBloc) : { with, without }, la part de chaque
//                bloc de la croix (null sans nom cité) ; mixed (et mixedQuick) : { with, without }, les noms mêlés ;
//                sheets ({ bank, quick } : la part des lignes lues qui montrent une croix, si --sheets n'est pas 0)
// Il faut Node 22.18+ (TypeScript sans compilation).
import { importSite, useSiteModules } from './site-modules.mjs'

const argv = process.argv.slice(2)
const OPTIONS = ['--noisy', '--sheets']
const opt = (name, fallback) => {
  const i = argv.indexOf(name)
  return i < 0 ? fallback : Number(argv[i + 1])
}
const id = argv.find((a, i) => !a.startsWith('--') && !OPTIONS.includes(argv[i - 1])) ?? 'presidentielle-2027'
const NOISY = opt('--noisy', 60)
const SHEETS = opt('--sheets', 200)
const QUICK = argv.includes('--quick')
const JSON_OUT = argv.includes('--json')
// --json : le rapport lisible, inchangé, passe sur stderr ; stdout ne reçoit que la ligne JSON de la fin
if (JSON_OUT) console.log = console.error

useSiteModules()
const { elections } = await importSite('src/elections/all.ts')
const pack = elections.find(p => p.election.id === id)
if (!pack?.election.spectrum?.axis?.length) {
  console.error(`${id} : élection inconnue, ou sans axe de la grille (${elections.map(p => p.election.id).join(', ')})`)
  process.exit(2)
}
const { readEchiquier } = await importSite('src/core/echiquier.ts')
const { computeResults, dealbreakerLevel } = await importSite('src/core/score.ts')
const { chartRows, crossingsOf, hitsOf } = await importSite('src/ui/profile/rows.ts')
const { profilesFor, isQuick } = await importSite('tests/fixtures/echiquier-profiles.ts')
const { hashString, mulberry32 } = await importSite('src/core/rng.ts')
const P = profilesFor(pack)
const SH = pack.election.spectrum.axis.map(a => a.short)
const B = SH.length
const C = (B - 1) / 2
const groups = pack.topicGroups
const topicOf = new Map(pack.bank.questions.map(q => [q.id, q.topicId]))
const order = pack.bank.topics.map(t => t.id)
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
/** Écart entre le bloc le plus haut et le plus bas, et sa fourchette tirée des intervalles (comme l'audit) */
const gapOf = cells => {
  const ok = cells.filter(c => c.n)
  const ps = ok.map(c => pct(c.k, c.n))
  const ci = ok.map(c => wilson(c.k, c.n))
  return {
    gap: Math.max(...ps) - Math.min(...ps),
    low: Math.max(0, Math.max(...ci.map(x => x[0])) - Math.min(...ci.map(x => x[1]))),
    high: Math.max(...ci.map(x => x[1])) - Math.min(...ci.map(x => x[0])),
  }
}
const verdictOf = (g, ref) => (g.high < ref ? 'passe' : g.low > ref ? 'ne passe pas' : 'non établi')
const row = cells => cells.map((c, b) => `${SH[b]} ${c.n ? `${c.k}/${c.n} ${r1(pct(c.k, c.n))} % [${r1(wilson(c.k, c.n)[0])}–${r1(wilson(c.k, c.n)[1])}]` : '–'}`).join(' | ')

/** Les blocs d'un candidat de l'axe qui porte une approche (poids > 0 : celle qu'une ligne rouge peut viser) */
const carriersBlocs = (qid, aid) => {
  const out = new Set()
  P.panel.forEach((ids, b) => {
    for (const id of ids) if (dealbreakerLevel(pack.positions[id]?.[aid])) out.add(b)
  })
  return out
}
const neighbours = t => [t - 1, t + 1].filter(b => b >= 0 && b < B)
const otherSide = t => (t < C ? [...Array(B).keys()].filter(b => b > C) : t > C ? [...Array(B).keys()].filter(b => b < C) : [0, B - 1])
/**
 * Les trois scénarios, par leur nom à l'écran ; seed : le mot de leur graine (« croix:<mot>:<id>:<s> »), gardé tel que
 * mesuré le 15 octobre 2026 pour que les chiffres publiés se refassent à l'identique
 */
const SCENARIOS = {
  'sans viser personne': { seed: 'hasard', ok: () => () => true },
  'un bloc voisin': { seed: 'voisin', ok: t => (q, a) => neighbours(t).some(b => carriersBlocs(q, a).has(b)) },
  'l’autre côté': { seed: 'autre côté', ok: t => (q, a) => otherSide(t).some(b => carriersBlocs(q, a).has(b)) },
}

/** Deux lignes rouges parmi les « pas d'accord » qui passent le filtre, tirées d'une graine (une entrée de test) */
function withRedLines(answers, seed, ok) {
  const rand = mulberry32(hashString(seed))
  const pool = []
  for (const [qid, a] of Object.entries(answers)) for (const [aid, r] of Object.entries(a.ratings)) if (r === -1 && ok(qid, aid)) pool.push([qid, aid])
  const out = Object.fromEntries(Object.entries(answers).map(([q, a]) => [q, { ...a, redLines: [] }]))
  for (let k = 0; k < 2 && pool.length; k++) {
    const [qid, aid] = pool.splice(Math.floor(rand() * pool.length), 1)[0]
    out[qid].redLines.push(aid)
  }
  return { answers: out }
}

const blank = () => SH.map(() => ({ k: 0, n: 0 }))
/** sink : reçoit, pour --json, les comptes de « pourrait franchir » bloc par bloc, sans rien changer au rapport */
function run(kind, makeClones, sink = {}) {
  console.log(`\n=== ${kind} : ${NOISY} clones bruités par candidat, ${P.ranked.length} candidats ===`)
  const summary = {}
  const pooled = {}
  for (const without of [false, true]) {
    const ref = blank() // lignes lues nettement / sujets mis à l'épreuve, par bloc vrai
    const per = Object.fromEntries(Object.keys(SCENARIOS).map(s => [s, { show: blank(), possibleByCross: blank(), possibleByTrue: blank(), whoBloc: SH.map(() => 0), noPool: 0, mixed: 0 }]))
    for (const cid of P.ranked) {
      const t = P.blocOf(cid)
      const panel = without ? P.panel.map(ids => ids.filter(id => id !== cid)) : P.panel
      for (const [s, v] of makeClones(cid).entries()) {
        const base = P.toAnswers(v)
        const reading = readEchiquier(pack, base, without ? { without: [cid] } : {})
        const rows = chartRows(groups, reading, label)
        ref[t].n += rows.read.length + rows.apart.length + rows.flat.length
        ref[t].k += rows.read.length
        for (const [name, { seed, ok }] of Object.entries(SCENARIOS)) {
          const acc = per[name]
          const { answers } = withRedLines(base, `croix:${seed}:${cid}:${s}`, ok(t))
          if (!Object.values(answers).some(a => a.redLines.length)) acc.noPool++
          const hits = hitsOf(computeResults(pack, answers, {}, 'd5'))
          for (const u of rows.read) {
            const cross = crossingsOf(u, hits, q => topicOf.get(q), order)
            const shown = cross.some(g => g.length)
            acc.show[t].n++
            if (shown) acc.show[t].k++
            cross.forEach((gs, b) => {
              for (const g of gs)
                for (const id of g.ids) {
                  // Mêlé : une ligne rouge de la ligne sûrement franchie, une autre seulement possible (la phrase ne dit
                  // que la première ; le détail dit l'autre)
                  if (g.level === 'touche' && hits.get(id)?.some(h => h.level === 'possible' && u.questions.includes(h.questionId))) acc.mixed++
                  acc.whoBloc[b]++
                  acc.possibleByCross[b].n++
                  acc.possibleByTrue[t].n++
                  if (g.level === 'possible') {
                    acc.possibleByCross[b].k++
                    acc.possibleByTrue[t].k++
                  }
                }
            })
          }
        }
      }
    }
    const w = without ? 'sans le candidat' : 'avec le candidat'
    const rg = gapOf(ref)
    console.log(`\n-- ${w}`)
    console.log(`  référence, sujets lus nettement : ${row(ref)} · écart ${r1(rg.gap)} pts [${r1(rg.low)}–${r1(rg.high)}]`)
    summary[w] = { ref: rg, scen: {} }
    for (const [name, acc] of Object.entries(per)) {
      const g = gapOf(acc.show)
      const tot = acc.show.reduce((a, c) => ({ k: a.k + c.k, n: a.n + c.n }), { k: 0, n: 0 })
      const ptot = acc.possibleByCross.reduce((a, c) => ({ k: a.k + c.k, n: a.n + c.n }), { k: 0, n: 0 })
      const verdict = verdictOf(g, rg.gap)
      const whoTot = acc.whoBloc.reduce((a, b) => a + b, 0)
      console.log(`  ${name.padEnd(20)} croix sur ${tot.k}/${tot.n} lignes lues, ${r1(pct(tot.k, tot.n))} %`)
      console.log(`    par bloc vrai : ${row(acc.show)}`)
      console.log(`    écart ${r1(g.gap)} pts [${r1(g.low)}–${r1(g.high)}] ; référence ${r1(rg.gap)} pts : ${verdict}`)
      console.log(`    « pourrait franchir » : ${ptot.k}/${ptot.n} noms, ${r1(pct(ptot.k, ptot.n))} % ; par bloc de la croix : ${row(acc.possibleByCross)}`)
      console.log(`    « pourrait franchir », par bloc vrai : ${row(acc.possibleByTrue)}`)
      console.log(`    noms cités, par bloc de la croix : ${acc.whoBloc.map((n, b) => `${SH[b]} ${n} (${r1(pct(n, whoTot))} %)`).join(' · ')} ; mêlés ${acc.mixed} ; clones sans ligne rouge possible ${acc.noPool}`)
      const byBloc = acc.show.filter(c => c.n).map(c => pct(c.k, c.n))
      pooled[w] ??= { cross: blank(), true: blank(), mixed: 0 }
      pooled[w].mixed += acc.mixed
      for (const [to, from] of [[pooled[w].cross, acc.possibleByCross], [pooled[w].true, acc.possibleByTrue]])
        from.forEach((c, b) => {
          to[b].k += c.k
          to[b].n += c.n
        })
      summary[w].scen[name] = { all: pct(tot.k, tot.n), min: Math.min(...byBloc), max: Math.max(...byBloc), gap: g, verdict, possible: pct(ptot.k, ptot.n), possibleBlocs: acc.possibleByCross.map(c => (c.n ? pct(c.k, c.n) : null)), mixed: acc.mixed }
    }
    // « Pourrait franchir », les trois scénarios réunis : sa part parmi les noms cités, bloc par bloc, contre la référence
    // du même passage (la règle D5 d'un élément qui ne crée aucune lecture)
    for (const by of ['cross', 'true']) {
      const cells = pooled[w][by]
      const g = gapOf(cells)
      const ps = cells.filter(c => c.n).map(c => pct(c.k, c.n))
      const verdict = verdictOf(g, rg.gap)
      console.log(`  « pourrait franchir », trois scénarios réunis, ${w}, par bloc ${by === 'cross' ? 'de la croix' : 'vrai'} : ${row(cells)}`)
      console.log(`    écart ${r1(g.gap)} pts [${r1(g.low)}–${r1(g.high)}] ; référence ${r1(rg.gap)} pts : ${verdict}`)
      summary[w][`possible-${by}`] = { min: Math.min(...ps), max: Math.max(...ps), blocs: cells.map(c => (c.n ? `${c.k}/${c.n}` : null)), gap: g, verdict }
    }
    console.log(`  noms mêlés, trois scénarios réunis : ${pooled[w].mixed}`)
    summary[w].mixed = pooled[w].mixed
    sink[w] = { cross: pooled[w].cross, true: pooled[w].true }
  }
  return summary
}

const t0 = Date.now()
console.log(`Croix des lignes rouges : audit de ${id}, ${P.ranked.length} candidats sur l'axe, ${NOISY} clones bruités par candidat`)
const sinks = { bank: {}, quick: {} }
const bank = run('banque', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`)), sinks.bank)
console.log(`\n${JSON.stringify(bank)}`)
let quick = null
if (QUICK) {
  quick = run('questionnaire rapide seul', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`)), sinks.quick)
  console.log(`\n${JSON.stringify(quick)}`)
}

// Feuilles remplies par un programme, sans suivre aucun candidat (schéma « audit ») : deux lignes rouges, sans viser
// personne
const sheets = {}
if (SHEETS) {
  for (const only of [null, isQuick]) {
    let k = 0
    let n = 0
    for (let i = 0; i < (only ? 5 * SHEETS : SHEETS); i++) {
      const base = P.toAnswers(P.randomProfile(`audit-echiquier:audit${only ? '-rapide' : ''}:${i}`, 'audit', only ?? undefined))
      const rows = chartRows(groups, readEchiquier(pack, base), label)
      const { answers } = withRedLines(base, `croix:feuille:${i}`, () => true)
      const hits = hitsOf(computeResults(pack, answers, {}, 'd5'))
      for (const u of rows.read) {
        n++
        if (crossingsOf(u, hits, q => topicOf.get(q), order).some(g => g.length)) k++
      }
    }
    console.log(`\nFeuilles d’essai (audit${only ? ', rapide seul' : ''}), deux lignes rouges sans viser personne : croix sur ${k}/${n} lignes lues, ${r1(pct(k, n))} % [${r1(wilson(k, n)[0])}–${r1(wilson(k, n)[1])}]`)
    sheets[only ? 'quick' : 'bank'] = r1(pct(k, n))
  }
}
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`)

// --json : une ligne, les mêmes chiffres, à la forme de ECHIQUIER_CROSS (contrat de la veille, c.10 AUDIT_JSON)
if (JSON_OUT) {
  const WITH = 'avec le candidat'
  const WITHOUT = 'sans le candidat'
  const SCEN_KEYS = { 'sans viser personne': 'random', 'un bloc voisin': 'neighbour', 'l’autre côté': 'other' }
  const WHERE = pack.election.spectrum.axis.map(a => a.where)
  /** La part de chaque bloc (null sans effectif) */
  const perBloc = cells => cells.map(c => (c.n ? r1(pct(c.k, c.n)) : null))
  /** Le plus bas et le plus haut d'une suite de parts (null exclus), et leurs blocs (le premier en cas d'égalité) */
  const extremes = xs => {
    const ok = xs.filter(x => x !== null)
    const low = ok.length ? Math.min(...ok) : null
    const high = ok.length ? Math.max(...ok) : null
    return { low, lowWhere: low === null ? null : WHERE[xs.indexOf(low)], high, highWhere: high === null ? null : WHERE[xs.indexOf(high)] }
  }
  const verdicts = {}
  const gaps = {}
  const note = (key, g, ref, verdict) => {
    verdicts[key] = verdict
    gaps[key] = { gap: r1(g.gap), low: r1(g.low), high: r1(g.high), reference: r1(ref.gap) }
  }
  /** Les clés de ECHIQUIER_CROSS (ou de son quick) mesurées par un passage, et ses verdicts sous le préfixe donné */
  function pass(summary, sink, prefix) {
    const out = {}
    for (const [name, key] of Object.entries(SCEN_KEYS)) {
      const [a, b] = [summary[WITH].scen[name], summary[WITHOUT].scen[name]]
      out[key] = { withMin: r1(a.min), withMax: r1(a.max), withoutMin: r1(b.min), withoutMax: r1(b.max) }
      note(`${prefix}${key}.with`, a.gap, summary[WITH].ref, a.verdict)
      note(`${prefix}${key}.without`, b.gap, summary[WITHOUT].ref, b.verdict)
    }
    for (const [by, key] of [['cross', 'possibleBlocs'], ['true', 'possibleTrue']])
      for (const [w, tag] of [[WITH, 'with'], [WITHOUT, 'without']]) note(`${prefix}${key}.${tag}`, summary[w][`possible-${by}`].gap, summary[w].ref, summary[w][`possible-${by}`].verdict)
    const gapOfScen = names => r1(Math.max(...names.flatMap(n => [summary[WITH].scen[n].gap.gap, summary[WITHOUT].scen[n].gap.gap])))
    const possible = Object.keys(SCEN_KEYS).flatMap(n => [summary[WITH].scen[n].possible, summary[WITHOUT].scen[n].possible])
    const byBloc = { with: perBloc(sink[WITH].cross), without: perBloc(sink[WITHOUT].cross) }
    const lw = extremes(byBloc.with)
    const lo = extremes(byBloc.without)
    return {
      scen: out,
      gapAll: gapOfScen(Object.keys(SCEN_KEYS)),
      gapPassing: gapOfScen(['sans viser personne', 'l’autre côté']),
      neighbourGap: [r1(summary[WITH].scen['un bloc voisin'].gap.gap), r1(summary[WITHOUT].scen['un bloc voisin'].gap.gap)],
      reference: [r1(summary[WITH].ref.gap), r1(summary[WITHOUT].ref.gap)],
      possible: [r1(Math.min(...possible)), r1(Math.max(...possible))],
      possibleBlocs: { low: lw.low, lowWhere: lw.lowWhere, high: lw.high, highWhere: lw.highWhere, withoutLow: lo.low, withoutHigh: lo.high },
      byBloc,
      mixed: { with: summary[WITH].mixed, without: summary[WITHOUT].mixed },
    }
  }
  // La part des positions déduites, ou de confiance basse, parmi celles qu'une ligne rouge peut viser, bloc par bloc :
  // le calcul même de tests/echiquier-copy.test.ts (ECHIQUIER_CROSS.deduced), arrondi de même
  const deducedBlocs = P.panel.map(ids => {
    let n = 0
    let k = 0
    for (const cid of ids)
      for (const pos of Object.values(pack.positions[cid] ?? {})) {
        const level = dealbreakerLevel(pos)
        if (level) n++
        if (level === 'possible') k++
      }
    return n ? Math.round((1000 * k) / n) / 10 : null
  })
  const b = pass(bank, sinks.bank, '')
  const measured = { ...b.scen, gapMax: b.gapAll, reference: b.reference, possible: b.possible, possibleBlocs: b.possibleBlocs, deduced: extremes(deducedBlocs) }
  const extra = { blocs: pack.election.spectrum.axis.map(a => a.bloc), where: WHERE, verdicts, gaps, deducedBlocs, possibleBlocsByBloc: b.byBloc, mixed: b.mixed }
  if (quick) {
    const q = pass(quick, sinks.quick, 'quick.')
    measured.quick = { ...q.scen, gapMax: q.gapPassing, neighbourGap: q.neighbourGap, reference: q.reference }
    measured.possibleQuick = q.possible
    measured.possibleBlocsQuick = q.possibleBlocs
    extra.possibleBlocsQuickByBloc = q.byBloc
    extra.mixedQuick = q.mixed
  }
  if (SHEETS) extra.sheets = sheets
  process.stdout.write(`${JSON.stringify({ tool: 'audit-croix', electionId: id, options: { noisy: NOISY, quick: QUICK, sheets: SHEETS }, measured, extra })}\n`)
}
