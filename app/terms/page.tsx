export default function TermsPage() {
  return (
    <main className="bd-legal">
      <h1>Terms of Service</h1>
      <p>
        By installing Blog Style & SEO you allow the app to request the
        documented BigCommerce OAuth scopes and to inject storefront scripts on
        supported Stencil blog pages.
      </p>
      <h2>What the app does</h2>
      <p>
        The app restyles the native BigCommerce blog and may add BlogPosting
        and breadcrumb structured data. It does not replace your theme, edit
        checkout, or guarantee search rankings.
      </p>
      <h2>Merchant responsibilities</h2>
      <p>
        You remain responsible for blog content, theme compatibility, and any
        scripts you delete from Script Manager. Unsupported storefronts
        (Blueprint, Catalyst, or custom headless) may not receive styling.
      </p>
      <h2>Availability</h2>
      <p>
        The app is provided as-is for Draft and Unlisted distribution. We may
        change features as BigCommerce APIs change.
      </p>
      <h2>Uninstall</h2>
      <p>
        Uninstalling removes this app’s scripts from Script Manager when the
        API token is still valid. Theme files you did not grant this app
        permission to edit are never modified.
      </p>
    </main>
  );
}
