// Schémas au trait, dans le monde « Le dépouillement » : l'imprimé pour le décor, le bleu pour ce
// que fait l'utilisateur, le rouge pour ce qui est refusé. Chaque schéma porte un titre accessible.

import type { ComponentChildren } from 'preact'

function Arrow({ x1, y1, x2, y2, tone = 'print' }: { x1: number; y1: number; x2: number; y2: number; tone?: 'print' | 'ink' | 'red' }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = 7
  const p1 = `${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)}`
  const p2 = `${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`
  return (
    <g class={`dg-${tone}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline points={`${p1} ${x2},${y2} ${p2}`} />
    </g>
  )
}

function Cross({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return (
    <g class="dg-red dg-thick">
      <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} />
      <line x1={x + r} y1={y - r} x2={x - r} y2={y + r} />
    </g>
  )
}

function Figure({ title, desc, viewBox, children }: { title: string; desc: string; viewBox: string; children: ComponentChildren }) {
  const id = title.replace(/\W+/g, '-').toLowerCase()
  return (
    <svg class="diagram" viewBox={viewBox} role="img" aria-labelledby={`${id}-t ${id}-d`}>
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      {children}
    </svg>
  )
}

/** Où vont vos réponses : tout reste dans l'appareil ; l'hébergeur n'envoie que l'application */
export function FlowDiagram() {
  return (
    <Figure
      title="Où vont vos réponses"
      desc="Vos réponses, le calcul et vos résultats restent dans votre appareil. Il n’existe pas de serveur Isoloir. L’hébergeur envoie seulement les fichiers de l’application, une fois ; aucune réponse ne repart vers lui. Pas de mesure d’audience, de cookie ni de publicité."
      viewBox="0 0 360 372"
    >
      <rect class="dg-box dg-strong" x="8" y="12" width="156" height="348" rx="20" />
      <text class="dg-label dg-bold" x="86" y="44" text-anchor="middle">
        Votre appareil
      </text>
      {['Vos réponses', 'Le calcul', 'Vos résultats'].map((t, i) => (
        <g key={t}>
          <rect class="dg-box dg-ink-box" x="26" y={66 + i * 96} width="120" height="58" />
          <text class="dg-label dg-ink-text" x="86" y={100 + i * 96} text-anchor="middle">
            {t}
          </text>
        </g>
      ))}
      <Arrow x1={86} y1={126} x2={86} y2={158} tone="ink" />
      <Arrow x1={86} y1={222} x2={86} y2={254} tone="ink" />

      <rect class="dg-box" x="206" y="28" width="146" height="54" />
      <text class="dg-label" x="279" y="60" text-anchor="middle">
        Serveur Isoloir
      </text>
      <line class="dg-red dg-thick" x1="210" y1="78" x2="348" y2="32" />
      <text class="dg-small dg-red-text" x="279" y="102" text-anchor="middle">
        il n’existe pas
      </text>

      <rect class="dg-box" x="206" y="134" width="146" height="96" />
      <text class="dg-label" x="279" y="160" text-anchor="middle">
        Hébergeur du site
      </text>
      <text class="dg-small" x="216" y="188">
        envoie l’application
      </text>
      <text class="dg-small dg-red-text" x="216" y="214">
        reçoit : aucune réponse
      </text>
      <Arrow x1={204} y1={184} x2={168} y2={184} />
      <Arrow x1={168} y1={210} x2={204} y2={210} tone="red" />
      <Cross x={186} y={210} r={6} />

      <rect class="dg-box" x="206" y="284" width="146" height="54" />
      <text class="dg-label" x="279" y="308" text-anchor="middle">
        Audience, cookies,
      </text>
      <text class="dg-label" x="279" y="327" text-anchor="middle">
        publicité
      </text>
      <line class="dg-red dg-thick" x1="210" y1="334" x2="348" y2="288" />
    </Figure>
  )
}

/** Le verrou : la page ne peut pas ouvrir de connexion vers l'extérieur */
export function LockDiagram() {
  const rows = [
    { y: 64, label: 'envoi de données' },
    { y: 112, label: 'police ou script tiers' },
    { y: 160, label: 'traceur' },
  ]
  return (
    <Figure
      title="Le verrou de sécurité"
      desc="La page déclare une politique de sécurité qui bloque toute connexion vers l’extérieur : envoi de données, polices ou scripts tiers, traceurs."
      viewBox="0 0 360 212"
    >
      <rect class="dg-box dg-strong" x="8" y="24" width="112" height="168" />
      <text class="dg-label dg-bold" x="64" y="104" text-anchor="middle">
        Cette page
      </text>
      <text class="dg-small" x="64" y="124" text-anchor="middle">
        Isoloir
      </text>
      <line class="dg-strong-line" x1="196" y1="18" x2="196" y2="198" />
      <line class="dg-strong-line" x1="202" y1="18" x2="202" y2="198" />
      <text class="dg-small dg-bold" x="199" y="12" text-anchor="middle">
        verrou CSP
      </text>
      {rows.map(r => (
        <g key={r.label}>
          <Arrow x1={122} y1={r.y} x2={192} y2={r.y} tone="red" />
          <Cross x={199} y={r.y} r={7} />
          <text class="dg-small" x="214" y={r.y + 4}>
            {r.label}
          </text>
        </g>
      ))}
    </Figure>
  )
}

/** Le principe : des approches sans nom, puis la révélation */
export function BlindDiagram() {
  return (
    <Figure
      title="Les idées avant les noms"
      desc="Pendant le questionnaire, vous donnez votre avis sur des approches présentées sans nom et dans un ordre tiré au hasard. Les noms des candidats n’apparaissent qu’au dépouillement."
      viewBox="0 0 360 170"
    >
      {[0, 1, 2].map(i => {
        const y = 33 + i * 50
        // Une réglette d'avis par approche : la première approuvée, la troisième refusée
        const mark = i === 0 ? 62 : i === 2 ? 18 : null
        return (
          <g key={i}>
            <rect class="dg-box" x="8" y={14 + i * 50} width="150" height="38" />
            <g class="dg-print">
              <line x1="18" y1={y} x2="62" y2={y} />
              {[18, 62].map(x => (
                <line key={x} x1={x} y1={y - 5} x2={x} y2={y + 5} />
              ))}
            </g>
            <circle class="dg-open-dot" cx="40" cy={y} r="2.4" />
            {mark ? (
              <>
                <circle class={`dg-tone-dot${i === 2 ? ' is-low' : ''}`} cx={mark} cy={y} r="2.6" />
                <circle class={`dg-tone-ring${i === 2 ? ' is-low' : ''}`} cx={mark} cy={y} r="7" />
              </>
            ) : null}
            <line class="dg-soft" x1="76" y1={y} x2={140 - i * 14} y2={y} />
            <text class="dg-small" x="150" y={y + 4} text-anchor="end">
              ?
            </text>
          </g>
        )
      })}
      <Arrow x1={170} y1={85} x2={200} y2={85} tone="ink" />
      {['C1', 'C2', 'C3'].map((t, i) => (
        <g key={t}>
          <rect class="dg-box" x="208" y={14 + i * 50} width="144" height="38" />
          <circle class="dg-chip" cx={232} cy={33 + i * 50} r={12} />
          <text class="dg-chip-text" x={232} y={37 + i * 50} text-anchor="middle">
            {t}
          </text>
          <line class="dg-soft" x1="254" y1={33 + i * 50} x2={336 - i * 14} y2={33 + i * 50} />
        </g>
      ))}
    </Figure>
  )
}

/** La méthode de collecte : sources, vérification, approches anonymes */
export function MethodDiagram() {
  const steps = [
    { label: 'Sources publiques', sub: 'professions de foi, débats' },
    { label: 'Vérification', sub: 'automatique, contre la source' },
    { label: 'Approches sans nom', sub: 'formulation neutre' },
  ]
  return (
    <Figure
      title="Comment les positions sont établies"
      desc="Les positions viennent de sources publiques : professions de foi, programmes, débats. Chaque attribution est vérifiée automatiquement, par une IA, contre sa source ; une attribution douteuse devient « inconnue ». Elles sont ensuite reformulées en approches neutres, sans nom."
      viewBox="0 0 360 196"
    >
      {steps.map((s, i) => (
        <g key={s.label}>
          <rect class="dg-box" x="8" y={8 + i * 64} width="268" height="48" />
          <text class="dg-step" x="26" y={39 + i * 64}>
            {i + 1}
          </text>
          <text class="dg-label dg-bold" x="52" y={30 + i * 64}>
            {s.label}
          </text>
          <text class="dg-small" x="52" y={47 + i * 64}>
            {s.sub}
          </text>
          {i < 2 ? <Arrow x1={142} y1={58 + i * 64} x2={142} y2={70 + i * 64} /> : null}
        </g>
      ))}
      <rect class="dg-box dg-stamp" x="286" y="76" width="66" height="40" />
      <text class="dg-small dg-bold" x="319" y="93" text-anchor="middle">
        douteux ?
      </text>
      <text class="dg-small" x="319" y="108" text-anchor="middle">
        → inconnu
      </text>
    </Figure>
  )
}

/** Fermer l'isoloir : la page se charge une fois, le réseau est coupé, rien ne peut sortir */
export function AirplaneDiagram() {
  const steps = [
    { title: 'La page se charge', sub: 'une seule fois' },
    { title: 'Mode avion', sub: 'réseau coupé' },
    { title: 'Vous répondez', sub: 'rien ne sort' },
  ]
  return (
    <Figure
      title="Fermer l’isoloir avec le mode avion"
      desc="Trois étapes. Un : la page Isoloir se charge, une seule fois. Deux : vous passez en mode avion, le réseau est coupé. Trois : vous répondez et dépouillez sur l’appareil ; rien ne peut en sortir."
      viewBox="0 0 360 206"
    >
      {steps.map((s, i) => {
        const cx = 60 + i * 120
        return (
          <g key={s.title}>
            <text class="dg-step" x={cx - 54} y={68}>
              {i + 1}
            </text>
            <rect class="dg-box dg-strong" x={cx - 32} y={46} width={64} height={112} rx={10} />
            <line class="dg-soft" x1={cx - 8} y1={56} x2={cx + 8} y2={56} />
            <text class="dg-small dg-bold" x={cx} y={180} text-anchor="middle">
              {s.title}
            </text>
            <text class={`dg-small${i === 2 ? ' dg-red-text' : ''}`} x={cx} y={196} text-anchor="middle">
              {s.sub}
            </text>
          </g>
        )
      })}

      {/* 1. L'application arrive */}
      <Arrow x1={60} y1={8} x2={60} y2={40} />
      <line class="dg-soft" x1={42} y1={80} x2={78} y2={80} />
      <line class="dg-soft" x1={42} y1={94} x2={70} y2={94} />
      <line class="dg-soft" x1={42} y1={108} x2={74} y2={108} />
      <line class="dg-soft" x1={42} y1={122} x2={62} y2={122} />

      {/* 2. Le réseau est coupé */}
      <Arrow x1={180} y1={8} x2={180} y2={40} />
      <Cross x={180} y={22} r={7} />
      <path
        class="dg-plane"
        transform="translate(158.4 80.4) scale(1.8)"
        vector-effect="non-scaling-stroke"
        d="M12 2.8c.8 0 1.4.7 1.4 1.6v5l7.1 4.2v2l-7.1-2.1v4.2l2.3 1.8v1.7L12 20.3l-3.7.9v-1.7l2.3-1.8v-4.2l-7.1 2.1v-2l7.1-4.2v-5c0-.9.6-1.6 1.4-1.6z"
      />

      {/* 3. Vos réponses restent : rien ne peut sortir */}
      <Arrow x1={300} y1={40} x2={300} y2={8} tone="red" />
      <Cross x={300} y={22} r={7} />
      <g class="dg-print">
        <line x1={278} y1={86} x2={322} y2={86} />
        {[278, 322].map(x => (
          <line key={x} x1={x} y1={81} x2={x} y2={91} />
        ))}
      </g>
      <circle class="dg-open-dot" cx={300} cy={86} r={2.4} />
      <circle class="dg-tone-dot" cx={322} cy={86} r={2.6} />
      <circle class="dg-tone-ring" cx={322} cy={86} r={7} />
      <g class="dg-ink">
        <line x1={284} y1={106} x2={284} y2={128} />
        <line x1={291} y1={105} x2={291} y2={128} />
        <line x1={298} y1={106} x2={298} y2={127} />
        <line x1={305} y1={105} x2={305} y2={128} />
        <line x1={279} y1={124} x2={311} y2={109} />
      </g>
    </Figure>
  )
}
