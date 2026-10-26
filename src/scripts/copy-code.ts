// Copy buttons on Code post blocks (src/components/code/CodeBlock.astro).
// Lines are joined with "\n" because the Shiki transformer removes the
// newline text nodes between them; line numbers are CSS, so never copied.

document.addEventListener("click", async (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>("figure.code-block button.copy");
  if (!button) return;
  const lines = button.closest("figure")!.querySelectorAll("code .line");
  const label = button.querySelector("[aria-live]") ?? button;
  await navigator.clipboard.writeText([...lines].map((line) => line.textContent).join("\n"));
  label.textContent = "copied";
  setTimeout(() => (label.textContent = "copy"), 2000);
});
