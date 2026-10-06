// Piste C, les planches de la série « Salaires et travail » (src/ui/videos/series/travail_salaires.ts) : un
// dessin par passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx,
// dessin/mises.tsx). Mêmes règles que « Retraites » et « Logement » : les mots et les nombres viennent du script
// (mots mis en valeur, phrases dites, chiffre et graphique de la fiche) ; une planche qui ne s'y retrouve plus
// rend null, et le passage prend le dessin générique de sa sorte d'image.
// Quelques étiquettes courtes et neutres nomment ce qui est dessiné quand le passage ne les dit pas (« + »,
// signes des évolutions) : elles sont reprises dans le « alt » du passage.

import { chartOf } from '../../model'
import { TRAVAIL_SALAIRES as SERIE } from '../../series/travail_salaires'
import { Art, Arrow, Ask, Fade, Ink, Txt, W, at, cueOf, cuesOf, heard, num, ratioOf, said, sentenceWith, sentencesOf, word, wrap, type P } from '../dessin/encre'
import { Chiffre, Head, Libelle, Note, Panel, Question, Seg, Signature, Src, lineOf } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Cases, Cent, Disque, Plafond, Qui, Rang, Signe, balance, barres, colonnes, effets, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/** Les éléments du graphique de la fiche (compare, series), s'il y en a un */
function itemsOf(p: P) {
  const c = chartOf(p.segment)
  return c && c.kind !== 'part' ? c.items : null
}

/** Une expression dite dans un passage précédent de la vidéo (déjà au tableau quand celui-ci commence) */
function saidBefore(p: P, re: RegExp): boolean {
  const i = p.script.segments.indexOf(p.segment)
  return p.script.segments.slice(0, Math.max(0, i)).some(s => re.test(s.say.replace(/[\u00a0\u202f]/g, ' ')))
}

/** Une évolution écrite à la française, avec son signe : « −1,3 % », « +0,8 % » */
const signed = (v: number) =>
  `${v < 0 ? '\u2212' : '+'}${Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}\u00a0%`

/** Le pictogramme de chaque approfondissement, dans l'introduction (questions, sommaire) */
const PICTOS: Record<string, PictoName> = {
  'travail-pouvoir': 'portemonnaie',
  'travail-salaires': 'escalier',
  'travail-partage': 'pieces',
  'travail-droits': 'document',
  'travail-temps': 'sablier',
}
const DEEP = SERIE.videos.filter(v => v.kind === 'deep')

