import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getSignInPath } from "@/lib/auth-routes";
import { getEditorProjectsForUser } from "@/lib/editor-projects";

interface EditorProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditorProjectPage({
  params,
}: EditorProjectPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect(getSignInPath());
  }

  const { projectId } = await params;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim() ?? null;
  const { owned, shared } = await getEditorProjectsForUser({ userId, email });

  return (
    <EditorWorkspace
      myProjects={owned}
      sharedProjects={shared}
      activeProjectId={projectId}
    />
  );
}
