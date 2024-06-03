import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "../middleware/authMiddleware";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const authResponse = authMiddleware(request);
  if (authResponse.status !== 200) return authResponse;

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/", // Terapkan middleware pada halaman utama
    "/transaction", // Terapkan middleware pada semua rute di bawah /transaction
  ],
};
