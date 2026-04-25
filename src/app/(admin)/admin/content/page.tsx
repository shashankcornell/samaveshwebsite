"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/content?limit=50");
    const json = await res.json();
    setItems(json.data?.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleDelete(id: string) {
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    await fetchItems();
  }

  async function handlePublish(id: string, action: "publish" | "unpublish") {
    await fetch(`/api/content/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await fetchItems();
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

      {loading ? (
        <div className="py-20 text-center text-stone-400">Loading…</div>
      ) : (
        <ContentTable items={items} onDelete={handleDelete} onPublish={handlePublish} />
      )}
    </div>
  );
}
