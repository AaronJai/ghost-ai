import Link from "next/link";
import { Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
        <Lock className="h-8 w-8" strokeWidth={1.5} aria-hidden />
      </div>
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-lg font-medium text-foreground">
          You don&apos;t have access to this project
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may not exist, or you may need an invitation from the owner.
        </p>
      </div>
      <Link
        href="/editor"
        className={cn(buttonVariants({ variant: "default" }), "rounded-xl")}
      >
        Back to editor
      </Link>
    </div>
  );
}
