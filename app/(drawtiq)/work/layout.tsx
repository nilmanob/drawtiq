import type { ReactNode } from "react";
import GsapBootstrap from "@/components/gsap-init";

export default function WorkLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <GsapBootstrap />
    </>
  );
}
