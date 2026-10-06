// Piste C, les planches de la série « Europe » (src/ui/videos/series/europe.ts) : un dessin par passage, composé
// avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Les mots et les nombres
// viennent du script (mots mis en valeur, phrases dites, chiffre et graphique de la fiche, « alt ») : si le texte
// change, le dessin suit ; s'il ne s'y retrouve plus (une planche rend null), le passage prend le dessin
// générique de sa sorte d'image. Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne
// les dit pas (« recettes », « dépenses ») : elles nomment ce qui est dessiné, et le « alt » du passage les dit.
// Les États ne sont jamais dessinés par un drapeau ni par une carte : une case, une pièce, un nom écrit.

import { chartOf } from '../../model'
import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, cls, cueOf, cuesOf, heard, num, nums, plain, ratioOf, said, sentenceWith, sentencesOf, word, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Note, Panel, Question, Seg, Signature, Sommaire, Src, Sur100, lineOf, listAfterColon } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Barriere, Cases, Disque, Rang, Signe, balance, barres, casesH, frise, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Un nombre écrit à la française (« 1,13 ») */
const fr = (v: number) => String(v).replace('.', ',')

/** Le premier mot d'un texte (« neuf États » → « neuf ») */
const firstWord = (s: string | null | undefined) => (s ?? '').split(/[\s\u00a0\u202f]+/)[0] ?? ''

/* ——— Petits dessins propres à la série, au trait, dans un carré de 48 unités (comme pictos.tsx) ——— */

const ring = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

/** Une urne : la boîte, la fente, le bulletin qui entre */
const URNE = ['M7 21H41V44H7Z', 'M17 21H31', 'M18 20V5H30V20', 'M21 10h6']
/** Un train vu de côté, l'avant à droite : la caisse, les vitres, les roues, le rail */
const TRAIN = ['M3 13H36Q45 13 45 24V35H3Z', 'M8 18h7v7h-7zM19 18h7v7h-7zM30 18h5q4 1 5 7h-10z', `${ring(12, 39, 4)}${ring(34, 39, 4)}`, 'M1 45H47']
/** Une usine et sa cheminée (les quotas carbone) */
const USINE = ['M4 44V24L14 30V24L24 30V24L32 29V12H40V44Z', 'M2 44H46', 'M36 8c-3-2 3-4 0-7']
/** Une cigarette (le tabac) */
const CIGARETTE = ['M4 27H40V34H4Z', 'M31 27V34', 'M44 23c-2-3 2-5 0-9']
/** Un écran (les déchets électroniques) */
const ECRAN = ['M5 8H43V34H5Z', 'M24 34V41M15 42H33', 'M10 13h28']

/** Un petit dessin au trait ; (x, y) : coin haut gauche, s : côté ; « flip » le retourne (un train vers la gauche) */
function Trait({ d, x, y, s = 48, t0 = 0, kept, tone, flip, thin = [], step = 180 }: { d: string[]; x: number; y: number; s?: number; t0?: number; kept?: boolean; tone?: Tone; flip?: boolean; thin?: number[]; step?: number }) {
  const k = s / 48
  const tr = flip ? `translate(${x + s} ${y}) scale(${-k} ${k})` : `translate(${x} ${y}) scale(${k})`
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={tr} style={{ '--k': String(48 / s) }}>
      {d.map((path, i) => (
        <Ink key={i} d={path} t0={t0 + i * step} dur={i ? 380 : 520} kept={kept || tone === 'ghost'} class={thin.includes(i) ? 'vc-thin' : undefined} />
      ))}
    </g>
  )
}

/** Une table vue de haut, et autour une place par État (des points) ; les « count » premières places comptées */
function Table({ cx, cy, r, n, count = 0, t0 = 0, kept }: { cx: number; cy: number; r: number; n: number; count?: number; t0?: number; kept?: boolean }) {
  const dot = Math.min(4.4, (Math.PI * r) / n / 1.25)
  const pts = range(n).map(i => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2
    return ring(cx + r * Math.cos(a), cy + r * Math.sin(a), dot)
  })
  return (
    <>
      <Ink d={ring(cx, cy, r - 14)} t0={t0} dur={700} kept={kept} class="vc-soft vc-thin" />
      <Ink d={pts.slice(count).join('')} t0={t0 + 200} dur={700} kept={kept} class="vc-thin" />
      {count ? (
        <Fade t0={kept ? 0 : t0 + 500} kept={kept} class="vc-count">
          <path class="vc-solid-count" d={pts.slice(0, count).join('')} />
        </Fade>
      ) : null}
    </>
  )
}

/** Les deux sens de l'argent entre la France et le budget européen : en haut, ce qu'elle verse ; en bas, ce qu'elle
 *  reçoit. Les deux flèches ont la même taille (le dessin ne dit pas les montants) */
function echanges(p: P, top: Cue | null, bottom: Cue | null) {
  const france = said(p, /la France/)
  const budget = said(p, /budget européen/)
  return (
    <Art h={142}>
      <Picto n="carte_france" x={0} y={20} size={84} t0={100} />
      {france ? <Txt x={40} y={124} text={france} size={14} tone="soft" t0={500} /> : null}
      <Picto n="tirelire" x={214} y={24} size={80} t0={400} />
      {budget ? <Txt x={254} y={118} text={budget} max={9} size={14} tone="soft" t0={700} /> : null}
      <Arrow x1={92} y1={50} x2={206} y2={50} t0={800} />
      <Arrow x1={206} y1={86} x2={92} y2={86} t0={1000} />
      {top?.shown ? <Txt x={149} y={38} text={top.text} max={16} up size={14} t0={200} /> : null}
      {bottom?.shown ? <Txt x={149} y={106} text={bottom.text} max={16} size={14} t0={200} /> : null}
    </Art>
  )
}

/** Les valeurs de référence dites dans la vidéo (« 3 % du PIB… 60 % pour la dette ») : déficit, dette */
function references(p: P): { def: number; dette: number } | null {
  const say = p.script.segments.map(s => plain(s.say)).find(s => /valeurs? de référence/.test(s) && /dette de \d+/.test(s))
  const def = num(/déficit public de (\d+(?:,\d+)?) %/.exec(say ?? '')?.[1])
  const dette = num(/dette de (\d+(?:,\d+)?) %/.exec(say ?? '')?.[1])
  return def && dette ? { def, dette } : null
}

/** Cent cases (une richesse produite en un an), dont les « k » dernières comptées */
function Grille({ x, y, k, shown, size = 10.6, gap = 1.6, t0 = 0, kept }: { x: number; y: number; k: number; shown: boolean; size?: number; gap?: number; t0?: number; kept?: boolean }) {
  return <Cases n={100} cols={10} x={x} y={y} size={size} gap={gap} count={shown ? range(Math.round(k)).map(i => 99 - i) : []} t0={t0} kept={kept} stagger={6} solid />
}

