"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { generateSlug } from "@/lib/slug";

interface FormData {
  name: string;
  slug: string;
  role: string;
  customRole: string;
  bio: string;
  image: string;
  title: string;
  affiliation: string;
  linkedin: string;
  twitter: string;
  website: string;
  visible: boolean;
}

interface ProfileEditorFormProps {
  initialData?: Partial<FormData> & { id?: string };
}

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "TEAM_MEMBER", label: "Team Member" },
  { value: "ADVISORY_BOARD", label: "Advisory Board" },
  { value: "FELLOW", label: "Fellow" },
  { value: "PRESENTER", label: "Presenter" },
  { value: "DISCUSSANT", label: "Discussant" },
];

export function ProfileEditorForm({ initialData }: ProfileEditorFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    role: initialData?.role ?? "TEAM_MEMBER",
    customRole: initialData?.customRole ?? "",
    bio: initialData?.bio ?? "",
    image: initialData?.image ?? "",
    title: initialData?.title ?? "",
    affiliation: initialData?.affiliation ?? "",
    linkedin: initialData?.linkedin ?? "",
    twitter: initialData?.twitter ?? "",
    website: initialData?.website ?? "",
    visible: initialData?.visible ?? true,
  });

  function set(key: keyof FormData, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "name" && !initialData?.slug) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      customRole: form.customRole || null,
      bio: form.bio || null,
      image: form.image || null,
      title: form.title || null,
      affiliation: form.affiliation || null,
      linkedin: form.linkedin || null,
      twitter: form.twitter || null,
      website: form.website || null,
    };

    try {
      const isEdit = !!initialData?.id;
      const res = await fetch(
        isEdit ? `/api/community/${initialData!.id}` : "/api/community",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push("/admin/community");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Role *</label>
          <select required value={form.role} onChange={(e) => set("role", e.target.value)} className={inputClass}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Custom Role Label</label>
          <input value={form.customRole} onChange={(e) => set("customRole", e.target.value)} className={inputClass} placeholder="e.g. Guest Contributor" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Title / Position</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} placeholder="e.g. Director, Health Policy" />
        </div>
        <div>
          <label className={labelClass}>Affiliation / Organisation</label>
          <input value={form.affiliation} onChange={(e) => set("affiliation", e.target.value)} className={inputClass} placeholder="e.g. World Bank" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Bio</label>
        <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} className={inputClass} rows={4} />
      </div>

      <ImageUploader
        value={form.image}
        onChange={(url) => set("image", url)}
        label="Profile Image"
        previewRatios={[
          { label: "Profile photo (1:1)", ratio: 1 },
          { label: "Team card (3:4)", ratio: 3 / 4 },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["linkedin", "LinkedIn URL"],
          ["twitter", "Twitter/X URL"],
          ["website", "Website URL"],
        ].map(([key, placeholder]) => (
          <div key={key}>
            <label className={labelClass}>{placeholder}</label>
            <input
              type="url"
              value={form[key as keyof FormData] as string}
              onChange={(e) => set(key as keyof FormData, e.target.value)}
              className={inputClass}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="visible"
          checked={form.visible}
          onChange={(e) => set("visible", e.target.checked)}
          className="h-4 w-4 rounded border-stone-300 accent-stone-900"
        />
        <label htmlFor="visible" className="text-sm font-medium text-stone-700">Visible on public pages</label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : initialData?.id ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-stone-200 px-6 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
