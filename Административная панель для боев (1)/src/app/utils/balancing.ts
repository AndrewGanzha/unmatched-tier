import { Character, Player, CharacterTier } from '../types';

const TIER_RATINGS: Record<CharacterTier, number> = {
  S: 950,
  A: 850,
  B: 750,
  C: 650,
  D: 550,
};

export function getAvailableCharacters(
  player: Player,
  allCharacters: Character[],
  excludedCharacterIds: string[] = []
): Character[] {
  const playerRating = player.rating;

  const sortedCharacters = [...allCharacters]
    .filter(char => !excludedCharacterIds.includes(char.id))
    .sort((a, b) => b.rating - a.rating);

  if (playerRating >= 1100) {
    return sortedCharacters.filter(char => char.tier === 'C' || char.tier === 'D');
  } else if (playerRating >= 900) {
    return sortedCharacters.filter(char => char.tier === 'B' || char.tier === 'C' || char.tier === 'D');
  } else if (playerRating >= 700) {
    return sortedCharacters.filter(char => char.tier !== 'S');
  } else if (playerRating >= 500) {
    return sortedCharacters.filter(char => char.tier !== 'D');
  } else {
    return sortedCharacters.filter(char => char.tier === 'S' || char.tier === 'A' || char.tier === 'B');
  }
}

export function calculateBalancingExplanation(player: Player): string {
  const rating = player.rating;

  if (rating >= 1100) {
    return 'Высокий рейтинг — доступны только персонажи тиров C и D';
  } else if (rating >= 900) {
    return 'Средне-высокий рейтинг — доступны тиры B, C, D';
  } else if (rating >= 700) {
    return 'Средний рейтинг — все тиры кроме S';
  } else if (rating >= 500) {
    return 'Средне-низкий рейтинг — все тиры кроме D';
  } else {
    return 'Низкий рейтинг — доступны сильные персонажи тиров S, A, B';
  }
}

export function getTierColor(tier: CharacterTier): string {
  switch (tier) {
    case 'S': return 'rgb(255, 69, 58)';
    case 'A': return 'rgb(255, 159, 10)';
    case 'B': return 'rgb(255, 214, 10)';
    case 'C': return 'rgb(48, 209, 88)';
    case 'D': return 'rgb(100, 210, 255)';
  }
}

export function calculateRatingChange(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  return Math.round(kFactor * (1 - expectedScore));
}
