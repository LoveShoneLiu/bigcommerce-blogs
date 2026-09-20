import Link from "next/link";
import Script from "next/script";
import ApplyBlogTheme from "@/app/dev/preview/apply-blog-theme";
import { isThemePreset, THEME_PRESETS } from "@/features/theme/presets";
import { assertLocalDev } from "@/lib/dev/guard";

export const dynamic = "force-dynamic";

type PreviewProps = {
  searchParams: Promise<{ theme?: string; view?: string }>;
};

const POSTS = [
  {
    title: "Canon EOS R8 Mark II",
    date: "12 March 2026",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80",
    excerpt:
      "Created to explore. What the new body changes for hybrid shooters, and which RF lenses we would pair in store.",
  },
  {
    title: "Memory card buying guide: SD, microSD and CFexpress",
    date: "4 March 2026",
    image:
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1400&q=80",
    excerpt: "Speed class, overflow recording, and what we actually stock for 4K and 8K bodies.",
  },
  {
    title: "Godox on-camera flash for weddings and events",
    date: "18 February 2026",
    image:
      "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=1400&q=80",
    excerpt: "From a first speedlight to a multi-flash kit, decoded for New Zealand shooters.",
  },
  {
    title: "Insta360 X6: the new 360° 8K flagship",
    date: "2 February 2026",
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1400&q=80",
    excerpt: "PanoMind AI Director, deeper waterproofing, and swappable lenses.",
  },
  {
    title: "SmallRig cages, arms, and a rig that stays out of the way",
    date: "21 January 2026",
    image:
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1400&q=80",
    excerpt: "Build a vlogging or cinema cage without doubling the weight of the camera.",
  },
  {
    title: "DJI specials: drones, gimbals, and what is actually in stock",
    date: "8 January 2026",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1400&q=80",
    excerpt: "Aerial kits we can ship from Mt Eden, plus the accessories people forget.",
  },
];

export default async function StorefrontPreviewPage({
  searchParams,
}: PreviewProps) {
  assertLocalDev();
  const params = await searchParams;
  const requestedTheme = params.theme || "editorial";
  const theme = isThemePreset(requestedTheme) ? requestedTheme : "editorial";
  const view = params.view === "post" ? "post" : "list";
  const featured = POSTS[0];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.body.setAttribute("data-bc-blog-theme",${JSON.stringify(theme)});document.body.classList.toggle("bc-blog-post-page",${view === "post"});document.body.classList.toggle("bc-blog-list-page",${view !== "post"});`,
        }}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <link rel="stylesheet" href={`/storefront/themes/${theme}.css`} />
      <Script src="/storefront/blog.js" strategy="afterInteractive" />
      <div className="sf-preview-root">
        <ApplyBlogTheme theme={theme} postPage={view === "post"} />
        <nav className="sf-preview-bar" aria-label="Preview controls">
          <Link href="/dev">Back to mock app</Link>
          {THEME_PRESETS.map((preset) => (
            <Link
              key={preset}
              href={`/dev/preview?theme=${preset}&view=${view}`}
              aria-current={preset === theme ? "page" : undefined}
            >
              {preset}
            </Link>
          ))}
          <Link href={`/dev/preview?theme=${theme}&view=list`}>List</Link>
          <Link href={`/dev/preview?theme=${theme}&view=post`}>Post</Link>
        </nav>
        {view === "list" ? (
          <div className="page-content">
            <ul className="breadcrumbs">
              <li>
                <Link href="/dev/preview">Home</Link>
              </li>
              <li>Blog</li>
            </ul>
            {/* Present so CSS hide can be verified — live Cornerstone also prints this */}
            <h1 className="page-heading">Blog</h1>
            <div className="bc-blog-list">
              {POSTS.map((post, index) => (
                <article
                  key={post.title}
                  className={
                    index === 0
                      ? "blog bc-blog-card bc-blog-featured"
                      : "blog bc-blog-card"
                  }
                >
                  <figure className="blog-post-figure">
                    <img
                      className="blog-thumbnail"
                      src={post.image}
                      alt={post.title}
                    />
                  </figure>
                  <div className="blog-post-body">
                    <header className="blog-header">
                      <p className="blog-date">{post.date}</p>
                      <h2 className="blog-title">
                        <Link href={`/dev/preview?theme=${theme}&view=post`}>
                          {post.title}
                        </Link>
                      </h2>
                    </header>
                    <div className="blog-post">
                      <p>{post.excerpt}</p>
                      <p>
                        <Link href={`/dev/preview?theme=${theme}&view=post`}>
                          Read More
                        </Link>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <ul className="pagination bc-blog-pagination" aria-label="Pagination">
              <li className="pagination-item">
                <a href="#prev" aria-label="Previous">
                  Prev
                </a>
              </li>
              <li className="pagination-item pagination-item--current">
                <a href="#1" aria-current="page">
                  1
                </a>
              </li>
              <li className="pagination-item">
                <a href="#2">2</a>
              </li>
              <li className="pagination-item">
                <a href="#3">3</a>
              </li>
              <li className="pagination-item">
                <a href="#next" aria-label="Next">
                  Next
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <div className="page-content">
            <article className="blog bc-blog-single bc-blog-card">
              <figure className="blog-post-figure">
                <img
                  className="blog-thumbnail"
                  src={featured.image}
                  alt={featured.title}
                />
              </figure>
              <div className="blog-post-body">
                <header className="blog-header">
                  <p className="blog-date">New</p>
                  <h1 className="blog-title">{featured.title}</h1>
                </header>
                <div className="blog-post">
                  <p>
                    Photogear is a Mt Eden camera shop: Canon, Sony, Fujifilm,
                    DJI, Godox, SmallRig. The site is charcoal in the header,
                    white in the aisle, and red when something is new or on
                    bonus.
                  </p>
                  <blockquote>
                    Created to explore. Expert advice, gear in stock, shipped
                    twice a day.
                  </blockquote>
                  <p>
                    Blog posts here should read like in-store notes: which body
                    landed, which card to buy, how to light a wedding — not like
                    a fashion magazine.
                  </p>
                  <p>{featured.excerpt}</p>
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </>
  );
}
