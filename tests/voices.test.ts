// Voix des vidéos : une seule voix de synthèse (la voix aiguë, dossier « aigue »), chemins des fichiers,
// empreinte du texte dit (la même que celle du script de génération : valeurs figées, et contre-épreuve par son
// Python quand il est installé), lecture de l'inventaire (fichier à sa place, voix à jour, forme douteuse écartée,
// autre table ignorée), inventaire réel cohérent avec les séries et les fichiers livrés, et rien de retenu sur
// l'appareil (le son coupé ou actif ne vaut que pour la visite).
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import manifest from '../src/ui/videos/audio-files.json'
import {
  VOICE,
  audioPath,
  inventoryEntry,
  recordingOf,
  segmentMs,
  segmentPrint,
  spokenOf,
  textPrint,
  voiceOf,
  voicedCount,
} from '../src/ui/videos/audio'
import { estimateMs } from '../src/ui/videos/model'
import { VIDEO_SERIES } from '../src/ui/videos/series'

const videos = VIDEO_SERIES.flatMap(s => s.videos)
const ROOT = fileURLToPath(new URL('..', import.meta.url))
/** Le Python du générateur des voix, s'il est installé sur cette machine (sinon, les contre-épreuves sont sautées) */
const python = [process.env.ISOLOIR_PYTHON, join(homedir(), 'isoloir-tts/bin/python')].find(p => p && existsSync(p))

describe('chemins des fichiers', () => {
  it('une seule voix, la voix aiguë, dans le dossier où ses fichiers ont été générés', () => {
    expect(VOICE).toBe('aigue')
  })

  it('public/videos/audio/aigue/<vidéo>/<passage>.m4a', () => {
    expect(audioPath(VOICE, 'retraites-intro', 'retraites-intro-01')).toBe(
      'videos/audio/aigue/retraites-intro/retraites-intro-01.m4a',
    )
  })

  // Le générateur (tools/voices/generate.py, table VOIX) et le contrôle du build (tools/check-dist.mjs) connaissent
  // la voix du site, et elle a sa référence (tools/voices/refs/aigue.wav)
  it('la voix du site est connue du générateur, de sa référence et du contrôle du build', () => {
    const generate = readFileSync(join(ROOT, 'tools/voices/generate.py'), 'utf8')
    const table = generate.match(/^VOIX = \{\n([\s\S]*?)^\}/m)?.[1] ?? ''
    expect([...table.matchAll(/^ {4}"([a-z]+)": \{$/gm)].map(m => m[1])).toContain(VOICE)
    expect(existsSync(join(ROOT, 'tools/voices/refs', `${VOICE}.wav`))).toBe(true)
    const checkDist = readFileSync(join(ROOT, 'tools/check-dist.mjs'), 'utf8')
    const listed = checkDist.match(/const VOICES = \[([^\]]*)\]/)?.[1] ?? ''
    expect(listed).toContain(`'${VOICE}'`)
  })
})

