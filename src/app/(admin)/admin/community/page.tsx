"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Profile {
  id: string;
  name: string;
  slug: string;
  role: string;
  title?: string | null;
  image?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin", TEAM_MEMBER: "Team Member", ADVISORY_BOARD: "Advisory Board",
  FELLOW: "Fellow", PRESENTER: "Presenter", DISCUSSANT: "Discussant",
};

export default function AdminCommunityPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/community");
    const json = await res.json();
    setProfiles(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this profile?")) return;
    await fetch(`/api/community/${id}`, { method: "DELETE" });
    await fetchProfiles();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Community</h1>
        <Link
          href="/admin/community/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Add Member
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Member</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">Title</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-stone-100">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-medium text-stone-500">
                            {p.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-stone-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{ROLE_LABELS[p.role] ?? p.role}</td>
                  <td className="px-4 py-3 text-stone-500">{p.title ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/community/${p.id}/edit`}
                        className="rounded px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/community/${p.slug}`}
                        target="_blank"
                        className="rounded px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!profiles.length && (
            <p className="py-10 text-center text-stone-400">No profiles yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
