import type { Candidate } from '../../core/types'
import faurePhoto from './media/faure.jpg'
import glucksmannPhoto from './media/glucksmann.jpg'
import guedjPhoto from './media/guedj.jpg'
import maurelPhoto from './media/maurel.jpg'
import royalPhoto from './media/royal.jpg'

// Ordre alphabétique des noms ; l'affichage hors classement est mélangé par session.
// Parcours : rédigés par une IA, faits vérifiés contre leurs sources le 3 octobre 2026, même structure pour les cinq.
// Portraits : licences libres uniquement (Wikimedia Commons), provenance détaillée dans media/CREDITS.md ;
// les photos des sites de campagne sont « droits réservés » et ne sont pas reprises.
export const candidates: Candidate[] = [
  {
    id: 'faure',
    name: 'Olivier Faure',
    initials: 'OF',
    affiliation: 'Parti socialiste',
    role: 'Premier secrétaire du Parti socialiste, député de Seine-et-Marne',
    website: 'https://choisir2027.fr/candidat/olivier-faure/',
    campaignUrl: 'https://avecfaure2027.fr',
    photo: { src: faurePhoto, alt: 'Portrait d’Olivier Faure', credit: 'PES Group Committee of the Regions, 2018, licence CC BY 2.0, recadrée', rightsUrl: 'https://commons.wikimedia.org/wiki/File:Olivier_Faure_PSE-CARCA--1194_(cropped).jpg', author: 'PES Group Committee of the Regions', title: 'Olivier_Faure_PSE-CARCA--1194_(cropped).jpg', license: { name: 'CC BY 2.0', url: 'https://creativecommons.org/licenses/by/2.0/deed.fr' }, changes: 'recadrée en carré et réduite' },
    bio: [
      { when: 'Aujourd’hui', text: 'Député de la 11e circonscription de Seine-et-Marne, réélu le 30 juin 2024. Siège au groupe Socialistes et apparentés ; membre de la commission des affaires étrangères.', source: { title: 'Fonctions - M. Olivier Faure - Seine-et-Marne (11e circonscription) - Assemblée nationale', url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA609332/fonctions', publisher: 'Assemblée nationale' } },
      { when: 'Depuis 2018', text: 'Premier secrétaire du Parti socialiste depuis 2018. Conseiller municipal de Lieusaint depuis 2026.', source: { title: 'Le premier secrétaire – Parti socialiste', url: 'https://parti-socialiste.fr/le-premier-secretaire/', publisher: 'Parti socialiste' } },
      { when: '2012', text: 'Élu député en 2012, réélu en 2017 et en 2022. Président du groupe Socialiste, écologiste et républicain (2016-2017), puis du groupe Nouvelle Gauche (2017-2018) à l’Assemblée nationale.', source: { title: 'M. Olivier Faure – Fonctions (archives)', url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA609332/fonctions?archive=oui', publisher: 'Assemblée nationale' } },
      { when: '1997', text: 'Conseiller de Martine Aubry au ministère de l’Emploi à partir de 1997, directeur adjoint du cabinet de François Hollande, alors premier secrétaire du Parti socialiste, de 2000 à 2007, puis secrétaire général du groupe socialiste à l’Assemblée nationale à partir de 2007.', source: { title: 'Le premier secrétaire – Parti socialiste', url: 'https://parti-socialiste.fr/le-premier-secretaire/', publisher: 'Parti socialiste' } },
      { when: '1968', text: 'Né le 18 août 1968 à La Tronche (Isère). Titulaire d’un DEA de droit économique de l’université d’Orléans (1991). À partir de 1993, il travaille dans une PME de haute technologie, dont il devient l’un des dirigeants.', source: { title: 'Le premier secrétaire – Parti socialiste', url: 'https://parti-socialiste.fr/le-premier-secretaire/', publisher: 'Parti socialiste' } },
    ],
  },
  {
    id: 'glucksmann',
    name: 'Raphaël Glucksmann',
    initials: 'RG',
    affiliation: 'Place publique',
    role: 'Coprésident de Place publique, député européen',
    website: 'https://choisir2027.fr/candidat/raphael-glucksmann/',
    campaignUrl: 'https://glucks2027.fr/',
    photo: { src: glucksmannPhoto, alt: 'Portrait de Raphaël Glucksmann', credit: '© Union européenne, 2024 – Source\u00a0: Parlement européen, recadrée', rightsUrl: 'https://commons.wikimedia.org/wiki/File:1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg', author: 'Parlement européen', title: '1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg', license: { name: 'réutilisation autorisée avec mention de la source (avis juridique du Parlement européen)', url: 'https://www.europarl.europa.eu/legal-notice/fr/' }, changes: 'recadrée en carré et réduite' },
    bio: [
      { when: 'Aujourd’hui', text: 'Député européen. Siège au groupe de l’Alliance progressiste des socialistes et démocrates (S&D) ; membre de la commission de la sécurité et de la défense.', source: { title: 'Raphaël GLUCKSMANN – Accueil, Députés, Parlement européen', url: 'https://www.europarl.europa.eu/meps/fr/197694/RAPHAEL_GLUCKSMANN/home', publisher: 'Parlement européen' } },
      { when: 'Aujourd’hui', text: 'Coprésident de Place publique, avec Aurore Lalucq.', source: { title: 'Mentions légales – Place publique', url: 'https://place-publique.eu/pages/5Kn3rQOfczTzywUWRM5sT9/mentions-legales', publisher: 'Place publique' } },
      { when: '2018', text: 'Cofondateur de Place publique en 2018. Élu au Parlement européen en 2019 et réélu en 2024, chaque fois comme tête de liste de l’alliance Parti socialiste – Place publique.', source: { title: 'Raphaël GLUCKSMANN – Curriculum vitae (informations publiées sous la seule responsabilité du député)', url: 'https://www.europarl.europa.eu/meps/fr/197694/RAPHAEL_GLUCKSMANN/cv', publisher: 'Parlement européen' } },
      { when: '2020', text: 'Président de la commission spéciale du Parlement européen sur l’ingérence étrangère de 2020 à 2022, puis de la commission spéciale qui lui a succédé, de 2022 à 2023.', source: { title: 'Raphaël GLUCKSMANN – 9e législature, Historique des législatures', url: 'https://www.europarl.europa.eu/meps/fr/197694/RAPHAEL_GLUCKSMANN/history/9', publisher: 'Parlement européen' } },
      { when: '1979', text: 'Né le 15 octobre 1979 à Boulogne-Billancourt. Études à l’Institut d’études politiques de Paris (1999-2003). Réalisateur de documentaires (2004), conseiller à l’intégration européenne du président géorgien Mikheil Saakachvili (2008-2012), puis chroniqueur sur France Inter, éditorialiste à L’Obs et directeur de la rédaction du Nouveau Magazine littéraire (2017-2018).', source: { title: 'Raphaël GLUCKSMANN – Curriculum vitae (informations publiées sous la seule responsabilité du député)', url: 'https://www.europarl.europa.eu/meps/fr/197694/RAPHAEL_GLUCKSMANN/cv', publisher: 'Parlement européen' } },
    ],
  },
  {
    id: 'guedj',
    name: 'Jérôme Guedj',
    initials: 'JG',
    affiliation: 'Parti socialiste',
    role: 'Député de l’Essonne',
    website: 'https://choisir2027.fr/candidat/jerome-guedj/',
    campaignUrl: 'https://www.jeromeguedj2027.fr/',
    photo: { src: guedjPhoto, alt: 'Portrait de Jérôme Guedj', credit: 'Audrey AK, 2010, licence CC BY-SA 2.0, recadrée', rightsUrl: 'https://commons.wikimedia.org/wiki/File:J%C3%A9r%C3%B4me_Guedj_2010_(cropped).jpg', author: 'Audrey AK', title: 'Jérôme_Guedj_2010_(cropped).jpg', license: { name: 'CC BY-SA 2.0', url: 'https://creativecommons.org/licenses/by-sa/2.0/deed.fr' }, changes: 'recadrée en carré et réduite', shareAlike: true },
    bio: [
      { when: 'Aujourd’hui', text: 'Député de la 6e circonscription de l’Essonne, réélu le 7 juillet 2024. Siège au groupe Socialistes et apparentés ; membre de la commission des affaires sociales.', source: { title: 'Fonctions - M. Jérôme Guedj - Essonne (6e circonscription) - Assemblée nationale', url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA1567/fonctions', publisher: 'Assemblée nationale' } },
      { when: 'Depuis 1993', text: 'Membre du Parti socialiste depuis 1993.', source: { title: 'Jérôme Guedj - Choisir 2027', url: 'https://choisir2027.fr/candidat/jerome-guedj/', publisher: 'Choisir 2027 (AFDGS, organisatrice de la primaire)' } },
      { when: '2012', text: 'Député de l’Essonne de 2012 à 2014, en remplacement d’un député nommé au Gouvernement, puis réélu en 2022 (mandat 2022-2024).', source: { title: 'Fonctions (archives) - M. Jérôme Guedj - Essonne (6e circonscription) - Assemblée nationale', url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA1567/fonctions?archive=oui', publisher: 'Assemblée nationale' } },
      { when: '2011', text: 'Président du conseil départemental de l’Essonne de 2011 à 2015. Diplômé de l’École nationale d’administration, il entre à l’Inspection générale des affaires sociales en 1996.', source: { title: 'Jérôme Guedj - Fondation Jean-Jaurès', url: 'https://www.jean-jaures.org/expert/jerome-guedj/', publisher: 'Fondation Jean-Jaurès' } },
      { when: '1972', text: 'Né le 23 janvier 1972 à Pantin (Seine-Saint-Denis). Profession déclarée : inspecteur général des affaires sociales.', source: { title: 'M. Jérôme Guedj - Essonne (6e circonscription) - Assemblée nationale', url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA1567', publisher: 'Assemblée nationale' } },
    ],
  },
  {
    id: 'maurel',
    name: 'Emmanuel Maurel',
    initials: 'EM',
    affiliation: 'Gauche républicaine et socialiste',
    role: 'Animateur national de la GRS, député du Val-d’Oise',
    website: 'https://choisir2027.fr/candidat/emmanuel-maurel/',
    campaignUrl: 'https://emmanuel-maurel.fr/',
    photo: { src: maurelPhoto, alt: 'Portrait d’Emmanuel Maurel', credit: 'Echwander, 2016, licence CC BY-SA 4.0, recadrée', rightsUrl: 'https://commons.wikimedia.org/wiki/File:Emmanuel_Maurel_en_2016.jpg', author: 'Echwander', title: 'Emmanuel_Maurel_en_2016.jpg', license: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr' }, changes: 'recadrée en carré et réduite', shareAlike: true },
    bio: [
      { when: 'Aujourd’hui', text: 'Député de la 3e circonscription du Val-d’Oise, élu le 7 juillet 2024. Siège au groupe Gauche démocrate et républicaine ; membre de la commission des finances et de la commission des affaires européennes.', source: { title: 'Fonctions - M. Emmanuel Maurel - Val-d’Oise (3e circonscription)', url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA842271/fonctions', publisher: 'Assemblée nationale' } },
      { when: 'Aujourd’hui', text: 'Animateur national de la Gauche républicaine et socialiste (GRS).', source: { title: 'Primaire : Emmanuel Maurel répond aux questions d’Hugo au Perchoir – 29 septembre 2026', url: 'https://g-r-s.fr/primaire-emmanuel-maurel-repond-aux-questions-dhugo-au-perchoir-29-septembre-2026/', publisher: 'Gauche républicaine et socialiste (g-r-s.fr)' } },
      { when: '2014', text: 'Député européen de 2014 à 2024, membre de la commission du commerce international. Cofondateur de la GRS avec Marie-Noëlle Lienemann en octobre 2018.', source: { title: 'Biographie – Emmanuel Maurel · 2027', url: 'https://emmanuel-maurel.fr/biographie/', publisher: 'Site de campagne d’Emmanuel Maurel (éditeur : GRS)' } },
      { when: '2001', text: 'Élu municipal dans le Val-d’Oise à partir de 2001, conseiller régional d’Île-de-France à partir de 2004 et vice-président de la Région jusqu’en 2014. Au Parti socialiste, secrétaire national à la formation des adhérents et aux universités d’été.', source: { title: 'Biographie – Emmanuel Maurel · 2027', url: 'https://emmanuel-maurel.fr/biographie/', publisher: 'Site de campagne d’Emmanuel Maurel (éditeur : GRS)' } },
      { when: '1973', text: 'Né le 10 mai 1973 à Épinay-sur-Seine (Seine-Saint-Denis). Études de lettres modernes et d’histoire, puis diplôme de l’Institut d’études politiques de Paris. A travaillé pour plusieurs députés et sénateurs socialistes et enseigné près de dix ans dans le supérieur.', source: { title: 'Biographie – Emmanuel Maurel · 2027', url: 'https://emmanuel-maurel.fr/biographie/', publisher: 'Site de campagne d’Emmanuel Maurel (éditeur : GRS)' } },
    ],
  },
  {
    id: 'royal',
    name: 'Ségolène Royal',
    initials: 'SR',
    affiliation: 'Parti socialiste',
    role: 'Ancienne ministre, candidate à la présidentielle de 2007',
    website: 'https://choisir2027.fr/candidat/segolene-royal/',
    campaignUrl: 'https://segolene-ordrejuste.fr/',
    photo: { src: royalPhoto, alt: 'Portrait de Ségolène Royal', credit: 'Georges Biard, 2020, licence CC BY-SA 4.0, recadrée', rightsUrl: 'https://commons.wikimedia.org/wiki/File:SEGOLENE_ROYAL_DEAUVILLE_2020_2.jpg', author: 'Georges Biard', title: 'SEGOLENE_ROYAL_DEAUVILLE_2020_2.jpg', license: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr' }, changes: 'recadrée en carré et réduite', shareAlike: true },
    bio: [
      { when: 'Depuis 2025', text: 'Présidente de l’Association France-Algérie depuis le 18 décembre 2025, succédant à Arnaud Montebourg.', source: { title: 'Ségolène royal nouvelle présidente de l’association France - Algérie (communiqué de presse)', url: 'https://associationfrancealgerieofficiel.fr/segolene-royal-nouvelle-presidente-de-lassociation-france-algerie/', publisher: 'Association France-Algérie (site officiel)' } },
      { when: '2016', text: 'Nommée en février 2016 ministre de l’Environnement, de l’Énergie et de la Mer, chargée des relations internationales sur le climat.', source: { title: 'Décrets du 11 février 2016 relatifs à la composition du Gouvernement', url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000032036286', publisher: 'Légifrance (Journal officiel)' } },
      { when: '2004', text: 'Présidente de la région Poitou-Charentes à partir de 2004, réélue en 2010. Candidate à l’élection présidentielle de 2007 (46,94 % des voix au second tour). Ministre de l’Écologie, du Développement durable et de l’Énergie à partir d’avril 2014.', source: { title: 'Marie-Ségolène dite Ségolène Royal (Encyclopédie Larousse)', url: 'https://www.larousse.fr/encyclopedie/personnage/Marie-S%C3%A9gol%C3%A8ne_dite_S%C3%A9gol%C3%A8ne_Royal/149655', publisher: 'Larousse (encyclopédie en ligne)' } },
      { when: '1988', text: 'Députée des Deux-Sèvres, élue en 1988, réélue en 1993, 1997 et 2002. Ministre de l’Environnement (1992-1993), puis ministre déléguée chargée de l’Enseignement scolaire (1997-2000) et à la Famille et à l’Enfance (2000-2002), chargée aussi des Personnes handicapées à partir de 2001.', source: { title: 'Assemblée nationale ~ Les députés : Mme Ségolène Royal (fiche XIIe législature)', url: 'https://www.assemblee-nationale.fr/12/tribun/fiches_id/2650.asp', publisher: 'Assemblée nationale' } },
      { when: '1953', text: 'Née en 1953 à Dakar. Diplômée de l’Institut d’études politiques de Paris et de l’École nationale d’administration. Entrée au Parti socialiste en 1978, chargée de mission à l’Élysée sous la présidence de François Mitterrand de 1982 à 1988.', source: { title: 'Marie-Ségolène dite Ségolène Royal (Encyclopédie Larousse)', url: 'https://www.larousse.fr/encyclopedie/personnage/Marie-S%C3%A9gol%C3%A8ne_dite_S%C3%A9gol%C3%A8ne_Royal/149655', publisher: 'Larousse (encyclopédie en ligne)' } },
    ],
  },
]
