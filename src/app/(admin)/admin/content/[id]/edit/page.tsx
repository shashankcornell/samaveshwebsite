import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContentEditorForm } from "@/components/admin/ContentEditorForm";

interface Props { params: { id: string } }

export default async function EditContentPage({ params }: Props) {
  const [content, contentTypes, topicTags, profiles] = await Promise.all([
    prisma.content.findUnique({
      where: { id: params.id },
      include: {
        contentType: true,
        topics: { include: { topicTag: true } },
        contributors: { include: { profile: true } },
      },
    }),
    prisma.contentType.findMany({ orderBy: { name: "asc" } }),
    prisma.topicTag.findMany({ orderBy: { name: "asc" } }),
    prisma.profile.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!content) notFound();

  const initialData = {
    id: content.id,
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt ?? "",
    body: content.body,
    thumbnail: content.thumbnail ?? "",
    contentTypeId: content.contentTypeId,
    status: content.status,
    seoTitle: content.seoTitle ?? "",
    seoDescription: content.seoDescription ?? "",
    audioUrl: content.audioUrl ?? "",
    videoUrl: content.videoUrl ?? "",
    embedUrl: content.embedUrl ?? "",
    topicTagIds: content.topics.map((t) => t.topicTagId),
    contributors: content.contributors.map((c) => ({ profileId: c.profileId, role: c.role })),
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Edit Content</h1>
      <ContentEditorForm
        initialData={initialData}
        contentTypes={contentTypes}
        topicTags={topicTags}
        profiles={profiles}
      />
    </div>
  );
}
