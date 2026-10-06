// Piste C, les pictogrammes : une petite bibliothèque au trait, commune à tous les thèmes. Chacun tient dans un
// carré de 48 unités, se dessine trait après trait, et garde l'épaisseur d'encre de la feuille à toutes les
// tailles. Ils sont sans attribut : une personne n'est qu'une tête et des épaules (ni genre, ni âge, ni
// métier), aucun objet ne porte de couleur, de logo ni de symbole partisan.
//
// Tons : encre d'imprimerie ; « count » (bleu bille, avec un aplat léger) pour ce que le passage compte ;
// « ghost » (pointillé gris) pour ce qui manque ou n'est que projeté ; « soft » pour le décor.
// Pour un nouveau thème : ajouter un pictogramme ici (traits dans l'ordre du dessin, silhouette pour l'aplat),
// et, s'il le faut, un mot qui l'appelle dans LEXIQUE.

import { Fade, Ink, cls, fold, type Tone } from './encre'

interface Def {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat (lumière d'une fenêtre, sable, part comptée) */
  fill?: string
  /** Index des traits fins (détails) et appuyés */
  thin?: number[]
  bold?: number[]
  /** Où écrire un mot dans le pictogramme : centre, ligne de base, largeur utile */
  text?: [number, number, number]
}

/** La France métropolitaine simplifiée, à l'échelle (projection plate, environ 0,2° par unité) */
const FRANCE = 'M27 3.1L29.2 4.7L32.6 8.1L34.7 7.9L37.9 10.6L40 11.1L42 12.5L46 13.3L43.8 20.1L42 20.8L41.6 21.6L38.9 25L38.6 27.2L41.3 26L42 28.4L41 32.3L42 33.5L41.6 36.2L43.8 38.6L42 39.9L40.6 41.8L38.3 42.1L36.3 41.3L34.2 40.8L32.1 39.9L29.2 41.3L28.5 43.8L29 45.2L25.2 45.5L23.2 44.5L20.6 43.5L17.5 43.3L15.1 42.3L12.6 40.8L13.4 39.6L14.3 35.7L14.3 34.5L14.8 30.1L14.4 27.2L12.4 25.5L11.2 23.8L11.1 21.8L9.1 20.6L6.7 19.6L3.8 19.1L2.5 17.9L2.5 15.9L5 14.7L8.4 14L11.7 15L13.3 15L13.1 13.3L12.2 9.8L14.3 9.8L14.6 11.6L17.8 11.8L19 11.1L19.8 9.6L22.2 8.6L23.8 7.2L23.8 4.7L24.8 3.7Z'

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

export const PICTOS = {
  personne: { s: [circle(24, 13, 8), 'M8 45C8 33 15 27 24 27C33 27 40 33 40 45'], fill: `${circle(24, 13, 8)}M8 45C8 33 15 27 24 27C33 27 40 33 40 45Z` },
  maison: {
    s: ['M4 23L24 6L44 23', 'M9 19V44H39V19', 'M20 44V33H28V44', 'M30 25h5v5h-5z'],
    fill: 'M9 19L24 7L39 19V44H9Z',
    thin: [3],
  },
  immeuble: {
    s: ['M9 45V4H39V45', 'M15 10h6v5h-6zM27 10h6v5h-6zM15 20h6v5h-6zM27 20h6v5h-6zM15 30h6v5h-6zM27 30h6v5h-6z', 'M4 45H44M21 45v-6h6v6'],
    fill: 'M9 45V4H39V45Z',
    thin: [1],
  },
  piece: { s: [circle(24, 24, 17), 'M30.5 17.5A8.5 8.5 0 1 0 30.5 30.5M14.5 22h11M14.5 26.5h11'], fill: circle(24, 24, 17), thin: [1] },
  pieces: {
    s: ['M8 32v6a16 5 0 0 0 32 0v-6', 'M8 26v6a16 5 0 0 0 32 0v-6', 'M8 20v6a16 5 0 0 0 32 0v-6M8 20a16 5 0 1 1 32 0a16 5 0 1 1-32 0'],
    fill: 'M8 20a16 5 0 0 1 32 0v18a16 5 0 0 1-32 0Z',
  },
  enveloppe: { s: ['M5 13H43V37H5Z', 'M5 13L24 27L43 13'], fill: 'M5 13H43V37H5Z', text: [24, 33, 30] },
  calendrier: {
    s: ['M6 10H42V44H6Z', 'M6 19H42', 'M15 5V13M33 5V13', 'M13 27h4M22 27h4M31 27h4M13 35h4M22 35h4M31 35h4'],
    fill: 'M6 10H42V44H6Z',
    thin: [3],
  },
  sablier: {
    s: ['M10 4H38M10 44H38', 'M13 4C13 16 22 19 22 24C22 29 13 32 13 44M35 4C35 16 26 19 26 24C26 29 35 32 35 44', 'M24 22V34'],
    fill: 'M16 11H32C30 16 26 18 24 21C22 18 18 16 16 11ZM15 42C17 36 21 34 24 34C27 34 31 36 33 42Z',
    bold: [0],
    thin: [2],
  },
  cle: { s: [circle(14, 24, 8), 'M22 24H44', 'M37 24v6M43 24v7'], fill: circle(14, 24, 8) },
  etiquette: { s: ['M6 12H30L42 24L30 36H6Z', circle(33, 24, 2.5)], fill: 'M6 12H30L42 24L30 36H6Z', thin: [1], text: [17, 28, 20] },
  tirelire: {
    s: ['M8 27a16 12 0 1 0 32 0a16 12 0 1 0-32 0', 'M40 23h4v8h-4', 'M31 16l3-6 5 7', 'M15 37v6M33 37v6', 'M20 15.5h8M8 25c-3 0-5-2-4-5'],
    fill: 'M8 27a16 12 0 1 0 32 0a16 12 0 1 0-32 0Z',
    bold: [4],
  },
  grue: {
    s: ['M5 45H23M10 45V9M18 45V9', 'M10 39L18 33L10 27L18 21L10 15L18 9', 'M3 9H45M14 3L3 9M14 3L45 9', 'M38 9V24q0 5-4 5'],
    thin: [1],
  },
  barriere: { s: ['M38 45V8M32 45H44', 'M38 18H5V25H38', 'M29 18l-4 7M20 18l-4 7M11 18l-4 7'], thin: [2] },
  document: {
    s: ['M10 4H31L39 12V44H10Z', 'M31 4V12H39', 'M16 20H33M16 27H33M16 34H27'],
    fill: 'M10 4H31L39 12V44H10Z',
    thin: [2],
    text: [24, 31, 24],
  },
  lune: { s: ['M28 5A19 19 0 1 0 43 31A15 15 0 1 1 28 5Z', 'M39 7v5M36.5 9.5h5'], fill: 'M28 5A19 19 0 1 0 43 31A15 15 0 1 1 28 5Z', thin: [1] },
  bruit: { s: ['M4 24h5l3-8 5 16 5-24 5 32 5-24 5 16 3-8h4'] },
  repetition: { s: ['M24 10A14 14 0 1 1 10 24', 'M5 29L10 24L15 29', circle(24, 24, 3)], thin: [2] },
  alternance: { s: ['M10 20A15 15 0 0 1 38 20', 'M38 13V20H31', 'M38 28A15 15 0 0 1 10 28', 'M10 35V28H17'] },
  thermometre: {
    s: ['M20 31V9a4 4 0 0 1 8 0V31a8 8 0 1 1-8 0Z', 'M24 36V16', 'M32 13h4M32 19h4M32 25h4'],
    bold: [1],
    thin: [2],
  },
  scaphandre: {
    s: ['M8 30A16 16 0 1 1 40 30', 'M6 30H42L39 40H9Z', circle(24, 22, 7), 'M12 35h.5M24 35h.5M35.5 35h.5'],
    bold: [3],
  },
  loupe: { s: [circle(20, 20, 12), 'M29 29L42 42'], bold: [1] },
  coeur: {
    s: ['M24 41C12 33 5 25 5 17C5 10 10 6 15.5 6C19.5 6 22.5 8.5 24 12C25.5 8.5 28.5 6 32.5 6C38 6 43 10 43 17C43 25 36 33 24 41Z'],
    fill: 'M24 41C12 33 5 25 5 17C5 10 10 6 15.5 6C19.5 6 22.5 8.5 24 12C25.5 8.5 28.5 6 32.5 6C38 6 43 10 43 17C43 25 36 33 24 41Z',
  },
  mallette: { s: ['M6 16H42V42H6Z', 'M18 16V10H30V16', 'M6 26H42M22 26v4h4v-4'], fill: 'M6 16H42V42H6Z', thin: [2] },
  parapluie: {
    s: ['M4 24A20 20 0 0 1 44 24', 'M4 24q5-4 10 0q5-4 10 0q5-4 10 0q5-4 10 0', 'M24 24V40a4 4 0 0 1-8 0'],
    fill: 'M4 24A20 20 0 0 1 44 24q-5-4-10 0q-5-4-10 0q-5-4-10 0q-5-4-10 0Z',
  },
  pancarte: { s: ['M24 45V26', 'M5 7H43V26H5Z'], fill: 'M5 7H43V26H5Z', text: [24, 20.5, 34] },
  fenetre: { s: ['M10 6H38V42H10Z', 'M24 6V42M10 24H38', 'M7 42H41'], fill: 'M10 6H38V42H10Z', thin: [1] },
  porte: { s: ['M12 44V6H36V44', 'M31 26v1', 'M6 44H42'], fill: 'M12 44V6H36V44Z', bold: [1] },
  radiateur: { s: ['M8 10h5v30h-5zM17 10h5v30h-5zM26 10h5v30h-5zM35 10h5v30h-5z', 'M5 16H43M10 40v5M38 40v5'], thin: [1] },
  valise: {
    s: ['M8 16H40V41H8Z', 'M18 16V10H30V16', 'M18 16V41M30 16V41', 'M13 44.5h.5M35 44.5h.5'],
    fill: 'M8 16H40V41H8Z',
    thin: [2],
    bold: [3],
  },
  cadenas: { s: ['M15 22V15a9 9 0 0 1 18 0V22', 'M10 22H38V44H10Z', 'M24 30v6'], fill: 'M10 22H38V44H10Z', bold: [2] },
  epingle: { s: ['M24 45C24 45 11 30 11 19a13 13 0 0 1 26 0C37 30 24 45 24 45Z', circle(24, 19, 4)], fill: 'M24 45C24 45 11 30 11 19a13 13 0 0 1 26 0C37 30 24 45 24 45Z' },
  livre: { s: ['M24 12C18 8 10 8 4 10V40C10 38 18 38 24 42C30 38 38 38 44 40V10C38 8 30 8 24 12Z', 'M24 12V42'], thin: [1] },
  carte: { s: ['M4 12H44V38H4Z', 'M10 19h8v6h-8z'], fill: 'M4 12H44V38H4Z', thin: [1], text: [30, 33, 22] },
  soin: { s: ['M18 6H30V18H42V30H30V42H18V30H6V18H18Z'], fill: 'M18 6H30V18H42V30H30V42H18V30H6V18H18Z' },
  arbre: {
    s: ['M24 30C13 30 8 23 12 16C11 9 19 4 26 7C33 4 41 11 37 18C41 26 34 31 24 30Z', 'M24 30V45M24 37l-5-4M24 35l5-4', 'M14 45H34'],
    fill: 'M24 30C13 30 8 23 12 16C11 9 19 4 26 7C33 4 41 11 37 18C41 26 34 31 24 30Z',
    thin: [2],
  },
  collines: { s: ['M2 42C9 28 16 26 22 34C29 22 39 18 46 34', 'M2 45H46'], thin: [1] },
  monument: { s: ['M5 16L24 6L43 16Z', 'M7 20H41M11 20V39M20 20V39M28 20V39M37 20V39', 'M7 39H41M4 44H44'] },
  billet: { s: ['M3 12H45V36H3Z', circle(24, 24, 6), 'M8 17h3M37 31h3'], fill: 'M3 12H45V36H3Z', thin: [1, 2], text: [24, 28, 14] },
  cadran: {
    s: ['M6 36A18 18 0 0 1 42 36H6', 'M9.5 26l3 1.5M15 17.5l2.5 2.5M24 14v3.5M33 17.5l-2.5 2.5M38.5 26l-3 1.5', 'M24 36L33 24'],
    thin: [1],
    bold: [2],
  },
  trimestres: {
    s: [
      [6, 16.5, 27, 37.5].flatMap(y => [5, 15.5, 26, 36.5].map(x => `M${x} ${y}h7v7h-7z`)).join(''),
    ],
  },
  drapeau: { s: ['M12 45V4', 'M12 6H38L32 13L38 20H12'], fill: 'M12 6H38L32 13L38 20H12Z' },
  portemonnaie: { s: ['M6 14H38a4 4 0 0 1 4 4V40H6Z', 'M42 22H32a5 5 0 0 0 0 10H42', 'M33 27h.5'], fill: 'M6 14H38a4 4 0 0 1 4 4V40H6Z', bold: [2] },
  guichet: { s: ['M4 21H44M8 21V44M40 21V44', 'M12 5H36V14H12Z', 'M14 21V32H34V21'], thin: [2], text: [24, 12, 22] },
  cible: { s: [circle(24, 24, 15), circle(24, 24, 7), 'M24 24h.5'], thin: [1], bold: [2] },
  pyramide: { s: ['M24 5V43', 'M18 9H30M15 15H33M12 21H36M10 27H38M9 33H39M8 39H40'], thin: [0] },
  bourse: { s: ['M5 6V42H44', 'M7 34L13 26L18 31L25 15L30 23L36 11L43 19'], thin: [0] },
  chaleur: { s: ['M14 40c-4-4 4-8 0-12s4-8 0-12', 'M24 44c-4-4 4-8 0-12s4-8 0-12s4-8 0-12', 'M34 40c-4-4 4-8 0-12s4-8 0-12'] },
  fauteuil: { s: ['M14 30V14a3 3 0 0 1 3-3H31a3 3 0 0 1 3 3V30', 'M8 24a3 3 0 0 1 6 0V32H34V24a3 3 0 0 1 6 0V40H8Z', 'M11 40v4M37 40v4'] },
  metre: { s: [circle(16, 24, 11), circle(16, 24, 3), 'M16 35H46', 'M21 35v-3M26 35v-3M31 35v-3M36 35v-3M41 35v-3'], thin: [1, 4] },
  compteur: { s: ['M3 14H45V34H3Z', 'M14.5 14V34M24 14V34M33.5 14V34'], thin: [1] },
  terrain: { s: ['M5 13L37 7L44 37L10 42Z', 'M21 10L27 39.5M7.5 27.5L40.5 22'], fill: 'M5 13L37 7L44 37L10 42Z', thin: [1] },
  escalier: { s: ['M3 44H15V34H27V24H39V14H46'] },
  toile: { s: ['M2 2L18 18M2 2L22 7M2 2L7 22', 'M9 4Q8.5 8.5 4 9M15 5.5Q13.5 13.5 5.5 15M20 6.5Q18 18 6.5 20'], thin: [0, 1] },
  hausse: { s: ['M24 42V8', 'M14 18L24 8L34 18'] },
  baisse: { s: ['M24 6V40', 'M14 30L24 40L34 30'] },
  carte_france: { s: [FRANCE], fill: FRANCE },
} satisfies Record<string, Def>

export type PictoName = keyof typeof PICTOS

/** Quelques villes sur la carte de France (carte_france), en unités du pictogramme */
export const VILLES: Record<string, [number, number]> = {
  Paris: [26.4, 14],
  Lille: [28.7, 5.3],
  Lyon: [34.7, 29.1],
  Marseille: [36.5, 41.1],
  Bordeaux: [16.5, 33.6],
  Toulouse: [23.3, 39.6],
  Nantes: [13.3, 22],
  Strasbourg: [44.5, 15.3],
  Nice: [42.8, 39.1],
  Montpellier: [31.5, 39.6],
}

interface PictoProps {
  n: PictoName
  /** Coin haut gauche, et côté, en unités de la feuille */
  x: number
  y: number
  size?: number
  t0?: number
  /** Déjà au tableau : sans geste */
  kept?: boolean
  tone?: Tone
  /** Poids du trait (1 : celui de la feuille) */
  w?: number
  /** Un mot écrit dans le pictogramme (pancarte, carte, enveloppe…) */
  text?: string
  /** Aplat léger dans la silhouette (une fenêtre allumée, une part) */
  filled?: boolean
  /** Pas entre deux traits, en millisecondes */
  step?: number
}

/** Un pictogramme placé sur la feuille, qui se dessine trait après trait */
export function Picto({ n, x, y, size = 48, t0 = 0, kept, tone, w = 1, text, filled, step = 200 }: PictoProps) {
  const d: Def = PICTOS[n]
  const s = size / 48
  const still = kept || tone === 'ghost'
  const tint = d.fill && (filled || tone === 'count')
  const t = d.text
  const fit = t && text ? Math.min(11, (t[2] / Math.max(3, text.length)) * 1.85) : 0
  return (
    <g
      class={cls('vc-p', tone && `vc-${tone}`)}
      transform={`translate(${x} ${y}) scale(${s})`}
      style={{ '--k': String(w / s) }}
    >
      {tint ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class={tone === 'count' ? 'vc-tint-count' : 'vc-tint'} d={d.fill} />
        </Fade>
      ) : null}
      {d.s.map((path, i) => (
        <Ink
          key={i}
          d={path}
          t0={t0 + i * step}
          dur={i === 0 ? 520 : 380}
          kept={still}
          class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined}
        />
      ))}
      {t && text ? (
        <Fade t0={t0 + d.s.length * step} kept={still}>
          <text class="vc-t" x={t[0]} y={t[1]} text-anchor="middle" font-size={fit}>
            {text}
          </text>
        </Fade>
      ) : null}
    </g>
  )
}

