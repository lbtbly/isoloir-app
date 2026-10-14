// « À table » : le dépouillement, à voix haute. Une idée par écran, comme on lit les résultats d'un bureau de vote :
// en haut, sur le pastel de sa rubrique, ce que la table en pense ; au milieu, l'idée en grand ; dessous, les avis en
// bâtons, ou en mots aux deux bouts. Puis le récapitulatif, rubrique par rubrique. Jamais qui a voté quoi, aucun
// pourcentage, aucun candidat : les noms n'arrivent qu'après (« Qui porte ces idées ? »).

import { K_MIN, type IdeaResult, type Shown, type TableSummary, type Verdict } from '../../../core/table/count'
import { SECTION, shownText, verdictLine } from '../../../core/table/copy'
import type { Question, Topic } from '../../../core/types'
import { AiLabel } from '../../components/AiLabel'
import { Icon } from '../../components/Icon'
import { Tally } from '../../components/Tally'
import { ClosedFoot, ClosedHeader } from './Closed'

/** Ce qu'il faut savoir d'une question pour lire ses idées */
export interface ReadQuestion {
  question: Question
  topic: Topic | undefined
}

const textOf = (q: Question, id: string) => q.approaches.find(a => a.id === id)?.text ?? ''

/** Un compte : des bâtons au milieu, des mots aux deux bouts */
function Count({ value, what }: { value: Shown; what: string }) {
  if ('exact' in value) return <Tally count={value.exact} maxGroups={Infinity} label={`${what} : ${value.exact}`} />
  return <span class="is-words">{shownText(value)}</span>
}

function VerdictMark({ verdict }: { verdict: Verdict }) {
  // Les pictogrammes du site, et non les marques au stylo (components/Ink) : celles-ci sont réservées aux gestes de la
  // personne, et les importer ici ferait sortir du script principal des modules qu'il partage avec ce fichier
  if (verdict === 'reunit') return <Icon name="check" class="verdict-mark is-agree" />
  if (verdict === 'refuse') return <Icon name="cross" class="verdict-mark is-red" />
  return null
}

interface AloudProps {
  idea: IdeaResult
  read: ReadQuestion
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
}

export function Aloud({ idea, read, index, total, onPrev, onNext }: AloudProps) {
  const last = index === total - 1
  return (
    <div class="screen screen-aloud">
      <ClosedHeader where={`Idée ${index + 1} sur ${total}`} />
      <main class="sheet aloud" id="contenu" tabIndex={-1}>
        <div class={`aloud-band is-${idea.verdict}`}>
          <h1 class="aloud-verdict" tabIndex={-1}>
            <VerdictMark verdict={idea.verdict} />
            <span>{verdictLine(idea.verdict, idea.agree, idea.disagree)}</span>
          </h1>
          <p class="aloud-sub">
            {SECTION[idea.verdict]} · {idea.n} bulletins exprimés
          </p>
        </div>
        <p class="aloud-question">
          {read.topic?.label} · {read.question.prompt}
        </p>
        <AiLabel kind="feuille" more="seule" />
        <h2 class="aloud-idea">{textOf(read.question, idea.approachId)}</h2>
        {/* Deux colonnes seulement : avec « sans avis » et le nombre de bulletins exprimés, un compte écrit en mots se
            retrouverait par soustraction */}
        <table class="aloud-counts">
          <thead>
            <tr>
              <th scope="col">D’accord</th>
              <th scope="col">Pas d’accord</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Count value={idea.agree} what="D’accord" />
              </td>
              <td>
                <Count value={idea.disagree} what="Pas d’accord" />
              </td>
            </tr>
          </tbody>
        </table>
        {'exact' in idea.redLines || idea.redLines.words === 'presque-tous' ? (
          <p class="aloud-red">Dont lignes rouges&nbsp;: {shownText(idea.redLines)}</p>
        ) : null}
        <p class="aloud-note">Des mots plutôt que des nombres aux deux bouts&nbsp;: quand presque tout le monde vote pareil, un nombre exact dirait le vote de chacun.</p>
        <ol class="aloud-dots" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <li key={i} class={i === index ? 'is-current' : undefined} />
          ))}
        </ol>
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="Lire le dépouillement">
        <div class="action-bar-inner">
          {index > 0 ? (
            <button type="button" class="btn-text" onClick={onPrev}>
              <Icon name="arrow-left" />
              Précédente
            </button>
          ) : (
            <span />
          )}
          <span />
          <button type="button" class="btn-primary" onClick={onNext}>
            {last ? 'Récapitulatif' : 'Suivante'}
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}

