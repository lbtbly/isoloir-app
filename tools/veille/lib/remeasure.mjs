// Cœur de tools/veille/remeasure.mjs (veille automatique d'Isoloir, constructeur B7 ; contrat : tools/veille/CONTRACT.md
// §d.8) : fonctions pures qui lisent l'audit du pack (research/<id>/audit.json), recalculent les trois constantes
// exactes de la Méthode avec le code même des tests (tests/echiquier-copy.test.ts L809-828, L981-1000, L1092-1105), et
// comparent les mesures D5 des quatre audits du profil (sorties --json, c.10 AUDIT_JSON) aux chiffres publiés
// (src/core/echiquierMethodCopy.ts) et aux verdicts de référence (veille/d5-baseline.json). Aucune lecture de fichier,
// aucun lancement : le script de ligne de commande fournit les textes, les sorties et le pack chargé.
//
// Exports :
//   auditBounds(auditJson)                 → { profiles, minShare, maxShare } (parts du questionnaire rapide, arrondies)
//   readAuditLine(text) / patchAuditLine(text, bounds)   la ligne « audit: { profiles, minShare, maxShare } » d'election.ts
//   failedHardChecks(auditJson)            → contrôles durs en échec ; namedCandidates(checks, cards) → identifiants cités
//   exactShares(site)                      → { compatibleShare, deduced, style, styleQuick } (5 parts chacune, axe)
//   indexRules(shares)                     → [{ constant, ok, indices, expected }]
//   patchExactConstants(text, shares, published) → { text, patched: [noms] }
//   calibrationDrift(measured, published)  → [{ key, published, measured, tolerance, over }]
//   gapDrift(audits, published)            → [{ key, published, measured, widened }]
//   currentVerdicts(audits) / verdictDrift(current, baseline) → verdicts « <outil>.<clé> » et dégradations
// Toute forme inattendue (ligne absente, en double, clé mesurée manquante) lève une VeilleError 31 : le fichier ou
// l'outil a changé de forme, ce n'est pas une donnée à retenir.

import { EXIT, fail } from './common.mjs'

// ——— audit-pack : la ligne « audit » d'election.ts ———

/** Les chiffres de l'accueil, d'après audit.json : parts des premières places au questionnaire rapide, arrondies */
export function auditBounds(audit) {
  const vals = Object.values(audit?.shares?.quick ?? {})
  if (!vals.length) fail(EXIT.CODE, 'audit.json : shares.quick absent ou vide')
  return { profiles: audit.profiles, minShare: Math.round(Math.min(...vals)), maxShare: Math.round(Math.max(...vals)) }
}

const AUDIT_LINE = /^ {2}audit: \{ profiles: (\d+), minShare: (\d+(?:\.\d+)?), maxShare: (\d+(?:\.\d+)?) \},$/gm
export function readAuditLine(text) {
  const hits = [...String(text).matchAll(AUDIT_LINE)]
  if (hits.length !== 1) fail(EXIT.CODE, `election.ts : ${hits.length} ligne(s) « audit: { profiles, minShare, maxShare } », une seule attendue`)
  const [, profiles, minShare, maxShare] = hits[0]
  return { profiles: Number(profiles), minShare: Number(minShare), maxShare: Number(maxShare) }
}
export function patchAuditLine(text, { profiles, minShare, maxShare }) {
  readAuditLine(text)
  return String(text).replace(AUDIT_LINE, `  audit: { profiles: ${profiles}, minShare: ${minShare}, maxShare: ${maxShare} },`)
}

export const failedHardChecks = audit => (audit?.checks ?? []).filter(c => c.hard && !c.ok)

/**
 * Candidats nommés dans le détail d'un contrôle d'audit-pack (initiales, comme « ÉP 15/22 », ou identifiant) :
 * cards = [{ id, initials }]
 */
export function namedCandidates(checks, cards) {
  const out = new Set()
  for (const c of checks) {
    const tokens = new Set(String(c.detail ?? '').split(/[\s,;:()=/…+]+/u).filter(Boolean))
    for (const k of cards) if ((k.initials && tokens.has(k.initials)) || tokens.has(k.id)) out.add(k.id)
  }
  return [...out]
}

