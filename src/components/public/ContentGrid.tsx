import { BlogCard } from "./BlogCard";

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: Date | string | null;
  readingTime?: number | null;
  contentType: { name: string; slug: string };
  topics: { topicTag: { name: string; slug: string } }[];
}

interface ContentGridProps {
  items: ContentItem[];
  columns?: 2 | 3 | 4;
}

const GRID_CLASSES = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function ContentGrid({ items, columns = 3 }: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-stone-400">No content found.</div>
    );
  }

  return (
    <div className={`grid gap-6 ${GRID_CLASSES[columns]}`}>
      {items.map((item) => (
        <BlogCard
          key={item.id}
          slug={item.slug}
          title={item.title}
          excerpt={item.excerpt}
          thumbnail={item.thumbnail}
          publishedAt={item.publishedAt}
          readingTime={item.readingTime}
          contentType={item.contentType}
          topics={item.topics.map((t) => t.topicTag)}
        />
      ))}
    </div>
  );
}
