"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ContentGrid } from "./ContentGrid";
import { Reveal } from "./Reveal";
import { CardItem } from "./ContentCard";

interface ContentType { id: string; name: string; slug: string }

interface BlogsClientProps {
  items: CardItem[];
  contentTypes: ContentType[];
  activeType: string | null;
  activeTopic: string | null;
  heroHeading?: string | null;
  heroSubtitle?: string | null;
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

function PaginationBar({ page, totalPages, buildHref }: {
  page: number;
  totalPages: number;
  buildHref: (p: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.04em",
    border: "1px solid var(--ink)", borderRadius: "50%", cursor: "pointer",
    transition: "background 150ms ease, color 150ms ease",
    textDecoration: "none", flexShrink: 0,
    background: "transparent", color: "var(--ink)",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", paddingTop: 64, paddingBottom: 96 }}>
      {page > 1 && (
        <Link href={buildHref(page - 1)} style={btnBase}>←</Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ell-${i}`} style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.3, width: 20, textAlign: "center" }}>…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            style={{
              ...btnBase,
              background: p === page ? "var(--ink)" : "transparent",
              color: p === page ? "var(--paper)" : "var(--ink)",
            }}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} style={btnBase}>→</Link>
      )}
    </div>
  );
}

export function BlogsClient({
  items, contentTypes, activeType, activeTopic,
  heroHeading, heroSubtitle,
  page, totalPages, total,
}: BlogsClientProps) {
  const searchParams = useSearchParams();

  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return `/blogs${qs ? `?${qs}` : ""}`;
  };

  const typeHref = (slug: string | null) => {
    const params = new URLSearchParams();
    if (slug) params.set("type", slug);
    if (activeTopic) params.set("topic", activeTopic);
    const qs = params.toString();
    return `/blogs${qs ? `?${qs}` : ""}`;
  };

  const hasFilter = !!activeType || !!activeTopic;

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: "64px 0 32px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 className="blogs-page-title" style={{ fontFamily: "var(--serif)", fontSize: 88, lineHeight: 1.05, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
              {heroHeading ?? "Think."}
            </h1>
            {heroSubtitle ? (
              <div className="samavesh-prose blogs-page-subtitle" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28, lineHeight: 1.5, maxWidth: 760, marginTop: 28, color: "var(--ink)" }} dangerouslySetInnerHTML={{ __html: heroSubtitle }} />
            ) : (
              <p className="blogs-page-subtitle" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28, lineHeight: 1.5, maxWidth: 760, marginTop: 28, color: "var(--ink)" }}>
                Long-form research, fortnightly op-eds, weekly discourses and conversations — read what our community has been working on this season.
              </p>
            )}
          </Reveal>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)", padding: "20px 0", position: "sticky", top: 0, background: "var(--paper)", zIndex: 50 }}>
        <div className="samavesh-container">
          <div className="filter-pill-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/blogs" className={`pill${!hasFilter ? " is-active" : ""}`}>All</Link>
            <div style={{ width: 1, height: 24, background: "var(--rule)", margin: "0 2px" }} />
            {contentTypes.map((ct) => (
              <Link key={ct.id} href={typeHref(activeType === ct.slug ? null : ct.slug)} className={`pill${activeType === ct.slug ? " is-active" : ""}`}>
                {ct.name}
              </Link>
            ))}
            <div style={{ width: 1, height: 24, background: "var(--rule)", margin: "0 2px" }} />
            <Link href="/topics" className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Sectors <span style={{ opacity: 0.55, fontSize: "0.85em" }}>→</span>
            </Link>
            <Link href="/gazette" className="pill">Gazette</Link>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--ink)", opacity: 0.35, marginLeft: "auto" }}>
              {total} {total === 1 ? "ITEM" : "ITEMS"}
            </span>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div style={{ padding: "64px 0 0" }}>
        <div className="samavesh-container">
          {items.length > 0 ? (
            <ContentGrid items={items} />
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0 96px" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", opacity: 0.45 }}>
                No content found{hasFilter ? " for this filter" : ""}.
              </p>
              {hasFilter && (
                <Link href="/blogs" className="pill" style={{ marginTop: 24, display: "inline-block", fontSize: 16 }}>
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="samavesh-container">
        <PaginationBar page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
