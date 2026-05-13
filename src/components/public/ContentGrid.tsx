"use client";

import { ContentCard, CardItem } from "./ContentCard";
import { Reveal } from "./Reveal";

interface ContentGridProps {
  items: CardItem[];
}

export function ContentGrid({ items }: ContentGridProps) {
  if (!items.length) return null;

  const rows: CardItem[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="content-grid-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0 40px",
            alignItems: "center",
          }}
        >
          {row.map((item, i) => (
            <Reveal key={item.slug} delay={i * 80}>
              <ContentCard item={item} />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
}
