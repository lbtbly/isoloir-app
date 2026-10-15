// Audit de la page « Mon profil politique » (src/core/echiquier.ts) : rejoue la calibration complète sur une élection
// (clones larges, stricts, bruités et du seul questionnaire rapide, avec et sans le candidat dans le calcul ; feuilles
// d'essai remplies par un programme, sans suivre aucun candidat, selon six schémas, dont trois sur le seul
// questionnaire rapide ; profils composés de la demande du propriétaire), avec le calcul même de la page (rien n'est
// tiré au sort : mêmes réponses, même lecture), et imprime les chiffres à reporter dans ECHIQUIER_PUBLISHED
// (src/core/echiquierCopy.ts), ceux que publie la Méthode, avec ceux qui y sont. Pour les clones larges, il imprime
// aussi qui la lecture désigne, bloc vrai par bloc vrai ; pour les feuilles d'essai, la part de chaque bloc parmi les ▲
// et dans la synthèse. Puis le tableau de neutralité D5 (décision du propriétaire du 15 octobre 2026), bloc vrai par
// bloc vrai : la part des clones bien lus, avec et sans le candidat, ses intervalles de Wilson à 95 %, et l'écart en
// points entre le bloc le mieux lu et le moins bien lu. Aucune IA : le calcul même de la page. Les profils sont ceux de
// tests/echiquier-calibration.test.ts (tests/fixtures/echiquier-profiles.ts), en plus grand nombre.
//
// Usage : node tools/audit-echiquier.mjs [<id>] [--profiles 400] [--noisy 6]
//   <id>        : l'élection (par défaut presidentielle-2027) ; elle doit avoir un axe (election.spectrum.axis)
//   --profiles  : feuilles d'essai par schéma sur la banque entière (400 par défaut), cinq fois plus sur le seul
//                 questionnaire rapide (calcul bien plus court) ; ECHIQUIER_PUBLISHED est mesuré avec --profiles 1000
//   --noisy     : clones bruités par candidat (6 par défaut, comme les tests ; la porte D5 en demande au moins 60)
// Après une mise à jour des positions : relancer, reporter les chiffres s'ils bougent, et le dire au journal.
// Il faut Node 22.18+ (TypeScript sans compilation).

import { importSite, useSiteModules } from './site-modules.mjs'

const argv = process.argv.slice(2)
const OPTIONS = ['--profiles', '--noisy']
const opt = (name, fallback) => {
  const i = argv.indexOf(name)
  return i < 0 ? fallback : Number(argv[i + 1])
}
const id = argv.find((a, i) => !a.startsWith('--') && !OPTIONS.includes(argv[i - 1])) ?? 'presidentielle-2027'
const N = opt('--profiles', 400)
const NOISY = opt('--noisy', 6)

useSiteModules()
const { elections } = await importSite('src/elections/all.ts')
const pack = elections.find(p => p.election.id === id)
if (!pack) {
  console.error(`Élection inconnue : ${id} (${elections.map(p => p.election.id).join(', ')})`)
  process.exit(2)
}
const { readEchiquier } = await importSite('src/core/echiquier.ts')
const { ECHIQUIER_PUBLISHED } = await importSite('src/core/echiquierCopy.ts')
const { SCHEMES, isQuick, pct, profilesFor } = await importSite('tests/fixtures/echiquier-profiles.ts')
const P = profilesFor(pack)
if (!P.ranked.length) {
  console.error(`${id} : pas d'axe (election.spectrum.axis), pas de page « Mon profil politique »`)
  process.exit(2)
}
const SH = pack.election.spectrum.axis.map(a => a.short)
const r1 = x => Math.round(x * 10) / 10
const t0 = Date.now()

console.log(`« Mon profil politique » : audit de ${id}, ${P.ranked.length} candidats sur l'axe, ${N} feuilles d'essai par schéma, ${NOISY} clones bruités par candidat`)
console.log(`Axe : ${P.panel.map((ids, b) => `${SH[b]} ${ids.join(', ')}`).join(' | ')}`)

