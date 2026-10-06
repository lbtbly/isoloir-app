// Piste C, les planches de la série « Ukraine et Russie » (src/ui/videos/series/ukraine_russie.ts) : un dessin par
// passage, composé avec la bibliothèque commune (dessin/). Les mots et les nombres viennent du script (mots mis
// en valeur, phrases dites, chiffre de la fiche) : si le texte change, le dessin suit ; s'il ne s'y retrouve plus,
// la planche rend null et le passage prend le dessin générique de sa sorte d'image.
// Rien de la guerre n'est dessiné : ni arme, ni carte, ni drapeau, ni scène de violence. Des objets neutres
// seulement : des barres à la même échelle pour les bilans, des silhouettes sans attribut, un parapluie pour la
// protection, un bouclier (dessiné ici, il manque à la bibliothèque) pour la défense, une table ronde vue de haut
// pour le Conseil de sécurité, avec tous ses sièges (les cinq permanents à l'encre, les autres en gris). La France et
// la Russie y sont traitées à l'identique (même taille, même ton).
// Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne les dit pas (« total ») : elles
// nomment ce qui est dessiné, et l'« alt » du passage les reprend.

import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, cueOf, cuesOf, num, plain, said, sentencesOf, word, yearsOf, heard, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Panel, Question, Seg, Signature, Sommaire, Src, lineOf } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Barriere, Cases, Disque, Plafond, Rang, Signe, balance, barres, frise, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/** Le nombre en tête d'un mot mis en valeur (« 17 257 civils tués » → « 17 257 », « civils tués ») */
function headNumber(text: string | undefined): { n: string; rest: string; value: number } | null {
  const m = text ? /^(\d{1,3}(?:[\u202f\u00a0 ]\d{3})*(?:,\d+)?)[\u00a0 ]+(.+)$/.exec(text) : null
  const value = num(m?.[1])
  return m && value ? { n: m[1]!, rest: m[2]!, value } : null
}

/* ——— Deux dessins propres à la série ——— */

const BOUCLIER = 'M24 4L42 10V24C42 34 34 41 24 45C14 41 6 34 6 24V10Z'

/** Un bouclier, au trait : la défense ; (x, y) : coin haut gauche, s : côté en unités de la feuille */
function Bouclier({ x, y, s = 48, t0 = 0, kept, tone }: { x: number; y: number; s?: number; t0?: number; kept?: boolean; tone?: Tone }) {
  return (
    <g class={tone ? `vc-${tone}` : undefined} transform={`translate(${x} ${y}) scale(${s / 48})`} style={{ '--k': String(48 / s) }}>
      {tone === 'count' ? (
        <Fade t0={t0 + 300} kept={kept}>
          <path class="vc-tint-count" d={BOUCLIER} />
        </Fade>
      ) : null}
      <Ink d={BOUCLIER} t0={t0} dur={600} kept={kept} />
    </g>
  )
}

/** Les sièges d'une table ronde : le premier en haut, les suivants dans le sens des aiguilles d'une montre */
function seatsOf(cx: number, cy: number, r: number, n: number, seat: number) {
  return range(n).map(i => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    const d = r + seat + 5
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) }
  })
}

/**
 * La table ronde du Conseil de sécurité, vue de haut, et tous ses sièges : quinze (le Conseil compte quinze
 * membres, cf. « 14 voix contre 1 », fiche international_defense-4 ; le nombre n'est ni dit ni écrit). Les cinq
 * sièges permanents (0 à 4 : le premier en haut, puis dans le sens des aiguilles d'une montre, aux mêmes places
 * que seatsOf(…, 5, …)) sont à l'encre, les dix autres en gris ; « count » : les sièges permanents comptés au bleu
 * bille. Sans ces dix sièges, la table laisserait croire que le Conseil n'a que cinq membres.
 */
