"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { EditorSidebarProject } from "@/lib/editor-projects";
import { slugifyProjectName } from "@/lib/project-slug";

export type ProjectDialogKind = "none" | "create" | "rename" | "delete";

export interface ProjectDialogState {
  kind: ProjectDialogKind;
  project: EditorSidebarProject | null;
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

function uniqueRoomId(base: string, ids: Set<string>): string {
  const root =
    (base || "project").slice(0, 80).replace(/-+$/g, "") || "project";
  let candidate = root;
  let n = 0;
  while (ids.has(candidate)) {
    n += 1;
    candidate = `${root}-${shortSuffix()}${n > 1 ? `-${n}` : ""}`;
  }
  return candidate;
}

function allProjectIds(
  my: EditorSidebarProject[],
  shared: EditorSidebarProject[],
): Set<string> {
  return new Set([...my, ...shared].map((p) => p.id));
}

export interface UseProjectActionsParams {
  myProjects: EditorSidebarProject[];
  sharedProjects: EditorSidebarProject[];
  activeProjectId: string | null;
}

export function useProjectActions({
  myProjects,
  sharedProjects,
  activeProjectId,
}: UseProjectActionsParams) {
  const router = useRouter();

  const [dialog, setDialog] = useState<ProjectDialogState>({
    kind: "none",
    project: null,
  });
  const [createName, setCreateNameState] = useState("");
  const [renameName, setRenameNameState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const setCreateName = useCallback((value: string) => {
    setCreateError(null);
    setCreateNameState(value);
  }, []);

  const setRenameName = useCallback((value: string) => {
    setRenameError(null);
    setRenameNameState(value);
  }, []);

  const slugPreview = useMemo(() => {
    const name = createName.trim();
    if (!name) return "";
    return uniqueRoomId(
      slugifyProjectName(name) || "project",
      allProjectIds(myProjects, sharedProjects),
    );
  }, [createName, myProjects, sharedProjects]);

  const closeDialog = useCallback(() => {
    setDialog({ kind: "none", project: null });
    setCreateNameState("");
    setCreateError(null);
    setRenameNameState("");
    setRenameError(null);
    setDeleteError(null);
    setIsLoading(false);
  }, []);

  const openCreate = useCallback(() => {
    setCreateError(null);
    setCreateNameState("");
    setDialog({ kind: "create", project: null });
  }, []);

  const openRename = useCallback(
    (project: EditorSidebarProject) => {
      setRenameName(project.name);
      setDialog({ kind: "rename", project });
    },
    [setRenameName],
  );

  const openDelete = useCallback((project: EditorSidebarProject) => {
    setDeleteError(null);
    setDialog({ kind: "delete", project });
  }, []);

  const submitCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name) return;
    const baseSlug = slugifyProjectName(name) || "project";

    setCreateError(null);
    setIsLoading(true);
    try {
      const ids = allProjectIds(myProjects, sharedProjects);
      let roomId = uniqueRoomId(baseSlug, ids);
      const maxAttempts = 8;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, id: roomId }),
        });
        if (res.status === 409) {
          ids.add(roomId);
          roomId = uniqueRoomId(baseSlug, ids);
          continue;
        }
        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setCreateError(
            err?.error ?? `Create failed (${res.status})`,
          );
          return;
        }
        const data = (await res.json()) as { project: { id: string } };
        closeDialog();
        router.push(`/editor/${data.project.id}`);
        router.refresh();
        return;
      }
      setCreateError("Could not allocate a unique room id");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create project",
      );
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, createName, myProjects, router, sharedProjects]);

  const submitRename = useCallback(async () => {
    if (dialog.kind !== "rename" || !dialog.project) return;
    const name = renameName.trim();
    if (!name) return;

    setRenameError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setRenameError(err?.error ?? `Rename failed (${res.status})`);
        return;
      }
      closeDialog();
      router.refresh();
    } catch (err) {
      setRenameError(
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, dialog, renameName, router]);

  const submitDelete = useCallback(async () => {
    if (dialog.kind !== "delete" || !dialog.project) return;

    setDeleteError(null);
    setIsLoading(true);
    try {
      const id = dialog.project.id;
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setDeleteError(err?.error ?? `Delete failed (${res.status})`);
        return;
      }
      closeDialog();
      if (activeProjectId === id) {
        router.push("/editor");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, closeDialog, dialog, router]);

  return {
    dialog,
    createName,
    setCreateName,
    createError,
    slugPreview,
    renameName,
    setRenameName,
    renameError,
    deleteError,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
