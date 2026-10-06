// Petit graphique d'un chiffre clé : une part d'un tout, des grandeurs comparées à la même échelle, ou une
// évolution dans le temps. Il ne montre que des nombres déjà écrits dans la valeur ou le libellé du chiffre,
// et les écrit comme la source : « −1,0 % » garde son zéro, « +2,0 % » son signe.
// L'encre bleu bille porte les données, la piste est grise, les étiquettes sont du vrai texte. Pour les
// lecteurs d'écran, le graphique est une image (role="img") que son aria-label dit en mots. Aucune animation.

import type { FigureChart as Chart } from '../../core/types'
import '../../styles/topics.css'

const formats = new Map<number, Intl.NumberFormat>()
/** Formateur français ; « digits » fixe le nombre de décimales */
function numberFormat(digits?: number) {
  const key = digits ?? -1
  let f = formats.get(key)
  if (!f) {
    f = new Intl.NumberFormat('fr-FR', digits === undefined ? { maximumFractionDigits: 6 } : { minimumFractionDigits: digits, maximumFractionDigits: digits })
    formats.set(key, f)
  }
  return f
}

/** Nombre de décimales d'une valeur telle qu'écrite dans les données (1.0 s'écrit 1 : le texte le rétablit) */
const decimalsOf = (n: number) => (String(n).split('.')[1] ?? '').length
const NBSP = '\u00a0'
/** Part de la largeur sous laquelle une valeur non nulle garde quand même un trait visible */
const MIN_INK = 0.006

/** « 27,99 », « 3 240 600 », « −1,3 » : virgule décimale, espaces fines, vrai signe moins */
export function formatNumber(n: number, signed = false, digits?: number): string {
  const s = numberFormat(digits).format(n).replace(/^-/, '−')
  return signed && n > 0 ? `+${s}` : s
}

/** Espaces de toutes sortes ramenées à une seule, pour retrouver un nombre dans le texte de la source */
const spaces = (s: string) => s.replace(/[\s\u00a0\u202f]+/g, ' ')

/** Un nombre tel que la source l'écrit : son nombre de décimales, et s'il porte un « + » */
interface Written {
  digits?: number
  plus: boolean
}

/**
 * Retrouve un nombre dans le texte du chiffre, entier : ni collé à un autre chiffre, ni suivi d'une décimale
 * ou d'un groupe de plus. « 771,0 Md€ » garde sa décimale, « +2,0 % » son signe.
 */
function written(text: string | undefined, n: number): Written {
  if (!text) return { plus: false }
  const base = decimalsOf(n)
  for (let d = base; d <= base + 2; d++) {
    const s = spaces(formatNumber(Math.abs(n), false, d))
    const m = new RegExp(`(\\+ ?)?(?<![\\d,])(?<!\\d )${s}(?!\\d|,\\d| \\d{3}(?!\\d))`).exec(text)
    if (m) return { digits: d, plus: !!m[1] }
  }
  return { plus: false }
}

const withUnit = (n: number, unit: string | undefined, signed = false, digits?: number) =>
  unit ? `${formatNumber(n, signed, digits)}${NBSP}${unit}` : formatNumber(n, signed, digits)

/**
 * L'unité suit chaque nombre quand elle est courte (« % », « Md€ », « députés ») ; sinon, quand elle a
 * plusieurs mots (« % du PIB ») ou qu'un nom au pluriel suivrait une valeur inférieure à 2 (« 1 lots »),
 * elle est dite une fois sous le graphique.
 */
function inlineUnit(unit: string | undefined, values: number[]) {
  if (!unit) return false
  const short = unit.length <= 6 || (unit.length <= 8 && !/\s/.test(unit))
  const plural = /^\p{L}+s$/u.test(unit) && values.some(v => Math.abs(v) < 2)
  return short && !plural
}

/** Unité dite une fois */
function UnitNote({ unit }: { unit?: string }) {
  return unit ? <span class="fchart-unit">{`Unité\u00a0: ${unit}`}</span> : null
}

/** Ce que lit un lecteur d'écran : l'unité après chaque nombre, ou une fois en tête (« en % du PIB ») */
function describe(kind: string, items: { label: string; text: string }[], unit: string | undefined, inline: boolean) {
  const head = unit && !inline ? `${kind}, en ${unit}` : kind
  return `${head}\u00a0: ${items.map(i => `${i.label}, ${i.text}`).join('\u00a0; ')}.`
}

const pct = (x: number) => `${Math.round(x * 10000) / 100}%`

