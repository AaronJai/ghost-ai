# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Core app wiring after auth (projects, canvas, or API)

## Current Goal

- Wire project UI to Prisma-backed project APIs, Liveblocks canvas, or the next feature unit from `context/feature-specs/`.

## Completed

- `context/feature-specs/01-design-system.md` — shadcn/ui initialized (Tailwind v4, `components.json`, `tw-animate-css`, `shadcn/tailwind.css`); primitives added: `Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`, `ScrollArea`; `lucide-react` installed; `lib/utils.ts` with `cn()`; dark-only semantic tokens in `app/globals.css` aligned with `context/ui-context.md`; `<html class="dark">` for `dark:` variants. Generated `components/ui/*` left unmodified after install.
- `context/feature-specs/02-editor.md` — `components/editor/editor-navbar.tsx` (fixed-height bar, sidebar toggle with `PanelLeftOpen` / `PanelLeftClose`, empty center and right); `components/editor/project-sidebar.tsx` (overlay sidebar, slide-in, `Projects` header + close, `Tabs` for My Projects / Shared with empty states, full-width `New Project`); `components/editor/editor-dialog-pattern.tsx` (`EditorDialogContent`, `EditorDialogFooter`, re-exports for title/description/actions); `components/editor/editor-workspace.tsx` (shell composed into the editor route; see `03-auth` for `/editor`).
- `context/feature-specs/03-auth.md` — `@clerk/ui` added; root `ClerkProvider` with `dark` theme from `@clerk/ui/themes` and appearance variables mapped to app CSS custom properties (`lib/clerk-appearance.ts`); `proxy.ts` at project root with `clerkMiddleware`, public routes derived from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (path fallbacks `/sign-in`, `/sign-up`), default protection elsewhere; `/` redirects signed-in users to `/editor` and signed-out to sign-in; `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]` with minimal two-panel `AuthGateLayout` (marketing panel `lg+` only); editor shell at `app/editor/page.tsx`; `UserButton` in navbar right using shared appearance.
- `context/feature-specs/04-project-dialogs.md` — `hooks/use-project-dialogs.ts` (dialog / form / mock loading state; mock my + shared lists); `lib/mock-projects.ts`, `lib/project-slug.ts`; `components/editor/editor-home.tsx` (center copy + `New Project` with `Plus`); `components/editor/project-dialogs.tsx` (Create with live slug preview, Rename with prefilled name / Enter submit / autofocus, Delete destructive confirm); `ProjectSidebar` wired to dialogs, per-row actions (rename/delete) only for `membership === "owner"`, `max-md` backdrop scrim + outside tap to close, desktop overlay non-blocking; `editor-workspace.tsx` composes hook, home, dialogs, and sidebar.
- `context/feature-specs/05-prisma.md` — `prisma/models/project.prisma` (`Project`, `ProjectCollaborator`, `ProjectStatus`, indexes and unique as specified); `lib/prisma.ts` (singleton on `globalThis` in non-production; `prisma+postgres://` → Accelerate + `@prisma/extension-accelerate`, else `@prisma/adapter-pg`); first migration `20260514070455_init_project_models`; client output `app/generated/prisma` (gitignored).
- `context/feature-specs/06-project-apis.md` — `GET/POST /api/projects`, `PATCH/DELETE /api/projects/[projectId]` with Clerk `ownerId`, default name `Untitled Project`, owner-only rename/delete (`403`), unauthenticated `401` (`lib/api-auth.ts`); `canvas/{id}.json` set in a transaction after create; `proxy.ts` skips `auth.protect()` for `/api` so handlers return JSON errors instead of redirects.
- `context/feature-specs/07-wire-editor-home.md` — `lib/editor-projects.ts` (`getEditorProjectsForUser`: owned + shared by collaborator email); `app/editor/page.tsx` and `app/editor/[projectId]/page.tsx` as server components passing lists into `EditorWorkspace`; `hooks/use-project-actions.ts` (dialogs, `POST`/`PATCH`/`DELETE` via fetch, slug-based room `id` aligned with DB, `router.refresh` / redirect after mutations); `POST /api/projects` accepts optional `id` (slug validation + `409` on collision); sidebar/dialogs use `EditorSidebarProject`; removed `use-project-dialogs` / `mock-projects`.

## In Progress

- None.

## Next Up

- Liveblocks canvas on `/editor/[projectId]`, or whichever unit is next in `context/feature-specs/`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Prisma Client wiring (`lib/prisma.ts`): if `DATABASE_URL` starts with `prisma+postgres://`, use Prisma Accelerate (`accelerateUrl` + `@prisma/extension-accelerate`); otherwise use direct PostgreSQL via `@prisma/adapter-pg`. Singleton is cached on `globalThis` outside production for Next.js dev hot reload.
- `prismaDb` (`lib/prisma.ts`): cast of the singleton to `InstanceType<typeof PrismaClient>` for route modules where Turbopack/TypeScript cannot merge Accelerate-extended `findUnique` / transaction signatures with the base client.

## Session Notes

- shadcn CLI v4 default preset is **Base UI** (`@base-ui/react`) with Nova styling, not Radix; components match current shadcn registry output.
