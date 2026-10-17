// « Mon profil politique » : vos réponses sur l'échiquier, sujet par sujet, après le dépouillement complet. Pour chaque
// thème (ou sa famille, quand aucun de ses thèmes ne se lit seul) et chaque bloc de la grille des nuances du ministère
// de l'Intérieur : votre affinité moyenne avec ses candidats, en couleur, et vos réponses s'en rapprochent-elles
// nettement, s'en écartent-elles nettement, ou rien de net ? Le calcul (core/echiquier.ts) se fait sur l'appareil, sans
// IA, à l'affichage ; rien n'est enregistré, ni dans l'adresse.
// La page, sur toute la largeur comme le dépouillement : le titre, le chapeau (une lecture, pas un conseil de vote : le
// classement est dans Résultats), la mention IA et ce qui reste sur l'appareil en tête ; « Domaine par domaine », le
// graphique, une ligne par sujet sous son domaine (ui/profile/Chart.tsx) ; « À garder en tête » ; puis « Le détail, sujet
// par sujet », le tableau complet de chaque unité, replié, un fichier à part chargé à son ouverture
// (ui/profile/ProfileDetail.tsx).
// Ce que la page sait déjà de la feuille, posé sur les lignes sans rien changer aux lectures (lot 2, plan du 15 octobre
// 2026) : les lignes rouges que franchit chaque candidat, prises au dépouillement (results), qu'une ligne ouverte montre
// sous un bloc nettement plus près et que le détail dit sous l'approche rayée ; les thèmes prioritaires, comme au
// dépouillement, que dit la ligne fermée (« prioritaire »), le détail et la fiche « Pour lire plus de thèmes ».
// Ce qui pèse le plus dans une lecture nette (lot 3, ui/profile/Weigh.tsx, un fichier à part chargé après le premier
// affichage) : la fiche d'une ligne ouverte (ui/profile/Chart.tsx), et dans le détail, pour chaque suite de blocs
// nettement plus près, la même fiche, où l'approche citée est aussi l'approche principale de candidats, et la part de
// chaque question en points.
// Une lecture, pas une étiquette (DESIGN.md, The Reading Not Label Rule) : le sujet des phrases est toujours « vos
// réponses », les blocs sont attribués à « la grille » ; les blocs n'ont pas de couleur : chaque case prend celle de
// l'échelle d'affinité du site (décision du propriétaire du 12 octobre 2026), jamais seule, toujours avec le mot de son
// palier ; aucun symbole de lecture, les mots « nettement plus près » et « nettement plus loin » ; les pourcentages ne
// paraissent que dans « Le détail » et dans la liste d'une ligne ouverte ; ni point, ni moyenne entre thèmes, ni
// synthèse globale. Jamais sur l'affiche ni dans le PDF.
// Tant que la page ne s'affiche pas (core/profileAccess.ts : questionnaire rapide pas fini, ou aucun avis), une page
// d'attente : ce qui manque, en bâtons comme la fiche de la tendance, le bouton qui y ramène, puis un exemple fictif de la
// lecture (la grille de l'aperçu de l'accueil, avec ses mots) et ce qu'apporte ensuite « Approfondir ». Une fois la page
// affichée, tant que des thèmes ne se lisent pas seuls faute de questions, la fiche « Pour lire plus de thèmes » les
// nomme, dans le graphique (après les domaines, repliée ; sous le compte, ouverte, au seul questionnaire rapide) : chacun
// mène à « Approfondir », coché, comme « Approfondir ce thème » d'une ligne ; son adresse (#/approfondir/<thème>) y met
// le thème en tête, dit ce qui est coché, et la feuille commence par lui.
// Fichier à part du build, chargé à la demande (ui/profile/load.ts) ; la rubrique de la Méthode qui l'explique
// (ui/profile/MethodSection.tsx) en est un autre, sans la page ni son calcul.

