import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ content: [], profiles: [], topics: [] });

  const [content, profiles, topics] = await Promise.all([
    prisma.content.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        contentType: { select: { name: true } },
        topics: { select: { topicTag: { select: { name: true } } }, take: 1 },
      },
    }),
    prisma.profile.findMany({
      where: {
        visible: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { slug: true, name: true, title: true, role: true },
    }),
    prisma.topicTag.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { slug: true, name: true },
    }),
  ]);

  const serialized = {
    content: content.map((c) => ({
      slug: c.slug,
      title: c.title,
      excerpt: c.excerpt,
      type: c.contentType.name,
      topic: c.topics[0]?.topicTag.name ?? null,
    })),
    profiles: profiles.map((p) => ({
      slug: p.slug,
      name: p.name,
      title: p.title,
      role: p.role,
    })),
    topics: topics.map((t) => ({ slug: t.slug, name: t.name })),
  };

  return NextResponse.json(serialized);
}
