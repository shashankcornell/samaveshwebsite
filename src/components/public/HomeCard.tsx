"use client";

import Link from "next/link";
import Image from "next/image";
import type { HomeContentItem } from "@/app/(public)/page";

function getAuthor(contributors: HomeContentItem["contributors"]): string | null {
  return contributors.find((c) => c.role === "AUTHOR")?.name ?? null;
}

export function HomeCard({ item }: { item: HomeContentItem }) {
  const author = getAuthor(item.contributors);

  return (
    <Link href={`/blogs/${item.slug}`} style={{ display: "block" }}>
      <article className="card-lift" style={{ cursor: "pointer" }}>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink)",
            margin: "0 0 14px",
          }}
        >
          {item.contentType.name}
        </p>

        <div
          className="card-img-wrap image-cinematic-matte"
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "75%",
            overflow: "hidden",
            background: "var(--tint-sand)",
            marginBottom: 18,
          }}
        >
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              style={{ objectFit: "cover" }}
              className="card-img"
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "var(--tint-sand)" }} />
          )}
        </div>

        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.35,
            color: "var(--ink)",
            margin: "0 0 10px",
          }}
        >
          {item.title}
        </h3>

        {author && (
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 12,
              color: "var(--ink)",
              opacity: 0.5,
              margin: 0,
            }}
          >
            {author}
          </p>
        )}
      </article>
    </Link>
  );
}
