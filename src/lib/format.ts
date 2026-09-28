export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatEta([min, max]: [number, number]): string {
  return `${min}-${max} min`
}

export function formatCompactNumber(value: number): string {
  if (value < 1000) return String(value)
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
