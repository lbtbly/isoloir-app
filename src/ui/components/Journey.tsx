// Le parcours en trois gestes, sur un exemple fictif : votre avis (1) se dépouille en direct (2)
// et s'imprime sur l'affiche (3). Un seul geste, trois réponses. Le score est calculé par le vrai
// moteur sur un mini-pack d'exemple ; les « candidats » sont inventés et la question ne fait pas
// partie du questionnaire : aucune influence sur les vraies réponses.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { affinityBand } from '../../core/affinity'
import { EMPTY_ANSWER, hasOpinion, ratingOf, withRating, withRedLine } from '../../core/answers'
import { computeResults, displayScore, strokesFor, type CandidateResult } from '../../core/score'
import type { Answer, ElectionPack, Position, Rating } from '../../core/types'
import { Icon } from './Icon'
import { InkCross } from './Ink'
import { RatingRuler, RulerLegend } from './RatingRuler'
import { Tally } from './Tally'

const src = [{ title: 'Exemple fictif', url: 'https://example.org/' }]
const p = (weight: 1 | 2): Position => ({ weight, nature: 'proposition', confidence: 'high', summary: 'Exemple', sources: src })
const rejects: Position = { rejects: true, nature: 'declaration', confidence: 'high', summary: 'Exemple', sources: src }

const DEMO: ElectionPack = {
  election: {
    id: 'demo',
    name: 'Exemple',
    shortName: 'Exemple',
    organizers: [],
    rounds: [],
    dataVersion: '1',
    dataFrozenAt: '2026-10-02',
    finalists: null,
    notes: [],
    changelog: [],
  },
  candidates: [
    { id: 'c1', name: 'Candidat 1', initials: 'C1', affiliation: 'fictif', role: '' },
    { id: 'c2', name: 'Candidat 2', initials: 'C2', affiliation: 'fictif', role: '' },
    { id: 'c3', name: 'Candidat 3', initials: 'C3', affiliation: 'fictif', role: '' },
  ],
  bank: {
    topics: [{ id: 'ecole', label: 'École', description: '' }],
    questions: [
      {
        id: 'demo-1',
        topicId: 'ecole',
        tier: 'essentiel',
        prompt: 'Comment organiser la semaine des écoliers ?',
        approaches: [
          { id: 'a', text: 'Passer à quatre jours et demi de classe' },
          { id: 'b', text: 'Garder la semaine de quatre jours' },
          { id: 'c', text: 'Laisser chaque commune décider' },
        ],
      },
    ],
  },
  positions: {
    c1: { a: p(2) },
    c2: { b: p(2), c: p(1) },
    c3: { c: p(2), a: rejects },
  },
}

