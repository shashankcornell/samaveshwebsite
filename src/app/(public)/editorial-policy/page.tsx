import { prisma } from "@/lib/prisma";
import { SimplePagePublic } from "@/components/public/SimplePagePublic";
import type { SimplePageData } from "@/components/admin/SimplePageForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editorial Policy — Samavesh" };

const DEFAULT: SimplePageData = {
  heading: "Editorial Policy",
  subheading: "How we select, edit, and publish the work that carries our name.",
  lastUpdated: "2025-01-01T00:00:00.000Z",
  body: `<p>Samavesh publishes two kinds of work: discourse papers that emerge from the summit, and independent essays and op-eds commissioned or submitted by contributors. This policy governs both.</p>
<h2>Discourse papers</h2>
<p>Discourse papers are the written form of ideas presented at the Samavesh Summit. They are selected by the Advisory Board from an open call for ideas, presented live in a moderated session, and then revised by the author in light of the discussion. Each paper is edited by a named editor from the editorial team before publication in The Gazette.</p>
<h2>Essays and op-eds</h2>
<p>Independent contributions are reviewed by at least one member of the editorial team for factual accuracy, argumentative coherence, and alignment with Samavesh's standards. We do not publish work that is promotional, that makes claims without evidence, or that lacks a clear policy argument.</p>
<h2>Corrections</h2>
<p>Errors brought to our attention are corrected transparently. Significant corrections are noted at the top of the relevant piece with a date.</p>
<h2>Conflicts of interest</h2>
<p>Authors are required to disclose relevant affiliations and funding sources. We reserve the right to decline publication where undisclosed conflicts of interest become apparent.</p>
<h2>Independence</h2>
<p>Editorial decisions are made independently of sponsors, funders, or government bodies. No external party may compel us to publish or retract work.</p>
<h2>Contact</h2>
<p>Editorial queries may be directed to hello@samavesh.in.</p>`,
};

export default async function EditorialPolicyPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-editorial" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const data: SimplePageData = {
    heading:     raw.heading     ?? DEFAULT.heading,
    subheading:  raw.subheading  ?? DEFAULT.subheading,
    body:        raw.body        ?? DEFAULT.body,
    lastUpdated: raw.lastUpdated ?? DEFAULT.lastUpdated,
  };
  return <SimplePagePublic data={data} />;
}
