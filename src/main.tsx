import '@fontsource-variable/archivo/wdth.css'
import './styles/tokens.css'
import './styles/app.css'
import { render } from 'preact'
import { App, locate } from './app'
import { loadElection } from './elections'
import { watchInstall } from './ui/install/prompt'
import { screenLoader } from './ui/screens/load'

// L'élection de l'adresse (l'élection par défaut, sauf adresse d'une autre) est un fichier à part : on la
// charge avant le premier rendu, pour que la page s'affiche d'emblée telle quelle, sans écran de chargement ; de
// même pour l'écran de l'adresse quand il est un fichier à part (une notice, « Partager », la comparaison, le
// profil : ui/screens/load.ts), chargé en même temps. En cas d'échec (hors ligne avant que la copie hors ligne ne
// soit installée), App affiche de quoi réessayer ; sur un réseau très lent, la page s'affiche au bout de quelques
// secondes avec son état de chargement.
let started = false
const start = () => {
  if (started) return
  started = true
  render(<App />, document.getElementById('app')!)
}
const { election, route } = locate()
// L'échec de l'écran ne retient pas la page : elle s'affiche, et l'écran propose de réessayer
const screen = screenLoader(route)?.().catch(() => undefined)
Promise.all([loadElection(election), screen]).then(start, start)
setTimeout(start, 4000)

// L'annonce d'installation du navigateur, gardée pour le bouton « Installer Isoloir » (jamais d'invite de lui-même), et la
// demande de garder les réponses : dès l'ouverture, avant le premier rendu (ui/install/prompt.ts)
watchInstall()

// Copie hors ligne, pour que tout marche en mode avion (en production seulement : le serveur de dev se recharge à chaud)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // sans copie hors ligne, tout marche en ligne ; une page déjà chargée marche aussi hors ligne
  })
}

// Toutes les lettres de la police dès l'ouverture : la suite doit pouvoir s'afficher une fois le réseau coupé
document.fonts?.load('1em "Archivo Variable"', 'AÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸaàâæçéèêëîïôœùûüÿ’«»…–—€').catch(() => {})
