// Le schéma de la rubrique « Mon profil politique » de la Méthode, au trait comme les autres (components/Diagrams.tsx),
// à l'encre seule : de vos avis au palier de chaque case et à sa lecture nette, en mots (aucun symbole), qui seule rend
// sa couleur pleine (décision du propriétaire du 17 octobre 2026). Dans le fichier à part de la rubrique, chargé à la
// demande par la Méthode (ui/profile/load.ts).

import { Arrow, Figure } from '../components/Diagrams'

const STEPS = [
  { label: 'Vos avis', sub: 'd’accord, pas d’accord, sans avis' },
  { label: 'Votre affinité par thème', sub: 'avec chaque candidat : le calcul du score' },
  { label: 'Moyenne par bloc de la grille', sub: 'c’est le palier de sa case' },
  { label: 'Comparée à vos mêmes avis', sub: 'posés de toutes les autres façons' },
]

/** Les lectures, en mots (la légende du schéma dit « nettement ») */
const OUTCOMES = ['plus près', 'rien de net', 'plus loin']

export function ProfileDiagram() {
  return (
    <Figure
      title="Comment se lit un bloc de la grille"
      desc="Vos avis donnent votre affinité par thème avec chaque candidat, le calcul même du score. On en fait la moyenne par bloc de la grille des nuances, qui donne le palier de sa case, puis on la compare à celle de vos mêmes avis, posés de toutes les autres façons sur les approches : nettement plus près ou nettement plus loin, sa couleur est pleine ; rien de net, elle reste atténuée."
      viewBox="0 0 360 312"
    >
      {STEPS.map((s, i) => (
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
          {i < STEPS.length - 1 ? <Arrow x1={142} y1={58 + i * 64} x2={142} y2={70 + i * 64} /> : null}
        </g>
      ))}
      {OUTCOMES.map((word, i) => {
        const x = 8 + i * 118
        return (
          <g key={word}>
            <Arrow x1={142} y1={250} x2={x + 51} y2={266} />
            <rect class="dg-box" x={x} y="268" width="102" height="36" />
            <text class="dg-label dg-bold" x={x + 51} y="291" text-anchor="middle">
              {word}
            </text>
          </g>
        )
      })}
    </Figure>
  )
}
