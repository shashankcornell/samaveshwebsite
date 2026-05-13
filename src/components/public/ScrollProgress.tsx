"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function ScrollProgress() {
  const [metrics, setMetrics] = useState({ thumbH: 80, top: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  const compute = useCallback(() => {
    const h = document.documentElement;
    const viewH = h.clientHeight;
    const totalH = h.scrollHeight;
    const max = totalH - viewH;
    const ratio = viewH / totalH;
    const thumbH = Math.max(48, Math.min(viewH * 0.75, viewH * ratio));
    const scrollPct = max > 0 ? h.scrollTop / max : 0;
    const top = scrollPct * (viewH - thumbH);
    setMetrics({ thumbH, top });
  }, []);

  useEffect(() => {
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
  }, [compute]);

  /* Drag thumb */
  const onThumbPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = document.documentElement.scrollTop;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onThumbPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const h = document.documentElement;
    const viewH = h.clientHeight;
    const totalH = h.scrollHeight;
    const max = totalH - viewH;
    const trackH = viewH - metrics.thumbH;
    const delta = e.clientY - dragStartY.current;
    const scrollDelta = trackH > 0 ? (delta / trackH) * max : 0;
    h.scrollTop = Math.max(0, Math.min(max, dragStartScrollTop.current + scrollDelta));
  }, [metrics.thumbH]);

  const onThumbPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  /* Click on track (not thumb) → jump */
  const onTrackClick = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickPct = (e.clientY - rect.top) / rect.height;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    h.scrollTop = clickPct * max;
  }, []);

  return (
    <div
      ref={trackRef}
      className="scroll-indicator"
      aria-hidden="true"
      onClick={onTrackClick}
      style={{ pointerEvents: "auto", cursor: "pointer" }}
    >
      <div className="scroll-indicator__track" />
      <div
        className="scroll-indicator__thumb"
        style={{ height: metrics.thumbH, transform: `translateY(${metrics.top}px)`, cursor: "grab" }}
        onPointerDown={onThumbPointerDown}
        onPointerMove={onThumbPointerMove}
        onPointerUp={onThumbPointerUp}
        onPointerCancel={onThumbPointerUp}
      />
    </div>
  );
}
