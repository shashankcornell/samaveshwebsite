import { prisma } from "@/lib/prisma";
import { GazetteClient } from "@/components/public/GazetteClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gazzette" };

export default async function GazettePage() {
  const gazetteItems = await prisma.content.findMany({
    where: { status: "PUBLISHED", contentType: { slug: "gazette" } },
    orderBy: { publishedAt: "desc" },
    include: {
      contentType: true,
      topics: { include: { topicTag: true } },
      contributors: { include: { profile: true } },
    },
  });

  const fallback = await prisma.content.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    include: {
      contentType: true,
      topics: { include: { topicTag: true } },
      contributors: { include: { profile: true } },
    },
  });

  const source = gazetteItems.length ? gazetteItems : fallback;

  const articles = source.map((c) => ({
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    thumbnail: c.thumbnail,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    readingTime: c.readingTime,
    contentType: c.contentType,
    topics: c.topics.map((t) => t.topicTag),
    contributors: c.contributors.map((ct) => ({
      role: ct.role,
      name: ct.profile.name,
    })),
  }));

  return <GazetteClient articles={articles} />;
}
