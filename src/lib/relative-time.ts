export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: diffMs < 0 ? undefined : (now.getFullYear() !== date.getFullYear() ? "numeric" : undefined),
  }).format(date);
}
