"use client";

import { useState } from "react";
import { Reveal } from "@/components/public/Reveal";

const TABS = [
  {
    id: "discourse",
    label: "Discourse Rules",
    content: (
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, color: "var(--ink)", marginBottom: 24 }}>
          How we talk
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 20 }}>
          Samavesh is a space for rigorous, respectful policy discourse. Every voice is welcome;
          every argument must stand on evidence and reason.
        </p>
        <ul style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.8, color: "var(--ink-soft)", paddingLeft: 24 }}>
          {[
            "Engage with ideas, not identities.",
            "Cite your sources and be transparent about your assumptions.",
            "Acknowledge complexity — policy rarely has simple answers.",
            "Dissent is welcome; personal attacks are not.",
            "Listen as much as you speak.",
          ].map((rule) => (
            <li key={rule} style={{ marginBottom: 12 }}>{rule}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "chapter",
    label: "Local Chapter",
    content: (
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, color: "var(--ink)", marginBottom: 24 }}>
          Start a chapter
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 32 }}>
          Samavesh chapters bring policy discourse into universities, cities, and communities.
          If you&rsquo;re passionate about civic engagement and local governance, we&rsquo;d love
          to support you in starting a chapter.
        </p>
        <a
          href="mailto:hello@samavesh.in?subject=Local Chapter Interest"
          className="btn-text"
        >
          Express interest
          <span className="arrow">→</span>
        </a>
      </div>
    ),
  },
  {
    id: "externs",
    label: "Externs",
    content: (
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, color: "var(--ink)", marginBottom: 24 }}>
          Externships
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 20 }}>
          Our externship programme places young researchers and writers with policy organisations,
          think tanks, and civil society groups for short-term immersive experiences.
        </p>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 32 }}>
          Applications open twice a year. Externs contribute original research and join our
          community of contributors.
        </p>
        <a
          href="mailto:hello@samavesh.in?subject=Externship Application"
          className="btn-text"
        >
          Apply
          <span className="arrow">→</span>
        </a>
      </div>
    ),
  },
  {
    id: "summit",
    label: "Annual Summit",
    content: (
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, color: "var(--ink)", marginBottom: 24 }}>
          Annual Summit
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 20 }}>
          Once a year, the Samavesh community gathers for two days of keynotes, workshops,
          and structured discourse sessions. The summit brings together policymakers, academics,
          practitioners, and young changemakers.
        </p>
        <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 19, lineHeight: 1.7, color: "var(--ink-soft)", opacity: 0.65, maxWidth: 560, marginBottom: 32 }}>
          Next summit details will be announced soon.
        </p>
        <a
          href="mailto:hello@samavesh.in?subject=Summit Interest"
          className="btn-text"
        >
          Stay updated
          <span className="arrow">→</span>
        </a>
      </div>
    ),
  },
  {
    id: "work",
    label: "Work with us",
    content: (
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, color: "var(--ink)", marginBottom: 24 }}>
          Work with Samavesh
        </h2>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 20 }}>
          We collaborate with researchers, writers, designers, and technologists who share our
          commitment to evidence-based policy discourse.
        </p>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 640, marginBottom: 32 }}>
          Whether you want to contribute writing, help organise events, or partner on a project —
          we&rsquo;d love to hear from you.
        </p>
        <a
          href="mailto:hello@samavesh.in?subject=Collaboration"
          className="btn-text"
        >
          Get in touch
          <span className="arrow">→</span>
        </a>
      </div>
    ),
  },
];

export default function ActPage() {
  const [activeTab, setActiveTab] = useState("discourse");
  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div>
      {/* Header */}
      <div style={{ background: "var(--hero-cream)", padding: "72px 0 48px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
              Act
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink-soft)", opacity: 0.65 }}>
              Participate, organise, and create change.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: "1px solid var(--rule)", padding: "20px 0", position: "sticky", top: 72, background: "var(--paper)", zIndex: 50 }}>
        <div className="samavesh-container">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pill${t.id === activeTab ? " is-active" : ""}`}
                style={{ fontSize: 15, padding: "8px 20px" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "72px 0 120px" }}>
        <div className="samavesh-container">
          <Reveal key={activeTab}>
            {tab.content}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
