// Le lecteur des vidéos « Les sujets », à la TikTok.
//
// Téléphone, et toute fenêtre de moins de 48rem de large ou de 36rem de haut (téléphone couché, zoom fort) :
// plein écran. Tablette et ordinateur : une popin au format 9:16 sur un fond noir translucide et flouté ; la page
// dessous est inerte (dialog modal). Un clic sur ce fond ferme la popin ; en plein écran, les marges ne ferment
// rien. Panneau ouvert : un clic hors de lui le ferme, lui seul.
// Historique (history.ts) : l'ouverture ajoute une entrée, à la même adresse ; « retour » (bouton, geste) ferme
// le lecteur au lieu de quitter la page. Quitter par un lien vers une fiche garde la vidéo et le passage dans
// cette entrée (onLeave) : le retour rouvre le lecteur là où on l'avait laissé (Host.tsx).
// Le fil : les séries à la suite, famille de thèmes après famille ; dans une série, l'introduction puis ses
// approfondissements ; pour une famille qui n'a pas encore de série, une carte « pas encore de vidéo ».
// Glisser vers le haut : vidéo suivante de la série, puis série suivante ; vers le bas : précédente
// (défilement aimanté). Chaque vidéo porte son repère (« Retraites · 1 sur 4 — Âge de départ ») : le toucher
// ouvre le sommaire de la série. En haut, les catégories (familles) : l'onglet courant suit la vidéo ; glisser de
// côté ou toucher un onglet mène à la première série de la famille ; « Catégories » ouvre la liste des familles
// et de leurs séries.
// Son : une seule voix de synthèse ; la commande « Son » de chaque vidéo (ou la touche M) la coupe ou la remet,
// pour toutes les vidéos. L'hôte du lecteur tient ce réglage pour la visite, sans rien retenir sur l'appareil.
// Une voix qui manque pour un passage le laisse en sous-titres seuls (narration.ts).
// Clavier : ↑ ↓ (ou Page précédente / suivante) vidéo, ← → catégorie, Espace pause, Échap ferme ; M coupe ou
// remet la voix et S ouvre le sommaire, quand le focus est dans la vidéo (raccourcis à une lettre limités au
// lecteur, WCAG 2.1.4). Une seule vidéo joue : la visible. On la met en pause quand on la quitte, elle reprend au
// retour.

import type { ComponentChildren } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { QuestionBank, Topic, TopicGroup } from '../../core/types'
import { AiNote } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { formatDate } from '../format'
import { stopAudio, unlockAudio, videoSeconds, voiceOf, voicedCount } from './audio'
import { Glyph } from './Glyph'
import { LECTEUR, isPlayerEntry } from './history'
import { durationLabel, markerOf, partOf, placeOf } from './model'
import { PISTE } from './pistes'
import type { VideoContext, VideoMeta, VideoScript, VideoSegment, VideoSeries } from './types'
import { Video, type VideoApi } from './Video'
import { link } from '../nav'
import '../../styles/videos.css'

interface Props {
  series: VideoSeries[]
  bank: QuestionBank
  groups: TopicGroup[]
  /** Identifiant de la vidéo à montrer en premier (« retraites-intro ») */
  start?: string
  /** Où les vidéos sont regardées : « site » (défaut) n'invite pas à donner son avis en fin de vidéo */
  context?: VideoContext
  /** L'entrée d'historique courante est déjà celle du lecteur (retour d'une fiche, lien direct) : rien à ajouter */
  resume?: boolean
  /** Passage où reprendre la vidéo de départ (retour d'une fiche) */
  startSegment?: number
  /** Le son voulu ou coupé (réglage de la visite, tenu par l'hôte) */
  voiceOn: boolean
  onVoiceChange: (on: boolean) => void
  onClose: () => void
  /** On quitte le lecteur par un lien vers une fiche : la vidéo et le passage à retrouver au retour */
  onLeave?: (videoId: string, segment: number) => void
}

interface SeriesPlace {
  series: VideoSeries
  /** Entrée de son introduction dans le fil */
  first: number
}

interface Family {
  id: string
  label: string
  topics: Topic[]
  series: SeriesPlace[]
  /** Première entrée de la famille dans le fil */
  first: number
  /** Une question de la famille, pour mener à ses fiches */
  sample?: string
}

