// Les séries de vidéos « Les sujets » : un thème, une série ; l'introduction, puis un approfondissement par
// levier. Une série par fichier, series/<thème>.ts (null tant qu'elle n'est pas écrite), rassemblées par
// series/index.ts. Ce module garde l'adresse publique des séries telles qu'écrites (identifiants de la
// primaire) : les tests et le générateur des voix lisent VIDEO_SERIES ici ; le site, lui, passe par le catalogue
// (catalog.ts), qui les réétiquette pour l'élection affichée (scope.ts).
// Guide d'écriture d'une série (structure, ton, neutralité, chiffres, « spoken », identifiants, planches) :
// GUIDE-SERIES.md. Textes vérifiés contre les fiches des questions (question.explainer dans
// src/elections/choisir-2027/bank.ts, research/choisir-2027/explainers.json) et contre leurs sources.
// Règles :
// - l'enjeu et les chiffres seulement, jamais les approches proposées, un candidat ou un parti ;
// - chaque chiffre montré reprend à la lettre la valeur, le libellé et la date de sa source (figure), et
//   l'index de cette source (sourceIndex : index dans « sources ») ;
// - typographie déjà composée : espace fine insécable (U+202F) avant « ? » et dans les milliers, insécable
//   (U+00A0) avant « : » et « % », et entre un nombre et son unité (« 64 ans »), pour qu'aucun sous-titre ne
//   coupe « 64 / ans ». Chaque « emphasis » est écrit exactement comme dans le « say » ;
// - « spoken », quand il existe, est le « say » tel que la voix de synthèse doit le prononcer : nombres, dates,
//   pourcentages et sigles en toutes lettres, même ponctuation, espaces simples ; même sens et mêmes chiffres
//   que le « say », à reprendre à chaque changement du « say » ;
// - aucune invitation à « donner son avis » dans ce qui est dit : sur le site, la personne y est déjà ; hors du
//   site, c'est le lecteur qui l'ajoute en fin de vidéo (contexte « share », Video.tsx) ;
// - les identifiants des vidéos et des passages nomment les fichiers de la voix enregistrée
//   (public/videos/audio/<voix>/<vidéo>/<passage>.m4a, voir audio.ts) : en changer un, c'est perdre sa voix ;
//   changer le « say » (ou le « spoken ») d'un passage, c'est devoir la réenregistrer.

export { SERIES_BY_TOPIC, VIDEO_SERIES } from './series/index'
