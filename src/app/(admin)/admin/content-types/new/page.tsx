import { prisma } from "@/lib/prisma";
import { ContentTypeEditorForm } from "@/components/admin/ContentTypeEditorForm";
import Link from "next/link";

export default async function NewContentTypePage() {
  const allTypes = await prisma.contentType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/content-types" className="text-sm text-stone-400 hover:text-stone-900">← Content Types</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">New Content Type</h1>
      </div>
      <ContentTypeEditorForm allTypes={allTypes} />
    </div>
  );
}
