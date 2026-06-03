"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Reveal } from "./Reveal";
import { formatDate } from "@/lib/utils";
import { ContentGrid } from "./ContentGrid";
import type { CardItem } from "./ContentCard";
import type { HomeContentItem, GazettePreview, FeaturedBlock } from "@/app/(public)/page";

/* ── YouTube embed (click-to-play) ── */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function FeaturedYouTube({ url }: { url: string }) {
  const [play, setPlay] = useState(false);
  const id = youtubeId(url);
  if (!id) return null;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
      {play ? (
        <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      ) : (
        <button onClick={() => setPlay(true)} aria-label="Play video"
          style={{ position: "absolute", inset: 0, width: "100%", cursor: "pointer", background: "transparent", border: 0, padding: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="Video thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 28px rgba(0,0,0,0.4)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}><path d="M5 3l14 9-14 9V3z" /></svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

/* ── Twitter embed ── */
function FeaturedTwitter({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const win = window as Window & { twttr?: { widgets: { load: (el: HTMLElement | null) => void } } };
    const load = () => win.twttr?.widgets.load(ref.current);
    if (win.twttr) { load(); return; }
    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js";
    s.async = true;
    s.onload = load;
    document.body.appendChild(s);
  }, [url]);
  return (
    <div ref={ref}>
      <blockquote className="twitter-tweet" data-dnt="true"><a href={url}>View on X</a></blockquote>
    </div>
  );
}

/* ── Instagram embed ── */
function FeaturedInstagram({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const win = window as Window & { instgrm?: { Embeds: { process: () => void } } };
    const load = () => win.instgrm?.Embeds?.process();
    if (win.instgrm) { load(); return; }
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = load;
    document.body.appendChild(s);
  }, [url]);
  return (
    <div ref={ref} style={{ overflowX: "hidden" }}>
      <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ maxWidth: "100%", width: "100%", minWidth: 0 }}>
        <a href={url} target="_blank" rel="noopener noreferrer">View on Instagram</a>
      </blockquote>
    </div>
  );
}

/* ── Featured media block (left side) ── */
function FeaturedMedia({ block }: { block: FeaturedBlock }) {
  const hasEmbed = !!block.embedType;

  if (block.embedType === "youtube" && block.embedUrl) {
    return <FeaturedYouTube url={block.embedUrl} />;
  }
  if (block.embedType === "twitter" && block.embedUrl) {
    return <FeaturedTwitter url={block.embedUrl} />;
  }
  if (block.embedType === "instagram" && block.embedUrl) {
    return <FeaturedInstagram url={block.embedUrl} />;
  }
  if (block.embedType === "custom" && block.embedCode) {
    return <div style={{ width: "100%", overflowX: "hidden" }} dangerouslySetInnerHTML={{ __html: block.embedCode }} />;
  }

  // Image or tint placeholder
  return (
    <div className="card-lift image-cinematic-matte" style={{ position: "relative", aspectRatio: hasEmbed ? "16 / 9" : "16 / 11", overflow: "hidden", background: "var(--tint-sand)" }}>
      {block.thumbnail ? (
        <Image src={block.thumbnail} alt={block.title} fill priority style={{ objectFit: "cover" }} className="card-img" sizes="50vw" />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "var(--tint-sand)" }} />
      )}
    </div>
  );
}

