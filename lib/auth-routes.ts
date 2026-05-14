/**
 * Resolve sign-in / sign-up URL paths from Clerk env (full URL or pathname).
 * Uses NEXT_PUBLIC_CLERK_SIGN_IN_URL and NEXT_PUBLIC_CLERK_SIGN_UP_URL without renaming.
 */
export function authPathFromEnv(value: string | undefined, fallback: string): string {
  if (!value?.trim()) return fallback;
  const v = value.trim().split("?")[0] ?? fallback;
  if (v.startsWith("/")) return v;
  try {
    return new URL(v).pathname || fallback;
  } catch {
    return fallback;
  }
}

export function getSignInPath(): string {
  return authPathFromEnv(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "/sign-in");
}

export function getSignUpPath(): string {
  return authPathFromEnv(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "/sign-up");
}
