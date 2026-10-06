// Piste C, le dessin générique d'un passage, d'après sa sorte d'image : pour un thème qui n'a pas encore ses
// planches, ou une planche qui ne se retrouve plus dans un script modifié. Il compose la même bibliothèque à
// partir du script seul : un rapport dit (« 1 sur 7 », « 30 sur 100 ») se compte, les années se posent sur
// une frise, les mots appellent leurs pictogrammes (LEXIQUE de pictos.tsx), un graphique de la fiche
// (FigureChart) se trace sous le chiffre.

import type { JSX } from 'preact'
import { FigureChart } from '../../../components/FigureChart'
import { chartOf } from '../../model'
import { Art, Ask, Txt, W, cuesOf, ratioOf, sentenceWith, yearsOf, type P } from '../dessin/encre'
import { Chiffre, HeadCues, Note, Question, Seg, Signature, Sommaire, Src, Sur100, lineOf, Head } from '../dessin/mises'
import { Picto, pictoFor, type PictoName } from '../dessin/pictos'
import { Rang, Signe, frise, rangCells } from '../dessin/schemas'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Jusqu'à trois pictogrammes appelés par les mots d'un texte, dans l'ordre où ils viennent */
function pictosOf(text: string, max = 3): PictoName[] {
  const out: PictoName[] = []
  for (const part of text.split(/[,.;:?!]|\set\s/)) {
    const n = pictoFor(part)
    if (n && !out.includes(n)) out.push(n)
    if (out.length >= max) break
  }
  return out
}

/** Une rangée de pictogrammes, centrée */
function Pictos({ list, size = 70 }: { list: PictoName[]; size?: number }) {
  if (!list.length) return null
  const gap = 24
  const x0 = (W - list.length * size - (list.length - 1) * gap) / 2
  return (
    <Art h={size + 8}>
      {list.map((n, i) => (
        <Picto key={n} n={n} x={x0 + i * (size + gap)} y={4} size={size} t0={200 + i * 350} />
      ))}
    </Art>
  )
}

/** Un chiffre : compté s'il se dit en rapport, sinon son pictogramme ; le graphique de la fiche s'il y en a un */
function figure(p: P): JSX.Element {
  const f = p.segment.figure!
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  const chart = chartOf(p.segment)
  let art: JSX.Element
  if (r && cue && r.n === 100) {
    art = <Sur100 p={p} kind="carre" low={r.k} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
  } else if (r && cue && r.n <= 13) {
    const n = pictoFor(`${f.label} ${p.segment.say}`) ?? 'personne'
    const cols = r.n > 7 ? Math.ceil(r.n / 2) : r.n
    const { h } = rangCells({ n: r.n, cols, max: 48, gap: 8 })
    art = (
      <>
        <Art h={h + 6}>
          <Rang n={r.n} picto={n} cols={cols} max={48} gap={8} y={2} count={range(r.k)} shown={cue.shown} t0={300} />
        </Art>
        <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      </>
    )
  } else if (chart) {
    art = (
      <div class="vc-chart vc-rise" style={{ '--d': '1600ms' }}>
        <FigureChart chart={chart} value={f.value} text={`${f.value} ${f.label}`} />
      </div>
    )
  } else {
    art = <Pictos list={pictosOf(`${f.label}. ${p.segment.say}`, 1)} size={90} />
  }
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** Le dessin générique d'un passage */
export function generique(p: P): JSX.Element {
  const { visual, figure: f } = p.segment
  const cues = cuesOf(p)
  if (f) return figure(p)
  if (visual === 'question') {
    const n = pictosOf(p.segment.say, 1)[0]
    return (
      <Seg kind="ask">
        <Art h={100}>
          {n ? <Picto n={n} x={70} y={10} size={84} t0={200} /> : null}
          <Ask x={n ? 186 : 126} y={10} h={80} t0={700} />
        </Art>
        <Question p={p} />
      </Seg>
    )
  }
  if (visual === 'outro') {
    return (
      <Seg kind="end">
        {p.script.kind === 'intro' ? <Sommaire p={p} /> : <HeadCues p={p} />}
        {p.script.kind === 'intro' ? null : <Pictos list={pictosOf(p.segment.say)} size={64} />}
        <Signature p={p} />
      </Seg>
    )
  }
  if (visual === 'timeline') {
    const years = [...new Set(yearsOf(p.segment.say))].sort((a, b) => a - b)
    if (years.length) {
      const from = years[0]! - 1
      const to = years[years.length - 1]! + 1
      const fr = frise({ y: 70, from, to, ticks: range(to - from + 1).map(k => from + k), t0: 100 })
      return (
        <Seg>
          <HeadCues p={p} />
          <Art h={110}>
            {fr.el}
            {years.map((y, i) => (
              <g key={y}>
                <Picto n="drapeau" x={fr.X(y) - 9} y={30} size={40} tone="count" t0={600 + i * 300} />
                <Txt x={fr.X(y)} y={98} text={String(y)} size={15} t0={700 + i * 300} />
              </g>
            ))}
          </Art>
        </Seg>
      )
    }
  }
  if (visual === 'compare' && cues.length >= 2) {
    const [a, b] = cues
    return (
      <Seg>
        <Art h={140}>
          <Signe n={pictoFor(a!.text) ?? 'document'} cx={75} y={6} size={70} label={a!.text} shown={a!.shown} t0={200} />
          <Signe n={pictoFor(b!.text) ?? 'document'} cx={225} y={6} size={70} label={b!.text} shown={b!.shown} t0={600} />
        </Art>
      </Seg>
    )
  }
  // Accroche, point : les mots mis en valeur en gros, et les pictogrammes que le passage appelle
  const lines = cues.length ? cues.map(c => lineOf(c)) : [{ text: p.script.title, shown: true }]
  return (
    <Seg>
      <Head lines={lines} />
      <Pictos list={pictosOf(p.segment.say)} />
    </Seg>
  )
}
