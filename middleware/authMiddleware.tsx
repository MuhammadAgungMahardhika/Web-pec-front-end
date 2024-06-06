import { NextRequest, NextResponse } from "next/server";
import isJwtTokenExpired, { decode } from "jwt-check-expiry";

const secretKey: string = process.env.SECRET_KEY as string;

export async function authMiddleware(req: NextRequest) {
  console.log("render");
  const isTokenExpired = (token: any) => {
    try {
      const isExpired = isJwtTokenExpired(token);
      console.log(isExpired);
      return isExpired;
    } catch (error) {
      return true;
    }
  };
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  console.log("Secret Key:", secretKey);
  console.log("access to : " + accessToken);
  console.log("refresh to : " + refreshToken);
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isTokenExpired(accessToken)) {
    const endpoint: string = process.env.AUTHSERVICE_URL || "";

    try {
      console.log("token expired detected");
      const responseNewToken = await fetch(endpoint + "/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!responseNewToken.ok) {
        throw new Error("Failed to refresh token");
      }

      const { access_token, refresh_token } = await responseNewToken.json();
      const newTokenData = {
        access_token: access_token,
        refresh_token: refresh_token,
      };
      const responseSetCookie = await fetch("/api/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTokenData),
      });

      if (!responseSetCookie.ok) {
        const errorData = await responseSetCookie.json();
        throw new Error(errorData.message);
      }

      const data = await responseSetCookie.json();

      console.log(data);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
