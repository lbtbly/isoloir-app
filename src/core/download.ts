// Le téléchargement d'un fichier fabriqué sur l'appareil (double, PDF, images) : rien n'est envoyé, le navigateur
// enregistre le fichier là où la personne le choisit. Un module à part, sans dépendance, pour qu'un écran chargé à la
// demande s'en serve sans emporter l'export du double (core/exportData.ts, qui lit le stockage).

/** Déclenche le téléchargement d'un fichier généré localement */
export function downloadBlob(blob: Blob, fileName: string, keepMs = 1000): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // keepMs : le temps de garder l'adresse du fichier ; Safari sur iPhone la lit seulement quand on répond à
  // « Télécharger ? », d'où une minute pour le PDF
  setTimeout(() => URL.revokeObjectURL(url), keepMs)
}
