import '@fontsource-variable/archivo/wdth.css'
import './styles/tokens.css'
import './styles/app.css'
import { render } from 'preact'
import { App } from './app'

render(<App />, document.getElementById('app')!)

// Copie hors ligne, pour que tout marche en mode avion (en production seulement : le serveur de dev se recharge à chaud)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // sans copie hors ligne, tout marche en ligne ; une page déjà chargée marche aussi hors ligne
  })
}

// Toutes les lettres de la police dès l'ouverture : la suite doit pouvoir s'afficher une fois le réseau coupé
document.fonts?.load('1em "Archivo Variable"', 'AÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸaàâæçéèêëîïôœùûüÿ’«»…–—€').catch(() => {})
