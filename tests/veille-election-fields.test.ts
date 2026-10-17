// Champs d'election.ts écrits par la veille automatique (tools/veille/election-fields.mjs et lib/electionFields.mjs,
// contrat tools/veille/CONTRACT.md §d.9, annexes A2 et A3) : dataVersion, dataFrozenAt, la première note, l'entrée du
// journal (l'effet sur le classement d'abord, « votre réponse est à revoir », la phrase sur l'IA en dernier, ni score ni
// nom masqué) et contextDate. Le texte réel d'election.ts est lu, jamais modifié : les écritures vont dans une copie,
// rechargée comme module pour vérifier ce que le site lirait, et la ligne de commande tourne dans un dépôt git temporaire.
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { election } from '../src/elections/presidentielle-2027/election'
import { firstSentence as homeFirstSentence } from '../src/ui/screens/HomeBack'
import { hiddenNamesRegex, parseCandidatesTs } from '../tools/veille/lib/apply.mjs'
import {
  AI_SENTENCE, affectsRanking, changelogComment, changelogText, deList, firstSentence, frenchSpacing, kindOfRun, nextDataVersion, notesFirst,
  parseChangelog, patchContextDate, patchElection, textProblems, tsString, tsUnquote,
} from '../tools/veille/lib/electionFields.mjs'
import { REPO_ROOT } from './helpers/workflow-harness'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- valeurs JSON lues ou fabriquées sans type propre
type Json = Record<string, any>
const NB = ' '
const S = join(REPO_ROOT, 'src/elections/presidentielle-2027')
const D = join(REPO_ROOT, 'research/presidentielle-2027')
const electionText = readFileSync(join(S, 'election.ts'), 'utf8')
const configText = readFileSync(join(D, 'config.json'), 'utf8')
const config = JSON.parse(configText)
const bankJson = JSON.parse(readFileSync(join(D, 'bank.json'), 'utf8'))
const cards = parseCandidatesTs(readFileSync(join(S, 'candidates.ts'), 'utf8'))
const hiddenRe = hiddenNamesRegex(election.hidden ?? [], cards)
const nameOf = (id: string) => config.candidates.find((c: Json) => c.id === id)?.name ?? id
const TODAY = '2026-10-19'
const RUN = '2026-10-19-hebdo'
/**
 * election.ts figé pour les essais : le texte réel sans les entrées de la veille (les publications légitimes en
 * ajoutent), dataVersion et dataFrozenAt ramenés au 15 octobre 2026 ; les attentes ne dépendent plus des publications
 */
const ownerText = (() => {
  let t = electionText
  for (const e of [...parseChangelog(electionText).entries].reverse()) if (e.auto) t = t.slice(0, e.start) + t.slice(e.end)
  return t
})()
const FIXED_TEXT = ownerText.replace(/^( {2}dataVersion: ')[^'\n]*(',)$/m, '$12026-10-15.2$2').replace(/^( {2}dataFrozenAt: ')[^'\n]*(',)$/m, '$12026-10-15$2')

const published = (cid: string, aid: string, cls: string, kind = 'set') => ({ claimKey: 'a'.repeat(40), candidateId: cid, questionId: aid.replace(/-[^-]+$/, ''), approachId: aid, kind, class: cls, cause: 'prise-de-position', statedAt: '2026-10-16', before: null, after: null })
const report = (pub: Json[], approaches: Json[] = []) => ({ runId: RUN, published: pub, held: [], dropped: [], approaches, counts: { published: pub.length, held: 1, dropped: 2 } })
const text = (r: Json, o: Json = {}) => changelogText({ report: r, questions: bankJson.bank.questions, topics: bankJson.bank.topics, nameOf, today: TODAY, ...o })

const temps: string[] = []
const newTemp = (prefix: string) => {
  const d = mkdtempSync(join(tmpdir(), prefix))
  temps.push(d)
  return d
}
afterEach(() => {
  for (const d of temps.splice(0)) rmSync(d, { recursive: true, force: true })
})
/** Charge un texte d'election.ts comme le ferait le site (module TypeScript), depuis une copie temporaire */
async function load(ts: string) {
  const f = join(newTemp('isoloir-fields-'), `election-${Math.random().toString(36).slice(2)}.ts`)
  writeFileSync(f, ts)
  return (await import(pathToFileURL(f).href)).election
}

