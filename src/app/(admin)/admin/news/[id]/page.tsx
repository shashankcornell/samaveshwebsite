import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NewsItemForm } from "@/components/admin/NewsItemForm";
import type { NewsItemData, EmbedType, NewsCategory } from "@/components/admin/NewsItemForm";
import Link from "next/link";

export default async function EditNewsItemPage({ params }: { params: { id: string } }) {
  const item = await prisma.newsItem.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  const initial: NewsItemData = {
    id:          item.id,
    title:       item.title,
    category:    item.category as NewsCategory,
    description: item.description ?? "",
    image:       item.image ?? "",
    externalUrl: item.externalUrl ?? "",
    sourceName:  item.sourceName ?? "",
    embedType:   (item.embedType ?? "") as EmbedType,
    embedUrl:    item.embedUrl ?? "",
    embedCode:   item.embedCode ?? "",
    featured:    item.featured,
    status:      item.status as "DRAFT" | "PUBLISHED",
    publishedAt: item.publishedAt ? item.publishedAt.toISOString().slice(0, 16) : "",
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/news" className="text-xs text-stone-400 hover:text-stone-600 transition">← Newsroom</Link>
        <h1 className="text-2xl font-bold text-stone-900 mt-1 max-w-xl truncate">{item.title}</h1>
        <p className="text-sm text-stone-400 mt-0.5 font-mono">/news/{item.slug}</p>
      </div>
      <NewsItemForm initial={initial} isNew={false} />
    </div>
  );
}
