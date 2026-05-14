import { shadcn } from "@clerk/ui/themes";

/**
 * Clerk’s built-in shadcn theme: maps Clerk variables to your shadcn/Tailwind tokens
 * (see `@clerk/ui` / Clerk docs). Prefer this over hand-rolled `variables` so behaviour
 * matches Clerk’s tested defaults (e.g. UserButton menus, contrast).
 *
 * Further tweaks: Dashboard branding (logo, etc.), Clerk’s web theme editor, or optional
 * `appearance.options` / `appearance.elements` — not raw colour maps here.
 */
export const clerkAppearance = {
  theme: shadcn,
};
