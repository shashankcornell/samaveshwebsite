import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Props { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  const role = await prisma.gazetteEditorialBoardRole.update({ where: { id: params.id }, data: { name } });
  return NextResponse.json(role);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.gazetteEditorialBoardRole.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
