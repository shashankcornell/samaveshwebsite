"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Homepage manages its own integrated hero header + sticky nav
  if (pathname === "/") return null;

  const isThink = pathname.startsWith("/blogs") || pathname.startsWith("/topics") || pathname.startsWith("/types");
  const isCommunity = pathname.startsWith("/community");
  const isAct = pathname.startsWith("/act");

  const navItems = [
    { label: "Think", href: "/blogs", active: isThink },
    { label: "Meet", href: "/community", active: isCommunity },
    { label: "Act", href: "/act", active: isAct },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(17,17,17,0.06)" : "1px solid transparent",
        transition: "background 280ms ease, border-color 280ms ease, padding 280ms ease",
        padding: scrolled ? "12px 0" : "20px 0",
      }}
    >
      <div
        className="samavesh-container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
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

        <nav style={{ display: "flex", alignItems: "center", gap: 56, fontFamily: "var(--sans)", fontSize: 18 }}>
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
      </div>
    </header>
  );
}
