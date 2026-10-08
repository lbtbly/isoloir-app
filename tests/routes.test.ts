// Adresses : analyse pure (#/… pour l'élection par défaut, #/<slug>/… pour une autre), corrections d'adresse,
// ancien lien vers un candidat d'une élection archivée, page des archives, et liens relatifs à l'élection
// affichée (src/ui/nav.ts). Aucun lien n'est écrit en dur ailleurs que dans nav.ts.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { canonicalPath, compareIds, comparePath, parseLocation, parseRoute, resolvePlace, withBase, type ElectionRef } from '../src/core/routes'
import { getBase, link, linkIn, setBase } from '../src/ui/nav'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

describe('parseRoute', () => {
  it('reconnaît chaque page, avec ou sans « # »', () => {
    expect(parseRoute('#/')).toEqual({ name: 'home' })
    expect(parseRoute('')).toEqual({ name: 'home' })
    expect(parseRoute('#/feuille/3')).toEqual({ name: 'sheet', tier: 'essentiel', index: 2 })
    expect(parseRoute('/approfondi/1')).toEqual({ name: 'sheet', tier: 'approfondi', index: 0 })
    expect(parseRoute('#/feuille/abc')).toEqual({ name: 'sheet', tier: 'essentiel', index: 0 })
    expect(parseRoute('resultats')).toEqual({ name: 'results' })
    expect(parseRoute('#/methode/ia')).toEqual({ name: 'method', anchor: 'ia' })
    expect(parseRoute('#/candidat/royal')).toEqual({ name: 'candidate', id: 'royal' })
    expect(parseRoute('#/candidat')).toEqual({ name: 'candidates' })
    expect(parseRoute('#/sujets/retraites-1')).toEqual({ name: 'topics', anchor: 'retraites-1' })
    expect(parseRoute('#/archives')).toEqual({ name: 'archives' })
    expect(parseRoute('#/nimporte')).toEqual({ name: 'home' })
  })

  it('comparaison : les candidats dans l’ordre de l’adresse, sans doublon ni vide', () => {
    expect(parseRoute('#/comparer/faure,royal')).toEqual({ name: 'compare', ids: ['faure', 'royal'] })
    expect(parseRoute('#/comparer/royal,faure,guedj,maurel')).toEqual({ name: 'compare', ids: ['royal', 'faure', 'guedj', 'maurel'] })
    expect(parseRoute('#/comparer')).toEqual({ name: 'compare', ids: [] })
    expect(parseRoute('#/comparer/')).toEqual({ name: 'compare', ids: [] })
    expect(parseRoute('#/comparer/faure,,faure, royal,')).toEqual({ name: 'compare', ids: ['faure', 'royal'] })
    // Virgule encodée (lien recopié par une messagerie), et encodage invalide lu tel quel
    expect(parseRoute('#/comparer/faure%2Croyal')).toEqual({ name: 'compare', ids: ['faure', 'royal'] })
    expect(parseRoute('#/comparer/faure,%E9')).toEqual({ name: 'compare', ids: ['faure', '%E9'] })
    // Au-delà de quatre, l'adresse garde tout : c'est l'écran qui ne compare que les quatre premiers
    expect(parseRoute('#/comparer/a,b,c,d,e')).toEqual({ name: 'compare', ids: ['a', 'b', 'c', 'd', 'e'] })
  })

  it('compareIds et comparePath se répondent', () => {
    expect(compareIds(undefined)).toEqual([])
    expect(comparePath([])).toBe('/comparer')
    expect(comparePath(['faure', 'royal'])).toBe('/comparer/faure,royal')
    for (const ids of [['a'], ['a', 'b'], ['b', 'a', 'c', 'd']]) expect(parseRoute(comparePath(ids))).toEqual({ name: 'compare', ids })
  })
})

describe('parseLocation', () => {
  it('sans préfixe : l’élection par défaut', () => {
    expect(parseLocation('#/resultats')).toEqual({ slug: '', route: { name: 'results' }, path: '/resultats' })
    expect(parseLocation('#/')).toEqual({ slug: '', route: { name: 'home' }, path: '/' })
    expect(parseLocation('')).toEqual({ slug: '', route: { name: 'home' }, path: '/' })
    expect(parseLocation('#/candidat/royal')).toEqual({ slug: '', route: { name: 'candidate', id: 'royal' }, path: '/candidat/royal' })
  })

  it('un premier segment qui n’est pas une page est un préfixe d’élection', () => {
    expect(parseLocation('#/choisir-2027/resultats')).toEqual({ slug: 'choisir-2027', route: { name: 'results' }, path: '/resultats' })
    expect(parseLocation('#/primaire')).toEqual({ slug: 'primaire', route: { name: 'home' }, path: '/' })
    expect(parseLocation('#/choisir-2027/feuille/2')).toEqual({
      slug: 'choisir-2027',
      route: { name: 'sheet', tier: 'essentiel', index: 1 },
      path: '/feuille/2',
    })
  })
})

