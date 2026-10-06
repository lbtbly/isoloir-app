// Sous-titres : toujours affichés, gros, le mot en train d'être dit souligné. Les mots déjà dits sont à
// l'encre, ceux qui viennent en gris de lecture (contraste AA), pour suivre la voix sans la devancer.
// Le texte est du vrai texte : un lecteur d'écran le lit ; il n'est pas annoncé à chaque changement (la voix
// enregistrée le dit déjà). La transcription du panneau Sources reprend tout : ce qui est dit, le chiffre clé
// (valeur, libellé, date, source) et ce que le dessin écrit en plus (« alt » du passage).

import { useMemo } from 'preact/hooks'
import { wordsOf } from './model'

interface Props {
  text: string
  /** Mot en train d'être dit ; -1 avant le premier ; au-delà du dernier, tout est dit */
  word: number
  /** Rien n'est en cours : tout le texte à l'encre (affiche, image fixe à l'arrêt) */
  settled?: boolean
}

export function Captions({ text, word, settled = false }: Props) {
  const words = useMemo(() => wordsOf(text), [text])
  return (
    <p class={`vp-cap${settled ? ' is-settled' : ''}`}>
      {words.map((w, i) => (
        <span key={i}>
          <span class={i < word ? 'is-said' : i === word ? 'is-now' : undefined}>{w.text}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
