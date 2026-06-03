"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ContentTable } from "@/components/admin/ContentTable";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
  updatedAt: string;
  contentType: { name: string };
  topics: { topicTag: { name: string } }[];
  contributors: { profile: { name: string }; role: string }[];
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchItems = useCallback(async (q: string, status: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50", sort: "updatedAt" });
    if (q) params.set("search", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/content?${params}`);
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setTotal(json.data?.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems("", ""); }, [fetchItems]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchItems(value, statusFilter), 300);
  }

  function handleStatus(value: string) {
    setStatusFilter(value);
    fetchItems(search, value);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    fetchItems(search, statusFilter);
  }

  async function handlePublish(id: string, action: "publish" | "unpublish") {
    await fetch(`/api/content/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchItems(search, statusFilter);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Content</h1>
        <Link
          href="/admin/content/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + New Content
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search by title…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 w-72"
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => handleStatus(f.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium border transition ${
                statusFilter === f.value
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!loading && (
          <span className="text-xs text-stone-400 ml-auto">
            {items.length} of {total} item{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-sm">
          No content found{search ? ` for "${search}"` : ""}.
        </div>
      ) : (
        <ContentTable items={items} onDelete={handleDelete} onPublish={handlePublish} />
      )}
    </div>
  );
}
