import type { Metadata } from "next";
import type { Viewport } from "next";
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
      <body>{children}</body>
    </html>
  );
}
