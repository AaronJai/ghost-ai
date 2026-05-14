import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getSignInPath, getSignUpPath } from "@/lib/auth-routes";

const signInPath = getSignInPath();
const signUpPath = getSignUpPath();

const isPublicRoute = createRouteMatcher([
  `${signInPath}(.*)`,
  `${signUpPath}(.*)`,
]);

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

  await auth.protect();
});

export const proxy = clerkAuth;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
