"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <footer
      style={{
        background: "var(--ink)",
        color: "var(--paper)",
        paddingTop: 72,
        paddingBottom: 48,
      }}
    >
      <div className="samavesh-container">
        {/* Top section: logo + tagline + links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            paddingBottom: 56,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Left: monogram + quote */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Image src="/monogram-white.png" alt="Samavesh" width={48} height={48} style={{ objectFit: "contain" }} />
              <span
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 22,
                  color: "var(--paper)",
                  letterSpacing: "0.01em",
                }}
              >
                Samavesh
              </span>
            </Link>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 20,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.65)",
                maxWidth: 380,
              }}
            >
              &ldquo;An inclusive community for policy discourses. A sounding board for policy solutions
              aiming to solve the wicked challenges of our times.&rdquo;
            </p>
          </div>

          {/* Right: nav + social + newsletter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {/* Nav links */}
            <div style={{ display: "flex", gap: 56 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                  Explore
                </span>
                {[
                  { label: "Think", href: "/blogs" },
                  { label: "Meet", href: "/community" },
                  { label: "Act", href: "/act" },
                  { label: "Gazzette", href: "/gazette" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ fontFamily: "var(--serif)", fontSize: 18, color: "rgba(255,255,255,0.75)" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                  Follow
                </span>
                {[
                  { label: "Instagram", href: "https://instagram.com" },
                  { label: "LinkedIn", href: "https://linkedin.com" },
                  { label: "WhatsApp", href: "https://wa.me" },
                  { label: "Twitter / X", href: "https://x.com" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--serif)", fontSize: 18, color: "rgba(255,255,255,0.75)" }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 14 }}>
                Newsletter
              </p>
              {submitted ? (
                <p style={{ fontFamily: "var(--serif)", fontSize: 18, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>
                  Thank you for subscribing.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 0 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      fontFamily: "var(--serif)",
                      fontSize: 16,
                      padding: "10px 16px",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRight: "none",
                      color: "var(--paper)",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      padding: "10px 20px",
                      background: "var(--paper)",
                      color: "var(--ink)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: copyright */}
        <div
          style={{
            paddingTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} Samavesh. All rights reserved.
          </p>
          <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            Policy discourse. Community action.
          </p>
        </div>
      </div>
    </footer>
  );
}
