/**
 * 格式化比赛比分与点球大战
 */
export function formatMatchScore(
  homeScore: number | null | undefined,
  awayScore: number | null | undefined,
  homePenaltyScore?: number | null,
  awayPenaltyScore?: number | null,
): string {
  if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
    return 'VS';
  }

  const baseScore = `${homeScore} - ${awayScore}`;
  if (
    homePenaltyScore !== null &&
    homePenaltyScore !== undefined &&
    awayPenaltyScore !== null &&
    awayPenaltyScore !== undefined
  ) {
    return `${baseScore} (点球 ${homePenaltyScore}-${awayPenaltyScore})`;
  }

  return baseScore;
}

/**
 * 格式化球衣号码
 */
export function formatJerseyNumber(jerseyNumber: string | number | null | undefined): string {
  if (jerseyNumber === null || jerseyNumber === undefined || jerseyNumber === '') {
    return '-';
  }
  return `#${jerseyNumber}`;
}