// ——— Les trois constantes exactes ———

/**
 * Les parts bloc par bloc, avec le code des tests. site : { pack, panelOf, effectiveWeight, dealbreakerLevel,
 * profilesFor, isQuick, mannerClones } (le pack de l'élection et les fonctions du site et de
 * tests/fixtures/echiquier-profiles.ts).
 */
export function exactShares({ pack, panelOf, effectiveWeight, dealbreakerLevel, profilesFor, isQuick, mannerClones }) {
  const panel = panelOf(pack)
  const share = (ids, pick) => {
    let n = 0
    let k = 0
    for (const id of ids)
      for (const pos of Object.values(pack.positions[id] ?? {})) {
        const [inN, inK] = pick(pos)
        if (inN) n++
        if (inK) k++
      }
    return Math.round((1000 * k) / n) / 10
  }
  // tests/echiquier-copy.test.ts L981-1000 : part des approches compatibles parmi les positions qui comptent
  const compatibleShare = panel.map(ids => share(ids, pos => {
    const e = effectiveWeight(pos)
    return [!!e, e === 1]
  }))
  // L809-828 : part des positions déduites, ou de confiance basse, parmi celles qu'une ligne rouge peut viser
  const deduced = panel.map(ids => share(ids, pos => {
    const level = dealbreakerLevel(pos)
    return [!!level, level === 'possible']
  }))
  // L1092-1105 : part des « pas d'accord » des clones bruités, bloc vrai par bloc vrai
  const P = profilesFor(pack)
  const styleOf = (only, seed) => {
    const acc = panel.map(() => ({ no: 0, all: 0 }))
    for (const cid of P.ranked)
      for (let s = 0; s < mannerClones; s++)
        for (const a of Object.values(P.toAnswers(P.noisy(P.cloneLarge(cid, only), `${seed}:${cid}:${s}`)))) {
          const v = Object.values(a.ratings)
          acc[P.blocOf(cid)].all += v.length
          acc[P.blocOf(cid)].no += v.filter(r => r < 0).length
        }
    return acc.map(x => Math.round((1000 * x.no) / x.all) / 10)
  }
  return { compatibleShare, deduced, style: styleOf(undefined, 'n'), styleQuick: styleOf(isQuick, 'nq'), panel }
}

const topTwo = xs => xs.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, 2).map(([, i]) => i).sort((a, b) => a - b)
/**
 * Règles d'indice des libellés publiés : la plus basse à droite (3) et la plus haute à gauche (1) pour les compatibles,
 * la plus basse à droite (3) et la plus haute à l'extrême gauche (0) pour les déduites, les deux plus hautes aux
 * extrêmes (0 et 4) pour la part des « pas d'accord ». indices : où tombent la plus basse et la plus haute (ou les
 * deux plus hautes) ; expected : où les libellés les placent.
 */
export function indexRules(shares) {
  const minMax = xs => [xs.indexOf(Math.min(...xs)), xs.indexOf(Math.max(...xs))]
  const out = []
  for (const [constant, xs, expected] of [['ECHIQUIER_WEIGH.compatibleShare', shares.compatibleShare, [3, 1]], ['ECHIQUIER_CROSS.deduced', shares.deduced, [3, 0]]]) {
    const indices = minMax(xs)
    out.push({ constant, ok: indices[0] === expected[0] && indices[1] === expected[1], indices, expected })
  }
  for (const [constant, xs] of [['ECHIQUIER_MANNER.style', shares.style], ['ECHIQUIER_MANNER.styleQuick', shares.styleQuick]]) {
    const indices = topTwo(xs)
    out.push({ constant, ok: indices[0] === 0 && indices[1] === 4, indices, expected: [0, 4] })
  }
  return out
}

