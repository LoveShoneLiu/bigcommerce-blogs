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

    try {
      await applyStorefrontConfig({
        storeHash,
        themePreset: "editorial",
        seoEnabled: true,
      });
    } catch (error) {
      // OAuth succeeded; merchant can repair scripts from the dashboard.
      console.error("Post-install storefront config failed", error);
    }

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
  } catch (error) {
    console.error("App installation failed", error);
    if (isExternal) {
      await notifyExternalInstall(false);
    }
    const message =
      error instanceof Error ? error.message : "Unknown installation error";
    return new NextResponse(
      `App installation failed. Please retry from BigCommerce. (${message})`,
      { status: 400 },
    );
  }
}
