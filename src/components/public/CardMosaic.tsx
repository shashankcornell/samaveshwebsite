"use client";

import { ContentCard, CardItem } from "./ContentCard";
import { Reveal } from "./Reveal";

interface CardMosaicProps {
  items: CardItem[];
}

export function CardMosaic({ items }: CardMosaicProps) {
  if (!items.length) return null;

  /* Bucket by content type for the staggered layout */
  const articles: CardItem[] = [];
  const discourses: CardItem[] = [];
  const podcasts: CardItem[] = [];
  const misc: CardItem[] = [];

  items.forEach((item) => {
    const s = item.contentType.slug;
    if (s === "discourse") discourses.push(item);
    else if (s === "podcast") podcasts.push(item);
    else if (s === "article" || s === "op-ed" || s === "paper" || s === "news") articles.push(item);
    else misc.push(item);
  });

  /* Build three columns */
  const col0 = [...articles, ...misc.filter((_, i) => i % 2 === 0)];
  const col1 = [...discourses, ...misc.filter((_, i) => i % 2 !== 0)];
  const col2 = podcasts;

  /* If any column is empty, do simple round-robin */
  if (col0.length === 0 && col1.length === 0) {
    const c0: CardItem[] = [], c1: CardItem[] = [], c2: CardItem[] = [];
    items.forEach((item, i) => {
      if (i % 3 === 0) c0.push(item);
      else if (i % 3 === 1) c1.push(item);
      else c2.push(item);
    });
    return <MosaicGrid col0={c0} col1={c1} col2={c2} />;
  }

  return <MosaicGrid col0={col0} col1={col1} col2={col2} />;
}

function MosaicGrid({ col0, col1, col2 }: { col0: CardItem[]; col1: CardItem[]; col2: CardItem[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0 40px",
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
        {col0.map((item, i) => (
          <Reveal key={item.slug} delay={i * 60}>
            <ContentCard item={item} variant="tall" />
          </Reveal>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
        {col1.map((item, i) => (
          <Reveal key={item.slug} delay={i * 60 + 80}>
            <ContentCard item={item} variant="square" />
          </Reveal>
        ))}
      </div>

      {/* Podcasts offset 100px down */}
      <div style={{ display: "flex", flexDirection: "column", gap: 56, marginTop: 100 }}>
        {col2.map((item, i) => (
          <Reveal key={item.slug} delay={i * 60 + 160}>
            <ContentCard item={item} variant="podcast" />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
