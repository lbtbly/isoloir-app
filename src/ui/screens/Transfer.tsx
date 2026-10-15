// « Vos réponses, sur un autre appareil » (#/autre-appareil) : les réponses passent d'un appareil à l'autre dans un
// code de reprise (core/transfer), montré en QR code, en texte à copier, en image ou dans un e-mail à soi-même, puis
// lu ici par la caméra, une image ou au clavier. Rien ne passe par un serveur d'Isoloir : ni compte, ni adresse qui
// porte les réponses ; l'éditeur ne les voit jamais.
// Chargé à la demande (ui/screens/load.ts), avec le QR code et le codec : le code de chaque visite n'en contient rien.

import { useEffect, useMemo, useState } from 'preact/hooks'
import { downloadBlob } from '../../core/download'
import { importNotes, type ImportResult } from '../../core/exportData'
import type { SessionState } from '../../core/storage'
import { groupCode } from '../../core/transfer/base32'
import { encodeTransfer, parseCode } from '../../core/transfer/codec'
import { transferMailto } from '../../core/transfer/mail'
import { qrModules, qrPath } from '../../core/transfer/qr'
import { sheetContents } from '../../core/transfer/summary'
import { canvasToPng, renderTransferImage, transferImageName } from '../../core/transferImage'
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

/** Le rideau devant le QR code : tiré, en train de s'ouvrir, ouvert, en train de se refermer */
type Curtain = 'closed' | 'opening' | 'open' | 'closing'

/** Pictogrammes propres à la page, au trait des autres (ui/components/Icon.tsx) */
const GLYPHS = {
  camera: 'M4 8.5h3l1.6-2.5h6.8L17 8.5h3V19H4zM12 16.6a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17.5M15.5 9.5v.5',
  copy: 'M8.5 8.5h11v11h-11zM15.5 8.5V4.5h-11v11h4',
  keyboard: 'M3 7h18v10H3zM6.5 10.5h1M10 10.5h1M13.5 10.5h1M17 10.5h.5M7.5 14h9',
  mail: 'M3.5 6h17v12h-17zM3.5 6.5l8.5 7 8.5-7',
} as const

