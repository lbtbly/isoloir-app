// Page de développement du harnais tools/videos-snap.mjs (servie par Vite en dev seulement : le build ne prend
// que index.html). Elle dessine, en image fixe (mouvement réduit : « still », état final), les passages d'une
// vidéo avec la piste du site (PISTE.Frame et PISTE.Segment, le contrat de src/ui/videos/types.ts), sans passer
// par le lecteur : rien ne bouge, rien ne parle, aucune voix n'est chargée.
//
// Deux mises en page, appelées par le harnais via window.__snap :
//   one(vidéo, passage)       un écran comme celui du lecteur (onglets, repère et titre, scène, sous-titres,
//                             bandeau des commandes) : la scène prend la place qui reste, comme dans le lecteur ;
//                             sur un grand écran, une colonne centrée au format 9:16 ;
//   grid(vidéo, l, h, cols)   tous les passages de la vidéo en grille, scènes de l × h px, pour un coup d'œil.
// Chaque passage est contrôlé : planche ou dessin générique (planche absente, qui rend null ou qui lève une
// erreur), textes coupés par le bord de la scène, dessin qui déborde de sa feuille, plus petit texte (px).

import '@fontsource-variable/archivo/wdth.css'
import '../src/styles/tokens.css'
import '../src/styles/app.css'
import '../src/styles/videos.css'
import { h, render, type VNode } from 'preact'
import { choisir2027 } from '../src/elections/choisir-2027'
import { markerOf, partOf, wordsOf } from '../src/ui/videos/model'
import { PISTE } from '../src/ui/videos/pistes'
import { PLANCHES } from '../src/ui/videos/pistes/planches'
import { VIDEO_SERIES } from '../src/ui/videos/series'
import type { PisteSegmentProps, VideoMeta, VideoScript, VideoSeries } from '../src/ui/videos/types'

if (!import.meta.env.DEV) throw new Error('Page de développement : serveur de dev seulement')

/** Texte plus petit que ce corps (px à l'écran) : signalé */
const MIN_PX = 11

const { bank } = choisir2027
const groups = choisir2027.topicGroups ?? []

const css = `
body { margin: 0; background: var(--paper); color: var(--print); }
.snap-desk { min-height: 100vh; display: grid; justify-items: center; align-content: start; padding-top: 64px; }
.snap-col { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto 72px; background: var(--paper); }
.snap-phone { width: 100vw; height: 100vh; grid-template-rows: 56px auto minmax(0, 1fr) auto 72px; }
.snap-desk .snap-col { outline: 1px solid var(--rule); }
.snap-tabs { border-bottom: 1px solid var(--rule); }
.snap-head { padding: 12px 20px 10px; display: grid; gap: 4px; }
.snap-marker { margin: 0; font-size: 14px; font-weight: 650; text-decoration: underline; text-underline-offset: 3px; }
.snap-title { margin: 0; font-size: 22px; line-height: 1.15; font-weight: 850; font-stretch: 80%; }
.snap-video { min-height: 0; display: grid; }
.snap-stage { position: relative; min-height: 0; overflow: hidden; container: vp-stage / size; border-top: 1px solid var(--rule); }
.snap-caps { display: grid; padding: 14px 20px 12px; border-top: 1px solid var(--print); }
.snap-caps > p { grid-area: 1 / 1; margin: 0; font-size: 20px; line-height: 1.3; font-weight: 750; }
.snap-caps > .is-sizer { visibility: hidden; }
.snap-bar { border-top: 1px solid var(--rule); padding: 8px 12px; font-size: 12px; line-height: 1.35; color: var(--print-soft); overflow: hidden; }
.snap-bar b { color: var(--print); }
.snap-grid { display: grid; gap: 28px 20px; padding: 20px; align-items: start; }
.snap-cell { display: grid; gap: 6px; }
.snap-cell .snap-stage { border: 1px solid var(--rule); }
.snap-cell-id { margin: 0; font-size: 13px; font-weight: 750; }
.snap-cell-say { margin: 0; font-size: 13px; line-height: 1.35; }
.snap-warn { margin: 0; font-size: 12px; line-height: 1.35; font-weight: 700; }
.snap-sheet-title { grid-column: 1 / -1; margin: 0; font-size: 20px; font-weight: 850; }
`
document.head.append(Object.assign(document.createElement('style'), { textContent: css }))

