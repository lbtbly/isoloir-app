import { useEffect, useMemo } from 'preact/hooks'
import { go } from '../../app'
import { APP_NAME, REPORT_URL } from '../../core/app'
import { CLOSE_GAP, effectiveWeight, METHOD_VERSION, PARTIAL_COVERAGE, SMOOTHING_K } from '../../core/score'
import type { ElectionPack } from '../../core/types'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { SectionLink, goToSection } from '../components/LegalBits'
import { formatDate } from '../format'
import '../../styles/ai-label.css'

/** Règlement européen sur l'intelligence artificielle, sur EUR-Lex */
const AI_ACT = 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1689'

export function Method({ pack, anchor }: { pack: ElectionPack; /** Rubrique à montrer à l'ouverture (#/methode/ia) */ anchor?: string }) {
  const { election, bank, positions, candidates } = pack
  const stats = useMemo(() => {
    const essential = bank.questions.filter(q => q.tier === 'essentiel').length
    const deep = bank.questions.length - essential
    let entries = 0
    const sources = new Set<string>()
    for (const c of candidates)
      for (const p of Object.values(positions[c.id] ?? {})) {
        entries++
        p.sources.forEach(s => sources.add(s.url))
      }
    // Approches sans aucun porteur effectif (aucun candidat ne les porte avec une position vérifiée)
    const external = bank.questions
      .flatMap(q => q.approaches)
      .filter(a => candidates.every(c => effectiveWeight(positions[c.id]?.[a.id]) === 0)).length
    const sizes = bank.questions.map(q => q.approaches.length)
    return { essential, deep, entries, sources: sources.size, external, min: Math.min(...sizes), max: Math.max(...sizes) }
  }, [bank, positions, candidates])
  const step1 = bank.questions.filter(q => q.step === 1).length
  const closing = bank.questions.filter(q => q.last && q.tier === 'essentiel')

  // Arrivée par un lien « En savoir plus » (#/methode/ia) : la rubrique vient sous l'en-tête, une fois la page
  // posée (après le focus du titre que donne le routeur), et son titre prend le focus
  useEffect(() => {
    if (!anchor) return
    const t = window.setTimeout(() => goToSection(anchor), 60)
    return () => window.clearTimeout(t)
  }, [anchor])

  return (
    <div class="screen screen-read">
      <FormHeader title="Notice" right="Méthode" />
      <main class="sheet prose has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Méthode et sources
        </h1>
        <p class="lede">
          {APP_NAME} est une boussole électorale indépendante. Cette notice explique comment les questions ont été
          construites, comment le score est calculé et quelles en sont les limites. Les textes ont été rédigés par une
          intelligence artificielle et vérifiés automatiquement&nbsp;: voir <SectionLink id="ia">Usage de l’IA</SectionLink>.
          Méthode version {METHOD_VERSION}, données version {election.dataVersion}.
        </p>

        <h2>Les questions</h2>
        <p>
          {stats.essential} questions forment le questionnaire rapide et {stats.deep} le questionnaire approfondi.
          Chacune porte sur un désaccord documenté entre candidats ; les sujets sur lesquels tous s’accordent sont
          affichés à part, sans être notés. Chaque question propose de {stats.min} à {stats.max} approches rédigées sans
          nom, sans slogan et sans formule propre à un candidat, avec une structure et une longueur comparables. Elles
          ont été rédigées par une IA, puis vérifiées automatiquement&nbsp;: par une IA, et par des tests qui refusent
          tout nom de candidat, de parti organisateur ou slogan.{' '}
          {stats.external} approche{stats.external > 1 ? 's ne sont portées' : ' n’est portée'} par aucun candidat de
          façon vérifiée : elles permettent d’exprimer une préférence qui n’est pas au programme et ne favorisent
          personne.
        </p>
        <p>
          L’ordre des approches et celui des thèmes sont tirés au hasard pour chaque personne, puis restent stables.
          {closing.map(q => (
            <span key={q.id}>
              {' '}
              Une exception : la question «&nbsp;{q.prompt.replace(/ ([?!:;])/g, '\u00a0$1')}&nbsp;» vient toujours{' '}
              {q.step === 1 ? `en ${step1}e position, juste avant la première tendance` : 'en dernier dans le questionnaire rapide'}
              , pour ne pas ouvrir la feuille sur elle.
            </span>
          ))}{' '}
          Les candidats sont aussi présentés dans un ordre aléatoire partout où ils ne sont pas classés.
        </p>

        <h2>Les positions des candidats</h2>
        <p>
          {stats.entries} attributions s’appuient sur {stats.sources} sources publiques : professions de foi publiées
          sur le site officiel de la primaire, programmes, débats télévisés, interviews et votes. Chaque attribution
          indique sa nature (proposition, déclaration ou déduction) et sa ou ses sources datées. Les positions ont été
          recherchées et résumées par une IA&nbsp;; chacune a ensuite été vérifiée automatiquement contre sa source, par
          une seconde passe d’IA distincte de la rédaction, sans relecture humaine une par une. Une attribution douteuse
          est retirée&nbsp;: la position devient alors inconnue plutôt que supposée.
        </p>
        <p>
          Positions arrêtées au {formatDate(election.dataFrozenAt)}. {election.notes.join(' ')} Toutes les positions sont
          consultables candidat par candidat, avec leurs sources, dans <a href="#/candidats">Les candidats</a>.
        </p>

        <h2>Votre avis</h2>
        <p>
          Pour chaque approche, vous placez un repère sur une réglette à trois crans : pas d’accord, sans avis, d’accord.
          Tant que vous n’y touchez pas, le repère reste au centre, sans avis : il suffit de s’arrêter sur les approches
          qui vous font réagir. La case « ligne rouge » est à part : elle place la réglette sur « pas d’accord » et sert de
          filtre (voir plus bas).
        </p>
        {step1 ? (
          <p>
            Le questionnaire rapide se fait en deux temps : {step1} questions donnent une première tendance, puis{' '}
            {stats.essential - step1} autres l’affinent jusqu’au dépouillement complet. Les {step1} premières portent sur
            les grands désaccords de la primaire, la position de chaque candidat y est connue, et elles ont été retenues
            parce qu’elles ne favorisent personne : sur des profils tirés au hasard, chaque candidat arrive premier dans
            une part comparable des cas.
          </p>
        ) : null}

        <h2>Le calcul</h2>
        <p>
          Chaque cran vaut un avis : pas d’accord −1, sans avis 0, d’accord +1.
          Sur chaque question, un candidat a en général une approche principale (poids 2), parfois une approche
          compatible (poids 1), et il peut rejeter explicitement une approche (poids −1). Son score sur la question
          confronte vos avis à ce profil : la somme de vos avis multipliés par ses poids, divisée par la somme de ses
          poids, donne un accord entre −1 et +1, ramené entre 0 et 100 %. 50 % est le neutre : vous n’avez donné aucun avis
          sur ce qu’il porte.
        </p>
        <p>
          Par exemple, pour un candidat qui a une principale et une compatible : « d’accord » sur les deux donne 100 %,
          sur la seule principale 83 %, sur la seule compatible 67 % ; « pas d’accord » sur la principale donne 17 %. Une
          position seulement déduite (vote, texte signé) compte au plus pour une approche compatible. Noter
          beaucoup d’approches ne favorise personne : si vous notez tout au même cran, les candidats connus sur les mêmes
          questions obtiennent le même score, sauf ceux qui rejettent explicitement l’une d’elles.
        </p>
        <p>
          Une position probable mais non vérifiée n’entre pas dans le calcul : si vous donnez un avis sur une approche
          qu’un candidat ne porte ou ne rejette que de façon probable, la question sort de son calcul.
        </p>
        <p>
          Les questions passées, et celles où vous n’avez donné aucun avis, ne comptent pas. Quand la position d’un
          candidat est inconnue, la question sort de son calcul à lui seulement ; elle n’est jamais remplacée par une
          position neutre. Le score par thème est la moyenne des questions du thème ; le score global est la moyenne des
          thèmes, ceux que vous avez choisis comme prioritaires comptant double. Approfondir un thème affine son score
          sans augmenter son poids.
        </p>
        <p>
          Pour éviter qu’un candidat connu sur très peu de questions obtienne un score extrême, le score global est
          ramené vers 50 %, le neutre, en proportion du nombre de questions connues (lissage avec k = {SMOOTHING_K}). Le
          score avant lissage est indiqué dès qu’il diffère. Un candidat dont la position est connue sur moins de{' '}
          {Math.round(PARTIAL_COVERAGE * 100)} % de vos réponses est signalé « données partielles ».
        </p>

        <h2>Les lignes rouges</h2>
        <p>
          Une ligne rouge place l’approche sur « pas d’accord », compté comme tout autre avis, et ajoute un filtre : les
          candidats qui portent l’approche concernée sont classés après les autres, avec leur score et la mention de
          l’approche. Si tous les candidats en franchissent au moins
          une, ils sont classés du moins au plus concerné. Quand la position n’est qu’une déduction ou reste probable, le
          signalement est indiqué comme « possible » et ne modifie pas le classement. Vous pouvez tracer plusieurs lignes
          rouges par question ; au-delà de cinq au total, l’outil rappelle que ces refus pèsent beaucoup.
        </p>

        <h2>Lire le résultat</h2>
        <p>
          Les candidats d’une même primaire sont proches : un écart de moins de {CLOSE_GAP} points n’est pas
          significatif et il est signalé. Le résultat est aussi recalculé avec une méthode simplifiée (approches
          principales approuvées moins approches principales désapprouvées), parmi les candidats d’un même groupe ; si
          le premier change, l’outil l’indique. Les ex aequo sont affichés comme tels, dans un ordre tiré au hasard. Ce
          n’est pas une consigne de vote : l’outil ignore la personnalité, l’expérience et la capacité à rassembler.
        </p>
        <p>
          {APP_NAME} n’est pas un sondage&nbsp;: il ne recueille les réponses de personne et ne publie aucun résultat
          d’ensemble. Chaque dépouillement ne concerne que la personne qui répond, sur son propre appareil.
        </p>

        <h2>Les versions des questions</h2>
        <p>
          Chaque question porte un numéro de révision. Une retouche de forme (coquille, typographie, mot remplacé) le
          garde ; un changement de fond (énoncé reformulé, approche ajoutée ou retirée) l’incrémente.{' '}
          {election.revisionTracking
            ? 'Une réponse donnée sur une version antérieure est mise de côté et vous est proposée à la relecture, y compris quand vous reprenez votre double.'
            : 'Pendant la phase de test, ce suivi est désactivé : vos réponses sont gardées telles quelles.'}
        </p>

        <section class="ai-section" aria-labelledby="ia">
          <h2 id="ia" tabIndex={-1}>
            Usage de l’IA
          </h2>
          <p>
            {APP_NAME} a été fabriqué avec une intelligence artificielle, Claude, d’Anthropic. Les questions, fiches,
            résumés de positions, parcours et textes de vidéos qu’elle a rédigés le disent en tête, là où ils
            apparaissent&nbsp;: «&nbsp;Rédigé par IA&nbsp;», «&nbsp;Positions résumées par IA&nbsp;»…
          </p>

          <h3>Ce que l’IA a fait</h3>
          <ul>
            <li>Écrire le code du site.</li>
            <li>
              La recherche documentaire&nbsp;: trouver et lire professions de foi, programmes, débats, interviews et votes.
            </li>
            <li>Rédiger les questions et leurs approches.</li>
            <li>
              Rédiger les fiches de contexte («&nbsp;Comprendre l’enjeu&nbsp;», page <a href="#/sujets">Les sujets</a>)
              et leurs chiffres clés.
            </li>
            <li>Rédiger les résumés des positions des candidats et leur parcours.</li>
            <li>
              Rédiger les textes des vidéos (page <a href="#/videos">Les sujets en vidéo</a>).
            </li>
            <li>
              Les vérifier automatiquement&nbsp;: une seconde passe, menée elle aussi par une IA, compare chaque position
              et chaque chiffre à sa source, et chaque formulation au principe de neutralité. Des tests automatiques
              refusent en plus tout nom de candidat, de parti organisateur ou slogan dans les questions.
            </li>
          </ul>

          <h3>Ce qui n’a pas été fait</h3>
          <p>
            Ces textes n’ont pas été relus un par un par une personne. Des erreurs restent possibles&nbsp;: c’est pour
            cela que chaque position et chaque chiffre citent leur source, que vous pouvez ouvrir.
          </p>

          <h3>Ce que l’IA ne fait pas pendant votre visite</h3>
          <p>
            Aucune IA ne tourne pendant votre visite. Le score suit les règles écrites décrites plus haut et se calcule
            sur votre appareil&nbsp;; aucun conseil n’est généré pour vous, et vos réponses ne sont envoyées à aucune IA,
            ni ailleurs (voir la <a href="#/confidentialite">notice de confidentialité</a>).
          </p>

          <h3>La voix des vidéos</h3>
          <p>
            Les vidéos sont lues par une voix de synthèse. Elle est générée à l’avance, à partir des textes des vidéos,
            sur l’ordinateur de l’éditeur, par un modèle libre de synthèse vocale (VoxCPM2)&nbsp;; puis servie avec le
            site, un fichier audio par passage. Elle n’imite aucune personne réelle&nbsp;: elle a été créée à partir
            d’une description écrite. Rien n’est synthétisé sur votre appareil pendant la visite.
          </p>
          <p>
            Le lecteur l’indique pendant la lecture&nbsp;: «&nbsp;Texte rédigé par IA · voix de synthèse&nbsp;». Le son se
            coupe dans le lecteur&nbsp;; les sous-titres restent. Un passage dont la voix n’est pas encore enregistrée, ou
            une vidéo regardée hors ligne, se lit en sous-titres seuls.
          </p>

          <h3>Signaler une erreur</h3>
          <p>
            Une erreur dans une question, une fiche ou une position&nbsp;?{' '}
            {REPORT_URL ? (
              <>
                <a href={REPORT_URL}>Signalez-la</a>. La marche à suivre, droit de réponse compris, est dans les{' '}
              </>
            ) : (
              'La marche à suivre pour la signaler, droit de réponse compris, est dans les '
            )}
            <a href="#/mentions-legales">mentions légales</a>&nbsp;; chaque correction est datée dans le{' '}
            <SectionLink id="journal">journal des données</SectionLink>.
          </p>
          <p class="small">
            Signaler les textes générés par une IA et publiés pour informer le public, quand ils ne sont pas relus par
            une personne, est aussi ce que demande le{' '}
            <ExternalLink href={AI_ACT}>règlement européen sur l’intelligence artificielle</ExternalLink> (article 50).
          </p>
        </section>

        <h2>Indépendance</h2>
        <p>
          Outil édité par un citoyen, à titre personnel, sans lien avec le Parti socialiste, Place publique, la Gauche
          républicaine et socialiste, le site de la primaire ni les équipes des candidats, et sans financement. Le code
          exécuté par votre navigateur peut être inspecté&nbsp;; il sera publié sous licence MIT.
        </p>

        <h2 id="journal" tabIndex={-1}>
          Journal des données
        </h2>
        <ul>
          {election.changelog.map(c => (
            <li key={c.date + c.text}>
              {formatDate(c.date)} : {c.text}
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Retour">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={() => go('/')}>
            <Icon name="arrow-left" />
            Accueil
          </button>
        </div>
      </nav>
    </div>
  )
}
