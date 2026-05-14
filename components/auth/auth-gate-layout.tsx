import { FileText, LayoutGrid, Users } from "lucide-react";

const features = [
  {
    title: "AI Architecture Generation",
    body: "Describe your system; AI maps it to nodes and edges on a live canvas.",
    Icon: LayoutGrid,
  },
  {
    title: "Real-time Collaboration",
    body: "Live cursors, presence, and shared editing so your team refines the graph together.",
    Icon: Users,
  },
  {
    title: "Instant Spec Generation",
    body: "Export a complete Markdown technical spec directly from the canvas graph.",
    Icon: FileText,
  },
] as const;

export function AuthGateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-auth-split-right lg:grid lg:grid-cols-2 lg:grid-rows-1">
      <aside className="relative hidden flex-col justify-between border-r border-border/50 bg-auth-split-left px-10 py-12 lg:flex xl:px-16">
        <div className="flex max-w-lg flex-col gap-10">
          <div className="flex items-center gap-3">
            <span
              className="size-2.5 shrink-0 rounded-sm bg-primary shadow-[0_0_12px] shadow-primary/35"
              aria-hidden
            />
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              Ghost AI
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-balance font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground xl:text-4xl pt-20">
              Design systems at the speed of thought.
            </h1>
            <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              Describe your architecture in plain English. Ghost AI maps it to a shared canvas your
              whole team can refine in real time.
            </p>
          </div>
          <ul className="flex flex-col gap-6">
            {features.map(({ title, body, Icon }) => (
              <li key={title} className="flex gap-4">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary"
                  aria-hidden
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm leading-snug text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Ghost AI. All rights reserved.</p>
      </aside>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:min-h-svh">
        {children}
      </div>
    </div>
  );
}
