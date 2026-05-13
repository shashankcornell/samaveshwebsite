import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SLUG = "landing-featured";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.pageConfig.findUnique({ where: { slug: SLUG } });
  return NextResponse.json(config?.data ?? {});
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const config = await prisma.pageConfig.upsert({
    where: { slug: SLUG },
    create: { slug: SLUG, data: body },
    update: { data: body },
  });

  return NextResponse.json(config.data);
}
