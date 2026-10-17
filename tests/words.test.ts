// Les mots du site : on parle de « réponses » et de « questions », jamais de « feuille » (décision du propriétaire du
// 17 octobre 2026, après la règle du transfert). La feuille de pointage reste le monde du dessin (DESIGN.md), pas un
// mot de l'interface : les identifiants (l'adresse « #/feuille/N », l'étiquette IA de kind « feuille ») et les
// commentaires gardent le mot. Les textes sont lus dans l'arbre de chaque source (TypeScript) : chaînes, gabarits et
// textes JSX, rien d'autre.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { waitCta } from '../src/core/echiquierCopy'
import { CTA_REREAD, CTA_RESUME, CTA_START } from '../src/core/resultsCopy'

const SRC = fileURLToPath(new URL('../src', import.meta.url))
const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter(f => /\.tsx?$/.test(f))
  .map(f => join(SRC, f))

/**
 * Les textes d'un fichier, avec leur ligne. Deux champs ne sont jamais montrés : la consigne de dessin d'un passage
 * vidéo (« draw », ui/videos/types.ts) et le parti pris d'une piste graphique (« description » d'une piste, où la
 * feuille est le papier quadrillé du dessin)
 */
function textsOf(file: string): { text: string; line: number }[] {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const hidden = relative(SRC, file).startsWith(join('ui', 'videos', 'pistes')) ? ['draw', 'description'] : ['draw']
  const out: { text: string; line: number }[] = []
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && hidden.includes(node.name.getText(source))) return
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node)) {
      out.push({ text: node.text, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return out
}

/** Un identifiant, pas un texte : l'adresse des questions (« /feuille/3 ») ou le nom d'une étiquette (« feuille ») */
const isIdentifier = (t: string) => t === 'feuille' || /^\/feuille\b/.test(t)

describe('les mots du site : « réponses » et « questions », jamais « feuille »', () => {
  it('aucun texte visible ne parle de feuille, dans aucune source du site', () => {
    const found = files.flatMap(file =>
      textsOf(file)
        .filter(({ text }) => /\bfeuilles?\b/i.test(text) && !isIdentifier(text))
        .map(({ text, line }) => `${relative(SRC, file)}:${line} « ${text.trim().slice(0, 120)} »`),
    )
    expect(found).toEqual([])
  })

  it('le contrôle lit bien les textes : un bouton, un gabarit, une phrase de la Méthode', () => {
    const all = (path: string) => textsOf(join(SRC, path)).map(x => x.text)
    expect(all('core/resultsCopy.ts')).toContain('Répondre aux questions')
    expect(all('ui/components/SiteFooter.tsx').map(t => t.trim())).toContain('Vos réponses')
    expect(all('core/echiquierMethodCopy.ts').some(t => t.includes('questionnaires remplis par un programme'))).toBe(true)
    // Les identifiants restent : l'adresse des questions et l'étiquette IA de leurs écrans
    expect(all('core/routes.ts')).toContain('feuille')
    expect(isIdentifier('/feuille/1') && isIdentifier('feuille') && !isIdentifier('Votre feuille')).toBe(true)
  })

  it('les appels aux questions sont les mêmes partout, et la page d’attente du profil les reprend', () => {
    expect([CTA_START, CTA_RESUME, CTA_REREAD]).toEqual(['Répondre aux questions', 'Reprendre mes réponses', 'Relire mes réponses'])
    expect(waitCta('vide', 22)).toBe(CTA_START)
    expect(waitCta('sans-avis', 0)).toBe(CTA_REREAD)
    // Les écrans les importent de core/resultsCopy.ts ; seul le pied de page écrit le sien, mot pour mot : l'import y
    // ferait sortir le calcul du score dans un fichier commun, qui alourdit « Mon profil politique » (mesuré le
    // 17/10/2026, 66 octets de plus quand la page n'en a que 27 sous son plafond)
    const writers = files.filter(file => textsOf(file).some(({ text }) => [CTA_START, CTA_RESUME, CTA_REREAD].includes(text.trim())))
    expect(writers.map(f => relative(SRC, f)).sort()).toEqual(['core/resultsCopy.ts', 'ui/components/SiteFooter.tsx'])
    expect(textsOf(join(SRC, 'ui/components/SiteFooter.tsx')).map(x => x.text.trim())).toContain(CTA_REREAD)
  })

  it('un bouton parle à la première personne, un titre à la deuxième', () => {
    // « Reprendre mes réponses », « Relire mes réponses », comme « Transférer mes réponses » et « Voir mon
    // dépouillement » ; « Vos réponses » (le pied de page) et « Transférer vos réponses » (la page) sont des titres. Un
    // libellé de bouton : le verbe et son objet, rien d'autre (« Remplacer vos réponses par celles du fichier ? » est
    // la question que le bouton « Remplacer mes réponses » tranche)
    expect([CTA_RESUME, CTA_REREAD].every(t => t.endsWith(' mes réponses'))).toBe(true)
    const second = files.flatMap(file =>
      textsOf(file)
        .filter(({ text }) => /^(Reprendre|Relire|Remplacer|Importer|Voir|Revoir|Télécharger) (vos|votre) \S+$/.test(text.trim()))
        .map(({ text, line }) => `${relative(SRC, file)}:${line} « ${text.trim()} »`),
    )
    expect(second).toEqual([])
  })
})
