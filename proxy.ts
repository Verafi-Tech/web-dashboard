import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRedirectForRequest } from "@/lib/auth/route-guard";

export default auth((req) => {
  const redirectPath = getRedirectForRequest(
    req.nextUrl.pathname,
    req.auth
      ? {
          activeOrganisationId: req.auth.activeOrganisationId,
          activeOrganisationRole: req.auth.activeOrganisationRole,
        }
      : null
  );

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
