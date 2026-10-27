// Copy buttons on Code post blocks (src/components/code/CodeBlock.astro).
// Lines are joined with "\n" because the Shiki transformer removes the
// newline text nodes between them; line numbers are CSS, so never copied.
// Without the Clipboard API (or when it refuses), it falls back to
// execCommand("copy") with the exact text, and failing that selects the code
// so the reader can copy it themselves.

const buttons = document.querySelectorAll<HTMLButtonElement>("figure.code-block button.copy");
// The buttons render hidden: without this script there's nothing to press.
for (const button of buttons) button.hidden = false;

const timers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();

/** The old copy command, with the exact text set on its copy event. */
function legacyCopy(text: string): boolean {
  const write = (event: ClipboardEvent) => {
    event.clipboardData?.setData("text/plain", text);
    event.preventDefault();
  };
  document.addEventListener("copy", write);
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.removeEventListener("copy", write);
  }
}

function select(code: Element) {
  const range = document.createRange();
  range.selectNodeContents(code);
  const selection = getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

document.addEventListener("click", async (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>("figure.code-block button.copy");
  if (!button) return;
  const code = button.closest("figure")!.querySelector("pre code")!;
  const lines = code.querySelectorAll(".line");
  const label = button.querySelector("[aria-live]") ?? button;
  const text = [...lines].map((line) => line.textContent).join("\n");
  let result = "copied";
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!legacyCopy(text)) {
      select(code);
      result = "selected";
    }
  }
  label.textContent = result;
  clearTimeout(timers.get(button));
  timers.set(button, setTimeout(() => (label.textContent = "copy"), 2000));
});
