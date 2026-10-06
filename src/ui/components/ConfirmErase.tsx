import { useEffect, useRef, useState } from 'preact/hooks'
import { Icon } from './Icon'

/** Effacement en deux temps, sans perte de focus : le bouton de confirmation reçoit le focus, Annuler le rend */
export function ConfirmErase({ onErase, label = 'Tout effacer' }: { onErase: () => void; label?: string }) {
  const [asking, setAsking] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const askRef = useRef<HTMLButtonElement>(null)
  const wasAsking = useRef(false)

  useEffect(() => {
    if (asking) confirmRef.current?.focus()
    else if (wasAsking.current) askRef.current?.focus()
    wasAsking.current = asking
  }, [asking])

  return asking ? (
    <span class="confirm" role="group" aria-label="Confirmer l’effacement de vos réponses">
      <button ref={confirmRef} type="button" class="btn-text is-danger" onClick={onErase}>
        Confirmer l’effacement
      </button>
      <button type="button" class="btn-text" onClick={() => setAsking(false)}>
        Annuler
      </button>
    </span>
  ) : (
    <button ref={askRef} type="button" class="btn-text" onClick={() => setAsking(true)}>
      <Icon name="erase" />
      {label}
    </button>
  )
}
