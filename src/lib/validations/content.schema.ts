import { z } from "zod";

export const ContentCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  slug: z.string().min(1).max(300).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  body: z.string().min(1, "Body is required"),
  thumbnail: z.string().optional().nullable(),
  imageAlt: z.string().max(300).optional().nullable(),
  imageCaption: z.string().max(500).optional().nullable(),
  imageCredit: z.string().max(300).optional().nullable(),
  contentTypeId: z.string().min(1, "Content type is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  embedUrl: z.string().optional().nullable(),
  topicTagIds: z.array(z.string()).default([]),
  contributors: z
    .array(
      z.object({
        profileId: z.string(),
        role: z.enum(["AUTHOR", "PRESENTER", "DISCUSSANT", "CONTRIBUTOR", "EDITOR"]),
      })
    )
    .default([]),
});

export const ContentUpdateSchema = ContentCreateSchema.partial();

export type ContentCreateInput = z.infer<typeof ContentCreateSchema>;
export type ContentUpdateInput = z.infer<typeof ContentUpdateSchema>;
