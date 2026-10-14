// « À table » (#/a-table) : l'enchaînement d'une séance. Tout vit dans la mémoire de cet écran, rien n'est écrit sur
// l'appareil : les totaux (des compteurs), le bulletin en cours (le temps d'un vote), la graine des tirages. De
// « Ouvrir l'urne » au geste confirmé « C'est mon téléphone », le mode est fermé : ni menu, ni lien, ni vidéo, et le
// geste retour ramène à la question précédente au lieu de quitter la table. Une marque dans l'historique survit au
// rechargement : la page rouverte dit que la table a été interrompue, sans jamais montrer la feuille du propriétaire.

import '../../styles/table.css'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { hasOpinion } from '../../core/answers'
import { downloadBlob } from '../../core/download'
import { freezePeriod, frozenAt } from '../../core/freeze'
import { newSeed, seededShuffle } from '../../core/rng'
import { addBallot, emptyTotals, MAX_PEOPLE, MIN_PEOPLE, summarize, type IdeaResult, type Totals } from '../../core/table/count'
import { pictureAlt, pictureFileName, pictureLines, renderTablePicture } from '../../core/table/image'
import { drawSubjects, tablePool } from '../../core/table/subjects'
import type { Answer, ElectionPack, Question } from '../../core/types'
import { LinksOff } from '../components/ExternalLink'
import { replace } from '../nav'
import type { Sheet as SheetScreen } from '../questionnaire/Sheet'
import { Aloud, Recap, type ReadQuestion } from '../questionnaire/table/Aloud'
import { ClosedFoot, ClosedHeader } from '../questionnaire/table/Closed'
import { Ended } from '../questionnaire/table/Ended'
import { Hub } from '../questionnaire/table/Hub'
import { Pass } from '../questionnaire/table/Pass'
import { Setup } from '../questionnaire/table/Setup'
import { After, Talk } from '../questionnaire/table/Talk'
import { marked, setTableLocked, TABLE_MARK, tableLocked } from './lock'
import { Picture } from './Picture'
import { Reveal } from './Reveal'

/** Sujets par séance : deux tirés au sort, de 2 à 4 */
const DRAW = 2
const MIN_SUBJECTS = 2
const MAX_SUBJECTS = 4

type Round = 1 | 2
type Phase =
  | { k: 'hub' }
  | { k: 'setup' }
  | { k: 'pass'; round: Round }
  | { k: 'ballot'; round: Round; q: number }
  | { k: 'cast'; round: Round }
  | { k: 'aloud'; i: number }
  | { k: 'recap' }
  | { k: 'talk' }
  | { k: 'after' }
  | { k: 'confirm-reveal' }
  | { k: 'reveal' }
  | { k: 'picture' }
  | { k: 'confirm-stop'; back: Phase }
  | { k: 'ended' }
  | { k: 'interrupted' }

const keyOf = (p: Phase) => ('q' in p ? `${p.k}:${p.round}:${p.q}` : 'i' in p ? `${p.k}:${p.i}` : 'round' in p ? `${p.k}:${p.round}` : p.k)

/** La marque de l'historique, posée ou retirée sur l'entrée courante */
function markEntry(on: boolean) {
  const state = { ...((history.state as Record<string, unknown> | null) ?? {}) }
  if (on) state[TABLE_MARK] = 1
  else delete state[TABLE_MARK]
  history.replaceState(state, '')
}

/**
 * La feuille est donnée par le site (src/app.tsx) plutôt qu'importée ici : elle mène aux vidéos, chargées à la demande,
 * et l'importer depuis ce fichier ferait sortir du script principal des modules qu'ils partagent (le build y verrait
 * une deuxième feuille de style, que tools/check-dist.mjs refuse)
 */
