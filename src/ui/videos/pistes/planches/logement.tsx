// Piste C, les planches de la série « Logement » : un dessin par passage, composé avec la bibliothèque commune
// (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Mêmes règles que la série « Retraites » : les
// mots et les nombres viennent du script ; une planche qui ne s'y retrouve plus rend null, et le passage prend
// le dessin générique de sa sorte d'image.

import { Art, Arrow, Ask, Fade, Ink, Txt, W, cueOf, cuesOf, fractionOf, heard, num, nums, plain, ratioOf, sentenceWith, sentencesOf, word, yearsOf } from '../dessin/encre'
import { Chiffre, HeadCues, Head, Note, Question, Seg, Signature, Sommaire, Src, Sur100 } from '../dessin/mises'
import { Picto, VILLES, type PictoName } from '../dessin/pictos'
import { Plafond, Qui, Rang, Signe, balance, barres, colonnes, effets, frise, manettes, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/** Les quatre leviers du logement, dans l'ordre où l'introduction les dit, avec leur pictogramme */
const LEVIERS: PictoName[] = ['etiquette', 'immeuble', 'grue', 'fenetre']

/** Une rue de trois immeubles, la nuit : des fenêtres allumées, d'autres éteintes (vides) ; « relit » : les
 *  fenêtres éteintes qui se rallument */
function Rue({ unlit, relit = false, t0 = 0, kept }: { unlit: number[]; relit?: boolean; t0?: number; kept?: boolean }) {
  const ground = 166
  const blds = [
    { x: 12, w: 76, h: 118 },
    { x: 104, w: 92, h: 146 },
    { x: 212, w: 76, h: 106 },
  ]
  const wins: { x: number; y: number }[] = []
  for (const b of blds) {
    const cols = b.w > 80 ? 3 : 2
    const pitch = (b.w - 16) / cols
    for (let y = ground - b.h + 14; y + 18 <= ground - 30; y += 26) for (let c = 0; c < cols; c++) wins.push({ x: b.x + 8 + c * pitch + (pitch - 16) / 2, y })
  }
  const sq = (w: { x: number; y: number }) => `M${w.x} ${w.y}h16v18h-16z`
  const lit = wins.filter((_, i) => !unlit.includes(i))
  const off = wins.filter((_, i) => unlit.includes(i))
  return (
    <>
      <Ink d={`M6 ${ground}H294`} t0={t0} dur={600} kept={kept} />
      {blds.map((b, i) => (
        <Ink key={i} d={`M${b.x} ${ground}V${ground - b.h}H${b.x + b.w}V${ground}`} t0={t0 + 200 + i * 200} dur={600} kept={kept} />
      ))}
      <Fade t0={t0 + 900} kept={kept}>
        <path class="vc-tint" d={lit.map(sq).join('')} />
      </Fade>
      <Ink d={lit.map(sq).join('')} t0={t0 + 700} dur={700} kept={kept} class="vc-thin" />
      {/* Les fenêtres des logements vides : en pointillé ; elles se rallument au bleu bille dans la question */}
      {relit ? (
        <Fade t0={t0 + 600} class="vc-count">
          <path class="vc-tint-count" d={off.map(sq).join('')} />
          <path d={off.map(sq).join('')} class="vc-thin" />
        </Fade>
      ) : (
        <Fade t0={t0 + 1100} kept={kept} class="vc-ghost vc-thin">
          <path d={off.map(sq).join('')} />
        </Fade>
      )}
    </>
  )
}

/** Un document au trait (bail, quittance, avis), 62 × 100 ; (x, y) : son coin haut gauche */
const page = (x: number, y: number) => `M${x} ${y}H${x + 46}L${x + 62} ${y + 16}V${y + 100}H${x}Z`

/* ——— Introduction ——— */

/** 01 « Sur 100 euros que vous gagnez, combien partent dans votre logement ? » : un billet, une part, la maison */
const intro01: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={140}>
        <Ink d="M10 20H186V124H10Z" t0={100} dur={900} />
        <Ink d="M114 72a34 34 0 1 1-68 0a34 34 0 1 1 68 0" t0={600} dur={600} class="vc-thin" />
        <Ink d="M20 30h12M126 114h12" t0={800} dur={300} class="vc-thin" />
        {cue ? <Txt x={80} y={80} text={cue.text.replace(/[\s\u00a0]euros?$/, '\u00a0€')} size={22} big t0={900} /> : null}
        <Fade t0={1400} class="vc-dash vc-soft">
          <path d="M150 20V124" />
        </Fade>
        <Fade t0={1600} class="vc-count">
          <rect class="vc-tint-count" x={150} y={20} width={36} height={104} />
        </Fade>
        <Arrow x1={192} y1={72} x2={218} y2={72} dash t0={1800} />
        <Picto n="maison" x={222} y={44} size={66} t0={1900} />
        <Ask x={268} y={0} h={40} t0={2500} />
      </Art>
    </Seg>
  )
}

