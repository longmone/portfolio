import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_SECONDS,
  createAdminSession,
  isAdminRequest,
  isPasswordValid,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Admin login is not configured on this deployment." }, { status: 503 });
  }

  let submitted: unknown;
  try {
    submitted = (await request.json()).password;
  } catch {
    return NextResponse.json({ error: "Enter a valid password." }, { status: 400 });
  }
  if (!isPasswordValid(submitted, password)) {
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }

  const token = createAdminSession(password);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const authenticated = Boolean(password && isAdminRequest(request));
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