/** Domaine commun d'une suite de valeurs, zéro compris : les barres partent toujours de zéro */
function domain(values: number[]) {
  const lo = Math.min(0, ...values)
  const hi = Math.max(0, ...values)
  return { lo, hi, span: hi - lo || 1 }
}

interface Props<K extends Chart['kind']> {
  chart: Extract<Chart, { kind: K }>
  /** Valeur et libellé du chiffre, espaces ramenées à une seule */
  text?: string
}

/**
 * Part d'un tout. La valeur en gros du chiffre dit d'ordinaire la part (« 54,0 % », « 126 sur 179 ») ;
 * quand elle dit autre chose (un montant, un effectif), la part s'écrit aussi sous la barre, sinon on
 * lirait « 3,9 millions sur 100 % ».
 */
function Part({ chart, text, value }: Props<'part'> & { value?: string }) {
  const share = chart.value > 0 ? Math.min(1, Math.max(MIN_INK, chart.value / chart.total)) : 0
  const whole = chart.whole ? ` ${chart.whole}` : ''
  const total = withUnit(chart.total, chart.unit, false, written(text, chart.total).digits)
  const bar = withUnit(chart.value, chart.unit, false, written(text, chart.value).digits)
  const said = value !== undefined && written(value, chart.value).digits !== undefined
  // Un pourcentage écrit se passe de « sur 100 % » : « 12,7 % des résidences principales »
  const percent = chart.unit === '%' && chart.total === 100
  const label = `Barre\u00a0: ${bar} sur ${total}${whole}.`
  return (
    <div class="fchart fchart-part" role="img" aria-label={label}>
      <svg class="fchart-bar" aria-hidden="true" focusable="false">
        <rect class="fchart-rail" width="100%" height="100%" />
        <rect class="fchart-ink" width={pct(share)} height="100%" />
      </svg>
      {said ? (
        // La valeur est déjà écrite en gros : on ne dit que le tout (« des salariés… »), sans « sur 100 % »
        <span class="fchart-whole">{percent ? whole.trim() : `sur ${total}${whole}`}</span>
      ) : (
        <span class="fchart-whole">
          <strong class="fchart-part-value">{bar}</strong>
          {percent ? whole : ` sur ${total}${whole}`}
        </span>
      )}
    </div>
  )
}

/** Les éléments d'une comparaison ou d'une série, chacun avec l'écriture de la source */
function readItems(chart: Extract<Chart, { items: unknown }>, text: string | undefined) {
  const items = chart.items.map(i => ({ ...i, ...written(text, i.value) }))
  // Des valeurs négatives, ou un « + » écrit dans la source : toutes les valeurs positives portent leur signe
  const signed = items.some(i => i.value < 0 || i.plus)
  return { items, signed }
}

type Item = { label: string; value: number; digits?: number }

/** Barres horizontales sur une échelle commune qui part de zéro : le nom et le nombre, la barre dessous */
function Rows({ items, print }: { items: Item[]; print: (i: Item) => string }) {
  const { lo, span } = domain(items.map(i => i.value))
  const zero = -lo / span
  // Ligne de zéro quand une barre part vers la gauche, ou qu'une valeur nulle n'aurait sinon aucun trait
  const zeroLine = lo < 0 || items.some(i => i.value === 0)
  return (
    <>
      {items.map(i => {
        const w = i.value === 0 ? 0 : Math.max(Math.abs(i.value) / span, MIN_INK)
        const x = i.value < 0 ? zero - w : zero
        return (
          <div key={i.label} class="fchart-row">
            <span class="fchart-label">{i.label}</span>
            <span class="fchart-num">{print(i)}</span>
            <svg class="fchart-bar" aria-hidden="true" focusable="false">
              <rect class="fchart-ink" x={pct(x)} width={pct(w)} height="100%" />
              {zeroLine ? <line class="fchart-zero" x1={pct(zero)} x2={pct(zero)} y1="-15%" y2="115%" /> : null}
            </svg>
          </div>
        )
      })}
    </>
  )
}

function Compare({ chart, text }: Props<'compare'>) {
  const { items, signed } = readItems(chart, text)
  const inline = inlineUnit(chart.unit, items.map(i => i.value))
  const print = (i: Item) => withUnit(i.value, inline ? chart.unit : undefined, signed, i.digits)
  const label = describe('Barres comparées à la même échelle', items.map(i => ({ label: i.label, text: print(i) })), chart.unit, inline)
  return (
    <div class="fchart fchart-compare" role="img" aria-label={label}>
      <Rows items={items} print={print} />
      {inline ? null : <UnitNote unit={chart.unit} />}
    </div>
  )
}

