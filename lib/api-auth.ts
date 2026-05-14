import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireUserId(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }
  return { userId };
}
