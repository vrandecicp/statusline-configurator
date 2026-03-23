export const DEFAULT_ENABLED_IDS: string[] = ['model_display_name']

export function toggle(prev: string[], id: string): string[] {
  if (prev.includes(id)) {
    return prev.filter(x => x !== id)
  }
  return [...prev, id]
}

export function moveUp(prev: string[], id: string): string[] {
  const idx = prev.indexOf(id)
  if (idx <= 0) return prev
  const next = [...prev]
  ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
  return next
}

export function moveDown(prev: string[], id: string): string[] {
  const idx = prev.indexOf(id)
  if (idx < 0 || idx >= prev.length - 1) return prev
  const next = [...prev]
  ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
  return next
}
