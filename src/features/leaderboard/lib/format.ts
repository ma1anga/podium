export function formatNumber(value: number): string {
  return (Math.round(value * 10) / 10).toString()
}

export function ordinal(value: number): string {
  if (value % 100 >= 11 && value % 100 <= 13) {
    return `${value}th`
  }
  return `${value}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[value % 10] ?? 'th'}`
}

export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC' })
}
