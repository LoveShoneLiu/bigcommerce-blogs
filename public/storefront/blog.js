(function () {
  function hasImage(figure) {
    if (!figure) return false;
    var img = figure.querySelector("img");
    return !!(img && img.getAttribute("src"));
  }

  function moveShareToEnd(article) {
    var root = article.parentNode || document;
    var shares = root.querySelectorAll(
      ".socialLinks, .addthis_toolbox, .share-actions, .blog-share, [data-content-region='blog_share']",
    );
    Array.prototype.forEach.call(shares, function (el) {
      el.classList.add("bc-blog-share");
      article.appendChild(el);
    });
  }

  function enhance() {
    var body = document.body;
    if (!body || !body.getAttribute("data-bc-blog-theme")) {
      return;
    }

    body.classList.add("bc-blog-enhanced");

    var articles = Array.prototype.slice.call(
      document.querySelectorAll("article.blog"),
    );

    if (!articles.length) {
      var posts = document.querySelectorAll(
        ".blog > .blog-post, .blog-posts > .blog-post",
      );
      Array.prototype.forEach.call(posts, function (post, index) {
        post.classList.add("bc-blog-card");
        if (index === 0) {
          post.classList.add("bc-blog-featured");
        }
      });
      return;
    }

    // Cornerstone single post uses h1.blog-title; list posts use h2.
    var isPostPage =
      articles.length === 1 &&
      Boolean(articles[0].querySelector("h1.blog-title"));

    if (isPostPage) {
      body.classList.add("bc-blog-post-page");
      var article = articles[0];
      article.classList.add("bc-blog-single", "bc-blog-card");
      var figure = article.querySelector(".blog-post-figure");
      if (!hasImage(figure)) {
        article.classList.add("bc-blog-no-image");
        if (figure) {
          figure.style.display = "none";
        }
      }
      moveShareToEnd(article);
      return;
    }

    if (!document.querySelector(".bc-blog-list")) {
      var list = document.createElement("div");
      list.className = "bc-blog-list";
      articles[0].parentNode.insertBefore(list, articles[0]);
      articles.forEach(function (article, index) {
        article.classList.add("bc-blog-card");
        if (index === 0) {
          article.classList.add("bc-blog-featured");
        }
        var fig = article.querySelector(".blog-post-figure");
        if (!hasImage(fig)) {
          article.classList.add("bc-blog-no-image");
          if (fig) {
            fig.style.display = "none";
          }
        }
        list.appendChild(article);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }
})();
