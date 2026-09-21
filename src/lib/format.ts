export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatEta([min, max]: [number, number]): string {
  return `${min}-${max} min`
}
