export function parseInputKey(caseName: string): string | null {
  const parts = caseName.split("/");
  return parts.length ? parts[parts.length - 1] : null;
}
