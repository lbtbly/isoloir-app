// Piste C, la mise en page d'un passage : le titre (mots mis en valeur, ou chiffre de la fiche), le dessin, et
// ce qui l'accompagne (libellé, légende, source, question). Ce sont de vrais textes HTML, composés à la
// française, qui se coupent d'eux-mêmes ; la scène reste masquée aux lecteurs d'écran (tout est dit dans les
// sous-titres et les sources).
//
// Cinq mises en page, toujours les mêmes :
//   Seg               un titre en gros (les mots mis en valeur, écrits quand la voix les dit), puis le dessin
//   Seg kind="fig"    le chiffre de la fiche et son libellé, le dessin, la source
//   Seg kind="ask"    le dessin, puis la question dite, son mot clé souligné
//   Seg kind="end"    la fin : le sommaire de la série, ou un dernier dessin
//   Panel, Sommaire   des listes de pictogrammes légendés (questions, risques, vidéos de la série)

import type { ComponentChildren } from 'preact'
import { Logo } from '../../../components/Logo'
import { VIDEO_SERIES } from '../../series'
import { Marks, at, cls, cuesOf, fold, heard, longest, sentencesOf, type Cue, type P } from './encre'
import { Cent, type UnitKind } from './schemas'
import { Glyphe, pictoFor, type PictoName } from './pictos'

/** Un passage : ses blocs l'un sous l'autre, centrés dans la scène */
export function Seg({ kind, children }: { kind?: 'fig' | 'ask' | 'end'; children: ComponentChildren }) {
  return <div class={cls('vc-seg', kind && `is-${kind}`)}>{children}</div>
}

/** Une ligne du titre : son texte, si la voix l'a dit, et le mot à souligner */
export interface Line {
  text: string
  shown: boolean
  mark?: Cue
}

/** Une ligne du titre faite d'un mot mis en valeur, souligné quand il est dit */
export const lineOf = (c: Cue | null | undefined, ask = false): Line | null =>
  c ? { text: ask ? `${c.text}\u202f?` : c.text, shown: c.shown, mark: c } : null

/**
 * Le titre du passage, en gros : une ligne par mot mis en valeur, écrite de gauche à droite quand la voix la
 * dit. Sa place est gardée d'avance, pour que le dessin ne saute pas.
 */
export function Head({ lines, t0 = 150 }: { lines: (Line | null)[]; t0?: number }) {
  const list = lines.filter((l): l is Line => !!l)
  if (!list.length) return null
  const len = Math.max(...list.map(l => longest(l.text)))
  const first = list.findIndex(l => l.shown)
  return (
    <p class="vc-big" style={{ '--len': String(len) }}>
      {list.map((l, i) => (
        <span key={i} class={cls('vc-big-line', l.shown ? 'vc-write' : 'vc-wait')} style={at(i === first ? t0 : 0)}>
          <Marks text={l.text} cues={l.mark ? [l.mark] : []} />
        </span>
      ))}
    </p>
  )
}

/** Le titre fait des mots mis en valeur du passage (« ask » : le dernier prend son point d'interrogation) */
export const HeadCues = ({ p, ask, only }: { p: P; ask?: boolean; only?: number[] }) => {
  const cues = cuesOf(p).filter((_, i) => !only || only.includes(i))
  return <Head lines={cues.map((c, i) => lineOf(c, ask && i === cues.length - 1))} />
}

/** Longueur du chiffre pour son corps : sur une ligne s'il est court, sur deux au plus sinon */
const valueLen = (v: string) =>
  v.length <= 9 ? v.length : Math.max(...v.split(/[ \t]+/).map(w => w.length), Math.ceil(v.length * 0.6))

/**
 * L'essentiel du libellé d'un chiffre : jusqu'à la première précision (parenthèse, deux-points, point-virgule,
 * phrase suivante), puis, s'il reste trop long, jusqu'à la dernière virgule avant 96 signes.
 */
