// Unique element ids for components that render more than once on a page.
let count = 0;

export function uniqueId(prefix: string): string {
  count += 1;
  return `${prefix}-${count}`;
}
