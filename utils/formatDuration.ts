export function formatDuration(seconds: number, isMax = false): string {
  if (seconds === 0) return "0s";

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (isMax) {
    if (seconds % 86400 === 0) return `${d}d`;
    if (seconds % 3600 === 0) return `${h + d * 24}h`;
    if (seconds % 60 === 0) return `${m + h * 60 + d * 1440}m`;
  }

  const parts = [
    { value: d, label: "d" },
    { value: h, label: "h" },
    { value: m, label: "m" },
    { value: s, label: "s" },
  ];

  // Find first non-zero (leading units to skip)
  let firstNonZeroIndex = parts.findIndex((p) => p.value !== 0);
  if (firstNonZeroIndex === -1) return "0s"; // fallback

  // Find last non-zero (to trim trailing 0s)
  let lastNonZeroIndex = parts.length - 1;
  for (let i = parts.length - 1; i >= firstNonZeroIndex; i--) {
    if (parts[i].value !== 0) {
      lastNonZeroIndex = i;
      break;
    }
  }

  return parts
    .slice(firstNonZeroIndex, lastNonZeroIndex + 1)
    .map((p) => `${p.value}${p.label}`)
    .join(" ");
}
