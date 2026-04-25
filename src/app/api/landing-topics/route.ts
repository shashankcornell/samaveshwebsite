import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { apiSuccess } from "@/lib/utils";

export async function GET() {
  const tags = await prisma.topicTag.findMany({
    include: {
      contents: {
        where: { content: { status: "PUBLISHED" } },
      },
    },
  });

  type TagWithCount = (typeof tags)[number] & { count: number };
  const sorted = (tags.map((tag) => ({ ...tag, count: tag.contents.length })) as TagWithCount[])
    .filter((tag) => tag.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map(({ contents: _, ...tag }) => tag); // eslint-disable-line @typescript-eslint/no-unused-vars

  return apiSuccess(sorted);
}
