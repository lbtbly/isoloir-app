// Image de partage « Accords et désaccords » (src/core/agreeImage.ts) : ses candidats, dans l'ordre et sous les numéros
// de l'affiche « Mon dépouillement », les 5 plus proches, les 5 plus éloignés ou tous ; l'échelle commune de ses barres,
// sa hauteur, son nom de fichier et son texte de remplacement. Le dessin lui-même (Canvas) est regardé à l'œil et
// fabriqué hors ligne par tools/e2e-offline.mjs.
import { describe, expect, it } from 'vitest'
import {
  AGREE_MAX_H,
  agreeAlt,
  agreeFileName,
  agreeLayout,
  agreeLead,
  agreeRanking,
  agreeRowSizes,
  agreeScale,
  DESCENT,
  type AgreeScope,
} from '../src/core/agreeImage'
import { AGREE_NONE, count, TITLE_AGREE } from '../src/core/resultsCopy'
import { computeResults, displayScore, type CandidateResult } from '../src/core/score'
import {
  AGREE_ROWS,
  flopLead,
  IMAGE_H,
  offPosterText,
  othersText,
  posterNotes,
  posterPositions,
  posterRanking,
  POSTER_ROWS,
  tailHeight,
} from '../src/core/shareImage'
import type { Answers } from '../src/core/types'
import { EXCLUDED, manyCandidates, MANY_ID, NARROW } from './fixtures/many-candidates'
import { pack } from './fixture'

const { bank } = manyCandidates
/** Avis « d'accord » sur la première approche de chaque question du questionnaire rapide */
const answers: Answers = Object.fromEntries(
  bank.questions.filter(q => q.tier === 'essentiel').map(q => [q.id, { ratings: { [q.approaches[0]!.id]: 1 as const }, redLines: [] }]),
)
/** Les mêmes, avec une ligne rouge sur la deuxième approche : des candidats franchissent, et sont relégués */
const withRed: Answers = Object.fromEntries(
  Object.entries(answers).map(([id, a]) => [id, { ...a, redLines: bank.questions.find(x => x.id === id)!.approaches.slice(1, 2).map(x => x.id) }]),
)
const plain = computeResults(manyCandidates, answers, {}, 'seed')
const flagged = computeResults(manyCandidates, withRed, {}, 'seed')
const ids = (rows: CandidateResult[]) => rows.map(r => r.candidateId)
const SCOPES: AgreeScope[] = ['top', 'flop', 'all']

