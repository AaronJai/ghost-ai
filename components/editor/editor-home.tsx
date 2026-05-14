"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditorHomeProps {
  onNewProject: () => void;
  className?: string;
}

export function EditorHome({ onNewProject, className }: EditorHomeProps) {
  return (
    <div
      className={cn(
        "flex max-w-md flex-col items-center gap-4 px-6 text-center",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-lg font-medium text-foreground">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-muted-foreground">
          Start a new architecture workspace, or choose a project from the
          sidebar
        </p>
      </div>
      <Button
        type="button"
        className="gap-2"
        onClick={onNewProject}
      >
        <Plus className="h-4 w-4" aria-hidden />
        New Project
      </Button>
    </div>
  );
}
