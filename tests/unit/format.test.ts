import { expect, test } from "vitest";
import {
  formatDateISO,
  formatDateLong,
  formatDateOn,
  formatDateOnShort,
  formatMonthYear,
  ordinalSuffix,
  ordinalWord,
  plural,
  toRoman,
} from "../../src/lib/format";

// Frontmatter dates are date-only; z.coerce.date() makes them UTC midnight.
const d = (iso: string) => new Date(iso);

test.each([
  [formatDateLong, "2024-05-17", "17 May 2024"],
  [formatDateISO, "2024-04-01", "2024-04-01"],
  [formatDateOn, "2026-09-11", "11th September 2026"],
  [formatDateOnShort, "2026-09-11", "11th Sept. 2026"],
  [formatDateOnShort, "2026-06-20", "20th June 2026"],
  [formatDateOnShort, "2026-01-02", "2nd Jan. 2026"],
  [formatDateOnShort, "2026-03-03", "3rd March 2026"],
  [formatDateOnShort, "2026-10-18", "18th Oct. 2026"],
  [formatMonthYear, "2024-05-17", "May 2024"],
])("%o(%s) is %s", (format, iso, expected) => {
  expect(format(d(iso))).toBe(expected);
});

test.each([
  [1, "I"],
  [4, "IV"],
  [9, "IX"],
  [14, "XIV"],
  [40, "XL"],
  [2026, "MMXXVI"],
])("toRoman(%i) is %s", (n, expected) => {
  expect(toRoman(n)).toBe(expected);
});

test.each([
  [1, "1st"],
  [2, "2nd"],
  [3, "3rd"],
  [4, "4th"],
  [11, "11th"],
  [12, "12th"],
  [13, "13th"],
  [21, "21st"],
  [22, "22nd"],
  [111, "111th"],
])("ordinalSuffix(%i) is %s", (n, expected) => {
  expect(ordinalSuffix(n)).toBe(expected);
});

test.each([
  [1, "First"],
  [2, "Second"],
  [3, "Third"],
  [4, "Fourth"],
  [12, "Twelfth"],
  [20, "Twentieth"],
  [21, "Twenty-First"],
  [99, "Ninety-Ninth"],
])("ordinalWord(%i) is %s", (n, expected) => {
  expect(ordinalWord(n)).toBe(expected);
});

test("ordinalWord only covers 1–99", () => {
  expect(() => ordinalWord(0)).toThrow(RangeError);
  expect(() => ordinalWord(100)).toThrow(RangeError);
});

test.each([
  [1, "post", undefined, "1 post"],
  [4, "meditation", undefined, "4 meditations"],
  [0, "post", undefined, "0 posts"],
  [2, "entry", "entries", "2 entries"],
])("plural(%i, %s, %s) is %s", (n, one, many, expected) => {
  expect(plural(n, one, many)).toBe(expected);
});
