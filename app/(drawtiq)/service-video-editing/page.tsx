import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/service-detail-page";
import { getPublishedServiceDetail } from "@/lib/content/data";

export const revalidate = 60;

const ROUTE_SLUG = "service-video-editing";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getPublishedServiceDetail(ROUTE_SLUG);

  if (!data) {
    return { title: "Service not found" };
  }

  return {
    title: data.seoTitle,
    description: data.seoDescription,
  };
}

export default function ServiceVideoEditingPage() {
  return <ServiceDetailPage routeSlug={ROUTE_SLUG} />;
}
