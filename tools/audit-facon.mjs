// Audit de « Votre façon de répondre » de « Mon profil politique » (lot 4, A5 ; ui/profile/rows.ts, mannerOf) : quand la
// phrase paraît, et le contrôle de neutralité bloc par bloc (D5, décision du propriétaire du 15 octobre 2026) d'un
// élément qui ne crée, ne change ni ne qualifie aucune lecture. Il imprime son taux d'affichage, et de quel côté
// (« éloigné » ou « proche »), avec ses intervalles de Wilson à 95 % :
// - par façon de répondre, sur des feuilles remplies par un programme, sans suivre aucun candidat (les six schémas de
//   tests/fixtures/echiquier-profiles.ts, graines « audit-facon:<schéma>:<i> »), sur la banque entière puis sur le seul
//   questionnaire rapide ; les avis uniformes (C9), où la phrase ne paraît jamais, comptés à part ;
// - sur les clones larges et stricts de chaque candidat classé (un par candidat), pour mémoire ;
// - bloc vrai par bloc vrai, sur des clones bruités de chaque candidat classé (graines « n:<id>:<s> » et « nq:<id>:<s> »
//   de tools/audit-echiquier.mjs), avec et sans le candidat dans le calcul : la part des feuilles qui montrent la phrase,
//   l'écart entre blocs et sa fourchette, comparés à la référence du même passage (la part des sujets mis à l'épreuve
//   lus nettement, celle des audits de la croix et de « Ce qui pèse le plus ») : passe, ne passe pas, non établi ; et ce
//   que ces écarts suivent, la façon de répondre des clones de chaque bloc (la part des « pas d'accord » parmi leurs
//   avis).
// Le calcul même de la page (readEchiquier, chartRows, uniformViews, mannerOf). Les chiffres publiés sont dans
// ECHIQUIER_MANNER (src/core/echiquierMethodCopy.ts) ; à refaire après une mise à jour des positions.
//
// Usage : node tools/audit-facon.mjs [<id>] [--noisy 60] [--sheets 400] [--quick]
//   <id>      : l'élection (par défaut presidentielle-2027) ; elle doit avoir un axe (election.spectrum.axis)
//   --noisy   : clones bruités par candidat (60 pour ECHIQUIER_MANNER : la porte D5 en demande 60 pour un verdict, 30
//               ne donnent qu'une indication)
//   --sheets  : feuilles d'essai par schéma sur la banque entière (cinq fois plus au rapide) ; 0 pour s'en passer
//   --quick   : refaire la mesure des clones bruités sur le seul questionnaire rapide (lignes de famille surtout)
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
const SHEETS = opt('--sheets', 400)
const QUICK = argv.includes('--quick')

useSiteModules()
const { elections } = await importSite('src/elections/all.ts')
const pack = elections.find(p => p.election.id === id)
if (!pack?.election.spectrum?.axis?.length) {
  console.error(`${id} : élection inconnue, ou sans axe de la grille (${elections.map(p => p.election.id).join(', ')})`)
  process.exit(2)
}
const { readEchiquier } = await importSite('src/core/echiquier.ts')
const { chartRows, mannerOf, uniformViews } = await importSite('src/ui/profile/rows.ts')
const { profilesFor, isQuick, SCHEMES } = await importSite('tests/fixtures/echiquier-profiles.ts')
const P = profilesFor(pack)
const Q = pack.bank.questions
const SH = pack.election.spectrum.axis.map(a => a.short)
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
/** Écart entre le bloc le plus haut et le plus bas, et sa fourchette tirée des intervalles (comme les audits des lots 2 et 3) */
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
const share = (k, n) => `${k}/${n} ${r1(pct(k, n))} % [${r1(wilson(k, n)[0])}–${r1(wilson(k, n)[1])}]`
const row = cells => cells.map((c, b) => `${SH[b]} ${c.n ? share(c.k, c.n) : '–'}`).join(' | ')
const blank = () => SH.map(() => ({ k: 0, n: 0 }))

/** La façon de répondre : les avis donnés, et parmi eux les « pas d'accord » */
function noShare(answers) {
  const all = Object.values(answers).flatMap(a => Object.values(a.ratings))
  return { n: all.length, no: all.filter(r => r < 0).length }
}

/**
 * Ce que la page montrerait pour ces réponses : la phrase et son côté (comme ui/profile/Chart.tsx : rien avec des avis
 * uniformes), et ses lignes, pour la référence
 */
function look(answers, opts = {}) {
  const rows = chartRows(groups, readEchiquier(pack, answers, opts), label)
  const uniform = uniformViews(Q, answers)
  return { rows, uniform, manner: uniform ? null : mannerOf(rows, Q, answers) }
}

const t0 = Date.now()
console.log(`Votre façon de répondre : audit de ${id}, ${P.ranked.length} candidats sur l'axe`)
const out = {}

