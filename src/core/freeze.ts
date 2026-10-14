// Le gel des jours de vote : les périodes où les données ne changent pas, où rien n'est mis en ligne et où le site ne
// fabrique aucune image de partage (affiche, « Accords et désaccords », image de la table). Ce sont les périodes que
// l'élection fixe elle-même (election.freezeWindows : par exemple de la veille du vote du samedi outre-mer à la
// clôture du dimanche), sinon, pour chaque tour, de la veille du premier jour de vote, 0 h à Paris, à sa clôture.
// Pur, sans dépendance : les Mentions légales en écrivent les dates, les écrans de partage s'en servent pour se couper.

import type { ElectionInfo } from './types'

const DAY_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
const HOUR = new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Paris' })
const DAY_MS = 24 * 3600 * 1000

/** Une période de gel : début inclus, fin exclue (ISO 8601) */
export interface FreezeSpan {
  start: string
  end: string
}

/** Jour de Paris, « samedi 1er mai », sans coupure */
function dayOf(d: Date): string {
  return DAY_LONG.format(d)
    .replace(/^(\S+ )1 /, (_, weekday: string) => `${weekday}1er `)
    .replace(/ /g, '\u00a0')
}

/** Heure de Paris, « 20 h », « 0 h » (Intl écrit « 00 » pour minuit) */
function hourOf(d: Date): string {
  return `${Number(HOUR.formatToParts(d).find(p => p.type === 'hour')?.value ?? 0)}\u00a0h`
}

/** La veille d'un tour, 0 h à Paris : la date de début du tour moins un jour, ramenée à minuit à Paris */
function eveOf(round: { start: string }): Date {
  const eve = new Date(new Date(round.start).getTime() - DAY_MS)
  // Minuit à Paris ce jour-là : l'heure de Paris du moment, retirée (le décalage horaire suit l'heure d'été)
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }).formatToParts(eve)
  const n = (t: string) => Number(parts.find(p => p.type === t)?.value ?? 0)
  return new Date(eve.getTime() - ((n('hour') * 60 + n('minute')) * 60 + n('second')) * 1000 - eve.getMilliseconds())
}

/**
 * Gel des données pour un tour de scrutin : de la veille du premier jour de vote, 0 h, à la clôture.
 * « du jeudi 8 octobre, 0 h, au samedi 10 octobre, 20 h »
 */
export function freezeWindow(round: { start: string; end: string }): string {
  const eve = new Date(new Date(round.start).getTime() - DAY_MS)
  const end = new Date(round.end)
  return `du ${dayOf(eve)}, 0\u00a0h, au ${dayOf(end)}, ${hourOf(end)}`
}

/** Une période de gel donnée telle quelle par l'élection (freezeWindows) : « du vendredi 16 avril, 0 h, au dimanche 18 avril, 20 h » */
export function freezePeriod(period: { start: string; end: string }): string {
  const start = new Date(period.start)
  const end = new Date(period.end)
  return `du ${dayOf(start)}, ${hourOf(start)}, au ${dayOf(end)}, ${hourOf(end)}`
}

/** Les périodes de gel de l'élection : les siennes, sinon une par tour, de sa veille 0 h (heure de Paris) à sa clôture */
export function freezeSpans(election: Pick<ElectionInfo, 'freezeWindows' | 'rounds'>): FreezeSpan[] {
  if (election.freezeWindows?.length) return election.freezeWindows.map(w => ({ start: w.start, end: w.end }))
  return election.rounds.map(r => ({ start: eveOf(r).toISOString(), end: r.end }))
}

/** Les périodes de gel, en toutes lettres, comme les Mentions légales les écrivent */
export function freezeTexts(election: Pick<ElectionInfo, 'freezeWindows' | 'rounds'>): string[] {
  return election.freezeWindows?.length ? election.freezeWindows.map(freezePeriod) : election.rounds.map(freezeWindow)
}

/** La période de gel en cours à cet instant, ou null ; début inclus, fin exclue */
export function frozenAt(election: Pick<ElectionInfo, 'freezeWindows' | 'rounds'>, now: Date = new Date()): FreezeSpan | null {
  const t = now.getTime()
  return freezeSpans(election).find(s => new Date(s.start).getTime() <= t && t < new Date(s.end).getTime()) ?? null
}
