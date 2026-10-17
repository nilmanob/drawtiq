"use client";

import { useEffect, useState } from "react";

export function CursorLabel() {
  const [visible, setVisible] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const cursor = document.querySelector(".cursor-label");
      if (!cursor) return;

      const onMouseMove = (e: MouseEvent) => {
        setX(e.clientX);
        setY(e.clientY);
        (cursor as HTMLElement).style.left = e.clientX + "px";
        (cursor as HTMLElement).style.top = e.clientY + "px";
      };

      document.addEventListener("mousemove", onMouseMove);

      const onMouseEnter = () => setVisible(true);
      const onMouseLeave = () => setVisible(false);

      const projects = document.querySelectorAll(".project");
      projects.forEach((p) => {
        p.addEventListener("pointerenter", onMouseEnter);
        p.addEventListener("pointerleave", onMouseLeave);
      });

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        projects.forEach((p) => {
          p.removeEventListener("pointerenter", onMouseEnter);
          p.removeEventListener("pointerleave", onMouseLeave);
        });
      };
    }
  }, []);

  return (
    <div
      className={`cursor-label ${visible ? "visible" : ""}`}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      View ↗
    </div>
  );
}
