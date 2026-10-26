// Sizing a one-word display heading to fit its column (ListingBand "section").

// Advance widths in em of Fraunces 800 at the heading's -0.045em tracking,
// measured at 24px: its optical-size axis makes letters widest at small sizes,
// so these are an upper bound at any size the heading is set.
const WIDTHS: Record<string, number> = {
  "#": 0.63, "-": 0.348,
  a: 0.539, b: 0.588, c: 0.496, d: 0.598, e: 0.502, f: 0.387, g: 0.557, h: 0.621, i: 0.293,
  j: 0.293, k: 0.598, l: 0.296, m: 0.94, n: 0.621, o: 0.564, p: 0.602, q: 0.588, r: 0.47,
  s: 0.47, t: 0.377, u: 0.61, v: 0.525, w: 0.82, x: 0.536, y: 0.545, z: 0.47,
  0: 0.667, 1: 0.449, 2: 0.605, 3: 0.556, 4: 0.631, 5: 0.573, 6: 0.611, 7: 0.513, 8: 0.621, 9: 0.612,
};
const WIDEST = Math.max(...Object.values(WIDTHS));

/** The heading's CSS variables: its width in em (plus 2%), so CSS can size it to fit. */
export function headingFit(title: string): string {
  const em = [...title].reduce((sum, char) => sum + (WIDTHS[char.toLowerCase()] ?? WIDEST), 0);
  return `--em: ${(em * 1.02).toFixed(3)}`;
}
