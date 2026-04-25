import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TopicTagCreateSchema } from "@/lib/validations/topic.schema";
import { generateSlug } from "@/lib/slug";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const tags = await prisma.topicTag.findMany({ orderBy: { name: "asc" } });
  return apiSuccess(tags);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = TopicTagCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 422);

  const { name, slug } = parsed.data;
  const finalSlug = slug ?? generateSlug(name);

  try {
    const tag = await prisma.topicTag.create({ data: { name, slug: finalSlug } });
    return apiSuccess(tag, 201);
  } catch {
    return apiError("Slug already exists", 409);
  }
}
