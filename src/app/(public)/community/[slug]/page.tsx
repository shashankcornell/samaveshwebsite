import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import { CardMosaic } from "@/components/public/CardMosaic";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({ where: { slug: params.slug } });
  return { title: profile?.name ?? "Profile" };
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin", TEAM_MEMBER: "Team Member", ADVISORY_BOARD: "Advisory Board",
  FELLOW: "Fellow", PRESENTER: "Presenter", DISCUSSANT: "Discussant",
};

export default async function ProfilePage({ params }: Props) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: {
      contributions: {
        include: {
          content: {
            include: { contentType: true, topics: { include: { topicTag: true } } },
          },
        },
      },
    },
  });

  if (!profile) notFound();

  const content = profile.contributions
    .map((c) => c.content)
    .filter((c) => c !== null && c.status === "PUBLISHED")
    .sort((a, b) => ((b?.publishedAt?.getTime() ?? 0) - (a?.publishedAt?.getTime() ?? 0)));

  const cards = content
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((c) => ({
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
    <div>
      {/* Profile header */}
      <div style={{ background: "var(--tint-sage)", padding: "72px 0 56px" }}>
        <div className="samavesh-container">
          <Reveal>
            <Link
              href="/community"
              style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", opacity: 0.45, marginBottom: 32, display: "block", letterSpacing: "0.06em" }}
            >
              ← Meet
            </Link>
            <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
              <div style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", overflow: "hidden", background: "var(--tint-sand)", flexShrink: 0 }}>
                {profile.image ? (
                  <Image src={profile.image} alt={profile.name} fill style={{ objectFit: "cover" }} sizes="120px" />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "var(--tint-sand)" }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 48, color: "var(--ink)", opacity: 0.25 }}>{profile.name[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.45, marginBottom: 8 }}>
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </p>
                <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 400, color: "var(--ink)", margin: "0 0 6px" }}>
                  {profile.name}
                </h1>
                {profile.title && (
                  <p style={{ fontFamily: "var(--sans)", fontSize: 15, color: "var(--ink)", opacity: 0.5, marginBottom: 20 }}>
                    {profile.title}
                  </p>
                )}
                <div style={{ display: "flex", gap: 24 }}>
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: 14 }}>
                      LinkedIn <span className="arrow" style={{ width: 22, height: 22, fontSize: 12 }}>→</span>
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: 14 }}>
                      Twitter <span className="arrow" style={{ width: 22, height: 22, fontSize: 12 }}>→</span>
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: 14 }}>
                      Website <span className="arrow" style={{ width: 22, height: 22, fontSize: 12 }}>→</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div style={{ borderBottom: "1px solid var(--rule)", padding: "48px 0" }}>
          <div className="samavesh-container" style={{ maxWidth: 720 }}>
            <Reveal>
              <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.7, color: "var(--ink-soft)" }}>
                {profile.bio}
              </p>
            </Reveal>
          </div>
        </div>
      )}

      {/* Contributions */}
      {cards.length > 0 && (
        <div style={{ padding: "64px 0 120px" }}>
          <div className="samavesh-container">
            <Reveal>
              <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.4, marginBottom: 48 }}>
                Contributions
              </p>
            </Reveal>
            <CardMosaic items={cards} />
          </div>
        </div>
      )}
    </div>
  );
}
