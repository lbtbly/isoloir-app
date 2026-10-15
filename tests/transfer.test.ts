// Codes de reprise (src/core/transfer) : aller-retour sans perte, robustesse aux mises à jour de la banque, refus des
// fautes de frappe, taille des QR codes, et numérotation stable (ajout seulement) des questions et des thèmes.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { importNotes } from '../src/core/exportData'
import { mulberry32 } from '../src/core/rng'
import { withBase } from '../src/core/routes'
import { freshState, sanitizeState, type SessionState } from '../src/core/storage'
import { ALPHABET, crc32, fromBase32, groupCode, normalizeCode, toBase32 } from '../src/core/transfer/base32'
import { BitReader, BitWriter } from '../src/core/transfer/bits'
import { decodeTransferRaw, encodeTransfer, letterIndex, looksLikeCode, parseCode } from '../src/core/transfer/codec'
import { transferMailBody, transferMailto } from '../src/core/transferMail'
import { qrModules, qrPath, qrVersion } from '../src/core/transfer/qr'
import type { Answer, ElectionPack, Rating } from '../src/core/types'
import { elections } from '../src/elections/all'
import { presidentielle2027 } from '../src/elections/presidentielle-2027'
import { pack as fixture } from './fixture'

const small: ElectionPack = { ...fixture, transfer: { tag: 5, questions: { q1: 0, q2: 1, q3: 2 }, topics: { t1: 0, t2: 1 } } }

/** Une feuille au hasard, reproductible : avis, lignes rouges, questions passées, révisions, priorités, thèmes approfondis */
function randomState(pack: ElectionPack, seed: number, share = 0.6): SessionState {
  const rnd = mulberry32(seed)
  const answers: Record<string, Answer> = {}
  for (const q of pack.bank.questions) {
    if (rnd() > share) continue
    if (rnd() < 0.08) {
      answers[q.id] = { ratings: {}, redLines: [], skipped: true }
      continue
    }
    const ratings: Record<string, Rating> = {}
    const redLines: string[] = []
    for (const a of q.approaches) {
      const x = rnd()
      if (x < 0.3) continue
      ratings[a.id] = x < 0.65 ? 1 : -1
      if (x > 0.92) redLines.push(a.id)
    }
    if (!Object.keys(ratings).length) ratings[q.approaches[0]!.id] = 1
    answers[q.id] = { ratings, redLines, ...(rnd() < 0.7 ? { rev: rnd() < 0.9 ? 1 : 2 + Math.floor(rnd() * 5) } : {}) }
  }
  const topics = pack.bank.topics.map(t => t.id)
  const weights = Object.fromEntries(topics.filter(() => rnd() < 0.15).slice(0, 3).map(t => [t, [2, 0.5, 1][Math.floor(rnd() * 3)]]))
  const seedHex = Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(rnd() * 16)]).join('')
  return {
    ...freshState(pack.election.id, pack.election.dataVersion),
    seed: seedHex,
    answers,
    weights: weights as SessionState['weights'],
    deepTopics: topics.filter(() => rnd() < 0.2),
    essentialDoneAt: rnd() < 0.5 ? new Date(Date.UTC(2026, 9, 1 + Math.floor(rnd() * 20), 10, Math.floor(rnd() * 60), Math.floor(rnd() * 60))).toISOString() : null,
  }
}

/**
 * Ce qu'une feuille doit retrouver à l'arrivée : tout, sauf la date d'enregistrement et le classement mémorisé ; la date
 * du questionnaire rapide voyage à la seconde près
 */
const essentials = (s: SessionState) => ({
  ...s,
  updatedAt: undefined,
  lastSeenRanking: undefined,
  essentialDoneAt: s.essentialDoneAt && new Date(Math.floor(Date.parse(s.essentialDoneAt) / 1000) * 1000).toISOString(),
})

