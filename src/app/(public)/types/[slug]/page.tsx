import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/public/Reveal";
import { CardMosaic } from "@/components/public/CardMosaic";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = await prisma.contentType.findUnique({ where: { slug: params.slug } });
  return { title: type?.name ?? "Content Type" };
}

export default async function TypePage({ params }: Props) {
  const type = await prisma.contentType.findUnique({ where: { slug: params.slug } });
  if (!type) notFound();

  const items = await prisma.content.findMany({
    where: { status: "PUBLISHED", contentTypeId: type.id },
    orderBy: { publishedAt: "desc" },
    take: 24,
    include: { contentType: true, topics: { include: { topicTag: true } } },
  });

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
      <div style={{ background: "var(--hero-blue)", padding: "72px 0 56px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
              {type.name}
            </h1>
            <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.4 }}>
              {items.length} piece{items.length !== 1 ? "s" : ""}
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: "64px 0 120px" }}>
        <div className="samavesh-container">
          {cards.length > 0 ? (
            <CardMosaic items={cards} />
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
                No content yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
