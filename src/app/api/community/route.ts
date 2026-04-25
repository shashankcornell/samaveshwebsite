import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileCreateSchema } from "@/lib/validations/profile.schema";
import { generateSlug } from "@/lib/slug";
import { apiError, apiSuccess } from "@/lib/utils";

const PROFILE_INCLUDE = {
  contributions: {
    include: {
      content: { include: { contentType: true } },
    },
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const profiles = await prisma.profile.findMany({
    where: role ? { role: role as never } : undefined,
    orderBy: { name: "asc" },
    include: { contributions: false },
  });

  return apiSuccess(profiles);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = ProfileCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 422);

  const { slug, ...data } = parsed.data;
  const finalSlug = slug ?? generateSlug(data.name);

  try {
    const profile = await prisma.profile.create({
      data: { ...data, slug: finalSlug },
      include: PROFILE_INCLUDE,
    });
    return apiSuccess(profile, 201);
  } catch {
    return apiError("Slug already exists", 409);
  }
}
