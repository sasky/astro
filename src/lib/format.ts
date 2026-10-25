// Date and number formatting. Frontmatter dates are date-only (UTC midnight),
// so every date part comes from UTC getters and never shifts with the build
// machine's time zone.

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// AP style: March to July in full, the rest abbreviated.
const MONTHS_AP = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

const pad = (n: number) => String(n).padStart(2, "0");

/** "17 May 2024" */
export function formatDateLong(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2024-04-01" */
export function formatDateISO(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** "11th September 2026" */
export function formatDateOn(d: Date): string {
  return `${ordinalSuffix(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "11th Sept. 2026", "20th June 2026" */
export function formatDateOnShort(d: Date): string {
  return `${ordinalSuffix(d.getUTCDate())} ${MONTHS_AP[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "May 2024" */
export function formatMonthYear(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const ROMAN: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** 4 → "IV", 2026 → "MMXXVI" */
export function toRoman(n: number): string {
  let out = "";
  for (const [value, numeral] of ROMAN) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

/** 1 → "1st", 11 → "11th", 22 → "22nd" */
export function ordinalSuffix(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
}

const ONES = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"];
const TEENS = [
  "Tenth",
  "Eleventh",
  "Twelfth",
  "Thirteenth",
  "Fourteenth",
  "Fifteenth",
  "Sixteenth",
  "Seventeenth",
  "Eighteenth",
  "Nineteenth",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** 4 → "Fourth", 21 → "Twenty-First". Covers 1–99. */
export function ordinalWord(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 99) throw new RangeError(`ordinalWord: ${n} is outside 1–99`);
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const tens = TENS[Math.floor(n / 10)];
  const ones = n % 10;
  return ones ? `${tens}-${ONES[ones]}` : `${tens.slice(0, -1)}ieth`;
}

/** "1 post", "4 meditations", "2 entries" */
export function plural(n: number, one: string, many: string = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
