import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const roles = await prisma.gazetteEditorialBoardRole.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const max = await prisma.gazetteEditorialBoardRole.aggregate({ _max: { order: true } });
  const role = await prisma.gazetteEditorialBoardRole.create({
    data: { name, order: (max._max.order ?? -1) + 1 },
  });
  return NextResponse.json(role, { status: 201 });
}
