import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/public/Reveal";
import { NewsClient } from "@/components/public/NewsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Newsroom" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const items = await prisma.newsItem.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  const serialized = items.map(item => ({
    id:          item.id,
    title:       item.title,
    slug:        item.slug,
    category:    item.category as string,
    description: item.description,
    image:       item.image,
    externalUrl: item.externalUrl,
    sourceName:  item.sourceName,
    embedType:   item.embedType,
    embedUrl:    item.embedUrl,
    embedCode:   item.embedCode,
    featured:    item.featured,
    publishedAt: item.publishedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "var(--hero-cream)", padding: "72px 0 56px", borderBottom: "1px solid var(--ink)" }}>
        <div className="samavesh-container">
          <Reveal>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.18em", color: "var(--ink-soft)", marginBottom: 20 }}>
              SAMAVESH / NEWSROOM
            </div>
            <h1 className="blogs-page-title" style={{ fontFamily: "var(--serif)", fontSize: 88, lineHeight: 1.02, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
              Newsroom.
            </h1>
            <p className="blogs-page-subtitle" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.5, maxWidth: 680, marginTop: 24, color: "var(--ink)" }}>
              Policy developments, community updates, announcements, and things worth your attention.
            </p>
          </Reveal>
        </div>
      </div>

      {serialized.length === 0 ? (
        <div style={{ padding: "96px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
            Nothing published yet. Check back soon.
          </p>
        </div>
      ) : (
        <NewsClient items={serialized} />
      )}
    </div>
  );
}