function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={GLYPHS[name]} />
    </svg>
  )
}

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function Transfer({ pack, state, setState }: Props) {
  const started = Object.keys(state.answers).length > 0
  const [side, setSide] = useState<Side>(started ? 'send' : 'receive')

  return (
    <div class="screen screen-wide screen-transfer">
      <FormHeader title="Autre appareil" right={pack.election.shortName} />
      <main class="sheet wide-sheet transfer" id="contenu" tabIndex={-1}>
        <div class="transfer-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            Vos réponses, sur un autre appareil
          </h1>
          <p class="lede">
            Retrouvez vos réponses et votre profil politique sur un autre téléphone, un ordinateur ou un autre
            navigateur. Elles passent directement d’un appareil à l’autre, dans un code.
          </p>
          <ul class="trust transfer-proof">
            <li>
              <Icon name="check" />
              Jamais par nos serveurs : il n’y en a pas pour les recevoir.
            </li>
            <li>
              <Icon name="check" />
              Nous ne voyons jamais vos réponses, ni ce code.
            </li>
            <li>
              <Icon name="check" />
              Sans compte, et même en mode avion.
            </li>
          </ul>
        </div>

        <div class="transfer-work">
          <div class="segmented is-fit transfer-switch" role="group" aria-label="Que voulez-vous faire ?">
            <button type="button" aria-pressed={side === 'send'} onClick={() => setSide('send')}>
              <span class="switch-main">Transférer mes réponses</span>
              <span class="switch-sub">de cet appareil vers un autre</span>
            </button>
            <button type="button" aria-pressed={side === 'receive'} onClick={() => setSide('receive')}>
              <span class="switch-main">Récupérer mes réponses</span>
              <span class="switch-sub">d’un autre appareil vers celui-ci</span>
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

/** Transférer : le QR code derrière le rideau, le code en texte à copier, l'e-mail, l'image */
function Send({ pack, state }: { pack: ElectionPack; state: SessionState }) {
  const [curtain, setCurtain] = useState<Curtain>('closed')
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
          Pas encore de réponses à transférer
        </h2>
        <p>Cet appareil n’a encore aucune réponse. Répondez à quelques questions, ou récupérez ici celles d’un autre appareil.</p>
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
          Pas de code pour ces réponses
        </h2>
        <p>Le code n’a pas pu être fabriqué. Votre double (JSON), dans vos résultats, emporte aussi toutes vos réponses.</p>
      </section>
    )
  }

  const shown = curtain !== 'closed'
  const side = made.modules.length + 8
  const today = new Date().toISOString().slice(0, 10)
  const groups = groupCode(made.code)

  const open = () => setCurtain(reducedMotion() ? 'open' : 'opening')
  const close = () => setCurtain(reducedMotion() ? 'closed' : 'closing')
  const settle = () => setCurtain(c => (c === 'opening' ? 'open' : c === 'closing' ? 'closed' : c))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(made.code)
      setStatus('Code copié. Collez-le où vous voulez : un message à vous-même, vos notes, ou Isoloir sur l’autre appareil.')
    } catch {
      setStatus('Le navigateur a refusé la copie. Sélectionnez le code à la main, ou envoyez-le vous par e-mail.')
    }
  }

  const image = async (share: boolean) => {
    setStatus('Fabrication de l’image…')
    try {
      const now = new Date()
      const blob = await canvasToPng(await renderTransferImage(pack, state, made.code, now))
      const name = transferImageName(pack, now)
      const file = new File([blob], name, { type: 'image/png' })
      if (share && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Mes réponses, à reprendre' })
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
  const canShareFiles =
    typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })

  return (
    <section class="transfer-panel on-copy" aria-labelledby="send-title">
      <div class="transfer-send">
        <div class="transfer-send-head">
          <h2 id="send-title" class="transfer-title">
            Montrez ce code à l’autre appareil
          </h2>
          <Stamp date={today} label="Réponses du" />
          <p class="transfer-contents">{sheetContents(state)}</p>
        </div>

        <div class="transfer-qr">
          <div class="qr-plate">
            {shown ? (
              <svg class="qr" viewBox={`0 0 ${side} ${side}`} role="img" aria-label="QR code de vos réponses">
                <path d={made.path} />
              </svg>
            ) : null}
            {curtain !== 'open' ? (
              <div class={`qr-curtain is-${curtain}`} onAnimationEnd={settle}>
                <div class="qr-drape" aria-hidden="true">
                  <svg class="qr-pleats" preserveAspectRatio="none">
                    <defs>
                      <pattern id="qr-pleats" width="46" height="40" patternUnits="userSpaceOnUse">
                        <path d="M6 0v40M19.5 0v40M34 0v40" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#qr-pleats)" />
                  </svg>
                </div>
                {curtain === 'closed' ? (
                  <div class="qr-curtain-content">
                    <button type="button" class="btn-primary" onClick={open}>
                      Montrer le QR code
                    </button>
                    <p class="qr-curtain-note">Derrière le rideau : toutes vos réponses. Ouvrez-le à l’abri des regards.</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {curtain === 'open' ? (
            <button type="button" class="btn-text" onClick={close}>
              Refermer le rideau
            </button>
          ) : null}
        </div>

        <div class="transfer-side">
          <ol class="transfer-steps">
            <li>
              Sur l’autre appareil, ouvrez Isoloir, puis <strong>Autre appareil</strong> et{' '}
              <strong>Récupérer mes réponses</strong>.
            </li>
            <li>Visez ce QR code avec sa caméra, ou collez-y le code en texte.</li>
          </ol>
          <div class="transfer-actions">
            <button type="button" class="btn-text" onClick={() => image(false)}>
              <Icon name="download" />
              Télécharger l’image du QR code
            </button>
            {canShareFiles ? (
              <button type="button" class="btn-text" onClick={() => image(true)}>
                <Icon name="share" />
                Partager l’image
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div class="code-box">
        <h3 class="code-box-title">Le code en texte</h3>
        <p class="code-box-lede">
          Le même contenu que le QR code, en lettres et en chiffres : à coller ensuite dans Isoloir, sur l’autre appareil.
        </p>
        <p class={`code-text${shown ? '' : ' is-masked'}`} aria-label={shown ? 'Code de vos réponses' : 'Code masqué tant que le rideau est tiré'}>
          {groups.map((g, i) => (
            <span key={i} class="code-group">
              {shown ? g : '••••'}
            </span>
          ))}
        </p>
        <div class="code-box-actions">
          <button type="button" class="btn-frame" onClick={copy}>
            <Glyph name="copy" />
            Copier le code
          </button>
          <a class="btn-frame" href={transferMailto(pack, made.code)}>
            <Glyph name="mail" />
            Me l’envoyer par e-mail
          </a>
        </div>
        <p class="small code-box-note">
          Par e-mail, votre messagerie s’ouvre avec le code et la marche à suivre : mettez-y votre propre adresse comme
          destinataire, puis envoyez. Votre messagerie en gardera une copie.
        </p>
        <p class="small" role="status" aria-live="polite">
          {status}
        </p>
      </div>

      <div class="transfer-warning" role="note">
        <svg class="transfer-warning-cross" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
        <div>
          <p class="transfer-warning-title">Ne publiez jamais ce QR code ni ce code</p>
          <p>
            Ni sur les réseaux sociaux, ni dans un groupe de discussion : n’importe qui pourrait y lire chacune de vos
            réponses, question par question, et vos lignes rouges. Montrez-le seulement à vos propres appareils.
          </p>
        </div>
      </div>
    </section>
  )
}

/** Récupérer : la caméra, une image ou le code collé ; puis « Remplacer mes réponses » */
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
          Vos réponses sont prêtes
        </h2>
        <p class="transfer-contents">{sheetContents(pending.state)}</p>
        <div class="notice" role="status">
          {started ? (
            <p>
              Elles remplaceront les réponses de cet appareil, qui ne pourront pas être retrouvées. Sur cet appareil
              aujourd’hui : {sheetContents(state)}.
            </p>
          ) : (
            <p>Elles deviendront les réponses de cet appareil, avec votre dépouillement et votre profil politique.</p>
          )}
          {notes.length ? <p>{notes.join(' ')}</p> : null}
          <div class="link-row">
            <button type="button" class="btn-primary" onClick={() => apply(pending.state)}>
              {started ? 'Remplacer mes réponses' : 'Récupérer ces réponses'}
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
        Récupérez ici vos réponses
      </h2>
      <p class="transfer-receive-lede">Sur l’autre appareil, ouvrez cette même page et choisissez « Transférer mes réponses ».</p>
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
            <p>L’image du QR code téléchargée, une capture d’écran ou une photo de l’autre écran.</p>
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
              <label for="transfer-code">Coller ou taper le code</label>
            </h3>
            <p>Le code en texte, copié sur l’autre appareil ou reçu dans votre e-mail.</p>
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
      title="Comment vos réponses passent d’un appareil à l’autre"
      desc="Le code de vos réponses va directement de l’écran d’un appareil à la caméra ou au clavier de l’autre. Aucun serveur ne le reçoit : il n’y en a pas."
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
        Nos serveurs
      </text>
      <line class="dg-red dg-thick" x1="126" y1="50" x2="234" y2="14" />
      <text class="dg-small dg-red-text" x="180" y="74" text-anchor="middle">
        rien n’y passe
      </text>
    </Figure>
  )
}
