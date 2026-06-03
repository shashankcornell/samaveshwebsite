import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  longIntro: z.string().optional().nullable(),
  bgColor: z.string().max(20).optional().nullable(),
  visible: z.boolean().optional(),
  featured: z.boolean().optional(),
  sectorImage: z.string().optional().nullable(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  image: z.string().optional().nullable(),
});

interface Props { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Props) {
  const sector = await prisma.topicTag.findUnique({
    where: { id: params.id },
    include: { _count: { select: { contents: true } } },
  });
  if (!sector) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sector);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sector = await prisma.topicTag.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(sector);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sector = await prisma.topicTag.findUnique({ where: { id: params.id } });
  if (!sector) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.contentTopicTag.count({ where: { topicTagId: params.id } });
  if (count > 0) {
    await prisma.topicTag.update({ where: { id: params.id }, data: { visible: false } });
    return NextResponse.json({ ok: true, archived: true });
  }

  await prisma.topicTag.delete({ where: { id: params.id } });

  const { cleanupImages } = await import("@/lib/deleteImage");
  const cleanup = await cleanupImages([sector.image, sector.sectorImage]);
  return NextResponse.json({ ok: true, ...cleanup });
}
