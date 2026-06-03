import { prisma } from "./prisma";
import { unlink } from "fs/promises";
import path from "path";

export interface ImageCleanupResult {
  deleted: string[];
  kept: string[]; // still referenced elsewhere — not deleted
}

async function isImageInUse(url: string): Promise<boolean> {
  const [sectors, contents, profiles, news, gazettes] = await Promise.all([
    prisma.topicTag.count({ where: { OR: [{ image: url }, { sectorImage: url }] } }),
    prisma.content.count({ where: { thumbnail: url } }),
    prisma.profile.count({ where: { image: url } }),
    prisma.newsItem.count({ where: { image: url } }),
    prisma.gazette.count({ where: { coverImage: url } }),
  ]);
  return sectors + contents + profiles + news + gazettes > 0;
}

async function deleteFile(url: string): Promise<boolean> {
  const provider = process.env.UPLOAD_PROVIDER ?? "local";

  if (provider === "cloudinary" && url.includes("cloudinary.com")) {
    try {
      const { deleteFromCloudinary } = await import("./cloudinary");
      await deleteFromCloudinary(url);
      return true;
    } catch {
      return false;
    }
  }

  if (url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", url));
      return true;
    } catch {
      return false;
    }
  }

  return false; // external URL — leave untouched
}

// Call this AFTER the DB record has been deleted.
// Deduplicates URLs, checks each one across all tables, deletes orphans.
export async function cleanupImages(
  urls: (string | null | undefined)[],
): Promise<ImageCleanupResult> {
  const result: ImageCleanupResult = { deleted: [], kept: [] };
  const unique = [...new Set(urls.filter((u): u is string => !!u))];

  await Promise.all(
    unique.map(async (url) => {
      if (await isImageInUse(url)) {
        result.kept.push(url);
      } else {
        const ok = await deleteFile(url);
        if (ok) result.deleted.push(url);
      }
    }),
  );

  return result;
}
