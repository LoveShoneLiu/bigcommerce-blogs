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
      <link rel="stylesheet" href={`/storefront/themes/${theme}.css`} />
      <Script src="/storefront/blog.js" strategy="afterInteractive" />
      <div className="sf-preview-root">
      <ApplyBlogTheme theme={theme} />
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
          <div className="blog">
            {POSTS.map((post, index) => (
              <article
                key={post.title}
                className={
                  index === 0 ? "blog-post bc-blog-featured" : "blog-post"
                }
              >
                <img src={post.image} alt={post.title} />
                <div>
                  <p className="blog-date">{post.date}</p>
                  <h2 className="blog-title">
                    <Link href={`/dev/preview?theme=${theme}&view=post`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p>{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <article className="blog-post page-content">
          <p className="blog-date">New</p>
          <h1 className="blog-post-title">{featured.title}</h1>
          <img src={featured.image} alt={featured.title} />
          <div className="blog-post-body">
            <p>
              Photogear is a Mt Eden camera shop: Canon, Sony, Fujifilm, DJI,
              Godox, SmallRig. The site is charcoal in the header, white in the
              aisle, and red when something is new or on bonus.
            </p>
            <blockquote>
              Created to explore. Expert advice, gear in stock, shipped twice a
              day.
            </blockquote>
            <p>
              Blog posts here should read like in-store notes: which body landed,
              which card to buy, how to light a wedding — not like a fashion
              magazine.
            </p>
            <p>{featured.excerpt}</p>
          </div>
        </article>
      )}
    </div>
    </>
  );
}
