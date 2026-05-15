"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { EditorSidebarProject } from "@/lib/editor-projects";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareProjectDialog } from "@/components/editor/share-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";

export interface EditorWorkspaceProps {
  myProjects: EditorSidebarProject[];
  sharedProjects: EditorSidebarProject[];
  activeProjectId: string | null;
  /** Display name for the open project (navbar + context); omit on editor home. */
  activeProjectName?: string | null;
  /** Set when viewing a project the user may access as owner or collaborator. */
  activeProjectRole?: "owner" | "collaborator" | null;
}

export function EditorWorkspace({
  myProjects,
  sharedProjects,
  activeProjectId,
  activeProjectName = null,
  activeProjectRole = null,
}: EditorWorkspaceProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const handleSelectProject = useCallback(
    (id: string) => {
      router.push(`/editor/${id}`);
    },
    [router],
  );

  const dialogs = useProjectActions({
    myProjects,
    sharedProjects,
    activeProjectId,
  });

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        dialogs.closeDialog();
      }
    },
    [dialogs],
  );

  const handleNewProjectFromSidebar = useCallback(() => {
    setSidebarOpen(false);
    dialogs.openCreate();
  }, [dialogs]);

  const isProjectRoute = activeProjectId !== null;
  const projectNavTitle =
    isProjectRoute && activeProjectName?.trim()
      ? activeProjectName.trim()
      : isProjectRoute
        ? "Untitled Project"
        : null;

  return (
    <div className="flex h-svh flex-col bg-background">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
        projectTitle={projectNavTitle}
        showProjectActions={isProjectRoute}
        onShareClick={
          isProjectRoute ? () => setShareOpen(true) : undefined
        }
        isAiPanelOpen={aiPanelOpen}
        onAiPanelToggle={() => setAiPanelOpen((open) => !open)}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <ProjectSidebar
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
          myProjects={myProjects}
          sharedProjects={sharedProjects}
          selectedProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProjectFromSidebar}
          onRenameProject={dialogs.openRename}
          onDeleteProject={dialogs.openDelete}
        />
        {isProjectRoute ? (
          <div className="flex min-h-0 flex-1">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                className="relative flex min-h-0 flex-1 bg-background"
                aria-label="Canvas"
              >
                <CanvasWrapper roomId={activeProjectId} />
              </div>
            </div>
            <aside
              id="editor-ai-sidebar"
              aria-hidden={!aiPanelOpen}
              className={
                aiPanelOpen
                  ? "flex w-[min(100%,20rem)] shrink-0 flex-col border-l border-border bg-card"
                  : "hidden w-0 shrink-0 overflow-hidden border-0 p-0"
              }
            >
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8">
                <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  AI
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Chat and suggestions will live here.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <main
            className="flex min-h-0 flex-1 items-center justify-center bg-background px-4 py-8"
            aria-label="Editor home"
          >
            <EditorHome onNewProject={dialogs.openCreate} />
          </main>
        )}
      </div>
      <ProjectDialogs
        dialog={dialogs.dialog}
        createName={dialogs.createName}
        onCreateNameChange={dialogs.setCreateName}
        slugPreview={dialogs.slugPreview}
        createError={dialogs.createError}
        renameName={dialogs.renameName}
        onRenameNameChange={dialogs.setRenameName}
        renameError={dialogs.renameError}
        deleteError={dialogs.deleteError}
        isLoading={dialogs.isLoading}
        onOpenChange={handleDialogOpenChange}
        onSubmitCreate={dialogs.submitCreate}
        onSubmitRename={dialogs.submitRename}
        onSubmitDelete={dialogs.submitDelete}
      />
      {isProjectRoute && activeProjectId ? (
        <ShareProjectDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          projectId={activeProjectId}
          canManage={activeProjectRole === "owner"}
        />
      ) : null}
    </div>
  );
}
