import { prisma } from "@/lib/prisma";
import { LandingConfigForm } from "@/components/admin/LandingConfigForm";
import { LandingFeaturedForm, type FeaturedConfig } from "@/components/admin/LandingFeaturedForm";

export default async function LandingConfigPage() {
  const [config, allContent, allNews, featuredRaw] = await Promise.all([
    prisma.landingPageConfig.findFirst({
      include: {
        slots: {
          orderBy: { order: "asc" },
          include: { content: { include: { contentType: true } } },
        },
      },
    }),
    prisma.content.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        contentType: { select: { name: true, slug: true } },
      },
    }),
    prisma.newsItem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, publishedAt: true, category: true },
    }),
    prisma.pageConfig.findUnique({ where: { slug: "landing-featured" } }),
  ]);

  const initialSlots = (config?.slots ?? []).map((s) => ({
    id: s.content.id,
    title: s.content.title,
    slug: s.content.slug,
    publishedAt: s.content.publishedAt?.toISOString() ?? null,
    contentType: { name: s.content.contentType.name, slug: s.content.contentType.slug },
    order: s.order,
  }));

  const serializedContent = allContent.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    contentType: { name: c.contentType.name, slug: c.contentType.slug },
  }));

  const serializedNews = allNews.map((n) => ({
    id: n.id,
    title: n.title,
    publishedAt: n.publishedAt?.toISOString() ?? null,
    category: n.category as string,
  }));

  const featuredConfig = (featuredRaw?.data ?? {}) as Partial<FeaturedConfig>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Landing Page</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Control the featured section and the content grid on the homepage.
        </p>
      </div>

      {/* ── Featured section override ── */}
      <div>
        <h2 className="text-base font-semibold text-stone-700 mb-4">Featured Section</h2>
        <LandingFeaturedForm
          initial={{
            mode: featuredConfig.mode ?? "auto",
            contentId: featuredConfig.contentId ?? "",
            newsId: featuredConfig.newsId ?? "",
            overrideTitle: featuredConfig.overrideTitle ?? "",
            overrideDescription: featuredConfig.overrideDescription ?? "",
            ctaEnabled: featuredConfig.ctaEnabled ?? true,
            ctaLabel: featuredConfig.ctaLabel ?? "Read more",
            ctaUrl: featuredConfig.ctaUrl ?? "",
          }}
          allContent={serializedContent}
          allNews={serializedNews}
        />
      </div>

      <hr className="border-stone-200" />

      {/* ── Grid content config ── */}
      <div>
        <h2 className="text-base font-semibold text-stone-700 mb-4">Content Grid</h2>
        <p className="text-sm text-stone-400 mb-4">
          Control which content cards appear below the featured section and in what order.
        </p>
        <LandingConfigForm
          initialRowCount={config?.rowCount ?? 8}
          initialIsManual={config?.isManual ?? false}
          initialSlots={initialSlots}
          allContent={serializedContent}
        />
      </div>
    </div>
  );
}
