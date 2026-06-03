"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ContentGrid } from "./ContentGrid";
import { Reveal } from "./Reveal";
import type { CardItem } from "./ContentCard";
import Link from "next/link";

interface ContentType { id: string; name: string; slug: string }
interface OtherTopic { id: string; name: string; slug: string }

interface TopicClientProps {
  tag: { name: string; slug: string; bannerImage: string | null; bgImage: string | null; bgColor: string | null; description: string | null };
  items: CardItem[];
  contentTypes: ContentType[];
  otherTopics: OtherTopic[];
  activeType: string | null;
}

export function TopicClient({ tag, items, contentTypes, otherTopics, activeType }: TopicClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("type", value);
    else params.delete("type");
    router.push(`/topics/${tag.slug}?${params.toString()}`);
  };

  const filtered = activeType
    ? items.filter((i) => i.contentType.slug === activeType)
    : items;

  return (
    <div>
      {/* Header / Hero Banner */}
      {/* bgImage > bgColor > default site blue */}
      <div style={{ position: "relative", overflow: "hidden", background: tag.bgColor || "var(--hero-blue)" }}>
        {/* Full-bleed background image (from "Use image" mode) */}
        {tag.bgImage && (
          <>
            <Image src={tag.bgImage} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center", filter: "contrast(0.88) brightness(0.94) saturate(0.72) sepia(0.08) hue-rotate(-6deg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,15,25,0.78) 0%, rgba(10,15,25,0.55) 60%, rgba(10,15,25,0.35) 100%)" }} />
          </>
        )}
        {/* Foreground banner image (sectorImage, portrait) — if bgImage isn't set */}
        {!tag.bgImage && !tag.bgColor && tag.bannerImage && (
          <>
            <Image src={tag.bannerImage} alt={tag.name} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center", filter: "contrast(0.88) brightness(0.94) saturate(0.72) sepia(0.08) hue-rotate(-6deg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,15,25,0.78) 0%, rgba(10,15,25,0.55) 60%, rgba(10,15,25,0.35) 100%)" }} />
          </>
        )}

        <div className="samavesh-container topic-hero-inner" style={{ position: "relative", zIndex: 1, paddingTop: 80, paddingBottom: 72 }}>
          <Reveal>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em",
              color: (tag.bgImage || (!tag.bgColor && tag.bannerImage)) ? "rgba(255,255,255,0.55)" : "var(--ink-soft)",
              marginBottom: 12, textTransform: "uppercase",
            }}>
              Sector / Decoding policies on…
            </div>
            <h1 className="topic-hero-h1" style={{
              fontFamily: "var(--serif)", fontSize: 88, lineHeight: 1.05, fontWeight: 400,
              color: (tag.bgImage || (!tag.bgColor && tag.bannerImage)) ? "#ffffff" : "var(--ink)",
              margin: 0, letterSpacing: "-0.01em",
            }}>
              {tag.name}
            </h1>
            <p className="topic-hero-desc" style={{
              fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.5,
              maxWidth: 680, marginTop: 24,
              color: (tag.bgImage || (!tag.bgColor && tag.bannerImage)) ? "rgba(255,255,255,0.82)" : "var(--ink)",
            }}>
              {tag.description ||
                <>Everything we&rsquo;ve researched, debated, and published on {tag.name.toLowerCase()} — from ground-level observations to policy architecture for the sector.</>
              }
            </p>
          </Reveal>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ borderBottom: "1px solid var(--rule)", padding: "20px 0", position: "sticky", top: 0, background: "var(--paper)", zIndex: 50 }}>
        <div className="samavesh-container">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setFilter(null)}
              className={`pill${!activeType ? " is-active" : ""}`}
            >
              All
            </button>
            {contentTypes.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setFilter(activeType === ct.slug ? null : ct.slug)}
                className={`pill${activeType === ct.slug ? " is-active" : ""}`}
              >
                {ct.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "64px 0 120px" }}>
        <div className="samavesh-container">
          {filtered.length > 0 ? (
            <ContentGrid items={filtered} />
          ) : (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
                No content{activeType ? " for this type" : ""} in {tag.name}.
              </p>
              {activeType && (
                <button onClick={() => setFilter(null)} className="pill" style={{ marginTop: 24 }}>
                  Clear filter
                </button>
              )}
            </div>
          )}

          {/* Other topics */}
          {otherTopics.length > 0 && (
            <div style={{ marginTop: 96, paddingTop: 40, borderTop: "1px solid var(--rule)" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-soft)", marginBottom: 20, textTransform: "uppercase" }}>
                Other Sectors
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {otherTopics.map((t) => (
                  <Link key={t.id} href={`/topics/${t.slug}`} className="pill">
                    {t.name}
                  </Link>
                ))}
                <Link href="/topics" className="pill">See all →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
