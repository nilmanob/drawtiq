import type { Metadata } from "next";
import type { Viewport } from "next";
import localFont from "next/font/local";
import NetlifyCommentStrip from "@/components/netlify-comment-strip";
import { AuthLinkRedirect } from "@/components/auth-link-redirect";
import { getGlobalSettings } from "@/lib/content/cms";
import { themeCss } from "@/lib/theme/colors";
import { getThemeColors } from "@/lib/theme/server";
import { SHARE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./../styles/global.css";

// The same Google Fonts files the site used before (latin subset), committed
// in app/fonts so builds never depend on fetching from Google. Next.js serves
// them from this domain, preloads them, and adds size-matched fallbacks so
// text does not shift when they arrive. global.css reads these variables.
const manrope = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = localFont({
  src: [
    { path: "./fonts/dm-mono-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-mono-500-latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-dm-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await getGlobalSettings();
  const siteName = settings?.site_name || "Drawtiq";
  const title = settings?.seo_title || "Drawtiq — Design that moves brands forward";
  const description =
    settings?.seo_description ||
    "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.";

  return {
    // Resolves every relative canonical and Open Graph URL to the live site.
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      // Short brand suffix keeps page titles within search-result length.
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: ["design agency", "UI/UX design", "brand identity", "graphic design", "product design", "Drawtiq"],
    authors: [{ name: `${siteName} Studio` }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      title,
      description,
      siteName: SITE_NAME,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
    category: "Design Agency",
    // themeColor: "#f5f3ed",
    icons: {
      icon: "/assets/Drawtiq-favicon.png",
      apple: "/assets/Drawtiq-favicon.png",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = await getThemeColors();
  return { themeColor: theme.background };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Empty for the default palette, so the approved design renders untouched.
  const savedThemeCss = themeCss(await getThemeColors());

  return (
    <html
      lang="en"
      data-theme="light"
      className={`${manrope.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        {/*
          Netlify injects a promotional HTML comment into <head> on its edge.
          React counts that comment as a head node, so hydration fails before
          the client can take over. The strip below removes it in time.
        */}
        <NetlifyCommentStrip />
        {savedThemeCss ? (
          <style
            id="drawtiq-theme"
            // Built only from validated #rrggbb values (lib/theme/colors.ts).
            dangerouslySetInnerHTML={{ __html: savedThemeCss }}
          />
        ) : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/Drawtiq-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/Drawtiq-favicon.png" />
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
