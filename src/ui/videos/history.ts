// L'historique du lecteur vidéo. Ouvrir le lecteur ajoute une entrée d'historique, à la même adresse que la page
// qui l'ouvre (Player.tsx) : « retour » (bouton, geste) ferme le lecteur au lieu de quitter la page. Quitter le
// lecteur par un lien (« Voir la fiche », « Lire les fiches », « L'usage de l'IA ») inscrit dans cette entrée la
// vidéo et le passage en cours : au retour, l'hôte du lecteur (Host.tsx) le rouvre là où on l'avait laissé, par
// dessus la page d'où il avait été ouvert (une question, « Les sujets », « Les sujets en vidéo »).
// Rien de tout cela ne quitte l'appareil : c'est l'historique de l'onglet.

/** Marque de l'entrée d'historique du lecteur */
export const LECTEUR = 'isoloir-lecteur'

/** L'état d'une entrée d'historique, s'il en a un */
const entryState = (s: unknown) => (s && typeof s === 'object' ? (s as Record<string, unknown>) : null)

/** L'entrée d'historique courante (ou celle qu'on vient d'atteindre) est-elle celle du lecteur ? */
export const isPlayerEntry = (s: unknown = history.state) => !!entryState(s)?.[LECTEUR]

/** La vidéo et le passage inscrits dans une entrée du lecteur, s'il y en a */
export function savedPlayer(s: unknown = history.state): { id: string; segment: number } | null {
  const e = entryState(s)
  if (!e?.[LECTEUR] || typeof e.vpVideo !== 'string' || !e.vpVideo) return null
  const segment = typeof e.vpSegment === 'number' && Number.isFinite(e.vpSegment) ? Math.max(0, Math.floor(e.vpSegment)) : 0
  return { id: e.vpVideo, segment }
}

/** Inscrit la vidéo et le passage dans l'entrée courante du lecteur, à la même adresse (avant de suivre un lien) */
export function savePlayer(id: string, segment: number) {
  history.replaceState({ [LECTEUR]: true, vpVideo: id, vpSegment: segment }, '')
}