const num = n => String(n)
function replaceOnce(text, re, fn, what) {
  const hits = [...text.matchAll(re)]
  if (hits.length !== 1) fail(EXIT.CODE, `echiquierMethodCopy.ts : ${hits.length} correspondance(s) pour ${what}, une seule attendue`)
  return text.replace(re, fn)
}
/**
 * Remplace, dans le texte de src/core/echiquierMethodCopy.ts, les seuls nombres des constantes exactes qui ont bougé
 * (une correspondance chacune ; libellés, « measured » et autres constantes jamais touchés)
 */
export function patchExactConstants(text, shares, published) {
  let out = String(text)
  const patched = []
  const pair = (name, key, xs, pub) => {
    const low = Math.min(...xs)
    const high = Math.max(...xs)
    const re = new RegExp(`(\\n {2}${key}: \\{ low: )(\\d+(?:\\.\\d+)?)(, lowWhere: '[^']*', high: )(\\d+(?:\\.\\d+)?)(, highWhere: '[^']*' \\})`, 'g')
    const found = [...out.matchAll(re)]
    if (found.length !== 1) fail(EXIT.CODE, `echiquierMethodCopy.ts : ${found.length} correspondance(s) pour ${name}, une seule attendue`)
    if (low === pub.low && high === pub.high) return
    out = replaceOnce(out, re, (_, a, _l, b, _h, c) => `${a}${num(low)}${b}${num(high)}${c}`, name)
    patched.push(name)
  }
  const list = (name, key, xs, pub) => {
    const re = new RegExp(`(\\n {2}${key}: \\[)([^\\]\\n]*)(\\],)`, 'g')
    const found = [...out.matchAll(re)]
    if (found.length !== 1) fail(EXIT.CODE, `echiquierMethodCopy.ts : ${found.length} correspondance(s) pour ${name}, une seule attendue`)
    if (xs.length === pub.length && xs.every((x, i) => x === pub[i])) return
    out = replaceOnce(out, re, (_, a, _v, c) => `${a}${xs.map(num).join(', ')}${c}`, name)
    patched.push(name)
  }
  pair('ECHIQUIER_WEIGH.compatibleShare', 'compatibleShare', shares.compatibleShare, published.WEIGH.compatibleShare)
  pair('ECHIQUIER_CROSS.deduced', 'deduced', shares.deduced, published.CROSS.deduced)
  list('ECHIQUIER_MANNER.style', 'style', shares.style, published.MANNER.style)
  list('ECHIQUIER_MANNER.styleQuick', 'styleQuick', shares.styleQuick, published.MANNER.styleQuick)
  return { text: out, patched }
}

// ——— Calibration et écarts D5 ———

/** Tolérances de tests/echiquier-calibration.test.ts L164-200 */
export const CALIBRATION_TOLERANCE = Object.freeze({
  hitWithout: 5, hitWithoutMin: 5, hitWithoutMax: 5, hitWith: 5, hitWithMin: 5, hitWithMax: 5, randomThemes: 5, randomThemesMax: 5,
  wrongSideWithout: 1, randomPerProfile: 0.5, randomPerProfileMax: 0.5, oneChoiceRatio: 0.5, oneChoiceRatioQuick: 0.5,
})
const need = (obj, path, tool) => {
  let v = obj
  for (const k of path.split('.')) v = v?.[k]
  if (v === undefined || v === null) fail(EXIT.CODE, `${tool} --json : « measured.${path} » absent (contrat c.10 AUDIT_JSON)`)
  return v
}

/** Écarts de la mesure d'audit-echiquier à ECHIQUIER_PUBLISHED ; over : au-delà de la tolérance du test */
export function calibrationDrift(measured, published) {
  return Object.entries(CALIBRATION_TOLERANCE).map(([key, tolerance]) => {
    const m = need(measured, key, 'audit-echiquier')
    return { key: `ECHIQUIER_PUBLISHED.${key}`, published: published[key], measured: m, tolerance, over: Math.abs(m - published[key]) > tolerance + 1e-9 }
  })
}

