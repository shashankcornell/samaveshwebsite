import { prisma } from "@/lib/prisma";
import { SimplePagePublic } from "@/components/public/SimplePagePublic";
import type { SimplePageData } from "@/components/admin/SimplePageForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Press — Samavesh" };

const DEFAULT: SimplePageData = {
  heading: "Press",
  subheading: "Media resources and press contact for Samavesh.",
  lastUpdated: "2025-01-01T00:00:00.000Z",
  body: `<p>Samavesh welcomes media coverage of our work, our publications, and our community. If you are a journalist, researcher, or podcaster looking to cover policy discourse in India, we'd love to speak with you.</p>
<h2>Press contact</h2>
<p>For interview requests, media kits, and factual queries, write to hello@samavesh.in with "PRESS" in the subject line. We typically respond within two working days.</p>
<h2>About Samavesh</h2>
<p>Samavesh is an independent policy discourse community based in New Delhi. Founded in 2022, it brings together researchers, practitioners, and citizens to present, debate, and publish ideas on India's most pressing policy challenges. The annual Samavesh Summit selects 10–12 discourse papers from an open call and subjects them to structured debate before a room of 150–200 discussants.</p>
<h2>The Gazette</h2>
<p>The Samavesh Gazette is an annual journal that collects the year's discourse papers in edited form. Volume I was published in December 2025. Copies are available for press review on request.</p>
<h2>Usage guidelines</h2>
<p>Samavesh's name, monogram, and publications may be referenced in press coverage with attribution. The Samavesh monogram may not be used in ways that imply endorsement. For logo files and brand assets, include your request in your press email.</p>`,
};

export default async function PressPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-press" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const data: SimplePageData = {
    heading:     raw.heading     ?? DEFAULT.heading,
    subheading:  raw.subheading  ?? DEFAULT.subheading,
    body:        raw.body        ?? DEFAULT.body,
    lastUpdated: raw.lastUpdated ?? DEFAULT.lastUpdated,
  };
  return <SimplePagePublic data={data} />;
}