describe('image « Accords et désaccords » : ses candidats', () => {
  it('le profil d’essai a des candidats relégués pour une ligne rouge, et des candidats hors de l’image', () => {
    expect(flagged.ranking.some(r => !r.compatible)).toBe(true)
    expect(flagged.ranking.length).toBeGreaterThan(AGREE_ROWS)
    expect(flagged.excluded.length + flagged.unranked.length).toBeGreaterThan(0)
  })

  it('les 5 plus proches : les 5 premiers de l’affiche, dans son ordre, avec ou sans les croix ; les autres à part', () => {
    for (const results of [plain, flagged])
      for (const showFlags of [false, true]) {
        const { shown, others } = agreeRanking(results, showFlags, 'top')
        const poster = posterRanking(results, showFlags)
        const order = [...poster.shown, ...poster.others]
        expect(shown).toHaveLength(AGREE_ROWS)
        expect(ids(shown)).toEqual(ids(order.slice(0, AGREE_ROWS)))
        expect(ids(others)).toEqual(ids(order.slice(AGREE_ROWS)))
        // Les premiers de l'image sont ceux de l'affiche (qui en montre POSTER_ROWS)
        expect(ids(shown)).toEqual(ids(poster.shown.slice(0, AGREE_ROWS)))
      }
    // Avec les croix, l'ordre du classement ; sans elles, l'affinité seule
    expect(ids(agreeRanking(flagged, true, 'top').shown)).toEqual(ids(flagged.ranking.slice(0, AGREE_ROWS)))
    expect(ids(agreeRanking(flagged, false, 'top').shown)).not.toEqual(ids(flagged.ranking.slice(0, AGREE_ROWS)))
  })

  it('les 5 plus éloignés : les 5 derniers, du plus éloigné au moins éloigné, comme l’affiche des plus éloignés', () => {
    for (const showFlags of [false, true]) {
      const { shown, others } = agreeRanking(flagged, showFlags, 'flop')
      const poster = posterRanking(flagged, showFlags, 'flop')
      expect(ids(shown)).toEqual(ids(poster.shown.slice(0, AGREE_ROWS)))
      const order = [...posterRanking(flagged, showFlags).shown, ...posterRanking(flagged, showFlags).others]
      expect(ids(shown)).toEqual(ids(order.slice(-AGREE_ROWS).reverse()))
      expect(ids(others)).toEqual(ids(order.slice(0, -AGREE_ROWS)))
      // Le plus éloigné porte le plus grand numéro
      const positions = posterPositions(flagged, showFlags)
      const nums = shown.map(r => positions.get(r.candidateId)!)
      expect(nums).toEqual([...nums].sort((a, b) => b - a))
    }
  })

  it('tous : les candidats classés, dans l’ordre de l’affiche, sans « autres » ; ni hors classement ni non classés', () => {
    for (const showFlags of [false, true]) {
      const { shown, others } = agreeRanking(flagged, showFlags, 'all')
      const poster = posterRanking(flagged, showFlags)
      expect(ids(shown)).toEqual(ids([...poster.shown, ...poster.others]))
      expect(others).toEqual([])
      expect(shown).toHaveLength(flagged.ranking.length)
      for (const id of [NARROW, ...EXCLUDED]) expect(ids(shown)).not.toContain(id)
    }
  })

  it('sans les croix, rien ne trahit les lignes rouges : sans elles, les mêmes avis donnent les mêmes candidats, dans le même ordre, sous les mêmes numéros', () => {
    let ties = 0
    for (const seed of ['seed', 'a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      const red = computeResults(manyCandidates, withRed, {}, seed)
      const none = computeResults(manyCandidates, answers, {}, seed)
      // Le tirage des ex aequo ne doit rien aux lignes rouges
      expect(red.drawOrder).toEqual(none.drawOrder)
      // Le cas à départager : un candidat relégué pour une ligne rouge au même pourcentage affiché qu'un autre qui ne l'est pas
      ties += red.ranking.filter(r => !r.compatible && red.ranking.some(o => o.compatible && displayScore(o.score) === displayScore(r.score))).length
      for (const scope of SCOPES) {
        const a = agreeRanking(red, false, scope)
        const b = agreeRanking(none, false, scope)
        expect(ids(a.shown), `${seed}, ${scope}`).toEqual(ids(b.shown))
        expect(ids(a.others), `${seed}, ${scope}`).toEqual(ids(b.others))
        expect(agreeAlt(manyCandidates, red, { showFlags: false, scope })).toBe(agreeAlt(manyCandidates, none, { showFlags: false, scope }))
      }
      for (const view of ['top', 'flop'] as const)
        expect(ids(posterRanking(red, false, view).shown), `${seed}, affiche ${view}`).toEqual(ids(posterRanking(none, false, view).shown))
      expect(posterPositions(red, false)).toEqual(posterPositions(none, false))
    }
    expect(ties).toBeGreaterThan(0)
  })

  it('peu de candidats : les 5 premiers sont tous les candidats', () => {
    const few = computeResults(pack, { q1: { ratings: { q1a: 1 }, redLines: [] } }, {}, 'seed')
    expect(few.ranking.length).toBeLessThanOrEqual(AGREE_ROWS)
    expect(agreeRanking(few, false, 'top')).toEqual(agreeRanking(few, false, 'all'))
    expect(agreeRanking(few, false, 'all')).toEqual({ shown: posterRanking(few, false).shown, others: [] })
  })
})

describe('image « Accords et désaccords » : barres et mise en page', () => {
  it('une même échelle pour toutes les barres de l’image : le plus grand compte de ses candidats', () => {
    for (const scope of SCOPES) {
      const { shown } = agreeRanking(flagged, true, scope)
      const counts = shown.flatMap(r => [r.breakdown.main, r.breakdown.other]).flatMap(t => [t.agree, t.disagree])
      const max = agreeScale(shown)
      expect(max).toBe(Math.max(1, ...counts))
      expect(counts.every(n => n <= max)).toBe(true)
    }
    // Les candidats de l'image seulement, pas ceux d'à côté ; au moins 1, même sans aucun avis compté
    const top = agreeRanking(flagged, true, 'top').shown
    expect(agreeScale(top)).toBeLessThanOrEqual(agreeScale(agreeRanking(flagged, true, 'all').shown))
    const empty = top.map(r => ({ ...r, breakdown: { main: { agree: 0, disagree: 0 }, other: { agree: 0, disagree: 0 } } }))
    expect(agreeScale(empty)).toBe(1)
    // Un candidat sans score n'a pas de barre : ses comptes ne fixent pas l'échelle
    const unknown = [{ ...top[0]!, score: null, breakdown: { main: { agree: 99, disagree: 0 }, other: { agree: 0, disagree: 0 } } }, ...top.slice(1)]
    expect(agreeScale(unknown)).toBeLessThan(99)
  })

  it('hauteur : celle de l’affiche pour 5 candidats ; pour tous, plus haute, au plus 1080 × 1920, des lignes serrées mais lisibles', () => {
    const tail = tailHeight(agreeRanking(flagged, true, 'top').others, true, offPosterText(1, 2))
    for (const scope of ['top', 'flop'] as const) expect(agreeLayout(AGREE_ROWS, tail, scope).height).toBe(IMAGE_H)
    const roomy = agreeLayout(AGREE_ROWS, tail, 'top').rowH
    expect(roomy).toBeGreaterThanOrEqual(88)
    let prev = Infinity
    for (let n = 1; n <= 22; n++) {
      const { height, rowH } = agreeLayout(n, 60, 'all')
      expect(height).toBeGreaterThanOrEqual(IMAGE_H)
      expect(height).toBeLessThanOrEqual(AGREE_MAX_H)
      // Les lignes et le pied tiennent dans l'image
      expect(height - 220 - 60 - n * rowH).toBeGreaterThanOrEqual(526)
      expect(rowH).toBeLessThanOrEqual(prev)
      expect(rowH).toBeGreaterThanOrEqual(50)
      prev = rowH
    }
    expect(agreeLayout(15, 60, 'all').height).toBe(AGREE_MAX_H)
  })

  it('chaque ligne, de la plus serrée à la plus large : l’axe des barres à 4 px au moins sous les jambages du nom, au-dessus du filet du bas ; des nombres et des partis lisibles', () => {
    for (let rowH = 50; rowH <= 112; rowH++) {
      const s = agreeRowSizes(rowH)
      const legs = s.nameBase + s.name * DESCENT
      expect(s.barMid - s.bar / 2 - s.tick - legs, `ligne de ${rowH} px`).toBeGreaterThanOrEqual(4)
      expect(s.barMid + s.bar / 2 + s.tick, `ligne de ${rowH} px`).toBeLessThanOrEqual(rowH - 2)
      // Les nombres, écrits au milieu de la barre, ne touchent ni le nom ni le filet
      expect(s.barMid - 0.36 * s.count - legs, `ligne de ${rowH} px`).toBeGreaterThan(2)
      expect(s.barMid + 0.36 * s.count, `ligne de ${rowH} px`).toBeLessThanOrEqual(rowH - 2)
      // Sur 1080 de large, les nombres à 24 px au moins, les partis à 19 (le plus petit texte de l'affiche)
      expect(s.count).toBeGreaterThanOrEqual(24)
      expect(s.party).toBeGreaterThanOrEqual(19)
      expect(s.bar).toBeGreaterThanOrEqual(12)
      expect(s.tick).toBeGreaterThanOrEqual(2)
    }
    // Les lignes de la mise en page restent dans cet intervalle : 5 lignes sous la plus longue fin (autres candidats
    // marqués, hors classement), jusqu'à 22 pour « Tous »
    for (let n = 1; n <= AGREE_ROWS; n++) for (const scope of ['top', 'flop'] as const) expect(agreeLayout(n, 144, scope).rowH).toBeGreaterThanOrEqual(92)
    for (let n = 1; n <= 22; n++) expect(agreeLayout(n, 60, 'all').rowH).toBeLessThanOrEqual(112)
  })
})

describe('image « Accords et désaccords » : textes', () => {
  it('sous-titre : quels candidats', () => {
    // Des candidats hors classement ou non classés : « classés » (décision du propriétaire du 2026-10-15)
    const off = flagged.unranked.length + flagged.excluded.length > 0
    expect(off).toBe(true)
    expect(agreeLead(flagged, 'top', 5)).toBe('Les 5 classés les plus proches')
    expect(agreeLead(flagged, 'flop', 5)).toBe('Les 5 classés les plus éloignés')
    const none = { ...flagged, unranked: [], excluded: [] }
    expect(agreeLead(none, 'top', 5)).toBe('Les 5 plus proches de mes idées')
    expect(agreeLead(none, 'flop', 5)).toBe('Les 5 plus éloignés de mes idées')
    expect(flopLead(flagged)).toBe('Les classés les plus éloignés de mes idées')
    expect(flopLead(none)).toBe('Les plus éloignés de mes idées')
    expect(agreeLead(flagged, 'all', flagged.ranking.length)).toBe(`Les ${flagged.ranking.length} candidats classés`)
    const few = computeResults(pack, { q1: { ratings: { q1a: 1 }, redLines: [] } }, {}, 'seed')
    expect(agreeLead(few, 'all', few.ranking.length)).toBe(`Les ${few.ranking.length} candidats`)
  })

  it('nom de fichier : un par portée, distinct de celui de l’affiche', () => {
    const date = new Date('2026-10-12T12:00:00Z')
    expect(agreeFileName(manyCandidates, date, 'top')).toBe(`isoloir-${MANY_ID}-2026-10-12-accords-plus-proches.jpg`)
    expect(agreeFileName(manyCandidates, date, 'flop')).toBe(`isoloir-${MANY_ID}-2026-10-12-accords-plus-eloignes.jpg`)
    expect(agreeFileName(manyCandidates, date, 'all')).toBe(`isoloir-${MANY_ID}-2026-10-12-accords-tous.jpg`)
  })

  it('texte de remplacement : chaque ligne (numéro, nom, pourcentage, croix, deux barres), les autres, puis les notes de pied', () => {
    const names = new Map(manyCandidates.candidates.map(c => [c.id, c.name]))
    for (const scope of SCOPES)
      for (const showFlags of [false, true]) {
        const alt = agreeAlt(manyCandidates, flagged, { showFlags, scope })
        expect(alt.startsWith(`Image « ${TITLE_AGREE} », ${agreeLead(flagged, scope, scope === 'all' ? flagged.ranking.length : AGREE_ROWS).replace(/^L/, 'l')}, ${manyCandidates.election.shortName}, sur ${flagged.answered} réponses.`)).toBe(true)
        const { shown, others } = agreeRanking(flagged, showFlags, scope)
        const positions = posterPositions(flagged, showFlags)
        let at = 0
        for (const r of shown) {
          const { main, other } = r.breakdown
          const row = `${positions.get(r.candidateId)}. ${names.get(r.candidateId)} ${Math.round(r.score!)}\u00a0%${showFlags && !r.compatible ? ' (croix)' : ''}\u00a0: ses approches principales, ${count(main.agree, 'accord')} et ${count(main.disagree, 'désaccord')}\u00a0; ses autres positions, ${count(other.agree, 'accord')} et ${count(other.disagree, 'désaccord')}.`
          const i = alt.indexOf(row, at)
          expect(i, row).toBeGreaterThan(at)
          at = i
        }
        // Pas de croix sans la case
        if (!showFlags) expect(alt).not.toMatch(/croix/)
        // Les autres candidats, en une fois, comme sur l'image
        if (others.length) expect(alt).toContain(` Puis ${othersText(others, scope === 'flop' ? 'flop' : 'top', showFlags)}`)
        else expect(alt).not.toMatch(/ Puis /)
        // Les candidats hors classement et non classés, puis les notes de pied, les mêmes que l'affiche
        expect(alt).toContain(` ${offPosterText(flagged.unranked.length, flagged.excluded.length)}.`)
        expect(alt.endsWith(posterNotes(flagged, showFlags).map(n => ` ${n}`).join('') || '.')).toBe(true)
      }
    expect(agreeAlt(manyCandidates, flagged, { showFlags: true, scope: 'top' })).toMatch(/, dont \d+ marqués? d’une croix\./)
  })

  it('notes de pied : sans les croix, toujours la même phrase, qu’un candidat franchisse ou non une ligne rouge', () => {
    const a = agreeAlt(manyCandidates, plain, { showFlags: false, scope: 'top' })
    const b = agreeAlt(manyCandidates, flagged, { showFlags: false, scope: 'top' })
    const note = posterNotes(plain, false)[0]!
    expect(a.endsWith(` ${note}`)).toBe(true)
    expect(b.endsWith(` ${note}`)).toBe(true)
    expect(agreeAlt(manyCandidates, flagged, { showFlags: true, scope: 'top' }).endsWith(` ${posterNotes(flagged, true)[0]}`)).toBe(true)
  })

  it('un candidat sans position connue : la phrase de la page, sans barre', () => {
    const top = agreeRanking(plain, false, 'all').shown
    const results = { ...plain, ranking: plain.ranking.map(r => (r.candidateId === top[0]!.candidateId ? { ...r, score: null } : r)) }
    const alt = agreeAlt(manyCandidates, results, { showFlags: false, scope: 'all' })
    const name = manyCandidates.candidates.find(c => c.id === top[0]!.candidateId)!.name
    expect(alt).toContain(`${name} –\u00a0%\u00a0: ${AGREE_NONE.charAt(0).toLowerCase()}${AGREE_NONE.slice(1)}`)
  })

  it('l’affiche garde ses 7 lignes', () => {
    expect(posterRanking(flagged, false).shown).toHaveLength(POSTER_ROWS)
  })
})
