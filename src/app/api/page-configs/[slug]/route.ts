import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const config = await prisma.pageConfig.findUnique({ where: { slug: params.slug } });
  return NextResponse.json(config ?? { slug: params.slug, data: {} });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.json();
  const config = await prisma.pageConfig.upsert({
    where: { slug: params.slug },
    create: { slug: params.slug, data: body },
    update: { data: body },
  });
  return NextResponse.json(config);
}
