"use client";

import { UserButton } from "@clerk/nextjs";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  /** When set, shown centered as the active project title. */
  projectTitle?: string | null;
  /** Share + AI panel toggles (project workspace only). */
  showProjectActions?: boolean;
  /** Opens the share dialog when provided (Share is interactive). */
  onShareClick?: () => void;
  isAiPanelOpen?: boolean;
  onAiPanelToggle?: () => void;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectTitle,
  showProjectActions = false,
  onShareClick,
  isAiPanelOpen = false,
  onAiPanelToggle,
  className,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const AiPanelIcon = isAiPanelOpen ? PanelRightClose : PanelRightOpen;
  const shareDisabled = !onShareClick;

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
      <div className="flex min-w-0 flex-1 items-center justify-center px-4">
        {projectTitle ? (
          <h1 className="truncate text-center text-sm font-medium text-foreground">
            {projectTitle}
          </h1>
        ) : null}
      </div>
      <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 px-3">
        {showProjectActions ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden gap-2 rounded-xl sm:inline-flex"
              disabled={shareDisabled}
              aria-label="Share project"
              onClick={shareDisabled ? undefined : onShareClick}
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="sm:hidden"
              disabled={shareDisabled}
              aria-label="Share project"
              onClick={shareDisabled ? undefined : onShareClick}
            >
              <Share2 className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-expanded={isAiPanelOpen}
              aria-controls="editor-ai-sidebar"
              aria-label={isAiPanelOpen ? "Hide AI sidebar" : "Show AI sidebar"}
              onClick={onAiPanelToggle}
            >
              <AiPanelIcon className="h-5 w-5" aria-hidden />
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
