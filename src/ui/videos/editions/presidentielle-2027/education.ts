// Édition « présidentielle 2027 » de la série « École et jeunesse » (src/ui/videos/series/education.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/education.json).
// Datée (en-tête de la série) : crédits de la loi de finances pour 2026 (enseignement privé sous contrat), droits
// d'inscription à l'université de l'année 2026-2027, montants 2026 de l'allocation du contrat d'engagement jeune et
// de l'indemnité du service civique, part des jeunes ni en emploi, ni en études, ni en formation au 2e trimestre 2026.
// Datée aussi (education-14) : droits d'inscription différenciés des étudiants étrangers non ressortissants de
// l'Union européenne, de l'Espace économique européen ou de la Suisse et plafond d'exonération de 2026-2027 (décret
// du 19 mai 2026), taille des classes du premier degré à la rentrée 2025. À revoir au vote de la loi de finances pour
// 2027 (crédits du programme 139, ici et dans la fiche education-2), à la revalorisation de l'allocation du contrat
// d'engagement jeune (avril 2027) et de l'indemnité du service civique, à chaque nouvelle publication des sources
// (bilan de Parcoursup 2026, effectifs du supérieur, taille des classes du premier degré à la rentrée 2026, part
// trimestrielle des jeunes ni en emploi, ni en études, ni en formation), et au plus tard avant le premier tour de
// l'élection présidentielle, le 18 avril 2027.
// Les questions des vidéos restent celles que donne le périmètre (ecole-prive → education-2, ecole-superieur →
// education-4) ; aucune correction ne les change. ecole-classes, ecole-apprentissages et ecole-jeunes restent sans
// question ici (education-15 : « Voir la fiche » relève de scope.ts, de nouvelles vidéos d'une décision à part).
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/education.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
// Attention : la fiche education-2 propre à la présidentielle (research/presidentielle-2027/explainers.json, écrite
// le 8 octobre, après la relecture) montre en figures[1] « 66 % contre 73 % » (collèges et lycées) et les écoles
// privées en millions d'euros ; elle ne donne ni 52 % ni 56 % ni la part des collectivités. Le passage ecole-prive-03
// reprend le texte arbitré (education-4, chiffres lus dans les RERS 2026, fiche 10.04) : la fiche ou ce passage
// est à aligner avant la séance de voix.
// Autres écarts avec ces fiches natives, à trancher par le propriétaire (hors de ce fichier, avant la séance de
// voix) : le passage ajouté (education-6) garde le libellé arbitré de figures[3] et le graphique à deux barres
// (élémentaire), alors que le graphique n° 3 de la fiche education-2 compte quatre barres (maternelle comprise) ;
// le graphique d'ecole-superieur-04 finit sur « 2024 (provisoire) », celui de la fiche education-4 (n° 0) sur
// « 2024 » ; la source A18927 est datée ici du 26 mai 2026 (date arbitrée), du 20 août 2026 dans la fiche
// education-4. La série éditée compte 46 passages, un de plus que le plafond de 45 (décision d'education-6).
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const NI_TAILLE_CLASSES: VideoSource = {
  title: 'Taille des classes du premier degré : une neuvième année de baisse consécutive dans les écoles publiques (Note d’information n° 26.01)',
  url: 'https://www.education.gouv.fr/sites/default/files/document/Education_nationale_DEPP_NI%20Taille%20des%20classes%2026-01.pdf-478592.pdf',
  publisher: 'Ministère de l’Éducation nationale – DEPP',
  date: '2026-01',
}

/** Repères et références statistiques 2026 : un seul document, cité par ses fiches */
const RERS_2026 = (fiches: string, publisher = 'Ministère de l’Éducation nationale – DEPP'): VideoSource => ({
  title: `Repères et références statistiques 2026 (${fiches})`,
  url: 'https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf',
  publisher,
  date: '2026-08',
})

const COUR_DES_COMPTES_PRIVE: VideoSource = {
  title: 'L’enseignement privé sous contrat (rapport public thématique)',
  url: 'https://www.ccomptes.fr/fr/publications/lenseignement-prive-sous-contrat',
  publisher: 'Cour des comptes',
  date: '2023-06-01',
}