describe('withBase et canonicalPath', () => {
  it('écrit l’adresse d’un chemin dans une élection', () => {
    expect(withBase('', '/')).toBe('#/')
    expect(withBase('', '/resultats')).toBe('#/resultats')
    expect(withBase('choisir-2027', '/')).toBe('#/choisir-2027/')
    expect(withBase('choisir-2027', 'resultats')).toBe('#/choisir-2027/resultats')
  })

  it('l’ancienne page d’essai des vidéos devient la page des vidéos', () => {
    expect(canonicalPath('/essai-videos')).toBe('/videos')
    expect(canonicalPath('/essai-videos/logement-intro')).toBe('/videos/logement-intro')
    expect(canonicalPath('/essai-videosx')).toBe('/essai-videosx')
    expect(canonicalPath('/resultats')).toBe('/resultats')
  })

  it('chaque adresse relue redonne la même page', () => {
    for (const path of ['/', '/feuille/4', '/approfondi/2', '/resultats', '/methode/ia', '/candidat/x', '/comparer/x,y', '/comparer', '/sujets/a-1', '/videos/v']) {
      for (const slug of ['', 'autre-2030']) {
        const place = parseLocation(withBase(slug, path))
        expect(place.slug, `${slug} ${path}`).toBe(slug)
        expect(place.path, `${slug} ${path}`).toBe(path)
        expect(place.route, `${slug} ${path}`).toEqual(parseRoute(path))
      }
    }
  })
})

describe('resolvePlace', () => {
  const current: ElectionRef = { id: 'presidentielle-2027', slug: '', archived: false, candidateIds: ['a', 'b'] }
  const past: ElectionRef = { id: 'choisir-2027', slug: 'choisir-2027', aliases: ['primaire'], archived: true, candidateIds: ['b', 'royal'] }
  const registry = [current, past]
  const at = (hash: string, elections: readonly ElectionRef[] = registry) => resolvePlace(parseLocation(hash), elections)

  it('sans préfixe : l’élection par défaut, adresse inchangée', () => {
    expect(at('#/resultats')).toEqual({ election: current, route: { name: 'results' } })
    expect(at('#/candidat/a')).toEqual({ election: current, route: { name: 'candidate', id: 'a' } })
  })

  it('par son slug : l’élection archivée, adresse inchangée', () => {
    expect(at('#/choisir-2027/resultats')).toEqual({ election: past, route: { name: 'results' } })
  })

  it('un alias est corrigé en slug', () => {
    expect(at('#/primaire/feuille/3')).toEqual({
      election: past,
      route: { name: 'sheet', tier: 'essentiel', index: 2 },
      redirect: '#/choisir-2027/feuille/3',
    })
  })

  it('l’identifiant de l’élection par défaut, en préfixe, est corrigé en adresse sans préfixe', () => {
    expect(at('#/presidentielle-2027/resultats')).toEqual({ election: current, route: { name: 'results' }, redirect: '#/resultats' })
  })

  it('un préfixe inconnu mène à l’accueil de l’élection par défaut, sans toucher à l’adresse', () => {
    expect(at('#/inconnue/resultats')).toEqual({ election: current, route: { name: 'home' } })
  })

  it('un ancien lien vers un candidat de l’élection archivée seulement mène à l’archive', () => {
    expect(at('#/candidat/royal')).toEqual({
      election: past,
      route: { name: 'candidate', id: 'royal' },
      redirect: '#/choisir-2027/candidat/royal',
    })
    // Candidat des deux élections : l'élection par défaut ; candidat inconnu partout : l'élection par défaut
    expect(at('#/candidat/b')).toEqual({ election: current, route: { name: 'candidate', id: 'b' } })
    expect(at('#/candidat/zz')).toEqual({ election: current, route: { name: 'candidate', id: 'zz' } })
  })

  it('comparaison : dans l’élection de l’adresse, et préfixe corrigé comme pour toute page', () => {
    expect(at('#/comparer/a,b')).toEqual({ election: current, route: { name: 'compare', ids: ['a', 'b'] } })
    expect(at('#/choisir-2027/comparer/b,royal')).toEqual({ election: past, route: { name: 'compare', ids: ['b', 'royal'] } })
    expect(at('#/primaire/comparer/royal,b')).toEqual({
      election: past,
      route: { name: 'compare', ids: ['royal', 'b'] },
      redirect: '#/choisir-2027/comparer/royal,b',
    })
  })

  it('un ancien lien de comparaison dont tous les candidats sont d’une archive seulement mène à l’archive', () => {
    const archived: ElectionRef = { ...past, candidateIds: ['royal', 'faure', 'b'] }
    const reg = [current, archived]
    expect(at('#/comparer/royal,faure', reg)).toEqual({
      election: archived,
      route: { name: 'compare', ids: ['royal', 'faure'] },
      redirect: '#/choisir-2027/comparer/royal,faure',
    })
    // Un candidat de l'élection par défaut dans le lot : on reste dans l'élection par défaut (l'écran écarte l'inconnu)
    expect(at('#/comparer/royal,a', reg)).toEqual({ election: current, route: { name: 'compare', ids: ['royal', 'a'] } })
    // Des candidats que personne n'a, ou répartis entre deux élections : l'élection par défaut, adresse inchangée
    expect(at('#/comparer/zz,yy', reg)).toEqual({ election: current, route: { name: 'compare', ids: ['zz', 'yy'] } })
    expect(at('#/comparer', reg)).toEqual({ election: current, route: { name: 'compare', ids: [] } })
  })

  it('l’ancienne page d’essai des vidéos est corrigée, avec ou sans préfixe', () => {
    expect(at('#/essai-videos/logement-intro')).toEqual({
      election: current,
      route: { name: 'videos', start: 'logement-intro' },
      redirect: '#/videos/logement-intro',
    })
    expect(at('#/primaire/essai-videos')).toEqual({ election: past, route: { name: 'videos' }, redirect: '#/choisir-2027/videos' })
  })

  it('#/archives n’existe que s’il y a une élection archivée', () => {
    expect(at('#/archives').route).toEqual({ name: 'archives' })
    const alone: ElectionRef[] = [{ ...current }]
    expect(at('#/archives', alone)).toEqual({ election: alone[0], route: { name: 'home' } })
  })

  it('exige une élection par défaut', () => {
    expect(() => at('#/', [past])).toThrow()
  })
})

