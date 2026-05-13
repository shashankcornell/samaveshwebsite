import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function GazettesPage() {
  const gazettes = await prisma.gazette.findMany({
    orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { articles: true, editorialBoard: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Gazettes</h1>
          <p className="text-sm text-stone-400 mt-0.5">Manage gazette volumes and their content</p>
        </div>
        <Link href="/admin/gazettes/new" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition">
          + New Gazette
        </Link>
      </div>

      {gazettes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-12 text-center">
          <p className="text-stone-400 text-sm">No gazettes yet.</p>
          <Link href="/admin/gazettes/new" className="mt-3 inline-block text-sm font-medium text-stone-600 hover:text-stone-900">
            Create your first gazette →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Volume</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Articles</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Board</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600"></th>
              </tr>
            </thead>
            <tbody>
              {gazettes.map((g) => (
                <tr key={g.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {g.name}
                    {g.isCurrent && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">Current</span>
                    )}
                    {g.editionName && <span className="ml-1 text-stone-400 font-normal">— {g.editionName}</span>}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{g.volumeNumber ? `Vol. ${g.volumeNumber}` : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-3 text-stone-500">{g._count.articles}</td>
                  <td className="px-4 py-3 text-stone-500">{g._count.editorialBoard}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/gazettes/${g.id}/edit`} className="text-stone-500 hover:text-stone-900 font-medium">
                      Edit
                    </Link>
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
