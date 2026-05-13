import { prisma } from "@/lib/prisma";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  POLICY: "Policy", COMMUNITY: "Community", ANNOUNCEMENT: "Announcement",
  MEDIA: "Media", EVENT: "Event", HIRING: "Hiring", RESEARCH: "Research",
};

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT:     "bg-stone-100 text-stone-500",
};

export default async function AdminNewsPage() {
  const items = await prisma.newsItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Newsroom</h1>
          <p className="text-sm text-stone-400 mt-0.5">News items, announcements, and embeds — published at <span className="font-mono">/news</span></p>
        </div>
        <Link href="/admin/news/new"
          className="bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition">
          + New item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-stone-400 text-sm">No news items yet.</p>
          <Link href="/admin/news/new" className="mt-4 inline-block text-sm font-medium text-stone-900 underline">
            Create your first item
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Embed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Date</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900 max-w-xs truncate">
                      {item.featured && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 mb-px" />}
                      {item.title}
                    </div>
                    {item.sourceName && <div className="text-xs text-stone-400 mt-0.5">{item.sourceName}</div>}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{CATEGORY_LABELS[item.category] ?? item.category}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{item.embedType || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] ?? ""}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/news/${item.id}`} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition">
                      Edit →
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
