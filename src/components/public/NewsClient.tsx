"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Reveal } from "./Reveal";
import { formatDate } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  image: string | null;
  externalUrl: string | null;
  sourceName: string | null;
  embedType: string | null;
  embedUrl: string | null;
  embedCode: string | null;
  featured: boolean;
  publishedAt: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  POLICY: "Policy", COMMUNITY: "Community", ANNOUNCEMENT: "Announcement",
  MEDIA: "In the Media", EVENT: "Event", HIRING: "Hiring", RESEARCH: "Research",
};

const CATEGORY_COLORS: Record<string, string> = {
  POLICY: "#2496ff", COMMUNITY: "#22a06b", ANNOUNCEMENT: "#9747ff",
  MEDIA: "#e06b0c", EVENT: "#d42e5a", HIRING: "#22a06b", RESEARCH: "#2496ff",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── YouTube ── */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YouTubeEmbed({ url }: { url: string }) {
  const [play, setPlay] = useState(false);
  const id = youtubeId(url);
  if (!id) return <EmbedError msg="Could not parse YouTube URL." />;
  const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", overflow: "hidden", borderRadius: 2 }}>
      {play ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <button onClick={() => setPlay(true)} aria-label="Play video"
          style={{ position: "absolute", inset: 0, width: "100%", cursor: "pointer", background: "transparent", border: 0, padding: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="Video thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 28px rgba(0,0,0,0.4)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}><path d="M5 3l14 9-14 9V3z" /></svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

/* ── Twitter / X ── */
function TwitterEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const win = window as Window & { twttr?: { widgets: { load: (el: HTMLElement | null) => void } } };
    const load = () => {
      if (win.twttr?.widgets) { win.twttr.widgets.load(ref.current); setLoaded(true); }
    };
    if (win.twttr) { load(); return; }
    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js";
    s.async = true;
    s.onload = load;
    document.body.appendChild(s);
  }, [url]);
  return (
    <div ref={ref} style={{ minHeight: loaded ? undefined : 100 }}>
      <blockquote className="twitter-tweet" data-dnt="true"><a href={url}>View on X</a></blockquote>
      {!loaded && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", padding: "12px 0" }}>Loading post…</div>}
    </div>
  );
}

/* ── Instagram ── */
function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const win = window as Window & { instgrm?: { Embeds: { process: () => void } } };
    const load = () => { win.instgrm?.Embeds?.process(); };
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

/* ── LinkedIn card ── */
function LinkedInCard({ item }: { item: NewsItem }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={item.embedUrl ?? item.externalUrl ?? "#"} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "block", textDecoration: "none", border: `1px solid ${hov ? "var(--ink)" : "var(--rule)"}`, borderRadius: 4, padding: "18px 20px", background: "var(--paper)", transition: "border-color 200ms ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 4, background: "#0077b5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>in</div>
        {item.sourceName && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)" }}>{item.sourceName}</span>}
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-soft)", letterSpacing: "0.12em" }}>LINKEDIN</span>
      </div>
      <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "var(--ink)", margin: "0 0 10px" }}>{item.description || item.title}</p>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", color: "#0077b5" }}>VIEW POST →</span>
    </a>
  );
}

/* ── Custom HTML embed ── */
function CustomEmbed({ code }: { code: string }) {
  return <div style={{ width: "100%", overflowX: "hidden" }} dangerouslySetInnerHTML={{ __html: code }} />;
}

function EmbedError({ msg }: { msg: string }) {
  return <div style={{ padding: "16px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", background: "var(--tint-sand)", letterSpacing: "0.06em" }}>{msg}</div>;
}

function EmbedBlock({ item }: { item: NewsItem }) {
  if (item.embedType === "youtube" && item.embedUrl) return <YouTubeEmbed url={item.embedUrl} />;
  if (item.embedType === "twitter" && item.embedUrl) return <TwitterEmbed url={item.embedUrl} />;
  if (item.embedType === "instagram" && item.embedUrl) return <InstagramEmbed url={item.embedUrl} />;
  if (item.embedType === "linkedin") return <LinkedInCard item={item} />;
  if (item.embedType === "custom" && item.embedCode) return <CustomEmbed code={item.embedCode} />;
  return null;
}

/* ── Category badge ── */
function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#111";
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.16em", padding: "2px 8px", borderRadius: 999, border: `1px solid ${color}`, color, whiteSpace: "nowrap" }}>
      {(CATEGORY_LABELS[category] ?? category).toUpperCase()}
    </span>
  );
}

