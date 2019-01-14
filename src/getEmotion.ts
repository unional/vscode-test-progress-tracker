
export function getEmotion(pct: number, lastPct: number | undefined) {
  if (lastPct === undefined || Math.abs(pct - lastPct) < Number.EPSILON) {
    return Math.abs(pct - 1) < Number.EPSILON ?
      'great' :
      pct >= .98 ?
        'good' :
        pct >= 80 ?
          'meh' :
          'bad'
  }
  return pct > lastPct ? 'up' : 'down'
}
