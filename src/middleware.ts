import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const publicRoutes = ["/admin/login"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Apply only to /admin routes
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
