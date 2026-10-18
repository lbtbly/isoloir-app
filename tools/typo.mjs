// Typographie française des textes générés : espaces fines insécables, apostrophes courbes, groupes de chiffres. La même
// règle que typo() de tools/build-pack.mjs (qu'on ne peut pas importer : c'est un script), copiée à l'identique, pour les
// leviers de « Faire les comptes » (tools/build-budget.mjs)
export function typo(t) {
  if (typeof t !== 'string') return t
  return t
    .replace(/'/g, '’')
    .replace(/\s+([?!;])/g, ' $1')
    .replace(/(\S)([?!;])(?=\s|$)/g, '$1 $2')
    .replace(/\s+:/g, ' :')
    .replace(/«\s*/g, '« ')
    .replace(/\s*»/g, ' »')
    .replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d)\s*(€|%|Md€|M€|milliards|millions)/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
