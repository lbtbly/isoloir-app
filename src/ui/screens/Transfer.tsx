// « Continuer sur un autre appareil » (#/autre-appareil) : la feuille passe d'un appareil à l'autre dans un code de
// reprise (core/transfer), montré en QR code, en texte à recopier ou en image, puis lu ici par la caméra, une image
// ou au clavier. Rien ne passe par un réseau : ni serveur, ni compte, ni adresse qui porte les réponses.
// Chargé à la demande (ui/screens/load.ts), avec le QR code et le codec : le code de chaque visite n'en contient rien.

import { useEffect, useMemo, useState } from 'preact/hooks'
import type { ImportResult } from '../../core/exportData'
import { importNotes } from '../../core/exportData'
import type { SessionState } from '../../core/storage'
import { groupCode } from '../../core/transfer/base32'
import { encodeTransfer, parseCode } from '../../core/transfer/codec'
import { sheetContents } from '../../core/transfer/summary'
import { canvasToPng, renderTransferImage, transferImageName } from '../../core/transferImage'
import { downloadBlob } from '../../core/download'
import { qrModules, qrPath } from '../../core/transfer/qr'
import type { ElectionPack } from '../../core/types'
import { Arrow, Figure } from '../components/Diagrams'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { Stamp } from '../components/Stamp'
import { go, link } from '../nav'

interface Props {
  pack: ElectionPack
  state: SessionState
  setState: (s: SessionState) => void
}

type Side = 'send' | 'receive'

/** Pictogrammes propres à la page, au trait des autres (ui/components/Icon.tsx) */
const GLYPHS = {
  camera: 'M4 8.5h3l1.6-2.5h6.8L17 8.5h3V19H4zM12 16.6a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17.5M15.5 9.5v.5',
  copy: 'M8.5 8.5h11v11h-11zM15.5 8.5V4.5h-11v11h4',
  keyboard: 'M3 7h18v10H3zM6.5 10.5h1M10 10.5h1M13.5 10.5h1M17 10.5h.5M7.5 14h9',
} as const

function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={GLYPHS[name]} />
    </svg>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

export function Transfer({ pack, state, setState }: Props) {
  const started = Object.keys(state.answers).length > 0
  const [side, setSide] = useState<Side>(started ? 'send' : 'receive')

  return (
    <div class="screen screen-wide screen-transfer">
      <FormHeader title="Autre appareil" right={pack.election.shortName} />
      <main class="sheet wide-sheet transfer" id="contenu" tabIndex={-1}>
        <div class="transfer-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            Votre feuille, sur un autre appareil
          </h1>
          <p class="lede">
            Du téléphone à l’ordinateur, ou d’un navigateur à l’autre : vos réponses voyagent dans un code, d’écran à
            écran. Ni serveur ni compte, et cela marche même en mode avion.
          </p>
        </div>

        <div class="transfer-work">
          <div class="segmented is-fit transfer-switch" role="group" aria-label="Sur cet appareil">
            <button type="button" aria-pressed={side === 'send'} onClick={() => setSide('send')}>
              Envoyer d’ici
            </button>
            <button type="button" aria-pressed={side === 'receive'} onClick={() => setSide('receive')}>
              Recevoir ici
            </button>
          </div>
          {side === 'send' ? <Send pack={pack} state={state} /> : <Receive pack={pack} state={state} setState={setState} />}
        </div>

        <figure class="transfer-how">
          <TransferDiagram />
          <figcaption class="small">
            Le code est fabriqué et lu sur vos appareils. Il ne part nulle part ailleurs, sauf là où vous le mettez
            vous-même.
          </figcaption>
        </figure>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Autre appareil">
        <div class="action-bar-inner">
          <a class="btn-text" href={link(started ? '/resultats' : '/')}>
            <Icon name="arrow-left" />
            {started ? 'Résultats' : 'Accueil'}
          </a>
        </div>
      </nav>
    </div>
  )
}

