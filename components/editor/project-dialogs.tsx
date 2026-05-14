"use client";

import { useLayoutEffect } from "react";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EditorDialogContent,
  EditorDialogFooter,
} from "@/components/editor/editor-dialog-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectDialogState } from "@/hooks/use-project-dialogs";

export interface ProjectDialogsProps {
  dialog: ProjectDialogState;
  createName: string;
  onCreateNameChange: (value: string) => void;
  slugPreview: string;
  renameName: string;
  onRenameNameChange: (value: string) => void;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitCreate: () => void;
  onSubmitRename: () => void;
  onSubmitDelete: () => void;
}

export function ProjectDialogs({
  dialog,
  createName,
  onCreateNameChange,
  slugPreview,
  renameName,
  onRenameNameChange,
  isLoading,
  onOpenChange,
  onSubmitCreate,
  onSubmitRename,
  onSubmitDelete,
}: ProjectDialogsProps) {
  useLayoutEffect(() => {
    if (dialog.kind !== "rename") return;
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(
        "project-rename-name"
      ) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [dialog.kind, dialog.project?.id]);

  const trimmedCreateName = createName.trim();
  const slugEmpty =
    trimmedCreateName.length > 0 && slugPreview.length === 0;
  const slugMono =
    trimmedCreateName.length === 0
      ? "your-project-slug"
      : slugEmpty
        ? "—"
        : slugPreview;
  const canSubmitCreate =
    trimmedCreateName.length > 0 && slugPreview.length > 0;

  return (
    <>
      <Dialog
        open={dialog.kind === "create"}
        onOpenChange={onOpenChange}
      >
        <EditorDialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Choose a display name. You can change it later.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmitCreate();
            }}
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-create-name"
                className="text-sm font-medium text-foreground"
              >
                Project name
              </label>
              <Input
                id="project-create-name"
                name="projectName"
                value={createName}
                onChange={(e) => onCreateNameChange(e.target.value)}
                placeholder="e.g. Order service redesign"
                autoComplete="off"
                autoFocus
                disabled={isLoading}
                aria-invalid={slugEmpty}
              />
              <p className="text-xs text-muted-foreground">
                Slug preview:{" "}
                <span className="font-mono text-foreground">{slugMono}</span>
              </p>
              {slugEmpty ? (
                <p className="text-xs text-destructive" role="alert">
                  Add at least one letter or number — symbols alone cannot form
                  a URL slug.
                </p>
              ) : null}
            </div>
            <EditorDialogFooter className="mt-2 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !canSubmitCreate}
              >
                {isLoading ? "Creating…" : "Create"}
              </Button>
            </EditorDialogFooter>
          </form>
        </EditorDialogContent>
      </Dialog>

      <Dialog
        open={dialog.kind === "rename"}
        onOpenChange={onOpenChange}
      >
        <EditorDialogContent showCloseButton initialFocus={false}>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Current name:{" "}
              <span className="font-medium text-foreground">
                {dialog.project?.name ?? ""}
              </span>
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmitRename();
            }}
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-rename-name"
                className="text-sm font-medium text-foreground"
              >
                Project name
              </label>
              <Input
                id="project-rename-name"
                name="projectName"
                value={renameName}
                onChange={(e) => onRenameNameChange(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <EditorDialogFooter className="mt-2 border-t">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !renameName.trim()}
              >
                {isLoading ? "Saving…" : "Save"}
              </Button>
            </EditorDialogFooter>
          </form>
        </EditorDialogContent>
      </Dialog>

      <Dialog
        open={dialog.kind === "delete"}
        onOpenChange={onOpenChange}
      >
        <EditorDialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {dialog.project?.name ?? "this project"}
              </span>{" "}
              from your list. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <EditorDialogFooter className="mt-2 border-t">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={() => void onSubmitDelete()}
            >
              {isLoading ? "Deleting…" : "Delete project"}
            </Button>
          </EditorDialogFooter>
        </EditorDialogContent>
      </Dialog>
    </>
  );
}
