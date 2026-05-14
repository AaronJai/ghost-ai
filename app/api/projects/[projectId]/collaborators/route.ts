import { Prisma } from "@/app/generated/prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/api-auth";
import { getClerkProfilesByEmail } from "@/lib/clerk-collaborator-profiles";
import {
  isValidCollaboratorEmailInput,
  normalizeCollaboratorEmail,
} from "@/lib/collaborator-email";
import { prismaDb } from "@/lib/prisma";
import {
  buildClerkEditorIdentity,
  getEditorProjectAccess,
} from "@/lib/project-access";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

interface PostBody {
  email?: unknown;
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  const { projectId } = await context.params;

  const projectExists = await prismaDb.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!projectExists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await currentUser();
  const identity = buildClerkEditorIdentity(userId, user);
  const access = await getEditorProjectAccess(projectId, identity);
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prismaDb.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, collaboratorEmail: true },
  });

  const profiles = await getClerkProfilesByEmail(
    rows.map((r) => r.collaboratorEmail),
  );

  const collaborators = rows.map((row) => {
    const key = normalizeCollaboratorEmail(row.collaboratorEmail);
    const profile = profiles.get(key);
    return {
      id: row.id,
      email: row.collaboratorEmail,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });

  return NextResponse.json({
    canManage: access.role === "owner",
    collaborators,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  const { projectId } = await context.params;

  const projectExists = await prismaDb.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!projectExists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await currentUser();
  const identity = buildClerkEditorIdentity(userId, user);
  const access = await getEditorProjectAccess(projectId, identity);
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (access.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: PostBody = {};
  try {
    const parsed = (await request.json()) as unknown;
    body = typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail = body.email;
  if (typeof rawEmail !== "string" || !isValidCollaboratorEmailInput(rawEmail)) {
    return NextResponse.json(
      { error: "email must be a valid email string" },
      { status: 400 },
    );
  }

  const normalized = normalizeCollaboratorEmail(rawEmail);

  if (
    identity.primaryEmail &&
    normalized === identity.primaryEmail
  ) {
    return NextResponse.json(
      { error: "You already own this project" },
      { status: 400 },
    );
  }

  const duplicate = await prismaDb.projectCollaborator.findFirst({
    where: {
      projectId,
      collaboratorEmail: { equals: normalized, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "This email is already a collaborator" },
      { status: 409 },
    );
  }

  const created = await prismaDb.projectCollaborator
    .create({
      data: {
        projectId,
        collaboratorEmail: normalized,
      },
      select: { id: true, collaboratorEmail: true },
    })
    .catch((e: unknown) => {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return null;
      }
      throw e;
    });

  if (!created) {
    return NextResponse.json(
      { error: "This email is already a collaborator" },
      { status: 409 },
    );
  }

  const profiles = await getClerkProfilesByEmail([created.collaboratorEmail]);
  const profile = profiles.get(
    normalizeCollaboratorEmail(created.collaboratorEmail),
  );

  return NextResponse.json({
    collaborator: {
      id: created.id,
      email: created.collaboratorEmail,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
    },
  });
}
