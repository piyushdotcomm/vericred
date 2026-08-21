import { cookies } from "next/headers";

const COOKIE_NAME = "vericred_issuer";

export function getIssuerSession(): string | null {
  const cookie = cookies().get(COOKIE_NAME);
  return cookie?.value ?? null;
}
