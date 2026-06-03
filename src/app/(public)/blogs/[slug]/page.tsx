import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import { CitationBlock } from "@/components/public/CitationBlock";
import { isomorphicDompurify } from "@/lib/sanitize";
import type { Metadata } from "next";

function buildApaCitation(content: {
  title: string;
  slug: string;
  publishedAt: Date | null;
  contributors: { role: string; profile: { name: string } }[];
}): string {
  const authorProfiles = content.contributors.filter((c) => c.role === "AUTHOR");
  const formatted = authorProfiles.map((c) => {
    const parts = c.profile.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map((p) => p[0].toUpperCase() + ".").join(" ");
    return `${last}, ${initials}`;
  });

  let authorStr: string;
  if (formatted.length === 0) authorStr = "Samavesh";
  else if (formatted.length === 1) authorStr = formatted[0];
  else if (formatted.length === 2) authorStr = `${formatted[0]}, & ${formatted[1]}`;
  else authorStr = formatted.slice(0, -1).join(", ") + ", & " + formatted[formatted.length - 1];

  const date = content.publishedAt;
  const dateStr = date
    ? `(${date.getFullYear()}, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })})`
    : "(n.d.)";

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samavesh.in";
  const url = `${base}/blogs/${content.slug}`;

  return `${authorStr}. ${dateStr}. ${content.title}. Samavesh. ${url}`;
}

interface Props { params: { slug: string } }

async function getContent(slug: string) {
  return prisma.content.findUnique({
    where: { slug },
    include: {
      contentType: true,
      topics: { include: { topicTag: true } },
      contributors: { include: { profile: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = await getContent(params.slug);
  if (!content) return {};
  return {
    title: content.seoTitle ?? content.title,
    description: content.seoDescription ?? content.excerpt ?? undefined,
    openGraph: {
      title: content.seoTitle ?? content.title,
      description: content.seoDescription ?? content.excerpt ?? undefined,
      images: content.thumbnail ? [content.thumbnail] : [],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const content = await getContent(params.slug);
  if (!content || content.status !== "PUBLISHED") notFound();

  const safeBody = isomorphicDompurify(content.body);
  const authors = content.contributors.filter((c) => c.role === "AUTHOR");
  const others = content.contributors.filter((c) => c.role !== "AUTHOR");
  const citation = buildApaCitation(content);

  return (
    <article>
      {/* Hero */}
      <div
        className="blog-article-hero"
        style={{
          background: "var(--hero-cream)",
          padding: "72px 0 0",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="samavesh-container">
          <Reveal>
            {/* Breadcrumb */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 28 }}>
              <Link href="/blogs" style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.45, letterSpacing: "0.06em" }}>
                ← Think
              </Link>
              {content.topics[0] && (
                <>
                  <span style={{ color: "var(--rule)" }}>/</span>
                  <Link href={`/topics/${content.topics[0].topicTag.slug}`} style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.45 }}>
                    {content.topics[0].topicTag.name}
                  </Link>
                </>
              )}
            </div>

            {/* Type + topic + date */}
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-soft)", letterSpacing: "0.08em", marginBottom: 16 }}>
              {content.contentType.name.toUpperCase()}
              {content.topics[0] && ` · ${content.topics[0].topicTag.name.toUpperCase()}`}
              {content.readingTime && ` · ${content.readingTime} MIN READ`}
            </div>

            {/* Title */}
            <h1
              className="blog-article-title"
              style={{
                fontFamily: "var(--serif)",
                fontSize: 66,
                lineHeight: 1.1,
                fontWeight: 400,
                color: "var(--ink)",
                maxWidth: 1000,
                margin: "0 0 32px",
                letterSpacing: "-0.01em",
              }}
            >
              {content.title}
            </h1>

            {/* Excerpt */}
            {content.excerpt && (
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  lineHeight: 1.6,
                  color: "var(--ink-soft)",
                  opacity: 0.75,
                  maxWidth: 680,
                  marginBottom: 32,
                }}
              >
                {content.excerpt}
              </p>
            )}

            {/* Authors */}
            {authors.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48, fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", opacity: 0.55 }}>
                <span>By</span>
                {authors.map((c, i) => (
                  <span key={c.profile.id}>
                    <Link href={`/community/${c.profile.slug}`} style={{ fontWeight: 600, color: "var(--ink)", opacity: 1 }}>
                      {c.profile.name}
                    </Link>
                    {i < authors.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {/* Hero image — full width below header */}
        {content.thumbnail && (
          <div style={{ position: "relative", width: "100%", paddingTop: "42%", overflow: "hidden", marginTop: 8 }}>
            <Image
              src={content.thumbnail}
              alt={content.title}
              fill
              priority
              style={{ objectFit: "cover" }}
              sizes="100vw"
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="blog-article-body" style={{ padding: "72px 0 120px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {/* Audio player */}
          {content.audioUrl && (
            <div style={{ marginBottom: 40 }}>
              <audio controls src={content.audioUrl} style={{ width: "100%", borderRadius: 4 }} />
            </div>
          )}

          {/* Embed */}
          {content.embedUrl && (
            <div
              style={{ marginBottom: 40, aspectRatio: "16/9", overflow: "hidden" }}
              dangerouslySetInnerHTML={{ __html: content.embedUrl }}
            />
          )}

          {/* Prose body */}
          <div
            className="samavesh-prose"
            dangerouslySetInnerHTML={{ __html: safeBody }}
          />

          {/* Topic tags */}
          <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--rule)", display: "flex", gap: 10, flexWrap: "wrap" }}>
            {content.topics.map((t) => (
              <Link
                key={t.topicTag.slug}
                href={`/topics/${t.topicTag.slug}`}
                className="pill"
                style={{ fontSize: 15, padding: "8px 20px" }}
              >
                {t.topicTag.name}
              </Link>
            ))}
          </div>

          {/* APA Citation */}
          <CitationBlock citation={citation} />
        </div>
      </div>

      {/* Contributors section */}
      {others.length > 0 && (
        <div style={{ borderTop: "1px solid var(--rule)", padding: "56px 0 80px", background: "var(--hero-cream)" }}>
          <div className="samavesh-container">
            <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.4, marginBottom: 32 }}>
              Contributors
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
              {others.map((c) => (
                <Link key={`${c.profile.id}-${c.role}`} href={`/community/${c.profile.slug}`} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", background: "var(--tint-sand)", flexShrink: 0 }}>
                    {c.profile.image && (
                      <Image src={c.profile.image} alt={c.profile.name} width={48} height={48} style={{ objectFit: "cover" }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)", margin: 0 }}>{c.profile.name}</p>
                    <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink)", opacity: 0.45, margin: "2px 0 0", textTransform: "capitalize" }}>{c.role.toLowerCase()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
