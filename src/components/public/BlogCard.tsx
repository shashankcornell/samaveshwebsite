import Link from "next/link";
import Image from "next/image";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { TopicTagBadge } from "./TopicTagBadge";
import { formatDate } from "@/lib/utils";

interface Tag { name: string; slug: string }
interface ContentType { name: string; slug: string }
interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: Date | string | null;
  readingTime?: number | null;
  contentType: ContentType;
  topics: Tag[];
}

const ASPECT_CLASSES: Record<string, string> = {
  article: "aspect-video",
  discourse: "aspect-square",
  podcast: "aspect-[3/4]",
  paper: "aspect-[4/5]",
  "op-ed": "aspect-[4/3]",
  news: "aspect-[3/1]",
  gazette: "aspect-video",
};

export function BlogCard({
  slug,
  title,
  excerpt,
  thumbnail,
  publishedAt,
  readingTime,
  contentType,
  topics,
}: BlogCardProps) {
  const aspectClass = ASPECT_CLASSES[contentType.slug] ?? "aspect-video";
  const isHorizontal = contentType.slug === "news";

  return (
    <article
      className={`group flex ${isHorizontal ? "flex-row gap-4" : "flex-col"} overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:shadow-md`}
    >
      <Link href={`/blogs/${slug}`} className={`${isHorizontal ? "w-40 shrink-0" : "w-full"} overflow-hidden`}>
        <div className={`relative ${aspectClass} w-full overflow-hidden bg-stone-100`}>
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-100">
              <span className="text-3xl text-stone-300">S</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <ContentTypeBadge name={contentType.name} slug={contentType.slug} />
        </div>

        <Link href={`/blogs/${slug}`}>
          <h2 className="text-base font-semibold leading-snug text-stone-900 transition group-hover:text-stone-600 line-clamp-3">
            {title}
          </h2>
        </Link>

        {excerpt && !isHorizontal && (
          <p className="text-sm text-stone-500 line-clamp-2">{excerpt}</p>
        )}

        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {topics.slice(0, 2).map((t) => (
            <TopicTagBadge key={t.slug} name={t.name} slug={t.slug} />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-400">
          {publishedAt && <span>{formatDate(publishedAt)}</span>}
          {readingTime && <span>· {readingTime} min read</span>}
        </div>
      </div>
    </article>
  );
}
