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
 * Le corps du message : la marche à suivre (l'image jointe ou le code), le code par lignes de huit groupes et la mise
 * en garde. « page » : l'adresse de la page d'import dans l'élection affichée (link('/autre-appareil/importer'),
 * ui/nav.ts), sans aucune réponse.
 */
export function transferMailBody(pack: ElectionPack, code: string, page: string, now = new Date()): string {
  const groups = groupCode(code)
  const lines: string[] = []
  for (let i = 0; i < groups.length; i += 8) lines.push(groups.slice(i, i + 8).join(' '))
  return [
    `Mes réponses à ${APP_NAME} (${pack.election.shortName}), copie du ${dateFr(now)}.`,
    '',
    `Pour les importer, ouvrir ${APP_URL}/${page}, puis choisir l’image jointe ou coller ce code :`,
    '',
    ...lines,
    '',
    'Ne pas transférer ni publier ce message : il contient toutes mes réponses et mes lignes rouges.',
  ].join('\r\n')
}

/** Le lien mailto:, sans destinataire ni pièce jointe (l'image est alors téléchargée à part) */
export function transferMailto(pack: ElectionPack, code: string, page: string, now = new Date()): string {
  return `mailto:?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(transferMailBody(pack, code, page, now))}`
}
