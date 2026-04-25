import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const { action } = (await req.json()) as { action?: string };

  const existing = await prisma.content.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  const status = action === "unpublish" ? "DRAFT" : "PUBLISHED";
  const publishedAt = status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null;

  const content = await prisma.content.update({
    where: { id: params.id },
    data: { status, publishedAt },
  });

  return apiSuccess(content);
}
