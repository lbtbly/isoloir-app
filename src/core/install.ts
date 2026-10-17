// Où Isoloir est ouvert : l'appareil, le navigateur et le mode installé, lus sur place (core/installed.ts), sans rien
// envoyer ni rien garder. La page « Installer l'application » (ui/screens/Install.tsx, chargée à la demande, avec ce
// fichier) en tire les gestes à montrer, et ce que l'application installée voit des réponses : les siennes seulement
// (iPhone, iPad, Safari du Mac), celles du navigateur qui l'a installée (Android, Chrome et Edge), ou on ne sait pas.
// detectDevice est une fonction pure, sur une sonde (Probe) : les tests lui passent des navigateurs imités.

import { appleApart, here, type Probe } from './installed'

/** Les appareils dont la page connaît les gestes ; « other » : appareil ou navigateur non reconnu */
export type DeviceKey =
  | 'ios26'
  | 'ios18'
  | 'iosOther'
  | 'andChrome'
  | 'andSamsung'
  | 'andFirefox'
  | 'deskChrome'
  | 'deskEdge'
  | 'macSafari'
  | 'winFirefox'
  | 'macFirefox'
  | 'inApp'
  | 'other'

export type Os = 'iphone' | 'ipad' | 'android' | 'mac' | 'windows' | 'linux' | 'chromeos' | 'autre'

/**
 * Ce que voit l'application installée : ses propres réponses, vide au départ (« separe ») ; celles du navigateur qui
 * l'a installée (« partage ») ; on ne sait pas (« inconnu » : Firefox sous Windows, navigateur non reconnu)
 */
export type AppStorage = 'separe' | 'partage' | 'inconnu'

export interface Device {
  key: DeviceKey
  os: Os
  /** Le navigateur, ou l'application qui ouvre le lien (« Instagram ») ; '' : non reconnu */
  browser: string
  /** La version de Safari (celle du système sur iPhone et iPad : Version/26 sous iOS 26) ; null hors de Safari */
  version: number | null
  installed: boolean
  storage: AppStorage
  /** Un ordinateur : la page se met sur deux colonnes et montre le QR code de son adresse */
  desktop: boolean
}

