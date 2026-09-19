export type AppEnv = {
  appUrl: string;
  bcClientId: string;
  bcClientSecret: string;
  tokenEncryptionKey: string;
  databaseUrl: string;
  assetVersion: string;
};

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Cache-busting token for /storefront CSS+JS.
 * Prefer an explicit override, otherwise use the Vercel git SHA so each
 * deploy gets a new version without manual env edits.
 */
export function resolveAssetVersion(): string {
  const manual = process.env.STOREFRONT_ASSET_VERSION?.trim();
  if (manual) {
    return manual;
  }

  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.CF_PAGES_COMMIT_SHA?.trim();
  if (sha) {
    return sha.slice(0, 7);
  }

  return "dev";
}

export function getEnv(): AppEnv {
  const databaseUrl =
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL (or POSTGRES_PRISMA_URL / POSTGRES_URL from the Vercel Neon integration)",
    );
  }

  const tokenEncryptionKey = readRequired("TOKEN_ENCRYPTION_KEY");
  if (!/^[0-9a-fA-F]{64}$/.test(tokenEncryptionKey)) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters",
    );
  }

  return {
    appUrl: stripTrailingSlash(readRequired("APP_URL")),
    bcClientId: readRequired("BC_CLIENT_ID"),
    bcClientSecret: readRequired("BC_CLIENT_SECRET"),
    tokenEncryptionKey,
    databaseUrl,
    assetVersion: resolveAssetVersion(),
  };
}

export function getAuthRedirectUri(): string {
  return `${getEnv().appUrl}/api/auth`;
}
