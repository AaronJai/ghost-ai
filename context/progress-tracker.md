# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Core app wiring after auth (projects, canvas, or API)

## Current Goal

- Liveblocks canvas on `/editor/[projectId]`, or the next feature unit from `context/feature-specs/`.

## Completed

- `context/feature-specs/01-design-system.md` — shadcn/ui initialized (Tailwind v4, `components.json`, `tw-animate-css`, `shadcn/tailwind.css`); primitives added: `Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`, `ScrollArea`; `lucide-react` installed; `lib/utils.ts` with `cn()`; dark-only semantic tokens in `app/globals.css` aligned with `context/ui-context.md`; `<html class="dark">` for `dark:` variants. Generated `components/ui/*` left unmodified after install.
- `context/feature-specs/02-editor.md` — `components/editor/editor-navbar.tsx` (fixed-height bar, sidebar toggle with `PanelLeftOpen` / `PanelLeftClose`, empty center and right); `components/editor/project-sidebar.tsx` (overlay sidebar, slide-in, `Projects` header + close, `Tabs` for My Projects / Shared with empty states, full-width `New Project`); `components/editor/editor-dialog-pattern.tsx` (`EditorDialogContent`, `EditorDialogFooter`, re-exports for title/description/actions); `components/editor/editor-workspace.tsx` (shell composed into the editor route; see `03-auth` for `/editor`).
- `context/feature-specs/03-auth.md` — `@clerk/ui` added; root `ClerkProvider` with `dark` theme from `@clerk/ui/themes` and appearance variables mapped to app CSS custom properties (`lib/clerk-appearance.ts`); `proxy.ts` at project root with `clerkMiddleware`, public routes derived from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (path fallbacks `/sign-in`, `/sign-up`), default protection elsewhere; `/` redirects signed-in users to `/editor` and signed-out to sign-in; `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]` with minimal two-panel `AuthGateLayout` (marketing panel `lg+` only); editor shell at `app/editor/page.tsx`; `UserButton` in navbar right using shared appearance.
- `context/feature-specs/04-project-dialogs.md` — `hooks/use-project-dialogs.ts` (dialog / form / mock loading state; mock my + shared lists); `lib/mock-projects.ts`, `lib/project-slug.ts`; `components/editor/editor-home.tsx` (center copy + `New Project` with `Plus`); `components/editor/project-dialogs.tsx` (Create with live slug preview, Rename with prefilled name / Enter submit / autofocus, Delete destructive confirm); `ProjectSidebar` wired to dialogs, per-row actions (rename/delete) only for `membership === "owner"`, `max-md` backdrop scrim + outside tap to close, desktop overlay non-blocking; `editor-workspace.tsx` composes hook, home, dialogs, and sidebar.
- `context/feature-specs/05-prisma.md` — `prisma/models/project.prisma` (`Project`, `ProjectCollaborator`, `ProjectStatus`, indexes and unique as specified); `lib/prisma.ts` (singleton on `globalThis` in non-production; `prisma+postgres://` → Accelerate + `@prisma/extension-accelerate`, else `@prisma/adapter-pg`); first migration `20260514070455_init_project_models`; client output `app/generated/prisma` (gitignored).
- `context/feature-specs/06-project-apis.md` — `GET/POST /api/projects`, `PATCH/DELETE /api/projects/[projectId]` with Clerk `ownerId`, default name `Untitled Project`, owner-only rename/delete (`403`), unauthenticated `401` (`lib/api-auth.ts`); `canvas/{id}.json` set in a transaction after create; `proxy.ts` skips `auth.protect()` for `/api` so handlers return JSON errors instead of redirects.
- `context/feature-specs/07-wire-editor-home.md` — `lib/editor-projects.ts` (`getEditorProjectsForUser`: owned + shared by collaborator email); `app/editor/page.tsx` and `app/editor/[projectId]/page.tsx` as server components passing lists into `EditorWorkspace`; `hooks/use-project-actions.ts` (dialogs, `POST`/`PATCH`/`DELETE` via fetch, slug-based room `id` aligned with DB, `router.refresh` / redirect after mutations); `POST /api/projects` accepts optional `id` (slug validation + `409` on collision); sidebar/dialogs use `EditorSidebarProject`; removed `use-project-dialogs` / `mock-projects`.
- `context/feature-specs/08-editor-workspace-shell.md` — `lib/project-access.ts` (`buildClerkEditorIdentity`, `getPrimaryEmailFromClerkUser`, `getEditorProjectAccess` via Prisma owner or collaborator); `components/editor/access-denied.tsx` (lock, copy, link to `/editor`); `app/editor/[projectId]/page.tsx` server checks + `AccessDenied` for missing/unauthorized projects; `EditorNavbar` project title, Share + AI panel toggles; `EditorWorkspace` project layout: `bg-background` canvas placeholder, optional `activeProjectName`, right AI placeholder sidebar; editor home unchanged.
- `context/feature-specs/09-share-dialog.md` — `GET/POST /api/projects/[projectId]/collaborators`, `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]` (owner-only invite/remove; members can list); `lib/clerk-collaborator-profiles.ts` + `lib/collaborator-email.ts`; `getEditorProjectAccess` extended with `role`; `ShareProjectDialog` (invite, list, remove, copy link + "Copied!"); navbar Share opens dialog; collaborators read-only without manage actions.
- `context/feature-specs/10-liveblocks-setup.md` — `@liveblocks/node` installed; `liveblocks.config.ts` defines `Presence` (`cursor: {x,y}|null`, `isThinking: boolean`) and `UserMeta` (`id`, `info: {name, avatar, cursorColor}`); `lib/liveblocks.ts` with lazy-cached `Liveblocks` node client (`getLiveblocks()`) and `getCursorColor(userId)` deterministic palette helper; `POST /api/liveblocks-auth` verifies Clerk auth, checks project access via `getEditorProjectAccess`, calls `getOrCreateRoom` (private room with per-user write grant), then issues ID-token session via `identifyUser` with name, avatar, and cursor colour; `npm run build` passes.
- `context/feature-specs/11-base-canvas.md` — `types/canvas.ts` with `CanvasNodeData` (label, color, shape), `CanvasNode` (`canvasNode` type), `CanvasEdge` (`canvasEdge` type); `components/editor/canvas-flow.tsx` uses `useLiveblocksFlow` (suspense, empty initial nodes/edges) + `ReactFlow` with loose connection mode, `fitView`, `MiniMap`, dot-pattern `Background`, and `Cursors`; `components/editor/canvas-wrapper.tsx` composes `LiveblocksProvider` (`/api/liveblocks-auth`), class-based `LiveblocksErrorBoundary`, `RoomProvider` (initial presence `cursor: null, isThinking: false`), and `ClientSideSuspense`; canvas placeholder in `EditorWorkspace` replaced with `CanvasWrapper`; `npm run build` passes.
- `context/feature-specs/12-shape-panel.md` — `types/canvas.ts` extended with `NODE_SHAPES`, `NODE_COLORS`, `SHAPE_DEFAULTS`, `SHAPE_DRAG_TYPE`, `ShapeDragPayload`; `components/editor/shape-panel.tsx` floating pill toolbar (bottom-center via React Flow `Panel`) with six draggable shape buttons (rectangle, diamond, circle, pill, cylinder, hexagon) that set a `application/ghost-shape` drag payload with shape name and default dimensions; `components/editor/canvas-node.tsx` custom `canvasNode` renderer — bordered rectangle with centered label and four directional handles; `canvas-flow.tsx` registers `nodeTypes`, handles `onDragOver`/`onDrop` (converts screen→flow coordinates via `useReactFlow().screenToFlowPosition`, creates node via `onNodesChange([{type:"add",…}])`), IDs generated as `shape-timestamp-counter`; `canvas-wrapper.tsx` wraps `CanvasFlow` in `ReactFlowProvider` so `useReactFlow` is available; `npm run build` passes.

## In Progress

- None.

## Next Up

- Next feature unit from `context/feature-specs/`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Prisma Client wiring (`lib/prisma.ts`): if `DATABASE_URL` starts with `prisma+postgres://`, use Prisma Accelerate (`accelerateUrl` + `@prisma/extension-accelerate`); otherwise use direct PostgreSQL via `@prisma/adapter-pg`. Singleton is cached on `globalThis` outside production for Next.js dev hot reload.
- `prismaDb` (`lib/prisma.ts`): cast of the singleton to `InstanceType<typeof PrismaClient>` for route modules where Turbopack/TypeScript cannot merge Accelerate-extended `findUnique` / transaction signatures with the base client.
- Liveblocks node client (`lib/liveblocks.ts`): lazy factory `getLiveblocks()` defers `new Liveblocks(...)` to request time so `LIVEBLOCKS_SECRET_KEY` is not read during module evaluation (which would cause the build to fail when the env var is absent).

## Session Notes

- shadcn CLI v4 default preset is **Base UI** (`@base-ui/react`) with Nova styling, not Radix; components match current shadcn registry output.
