"use client";

import { useEffect } from "react";

export default function ApplyBlogTheme({ theme }: { theme: string }) {
  useEffect(() => {
    document.body.setAttribute("data-bc-blog-theme", theme);
    return () => {
      document.body.removeAttribute("data-bc-blog-theme");
    };
  }, [theme]);

  return null;
}
