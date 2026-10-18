// « Comment c'est calculé » (#/comptes/methode) : les règles du jeu, telles que les a fixées le propriétaire avant toute
// mesure (research/presidentielle-2027/budget-decisions.json), et pourquoi le jeu ne part pas des réponses.
import { pctOne } from '../../core/budget/copy'
import type { BudgetData } from '../../core/budget/types'
import { AiLabel } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'

/** La recommandation du Conseil de l'UE pour la France (procédure pour déficit excessif), texte en français */
const EDP_URL = 'https://data.consilium.europa.eu/doc/document/ST-5033-2025-REV-1/fr/pdf'

export function Method({ data }: { data: BudgetData }) {
  const b = data.baseline
  const n = data.levers.length
  return (
    <div class="cpt-recap cpt-method">
      <h1 class="display is-medium" tabIndex={-1}>
        Comment c’est calculé
      </h1>
      <p class="lede">
        Chaque levier a un effet chiffré par des sources publiques. Le jeu additionne ces effets sur votre appareil, sans IA, et
        en déduit le déficit 2027.
      </p>
      <AiLabel kind="chiffrages" />

      <h2>Le point de départ</h2>
      <p>
        Le projet de loi de finances pour 2027, tel que déposé le 1er octobre 2026&#x202F;: un déficit de {pctOne(b.deficitPct)} du produit
        intérieur brut, pour un PIB de {b.gdp.toLocaleString('fr-FR')}{'\u202f'}Md€ (<ExternalLink href={b.source.url}>{b.source.title}</ExternalLink>
        ). Ce projet n’est pas voté&#x202F;: les chiffres seront revus quand la loi de finances sera promulguée.
      </p>

      <h2>L’objectif de 3{'\u202f'}%</h2>
      <p>
        Les traités européens fixent une valeur de référence de 3{'\u202f'}% du PIB pour le déficit public. La France fait l’objet
        d’une procédure pour déficit excessif&#x202F;: le Conseil de l’Union européenne lui demande d’y mettre un terme d’ici 2029 (
        <ExternalLink href={EDP_URL}>recommandation du Conseil adoptée le 21 janvier 2025</ExternalLink>). Le jeu ne l’impose pas&#x202F;:
        l’objectif se choisit, ou pas.
      </p>

      <h2>Ce que compte un levier</h2>
      <ul class="cpt-list">
        <li>
          Son effet sur l’année 2027, sur l’ensemble des administrations publiques (État, Sécurité sociale, collectivités)&#x202F;: en année
          pleine, sauf quand la loi fixe une date (une revalorisation au 1er avril, par exemple)&#x202F;; la fiche dit alors quels mois
          comptent, et l’année pleine vient à part, hors du total.
        </li>
        <li>
          Un effet mécanique, tel que le publient les sources&#x202F;: ni les réactions des ménages et des entreprises, ni les effets sur la
          croissance, dans un sens ou dans l’autre. Ce qui ne joue qu’après 2027 est dit à part, hors du total.
        </li>
        <li>
          Une fourchette, jamais un seul chiffre, quand les sources divergent. Le total ajoute les bas d’un côté et les hauts de
          l’autre&#x202F;; un objectif est «&#x202F;atteint selon tous les chiffrages&#x202F;» quand même le bas suffit, «&#x202F;selon une partie&#x202F;» quand
          seul le haut suffit.
        </li>
        <li>
          Chaque levier se règle autant dans un sens que dans l’autre, autour du PLF. Quand la source chiffre un écart (un point de
          TVA, une hausse de 10&#x202F;%), la plage s’arrête là&#x202F;; quand elle ne chiffre qu’un sens, l’autre en est le
          miroir. Pour une ligne de crédits, la plage va de −25&#x202F;% à +25&#x202F;%, ou de −100&#x202F;% à +100&#x202F;% quand une idée du débat propose
          de supprimer cette ligne.
        </li>
        <li>Deux leviers qui portent sur la même base (la TVA à tous les taux et la TVA au taux normal) ne s’ajoutent pas&#x202F;: régler l’un remet l’autre au PLF.</li>
        <li>
          Deux leviers qui se recoupent en partie (le point d’indice ou les effectifs, et les crédits d’une mission qui paient des
          agents publics) se règlent ensemble&#x202F;; la fiche prévient alors qu’une même baisse ou une même hausse peut compter deux fois.
        </li>
        <li>
          Une ligne de l’État versée à un organisme public (un opérateur, comme une université ou l’audiovisuel public) compte pour
          son montant entier, en supposant que l’organisme réduise ou augmente d’autant sa dépense&#x202F;; sa fiche le dit.
        </li>
      </ul>

      <h2>D’où viennent les chiffres</h2>
      <p>
        Les administrations (Direction du budget, DG Trésor, Sécurité sociale, Insee…), les organes indépendants (Cour des comptes,
        Conseil d’orientation des retraites…), le Parlement et la recherche. Un think tank ou un expert indépendant n’est retenu
        qu’avec une seconde source dans la même fourchette. Jamais le chiffre d’un candidat, d’un parti, d’un syndicat ou d’une
        organisation patronale, ni une source dont le titre ou l’adresse nomme un candidat ou un parti. L’Unédic, que gèrent les syndicats et les organisations patronales,
        compte parmi les administrations de sécurité sociale&#x202F;: sa prévision des allocations de chômage, que reprend le PLF, est
        retenue comme celle d’une administration&#x202F;; ce n’est le chiffrage d’aucune idée. Chaque source est datée et dite
        «&#x202F;consultée le&#x202F;».
      </p>

      <h2>L’ordre des rayons</h2>
      <p>
        Dans chaque famille, les trois premiers leviers jouent sur les plus grosses lignes du budget, d’après leur montant
        publié&#x202F;: le produit d’un impôt, les crédits d’une mission, une dépense sociale. Un levier sur la même base qu’un levier
        déjà retenu, ou sur la même ligne (la TVA au taux normal après la TVA à tous les taux), laisse la place au suivant. Les
        leviers dont les sources ne donnent pas le montant de la ligne, seulement un coût par emploi, viennent en dernier,
        rangés par l’effet qu’ils peuvent atteindre.
      </p>

      <h2>Ce qui n’est pas dans le jeu</h2>
      <ul class="cpt-list">
        <li>Les mesures qu’aucune source éligible ne chiffre pour 2027&#x202F;: un dispositif nouveau sans ligne, une gratuité, une procédure ou une sanction.</li>
        <li>Ce qui ne joue qu’après 2027, comme l’effet d’une réforme des retraites à terme&#x202F;: la fiche le dit, hors du total.</li>
        <li>
          Les dotations de l’État aux collectivités et les transferts entre l’État et la Sécurité sociale&#x202F;: un transfert entre
          administrations publiques ne change pas leur déficit d’ensemble.
        </li>
        <li>
          La contribution de la France au budget de l’Union européenne&#x202F;: son montant découle du cadre financier pluriannuel et de
          la décision sur les ressources propres, adoptés à l’unanimité des États&#x202F;; la France ne peut pas la changer seule.
        </li>
        <li>
          Des lignes qu’aucune idée du débat ne vise, comme la taxe sur les transactions financières ou l’hébergement
          d’urgence&#x202F;: elles pourront entrer dans le jeu selon les mêmes règles.
        </li>
      </ul>

      <h2>Pourquoi le jeu ne part pas de vos réponses</h2>
      <p>
        Le jeu devait d’abord poser votre budget à partir de vos réponses aux questions. Avant de le construire, une mesure
        de neutralité a comparé, bloc par bloc de la grille des nuances, la part des idées des candidats qu’un levier chiffré
        pouvait représenter. L’écart entre le bloc le mieux servi et le moins bien servi devait rester sous un seuil fixé
        d’avance (1,5), avec tous les candidats et sans chacun d’eux. Avec tous, il était de 1,4 pour les idées qui creusent
        le déficit et de 1,7 pour celles qui le réduisent&#x202F;; sans l’un ou l’autre, jusqu’à 1,6 et 2,0&#x202F;; et le nombre de leviers
        que chaque bloc pouvait faire bouger dans son sens variait de 1 à 1,6. Le jeu part donc du même point pour tout le
        monde, le PLF, et ne lit pas vos réponses. Ces mesures portaient sur le menu d’alors et sur l’amorce par les réponses&#x202F;;
        sans amorce, elles ne sont pas refaites&#x202F;: chaque levier du jeu se règle dans les deux sens, autour du PLF.
      </p>

      <h2>Les données</h2>
      <p>
        {n} leviers, version {data.version}. Les réglages restent en mémoire le temps de la page&#x202F;: rien n’est enregistré, rien
        n’est envoyé.
      </p>
    </div>
  )
}
