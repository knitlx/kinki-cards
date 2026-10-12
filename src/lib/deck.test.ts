import { describe, it, expect } from "vitest";
import { shuffle, drawFromDeck, reshuffleDeck } from "./deck";

const seq = (nums: number[]) => {
  let i = 0;
  return () => nums[i++ % nums.length];
};

describe("shuffle", () => {
  it("returns a permutation of the same elements", () => {
    const out = shuffle([1, 2, 3, 4, 5], seq([0.9, 0.1, 0.9, 0.1]));
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it("does not mutate the input", () => {
    const input = [1, 2, 3];
    shuffle(input, seq([0]));
    expect(input).toEqual([1, 2, 3]);
  });
});

describe("drawFromDeck", () => {
  it("moves the first card from remaining to used", () => {
    const r = drawFromDeck(["a", "b", "c"], []);
    expect(r.cardId).toBe("a");
    expect(r.remaining).toEqual(["b", "c"]);
    expect(r.used).toEqual(["a"]);
  });
  it("returns null when empty", () => {
    const r = drawFromDeck([], ["a", "b"]);
    expect(r.cardId).toBeNull();
    expect(r.remaining).toEqual([]);
    expect(r.used).toEqual(["a", "b"]);
  });
  it("never repeats a card", () => {
    let remaining = ["a", "b", "c"];
    let used: string[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = drawFromDeck(remaining, used);
      remaining = r.remaining;
      used = r.used;
      seen.push(r.cardId!);
    }
    expect(new Set(seen).size).toBe(3);
    expect(drawFromDeck(remaining, used).cardId).toBeNull();
  });
});

describe("reshuffleDeck", () => {
  it("moves used back into remaining and empties used", () => {
    const r = reshuffleDeck(["a", "b", "c"], seq([0.5, 0.25, 0.75]));
    expect(r.remaining.sort()).toEqual(["a", "b", "c"]);
    expect(r.used).toEqual([]);
  });
});
