import { prisma } from "@/lib/prisma";
import { SimplePagePublic } from "@/components/public/SimplePagePublic";
import type { SimplePageData } from "@/components/admin/SimplePageForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacy Policy — Samavesh" };

const DEFAULT: SimplePageData = {
  heading: "Privacy Policy",
  subheading: "How we collect, use, and protect your information.",
  lastUpdated: "2025-01-01T00:00:00.000Z",
  body: `<p>Samavesh ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect when you use our website and how we use it.</p>
<h2>Information we collect</h2>
<p>We collect information you provide directly — such as your email address when you subscribe to our newsletter — and information automatically collected when you visit our site, including IP address, browser type, and pages visited.</p>
<h2>How we use your information</h2>
<p>We use your information to send the fortnightly newsletter (if subscribed), to improve our website, and to understand how people engage with our content. We do not sell your data to third parties.</p>
<h2>Cookies</h2>
<p>Our website uses minimal cookies necessary for site functionality. We do not use tracking cookies for advertising purposes.</p>
<h2>Data retention</h2>
<p>Newsletter subscriber emails are retained until you unsubscribe. You may unsubscribe at any time using the link in any newsletter email.</p>
<h2>Contact</h2>
<p>For any privacy-related queries, write to us at hello@samavesh.in.</p>`,
};

export default async function PrivacyPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-privacy" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const data: SimplePageData = {
    heading:     raw.heading     ?? DEFAULT.heading,
    subheading:  raw.subheading  ?? DEFAULT.subheading,
    body:        raw.body        ?? DEFAULT.body,
    lastUpdated: raw.lastUpdated ?? DEFAULT.lastUpdated,
  };
  return <SimplePagePublic data={data} />;
}
