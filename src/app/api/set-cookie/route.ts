// src/app/api/set-cookie/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    cookies().set("token", token, {
      path: "/",
      domain: "localhost",
      maxAge: 300,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const response = NextResponse.json({ message: "Token set successfully" });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Error setting cookie", error: error },
      { status: 500 }
    );
  }
}
