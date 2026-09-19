import type { Prisma } from "@prisma/client";
import { storeHasBlogPosts } from "@/lib/bc/blog";
import {
  getStorefrontChannels,
  isActiveStorefront,
  type StorefrontChannel,
} from "@/lib/bc/channels";
import { createBcClient } from "@/lib/bc/client";
import {
  createScript,
  deleteScript,
  getScript,
  listScripts,
  updateScriptHtml,
} from "@/lib/bc/scripts";
import { getStoreInfo } from "@/lib/bc/store-info";
import type { CapabilityResult } from "@/features/detect/capability";
import { detectCapability } from "@/features/detect/capability";
import { buildSeoScriptHtml } from "@/features/seo/template";
import { buildThemeScriptHtml } from "@/features/theme/assets";
import type { ThemePreset } from "@/features/theme/presets";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  deleteInstalledScripts,
  getStoreAccessToken,
  recordInstalledScript,
  saveStorefrontProfile,
} from "@/lib/tenancy/stores";

const THEME_SCRIPT_NAME = "Blog Style SEO Theme";
const SEO_SCRIPT_NAME = "Blog Style SEO Structured Data";

export type ScriptHealth = {
  missing: boolean;
  outdated: boolean;
  details: string[];
};

export async function refreshCapability(
  storeHash: string,
  encryptedAccessToken: string,
): Promise<CapabilityResult> {
  let accessToken: string;
  try {
    accessToken = getStoreAccessToken(encryptedAccessToken);
  } catch (error) {
    throw new Error(
      `Cannot decrypt the store token. Set TOKEN_ENCRYPTION_KEY on Vercel to the same 64-hex value used at install, redeploy, then reinstall. (${error instanceof Error ? error.message : "decrypt failed"})`,
    );
  }

  const client = createBcClient(storeHash, accessToken);
  const store = await getStoreInfo(client);

  let channels: StorefrontChannel[] = [];
  try {
    channels = await getStorefrontChannels(client);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "channels request failed";
    const result = detectCapability(store, []);
    return {
      ...result,
      capability: "unsupported",
      reason: `Could not read storefront channels (${detail}). In Developer Portal, enable Channel Settings read-only and Content modify, Save, then uninstall and reinstall the app so BigCommerce re-grants scopes.`,
      enabledChannelIds: [],
    };
  }

  const hasPosts = await storeHasBlogPosts(client);
  const result = detectCapability(store, channels);
  const reason =
    result.capability === "stencil_blog" && !hasPosts
      ? `${result.reason} No blog posts were found yet; styling will apply when posts exist.`
      : result.reason;
  await saveStorefrontProfile({
    storeHash,
    stencilEnabled: result.stencilEnabled,
    capability: result.capability,
    capabilityReason: reason,
    channelsJson: result.channels as Prisma.InputJsonValue,
  });
  return { ...result, reason };
}

export async function syncStorefrontScripts(input: {
  storeHash: string;
  encryptedAccessToken: string;
  capability: CapabilityResult;
  themePreset: ThemePreset;
  seoEnabled: boolean;
  existingScripts: Array<{
    channelId: number;
    kind: string;
    scriptUuid: string;
  }>;
}): Promise<void> {
  if (input.capability.capability !== "stencil_blog") {
    return;
  }

  const client = createBcClient(
    input.storeHash,
    getStoreAccessToken(input.encryptedAccessToken),
  );
  const channelId = input.capability.enabledChannelIds[0];
  if (!channelId) {
    return;
  }

  await upsertNamedScript({
    storeHash: input.storeHash,
    client,
    channelId,
    kind: "theme",
    name: THEME_SCRIPT_NAME,
    description: "Loads blog CSS and a small enhancement script on blog pages.",
    html: buildThemeScriptHtml(input.themePreset),
    existingUuid: findUuid(input.existingScripts, channelId, "theme"),
  });

  if (input.seoEnabled) {
    await upsertNamedScript({
      storeHash: input.storeHash,
      client,
      channelId,
      kind: "seo",
      name: SEO_SCRIPT_NAME,
      description: "Adds BlogPosting and breadcrumb structured data on blog pages.",
      html: buildSeoScriptHtml(),
      existingUuid: findUuid(input.existingScripts, channelId, "seo"),
    });
  } else {
    const seoUuid = findUuid(input.existingScripts, channelId, "seo");
    if (seoUuid) {
      try {
        await deleteScript(client, seoUuid);
      } catch {
        // Already removed in Script Manager.
      }
      await prisma.installedScript.deleteMany({
        where: {
          storeHash: input.storeHash,
          channelId,
          kind: "seo",
        },
      });
    }
  }
}

