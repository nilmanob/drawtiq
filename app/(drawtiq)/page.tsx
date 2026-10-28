import type { Metadata } from "next";
import { getGlobalSettings } from "@/lib/content/cms";
import { getPageSeo } from "@/lib/content/page-content";
import {
  HomepageContent,
} from "@/components/homepage-sections";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, { data: settings }] = await Promise.all([
    getPageSeo("homepage"),
    getGlobalSettings(),
  ]);
  const siteTitle =
    settings?.seo_title || "Drawtiq — Design that moves brands forward";
  const pageTitle = seo.title?.trim();

  return {
    // The global title already contains the full site title. Use an absolute
    // title for the homepage so the root template does not append it twice.
    title:
      pageTitle && pageTitle !== siteTitle
        ? pageTitle
        : { absolute: siteTitle },
    description:
      seo.description ||
      settings?.seo_description ||
      "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.",
    alternates: { canonical: "/" },
  };
}

export default function HomePage() {
  return (
    <main id="main">
      <HomepageContent />
    </main>
  );
}