/** 02 Le taux d'effort : presque 30 euros sur 100, comptés au bleu bille */
const intro02: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n !== 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="piece" low={r.k} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 03 Emprunter pour acheter le même logement : 14 ans en 1975, 22,9 ans aujourd'hui, une page par année */
const intro03: Board = p => {
  const [now, then] = cuesOf(p)
  const vNow = num(now?.text)
  const vThen = num(then?.text)
  const yThen = yearsOf(p.segment.say)[0]
  const yNow = yearsOf(p.segment.figure?.date ?? '')[0]
  if (!now || !then || !vNow || !vThen || !yThen || !yNow) return null
  const g = barres({
    items: [
      { label: String(yThen), value: vThen, text: then.text, shown: then.shown },
      { label: String(yNow), value: vNow, text: now.text, shown: now.shown },
    ],
    y: 4,
    size: 30,
    gap: 28,
    room: 92,
    t0: 100,
  })
  const pages = (i: number, v: number) => {
    const b = g.geo[i]!
    return range(Math.floor(v - 0.01)).map(k => `M${(b.x0 + (k + 1) * g.scale).toFixed(1)} ${b.top}v30`).join('')
  }
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 10}>
        {g.el}
        {then.shown ? <Ink d={pages(0, vThen)} t0={700} dur={700} class="vc-thin vc-soft" /> : null}
        {now.shown ? <Ink d={pages(1, vNow)} t0={1000} dur={900} class="vc-thin vc-soft" /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Logement social : à peu près 1 demande sur 7 satisfaite en un an ; une file de sept devant la porte */
const intro04: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const { h } = rangCells({ n: r.n, w: 236, max: 34, gap: 6, y: 8 })
  const ground = 8 + h + 3
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={ground + 8}>
        <Ink d={`M4 ${ground}H296`} t0={0} dur={600} class="vc-soft" />
        <Rang n={r.n} picto="personne" w={236} max={34} gap={6} y={8} count={range(r.k).map(i => r.n - 1 - i)} shown={cue.shown} t0={300} stagger={110} />
        <Picto n="porte" x={250} y={ground - 42.2} size={46} t0={150} />
      </Art>
      <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      <Src p={p} />
    </Seg>
  )
}

