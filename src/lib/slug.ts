// URL segments are lowercase kebab-case: a-z, 0-9 and single hyphens.
// scripts/check-links.mjs applies the same rule to the built site.
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isSlug = (s: string): boolean => SLUG.test(s);
