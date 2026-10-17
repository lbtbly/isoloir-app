// « Ce qui pèse le plus dans cette lecture » (lot 3, A3, plan « Approfondir Mon profil politique » approuvé le 15 octobre
// 2026 ; maquettes validées dans shots/profil-approfondi/) : dans la ligne ouverte d'une lecture nette du graphique
// (ui/profile/Chart.tsx), après sa phrase, la question qui pèse le plus, votre avis écrit en entier avec le repère de la
// mini-réglette, le texte entier de l'approche, puis ce qu'elle est pour les candidats que la grille classe là, en
// nombres, sans aucun nom (D3) ; une seule fiche par ligne, et sur des blocs non voisins de l'axe, un renvoi au détail.
// Dans le détail (ui/screens/Profile.tsx), pour chaque suite de blocs nettement plus près : la même fiche, où l'approche
// est aussi l'approche principale de candidats, et la part de chaque question dans l'écart, en points.
// Rien n'y change la lecture, la couleur ni l'ordre des lignes : on décompose la lecture faite (core/echiquierWeigh.ts).
// Un fichier à part du build, avec son calcul et ses mots (core/echiquierWeighCopy.ts) : la page le charge à la demande,
// après son premier affichage, et ne le calcule qu'à l'ouverture d'une ligne ou d'un détail.

import { SCALE } from '../../core/answers'
import type { UnitReading } from '../../core/echiquier'
import { where, whereAll, YOUR_VIEW } from '../../core/echiquierCopy'
import { weighOf, type Weigh } from '../../core/echiquierWeigh'
import * as W from '../../core/echiquierWeighCopy'
import type { Question } from '../../core/types'
import type { ProfileCtx } from './Chart'

/** Ce qui pèse le plus, en une règle : le point 2 de « Comment c'est calculé », après HOW_CALC */
export { HOW_WEIGH } from '../../core/echiquierWeighCopy'

/** Les fiches d'une unité : une par suite de ses blocs nettement plus près ; [] sans lecture nette */
export const weighsOf = (u: UnitReading, ctx: ProfileCtx): Weigh[] => weighOf(ctx.pack, ctx.answers, u)

/** La ligne ouverte montre une fiche (et la note sur le bloc entier s'efface) : une seule suite, et une phrase vraie */
export const showsCard = (weighs: readonly Weigh[]) => weighs.length === 1 && !!weighs[0]!.suite

/**
 * La fiche d'une suite de blocs : la question, en petit corps gris ; votre avis écrit en entier, avec le repère de la
 * mini-réglette de « Qui porte quoi » (la couleur de son cran, le rouge pour une ligne rouge) ; le texte entier de
 * l'approche ; puis ce qu'elle est pour les candidats que la grille classe là. Rien sans phrase vraie (Weigh.suite).
 * title : son intertitre (la ligne ouverte ; le détail a le sien)
 */
function WeighCard({ w, ctx, title = true }: { w: Weigh; ctx: ProfileCtx; title?: boolean }) {
  const q = ctx.pack.bank.questions.find(x => x.id === w.question)
  const a = q?.approaches.find(x => x.id === w.approach)
  if (!q || !a || !w.suite) return null
  const red = !!ctx.answers[q.id]?.redLines.includes(a.id)
  return (
    <div class="weigh">
      {title ? <p class="weigh-title">{W.WEIGH_TITLE}</p> : null}
      <p class="weigh-q">{q.prompt}</p>
      {/* Les tons des crans du site : « d'accord » au vert de « très proche », « pas d'accord » à l'orangé de « éloigné »
          (ui/components/RatingRuler.tsx, TONE) ; une ligne rouge au rouge stylo */}
      <p class={`rating-mark weigh-view${red ? ' is-red-line' : ''}`} data-tone={w.view > 0 ? 'tres-proche' : 'eloigne'}>
        <span class="mini-ruler" aria-hidden="true">
          {SCALE.map(v => (
            <span key={v} class={v === w.view ? 'is-on' : ''} />
          ))}
        </span>
        <span class="rating-mark-label">
          <span class="weigh-view-k">{YOUR_VIEW}</span> {W.weighView(w.view, red)}
        </span>
      </p>
      <p class="weigh-a">{W.quoted(a.text)}</p>
      <p class="weigh-who">{W.weighWho(where(ctx.axis, w.seg), { ...w, suite: w.suite })}</p>
    </div>
  )
}

/**
 * Dans une ligne ouverte : la fiche ; sur des blocs non voisins de l'axe, le renvoi au détail, quand chaque suite y a la
 * sienne ; sinon rien
 */
export function WeighRow({ weighs, ctx }: { weighs: Weigh[]; ctx: ProfileCtx }) {
  if (showsCard(weighs)) return <WeighCard w={weighs[0]!} ctx={ctx} />
  if (weighs.length < 2 || !weighs.every(w => w.suite)) return null
  return (
    <div class="weigh">
      <p class="weigh-title">{W.WEIGH_TITLE}</p>
      <p>{W.weighElsewhere(weighs.map(w => where(ctx.axis, w.seg)))}</p>
    </div>
  )
}

/**
 * Dans le détail d'une unité lue nettement, sous son tableau des blocs : pour chaque suite de blocs nettement plus près
 * (nommée quand il y en a plusieurs), sa fiche, où l'approche citée est aussi l'approche principale de candidats de
 * l'axe, la part de chaque question dans l'écart, en points, dans l'ordre de la banque (questions : celles de l'unité,
 * dans l'ordre de UnitReading.questions), puis ce qu'elles n'en font pas, s'il y a lieu (positions de confiance basse)
 */
export function WeighDetail({ weighs, ctx, questions }: { weighs: Weigh[]; ctx: ProfileCtx; questions: readonly Question[] }) {
  if (!weighs.length) return null
  return (
    <div class="detail-weigh">
      <h3 class="detail-title">{W.WEIGH_TITLE}</h3>
      {weighs.map(w => (
        <div key={w.seg.join()} class="detail-weigh-seg">
          {weighs.length > 1 ? <p class="detail-weigh-for">{W.weighFor(where(ctx.axis, w.seg))}</p> : null}
          <WeighCard w={w} ctx={ctx} title={false} />
          {w.suite && w.alsoBlocs.length ? <p class="small">{W.weighAlso(whereAll(ctx.axis, w.alsoBlocs), w.alsoCount, w.suite === 'principale')}</p> : null}
          <p class="small">{W.weighPartsLead(w.seg.length)}</p>
          <ul class="detail-parts">
            {questions.map((q, j) => (
              <li key={q.id}>
                <span>{q.prompt}</span> <strong>{W.points(w.parts[j] ?? 0)}</strong>
              </li>
            ))}
          </ul>
          {Math.round(w.rest) ? <p class="small">{W.weighRest(w.rest)}</p> : null}
        </div>
      ))}
    </div>
  )
}
