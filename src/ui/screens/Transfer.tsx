// « Vos réponses, sur un autre appareil » (#/autre-appareil) : les réponses passent d'un appareil à l'autre dans un
// code de reprise (core/transfer), montré en QR code, en texte à copier, en image, ou gardé en copie dans un e-mail à
// soi-même (QR code en pièce jointe, code dans le message), puis
// lu ici par la caméra, une image ou au clavier. Rien ne passe par un serveur d'Isoloir : ni compte, ni adresse qui
// porte les réponses ; l'éditeur ne les voit jamais.
// Chargé à la demande (ui/screens/load.ts), avec le QR code et le codec : le code de chaque visite n'en contient rien.
// Dans l'application installée qui a son propre espace (iPhone, iPad, Safari du Mac : core/installed.ts), l'import ouvre sur
// « Coller le code » : le code copié dans le navigateur (page « Installer l'application ») se lit d'un geste ; après un
// import pris dans le presse-papiers, Isoloir le vide.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { downloadBlob } from '../../core/download'
import { CTA_START } from '../../core/resultsCopy'
import { appApart } from '../../core/installed'
import { importNotes, type ImportResult } from '../../core/exportData'
import type { SessionState } from '../../core/storage'
import { groupCode, normalizeCode } from '../../core/transfer/base32'
import { encodeTransfer, extractCode, looksLikeCode, parseCode } from '../../core/transfer/codec'
import { MAIL_SUBJECT, transferMailBody, transferMailto } from '../../core/transferMail'
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
import { readImportFile, startCamera, type CameraError } from '../transfer/read'

interface Props {
  pack: ElectionPack
  state: SessionState
  setState: (s: SessionState) => void
  /** #/autre-appareil/importer : la page s'ouvre sur « Importer mes réponses » */
  importing?: boolean
}

type Side = 'send' | 'receive'

