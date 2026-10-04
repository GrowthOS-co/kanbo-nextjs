// Dates are plain YYYY-MM-DD strings and date-times "YYYY-MM-DD HH:MM:SS",
// both in UTC.

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// The same shape SQLite's CURRENT_TIMESTAMP writes.
export function toDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(dateTime: string): string {
  return new Date(`${dateTime.replace(" ", "T")}Z`).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
