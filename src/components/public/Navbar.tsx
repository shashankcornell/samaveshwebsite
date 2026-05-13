"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isThink = pathname.startsWith("/blogs") || pathname.startsWith("/topics") || pathname.startsWith("/types");
  const isCommunity = pathname.startsWith("/community");
  const isAct = pathname.startsWith("/act");

  const navItems = [
    { label: "Think", href: "/blogs", active: isThink },
    { label: "Meet", href: "/community", active: isCommunity },
    { label: "Act", href: "/act", active: isAct },
  ];

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(17,17,17,0.06)" : "1px solid transparent",
          transition: "background 280ms ease, border-color 280ms ease, padding 280ms ease",
          padding: scrolled ? "12px 0" : "20px 0",
        }}
      >
        <div className="samavesh-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image
              src="/monogram.png"
              alt="Samavesh"
              width={scrolled ? 40 : 56}
              height={scrolled ? 40 : 56}
              style={{ objectFit: "contain", transition: "width 280ms ease, height 280ms ease" }}
            />
            <span
              style={{
                fontFamily: "var(--sans)",
                fontSize: scrolled ? 18 : 22,
                color: "var(--ink)",
                letterSpacing: "0.01em",
                transition: "font-size 280ms ease",
              }}
            >
              Samavesh
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 56, fontFamily: "var(--sans)", fontSize: 18 }}>
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "var(--ink)", opacity: 0.7 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`underline-track${item.active ? " is-active" : ""}`}
                style={{ paddingBottom: 4, color: "var(--ink)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile right cluster */}
          <div className="nav-mobile-toggle" style={{ display: "none", alignItems: "center", gap: 20 }}>
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              style={{ display: "flex", alignItems: "center", color: "var(--ink)", opacity: 0.7 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 5, width: 28, height: 28, color: "var(--ink)" }}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 190,
            background: "#111",
            display: "flex",
            flexDirection: "column",
            padding: "100px 28px 56px",
            animation: "srFade 180ms ease",
          }}
        >
          <style>{`@keyframes srFade { from { opacity:0 } to { opacity:1 } }`}</style>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 56,
                  fontWeight: 400,
                  color: item.active ? "#fff" : "rgba(255,255,255,0.4)",
                  lineHeight: 1.2,
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  letterSpacing: "-0.01em",
                  display: "block",
                  animation: `srFade ${200 + i * 60}ms ease both`,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Link
              href="/gazette"
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}
            >
              THE GAZETTE →
            </Link>
            <Link
              href="/topics"
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}
            >
              ALL SECTORS →
            </Link>
          </div>
        </div>
      )}

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
