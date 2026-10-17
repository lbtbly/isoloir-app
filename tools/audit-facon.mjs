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
//   que ces écarts suivent, la façon de répondre des clones (la part des « pas d'accord » parmi leurs avis) : bloc par
//   bloc, candidat par candidat, et feuille par feuille, par tranche de 5 points de cette part ; et le plus grand écart
//   entre deux candidats recopiés d'un même bloc.
// Le calcul même de la page (readEchiquier, chartRows, uniformViews, mannerOf). Les chiffres publiés sont dans
// ECHIQUIER_MANNER (src/core/echiquierMethodCopy.ts) ; à refaire après une mise à jour des positions.
//
// Usage : node tools/audit-facon.mjs [<id>] [--noisy 60] [--sheets 400] [--quick] [--json]
//   <id>      : l'élection (par défaut presidentielle-2027) ; elle doit avoir un axe (election.spectrum.axis)
//   --noisy   : clones bruités par candidat (60 pour ECHIQUIER_MANNER : la porte D5 en demande 60 pour un verdict, 30
//               ne donnent qu'une indication)
//   --sheets  : feuilles d'essai par schéma sur la banque entière (cinq fois plus au rapide) ; 0 pour s'en passer
//   --quick   : refaire la mesure des clones bruités sur le seul questionnaire rapide (lignes de famille surtout)
//   --json    : le même calcul ; le rapport lisible passe sur stderr, et stdout ne reçoit qu'une ligne JSON (contrat de
//               la veille, tools/veille/CONTRACT.md, c.10 AUDIT_JSON), pour tools/veille/remeasure.mjs :
//               { tool: 'audit-facon', electionId, options: { noisy, sheets, quick }, measured, extra }
//     measured : la forme de ECHIQUIER_MANNER, sans measured ni clones, à 0,1 près : agreeOnly ([banque, rapide],
//                seulement si --sheets n'est pas 0), bank ({ all, blocs, lowWhere, highWhere, without, withoutBlocs } ;
//                lowWhere nomme tous les blocs à égalité, « à gauche ou à droite », comme le vérifie
//                tests/echiquier-copy.test.ts), gap et reference ([avec, sans]), style (la part des « pas d'accord »
//                parmi les avis des clones bruités, bloc vrai par bloc vrai : le calcul exact du test, égal à la
//                constante quand --noisy vaut ECHIQUIER_MANNER.clones), byShare ({ cut, bank }) et within ([[le plus
//                haut, le plus bas]] : feuilles sur clones, les deux candidats d'un même bloc les plus éloignés) ; avec
//                --quick, en plus (le passage refait aussi la banque, aux mêmes graines) : quick (même forme que
//                bank), quickGap, quickReference, styleQuick, byShare.quick et le second élément de within ;
//     extra    : blocs (election.spectrum.axis[].bloc, dans l'ordre) et where (leurs mots) ; verdicts, par écart D5 :
//                « bank.with », « bank.without », « quick.with », « quick.without » ; gaps, aux mêmes clés : { gap,
//                low, high, reference } en points ; side ({ bank|quick: { with|without: { far, near } } }, le côté
//                de la phrase, bloc par bloc) ; sheets et clones (les tableaux du rapport, s'ils sont mesurés)
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
 * Ce que la page montrerait pour ces réponses : la phrase et son côté (comme ui/profile/Chart.tsx : mannerOf seul, qui
 * ne dit rien avec des avis uniformes), et ses lignes, pour la référence ; uniform, compté à part
 */
