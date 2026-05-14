/**
 * Derives a URL-style slug from a project display name for live preview (no persistence).
 */
export function slugifyProjectName(name: string): string {
  const raw = name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return raw;
}
