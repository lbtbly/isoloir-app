// Pied de page commun à tous les écrans : la mention d'indépendance et d'usage de l'IA, puis les liens vers les notices
// (méthode, confidentialité, mentions légales). Il suit le contenu de la feuille, hors du <main> : c'est le
// pied de la page (repère « contentinfo »), au-dessus de la place réservée à la barre d'actions fixe.
import type { ComponentChildren } from 'preact'
import { AI_METHOD_HREF } from './AiLabel'
import '../../styles/footer.css'

/** Les notices, dans l'ordre de lecture : comment l'outil est fait, ce qu'il garde, qui le publie */
const LINKS = [
  { href: '#/methode', label: 'Méthode et sources', page: /^#\/methode(\/|$)/ },
  { href: '#/confidentialite', label: 'Confidentialité', page: /^#\/confidentialite\/?$/ },
  { href: '#/mentions-legales', label: 'Mentions légales', page: /^#\/mentions-legales\/?$/ },
]

interface Props {
  /** Précisions propres à un écran, imprimées sous la mention d'indépendance (l'accueil : les dates du vote) */
  children?: ComponentChildren
}

export function SiteFooter({ children }: Props) {
  const hash = typeof location === 'undefined' ? '' : location.hash
  return (
    <footer class="site-foot">
      <div class="site-foot-inner">
        <div class="site-foot-text">
          <p>
            Outil indépendant, édité par un citoyen, sans lien avec les organisateurs de la primaire ni avec les
            candidats. Ses textes sont rédigés par une IA à partir des sources citées et vérifiés automatiquement&nbsp;;
            ils ne sont pas relus un par un par une personne (<a href={AI_METHOD_HREF}>usage de l’IA</a>). Le résultat
            est indicatif&nbsp;: ce n’est pas une consigne de vote.
          </p>
          {children}
        </div>
        <ul class="site-foot-links">
          {LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} aria-current={link.page.test(hash) ? 'page' : undefined}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
