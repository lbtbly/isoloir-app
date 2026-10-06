// Pièces communes aux deux notices (mentions légales, confidentialité) : informations à compléter,
// lien de contact et sommaire de la page.
import type { ComponentChildren } from 'preact'
import { CONTACT_EMAIL, contactHref, isPlaceholder } from '../../core/legal'
import '../../styles/legal.css'

/** Une information de src/core/legal.ts : telle quelle, ou encadrée de tirets tant qu'elle reste à compléter */
export function Fill({ value }: { value: string }) {
  return isPlaceholder(value) ? <span class="to-fill">{value.trim() || '[à compléter]'}</span> : <>{value}</>
}

/** L'adresse de contact : un lien mailto: une fois renseignée, du texte encadré tant qu'elle est à compléter */
export function ContactLink({ subject }: { subject?: string }) {
  const href = contactHref(subject)
  return href ? (
    <a href={href} class="contact-link">
      {CONTACT_EMAIL}
    </a>
  ) : (
    <Fill value={CONTACT_EMAIL} />
  )
}

export interface TocItem {
  id: string
  label: string
}

/** Va à une rubrique sans toucher au routage par « #/ » : défile jusqu'au titre et lui donne le focus */
export function goToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  target.focus({ preventScroll: true })
  target.scrollIntoView({ block: 'start' })
}

/** Lien vers une rubrique de la page */
export function SectionLink({ id, children }: { id: string; children: ComponentChildren }) {
  return (
    <a
      href={`#${id}`}
      onClick={e => {
        e.preventDefault()
        goToSection(id)
      }}
    >
      {children}
    </a>
  )
}

/**
 * Sommaire des rubriques numérotées. Sur téléphone, une liste qui passe à la ligne sous l'introduction ;
 * à partir de 64rem, il se range dans la colonne de marge et y reste à portée de vue.
 */
export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav class="legal-toc" aria-labelledby="legal-toc-title">
      <p class="legal-toc-title" id="legal-toc-title">
        Sur cette page
      </p>
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <SectionLink id={item.id}>
              <span class="fig-n">{i + 1}</span> <span class="legal-toc-label">{item.label}</span>
            </SectionLink>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Titre numéroté d'une rubrique, cible du sommaire */
export function SectionTitle({ id, n, children }: { id: string; n: number; children: ComponentChildren }) {
  return (
    <h2 id={id} tabIndex={-1}>
      <span class="fig-n">{n}</span> {children}
    </h2>
  )
}
