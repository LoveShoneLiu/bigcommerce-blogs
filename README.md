# Blog Style & SEO

BigCommerce single-click app that restyles the native Stencil blog and adds structured data. Merchants install it; shoppers only load public CSS/JS on blog pages.

This repo is set up for **Vercel** hosting and **Neon Postgres**.

## Architecture

- Thin Node server: OAuth callbacks, encrypted token storage, Scripts API writes
- Static storefront assets in `public/storefront/`
- Native BigCommerce blog HTML is not replaced

## Local setup

1. Create a Neon database (Vercel Storage → Postgres, or Neon console).
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to the Neon **pooled** URL and `DIRECT_URL` to the **direct** URL.
4. Generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -hex 32`.
5. Create a Draft app in the [BigCommerce Developer Portal](https://devtools.bigcommerce.com/).
6. Expose local HTTPS (ngrok or Cloudflare Tunnel) and set:

- Auth callback: `https://<host>/api/auth`
- Load callback: `https://<host>/api/load`
- Uninstall callback: `https://<host>/api/uninstall`
- Remove user callback: `https://<host>/api/remove-user`

7. Request only these scopes:

- Content: modify (`store_v2_content`)
- Information & Settings: read-only (`store_v2_information_read_only`)
- Channel Settings: read-only (`store_channel_settings_read_only`)

8. Install dependencies and migrate:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Set `APP_URL` to the public HTTPS origin (the tunnel URL while developing).

Draft apps install only on stores owned by the same email as the Developer Portal account.

## Vercel + Neon

1. Import this repo into Vercel.
2. Add a Neon Postgres store to the project (Vercel Marketplace) or paste Neon URLs.
3. Map environment variables:

- `DATABASE_URL` ← Neon pooled URL (`POSTGRES_PRISMA_URL` or pooler host)
- `DIRECT_URL` ← Neon direct URL (`POSTGRES_URL_NON_POOLING`)
- `APP_URL` ← `https://<your-vercel-domain>`
- `BC_CLIENT_ID`, `BC_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`

4. Deploy. The build runs `prisma migrate deploy` then `next build`.
5. Update Developer Portal callback URLs to the Vercel domain.

Unlisted (any merchant) submission steps are in [UNLISTED.md](UNLISTED.md).

## Merchant UI

After install, open the app from the control panel. Stencil stores can pick a theme and toggle SEO. Unsupported storefronts show why styling is skipped.
