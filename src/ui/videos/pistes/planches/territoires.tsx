// Piste C, les planches de la série « Territoires et services publics » (src/ui/videos/series/territoires.ts) :
// un dessin par passage, composé avec la bibliothèque commune (../dessin/). Les mots et les nombres viennent du
// script (mots mis en valeur, phrases dites, chiffre et libellé de la fiche) : si le texte change, le dessin
// suit ; s'il ne s'y retrouve plus, la planche rend null et le passage prend le dessin générique.
// Quelques pictogrammes manquaient à la bibliothèque (bâtiment public local, bâtiment de soins, cargo, magasin,
// entrepôt, panier) : ils sont dessinés ici, au trait, dans un carré de 48 unités, sans attribut ni symbole.

import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, cls, cueOf, cuesOf, heard, num, ratioOf, sentenceWith, sentencesOf, word, wrap, yearsOf, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Note, Panel, Question, Seg, Signature, Sommaire, Src, Sur100 } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Cases, Disque, Rang, balance, barres, colonnes, effets, manettes, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Un nombre dit, sans son unité (« 1 801,73 euros » → « 1 801,73 ») */
const bare = (s: string) => s.replace(/[\s\u00a0]+(euros?|millions?|milliards?)\b.*$/, '')

/* ——— Pictogrammes de la série ——— */

interface Trace {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat au bleu bille */
  fill?: string
  thin?: number[]
  bold?: number[]
}

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

/** Un bâtiment public local (commune, département, région) : un toit, une horloge, deux fenêtres, une porte */
const MAIRIE: Trace = {
  s: ['M3 44H45', 'M7 44V20H41V44', 'M4 20L24 7L44 20', circle(24, 14.5, 2.6), 'M12 25h6v6h-6zM30 25h6v6h-6z', 'M20 44V33h8v11'],
  fill: 'M7 44V20L24 8L41 20V44Z',
  thin: [4],
}

/** Un bâtiment de soins (une maternité) : une croix sur la façade */
const SOINS: Trace = {
  s: ['M3 44H45', 'M7 44V12H41V44', 'M20.5 17h7v5h5v7h-5v5h-7v-5h-5v-7h5z', 'M19 44V38h10v6'],
  fill: 'M7 44V12H41V44Z',
}

/** Un cargo chargé de conteneurs, sur l'eau */
const CARGO: Trace = {
  s: ['M3 30H45L40 40H8Z', 'M10 30V22H20V30M20 22V14H30V30M30 30V22H38V30', 'M2 45c3-2.5 6-2.5 9 0s6 2.5 9 0 6-2.5 9 0 6 2.5 9 0 6-2.5 9 0'],
  fill: 'M3 30H45L40 40H8Z',
  thin: [2],
}

/** Un magasin : un auvent festonné, une vitrine, une porte */
const MAGASIN: Trace = {
  s: ['M3 44H45', 'M7 44V22H41V44', 'M5 12H43L41 22H7Z', 'M7 22q3 4 6 0q3 4 6 0q3 4 6 0q3 4 6 0q3 4 6 0q2 3 4 0', 'M11 29h12v9h-12z', 'M28 44V29h8v15'],
  fill: 'M7 44V22H41V44Z',
  thin: [3, 4],
}

/** Un entrepôt : un pignon, une large porte à lames */
const ENTREPOT: Trace = {
  s: ['M2 44H46', 'M5 44V19L24 8L43 19V44', 'M13 44V27H35V44', 'M13 32H35M13 37H35M13 41H35'],
  fill: 'M5 44V19L24 8L43 19V44Z',
  thin: [3],
}

/** Un panier de courses à anse */
const PANIER: Trace = {
  s: ['M15 21C15 5 33 5 33 21', 'M4 21H44L39 43H9Z', 'M15 21L17 43M24 21V43M33 21L31 43'],
  fill: 'M4 21H44L39 43H9Z',
  thin: [2],
}

/** Un pictogramme de la série, placé sur la feuille, qui se dessine trait après trait (comme Picto) */
function Trait({ t, x, y, size = 48, t0 = 0, kept, tone, step = 200 }: { t: Trace; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; step?: number }) {
  const s = size / 48
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${s})`} style={{ '--k': String(1 / s) }}>
      {t.fill && tone === 'count' ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class="vc-tint-count" d={t.fill} />
        </Fade>
      ) : null}
      {t.s.map((d, i) => (
        <Ink key={i} d={d} t0={t0 + i * step} dur={i === 0 ? 520 : 380} kept={still} class={t.thin?.includes(i) ? 'vc-thin' : t.bold?.includes(i) ? 'vc-bold' : undefined} />
      ))}
    </g>
  )
}

/* ——— Communs à la série ——— */

/** Une part en cent carrés, et ce qu'elle compte écrit à côté */
function centieme(p: P, cueIndex: number, caption: string | null) {
  const cue = cueOf(p, cueIndex)
  const v = num(cue?.text)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={Math.round(v)} caption={caption} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** Les prix outre-mer : La Réunion et la Guadeloupe à la même échelle ; s'il est dit, l'écart d'une année passée
 *  marqué en pointillé sur la barre de la Guadeloupe */
function ecartsPrix(p: P) {
  const [a, b, past] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const ra = word(p, /La Réunion/)
  const gu = word(p, /Guadeloupe/)
  if (!a || !b || !va || !vb || !ra || !gu) return null
  const g = barres({
    items: [
      { label: ra.text, value: va, text: a.text, shown: a.shown },
      { label: gu.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: past ? 30 : 28,
    room: 70,
    t0: 100,
  })
  const vp = num(past?.text)
  const years = yearsOf(p.segment.say)
  const yp = years.length > 1 ? Math.min(...years) : null
  const gg = g.geo[1]!
  const xp = vp ? gg.x0 + vp * g.scale : 0
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + (past ? 36 : 8)}>
        {g.el}
        {past?.shown && vp && yp ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M${xp.toFixed(1)} ${gg.top - 8}V${gg.bottom + 8}`} />
            </Fade>
            <Txt x={xp} y={gg.bottom + 26} text={`${past.text} en ${yp}`} size={14} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Un disque et sa part comptée ; à droite, ce qu'elle compte (bleu bille) et ce que vaut le tout (gris) */
