"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

export interface CardItem {
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: Date | string | null;
  readingTime?: number | null;
  contentType: { name: string; slug: string; thumbnailRatioW?: number; thumbnailRatioH?: number };
  topics: { name: string; slug: string }[];
  contributors?: { name: string; role: string }[];
}

const CARD_TINT: Record<string, string> = {
  article: "var(--tint-sage)",
  paper: "var(--tint-sage)",
  "op-ed": "var(--tint-sage)",
  discourse: "var(--tint-sand)",
  podcast: "var(--tint-sky)",
  interview: "var(--tint-sky)",
};

function getTint(slug: string) {
  return CARD_TINT[slug] ?? "var(--tint-sage)";
}

/* ─── Discourse Popup (portal) ─── */
function DiscoursePopup({ item, onClose }: { item: CardItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const scrollW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollW > 0) document.body.style.paddingRight = `${scrollW}px`;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [onClose]);

  const presenter = item.contributors?.find((c) => c.role === "PRESENTER")?.name
    ?? item.contributors?.[0]?.name;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__close">
          <button onClick={onClose} aria-label="Close" style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.08em", color: "var(--ink)" }}>
            close ×
          </button>
        </div>
        <div className="modal-inner" style={{ padding: "0 56px 56px", display: "grid", gridTemplateColumns: "minmax(0,310px) 1fr", gap: 56, alignItems: "start" }}>
          <div className="modal-inner-img image-cinematic-matte" style={{ position: "relative", aspectRatio: "310 / 409", background: "var(--tint-sand)", overflow: "hidden" }}>
            {item.thumbnail ? (
              <Image src={item.thumbnail} alt={item.title} fill style={{ objectFit: "cover" }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: "var(--tint-sand)" }} />
            )}
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1.3, fontWeight: 400, margin: 0 }}>
              {item.title}
            </h2>
            {presenter && (
              <div style={{ fontFamily: "var(--sans)", fontSize: 16, marginTop: 18, color: "var(--ink-soft)" }}>
                Presented by {presenter}
              </div>
            )}
            {item.excerpt && (
              <p style={{ fontFamily: "var(--sans)", fontSize: 16, lineHeight: 1.7, marginTop: 24, color: "var(--ink)" }}>
                {item.excerpt}
              </p>
            )}
            <Link href={`/blogs/${item.slug}`} className="btn-text" onClick={onClose} style={{ marginTop: 24, display: "inline-flex" }}>
              Read full discourse
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CardImageBlock({ item }: { item: CardItem }) {
  const tint = getTint(item.contentType.slug);
  const w = item.contentType.thumbnailRatioW ?? 3;
  const h = item.contentType.thumbnailRatioH ?? 4;
  return (
    <div className="image-cinematic-matte" style={{ position: "relative", width: "100%", aspectRatio: `${w} / ${h}`, overflow: "hidden", background: tint }}>
      {item.thumbnail ? (
        <Image src={item.thumbnail} alt={item.title} fill sizes="(max-width: 900px) 100vw, 420px" style={{ objectFit: "cover" }} className="card-img" />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: tint }} />
      )}
    </div>
  );
}

function CardInner({ item }: { item: CardItem }) {
  const sector = item.topics[0]?.name;
  const author = item.contributors?.find((c) => c.role === "AUTHOR")?.name ?? item.contributors?.[0]?.name;

  return (
    <div style={{ padding: "24px 24px 28px" }}>
      {/* Type · Sector */}
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--ink)", opacity: 0.5, textTransform: "uppercase", marginBottom: 10 }}>
        {item.contentType.name}
        {sector && <span style={{ margin: "0 6px", opacity: 0.5 }}>·</span>}
        {sector}
      </div>

      {/* Thumbnail */}
      <CardImageBlock item={item} />

      {/* Title */}
      <div style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.4, color: "var(--ink)", marginTop: 16 }}>
        {item.title}
      </div>

      {/* Author */}
      {author && (
        <div style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink)", opacity: 0.5, marginTop: 10 }}>
          {author}
        </div>
      )}

      {/* Date */}
      {item.publishedAt && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--ink)", opacity: 0.35, marginTop: 6 }}>
          {formatDate(item.publishedAt)}
        </div>
      )}
    </div>
  );
}

function DiscourseCard({ item }: { item: CardItem }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ textAlign: "left", width: "100%", cursor: "pointer" }}>
        <CardInner item={item} />
      </button>
      {open && <DiscoursePopup item={item} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ─── ContentCard: single entry point ─── */
export function ContentCard({ item }: { item: CardItem; variant?: string }) {
  const isDiscourse = item.contentType.slug === "discourse";
  return (
    <div className="card-lift">
      {isDiscourse ? (
        <DiscourseCard item={item} />
      ) : (
        <Link href={`/blogs/${item.slug}`} style={{ display: "block" }}>
          <CardInner item={item} />
        </Link>
      )}
    </div>
  );
}