function Table({ cx, cy, r = 28, seat = 6, count = [], t0 = 0, kept }: { cx: number; cy: number; r?: number; seat?: number; count?: number[]; t0?: number; kept?: boolean }) {
  const seats = seatsOf(cx, cy, r, 5, seat)
  const others = seatsOf(cx, cy, r, 15, seat).filter((_, k) => k % 3 !== 0)
  return (
    <>
      <Ink d={circle(cx, cy, r)} t0={t0} dur={700} kept={kept} />
      {others.map((q, k) => (
        <Ink key={`o${k}`} d={circle(q.x, q.y, seat)} t0={t0 + 300 + k * 50} dur={250} kept={kept} class="vc-soft" />
      ))}
      {seats.map((q, i) =>
        count.includes(i) ? (
          <Fade key={i} t0={count.indexOf(i) * 140} class="vc-count">
            <path class="vc-tint-count" d={circle(q.x, q.y, seat)} />
            <path d={circle(q.x, q.y, seat)} />
          </Fade>
        ) : (
          <Ink key={i} d={circle(q.x, q.y, seat)} t0={t0 + 400 + i * 120} dur={350} kept={kept} />
        ),
      )}
    </>
  )
}

/* ——— Communs à la série ——— */

/**
 * Le bilan vérifié par l'ONU : civils tués et blessés, deux barres à la même échelle, depuis zéro. « plus » : le
 * bilan réel, probablement bien plus élevé, en flèches pointillées au bout des barres, sans grandeur (on ne la
 * connaît pas) ; les nombres sont alors dans le chiffre, au-dessus.
 */
