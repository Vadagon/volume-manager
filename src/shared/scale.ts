import { VOLUME_CEILING } from './protocol';

/**
 * The slider is an index into a hand-built ladder rather than a plain 0..600
 * range. Percent points are not perceptually equal: the difference between 3 %
 * and 4 % is obvious, the difference between 430 % and 440 % is not. So the
 * ladder is dense below 10 % and coarse above it, which keeps the whole usable
 * range reachable in ~70 thumb positions.
 */
export function buildLadder(ceiling: number = VOLUME_CEILING): number[] {
  const rungs: number[] = [];
  for (let v = 0; v < 10; v += 1) rungs.push(v);
  for (let v = 10; v <= ceiling; v += 10) rungs.push(v);
  return rungs;
}

/** Index of the rung closest to `volume`; ties resolve downwards. */
export function rungIndex(ladder: number[], volume: number): number {
  let best = 0;
  let bestGap = Infinity;
  for (let i = 0; i < ladder.length; i += 1) {
    const gap = Math.abs(ladder[i] - volume);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  return best;
}
