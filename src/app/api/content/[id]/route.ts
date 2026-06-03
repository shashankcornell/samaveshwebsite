import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ContentUpdateSchema } from "@/lib/validations/content.schema";
import { estimateReadingTime } from "@/lib/reading-time";
import { apiError, apiSuccess } from "@/lib/utils";

const CONTENT_INCLUDE = {
  contentType: true,
  topics: { include: { topicTag: true } },
  contributors: { include: { profile: true } },
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const content = await prisma.content.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: CONTENT_INCLUDE,
  });
  if (!content) return apiError("Not found", 404);
  return apiSuccess(content);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = ContentUpdateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 422);

  const { topicTagIds, contributors, status, ...data } = parsed.data;

  const existing = await prisma.content.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  const readingTime = data.body ? estimateReadingTime(data.body) : existing.readingTime;
  let publishedAt = existing.publishedAt;
  if (status === "PUBLISHED" && !existing.publishedAt) publishedAt = new Date();
  if (status === "DRAFT" || status === "ARCHIVED") publishedAt = null;

  const content = await prisma.content.update({
    where: { id: params.id },
    data: {
      ...data,
      status,
      readingTime,
      publishedAt,
      ...(topicTagIds !== undefined && {
        topics: {
          deleteMany: {},
          create: topicTagIds.map((id) => ({ topicTagId: id })),
        },
      }),
      ...(contributors !== undefined && {
        contributors: {
          deleteMany: {},
          create: contributors.map((c) => ({ profileId: c.profileId, role: c.role })),
        },
      }),
    },
    include: CONTENT_INCLUDE,
  });

  return apiSuccess(content);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const existing = await prisma.content.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  await prisma.content.delete({ where: { id: params.id } });

  const { cleanupImages } = await import("@/lib/deleteImage");
  const cleanup = await cleanupImages([existing.thumbnail]);
  return apiSuccess({ deleted: true, ...cleanup });
}
