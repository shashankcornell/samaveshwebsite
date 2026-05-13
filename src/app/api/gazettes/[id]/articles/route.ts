import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Props { params: { id: string } }

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentId, order } = await req.json();
  if (!contentId) return NextResponse.json({ error: "contentId required" }, { status: 400 });

  const existing = await prisma.gazetteArticle.findUnique({
    where: { gazetteId_contentId: { gazetteId: params.id, contentId } },
  });
  if (existing) return NextResponse.json({ error: "Already in gazette" }, { status: 409 });

  const maxOrder = await prisma.gazetteArticle.aggregate({
    where: { gazetteId: params.id },
    _max: { order: true },
  });
  const article = await prisma.gazetteArticle.create({
    data: { gazetteId: params.id, contentId, order: order ?? (maxOrder._max.order ?? -1) + 1 },
    include: { content: { include: { contentType: true } } },
  });
  return NextResponse.json(article, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articles } = await req.json() as { articles: { contentId: string; order: number }[] };
  await Promise.all(
    articles.map((a) =>
      prisma.gazetteArticle.update({
        where: { gazetteId_contentId: { gazetteId: params.id, contentId: a.contentId } },
        data: { order: a.order },
      })
    )
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentId } = await req.json();
  await prisma.gazetteArticle.delete({
    where: { gazetteId_contentId: { gazetteId: params.id, contentId } },
  });
  return NextResponse.json({ ok: true });
}