const LETTERS = 'ABC'
/** Ce que porte chaque candidat fictif, révélé au dépouillement */
const HOLDS: Record<string, string> = {
  c1: 'porte A',
  c2: 'porte B, compatible avec C',
  c3: 'porte C, rejette A',
}
const nameOf = (id: string) => DEMO.candidates.find(c => c.id === id)!.name

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Pourcentage qui roule jusqu'à sa nouvelle valeur (instantané sous mouvement réduit) */
function Rolling({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (reducedMotion()) {
      setShown(value)
      from.current = value
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 420)
      const eased = 1 - Math.pow(1 - k, 3)
      setShown(Math.round(a + (value - a) * eased))
      if (k < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{shown}</>
}

export function Journey() {
  const q = DEMO.bank.questions[0]!
  const [answer, setAnswer] = useState<Answer>(EMPTY_ANSWER)
  const [last, setLast] = useState<string | null>(null)
  const panels = [useRef<HTMLElement>(null), useRef<HTMLElement>(null), useRef<HTMLElement>(null)]

  const results = useMemo(() => computeResults(DEMO, { [q.id]: answer }, {}, 'demo'), [answer, q.id])
  const counted = hasOpinion(answer)
  const ranking = results.ranking
  const leader = ranking[0]

  const rate = (id: string, v: Rating | 0) => {
    setLast(`rate:${id}`)
    setAnswer(withRating(answer, id, v))
  }
  const toggleRedLine = (id: string) => {
    setLast(`red:${id}`)
    setAnswer(withRedLine(answer, id, !answer.redLines.includes(id)))
  }
  const show = (i: number) =>
    panels[i]?.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })

  const pct = (r: CandidateResult) => displayScore(r.rawScore) ?? 0
  // Clé de l'affiche : elle se « réimprime » à chaque changement de classement ou de score
  const posterKey = ranking.map(r => `${r.candidateId}${pct(r)}${r.compatible ? '' : 'x'}`).join('-')

  return (
    <section class="journey" aria-labelledby="journey-title">
      <h2 id="journey-title" class="section-title">
        À vous d’essayer<span class="sr-only"> : les trois gestes, sur un exemple fictif</span>
      </h2>
      {/* Sur téléphone, les panneaux défilent au doigt : ces repères y mènent aussi d'un toucher */}
      <ol class="journey-steps" aria-label="Aller à un geste">
        {['Votre avis', 'Le dépouillement', 'L’affiche'].map((t, i) => (
          <li key={t}>
            <button type="button" class={`step-chip is-${i + 1}`} onClick={() => show(i)}>
              <span class="step-n">{i + 1}</span>
              {t}
            </button>
          </li>
        ))}
      </ol>
      <div class="journey-track">
        <article class="journey-panel is-avis" ref={panels[0]} aria-labelledby="jp1">
          <h3 id="jp1" class="panel-head">
            <span class="panel-n">1</span> Vous donnez votre avis
          </h3>
          <p class="panel-tag">
            <Icon name="info" />
            Exemple fictif : il ne compte pas et ne concerne aucun candidat réel.
          </p>
          <p class="panel-prompt">{q.prompt}</p>
          <div class="answers">
            <RulerLegend />
            <ol class="approaches" aria-label="Approches de l’exemple">
              {q.approaches.map((a, i) => {
                const value = ratingOf(answer, a.id)
                const redLine = answer.redLines.includes(a.id)
                return (
                  <li key={a.id} class={`approach${value ? ' is-rated' : ''}${redLine ? ' is-rejected' : ''}`}>
                    <span class="approach-letter" aria-hidden="true">
                      {LETTERS[i]}
                    </span>
                    <div class="approach-body">
                      <p class="approach-text" id={`demo-at-${a.id}`}>
                        <span class="inline-letter" aria-hidden="true">
                          {LETTERS[i]}
                        </span>
                        {a.text}
                      </p>
                      <div class="ruler-row">
                        <RatingRuler
                          name={`demo-${a.id}`}
                          label={`Votre avis sur l’approche ${LETTERS[i]} de l’exemple`}
                          describedBy={`demo-at-${a.id}`}
                          value={value}
                          onChange={v => rate(a.id, v)}
                          draw={last === `rate:${a.id}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      class="approach-reject"
                      aria-pressed={redLine}
                      aria-label={`Ligne rouge : approche ${LETTERS[i]} de l’exemple`}
                      aria-describedby={`demo-at-${a.id}`}
                      onClick={() => toggleRedLine(a.id)}
                    >
                      <span class="box">{redLine ? <InkCross draw={last === `red:${a.id}`} /> : null}</span>
                      <span class="reject-label" aria-hidden="true">
                        Ligne rouge
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
          {counted ? (
            <button type="button" class="btn-text journey-next" onClick={() => show(1)}>
              Voir le dépouillement
              <Icon name="arrow-right" />
            </button>
          ) : (
            <p class="panel-hint">Touchez un cran : le dépouillement se fait à côté, en direct.</p>
          )}
        </article>

        <article class="journey-panel is-depouillement" ref={panels[1]} aria-labelledby="jp2">
          <h3 id="jp2" class="panel-head">
            <span class="panel-n">2</span> On dépouille
          </h3>
          {counted ? (
            <>
              <ol class="jr-list" aria-label="Dépouillement de l’exemple">
                {ranking.map((r, i) => {
                  const b = affinityBand(r.rawScore)
                  return (
                    <li key={r.candidateId} class={`jr-row${r.compatible ? '' : ' is-flagged'}`}>
                      <span class="jr-rank" aria-hidden="true">
                        {r.rank}
                      </span>
                      <span class="jr-who">
                        <span class="jr-name">
                          {nameOf(r.candidateId)}
                          {!r.compatible ? (
                            <>
                              <Icon name="cross" class="flag-mark" />
                              <span class="sr-only"> (franchit votre ligne rouge)</span>
                            </>
                          ) : null}
                        </span>
                        <span class="jr-holds">{HOLDS[r.candidateId]}</span>
                      </span>
                      <span class={`jr-pct${b ? ` aff-${b.key}` : ''}`}>
                        <Rolling value={pct(r)} />
                        <span class="pv-unit">%</span>
                        {b ? <span class="jr-band">{b.label}</span> : null}
                      </span>
                      <Tally
                        count={strokesFor(r.rawScore)}
                        maxGroups={Infinity}
                        drawAll
                        delay={i * 160}
                        muted={!r.compatible}
                        label={`${pct(r)} %, soit ${strokesFor(r.rawScore)} bâtons`}
                      />
                    </li>
                  )
                })}
              </ol>
              <p class="sr-only" role="status">
                {leader ? `${nameOf(leader.candidateId)} en tête, à ${pct(leader)} %` : ''}
              </p>
              <p class="panel-hint">Chaque bâton vaut 5 points. Au vrai dépouillement, chaque position est sourcée.</p>
            </>
          ) : (
            <div class="panel-empty">
              <Tally count={0} label="" />
              <p>Les bâtons des trois candidats fictifs se comptent ici dès votre premier avis.</p>
            </div>
          )}
        </article>

        <article class="journey-panel is-affiche" ref={panels[2]} aria-labelledby="jp3">
          <h3 id="jp3" class="panel-head">
            <span class="panel-n">3</span> Vous gardez votre affiche
          </h3>
          <div class={`poster${counted ? '' : ' is-blank'}`} key={counted ? posterKey : 'blank'} aria-label="Aperçu de l’affiche">
            <p class="poster-brand">Isoloir · exemple fictif</p>
            <p class="poster-title">Mon dépouillement</p>
            <ol class="poster-list">
              {ranking.map(r => (
                <li key={r.candidateId}>
                  <span class="poster-rank">{counted ? r.rank : '–'}</span>
                  <span class="poster-name">{nameOf(r.candidateId)}</span>
                  <span class="poster-pct">{counted ? `${pct(r)} %` : '… %'}</span>
                </li>
              ))}
            </ol>
            <p class="poster-foot">Fabriquée sur cet appareil. Rien n’a été envoyé.</p>
          </div>
          <p class="panel-hint">
            À la fin du vrai questionnaire, votre affiche se télécharge ou se partage : elle montre des pourcentages, jamais
            vos réponses.
          </p>
        </article>
      </div>
    </section>
  )
}
