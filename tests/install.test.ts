// « Installer l'application » : la détection de l'appareil, du navigateur et du mode installé (src/core/install.ts et
// src/core/installed.ts), sur une table de navigateurs imités ; l'espace de l'application installée (à part sur iPhone,
// iPad et le Safari du Mac, partagé sur Android et avec Chrome ou Edge) ; la liste des appareils de la page
// (src/ui/install/devices.ts) ; et les mots de la page, ceux du site : « réponses », jamais « feuille » ni « PWA ».
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { detectDevice, type DeviceKey } from '../src/core/install'
import { appleApart, type Probe } from '../src/core/installed'
import { GUIDES, GUIDE_KEYS, MENU, SYMBOLS, deviceLine, q } from '../src/ui/install/devices'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

interface Row {
  name: string
  ua: string
  touch?: number
  brave?: boolean
  key: DeviceKey
  os: string
  browser?: string
  version?: number | null
  storage: 'separe' | 'partage' | 'inconnu'
  desktop?: boolean
}

const IPHONE = (token: string) => `Mozilla/5.0 (iPhone; CPU iPhone OS ${token} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)`
const ANDROID = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko)'
const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/'

const ROWS: Row[] = [
  // iPhone : Safari 26 fige « iPhone OS » à 18_6 (ou 18_6_2) ; seul « Version/NN » dit la version
  { name: 'iPhone, Safari d’iOS 26', ua: `${IPHONE('18_6')} Version/26.0 Mobile/15E148 Safari/604.1`, key: 'ios26', os: 'iphone', browser: 'Safari', version: 26, storage: 'separe' },
  { name: 'iPhone, Safari d’iOS 26.1 (18_6_2)', ua: `${IPHONE('18_6_2')} Version/26.1 Mobile/15E148 Safari/604.1`, key: 'ios26', os: 'iphone', version: 26, storage: 'separe' },
  { name: 'iPhone, Safari d’iOS 18', ua: `${IPHONE('18_5')} Version/18.5 Mobile/15E148 Safari/604.1`, key: 'ios18', os: 'iphone', version: 18, storage: 'separe' },
  { name: 'iPhone, Safari d’iOS 17', ua: `${IPHONE('17_4')} Version/17.4 Mobile/15E148 Safari/604.1`, key: 'ios18', os: 'iphone', version: 17, storage: 'separe' },
  // iPad : en mode ordinateur, il s'annonce comme un Mac, mais tactile
  { name: 'iPad en mode ordinateur, Safari 26', ua: `${MAC}605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15`, touch: 5, key: 'ios26', os: 'ipad', version: 26, storage: 'separe' },
  { name: 'iPad, Safari 17', ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', key: 'ios18', os: 'ipad', storage: 'separe' },
  { name: 'iPhone, Chrome', ua: `${IPHONE('17_0')} CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1`, key: 'iosOther', os: 'iphone', browser: 'Chrome', version: null, storage: 'separe' },
  { name: 'iPhone, Firefox', ua: `${IPHONE('17_0')} FxiOS/121.0 Mobile/15E148 Safari/605.1.15`, key: 'iosOther', os: 'iphone', browser: 'Firefox', storage: 'separe' },
  { name: 'iPhone, Edge', ua: `${IPHONE('17_0')} EdgiOS/120.0.2210.150 Version/17.0 Mobile/15E148 Safari/604.1`, key: 'iosOther', os: 'iphone', browser: 'Edge', storage: 'separe' },
  // Les fenêtres des applications : elles ne savent pas installer
  { name: 'iPhone, Instagram', ua: `${IPHONE('17_1')} Mobile/15E148 Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_1; fr_FR; fr; scale=3.00)`, key: 'inApp', os: 'iphone', browser: 'Instagram', storage: 'inconnu' },
  { name: 'iPhone, Facebook', ua: `${IPHONE('17_1')} Mobile/15E148 [FBAN/FBIOS;FBAV/440.0.0.30.110;FBBV/600000000]`, key: 'inApp', os: 'iphone', browser: 'Facebook', storage: 'inconnu' },
  { name: 'iPhone, fenêtre d’une application inconnue', ua: `${IPHONE('17_1')} Mobile/15E148`, key: 'inApp', os: 'iphone', browser: '', storage: 'inconnu' },
  { name: 'Android, Chrome', ua: `${ANDROID} Chrome/150.0.0.0 Mobile Safari/537.36`, key: 'andChrome', os: 'android', browser: 'Chrome', storage: 'partage' },
  { name: 'Android, Samsung Internet', ua: `${ANDROID} SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36`, key: 'andSamsung', os: 'android', browser: 'Samsung Internet', storage: 'partage' },
  { name: 'Android, Firefox', ua: 'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0', key: 'andFirefox', os: 'android', browser: 'Firefox', storage: 'partage' },
  { name: 'Android, fenêtre intégrée (WebView)', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0 Mobile Safari/537.36', key: 'inApp', os: 'android', storage: 'inconnu' },
  { name: 'Android, Instagram', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0 Mobile Safari/537.36 Instagram 300.0.0.0', key: 'inApp', os: 'android', browser: 'Instagram', storage: 'inconnu' },
  { name: 'Android, Opera', ua: `${ANDROID} Chrome/150.0.0.0 Mobile Safari/537.36 OPR/90.0.0.0`, key: 'other', os: 'android', storage: 'inconnu' },
  { name: 'Android, Edge', ua: `${ANDROID} Chrome/150.0.0.0 Mobile Safari/537.36 EdgA/150.0.0.0`, key: 'other', os: 'android', storage: 'inconnu' },
  { name: 'Android, Brave (s’annonce comme Chrome)', ua: `${ANDROID} Chrome/150.0.0.0 Mobile Safari/537.36`, brave: true, key: 'other', os: 'android', storage: 'inconnu' },
  // Firefox Focus s'annonce comme Chrome, avec « Focus/ » (« Klar/ » en allemand) : ses menus ne sont pas ceux de Chrome
  { name: 'Android, Firefox Focus', ua: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Focus/131.0 Chrome/131.0.0.0 Mobile Safari/537.36', key: 'other', os: 'android', storage: 'inconnu' },
  // Une tablette Android en mode ordinateur (celui de Chrome par défaut sur les grandes tablettes) : Linux, mais tactile
  { name: 'tablette Android en mode ordinateur, Chrome', ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', touch: 5, key: 'andChrome', os: 'android', browser: 'Chrome', storage: 'partage' },
  { name: 'tablette Android en mode ordinateur, Samsung Internet', ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Safari/537.36', touch: 5, key: 'andSamsung', os: 'android', storage: 'partage' },
  { name: 'Linux, Chrome (sans écran tactile)', ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', key: 'deskChrome', os: 'linux', storage: 'partage', desktop: true },
  { name: 'Chromebook tactile, Chrome', ua: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', touch: 10, key: 'deskChrome', os: 'chromeos', storage: 'partage', desktop: true },
  { name: 'Windows, Chrome', ua: `${WIN} Chrome/150.0.0.0 Safari/537.36`, key: 'deskChrome', os: 'windows', browser: 'Chrome', storage: 'partage', desktop: true },
  { name: 'Mac, Chrome', ua: `${MAC}537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36`, key: 'deskChrome', os: 'mac', storage: 'partage', desktop: true },
  { name: 'Chromebook, Chrome', ua: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', key: 'deskChrome', os: 'chromeos', storage: 'partage', desktop: true },
  { name: 'Windows, Edge', ua: `${WIN} Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0`, key: 'deskEdge', os: 'windows', browser: 'Edge', storage: 'partage', desktop: true },
  { name: 'Mac, Safari', ua: `${MAC}605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15`, key: 'macSafari', os: 'mac', browser: 'Safari', version: 18, storage: 'separe', desktop: true },
  { name: 'Windows, Firefox', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0', key: 'winFirefox', os: 'windows', storage: 'inconnu', desktop: true },
  { name: 'Mac, Firefox', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0', key: 'macFirefox', os: 'mac', storage: 'inconnu', desktop: true },
  { name: 'Linux, Firefox', ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0', key: 'macFirefox', os: 'linux', storage: 'inconnu', desktop: true },
  { name: 'Windows, Opera', ua: `${WIN} Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0`, key: 'other', os: 'windows', storage: 'inconnu', desktop: true },
  { name: 'rien', ua: '', key: 'other', os: 'autre', storage: 'inconnu' },
]

const probe = (r: Row, installed = false): Probe => ({ userAgent: r.ua, maxTouchPoints: r.touch ?? 0, installed, brave: r.brave })

describe('detectDevice', () => {
  for (const r of ROWS) {
    it(r.name, () => {
      const d = detectDevice(probe(r))
      expect(d.key).toBe(r.key)
      expect(d.os).toBe(r.os)
      expect(d.storage).toBe(r.storage)
      expect(d.installed).toBe(false)
      expect(d.desktop).toBe(!!r.desktop)
      if (r.browser !== undefined) expect(d.browser).toBe(r.browser)
      if (r.version !== undefined) expect(d.version).toBe(r.version)
    })
  }

  it('dans l’application installée : l’iPhone n’annonce plus Safari, son espace reste à part', () => {
    const d = detectDevice({ userAgent: `${IPHONE('18_6')} Mobile/15E148`, maxTouchPoints: 5, installed: true })
    expect(d).toMatchObject({ os: 'iphone', installed: true, storage: 'separe' })
    // La même fenêtre, sans l'icône : celle d'une application (elle ne sait pas installer)
    expect(detectDevice({ userAgent: `${IPHONE('18_6')} Mobile/15E148`, maxTouchPoints: 5, installed: false }).key).toBe('inApp')
  })

  it('l’espace de l’application installée : à part sur iPhone, iPad et Safari du Mac, partagé ailleurs (core/installed.ts le dit de même)', () => {
    for (const r of ROWS) {
      const d = detectDevice(probe(r, true))
      // Les fenêtres des applications ne savent pas installer : seule l'application installée compte ici
      if (r.key === 'inApp') continue
      expect(d.storage === 'separe', r.name).toBe(appleApart(probe(r, true)) !== null)
      expect(d.installed, r.name).toBe(true)
    }
    expect(appleApart(probe(ROWS.find(r => r.key === 'macSafari')!))).toBe('mac')
    expect(appleApart(probe(ROWS.find(r => r.name === 'Mac, Chrome')!))).toBeNull()
    expect(appleApart(probe(ROWS.find(r => r.name === 'Mac, Firefox')!))).toBeNull()
    expect(appleApart(probe(ROWS.find(r => r.name.startsWith('iPad en mode'))!))).toBe('ipad')
  })
})

describe('la liste des appareils', () => {
  it('chaque appareil reconnu a sa ligne, dans une famille, avec ce qui arrive aux réponses, en mots', () => {
    const keys: DeviceKey[] = ['ios26', 'ios18', 'iosOther', 'andChrome', 'andSamsung', 'andFirefox', 'deskChrome', 'deskEdge', 'macSafari', 'winFirefox', 'macFirefox', 'inApp', 'other']
    expect([...GUIDE_KEYS].sort()).toEqual([...keys].sort())
    for (const k of GUIDE_KEYS) {
      const g = GUIDES[k]
      expect(g.name.length, k).toBeGreaterThan(5)
      expect(g.state.length, k).toBeGreaterThan(5)
      expect(g.lead || g.steps?.length, k).toBeTruthy()
    }
    // Les familles se suivent : la liste ne revient jamais à une famille déjà passée
    const groups = GUIDE_KEYS.map(k => GUIDES[k].group)
    expect(groups.filter((g, i) => i === 0 || groups[i - 1] !== g)).toEqual([...new Set(groups)])
  })

  it('« Cet appareil » nomme ce qui est reconnu, et dit sinon de choisir', () => {
    expect(deviceLine(detectDevice(probe(ROWS[0]!)))).toEqual({ value: 'iPhone, avec Safari', sub: 'iOS 26' })
    expect(deviceLine(detectDevice(probe(ROWS.find(r => r.name.startsWith('iPad en mode'))!))).value).toBe('iPad, avec Safari')
    expect(deviceLine(detectDevice(probe(ROWS.find(r => r.key === 'andChrome')!))).value).toBe('Android, avec Chrome')
    expect(deviceLine(detectDevice(probe(ROWS.find(r => r.key === 'other')!))).value).toBe('Non reconnu')
    expect(deviceLine(detectDevice({ userAgent: `${IPHONE('18_6')} Mobile/15E148`, maxTouchPoints: 5, installed: true })).value).toBe('iPhone, dans l’application')
  })

  it('les mots de menu, entre guillemets et espaces insécables', () => {
    expect(q('Partager')).toBe('«\u00a0Partager\u00a0»')
  })

  it('un bouton désigné par un symbole (« ⋮ », « ≡ »…) a son nom en mots, dit aux lecteurs d’écran', () => {
    const words = Object.values(MENU).flat()
    const symbols = words.filter(w => !/\p{L}/u.test(w))
    expect(symbols.length).toBeGreaterThan(2)
    for (const s of symbols) expect(SYMBOLS[s], s).toMatch(/^le bouton à trois (points|traits)$/)
  })

  it('les mots de la page d’import que la page cite y sont (Firefox sous Windows : le champ et « Lire ce code »)', () => {
    const transfer = readFileSync(join(ROOT, 'src/ui/screens/Transfer.tsx'), 'utf8')
    for (const w of [MENU.importMine, MENU.pasteCode, MENU.typeCode, MENU.readCode, MENU.importThese]) expect(transfer, w).toContain(w)
    expect(GUIDES.winFirefox.lead).toContain(q(MENU.typeCode))
    expect(GUIDES.winFirefox.lead).not.toContain(q(MENU.pasteCode))
  })
})

describe('les mots de la page', () => {
  it('« réponses », jamais « feuille » ni « PWA »', () => {
    const files = [
      'src/ui/screens/Install.tsx',
      ...readdirSync(join(ROOT, 'src/ui/install')).map(f => `src/ui/install/${f}`),
      'src/core/install.ts',
      'src/core/installed.ts',
    ]
    for (const f of files) {
      // Les textes seulement : chaînes et texte des balises, sans les commentaires
      const code = readFileSync(join(ROOT, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
      // (l'adresse des questions, « /feuille/1 », n'est pas un mot de la page)
      expect(code, f).not.toMatch(/(?<!\/)feuille/i)
      expect(code, f).not.toMatch(/\bPWA\b/)
    }
  })
})
