import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { apiSuccess } from "@/lib/utils";

export async function GET() {
  const types = await prisma.contentType.findMany({ orderBy: { name: "asc" } });
  return apiSuccess(types);
}
