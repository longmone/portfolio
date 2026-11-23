import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "mawuli_admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

function signature(payload: string, password: string): string {
  return createHmac("sha256", password).update(payload).digest("hex");
}

export function createAdminSession(password: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  return `${expiresAt}.${signature(String(expiresAt), password)}`;
}

export function isAdminRequest(request: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  const value = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!password || !value) return false;

  const [expiresAt, suppliedSignature] = value.split(".");
  if (!expiresAt || !suppliedSignature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedBuffer = Buffer.from(signature(expiresAt, password), "hex");
  const suppliedBuffer = Buffer.from(suppliedSignature, "hex");
  return suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function isPasswordValid(submitted: unknown, password: string): boolean {
  const suppliedHash = createHmac("sha256", "portfolio-login").update(String(submitted ?? "")).digest();
  const expectedHash = createHmac("sha256", "portfolio-login").update(password).digest();
  return timingSafeEqual(suppliedHash, expectedHash);
}
