import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
            // Add custom logic if needed, e.g. check role
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

export const config = {
    matcher: ["/admin/:path*"],
};