/* ── Timeline item ── */
function TimelineItem({ item, isLast }: { item: NewsItem; isLast: boolean }) {
  const hasEmbed = !!item.embedType;
  const hasSocial = item.embedType === "twitter" || item.embedType === "instagram" || item.embedType === "linkedin";
  const href = item.externalUrl && !hasEmbed ? item.externalUrl : null;

  const content = (
    <div className="tl-item-card" style={{ paddingBottom: isLast ? 0 : 40 }}>
      {/* Cover image */}
      {!hasEmbed && item.image && (
        <div className="image-cinematic-matte" style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "var(--tint-sand)", marginBottom: 14, borderRadius: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 600ms cubic-bezier(.2,.7,.2,1)" }} className="tl-item-img" />
        </div>
      )}

      {/* Embed */}
      {hasEmbed && (
        <div style={{ marginBottom: 14 }}>
          <EmbedBlock item={item} />
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <CategoryBadge category={item.category} />
        {item.sourceName && !hasSocial && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.06em" }}>{item.sourceName}</span>
        )}
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-soft)", opacity: 0.5, marginLeft: "auto" }}>
          {item.publishedAt ? formatDate(item.publishedAt) : ""}
        </span>
      </div>

      {/* Title */}
      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 22, lineHeight: 1.25, margin: "0 0 8px", color: "var(--ink)" }}>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}
            className="tl-title-link">{item.title}</a>
        ) : item.title}
      </h2>

      {/* Description */}
      {item.description && !hasSocial && (
        <p style={{ fontFamily: "var(--sans)", fontSize: 13, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0 }}>
          {item.description}
        </p>
      )}

      {href && (
        <div style={{ marginTop: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-soft)" }}>READ MORE →</span>
        </div>
      )}
    </div>
  );

  return content;
}

