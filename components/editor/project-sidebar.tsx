"use client";

import { FolderOpen, Pencil, Plus, Share2, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EditorSidebarProject } from "@/lib/editor-projects";
import { cn } from "@/lib/utils";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  myProjects: EditorSidebarProject[];
  sharedProjects: EditorSidebarProject[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
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
  selected,
  showActions,
  onSelect,
  onRename,
  onDelete,
}: {
  project: EditorSidebarProject;
  selected: boolean;
  showActions: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Project ${project.name}`}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 text-left outline-none transition-colors select-none",
        "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        selected && "bg-muted/40 hover:bg-muted/55",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {project.name}
        </p>
      </div>
      {showActions ? (
        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 transition-opacity",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-foreground"
            aria-label={`Rename ${project.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${project.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ProjectList({
  projects,
  emptyMessage,
  emptyIcon,
  selectedProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
}: {
  projects: EditorSidebarProject[];
  emptyMessage: string;
  emptyIcon: typeof FolderOpen;
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onRenameProject: (project: EditorSidebarProject) => void;
  onDeleteProject: (project: EditorSidebarProject) => void;
}) {
  if (projects.length === 0) {
    return <EmptyTabState icon={emptyIcon} message={emptyMessage} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2">
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          selected={selectedProjectId === project.id}
          showActions={project.membership === "owner"}
          onSelect={() => onSelectProject(project.id)}
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
  selectedProjectId,
  onSelectProject,
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
              selectedProjectId={selectedProjectId}
              onSelectProject={onSelectProject}
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
              selectedProjectId={selectedProjectId}
              onSelectProject={onSelectProject}
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
