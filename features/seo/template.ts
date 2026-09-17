export function buildSeoScriptHtml(): string {
  return `
{{#if page_type '===' 'blog_post'}}
<script type="application/ld+json" data-bc-blog-seo="post">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{blog.post.title}}",
  "author": {
    "@type": "Person",
    "name": "{{blog.post.author}}"
  },
  "datePublished": "{{blog.post.date_published}}",
  "mainEntityOfPage": "{{blog.post.url}}"
  {{#if blog.post.thumbnail}},"image": "{{blog.post.thumbnail}}"{{/if}}
}
</script>
<script type="application/ld+json" data-bc-blog-seo="breadcrumb">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "{{settings.store_name}}",
      "item": "{{settings.base_url}}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{{blog.post.title}}",
      "item": "{{blog.post.url}}"
    }
  ]
}
</script>
<script>
(function () {
  function typesOf(node) {
    try {
      var data = JSON.parse(node.textContent || '{}');
      var list = [];
      if (data['@type']) list = list.concat(data['@type']);
      if (Array.isArray(data['@graph'])) {
        data['@graph'].forEach(function (item) {
          if (item && item['@type']) list = list.concat(item['@type']);
        });
      }
      return list;
    } catch (e) {
      return [];
    }
  }
  var scripts = Array.prototype.slice.call(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  var hasForeignArticle = scripts.some(function (node) {
    if (node.getAttribute('data-bc-blog-seo')) return false;
    var types = typesOf(node);
    return types.indexOf('BlogPosting') !== -1 || types.indexOf('Article') !== -1;
  });
  if (!hasForeignArticle) return;
  scripts.forEach(function (node) {
    if (node.getAttribute('data-bc-blog-seo')) node.parentNode.removeChild(node);
  });
})();
</script>
{{/if}}
{{#if page_type '===' 'blog'}}
<script type="application/ld+json" data-bc-blog-seo="breadcrumb">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "{{settings.store_name}}",
      "item": "{{settings.base_url}}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog"
    }
  ]
}
</script>
{{/if}}
`.trim();
}
