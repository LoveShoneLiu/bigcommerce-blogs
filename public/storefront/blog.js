(function () {
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
      var hasImage = !!(
        figure &&
        figure.querySelector("img") &&
        figure.querySelector("img").getAttribute("src")
      );
      if (!hasImage) {
        article.classList.add("bc-blog-no-image");
        if (figure) {
          figure.style.display = "none";
        }
      }
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
        var imgOk = !!(
          fig &&
          fig.querySelector("img") &&
          fig.querySelector("img").getAttribute("src")
        );
        if (!imgOk) {
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
