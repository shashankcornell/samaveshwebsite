"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";

interface ContentRow {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date | string | null;
  updatedAt: Date | string;
  contentType: { name: string };
  topics: { topicTag: { name: string } }[];
  contributors: { profile: { name: string }; role: string }[];
}

interface ContentTableProps {
  items: ContentRow[];
  onDelete: (id: string) => Promise<void>;
  onPublish: (id: string, action: "publish" | "unpublish") => Promise<void>;
}

export function ContentTable({ items, onDelete, onPublish }: ContentTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Title</th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Type</th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Topics</th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Author</th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Updated</th>
            <th className="px-4 py-3 text-left font-medium text-stone-600">Published</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white">
          {items.map((item) => {
            const author = item.contributors.find((c) => c.role === "AUTHOR");
            return (
              <tr key={item.id} className="hover:bg-stone-50">
                <td className="max-w-xs px-4 py-3">
                  <span className="block truncate font-medium text-stone-900">{item.title}</span>
                  <span className="text-xs text-stone-400">/blogs/{item.slug}</span>
                </td>
                <td className="px-4 py-3 text-stone-600">{item.contentType.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.topics.slice(0, 2).map((t) => (
                      <span key={t.topicTag.name} className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600">
                        {t.topicTag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-600">{author?.profile.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-stone-500">{formatDate(item.updatedAt)}</td>
                <td className="px-4 py-3 text-stone-500">{item.publishedAt ? formatDate(item.publishedAt) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/content/${item.id}/edit`}
                      className="rounded px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/blogs/${item.slug}`}
                      target="_blank"
                      className="rounded px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => onPublish(item.id, item.status === "PUBLISHED" ? "unpublish" : "publish")}
                      className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                    >
                      {item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === item.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
