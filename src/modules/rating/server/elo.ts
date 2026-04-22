export function calculateExpectedScore(playerRating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

export function calculateEloDelta(playerRating: number, opponentRating: number, actualScore: 0 | 1, kFactor = 32) {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  return Math.round(kFactor * (actualScore - expectedScore));
}