type Entry =
  | { kind: 'video'; key: string; family: Family; series: SeriesPlace; script: VideoScript; meta: VideoMeta }
  | { kind: 'empty'; key: string; family: Family }

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
/** Même requête que la popin de videos.css : seul ce cas montre le fond sombre qu'on touche pour fermer */
const POPIN = '(min-width: 48rem) and (min-height: 36rem)'
const isPopin = () => typeof matchMedia !== 'undefined' && matchMedia(POPIN).matches
/** Libellé de source ou date en milieu de phrase : minuscule initiale, sauf sigle (« COR ») */
const lowerFirst = (s: string) => (/^\p{Lu}\p{Ll}/u.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s)
const plural = (n: number, word: string) => `${n}\u00a0${word}${n > 1 ? 's' : ''}`
const dateOf = (d?: string) => (d ? (/^\d{4}-\d{2}(-\d{2})?$/.test(d) ? formatDate(d) : d) : '')
const seriesSeconds = (s: VideoSeries) => s.videos.reduce((t, v) => t + videoSeconds(v), 0)

/** Le fil : chaque famille dans l'ordre éditorial, ses séries dans l'ordre de ses thèmes, chaque série en entier */
function buildFeed(all: VideoSeries[], bank: QuestionBank, groups: TopicGroup[]) {
  const families: Family[] = []
  const entries: Entry[] = []
  for (const g of groups) {
    const topics = g.topicIds.map(id => bank.topics.find(t => t.id === id)).filter((t): t is Topic => !!t)
    const mine = all
      .filter(s => g.topicIds.includes(s.topicId) && s.videos.length)
      .sort((a, b) => g.topicIds.indexOf(a.topicId) - g.topicIds.indexOf(b.topicId))
    const sample = bank.questions.find(q => g.topicIds.includes(q.topicId) && q.explainer)?.id
    const family: Family = { id: g.id, label: g.label, topics, series: [], first: entries.length, sample }
    families.push(family)
    if (!mine.length) entries.push({ kind: 'empty', key: `vide-${g.id}`, family })
    for (const series of mine) {
      const place: SeriesPlace = { series, first: entries.length }
      family.series.push(place)
      for (const script of series.videos) {
        const { part, of } = partOf(series, script)
        const only = script.questionIds.length === 1 ? bank.questions.find(q => q.id === script.questionIds[0]) : undefined
        const meta: VideoMeta = {
          topic: bank.topics.find(t => t.id === series.topicId)?.label ?? series.label,
          family: g.label,
          part,
          of,
          marker: markerOf(series, script),
          prompt: only?.prompt ?? '',
        }
        entries.push({ kind: 'video', key: script.id, family, series: place, script, meta })
      }
    }
  }
  return { families, entries }
}

