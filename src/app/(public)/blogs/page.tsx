import { prisma } from "@/lib/prisma";
import { BlogsClient } from "@/components/public/BlogsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Think" };
export const dynamic = "force-dynamic";

interface SearchParams { topic?: string; type?: string }

export default async function BlogsPage({ searchParams }: { searchParams: SearchParams }) {
  const { topic, type } = searchParams;

  const [items, contentTypes, topicTags] = await Promise.all([
    prisma.content.findMany({
      where: {
        status: "PUBLISHED",
        ...(topic && { topics: { some: { topicTag: { slug: topic } } } }),
        ...(type && { contentType: { slug: type } }),
      },
      orderBy: { publishedAt: "desc" },
      take: 24,
      include: {
        contentType: true,
        topics: { include: { topicTag: true } },
      },
    }),
    prisma.contentType.findMany({ orderBy: { name: "asc" } }),
    prisma.topicTag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = items.map((c) => ({
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
    <BlogsClient
      items={serialized}
      contentTypes={contentTypes}
      topicTags={topicTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
      activeType={type ?? null}
      activeTopic={topic ?? null}
    />
  );
}
