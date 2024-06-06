import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "../middleware/authMiddleware";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse.status !== 200) return authResponse;

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/((?!api|login|static|.*\\..*|_next).*)",
};
