// « Fermez l'isoloir » : la preuve par le mode avion. Une fois la page chargée, Isoloir marche
// sans réseau jusqu'au résultat ; couper le réseau garantit que rien ne peut sortir de l'appareil.
// Ce module ne lit que l'état du réseau : il sert aussi au questionnaire.

import { useRef } from 'preact/hooks'
import { useOnline } from '../useOnline'
import { AirplaneDiagram } from './Diagrams'
import { Icon } from './Icon'

const HOW = [
  { device: 'iPhone', how: 'balayez vers le bas depuis le coin supérieur droit, puis touchez l’avion.' },
  { device: 'Android', how: 'balayez vers le bas depuis le haut de l’écran, puis touchez « Mode avion ».' },
  { device: 'Ordinateur', how: 'coupez le Wi-Fi depuis la barre des menus ou des tâches, ou débranchez le câble réseau.' },
]

function HowTo({ class: c }: { class?: string }) {
  return (
    <details class={['how-to', c].filter(Boolean).join(' ')}>
      <summary>
        <Icon name="chevron" class="disclosure" />
        <span class="summary-label">Comment passer en mode avion</span>
      </summary>
      <ul>
        {HOW.map(h => (
          <li key={h.device}>
            <strong>{h.device}</strong> : {h.how}
          </li>
        ))}
      </ul>
    </details>
  )
}

/**
 * Barre du bas des questions : un cadenas (un avion hors ligne) ouvre une fenêtre de détails.
 * Le rappel reste à portée de main sans encombrer la question.
 */
export function PrivacyButton() {
  const online = useOnline()
  const dialog = useRef<HTMLDialogElement>(null)
  const close = () => dialog.current?.close()
  return (
    <>
      <button
        type="button"
        class="btn-text privacy-trigger"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <Icon name={online ? 'lock' : 'plane'} />
        <span class="btn-label">{online ? 'Vos réponses restent ici' : 'Hors ligne'}</span>
      </button>
      <dialog
        ref={dialog}
        class="privacy-dialog"
        aria-labelledby="privacy-title"
        onClick={e => {
          // Un clic sur le fond (hors de la fiche) ferme la fenêtre
          if (e.target === dialog.current) close()
        }}
      >
        <div class="dialog-body">
          <h2 id="privacy-title">
            {online ? 'Vos réponses ne quittent pas cet appareil' : 'Isoloir fermé : vous êtes hors ligne'}
          </h2>
          <p>
            {online
              ? 'Elles ne sont envoyées nulle part\u00a0: pas de compte, pas de serveur qui les reçoive, pas de mesure d’audience. Pour le vérifier vous-même, passez en mode avion maintenant\u00a0: la feuille, le dépouillement, l’image et le double continuent de marcher, et plus rien ne peut sortir de l’appareil.'
              : 'Plus rien ne peut sortir de cet appareil. La feuille, le dépouillement, l’image et le double marchent quand même. Avant de rallumer le réseau, vous pouvez tout effacer depuis les résultats.'}
          </p>
          <AirplaneDiagram />
          <HowTo />
          <p class="dialog-actions">
            <a href="#/confidentialite" onClick={close}>
              Tout savoir sur la confidentialité
            </a>
            <button type="button" class="btn-primary" onClick={close} autofocus>
              Compris
            </button>
          </p>
        </div>
      </dialog>
    </>
  )
}

/** Accueil : la proposition, le schéma en trois étapes et l'état du réseau en direct */
export function AirplaneSection() {
  const online = useOnline()
  return (
    <section class="airplane" id="fermez" aria-labelledby="air-title">
      <h2 id="air-title" class="section-title">
        Fermez l’isoloir
      </h2>
      <div class="airplane-grid">
        <div class="airplane-text">
          <p class="airplane-lede">
            Vous n’avez pas à nous croire sur parole. Une fois la page chargée, passez en mode avion : tout continue de
            marcher jusqu’au résultat, et rien ne peut partir.
          </p>
          <p class={`net-state${online ? '' : ' is-closed'}`} role="status">
            <Icon name={online ? 'lock' : 'plane'} />
            {online
              ? 'Vous êtes en ligne. Coupez le réseau quand vous voulez, même au milieu des questions.'
              : 'Vous êtes hors ligne : l’isoloir est fermé. Rien ne peut partir de cet appareil.'}
          </p>
          <HowTo />
        </div>
        <AirplaneDiagram />
      </div>
    </section>
  )
}

/** En-tête hors ligne : le rideau de l'isoloir tombe, une fois */
export function Curtain() {
  const online = useOnline()
  return (
    <div class="curtain-slot" role="status">
      {online ? null : (
        <div class="curtain">
          <svg class="curtain-pleats" aria-hidden="true" preserveAspectRatio="none">
            <defs>
              {/* Plis qui tombent du filet, espacés inégalement, ourlet légèrement ondulé */}
              <pattern id="pleats" width="46" height="40" patternUnits="userSpaceOnUse">
                <path d="M3.5 0v15.6M13 0v13.9M21.5 0v15.2M33.5 0v13.6M40 0v15" />
                <path d="M0 15q5.75 2.6 11.5 0t11.5 0t11.5 0t11.5 0" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pleats)" />
          </svg>
          <span class="curtain-label">
            <Icon name="plane" />
            Isoloir fermé : hors ligne, rien ne peut partir
          </span>
        </div>
      )}
    </div>
  )
}