/** Envoyer d'ici : le QR code derrière le rideau, le code à recopier, l'image et le partage */
function Send({ pack, state }: { pack: ElectionPack; state: SessionState }) {
  const [shown, setShown] = useState(false)
  const [status, setStatus] = useState('')
  const started = Object.keys(state.answers).length > 0
  const made = useMemo(() => {
    if (!started) return null
    try {
      const code = encodeTransfer(state, pack)
      const modules = qrModules(code)
      return { code, modules, path: qrPath(modules, 4) }
    } catch {
      return null
    }
  }, [pack, state, started])

  if (!started) {
    return (
      <section class="transfer-panel on-copy" aria-labelledby="send-title">
        <h2 id="send-title" class="transfer-title">
          Rien à envoyer pour l’instant
        </h2>
        <p>Votre feuille est vierge sur cet appareil. Répondez à quelques questions, ou recevez ici celle d’un autre appareil.</p>
        <a class="btn-primary" href={link('/feuille/1')}>
          Commencer
          <Icon name="arrow-right" />
        </a>
      </section>
    )
  }
  if (!made) {
    return (
      <section class="transfer-panel on-copy" aria-labelledby="send-title">
        <h2 id="send-title" class="transfer-title">
          Pas de code pour cette feuille
        </h2>
        <p>
          Le code n’a pas pu être fabriqué. Votre double (JSON), dans vos résultats, emporte aussi toute la feuille.
        </p>
      </section>
    )
  }

  const groups = groupCode(made.code)
  const lines: string[][] = []
  for (let i = 0; i < groups.length; i += 4) lines.push(groups.slice(i, i + 4))
  const side = made.modules.length + 8
  const today = new Date().toISOString().slice(0, 10)

  const image = async (share: boolean) => {
    setStatus('Fabrication de l’image…')
    try {
      const now = new Date()
      const blob = await canvasToPng(await renderTransferImage(pack, state, made.code, now))
      const name = transferImageName(pack, now)
      const file = new File([blob], name, { type: 'image/png' })
      if (share && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Ma feuille, à reprendre' })
        setStatus('Image transmise à l’application choisie.')
      } else {
        downloadBlob(blob, name, 60_000)
        setStatus('Image enregistrée.')
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') setStatus('')
      else setStatus('L’image n’a pas pu être fabriquée sur ce navigateur : copiez le code à la place.')
    }
  }
  const canShareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(made.code)
      setStatus('Code copié.')
    } catch {
      setStatus('La copie a été refusée par le navigateur : recopiez le code à la main.')
    }
  }

  return (
    <section class="transfer-panel on-copy" aria-labelledby="send-title">
      <div class="transfer-send">
        <div class="transfer-send-head">
          <h2 id="send-title" class="transfer-title">
            Montrez ce code à l’autre appareil
          </h2>
          <Stamp date={today} label="Feuille du" />
          <p class="transfer-contents">{sheetContents(state)}</p>
        </div>

        <div class="transfer-qr">
          <div class={`qr-plate${shown ? ' is-shown' : ''}`}>
            {shown ? (
              <svg class="qr" viewBox={`0 0 ${side} ${side}`} role="img" aria-label="QR code de votre feuille">
                <path d={made.path} />
              </svg>
            ) : (
              <div class="qr-curtain">
                <svg class="qr-pleats" aria-hidden="true" preserveAspectRatio="none">
                  <defs>
                    <pattern id="qr-pleats" width="46" height="40" patternUnits="userSpaceOnUse">
                      <path d="M6 0v40M19.5 0v40M34 0v40" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#qr-pleats)" />
                </svg>
                <button type="button" class="btn-primary" onClick={() => setShown(true)}>
                  Montrer mon code
                </button>
                <p class="qr-curtain-note">Derrière le rideau : vos réponses. Ouvrez-le à l’abri des regards.</p>
              </div>
            )}
          </div>
          {shown ? (
            <button type="button" class="btn-text" onClick={() => setShown(false)}>
              Refermer le rideau
            </button>
          ) : null}
        </div>

        <div class="transfer-side">
          <ol class="transfer-steps">
            <li>
              Sur l’autre appareil, ouvrez Isoloir, puis <strong>Autre appareil</strong>, <strong>Recevoir ici</strong>.
            </li>
            <li>Visez ce QR code avec sa caméra, ou recopiez le code ci-dessous.</li>
          </ol>
          <div class="transfer-actions">
            <button type="button" class="btn-text" onClick={copy}>
              <Glyph name="copy" />
              Copier le code
            </button>
            <button type="button" class="btn-text" onClick={() => image(false)}>
              <Icon name="download" />
              Télécharger l’image
            </button>
            {canShareFiles ? (
              <button type="button" class="btn-text" onClick={() => image(true)}>
                <Icon name="share" />
                Partager l’image
              </button>
            ) : null}
          </div>
          <p class="small" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </div>

      <details class="transfer-code">
        <summary>
          Recopier le code à la main <span class="transfer-count">{plural(groups.length, 'groupe', 'groupes')} de 4</span>
        </summary>
        <ol class="code-lines" aria-label="Code de reprise, par lignes de quatre groupes">
          {lines.map((line, i) => (
            <li key={i}>
              <span class="code-line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span class="code-groups">
                {line.map((g, j) => (
                  <span key={j} class="code-group">
                    {g}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ol>
        <p class="small">Majuscules ou minuscules, avec ou sans espaces : tout est lu. Une faute est toujours signalée.</p>
      </details>

      <p class="notice transfer-warning">
        Ce code, c’est toute votre feuille : vos avis et vos lignes rouges. Ne le montrez qu’à vos propres appareils. Une
        image rangée dans des photos sauvegardées en ligne part avec elles.
      </p>
    </section>
  )
}

/** Recevoir ici : la caméra, une image ou le code tapé ; puis « Remplacer ma feuille » */
function Receive({ pack, state, setState }: Props) {
  const [text, setText] = useState('')
  const [camera, setCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Extract<ImportResult, { ok: true }> | null>(null)
  const started = Object.keys(state.answers).length > 0

  useEffect(() => setError(null), [text])

  const read = (value: string) => {
    const res = parseCode(value, pack)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setError(null)
    setPending(res)
  }

  const apply = (next: SessionState) => {
    setPending(null)
    setState(next)
    go('/resultats')
  }

  if (pending) {
    const notes = importNotes(pending, pack)
    return (
      <section class="transfer-panel is-receive" aria-labelledby="receive-title">
        <h2 id="receive-title" class="transfer-title" tabIndex={-1}>
          Une feuille est prête
        </h2>
        <p class="transfer-contents">{sheetContents(pending.state)}</p>
        <div class="notice" role="status">
          {started ? (
            <p>
              Elle remplacera la feuille de cet appareil, qui ne pourra pas être retrouvée. Sur cet appareil :{' '}
              {sheetContents(state)}.
            </p>
          ) : (
            <p>Elle deviendra la feuille de cet appareil.</p>
          )}
          {notes.length ? <p>{notes.join(' ')}</p> : null}
          <div class="link-row">
            <button type="button" class="btn-primary" onClick={() => apply(pending.state)}>
              {started ? 'Remplacer ma feuille' : 'Reprendre cette feuille'}
            </button>
            <button type="button" class="btn-text" onClick={() => setPending(null)}>
              Annuler
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section class="transfer-panel is-receive" aria-labelledby="receive-title">
      <h2 id="receive-title" class="transfer-title">
        Reprenez ici la feuille d’un autre appareil
      </h2>
      <ol class="transfer-ways">
        <li>
          <span class="row-letter" aria-hidden="true">
            A
          </span>
          <div class="way">
            <h3>Scanner le QR code</h3>
            {camera ? (
              <div class="viewfinder" aria-label="Aperçu de la caméra">
                <span class="viewfinder-corners" aria-hidden="true" />
                <p class="viewfinder-hint">Visez le QR code de l’autre écran</p>
              </div>
            ) : (
              <p>Avec la caméra de cet appareil. L’image reste ici : rien n’est filmé, gardé ni envoyé.</p>
            )}
            <button type="button" class={camera ? 'btn-text' : 'btn-primary'} onClick={() => setCamera(!camera)}>
              {camera ? (
                'Fermer la caméra'
              ) : (
                <>
                  <Glyph name="camera" />
                  Ouvrir la caméra
                </>
              )}
            </button>
          </div>
        </li>
        <li>
          <span class="row-letter" aria-hidden="true">
            B
          </span>
          <div class="way">
            <h3>Choisir une image</h3>
            <p>L’image du code téléchargée, une capture d’écran ou une photo de l’autre écran.</p>
            <button type="button" class="btn-text">
              <Glyph name="image" />
              Choisir une image
            </button>
          </div>
        </li>
        <li>
          <span class="row-letter" aria-hidden="true">
            C
          </span>
          <div class="way">
            <h3>
              <label for="transfer-code">Taper ou coller le code</label>
            </h3>
            <textarea
              id="transfer-code"
              class="code-input"
              rows={4}
              spellcheck={false}
              autocomplete="off"
              autocapitalize="characters"
              placeholder="XXXX XXXX XXXX XXXX…"
              value={text}
              onInput={e => setText((e.currentTarget as HTMLTextAreaElement).value)}
              aria-describedby={error ? 'transfer-error' : undefined}
              aria-invalid={error ? true : undefined}
            />
            {error ? (
              <p id="transfer-error" class="transfer-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" class="btn-text" disabled={!text.trim()} onClick={() => read(text)}>
              <Glyph name="keyboard" />
              Lire ce code
            </button>
          </div>
        </li>
      </ol>
    </section>
  )
}

/** D'un appareil à l'autre, sans serveur : le schéma au trait de la page */
function TransferDiagram() {
  return (
    <Figure
      title="Comment la feuille passe d’un appareil à l’autre"
      desc="Le code de votre feuille va directement de l’écran d’un appareil à la caméra ou au clavier de l’autre. Aucun serveur ne le reçoit : il n’y en a pas."
      viewBox="0 0 360 214"
    >
      {/* Le téléphone, son QR code */}
      <rect class="dg-box dg-strong" x="14" y="62" width="84" height="144" rx="14" />
      <rect class="dg-box" x="30" y="100" width="52" height="52" />
      <rect class="dg-box dg-ink-box" x="35" y="105" width="13" height="13" />
      <rect class="dg-box dg-ink-box" x="64" y="105" width="13" height="13" />
      <rect class="dg-box dg-ink-box" x="35" y="134" width="13" height="13" />
      <text class="dg-small" x="56" y="186" text-anchor="middle">
        cet appareil
      </text>

      {/* L'ordinateur */}
      <rect class="dg-box dg-strong" x="230" y="92" width="118" height="80" />
      <path class="dg-box dg-strong" d="M218 184h142l-10-12H228z" />
      <text class="dg-small" x="289" y="136" text-anchor="middle">
        l’autre appareil
      </text>

      {/* Le code, d'écran à écran */}
      <Arrow x1={108} y1={134} x2={222} y2={134} tone="ink" />
      <text class="dg-small dg-ink-text" x="165" y="124" text-anchor="middle">
        le code
      </text>
      <text class="dg-small dg-ink-text" x="165" y="152" text-anchor="middle">
        d’écran à écran
      </text>

      {/* Le serveur qui n'existe pas */}
      <rect class="dg-box" x="122" y="10" width="116" height="44" />
      <text class="dg-label" x="180" y="37" text-anchor="middle">
        Serveur
      </text>
      <line class="dg-red dg-thick" x1="126" y1="50" x2="234" y2="14" />
      <text class="dg-small dg-red-text" x="180" y="74" text-anchor="middle">
        rien n’y passe
      </text>
    </Figure>
  )
}
