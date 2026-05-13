import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

interface Props { params: { id: string; sectionId: string } }

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, visible, data } = await req.json();
  const section = await prisma.pageSection.update({
    where: { id: params.sectionId },
    data: {
      ...(type !== undefined ? { type } : {}),
      ...(visible !== undefined ? { visible } : {}),
      ...(data !== undefined ? { data: data as Prisma.InputJsonValue } : {}),
    },
  });
  return NextResponse.json(section);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.pageSection.delete({ where: { id: params.sectionId } });
  return NextResponse.json({ ok: true });
}