/** Au-delà de ce nombre de signes pour toute la ligne des valeurs, l'unité ne suit plus chaque nombre */
const SERIES_BUDGET = 28
/** Largeurs (en em du graphique) sous lesquelles une série passe des colonnes aux barres couchées */
const SERIES_FITS = [12, 15, 18, 21, 24]

/**
 * Largeur qu'il faut aux colonnes pour que ni une valeur ni un mot d'une date ne se coupe, en em :
 * environ 0,6 em par signe en gras, 0,55 em par signe en maigre, plus l'écart entre couloirs.
 */
function seriesFit(values: string[], ticks: string[]) {
  const word = Math.max(...ticks.flatMap(t => t.split(/\s+/)).map(w => w.length))
  const value = Math.max(...values.map(v => v.length))
  const need = values.length * (Math.max(value * 0.6, word * 0.55) + 0.5)
  return SERIES_FITS.find(f => need <= f) ?? SERIES_FITS[SERIES_FITS.length - 1]
}

function Series({ chart, text }: Props<'series'>) {
  const { hi, span } = domain(chart.items.map(i => i.value))
  const n = chart.items.length
  const zero = hi / span
  const read = readItems(chart, text)
  const { signed } = read
  // Sans écriture lisible dans la source, une série garde la même précision d'un point à l'autre
  const aligned = Math.min(6, Math.max(...chart.items.map(i => decimalsOf(i.value))))
  const items = read.items.map(i => ({ ...i, digits: i.digits ?? aligned }))
  // L'unité suit chaque valeur si la ligne des valeurs tient dans le graphique
  const widest = Math.max(...items.map(i => withUnit(i.value, chart.unit, signed, i.digits).length))
  const inline = inlineUnit(chart.unit, items.map(i => i.value)) && widest * n <= SERIES_BUDGET
  const print = (i: Item) => withUnit(i.value, inline ? chart.unit : undefined, signed, i.digits)
  const label = describe('Évolution, en colonnes', items.map(i => ({ label: i.label, text: print(i) })), chart.unit, inline)
  // Trop étroit pour les colonnes (téléphone, texte agrandi) : les mêmes valeurs en barres couchées
  const fit = seriesFit(items.map(print), items.map(i => i.label))
  return (
    <div class={`fchart fchart-series fit-${fit}`} role="img" aria-label={label} style={`--n: ${n}`}>
      <div class="fchart-columns">
        <div class="fchart-lanes fchart-values">
          {items.map(i => (
            <span key={i.label}>{print(i)}</span>
          ))}
        </div>
        <svg class="fchart-cols" aria-hidden="true" focusable="false">
          {items.map((i, k) => {
            const h = i.value === 0 ? 0 : Math.max(Math.abs(i.value) / span, 0.02)
            const y = i.value < 0 ? zero : zero - h
            // Une colonne par couloir, centrée : un repère sans largeur, que la colonne déborde
            return (
              <svg key={i.label} x={pct((k + 0.5) / n)} width="1" height="100%" overflow="visible">
                <rect class="fchart-ink" x="-0.8em" width="1.6em" y={pct(y)} height={pct(h)} />
              </svg>
            )
          })}
          <line class="fchart-axis" x1="0" x2="100%" y1={pct(zero)} y2={pct(zero)} />
        </svg>
        <div class="fchart-lanes fchart-ticks">
          {items.map(i => (
            <span key={i.label}>{i.label}</span>
          ))}
        </div>
      </div>
      <div class="fchart-rows">
        <Rows items={items} print={print} />
      </div>
      {inline ? null : <UnitNote unit={chart.unit} />}
    </div>
  )
}

/**
 * « text » : la valeur et le libellé du chiffre, pour écrire chaque nombre comme la source ; « value » : la
 * valeur seule, pour savoir si elle dit déjà la part d'un tout
 */
export function FigureChart({ chart, text, value }: { chart: Chart; text?: string; value?: string }) {
  const t = text ? spaces(text) : undefined
  switch (chart.kind) {
    case 'part':
      return <Part chart={chart} text={t} value={value === undefined ? undefined : spaces(value)} />
    case 'compare':
      return <Compare chart={chart} text={t} />
    case 'series':
      return <Series chart={chart} text={t} />
    default:
      return null
  }
}
