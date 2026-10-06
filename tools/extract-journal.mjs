// Extrait les résultats d'un journal de workflow vers research/<election>/*.json
// Usage : node tools/extract-journal.mjs <journal.jsonl> <outDir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [journal, outDir] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })
const labels = new Map()
for (const line of readFileSync(journal, 'utf8').split('\n').filter(Boolean)) {
  const e = JSON.parse(line)
  if (e.type === 'started') labels.set(e.key, e.label)
  if (e.type === 'result' && e.result) {
    const label = (labels.get(e.key) ?? e.agentId).replace(/[^a-z0-9+-]+/gi, '_')
    writeFileSync(join(outDir, `${label}.json`), JSON.stringify(e.result, null, 2))
    console.log('wrote', label)
  }
}
