/** Normalize collaborator emails for storage and comparison (lowercase, trimmed). */
export function normalizeCollaboratorEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidCollaboratorEmailInput(email: string): boolean {
  const e = email.trim();
  if (e.length < 3 || e.length > 320) return false;
  return e.includes("@");
}
