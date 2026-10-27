// Home tag selector (src/components/hp/TagSelector.astro). The chips render as
// links to the tag pages; with JS they become toggle buttons that show the
// picked tag's list (already in the HTML) and update the live summary.

for (const root of document.querySelectorAll<HTMLElement>("[data-tag-selector]")) {
  const summary = root.querySelector<HTMLElement>(".tg-summary");
  const lists = [...root.querySelectorAll<HTMLElement>("ul[data-tag-list]")];

  const chips = [...root.querySelectorAll<HTMLAnchorElement>("a.tg-chip[data-tag]")].map((link) => {
    const button = document.createElement("button");
    // Keep the classes, data and scoping attributes so the styles still apply.
    for (const { name, value } of link.attributes) {
      if (name !== "href" && name !== "data-selected") button.setAttribute(name, value);
    }
    button.type = "button";
    button.setAttribute("aria-pressed", String(link.hasAttribute("data-selected")));
    button.append(...link.childNodes);
    link.replaceWith(button);
    return button;
  });

  const select = (tag: string) => {
    for (const chip of chips) chip.setAttribute("aria-pressed", String(chip.dataset.tag === tag));
    for (const list of lists) {
      const match = list.dataset.tagList === tag;
      list.hidden = !match;
      if (match && summary) summary.textContent = list.dataset.summary ?? "";
    }
  };

  for (const chip of chips) chip.addEventListener("click", () => select(chip.dataset.tag!));
}
