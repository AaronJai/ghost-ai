import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/api-auth";
import { prismaDb } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

/** Optional client-generated id; must stay aligned with Liveblocks room id. */
const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidOptionalProjectId(value: string): boolean {
  return value.length >= 3 && value.length <= 128 && PROJECT_ID_PATTERN.test(value);
}

interface CreateProjectBody {
  name?: unknown;
  description?: unknown;
  id?: unknown;
}

export async function GET() {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  const projects = await prismaDb.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { userId } = authResult;

  let body: CreateProjectBody = {};
  try {
    const parsed = (await request.json()) as unknown;
    body = typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawName = body.name;
  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim()
      : DEFAULT_PROJECT_NAME;

  const rawDescription = body.description;
  const description =
    typeof rawDescription === "string" && rawDescription.trim().length > 0
      ? rawDescription.trim()
      : undefined;

  const rawId = body.id;
  let explicitId: string | undefined;
  if (rawId !== undefined) {
    if (typeof rawId !== "string" || !isValidOptionalProjectId(rawId.trim())) {
      return NextResponse.json(
        {
          error:
            "id must be a lowercase slug of letters, numbers, and hyphens (3–128 chars)",
        },
        { status: 400 },
      );
    }
    explicitId = rawId.trim();
    const taken = await prismaDb.project.findUnique({
      where: { id: explicitId },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ error: "id already in use" }, { status: 409 });
    }
  }

  const project = await prismaDb.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        ...(explicitId ? { id: explicitId } : {}),
        ownerId: userId,
        name,
        description,
        canvasJsonPath: "__pending__",
      },
    });
    return tx.project.update({
      where: { id: created.id },
      data: { canvasJsonPath: `canvas/${created.id}.json` },
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
  });

  return NextResponse.json({ project }, { status: 201 });
}
