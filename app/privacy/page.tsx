export default function PrivacyPage() {
  return (
    <main className="bd-legal">
      <h1>Privacy Policy</h1>
      <p>
        Blog Style & SEO (“the app”) is a BigCommerce single-click application.
        It is used by store merchants. Shoppers do not create accounts in this
        app.
      </p>
      <h2>Data we store</h2>
      <p>
        When a merchant installs the app we store the store hash, an encrypted
        store API token, OAuth scopes, optional owner email, storefront
        capability details, selected blog theme, SEO preference, and Script
        Manager identifiers needed to update or remove our scripts.
      </p>
      <h2>How we use data</h2>
      <p>
        We use this data only to install, update, repair, or remove storefront
        scripts that style the native blog and add structured data. We do not
        sell merchant or shopper data. Shopper browsing on the storefront loads
        public CSS and JavaScript files and does not send store tokens to this
        app.
      </p>
      <h2>Retention</h2>
      <p>
        On uninstall we delete the scripts we created, invalidate the store
        token, and keep only a minimal audit record that the app was removed.
        Merchants may request deletion of remaining records by contacting the
        support email listed in the BigCommerce app profile.
      </p>
      <h2>Sharing</h2>
      <p>
        Store API requests are sent to BigCommerce. Hosting and database
        providers (currently Vercel and Neon) process data solely to run the
        app.
      </p>
    </main>
  );
}