function look(answers, opts = {}) {
  const rows = chartRows(groups, readEchiquier(pack, answers, opts), label)
  return { rows, uniform: uniformViews(Q, answers), manner: mannerOf(rows, Q, answers) }
}
/** La tranche de 5 points où tombe la part des « pas d'accord » d'une feuille (« 70 » : de 70 à moins de 75 %) */
const bandOf = sh => 5 * Math.floor(pct(sh.no, sh.n) / 5)
/** « 60–65 % 1/33 · 65–70 % 0/203 · … » : la phrase, tranche par tranche */
const bands = m => [...m.entries()].sort((a, b) => a[0] - b[0]).map(([b, c]) => `${b}–${b + 5} % ${c.k}/${c.n}`).join(' · ')
/** La part des « pas d'accord » où la Méthode coupe les feuilles en deux (ECHIQUIER_MANNER.byShare.cut) */
const CUT = 75
/** Les tranches sous CUT, puis les autres, réunies : { k, n } */
const cutOf = m => [0, 1].map(above => [...m.entries()].filter(([b]) => b >= CUT === !!above).reduce((a, [, c]) => ({ k: a.k + c.k, n: a.n + c.n }), { k: 0, n: 0 }))

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

// Bloc vrai par bloc vrai : clones bruités, avec et sans le candidat ; sink : reçoit, pour --json, les comptes des
// « pas d'accord » bloc par bloc, sans rien changer au rapport
function run(kind, makeClones, sink = {}) {
  console.log(`\n=== ${kind} : ${NOISY} clones bruités par candidat, ${P.ranked.length} candidats ===`)
  const summary = {}
  for (const without of [false, true]) {
    const ref = blank() // lignes lues nettement / sujets mis à l'épreuve, par bloc vrai
    const shown = blank() // feuilles qui montrent la phrase / feuilles, par bloc vrai
    const far = SH.map(() => 0)
    const near = SH.map(() => 0)
    const style = blank() // « pas d'accord » / avis donnés, par bloc vrai
    const byCandidate = []
    const perCandidate = SH.map(() => []) // feuilles qui montrent la phrase, candidat par candidat, par bloc vrai
    const byBand = new Map() // feuilles qui montrent la phrase / feuilles, par tranche de la part des « pas d'accord »
    for (const cid of P.ranked) {
      const t = P.blocOf(cid)
      let k = 0
      let no = 0
      let all = 0
      for (const v of makeClones(cid)) {
        const answers = P.toAnswers(v)
        const r = look(answers, without ? { without: [cid] } : {})
        const sh = noShare(answers)
        style[t].k += sh.no
        style[t].n += sh.n
        no += sh.no
        all += sh.n
        ref[t].n += r.rows.read.length + r.rows.apart.length + r.rows.flat.length
        ref[t].k += r.rows.read.length
        shown[t].n++
        const band = byBand.get(bandOf(sh)) ?? { k: 0, n: 0 }
        byBand.set(bandOf(sh), band)
        band.n++
        if (!r.manner) continue
        band.k++
        shown[t].k++
        k++
        if (r.manner.near) near[t]++
        else far[t]++
      }
      byCandidate.push(`${cid} ${k} (${r1(pct(no, all))} %)`)
      perCandidate[t].push(k)
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
    console.log(`    par candidat (sur ${NOISY}, et la part des « pas d’accord » parmi ses avis) : ${byCandidate.join(' · ')}`)
    // Au sein d'un bloc : le plus grand écart entre deux candidats recopiés
    const within = perCandidate.map(ks => [Math.min(...ks), Math.max(...ks)]).reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a))
    console.log(`    au sein d’un bloc, au plus : de ${within[0]} à ${within[1]} feuilles sur ${NOISY} selon le candidat recopié`)
    console.log(`    par tranche de la part des « pas d’accord » de la feuille : ${bands(byBand)}`)
    const [below, above] = cutOf(byBand)
    console.log(`    sous ${CUT} % de « pas d’accord » : ${share(below.k, below.n)} ; ${CUT} % ou plus : ${share(above.k, above.n)}`)
    sink[w] = { style }
    summary[w] = {
      all: r1(pct(tot.k, tot.n)),
      blocs: shown.map(c => r1(pct(c.k, c.n))),
      far,
      near,
      style: style.map(c => r1(pct(c.k, c.n))),
      gap: [r1(g.gap), r1(g.low), r1(g.high)],
      reference: [r1(rg.gap), r1(rg.low), r1(rg.high)],
      verdict,
      within,
      byShare: [r1(pct(below.k, below.n)), r1(pct(above.k, above.n))],
      bands: Object.fromEntries([...byBand.entries()].sort((a, b) => a[0] - b[0]).map(([b, c]) => [b, [c.k, c.n]])),
    }
  }
  return summary
}
const sinks = { bank: {}, quick: {} }
out.bank = run('banque', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`)), sinks.bank)
if (QUICK) out.quick = run('questionnaire rapide seul', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`)), sinks.quick)
console.log(`\n${JSON.stringify(out)}`)
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`)

// --json : une ligne, les mêmes chiffres, à la forme de ECHIQUIER_MANNER (contrat de la veille, c.10 AUDIT_JSON)
if (JSON_OUT) {
  const WITH = 'avec le candidat'
  const WITHOUT = 'sans le candidat'
  const WHERE = pack.election.spectrum.axis.map(a => a.where)
  /** « à gauche », « à gauche ou à droite » : les blocs à égalité (tests/echiquier-copy.test.ts, listOf) */
  const listOf = xs => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ou ${xs.at(-1)}` : (xs[0] ?? null))
  /** Le passage d'une série (banque ou rapide), à la forme de ECHIQUIER_MANNER.bank */
  const shownOf = s => {
    const lo = Math.min(...s[WITH].blocs)
    const hi = Math.max(...s[WITH].blocs)
    return {
      all: s[WITH].all,
      blocs: s[WITH].blocs,
      lowWhere: listOf(s[WITH].blocs.flatMap((x, b) => (x === lo ? [WHERE[b]] : []))),
      highWhere: WHERE[s[WITH].blocs.indexOf(hi)] ?? null,
      without: s[WITHOUT].all,
      withoutBlocs: s[WITHOUT].blocs,
    }
  }
  /** La part des « pas d'accord » parmi les avis des clones, bloc vrai par bloc vrai : le calcul exact du test */
  const styleOf = sink => sink[WITH].style.map(c => (c.n ? Math.round((1000 * c.k) / c.n) / 10 : null))
  const verdicts = {}
  const gaps = {}
  const side = {}
  for (const key of ['bank', 'quick']) {
    if (!out[key]) continue
    side[key] = {}
    for (const [w, tag] of [[WITH, 'with'], [WITHOUT, 'without']]) {
      const s = out[key][w]
      verdicts[`${key}.${tag}`] = s.verdict
      gaps[`${key}.${tag}`] = { gap: s.gap[0], low: s.gap[1], high: s.gap[2], reference: s.reference[0] }
      side[key][tag] = { far: s.far, near: s.near }
    }
  }
  const b = out.bank
  const measured = {}
  if (out.sheets) measured.agreeOnly = [out.sheets['accord-seul']?.all ?? null, out.sheets['accord-seul, rapide seul']?.all ?? null]
  measured.bank = shownOf(b)
  if (out.quick) measured.quick = shownOf(out.quick)
  measured.gap = [b[WITH].gap[0], b[WITHOUT].gap[0]]
  measured.reference = [b[WITH].reference[0], b[WITHOUT].reference[0]]
  if (out.quick) {
    measured.quickGap = [out.quick[WITH].gap[0], out.quick[WITHOUT].gap[0]]
    measured.quickReference = [out.quick[WITH].reference[0], out.quick[WITHOUT].reference[0]]
  }
  measured.style = styleOf(sinks.bank)
  if (out.quick) measured.styleQuick = styleOf(sinks.quick)
  measured.byShare = { cut: CUT, bank: b[WITH].byShare, ...(out.quick ? { quick: out.quick[WITH].byShare } : {}) }
  // [le plus haut, le plus bas], comme la constante (le rapport dit « de <bas> à <haut> »)
  measured.within = [b, out.quick].filter(Boolean).map(s => [s[WITH].within[1], s[WITH].within[0]])
  const extra = { blocs: pack.election.spectrum.axis.map(a => a.bloc), where: WHERE, verdicts, gaps, side, clones: out.clones }
  if (out.sheets) extra.sheets = out.sheets
  process.stdout.write(`${JSON.stringify({ tool: 'audit-facon', electionId: id, options: { noisy: NOISY, sheets: SHEETS, quick: QUICK }, measured, extra })}\n`)
}
