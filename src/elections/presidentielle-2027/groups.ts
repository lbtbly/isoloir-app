// Familles de thèmes, pour filtrer les fiches des candidats : 24 thèmes regroupés en 9 familles
// (research/presidentielle-2027/config.json, « groups »).
// Chaque thème appartient à une seule famille, et chaque thème de la banque a la sienne (vérifié par les tests) :
// un thème que la banque n'utiliserait pas serait à retirer d'ici. L'ordre est éditorial.
// Neutralité : aucun rapprochement qui vaudrait cadrage (l'immigration n'est rangée ni avec la sécurité
// ni avec la laïcité ; la laïcité n'est pas rangée avec la sécurité ; les droits des personnes LGBTQIA+ sont
// rangés avec l'égalité femmes-hommes, ni avec la famille ni avec l'école).

import type { TopicGroup } from '../../core/types'

export const topicGroups: TopicGroup[] = [
  { id: 'economie', label: 'Travail et économie', topicIds: ['travail_salaires', 'fiscalite', 'finances_publiques', 'industrie_economie', 'retraites'] },
  { id: 'social', label: 'Santé, logement, solidarités', topicIds: ['sante', 'logement', 'solidarites'] },
  { id: 'egalite_droits', label: 'Égalité et droits', topicIds: ['egalite', 'droits_lgbtqia'] },
  { id: 'savoirs', label: 'École, culture, numérique', topicIds: ['education', 'societe', 'numerique'] },
  { id: 'ecologie', label: 'Écologie et territoires', topicIds: ['ecologie_energie', 'agriculture', 'territoires'] },
  { id: 'justice', label: 'Sécurité et justice', topicIds: ['securite_justice'] },
  { id: 'immigration', label: 'Immigration', topicIds: ['immigration'] },
  { id: 'monde', label: 'Europe et monde', topicIds: ['europe', 'ukraine_russie', 'proche_orient', 'defense'] },
  { id: 'republique', label: 'République et vie politique', topicIds: ['institutions', 'laicite_republique'] },
]
