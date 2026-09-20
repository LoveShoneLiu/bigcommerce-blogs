"use client";

import { useLayoutEffect } from "react";

export default function ApplyBlogTheme({
  theme,
  postPage = false,
}: {
  theme: string;
  postPage?: boolean;
}) {
  useLayoutEffect(() => {
    document.body.setAttribute("data-bc-blog-theme", theme);
    document.body.classList.toggle("bc-blog-post-page", postPage);
    document.body.classList.toggle("bc-blog-list-page", !postPage);
    return () => {
      document.body.removeAttribute("data-bc-blog-theme");
      document.body.classList.remove("bc-blog-post-page", "bc-blog-list-page");
    };
  }, [theme, postPage]);

  return null;
}
