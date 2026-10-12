// Audit de la page « Mon profil politique » (src/core/echiquier.ts) : rejoue la calibration complète sur une élection
// (clones larges, stricts, bruités et du seul questionnaire rapide, avec et sans le candidat dans le calcul ; réponses
// tirées au hasard selon six schémas, dont trois sur le seul questionnaire rapide ; profils composés de la demande du
// propriétaire), à 999 tirages, et imprime les chiffres à reporter dans ECHIQUIER_PUBLISHED (src/core/echiquierCopy.ts),
// ceux que publie la Méthode, avec ceux qui y sont. Pour les clones larges, il imprime aussi qui la lecture désigne,
// bloc vrai par bloc vrai ; pour le hasard, la part de chaque bloc parmi les ▲ et dans la synthèse. Aucune IA : le calcul même de la page. Les profils sont ceux de tests/echiquier-calibration.test.ts
// (tests/fixtures/echiquier-profiles.ts), en plus grand nombre.
//
// Usage : node tools/audit-echiquier.mjs [<id>] [--profiles 400] [--draws 999]
//   <id>        : l'élection (par défaut presidentielle-2027) ; elle doit avoir un axe (election.spectrum.axis)
//   --profiles  : profils tirés au hasard par schéma sur la banque entière (400 par défaut), cinq fois plus sur le seul
//                 questionnaire rapide (calcul bien plus court) ; ECHIQUIER_PUBLISHED est mesuré avec --profiles 1000
//   --draws     : tirages au-delà de 1 000 placements possibles (999 par défaut, comme la page)
// Après une mise à jour des positions : relancer, reporter les chiffres s'ils bougent, et le dire au journal.
// Il faut Node 22.18+ (TypeScript sans compilation).

import { importSite, useSiteModules } from './site-modules.mjs'

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(name)
  return i < 0 ? fallback : Number(argv[i + 1])
}
const id = argv.find((a, i) => !a.startsWith('--') && !['--profiles', '--draws'].includes(argv[i - 1])) ?? 'presidentielle-2027'
const N = opt('--profiles', 400)
const DRAWS = opt('--draws', 999)

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

console.log(`« Mon profil politique » : audit de ${id}, ${P.ranked.length} candidats sur l'axe, ${N} profils au hasard par schéma, ${DRAWS} tirages`)
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
  ['bruité', cid => Array.from({ length: 6 }, (_, s) => P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`))],
  ['rapide seul, large', cid => [P.cloneLarge(cid, isQuick)]],
]
for (const [kind, make] of kinds) {
  for (const without of [false, true]) {
    const acc = P.tally()
    const perBloc = P.panel.map(() => P.tally())
    for (const cid of P.ranked) {
      const t = P.blocOf(cid)
      for (const v of make(cid)) {
        const e = readEchiquier(pack, P.toAnswers(v), { draws: DRAWS, ...(without ? { without: [cid] } : {}) })
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

// Hasard
console.log('\nRéponses tirées au hasard')
const randoms = {}
for (const [scheme, only] of [...SCHEMES.map(s => [s, null]), ['audit', isQuick], ['un-choix', isQuick], ['un-choix-doux', isQuick]]) {
  const acc = P.tally()
  let none = 0
  const n = only ? 5 * N : N
  for (let i = 0; i < n; i++) {
    const e = readEchiquier(pack, P.toAnswers(P.randomProfile(`audit-echiquier:${scheme}${only ? '-rapide' : ''}:${i}`, scheme, only ?? undefined)), { draws: DRAWS })
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
      `dans la synthèse ${acc.summaryShare.map((n, b) => `${SH[b]} ${r1(pct(n, inSummary))}`).join(' / ')}`,
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
    console.log(`  ${label} : ${show(readEchiquier(pack, answers, { draws: DRAWS }))}`)
  } catch (err) {
    console.log(`  ${label} : ${err.message}`)
  }
}

// Ce que publie la Méthode
const without = clones['large, sans lui']
const byBloc = clones['large, sans lui, par bloc'].filter(a => a.read).map(a => pct(a.hit, a.read))
const withHim = clones.large
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
  wrongSideWithout: Math.round(pct(without.wrong, without.themes)),
  randomThemes: Math.round(pct(audit.read, audit.themes)),
  randomThemesMax: Math.round(Math.max(...fullBank.map(x => pct(randoms[x].read, randoms[x].themes)))),
  randomPerProfile: Math.round((audit.items / audit.profiles) * 10) / 10,
  randomPerProfileMax: Math.round(Math.max(...fullBank.map(x => randoms[x].items / randoms[x].profiles)) * 10) / 10,
  oneChoiceRatio: Math.round(ratioOf(['un-choix', 'un-choix-doux']) * 10) / 10,
  oneChoiceRatioQuick: Math.round(ratioOf(['un-choix, rapide seul', 'un-choix-doux, rapide seul']) * 10) / 10,
}
const mixed = mixedSchemes.flatMap(summaryShares)
console.log(`\nAvis mêlés (${mixedSchemes.join(', ')}) : chaque bloc reçoit de ${r1(Math.min(...mixed))} à ${r1(Math.max(...mixed))} % de la synthèse`)
console.log('\nÀ reporter dans ECHIQUIER_PUBLISHED (src/core/echiquierCopy.ts) :')
for (const [k, v] of Object.entries(measured)) {
  const published = ECHIQUIER_PUBLISHED[k]
  const far = k.startsWith('randomPerProfile') || k.startsWith('oneChoiceRatio') ? Math.abs(v - published) > 0.5 : Math.abs(v - published) > 5
  console.log(`  ${k.padEnd(18)} mesuré ${v}, publié ${published}${far ? '  ← écart : mettre à jour le texte et le journal' : ''}`)
}
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`)
