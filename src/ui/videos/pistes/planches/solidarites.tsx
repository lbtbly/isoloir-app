// Piste C, les planches de la série « Solidarités » (src/ui/videos/series/solidarites.ts) : un dessin par
// passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx).
// Mêmes règles que « Retraites » et « Logement » : les mots et les nombres viennent du script (mots mis en
// valeur, phrases dites, chiffre de la fiche) ; une planche qui ne s'y retrouve plus rend null, et le passage
// prend le dessin générique de sa sorte d'image. Quelques étiquettes courtes et neutres sont écrites ici quand
// le passage ne les dit pas (« estimée », graduations) : elles nomment ce qui est dessiné, et vont dans « alt ».

import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, capital, cueOf, cuesOf, heard, num, plain, ratioOf, said, sentencesOf, word, yearsOf, type P } from '../dessin/encre'
import { Chiffre, HeadCues, Panel, Question, Seg, Signature, Sommaire, Src, Sur100 } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Cases, Qui, Rang, balance, barres, frise, rangCells, type Barre } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/**
 * Un filet tendu entre deux piquets, au trait : deux cordes qui ploient, et leurs mailles en losange.
 * (x0, x1) : les piquets ; y : la corde du haut à ses bouts ; sag : ce qu'elle ploie au milieu.
 */
function Filet({ x0, x1, y, sag = 22, n = 12, t0 = 0, kept, ghost }: { x0: number; x1: number; y: number; sag?: number; n?: number; t0?: number; kept?: boolean; ghost?: boolean }) {
  const at = (i: number, dy: number) => {
    const t = i / n
    return `${(x0 + (x1 - x0) * t).toFixed(1)} ${(y + dy + 4 * sag * t * (1 - t)).toFixed(1)}`
  }
  const rope = (dy: number) => `M${x0} ${y + dy}Q${(x0 + x1) / 2} ${y + dy + 2 * sag} ${x1} ${y + dy}`
  let mesh = ''
  for (let i = 0; i < n; i++) mesh += `M${at(i, 0)}L${at(i + 1, 16)}M${at(i, 16)}L${at(i + 1, 0)}`
  const posts = `M${x0} ${y - 12}V${y + 34}M${x1} ${y - 12}V${y + 34}`
  if (ghost) {
    return (
      <Fade t0={t0} kept={kept} class="vc-ghost">
        <path d={`${posts}${rope(0)}${rope(16)}${mesh}`} />
      </Fade>
    )
  }
  return (
    <>
      <Ink d={posts} t0={t0} dur={400} kept={kept} />
      <Ink d={rope(0)} t0={t0 + 300} dur={700} kept={kept} />
      <Ink d={rope(16)} t0={t0 + 500} dur={700} kept={kept} class="vc-thin" />
      <Ink d={mesh} t0={t0 + 800} dur={900} kept={kept} class="vc-thin" />
    </>
  )
}

/** Une page au trait (formulaire, contrat, liste), 62 × 100 ; (x, y) : son coin haut gauche */
const page = (x: number, y: number) => `M${x} ${y}H${x + 46}L${x + 62} ${y + 16}V${y + 100}H${x}Z`

/** Les lignes d'une page, de y0 à y1 (une sur deux plus courte : un texte, pas des données) */
const lignes = (x: number, y0: number, y1: number, step = 12) =>
  range(Math.floor((y1 - y0) / step) + 1)
    .map(k => `M${x + 10} ${y0 + k * step}H${x + (k % 2 ? 40 : 52)}`)
    .join('')

/** Une case cochée au trait ; (x, y) : son coin haut gauche */
const coche = (x: number, y: number, s = 10) => `M${x} ${y}h${s}v${s}h${-s}z`
const trait = (x: number, y: number, s = 10) => `M${x + 2} ${y + s * 0.55}l${s * 0.3} ${s * 0.3}l${s * 0.55} ${-s * 0.75}`

/** Un plancher : un trait fort, hachuré dessous (ce qui ne peut pas descendre plus bas) */
function Plancher({ x0, x1, y, t0 = 0, kept, tone }: { x0: number; x1: number; y: number; t0?: number; kept?: boolean; tone?: 'count' }) {
  let hatch = ''
  for (let x = x0 + 4; x <= x1 - 9; x += 13) hatch += `M${x} ${y}l-8 10`
  return (
    <g class={tone ? `vc-${tone}` : undefined}>
      <Ink d={`M${x0} ${y}H${x1}`} t0={t0} dur={700} kept={kept} class="vc-bold" />
      <Ink d={hatch} t0={t0 + 450} dur={500} kept={kept} class="vc-thin" />
    </g>
  )
}

/** Un nombre dit en euros, écrit court (« 1 041,59 euros » → « 1 041,59 € ») */
const euros = (s: string) => s.replace(/[\s\u00a0]euros?$/, '\u00a0€')

