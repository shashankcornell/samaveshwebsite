import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  title: z.string().min(1).max(300).optional(),
  heroHeading: z.string().max(300).optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  bgColor: z.string().max(20).optional().nullable(),
  textColor: z.string().max(20).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  publishedAt: z.string().optional().nullable(),
});

interface Props { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Props) {
  const page = await prisma.cmsPage.findUnique({
    where: { id: params.id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const page = await prisma.cmsPage.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      publishedAt: parsed.data.publishedAt !== undefined ? (parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null) : undefined,
    },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(page);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.cmsPage.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
