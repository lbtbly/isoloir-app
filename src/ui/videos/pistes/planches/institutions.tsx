// Piste C, les planches de la série « Institutions » (src/ui/videos/series/institutions.ts) : un dessin par
// passage, composé avec la bibliothèque commune (../dessin/). Les mots et les nombres viennent du script (mots
// mis en valeur, phrases dites, chiffre de la fiche) : si le texte change, le dessin suit ; s'il ne s'y retrouve
// plus (une planche rend null), le passage prend le dessin générique de sa sorte d'image.
// Deux pictogrammes manquaient à la bibliothèque : l'hémicycle d'une assemblée (trois rangs de sièges en
// demi-cercle, sans aucun emblème) et l'urne ; ils sont dessinés ici, au trait. Le gouvernement est figuré par
// trois personnes côte à côte, sans attribut. Quelques étiquettes courtes et neutres sont écrites ici quand le
// passage ne les dit pas (« pour », « contre ») : elles nomment ce qui est dessiné, et l'« alt » du passage les
// reprend.

import { chartOf } from '../../model'
import { VIDEO_SERIES } from '../../series'
import { Art, Arrow, Ask, Fade, Ink, Marks, Txt, W, at, cls, wrap, cueOf, cuesOf, fractionOf, heard, num, plain, ratioOf, said, sentenceWith, sentencesOf, word, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Question, Seg, Signature, Src, Sur100, lineOf } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Cases, Rang, balance, barres, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Pictogrammes de la série ——— */

/**
 * L'hémicycle d'une assemblée : trois rangs de sièges en demi-cercle, coupés en travées, posés sur une ligne.
 * (cx, base) : le milieu de sa base ; w : sa largeur (sa hauteur en est la moitié).
 */
function Hemicycle({ cx, base, w, t0 = 0, kept, tone, filled }: { cx: number; base: number; w: number; t0?: number; kept?: boolean; tone?: Tone; filled?: boolean }) {
  const R = w / 2
  const arc = (r: number) => `M${(cx - r).toFixed(1)} ${base}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(cx + r).toFixed(1)} ${base}`
  const rays = [36, 72, 108, 144]
    .map(a => {
      const c = Math.cos((a * Math.PI) / 180)
      const s = Math.sin((a * Math.PI) / 180)
      return `M${(cx + R * 0.36 * c).toFixed(1)} ${(base - R * 0.36 * s).toFixed(1)}L${(cx + R * c).toFixed(1)} ${(base - R * s).toFixed(1)}`
    })
    .join('')
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)}>
      {filled || tone === 'count' ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class={tone === 'count' ? 'vc-tint-count' : 'vc-tint'} d={`${arc(R)}Z`} />
        </Fade>
      ) : null}
      <Ink d={arc(R)} t0={t0} dur={520} kept={still} />
      <Ink d={arc(R * 0.68)} t0={t0 + 160} dur={420} kept={still} />
      <Ink d={arc(R * 0.36)} t0={t0 + 320} dur={360} kept={still} />
      <Ink d={rays} t0={t0 + 480} dur={360} kept={still} class="vc-thin" />
      <Ink d={`M${(cx - R - 4).toFixed(1)} ${base}H${(cx + R + 4).toFixed(1)}`} t0={t0 + 600} dur={300} kept={still} />
    </g>
  )
}

/** L'urne, au trait : la boîte, son couvercle, une enveloppe glissée dans la fente (carré de 48 unités) */
const URNE = ['M8 22H40V45H8Z', 'M5 22H43', 'M17 21V7H31V21', 'M17 7L24 13L31 7', 'M17 31H31']

