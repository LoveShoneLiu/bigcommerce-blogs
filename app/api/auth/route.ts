import { NextRequest, NextResponse } from "next/server";
import { applyStorefrontConfig } from "@/features/install/complete-install";
import { exchangeAuthCode, notifyExternalInstall, parseStoreHash } from "@/lib/bc/oauth";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE, sessionCookieOptions, signAppContext } from "@/lib/session";
import { upsertInstalledStore } from "@/lib/tenancy/stores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isExternal = Boolean(searchParams.get("external_install"));

  try {
    const token = await exchangeAuthCode({
      code: searchParams.get("code"),
      scope: searchParams.get("scope"),
      context: searchParams.get("context"),
      external_install: searchParams.get("external_install"),
    });

    const storeHash = parseStoreHash(token.context);
    await upsertInstalledStore({
      storeHash,
      accessToken: token.access_token,
      scope: token.scope,
      ownerEmail: token.user?.email,
    });

    await applyStorefrontConfig({
      storeHash,
      themePreset: "editorial",
      seoEnabled: true,
    });

    if (isExternal) {
      await notifyExternalInstall(true);
    }

    const context = await signAppContext({
      storeHash,
      userEmail: token.user?.email,
    });
    const destination = new URL("/", getEnv().appUrl);
    destination.searchParams.set("context", context);
    const response = NextResponse.redirect(destination);
    response.cookies.set(SESSION_COOKIE, context, sessionCookieOptions());
    return response;
  } catch {
    if (isExternal) {
      await notifyExternalInstall(false);
    }
    return new NextResponse("App installation failed. Please retry from BigCommerce.", {
      status: 400,
    });
  }
}
