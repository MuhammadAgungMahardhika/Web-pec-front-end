import { NextRequest, NextResponse } from "next/server";
import isJwtTokenExpired, { decode } from "jwt-check-expiry";

export async function authMiddleware(req: NextRequest) {
  const token: any = req.cookies.get("token");
  const refreshToken: any = req.cookies.get("refreshToken");
  const endpoint: string = "http://localhost:8081/api";

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  // Function to decode the token and check its expiry
  const isTokenExpired = (token: any) => {
    try {
      const isExpired = isJwtTokenExpired(token);

      return isExpired;
    } catch (error) {
      return true;
    }
  };

  // Check if the token is expired
  if (isTokenExpired(token)) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const response = await fetch(new URL(endpoint + "/refresh", req.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      // If the refresh token is invalid, redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { newToken, newRefreshToken } = await response.json();

    // Set the new access token in the cookies
    const res = NextResponse.next();
    res.cookies.set("token", newToken, { path: "/", httpOnly: true });
    res.cookies.set("refresh_token", newRefreshToken, {
      path: "/",
      httpOnly: true,
    });
    return res;
  }

  return NextResponse.next();
}
