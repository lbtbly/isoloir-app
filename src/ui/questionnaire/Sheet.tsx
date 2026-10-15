// Feuille de pointage : une question par écran.
// Ce module ne reçoit que la banque de questions. Il n'a aucun accès aux candidats ni à leurs
// positions (règle ESLint + test d'import), ce qui garantit l'anonymat des approches.

import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { EMPTY_ANSWER, hasOpinion, ratingOf, withRating, withRedLine } from '../../core/answers'
import type { Answer, Question, Rating, Topic } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { PrivacyButton } from '../components/Airplane'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { InkCross } from '../components/Ink'
import { RatingRuler, RulerLegend } from '../components/RatingRuler'
import { Tally } from '../components/Tally'
import { QuestionVideos } from '../videos/Links'
import { Explainer } from './Explainer'
import { LETTERS } from './letters'

export interface SheetProps {
  title: string
  question: Question
  /** Approches dans l'ordre mélangé propre à l'utilisateur */
  approaches: Question['approaches']
  topic: Topic | undefined
  index: number
  total: number
  answered: number
  answer: Answer | undefined
  onChange: (answer: Answer) => void
  onNext: () => void
  onBack: () => void
  /** Bandeau au-dessus de la question (feuille de révision) */
  notice?: ComponentChildren
  /** Libellé du bouton suivant, quand il ne dépend pas de la réponse */
  nextLabel?: string
  /**
   * Le bouton suivant passe la question : il prend le trait noir plutôt que l'aplat bleu. Par défaut, quand le
   * libellé est celui de la feuille (« Passer ») et qu'aucun avis n'est coché
   */
  skip?: boolean
  /** Afficher la consigne (premières questions) */
  hint?: boolean
  /**
   * Approches apparues depuis la réponse, la question ayant changé (core/revisions.ts, freshApproaches) : en tête de
   * la question, sous le tampon « Nouvelle »
   */
  fresh?: ReadonlySet<string>
  /**
   * Mode fermé (« À table ») : l'en-tête et le pied donnés remplacent ceux du site, sans menu ni lien, et la feuille
   * ne propose pas de vidéo ; le téléphone passe de main en main, rien ne doit mener ailleurs
   */
  closed?: { header: ComponentChildren; foot: ComponentChildren }
}


const NONE: ReadonlySet<string> = new Set()

