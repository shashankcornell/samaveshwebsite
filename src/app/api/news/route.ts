import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { NewsCategory } from "@prisma/client";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 1;
  while (await prisma.newsItem.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const take = parseInt(searchParams.get("take") ?? "50");

  const items = await prisma.newsItem.findMany({
    where: {
      ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
      ...(category ? { category: category as NewsCategory } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const base = slugify(body.title || "news");
  const slug = await uniqueSlug(base);

  const item = await prisma.newsItem.create({
    data: {
      title:       body.title,
      slug,
      category:    body.category ?? "ANNOUNCEMENT",
      description: body.description ?? null,
      image:       body.image ?? null,
      externalUrl: body.externalUrl ?? null,
      sourceName:  body.sourceName ?? null,
      embedType:   body.embedType || null,
      embedUrl:    body.embedUrl ?? null,
      embedCode:   body.embedCode ?? null,
      featured:    body.featured ?? false,
      status:      body.status ?? "DRAFT",
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
