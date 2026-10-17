// Les mots de « Ce qui pèse le plus dans cette lecture » (lot 3, A3 ; core/echiquierWeigh.ts), la fiche d'une ligne
// ouverte d'une lecture nette et du détail de « Mon profil politique » (ui/profile/Weigh.tsx). Fonctions pures qui
// renvoient du texte brut. À part des mots de la page (core/echiquierCopy.ts), dans le fichier du build de la fiche,
// chargé à la demande. Mêmes règles d'écriture que la page (core/echiquierCopy.ts ; tests/echiquier-copy.test.ts) : les
// blocs toujours attribués à la grille, aucun nom de candidat, des nombres (D3) ; jamais « surtout », « fragile »,
// « solide », ni « tire dans l'autre sens » ; chaque phrase seulement quand elle est vraie.

import { fr } from './echiquierCommonCopy'
import type { WeighSuite } from './echiquierWeigh'
import { signed } from './resultsCopy'

const NB = '\u00a0'

export const WEIGH_TITLE = 'Ce qui pèse le plus dans cette lecture'
/** Votre avis sur l'approche citée, après YOUR_VIEW, en entier et en minuscules : « d’accord », « pas d’accord, ligne rouge » */
export const weighView = (view: number, redLine: boolean) => (view > 0 ? 'd’accord' : redLine ? 'pas d’accord, ligne rouge' : 'pas d’accord')
/** Le texte entier d'une approche, entre guillemets */
export const quoted = (text: string) => fr(`« ${text} »`)
/**
 * k de n candidats connus, sans nom, dans la forme que veut la phrase : après « de » (« de 2 des 4 candidats », « d’un
 * des 4 », « des 3 », « du candidat »), après « pour » (« pour 1 des 2 candidats », « pour les 3 », « pour le
 * candidat »), en tête de phrase (« 2 des 3 candidats », « Un des 3 », « Les 3 », « Le candidat »)
 */
function ofKnown(k: number, n: number, form: 'de' | 'pour' | 'tête'): string {
  const all = n < 2 ? 'candidat' : `${n}${NB}candidats`
  if (k === n) return form === 'de' ? (n < 2 ? 'du candidat' : `des ${all}`) : `${form === 'pour' ? 'pour l' : 'L'}${n < 2 ? 'e' : 'es'} ${all}`
  const some = k === 1 && form !== 'pour' ? `${form === 'de' ? 'd’un' : 'Un'} des ${all}` : `${k}${NB}des ${all}`
  return form === 'de' ? (k === 1 ? some : `de ${some}`) : form === 'pour' ? `pour ${some}` : some
}
/**
 * La phrase qui suit l'approche citée (WeighSuite), en nombres, dans l'ordre de l'axe : where, les blocs de la fiche
 * (where) ; known, leurs candidats connus ; main, compatible, rejects : combien ont l'approche pour principale, pour
 * compatible, la rejettent ; others, chacun porte une autre approche de la question (« ils en portent d’autres »
 * seulement alors). « Approche principale de 2 des 4 candidats que la grille classe à l’extrême gauche ; compatible pour
 * 1 autre. »
 */
export function weighWho(where: string, w: { suite: WeighSuite; known: number; main: number; compatible: number; rejects: number; others: boolean }): string {
  const whose = `que la grille classe ${where}`
  const n = w.known
  switch (w.suite) {
    case 'principale':
      return fr(`Approche principale ${ofKnown(w.main, n, 'de')} ${whose}${w.compatible ? ` ; compatible pour ${w.compatible}${NB}autre${w.compatible > 1 ? 's' : ''}` : ''}.`)
    case 'compatible':
      return fr(`Approche compatible ${ofKnown(w.compatible, n, 'pour')} ${whose}.`)
    case 'rejet':
      return fr(`${ofKnown(w.rejects, n, 'tête')} ${whose} ${w.rejects > 1 ? 'rejettent' : 'rejette'} cette approche.`)
    case 'aucun':
      return fr(
        n < 2
          ? `Le candidat ${whose} ne porte pas cette approche${w.others ? ' : il en porte d’autres' : ''}.`
          : `Aucun des ${n}${NB}candidats ${whose} ne porte cette approche${w.others ? ' : ils en portent d’autres' : ''}.`,
      )
  }
}
/**
 * Une lecture nette sur des blocs non voisins de l'axe : une seule fiche par ligne, qui renvoie au détail, où chaque
 * suite de blocs a la sienne (wheres : leurs formes, dans l'ordre de l'axe)
 */
export const weighElsewhere = (wheres: readonly string[]) =>
  fr(`Le détail le donne pour les candidats que la grille classe ${wheres[0]}${wheres.slice(1).map((w, i, all) => `${i === all.length - 1 ? ', puis' : ','} pour ceux qu’elle classe ${w}`).join('')}.`)
/** Dans le détail, avant la fiche d'une suite de blocs, quand il y en a plusieurs */
export const weighFor = (where: string) => fr(`Pour les candidats que la grille classe ${where} :`)
/**
 * Dans le détail seulement : où l'approche citée est aussi l'approche principale de candidats de l'axe, hors des blocs
 * de la fiche (whereAll) ; also, elle est déjà celle de candidats de la fiche (la suite « principale ») : « Aussi… »
 */
export const weighAlso = (where: string, count: number, also: boolean) =>
  fr(`${also ? 'Aussi approche' : 'Approche'} principale ${count > 1 ? 'de candidats' : 'd’un candidat'} que la grille classe ${where}.`)
/** Dans le détail : la part de chaque question dans l'écart (de la suite de blocs quand elle en a plusieurs) */
export const weighPartsLead = (blocs: number) =>
  fr(
    `Part de chaque question dans l’écart${blocs > 1 ? ' moyen de ces blocs' : ''} avec les autres façons de poser vos mêmes avis : l’affinité moins sa moyenne quand les avis de cette seule question sont posés de toutes les façons possibles, les autres telles quelles.`,
  )
/** « +12 points », « 0 point », « −3 points » */
export const points = (x: number) => {
  const d = Math.round(x)
  return `${signed(d)}${NB}point${Math.abs(d) > 1 ? 's' : ''}`
}
/** Ce que les parts ne font pas de l'écart : seulement avec des positions de confiance basse (Weigh.rest) */
export const weighRest = (x: number) =>
  fr(`Reste de l’écart, ${points(x)} : sur certaines questions, une position incertaine rend un candidat connu ou non selon la façon de poser vos avis.`)
/**
 * Le point 2 de « Comment c'est calculé » de la page, après HOW_CALC (core/echiquierCopy.ts), dont il reprend les façons :
 * une règle, vraie même sans lecture nette. Ici, avec la fiche : la page le dit une fois la fiche chargée, et seulement
 * alors
 */
export const HOW_WEIGH = fr(
  'Ce qui pèse le plus : la question dont vos avis, posés de toutes les autres façons sur ses approches, changent le plus votre affinité avec le bloc ; puis, dans cette question, l’avis qui y compte le plus. Les approches vous ont été présentées sans nom de candidat : les rapprochements sont calculés ensuite.',
)
