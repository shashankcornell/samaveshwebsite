import Link from "next/link";
import Image from "next/image";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { formatDate } from "@/lib/utils";

interface FeaturedContentProps {
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: Date | string | null;
  contentType: { name: string; slug: string };
  topics: { name: string; slug: string }[];
}

export function FeaturedContent({
  slug,
  title,
  excerpt,
  thumbnail,
  publishedAt,
  contentType,
  topics,
}: FeaturedContentProps) {
  return (
    <Link href={`/blogs/${slug}`} className="group block">
      <article className="relative overflow-hidden rounded-xl bg-stone-900">
        <div className="relative aspect-[16/7] w-full image-cinematic-matte">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              priority
              className="object-cover opacity-60 transition group-hover:opacity-50"
              sizes="100vw"
            />
          ) : (
            <div className="h-full w-full bg-stone-800" />
          )}
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            <ContentTypeBadge name={contentType.name} slug={contentType.slug} />
            {topics.slice(0, 2).map((t) => (
              <span
                key={t.slug}
                className="inline-block rounded-full border border-white/30 px-3 py-0.5 text-xs text-white/80"
              >
                {t.name}
              </span>
            ))}
          </div>
          <h1 className="text-xl font-bold leading-snug text-white md:text-3xl line-clamp-3">
            {title}
          </h1>
          {excerpt && (
            <p className="mt-2 text-sm text-white/70 line-clamp-2 md:text-base">{excerpt}</p>
          )}
          {publishedAt && (
            <p className="mt-3 text-xs text-white/50">{formatDate(publishedAt)}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
