import Link from "next/link";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  article: "bg-blue-50 text-blue-700",
  discourse: "bg-violet-50 text-violet-700",
  podcast: "bg-orange-50 text-orange-700",
  paper: "bg-stone-100 text-stone-700",
  "op-ed": "bg-rose-50 text-rose-700",
  news: "bg-green-50 text-green-700",
  gazette: "bg-amber-50 text-amber-700",
};

interface ContentTypeBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

export function ContentTypeBadge({ name, slug, className }: ContentTypeBadgeProps) {
  return (
    <Link
      href={`/types/${slug}`}
      className={cn(
        "inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        TYPE_COLORS[slug] ?? "bg-stone-100 text-stone-700",
        className
      )}
    >
      {name}
    </Link>
  );
}
