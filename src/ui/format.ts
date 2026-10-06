// Mise en forme française des dates et des nombres.

const DAY = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'Europe/Paris' })
const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
const FULL = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

/** « 9 et 10 octobre » */
export function formatDayRange(startIso: string, endIso: string): string {
  const s = new Date(startIso)
  const e = new Date(endIso)
  return `${DAY.format(s)} et ${DAY_MONTH.format(e)}`
}

/** « 2 octobre 2026 » depuis AAAA-MM-JJ */
export function formatDate(day: string | undefined): string {
  if (!day) return ''
  const d = new Date(`${day.length === 7 ? `${day}-01` : day}T12:00:00+02:00`)
  if (Number.isNaN(d.getTime())) return day
  return day.length === 7 ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d) : FULL.format(d)
}

export function percent(score: number | null): string {
  return score === null ? '–' : `${Math.round(score)}`
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
  return `${day.replace(/ /g, '\u00a0')} à ${d.getHours()}\u00a0h\u00a0${String(d.getMinutes()).padStart(2, '0')}`
}
