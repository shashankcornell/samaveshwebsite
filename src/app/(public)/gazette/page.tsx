import { prisma } from "@/lib/prisma";
import { GazetteClient } from "@/components/public/GazetteClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Gazzette — Samavesh" };

interface Props { searchParams: { edition?: string } }

export default async function GazettePage({ searchParams }: Props) {
  // All published editions for the switcher
  const editions = await prisma.gazette.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, slug: true, name: true,
      volumeNumber: true, editionName: true,
      publishedAt: true, place: true, isCurrent: true, status: true,
    },
  });

  const editionSummaries = editions.map((e) => ({
    ...e,
    publishedAt: e.publishedAt?.toISOString() ?? null,
  }));

  // Which edition to show
  const currentSlug = searchParams.edition
    ?? editions.find((e) => e.isCurrent)?.slug
    ?? editions[0]?.slug
    ?? null;

  if (!currentSlug) {
    return (
      <GazetteClient
        editions={[]}
        gazette={null}
        selectedSlug=""
      />
    );
  }

  const raw = await prisma.gazette.findUnique({
    where: { slug: currentSlug },
    include: {
      articles: {
        orderBy: { order: "asc" },
        include: {
          content: {
            include: {
              topics: { include: { topicTag: true }, take: 1 },
              contributors: { include: { profile: { select: { name: true } } } },
            },
          },
        },
      },
      editorialBoard: {
        orderBy: { order: "asc" },
        include: {
          profile: { select: { name: true } },
          role: true,
        },
      },
    },
  });

  if (!raw) {
    return <GazetteClient editions={editionSummaries} gazette={null} selectedSlug={currentSlug} />;
  }

  const gazette = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    volumeNumber: raw.volumeNumber,
    editionName: raw.editionName,
    publishedAt: raw.publishedAt?.toISOString() ?? null,
    place: raw.place,
    isCurrent: raw.isCurrent,
    subheading: raw.subheading,
    description: raw.description,
    editorNote: raw.editorNote,
    disclaimer: raw.disclaimer,
    credits: raw.credits,
    acknowledgements: raw.acknowledgements,
    articles: raw.articles.map((a) => {
      const contribs = a.content.contributors;
      const find = (role: string) => contribs.find((c) => c.role === role)?.profile.name ?? null;
      return {
        contentId: a.contentId,
        slug: a.content.slug,
        title: a.content.title,
        order: a.order,
        topic: a.content.topics[0]?.topicTag.name ?? null,
        presenter: find("PRESENTER"),
        moderator: find("MODERATOR"),
        editor: find("EDITOR"),
      };
    }),
    editorialBoard: raw.editorialBoard.map((m) => ({
      id: m.id,
      name: m.profile.name,
      roleName: m.role?.name ?? null,
      roleOrder: m.role?.order ?? 999,
    })),
  };

  return (
    <GazetteClient
      editions={editionSummaries}
      gazette={gazette}
      selectedSlug={currentSlug}
    />
  );
}
