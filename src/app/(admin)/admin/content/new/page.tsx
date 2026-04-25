import { prisma } from "@/lib/prisma";
import { ContentEditorForm } from "@/components/admin/ContentEditorForm";

export default async function NewContentPage() {
  const [contentTypes, topicTags, profiles] = await Promise.all([
    prisma.contentType.findMany({ orderBy: { name: "asc" } }),
    prisma.topicTag.findMany({ orderBy: { name: "asc" } }),
    prisma.profile.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">New Content</h1>
      <ContentEditorForm
        contentTypes={contentTypes}
        topicTags={topicTags}
        profiles={profiles}
      />
    </div>
  );
}
