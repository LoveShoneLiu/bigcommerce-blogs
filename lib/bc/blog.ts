import type { BcClient } from "@/lib/bc/client";

type BlogListPayload = {
  data?: unknown[];
};

function readPosts(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as BlogListPayload).data;
    return Array.isArray(data) ? data : [];
  }
  return [];
}

export async function storeHasBlogPosts(client: BcClient): Promise<boolean> {
  try {
    const response = await client.request<unknown>("/v2/blog/posts?limit=1");
    return readPosts(response).length > 0;
  } catch {
    return false;
  }
}
