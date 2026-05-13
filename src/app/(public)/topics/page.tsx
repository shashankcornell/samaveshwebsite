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

  const topics = tags
    .map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t.contents.length }))
    .filter((t) => t.count > 0);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "64px 0 0" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 88, lineHeight: 1.05, fontWeight: 400, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
              Sectors.
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 28, lineHeight: 1.5, maxWidth: 760, marginTop: 28, marginBottom: 56, color: "var(--ink)" }}>
              Every sector we&rsquo;ve decoded so far — pick one to read everything we&rsquo;ve published on it.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Topics list */}
      <div style={{ padding: "0 0 120px" }}>
        <div className="samavesh-container">
          <div style={{ borderTop: "1px solid var(--ink)" }}>
            {topics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicRow({ topic }: { topic: { name: string; slug: string; count: number } }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      style={{ display: "block", textDecoration: "none" }}
      className="topic-list-row"
    >
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "28px 0",
        borderBottom: "1px solid var(--ink)",
        gap: 32,
      }}>
        <span className="topic-list-name" style={{
          fontFamily: "var(--serif)",
          fontSize: 52,
          fontWeight: 400,
          lineHeight: 1.1,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
        }}>
          {topic.name}
        </span>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          letterSpacing: "0.08em",
          color: "var(--ink-soft)",
          flexShrink: 0,
        }}>
          {topic.count}
        </span>
      </div>
    </Link>
  );
}
