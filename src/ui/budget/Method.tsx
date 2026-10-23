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
        Chaque levier a un effet chiffré par des sources publiques, ou estimé par Isoloir quand aucune ne le chiffre, et dit
        alors comment. Le jeu additionne ces effets sur votre appareil, sans IA, et en déduit le déficit 2027.
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
        <li>
          Au-delà de la plage chiffrée, le curseur va plus loin, jusqu’à une borne justifiée (une limite légale, un taux plancher
          européen, la ligne entière)&#x202F;: chaque unité en plus a un effet estimé par Isoloir, en fourchette élargie, car une
          grosse hausse d’impôt rapporte moins que sa règle de trois. La piste du curseur y est hachurée et la fiche le dit.
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
        leviers sans ligne publiée (une mesure qui n’existe pas encore, ou que ses sources ne chiffrent que par emploi)
        viennent en dernier, rangés par l’effet qu’ils peuvent atteindre.
      </p>

      <h2>Ce qui n’est pas dans le jeu</h2>
      <ul class="cpt-list">
        <li>Les mesures qu’on ne peut ni chiffrer ni estimer honnêtement pour 2027&#x202F;: un dispositif dont le contenu n’est pas défini, une procédure ou une sanction.</li>
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
          Des lignes qu’aucune idée du débat ne vise, comme l’allocation de rentrée scolaire ou les rentes d’accidents
          du travail&#x202F;: elles pourront entrer dans le jeu selon les mêmes règles.
        </li>
      </ul>

      <h2>Les estimations d’Isoloir</h2>
      <p>
        Quand une mesure débattue n’a aucun chiffrage par une source éligible, Isoloir l’estime&#x202F;: un calcul statique, à partir de
        chiffres officiels cités (une assiette, un produit, des effectifs), en fourchette large, au moins 25&#x202F;% de part et d’autre
        du calcul central. Jamais à partir du chiffre d’un candidat ou d’un parti. La fiche porte la mention «&#x202F;estimation&#x202F;» et dit
        comment le calcul est fait&#x202F;; «&#x202F;Votre budget 2027&#x202F;» dit quelle part de vos réglages repose sur des estimations.
      </p>

      <h2>Vos réponses et les leviers</h2>
      <p>
        Chaque approche des questions qui a un effet sur le budget est reliée au levier qui la représente, et au sens où elle
        l’emmène&#x202F;: ces liens ont été établis par une IA, puis vérifiés par une autre. Sur votre appareil, sans rien envoyer, le jeu
        lit vos réponses&#x202F;: chaque fiche reliée dit si vous étiez d’accord, pas d’accord, ou si c’était une ligne rouge. Au départ,
        vous choisissez de partir de vos réponses ou du PLF&#x202F;; partant de vos réponses, un levier dont vous approuvez une approche
        part dans son sens, à la taille qu’elle dit (ou d’un cran), jamais au-delà de sa borne. Des réponses qui tirent un levier
        dans les deux sens, ou une ligne rouge dans le sens approuvé, ne règlent rien&#x202F;: la fiche dit «&#x202F;réponses partagées&#x202F;». Une
        approche qui ne porte qu’en partie sur ses leviers (une idée large, comme «&#x202F;taxer davantage…&#x202F;») marque chacun d’eux et
        n’en pré-règle qu’un, d’un cran&#x202F;: celui de la plus grosse ligne&#x202F;; deux leviers sur la même base ne sont jamais pré-réglés
        ensemble, et une approche sans taille ne règle jamais plus de 10&#x202F;% d’une ligne de crédits.
      </p>
      {data.gate ? <Gate gate={data.gate} /> : null}
      <p>
        Une première mesure, avant la construction du jeu, avait refusé de poser le budget à partir des réponses&#x202F;: avec tous les
        candidats, l’écart était de 1,4 pour les idées qui creusent le déficit et de 1,7 pour celles qui le réduisent, et
        jusqu’à 1,6 et 2,0 sans l’un ou l’autre. Le 18 octobre 2026, après l’avoir essayé, l’éditeur a choisi de relier quand
        même le jeu aux réponses, avec les marques et le pré-réglage, en publiant ici la mesure refaite sur ce mode.
      </p>

      <h2>Les données</h2>
      <p>
        {n} leviers, version {data.version}. Vos réglages sont gardés sur cet appareil, avec vos réponses, et repris dans le double que vous exportez&#x202F;: rien
        n’est envoyé.
      </p>
    </div>
  )
}

/** La mesure de neutralité du mode relié, telle que l'a écrite tools/budget-pregate.mjs (budget-gate.json) */
function Gate({ gate }: { gate: NonNullable<BudgetData['gate']> }) {
  const f = (x: number | null) => (x === null ? 'non mesurable' : x.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }))
  return (
    <p>
      La mesure de neutralité compare, bloc par bloc de la grille des nuances, la part des idées de ses candidats qu’un levier
      du jeu représente, à part pour celles qui creusent le déficit et celles qui le réduisent&#x202F;; l’écart entre le bloc le mieux
      et le moins bien servi devrait rester sous {f(gate.threshold)}. Sur ce mode, avec tous les candidats, il est de {f(gate.creuse)} pour
      les idées qui creusent le déficit et de {f(gate.reduit)} pour celles qui le réduisent&#x202F;; au pire, sans l’un ou l’autre,{' '}
      de {f(gate.worstCreuse)} et {f(gate.worstReduit)}. Le nombre de leviers que chaque bloc peut faire bouger dans son sens varie dans un
      rapport de {f(gate.reach)}. {gate.pass ? 'Cette mesure passe.' : 'Cette mesure ne passe pas\u202f: certains blocs voient moins de leurs idées représentées dans le jeu que d’autres.'}
      {gate.preset ? (
        <>
          {' '}
          Seules les approches qui se font par un levier le pré-règlent (pas celles qui n’y portent qu’en partie)&#x202F;: comptées ainsi,
          l’écart est de {f(gate.preset.creuse)} et {f(gate.preset.reduit)} avec tous les candidats, au pire de {f(gate.preset.worstCreuse)} et{' '}
          {f(gate.preset.worstReduit)}.{' '}
          {gate.preset.pass ? 'Cette mesure-là passe.' : 'Cette mesure-là ne passe pas\u202f: les réponses de certains blocs pré-règlent moins de leviers que celles des autres.'}
        </>
      ) : null}
    </p>
  )
}

