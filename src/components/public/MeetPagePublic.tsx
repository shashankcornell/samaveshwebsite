"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";
import type { MeetData, MeetSection, StatItem, ChapterItem } from "@/components/admin/MeetPageForm";

interface Profile {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  role: string;
  image: string | null;
}

/* ── Avatar ── */
function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map((s: string) => s[0]).join("").toUpperCase();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      background: `oklch(0.78 0.06 ${hue})`,
      color: `oklch(0.28 0.05 ${hue})`,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--mono)", fontSize: Math.max(10, size * 0.32),
      letterSpacing: "0.04em", flexShrink: 0,
      transition: "transform 350ms cubic-bezier(.2,.7,.2,1)",
    }}>{initials}</div>
  );
}

/* ── ProfileAvatar ── */
function ProfileAvatar({ profile, size = 56 }: { profile: Profile; size: number }) {
  const [hovered, setHovered] = useState(false);
  if (!profile.image) return <Avatar name={profile.name} size={size} />;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden",
        position: "relative", flexShrink: 0,
        transition: "transform 350ms cubic-bezier(.2,.7,.2,1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image src={profile.image} alt={profile.name} fill sizes={`${size * 2}px`}
        style={{ objectFit: "cover", filter: "grayscale(100%)", transition: "filter 400ms ease" }} />
      <Image src={profile.image} alt="" fill sizes={`${size * 2}px`}
        style={{ objectFit: "cover", opacity: hovered ? 1 : 0, transition: "opacity 400ms ease" }} />
    </div>
  );
}

