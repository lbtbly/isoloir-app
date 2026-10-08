// Les élections passées, gardées en archive (#/archives). La page n'existe que s'il y en a une : sans élection
// archivée, l'adresse mène à l'accueil (core/routes.ts). Chaque archive reste utilisable telle qu'elle était :
// questionnaire et dépouillement, avec ses données arrêtées.
import { ELECTIONS } from '../../elections'
import type { ElectionPack } from '../../core/types'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { link, linkIn } from '../nav'

export function Archives({ pack }: { pack: ElectionPack }) {
  const archived = ELECTIONS.filter(e => e.archived)
  return (
    <div class="screen screen-read">
      <FormHeader title="Archives" right={pack.election.shortName} />
      <main class="sheet prose has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Les élections passées
        </h1>
        <p class="lede">
          Elles restent consultables telles qu’elles étaient, avec leurs données arrêtées&nbsp;: le questionnaire et le
          dépouillement marchent toujours, et vos réponses à chacune restent sur cet appareil, à part.
        </p>
        <ul>
          {archived.map(e => (
            <li key={e.id}>
              <a href={linkIn(e.slug, '/')}>{e.label}</a>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Retour">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/')}>
            <Icon name="arrow-left" />
            Accueil
          </a>
        </div>
      </nav>
    </div>
  )
}
