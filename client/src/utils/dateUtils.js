/**
 * dateUtils.js
 * Centralized utility for formatting ISO timestamps for the chat interface.
 */

// Format: 10:48 PM
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

// Format: 14 Jun
const dateCurrentYearFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
});

// Format: 14 Jun 2025
const datePreviousYearFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// Format: 14 Jun 2026
const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function isSameDay(iso1, iso2) {
  if (!iso1 || !iso2) return false;
  const d1 = new Date(iso1);
  const d2 = new Date(iso2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatMessageTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();

  const timeStr = timeFormatter.format(date);

  // If the message is from today, just return the time
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return timeStr;
  }

  // If the message is from this year, return Day Month • Time
  if (date.getFullYear() === now.getFullYear()) {
    return `${dateCurrentYearFormatter.format(date)} • ${timeStr}`;
  }

  // If the message is from a previous year, return Day Month Year • Time
  return `${datePreviousYearFormatter.format(date)} • ${timeStr}`;
}

export function formatDateSeparator(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();

  // Reset times to midnight for accurate day difference calculations
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowAtMidnight - dateAtMidnight;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  
  return fullDateFormatter.format(date);
}
