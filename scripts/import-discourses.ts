/**
 * Import discourses from CSV.
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/import-discourses.ts discourses.csv
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient, ProfileRole, ContributorRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function parseDate(raw: string): Date {
  const cleaned = raw.trim();
  // DD.MM.YYYY
  const dmy = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`);
  // DD/MM/YYYY
  const dmy2 = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy2) return new Date(`${dmy2[3]}-${dmy2[2].padStart(2,"0")}-${dmy2[1].padStart(2,"0")}`);
  // "30 August 2020" etc
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function getOrCreatePresenter(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  return prisma.profile.upsert({
    where: { slug },
    update: {},
    create: { name: trimmed, slug, role: ProfileRole.PRESENTER },
  });
}

async function getOrCreateTag(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  return prisma.topicTag.upsert({
    where: { slug },
    update: {},
    create: { name: trimmed, slug },
  });
}

async function main() {
  const csvPath = process.argv[2] ?? "discourses.csv";
  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const records: Record<string, string>[] = parse(fs.readFileSync(fullPath, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`Found ${records.length} rows.\n`);

  // Find the discourse content type
  const discourseType = await prisma.contentType.upsert({
    where: { slug: "discourse" },
    update: {},
    create: { name: "Discourse", slug: "discourse" },
  });

  let created = 0, skipped = 0;

  for (const row of records) {
    const topic = (row["Topic"] ?? "").trim().replace(/\n/g, " ");
    const presenter = (row["Presenter"] ?? "").trim();
    const dateRaw = (row["Date"] ?? "").trim();
    const tagsRaw = (row["Tags"] ?? "").trim();
    const summary = (row["Summary"] ?? "").trim().replace(/\n/g, " ");

    if (!topic) { skipped++; continue; }

    const slug = slugify(topic);

    // Skip duplicates
    const existing = await prisma.content.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  SKIP (exists): ${topic}`);
      skipped++;
      continue;
    }

    const publishedAt = dateRaw ? parseDate(dateRaw) : new Date();

    // Tags
    const tagNames = tagsRaw.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
    const tags = (await Promise.all(tagNames.map(getOrCreateTag))).filter(Boolean);

    // Presenter
    const presenterProfile = presenter ? await getOrCreatePresenter(presenter) : null;

    // Body
    const body = summary
      ? `<p>${summary}</p>`
      : `<p>A Samavesh policy discourse on: ${topic}.</p>`;

    await prisma.content.create({
      data: {
        title: topic,
        slug,
        excerpt: summary.slice(0, 490) || null,
        body,
        status: "PUBLISHED",
        publishedAt,
        contentTypeId: discourseType.id,
        topics: tags.length ? { create: tags.map((t) => ({ topicTagId: t!.id })) } : undefined,
        contributors: presenterProfile
          ? { create: [{ profileId: presenterProfile.id, role: ContributorRole.PRESENTER }] }
          : undefined,
      },
    });

    console.log(`  ✓ ${topic}${presenter ? ` — ${presenter}` : ""}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