export async function inspectScriptHealth(input: {
  storeHash: string;
  encryptedAccessToken: string;
  capability: CapabilityResult;
  seoEnabled: boolean;
  existingScripts: Array<{
    channelId: number;
    kind: string;
    scriptUuid: string;
  }>;
}): Promise<ScriptHealth> {
  if (input.capability.capability !== "stencil_blog") {
    return { missing: false, outdated: false, details: [] };
  }

  const channelId = input.capability.enabledChannelIds[0];
  if (!channelId) {
    return { missing: false, outdated: false, details: [] };
  }

  const client = createBcClient(
    input.storeHash,
    getStoreAccessToken(input.encryptedAccessToken),
  );
  const remote = await listScripts(client, channelId);
  const remoteById = new Map(remote.map((script) => [script.uuid, script]));
  const details: string[] = [];

  const themeUuid = findUuid(input.existingScripts, channelId, "theme");
  const themeRemote = themeUuid ? remoteById.get(themeUuid) : undefined;
  if (!themeUuid || !themeRemote) {
    details.push("Theme script is missing from Script Manager.");
  }

  if (input.seoEnabled) {
    const seoUuid = findUuid(input.existingScripts, channelId, "seo");
    if (!seoUuid || !remoteById.has(seoUuid)) {
      details.push("SEO script is missing from Script Manager.");
    }
  }

  const assetVersion = getEnv().assetVersion;
  let themeHtml = themeRemote?.html || "";
  if (themeRemote && !themeHtml && themeUuid) {
    try {
      const full = await getScript(client, themeUuid);
      themeHtml = full?.html || "";
    } catch {
      themeHtml = "";
    }
  }

  // Only treat as outdated when we can read the script HTML and the
  // current deploy token is absent. Empty HTML means "unknown", not stale.
  const outdated =
    Boolean(themeRemote) &&
    themeHtml.length > 0 &&
    !themeHtml.includes(`v=${encodeURIComponent(assetVersion)}`) &&
    !themeHtml.includes(`v=${assetVersion}`);

  if (outdated) {
    details.push("Storefront assets were redeployed; scripts will refresh.");
  }

  return {
    missing: details.some((detail) => detail.includes("missing")),
    outdated,
    details,
  };
}

export async function removeStorefrontScripts(input: {
  storeHash: string;
  encryptedAccessToken: string;
  existingScripts: Array<{ scriptUuid: string }>;
}): Promise<void> {
  if (!input.encryptedAccessToken) {
    await deleteInstalledScripts(input.storeHash);
    return;
  }

  const client = createBcClient(
    input.storeHash,
    getStoreAccessToken(input.encryptedAccessToken),
  );

  await Promise.all(
    input.existingScripts.map(async (script) => {
      try {
        await deleteScript(client, script.scriptUuid);
      } catch {
        // Script Manager may already be empty after auto_uninstall.
      }
    }),
  );

  await deleteInstalledScripts(input.storeHash);
}

export function otherStorefronts(
  channels: StorefrontChannel[],
  enabledChannelIds: number[],
): StorefrontChannel[] {
  const enabled = new Set(enabledChannelIds);
  return channels.filter(
    (channel) => isActiveStorefront(channel) && !enabled.has(channel.id),
  );
}

function findUuid(
  existing: Array<{ channelId: number; kind: string; scriptUuid: string }>,
  channelId: number,
  kind: string,
): string | undefined {
  return existing.find(
    (script) => script.channelId === channelId && script.kind === kind,
  )?.scriptUuid;
}

async function upsertNamedScript(input: {
  storeHash: string;
  client: ReturnType<typeof createBcClient>;
  channelId: number;
  kind: "theme" | "seo";
  name: string;
  description: string;
  html: string;
  existingUuid?: string;
}) {
  if (input.existingUuid) {
    try {
      await updateScriptHtml(input.client, input.existingUuid, input.html);
      await recordInstalledScript({
        storeHash: input.storeHash,
        channelId: input.channelId,
        scriptUuid: input.existingUuid,
        kind: input.kind,
      });
      return;
    } catch {
      // Recreate when the stored uuid was deleted in Script Manager.
    }
  }

  const created = await createScript(input.client, {
    name: input.name,
    description: input.description,
    html: input.html,
    channelId: input.channelId,
  });

  await recordInstalledScript({
    storeHash: input.storeHash,
    channelId: input.channelId,
    scriptUuid: created.uuid,
    kind: input.kind,
  });
}
