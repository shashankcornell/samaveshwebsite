import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import { CardMosaic } from "@/components/public/CardMosaic";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await prisma.topicTag.findUnique({ where: { slug: params.slug } });
  return { title: tag?.name ?? "Topic" };
}

export default async function TopicPage({ params }: Props) {
  const tag = await prisma.topicTag.findUnique({ where: { slug: params.slug } });
  if (!tag) notFound();

  const [items, otherTopics] = await Promise.all([
    prisma.content.findMany({
      where: { status: "PUBLISHED", topics: { some: { topicTagId: tag.id } } },
      orderBy: { publishedAt: "desc" },
      take: 24,
      include: { contentType: true, topics: { include: { topicTag: true } } },
    }),
    prisma.topicTag.findMany({
      where: { slug: { not: params.slug } },
      orderBy: { name: "asc" },
      take: 8,
    }),
  ]);

  const cards = items.map((c) => ({
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    thumbnail: c.thumbnail,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    readingTime: c.readingTime,
    contentType: c.contentType,
    topics: c.topics.map((t) => t.topicTag),
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ background: "var(--hero-blue)", padding: "72px 0 56px" }}>
        <div className="samavesh-container">
          <Reveal>
            <Link
              href="/topics"
              style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.45, marginBottom: 16, display: "block", letterSpacing: "0.06em" }}
            >
              ← Topics
            </Link>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
              {tag.name}
            </h1>
            <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.4 }}>
              {items.length} piece{items.length !== 1 ? "s" : ""}
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: "64px 0 120px" }}>
        <div className="samavesh-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 72, alignItems: "start" }}>
            {/* Main content */}
            <div>
              {cards.length > 0 ? (
                <CardMosaic items={cards} />
              ) : (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
                    No content yet in this topic.
                  </p>
                </div>
              )}
            </div>

            {/* Other topics rail */}
            {otherTopics.length > 0 && (
              <aside style={{ position: "sticky", top: 100 }}>
                <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.4, marginBottom: 20 }}>
                  Other topics
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {otherTopics.map((t) => (
                    <Link
                      key={t.id}
                      href={`/topics/${t.slug}`}
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 18,
                        color: "var(--ink)",
                        padding: "12px 0",
                        borderBottom: "1px solid var(--rule)",
                        display: "block",
                        transition: "padding-left 250ms ease",
                      }}
                      className="other-topic-link"
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .other-topic-link:hover { padding-left: 8px !important; }
      `}</style>
    </div>
  );
}
