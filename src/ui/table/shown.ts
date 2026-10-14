// L'élection affichée a-t-elle une table ? Un fichier sans dépendance, lu par le menu de l'en-tête (FormHeader) : y
// importer table/load suffisait à faire découper par le bundler une seconde feuille de style (check-dist).

let shown = false

/** Fixé par l'application avant de rendre l'élection (src/app.tsx, par setTableElection de table/load.ts) */
export const tableShown = (): boolean => shown

export function setTableShown(value: boolean) {
  shown = value
}
