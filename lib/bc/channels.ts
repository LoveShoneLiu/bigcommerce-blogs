import type { BcClient } from "@/lib/bc/client";

export type StorefrontChannel = {
  id: number;
  name: string;
  type: string;
  platform: string;
  status: string;
};

type ChannelsResponse = {
  data?: StorefrontChannel[];
};

export async function getStorefrontChannels(
  client: BcClient,
): Promise<StorefrontChannel[]> {
  const response = await client.request<ChannelsResponse>(
    "/v3/channels?type=storefront",
  );
  return response.data ?? [];
}

export function isActiveStorefront(channel: StorefrontChannel): boolean {
  return (
    channel.type === "storefront" &&
    (channel.status === "active" || channel.status === "connected")
  );
}
