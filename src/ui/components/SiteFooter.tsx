// Pied de page commun à tous les écrans : la mention d'indépendance et d'usage de l'IA, puis les liens vers les notices
// (méthode, confidentialité, mentions légales). Il suit le contenu de la feuille, hors du <main> : c'est le
// pied de la page (repère « contentinfo »), au-dessus de la place réservée à la barre d'actions fixe.
// La mention d'indépendance est celle de l'élection affichée (copy.independence.footer), reçue du cadre de
// l'élection (CurrentElection) : chaque écran, la feuille de pointage comprise, l'affiche sans rien passer.
import type { ComponentChildren } from 'preact'
import { currentPath, link, linkIn } from '../nav'
import { AI_METHOD_PATH } from './AiLabel'
import { useCurrentElection } from './CurrentElection'
import '../../styles/footer.css'

/**
 * Les notices, dans l'ordre de lecture : comment l'outil est fait, ce qu'il garde, qui le publie. Chemins dans
 * l'élection affichée ; « page » se lit sur le chemin sans préfixe d'élection.
 */
const LINKS = [
  { path: '/methode', label: 'Méthode et sources', page: /^\/methode(\/|$)/ },
  { path: '/confidentialite', label: 'Confidentialité', page: /^\/confidentialite\/?$/ },
  { path: '/mentions-legales', label: 'Mentions légales', page: /^\/mentions-legales\/?$/ },
]

interface Props {
  /** Précisions propres à un écran, imprimées sous la mention d'indépendance (l'accueil : les dates du vote) */
  children?: ComponentChildren
}

/** Hors d'une élection (aucun écran ne l'affiche ainsi aujourd'hui) : la mention sans organisateurs */
const INDEPENDENCE = 'sans lien avec les partis ni avec les candidats'

export function SiteFooter({ children }: Props) {
  const path = currentPath()
  const current = useCurrentElection()
  const independence = current?.election.copy.independence.footer ?? INDEPENDENCE
  return (
    <footer class="site-foot">
      <div class="site-foot-inner">
        <div class="site-foot-text">
          <p>
            {/* Une seule chaîne jusqu'au lien : un seul nœud de texte, mis en page comme avant (même crénage) */}
            {`Outil indépendant, édité par un citoyen, ${independence}. Ses textes sont rédigés par une IA à partir des sources citées et vérifiés automatiquement\u00a0; ils ne sont pas relus un par un par une personne (`}
            <a href={link(AI_METHOD_PATH)}>usage de l’IA</a>). Le résultat est indicatif&nbsp;: ce n’est pas une
            consigne de vote.
          </p>
          {children}
        </div>
        <ul class="site-foot-links">
          {LINKS.map(item => (
            <li key={item.path}>
              <a href={link(item.path)} aria-current={item.page.test(path) ? 'page' : undefined}>
                {item.label}
              </a>
            </li>
          ))}
          {/* Les élections passées, s'il y en a : une seule page, dans l'élection du site */}
          {current?.hasArchives ? (
            <li>
              <a href={linkIn('', '/archives')} aria-current={/^\/archives\/?$/.test(path) ? 'page' : undefined}>
                Élections passées
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </footer>
  )
}