function bilan(p: P, plus: boolean) {
  const cues = cuesOf(p)
  const a = headNumber(cues[0]?.text)
  const b = headNumber(cues[1]?.text)
  if (!a || !b) return null
  const more = plus ? cues[2] : null
  const g = barres({
    items: [
      { label: a.rest, value: a.value, text: plus ? undefined : a.n, shown: cues[0]!.shown },
      { label: b.rest, value: b.value, text: plus ? undefined : b.n, shown: cues[1]!.shown },
    ],
    y: 2,
    size: 22,
    gap: 24,
    room: plus ? 66 : 84,
    t0: 300,
    labelSize: 15,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>
        {g.el}
        {more?.shown
          ? g.geo.map((q, i) => <Arrow key={i} x1={q.x1 + 6} y1={(q.top + q.bottom) / 2} x2={q.x1 + 50} y2={(q.top + q.bottom) / 2} dash tone="ghost" t0={200 + i * 250} />)
          : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Une foule qui se remplit, sous le chiffre (les personnes qui ont besoin d'une aide humanitaire) */
const foule: Board = p => {
  if (!p.segment.figure) return null
  const { h } = rangCells({ n: 20, cols: 10, max: 24, gap: 5 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 4}>
        <Rang n={20} picto="personne" cols={10} max={24} gap={5} y={2} t0={500} stagger={40} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** La protection temporaire : deux personnes et leurs valises, à l'abri d'un parapluie */
const refuge: Board = p => {
  const prot = word(p, /protection temporaire/)
  if (!p.segment.figure || !prot) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={132}>
        <Picto n="parapluie" x={95} y={0} size={110} t0={1000} tone={prot.shown ? 'count' : undefined} />
        <Picto n="personne" x={107} y={58} size={36} t0={300} />
        <Picto n="personne" x={157} y={58} size={36} t0={450} />
        <Picto n="valise" x={62} y={68} size={32} t0={700} />
        <Picto n="valise" x={206} y={68} size={32} t0={850} />
        {prot.shown ? <Txt x={W / 2} y={126} text={prot.text} size={15} tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** « Les avis divergent » : une balance aux plateaux égaux, une question sur chacun ; le dessin ne tranche pas */
const avis: Board = p => {
  const ask = (cx: number, base: number) => <Ask x={cx - 14} y={base - 50} h={44} t0={1300} />
  const bal = balance({ left: ask, right: ask, t0: 200 })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 Le 24 février 2022, l'invasion ; plus de quatre ans après, la guerre continue : une frise des années */
const intro01: Board = p => {
  const [date, duree] = cuesOf(p)
  const y0 = yearsOf(date?.text ?? '')[0]
  const n = num(/plus de (\S+) ans/i.exec(plain(duree?.text ?? ''))?.[1])
  if (!date || !duree || !y0 || !n || n > 10) return null
  // Le 24 février : un peu après le début de l'année
  const start = y0 + 0.15
  const y = 62
  const f = frise({ y, from: y0, to: y0 + n + 0.8, x0: 18, x1: 282, ticks: range(n + 1).map(k => y0 + k), labels: [y0, y0 + n], t0: 200 })
  const xs = f.X(start)
  const xn = f.X(start + n)
  return (
    <Seg>
      <Head lines={[lineOf(date)]} />
      <Art h={142}>
        {f.el}
        {date.shown ? <Picto n="drapeau" x={xs - 11.5} y={y - 44} size={46} tone="count" t0={100} /> : null}
        {duree.shown ? (
          <>
            <Arrow x1={xs} y1={y} x2={f.X(y0 + n + 0.6)} y2={y} tone="count" t0={0} dur={900} />
            <Brace x1={xs} y1={98} x2={xn} y2={98} t0={700} tone="count" />
            <Txt x={(xs + xn) / 2} y={136} text={lower(duree.text)} size={16} tone="count" t0={1000} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 Le bilan vérifié par l'ONU, et le bilan réel, probablement bien plus élevé */
const intro02: Board = p => bilan(p, true)

/** 03 10,8 millions de personnes ont besoin d'une aide humanitaire */
const intro03: Board = foule

/** 04 Plus de 4,3 millions d'Ukrainiens sous protection temporaire dans l'Union européenne */
const intro04: Board = refuge

/** 05 224,5 milliards d'euros de soutien, dont 77,9 d'aide militaire : deux barres à la même échelle */
const intro05: Board = p => {
  const [tot, mil] = cuesOf(p)
  const vt = num(tot?.text)
  const vm = num(mil?.text)
  const aide = word(p, /aide militaire/)
  const unit = said(p, /milliards d’euros/)
  if (!tot || !mil || !vt || !vm || vm >= vt) return null
  const head = (s: string) => s.split(/[\u00a0 ]/)[0]!
  const g = barres({
    items: [
      { label: 'total', value: vt, text: head(tot.text), shown: tot.shown },
      { label: aide?.text, value: vm, text: head(mil.text), tone: 'count', shown: mil.shown },
    ],
    y: 2,
    size: 22,
    gap: 24,
    room: 70,
    t0: 300,
    labelSize: 15,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>
        {unit ? <Txt x={W} y={15} text={`en ${unit}`} anchor="end" size={14} tone="soft" t0={200} /> : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 La France prend part au soutien (un bouclier, des pièces) ; comme la Russie, elle est membre permanent du
 *  Conseil de sécurité (la table ronde et ses cinq sièges, les deux leurs marqués de la même façon) */
const intro06: Board = p => {
  const [mf, perm] = cuesOf(p)
  const fr = word(p, /La France/)
  const ru = word(p, /la Russie/)
  const conseil = word(p, /Conseil de sécurité/)
  if (!mf || !perm || !fr || !ru) return null
  const T = { cx: 226, cy: 56, r: 26, seat: 6 }
  const s = seatsOf(T.cx, T.cy, T.r, 5, T.seat)
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={156}>
        <Bouclier x={10} y={16} s={54} t0={200} />
        <Picto n="pieces" x={70} y={18} size={52} t0={500} />
        {mf.shown ? <Txt x={66} y={100} text={mf.text} max={14} size={15} tone="count" t0={200} /> : null}
        <Ink d="M140 8V148" t0={700} dur={500} class="vc-soft vc-thin" />
        <Table cx={T.cx} cy={T.cy} r={T.r} seat={T.seat} count={perm.shown ? [3, 2] : []} t0={900} />
        {perm.shown ? (
          <>
            <Txt x={s[3]!.x + 8} y={s[3]!.y + 30} text={fr.text} anchor="end" size={15} t0={300} />
            <Txt x={s[2]!.x - 8} y={s[2]!.y + 30} text={ru.text} anchor="start" size={15} t0={450} />
          </>
        ) : null}
        {conseil?.shown ? <Txt x={T.cx} y={150} text={conseil.text} size={15} tone="soft" t0={600} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Sur l'attitude de la France, les avis divergent */
const intro07: Board = avis

/** 08 Les trois questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro08: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  const picto = (q: string): PictoName => (/civils/.test(q) ? 'personne' : /diplomatie/.test(q) ? 'monument' : /aide/.test(q) ? 'pieces' : 'document')
  return (
    <Seg kind="ask">
      <Panel
        cols={qs.length > 2 ? 3 : 2}
        items={qs.map(q => ({ picto: picto(q), text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')), cues: cuesOf(p) }))}
      />
    </Seg>
  )
}

/** 09 Le sommaire de la série */
const intro09: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— La population civile ——— */

/** 01 « Combien de civils sont touchés ? Et qui les compte ? » : une rangée de personnes, une loupe */
const civils01: Board = p => {
  const cues = cuesOf(p)
  if (cues.length < 2) return null
  return (
    <Seg>
      <Head lines={cues.map(c => lineOf(c, true))} />
      <Art h={116}>
        <Rang n={5} picto="personne" y={64} max={46} gap={12} t0={200} stagger={120} />
        {cues[1]!.shown ? <Picto n="loupe" x={124} y={0} size={54} tone="count" t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Une mission de l'ONU recense les victimes qu'elle a pu vérifier : un registre dont les lignes se cochent */
const civils02: Board = p => {
  const verif = cueOf(p, 1)
  const rows = [58, 79, 99]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={136}>
        <Picto n="document" x={30} y={0} size={140} t0={200} />
        {verif?.shown
          ? rows.map((y, i) => <Ink key={y} d={`M152 ${y - 2}l5 5 9-11`} t0={150 + i * 250} dur={300} class="vc-count vc-bold" />)
          : null}
        <Picto n="loupe" x={190} y={34} size={86} t0={900} />
      </Art>
    </Seg>
  )
}

/** 03 Le bilan : 17 257 civils tués, 53 693 blessés, à la même échelle */
const civils03: Board = p => bilan(p, false)

/** 04 Le bilan réel est probablement bien plus élevé, faute d'accès à certaines zones : une grille de zones, dont
 *  quelques-unes hors d'atteinte (pointillé) */
const civils04: Board = p => {
  const acces = cueOf(p, 1)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={98}>
        <Cases n={21} cols={7} x={14} y={4} size={26} gap={6} ghost={acces?.shown ? [5, 6, 13] : []} t0={200} />
        {acces?.shown ? <Ask x={250} y={14} h={64} tone="soft" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 De janvier à août : 55 % de victimes de plus qu'en 2025. Deux colonnes depuis zéro, dans ce rapport */
const civils05: Board = p => {
  const cue = cueOf(p, 0)
  const pct = num(cue?.text)
  const years = [...new Set(yearsOf(p.segment.say))].sort((a, b) => a - b)
  if (!cue || !pct || years.length !== 2) return null
  const base = 140
  const h0 = 62
  const h1 = h0 * (1 + pct / 100)
  const x0 = 64
  const x1 = 156
  const cw = 58
  const col = (x: number, h: number) => `M${x} ${base}V${base - h}H${x + cw}V${base}`
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={166}>
        <Ink d={`M30 ${base}H270`} t0={0} dur={500} class="vc-soft" />
        <Fade t0={500}>
          <rect class="vc-tint" x={x0} y={base - h0} width={cw} height={h0} />
          <rect class="vc-tint" x={x1} y={base - h0} width={cw} height={h0} />
        </Fade>
        <Ink d={col(x0, h0)} t0={200} dur={600} />
        <Ink d={col(x1, h1)} t0={500} dur={700} />
        <Txt x={x0 + cw / 2} y={base + 22} text={String(years[0])} size={15} tone="soft" t0={300} />
        <Txt x={x1 + cw / 2} y={base + 22} text={String(years[1])} size={15} tone="soft" t0={600} />
        {cue.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={`M${x0} ${base - h0}H${x1 + cw}`} />
            </Fade>
            <Fade t0={200} class="vc-count">
              <rect class="vc-tint-count" x={x1} y={base - h1} width={cw} height={h1 - h0} />
            </Fade>
            <Brace x1={x1 + cw + 8} y1={base - h0} x2={x1 + cw + 8} y2={base - h1} t0={300} tone="count" />
            <Txt x={x1 + cw + 30} y={base - (h0 + h1) / 2 + 7} text={`+${cue.text}`} anchor="start" size={20} big tone="count" t0={600} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 47 % des victimes civiles d'août, presque la moitié : une part du disque ; des villes éloignées du front */
const civils06: Board = p => {
  const [pct, villes] = cuesOf(p)
  const part = (num(pct?.text) ?? 0) / 100
  if (!pct || !part || part >= 1) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Disque cx={72} cy={68} r={62} part={part} shown={pct.shown} t0={300} />
        <Picto n="immeuble" x={166} y={20} size={58} t0={800} />
        <Picto n="immeuble" x={228} y={32} size={46} t0={950} />
        {villes?.shown ? <Txt x={226} y={108} text={villes.text} max={16} size={15} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 10,8 millions de personnes ont besoin d'une aide humanitaire */
const civils07: Board = foule

/** 08 Le plan en cible 4,1 millions, pour 2,3 milliards de dollars : deux barres à la même échelle */
const civils08: Board = p => {
  const [cible, budget] = cuesOf(p)
  const besoinTxt = said(p, /\d+,\d+ millions de personnes/)
  const vb = num(besoinTxt)
  const vc = num(cible?.text)
  const besoin = said(p, /besoin d’une aide humanitaire/)
  const plan = word(p, /Le plan/)
  if (!cible || !besoinTxt || !vb || !vc || vc >= vb) return null
  const g = barres({
    items: [
      { label: besoin ?? undefined, value: vb, text: besoinTxt.replace(/[\u00a0 ]de personnes$/, '') },
      { label: plan ? lower(plan.text) : undefined, value: vc, text: cible.text, tone: 'count', shown: cible.shown },
    ],
    y: 2,
    size: 22,
    gap: 26,
    room: 118,
    t0: 200,
    labelSize: 15,
  })
  return (
    <Seg>
      <Art h={g.h + 66}>
        {g.el}
        {budget?.shown ? (
          <>
            <Picto n="billet" x={10} y={g.h + 16} size={52} t0={0} />
            <Txt x={74} y={g.h + 47} text={budget.text} anchor="start" size={16} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 D'autres ont quitté le pays : la protection temporaire dans l'Union européenne */
const civils09: Board = refuge

/** 10 Dont 47 215 en France : l'Union européenne et la France à la même échelle ; la barre de la France, un trait,
 *  montrée du doigt */
const civils10: Board = p => {
  const cue = cueOf(p, 0)
  const nf = /^\d{1,3}(?:[\u202f\u00a0 ]\d{3})*/.exec(cue?.text ?? '')?.[0]
  const vf = num(nf)
  const ue = p.script.segments.find(s => s.figure && /protection temporaire/.test(s.figure.label))?.figure?.value
  const vu = num(ue)
  const ueLabel = said(p, /l’Union européenne/)
  const fr = word(p, /France/)
  if (!cue || !nf || !vf || !ue || !vu || vf >= vu) return null
  const g = barres({
    items: [
      { label: ueLabel ?? undefined, value: vu, text: ue },
      { label: fr?.text, value: vf, text: nf, tone: 'count', shown: cue.shown },
    ],
    y: 2,
    size: 22,
    gap: 30,
    room: 104,
    t0: 200,
    labelSize: 15,
  })
  const f = g.geo[1]!
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={g.h + 36}>
        {g.el}
        {cue.shown ? <Arrow x1={36} y1={f.bottom + 30} x2={f.x1 + 3} y2={f.bottom + 5} tone="count" t0={600} head={7} /> : null}
      </Art>
    </Seg>
  )
}

/** 11 « Quelle aide apporter aux civils, en Ukraine comme dans les pays d'accueil ? » */
const civils11: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Picto n="personne" x={24} y={30} size={58} t0={100} />
      <Picto n="personne" x={80} y={40} size={48} t0={250} />
      <Picto n="valise" x={134} y={56} size={36} t0={450} />
      <Ask x={226} y={20} h={66} t0={900} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— L'aide européenne ——— */

/** 01 « Combien, et sous quelle forme ? » : un bouclier, des pièces, une question */
const aide01: Board = p => (
  <Seg>
    <Head lines={cuesOf(p).map(c => lineOf(c, true))} />
    <Art h={108}>
      <Bouclier x={30} y={12} s={84} t0={300} />
      <Picto n="pieces" x={122} y={14} size={82} t0={700} />
      <Ask x={228} y={18} h={70} t0={1300} />
    </Art>
  </Seg>
)

/** 02 224,5 milliards d'euros : le disque du soutien total, des pièces au milieu */
const aide02: Board = p => (
  <Seg kind="fig">
    <Chiffre p={p} />
    <Art h={132}>
      <Disque cx={W / 2} cy={66} r={62} part={0} shown={false} t0={300} />
      <Picto n="pieces" x={W / 2 - 30} y={36} size={60} t0={900} />
    </Art>
    <Src p={p} />
  </Seg>
)

/** 03 Dont 77,9 milliards d'aide militaire, un peu plus d'un tiers : la part du disque, à la valeur dite */
const aide03: Board = p => {
  const [mil, tiers] = cuesOf(p)
  const vm = num(mil?.text)
  const vt = num(said(p, /atteint \d+(?:,\d+)? milliards/))
  const aide = word(p, /aide militaire/)
  if (!mil || !vm || !vt || vm >= vt) return null
  const part = vm / vt
  const cx = 78
  const cy = 66
  const r = 62
  const tip = partPoint(cx, cy, r, part)
  const mid = partPoint(cx, cy, r * 0.55, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={132}>
        <Disque cx={cx} cy={cy} r={r} part={part} shown={mil.shown} t0={300} />
        {mil.shown ? (
          <>
            <Bouclier x={mid.x - 13} y={mid.y - 13} s={26} t0={500} tone="count" />
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L166 40`} t0={400} dur={400} class="vc-count vc-thin" />
            {aide ? <Txt x={170} y={44} text={aide.text} anchor="start" size={16} tone="count" t0={600} /> : null}
          </>
        ) : null}
        {tiers?.shown ? <Txt x={170} y={72} text={tiers.text} anchor="start" max={14} size={15} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Un prêt pour 2026 et 2027, jusqu'à 90 milliards : deux calendriers sous un plafond */
const aide04: Board = p => {
  const m = /pour (\d{4}) et (\d{4})/.exec(plain(p.segment.say))
  const cue = cueOf(p, 0)
  if (!m) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={126}>
        <Plafond x0={36} x1={264} y={26} tone={cue?.shown ? 'count' : undefined} dash={!cue?.shown} t0={cue?.shown ? 100 : 900} />
        <Picto n="calendrier" x={62} y={38} size={64} t0={200} />
        <Picto n="calendrier" x={174} y={38} size={64} t0={450} />
        <Txt x={94} y={122} text={m[1]!} size={16} tone="soft" t0={400} />
        <Txt x={206} y={122} text={m[2]!} size={16} tone="soft" t0={650} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 60 milliards pour la défense, 30 d'aide budgétaire : deux barres à la même échelle, un pictogramme devant
 *  chacune (un bouclier ; un édifice, l'État) */
const aide05: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const def = word(p, /pour sa défense/)
  const bud = word(p, /d’aide budgétaire/)
  const etat = word(p, /pour maintenir l’État et les services publics/)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: def?.text, value: va, text: a.text, shown: a.shown },
      { label: bud?.text, value: vb, text: b.text, shown: b.shown },
    ],
    x: 50,
    w: 250,
    y: 2,
    size: 24,
    gap: 32,
    room: 118,
    t0: 200,
    labelSize: 15,
  })
  const [ga, gb] = g.geo
  return (
    <Seg>
      <Art h={g.h + (etat ? 54 : 6)}>
        {a.shown ? <Bouclier x={6} y={ga!.top - 8} s={38} t0={300} /> : null}
        {b.shown ? <Picto n="monument" x={4} y={gb!.top - 8} size={40} t0={300} /> : null}
        {g.el}
        {etat?.shown ? <Txt x={W / 2} y={g.h + 28} text={etat.text} max={34} size={14} tone="soft" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 L'Union et ses États membres, dont la France : un grand édifice relié à une rangée de petits */
const aide06: Board = p => {
  const [etats, fr] = cuesOf(p)
  const union = word(p, /l’Union/)
  const xs = [34, 92, 150, 208, 266]
  return (
    <Seg>
      <Art h={158}>
        <Picto n="monument" x={W / 2 - 30} y={0} size={60} t0={200} />
        {union ? <Txt x={W / 2 - 40} y={38} text={union.text} anchor="end" size={15} t0={500} /> : null}
        {etats?.shown ? <Txt x={W / 2 + 40} y={30} text={etats.text} anchor="start" max={10} size={15} t0={200} /> : null}
        {xs.map((cx, i) => (
          <g key={cx}>
            <Ink d={`M${W / 2} 60L${cx} 92`} t0={700 + i * 100} dur={300} class="vc-soft vc-thin" />
            <Picto n="monument" x={cx - 17} y={92} size={34} t0={900 + i * 120} tone={fr?.shown && i === 1 ? 'count' : undefined} />
          </g>
        ))}
        {fr?.shown ? <Txt x={xs[1]!} y={150} text={fr.text} size={15} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 « Quelle aide à l'Ukraine, sous quelle forme, et jusqu'à quand ? » */
const aide07: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Bouclier x={8} y={20} s={54} t0={100} />
      <Picto n="pieces" x={64} y={22} size={52} t0={300} />
      <Picto n="calendrier" x={122} y={22} size={52} t0={500} />
      <Arrow x1={184} y1={48} x2={224} y2={48} dash t0={900} />
      <Ask x={236} y={14} h={66} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— La diplomatie ——— */

/** 01 « Que peut faire l'ONU ? » : la table ronde du Conseil, vue de haut, et une question */
const diplo01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={118}>
      <Table cx={104} cy={60} r={30} seat={7} t0={200} />
      <Ask x={212} y={20} h={70} t0={1400} />
    </Art>
  </Seg>
)

/** 02 Le Conseil de sécurité adopte des résolutions ; cinq membres permanents : les cinq sièges se comptent */
const diplo02: Board = p => {
  const [res, cinq] = cuesOf(p)
  const perm = word(p, /membres permanents/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Table cx={W / 2} cy={62} r={32} seat={7} count={cinq?.shown ? range(5) : []} t0={200} />
        {res?.shown ? <Picto n="document" x={W / 2 - 16} y={62 - 17} size={34} t0={100} /> : null}
        {perm?.shown ? <Txt x={W / 2} y={140} text={perm.text} size={15} t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 La France et la Russie en font partie : deux des cinq sièges, marqués de la même façon */
const diplo03: Board = p => {
  const [fr, ru] = cuesOf(p)
  if (!fr || !ru) return null
  const T = { cx: W / 2, cy: 62, r: 32, seat: 7 }
  const s = seatsOf(T.cx, T.cy, T.r, 5, T.seat)
  const count = [fr.shown ? 3 : -1, ru.shown ? 2 : -1].filter(i => i >= 0)
  return (
    <Seg>
      <Art h={148}>
        <Table {...T} count={count} kept />
        {fr.shown ? <Txt x={s[3]!.x + 10} y={s[3]!.y + 32} text={fr.text} anchor="end" size={17} t0={200} /> : null}
        {ru.shown ? <Txt x={s[2]!.x - 10} y={s[2]!.y + 32} text={ru.text} anchor="start" size={17} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Le vote négatif d'un seul des cinq bloque la résolution : cinq cases de vote, une croix ; une barrière se
 *  baisse sur le chemin de la résolution */
const diplo04: Board = p => {
  const seul = cueOf(p, 0)
  const neg = word(p, /Le vote négatif/)
  const bloque = word(p, /bloquer une résolution/)
  const res = word(p, /une résolution/)
  const bx = (i: number) => 8 + i * 30
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={100}>
        <Cases n={5} cols={5} x={8} y={22} size={24} gap={6} t0={200} />
        {seul?.shown ? <Ink d={`M${bx(2) + 5} 27l14 14m0-14l-14 14`} t0={100} dur={400} class="vc-count vc-bold" /> : null}
        {neg?.shown ? <Txt x={bx(2) + 12} y={72} text={lower(neg.text)} size={15} tone="count" t0={300} /> : null}
        <Arrow x1={160} y1={34} x2={bloque?.shown ? 176 : 236} y2={34} dash t0={bloque?.shown ? 0 : 900} />
        <Picto n="document" x={228} y={4} size={72} t0={600} />
        {res ? <Txt x={296} y={94} text={res.text} anchor="end" size={15} tone="soft" t0={900} /> : null}
        {bloque?.shown ? <Barriere x={212} y={57.5} s={1} t0={100} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 05 La France comme la Russie peuvent, chacune, bloquer seule une résolution : deux barrières identiques */
const diplo05: Board = p => {
  const fr = word(p, /La France/)
  const ru = word(p, /la Russie/)
  if (!fr || !ru) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={124}>
        <Signe n="barriere" cx={82} y={6} size={84} label={fr.text} shown={fr.shown} t0={200} />
        <Signe n="barriere" cx={222} y={6} size={84} label={ru.text} shown={ru.shown} t0={500} />
      </Art>
    </Seg>
  )
}

/** 06 Plusieurs moyens d'agir : l'aide (un bouclier, des pièces) ; la voix au Conseil de sécurité (la table) */
const diplo06: Board = p => {
  const aide = word(p, /Aide militaire et financière/)
  const voix = word(p, /voix au Conseil de sécurité/)
  if (!aide || !voix) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={128}>
        <Bouclier x={14} y={6} s={60} t0={100} />
        <Picto n="pieces" x={78} y={8} size={56} t0={300} />
        <Txt x={72} y={94} text={aide.text} max={16} size={15} t0={500} />
        <Ink d="M150 10V120" t0={600} dur={400} class="vc-soft vc-thin" />
        {voix.shown ? (
          <>
            <Table cx={225} cy={40} r={20} seat={4.5} t0={0} />
            <Txt x={225} y={94} text={voix.text} max={16} size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Sur l'attitude à adopter par la France, les avis divergent */
const diplo07: Board = avis

/** 08 « Quelle stratégie face à la guerre menée par la Russie en Ukraine ? » */
const diplo08: Board = p => (
  <Seg kind="ask">
    <Art h={98}>
      <Table cx={56} cy={48} r={24} seat={5.5} t0={100} />
      <Arrow x1={118} y1={48} x2={200} y2={48} dash t0={900} />
      <Ask x={216} y={14} h={66} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const UKRAINE_RUSSIE: Record<string, Board> = {
  'ukraine-intro-01': intro01,
  'ukraine-intro-02': intro02,
  'ukraine-intro-03': intro03,
  'ukraine-intro-04': intro04,
  'ukraine-intro-05': intro05,
  'ukraine-intro-06': intro06,
  'ukraine-intro-07': intro07,
  'ukraine-intro-08': intro08,
  'ukraine-intro-09': intro09,
  'ukraine-civils-01': civils01,
  'ukraine-civils-02': civils02,
  'ukraine-civils-03': civils03,
  'ukraine-civils-04': civils04,
  'ukraine-civils-05': civils05,
  'ukraine-civils-06': civils06,
  'ukraine-civils-07': civils07,
  'ukraine-civils-08': civils08,
  'ukraine-civils-09': civils09,
  'ukraine-civils-10': civils10,
  'ukraine-civils-11': civils11,
  'ukraine-aide-01': aide01,
  'ukraine-aide-02': aide02,
  'ukraine-aide-03': aide03,
  'ukraine-aide-04': aide04,
  'ukraine-aide-05': aide05,
  'ukraine-aide-06': aide06,
  'ukraine-aide-07': aide07,
  'ukraine-diplomatie-01': diplo01,
  'ukraine-diplomatie-02': diplo02,
  'ukraine-diplomatie-03': diplo03,
  'ukraine-diplomatie-04': diplo04,
  'ukraine-diplomatie-05': diplo05,
  'ukraine-diplomatie-06': diplo06,
  'ukraine-diplomatie-07': diplo07,
  'ukraine-diplomatie-08': diplo08,
}