export function Sheet(props: SheetProps) {
  const { question, onChange } = props
  // Les approches nouvelles, figées le temps de la question : la réponse prend la révision de la question au premier
  // geste (feuille de pointage), et l'approche ne doit ni sauter de place sous le doigt ni perdre son tampon
  const freshOf = useRef<{ id: string; set: ReadonlySet<string> } | null>(null)
  if (freshOf.current?.id !== question.id) freshOf.current = { id: question.id, set: props.fresh ?? NONE }
  const fresh = freshOf.current.set
  // En tête, dans l'ordre tiré au hasard pour la personne ; les autres suivent dans le même ordre
  const approaches = fresh.size
    ? [...props.approaches.filter(a => fresh.has(a.id)), ...props.approaches.filter(a => !fresh.has(a.id))]
    : props.approaches
  const answer = props.answer && !props.answer.skipped ? props.answer : EMPTY_ANSWER
  // Les traits ne se dessinent que pour le geste qui vient d'avoir lieu
  const [lastGesture, setLastGesture] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setLastGesture(null)
    setStatus('')
  }, [question.id])

  const letterOf = (id: string) => LETTERS[approaches.findIndex(a => a.id === id)] ?? ''

  const rate = (id: string, value: Rating | 0) => {
    setLastGesture(`rate:${id}`)
    if (answer.redLines.includes(id) && value !== -1) setStatus(`Approche ${letterOf(id)} : ligne rouge retirée`)
    onChange(withRating(answer, id, value))
  }
  const toggleRedLine = (id: string) => {
    const on = answer.redLines.includes(id)
    setLastGesture(`red:${id}`)
    setStatus(
      on
        ? `Approche ${letterOf(id)} : ligne rouge retirée`
        : `Approche ${letterOf(id)} : ligne rouge, notée « pas d’accord »`,
    )
    onChange(withRedLine(answer, id, !on))
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div class="screen screen-sheet screen-question">
      {props.closed ? (
        props.closed.header
      ) : (
        <FormHeader
          title={props.title}
          locator={
            <span class="locator">
              <span class="locator-topic">{props.topic?.label}</span>
              <span class="locator-count" aria-hidden="true">
                {pad(props.index + 1)}/{pad(props.total)}
              </span>
              <span class="sr-only">
                Question {props.index + 1} sur {props.total}
              </span>
            </span>
          }
        />
      )}
      <main class="sheet has-margin q-layout" id="contenu" tabIndex={-1}>
        <div class="in-margin sheet-margin" aria-hidden="true">
          <span class="margin-count">{pad(props.index + 1)}</span>
          <span class="margin-total">sur {pad(props.total)}</span>
          <Tally count={props.answered} maxGroups={Infinity} label="" />
        </div>
        <div class="q-col">
          {props.notice}
          <h1 class="q-prompt" tabIndex={-1}>
            {question.prompt}
          </h1>
          {question.context ? <p class="q-context">{question.context}</p> : null}
          {/* Chaque question, et non la seule première : on peut reprendre la feuille en cours de route, ou arriver
              par la feuille de révision. Une mention pour tout l'écran (question, contexte, « Comprendre l'enjeu »,
              approches) : la fiche, juste dessous, ne répète pas la sienne. */}
          <AiLabel kind="feuille" class="q-ai" more={props.closed ? 'seule' : 'bulle'} />
          {question.explainer ? <Explainer data={question.explainer} ai="aucune" /> : null}
          {/* Une vidéo qui éclaire la question : un lien discret ; le lecteur s'ouvre par-dessus la feuille, qui garde
              la réponse en cours, et rend le focus au lien à la fermeture. Les vidéos ne disent ni les approches
              ni les candidats. */}
          {props.closed ? null : <QuestionVideos questionId={question.id} class="q-video" />}
          {props.hint ? (
            <p class="q-hint">
              Placez le repère sur les approches où vous avez un avis ; laissez les autres au centre. La case{' '}
              <Icon name="cross" class="hint-mark is-red" /> trace une ligne rouge : les candidats qui portent cette
              approche seront classés à part.
            </p>
          ) : null}
        </div>

        <div class="a-col answers">
          <RulerLegend />
          <ol class="approaches" aria-label="Approches proposées">
            {approaches.map((a, i) => {
              const value = ratingOf(answer, a.id)
              const redLine = answer.redLines.includes(a.id)
              const letter = LETTERS[i] ?? String(i + 1)
              const isFresh = fresh.has(a.id)
              return (
                <li key={a.id} class={`approach${value ? ' is-rated' : ''}${redLine ? ' is-rejected' : ''}${isFresh ? ' is-fresh' : ''}`}>
                  <span class="approach-letter" aria-hidden="true">
                    {letter}
                  </span>
                  <div class="approach-body">
                    <p class="approach-text" id={`at-${a.id}`}>
                      <span class="sr-only">
                        {letter}
                        {isFresh ? ', nouvelle approche' : ''}.{' '}
                      </span>
                      {/* Dans le texte, au-dessus : il le surmonte aussi quand la réglette est à côté (grand écran) */}
                      {isFresh ? (
                        <span class="stamp is-alert approach-stamp" aria-hidden="true">
                          <span class="stamp-label">Nouvelle</span>
                        </span>
                      ) : null}
                      <span class="inline-letter" aria-hidden="true">
                        {letter}
                      </span>
                      {a.text}
                    </p>
                    <div class="ruler-row">
                      <RatingRuler
                        name={`avis-${question.id}-${a.id}`}
                        label={`Votre avis sur l’approche ${letter}`}
                        describedBy={`at-${a.id}`}
                        value={value}
                        onChange={v => rate(a.id, v)}
                        draw={lastGesture === `rate:${a.id}`}
                      />
                      </div>
                  </div>
                  <button
                    type="button"
                    class="approach-reject"
                    aria-pressed={redLine}
                    aria-label={`Ligne rouge : approche ${letter}`}
                    aria-describedby={`at-${a.id}`}
                    onClick={() => toggleRedLine(a.id)}
                  >
                    <span class="box">{redLine ? <InkCross draw={lastGesture === `red:${a.id}`} /> : null}</span>
                    <span class="reject-label" aria-hidden="true">
                      Ligne rouge
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p class="sr-only" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </main>
      {props.closed ? props.closed.foot : <SiteFooter />}

      <nav class="action-bar" aria-label="Navigation de la feuille">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={props.onBack}>
            <Icon name="arrow-left" />
            <span class="btn-label">Retour</span>
          </button>
          <div class="bar-center">
            {/* En mode fermé, pas de fenêtre de confidentialité : son lien mènerait hors de la table (le pied fermé dit l'essentiel) */}
            {props.closed ? null : <PrivacyButton />}
            <Tally
              class="bar-tally"
              count={props.answered}
              label={`${props.answered} réponse${props.answered > 1 ? 's' : ''} pointée${props.answered > 1 ? 's' : ''}`}
            />
          </div>
          {/* L'aplat bleu marque l'action principale (2026-10-15) : il n'arrive qu'avec le premier avis coché. « Passer »
              garde sa place et sa taille, au trait noir, pour ne pas appeler le doigt avant que l'électeur ait choisi */}
          <button
            type="button"
            class={(props.skip ?? (props.nextLabel === undefined && !hasOpinion(answer))) ? 'btn-primary is-outline' : 'btn-primary'}
            onClick={props.onNext}
          >
            {props.nextLabel ?? (hasOpinion(answer) ? 'Suivante' : 'Passer')}
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
