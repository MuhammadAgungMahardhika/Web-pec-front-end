import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "../middleware/authMiddleware";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // return NextResponse.redirect(new URL("/login", request.url));

  const authResponse = authMiddleware(request);
  if (authResponse.status !== 200) return authResponse;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*", // Terapkan middleware pada semua rute di bawah /dashboard
    "/transaction/:path*", // Terapkan middleware pada semua rute di bawah /profile
    "/", // Terapkan middleware pada halaman utama
  ],
};
