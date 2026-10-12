export type Rng = () => number;

export function shuffle<T>(input: readonly T[], rng: Rng = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawFromDeck(remaining: readonly string[], used: readonly string[]) {
  if (remaining.length === 0) return { cardId: null, remaining: [...remaining], used: [...used] };
  const [cardId, ...rest] = remaining;
  return { cardId, remaining: rest, used: [...used, cardId] };
}

export function reshuffleDeck(used: readonly string[], rng: Rng = Math.random) {
  return { remaining: shuffle(used, rng), used: [] as string[] };
}
