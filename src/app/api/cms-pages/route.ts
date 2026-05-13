import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).optional(),
  heroHeading: z.string().max(300).optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  bgColor: z.string().max(20).optional().nullable(),
  textColor: z.string().max(20).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
});

export async function GET() {
  const pages = await prisma.cmsPage.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sections: true } } },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const page = await prisma.cmsPage.create({ data: { ...data, slug } });
  return NextResponse.json(page, { status: 201 });
}
