// « À table » : les mots et les garde-fous. Ni sondage, ni score, ni gagnant, ni pourcentage dans les phrases de la
// table et de son image ; « tous » et « toute la table » jamais sans « ou presque » ; aucun stockage ni partage dans
// son code ; la table ne reçoit que l'élection (ni la feuille du propriétaire, ni de quoi l'effacer).

import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RULES, SECRET, SECTION, TALK_RULES, verdictLine } from '../src/core/table/copy'
import { PICTURE_FOOT, pictureAlt, pictureLines } from '../src/core/table/image'
import type { Shown, Verdict } from '../src/core/table/count'
import { addBallot, emptyTotals, summarize } from '../src/core/table/count'
import { elections } from '../src/elections/all'

const SRC = resolve(__dirname, '../src')
const BANNED = /sondage|échantillon|intentions? de vote|simulation de vote|gagnant|vainqueur|\bscore|classement|\bpoints?\b|%|les Français/i

const shownAll: Shown[] = [{ words: 'peu' }, { words: 'presque-tous' }, { exact: 3 }]
const verdicts: Verdict[] = ['reunit', 'refuse', 'divise', 'aucun']
const lines = verdicts.flatMap(v => shownAll.flatMap(a => shownAll.map(d => verdictLine(v, a, d))))

describe('les mots de la table', () => {
  it('aucun mot de sondage, de score ni de compétition', () => {
    for (const t of [...RULES, ...SECRET, ...TALK_RULES, ...Object.values(SECTION), ...lines, ...PICTURE_FOOT]) expect(t, t).not.toMatch(BANNED)
  })

  it('« tous » et « toute la table » sont toujours suivis de « ou presque »', () => {
    for (const t of [...lines, ...SECRET]) {
      for (const m of t.matchAll(/\b(toute la table|tous)\b/gi)) {
        const after = t.slice(m.index! + m[0].length, m.index! + m[0].length + 12)
        if (/^ les autres| ceux/.test(after)) continue
        expect(after, t).toMatch(/^ ou presque/)
      }
    }
  })

  it('l’image ne dit ni « toute la table », ni le nombre de personnes, ni un candidat', () => {
    const pack = elections[0]!
    const qs = pack.bank.questions.filter(q => q.tier === 'essentiel').slice(0, 2)
    const unanimous = emptyTotals(qs)
    const ballots = Array.from({ length: 6 }, () => Object.fromEntries(qs.map(q => [q.id, { ratings: { [q.approaches[0]!.id]: 1 as const }, redLines: [] }])))
    const totals = ballots.reduce((t, b) => addBallot(t, qs, b), unanimous)
    const { lines: pl, more } = pictureLines(summarize(totals, qs, 'graine'), qs)
    const alt = pictureAlt(pl, more)
    expect(alt).not.toMatch(/toute la table|\b6\b|personnes/i)
    for (const c of pack.candidates) expect(alt).not.toContain(c.name)
    expect(alt).toMatch(/sans valeur statistique/)
  })
})

describe('le code de la table', () => {
  const files = ['ui/table', 'ui/questionnaire/table', 'core/table'].flatMap(d =>
    readdirSync(join(SRC, d))
      .filter(f => /\.tsx?$/.test(f))
      .map(f => join(SRC, d, f)),
  )

  it('aucun stockage du navigateur ni partage vers une autre application', () => {
    expect(files.length).toBeGreaterThan(10)
    for (const f of files) {
      const code = readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '')
      expect(code, f).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|caches\.open|navigator\.share/)
    }
  })

  it('un seul chargement à la demande, celui de l’écran', () => {
    for (const f of files) {
      const imports = readFileSync(f, 'utf8').match(/(?<!typeof )\bimport\(/g) ?? []
      if (f.endsWith(join('ui', 'table', 'load.ts'))) expect(imports.length).toBe(1)
      else expect(imports.length, f).toBe(0)
    }
  })

  it('app.tsx donne à la table l’élection seule, et pas de lecteur vidéo pendant une table', () => {
    const app = readFileSync(join(SRC, 'app.tsx'), 'utf8')
    expect(app).toMatch(/m => <m\.Table pack=\{pack\} Sheet=\{Sheet\} \/>/)
    expect(app).toMatch(/route\.name === 'table' \? null : <VideoHost/)
  })
})
