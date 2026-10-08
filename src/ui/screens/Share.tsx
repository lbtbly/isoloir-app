import { useEffect, useState } from 'preact/hooks'
import { downloadBlob } from '../../core/exportData'
import { displayScore, type Results } from '../../core/score'
import { canvasToJpeg, flaggedCount, offPosterText, othersText, posterRanking, renderShareImage, shareFileName } from '../../core/shareImage'
import type { SessionState } from '../../core/storage'
import type { ElectionPack } from '../../core/types'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { link } from '../nav'

interface Props {
  pack: ElectionPack
  state: SessionState
  results: Results
}

export function Share({ pack, results }: Props) {
  const [showFlags, setShowFlags] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    let alive = true
    let made: string | null = null
    setError(null)
    setUrl(null)
    setBlob(null)
    renderShareImage(pack, results, { showFlags })
      .then(canvasToJpeg)
      .then(b => {
        if (!alive) return
        made = URL.createObjectURL(b)
        setBlob(b)
        setUrl(made)
      })
      .catch(() => alive && setError('L’image n’a pas pu être fabriquée sur ce navigateur.'))
    return () => {
      alive = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [pack, results, showFlags])

  const file = blob ? new File([blob], shareFileName(pack), { type: 'image/jpeg' }) : null
  const names = new Map(pack.candidates.map(c => [c.id, c.name]))
  // Le texte de remplacement dit ce que montre l'image : les mêmes lignes, les autres candidats en une fois, puis
  // le nombre de candidats hors classement et non classés (seuls les classés sont sur l'affiche)
  const { shown, others } = posterRanking(results, showFlags)
  const othersFlagged = showFlags ? flaggedCount(others) : 0
  const othersAlt = others.length
    ? `, et ${othersText(others)}${othersFlagged ? `, dont ${othersFlagged} marqué${othersFlagged > 1 ? 's' : ''} d’une croix` : ''}`
    : ''
  const listed = shown
    .map(r => `${names.get(r.candidateId)} ${displayScore(r.score) ?? '–'} %${showFlags && !r.compatible ? ' (croix)' : ''}`)
    .join(', ')
  const off = offPosterText(results.unranked.length, results.excluded.length)
  const alt = `Affiche « Mon dépouillement », ${pack.election.shortName}, sur ${results.answered} réponses${
    listed ? ` : ${listed}${othersAlt}` : ''
  }.${off ? ` ${off}.` : ''}`
  const canShare =
    !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], title: 'Mon dépouillement' })
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
          L’image est fabriquée sur cet appareil. Elle montre vos pourcentages d’affinité, pas vos réponses. Une
          préférence politique reste une donnée sensible : vous choisissez seul où l’envoyer.
        </p>

        <label class="switch">
          <input type="checkbox" checked={showFlags} onChange={e => setShowFlags((e.currentTarget as HTMLInputElement).checked)} />
          Marquer d’une croix les candidats qui franchissent une de mes lignes rouges
        </label>

        <figure class="share-preview">
          {url ? (
            <img src={url} width={1080} height={1350} alt={alt} />
          ) : (
            <div class="share-placeholder" aria-hidden="true">
              {error ?? 'Fabrication de l’image…'}
            </div>
          )}
        </figure>
        <p class="small" role="status" aria-live="polite">
          {status || (error ?? (url ? 'Image prête.' : 'Fabrication de l’image…'))}
        </p>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Partager">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/resultats')}>
            <Icon name="arrow-left" />
            Résultats
          </a>
          {canShare ? (
            <button type="button" class="btn-text" disabled={!blob} onClick={() => blob && downloadBlob(blob, shareFileName(pack))}>
              <Icon name="download" />
              Télécharger le JPG
            </button>
          ) : (
            <span />
          )}
          {canShare ? (
            <button type="button" class="btn-primary" onClick={share}>
              Partager
              <Icon name="share" />
            </button>
          ) : (
            <button type="button" class="btn-primary" disabled={!blob} onClick={() => blob && downloadBlob(blob, shareFileName(pack))}>
              Télécharger
              <Icon name="download" />
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
