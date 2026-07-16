// Client-side savings series for the chart (FR-3.1). The backend computes the
// single current total from the same formula (utils/metrics.js); this mirrors
// it to plot the trend without needing a dedicated history endpoint, since the
// underlying relationship (dailyCost * elapsedDays) is deterministic.
export function buildSavingsSeries(profile, quitStart, streakDays, maxPoints = 60) {
  const dailyCost =
    (Number(profile.cigarettes_per_day) / Number(profile.cigarettes_per_pack || 20)) *
    Number(profile.cost_per_pack || 0);

  const totalDays = streakDays + 1;
  const pointCount = Math.min(totalDays, maxPoints);
  const startOffset = totalDays - pointCount;

  const start = new Date(quitStart);
  const series = [];
  for (let i = 0; i < pointCount; i += 1) {
    const dayIndex = startOffset + i;
    const date = new Date(start);
    date.setDate(date.getDate() + dayIndex);
    series.push({
      date: date.toISOString().slice(0, 10),
      saved: Math.round(dailyCost * dayIndex * 100) / 100,
    });
  }
  return series;
}
