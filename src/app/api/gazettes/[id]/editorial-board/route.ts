import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Props { params: { id: string } }

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId, roleId } = await req.json();
  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });

  const maxOrder = await prisma.gazetteEditorialMember.aggregate({
    where: { gazetteId: params.id },
    _max: { order: true },
  });
  const member = await prisma.gazetteEditorialMember.create({
    data: { gazetteId: params.id, profileId, roleId: roleId || null, order: (maxOrder._max.order ?? -1) + 1 },
    include: { profile: true, role: true },
  });
  return NextResponse.json(member, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { members } = await req.json() as { members: { id: string; order: number; roleId?: string }[] };
  await Promise.all(
    members.map((m) =>
      prisma.gazetteEditorialMember.update({
        where: { id: m.id },
        data: { order: m.order, ...(m.roleId !== undefined ? { roleId: m.roleId || null } : {}) },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
