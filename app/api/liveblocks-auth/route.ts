import { auth, clerkClient } from "@clerk/nextjs/server";

import { getCursorColor, getLiveblocks } from "@/lib/liveblocks";
import {
  buildClerkEditorIdentity,
  getEditorProjectAccess,
} from "@/lib/project-access";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json().catch(() => ({}));
  const { room: projectId } = body as { room?: string };

  if (!projectId) {
    return new Response(JSON.stringify({ error: "Missing room" }), {
      status: 400,
    });
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId).catch(() => null);
  const identity = buildClerkEditorIdentity(userId, clerkUser);

  const access = await getEditorProjectAccess(projectId, identity);
  if (!access.ok) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  const liveblocks = getLiveblocks();

  await liveblocks.getOrCreateRoom(projectId, {
    defaultAccesses: [],
    usersAccesses: {
      [userId]: ["room:write"],
    },
  });

  const name =
    clerkUser?.fullName?.trim() ||
    clerkUser?.username?.trim() ||
    clerkUser?.primaryEmailAddress?.emailAddress?.trim() ||
    "Unknown";

  const avatar = clerkUser?.imageUrl ?? "";
  const cursorColor = getCursorColor(userId);

  const { status, body: responseBody } = await liveblocks.identifyUser(
    { userId, groupIds: [] },
    {
      userInfo: {
        name,
        avatar,
        cursorColor,
      },
    },
  );

  return new Response(responseBody, { status });
}