// Par façon de répondre : feuilles remplies par un programme, sans suivre aucun candidat
if (SHEETS) {
  console.log('\nFeuilles d’essai, remplies par un programme sans suivre aucun candidat : la phrase paraît sur')
  out.sheets = {}
  for (const only of [null, isQuick])
    for (const scheme of SCHEMES) {
      const n = only ? 5 * SHEETS : SHEETS
      let far = 0
      let near = 0
      let uniform = 0
      for (let i = 0; i < n; i++) {
        const r = look(P.toAnswers(P.randomProfile(`audit-facon:${scheme}${only ? '-rapide' : ''}:${i}`, scheme, only ?? undefined)))
        if (r.uniform) uniform++
        if (r.manner?.near === false) far++
        if (r.manner?.near) near++
      }
      const name = `${scheme}${only ? ', rapide seul' : ''}`
      console.log(`  ${name.padEnd(26)} ${share(far + near, n)} (« éloigné » ${far}, « proche » ${near}) ; avis uniformes ${uniform}`)
      out.sheets[name] = { all: r1(pct(far + near, n)), far: r1(pct(far, n)), near: r1(pct(near, n)), n, uniform }
    }
}

// Pour mémoire : un clone large et un clone strict par candidat, sur la banque puis au rapide
console.log('\nClones, un par candidat : la phrase paraît sur')
out.clones = {}
for (const [name, make] of [
  ['larges', id => P.cloneLarge(id)],
  ['stricts', id => P.cloneStrict(id)],
  ['larges, rapide seul', id => P.cloneLarge(id, isQuick)],
  ['stricts, rapide seul', id => P.cloneStrict(id, isQuick)],
]) {
  let far = 0
  let near = 0
  const who = []
  for (const cid of P.ranked) {
    const m = look(P.toAnswers(make(cid))).manner
    if (!m) continue
    if (m.near) near++
    else far++
    who.push(`${cid} (${m.near ? 'proche' : 'éloigné'})`)
  }
  console.log(`  ${name.padEnd(22)} ${share(far + near, P.ranked.length)} (« éloigné » ${far}, « proche » ${near}) : ${who.join(', ') || 'aucun'}`)
  out.clones[name] = { all: r1(pct(far + near, P.ranked.length)), far, near }
}

// Bloc vrai par bloc vrai : clones bruités, avec et sans le candidat
function run(kind, makeClones) {
  console.log(`\n=== ${kind} : ${NOISY} clones bruités par candidat, ${P.ranked.length} candidats ===`)
  const summary = {}
  for (const without of [false, true]) {
    const ref = blank() // lignes lues nettement / sujets mis à l'épreuve, par bloc vrai
    const shown = blank() // feuilles qui montrent la phrase / feuilles, par bloc vrai
    const far = SH.map(() => 0)
    const near = SH.map(() => 0)
    const style = blank() // « pas d'accord » / avis donnés, par bloc vrai
    const byCandidate = []
    for (const cid of P.ranked) {
      const t = P.blocOf(cid)
      let k = 0
      for (const v of makeClones(cid)) {
        const answers = P.toAnswers(v)
        const r = look(answers, without ? { without: [cid] } : {})
        const sh = noShare(answers)
        style[t].k += sh.no
        style[t].n += sh.n
        ref[t].n += r.rows.read.length + r.rows.apart.length + r.rows.flat.length
        ref[t].k += r.rows.read.length
        shown[t].n++
        if (!r.manner) continue
        shown[t].k++
        k++
        if (r.manner.near) near[t]++
        else far[t]++
      }
      byCandidate.push(`${cid} ${k}`)
    }
    const w = without ? 'sans le candidat' : 'avec le candidat'
    const rg = gapOf(ref)
    const g = gapOf(shown)
    const tot = shown.reduce((a, c) => ({ k: a.k + c.k, n: a.n + c.n }), { k: 0, n: 0 })
    const verdict = verdictOf(g, rg.gap)
    console.log(`\n-- ${w}`)
    console.log(`  référence, sujets lus nettement : ${row(ref)} · écart ${r1(rg.gap)} pts [${r1(rg.low)}–${r1(rg.high)}]`)
    console.log(`  la phrase : ${share(tot.k, tot.n)} des feuilles`)
    console.log(`    par bloc vrai : ${row(shown)}`)
    console.log(`    « pas d’accord » parmi les avis, par bloc vrai : ${row(style)}`)
    console.log(`    côté, par bloc vrai : ${SH.map((s, b) => `${s} « éloigné » ${far[b]}, « proche » ${near[b]}`).join(' | ')}`)
    console.log(`    écart ${r1(g.gap)} pts [${r1(g.low)}–${r1(g.high)}] ; référence ${r1(rg.gap)} pts : ${verdict}`)
    console.log(`    par candidat (sur ${NOISY}) : ${byCandidate.join(' · ')}`)
    summary[w] = {
      all: r1(pct(tot.k, tot.n)),
      blocs: shown.map(c => r1(pct(c.k, c.n))),
      far,
      near,
      style: style.map(c => r1(pct(c.k, c.n))),
      gap: [r1(g.gap), r1(g.low), r1(g.high)],
      reference: [r1(rg.gap), r1(rg.low), r1(rg.high)],
      verdict,
    }
  }
  return summary
}
out.bank = run('banque', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`)))
if (QUICK) out.quick = run('questionnaire rapide seul', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`)))
console.log(`\n${JSON.stringify(out)}`)
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`)
