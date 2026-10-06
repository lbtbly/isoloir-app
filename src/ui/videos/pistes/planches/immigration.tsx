// Planches de la série « Immigration » (src/ui/videos/series/immigration.ts) : un dessin par passage, composé
// avec la bibliothèque commune (../dessin/), comme retraites.tsx et logement.tsx. Les mots et les nombres
// viennent du script (mots mis en valeur, phrases dites, chiffre et libellé de la fiche) : si le texte change, le
// dessin suit ; s'il ne s'y retrouve plus, la planche rend null et le passage prend le dessin générique.
// Sujet sensible : aucune frontière, aucun drapeau, aucune scène de contrainte. Des objets neutres seulement
// (valise, porte, carte de séjour, guichet, document, enveloppe pour l'OQTF, bâtiment pour un centre) ; une
// personne n'est qu'une tête et des épaules. Le bleu bille compte ce dont parle le passage, sans désigner de
// « bon » côté ; les comparaisons partent de zéro, à la même échelle.

import { Art, Arrow, Ask, Fade, Ink, Txt, W, at, cueOf, cuesOf, heard, num, plain, ratioOf, said, sentenceWith, sentencesOf, word, type P } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Libelle, Panel, Question, Seg, Signature, Src, Sur100, lineOf } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Cases, Disque, Rang, Signe, balance, barres, frise, partPoint, rangCells } from '../dessin/schemas'
import { IMMIGRATION as SERIE } from '../../series/immigration'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/** Deux grandeurs dites (les deux premiers mots mis en valeur), en barres à la même échelle depuis zéro, chacune
 *  sous son étiquette tirée du passage ; le chiffre de la fiche en tête (ou son seul libellé), la source dessous */