describe('empreinte du texte dit', () => {
  it('FNV-1a 32 bits de l’UTF-8, 8 signes hexadécimaux minuscules', () => {
    expect(textPrint('')).toBe('811c9dc5')
    expect(textPrint('a')).toBe('e40c292c')
    expect(textPrint('foobar')).toBe('bf9cf968')
    // Plusieurs octets par signe
    expect(textPrint('é')).toBe('1e9de8c1')
    expect(textPrint('Fin deux mille vingt-quatre, dix-sept virgule trois millions de personnes touchaient une retraite.')).toBe(
      '9baae548',
    )
  })

  it('sur la chaîne exacte : une insécable n’est pas une espace', () => {
    expect(textPrint('64 ans')).toBe('788c98f7')
    expect(textPrint('64 ans')).toBe('939b362f')
  })

  it('le texte dit : « spoken » s’il est donné, sinon « say »', () => {
    expect(spokenOf({ say: 'Fin 2024.' })).toBe('Fin 2024.')
    expect(spokenOf({ say: 'Fin 2024.', spoken: 'Fin deux mille vingt-quatre.' })).toBe('Fin deux mille vingt-quatre.')
    // Un « spoken » vide ne vaut pas texte : la voix dirait le sous-titre
    expect(spokenOf({ say: 'Fin 2024.', spoken: '  ' })).toBe('Fin 2024.')
    expect(segmentPrint({ say: 'Fin 2024.', spoken: 'Fin deux mille vingt-quatre.' })).toBe(textPrint('Fin deux mille vingt-quatre.'))
    expect(segmentPrint({ say: 'Fin 2024.' })).toBe(textPrint('Fin 2024.'))
  })

  // Valeurs calculées par fnv(dit(passage)) de tools/voices/generate.py (Python de ~/isoloir-tts), figées ici :
  // l'empreinte que le générateur inscrit à l'inventaire est celle que le lecteur vérifie
  it('les mêmes empreintes que le générateur Python', () => {
    const fromPython: [string, string][] = [
      ['', '811c9dc5'],
      ['foobar', 'bf9cf968'],
      ['64 ans', '788c98f7'],
      ['64 ans', 'fe7a09a6'],
      ['64 ans', '939b362f'],
    ]
    for (const [text, print] of fromPython) expect(textPrint(text), JSON.stringify(text)).toBe(print)
    // Passages réels : insécable fine avant « ? », insécable avant « : », apostrophe typographique, « spoken »
    const byId = new Map(videos.flatMap(v => v.segments).map(s => [s.id, s]))
    const real: [string, boolean, string][] = [
      ['retraites-intro-01', false, 'a426fc37'],
      ['retraites-intro-02', false, '78273e85'],
      ['retraites-intro-03', true, '9baae548'],
    ]
    for (const [id, spoken, print] of real) {
      const s = byId.get(id)
      expect(s, id).toBeTruthy()
      // Si le texte du passage change, l'empreinte change : recalculer la valeur avec le Python
      expect(s!.spoken !== undefined, id).toBe(spoken)
      expect(segmentPrint(s!), id).toBe(print)
    }
  })

  // Contre-épreuve sur la machine qui génère les voix : le Python du générateur recalcule l'empreinte de tous
  // les passages (fonctions fnv() et dit() extraites de generate.py, sans charger le modèle)
  it.skipIf(!python)('chaque passage des séries : même empreinte en Python', () => {
    const script = [
      'import ast, json, sys',
      `src = open(${JSON.stringify(join(ROOT, 'tools/voices/generate.py'))}, encoding="utf-8").read()`,
      'ns = {}',
      'for n in ast.parse(src).body:',
      '    if isinstance(n, ast.FunctionDef) and n.name in ("fnv", "dit"):',
      '        exec(compile(ast.Module([n], []), "generate.py", "exec"), ns)',
      'segs = json.loads(sys.stdin.read())',
      'print(json.dumps([ns["fnv"](ns["dit"](s)) for s in segs]))',
    ].join('\n')
    const segs = [
      ...videos.flatMap(v => v.segments),
      { id: 'vide', say: 'Fin 2024.', spoken: '  ' },
      { id: 'accents', say: 'Œuvre, élan, « déjà » !' },
    ]
    const input = JSON.stringify(segs.map(s => ({ say: s.say, ...(s.spoken !== undefined ? { spoken: s.spoken } : {}) })))
    const out = spawnSync(python!, ['-c', script], { input, encoding: 'utf8', timeout: 20000 })
    expect(out.status, out.stderr).toBe(0)
    const prints = JSON.parse(out.stdout) as string[]
    expect(prints).toEqual(segs.map(s => segmentPrint(s)))
  })

  it('dans les séries, un « spoken » donné n’est jamais vide', () => {
    for (const v of videos) {
      for (const s of v.segments) if (s.spoken !== undefined) expect(s.spoken.trim().length, s.id).toBeGreaterThan(0)
    }
  })
})

