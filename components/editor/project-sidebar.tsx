"use client";

import { FolderOpen, Plus, Share2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ProjectSidebar({
  isOpen,
  onOpenChange,
  className,
}: ProjectSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        className={cn(
          "absolute inset-0 z-30 bg-black/50 transition-opacity duration-200 supports-backdrop-filter:backdrop-blur-xs",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <aside
        id="project-sidebar"
        aria-hidden={!isOpen}
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

          <TabsContent value="mine" className="mt-0 flex min-h-0 flex-1 flex-col">
            <EmptyTabState icon={FolderOpen} message="No projects yet." />
          </TabsContent>

          <TabsContent value="shared" className="mt-0 flex min-h-0 flex-1 flex-col">
            <EmptyTabState
              icon={Share2}
              message="Nothing shared with you yet."
            />
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border p-3">
          <Button type="button" variant="default" className="w-full gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
