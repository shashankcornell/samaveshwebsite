import { prisma } from "@/lib/prisma";
import { SimplePageForm } from "@/components/admin/SimplePageForm";
import type { SimplePageData } from "@/components/admin/SimplePageForm";

export default async function AdminPrivacyPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-privacy" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const initial: SimplePageData = {
    heading:     raw.heading     ?? "Privacy Policy",
    subheading:  raw.subheading  ?? "How we collect, use, and protect your information.",
    body:        raw.body        ?? "",
    lastUpdated: raw.lastUpdated ?? "",
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Privacy Policy</h1>
        <p className="text-sm text-stone-400 mt-0.5">Published at <span className="font-mono">/privacy</span></p>
      </div>
      <SimplePageForm slug="page-privacy" initial={initial} />
    </div>
  );
}