export function coreOf(label: string): string {
  let s = label
  const cut = /[\s\u00a0\u202f]\(|[\s\u00a0\u202f]?[:;][\s\u00a0\u202f]|\.\s/.exec(s)
  if (cut && cut.index > 0) s = s.slice(0, cut.index)
  if (s.length > 96) {
    const i = s.lastIndexOf(', ', 96)
    if (i > 40) s = s.slice(0, i)
  }
  return s
}

/** Le chiffre de la fiche, à la lettre, écrit en gros ; dessous, l'essentiel de son libellé */
export function Chiffre({ p, t0 = 150, label = true }: { p: P; t0?: number; label?: boolean }) {
  const f = p.segment.figure
  if (!f) return null
  return (
    <div class="vc-fig-head">
      <p class="vc-value" style={{ '--len': String(valueLen(f.value)) }}>
        <span class="vc-write" style={at(t0)}>
          {f.value}
        </span>
      </p>
      {label ? (
        <p class="vc-label vc-rise" style={at(t0 + 650)}>
          <Marks text={coreOf(f.label)} cues={cuesOf(p)} />
        </p>
      ) : null}
    </div>
  )
}

/** Le libellé seul, en titre d'un graphique qui porte déjà les valeurs */
export function Libelle({ p, t0 = 100 }: { p: P; t0?: number }) {
  const f = p.segment.figure
  if (!f) return null
  return (
    <p class="vc-label is-title vc-rise" style={at(t0)}>
      <Marks text={coreOf(f.label)} cues={cuesOf(p)} />
    </p>
  )
}

/** La source du chiffre, et sa date */
export function Src({ p, t0 = 1800 }: { p: P; t0?: number }) {
  const f = p.segment.figure
  const source = f ? p.script.sources[f.sourceIndex] : undefined
  if (!f || !source) return null
  return (
    <p class="vc-source vc-rise" style={at(t0)}>
      {`Source\u00a0: ${source.publisher ?? source.title}${f.date ? `\u00a0· ${f.date}` : ''}`}
    </p>
  )
}

/** Une phrase dite, écrite sous le dessin quand la voix l'atteint (sa place gardée d'avance) */
export function Note({ p, text, cues, t0 = 0, big }: { p: P; text: string | null | undefined; cues?: Cue[]; t0?: number; big?: boolean }) {
  if (!text) return null
  const shown = heard(p, text.split(/[ \u00a0]/).slice(0, 3).join(' '))
  return (
    <p class={cls('vc-note', big && 'is-big', shown ? 'vc-rise' : 'vc-wait')} style={at(t0)}>
      <Marks text={text} cues={cues ?? cuesOf(p)} />
    </p>
  )
}

/** La question dite (les phrases du passage qui finissent par « ? »), son mot clé souligné */
export function Question({ p, t0 = 300 }: { p: P; t0?: number }) {
  const asked = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  const text = (asked.length ? asked : [p.segment.say]).join(' ')
  return (
    <p class="vc-prompt vc-rise" style={at(t0)}>
      <Marks text={text} cues={cuesOf(p)} />
    </p>
  )
}

/** Sur 100 : la grille des unités, et ce qu'elle compte écrit à côté, avec sa légende */
export function Sur100({ p, kind, low, high = low, mode = 'count', caption, cues, shown = true }: { p: P; kind: UnitKind; low: number; high?: number; mode?: 'count' | 'retrait'; caption: string | null; cues?: Cue[]; shown?: boolean }) {
  return (
    <div class="vc-units">
      <div class="vc-units-grid">
        <Cent kind={kind} low={low} high={high} mode={mode} shown={shown} t0={200} />
      </div>
      <p class={cls('vc-units-cap', shown ? 'vc-rise' : 'vc-wait')} style={at(900)}>
        <span class={cls('vc-swatch', mode === 'retrait' && 'is-out')} aria-hidden="true">
          {high > low ? <i class="is-range" /> : null}
          <i />
        </span>
        {caption ? <Marks text={caption} cues={cues ?? cuesOf(p)} /> : null}
      </p>
    </div>
  )
}

/** Une planche de pictogrammes légendés (les questions d'un thème, les risques d'une liste) ; chacun arrive
 *  quand la voix le dit */
export function Panel({ items, cols = 2 }: { items: { picto: PictoName; text: string; shown: boolean; cues?: Cue[] }[]; cols?: number }) {
  return (
    <ul class="vc-panel" style={{ '--cols': String(cols) }}>
      {items.map((it, i) => (
        <li key={i} class={cls('vc-panel-item', it.shown ? 'vc-rise' : 'vc-wait')}>
          {it.shown ? <Glyphe n={it.picto} t0={150} /> : <span class="vc-glyphe" />}
          <span class="vc-panel-text">
            <Marks text={it.text} cues={it.cues ?? []} />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Les vidéos d'approfondissement de la série, en sommaire numéroté : la fin d'une introduction */
export function Sommaire({ p, t0 = 200 }: { p: P; t0?: number }) {
  const series = VIDEO_SERIES.find(s => s.videos.some(v => v.id === p.script.id))
  const deep = series?.videos.filter(v => v.kind === 'deep') ?? []
  if (!deep.length) return null
  return (
    <ol class="vc-chap">
      {deep.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
          <span class="vc-chap-n">{i + 1}</span>
          <Glyphe n={pictoFor(`${v.short} ${v.title}`) ?? 'document'} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/** Hors du site seulement (vidéo partagée) : la signature d'Isoloir en bas de la fin. Sur le site, rien. */
export function Signature({ p, t0 = 1600 }: { p: P; t0?: number }) {
  if (p.context !== 'share') return null
  return (
    <span class="vc-logo vc-rise" style={at(t0)}>
      <Logo layout="stacked" />
    </span>
  )
}

/** Les éléments d'une liste dite (« chômage, arrêts maladie, invalidité, minima sociaux »), après « : » */
export function listAfterColon(say: string): string[] {
  const i = say.search(/[\u00a0 ]:/)
  if (i < 0) return []
  const tail = say.slice(i + 2).replace(/[.!?…]+$/, '').trim()
  const out: string[] = []
  for (const part of tail.split(/,\s+|\s+et\s+/)) {
    // « comme en plongée » précise l'élément d'avant
    if (/^comme\s/.test(part) && out.length) out[out.length - 1] += `, ${part}`
    else if (part) out.push(part)
  }
  return out
}

/** Le texte avant « : » d'une phrase dite, s'il porte le mot mis en valeur (« Cotiser plus ») */
export function leadOf(p: P): Line | null {
  const cue = cuesOf(p)[0]
  const i = p.segment.say.search(/[\u00a0 ]:/)
  if (i < 0) return cue ? lineOf(cue) : null
  const text = p.segment.say.slice(0, i).trim()
  return { text, shown: heard(p, text.split(' ')[0]), mark: cue && fold(text).includes(fold(cue.text)) ? cue : undefined }
}
