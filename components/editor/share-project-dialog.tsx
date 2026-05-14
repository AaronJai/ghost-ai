"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Loader2, Trash2, UserRound } from "lucide-react";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EditorDialogContent,
} from "@/components/editor/editor-dialog-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ShareCollaboratorRow {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

interface ShareListResponse {
  canManage: boolean;
  collaborators: ShareCollaboratorRow[];
}

export interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  canManage: boolean;
}

export function ShareProjectDialog({
  open,
  onOpenChange,
  projectId,
  canManage,
}: ShareProjectDialogProps) {
  const router = useRouter();
  const [rows, setRows] = useState<ShareCollaboratorRow[]>([]);
  const [serverCanManage, setServerCanManage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const clearCopyFeedbackTimeout = useCallback(() => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCopyFeedbackTimeout();
    };
  }, [clearCopyFeedbackTimeout]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "GET",
      });
      const data = (await res.json().catch(() => null)) as
        | ShareListResponse
        | { error?: string }
        | null;
      if (!res.ok) {
        setLoadError(
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "Could not load collaborators",
        );
        setRows([]);
        setServerCanManage(false);
        return;
      }
      const ok = data as ShareListResponse;
      setRows(ok.collaborators);
      setServerCanManage(ok.canManage);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load collaborators",
      );
      setRows([]);
      setServerCanManage(false);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) {
      clearCopyFeedbackTimeout();
      setInviteEmail("");
      setInviteError(null);
      setCopyError(null);
      setCopied(false);
    }
  }, [open, clearCopyFeedbackTimeout]);

  const manage = canManage && serverCanManage;

  const handleInvite = useCallback(async () => {
    if (!manage) return;
    setInviteBusy(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = (await res.json().catch(() => null)) as
        | { collaborator?: ShareCollaboratorRow; error?: string }
        | null;
      if (!res.ok) {
        setInviteError(
          typeof data === "object" && data?.error
            ? String(data.error)
            : "Invite failed",
        );
        return;
      }
      setInviteEmail("");
      await load();
      router.refresh();
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Invite failed",
      );
    } finally {
      setInviteBusy(false);
    }
  }, [inviteEmail, load, manage, projectId, router]);

  const handleRemove = useCallback(
    async (collaboratorId: string) => {
      if (!manage) return;
      setRemovingId(collaboratorId);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" },
        );
        if (!res.ok && res.status !== 204) {
          await load();
          return;
        }
        setRows((prev) => prev.filter((r) => r.id !== collaboratorId));
        router.refresh();
      } catch {
        await load();
      } finally {
        setRemovingId(null);
      }
    },
    [load, manage, projectId, router],
  );

  const projectUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/editor/${projectId}`
      : "";

  const handleCopyLink = useCallback(async () => {
    setCopyError(null);
    const url = `${window.location.origin}/editor/${projectId}`;
    try {
      await navigator.clipboard.writeText(url);
      clearCopyFeedbackTimeout();
      setCopied(true);
      copyTimeoutRef.current = window.setTimeout(() => {
        copyTimeoutRef.current = null;
        setCopied(false);
      }, 2000);
    } catch {
      setCopyError("Could not copy to clipboard");
    }
  }, [projectId, clearCopyFeedbackTimeout]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditorDialogContent showCloseButton className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {manage
              ? "Invite collaborators by email or copy the link to this project."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 truncate rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              {open ? projectUrl : ""}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-xl"
              onClick={() => void handleCopyLink()}
            >
              <Link2 className="h-4 w-4" aria-hidden />
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
          {copyError ? (
            <p className="text-xs text-destructive">{copyError}</p>
          ) : null}

          {manage ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleInvite();
                  }
                }}
                className="rounded-xl"
              />
              <Button
                type="button"
                className="shrink-0 rounded-xl"
                disabled={inviteBusy || inviteEmail.trim().length === 0}
                onClick={() => void handleInvite()}
              >
                {inviteBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
          ) : null}
          {inviteError ? (
            <p className="text-xs text-destructive">{inviteError}</p>
          ) : null}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Collaborators
            </p>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Loading…
              </div>
            ) : loadError ? (
              <p className="py-6 text-center text-sm text-destructive">
                {loadError}
              </p>
            ) : rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No collaborators yet.
              </p>
            ) : (
              <ScrollArea className="h-[min(16rem,40svh)] rounded-2xl border border-border">
                <ul className="flex flex-col gap-0 p-2">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2"
                    >
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <UserRound className="h-4 w-4" aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {row.displayName?.trim() || row.email}
                        </p>
                        {row.displayName?.trim() ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {row.email}
                          </p>
                        ) : null}
                      </div>
                      {manage ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${row.email}`}
                          disabled={removingId === row.id}
                          onClick={() => void handleRemove(row.id)}
                        >
                          {removingId === row.id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>
      </EditorDialogContent>
    </Dialog>
  );
}
