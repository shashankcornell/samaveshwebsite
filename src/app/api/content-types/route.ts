import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Schema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  thumbnailRatio: z.enum(["1:1", "3:4", "4:3", "16:9", "custom"]).default("3:4"),
  thumbnailRatioW: z.number().int().positive().default(3),
  thumbnailRatioH: z.number().int().positive().default(4),
  visible: z.boolean().default(true),
});

export async function GET() {
  const types = await prisma.contentType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { content: true } } },
  });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ct = await prisma.contentType.create({ data: { ...data, slug } });
  return NextResponse.json(ct, { status: 201 });
}
