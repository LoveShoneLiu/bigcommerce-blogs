import { getAuthRedirectUri, getEnv } from "@/lib/env";

export type OAuthTokenResponse = {
  access_token: string;
  scope: string;
  context: string;
  account_uuid?: string;
  user?: {
    id: number;
    username?: string;
    email?: string;
  };
};

export type AuthCallbackInput = {
  code?: string | null;
  scope?: string | null;
  context?: string | null;
  external_install?: string | null;
};

export function parseStoreHash(context: string): string {
  const match = context.match(/^stores\/([a-z0-9]+)$/i);
  if (!match) {
    throw new Error("Invalid store context");
  }
  return match[1];
}

export async function exchangeAuthCode(
  input: AuthCallbackInput,
): Promise<OAuthTokenResponse> {
  if (!input.code || !input.scope || !input.context) {
    throw new Error("OAuth callback is missing code, scope, or context");
  }

  const env = getEnv();
  const body = new URLSearchParams({
    client_id: env.bcClientId,
    client_secret: env.bcClientSecret,
    code: input.code,
    scope: input.scope,
    grant_type: "authorization_code",
    redirect_uri: getAuthRedirectUri(),
    context: input.context,
  });

  const response = await fetch("https://login.bigcommerce.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OAuthTokenResponse;
  if (!payload.access_token || !payload.context) {
    throw new Error("Token exchange returned an incomplete response");
  }

  return payload;
}

export async function notifyExternalInstall(succeeded: boolean): Promise<void> {
  const { bcClientId } = getEnv();
  const result = succeeded ? "succeeded" : "failed";
  await fetch(
    `https://login.bigcommerce.com/app/${bcClientId}/install/${result}`,
    { cache: "no-store" },
  );
}