export const EDUCATION: SeriesPatch = {
  videos: {
    // education-15 : l'introduction annonce des sujets, plus des « questions » (seules deux de ses cinq questions
    // existent dans cette élection) ; un mot change dans la voix, le reste du passage est inchangé.
    'ecole-intro': {
      segments: {
        'ecole-intro-07': {
          say: 'Alors, cinq sujets. Combien d’élèves par classe ? Comment mieux faire apprendre ? Quelles règles pour financer le privé ? Quelle priorité pour l’université ? Et que faire d’abord pour les jeunes ?',
          emphasis: ['cinq sujets'],
        },
      },
    },

    'ecole-prive': {
      // education-4 : la fiche 10.04 des RERS 2026 s'ajoute au titre de la source n° 1 ; education-6 : la note
      // sur la taille des classes devient la source n° 2. La Cour des comptes reste en n° 0 (ecole-prive-06).
      sources: [
        COUR_DES_COMPTES_PRIVE,
        RERS_2026(
          'fiche 10.03, le budget : analyse et évolution ; fiche 10.04, le financement des producteurs d’éducation ; fiche 2.19, les élèves du second degré habitant dans un quartier prioritaire',
        ),
        NI_TAILLE_CLASSES,
      ],
      segments: {
        // education-4 (avec education-2 et -3) : la part de l'État en 2024 (et non 2020 daté de 2022), dans le
        // privé et dans le public, et ce qui vient des collectivités et des familles.
        'ecole-prive-03': {
          say: 'En 2024, l’État apporte 52 % du financement du privé sous contrat à l’école, et 66 % au collège et au lycée. Dans le public, c’est 56 % et 73 %. Le reste vient surtout des collectivités territoriales dans le public, des collectivités et des familles dans le privé.',
          spoken: 'En deux mille vingt-quatre, l’État apporte cinquante-deux pour cent du financement du privé sous contrat à l’école, et soixante-six pour cent au collège et au lycée. Dans le public, c’est cinquante-six pour cent et soixante-treize pour cent. Le reste vient surtout des collectivités territoriales dans le public, des collectivités et des familles dans le privé.',
          draw: 'Deux paires de disques au trait, à l’école puis au collège et au lycée, le privé sous contrat et le public ; la part de l’État se colore au bleu bille : un peu plus de la moitié à l’école dans les deux cas, deux tiers et près des trois quarts au collège et au lycée.',
          alt: 'Deux paires de disques : à l’école, privé 52 % et public 56 % ; au collège et au lycée, privé 66 % et public 73 %.',
          emphasis: ['52 %', '66 %', 'Dans le public'],
          figure: {
            value: '52 % et 66 %',
            label: 'part de l’État dans le financement des écoles maternelles et élémentaires et des collèges et lycées privés sous contrat, contre 56 % et 73 % dans le public. Les collectivités territoriales en apportent 26 % et 10 % dans le privé, 41 % et 22 % dans le public ; dans le privé, l’essentiel du reste vient des familles et d’autres financeurs privés (France)',
            date: '2024',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Privé sous contrat, écoles', value: 52 },
              { label: 'Public, écoles', value: 56 },
              { label: 'Privé sous contrat, collèges et lycées', value: 66 },
              { label: 'Public, collèges et lycées', value: 73 },
            ],
          },
        },
      },
      // education-6 : le chiffre de la fiche qui compte pour l'autre côté, après le budget (les moyens) ; la vidéo
      // finit toujours sur la balance (ecole-prive-06) puis la question. Nouvel identifiant (pas de renumérotation
      // dans une édition) : sans planche propre, le passage prend le dessin générique, qui trace le graphique.
      insert: [
        {
          after: 'ecole-prive-04',
          segment: {
            id: 'ecole-prive-04-classes-p27',
            say: 'En élémentaire, les classes du privé sous contrat sont plus chargées : 24,2 élèves en moyenne, contre 20,7 dans le public.',
            spoken: 'En élémentaire, les classes du privé sous contrat sont plus chargées : vingt-quatre virgule deux élèves en moyenne, contre vingt virgule sept dans le public.',
            visual: 'compare',
            draw: 'Deux barres à la même échelle, depuis zéro : le privé sous contrat, 24,2 élèves par classe, et le public, 20,7.',
            alt: 'Deux barres à la même échelle : privé sous contrat, 24,2 ; public, 20,7.',
            emphasis: ['plus chargées', '24,2', '20,7'],
            figure: {
              value: '24,2 contre 20,7',
              label: 'élèves par classe en moyenne en élémentaire dans le privé sous contrat, contre le public ; dans le premier degré, 45 % des classes du privé comptent plus de 25 élèves, contre 11 % dans le public (France)',
              date: 'rentrée 2025',
              sourceIndex: 2,
            },
            chart: {
              kind: 'compare',
              unit: 'élèves par classe',
              items: [
                { label: 'Privé sous contrat', value: 24.2 },
                { label: 'Public', value: 20.7 },
              ],
            },
          },
        },
      ],
    },

    'ecole-superieur': {
      // education-9 : la source des droits différenciés s'ajoute en n° 3, sans décaler celle de l'appel à projets.
      sources: [
        RERS_2026(
          'fiche 7.20, les vœux d’orientation et propositions d’admission des nouveaux bacheliers ; fiche 7.01, les effectifs du supérieur : évolution ; fiche 10.05, les dépenses par élève et par étudiant ; fiche 10.09, la recherche et le développement expérimental : vue d’ensemble',
          'Ministère de l’Éducation nationale – DEPP / SIES',
        ),
        {
          title: 'Coût d’une inscription dans l’enseignement supérieur – cas général',
          url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F36520/2',
          publisher: 'Service-Public.fr (DILA)',
          date: '2026-08-20',
        },
        {
          title: 'Les résultats définitifs de l’Appel à projets générique (AAPG) 2025',
          url: 'https://anr.fr/fr/actus/details/news/les-resultats-definitifs-de-lappel-a-projets-generique-aapg-2025/',
          publisher: 'Agence nationale de la recherche (ANR)',
          date: '2026-06-08',
        },
        {
          title: 'Université : certains étudiants étrangers non-européens vont payer plus cher à partir de la rentrée 2026',
          url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18927',
          publisher: 'Service-Public.fr (DILA)',
          date: '2026-05-26',
        },
      ],
      segments: {
        // education-13 (avec education-11 et -12) : le libellé et le graphique donnent les cinq années de la fiche,
        // dans l'ordre, sans comparatif. La voix ne change pas : la planche sup04 trace toujours les trois colonnes
        // dites (2010, 2020, 2024), d'où draw et alt inchangés.
        'ecole-superieur-04': {
          figure: {
            value: '12 460 €',
            label: 'dépense moyenne par étudiant à l’université en 2024 (euros constants, donnée provisoire), après 10 490 € en 2000, 12 870 € en 2010, 11 540 € en 2020 et 12 660 € en 2023. Pour un élève de classe préparatoire aux grandes écoles, elle atteint 19 070 € (France, public et privé)',
            date: '2024',
            sourceIndex: 0,
          },
          chart: {
            kind: 'series',
            unit: '€',
            items: [
              { label: '2000', value: 10490 },
              { label: '2010', value: 12870 },
              { label: '2020', value: 11540 },
              { label: '2023', value: 12660 },
              { label: '2024 (provisoire)', value: 12460 },
            ],
          },
        },
        // education-9 : le taux normal n'est pas celui de tous les étudiants ; la voix dit aussi les droits
        // différenciés, avec le périmètre de la fiche (Union européenne, Espace économique européen, Suisse).
        'ecole-superieur-05': {
          say: 'À l’université publique, à la rentrée 2026, un étudiant non boursier paie 178 euros par an en licence et 255 en master. Pour un étudiant d’une autre nationalité, hors Espace économique européen et Suisse, c’est en principe 2 902 et 3 950 euros.',
          spoken: 'À l’université publique, à la rentrée deux mille vingt-six, un étudiant non boursier paie cent soixante-dix-huit euros par an en licence et deux cent cinquante-cinq en master. Pour un étudiant d’une autre nationalité, hors Espace économique européen et Suisse, c’est en principe deux mille neuf cent deux et trois mille neuf cent cinquante euros.',
          draw: 'Deux paires d’étiquettes de prix au trait, licence et master : le taux normal, puis les droits différenciés des étudiants étrangers non ressortissants de l’Union européenne, de l’Espace économique européen ou de la Suisse.',
          alt: 'Quatre étiquettes : licence, 178 € et 2 902 € ; master, 255 € et 3 950 €.',
          emphasis: ['178 euros', '255', '2 902'],
          figure: {
            value: '178 €',
            label: 'par an en licence à l’université publique pour un étudiant non boursier (taux normal, hors droits différenciés des étudiants étrangers non ressortissants de l’Union européenne, de l’Espace économique européen ou de la Suisse) ; 255 € en master',
            date: '2026-2027',
            sourceIndex: 1,
          },
        },
      },
    },
  },
}
