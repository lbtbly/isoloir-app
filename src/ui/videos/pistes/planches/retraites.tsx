// Piste C, les planches de la série « Retraites » : un dessin par passage, composé avec la bibliothèque commune
// (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Les mots et les nombres viennent du script (mots
// mis en valeur, phrases dites, chiffre de la fiche) : si le texte change, le dessin suit ; s'il ne s'y
// retrouve plus (une planche rend null), le passage prend le dessin générique de sa sorte d'image.
// Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne les dit pas (« âge de départ »,
// « recettes ») : elles nomment ce qui est dessiné, sans rien ajouter au propos.

import { Art, Arrow, Ask, Brace, Fade, Ink, SP, Txt, W, cueOf, cuesOf, fractionOf, heard, num, plain, ratioOf, said, sentencesOf, word, yearsOf, type P } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Panel, Question, Seg, Signature, Sommaire, Src, leadOf, lineOf, listAfterColon } from '../dessin/mises'
import { Picto, pictoFor, type PictoName } from '../dessin/pictos'
import { Barriere, Cases, Disque, Move, Pause, Qui, Rang, Signe, balance, barres, colonnes, effets, frise, manettes, partPoint, rangCells, type Effet } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/** Une grandeur à plusieurs dates (« En 2002, 2,1… En 2025, 1,8… ») : les nombres mis en valeur, dans l'ordre
 *  des années dites ; une année après celle du chiffre de la fiche est une projection (pointillé) */
