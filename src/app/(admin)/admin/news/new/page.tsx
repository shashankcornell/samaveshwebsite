import { NewsItemForm } from "@/components/admin/NewsItemForm";
import type { NewsItemData } from "@/components/admin/NewsItemForm";
import Link from "next/link";

export default function NewNewsItemPage() {
  const initial: NewsItemData = {
    title: "", category: "ANNOUNCEMENT", description: "",
    image: "", externalUrl: "", sourceName: "",
    embedType: "", embedUrl: "", embedCode: "",
    featured: false, status: "DRAFT",
    publishedAt: new Date().toISOString().slice(0, 16),
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/news" className="text-xs text-stone-400 hover:text-stone-600 transition">← Newsroom</Link>
        <h1 className="text-2xl font-bold text-stone-900 mt-1">New item</h1>
      </div>
      <NewsItemForm initial={initial} isNew />
    </div>
  );
}