import type { ComponentChildren } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { hasOpinion, priorityTopics } from '../../core/answers'
import { deeperTopics, echiquierCached, panelOf, readEchiquierAsync, type Echiquier, type UnitReading } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import { profileAccess } from '../../core/profileAccess'
import { PROFILE_PEEK } from '../../core/resultsCopy'
import { currentAnswers } from '../../core/revisions'
import type { Results } from '../../core/score'
import { excludedIds } from '../../core/score'
import { axisOf } from '../../core/spectrum'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { ProgressTally } from '../components/ProgressTally'
import { SiteFooter } from '../components/SiteFooter'
import { onDemand, useOnDemand } from '../lazy'
import { link } from '../nav'
import { Chart, Tile, type ProfileCtx } from '../profile/Chart'
import type { DetailAsk } from '../profile/ProfileDetail'
import { hitsOf } from '../profile/rows'
import '../../styles/profile.css'

/**
 * « Le détail, sujet par sujet » (ui/profile/ProfileDetail.tsx) : un fichier à part du build, chargé à la première
 * ouverture du tableau (son bouton, ou « Voir le détail » d'une ligne), comme « Ce qui pèse le plus » : la page reste
 * sous son plafond (tools/check-dist.mjs), et une visite qui ne l'ouvre pas ne le télécharge pas
 */
const detailModule = onDemand<typeof import('../profile/ProfileDetail')>(() => import('../profile/ProfileDetail'))

interface Props {
  pack: ElectionPack
  state: SessionState
  /** Les questions du questionnaire rapide, dans l'ordre de la feuille (pour reprendre là où l'on s'est arrêté) */
  essential: Question[]
  results: Results
  update: (patch: Partial<SessionState>) => void
}