/** Le rideau devant le QR code : tiré, en train de s'ouvrir, ouvert, en train de se refermer */
type Curtain = 'closed' | 'opening' | 'open' | 'closing'

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function Transfer({ pack, state, setState, importing }: Props) {
  const started = Object.keys(state.answers).length > 0
  const [side, setSide] = useState<Side>(importing || !started ? 'receive' : 'send')
  useEffect(() => {
    if (importing) setSide('receive')
  }, [importing])

  return (
    <div class="screen screen-wide screen-transfer">
      <FormHeader title="Transférer vos réponses" right={pack.election.shortName} />
      <main class="sheet wide-sheet transfer" id="contenu" tabIndex={-1}>
        <div class="transfer-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            Transférez vos réponses
          </h1>
          <p class="lede">Vers un autre téléphone, un ordinateur ou un autre navigateur, avec votre profil politique.</p>
          <ul class="trust transfer-proof">
            <li>
              <Icon name="check" />
              Rien ne passe par nos serveurs.
            </li>
            <li>
              <Icon name="check" />
              Nous ne voyons jamais vos réponses.
            </li>
            <li>
              <Icon name="check" />
              Sans compte, même en mode avion.
            </li>
          </ul>
        </div>

        <div class="transfer-work">
          <div class="segmented is-fit transfer-switch" role="group" aria-label="Que voulez-vous faire ?">
            <button type="button" aria-pressed={side === 'send'} onClick={() => setSide('send')}>
              <span class="switch-main">Transférer mes réponses</span>
              <span class="switch-sub">vers un autre appareil</span>
            </button>
            <button type="button" aria-pressed={side === 'receive'} onClick={() => setSide('receive')}>
              <span class="switch-main">Importer mes réponses</span>
              <span class="switch-sub">d’un autre appareil ou d’un e-mail</span>
            </button>
          </div>
          {side === 'send' ? <Send pack={pack} state={state} /> : <Receive pack={pack} state={state} setState={setState} />}
        </div>

        <figure class="transfer-how">
          <TransferDiagram />
          <figcaption class="small">Le code est fabriqué et lu sur vos appareils, nulle part ailleurs.</figcaption>
        </figure>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Transférer vos réponses">
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

/** Transférer : le QR code derrière le rideau, le code en texte à copier, l'image, la copie par e-mail */
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

  // L'image du QR code, fabriquée d'avance : le menu de partage doit s'ouvrir dans le geste même (Safari)
  const [png, setPng] = useState<{ blob: Blob; name: string; now: Date } | null>(null)
  useEffect(() => {
    if (!made) return
    let alive = true
    const now = new Date()
    renderTransferImage(pack, state, made.code, now)
      .then(canvasToPng)
      .then(blob => alive && setPng({ blob, name: transferImageName(pack, now), now }))
      .catch(() => alive && setPng(null))
    return () => {
      alive = false
    }
  }, [pack, state, made])

  if (!started) {
    return (
      <section class="transfer-panel on-copy" aria-labelledby="send-title">
        <h2 id="send-title" class="transfer-title">
          Aucune réponse à transférer
        </h2>
        <p>Répondez d’abord à quelques questions, ou importez celles d’un autre appareil.</p>
        <a class="btn-primary" href={link('/feuille/1')}>
          {CTA_START}
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
        <p>Le code n’a pas pu être fabriqué. Téléchargez plutôt votre double (JSON), depuis vos résultats.</p>
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
      setStatus('Code copié.')
    } catch {
      setStatus('Copie refusée par le navigateur : sélectionnez le code à la main.')
    }
  }

  const download = async () => {
    try {
      const now = new Date()
      const image = png ?? { blob: await canvasToPng(await renderTransferImage(pack, state, made.code, now)), name: transferImageName(pack, now) }
      downloadBlob(image.blob, image.name, 60_000)
      setStatus('Image enregistrée.')
    } catch {
      setStatus('Image impossible sur ce navigateur : copiez le code.')
    }
  }

  // La copie par e-mail : le menu de partage joint l'image et met le code dans le message ; sans lui (ordinateur sous
  // Firefox ou Linux…), l'image est téléchargée et la messagerie s'ouvre avec le code, l'image à joindre à la main
  const mail = async () => {
    const page = link('/autre-appareil/importer')
    const now = png?.now ?? new Date()
    const text = transferMailBody(pack, made.code, page, now)
    const file = png ? new File([png.blob], png.name, { type: 'image/png' }) : null
    if (file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file], text })) {
      try {
        await navigator.share({ files: [file], title: MAIL_SUBJECT, text })
        setStatus('Mettez votre adresse en destinataire, puis envoyez.')
      } catch (e) {
        if ((e as DOMException).name !== 'AbortError') setStatus('Échec du partage : copiez le code ou téléchargez l’image.')
      }
      return
    }
    if (png) downloadBlob(png.blob, png.name, 60_000)
    window.location.href = transferMailto(pack, made.code, page, now)
    setStatus(
      png
        ? `Image téléchargée : joignez-la au message (${png.name}), mettez votre adresse en destinataire, puis envoyez.`
        : 'Mettez votre adresse en destinataire, puis envoyez.',
    )
  }

  return (
    <section class="transfer-panel on-copy" aria-labelledby="send-title">
      <div class="transfer-send">
        <div class="transfer-send-head">
          <h2 id="send-title" class="transfer-title">
            Scannez ce QR code avec l’autre appareil
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
                    <p class="qr-curtain-note">Il contient toutes vos réponses : ouvrez à l’abri des regards.</p>
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
              Sur l’autre appareil, ouvrez Isoloir, puis <strong>Importer mes réponses</strong>.
            </li>
            <li>Scannez ce QR code, ou collez le code ci-dessous.</li>
          </ol>
          <div class="transfer-actions">
            <button type="button" class="btn-text" onClick={download}>
              <Icon name="download" />
              Télécharger le QR code (image)
            </button>
          </div>
        </div>
      </div>

      <div class="code-box">
        <h3 class="code-box-title">Ou copiez le code</h3>
        <p class="code-box-lede">Le même contenu, en texte, à coller sur l’autre appareil.</p>
        <p class={`code-text${shown ? '' : ' is-masked'}`} aria-label={shown ? 'Code de vos réponses' : 'Code masqué tant que le rideau est tiré'}>
          {groups.map((g, i) => (
            <span key={i} class="code-group">
              {shown ? g : '••••'}
            </span>
          ))}
        </p>
        <div class="code-box-actions">
          <button type="button" class="btn-primary is-outline" onClick={copy}>
            <Icon name="copy" />
            Copier le code
          </button>
        </div>
      </div>

      <div class="code-box mail-box">
        <h3 class="code-box-title">Gardez une copie par e-mail</h3>
        <p class="code-box-lede">QR code en pièce jointe, code dans le message : pour importer vos réponses plus tard.</p>
        <div class="code-box-actions">
          <button type="button" class="btn-primary is-outline" onClick={mail}>
            <Icon name="mail" />
            M’envoyer une copie
          </button>
        </div>
        <p class="small code-box-note">Mettez votre propre adresse en destinataire. Isoloir n’en reçoit rien.</p>
      </div>
      <p class="small transfer-status" role="status" aria-live="polite">
        {status}
      </p>

      <div class="transfer-warning" role="note">
        <svg class="transfer-warning-cross" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
        <div>
          <p class="transfer-warning-title">Ne le publiez jamais</p>
          <p>Sur un réseau social ou dans un groupe, n’importe qui pourrait lire chacune de vos réponses et vos lignes rouges.</p>
        </div>
      </div>
    </section>
  )
}

