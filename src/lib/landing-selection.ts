import { prisma } from "@/lib/prisma";

const CONTENT_INCLUDE = {
  contentType: true,
  topics: { include: { topicTag: true } },
  contributors: { include: { profile: { select: { name: true } } } },
} as const;

export type LandingContent = Awaited<ReturnType<typeof selectLandingContent>>[0];

export async function selectLandingContent(limit: number = 24) {
  // Get all published content ordered by date
  const all = await prisma.content.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: CONTENT_INCLUDE,
  });

  if (all.length === 0) return [];

  // Group by content type
  const byType: Record<string, typeof all> = {};
  for (const item of all) {
    const slug = item.contentType.slug;
    if (!byType[slug]) byType[slug] = [];
    byType[slug].push(item);
  }

  const selected = new Set<string>();
  const result: typeof all = [];

  // Step 1: guarantee at least 3 per type (or all if fewer than 3 exist)
  for (const items of Object.values(byType)) {
    const take = Math.min(3, items.length);
    for (let i = 0; i < take; i++) {
      if (!selected.has(items[i].id)) {
        selected.add(items[i].id);
        result.push(items[i]);
      }
    }
  }

  // Step 2: fill remaining slots with most recent across all types
  for (const item of all) {
    if (result.length >= limit) break;
    if (!selected.has(item.id)) {
      selected.add(item.id);
      result.push(item);
    }
  }

  // Step 3: Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, limit);
}

export async function getLandingContent() {
  const config = await prisma.landingPageConfig.findFirst({
    include: {
      slots: {
        orderBy: { order: "asc" },
        include: {
          content: { include: CONTENT_INCLUDE },
        },
      },
    },
  });

  const limit = (config?.rowCount ?? 8) * 3;

  // Manual override: use saved slots if we have enough
  if (config?.isManual && config.slots.length > 0) {
    return {
      items: config.slots.map((s) => s.content),
      rowCount: config.rowCount ?? 8,
      isManual: true,
    };
  }

  // Auto selection
  const items = await selectLandingContent(limit);
  return {
    items,
    rowCount: config?.rowCount ?? 8,
    isManual: false,
  };
}
