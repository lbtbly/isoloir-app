// Pictogrammes du lecteur vidéo, au trait comme les autres (trait 1,75, extrémités rondes ; .icon d'app.css).

const PATHS = {
  play: 'M7.5 5.2v13.6L18.5 12z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  replay: 'M4.6 12a7.4 7.4 0 1 0 2.2-5.2M4.6 4.3v3.4H8',
  voice: 'M4 9.5h3.4L12 5.6v12.8l-4.6-3.9H4zM15.4 9.2a4 4 0 0 1 0 5.6M18 6.6a7.6 7.6 0 0 1 0 10.8',
  mute: 'M4 9.5h3.4L12 5.6v12.8l-4.6-3.9H4zM16 9.5l5 5M21 9.5l-5 5',
  sources: 'M9 6h11M9 12h11M9 18h11M4.5 6h.5M4.5 12h.5M4.5 18h.5',
  fiche: 'M6.5 3.5h7.5l4 4v13h-11.5zM14 3.5v4h4M9.5 12h6M9.5 15.5h6',
  close: 'M6 6l12 12M18 6L6 18',
  up: 'M12 19V5.5M6 11l6-6 6 6',
  down: 'M12 5v13.5M6 13l6 6 6-6',
  grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
  next: 'M5 12h13M13 6l6 6-6 6',
  // Sommaire d'une série : des lignes, et la marque de lecture
  playlist: 'M4 6h13M4 11h13M4 16h7M14.5 14v6.5l5.5-3.25z',
} as const

export type GlyphName = keyof typeof PATHS

export function Glyph({ name, class: c }: { name: GlyphName; class?: string }) {
  return (
    <svg class={['icon', 'vp-glyph', c].filter(Boolean).join(' ')} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
