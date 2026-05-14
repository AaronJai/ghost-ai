import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/api-auth";
import { prismaDb } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

interface PatchProjectBody {
  name?: unknown;
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  const { projectId } = await context.params;

  const project = await prismaDb.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: PatchProjectBody = {};
  try {
    const parsed = (await request.json()) as unknown;
    body = typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawName = body.name;
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return NextResponse.json(
      { error: "name must be a non-empty string" },
      { status: 400 },
    );
  }

  const updated = await prismaDb.project.update({
    where: { id: projectId },
    data: { name: rawName.trim() },
    select: {
      id: true,
      ownerId: true,
      name: true,
      description: true,
      status: true,
      canvasJsonPath: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  const { projectId } = await context.params;

  const project = await prismaDb.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prismaDb.project.delete({
    where: { id: projectId },
  });

  return new NextResponse(null, { status: 204 });
}
