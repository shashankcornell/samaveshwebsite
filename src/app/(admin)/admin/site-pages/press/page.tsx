import { prisma } from "@/lib/prisma";
import { SimplePageForm } from "@/components/admin/SimplePageForm";
import type { SimplePageData } from "@/components/admin/SimplePageForm";

export default async function AdminPressPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-press" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const initial: SimplePageData = {
    heading:     raw.heading     ?? "Press",
    subheading:  raw.subheading  ?? "Media resources and press contact for Samavesh.",
    body:        raw.body        ?? "",
    lastUpdated: raw.lastUpdated ?? "",
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Press</h1>
        <p className="text-sm text-stone-400 mt-0.5">Published at <span className="font-mono">/press</span></p>
      </div>
      <SimplePageForm slug="page-press" initial={initial} />
    </div>
  );
}
