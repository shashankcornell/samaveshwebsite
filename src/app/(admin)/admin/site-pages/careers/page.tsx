import { prisma } from "@/lib/prisma";
import { CareersPageForm } from "@/components/admin/CareersPageForm";
import type { CareersData } from "@/components/admin/CareersPageForm";

export default async function AdminCareersPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "page-careers" } });
  const raw = (config?.data ?? {}) as Partial<CareersData>;

  const initial: CareersData = {
    heading:           raw.heading           ?? "Careers.",
    subtitle:          raw.subtitle          ?? "Join a community that believes policy should be decoded, debated, and democratised.",
    isHiring:          raw.isHiring          ?? false,
    notHiringMessage:  raw.notHiringMessage  ?? "We are not hiring at the moment. We do, however, welcome motivated individuals to contribute through our externship and volunteer programmes.",
    jobs:              raw.jobs              ?? [],
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Careers</h1>
        <p className="text-sm text-stone-400 mt-0.5">Published at <span className="font-mono">/careers</span></p>
      </div>
      <CareersPageForm slug="page-careers" initial={initial} />
    </div>
  );
}
