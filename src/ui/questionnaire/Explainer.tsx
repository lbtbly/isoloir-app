// « Comprendre l'enjeu » : le contexte d'une question, quelques explications et les chiffres clés,
// chacun avec sa source. Aucun candidat n'y figure : ce module fait partie du questionnaire anonyme.
// Dans la feuille, ouvert d'emblée sur grand écran, replié sur téléphone pour garder la question courte ;
// sur la page « Les sujets », toujours ouvert. Chaque chiffre se lit en deux temps : à gauche (ou dessus)
// la valeur en gros et son graphique quand il en a un, à côté l'explication et la source.
// Ces fiches sont rédigées par une IA : la mention « Rédigé par IA » ouvre le contenu, comme une signature. Dans
// la feuille, c'est l'étiquette de l'écran, juste au-dessus de « Comprendre l'enjeu », qui la porte (une seule
// mention par question) ; sur la page « Les sujets », chaque fiche garde la sienne, sans bulle (la tête de la
// page porte l'explication).

import { useState } from 'preact/hooks'
import type { ExplainerFigure, Explainer as ExplainerData, Source } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { FigureChart } from '../components/FigureChart'
import { Icon } from '../components/Icon'
import { formatDate, hostOf } from '../format'
import '../../styles/topics.css'

const wide = () => typeof matchMedia !== 'undefined' && matchMedia('(min-width: 64rem)').matches

/** « INSEE, 2025 » : l'éditeur et la date, le lien ouvre la source dans un nouvel onglet */
function SourceLink({ source, date }: { source: Source; date?: string }) {
  const when = date ?? source.date
  return (
    <span class="figure-source">
      <ExternalLink href={source.url}>{source.publisher ?? hostOf(source.url)}</ExternalLink>
      {when ? `, ${/^\d{4}-\d{2}(-\d{2})?$/.test(when) ? formatDate(when) : when}` : ''}
    </span>
  )
}

/**
 * Première phrase et suite d'un texte, pour hiérarchiser sans rien retrancher. La coupe se fait après
 * un point suivi d'une majuscule ; un texte d'une seule phrase reste entier.
 */
function lead(text: string): [string, string] {
  for (const m of text.matchAll(/\.\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ«])/g)) {
    const cut = m.index + 1
    // Pas de coupe après une abréviation (« art. L. 3121-18 ») ou une initiale
    if (/(\b(art|al|cf|p|n°)|\b\p{Lu})\.$/u.test(text.slice(0, cut))) continue
    return [text.slice(0, cut), text.slice(cut).trim()]
  }
  return [text, '']
}

function Figure({ figure }: { figure: ExplainerFigure }) {
  const [head, rest] = lead(figure.label)
  return (
    <li class={`ex-figure${figure.chart ? ' has-chart' : ''}`}>
      <div class="ex-figure-visual">
        <span class="ex-figure-value">{figure.value}</span>
        {figure.chart ? <FigureChart chart={figure.chart} value={figure.value} text={`${figure.value} ${figure.label}`} /> : null}
      </div>
      <div class="ex-figure-text">
        <p class="ex-figure-label">
          {head}
          {rest ? <span class="ex-figure-more"> {rest}</span> : null}
        </p>
        <SourceLink source={figure.source} date={figure.date} />
      </div>
    </li>
  )
}

/** L'étiquette IA de la fiche : « bulle » (explication dépliable), « seule » (la mention), « aucune » quand
 *  l'écran la porte déjà juste au-dessus */
type AiMention = 'bulle' | 'seule' | 'aucune'

function Body({ data, ai }: { data: ExplainerData; ai: AiMention }) {
  return (
    <div class="ex-body">
      {ai === 'aucune' ? null : <AiLabel kind="fiche" more={ai} class="ex-ai" />}
      <p class="ex-summary">{data.summary}</p>
      {data.figures.length ? (
        <ul class="ex-figures" aria-label="Chiffres clés">
          {data.figures.map(f => (
            <Figure key={f.value + f.label} figure={f} />
          ))}
        </ul>
      ) : null}
      {data.points.length ? (
        <ul class="ex-points" aria-label="À savoir">
          {data.points.map(p => {
            const [head, rest] = lead(p.text)
            return (
              <li key={p.text}>
                <span class="ex-point-head">{head}</span>
                {rest ? ` ${rest}` : ''}
                {p.source ? (
                  <>
                    {' '}
                    <SourceLink source={p.source} />
                  </>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export function Explainer({
  data,
  page = false,
  ai = 'bulle',
}: {
  data: ExplainerData
  /** Page « Les sujets » : toujours ouvert */
  page?: boolean
  /** Étiquette « Rédigé par IA » en tête de la fiche (par défaut, la bulle) */
  ai?: AiMention
}) {
  const [open, setOpen] = useState(wide)
  const n = data.figures.length
  if (page)
    return (
      <div class="explainer is-page">
        <Body data={data} ai={ai} />
      </div>
    )
  return (
    <details class="explainer" open={open} onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>
        <Icon name="chevron" class="disclosure" />
        <span class="summary-label">Comprendre l’enjeu</span>
        {n ? (
          <span class="explainer-count">
            {n} chiffre{n > 1 ? 's' : ''} clé{n > 1 ? 's' : ''}
          </span>
        ) : null}
      </summary>
      <Body data={data} ai={ai} />
    </details>
  )
}
