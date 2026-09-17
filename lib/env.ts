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
    assetVersion: process.env.STOREFRONT_ASSET_VERSION?.trim() || "1",
  };
}

export function getAuthRedirectUri(): string {
  return `${getEnv().appUrl}/api/auth`;
}
