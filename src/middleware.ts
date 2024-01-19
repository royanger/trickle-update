import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: ["/"],
  afterAuth: async (auth, req, evt) => {
    const { userId, sessionClaims } = auth
    console.log('TEST', sessionClaims, req.nextUrl.pathname)
    // For user visiting /sync-user, don't try and redirect
    if (userId && req.nextUrl.pathname === "/sync-user") {
      return NextResponse.next();
    }

    // User isn't signed in and the route is private -- redirect to sign-in
    if (!userId && !auth.isPublicRoute) return redirectToSignIn({ returnBackUrl: req.url })

    // Catch users who doesn't have `onboardingComplete: true` in PublicMetata
    // Redirect them to the /onboading out to complete sync-user
    if (userId && !sessionClaims?.metadata.synced) {
      const onboardingUrl = new URL(`/sync-user?redirect_url=${req.nextUrl}`, req.url);
      return NextResponse.redirect(onboardingUrl)
    }

    // User is logged in and the route is protected - let them view.
    if (userId && !auth.isPublicRoute) return NextResponse.next()

    // If the route is public, anyone can view it.
    if (auth.isPublicRoute) return NextResponse.next()

  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
