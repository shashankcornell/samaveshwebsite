"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ContentResult  { slug: string; title: string; type: string; topic: string | null }
interface ProfileResult  { slug: string; name: string; title: string | null }
interface TopicResult    { slug: string; name: string }
interface SearchResults  { content: ContentResult[]; profiles: ProfileResult[]; topics: TopicResult[] }

const MUTED = "rgba(255,255,255,0.38)";
const SOFT  = "rgba(255,255,255,0.78)";
const RULE  = "rgba(255,255,255,0.1)";

/* ── Section header ── */
function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.2em",
      color: MUTED, paddingBottom: 12, marginBottom: 4,
      borderBottom: `1px solid ${RULE}`,
    }}>
      {n} / {label}
    </div>
  );
}

/* ── Single result row ── */
function Row({ href, title, meta, onClose }: { href: string; title: string; meta?: string; onClose: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href}
      onClick={onClose}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 32,
        padding: "15px 0", borderBottom: `1px solid ${RULE}`,
        transform: hov ? "translateX(8px)" : "translateX(0)",
        transition: "transform 240ms cubic-bezier(.2,.7,.2,1)",
        textDecoration: "none",
      }}
    >
      <span style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.3, color: hov ? "#fff" : SOFT, transition: "color 180ms ease", flex: 1 }}>
        {title}
      </span>
      {meta && (
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", color: MUTED, whiteSpace: "nowrap", flexShrink: 0 }}>
          {meta}
        </span>
      )}
    </Link>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div style={{
      width: 18, height: 18, flexShrink: 0,
      border: `1.5px solid ${RULE}`,
      borderTopColor: "rgba(255,255,255,0.55)",
      borderRadius: "50%",
      animation: "srSpin 550ms linear infinite",
    }} />
  );
}

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* focus on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* ESC closes */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* debounced fetch */
  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await r.json());
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(t);
  }, [query]);

  const total = results ? results.content.length + results.profiles.length + results.topics.length : 0;

  return (
    <>
      <style>{`
        @keyframes srFade { from { opacity:0 } to { opacity:1 } }
        @keyframes srRise { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes srSpin { to { transform:rotate(360deg) } }
      `}</style>

      {/* Backdrop — click outside to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(17,17,17,0.97)",
          animation: "srFade 160ms ease",
          overflowY: "auto",
        }}
      >
        {/* Panel — stop propagation */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 820, margin: "0 auto",
            padding: "0 48px 120px",
            animation: "srRise 260ms cubic-bezier(.2,.7,.2,1)",
          }}
        >

          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "28px 0 0",
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.22em", color: MUTED }}>
              SAMAVESH
            </span>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em", color: MUTED, cursor: "pointer",
              }}
            >
              <span style={{ border: `1px solid ${RULE}`, borderRadius: 3, padding: "3px 6px", fontSize: 9 }}>ESC</span>
              CLOSE
            </button>
          </div>

          {/* Input row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 18,
            borderBottom: `1.5px solid rgba(255,255,255,0.18)`,
            marginTop: 48, paddingBottom: 16,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Samavesh."
              style={{
                flex: 1, background: "transparent", border: 0, outline: "none",
                fontFamily: "var(--serif)", fontSize: 40, fontWeight: 400,
                color: "#fff", letterSpacing: "-0.01em",
                caretColor: "rgba(255,255,255,0.55)",
              }}
            />

            {loading && <Spinner />}

            {query && !loading && (
              <button
                onClick={() => setQuery("")}
                style={{ color: MUTED, fontSize: 22, lineHeight: 1, cursor: "pointer", flexShrink: 0 }}
              >
                ×
              </button>
            )}
          </div>

          {/* ── Empty prompt ── */}
          {!query && (
            <div style={{ marginTop: 52 }}>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                Search for articles, discourse papers,<br />community members, or sectors.
              </p>

              {/* Quick-access sector pills */}
              <div style={{ marginTop: 40, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Health", "Education", "Urbanisation", "Technology", "Governance"].map(name => (
                  <Link
                    key={name}
                    href={`/topics/${name.toLowerCase()}`}
                    onClick={onClose}
                    style={{
                      fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em",
                      padding: "8px 18px", border: `1px solid ${RULE}`, borderRadius: 999,
                      color: SOFT, textDecoration: "none",
                    }}
                  >
                    {name.toUpperCase()}
                  </Link>
                ))}
              </div>

              {/* Quick links */}
              <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 0 }}>
                <SectionLabel n="—" label="QUICK LINKS" />
                {[
                  { label: "All articles", href: "/blogs" },
                  { label: "Meet the community", href: "/community" },
                  { label: "The Gazette", href: "/gazette" },
                  { label: "Ways to act", href: "/act" },
                ].map(l => (
                  <Row key={l.href} href={l.href} title={l.label} onClose={onClose} />
                ))}
              </div>
            </div>
          )}

          {/* ── No results ── */}
          {query.length >= 2 && !loading && results && total === 0 && (
            <div style={{ marginTop: 52 }}>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28, color: "rgba(255,255,255,0.45)", lineHeight: 1.4, margin: 0 }}>
                Nothing found for &ldquo;{query}&rdquo;
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: MUTED, marginTop: 14 }}>
                Try a different spelling, or browse by sector.
              </p>
            </div>
          )}

          {/* ── Results ── */}
          {results && total > 0 && (
            <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 44 }}>

              {results.content.length > 0 && (
                <div>
                  <SectionLabel n="01" label="ARTICLES & PAPERS" />
                  {results.content.map(c => (
                    <Row
                      key={c.slug}
                      href={`/blogs/${c.slug}`}
                      title={c.title}
                      meta={[c.type, c.topic].filter(Boolean).join(" · ")}
                      onClose={onClose}
                    />
                  ))}
                </div>
              )}

              {results.profiles.length > 0 && (
                <div>
                  <SectionLabel n="02" label="PEOPLE" />
                  {results.profiles.map(p => (
                    <Row
                      key={p.slug}
                      href={`/community/${p.slug}`}
                      title={p.name}
                      meta={p.title?.toUpperCase() ?? undefined}
                      onClose={onClose}
                    />
                  ))}
                </div>
              )}

              {results.topics.length > 0 && (
                <div>
                  <SectionLabel n="03" label="SECTORS" />
                  {results.topics.map(t => (
                    <Row
                      key={t.slug}
                      href={`/topics/${t.slug}`}
                      title={t.name}
                      meta="SECTOR"
                      onClose={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
