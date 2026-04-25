"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CardMosaic } from "./CardMosaic";
import { Reveal } from "./Reveal";
import { CardItem } from "./ContentCard";

interface ContentType { id: string; name: string; slug: string }
interface TopicTag { id: string; name: string; slug: string }

interface BlogsClientProps {
  items: CardItem[];
  contentTypes: ContentType[];
  topicTags: TopicTag[];
  activeType: string | null;
  activeTopic: string | null;
}

export function BlogsClient({ items, contentTypes, topicTags, activeType, activeTopic }: BlogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (key: "type" | "topic", value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/blogs?${params.toString()}`);
  };

  const clearAll = () => router.push("/blogs");

  const hasFilter = !!activeType || !!activeTopic;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "var(--hero-blue)", padding: "72px 0 48px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
              Think
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink-soft)", opacity: 0.65 }}>
              Policy writing, discourse, and research.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ borderBottom: "1px solid var(--rule)", padding: "20px 0", position: "sticky", top: 72, background: "var(--paper)", zIndex: 50 }}>
        <div className="samavesh-container">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* Gazzette shortcut */}
            <a
              href="/gazette"
              className="pill"
              style={{ fontSize: 15, padding: "8px 20px" }}
            >
              Gazzette
            </a>

            <div style={{ width: 1, height: 28, background: "var(--rule)", margin: "0 4px" }} />

            {/* Content type filters */}
            {contentTypes.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setFilter("type", activeType === ct.slug ? null : ct.slug)}
                className={`pill${activeType === ct.slug ? " is-active" : ""}`}
                style={{ fontSize: 15, padding: "8px 20px" }}
              >
                {ct.name}
              </button>
            ))}

            <div style={{ width: 1, height: 28, background: "var(--rule)", margin: "0 4px" }} />

            {/* Topic filters */}
            {topicTags.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter("topic", activeTopic === t.slug ? null : t.slug)}
                className={`pill${activeTopic === t.slug ? " is-active" : ""}`}
                style={{ fontSize: 15, padding: "8px 20px" }}
              >
                {t.name}
              </button>
            ))}

            {hasFilter && (
              <button
                onClick={clearAll}
                style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.45, marginLeft: 8, cursor: "pointer" }}
              >
                clear ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content mosaic */}
      <div style={{ padding: "64px 0 120px" }}>
        <div className="samavesh-container">
          {items.length > 0 ? (
            <CardMosaic items={items} />
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", opacity: 0.45 }}>
                No content found{hasFilter ? " for this filter" : ""}.
              </p>
              {hasFilter && (
                <button onClick={clearAll} className="pill" style={{ marginTop: 24, fontSize: 16 }}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