/** Une question finale : une rangée de pictogrammes en attente, puis la question dite */
function attente(p: P, pictos: PictoName[]) {
  const size = 58
  const gap = 18
  const w = pictos.length * size + (pictos.length - 1) * gap + 14 + 40
  const x0 = (W - w) / 2
  return (
    <Seg kind="ask">
      <Art h={size + 22}>
        <Ink d={`M10 ${size + 14}H290`} t0={0} dur={600} class="vc-soft" />
        {pictos.map((n, i) => (
          <Picto key={n} n={n} x={x0 + i * (size + gap)} y={8} size={size} t0={200 + i * 300} />
        ))}
        <Ask x={x0 + pictos.length * (size + gap) + 2} y={10} h={54} t0={300 + pictos.length * 300} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Qui prend alors le relais ? » : l'emploi et les revenus qui manquent, et un guichet en question */
const intro01: Board = p => {
  const job = word(p, /votre emploi/)
  const rev = word(p, /revenus/)
  const ask = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={150}>
        <Ink d="M10 146H290" t0={0} dur={600} class="vc-soft" />
        <Picto n="personne" x={10} y={60} size={86} t0={150} />
        {job?.shown ? <Picto n="mallette" x={104} y={34} size={44} tone="ghost" /> : null}
        {rev?.shown ? <Picto n="portemonnaie" x={104} y={92} size={44} tone="ghost" /> : null}
        {ask?.shown ? (
          <>
            <Arrow x1={156} y1={98} x2={186} y2={98} dash t0={100} />
            <Picto n="guichet" x={192} y={54} size={92} t0={200} />
            <Ask x={224} y={0} h={46} t0={800} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 Premier filet, l'assurance chômage : la mallette s'efface, un revenu de remplacement arrive */
const intro02: Board = p => {
  const [, rr] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={170}>
        <Filet x0={14} x1={286} y={112} sag={20} t0={100} />
        <Qui cx={118} base={128} size={58} t0={700} />
        <Picto n="mallette" x={28} y={58} size={40} tone="ghost" />
        {rr?.shown ? (
          <>
            <Picto n="enveloppe" x={206} y={10} size={66} tone="count" t0={100} />
            <Arrow x1={208} y1={58} x2={160} y2={84} t0={400} tone="count" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Second filet, plus bas : les minima sociaux, le RSA et l'AAH, chacun avec ses règles */
const intro03: Board = p => {
  const rsa = word(p, /RSA/)
  const aah = word(p, /AAH/)
  const rules = cueOf(p, 1)
  if (!rsa || !aah) return null
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={204}>
        <Filet x0={14} x1={286} y={8} sag={10} kept ghost />
        <Filet x0={14} x1={286} y={156} sag={16} t0={200} />
        {[rsa, aah].map((w, i) => {
          const x = 70 + i * 100
          return w.shown ? (
            <g key={w.text}>
              <Ink d={page(x, 50)} t0={300 + i * 250} dur={700} />
              <Txt x={x + 30} y={84} text={w.text} size={20} big tone="count" t0={700 + i * 250} />
              {/* Chacun ses règles : un règlement de forme différente */}
              {rules?.shown ? <Ink d={i ? lignes(x, 100, 140, 8) : `${lignes(x, 100, 112, 12)}${coche(x + 10, 124)}${coche(x + 26, 124)}`} t0={200} dur={600} class="vc-thin" /> : null}
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 04 8,3 % des actifs au chômage : environ 1 sur 12, compté dans une rangée de douze */
const intro04: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 16) return null
  const cols = Math.ceil(r.n / 2)
  const { h } = rangCells({ n: r.n, cols, max: 40, gap: 10 })
  const said1 = word(p, /Environ 1 sur 12/i) ?? cue
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 34}>
        <Rang n={r.n} picto="personne" cols={cols} max={40} gap={10} y={2} count={range(r.k)} shown={cue.shown} t0={300} stagger={70} />
        {cue.shown ? <Txt x={W / 2} y={h + 28} text={said1.text} size={16} tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 4,25 millions d'allocataires : une foule qui se remplit rangée par rangée */
const intro05: Board = p => {
  const crowd = rangCells({ n: 40, cols: 10, max: 24, gap: 4 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={crowd.h + 4}>
        <Rang n={40} picto="personne" cols={10} max={24} gap={4} y={2} t0={500} stagger={35} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 33,3 milliards, 1,1 % du PIB : un peu plus d'un euro sur 100, compté dans cent pièces */
const intro06: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text)?.n === 100)
  const r = ratioOf(cue?.text)
  if (!cue || !r) return null
  const cap = word(p, /un peu plus d’un euro sur 100/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="piece" low={r.k} caption={cap?.text ?? cue.text} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** Le pictogramme de chaque question du thème */
const QUESTIONS: [RegExp, PictoName][] = [
  [/chômage/, 'mallette'],
  [/revenu/, 'portemonnaie'],
  [/contreparties/, 'document'],
  [/handicap/, 'personne'],
]

/** 07 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map(q => ({
          picto: QUESTIONS.find(([re]) => re.test(q))?.[1] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 08 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Assurance chômage ——— */

/** 01 « Pendant combien de temps ? » : la mallette perdue, l'allocation, le sablier */
const ch01: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        <Picto n="mallette" x={4} y={30} size={64} tone="ghost" />
        <Arrow x1={74} y1={66} x2={98} y2={66} dash t0={300} />
        <Picto n="enveloppe" x={100} y={24} size={76} t0={500} />
        <Picto n="sablier" x={180} y={18} size={80} t0={1000} tone={cue?.shown ? 'count' : undefined} />
        <Ask x={264} y={28} h={50} t0={1600} />
      </Art>
    </Seg>
  )
}

/** 02 Les syndicats et le patronat négocient, dans le cadre du Premier ministre ; sans accord, un décret */
const ch02: Board = p => {
  const [neg, dec] = cuesOf(p)
  const syn = word(p, /syndicats/)
  const pat = word(p, /patronat/)
  const cadre = word(p, /un cadre/)
  const pm = word(p, /le Premier ministre/)
  if (!syn || !pat) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={196}>
        <Picto n="monument" x={222} y={0} size={62} t0={100} />
        {pm?.shown ? <Txt x={253} y={82} text={pm.text} max={12} size={14} /> : null}
        {cadre?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d="M6 24H198V156H6Z" />
            </Fade>
            <Txt x={14} y={42} text={cadre.text} anchor="start" size={14} tone="soft" />
            <Arrow x1={226} y1={40} x2={204} y2={52} dash t0={300} />
          </>
        ) : null}
        <Qui cx={50} base={118} size={46} label={syn.text} t0={300} />
        <Qui cx={152} base={118} size={46} label={pat.text} t0={500} />
        <Picto n="document" x={83} y={76} size={36} t0={800} />
        {neg?.shown ? (
          <>
            <Arrow x1={76} y1={70} x2={124} y2={70} t0={100} tone="count" head={6} />
            <Arrow x1={124} y1={62} x2={76} y2={62} t0={400} tone="count" head={6} />
          </>
        ) : null}
        {dec?.shown ? (
          <>
            <Picto n="document" x={222} y={112} size={52} tone="count" t0={0} />
            <Txt x={248} y={188} text={dec.text} size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Sous 9 %, sans hausse de 0,8 point en un trimestre : la durée perd un quart */
const ch03: Board = p => {
  const [seuil, red] = cuesOf(p)
  const cond = word(p, /et n’a pas augmenté de 0,8 point en un trimestre/)
  const duree = word(p, /La durée/)
  const pct = num(red?.text)
  if (!seuil || !red || !pct || pct >= 100) return null
  const x0 = 14
  const x1 = 286
  const y = 136
  const hh = 30
  const cut = x1 - ((x1 - x0) * pct) / 100
  const quarters = range(3).map(k => `M${x0 + ((k + 1) * (x1 - x0)) / 4} ${y}v${hh}`).join('')
  return (
    <Seg>
      <Art h={214}>
        <Picto n="cadran" x={4} y={2} size={84} t0={100} tone={seuil.shown ? 'count' : undefined} />
        {seuil.shown ? <Txt x={100} y={34} text={seuil.text} anchor="start" size={20} big tone="count" /> : null}
        {cond?.shown ? <Txt x={100} y={58} text={cond.text} anchor="start" max={26} size={14} /> : null}
        {duree ? <Txt x={x0} y={y - 10} text={duree.text} anchor="start" size={14} tone="soft" t0={600} /> : null}
        <Fade t0={900}>
          <rect class="vc-tint" x={x0} y={y} width={(red.shown ? cut : x1) - x0} height={hh} />
        </Fade>
        <Ink d={`M${red.shown ? cut : x1} ${y}H${x0}V${y + hh}H${red.shown ? cut : x1}${red.shown ? '' : 'Z'}`} t0={600} dur={800} />
        <Ink d={quarters} t0={1100} dur={400} class="vc-thin vc-soft" />
        {red.shown ? (
          <>
            <Fade class="vc-ghost">
              <path d={`M${cut} ${y}H${x1}V${y + hh}H${cut}`} />
            </Fade>
            <Brace x1={cut} y1={y + hh + 6} x2={x1} y2={y + hh + 6} tone="count" t0={200} />
            <Txt x={x1} y={y + hh + 42} text={red.text} anchor="end" size={18} big tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 548 jours, environ 18 mois, contre 730 jours, environ 24 mois : deux barres à la même échelle */
const ch04: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /environ 18 mois/)
  const lb = word(p, /environ 24 mois/)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: la?.text, value: va, text: a.text, shown: a.shown, tone: 'count' },
      { label: lb?.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: 30,
    room: 104,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Rupture conventionnelle : 18 mois avant, 15 mois depuis le 1er septembre 2026, à la même échelle */
const ch05: Board = p => {
  const [now, before] = cuesOf(p)
  const vNow = num(now?.text)
  const vBefore = num(before?.text)
  const since = word(p, /Depuis le 1er septembre \d{4}/i)
  const avant = word(p, /avant/)
  if (!now || !before || !vNow || !vBefore) return null
  const unit = now.text.replace(/^[\d,]+/, '')
  const g = barres({
    items: [
      { label: avant ? capital(avant.text) : undefined, value: vBefore, text: `${vBefore}${unit}`, shown: before.shown },
      { label: since?.text, value: vNow, text: now.text, shown: now.shown, tone: 'count' },
    ],
    y: 4,
    size: 26,
    gap: 30,
    room: 96,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Droit ouvert 67,9 %, indemnisés 46,9 % : deux barres sur une échelle de 0 à 100 % */
const ch06: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /un droit ouvert à une allocation/)
  const lb = word(p, /la touchaient effectivement/)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: la?.text, value: va, text: a.text, shown: a.shown },
      { label: lb?.text, value: vb, text: b.text, shown: b.shown, tone: 'count' },
    ],
    max: 100,
    y: 4,
    size: 24,
    gap: 30,
    room: 20,
    t0: 100,
  })
  const end = W - 20
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 30}>
        <Fade t0={1200} class="vc-dash vc-soft">
          <path d={`M${end} 2V${g.h + 10}`} />
        </Fade>
        <Txt x={end} y={g.h + 27} text={'100\u00a0%'} size={14} tone="soft" t0={1300} />
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 L'Unédic : un excédent de 0,1 milliard en 2025, un déficit de 2,3 milliards prévu en 2026 */
const ch07: Board = p => {
  const [def, exc] = cuesOf(p)
  const vd = num(def?.text)
  const ve = num(exc?.text)
  const [yd, ye] = yearsOf(p.segment.say)
  if (!def || !exc || !vd || !ve || !yd || !ye) return null
  const k = 34
  const zero = 42
  const down = vd * k
  const up = ve * k
  const col = (x: number, top: number, bottom: number) => `M${x} ${bottom}V${top}H${x + 56}V${bottom}`
  const v = p.segment.figure?.value
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={zero + down + 34}>
        <Ink d={`M14 ${zero}H286`} t0={0} dur={600} class="vc-soft" />
        <Txt x={90} y={zero + 22} text={String(ye)} size={14} tone="soft" t0={300} />
        <Txt x={206} y={zero - 10} text={String(yd)} size={14} tone="soft" t0={400} />
        {exc.shown ? (
          <>
            <Fade class="vc-count">
              <rect class="vc-tint-count" x={62} y={zero - up} width={56} height={up} />
              <path d={col(62, zero - up, zero)} />
            </Fade>
            <Txt x={90} y={zero - up - 10} text={`+${exc.text}`} size={16} tone="count" t0={200} />
          </>
        ) : null}
        {def.shown ? (
          <>
            <Fade class="vc-count">
              <rect class="vc-tint-count" x={178} y={zero} width={56} height={down} />
            </Fade>
            <Fade class="vc-count vc-dash">
              <path d={`M178 ${zero}V${zero + down}H234V${zero}`} />
            </Fade>
            {v ? <Txt x={206} y={zero + down + 26} text={v} size={18} big tone="count" t0={300} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Selon l'Unédic, des pertes de CSG et des prélèvements de l'État ; sans nouveau prélèvement, un excédent */
const ch08: Board = p => {
  const [csg, etat, plus] = cuesOf(p)
  const sans = word(p, /Sans nouveau prélèvement/)
  const year = word(p, /en \d{4}/)
  if (!csg || !etat || !plus) return null
  return (
    <Seg>
      <Art h={204}>
        <Picto n="tirelire" x={10} y={24} size={92} t0={100} />
        {etat.shown ? (
          <>
            <Arrow x1={106} y1={50} x2={146} y2={34} t0={100} />
            <Picto n="monument" x={152} y={6} size={48} t0={300} />
            <Txt x={206} y={28} text={etat.text} anchor="start" max={13} size={14} t0={500} />
          </>
        ) : null}
        {csg.shown ? (
          <>
            <Arrow x1={106} y1={84} x2={146} y2={98} t0={100} />
            <Picto n="pieces" x={152} y={74} size={48} tone="ghost" />
            <Txt x={206} y={96} text={csg.text} anchor="start" max={10} size={14} t0={300} />
          </>
        ) : null}
        {plus.shown ? (
          <>
            <Ink d="M10 140H290" t0={0} dur={500} class="vc-soft vc-thin" />
            <Picto n="hausse" x={8} y={150} size={44} tone="count" t0={100} w={1.2} />
            {sans ? <Txt x={58} y={166} text={sans.text} anchor="start" size={14} tone="soft" t0={200} /> : null}
            <Txt x={58} y={194} text={`${plus.text}${year ? ` ${year.text}` : ''}`} anchor="start" size={18} big tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 « Combien de temps indemniser, à quel niveau, et qui doit en décider ? » */
const ch09: Board = p => attente(p, ['sablier', 'enveloppe', 'document'])

/* ——— RSA et minima sociaux ——— */

/** 01 Presque aucun revenu : un porte-monnaie, un plancher, et la question */
const rsa01: Board = p => {
  const floor = word(p, /un minimum peut vous être garanti/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={136}>
        <Picto n="portemonnaie" x={50} y={6} size={92} t0={100} />
        {floor?.shown ? <Plancher x0={14} x1={210} y={112} t0={200} tone="count" /> : null}
        <Ask x={238} y={22} h={70} t0={1400} />
      </Art>
    </Seg>
  )
}

/** 02 Le RSA au premier plan, d'autres minima sociaux autour, chacun avec ses propres règles */
const rsa02: Board = p => {
  const [rsa, rules] = cuesOf(p)
  const others = word(p, /D’autres minima sociaux/)
  if (!rsa) return null
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={156}>
        {others?.shown ? (
          <>
            <Ink d={page(24, 18)} t0={0} dur={700} class="vc-soft" />
            <Ink d={`${lignes(24, 44, 92, 16)}${rules?.shown ? `${coche(34, 100)}${coche(50, 100)}` : ''}`} t0={300} dur={600} class="vc-soft vc-thin" />
            <Ink d={page(214, 18)} t0={200} dur={700} class="vc-soft" />
            <Ink d={`${lignes(214, 38, 104, 8)}`} t0={500} dur={600} class="vc-soft vc-thin" />
            <Txt x={W / 2} y={150} text={others.text} size={14} tone="soft" t0={400} />
          </>
        ) : null}
        <Ink d={page(119, 4)} t0={100} dur={800} />
        <Ink d={lignes(119, 56, 92, 12)} t0={700} dur={500} class="vc-thin" />
        <Txt x={150} y={40} text={rsa.text} size={20} big tone={rsa.shown ? 'count' : undefined} t0={500} />
      </Art>
    </Seg>
  )
}

/** 03 651,69 euros par mois pour une personne seule : la personne, un billet, des pièces */
const rsa03: Board = p => (
  <Seg kind="fig">
    <Chiffre p={p} />
    <Art h={104}>
      <Qui cx={52} base={100} size={74} t0={200} />
      <Picto n="billet" x={112} y={20} size={84} t0={600} />
      <Picto n="pieces" x={212} y={34} size={62} t0={1000} />
    </Art>
    <Src p={p} />
  </Seg>
)

/** 04 Le forfait logement : 78,20 euros déduits du montant du RSA, à l'échelle */
const rsa04: Board = p => {
  const cue = cueOf(p, 0)
  const total = said(p, /\d+,\d+ euros par mois/)
  const vt = num(total)
  const vf = num(cue?.text)
  const aide = word(p, /une aide au logement/)
  if (!cue || !total || !vt || !vf || vf >= vt) return null
  const x0 = 14
  const x1 = 286
  const y = 84
  const hh = 30
  const cut = x1 - ((x1 - x0) * vf) / vt
  return (
    <Seg>
      <Art h={180}>
        <Txt x={x0} y={y - 12} text={total.replace(/ par mois$/, '')} anchor="start" size={16} t0={200} />
        <Fade t0={700}>
          <rect class="vc-tint" x={x0} y={y} width={(cue.shown ? cut : x1) - x0} height={hh} />
        </Fade>
        <Ink d={`M${cue.shown ? cut : x1} ${y}H${x0}V${y + hh}H${cue.shown ? cut : x1}${cue.shown ? '' : 'Z'}`} t0={100} dur={800} />
        {aide?.shown ? <Picto n="maison" x={x1 - 58} y={0} size={52} t0={0} /> : null}
        {cue.shown ? (
          <>
            <Fade class="vc-ghost">
              <path d={`M${cut} ${y}H${x1}V${y + hh}H${cut}`} />
            </Fade>
            <Brace x1={cut} y1={y + hh + 6} x2={x1} y2={y + hh + 6} tone="count" t0={200} />
            <Txt x={x1} y={y + hh + 46} text={cue.text} anchor="end" size={18} big tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 1,89 million de foyers allocataires du RSA, 1,9 % de plus qu'un an plus tôt */
const rsa05: Board = p => {
  const [, plus] = cuesOf(p)
  const more = word(p, /de plus qu’un an plus tôt/)
  const rows = rangCells({ n: 20, cols: 10, max: 24, gap: 6 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={rows.h + 44}>
        <Rang n={20} picto="maison" cols={10} max={24} gap={6} y={2} t0={500} stagger={40} />
        {plus?.shown ? (
          <>
            <Picto n="hausse" x={40} y={rows.h + 10} size={30} tone="count" t0={100} w={1.2} />
            <Txt x={74} y={rows.h + 32} text={`${plus.text}${more ? ` ${more.text}` : ''}`} anchor="start" size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Le non-recours : 33 à 37 foyers éligibles sur 100 ne touchent pas le RSA */
const rsa06: Board = p => {
  const cue = cueOf(p, 1)
  const m = /(\d+) à (\d+)/.exec(cue?.text ?? '')
  const cap = word(p, /\d+ à \d+ % des foyers éligibles ne le touchaient pas/)
  if (!cue || !m) return null
  const low = Number(m[1])
  const high = Number(m[2])
  if (!(low > 0 && high > low && high < 100)) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="maison" low={low} high={high} caption={cap?.text ?? cue.text} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les déclarations préremplies : les données viennent des employeurs, des organismes sociaux et des impôts */
const rsa07: Board = p => {
  const cue = cueOf(p, 0)
  const from: [RegExp, PictoName][] = [
    [/employeurs/, 'immeuble'],
    [/organismes sociaux/, 'guichet'],
    [/impôts/, 'monument'],
  ]
  const src = from.map(([re, n]) => ({ w: word(p, re), n }))
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={172}>
        {src.map(({ w, n }, i) =>
          w?.shown ? (
            <g key={n}>
              <Picto n={n} x={4} y={4 + i * 60} size={44} t0={0} />
              <Txt x={54} y={30 + i * 60} text={w.text} anchor="start" max={11} size={14} t0={200} />
              <Arrow x1={142} y1={26 + i * 60} x2={196} y2={56 + i * 26} t0={300} tone="count" head={7} />
            </g>
          ) : null,
        )}
        <Ink d={page(210, 24)} t0={100} dur={800} />
        {cue?.shown ? <Ink d={lignes(210, 50, 110, 12)} t0={500} dur={1200} class="vc-count" /> : null}
      </Art>
    </Seg>
  )
}

/** 08 La fraude : estimée entre 3,8 et 4,7 milliards, 509 millions détectés en 2025, à la même échelle */
const rsa08: Board = p => {
  const [, est, det] = cuesOf(p)
  const m = /(\d+,\d+) et (\d+,\d+)/.exec(est?.text ?? '')
  const vdet = num(det?.text)
  const year = yearsOf(p.segment.say)[0]
  if (!est || !det || !m || !vdet || !year) return null
  const lo = num(m[1])!
  const hi = num(m[2])!
  // Le détecté est dit en millions, l'estimé en milliards : même unité pour la même échelle
  const detMd = /millions?/.test(det.text) ? vdet / 1000 : vdet
  const x0 = 6
  const k = (W - 12) / hi
  const bar = (y: number, v: number) => `M${x0} ${y}H${x0 + v * k}V${y + 26}H${x0}Z`
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        <Txt x={x0} y={18} text="estimée" anchor="start" size={14} tone="soft" t0={100} />
        {est.shown ? (
          <>
            <Txt x={W - 6} y={18} text={est.text} anchor="end" size={15} t0={200} />
            <Fade t0={400}>
              <rect class="vc-tint" x={x0} y={28} width={lo * k} height={26} />
            </Fade>
            <Ink d={bar(28, lo)} t0={200} dur={700} />
            <Fade t0={900} class="vc-count">
              <rect class="vc-tint-count" x={x0 + lo * k} y={28} width={(hi - lo) * k} height={26} />
              <path d={`M${x0 + lo * k} 28H${x0 + hi * k}V54H${x0 + lo * k}`} />
            </Fade>
          </>
        ) : null}
        <Txt x={x0} y={92} text={`détectée en ${year}`} anchor="start" size={14} tone="soft" t0={300} />
        {det.shown ? (
          <>
            <Txt x={W - 6} y={92} text={det.text} anchor="end" size={15} t0={200} />
            <Fade t0={400} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={102} width={detMd * k} height={26} />
              <path d={bar(102, detMd)} />
            </Fade>
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 La lutte contre la fraude d'un côté, l'accès aux droits de l'autre : une balance au fléau horizontal */
const rsa09: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: ['loupe'],
    right: ['porte'],
    labels: [a ? capital(a.text) : null, b ? capital(b.text) : null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 10 « Quel montant pour les minima sociaux, et quelles démarches pour les obtenir ? » */
const rsa10: Board = p => attente(p, ['portemonnaie', 'document'])

/* ——— Contreparties ——— */

/** 01 « Qu'attend-on de vous en échange ? » : l'allocation d'un côté, un document de l'autre */
const cp01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={120}>
      <Picto n="enveloppe" x={0} y={18} size={84} t0={100} />
      <Arrow x1={90} y1={46} x2={168} y2={46} t0={700} />
      <Arrow x1={168} y1={74} x2={90} y2={74} t0={1000} />
      <Picto n="document" x={174} y={14} size={84} t0={1200} />
      <Ask x={262} y={18} h={50} t0={1800} />
    </Art>
  </Seg>
)

/** 02 Le contrat d'engagement, entre les demandeurs d'emploi et les allocataires du RSA */
const cp02: Board = p => {
  const [, dem] = cuesOf(p)
  const de = word(p, /Demandeurs d’emploi/)
  const rsa = word(p, /allocataires du RSA/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={162}>
        <Qui cx={50} base={96} size={62} label={de?.text} t0={100} max={11} />
        <Qui cx={250} base={96} size={62} label={rsa?.text} t0={300} max={12} />
        <Ink d={page(119, 0)} t0={500} dur={800} />
        <Ink d={lignes(119, 22, 46, 12)} t0={1000} dur={400} class="vc-thin" />
        <Ink d={`${coche(130, 62)}${coche(130, 80)}`} t0={1200} dur={400} class="vc-thin" />
        {dem?.shown ? (
          <>
            <Ink d={`${trait(130, 62)}${trait(130, 80)}`} t0={0} dur={500} class="vc-count" />
            <Txt x={150} y={124} text={dem.text} max={11} size={14} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Au moins 30 % de l'allocation suspendu, pendant un à deux mois */
const cp03: Board = p => {
  const [pct, mois] = cuesOf(p)
  const v = num(pct?.text)
  const cap = word(p, /au moins \d+ % de l’allocation peut être suspendu/)
  if (!pct || !v || v >= 100) return null
  return (
    <Seg>
      <Sur100 p={p} kind="piece" low={v} mode="retrait" caption={cap?.text ?? pct.text} shown={pct.shown} />
      <Art h={64}>
        <Picto n="calendrier" x={74} y={4} size={54} t0={300} tone={mois?.shown ? 'count' : undefined} />
        {mois?.shown ? <Txt x={140} y={40} text={mois.text} anchor="start" size={18} big tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 En cas de récidive, un à quatre mois ; la suspension prend fin si la personne se remet en règle */
const cp04: Board = p => {
  const [mois, regle] = cuesOf(p)
  const n = num(/à (\S+) mois/.exec(plain(mois?.text ?? ''))?.[1]) ?? 0
  if (!mois || n < 2 || n > 12) return null
  const size = 34
  const gap = 8
  const x = (W - n * size - (n - 1) * gap) / 2
  return (
    <Seg>
      <Art h={190}>
        <Cases n={n} cols={n} x={x} y={6} size={size} gap={gap} count={mois.shown ? range(n) : []} t0={100} />
        {mois.shown ? <Txt x={W / 2} y={68} text={mois.text} size={18} big tone="count" t0={300} /> : null}
        {regle?.shown ? (
          <>
            <Ink d={page(30, 84)} t0={0} dur={600} />
            <Ink d={`${coche(42, 100)}${coche(42, 120)}`} t0={300} dur={300} class="vc-thin" />
            <Ink d={`${trait(42, 100)}${trait(42, 120)}`} t0={500} dur={400} class="vc-count" />
            <Arrow x1={100} y1={130} x2={150} y2={130} t0={700} tone="count" />
            <Picto n="enveloppe" x={156} y={92} size={72} t0={900} />
            <Txt x={192} y={176} text={regle.text} size={15} t0={1100} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Un foyer de plusieurs personnes : la part suspendue s'arrête à 50 % de l'allocation */
const cp05: Board = p => {
  const [foyer, half] = cuesOf(p)
  const v = num(half?.text)
  const part = word(p, /la part suspendue/)
  if (!foyer || !half || !v || v >= 100) return null
  const x0 = 140
  const x1 = 290
  const y = 70
  const hh = 30
  const stop = x1 - ((x1 - x0) * v) / 100
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={150}>
        <Ink d="M6 56L64 14L122 56" t0={100} dur={700} />
        {[30, 64, 98].map((cx, i) => (
          <Qui key={cx} cx={cx} base={106} size={36} t0={500 + i * 150} tone={foyer.shown ? 'count' : undefined} />
        ))}
        <Ink d="M6 108H122" t0={300} dur={500} class="vc-soft" />
        <Ink d={`M${x0} ${y}H${x1}V${y + hh}H${x0}Z`} t0={600} dur={800} />
        {part?.shown ? (
          <Fade t0={0} class="vc-ghost">
            <path d={`M${stop} ${y + 4}H${x1 - 4}V${y + hh - 4}H${stop}`} />
          </Fade>
        ) : null}
        {half.shown ? (
          <>
            <Ink d={`M${stop} ${y - 14}V${y + hh + 14}`} t0={0} dur={400} class="vc-count vc-bold" />
            <Txt x={stop} y={y - 22} text={half.text} size={18} big tone="count" t0={200} />
          </>
        ) : null}
        {part?.shown ? <Txt x={x1} y={y + hh + 34} text={part.text} anchor="end" size={14} t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 L'allocation supprimée en totalité pendant quatre mois ; radié de la liste pour la même durée */
const cp06: Board = p => {
  const [sup, rad] = cuesOf(p)
  const quatre = word(p, /\S+ mois/)
  const n = num(quatre?.text.split(' ')[0]) ?? 0
  if (!sup || !rad || n < 1 || n > 12) return null
  const rows = [26, 46, 66, 86, 106, 126]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="enveloppe" x={8} y={0} size={90} tone={sup.shown ? 'ghost' : undefined} t0={100} />
        {quatre?.shown ? (
          <>
            <Cases n={n} cols={n} x={14} y={84} size={16} gap={5} count={range(n)} t0={0} />
            <Txt x={14} y={126} text={quatre.text} anchor="start" size={14} t0={200} />
          </>
        ) : null}
        <Ink d="M150 8H290V146H150Z" t0={300} dur={800} />
        <Ink d={rows.filter((_, i) => !(rad.shown && i === 3)).map(y => `M166 ${y}H${y % 40 ? 270 : 252}`).join('')} t0={700} dur={600} class="vc-thin" />
        {rad.shown ? (
          <Fade class="vc-ghost">
            <path d="M166 86H262" />
          </Fade>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 « Quelle place donner aux contreparties et aux sanctions ? » */
const cp07: Board = p => attente(p, ['document', 'enveloppe'])

/* ——— Handicap ——— */

/** 01 « Quelles aides existent alors ? » : une personne, une barrière devant l'emploi */
const h01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={130}>
      <Ink d="M8 124H292" t0={0} dur={600} class="vc-soft" />
      <Qui cx={46} base={122} size={84} t0={100} />
      <Picto n="barriere" x={98} y={64} size={60} t0={600} />
      <Picto n="mallette" x={170} y={62} size={58} t0={1000} />
      <Ask x={250} y={30} h={60} t0={1500} />
    </Art>
  </Seg>
)

/** 02 L'AAH : un taux d'incapacité d'au moins 80 %, ou de 50 à 79 % si l'accès à l'emploi est restreint */
const h02: Board = p => {
  const [, haut, mid] = cuesOf(p)
  const m = /(\d+) à (\d+)/.exec(mid?.text ?? '')
  const vh = num(haut?.text)
  const taux = word(p, /taux d’incapacité/)
  if (!haut || !mid || !m || !vh) return null
  const lo = Number(m[1])
  const hi = Number(m[2])
  const x0 = 20
  const x1 = 280
  const X = (v: number) => x0 + ((x1 - x0) * v) / 100
  const y = 62
  const hh = 28
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={158}>
        {taux ? <Txt x={x0} y={y - 14} text={taux.text} anchor="start" size={14} tone="soft" t0={100} /> : null}
        <Ink d={`M${x0} ${y}H${x1}V${y + hh}H${x0}Z`} t0={200} dur={800} />
        <Ink d={[0, lo, vh, 100].map(v => `M${X(v).toFixed(1)} ${y + hh}v8`).join('')} t0={800} dur={300} class="vc-soft vc-thin" />
        {[0, lo, vh].map(v => (
          <Txt key={v} x={X(v)} y={y + hh + 24} text={String(v)} size={14} tone="soft" t0={900} />
        ))}
        <Txt x={X(100)} y={y + hh + 24} text={'100\u00a0%'} anchor="end" size={14} tone="soft" t0={900} />
        {haut.shown ? (
          <>
            <Fade class="vc-count">
              <rect class="vc-tint-count" x={X(vh)} y={y} width={X(100) - X(vh)} height={hh} />
              <path d={`M${X(vh)} ${y}V${y + hh}`} />
            </Fade>
            <Txt x={x1} y={y - 14} text={haut.text} anchor="end" size={16} tone="count" t0={200} />
          </>
        ) : null}
        {mid.shown ? (
          <>
            <Fade t0={0}>
              <rect class="vc-tint" x={X(lo)} y={y} width={X(hi + 1) - X(lo)} height={hh} />
              <path class="vc-soft" d={`M${X(lo)} ${y}V${y + hh}`} />
            </Fade>
            <Picto n="mallette" x={(X(lo) + X(hi + 1)) / 2 - 17} y={y + hh + 30} size={34} tone="ghost" />
            <Txt x={(X(lo) + X(hi + 1)) / 2 - 24} y={y + hh + 54} text={mid.text} anchor="end" size={16} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 et 04 Le montant maximal de l'AAH, puis le seuil de pauvreté, à la même échelle depuis zéro */
function seuil(p: P, withSeuil: boolean) {
  const aahText = said(p, /\d[\d ]*,\d\d euros/)
  const seuilText = said(p, /\d[\d ]*\d euros par mois en \d{4}/)
  const aah = num(aahText)
  const sv = num(seuilText)
  const aahWord = said(p, /l’AAH/)
  const seuilWord = said(p, /Le seuil de pauvreté/)
  if (!aahText || !seuilText || !aah || !sv || !aahWord) return null
  const cue = cueOf(p, 0)
  const items: Barre[] = [{ label: capital(aahWord), value: aah, text: euros(aahText), tone: withSeuil ? undefined : 'count', shown: withSeuil || !!cue?.shown }]
  if (withSeuil) items.push({ label: seuilWord ?? undefined, value: sv, text: euros(cue?.text ?? seuilText.replace(/ par mois en \d{4}$/, '')), tone: 'count', shown: !!cue?.shown })
  const g = barres({ items, max: sv, y: 4, size: 26, gap: 30, room: 112, t0: withSeuil ? 0 : 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={(withSeuil ? g.h : g.h + 56) + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

const h03: Board = p => seuil(p, false)
const h04: Board = p => seuil(p, true)

/** 05 Depuis 2023, l'AAH ne dépend plus des revenus du conjoint : ses pièces passent en pointillé */
const h05: Board = p => {
  const cue = cueOf(p, 0)
  const since = word(p, /Depuis le 1er octobre \d{4}/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Ink d="M8 116H292" t0={0} dur={600} class="vc-soft" />
        <Qui cx={86} base={114} size={70} t0={100} />
        <Qui cx={200} base={114} size={70} t0={300} />
        <Picto n="enveloppe" x={6} y={44} size={50} tone="count" t0={700} />
        <Picto n="pieces" x={244} y={52} size={48} tone={cue?.shown ? 'ghost' : undefined} t0={900} />
        {since?.shown ? <Txt x={W / 2} y={142} text={since.text} size={14} tone="soft" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Les MDPH : 1,8 million de personnes leur ont adressé une demande en 2024 */
const h06: Board = p => {
  const mdph = word(p, /MDPH/)
  if (!mdph) return null
  const docs: [number, number, number][] = [
    [6, 8, 100],
    [26, 62, 100],
    [244, 8, 200],
    [226, 62, 200],
  ]
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={116}>
        <Picto n="guichet" x={96} y={6} size={108} t0={100} />
        {/* Le nom écrit dans l'enseigne du guichet (12 à 36 sur 5 à 14, en unités du pictogramme) */}
        <Txt x={150} y={33} text={mdph.text} size={14} t0={700} />
        {docs.map(([x, y, tx], i) => (
          <g key={i}>
            <Picto n="document" x={x} y={y} size={40} t0={900 + i * 200} />
            <Arrow x1={x < 150 ? x + 38 : x + 2} y1={y + 22} x2={tx} y2={y + 26} dash t0={1100 + i * 200} />
          </g>
        ))}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 4,8 mois en moyenne : un drapeau sur une ligne de six mois */
const h07: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  if (!cue || !v || v > 6) return null
  const f = frise({ y: 62, from: 0, to: 6, x0: 24, x1: 248, ticks: range(7), labels: [0, 2, 4, 6], t0: 200 })
  const fx = f.X(v)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={96}>
        {f.el}
        <Txt x={260} y={86} text="mois" anchor="start" size={14} tone="soft" t0={700} />
        {cue.shown ? (
          <>
            <Picto n="drapeau" x={fx - 11} y={62 - 46} size={48} tone="count" t0={200} />
            <Txt x={fx - 16} y={40} text={cue.text} anchor="end" size={18} big tone="count" t0={500} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 593 300 élèves, près de 9 sur 10 uniquement en milieu ordinaire : dix silhouettes, neuf comptées */
const h08: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const { h } = rangCells({ n: r.n, max: 26, gap: 4 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 32}>
        <Rang n={r.n} picto="personne" max={26} gap={4} y={2} count={range(r.k)} shown={cue.shown} t0={300} stagger={60} />
        {cue.shown ? <Txt x={W / 2} y={h + 26} text={cue.text} size={16} tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 137 800 AESH, tous contractuels : un adulte et un élève près d'un livre, et un contrat */
const h09: Board = p => {
  const [, contr] = cuesOf(p)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        <Ink d="M6 96H186" t0={0} dur={500} class="vc-soft" />
        <Qui cx={44} base={94} size={72} t0={100} />
        <Qui cx={100} base={94} size={46} t0={400} />
        <Picto n="livre" x={128} y={50} size={48} t0={700} />
        <Ink d={page(214, 0)} t0={900} dur={700} />
        <Ink d={lignes(214, 26, 74, 12)} t0={1300} dur={400} class="vc-thin" />
        {contr?.shown ? <Txt x={245} y={118} text={contr.text} size={14} tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 10 Dans les immeubles neufs, 20 % des logements accessibles ; les autres, par des travaux simples */
const h10: Board = p => {
  const [pct, trav] = cuesOf(p)
  const v = num(pct?.text)
  if (!pct || !v || v >= 100) return null
  const cols = 2
  const rows = 5
  const n = cols * rows
  const k = Math.max(1, Math.round((n * v) / 100))
  const win = (i: number) => ({ x: 104 + (i % cols) * 56, y: 18 + Math.floor(i / cols) * 28 })
  const sq = (i: number) => {
    const w = win(i)
    return `M${w.x} ${w.y}h36v18h-36z`
  }
  const counted = range(k).map(i => n - 1 - i)
  const others = range(n).filter(i => !counted.includes(i))
  const ring = (i: number) => {
    const w = win(i)
    return `M${w.x - 4} ${w.y - 4}h44v26h-44z`
  }
  return (
    <Seg>
      <Art h={166}>
        <Ink d="M6 162H294" t0={0} dur={600} class="vc-soft" />
        <Ink d="M88 162V6H212V162" t0={200} dur={900} />
        <Ink d={others.map(sq).join('')} t0={700} dur={700} class="vc-thin" />
        {pct.shown ? (
          <Fade t0={200} class="vc-count">
            <path class="vc-tint-count" d={counted.map(sq).join('')} />
            <path d={counted.map(sq).join('')} />
          </Fade>
        ) : (
          <Ink d={counted.map(sq).join('')} t0={900} dur={300} class="vc-thin" />
        )}
        {pct.shown ? <Txt x={222} y={152} text={pct.text} anchor="start" size={24} big tone="count" t0={400} /> : null}
        {trav?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={others.map(ring).join('')} />
            </Fade>
            <Txt x={44} y={70} text={trav.text} max={8} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 11 « Quelle priorité : le niveau de l'allocation, les démarches, l'école ou l'accessibilité ? » */
const h11: Board = p => {
  const i = p.segment.say.search(/[\u00a0 ]:/)
  const list = (i < 0 ? [] : p.segment.say.slice(i + 2).replace(/[\s\u202f]*[?.]$/, '').split(/,\s+|\s+ou\s+/)).map(s => s.trim()).filter(Boolean)
  if (list.length < 2 || list.length > 4) return null
  const pictos: PictoName[] = list.map(l => (/allocation|niveau/.test(l) ? 'enveloppe' : /démarche/.test(l) ? 'guichet' : /école/.test(l) ? 'livre' : /accessib/.test(l) ? 'porte' : 'document'))
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Panel cols={2} items={list.map((l, k) => ({ picto: pictos[k]!, text: l, shown: heard(p, l) }))} />
    </Seg>
  )
}

/* ——— Le registre ——— */

export const SOLIDARITES: Record<string, Board> = {
  'solidarites-intro-01': intro01,
  'solidarites-intro-02': intro02,
  'solidarites-intro-03': intro03,
  'solidarites-intro-04': intro04,
  'solidarites-intro-05': intro05,
  'solidarites-intro-06': intro06,
  'solidarites-intro-07': intro07,
  'solidarites-intro-08': intro08,
  'solidarites-chomage-01': ch01,
  'solidarites-chomage-02': ch02,
  'solidarites-chomage-03': ch03,
  'solidarites-chomage-04': ch04,
  'solidarites-chomage-05': ch05,
  'solidarites-chomage-06': ch06,
  'solidarites-chomage-07': ch07,
  'solidarites-chomage-08': ch08,
  'solidarites-chomage-09': ch09,
  'solidarites-rsa-01': rsa01,
  'solidarites-rsa-02': rsa02,
  'solidarites-rsa-03': rsa03,
  'solidarites-rsa-04': rsa04,
  'solidarites-rsa-05': rsa05,
  'solidarites-rsa-06': rsa06,
  'solidarites-rsa-07': rsa07,
  'solidarites-rsa-08': rsa08,
  'solidarites-rsa-09': rsa09,
  'solidarites-rsa-10': rsa10,
  'solidarites-contreparties-01': cp01,
  'solidarites-contreparties-02': cp02,
  'solidarites-contreparties-03': cp03,
  'solidarites-contreparties-04': cp04,
  'solidarites-contreparties-05': cp05,
  'solidarites-contreparties-06': cp06,
  'solidarites-contreparties-07': cp07,
  'solidarites-handicap-01': h01,
  'solidarites-handicap-02': h02,
  'solidarites-handicap-03': h03,
  'solidarites-handicap-04': h04,
  'solidarites-handicap-05': h05,
  'solidarites-handicap-06': h06,
  'solidarites-handicap-07': h07,
  'solidarites-handicap-08': h08,
  'solidarites-handicap-09': h09,
  'solidarites-handicap-10': h10,
  'solidarites-handicap-11': h11,
}
