import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProfileEditorForm } from "@/components/admin/ProfileEditorForm";

interface Props { params: { id: string } }

export default async function EditProfilePage({ params }: Props) {
  const profile = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!profile) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Edit Profile</h1>
      <ProfileEditorForm
        initialData={{
          id: profile.id,
          name: profile.name,
          slug: profile.slug,
          role: profile.role,
          bio: profile.bio ?? "",
          image: profile.image ?? "",
          title: profile.title ?? "",
          linkedin: profile.linkedin ?? "",
          twitter: profile.twitter ?? "",
          website: profile.website ?? "",
        }}
      />
    </div>
  );
}
