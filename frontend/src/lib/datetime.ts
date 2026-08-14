/** Date and time helpers, all rendered in campus-local time. */
import { format, formatDistanceToNowStrict, isToday, isTomorrow } from "date-fns";

/**
 * Campus time zone. The API stores and transmits UTC; every human-facing
 * string is converted here so a 9pm closing time never renders as 3:30pm.
 */
export const CAMPUS_TIME_ZONE = "Asia/Kolkata";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "h:mm a") : "-";
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy") : "-";
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "-";
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  return format(date, "d MMM, h:mm a");
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "-";
  const seconds = Math.abs(Date.now() - date.getTime()) / 1000;
  // "0 seconds ago" reads badly; anything inside a minute is just "just now".
  if (seconds < 60) return "just now";
  return `${formatDistanceToNowStrict(date)} ago`;
}

/** ISO string for a datetime-local input value, or null when empty. */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Value for a datetime-local input from an ISO string. */
export function isoToLocalInput(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
