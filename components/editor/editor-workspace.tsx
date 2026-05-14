"use client";

import { useState, useCallback } from "react";

import type { EditorSidebarProject } from "@/lib/editor-projects";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";

export interface EditorWorkspaceProps {
  myProjects: EditorSidebarProject[];
  sharedProjects: EditorSidebarProject[];
  activeProjectId: string | null;
}

export function EditorWorkspace({
  myProjects,
  sharedProjects,
  activeProjectId,
}: EditorWorkspaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <div className="flex h-svh flex-col bg-background">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <ProjectSidebar
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
          myProjects={myProjects}
          sharedProjects={sharedProjects}
          onNewProject={handleNewProjectFromSidebar}
          onRenameProject={dialogs.openRename}
          onDeleteProject={dialogs.openDelete}
        />
        <main
          className="flex min-h-0 flex-1 items-center justify-center bg-background px-4 py-8"
          aria-label="Editor home"
        >
          <EditorHome onNewProject={dialogs.openCreate} />
        </main>
      </div>
      <ProjectDialogs
        dialog={dialogs.dialog}
        createName={dialogs.createName}
        onCreateNameChange={dialogs.setCreateName}
        slugPreview={dialogs.slugPreview}
        renameName={dialogs.renameName}
        onRenameNameChange={dialogs.setRenameName}
        isLoading={dialogs.isLoading}
        onOpenChange={handleDialogOpenChange}
        onSubmitCreate={dialogs.submitCreate}
        onSubmitRename={dialogs.submitRename}
        onSubmitDelete={dialogs.submitDelete}
      />
    </div>
  );
}
