import { clerkClient } from "@clerk/nextjs/server";

export interface CollaboratorClerkProfile {
  displayName: string | null;
  imageUrl: string | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function displayNameFromUser(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}): string | null {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full.length > 0) return full;
  if (user.username?.trim()) return user.username.trim();
  return null;
}

/**
 * Looks up Clerk users by email and returns display name + avatar when found.
 * Unknown emails are omitted from the map (callers fall back to email only).
 */
export async function getClerkProfilesByEmail(
  emails: string[],
): Promise<Map<string, CollaboratorClerkProfile>> {
  const uniqueArray = [...new Set(emails.map(normalizeEmail).filter(Boolean))];
  const uniqueSet = new Set(uniqueArray);
  const out = new Map<string, CollaboratorClerkProfile>();
  if (uniqueArray.length === 0) return out;

  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      emailAddress: uniqueArray,
      limit: Math.min(500, Math.max(uniqueArray.length, 10)),
    });

    for (const user of data) {
      const displayName = displayNameFromUser(user);
      const imageUrl = user.imageUrl ?? null;
      for (const addr of user.emailAddresses) {
        const key = normalizeEmail(addr.emailAddress);
        if (!uniqueSet.has(key)) continue;
        out.set(key, { displayName, imageUrl });
      }
    }
  } catch {
    // Clerk unavailable — return partial / empty; API still lists emails.
  }

  return out;
}
