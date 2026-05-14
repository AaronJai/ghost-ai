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
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setCreateName("");
    setRenameName("");
    setIsLoading(false);
  }, []);

  const openCreate = useCallback(() => {
    setCreateName("");
    setDialog({ kind: "create", project: null });
  }, []);

  const openRename = useCallback((project: EditorSidebarProject) => {
    setRenameName(project.name);
    setDialog({ kind: "rename", project });
  }, []);

  const openDelete = useCallback((project: EditorSidebarProject) => {
    setDialog({ kind: "delete", project });
  }, []);

  const submitCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name) return;
    const baseSlug = slugifyProjectName(name) || "project";

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
          throw new Error(err?.error ?? `Create failed (${res.status})`);
        }
        const data = (await res.json()) as { project: { id: string } };
        closeDialog();
        router.push(`/editor/${data.project.id}`);
        router.refresh();
        return;
      }
      throw new Error("Could not allocate a unique room id");
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, createName, myProjects, router, sharedProjects]);

  const submitRename = useCallback(async () => {
    if (dialog.kind !== "rename" || !dialog.project) return;
    const name = renameName.trim();
    if (!name) return;

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
        throw new Error(err?.error ?? `Rename failed (${res.status})`);
      }
      closeDialog();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, dialog, renameName, router]);

  const submitDelete = useCallback(async () => {
    if (dialog.kind !== "delete" || !dialog.project) return;

    setIsLoading(true);
    try {
      const id = dialog.project.id;
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? `Delete failed (${res.status})`);
      }
      closeDialog();
      if (activeProjectId === id) {
        router.push("/editor");
        router.refresh();
      } else {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, closeDialog, dialog, router]);

  return {
    dialog,
    createName,
    setCreateName,
    slugPreview,
    renameName,
    setRenameName,
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
