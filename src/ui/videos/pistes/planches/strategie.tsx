// Piste C, les planches de la série « Alliances » (src/ui/videos/series/strategie.ts) : un dessin par passage,
// composé avec la bibliothèque commune (../dessin/). Les mots et les nombres viennent du script (mots mis en
// valeur, phrases dites, chiffre de la fiche) : si le texte change, le dessin suit ; s'il ne s'y retrouve plus,
// la planche rend null et le passage prend le dessin générique de sa sorte d'image.
// Neutralité de l'image : aucun parti, aucune couleur ni aucun symbole partisan, aucune place dans l'hémicycle ;
// les ensembles de députés se comparent à la même échelle, depuis zéro, et aucun n'est compté au bleu bille.
// Repères de la série : l'Assemblée est un monument, le gouvernement une mallette (son portefeuille), un texte
// un document, une personne n'est qu'une tête et des épaules.
// Étiquettes écrites ici quand le passage ne les dit pas, toutes reprises dans « alt » : « moitié des sièges »,
// « contre la confiance », « pour la confiance », « voix pour la motion », « voix nécessaires ».

import { STRATEGIE as SERIE } from '../../series/strategie'
import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, at, cueOf, cuesOf, heard, num, said, sentencesOf, word, yearsOf, type P } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Note, Panel, Question, Seg, Signature, Src } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Cases, Disque, Rang, balance, barres, casesH, colonnes, frise, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/** Le pictogramme de chaque sujet de la série : les questions de l'introduction, son sommaire */
function pictoOf(text: string): PictoName {
  if (/allier|premier tour/i.test(text)) return 'personne'
  if (/dissoudre|dissolution|législatives/i.test(text)) return 'calendrier'
  if (/gouverner|majorité/i.test(text)) return 'monument'
  return 'document'
}