function datees(p: P, titleRe: RegExp) {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  if (cues.length < 2 || years.length !== cues.length) return null
  const ref = yearsOf(p.segment.figure?.date ?? '')[0] ?? years[0]!
  const title = said(p, titleRe)
  const cols = colonnes({
    items: cues.map((c, i) => ({ label: String(years[i]), value: num(c.text) ?? 0, text: c.text, ghost: years[i]! > ref, shown: c.shown })),
    y: 34,
    h: 150,
    x: 50,
    w: 200,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Art h={34 + cols.h}>
        {title ? <Txt x={W / 2} y={18} text={title} size={16} /> : null}
        {cols.el}
      </Art>
      <Src p={p} t0={1200} />
    </Seg>
  )
}

/** Les trois leviers décrits par le COR, dans l'ordre où les passages les prennent */
const LEVIERS: { label: string; picto: PictoName }[] = [
  { label: 'cotisations', picto: 'pieces' },
  { label: 'pensions', picto: 'enveloppe' },
  { label: 'âge de départ', picto: 'calendrier' },
]

/** Un levier qui bouge (« Cotiser plus ») : les leviers à gauche, ce qu'il entraîne à droite */
function levier(p: P, i: number, dir: 1 | -1, fx: (parts: string[]) => Effet[]) {
  const parts = p.segment.say
    .slice(p.segment.say.search(/[\u00a0 ]:/) + 2)
    .replace(/[.!?…]+$/, '')
    .split(/,? ou |, mais |, et /)
    .map(s => s.trim())
  const list = fx(parts).map(e => ({ ...e, shown: heard(p, e.text.split(' ').slice(0, 2).join(' ')) }))
  const lev = manettes({
    items: LEVIERS.map((l, k) => ({ picto: l.picto, pos: 0.5, to: k === i ? 0.5 + dir * 0.36 : undefined })),
    x: 60,
    w: 180,
    y: 0,
    h: 60,
    size: 30,
    kept: true,
  })
  // Trois effets : des rangées plus serrées, pour que le dessin garde sa taille
  const ef = effets({ items: list, x: 24, y: lev.h + 14, w: 276, row: list.length > 2 ? 62 : 66, t0: 300 })
  return (
    <Seg>
      <Head lines={[leadOf(p)]} />
      <Art h={lev.h + 14 + ef.h + 6}>
        {lev.el}
        {ef.el}
      </Art>
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Qui vous versera alors votre retraite ? » : vous, et une enveloppe de pension en question */
const intro01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={166}>
      <Ink d="M14 160H286" t0={100} dur={700} class="vc-soft" />
      <Picto n="personne" x={42} y={75} size={88} t0={250} />
      <Picto n="enveloppe" x={152} y={18} size={76} t0={900} />
      <Ask x={240} y={22} h={58} t0={1500} />
      <Arrow x1={180} y1={94} x2={134} y2={120} dash t0={2000} />
    </Art>
  </Seg>
)

/** 02 La répartition : les actifs d'une année paient, par leurs cotisations, les pensions de la même année */
const intro02: Board = p => {
  const cot = word(p, /cotisations/)
  const pen = word(p, /pensions/)
  const year = word(p, /la même année/)
  const actifs = [88, 136, 184, 232]
  const retraites = [136, 184]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={210}>
        {year?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d="M6 6H294V206H6Z" />
            </Fade>
            <Txt x={16} y={26} text={year.text} anchor="start" size={14} tone="soft" />
          </>
        ) : null}
        {actifs.map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 19} y={34} size={38} t0={150 + i * 120} />
        ))}
        {cot?.shown
          ? actifs.map((cx, i) => {
              const to = retraites[i < 2 ? 0 : 1]!
              const tx = to + (cx - to) * 0.3
              return (
                <g key={cx}>
                  <Arrow x1={cx} y1={80} x2={tx} y2={134} t0={i * 120} dur={450} tone="count" head={7} />
                  <Picto n="piece" x={(cx + tx) / 2 - 9} y={98} size={18} t0={250 + i * 120} tone="count" w={0.8} />
                </g>
              )
            })
          : null}
        {cot?.shown ? <Txt x={16} y={112} text={cot.text} anchor="start" size={14} /> : null}
        {retraites.map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 19} y={140} size={38} t0={700 + i * 150} />
        ))}
        {pen?.shown ? <Txt x={W / 2 + 1} y={196} text={pen.text} size={15} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 17,3 millions de retraités : une foule qui se remplit rangée par rangée */
const intro03: Board = p => {
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

/** 04 14,1 % du PIB : le disque de la richesse produite en un an, et la part des retraites */
const intro04: Board = p => {
  const [md, pct] = cuesOf(p)
  const part = (num(pct?.text) ?? 0) / 100
  if (!part) return null
  const richesse = word(p, /la richesse produite en un an/)
  const total = md ? said(p, new RegExp(`${md.text.replace(/[\s\u00a0]/g, SP)}[^.,]*`)) : null
  const tip = partPoint(84, 84, 56, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        <Disque cx={84} cy={84} r={78} part={part} shown={!!pct?.shown} t0={300} />
        {said(p, /PIB/) ? <Txt x={84} y={112} text="PIB" size={24} big t0={900} /> : null}
        {total && md?.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L176 34`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={180} y={30} text={total} max={13} size={16} anchor="start" tone="count" t0={500} />
          </>
        ) : null}
        {richesse?.shown ? <Txt x={174} y={108} text={richesse.text} max={18} size={14} anchor="start" tone="soft" /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 « un euro sur quatre » : quatre pièces, l'une comptée, une enveloppe de pension dessus */
const intro05: Board = p => {
  const cue = cueOf(p, 0)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const { cells, h } = rangCells({ n: r.n, y: 44, max: 60, gap: 18 })
  const all = word(p, /toutes les dépenses publiques/)
  const first = cells[0]!
  const last = cells[cells.length - 1]!
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={44 + h + 64}>
        <Rang n={r.n} picto="piece" y={44} max={60} gap={18} count={range(r.k)} shown={cue.shown} t0={200} stagger={200} />
        {cue.shown ? <Picto n="enveloppe" x={first.x + first.size / 2 - 17} y={2} size={34} tone="count" t0={400} /> : null}
        <Brace x1={first.x} y1={44 + h + 10} x2={last.x + last.size} y2={44 + h + 10} t0={1200} />
        {all ? <Txt x={W / 2} y={44 + h + 52} text={all.text} size={15} t0={1500} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Cotisants pour un retraité : 2,1 en 2002, 1,8 en 2025, 1,3 projeté en 2070 */
const intro06: Board = p => datees(p, /cotisants pour un retraité/)

/**
 * 07 « il manque 5,1 milliards, sur plus de 400 milliards dépensés » : deux piles à la même échelle ; l'écart,
 * trop fin pour se voir à l'échelle, est montré du doigt plutôt que grossi
 */
const intro07: Board = p => {
  const cue = cueOf(p, 0)
  const gap = num(cue?.text)
  const spentText = word(p, /plus de \d+ milliards dépensés/)
  const spent = num(spentText?.text)
  if (!cue || !gap || !spent) return null
  const H = 150
  const base = 198
  const ht = H * (1 - gap / spent)
  const col = (x: number, h: number) => `M${x} ${base}V${base - h}H${x + 56}V${base}`
  const bands = (x: number, h: number) => range(Math.floor(h / 12)).map(k => `M${x} ${base - 12 * (k + 1)}h56`).join('')
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={228}>
        <Ink d={`M20 ${base}H280`} t0={0} dur={500} class="vc-soft" />
        <Ink d={col(70, ht)} t0={200} dur={700} />
        <Ink d={bands(70, ht)} t0={600} dur={500} class="vc-thin vc-soft" />
        <Ink d={col(174, H)} t0={500} dur={700} />
        <Ink d={bands(174, H)} t0={900} dur={500} class="vc-thin vc-soft" />
        <Txt x={98} y={base + 22} text="recettes" size={15} t0={700} />
        <Txt x={202} y={base + 22} text="dépenses" size={15} t0={1000} />
        {cue.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M60 ${base - H}H236`} />
            </Fade>
            <Arrow x1={40} y1={base - H - 20} x2={66} y2={base - H - 4} tone="count" t0={200} />
            <Txt x={12} y={base - H - 26} text={`il manque ${cue.text}`} anchor="start" size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Âge minimum et trimestres : deux conditions ; puis, sur la ligne des âges, l'âge moyen de départ */
const intro08: Board = p => {
  const cue = cueOf(p, 0)
  const age = num(cue?.text)
  const min = word(p, /l’âge minimum|l'âge minimum/)
  const trim = word(p, /assez de trimestres/)
  if (!cue || !age) return null
  const f = frise({ y: 176, from: 60, to: 66, x0: 24, x1: 276, ticks: [60, 61, 62, 63, 64, 65, 66], labels: [60, 62, 64, 66], t0: 300 })
  const fx = f.X(age)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={204}>
        <Signe n="barriere" cx={78} y={0} size={54} label={min?.text} shown={!!min?.shown} t0={200} max={16} />
        <Signe n="trimestres" cx={222} y={0} size={54} label={trim?.text} shown={!!trim?.shown} t0={700} max={16} />
        {f.el}
        {cue.shown ? (
          <>
            <Picto n="drapeau" x={fx - 11} y={176 - 43} size={46} tone="count" t0={100} />
            <Txt x={fx + 6} y={126} text={cue.text} size={20} big tone="count" t0={500} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro09: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map(q => ({
          picto: pictoFor(q) ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 10 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro10: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Âge de départ ——— */

/** 01 Deux compteurs : votre âge (un cadran), vos trimestres (une grille) */
const age01: Board = p => {
  const [a, t] = cuesOf(p)
  const head = word(p, /deux compteurs/)
  return (
    <Seg>
      <Head lines={[head ? { text: head.text, shown: head.shown } : null]} />
      <Art h={150}>
        <Signe n="cadran" cx={80} y={4} size={96} label={a?.text} shown={!!a?.shown} t0={300} />
        <Signe n="trimestres" cx={220} y={4} size={96} label={t?.text} shown={!!t?.shown} t0={900} />
      </Art>
    </Seg>
  )
}

/** 02 L'âge légal : une barrière sur la ligne de vie ; à côté, le chemin des exceptions (carrières longues) */
const age02: Board = p => {
  const exc = word(p, /carrières longues/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={176}>
        <Ink d="M10 112H290" t0={100} dur={700} />
        <Qui cx={42} base={110} size={62} t0={300} />
        <Barriere x={206} y={112} s={1.7} t0={700} />
        {exc?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d="M108 120C132 160 214 160 238 120M238 120l-2.5 9.5M238 120l-9 3.6" />
            </Fade>
            <Txt x={174} y={170} text={exc.text} size={15} tone="soft" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Les trimestres : s'il en manque, la pension baisse ; sauf à 67 ans */
const age03: Board = p => {
  const cue = cueOf(p, 0)
  const age = num(cue?.text)
  const trim = word(p, /trimestres/)
  const manque = word(p, /S’il en manque|S'il en manque/)
  const baisse = word(p, /la pension baisse/)
  if (!cue || !age) return null
  const f = frise({ y: 182, from: age - 5, to: age + 1, x0: 24, x1: 276, ticks: range(7).map(k => age - 5 + k), t0: 200 })
  const fx = f.X(age)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={196}>
        <Cases n={16} cols={4} x={22} y={10} size={15} gap={4} ghost={manque?.shown ? [14, 15] : []} t0={200} />
        {trim ? <Txt x={52} y={102} text={trim.text} size={14} tone="soft" t0={600} /> : null}
        {manque?.shown ? <Arrow x1={104} y1={46} x2={150} y2={46} t0={200} /> : null}
        {baisse?.shown ? (
          <>
            <Picto n="enveloppe" x={160} y={4} size={86} tone="ghost" />
            <Picto n="enveloppe" x={174} y={18} size={58} t0={100} />
            <Txt x={203} y={102} text={baisse.text} size={14} t0={400} />
          </>
        ) : null}
        {f.el}
        {cue.shown ? (
          <>
            <Picto n="drapeau" x={fx - 10} y={182 - 42} size={44} tone="count" />
            <Picto n="enveloppe" x={fx + 20} y={182 - 44} size={34} tone="count" t0={300} />
            <Txt x={fx - 14} y={170} text={cue.text} anchor="end" size={18} big tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 La réforme de 2023 : la barrière glisse de 62 à 64 ans ; la durée exigée, 172 trimestres */
const age04: Board = p => {
  const m = /de (\d+) à (\d+) ans/.exec(plain(p.segment.say))
  const [ageCue, trimCue] = cuesOf(p)
  const n = num(trimCue?.text)
  if (!m || !ageCue || !trimCue || !n || n > 240) return null
  const a0 = Number(m[1])
  const a1 = Number(m[2])
  const X = (a: number) => 112 + (a - a0) * 46
  const top = 92 - 70
  const cols = Math.ceil(n / 4)
  const size = Math.min(5, (264 - (cols - 1) * 1.2) / cols)
  return (
    <Seg>
      <Art h={206}>
        <Ink d="M10 92H290" t0={0} dur={600} />
        <Ink d={[a0 - 1, a0, a0 + 1, a1, a1 + 1].map(a => `M${X(a)} 87v10`).join('')} t0={300} dur={300} class="vc-soft vc-thin" />
        <Qui cx={36} base={90} size={50} t0={150} />
        <Barriere x={X(a0)} y={92} s={1.25} kept tone={ageCue.shown ? 'ghost' : undefined} />
        <Txt x={X(a0)} y={118} text={String(a0)} size={18} big tone="soft" kept />
        {ageCue.shown ? (
          <>
            <g transform={`translate(${X(a1)} 92)`}>
              <g class="vc-slide" style={{ '--from': `${X(a0) - X(a1)}px`, '--d': '100ms', '--t': '1200ms' }}>
                <Barriere x={0} y={0} s={1.25} kept tone="count" />
              </g>
            </g>
            <Ink d={`M${X(a0) + 4} ${top}C${X(a0) + 30} ${top - 22} ${X(a1) - 30} ${top - 22} ${X(a1) - 4} ${top}l-1.4-9.6M${X(a1) - 4} ${top}l-9.4 2.4`} t0={200} dur={1000} class="vc-count" />
            <Txt x={X(a1)} y={118} text={ageCue.text} size={18} big tone="count" t0={600} />
          </>
        ) : null}
        {trimCue.shown ? (
          <>
            <Cases n={n} cols={cols} x={(W - cols * (size + 1.2)) / 2} y={140} size={size} gap={1.2} count={range(n)} solid />
            <Txt x={W / 2} y={200} text={trimCue.text} size={18} big tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Suspendue jusqu'en 2028, pas annulée : la réforme en pause jusqu'au calendrier ; la génération 1969 devant
 *  la barrière de 64 ans */
const age05: Board = p => {
  const [until, nuance, gen] = cuesOf(p)
  const year = yearsOf(until?.text ?? '')[0]
  const reform = said(p, /réforme de \d{4}/)
  const generation = word(p, /génération \d{4}/)
  const legal = word(p, /\d+[\s\u00a0]ans/)
  if (!until || !year) return null
  return (
    <Seg>
      <Head lines={[lineOf(nuance)]} />
      <Art h={212}>
        <Picto n="document" x={12} y={0} size={92} t0={100} />
        {reform ? <Txt x={58} y={110} text={reform} size={14} tone="soft" t0={500} /> : null}
        <Pause x={86} y={72} r={18} t0={700} />
        {until.shown ? (
          <>
            <Arrow x1={110} y1={42} x2={160} y2={42} dash t0={100} />
            <Picto n="calendrier" x={170} y={2} size={84} t0={250} />
            <Txt x={212} y={74} text={String(year)} size={22} big t0={700} />
          </>
        ) : null}
        {gen?.shown ? (
          <>
            <Ink d="M10 196H290" t0={0} dur={600} class="vc-soft" />
            <Qui cx={44} base={194} size={50} tone="count" t0={100} />
            {generation ? <Txt x={84} y={190} text={generation.text} size={15} anchor="start" t0={300} /> : null}
            <Barriere x={262} y={196} s={1.15} t0={500} />
            {legal?.shown ? <Txt x={246} y={140} text={legal.text} size={18} big t0={0} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 1,8 milliard par an : une tirelire d'où s'échappent des pièces, l'étiquette « par an » */
const age06: Board = p => {
  const parAn = word(p, /par an/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        <Picto n="tirelire" x={78} y={4} size={112} t0={300} />
        {[0, 1, 2].map(k => (
          <Picto key={k} n="piece" x={204 + k * 26} y={70 + (k % 2) * 22} size={24} t0={1200 + k * 200} />
        ))}
        <Arrow x1={186} y1={86} x2={204} y2={96} dash t0={1100} />
        {parAn ? (
          <>
            <Ink d="M84 62C70 62 62 70 58 78" t0={1500} dur={300} class="vc-thin" />
            <Picto n="etiquette" x={6} y={64} size={58} t0={1600} />
            <Txt x={30} y={120} text={parAn.text} size={15} t0={2000} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Reculer l'âge rapporte deux fois : plus de cotisations ; des pensions versées moins longtemps */
const age07: Board = p => {
  const a = word(p, /plus de cotisations/)
  const b = word(p, /des pensions versées moins longtemps/)
  if (!a || !b) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="pieces" x={40} y={6} size={64} t0={200} />
        <Picto n="sablier" x={188} y={6} size={64} t0={600} />
        <Txt x={W / 2} y={50} text="+" size={30} big tone="soft" t0={1000} />
        {a.shown ? (
          <>
            <Picto n="hausse" x={104} y={20} size={28} tone="count" t0={0} w={1.2} />
            <Txt x={75} y={104} text={a.text} max={13} size={15} t0={200} />
          </>
        ) : null}
        {b.shown ? (
          <>
            <Picto n="baisse" x={250} y={20} size={28} tone="count" t0={0} w={1.2} />
            <Txt x={224} y={104} text={b.text} max={14} size={15} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 Le taux d'emploi des 60-64 ans : deux marches, +3,4 points en 2024, puis +2 en 2025 */
const age08: Board = p => {
  const say = plain(p.segment.say)
  const m1 = /(\d+(?:,\d+)?) points? en (\d{4})/.exec(say)
  const m2 = /puis (\d+(?:,\d+)?) en (\d{4})/.exec(say)
  if (!m1 || !m2) return null
  const s1 = num(m1[1])!
  const s2 = num(m2[1])!
  const k = 15
  const base = 120
  const y1 = base - s1 * k
  const y2 = y1 - s2 * k
  const shown2 = heard(p, `puis ${m2[1]}`)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={base + 60}>
        <Ink d={`M14 ${base + 30}H286`} t0={0} dur={500} class="vc-soft" />
        <Ink d={`M20 ${base}H100V${y1}H190`} t0={200} dur={1000} class="vc-count" />
        <Txt x={60} y={base + 52} text="avant" size={14} tone="soft" t0={300} />
        <Brace x1={104} y1={base} x2={104} y2={y1} side={-1} t0={900} tone="count" />
        <Txt x={88} y={(base + y1) / 2 + 6} text={`+${m1[1]}`} size={20} big anchor="end" tone="count" t0={1000} />
        <Txt x={145} y={base + 52} text={m1[2]!} size={15} tone="soft" t0={1100} />
        {shown2 ? (
          <>
            <Ink d={`M190 ${y1}V${y2}H282`} t0={0} dur={600} class="vc-count" />
            <Txt x={182} y={(y1 + y2) / 2 + 6} text={`+${m2[1]}`} size={20} big anchor="end" tone="count" t0={300} />
            <Txt x={236} y={base + 52} text={m2[2]!} size={15} tone="soft" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Près d'un tiers des économies repart en autres dépenses sociales : chômage, maladie, invalidité, minima */
const age09: Board = p => {
  const cue = cueOf(p, 0)
  const frac = fractionOf(cue?.text)
  const list = listAfterColon(p.segment.say).slice(0, 5)
  const eco = word(p, /économies/)
  if (!cue || !frac || list.length < 2) return null
  const top = 20
  const H = 156
  const cut = top + H * frac
  const row = Math.min(40, (H + 10) / list.length)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={204}>
        <Ink d={`M30 ${top}H96V${top + H}H30Z`} t0={100} dur={900} />
        <Ink d={range(Math.floor(H / 13)).map(k => `M30 ${top + 13 * (k + 1)}h66`).join('')} t0={600} dur={500} class="vc-thin vc-soft" />
        {eco ? <Txt x={63} y={top + H + 22} text={eco.text} size={15} t0={700} /> : null}
        {cue.shown ? (
          <>
            <Fade class="vc-count">
              <rect class="vc-tint-count" x={30} y={top} width={66} height={cut - top} />
              <path d={`M30 ${top}H96V${cut}H30Z`} />
            </Fade>
            <Arrow x1={102} y1={(top + cut) / 2} x2={140} y2={(top + cut) / 2} tone="count" t0={300} />
            {list.map((l, i) => (
              <g key={l}>
                <Picto n="guichet" x={148} y={top - 4 + i * row} size={30} t0={600 + i * 250} />
                <Txt x={184} y={top + 18 + i * row} text={l} size={15} anchor="start" t0={700 + i * 250} />
              </g>
            ))}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 10 L'espérance de vie sans incapacité à 65 ans : hommes, femmes, à la même échelle */
const age10: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const ha = word(p, /hommes/)
  const fe = word(p, /femmes/)
  const from = word(p, /\d+[\s\u00a0]ans/)
  if (!a || !b || !va || !vb) return null
  const unit = /ans/.test(a.text) ? a.text.replace(/^[\d,]+/, '') : '\u00a0ans'
  const g = barres({
    items: [
      { label: ha?.text, value: va, text: a.text, shown: a.shown },
      { label: fe?.text, value: vb, text: `${b.text}${/ans/.test(b.text) ? '' : unit}`, shown: b.shown },
    ],
    x: 24,
    w: 276,
    y: 30,
    size: 24,
    gap: 30,
    room: 96,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={30 + g.h + 30}>
        <Picto n="sablier" x={0} y={0} size={24} t0={0} />
        {from ? <Txt x={30} y={18} text={`à partir de ${from.text}`} size={14} anchor="start" tone="soft" /> : null}
        <Ink d={`M24 26V${30 + g.h + 6}`} t0={100} dur={400} class="vc-soft" />
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 11 « c'est la balance du débat » : financement et emploi d'un côté, santé de l'autre, fléau à l'horizontale */
const age11: Board = p => {
  const left = word(p, /Financement et emploi/i)
  const right = word(p, /santé/)
  const b = balance({ left: ['tirelire', 'mallette'], right: ['coeur'], labels: [left?.text ?? null, right?.text ?? null], shown: [!!left?.shown, !!right?.shown], t0: 200 })
  return (
    <Seg kind="end">
      <HeadCues p={p} />
      <Art h={b.h}>{b.el}</Art>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Financement ——— */

/** 01 « Retraite » sur la fiche de paie : cet argent ne va pas dans une tirelire à votre nom, mais aux retraités */
const fin01: Board = p => {
  const cue = cueOf(p, 0)
  const aside = word(p, /pas mis de côté/)
  const who = said(p, /retraités/)
  if (!cue) return null
  const quoted = new RegExp(`«[\\s\\u00a0]*${cue.text}[\\s\\u00a0]*»`).test(p.segment.say)
  const lines = [52, 70, 88, 124, 142, 160].map(y => `M28 ${y}H110`).join('')
  return (
    <Seg>
      <Head lines={[{ text: quoted ? `«\u00a0${cue.text}\u00a0»` : cue.text, shown: cue.shown, mark: cue }]} />
      <Art h={190}>
        <Ink d="M14 10H104L124 30V180H14Z" t0={100} dur={900} />
        <Ink d="M104 10V30H124" t0={600} dur={300} />
        <Ink d={lines} t0={700} dur={500} class="vc-thin vc-soft" />
        <Fade t0={900} class="vc-count">
          <rect class="vc-tint-count" x={22} y={96} width={94} height={20} />
        </Fade>
        <Txt x={30} y={111} text={cue.text} size={14} anchor="start" tone="count" t0={1000} />
        <Picto n="tirelire" x={150} y={110} size={60} tone="ghost" />
        {aside?.shown ? <Txt x={180} y={186} text={aside.text} size={14} tone="soft" /> : null}
        <Ink d="M128 106C170 106 170 70 214 66" t0={1300} dur={700} class="vc-count" />
        <Ink d="M214 66l-8.5-4.6M214 66l-7.4 6" t0={1950} dur={200} class="vc-count" />
        {[220, 248, 276].map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 14} y={34} size={28} t0={1500 + i * 150} w={0.9} />
        ))}
        {who ? <Txt x={248} y={84} text={who} size={14} t0={2000} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 La répartition : trois générations en escalier, chacune paie la pension de celle du dessus */
const fin02: Board = p => {
  const today = word(p, /les pensions d’aujourd’hui|les pensions d'aujourd'hui/)
  const steps: [number, number][] = [
    [58, 186],
    [148, 136],
    [240, 86],
  ]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={192}>
        <Ink d="M12 188H104V138H194V88H288" t0={100} dur={1000} />
        {steps.map(([cx, base], i) => (
          <Picto key={cx} n="personne" x={cx - 22} y={base - 44} size={44} t0={400 + i * 250} />
        ))}
        {[0, 1].map(i => {
          const [x1, b1] = steps[i]!
          const [x2, b2] = steps[i + 1]!
          return (
            <g key={i}>
              <Arrow x1={x1 + 26} y1={b1 - 30} x2={x2 - 30} y2={b2 - 22} t0={1200 + i * 400} tone="count" />
              <Picto n="piece" x={(x1 + x2) / 2 - 9} y={(b1 + b2) / 2 - 44} size={20} tone="count" t0={1300 + i * 400} w={0.8} />
            </g>
          )
        })}
        {today?.shown ? <Txt x={182} y={22} text={today.text} max={18} size={15} anchor="middle" /> : null}
      </Art>
    </Seg>
  )
}

/** 03 417 milliards, dont près des deux tiers en cotisations : le disque des ressources */
const fin03: Board = p => {
  const cue = cuesOf(p)[1]
  const frac = fractionOf(cue?.text)
  const cot = word(p, /cotisations/)
  if (!cue || !frac) return null
  const tip = partPoint(84, 82, 56, frac)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={166}>
        <Disque cx={84} cy={82} r={78} part={frac} shown={cue.shown} t0={300} />
        {cue.shown && cot ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L190 112`} t0={400} dur={400} class="vc-count vc-thin" />
            <Txt x={194} y={108} text={cue.text} size={16} anchor="start" tone="count" t0={600} />
            <Txt x={194} y={128} text={cot.text} size={16} anchor="start" tone="count" t0={700} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Moins de cotisants par retraité : 1,8 en 2025, 1,3 projeté en 2070 */
const fin04: Board = p => datees(p, /cotisants par retraité/)

/** 05 Trois leviers : cotisations, pensions, âge de départ */
const fin05: Board = p => {
  const lev = manettes({ items: LEVIERS.map(l => ({ ...l, pos: 0.5 })), y: 4, h: 80, size: 44, t0: 300, labelMax: 14 })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={lev.h + 6}>{lev.el}</Art>
    </Seg>
  )
}

/** 06 Cotiser plus : les pensions sont préservées, mais le salaire net baisse, ou le travail coûte plus cher à
 *  l'employeur (chaque levier : ce que le système y gagne, puis qui porte l'effort) */
const fin06: Board = p =>
  levier(p, 0, 1, ([a, b, c]) => {
    const out: Effet[] = []
    if (a) out.push({ picto: 'enveloppe', text: a })
    if (b) out.push({ picto: 'document', dir: 'baisse', text: b })
    if (c) out.push({ picto: 'etiquette', dir: 'hausse', text: c })
    return out
  })

/** 07 Revaloriser les pensions moins vite : les dépenses baissent tout de suite, mais le revenu des retraités
 *  ralentit */
const fin07: Board = p =>
  levier(p, 1, -1, ([a, b]) => {
    const out: Effet[] = []
    if (a) out.push({ picto: 'pieces', dir: 'baisse', text: a })
    if (b) out.push({ picto: 'enveloppe', text: b })
    return out
  })

/** 08 Partir plus tard : plus de cotisations et des pensions versées moins longtemps, mais des années de travail
 *  en plus, et à court terme, plus d'allocations versées */
const fin08: Board = p =>
  levier(p, 2, 1, ([a, b, c]) => {
    const out: Effet[] = []
    if (a) out.push({ picto: 'pieces', dir: 'hausse', text: a })
    if (b) out.push({ picto: 'mallette', dir: 'hausse', text: b })
    if (c) out.push({ picto: 'guichet', dir: 'hausse', text: c })
    return out
  })

/** 09 La capitalisation : une tirelire à soi, à côté de la chaîne des générations ; 2,7 millions en touchent une */
const fin09: Board = p => {
  const cue = cueOf(p, 0)
  const rep = said(p, /la répartition/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        {[16, 62, 108].map((x, i) => (
          <Picto key={x} n="personne" x={x} y={40} size={36} t0={100 + i * 120} tone="soft" w={0.9} />
        ))}
        <Ink d="M52 62h10M98 62h10" t0={500} dur={300} class="vc-soft vc-thin" />
        {rep ? <Txt x={80} y={104} text={rep} size={14} tone="soft" t0={600} /> : null}
        <Picto n="tirelire" x={170} y={30} size={74} tone={cue?.shown ? 'count' : undefined} t0={700} />
        <Arrow x1={250} y1={34} x2={266} y2={14} t0={1300} />
        <Picto n="enveloppe" x={262} y={-6} size={30} t0={1400} w={0.9} />
        {cue?.shown ? <Txt x={207} y={124} text={cue.text} size={15} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 10 Deux modèles face à face : la capitalisation (elle peut rapporter plus) et des marchés plus instables, la
 *  répartition et la démographie, et des choix politiques. Chaque colonne se lit comme le texte dit : le mot
 *  qui compte en bleu sur la même ligne des deux côtés, sa suite dessous. */
const fin10: Board = p => {
  const [plus, marches, demo] = cuesOf(p)
  const cap = said(p, /la capitalisation/)
  const rep = said(p, /la répartition/)
  const instables = word(p, /plus instables/)
  const choix = word(p, /et des choix politiques/)
  if (!marches || !demo) return null
  return (
    <Seg>
      <Art h={222}>
        {cap ? <Txt x={75} y={16} text={cap} size={15} tone="soft" /> : null}
        {rep ? <Txt x={225} y={16} text={rep} size={15} tone="soft" /> : null}
        <Ink d="M150 6V214" t0={0} dur={500} class="vc-soft vc-thin" />
        <Picto n="tirelire" x={18} y={26} size={52} t0={200} />
        {/* « rapporter plus » se rattache à la tirelire, pas à la ligne des marchés */}
        {plus?.shown ? (
          <>
            <Arrow x1={82} y1={72} x2={82} y2={36} t0={0} head={6} tone="count" />
            <Txt x={90} y={48} text={plus.text} max={9} size={13} anchor="start" t0={150} />
          </>
        ) : null}
        {[188, 212, 236].map((x, i) => (
          <Picto key={x} n="personne" x={x - 2} y={34} size={28} t0={400 + i * 100} w={0.8} />
        ))}
        {marches.shown ? <Picto n="bourse" x={36} y={84} size={78} t0={0} tone="count" /> : null}
        {demo.shown ? <Picto n="pyramide" x={186} y={84} size={78} t0={0} tone="count" /> : null}
        {marches.shown ? <Txt x={75} y={180} text={marches.text} size={15} tone="count" /> : null}
        {instables?.shown ? <Txt x={75} y={198} text={instables.text} size={15} /> : null}
        {demo.shown ? <Txt x={225} y={180} text={demo.text} size={15} tone="count" /> : null}
        {choix?.shown ? <Txt x={225} y={198} text={choix.text} max={14} size={15} /> : null}
      </Art>
    </Seg>
  )
}

/** 11 Passer à la capitalisation : les mêmes actifs paieraient deux retraites à la fois */
const fin11: Board = p => (
  <Seg>
    <HeadCues p={p} />
    <Art h={150}>
      <Qui cx={56} base={130} size={84} t0={100} />
      <Picto n="piece" x={104} y={58} size={26} tone="count" t0={600} />
      <Arrow x1={134} y1={64} x2={188} y2={34} t0={900} tone="count" />
      <Arrow x1={134} y1={76} x2={188} y2={110} t0={1100} tone="count" />
      <Picto n="enveloppe" x={198} y={4} size={60} t0={1300} />
      <Picto n="tirelire" x={198} y={82} size={60} t0={1500} />
    </Art>
  </Seg>
)

/** 12 « Actifs, retraités, entreprises : qui porte l'effort, et comment ? » : les leviers sur la table, en attente */
const fin12: Board = p => {
  const lev = manettes({ items: LEVIERS.map(l => ({ picto: l.picto, pos: 0.5 })), x: 0, w: 150, y: 6, h: 64, size: 28, kept: true })
  return (
    <Seg kind="ask">
      <Art h={lev.h + 8}>
        {lev.el}
        <Picto n="tirelire" x={168} y={52} size={64} t0={300} />
        <Ask x={248} y={8} h={64} t0={900} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Montant des pensions ——— */

/** 01 1 705 euros bruts par mois en moyenne ; mais la moyenne cache des écarts */
const pen01: Board = p => {
  const ecarts = word(p, /écarts/)
  const moy = word(p, /la moyenne/)
  const bars = [34, 58, 26, 84, 48, 68]
  const mean = bars.reduce((s, v) => s + v, 0) / bars.length
  const base = 112
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={144}>
        <Picto n="billet" x={20} y={6} size={70} t0={200} w={0.9} />
        <path class="vc-paper" d="M17.5 49.8H104.5V104.7H17.5Z" />
        <Picto n="enveloppe" x={6} y={20} size={110} t0={500} />
        {ecarts?.shown ? (
          <>
            <Ink d={`M146 ${base}H294`} t0={0} dur={400} class="vc-soft" />
            {bars.map((h, i) => (
              <Ink key={i} d={`M${156 + i * 23} ${base}V${base - h}h14V${base}`} t0={100 + i * 120} dur={400} />
            ))}
            <Fade t0={900} class="vc-count vc-dash">
              <path d={`M146 ${base - mean}H294`} />
            </Fade>
            {moy ? (
              <>
                <Fade t0={1000} class="vc-count vc-dash">
                  <path d={`M150 ${base + 24}h22`} />
                </Fade>
                <Txt x={178} y={base + 29} text={moy.text} size={14} anchor="start" tone="count" t0={1000} />
              </>
            ) : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Une carrière : les salaires année après année (un dessin, pas des données) */
const CARRIERE = range(42).map(i => 34 + 92 * (1 - Math.exp(-i / 13)) + [0, 9, -6, 4, -10, 7, -3][i % 7]!)

/** 02 La pension de base : la moitié du salaire moyen des 25 meilleures années, plus une complémentaire */
const pen02: Board = p => {
  const [half, best] = cuesOf(p)
  const n = num(best?.text)
  const moyen = word(p, /salaire moyen/)
  const comp = word(p, /complémentaire/)
  if (!half || !best || !n || n >= CARRIERE.length) return null
  const base = 168
  const top = [...CARRIERE].sort((a, b) => b - a).slice(0, n)
  const cut = top[top.length - 1]!
  const mean = top.reduce((s, v) => s + v, 0) / n
  const x = (i: number) => 10 + i * 4.6
  const bar = (i: number) => `M${x(i)} ${base}V${base - CARRIERE[i]!}`
  const counted = range(CARRIERE.length).filter(i => CARRIERE[i]! >= cut).slice(0, n)
  const plain = range(CARRIERE.length).filter(i => !counted.includes(i))
  return (
    <Seg>
      <Art h={200}>
        <Ink d={`M6 ${base}H206`} t0={0} dur={500} class="vc-soft" />
        <Ink d={(best.shown ? plain : range(CARRIERE.length)).map(bar).join('')} t0={150} dur={900} class="vc-thin" />
        {best.shown ? (
          <>
            <Fade class="vc-count">
              <path d={counted.map(bar).join('')} class="vc-wide" />
            </Fade>
            <Txt x={108} y={190} text={best.text} size={15} tone="count" t0={200} />
            <Fade t0={600} class="vc-dash">
              <path d={`M6 ${base - mean}H206`} />
            </Fade>
            {moyen ? <Txt x={10} y={base - mean - 8} text={moyen.text} size={14} anchor="start" t0={700} /> : null}
          </>
        ) : null}
        {half.shown ? (
          <>
            <Ink d={`M6 ${base - mean / 2}H210`} t0={0} dur={600} class="vc-count vc-bold" />
            <Txt x={214} y={base - mean / 2 + 5} text={half.text} size={16} anchor="start" tone="count" t0={300} />
            <Picto n="enveloppe" x={222} y={base - mean / 2 - 64} size={56} t0={600} tone="count" />
          </>
        ) : null}
        {comp?.shown ? (
          <>
            <Txt x={226} y={base - mean / 2 + 44} text="+" size={20} big anchor="end" t0={0} />
            <Picto n="enveloppe" x={232} y={base - mean / 2 + 16} size={38} t0={0} />
            <Txt x={256} y={base - mean / 2 + 70} text={comp.text} size={13} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 et 04 Femmes et hommes : la pension moyenne à la même échelle, l'écart marqué ; puis la réversion */
function ecart(p: P, withExt: boolean) {
  const cues = cuesOf(p)
  const gapNow = num(cues[0]?.text)
  const first = withExt ? num(/(\d+)[\s\u00a0]%[\s\u00a0]plus basse que/.exec(p.script.segments.map(s => s.say).join(' '))?.[1]) : gapNow
  const fe = said(p, /femmes/)
  const ho = said(p, /hommes/)
  if (!gapNow || !first || !fe || !ho) return null
  const ext = withExt ? 100 - gapNow : undefined
  const g = barres({ items: [{ label: fe, value: 100 - first, ext }, { label: ho, value: 100 }], y: 52, size: 26, gap: 34, room: 50, t0: withExt ? 0 : 200, kept: withExt })
  const [f, h] = g.geo
  const from = withExt ? f!.x0 + ext! * g.scale : f!.x1
  const shown = !!cues[0]?.shown
  const rev = withExt ? cues[1] : null
  return (
    <Seg>
      <Art h={52 + g.h + (rev ? 30 : 8)}>
        {g.el}
        <Fade kept={withExt} t0={900} class="vc-dash vc-soft">
          <path d={`M${h!.x1} ${f!.top - 8}V${h!.bottom}`} />
        </Fade>
        {shown ? (
          <>
            <Brace x1={from} y1={f!.top - 6} x2={h!.x1} y2={f!.top - 6} side={-1} tone="count" t0={200} />
            <Txt x={(from + h!.x1) / 2} y={f!.top - 24} text={cues[0]!.text} size={20} big tone="count" t0={400} />
          </>
        ) : null}
        {rev?.shown ? <Txt x={(f!.x1 + from) / 2} y={f!.bottom + 20} text={rev.text} size={14} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

const pen03: Board = p => ecart(p, false)
const pen04: Board = p => ecart(p, true)

/** 05 Le minimum vieillesse : un plancher sous les plus petites pensions, qui remonte les plus basses */
const pen05: Board = p => {
  const mv = word(p, /le minimum vieillesse/)
  const des = word(p, /dès \d+[\s\u00a0]ans/)
  const floor = 70
  const base = 140
  const bars = [30, 48, 62, 96, 108, 124]
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        <Ink d={`M10 ${base}H290`} t0={0} dur={500} class="vc-soft" />
        {bars.map((h, i) => (
          <Ink key={i} d={`M${24 + i * 44} ${base}V${base - h}h26V${base}`} t0={200 + i * 120} dur={400} />
        ))}
        {mv?.shown ? (
          <>
            <Ink d={`M10 ${base - floor}H290`} t0={0} dur={600} class="vc-count vc-bold" />
            <Txt x={12} y={base - floor - 10} text={mv.text} size={14} anchor="start" tone="count" t0={300} />
            {bars.map((h, i) =>
              h < floor ? (
                <g key={i}>
                  <Fade t0={700 + i * 150} class="vc-count">
                    <rect class="vc-tint-count" x={24 + i * 44} y={base - floor} width={26} height={floor - h} />
                  </Fade>
                  <Arrow x1={37 + i * 44} y1={base - h - 4} x2={37 + i * 44} y2={base - floor + 6} t0={600 + i * 150} tone="count" head={6} />
                </g>
              ) : null,
            )}
          </>
        ) : null}
        {des?.shown ? <Txt x={290} y={base + 22} text={des.text} size={14} anchor="end" tone="soft" /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Les pensions de base suivent les prix : l'étiquette et l'enveloppe montent ensemble d'un cran */
const pen06: Board = p => {
  const prix = word(p, /les prix/)
  const pens = word(p, /les pensions de base/)
  const v = p.segment.figure?.value
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Ink d="M20 128H280" t0={0} dur={500} class="vc-soft" />
        <g class="vc-slide-y" style={{ '--from': '16px', '--d': '1200ms', '--t': '900ms' }}>
          <Picto n="etiquette" x={58} y={44} size={64} t0={200} />
          <Picto n="enveloppe" x={178} y={44} size={64} t0={500} />
        </g>
        <Picto n="hausse" x={126} y={50} size={22} tone="count" t0={1300} w={1.2} />
        <Picto n="hausse" x={246} y={50} size={22} tone="count" t0={1300} w={1.2} />
        {v ? <Txt x={W / 2} y={30} text={v} size={20} big tone="count" t0={1500} /> : null}
        {prix ? <Txt x={90} y={124} text={prix.text} size={14} t0={600} /> : null}
        {pens ? <Txt x={210} y={124} text={pens.text} size={14} t0={800} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les salaires montent en général un peu plus vite que les prix : deux droites du même point */
const pen07: Board = p => {
  const sal = word(p, /les salaires/)
  const prix = word(p, /les prix/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={168}>
        <Ink d="M30 10V150H290" t0={0} dur={700} class="vc-soft" />
        <Ink d="M30 150L272 42" t0={400} dur={1100} />
        <Ink d="M30 150L272 76" t0={700} dur={1100} />
        {sal?.shown ? <Txt x={266} y={30} text={sal.text} size={15} anchor="end" t0={200} /> : null}
        {prix?.shown ? <Txt x={272} y={102} text={prix.text} size={15} anchor="end" t0={200} /> : null}
        <Ink d="M30 150h.5" t0={300} dur={100} class="vc-dot" />
      </Art>
    </Seg>
  )
}

/** 08 Le niveau de vie des retraités rapporté à celui de la population : 100,2 % en 2023, 90,3 % en 2070, tous
 *  deux en hausse (projection : pointillé) */
const pen08: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const [y0, y1] = yearsOf(p.segment.say)
  const pop = word(p, /la population/)
  const ret = said(p, /retraités/)
  if (!a || !b || !va || !vb || !y0 || !y1) return null
  // Hauteurs depuis zéro : la population passe de 50 à 120 (un dessin), les retraités en gardent le rapport dit
  const base = 160
  const P0 = 50
  const P1 = 120
  const R0 = (P0 * va) / 100
  const R1 = (P1 * vb) / 100
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={190}>
        <Ink d={`M30 ${base}H232`} t0={0} dur={500} class="vc-soft" />
        <Txt x={40} y={base + 22} text={String(y0)} size={14} tone="soft" t0={200} />
        <Txt x={222} y={base + 22} text={String(y1)} size={14} tone="soft" t0={200} />
        <Fade t0={300} class="vc-dash">
          <path d={`M40 ${base - P0}L222 ${base - P1}`} />
        </Fade>
        {/* Fin du mot calée à gauche du point où le pointillé a monté : un mot plus long pousse vers la gauche */}
        {pop ? <Txt x={130} y={base - P0 - 42} text={pop.text} size={14} anchor="end" t0={500} /> : null}
        {a.shown ? (
          <>
            <Ink d={`M40 ${base - R0}h.5`} t0={0} dur={100} class="vc-count vc-dot" />
            <Txt x={34} y={base - R0 + 22} text={a.text} size={16} anchor="start" tone="count" t0={100} />
          </>
        ) : null}
        {b.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M40 ${base - R0}L222 ${base - R1}`} />
            </Fade>
            <Ink d={`M222 ${base - R1}h.5`} t0={300} dur={100} class="vc-count vc-dot" />
            <Txt x={232} y={base - R1 + 6} text={b.text} size={18} big anchor="start" tone="count" t0={400} />
            {ret ? <Txt x={160} y={base - (R0 + R1) / 2 + 30} text={ret} size={14} tone="count" t0={500} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Le curseur de la revalorisation : moins vite, ça rapporte au système et réduit le revenu des retraités ;
 *  plus vite, l'inverse */
const pen09: Board = p => {
  const [slow, fast] = cuesOf(p)
  if (!slow || !fast) return null
  const side = (cx: number, up: boolean) => (
    <>
      <Picto n="pieces" x={cx - 52} y={4} size={44} t0={0} />
      <Picto n={up ? 'hausse' : 'baisse'} x={cx - 10} y={14} size={22} tone="count" t0={300} w={1.2} />
      <Picto n="enveloppe" x={cx + 14} y={4} size={44} t0={150} />
      <Picto n={up ? 'baisse' : 'hausse'} x={cx + 56} y={14} size={22} tone="count" t0={450} w={1.2} />
    </>
  )
  return (
    <Seg>
      <Art h={176}>
        <Ink d="M36 112H264" t0={100} dur={700} class="vc-soft" />
        <Ink d="M36 104v16M264 104v16" t0={500} dur={300} class="vc-soft" />
        <Fade t0={800}>
          <path class="vc-paper" d="M143 96h14v32h-14z" />
          <path d="M143 96h14v32h-14z" />
        </Fade>
        {slow.shown ? (
          <>
            <Move x={-18} y={0}>{side(80, true)}</Move>
            <Txt x={36} y={150} text={slow.text.toLowerCase()} size={18} big anchor="start" tone="count" t0={200} />
          </>
        ) : null}
        {fast.shown ? (
          <>
            <Move x={-22} y={0}>{side(220, false)}</Move>
            <Txt x={264} y={150} text={fast.text.toLowerCase()} size={18} big anchor="end" tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 10 « Quel niveau garantir, et à quel rythme le faire évoluer ? » : l'enveloppe sur une frise d'années */
const pen10: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Ink d="M14 92H232" t0={0} dur={800} />
      <Ink d={range(8).map(k => `M${40 + k * 26} 87v10`).join('')} t0={500} dur={400} class="vc-soft vc-thin" />
      <Picto n="enveloppe" x={6} y={30} size={56} t0={200} />
      <Arrow x1={70} y1={60} x2={226} y2={60} dash t0={900} />
      <Ask x={244} y={30} h={64} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Usure au travail ——— */

/** 01 Nuit, bruit, gestes répétés : trois pictogrammes, quand la voix les dit */
const pen_usure01: Board = p => {
  const items: [RegExp, PictoName, number][] = [
    [/Travail de nuit|nuit/, 'lune', 50],
    [/bruit/, 'bruit', 150],
    [/gestes répétés/, 'repetition', 250],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w?.shown ? <Signe key={n} n={n} cx={cx} y={4} size={64} label={w.text.toLowerCase()} t0={i * 80} /> : null
        })}
      </Art>
    </Seg>
  )
}

/** 02 À 35 ans, l'écart d'espérance de vie entre cadres et ouvriers : 5,3 ans chez les hommes, 3,4 chez les
 *  femmes. L'axe est coupé (on ne connaît que l'écart) ; les écarts, eux, sont à la même échelle. */
const pen_usure02: Board = p => {
  const [h, f] = cuesOf(p)
  const vh = num(h?.text)
  const vf = num(f?.text)
  const start = word(p, /\d+[\s\u00a0]ans/)
  const cadre = said(p, /cadre/)
  const ouvrier = said(p, /ouvrier/)
  const fem = said(p, /femmes/)
  if (!h || !f || !vh || !vf || !cadre || !ouvrier) return null
  const k = 12
  const end = 196
  const pair = (y: number, gap: number, label: string, cue: typeof h, d: number) => (
    <g>
      <Txt x={6} y={y - 16} text={label} size={14} anchor="start" tone="soft" t0={d} />
      <Ink d={`M44 ${y}H76M86 ${y}H${end + gap * k}`} t0={d} dur={700} />
      <Ink d={`M44 ${y + 22}H76M86 ${y + 22}H${end}`} t0={d + 200} dur={700} />
      <Ink d={`M76 ${y - 6}l6 12M80 ${y + 16}l6 12`} t0={d + 300} dur={200} class="vc-soft vc-thin" />
      <Txt x={end + gap * k + 6} y={y + 5} text={cadre} size={13} anchor="start" t0={d + 400} />
      <Txt x={end + 6} y={y + 27} text={ouvrier} size={13} anchor="start" t0={d + 500} />
      {cue.shown ? (
        <>
          <Brace x1={end} y1={y + 30} x2={end + gap * k} y2={y + 30} tone="count" t0={600} />
          <Txt x={end + (gap * k) / 2} y={y + 64} text={cue.text} size={18} big tone="count" t0={800} />
        </>
      ) : null}
    </g>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={190}>
        {start ? <Txt x={44} y={186} text={start.text} size={14} tone="soft" /> : null}
        {pair(28, vh, 'hommes', h, 200)}
        {f.shown ? pair(118, vf, fem ?? 'femmes', f, 0) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Le compte professionnel de prévention : l'employeur déclare, la carte C2P s'ouvre */
const pen_usure03: Board = p => {
  const [c2p, decl] = cuesOf(p)
  const full = word(p, /compte professionnel de prévention/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={170}>
        <Picto n="immeuble" x={4} y={20} size={78} t0={100} />
        {decl?.shown ? (
          <>
            <Picto n="document" x={94} y={34} size={44} t0={0} />
            <Arrow x1={140} y1={58} x2={182} y2={58} t0={300} />
            <Txt x={46} y={128} text={decl.text} max={14} size={14} t0={200} />
          </>
        ) : null}
        <Picto n="carte" x={190} y={18} size={102} t0={500} tone={c2p?.shown ? 'count' : undefined} text={c2p?.text} />
        {full?.shown ? <Txt x={240} y={128} text={full.text} max={16} size={14} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** Le pictogramme d'un risque professionnel, d'après son nom */
const risque = (s: string): PictoName =>
  /nuit/.test(s) ? 'lune' : /altern/.test(s) ? 'alternance' : /répét/.test(s) ? 'repetition' : /bruit/.test(s) ? 'bruit' : /tempér/.test(s) ? 'thermometre' : /pression|plongée/.test(s) ? 'scaphandre' : 'document'

/** 04 Six risques : la carte se déplie en six cases, chacune quand la voix la nomme */
const pen_usure04: Board = p => {
  const list = listAfterColon(p.segment.say)
  if (list.length < 3) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Panel cols={3} items={list.map(l => ({ picto: risque(l), text: l, shown: heard(p, l.split(',')[0]) }))} />
    </Seg>
  )
}

/** 05 4 points par année et par risque ; 20 pour la formation, puis 10 points pour un trimestre, jusqu'à 2 ans */
const pen_usure05: Board = p => {
  const say = plain(p.segment.say)
  const m20 = /Après (\d+) points/.exec(say)
  const m10 = /(\d+) points valent un trimestre/.exec(say)
  const form = word(p, /la formation/)
  const tri = word(p, /un trimestre/)
  const two = word(p, /jusqu’à \d+[\s\u00a0]ans|jusqu'à \d+[\s\u00a0]ans/)
  if (!m20 || !m10) return null
  const a = Number(m20[1])
  const b = Number(m10[1])
  const tokens = (n: number, y: number) =>
    range(n)
      .map(i => `M${18 + (i % 10) * 11 + 4} ${y + Math.floor(i / 10) * 11}a4 4 0 1 1-8 0a4 4 0 1 1 8 0`)
      .join('')
  const showA = heard(p, m20[0].split(' ')[0])
  const showB = heard(p, `${m10[1]} points valent`)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={190}>
        {showA ? (
          <>
            <Ink d={tokens(a, 12)} t0={0} dur={600} class="vc-thin vc-count" />
            <Arrow x1={134} y1={18} x2={170} y2={18} t0={500} />
            <Picto n="livre" x={180} y={-2} size={42} t0={600} />
            {form ? <Txt x={230} y={24} text={form.text} size={14} anchor="start" t0={800} /> : null}
          </>
        ) : null}
        {showB ? (
          <>
            <Ink d={tokens(b, 74)} t0={0} dur={500} class="vc-thin vc-count" />
            <Arrow x1={134} y1={74} x2={170} y2={74} t0={400} />
            <Cases n={1} cols={1} x={186} y={60} size={28} count={[0]} t0={500} />
            {tri ? <Txt x={226} y={80} text={tri.text} size={14} anchor="start" t0={700} /> : null}
          </>
        ) : null}
        {two?.shown ? (
          <>
            <Ink d="M10 176H290" t0={0} dur={500} class="vc-soft" />
            <g transform="translate(206 176)">
              <g class="vc-slide" style={{ '--from': '50px', '--d': '200ms', '--t': '1000ms' }}>
                <Barriere x={0} y={0} s={1.1} kept tone="count" />
              </g>
            </g>
            <Barriere x={256} y={176} s={1.1} kept tone="ghost" />
            <Txt x={10} y={160} text={two.text} size={16} anchor="start" tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 En 2017, quatre risques sortent du compte : quatre cases s'effacent */
const pen_usure06: Board = p => {
  const cue = cueOf(p, 0)
  const year = yearsOf(p.segment.say)[0]
  const out = listAfterColon(p.segment.say)
  if (!cue || !year || out.length < 2) return null
  const n = 10
  const gone = range(out.length).map(i => n - out.length + i)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={176}>
        <Ink d="M10 30H290" t0={0} dur={600} class="vc-soft" />
        <Picto n="drapeau" x={142} y={-12} size={40} t0={400} />
        <Txt x={180} y={24} text={String(year)} size={18} big anchor="start" t0={600} />
        <Cases n={n} cols={n} x={18} y={54} size={22} gap={6} ghost={cue.shown ? gone : []} t0={300} />
        {cue.shown
          ? out.map((o, i) => <Txt key={o} x={i % 2 ? 222 : 78} y={118 + Math.floor(i / 2) * 26} text={o} size={14} tone="soft" t0={300 + i * 250} />)
          : null}
      </Art>
    </Seg>
  )
}

/** 07 Un départ anticipé reste possible, mais lié à une maladie professionnelle : un autre guichet */
const pen_usure07: Board = p => (
  <Seg>
    <HeadCues p={p} />
    <Art h={140}>
      <Cases n={4} cols={2} x={30} y={30} size={30} gap={8} ghost={[0, 1, 2, 3]} kept />
      <Arrow x1={112} y1={68} x2={166} y2={68} t0={300} />
      <Picto n="guichet" x={176} y={14} size={110} t0={600} />
      <Picto n="soin" x={218} y={22} size={22} t0={1300} tone="count" w={0.8} />
    </Art>
  </Seg>
)

/** 08 La Cour des comptes demandait de contrôler les employeurs : une loupe passe sur les déclarations */
const pen_usure08: Board = p => {
  const ctrl = word(p, /contrôle des employeurs/)
  const year = yearsOf(p.segment.say)[0]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={156}>
        {year ? <Txt x={10} y={20} text={String(year)} size={18} big anchor="start" tone="soft" /> : null}
        <Picto n="immeuble" x={4} y={34} size={74} t0={100} />
        {[0, 1, 2].map(i => (
          <Picto key={i} n="document" x={96 + i * 40} y={56} size={36} t0={500 + i * 150} />
        ))}
        <Picto n="carte" x={226} y={50} size={66} t0={900} text="C2P" />
        <g class="vc-slide" style={{ '--from': '-70px', '--d': '1300ms', '--t': '1600ms' }}>
          <Picto n="loupe" x={150} y={30} size={80} t0={1200} tone="count" />
        </g>
        {ctrl?.shown ? <Txt x={W / 2} y={150} text={ctrl.text} size={15} /> : null}
      </Art>
    </Seg>
  )
}

/** 09 D'un côté, des écarts d'espérance de vie ; de l'autre, des expositions dures à mesurer et un coût */
const pen_usure09: Board = p => {
  const [a, b] = cuesOf(p)
  const lines = (cx: number, base: number) => (
    <>
      <Ink d={`M${cx - 38} ${base - 26}H${cx + 36}`} t0={900} dur={500} />
      <Ink d={`M${cx - 38} ${base - 12}H${cx + 12}`} t0={1100} dur={500} />
    </>
  )
  const bal = balance({ left: lines, right: ['metre', 'tirelire'], labels: [a?.text ?? null, b?.text ?? null], shown: [!!a?.shown, !!b?.shown], t0: 100 })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 10 « Comment mesurer l'usure ? » : le mètre ruban se déroule le long d'une vie, jusqu'à la question */
const pen_usure10: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="metre" x={4} y={30} size={60} t0={100} />
      <Ink d="M58 78H226" t0={600} dur={1200} />
      <Ink d={range(14).map(k => `M${66 + k * 12} 78v-6`).join('')} t0={1000} dur={900} class="vc-thin vc-soft" />
      <Ask x={240} y={26} h={60} t0={1700} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const RETRAITES: Record<string, Board> = {
  'retraites-intro-01': intro01,
  'retraites-intro-02': intro02,
  'retraites-intro-03': intro03,
  'retraites-intro-04': intro04,
  'retraites-intro-05': intro05,
  'retraites-intro-06': intro06,
  'retraites-intro-07': intro07,
  'retraites-intro-08': intro08,
  'retraites-intro-09': intro09,
  'retraites-intro-10': intro10,
  'retraites-age-01': age01,
  'retraites-age-02': age02,
  'retraites-age-03': age03,
  'retraites-age-04': age04,
  'retraites-age-05': age05,
  'retraites-age-06': age06,
  'retraites-age-07': age07,
  'retraites-age-08': age08,
  'retraites-age-09': age09,
  'retraites-age-10': age10,
  'retraites-age-11': age11,
  'retraites-financement-01': fin01,
  'retraites-financement-02': fin02,
  'retraites-financement-03': fin03,
  'retraites-financement-04': fin04,
  'retraites-financement-05': fin05,
  'retraites-financement-06': fin06,
  'retraites-financement-07': fin07,
  'retraites-financement-08': fin08,
  'retraites-financement-09': fin09,
  'retraites-financement-10': fin10,
  'retraites-financement-11': fin11,
  'retraites-financement-12': fin12,
  'retraites-pensions-01': pen01,
  'retraites-pensions-02': pen02,
  'retraites-pensions-03': pen03,
  'retraites-pensions-04': pen04,
  'retraites-pensions-05': pen05,
  'retraites-pensions-06': pen06,
  'retraites-pensions-07': pen07,
  'retraites-pensions-08': pen08,
  'retraites-pensions-09': pen09,
  'retraites-pensions-10': pen10,
  'retraites-penibilite-01': pen_usure01,
  'retraites-penibilite-02': pen_usure02,
  'retraites-penibilite-03': pen_usure03,
  'retraites-penibilite-04': pen_usure04,
  'retraites-penibilite-05': pen_usure05,
  'retraites-penibilite-06': pen_usure06,
  'retraites-penibilite-07': pen_usure07,
  'retraites-penibilite-08': pen_usure08,
  'retraites-penibilite-09': pen_usure09,
  'retraites-penibilite-10': pen_usure10,
}
