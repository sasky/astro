// Renders a design board (design-handoff/design/*.dc.html) without its
// missing support.js: rebuilds the board's values from its inline
// renderVals() and the data-props defaults, expands the sc-for/sc-if
// templates, and fills every {{path}} in text, styles and attributes.
import type { Page } from "@playwright/test";

export async function fillBoard(page: Page) {
  await page.evaluate(() => {
    const script = document.querySelector<HTMLScriptElement>("script[data-dc-script]");
    if (!script) return;
    const props = JSON.parse(script.dataset.props ?? "{}");
    const defaults = Object.fromEntries(
      Object.entries(props)
        .filter(([key]) => !key.startsWith("$"))
        .map(([key, value]) => [key, (value as { default: unknown }).default]),
    );
    class DCLogic {
      props = defaults;
      state = {};
      setState() {}
    }
    const Component = new Function("DCLogic", `${script.textContent}; return Component;`)(DCLogic);
    const values: Record<string, unknown> = new Component().renderVals();

    const resolve = (path: string, scope: Record<string, unknown>) =>
      path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], scope);
    const fill = (text: string, scope: Record<string, unknown>) =>
      text.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
        const value = resolve(path, scope);
        return typeof value === "function" || value === undefined ? "" : String(value);
      });

    const render = (node: Node, scope: Record<string, unknown>) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = fill(node.textContent ?? "", scope);
        return;
      }
      if (!(node instanceof Element)) return;
      const tag = node.tagName.toLowerCase();
      const path = (attribute: string) => node.getAttribute(attribute)?.match(/\{\{([\w.]+)\}\}/)?.[1] ?? "";
      if (tag === "sc-for") {
        const items = (resolve(path("list"), scope) as unknown[]) ?? [];
        const name = node.getAttribute("as")!;
        const fragment = document.createDocumentFragment();
        for (const item of items) {
          for (const child of [...node.childNodes]) {
            const copy = child.cloneNode(true);
            fragment.append(copy);
            render(copy, { ...scope, [name]: item });
          }
        }
        node.replaceWith(fragment);
        return;
      }
      if (tag === "sc-if") {
        if (resolve(path("value"), scope)) {
          const children = [...node.childNodes];
          node.replaceWith(...children);
          for (const child of children) render(child, scope);
        } else {
          node.remove();
        }
        return;
      }
      for (const attribute of [...node.attributes]) {
        if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
        else if (attribute.value.includes("{{")) attribute.value = fill(attribute.value, scope);
      }
      for (const child of [...node.childNodes]) render(child, scope);
    };

    render(document.body, values);
    // The board's own wrappers are layout-neutral in the design tool.
    const style = document.createElement("style");
    style.textContent = "x-dc, helmet { display: contents; }";
    document.head.append(style);
  });
}
