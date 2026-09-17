import type { BcClient } from "@/lib/bc/client";

export type ScriptKind = "theme" | "seo";

export type ScriptRecord = {
  uuid: string;
  name: string;
  html?: string;
  channel_id?: number;
};

type ScriptListResponse = {
  data?: ScriptRecord[];
};

type ScriptWriteResponse = {
  data?: ScriptRecord;
};

export type CreateScriptInput = {
  name: string;
  description: string;
  html: string;
  channelId: number;
};

export async function listScripts(
  client: BcClient,
  channelId: number,
): Promise<ScriptRecord[]> {
  const response = await client.request<ScriptListResponse>(
    `/v3/content/scripts?channel_id=${channelId}&limit=50`,
  );
  return response.data ?? [];
}

export async function createScript(
  client: BcClient,
  input: CreateScriptInput,
): Promise<ScriptRecord> {
  const response = await client.request<ScriptWriteResponse>(
    "/v3/content/scripts",
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        html: input.html,
        auto_uninstall: true,
        load_method: "default",
        location: "footer",
        visibility: "storefront",
        kind: "script_tag",
        consent_category: "functional",
        enabled: true,
        channel_id: input.channelId,
      }),
    },
  );

  if (!response.data?.uuid) {
    throw new Error("Script create did not return a uuid");
  }

  return response.data;
}

export async function updateScriptHtml(
  client: BcClient,
  uuid: string,
  html: string,
): Promise<void> {
  await client.request(`/v3/content/scripts/${uuid}`, {
    method: "PUT",
    body: JSON.stringify({ html, enabled: true }),
  });
}

export async function deleteScript(
  client: BcClient,
  uuid: string,
): Promise<void> {
  await client.request(`/v3/content/scripts/${uuid}`, { method: "DELETE" });
}