export function Table({ pack, Sheet }: { pack: ElectionPack; Sheet: typeof SheetScreen }) {
  const { bank, election, candidates, positions } = pack
  const topics = useMemo(() => new Map(bank.topics.map(t => [t.id, t])), [bank])
  const pool = useMemo(() => tablePool(pack), [pack])
  const [seed] = useState(() => newSeed())
  const [phase, setPhase] = useState<Phase>(() => (tableLocked() ? { k: 'interrupted' } : { k: 'hub' }))
  const [people, setPeople] = useState(6)
  const [chosen, setChosen] = useState<string[]>(() => drawSubjects(pool, seed, DRAW).map(q => q.id))
  const [setupStatus, setSetupStatus] = useState('')
  const [voted, setVoted] = useState(0)
  const [totals, setTotals] = useState<Totals>({})
  const [draft, setDraft] = useState<Record<string, Answer>>({})
  const [talkIdea, setTalkIdea] = useState<IdeaResult | null>(null)
  const [revote, setRevote] = useState<{ voted: number; totals: Totals } | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [picture, setPicture] = useState<{ blob: Blob; url: string; alt: string; height: number } | null>(null)

  const questions = useMemo(() => bank.questions.filter(q => chosen.includes(q.id)), [bank, chosen])
  const reads = useMemo(() => new Map<string, ReadQuestion>(questions.map(q => [q.id, { question: q, topic: topics.get(q.topicId) }])), [questions, topics])
  const summary = useMemo(() => summarize(totals, questions, seed), [totals, questions, seed])
  const talkQuestion = talkIdea ? questions.find(q => q.id === talkIdea.questionId) : undefined

  // ——— Le mode fermé ———
  const back = useRef<() => void>(() => {})
  const armed = useRef(false)
  const lockedNow = phase.k !== 'hub' && phase.k !== 'setup'
  useEffect(() => {
    if (!lockedNow) return
    setTableLocked(true)
    document.documentElement.classList.add('is-table-closed')
    // Le geste retour ramène en arrière dans la table : une entrée sentinelle, réarmée au prochain geste de la personne
    // (les navigateurs ignorent une entrée ajoutée sans geste)
    const arm = () => {
      if (armed.current) return
      history.pushState({ [TABLE_MARK]: 1 }, '', location.href)
      armed.current = true
    }
    // Seul un retour vers une entrée de la table est un geste retour : une adresse tapée ou un lien suivi arrive sur une
    // entrée sans marque, que le site ramène aussitôt sur la table (app.tsx) sans rien changer à l'étape
    const onPop = (e: PopStateEvent) => {
      if (!marked(e.state)) return
      armed.current = false
      back.current()
    }
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    // Une adresse tapée ou un lien gardé crée une entrée sans la marque (le site la ramène aussitôt sur la table) : on la
    // repose, pour qu'un rechargement trouve toujours la table verrouillée
    const onHash = () => markEntry(true)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onPop)
    window.addEventListener('beforeunload', onUnload)
    document.addEventListener('pointerdown', arm, true)
    document.addEventListener('keydown', arm, true)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('beforeunload', onUnload)
      document.removeEventListener('pointerdown', arm, true)
      document.removeEventListener('keydown', arm, true)
    }
  }, [lockedNow])

  const unlock = () => {
    setTableLocked(false)
    document.documentElement.classList.remove('is-table-closed')
    markEntry(false)
    replace('/')
  }

  // Une marque restée sur cette entrée d'une table déjà terminée (retour arrière après le déverrouillage) : on l'efface
  useEffect(() => {
    if (!tableLocked()) markEntry(false)
  }, [])

  // ——— Mesures de l'en-tête et de la barre, et focus sur le titre à chaque étape ———
  const first = useRef(true)
  const phaseKey = keyOf(phase)
  useEffect(() => {
    // La marque de l'historique, reposée à chaque étape tant que la table est fermée
    if (lockedNow) markEntry(true)
    const bar = document.querySelector<HTMLElement>('.action-bar')
    const header = document.querySelector<HTMLElement>('.form-header')
    const root = document.documentElement.style
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (bar?.isConnected) root.setProperty('--bar-real', `${bar.offsetHeight}px`)
      if (header?.isConnected) root.setProperty('--header-real', `${header.offsetHeight}px`)
    })
    if (bar) ro.observe(bar)
    if (header) ro.observe(header)
    if (!bar) root.setProperty('--bar-real', '0px')
    if (first.current) first.current = false
    else {
      window.scrollTo(0, 0)
      document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
    }
    return () => ro.disconnect()
  }, [phaseKey])

  // ——— L'image, fabriquée à l'accord de la table ———
  const frozen = frozenAt(election)
  useEffect(() => {
    if (phase.k !== 'picture' || !agreed || frozen || picture) return
    let alive = true
    const { lines, more } = pictureLines(summary, questions)
    renderTablePicture(election, lines, more)
      .then(({ blob, height }) => alive && setPicture({ blob, url: URL.createObjectURL(blob), alt: pictureAlt(lines, more), height }))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [phase.k, agreed, frozen, picture, summary, questions, election])
  useEffect(() => () => {
    if (picture) URL.revokeObjectURL(picture.url)
  }, [picture])

  // ——— Les gestes ———
  const open = () => {
    markEntry(true)
    setVoted(0)
    setTotals(emptyTotals(questions))
    setPhase({ k: 'pass', round: 1 })
  }
  // Un message refusé deux fois de suite est réannoncé : une espace insécable de plus suffit à le changer
  const refuse = (text: string) => {
    setSetupStatus(prev => (prev.trimEnd() === text ? (prev.endsWith('\u00a0') ? text : `${text}\u00a0`) : text))
    return false
  }
  const toggle = (id: string): boolean => {
    if (chosen.includes(id)) {
      if (chosen.length <= MIN_SUBJECTS) return refuse(`Gardez au moins ${MIN_SUBJECTS} sujets.`)
      setChosen(chosen.filter(x => x !== id))
    } else {
      if (chosen.length >= MAX_SUBJECTS) return refuse(`${MAX_SUBJECTS} sujets au plus.`)
      setChosen([...chosen, id])
    }
    setSetupStatus('')
    return true
  }
  const wipe = () => {
    setTotals({})
    setDraft({})
    setVoted(0)
    setRevote(null)
    setTalkIdea(null)
    setAgreed(false)
    setPicture(null)
    setPhase({ k: 'ended' })
  }
  /** Dépouiller : à voix haute s'il y a des idées à lire, sinon le récapitulatif */
  const count = () => setPhase(summary.ideas.length ? { k: 'aloud', i: 0 } : { k: 'recap' })
  const ballotQuestions = (round: Round): Question[] => (round === 2 && talkQuestion ? [talkQuestion] : questions)
  const castBallot = (round: Round) => {
    const qs = ballotQuestions(round)
    const ballot = Object.fromEntries(qs.map(q => [q.id, draft[q.id]]))
    if (round === 1) {
      setTotals(t => addBallot(t, qs, ballot))
      setVoted(v => v + 1)
    } else setRevote(r => (r ? { voted: r.voted + 1, totals: addBallot(r.totals, qs, ballot) } : r))
    // Le bulletin est oublié dès qu'il est compté
    setDraft({})
    setPhase({ k: 'cast', round })
  }
  const startTalk = () => {
    setTalkIdea(summary.ideas.find(i => i.verdict === 'divise') ?? summary.ideas[0] ?? summary.quiet[0] ?? null)
    setPhase({ k: 'talk' })
  }

  // Le geste retour, selon l'étape
  back.current = () => {
    if (phase.k === 'ballot') setPhase(phase.q > 0 ? { ...phase, q: phase.q - 1 } : { k: 'pass', round: phase.round })
    else if (phase.k === 'aloud' && phase.i > 0) setPhase({ k: 'aloud', i: phase.i - 1 })
    else if (phase.k === 'recap' || phase.k === 'talk' || phase.k === 'confirm-reveal') setPhase(phase.k === 'recap' && summary.ideas.length ? { k: 'aloud', i: summary.ideas.length - 1 } : { k: 'recap' })
    else if (phase.k === 'picture') setPhase({ k: 'reveal' })
    else if (phase.k === 'confirm-stop') setPhase(phase.back)
  }

  // ——— Les écrans ———
  // En mode fermé, aucune source ne s'ouvre ailleurs : elles restent écrites, en texte (components/ExternalLink.tsx)
  return <LinksOff.Provider value={lockedNow}>{screen()}</LinksOff.Provider>

  function screen() {
    switch (phase.k) {
      case 'hub':
        return <Hub onStart={() => setPhase({ k: 'setup' })} />
      case 'setup':
        return (
          <Setup
            people={people}
            setPeople={n => setPeople(Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, n)))}
            pool={pool}
            topics={topics}
            chosen={chosen}
            toggle={toggle}
            min={MIN_SUBJECTS}
            max={MAX_SUBJECTS}
            status={setupStatus}
            onOpen={open}
            onBack={() => setPhase({ k: 'hub' })}
          />
        )
      case 'pass':
      case 'cast': {
        const round = phase.round
        const done = round === 1 ? voted : (revote?.voted ?? 0)
        const expected = round === 1 ? people : voted
        return (
          <Pass
            phase={phase.k}
            voted={done}
            people={expected}
            onTake={() => {
              if (phase.k === 'pass') {
                // Chaque bulletin part d'une feuille vide : un bulletin entamé puis abandonné n'est jamais montré au suivant
                setDraft({})
                return setPhase({ k: 'ballot', round, q: 0 })
              }
              if (done < expected) return setPhase({ k: 'pass', round })
              if (round === 1) count()
              else setPhase({ k: 'after' })
            }}
            onArrive={round === 1 && people < MAX_PEOPLE ? () => setPeople(p => Math.min(MAX_PEOPLE, p + 1)) : undefined}
            onCountNow={
              round === 1
                ? () => {
                    setPeople(voted)
                    count()
                  }
                : () => setPhase({ k: 'after' })
            }
            countNow={
              round === 1
                ? undefined
                : { label: 'Il manque quelqu’un\u00a0? Voir ce qui a bougé', from: 1 }
            }
            onCancel={
              round === 2
                ? {
                    label: 'Annuler le nouveau tour de table',
                    action: () => {
                      setRevote(null)
                      setPhase({ k: 'recap' })
                    },
                  }
                : undefined
            }
            onStop={() => setPhase({ k: 'confirm-stop', back: phase })}
          />
        )
      }
      case 'ballot': {
        const qs = ballotQuestions(phase.round)
        const q = qs[phase.q]!
        const voter = phase.round === 1 ? voted : (revote?.voted ?? 0)
        const last = phase.q === qs.length - 1
        const answer = draft[q.id]
        return (
          <Sheet
            key={`${phase.round}:${voter}:${q.id}`}
            title="À table"
            question={q}
            approaches={seededShuffle(q.approaches, `${seed}:${phase.round}:${q.id}:${voter}`)}
            topic={topics.get(q.topicId)}
            index={phase.q}
            total={qs.length}
            answered={qs.filter(x => hasOpinion(draft[x.id])).length}
            answer={answer}
            onChange={a => setDraft(d => ({ ...d, [q.id]: a }))}
            onNext={() => (last ? castBallot(phase.round) : setPhase({ ...phase, q: phase.q + 1 }))}
            onBack={back.current}
            nextLabel={last ? (hasOpinion(answer) ? 'Glisser dans l’urne' : 'Je passe et je glisse dans l’urne') : hasOpinion(answer) ? 'Question suivante' : 'Je passe'}
            closed={{
              header: (
                <ClosedHeader
                  where={
                    <span class="locator">
                      <span class="locator-topic">{phase.round === 2 ? 'Nouveau tour de table' : 'Votre bulletin'}</span>
                      <span class="locator-count" aria-hidden="true">
                        {phase.q + 1}/{qs.length}
                      </span>
                      <span class="sr-only">
                        Question {phase.q + 1} sur {qs.length}
                      </span>
                    </span>
                  }
                />
              ),
              foot: <ClosedFoot />,
            }}
          />
        )
      }
      case 'aloud': {
        const idea = summary.ideas[phase.i]
        if (!idea) return <Recap summary={summary} reads={reads} voters={voted} onTalk={summary.ideas.length || summary.quiet.length ? startTalk : undefined} onReveal={() => setPhase({ k: 'confirm-reveal' })} onBack={count} />
        return (
          <Aloud
            idea={idea}
            read={reads.get(idea.questionId)!}
            index={phase.i}
            total={summary.ideas.length}
            onPrev={() => phase.i > 0 && setPhase({ k: 'aloud', i: phase.i - 1 })}
            onNext={() => setPhase(phase.i + 1 < summary.ideas.length ? { k: 'aloud', i: phase.i + 1 } : { k: 'recap' })}
          />
        )
      }
      case 'recap':
        return <Recap summary={summary} reads={reads} voters={voted} onTalk={summary.ideas.length || summary.quiet.length ? startTalk : undefined} onReveal={() => setPhase({ k: 'confirm-reveal' })} onBack={count} />
      case 'talk':
        if (!talkIdea || !talkQuestion) return <Recap summary={summary} reads={reads} voters={voted} onTalk={summary.ideas.length || summary.quiet.length ? startTalk : undefined} onReveal={() => setPhase({ k: 'confirm-reveal' })} onBack={count} />
        return (
          <Talk
            question={talkQuestion}
            ideaText={talkQuestion.approaches.find(a => a.id === talkIdea.approachId)?.text ?? ''}
            onBack={() => setPhase({ k: 'recap' })}
            onSkip={() => setPhase({ k: 'confirm-reveal' })}
            onRevote={() => {
              setRevote({ voted: 0, totals: emptyTotals([talkQuestion]) })
              setPhase({ k: 'pass', round: 2 })
            }}
          />
        )
      case 'after': {
        if (!talkIdea || !talkQuestion || !revote) return null
        const again = summarize(revote.totals, [talkQuestion], seed)
        const now = [...again.ideas, ...again.quiet].find(i => i.approachId === talkIdea.approachId)
        return (
          <After
            ideaText={talkQuestion.approaches.find(a => a.id === talkIdea.approachId)?.text ?? ''}
            before={{ agree: talkIdea.agree, disagree: talkIdea.disagree }}
            after={now ? { agree: now.agree, disagree: now.disagree } : null}
            onReveal={() => setPhase({ k: 'confirm-reveal' })}
          />
        )
      }
      case 'confirm-reveal':
        return (
          <Confirm
            where="Les noms"
            title="Découvrir qui porte ces idées ?"
            text="Après, on ne pourra plus voter à cette table : les noms changeraient le vote."
            yes="Découvrir qui porte ces idées"
            onYes={() => setPhase({ k: 'reveal' })}
            onNo={() => setPhase({ k: 'recap' })}
          />
        )
      case 'reveal':
        return (
          <Reveal
            questions={questions}
            people={seededShuffle(candidates, `${seed}:people`)}
            positions={positions}
            verdicts={new Map([...summary.ideas, ...summary.quiet].map(i => [`${i.questionId}:${i.approachId}`, i.verdict]))}
            onPicture={() => setPhase({ k: 'picture' })}
            onEnd={() => setPhase({ k: 'confirm-stop', back: phase })}
          />
        )
      case 'picture':
        return (
          <Picture
            frozen={frozen ? freezePeriod(frozen) : null}
            agreed={agreed}
            ready={!!picture}
            onAgree={() => setAgreed(true)}
            onRefuse={() => setPhase({ k: 'reveal' })}
            preview={
              picture ? (
                <figure class="table-picture-preview">
                  <img src={picture.url} alt={picture.alt} width={1080} height={picture.height} />
                </figure>
              ) : null
            }
            onDownload={() => picture && downloadBlob(picture.blob, pictureFileName(election))}
            onEnd={() => setPhase({ k: 'confirm-stop', back: phase })}
          />
        )
      case 'confirm-stop':
        return (
          <Confirm
            where="Effacer"
            title="Effacer la table ?"
            text="Les bulletins et le dépouillement de cette table seront effacés. La feuille du propriétaire du téléphone n’est pas touchée."
            yes="Effacer la table"
            onYes={wipe}
            onNo={() => setPhase(phase.back)}
          />
        )
      case 'ended':
        return <Ended kind="ended" onUnlock={unlock} />
      case 'interrupted':
        return <Ended kind="interrupted" onUnlock={unlock} />
    }
  }
}

/** Une confirmation, en mode fermé : un écran à elle, le choix sûr à côté du choix définitif */
function Confirm({ where, title, text, yes, onYes, onNo }: { where: string; title: string; text: string; yes: string; onYes: () => void; onNo: () => void }) {
  return (
    <div class="screen screen-table-confirm">
      <ClosedHeader where={where} />
      <main class="sheet ended" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          {title}
        </h1>
        <div class="consent" role="group" aria-label={title}>
          <p>{text}</p>
          <div class="consent-actions">
            <button type="button" class="btn-primary" onClick={onYes}>
              {yes}
            </button>
            <button type="button" class="btn-text" onClick={onNo}>
              Annuler
            </button>
          </div>
        </div>
      </main>
      <ClosedFoot />
    </div>
  )
}
