"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Reveal } from "./Reveal";
import type { ActData, ActTab } from "@/components/admin/ActPageForm";

function ActSide({ tab }: { tab: ActTab }) {
  if (tab.sideKind === "list" && tab.list?.length) {
    return (
      <ol className="act-side-list" style={{ counterReset: "n", listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        {tab.list.map((it, i) => (
          <li key={i} style={{ padding: "18px 0", borderBottom: "1px solid var(--rule)", display: "flex", gap: 16, fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.4 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
            <span>{it}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (tab.sideKind === "stat-grid" && tab.stats?.length) {
    return (
      <div className="act-side-stat-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid var(--ink)" }}>
        {tab.stats.map((s, i) => (
          <div key={i} className="act-side-stat-cell" style={{ padding: "40px 32px", borderRight: i % 2 === 0 ? "1px solid var(--ink)" : "0", borderBottom: i < tab.stats.length - 2 ? "1px solid var(--ink)" : "0" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 66, lineHeight: 1, marginBottom: 12 }}>{s.v}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)" }}>{s.l}</div>
          </div>
        ))}
      </div>
    );
  }
  if (tab.sideKind === "timeline" && tab.timeline?.length) {
    return (
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tab.timeline.map((it, i) => (
          <li key={i} className="act-timeline-row" style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 24, padding: "24px 0", borderTop: i === 0 ? "1px solid var(--ink)" : "0", borderBottom: "1px solid var(--rule)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)" }}>{it.w}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 21, lineHeight: 1.5 }}>{it.t}</div>
          </li>
        ))}
      </ol>
    );
  }
  if (tab.sideKind === "schedule" && tab.schedule?.length) {
    return (
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tab.schedule.map((s, i) => (
          <li key={i} style={{ padding: "28px 0", borderTop: i === 0 ? "1px solid var(--ink)" : "0", borderBottom: "1px solid var(--rule)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)", marginBottom: 8 }}>{s.day}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, color: "var(--ink-soft)" }}>{s.note}</div>
          </li>
        ))}
      </ol>
    );
  }
  if (tab.sideKind === "roles" && tab.roles?.length) {
    return (
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tab.roles.map((r, i) => (
          <li key={i} style={{ padding: "24px 0", borderTop: i === 0 ? "1px solid var(--ink)" : "0", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 28 }}>{r.r}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)" }}>{r.l}</span>
          </li>
        ))}
      </ol>
    );
  }
  return null;
}

export function ActPagePublic({ data }: { data: ActData }) {
  const searchParams = useSearchParams();
  const defaultTab = data.tabs[0]?.key ?? "";
  const [tab, setTab] = useState(() => {
    const param = searchParams.get("tab");
    return param && data.tabs.find(t => t.key === param) ? param : defaultTab;
  });

  useEffect(() => {
    const param = searchParams.get("tab");
    if (param && data.tabs.find(t => t.key === param)) setTab(param);
  }, [searchParams, data.tabs]);

  const current = data.tabs.find((t) => t.key === tab) ?? data.tabs[0];

  if (!current) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "64px 0 16px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 className="act-page-title" style={{ fontFamily: "var(--serif)", fontSize: 88, lineHeight: 1.05, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
              {data.heading}
            </h1>
            {data.subtitle ? (
              <div className="samavesh-prose" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28, lineHeight: 1.5, maxWidth: 760, marginTop: 28, color: "var(--ink)" }} dangerouslySetInnerHTML={{ __html: data.subtitle }} />
            ) : null}
          </Reveal>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)", padding: "20px 0", position: "sticky", top: 0, background: "var(--paper)", zIndex: 50 }}>
        <div className="samavesh-container">
          <div className="act-tab-bar" style={{ display: "flex", gap: 12 }}>
            {data.tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`pill${t.key === tab ? " is-active" : ""}`}>
                {t.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="samavesh-container" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <Reveal key={tab}>
          <div className="act-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              {current.eyebrow && (
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)", marginBottom: 16, letterSpacing: "0.06em" }}>
                  {current.eyebrow}
                </div>
              )}
              <h2 className="act-cta-h2" style={{ fontFamily: "var(--serif)", fontSize: 66, lineHeight: 1.05, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
                {current.title}
              </h2>
              {current.italic && (
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, lineHeight: 1.45, marginTop: 24, color: "var(--ink-soft)" }}>
                  {current.italic}
                </p>
              )}
              {current.body && (
                <div className="samavesh-prose" style={{ fontFamily: "var(--sans)", fontSize: 17, lineHeight: 1.75, marginTop: 24 }} dangerouslySetInnerHTML={{ __html: current.body }} />
              )}
              {current.cta && (
                <a href={current.href || "#"} className="btn-text" style={{ marginTop: 32, display: "inline-flex" }}>
                  <span>{current.cta}</span>
                  <span className="arrow">→</span>
                </a>
              )}
            </div>
            <div>
              <ActSide tab={current} />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
