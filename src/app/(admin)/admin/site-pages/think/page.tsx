import { prisma } from "@/lib/prisma";
import { ThinkPageForm } from "@/components/admin/ThinkPageForm";

export default async function AdminThinkPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "think" } });
  const data = (config?.data ?? {}) as Record<string, unknown>;

  const initial = {
    heading: (data.heading as string) ?? "Think.",
    subtitle: (data.subtitle as string) ?? "<p>Long-form research, fortnightly op-eds, weekly discourses and conversations — read what our community has been working on this season.</p>",
    perPage: typeof data.perPage === "number" ? data.perPage : 30,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Think page</h1>
        <p className="text-sm text-stone-400 mt-0.5">Edit the hero heading and subtitle shown on /blogs</p>
      </div>
      <ThinkPageForm initial={initial} />
    </div>
  );
}
