import Link from "next/link";
import DashboardForm from "@/app/dashboard-form";
import { mockRepairAction, mockSaveAction } from "@/app/dev/actions";
import type { ThemePreset } from "@/features/theme/presets";
import { isThemePreset } from "@/features/theme/presets";
import { assertLocalDev } from "@/lib/dev/guard";

export const dynamic = "force-dynamic";

type DevPageProps = {
  searchParams: Promise<{
    capability?: string;
    theme?: string;
    seo?: string;
    repair?: string;
    repaired?: string;
  }>;
};

const CAPABILITIES = [
  "stencil_blog",
  "catalyst_limited",
  "unsupported",
] as const;

type Capability = (typeof CAPABILITIES)[number];

function isCapability(value: string | undefined): value is Capability {
  return (CAPABILITIES as readonly string[]).includes(value || "");
}

const COPY: Record<
  Capability,
  { reason: string; canConfigure: boolean; channel?: string }
> = {
  stencil_blog: {
    reason:
      "Stencil storefront detected. This app can restyle the native blog and add structured data.",
    canConfigure: true,
    channel: "Mock Storefront",
  },
  catalyst_limited: {
    reason:
      "This storefront is Catalyst. First release does not restyle Catalyst blogs.",
    canConfigure: false,
    channel: "Catalyst Storefront",
  },
  unsupported: {
    reason:
      "This store uses a Blueprint theme. The Scripts API cannot load on the storefront.",
    canConfigure: false,
  },
};

export default async function DevMockPage({ searchParams }: DevPageProps) {
  assertLocalDev();
  const params = await searchParams;
  const capability = isCapability(params.capability)
    ? params.capability
    : "stencil_blog";
  const requestedTheme = params.theme || "editorial";
  const themePreset: ThemePreset = isThemePreset(requestedTheme)
    ? requestedTheme
    : "editorial";
  const seoEnabled = params.seo !== "0";
  const scriptsMissing =
    capability === "stencil_blog" &&
    params.repair === "1" &&
    params.repaired !== "1";
  const copy = COPY[capability];

  return (
    <main className="bd-shell">
      <header className="bd-header">
        <p className="bd-kicker">Local mock</p>
        <h1>Blog Style & SEO</h1>
        <p>
          This screen uses fake store data so you can review the merchant UI
          without BigCommerce OAuth or Neon. Saves stay on this URL only.
        </p>
        <p>
          <Link href={`/dev/preview?theme=${themePreset}&view=list`}>
            Preview blog list
          </Link>
          {" · "}
          <Link href={`/dev/preview?theme=${themePreset}&view=post`}>
            Preview blog post
          </Link>
        </p>
        <nav className="bd-dev-nav" aria-label="Mock store types">
          {CAPABILITIES.map((value) => (
            <Link
              key={value}
              href={`/dev?capability=${value}&theme=${themePreset}&seo=${seoEnabled ? "1" : "0"}`}
            >
              {value === "stencil_blog"
                ? "Stencil"
                : value === "catalyst_limited"
                  ? "Catalyst"
                  : "Unsupported"}
            </Link>
          ))}
          <Link
            href={`/dev?capability=stencil_blog&theme=${themePreset}&seo=1&repair=1`}
          >
            Missing scripts
          </Link>
        </nav>
      </header>
      <DashboardForm
        context="mock"
        capability={capability}
        reason={copy.reason}
        canConfigure={copy.canConfigure}
        themePreset={themePreset}
        seoEnabled={seoEnabled}
        scriptsMissing={scriptsMissing}
        scriptDetails={
          scriptsMissing
            ? ["Theme script is missing from Script Manager."]
            : []
        }
        enabledChannelName={copy.channel}
        otherChannels={
          capability === "stencil_blog"
            ? [{ id: 2, name: "B2B storefront", platform: "bigcommerce" }]
            : []
        }
        saveAction={mockSaveAction}
        repairAction={mockRepairAction}
      />
    </main>
  );
}
