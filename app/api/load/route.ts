import { NextRequest, NextResponse } from "next/server";
import { verifyBcSignedJwt } from "@/lib/bc/jwt";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE, sessionCookieOptions, signAppContext } from "@/lib/session";
import { getActiveStore } from "@/lib/tenancy/stores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const claims = await verifyBcSignedJwt(
      request.nextUrl.searchParams.get("signed_payload_jwt"),
    );
    const store = await getActiveStore(claims.storeHash);
    if (!store) {
      return new NextResponse("This store does not have an active installation.", {
        status: 404,
      });
    }

    const context = await signAppContext({
      storeHash: claims.storeHash,
      userEmail: claims.userEmail,
    });
    const destination = new URL("/", getEnv().appUrl);
    destination.searchParams.set("context", context);
    const response = NextResponse.redirect(destination);
    response.cookies.set(SESSION_COOKIE, context, sessionCookieOptions());
    return response;
  } catch {
    return new NextResponse("Unable to load the app. Open it from the BigCommerce control panel.", {
      status: 401,
    });
  }
}
