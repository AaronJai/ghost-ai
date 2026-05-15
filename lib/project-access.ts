import type { User } from "@clerk/nextjs/server";

import { prismaDb } from "@/lib/prisma";

export interface ClerkEditorIdentity {
  userId: string;
  /** Lowercased trimmed primary email, or null if missing. */
  primaryEmail: string | null;
}

/** Primary email from Clerk `User` (trimmed), or null if absent. */
export function getPrimaryEmailFromClerkUser(user: User | null): string | null {
  const raw = user?.primaryEmailAddress?.emailAddress?.trim() ?? "";
  return raw.length > 0 ? raw : null;
}

export function buildClerkEditorIdentity(
  userId: string,
  user: User | null,
): ClerkEditorIdentity {
  const email = getPrimaryEmailFromClerkUser(user);
  return {
    userId,
    primaryEmail: email ? email.toLowerCase() : null,
  };
}

export type EditorProjectAccessResult =
  | { ok: false }
  | {
      ok: true;
      project: { id: string; name: string };
      role: "owner" | "collaborator";
    };

/**
 * Whether the user may open this project in the editor (owner or listed collaborator).
 * Missing projects and unauthorized users both return `{ ok: false }` (caller shows AccessDenied).
 */
export async function getEditorProjectAccess(
  projectId: string,
  identity: ClerkEditorIdentity,
): Promise<EditorProjectAccessResult> {
  if (!projectId.trim()) {
    return { ok: false };
  }

  const email = identity.primaryEmail;

  if (!email) {
    const row = await prismaDb.project.findFirst({
      where: { id: projectId, ownerId: identity.userId },
      select: { id: true, name: true },
    });
    if (!row) return { ok: false };
    return {
      ok: true,
      project: { id: row.id, name: row.name },
      role: "owner",
    };
  }

  const row = await prismaDb.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: identity.userId },
        {
          collaborators: {
            some: {
              collaboratorEmail: { equals: email, mode: "insensitive" },
            },
          },
        },
      ],
    },
    select: { id: true, name: true, ownerId: true },
  });

  if (!row) return { ok: false };
  const role =
    row.ownerId === identity.userId ? "owner" : "collaborator";
  return { ok: true, project: { id: row.id, name: row.name }, role };
}
