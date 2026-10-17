import { redirect } from "next/navigation";

export default function CaseStudyRootPage({
  searchParams,
}: {
  searchParams?: { project?: string };
}) {
  const project = searchParams?.project || "northstar";
  redirect(`/case-study/${project}`);
}
