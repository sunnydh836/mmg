import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const publicRoutes = ["/admin/login"];

export async function middleware(request: NextRequest) {
    const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").toLowerCase().split(":")[0];
    const path = request.nextUrl.pathname;
    const search = request.nextUrl.search;

    // 1. Canonical Domain & Alias Redirects (HTTP 308 Permanent Redirect)
    // Redirect www subdomain and Vercel deployment alias to official domain https://mmgpartapur.com
    if (host === "www.mmgpartapur.com" || host === "mmg-zeta.vercel.app") {
        const canonicalUrl = new URL(`https://mmgpartapur.com${path}${search}`);
        return NextResponse.redirect(canonicalUrl, 308);
    }

    // 2. Admin Authentication Checks (Apply only to /admin routes)
    if (!path.startsWith("/admin")) {
        return NextResponse.next();
    }

    const isProtectedRoute = !publicRoutes.includes(path) && path.startsWith("/admin");
    const isPublicRoute = publicRoutes.includes(path);

    const cookie = request.cookies.get("admin_session")?.value;
    const session = await decrypt(cookie);

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
    }

    if (isPublicRoute && session && !request.nextUrl.pathname.startsWith("/admin/login/")) {
        return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
