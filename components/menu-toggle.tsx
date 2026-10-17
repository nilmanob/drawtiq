"use client";

import { useState, useEffect } from "react";

export function MenuToggle({
  isOpen,
  onToggle,
  className,
}: {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      className={`menu-toggle ${className || ""}`}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      onClick={onToggle}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}
