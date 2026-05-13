import { z } from "zod";

export const ProfileCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  role: z.enum(["ADMIN", "TEAM_MEMBER", "ADVISORY_BOARD", "FELLOW", "PRESENTER", "DISCUSSANT"]),
  bio: z.string().max(2000).optional().nullable(),
  image: z.string().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  customRole: z.string().max(200).optional().nullable(),
  affiliation: z.string().max(300).optional().nullable(),
  visible: z.boolean().optional(),
  linkedin: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export const ProfileUpdateSchema = ProfileCreateSchema.partial();

export type ProfileCreateInput = z.infer<typeof ProfileCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