/* ——— Les données ——— */

function find(videoId: string): { series: VideoSeries; script: VideoScript } {
  for (const series of VIDEO_SERIES) {
    const script = series.videos.find(v => v.id === videoId)
    if (script) return { series, script }
  }
  throw new Error(`Vidéo inconnue : ${videoId}`)
}

function metaOf(series: VideoSeries, script: VideoScript): VideoMeta {
  const { part, of } = partOf(series, script)
  const only = script.questionIds.length === 1 ? bank.questions.find(q => q.id === script.questionIds[0]) : undefined
  return {
    topic: bank.topics.find(t => t.id === series.topicId)?.label ?? series.label,
    family: groups.find(g => g.topicIds.includes(series.topicId))?.label ?? '',
    part,
    of,
    marker: markerOf(series, script),
    prompt: only?.prompt ?? '',
  }
}

/** Les propriétés du passage en image fixe : état final, tout est dit */
function propsOf(series: VideoSeries, script: VideoScript, index: number): PisteSegmentProps {
  const segment = script.segments[index]
  if (!segment) throw new Error(`${script.id} : pas de passage ${index + 1}`)
  return {
    script,
    segment,
    index,
    playing: false,
    still: true,
    progress: 1,
    word: wordsOf(segment.say).length - 1,
    meta: metaOf(series, script),
    context: 'site',
  }
}

/** La planche du passage existe-t-elle, et se retrouve-t-elle dans son script ? */
function boardOf(p: PisteSegmentProps): { generic: boolean; error?: string } {
  const board = PLANCHES[p.segment.id]
  if (!board) return { generic: true, error: 'aucune planche' }
  try {
    return board(p) === null ? { generic: true, error: 'la planche rend null' } : { generic: false }
  } catch (e) {
    return { generic: true, error: `la planche lève : ${String(e)}` }
  }
}

/** La scène d'un passage : le décor de la piste et son dessin, figés */
function stage(p: PisteSegmentProps, style?: Record<string, string>): VNode {
  const scene = h(PISTE.Segment, { ...p, key: `${p.script.id}:${p.index}` })
  const Frame = PISTE.Frame
  return h(
    'div',
    { class: 'vp-stage is-paused is-still snap-stage', 'aria-hidden': 'true', style },
    Frame ? h(Frame, { script: p.script, index: p.index, playing: false, still: true, meta: p.meta, context: p.context }, scene) : scene,
  )
}

/** Les couleurs du lecteur, posées comme le fait .vp-video, sans dépendre de sa mise en page */
const videoVars = {
  '--vp-paper': 'var(--paper)',
  '--vp-print': 'var(--print)',
  '--vp-soft': 'var(--print-soft)',
  '--vp-rule': 'var(--rule)',
  '--vp-mark': 'var(--print)',
}

/* ——— Les contrôles ——— */

export interface Check {
  id: string
  index: number
  visual: string
  generic: boolean
  error?: string
  /** Taille de la scène, px */
  stage: [number, number]
  /** Coupés par le bord de la scène (ou de la zone du dessin) */
  clipped: string[]
  /** Sortis de la feuille de leur dessin (Art) : ils peuvent chevaucher le titre ou la légende */
  spill: string[]
  /** Plus petit texte, px à l'écran */
  minFont: number | null
  /** Textes de moins de MIN_PX */
  small: string[]
}

const snippet = (el: Element) => {
  const t = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
  const c = el.getAttribute('class')?.split(' ').filter(Boolean) ?? []
  const name = `${el.tagName.toLowerCase()}${c.map(x => `.${x}`).join('')}`
  return t ? `${name} « ${t.length > 32 ? `${t.slice(0, 31)}…` : t} »` : name
}

function out(r: DOMRect, R: DOMRect, tol: number) {
  return r.left < R.left - tol || r.right > R.right + tol || r.top < R.top - tol || r.bottom > R.bottom + tol
}

