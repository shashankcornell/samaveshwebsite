import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ContentTypesPage() {
  const types = await prisma.contentType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { content: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Content Types</h1>
          <p className="text-sm text-stone-400 mt-0.5">Define the types of content and their thumbnail dimensions</p>
        </div>
        <Link href="/admin/content-types/new" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition">
          + New Type
        </Link>
      </div>

      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Thumbnail Ratio</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Visible</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Content</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                <td className="px-4 py-3 font-medium text-stone-900">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{t.slug}</td>
                <td className="px-4 py-3 text-stone-500">{t.thumbnailRatio}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${t.visible ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                    {t.visible ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">{t._count.content}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/content-types/${t.id}/edit`} className="text-stone-500 hover:text-stone-900 font-medium">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
