import { prisma } from "@/lib/prisma";
import { GazetteEditorForm } from "@/components/admin/GazetteEditorForm";
import Link from "next/link";

export default async function NewGazettePage() {
  const [contentOptions, profiles, roles] = await Promise.all([
    prisma.content.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true, contentType: { select: { name: true } } },
    }),
    prisma.profile.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, title: true } }),
    prisma.gazetteEditorialBoardRole.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/gazettes" className="text-sm text-stone-400 hover:text-stone-900">← Gazettes</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">New Gazette</h1>
      </div>

      <GazetteEditorForm
        contentOptions={contentOptions}
        profiles={profiles}
        roles={roles}
      />
    </div>
  );
}
