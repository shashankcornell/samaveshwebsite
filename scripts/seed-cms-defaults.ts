import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // Seed gazette editorial board roles
  const roles = ["Editor-in-Chief","Managing Editor","Associate Editor","Contributing Editor","Editorial Advisor","Production Lead"];
  for (let i = 0; i < roles.length; i++) {
    await prisma.gazetteEditorialBoardRole.upsert({
      where: { name: roles[i] },
      update: { order: i },
      create: { name: roles[i], order: i },
    });
  }

  // Seed default content types if missing (ensure thumbnailRatio defaults applied)
  const contentTypes = [
    { name: "Article", slug: "article", thumbnailRatio: "3:4", thumbnailRatioW: 3, thumbnailRatioH: 4 },
    { name: "Op-ed", slug: "op-ed", thumbnailRatio: "3:4", thumbnailRatioW: 3, thumbnailRatioH: 4 },
    { name: "Paper", slug: "paper", thumbnailRatio: "3:4", thumbnailRatioW: 3, thumbnailRatioH: 4 },
    { name: "Discourse", slug: "discourse", thumbnailRatio: "1:1", thumbnailRatioW: 1, thumbnailRatioH: 1 },
    { name: "Podcast", slug: "podcast", thumbnailRatio: "4:3", thumbnailRatioW: 4, thumbnailRatioH: 3 },
    { name: "News", slug: "news", thumbnailRatio: "16:9", thumbnailRatioW: 16, thumbnailRatioH: 9 },
  ];
  for (const ct of contentTypes) {
    await prisma.contentType.upsert({
      where: { slug: ct.slug },
      update: { thumbnailRatio: ct.thumbnailRatio, thumbnailRatioW: ct.thumbnailRatioW, thumbnailRatioH: ct.thumbnailRatioH },
      create: ct,
    });
  }

  // Seed default sectors (TopicTags)
  const sectors = [
    "Health","Education","Urbanisation","Climate & Environment","Food & Agriculture",
    "Economics & Finance","Governance","Technology","National Security","International Relations","Gender"
  ];
  for (const name of sectors) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    await prisma.topicTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug, visible: true },
    });
  }

  console.log("CMS defaults seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
