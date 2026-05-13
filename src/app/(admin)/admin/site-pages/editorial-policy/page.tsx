import { prisma } from "@/lib/prisma";
import { SimplePageForm } from "@/components/admin/SimplePageForm";
import type { SimplePageData } from "@/components/admin/SimplePageForm";

export default async function AdminEditorialPolicyPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-editorial" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const initial: SimplePageData = {
    heading:     raw.heading     ?? "Editorial Policy",
    subheading:  raw.subheading  ?? "How we select, edit, and publish the work that carries our name.",
    body:        raw.body        ?? "",
    lastUpdated: raw.lastUpdated ?? "",
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Editorial Policy</h1>
        <p className="text-sm text-stone-400 mt-0.5">Published at <span className="font-mono">/editorial-policy</span></p>
      </div>
      <SimplePageForm slug="page-editorial" initial={initial} />
    </div>
  );
}