/** Les applications qui ouvrent les liens dans leur propre fenêtre (elles ne savent pas installer) */
const IN_APP: [RegExp, string][] = [
  [/\bInstagram\b/, 'Instagram'],
  [/\bFBAN\/|\bFBAV\/|\bFB_IAB\b|\bFBIOS\b/, 'Facebook'],
  [/\bmusical_ly\b|\bTikTok\b|\bBytedanceWebview\b/, 'TikTok'],
  [/\bSnapchat\b/, 'Snapchat'],
  [/\bLinkedInApp\b/, 'LinkedIn'],
  [/\bPinterest\b/, 'Pinterest'],
  [/\bGSA\//, 'Google'],
]

/** Les autres navigateurs d'iPhone et d'iPad (tous sur le moteur de Safari) */
const IOS_BROWSERS: [RegExp, string][] = [
  [/\bCriOS\//, 'Chrome'],
  [/\bEdgiOS\//, 'Edge'],
  [/\bFxiOS\//, 'Firefox'],
  [/\bOPT\/|\bOPiOS\//, 'Opera'],
  [/\bDuckDuckGo\/|\bDdg\//, 'DuckDuckGo'],
]

/** Des navigateurs qui s'annoncent comme Chrome mais n'en sont pas : leurs menus diffèrent */
const NOT_CHROME = /\b(?:Edg|EdgA|OPR|OPT|YaBrowser|UCBrowser|MiuiBrowser|HuaweiBrowser|HeyTapBrowser|DuckDuckGo|Vivaldi|SamsungBrowser)\//

const safariVersion = (ua: string) => {
  const m = /\bVersion\/(\d+)[\d.]*\b.*\bSafari\//.exec(ua)
  return m ? Number(m[1]) : null
}

export function detectDevice(p: Probe): Device {
  const ua = p.userAgent
  const installed = p.installed
  const make = (key: DeviceKey, os: Os, browser: string, storage: AppStorage, desktop: boolean, version: number | null = null): Device => ({
    key,
    os,
    browser,
    version,
    installed,
    storage,
    desktop,
  })
  const inApp = IN_APP.find(([re]) => re.test(ua))?.[1]
  const apple = appleApart(p)

  // iPhone et iPad (un iPad en mode ordinateur s'annonce comme un Mac, tactile) : l'application installée a toujours son
  // propre espace, quel que soit le navigateur qui l'a ajoutée. Le jeton « Version/NN » dit la version de Safari, donc
  // du système ; jamais « iPhone OS NN », figé à 18_6 par Safari 26
  if (apple === 'iphone' || apple === 'ipad') {
    if (inApp) return make('inApp', apple, inApp, 'inconnu', false)
    const other = IOS_BROWSERS.find(([re]) => re.test(ua))?.[1]
    if (other) return make('iosOther', apple, other, 'separe', false)
    const version = safariVersion(ua)
    if (version !== null) return make(version >= 26 ? 'ios26' : 'ios18', apple, 'Safari', 'separe', false, version)
    // Sans « Safari/ » : l'application installée elle-même, ou la fenêtre d'une autre application
    return installed ? make('iosOther', apple, '', 'separe', false) : make('inApp', apple, '', 'inconnu', false)
  }

  if (/\bAndroid\b/.test(ua)) {
    if (inApp) return make('inApp', 'android', inApp, 'inconnu', false)
    // La fenêtre intégrée d'une application (WebView) : « ; wv) »
    if (/; wv\)/.test(ua)) return make('inApp', 'android', '', 'inconnu', false)
    if (/\bSamsungBrowser\//.test(ua)) return make('andSamsung', 'android', 'Samsung Internet', 'partage', false)
    if (/\bFirefox\//.test(ua)) return make('andFirefox', 'android', 'Firefox', 'partage', false)
    if (/\bChrome\/\d/.test(ua) && !NOT_CHROME.test(ua) && !p.brave) return make('andChrome', 'android', 'Chrome', 'partage', false)
    return make('other', 'android', '', 'inconnu', false)
  }

  const os: Os = /\bWindows NT\b/.test(ua)
    ? 'windows'
    : /\bCrOS\b/.test(ua)
      ? 'chromeos'
      : /\bMacintosh\b|\bMac OS X\b/.test(ua)
        ? 'mac'
        : /\bLinux\b|\bX11\b/.test(ua)
          ? 'linux'
          : 'autre'
  if (os === 'autre') return make('other', os, '', 'inconnu', false)
  if (inApp) return make('inApp', os, inApp, 'inconnu', true)
  if (/\bEdg\//.test(ua)) return make('deskEdge', os, 'Edge', 'partage', true)
  if (/\bFirefox\//.test(ua)) {
    if (os === 'windows') return make('winFirefox', os, 'Firefox', 'inconnu', true)
    return os === 'chromeos' ? make('other', os, 'Firefox', 'inconnu', true) : make('macFirefox', os, 'Firefox', 'inconnu', true)
  }
  if (/\bChrome\/\d/.test(ua)) return !NOT_CHROME.test(ua) && !p.brave ? make('deskChrome', os, 'Chrome', 'partage', true) : make('other', os, '', 'inconnu', true)
  // Safari du Mac : dans le navigateur, le jeton « Version/NN » ; installé (« Ajouter au Dock »), le même moteur
  const version = safariVersion(ua)
  if (apple === 'mac' && (version !== null || installed)) return make('macSafari', os, 'Safari', 'separe', true, version)
  return make('other', os, '', 'inconnu', true)
}

let seen: Device | null = null

/** L'appareil de cette visite (lu une fois : ni l'appareil ni le mode d'ouverture ne changent en cours de visite) */
export function thisDevice(): Device {
  return (seen ??= detectDevice(here()))
}