/** Une urne au trait, un bulletin engagé dans sa fente ; (x, y) : coin haut gauche, s : côté */
const Urne = ({ x, y, s = 48, t0 = 0 }: { x: number; y: number; s?: number; t0?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 48})`} style={{ '--k': String(48 / s) }}>
    <Ink d="M6 20H42V45H6Z" t0={t0} dur={600} />
    <Ink d="M6 27H42" t0={t0 + 450} dur={300} class="vc-thin vc-soft" />
    <Ink d="M16 20h16" t0={t0 + 600} dur={200} class="vc-bold" />
    <Ink d="M19 21V6H29V21" t0={t0 + 800} dur={400} class="vc-count" />
  </g>
)

/** Un tampon d'adoption : un cercle et une coche ; (x, y) : son centre */
const Tampon = ({ x, y, r = 16, t0 = 0 }: { x: number; y: number; r?: number; t0?: number }) => (
  <g class="vc-count">
    <Ink d={`M${x + r} ${y}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`} t0={t0} dur={500} />
    <Ink d={`M${x - r * 0.45} ${y}l${r * 0.32} ${r * 0.34}l${r * 0.6} ${-r * 0.66}`} t0={t0 + 450} dur={300} class="vc-bold" />
  </g>
)

/** Trois personnes à distance, que des liens en pointillé cherchent à relier ; un point d'interrogation */
function Liens({ t0 = 150 }: { t0?: number }) {
  const xs = [56, 150, 244]
  return (
    <>
      {xs.map((cx, i) => (
        <Picto key={cx} n="personne" x={cx - 26} y={74} size={52} t0={t0 + i * 200} />
      ))}
      <Fade t0={t0 + 800} class="vc-dash">
        <path d="M84 96Q103 68 122 96M178 96Q197 68 216 96" />
      </Fade>
      <Ask x={137} y={8} h={50} t0={t0 + 1200} />
    </>
  )
}

/** « Seuls les deux premiers peuvent se présenter au second tour » : six candidats, deux passent */
function deuxPremiers(p: P) {
  const cue = cueOf(p, 0)
  if (!cue || !/deux/.test(cue.text)) return null
  const t1 = said(p, /premier tour/)
  const t2 = word(p, /second tour/)
  const { cells } = rangCells({ n: 6, y: 26, max: 38, gap: 10 })
  const slots = [118, 182]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={208}>
        {t1 ? <Txt x={W / 2} y={16} text={t1} size={14} tone="soft" t0={100} /> : null}
        <Rang n={6} picto="personne" y={26} max={38} gap={10} count={[0, 1]} shown={cue.shown} t0={150} />
        {cue.shown
          ? cells.slice(0, 2).map((c, i) => (
              <Arrow key={i} x1={c.x + c.size / 2} y1={c.y + c.size + 6} x2={slots[i]!} y2={130} tone="count" t0={300 + i * 200} />
            ))
          : null}
        <Fade t0={600} class="vc-dash vc-soft">
          <path d="M70 136H230V184H70Z" />
        </Fade>
        {cue.shown ? slots.map((cx, i) => <Picto key={cx} n="personne" x={cx - 18} y={142} size={36} tone="count" t0={700 + i * 150} />) : null}
        {t2 ? <Txt x={W / 2} y={203} text={t2.text} size={14} tone="soft" t0={900} /> : null}
      </Art>
    </Seg>
  )
}

/** Les candidats communs de 2024 : le disque des suffrages exprimés, et leur part */
function unionDisque(p: P) {
  const [communs, pct] = cuesOf(p)
  const part = (num(pct?.text) ?? 0) / 100
  if (!communs || !pct || !part || part >= 1) return null
  const exprimes = word(p, /suffrages exprimés/)
  const tip = partPoint(80, 66, 46, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        <Disque cx={80} cy={68} r={64} part={part} shown={pct.shown} t0={300} />
        {communs.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L170 40`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={174} y={36} text={communs.text} max={11} size={16} anchor="start" tone="count" t0={500} />
          </>
        ) : null}
        {exprimes ? <Txt x={174} y={104} text={exprimes.text} max={11} size={14} anchor="start" tone="soft" t0={900} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les quatre ensembles de députés, à la même échelle, depuis zéro ; la moitié des sièges pourvus (la somme des
 *  quatre nombres dits) en pointillé, quand la voix dit qu'aucun bloc n'a seul la majorité */
function composition(p: P) {
  const cue = cueOf(p, 0)
  const rows = [
    { n: word(p, /\d+ députés de gauche et écologistes/), label: word(p, /gauche et écologistes/) },
    { n: word(p, /\d+ au centre/), label: word(p, /centre/) },
    { n: word(p, /\d+ députés dans un groupe de droite/), label: word(p, /un groupe de droite/) },
    { n: word(p, /\d+ autres/), label: word(p, /autres/) },
  ]
  const values = rows.map(r => num(r.n?.text))
  if (!cue || values.some(v => !v) || rows.some(r => !r.label)) return null
  const half = values.reduce((s: number, v) => s + v!, 0) / 2
  const g = barres({
    items: rows.map((r, i) => ({ label: r.label!.text, value: values[i]!, text: String(values[i]), shown: r.n!.shown })),
    y: 22,
    size: 18,
    gap: 28,
    room: 52,
    labelSize: 14,
    max: half,
    t0: 100,
  })
  const hx = half * g.scale
  const bottom = 22 + g.h + 4
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={bottom + 4}>
        {g.el}
        {cue.shown ? (
          <>
            <Fade t0={200} class="vc-dash vc-soft">
              <path d={`M${hx.toFixed(1)} 16V${bottom}`} />
            </Fade>
            <Txt x={W - 2} y={11} text="moitié des sièges" size={14} anchor="end" tone="soft" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/**
 * Le temps de l'Assemblée : une frise des années, la bande de l'Assemblée de juillet de son élection à juin de
 * la fin de ses pouvoirs. « intro » : la dissolution possible en 2027 ; « branche » : à 2027, une nouvelle
 * Assemblée part au bleu bille, l'ancienne passe en pointillé ; « garder » : l'Assemblée continue jusqu'au bout,
 * au bleu bille, la branche reste en pointillé.
 */
function mandat(p: P, mode: 'intro' | 'plain' | 'branche' | 'garder') {
  const debut = said(p, /juillet \d{4}/)
  const fin = said(p, /juin \d{4}/)
  const y0 = yearsOf(debut ?? '')[0]
  const y1 = yearsOf(fin ?? '')[0]
  if (!debut || !fin || !y0 || !y1 || y1 - y0 < 2 || y1 - y0 > 8) return null
  const dw = word(p, /juillet \d{4}/)
  const fw = word(p, /juin \d{4}/)
  const years = range(y1 - y0 + 1).map(k => y0 + k)
  const f = frise({ y: 124, from: y0, to: y1 + 0.8, x0: 16, x1: 284, ticks: years, labels: years, t0: 100, soft: true })
  const a = f.X(y0 + 0.54)
  const b = f.X(y1 + 0.46)
  const mid = [...yearsOf(p.segment.say), ...yearsOf(p.script.segments.map(s => s.say).join(' '))].find(y => y > y0 && y < y1)
  const xm = mid ? f.X(mid) : null
  const assemblee = said(p, /l’Assemblée/i)
  const diss = word(p, /une dissolution/)
  const nouveaux = word(p, /de nouveaux députés/)
  const branch = (mode === 'branche' || mode === 'garder') && xm !== null
  const end = mode === 'branche' && xm !== null ? xm : b
  const tone = mode === 'garder' ? 'vc-count' : undefined
  const box = (x0: number, x1: number, y: number, h: number) => `M${x0.toFixed(1)} ${y}H${x1.toFixed(1)}V${y + h}H${x0.toFixed(1)}Z`
  return (
    <Seg>
      {mode === 'branche' || mode === 'garder' ? <HeadCues p={p} /> : null}
      <Art h={156}>
        {f.el}
        <g class={tone}>
          <Fade t0={700}>
            <rect class={tone ? 'vc-tint-count' : 'vc-tint'} x={a} y={80} width={end - a} height={22} />
          </Fade>
          <Ink d={box(a, end, 80, 22)} t0={300} dur={900} />
        </g>
        {mode === 'branche' && xm !== null ? (
          <Fade t0={1300} class="vc-ghost">
            <path d={`M${xm.toFixed(1)} 80H${b.toFixed(1)}V102H${xm.toFixed(1)}`} />
          </Fade>
        ) : null}
        {assemblee ? <Txt x={a + 6} y={96} text={assemblee} size={14} anchor="start" t0={800} /> : null}
        {!dw || dw.shown ? <Txt x={a} y={74} text={debut} size={14} anchor="start" tone={dw ? undefined : 'soft'} t0={dw ? 100 : 0} kept={!dw} /> : null}
        {!fw || fw.shown ? <Txt x={b} y={74} text={fin} size={14} anchor="end" tone={fw ? undefined : 'soft'} t0={fw ? 100 : 0} kept={!fw} /> : null}
        {mode === 'intro' && xm !== null && diss?.shown ? (
          <>
            <Fade t0={100} class="vc-count vc-dash">
              <path d={`M${xm.toFixed(1)} 38V124`} />
            </Fade>
            <Txt x={xm} y={30} text={diss.text} size={15} tone="count" t0={200} />
          </>
        ) : null}
        {branch && mode === 'branche' ? (
          <g class="vc-count">
            <Fade t0={500}>
              <rect class="vc-tint-count" x={xm! + 6} y={38} width={W - 18 - xm!} height={20} />
            </Fade>
            <Ink d={`M${W - 12} 38H${(xm! + 6).toFixed(1)}V58H${W - 12}`} t0={300} dur={700} />
            <Arrow x1={xm! - 2} y1={86} x2={xm! + 6} y2={62} t0={200} dur={300} tone="count" head={6} />
            {nouveaux?.shown ? <Txt x={xm! + 6} y={30} text={nouveaux.text} size={14} anchor="start" tone="count" t0={100} /> : null}
          </g>
        ) : null}
        {branch && mode === 'garder' ? (
          <Fade kept class="vc-ghost">
            <path d={`M${W - 12} 38H${(xm! + 6).toFixed(1)}V58H${W - 12}`} />
          </Fade>
        ) : null}
      </Art>
    </Seg>
  )
}

/** Deux nombres de voix à la même échelle, depuis zéro : le chiffre de la fiche, ses deux barres, la source */
function votes(p: P, labels: [string, string]) {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb) return null
  const unit = a.text.replace(/^[\d\s\u00a0\u202f]+/, '')
  const g = barres({
    items: [
      { label: labels[0], value: va, text: a.text, shown: a.shown },
      { label: labels[1], value: vb, text: unit && !/\D/.test(b.text.trim()) ? `${b.text}\u00a0${unit}` : b.text, shown: b.shown },
    ],
    y: 2,
    size: 24,
    gap: 30,
    room: 98,
    labelSize: 14,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Dix députés en rang, coupés en leur milieu par un trait : la moitié */
function deputes(count: number[], ghost: number[], shown: boolean) {
  const { cells, h } = rangCells({ n: 10, y: 6, max: 26, gap: 3 })
  const mid = (cells[4]!.x + cells[4]!.size + cells[5]!.x) / 2
  return {
    h: 6 + h,
    cells,
    el: (
      <>
        <Rang n={10} picto="personne" y={6} max={26} gap={3} count={count} ghost={ghost} shown={shown} t0={150} stagger={60} />
        <Fade t0={800} class="vc-dash vc-soft">
          <path d={`M${mid.toFixed(1)} 0V${10 + h}`} />
        </Fade>
      </>
    ),
  }
}

/* ——— Introduction ——— */

/** 01 « avec qui s'allier ? » : trois personnes, des liens en pointillé, la question */
const intro01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={134}>
      <Liens />
    </Art>
  </Seg>
)

/** 02 À la présidentielle, seuls les deux premiers peuvent se présenter au second tour */
const intro02: Board = p => deuxPremiers(p)

/** 03 Les candidats communs de 2024 : 27,99 % des suffrages exprimés */
const intro03: Board = p => unionDisque(p)

/** 04 L'Assemblée début octobre 2026 : quatre ensembles, aucun n'atteint la moitié des sièges */
const intro04: Board = p => composition(p)

/** 05 Deux gouvernements tombés : renversé en décembre 2024, démission en septembre 2025 */
const intro05: Board = p => {
  const [a, b] = cuesOf(p)
  const ya = yearsOf(a?.text ?? '')[0]
  const yb = yearsOf(b?.text ?? '')[0]
  if (!a || !b || !ya || !yb || yb < ya) return null
  const month = (s: string) => ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].findIndex(m => s.startsWith(m))
  const ma = month(a.text)
  const mb = month(b.text)
  if (ma < 0 || mb < 0) return null
  const from = ya + 0.4
  const to = yb + 1.05
  const years = range(Math.floor(to) - Math.ceil(from) + 1).map(k => Math.ceil(from) + k)
  const f = frise({ y: 120, from, to, x0: 16, x1: 284, ticks: years, labels: years, t0: 100, soft: true })
  const marks = [
    { cue: a, x: f.X(ya + (ma + 0.5) / 12) },
    { cue: b, x: f.X(yb + (mb + 0.5) / 12) },
  ]
  return (
    <Seg>
      <Art h={150}>
        {f.el}
        {marks.map(({ cue, x }, i) =>
          cue.shown ? (
            <g key={i}>
              <Txt x={x} y={16} text={cue.text} size={16} t0={100} />
              <Picto n="mallette" x={x - 26} y={24} size={48} t0={200} />
              <Picto n="baisse" x={x + 20} y={32} size={28} tone="count" t0={700} w={1.2} />
              <Picto n="drapeau" x={x - 10} y={76} size={44} tone="count" t0={400} />
            </g>
          ) : null,
        )}
      </Art>
    </Seg>
  )
}

/** 06 Les pouvoirs de l'Assemblée élue en juillet 2024 expirent en juin 2029 ; en 2027, une dissolution */
const intro06: Board = p => mandat(p, 'intro')

/** 07 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map(q => ({
          picto: pictoOf(q),
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 08 Le sommaire de la série : chaque approfondissement avec le pictogramme de sa question */
const intro08: Board = p => {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  if (!deep.length) return null
  const t0 = 200
  return (
    <Seg kind="end">
      <ol class="vc-chap">
        {deep.map((v, i) => (
          <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
            <span class="vc-chap-n">{i + 1}</span>
            <Glyphe n={pictoOf(`${v.short} ${v.title}`)} t0={p.still ? 0 : t0 + i * 450 + 150} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Premier tour ——— */

/** 01 « Qui pourra encore se présenter au second ? » : une urne, puis un second tour en question */
const tour01: Board = p => {
  const t1 = word(p, /premier tour/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={136}>
        <Urne x={34} y={20} s={92} t0={100} />
        {t1 ? <Txt x={80} y={132} text={t1.text} size={14} tone="soft" t0={600} /> : null}
        <Arrow x1={140} y1={70} x2={186} y2={70} t0={1100} dash />
        <Fade t0={1300} class="vc-dash vc-soft">
          <path d="M196 28H284V112H196Z" />
        </Fade>
        <Ask x={225} y={42} h={52} t0={1500} />
      </Art>
    </Seg>
  )
}

/** 02 Seuls les deux premiers peuvent se présenter au second tour */
const tour02: Board = p => deuxPremiers(p)

/** 03 La majorité absolue des suffrages exprimés : plus de la moitié */
const tour03: Board = p => {
  const cue = cueOf(p, 0)
  const exprimes = word(p, /suffrages exprimés/)
  const moitie = word(p, /la moitié/)
  if (!cue || !moitie) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={104}>
        {exprimes ? <Txt x={20} y={24} text={exprimes.text} size={15} anchor="start" t0={100} /> : null}
        <Fade t0={500}>
          <rect class="vc-tint" x={20} y={34} width={260} height={30} />
        </Fade>
        <Ink d="M20 34H280V64H20Z" t0={200} dur={800} />
        {cue.shown ? (
          <g class="vc-count">
            <Fade t0={100}>
              <rect class="vc-tint-count" x={20} y={34} width={156} height={30} />
            </Fade>
            <Ink d="M176 34V64" t0={100} dur={300} class="vc-bold" />
          </g>
        ) : null}
        <Fade t0={900} class="vc-dash">
          <path d="M150 26V74" />
        </Fade>
        <Txt x={150} y={94} text={moitie.text} size={15} t0={1000} />
      </Art>
    </Seg>
  )
}

/** 04 12,5 % des électeurs inscrits : un inscrit sur huit */
const tour04: Board = p => {
  const cue = cueOf(p, 1)
  const m = /(\S+) inscrit sur (\S+)/.exec(cue?.text ?? '')
  const k = num(m?.[1])
  const n = num(m?.[2])
  if (!cue || !k || !n || n > 12 || k >= n) return null
  const { h } = rangCells({ n, cols: n, max: 32, gap: 6 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={n} picto="personne" cols={n} max={32} gap={6} y={2} count={range(k)} shown={cue.shown} t0={200} stagger={100} />
      </Art>
      <Note p={p} text={cue.text} />
      <Src p={p} />
    </Seg>
  )
}

/** 05 Si moins de deux candidats atteignent le seuil, les deux premiers peuvent se maintenir */
const tour05: Board = p => {
  const cue = cueOf(p, 0)
  const seuil = word(p, /ce seuil/)
  if (!cue || !seuil) return null
  // Des scores de candidats, du premier au dernier (un dessin, pas des données) : un seul passe le seuil
  const scores = [96, 66, 50, 34, 20]
  const base = 150
  const line = base - 80
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={158}>
        <Ink d={`M14 ${base}H286`} t0={0} dur={500} class="vc-soft" />
        {scores.map((h, i) => {
          const x = 34 + i * 50
          const counted = cue.shown && i < 2
          return (
            <g key={i} class={counted ? 'vc-count' : undefined}>
              <Fade t0={counted ? 0 : 300 + i * 120}>
                <rect class={counted ? 'vc-tint-count' : 'vc-tint'} x={x} y={base - h} width={32} height={h} />
              </Fade>
              <Ink d={`M${x} ${base}V${base - h}H${x + 32}V${base}`} t0={150 + i * 120} dur={500} />
            </g>
          )
        })}
        <Fade t0={900} class="vc-dash">
          <path d={`M14 ${line}H286`} />
        </Fade>
        <Txt x={286} y={line - 8} text={seuil.text} size={14} anchor="end" t0={1000} />
      </Art>
    </Seg>
  )
}

/** 06 Les candidats communs de 2024 : 27,99 % des suffrages exprimés, un peu moins de 9 millions de voix */
const tour06: Board = p => unionDisque(p)

/** 07 Les 192 députés de gauche et écologistes, en quatre groupes : 70, 67, 38 et 17 */
const tour07: Board = p => {
  const m = /(\d+), (\d+), (\d+) et (\d+)/.exec(p.segment.say)
  if (!m) return null
  const values = m.slice(1, 5).map(Number)
  const shown = heard(p, m[0])
  const cols = colonnes({
    items: values.map(v => ({ label: '', value: v, text: String(v), shown })),
    x: 34,
    w: 232,
    y: 0,
    h: 126,
    colW: 40,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={cols.h - 20}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Pour les uns, l'union aide à se qualifier ; pour d'autres, elle gêne le rassemblement nécessaire pour
 *  gagner : une porte (le second tour), une cible (gagner), plateaux égaux */
const tour08: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: ['porte'],
    right: ['cible'],
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

/** 09 « Avec qui s'allier, et jusqu'où ? » */
const tour09: Board = p => (
  <Seg kind="ask">
    <Art h={134}>
      <Liens t0={100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Dissolution ——— */

/** 01 « Élirez-vous aussi de nouveaux députés ? » : l'année de la présidentielle, l'Assemblée, la question */
const diss01: Board = p => {
  const year = yearsOf(p.segment.say)[0]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        <Picto n="calendrier" x={30} y={4} size={84} t0={100} />
        {year ? <Txt x={72} y={118} text={String(year)} size={18} big t0={500} /> : null}
        <Ask x={133} y={28} h={50} t0={1300} />
        <Picto n="monument" x={186} y={4} size={88} t0={700} />
      </Art>
    </Seg>
  )
}

/** 02 Les pouvoirs de l'Assemblée expirent le troisième mardi de juin de la cinquième année ; les législatives
 *  ont lieu dans les 60 jours qui précèdent (trop courts pour l'échelle : montrés du doigt) */
const diss02: Board = p => {
  const [, jours] = cuesOf(p)
  const election = word(p, /son élection/)
  const annee = word(p, /la cinquième année/)
  const X = (k: number) => 20 + k * 50
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={128}>
        <Ink d={`M${X(0)} 96H${X(5)}`} t0={100} dur={900} />
        <Ink d={range(6).map(k => `M${X(k)} 90v12`).join('')} t0={500} dur={400} class="vc-soft vc-thin" />
        <Picto n="monument" x={X(0) - 4} y={56} size={34} t0={200} />
        {election ? <Txt x={X(0) - 4} y={124} text={election.text} size={15} anchor="start" t0={600} /> : null}
        {annee ? <Txt x={X(5) + 6} y={124} text={annee.text} size={15} anchor="end" t0={900} /> : null}
        <Picto n="calendrier" x={X(5) - 26} y={28} size={44} t0={1000} />
        {jours?.shown ? (
          <g class="vc-count">
            <Ink d={`M${X(5) - 8} 96H${X(5)}`} t0={0} dur={200} class="vc-bold" />
            <Arrow x1={176} y1={66} x2={X(5) - 8} y2={92} t0={150} head={6} tone="count" />
            <Txt x={170} y={68} text={jours.text} size={16} anchor="end" tone="count" t0={300} />
          </g>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Élue en juillet 2024, l'Assemblée a ses pouvoirs jusqu'en juin 2029 */
const diss03: Board = p => mandat(p, 'plain')

/** 04 Une dissolution : l'Assemblée passe en pointillé ; l'article 12 de la Constitution */
const diss04: Board = p => {
  const [, art] = cuesOf(p)
  const dissout = word(p, /dissoudre/)
  const assemblee = word(p, /l’Assemblée/)
  const constitution = word(p, /la Constitution/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={134}>
        <Picto n="monument" x={26} y={6} size={96} t0={100} tone={dissout?.shown ? 'ghost' : undefined} />
        {assemblee ? <Txt x={74} y={126} text={assemblee.text} size={14} t0={400} /> : null}
        <Picto n="document" x={184} y={10} size={82} t0={600} tone={art?.shown ? 'count' : undefined} />
        {constitution?.shown ? <Txt x={225} y={126} text={constitution.text} size={14} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Le président élu en 2027 pourra dissoudre : une nouvelle Assemblée part de 2027 */
const diss05: Board = p => mandat(p, 'branche')

/** 06 Sinon, composer avec l'Assemblée élue en juillet 2024, jusqu'en juin 2029 */
const diss06: Board = p => mandat(p, 'garder')

/** 07 Garder l'Assemblée élue en 2024, ou en élire une nouvelle ? Deux monuments, de même taille */
const diss07: Board = p => {
  const [a, b] = cuesOf(p)
  return (
    <Seg kind="ask">
      <Art h={122}>
        <Picto n="monument" x={18} y={4} size={86} t0={100} />
        <Picto n="monument" x={196} y={4} size={86} tone="ghost" />
        <Ask x={132} y={18} h={56} t0={800} />
        {a?.shown ? <Txt x={61} y={116} text={a.text} size={15} t0={100} /> : null}
        {b?.shown ? <Txt x={239} y={116} text={b.text} size={15} t0={100} /> : null}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Majorité ——— */

/** 01 « Un gouvernement peut-il rester en place sans majorité ? » : l'Assemblée, le gouvernement, la question */
const maj01: Board = p => {
  const assemblee = word(p, /l’Assemblée/)
  const gouv = word(p, /Un gouvernement/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={128}>
        <Picto n="monument" x={8} y={6} size={92} t0={100} />
        {assemblee ? <Txt x={54} y={124} text={assemblee.text} size={14} t0={500} /> : null}
        <Picto n="mallette" x={146} y={42} size={58} t0={700} />
        {gouv ? <Txt x={175} y={124} text={gouv.text} size={14} t0={900} /> : null}
        <Ask x={244} y={14} h={62} t0={1300} />
      </Art>
    </Seg>
  )
}

/** 02 Début octobre 2026 : les quatre ensembles de députés ; aucun bloc n'a seul la majorité */
const maj02: Board = p => composition(p)

/** 03 Un gouvernement tombe si la majorité absolue des députés vote une motion de censure */
const maj03: Board = p => {
  const [maj, motion] = cuesOf(p)
  if (!maj || !motion) return null
  const d = deputes(range(6), [], maj.shown)
  const c = d.cells
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={d.h + 108}>
        {d.el}
        {maj.shown ? (
          <>
            <Brace x1={c[0]!.x} y1={d.h + 4} x2={c[5]!.x + c[5]!.size} y2={d.h + 4} t0={300} tone="count" />
            <Txt x={(c[0]!.x + c[5]!.x + c[5]!.size) / 2} y={d.h + 34} text={maj.text} size={15} tone="count" t0={500} />
          </>
        ) : null}
        <Picto n="mallette" x={196} y={d.h + 46} size={56} t0={600} />
        {motion.shown ? <Picto n="baisse" x={254} y={d.h + 56} size={34} tone="count" t0={300} w={1.2} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Seuls les votes pour sont comptés : s'abstenir laisse le gouvernement en place */
const maj04: Board = p => {
  const [pour, abst] = cuesOf(p)
  if (!pour || !abst) return null
  const d = deputes(range(4), abst.shown ? range(6).map(i => i + 4) : [], pour.shown)
  const c = d.cells
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={d.h + 100}>
        {d.el}
        {pour.shown ? <Txt x={(c[0]!.x + c[3]!.x + c[3]!.size) / 2} y={d.h + 24} text={pour.text} size={15} tone="count" t0={200} /> : null}
        {abst.shown ? <Txt x={(c[4]!.x + c[9]!.x + c[9]!.size) / 2} y={d.h + 24} text={abst.text} size={15} tone="soft" t0={200} /> : null}
        <Picto n="mallette" x={122} y={d.h + 40} size={56} t0={600} />
      </Art>
    </Seg>
  )
}

/** 05 La confiance refusée, 364 voix contre 194 : deux barres à la même échelle */
const maj05: Board = p => votes(p, ['contre la confiance', 'pour la confiance'])

/** 06 Depuis 1958, le seul des 42 votes de confiance perdu : 42 cases, une comptée */
const maj06: Board = p => {
  const [seul, total] = cuesOf(p)
  const n = num(total?.text)
  if (!seul || !total || !n || n > 84) return null
  const cols = 14
  const size = 16
  const gap = 4
  const w = cols * (size + gap) - gap
  const x = (W - w) / 2
  const H = casesH(n, cols, size, gap)
  const y0 = yearsOf(p.segment.say)[0]
  const y1 = yearsOf(p.segment.figure?.date ?? '')[0]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={H + 34}>
        <Cases n={n} cols={cols} x={x} y={4} size={size} gap={gap} count={seul.shown ? [n - 1] : []} t0={150} stagger={12} />
        {y0 ? <Txt x={x} y={H + 28} text={String(y0)} size={14} anchor="start" tone="soft" t0={600} /> : null}
        {y1 ? <Txt x={x + w} y={H + 28} text={String(y1)} size={14} anchor="end" tone="soft" t0={700} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Octobre 2025 : 271 voix pour la motion, 289 nécessaires */
const maj07: Board = p => votes(p, ['voix pour la motion', 'voix nécessaires'])

/** 08 S'allier au centre, ou s'en passer : deux plateaux égaux, le fléau à l'horizontale */
const maj08: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: ['personne', 'personne'],
    right: ['personne'],
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

/** 09 « Quelle attitude adopter envers le centre et la droite modérée pour gouverner ? » */
const maj09: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="personne" x={10} y={58} size={40} t0={100} />
      <Picto n="personne" x={52} y={58} size={40} t0={250} />
      <Picto n="monument" x={106} y={18} size={88} t0={400} />
      <Picto n="personne" x={208} y={58} size={40} t0={550} />
      <Picto n="personne" x={250} y={58} size={40} t0={700} />
      <Ask x={234} y={2} h={44} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le 49.3 ——— */

/** 01 « Un texte de loi peut-il être adopté sans vote des députés ? » */
const t01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={116}>
      <Picto n="document" x={30} y={6} size={96} t0={100} />
      <Ask x={135} y={24} h={58} t0={1100} />
      <Picto n="monument" x={186} y={10} size={90} t0={600} tone="ghost" />
    </Art>
  </Seg>
)

/** 02 L'article 49.3 permet d'adopter un texte sans vote : le texte passe à côté des députés, et reçoit son
 *  tampon d'adoption */
const t02: Board = p => {
  const [, sans] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={124}>
        <Picto n="document" x={6} y={52} size={64} t0={100} />
        {[100, 132, 164].map((x, i) => (
          <Picto key={x} n="personne" x={x} y={84} size={30} t0={300 + i * 100} tone="ghost" />
        ))}
        <Fade t0={900} class="vc-dash">
          <path d="M66 58C102 6 196 6 226 50M226 50l-1-9.6M226 50l-8.8-3.6" />
        </Fade>
        <Picto n="document" x={226} y={52} size={64} t0={1200} />
        {sans?.shown ? <Tampon x={272} y={100} r={17} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Sauf si une motion de censure est votée : le texte n'est pas adopté, le gouvernement tombe */
const t03: Board = p => {
  const [motion, tombe] = cuesOf(p)
  if (!motion || !tombe) return null
  const texte = word(p, /le texte/)
  const gouv = word(p, /le gouvernement/)
  const rejete = word(p, /pas adopté/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={160}>
        {motion.shown ? (
          <>
            <Picto n="document" x={122} y={0} size={56} tone="count" t0={0} />
            <Arrow x1={130} y1={52} x2={88} y2={82} tone="count" t0={400} />
            <Arrow x1={170} y1={52} x2={212} y2={82} tone="count" t0={600} />
          </>
        ) : null}
        <Picto n="document" x={22} y={76} size={64} t0={100} tone={rejete?.shown ? 'ghost' : undefined} />
        {texte ? <Txt x={54} y={156} text={texte.text} size={14} t0={300} /> : null}
        <Picto n="mallette" x={208} y={80} size={60} t0={300} />
        {tombe.shown ? <Picto n="baisse" x={268} y={86} size={30} tone="count" t0={200} w={1.2} /> : null}
        {gouv ? <Txt x={242} y={156} text={gouv.text} size={14} t0={500} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 De 1988 à 1993, 39 recours au 49.3 : trente-neuf cases cochées */
const t04: Board = p => {
  const cue = cueOf(p, 0)
  const n = num(cue?.text)
  const [ya, yb] = yearsOf(p.segment.say)
  if (!cue || !n || n > 80) return null
  const cols = 13
  const size = 16
  const gap = 4
  const w = cols * (size + gap) - gap
  const x = (W - w) / 2
  const H = casesH(n, cols, size, gap)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={H + 32}>
        <Cases n={n} cols={cols} x={x} y={2} size={size} gap={gap} count={cue.shown ? range(n) : []} t0={150} stagger={10} />
        {ya ? <Txt x={x} y={H + 26} text={String(ya)} size={14} anchor="start" tone="soft" t0={500} /> : null}
        {yb ? <Txt x={x + w} y={H + 26} text={String(yb)} size={14} anchor="end" tone="soft" t0={600} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Limité depuis 2008 : les budgets de l'État et de la Sécurité sociale, plus un autre texte par session */
const t05: Board = p => {
  const cues = cuesOf(p)
  const date = word(p, /\d+ juillet \d{4}/)
  const budgets = word(p, /budgets/)
  if (cues.length < 3) return null
  const xs = [50, 150, 250]
  return (
    <Seg>
      <Head lines={[date ? { text: date.text, shown: date.shown } : null]} />
      <Art h={162}>
        {budgets?.shown ? (
          <>
            <Txt x={100} y={13} text={budgets.text} size={15} tone="soft" t0={100} />
            <Brace x1={22} y1={36} x2={178} y2={36} side={-1} t0={200} tone="soft" />
          </>
        ) : null}
        {xs.map((cx, i) => (
          <Picto key={cx} n="document" x={cx - 30} y={42} size={60} t0={300 + i * 250} tone={cues[i]!.shown ? 'count' : undefined} />
        ))}
        {cues.map((c, i) => (c.shown ? <Txt key={i} x={xs[i]!} y={124} text={c.text} max={14} size={15} t0={100} /> : null))}
      </Art>
    </Seg>
  )
}

/** 06 Décembre 2024 : 331 voix pour la motion, 288 nécessaires */
const t06: Board = p => votes(p, ['voix pour la motion', 'voix nécessaires'])

/** 07 « Sans majorité absolue, comment faire adopter ses textes ? » : une pile de textes, la question */
const t07: Board = p => (
  <Seg kind="ask">
    <Art h={108}>
      <Picto n="document" x={70} y={18} size={80} t0={100} />
      <Picto n="document" x={82} y={10} size={80} t0={300} />
      <Picto n="document" x={94} y={2} size={80} t0={500} />
      <Ask x={200} y={20} h={62} t0={1000} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const STRATEGIE: Record<string, Board> = {
  'alliances-intro-01': intro01,
  'alliances-intro-02': intro02,
  'alliances-intro-03': intro03,
  'alliances-intro-04': intro04,
  'alliances-intro-05': intro05,
  'alliances-intro-06': intro06,
  'alliances-intro-07': intro07,
  'alliances-intro-08': intro08,
  'alliances-premier-tour-01': tour01,
  'alliances-premier-tour-02': tour02,
  'alliances-premier-tour-03': tour03,
  'alliances-premier-tour-04': tour04,
  'alliances-premier-tour-05': tour05,
  'alliances-premier-tour-06': tour06,
  'alliances-premier-tour-07': tour07,
  'alliances-premier-tour-08': tour08,
  'alliances-premier-tour-09': tour09,
  'alliances-dissolution-01': diss01,
  'alliances-dissolution-02': diss02,
  'alliances-dissolution-03': diss03,
  'alliances-dissolution-04': diss04,
  'alliances-dissolution-05': diss05,
  'alliances-dissolution-06': diss06,
  'alliances-dissolution-07': diss07,
  'alliances-majorite-01': maj01,
  'alliances-majorite-02': maj02,
  'alliances-majorite-03': maj03,
  'alliances-majorite-04': maj04,
  'alliances-majorite-05': maj05,
  'alliances-majorite-06': maj06,
  'alliances-majorite-07': maj07,
  'alliances-majorite-08': maj08,
  'alliances-majorite-09': maj09,
  'alliances-49-3-01': t01,
  'alliances-49-3-02': t02,
  'alliances-49-3-03': t03,
  'alliances-49-3-04': t04,
  'alliances-49-3-05': t05,
  'alliances-49-3-06': t06,
  'alliances-49-3-07': t07,
}
