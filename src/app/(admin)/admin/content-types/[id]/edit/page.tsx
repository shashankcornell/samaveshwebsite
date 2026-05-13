import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContentTypeEditorForm } from "@/components/admin/ContentTypeEditorForm";
import Link from "next/link";

interface Props { params: { id: string } }

export default async function EditContentTypePage({ params }: Props) {
  const [type, allTypes] = await Promise.all([
    prisma.contentType.findUnique({
      where: { id: params.id },
      include: { _count: { select: { content: true } } },
    }),
    prisma.contentType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!type) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/content-types" className="text-sm text-stone-400 hover:text-stone-900">← Content Types</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">{type.name}</h1>
      </div>
      <ContentTypeEditorForm
        typeId={type.id}
        initialData={{
          name: type.name,
          slug: type.slug,
          description: type.description ?? "",
          thumbnailRatio: type.thumbnailRatio,
          visible: type.visible,
        }}
        contentCount={type._count.content}
        allTypes={allTypes}
      />
    </div>
  );
}