/* ── Full featured section ── */
function FeaturedSection({ block }: { block: FeaturedBlock }) {
  const categoryLabel = block.type === "content"
    ? [block.topicName, block.contentTypeName].filter(Boolean).join(" · ")
    : block.category ?? "";

  const ctaHref = block.ctaUrl;
  const isExternal = ctaHref?.startsWith("http");

  const textRight = (
    <div style={{ paddingTop: 8 }}>
      {categoryLabel && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--ink-soft)", marginBottom: 18, textTransform: "uppercase" }}>
          {categoryLabel}
        </div>
      )}
      <h2 style={{ fontFamily: "var(--serif)", fontSize: 56, lineHeight: 1.08, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
        {block.title}
      </h2>
      {block.description && (
        <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, lineHeight: 1.5, marginTop: 28, color: "var(--ink)" }}>
          {block.description}
        </p>
      )}
      {block.type === "content" && (
        <div style={{ marginTop: 24, fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.04em", color: "var(--ink-soft)" }}>
          {block.contributorName?.toUpperCase() ?? ""}
          {block.contributorName && block.readingTime ? " · " : ""}
          {block.readingTime ? `${block.readingTime} MIN READ` : ""}
        </div>
      )}
      {block.ctaEnabled && ctaHref && (
        <div style={{ marginTop: 36 }}>
          {isExternal ? (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ display: "inline-flex" }}>
              <span>{block.ctaLabel}</span>
              <span className="arrow">→</span>
            </a>
          ) : (
            <Link href={ctaHref} className="btn-text" style={{ display: "inline-flex" }}>
              <span>{block.ctaLabel}</span>
              <span className="arrow">→</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section style={{ background: "var(--paper)", paddingTop: 96, paddingBottom: 96, borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
      <div className="samavesh-container">
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 48, paddingBottom: 16, borderBottom: "1px solid var(--ink)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.16em", color: "var(--ink)" }}>
              FEATURED · THIS WEEK
            </div>
            {block.publishedAt && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--ink-soft)" }}>
                {formatDate(block.publishedAt).toUpperCase()}
              </div>
            )}
          </div>
        </Reveal>

        <div className="featured-cols" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)", gap: 72, alignItems: "start" }}>
          <Reveal>
            <FeaturedMedia block={block} />
          </Reveal>
          <Reveal delay={100}>
            {textRight}
          </Reveal>
        </div>
      </div>
    </section>
  );
}


interface Topic {
  id: string;
  name: string;
  slug: string;
  count: number;
  image: string | null;
}

interface HomeClientProps {
  featured: FeaturedBlock | null;
  gridContent: HomeContentItem[];
  topics: Topic[];
  gazette: GazettePreview;
}

