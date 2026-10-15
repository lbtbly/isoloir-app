// Mise en forme française des dates et des nombres.

const DAY = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'Europe/Paris' })
const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
const FULL = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

// Décision du propriétaire du 2026-10-15 : les dates écrites ici le sont sans coupure (espaces insécables entre le
// jour, le mois et l'année) et avec « 1er » pour le premier du mois, comme déjà le pied de page et le gel des jours de
// vote (SiteFooter, core/freeze) : la même règle partout, jusque dans le PDF, qui mêle formatDate et formatMoment.

/** Le jour et le mois (et l'année) d'Intl, sans coupure, « 1er » pour le premier du mois */
const noBreak = (s: string): string => s.replace(/^1 /, '1er ').replace(/ /g, '\u00a0')

/** « 9 et 10 octobre », « 1er et 2 mai » */
export function formatDayRange(startIso: string, endIso: string): string {
  const s = new Date(startIso)
  const e = new Date(endIso)
  return `${DAY.format(s).replace(/^1$/, '1er')} et ${noBreak(DAY_MONTH.format(e))}`
}

/** « 2 octobre 2026 » depuis AAAA-MM-JJ, « 1er octobre 2026 » pour le premier du mois, « octobre 2026 » depuis AAAA-MM */
export function formatDate(day: string | undefined): string {
  if (!day) return ''
  const d = new Date(`${day.length === 7 ? `${day}-01` : day}T12:00:00+02:00`)
  if (Number.isNaN(d.getTime())) return day
  return noBreak(day.length === 7 ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d) : FULL.format(d))
}

// Dates de source : AAAA-MM-JJ ou AAAA-MM le plus souvent, mais aussi du texte libre (« fin juin 2026 »,
// « 2026-10-15 (consultation) », « © 2026, consulté le 2026-10-06 »…), affiché tel quel. Décision du propriétaire
// du 2026-10-15 : les dates ISO qu'il contient s'affichent en toutes lettres, sans toucher aux données. Le mois
// et le jour sont bornés (01-12, 01-31) et la date isolée de tout chiffre ou trait d'union voisin, pour ne pas
// prendre une période (« 2019-2020 ») ni un numéro de version pour une date.
const PURE_ISO = /^\d{4}-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?$/
const CONSULTED = /^(\d{4}-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)\s*\((?:consultation|consultée?)\)$/
const LEADING_MONTH = /^(\d{4}-(?:0[1-9]|1[0-2]))(?=\s*\()/
const CONSULTED_BARE = /\b(consultée?) (?=\d{4}-\d{2}-\d{2})/g
const DAY_IN_TEXT = /(^|[^\d-])(\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))(?![\d-])/g
// Un mois seul dans le texte (« 2021-10 / 2022-02 »), après les jours ; pas après « n° » (« loi n° 2021-11 »)
const MONTH_IN_TEXT = /(^|[^\d-])(\d{4}-(?:0[1-9]|1[0-2]))(?![\d-])/g

/**
 * La date d'une source, pour l'affichage : « 2 octobre 2026 » depuis AAAA-MM-JJ, « consulté le 15 octobre 2026 »
 * depuis « 2026-10-15 (consultation) », et les dates ISO d'un texte libre en toutes lettres (« © 2026, consulté
 * le 6 octobre 2026 », « décembre 2025 (présenté le 7 janvier 2026) ») ; le reste du texte est gardé tel quel.
 */
export function formatSourceDate(raw: string | undefined): string {
  const s = raw?.trim()
  if (!s) return ''
  if (PURE_ISO.test(s)) return formatDate(s)
  const consulted = CONSULTED.exec(s)
  if (consulted) return `consulté ${consulted[1]!.length === 7 ? 'en' : 'le'} ${formatDate(consulted[1])}`
  return s
    .replace(LEADING_MONTH, m => formatDate(m))
    .replace(CONSULTED_BARE, '$1 le ')
    .replace(DAY_IN_TEXT, (_, before: string, day: string) => `${before}${formatDate(day)}`)
    .replace(MONTH_IN_TEXT, (m: string, before: string, month: string, at: number, all: string) =>
      /n°\s*$/.test(all.slice(0, at + before.length)) ? m : `${before}${formatDate(month)}`,
    )
}

export function percent(score: number | null): string {
  return score === null ? '–' : `${Math.round(score)}`
}

/** Une part, après « moins de » : 0,5 → « la moitié », sinon en pourcentage (0,4 → « 40 % ») */
export function shareText(share: number): string {
  return Math.abs(share - 0.5) < 1e-9 ? 'la moitié' : `${Math.round(share * 100)}\u00a0%`
}

/** Nom de domaine lisible d'une URL de source */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** « 3 octobre 2026 à 14 h 05 », à l'heure de l'appareil (un moment vécu par l'utilisateur) */
export function formatMoment(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  return `${noBreak(day)} à ${d.getHours()}\u00a0h\u00a0${String(d.getMinutes()).padStart(2, '0')}`
}
