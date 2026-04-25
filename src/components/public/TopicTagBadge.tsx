import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopicTagBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

export function TopicTagBadge({ name, slug, className }: TopicTagBadgeProps) {
  return (
    <Link
      href={`/topics/${slug}`}
      className={cn(
        "inline-block rounded-full border border-stone-300 px-3 py-0.5 text-xs font-medium text-stone-600 transition hover:border-stone-600 hover:text-stone-900",
        className
      )}
    >
      {name}
    </Link>
  );
}
