export function parseInputKey(caseName: string): string | null {
  const parts = caseName.split("/");
  return parts.length ? parts[parts.length - 1] : null;
}

export function exportToJson<T>(data: T, docName: string) {
  const maybeKeyPoints = (data as { key_points?: unknown })?.key_points;
  if (!maybeKeyPoints) return;

  const fileData = JSON.stringify(maybeKeyPoints, null, 2);
  const blob = new Blob([fileData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const safeDocName = docName?.replace(/[<>:"/\\|?*]+/g, "_") || "ruleset";

  link.href = url;
  link.download = `${safeDocName}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
