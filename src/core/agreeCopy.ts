// Les mots de la section « Accords et désaccords », sur la page des résultats (ui/screens/Results.tsx), dans le
// dépouillement en PDF et sur l'image partagée (core/agreeImage.ts). Repris tels quels par core/resultsCopy.ts, où la page
// et le PDF les prennent. À part, sans aucune importation : l'image, chargée à la demande, les prend ici sans rien
// tirer d'autre du code de la page, ce qui garde le découpage du build (et le JS initial) tel qu'il était.

export const TITLE_AGREE = 'Accords et désaccords'

/** Accords et désaccords : chapeau */
export const AGREE_LEDE =
  'Vos avis sur ce que porte chaque candidat, comptés un par un. Un accord\u00a0: «\u00a0D’accord\u00a0» sur une approche qu’il défend, ou «\u00a0Pas d’accord\u00a0» sur une approche qu’il rejette. Ses approches principales comptent double dans le score\u00a0; ses autres positions sont ses approches compatibles et ses rejets.'

/** Accords et désaccords : les deux colonnes de barres */
export const AGREE_HEADS = ['Ses approches principales', 'Ses autres positions'] as const

/** Accords et désaccords : candidat sans position connue sur vos réponses */
export const AGREE_NONE = 'Aucune position connue sur vos réponses.'

/** « 0 accord », « 1 désaccord », « 3 accords » : un compte de la section, écrit (page et image partagée) */
export const count = (n: number, word: string) => `${n}\u00a0${word}${n > 1 ? 's' : ''}`
