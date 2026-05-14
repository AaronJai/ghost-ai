# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Core app wiring after auth (projects, canvas, or API)

## Current Goal

- Continue with the next feature unit from `context/feature-specs/` or product backlog.

## Completed

- `context/feature-specs/01-design-system.md` — shadcn/ui initialized (Tailwind v4, `components.json`, `tw-animate-css`, `shadcn/tailwind.css`); primitives added: `Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`, `ScrollArea`; `lucide-react` installed; `lib/utils.ts` with `cn()`; dark-only semantic tokens in `app/globals.css` aligned with `context/ui-context.md`; `<html class="dark">` for `dark:` variants. Generated `components/ui/*` left unmodified after install.
- `context/feature-specs/02-editor.md` — `components/editor/editor-navbar.tsx` (fixed-height bar, sidebar toggle with `PanelLeftOpen` / `PanelLeftClose`, empty center and right); `components/editor/project-sidebar.tsx` (overlay sidebar, slide-in, `Projects` header + close, `Tabs` for My Projects / Shared with empty states, full-width `New Project`); `components/editor/editor-dialog-pattern.tsx` (`EditorDialogContent`, `EditorDialogFooter`, re-exports for title/description/actions); `components/editor/editor-workspace.tsx` (shell composed into the editor route; see `03-auth` for `/editor`).
- `context/feature-specs/03-auth.md` — `@clerk/ui` added; root `ClerkProvider` with `dark` theme from `@clerk/ui/themes` and appearance variables mapped to app CSS custom properties (`lib/clerk-appearance.ts`); `proxy.ts` at project root with `clerkMiddleware`, public routes derived from `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (path fallbacks `/sign-in`, `/sign-up`), default protection elsewhere; `/` redirects signed-in users to `/editor` and signed-out to sign-in; `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]` with minimal two-panel `AuthGateLayout` (marketing panel `lg+` only); editor shell at `app/editor/page.tsx`; `UserButton` in navbar right using shared appearance.

## In Progress

- None.

## Next Up

- Prisma / projects persistence, Liveblocks canvas, or whichever unit is next in `context/feature-specs/`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- shadcn CLI v4 default preset is **Base UI** (`@base-ui/react`) with Nova styling, not Radix; components match current shadcn registry output.
