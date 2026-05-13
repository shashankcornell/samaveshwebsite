import { prisma } from "@/lib/prisma";
import { SimplePageForm } from "@/components/admin/SimplePageForm";
import type { SimplePageData } from "@/components/admin/SimplePageForm";

export default async function AdminConductPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-conduct" } });
  const raw = (config?.data ?? {}) as Partial<SimplePageData>;
  const initial: SimplePageData = {
    heading:     raw.heading     ?? "Code of Conduct",
    subheading:  raw.subheading  ?? "The principles that keep the discourse honest.",
    body:        raw.body        ?? "",
    lastUpdated: raw.lastUpdated ?? "",
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Code of Conduct</h1>
        <p className="text-sm text-stone-400 mt-0.5">Published at <span className="font-mono">/conduct</span></p>
      </div>
      <SimplePageForm slug="page-conduct" initial={initial} />
    </div>
  );
}
