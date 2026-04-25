import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meet" };

const ROLE_ORDER = ["TEAM_MEMBER", "ADVISORY_BOARD", "FELLOW", "PRESENTER", "DISCUSSANT", "ADMIN"];
const ROLE_LABELS: Record<string, string> = {
  TEAM_MEMBER: "The Team",
  ADVISORY_BOARD: "Advisory Board",
  FELLOW: "Fellows",
  PRESENTER: "Presenters",
  DISCUSSANT: "Discussants",
  ADMIN: "Admin",
};

export default async function CommunityPage() {
  const profiles = await prisma.profile.findMany({ orderBy: { name: "asc" } });

  const grouped = ROLE_ORDER.reduce(
    (acc, role) => {
      const members = profiles.filter((p) => p.role === role);
      if (members.length) acc[role] = members;
      return acc;
    },
    {} as Record<string, typeof profiles>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ background: "var(--tint-sage)", padding: "72px 0 56px" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 8 }}>
              Meet
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink-soft)", opacity: 0.65 }}>
              The people behind Samavesh.
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: "72px 0 120px" }}>
        <div className="samavesh-container">
          {Object.entries(grouped).map(([role, members]) => (
            <section key={role} style={{ marginBottom: 72 }}>
              <Reveal>
                <h2
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    opacity: 0.4,
                    marginBottom: 40,
                    paddingBottom: 16,
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  {ROLE_LABELS[role] ?? role}
                </h2>
              </Reveal>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "48px 40px",
                }}
              >
                {members.map((p, i) => (
                  <Reveal key={p.id} delay={i * 60}>
                    <Link href={`/community/${p.slug}`} style={{ display: "block" }}>
                      <article className="card-lift">
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            paddingTop: "100%",
                            overflow: "hidden",
                            background: "var(--tint-sand)",
                            marginBottom: 16,
                          }}
                        >
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="(max-width: 900px) 50vw, 280px"
                              style={{ objectFit: "cover" }}
                              className="card-img"
                            />
                          ) : (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "var(--tint-sand)",
                              }}
                            >
                              <span style={{ fontFamily: "var(--serif)", fontSize: 40, color: "var(--ink)", opacity: 0.2 }}>
                                {p.name[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400, color: "var(--ink)", margin: "0 0 4px" }}>
                          {p.name}
                        </h3>
                        {p.title && (
                          <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", opacity: 0.5, margin: 0 }}>
                            {p.title}
                          </p>
                        )}
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}

          {!profiles.length && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
                Community profiles coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