describe('lecture de l’inventaire', () => {
  const segment = { id: 'essai-01', say: 'Fin 2024.', spoken: 'Fin deux mille vingt-quatre.' }
  const entry = (over: Record<string, unknown> = {}) => ({
    file: audioPath(VOICE, 'essai', 'essai-01'),
    duration: 2.3456,
    hash: segmentPrint(segment),
    ...over,
  })
  const inv = (e: unknown, voice = 'aigue') => ({ voices: { [voice]: { essai: { 'essai-01': e } } } })

  it('un fichier à sa place et à jour : son chemin et sa durée en millisecondes', () => {
    expect(recordingOf('essai', segment, inv(entry()))).toEqual({
      file: 'videos/audio/aigue/essai/essai-01.m4a',
      ms: 2346,
    })
  })

  it('seule la table de la voix aiguë est lue : une autre table de l’inventaire est ignorée', () => {
    const grave = inv(entry({ file: 'videos/audio/grave/essai/essai-01.m4a' }), 'grave')
    expect(recordingOf('essai', segment, grave)).toBeNull()
    expect(inventoryEntry(grave, 'essai', 'essai-01')).toBeNull()
  })

  it('voix périmée : l’empreinte n’est plus celle du texte dit', () => {
    // Enregistré d'après le « say » alors que le passage a un « spoken »
    expect(recordingOf('essai', segment, inv(entry({ hash: textPrint(segment.say) })))).toBeNull()
    // Le texte dit a changé depuis
    expect(recordingOf('essai', { ...segment, spoken: 'Fin deux mille vingt-cinq.' }, inv(entry()))).toBeNull()
  })

  it('un fichier inscrit ailleurs que sa place est écarté', () => {
    for (const file of [
      'videos/audio/essai/essai-01.m4a',
      'videos/audio/grave/essai/essai-01.m4a',
      'videos/audio/aigue/essai/essai-01.mp3',
      'https://exemple.org/videos/audio/aigue/essai/essai-01.m4a',
    ]) {
      expect(recordingOf('essai', segment, inv(entry({ file }))), file).toBeNull()
    }
  })

  it('une ligne ou un inventaire de forme douteuse ne donne rien', () => {
    for (const bad of [{ duration: 0 }, { duration: -1 }, { duration: '2.3' }, { duration: Infinity }, { hash: 12 }, { file: null }]) {
      expect(inventoryEntry(inv(entry(bad)), 'essai', 'essai-01'), JSON.stringify(bad)).toBeNull()
    }
    for (const bad of [null, undefined, 'voix', [], { voices: [] }, { voices: { aigue: [] } }, { files: {} }]) {
      expect(inventoryEntry(bad, 'essai', 'essai-01')).toBeNull()
    }
    // Jamais une propriété héritée prise pour une vidéo ou un passage
    expect(inventoryEntry({ voices: { aigue: {} } }, 'constructor', 'name')).toBeNull()
    expect(inventoryEntry({ voices: { aigue: { essai: {} } } }, 'essai', '__proto__')).toBeNull()
  })
})

