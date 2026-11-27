import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "offup_admin";

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedAdminCookieValue(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256Hex(password);
}

export async function assertAdmin(): Promise<void> {
  const expected = await expectedAdminCookieValue();
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!expected || cookie !== expected) {
    throw new Error("관리자 인증이 필요합니다.");
  }
}
