import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/public/HomeClient";

export const dynamic = "force-dynamic";

export type HomeContentItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  contentType: { name: string; slug: string };
  topics: { name: string; slug: string }[];
  contributors: { name: string; role: string }[];
};

function buildHomepageContent(items: HomeContentItem[], max = 24): HomeContentItem[] {
  const remaining = [...items];
  const result: HomeContentItem[] = [];

  while (result.length < max && remaining.length > 0) {
    const candidate = remaining[0];
    const lastTwo = result.slice(-2);
    const shouldSwap =
      lastTwo.length === 2 &&
      lastTwo[0].contentType.slug === candidate.contentType.slug &&
      lastTwo[1].contentType.slug === candidate.contentType.slug;

    if (shouldSwap) {
      const lookahead = remaining.slice(1, 7);
      const diffIdx = lookahead.findIndex(
        (item) => item.contentType.slug !== candidate.contentType.slug
      );
      if (diffIdx !== -1) {
        const selected = lookahead[diffIdx];
        result.push(selected);
        remaining.splice(remaining.indexOf(selected), 1);
      } else {
        result.push(candidate);
        remaining.splice(0, 1);
      }
    } else {
      result.push(candidate);
      remaining.splice(0, 1);
    }
  }

  return result;
}

async function getData() {
  const [featured, allPublished, topics] = await Promise.all([
    prisma.content.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        contentType: true,
        topics: { include: { topicTag: true } },
        contributors: { include: { profile: { select: { name: true } } } },
      },
    }),
    prisma.content.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: {
        contentType: true,
        topics: { include: { topicTag: true } },
        contributors: { include: { profile: { select: { name: true } } } },
      },
    }),
    prisma.topicTag
      .findMany({ include: { contents: { where: { content: { status: "PUBLISHED" } } } } })
      .then((tags) =>
        tags
          .map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            count: t.contents.length,
            image: (t as { image?: string | null }).image ?? null,
          }))
          .filter((t) => t.count > 0)
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
          .slice(0, 5)
      ),
  ]);

  const serialize = (c: (typeof allPublished)[0]): HomeContentItem => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    thumbnail: c.thumbnail,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    readingTime: c.readingTime,
    contentType: c.contentType,
    topics: c.topics.map((t) => t.topicTag),
    contributors: c.contributors.map((cc) => ({ name: cc.profile.name, role: cc.role as string })),
  });

  const featuredSerialized = featured ? serialize(featured) : null;
  const dateSortedContent = allPublished
    .filter((c) => c.id !== featured?.id)
    .map(serialize);
  const gridContent = buildHomepageContent(dateSortedContent, 24);

  return { featured: featuredSerialized, gridContent, topics };
}

export default async function HomePage() {
  const data = await getData();
  return <HomeClient {...data} />;
}
