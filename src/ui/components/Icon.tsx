// Pictogrammes dessinés, trait unique de 1,75 px, extrémités rondes.
const PATHS: Record<string, string> = {
  'arrow-right': 'M5 12h13M13 6l6 6-6 6',
  'arrow-left': 'M19 12H6M11 6l-6 6 6 6',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
  share: 'M12 15V4M8 8l4-4 4 4M6 12v7h12v-7',
  external: 'M14 5h5v5M19 5l-8 8M18 14v5H5V6h5',
  erase: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
  // Haut-parleur : la voix des vidéos (même dessin que le pictogramme du lecteur)
  voice: 'M4 9.5h3.4L12 5.6v12.8l-4.6-3.9H4zM15.4 9.2a4 4 0 0 1 0 5.6M18 6.6a7.6 7.6 0 0 1 0 10.8',
  info: 'M12 11v6M12 7.5v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  cross: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  chevron: 'M9.5 6l6 6-6 6',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.5M4.5 12h.5M4.5 18h.5',
  deepen: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM15.5 15.5L20 20M10.5 7.5v6M7.5 10.5h6',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 7.5L20 18M8.5 16.5L20 6',
  // Étoile d'un thème prioritaire : remplie d'encre quand le thème compte double
  star: 'M12 3.6l2.55 5.2 5.7.83-4.13 4.02.98 5.68L12 16.65l-5.1 2.68.98-5.68-4.13-4.02 5.7-.83z',
  plane:
    'M12 2.8c.8 0 1.4.7 1.4 1.6v5l7.1 4.2v2l-7.1-2.1v4.2l2.3 1.8v1.7L12 20.3l-3.7.9v-1.7l2.3-1.8v-4.2l-7.1 2.1v-2l7.1-4.2v-5c0-.9.6-1.6 1.4-1.6z',
}

export function Icon({ name, class: c }: { name: keyof typeof PATHS | string; class?: string }) {
  return (
    <svg class={['icon', c].filter(Boolean).join(' ')} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name] ?? ''} />
    </svg>
  )
}
