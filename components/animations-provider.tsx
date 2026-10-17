"use client";

import { useDrawtiqAnimations, useRevealOnScroll } from "@/components/gsap-animations";
import { useReducedMotion } from "@/hooks/use-scroll-animations";

export default function AnimationsProvider() {
  useDrawtiqAnimations();
  useReducedMotion();
  useRevealOnScroll();

  return null;
}
