/** Shared formatting helpers — keep components free of one-off date/string logic. */

export function formatDate(input: string | number | Date | null | undefined, locale = "id-ID"): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatRelative(input: string | number | Date | null | undefined): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDate(d);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 96);
}

export function truncate(input: string, max = 160): string {
  if (!input) return "";
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + "…";
}

/** Safe HTTPS URL parser — returns null on http://, javascript:, data:, or malformed. */
export function safeHttpsUrl(input: string): URL | null {
  try {
    const u = new URL(input);
    if (u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}
