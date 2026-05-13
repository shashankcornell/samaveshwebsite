import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GazetteEditorForm } from "@/components/admin/GazetteEditorForm";
import Link from "next/link";

interface Props { params: { id: string } }

export default async function EditGazettePage({ params }: Props) {
  const [gazette, contentOptions, profiles, roles] = await Promise.all([
    prisma.gazette.findUnique({
      where: { id: params.id },
      include: {
        articles: {
          include: { content: { include: { contentType: true } } },
          orderBy: { order: "asc" },
        },
        editorialBoard: {
          include: { profile: true, role: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.content.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true, contentType: { select: { name: true } } },
    }),
    prisma.profile.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, title: true } }),
    prisma.gazetteEditorialBoardRole.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!gazette) notFound();

  const initialForm = {
    name: gazette.name,
    slug: gazette.slug,
    volumeNumber: gazette.volumeNumber?.toString() ?? "",
    editionName: gazette.editionName ?? "",
    isCurrent: gazette.isCurrent,
    publishedAt: gazette.publishedAt ? gazette.publishedAt.toISOString().split("T")[0] : "",
    place: gazette.place ?? "",
    subheading: gazette.subheading ?? "",
    description: gazette.description ?? "",
    coverImage: gazette.coverImage ?? "",
    coverImageAlt: gazette.coverImageAlt ?? "",
    editorNote: gazette.editorNote ?? "",
    status: gazette.status,
    seoTitle: gazette.seoTitle ?? "",
    seoDescription: gazette.seoDescription ?? "",
    disclaimer: gazette.disclaimer ?? "",
    credits: gazette.credits ?? "",
    acknowledgements: gazette.acknowledgements ?? "",
  };

  const initialArticles = gazette.articles.map((a) => ({
    contentId: a.contentId,
    order: a.order,
    title: a.content.title,
    typeName: a.content.contentType.name,
  }));

  const initialBoard = gazette.editorialBoard.map((m) => ({
    id: m.id,
    profileId: m.profileId,
    roleId: m.roleId,
    order: m.order,
    name: m.profile.name,
    roleName: m.role?.name ?? null,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/gazettes" className="text-sm text-stone-400 hover:text-stone-900">← Gazettes</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">{gazette.name}</h1>
      </div>

      <GazetteEditorForm
        gazetteId={gazette.id}
        initialForm={initialForm}
        initialArticles={initialArticles}
        initialBoard={initialBoard}
        contentOptions={contentOptions}
        profiles={profiles}
        roles={roles}
      />
    </div>
  );
}
