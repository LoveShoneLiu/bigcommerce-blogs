import { refreshCapability, syncStorefrontScripts } from "@/features/scripts/sync";
import type { ThemePreset } from "@/features/theme/presets";
import {
  getActiveStore,
  saveStoreSettings,
} from "@/lib/tenancy/stores";

export async function applyStorefrontConfig(input: {
  storeHash: string;
  themePreset: ThemePreset;
  seoEnabled: boolean;
}): Promise<void> {
  const store = await getActiveStore(input.storeHash);
  if (!store) {
    throw new Error("Store is not installed");
  }

  const capability = await refreshCapability(store.storeHash, store.accessToken);
  await saveStoreSettings({
    storeHash: store.storeHash,
    themePreset: input.themePreset,
    seoEnabled: input.seoEnabled,
    enabledChannelIds: capability.enabledChannelIds,
  });

  if (capability.capability !== "stencil_blog") {
    return;
  }

  await syncStorefrontScripts({
    storeHash: store.storeHash,
    encryptedAccessToken: store.accessToken,
    capability,
    themePreset: input.themePreset,
    seoEnabled: input.seoEnabled,
    existingScripts: store.scripts,
  });
}