describe('inventaire livré', () => {
  const voices = (manifest as { voices?: Record<string, Record<string, Record<string, unknown>>> }).voices
  const mine = voices?.[VOICE] ?? {}

  it('une table « voices », et celle de la voix du site', () => {
    expect(Object.keys(manifest)).toEqual(['voices'])
    expect(typeof voices).toBe('object')
  })

  it('chaque fichier inscrit est un passage des séries, à sa place, à jour, avec sa durée, et livré dans public/', () => {
    for (const [videoId, segs] of Object.entries(mine)) {
      const video = videos.find(v => v.id === videoId)
      expect(video, `${videoId} : vidéo inconnue`).toBeTruthy()
      for (const segmentId of Object.keys(segs)) {
        const where = `${VOICE}/${videoId}/${segmentId}`
        const segment = video!.segments.find(s => s.id === segmentId)
        expect(segment, `${where} : passage inconnu`).toBeTruthy()
        const e = inventoryEntry(manifest, videoId, segmentId)
        expect(e, `${where} : ligne de forme douteuse`).toBeTruthy()
        expect(e!.file, where).toBe(audioPath(VOICE, videoId, segmentId))
        expect(e!.hash, `${where} : voix périmée, à réenregistrer`).toBe(segmentPrint(segment!))
        expect(existsSync(join(ROOT, 'public', e!.file)), `${where} : fichier absent de public/`).toBe(true)
      }
    }
  })

  it('le lecteur ne demande jamais un fichier hors du dossier de la voix du site', () => {
    for (const v of videos) {
      for (const s of v.segments) {
        const url = voiceOf(v.id, s)?.url
        if (url) expect(url, s.id).toContain(`videos/audio/${VOICE}/${v.id}/`)
      }
    }
  })

  // L'empreinte ne couvre que le texte de series.ts : une correction de tools/voices/texte.py (la mise en forme
  // du texte envoyé à la voix) ne la change pas. Sur la machine du générateur, on vérifie donc que chaque
  // fichier inscrit a été enregistré sur le texte à dire que donne texte.py aujourd'hui, en mode clone phrase
  // par phrase (tools/voices/etat.json) ; sinon il est périmé (generate.py le retire à sa prochaine exécution)
  const etatPath = join(ROOT, 'tools/voices/etat.json')
  it.skipIf(!python || !existsSync(etatPath))('chaque fichier inscrit dit le texte à dire actuel de texte.py', () => {
    const etat = JSON.parse(readFileSync(etatPath, 'utf8')) as Record<string, { mode?: string; texte?: string; print?: string }>
    const inscribed = Object.entries(mine)
      .flatMap(([videoId, segs]) => Object.keys(segs).map(id => videos.find(v => v.id === videoId)?.segments.find(s => s.id === id)))
      .filter(s => !!s)
    if (!inscribed.length) return
    const script = [
      'import json, sys',
      `sys.path.insert(0, ${JSON.stringify(join(ROOT, 'tools/voices'))})`,
      'from texte import a_dire',
      'print(json.dumps([a_dire(s)[0] for s in json.loads(sys.stdin.read())]))',
    ].join('\n')
    const input = JSON.stringify(inscribed.map(s => ({ say: s!.say, ...(s!.spoken !== undefined ? { spoken: s!.spoken } : {}) })))
    const out = spawnSync(python!, ['-c', script], { input, encoding: 'utf8', timeout: 20000 })
    expect(out.status, out.stderr).toBe(0)
    const said = JSON.parse(out.stdout) as string[]
    inscribed.forEach((segment, i) => {
      const where = `${VOICE}/${segment!.id}`
      const e = etat[where]
      expect(e, `${where} : sans état de génération`).toBeTruthy()
      expect(e?.mode, `${where} : mode d’enregistrement`).toBe('clone-phrases')
      expect(e?.print, `${where} : empreinte de l’état`).toBe(segmentPrint(segment!))
      expect(e?.texte, `${where} : texte à dire changé depuis l’enregistrement (texte.py), à régénérer`).toBe(said[i])
    })
  })

  it('sans fichier inscrit, pas de voix, et la durée du passage est l’estimation du texte dit', () => {
    const video = videos.find(v => v.segments.some(s => !recordingOf(v.id, s)))
    if (!video) return
    const segment = video.segments.find(s => !recordingOf(video.id, s))!
    expect(voiceOf(video.id, segment)).toBeNull()
    expect(segmentMs(video.id, segment)).toBe(estimateMs(spokenOf(segment)))
    expect(voicedCount(video)).toBeLessThan(video.segments.length)
  })
})

describe('rien n’est retenu sur l’appareil', () => {
  /** Les fichiers du site (hors données des élections et textes des séries) */
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap(name => {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) return /elections|series$/.test(path) ? [] : files(path)
      return /\.(ts|tsx)$/.test(name) && !/series\.ts$/.test(name) ? [path] : []
    })
  const sources = files(join(ROOT, 'src')).map(path => ({ path, text: readFileSync(path, 'utf8') }))

  it('le son coupé ou actif ne s’écrit nulle part : ni stockage local dans les vidéos, ni clé « isoloir:voix »', () => {
    expect(sources.length).toBeGreaterThan(10)
    for (const { path, text } of sources) {
      if (path.includes(join('src', 'ui', 'videos'))) expect(text, path).not.toMatch(/localStorage|sessionStorage/)
      expect(text, path).not.toMatch(/isoloir:voix|STORAGE_PREFIX\}voix|chooseVoice|chosenVoice/)
    }
  })

  it('plus de choix entre deux voix : ni « voix grave », ni « Voix aiguë » proposée au choix', () => {
    for (const { path, text } of sources) expect(text, path).not.toMatch(/[Vv]oix grave|Voix aiguë|VOICE_LABELS|VOICE_IDS/)
  })

  it('la notice de confidentialité ne déclare plus de voix choisie', () => {
    const privacy = readFileSync(join(ROOT, 'src/ui/screens/Privacy.tsx'), 'utf8')
    expect(privacy).not.toMatch(/voix choisie|voix grave|\}voix/)
  })
})
