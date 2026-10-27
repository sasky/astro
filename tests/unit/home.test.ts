import { expect, test } from "vitest";
import { about, hero } from "../../src/data/home";

test("about lists all 19 hobbies, typos fixed", () => {
  expect(about.hobbies).toHaveLength(19);
  expect(about.hobbies).toEqual(expect.arrayContaining(["sourdough", "DJing", "meditation"]));
  expect(about.hobbies).not.toContain("mediation");
});

test("four web-dev statements", () => {
  expect(about.workStatements).toHaveLength(4);
});

test("hero title splits around the highlight", () => {
  expect(hero.titleBefore + hero.titleHighlight + hero.titleAfter).toBe(
    "Hello, welcome to my little corner of the internet",
  );
});