const decimalsOf = n => (String(n).split('.')[1] ?? '').length
const roundTo = (x, d) => Math.round(x * 10 ** d) / 10 ** d
/**
 * Les écarts D5 publiés, mesurés de nouveau et arrondis comme la constante publiée (au moins un chiffre après la
 * virgule hors ECHIQUIER_PUBLISHED, dont les parts sont publiées entières) ; widened : l'écart publié est dépassé.
 * audits : { echiquier, croix, croixQuick, poids, facon, faconQuick } (sorties --json).
 */
export function gapDrift(audits, published) {
  const out = []
  const P = published.PUBLISHED
  for (const [hi, lo] of [['hitWithoutMax', 'hitWithoutMin'], ['hitWithMax', 'hitWithMin']]) {
    const d = Math.max(decimalsOf(P[hi]), decimalsOf(P[lo]))
    const m = audits.echiquier.measured
    const measured = roundTo(roundTo(need(m, hi, 'audit-echiquier'), d) - roundTo(need(m, lo, 'audit-echiquier'), d), d)
    const pub = roundTo(P[hi] - P[lo], d)
    out.push({ key: `ECHIQUIER_PUBLISHED.${hi}−${lo}`, published: pub, measured, widened: measured > pub + 1e-9 })
  }
  const single = (key, value, pub) => {
    const d = Math.max(1, decimalsOf(pub))
    const measured = roundTo(value, d)
    out.push({ key, published: pub, measured, widened: measured > pub + 1e-9 })
  }
  const pairOf = (key, values, pubs) => pubs.forEach((pub, i) => single(`${key}[${i}]`, values[i], pub))
  single('ECHIQUIER_CROSS.gapMax', need(audits.croix.measured, 'gapMax', 'audit-croix'), published.CROSS.gapMax)
  single('ECHIQUIER_CROSS.quick.gapMax', need(audits.croixQuick.measured, 'quick.gapMax', 'audit-croix --quick'), published.CROSS.quick.gapMax)
  pairOf('ECHIQUIER_CROSS.quick.neighbourGap', need(audits.croixQuick.measured, 'quick.neighbourGap', 'audit-croix --quick'), published.CROSS.quick.neighbourGap)
  single('ECHIQUIER_WEIGH.mainGap', need(audits.poids.measured, 'mainGap', 'audit-poids'), published.WEIGH.mainGap)
  pairOf('ECHIQUIER_MANNER.gap', need(audits.facon.measured, 'gap', 'audit-facon'), published.MANNER.gap)
  pairOf('ECHIQUIER_MANNER.quickGap', need(audits.faconQuick.measured, 'quickGap', 'audit-facon --quick'), published.MANNER.quickGap)
  return out
}

/**
 * Verdicts D5 de cette mesure, « <outil>.<clé> » : ceux du passage sur la banque, puis les clés « quick.… » du
 * passage --quick (qui refait aussi la banque, aux mêmes graines : ses autres clés ne s'ajoutent que si elles manquent)
 */
export function currentVerdicts(audits) {
  const out = {}
  for (const a of [audits.echiquier, audits.croix, audits.poids, audits.facon]) {
    for (const [k, v] of Object.entries(a?.extra?.verdicts ?? {})) out[`${a.tool}.${k}`] = v
  }
  for (const a of [audits.croixQuick, audits.poidsQuick, audits.faconQuick]) {
    for (const [k, v] of Object.entries(a?.extra?.verdicts ?? {})) {
      const key = `${a.tool}.${k}`
      if (k.startsWith('quick') || !(key in out)) out[key] = v
    }
  }
  return out
}

/** Dégradations par rapport à la référence : « passe » qui devient autre chose, « non établi » qui ne passe plus */
export function verdictDrift(current, baseline) {
  const out = []
  for (const [key, base] of Object.entries(baseline ?? {})) {
    if (!(key in current)) fail(EXIT.CODE, `verdict D5 « ${key} » absent de la mesure (la sortie --json a changé de forme)`)
    const now = current[key]
    if ((base === 'passe' && now !== 'passe') || (base === 'non établi' && now === 'ne passe pas')) out.push({ key, baseline: base, now })
  }
  return out
}