/** Durée du dessin d'un pictogramme, en millisecondes */
export const pictoMs = (n: PictoName, step = 200) => (PICTOS[n].s.length - 1) * step + 520

/** Les mots qui appellent un pictogramme, pour les thèmes à venir : le premier qui correspond l'emporte */
const LEXIQUE: [RegExp, PictoName][] = [
  [/usure|pénib|nuit/, 'lune'],
  [/âge|génération|départ/, 'calendrier'],
  [/financ|paie|cotis|tirelire|capitalis/, 'tirelire'],
  [/pension|montant|toucher|retraite/, 'enveloppe'],
  [/logement social|hlm|bailleur/, 'immeuble'],
  [/loyer/, 'etiquette'],
  [/constru|chantier|bâtir/, 'grue'],
  [/existant|vacant|vide|rénov/, 'fenetre'],
  [/logement|maison|résidence|habitat/, 'maison'],
  [/santé|maladie|soin/, 'coeur'],
  [/emploi|travail|salari|entreprise/, 'mallette'],
  [/attente|délai|durée|temps/, 'sablier'],
  [/impôt|taxe|budget|dépense|milliard|euro|€|coût/, 'pieces'],
  [/personne|ménage|demande|habitant|population/, 'personne'],
  [/loi|règle|texte|réforme/, 'document'],
]

/** Le pictogramme qu'appelle un texte (« Âge de départ » : le calendrier), ou rien */
export function pictoFor(text: string): PictoName | null {
  const t = fold(text)
  return LEXIQUE.find(([re]) => re.test(t))?.[1] ?? null
}

/** Un pictogramme seul, dans son propre SVG (listes en HTML : sommaire, planche de pictogrammes) */
export function Glyphe({ n, tone, t0 = 0, kept, class: c }: { n: PictoName; tone?: Tone; t0?: number; kept?: boolean; class?: string }) {
  return (
    <svg class={cls('vc-svg vc-glyphe', c)} viewBox="-2 -2 52 52" aria-hidden="true">
      <Picto n={n} x={0} y={0} t0={t0} kept={kept} tone={tone} step={150} />
    </svg>
  )
}
