import { useEffect, useMemo } from 'preact/hooks'
import { go, link } from '../nav'
import { APP_NAME, REPORT_URL } from '../../core/app'
import { CLOSE_GAP, effectiveWeight, knownQuestions, METHOD_VERSION, PARTIAL_COVERAGE, SMOOTHING_K } from '../../core/score'
import type { ElectionPack, Question } from '../../core/types'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { SectionLink, goToSection } from '../components/LegalBits'
import { formatDate, shareText } from '../format'
import { hasVideos } from '../videos/load'
import '../../styles/ai-label.css'

/** « A », « A et B », « A, B et C » */
const joinNames = (names: string[]) => (names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} et ${names.at(-1)}`)

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
  // Non classés (election.ranking.excluded) : sortis du calcul ; ce que l'on sait d'eux, dit d'après les données
  const exclusion = election.ranking?.excluded ?? null
  const unscored = useMemo(() => {
    if (!exclusion) return null
    const off = new Set(exclusion.ids)
    const lastName = (name: string) => name.split(' ').slice(1).join(' ') || name
    const people = candidates
      .filter(c => off.has(c.id))
      .sort((a, b) => lastName(a.name).localeCompare(lastName(b.name), 'fr'))
    const known = people.map(c => knownQuestions(pack, c.id))
    const others = candidates.filter(c => !off.has(c.id)).map(c => knownQuestions(pack, c.id))
    return {
      names: people.map(c => c.name),
      low: Math.min(...known),
      high: Math.max(...known),
      // Le moins connu des candidats classables
      floor: others.length ? Math.min(...others) : null,
    }
  }, [exclusion, candidates, pack])
  const step1Questions = useMemo(() => bank.questions.filter(q => q.step === 1), [bank])
  const step1 = step1Questions.length
  const closing = bank.questions.filter(q => q.last && q.tier === 'essentiel')
  // Ce que l'on sait des candidats sur les questions du premier temps, dit d'après les données
  const step1Coverage = useMemo(() => {
    const known = (cid: string, q: Question) => q.approaches.some(a => effectiveWeight(positions[cid]?.[a.id]) > 0)
    const n = candidates.length
    const leastPerQuestion = Math.min(...step1Questions.map(q => candidates.filter(c => known(c.id, q)).length))
    if (leastPerQuestion >= n) return 'la position de chaque candidat y est connue'
    // Couverture par candidat : celle des candidats classables, les non classés n'ayant pas de score
    const off = new Set(exclusion?.ids ?? [])
    const leastPerCandidate = Math.min(...candidates.filter(c => !off.has(c.id)).map(c => step1Questions.filter(q => known(c.id, q)).length))
    return (
      `sur chacune, la position d’au moins ${leastPerQuestion} candidats sur ${n} est connue ` +
      `(chaque candidat${off.size ? ', hors les non classés,' : ''} l’est sur au moins ${leastPerCandidate} d’entre elles)`
    )
  }, [step1Questions, candidates, positions, exclusion])
  // Les tests refusent dans les questions les noms des candidats et ceux des partis : de la primaire, ses organisateurs
  const parties = election.kind === 'primaire' ? 'de parti organisateur' : 'de parti'

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
          affichés à part, sans être notés. Chaque question propose de {stats.min} à {stats.max}
          {/* Les phrases qui reçoivent un texte de l'élection sont d'un seul tenant (un seul nœud de texte, comme
              avant le passage à plusieurs élections) : la mise en page de la primaire reste la même au pixel près */}
          {` approches rédigées sans nom, sans slogan et sans formule propre à un candidat, avec une structure et une longueur comparables. Elles ont été rédigées par une IA, puis vérifiées automatiquement\u00a0: par une IA, et par des tests qui refusent tout nom de candidat, ${parties} ou slogan.`}{' '}
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
          Les candidats sont aussi présentés dans un ordre aléatoire partout où ils ne sont pas classés
          {election.spectrum ? (
            <>
              , sauf sur la page des candidats (voir <SectionLink id="ordre-des-candidats">l’ordre des candidats</SectionLink>)
            </>
          ) : null}
          .
        </p>

        <h2>Les positions des candidats</h2>
        <p>
          {stats.entries} attributions s’appuient sur {stats.sources}
          {` sources publiques : ${election.copy.sources}. Chaque attribution indique sa nature (proposition, déclaration ou déduction) et sa ou ses sources datées. Les positions ont été recherchées et résumées par une IA\u00a0; chacune a ensuite été vérifiée automatiquement contre sa source, par une seconde passe d’IA distincte de la rédaction, sans relecture humaine une par une. Une attribution douteuse est retirée\u00a0: la position devient alors inconnue plutôt que supposée.`}
        </p>
        <p>
          Positions arrêtées au {formatDate(election.dataFrozenAt)}. {election.notes.join(' ')} Toutes les positions sont
          consultables candidat par candidat, avec leurs sources, dans <a href={link('/candidats')}>Les candidats</a>.
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
            {stats.essential - step1} autres l’affinent jusqu’au dépouillement complet. Les {step1}
            {` premières ${election.copy.step1Reason}, ${step1Coverage}, et elles ont été retenues parce qu’elles ne favorisent personne : sur des profils tirés au hasard, chaque candidat${exclusion ? ' (hors les non classés)' : ''} arrive premier dans une part comparable des cas.`}
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

        {/* Page des candidats rangée selon une grille des nuances (election.spectrum) ; lien direct : #/methode/ordre-des-candidats */}
        {election.spectrum ? (
          <>
            <h2 id="ordre-des-candidats" tabIndex={-1}>
              L’ordre des candidats et leurs couleurs
            </h2>
            <p>
              Sur la page des candidats, ils sont présentés de l’extrême gauche à l’extrême droite, dans l’ordre de la
              grille officielle des nuances politiques du ministère de l’Intérieur (
              <ExternalLink href={election.spectrum.source.url}>{election.spectrum.source.title}</ExternalLink>
              {election.spectrum.source.date ? `, ${formatDate(election.spectrum.source.date)}` : ''}).
              {` Chaque candidat y prend la nuance de son parti, ou, si son parti n’y figure pas, celle que le ministère lui a attribuée à sa dernière élection\u00a0; au sein d’une même nuance, l’ordre est alphabétique. L’élection présidentielle n’attribue pas elle-même de nuances\u00a0: ce rangement est celui d’Isoloir, à partir de cette grille, qui place entre la gauche et le centre un bloc «\u00a0Autres\u00a0» (écologistes, divers, régionalistes).`}
            </p>
            <p>
              {`Chaque carte porte la couleur du parti, celle de son identité visuelle actuelle, ou, faute de couleur propre, celle de sa famille politique\u00a0: rouge à gauche, jaune au centre, bleu à droite, gris pour les autres. Quand une couleur ne permet pas un texte lisible, elle est légèrement assombrie. Les logos sont ceux des partis, marques de leurs titulaires, montrés pour les reconnaître. Rien de cela n’entre dans le calcul\u00a0: pendant le questionnaire, les approches restent sans nom ni couleur, et ailleurs sur le site les candidats restent présentés dans un ordre tiré au hasard.`}
            </p>
          </>
        ) : null}

        {/* Décision propre à l'élection (election.ranking.excluded) ; lien direct : #/methode/non-classes */}
        {exclusion && unscored ? (
          <>
            <h2 id="non-classes" tabIndex={-1}>
              Les candidats non classés
            </h2>
            <p>
              {`Pour cette élection, ${unscored.names.length > 1 ? `${unscored.names.length}\u00a0candidats ne sont pas classés` : 'un candidat n’est pas classé'}, depuis le ${formatDate(exclusion.since)}\u00a0: ${joinNames(unscored.names)}. ${unscored.names.length > 1 ? 'Le même motif vaut pour chacun' : 'Le motif'}, «\u00a0${exclusion.reason}\u00a0». ${unscored.names.length > 1 ? 'Ils n’ont' : 'Il n’a'} ni score ni rang, quelles que soient vos réponses\u00a0: ni au classement, ni parmi les candidats hors classement, et ${unscored.names.length > 1 ? 'ils n’entrent' : 'il n’entre'} dans aucune comparaison du résultat (ex aequo, écart significatif, méthode simplifiée, lignes rouges). Le résultat ${unscored.names.length > 1 ? 'les nomme' : 'le nomme'} sous le classement, avec le nombre de questions où ${unscored.names.length > 1 ? 'la position de chacun' : 'sa position'} est connue\u00a0; l’image à partager ${unscored.names.length > 1 ? 'ne donne que leur nombre' : 'le compte, sans le nommer'}. ${unscored.names.length > 1 ? 'Leurs fiches, leurs positions' : 'Sa fiche, ses positions'} connues, avec leurs sources, et le comparateur restent à votre disposition.`}
            </p>
            <p>
              {`Une question compte comme connue quand le calcul y retient une position du candidat\u00a0: une approche qu’il porte ou qu’il rejette explicitement, vérifiée contre sa source\u00a0; une position seulement probable, signalée sur sa fiche, ne compte pas. ${unscored.names.length > 1 ? `La position des candidats non classés est connue sur ${unscored.low === unscored.high ? unscored.low : `${unscored.low} à ${unscored.high}`} des ${bank.questions.length}\u00a0questions de la banque, selon le candidat` : `La position de ce candidat est connue sur ${unscored.high} des ${bank.questions.length}\u00a0questions de la banque`}${unscored.floor === null ? '' : `\u00a0; celle de chacun des autres, sur au moins ${unscored.floor}`}. Sur si peu de questions, un score dirait surtout le hasard de celles auxquelles vous avez répondu.`}
            </p>
            <p>
              {`La liste est propre à cette élection et révisable\u00a0: un candidat la quitte dès que ses positions sont connues sur assez de questions, par exemple quand son programme est publié. Chaque changement est daté dans le `}
              <SectionLink id="journal">journal des données</SectionLink>.
            </p>
          </>
        ) : null}

        {/* Règle propre aux élections qui l'activent (election.ranking.minCoverageShare) ; lien direct : #/methode/hors-classement */}
        {election.ranking?.minCoverageShare != null ? (
          <>
            <h2 id="hors-classement" tabIndex={-1}>
              Les candidats hors classement
            </h2>
            <p>
              {`Pour cette élection, ${exclusion ? 'parmi les autres candidats, ' : ''}un candidat dont la position est connue sur moins de ${shareText(election.ranking.minCoverageShare)} de vos réponses (les questions où vous avez donné au moins un avis) n’est pas classé. Il apparaît sous le classement, dans une liste à part, «\u00a0Trop peu de positions connues pour les classer\u00a0»\u00a0: pour chacun, le nombre de vos réponses sur lesquelles sa position est connue et son score, donné à titre indicatif, sans rang ni bâtons. Ces candidats sont présentés dans un ordre tiré au hasard\u00a0; l’image à partager ne donne que leur nombre.`}
            </p>
            <p>
              {`La raison\u00a0: un score calculé sur peu de questions varie beaucoup. Connu sur deux ou trois de vos réponses, un candidat peut obtenir un score très haut ou très bas par le seul jeu de ces quelques questions, et le lissage vers 50\u00a0% ne suffit pas à corriger cet écart. Sur des profils de réponses tirés au hasard, un candidat connu sur très peu de questions arrivait ainsi premier bien plus souvent que les autres, sans que ses idées y soient pour rien. Les ex aequo, l’écart significatif, la comparaison avec la méthode simplifiée et «\u00a0Ce qui les sépare\u00a0» ne portent que sur les candidats classés.`}
            </p>
          </>
        ) : null}

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
          {`${election.copy.closeGapReason} : un écart de moins de `}
          {CLOSE_GAP} points n’est pas significatif et il est signalé. Le résultat est aussi recalculé avec une méthode
          simplifiée (approches principales approuvées moins approches principales désapprouvées), parmi les candidats
          d’un même groupe ; si le premier change, l’outil l’indique. Les ex aequo sont affichés comme tels, dans un ordre tiré au hasard. Ce
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
              Rédiger les fiches de contexte («&nbsp;Comprendre l’enjeu&nbsp;», page <a href={link('/sujets')}>Les sujets</a>)
              et leurs chiffres clés.
            </li>
            <li>Rédiger les résumés des positions des candidats et leur parcours.</li>
            {hasVideos(pack) ? (
              <li>
                Rédiger les textes des vidéos (page <a href={link('/videos')}>Les sujets en vidéo</a>).
              </li>
            ) : null}
            <li>
              {`Les vérifier automatiquement\u00a0: une seconde passe, menée elle aussi par une IA, compare chaque position et chaque chiffre à sa source, et chaque formulation au principe de neutralité. Des tests automatiques refusent en plus tout nom de candidat, ${parties} ou slogan dans les questions.`}
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
            ni ailleurs (voir la <a href={link('/confidentialite')}>notice de confidentialité</a>).
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
            <a href={link('/mentions-legales')}>mentions légales</a>&nbsp;; chaque correction est datée dans le{' '}
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
          {`Outil édité par un citoyen, à titre personnel, ${election.copy.independence.method}, et sans financement. Le code exécuté par votre navigateur peut être inspecté\u00a0; il sera publié sous licence MIT.`}
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
