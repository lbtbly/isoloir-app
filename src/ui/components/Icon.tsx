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
  // « Mon profil politique » : un filet horizontal à cinq graduations, les cinq blocs de la grille
  axis: 'M3 12h18M4 8.5v7M8 8.5v7M12 8.5v7M16 8.5v7M20 8.5v7',
  // « À table » : le plan d'une table, vue de dessus, et une chaise sur chaque côté, son dossier tourné vers
  // l'extérieur, détachée de la table (redessinée le 2026-10-15 : les quatre traits d'avant se lisaient comme un
  // soleil, et des arcs autour d'une table ronde comme un signal radio)
  table: 'M6.5 9h11v6h-11zM10 7V4.75h4V7M10 17v2.25h4V17M4.5 10H2.25v4H4.5M19.5 10h2.25v4H19.5',
  // Les entrées du menu (demande du propriétaire du 2026-10-15), avec « table » ci-dessus. « Les sujets » : une page
  // imprimée au coin replié, et ses lignes
  topics: 'M6 3.5h8.5L18 7v13.5H6zM14.5 3.5V7H18M9 11h6M9 14.25h6M9 17.5h3.5',
  // « Les vidéos » : un écran, et le triangle de lecture
  videos: 'M3.5 5.5h17v13h-17zM10.25 9.1v5.8L15 12z',
  // « Les candidats » : deux silhouettes, l'une derrière l'autre
  people: 'M9 11.25a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2zM3.5 19.5c0-3.2 2.4-5.6 5.5-5.6s5.5 2.4 5.5 5.6M15.4 5.2a3 3 0 0 1 0 5.9M17.2 14.1c2 .6 3.3 2.6 3.3 5.4',
  // « Relire mes réponses » (pied de page) : un œil
  reread: 'M2.75 12S6 6 12 6s9.25 6 9.25 6S18 18 12 18 2.75 12 2.75 12zM12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z',
  // Comparer : deux colonnes côte à côte
  compare: 'M4.5 5h5.5v14H4.5zM14 5h5.5v14H14z',
  // Plus : ajouter (un candidat à la comparaison)
  plus: 'M12 5v14M5 12h14',
  // Relations entre deux candidats (page « Comparer ») : des signes imprimés, doublés d'un mot partout où ils paraissent
  'rel-same': 'M5 9h14M5 15h14',
  'rel-close': 'M4.5 9.6c2.5-2.2 5-2.2 7.5 0s5 2.2 7.5 0M4.5 15.6c2.5-2.2 5-2.2 7.5 0s5 2.2 7.5 0',
  'rel-different': 'M5 9h14M5 15h14M15 4.5L9 19.5',
  'rel-opposed': 'M10 12H3M6.5 8.5L3 12l3.5 3.5M14 12h7M17.5 8.5L21 12l-3.5 3.5',
  'rel-unknown': 'M9 9.2a3 3 0 1 1 4.2 2.75c-.75.33-1.2 1-1.2 1.8V15M12 18.6v.2',
  // « Transférez vos réponses » (ui/screens/Transfer.tsx) : QR code, caméra, image, copier, e-mail, clavier
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM20 14v2.5M14 20h2.5M19 19h1v1h-1z',
  camera: 'M4 8.5h3l1.6-2.5h6.8L17 8.5h3V19H4zM12 16.6a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17.5M15.5 9.5v.5',
  copy: 'M8.5 8.5h11v11h-11zM15.5 8.5V4.5h-11v11h4',
  mail: 'M3.5 6h17v12h-17zM3.5 6.5l8.5 7 8.5-7',
  keyboard: 'M3 7h18v10H3zM6.5 10.5h1M10 10.5h1M13.5 10.5h1M17 10.5h.5M7.5 14h9',
  // Journal des données : une flèche montante (revenir aux filtres), les filtres (trois réglettes et leurs curseurs),
  // une calculatrice pour « Calcul et pages du site »
  'arrow-up': 'M12 19V6M6 11l6-6 6 6',
  filters: 'M4 7h9M17 7h3M15 5v4M4 12h3M11 12h9M9 10v4M4 17h11M19 17h1M17 15v4',
  calc: 'M6.5 3.5h11v17h-11zM9 7h6v2.5H9zM9.25 13h.5M12 13h.5M14.75 13h.5M9.25 16.5h.5M12 16.5h.5M14.75 16.5h.5',
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
