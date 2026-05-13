import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CmsPageEditorForm } from "@/components/admin/CmsPageEditorForm";
import Link from "next/link";

interface Props { params: { id: string } }

export default async function EditCmsPagePage({ params }: Props) {
  const page = await prisma.cmsPage.findUnique({
    where: { id: params.id },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  if (!page) notFound();

  const initialSections = page.sections.map((s) => ({
    id: s.id,
    type: s.type,
    order: s.order,
    visible: s.visible,
    data: s.data as Record<string, unknown>,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pages" className="text-sm text-stone-400 hover:text-stone-900">← Pages</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">{page.title}</h1>
      </div>
      <CmsPageEditorForm
        pageId={page.id}
        initialForm={{
          title: page.title,
          slug: page.slug,
          heroHeading: page.heroHeading ?? "",
          heroSubtitle: page.heroSubtitle ?? "",
          bgColor: page.bgColor ?? "#ffffff",
          textColor: page.textColor ?? "#111111",
          status: page.status,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
        }}
        initialSections={initialSections}
      />
    </div>
  );
}
