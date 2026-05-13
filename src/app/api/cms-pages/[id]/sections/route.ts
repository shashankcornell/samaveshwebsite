import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const SECTION_TYPES = ["hero","text","rich-text","button-group","tag-group","tab-group","content-listing","community-listing","cta","image-text","quote"] as const;

const Schema = z.object({
  type: z.enum(SECTION_TYPES),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  data: z.record(z.string(), z.unknown()).default({}),
});

interface Props { params: { id: string } }

export async function GET(_req: NextRequest, { params: { id } }: Props) {
  const sections = await prisma.pageSection.findMany({
    where: { pageId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const section = await prisma.pageSection.create({
    data: { ...parsed.data, pageId: params.id, data: parsed.data.data as Prisma.InputJsonValue },
  });
  return NextResponse.json(section, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sections } = await req.json() as { sections: { id: string; order: number; visible?: boolean; data?: Record<string, unknown> }[] };

  await Promise.all(
    sections.map((s) =>
      prisma.pageSection.update({
        where: { id: s.id },
        data: { order: s.order, ...(s.visible !== undefined ? { visible: s.visible } : {}), ...(s.data !== undefined ? { data: s.data as Prisma.InputJsonValue } : {}) },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