export function HomeClient({ featured, gridContent, topics, gazette }: HomeClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (topics.length === 0 || isHovered) return;
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % topics.length), 7000);
    return () => clearInterval(t);
  }, [topics.length, isHovered]);

  const cardItems: CardItem[] = gridContent.map((item) => ({
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    thumbnail: item.thumbnail,
    publishedAt: item.publishedAt,
    readingTime: item.readingTime,
    contentType: item.contentType,
    topics: item.topics,
    contributors: item.contributors,
  }));

  const topicList = topics;

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Two-tone absolute background */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", zIndex: 0 }}>
          <div style={{ background: "var(--hero-blue)" }} />
          <div style={{ background: "var(--hero-cream)" }} />
        </div>

        <div
          className="samavesh-container hero-grid"
          style={{
            position: "relative", zIndex: 1,
            minHeight: 800,
            paddingTop: 56, paddingBottom: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div style={{ paddingRight: 40 }}>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 21, color: "var(--ink)", marginBottom: 38 }}>
              Decoding policies on…
            </div>

            <ol
              style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 24 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {topicList.map((topic, i) => {
                const active = i === activeIdx;
                return (
                  <li key={topic.slug}>
                    <Link
                      href={`/topics/${topic.slug}`}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 50,
                        lineHeight: 1.15,
                        color: active ? "var(--ink)" : "rgba(17,17,17,0.45)",
                        textAlign: "left",
                        transition: "color 350ms ease",
                        position: "relative",
                        display: "inline-block",
                        padding: 0,
                      } as React.CSSProperties}
                      className="hero-topic-size"
                    >
                      <span style={{ position: "relative", display: "inline-block" }}>
                        {topic.name}
                        <span aria-hidden="true" style={{
                          position: "absolute", left: 0, right: 0, bottom: -4, height: 2,
                          background: "var(--accent-blue)",
                          transformOrigin: "left center",
                          transform: active ? "scaleX(1)" : "scaleX(0)",
                          transition: "transform 600ms cubic-bezier(.7,0,.3,1)",
                        }} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>

            <div style={{ marginTop: 64 }}>
              <Link href="/topics" className="btn-text">
                <span>More topics</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="hero-right-panel" style={{ display: "flex", flexDirection: "column" }}>

            {/* Cross-fade topic image */}
            <div style={{
              width: "100%", maxWidth: 420, aspectRatio: "404 / 608",
              position: "relative", marginLeft: "auto",
              background: "rgba(217,217,217,0.6)",
              overflow: "hidden",
            }}>
              {topicList.map((topic, i) => (
                <div key={i} style={{
                  position: "absolute", inset: 0,
                  opacity: i === activeIdx ? 1 : 0,
                  transform: i === activeIdx ? "scale(1)" : "scale(1.04)",
                  transition: isHovered ? "none" : "opacity 700ms ease, transform 1200ms cubic-bezier(.2,.7,.2,1)",
                }}>
                  {topic.image && (
                    <Image src={topic.image} alt={topic.name} fill priority={i === 0} style={{ objectFit: "cover" }} sizes="40vw" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      {featured && <FeaturedSection block={featured} />}

      {/* ── Gazette Teaser ── */}
      {gazette && (
        <section style={{ background: "var(--hero-cream)", paddingTop: 110, paddingBottom: 110, borderBottom: "1px solid var(--ink)" }}>
          <div className="samavesh-container">
            <div className="gz-teaser-cols" style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)", gap: 96, alignItems: "start" }}>
              <Reveal>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.18em", color: "var(--ink-soft)", marginBottom: 20 }}>
                    FROM THE GAZZETTE
                  </div>
                  {(gazette.volumeNumber || gazette.publishedAt) && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.12em", color: "var(--ink)", marginBottom: 36 }}>
                      {gazette.volumeNumber ? `VOLUME ${gazette.volumeNumber}` : ""}
                      {gazette.volumeNumber && gazette.publishedAt ? " · " : ""}
                      {gazette.publishedAt ? new Date(gazette.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase() : ""}
                    </div>
                  )}
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: 76, lineHeight: 0.98, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>
                    The Gazzette.
                  </h2>
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, lineHeight: 1.55, maxWidth: 460, marginTop: 32, color: "var(--ink)" }}>
                    {gazette.description || "Our annual journal — twelve discourse papers, drawn from a year of presentations and moderated debate at the Samavesh Summit, edited into a single volume for the public record."}
                  </p>
                  <div style={{ marginTop: 40 }}>
                    <Link href="/gazette" className="btn-text">
                      <span>Open the journal</span>
                      <span className="arrow">→</span>
                    </Link>
                  </div>
                </div>
              </Reveal>
              {gazette.articles.length > 0 && (
                <Reveal delay={120}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--ink-soft)", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--ink)" }}>
                      IN THIS ISSUE — A SELECTION
                    </div>
                    <ol className="gz-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
                      {gazette.articles.map((a, i) => (
                        <li key={i} className="gz-reveal">
                          <Link href="/gazette" className="gz-row" style={{ gridTemplateColumns: "100px 1fr", gap: 24, padding: "26px 0" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)" }}>
                              <div style={{ marginBottom: 4 }}>{String(i + 1).padStart(2, "0")}</div>
                              <div style={{ color: "var(--ink)" }}>{a.topic}</div>
                            </div>
                            <div>
                              <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.32 }}>{a.title}</div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", marginTop: 12, letterSpacing: "0.04em" }}>
                                {a.presenter && <span>{a.presenter.toUpperCase()}</span>}
                                {a.presenter && a.moderator && <span style={{ margin: "0 8px" }}>·</span>}
                                {a.moderator && <span>{a.moderator.toUpperCase()}</span>}
                                {a.moderator && a.editor && <span style={{ margin: "0 8px" }}>·</span>}
                                {a.editor && <span>{a.editor.toUpperCase()}</span>}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest from across topics ── */}
      {gridContent.length > 0 && (
        <section className="samavesh-container" style={{ paddingTop: 96, paddingBottom: 80 }}>
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40, paddingBottom: 16, borderBottom: "1px solid var(--ink)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.16em", color: "var(--ink)" }}>
                LATEST FROM ACROSS TOPICS
              </div>
              <Link href="/blogs" className="btn-text">
                <span>Browse all</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          </Reveal>
          <ContentGrid items={cardItems} />
        </section>
      )}

      {/* ── Empty state ── */}
      {!featured && !gridContent.length && (
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "160px 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 400, color: "var(--ink)", marginBottom: 20 }}>Samavesh</h1>
          <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.65, color: "var(--ink-soft)", opacity: 0.65, maxWidth: 440 }}>
            An inclusive community for policy discourses. Content coming soon.
          </p>
        </section>
      )}
    </>
  );
}