/** De combien, et de quel côté, un élément dépasse d'un cadre : « 15 px en haut » */
function beyond(r: DOMRect, R: DOMRect) {
  const sides: [number, string][] = [
    [R.top - r.top, 'en haut'],
    [r.bottom - R.bottom, 'en bas'],
    [R.left - r.left, 'à gauche'],
    [r.right - R.right, 'à droite'],
  ]
  return sides
    .filter(([d]) => d > 1)
    .map(([d, s]) => `${Math.round(d)} px ${s}`)
    .join(', ')
}

function checkStage(el: HTMLElement, base: Omit<Check, 'stage' | 'clipped' | 'spill' | 'minFont' | 'small'>): Check {
  const S = el.getBoundingClientRect()
  const board = (el.querySelector('.vc-board') as HTMLElement | null) ?? el
  const B = board.getBoundingClientRect()
  const clipped = new Set<string>()
  const spill = new Set<string>()
  const small: string[] = []
  let minFont: number | null = null
  for (const node of board.querySelectorAll('*')) {
    const style = getComputedStyle(node)
    if (style.visibility === 'hidden' || style.display === 'none') continue
    const r = node.getBoundingClientRect()
    if (!r.width && !r.height) continue
    const isSvgText = node instanceof SVGTextElement
    const isText = isSvgText || (!(node instanceof SVGElement) && [...node.childNodes].some(n => n.nodeType === 3 && n.textContent?.trim()))
    const isShape = node instanceof SVGGeometryElement || isSvgText
    if ((isText || isShape) && out(r, B, 1.5)) clipped.add(`${snippet(isShape && !isSvgText ? (node.closest('g, svg') ?? node) : node)} (${beyond(r, B)})`)
    if (node instanceof SVGGraphicsElement && !(node instanceof SVGSVGElement) && !(node instanceof SVGGElement)) {
      const art = node.ownerSVGElement?.closest('.vc-art')
      const A = art?.getBoundingClientRect()
      if (A && out(r, A, 8)) spill.add(`${snippet(isSvgText ? node : (node.closest('g') ?? node))} (${beyond(r, A)})`)
    }
    if (isText) {
      let px = parseFloat(style.fontSize)
      if (isSvgText) {
        const m = (node as SVGTextElement).getScreenCTM()
        if (m) px *= Math.hypot(m.a, m.b)
      }
      if (Number.isFinite(px)) {
        minFont = minFont === null ? px : Math.min(minFont, px)
        if (px < MIN_PX) small.push(`${px.toFixed(1)} px ${snippet(node)}`)
      }
    }
  }
  return {
    ...base,
    stage: [Math.round(S.width), Math.round(S.height)],
    clipped: [...clipped],
    spill: [...spill],
    minFont: minFont === null ? null : Math.round(minFont * 10) / 10,
    small,
  }
}

const settle = async () => {
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
  await document.fonts.ready
  await new Promise<void>(r => requestAnimationFrame(() => r()))
}

const root = document.getElementById('snap')!

/* ——— Les deux mises en page ——— */

const fr = (n: number) => String(n).replace('.', ',')

function infoOf(c: Check) {
  const warn = [
    c.generic ? `dessin générique (${c.error})` : 'planche',
    c.clipped.length ? `${c.clipped.length} coupé(s)` : '',
    c.spill.length ? `${c.spill.length} hors feuille` : '',
    c.small.length ? `${c.small.length} texte(s) < ${MIN_PX} px` : '',
  ].filter(Boolean)
  return `${c.id} · ${c.visual} · ${warn.join(' · ')} · scène ${c.stage[0]}×${c.stage[1]} · plus petit texte ${c.minFont === null ? '—' : `${fr(c.minFont)} px`}`
}

