"use client";

import { useEffect, useRef, useState } from "react";
import { FolderOpen, MoreHorizontal, Plus, Share2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EditorSidebarProject } from "@/lib/editor-projects";
import { cn } from "@/lib/utils";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  myProjects: EditorSidebarProject[];
  sharedProjects: EditorSidebarProject[];
  onNewProject: () => void;
  onRenameProject: (project: EditorSidebarProject) => void;
  onDeleteProject: (project: EditorSidebarProject) => void;
  className?: string;
}

function EmptyTabState({
  message,
  icon: Icon,
}: {
  message: string;
  icon: typeof FolderOpen;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <Icon
        className="h-8 w-8 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ProjectRow({
  project,
  showActions,
  onRename,
  onDelete,
}: {
  project: EditorSidebarProject;
  showActions: boolean;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const node = rowRef.current;
      if (node && !node.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  return (
    <div
      ref={rowRef}
      className="flex items-stretch gap-1 border-b border-border py-2 pr-1 pl-3"
    >
      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-sm font-medium text-foreground">
          {project.name}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {project.slug}
        </p>
      </div>
      {showActions ? (
        <div className="relative flex shrink-0 items-start">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`Actions for ${project.name}`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </Button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 mt-1 min-w-[10rem] rounded-xl border border-border bg-popover py-1 shadow-lg ring-1 ring-border/60"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                onClick={() => {
                  setMenuOpen(false);
                  onRename();
                }}
              >
                Rename
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProjectList({
  projects,
  emptyMessage,
  emptyIcon,
  onRenameProject,
  onDeleteProject,
}: {
  projects: EditorSidebarProject[];
  emptyMessage: string;
  emptyIcon: typeof FolderOpen;
  onRenameProject: (project: EditorSidebarProject) => void;
  onDeleteProject: (project: EditorSidebarProject) => void;
}) {
  if (projects.length === 0) {
    return <EmptyTabState icon={emptyIcon} message={emptyMessage} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          showActions={project.membership === "owner"}
          onRename={() => onRenameProject(project)}
          onDelete={() => onDeleteProject(project)}
        />
      ))}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onOpenChange,
  myProjects,
  sharedProjects,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close project sidebar"
        aria-hidden={!isOpen}
        tabIndex={-1}
        className={cn(
          "absolute inset-0 z-30 transition-opacity duration-200 supports-backdrop-filter:backdrop-blur-xs",
          isOpen
            ? "max-md:pointer-events-auto max-md:bg-black/50 max-md:opacity-100 md:pointer-events-none md:bg-transparent md:opacity-0"
            : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <aside
        id="project-sidebar"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "absolute inset-y-0 left-0 z-40 flex w-[min(100%,20rem)] flex-col border-r border-border bg-card shadow-lg transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
          className
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
          <h2 className="truncate font-heading text-sm font-medium text-foreground">
            Projects
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close sidebar"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <Tabs defaultValue="mine" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="shrink-0 border-b border-border px-3 py-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mine">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="mine"
            className="mt-0 flex min-h-0 flex-1 flex-col"
          >
            <ProjectList
              projects={myProjects}
              emptyIcon={FolderOpen}
              emptyMessage="No projects yet."
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
            />
          </TabsContent>

          <TabsContent
            value="shared"
            className="mt-0 flex min-h-0 flex-1 flex-col"
          >
            <ProjectList
              projects={sharedProjects}
              emptyIcon={Share2}
              emptyMessage="Nothing shared with you yet."
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
            />
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border p-3">
          <Button
            type="button"
            variant="default"
            className="w-full gap-2"
            onClick={onNewProject}
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
