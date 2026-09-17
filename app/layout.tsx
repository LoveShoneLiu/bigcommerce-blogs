import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-control-panel",
});

export const metadata: Metadata = {
  title: "Blog Style & SEO",
  description:
    "A BigCommerce single-click app that restyles the native storefront blog and adds structured data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body>{children}</body>
    </html>
  );
}
