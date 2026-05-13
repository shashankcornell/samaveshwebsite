import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Props { params: { id: string; memberId: string } }

export async function PUT(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { roleId } = await req.json();
  const member = await prisma.gazetteEditorialMember.update({
    where: { id: params.memberId },
    data: { roleId: roleId || null },
    include: { profile: true, role: true },
  });
  return NextResponse.json(member);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.gazetteEditorialMember.delete({ where: { id: params.memberId } });
  return NextResponse.json({ ok: true });
}
