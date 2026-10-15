// Pied de page commun à tous les écrans : la mention d'indépendance et d'usage de l'IA, puis les liens vers les notices
// (méthode, confidentialité, mentions légales). Il suit le contenu de la feuille, hors du <main> : c'est le
// pied de la page (repère « contentinfo »), au-dessus de la place réservée à la barre d'actions fixe.
// La mention d'indépendance est celle de l'élection affichée (copy.independence.footer), reçue du cadre de
// l'élection (CurrentElection) : chaque écran, la feuille de pointage comprise, l'affiche sans rien passer.
// L'accueil a son propre pied, pleine largeur sur fond d'encre (HomeFooter, plus bas), qui reprend la même mention et
// les mêmes liens au même niveau d'information.
import type { ComponentChildren } from 'preact'
import { currentPath, link } from '../nav'
import { AI_METHOD_PATH } from './AiLabel'
import { useCurrentElection } from './CurrentElection'
import { Icon } from './Icon'
import { Logo } from './Logo'
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

/** Hors d'une élection (aucun écran ne l'affiche ainsi aujourd'hui) : la mention sans organisateurs */
const INDEPENDENCE = 'sans lien avec les partis ni avec les candidats'

/** La mention d'indépendance et d'usage de l'IA */
function Independence() {
  const current = useCurrentElection()
  const independence = current?.election.copy.independence.footer ?? INDEPENDENCE
  return (
    <p>
      {/* Une seule chaîne jusqu'au lien : un seul nœud de texte, mis en page comme avant (même crénage) */}
      {`Outil indépendant, édité par un citoyen, ${independence}. Ses textes sont rédigés par une IA à partir des sources citées et vérifiés automatiquement\u00a0; ils ne sont pas relus un par un par une personne (`}
      <a href={link(AI_METHOD_PATH)}>usage de l’IA</a>). Le résultat est indicatif&nbsp;: ce n’est pas une consigne
      de vote.
    </p>
  )
}

/** Les liens vers les notices ; celle où l'on est est marquée */
function Notices() {
  const path = currentPath()
  return (
    <ul class="site-foot-links">
      {LINKS.map(item => (
        <li key={item.path}>
          <a href={link(item.path)} aria-current={item.page.test(path) ? 'page' : undefined}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function SiteFooter() {
  return (
    <footer class="site-foot">
      <div class="site-foot-inner">
        <div class="site-foot-text">
          <Independence />
        </div>
        <Notices />
      </div>
    </footer>
  )
}

interface HomeProps {
  /** Les actions sur la feuille, une par <li> (relire, reprendre depuis un fichier, tout effacer…) : une action de
   *  plus prend sa ligne dans la liste, sans rien changer au pied */
  actions: ComponentChildren
  /** Ce que ces actions ont à dire : l'avis d'import en attente, une erreur, un stockage refusé */
  notes?: ComponentChildren
  /** Ce que dit la colonne « Votre feuille » sous son titre ; rien si le navigateur n'enregistre pas (l'avis le dit) */
  lede?: string
  /** L'élection a une table : la colonne « À table » */
  table: boolean
  /** Les dates du vote, en tête du pied, à côté du logo */
  children?: ComponentChildren
}

/**
 * Le pied de l'accueil (demande du propriétaire du 2026-10-15) : un vrai pied de page, pleine largeur, sur fond
 * d'encre d'imprimerie, la feuille en négatif. Il remplace la rangée d'actions qui flottait sous les candidats et le
 * pied commun. En tête, le logo et les dates du vote ; dessous, des colonnes titrées : « Votre feuille » (les actions
 * sur ses réponses), « À table » (s'il y en a une), « Qui fait Isoloir » (la mention et les notices du pied commun).
 */
export function HomeFooter({ actions, notes, lede, table, children }: HomeProps) {
  // La rangée du haut suit la grille des colonnes : les dates du vote s'alignent sur la dernière
  return (
    <footer class="site-foot home-foot">
      <div class={table ? 'home-foot-inner has-table' : 'home-foot-inner'}>
        <div class="home-foot-top">
          <Logo layout="horizontal" />
          {children ? <div class="home-foot-vote">{children}</div> : null}
        </div>
        <div class="home-foot-cols">
          <section class="home-foot-col" aria-labelledby="foot-sheet">
            <h2 id="foot-sheet" class="home-foot-title">
              Votre feuille
            </h2>
            {lede ? <p class="home-foot-text">{lede}</p> : null}
            <ul class="home-foot-actions">{actions}</ul>
            {notes}
          </section>
          {table ? (
            <section class="home-foot-col" aria-labelledby="foot-table">
              <h2 id="foot-table" class="home-foot-title">
                À table
              </h2>
              <p class="home-foot-text">Voter à plusieurs, en secret, sur un seul téléphone.</p>
              <ul class="home-foot-actions">
                <li>
                  <a class="btn-text" href={link('/a-table')}>
                    <Icon name="table" />
                    À plusieurs, autour d’une table
                  </a>
                </li>
              </ul>
            </section>
          ) : null}
          <section class="home-foot-col is-about" aria-labelledby="foot-about">
            <h2 id="foot-about" class="home-foot-title">
              Qui fait Isoloir
            </h2>
            <div class="site-foot-text">
              <Independence />
            </div>
            <Notices />
          </section>
        </div>
      </div>
    </footer>
  )
}
