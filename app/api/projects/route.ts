import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/api-auth";
import { prismaDb } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

interface CreateProjectBody {
  name?: unknown;
  description?: unknown;
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

  const project = await prismaDb.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
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
