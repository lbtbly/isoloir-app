// Ce que le pied de page peut faire de la feuille de cet appareil, fourni par l'application (app.tsx) à tous les
// écrans : la relire, la transférer, en importer une autre, tout effacer. Le pied ne reçoit que des réponses toutes
// faites et des fonctions, jamais l'élection entière : la feuille de pointage, qui l'affiche aussi, n'a ainsi accès ni
// aux candidats ni à leurs positions (anonymat structurel, eslint.config.js).

import { createContext } from 'preact'
import { useContext } from 'preact/hooks'

/** Une feuille lue dans un fichier choisi au pied : de quoi la prendre, ou ce qui ne va pas */
export type FootRead = { ok: true; notes: string[]; take: () => void } | { ok: false; error: string }

export interface FootSheet {
  /** Au moins une question du questionnaire rapide vue (répondue ou passée) */
  started: boolean
  /** Toutes les questions du questionnaire rapide vues */
  done: boolean
  /** Le navigateur enregistre la progression (pas de navigation privée ni de stockage bloqué) */
  saved: boolean
  /** Les réponses viennent d'être effacées : l'annonce en reste jusqu'à la prochaine réponse */
  erased: boolean
  /** Lit un fichier choisi : le double (JSON), une image de QR code ou un code de transfert */
  read: (file: File) => Promise<FootRead>
  /** Efface tout, puis ramène à l'accueil */
  erase: () => void
}

export const FootSheetContext = createContext<FootSheet | null>(null)

export function useFootSheet(): FootSheet | null {
  return useContext(FootSheetContext)
}
