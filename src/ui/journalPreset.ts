// Le choix « Pour vous » de la période du journal des données (core/journal.ts, LocalSince), passé en mémoire par la
// page qui y mène, jamais par l'adresse : l'avis du dépouillement ouvre le journal sur « après votre dernier passage »,
// l'accueil de retour sur « après vos réponses ». La page du journal le prend une fois, à l'ouverture, quelle que soit
// l'adresse (#/journal/8 aussi). À part, pour que ces deux pages n'emportent pas les calculs du journal dans le code de
// toutes les visites.

import type { LocalSince } from '../core/journal'

let preset: LocalSince | null = null

export function presetJournal(since: LocalSince | null): void {
  preset = since
}

export function takeJournalPreset(): LocalSince | null {
  const p = preset
  preset = null
  return p
}

/**
 * Le clic d'un lien vers le journal : le choix n'est posé que pour un clic simple, qui ouvre le journal dans cet onglet.
 * Un clic avec Cmd, Ctrl, Maj ou Alt l'ouvre ailleurs : posé ici, il réglerait plus tard un journal ouvert sans lui
 */
export const presetOnClick = (since: LocalSince) => (e: MouseEvent) => {
  if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) presetJournal(since)
}
