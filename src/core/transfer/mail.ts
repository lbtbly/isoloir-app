// « Me l'envoyer par e-mail » : un lien mailto: qui ouvre la messagerie de l'appareil avec le code de reprise et la
// marche à suivre, sans destinataire (la personne y met sa propre adresse). Rien ne part d'Isoloir : c'est la
// messagerie, choisie et lancée par la personne, qui envoie, et qui garde une copie du code.

import { APP_NAME, APP_URL } from '../app'
import type { ElectionPack } from '../types'
import { groupCode } from './base32'

const dateFr = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export const MAIL_SUBJECT = `Mes réponses ${APP_NAME}, à reprendre sur un autre appareil`

/** Le corps du message : le code par lignes de huit groupes, la marche à suivre et la mise en garde */
export function transferMailBody(pack: ElectionPack, code: string, now = new Date()): string {
  const groups = groupCode(code)
  const lines: string[] = []
  for (let i = 0; i < groups.length; i += 8) lines.push(groups.slice(i, i + 8).join(' '))
  return [
    `Le code de mes réponses à ${APP_NAME} (${pack.election.shortName}), fabriqué le ${dateFr(now)} :`,
    '',
    ...lines,
    '',
    'Pour retrouver ces réponses et mon profil politique sur un autre appareil :',
    `1. Ouvrir ${APP_URL}/#/autre-appareil`,
    '2. Choisir « Récupérer mes réponses ».',
    '3. Coller ce code dans « Coller ou taper le code », puis « Lire ce code ».',
    '',
    'Attention : ce code contient toutes mes réponses, question par question, et mes lignes rouges. Ne pas le transférer ni le publier.',
  ].join('\r\n')
}

/** Le lien mailto:, sans destinataire */
export function transferMailto(pack: ElectionPack, code: string, now = new Date()): string {
  return `mailto:?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(transferMailBody(pack, code, now))}`
}
