// Les candidats du journal des données (page #/journal) : pour chaque entrée « Positions » du journal d'une élection
// (src/elections/<id>/election.ts, changelog), les candidats dont les positions changent, leurs causes, fond ou forme,
// et leurs questions, tirés de l'historique des positions (research/<id>/positions-history.json) d'après les versions
// des données de l'entrée. Écrit src/elections/<id>/journal.ts, que le pack exporte (ElectionPack.journal). Aucun appel
// au réseau ni à une IA.
//
// Usage : node tools/build-journal.mjs <id>        (par exemple presidentielle-2027)
// Lancé aussi à la fin de tools/build-pack.mjs. À relancer après chaque nouvelle entrée du journal, une fois sa version
// des données inscrite (dataVersion, puis « node tools/positions-history.mjs stamp » si le BUILD l'a précédée) :
// tests/journal.test.ts vérifie que journal.ts redonne l'historique, et qu'aucune ligne de l'historique n'est sans entrée.
// Le dépôt public n'a pas research/ : journal.ts y est livré tel quel, et ces vérifications sont sautées.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { peopleFromHistory } from '../src/core/journal.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

/** Le contenu de journal.ts, d'après l'historique et le journal de l'élection */
export function journalSource(id, history, changelog) {
  const people = peopleFromHistory(history.entries, changelog)
  return (
    `// Fichier généré par tools/build-journal.mjs depuis research/${id}/positions-history.json : ne pas modifier à la main.\n` +
    `// Les candidats de chaque entrée « Positions » du journal des données (election.ts, changelog), par numéro d'entrée.\n` +
    `import type { JournalPeople } from '../../core/types'\n\n` +
    `export const journal: JournalPeople = ${JSON.stringify(people, null, 2)}\n`
  )
}

/** Écrit <srcDir>/journal.ts d'après <researchDir>/positions-history.json ; sans historique, rien (le fichier publié reste) */
export async function writeJournal({ id, researchDir, srcDir }) {
  const historyFile = join(researchDir, 'positions-history.json')
  if (!existsSync(historyFile) || !existsSync(join(srcDir, 'election.ts'))) return null
  const { election } = await import(pathToFileURL(join(srcDir, 'election.ts')).href)
  // Une élection sans entrées numérotées (la primaire, archive régénérée à l'identique) n'a pas la page
  if (!election.changelog.some(e => e.n != null)) return null
  const out = join(srcDir, 'journal.ts')
  const source = journalSource(id, JSON.parse(readFileSync(historyFile, 'utf8')), election.changelog)
  const before = existsSync(out) ? readFileSync(out, 'utf8') : null
  if (before !== source) writeFileSync(out, source)
  return { out, changed: before !== source }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const id = process.argv[2]
  if (!id) {
    console.error('Usage : node tools/build-journal.mjs <id>')
    process.exit(2)
  }
  const done = await writeJournal({ id, researchDir: join(ROOT, 'research', id), srcDir: join(ROOT, 'src', 'elections', id) })
  if (!done) {
    console.error(`research/${id}/positions-history.json introuvable, ou journal sans entrées numérotées`)
    process.exit(1)
  }
  console.log(`${done.out.replace(ROOT, '')} ${done.changed ? 'écrit' : 'inchangé'}`)
}