/** Une horloge au trait, dans un carré de 48 unités ; (x, y) : coin haut gauche, s : côté */
const Horloge = ({ x, y, s = 48, t0 = 0 }: { x: number; y: number; s?: number; t0?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 48})`} style={{ '--k': String(48 / s) }}>
    <Ink d="M44 24a20 20 0 1 1-40 0a20 20 0 1 1 40 0" t0={t0} dur={600} />
    <Ink d="M24 9v3M39 24h-3M24 39v-3M9 24h3" t0={t0 + 400} dur={300} class="vc-thin" />
    <Ink d="M24 24V14M24 24l7 5" t0={t0 + 600} dur={400} class="vc-bold" />
  </g>
)

/** Un escalier de salaires : des marches au trait, de plus en plus hautes ; (x0, base) : pied de la première */
function marches(x0: number, base: number, hs: number[], w = 52, gap = 12) {
  return hs.map((h, i) => ({ x: x0 + i * (w + gap), w, h, top: base - h, d: `M${x0 + i * (w + gap)} ${base}V${base - h}H${x0 + i * (w + gap) + w}V${base}` }))
}

/** Une feuille au trait, coin plié ; (x, y) : coin haut gauche */
const feuille = (x: number, y: number, w: number, h: number) => `M${x} ${y}H${x + w - 18}L${x + w} ${y + 18}V${y + h}H${x}Z`

/* ——— Introduction ——— */

/** 01 « Votre salaire augmente. Les prix aussi. » : un billet et une étiquette montent, et la question */
const intro01: Board = p => {
  const [sal, prix] = cuesOf(p)
  const plus = word(p, /acheter plus/)
  return (
    <Seg>
      <Art h={196}>
        <Picto n="billet" x={20} y={20} size={84} t0={100} />
        {sal?.shown ? (
          <>
            <Picto n="hausse" x={104} y={22} size={34} tone="count" t0={200} w={1.2} />
            <Txt x={70} y={130} text={sal.text} size={16} t0={300} />
          </>
        ) : null}
        <Picto n="etiquette" x={160} y={20} size={84} t0={600} />
        {prix?.shown ? (
          <>
            <Picto n="hausse" x={244} y={22} size={34} tone="count" t0={200} w={1.2} />
            <Txt x={210} y={130} text={prix.text} size={16} t0={300} />
          </>
        ) : null}
        {plus?.shown ? <Ask x={W / 2 - 13} y={142} h={50} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Le pouvoir d'achat : le salaire net d'un côté, les prix de l'autre */
const intro02: Board = p => {
  const [pa, net, prix] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(pa)]} />
      <Art h={150}>
        <Picto n="portemonnaie" x={30} y={8} size={80} t0={200} />
        {net?.shown ? <Txt x={72} y={134} text={net.text} size={16} t0={100} /> : null}
        <Arrow x1={124} y1={48} x2={176} y2={48} dash t0={900} />
        <Arrow x1={176} y1={48} x2={124} y2={48} dash t0={900} />
        <Picto n="etiquette" x={186} y={8} size={80} t0={600} />
        {prix?.shown ? <Txt x={226} y={134} text={prix.text} size={16} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Le Smic : 12,31 euros bruts de l'heure ; à temps plein, près de 1 478 euros nets par mois */
const intro03: Board = p => {
  const heure = word(p, /de l’heure|de l'heure/)
  const mois = word(p, /près de [\d\s]+euros nets par mois/)
  const plein = word(p, /À temps plein/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={146}>
        <Horloge x={26} y={4} s={76} t0={400} />
        {heure ? <Txt x={64} y={106} text={heure.text} size={15} t0={800} /> : null}
        {mois?.shown ? (
          <>
            <Arrow x1={116} y1={42} x2={160} y2={42} dash t0={0} />
            <Picto n="portemonnaie" x={172} y={4} size={74} t0={200} />
            {plein ? <Txt x={210} y={100} text={plein.text} size={14} tone="soft" t0={400} /> : null}
            <Txt x={210} y={120} text={mois.text} max={20} size={15} tone="count" t0={600} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Les prix sur un an : l'ensemble, l'énergie, l'alimentation, à la même échelle */
const intro04: Board = p => {
  const cues = cuesOf(p)
  const labels = [word(p, /Les prix/), word(p, /L’énergie|L'énergie/), word(p, /L’alimentation|L'alimentation/)]
  const vals = cues.map(c => num(c.text))
  if (cues.length !== 3 || vals.some(v => !v) || labels.some(l => !l)) return null
  const g = barres({
    items: cues.map((c, i) => ({ label: labels[i]!.text, value: vals[i]!, text: c.text, shown: c.shown })),
    y: 4,
    size: 22,
    gap: 22,
    room: 84,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Libelle p={p} />
      <Art h={g.h + 10}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Le salaire net moyen, prix déduits, année par année, de part et d'autre d'une ligne zéro. Une barre se trace
 *  quand la voix dit son année ; les années dites au passage précédent sont déjà au tableau (kept) */
function salaireMoyen(p: P, items: { label: string; value: number }[], extra?: { text: string; shown: boolean } | null) {
  const zero = 112
  const k = 46
  const colW = 52
  const xs = [36, 112, 214]
  const title = said(p, /le salaire net moyen du privé, hausse des prix déduite/)
  // La suite du passage précédent : le titre et la ligne zéro sont déjà au tableau
  const cont = !word(p, /le salaire net moyen/)
  return (
    <Art h={206}>
      {title ? <Txt x={W / 2} y={18} text={title} max={34} size={15} kept={cont} /> : null}
      <Ink d={`M14 ${zero}H286`} t0={100} dur={600} class="vc-soft" kept={cont} />
      {items.map((it, i) => {
        const re = new RegExp(`\\b${it.label}\\b`)
        const here = word(p, re)
        const before = !here && saidBefore(p, re)
        if (!here?.shown && !before) return null
        const kept = !!before
        const h = Math.abs(it.value) * k
        const x = xs[i]!
        const up = it.value > 0
        const top = up ? zero - h : zero
        return (
          <g key={it.label} class={up ? undefined : 'vc-count'}>
            <Fade t0={300} kept={kept}>
              <rect class={up ? 'vc-tint' : 'vc-tint-count'} x={x} y={top} width={colW} height={h} />
            </Fade>
            <Ink d={`M${x} ${zero}V${up ? zero - h : zero + h}H${x + colW}V${zero}`} t0={0} dur={600} kept={kept} />
            <Txt x={x + colW / 2} y={up ? zero - h - 8 : zero + h + 22} text={signed(it.value)} size={18} big t0={400} kept={kept} />
            <Txt x={x + colW / 2} y={up ? zero + 20 : zero - 8} text={it.label} size={14} tone="soft" t0={200} kept={kept} />
          </g>
        )
      })}
      {extra?.shown ? <Txt x={xs[2]! + colW / 2} y={zero + 48} text={extra.text} max={14} size={15} tone="count" /> : null}
    </Art>
  )
}

/** 05 Le salaire net moyen, prix déduits : sous la ligne en 2022 et en 2023 */
const intro05: Board = p => {
  const items = itemsOf(p)
  const [a, b] = cuesOf(p)
  if (!items || items.length !== 3 || !a || !b) return null
  return (
    <Seg kind="fig">
      {salaireMoyen(p, items)}
      <Src p={p} />
    </Seg>
  )
}

/** 06 En 2024, au-dessus de la ligne : à peine le niveau de 2019 ; 2022 et 2023 déjà au tableau. La source est celle
 *  du chiffre du passage précédent (même fiche, même graphique) */
const intro06: Board = p => {
  const items = itemsOf(p)
  const peine = cuesOf(p).find(c => /à peine/.test(c.text))
  const niveau = word(p, /à peine son niveau de \d{4}/)
  if (!items || items.length !== 3 || !word(p, new RegExp(items[2]!.label))) return null
  const i = p.script.segments.indexOf(p.segment)
  const prev = i > 0 ? p.script.segments[i - 1] : undefined
  return (
    <Seg kind="fig">
      {salaireMoyen(p, items, peine ? { text: niveau?.text ?? peine.text, shown: peine.shown } : null)}
      {prev?.figure ? <Src p={{ ...p, segment: prev }} /> : null}
    </Seg>
  )
}

/** 07 Les cinq questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = p.segment.say.match(/[^.?!]+\?/g)?.map(q => q.trim()) ?? []
  if (qs.length !== DEEP.length) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map((q, i) => ({
          picto: PICTOS[DEEP[i]!.id] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 3).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 08 Les sujets des vidéos qui suivent : le sommaire de la série, chacun avec le pictogramme de sa question */
const intro08: Board = p => (
  <Seg kind="end">
    <ol class="vc-chap">
      {DEEP.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(200 + i * 400)}>
          <span class="vc-chap-n">{i + 1}</span>
          <Glyphe n={PICTOS[v.id] ?? 'document'} t0={p.still ? 0 : 350 + i * 400} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
    <Signature p={p} />
  </Seg>
)

/* ——— Pouvoir d'achat ——— */

/** 01 Deux voies : un salaire net plus élevé (le billet monte), des prix plus bas (l'étiquette descend) */
const pouvoir01: Board = p => {
  const [voies, sal, prix] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(voies)]} />
      <Art h={140}>
        <Picto n="billet" x={30} y={6} size={76} t0={200} />
        {sal?.shown ? (
          <>
            <Picto n="hausse" x={108} y={10} size={30} tone="count" t0={100} w={1.2} />
            <Txt x={70} y={106} text={sal.text} max={16} size={15} t0={200} />
          </>
        ) : null}
        <Picto n="etiquette" x={166} y={6} size={76} t0={600} />
        {prix?.shown ? (
          <>
            <Picto n="baisse" x={244} y={12} size={30} tone="count" t0={100} w={1.2} />
            <Txt x={212} y={106} text={prix.text} max={16} size={15} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 Chaque 1er janvier : les prix des 20 % de ménages aux revenus les plus faibles, plus la moitié d'un gain */
const pouvoir02: Board = p => {
  const [jan, pct, moitie] = cuesOf(p)
  const share = num(pct?.text)
  const gain = word(p, /du gain de pouvoir d’achat|du gain de pouvoir d'achat/)
  if (!jan || !pct || !moitie || !share || share > 100) return null
  const counted = Math.round(share / 10)
  return (
    <Seg>
      <Art h={204}>
        <Picto n="calendrier" x={6} y={0} size={56} t0={100} />
        {jan.shown ? <Txt x={74} y={38} text={jan.text} size={22} big anchor="start" t0={300} /> : null}
        <Rang n={10} picto="maison" cols={10} x={70} w={230} y={84} max={20} gap={3} count={range(counted)} shown={pct.shown} t0={400} stagger={60} />
        {pct.shown ? <Txt x={8} y={104} text={pct.text} size={22} big anchor="start" tone="count" t0={200} /> : null}
        {moitie.shown ? (
          <>
            <Disque cx={30} cy={164} r={22} part={0.5} t0={0} />
            <Txt x={70} y={160} text={`+ ${moitie.text}`} size={20} big anchor="start" tone="count" t0={300} />
            {gain ? <Txt x={70} y={184} text={gain.text} size={14} anchor="start" tone="soft" t0={500} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 En cours d'année : les prix montent jusqu'au seuil de 2 %, le Smic monte d'une marche au 1er juin ; le coup
 *  de pouce, possible, en pointillé */
const pouvoir03: Board = p => {
  const [seuil, juin, pouce] = cuesOf(p)
  const jan = said(p, /1er\sjanvier/)
  const prix = word(p, /les prix/)
  const smic = said(p, /Smic/)
  if (!seuil || !juin || !pouce) return null
  const X = (m: number) => 24 + m * 34
  const base = 150
  const top = 54
  const xj = X(5)
  return (
    <Seg>
      <Art h={190}>
        <Ink d={`M${X(0)} ${base}H${X(7)}`} t0={0} dur={600} class="vc-soft" />
        <Ink d={range(8).map(m => `M${X(m)} ${base - 4}v8`).join('')} t0={300} dur={300} class="vc-soft vc-thin" />
        {jan ? <Txt x={X(0) - 4} y={base + 24} text={jan} size={14} anchor="start" tone="soft" t0={400} /> : null}
        {/* Les prix : une courbe qui monte depuis la dernière hausse */}
        <Ink d={`M${X(0)} 108C${X(2)} 104 ${X(3)} 86 ${xj} ${top}`} t0={300} dur={1100} />
        {prix ? <Txt x={X(2)} y={86} text={prix.text} size={14} anchor="middle" t0={900} /> : null}
        {seuil.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M${X(0)} ${top}H${xj}`} />
            </Fade>
            <Txt x={X(0)} y={top - 8} text={`+${seuil.text}`} size={16} anchor="start" tone="count" t0={200} />
          </>
        ) : null}
        {/* Le Smic : une marche au 1er juin */}
        <Ink d={`M${X(0) - 16} 136H${X(0)}V126H${xj}${juin.shown ? `V112H${X(7)}` : ''}`} t0={500} dur={900} class="vc-count vc-bold" />
        {smic ? <Txt x={X(0) + 34} y={140} text={smic} size={14} anchor="start" tone="count" t0={700} /> : null}
        {juin.shown ? <Txt x={xj} y={base + 24} text={juin.text} size={14} tone="count" t0={200} /> : null}
        {pouce.shown ? (
          <>
            <Arrow x1={X(6.6)} y1={108} x2={X(6.6)} y2={78} dash tone="ghost" t0={0} head={6} />
            <Txt x={292} y={66} text={pouce.text} size={14} anchor="end" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Directement concernés par la hausse de novembre 2024 : environ 1 salarié sur 8 */
const pouvoir04: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  const millions = cueOf(p, 0)
  if (!cue || !r || r.n > 12) return null
  const { h } = rangCells({ n: r.n, max: 34, gap: 6 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 40}>
        <Rang n={r.n} picto="personne" max={34} gap={6} y={4} count={range(r.k)} shown={cue.shown} t0={300} stagger={120} />
        {millions?.shown ? <Txt x={W / 2} y={h + 32} text={cue.shown ? cue.text : millions.text} size={15} tone={cue.shown ? 'count' : undefined} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Au Smic à temps plein : le brut et le net du mois, à la même échelle */
const pouvoir05: Board = p => {
  const items = itemsOf(p)
  const say = p.segment.say.replace(/[\u00a0\u202f]/g, ' ')
  const brutTxt = /(\d[\d ]*) euros bruts par mois/.exec(say)?.[1]
  const netTxt = /près de (\d[\d ]*) nets/.exec(say)?.[1]
  const brutW = word(p, /bruts par mois/)
  const netW = word(p, /nets/)
  const reste = cueOf(p, 2)
  const vb = items?.[0]?.value ?? num(brutTxt)
  const vn = items?.[1]?.value ?? num(netTxt)
  if (!vb || !vn || !brutTxt || !netTxt || !netW || !brutW) return null
  const net = cueOf(p, 1)
  const g = barres({
    items: [
      { label: brutW.text, value: vb, text: brutTxt.trim(), ghostFrom: net?.shown ? vn : undefined },
      { label: netW.text, value: vn, text: netTxt.trim(), tone: 'count', shown: !!net?.shown },
    ],
    y: 4,
    size: 22,
    gap: 24,
    room: 70,
    t0: 300,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      {reste ? <Note p={p} text={sentenceWith(p.segment.say, reste.text)} /> : null}
      <Src p={p} />
    </Seg>
  )
}

/** 06 L'écart entre brut et net : baisser ces prélèvements augmente le net, à coût égal pour l'employeur ; il faut
 *  alors compenser par d'autres recettes ou des économies */
const pouvoir06: Board = p => {
  const a = word(p, /augmente le net/)
  const b = word(p, /à coût égal pour l’employeur|à coût égal pour l'employeur/)
  const c = word(p, /compenser par d’autres recettes ou des économies|compenser par d'autres recettes ou des économies/)
  if (!a || !b || !c) return null
  const ef = effets({
    items: [
      { picto: 'portemonnaie', dir: 'hausse', text: a.text, shown: a.shown },
      { picto: 'mallette', text: b.text, shown: b.shown },
      { picto: 'guichet', dir: 'baisse', text: c.text, shown: c.shown },
    ],
    x: 14,
    w: 286,
    row: 64,
    t0: 100,
  })
  return (
    <Seg>
      <Head lines={[lineOf(cueOf(p, 0))]} />
      <Art h={ef.h + 6}>{ef.el}</Art>
    </Seg>
  )
}

/** 07 Les prix sont libres ; en cas de crise, des mesures contre les excès, dans un secteur, six mois au plus */
const pouvoir07: Board = p => {
  const [libres, six] = cuesOf(p)
  const crise = word(p, /en cas de crise/)
  const decret = word(p, /par décret/)
  if (!libres || !six) return null
  const x0 = 106
  return (
    <Seg>
      <Head lines={[lineOf(libres)]} />
      <Art h={176}>
        <Picto n="etiquette" x={4} y={30} size={72} t0={200} />
        {crise?.shown ? (
          <>
            <Ink d={`M66 112C82 110 90 96 ${x0} 60`} t0={0} dur={500} />
            <Fade t0={300} class="vc-count vc-dash">
              <path d={`M${x0} 44H284M${x0} 100H284`} />
            </Fade>
            <Ink d={`M${x0} 60C${x0 + 30} 50 ${x0 + 50} 88 ${x0 + 84} 74S${x0 + 140} 58 284 72`} t0={600} dur={1100} />
            {decret ? <Txt x={195} y={32} text={decret.text} size={14} tone="soft" t0={500} /> : null}
          </>
        ) : null}
        {six.shown ? (
          <>
            <Cases n={6} cols={6} x={x0} y={116} size={26} gap={4.4} count={range(6)} />
            <Txt x={195} y={170} text={six.text} size={16} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 Qui porte d'abord chaque levier : Smic → employeurs, prélèvements → finances publiques et sociales, prix →
 *  producteurs, distributeurs ou État ; puis la question */
const pouvoir08: Board = p => {
  const [emp, fin] = cuesOf(p)
  const prod = word(p, /les producteurs, les distributeurs ou l’État|les producteurs, les distributeurs ou l'État/)
  if (!emp || !fin || !prod) return null
  const rows: { top: PictoName; dir: 'hausse' | 'baisse'; who: PictoName; label: string; shown: boolean }[] = [
    { top: 'billet', dir: 'hausse', who: 'mallette', label: emp.text, shown: emp.shown },
    { top: 'document', dir: 'baisse', who: 'guichet', label: fin.text, shown: fin.shown },
    { top: 'etiquette', dir: 'baisse', who: 'immeuble', label: prod.text, shown: prod.shown },
  ]
  const row = 54
  return (
    <Seg kind="ask">
      <Art h={rows.length * row - 8}>
        {rows.map((r, i) => {
          const y = i * row
          return (
            <g key={r.who}>
              <Picto n={r.top} x={4} y={y} size={38} t0={100 + i * 250} />
              <Picto n={r.dir} x={40} y={y + 6} size={18} tone="count" t0={300 + i * 250} w={1.2} />
              {r.shown ? (
                <>
                  <Arrow x1={62} y1={y + 19} x2={84} y2={y + 19} t0={0} head={6} />
                  <Picto n={r.who} x={88} y={y} size={38} tone="count" t0={150} />
                  <Txt x={134} y={y + 24 - (wrap(r.label, 23).length - 1) * 8} text={r.label} max={23} size={14} anchor="start" t0={300} />
                </>
              ) : null}
            </g>
          )
        })}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Autres salaires ——— */

/** 01 Le Smic monte de lui-même, première marche de l'escalier ; au-dessus, les autres salaires en question */
const salaires01: Board = p => {
  const [auto, autres] = cuesOf(p)
  const smic = word(p, /Smic/)
  const st = marches(14, 182, [30, 56, 82, 108], 58, 12)
  const first = st[0]!
  const last = st[st.length - 1]!
  return (
    <Seg>
      <Head lines={[lineOf(autres, true)]} />
      <Art h={196}>
        <Ink d={`M6 182H294`} t0={0} dur={500} class="vc-soft" />
        {st.map((s, i) => (
          <Ink key={i} d={s.d} t0={150 + i * 150} dur={500} />
        ))}
        {auto?.shown ? (
          <g class="vc-count">
            <Fade t0={100}>
              <rect class="vc-tint-count" x={first.x} y={first.top} width={first.w} height={first.h} />
            </Fade>
            <Picto n="hausse" x={first.x + first.w / 2 - 15} y={first.top - 40} size={30} tone="count" t0={200} w={1.2} />
          </g>
        ) : null}
        {smic ? <Txt x={first.x + first.w / 2} y={176} text={smic.text} size={14} t0={600} /> : null}
        {auto?.shown ? <Txt x={first.x} y={first.top - 50} text={auto.text} size={14} anchor="start" tone="count" t0={300} /> : null}
        {autres?.shown ? <Ask x={last.x + last.w / 2 - 14} y={last.top - 62} h={52} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Négociés entre syndicats et employeurs ; la loi interdit de les faire suivre le Smic ou les prix */
const salaires02: Board = p => {
  const [neg, loi] = cuesOf(p)
  const syn = word(p, /syndicats/)
  const emp = word(p, /employeurs/)
  return (
    <Seg>
      <Head lines={[lineOf(neg)]} />
      <Art h={200}>
        <Qui cx={72} base={58} size={50} label={syn?.text} shown={!!syn?.shown} t0={100} />
        <Picto n="document" x={124} y={8} size={52} t0={500} />
        <Qui cx={228} base={58} size={50} label={emp?.text} shown={!!emp?.shown} t0={300} />
        <Ink d="M10 96H290" t0={700} dur={500} class="vc-soft vc-thin" />
        <Picto n="billet" x={30} y={110} size={60} t0={900} />
        <Picto n="etiquette" x={210} y={110} size={60} t0={1100} />
        <Fade t0={1300} class="vc-ghost">
          <path d="M96 140H204" />
        </Fade>
        {loi?.shown ? (
          <>
            <Ink d="M138 124L162 156M162 124L138 156" t0={0} dur={400} class="vc-bold" />
            <Txt x={150} y={192} text={loi.text} size={16} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 En 2022 et 2023 : le bas de l'échelle tient, porté par les hausses du Smic ; le haut des autres se gomme */
const salaires03: Board = p => {
  const [bas, hauts] = cuesOf(p)
  const base = 166
  const st = marches(16, base, [36, 62, 88, 114, 140], 44, 12)
  const cut = 16
  return (
    <Seg>
      <Art h={194}>
        <Ink d={`M6 ${base}H294`} t0={0} dur={500} class="vc-soft" />
        {st.map((s, i) => {
          const shaved = i > 0 && !!hauts?.shown
          const top = shaved ? s.top + cut : s.top
          return (
            <g key={i}>
              <Ink d={`M${s.x} ${base}V${top}H${s.x + s.w}V${base}`} t0={150 + i * 120} dur={500} class={i === 0 && bas?.shown ? 'vc-count' : undefined} />
              {shaved ? (
                <Fade t0={100 + i * 120} class="vc-ghost">
                  <path d={`M${s.x} ${top}V${s.top}H${s.x + s.w}V${top}`} />
                </Fade>
              ) : null}
            </g>
          )
        })}
        {bas?.shown ? (
          <>
            <Fade t0={100} class="vc-count">
              <rect class="vc-tint-count" x={st[0]!.x} y={st[0]!.top} width={st[0]!.w} height={st[0]!.h} />
            </Fade>
            <Picto n="hausse" x={st[0]!.x + 7} y={st[0]!.top - 38} size={30} tone="count" t0={200} w={1.2} />
            <Txt x={st[0]!.x} y={base + 22} text={bas.text} size={15} anchor="start" tone="count" t0={300} />
          </>
        ) : null}
        {hauts?.shown ? <Txt x={290} y={12} text={hauts.text} size={15} anchor="end" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Fin juin 2026, sur un an : le salaire de base et les prix, à la même échelle */
const salaires04: Board = p => {
  const items = itemsOf(p)
  const [sal, prix] = cuesOf(p)
  if (!items || items.length !== 2 || !sal || !prix) return null
  const g = barres({
    items: [
      { label: items[0]!.label, value: items[0]!.value, text: sal.text, tone: 'count', shown: sal.shown },
      { label: items[1]!.label, value: items[1]!.value, text: prix.text, shown: prix.shown },
    ],
    y: 4,
    size: 24,
    gap: 26,
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

/** 05 126 branches sur 179 suivies sous le Smic : une case par branche, les concernées au bleu bille */
const salaires05: Board = p => {
  const cue = cueOf(p, 0)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 400) return null
  const cols = 20
  const size = 10
  const gap = 3.6
  const w = cols * (size + gap) - gap
  const rows = Math.ceil(r.n / cols)
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Art h={rows * (size + gap) + 4}>
        <Cases n={r.n} cols={cols} x={(W - w) / 2} y={2} size={size} gap={gap} count={cue.shown ? range(r.k) : []} solid t0={200} stagger={4} />
      </Art>
      <Note p={p} text={word(p, /Quand le Smic monte, le bas de la grille peut passer dessous/)?.text} />
      <Src p={p} />
    </Seg>
  )
}

/** 06 Le salaire versé reste au moins au Smic, même sous une grille trop basse ; négociation dans les 45 jours */
const salaires06: Board = p => {
  const [smic, jours] = cuesOf(p)
  const smicW = said(p, /Smic/)
  const line = 80
  const base = 150
  const st = marches(12, base, [56, 96, 120], 34, 8)
  return (
    <Seg>
      <Art h={180}>
        <Ink d={`M6 ${base}H146`} t0={0} dur={400} class="vc-soft" />
        {st.map((s, i) => (
          <Ink key={i} d={s.d} t0={100 + i * 120} dur={400} class={i === 0 ? 'vc-soft' : undefined} />
        ))}
        <Ink d={`M6 ${line}H146`} t0={500} dur={600} class="vc-count vc-bold" />
        {smicW ? <Txt x={152} y={line + 5} text={smicW} size={14} anchor="start" tone="count" t0={800} /> : null}
        {smic?.shown ? (
          <>
            <Picto n="billet" x={8} y={line - 34} size={38} tone="count" t0={200} />
            <Txt x={76} y={base + 22} text={smic.text} size={15} tone="count" t0={400} />
          </>
        ) : null}
        {jours?.shown ? (
          <>
            <Picto n="calendrier" x={186} y={16} size={86} t0={0} />
            <Txt x={229} y={136} text={jours.text} size={22} big t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 « Quelle place pour la loi, et pour la négociation ? » : un texte de loi et un accord, à la même taille */
const salaires07: Board = p => {
  const [loi, neg] = cuesOf(p)
  return (
    <Seg kind="ask">
      <Art h={130}>
        <Picto n="document" x={20} y={4} size={92} t0={100} />
        <Ink d={feuille(184, 9, 70, 82)} t0={500} dur={700} />
        <Ink d="M196 32H240M196 44H240M196 56H228" t0={900} dur={400} class="vc-thin" />
        <Ink d="M198 78c6-10 10 6 16-2s8 4 14-2" t0={1200} dur={500} />
        <Ask x={136} y={20} h={56} t0={1500} />
        {loi?.shown ? <Txt x={66} y={122} text={loi.text} size={15} /> : null}
        {neg?.shown ? <Txt x={219} y={122} text={neg.text} size={15} /> : null}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Partage des bénéfices ——— */

/** 01 Une entreprise fait des bénéfices : quelle part revient à ceux qui y travaillent ? */
const partage01: Board = p => {
  const [benef, part] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(part, true)]} />
      <Art h={140}>
        <Picto n="immeuble" x={8} y={22} size={104} t0={100} />
        {benef?.shown ? <Picto n="pieces" x={104} y={78} size={52} tone="count" t0={200} /> : null}
        <Arrow x1={160} y1={102} x2={192} y2={102} dash t0={900} />
        {[206, 236, 266].map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 15} y={86} size={30} t0={1000 + i * 120} />
        ))}
        {part?.shown ? <Ask x={222} y={20} h={52} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Dès 50 salariés, la participation ; depuis 2025, de 11 à 49 salariés aussi, sous condition de bénéfices */
const partage02: Board = p => {
  const [cinquante, onze] = cuesOf(p)
  const depuis = word(p, /Depuis 2025/)
  const trois = word(p, /trois ans de suite/)
  const X = (n: number) => (n <= 50 ? 20 + (n / 50) * 160 : 180 + ((n - 50) / 50) * 100)
  const y = 104
  return (
    <Seg>
      <Art h={170}>
        <Arrow x1={14} y1={y} x2={292} y2={y} t0={0} dur={700} head={7} />
        <Ink d={`M${X(11)} ${y - 6}v12M${X(50)} ${y - 6}v12`} t0={400} dur={300} class="vc-soft" />
        {cinquante?.shown ? (
          <>
            <Ink d={`M${X(50)} ${y}H286`} t0={0} dur={500} class="vc-bold" />
            <Picto n="immeuble" x={210} y={34} size={56} t0={200} />
            <Txt x={238} y={22} text={cinquante.text} size={15} t0={300} />
          </>
        ) : null}
        {onze?.shown ? (
          <g class="vc-count">
            <Ink d={`M${X(11)} ${y}H${X(49)}`} t0={0} dur={500} class="vc-bold" />
            <Picto n="immeuble" x={(X(11) + X(49)) / 2 - 18} y={54} size={36} tone="count" t0={200} />
            <Txt x={(X(11) + X(49)) / 2} y={44} text={onze.text} size={15} tone="count" t0={300} />
            {depuis ? <Txt x={(X(11) + X(49)) / 2} y={24} text={depuis.text} size={14} tone="soft" t0={400} /> : null}
          </g>
        ) : null}
        {trois?.shown ? (
          <>
            <Cases n={3} cols={3} x={X(11)} y={128} size={16} gap={4} count={range(3)} t0={0} />
            <Txt x={X(11) + 66} y={141} text={trois.text} size={14} anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Couverts par un dispositif, et ceux qui ont reçu une prime : cent carrés, deux bleus */
const partage03: Board = p => {
  const [cov, prime] = cuesOf(p)
  const vc = num(cov?.text)
  const vp = num(prime?.text)
  const couverts = word(p, /couverts/)
  const recu = word(p, /ont reçu une prime/)
  if (!cov || !prime || !vc || !vp || vp > vc || vc > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <div class="vc-units">
        <div class="vc-units-grid">
          <Cent kind="carre" low={prime.shown ? Math.round(vp) : 0} high={Math.round(vc)} shown={cov.shown} t0={200} />
        </div>
        <div>
          <p class={cov.shown ? 'vc-units-cap vc-rise' : 'vc-units-cap vc-wait'} style={at(700)}>
            <span class="vc-swatch" aria-hidden="true">
              <i class="is-range" />
              <i />
            </span>
            {`${cov.text} ${couverts?.text ?? ''}`}
          </p>
          <p class={prime.shown ? 'vc-units-cap vc-rise' : 'vc-units-cap vc-wait'} style={at(300)}>
            <span class="vc-swatch" aria-hidden="true">
              <i />
            </span>
            {`${prime.text} ${recu?.text ?? ''}`}
          </p>
        </div>
      </div>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le taux de marge : la part de la richesse créée qui reste aux entreprises */
const partage04: Board = p => {
  const [taux, pct] = cuesOf(p)
  const v = num(pct?.text)
  const richesse = word(p, /la richesse créée/)
  const reste = word(p, /qui leur reste/)
  if (!pct || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Art h={140}>
        <Disque cx={76} cy={70} r={64} part={v / 100} shown={pct.shown} t0={200} />
        {taux ? <Txt x={160} y={32} text={taux.text} size={16} anchor="start" t0={500} /> : null}
        {pct.shown && reste ? (
          <>
            <Ink d="M118 40L152 56" t0={200} dur={300} class="vc-count vc-thin" />
            <Txt x={160} y={62} text={reste.text} size={15} anchor="start" tone="count" t0={400} />
          </>
        ) : null}
        {richesse ? <Txt x={160} y={112} text={richesse.text} size={15} anchor="start" tone="soft" t0={800} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Au conseil d'administration : des représentants des salariés, autour de la même table */
const partage05: Board = p => {
  const [conseil, un] = cuesOf(p)
  const deux = word(p, /(?:au moins )?deux au-delà de huit autres membres/)
  const n = 11
  const counted = [4, 6]
  return (
    <Seg>
      <Head lines={[lineOf(conseil)]} />
      <Art h={150}>
        <Rang n={n} picto="personne" cols={n} max={22} gap={4} y={20} count={counted} shown={!!un?.shown} t0={100} stagger={60} />
        <Ink d="M10 46H290V60H10Z" t0={700} dur={700} />
        {un?.shown ? <Txt x={W / 2} y={92} text={un.text} size={18} big tone="count" t0={200} /> : null}
        {deux?.shown ? <Txt x={W / 2} y={116} text={deux.text} max={34} size={14} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 La moitié des salariés sous 2 190 euros, 1 % au-dessus de 10 261 euros : deux barres à la même échelle */
const partage06: Board = p => {
  const [moins, plus, loi] = cuesOf(p)
  const vm = num(moins?.text)
  const vp = num(plus?.text)
  const moitie = word(p, /la moitié/)
  const un = word(p, /1 %/)
  const moinsDe = word(p, /moins de/)
  const plusDe = word(p, /plus de/)
  if (!moins || !plus || !vm || !vp || !moitie || !un) return null
  const euro = (s: string) => s.replace(/[\s\u00a0]euros?$/, '\u00a0€')
  const g = barres({
    items: [
      { label: `${moitie.text}\u00a0: ${moinsDe?.text ?? ''}`, value: vm, text: euro(moins.text), shown: moins.shown },
      { label: `${un.text}\u00a0: ${plusDe?.text ?? ''}`, value: vp, text: euro(plus.text), tone: 'count', shown: plus.shown },
    ],
    y: 4,
    size: 22,
    gap: 24,
    room: 96,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Art h={g.h + 8}>{g.el}</Art>
      {loi ? <Note p={p} text={sentenceWith(p.segment.say, loi.text)} /> : null}
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Aucune loi ne plafonne ces écarts », écrit quand la voix le dit ; puis « Quel partage entre l'entreprise et
 *  ceux qui y travaillent ? », écrite quand la voix la pose (sa place gardée d'avance) */
const partage07: Board = p => {
  const loi = cuesOf(p).find(c => /Aucune loi/.test(c.text))
  const ask = sentencesOf(p.segment.say).find(x => /\?$/.test(x))
  return (
    <Seg kind="ask">
      {loi ? <Note p={p} text={sentenceWith(p.segment.say, loi.text)} /> : null}
      <Art h={120}>
        <Picto n="immeuble" x={14} y={20} size={92} t0={100} />
        <Picto n="pieces" x={124} y={62} size={52} t0={500} />
        {[218, 248, 278].map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 15} y={82} size={30} t0={800 + i * 120} />
        ))}
        {ask && heard(p, ask.split(' ').slice(0, 3).join(' ')) ? <Ask x={136} y={2} h={52} t0={100} /> : null}
      </Art>
      {ask ? (
        <div class={heard(p, ask.split(' ').slice(0, 3).join(' ')) ? undefined : 'vc-wait'}>
          <Question p={p} t0={0} />
        </div>
      ) : null}
    </Seg>
  )
}

/* ——— Droits des salariés ——— */

/** 01 Un licenciement jugé injustifié : combien obtenir ? */
const droits01: Board = p => {
  const [injuste, combien] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(combien, true)]} />
      <Art h={150}>
        <Picto n="document" x={18} y={0} size={110} t0={100} />
        {injuste?.shown ? <Txt x={74} y={134} text={injuste.text} size={15} t0={100} /> : null}
        <Picto n="pieces" x={160} y={70} size={56} t0={700} />
        {combien?.shown ? <Ask x={232} y={16} h={74} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Le barème : de 1 à 2 mois de salaire à un an d'ancienneté, de 3 à 20 mois à partir de 29 ans */
const droits02: Board = p => {
  const [bareme, a, b] = cuesOf(p)
  const m = /(\d+) à (\d+)[\s\u00a0]mois[^;]*;[^\d]*(\d+) à (\d+)[\s\u00a0]mois (?:à partir de|dès) (\d+)/.exec(p.segment.say.replace(/\u202f/g, ' '))
  const an = word(p, /un an/)
  const vieux = word(p, /\d+ ans/)
  if (!m || !a || !b) return null
  const [lo1, hi1, lo2, hi2, years] = m.slice(1).map(Number) as [number, number, number, number, number]
  const base = 176
  const k = 7
  const X = (y: number) => 34 + (y / Math.max(years, 1)) * 228
  const band = (x: number, lo: number, hi: number) => `M${x - 9} ${base - lo * k}V${base - hi * k}H${x + 9}V${base - lo * k}Z`
  return (
    <Seg>
      <Head lines={[lineOf(bareme)]} />
      <Art h={210}>
        <Ink d={`M20 ${base}H286`} t0={0} dur={600} class="vc-soft" />
        <Ink d={`M${X(1)} ${base - 4}v8M${X(years)} ${base - 4}v8`} t0={300} dur={300} class="vc-soft" />
        {an ? <Txt x={X(1) - 10} y={base + 24} text={an.text} size={14} anchor="start" tone="soft" t0={400} /> : null}
        {vieux ? <Txt x={X(years) + 12} y={base + 24} text={vieux.text} size={14} anchor="end" tone="soft" t0={500} /> : null}
        {a.shown ? (
          <g class="vc-count">
            <Fade t0={200}>
              <path class="vc-tint-count" d={band(X(1), lo1, hi1)} />
            </Fade>
            <Ink d={band(X(1), lo1, hi1)} t0={0} dur={500} />
            <Txt x={X(1) + 16} y={base - hi1 * k - 10} text={a.text} size={16} anchor="start" tone="count" t0={300} />
          </g>
        ) : null}
        {b.shown ? (
          <g class="vc-count">
            <Fade t0={200}>
              <path class="vc-tint-count" d={band(X(years), lo2, hi2)} />
            </Fade>
            <Ink d={band(X(years), lo2, hi2)} t0={0} dur={700} />
            <Txt x={X(years) - 16} y={base - hi2 * k + 14} text={b.text} size={16} anchor="end" tone="count" t0={400} />
          </g>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Licenciement nul : au moins 6 mois de salaire, six cases et la suite en pointillé */
const droits03: Board = p => {
  const [nul, six] = cuesOf(p)
  const n = num(six?.text)
  if (!six || !n || n > 12) return null
  const size = 30
  const gap = 6
  const w = n * (size + gap) - gap
  const x0 = (W - w - 50) / 2
  return (
    <Seg>
      <Head lines={[lineOf(nul)]} />
      <Art h={100}>
        <Cases n={n} cols={n} x={x0} y={8} size={size} gap={gap} count={six.shown ? range(n) : []} t0={200} stagger={80} />
        {six.shown ? (
          <>
            <Arrow x1={x0 + w + 8} y1={8 + size / 2} x2={x0 + w + 48} y2={8 + size / 2} dash tone="ghost" t0={600} />
            <Txt x={W / 2} y={84} text={six.text} size={20} big tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 L'accord d'entreprise posé devant l'accord de branche ; la branche garde 13 domaines */
const droits04: Board = p => {
  const [ent, dom] = cuesOf(p)
  const n = num(dom?.text)
  const branche = word(p, /l’accord de branche|l'accord de branche/)
  if (!ent || !dom || !n || n > 24) return null
  return (
    <Seg>
      <Art h={190}>
        <Ink d={feuille(124, 6, 160, 156)} t0={100} dur={800} />
        {branche ? <Txt x={204} y={186} text={branche.text} size={14} tone="soft" t0={500} /> : null}
        <Cases n={n} cols={4} x={170} y={34} size={18} gap={6} count={dom.shown ? range(n) : []} t0={600} />
        {dom.shown ? <Txt x={217} y={150} text={dom.text} size={15} tone="count" t0={300} /> : null}
        <Fade t0={900}>
          <path class="vc-paper" d={feuille(16, 22, 132, 140)} />
        </Fade>
        <Ink d={feuille(16, 22, 132, 140)} t0={900} dur={800} class={ent.shown ? 'vc-count' : undefined} />
        <Ink d="M30 54H118M30 68H118M30 82H100" t0={1300} dur={500} class="vc-thin vc-soft" />
        {ent.shown ? <Txt x={82} y={118} text={ent.text} max={12} size={16} tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Adhérents à un syndicat en 2019 : tous les salariés, le privé, la fonction publique */
const droits05: Board = p => {
  const items = itemsOf(p)
  const cues = cuesOf(p)
  if (!items || items.length !== 3 || cues.length !== 3) return null
  const g = barres({
    items: items.map((it, i) => ({ label: it.label, value: it.value, text: cues[i]!.text, tone: i === 0 ? 'count' : undefined, shown: cues[i]!.shown })),
    y: 4,
    size: 20,
    gap: 28,
    room: 78,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Libelle p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Affections psychiques reconnues comme maladies professionnelles : 840 en 2020, 1 805 en 2024 */
const droits06: Board = p => {
  const items = itemsOf(p)
  const [now, then] = cuesOf(p)
  if (!items || items.length !== 2 || !now || !then) return null
  const cols = colonnes({
    items: [
      { label: items[0]!.label, value: items[0]!.value, text: then.text, shown: then.shown },
      { label: items[1]!.label, value: items[1]!.value, text: now.text, tone: 'count', shown: now.shown },
    ],
    x: 70,
    w: 160,
    y: 4,
    h: 128,
    colW: 54,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Libelle p={p} />
      <Art h={cols.h + 8}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 CDD et intérim : 9,4 % de l'emploi, une fine part du disque */
const droits07: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const cdd = word(p, /CDD/)
  const interim = word(p, /intérim/)
  const emploi = word(p, /de l’emploi|de l'emploi/)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Art h={136}>
        <Disque cx={80} cy={68} r={62} part={v / 100} shown={cue.shown} t0={200} />
        {cdd ? <Txt x={158} y={30} text={cdd.text} size={15} anchor="start" tone="count" t0={600} /> : null}
        {interim ? <Txt x={158} y={50} text={`et ${interim.text}`} size={15} anchor="start" tone="count" t0={700} /> : null}
        {cue.shown ? <Ink d="M104 16L152 30" t0={400} dur={300} class="vc-count vc-thin" /> : null}
        {emploi ? <Txt x={158} y={112} text={emploi.text} size={15} anchor="start" tone="soft" t0={900} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Le bonus-malus : la cotisation chômage va de 2,95 à 5 %, au lieu de 4 % ; un curseur, d'un côté ou de l'autre */
const droits08: Board = p => {
  const [bm, fourchette] = cuesOf(p)
  const m = /([\d,]+) à ([\d,]+)/.exec(fourchette?.text ?? '')
  const mid = /au lieu de ([\d,]+)/.exec(p.segment.say)?.[1]
  const lo = num(m?.[1])
  const hi = num(m?.[2])
  const v = num(mid)
  if (!fourchette || !m || !lo || !hi || !v || !mid || hi <= lo) return null
  const y = 56
  const X = (t: number) => 34 + ((t - lo) / (hi - lo)) * 232
  const knob = `M${X(v) - 8} ${y - 16}h16v32h-16z`
  return (
    <Seg>
      <Head lines={[lineOf(bm)]} />
      <Art h={112}>
        <Ink d={`M${X(lo)} ${y}H${X(hi)}`} t0={100} dur={700} class="vc-bold" />
        <Ink d={`M${X(lo)} ${y - 8}v16M${X(hi)} ${y - 8}v16M${X(v)} ${y - 6}v12`} t0={500} dur={300} class="vc-soft" />
        <Txt x={X(v)} y={y - 26} text={`${mid}\u00a0%`} size={15} tone="soft" t0={600} />
        <Fade t0={800}>
          <path class="vc-paper" d={knob} />
          <path d={knob} />
        </Fade>
        {fourchette.shown ? (
          <>
            <Arrow x1={X(v) - 14} y1={y} x2={X(lo) + 16} y2={y} tone="count" t0={200} />
            <Arrow x1={X(v) + 14} y1={y} x2={X(hi) - 16} y2={y} tone="count" t0={200} />
            <Txt x={X(lo)} y={y + 32} text={m[1]!} size={18} big tone="count" t0={400} />
            <Txt x={X(hi)} y={y + 32} text={`${m[2]!}\u00a0%`} size={18} big tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 Le taux dépend des fins de contrat suivies d'une inscription à France Travail, comparées au secteur ; puis
 *  protection des salariés, marge de manœuvre des employeurs : la balance, fléau horizontal, et la question. Le
 *  mécanisme reste au tableau tant que la voix n'a pas atteint les deux côtés ; l'image fixe montre la balance */
const droits09: Board = p => {
  const [prot, marge] = cuesOf(p)
  const ou = word(p, /où placer l’équilibre|où placer l'équilibre/)
  const fins = word(p, /leurs fins de contrat/)
  const ft = word(p, /France Travail/)
  const secteur = word(p, /comparé à celui de leur secteur/)
  if (fins && ft && prot && !prot.shown) {
    return (
      <Seg key="mecanisme">
        <Art h={172}>
          {range(3).map(i => (
            <Picto key={i} n="document" x={10 + i * 24} y={14 + i * 8} size={52} t0={100 + i * 150} />
          ))}
          <Txt x={66} y={112} text={fins.text} max={14} size={15} t0={600} />
          {ft.shown ? (
            <>
              <Arrow x1={118} y1={52} x2={172} y2={52} t0={0} head={7} />
              <Picto n="guichet" x={184} y={12} size={76} tone="count" t0={200} />
              <Txt x={222} y={112} text={ft.text} size={15} tone="count" t0={400} />
            </>
          ) : null}
          {secteur?.shown ? <Txt x={W / 2} y={158} text={secteur.text} max={36} size={14} tone="soft" t0={200} /> : null}
        </Art>
      </Seg>
    )
  }
  const b = balance({
    left: (cx, base) => (
      <>
        <Picto n="parapluie" x={cx - 26} y={base - 80} size={52} t0={900} />
        <Picto n="personne" x={cx - 15} y={base - 32} size={30} t0={1100} />
      </>
    ),
    right: ['mallette'],
    labels: [prot?.text ?? null, marge?.text ?? null],
    shown: [!!prot?.shown, !!marge?.shown],
    t0: 100,
  })
  return (
    <Seg kind="ask" key="balance">
      <Head lines={[ou ? { text: `${ou.text}\u202f?`, shown: ou.shown } : null]} />
      <Art h={b.h}>{b.el}</Art>
    </Seg>
  )
}

/* ——— Temps de travail ——— */

/** 01 35 heures par semaine : cinq jours remplis jusqu'au trait ; est-ce un plafond ? */
const temps01: Board = p => {
  const [h35, plafond] = cuesOf(p)
  const base = 146
  const fill = 84
  return (
    <Seg>
      <Head lines={[lineOf(plafond, true)]} />
      <Art h={156}>
        <Ink d={`M10 ${base}H290`} t0={0} dur={500} class="vc-soft" />
        {range(5).map(i => {
          const x = 22 + i * 50
          return (
            <g key={i}>
              <Fade t0={300 + i * 120}>
                <rect class="vc-tint" x={x} y={base - fill} width={36} height={fill} />
              </Fade>
              <Ink d={`M${x} ${base}V${base - fill}H${x + 36}V${base}`} t0={200 + i * 120} dur={400} />
            </g>
          )
        })}
        {h35?.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M10 ${base - fill}H290`} />
            </Fade>
            <Txt x={290} y={base - fill - 10} text={h35.text} size={16} anchor="end" tone="count" t0={200} />
          </>
        ) : null}
        {plafond?.shown ? <Ask x={8} y={2} h={46} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Le seuil des heures supplémentaires : +25 % de la 36e à la 43e heure, +50 % au-delà */
const temps02: Board = p => {
  const [seuil, a, b] = cuesOf(p)
  const h36 = word(p, /36e/)
  const h43 = word(p, /43e/)
  const h35 = said(p, /35 heures/)
  if (!a || !b) return null
  const X = (h: number) => 16 + (h - 30) * 14.8
  const y0 = 46
  const y1 = 78
  return (
    <Seg>
      <Head lines={[lineOf(seuil)]} />
      <Art h={124}>
        <Fade t0={100}>
          <rect class="vc-tint" x={X(30)} y={y0} width={X(35) - X(30)} height={y1 - y0} />
        </Fade>
        <Ink d={`M${X(30)} ${y0}H${X(48)}M${X(30)} ${y1}H${X(48)}`} t0={0} dur={700} />
        <Ink d={`M${X(35)} ${y0 - 14}V${y1 + 14}`} t0={500} dur={300} class="vc-bold" />
        {a.shown ? (
          <g class="vc-count">
            <Fade t0={100}>
              <rect class="vc-tint-count" x={X(35)} y={y0} width={X(43) - X(35)} height={y1 - y0} />
            </Fade>
            <Txt x={(X(35) + X(43)) / 2} y={y0 - 10} text={`+${a.text}`} size={18} big tone="count" t0={200} />
          </g>
        ) : null}
        {b.shown ? (
          <g class="vc-count">
            <Fade t0={100}>
              <rect class="vc-solid-count" x={X(43)} y={y0} width={X(48) - X(43)} height={y1 - y0} />
            </Fade>
            <Txt x={(X(43) + X(48)) / 2} y={y0 - 10} text={`+${b.text}`} size={18} big tone="count" t0={200} />
          </g>
        ) : null}
        <Ink d={`M${X(43)} ${y0}V${y1}`} t0={600} dur={200} class="vc-thin" />
        {h36 ? <Txt x={X(35.4)} y={y1 + 22} text={h36.text} size={14} anchor="start" tone="soft" t0={700} /> : null}
        {h43 ? <Txt x={X(42.8)} y={y1 + 22} text={h43.text} size={14} anchor="end" tone="soft" t0={800} /> : null}
        {h35 ? <Txt x={X(35) - 9} y={y0 - 6} text={h35} size={14} anchor="end" t0={600} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Exonérées d'impôt jusqu'à 7 500 euros par an ; 1,50 euro déduit par heure supplémentaire */
const temps03: Board = p => {
  const [plafond, euro] = cuesOf(p)
  const impot = word(p, /jusqu’à [\d\s]+euros par an|jusqu'à [\d\s]+euros par an/)
  const heure = word(p, /par heure supplémentaire/)
  const ir = word(p, /impôt sur le revenu/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        {ir ? <Txt x={78} y={14} text={ir.text} size={14} tone="soft" t0={100} /> : null}
        <Signe n="document" cx={78} y={22} size={56} label={impot?.text} shown={!!plafond?.shown} max={20} t0={200} />
        <Signe n="piece" cx={222} y={24} size={52} label={heure?.text} shown={!!euro?.shown} tone={euro?.shown ? 'count' : undefined} max={14} t0={600} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 54 % ont fait au moins une heure supplémentaire : cent carrés */
const temps04: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const fait = word(p, /au moins une heure supplémentaire/)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <div class="vc-units">
        <div class="vc-units-grid">
          <Cent kind="carre" low={Math.round(v)} shown={cue.shown} t0={200} />
        </div>
        <p class={cue.shown ? 'vc-units-cap vc-rise' : 'vc-units-cap vc-wait'} style={at(900)}>
          <span class="vc-swatch" aria-hidden="true">
            <i />
          </span>
          {fait?.text}
        </p>
      </div>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Temps compté en jours ou en heures : les heures de l'année, à la même échelle */
const temps05: Board = p => {
  const [, jours, heures] = cuesOf(p)
  const vj = num(jours?.text)
  const vh = num(heures?.text)
  const enJours = word(p, /en jours/)
  const enHeures = word(p, /comptés en heures/)
  // L'année des heures travaillées (2024), qui n'est pas celle du chiffre clé (2025) : écrite sur les barres
  const an = /En (\d{4}), ils/.exec(p.segment.say)?.[1]
  const lab = (s: string) => (an ? `${s}, en ${an}` : s)
  if (!jours || !heures || !vj || !vh || !enJours || !enHeures) return null
  const g = barres({
    items: [
      { label: lab(enJours.text), value: vj, text: jours.text, tone: 'count', shown: jours.shown },
      { label: lab(enHeures.text), value: vh, text: heures.text, shown: heures.shown },
    ],
    y: 4,
    size: 22,
    gap: 24,
    room: 126,
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

/** 06 La journée limitée à 10 heures ; 35 heures en quatre jours : des journées de 8 h 45 ; puis la question de
 *  fin, écrite quand la voix la pose (sa place gardée d'avance) */
const temps06: Board = p => {
  const [dix, quatre, duree] = cuesOf(p)
  const ask = sentencesOf(p.segment.say).find(x => /\?$/.test(x))
  const max = num(dix?.text)
  const days = num(quatre?.text.split(/[\s\u00a0]/)[0])
  const m = /(\d+)[\s\u00a0]h[\s\u00a0](\d+)/.exec(duree?.text ?? '')
  if (!dix || !quatre || !duree || !max || !days || days > 7 || !m) return null
  const hours = Number(m[1]) + Number(m[2]) / 60
  const base = 160
  const k = 12.4
  const top = base - max * k
  const fill = hours * k
  return (
    <Seg kind="ask">
      <Art h={190}>
        <Ink d={`M10 ${base}H290`} t0={0} dur={500} class="vc-soft" />
        <Plafond x0={10} x1={292} y={top} t0={200} />
        {dix.shown ? <Txt x={290} y={top - 14} text={dix.text} size={15} anchor="end" t0={300} /> : null}
        {quatre.shown
          ? range(days).map(i => {
              const x = 18 + i * 54
              return (
                <g key={i} class="vc-count">
                  <Fade t0={200 + i * 150}>
                    <rect class="vc-tint-count" x={x} y={base - fill} width={40} height={fill} />
                  </Fade>
                  <Ink d={`M${x} ${base}V${base - fill}H${x + 40}V${base}`} t0={100 + i * 150} dur={400} />
                </g>
              )
            })
          : null}
        {quatre.shown ? <Txt x={18 + (days * 54 - 14) / 2} y={base + 24} text={quatre.text} size={15} t0={500} /> : null}
        {duree.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M10 ${base - fill}H${18 + days * 54}`} />
            </Fade>
            <Txt x={292} y={base - fill + 7} text={duree.text} size={20} big anchor="end" tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      {ask ? (
        <div class={heard(p, ask.split(' ').slice(0, 3).join(' ')) ? undefined : 'vc-wait'}>
          <Question p={p} t0={0} />
        </div>
      ) : null}
    </Seg>
  )
}

/* ——— Le registre ——— */

export const TRAVAIL_SALAIRES: Record<string, Board> = {
  'travail-intro-01': intro01,
  'travail-intro-02': intro02,
  'travail-intro-03': intro03,
  'travail-intro-04': intro04,
  'travail-intro-05': intro05,
  'travail-intro-06': intro06,
  'travail-intro-07': intro07,
  'travail-intro-08': intro08,
  'travail-pouvoir-01': pouvoir01,
  'travail-pouvoir-02': pouvoir02,
  'travail-pouvoir-03': pouvoir03,
  'travail-pouvoir-04': pouvoir04,
  'travail-pouvoir-05': pouvoir05,
  'travail-pouvoir-06': pouvoir06,
  'travail-pouvoir-07': pouvoir07,
  'travail-pouvoir-08': pouvoir08,
  'travail-salaires-01': salaires01,
  'travail-salaires-02': salaires02,
  'travail-salaires-03': salaires03,
  'travail-salaires-04': salaires04,
  'travail-salaires-05': salaires05,
  'travail-salaires-06': salaires06,
  'travail-salaires-07': salaires07,
  'travail-partage-01': partage01,
  'travail-partage-02': partage02,
  'travail-partage-03': partage03,
  'travail-partage-04': partage04,
  'travail-partage-05': partage05,
  'travail-partage-06': partage06,
  'travail-partage-07': partage07,
  'travail-droits-01': droits01,
  'travail-droits-02': droits02,
  'travail-droits-03': droits03,
  'travail-droits-04': droits04,
  'travail-droits-05': droits05,
  'travail-droits-06': droits06,
  'travail-droits-07': droits07,
  'travail-droits-08': droits08,
  'travail-droits-09': droits09,
  'travail-temps-01': temps01,
  'travail-temps-02': temps02,
  'travail-temps-03': temps03,
  'travail-temps-04': temps04,
  'travail-temps-05': temps05,
  'travail-temps-06': temps06,
}
