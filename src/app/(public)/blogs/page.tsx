import { prisma } from "@/lib/prisma";
import { BlogsClient } from "@/components/public/BlogsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Think" };
export const dynamic = "force-dynamic";

interface SearchParams { topic?: string; type?: string; page?: string }

export default async function BlogsPage({ searchParams }: { searchParams: SearchParams }) {
  const { topic, type } = searchParams;
  const pageConfig = await prisma.pageConfig.findUnique({ where: { slug: "think" } });
  const thinkData = (pageConfig?.data ?? {}) as Record<string, unknown>;

  const perPage = typeof thinkData.perPage === "number" ? thinkData.perPage : 30;
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const skip = (page - 1) * perPage;

  const where = {
    status: "PUBLISHED" as const,
    ...(topic && { topics: { some: { topicTag: { slug: topic } } } }),
    ...(type  && { contentType: { slug: type } }),
  };

  const [items, total, contentTypes] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: perPage,
      include: {
        contentType: true,
        topics: { include: { topicTag: true } },
        contributors: { include: { profile: { select: { name: true } } } },
      },
    }),
    prisma.content.count({ where }),
    prisma.contentType.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = items.map((c) => ({
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

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <BlogsClient
      items={serialized}
      contentTypes={contentTypes}
      activeType={type ?? null}
      activeTopic={topic ?? null}
      heroHeading={(thinkData.heading as string) ?? null}
      heroSubtitle={(thinkData.subtitle as string) ?? null}
      page={page}
      totalPages={totalPages}
      total={total}
      perPage={perPage}
    />
  );
}
