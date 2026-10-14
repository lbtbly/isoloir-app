import { createContext, type ComponentChildren } from 'preact'
import { useContext } from 'preact/hooks'
import { Icon } from './Icon'

/**
 * Liens extérieurs coupés : en mode fermé (« À table »), rien ne doit mener ailleurs, pas même une source dans un
 * nouvel onglet (on pourrait y rouvrir Isoloir, sans verrou). La source reste écrite, en texte.
 */
export const LinksOff = createContext(false)

/** Lien vers un site extérieur, ouvert dans un nouvel onglet, sans transmettre l'adresse d'origine.
 *  Le dernier mot (d'une adresse, son dernier segment) reste soudé au pictogramme pour qu'il ne parte jamais seul à la ligne. */
export function ExternalLink({ href, children, class: c }: { href: string; children: ComponentChildren; class?: string }) {
  const off = useContext(LinksOff)
  if (off) return <span class={c}>{children}</span>
  let head: ComponentChildren = children
  let tail: ComponentChildren = null
  if (typeof children === 'string') {
    // Un seul mot (une adresse, « www.conseil-constitutionnel.fr ») : seul son dernier segment reste soudé, le
    // reste peut passer à la ligne sur un écran étroit au texte agrandi
    const i = children.lastIndexOf(' ')
    const j = i > 0 ? i : Math.max(children.lastIndexOf('.'), children.lastIndexOf('/'))
    head = j > 0 ? children.slice(0, j + 1) : ''
    tail = j > 0 ? children.slice(j + 1) : children
  }
  return (
    <a href={href} class={c} target="_blank" rel="noopener noreferrer">
      {head}
      <span class="nowrap">
        {tail}
        <Icon name="external" />
      </span>
      <span class="sr-only"> (nouvel onglet)</span>
    </a>
  )
}
