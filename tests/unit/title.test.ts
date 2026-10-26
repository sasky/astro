import { expect, test } from "vitest";
import { pageTitle } from "../../src/lib/title";

test("pageTitle joins its parts and the site name", () => {
  expect(pageTitle("Life")).toBe("Life — sasky.nz");
  expect(pageTitle("Hide n Seek", "Code")).toBe("Hide n Seek — Code — sasky.nz");
  expect(pageTitle("#music")).toBe("#music — sasky.nz");
});