function partDisque(p: P, part: number, shown: boolean, count: { text: string; size?: number; big?: boolean }[], whole: string | null) {
  const tip = partPoint(78, 78, 52, part)
  let y = 40
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={158}>
        <Disque cx={78} cy={78} r={74} part={part} shown={shown} t0={300} />
        {shown && count.length ? <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L170 ${y - 6}`} t0={300} dur={400} class="vc-count vc-thin" /> : null}
        {shown
          ? count.map((c, i) => {
              const el = <Txt key={i} x={174} y={y} text={c.text} max={16} size={c.size ?? 15} big={c.big} anchor="start" tone="count" t0={500 + i * 200} />
              y += (c.size ?? 15) * 1.15 * wrap(c.text, 16).length + 6
              return el
            })
          : null}
        {whole ? <Txt x={174} y={122} text={whole} max={16} size={14} anchor="start" tone="soft" t0={900} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Un guichet, une école, une maternité : à quelle distance de chez vous ? » */
const intro01: Board = p => {
  const items: [RegExp, PictoName][] = [
    [/guichet/, 'guichet'],
    [/école/, 'livre'],
    [/maternité/, 'soin'],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={150}>
        <Picto n="maison" x={2} y={64} size={60} t0={100} />
        <Fade t0={600} class="vc-dash vc-soft">
          <path d="M68 120H294" />
        </Fade>
        {items.map(([re, n], i) => {
          const w = word(p, re)
          if (!w) return null
          const cx = 126 + i * 70
          return (
            <g key={n}>
              <Picto n={n} x={cx - 22} y={70} size={44} t0={800 + i * 300} />
              {w.shown ? <Txt x={cx} y={142} text={w.text} size={14} t0={1000 + i * 300} /> : null}
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 02 23 % des ménages, près d'un sur quatre : cent carrés, dont vingt-trois comptés */
const intro02: Board = p => {
  const near = cueOf(p, 1)
  return centieme(p, 0, near ? sentenceWith(p.segment.say, near.text) : null)
}

/** 03 5,80 millions d'agents publics ; l'emploi public, un emploi sur cinq : cinq mallettes, dont une comptée */
const intro03: Board = p => {
  const cue = cueOf(p, 1)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 10) return null
  const g = rangCells({ n: r.n, y: 4, max: 46, gap: 16 })
  const first = g.cells[0]!
  const last = g.cells[g.cells.length - 1]!
  const line = sentenceWith(p.segment.say, cue.text)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 52}>
        <Rang n={r.n} picto="mallette" y={4} max={46} gap={16} count={range(r.k)} shown={cue.shown} t0={300} stagger={150} />
        <Brace x1={first.x} y1={g.h + 12} x2={last.x + last.size} y2={g.h + 12} t0={1100} />
        {line && cue.shown ? <Txt x={W / 2} y={g.h + 46} text={line} size={15} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les trois niveaux de collectivités, tels que le passage les nomme */
const NIVEAUX = [/[Cc]ommunes?/, /[Dd]épartements?/, /[Rr]égions?/]

/** 04 Communes, départements, régions ; 70,7 milliards d'euros investis : trois bâtiments publics, une grue */
const intro04: Board = p => {
  const levels = NIVEAUX.map(re => word(p, re))
  if (levels.some(l => !l)) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={92}>
        {levels.map((l, i) => {
          const cx = 40 + i * 84
          return (
            <g key={i}>
              <Trait t={MAIRIE} x={cx - 26} y={2} size={52} t0={300 + i * 250} />
              <Txt x={cx} y={78} text={l!.text.toLowerCase()} size={14} t0={500 + i * 250} />
            </g>
          )
        })}
        <Picto n="grue" x={234} y={0} size={62} t0={1200} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Les prix outre-mer : de 9 % à La Réunion à 16 % en Guadeloupe, à la même échelle */
const intro05: Board = p => ecartsPrix(p)

/** Le pictogramme de chaque question du thème */
const QUESTION_PICTOS: [RegExp, PictoName][] = [
  [/services publics/, 'guichet'],
  [/fonction publique|salaires/, 'mallette'],
  [/collectivités/, 'monument'],
  [/vie chère|outre-mer/, 'etiquette'],
]

/** 06 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro06: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map(q => ({
          picto: QUESTION_PICTOS.find(([re]) => re.test(q))?.[1] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
        }))}
      />
    </Seg>
  )
}

/** 07 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro07: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Services publics ——— */

/** 01 Impôts, allocations, retraite : à quel guichet, près de chez vous ? */
const services01: Board = p => {
  const docs = [/impôts/, /allocations/, /retraite/].map(re => word(p, re))
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={156}>
        {docs.map((d, i) =>
          d ? (
            <g key={i}>
              <Picto n="document" x={30 + i * 90} y={0} size={40} t0={150 + i * 300} />
              {d.shown ? <Txt x={50 + i * 90} y={58} text={d.text} size={14} t0={100} /> : null}
            </g>
          ) : null,
        )}
        <Ink d="M8 150H292" t0={300} dur={700} class="vc-soft" />
        <Picto n="maison" x={4} y={92} size={58} t0={400} />
        <Fade t0={1200} class="vc-dash">
          <path d="M66 140H214" />
        </Fade>
        <Picto n="guichet" x={218} y={80} size={70} t0={1400} />
        <Ask x={128} y={88} h={40} t0={2000} />
      </Art>
    </Seg>
  )
}

/** 02 France services : douze organismes réunis en un même guichet ; objectif, moins de 20 minutes */
const services02: Board = p => {
  const [org, min] = cuesOf(p)
  const n = num(org?.text)
  if (!org || !n || n > 16) return null
  const g = rangCells({ n, cols: n, max: 20, gap: 4, y: 2 })
  const first = g.cells[0]!
  const last = g.cells[g.cells.length - 1]!
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Rang n={n} picto="porte" cols={n} max={20} gap={4} y={2} count={range(n)} shown={org.shown} t0={200} stagger={60} />
        <Brace x1={first.x} y1={g.h + 10} x2={last.x + last.size} y2={g.h + 10} t0={1000} />
        <Picto n="guichet" x={110} y={g.h + 36} size={80} t0={1200} />
        {min?.shown ? <Picto n="cadran" x={222} y={g.h + 56} size={62} tone="count" t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 23 % des ménages ont rencontré au moins une difficulté : cent carrés, dont vingt-trois comptés */
const services03: Board = p => {
  const cue = cueOf(p, 0)
  const cap = word(p, /ont rencontré au moins une difficulté/)
  return centieme(p, 0, cue && cap ? `${cue.text} ${cap.text}` : null)
}

/** 04 Lesquelles : délais d'attente, interlocuteur, service près de chez soi, à la même échelle */
const services04: Board = p => {
  const cues = cuesOf(p)
  const labels = [/Des délais d’attente trop longs/, /Pas d’interlocuteur compétent/, /Pas de service près de chez eux/].map(re => word(p, re))
  if (cues.length < 3 || labels.some(l => !l)) return null
  const items = cues.slice(0, 3).map((c, i) => ({ label: labels[i]!.text, value: num(c.text) ?? 0, text: c.text, shown: labels[i]!.shown }))
  if (items.some(i => !i.value)) return null
  const g = barres({ items, y: 4, size: 22, gap: 24, room: 74, t0: 100 })
  return (
    <Seg kind="fig">
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Au moins 300 accouchements par an ; une dérogation, quand les trajets seraient excessifs */
const services05: Board = p => {
  const [seuil, derog] = cuesOf(p)
  const parAn = word(p, /par an/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={160}>
        <Trait t={SOINS} x={20} y={0} size={100} t0={100} />
        <Picto n="calendrier" x={176} y={14} size={70} t0={800} tone={seuil?.shown ? 'count' : undefined} />
        {parAn?.shown ? <Txt x={211} y={106} text={parAn.text} size={15} t0={100} /> : null}
        {derog?.shown ? (
          <>
            <Arrow x1={70} y1={124} x2={286} y2={124} dash t0={0} />
            <Txt x={178} y={152} text={derog.text} size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Le nombre de maternités : 721 en 2000, 557 en 2010, 471 en 2021 */
const services06: Board = p => {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const title = word(p, /Le nombre de maternités/)
  if (cues.length < 2 || years.length !== cues.length) return null
  const cols = colonnes({
    items: cues.map((c, i) => ({ label: String(years[i]), value: num(c.text) ?? 0, text: c.text, shown: c.shown })),
    y: 30,
    h: 140,
    x: 40,
    w: 220,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Art h={30 + cols.h}>
        {title ? <Txt x={W / 2} y={16} text={title.text} size={16} /> : null}
        {cols.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Réduire l'offre allonge les temps de trajet : la maternité s'éloigne au bout de la route */
const services07: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={124}>
        <Ink d="M58 118H292" t0={100} dur={800} class="vc-soft" />
        <Picto n="maison" x={2} y={64} size={58} t0={200} />
        {cue?.shown ? (
          <>
            <Trait t={SOINS} x={92} y={58} size={60} tone="ghost" />
            <Arrow x1={152} y1={46} x2={226} y2={46} dash t0={100} />
            <Trait t={SOINS} x={230} y={58} size={60} t0={300} />
            <Picto n="sablier" x={168} y={70} size={42} tone="count" t0={700} />
          </>
        ) : (
          <Trait t={SOINS} x={92} y={58} size={60} t0={500} />
        )}
      </Art>
    </Seg>
  )
}

/** 08 À plus de 45 minutes d'une maternité : un hébergement tout près, les cinq derniers jours */
const services08: Board = p => {
  const [mins, jours] = cuesOf(p)
  const heb = word(p, /hébergée à proximité/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={170}>
        <Ink d="M56 118H292" t0={100} dur={800} class="vc-soft" />
        <Picto n="maison" x={2} y={64} size={56} t0={100} />
        <Trait t={SOINS} x={228} y={52} size={66} t0={300} />
        {mins?.shown ? <Picto n="cadran" x={100} y={70} size={46} tone="count" t0={100} /> : null}
        {heb?.shown ? <Picto n="maison" x={186} y={86} size={34} tone="count" t0={0} /> : null}
        {jours?.shown ? (
          <>
            <Cases n={5} cols={5} x={180} y={130} size={14} gap={4} count={range(5)} t0={0} />
            <Txt x={223} y={164} text={jours.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 Deux exigences face à face : la qualité et la sécurité des soins, la proximité ; fléau à l'horizontale */
const services09: Board = p => {
  const a = word(p, /la qualité et la sécurité des soins/)
  const b = word(p, /la proximité/)
  const bal = balance({
    left: ['soin'],
    right: (cx, base) => (
      <>
        <Picto n="maison" x={cx - 42} y={base - 40} size={40} t0={1300} />
        <Picto n="epingle" x={cx + 2} y={base - 44} size={40} t0={1500} />
      </>
    ),
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 10 « Comment garantir l'accès aux services publics dans tous les territoires ? » */
const services10: Board = p => (
  <Seg kind="ask">
    <Art h={108}>
      <Ink d="M4 100C40 86 70 86 104 96C140 106 180 84 232 92" t0={0} dur={900} class="vc-soft" />
      <Picto n="maison" x={6} y={60} size={32} t0={300} />
      <Picto n="guichet" x={50} y={40} size={50} t0={500} />
      <Picto n="maison" x={110} y={62} size={30} t0={700} />
      <Trait t={SOINS} x={150} y={44} size={50} t0={900} />
      <Picto n="maison" x={204} y={58} size={30} t0={1100} />
      <Ask x={250} y={20} h={70} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Fonction publique ——— */

/** Le contour d'un document, couleur papier, pour qu'il cache ce qu'il recouvre ; (x, y) et s comme Picto */
const PaperDoc = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <g transform={`translate(${x} ${y}) scale(${size / 48})`}>
    <path class="vc-paper" d="M10 4H31L39 12V44H10Z" />
  </g>
)

/** 01 La paie de base suit une grille : qui en fixe le montant, et comment ? */
const agents01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={132}>
      <Cases n={32} cols={8} x={30} y={30} size={18} gap={4} t0={100} />
      <PaperDoc x={80} y={4} size={110} />
      <Picto n="document" x={80} y={4} size={110} t0={700} />
      <Ask x={234} y={20} h={72} t0={1500} />
    </Art>
  </Seg>
)

/** 02 Un indice (selon le grade et l'échelon) fois la valeur du point : le traitement ; les primes s'y ajoutent */
const agents02: Board = p => {
  const [ind, pt, tr] = cuesOf(p)
  const primes = word(p, /les primes/)
  if (!ind || !pt || !tr) return null
  return (
    <Seg>
      <Art h={136}>
        <Cases n={9} cols={3} x={14} y={30} size={14} gap={3} count={ind.shown ? [4] : []} t0={100} />
        {ind.shown ? <Txt x={38} y={104} text={ind.text} max={9} size={14} /> : null}
        <Txt x={78} y={64} text="×" size={24} tone="soft" t0={600} />
        <Picto n="piece" x={94} y={30} size={50} t0={700} tone={pt.shown ? 'count' : undefined} />
        {pt.shown ? <Txt x={119} y={104} text={pt.text} max={10} size={14} /> : null}
        <Txt x={162} y={64} text="=" size={24} tone="soft" t0={1200} />
        <Picto n="enveloppe" x={176} y={22} size={64} t0={1300} tone={tr.shown ? 'count' : undefined} />
        {tr.shown ? <Txt x={208} y={104} text={tr.text} max={13} size={14} /> : null}
        {primes?.shown ? (
          <>
            <Txt x={250} y={64} text="+" size={22} tone="soft" />
            <Picto n="enveloppe" x={258} y={38} size={38} t0={100} />
            <Txt x={277} y={104} text={primes.text} max={7} size={14} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Sur un an : 0 % pour le point, 2,1 % pour les prix hors tabac, à la même échelle */
const agents03: Board = p => {
  const [a, b] = cuesOf(p)
  const la = word(p, /le point/)
  const lb = word(p, /les prix hors tabac/)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || va === null || !vb || !la || !lb) return null
  const g = barres({
    items: [
      { label: la.text, value: va, text: a.text, shown: a.shown },
      { label: lb.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: 30,
    room: 80,
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

/** 04 Le traitement minimum sous le Smic brut, à la même échelle ; l'indemnité comble l'écart (bleu bille) */
const agents04: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /le traitement minimum/)
  const lb = word(p, /le Smic brut/)
  const ind = word(p, /une indemnité/)
  if (!a || !b || !va || !vb || !la || !lb || vb <= va) return null
  const g = barres({
    items: [
      { label: la.text, value: va, ext: ind?.shown ? vb : undefined, text: bare(a.text), shown: a.shown },
      { label: lb.text, value: vb, text: bare(b.text), shown: b.shown },
    ],
    y: 4,
    size: 24,
    gap: 50,
    room: 100,
    t0: 100,
  })
  const f = g.geo[0]!
  const xe = f.x0 + vb * g.scale
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>
        {g.el}
        {ind?.shown ? <Txt x={xe} y={f.bottom + 19} text={ind.text} size={14} anchor="end" tone="count" t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Salaire net mensuel moyen : fonction publique et privé, à la même échelle ; tous deux en baisse, inflation
 *  déduite (les évolutions, tirées du libellé de la fiche) */
const agents05: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /la fonction publique/)
  const lb = word(p, /le privé/)
  const down = word(p, /les deux ont baissé/)
  if (!a || !b || !va || !vb || !la || !lb) return null
  const evol = [...(p.segment.figure?.label ?? '').matchAll(/en baisse de (\d+,\d+)[\s\u00a0]%/g)].map(m => `−${m[1]}\u00a0%`)
  const g = barres({
    items: [
      { label: la.text, value: va, text: bare(a.text), shown: a.shown },
      { label: lb.text, value: vb, text: bare(b.text), shown: b.shown },
    ],
    y: 4,
    size: 24,
    gap: 32,
    room: 150,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>
        {g.el}
        {down?.shown && evol.length === 2
          ? g.geo.map((geo, i) => (
              <g key={i}>
                <Picto n="baisse" x={geo.x1 + 72} y={geo.top} size={24} tone="count" w={1.2} t0={i * 200} />
                <Txt x={geo.x1 + 98} y={geo.bottom - 6} text={evol[i]!} size={14} anchor="start" tone="count" t0={200 + i * 200} />
              </g>
            ))
          : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 23 % des agents publics sont contractuels : cent carrés, dont vingt-trois comptés */
const agents06: Board = p => {
  const cue = cueOf(p, 1)
  const cap = word(p, /sont contractuels/)
  return centieme(p, 1, cue && cap ? `${cue.text} ${cap.text}` : null)
}

/** 07 370 milliards de rémunérations sur 1 714,2 milliards de dépenses : un peu plus d'un euro sur cinq */
const agents07: Board = p => {
  const [rem, ratio] = cuesOf(p)
  const total = word(p, /\d[\d ]*,\d+ milliards de dépenses/)
  const vr = num(rem?.text)
  const vt = num(total?.text)
  const remw = word(p, /rémunérations/)
  const line = word(p, /un peu plus d’un euro sur cinq/)
  if (!rem || !vr || !vt || vr >= vt || !remw) return null
  const count = [{ text: remw.text }, ...(line && ratio?.shown ? [{ text: line.text }] : [])]
  return partDisque(p, vr / vt, rem.shown, count, total?.text ?? null)
}

/** 08 Le pouvoir d'achat des agents, la maîtrise de la dépense publique : la balance du débat */
const agents08: Board = p => {
  const a = word(p, /Le pouvoir d’achat des agents/)
  const b = word(p, /la maîtrise de la dépense publique/)
  const bal = balance({ left: ['portemonnaie'], right: ['pieces'], labels: [a?.text ?? null, b?.text ?? null], shown: [!!a?.shown, !!b?.shown], t0: 100 })
  return (
    <Seg kind="end">
      <HeadCues p={p} />
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 09 « Quels salaires et quels effectifs pour la fonction publique ? » : la grille, des agents, la question */
const agents09: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Cases n={12} cols={4} x={8} y={22} size={16} gap={4} t0={0} />
      <Rang n={4} picto="personne" x={96} w={136} y={30} max={30} gap={4} t0={300} stagger={120} />
      <Ask x={248} y={12} h={72} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Collectivités ——— */

/** 01 Votre commune, votre département, votre région : trois bâtiments publics, chacun nommé quand il est dit */
const coll01: Board = p => {
  const levels = [/commune/, /département/, /région/].map(re => word(p, re))
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={108}>
        {levels.map((l, i) => {
          const cx = 50 + i * 100
          return (
            <g key={i}>
              <Trait t={MAIRIE} x={cx - 32} y={2} size={64} t0={100 + i * 300} />
              {l?.shown ? <Txt x={cx} y={90} text={l.text} size={15} t0={200} /> : null}
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** Des lignes de texte sur une feuille */
const lignes = (x0: number, x1: number, y0: number, n: number, gap: number) => range(n).map(k => `M${x0} ${y0 + k * gap}H${x1}`).join('')

/** 02 « s'administrent librement » ; déroger aux règles nationales, à titre expérimental */
const coll02: Board = p => {
  const exp = cueOf(p, 1)
  const cons = word(p, /La Constitution/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="document" x={0} y={0} size={96} t0={100} />
        {cons ? <Txt x={48} y={116} text={cons.text} max={16} size={14} t0={500} /> : null}
        <Ink d="M118 10H232V128H118Z" t0={700} dur={800} />
        <Ink d={lignes(128, 222, 26, 7, 14)} t0={1100} dur={600} class="vc-thin vc-soft" />
        {exp?.shown ? (
          <>
            <Fade class="vc-dash vc-count">
              <path d="M186 46H292V146H186Z" />
            </Fade>
            <Fade t0={200}>
              <path class="vc-paper" d="M196 58H272V136H196Z" />
            </Fade>
            <Ink d="M196 58H272V136H196Z" t0={200} dur={600} />
            <Ink d={lignes(204, 264, 74, 4, 14)} t0={600} dur={500} class="vc-thin" />
            <Picto n="sablier" x={256} y={4} size={34} tone="count" t0={700} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Une compétence transférée par l'État, avec des ressources équivalentes ; la péréquation entre collectivités */
const coll03: Board = p => {
  const [res, per] = cuesOf(p)
  const etat = word(p, /l’État/)
  return (
    <Seg>
      <Art h={212}>
        <Picto n="monument" x={2} y={10} size={70} t0={100} />
        {etat ? <Txt x={37} y={100} text={etat.text} size={15} t0={300} /> : null}
        <Trait t={MAIRIE} x={226} y={10} size={70} t0={400} />
        <Picto n="mallette" x={132} y={6} size={36} t0={1000} />
        <Arrow x1={80} y1={48} x2={220} y2={48} t0={800} />
        {res?.shown ? (
          <>
            <Arrow x1={80} y1={68} x2={220} y2={68} tone="count" t0={0} />
            <Picto n="pieces" x={134} y={72} size={32} tone="count" t0={300} />
            <Txt x={150} y={124} text={res.text} size={15} tone="count" t0={500} />
          </>
        ) : null}
        {per?.shown ? (
          <>
            <Ink d="M10 140H290" t0={0} dur={500} class="vc-soft vc-thin" />
            <Trait t={MAIRIE} x={44} y={146} size={44} t0={100} />
            <Trait t={MAIRIE} x={212} y={146} size={44} t0={300} />
            <Picto n="piece" x={140} y={148} size={20} tone="count" t0={600} />
            <Arrow x1={96} y1={174} x2={206} y2={174} tone="count" t0={500} />
            <Txt x={150} y={204} text={per.text} size={15} tone="count" t0={800} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 70,7 milliards d'euros d'investissement, 3,4 % de plus en un an : un bâtiment, une grue, des pièces */
const coll04: Board = p => {
  const pct = cueOf(p, 1)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={100}>
        <Trait t={MAIRIE} x={10} y={22} size={70} t0={200} />
        <Picto n="grue" x={92} y={0} size={92} t0={500} />
        <Picto n="pieces" x={194} y={40} size={52} t0={900} tone="count" />
        {pct?.shown ? (
          <>
            <Picto n="hausse" x={250} y={22} size={30} tone="count" w={1.2} t0={0} />
            <Txt x={265} y={92} text={`+${pct.text}`} size={18} big tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 En 2021, chaque niveau de collectivité perd un impôt local : chacun rayé quand la voix le nomme */
const coll05: Board = p => {
  const cues = cuesOf(p)
  const levels = [/communes/, /départements/, /régions/].map(re => word(p, re))
  const year = yearsOf(p.segment.say)[0]
  if (cues.length < 3 || levels.some(l => !l)) return null
  return (
    <Seg>
      <Art h={166}>
        {year ? <Txt x={W / 2} y={18} text={String(year)} size={20} big tone="soft" /> : null}
        {levels.map((l, i) => {
          const cx = 50 + i * 100
          const c = cues[i]!
          // Le nom de l'impôt, rayé ligne par ligne d'un trait fin (environ 6,8 unités par signe en corps 15)
          const lines = wrap(c.text, 12)
          const strike = lines.map((s, k) => `M${(cx - s.length * 3.4).toFixed(1)} ${127 + k * 17}h${(s.length * 6.8).toFixed(1)}`).join('')
          return (
            <g key={i}>
              <Trait t={MAIRIE} x={cx - 26} y={30} size={52} t0={200 + i * 200} />
              <Txt x={cx} y={104} text={l!.text} size={15} t0={400 + i * 200} />
              {c.shown ? (
                <>
                  <Txt x={cx} y={132} text={c.text} max={12} size={15} tone="soft" t0={0} />
                  <Ink d={strike} t0={500} dur={350} class="vc-thin" />
                </>
              ) : null}
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 06 Une part de la TVA nationale reversée aux collectivités : 52,7 milliards d'euros */
const coll06: Board = p => {
  const tva = word(p, /TVA/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={92}>
        <Picto n="etiquette" x={0} y={8} size={76} t0={100} text={tva?.text} />
        <Arrow x1={80} y1={46} x2={124} y2={46} tone="count" t0={700} />
        <Picto n="pieces" x={128} y={20} size={52} tone="count" t0={900} />
        <Arrow x1={184} y1={46} x2={208} y2={46} tone="count" t0={1300} />
        {[0, 1, 2].map(i => (
          <Trait key={i} t={MAIRIE} x={212 + i * 28} y={30} size={26} t0={1400 + i * 150} />
        ))}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les concours de l'État : 16,8 % des recettes des communes, 6 % de celles des régions, à la même échelle */
const coll07: Board = p => {
  const [a, b] = cuesOf(p)
  const la = word(p, /communes/)
  const lb = word(p, /régions/)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb || !la || !lb) return null
  const g = barres({
    items: [
      { label: la.text, value: va, text: a.text, shown: a.shown },
      { label: lb.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: 28,
    room: 84,
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

/** Les quatre sujets du débat sur les collectivités, et leur pictogramme */
const SUJETS: [RegExp, PictoName][] = [
  [/autonomie fiscale/, 'pieces'],
  [/dotations/, 'enveloppe'],
  [/adapter les règles/, 'document'],
  [/compétences/, 'mallette'],
]

/** 08 Le débat : autonomie fiscale, dotations, adapter les règles, compétences ; quatre curseurs, aucun poussé */
const coll08: Board = p => {
  const items = SUJETS.map(([re, picto]) => ({ w: word(p, re), picto }))
  if (items.some(i => !i.w)) return null
  const head = word(p, /Le débat porte sur/)
  const lev = manettes({
    items: items.map(i => ({ label: i.w!.text, picto: i.picto, pos: 0.5, shown: i.w!.shown })),
    y: 4,
    h: 64,
    size: 40,
    labelMax: 10,
  })
  return (
    <Seg>
      <Head lines={[head ? { text: head.text, shown: head.shown } : null]} />
      <Art h={lev.h + 6}>{lev.el}</Art>
    </Seg>
  )
}

/** 09 « Quels pouvoirs et quels moyens pour les collectivités locales ? » */
const coll09: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      {[0, 1, 2].map(i => (
        <Trait key={i} t={MAIRIE} x={6 + i * 64} y={34} size={58} t0={i * 200} />
      ))}
      <Picto n="piece" x={56} y={2} size={28} t0={800} />
      <Picto n="document" x={116} y={0} size={30} t0={1000} />
      <Ask x={236} y={16} h={72} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Vie chère outre-mer ——— */

/** 01 La vie coûte plus cher : un panier et son étiquette sur le quai, un cargo au loin */
const om01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={134}>
      <Ink d="M4 128H156" t0={100} dur={500} class="vc-soft" />
      <Trait t={PANIER} x={10} y={62} size={72} t0={300} />
      <Ink d="M80 92L98 66" t0={1100} dur={300} class="vc-thin" />
      <Picto n="etiquette" x={92} y={40} size={52} t0={1200} />
      <Trait t={CARGO} x={186} y={50} size={88} t0={700} />
    </Art>
  </Seg>
)

/** 02 L'écart de prix avec la métropole : 9 % à La Réunion, 16 % en Guadeloupe ; 8,3 % en Guadeloupe en 2010 */
const om02: Board = p => ecartsPrix(p)

/** Le dessin d'une cause de la vie chère, d'après ses mots */
function cause(s: string, x: number, y: number, t0: number) {
  if (/transport|éloignement/.test(s)) return <Trait t={CARGO} x={x} y={y} size={50} t0={t0} />
  if (/marchés/.test(s)) return <Rang n={3} picto="personne" x={x - 14} w={78} y={y + 14} max={24} gap={3} t0={t0} stagger={120} />
  if (/distribution/.test(s)) return <Trait t={MAGASIN} x={x} y={y} size={50} t0={t0} />
  return <Picto n="document" x={x} y={y} size={50} t0={t0} />
}

/** 03 Plusieurs causes avancées : l'éloignement et le transport, de petits marchés, la distribution, la fiscalité */
const om03: Board = p => {
  const i = p.segment.say.search(/[\u00a0 ]:/)
  if (i < 0) return null
  const items = p.segment.say
    .slice(i + 2)
    .replace(/[.!?…]+$/, '')
    .split(/,\s+/)
    .map(s => s.replace(/^et\s+/, '').trim())
    .filter(Boolean)
  if (items.length !== 4) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={190}>
        {items.map((it, k) => {
          const cx = k % 2 ? 225 : 75
          const y0 = Math.floor(k / 2) * 98
          return heard(p, it.split(' ').slice(0, 2).join(' ')) ? (
            <g key={k}>
              {cause(it, cx - 25, y0, 0)}
              <Txt x={cx} y={y0 + 70} text={it} max={20} size={14} t0={300} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 04 Les frais d'approche : 33,3 % du coût d'achat des marchandises importées, un tiers du disque */
const om04: Board = p => {
  const [pct, tiers, frais] = cuesOf(p)
  const v = num(pct?.text)
  const cout = word(p, /coût d’achat des marchandises importées/)
  if (!pct || !v || v >= 100) return null
  const count = [
    ...(tiers?.shown ? [{ text: tiers.text.toLowerCase(), size: 18, big: true }] : []),
    ...(frais?.shown ? [{ text: frais.text }] : []),
  ]
  return partDisque(p, v / 100, pct.shown, count, cout?.text ?? null)
}

/** 05 L'octroi de mer en Martinique : 250 millions d'euros en 2014, 346 en 2022, depuis zéro */
const om05: Board = p => {
  const cur = cueOf(p, 1)
  const years = yearsOf(p.segment.say)
  const before = word(p, /contre \d+/)
  const unit = word(p, /millions d’euros/)
  const vc = num(cur?.text)
  const vb = num(before?.text)
  if (!cur || !vc || !vb || !before || years.length < 2) return null
  const [yc, yb] = years
  const items = [
    { label: String(Math.min(yb!, yc!)), value: yb! < yc! ? vb : vc, text: yb! < yc! ? String(vb) : bare(cur.text), shown: yb! < yc! ? before.shown : cur.shown },
    { label: String(Math.max(yb!, yc!)), value: yb! < yc! ? vc : vb, text: yb! < yc! ? bare(cur.text) : String(vb), shown: yb! < yc! ? cur.shown : before.shown },
  ]
  const cols = colonnes({ items, y: 22, h: 104, x: 70, w: 160, t0: 100 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={22 + cols.h}>
        {unit ? <Txt x={W / 2} y={14} text={unit.text} size={14} tone="soft" /> : null}
        {cols.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Le protocole de 2024 : la TVA supprimée sur 69 familles de produits, l'octroi de mer baissé sur 54 */
const om06: Board = p => {
  const date = word(p, /\d+[\s\u00a0]octobre \d{4}/)
  const tva = word(p, /la TVA/)
  const sigle = word(p, /TVA/)
  const oct = word(p, /l’octroi de mer/)
  const [fam, sur] = cuesOf(p)
  return (
    <Seg>
      <Art h={136}>
        <Picto n="document" x={0} y={0} size={72} t0={100} />
        {date ? <Txt x={36} y={92} text={date.text} max={10} size={14} t0={400} /> : null}
        {tva?.shown ? (
          <>
            <Picto n="etiquette" x={98} y={6} size={64} t0={0} text={sigle?.text} />
            <Txt x={130} y={88} text={tva.text} size={14} t0={200} />
          </>
        ) : null}
        {fam?.shown ? (
          <>
            <Ink d="M100 60L164 16" t0={0} dur={350} class="vc-count vc-bold" />
            <Txt x={130} y={110} text={fam.text} max={12} size={14} tone="count" t0={200} />
          </>
        ) : null}
        {oct?.shown ? (
          <>
            <Picto n="etiquette" x={196} y={6} size={64} t0={0} />
            <Txt x={232} y={88} text={oct.text} size={14} t0={200} />
          </>
        ) : null}
        {sur?.shown ? (
          <>
            <Picto n="baisse" x={262} y={16} size={28} tone="count" w={1.2} t0={0} />
            <Txt x={232} y={110} text={sur.text} size={14} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 En contrepartie, sur d'autres produits : la TVA revient au taux normal, l'octroi de mer augmente, chacun quand
 *  la voix le dit ; l'analyse de l'Autorité de la concurrence */
const om07: Board = p => {
  const autres = word(p, /sur d’autres produits/)
  const tva = word(p, /la TVA revient au taux normal/)
  const oct = word(p, /l’octroi de mer augmente/)
  const analyse = sentenceWith(p.segment.say, cueOf(p, 1)?.text)
  if (!tva || !oct) return null
  const ef = effets({
    items: [
      { picto: 'etiquette', dir: 'hausse', text: tva.text, shown: tva.shown },
      { picto: 'etiquette', dir: 'hausse', text: oct.text, shown: oct.shown },
    ],
    x: 56,
    y: 30,
    w: W - 56,
    row: 62,
    t0: 100,
  })
  return (
    <Seg>
      <Art h={30 + ef.h + 8}>
        {autres?.shown ? <Txt x={W / 2} y={16} text={autres.text} size={15} tone="soft" /> : null}
        {ef.el}
      </Art>
      <Note p={p} text={analyse} />
    </Seg>
  )
}

/** 08 Les marges : l'Autorité regarde les magasins (pas de marges notablement plus élevées constatées) ; les
 *  intermédiaires en amont sont plus rentables */
const om08: Board = p => {
  const [pas, plus] = cuesOf(p)
  const amont = word(p, /intermédiaires en amont/)
  const mag = word(p, /les magasins/)
  const constat = word(p, /pas constaté de marges notablement plus élevées/)
  return (
    <Seg>
      <Art h={212}>
        <Trait t={CARGO} x={0} y={30} size={66} t0={100} />
        <Arrow x1={68} y1={66} x2={92} y2={66} t0={600} />
        <Trait t={ENTREPOT} x={96} y={22} size={80} t0={800} tone={plus?.shown ? 'count' : undefined} />
        <Arrow x1={178} y1={66} x2={202} y2={66} t0={1300} />
        <Trait t={MAGASIN} x={206} y={22} size={80} t0={1500} />
        {amont ? <Txt x={136} y={124} text={amont.text} max={14} size={14} t0={1000} /> : null}
        {mag ? <Txt x={246} y={124} text={mag.text} size={14} t0={1700} /> : null}
        {pas?.shown ? (
          <>
            <Picto n="loupe" x={250} y={0} size={40} t0={0} />
            <Txt x={246} y={156} text={constat?.text ?? pas.text} max={14} size={14} tone="soft" t0={300} />
          </>
        ) : null}
        {plus?.shown ? (
          <>
            <Picto n="hausse" x={123} y={0} size={26} tone="count" w={1.2} t0={0} />
            <Txt x={136} y={156} text={plus.text} size={14} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 Pour les uns, l'octroi de mer pèse sur le prix ; pour d'autres, il finance les collectivités et soutient la
 *  production locale : deux plateaux égaux, fléau à l'horizontale */
const om09: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: ['etiquette'],
    right: (cx, base) => (
      <>
        <Trait t={MAIRIE} x={cx - 42} y={base - 40} size={40} t0={1300} />
        <Picto n="arbre" x={cx + 2} y={base - 42} size={40} t0={1500} />
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

/** 10 « Comment lutter contre la vie chère dans les outre-mer ? » */
const om10: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Ink d="M4 94H120" t0={0} dur={500} class="vc-soft" />
      <Trait t={PANIER} x={6} y={34} size={64} t0={200} />
      <Picto n="etiquette" x={76} y={20} size={40} t0={700} />
      <Trait t={CARGO} x={140} y={40} size={58} t0={900} />
      <Ask x={240} y={14} h={72} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const TERRITOIRES: Record<string, Board> = {
  'territoires-intro-01': intro01,
  'territoires-intro-02': intro02,
  'territoires-intro-03': intro03,
  'territoires-intro-04': intro04,
  'territoires-intro-05': intro05,
  'territoires-intro-06': intro06,
  'territoires-intro-07': intro07,
  'territoires-services-01': services01,
  'territoires-services-02': services02,
  'territoires-services-03': services03,
  'territoires-services-04': services04,
  'territoires-services-05': services05,
  'territoires-services-06': services06,
  'territoires-services-07': services07,
  'territoires-services-08': services08,
  'territoires-services-09': services09,
  'territoires-services-10': services10,
  'territoires-agents-01': agents01,
  'territoires-agents-02': agents02,
  'territoires-agents-03': agents03,
  'territoires-agents-04': agents04,
  'territoires-agents-05': agents05,
  'territoires-agents-06': agents06,
  'territoires-agents-07': agents07,
  'territoires-agents-08': agents08,
  'territoires-agents-09': agents09,
  'territoires-collectivites-01': coll01,
  'territoires-collectivites-02': coll02,
  'territoires-collectivites-03': coll03,
  'territoires-collectivites-04': coll04,
  'territoires-collectivites-05': coll05,
  'territoires-collectivites-06': coll06,
  'territoires-collectivites-07': coll07,
  'territoires-collectivites-08': coll08,
  'territoires-collectivites-09': coll09,
  'territoires-outre-mer-01': om01,
  'territoires-outre-mer-02': om02,
  'territoires-outre-mer-03': om03,
  'territoires-outre-mer-04': om04,
  'territoires-outre-mer-05': om05,
  'territoires-outre-mer-06': om06,
  'territoires-outre-mer-07': om07,
  'territoires-outre-mer-08': om08,
  'territoires-outre-mer-09': om09,
  'territoires-outre-mer-10': om10,
}
