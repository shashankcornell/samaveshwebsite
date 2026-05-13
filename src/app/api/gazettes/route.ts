import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).optional(),
  volumeNumber: z.number().int().positive().optional().nullable(),
  editionName: z.string().max(200).optional().nullable(),
  isCurrent: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  place: z.string().max(200).optional().nullable(),
  subheading: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  coverImageAlt: z.string().optional().nullable(),
  editorNote: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  disclaimer: z.string().optional().nullable(),
  credits: z.string().optional().nullable(),
  acknowledgements: z.string().optional().nullable(),
});

export async function GET() {
  const gazettes = await prisma.gazette.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { articles: true, editorialBoard: true } },
    },
  });
  return NextResponse.json(gazettes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // If isCurrent, unset all others
  if (data.isCurrent) await prisma.gazette.updateMany({ data: { isCurrent: false } });

  const gazette = await prisma.gazette.create({
    data: { ...data, slug, publishedAt: data.publishedAt ? new Date(data.publishedAt) : null },
  });
  return NextResponse.json(gazette, { status: 201 });
}
