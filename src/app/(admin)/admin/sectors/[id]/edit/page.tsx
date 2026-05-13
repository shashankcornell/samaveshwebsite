import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SectorEditorForm } from "@/components/admin/SectorEditorForm";
import Link from "next/link";

interface Props { params: { id: string } }

export default async function EditSectorPage({ params }: Props) {
  const sector = await prisma.topicTag.findUnique({
    where: { id: params.id },
    include: { _count: { select: { contents: true } } },
  });

  if (!sector) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/sectors" className="text-sm text-stone-400 hover:text-stone-900">← Sectors</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">{sector.name}</h1>
      </div>
      <SectorEditorForm
        sectorId={sector.id}
        initialData={{
          name: sector.name,
          slug: sector.slug,
          description: sector.description ?? "",
          longIntro: sector.longIntro ?? "",
          bgColor: sector.bgColor ?? "",
          visible: sector.visible,
          featured: sector.featured,
          image: sector.image ?? "",
          sectorImage: sector.sectorImage ?? "",
          seoTitle: sector.seoTitle ?? "",
          seoDescription: sector.seoDescription ?? "",
        }}
        contentCount={sector._count.contents}
      />
    </div>
  );
}
