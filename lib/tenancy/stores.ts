import type { Prisma } from "@prisma/client";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export async function upsertInstalledStore(input: {
  storeHash: string;
  accessToken: string;
  scope: string;
  ownerEmail?: string;
}) {
  return prisma.store.upsert({
    where: { storeHash: input.storeHash },
    create: {
      storeHash: input.storeHash,
      accessToken: encryptSecret(input.accessToken),
      scope: input.scope,
      ownerEmail: input.ownerEmail,
    },
    update: {
      accessToken: encryptSecret(input.accessToken),
      scope: input.scope,
      ownerEmail: input.ownerEmail,
      uninstalledAt: null,
    },
  });
}

export async function getActiveStore(storeHash: string) {
  const store = await prisma.store.findUnique({
    where: { storeHash },
    include: { profile: true, settings: true, scripts: true },
  });

  if (!store || store.uninstalledAt || !store.accessToken) {
    return null;
  }

  return store;
}

export function getStoreAccessToken(encryptedToken: string): string {
  return decryptSecret(encryptedToken);
}

export async function markStoreUninstalled(storeHash: string): Promise<void> {
  await prisma.store.updateMany({
    where: { storeHash },
    data: {
      accessToken: "",
      uninstalledAt: new Date(),
    },
  });
}

export async function saveStorefrontProfile(input: {
  storeHash: string;
  stencilEnabled: boolean;
  capability: string;
  capabilityReason: string;
  channelsJson: Prisma.InputJsonValue;
}) {
  return prisma.storefrontProfile.upsert({
    where: { storeHash: input.storeHash },
    create: input,
    update: {
      stencilEnabled: input.stencilEnabled,
      capability: input.capability,
      capabilityReason: input.capabilityReason,
      channelsJson: input.channelsJson,
    },
  });
}

export async function saveStoreSettings(input: {
  storeHash: string;
  themePreset: string;
  seoEnabled: boolean;
  enabledChannelIds: Prisma.InputJsonValue;
}) {
  return prisma.storeSettings.upsert({
    where: { storeHash: input.storeHash },
    create: {
      storeHash: input.storeHash,
      themePreset: input.themePreset,
      seoEnabled: input.seoEnabled,
      enabledChannelIds: input.enabledChannelIds,
    },
    update: {
      themePreset: input.themePreset,
      seoEnabled: input.seoEnabled,
      enabledChannelIds: input.enabledChannelIds,
    },
  });
}

export async function recordInstalledScript(input: {
  storeHash: string;
  channelId: number;
  scriptUuid: string;
  kind: string;
}) {
  return prisma.installedScript.upsert({
    where: {
      storeHash_channelId_kind: {
        storeHash: input.storeHash,
        channelId: input.channelId,
        kind: input.kind,
      },
    },
    create: input,
    update: { scriptUuid: input.scriptUuid },
  });
}

export async function deleteInstalledScripts(
  storeHash: string,
): Promise<void> {
  await prisma.installedScript.deleteMany({ where: { storeHash } });
}
