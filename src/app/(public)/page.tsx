import { HomeClient } from "@/components/public/HomeClient";
import { getLandingContent, LandingContent } from "@/lib/landing-selection";
import { prisma } from "@/lib/prisma";
import type { FeaturedConfig } from "@/components/admin/LandingFeaturedForm";

export const dynamic = "force-dynamic";

export type GazettePreviewArticle = {
  topic: string;
  title: string;
  presenter: string;
  moderator: string;
  editor: string;
};

export type GazettePreview = {
  volumeNumber: number | null;
  publishedAt: string | null;
  description: string | null;
  articles: GazettePreviewArticle[];
} | null;

export type HomeContentItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  contentType: { name: string; slug: string; thumbnailRatioW: number; thumbnailRatioH: number };
  topics: { name: string; slug: string }[];
  contributors: { name: string; role: string }[];
};

/** Unified featured block passed to HomeClient */
export type FeaturedBlock = {
  type: "content" | "news";
  title: string;
  description: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  // content-specific
  slug?: string;
  contentTypeName?: string;
  topicName?: string;
  contributorName?: string;
  readingTime?: number | null;
  // news-specific
  embedType?: string | null;
  embedUrl?: string | null;
  embedCode?: string | null;
  externalUrl?: string | null;
  category?: string;
  sourceName?: string | null;
  // CTA
  ctaEnabled: boolean;
  ctaLabel: string;
  ctaUrl: string;
};

function serializeContent(c: LandingContent): HomeContentItem {
  return {
    id: c.id,
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
  };
}

const CONTENT_INCLUDE = {
  contentType: true,
  topics: { include: { topicTag: true } },
  contributors: { include: { profile: { select: { name: true } } } },
} as const;

async function resolveFeatured(cfg: FeaturedConfig): Promise<FeaturedBlock | null> {
  const ctaEnabled = cfg.ctaEnabled ?? true;
  const ctaLabel = cfg.ctaLabel || "Read more";

  if (cfg.mode === "news" && cfg.newsId) {
    const news = await prisma.newsItem.findUnique({ where: { id: cfg.newsId, status: "PUBLISHED" } });
    if (!news) return null;
    return {
      type: "news",
      title: cfg.overrideTitle || news.title,
      description: cfg.overrideDescription || news.description,
      thumbnail: news.image,
      publishedAt: news.publishedAt?.toISOString() ?? null,
      embedType: news.embedType,
      embedUrl: news.embedUrl,
      embedCode: news.embedCode,
      externalUrl: news.externalUrl,
      category: news.category as string,
      sourceName: news.sourceName,
      ctaEnabled,
      ctaLabel,
      ctaUrl: cfg.ctaUrl || news.externalUrl || "/news",
    };
  }

  if (cfg.mode === "content" && cfg.contentId) {
    const c = await prisma.content.findUnique({
      where: { id: cfg.contentId, status: "PUBLISHED" },
      include: CONTENT_INCLUDE,
    });
    if (!c) return null;
    return {
      type: "content",
      title: cfg.overrideTitle || c.title,
      description: cfg.overrideDescription || c.excerpt,
      thumbnail: c.thumbnail,
      publishedAt: c.publishedAt?.toISOString() ?? null,
      slug: c.slug,
      contentTypeName: c.contentType.name,
      topicName: c.topics[0]?.topicTag.name,
      contributorName: c.contributors.find(x => x.role === "AUTHOR")?.profile.name ?? c.contributors[0]?.profile.name,
      readingTime: c.readingTime,
      ctaEnabled,
      ctaLabel,
      ctaUrl: cfg.ctaUrl || `/blogs/${c.slug}`,
    };
  }

  // Auto: latest published content
  const latest = await prisma.content.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: CONTENT_INCLUDE,
  });
  if (!latest) return null;
  return {
    type: "content",
    title: cfg.overrideTitle || latest.title,
    description: cfg.overrideDescription || latest.excerpt,
    thumbnail: latest.thumbnail,
    publishedAt: latest.publishedAt?.toISOString() ?? null,
    slug: latest.slug,
    contentTypeName: latest.contentType.name,
    topicName: latest.topics[0]?.topicTag.name,
    contributorName: latest.contributors.find(x => x.role === "AUTHOR")?.profile.name ?? latest.contributors[0]?.profile.name,
    readingTime: latest.readingTime,
    ctaEnabled,
    ctaLabel,
    ctaUrl: cfg.ctaUrl || `/blogs/${latest.slug}`,
  };
}

export default async function HomePage() {
  const [{ items, rowCount }, featuredCfgRaw, topics, currentGazette] = await Promise.all([
    getLandingContent(),
    prisma.pageConfig.findUnique({ where: { slug: "landing-featured" } }),
    prisma.topicTag
      .findMany({ include: { contents: { where: { content: { status: "PUBLISHED" } } } } })
      .then((tags) =>
        tags
          .map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t.contents.length, image: t.sectorImage ?? t.image ?? null }))
          .filter((t) => t.count > 0)
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
          .slice(0, 5)
      ),
    prisma.gazette.findFirst({
      where: { isCurrent: true, status: "PUBLISHED" },
      include: {
        articles: {
          orderBy: { order: "asc" },
          take: 3,
          include: {
            content: {
              include: {
                topics: { include: { topicTag: true }, take: 1 },
                contributors: { include: { profile: { select: { name: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  const featuredCfg = ((featuredCfgRaw?.data ?? {}) as Partial<FeaturedConfig>);
  const normalizedCfg: FeaturedConfig = {
    mode: featuredCfg.mode ?? "auto",
    contentId: featuredCfg.contentId ?? "",
    newsId: featuredCfg.newsId ?? "",
    overrideTitle: featuredCfg.overrideTitle ?? "",
    overrideDescription: featuredCfg.overrideDescription ?? "",
    ctaEnabled: featuredCfg.ctaEnabled ?? true,
    ctaLabel: featuredCfg.ctaLabel ?? "Read more",
    ctaUrl: featuredCfg.ctaUrl ?? "",
  };

  const featured = await resolveFeatured(normalizedCfg);

  // Exclude featured content item from grid to avoid duplication
  const featuredContentId = featured?.type === "content" && featured.slug
    ? items.find(i => i.slug === featured.slug)?.id
    : undefined;

  const gridContent = items
    .filter((c) => c.id !== featuredContentId)
    .map(serializeContent)
    .slice(0, rowCount * 3);

  const gazettePreview: GazettePreview = currentGazette ? {
    volumeNumber: currentGazette.volumeNumber,
    publishedAt: currentGazette.publishedAt?.toISOString() ?? null,
    description: currentGazette.description ?? null,
    articles: currentGazette.articles.map((a) => {
      const byRole = (role: string) =>
        a.content.contributors.find((c) => c.role === role)?.profile.name ?? "";
      return {
        topic: a.content.topics[0]?.topicTag.name ?? "",
        title: a.content.title,
        presenter: byRole("PRESENTER"),
        moderator: byRole("MODERATOR"),
        editor: byRole("EDITOR"),
      };
    }),
  } : null;

  return <HomeClient featured={featured} gridContent={gridContent} topics={topics} gazette={gazettePreview} />;
}
