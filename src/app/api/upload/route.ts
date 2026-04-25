import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return apiError("Unauthorized", 401);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return apiError("No file provided", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return apiError("Invalid file type", 400);
  if (file.size > MAX_SIZE) return apiError("File too large (max 5 MB)", 400);

  const provider = process.env.UPLOAD_PROVIDER ?? "local";

  if (provider === "cloudinary") {
    const { uploadToCloudinary } = await import("@/lib/cloudinary");
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToCloudinary(buffer, "samavesh");
    return apiSuccess({ url });
  }

  // Local storage fallback
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return apiSuccess({ url: `/uploads/${filename}` });
}
