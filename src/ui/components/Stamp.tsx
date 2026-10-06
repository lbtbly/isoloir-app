// Tampon daté : la date à laquelle les positions ont été arrêtées.
export function Stamp({ date, label }: { date: string; label: string }) {
  const [y, m, d] = date.split('-')
  return (
    <span class="stamp">
      <span class="stamp-label">{label}</span>
      <span class="stamp-date">{`${d}.${m}.${y}`}</span>
    </span>
  )
}