/* ── Month group header ── */
function MonthHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, position: "relative" }}>
      {/* Diamond marker on the line */}
      <div style={{ position: "absolute", left: -1, width: 10, height: 10, background: "var(--ink)", transform: "rotate(45deg) translateX(-50%)", transformOrigin: "left center", flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em", color: "var(--ink)", paddingLeft: 20, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

/* ── Sidebar filter ── */
function Sidebar({
  items, activeYear, activeMonth, activeCategory,
  setYear, setMonth, setCategory,
}: {
  items: NewsItem[];
  activeYear: number | null;
  activeMonth: number | null;
  activeCategory: string;
  setYear: (y: number | null) => void;
  setMonth: (m: number | null) => void;
  setCategory: (c: string) => void;
}) {
  const years = useMemo(() => {
    const s = new Set<number>();
    items.forEach(i => { if (i.publishedAt) s.add(new Date(i.publishedAt).getFullYear()); });
    return Array.from(s).sort((a, b) => b - a);
  }, [items]);

  const usedCategories = useMemo(() => {
    return Array.from(new Set(items.map(i => i.category)));
  }, [items]);

  const pill = (active: boolean) => ({
    fontFamily: "var(--mono)" as const,
    fontSize: 11,
    letterSpacing: "0.08em",
    padding: "5px 14px",
    borderRadius: 999,
    border: `1px solid ${active ? "var(--ink)" : "var(--rule)"}`,
    background: active ? "var(--ink)" : "transparent",
    color: active ? "var(--paper)" : "var(--ink-soft)",
    cursor: "pointer" as const,
    transition: "all 140ms ease",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Years */}
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-soft)", marginBottom: 12, textTransform: "uppercase" }}>Year</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button style={pill(activeYear === null)} onClick={() => { setYear(null); setMonth(null); }}>All years</button>
          {years.map(y => (
            <button key={y} style={pill(activeYear === y)} onClick={() => { setYear(y); setMonth(null); }}>{y}</button>
          ))}
        </div>
      </div>

      {/* Months */}
      {activeYear !== null && (
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-soft)", marginBottom: 12, textTransform: "uppercase" }}>Month</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {MONTHS.map((m, idx) => (
              <button key={m} style={{ ...pill(activeMonth === idx + 1), padding: "5px 6px", textAlign: "center" as const }}
                onClick={() => setMonth(activeMonth === idx + 1 ? null : idx + 1)}>{m}</button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-soft)", marginBottom: 12, textTransform: "uppercase" }}>Category</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button style={pill(activeCategory === "ALL")} onClick={() => setCategory("ALL")}>All</button>
          {usedCategories.map(cat => (
            <button key={cat} style={pill(activeCategory === cat)} onClick={() => setCategory(cat)}>
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main client ── */
export function NewsClient({ items }: { items: NewsItem[] }) {
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filtered = useMemo(() => {
    return items.filter(item => {
      const d = item.publishedAt ? new Date(item.publishedAt) : null;
      if (activeYear !== null && (!d || d.getFullYear() !== activeYear)) return false;
      if (activeMonth !== null && (!d || d.getMonth() + 1 !== activeMonth)) return false;
      if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
      return true;
    });
  }, [items, activeYear, activeMonth, activeCategory]);

  /* Group by YYYY-MM descending */
  const groups = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    for (const item of filtered) {
      const d = item.publishedAt ? new Date(item.publishedAt) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "undated";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const groupLabel = (key: string) => {
    if (key === "undated") return "Undated";
    const [y, m] = key.split("-");
    return `${MONTHS[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div>
      {/* Mobile filter strip */}
      <div className="tl-mobile-filters" style={{ display: "none", borderBottom: "1px solid var(--rule)", padding: "12px 0", position: "sticky", top: 0, background: "var(--paper)", zIndex: 50 }}>
        <div className="samavesh-container">
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            <button
              className="pill"
              style={{ fontSize: 12, padding: "5px 14px", whiteSpace: "nowrap" }}
              onClick={() => { setActiveYear(null); setActiveMonth(null); setActiveCategory("ALL"); }}>
              All
            </button>
            {Array.from(new Set(items.filter(i => i.publishedAt).map(i => new Date(i.publishedAt!).getFullYear()))).sort((a,b)=>b-a).map(y => (
              <button key={y} className={`pill${activeYear === y ? " is-active" : ""}`}
                style={{ fontSize: 12, padding: "5px 14px", whiteSpace: "nowrap" }}
                onClick={() => { setActiveYear(activeYear === y ? null : y); setActiveMonth(null); }}>
                {y}
              </button>
            ))}
            {Array.from(new Set(items.map(i => i.category))).map(cat => (
              <button key={cat} className={`pill${activeCategory === cat ? " is-active" : ""}`}
                style={{ fontSize: 12, padding: "5px 14px", whiteSpace: "nowrap" }}
                onClick={() => setActiveCategory(activeCategory === cat ? "ALL" : cat)}>
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="samavesh-container" style={{ paddingTop: 56, paddingBottom: 120 }}>
        <div className="tl-layout" style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 64, alignItems: "start" }}>

          {/* ── Timeline column ── */}
          <div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>Nothing here yet.</p>
              </div>
            ) : (
              <div>
                {groups.map(([key, groupItems]) => (
                  <div key={key} style={{ display: "flex", gap: 0 }}>
                    {/* Rail */}
                    <div style={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Vertical line */}
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "var(--rule)", transform: "translateX(-50%)" }} />
                    </div>

                    {/* Group content */}
                    <div style={{ flex: 1, paddingBottom: 56 }}>
                      {/* Month header with diamond */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, position: "relative" }}>
                        <div style={{
                          position: "absolute", left: -32, top: "50%",
                          width: 10, height: 10,
                          background: "var(--ink)",
                          transform: "rotate(45deg) translate(-50%, -50%)",
                          transformOrigin: "center center",
                          flexShrink: 0,
                          zIndex: 1,
                        }} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink)", textTransform: "uppercase" }}>
                          {groupLabel(key)}
                        </span>
                        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-soft)", opacity: 0.5 }}>{groupItems.length}</span>
                      </div>

                      {/* Items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {groupItems.map((item, idx) => (
                          <Reveal key={item.id} delay={idx * 40}>
                            <div style={{ display: "flex", gap: 0, position: "relative" }}>
                              {/* Dot on rail */}
                              <div style={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                                <div style={{ position: "absolute", top: 8, left: "50%", width: 8, height: 8, borderRadius: "50%", border: "1.5px solid var(--ink)", background: "var(--paper)", transform: "translateX(-50%)", zIndex: 1 }} />
                                {idx < groupItems.length - 1 && (
                                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "var(--rule)", transform: "translateX(-50%)" }} />
                                )}
                              </div>

                              {/* Content */}
                              <div style={{ flex: 1, paddingLeft: 20, paddingBottom: idx < groupItems.length - 1 ? 40 : 0 }}>
                                <TimelineItem item={item} isLast={idx === groupItems.length - 1} />
                              </div>
                            </div>
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Sticky sidebar ── */}
          <div className="tl-sidebar" style={{ position: "sticky", top: 80 }}>
            <Sidebar
              items={items}
              activeYear={activeYear}
              activeMonth={activeMonth}
              activeCategory={activeCategory}
              setYear={setActiveYear}
              setMonth={setActiveMonth}
              setCategory={setActiveCategory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