/** 05 On autorise moins de logements : pour 10 autorisés avant, à peine plus de 9 ; la dixième grue en pointillé */
const intro05: Board = p => {
  const cue = cuesOf(p)[1]
  const m = /Pour (\d+) logements/.exec(plain(p.segment.say))
  const n = m ? Number(m[1]) : 0
  if (!cue || !n || n > 12) return null
  const { h } = rangCells({ n, cols: Math.ceil(n / 2), max: 52, gap: 8 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={n} picto="grue" cols={Math.ceil(n / 2)} max={52} gap={8} y={2} ghost={cue.shown ? [n - 1] : []} t0={200} stagger={110} />
      </Art>
      <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      <Src p={p} />
    </Seg>
  )
}

/** 06 Quatre leviers, chacun sous son pictogramme : loyers, logement social, construction, logements existants */
const intro06: Board = p => {
  const [l, s, c] = cuesOf(p)
  // « les logements qui existent déjà » : le nom court de la vidéo qui en parle, pour tenir sous son levier
  const ex = word(p, /les logements qui existent déjà/)
  const head = word(p, /plusieurs leviers/)
  const list = [l, s, c, ex && { text: 'logements existants', shown: ex.shown }]
  const lev = manettes({
    items: list.map((cue, i) => ({ label: cue?.text, picto: LEVIERS[i], pos: 0.5, shown: !!cue?.shown })),
    y: 2,
    h: 70,
    size: 46,
    t0: 0,
    labelMax: 10,
  })
  return (
    <Seg>
      <Head lines={[head ? { text: head.text, shown: head.shown } : null]} />
      <Art h={lev.h + 4}>{lev.el}</Art>
    </Seg>
  )
}

/** 07 Ils n'agissent pas sur les mêmes choses, n'ont pas le même coût, ne vont pas à la même vitesse */
const intro07: Board = p => {
  const crit: [RegExp, PictoName, number][] = [
    [/pas sur les mêmes choses/, 'cible', 52],
    [/pas le même coût/, 'pieces', 150],
    [/pas à la même vitesse/, 'sablier', 248],
  ]
  return (
    <Seg>
      <Art h={178}>
        {LEVIERS.map((n, i) => (
          <Picto key={n} n={n} x={46 + i * 58} y={0} size={34} kept tone="soft" />
        ))}
        <Ink d="M30 48H270" t0={200} dur={600} class="vc-soft vc-thin" />
        {crit.map(([re, n, cx]) => {
          const w = word(p, re)
          return w?.shown ? <Signe key={n} n={n} cx={cx} y={62} size={56} label={w.text} max={12} t0={0} tone="count" /> : null
        })}
      </Art>
    </Seg>
  )
}

/** 08 « Alors, quel levier, pour qui, et à quel prix ? » : un grand point d'interrogation dont le point est une
 *  maison */
const intro08: Board = p => {
  const s = 3.8
  return (
    <Seg kind="ask">
      <Art h={136}>
        <g transform={`translate(112 4) scale(${s})`} style={{ '--k': String(1 / s) }}>
          <Ink d="M2 9C2 4 6 1 10 1C15 1 18 4 18 8.5C18 13.5 10 14.5 10 21.5V23" t0={200} dur={900} class="vc-bold" />
        </g>
        <Picto n="maison" x={112 + 10 * s - 16} y={4 + 30 * s - 24} size={32} t0={1100} tone="count" />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/** 09 Les leviers vus de plus près dans les vidéos suivantes : le sommaire de la série */
const intro09: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Loyers ——— */

/** 01 « Le propriétaire peut-il fixer le loyer comme il veut ? » : une clé, une étiquette de prix vierge */
const loyers01: Board = p => {
  const prop = word(p, /propriétaire/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={174}>
        <Ink d="M8 140H292" t0={0} dur={600} class="vc-soft" />
        <Qui cx={42} base={138} size={70} t0={100} />
        <Qui cx={250} base={138} size={70} t0={300} label={prop?.text} shown={!!prop?.shown} />
        <Picto n="cle" x={110} y={30} size={80} t0={800} />
        <Ink d="M150 60V88" t0={1400} dur={250} class="vc-thin" />
        <Picto n="etiquette" x={122} y={84} size={58} t0={1500} text="?" />
      </Art>
    </Seg>
  )
}

/** 02 Zones tendues : de grandes agglomérations entourées sur la carte ; le loyer ne monte pas librement entre
 *  deux locataires (un cadenas) */
const loyers02: Board = p => {
  const [zt, lib] = cuesOf(p)
  const entre = word(p, /entre deux locataires/)
  const S = 164 / 48
  const pts = ['Paris', 'Lille', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nantes'].map(c => VILLES[c]!)
  return (
    <Seg>
      <Art h={202}>
        <Picto n="carte_france" x={0} y={8} size={164} t0={100} />
        {zt?.shown ? (
          <>
            {pts.map(([x, y], i) => (
              <Fade key={i} t0={i * 110} class="vc-count">
                <circle class="vc-tint-count" cx={x * S} cy={8 + y * S} r={9} />
                <circle cx={x * S} cy={8 + y * S} r={9} />
              </Fade>
            ))}
            <Txt x={172} y={26} text={zt.text} size={16} anchor="start" tone="count" t0={300} />
          </>
        ) : null}
        <Picto n="etiquette" x={196} y={120} size={58} t0={900} />
        {lib?.shown ? (
          <>
            <Arrow x1={226} y1={118} x2={226} y2={92} t0={0} tone="soft" />
            <Picto n="cadenas" x={208} y={46} size={38} t0={300} tone="count" />
          </>
        ) : null}
        {entre?.shown ? <Txt x={226} y={196} text={entre.text} max={13} size={14} up t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Neuf territoires volontaires, dont Paris, Lille, Lyon et Bordeaux : le loyer y a un plafond */
const loyers03: Board = p => {
  const cap = cuesOf(p)[1]
  const loyer = word(p, /le loyer/)
  const S = 150 / 48
  // La carte décalée pour que le nom d'une ville de l'ouest tienne à sa gauche
  const MX = 16
  const cities = Object.keys(VILLES).filter(c => new RegExp(`\\b${c}\\b`).test(p.segment.say))
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={176}>
        <Picto n="carte_france" x={MX} y={14} size={150} t0={100} />
        {cities.map((c, i) => {
          const [x, y] = VILLES[c]!
          const left = x < 20
          return heard(p, c) ? (
            <g key={c}>
              <Picto n="epingle" x={MX + x * S - 11} y={14 + y * S - 22} size={22} tone="count" t0={i * 80} w={0.9} />
              {/* Le nom est posé sur le contour de la carte : un liseré couleur papier coupe le trait sous ses lettres */}
              <Txt x={MX + x * S + (left ? -13 : 13)} y={14 + y * S - 6} text={c} size={13} anchor={left ? 'end' : 'start'} t0={200} halo />
            </g>
          ) : null
        })}
        <Ink d="M206 156V96H244V156" t0={900} dur={600} />
        <Fade t0={1200}>
          <rect class="vc-tint" x={206} y={96} width={38} height={60} />
        </Fade>
        <Ink d="M186 156H292" t0={800} dur={400} class="vc-soft" />
        {loyer ? <Txt x={225} y={174} text={loyer.text} size={14} t0={1300} /> : null}
        {cap?.shown ? (
          <>
            <Plafond x0={190} x1={290} y={80} t0={0} tone="count" />
            <Txt x={290} y={62} text={cap.text} size={15} anchor="end" tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Un essai de huit ans, qui s'arrête en novembre 2026 sans nouvelle loi ; le Sénat l'examine le 21 octobre */
const loyers04: Board = p => {
  const [end, sen] = cuesOf(p)
  const m = /un essai de (\S+) ans/.exec(plain(p.segment.say))
  const n = num(m?.[1])
  const trial = word(p, /un essai de \S+ ans/)
  const senat = word(p, /au Sénat/)
  if (!end || !n || n > 15) return null
  const x0 = 18
  const x1 = 250
  const y = 104
  const step = (x1 - x0) / n
  return (
    <Seg>
      <Art h={190}>
        <Ink d={`M${x0} ${y}H${x1}`} t0={100} dur={700} />
        <Ink d={range(n + 1).map(i => `M${(x0 + i * step).toFixed(1)} ${y - 6}v12`).join('')} t0={500} dur={400} class="vc-soft" />
        {trial?.shown ? (
          <>
            {range(n).map(i => {
              const a = x0 + i * step + 2
              const b = x0 + (i + 1) * step - 2
              return <Ink key={i} d={`M${a.toFixed(1)} ${y - 9}Q${((a + b) / 2).toFixed(1)} ${y - 30} ${b.toFixed(1)} ${y - 9}`} t0={150 + i * 110} dur={240} class="vc-count" />
            })}
            <Txt x={(x0 + x1) / 2 - 20} y={y + 78} text={trial.text} size={15} tone="count" t0={400} />
          </>
        ) : null}
        {end.shown ? (
          <>
            <Picto n="sablier" x={x1 - 18} y={y + 22} size={38} t0={0} />
            <Txt x={x1 - 26} y={y + 50} text={end.text} size={15} anchor="end" t0={300} />
          </>
        ) : null}
        {sen?.shown ? (
          <>
            <Picto n="drapeau" x={x1 - 14} y={y - 82} size={40} tone="count" t0={0} />
            {senat ? <Txt x={x1 - 20} y={36} text={senat.text} size={14} anchor="end" tone="soft" t0={200} /> : null}
            <Txt x={x1 - 20} y={56} text={sen.text} size={18} big anchor="end" tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Effet mesuré sur les loyers : 2 à 4 % de moins, soit 2 à 4 euros sur 100 */
const loyers05: Board = p => {
  const [pct, eur] = cuesOf(p)
  const m = /(\d+) à (\d+) %/.exec(plain(pct?.text ?? ''))
  if (!pct || !m) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="piece" low={Number(m[1])} high={Number(m[2])} caption={eur ? sentenceWith(p.segment.say, eur.text) : null} shown={pct.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 06 Effet mesuré sur l'offre, hors Île-de-France : 8 logements à louer sur 100 en moins ; à Paris, aucun effet */
const loyers06: Board = p => {
  const [pct, none] = cuesOf(p)
  const k = num(pct?.text)
  const first = sentencesOf(p.segment.say)[0] ?? ''
  const caption = first.slice(first.search(/[\u00a0 ]:/) + 2).trim()
  if (!pct || !k || k > 30) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="maison" low={k} mode="retrait" caption={caption} shown={pct.shown} />
      {none ? <Note p={p} text={sentenceWith(p.segment.say, none.text)} /> : null}
      <Src p={p} />
    </Seg>
  )
}

/** 07 Plus d'un tiers des baux récents étudiés dépassent le plafond : trois baux, un au-dessus de la ligne */
const loyers07: Board = p => {
  const cue = cueOf(p, 0)
  const frac = fractionOf(cue?.text)
  const plafond = word(p, /le plafond/)
  if (!cue || !frac) return null
  const n = Math.round(1 / frac)
  if (n < 2 || n > 4) return null
  const xs = range(n).map(i => (W - n * 62 - (n - 1) * 30) / 2 + i * 92)
  const over = Math.floor(n / 2)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        {xs.map((x, i) => (
          <g key={x}>
            <Ink d={page(x, 30)} t0={150 + i * 200} dur={700} />
            <Ink d={`M${x + 10} 48h26M${x + 10} 58h20`} t0={500 + i * 200} dur={300} class="vc-thin vc-soft" />
          </g>
        ))}
        {xs.map((x, i) => {
          const top = i === over && cue.shown ? 52 : 84
          const tone = i === over && cue.shown ? 'vc-count' : undefined
          return (
            <g key={`b${x}`} class={tone}>
              <Fade t0={900 + i * 150}>
                <rect class={tone ? 'vc-tint-count' : 'vc-tint'} x={x + 22} y={top} width={18} height={122 - top} />
              </Fade>
              <Ink d={`M${x + 22} 122V${top}H${x + 40}V122`} t0={900 + i * 150} dur={400} />
            </g>
          )
        })}
        <Plafond x0={8} x1={292} y={70} t0={600} dash />
        {plafond ? <Txt x={292} y={22} text={plafond.text} size={14} anchor="end" tone="soft" t0={800} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Pour les uns, une protection des locataires ; pour d'autres, un risque de voir moins de logements à louer */
const loyers08: Board = p => {
  const [a, b] = cuesOf(p)
  const sign = word(p, /à louer/)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="parapluie" x={cx - 28} y={base - 82} size={56} t0={900} />
        <Picto n="personne" x={cx - 16} y={base - 34} size={32} t0={1100} />
      </>
    ),
    right: (cx, base) => (
      <g class="vc-shrink" style={{ '--d': '1600ms' }}>
        <Picto n="pancarte" x={cx - 30} y={base - 60} size={60} t0={1200} text={sign?.text} />
      </g>
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

/** 09 « Alors, jusqu'où encadrer les loyers ? » : la ligne du plafond en pointillé, une question posée dessus */
const loyers09: Board = p => (
  <Seg kind="ask">
    <Art h={140}>
      <Plafond x0={16} x1={214} y={58} dash t0={100} />
      <Picto n="maison" x={60} y={70} size={68} t0={300} />
      <Ink d="M8 136H222" t0={200} dur={500} class="vc-soft" />
      <Ask x={150} y={4} h={52} t0={900} />
      <Ink d="M256 24V100M256 24l-7 9M256 24l7 9M256 100l-7-9M256 100l7-9" t0={1300} dur={700} class="vc-count" />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Logement social ——— */

/** 01 72 % des ménages, plus de 7 sur 10, pourraient demander un logement social : dix maisons, sept comptées */
const social01: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const cols = Math.ceil(r.n / 2)
  const { h } = rangCells({ n: r.n, cols, max: 52, gap: 10 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={r.n} picto="maison" cols={cols} max={52} gap={10} y={2} count={range(r.k)} shown={cue.shown} t0={200} stagger={100} />
      </Art>
      <Note p={p} text={cue.text} />
      <Src p={p} />
    </Seg>
  )
}

/** 02 Le principe : un loyer plus bas, sous conditions de revenus, chez un bailleur social */
const social02: Board = p => {
  const [bas, cond] = cuesOf(p)
  const ef = effets({
    items: [
      { picto: 'etiquette', dir: 'baisse', text: bas?.text ?? '', shown: !!bas?.shown },
      { picto: 'pieces', text: cond?.text ?? '', shown: !!cond?.shown },
    ],
    x: 132,
    y: 18,
    w: 168,
    row: 80,
  })
  return (
    <Seg>
      <Art h={160}>
        <Picto n="immeuble" x={0} y={14} size={128} t0={100} />
        {ef.el}
      </Art>
    </Seg>
  )
}

/** 03 Loyer médian au mètre carré : la valeur du parc social en tête, puis les deux barres à la même échelle */
const social03: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const f = p.segment.figure
  const soc = /parc social/.exec(f?.label ?? '')?.[0]
  const pri = /parc privé/.exec(f?.label ?? '')?.[0]
  const unit = f?.value.replace(/^[\d,\s\u00a0]+/, '') ?? ''
  if (!a || !b || !va || !vb || !soc || !pri || !unit) return null
  const g = barres({
    items: [
      { label: soc, value: va, text: `${a.text.replace(/[\s\u00a0]euros?$/, '')}\u00a0${unit}`, shown: a.shown },
      { label: pri, value: vb, text: `${b.text}\u00a0${unit}`, shown: b.shown },
    ],
    y: 4,
    size: 28,
    gap: 28,
    room: 104,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Note p={p} text={sentencesOf(p.segment.say).find(s => /^Pour/.test(s))} cues={[]} />
      <Src p={p} />
    </Seg>
  )
}

/** 04 5,4 millions de logements sociaux, à peu près 1 résidence principale sur 6 : six maisons, l'une immeuble */
const social04: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const { h } = rangCells({ n: r.n, max: 46, gap: 4 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={r.n} picto={i => (i < r.k && cue.shown ? 'immeuble' : 'maison')} max={46} gap={4} y={2} count={range(r.k)} shown={cue.shown} t0={200} stagger={120} />
      </Art>
      <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      <Src p={p} />
    </Seg>
  )
}

/** 05 L'attente : 19 mois en moyenne, 39,5 mois en Île-de-France, à la même échelle */
const social05: Board = p => {
  const a = cueOf(p, 0)
  const b = word(p, /\d+,\d+[\s\u00a0]mois/)
  const moy = word(p, /en moyenne/)
  const idf = word(p, /Île-de-France/)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: moy?.text, value: va, text: a.text, shown: a.shown },
      { label: idf?.text, value: vb, text: b.text, shown: b.shown },
    ],
    x: 0,
    y: 4,
    size: 26,
    gap: 28,
    room: 92,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>
        {g.el}
        <Picto n="calendrier" x={262} y={-4} size={34} t0={0} tone="soft" />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Les locataires partent moins : 12,5 logements sur 100 changeaient d'occupant en 1999, 7 en 2024 */
const social06: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const [yA, yB] = yearsOf(p.segment.say)
  if (!a || !b || !va || !vb || !yA || !yB) return null
  const items = [
    { label: String(yB), value: vb, text: b.text, shown: b.shown || a.shown },
    { label: String(yA), value: va, text: String(va).replace('.', ','), tone: 'count' as const, shown: a.shown },
  ]
  const cols = colonnes({ items, x: 130, w: 130, y: 6, h: 140, t0: 300 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={6 + cols.h}>
        <Picto n="porte" x={8} y={40} size={84} t0={100} />
        <Picto n="alternance" x={30} y={18} size={44} t0={600} tone="soft" />
        {cols.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 9,9 milliards de soutien public : une grue pose des étages, des pièces à côté */
const social07: Board = p => {
  const floors = 4
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Ink d="M120 134H292" t0={0} dur={500} class="vc-soft" />
        <Picto n="grue" x={50} y={2} size={136} t0={100} />
        {range(floors).map(k => {
          const top = 134 - 22 * (k + 1)
          return (
            <g key={k}>
              <Ink d={`M150 ${top + 22}V${top}H226V${top + 22}`} t0={900 + k * 350} dur={400} />
              <Ink d={`M160 ${top + 6}h10v9h-10zM183 ${top + 6}h10v9h-10zM206 ${top + 6}h10v9h-10z`} t0={1100 + k * 350} dur={300} class="vc-thin" />
            </g>
          )
        })}
        <Picto n="pieces" x={240} y={86} size={46} t0={2400} tone="count" />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 La moitié des demandes vient de personnes seules ; les petits logements manquent */
const social08: Board = p => {
  const [seules, petits] = cuesOf(p)
  const ground = 122
  return (
    <Seg>
      <Art h={166}>
        <Ink d={`M8 ${ground}H292`} t0={0} dur={600} class="vc-soft" />
        <Qui cx={38} base={ground - 2} size={58} tone={seules?.shown ? 'count' : undefined} label={seules?.text} shown={!!seules?.shown} max={10} t0={200} />
        {[84, 140, 196].map((x, i) => (
          <g key={x}>
            <Ink d={`M${x} ${ground}V48H${x + 48}V${ground}`} t0={400 + i * 200} dur={500} />
            <Ink d={`M${x + 9} 60h12v12h-12zM${x + 27} 60h12v12h-12zM${x + 9} 86h12v12h-12zM${x + 27} 86h12v12h-12z`} t0={700 + i * 200} dur={300} class="vc-thin" />
          </g>
        ))}
        <g class={petits?.shown ? 'vc-count' : undefined}>
          {petits?.shown ? (
            <Fade>
              <rect class="vc-tint-count" x={256} y={96} width={26} height={26} />
            </Fade>
          ) : null}
          <Ink d={`M256 ${ground}V96H282V${ground}`} t0={1200} dur={300} />
        </g>
        {petits?.shown ? <Txt x={269} y={142} text={petits.text} max={10} size={14} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 09 « Alors, comment raccourcir l'attente ? » : un sablier couché, une question */
const social09: Board = p => (
  <Seg kind="ask">
    <Art h={120}>
      <Picto n="sablier" x={84} y={14} size={92} t0={100} />
      <Ask x={196} y={22} h={70} t0={900} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Construire ——— */

/** 01 Depuis 2022, les chantiers ont ralenti : une grue immobile, une toile d'araignée au coin */
const construire01: Board = p => (
  <Seg>
    <HeadCues p={p} />
    <Art h={162}>
      <Ink d="M10 156H290" t0={0} dur={600} class="vc-soft" />
      <Picto n="grue" x={70} y={14} size={150} t0={100} />
      <Picto n="toile" x={125} y={41} size={34} t0={1300} tone="soft" w={0.8} />
    </Art>
  </Seg>
)

/** 02 Les taux des crédits immobiliers, multipliés par quatre de 2022 à début 2024, puis un peu en baisse */
const construire02: Board = p => {
  const cue = cueOf(p, 0)
  const k = num(/par (\S+)/.exec(cue?.text ?? '')?.[1])
  const [y0, y1] = yearsOf(p.segment.say)
  const taux = word(p, /les taux des crédits immobiliers/)
  if (!cue || !k || k < 2 || k > 8 || !y0 || !y1) return null
  const base = 168
  const unit = 128 / k
  const lv = (m: number) => base - unit * m
  const stepsX = range(k).map(i => 30 + i * (160 / (k - 1 || 1)))
  let d = `M${stepsX[0]} ${lv(1)}`
  stepsX.slice(1).forEach((x, i) => (d += `H${x}V${lv(i + 2)}`))
  d += `L270 ${lv(k) + 14}`
  return (
    <Seg>
      <Art h={196}>
        {taux ? <Txt x={10} y={16} text={taux.text} max={36} size={14} anchor="start" tone="soft" /> : null}
        <Ink d={`M20 ${base}H284`} t0={0} dur={500} class="vc-soft" />
        <Fade t0={400} class="vc-dash vc-soft">
          <path d={`M30 ${lv(1)}H270`} />
        </Fade>
        <Ink d={d} t0={300} dur={1500} class="vc-count" />
        <Txt x={30} y={base + 22} text={String(y0)} size={14} tone="soft" t0={300} />
        <Txt x={stepsX[stepsX.length - 1]!} y={base + 22} text={String(y1)} size={14} tone="soft" t0={600} />
        {cue.shown ? <Txt x={stepsX[stepsX.length - 1]! + 36} y={lv(k) - 12} text={`×\u202f${k}`} size={24} big tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 260 000 mises en chantier par an, environ 700 par jour ; une reprise s'amorce */
const construire03: Board = p => {
  const cue = cuesOf(p)[1]
  const n = num(cue?.text)
  const rep = word(p, /Une reprise|une reprise/)
  if (!cue || !n || n > 9999) return null
  const digits = String(n).padStart(4, ' ').split('')
  const centers = [8.75, 19.25, 28.75, 39.25].map(c => 14 + c * 2.5)
  const per = cue.text.replace(/^[\d\s\u00a0\u202f]+/, '')
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        <Picto n="compteur" x={14} y={-10} size={120} t0={100} />
        {cue.shown
          ? digits.map((c, i) => (c.trim() ? <Txt key={i} x={centers[i]!} y={62} text={c} size={30} big t0={i * 120} /> : null))
          : null}
        {cue.shown && per ? <Txt x={74} y={104} text={per} size={15} t0={500} /> : null}
        {rep?.shown ? (
          <>
            <Picto n="hausse" x={200} y={14} size={56} tone="count" t0={0} w={1.2} />
            <Txt x={228} y={100} text={rep.text.toLowerCase()} size={15} t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le terrain : 102 euros le mètre carré, 95 000 euros par terrain ; une parcelle, une étiquette plantée */
const construire04: Board = p => {
  const per = word(p, /\d[\d\s\u00a0\u202f]*euros par terrain/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={132}>
        <Picto n="terrain" x={8} y={2} size={128} t0={100} />
        <Ink d="M96 92V46" t0={900} dur={300} />
        <Picto n="etiquette" x={88} y={10} size={56} t0={1100} tone="count" />
        {per?.shown ? <Txt x={156} y={56} text={per.text} max={13} size={16} anchor="start" t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Quand les prix montent de 1 %, la construction ne suit que de 0,5 % ; les règles d'urbanisme en travers */
const construire05: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const prix = word(p, /les prix/)
  const cons = word(p, /la construction/)
  const regle = word(p, /les règles d’urbanisme|les règles d'urbanisme/)
  if (!a || !b || !va || !vb || vb > va) return null
  const base = 160
  const H = 116
  const yb = base - (H * vb) / va
  return (
    <Seg>
      <Art h={196}>
        <Ink d={`M20 ${base}H280`} t0={0} dur={500} class="vc-soft" />
        {a.shown ? (
          <>
            <Arrow x1={84} y1={base} x2={84} y2={base - H} t0={0} dur={700} head={10} />
            <Txt x={84} y={base - H - 12} text={`+${a.text}`} size={22} big t0={500} />
          </>
        ) : null}
        {b.shown ? (
          <>
            <Arrow x1={180} y1={base} x2={180} y2={yb} t0={0} dur={500} head={10} tone="count" />
            <Txt x={180} y={yb - 12} text={`+${b.text}`} size={22} big tone="count" t0={400} />
          </>
        ) : null}
        {prix ? <Txt x={84} y={base + 22} text={prix.text} size={14} t0={300} /> : null}
        {cons ? <Txt x={180} y={base + 22} text={cons.text} size={14} t0={500} /> : null}
        {regle?.shown ? (
          <>
            <g transform="rotate(-12 236 60)">
              <Picto n="document" x={216} y={40} size={42} t0={0} />
            </g>
            <Txt x={244} y={112} text={regle.text} max={11} size={13} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Protéger le patrimoine, les paysages, les terres naturelles : une clôture légère ; une maison attend dehors */
const construire06: Board = p => {
  const items: [RegExp, PictoName, number][] = [
    [/patrimoine/, 'monument', 42],
    [/paysages/, 'collines', 112],
    [/terres naturelles/, 'arbre', 182],
  ]
  return (
    <Seg>
      <Art h={168}>
        <Fade t0={100} class="vc-dash vc-soft">
          <path d="M8 8H218V160H8Z" />
        </Fade>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return <Signe key={n} n={n} cx={cx} y={30} size={54} label={w?.text} shown={!!w?.shown} max={11} t0={300 + i * 250} />
        })}
        <Picto n="maison" x={234} y={74} size={58} t0={1600} tone="soft" />
      </Art>
    </Seg>
  )
}

/** 07 2,2 milliards d'aides à l'investissement locatif ; là où le terrain manque, elles peuvent faire monter les
 *  prix */
const construire07: Board = p => {
  const cue = cuesOf(p)[1]
  const terr = word(p, /le terrain/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Picto n="piece" x={14} y={4} size={34} tone="count" t0={100} />
        <Arrow x1={42} y1={40} x2={62} y2={62} t0={400} />
        <Picto n="maison" x={40} y={54} size={80} t0={500} />
        <Picto n="terrain" x={168} y={62} size={70} t0={900} />
        {terr ? <Txt x={203} y={138} text={terr.text} size={14} t0={1100} /> : null}
        {cue?.shown ? (
          <>
            <g class="vc-grow-from" style={{ '--d': '200ms' }}>
              <Picto n="etiquette" x={196} y={4} size={60} tone="count" t0={0} />
            </g>
            <Picto n="hausse" x={262} y={8} size={30} tone="count" t0={500} w={1.2} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Alors, comment construire plus, où, et à quel coût ? » : la grue du début, une question à son crochet */
const construire08: Board = p => (
  <Seg kind="ask">
    <Art h={140}>
      <Ink d="M10 136H290" t0={0} dur={500} class="vc-soft" />
      <Picto n="grue" x={60} y={6} size={130} t0={100} />
      <Ask x={146} y={90} h={42} t0={1300} tone="count" />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Logements existants ——— */

/** Les fenêtres éteintes de la rue (logements vides) */
const ETEINTES = [1, 6, 9, 14, 20]

/** 01 « Et si une partie des logements nécessaires existait déjà ? » : une rue la nuit, des fenêtres éteintes */
const existant01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={170}>
      <Picto n="lune" x={252} y={0} size={34} t0={1600} tone="soft" />
      <Rue unlit={ETEINTES} t0={100} />
    </Art>
  </Seg>
)

/** 02 2,9 millions de logements vides, à peu près 1 sur 13 : treize fenêtres, une éteinte */
const existant02: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 16) return null
  const cols = Math.ceil(r.n / 2)
  const { h } = rangCells({ n: r.n, cols, max: 38, gap: 6 })
  const at = Math.floor(r.n * 0.7)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={r.n} picto="fenetre" cols={cols} max={38} gap={6} y={2} filled count={range(r.k).map(i => at + i)} shown={cue.shown} t0={200} stagger={70} />
      </Art>
      <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      <Src p={p} />
    </Seg>
  )
}

/** 03 Vides depuis plus de deux ans : environ 1,1 million, surtout là où le logement ne manque pas. Sur dix,
 *  combien en zones tendues (d'après le libellé de la fiche) */
const existant03: Board = p => {
  const f = p.segment.figure
  const total = num(f?.value)
  const scale = /million/.test(f?.value ?? '') ? 1e6 : 1
  const tense = nums(f?.label ?? '').find(n => n > 1000 && n < (total ?? 0) * scale)
  const zt = /zones tendues/.exec(f?.label ?? '')?.[0]
  const other = word(p, /là où le logement ne manque pas/)
  if (!total || !tense || !zt) return null
  const inTense = Math.round((10 * tense) / (total * scale))
  const dot = (x: number, y: number, k: number) => (
    <Fade key={`${x}-${y}`} t0={1300 + k * 90} class="vc-count">
      <circle class="vc-tint-count" cx={x} cy={y} r={6} />
      <circle cx={x} cy={y} r={6} />
    </Fade>
  )
  const right = range(10 - inTense).map(k => [178 + (k % 5) * 24, 108 + Math.floor(k / 5) * 18] as const)
  const left = range(inTense).map(k => [44 + k * 24, 108] as const)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        <Fade t0={100} class="vc-soft vc-thin">
          <path d="M6 10H142V128H6ZM158 10H294V128H158Z" />
        </Fade>
        <Picto n="immeuble" x={22} y={24} size={56} t0={300} />
        <Picto n="immeuble" x={72} y={36} size={44} t0={450} />
        <Picto n="collines" x={226} y={30} size={60} t0={600} />
        <Picto n="maison" x={170} y={46} size={44} t0={750} />
        {left.map(([x, y], k) => dot(x, y, k))}
        {right.map(([x, y], k) => dot(x, y, k + inTense))}
        <Txt x={74} y={150} text={zt} size={14} t0={900} />
        {other?.shown ? <Txt x={226} y={150} text={other.text} max={17} size={14} t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Un logement vide depuis un an est taxé en zones tendues ; selon la Cour des comptes, sans faire reculer les
 *  logements vides de longue durée */
const existant04: Board = p => {
  const [tax, longue] = cuesOf(p)
  const vides = word(p, /les logements vides de longue durée/)
  return (
    <Seg>
      <Art h={170}>
        <Picto n="fauteuil" x={96} y={66} size={56} tone="ghost" />
        <Picto n="porte" x={8} y={20} size={108} t0={100} />
        {tax?.shown ? (
          <>
            <g class="vc-slide" style={{ '--from': '-34px', '--d': '100ms', '--t': '900ms' }}>
              <Picto n="document" x={30} y={110} size={36} t0={0} tone="count" />
            </g>
            <Txt x={62} y={164} text={tax.text} size={20} big tone="count" t0={600} />
          </>
        ) : null}
        {longue?.shown ? (
          <>
            <Picto n="sablier" x={206} y={14} size={62} t0={0} />
            <Ink d="M188 98H286" t0={400} dur={500} />
            <Txt x={237} y={124} text={vides?.text ?? longue.text} max={15} size={14} t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Une commune peut limiter la location aux touristes à 90 jours par an, au lieu de 120 */
const existant05: Board = p => {
  const [d90, d120] = cuesOf(p)
  const n90 = num(d90?.text)
  const n120 = num(d120?.text)
  const parAn = word(p, /par an/)
  if (!d90 || !n90 || !n120 || n120 > 365) return null
  const x0 = 20
  const x1 = 280
  const X = (d: number) => x0 + (d / 365) * (x1 - x0)
  return (
    <Seg>
      <Art h={150}>
        <Picto n="valise" x={14} y={0} size={58} t0={100} />
        <Picto n="maison" x={74} y={6} size={52} t0={400} />
        <Ink d={`M${x0} 92H${x1}V114H${x0}Z`} t0={600} dur={800} class="vc-soft" />
        {parAn ? <Txt x={x1} y={138} text={parAn.text} size={14} anchor="end" tone="soft" t0={900} /> : null}
        {d90.shown ? (
          <Fade t0={0} class="vc-count">
            <rect class="vc-tint-count" x={x0} y={92} width={X(n90) - x0} height={22} />
            <path d={`M${x0} 92H${X(n90)}V114H${x0}Z`} />
          </Fade>
        ) : null}
        {d90.shown ? <Txt x={x0} y={138} text={d90.text} size={16} anchor="start" tone="count" t0={200} /> : null}
        {d120?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={`M${X(n120)} 82V124`} />
            </Fade>
            <Txt x={X(n120) + 6} y={80} text={d120.text} size={16} anchor="start" tone="soft" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 3,9 millions de passoires énergétiques ; un nouveau calcul en fait sortir environ 700 000 */
const existant06: Board = p => {
  const cue = cuesOf(p)[1]
  const v = num(p.segment.figure?.value)
  const out = num(cue?.text)
  const nouveau = word(p, /nouveau calcul/)
  if (!cue || !v || !out) return null
  const outM = out / 1e6
  if (outM >= v) return null
  const g = barres({ items: [{ value: v, ghostFrom: cue.shown ? v - outM : undefined }], x: 104, w: 190, y: 44, size: 32, room: 0, t0: 600 })
  const b = g.geo[0]!
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Picto n="chaleur" x={22} y={0} size={40} tone="soft" t0={900} />
        <Picto n="maison" x={6} y={36} size={84} t0={100} />
        {g.el}
        {cue.shown ? <Txt x={b.x1} y={b.top - 10} text={cue.text} size={16} anchor="end" tone="count" t0={300} /> : null}
        {nouveau?.shown ? <Txt x={b.x1} y={b.bottom + 22} text={nouveau.text} size={14} anchor="end" tone="soft" /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 La loi retire peu à peu les passoires de la location : G depuis 2025, F en 2028, E en 2034 */
const existant07: Board = p => {
  const cues = cuesOf(p)
  const years = cues.map(c => Number(c.text)).filter(y => y > 1900)
  if (years.length < 2) return null
  const letter = (y: number) => new RegExp(`\\b([A-G])\\b[^,.]*?${y}`).exec(plain(p.segment.say))?.[1] ?? ''
  const from = years[0]! - 1
  const to = years[years.length - 1]! + 1
  const f = frise({ y: 126, from, to, x0: 20, x1: 280, ticks: range(to - from + 1).map(k => from + k), t0: 100 })
  return (
    <Seg>
      <Art h={156}>
        {f.el}
        {cues.map((c, i) => {
          const y = years[i]
          if (!y || !c.shown) return null
          const x = f.X(y)
          return (
            <g key={y}>
              <Picto n="etiquette" x={x - 26} y={38} size={52} text={letter(y)} t0={0} tone="count" />
              <Fade t0={300} class="vc-dash vc-soft">
                <path d={`M${x} 78V118`} />
              </Fade>
              <Txt x={x} y={150} text={String(y)} size={15} t0={200} />
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 08 Rénover réduit les factures ; mais l'annonce de l'interdiction a poussé des propriétaires à vendre */
const existant08: Board = p => {
  const [a, b] = cuesOf(p)
  const sign = word(p, /à vendre/)
  return (
    <Seg>
      <Art h={176}>
        <Ink d="M150 6V170" t0={0} dur={500} class="vc-soft vc-thin" />
        <Picto n="radiateur" x={16} y={24} size={60} t0={200} />
        {a?.shown ? (
          <g class="vc-shrink" style={{ '--d': '300ms' }}>
            <Picto n="document" x={84} y={30} size={46} t0={0} tone="count" />
          </g>
        ) : null}
        {a?.shown ? <Txt x={75} y={130} text={a.text} max={13} size={15} t0={300} /> : null}
        <Picto n="maison" x={178} y={46} size={64} t0={500} />
        {b?.shown ? <Picto n="pancarte" x={236} y={14} size={56} t0={0} text={sign?.text} tone="count" /> : null}
        {b?.shown ? <Txt x={225} y={130} text={b.text} max={14} size={15} t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 09 « Comment mieux utiliser les logements existants ? » : la rue du début, des fenêtres se rallument */
const existant09: Board = p => (
  <Seg kind="ask">
    <Art h={170}>
      <Rue unlit={ETEINTES} relit kept />
      <Ask x={236} y={4} h={48} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const LOGEMENT: Record<string, Board> = {
  'logement-intro-01': intro01,
  'logement-intro-02': intro02,
  'logement-intro-03': intro03,
  'logement-intro-04': intro04,
  'logement-intro-05': intro05,
  'logement-intro-06': intro06,
  'logement-intro-07': intro07,
  'logement-intro-08': intro08,
  'logement-intro-09': intro09,
  'logement-loyers-01': loyers01,
  'logement-loyers-02': loyers02,
  'logement-loyers-03': loyers03,
  'logement-loyers-04': loyers04,
  'logement-loyers-05': loyers05,
  'logement-loyers-06': loyers06,
  'logement-loyers-07': loyers07,
  'logement-loyers-08': loyers08,
  'logement-loyers-09': loyers09,
  'logement-social-01': social01,
  'logement-social-02': social02,
  'logement-social-03': social03,
  'logement-social-04': social04,
  'logement-social-05': social05,
  'logement-social-06': social06,
  'logement-social-07': social07,
  'logement-social-08': social08,
  'logement-social-09': social09,
  'logement-construire-01': construire01,
  'logement-construire-02': construire02,
  'logement-construire-03': construire03,
  'logement-construire-04': construire04,
  'logement-construire-05': construire05,
  'logement-construire-06': construire06,
  'logement-construire-07': construire07,
  'logement-construire-08': construire08,
  'logement-existant-01': existant01,
  'logement-existant-02': existant02,
  'logement-existant-03': existant03,
  'logement-existant-04': existant04,
  'logement-existant-05': existant05,
  'logement-existant-06': existant06,
  'logement-existant-07': existant07,
  'logement-existant-08': existant08,
  'logement-existant-09': existant09,
}
