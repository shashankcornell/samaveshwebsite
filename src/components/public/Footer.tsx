"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FooterData, FooterLink } from "@/lib/footerData";

export type { FooterData, FooterLink };

const muted = "rgba(255,255,255,0.55)";
const rule = "rgba(255,255,255,0.18)";
const fg = "#fff";
const bg = "#111";

const colTitle: React.CSSProperties = {
  fontFamily: "var(--mono)", fontSize: 11, color: muted,
  letterSpacing: "0.18em", marginBottom: 18, textTransform: "uppercase",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const isExternal = href.startsWith("http");
  const style: React.CSSProperties = {
    fontFamily: "var(--sans)", fontSize: 15, color: fg,
    padding: "6px 0", display: "block",
    opacity: hovered ? 1 : 0.8,
    transform: hovered ? "translateX(8px)" : "translateX(0)",
    transition: "transform 280ms cubic-bezier(.2,.7,.2,1), opacity 200ms ease",
  };
  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </a>
  ) : (
    <Link href={href} style={style}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </Link>
  );
}

function SocialPill({ label, href }: FooterLink) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{
        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em",
        padding: "8px 14px", border: `1px solid ${hovered ? fg : rule}`, borderRadius: 999,
        textDecoration: "none",
        background: hovered ? fg : "transparent",
        color: hovered ? bg : fg,
        transition: "background 200ms ease, color 200ms ease, border-color 200ms ease",
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label.toUpperCase()}
    </a>
  );
}

export function Footer({ data }: { data: FooterData }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubmitted(true); setEmail(""); }
  };

  const d = data;

  return (
    <footer style={{ background: bg, color: fg, position: "relative", overflow: "hidden" }}>

      {/* Top editorial strip */}
      <div style={{ borderTop: `1px solid ${rule}`, borderBottom: `1px solid ${rule}` }}>
        <div className="samavesh-container footer-strip-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, paddingTop: 18, paddingBottom: 18, flexWrap: "wrap", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", color: muted }}>
          <span>{d.stripLocation}</span>
          {d.stripDiscourse && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22a06b", display: "inline-block" }} />
              <span>{d.stripDiscourse}</span>
            </span>
          )}
          {d.stripIssueLine && <span>{d.stripIssueLine}</span>}
        </div>
      </div>

      {/* Main grid */}
      <div className="samavesh-container" style={{ paddingTop: 96, paddingBottom: 80 }}>
        <div className="footer-main-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.8fr 1.4fr", gap: 56 }}>

          {/* Mission */}
          <div>
            <div style={{ marginBottom: 28 }}>
              <Image src="/monogram-white.png" alt="Samavesh" width={56} height={44} style={{ objectFit: "contain" }} />
            </div>
            {d.tagline && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: muted, letterSpacing: "0.18em", marginBottom: 20, textTransform: "uppercase" }}>
                {d.tagline}
              </div>
            )}
            {d.quote && (
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 21, lineHeight: 1.45, margin: 0, maxWidth: 340, color: "rgba(255,255,255,0.85)" }}>
                &ldquo;{d.quote}&rdquo;
              </p>
            )}
          </div>

          {/* 01 / READ */}
          <div>
            <div style={colTitle}>01 / READ</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {d.readLinks.map((l, i) => <NavLink key={i} href={l.href}>{l.label}</NavLink>)}
            </div>
          </div>

          {/* 02 / ACT */}
          <div>
            <div style={colTitle}>02 / ACT</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {d.actLinks.map((l, i) => <NavLink key={i} href={l.href}>{l.label}</NavLink>)}
            </div>
          </div>

          {/* 03 / EXPLORE */}
          <div>
            <div style={colTitle}>03 / EXPLORE</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {d.exploreLinks.map((l, i) => <NavLink key={i} href={l.href}>{l.label}</NavLink>)}
            </div>
          </div>

          {/* 04 / THE FORTNIGHTLY */}
          <div>
            <div style={colTitle}>04 / THE FORTNIGHTLY</div>
            {d.newsletterBlurb && (
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, lineHeight: 1.45, marginBottom: 20, color: "rgba(255,255,255,0.85)" }}>
                {d.newsletterBlurb}
              </p>
            )}
            {submitted ? (
              <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: muted, fontStyle: "italic" }}>
                Thank you for subscribing.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ borderBottom: `1.5px solid ${fg}`, padding: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="email" placeholder="your@email.in" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  style={{ flex: 1, background: "transparent", border: 0, outline: "none", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: fg }}
                />
                <button type="submit" style={{ background: "transparent", border: 0, color: fg, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 0", whiteSpace: "nowrap" }}>
                  SUBSCRIBE <span style={{ fontSize: 18 }}>→</span>
                </button>
              </form>
            )}
            <div style={{ marginTop: 12, fontFamily: "var(--sans)", fontSize: 12, color: muted }}>
              No spam. Unsubscribe in one click.
            </div>

            {/* Contact */}
            {(d.address || d.email || d.phone) && (
              <div className="footer-contact-grid" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {d.address && (
                  <div>
                    <div style={colTitle}>VISIT</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-line" }}>{d.address}</div>
                  </div>
                )}
                {(d.email || d.phone) && (
                  <div>
                    <div style={colTitle}>WRITE</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
                      {d.email && <div>{d.email}</div>}
                      {d.phone && <div>{d.phone}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social pills */}
            {d.socialLinks.length > 0 && (
              <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {d.socialLinks.map((s, i) => <SocialPill key={i} {...s} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom legal */}
      <div style={{ borderTop: `1px solid ${rule}` }}>
        <div className="samavesh-container footer-legal-bar" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, paddingTop: 22, paddingBottom: 22, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em", color: muted }}>
          <span>© SAMAVESH {new Date().getFullYear()} · ALL RIGHTS RESERVED</span>
          {d.legalLinks.length > 0 && (
            <span className="footer-legal-links" style={{ display: "inline-flex", gap: 28, flexWrap: "wrap" }}>
              {d.legalLinks.map((l, i) => (
                <Link key={i} href={l.href} style={{ color: muted }}>{l.label.toUpperCase()}</Link>
              ))}
            </span>
          )}
          {d.legalTagline && <span>{d.legalTagline.toUpperCase()}</span>}
        </div>
      </div>
    </footer>
  );
}