describe('base 32 et somme de contrôle', () => {
  it('fait l’aller-retour pour toutes les longueurs', () => {
    const rnd = mulberry32(7)
    for (let n = 0; n < 40; n++) {
      const bytes = Uint8Array.from({ length: n }, () => Math.floor(rnd() * 256))
      const text = toBase32(bytes)
      expect([...text].every(c => ALPHABET.includes(c))).toBe(true)
      expect(fromBase32(text)).toEqual(bytes)
    }
  })

  it('remet en forme un code saisi à la main', () => {
    expect(normalizeCode(' ab-cd ef\ngh·OIL ')).toBe('ABCDEFGH011')
    expect(groupCode('ABCDEFGHJK')).toEqual(['ABCD', 'EFGH', 'JK'])
  })

  it('calcule le CRC-32 standard', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })

  it('écrit et relit bits et codes gamma', () => {
    const w = new BitWriter()
    w.write(5, 3)
    w.gamma(1)
    w.gamma(300)
    w.bit(true)
    w.write(2 ** 32 - 1, 32)
    const r = new BitReader(w.bytes())
    expect([r.read(3), r.gamma(), r.gamma(), r.bit(), r.read(32)]).toEqual([5, 1, 300, true, 2 ** 32 - 1])
  })
})

describe('codes de reprise', () => {
  it('lit la lettre des deux formes d’identifiant d’approche', () => {
    expect(letterIndex('retraites-1', 'retraites-1-c')).toBe(2)
    expect(letterIndex('q1', 'q1a')).toBe(0)
    expect(letterIndex('q1', 'q10a')).toBe(-1)
    expect(letterIndex('q1', 'q1-z')).toBe(-1)
  })

  it('fait l’aller-retour sans perte sur la présidentielle', () => {
    const pack = presidentielle2027
    for (let seed = 1; seed <= 60; seed++) {
      const s = sanitizeState(randomState(pack, seed, seed % 3 === 0 ? 1 : 0.4), pack)!
      const back = parseCode(encodeTransfer(s, pack), pack)
      expect(back.ok).toBe(true)
      if (!back.ok) continue
      expect(essentials(back.state)).toEqual(essentials(s))
      expect(back.source).toBe('code')
      expect(back.dropped).toBe(0)
    }
  })

  it('fait l’aller-retour d’une feuille vierge et d’une feuille de test sans version datée', () => {
    const blank = freshState(small.election.id, small.election.dataVersion)
    const back = parseCode(encodeTransfer(blank, small), small)
    expect(back.ok && essentials(back.state)).toEqual(essentials(blank))
    const s = sanitizeState(randomState(small, 3, 1), small)!
    const again = parseCode(encodeTransfer(s, small), small)
    expect(again.ok && essentials(again.state)).toEqual(essentials(s))
    expect(again.ok && again.fromVersion).toBe(null)
  })

  it('garde la version des données du code et la signale', () => {
    const pack = presidentielle2027
    const s = { ...sanitizeState(randomState(pack, 4), pack)!, dataVersion: '2026-10-08.2' }
    const back = parseCode(encodeTransfer(s, pack), pack)
    expect(back.ok && back.fromVersion).toBe('2026-10-08.2')
    expect(back.ok && back.state.dataUpdatedFrom).toBe('2026-10-08.2')
    if (back.ok) expect(importNotes(back, pack)[0]).toMatch(/version antérieure/)
    const later = parseCode(encodeTransfer({ ...s, dataVersion: '2027-01-02.1' }, pack), pack)
    if (later.ok) expect(importNotes(later, pack)[0]).toMatch(/plus récente/)
  })

  it('accepte le code tapé en minuscules, par groupes, avec des O pour des 0', () => {
    const pack = presidentielle2027
    const s = sanitizeState(randomState(pack, 11, 0.2), pack)!
    const code = encodeTransfer(s, pack)
    const messy = groupCode(code).join(' - ').toLowerCase().replace(/0/g, 'o').replace(/1/g, 'l')
    const back = parseCode(`\n ${messy} \n`, pack)
    expect(back.ok && essentials(back.state)).toEqual(essentials(s))
    expect(looksLikeCode(messy)).toBe(true)
    expect(looksLikeCode('{"state": {}}')).toBe(false)
  })

  it('refuse chaque faute de frappe d’un caractère et chaque inversion de deux voisins', () => {
    const pack = presidentielle2027
    const code = encodeTransfer(sanitizeState(randomState(pack, 5, 0.25), pack)!, pack)
    for (let i = 0; i < code.length; i++) {
      for (const c of ALPHABET) {
        if (c === code[i]) continue
        expect(parseCode(code.slice(0, i) + c + code.slice(i + 1), pack).ok).toBe(false)
      }
      if (i + 1 < code.length && code[i] !== code[i + 1]) {
        expect(parseCode(code.slice(0, i) + code[i + 1] + code[i] + code.slice(i + 2), pack).ok).toBe(false)
      }
    }
    expect(parseCode(code.slice(0, -1), pack).ok).toBe(false)
    expect(parseCode(code + 'Z', pack).ok).toBe(false)
  })

  it('refuse un code vide, étranger, d’une autre élection ou d’une version plus récente', () => {
    const pack = presidentielle2027
    expect(parseCode('', pack)).toEqual({ ok: false, error: 'Le code est vide.' })
    expect(parseCode('ÉLECTION!', pack).ok).toBe(false)
    const other = encodeTransfer(freshState(small.election.id, small.election.dataVersion), small)
    expect(parseCode(other, { ...small, election: { ...small.election }, transfer: { ...small.transfer!, tag: 6 } })).toEqual({
      ok: false,
      error: 'Ce code concerne une autre élection.',
    })
    // Version 2 du format : réécrite à la main, somme de contrôle comprise
    const bytes = fromBase32(other)!
    const payload = bytes.slice(0, -4)
    payload[0] = (payload[0]! & 0x0f) | 0x20
    const out = new Uint8Array(bytes.length)
    out.set(payload)
    new DataView(out.buffer).setUint32(payload.length, crc32(payload))
    const res = parseCode(toBase32(out), small)
    expect(!res.ok && res.error).toMatch(/version plus récente/)
  })

  it('résiste aux mises à jour de la banque : approche ajoutée, retirée, question retirée ou inconnue, révision', () => {
    const s: SessionState = {
      ...freshState('test', '1'),
      answers: {
        q1: { ratings: { q1a: 1, q1b: -1, q1c: -1 }, redLines: ['q1c'], rev: 1 },
        q2: { ratings: { q2b: 1 }, redLines: [] },
        q3: { ratings: {}, redLines: [], skipped: true },
      },
    }
    const code = encodeTransfer(s, small)
    const q = (id: string) => small.bank.questions.find(x => x.id === id)!

    // Une approche « d » ajoutée à q1, et q1 révisée : la réponse est gardée, à revoir
    const grown: ElectionPack = {
      ...small,
      election: { ...small.election, revisionTracking: true },
      bank: { ...small.bank, questions: [{ ...q('q1'), rev: 2, approaches: [...q('q1').approaches, { id: 'q1d', text: 'D' }] }, q('q2'), q('q3')] },
    }
    const a = parseCode(code, grown)
    expect(a.ok && a.state.answers.q1).toEqual(s.answers.q1)
    expect(a.ok && a.review).toBe(1)

    // L'approche « b » de q1 retirée : « c » garde sa ligne rouge, rien ne glisse sur une autre lettre
    const shrunk: ElectionPack = {
      ...small,
      bank: { ...small.bank, questions: [{ ...q('q1'), approaches: q('q1').approaches.filter(x => x.id !== 'q1b') }, q('q2'), q('q3')] },
    }
    const b = parseCode(code, shrunk)
    expect(b.ok && b.state.answers.q1).toEqual({ ratings: { q1a: 1, q1c: -1 }, redLines: ['q1c'], rev: 1 })

    // q2 retirée de la banque (son numéro reste) : réponse comptée comme ignorée
    const without: ElectionPack = { ...small, bank: { ...small.bank, questions: [q('q1'), q('q3')] } }
    const c = parseCode(code, without)
    expect(c.ok && c.dropped).toBe(1)
    expect(c.ok && Object.keys(c.state.answers)).toEqual(['q1', 'q3'])

    // Code d'une version plus récente du site, avec une question que celle-ci ne numérote pas encore
    const newer: ElectionPack = {
      ...small,
      transfer: { ...small.transfer!, questions: { ...small.transfer!.questions, q4: 3 } },
      bank: { ...small.bank, questions: [...small.bank.questions, { ...q('q3'), id: 'q4', approaches: [{ id: 'q4a', text: 'A' }] }] },
    }
    const d = parseCode(encodeTransfer({ ...s, answers: { ...s.answers, q4: { ratings: { q4a: 1 }, redLines: [] } } }, newer), small)
    expect(d.ok && d.dropped).toBe(1)
    expect(d.ok && d.state.answers).toEqual(s.answers)
  })

  it('met dans l’e-mail à soi-même un code qui se relit, la marche à suivre et la mise en garde', () => {
    const pack = presidentielle2027
    const s = sanitizeState(randomState(pack, 21, 0.3), pack)!
    const code = encodeTransfer(s, pack)
    const page = withBase('', '/autre-appareil')
    const body = transferMailBody(pack, code, page, new Date('2026-10-15T10:00:00Z'))
    const lines = body.split('\r\n')
    const codeLines = lines.slice(2, lines.indexOf('', 2))
    const back = parseCode(codeLines.join('\n'), pack)
    expect(back.ok && essentials(back.state)).toEqual(essentials(s))
    expect(body).toContain(`/${page}`)
    expect(body).toMatch(/Ne pas le transférer ni le publier/)
    const link = transferMailto(pack, code, page)
    expect(link.startsWith('mailto:?subject=')).toBe(true)
    // Aucune réponse en clair dans l'adresse du site citée par le message : seulement la page
    expect(decodeURIComponent(link)).not.toMatch(/autre-appareil\/[0-9A-Z]/)
    expect(link.length).toBeLessThan(2000)
  })

  it('refuse de fabriquer un code pour une question sans numéro', () => {
    const s = { ...freshState('test', '1'), answers: { q1: { ratings: { q1a: 1 as const }, redLines: [] } } }
    expect(() => encodeTransfer(s, { ...small, transfer: { ...small.transfer!, questions: {} } })).toThrow(/sans numéro/)
  })
})

