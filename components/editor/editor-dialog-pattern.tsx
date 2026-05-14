"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Dialog surface aligned with editor tokens (`globals.css` / shadcn theme).
 * Compose with DialogHeader, DialogTitle, DialogDescription, EditorDialogFooter, and actions.
 */
function EditorDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "gap-6 rounded-3xl border border-border bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-border/60 sm:max-w-lg",
        className
      )}
      {...props}
    />
  );
}

/** Footer row matched to `EditorDialogContent` padding and modal radius. */
function EditorDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "-mx-6 -mb-6 rounded-b-3xl border-border bg-muted/50 p-6 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EditorDialogContent,
  EditorDialogFooter,
};