describe('lib/electionFields : textes', () => {
  it('espaces insécables du français, comme les entrées existantes', () => {
    expect(frenchSpacing('La question « Quelle dette ? » change : oui; non!')).toBe(`La question «${NB}Quelle dette${NB}?${NB}» change${NB}: oui${NB}; non${NB}!`)
    expect(frenchSpacing(`Déjà «${NB}bon${NB}»${NB}: rien`)).toBe(`Déjà «${NB}bon${NB}»${NB}: rien`)
    // Les entrées du propriétaire suivent déjà cette règle
    for (const e of election.changelog.slice(0, 2)) expect(textProblems(e.text).filter(p => /insécable/.test(p)), e.date).toEqual([])
  })

  it('la première phrase est celle de l’accueil (HomeBack)', () => {
    for (const t of [
      `Positions revues pour 3 candidats, dont un changement d’approche principale pour Gabriel Attal sur «${NB}Quelle dette${NB}?${NB}». La suite.`,
      'Passe de 1.5 à 2. Le reste non.',
      'Une seule phrase sans point final',
      ...election.changelog.map(e => e.text),
    ]) expect(firstSentence(t)).toBe(homeFirstSentence(t))
  })

  it('validateurs : première phrase, phrase sur l’IA, ni % ni score, noms masqués, espaces insécables', () => {
    const ok = `Positions revues pour Gabriel Attal${NB}: résumés mis à jour. Positions relevées le 19 octobre 2026 et ${AI_SENTENCE}`
    expect(textProblems(ok, { hiddenRe, entry: true })).toEqual([])
    expect(textProblems(`Court. Positions relevées le 19 octobre 2026 et ${AI_SENTENCE}`, { entry: true })[0]).toMatch(/première phrase/)
    expect(textProblems(ok.replace(AI_SENTENCE, 'vérifiées.'), { entry: true })).toContain('la phrase sur la vérification par une IA manque à la fin')
    expect(textProblems(ok.replace('résumés', 'score et 5 %'), { entry: true })).toEqual(expect.arrayContaining(['pourcentage', '« score »']))
    expect(textProblems(ok.replace('Gabriel Attal', 'Ségolène Royal'), { hiddenRe, entry: true })).toContain('nomme un candidat masqué')
    expect(textProblems('Une phrase : sans espace insécable.')).toContain('espace insécable manquante avant : ; ? ! ou »')
    expect(textProblems('Une « citation').join()).toMatch(/après «/)
  })

  it('dataVersion : .N+1 le même jour, .1 un autre jour, jamais au-delà de 31 (30)', () => {
    expect(nextDataVersion('2026-10-15.2', TODAY)).toBe('2026-10-19.1')
    expect(nextDataVersion('2026-10-19.3', TODAY)).toBe('2026-10-19.4')
    expect(nextDataVersion(null, TODAY)).toBe('2026-10-19.1')
    let code = null
    try {
      nextDataVersion('2026-10-19.31', TODAY)
    } catch (err) {
      const e = err as { status: number; stdout: unknown; stderr?: unknown; code?: number }
      code = e.code
    }
    expect(code).toBe(30)
  })

  it('notes[0] : une seule date ; sinon par date, « les autres » au plus ancien et plus nombreux, élision', () => {
    const p = (id: string, checkedAt: string) => ({ id, name: nameOf(id), checkedAt })
    expect(notesFirst([p('attal', TODAY), p('philippe', TODAY)])).toBe('Les positions de tous les candidats présentés ont été relevées à nouveau le 19 octobre 2026.')
    const many = [p('attal', TODAY), p('philippe', TODAY), p('polony', '2026-10-14'), p('arthaud', '2026-10-09'), p('lepen', '2026-10-09'), p('zemmour', '2026-10-09')]
    expect(notesFirst(many)).toBe(`Les positions de Gabriel Attal et d’Édouard Philippe ont été relevées à nouveau le 19 octobre 2026${NB}; celles de Natacha Polony, le 14 octobre 2026${NB}; les autres n’ont pas été relevées à nouveau depuis le 9 octobre 2026.`)
    // Le plus nombreux est le plus récent : il devient « les autres », à sa date
    const recent = [p('attal', TODAY), p('philippe', TODAY), p('lepen', TODAY), p('arthaud', '2026-10-09')]
    expect(notesFirst(recent)).toBe(`Les positions de Nathalie Arthaud ont été relevées à nouveau le 9 octobre 2026${NB}; celles des autres candidats présentés, le 19 octobre 2026.`)
    expect(deList(['Édouard Philippe', 'Anasse Kazib', 'Marine Le Pen'])).toBe('d’Édouard Philippe, d’Anasse Kazib et de Marine Le Pen')
    for (const t of [notesFirst(many), notesFirst(recent)]) expect(textProblems(t, { hiddenRe })).toEqual([])
  })

  it('journal sans effet sur le classement : les noms, « approches principales inchangées », la phrase sur l’IA en dernier', () => {
    const r = report([published('attal', 'retraites-2-d', 'secondaire'), published('lisnard', 'retraites-2-c', 'forme')])
    expect(affectsRanking(r)).toBe(false)
    const t = text(r)
    expect(t).toBe(`Positions revues pour 2 candidats (Gabriel Attal et David Lisnard)${NB}: résumés, sources ou positions compatibles mis à jour, approches principales inchangées. Positions relevées le 19 octobre 2026 et ${AI_SENTENCE}`)
    expect(textProblems(t, { hiddenRe, entry: true })).toEqual([])
  })

  it('journal avec effet : approche principale, approche ajoutée (« votre réponse est à revoir »), question ajoutée, profil remesuré', () => {
    const r = report(
      [published('attal', 'retraites-2-b', 'principale'), published('attal', 'retraites-2-c', 'principale', 'remove'), published('lepen', 'finances_publiques-2-f', 'renversement'), published('lisnard', 'retraites-3-f', 'nouvelle-approche')],
      [{ questionId: 'retraites-3', placeholder: 'retraites-3-NEW1', approachId: 'retraites-3-e', text: 'x' }],
    )
    expect(affectsRanking(r)).toBe(true)
    const prompt = (id: string) => frenchSpacing(bankJson.bank.questions.find((q: Json) => q.id === id).prompt)
    const t = text(r, { newQuestion: { id: 'sante-x9', prompt: 'Faut-il réguler l’installation des médecins ?', topicId: 'sante' }, constantsPatched: ['ECHIQUIER_WEIGH.compatibleShare'] })
    expect(firstSentence(t)).toBe(`Positions revues pour 3 candidats, dont un changement d’approche principale pour Gabriel Attal sur «${NB}${prompt('retraites-2')}${NB}»${NB}; une position inversée pour Marine Le Pen sur «${NB}${prompt('finances_publiques-2')}${NB}».`)
    expect(t).toContain(`La question «${NB}${prompt('retraites-3')}${NB}» gagne une approche${NB}: si vous y aviez répondu, votre réponse est à revoir.`)
    expect(t).toContain(`Nouvelle question dans le questionnaire approfondi${NB}: «${NB}Faut-il réguler l’installation des médecins${NB}?${NB}».`)
    expect(t).toContain(`Les chiffres publiés sur la page «${NB}Mon profil politique${NB}» ont été mesurés à nouveau.`)
    expect(t.endsWith(AI_SENTENCE)).toBe(true)
    expect(textProblems(t, { hiddenRe, entry: true })).toEqual([])
    // Un seul candidat : sans répéter son nom
    expect(firstSentence(text(report([published('attal', 'retraites-2-b', 'principale')])))).toBe(`Positions revues pour Gabriel Attal, dont un changement d’approche principale sur «${NB}${prompt('retraites-2')}${NB}».`)
  })

  it('une question dont l’énoncé porte un pourcentage se cite par son thème', () => {
    const qs = bankJson.bank.questions.map((q: Json) => (q.id === 'retraites-2' ? { ...q, prompt: 'Faut-il passer à 10 % de capitalisation ?' } : q))
    const t = changelogText({ report: report([published('attal', 'retraites-2-b', 'principale')]), questions: qs, topics: bankJson.bank.topics, nameOf, today: TODAY })
    expect(t).toContain(`sur une question du thème «${NB}Retraites${NB}»`)
    expect(textProblems(t, { entry: true })).toEqual([])
  })

  it('commentaire de l’entrée, chemin du rapport, littéraux TypeScript', () => {
    expect(changelogComment({ runId: RUN, report: report([published('attal', 'retraites-2-d', 'secondaire')]), today: TODAY })).toBe('// Veille automatique (2026-10-19-hebdo) : 1 changements publiés, 1 retenus, 2 écartés ; détail : research/presidentielle-2027/veille/rapports/2026-10-19-hebdo.md')
    expect(kindOfRun('accord-h-2026-10-19-1-2026-10-20')).toBe('accord')
    expect(kindOfRun('2026-10-19-hebdo-2')).toBe('hebdo')
    const s = `L’État ${NB}: «${NB}oui${NB}» c'est \\ fini`
    expect(tsString(s)).toBe("'L’État \\u00a0: «\\u00a0oui\\u00a0» c\\'est \\\\ fini'")
    expect(tsUnquote(tsString(s).slice(1, -1))).toBe(s)
  })
})

