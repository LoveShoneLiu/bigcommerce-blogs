import { jwtVerify } from "jose";
import { parseStoreHash } from "@/lib/bc/oauth";
import { getEnv } from "@/lib/env";

export type BcJwtClaims = {
  storeHash: string;
  userEmail?: string;
  ownerEmail?: string;
};

type JwtUser = {
  id?: number;
  email?: string;
};

export async function verifyBcSignedJwt(
  token: string | null | undefined,
): Promise<BcJwtClaims> {
  if (!token) {
    throw new Error("Missing signed_payload_jwt");
  }

  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(getEnv().bcClientSecret),
    { algorithms: ["HS256"] },
  );

  const sub = payload.sub;
  if (typeof sub !== "string") {
    throw new Error("JWT is missing store sub");
  }

  const user = payload.user as JwtUser | undefined;
  const owner = payload.owner as JwtUser | undefined;

  return {
    storeHash: parseStoreHash(sub),
    userEmail: user?.email,
    ownerEmail: owner?.email,
  };
}