const line = (label, acc) =>
  console.log(
    `  ${label.padEnd(30)} thèmes lus ${r1(pct(acc.read, acc.themes))} % · juste ${r1(pct(acc.hit, acc.read))} % · seul ${r1(pct(acc.sole, acc.read))} % · ` +
      `mauvais côté ${r1(pct(acc.wrong, acc.themes))} % · bloc vrai ▽ ${acc.trueFar} · familles lues ${r1(pct(acc.famRead, acc.families))} % / justes ${r1(pct(acc.famHit, acc.famRead))} % · ` +
      `couverts par la synthèse ${r1(pct(acc.cover, acc.answered))} %`,
  )

// Clones
console.log('\nClones des candidats classés')
const clones = {}
const kinds = [
  ['large', cid => [P.cloneLarge(cid)]],
  ['strict', cid => [P.cloneStrict(cid)]],
  ['bruité', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`))],
  ['rapide seul, large', cid => [P.cloneLarge(cid, isQuick)]],
  ['rapide seul, bruité', cid => Array.from({ length: NOISY }, (_, s) => P.noisy(P.cloneLarge(cid, isQuick), `nq:${cid}:${s}`))],
]
for (const [kind, make] of kinds) {
  for (const without of [false, true]) {
    const acc = P.tally()
    const perBloc = P.panel.map(() => P.tally())
    for (const cid of P.ranked) {
      const t = P.blocOf(cid)
      for (const v of make(cid)) {
        const e = readEchiquier(pack, P.toAnswers(v), without ? { without: [cid] } : {})
        P.count(acc, e, t)
        P.count(perBloc[t], e, t)
      }
    }
    const label = `${kind}${without ? ', sans lui' : ''}`
    clones[label] = acc
    clones[`${label}, par bloc`] = perBloc
    line(label, acc)
    if (kind === 'large') {
      console.log(`    par bloc vrai : ${perBloc.map((a, b) => `${SH[b]} lus ${r1(pct(a.read, a.themes))} %, justes ${r1(pct(a.hit, a.read))} %`).join(' | ')}`)
      // Qui la lecture désigne, selon le bloc vrai : la part de chaque bloc parmi les ▲ des thèmes lus
      for (const [b, a] of perBloc.entries()) console.log(`      clones ${SH[b].padEnd(3)} (${a.read} lus) → ${a.share.map((n, k) => `${SH[k]} ${n}`).join(' · ')}`)
    }
  }
}

// Feuilles d'essai
console.log('\nFeuilles d’essai, remplies par un programme sans suivre aucun candidat')
const randoms = {}
for (const [scheme, only] of [...SCHEMES.map(s => [s, null]), ['audit', isQuick], ['un-choix', isQuick], ['un-choix-doux', isQuick]]) {
  const acc = P.tally()
  let none = 0
  const n = only ? 5 * N : N
  for (let i = 0; i < n; i++) {
    const e = readEchiquier(pack, P.toAnswers(P.randomProfile(`audit-echiquier:${scheme}${only ? '-rapide' : ''}:${i}`, scheme, only ?? undefined)))
    P.count(acc, e, null)
    if (!e.summary.length) none++
  }
  const label = `${scheme}${only ? ', rapide seul' : ''}`
  randoms[label] = acc
  const total = acc.share.reduce((a, b) => a + b, 0)
  const inSummary = acc.summaryShare.reduce((a, b) => a + b, 0)
  console.log(
    `  ${label.padEnd(26)} thèmes lus ${r1(pct(acc.read, acc.themes))} % · familles lues ${r1(pct(acc.famRead, acc.families))} % · lectures par profil ${(acc.items / acc.profiles).toFixed(2)} · ` +
      `sans lecture ${r1(pct(none, n))} % · part des blocs parmi les ▲ ${acc.share.map((n, b) => `${SH[b]} ${r1(pct(n, total))}`).join(' / ')} · ` +
      `dans la synthèse ${acc.summaryShare.map((n, b) => `${SH[b]} ${r1(pct(n, inSummary))}`).join(' / ')} (${acc.summaryShare.map((n, b) => `${SH[b]} ${n}`).join(' / ')})`,
  )
}

// Profils composés
console.log('\nProfils composés (synthèse)')
const show = e =>
  e.summary.map(g => `${g.near.map(b => SH[b]).join(' + ')} : ${g.items.map(it => (it.kind === 'famille' ? `[famille] ${it.id}` : it.id)).join(', ')}`).join(' ; ') || '(rien)'
const regalien = new Set(['securite_justice', 'immigration', 'laicite_republique'])
for (const [label, answers] of [
  ['Mélenchon + Retailleau (régalien)', P.compose('melenchon', 'retailleau', regalien)],
  ['Glucksmann + Le Pen (immigration)', P.compose('glucksmann', 'lepen', new Set(['immigration']))],
  ['les mêmes, rapide seul', P.compose('glucksmann', 'lepen', new Set(['immigration']), isQuick)],
]) {
  try {
    console.log(`  ${label} : ${show(readEchiquier(pack, answers))}`)
  } catch (err) {
    console.log(`  ${label} : ${err.message}`)
  }
}

// D5 : la neutralité bloc par bloc. Pour chaque bloc vrai, la part des clones bien lus (leur bloc parmi les ▲) parmi
// leurs thèmes lus, puis parmi leurs familles lues, avec l'intervalle de Wilson à 95 % ; l'écart, en points, entre le
// bloc le mieux lu et le moins bien lu, et sa fourchette tirée des intervalles (borne basse : la plus haute des bornes
// basses moins la plus basse des bornes hautes ; borne haute : l'inverse)
/** Intervalle de Wilson à 95 % de k succès sur n, en % */
const wilson = (k, n) => {
  if (!n) return null
  const z = 1.959964
  const p = k / n
  const d = 1 + (z * z) / n
  const c = (p + (z * z) / (2 * n)) / d
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d
  return [100 * (c - h), 100 * (c + h)]
}
const d5Row = (perBloc, hitKey, readKey) => {
  const cells = perBloc.map(a => ({ k: a[hitKey], n: a[readKey], p: a[readKey] ? pct(a[hitKey], a[readKey]) : null, ci: wilson(a[hitKey], a[readKey]) }))
  const ok = cells.filter(c => c.p !== null)
  const gap = ok.length ? Math.max(...ok.map(c => c.p)) - Math.min(...ok.map(c => c.p)) : null
  const low = ok.length ? Math.max(0, Math.max(...ok.map(c => c.ci[0])) - Math.min(...ok.map(c => c.ci[1]))) : null
  const high = ok.length ? Math.max(...ok.map(c => c.ci[1])) - Math.min(...ok.map(c => c.ci[0])) : null
  return { cells, gap, low, high }
}
const d5Text = r =>
  `${r.cells.map((c, b) => `${SH[b]} ${c.p === null ? '–' : `${c.k}/${c.n} ${r1(c.p)} % [${r1(c.ci[0])}–${r1(c.ci[1])}]`}`).join(' | ')} · ` +
  `écart ${r.gap === null ? '–' : `${r1(r.gap)} pts [${r1(r.low)}–${r1(r.high)}]`}`
console.log('\nD5, neutralité bloc par bloc : part des clones bien lus, intervalle de Wilson à 95 %, écart entre blocs en points')
for (const [kind] of kinds) {
  for (const [what, hitKey, readKey] of [['thèmes', 'hit', 'read'], ['familles', 'famHit', 'famRead']]) {
    for (const without of [false, true]) {
      const r = d5Row(clones[`${kind}${without ? ', sans lui' : ''}, par bloc`], hitKey, readKey)
      console.log(`  ${`${kind}, ${what}, ${without ? 'sans lui' : 'avec lui'}`.padEnd(38)} ${d5Text(r)}`)
    }
  }
}

// Ce que publie la Méthode
const without = clones['large, sans lui']
const byBloc = clones['large, sans lui, par bloc'].filter(a => a.read).map(a => pct(a.hit, a.read))
const withHim = clones.large
const byBlocWith = clones['large, par bloc'].filter(a => a.read).map(a => pct(a.hit, a.read))
const audit = randoms.audit
// Les schémas où l'on approuve et désapprouve sur toute la banque, pour lesquels aucun bloc n'est favorisé
const mixedSchemes = ['audit', 'uniforme']
const summaryShares = label => {
  const a = randoms[label]
  const total = a.summaryShare.reduce((x, y) => x + y, 0)
  return a.summaryShare.map(n => pct(n, total))
}
// Un seul accord par question : la part moyenne des extrêmes dans la synthèse, rapportée à celle de la gauche
const EG = 0
const G = 1
const ED = SH.length - 1
const ratioOf = labels => {
  const pooled = labels.reduce((n, l) => n.map((x, b) => x + randoms[l].summaryShare[b]), SH.map(() => 0))
  return (pooled[EG] + pooled[ED]) / 2 / pooled[G]
}
const fullBank = SCHEMES.filter(x => x !== 'tout-sauf-un')
const measured = {
  hitWithout: Math.round(pct(without.hit, without.read)),
  hitWithoutMin: Math.round(Math.min(...byBloc)),
  hitWithoutMax: Math.round(Math.max(...byBloc)),
  hitWith: Math.round(pct(withHim.hit, withHim.read)),
  hitWithMin: Math.round(Math.min(...byBlocWith)),
  hitWithMax: Math.round(Math.max(...byBlocWith)),
  wrongSideWithout: Math.round(pct(without.wrong, without.themes)),
  randomThemes: Math.round(pct(audit.read, audit.themes)),
  randomThemesMax: Math.round(Math.max(...fullBank.map(x => pct(randoms[x].read, randoms[x].themes)))),
  randomPerProfile: Math.round((audit.items / audit.profiles) * 10) / 10,
  randomPerProfileMax: Math.round(Math.max(...fullBank.map(x => randoms[x].items / randoms[x].profiles)) * 10) / 10,
  oneChoiceRatio: Math.round(ratioOf(['un-choix', 'un-choix-doux']) * 10) / 10,
  oneChoiceRatioQuick: Math.round(ratioOf(['un-choix, rapide seul', 'un-choix-doux, rapide seul']) * 10) / 10,
}
const exactly = {
  hitWithout: r1(pct(without.hit, without.read)),
  hitWithoutMin: r1(Math.min(...byBloc)),
  hitWithoutMax: r1(Math.max(...byBloc)),
  hitWith: r1(pct(withHim.hit, withHim.read)),
  hitWithMin: r1(Math.min(...byBlocWith)),
  hitWithMax: r1(Math.max(...byBlocWith)),
  randomThemes: Math.round(pct(audit.read, audit.themes) * 100) / 100,
  randomThemesMax: Math.round(Math.max(...fullBank.map(x => pct(randoms[x].read, randoms[x].themes))) * 100) / 100,
  randomPerProfile: Math.round((audit.items / audit.profiles) * 100) / 100,
  randomPerProfileMax: Math.round(Math.max(...fullBank.map(x => randoms[x].items / randoms[x].profiles)) * 100) / 100,
  oneChoiceRatio: Math.round(ratioOf(['un-choix', 'un-choix-doux']) * 1000) / 1000,
  oneChoiceRatioQuick: Math.round(ratioOf(['un-choix, rapide seul', 'un-choix-doux, rapide seul']) * 1000) / 1000,
}
const mixed = mixedSchemes.flatMap(summaryShares)
console.log(`\nAvis mêlés (${mixedSchemes.join(', ')}) : chaque bloc reçoit de ${r1(Math.min(...mixed))} à ${r1(Math.max(...mixed))} % de la synthèse`)
console.log('\nÀ reporter dans ECHIQUIER_PUBLISHED (src/core/echiquierCopy.ts) :')
for (const [k, v] of Object.entries(measured)) {
  const published = ECHIQUIER_PUBLISHED[k]
  const far = published === undefined || (k.startsWith('randomPerProfile') || k.startsWith('oneChoiceRatio') ? Math.abs(v - published) > 0.5 : Math.abs(v - published) > 5)
  console.log(`  ${k.padEnd(19)} mesuré ${v}${k in exactly ? ` (${exactly[k]})` : ''}, publié ${published ?? '–'}${far ? '  ← écart : mettre à jour le texte et le journal' : ''}`)
}
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`)
