import type { Metadata } from "next";
import type { Viewport } from "next";
import NetlifyCommentStrip from "@/components/netlify-comment-strip";
import { AuthLinkRedirect } from "@/components/auth-link-redirect";
import { getGlobalSettings } from "@/lib/content/cms";
import "./../styles/global.css";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await getGlobalSettings();
  const siteName = settings?.site_name || "Drawtiq";
  const title = settings?.seo_title || "Drawtiq — Design that moves brands forward";
  const description =
    settings?.seo_description ||
    "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: ["design agency", "UI/UX design", "brand identity", "graphic design", "product design", "Drawtiq"],
    authors: [{ name: `${siteName} Studio` }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    category: "Design Agency",
    // themeColor: "#f5f3ed",
    icons: {
      icon: "/assets/Drawtiq-favicon.png",
      apple: "/assets/Drawtiq-favicon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f3ed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        {/*
          Netlify injects a promotional HTML comment into <head> on its edge.
          React counts that comment as a head node, so hydration fails before
          the client can take over. The strip below removes it in time.
        */}
        <NetlifyCommentStrip />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/Drawtiq-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/Drawtiq-favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      {/*
        Browser extensions (ColorZilla, Grammarly, password managers) add
        attributes such as cz-shortcut-listen to <body> before React hydrates.
        This only ignores attribute differences on <body> itself; children are
        still checked.
      */}
      <body suppressHydrationWarning>
        <AuthLinkRedirect />
        {children}
      </body>
    </html>
  );
}
