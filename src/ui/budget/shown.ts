// L'élection affichée a-t-elle « Faire les comptes » ? Un fichier sans dépendance, lu par le menu de l'en-tête et le
// pied de page, comme table/shown.ts : y importer budget/load suffirait à faire découper une seconde feuille de style.

let shown = false

/** Fixé par l'application avant de rendre l'élection (src/app.tsx, par setBudgetElection de budget/load.ts) */
export const budgetShown = (): boolean => shown

export function setBudgetShown(value: boolean) {
  shown = value
}

/** La phrase du panneau « Faire les comptes » de « Et maintenant » (dépouillement, accueil de retour) */
export const BUDGET_PANEL = 'Le budget 2027 à régler, levier par levier : le déficit bouge à chaque geste.'
