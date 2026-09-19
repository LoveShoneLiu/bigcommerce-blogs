import { isActiveStorefront, type StorefrontChannel } from "@/lib/bc/channels";
import type { StoreInfo } from "@/lib/bc/store-info";

export type Capability =
  | "stencil_blog"
  | "catalyst_limited"
  | "unsupported";

export type CapabilityResult = {
  capability: Capability;
  reason: string;
  stencilEnabled: boolean;
  defaultChannelId: number | null;
  enabledChannelIds: number[];
  channels: StorefrontChannel[];
};

export function detectCapability(
  store: StoreInfo,
  channels: StorefrontChannel[],
): CapabilityResult {
  const storefronts = channels.filter(isActiveStorefront);
  const stencilEnabled = Boolean(store.features?.stencil_enabled);
  const defaultChannelId = store.default_channel_id ?? storefronts[0]?.id ?? null;
  const primary =
    storefronts.find((channel) => channel.id === defaultChannelId) ??
    storefronts[0];

  if (!stencilEnabled) {
    return {
      capability: "unsupported",
      reason:
        "This store uses a Blueprint theme. The Scripts API cannot load on the storefront, so blog styling is unavailable.",
      stencilEnabled,
      defaultChannelId,
      enabledChannelIds: [],
      channels: storefronts,
    };
  }

  if (!primary) {
    const found =
      channels.length === 0
        ? "the Channels API returned no storefronts"
        : `found: ${channels
            .map((channel) => `${channel.name} (${channel.status}/${channel.platform})`)
            .join(", ")}`;
    return {
      capability: "unsupported",
      reason: `No usable storefront channel was found on this store (${found}). Dev stores in prelaunch are supported after the latest app update.`,
      stencilEnabled,
      defaultChannelId,
      enabledChannelIds: [],
      channels: storefronts,
    };
  }

  if (primary.platform === "bigcommerce") {
    return {
      capability: "stencil_blog",
      reason:
        "Stencil storefront detected. This app can restyle the native blog and add structured data.",
      stencilEnabled,
      defaultChannelId: primary.id,
      enabledChannelIds: [primary.id],
      channels: storefronts,
    };
  }

  if (primary.platform === "catalyst") {
    return {
      capability: "catalyst_limited",
      reason:
        "This storefront is Catalyst. It does not use Stencil blog templates, Handlebars is unavailable, and scripts may not run on every client-side navigation. First release does not restyle Catalyst blogs.",
      stencilEnabled,
      defaultChannelId: primary.id,
      enabledChannelIds: [],
      channels: storefronts,
    };
  }

  return {
    capability: "unsupported",
    reason: `Headless platform "${primary.platform}" cannot be safely restyled by this app.`,
    stencilEnabled,
    defaultChannelId: primary.id,
    enabledChannelIds: [],
    channels: storefronts,
  };
}
