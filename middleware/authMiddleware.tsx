import { NextRequest, NextResponse } from "next/server";
import isJwtTokenExpired, { decode } from "jwt-check-expiry";
import jwt from "jsonwebtoken";

const secretKey: string = process.env.SECRET_KEY as string;
console.log("Secret Key:", secretKey);

const isTokenValid = (accessToken: string): boolean => {
  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [header, payload, signature] = parts;

  try {
    // Verify signature
    const expectedSignature = jwt.sign(`${header}.${payload}`, secretKey, {
      algorithm: "HS256",
    });
    if (signature !== expectedSignature) {
      return false;
    }

    // Verify expiration
    const { exp } = JSON.parse(Buffer.from(payload, "base64").toString());
    if (exp && Date.now() >= exp * 1000) {
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Token tidak valid:", error.message);
    return false;
  }
};

const isTokenExpired = (token: any) => {
  try {
    const isExpired = isJwtTokenExpired(token);
    console.log(isExpired);
    return isExpired;
  } catch (error) {
    return true;
  }
};

export function authMiddleware(req: NextRequest) {
  const accessToken: any = req.cookies.get("access_token")?.value;
  const refreshToken: any = req.cookies.get("refresh_token")?.value;
  console.log("Access Tokens:", accessToken);
  // const endpoint: string = process.env.AUTHSERVICE_URL;

  // Function to decode the token and check its expiry

  // if (!accessToken || !refreshToken) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  if (accessToken != undefined) {
    if (!isTokenValid(accessToken)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if the token is expired
  // if (!isTokenExpired(token)) {
  //   if (!refreshToken) {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }

  //   const response = await fetch(new URL(endpoint + "/refresh", req.url), {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${refreshToken}`,
  //     },
  //   });

  //   if (!response.ok) {
  //     // If the refresh token is invalid, redirect to login
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }

  //   const { access_token, refresh_token } = await response.json();

  //   // Set the new access token in the cookies
  //   const res = NextResponse.next();
  //   res.cookies.set("access_token", access_token, {
  //     path: "/",
  //     httpOnly: true,
  //   });
  //   res.cookies.set("refresh_token", refresh_token, {
  //     path: "/",
  //     httpOnly: true,
  //   });
  //   return res;
  // }

  return NextResponse.next();
}
