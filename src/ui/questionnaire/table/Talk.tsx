// « À table » : « Vous voulez en parler ? », facultatif. L'idée qui divise (ou la plus soutenue), trois règles de
// table et la fiche « Comprendre l'enjeu » ; puis, si la table le veut, un nouveau tour de table sur cette question,
// et « Après en avoir parlé » : ce qui a bougé, en mots, sans jamais demander qui a changé d'avis.

import type { Shown } from '../../../core/table/count'
import { shownText, TALK_RULES } from '../../../core/table/copy'
import type { Question } from '../../../core/types'
import { AiLabel } from '../../components/AiLabel'
import { Icon } from '../../components/Icon'
import { Explainer } from '../Explainer'
import { ClosedFoot, ClosedHeader } from './Closed'

interface TalkProps {
  question: Question
  ideaText: string
  onRevote: () => void
  onBack: () => void
  onSkip: () => void
}

export function Talk({ question, ideaText, onRevote, onBack, onSkip }: TalkProps) {
  return (
    <div class="screen screen-talk">
      <ClosedHeader where="Facultatif" />
      <main class="sheet" id="contenu" tabIndex={-1}>
        <AiLabel kind="feuille" more="seule" />
        <h1 class="display is-medium" tabIndex={-1}>
          Vous voulez en parler&nbsp;?
        </h1>
        <p class="small">{question.prompt}</p>
        <p class="talk-idea">{ideaText}</p>
        <h2 class="q-prompt">Trois règles de table</h2>
        <ol class="talk-rules">
          {TALK_RULES.map(r => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        {question.explainer ? <Explainer data={question.explainer} ai="aucune" /> : null}
        <p>
          <button type="button" class="btn-text" onClick={onBack}>
            <Icon name="arrow-left" />
            Revenir au dépouillement
          </button>
        </p>
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="Parler de l’idée">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={onSkip}>
            Non merci
          </button>
          <span />
          <button type="button" class="btn-primary" onClick={onRevote}>
            Refaire un tour de table
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}

interface AfterProps {
  ideaText: string
  before: { agree: Shown; disagree: Shown }
  /** null : trop peu de bulletins exprimés au nouveau tour pour garder le secret */
  after: { agree: Shown; disagree: Shown } | null
  onReveal: () => void
}

const same = (a: Shown, b: Shown) => shownText(a) === shownText(b)

export function After({ ideaText, before, after, onReveal }: AfterProps) {
  const moved = !!after && (!same(before.agree, after.agree) || !same(before.disagree, after.disagree))
  return (
    <div class="screen screen-after">
      <ClosedHeader where="Nouveau tour de table" />
      <main class="sheet" id="contenu" tabIndex={-1}>
        <AiLabel kind="feuille" more="seule" />
        <h1 class="display is-medium" tabIndex={-1}>
          Après en avoir parlé
        </h1>
        <p class="talk-idea">{ideaText}</p>
        {after ? (
          <>
            <p class="q-prompt">{moved ? 'La table a bougé sur cette idée.' : 'La table tient ses positions, et elle en a parlé.'}</p>
            <table class="after-rows">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">Avant</th>
                  <th scope="col">Après</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">D’accord</th>
                  <td>{shownText(before.agree)}</td>
                  <td>{shownText(after.agree)}</td>
                </tr>
                <tr>
                  <th scope="row">Pas d’accord</th>
                  <td>{shownText(before.disagree)}</td>
                  <td>{shownText(after.disagree)}</td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <p class="q-prompt">Trop peu de bulletins à ce nouveau tour pour garder le secret&nbsp;: rien n’est montré.</p>
        )}
        <p class="small">Personne n’a à dire s’il a changé d’avis.</p>
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="Après en avoir parlé">
        <div class="action-bar-inner is-single">
          <button type="button" class="btn-primary is-wide" onClick={onReveal}>
            Qui porte ces idées&nbsp;?
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
