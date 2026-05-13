import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { NewsCategory } from "@prisma/client";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.newsItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.newsItem.update({
    where: { id: params.id },
    data: {
      title:       body.title,
      category:    body.category as NewsCategory,
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
  return NextResponse.json(item);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.newsItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
