import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getSignInPath, getSignUpPath } from "@/lib/auth-routes";

const normalizeAuthPath = (value: string, fallback: string) => {
  try {
    return new URL(value, "http://localhost").pathname || fallback;
  } catch {
    return fallback;
  }
};

const signInPath = normalizeAuthPath(getSignInPath(), "/sign-in");
const signUpPath = normalizeAuthPath(getSignUpPath(), "/sign-up");

const isPublicRoute = createRouteMatcher([
  `${signInPath}(.*)`,
  `${signUpPath}(.*)`,
]);

/** API route handlers enforce JSON 401/403; skip redirect from `auth.protect()`. */
const isApiRoute = createRouteMatcher(["/api(.*)"]);

const clerkAuth = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (req.nextUrl.pathname === "/") {
    if (userId) {
      return NextResponse.redirect(new URL("/editor", req.url));
    }
    return NextResponse.redirect(new URL(signInPath, req.url));
  }

  if (isPublicRoute(req)) {
    return;
  }

  if (isApiRoute(req)) {
    return;
  }

  await auth.protect();
});

export const proxy = clerkAuth;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
