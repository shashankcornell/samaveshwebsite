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
  contentType: { name: string; slug: string };
  topics: { name: string; slug: string }[];
  contributors?: { name: string; role: string }[];
}

/* ─── Discourse Popup (portal) ─── */
function DiscoursePopup({ item, onClose }: { item: CardItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__close">
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.08em", color: "var(--ink)" }}
          >
            close ×
          </button>
        </div>
        <div style={{ padding: "0 40px 48px" }}>
          {item.thumbnail && (
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden", marginBottom: 32 }}>
              <Image src={item.thumbnail} alt={item.title} fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-blue)" }}>
              {item.contentType.name}
            </span>
            {item.topics.slice(0, 2).map((t) => (
              <span key={t.slug} style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-soft)", opacity: 0.6 }}>
                {t.name}
              </span>
            ))}
          </div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 400, lineHeight: 1.3, color: "var(--ink)", marginBottom: 20 }}>
            {item.title}
          </h2>
          {item.excerpt && (
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", marginBottom: 32 }}>
              {item.excerpt}
            </p>
          )}
          <Link
            href={`/blogs/${item.slug}`}
            className="btn-text"
            onClick={onClose}
          >
            Read full piece
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Tall card (articles, op-eds) ─── */
function TallCard({ item }: { item: CardItem }) {
  return (
    <Link href={`/blogs/${item.slug}`} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <article style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ position: "relative", width: "100%", paddingTop: "120%", overflow: "hidden", background: "#e8e4e0" }} className="card-img-wrap">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              style={{ objectFit: "cover" }}
              className="card-img"
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "var(--tint-sand)" }} />
          )}
        </div>
        <div style={{ paddingTop: 20, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-blue)" }}>
            {item.contentType.name}
          </span>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, lineHeight: 1.35, color: "var(--ink)", margin: 0 }}>
            {item.title}
          </h3>
          {item.topics[0] && (
            <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink)", opacity: 0.45 }}>
              {item.topics[0].name}
            </span>
          )}
          <div style={{ marginTop: "auto", paddingTop: 12 }}>
            {item.publishedAt && (
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", opacity: 0.35 }}>
                {formatDate(item.publishedAt)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Square card (discourses) ─── */
function SquareCard({ item }: { item: CardItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ textAlign: "left", width: "100%", cursor: "pointer" }}
      >
        <article>
          <div style={{ position: "relative", width: "100%", paddingTop: "100%", overflow: "hidden", background: "#e8e4e0" }} className="card-img-wrap">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                sizes="(max-width: 900px) 100vw, 420px"
                style={{ objectFit: "cover" }}
                className="card-img"
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: "var(--tint-sky)" }} />
            )}
          </div>
          <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-purple)" }}>
              {item.contentType.name}
            </span>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, lineHeight: 1.35, color: "var(--ink)", margin: 0 }}>
              {item.title}
            </h3>
            {item.topics[0] && (
              <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink)", opacity: 0.45 }}>
                {item.topics[0].name}
              </span>
            )}
          </div>
        </article>
      </button>
      {open && <DiscoursePopup item={item} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ─── Wide card (podcasts) — portrait offset ─── */
function PodcastCard({ item }: { item: CardItem }) {
  return (
    <Link href={`/blogs/${item.slug}`} style={{ display: "block" }}>
      <article>
        <div style={{ position: "relative", width: "100%", paddingTop: "133%", overflow: "hidden", background: "#e8e4e0" }} className="card-img-wrap">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              style={{ objectFit: "cover" }}
              className="card-img"
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "var(--tint-sage)" }} />
          )}
        </div>
        <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.4 }}>
            Podcast
          </span>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, lineHeight: 1.35, color: "var(--ink)", margin: 0 }}>
            {item.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

/* ─── ContentCard: routes to the right variant ─── */
export function ContentCard({ item, variant }: { item: CardItem; variant?: "tall" | "square" | "podcast" }) {
  const v = variant ?? (
    item.contentType.slug === "discourse" ? "square"
    : item.contentType.slug === "podcast" ? "podcast"
    : "tall"
  );

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div className="card-lift" style={{ cursor: "pointer" }}>
      {children}
    </div>
  );

  return (
    <Wrap>
      {v === "square" ? <SquareCard item={item} /> : v === "podcast" ? <PodcastCard item={item} /> : <TallCard item={item} />}
    </Wrap>
  );
}
