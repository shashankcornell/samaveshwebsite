import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ContentCreateSchema } from "@/lib/validations/content.schema";
import { generateSlug } from "@/lib/slug";
import { estimateReadingTime } from "@/lib/reading-time";
import { apiError, apiSuccess } from "@/lib/utils";

const CONTENT_INCLUDE = {
  contentType: true,
  topics: { include: { topicTag: true } },
  contributors: { include: { profile: true } },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const topicSlug = searchParams.get("topic");
  const typeSlug = searchParams.get("type");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const sort = searchParams.get("sort") === "updatedAt" ? "updatedAt" : "publishedAt";
  const search = searchParams.get("search")?.trim() ?? "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (topicSlug) where.topics = { some: { topicTag: { slug: topicSlug } } };
  if (typeSlug) where.contentType = { slug: typeSlug };
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [total, items] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      include: CONTENT_INCLUDE,
      orderBy: { [sort]: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return apiSuccess({ items, total, page, limit });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = ContentCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 422);

  const { topicTagIds, contributors, slug, status, ...data } = parsed.data;
  const finalSlug = slug ?? generateSlug(data.title);
  const readingTime = estimateReadingTime(data.body);
  const publishedAt = status === "PUBLISHED" ? new Date() : null;

  try {
    const content = await prisma.content.create({
      data: {
        ...data,
        slug: finalSlug,
        status,
        readingTime,
        publishedAt,
        topics: {
          create: topicTagIds.map((id) => ({ topicTagId: id })),
        },
        contributors: {
          create: contributors.map((c) => ({ profileId: c.profileId, role: c.role })),
        },
      },
      include: CONTENT_INCLUDE,
    });
    return apiSuccess(content, 201);
  } catch {
    return apiError("Slug already exists", 409);
  }
}
