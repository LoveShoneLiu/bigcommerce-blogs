import type { ThemePreset } from "@/features/theme/presets";
import { getEnv } from "@/lib/env";

const INTER_FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";

export function storefrontAssetUrls(preset: ThemePreset) {
  const { appUrl, assetVersion } = getEnv();
  const query = `v=${encodeURIComponent(assetVersion)}`;
  return {
    css: `${appUrl}/storefront/themes/${preset}.css?${query}`,
    js: `${appUrl}/storefront/blog.js?${query}`,
    font: INTER_FONT_HREF,
  };
}

export function buildThemeScriptHtml(preset: ThemePreset): string {
  const { css, js, font } = storefrontAssetUrls(preset);
  const safePreset = preset.replace(/[^a-z]/g, "");

  return `
<script>
(function () {
  var pageType = '{{page_type}}';
  if (pageType !== 'blog' && pageType !== 'blog_post') return;
  document.body.setAttribute('data-bc-blog-theme', '${safePreset}');
  if (pageType === 'blog_post') {
    document.body.classList.add('bc-blog-post-page');
  } else {
    document.body.classList.add('bc-blog-list-page');
  }
  if (!document.getElementById('bc-blog-font-preconnect')) {
    var pre1 = document.createElement('link');
    pre1.id = 'bc-blog-font-preconnect';
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pre1);
    var pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    document.head.appendChild(pre2);
  }
  if (!document.getElementById('bc-blog-font')) {
    var fontLink = document.createElement('link');
    fontLink.id = 'bc-blog-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = ${JSON.stringify(font)};
    document.head.appendChild(fontLink);
  }
  if (!document.getElementById('bc-blog-theme-css')) {
    var link = document.createElement('link');
    link.id = 'bc-blog-theme-css';
    link.rel = 'stylesheet';
    link.href = ${JSON.stringify(css)};
    document.head.appendChild(link);
  }
  if (!document.getElementById('bc-blog-theme-js')) {
    var script = document.createElement('script');
    script.id = 'bc-blog-theme-js';
    script.src = ${JSON.stringify(js)};
    script.defer = true;
    document.head.appendChild(script);
  }
})();
</script>
`.trim();
}
