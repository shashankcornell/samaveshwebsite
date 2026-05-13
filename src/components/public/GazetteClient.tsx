"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Reveal } from "./Reveal";

interface GazetteSummary {
  id: string;
  slug: string;
  name: string;
  volumeNumber: number | null;
  editionName: string | null;
  publishedAt: string | null;
  place: string | null;
  isCurrent: boolean;
  status: string;
}

interface BoardMember {
  id: string;
  name: string;
  roleName: string | null;
  roleOrder: number;
}

interface GazArticle {
  contentId: string;
  slug: string;
  title: string;
  order: number;
  topic: string | null;
  presenter: string | null;
  moderator: string | null;
  editor: string | null;
}

interface GazetteData {
  id: string;
  name: string;
  slug: string;
  volumeNumber: number | null;
  editionName: string | null;
  publishedAt: string | null;
  place: string | null;
  isCurrent: boolean;
  subheading: string | null;
  description: string | null;
  editorNote: string | null;
  disclaimer: string | null;
  credits: string | null;
  acknowledgements: string | null;
  articles: GazArticle[];
  editorialBoard: BoardMember[];
}

interface GazetteClientProps {
  editions: GazetteSummary[];
  gazette: GazetteData | null;
  selectedSlug: string;
}

function formatGazDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

function toRoman(n: number) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

