import { z } from "zod";

export const TopicTagCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
});

export type TopicTagCreateInput = z.infer<typeof TopicTagCreateSchema>;
