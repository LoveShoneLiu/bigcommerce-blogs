"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bd-shell">
      <h1>Something went wrong</h1>
      <p>Reload the app from the BigCommerce control panel and try again.</p>
      <button className="bd-button" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
