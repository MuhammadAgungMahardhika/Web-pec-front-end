import { NextRequest, NextResponse } from "next/server";
import isJwtTokenExpired, { decode } from "jwt-check-expiry";
import jwt from "jsonwebtoken";

const secretKey: string = process.env.SECRET_KEY as string;

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
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  console.log("Secret Key:", secretKey);
  console.log("access to : " + accessToken);
  console.log("refresh to : " + refreshToken);
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // if (isTokenExpired(accessToken)) {
  //   const endpoint: string = process.env.AUTHSERVICE_URL || "";

  //   try {
  //     console.log("token expired detected");
  //     const response = await fetch(endpoint + "/refresh", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${refreshToken}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       return NextResponse.redirect(new URL("/login", req.url));
  //     }

  //     const { access_token, refresh_token } = await response.json();

  //     const res = NextResponse.next();
  //     res.headers.set(
  //       "Set-Cookie",
  //       `access_token=${access_token}; Path=/; HttpOnly; Secure=${
  //         process.env.NODE_ENV !== "development"
  //       }`
  //     );
  //     res.headers.set(
  //       "Set-Cookie",
  //       `refresh_token=${refresh_token}; Path=/; HttpOnly; Secure=${
  //         process.env.NODE_ENV !== "development"
  //       }`
  //     );
  //     console.log("new token");
  //     return res;
  //   } catch (error) {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }
  // }

  return NextResponse.next();
}
