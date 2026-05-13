"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    label: "Editorial",
    items: [
      { label: "Content", href: "/admin/content" },
      { label: "Gazettes", href: "/admin/gazettes" },
      { label: "Landing Page", href: "/admin/landing" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Members", href: "/admin/community" },
    ],
  },
  {
    label: "Newsroom",
    items: [
      { label: "News & Announcements", href: "/admin/news" },
    ],
  },
  {
    label: "Site Pages",
    items: [
      { label: "Think page", href: "/admin/site-pages/think" },
      { label: "Meet page", href: "/admin/site-pages/meet" },
      { label: "Act page", href: "/admin/site-pages/act" },
      { label: "Footer", href: "/admin/site-pages/footer" },
    ],
  },
  {
    label: "Static Pages",
    items: [
      { label: "Privacy Policy", href: "/admin/site-pages/privacy" },
      { label: "Code of Conduct", href: "/admin/site-pages/conduct" },
      { label: "Editorial Policy", href: "/admin/site-pages/editorial-policy" },
      { label: "Press", href: "/admin/site-pages/press" },
      { label: "Careers", href: "/admin/site-pages/careers" },
    ],
  },
  {
    label: "Structure",
    items: [
      { label: "Content Types", href: "/admin/content-types" },
      { label: "Sectors", href: "/admin/sectors" },
      { label: "Pages", href: "/admin/pages" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-sm font-bold text-stone-900 group-hover:text-stone-600 transition">Samavesh</span>
        </Link>
        <p className="text-[11px] text-stone-400 mt-0.5 font-medium uppercase tracking-wide">CMS Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(href)
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-stone-200 p-3 space-y-1">
        <Link
          href="/admin/content/new"
          className="block w-full rounded-md bg-stone-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-stone-700 transition"
        >
          + New Content
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
