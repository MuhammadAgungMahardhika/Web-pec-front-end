// src/app/api/set-cookie/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { access_token, refresh_token } = await req.json();
    const decodedAccessToken = jwt.decode(access_token) as jwt.JwtPayload;
    const decodedRefreshToken = jwt.decode(refresh_token) as jwt.JwtPayload;

    if (!decodedAccessToken || !decodedAccessToken.exp) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!decodedRefreshToken || !decodedRefreshToken.exp) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const maxAgeAccessToken =
      decodedAccessToken.exp - Math.floor(Date.now() / 1000);

    const maxAgeRefreshToken =
      decodedAccessToken.exp - Math.floor(Date.now() / 1000);

    cookies().set("access_token", access_token, {
      path: "/",
      domain: "localhost",
      maxAge: maxAgeAccessToken,
      secure: process.env.NODE_ENV === "production",
    });
    cookies().set("refresh_token", refresh_token, {
      path: "/",
      domain: "localhost",
      maxAge: maxAgeRefreshToken,
      secure: process.env.NODE_ENV === "production",
    });

    const response = NextResponse.json({
      message:
        "Token set successfully" +
        "max access token :" +
        maxAgeAccessToken +
        "max refresh token : " +
        maxAgeRefreshToken,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Error setting cookie", error: error },
      { status: 500 }
    );
  }
}
