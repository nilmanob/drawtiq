import { redirect } from "next/navigation";

// Every page has its own sidebar entry; the bare path opens the first one.
export default function WebsitePagesIndex() {
  redirect("/admin/pages/homepage");
}
