"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";
import { formatDate } from "@/lib/utils";

interface Contributor { role: string; name: string }
interface GazArticle {
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  contentType: { name: string; slug: string };
  topics: { name: string; slug: string }[];
  contributors: Contributor[];
}

interface GazetteClientProps {
  articles: GazArticle[];
}

export function GazetteClient({ articles }: GazetteClientProps) {
  const year = new Date().getFullYear();

  return (
    <div>
      {/* Header */}
      <div style={{ background: "var(--ink)", padding: "72px 0 56px" }}>
        <div className="samavesh-container">
          <Reveal>
            <p style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
              Annual Journal
            </p>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 400, color: "var(--paper)", marginBottom: 8, lineHeight: 1.1 }}>
              Gazzette {year}
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "rgba(255,255,255,0.6)", maxWidth: 560 }}>
              A curated collection of policy writing, research, and discourse from the Samavesh community.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Article table */}
      <div style={{ padding: "64px 0 120px" }}>
        <div className="samavesh-container">
          {articles.length > 0 ? (
            <div className="gz-list">
              {articles.map((article, i) => (
                <Reveal key={article.slug} className="gz-reveal" delay={i * 40}>
                  <Link href={`/blogs/${article.slug}`}>
                    <div className="gz-row" style={{ padding: "24px 0", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-blue)" }}>
                            {article.contentType.name}
                          </span>
                          {article.topics.slice(0, 2).map((t) => (
                            <span key={t.slug} style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--ink)", opacity: 0.4 }}>
                              {t.name}
                            </span>
                          ))}
                        </div>
                        <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 400, color: "var(--ink)", margin: 0, lineHeight: 1.3 }}>
                          {article.title}
                        </h3>
                        {article.contributors.length > 0 && (
                          <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", opacity: 0.45, marginTop: 8, margin: "8px 0 0" }}>
                            {article.contributors.map((c) => c.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {article.publishedAt && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", opacity: 0.3 }}>
                            {formatDate(article.publishedAt)}
                          </span>
                        )}
                        {article.readingTime && (
                          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", opacity: 0.3, margin: "4px 0 0" }}>
                            {article.readingTime} min
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
                The {year} edition is being prepared.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
