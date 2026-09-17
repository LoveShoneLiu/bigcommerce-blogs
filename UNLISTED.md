# Unlisted app submission checklist

This app is intended to be **Unlisted**: installable by any BigCommerce merchant via URL, not listed on the App Marketplace.

Unlisted status requires BigCommerce approval. Draft apps can only be installed on stores owned by the same Developer Portal email.

## Before you submit

- [ ] Production app hosted on HTTPS (Vercel)
- [ ] Neon Postgres `DATABASE_URL` and `DIRECT_URL` set in Vercel
- [ ] Developer Portal callbacks:

  - Auth: `https://<app>/api/auth`
  - Load: `https://<app>/api/load`
  - Uninstall: `https://<app>/api/uninstall`
  - Remove user: `https://<app>/api/remove-user`

- [ ] Scopes are limited to Content modify, Information read-only, Channel Settings read-only (no Modify All)
- [ ] Privacy policy URL: `https://<app>/privacy`
- [ ] Terms of service URL: `https://<app>/terms`
- [ ] Support contact email in the app profile
- [ ] App name, summary, and category filled in
- [ ] Test instructions for reviewers (below)
- [ ] Confirm you are (or can become) an approved BigCommerce partner
- [ ] Email `appstore@bigcommerce.com` to request Unlisted availability

## Install URL (after Unlisted approval)

`https://login.bigcommerce.com/app/<CLIENT_ID>/install`

## Test instructions for reviewers

1. Install the app on a Stencil development store that has at least one blog post.
2. Confirm the control-panel iframe shows **Supported**.
3. Choose a theme preset, leave SEO enabled, and save.
4. Open `/blog` and a blog post URL on the storefront. Layout should change; product and category pages should not pick up the blog theme.
5. View the blog post HTML for `BlogPosting` JSON-LD (`data-bc-blog-seo`).
6. In Script Manager, delete the app scripts, reload the app, and use **Repair installation**.
7. Uninstall the app and confirm those scripts are gone.
8. Optional: install on a Catalyst or Blueprint store and confirm the app explains that styling is limited or unavailable without writing invalid scripts.

## Notes for review

- Store tokens are encrypted at rest with AES-256-GCM.
- Storefront CSS/JS are public static files and do not contain secrets.
- The app does not modify checkout.