/* ——— Introduction ——— */

/** 01 Des euros, un fournisseur d'électricité : derrière, des règles européennes ; qui les décide ? */
const intro01: Board = p => {
  const eur = word(p, /euros/)
  const elec = word(p, /électricité/)
  const regles = word(p, /règles européennes/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={168}>
        <Signe n="portemonnaie" cx={44} y={0} size={52} label={eur?.text} shown={!!eur?.shown} t0={150} />
        {elec?.shown ? <Signe n="compteur" cx={44} y={90} size={52} label={elec.text} t0={0} /> : null}
        {regles?.shown ? (
          <>
            <Arrow x1={92} y1={28} x2={176} y2={62} dash t0={0} />
            <Arrow x1={92} y1={116} x2={176} y2={94} dash t0={200} />
            <Picto n="document" x={180} y={36} size={84} t0={300} />
            <Txt x={222} y={140} text={regles.text} max={12} size={14} t0={800} />
          </>
        ) : null}
        <Ask x={258} y={0} h={44} t0={2200} />
      </Art>
    </Seg>
  )
}

/** 02 452 millions d'habitants, dont 69,1 millions en France : un peu plus de 15 sur 100 */
const intro02: Board = p => {
  const cue = cueOf(p, 1)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n !== 100) return null
  const more = /un peu plus de/.test(plain(p.segment.say))
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={r.k} high={more ? r.k + 1 : r.k} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 03 Majorité qualifiée ou unanimité : 27 cases, une par État ; une majorité se colore, puis toutes, sauf le veto */
const intro03: Board = p => {
  const [qm, un] = cuesOf(p)
  const veto = word(p, /droit de veto/)
  const n = num(said(p, /\d+ États/))
  const k = num(/au moins (\d+)/.exec(p.segment.alt ?? '')?.[1])
  if (!qm || !un || !n || !k || n > 40 || k >= n) return null
  const cols = 9
  const size = 13.5
  const gap = 3
  const gw = cols * size + (cols - 1) * gap
  const xR = W - gw
  const y = 30
  const v = { x: xR + ((n - 1) % cols) * (size + gap), y: y + Math.floor((n - 1) / cols) * (size + gap) }
  return (
    <Seg>
      <Art h={124}>
        {qm.shown ? <Txt x={gw / 2} y={18} text={qm.text} size={14} max={22} /> : null}
        <Cases n={n} cols={cols} x={0} y={y} size={size} gap={gap} count={qm.shown ? range(k) : []} t0={200} />
        {un.shown ? <Txt x={xR + gw / 2} y={18} text={un.text} size={14} /> : null}
        <Cases n={n} cols={cols} x={xR} y={y} size={size} gap={gap} count={un.shown ? range(n - 1) : []} t0={500} />
        {veto?.shown ? (
          <>
            <Ink d={`M${v.x - 3} ${v.y - 3}l${size + 6} ${size + 6}M${v.x + size + 3} ${v.y - 3}l${-size - 6} ${size + 6}`} t0={0} dur={400} class="vc-bold" />
            <Arrow x1={v.x + size / 2 - 30} y1={y + 82} x2={v.x + size / 2 - 4} y2={v.y + size + 6} t0={300} head={6} />
            <Txt x={v.x + size / 2 - 34} y={y + 92} text={veto.text} size={14} anchor="end" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Un budget fixé pour sept ans, de 2028 à 2034 : sept cases d'années, une accolade */
const intro04: Board = p => {
  const sept = cueOf(p, 0)
  const [a, b] = yearsOf(p.segment.say)
  if (!a || !b || b <= a || b - a > 9) return null
  const n = b - a + 1
  const size = 32
  const gap = 6
  const w = n * size + (n - 1) * gap
  const x0 = (W - w) / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={112}>
        <Cases n={n} cols={n} x={x0} y={4} size={size} gap={gap} t0={300} stagger={90} />
        <Txt x={x0 + size / 2} y={58} text={String(a)} size={14} tone="soft" t0={700} />
        <Txt x={x0 + w - size / 2} y={58} text={String(b)} size={14} tone="soft" t0={900} />
        <Brace x1={x0} y1={68} x2={x0 + w} y2={68} t0={1100} tone={sept?.shown ? 'count' : undefined} />
        {sept?.shown ? <Txt x={W / 2} y={104} text={sept.text} size={18} big tone="count" t0={1200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Premier bénéficiaire en volume, et deuxième contributeur net : les deux sens de l'argent */
const intro05: Board = p => {
  const [benef, contrib] = cuesOf(p)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {echanges(p, contrib ?? null, benef ?? null)}
      <Src p={p} />
    </Seg>
  )
}

/** 06 Le marché unique : une loupe sur deux entreprises qui se rapprochent ; d'anciens monopoles ouverts */
const intro06: Board = p => {
  const [fus, conc] = cuesOf(p)
  const mono = word(p, /anciens monopoles publics/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={160}>
        <Picto n="immeuble" x={8} y={58} size={64} t0={100} />
        <Picto n="immeuble" x={66} y={58} size={64} t0={300} />
        {fus?.shown ? <Picto n="loupe" x={40} y={2} size={56} tone="count" t0={0} /> : null}
        <Ink d="M150 30V140" t0={500} dur={500} class="vc-soft vc-thin" />
        {conc?.shown ? (
          <>
            <Picto n="compteur" x={168} y={64} size={50} t0={0} />
            <Trait d={TRAIN} x={226} y={58} s={62} thin={[1, 3]} t0={300} />
            {mono ? <Txt x={228} y={140} text={mono.text} max={18} size={14} t0={600} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** Les pictogrammes des cinq questions (et des cinq vidéos qui suivent) */
const QUESTIONS: [RegExp, PictoName][] = [
  [/décider/, 'document'],
  [/construction/, 'grue'],
  [/financ/, 'tirelire'],
  [/budgets des États|déficit/, 'pieces'],
  [/concurrence/, 'mallette'],
]

/** 07 Les cinq questions du thème, chacune avec son pictogramme, quand la voix la pose */
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

/** 08 Les cinq sujets des vidéos qui suivent : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Unanimité ou majorité ——— */

/** Le rapport « 15 sur 27 » dit dans la vidéo : la majorité qualifiée, et le nombre d'États */
const majorite = (p: P) => ratioOf(said(p, /\d+ sur \d+/))

/** 01 L'accord de tous les États, ou celui d'une majorité ? Deux tables : toutes les places, une majorité */
const decider01: Board = p => {
  const [all, maj] = cuesOf(p)
  const r = majorite(p)
  if (!all || !maj || !r) return null
  return (
    <Seg>
      <Art h={164}>
        <Table cx={62} cy={66} r={54} n={r.n} count={all.shown ? r.n : 0} t0={100} />
        <Table cx={238} cy={66} r={54} n={r.n} count={maj.shown ? r.k : 0} t0={400} />
        <Ask x={136} y={42} h={48} t0={1600} />
        {all.shown ? <Txt x={62} y={156} text={all.text} size={15} t0={300} /> : null}
        {maj.shown ? <Txt x={238} y={156} text={maj.text} size={15} t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 La majorité qualifiée : 15 États sur 27, et 65 % de la population */
const decider02: Board = p => {
  const [st, pop] = cuesOf(p)
  const r = ratioOf(st?.text)
  const pct = num(pop?.text)
  const etats = word(p, /des États/)
  const popW = word(p, /la population/)
  if (!st || !pop || !r || !pct || r.n > 40 || pct > 100) return null
  const gap = 2
  const size = (W - 16 - (r.n - 1) * gap) / r.n
  const w = r.n * size + (r.n - 1) * gap
  const x0 = (W - w) / 2
  const by = 70
  const bh = 16
  const X = (v: number) => x0 + (v / 100) * w
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={by + bh + 30}>
        {etats ? <Txt x={x0} y={14} text={etats.text} anchor="start" size={14} tone="soft" /> : null}
        <Cases n={r.n} cols={r.n} x={x0} y={22} size={size} gap={gap} count={st.shown ? range(r.k) : []} t0={200} solid />
        {st.shown ? <Txt x={x0 + w} y={15} text={st.text} anchor="end" size={17} big tone="count" t0={300} /> : null}
        {popW ? <Txt x={x0} y={by - 8} text={popW.text} anchor="start" size={14} tone="soft" t0={600} /> : null}
        <Ink d={`M${x0} ${by}H${x0 + w}V${by + bh}H${x0}Z`} t0={600} dur={700} />
        {pop.shown ? (
          <>
            <Fade t0={100} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={by} width={X(pct) - x0} height={bh} />
              <path d={`M${X(pct)} ${by - 6}V${by + bh + 6}`} />
            </Fade>
            <Txt x={X(pct)} y={by + bh + 26} text={pop.text} size={17} big tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Le pictogramme d'un domaine où l'unanimité est exigée */
const DOMAINES: [RegExp, PictoName][] = [
  [/budget/, 'pieces'],
  [/entrée|pays/, 'porte'],
  [/traité/, 'document'],
  [/impôt/, 'billet'],
]

/** 03 Les domaines de l'unanimité : quatre pictogrammes légendés, chacun quand la voix le nomme */
const decider03: Board = p => {
  const list = listAfterColon(p.segment.say)
  if (list.length < 2) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Panel cols={2} items={list.map(l => ({ picto: DOMAINES.find(([re]) => re.test(l))?.[1] ?? 'document', text: l, shown: heard(p, l.split(' ').slice(0, 2).join(' ')) }))} />
    </Seg>
  )
}

/** 04 Les deux faces de l'unanimité : un cadenas (rien n'est imposé), une barrière (un seul peut bloquer) */
const decider04: Board = p => {
  const a = word(p, /aucun État ne se voit imposer une décision/)
  const b = word(p, /un seul État peut la bloquer/)
  if (!a || !b) return null
  const bal = balance({
    left: (cx, base) => <Picto n="cadenas" x={cx - 26} y={base - 54} size={52} t0={0} />,
    right: (cx, base) => <Barriere x={cx + 20} y={base} s={1.15} t0={0} />,
    labels: [a.text, b.text],
    shown: [a.shown, b.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 05 Les clauses passerelles : un pont de l'unanimité à la majorité qualifiée, fermé par un cadenas */
const decider05: Board = p => {
  const un = word(p, /unanimité/)
  const maj = word(p, /majorité qualifiée/)
  const lock = word(p, /l’unanimité pour les activer|l'unanimité pour les activer/)
  const n = num(firstWord(said(p, /\S+ «[\s\u00a0]*clauses passerelles/)))
  const q = (s: number, y0: number, y1: number) => ({ x: 84 + 132 * s, y: (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * y1 + s * s * y0 })
  const hangers = range(n && n < 12 ? n : 0)
    .map(i => {
      const s = (i + 1) / ((n ?? 0) + 1)
      const a = q(s, 96, 64)
      const b = q(s, 76, 44)
      return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`
    })
    .join('')
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Ink d="M4 96H84V146M216 146V96H296" t0={100} dur={800} />
        <Ink d="M84 96Q150 64 216 96" t0={600} dur={700} class="vc-bold" />
        <Ink d="M84 76Q150 44 216 76" t0={900} dur={700} class="vc-thin" />
        {hangers ? <Ink d={hangers} t0={1300} dur={500} class="vc-thin" /> : null}
        {un?.shown ? <Txt x={44} y={122} text={un.text} size={14} t0={0} /> : null}
        {maj?.shown ? <Txt x={256} y={118} text={maj.text} max={10} size={14} t0={200} /> : null}
        {lock?.shown ? <Picto n="cadenas" x={56} y={44} size={44} tone="count" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 La coopération renforcée : neuf États avancent ensemble, leurs places laissées en pointillé */
const decider06: Board = p => {
  const cue = cueOf(p, 0)
  const k = num(firstWord(cue?.text))
  const r = majorite(p)
  const parquet = word(p, /le Parquet européen/)
  if (!cue || !k || !r || k >= r.n || k > 12) return null
  const cols = k
  const size = 22
  const gap = 6
  const w = cols * size + (cols - 1) * gap
  const x0 = (W - w) / 2
  const y0 = 50
  const rest = r.n - k
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={parquet ? 168 : 140}>
        {cue.shown ? (
          <>
            <Cases n={k} cols={cols} x={x0} y={y0} size={size} gap={gap} ghost={range(k)} kept />
            <g class="vc-slide-y" style={{ '--from': `${y0 - 4}px`, '--d': '200ms', '--t': '900ms' }}>
              <Cases n={k} cols={cols} x={x0} y={4} size={size} gap={gap} count={range(k)} kept />
            </g>
          </>
        ) : (
          <Cases n={k} cols={cols} x={x0} y={y0} size={size} gap={gap} t0={100} />
        )}
        <Cases n={rest} cols={cols} x={x0} y={y0 + size + gap} size={size} gap={gap} t0={300} />
        {parquet?.shown ? <Txt x={W / 2} y={162} text={parquet.text} size={15} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 « À l'unanimité ou à la majorité ? » : les deux tables du début, et la question */
const decider07: Board = p => {
  const [un, maj] = cuesOf(p)
  const r = majorite(p)
  if (!r) return null
  return (
    <Seg kind="ask">
      <Art h={132}>
        <Table cx={60} cy={56} r={46} n={r.n} count={r.n} kept />
        <Table cx={240} cy={56} r={46} n={r.n} count={r.k} kept />
        <Ask x={136} y={30} h={52} t0={400} />
        {un ? <Txt x={60} y={128} text={un.text} size={14} tone="soft" kept /> : null}
        {maj ? <Txt x={240} y={128} text={maj.text} size={14} tone="soft" kept /> : null}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Traités ——— */

/** 01 L'Union repose sur des traités : un édifice posé sur une pile de textes ; peut-on les changer ? */
const traites01: Board = p => {
  const tr = word(p, /des traités/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={156}>
        <Ink d="M84 92H216V104H84ZM78 106H222V118H78ZM72 120H228V132H72Z" t0={100} dur={900} />
        <Ink d="M96 98H170M90 112H186M84 126H160" t0={700} dur={500} class="vc-thin vc-soft" />
        <Picto n="monument" x={102} y={0} size={96} t0={900} />
        {tr?.shown ? <Txt x={W / 2} y={152} text={tr.text} size={15} tone="soft" t0={300} /> : null}
        <Ask x={246} y={14} h={58} t0={1700} />
      </Art>
    </Seg>
  )
}

/** 02 Réviser un traité : l'accord de tous les États, puis une ratification, par un Parlement ou par référendum */
const traites02: Board = p => {
  const [tous, refe] = cuesOf(p)
  const n = num(said(p, /sur \d+/))
  const parl = word(p, /son Parlement/)
  const ou = word(p, /\bou\b/)
  const rat = word(p, /ratifier/)
  if (!tous || !refe || !n || n > 40) return null
  const cols = 9
  return (
    <Seg>
      <Art h={192}>
        {tous.shown ? <Txt x={72} y={16} text={tous.text} size={15} /> : null}
        <Cases n={n} cols={cols} x={6} y={26} size={12} gap={3} count={tous.shown ? range(n) : []} t0={100} stagger={15} />
        <Arrow x1={146} y1={46} x2={182} y2={46} t0={900} />
        <Picto n="document" x={186} y={4} size={72} t0={1000} />
        {rat?.shown ? (
          <>
            <Arrow x1={204} y1={80} x2={110} y2={112} t0={0} />
            <Arrow x1={228} y1={80} x2={232} y2={108} t0={150} />
            <Picto n="monument" x={46} y={110} size={58} t0={300} />
            {parl ? <Txt x={75} y={186} text={parl.text} size={14} t0={500} /> : null}
            {ou ? <Txt x={152} y={150} text={ou.text} size={15} tone="soft" t0={600} /> : null}
          </>
        ) : null}
        {refe.shown ? (
          <>
            <Trait d={URNE} x={203} y={110} s={58} thin={[3]} t0={0} />
            <Txt x={232} y={186} text={refe.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 La convention demandée en 2022, toujours pas convoquée : une demande qui attend devant une porte */
const traites03: Board = p => {
  const [conv, pas] = cuesOf(p)
  const year = yearsOf(p.segment.say)[0]
  const today = word(p, /À ce jour/)
  if (!conv || !year) return null
  const f = frise({ y: 124, from: year - 1, to: year + 5, x0: 16, x1: 284, ticks: [year], labels: [year], t0: 100 })
  const x = f.X(year)
  return (
    <Seg>
      <Art h={154}>
        {f.el}
        <Ink d={`M${x} 118v12`} t0={300} dur={200} class="vc-bold" />
        <Picto n="document" x={x - 30} y={36} size={60} t0={400} />
        {conv.shown ? <Txt x={x + 8} y={24} text={conv.text} size={15} t0={300} /> : null}
        {pas?.shown || today?.shown ? (
          <>
            <Arrow x1={x + 30} y1={74} x2={216} y2={74} dash t0={0} />
            <Picto n="porte" x={220} y={30} size={68} t0={300} />
            {today ? <Txt x={256} y={22} text={today.text} size={14} tone="soft" t0={400} /> : null}
          </>
        ) : null}
        {pas?.shown ? <Txt x={290} y={110} text={pas.text} size={15} anchor="end" tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Le vote du Parlement européen : pour, contre, abstentions, trois barres à la même échelle */
const traites04: Board = p => {
  const ss = sentencesOf(p.segment.say)
  const vals = nums(plain(ss[ss.length - 1] ?? ''))
  const labels = [/voix pour/, /contre/, /abstentions/].map(re => word(p, re)?.text)
  const [a, b] = cuesOf(p)
  if (vals.length !== 3 || !a || !b) return null
  const shown = [a.shown, b.shown, heard(p, 'abstentions')]
  const g = barres({
    items: vals.map((v, i) => ({ label: labels[i], value: v, text: String(v), shown: shown[i] })),
    size: 20,
    gap: 26,
    room: 58,
    labelSize: 14,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 L'Irlande : un premier « non », des garanties, un second référendum ; le traité ratifié */
const traites05: Board = p => {
  const [gar, second] = cuesOf(p)
  const non = word(p, /premier « non »/)
  const mot = word(p, /« non »/)
  if (!gar || !second || !non) return null
  return (
    <Seg>
      <Art h={182}>
        <Ink d="M10 136H290" t0={0} dur={700} class="vc-soft" />
        {non.shown ? (
          <>
            <Trait d={URNE} x={22} y={66} s={60} thin={[3]} t0={0} />
            {mot ? <Txt x={52} y={56} text={mot.text} size={16} big t0={500} /> : null}
            <Txt x={52} y={160} text={non.text} size={14} t0={300} />
          </>
        ) : null}
        {gar.shown ? (
          <>
            <Arrow x1={90} y1={100} x2={118} y2={100} t0={0} />
            <Picto n="document" x={124} y={64} size={60} t0={200} />
            <Txt x={150} y={160} text={gar.text} size={14} t0={500} />
          </>
        ) : null}
        {second.shown ? (
          <>
            <Arrow x1={184} y1={100} x2={212} y2={100} t0={0} />
            <Trait d={URNE} x={218} y={66} s={60} thin={[3]} t0={200} />
            <Ink d="M236 40l8 8l16-20" t0={900} dur={400} class="vc-bold" />
            <Txt x={248} y={160} text={second.text} max={10} size={14} t0={500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 21 États sur 27 ont adopté l'euro : 27 pièces, 21 comptées ; une flèche vers le Danemark */
const traites06: Board = p => {
  const [cue, dk] = cuesOf(p)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 40) return null
  const cols = 9
  const { cells, h } = rangCells({ n: r.n, cols, max: 26, gap: 6, y: 4 })
  const c = cells[r.k]
  if (!c) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 40}>
        <Rang n={r.n} picto="piece" cols={cols} max={26} gap={6} y={4} count={range(r.k)} shown={cue.shown} t0={200} stagger={40} />
        {dk?.shown ? (
          <>
            <Arrow x1={c.x + c.size / 2 + 26} y1={h + 22} x2={c.x + c.size / 2 + 2} y2={c.y + c.size + 4} t0={0} head={6} />
            <Txt x={c.x + c.size / 2 + 30} y={h + 34} text={dk.text} size={15} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Quelle direction donner à la construction européenne ? » : une grue au-dessus de l'édifice */
const traites07: Board = p => (
  <Seg kind="ask">
    <Art h={116}>
      <Ink d="M10 110H214" t0={0} dur={600} class="vc-soft" />
      <Picto n="monument" x={28} y={44} size={72} t0={100} />
      <Picto n="grue" x={104} y={6} size={104} t0={500} />
      <Ask x={234} y={22} h={64} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Budget ——— */

/** Le nombre d'années d'un budget (« fixé pour sept ans ») */
const annees = (p: P) => num(firstWord(said(p, /\S+ ans\b/)))

/** 01 Un budget fixé pour sept ans : une tirelire sur sept cases d'années ; qui le paie ? */
const budget01: Board = p => {
  const sept = word(p, /\S+ ans\b/)
  const n = num(firstWord(sept?.text))
  if (!n || n > 10) return null
  const size = 30
  const gap = 6
  const w = n * size + (n - 1) * gap
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={154}>
        <Picto n="tirelire" x={98} y={4} size={92} t0={100} />
        <Cases n={n} cols={n} x={(W - w) / 2} y={100} size={size} gap={gap} t0={700} stagger={80} />
        {sept?.shown ? <Txt x={W / 2} y={150} text={sept.text} size={14} tone="soft" t0={300} /> : null}
        <Ask x={232} y={8} h={54} t0={1500} />
      </Art>
    </Seg>
  )
}

/** 02 1 763 milliards pour 2028-2034, 1,26 % du revenu national brut : le graphique de la fiche, en barres à la
 *  même échelle (le budget actuel à son adoption, la proposition, et sa part pour rembourser la relance) */
const budget02: Board = p => {
  const c = chartOf(p.segment)
  const pct = num(cueOf(p, 1)?.text)
  if (!c || c.kind !== 'compare') return null
  const g = barres({
    items: c.items.map(it => ({ label: it.label, value: it.value, text: `${fr(it.value)}\u00a0%`, tone: (it.value === pct ? 'count' : undefined) as Tone | undefined })),
    size: 18,
    gap: 28,
    room: 64,
    labelSize: 14,
    t0: 900,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Environ 60 à 70 % des ressources propres : cent pièces, soixante sûres, dix de plus en bleu clair */
const budget03: Board = p => {
  const cue = cueOf(p, 0)
  const m = /(\d+) à (\d+)/.exec(plain(cue?.text ?? ''))
  if (!cue || !m) return null
  const who = word(p, /Leurs contributions/)
  const what = word(p, /environ \d+ à \d+ % des ressources propres/)
  const states = word(p, /L’argent vient surtout des États|L'argent vient surtout des États/)
  return (
    <Seg>
      <Head lines={[states ? { text: states.text, shown: states.shown } : null]} />
      <Sur100 p={p} kind="piece" low={Number(m[1])} high={Number(m[2])} caption={who && what ? `${who.text}\u00a0: ${what.text}` : sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
    </Seg>
  )
}

/** Le petit dessin d'une ressource proposée */
function ressource(l: string, x: number, y: number, s: number) {
  if (/carbone/.test(l)) return <Trait d={USINE} x={x} y={y} s={s} thin={[2]} />
  if (/tabac/.test(l)) return <Trait d={CIGARETTE} x={x} y={y} s={s} thin={[2]} />
  if (/électronique/.test(l)) return <Trait d={ECRAN} x={x} y={y} s={s} thin={[2]} />
  return <Picto n="immeuble" x={x} y={y} size={s} />
}

/** 04 Un impôt européen exige l'unanimité (un billet sous cadenas) ; les ressources proposées en juillet 2025 */
const budget04: Board = p => {
  const [imp, una] = cuesOf(p)
  const list = listAfterColon(p.segment.say)
  if (!imp || list.length < 2 || list.length > 5) return null
  const pitch = W / list.length
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={166}>
        <Picto n="billet" x={92} y={0} size={72} t0={100} />
        {una?.shown ? <Picto n="cadenas" x={168} y={4} size={46} tone="count" t0={0} /> : null}
        {list.map((l, i) => {
          const cx = pitch * (i + 0.5)
          return heard(p, l.split(' ')[0]) ? (
            <g key={l}>
              {ressource(l, cx - 22, 76, 44)}
              <Txt x={cx} y={142} text={l} max={11} size={13} t0={300} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 05 Le plan de relance : emprunté sur les marchés, remboursé chaque année de 2028 à 2034 */
const budget05: Board = p => {
  const [emp, rem] = cuesOf(p)
  const marches = word(p, /les marchés financiers/)
  const relance = word(p, /plan de relance/)
  const parAn = word(p, /par an/)
  const ys = yearsOf(p.segment.say)
  const a = ys[ys.length - 2]
  const b = ys[ys.length - 1]
  if (!emp || !rem || !a || !b || b <= a || b - a > 9) return null
  const n = b - a + 1
  const size = 30
  const gap = 6
  const w = n * size + (n - 1) * gap
  const x0 = (W - w) / 2
  return (
    <Seg>
      <Art h={196}>
        <Picto n="bourse" x={8} y={4} size={62} t0={100} />
        {marches ? <Txt x={40} y={86} text={marches.text} max={12} size={13} tone="soft" t0={300} /> : null}
        <Picto n="tirelire" x={188} y={0} size={78} t0={400} />
        {relance ? <Txt x={228} y={86} text={relance.text} size={13} tone="soft" t0={600} /> : null}
        {emp.shown ? (
          <>
            <Arrow x1={78} y1={38} x2={182} y2={38} t0={0} tone="count" />
            {[0, 1, 2].map(i => (
              <Picto key={i} n="piece" x={98 + i * 24} y={14} size={18} tone="count" t0={200 + i * 150} w={0.8} />
            ))}
          </>
        ) : null}
        <Cases n={n} cols={n} x={x0} y={114} size={size} gap={gap} t0={800} stagger={60} />
        <Txt x={x0 + size / 2} y={164} text={String(a)} size={13} tone="soft" t0={900} />
        <Txt x={x0 + w - size / 2} y={164} text={String(b)} size={13} tone="soft" t0={900} />
        {rem.shown ? (
          <>
            {range(n).map(i => (
              <Picto key={i} n="piece" x={x0 + i * (size + gap) + 5} y={119} size={20} tone="count" t0={100 + i * 90} w={0.8} />
            ))}
            <Txt x={W / 2} y={190} text={parAn ? `${rem.text} ${parAn.text}` : rem.text} size={15} tone="count" t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Ce que la France reçoit : 16,5 milliards, dont 58 % pour la politique agricole commune ; 22e par habitant */
const budget06: Board = p => {
  const [rec, pct, rang] = cuesOf(p)
  const part = (num(pct?.text) ?? 0) / 100
  const pac = word(p, /la politique agricole commune/)
  const prem = word(p, /Premier bénéficiaire en volume/)
  if (!rec || !pct || !part || part >= 1) return null
  return (
    <Seg>
      <Head lines={[lineOf(rec)]} />
      <Art h={172}>
        <Disque cx={80} cy={86} r={76} part={part} shown={pct.shown} t0={200} />
        {pct.shown ? (
          <>
            <Txt x={174} y={34} text={pct.text} size={24} big anchor="start" tone="count" t0={300} />
            {pac ? <Txt x={174} y={56} text={pac.text} max={16} size={14} anchor="start" t0={500} /> : null}
          </>
        ) : null}
        {prem?.shown ? <Txt x={174} y={112} text={prem.text} max={16} size={13} anchor="start" tone="soft" t0={0} /> : null}
        {rang?.shown ? <Txt x={174} y={164} text={rang.text} size={16} anchor="start" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Ce qu'elle verse : 7,9 milliards de plus qu'elle ne reçoit ; deuxième contributeur net */
const budget07: Board = p => {
  const contrib = word(p, /sa contribution/)
  const recu = word(p, /reçu/)
  const net = cueOf(p, 1)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {echanges(p, contrib, recu)}
      {net ? <Note p={p} text={sentenceWith(p.segment.say, net.text)} /> : null}
      <Src p={p} />
    </Seg>
  )
}

/** 08 Cinq pays ont un rabais : cinq étiquettes, chacune avec son pays, quand la voix le nomme */
const budget08: Board = p => {
  const cinq = cueOf(p, 0)
  const list = listAfterColon(sentencesOf(p.segment.say)[0] ?? '')
  const n = num(firstWord(cinq?.text))
  if (!cinq || list.length < 2 || list.length > 6 || (n && n !== list.length)) return null
  const rows = Math.ceil(list.length / 2)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={rows * 36}>
        {list.map((l, i) => {
          const col = i < rows ? 0 : 1
          const row = col ? i - rows : i
          const x = 14 + col * 150
          const y = row * 36
          return heard(p, l) ? (
            <g key={l}>
              <Picto n="etiquette" x={x} y={y} size={32} t0={0} />
              <Txt x={x + 40} y={y + 22} text={l} size={15} anchor="start" t0={200} />
            </g>
          ) : null
        })}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 « Quelle taille pour le budget européen, et qui doit le financer ? » : la tirelire sur ses sept années */
const budget09: Board = p => {
  const n = annees(p)
  if (!n || n > 10) return null
  const size = 24
  const gap = 4
  const w = n * size + (n - 1) * gap
  return (
    <Seg kind="ask">
      <Art h={116}>
        <Picto n="tirelire" x={10 + w / 2 - 40} y={0} size={80} t0={100} />
        <Cases n={n} cols={n} x={10} y={88} size={size} gap={gap} t0={500} stagger={60} />
        <Ask x={232} y={20} h={64} t0={1200} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Règles sur les budgets des États ——— */

/** 01 Dépenser plus qu'on ne perçoit ? Deux piles, recettes et dépenses, la seconde plus haute */
const deficits01: Board = p => {
  const base = 128
  const col = (x: number, h: number) => `M${x} ${base}V${base - h}H${x + 52}V${base}`
  const bands = (x: number, h: number) => range(Math.floor(h / 12)).map(k => `M${x} ${base - 12 * (k + 1)}h52`).join('')
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={154}>
        <Ink d={`M14 ${base}H214`} t0={0} dur={500} class="vc-soft" />
        <Ink d={col(42, 76)} t0={200} dur={700} />
        <Ink d={bands(42, 76)} t0={600} dur={500} class="vc-thin vc-soft" />
        <Ink d={col(130, 112)} t0={500} dur={700} />
        <Ink d={bands(130, 112)} t0={900} dur={500} class="vc-thin vc-soft" />
        <Txt x={68} y={base + 22} text="recettes" size={15} t0={700} />
        <Txt x={156} y={base + 22} text="dépenses" size={15} t0={1000} />
        <Ask x={238} y={22} h={58} t0={1500} />
      </Art>
    </Seg>
  )
}

/** 02 Deux valeurs de référence, en part du PIB : 3 % pour le déficit, 60 % pour la dette ; cent cases chacune */
const deficits02: Board = p => {
  const [d, de] = cuesOf(p)
  const vd = num(d?.text)
  const vde = num(de?.text)
  const ldef = word(p, /déficit public/)
  const ldet = word(p, /dette/)
  const pib = word(p, /PIB/)
  const richesse = word(p, /la richesse produite en un an/)
  if (!d || !de || !vd || !vde || vd > 100 || vde > 100) return null
  const gw = 10 * 10.6 + 9 * 1.6
  const xl = 75 - gw / 2
  const xr = 225 - gw / 2
  return (
    <Seg>
      <Art h={200}>
        {ldef ? <Txt x={75} y={18} text={ldef.text} size={14} /> : null}
        {ldet ? <Txt x={225} y={18} text={ldet.text} size={14} /> : null}
        <Grille x={xl} y={28} k={vd} shown={d.shown} t0={100} />
        <Grille x={xr} y={28} k={vde} shown={de.shown} t0={300} />
        {d.shown ? <Txt x={75} y={174} text={d.text} size={22} big tone="count" t0={200} /> : null}
        {de.shown ? <Txt x={225} y={174} text={de.text} size={22} big tone="count" t0={200} /> : null}
        {pib && richesse?.shown ? <Txt x={W / 2} y={196} text={`${pib.text}\u00a0: ${richesse.text}`} size={13} tone="soft" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Au-delà, une trajectoire de dépenses sur quatre ou cinq ans, jusqu'à sept : un chemin sur une frise */
const deficits03: Board = p => {
  const sept = cueOf(p, 1)
  const q = word(p, /quatre ou cinq ans/)
  const n = num(firstWord(sept?.text))
  const parts = (q?.text ?? '').split(/[\s\u00a0]+/)
  const a = num(parts[0])
  const b = num(parts[2])
  if (!sept || !q || !n || !a || !b || b >= n || n > 12) return null
  const f = frise({ y: 104, from: 0, to: n, x0: 20, x1: 280, ticks: range(n + 1), t0: 100 })
  // Un chemin plat : le dessin ne dit pas si les dépenses montent ou baissent, seulement leur durée
  const ty = 66
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={150}>
        {f.el}
        <Ink d={`M${f.X(0)} ${ty}L${f.X(b)} ${ty}`} t0={600} dur={900} class="vc-bold" />
        <Ink d={`M${f.X(a)} ${ty - 8}v16M${f.X(b)} ${ty - 8}v16`} t0={1400} dur={200} />
        <Brace x1={f.X(0)} y1={114} x2={f.X(b)} y2={114} t0={1500} />
        <Txt x={(f.X(0) + f.X(b)) / 2} y={146} text={q.text} size={14} t0={1700} />
        {sept.shown ? (
          <>
            <Fade t0={0} class="vc-count vc-dash">
              <path d={`M${f.X(b)} ${ty}L${f.X(n)} ${ty}`} />
            </Fade>
            <Ink d={`M${f.X(n)} ${ty}h.5`} t0={300} dur={100} class="vc-count vc-dot" />
            <Txt x={f.X(n)} y={ty - 16} text={sept.text} size={16} anchor="end" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Le déficit de la France, 5,1 % du PIB, face à la valeur de référence de 3 % : deux barres, même échelle */
const deficits04: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const ref = references(p)
  const lref = said(p, /valeur de référence/)
  const fr = word(p, /la France/)
  if (!cue || !v || !ref) return null
  const g = barres({
    items: [
      { label: lref ?? undefined, value: ref.def, text: `${String(ref.def).replace('.', ',')}\u00a0%` },
      { label: fr?.text, value: v, text: cue.text, tone: 'count', shown: cue.shown },
    ],
    size: 22,
    gap: 30,
    room: 70,
    labelSize: 14,
    t0: 600,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 La dette de la France, 115,7 % du PIB, face à la valeur de référence de 60 % : deux barres, même échelle */
const deficits05: Board = p => {
  const [dette, ref] = cuesOf(p)
  const vd = num(dette?.text)
  const vr = num(ref?.text)
  const lref = word(p, /valeur de référence/)
  const fr = said(p, /la France/)
  const titre = word(p, /dette publique/)
  if (!dette || !ref || !vd || !vr) return null
  const g = barres({
    items: [
      { label: lref?.text, value: vr, text: ref.text, shown: ref.shown },
      { label: fr ?? undefined, value: vd, text: dette.text, tone: 'count', shown: dette.shown },
    ],
    y: 34,
    size: 28,
    gap: 32,
    room: 84,
    labelSize: 14,
    t0: 200,
  })
  return (
    <Seg>
      <Art h={34 + g.h + 6}>
        {titre ? <Txt x={0} y={16} text={titre.text} size={16} anchor="start" /> : null}
        {g.el}
      </Art>
    </Seg>
  )
}

/** 06 « Quelles règles communes pour les budgets des États ? » : les deux grilles de cent cases, et la question */
const deficits06: Board = p => {
  const ref = references(p)
  if (!ref) return null
  const s = 7
  const gap = 1.2
  const gw = 10 * s + 9 * gap
  return (
    <Seg kind="ask">
      <Art h={100}>
        <Grille x={30} y={8} k={ref.def} shown size={s} gap={gap} kept />
        <Grille x={30 + gw + 24} y={8} k={ref.dette} shown size={s} gap={gap} kept />
        <Ask x={236} y={14} h={64} t0={400} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Concurrence ——— */

/** 01 Deux grandes entreprises veulent fusionner : deux immeubles qui s'avancent ; librement ? */
const concurrence01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={116}>
      <Picto n="immeuble" x={4} y={22} size={90} t0={100} />
      <Picto n="immeuble" x={206} y={22} size={90} t0={400} />
      <Arrow x1={94} y1={66} x2={124} y2={66} t0={1000} />
      <Arrow x1={206} y1={66} x2={176} y2={66} t0={1000} />
      <Ask x={136} y={36} h={52} t0={1500} />
    </Art>
  </Seg>
)

/** 02 L'Union contrôle les fusions, les ententes, les aides publiques : une loupe sur trois petites scènes */
const concurrence02: Board = p => {
  const [fus, ent, aid] = [/les fusions/, /les ententes/, /les aides publiques/].map(re => word(p, re))
  const ctrl = cueOf(p, 0)
  const dom = cueOf(p, 1)
  if (!fus || !ent || !aid) return null
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={150}>
        {ctrl?.shown ? <Picto n="loupe" x={126} y={0} size={46} tone="count" t0={0} /> : null}
        {fus.shown ? (
          <>
            <Picto n="immeuble" x={14} y={54} size={44} t0={0} />
            <Picto n="immeuble" x={42} y={54} size={44} t0={150} />
            <Txt x={52} y={128} text={fus.text} max={12} size={13} t0={300} />
          </>
        ) : null}
        {ent.shown ? (
          <>
            <Picto n="immeuble" x={104} y={54} size={44} t0={0} />
            <Picto n="immeuble" x={152} y={54} size={44} t0={150} />
            <Fade t0={400} class="vc-dash">
              <path d="M126 64Q150 48 174 64" />
            </Fade>
            <Txt x={150} y={128} text={ent.text} max={12} size={13} t0={300} />
          </>
        ) : null}
        {aid.shown ? (
          <>
            <Picto n="immeuble" x={226} y={54} size={44} t0={0} />
            <Picto n="piece" x={228} y={34} size={16} t0={300} w={0.8} />
            <Picto n="piece" x={250} y={26} size={16} t0={450} w={0.8} />
            <Txt x={248} y={128} text={aid.text} max={12} size={13} t0={300} />
          </>
        ) : null}
      </Art>
      {dom ? <Note p={p} text={sentenceWith(p.segment.say, dom.text)} cues={[dom]} /> : null}
    </Seg>
  )
}

/** 03 33 fusions interdites sur 10 164 opérations : 1 sur 308, une case dans une grille de 308 */
const concurrence03: Board = p => {
  const cue = cueOf(p, 1)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.k !== 1 || r.n > 400) return null
  const cols = 28
  const size = 8
  const gap = 2
  const w = cols * size + (cols - 1) * gap
  const x0 = (W - w) / 2
  const pick = Math.floor(r.n / 2)
  const px = x0 + (pick % cols) * (size + gap) + size / 2
  const py = 4 + Math.floor(pick / cols) * (size + gap) + size / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={casesH(r.n, cols, size, gap) + 8}>
        <Cases n={r.n} cols={cols} x={x0} y={4} size={size} gap={gap} count={cue.shown ? [pick] : []} t0={200} stagger={3} solid />
        {cue.shown ? <Ink d={ring(px, py, 10)} t0={300} dur={500} class="vc-count vc-bold" /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le rachat d'Alstom par Siemens, interdit : deux trains face à face, séparés par une barrière */
const concurrence04: Board = p => {
  const a = word(p, /Alstom/)
  const s = word(p, /Siemens/)
  if (!a || !s) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={128}>
        <Trait d={TRAIN} x={14} y={10} s={84} thin={[1, 3]} t0={100} />
        <Trait d={TRAIN} x={202} y={10} s={84} thin={[1, 3]} t0={300} flip />
        <Barriere x={168} y={88} s={1.1} t0={900} />
        <Txt x={56} y={120} text={a.text} size={15} t0={600} />
        <Txt x={244} y={120} text={s.text} size={15} t0={800} />
      </Art>
    </Seg>
  )
}

/** 05 Depuis le 1er juillet 2007, vous choisissez votre fournisseur d'électricité et de gaz */
const concurrence05: Board = p => {
  const cue = cueOf(p, 0)
  const year = yearsOf(p.segment.say)[0]
  const el = word(p, /électricité/)
  const gaz = word(p, /gaz/)
  if (!year) return null
  const f = frise({ y: 128, from: year - 3, to: year + 3, x0: 16, x1: 284, ticks: [year], labels: [year], t0: 100 })
  const x = f.X(year)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={158}>
        {f.el}
        <Picto n="drapeau" x={x - 12} y={128 - 44} size={46} tone="count" t0={400} />
        {cue?.shown ? (
          <>
            <Picto n="personne" x={W / 2 - 22} y={0} size={44} t0={0} />
            <Arrow x1={W / 2 - 30} y1={28} x2={84} y2={28} dash t0={300} />
            <Arrow x1={W / 2 + 30} y1={28} x2={216} y2={28} dash t0={300} />
          </>
        ) : null}
        {el?.shown ? <Signe n="compteur" cx={48} y={2} size={52} label={el.text} t0={0} /> : null}
        {gaz?.shown ? <Signe n="radiateur" cx={252} y={2} size={52} label={gaz.text} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Électricité : 49 % des sites en offre de marché, le reste au tarif réglementé ; gaz : tout en offre de marché */
const concurrence06: Board = p => {
  const [pct, fin] = cuesOf(p)
  const v = num(pct?.text)
  const el = word(p, /Électricité/)
  const gaz = word(p, /gaz/)
  const marche = word(p, /offre de marché/)
  const tarif = word(p, /tarif réglementé/)
  if (!pct || !v || !el || !gaz || v >= 100) return null
  const x0 = 10
  const w = 280
  const X = (k: number) => x0 + (k / 100) * w
  const bar = (y: number, k: number, shown: boolean, t0: number) => (
    <>
      <Ink d={`M${x0} ${y}H${x0 + w}V${y + 24}H${x0}Z`} t0={t0} dur={700} />
      {shown ? (
        <Fade t0={t0 + 500} class="vc-count">
          <rect class="vc-tint-count" x={x0} y={y} width={X(k) - x0} height={24} />
          <path d={k < 100 ? `M${X(k)} ${y}V${y + 24}` : `M${x0} ${y}H${x0 + w}V${y + 24}H${x0}Z`} />
        </Fade>
      ) : null}
    </>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={142}>
        <Txt x={x0} y={14} text={el.text} size={15} anchor="start" />
        {bar(22, v, pct.shown, 200)}
        {pct.shown && marche ? <Txt x={X(v / 2)} y={66} text={marche.text} size={13} tone="count" t0={300} /> : null}
        {tarif?.shown ? <Txt x={X((v + 100) / 2)} y={66} text={tarif.text} size={13} tone="soft" t0={200} /> : null}
        {fin?.shown ? (
          <>
            <Txt x={x0} y={100} text={gaz.text.charAt(0).toUpperCase() + gaz.text.slice(1)} size={15} anchor="start" t0={0} />
            {bar(108, 100, true, 100)}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Près de 20 % de l'offre nationale attribuée après appel d'offres : un train de dix voitures, deux comptées */
const concurrence07: Board = p => {
  const cue = cueOf(p, 1)
  const v = num(cue?.text)
  if (!cue || !v || v >= 100) return null
  const n = 10
  const k = Math.round((v / 100) * n)
  const cw = 26
  const gap = 2
  const x0 = (W - n * cw - (n - 1) * gap) / 2
  const car = (i: number) => {
    const x = x0 + i * (cw + gap)
    return { box: `M${x} 8H${x + cw}V34H${x}Z`, win: `M${x + 5} 13h7v6h-7zM${x + 15} 13h6v6h-6z`, wheels: `${ring(x + 7, 39, 3.2)}${ring(x + cw - 7, 39, 3.2)}` }
  }
  const cars = range(n).map(car)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={52}>
        <Ink d={cars.map(c => c.box).join('')} t0={200} dur={900} />
        <Ink d={cars.map(c => c.win).join('')} t0={700} dur={500} class="vc-thin" />
        <Ink d={cars.map(c => c.wheels).join('')} t0={900} dur={400} class="vc-thin" />
        <Ink d={`M${x0 - 6} 46H${W - x0 + 6}`} t0={100} dur={600} class="vc-soft" />
        {cue.shown ? (
          <Fade t0={1200} class="vc-count">
            {range(k).map(i => (
              <g key={i}>
                <rect class="vc-tint-count" x={x0 + i * (cw + gap)} y={8} width={cw} height={26} />
                <path d={car(i).box} />
              </g>
            ))}
          </Fade>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Les règles sur les fusions, réexaminées ; « quelle place pour la concurrence ? » */
const concurrence08: Board = p => (
  <Seg kind="ask">
    <Art h={104}>
      <Picto n="document" x={60} y={0} size={96} t0={100} />
      <Picto n="loupe" x={104} y={30} size={64} tone="count" t0={700} />
      <Ask x={226} y={16} h={66} t0={1300} />
    </Art>
    <Note p={p} text={sentencesOf(p.segment.say)[0]} cues={[]} />
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const EUROPE: Record<string, Board> = {
  'europe-intro-01': intro01,
  'europe-intro-02': intro02,
  'europe-intro-03': intro03,
  'europe-intro-04': intro04,
  'europe-intro-05': intro05,
  'europe-intro-06': intro06,
  'europe-intro-07': intro07,
  'europe-intro-08': intro08,
  'europe-decider-01': decider01,
  'europe-decider-02': decider02,
  'europe-decider-03': decider03,
  'europe-decider-04': decider04,
  'europe-decider-05': decider05,
  'europe-decider-06': decider06,
  'europe-decider-07': decider07,
  'europe-traites-01': traites01,
  'europe-traites-02': traites02,
  'europe-traites-03': traites03,
  'europe-traites-04': traites04,
  'europe-traites-05': traites05,
  'europe-traites-06': traites06,
  'europe-traites-07': traites07,
  'europe-budget-01': budget01,
  'europe-budget-02': budget02,
  'europe-budget-03': budget03,
  'europe-budget-04': budget04,
  'europe-budget-05': budget05,
  'europe-budget-06': budget06,
  'europe-budget-07': budget07,
  'europe-budget-08': budget08,
  'europe-budget-09': budget09,
  'europe-deficits-01': deficits01,
  'europe-deficits-02': deficits02,
  'europe-deficits-03': deficits03,
  'europe-deficits-04': deficits04,
  'europe-deficits-05': deficits05,
  'europe-deficits-06': deficits06,
  'europe-concurrence-01': concurrence01,
  'europe-concurrence-02': concurrence02,
  'europe-concurrence-03': concurrence03,
  'europe-concurrence-04': concurrence04,
  'europe-concurrence-05': concurrence05,
  'europe-concurrence-06': concurrence06,
  'europe-concurrence-07': concurrence07,
  'europe-concurrence-08': concurrence08,
}
