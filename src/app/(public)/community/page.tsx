import { prisma } from "@/lib/prisma";
import { MeetPagePublic } from "@/components/public/MeetPagePublic";
import type { MeetData, MeetSection } from "@/components/admin/MeetPageForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meet" };

function uid() { return Math.random().toString(36).slice(2, 10); }

const DEFAULT_SECTIONS: MeetSection[] = [
  {
    id: uid(), type: "people", title: "The people who keep the calendar.",
    subtitle: "Programme, editorial, operations and externship — full-time and near-full-time.",
    sectionNumber: "01 / CORE TEAM", role: "TEAM_MEMBER", displayMode: "core",
    bgVariant: "default", visible: true, order: 0,
  },
  {
    id: uid(), type: "people", title: "Who decides what we discuss.",
    subtitle: "Each year, the board reads the open call for ideas and selects 10–12 to present at the summit.",
    sectionNumber: "02 / ADVISORY BOARD", role: "ADVISORY_BOARD", displayMode: "list",
    bgVariant: "paper", visible: true, order: 1,
  },
  {
    id: uid(), type: "people", title: "Who shepherds each idea.",
    subtitle: "Mentors prepare presenters, anchor the discourse on the day, and follow each paper to publication.",
    sectionNumber: "03 / SECTORAL MENTORS", role: "FELLOW", displayMode: "compact",
    bgVariant: "default", visible: true, order: 2,
  },
  {
    id: uid(), type: "people", title: "This year's voices.",
    subtitle: "Researchers, practitioners and policy nerds whose ideas were chosen for the 2025 summit.",
    sectionNumber: "04 / EXTERNS & PRESENTERS", role: "PRESENTER", displayMode: "dense",
    bgVariant: "default", visible: true, order: 3,
  },
  {
    id: uid(), type: "people", title: "The room itself.",
    subtitle: "A sample of the discussants who showed up to at least three discourses this year.",
    sectionNumber: "06 / DISCUSSANTS", role: "DISCUSSANT", displayMode: "discussants",
    bgVariant: "default", visible: true, order: 5,
  },
  {
    id: uid(), type: "cta",
    ctaHeading: "Want to join the room?",
    ctaBody: "<p>We open externships twice a year, accept new chapter conveners on a rolling basis, and partner with researchers on commissioned briefs. Pick the path that fits.</p>",
    ctaLabel: "See ways to act", ctaHref: "/act",
    visible: true, order: 6,
  },
];

export default async function CommunityPage() {
  const [profiles, pageConfig] = await Promise.all([
    prisma.profile.findMany({
      where: { visible: true },
      orderBy: { name: "asc" },
    }),
    prisma.pageConfig.findUnique({ where: { slug: "meet" } }),
  ]);

  const raw = (pageConfig?.data ?? {}) as Partial<MeetData>;

  const data: MeetData = {
    headingEyebrow: raw.headingEyebrow ?? "THE COMMUNITY",
    heading: raw.heading ?? "We are not an institution. We are a <em>room.</em>",
    subtitle: raw.subtitle ?? "",
    sections: raw.sections?.length
      ? [...raw.sections].sort((a, b) => a.order - b.order)
      : DEFAULT_SECTIONS,
  };

  const serialized = profiles.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    title: p.title,
    role: p.role,
    image: p.image,
  }));

  return <MeetPagePublic data={data} profiles={serialized} />;
}
