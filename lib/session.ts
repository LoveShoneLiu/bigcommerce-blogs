import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

export const SESSION_COOKIE = "bc_blog_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 2;

export type AppSession = {
  storeHash: string;
  userEmail?: string;
};

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getEnv().bcClientSecret);
}

export async function signAppContext(session: AppSession): Promise<string> {
  return new SignJWT({
    storeHash: session.storeHash,
    userEmail: session.userEmail,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyAppContext(
  token: string | null | undefined,
): Promise<AppSession> {
  if (!token) {
    throw new Error("Missing app context");
  }

  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });
  const storeHash = payload.storeHash;

  if (typeof storeHash !== "string" || !storeHash) {
    throw new Error("Invalid app context");
  }

  return {
    storeHash,
    userEmail:
      typeof payload.userEmail === "string" ? payload.userEmail : undefined,
  };
}

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
