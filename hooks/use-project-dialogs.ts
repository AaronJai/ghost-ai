"use client";

import { useCallback, useMemo, useState } from "react";

import type { MockProject } from "@/lib/mock-projects";
import {
  INITIAL_MOCK_MY_PROJECTS,
  INITIAL_MOCK_SHARED_PROJECTS,
} from "@/lib/mock-projects";
import { slugifyProjectName } from "@/lib/project-slug";

export type ProjectDialogKind = "none" | "create" | "rename" | "delete";

export interface ProjectDialogState {
  kind: ProjectDialogKind;
  project: MockProject | null;
}

function uniqueSlug(base: string, projects: MockProject[]): string {
  const root = base || "project";
  let candidate = root;
  let n = 1;
  while (projects.some((p) => p.slug === candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}

export function useProjectDialogs() {
  const [myProjects, setMyProjects] = useState<MockProject[]>(
    () => INITIAL_MOCK_MY_PROJECTS
  );
  const [sharedProjects, setSharedProjects] = useState<MockProject[]>(
    () => INITIAL_MOCK_SHARED_PROJECTS
  );

  const [dialog, setDialog] = useState<ProjectDialogState>({
    kind: "none",
    project: null,
  });
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slugPreview = useMemo(
    () => slugifyProjectName(createName),
    [createName]
  );

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

  const openRename = useCallback((project: MockProject) => {
    setRenameName(project.name);
    setDialog({ kind: "rename", project });
  }, []);

  const openDelete = useCallback((project: MockProject) => {
    setDialog({ kind: "delete", project });
  }, []);

  const submitCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const baseSlug = slugifyProjectName(name) || "project";
      const all = [...myProjects, ...sharedProjects];
      const slug = uniqueSlug(baseSlug, all);
      const next: MockProject = {
        id: `p-mock-${crypto.randomUUID()}`,
        name,
        slug,
        membership: "owner",
      };
      setMyProjects((prev) => [next, ...prev]);
      closeDialog();
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, createName, myProjects, sharedProjects]);

  const submitRename = useCallback(async () => {
    if (dialog.kind !== "rename" || !dialog.project) return;
    const name = renameName.trim();
    if (!name) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      const id = dialog.project.id;
      setMyProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name } : p))
      );
      setSharedProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name } : p))
      );
      closeDialog();
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, dialog, renameName]);

  const submitDelete = useCallback(async () => {
    if (dialog.kind !== "delete" || !dialog.project) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      const id = dialog.project.id;
      setMyProjects((prev) => prev.filter((p) => p.id !== id));
      setSharedProjects((prev) => prev.filter((p) => p.id !== id));
      closeDialog();
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog, dialog]);

  return {
    myProjects,
    sharedProjects,
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