describe('taille des codes et des QR codes', () => {
  const pack = presidentielle2027
  const versionOf = (code: string) => qrVersion(qrModules(code))

  it('reste lisible : court pour le premier dépouillement, version 14 au pire', () => {
    const order = Object.entries(pack.transfer!.questions).sort((a, b) => a[1] - b[1]).map(([id]) => id)
    const sheet = (n: number): SessionState => {
      const answers: Record<string, Answer> = {}
      for (const id of order.slice(0, n)) {
        const q = pack.bank.questions.find(x => x.id === id)!
        answers[id] = { ratings: Object.fromEntries(q.approaches.map((a, i) => [a.id, (i % 2 ? -1 : 1) as Rating])), redLines: [], rev: 1 }
      }
      const topics = pack.bank.topics.map(t => t.id)
      return { ...freshState(pack.election.id, pack.election.dataVersion), answers, weights: { [topics[0]!]: 2, [topics[1]!]: 2, [topics[2]!]: 2 } }
    }
    const step1 = encodeTransfer(sheet(10), pack)
    const quick = encodeTransfer(sheet(22), pack)
    expect(step1.length).toBeLessThanOrEqual(100)
    expect(quick.length).toBeLessThanOrEqual(150)
    expect(versionOf(step1)).toBeLessThanOrEqual(5)
    expect(versionOf(quick)).toBeLessThanOrEqual(6)
    // Le pire : toutes les questions, toutes les approches notées, tous les thèmes approfondis, chaque question
    // révisée trois fois (version 13 sans révision : 69 modules de côté, lisibles sur un écran)
    const worst = sheet(pack.bank.questions.length)
    for (const a of Object.values(worst.answers)) a.rev = 4
    worst.deepTopics = pack.bank.topics.map(t => t.id)
    worst.essentialDoneAt = new Date().toISOString()
    expect(versionOf(encodeTransfer(worst, pack))).toBeLessThanOrEqual(14)
  })

  it('dessine le symbole d’un seul chemin, sans marge', () => {
    const m = qrModules('0123ABCD')
    expect(m.length).toBe(21)
    expect(m[0]!.slice(0, 7).every(Boolean)).toBe(true)
    expect(qrPath([[true, true, false, true]])).toBe('M0 0h2v1h-2zM3 0h1v1h-1z')
  })
})