interface RecapProps {
  summary: TableSummary
  reads: ReadonlyMap<string, ReadQuestion>
  voters: number
  /** Absent quand aucune idée n'a été dépouillée : il n'y a rien dont parler */
  onTalk?: () => void
  onReveal: () => void
  onBack: () => void
}

const SECTIONS: Exclude<Verdict, 'aucun'>[] = ['reunit', 'refuse', 'divise']

/** Le récapitulatif : les trois rubriques, l'une sous l'autre, puis les idées sans avis net et les questions cachées */
export function Recap({ summary, reads, voters, onTalk, onReveal, onBack }: RecapProps) {
  const questions = reads.size - summary.hidden.length
  return (
    <div class="screen screen-recap">
      <ClosedHeader where="Récapitulatif" />
      <main class="sheet" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Le dépouillement de la table
        </h1>
        <p class="lede">
          {voters} bulletins, {questions} {questions > 1 ? 'questions' : 'question'}. Sur chaque question, la table, ce sont ceux qui ont
          donné un avis.
        </p>
        <AiLabel kind="feuille" more="seule" />
        {SECTIONS.map(v => {
          const items = summary.ideas.filter(i => i.verdict === v)
          return (
            <section key={v} class={`recap-section is-${v}`} aria-labelledby={`recap-${v}`}>
              <h2 id={`recap-${v}`}>{SECTION[v]}</h2>
              {items.length ? (
                <ol>
                  {items.map(i => {
                    const r = reads.get(i.questionId)!
                    return (
                      <li key={`${i.questionId}:${i.approachId}`}>
                        <p class="recap-idea">{textOf(r.question, i.approachId)}</p>
                        <p class="recap-line">
                          {verdictLine(i.verdict, i.agree, i.disagree)} · {r.topic?.label}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p class="recap-line">
                  {v === 'reunit'
                    ? 'Aucune idée ne réunit plus de la moitié de la table. C’est fréquent : les avis se dispersent.'
                    : v === 'refuse'
                      ? 'Aucune idée n’est refusée par la plupart d’entre vous.'
                      : 'Aucune idée ne vous divise nettement.'}
                </p>
              )}
            </section>
          )
        })}
        {summary.quiet.length ? (
          <p class="recap-quiet">
            {summary.quiet.length} autres idées sans avis net de la table.
          </p>
        ) : null}
        {summary.hidden.map(id => (
          <p key={id} class="recap-hidden">
            {reads.get(id)?.topic?.label}&nbsp;: moins de {K_MIN} bulletins exprimés&nbsp;; pour garder le secret, rien n’est montré.
          </p>
        ))}
        <p class="small">Résultat de votre table, sans valeur statistique. Aucun pourcentage, aucun bulletin&nbsp;: seulement les totaux.</p>
        <p>
          <button type="button" class="btn-text" onClick={onBack}>
            <Icon name="arrow-left" />
            Relire le dépouillement depuis le début
          </button>
        </p>
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="Après le dépouillement">
        <div class="action-bar-inner">
          {onTalk ? (
            <button type="button" class="btn-text" onClick={onTalk}>
              En parler
            </button>
          ) : (
            <span />
          )}
          <span />
          <button type="button" class="btn-primary" onClick={onReveal}>
            Qui porte ces idées&nbsp;?
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
