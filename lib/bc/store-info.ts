import type { BcClient } from "@/lib/bc/client";

export type StoreInfo = {
  name?: string;
  default_channel_id?: number;
  features?: {
    stencil_enabled?: boolean;
  };
};

export async function getStoreInfo(client: BcClient): Promise<StoreInfo> {
  return client.request<StoreInfo>("/v2/store");
}