describe('lib/electionFields : election.ts', () => {
  const note0 = `Les positions de Gabriel Attal ont été relevées à nouveau le 19 octobre 2026${NB}; les autres n’ont pas été relevées à nouveau depuis le 9 octobre 2026.`
  const comment = '// Le plus récent des relevés des candidats présentés, écrit par la veille automatique'

  it('le journal se lit dans le texte, entrée par entrée, comme l’élection le charge ; « auto » = commentaire de la veille', async () => {
    const { entries } = parseChangelog(electionText)
    expect(entries.map(e => e.date)).toEqual(election.changelog.map(e => e.date))
    for (const e of entries) expect(e.auto).toBe(/^ {6}\/\/ Veille automatique/m.test(electionText.slice(e.start, e.end)))
    // Une entrée de la veille insérée dans un journal du propriétaire seul : elle seule est « auto »
    const owner = parseChangelog(ownerText).entries
    expect(owner.every(e => !e.auto)).toBe(true)
    const r = patchElection(ownerText, { dataVersion: '2026-10-19.1', dataFrozenAt: TODAY, frozenComment: comment, note0, entry: { date: TODAY, comment: changelogComment({ runId: RUN, report: null, today: TODAY }), text: text(report([published('attal', 'retraites-2-d', 'secondaire')])) } })
    expect(parseChangelog(r.text).entries.map(e => e.auto)).toEqual([true, ...owner.map(() => false)])
    expect((await load(ownerText)).changelog).toEqual(election.changelog.filter((_, i) => !entries[i]!.auto))
  })

  it('copie seule : dataFrozenAt, son commentaire d’une ligne et notes[0] ; rien d’autre ne bouge', async () => {
    const r = patchElection(electionText, { dataFrozenAt: TODAY, frozenComment: comment, note0 })
    expect(r.index).toBeNull()
    const loaded = await load(r.text)
    expect(loaded.dataFrozenAt).toBe(TODAY)
    expect(loaded.notes[0]).toBe(note0)
    expect(loaded.dataVersion).toBe(election.dataVersion)
    expect({ ...loaded, dataFrozenAt: null, notes: loaded.notes.slice(1) }).toEqual({ ...election, dataFrozenAt: null, notes: election.notes.slice(1) })
    // Le commentaire de plusieurs lignes devient une seule ligne
    const old = electionText.split('\n')
    const now = r.text.split('\n')
    const start = old.findIndex(l => l.startsWith('  dataVersion:'))
    expect(now[start + 1]).toBe(`  ${comment}`)
    expect(now[start + 2]).toBe(`  dataFrozenAt: '${TODAY}',`)
    expect(old.length - now.length).toBe(old.slice(start + 1).findIndex(l => l.startsWith('  dataFrozenAt:')) - 1)
    expect(r.text).toContain(`'Les positions de Gabriel Attal ont été relevées à nouveau le 19 octobre 2026\\u00a0; les autres`)
  })

  it('avec une entrée : en tête du journal, dataVersion nouvelle ; ce que liront l’accueil et les tests', async () => {
    const entryText = text(report([published('attal', 'retraites-2-b', 'principale')]))
    const r = patchElection(electionText, { dataVersion: '2026-10-19.1', dataFrozenAt: TODAY, frozenComment: comment, note0, entry: { date: TODAY, comment: changelogComment({ runId: RUN, report: null, today: TODAY }), text: entryText } })
    expect(r.index).toBe(0)
    const loaded = await load(r.text)
    expect(loaded.dataVersion).toBe('2026-10-19.1')
    expect(loaded.changelog[0]).toEqual({ date: TODAY, text: entryText })
    expect(loaded.changelog.slice(1)).toEqual(election.changelog)
    // tests/home-back.test.ts et tests/hidden.test.ts
    expect(homeFirstSentence(loaded.changelog[0].text).length).toBeGreaterThan(20)
    expect(hiddenRe!.test(loaded.changelog[0].text)).toBe(false)
    expect(parseChangelog(r.text).entries[0]).toMatchObject({ date: TODAY, auto: true })
  })

  it('le même jour qu’une entrée du propriétaire, sans effet sur le classement : après ses entrées du jour', async () => {
    // Sur le journal du propriétaire seul, le jour de sa première entrée
    const ownerElection = await load(ownerText)
    const day = ownerElection.changelog[0].date
    const entryText = changelogText({ report: report([published('attal', 'retraites-2-d', 'secondaire')]), questions: bankJson.bank.questions, nameOf, today: day })
    const r = patchElection(ownerText, { dataVersion: `${day}.9`, dataFrozenAt: day, frozenComment: comment, note0, entry: { date: day, comment: `// Veille automatique (${day}-hebdo) : essai`, text: entryText }, afterOwner: true })
    const owner = ownerElection.changelog.filter((e: Json) => e.date === day).length
    expect(owner).toBeGreaterThan(0)
    expect(r.index).toBe(owner)
    const loaded = await load(r.text)
    expect(loaded.changelog[owner]).toEqual({ date: day, text: entryText })
    // La première écrite du jour reste celle du propriétaire (Results, latestChange ; HomeBack, newsSince)
    expect(loaded.changelog[0]).toEqual(ownerElection.changelog[0])
  })

  it('31 quand le fichier a changé de forme ; contextDate de config.json, seule valeur changée', () => {
    let code = null
    try {
      patchElection(electionText.replace('  notes: [\n', '  notes2: [\n'), { dataFrozenAt: TODAY, frozenComment: comment, note0 })
    } catch (err) {
      const e = err as { status: number; stdout: unknown; stderr?: unknown; code?: number }
      code = e.code
    }
    expect(code).toBe(31)
    const out = patchContextDate(configText, TODAY)
    expect(JSON.parse(out)).toEqual({ ...config, contextDate: TODAY })
    expect(out.split('\n').filter((l, i) => l !== configText.split('\n')[i])).toEqual([`  "contextDate": "${TODAY}",`])
  })
})

