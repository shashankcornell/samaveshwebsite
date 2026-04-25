"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Reveal } from "./Reveal";
import { HomeCard } from "./HomeCard";
import { formatDate } from "@/lib/utils";
import type { HomeContentItem } from "@/app/(public)/page";

const FALLBACK_IMAGES = [
  "/topic-health.jpg",
  "/topic-education.jpg",
  "/topic-urbanisation.jpg",
  "/topic-technology.jpg",
  "/topic-national-security.jpg",
];

interface Topic {
  id: string;
  name: string;
  slug: string;
  count: number;
  image: string | null;
}

interface HomeClientProps {
  featured: HomeContentItem | null;
  gridContent: HomeContentItem[];
  topics: Topic[];
}

/* ── Sticky navbar (homepage-only, appears after scroll) ── */
function HomeStickyNav({ visible }: { visible: boolean }) {
  return (
    <header
      aria-hidden={!visible}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid rgba(17,17,17,0.07)",
        padding: "12px 0",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 260ms ease",
      }}
    >
      <div
        className="samavesh-container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/monogram.png"
            alt="Samavesh"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontFamily: "var(--sans)", fontSize: 17, color: "var(--ink)" }}>
            Samavesh
          </span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 48 }}>
          {[
            { label: "Think", href: "/blogs" },
            { label: "Meet", href: "/community" },
            { label: "Act", href: "/act" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="underline-track"
              style={{
                fontFamily: "var(--sans)",
                fontSize: 16,
                color: "var(--ink)",
                paddingBottom: 4,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function HomeClient({ featured, gridContent, topics }: HomeClientProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > window.innerHeight * 0.82);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Think", href: "/blogs" },
    { label: "Meet", href: "/community" },
    { label: "Act", href: "/act" },
  ];

  return (
    <>
      <HomeStickyNav visible={stickyVisible} />

      {/* ── Hero ── */}
      <section className="hero-section">
        {/* Left panel: pale blue */}
        <div className="hero-left">
          {/* Top row: logo + mobile nav */}
          <div className="hero-top-row">
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image
                src="/monogram.png"
                alt="Samavesh"
                width={48}
                height={48}
                style={{ objectFit: "contain" }}
                priority
              />
              <span className="hero-wordmark">Samavesh</span>
            </Link>
            {/* Mobile-only nav */}
            <nav className="hero-mobile-nav" aria-label="Site navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="underline-track"
                  style={{ fontFamily: "var(--sans)", fontSize: 15, color: "var(--ink)", paddingBottom: 3 }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: intro + topic list + CTA */}
          <div className="hero-content">
            <p className="hero-intro">Policy discussions on...</p>

            <nav aria-label="Topics">
              {topics.map((topic, i) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="hero-topic"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onFocus={() => setHoverIdx(i)}
                  onBlur={() => setHoverIdx(null)}
                >
                  {topic.name}
                </Link>
              ))}

              {/* Fallback if no topics from DB */}
              {topics.length === 0 &&
                ["Health", "Education", "Urbanisation", "Technology", "National Security"].map(
                  (name, i) => (
                    <span key={i} className="hero-topic hero-topic--static">
                      {name}
                    </span>
                  )
                )}
            </nav>

            <div style={{ marginTop: 40 }}>
              <Link href="/topics" className="btn-circle-cta">
                <span className="btn-circle-cta__text">More topics</span>
                <span className="btn-circle-cta__circle" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right panel: warm cream + nav + image — hidden on mobile */}
        <div className="hero-right">
          {/* Desktop nav top-right */}
          <nav
            className="hero-right-nav"
            aria-label="Site navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="underline-track"
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 18,
                  color: "var(--ink)",
                  paddingBottom: 4,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Topic image — cross-fades on hover */}
          <div className="hero-image-wrap">
            <div
              style={{
                position: "relative",
                width: "min(380px, 80%)",
                aspectRatio: "3 / 4",
              }}
            >
              {FALLBACK_IMAGES.map((fallback, i) => {
                const src = topics[i]?.image ?? fallback;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: i === (hoverIdx ?? 0) ? 1 : 0,
                      transition: "opacity 480ms ease",
                      willChange: "opacity",
                    }}
                  >
                    <Image
                      src={src}
                      alt={topics[i]?.name ?? "Topic"}
                      fill
                      priority={i === 0}
                      style={{ objectFit: "cover" }}
                      sizes="40vw"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      {featured && (
        <section style={{ background: "var(--paper)", padding: "72px 0 56px" }}>
          <div className="samavesh-container">
            <Reveal>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  opacity: 0.4,
                  marginBottom: 36,
                }}
              >
                Featured
              </p>
            </Reveal>
            <Link href={`/blogs/${featured.slug}`} style={{ display: "block" }}>
              <article className="featured-grid card-lift">
                <div
                  style={{
                    position: "relative",
                    paddingTop: "66%",
                    overflow: "hidden",
                    background: "var(--tint-sand)",
                  }}
                >
                  {featured.thumbnail ? (
                    <Image
                      src={featured.thumbnail}
                      alt={featured.title}
                      fill
                      priority
                      style={{ objectFit: "cover" }}
                      className="card-img"
                      sizes="50vw"
                    />
                  ) : (
                    <div
                      style={{ position: "absolute", inset: 0, background: "var(--tint-sand)" }}
                    />
                  )}
                </div>
                <div>
                  <Reveal>
                    <span
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--accent-blue)",
                        marginBottom: 16,
                        display: "block",
                      }}
                    >
                      {featured.contentType.name}
                    </span>
                    <h2
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "clamp(26px, 3vw, 40px)",
                        fontWeight: 400,
                        lineHeight: 1.25,
                        color: "var(--ink)",
                        margin: "0 0 20px",
                      }}
                    >
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: 18,
                          lineHeight: 1.65,
                          color: "var(--ink-soft)",
                          opacity: 0.75,
                          marginBottom: 24,
                        }}
                      >
                        {featured.excerpt}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      {featured.topics.slice(0, 2).map((t) => (
                        <span
                          key={t.slug}
                          style={{
                            fontFamily: "var(--sans)",
                            fontSize: 12,
                            color: "var(--ink)",
                            opacity: 0.45,
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                      {featured.publishedAt && (
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 12,
                            color: "var(--ink)",
                            opacity: 0.3,
                          }}
                        >
                          {formatDate(featured.publishedAt)}
                        </span>
                      )}
                    </div>
                  </Reveal>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* ── Latest content grid ── */}
      {gridContent.length > 0 && (
        <section style={{ padding: "56px 0 112px" }}>
          <div className="samavesh-container">
            <Reveal>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 48,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    opacity: 0.4,
                    margin: 0,
                  }}
                >
                  Latest
                </p>
                <Link href="/blogs" className="btn-text" style={{ fontSize: 15 }}>
                  View all
                  <span className="arrow" style={{ width: 28, height: 28 }}>→</span>
                </Link>
              </div>
            </Reveal>
            <div className="homepage-grid">
              {gridContent.map((item, i) => (
                <Reveal key={item.slug} delay={Math.min(i % 3, 2) * 80}>
                  <HomeCard item={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!featured && !gridContent.length && (
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "160px 24px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 48,
              fontWeight: 400,
              color: "var(--ink)",
              marginBottom: 20,
            }}
          >
            Samavesh
          </h1>
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 20,
              lineHeight: 1.65,
              color: "var(--ink-soft)",
              opacity: 0.65,
              maxWidth: 440,
            }}
          >
            An inclusive community for policy discourses. Content coming soon.
          </p>
        </section>
      )}
    </>
  );
}
