import type { ComponentChildren } from 'preact'
import { Icon } from './Icon'

/** Lien vers un site extérieur, ouvert dans un nouvel onglet, sans transmettre l'adresse d'origine.
 *  Le dernier mot reste soudé au pictogramme pour qu'il ne parte jamais seul à la ligne. */
export function ExternalLink({ href, children, class: c }: { href: string; children: ComponentChildren; class?: string }) {
  let head: ComponentChildren = children
  let tail: ComponentChildren = null
  if (typeof children === 'string') {
    const i = children.lastIndexOf(' ')
    head = i > 0 ? children.slice(0, i + 1) : ''
    tail = i > 0 ? children.slice(i + 1) : children
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
