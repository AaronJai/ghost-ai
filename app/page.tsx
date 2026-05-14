import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getSignInPath } from "@/lib/auth-routes";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/editor");
  }
  redirect(getSignInPath());
}
