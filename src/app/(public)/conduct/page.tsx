import { prisma } from "@/lib/prisma";
import { SimplePagePublic } from "@/components/public/SimplePagePublic";
import type { SimplePageData } from "@/components/admin/SimplePageForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Code of Conduct — Samavesh" };

const DEFAULT: SimplePageData = {
  heading: "Code of Conduct",
  subheading: "The principles that keep the discourse honest.",
  lastUpdated: "2025-01-01T00:00:00.000Z",
  body: `<p>Samavesh is a space for rigorous, respectful policy discourse. Everyone who participates — as a discussant, presenter, moderator, or reader — is expected to uphold the following principles.</p>
<h2>Engage with ideas, not identities</h2>
<p>Critique arguments on their merits. Personal attacks, dismissals based on identity, and ad hominem are not welcome in any Samavesh space — physical or digital.</p>
<h2>Come prepared</h2>
<p>Every discourse paper is circulated in advance. Discussants are expected to have read it. The room works when everyone has done the reading.</p>
<h2>Make space to disagree well</h2>
<p>Disagreement is the point. We do not seek consensus — we seek understanding. If you are not leaving a session with a more nuanced view than you arrived with, something has gone wrong.</p>
<h2>Protect the deliberative record</h2>
<p>What is said in the room during open deliberation is not attributed externally without the speaker's consent. Discourse papers, once published, are on the record.</p>
<h2>Report concerns</h2>
<p>If you witness conduct that violates these principles, write to us at hello@samavesh.in. All reports are handled with discretion.</p>`,
};

export default async function ConductPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-conduct" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const data: SimplePageData = {
    heading:     raw.heading     ?? DEFAULT.heading,
    subheading:  raw.subheading  ?? DEFAULT.subheading,
    body:        raw.body        ?? DEFAULT.body,
    lastUpdated: raw.lastUpdated ?? DEFAULT.lastUpdated,
  };
  return <SimplePagePublic data={data} />;
}