/* ── PersonRow ── */
function PersonRow({ profile, avatarSize = 56 }: { profile: Profile; avatarSize?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "8px 0",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        transition: "transform 250ms cubic-bezier(.2,.7,.2,1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ProfileAvatar profile={profile} size={avatarSize} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: avatarSize >= 56 ? 18 : 15, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {profile.name}
        </div>
        {profile.title && (
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.04em", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.title.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ number, title, subtitle }: { number?: string; title?: string; subtitle?: string }) {
  return (
    <Reveal>
      <div className="meet-section-header-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 64, alignItems: "start", marginBottom: 40 }}>
        {number && (
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-soft)", letterSpacing: "0.12em", paddingTop: 16 }}>
            {number}
          </div>
        )}
        <div style={number ? {} : { gridColumn: "1 / -1" }}>
          {title && <h2 className="meet-section-h2" style={{ fontFamily: "var(--serif)", fontSize: 48, lineHeight: 1.05, fontWeight: 400, margin: 0 }}>{title}</h2>}
          {subtitle && (
            <p style={{ fontFamily: "var(--sans)", fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", maxWidth: 580, marginTop: 16 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ── Stats strip ── */
function StatsSection({ section }: { section: MeetSection }) {
  const stats: StatItem[] = section.stats ?? [];
  if (!stats.length) return null;
  return (
    <section className="samavesh-container" style={{ paddingBottom: 80 }}>
      <Reveal>
        <div className="meet-stats-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)" }}>
          {stats.map((s, i) => (
            <div key={i} className="meet-stat-cell" style={{ padding: "32px 28px", borderRight: i < stats.length - 1 ? "1px solid var(--rule)" : "0" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 56, lineHeight: 1, fontWeight: 400, letterSpacing: "-0.02em" }}>{s.n}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", letterSpacing: "0.08em", marginTop: 12 }}>{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ── Core people (120px avatar) ── */
function CorePeople({ section, profiles }: { section: MeetSection; profiles: Profile[] }) {
  const filtered = section.role ? profiles.filter(p => p.role === section.role) : profiles;
  if (!filtered.length) return null;
  return (
    <section className="samavesh-container" style={{ paddingBottom: 96 }}>
      <SectionHeader number={section.sectionNumber} title={section.title} subtitle={section.subtitle} />
      <div className="meet-core-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 32px", rowGap: 56 }}>
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60}>
            <Link href={`/community/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
                <ProfileAvatar profile={p} size={120} />
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.2 }}>{p.name}</div>
                  {p.title && <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", letterSpacing: "0.06em", marginTop: 6 }}>{p.title.toUpperCase()}</div>}
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── List people (56px rows) ── */
function ListPeople({ section, profiles, cols = 4, avatarSize = 56 }: { section: MeetSection; profiles: Profile[]; cols?: number; avatarSize?: number }) {
  const filtered = section.role ? profiles.filter(p => p.role === section.role) : profiles;
  if (!filtered.length) return null;
  const bgStyle = section.bgVariant === "paper"
    ? { background: "var(--paper)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)" }
    : section.bgVariant === "cream"
    ? { background: "var(--hero-cream)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)" }
    : {};
  const inner = (
    <div className="samavesh-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <SectionHeader number={section.sectionNumber} title={section.title} subtitle={section.subtitle} />
      <div className="meet-list-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px 48px" }}>
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % cols) * 50}>
            <Link href={`/community/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <PersonRow profile={p} avatarSize={avatarSize} />
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
  return section.bgVariant && section.bgVariant !== "default"
    ? <section style={{ ...bgStyle, marginBottom: 96 }}>{inner}</section>
    : <section style={{ paddingBottom: 96 }}>{inner}</section>;
}

/* ── Dense people (6-col, 48px) ── */
function DensePeople({ section, profiles }: { section: MeetSection; profiles: Profile[] }) {
  const filtered = section.role ? profiles.filter(p => p.role === section.role) : profiles;
  if (!filtered.length) return null;
  return (
    <section className="samavesh-container" style={{ paddingBottom: 96 }}>
      <SectionHeader number={section.sectionNumber} title={section.title} subtitle={section.subtitle} />
      <div className="meet-dense-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "20px 32px" }}>
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % 6) * 40}>
            <Link href={`/community/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                <ProfileAvatar profile={p} size={48} />
                <div style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.25 }}>{p.name}</div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Discussants ── */
function DiscussantsPeople({ section, profiles }: { section: MeetSection; profiles: Profile[] }) {
  const filtered = section.role ? profiles.filter(p => p.role === section.role) : profiles;
  if (!filtered.length) return null;
  return (
    <section className="samavesh-container" style={{ paddingBottom: 96 }}>
      <SectionHeader number={section.sectionNumber} title={section.title} subtitle={section.subtitle} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 20px", alignItems: "center" }}>
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % 8) * 30}>
            <Link href={`/community/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <DiscussantTag profile={p} />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function DiscussantTag({ profile }: { profile: Profile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: 8, transform: hovered ? "translateY(-2px)" : "translateY(0)", transition: "transform 220ms cubic-bezier(.2,.7,.2,1)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ProfileAvatar profile={profile} size={34} />
      <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)" }}>{profile.name}</span>
    </div>
  );
}

/* ── Chapters ── */
function ChaptersSection({ section }: { section: MeetSection }) {
  const chapters: ChapterItem[] = section.chapters ?? [];
  if (!chapters.length) return null;
  const label = section.chaptersLabel ?? "DISCUSSANTS";
  const bgStyle = section.bgVariant === "paper"
    ? { background: "var(--paper)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)" }
    : { background: "var(--hero-cream)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)" };
  return (
    <section style={{ ...bgStyle, paddingTop: 80, paddingBottom: 80, marginBottom: 96 }}>
      <div className="samavesh-container">
        <SectionHeader number={section.sectionNumber} title={section.title} subtitle={section.subtitle} />
        <div className="meet-chapters-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {chapters.map((c, i) => (
            <Reveal key={i} delay={(i % 4) * 40}>
              <div style={{ borderTop: "1px solid var(--ink)", padding: "20px 8px 24px 0" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 32, lineHeight: 1.1 }}>{c.city}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", letterSpacing: "0.08em", marginTop: 8 }}>{c.count} {label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CtaSection({ section }: { section: MeetSection }) {
  return (
    <section className="samavesh-container" style={{ paddingTop: 64, paddingBottom: 96, borderTop: "1px solid var(--ink)" }}>
      <div className="meet-cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <h2 className="meet-cta-h2" style={{ fontFamily: "var(--serif)", fontSize: 64, lineHeight: 1.05, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
          {section.ctaHeading ?? section.title ?? "Want to join the room?"}
        </h2>
        <div>
          {section.ctaBody && (
            <div
              className="samavesh-prose"
              style={{ fontFamily: "var(--sans)", fontSize: 17, lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: section.ctaBody }}
            />
          )}
          {section.ctaLabel && (
            <Link
              href={section.ctaHref ?? "/act"}
              className="btn-text"
              style={{ marginTop: 24, display: "inline-flex" }}
            >
              <span>{section.ctaLabel}</span>
              <span className="arrow">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Rich text ── */
function TextSection({ section }: { section: MeetSection }) {
  if (!section.textBody) return null;
  return (
    <section className="samavesh-container" style={{ paddingBottom: 64 }}>
      {section.title && (
        <Reveal>
          <h2 style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.4, marginBottom: 32, paddingBottom: 16, borderBottom: "1px solid var(--rule)" }}>
            {section.title}
          </h2>
        </Reveal>
      )}
      <Reveal>
        <div className="samavesh-prose" style={{ maxWidth: 760, fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: section.textBody }} />
      </Reveal>
    </section>
  );
}

/* ── People section dispatcher ── */
function PeopleSection({ section, profiles }: { section: MeetSection; profiles: Profile[] }) {
  const mode = section.displayMode ?? "list";
  if (mode === "core")        return <CorePeople section={section} profiles={profiles} />;
  if (mode === "dense")       return <DensePeople section={section} profiles={profiles} />;
  if (mode === "discussants") return <DiscussantsPeople section={section} profiles={profiles} />;
  if (mode === "compact")     return <ListPeople section={section} profiles={profiles} cols={4} avatarSize={48} />;
  return <ListPeople section={section} profiles={profiles} cols={4} avatarSize={56} />;
}

/* ── Main export ── */
export function MeetPagePublic({ data, profiles }: { data: MeetData; profiles: Profile[] }) {
  const visibleSections = data.sections.filter(s => s.visible);

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "var(--hero-cream)", paddingTop: 96, paddingBottom: 96, marginBottom: 64, borderBottom: "1px solid var(--ink)" }}>
        <div className="samavesh-container">
          <Reveal>
            {data.headingEyebrow && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.12em", color: "var(--ink-soft)", marginBottom: 24 }}>
                {data.headingEyebrow}
              </div>
            )}
            <h1 className="meet-hero-title" style={{ fontFamily: "var(--serif)", fontSize: 110, lineHeight: 0.98, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}
              dangerouslySetInnerHTML={{ __html: data.heading || "Meet." }}
            />
            {data.subtitle ? (
              <div
                className="samavesh-prose meet-hero-subtitle"
                style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, lineHeight: 1.55, maxWidth: 720, marginTop: 36 }}
                dangerouslySetInnerHTML={{ __html: data.subtitle }}
              />
            ) : (
              <p className="meet-hero-subtitle" style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, lineHeight: 1.55, maxWidth: 720, marginTop: 36 }}>
                Samavesh is held up by a small core, a board of advisors who choose what gets discussed, sectoral mentors who shepherd each idea, and a few hundred discussants who show up every month to disagree well.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* Sections */}
      {visibleSections.map(section => {
        if (section.type === "stats")    return <StatsSection key={section.id} section={section} />;
        if (section.type === "people")   return <PeopleSection key={section.id} section={section} profiles={profiles} />;
        if (section.type === "chapters") return <ChaptersSection key={section.id} section={section} />;
        if (section.type === "cta")      return <CtaSection key={section.id} section={section} />;
        if (section.type === "text")     return <TextSection key={section.id} section={section} />;
        return null;
      })}

      {!visibleSections.length && profiles.length === 0 && (
        <div className="samavesh-container" style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", opacity: 0.4 }}>
            Community profiles coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
