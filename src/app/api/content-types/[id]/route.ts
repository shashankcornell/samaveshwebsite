import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  thumbnailRatio: z.enum(["1:1", "3:4", "4:3", "16:9", "custom"]).optional(),
  thumbnailRatioW: z.number().int().positive().optional(),
  thumbnailRatioH: z.number().int().positive().optional(),
  visible: z.boolean().optional(),
});

interface Props { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Props) {
  const ct = await prisma.contentType.findUnique({
    where: { id: params.id },
    include: { _count: { select: { content: true } } },
  });
  if (!ct) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ct);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ct = await prisma.contentType.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(ct);
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { replacementId } = await req.json().catch(() => ({})) as { replacementId?: string };

  const count = await prisma.content.count({ where: { contentTypeId: params.id } });
  if (count > 0 && !replacementId) {
    return NextResponse.json({ error: "Content exists", count }, { status: 409 });
  }
  if (count > 0 && replacementId) {
    await prisma.content.updateMany({ where: { contentTypeId: params.id }, data: { contentTypeId: replacementId } });
  }
  await prisma.contentType.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
