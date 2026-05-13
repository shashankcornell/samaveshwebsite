import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TopicClient } from "@/components/public/TopicClient";
import type { Metadata } from "next";

interface Props { params: { slug: string }; searchParams: { type?: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await prisma.topicTag.findUnique({ where: { slug: params.slug } });
  return { title: tag?.name ?? "Topic" };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const tag = await prisma.topicTag.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, description: true, longIntro: true, sectorImage: true, image: true, bgColor: true },
  });
  if (!tag) notFound();

  const [items, otherTopics] = await Promise.all([
    prisma.content.findMany({
      where: { status: "PUBLISHED", topics: { some: { topicTagId: tag.id } } },
      orderBy: { publishedAt: "desc" },
      take: 60,
      include: {
        contentType: true,
        topics: { include: { topicTag: true } },
        contributors: { include: { profile: { select: { name: true } } } },
      },
    }),
    prisma.topicTag.findMany({
      where: { slug: { not: params.slug } },
      orderBy: { name: "asc" },
      take: 8,
    }),
  ]);

  // Derive unique content types present in this topic
  const typeMap = new Map<string, { id: string; name: string; slug: string }>();
  for (const c of items) {
    if (!typeMap.has(c.contentType.id)) {
      typeMap.set(c.contentType.id, { id: c.contentType.id, name: c.contentType.name, slug: c.contentType.slug });
    }
  }
  const contentTypes = Array.from(typeMap.values());

  const cards = items.map((c) => ({
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    thumbnail: c.thumbnail,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    readingTime: c.readingTime,
    contentType: {
      name: c.contentType.name,
      slug: c.contentType.slug,
      thumbnailRatioW: c.contentType.thumbnailRatioW,
      thumbnailRatioH: c.contentType.thumbnailRatioH,
    },
    topics: c.topics.map((t) => t.topicTag),
    contributors: c.contributors.map((cc) => ({ name: cc.profile.name, role: cc.role as string })),
  }));

  return (
    <TopicClient
      tag={{ name: tag.name, slug: tag.slug, bannerImage: tag.sectorImage ?? null, bgImage: tag.image ?? null, bgColor: tag.bgColor ?? null, description: tag.description ?? null }}
      items={cards}
      contentTypes={contentTypes}
      otherTopics={otherTopics}
      activeType={searchParams.type ?? null}
    />
  );
}
