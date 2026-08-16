// ============================================================================
// relative-time.ts — utility for formatting dates as relative time strings.
// ----------------------------------------------------------------------------
// Produces strings like "just now", "5m ago", "3h ago", "2d ago", "Jul 27"
// depending on how recent the timestamp is. Falls back to a full date for
// older dates (more than a week old).
//
// Docs:
//   - Intl.RelativeTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
// ==========================================================================

// formatRelativeTime — converts an ISO date string to a human-friendly relative time.
// `now` is an optional param for testing; in production it defaults to the current time.
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  // diffMs — the difference in milliseconds between now and the date.
  const diffMs = now.getTime() - date.getTime();
  // Convert to seconds. Negative means the date is in the future.
  const diffSec = Math.round(diffMs / 1000);

  // Just now — less than 60 seconds ago.
  if (diffSec < 60) return "just now";

  // Minutes — less than 60 minutes ago.
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  // Hours — less than 24 hours ago.
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  // Days — less than 7 days ago.
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  // Weeks — less than 4 weeks ago.
  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;

  // Older than a month — fall back to a compact date format.
  // Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: diffMs < 0 ? undefined : (now.getFullYear() !== date.getFullYear() ? "numeric" : undefined),
  }).format(date);
}
