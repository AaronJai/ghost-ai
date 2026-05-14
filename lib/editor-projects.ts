import { prismaDb } from "@/lib/prisma";

export type ProjectMembership = "owner" | "collaborator";

/** Sidebar row: `slug` is the Liveblocks room id and matches `id`. */
export interface EditorSidebarProject {
  id: string;
  name: string;
  slug: string;
  membership: ProjectMembership;
}

export interface GetEditorProjectsParams {
  userId: string;
  email: string | null;
}

export async function getEditorProjectsForUser(
  params: GetEditorProjectsParams,
): Promise<{ owned: EditorSidebarProject[]; shared: EditorSidebarProject[] }> {
  const ownedRows = await prismaDb.project.findMany({
    where: { ownerId: params.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  const owned: EditorSidebarProject[] = ownedRows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    membership: "owner",
  }));

  const normalizedEmail = params.email?.trim().toLowerCase() ?? "";
  if (!normalizedEmail) {
    return { owned, shared: [] };
  }

  const sharedRows = await prismaDb.project.findMany({
    where: {
      ownerId: { not: params.userId },
      collaborators: {
        some: {
          collaboratorEmail: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  });

  const shared: EditorSidebarProject[] = sharedRows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    membership: "collaborator",
  }));

  return { owned, shared };
}
