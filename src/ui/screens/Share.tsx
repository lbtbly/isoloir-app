import { useEffect, useState } from 'preact/hooks'
import type { AgreeScope } from '../../core/agreeImage'
import { downloadBlob } from '../../core/exportData'
import { freezePeriod, frozenAt } from '../../core/freeze'
import { TITLE_AGREE } from '../../core/resultsCopy'
import { displayScore, type Results } from '../../core/score'
import {
  AGREE_ROWS,
  canvasToJpeg,
  IMAGE_H,
  IMAGE_W,
  flaggedCount,
  flopLead,
  offPosterText,
  othersText,
  posterNotes,
  posterPositions,
  posterRanking,
  renderShareImage,
  shareFileName,
  type PosterView,
} from '../../core/shareImage'
import type { SessionState } from '../../core/storage'
import type { ElectionPack } from '../../core/types'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { link } from '../nav'
import { agreeNow, loadAgree } from '../share/load'

interface Props {
  pack: ElectionPack
  state: SessionState
  results: Results
}

/** L'affiche « Mon dépouillement » ou l'image « Accords et désaccords » (core/agreeImage.ts, chargée à la demande) */
type ImageKind = 'poster' | 'agree'

export function Share({ pack, results }: Props) {
  const [kind, setKind] = useState<ImageKind>('poster')
  const [showFlags, setShowFlags] = useState(false)
  const [view, setView] = useState<PosterView>('top')
  const [pick, setPick] = useState<AgreeScope>('top')
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [size, setSize] = useState<readonly [number, number]>([IMAGE_W, IMAGE_H])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  // Les accords et désaccords des seuls candidats classés ; jusqu'à AGREE_ROWS, tous, sans choix
  const agree = kind === 'agree' && results.ranking.length > 0
  const scope: AgreeScope = results.ranking.length > AGREE_ROWS ? pick : 'all'
  // Gel des jours de vote (core/freeze.ts) : aucune image n'est fabriquée, de la veille à la clôture du scrutin
  const frozen = frozenAt(pack.election)
  const frozenStart = frozen?.start ?? null

  useEffect(() => {
    let alive = true
    let made: string | null = null
    setError(null)
    setUrl(null)
    setBlob(null)
    if (frozenStart) return
    ;(agree ? loadAgree().then(m => m.renderAgreeImage(pack, results, { showFlags, scope })) : renderShareImage(pack, results, { showFlags, view }))
      .then(async canvas => {
        const b = await canvasToJpeg(canvas)
        if (!alive) return
        made = URL.createObjectURL(b)
        setSize([canvas.width, canvas.height])
        setBlob(b)
        setUrl(made)
      })
      .catch(() => alive && setError('L’image n’a pas pu être fabriquée sur ce navigateur.'))
    return () => {
      alive = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [pack, results, showFlags, view, agree, scope, frozenStart])

  const agreeImage = agree ? agreeNow() : null
  const fileName = agreeImage ? agreeImage.agreeFileName(pack, new Date(), scope) : shareFileName(pack, new Date(), view)
  const file = blob ? new File([blob], fileName, { type: 'image/jpeg' }) : null
  const names = new Map(pack.candidates.map(c => [c.id, c.name]))
  // Le texte de remplacement dit ce que montre l'image : les mêmes lignes et leurs numéros, les autres candidats en
  // une fois, le nombre de candidats hors classement et non classés (seuls les classés sont sur l'affiche), puis les
  // mêmes notes de pied
  const { shown, others } = posterRanking(results, showFlags, view)
  const positions = posterPositions(results, showFlags)
  const othersFlagged = showFlags ? flaggedCount(others) : 0
  const othersAlt = others.length
    ? `, et ${othersText(others, view, showFlags)}${othersFlagged ? `, dont ${othersFlagged} marqué${othersFlagged > 1 ? 's' : ''} d’une croix` : ''}`
    : ''
  const listed = shown
    .map(r => `${positions.get(r.candidateId)}. ${names.get(r.candidateId)} ${displayScore(r.score) ?? '–'} %${showFlags && !r.compatible ? ' (croix)' : ''}`)
    .join(', ')
  const off = offPosterText(results.unranked.length, results.excluded.length)
  const posterAlt = `Affiche « Mon dépouillement »${view === 'flop' ? `, ${flopLead(results).replace(/^L/, 'l')}` : ''}, ${pack.election.shortName}, sur ${
    results.answered
  } réponses${listed ? ` : ${listed}${othersAlt}` : ''}.${off ? ` ${off}.` : ''}${posterNotes(results, showFlags)
    .map(n => ` ${n}`)
    .join('')}`
  const alt = agreeImage ? agreeImage.agreeAlt(pack, results, { showFlags, scope }) : posterAlt
  const canShare =
    !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], title: agree ? TITLE_AGREE : 'Mon dépouillement' })
      setStatus('Image transmise à l’application choisie.')
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') setStatus('Le partage a échoué. Vous pouvez télécharger l’image.')
    }
  }

  return (
    <div class="screen screen-share">
      <FormHeader title="Partager" right={pack.election.shortName} />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Votre affiche
        </h1>
        <p class="lede">
          L’image est fabriquée sur cet appareil. Elle montre vos pourcentages d’affinité
          {agree ? ' et le compte de vos accords et désaccords' : ''}, pas vos réponses. Une préférence politique reste
          une donnée sensible : vous choisissez seul où l’envoyer.
        </p>

        {frozen ? (
          <p class="notice" role="status">
            Pas d’image à partager pendant le gel des jours de vote, {freezePeriod(frozen)}. Votre dépouillement reste
            consultable.
          </p>
        ) : null}

        {!frozen && results.ranking.length ? (
          <Choice
            label="Image à partager"
            value={agree ? 'agree' : 'poster'}
            set={setKind}
            items={[
              ['poster', 'Mon dépouillement'],
              ['agree', TITLE_AGREE],
            ]}
          />
        ) : null}

        {frozen ? null : agree ? (
          results.ranking.length > AGREE_ROWS ? (
            <Choice
              label="Candidats sur l’image"
              value={scope}
              set={setPick}
              items={[
                ['top', `Les ${AGREE_ROWS} plus proches`],
                ['flop', `Les ${AGREE_ROWS} plus éloignés`],
                ['all', 'Tous'],
              ]}
            />
          ) : null
        ) : results.ranking.length > 1 ? (
          <Choice
            label="Candidats sur l’affiche"
            value={view}
            set={setView}
            items={[
              ['top', 'Les plus proches'],
              ['flop', 'Les plus éloignés'],
            ]}
          />
        ) : null}

        {frozen ? null : (
          <>
            <label class="switch">
              <input type="checkbox" checked={showFlags} onChange={e => setShowFlags((e.currentTarget as HTMLInputElement).checked)} />
              Marquer d’une croix les candidats qui franchissent une de mes lignes rouges
            </label>

            <figure class="share-preview">
              {url ? (
                <img src={url} width={size[0]} height={size[1]} alt={alt} />
              ) : (
                <div class="share-placeholder" aria-hidden="true">
                  {error ?? 'Fabrication de l’image…'}
                </div>
              )}
            </figure>
            <p class="small" role="status" aria-live="polite">
              {status || (error ?? (url ? 'Image prête.' : 'Fabrication de l’image…'))}
            </p>
          </>
        )}
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Partager">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/resultats')}>
            <Icon name="arrow-left" />
            Résultats
          </a>
          {frozen ? (
            <span />
          ) : canShare ? (
            <button type="button" class="btn-text" disabled={!blob} onClick={() => blob && downloadBlob(blob, fileName)}>
              <Icon name="download" />
              Télécharger le JPG
            </button>
          ) : (
            <span />
          )}
          {frozen ? (
            <span />
          ) : canShare ? (
            <button type="button" class="btn-primary" onClick={share}>
              Partager
              <Icon name="share" />
            </button>
          ) : (
            <button type="button" class="btn-primary" disabled={!blob} onClick={() => blob && downloadBlob(blob, fileName)}>
              Télécharger
              <Icon name="download" />
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

/** Un choix en boutons enfoncés (.segmented) ; à l'étroit, un libellé passe à la ligne dans son bouton */
function Choice<T extends string>({ label, value, set, items }: { label: string; value: T; set: (v: T) => void; items: [T, string][] }) {
  return (
    <div class="segmented is-fit" role="group" aria-label={label}>
      {items.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => set(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}
