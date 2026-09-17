(function () {
  function enhance() {
    var body = document.body;
    if (!body || !body.getAttribute("data-bc-blog-theme")) {
      return;
    }

    body.classList.add("bc-blog-enhanced");

    var posts = document.querySelectorAll(
      ".blog .blog-post, .blog-posts .blog-post",
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
