export function parseTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const formatted = date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return formatted;
}
