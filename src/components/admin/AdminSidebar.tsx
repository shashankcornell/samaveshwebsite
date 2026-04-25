"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Content", href: "/admin/content" },
  { label: "New Content", href: "/admin/content/new" },
  { label: "Community", href: "/admin/community" },
  { label: "Add Member", href: "/admin/community/new" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-stone-200 bg-stone-50">
      <div className="border-b border-stone-200 px-5 py-4">
        <Link href="/" className="text-sm font-bold text-stone-900">
          Samavesh
        </Link>
        <p className="text-xs text-stone-400">Admin Portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition",
                  pathname === href
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-stone-200 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-stone-500 hover:bg-stone-200 hover:text-stone-900"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