describe('election-fields.mjs, ligne de commande (dépôt git temporaire)', () => {
  const visibleIds = config.candidates.filter((c: Json) => !c.pendingPrimary && !(election.hidden ?? []).includes(c.id)).map((c: Json) => c.id)
  function sandbox(checked: Record<string, string> = { attal: TODAY }): string {
    // Un dépôt et son worktree lié : la veille n'écrit jamais dans le dossier principal d'un dépôt
    const top = newTemp('isoloir-fields-cli-')
    const r = join(top, 'principal')
    mkdirSync(join(r, 'research/presidentielle-2027/veille'), { recursive: true })
    for (const f of ['config.json', 'bank.json', 'positions-history.json']) cpSync(join(D, f), join(r, 'research/presidentielle-2027', f))
    mkdirSync(join(r, 'src/elections/presidentielle-2027'), { recursive: true })
    for (const f of ['bank.ts', 'positions.ts', 'candidates.ts']) cpSync(join(S, f), join(r, 'src/elections/presidentielle-2027', f))
    writeFileSync(join(r, 'src/elections/presidentielle-2027/election.ts'), FIXED_TEXT)
    mkdirSync(join(r, 'src/core'), { recursive: true })
    cpSync(join(REPO_ROOT, 'src/core/positionsHistory.ts'), join(r, 'src/core/positionsHistory.ts'))
    mkdirSync(join(r, 'tools'), { recursive: true })
    cpSync(join(REPO_ROOT, 'tools/positions-history.mjs'), join(r, 'tools/positions-history.mjs'))
    const candidates = Object.fromEntries(visibleIds.map((id: string) => [id, { checkedAt: checked[id] ?? (id === 'polony' ? '2026-10-14' : '2026-10-09'), rotationCursor: 0 }]))
    writeFileSync(join(r, 'research/presidentielle-2027/veille/state.json'), JSON.stringify({ format: 'isoloir-veille-state/1', electionId: 'presidentielle-2027', candidates, watch: [], refused: [], lastRuns: {} }, null, 2))
    writeFileSync(join(r, 'summary.json'), JSON.stringify(report([published('attal', 'retraites-2-d', 'secondaire')])))
    const g = (...a: string[]) => execFileSync('git', ['-c', 'user.name=Essai', '-c', 'user.email=essai@exemple.invalid', '-c', 'commit.gpgsign=false', ...a], { cwd: r, stdio: 'ignore' })
    g('init', '-q')
    g('add', '-A')
    g('commit', '-q', '-m', 'essai')
    g('worktree', 'add', '-q', '--detach', join(top, 'veille-essai'))
    return join(top, 'veille-essai')
  }
  const cli = (root: string, args: string[]) => {
    try {
      const out = execFileSync(process.execPath, [join(REPO_ROOT, 'tools/veille/election-fields.mjs'), '--today', TODAY, ...args, '--root', root], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ISOLOIR_VEILLE_LOCAL: join(root, 'local'), ISOLOIR_VEILLE_NO_RECORD: '1' },
      })
      return { code: 0, json: JSON.parse(out.trim().split('\n').at(-1)!) }
    } catch (err) {
      const e = err as { status: number; stdout: unknown; stderr?: unknown; code?: number }
      return { code: e.status as number, json: JSON.parse(String(e.stdout).trim().split('\n').at(-1) || '{}') }
    }
  }
  const touchPositions = (root: string) => writeFileSync(join(root, 'src/elections/presidentielle-2027/positions.ts'), `${readFileSync(join(S, 'positions.ts'), 'utf8')}// changé\n`)
  const ts = (root: string) => readFileSync(join(root, 'src/elections/presidentielle-2027/election.ts'), 'utf8')

  it('semaine sans données nouvelles (--copy-only) : dataFrozenAt, notes[0] et contextDate seulement', async () => {
    const root = sandbox()
    const fixed = await load(FIXED_TEXT)
    const r = cli(root, ['--copy-only'])
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ dataChanged: false, dataVersion: '2026-10-15.2', dataFrozenAt: TODAY, changelog: null, contextDate: TODAY, stamped: false })
    expect(r.json.notes0).toBe(`Les positions de Gabriel Attal ont été relevées à nouveau le 19 octobre 2026${NB}; celles de Natacha Polony, le 14 octobre 2026${NB}; les autres n’ont pas été relevées à nouveau depuis le 9 octobre 2026.`)
    const loaded = await load(ts(root))
    expect(loaded.changelog).toEqual(fixed.changelog)
    expect(loaded.notes[0]).toBe(r.json.notes0)
    expect(JSON.parse(readFileSync(join(root, 'research/presidentielle-2027/config.json'), 'utf8')).contextDate).toBe(TODAY)
    // Données changées : --copy-only refuse (30)
    touchPositions(root)
    expect(cli(root, ['--copy-only']).code).toBe(30)
  })

  it('jamais en arrière : un état plus ancien que dataFrozenAt publié garde la date et la note du propriétaire', async () => {
    const root = sandbox({})
    const fixed = await load(FIXED_TEXT)
    const r = cli(root, ['--copy-only'])
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ frozenKept: true, dataFrozenAt: '2026-10-15', notes0: fixed.notes[0] })
    expect(ts(root)).toBe(FIXED_TEXT)
    expect(r.json.files).toEqual(['research/presidentielle-2027/config.json'])
  })

  it('données nouvelles : dataVersion du jour, entrée en tête, positions-history estampillé ; --dry-run n’écrit rien', async () => {
    const root = sandbox()
    touchPositions(root)
    const before = ts(root)
    const dry = cli(root, ['--summary', join(root, 'summary.json'), '--dry-run'])
    expect(dry.code).toBe(0)
    expect(dry.json).toMatchObject({ dataChanged: true, dataVersion: '2026-10-19.1', files: [], stamped: false })
    expect(ts(root)).toBe(before)
    const r = cli(root, ['--summary', join(root, 'summary.json')])
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ dataVersion: '2026-10-19.1', changelog: { index: 0 }, stamped: true })
    expect(r.json.files.sort()).toEqual(['research/presidentielle-2027/config.json', 'research/presidentielle-2027/positions-history.json', 'src/elections/presidentielle-2027/election.ts'])
    const loaded = await load(ts(root))
    expect(loaded.dataVersion).toBe('2026-10-19.1')
    expect(loaded.changelog[0].text).toBe(r.json.changelog.text)
    expect(loaded.changelog[0].text).toMatch(/^Positions revues pour Gabriel Attal\u00a0: résumés, sources ou positions compatibles mis à jour, approches principales inchangées\./)
    expect(ts(root)).toContain('      // Veille automatique (2026-10-19-hebdo) : 1 changements publiés')
    // Une seconde publication le même jour : .2
    const again = cli(root, ['--summary', join(root, 'summary.json'), '--dry-run'])
    expect(again.json.dataVersion).toBe('2026-10-19.2')
  })

  it('un candidat présenté absent de state.json compte au dernier relevé publié ; 30 au-delà de 31 versions le même jour', () => {
    const root = sandbox({ attal: TODAY })
    const state = JSON.parse(readFileSync(join(root, 'research/presidentielle-2027/veille/state.json'), 'utf8'))
    delete state.candidates.polony
    writeFileSync(join(root, 'research/presidentielle-2027/veille/state.json'), JSON.stringify(state))
    const r0 = cli(root, ['--copy-only'])
    expect(r0.code).toBe(0)
    // Natacha Polony, jamais relevée par la veille : au 15 octobre (dataFrozenAt publié), ni à today ni en arrière
    expect(r0.json.dataFrozenAt).toBe(TODAY)
    expect(r0.json.notes0).toContain('celles de Natacha Polony, le 15 octobre 2026')
    const root2 = sandbox()
    writeFileSync(join(root2, 'src/elections/presidentielle-2027/election.ts'), ts(root2).replace(/dataVersion: '[^']*'/, "dataVersion: '2026-10-19.31'"))
    touchPositions(root2)
    const r = cli(root2, ['--summary', join(root2, 'summary.json')])
    expect(r.code).toBe(30)
    expect(r.json.reason).toMatch(/31/)
  })

  it('2 : --today manquant ou mal formé, --summary manquant sans --copy-only', () => {
    const root = sandbox()
    expect(cli(root, []).code).toBe(2)
    expect(cli(root, ['--today', '19/10/2026', '--copy-only']).code).toBe(2)
  })
})