export function GazetteClient({ editions, gazette, selectedSlug }: GazetteClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function switchEdition(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("edition", slug);
    router.push(`/gazette?${params.toString()}`);
  }

  const g = gazette;

  // Group editorial board by role
  const boardByRole: Record<string, { roleName: string; names: string[] }> = {};
  if (g) {
    for (const m of g.editorialBoard) {
      const key = m.roleName ?? "__none";
      if (!boardByRole[key]) boardByRole[key] = { roleName: m.roleName ?? "Members", names: [] };
      boardByRole[key].names.push(m.name);
    }
  }
  const boardGroups = Object.values(boardByRole).sort((a, b) => {
    const aIdx = g?.editorialBoard.findIndex((m) => m.roleName === a.roleName) ?? 0;
    const bIdx = g?.editorialBoard.findIndex((m) => m.roleName === b.roleName) ?? 0;
    return aIdx - bIdx;
  });

  const volLabel = g?.volumeNumber ? toRoman(g.volumeNumber) : "—";
  const isCurrent = g?.isCurrent ?? false;

  return (
    <>
      {/* ── Cover ── */}
      <section style={{ background: "var(--hero-cream)", paddingTop: 96, paddingBottom: 96, borderBottom: "1px solid var(--ink)" }}>
        <div className="samavesh-container">

          {/* Edition switcher */}
          <Reveal>
            <div className="gz-switcher-row" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--ink)",
              marginBottom: 48, paddingBottom: 14,
              fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em",
            }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: "var(--ink-soft)" }}>EDITION</span>
                <span style={{ position: "relative", display: "inline-block" }}>
                  <select
                    value={selectedSlug}
                    onChange={(e) => switchEdition(e.target.value)}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      background: "transparent",
                      border: "1px solid var(--ink)",
                      color: "var(--ink)",
                      fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.1em",
                      padding: "10px 44px 10px 16px",
                      cursor: "pointer",
                      borderRadius: 0,
                    }}
                  >
                    {editions.map((ed) => (
                      <option key={ed.slug} value={ed.slug}>
                        {ed.publishedAt ? new Date(ed.publishedAt).getFullYear() : ed.name}
                        {ed.isCurrent ? "  ·  CURRENT" : ""}
                      </option>
                    ))}
                  </select>
                  <span aria-hidden="true" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: "var(--ink)" }}>▾</span>
                </span>
              </label>
              <span style={{ color: "var(--ink-soft)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em" }}>
                {isCurrent ? "CURRENT EDITION" : g ? "ARCHIVE" : ""}
              </span>
            </div>
          </Reveal>

          {g ? (
            <Reveal>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32, fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.1em", color: "var(--ink-soft)" }}>
                <span>VOLUME {volLabel}{g.publishedAt ? ` · ${formatGazDate(g.publishedAt)}` : ""}</span>
                {g.place && <span>{g.place.toUpperCase()}</span>}
              </div>
              <h1 className="gz-cover-title" style={{ fontFamily: "var(--serif)", fontSize: "clamp(72px, 10vw, 120px)", lineHeight: 0.95, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>
                The Gazzette.
              </h1>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.5, maxWidth: 760, marginTop: 36, color: "var(--ink)" }}>
                {g.description ?? "The annual journal of the Samavesh Summit — discourse papers drawn from a year of presentations and moderated debate, edited into a single volume for the public record."}
              </p>
            </Reveal>
          ) : (
            <Reveal>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: 80, lineHeight: 1, fontWeight: 400, margin: 0 }}>The Gazzette.</h1>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, marginTop: 24, color: "var(--ink-soft)" }}>No editions published yet.</p>
            </Reveal>
          )}
        </div>
      </section>

      {g && isCurrent && (
        <>
          {/* ── Editor Note ── */}
          {g.editorNote && (
            <section className="samavesh-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
              <Reveal>
                <div className="gz-editor-note-grid" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 64, alignItems: "start" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--ink-soft)", paddingTop: 8, textTransform: "uppercase" }}>
                    Editor Note
                  </div>
                  <div
                    className="gazette-editor-note"
                    dangerouslySetInnerHTML={{ __html: g.editorNote }}
                  />
                </div>
              </Reveal>
            </section>
          )}

          {/* ── In This Issue + Sidebar ── */}
          <section className="samavesh-container" style={{ paddingBottom: 96 }}>
            <div className="gz-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 80, alignItems: "start" }}>

              {/* Article list */}
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 50, fontWeight: 400, margin: 0, marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid var(--ink)" }}>
                  In this issue.
                </h2>
                <div className="gz-list" style={{ display: "flex", flexDirection: "column" }}>
                  {g.articles.length > 0 ? g.articles.map((a, i) => (
                    <Reveal key={a.contentId} delay={(i % 3) * 60} className="gz-reveal">
                      <Link
                        href={`/blogs/${a.slug}`}
                        className="gz-row gz-article-row"
                        style={{
                          display: "grid", gridTemplateColumns: "100px 1fr", gap: 24,
                          padding: "28px 0", textDecoration: "none", color: "inherit",
                        }}
                      >
                        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)" }}>
                          <div style={{ marginBottom: 4 }}>{String(i + 1).padStart(2, "0")}</div>
                          {a.topic && <div style={{ color: "var(--ink)", fontFamily: "var(--mono)", fontSize: 12 }}>{a.topic}</div>}
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.3, color: "var(--ink)" }}>{a.title}</div>
                          {(a.presenter || a.moderator || a.editor) && (
                            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", marginTop: 14, letterSpacing: "0.05em" }}>
                              {[a.presenter, a.moderator, a.editor].filter(Boolean).map((n, ni) => (
                                <span key={ni}>
                                  {ni > 0 && <span style={{ margin: "0 8px" }}>·</span>}
                                  {n!.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </Reveal>
                  )) : (
                    <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--ink)", opacity: 0.4, padding: "40px 0" }}>
                      Articles will appear here once published.
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <aside>
                <div className="gz-sidebar-sticky" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 48 }}>

                  {/* Editorial Board */}
                  {boardGroups.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-soft)", marginBottom: 16, textTransform: "uppercase" }}>
                        Editorial Board
                      </div>
                      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {boardGroups.map((group, i) => (
                          <li key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--rule)" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.06em", color: "var(--ink-soft)", marginBottom: 4, textTransform: "uppercase" }}>
                              {group.roleName}
                            </div>
                            <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.45 }}>
                              {group.names.join(" · ")}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Past Issues */}
                  {editions.length > 1 && (
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-soft)", marginBottom: 16, textTransform: "uppercase" }}>
                        Past Issues
                      </div>
                      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {editions.map((ed, i) => (
                          <li key={ed.slug} style={{ padding: "14px 0", borderBottom: "1px solid var(--rule)" }}>
                            <button
                              onClick={() => switchEdition(ed.slug)}
                              style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", width: "100%", padding: 0 }}
                            >
                              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.06em", color: "var(--ink-soft)", marginBottom: 4 }}>
                                {ed.volumeNumber ? `VOL ${toRoman(ed.volumeNumber)}` : `EDITION ${i + 1}`}
                              </div>
                              <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: ed.isCurrent ? "var(--ink)" : "var(--ink-soft)" }}>
                                {ed.publishedAt ? new Date(ed.publishedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ed.name}
                                {ed.isCurrent ? " — current" : ""}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ borderTop: "1px solid var(--ink)", paddingTop: 28 }}>
                    <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 19, lineHeight: 1.45, marginBottom: 12 }}>
                      Have an idea for the next summit?
                    </div>
                    <p style={{ fontFamily: "var(--sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", marginBottom: 20 }}>
                      We open the call for discourse ideas every August. The advisory committee selects 10–12 to present at the annual summit.
                    </p>
                    <Link href="/act" className="btn-text">
                      <span>Submit your idea</span>
                      <span className="arrow">→</span>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {/* ── Disclaimer & Credits ── */}
          {(g.disclaimer || g.credits) && (
            <section style={{ borderTop: "1px solid var(--ink)", paddingTop: 64, paddingBottom: 64 }}>
              <div className="samavesh-container gz-disclaimer-grid" style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: 64, alignItems: "start" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-soft)", paddingTop: 4, textTransform: "uppercase" }}>
                  Disclaimer &amp; Credits
                </div>
                {g.disclaimer && (
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase" }}>
                      Disclaimer
                    </div>
                    <p style={{ fontFamily: "var(--sans)", fontSize: 14, lineHeight: 1.75, marginTop: 0, color: "var(--ink)" }}>
                      {g.disclaimer}
                    </p>
                  </div>
                )}
                {g.credits && (
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase" }}>
                      Production Credits
                    </div>
                    <p style={{ fontFamily: "var(--sans)", fontSize: 14, lineHeight: 1.75, marginTop: 0, color: "var(--ink)", whiteSpace: "pre-line" }}>
                      {g.credits}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Archive / non-current notice ── */}
      {g && !isCurrent && (
        <section className="samavesh-container" style={{ paddingTop: 80, paddingBottom: 96 }}>
          <div className="gz-archive-box" style={{ border: "1px solid var(--ink)", padding: "72px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-soft)", marginBottom: 24, textTransform: "uppercase" }}>
                Archive Edition
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1.1, fontWeight: 400, margin: 0 }}>
                {g.name}
              </h2>
            </div>
            <div>
              {g.description && (
                <p style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.7, color: "var(--ink)", marginTop: 0 }}>
                  {g.description}
                </p>
              )}
              {editions.find((e) => e.isCurrent) && (
                <button
                  className="btn-text"
                  style={{ marginTop: 24, display: "inline-flex" }}
                  onClick={() => switchEdition(editions.find((e) => e.isCurrent)!.slug)}
                >
                  <span>Read the current edition</span>
                  <span className="arrow">→</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
