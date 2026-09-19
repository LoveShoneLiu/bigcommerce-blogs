import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import DashboardForm from "@/app/dashboard-form";
import {
  inspectScriptHealth,
  otherStorefronts,
  refreshCapability,
} from "@/features/scripts/sync";
import { isThemePreset, type ThemePreset } from "@/features/theme/presets";
import type { StorefrontChannel } from "@/lib/bc/channels";
import { isLocalDev } from "@/lib/dev/guard";
import { SESSION_COOKIE, verifyAppContext } from "@/lib/session";
import { getActiveStore } from "@/lib/tenancy/stores";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ context?: string; error?: string }>;
};

function Message({ children }: { children: ReactNode }) {
  return (
    <main className="bd-shell">
      <h1>Blog Style & SEO</h1>
      {children}
    </main>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = params.context || cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return (
      <Message>
        <p>
          Open this app from the BigCommerce control panel after installing it.
          Shoppers never install anything; this screen is for merchants only.
        </p>
        {isLocalDev() ? (
          <p>
            Local preview: <Link href="/dev">mock merchant app</Link>
            {" · "}
            <Link href="/dev/preview">mock storefront blog</Link>
          </p>
        ) : null}
      </Message>
    );
  }

  let session: { storeHash: string } | null = null;
  try {
    session = await verifyAppContext(token);
  } catch {
    session = null;
  }

  if (!session) {
    return (
      <Message>
        <p>
          The session is invalid or expired. Open the app again from Apps in
          the BigCommerce control panel.
        </p>
      </Message>
    );
  }

  const store = await getActiveStore(session.storeHash);
  if (!store) {
    return (
      <Message>
        <p>This store does not have an active installation.</p>
      </Message>
    );
  }

  let capability;
  let health: { missing: boolean; details: string[] } = {
    missing: false,
    details: [],
  };
  try {
    capability = await refreshCapability(store.storeHash, store.accessToken);
    health =
      capability.capability === "stencil_blog"
        ? await inspectScriptHealth({
            storeHash: store.storeHash,
            encryptedAccessToken: store.accessToken,
            capability,
            seoEnabled: store.settings?.seoEnabled ?? true,
            existingScripts: store.scripts,
          })
        : { missing: false, details: [] };
  } catch (error) {
    console.error("Dashboard capability refresh failed", error);
    const detail =
      error instanceof Error ? error.message : "Unknown dashboard error";
    return (
      <Message>
        <p>The app is installed, but reading store settings failed.</p>
        <p className="bd-muted">{detail}</p>
        <p>
          Most often this means Developer Portal scopes are incomplete, or
          TOKEN_ENCRYPTION_KEY on Vercel does not match the key used at
          install. Fix scopes or the key, redeploy if needed, then uninstall
          and reinstall.
        </p>
      </Message>
    );
  }

  const storedPreset = store.settings?.themePreset || "";
  const themePreset: ThemePreset = isThemePreset(storedPreset)
    ? storedPreset
    : "editorial";
  const seoEnabled = store.settings?.seoEnabled ?? true;

  const channels = capability.channels as StorefrontChannel[];
  const enabled = channels.find(
    (channel) => channel.id === capability.enabledChannelIds[0],
  );

  return (
    <main className="bd-shell">
      <header className="bd-header">
        <h1>Blog Style & SEO</h1>
        <p>
          Beautify the native storefront blog and add crawlable structured
          data. This does not change checkout or product pages.
        </p>
      </header>
      {params.error ? (
        <section className="bd-banner is-bad" role="alert">
          <p className="bd-kicker">Action failed</p>
          <p>{params.error}</p>
        </section>
      ) : null}
      <DashboardForm
        context={token}
        capability={capability.capability}
        reason={capability.reason}
        canConfigure={capability.capability === "stencil_blog"}
        themePreset={themePreset}
        seoEnabled={seoEnabled}
        scriptsMissing={health.missing}
        scriptDetails={health.details}
        enabledChannelName={enabled?.name}
        otherChannels={otherStorefronts(
          channels,
          capability.enabledChannelIds,
        )}
      />
    </main>
  );
}
