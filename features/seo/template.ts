/**
 * Scripts API requires html to contain exactly one <script> tag.
 * JSON-LD is injected at runtime so we stay within that limit.
 */
export function buildSeoScriptHtml(): string {
  return `
<script>
(function () {
  var pageType = '{{page_type}}';
  if (pageType !== 'blog' && pageType !== 'blog_post') return;

  function inject(key, payload) {
    if (document.querySelector('script[data-bc-blog-seo="' + key + '"]')) return;
    var node = document.createElement('script');
    node.type = 'application/ld+json';
    node.setAttribute('data-bc-blog-seo', key);
    node.textContent = JSON.stringify(payload);
    document.head.appendChild(node);
  }

  function storeName() {
    return '{{settings.store_name}}';
  }

  function storeUrl() {
    return '{{settings.base_url}}';
  }

  if (pageType === 'blog_post') {
    var posting = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: '{{blog.post.title}}',
      author: {
        '@type': 'Person',
        name: '{{blog.post.author}}'
      },
      datePublished: '{{blog.post.date_published}}',
      mainEntityOfPage: '{{blog.post.url}}'
    };
    {{#if blog.post.thumbnail}}
    posting.image = '{{blog.post.thumbnail}}';
    {{/if}}
    inject('post', posting);
    inject('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: storeName(),
          item: storeUrl()
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '{{blog.post.title}}',
          item: '{{blog.post.url}}'
        }
      ]
    });
  }

  if (pageType === 'blog') {
    inject('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: storeName(),
          item: storeUrl()
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog'
        }
      ]
    });
  }

  var scripts = Array.prototype.slice.call(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  var hasForeignArticle = scripts.some(function (node) {
    if (node.getAttribute('data-bc-blog-seo')) return false;
    try {
      var data = JSON.parse(node.textContent || '{}');
      var types = [].concat(data['@type'] || []);
      if (Array.isArray(data['@graph'])) {
        data['@graph'].forEach(function (item) {
          if (item && item['@type']) types = types.concat(item['@type']);
        });
      }
      return types.indexOf('BlogPosting') !== -1 || types.indexOf('Article') !== -1;
    } catch (e) {
      return false;
    }
  });
  if (!hasForeignArticle) return;
  scripts.forEach(function (node) {
    if (node.getAttribute('data-bc-blog-seo') && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  });
})();
</script>
`.trim();
}