describe('nav : liens relatifs à l’élection affichée', () => {
  afterEach(() => setBase(''))

  it('sans préfixe pour l’élection par défaut, avec son slug pour une autre', () => {
    expect(link('/resultats')).toBe('#/resultats')
    expect(link('/')).toBe('#/')
    setBase('choisir-2027')
    expect(getBase()).toBe('choisir-2027')
    expect(link('/resultats')).toBe('#/choisir-2027/resultats')
    expect(link(`/candidat/royal`)).toBe('#/choisir-2027/candidat/royal')
    expect(link(comparePath(['royal', 'faure']))).toBe('#/choisir-2027/comparer/royal,faure')
    expect(linkIn('', '/')).toBe('#/')
  })
})

describe('aucun lien écrit en dur', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap(f => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []
    })
  /** Le code d'un fichier, sans ses lignes de commentaire */
  const codeOf = (file: string) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n')
  // « '#/ », « `#${ », « '#' + », l'ancien go() d'app.tsx, et toute écriture directe de l'adresse
  const RAW =
    /['"`]#\/|`#\$\{|['"`]#['"`]\s*\+|from '(\.\.\/)+app'|location\.hash\s*=(?!=)|location\.(?:assign|replace)\(\s*['"`]|(?:push|replace)State\([^)]*['"`]#/g
  const allowed = new Set(['src/ui/nav.ts', 'src/core/routes.ts'])
  const sources = files(join(ROOT, 'src'))
    .map(file => ({ rel: relative(ROOT, file), code: codeOf(file) }))
    .filter(f => !allowed.has(f.rel))

  it('hors de src/ui/nav.ts et src/core/routes.ts, aucune adresse « #/… » écrite à la main', () => {
    const offenders: string[] = []
    for (const { rel, code } of sources) for (const m of code.matchAll(RAW)) offenders.push(`${rel} : ${m[0]}`)
    // Exceptions : App ne traite comme une route qu'une adresse qui commence par « #/ » ; le lien vers une
    // rubrique de la page (#<ancre>, sans « / ») n'est pas une adresse du site
    const allowedHits = new Set(["src/app.tsx : '#/", 'src/ui/components/LegalBits.tsx : `#${'])
    expect(offenders.filter(o => !allowedHits.has(o))).toEqual([])
  })

  it('chaque go(\'/…\') et replace(\'/…\') est celui de src/ui/nav.ts, qui ajoute le préfixe de l’élection', () => {
    const offenders: string[] = []
    for (const { rel, code } of sources) {
      for (const fn of ['go', 'replace']) {
        // Un appel de fonction (pas une méthode : « s.replace(…) », « this.go() ») avec un chemin écrit en toutes lettres
        if (!new RegExp(`(?<![.\\w$])${fn}\\(\\s*['"\`]`).test(code)) continue
        const imported = new RegExp(`import\\s*\\{[^}]*\\b${fn}\\b[^}]*\\}\\s*from\\s*'(?:\\.{1,2}/)+(?:ui/)?nav'`).test(code)
        if (!imported) offenders.push(`${rel} : ${fn}() ne vient pas de src/ui/nav.ts`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('le contrôle repère les adresses écrites à la main', () => {
    const hit = (code: string) => [...code.matchAll(RAW)].length > 0
    for (const bad of ["href='#/resultats'", 'href={`#${p}`}', "location.hash = '/x'", "location.replace('#/x')", "'#' + path", "history.pushState(null, '', '#/x')"])
      expect(hit(bad), bad).toBe(true)
    for (const ok of ["href={link('/resultats')}", "location.hash === '#x'", "history.replaceState(null, '', link('/x'))", "s.replace('#', '')"])
      expect(hit(ok), ok).toBe(false)
  })
})
