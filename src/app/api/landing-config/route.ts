import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getOrCreateConfig() {
  let config = await prisma.landingPageConfig.findFirst();
  if (!config) {
    config = await prisma.landingPageConfig.create({ data: {} });
  }
  return config;
}

export async function GET() {
  const config = await getOrCreateConfig();
  const slots = await prisma.landingPageSlot.findMany({
    where: { configId: config.id },
    orderBy: { order: "asc" },
    include: {
      content: {
        include: {
          contentType: true,
          topics: { include: { topicTag: true } },
        },
      },
    },
  });
  return NextResponse.json({ ...config, slots });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rowCount, isManual, slots } = await req.json() as {
    rowCount?: number;
    isManual?: boolean;
    slots?: { contentId: string; order: number }[];
  };

  const config = await getOrCreateConfig();

  const updated = await prisma.landingPageConfig.update({
    where: { id: config.id },
    data: {
      ...(rowCount !== undefined ? { rowCount: Math.max(8, rowCount) } : {}),
      ...(isManual !== undefined ? { isManual } : {}),
      ...(slots !== undefined ? {
        slots: {
          deleteMany: {},
          create: slots.map((s) => ({ contentId: s.contentId, order: s.order })),
        },
      } : {}),
    },
  });

  return NextResponse.json(updated);
}
