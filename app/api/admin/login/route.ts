import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "mawuli_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function signature(payload: string, password: string): string {
  return createHmac("sha256", password).update(payload).digest("hex");
}

function isValidSession(value: string | undefined, password: string): boolean {
  if (!value) return false;
  const [expiresAt, suppliedSignature] = value.split(".");
  if (!expiresAt || !suppliedSignature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  const expected = signature(expiresAt, password);
  const supplied = Buffer.from(suppliedSignature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

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
  const suppliedHash = createHmac("sha256", "portfolio-login").update(String(submitted ?? "")).digest();
  const expectedHash = createHmac("sha256", "portfolio-login").update(password).digest();
  if (!timingSafeEqual(suppliedHash, expectedHash)) {
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = `${expiresAt}.${signature(String(expiresAt), password)}`;
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const authenticated = Boolean(
    password && isValidSession(request.cookies.get(COOKIE_NAME)?.value, password),
  );
  return NextResponse.json({ authenticated }, { status: authenticated ? 200 : 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
