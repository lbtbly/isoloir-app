// « M'envoyer une copie par e-mail » : une copie des réponses gardée dans sa propre messagerie, le QR code en pièce
// jointe et le code dans le message, avec la marche à suivre pour les importer plus tard sur n'importe quel appareil.
// Rien ne part d'Isoloir : la page passe le message à la messagerie de l'appareil (menu de partage, qui joint
// l'image ; à défaut un lien mailto:, l'image étant alors téléchargée pour être jointe à la main), sans destinataire.
// C'est la personne qui met son adresse et envoie, et sa messagerie qui garde la copie.

import { APP_NAME, APP_URL } from './app'
import { groupCode } from './transfer/base32'
import type { ElectionPack } from './types'

const dateFr = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export const MAIL_SUBJECT = `Mes réponses ${APP_NAME} (copie à importer)`

/**
 * Le corps du message : le code par lignes de huit groupes, la marche à suivre (par l'image jointe ou par le code) et
 * la mise en garde. « page » : l'adresse de la page « Autre appareil » dans l'élection affichée (link('/autre-appareil'),
 * ui/nav.ts), sans aucune réponse.
 */
export function transferMailBody(pack: ElectionPack, code: string, page: string, now = new Date()): string {
  const groups = groupCode(code)
  const lines: string[] = []
  for (let i = 0; i < groups.length; i += 8) lines.push(groups.slice(i, i + 8).join(' '))
  return [
    `Copie de mes réponses à ${APP_NAME} (${pack.election.shortName}), du ${dateFr(now)}. Le QR code est en pièce jointe ; le même code, en texte :`,
    '',
    ...lines,
    '',
    'Pour importer ces réponses et mon profil politique sur un appareil :',
    `1. Ouvrir ${APP_URL}/${page}`,
    '2. Choisir « Importer mes réponses ».',
    '3. Choisir l’image du QR code jointe à ce message, ou coller le code ci-dessus, puis « Lire ce code ».',
    '',
    'Attention : ce code et ce QR code contiennent toutes mes réponses, question par question, et mes lignes rouges. Ne pas les transférer ni les publier.',
  ].join('\r\n')
}

/** Le lien mailto:, sans destinataire ni pièce jointe (l'image est alors téléchargée à part) */
export function transferMailto(pack: ElectionPack, code: string, page: string, now = new Date()): string {
  return `mailto:?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(transferMailBody(pack, code, page, now))}`
}
