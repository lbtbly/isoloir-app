// « À table » : l'en-tête et le pied du mode fermé. Pendant que le téléphone passe de main en main, ni menu, ni lien,
// ni vidéo : rien ne mène à la feuille du propriétaire du téléphone, ni ailleurs. Les mentions légales restent à
// portée (LCEN), en texte, dans le pied replié.

import type { ComponentChildren } from 'preact'
import { CONTACT_EMAIL, EDITEUR } from '../../../core/legal'
import { TABLE_NAME } from '../../../core/table/copy'
import { Curtain } from '../../components/Airplane'
import { Logo } from '../../components/Logo'

/** L'en-tête fermé : le logo sans lien, le nom de la table et un repère à droite */
export function ClosedHeader({ where, offline = true }: { where?: ComponentChildren; offline?: boolean }) {
  return (
    <>
      <header class="form-header is-closed">
        <div class="form-header-inner">
          <span class="brand" role="img" aria-label="Isoloir">
            <Logo layout="horizontal" />
            <Logo layout="mark" />
          </span>
          <span class="closed-name">{TABLE_NAME}</span>
          {where ? <span class="form-locator">{where}</span> : null}
        </div>
      </header>
      {offline ? <Curtain /> : null}
    </>
  )
}

/** Le pied fermé : qui fait Isoloir, et ce que la table garde (rien) */
export function ClosedFoot() {
  return (
    <details class="closed-foot">
      <summary>Qui fait Isoloir, et vos données</summary>
      <p>
        Isoloir est édité par {EDITEUR.nom}, à titre personnel. Contact&nbsp;: {CONTACT_EMAIL}.
      </p>
      <p>Une table ne garde rien et n’envoie rien&nbsp;: tout reste dans la mémoire de cette page, et s’efface à la fin.</p>
    </details>
  )
}
