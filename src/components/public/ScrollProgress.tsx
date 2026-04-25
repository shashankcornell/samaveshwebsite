"use client";

import { useState, useEffect } from "react";

export function ScrollProgress() {
  const [metrics, setMetrics] = useState({ thumbH: 80, top: 0 });

  useEffect(() => {
    const compute = () => {
      const h = document.documentElement;
      const viewH = h.clientHeight;
      const totalH = h.scrollHeight;
      const max = totalH - viewH;
      const ratio = viewH / totalH;
      const thumbH = Math.max(48, Math.min(viewH * 0.75, viewH * ratio));
      const scrollPct = max > 0 ? h.scrollTop / max : 0;
      const top = scrollPct * (viewH - thumbH);
      setMetrics({ thumbH, top });
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    const ro = new ResizeObserver(compute);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="scroll-indicator" aria-hidden="true">
      <div className="scroll-indicator__track" />
      <div
        className="scroll-indicator__thumb"
        style={{ height: metrics.thumbH, transform: `translateY(${metrics.top}px)` }}
      />
    </div>
  );
}
