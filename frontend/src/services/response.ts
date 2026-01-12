export const coerceArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  const candidates = ['data', 'content', 'items', 'results']
  for (const key of candidates) {
    const candidate = record[key]
    if (Array.isArray(candidate)) return candidate as T[]
  }
  return []
}
