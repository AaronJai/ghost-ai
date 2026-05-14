"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorWorkspace() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-svh flex-col bg-background">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <ProjectSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main
          className="flex min-h-0 flex-1 items-center justify-center bg-background text-sm text-muted-foreground"
          aria-label="Editor canvas"
        >
          Canvas
        </main>
      </div>
    </div>
  );
}
