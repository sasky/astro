import { expect, test } from "vitest";
import { headingFit } from "../../src/lib/fit";

const em = (title: string) => Number(headingFit(title).match(/^--em: ([\d.]+)$/)?.[1]);

test("headingFit sums the heading's real glyph widths", () => {
  // "#" 0.63, "m" 0.94, plus 2%.
  expect(em("#m")).toBeCloseTo((0.63 + 0.94) * 1.02, 3);
  expect(em("#mmmm")).toBeGreaterThan(em("#iiiiiiii"));
  expect(em("#silverstripe")).toBeLessThan(13 * 0.56);
});

test("headingFit treats an unknown character as the widest", () => {
  expect(em("#Ω")).toBe(em("#m"));
});
