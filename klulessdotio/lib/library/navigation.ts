export function stepIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return 0
  return (((index + delta) % length) + length) % length
}

export function positionLabel(index: number, length: number): string {
  return `${index + 1} of ${length}`
}