/** Un écran du lecteur, la scène dans la place qui reste ; ou, « forced », une scène de taille fixe (l × h) */
async function one(videoId: string, index: number, forced?: [number, number] | null): Promise<Check> {
  const { series, script } = find(videoId)
  const p = propsOf(series, script, index)
  // Démonté d'abord : le bilan est écrit hors de Preact, il ne doit pas survivre au rendu suivant
  render(null, root)
  const phone = innerWidth < 600
  const colStyle = forced
    ? { width: `${forced[0]}px`, height: 'auto', gridTemplateRows: `56px auto ${forced[1]}px auto 72px` }
    : phone
      ? undefined
      : (() => {
          const height = innerHeight - 96
          // Pas d'onglets dans la colonne : ils sont au-dessus, sur toute la largeur
          return { width: `${Math.round(Math.min(520, (height * 9) / 16))}px`, height: `${height}px`, gridTemplateRows: 'auto minmax(0, 1fr) auto 72px' }
        })()
  const col = h(
    'div',
    { class: `snap-col${phone ? ' snap-phone' : ''}`, style: { ...colStyle, ...videoVars } },
    phone ? h('div', { class: 'snap-tabs' }) : null,
    h('header', { class: 'snap-head' }, h('p', { class: 'snap-marker' }, p.meta.marker), h('h2', { class: 'snap-title' }, script.title)),
    h('div', { class: `snap-video ${PISTE.className}` }, stage(p)),
    // Les sous-titres prennent la hauteur du plus long passage de la vidéo, comme dans le lecteur
    h(
      'div',
      { class: 'snap-caps' },
      ...script.segments.map(s => h('p', { class: 'is-sizer', 'aria-hidden': 'true' }, s.say)),
      h('p', null, p.segment.say),
    ),
    h('div', { class: 'snap-bar' }, ''),
  )
  render(phone || forced ? col : h('div', { class: 'snap-desk' }, col), root)
  await settle()
  const el = root.querySelector('.snap-stage') as HTMLElement
  const c = checkStage(el, { id: p.segment.id, index, visual: p.segment.visual, ...boardOf(p) })
  ;(root.querySelector('.snap-bar') as HTMLElement).textContent = infoOf(c)
  return c
}

/** Tous les passages d'une vidéo en grille, scènes de w × hh px */
async function grid(videoId: string, w: number, hh: number, cols: number): Promise<Check[]> {
  const { series, script } = find(videoId)
  const all = script.segments.map((_, i) => propsOf(series, script, i))
  render(null, root)
  render(
    h(
      'div',
      { class: `snap-grid ${PISTE.className}`, style: { gridTemplateColumns: `repeat(${cols}, ${w}px)`, ...videoVars } },
      h('h1', { class: 'snap-sheet-title' }, `${markerOf(series, script)} — ${script.title}`),
      ...all.map(p =>
        h(
          'div',
          { class: 'snap-cell', 'data-i': String(p.index) },
          h('p', { class: 'snap-cell-id' }, `${String(p.index + 1).padStart(2, '0')} · ${p.segment.visual}`),
          stage(p, { width: `${w}px`, height: `${hh}px` }),
          h('p', { class: 'snap-cell-say' }, p.segment.say),
          h('p', { class: 'snap-warn' }, ''),
        ),
      ),
    ),
    root,
  )
  await settle()
  return all.map(p => {
    const cell = root.querySelector(`.snap-cell[data-i="${p.index}"]`) as HTMLElement
    const c = checkStage(cell.querySelector('.snap-stage') as HTMLElement, { id: p.segment.id, index: p.index, visual: p.segment.visual, ...boardOf(p) })
    const warn = [
      c.generic ? `⚠ dessin générique (${c.error})` : '',
      ...c.clipped.map(x => `⚠ coupé : ${x}`),
      ...c.spill.map(x => `⚠ hors feuille : ${x}`),
      ...c.small.map(x => `⚠ petit : ${x}`),
    ].filter(Boolean)
    ;(cell.querySelector('.snap-warn') as HTMLElement).textContent = warn.join('\n') || `plus petit texte ${c.minFont === null ? '—' : `${fr(c.minFont)} px`}`
    ;(cell.querySelector('.snap-warn') as HTMLElement).style.whiteSpace = 'pre-line'
    return c
  })
}

/** Les séries et leurs vidéos, pour que le harnais traduise un thème en vidéos */
const catalog = () =>
  VIDEO_SERIES.map(s => ({ topicId: s.topicId, label: s.label, videos: s.videos.map(v => ({ id: v.id, title: v.title, n: v.segments.length })) }))

declare global {
  interface Window {
    __snap?: { catalog: typeof catalog; one: typeof one; grid: typeof grid; minPx: number }
  }
}
window.__snap = { catalog, one, grid, minPx: MIN_PX }
