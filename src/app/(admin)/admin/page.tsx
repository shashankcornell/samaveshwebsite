import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();

  const [published, drafts, archived, profiles, contentTypes, gazettes, sectors, cmsPages] = await Promise.all([
    prisma.content.count({ where: { status: "PUBLISHED" } }),
    prisma.content.count({ where: { status: "DRAFT" } }),
    prisma.content.count({ where: { status: "ARCHIVED" } }),
    prisma.profile.count(),
    prisma.contentType.findMany({ include: { _count: { select: { content: true } } } }),
    prisma.gazette.count(),
    prisma.topicTag.count(),
    prisma.cmsPage.count(),
  ]);

  const stats = [
    { label: "Published", value: published, href: "/admin/content?status=PUBLISHED", color: "text-emerald-700" },
    { label: "Drafts", value: drafts, href: "/admin/content?status=DRAFT", color: "text-amber-700" },
    { label: "Archived", value: archived, href: "/admin/content?status=ARCHIVED", color: "text-stone-500" },
    { label: "Members", value: profiles, href: "/admin/community", color: "text-stone-900" },
    { label: "Gazettes", value: gazettes, href: "/admin/gazettes", color: "text-stone-900" },
    { label: "Sectors", value: sectors, href: "/admin/sectors", color: "text-stone-900" },
    { label: "CMS Pages", value: cmsPages, href: "/admin/pages", color: "text-stone-900" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-1">Welcome back, {session?.user?.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-stone-200 bg-stone-50 p-5 hover:border-stone-400 transition"
          >
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-sm text-stone-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-400">By Content Type</h2>
        <div className="flex flex-wrap gap-3">
          {contentTypes.map((t) => (
            <Link
              key={t.id}
              href={`/admin/content?type=${t.slug}`}
              className="rounded-md border border-stone-200 px-4 py-2 text-sm hover:bg-stone-50"
            >
              <span className="font-medium text-stone-900">{t._count.content}</span>
              <span className="ml-2 text-stone-500">{t.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-400">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/content/new" className="rounded-md bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 transition">
            + New Content
          </Link>
          <Link href="/admin/gazettes/new" className="rounded-md border border-stone-200 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
            + New Gazette
          </Link>
          <Link href="/admin/community/new" className="rounded-md border border-stone-200 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
            + Add Member
          </Link>
          <Link href="/admin/sectors/new" className="rounded-md border border-stone-200 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
            + New Sector
          </Link>
          <Link href="/admin/pages/new" className="rounded-md border border-stone-200 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
            + New Page
          </Link>
        </div>
      </div>
    </div>
  );
}
