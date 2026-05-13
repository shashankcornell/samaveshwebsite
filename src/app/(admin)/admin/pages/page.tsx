import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function CmsPagesPage() {
  const pages = await prisma.cmsPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sections: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Pages</h1>
          <p className="text-sm text-stone-400 mt-0.5">Build and manage CMS-driven pages</p>
        </div>
        <Link href="/admin/pages/new" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition">
          + New Page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-12 text-center">
          <p className="text-stone-400 text-sm">No CMS pages yet.</p>
          <Link href="/admin/pages/new" className="mt-3 inline-block text-sm font-medium text-stone-600 hover:text-stone-900">
            Create your first page →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Sections</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 font-medium text-stone-900">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">/{p.slug}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-stone-500">{p._count.sections}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/${p.slug}`} target="_blank" className="text-stone-400 hover:text-stone-700 text-xs">Preview ↗</Link>
                      <Link href={`/admin/pages/${p.id}/edit`} className="text-stone-500 hover:text-stone-900 font-medium">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
