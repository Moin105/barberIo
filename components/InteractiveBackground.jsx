"use client";

import { useEffect, useRef } from "react";

const STRAND_COUNT = 70;
const REPEL_RADIUS = 130;
const RIPPLE_MAX = 220;
const SCISSOR_LIFE = 36;

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();

    function makeStrand(initial = true) {
      return {
        x: Math.random() * W,
        // On first init scatter vertically; respawns drop in from above.
        y: initial ? Math.random() * H : -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.18,
        vy: 0.25 + Math.random() * 0.5,
        len: 10 + Math.random() * 14,
        angle: Math.random() * Math.PI,
        avel: (Math.random() - 0.5) * 0.018,
        lw: 0.6 + Math.random() * 0.6,
        brass: Math.random() < 0.18,
        a: 0.18 + Math.random() * 0.3,
      };
    }
    const strands = Array.from({ length: STRAND_COUNT }, () => makeStrand(true));

    const mouse = { x: -9999, y: -9999 };
    const ripples = [];
    const scissors = [];
    let running = true;

    function onMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function onClick(e) {
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, max: RIPPLE_MAX });
      if (ripples.length > 5) ripples.shift();
      scissors.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
        rot: (Math.random() - 0.5) * 0.7,
      });
      if (scissors.length > 4) scissors.shift();
      // Scatter nearby strands like a real snip would.
      for (const s of strands) {
        const dx = s.x - e.clientX;
        const dy = s.y - e.clientY;
        const d = Math.hypot(dx, dy);
        if (d < 70 && d > 0.5) {
          const f = ((70 - d) / 70) * 3.5;
          s.vx += (dx / d) * f;
          s.vy += (dy / d) * f;
          s.avel += (Math.random() - 0.5) * 0.04;
        }
      }
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onVisibility() {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    function drawScissor(s) {
      const t = s.age / SCISSOR_LIFE;
      const alpha = 1 - t;
      const size = 9 + t * 16;
      const ringR = size * 0.32;
      const ringOffset = ringR + 2;
      const bladeLen = size * 1.6;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot + t * 0.4);
      ctx.strokeStyle = `rgba(180,132,51,${alpha * 0.92})`;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";

      // Finger rings
      ctx.beginPath();
      ctx.arc(-ringOffset, size, ringR, 0, Math.PI * 2);
      ctx.moveTo(ringOffset + ringR, size);
      ctx.arc(ringOffset, size, ringR, 0, Math.PI * 2);
      ctx.stroke();

      // Crossed blades
      ctx.beginPath();
      ctx.moveTo(-ringOffset + ringR, size - ringR);
      ctx.lineTo(ringOffset - ringR, -bladeLen);
      ctx.moveTo(ringOffset - ringR, size - ringR);
      ctx.lineTo(-ringOffset + ringR, -bladeLen);
      ctx.stroke();

      ctx.restore();
    }

    let raf;
    function loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // --- Falling hair clippings ---
      for (const s of strands) {
        // Mouse repel
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = ((REPEL_RADIUS - d) / REPEL_RADIUS) * 0.07;
          s.vx += (dx / d) * f;
          s.vy += (dy / d) * f * 0.4;
          s.avel += ((Math.random() - 0.5) * f) * 0.4;
        }

        s.vx *= 0.99;
        s.avel *= 0.985;
        // Always tend back to a gentle downward fall.
        if (s.vy < 0.2) s.vy += 0.01;
        if (s.vy > 1.6) s.vy *= 0.96;

        s.x += s.vx;
        s.y += s.vy;
        s.angle += s.avel;

        // Wrap: when a strand has fallen out, respawn it dropping from above.
        if (s.y > H + 30) {
          Object.assign(s, makeStrand(false));
        }
        if (s.x < -30) s.x = W + 30;
        if (s.x > W + 30) s.x = -30;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.strokeStyle = s.brass
          ? `rgba(206,162,74,${s.a * 0.95})`
          : `rgba(19,17,15,${s.a * 0.85})`;
        ctx.lineWidth = s.lw;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-s.len / 2, 0);
        ctx.lineTo(s.len / 2, 0);
        ctx.stroke();
        ctx.restore();
      }

      // --- Click ripples ---
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 2.6;
        const alpha = Math.max(0, 1 - r.r / r.max);
        if (alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,132,51,${alpha * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // --- Scissor snips ---
      for (let i = scissors.length - 1; i >= 0; i--) {
        drawScissor(scissors[i]);
        scissors[i].age++;
        if (scissors[i].age >= SCISSOR_LIFE) scissors.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      {/* Slow-drifting barber-pole stripes behind the falling hair. */}
      <div
        className="barber-pole-bg pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />
    </>
  );
}
