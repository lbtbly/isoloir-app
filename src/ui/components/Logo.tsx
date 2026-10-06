// Logo d'Isoloir en SVG en ligne. Disque, mot et ombre prennent la couleur du texte (currentColor,
// donc --print) : en mode sombre, la version blanche s'obtient d'elle-même. Géométrie : core/brand.ts.
import { DRAPE_ORDER, LOGO, OMBRE_OPACITE, belowBaseline, drapeColors, viewBoxOf, type LogoLayout, type LogoTone } from '../../core/brand'

interface LogoProps {
  /** Pictogramme à gauche du mot, au-dessus, ou seul */
  layout?: LogoLayout
  /** Rideau en pastels ou en gris */
  tone?: LogoTone
  /** Nom lu par les lecteurs d'écran ; sans titre, le logo est décoratif (masqué) */
  title?: string
  class?: string
}

export function Logo({ layout = 'horizontal', tone = 'color', title, class: c }: LogoProps) {
  const g = LOGO[layout]
  const colors = drapeColors(tone)
  const a11y = title ? { role: 'img' as const, 'aria-label': title } : { 'aria-hidden': 'true' as const }
  return (
    <svg
      class={['logo', `logo-${layout}`, c].filter(Boolean).join(' ')}
      viewBox={viewBoxOf(g.bounds)}
      // La largeur suit le viewBox ; la part sous la ligne de base sert à aligner un texte sur le mot
      style={{ '--logo-below': belowBaseline(g).toFixed(4) }}
      {...a11y}
    >
      <path fill="currentColor" fill-opacity={OMBRE_OPACITE} d={g.shadow} />
      <path fill="currentColor" d={g.disc} />
      {DRAPE_ORDER.map(k => (
        <path key={k} fill={colors[k]} d={g.drape[k]} />
      ))}
      {g.word ? <path fill="currentColor" d={g.word} /> : null}
    </svg>
  )
}
