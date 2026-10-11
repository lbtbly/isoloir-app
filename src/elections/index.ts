// Registre des élections : une entrée légère par élection, sans ses données. Le pack (questions, positions,
// candidats) se charge à la demande (load), dans un fichier à part : le code que tout visiteur télécharge
// à l'ouverture n'en contient aucun.
// Ajouter une élection : créer un dossier elections/<id>/ qui exporte un ElectionPack, l'ajouter ici et dans
// all.ts (tests et outils). Les tests d'intégrité s'y appliquent d'office.
// L'élection par défaut a le slug '' (adresses #/…) ; les autres, #/<slug>/…. Écrire « id » puis « slug » à la
// suite dans chaque entrée : vite.config.ts (préchargement) et tools/check-dist.mjs y lisent l'élection par défaut.
// La primaire « Choisir 2027 » n'est plus au registre depuis le 12 octobre 2026 : son pack (elections/choisir-2027)
// reste dans le dépôt comme référence, hors du site ; ses anciennes adresses sont corrigées (RETIRED_PREFIXES).

import type { ElectionRef } from '../core/routes'
import type { ElectionPack } from '../core/types'

export interface ElectionEntry extends ElectionRef {
  id: string
  /** Préfixe des adresses : '' pour l'élection par défaut (#/…), sinon #/<slug>/… */
  slug: string
  /** Autres préfixes acceptés, corrigés en slug dans l'adresse (#/<alias>/… → #/<slug>/…) */
  aliases?: readonly string[]
  /** Nom affiché hors de l'élection (archives, liens entre élections) */
  label: string
  /** Élection passée, gardée en archive */
  archived: boolean
  /** Ses candidats : pour mener un ancien lien #/candidat/<id> vers la bonne élection, sans la charger */
  candidateIds: readonly string[]
  /**
   * Ses candidats masqués (election.hidden de son pack, à recopier ici ; un test vérifie que les deux listes sont
   * les mêmes) : un ancien lien #/candidat/<id> vers l'un d'eux mène à la page des candidats, sans charger le pack
   */
  hiddenCandidateIds?: readonly string[]
  /** Fin du vote, ISO 8601 : jusque-là, l'élection est en cours */
  votingUntil?: string
  /** Charge le pack (un fichier à part du build) */
  load: () => Promise<ElectionPack>
}

export const ELECTIONS: readonly ElectionEntry[] = [
  {
    id: 'presidentielle-2027',
    slug: '',
    label: 'Présidentielle 2027',
    archived: false,
    candidateIds: ['arthaud', 'asselineau', 'attal', 'batho', 'becht', 'bertrand', 'bouamrane', 'cazeneuve', 'dupontaignan', 'glucksmann', 'kazib', 'labib', 'lalanne', 'lepen', 'lisnard', 'markovic', 'melenchon', 'philippe', 'philippot', 'retailleau', 'roussel', 'zemmour'],
    // Les quatre candidats de la primaire « Choisir 2027 » autres que son gagnant (presidentielle-2027/election.ts, hidden)
    hiddenCandidateIds: ['faure', 'guedj', 'maurel', 'royal'],
    votingUntil: '2027-05-02T20:00:00+02:00',
    load: () => import('./presidentielle-2027').then(m => m.presidentielle2027),
  },
  // Serveur de développement seulement (ni tests ni build : import.meta.env.DEV y vaut false, et le build
  // retire l'entrée et son fichier) : une élection factice de 20 candidats, pour la mise en page d'une élection
  // nombreuse, à l'adresse #/essai-20/
  ...(import.meta.env.DEV && import.meta.env.MODE !== 'test'
    ? [
        {
          id: 'essai-20',
          slug: 'essai-20',
          label: 'Essai, 20 candidats fictifs (développement)',
          archived: false,
          candidateIds: ['exemple', 'essai', 'fictive', 'maquette', 'brouillon', 'prototype', 'ebauche', 'gabarit', 'specimen', 'temoin', 'modele', 'echantillon', 'simulacre', 'canevas', 'patron', 'ersatz', 'factice', 'pastiche', 'esquisse', 'placebo'],
          load: () => import('../../tests/fixtures/many-candidates').then(m => m.manyCandidates),
        },
      ]
    : []),
]

/**
 * Préfixes d'adresse retirés du site : la primaire « Choisir 2027 » (son slug et son alias), retirée le 12 octobre
 * 2026, et l'ancienne page des élections passées (#/archives). Une adresse qui commence par l'un d'eux est corrigée
 * vers l'élection par défaut (core/routes.ts, resolvePlace). Un préfixe retiré ne peut plus servir de slug ni d'alias.
 */
export const RETIRED_PREFIXES: readonly string[] = ['choisir-2027', 'primaire', 'archives']

/** L'élection par défaut, celle des adresses sans préfixe */
export const defaultEntry: ElectionEntry = ELECTIONS.find(e => e.slug === '')!

/** Une élection par son identifiant */
export const entryById = (id: string): ElectionEntry | undefined => ELECTIONS.find(e => e.id === id)

const loaded = new Map<string, ElectionPack>()
const loading = new Map<string, Promise<ElectionPack>>()

/** Le pack d'une élection, s'il est déjà chargé */
export const loadedElection = (id: string): ElectionPack | null => loaded.get(id) ?? null

/**
 * Charge le pack d'une élection, une seule fois. Un échec (hors ligne avant que la copie hors ligne ne soit
 * installée, ancienne version en cache) n'est pas gardé : on peut réessayer.
 */
export function loadElection(entry: ElectionEntry): Promise<ElectionPack> {
  const ready = loaded.get(entry.id)
  if (ready) return Promise.resolve(ready)
  let p = loading.get(entry.id)
  if (!p) {
    p = entry.load().then(
      pack => {
        loaded.set(entry.id, pack)
        loading.delete(entry.id)
        return pack
      },
      e => {
        loading.delete(entry.id)
        throw e
      },
    )
    loading.set(entry.id, p)
  }
  return p
}
