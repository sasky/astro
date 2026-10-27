// Page titles (spec 5.16): the page, then its section if any, then the site.
import { SITE } from "../data/site";

export function pageTitle(...parts: string[]): string {
  return [...parts, SITE.name].join(" — ");
}
