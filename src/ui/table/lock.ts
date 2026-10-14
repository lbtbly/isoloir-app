// « À table » : le verrou du mode fermé, partagé par le site (la garde d'app.tsx) et l'écran de la table. Un module à
// part, sans dépendance : l'écran de la table ne doit pas importer son propre chargeur (load.ts), sinon le build
// sortirait du script principal les modules qu'ils partagent.
// Deux sources : une séance en mémoire (setTableLocked), et la marque de l'historique quand la page a été rechargée
// sur une entrée marquée (la séance est alors perdue, la table se dit interrompue). Une marque restée sur une entrée
// plus ancienne ne reverrouille rien après un déverrouillage : seul compte ce qui était là au chargement de la page.

/** Marque de l'entrée d'historique d'une table en cours : elle survit au rechargement de la page */
export const TABLE_MARK = 'isoloirTable'

/** L'entrée courante porte-t-elle la marque ? */
export function marked(state: unknown = typeof history === 'undefined' ? null : history.state): boolean {
  try {
    return (state as Record<string, unknown> | null)?.[TABLE_MARK] === 1
  } catch {
    return false
  }
}

/** La page a-t-elle été (re)chargée sur une entrée marquée ? */
const markedAtLoad = marked()
let locked = false
let released = false

/** Le mode fermé : une séance en mémoire, ou une table interrompue par un rechargement, tant qu'on ne l'a pas déverrouillée */
export function tableLocked(): boolean {
  return locked || (markedAtLoad && !released)
}

export function setTableLocked(on: boolean) {
  locked = on
  if (!on) released = true
}
