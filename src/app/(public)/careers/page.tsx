import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/public/Reveal";
import Link from "next/link";
import type { Metadata } from "next";
import type { CareersData, JobListing } from "@/components/admin/CareersPageForm";

export const metadata: Metadata = { title: "Careers" };
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-careers" } });
  const raw = (config?.data ?? {}) as Partial<CareersData>;

  const data: CareersData = {
    heading:          raw.heading          ?? "Careers.",
    subtitle:         raw.subtitle         ?? "Join a community that believes policy should be decoded, debated, and democratised.",
    isHiring:         raw.isHiring         ?? false,
    notHiringMessage: raw.notHiringMessage ?? "We are not hiring at the moment. We do, however, welcome motivated individuals to contribute through our externship and volunteer programmes.",
    jobs:             raw.jobs             ?? [],
  };

  const visibleJobs = data.isHiring ? data.jobs : [];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "var(--hero-cream)", padding: "72px 0 64px", borderBottom: "1px solid var(--ink)" }}>
        <div className="samavesh-container">
          <Reveal>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.18em", color: "var(--ink-soft)", marginBottom: 20 }}>
              SAMAVESH / CAREERS
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 88, lineHeight: 1.02, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}
              className="blogs-page-title">
              {data.heading}
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.5, maxWidth: 680, marginTop: 28, color: "var(--ink)" }}
              className="blogs-page-subtitle">
              {data.subtitle}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Status banner */}
      <div style={{ borderBottom: "1px solid var(--rule)", padding: "20px 0", background: data.isHiring ? "var(--tint-sage)" : "var(--paper)" }}>
        <div className="samavesh-container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: data.isHiring ? "#22a06b" : "rgba(17,17,17,0.25)",
            display: "inline-block",
          }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-soft)" }}>
            {data.isHiring ? `${visibleJobs.length} OPEN ROLE${visibleJobs.length !== 1 ? "S" : ""}` : "NO OPEN ROLES AT THIS TIME"}
          </span>
        </div>
      </div>

      {/* Not hiring state */}
      {!data.isHiring && (
        <div style={{ padding: "80px 0 120px" }}>
          <div className="samavesh-container">
            <Reveal>
              <div style={{ maxWidth: 640 }}>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.6, color: "var(--ink)", marginBottom: 40 }}>
                  {data.notHiringMessage}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--ink)" }}>
                  <NotHiringRow
                    label="Externships"
                    desc="Short-term research and writing engagements, open to students and early-career professionals."
                    href="/act"
                  />
                  <NotHiringRow
                    label="Volunteer"
                    desc="Help run chapter events, moderate discourses, or support editorial work."
                    href="/act"
                  />
                  <NotHiringRow
                    label="Write for us"
                    desc="Pitch an op-ed, essay, or discourse paper to our editorial team."
                    href="/act"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      )}

      {/* Job listings */}
      {data.isHiring && visibleJobs.length > 0 && (
        <div style={{ padding: "64px 0 120px" }}>
          <div className="samavesh-container">
            <div style={{ borderTop: "1px solid var(--ink)" }}>
              {visibleJobs.map((job, i) => (
                <Reveal key={job.id} delay={i * 60}>
                  <JobRow job={job} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hiring but no roles yet */}
      {data.isHiring && visibleJobs.length === 0 && (
        <div style={{ padding: "80px 0 120px" }}>
          <div className="samavesh-container">
            <Reveal>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, color: "var(--ink)", opacity: 0.45 }}>
                Roles coming soon. Check back shortly.
              </p>
            </Reveal>
          </div>
        </div>
      )}
    </div>
  );
}

function NotHiringRow({ label, desc, href }: { label: string; desc: string; href: string }) {
  return (
    <Link href={href} style={{ display: "block", textDecoration: "none" }} className="topic-list-row">
      <div style={{ padding: "28px 0", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 32 }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.15, color: "var(--ink)", marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>{desc}</div>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--ink-soft)", flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}

function JobRow({ job }: { job: JobListing }) {
  const isExternal = job.applyLink.startsWith("http");
  const href = job.applyLink || "#";

  return (
    <div style={{ padding: "36px 0", borderBottom: "1px solid var(--rule)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            {job.department && (
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-soft)", border: "1px solid var(--rule)", borderRadius: 999, padding: "4px 10px" }}>
                {job.department.toUpperCase()}
              </span>
            )}
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-soft)", border: "1px solid var(--rule)", borderRadius: 999, padding: "4px 10px" }}>
              {job.type.toUpperCase()}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-soft)" }}>
              {job.location}
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, lineHeight: 1.15, fontWeight: 400, margin: 0 }}>
            {job.title}
          </h2>
          {job.description && (
            <p style={{ fontFamily: "var(--sans)", fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", marginTop: 14, maxWidth: 600 }}>
              {job.description}
            </p>
          )}
        </div>
        {job.applyLink && (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="btn-text"
            style={{ marginTop: 8, flexShrink: 0 }}
          >
            <span>Apply</span>
            <span className="arrow">→</span>
          </a>
        )}
      </div>
    </div>
  );
}
