import type { ThemePreset } from "@/features/theme/presets";
import { getEnv } from "@/lib/env";

export function storefrontAssetUrls(preset: ThemePreset) {
  const { appUrl, assetVersion } = getEnv();
  const query = `v=${encodeURIComponent(assetVersion)}`;
  return {
    css: `${appUrl}/storefront/themes/${preset}.css?${query}`,
    js: `${appUrl}/storefront/blog.js?${query}`,
  };
}

export function buildThemeScriptHtml(preset: ThemePreset): string {
  const { css, js } = storefrontAssetUrls(preset);
  const safePreset = preset.replace(/[^a-z]/g, "");

  return `
<script>
(function () {
  var pageType = '{{page_type}}';
  if (pageType !== 'blog' && pageType !== 'blog_post') return;
  document.body.setAttribute('data-bc-blog-theme', '${safePreset}');
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