/** Une urne ; (x, y) : coin haut gauche, s : côté du carré, en unités de la feuille */
function Urne({ x, y, s = 48, t0 = 0, kept, tone }: { x: number; y: number; s?: number; t0?: number; kept?: boolean; tone?: Tone }) {
  const k = s / 48
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${k})`} style={{ '--k': String(1 / k) }}>
      {tone === 'count' ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class="vc-tint-count" d="M8 22H40V45H8Z" />
        </Fade>
      ) : null}
      {URNE.map((d, i) => (
        <Ink key={i} d={d} t0={t0 + i * 160} dur={i ? 340 : 520} kept={still} class={i >= 3 ? 'vc-thin' : undefined} />
      ))}
    </g>
  )
}

/** Le gouvernement : trois personnes côte à côte ; (cx, base) : le milieu de leur base */
function Trio({ cx, base, size = 40, t0 = 0, kept, tone }: { cx: number; base: number; size?: number; t0?: number; kept?: boolean; tone?: Tone }) {
  const step = size * 0.72
  return (
    <>
      {[-1, 0, 1].map(i => (
        <Picto key={i} n="personne" x={cx + i * step - size / 2} y={base - size} size={size} t0={t0 + (i + 1) * 150} kept={kept} tone={tone} />
      ))}
    </>
  )
}

/** Un pictogramme de la série ou de la bibliothèque, seul dans son SVG (listes en HTML) */
type Glyph = 'hemicycle' | 'urne' | PictoName

function Glyphe({ n, t0 = 0 }: { n: Glyph; t0?: number }) {
  return (
    <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
      {n === 'hemicycle' ? <Hemicycle cx={24} base={42} w={48} t0={t0} /> : n === 'urne' ? <Urne x={0} y={0} t0={t0} /> : <Picto n={n} x={0} y={0} t0={t0} step={150} />}
    </svg>
  )
}

/** Le pictogramme de chaque approfondissement (sommaire, questions de l'introduction) */
const glyphOf = (videoId: string): Glyph =>
  /pouvoirs/.test(videoId) ? 'hemicycle' : /49-3/.test(videoId) ? 'document' : /constitution/.test(videoId) ? 'livre' : /citoyens/.test(videoId) ? 'urne' : 'document'

/** Une planche de pictogrammes légendés, comme Panel (mises.tsx), avec les pictogrammes de la série */
function Liste({ items, cols = 2 }: { items: { glyph: Glyph; text: string; shown: boolean; cues?: Cue[] }[]; cols?: number }) {
  return (
    <ul class="vc-panel" style={{ '--cols': String(cols) }}>
      {items.map((it, i) => (
        <li key={i} class={cls('vc-panel-item', it.shown ? 'vc-rise' : 'vc-wait')}>
          {it.shown ? <Glyphe n={it.glyph} t0={150} /> : <span class="vc-glyphe" />}
          <span class="vc-panel-text">
            <Marks text={it.text} cues={it.cues ?? []} />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Les approfondissements de la série en sommaire numéroté, comme Sommaire (mises.tsx), avec leurs pictogrammes */
function Chapitres({ p, t0 = 200 }: { p: P; t0?: number }) {
  const series = VIDEO_SERIES.find(s => s.videos.some(v => v.id === p.script.id))
  const deep = series?.videos.filter(v => v.kind === 'deep') ?? []
  if (!deep.length) return null
  return (
    <ol class="vc-chap">
      {deep.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
          <span class="vc-chap-n">{i + 1}</span>
          <Glyphe n={glyphOf(v.id)} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/* ——— Schémas communs à la série ——— */

/**
 * Une ligne du temps qui part de « from » (écrit à gauche du trait) : un repère au bleu bille par année de
 * « marks », chacun quand « on(i) », son étiquette en quinconce (dessous, dessus) pour ne pas chevaucher la
 * voisine. « end » : l'année écrite au bout, s'il y en a une.
 */
function annees({
  y, from, to, marks, labels, on, hot = () => false, anchors, end, x0 = 40, x1 = 284, t0 = 0,
}: {
  y: number
  from: number
  to: number
  marks: number[]
  labels: string[]
  on: (i: number) => boolean
  hot?: (i: number) => boolean
  anchors?: ('start' | 'middle' | 'end')[]
  end?: string
  x0?: number
  x1?: number
  t0?: number
}) {
  const X = (v: number) => x0 + ((v - from) / (to - from || 1)) * (x1 - x0)
  const el = (
    <>
      <Ink d={`M${x0} ${y}H${x1}`} t0={t0} dur={700} class="vc-soft" />
      <Txt x={x0 - 6} y={y + 5} text={String(from)} size={14} anchor="end" tone="soft" t0={t0 + 300} />
      {end ? <Txt x={x1} y={y + 26} text={end} size={14} anchor="end" tone="soft" t0={t0 + 400} /> : null}
      {marks.map((m, i) => {
        if (!on(i)) return null
        const a = anchors?.[i] ?? 'middle'
        const x = X(m)
        const lx = a === 'start' ? x - 4 : a === 'end' ? x + 4 : x
        return (
          <g key={m}>
            <Ink d={`M${x.toFixed(1)} ${y - 9}v18`} t0={t0 + 100} dur={250} class="vc-count vc-bold" />
            <Txt x={lx} y={i % 2 ? y - 16 : y + 26} text={labels[i] ?? String(m)} size={hot(i) ? 17 : 14} big={hot(i)} anchor={a} tone="count" t0={t0 + 200} />
          </g>
        )
      })}
    </>
  )
  return { el, X }
}

/** Les dissolutions sur une ligne du temps : toutes quand le nombre est dit (« pas à pas » : chacune quand son
 *  année est dite), la dernière appuyée quand l'introduction la nomme */
function dissolutions(p: P, stepwise: boolean) {
  const f = p.segment.figure
  const from = yearsOf(p.segment.say)[0]
  const count = cuesOf(p).find(c => /fois/.test(c.text))
  const n = num(count?.text)
  const last = cuesOf(p).find(c => /^\d{4}$/.test(plain(c.text)))
  if (!f || !from || !count || !n) return null
  const years = yearsOf(f.label).filter(y => y > from)
  if (years.length !== n) return null
  const fr = annees({
    y: 40,
    from,
    to: years[years.length - 1]! + 2,
    marks: years,
    labels: years.map(String),
    on: i => (stepwise ? heard(p, String(years[i])) : count.shown),
    hot: i => !stepwise && i === years.length - 1 && !!last?.shown,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={76}>{fr.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les recours au 49.3 : une case par recours (au bleu bille quand le nombre est dit) ; « suite » : les recours
 *  dits ensuite (« Puis 2 fois en janvier 2026 »), un peu à l'écart, et les textes concernés */
function recours(p: P, suite: boolean) {
  const cue = cuesOf(p).find(c => /fois/.test(c.text))
  const n = num(cue?.text)
  if (!cue || !n || n > 200) return null
  const cols = 20
  const size = 10
  const pitch = 12.5
  const x0 = (W - (cols * pitch - (pitch - size))) / 2
  const rows = Math.ceil(n / cols)
  const gh = rows * pitch - (pitch - size)
  const puis = suite ? /Puis (\d+)/.exec(plain(p.segment.say)) : null
  const k = num(puis?.[1])
  const more = puis && k && n + k + 1 <= rows * cols ? range(k).map(i => n + 1 + i) : []
  const moreOn = puis ? heard(p, puis[0]) : false
  const month = suite ? word(p, /janvier \d{4}/) : null
  const textes = suite ? word(p, /sur \d+\stextes/) : null
  const cell = (i: number) => ({ x: x0 + (i % cols) * pitch, y: 2 + Math.floor(i / cols) * pitch })
  const lastMore = more.length ? cell(more[more.length - 1]!) : null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={gh + (suite ? 30 : 6)}>
        <Cases n={n} cols={cols} x={x0} y={2} size={size} gap={pitch - size} count={cue.shown ? range(n) : []} t0={300} stagger={6} solid />
        {moreOn && more.length ? (
          <Fade class="vc-count">
            <path class="vc-solid-count" d={more.map(i => `M${cell(i).x} ${cell(i).y}h${size}v${size}h${-size}z`).join('')} />
          </Fade>
        ) : null}
        {moreOn && month && lastMore ? <Txt x={lastMore.x + size} y={gh + 24} text={month.text} size={14} anchor="end" tone="count" t0={200} /> : null}
        {textes?.shown ? <Txt x={x0} y={gh + 24} text={textes.text} size={14} anchor="start" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les révisions de la Constitution : une feuille par révision ; « derniere » : une flèche montre la dernière */
function revisions(p: P, derniere: boolean) {
  const cue = cueOf(p, 0)
  const n = num(cue?.text)
  if (!cue || !n || n > 40) return null
  const cols = Math.ceil(n / 2)
  const { cells, h } = rangCells({ n, cols, max: 20, gap: 2, y: 4 })
  const last = cells[n - 1]!
  const date = derniere ? cueOf(p, 1) : null
  const lx = last.x + last.size / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={4 + h + (derniere ? 58 : 6)}>
        <Rang n={n} picto="document" cols={cols} max={20} gap={2} y={4} count={cue.shown ? range(n) : []} t0={300} stagger={40} />
        {date?.shown ? (
          <>
            <Arrow x1={lx + 6} y1={4 + h + 34} x2={lx} y2={4 + h + 6} tone="count" head={6} t0={0} />
            <Txt x={lx + 18} y={4 + h + 52} text={date.text} size={15} anchor="end" tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les référendums nationaux : une urne par référendum ; « tous » : toutes comptées quand le nombre est dit,
 *  sinon la dernière, avec sa date */
function urnes(p: P, tous: boolean) {
  const cue = cuesOf(p).find(c => /référendums/.test(c.text))
  const n = num(cue?.text)
  if (!cue || !n || n > 12) return null
  const size = 28
  const pitch = Math.min(40, (W - 8 - size) / Math.max(1, n - 1))
  const x0 = (W - ((n - 1) * pitch + size)) / 2
  const date = tous ? null : cuesOf(p).find(c => /\d{4}$/.test(c.text) && c !== cue)
  const year = tous ? yearsOf(p.segment.say).at(-1) : undefined
  const lastX = x0 + (n - 1) * pitch + size / 2
  const tag = tous ? (year && cue.shown ? String(year) : null) : date?.shown ? date.text : null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={size + 30}>
        {range(n).map(i => (
          <Urne key={i} x={x0 + i * pitch} y={0} s={size} t0={300 + i * 120} tone={(tous ? cue.shown : i === n - 1 && !!date?.shown) ? 'count' : undefined} />
        ))}
        {tag ? <Txt x={Math.min(lastX + size / 2, W)} y={size + 22} text={tag} size={14} anchor="end" tone={tous ? 'soft' : 'count'} t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les deux chemins d'une révision (référendum en haut, Congrès en bas) ; celui dont parle le passage au bleu */
function chemins(p: P, which: 0 | 1) {
  const cues = cuesOf(p)
  const head = cues[0]
  const ref = which === 0 ? cues[1] : null
  const congres = which === 1 ? cues[0] : null
  const pres = which === 1 ? cues[1] : null
  const refLabel = which === 0 ? (ref?.shown ? ref.text : null) : said(p, /un référendum/)
  const congLabel = which === 1 && congres?.shown ? congres.text : null
  const up = which === 0 && !!ref?.shown
  const down = which === 1 && !!congres?.shown
  const path = (d: string, on: boolean, t0: number) => (
    <g class={on ? 'vc-count' : 'vc-soft'}>
      <Ink d={d} t0={t0} dur={600} kept={which === 1 && !on} />
    </g>
  )
  return (
    <Seg>
      <Head lines={[lineOf(head)]} />
      <Art h={which === 1 ? 204 : 186}>
        <Picto n="document" x={4} y={70} size={54} t0={100} kept={which === 1} />
        {path('M58 92C84 92 98 44 126 40M126 40l-9.2-2.6M126 40l-6.6 6.8', up, 500)}
        <Urne x={132} y={6} s={64} t0={700} tone={up ? 'count' : which === 1 ? 'soft' : undefined} kept={which === 1} />
        {refLabel ? <Txt x={202} y={46} text={refLabel} size={14} anchor="start" tone={up ? 'count' : which === 1 ? 'soft' : undefined} t0={200} /> : null}
        {path('M58 106C84 106 98 152 126 156M126 156l-8.6 4.2M126 156l-6-7.4', down, 900)}
        <Hemicycle cx={178} base={178} w={84} t0={1100} tone={down ? 'count' : 'soft'} kept={which === 1 && !down} />
        {congLabel ? <Txt x={226} y={172} text={congLabel} size={14} anchor="start" tone="count" t0={200} /> : null}
        {pres?.shown ? (
          <>
            <Picto n="personne" x={236} y={104} size={40} t0={0} />
            <Txt x={178} y={200} text={pres.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Vous élisez un président et des députés. Mais ensuite, qui décide quoi ? » */
const intro01: Board = p => {
  const pres = word(p, /un président/)
  const dep = word(p, /des députés/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={176}>
        <Picto n="personne" x={2} y={96} size={62} t0={100} />
        <Urne x={64} y={84} s={80} t0={400} />
        {pres?.shown ? (
          <>
            <Arrow x1={146} y1={108} x2={180} y2={48} dash t0={300} />
            <Picto n="personne" x={186} y={4} size={52} t0={500} />
            <Txt x={212} y={74} text={pres.text} size={14} t0={800} />
          </>
        ) : null}
        {dep?.shown ? (
          <>
            <Arrow x1={146} y1={130} x2={170} y2={140} dash t0={300} />
            <Hemicycle cx={212} base={152} w={64} t0={500} />
            <Txt x={212} y={172} text={dep.text} size={14} t0={900} />
          </>
        ) : null}
        <Ask x={266} y={70} h={50} t0={1800} />
      </Art>
    </Seg>
  )
}

/** 02 Le président, seul : il nomme le Premier ministre, et peut dissoudre l'Assemblée nationale */
const intro02: Board = p => {
  const [seul, pm, diss] = cuesOf(p)
  const pres = word(p, /président/)
  const ass = word(p, /l’Assemblée nationale/)
  if (!seul || !pm || !diss) return null
  return (
    <Seg>
      <Head lines={[lineOf(seul)]} />
      <Art h={200}>
        <Picto n="personne" x={4} y={54} size={80} t0={100} />
        {pres ? <Txt x={44} y={154} text={pres.text} size={15} t0={400} /> : null}
        {pm.shown ? (
          <>
            <Arrow x1={90} y1={74} x2={180} y2={38} tone="count" t0={0} />
            <Picto n="personne" x={188} y={0} size={52} t0={200} />
            <Txt x={214} y={70} text={pm.text} size={14} max={10} t0={400} />
          </>
        ) : null}
        {diss.shown ? (
          <>
            <Arrow x1={90} y1={114} x2={172} y2={140} dash tone="count" t0={0} />
            <Txt x={128} y={112} text={diss.text} size={14} tone="count" t0={200} />
            <Hemicycle cx={228} base={160} w={84} t0={300} />
            {ass ? <Txt x={228} y={178} text={ass.text} size={14} max={12} t0={600} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Six dissolutions depuis 1958, la dernière en 2024 */
const intro03: Board = p => dissolutions(p, false)

/** 04 Le 49.3 : 116 recours entre 1959 et septembre 2025, une case par recours */
const intro04: Board = p => recours(p, false)

/** 05 La motion de censure : l'Assemblée peut renverser le gouvernement ; deux fois depuis 1958 */
const intro05: Board = p => {
  const [motion, fois] = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const from = years[0]
  const marks = years.slice(1)
  const n = num(fois?.text)
  const gov = said(p, /le gouvernement/)
  if (!motion || !fois || !from || !n || marks.length !== n) return null
  const fr = annees({ y: 136, from, to: marks[marks.length - 1]! + 2, marks, labels: marks.map(String), on: () => fois.shown, t0: 300 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={168}>
        <Hemicycle cx={52} base={80} w={92} t0={100} />
        {motion.shown ? (
          <>
            <Arrow x1={104} y1={62} x2={178} y2={62} tone="count" t0={0} />
            <Txt x={141} y={32} text={motion.text} size={14} max={9} tone="count" t0={200} />
          </>
        ) : null}
        <Trio cx={232} base={80} size={40} t0={500} />
        {gov ? <Txt x={232} y={100} text={gov} size={14} t0={900} /> : null}
        {fr.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 25 révisions de la Constitution */
const intro06: Board = p => revisions(p, false)

/** 07 Neuf référendums nationaux depuis 1958, le dernier en 2005 */
const intro07: Board = p => urnes(p, true)

/** 08 Les quatre questions du thème, chacune avec le pictogramme de sa vidéo, quand la voix la pose */
const intro08: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  const series = VIDEO_SERIES.find(s => s.videos.some(v => v.id === p.script.id))
  const deep = series?.videos.filter(v => v.kind === 'deep') ?? []
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Liste
        cols={2}
        items={qs.map((q, i) => ({
          glyph: deep[i] ? glyphOf(deep[i].id) : 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 09 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro09: Board = p => (
  <Seg kind="end">
    <Chapitres p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Président et Assemblée ——— */

/** 01 Un nouveau Premier ministre : les députés doivent-ils d'abord voter pour lui ? */
const pouvoirs01: Board = p => {
  const pm = word(p, /Premier ministre/)
  const dep = word(p, /Les députés/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={160}>
        <Picto n="personne" x={8} y={16} size={90} t0={100} />
        {pm ? <Txt x={53} y={130} text={pm.text} size={15} max={9} t0={400} /> : null}
        {dep?.shown ? (
          <>
            <Hemicycle cx={224} base={112} w={116} t0={0} />
            <Txt x={224} y={136} text={dep.text} size={15} t0={500} />
            <Arrow x1={160} y1={98} x2={110} y2={80} dash t0={800} />
            <Ask x={124} y={10} h={46} t0={1200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 Le président le nomme seul, sans vote de l'Assemblée : pas d'investiture obligatoire */
const pouvoirs02: Board = p => {
  const [vote, inv] = cuesOf(p)
  const pres = word(p, /président/)
  const pm = said(p, /Premier ministre/)
  return (
    <Seg>
      <Head lines={[lineOf(vote)]} />
      <Art h={164}>
        <Picto n="personne" x={6} y={4} size={70} t0={100} />
        {pres ? <Txt x={41} y={94} text={pres.text} size={14} t0={300} /> : null}
        <Arrow x1={84} y1={38} x2={208} y2={38} tone="count" t0={600} />
        <Picto n="personne" x={216} y={4} size={70} t0={1000} />
        {pm ? <Txt x={251} y={94} text={pm} size={14} max={9} t0={1200} /> : null}
        <Hemicycle cx={146} base={120} w={84} tone="ghost" />
        {inv?.shown ? <Txt x={150} y={152} text={inv.text} size={15} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Le gouvernement reste en place, tant que l'Assemblée n'adopte pas de motion de censure ou ne lui refuse
 *  pas la confiance qu'il demande : deux flèches en pointillé, de l'hémicycle vers son banc */
const pouvoirs03: Board = p => {
  const [cens, conf] = cuesOf(p)
  const place = word(p, /reste en place/)
  return (
    <Seg>
      <Head lines={[place ? { text: place.text, shown: place.shown } : null]} />
      <Art h={200}>
        <Trio cx={150} base={58} size={46} t0={100} />
        <Ink d="M86 62H214" t0={600} dur={500} />
        <Hemicycle cx={150} base={196} w={96} t0={800} />
        {cens?.shown ? (
          <>
            <Arrow x1={116} y1={146} x2={96} y2={74} dash tone="count" t0={0} />
            <Txt x={52} y={110} text={cens.text} size={14} max={9} tone="count" t0={200} />
          </>
        ) : null}
        {conf?.shown ? (
          <>
            <Arrow x1={184} y1={146} x2={204} y2={74} dash tone="count" t0={0} />
            <Txt x={250} y={118} text={conf.text} size={14} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Deux motions de censure adoptées depuis 1958 : octobre 1962, 4 décembre 2024 (état au 26 février 2026) */
const pouvoirs04: Board = p => {
  const cue = cueOf(p, 0)
  const n = num(cue?.text)
  const ys = yearsOf(p.segment.say)
  const to = yearsOf(p.segment.figure?.date ?? '')[0]
  const a = word(p, /octobre \d{4}/)
  const b = word(p, /\d+\sdécembre \d{4}/)
  if (!cue || !n || ys.length !== n + 1 || !to || !a || !b) return null
  const fr = annees({ y: 40, from: ys[0]!, to, marks: ys.slice(1), labels: [a.text, b.text], anchors: ['start', 'end'], on: i => (i ? b.shown : a.shown), end: String(to), t0: 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={74}>{fr.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Le président peut dissoudre l'Assemblée : six fois depuis 1958, un repère à chaque année dite */
const pouvoirs05: Board = p => dissolutions(p, true)

/** 06 D'un côté, la capacité d'agir du président et du gouvernement ; de l'autre, le poids du Parlement et des
 *  citoyens : la balance, fléau horizontal */
const pouvoirs06: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="personne" x={cx - 44} y={base - 42} size={42} t0={900} />
        <Picto n="document" x={cx + 2} y={base - 42} size={42} t0={1100} />
      </>
    ),
    right: (cx, base) => (
      <>
        <Hemicycle cx={cx - 20} base={base - 1} w={50} t0={1400} />
        <Picto n="personne" x={cx + 8} y={base - 38} size={38} t0={1700} />
      </>
    ),
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 07 « Quel équilibre entre le président, le gouvernement et l'Assemblée ? » : les trois, reliés, en attente */
const pouvoirs07: Board = p => (
  <Seg kind="ask">
    <Art h={132}>
      <Hemicycle cx={150} base={44} w={84} t0={100} />
      <Picto n="personne" x={14} y={70} size={56} t0={400} />
      <Trio cx={248} base={126} size={36} t0={600} />
      <Fade t0={1100} class="vc-dash vc-soft">
        <path d="M66 80L104 42M196 42L230 78M80 112H200" />
      </Fade>
      <Ask x={136} y={56} h={44} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le 49.3 ——— */

/** 01 Une loi peut-elle être adoptée sans vote des députés ? Le texte passe au-dessus de l'hémicycle */
const art01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={132}>
      <Picto n="document" x={0} y={62} size={62} t0={100} />
      <Hemicycle cx={150} base={128} w={112} tone="soft" t0={400} />
      <Fade t0={1000} class="vc-dash">
        <path d="M50 64C84 6 196 4 232 56M232 56l-1.6-9.4M232 56l-8.8-3.6" />
      </Fade>
      <Ask x={250} y={58} h={56} t0={1500} />
    </Art>
  </Seg>
)

/** 02 L'article 49.3 : le gouvernement engage sa responsabilité sur un texte */
const art02: Board = p => {
  const [art, resp] = cuesOf(p)
  const gov = word(p, /Le gouvernement/)
  return (
    <Seg>
      <Head lines={[lineOf(art)]} />
      <Art h={140}>
        <Trio cx={62} base={86} size={44} t0={100} />
        {gov ? <Txt x={62} y={110} text={gov.text} size={14} t0={500} /> : null}
        <Picto n="document" x={206} y={8} size={86} t0={500} />
        {resp?.shown ? (
          <>
            <Arrow x1={124} y1={60} x2={214} y2={60} tone="count" t0={0} />
            <Txt x={156} y={40} text={resp.text} size={15} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Le texte est considéré comme adopté (une coche), sauf si les députés votent une motion de censure */
const art03: Board = p => {
  const [adopte, censure] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(adopte)]} />
      <Art h={150}>
        <Picto n="document" x={24} y={4} size={100} t0={100} />
        {adopte?.shown ? <Ink d="M56 70l13 14l27-33" t0={300} dur={500} class="vc-count vc-bold" /> : null}
        <Hemicycle cx={234} base={110} w={108} t0={500} />
        {censure?.shown ? (
          <>
            <Arrow x1={178} y1={84} x2={128} y2={68} dash tone="count" t0={0} />
            <Txt x={232} y={138} text={censure.text} size={15} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Avant la révision de 2008, pas de limite ; depuis, les budgets, plus un autre texte par session */
const art04: Board = p => {
  const [lim, bud, autre] = cuesOf(p)
  const year = yearsOf(p.segment.say)[0]
  const avant = word(p, /Avant/)
  const depuis = word(p, /Depuis/)
  if (!lim || !bud || !autre || !year) return null
  const y = 136
  return (
    <Seg>
      <Art h={168}>
        {range(6).map(i => (
          <Picto key={i} n="document" x={16 + (i % 3) * 32} y={8 + Math.floor(i / 3) * 36} size={32} t0={200 + i * 90} w={0.9} />
        ))}
        {lim.shown ? <Txt x={64} y={104} text={lim.text} size={14} t0={0} /> : null}
        {bud.shown ? (
          <>
            <Picto n="pieces" x={150} y={6} size={34} t0={0} />
            <Picto n="pieces" x={182} y={6} size={34} t0={150} />
            <Txt x={220} y={30} text={bud.text} size={14} anchor="start" t0={300} />
          </>
        ) : null}
        {autre.shown ? (
          <>
            <Txt x={160} y={78} text="+" size={20} big tone="count" t0={0} />
            <Picto n="document" x={168} y={52} size={36} tone="count" t0={100} />
            <Txt x={208} y={68} text={autre.text} size={14} max={13} anchor="start" t0={300} />
          </>
        ) : null}
        <Ink d={`M10 ${y}H290`} t0={0} dur={700} class="vc-soft" />
        <Ink d={`M150 ${y - 10}v20`} t0={500} dur={250} class="vc-bold" />
        <Txt x={150} y={y + 28} text={String(year)} size={17} big t0={600} />
        {avant ? <Txt x={70} y={y + 26} text={avant.text} size={14} tone="soft" t0={300} /> : null}
        {depuis?.shown ? <Txt x={230} y={y + 26} text={depuis.text} size={14} tone="soft" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 116 recours sur 61 textes entre 1959 et septembre 2025, puis 2 en janvier 2026 */
const art05: Board = p => recours(p, true)

/** 06 D'un côté, la capacité du gouvernement à faire adopter ses textes ; de l'autre, le poids du vote des
 *  députés : la balance, fléau horizontal, le gouvernement et l'hémicycle chacun avec la même feuille */
const art06: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Trio cx={cx - 15} base={base - 1} size={26} t0={900} />
        <Picto n="document" x={cx + 8} y={base - 40} size={40} t0={1300} />
      </>
    ),
    right: (cx, base) => (
      <>
        <Hemicycle cx={cx - 17} base={base - 1} w={54} t0={1400} />
        <Picto n="document" x={cx + 8} y={base - 40} size={40} t0={1600} />
      </>
    ),
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  // Une étiquette de trois lignes (« le poids du / vote des / députés ») : la feuille s'allonge d'autant
  const lines = Math.max(...[a, b].map(c => (c ? wrap(c.text, 15).length : 0)))
  return (
    <Seg>
      <Art h={Math.max(bal.h, 128 + lines * 18 + 4)}>{bal.el}</Art>
    </Seg>
  )
}

/** 07 « Quelle place donner à cet outil, et dans quelles limites ? » */
const art07: Board = p => (
  <Seg kind="ask">
    <Art h={112}>
      <Picto n="document" x={34} y={14} size={84} t0={100} />
      <Hemicycle cx={172} base={104} w={100} tone="soft" t0={400} />
      <Ask x={240} y={14} h={70} t0={1000} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Réviser la Constitution ——— */

/** 01 La Constitution fixe les règles entre le président, le gouvernement et le Parlement : peut-on la changer ? */
const cons01: Board = p => {
  const pres = word(p, /le président/)
  const gov = word(p, /le gouvernement/)
  const parl = word(p, /le Parlement/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={172}>
        <Picto n="livre" x={116} y={0} size={68} t0={100} />
        {pres?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d="M132 62L64 96" />
            </Fade>
            <Picto n="personne" x={28} y={98} size={50} t0={100} />
            <Txt x={53} y={166} text={pres.text} size={14} t0={300} />
          </>
        ) : null}
        {gov?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d="M150 66V100" />
            </Fade>
            <Trio cx={150} base={146} size={36} t0={100} />
            <Txt x={150} y={166} text={gov.text} size={14} t0={300} />
          </>
        ) : null}
        {parl?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d="M168 62L236 104" />
            </Fade>
            <Hemicycle cx={248} base={146} w={72} t0={100} />
            <Txt x={248} y={166} text={parl.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 L'Assemblée nationale et le Sénat votent le même texte : deux hémicycles, la même feuille, un signe égal */
const cons02: Board = p => {
  const cue = cueOf(p, 0)
  const an = word(p, /l’Assemblée nationale/)
  const se = word(p, /le Sénat/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={178}>
        <Hemicycle cx={78} base={128} w={120} t0={100} />
        {an ? <Txt x={78} y={152} text={an.text} size={14} max={12} t0={400} /> : null}
        <Hemicycle cx={222} base={128} w={120} t0={500} />
        {se ? <Txt x={222} y={152} text={se.text} size={14} t0={800} /> : null}
        {cue?.shown ? (
          <>
            <Picto n="document" x={50} y={0} size={56} t0={0} />
            <Picto n="document" x={194} y={0} size={56} t0={200} />
            <Ink d="M138 22H162M138 32H162" t0={600} dur={300} class="vc-count vc-bold" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Deux chemins pour approuver la révision ; le premier, le référendum */
const cons03: Board = p => chemins(p, 0)

/** 04 Le second, le Parlement réuni en Congrès, si le président le décide */
const cons04: Board = p => chemins(p, 1)

/** 05 Au Congrès, les trois cinquièmes des suffrages exprimés : 60 voix sur 100 */
const cons05: Board = p => {
  const [frac, cent] = cuesOf(p)
  const r = ratioOf(cent?.text)
  if (!frac || !cent || !r || r.n !== 100) return null
  return (
    <Seg>
      <Head lines={[lineOf(frac)]} />
      <Sur100 p={p} kind="carre" low={r.k} caption={sentenceWith(p.segment.say, cent.text)} shown={cent.shown} />
    </Seg>
  )
}

/** 06 25 révisions depuis 1958 ; la dernière, le 8 mars 2024 */
const cons06: Board = p => revisions(p, true)

/** 07 « Faut-il changer ces règles ? Et si oui, par quel chemin ? » : la Constitution devant les deux chemins */
const cons07: Board = p => (
  <Seg kind="ask">
    <Art h={126}>
      <Picto n="livre" x={4} y={34} size={66} t0={100} />
      <Fade t0={600} class="vc-dash vc-soft">
        <path d="M74 64C100 64 104 30 130 28M74 72C100 72 104 106 130 108" />
      </Fade>
      <Urne x={136} y={0} s={52} t0={800} />
      <Hemicycle cx={164} base={122} w={58} t0={1000} />
      <Ask x={234} y={30} h={64} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Place des citoyens ——— */

/** 01 Entre deux élections, pouvez-vous voter directement sur une loi ? */
const cit01: Board = p => {
  const el = word(p, /deux élections/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={146}>
        <Ink d="M24 118H276" t0={100} dur={700} class="vc-soft" />
        <Urne x={0} y={58} s={60} t0={300} />
        <Urne x={240} y={58} s={60} t0={500} />
        {el ? <Txt x={150} y={140} text={el.text} size={14} tone="soft" t0={600} /> : null}
        <Picto n="document" x={96} y={40} size={68} t0={900} />
        <Ask x={172} y={44} h={56} t0={1400} />
      </Art>
    </Seg>
  )
}

/** 02 Vous décidez surtout en élisant vos représentants ; aucune procédure ne permet aux seuls électeurs de lancer
 *  un référendum (l'urne qui manque, en pointillé) */
const cit02: Board = p => {
  const [rep, seuls] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(rep)]} />
      <Art h={176}>
        <Picto n="personne" x={4} y={14} size={56} t0={100} />
        <Arrow x1={62} y1={44} x2={90} y2={44} t0={500} />
        <Urne x={94} y={6} s={62} t0={600} />
        <Arrow x1={160} y1={44} x2={188} y2={44} t0={1100} />
        <Hemicycle cx={242} base={68} w={96} t0={1200} />
        {seuls?.shown ? (
          <>
            {[4, 34, 64].map((x, i) => (
              <Picto key={x} n="personne" x={x} y={100} size={40} t0={i * 120} />
            ))}
            <Arrow x1={114} y1={122} x2={186} y2={122} dash tone="ghost" t0={400} />
            <Urne x={196} y={92} s={60} tone="ghost" />
            <Txt x={62} y={164} text={seuls.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Neuf référendums nationaux depuis 1958 ; le dernier, le 29 mai 2005 */
const cit03: Board = p => urnes(p, false)

/** 04 L'abstention aux référendums de 2000 et de 2005, sur 100 inscrits : deux barres à la même échelle */
const cit04: Board = p => {
  const [a, b] = cuesOf(p)
  const chart = chartOf(p.segment)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb || !chart || chart.kind !== 'compare' || chart.items.length !== 2) return null
  const [ia, ib] = chart.items
  const g = barres({
    items: [
      { label: ia!.label, value: 100, ghostFrom: va, text: a.text, shown: a.shown, tone: 'count' },
      { label: ib!.label, value: 100, ghostFrom: vb, text: b.text, shown: b.shown, tone: 'count' },
    ],
    y: 4,
    size: 24,
    gap: 26,
    room: 84,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 10}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Un rapport écrit en lettres : « un cinquième », « un dixième » */
const parts = (s: string | undefined): number | null =>
  !s ? null : /cinquième/.test(s) ? 5 : /dixième/.test(s) ? 10 : /quart/.test(s) ? 4 : /tiers/.test(s) ? 3 : null

/** 05 Le référendum d'initiative partagée : un cinquième des parlementaires, puis un dixième des électeurs */
const cit05: Board = p => {
  const [part, cinq, dix] = cuesOf(p)
  const n5 = parts(cinq?.text)
  const n10 = parts(dix?.text)
  const parl = word(p, /un cinquième des parlementaires/)
  const elec = word(p, /un dixième des électeurs inscrits/)
  if (!part || !cinq || !dix || !n5 || !n10 || n5 > 10 || n10 > 10) return null
  return (
    <Seg>
      <Head lines={[lineOf(part)]} />
      <Art h={108}>
        <Rang n={n5} picto="personne" x={0} w={130} max={24} gap={2} y={20} count={cinq.shown ? [0] : []} t0={200} />
        {parl?.shown ? <Txt x={65} y={72} text={parl.text} size={14} max={16} t0={200} /> : null}
        {dix.shown ? (
          <>
            <Arrow x1={136} y1={32} x2={160} y2={32} t0={0} />
            <Rang n={n10} picto="personne" x={168} w={130} cols={5} max={24} gap={3} y={6} count={[0]} t0={200} stagger={60} />
            {elec ? <Txt x={233} y={84} text={elec.text} size={14} max={18} t0={600} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Le Conseil constitutionnel contrôle ; si le Parlement n'examine pas le texte dans le délai prévu, le
 *  président le soumet au référendum : trois étapes */
const cit06: Board = p => {
  const [cc, delai, ref] = cuesOf(p)
  return (
    <Seg>
      <Art h={122}>
        <Picto n="document" x={26} y={6} size={58} t0={100} />
        {cc?.shown ? (
          <>
            <Picto n="loupe" x={50} y={26} size={42} tone="count" t0={0} />
            <Txt x={60} y={96} text={cc.text} size={14} max={15} t0={300} />
          </>
        ) : null}
        {delai?.shown ? (
          <>
            <Arrow x1={100} y1={40} x2={120} y2={40} t0={0} />
            <Hemicycle cx={160} base={66} w={64} t0={100} />
            <Picto n="sablier" x={144} y={0} size={30} tone="count" t0={500} />
            <Txt x={160} y={96} text={delai.text} size={14} max={12} t0={600} />
          </>
        ) : null}
        {ref?.shown ? (
          <>
            <Arrow x1={200} y1={40} x2={220} y2={40} t0={0} />
            <Urne x={224} y={6} s={62} tone="count" t0={100} />
            <Txt x={255} y={96} text={ref.text} size={14} max={14} t0={500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Sept propositions depuis 2019 ; six jugées non conformes, la procédure arrêtée (en pointillé) */
const cit07: Board = p => {
  const [props, nc] = cuesOf(p)
  const n = num(props?.text)
  const k = num(/Pour (\d+)/.exec(plain(p.segment.say))?.[1])
  if (!props || !nc || !n || !k || k >= n || n > 10) return null
  const { cells } = rangCells({ n, max: 36, gap: 8, y: 4 })
  const gone = range(k).map(i => n - k + i)
  const first = cells[n - k]!
  const last = cells[n - 1]!
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={70}>
        <Rang n={n} picto="document" max={36} gap={8} y={4} ghost={nc.shown ? gone : []} t0={300} stagger={120} />
        {nc.shown ? <Txt x={(first.x + last.x + last.size) / 2} y={64} text={nc.text} size={14} tone="soft" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 1 093 030 soutiens sur 4 717 396 nécessaires : la part recueillie, et le quart en pointillé */
const cit08: Board = p => {
  const [got, quart] = cuesOf(p)
  const vGot = num(got?.text)
  const need = word(p, /\d[\d ]* nécessaires/)
  const vNeed = num(need?.text)
  if (!got || !vGot || !need || !vNeed || vGot >= vNeed) return null
  const x0 = 10
  const w = 280
  const top = 26
  const h = 30
  const fill = (vGot / vNeed) * w
  const q = quart ? fractionOf(quart.text) : null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={96}>
        <Txt x={x0 + w} y={16} text={need.text} size={14} anchor="end" tone="soft" t0={200} />
        <Ink d={`M${x0} ${top}H${x0 + w}V${top + h}H${x0}Z`} t0={300} dur={800} />
        {got.shown ? (
          <Fade t0={900} class="vc-count">
            <rect class="vc-tint-count" x={x0} y={top} width={fill} height={h} />
            <path d={`M${x0} ${top}H${(x0 + fill).toFixed(1)}V${top + h}H${x0}`} />
          </Fade>
        ) : null}
        {quart?.shown && q ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={`M${x0 + w * q} ${top - 6}V${top + h + 8}`} />
            </Fade>
            <Txt x={x0 + w * q} y={top + h + 30} text={quart.text} size={15} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Le référendum local, deux conditions : la moitié des inscrits a voté ; le projet a la majorité */
const cit09: Board = p => {
  const [moitie, maj] = cuesOf(p)
  const cond = word(p, /deux conditions/)
  if (!moitie || !maj || fractionOf(moitie.text) !== 1 / 2) return null
  const base = 112
  return (
    <Seg>
      <Head lines={[cond ? { text: cond.text, shown: cond.shown } : null]} />
      <Art h={138}>
        <Rang n={10} picto="personne" cols={5} x={0} w={140} max={24} gap={3} y={6} count={moitie.shown ? range(5) : []} t0={200} stagger={60} />
        {moitie.shown ? <Txt x={70} y={86} text={moitie.text} size={14} max={14} t0={300} /> : null}
        <Ink d={`M168 ${base}H292`} t0={300} dur={500} class="vc-soft" />
        <g class={maj.shown ? 'vc-count' : undefined}>
          {maj.shown ? (
            <Fade t0={200}>
              <rect class="vc-tint-count" x={186} y={base - 72} width={34} height={72} />
            </Fade>
          ) : null}
          <Ink d={`M186 ${base}V${base - 72}H220V${base}`} t0={500} dur={600} />
        </g>
        <Ink d={`M240 ${base}V${base - 48}H274V${base}`} t0={700} dur={600} />
        <Txt x={203} y={base + 20} text="pour" size={14} tone="soft" t0={900} />
        <Txt x={257} y={base + 20} text="contre" size={14} tone="soft" t0={1000} />
        {maj.shown ? <Txt x={214} y={base - 82} text={maj.text} size={14} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 10 150 citoyens tirés au sort pour la Convention citoyenne pour le climat ; 149 propositions remises */
const cit10: Board = p => {
  const [cit, props] = cuesOf(p)
  const n = num(cit?.text)
  if (!cit || !props || !n || n > 200) return null
  const cols = 25
  const pitch = 11
  const r = 3.6
  const x0 = (W - (cols - 1) * pitch) / 2
  const rows = Math.ceil(n / cols)
  const dots = range(n)
    .map(i => {
      const cx = x0 + (i % cols) * pitch
      const cy = 6 + Math.floor(i / cols) * pitch
      return `M${(cx + r).toFixed(1)} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`
    })
    .join('')
  const gh = 6 + (rows - 1) * pitch + r + 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={gh + 62}>
        <g class={cit.shown ? 'vc-count' : undefined}>
          <Ink d={dots} t0={300} dur={1200} class="vc-thin" />
        </g>
        {props.shown ? (
          <>
            <Arrow x1={150} y1={gh + 2} x2={138} y2={gh + 16} t0={0} head={6} />
            <Picto n="document" x={96} y={gh + 12} size={48} t0={100} />
            <Txt x={150} y={gh + 42} text={props.text} size={15} anchor="start" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 11 D'un côté, des décisions prises directement par les citoyens ; de l'autre, des décisions prises par les
 *  élus : la balance, fléau horizontal */
const cit11: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="personne" x={cx - 46} y={base - 36} size={36} t0={900} />
        <Urne x={cx - 10} y={base - 46} s={48} t0={1100} />
      </>
    ),
    right: (cx, base) => (
      <>
        <Hemicycle cx={cx - 16} base={base - 1} w={56} t0={1400} />
        <Picto n="document" x={cx + 6} y={base - 42} size={42} t0={1700} />
      </>
    ),
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  // Une étiquette de plusieurs lignes (« directement par / les citoyens ») : la feuille s'allonge d'autant
  const lines = Math.max(...[a, b].map(c => (c ? wrap(c.text, 15).length : 0)))
  return (
    <Seg>
      <Art h={Math.max(bal.h, 128 + lines * 18 + 4)}>{bal.el}</Art>
    </Seg>
  )
}

/** 12 « Quelle place donner aux citoyens dans les décisions publiques ? » */
const cit12: Board = p => (
  <Seg kind="ask">
    <Art h={112}>
      <Picto n="personne" x={8} y={34} size={66} t0={100} />
      <Urne x={76} y={36} s={64} t0={400} />
      <Hemicycle cx={192} base={100} w={84} t0={700} />
      <Ask x={248} y={24} h={66} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const INSTITUTIONS: Record<string, Board> = {
  'institutions-intro-01': intro01,
  'institutions-intro-02': intro02,
  'institutions-intro-03': intro03,
  'institutions-intro-04': intro04,
  'institutions-intro-05': intro05,
  'institutions-intro-06': intro06,
  'institutions-intro-07': intro07,
  'institutions-intro-08': intro08,
  'institutions-intro-09': intro09,
  'institutions-pouvoirs-01': pouvoirs01,
  'institutions-pouvoirs-02': pouvoirs02,
  'institutions-pouvoirs-03': pouvoirs03,
  'institutions-pouvoirs-04': pouvoirs04,
  'institutions-pouvoirs-05': pouvoirs05,
  'institutions-pouvoirs-06': pouvoirs06,
  'institutions-pouvoirs-07': pouvoirs07,
  'institutions-49-3-01': art01,
  'institutions-49-3-02': art02,
  'institutions-49-3-03': art03,
  'institutions-49-3-04': art04,
  'institutions-49-3-05': art05,
  'institutions-49-3-06': art06,
  'institutions-49-3-07': art07,
  'institutions-constitution-01': cons01,
  'institutions-constitution-02': cons02,
  'institutions-constitution-03': cons03,
  'institutions-constitution-04': cons04,
  'institutions-constitution-05': cons05,
  'institutions-constitution-06': cons06,
  'institutions-constitution-07': cons07,
  'institutions-citoyens-01': cit01,
  'institutions-citoyens-02': cit02,
  'institutions-citoyens-03': cit03,
  'institutions-citoyens-04': cit04,
  'institutions-citoyens-05': cit05,
  'institutions-citoyens-06': cit06,
  'institutions-citoyens-07': cit07,
  'institutions-citoyens-08': cit08,
  'institutions-citoyens-09': cit09,
  'institutions-citoyens-10': cit10,
  'institutions-citoyens-11': cit11,
  'institutions-citoyens-12': cit12,
}

