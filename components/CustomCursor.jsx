"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role=button], input, select, textarea, label[for], summary, [data-cursor=interactive]";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const ringInnerRef = useRef(null);

  useEffect(() => {
    const fine =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const inner = ringInnerRef.current;
    if (!dot || !ring || !inner) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let overInteractive = false;

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      const hit = e.target instanceof Element ? e.target.closest(INTERACTIVE_SELECTOR) : null;
      const next = !!hit;
      if (next !== overInteractive) {
        overInteractive = next;
        inner.classList.toggle("cursor-on-target", overInteractive);
      }
    }
    function onLeave() {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    }
    function onEnter() {
      dot.style.opacity = "";
      ring.style.opacity = "";
    }
    function onDown() {
      inner.classList.add("cursor-pressed");
    }
    function onUp() {
      inner.classList.remove("cursor-pressed");
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    document.body.classList.add("custom-cursor-active");

    let raf;
    function tick() {
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      ring.style.transform = `translate3d(${rx - 22}px, ${ry - 22}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-ink-900 transition-opacity duration-150"
        style={{ willChange: "transform" }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-11 w-11 transition-opacity duration-150"
        style={{ willChange: "transform" }}
        aria-hidden="true"
      >
        <div
          ref={ringInnerRef}
          className="cursor-ring-inner h-full w-full origin-center transition-transform duration-200"
        >
          <svg viewBox="0 0 44 44" className="animate-orbit h-full w-full text-ink-900">
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.55"
            />
            <circle cx="22" cy="4" r="2.2" fill="currentColor" />
          </svg>
        </div>
      </div>
    </>
  );
}
