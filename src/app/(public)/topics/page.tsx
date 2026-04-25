import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Topics" };

export default async function TopicsPage() {
  const tags = await prisma.topicTag.findMany({
    include: { contents: { where: { content: { status: "PUBLISHED" } } } },
    orderBy: { name: "asc" },
  });

  const topics = tags.map((t) => ({ ...t, count: t.contents.length }));

  return (
    <div>
      {/* Header */}
      <div style={{ background: "var(--hero-blue)", padding: "72px 0 56px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
              Topics
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink-soft)", opacity: 0.65 }}>
              Every policy area we cover.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Topics grid */}
      <div style={{ padding: "64px 0 120px" }}>
        <div className="samavesh-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
            }}
          >
            {topics.map((topic, i) => (
              <Reveal key={topic.id} delay={i * 40}>
                <Link href={`/topics/${topic.slug}`}>
                  <div
                    style={{
                      padding: "28px 0",
                      borderBottom: "1px solid var(--rule)",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                    className="topic-row"
                  >
                    <span
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 28,
                        fontWeight: 400,
                        color: "var(--ink)",
                        transition: "padding-left 300ms ease",
                      }}
                      className="topic-label"
                    >
                      {topic.name}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.3, flexShrink: 0 }}>
                      {topic.count}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .topic-row:hover .topic-label { padding-left: 12px; }
        .topic-row:hover { border-bottom-color: var(--ink) !important; }
      `}</style>
    </div>
  );
}