export function VideoPlayer({
  series,
  bank,
  groups,
  start,
  context = 'site',
  resume = false,
  startSegment,
  voiceOn,
  onVoiceChange,
  onClose,
  onLeave,
}: Props) {
  const { families, entries } = useMemo(() => buildFeed(series, bank, groups), [series, bank, groups])
  const startIndex = Math.max(0, entries.findIndex(e => e.kind === 'video' && e.script.id === start))
  const anyVoice = useMemo(() => series.some(s => s.videos.some(v => voicedCount(v) > 0)), [series])

  const [active, setActive] = useState(startIndex)
  const [playing, setPlaying] = useState(true)
  const [sheet, setSheet] = useState<null | 'sources' | 'cats' | 'toc'>(null)
  const [hidden, setHidden] = useState(false)
  const [still, setStill] = useState(reducedMotion)
  const [slide, setSlide] = useState<'' | 'from-right' | 'from-left'>('')
  const [said, setSaid] = useState('')
  // Vidéo choisie dans un panneau : si elle était finie, elle repart du début (compteur : chaque choix compte)
  const [rewind, setRewind] = useState({ index: -1, n: 0 })

  const dialog = useRef<HTMLDialogElement>(null)
  const feed = useRef<HTMLDivElement>(null)
  const tabs = useRef<HTMLUListElement>(null)
  const sheetHead = useRef<HTMLHeadingElement>(null)
  const sheetReturn = useRef<HTMLElement | null>(null)
  const api = useRef<VideoApi | null>(null)
  // Le clic a commencé sur le fond (et pas sur une commande dont on aurait glissé)
  const downOnBackdrop = useRef(false)
  // Valeurs lues par les écouteurs posés une fois
  const now = useRef({ active, sheet, still })
  now.current = { active, sheet, still }

  const entry = entries[active]!
  const familyIndex = families.findIndex(f => f.id === entry.family.id)

  const describe = (i: number) => {
    const e = entries[i]
    if (!e) return ''
    const where = `${i + 1} sur ${entries.length} dans le fil`
    return e.kind === 'video'
      ? `${e.meta.marker}\u00a0: ${e.script.title} (${where})`
      : `${e.family.label}\u00a0: pas encore de vidéo (${where})`
  }

  /** Va à une entrée du fil ; « slide » : changement de catégorie, glissé de côté */
  const goTo = (i: number, how: { slide?: 'from-right' | 'from-left'; smooth?: boolean } = {}) => {
    const el = feed.current
    const target = Math.max(0, Math.min(entries.length - 1, i))
    if (!el) return
    if (how.slide && !now.current.still) {
      setSlide('')
      requestAnimationFrame(() => setSlide(how.slide!))
    }
    el.scrollTo({ top: target * el.clientHeight, behavior: how.smooth && !how.slide && !now.current.still ? 'smooth' : 'auto' })
    if (target !== now.current.active) setSaid(describe(target))
    setActive(target)
  }

  /** Va à une famille : sa première série, depuis son introduction */
  const goFamily = (index: number) => {
    const f = families[Math.max(0, Math.min(families.length - 1, index))]
    if (!f) return
    const dir = families.indexOf(f) >= familyIndex ? 'from-right' : 'from-left'
    goTo(f.first, { slide: f.first === now.current.active ? undefined : dir })
  }

  /** Dans le geste même (toucher, touche M) : autorise le son du passage en cours (Safari sur iPhone) */
  const unlockNow = () => {
    const e = entries[now.current.active]
    if (e?.kind !== 'video') return
    const segment = e.script.segments[api.current?.index ?? 0] ?? e.script.segments[0]!
    unlockAudio(voiceOf(e.script.id, segment)?.url)
  }
  /** Coupe ou remet le son, pour toutes les vidéos */
  const toggleVoice = () => {
    if (!voiceOn) unlockNow()
    onVoiceChange(!voiceOn)
  }

  const openSheet = (kind: 'sources' | 'cats' | 'toc') => {
    if (!now.current.sheet) sheetReturn.current = document.activeElement as HTMLElement | null
    setSheet(kind)
  }
  const closeSheet = (giveBack = true) => {
    setSheet(null)
    const back = sheetReturn.current
    sheetReturn.current = null
    if (giveBack) requestAnimationFrame(() => back?.focus({ preventScroll: true }))
  }
  /** Choisir une vidéo dans un panneau : le panneau se ferme, la vidéo choisie prend le focus ; finie, elle repart du début */
  const pick = (i: number) => {
    closeSheet(false)
    setRewind(r => ({ index: Math.max(0, Math.min(entries.length - 1, i)), n: r.n + 1 }))
    setPlaying(true)
    goTo(i)
    requestAnimationFrame(focusActive)
  }

  /** La vidéo la plus proche d'une entrée du fil (une carte vide n'a pas de vidéo à retrouver) */
  const nearestVideo = (i: number) => {
    for (let d = 0; d < entries.length; d++) {
      for (const k of [i - d, i + d]) {
        const e = entries[k]
        if (e?.kind === 'video') return e.script.id
      }
    }
    return start ?? ''
  }
  /** On quitte le lecteur par un lien vers une fiche : avant que le navigateur suive le lien */
  const leave = (videoId: string, segment = 0) => {
    if (videoId) onLeave?.(videoId, segment)
  }

  const focusActive = () => {
    feed.current?.querySelectorAll<HTMLElement>('.vp-video')[now.current.active]?.focus({ preventScroll: true })
  }

  // Ouverture : popin modale, la page dessous ne défile plus, la vidéo de départ en place et focalisée
  useEffect(() => {
    const d = dialog.current
    const el = feed.current
    if (!d) return
    if (!d.open) d.showModal()
    document.documentElement.classList.add('vp-open')
    if (el) el.scrollTop = startIndex * el.clientHeight
    focusActive()
    const onCloseEvent = () => onClose()
    const onCancel = (e: Event) => {
      // Échap ferme d'abord le panneau ouvert
      if (now.current.sheet) {
        e.preventDefault()
        closeSheet()
      }
    }
    d.addEventListener('close', onCloseEvent)
    d.addEventListener('cancel', onCancel)
    return () => {
      d.removeEventListener('close', onCloseEvent)
      d.removeEventListener('cancel', onCancel)
      document.documentElement.classList.remove('vp-open')
      stopAudio()
      if (d.open) d.close()
    }
    // une fois, à l'ouverture
  }, [])

  // Bouton ou geste « retour » : il ferme le lecteur (comme Échap) au lieu de quitter la page. L'entrée ajoutée
  // garde la même adresse : ni hashchange, ni changement d'écran.
  useEffect(() => {
    if (!(resume && isPlayerEntry())) history.pushState({ [LECTEUR]: true }, '')
    let popped = false
    const onPop = (e: PopStateEvent) => {
      // Arrivée sur une autre entrée du lecteur (réouverture rapide) : rien à fermer
      if (isPlayerEntry(e.state)) return
      popped = true
      dialog.current?.close() // → « close » → onClose, le focus revient au bouton d'ouverture
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // Fermé par ×, Échap ou le fond : on consomme l'entrée ajoutée, si elle est toujours la courante. Parti
      // par un lien (« Voir la fiche », « Lire les fiches ») : l'entrée courante n'est plus la nôtre, on ne recule pas.
      if (!popped && isPlayerEntry()) history.back()
    }
    // une fois, à l'ouverture
  }, [])

  // Page masquée : tout s'arrête, et reprend au retour
  useEffect(() => {
    const on = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  // Mouvement réduit demandé en cours de route : images fixes
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setStill(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // Défilement du fil : la vidéo visible devient active quand le glissé s'arrête
  useEffect(() => {
    const el = feed.current
    if (!el) return
    let t = 0
    const settle = () => {
      const i = Math.round(el.scrollTop / Math.max(1, el.clientHeight))
      if (i !== now.current.active && entries[i]) {
        setSaid(describe(i))
        setActive(i)
      }
    }
    const onScroll = () => {
      window.clearTimeout(t)
      t = window.setTimeout(settle, 120)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    // Rotation, fenêtre redimensionnée : la vidéo active reste alignée
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => (el.scrollTop = now.current.active * el.clientHeight))
    ro?.observe(el)
    return () => {
      window.clearTimeout(t)
      el.removeEventListener('scroll', onScroll)
      ro?.disconnect()
    }
  }, [entries])

  // Le dernier goFamily (il dépend de la famille courante), pour l'écouteur de molette posé une fois
  const goFamilyRef = useRef((delta: number) => goFamily(familyIndex + delta))
  goFamilyRef.current = (delta: number) => goFamily(familyIndex + delta)

  // Molette et pavé tactile : un geste, une vidéo (vertical) ou une catégorie (horizontal), comme TikTok
  useEffect(() => {
    const el = feed.current
    if (!el) return
    const acc = { x: 0, y: 0 }
    let last = 0
    let locked = false
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || now.current.sheet) return
      // Texte agrandi ou zoom fort : la vidéo déborde de sa place ; la molette la fait d'abord défiler jusqu'au
      // bout (commandes comprises), puis seulement change de vidéo
      const box = (e.target as Element | null)?.closest?.('.vp-video')
      if (box && box.scrollHeight > box.clientHeight + 1 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        const room = e.deltaY > 0 ? box.scrollHeight - box.clientHeight - box.scrollTop > 1 : box.scrollTop > 1
        if (room) {
          // l'inertie qui suit, arrivée au bord, ne change pas aussitôt de vidéo
          last = performance.now()
          acc.x = acc.y = 0
          locked = true
          return
        }
      }
      e.preventDefault()
      const t = performance.now()
      const gap = t - last
      last = t
      // L'inertie du pavé tactile prolonge le geste : on attend une vraie pause avant le suivant
      if (locked && gap < 240) return
      locked = false
      if (gap > 240) acc.x = acc.y = 0
      acc.x += e.deltaX
      acc.y += e.deltaY * (e.deltaMode === 1 ? 32 : 1)
      if (Math.abs(acc.y) > 45 && Math.abs(acc.y) >= Math.abs(acc.x)) {
        locked = true
        goTo(now.current.active + Math.sign(acc.y), { smooth: true })
      } else if (Math.abs(acc.x) > 90) {
        locked = true
        goFamilyRef.current(Math.sign(acc.x))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Glissé de côté (doigt) : catégorie suivante ou précédente
  const swipe = useRef<{ x: number; y: number; t: number; id: number } | null>(null)
  const onPointerDown = (e: PointerEvent) => {
    swipe.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }
  }
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 56 && Math.abs(dx) > 1.6 * Math.abs(dy) && performance.now() - s.t < 900) {
      goFamily(familyIndex + (dx < 0 ? 1 : -1))
    }
  }

  // L'onglet courant reste visible dans la barre des catégories
  useEffect(() => {
    const list = tabs.current
    const tab = list?.querySelectorAll<HTMLElement>('.vp-tab')[familyIndex]
    if (!list || !tab) return
    // Centré ; un onglet plus large que la barre se cale à son début
    const left =
      tab.offsetWidth >= list.clientWidth - 24 ? tab.offsetLeft - 12 : tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2
    list.scrollTo({ left: Math.max(0, left), behavior: now.current.still ? 'auto' : 'smooth' })
  }, [familyIndex])

  // Molette verticale sur la barre des catégories : elle fait défiler les onglets de côté (sans changer de
  // catégorie), seulement quand ils débordent
  useEffect(() => {
    const list = tabs.current
    if (!list) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || list.scrollWidth <= list.clientWidth || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return
      e.preventDefault()
      list.scrollLeft += e.deltaY * (e.deltaMode === 1 ? 32 : 1)
    }
    list.addEventListener('wheel', onWheel, { passive: false })
    return () => list.removeEventListener('wheel', onWheel)
  }, [])

  // Changement de vidéo : la nouvelle se lit d'elle-même (comme sur TikTok, même après une pause) ; si le
  // focus était dans la vidéo quittée (devenue inerte), il passe à la nouvelle
  useEffect(() => {
    setPlaying(true)
    // Une vidéo qui déborde (texte agrandi) se montre d'abord par son en-tête
    const shown = feed.current?.querySelectorAll<HTMLElement>('.vp-video')[active]
    if (shown) shown.scrollTop = 0
    const d = dialog.current
    const a = document.activeElement
    if (!d || now.current.sheet) return
    if (!a || a === document.body || a === d || !d.contains(a) || a.closest('[inert]')) focusActive()
  }, [active])

  // Panneau ouvert : le focus va à son titre ; fermé, il revient au bouton qui l'a ouvert
  useEffect(() => {
    if (sheet) sheetHead.current?.focus()
  }, [sheet])

  // Fin du glissé de côté
  useEffect(() => {
    if (!slide) return
    const t = window.setTimeout(() => setSlide(''), 420)
    return () => window.clearTimeout(t)
  }, [slide])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    const target = e.target as HTMLElement
    if (sheet) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSheet()
      }
      return
    }
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return
    const inTabs = !!target.closest('.vp-tabs')
    // Raccourcis à une lettre (S, M) : actifs seulement quand le focus est dans la vidéo elle-même (WCAG 2.1.4)
    const inVideo = !!target.closest('.vp-video')
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault()
        goTo(active + 1, { smooth: true })
        break
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault()
        goTo(active - 1, { smooth: true })
        break
      case 'ArrowRight':
      case 'ArrowLeft': {
        e.preventDefault()
        const to = Math.max(0, Math.min(families.length - 1, familyIndex + (e.key === 'ArrowRight' ? 1 : -1)))
        goFamily(to)
        // Dans la barre des catégories, le focus suit l'onglet
        if (inTabs) tabs.current?.querySelectorAll<HTMLElement>('.vp-tab')[to]?.focus()
        break
      }
      case ' ':
        if (target.closest('button, a, summary')) return
        e.preventDefault()
        api.current?.toggle()
        break
      case 'm':
      case 'M':
        if (!anyVoice || !inVideo) return
        e.preventDefault()
        toggleVoice()
        break
      case 's':
      case 'S':
        if (entry.kind !== 'video' || !inVideo) return
        e.preventDefault()
        openSheet('toc')
        break
    }
  }

  const close = () => dialog.current?.close()
  const isBackdrop = (t: EventTarget | null) =>
    t === dialog.current || (t instanceof HTMLElement && t.classList.contains('vp-shell'))
  /** Ce que propose la fin d'une vidéo : la prochaine vidéo du fil, en sautant les familles qui n'en ont pas encore */
  const nextOf = (i: number) => {
    const cur = entries[i]
    if (!cur || cur.kind !== 'video') return null
    const to = entries.findIndex((e, k) => k > i && e.kind === 'video')
    const e = entries[to]
    // Fin des vidéos : on ne propose pas de carte vide ; « Revoir » reste, et les fiches sont accessibles par les catégories
    if (!e || e.kind !== 'video') return null
    // Dans la même série, sa place suffit ; sinon, le nom de la nouvelle série
    const same = e.series.series === cur.series.series
    return {
      to,
      kicker: same ? 'Ensuite dans la série' : 'Série suivante',
      label: same ? placeOf(e.series.series, e.script) : e.meta.marker,
    }
  }
  const current = entry.kind === 'video' ? entry : null
  const blocked = !!sheet

  return (
    <dialog
      ref={dialog}
      class={`vp${still ? ' is-still' : ''}`}
      aria-label="Les sujets en vidéo"
      onKeyDown={onKeyDown}
      onPointerDown={e => {
        downOnBackdrop.current = isBackdrop(e.target)
      }}
      onClick={e => {
        // Un clic commencé et fini hors des commandes : sur le fond, ou sur une commande inerte (un élément inerte
        // laisse passer le clic jusqu'à .vp-shell). Panneau ouvert : il ferme seulement le panneau, comme Échap.
        // Sinon il ferme le lecteur, dans la popin seulement (le fond sombre se voit) ; en plein écran (téléphone
        // debout ou couché), les marges et les zones de sécurité ne ferment rien.
        const fromBackdrop = downOnBackdrop.current
        downOnBackdrop.current = false
        if (!fromBackdrop || !isBackdrop(e.target)) return
        if (now.current.sheet) closeSheet()
        else if (isPopin()) close()
      }}
    >
      <div class="vp-shell">
        <button type="button" class="vp-close" onClick={close} inert={blocked}>
          <Glyph name="close" />
          <span class="vp-close-label">Fermer</span>
        </button>

        <nav class="vp-cats" aria-label="Catégories" inert={blocked}>
          <ul class="vp-tabs" ref={tabs}>
            {families.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  class={`vp-tab${f.series.length ? '' : ' is-empty'}`}
                  aria-current={i === familyIndex ? 'true' : undefined}
                  onClick={() => goFamily(i)}
                  onFocus={e => {
                    // Au clavier, l'onglet qui reçoit le focus sort entièrement des zones estompées de la barre
                    const t = e.currentTarget as HTMLElement
                    if (t.matches(':focus-visible')) t.scrollIntoView({ inline: 'nearest', block: 'nearest' })
                  }}
                >
                  {f.label}
                  {f.series.length ? null : <span class="sr-only"> (pas encore de vidéo)</span>}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" class="vp-cats-all" aria-haspopup="dialog" onClick={() => openSheet('cats')}>
            <Glyph name="grid" />
            <span class="vp-cats-all-label">Catégories</span>
          </button>
        </nav>

        <div class="vp-screen">
          <div
            class={`vp-feed${slide ? ` is-${slide}` : ''}`}
            ref={feed}
            inert={blocked}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            {entries.map((e, i) => {
              const next = e.kind === 'video' ? nextOf(i) : null
              return (
                <div key={e.key} class="vp-item">
                  {e.kind === 'video' ? (
                    <Video
                      script={e.script}
                      piste={PISTE}
                      meta={e.meta}
                      context={context}
                      active={i === active}
                      near={Math.abs(i - active) <= 1}
                      run={i === active && playing && !hidden && !sheet}
                      playing={playing}
                      still={still}
                      voiceOn={voiceOn}
                      next={next}
                      rewind={rewind.index === i ? rewind.n : 0}
                      from={i === startIndex ? startSegment : undefined}
                      position={`${i + 1} sur ${entries.length} dans le fil`}
                      onPlay={setPlaying}
                      onSound={toggleVoice}
                      onSources={() => openSheet('sources')}
                      onSummary={() => openSheet('toc')}
                      onNext={() => goTo(next ? next.to : i + 1, { smooth: true })}
                      onLeave={segment => leave(e.script.id, segment)}
                      bind={(a, on) => {
                        if (on) api.current = a
                        else if (api.current === a) api.current = null
                      }}
                    />
                  ) : (
                    <Empty family={e.family} active={i === active} onLeave={() => leave(nearestVideo(i))} />
                  )}
                </div>
              )
            })}
          </div>

          {sheet === 'toc' && current ? (
            <Sheet title={current.series.series.label} headRef={sheetHead} onClose={() => closeSheet()}>
              <Summary
                series={current.series.series}
                first={current.series.first}
                active={active}
                onPick={pick}
                onAll={() => setSheet('cats')}
              />
            </Sheet>
          ) : null}

          {sheet === 'sources' && current ? (
            <Sheet title="Sources" headRef={sheetHead} onClose={() => closeSheet()}>
              {/* Qui a écrit et qui parle : l'IA pour le texte, une voix de synthèse pour la voix */}
              <div class="vp-ai-note">
                <AiNote
                  kind="video"
                  voice={voicedCount(current.script) > 0}
                  onLeave={() => leave(current.script.id, api.current?.index ?? 0)}
                />
              </div>
              <ol class="vp-sources">
                {current.script.sources.map(s => (
                  <li key={s.url + s.title}>
                    <ExternalLink href={s.url}>{s.title}</ExternalLink>
                    <span class="vp-source-meta">{[s.publisher, dateOf(s.date)].filter(Boolean).join(', ')}</span>
                  </li>
                ))}
              </ol>
              <h3 class="vp-sheet-sub">Ce que dit la vidéo</h3>
              {/* Tout ce que montre la scène (masquée aux lecteurs d'écran) est ici : ce qui est dit, le chiffre clé
                  et sa source, et ce que le dessin écrit en plus (alt) */}
              <ol class="vp-transcript">
                {current.script.segments.map(s => (
                  <li key={s.id}>
                    <p>{s.say}</p>
                    {s.figure ? <p class="vp-transcript-more">{figureLine(s.figure, current.script)}</p> : null}
                    {s.alt ? <p class="vp-transcript-more">{s.alt}</p> : null}
                  </li>
                ))}
              </ol>
              <p class="vp-sheet-more">
                {/* Sans question de l'élection pour cette vidéo : la fiche du thème que montre « Voir la fiche » */}
                {(current.script.questionIds.length ? current.script.questionIds : [current.script.fiche ?? '']).map(id => {
                  const q = bank.questions.find(x => x.id === id)
                  return q ? (
                    <a key={id} href={link(`/sujets/${id}`)} onClick={() => leave(current.script.id, api.current?.index ?? 0)}>
                      {`Voir la fiche\u00a0: ${q.prompt}`}
                    </a>
                  ) : null
                })}
              </p>
            </Sheet>
          ) : null}

          {sheet === 'cats' ? (
            <Sheet title="Catégories" headRef={sheetHead} onClose={() => closeSheet()}>
              <ul class="vp-catgrid">
                {families.map((f, i) => {
                  const others = f.topics.filter(t => !f.series.some(s => s.series.topicId === t.id)).map(t => t.label)
                  return (
                    <li key={f.id} class={`vp-cat vp-tint-${i % 4}${i === familyIndex ? ' is-current' : ''}`}>
                      <h3 class="vp-cat-label">
                        {f.label}
                        {i === familyIndex ? <span class="sr-only"> (catégorie en cours)</span> : null}
                      </h3>
                      {f.series.length ? (
                        <ul class="vp-cat-series">
                          {f.series.map(s => (
                            <li key={s.series.topicId}>
                              <button
                                type="button"
                                class="vp-cat-go"
                                aria-current={current?.series.series === s.series ? 'true' : undefined}
                                onClick={() => pick(s.first)}
                              >
                                <span class="vp-cat-name">{s.series.label}</span>
                                <span class="vp-cat-count">
                                  {`${plural(s.series.videos.length, 'vidéo')}, environ ${durationLabel(seriesSeconds(s.series))}`}
                                </span>
                                <Glyph name="next" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p class="vp-cat-none">Pas encore de vidéo</p>
                      )}
                      {others.length ? (
                        <p class="vp-cat-topics">
                          {f.series.length ? `Sans vidéo pour l’instant\u00a0: ${others.join(', ')}` : `Thèmes\u00a0: ${others.join(', ')}`}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </Sheet>
          ) : null}
        </div>

        <div class="vp-side" inert={blocked}>
          <button type="button" class="vp-arrow" disabled={active === 0} onClick={() => goTo(active - 1, { smooth: true })}>
            <Glyph name="up" />
            <span class="sr-only">Vidéo précédente</span>
          </button>
          <button
            type="button"
            class="vp-arrow"
            disabled={active === entries.length - 1}
            onClick={() => goTo(active + 1, { smooth: true })}
          >
            <Glyph name="down" />
            <span class="sr-only">Vidéo suivante</span>
          </button>
        </div>

        <p class="vp-keys" aria-hidden="true">
          <kbd>↑</kbd> <kbd>↓</kbd> vidéos · <kbd>←</kbd> <kbd>→</kbd> catégories · <kbd>Espace</kbd> pause ·{' '}
          <kbd>Échap</kbd> fermer · dans la vidéo affichée, <kbd>S</kbd> sommaire
          {anyVoice ? (
            <>
              {', '}
              <kbd>M</kbd> son
            </>
          ) : null}
        </p>
      </div>
      <p class="sr-only" aria-live="polite">
        {said}
      </p>
    </dialog>
  )
}

/** Le sommaire d'une série : l'introduction, puis ses approfondissements ; la vidéo en cours est marquée */
function Summary({
  series,
  first,
  active,
  onPick,
  onAll,
}: {
  series: VideoSeries
  first: number
  active: number
  onPick: (i: number) => void
  onAll: () => void
}) {
  const deep = series.videos.filter(v => v.kind === 'deep').length
  return (
    <>
      <p class="vp-toc-lede">
        {`Une introduction, puis ${plural(deep, 'approfondissement')}\u00a0: ${plural(series.videos.length, 'vidéo')}, environ ${durationLabel(seriesSeconds(series))}.`}
      </p>
      <ol class="vp-toc">
        {series.videos.map((v, k) => {
          const i = first + k
          const { part } = partOf(series, v)
          const here = i === active
          return (
            <li key={v.id}>
              <button type="button" class="vp-toc-item" aria-current={here ? 'true' : undefined} onClick={() => onPick(i)}>
                <span class={`vp-toc-n${part ? '' : ' is-intro'}`} aria-hidden="true">
                  {part || 'Intro'}
                </span>
                <span class="vp-toc-text">
                  <span class="vp-toc-short">
                    <span class="sr-only">{part ? `${part}\u00a0sur\u00a0${deep}\u00a0: ` : ''}</span>
                    {v.short}
                  </span>
                  <span class="vp-toc-title">{v.title}</span>
                  <span class="vp-toc-meta">
                    {`environ ${durationLabel(videoSeconds(v))}`}
                    {here ? <strong class="vp-toc-here"> · en cours</strong> : null}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <p class="vp-sheet-more">
        <button type="button" class="vp-sheet-link" aria-haspopup="dialog" onClick={onAll}>
          <Glyph name="grid" />
          Toutes les catégories
        </button>
      </p>
    </>
  )
}

/** Panneau posé sur la popin (sommaire, sources, catégories) : le reste du lecteur est inerte tant qu'il est ouvert */
function Sheet({
  title,
  headRef,
  onClose,
  children,
}: {
  title: string
  headRef: { current: HTMLHeadingElement | null }
  onClose: () => void
  children: ComponentChildren
}) {
  return (
    <section class="vp-sheet" role="dialog" aria-modal="true" aria-labelledby="vp-sheet-title">
      <div class="vp-sheet-head">
        <h2 class="vp-sheet-title" id="vp-sheet-title" tabIndex={-1} ref={headRef}>
          {title}
        </h2>
        <button type="button" class="vp-sheet-close" onClick={onClose}>
          <Glyph name="close" />
          <span class="sr-only">{`Fermer\u00a0: ${title}`}</span>
        </button>
      </div>
      <div class="vp-sheet-body">{children}</div>
    </section>
  )
}

/** Le chiffre clé d'un passage, en toutes lettres, pour la transcription : valeur, libellé complet, source et date */
function figureLine(f: NonNullable<VideoSegment['figure']>, script: VideoScript): string {
  const source = script.sources[f.sourceIndex]
  const who = source ? (source.publisher ?? source.title) : ''
  const label = lowerFirst(f.label.trim().replace(/\.$/, ''))
  const tail = [who, f.date ? lowerFirst(f.date) : ''].filter(Boolean).join(', ')
  return `Chiffre clé\u00a0: ${f.value}, ${label}.${tail ? ` Source\u00a0: ${tail}.` : ''}`
}

/** Une famille sans vidéo : un état sobre, qui mène aux fiches écrites */
function Empty({ family, active, onLeave }: { family: Family; active: boolean; onLeave: () => void }) {
  const id = `vp-vide-${family.id}`
  return (
    <article class={`vp-video vp-empty ${PISTE.className}`} aria-labelledby={id} tabIndex={-1} inert={!active}>
      <div class="vp-empty-body">
        <p class="vp-kicker">{family.label}</p>
        <h2 class="vp-empty-title" id={id}>
          Pas encore de vidéo
        </h2>
        <p class="vp-empty-text">
          {`Thèmes\u00a0: ${family.topics.map(t => t.label).join(', ')}. Leurs fiches écrites, avec les chiffres et les sources, sont sur la page «\u00a0Les sujets\u00a0».`}
        </p>
        {family.sample ? (
          <a class="vp-empty-link" href={link(`/sujets/${family.sample}`)} onClick={onLeave}>
            Lire les fiches
            <Glyph name="next" />
          </a>
        ) : null}
      </div>
    </article>
  )
}
