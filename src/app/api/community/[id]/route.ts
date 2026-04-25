import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileUpdateSchema } from "@/lib/validations/profile.schema";
import { apiError, apiSuccess } from "@/lib/utils";

const PROFILE_INCLUDE = {
  contributions: {
    include: {
      content: {
        include: { contentType: true, topics: { include: { topicTag: true } } },
      },
    },
  },
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const profile = await prisma.profile.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: PROFILE_INCLUDE,
  });
  if (!profile) return apiError("Not found", 404);
  return apiSuccess(profile);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 422);

  const existing = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  const profile = await prisma.profile.update({
    where: { id: params.id },
    data: parsed.data,
    include: PROFILE_INCLUDE,
  });

  return apiSuccess(profile);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const existing = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  await prisma.profile.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
}
