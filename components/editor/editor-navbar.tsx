"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  className,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-stretch border-b border-border bg-card",
        className
      )}
    >
      <div className="flex w-14 shrink-0 items-center justify-center border-r border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-expanded={isSidebarOpen}
          aria-controls="project-sidebar"
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          onClick={onSidebarToggle}
        >
          <ToggleIcon className="h-5 w-5" aria-hidden />
        </Button>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center px-4" />
      <div className="flex min-w-14 shrink-0 items-center justify-end gap-2 px-3">
        <UserButton />
      </div>
    </header>
  );
}
