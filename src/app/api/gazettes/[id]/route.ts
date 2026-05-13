import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(300).optional(),
  volumeNumber: z.number().int().positive().optional().nullable(),
  editionName: z.string().max(200).optional().nullable(),
  isCurrent: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  place: z.string().max(200).optional().nullable(),
  subheading: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  coverImageAlt: z.string().optional().nullable(),
  editorNote: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  disclaimer: z.string().optional().nullable(),
  credits: z.string().optional().nullable(),
  acknowledgements: z.string().optional().nullable(),
});

interface Props { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Props) {
  const gazette = await prisma.gazette.findUnique({
    where: { id: params.id },
    include: {
      articles: {
        include: { content: { include: { contentType: true, topics: { include: { topicTag: true } } } } },
        orderBy: { order: "asc" },
      },
      editorialBoard: {
        include: { profile: true, role: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!gazette) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(gazette);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  if (data.isCurrent) await prisma.gazette.updateMany({ where: { id: { not: params.id } }, data: { isCurrent: false } });

  const gazette = await prisma.gazette.update({
    where: { id: params.id },
    data: { ...data, publishedAt: data.publishedAt !== undefined ? (data.publishedAt ? new Date(data.publishedAt) : null) : undefined },
  });
  return NextResponse.json(gazette);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.gazette.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
