// Familles de thèmes, pour filtrer les fiches des candidats : 23 thèmes regroupés en 8 familles.
// Chaque thème appartient à une seule famille (vérifié par les tests). L'ordre est éditorial.
// Neutralité : aucun rapprochement qui vaudrait cadrage (l'immigration n'est rangée ni avec la sécurité
// ni avec la laïcité ; la laïcité n'est pas rangée avec la sécurité).

import type { TopicGroup } from '../../core/types'

export const topicGroups: TopicGroup[] = [
  { id: 'economie', label: 'Travail et économie', topicIds: ['travail_salaires', 'fiscalite', 'industrie_economie', 'retraites', 'egalite'] },
  { id: 'social', label: 'Santé, logement, solidarités', topicIds: ['sante', 'logement', 'solidarites'] },
  { id: 'savoirs', label: 'École, culture, numérique', topicIds: ['education', 'societe', 'numerique'] },
  { id: 'ecologie', label: 'Écologie et territoires', topicIds: ['ecologie_energie', 'agriculture', 'territoires'] },
  { id: 'justice', label: 'Sécurité et justice', topicIds: ['securite_justice'] },
  { id: 'immigration', label: 'Immigration', topicIds: ['immigration'] },
  { id: 'monde', label: 'Europe et monde', topicIds: ['europe', 'ukraine_russie', 'proche_orient', 'defense'] },
  { id: 'republique', label: 'République et vie politique', topicIds: ['institutions', 'laicite_republique', 'strategie'] },
]
