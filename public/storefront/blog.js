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

    if (articles.length) {
      if (!document.querySelector(".bc-blog-list")) {
        var list = document.createElement("div");
        list.className = "bc-blog-list";
        articles[0].parentNode.insertBefore(list, articles[0]);
        articles.forEach(function (article, index) {
          article.classList.add("bc-blog-card");
          if (index === 0) {
            article.classList.add("bc-blog-featured");
          }
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
          list.appendChild(article);
        });
      }
      return;
    }

    var posts = document.querySelectorAll(
      ".blog > .blog-post, .blog-posts > .blog-post",
    );
    Array.prototype.forEach.call(posts, function (post, index) {
      post.classList.add("bc-blog-card");
      if (index === 0) {
        post.classList.add("bc-blog-featured");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }
})();