function deuxBarres(p: P, la: RegExp, lb: RegExp, { libelle = false, labelSize = 15 }: { libelle?: boolean; labelSize?: number } = {}) {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || va === null || vb === null) return null
  const g = barres({
    items: [
      { label: word(p, la)?.text, value: va, text: a.text, shown: a.shown },
      { label: word(p, lb)?.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 24,
    gap: 30,
    room: 96,
    t0: 300,
    labelSize,
  })
  return (
    <Seg kind="fig">
      {libelle ? <Libelle p={p} /> : <Chiffre p={p} />}
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** L'échelle des niveaux de français : un montant gradué, chaque barreau son niveau écrit à gauche */
function Barreau({ y, name, tone, t0 = 0, kept }: { y: number; name: string; tone?: 'soft' | 'count'; t0?: number; kept?: boolean }) {
  return (
    <>
      <Ink d={`M42 ${y}h18`} t0={t0} dur={250} kept={kept} class="vc-soft" />
      <Txt x={34} y={y + 7} text={name} size={20} big anchor="end" tone={tone} t0={t0 + 100} kept={kept} />
    </>
  )
}

/* ——— Introduction ——— */

/** 01 « Qui peut rester, et qui doit partir ? » : une personne et sa valise devant une porte ; on entre, on sort */
const intro01: Board = p => {
  const [stay, go] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={160}>
        <Ink d="M10 152H290" t0={100} dur={700} class="vc-soft" />
        <Picto n="personne" x={18} y={72} size={84} t0={250} />
        <Picto n="valise" x={92} y={108} size={46} t0={700} />
        <Picto n="porte" x={190} y={60} size={100} t0={1000} />
        <Ask x={156} y={8} h={50} t0={1500} />
        {stay?.shown ? <Arrow x1={146} y1={98} x2={212} y2={98} dash t0={100} /> : null}
        {go?.shown ? <Arrow x1={212} y1={126} x2={146} y2={126} dash t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Un immigré : né étranger, à l'étranger ; arrivé en France ; certains sont devenus français */
const intro02: Board = p => {
  const fr = cueOf(p, 1)
  const nee = word(p, /née étrangère/)
  const ail = word(p, /à l’étranger|à l'étranger/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={140}>
        <Picto n="personne" x={24} y={36} size={52} t0={600} />
        {nee ? <Txt x={50} y={110} text={nee.text} size={14} t0={900} /> : null}
        {ail ? <Txt x={50} y={128} text={ail.text} size={14} tone="soft" t0={1100} /> : null}
        <Picto n="carte_france" x={118} y={4} size={104} t0={200} />
        <Arrow x1={82} y1={68} x2={148} y2={68} dash t0={1300} />
        <Picto n="personne" x={150} y={46} size={40} t0={1600} />
        {fr?.shown ? (
          <>
            <Ink d="M188 70L222 66" t0={0} dur={300} class="vc-count vc-thin" />
            <Picto n="carte" x={222} y={30} size={70} tone="count" t0={200} />
            <Txt x={257} y={104} text={fr.text} max={10} size={15} tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 12,2 % de la population active : à peu près 12 sur 100, comptés dans une grille de cent */
const intro03: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text)?.n === 100)
  const r = ratioOf(cue?.text)
  if (!cue || !r) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={r.k} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 04 377 462 premiers titres de séjour : des cartes de séjour en rangées ; 9,2 % de plus en un an */
const intro04: Board = p => {
  const v = word(p, /\d+,\d+[\s\u00a0]%/)
  const plus = word(p, /de plus en un an/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={96}>
        <Rang n={10} picto="carte" cols={5} w={196} max={36} gap={4} y={8} t0={500} stagger={80} />
        {v?.shown ? (
          <>
            <Picto n="hausse" x={214} y={0} size={40} tone="count" w={1.2} />
            <Txt x={256} y={30} text={v.text} size={20} big anchor="start" tone="count" t0={200} />
            {plus ? <Txt x={214} y={66} text={plus.text} max={10} size={14} anchor="start" t0={400} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Sans titre de séjour, puis régularisé au cas par cas : une personne passe par le guichet et en ressort
 *  avec sa carte */
const intro05: Board = p => {
  const reg = cueOf(p, 0)
  const cas = word(p, /au cas par cas/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        <Picto n="personne" x={2} y={30} size={58} t0={300} />
        <Picto n="carte" x={52} y={54} size={42} tone="ghost" />
        <Arrow x1={98} y1={74} x2={122} y2={74} t0={800} />
        <Picto n="guichet" x={122} y={20} size={66} t0={900} />
        {cas ? <Txt x={155} y={116} text={cas.text} size={14} tone="soft" t0={1300} /> : null}
        {reg?.shown ? (
          <>
            <Arrow x1={188} y1={74} x2={208} y2={74} t0={0} />
            <Picto n="personne" x={206} y={30} size={58} t0={200} />
            <Picto n="carte" x={256} y={54} size={42} tone="count" t0={600} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Les éloignements depuis la métropole et depuis l'outre-mer, à la même échelle ; Mayotte, dit en dessous */
const intro06: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /depuis la métropole/)
  const lb = word(p, /depuis l’outre-mer|depuis l'outre-mer/)
  const may = word(p, /près de \d+[\s\u00a0]sur \d+ depuis Mayotte/)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: la?.text, value: va, text: a.text, shown: a.shown },
      { label: lb?.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 24,
    gap: 30,
    room: 92,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 34}>
        {g.el}
        {may?.shown ? <Txt x={6} y={g.h + 28} text={may.text} size={14} anchor="start" tone="soft" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les pictogrammes des quatre sujets, dans l'ordre des approfondissements */
const SUJETS: PictoName[] = ['carte', 'livre', 'mallette', 'valise']

/** 07 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map((q, i) => ({
          picto: SUJETS[i] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 08 Les quatre sujets des vidéos qui suivent : le sommaire de la série, avec les pictogrammes des questions */
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
            <Glyphe n={SUJETS[i] ?? 'document'} t0={p.still ? 0 : t0 + i * 450 + 150} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Titres de séjour ——— */

/** 01 « Il lui faut un titre de séjour. Pour quels motifs ? » : une personne, sa valise, la carte de séjour */
const titres01: Board = p => {
  const titre = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={140}>
        <Picto n="personne" x={6} y={50} size={76} t0={200} />
        <Picto n="valise" x={70} y={90} size={46} t0={600} />
        <Arrow x1={122} y1={96} x2={152} y2={76} dash t0={1000} />
        <Picto n="carte" x={148} y={4} size={108} t0={1100} tone={titre?.shown ? 'count' : undefined} />
        <Ask x={256} y={72} h={56} t0={1700} />
      </Art>
    </Seg>
  )
}

/** 02 Les motifs : études et motif économique, à la même échelle */
const titres02: Board = p => deuxBarres(p, /pour des études/, /pour un motif économique/)

/** 03 La régularisation, au cas par cas : des dossiers devant le guichet de la préfecture, une loupe sur l'un */
const titres03: Board = p => {
  const cue = cueOf(p, 0)
  const sans = word(p, /sans titre/)
  const pref = word(p, /par les préfectures/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        {[0, 1, 2].map(i => (
          <Picto key={i} n="document" x={4 + i * 42} y={62} size={46} t0={200 + i * 150} />
        ))}
        {sans ? <Txt x={70} y={132} text={sans.text} size={14} tone="soft" t0={700} /> : null}
        <Arrow x1={136} y1={88} x2={160} y2={88} t0={900} />
        <Picto n="guichet" x={164} y={14} size={114} t0={1000} />
        {pref?.shown ? <Txt x={221} y={146} text={pref.text} size={14} t0={0} /> : null}
        {cue?.shown ? <Picto n="loupe" x={76} y={36} size={58} tone="count" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 La loi du 26 janvier 2024 : une voie pour les métiers en tension, où des places restent vides */
const titres04: Board = p => {
  const cue = cueOf(p, 0)
  const date = word(p, /\d+[\s\u00a0]janvier \d{4}/)
  const peine = word(p, /peinent à recruter/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={132}>
        <Picto n="document" x={0} y={4} size={80} t0={200} />
        {date ? <Txt x={40} y={104} text={date.text} max={10} size={14} tone="soft" t0={600} /> : null}
        <Arrow x1={78} y1={46} x2={106} y2={46} dash t0={900} />
        <Picto n="mallette" x={108} y={8} size={76} t0={1000} tone={cue?.shown ? 'count' : undefined} />
        <Picto n="personne" x={194} y={26} size={34} t0={1400} />
        <Picto n="personne" x={228} y={26} size={34} tone="ghost" />
        <Picto n="personne" x={262} y={26} size={34} tone="ghost" />
        {peine?.shown ? <Txt x={245} y={92} text={peine.text} max={11} size={14} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Trois conditions : 12 mois de travail sur les 24 derniers, un emploi, au moins 3 ans en France */
const titres05: Board = p => {
  const [mois, ans] = cuesOf(p)
  const m = /(\d+) mois sur les (\d+)/.exec(plain(p.segment.say))
  const k = Number(m?.[1])
  const n = Number(m?.[2])
  const yrs = num(ans?.text)
  const emploi = word(p, /y occuper un emploi/)
  const res = word(p, /résider en France/)
  if (!m || !mois || !ans || !yrs || !n || !k || k > n || n > 36 || yrs > 6) return null
  const cols = Math.ceil(n / 2)
  // Des mois travaillés, pas forcément d'affilée : deux sur quatre, sur toute la période
  const worked = range(n).filter(i => i % 4 < 2).slice(0, k)
  return (
    <Seg>
      <Art h={178}>
        <Cases n={n} cols={cols} x={4} y={6} size={12} gap={3} count={mois.shown ? worked : []} t0={200} />
        <Txt x={194} y={18} text={mois.text} max={13} size={14} anchor="start" tone={mois.shown ? 'count' : undefined} t0={300} />
        {emploi?.shown ? (
          <>
            <Picto n="mallette" x={0} y={62} size={42} t0={0} />
            <Txt x={52} y={89} text={emploi.text} size={15} anchor="start" t0={200} />
          </>
        ) : null}
        {res?.shown ? (
          <>
            <Picto n="maison" x={0} y={114} size={42} t0={0} />
            {range(yrs).map(i => (
              <Picto key={i} n="calendrier" x={52 + i * 34} y={120} size={30} t0={200 + i * 150} tone={ans.shown ? 'count' : undefined} />
            ))}
            <Txt x={58 + yrs * 34} y={142} text={ans.text} size={15} anchor="start" tone={ans.shown ? 'count' : undefined} t0={400} />
            <Txt x={52} y={172} text={res.text} size={14} anchor="start" tone="soft" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 « À titre exceptionnel » : la carte en pointillé sur le guichet (le préfet n'est pas tenu de la délivrer) ;
 *  le calendrier de la fin de la voie */
const titres06: Board = p => {
  const [exc, fin] = cuesOf(p)
  const tenu = word(p, /n’est pas tenu de le délivrer|n'est pas tenu de le délivrer/)
  if (!exc) return null
  const quoted = new RegExp(`«[\\s\\u00a0]*${exc.text}[\\s\\u00a0]*»`).test(p.segment.say)
  return (
    <Seg>
      <Head lines={[{ text: quoted ? `«\u00a0${exc.text}\u00a0»` : exc.text, shown: exc.shown, mark: exc }]} />
      <Art h={150}>
        <Picto n="guichet" x={0} y={4} size={108} t0={200} />
        <Picto n="carte" x={102} y={36} size={62} tone={tenu?.shown ? 'ghost' : undefined} t0={700} />
        {tenu?.shown ? <Txt x={92} y={126} text={tenu.text} max={20} size={14} tone="soft" t0={200} /> : null}
        {fin?.shown ? (
          <>
            <Picto n="calendrier" x={198} y={4} size={86} tone="count" t0={0} />
            <Txt x={241} y={112} text={fin.text} max={12} size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 27 819 régularisations, dont 9 696 au titre du travail, à la même échelle */
const titres07: Board = p => deuxBarres(p, /régularisations/, /au titre du travail/)

/** 08 Le ministère relie la baisse à la loi de 2024 et à une circulaire de janvier 2025 : deux documents datés,
 *  deux flèches qui se rejoignent sur la baisse */
const titres08: Board = p => {
  const loi = word(p, /la loi de \d{4}/)
  const circ = word(p, /une circulaire de janvier \d{4}/)
  const baisse = word(p, /cette baisse/)
  if (!loi || !circ) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="document" x={0} y={2} size={58} t0={200} />
        <Txt x={60} y={36} text={loi.text} size={14} anchor="start" t0={500} />
        {circ.shown ? (
          <>
            <Picto n="document" x={0} y={84} size={58} t0={0} />
            <Txt x={60} y={110} text={circ.text} max={16} size={14} anchor="start" t0={300} />
          </>
        ) : null}
        <Arrow x1={170} y1={32} x2={208} y2={66} t0={900} />
        {circ.shown ? <Arrow x1={176} y1={112} x2={208} y2={86} t0={500} /> : null}
        {baisse ? (
          <>
            <Picto n="baisse" x={212} y={44} size={52} tone="count" t0={1100} w={1.2} />
            <Txt x={262} y={124} text={baisse.text} max={8} size={14} tone="count" t0={1300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 Le Conseil constitutionnel censure l'obligation faite au Parlement de fixer des objectifs chiffrés : le
 *  document pointé vers le Parlement passe en pointillé */
const titres09: Board = p => {
  const parl = word(p, /Parlement/)
  const trois = word(p, /pour trois ans/)
  const cens = word(p, /a censuré/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={140}>
        <Picto n="monument" x={2} y={6} size={104} t0={200} />
        {parl ? <Txt x={54} y={130} text={parl.text} size={14} t0={600} /> : null}
        <Picto n="document" x={186} y={4} size={92} tone={cens?.shown ? 'ghost' : undefined} t0={800} />
        {trois ? <Txt x={232} y={118} text={trois.text} size={14} tone="soft" t0={1100} /> : null}
        <Arrow x1={180} y1={52} x2={116} y2={52} dash t0={1300} tone={cens?.shown ? 'ghost' : undefined} />
      </Art>
    </Seg>
  )
}

/** 10 « Qui accueillir, et qui en fixe le cap ? » : la carte de séjour, le Parlement, la question */
const titres10: Board = p => (
  <Seg kind="ask">
    <Art h={96}>
      <Picto n="carte" x={4} y={0} size={96} t0={200} />
      <Picto n="monument" x={110} y={4} size={88} t0={600} />
      <Ask x={226} y={10} h={74} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Langue et nationalité ——— */

/** 01 « Que lui demande-t-on, et que lui propose-t-on ? » : une personne entre un document et un livre */
const langue01: Board = p => {
  const [dem, prop] = cuesOf(p)
  return (
    <Seg kind="ask">
      <Art h={110}>
        <Picto n="document" x={6} y={8} size={88} t0={200} tone={dem?.shown ? 'count' : undefined} />
        <Picto n="personne" x={108} y={14} size={84} t0={600} />
        <Picto n="livre" x={206} y={8} size={88} t0={1000} tone={prop?.shown ? 'count' : undefined} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/** 02 Le contrat d'intégration républicaine, pour un an : 4 jours de formation civique, jusqu'à 600 heures de
 *  cours de français */
const langue02: Board = p => {
  const [jours, heures] = cuesOf(p)
  const contrat = word(p, /contrat d’intégration républicaine|contrat d'intégration républicaine/)
  const an = word(p, /pour un an/)
  const jusqua = word(p, /jusqu’à \d+[\s\u00a0]heures|jusqu'à \d+[\s\u00a0]heures/)
  return (
    <Seg>
      <Head lines={[contrat ? { text: contrat.text, shown: contrat.shown } : null]} />
      <Art h={124}>
        <Picto n="document" x={0} y={0} size={86} t0={200} />
        {an?.shown ? <Txt x={43} y={106} text={an.text} size={15} t0={0} /> : null}
        <Signe n="calendrier" cx={158} y={4} size={62} label={jours?.text} shown={!!jours?.shown} t0={700} />
        <Signe n="livre" cx={250} y={4} size={62} label={jusqua?.text ?? heures?.text} shown={!!heures?.shown} t0={1100} max={11} />
      </Art>
    </Seg>
  )
}

/** 03 102 871 contrats ; pour un peu plus de la moitié, une formation au français : un disque, la part comptée */
const langue03: Board = p => {
  const pct = cueOf(p, 1)
  const part = (num(pct?.text) ?? 0) / 100
  const form = word(p, /une formation au français/)
  if (!pct || !part || part >= 1) return null
  const tip = partPoint(76, 72, 50, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={146}>
        <Disque cx={76} cy={72} r={68} part={part} shown={pct.shown} t0={300} />
        {pct.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L166 58`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={170} y={62} text={pct.text} size={20} big anchor="start" tone="count" t0={500} />
            {form ? <Txt x={170} y={86} text={form.text} max={15} size={14} anchor="start" t0={700} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le bas de l'échelle des niveaux : A1, atteint par 67,6 % des signataires formés ; A2, que les cours visent
 *  depuis juillet 2025 */
const langue04: Board = p => {
  const pct = cueOf(p, 0)
  const a1 = word(p, /A1/)
  const a2 = word(p, /A2/)
  const deb = word(p, /celui des débutants/)
  const depuis = word(p, /Depuis juillet \d{4}/)
  if (!pct || !a1 || !a2) return null
  const y1 = 126
  const y2 = 44
  return (
    <Seg>
      <Art h={150}>
        <Ink d="M51 146V16" t0={100} dur={600} class="vc-soft" />
        <Barreau y={y1} name={a1.text} tone={pct.shown ? 'count' : undefined} t0={300} />
        {pct.shown ? (
          <>
            <Txt x={72} y={y1 + 8} text={pct.text} size={22} big anchor="start" tone="count" t0={200} />
            {deb ? <Txt x={176} y={y1 - 2} text={deb.text} max={12} size={14} anchor="start" tone="soft" t0={500} /> : null}
          </>
        ) : null}
        {depuis?.shown || a2.shown ? <Barreau y={y2} name={a2.text} t0={0} /> : null}
        {depuis?.shown ? (
          <>
            <Picto n="livre" x={66} y={y2 - 24} size={48} t0={0} />
            <Arrow x1={92} y1={y1 - 22} x2={92} y2={y2 + 24} dash t0={500} />
            <Txt x={124} y={y2 + 6} text={depuis.text} size={14} anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 L'échelle complète : A2 ouvre la carte de séjour pluriannuelle, B1 la carte de résident, B2 la nationalité ;
 *  en bas, l'examen civique */
const langue05: Board = p => {
  const a1 = said(p, /A1/)
  const rows: { name: RegExp; label: RegExp; y: number }[] = [
    { name: /A2/, label: /une carte de séjour pluriannuelle/, y: 134 },
    { name: /B1/, label: /une carte de résident/, y: 88 },
    { name: /B2/, label: /être naturalisé/, y: 42 },
  ]
  const exam = word(p, /un examen civique/)
  return (
    <Seg>
      <Art h={244}>
        <Ink d="M51 190V20" t0={0} dur={600} class="vc-soft" />
        {a1 ? <Barreau y={180} name={a1} tone="soft" kept /> : null}
        {rows.map(r => {
          const n = word(p, r.name)
          const l = word(p, r.label)
          if (!n || !l) return null
          return (
            <g key={n.text}>
              <Barreau y={r.y} name={n.text} tone={n.shown ? 'count' : undefined} t0={200} />
              {n.shown ? (
                <>
                  <Picto n="carte" x={64} y={r.y - 22} size={42} tone="count" t0={0} />
                  <Txt x={112} y={r.y - 2} text={l.text} max={20} size={14} anchor="start" t0={200} />
                </>
              ) : null}
            </g>
          )
        })}
        {exam?.shown ? (
          <>
            <Ink d="M8 202H292" t0={0} dur={400} class="vc-soft vc-thin" />
            <Picto n="document" x={12} y={206} size={36} t0={200} />
            <Txt x={56} y={230} text={exam.text} size={14} anchor="start" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 42 246 acquisitions de la nationalité par décret, 13,5 % de moins, après une circulaire de mai 2025 */
const langue06: Board = p => {
  const moins = word(p, /\d+,\d+[\s\u00a0]% de moins/)
  const circ = word(p, /une circulaire de mai \d{4}/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={110}>
        <Picto n="carte" x={0} y={-10} size={112} t0={300} />
        {moins?.shown ? (
          <>
            <Picto n="baisse" x={118} y={6} size={40} tone="count" w={1.2} />
            <Txt x={162} y={26} text={moins.text} max={10} size={15} anchor="start" tone="count" t0={200} />
          </>
        ) : null}
        {circ?.shown ? (
          <>
            <Picto n="document" x={118} y={60} size={44} t0={0} />
            <Txt x={164} y={80} text={circ.text} max={16} size={14} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Ce qu'on exige, ce qu'on garantit : la balance du débat » : un document d'examen, un livre de cours */
const langue07: Board = p => {
  const ex = word(p, /Ce qu’on exige|Ce qu'on exige/)
  const ga = word(p, /ce qu’on leur garantit|ce qu'on leur garantit/)
  const b = balance({ left: ['document'], right: ['livre'], labels: [ex?.text ?? null, ga?.text ?? null], shown: [!!ex?.shown, !!ga?.shown], t0: 200 })
  return (
    <Seg>
      <Head lines={[lineOf(cueOf(p, 2))]} />
      <Art h={b.h}>{b.el}</Art>
    </Seg>
  )
}

/** 08 « Quel niveau demander, et quel accompagnement garantir ? » : l'échelle esquissée, un livre, la question */
const langue08: Board = p => (
  <Seg kind="ask">
    <Art h={104}>
      <Ink d="M30 100V6" t0={0} dur={500} class="vc-soft" />
      <Ink d="M22 86h16M22 62h16M22 38h16M22 14h16" t0={300} dur={400} class="vc-soft" />
      <Picto n="livre" x={70} y={24} size={74} t0={600} />
      <Picto n="document" x={152} y={20} size={70} t0={900} />
      <Ask x={240} y={14} h={72} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Emploi et droits ——— */

/** 01 L'emploi, l'accès aux droits : une mallette, un guichet, chacun nommé quand la voix le dit */
const emploi01: Board = p => {
  const [e, d] = cuesOf(p)
  return (
    <Seg kind="ask">
      <Art h={132}>
        <Signe n="mallette" cx={78} y={0} size={84} label={e?.text} shown={!!e?.shown} t0={200} />
        <Signe n="guichet" cx={222} y={0} size={84} label={d?.text} shown={!!d?.shown} t0={700} max={12} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/** 02 Taux d'emploi des immigrés et des non-immigrés, à la même échelle */
const emploi02: Board = p => deuxBarres(p, /des immigrés/, /des non-immigrés/, { libelle: true })

/** Une candidature au trait : la ligne du nom (sa forme dit qu'il diffère), puis des lignes identiques */
function Cv({ x, name, t0, mark }: { x: number; name: string; t0: number; mark: boolean }) {
  const lines = [56, 70, 84, 98, 112, 126].map((y, i) => `M${x + 12} ${y}H${x + (i % 3 === 2 ? 58 : 82)}`).join('')
  return (
    <>
      <Ink d={`M${x} 8H${x + 96}V140H${x}Z`} t0={t0} dur={700} />
      {mark ? (
        <Fade t0={0} class="vc-count">
          <rect class="vc-tint-count" x={x + 6} y={14} width={84} height={24} />
        </Fade>
      ) : null}
      <Ink d={name} t0={t0 + 500} dur={400} class={mark ? 'vc-count' : undefined} />
      <Ink d={lines} t0={t0 + 700} dur={600} class="vc-thin vc-soft" />
    </>
  )
}

/** 03 Le testing : deux candidatures identiques sauf le nom ; 9 600 candidatures, en piles */
const emploi03: Board = p => {
  const [sauf, nb] = cuesOf(p)
  const mark = !!sauf?.shown
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={176}>
        {nb?.shown ? (
          <Fade t0={0} class="vc-ghost">
            <path d="M36 2H130V134M180 2H274V134" />
          </Fade>
        ) : null}
        <Cv x={28} name="M40 26q5-9 10 0t10 0t10 0t10 0" t0={200} mark={mark} />
        <Cv x={172} name="M184 30l7-9 7 9 7-9 7 9 7-9 7 9" t0={600} mark={mark} />
        <Ink d="M142 82h12M142 90h12" t0={1500} dur={300} class="vc-soft" />
        {nb?.shown ? <Txt x={W / 2} y={168} text={nb.text} size={16} tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Le résultat du testing : les deux taux de rappel, à la même échelle */
const emploi04: Board = p =>
  deuxBarres(p, /au nom d’origine supposée maghrébine|au nom d'origine supposée maghrébine/, /sans origine migratoire supposée/, { libelle: true, labelSize: 14 })

/** 05 Certaines aides exigent une durée de séjour : le guichet du RSA, un sablier */
const emploi05: Board = p => {
  const [duree, rsa] = cuesOf(p)
  const nom = word(p, /le revenu de solidarité active/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={140}>
        <Picto n="guichet" x={20} y={0} size={100} t0={200} text={rsa?.shown ? rsa.text : undefined} />
        {nom?.shown ? <Txt x={70} y={118} text={nom.text} max={20} size={14} tone="soft" t0={200} /> : null}
        <Picto n="sablier" x={180} y={10} size={90} t0={800} tone={duree?.shown ? 'count' : undefined} />
      </Art>
    </Seg>
  )
}

/** 06 Au moins 5 ans de titre de séjour avant le RSA : une ligne des années, de la carte au repère ; un chemin en
 *  pointillé la contourne pour les exceptions */
const emploi06: Board = p => {
  const [ans, ref] = cuesOf(p)
  const n = num(ans?.text)
  const sauf = word(p, /les réfugiés ou les titulaires d’une carte de résident|les réfugiés ou les titulaires d'une carte de résident/)
  if (!ans || !n || n > 10) return null
  const y = 92
  const f = frise({ y, from: 0, to: n, x0: 52, x1: 266, ticks: range(n + 1), t0: 200 })
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={186}>
        <Picto n="carte" x={0} y={y - 46} size={56} t0={100} />
        {f.el}
        {ans.shown ? <Picto n="drapeau" x={f.X(n) - 9} y={y - 44} size={44} tone="count" t0={0} /> : null}
        {ref?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={`M52 ${y + 12}C96 ${y + 62} 222 ${y + 62} 266 ${y + 12}M266 ${y + 12}l-2.5 9.5M266 ${y + 12}l-9 3.6`} />
            </Fade>
            <Txt x={159} y={y + 74} text={sauf?.text ?? ref.text} max={30} size={14} tone="soft" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Le Conseil constitutionnel admet une durée de résidence pour certaines prestations, mais pas 5 ans pour les
 *  allocations familiales ou les aides au logement : un sablier admis, un sablier en pointillé */
const emploi07: Board = p => {
  const [cert, disp] = cuesOf(p)
  const cinq = word(p, /\d+[\s\u00a0]ans/)
  const alloc = word(p, /les allocations familiales ou les aides au logement/)
  return (
    <Seg>
      <Art h={172}>
        <Picto n="monument" x={0} y={34} size={92} t0={200} />
        {cert?.shown ? (
          <>
            <Picto n="sablier" x={104} y={4} size={46} tone="count" t0={0} />
            <Txt x={156} y={24} text={cert.text} max={16} size={15} anchor="start" t0={200} />
          </>
        ) : null}
        {disp?.shown ? (
          <>
            <Picto n="sablier" x={104} y={78} size={46} tone="ghost" />
            {cinq ? <Txt x={127} y={144} text={cinq.text} size={16} big tone="soft" t0={100} /> : null}
            {alloc ? <Txt x={156} y={92} text={alloc.text} max={18} size={14} anchor="start" t0={200} /> : null}
            <Txt x={156} y={162} text={disp.text} size={15} anchor="start" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 « Comment favoriser l'emploi, et quels droits ouvrir, après combien de temps ? » */
const emploi08: Board = p => (
  <Seg kind="ask">
    <Art h={96}>
      <Picto n="mallette" x={4} y={12} size={74} t0={200} />
      <Picto n="guichet" x={84} y={4} size={84} t0={500} />
      <Picto n="sablier" x={176} y={18} size={60} t0={800} />
      <Ask x={246} y={12} h={70} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Expulsions ——— */

/** 01 Une OQTF, une obligation de quitter le territoire : l'enveloppe qui la notifie, la personne, la valise */
const exp01: Board = p => {
  const [oqtf, part] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={130}>
        <Picto n="enveloppe" x={0} y={0} size={104} t0={200} text={oqtf?.text} tone={oqtf?.shown ? 'count' : undefined} />
        <Arrow x1={98} y1={52} x2={122} y2={52} t0={900} />
        <Picto n="personne" x={122} y={36} size={80} t0={1000} />
        <Picto n="valise" x={196} y={72} size={54} t0={1400} tone={part?.shown ? undefined : 'ghost'} />
        {part?.shown ? <Ask x={256} y={30} h={60} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Environ une OQTF sur dix exécutée : dix enveloppes, une comptée */
const exp02: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const { h } = rangCells({ n: r.n, max: 28, gap: 2 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 30}>
        <Rang n={r.n} picto="enveloppe" max={28} gap={2} y={2} count={range(r.k)} shown={cue.shown} t0={300} stagger={70} />
        {cue.shown ? <Txt x={W / 2} y={h + 26} text={cue.text} size={15} tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 La loi impose une OQTF à chaque séjour irrégulier constaté, même sans perspective de départ : quatre
 *  personnes, chacune son enveloppe ; les valises en pointillé */
const exp03: Board = p => {
  const cue = cueOf(p, 0)
  const sans = word(p, /même sans perspective réelle de départ/)
  const xs = [34, 104, 174, 244]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Ink d="M8 112H292" t0={100} dur={600} class="vc-soft" />
        {xs.map((cx, i) => (
          <g key={cx}>
            <Picto n="personne" x={cx - 26} y={64} size={50} t0={200 + i * 150} />
            {cue?.shown ? <Picto n="enveloppe" x={cx - 2} y={30} size={34} tone="count" t0={i * 200} /> : null}
            {sans?.shown ? <Picto n="valise" x={cx + 20} y={84} size={28} tone="ghost" /> : null}
          </g>
        ))}
        {sans?.shown ? <Txt x={W / 2} y={138} text={sans.text} size={14} tone="soft" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Trois autres facteurs, une ligne chacun : des OQTF annulées par le juge, plusieurs pour une même personne,
 *  des départs spontanés non comptés */
const exp04: Board = p => {
  const juge = word(p, /le juge en annule/)
  const pct = word(p, /\d+[\s\u00a0]% en première instance/)
  const meme = word(p, /Une même personne peut en recevoir plusieurs/)
  const spont = word(p, /[Cc]ertains départs spontanés ne sont pas comptés/)
  const row = 66
  return (
    <Seg>
      <Art h={3 * row - 4}>
        {juge?.shown ? (
          <>
            <Picto n="enveloppe" x={0} y={2} size={50} tone="ghost" />
            <Txt x={64} y={22} text={juge.text} max={28} size={15} anchor="start" t0={0} />
            {pct ? <Txt x={64} y={42} text={pct.text} max={28} size={15} anchor="start" tone="count" t0={300} /> : null}
          </>
        ) : null}
        {meme?.shown ? (
          <>
            <Picto n="personne" x={0} y={row + 8} size={38} t0={0} />
            {[0, 1, 2].map(k => (
              <Picto key={k} n="enveloppe" x={36} y={row - 4 + k * 14} size={24} tone="count" t0={200 + k * 150} w={0.8} />
            ))}
            <Txt x={70} y={row + 22} text={meme.text} max={28} size={15} anchor="start" t0={300} />
          </>
        ) : null}
        {spont?.shown ? (
          <>
            <Picto n="valise" x={2} y={2 * row + 2} size={50} tone="ghost" />
            <Txt x={64} y={2 * row + 24} text={spont.text} max={28} size={15} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 137 550 ordres de quitter le territoire en France, 55 240 en Allemagne (libellé de la fiche), à la même
 *  échelle ; dessous, les OQTF exécutées en 2024 (autre source, autre année) : les deux pays à égalité */
const exp05: Board = p => {
  const [n1, ega] = cuesOf(p)
  const v1 = num(n1?.text)
  const de = /Allemagne avec ([\d\u202f\u00a0]+\d)/.exec(p.segment.figure?.label ?? '')
  const v2 = num(de?.[1])
  const fr = word(p, /France/)
  const al = said(p, /Allemagne/)
  const aussi = word(p, /[Pp]our les OQTF exécutées en \d{4}/)
  if (!n1 || !v1 || !de || !v2) return null
  const g = barres({
    items: [
      { label: fr?.text, value: v1, text: n1.text, shown: n1.shown },
      { label: al ?? undefined, value: v2, text: de[1], shown: n1.shown },
    ],
    y: 4,
    size: 22,
    gap: 28,
    room: 96,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 52}>
        {g.el}
        {ega?.shown ? (
          <>
            {aussi ? <Txt x={6} y={g.h + 26} text={aussi.text} size={14} anchor="start" tone="soft" t0={0} /> : null}
            <Txt x={6} y={g.h + 46} text={ega.text} size={15} anchor="start" tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 La rétention vise en priorité l'ordre public ; 90 % des personnes retenues connues pour troubles ou
 *  radicalisation, selon le ministère : un bâtiment, un disque compté, et l'attribution écrite sous le chiffre */
const exp06: Board = p => {
  const pct = cueOf(p, 1)
  const part = (num(pct?.text) ?? 0) / 100
  const ret = word(p, /la rétention/)
  const qui = word(p, /des personnes retenues/)
  const selon = word(p, /Selon le ministère de l’Intérieur|Selon le ministère de l'Intérieur/)
  if (!pct || !part || part >= 1) return null
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={208}>
        <Picto n="immeuble" x={6} y={0} size={110} t0={200} />
        {ret ? <Txt x={61} y={136} text={ret.text} max={14} size={14} tone="soft" t0={600} /> : null}
        <Disque cx={214} cy={62} r={58} part={part} shown={pct.shown} t0={700} />
        {pct.shown ? (
          <>
            <Txt x={214} y={148} text={pct.text} size={22} big tone="count" t0={200} />
            {qui ? <Txt x={214} y={168} text={qui.text} size={14} t0={400} /> : null}
            {selon ? <Txt x={214} y={188} text={selon.text} max={20} size={14} tone="soft" t0={600} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Les 26 centres de rétention, environ 2 000 places ; pour les personnes retenues, 40 % des OQTF exécutées :
 *  dix enveloppes, quatre comptées */
const exp07: Board = p => {
  const pct = cueOf(p, 1)
  const m = /Les (\d+) centres/.exec(plain(p.segment.say))
  const n = Number(m?.[1])
  const centres = word(p, /Les \d+ centres de rétention/)
  const exec = word(p, /\d+[\s\u00a0]% des OQTF sont exécutées/)
  const v = num(pct?.text)
  if (!m || !n || n > 40 || !pct || !v || v % 10) return null
  const cols = Math.ceil(n / 2)
  const top = rangCells({ n, cols, max: 22, gap: 2 })
  const y2 = top.h + 32
  const low = rangCells({ n: 10, max: 26, gap: 2, y: y2 })
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={y2 + low.h + 30}>
        <Rang n={n} picto="immeuble" cols={cols} max={22} gap={2} y={0} t0={200} stagger={40} />
        {centres ? <Txt x={W / 2} y={top.h + 20} text={centres.text} size={14} tone="soft" t0={900} /> : null}
        <Rang n={10} picto="enveloppe" max={26} gap={2} y={y2} count={range(v / 10)} shown={pct.shown} t0={1200} stagger={60} />
        {exec?.shown ? <Txt x={W / 2} y={y2 + low.h + 24} text={exec.text} size={15} tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 08 Le laissez-passer consulaire : un guichet de consulat ; dix laissez-passer, trois délivrés à temps */
const exp08: Board = p => {
  const lp = cueOf(p, 0)
  const pct = cueOf(p, 1)
  const v = num(pct?.text)
  const temps = word(p, /délivrés à temps/)
  if (!pct || !v || v % 10) return null
  const cells = rangCells({ n: 10, cols: 5, x: 100, w: 200, max: 32, gap: 6, y: 4 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={Math.max(cells.h + 34, 128)}>
        <Picto n="guichet" x={0} y={4} size={86} t0={200} />
        {lp ? <Txt x={43} y={106} text={lp.text} max={14} size={14} tone="soft" t0={600} /> : null}
        <Rang n={10} picto="document" cols={5} x={100} w={200} max={32} gap={6} y={4} count={range(v / 10)} shown={pct.shown} t0={700} stagger={70} />
        {temps?.shown ? <Txt x={200} y={cells.h + 30} text={temps.text} size={15} tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 L'obstacle principal, des deux côtés : une personne qui ne coopère pas (sa carte d'identité en pointillé) ;
 *  un consulat qui tarde (un sablier) */
const exp09: Board = p => {
  const a = word(p, /Certaines personnes refusent de coopérer/)
  const b = word(p, /Certains consulats tardent, ou refusent/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={168}>
        <Ink d="M150 4V160" t0={0} dur={500} class="vc-soft vc-thin" />
        {a?.shown ? (
          <>
            <Picto n="personne" x={14} y={4} size={70} t0={0} />
            <Picto n="carte" x={78} y={34} size={52} tone="ghost" />
            <Txt x={75} y={104} text={a.text} max={16} size={14} t0={300} />
          </>
        ) : null}
        {b?.shown ? (
          <>
            <Picto n="guichet" x={160} y={0} size={80} t0={0} />
            <Picto n="sablier" x={244} y={24} size={48} tone="count" t0={400} />
            <Txt x={225} y={104} text={b.text} max={16} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 10 « Qui éloigner, combien, et comment obtenir la coopération des pays d'origine ? » */
const exp10: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Picto n="enveloppe" x={0} y={6} size={88} t0={200} />
      <Picto n="guichet" x={96} y={4} size={88} t0={600} />
      <Arrow x1={190} y1={50} x2={226} y2={50} dash t0={1000} />
      <Ask x={236} y={12} h={72} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const IMMIGRATION: Record<string, Board> = {
  'immigration-intro-01': intro01,
  'immigration-intro-02': intro02,
  'immigration-intro-03': intro03,
  'immigration-intro-04': intro04,
  'immigration-intro-05': intro05,
  'immigration-intro-06': intro06,
  'immigration-intro-07': intro07,
  'immigration-intro-08': intro08,
  'immigration-titres-01': titres01,
  'immigration-titres-02': titres02,
  'immigration-titres-03': titres03,
  'immigration-titres-04': titres04,
  'immigration-titres-05': titres05,
  'immigration-titres-06': titres06,
  'immigration-titres-07': titres07,
  'immigration-titres-08': titres08,
  'immigration-titres-09': titres09,
  'immigration-titres-10': titres10,
  'immigration-langue-01': langue01,
  'immigration-langue-02': langue02,
  'immigration-langue-03': langue03,
  'immigration-langue-04': langue04,
  'immigration-langue-05': langue05,
  'immigration-langue-06': langue06,
  'immigration-langue-07': langue07,
  'immigration-langue-08': langue08,
  'immigration-emploi-01': emploi01,
  'immigration-emploi-02': emploi02,
  'immigration-emploi-03': emploi03,
  'immigration-emploi-04': emploi04,
  'immigration-emploi-05': emploi05,
  'immigration-emploi-06': emploi06,
  'immigration-emploi-07': emploi07,
  'immigration-emploi-08': emploi08,
  'immigration-expulsions-01': exp01,
  'immigration-expulsions-02': exp02,
  'immigration-expulsions-03': exp03,
  'immigration-expulsions-04': exp04,
  'immigration-expulsions-05': exp05,
  'immigration-expulsions-06': exp06,
  'immigration-expulsions-07': exp07,
  'immigration-expulsions-08': exp08,
  'immigration-expulsions-09': exp09,
  'immigration-expulsions-10': exp10,
}
