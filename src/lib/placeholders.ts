/**
 * Seeded sample content is flagged `isPlaceholder: true`. It is hidden unless
 * SHOW_PLACEHOLDERS=true (default true in development, false in production).
 */
export function showPlaceholders(env: Record<string, string | undefined> = process.env): boolean {
  const flag = env.SHOW_PLACEHOLDERS
  if (flag === 'true') return true
  if (flag === 'false') return false
  return env.NODE_ENV !== 'production'
}

export function filterPlaceholders<T extends { isPlaceholder?: boolean | null }>(
  items: T[],
  show: boolean = showPlaceholders(),
): T[] {
  return show ? items : items.filter((item) => !item.isPlaceholder)
}
