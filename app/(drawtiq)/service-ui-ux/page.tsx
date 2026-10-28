import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/service-detail-page";
import { serviceDetailMetadata } from "@/lib/content/metadata";

export const revalidate = 60;

const ROUTE_SLUG = "service-ui-ux";

export async function generateMetadata(): Promise<Metadata> {
  return serviceDetailMetadata(ROUTE_SLUG);
}

export default function ServiceUIPage() {
  return <ServiceDetailPage routeSlug={ROUTE_SLUG} />;
}