export function Profile({ pack, state, essential, results, update }: Props) {
  const { election, bank, candidates } = pack
  const axis = axisOf(election) ?? []
  const answers = useMemo(() => currentAnswers(pack, state.answers), [pack, state.answers])
  // La règle de l'accueil et du dépouillement : toutes les questions du questionnaire rapide vues, et au moins un avis
  const access = profileAccess(bank.questions, essential, state.answers, answers, state.essentialDoneAt)
  const ready = access.state === 'pret'
  // « Approfondir ce thème » : le thème rejoint ceux déjà cochés dans « Approfondir » (le champ que la page écrit à chaque
  // case cochée ; rien n'est décoché, rien d'autre n'est enregistré)
  const deepen = (ids: string[]) => update({ deepTopics: [...new Set([...state.deepTopics, ...ids])] })

  const [held, setReading] = useState<Echiquier | null>(() => (ready ? echiquierCached(pack, answers) : null))
  // La lecture affichée est toujours celle des réponses courantes : quand elles changent (dans un autre onglet), celle
  // déjà calculée pour elles, sinon rien jusqu'à la nouvelle, jamais l'ancienne avec les nouvelles réponses (la page,
  // ses lignes ouvertes et leur fiche « Ce qui pèse le plus » les lisent ensemble)
  const reading = held && echiquierCached(pack, answers)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  useEffect(() => {
    if (!ready) return
    const known = echiquierCached(pack, answers)
    if (known) {
      setReading(known)
      setStatus(T.STATUS_READY)
      return
    }
    setReading(null)
    setStatus('')
    // Le statut ne paraît qu'au-delà de 300 ms, pour éviter un éclair (le calcul laisse passer cette minuterie, voir
    // readEchiquierAsync) ; la page se rend en une fois, une fois tout lu
    const ctrl = new AbortController()
    const slow = window.setTimeout(() => setBusy(true), 300)
    readEchiquierAsync(pack, answers, ctrl.signal).then(
      r => {
        window.clearTimeout(slow)
        setBusy(false)
        setReading(r)
        setStatus(T.STATUS_READY)
      },
      () => window.clearTimeout(slow),
    )
    return () => {
      ctrl.abort()
      window.clearTimeout(slow)
    }
  }, [pack, answers, ready])

  const ctx = useMemo<ProfileCtx>(() => {
    const blocs = new Map(election.spectrum?.blocs.map(b => [b.id, b]))
    const present = new Set(candidates.map(c => c.id))
    return {
      pack,
      axis,
      labels: axis.map(a => blocs.get(a.bloc)?.label ?? a.short),
      names: new Map(candidates.map(c => [c.id, c.name])),
      panel: panelOf(pack),
      unranked: new Set(results.unranked.map(r => r.candidateId)),
      answers,
      state,
      topicLabel: new Map(bank.topics.map(t => [t.id, t.label])),
      groups: pack.topicGroups?.length ? pack.topicGroups : bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] })),
      unscored: excludedIds(pack).filter(id => present.has(id)).length,
      deepen,
      hits: hitsOf(results),
      redLines: results.redLineCount > 0,
      priorities: new Set(priorityTopics(bank, state.answers, state.weights)),
      topicOf: new Map(bank.questions.map(q => [q.id, q.topicId])),
      topicOrder: bank.topics.map(t => t.id),
    }
  }, [pack, axis, election, candidates, results, answers, state, bank])

  const quickOnly = !bank.questions.some(q => q.tier !== 'essentiel' && hasOpinion(answers[q.id]))
  const deeper = useMemo(() => deeperTopics(pack, answers, state.answers), [pack, answers, state.answers])
  // Ce qui ne compte pas, dit par le compte de tête : les questions vues sans avis qui compte (passées, vues sans avis, à
  // revoir)
  const unseen = bank.questions.filter(q => state.answers[q.id] && !hasOpinion(answers[q.id])).length

  // « Voir le détail » d'une ligne : le tableau replié s'ouvre (son fichier se charge alors, s'il ne l'est pas), puis le
  // détail de l'unité, qui reçoit le focus
  const all = useRef<HTMLDetailsElement>(null)
  const [unfolded, setUnfolded] = useState(false)
  const [ask, setAsk] = useState<DetailAsk | null>(null)
  const openDetail = (u: UnitReading) => {
    setUnfolded(true)
    setAsk({ u })
    if (all.current) all.current.open = true
  }

  if (access.state !== 'pret') return <Waiting pack={pack} wait={access.state} seen={access.seen} total={access.total} left={access.left} added={access.added} href={access.href} />

  return (
    <Sheet
      pack={pack}
      bar={
        <nav class="action-bar" aria-label="Suite">
          <div class="action-bar-inner">
            <a class="btn-text" href={link('/resultats')}>
              <Icon name="arrow-left" />
              Résultats
            </a>
            <span />
            <a class="btn-primary" href={link('/proximite')}>
              Qui porte quoi
              <Icon name="arrow-right" />
            </a>
          </div>
        </nav>
      }
    >
      <div class="profile-intro">
        <Title />
        <div class="profile-intro-text">
          <p class="lede">
            {T.LEDE} {T.LEDE_VOTE[0]}
            <a href={link('/resultats')}>
              {T.LEDE_VOTE[1]}
              <Icon name="arrow-right" />
            </a>
          </p>
          {/* Les positions des candidats, résumées par IA, nourrissent tout le calcul, et les lignes ouvertes comme le
              détail citent les approches des questions, rédigées par IA : la mention vient en tête */}
          <AiLabel kind="approches" class="profile-ai" />
          <p class="profile-privacy">{T.PRIVACY}</p>
        </div>
      </div>

      {/* Lu par les lecteurs d'écran : « Lecture en cours » au-delà de 300 ms, puis « Lecture prête. », une fois */}
      <p class={busy ? 'small profile-status' : 'sr-only'} role="status">
        {busy ? T.STATUS_BUSY : status}
      </p>

      {reading ? <Chart reading={reading} ctx={ctx} quickOnly={quickOnly} deeper={deeper} unseen={unseen} onDetail={openDetail} /> : null}

      <section class="profile-keep" aria-labelledby="keep-title">
        <h2 id="keep-title">{T.CAVEATS_TITLE}</h2>
        <ul>
          {T.caveats(ctx.panel.flat().length).map(c => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p class="small">
          <a href={link('/methode/profil')}>{T.METHOD_LINK}</a>
        </p>
      </section>

      {reading ? (
        <section class="profile-detail" aria-labelledby="detail-title">
          <h2 id="detail-title">{T.DETAIL_TITLE}</h2>
          <p>{T.DETAIL_INTRO}</p>
          <details class="profile-all" ref={all} onToggle={e => (e.currentTarget as HTMLDetailsElement).open && setUnfolded(true)}>
            <summary>{T.detailShow(reading.themes.length, reading.families.length)}</summary>
            {unfolded ? <DetailLoaded reading={reading} ctx={ctx} ask={ask} /> : null}
          </details>
        </section>
      ) : null}
    </Sheet>
  )
}

/**
 * Le cadre des deux états de la page, la lecture et l'attente : l'en-tête du site, la feuille sur toute la largeur, le
 * pied de page ; bar, la barre du bas de la lecture
 */
function Sheet({ pack, bar, children }: { pack: ElectionPack; bar?: ComponentChildren; children: ComponentChildren }) {
  return (
    <div class="screen screen-wide screen-profile">
      <FormHeader title="Résultats" right={pack.election.shortName} />
      <main class="sheet wide-sheet profile-sheet" id="contenu" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      {bar}
    </div>
  )
}

/** Le titre de la page, qui reçoit le focus à l'arrivée */
const Title = () => (
  <h1 class="display is-medium" tabIndex={-1}>
    {T.PROFILE_TITLE}
  </h1>
)

/** Les cinq paliers de l'exemple, de « très éloigné » à « très proche » : une affinité au milieu de chacun */
const EXAMPLE_AFFINITY = [10, 30, 50, 70, 90]

/**
 * La page d'attente : la fiche d'état (comme « Où vous en êtes » de la tendance, dont elle reprend les styles), le bouton
 * qui ramène aux questions, puis l'exemple fictif, une grille de 3 sujets sur les 5 blocs, aux cases de la page et à leurs
 * mots, et ce qu'apporte ensuite « Approfondir »
 */
function Waiting({ pack, wait, seen, total, left, added, href }: { pack: ElectionPack; wait: T.WaitState; seen: number; total: number; left: number; added: boolean; href: string }) {
  const axis = axisOf(pack.election) ?? []
  const rows = [0, 1, 2].map(r => [...PROFILE_PEEK.slice(r * 5, r * 5 + 5)].map(Number))
  return (
    <Sheet pack={pack}>
      <div class="wait-hero">
        <div class="wait-intro">
          <Title />
          <p class="lede">
            {T.LEDE} {T.LEDE_WAIT}
          </p>
        </div>
        <section class="trend profile-wait" aria-labelledby="wait-title">
          <h2 id="wait-title" class="trend-title">
            <span class="trend-where">{T.WAIT_WHERE[wait]}</span>{' '}
            <span class="trend-count">
              <span class="trend-figure">{seen}</span> {T.waitCount(seen, total)}
            </span>
          </h2>
          <ProgressTally done={seen} total={total} />
          <p class="trend-text">{T.waitText(wait, total, left, added)}</p>
          <a class="btn-primary is-wide trend-cta" href={link(href)}>
            {T.waitCta(wait, left)}
            <Icon name="arrow-right" />
          </a>
        </section>
      </div>

      <section class="profile-example" aria-labelledby="example-title">
        <h2 id="example-title">{T.EXAMPLE_TITLE}</h2>
        <p class="ex-note">{T.EXAMPLE_NOTE}</p>
        {/* Une illustration, masquée aux lecteurs d'écran : la mention et la phrase des couleurs disent ce qu'elle montre */}
        <div class="ex-grid" aria-hidden="true">
          <div class="ex-head">
            <span />
            {axis.map(a => (
              <span key={a.bloc}>{a.short}</span>
            ))}
          </div>
          {rows.map((row, r) => (
            <div key={r} class="ex-row">
              <span class="ex-name">{T.exampleRow(r + 1)}</span>
              {row.map((d, b) => (
                <span key={b} class="ex-cell" data-bloc={axis[b]?.short}>
                  <Tile cell={{ affinity: EXAMPLE_AFFINITY[d - 1]!, mark: 'rien' }} />
                </span>
              ))}
            </div>
          ))}
        </div>
        <p class="ex-key">{T.KEY_TEXT}</p>
      </section>

      <p class="wait-deepen">
        <Icon name="deepen" />
        <span>{T.WAIT_DEEPEN}</span>
      </p>
    </Sheet>
  )
}

/** Le tableau du détail, dès que son fichier est là ; s'il n'a pas pu se charger (hors ligne sans copie), on le dit */
function DetailLoaded({ reading, ctx, ask }: { reading: Echiquier; ctx: ProfileCtx; ask: DetailAsk | null }) {
  const [detail, failed] = useOnDemand(detailModule.now, detailModule.load)
  if (detail) return <detail.DetailTable reading={reading} ctx={ctx} ask={ask} />
  return failed ? <p class="small">{T.DETAIL_FAILED}</p> : null
}
