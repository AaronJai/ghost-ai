import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/api-auth";
import { prismaDb } from "@/lib/prisma";
import {
  buildClerkEditorIdentity,
  getEditorProjectAccess,
} from "@/lib/project-access";

interface RouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  const { projectId, collaboratorId } = await context.params;

  const user = await currentUser();
  const identity = buildClerkEditorIdentity(userId, user);
  const access = await getEditorProjectAccess(projectId, identity);
  if (!access.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (access.role !== "owner") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = await prismaDb.projectCollaborator.findFirst({
    where: { id: collaboratorId, projectId },
    select: { id: true },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prismaDb.projectCollaborator.delete({
    where: { id: collaboratorId },
  });

  return new NextResponse(null, { status: 204 });
}
