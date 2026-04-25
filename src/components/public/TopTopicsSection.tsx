import Link from "next/link";

interface TopTopic {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface TopTopicsSectionProps {
  topics: TopTopic[];
}

export function TopTopicsSection({ topics }: TopTopicsSectionProps) {
  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">Browse by Topic</h2>
        <Link href="/topics" className="text-sm text-stone-500 hover:text-stone-900">
          All topics →
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-700 hover:text-stone-900"
          >
            <span>{topic.name}</span>
            <span className="text-xs text-stone-400">{topic.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
