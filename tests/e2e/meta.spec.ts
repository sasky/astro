// Titles, descriptions, canonicals and Open Graph tags for one page of each type (spec 5.16).
import { expect, test } from "@playwright/test";

const SITE = "https://sasky.nz";

const pages = [
  { path: "/", title: "sasky.nz — Home", description: "Personal and professional website of Cameron Grant", canonical: `${SITE}/` },
  { path: "/code", title: "Code — sasky.nz", description: "Code, hosting & small games" },
  { path: "/life", title: "Life — sasky.nz", description: "Music, family & other non-code things" },
  { path: "/meditations", title: "Pseudo Philosophy Meditations — sasky.nz", description: "Satire, humour & philosophy" },
  {
    path: "/code/hide-n-seek-game",
    title: "Hide n Seek — Code — sasky.nz",
    // metaDescription wins over description ("Building a game for my girls").
    description: "Building a simple Pico 8 Game for my family",
    type: "article",
  },
  {
    path: "/life/top-concertvids",
    title: "Concert youtube vids to temporarily restore one's faith in humanity — Life — sasky.nz",
    description: "Briefly glimpsing into the collective one-ness of our species, through the power of Youtube vids",
    type: "article",
  },
  {
    path: "/meditations/on-being-classy",
    title: "On Being Classy — Pseudo Philosophy Meditations — sasky.nz",
    description: "Top Ten Tips for Staying Classy",
    type: "article",
  },
  { path: "/tags/music", title: "#music — sasky.nz", description: "Every post tagged music on sasky.nz, from Life." },
];

for (const { path, title, description, canonical = `${SITE}${path}`, type = "website" } of pages) {
  test(`meta for ${path}`, async ({ page }) => {
    await page.goto(path);
    const head = page.locator("head");
    const content = (selector: string) => head.locator(selector).getAttribute("content");
    await expect(page).toHaveTitle(title);
    expect(await content('meta[name="description"]')).toBe(description);
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    expect(await content('meta[property="og:title"]')).toBe(title);
    expect(await content('meta[property="og:description"]')).toBe(description);
    expect(await content('meta[property="og:url"]')).toBe(canonical);
    expect(await content('meta[property="og:type"]')).toBe(type);
    expect(await content('meta[property="og:site_name"]')).toBe("sasky.nz");
    expect(await content('meta[name="twitter:card"]')).toBe("summary");
    await expect(head.locator('meta[name="robots"]')).toHaveCount(0);
  });
}

test("the 404 is noindex, with no canonical or og:url", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response!.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found — sasky.nz");
  const head = page.locator("head");
  await expect(head.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(head.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(head.locator('meta[property="og:url"]')).toHaveCount(0);
  await expect(head.locator('meta[name="description"]')).toHaveAttribute("content", /\S/);
});