/** L'appareil de l'application à part, nommé dans la phrase d'import */
const where = (os: string | null) => (os === 'mac' ? 'ce Mac' : os === 'ipad' ? 'cet iPad' : 'cet iPhone')
/**
 * Le navigateur où les réponses ont été copiées : Safari sur Mac (seul à y faire une application à part) ; sur iPhone et
 * iPad, l'application a pu être ajoutée depuis Safari, Chrome, Edge ou Firefox, et ne sait pas lequel
 */
const fromOf = (os: string | null) => (os === 'mac' ? 'Safari' : 'le navigateur')
/** Le code que porte un texte (collé ou tapé), mis en forme : deux textes au même code se reconnaissent */
const codeIn = (text: string) => normalizeCode(extractCode(text))

const CAMERA_ERRORS: Record<CameraError, string> = {
  refusee: 'Caméra refusée. Autorisez-la dans les réglages du navigateur, ou choisissez une image.',
  absente: 'Pas de caméra ici : choisissez une image ou collez le code.',
  indisponible: 'Caméra indisponible sur ce navigateur : choisissez une image ou collez le code.',
}

/** Importer : la caméra, une image (ou le double) ou le code collé ; puis « Remplacer mes réponses » */
function Receive({ pack, state, setState }: Props) {
  const [text, setText] = useState('')
  const [camera, setCamera] = useState<'off' | 'starting' | 'on'>('off')
  const [cameraNote, setCameraNote] = useState<string | null>(null)
  const [imageNote, setImageNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Extract<ImportResult, { ok: true }> | null>(null)
  const video = useRef<HTMLVideoElement>(null)
  const file = useRef<HTMLInputElement>(null)
  const stopCamera = useRef<(() => void) | null>(null)
  const alive = useRef(true)
  const started = Object.keys(state.answers).length > 0
  // L'application à part : « Coller le code » en premier (A), le reste à la suite
  const apart = appApart()
  const letters = apart ? ['B', 'C', 'D'] : ['A', 'B', 'C']
  const [pasteNote, setPasteNote] = useState<string | null>(null)
  /** Les réponses trouvées viennent du presse-papiers : il sera vidé à l'import */
  const fromClip = useRef(false)
  /** Le dernier texte collé dans le champ : le code lu n'est pris du presse-papiers que s'il est celui-là */
  const pasted = useRef<string | null>(null)
  /** « Réponses trouvées » : le focus y passe, le bouton qui a lu le code n'est plus là */
  const found = useRef<HTMLHeadingElement>(null)

  useEffect(() => setError(null), [text])
  // Dans le même rendu que le titre : le focus ne passe jamais par la page entière
  useLayoutEffect(() => {
    if (pending) found.current?.focus()
  }, [pending])
  // Quitter la page ou l'onglet « Importer » arrête la caméra
  useEffect(
    () => () => {
      alive.current = false
      stopCamera.current?.()
    },
    [],
  )

  const read = (value: string) => {
    const res = parseCode(value, pack)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setError(null)
    // Collé puis effacé, ou retouché au clavier : ce n'est plus le presse-papiers, Isoloir n'y touche pas
    fromClip.current = pasted.current !== null && codeIn(pasted.current) === codeIn(value)
    setPending(res)
  }

  const closeCamera = () => {
    stopCamera.current?.()
    stopCamera.current = null
    setCamera('off')
  }

  const openCamera = async () => {
    if (!video.current) return
    setCameraNote(null)
    setCamera('starting')
    try {
      const stop = await startCamera(video.current, {
        onText: t => {
          const res = parseCode(t, pack)
          if (!res.ok) {
            setCameraNote('Ce QR code n’est pas un code d’Isoloir.')
            return false
          }
          stopCamera.current = null
          setCamera('off')
          fromClip.current = false
          setPending(res)
          return true
        },
        onStop: why => {
          stopCamera.current = null
          setCamera('off')
          setCameraNote(why === 'delai' ? 'Caméra fermée au bout de deux minutes.' : 'Caméra fermée.')
        },
      })
      if (!alive.current) return stop()
      stopCamera.current = stop
      setCamera(c => (c === 'starting' ? 'on' : c))
    } catch (e) {
      setCamera('off')
      setCameraNote(CAMERA_ERRORS[e as CameraError] ?? CAMERA_ERRORS.indisponible)
    }
  }

  const onFile = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement
    const f = input.files?.[0]
    input.value = ''
    if (!f) return
    setImageNote('Lecture de l’image…')
    const res = await readImportFile(f, pack)
    if (!alive.current) return
    if (!res.ok) {
      setImageNote(res.error)
      return
    }
    setImageNote(null)
    fromClip.current = false
    setPending(res)
  }

  // « Coller le code » : le presse-papiers lu dans le geste même (l'iPhone peut afficher sa bulle « Coller »), aussitôt
  const paste = () => {
    const clip = typeof navigator === 'undefined' ? undefined : navigator.clipboard
    if (!clip?.readText) {
      setPasteNote('Ce navigateur ne lit pas le presse-papiers : collez le code dans le champ D.')
      return
    }
    setPasteNote(null)
    // Où aller chercher le code, s'il n'est pas dans le presse-papiers
    const again = `Dans ${apart === 'mac' ? 'Safari' : 'le navigateur où vous aviez répondu'}, «\u00a0Installer l’application\u00a0», puis «\u00a0Copier le code\u00a0».`
    clip.readText().then(
      t => {
        if (!alive.current) return
        if (!t.trim()) {
          setPasteNote(`Le presse-papiers est vide. ${again}`)
          return
        }
        const res = parseCode(t, pack)
        if (!res.ok) {
          // Une adresse, un mot… : rien qui ressemble à un code (pas une faute de frappe : rien n'a été tapé)
          setPasteNote(looksLikeCode(t) ? res.error : `Le presse-papiers ne contient pas de code Isoloir. ${again}`)
          return
        }
        fromClip.current = true
        setPending(res)
      },
      () => alive.current && setPasteNote('Le presse-papiers n’a pas pu être lu : collez le code dans le champ D.'),
    )
  }

  const apply = (next: SessionState) => {
    // Pris dans le presse-papiers : vidé dans le geste même, le code n'y traîne plus
    if (fromClip.current) navigator.clipboard?.writeText('').catch(() => undefined)
    fromClip.current = false
    setPending(null)
    setState(next)
    go('/resultats')
  }

  if (pending) {
    const notes = importNotes(pending, pack)
    return (
      <section class="transfer-panel is-receive" aria-labelledby="receive-title">
        <h2 id="receive-title" class="transfer-title" tabIndex={-1} ref={found}>
          Réponses trouvées
        </h2>
        <p class="transfer-contents">{sheetContents(pending.state)}</p>
        <div class="notice" role="status">
          {started ? (
            <p>Elles remplaceront définitivement celles de cet appareil ({sheetContents(state)}).</p>
          ) : (
            <p>Votre dépouillement et votre profil politique suivront.</p>
          )}
          {notes.length ? <p>{notes.join(' ')}</p> : null}
          {fromClip.current ? <p>Isoloir videra aussi le presse-papiers.</p> : null}
          <div class="link-row">
            <button type="button" class="btn-primary" onClick={() => apply(pending.state)}>
              {started ? 'Remplacer mes réponses' : 'Importer ces réponses'}
            </button>
            <button
              type="button"
              class="btn-text"
              onClick={() => {
                fromClip.current = false
                setPending(null)
              }}
            >
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
        Importez vos réponses
      </h2>
      <p class="transfer-receive-lede">
        {apart ? `Copiées dans ${fromOf(apart)}, sur ${where(apart)}\u00a0? Collez-les ici.` : 'Depuis un autre appareil, ou depuis votre copie par e-mail.'}
      </p>
      <ol class="transfer-ways">
        {apart ? (
          <li>
            <span class="row-letter" aria-hidden="true">
              A
            </span>
            <div class="way">
              <h3>Coller le code</h3>
              <p>Le code copié dans {fromOf(apart)}, ou dans votre e-mail.</p>
              <button type="button" class="btn-primary" onClick={paste}>
                <Icon name="paste" />
                Coller le code
              </button>
              <p class="way-hint">
                {apart === 'mac'
                  ? 'Si le Mac affiche «\u00a0Coller\u00a0», cliquez-le.'
                  : `Si l’${apart === 'ipad' ? 'iPad' : 'iPhone'} affiche «\u00a0Coller\u00a0», touchez-le.`}
              </p>
              <p class="transfer-note" role="status">
                {pasteNote}
              </p>
            </div>
          </li>
        ) : null}
        <li>
          <span class="row-letter" aria-hidden="true">
            {letters[0]}
          </span>
          <div class="way">
            <h3>Scanner le QR code</h3>
            {/* Toujours là, caché tant que la caméra est fermée : la caméra s'y branche dans le geste même */}
            <div class="viewfinder" hidden={camera === 'off'}>
              <video ref={video} muted playsInline aria-label="Image de la caméra" />
              <span class="viewfinder-corners" aria-hidden="true" />
              <p class="viewfinder-hint">{camera === 'starting' ? 'Ouverture de la caméra…' : 'Visez le QR code'}</p>
            </div>
            {camera === 'off' ? <p>Avec la caméra. Rien n’est filmé ni envoyé.</p> : null}
            {camera === 'off' ? (
              <button type="button" class={apart ? 'btn-text' : 'btn-primary'} onClick={() => void openCamera()}>
                <Icon name="camera" />
                Ouvrir la caméra
              </button>
            ) : (
              <button type="button" class="btn-text" onClick={closeCamera}>
                Fermer la caméra
              </button>
            )}
            <p class="transfer-note" role="status">
              {cameraNote}
            </p>
          </div>
        </li>
        <li>
          <span class="row-letter" aria-hidden="true">
            {letters[1]}
          </span>
          <div class="way">
            <h3>Choisir une image</h3>
            <p>Pièce jointe de l’e-mail, capture d’écran ou photo du QR code.</p>
            <button type="button" class="btn-text" onClick={() => file.current?.click()}>
              <Icon name="image" />
              Choisir une image
            </button>
            {/* Hors de l'arbre d'accessibilité : le bouton porte l'action. Le double (JSON) y est lu aussi */}
            <input
              ref={file}
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.heic,application/json,.json,text/plain,.txt"
              class="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={e => void onFile(e)}
            />
            <p class="transfer-note" role="status">
              {imageNote}
            </p>
          </div>
        </li>
        <li>
          <span class="row-letter" aria-hidden="true">
            {letters[2]}
          </span>
          <div class="way">
            <h3>
              <label for="transfer-code">{apart ? 'Taper le code' : 'Coller ou taper le code'}</label>
            </h3>
            <p>{apart ? 'Recopié lettre par lettre, ou collé ici.' : 'Copié sur l’autre appareil ou dans l’e-mail.'}</p>
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
              onPaste={e => (pasted.current = e.clipboardData?.getData('text') ?? null)}
              aria-describedby={error ? 'transfer-error' : undefined}
              aria-invalid={error ? true : undefined}
            />
            {error ? (
              <p id="transfer-error" class="transfer-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="button" class="btn-text" disabled={!text.trim()} onClick={() => read(text)}>
              <Icon name="keyboard" />
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
