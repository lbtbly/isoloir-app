// « À table » : le verrou du mode fermé, partagé par le site (la garde d'app.tsx) et l'écran de la table. Un module à
// part, sans dépendance : l'écran de la table ne doit pas importer son propre chargeur (load.ts), sinon le build
// sortirait du script principal les modules qu'ils partagent.

/** Marque de l'entrée d'historique d'une table en cours : elle survit au rechargement de la page */
export const TABLE_MARK = 'isoloirTable'

let locked = false

/** Le mode fermé : une séance en mémoire, ou interrompue par un rechargement (la marque est restée dans l'historique) */
export function tableLocked(): boolean {
  if (locked) return true
  try {
    return (history.state as Record<string, unknown> | null)?.[TABLE_MARK] === 1
  } catch {
    return false
  }
}

export function setTableLocked(on: boolean) {
  locked = on
}
