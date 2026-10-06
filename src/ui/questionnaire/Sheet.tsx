// Feuille de pointage : une question par écran.
// Ce module ne reçoit que la banque de questions. Il n'a aucun accès aux candidats ni à leurs
// positions (règle ESLint + test d'import), ce qui garantit l'anonymat des approches.

import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
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
  /** Afficher la consigne (premières questions) */
  hint?: boolean
}

const LETTERS = 'ABCDEFGH'

export function Sheet(props: SheetProps) {
  const { question, approaches, onChange } = props
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
          <AiLabel kind="feuille" class="q-ai" />
          {question.explainer ? <Explainer data={question.explainer} ai="aucune" /> : null}
          {/* Une vidéo qui éclaire la question : un lien discret ; le lecteur s'ouvre par-dessus la feuille, qui garde
              la réponse en cours, et rend le focus au lien à la fermeture. Les vidéos ne disent ni les approches
              ni les candidats. */}
          <QuestionVideos questionId={question.id} class="q-video" />
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
              return (
                <li key={a.id} class={`approach${value ? ' is-rated' : ''}${redLine ? ' is-rejected' : ''}`}>
                  <span class="approach-letter" aria-hidden="true">
                    {letter}
                  </span>
                  <div class="approach-body">
                    <p class="approach-text" id={`at-${a.id}`}>
                      <span class="sr-only">{letter}. </span>
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
      <SiteFooter />

      <nav class="action-bar" aria-label="Navigation de la feuille">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={props.onBack}>
            <Icon name="arrow-left" />
            <span class="btn-label">Retour</span>
          </button>
          <div class="bar-center">
            <PrivacyButton />
            <Tally
              class="bar-tally"
              count={props.answered}
              label={`${props.answered} réponse${props.answered > 1 ? 's' : ''} pointée${props.answered > 1 ? 's' : ''}`}
            />
          </div>
          <button type="button" class="btn-primary" onClick={props.onNext}>
            {props.nextLabel ?? (hasOpinion(answer) ? 'Suivante' : 'Passer')}
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
