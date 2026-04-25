import { PrismaClient, UserRole, ProfileRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

const contentTypes = [
  { name: "Article", slug: "article" },
  { name: "Discourse", slug: "discourse" },
  { name: "Podcast", slug: "podcast" },
  { name: "Paper", slug: "paper" },
  { name: "Op-ed", slug: "op-ed" },
  { name: "News", slug: "news" },
  { name: "Gazette", slug: "gazette" },
];

const topicTags = [
  { name: "Health", slug: "health" },
  { name: "Education", slug: "education" },
  { name: "Urbanization", slug: "urbanization" },
  { name: "Climate and Environment", slug: "climate-and-environment" },
  { name: "Food and Agriculture", slug: "food-and-agriculture" },
  { name: "Economics and Finance", slug: "economics-and-finance" },
  { name: "Governance", slug: "governance" },
  { name: "Technology", slug: "technology" },
  { name: "National Security", slug: "national-security" },
  { name: "International Relations", slug: "international-relations" },
  { name: "Gender", slug: "gender" },
];

async function main() {
  console.log("Seeding content types...");
  for (const ct of contentTypes) {
    await prisma.contentType.upsert({
      where: { slug: ct.slug },
      update: {},
      create: ct,
    });
  }

  console.log("Seeding topic tags...");
  for (const tag of topicTags) {
    await prisma.topicTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@samavesh.in";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.log(`Creating super admin: ${email}`);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        profile: {
          create: {
            name: "Super Admin",
            slug: "super-admin",
            role: ProfileRole.ADMIN,
            title: "Administrator",
          },
        },
      },
    });
  } else {
    console.log(`Admin user ${email} already exists, skipping.`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
