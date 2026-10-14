// « À table » : la page d'accueil de la table (#/a-table), en mode ouvert. Ce qu'on va faire en trois aplats, ce
// que la table promet (cadenas), le secret dit honnêtement et les règles du compte, publiées avant de voter.

import { RULES, SECRET, TABLE_NAME } from '../../../core/table/copy'
import { FormHeader } from '../../components/FormHeader'
import { Icon } from '../../components/Icon'
import { SiteFooter } from '../../components/SiteFooter'

export function Hub({ onStart }: { onStart: () => void }) {
  return (
    <div class="screen screen-table-hub">
      <FormHeader title={TABLE_NAME} />
      <main class="sheet" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          À table
        </h1>
        <p class="lede">
          De 4 à 12 personnes, un seul téléphone. Chacun donne son avis en secret sur des idées présentées sans le nom
          des candidats, puis vous lisez ensemble, à voix haute, ce qui vous réunit.
        </p>

        <ol class="table-steps">
          <li class="table-step">
            <h2>1. Chacun vote en secret</h2>
            <p>Le téléphone passe de main en main. Sur chaque idée, la réglette du site&nbsp;: pas d’accord, sans avis, d’accord, et la ligne rouge.</p>
          </li>
          <li class="table-step">
            <h2>2. On lit le résultat à voix haute</h2>
            <p>Une idée après l’autre&nbsp;: ce qui vous réunit, ce que la table refuse, ce qui vous divise. Jamais qui a voté quoi.</p>
          </li>
          <li class="table-step">
            <h2>3. On découvre qui porte ces idées</h2>
            <p>Les candidats n’apparaissent qu’à la fin, chacun avec ses sources, dans un ordre tiré au hasard.</p>
          </li>
        </ol>

        <ul class="table-locks">
          <li>
            <Icon name="lock" />
            <span>Rien ne quitte ce téléphone et rien n’est enregistré&nbsp;: tout s’efface à la fin, sauf l’image de la table si vous choisissez de la télécharger.</span>
          </li>
          <li>
            <Icon name="lock" />
            <span>Personne ne voit le bulletin d’un autre, pas même le propriétaire du téléphone.</span>
          </li>
          <li>
            <Icon name="lock" />
            <span>Aucun résultat par personne ni par candidat&nbsp;: seulement ce que la table pense des idées. Sans valeur statistique&nbsp;: c’est votre table, pas la France.</span>
          </li>
        </ul>

        <details class="table-more">
          <summary>
            <Icon name="chevron" class="disclosure" />
            Le secret, honnêtement
          </summary>
          <ul>
            {SECRET.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
        <details class="table-more">
          <summary>
            <Icon name="chevron" class="disclosure" />
            Comment la table compte
          </summary>
          <ol>
            {RULES.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </details>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Commencer">
        <div class="action-bar-inner is-single">
          <button type="button" class="btn-primary is-wide" onClick={onStart}>
            Préparer la table
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
