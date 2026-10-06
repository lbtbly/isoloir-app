# Inventaire juridique d’Isoloir (état au 4 octobre 2026)

Ce document est une recherche documentaire, pas un avis d’avocat. La mention **[juriste]** signale les points qui méritent l’avis d’un professionnel. Je n’ai modifié aucun fichier du projet.

## A. Corrections apportées aux cinq notes, après vérification sur les sources

1. **Téléphone de Vercel**
   - Vercel ne publie qu’un numéro : +1 559 288 7060, celui de son agent DMCA (https://vercel.com/legal/dmca-policy).
   - Ses conditions d’utilisation et sa notice de confidentialité ne donnent aucun téléphone.
   - Le numéro (951) 383-6898 cité par la note « election » vient d’annuaires tiers. Je l’ai retiré.
2. **Recommandation CNIL « applications mobiles »**
   - La délibération 2024-061 a été abrogée et remplacée par la délibération 2025-024 du 27 mars 2025. Les modifications ne sont pas substantielles.
   - J’ai vérifié le passage du §3.3 sur l’exemption domestique. Il faut citer la 2025-024 : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051448685
3. **URL inexactes**
   - La notice de Vercel est à l’adresse /legal/privacy-notice, et non /privacy-policy.
   - Le lien vers l’article L. 163-2 de la note « election » pointe une version historique (2018-2020).
4. **Montants revérifiés sur Légifrance**
   - Diffamation envers un particulier : amende de 12 000 € (loi de 1881, art. 32, al. 1).
   - Diffamation envers un citoyen chargé d’un mandat public : 45 000 € (art. 31, qui renvoie à l’art. 30).
   - Le délai de réponse de 24 h en période électorale (art. 13) ne vise que les quotidiens. Il ne concerne pas le site.
5. **LCEN art. 1-1, II**
   - L’éditeur anonyme « peut ne tenir à la disposition du public que » le nom et l’adresse de l’hébergeur.
   - Publier le nom du directeur de la publication est donc facultatif, et non « exclu » comme le dit une note.
6. **Registre des traitements (RGPD, art. 30)**
   - L’exemption vise « une entreprise ou une organisation » de moins de 250 employés. On ne sait pas si elle s’applique à un particulier.
   - Je classe ce point en « utile » plutôt qu’en « obligatoire ».
7. **Confirmés sur la source**
   - LCEN art. 1-1 (en vigueur depuis le 23 mai 2024) et art. 1-2.
   - Décret 2007-1527 : il vise encore l’ancien art. 6 IV, plafonne la réponse à 200 lignes et impose au moins un jour de mise en ligne.
   - Loi 82-652, art. 93-2.
   - Le DPA de Vercel est réservé aux offres Pro et Enterprise (mis à jour le 17 mars 2026, en vigueur le 31 mars 2026).
   - Certification de Vercel au Data Privacy Framework (DPF) ; journaux conservés 1 h sur l’offre Hobby.
   - Arrêt T-553/23 du 3 septembre 2025, et pourvoi C-703/25 P toujours pendant.
   - Art. 82 de la loi Informatique et Libertés ; la CNIL cite bien « LocalStorage, IndexedDB ».
   - Lignes directrices 2/2023 du CEPD, §44.
   - Loi 77-808, art. 1, 11 et 12 ; Code électoral L. 49 et L. 52-1.
   - Loi 2005-102, art. 47 ; règle « non conforme » sans audit pour la déclaration d’accessibilité.
   - CC BY-SA 2.0 (§4(a), 4(c) et 7(a)) ; avis juridique du Parlement européen.
   - CRPA L. 322-1 ; Cass. 1re civ., 29 mars 2017 ; Cass. crim., 5 septembre 2023 ; art. 80 de la loi Informatique et Libertés (« à titre professionnel »).
   - Primaire : vote de 8 h à 20 h, ouvert aux mineurs de plus de 15 ans (choisir2027.fr).
8. **Constats dans le code au 4 octobre**
   - `REPORT_URL` est vide (`src/core/app.ts`).
   - Le lien « Confidentialité » n’apparaît que sur l’accueil et dans la fenêtre « mode avion ».
   - Formulations à revoir :
     - « ni serveur » : `Home.tsx` l. 233 et `Airplane.tsx` l. 68 ;
     - « ne collecte rien » : `Privacy.tsx` l. 44 ;
     - « Le code est vérifiable » : `Method.tsx` l. 163.
   - Le bundle ne contient aucune notice de licence.
   - `og:description` ne mentionne pas l’indépendance.
   - Les crédits photo n’apparaissent que sur la fiche candidat, et leur lien mène à Wikimedia Commons, pas au texte de la licence.

## B. Tableau de synthèse

Effort : S = moins d’1 h ; M = 1 à 3 h ; L = plus d’une demi-journée.

| # | Sujet | Statut | Déjà sur le site | Effort | Quand |
|---|---|---|---|---|---|
| 1 | Mentions légales : éditeur et hébergeur | **Obligatoire** (pénal) | Rien | M, une fois les infos fournies | Maintenant |
| 2 | Directeur de la publication | **Obligatoire** (la fonction) | Rien | S | Maintenant |
| 3 | Contact, droit de réponse, corrections | Droit de réponse **obligatoire** (3 jours) ; contact **fortement recommandé** | Journal des données ; `REPORT_URL` vide | S en code, plus l’organisation | Maintenant |
| 4 | Notice de confidentialité complète (hébergeur, journaux, transfert, candidats, droits, CNIL) | **Obligatoire** (probable) | Volet « vos réponses » très complet | M | Maintenant |
| 5 | Formulations inexactes (« ni serveur », « ne collecte rien », affiche JPG) | Fortement recommandé | – | S | Maintenant |
| 6 | Cookies et stockage local | Pas de bandeau ; informer est recommandé | Tableau « Ce qui reste, et où » | S | Maintenant (avec 4) |
| 7 | Informer les cinq candidats (RGPD, art. 14) | Obligatoire probable **[juriste]** | Rien | S (courriel du propriétaire) | Maintenant |
| 8 | Crédits photo | **Obligatoire** (conditions des licences) | Fiche candidat seulement | S à M | Maintenant |
| 9 | Notices Preact (MIT) et Archivo (OFL 1.1) | **Obligatoire** (conditions des licences) | Rien | S | Maintenant |
| 10 | Conditions d’utilisation | Non obligatoire ; utile en courte notice | Pied de l’accueil, Méthode | S à M | Maintenant (dans la page 1) |
| 11 | Sources des chiffres et futurs graphiques | **Obligatoire** (CRPA, CPI) | Explainer : éditeur, date, lien | S par graphique | En continu |
| 12 | Mot « sondage » (loi 77-808) | **Interdit** de l’employer ; le reste de la loi ne s’applique pas | Respecté | S | Maintenant |
| 13 | Jours de vote : gel des données, pas de promotion payante | Bonne pratique (le Code électoral ne s’applique pas à la primaire) | – | Organisation | 8-10 et 15-17 oct. |
| 14 | Liens légaux sur chaque écran | Recommandé ; nécessaire en pratique pour 1 et 4 | Accueil seulement | S (dans le menu prévu) | Maintenant |
| 15 | Page Accessibilité | Non applicable en droit ; utile | – | M | Plus tard |
| 16 | Licence du code et des données ; phrase « Le code est vérifiable » | Licence facultative ; phrase à corriger | Dépôt privé sans licence (d’après la note « contenus ») | S (phrase), M (licence) | Phrase maintenant, licence plus tard |
| 17 | Nom « Choisir 2027 », indépendance | Risque faible | Pied de l’accueil, Méthode | S | `og:description` maintenant, marques plus tard |
| 18 | Droit à l’image des candidats | Licite (but d’information) | Portraits neutres, absents de l’image JPG | S | Plus tard |
| 19 | Hébergeur : DPA, transfert hors UE | Mention **obligatoire** ; pas de contrat art. 28 sur Hobby **[juriste]** | – | Décision | Mention maintenant, choix plus tard |
| 20 | Registre interne et note de conformité | Utile | – | S à M | Plus tard |
| 21 | Purge automatique de la progression | Utile | Effacement manuel | M | Plus tard |
| 22 | DSA, art. 47 loi 2005-102, L. 111-7 C. conso., ARCOM, LCEN art. 19, règlement 2024/900, consentement des mineurs | Non applicables | – | – | – |

## C. Détail par sujet

### 1. Mentions légales (LCEN, art. 1-1, I et II ; sanction à l’art. 1-2)

- **Statut : obligatoire.**
  - La sanction est d’1 an d’emprisonnement et 75 000 € d’amende (art. 1-2).
  - Les poursuites contre un particulier semblent rares. Le risque concret est qu’un candidat saisisse la justice pour faire lever l’anonymat.
- **Option A, identité publique :**
  - nom, prénoms, domicile et téléphone de l’éditeur ;
  - nom du directeur de la publication ;
  - nom, adresse et téléphone de l’hébergeur.
- **Option B, anonymat d’un éditeur non professionnel :**
  - on publie seulement le nom et l’adresse de l’hébergeur ;
  - condition : « sous réserve d’avoir communiqué à ce fournisseur les éléments d’identification personnelle mentionnés au I » (nom, prénoms, domicile, téléphone) ;
  - l’hébergeur est tenu au secret professionnel, sauf envers l’autorité judiciaire.
- **Point bloquant pour l’option B [juriste]**
  - Rien n’établit que le compte Vercel Hobby contienne le domicile et le téléphone de l’éditeur.
  - Vercel ne publie aucune procédure pour recevoir ces éléments.
  - Pistes, aucune n’est validée par un texte :
    1. compléter le profil du compte et garder une preuve ;
    2. écrire à legalnotices@vercel.com en déclarant son identité « au titre de l’art. 1-1, II de la LCEN », et garder l’accusé ;
    3. changer pour un hébergeur qui recueille l’identité complète à l’ouverture du compte.
  - Sinon, c’est le régime A qui s’applique.
- **Hébergeur (vérifié)**
  - Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
  - +1 559 288 7060 (seul numéro publié, celui de l’agent DMCA) ; legalnotices@vercel.com.
- **À faire concrètement**
  - Une route `#/mentions-legales`, en HTML (cela suffit comme « standard ouvert »).
  - Rubriques : éditeur, directeur de la publication, contact, hébergeur, droit de réponse et corrections, conditions d’utilisation (§10), crédits et licences (§8 et §9), liens externes, date de mise à jour.
- **Déjà sur le site :** rien. Vercel n’est nommé nulle part.
- **Références :**
  - https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568614
  - https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568616

### 2. Directeur de la publication (loi 82-652, art. 93-2 et 93-3)

- **Obligatoire.**
  - « Tout service de communication au public par voie électronique est tenu d’avoir un directeur de la publication. »
  - Pour une personne physique, c’est elle-même. Elle doit être majeure et jouir de ses droits civils.
- **Responsabilité :** il répond comme auteur principal des contenus fixés avant leur mise en ligne (art. 93-3), c’est-à-dire de tout le contenu d’Isoloir, y compris des positions attribuées.
- **Selon le régime :** son nom est publié en option A. En option B, il ne l’est pas, mais la fonction existe : c’est à lui que l’hébergeur transmet les demandes de droit de réponse.
- **Référence :** https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000033971722

### 3. Contact, droit de réponse et corrections

- **Droit de réponse : obligatoire** (LCEN, art. 1-1, III).
  - Il appartient à toute personne « nommée ou désignée », sans qu’il y ait besoin de diffamation : les cinq candidats, les partis cités, et les personnes nommées dans les biographies.
  - La demande est faite dans les 3 mois suivant la mise en ligne.
  - L’éditeur doit insérer la réponse « dans les trois jours de leur réception », sous peine d’une amende de 3 750 €. La réponse est gratuite.
- **Décret 2007-1527.** Il s’applique ici parce que le site n’a pas de commentaires (art. 1).
  - La demande est faite par lettre recommandée avec accusé de réception, ou par un moyen équivalent.
  - La réponse ne dépasse pas la longueur du message contesté, et 200 lignes au plus.
  - Elle est publiée à la suite du message ou accessible à partir de lui, pendant au moins un jour.
- **Contact : non exigé en soi, mais fortement recommandé**, pour quatre raisons :
  - en option B, la demande passe par Vercel, qui doit la transmettre « sans délai », sans aucune garantie qu’il le fasse ;
  - la bonne foi en diffamation repose aussi sur la prudence et la correction rapide (Cass. crim., 5 septembre 2023, n° 22-84.763) ;
  - les candidats ont un droit de rectification (RGPD, art. 16) ;
  - c’est aussi le canal des retours sur l’accessibilité.
- **À faire concrètement**
  - Une adresse dédiée (alias neutre en option B), en lien `mailto:`. Ce type de lien est compatible avec la CSP.
  - Renseigner `REPORT_URL`.
  - Une rubrique « Droit de réponse et corrections » qui contient :
    - un engagement de vérification, par exemple sous 48 h ;
    - la règle : correction, ou passage en « position inconnue » en cas de doute ;
    - une ligne datée dans le Journal des données ;
    - la distinction entre correction volontaire et droit de réponse légal.
  - Une réponse se publierait dans un encadré « Droit de réponse de … » sur la fiche concernée, par un redéploiement sous 3 jours.
- **Organisation**
  - Surveiller la boîte, surtout les 9-10 et 16-17 octobre.
  - L’obligation légale passe avant le gel recommandé au §13.
  - Recevoir des courriels est un traitement de données : la notice de confidentialité doit le dire (finalité : répondre ; durée : jusqu’au traitement de la demande, plus quelques mois).
- **Déjà sur le site :** le Journal des données. `REPORT_URL` est vide, donc le lien « Signalez-la » est masqué.
- **Références :** décret 2007-1527, https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000428279 ; Cass. crim., 5 septembre 2023, https://www.legifrance.gouv.fr/juri/id/JURITEXT000048059181

### 4. Notice de confidentialité (RGPD, art. 13 et 14)

- **Vos réponses : hors du champ de l’éditeur, tant que rien ne sort de l’appareil.**
  - La CNIL (délibération 2025-024, §3.3) décrit un traitement « initié à la discrétion de la personne […] pour son seul compte » et « réalisé dans un environnement cloisonné ». Dans ce cas, celui qui fournit l’outil n’est ni responsable de traitement ni sous-traitant, et la CNIL « encourage […] ce choix de conception ».
  - Le texte vise les applications mobiles, on raisonne donc par analogie. L’argument reste solide.
  - Conditions à garder :
    - aucune mesure d’audience ;
    - aucune remontée d’erreurs ;
    - jamais de réponses dans la partie « ?… » d’une URL, qui arrive dans les journaux de Vercel. Le fragment `#` ne part pas au serveur.
- **Journaux de l’hébergeur : obligatoire, probable.**
  - Vercel enregistre l’adresse IP, la date, la page demandée et le navigateur.
  - Une adresse IP est une donnée personnelle (CJUE, Breyer, C-582/14).
  - Publier un site ouvert à tous n’est pas une activité domestique (CJUE, Lindqvist, C-101/01). L’éditeur est donc probablement responsable de traitement de ces journaux.
  - La notice doit indiquer :
    - l’identité et les coordonnées du responsable ;
    - la finalité (servir et protéger le site) et la base légale (intérêt légitime) ;
    - le destinataire (Vercel) ;
    - le transfert vers les États-Unis, couvert par le DPF (décision 2023/1795, validée par le Tribunal de l’UE le 3 septembre 2025, pourvoi C-703/25 P pendant) ;
    - la durée de conservation : 1 h dans le tableau de bord Hobby ; la durée chez Vercel n’est pas publiée, donc on indique le critère et on renvoie à sa notice ;
    - les droits et la réclamation auprès de la CNIL.
- **Données des candidats : l’éditeur en est responsable (certain).**
  - Données : positions attribuées, parcours, portraits.
  - Base légale : intérêt légitime. Les positions déclarées sont des opinions « manifestement rendues publiques » (art. 9(2)(e)).
  - La dérogation journalistique de l’art. 80 de la loi Informatique et Libertés est réservée au journalisme exercé « à titre professionnel » **[juriste]**.
- **Plan proposé :**
  1. qui est responsable ;
  2. vos réponses (texte actuel) ;
  3. ce que voit l’hébergeur ;
  4. ce qui est stocké sur votre appareil ;
  5. les candidats ;
  6. les signalements ;
  7. vos droits et la CNIL ;
  8. la date de mise à jour.
- **Tension [juriste] :** l’art. 13 du RGPD exige l’identité et les coordonnées du responsable, alors que la LCEN permet l’anonymat. Une lecture possible : rester anonyme au sens de la LCEN, mais afficher un nom et une adresse électronique pour le RGPD.
- **Déjà sur le site :** le volet « vos réponses », la CSP, le mode avion, l’effacement, `no-referrer`.
- **Références :**
  - https://www.cnil.fr/fr/recommandations-applications-mobiles-modifiee
  - https://vercel.com/legal/privacy-notice
  - https://vercel.com/docs/logs/runtime
  - https://www.cnil.fr/fr/plaintes

### 5. Formulations inexactes

- « ni serveur » (`Home.tsx` l. 233, `Airplane.tsx` l. 68) → « ni serveur qui reçoive vos réponses ».
- « ne collecte rien » (`Privacy.tsx` l. 44) → « ne collecte rien lui-même ; comme pour toute page web, l’hébergeur voit l’adresse IP et la page demandée ».
- Affiche JPG : dire qu’elle révèle une proximité politique.
- « aucun cookie » : à vérifier si le mode anti-attaque de Vercel est activé, car il peut déposer un cookie de contrôle.
- Fondement : loyauté et transparence (RGPD, art. 5(1)(a) et art. 12).

### 6. Cookies et stockage local (loi Informatique et Libertés, art. 82)

- **Pas de bandeau (certain).**
  - La progression est « strictement nécessaire » à un service demandé expressément, et elle n’est écrite qu’après la première réponse.
  - La copie hors ligne est un cas discutable, mais le risque est quasi nul : elle ne contient ni donnée ni identifiant.
- **Information recommandée par la CNIL.** La notice doit nommer :
  - le stockage local (`localStorage`), y compris la clé de secours `:illisible` ;
  - `sessionStorage` `isoloir-focus` ;
  - le cache du service worker (Cache Storage) ;
  - et préciser qu’ils sont strictement nécessaires, donc sans consentement.
- **Lecture locale :** selon le CEPD (lignes directrices 2/2023, §44), relire sur place des données qui ne quittent pas l’appareil n’est pas un « accès » au sens de l’art. 5(3).
- **Références :**
  - https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037813978
  - https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ
  - https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/comment-mettre-mon-site-web-en-conformite

### 7. Informer les candidats (RGPD, art. 14)

- **Statut : obligatoire probable [juriste].**
  - Le délai est d’un mois.
  - L’exception d’« effort disproportionné » (art. 14(5)(b)) ne tient guère pour cinq personnalités publiques.
- **Concrètement :** le propriétaire envoie un courriel aux cinq équipes, avec le lien vers la notice et l’adresse de contact.
- **Effet utile :** cela les invite à signaler des erreurs avant le vote.

### 8. Crédits photo

- **Photos sous CC BY 2.0 et CC BY-SA 2.0 (Faure, Guedj)**
  - §4(a) : joindre « a copy of, or the Uniform Resource Identifier for, this License » à chaque copie.
  - Créditer l’auteur, le titre s’il est donné, l’adresse de l’œuvre, et signaler l’adaptation (§4(b) pour BY, §4(c) pour BY-SA).
  - §7(a) : la licence prend fin automatiquement à la première violation, sans le délai de régularisation des licences 4.0.
- **Photos sous CC BY-SA 4.0 (Maurel, Royal)**
  - Créditer l’auteur, mettre un lien vers la licence, signaler la modification.
  - Une page de crédits liée depuis le site est admise (« reasonable manner »).
- **Photo du Parlement européen (Glucksmann)**
  - Mention : « © Union européenne, 2024 – Source : Parlement européen ».
  - Respecter l’intégrité de l’image. Pour une reproduction partielle, citer l’URL du contenu intégral.
- **À faire concrètement**
  - Faire pointer chaque licence vers son texte : `creativecommons.org/licenses/by/2.0/deed.fr`, `by-sa/2.0/deed.fr`, `by-sa/4.0/deed.fr`. Garder en plus « Source : Wikimedia Commons ».
  - Créer une rubrique « Crédits » commune. Les portraits apparaissent sans légende sur l’accueil, dans les résultats et dans « Qui porte quoi ».
  - Pour les images BY-SA, ajouter « version recadrée diffusée sous la même licence ».
  - Si un portrait entre un jour dans l’image JPG, le crédit doit figurer dans l’image elle-même.
  - Ne jamais utiliser le champ `banner` (visuels de campagne, droits réservés) sans autorisation écrite.
- **Références :**
  - https://creativecommons.org/licenses/by-sa/2.0/legalcode
  - https://creativecommons.org/licenses/by-sa/4.0/legalcode.fr
  - https://www.europarl.europa.eu/legal-notice/fr/

### 9. Composants tiers

- **Preact (licence MIT) :** la notice de copyright et de licence doit accompagner « all copies or substantial portions ». Elle est absente du bundle.
- **Archivo (licence OFL 1.1) :** le copyright et la licence doivent accompagner la police. Ils sont peut-être dans les métadonnées du fichier, ce que je n’ai pas pu vérifier.
- **À faire :** une rubrique « Licences des composants » qui reprend le texte MIT (© Jason Miller) et l’OFL (© The Archivo Project Authors), avec un lien vers chaque licence.
- **Références :** https://opensource.org/license/mit, https://openfontlicense.org/open-font-license-official-text/

### 10. Conditions d’utilisation

- **Aucune obligation :** pas de compte, pas de vente, et le DSA ne s’applique pas.
- **Portée faible :** des conditions générales ne lient l’utilisateur que s’il les a connues et acceptées (Code civil, art. 1119).
- **À éviter :**
  - une case à cocher ;
  - une clause qui désigne un tribunal : elle est réputée non écrite hors commerçants (CPC, art. 48) ;
  - une exclusion totale de responsabilité.
- **Contenu utile, en une section de la page « Mentions légales » :**
  - l’objet de l’outil ;
  - un résultat indicatif : ni consigne de vote, ni conseil, ni sondage ;
  - des positions tirées de sources publiques datées, des erreurs possibles et la façon de les signaler ;
  - un calcul fait sur l’appareil : l’utilisateur garde la maîtrise de ses fichiers ;
  - les sites liés ont leurs propres conditions ;
  - le droit français ;
  - la date de mise à jour.

### 11. Sources des chiffres et futurs graphiques

Ce point concerne directement la demande de rendre le contexte plus visuel.

- **Obligatoire.**
  - Les informations publiques réutilisées ne doivent pas être « altérées », leur sens ne doit pas être « dénaturé », et il faut mentionner leurs sources et la date de leur dernière mise à jour (CRPA, L. 322-1). La Licence Ouverte 2.0 demande la même chose.
  - Les citations doivent rester courtes, avec l’auteur et la source (CPI, L. 122-5, 3° a).
- **Pour chaque graphique :**
  - écrire « Source : [éditeur], [date] » dessous, avec le lien ;
  - pas d’axe tronqué trompeur ;
  - pas de séries mises bout à bout ni de changement de périmètre sans le dire.
- **Ne jamais reprendre une profession de foi en entier.** Les mentions légales de choisir2027.fr interdisent la recopie, mais l’exception de courte citation reste valable.
- **Déjà sur le site :** `Explainer.tsx` affiche l’éditeur, la date et le lien.
- **Références :** https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032255220 ; https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037388886/

### 12. Sondages (loi 77-808)

- **Isoloir n’est pas un sondage :** il n’y a ni échantillon ni résultat agrégé (art. 1).
- **Le mot « sondage » est interdit.** Employer ce mot pour une enquête qui n’en est pas un est puni de 75 000 € d’amende (art. 12, 1°). Aucune occurrence dans `src/`.
- **Une phrase négative reste permise.** Il est utile d’ajouter dans Méthode : « Isoloir n’est pas un sondage. »
- **Art. 11 (pas de sondage la veille et le jour du vote) :** il vise les « élections générales et référendum », donc il ne s’applique pas à la primaire.
- **Si le site publiait un jour des statistiques agrégées,** la loi pourrait s’appliquer.
- **Références :**
  - https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000032454569
  - https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000032454543

### 13. Jours de vote

- **Code électoral (L. 49, L. 48-2, L. 52-2, L. 97) :** il ne s’applique pas à la primaire, qui est un scrutin privé.
- **Bonne pratique inspirée de L. 49 :** aucune nouvelle attribution ni correction de fond pendant ces fenêtres :
  - du jeudi 8 octobre 0 h au samedi 10 octobre 20 h ;
  - du jeudi 15 octobre 0 h au samedi 17 octobre 20 h.

  La mise à jour du 11 octobre tombe en dehors. Un droit de réponse ou la correction d’une erreur avérée passent avant ce gel.
- **Pas de promotion payante jusqu’à la fin de la présidentielle.**
  - L. 52-1 interdit la publicité commerciale « à des fins de propagande électorale » depuis le 1er octobre 2026, si le premier tour a lieu en avril 2027 (dates annoncées, non revérifiées). On ne sait pas si un outil neutre en relève.
  - Une promotion payante pourrait aussi faire entrer le site dans le règlement (UE) 2024/900. Sans paiement, il ne s’applique pas : les opinions exprimées à titre personnel et les contenus sous responsabilité éditoriale en sont exclus.
- **Refuser toute aide d’un parti ou d’une équipe,** pour que « sans financement » reste exact.
- **Référence :** https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023883001

### 14. Liens légaux sur chaque écran

- Mettre « Mentions légales » et « Confidentialité », puis plus tard « Accessibilité », dans le menu d’en-tête prévu et dans le pied de chaque écran.
- Aujourd’hui, la page Confidentialité n’est accessible que depuis l’accueil et la fenêtre « mode avion ».

### 15. Accessibilité

- **Non applicable en droit.** L’art. 47 de la loi 2005-102 vise les personnes publiques, les délégataires de service public, certains organismes et les grandes entreprises. Il ne vise pas un particulier. La directive européenne 2019/882 ne s’applique pas non plus.
- **Page volontaire, utile.** Elle indiquerait :
  - l’objectif : RGAA 4.1.2 et WCAG 2.2 AA ;
  - ce qui a été vérifié ;
  - les limites connues ;
  - un contact.
- **À ne pas faire :** l’appeler « déclaration » ou dire « conforme ». Sans audit, le modèle officiel impose « non conforme ».
- Le RGAA 5 est annoncé pour fin 2026.
- **Références :** https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000037388867/ ; https://accessibilite.numerique.gouv.fr/obligations/declaration-accessibilite/

### 16. Licence d’Isoloir et phrase « Le code est vérifiable »

- **Sans licence, tous les droits sont réservés.**
- **Maintenant :** reformuler la phrase (« le code exécuté par votre navigateur peut être inspecté »), ou la justifier par un lien vers un dépôt public.
- **Plus tard :**
  - une licence pour le code : MIT, ou EUPL 1.2 ;
  - une licence pour les données propres au site : CC BY 4.0 ;
  - exclure de ces licences les photos, les citations, les données publiques, Preact et Archivo.
- **Avant de rendre le dépôt public :**
  - relire `research/`, qui contient de longs extraits de sources ;
  - confirmer les droits sur le logo : s’il a été dessiné par un tiers, il faut une cession écrite (CPI, L. 131-3).

### 17. Nom « Choisir 2027 » et indépendance

- **Risque faible.**
  - Une contrefaçon de marque suppose un usage « dans la vie des affaires » (CPI, L. 713-2).
  - La loi permet aussi d’utiliser une marque pour « désigner ou mentionner » ce qui appartient à son titulaire (L. 713-6, I, 3°).
- **À ne jamais faire :** utiliser « Choisir 2027 » comme nom, nom de domaine, icône ou visuel.
- **Maintenant :** ajouter « outil indépendant » dans `og:description`, car l’aperçu circule sans le pied de page.
- **Plus tard :** vérifier « Choisir 2027 » et « Isoloir » sur data.inpi.fr ou TMview. Les outils automatiques n’ont pas pu le faire.

### 18. Droit à l’image

- **Licite.** Publier l’image de personnes qui illustrent un débat d’intérêt général est permis (Cass. 1re civ., 29 mars 2017, n° 15-28.813), hors usage commercial.
- **Option à proposer :** remplacer un portrait par les initiales sur demande du candidat.
- **Neutralité, sans enjeu juridique :** les photos datent de 2010 à 2024.

### 19. Hébergement

- **Contrat avec Vercel**
  - Le DPA de Vercel ne vise que les offres Pro et Enterprise.
  - Vercel peut utiliser les « System Data » « for any business purposes », et se déclare responsable de traitement des « Service-Generated Data ».
- **Qualification incertaine [juriste] :** sur Hobby, Vercel est soit un sous-traitant sans contrat conforme à l’art. 28, soit un responsable de traitement indépendant.
- **Options :**
  - accepter ce risque, qui reste faible ;
  - passer à l’offre Pro ;
  - changer pour un hébergeur de l’UE qui fournit un DPA à tous ses clients.
- **Dans tous les cas,** mentionner l’hébergeur et le transfert dans la notice.
- **Référence :** https://vercel.com/legal/dpa

### 20. Ne s’appliquent pas

| Texte | Pourquoi il ne s’applique pas |
|---|---|
| DSA | Isoloir n’héberge aucun contenu d’utilisateur |
| LCEN, art. 19 et directive 2000/31, art. 5 | Ils visent le commerce, ou des services fournis contre rémunération |
| Code de la consommation, L. 111-7 | Il vise une activité professionnelle |
| ARCOM | Elle régule la radio et la télévision |
| Règlement (UE) 2024/900 | Le site n’est ni payé ni commandé par un acteur politique |
| Consentement des mineurs (RGPD, art. 8) | Le site ne recourt pas au consentement ; un langage simple suffit |
| Analyse d’impact, délégué à la protection des données, déclaration CNIL | Non requis |

## D. Ce que le propriétaire doit fournir

1. **Le régime choisi, A ou B.**
   - Option A : nom, prénoms, domicile et téléphone, et confirmation qu’il est majeur et jouit de ses droits civils.
   - Option B : la preuve que Vercel détient son identité complète.
2. **Le nom à afficher au titre du RGPD.**
3. **Une adresse de contact dédiée,** qui la lit, et dans quel délai pendant les jours de vote.
4. **La confirmation que l’activité est non professionnelle :** aucun revenu, pas dans le cadre d’un métier.
5. **Sur Vercel :**
   - l’offre utilisée (Hobby ou Pro) ;
   - les options activées : Web Analytics, Speed Insights, Log Drains, Observability Plus, pare-feu ou mode anti-attaque ;
   - s’il consulte ou exporte les journaux.
6. **Son accord pour écrire aux cinq équipes,** courriel qu’il envoie lui-même.
7. **Sur le code :** le dépôt est-il public, avec quelles licences ? Qui a dessiné le logo ?
8. **La durée de vie du site après l’élection,** et son accord sur une éventuelle purge automatique.

## E. Points à soumettre à un juriste

1. La validité de l’anonymat (option B) avec un compte Vercel Hobby. C’est le point le plus important.
2. Comment concilier l’anonymat permis par la LCEN avec l’identité qu’exige l’art. 13 du RGPD.
3. Le rôle de Vercel pour les journaux, en l’absence de DPA.
4. L’application de l’art. 14 du RGPD aux candidats, et l’accès d’un particulier à la dérogation journalistique (art. 85 du RGPD, art. 80 de la loi Informatique et Libertés).
5. La rédaction de la procédure de droit de réponse, et les motifs de refus admissibles.
6. Le choix des licences avant de rendre le dépôt public.

## F. Recommandation

**Maintenant, avant le jeudi 8 octobre 0 h.** Le site nomme des personnes en pleine élection, et c’est pendant le vote que les demandes de correction ou de réponse sont le plus probables. Il faut donc d’abord :

- **un canal de contact,** avec `REPORT_URL` et la rubrique « Droit de réponse et corrections » ;
- **une page « Mentions légales »** dans le régime choisi : hébergeur, directeur de la publication, conditions d’utilisation courtes, crédits avec liens vers les licences, notices de Preact et d’Archivo ;
- **la notice de confidentialité complétée :** hébergeur, journaux, transfert, candidats, droits, CNIL, stockage local ;
- **les corrections de formulation :**
  - « ni serveur » ;
  - « ne collecte rien » ;
  - « Le code est vérifiable » ;
  - mention de l’indépendance dans `og:description` ;
  - « Isoloir n’est pas un sondage » ;
- **des liens vers ces pages sur chaque écran,** via le menu prévu ;
- **côté propriétaire :** le courriel aux cinq équipes, la surveillance de la boîte, le gel des données et l’absence de promotion payante.

Les obligations de la LCEN sont sanctionnées pénalement, et le délai de 3 jours du droit de réponse tombe sur les jours de vote. Pourtant, presque tout ce lot est du texte : une demi-journée à une journée de travail, une fois les informations du §D fournies. La seule décision qui bloque est le choix entre l’option A et l’option B.

**Plus tard, après le 17 octobre, ou avant d’étendre le site à la présidentielle :**

- la page « Accessibilité » ;
- la licence et la publication du dépôt ;
- le choix d’hébergement (Pro ou UE, avec un DPA) ;
- le registre interne et la note de conformité ;
- la purge automatique de la progression ;
- la vérification des marques ;
- l’harmonisation des photos ;
- en cas d’extension à la présidentielle, revoir L. 49, L. 52-1, L. 163-2 (à partir du 1er janvier 2027) et l’art. 11 de la loi 77-808.

Fichiers relus pour vérifier les constats sur le site :
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/core/app.ts
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/ui/screens/Home.tsx
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/ui/screens/Privacy.tsx
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/ui/screens/Method.tsx
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/ui/screens/Candidates.tsx
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/ui/components/Airplane.tsx
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/src/elections/choisir-2027/candidates.ts
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/index.html
- /Users/lambertbouley/Claude/Politique/primaire-de-gauche/dist/assets/

Les connecteurs Vercel, Figma et Miro demandent une autorisation (via /mcp ou les réglages des connecteurs claude.ai), et Claude Design n’a pas pu se connecter. Je n’ai donc pas pu vérifier directement l’offre Vercel du projet.