describe('numérotation des codes de reprise', () => {
  for (const pack of elections) {
    describe(pack.election.id, () => {
      const slots = pack.transfer
      it('a un numéro pour chaque question et chaque thème de la banque', () => {
        expect(slots, 'pack.transfer absent : ajoutez src/elections/<id>/transfer.ts').toBeDefined()
        const missingQ = pack.bank.questions.map(q => q.id).filter(id => slots!.questions[id] === undefined)
        const missingT = pack.bank.topics.map(t => t.id).filter(id => slots!.topics[id] === undefined)
        const next = (rec: Record<string, number>) => Math.max(-1, ...Object.values(rec)) + 1
        expect(missingQ, `à ajouter dans transfer.ts à partir du numéro ${next(slots!.questions)}`).toEqual([])
        expect(missingT, `à ajouter dans transfer.ts à partir du numéro ${next(slots!.topics)}`).toEqual([])
      })

      it('n’attribue jamais deux fois le même numéro', () => {
        for (const rec of [slots!.questions, slots!.topics]) {
          const values = Object.values(rec)
          expect(new Set(values).size).toBe(values.length)
          expect(values.every(v => Number.isInteger(v) && v >= 0)).toBe(true)
        }
        expect(slots!.tag).toBeGreaterThanOrEqual(1)
        expect(slots!.tag).toBeLessThan(64)
      })

      it('donne à chaque approche une lettre de a à p après l’identifiant de sa question', () => {
        const bad = pack.bank.questions.flatMap(q => q.approaches.filter(a => !new RegExp(`^${q.id}-[a-p]$`).test(a.id)).map(a => a.id))
        expect(bad).toEqual([])
      })
    })
  }

  it('donne un numéro d’élection différent à chaque élection', () => {
    const tags = elections.map(p => p.transfer?.tag)
    expect(new Set(tags).size).toBe(tags.length)
  })

  it('ne change ni ne retire aucun numéro attribué (ajout seulement)', () => {
    const frozen = JSON.parse(readFileSync(join(__dirname, 'fixtures/transfer-slots-presidentielle-2027.json'), 'utf8'))
    expect(presidentielle2027.transfer!.tag).toBe(frozen.tag)
    expect(presidentielle2027.transfer!.questions).toMatchObject(frozen.questions)
    expect(presidentielle2027.transfer!.topics).toMatchObject(frozen.topics)
  })

  it('relit toujours le code de référence du format 1', () => {
    const golden = JSON.parse(readFileSync(join(__dirname, 'fixtures/transfer-golden.json'), 'utf8'))
    const raw = decodeTransferRaw(golden.code, presidentielle2027, new Date(golden.decodedAt))
    expect(raw.ok).toBe(true)
    if (!raw.ok) return
    expect(raw.dataVersion).toBe(golden.dataVersion)
    expect(raw.state.seed).toBe(golden.seed)
    expect(raw.state.weights).toEqual(golden.weights)
    expect(raw.state.deepTopics).toEqual(golden.deepTopics)
    expect(raw.state.essentialDoneAt).toBe(golden.essentialDoneAt)
    // Questions et approches encore dans la banque : les mêmes avis qu'à la fabrication du code
    const answers = raw.state.answers as Record<string, Answer>
    for (const [qid, expected] of Object.entries(golden.answers as Record<string, Answer>)) {
      const q = presidentielle2027.bank.questions.find(x => x.id === qid)
      if (!q) continue
      const ids = new Set(q.approaches.map(a => a.id))
      const keep = (r: Record<string, Rating>) => Object.fromEntries(Object.entries(r).filter(([id]) => ids.has(id)))
      expect(answers[qid]?.ratings, qid).toEqual(keep(expected.ratings))
      expect(answers[qid]?.redLines, qid).toEqual(expected.redLines.filter(id => ids.has(id)))
      expect(!!answers[qid]?.skipped, qid).toBe(!!expected.skipped)
    }
  })
})
