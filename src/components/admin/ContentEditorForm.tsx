"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { generateSlug } from "@/lib/slug";

interface ContentType { id: string; name: string; slug: string }
interface TopicTag { id: string; name: string; slug: string }
interface Profile { id: string; name: string }

interface ContributorInput { profileId: string; role: string }
interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  thumbnail: string;
  imageAlt: string;
  imageCaption: string;
  imageCredit: string;
  contentTypeId: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  audioUrl: string;
  videoUrl: string;
  embedUrl: string;
  topicTagIds: string[];
  contributors: ContributorInput[];
}

interface ContentEditorFormProps {
  initialData?: Partial<FormData> & { id?: string };
  contentTypes: ContentType[];
  topicTags: TopicTag[];
  profiles: Profile[];
}

const CONTRIBUTOR_ROLES = ["AUTHOR", "PRESENTER", "DISCUSSANT", "CONTRIBUTOR", "EDITOR"];

export function ContentEditorForm({
  initialData,
  contentTypes,
  topicTags,
  profiles,
}: ContentEditorFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    body: initialData?.body ?? "",
    thumbnail: initialData?.thumbnail ?? "",
    imageAlt: initialData?.imageAlt ?? "",
    imageCaption: initialData?.imageCaption ?? "",
    imageCredit: initialData?.imageCredit ?? "",
    contentTypeId: initialData?.contentTypeId ?? "",
    status: initialData?.status ?? "DRAFT",
    seoTitle: initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
    audioUrl: initialData?.audioUrl ?? "",
    videoUrl: initialData?.videoUrl ?? "",
    embedUrl: initialData?.embedUrl ?? "",
    topicTagIds: initialData?.topicTagIds ?? [],
    contributors: initialData?.contributors ?? [],
  });

  useEffect(() => {
    if (!initialData?.slug && form.title) {
      setForm((f) => ({ ...f, slug: generateSlug(f.title) }));
    }
  }, [form.title, initialData?.slug]);

  function set(key: keyof FormData, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTag(id: string) {
    setForm((f) => ({
      ...f,
      topicTagIds: f.topicTagIds.includes(id)
        ? f.topicTagIds.filter((t) => t !== id)
        : [...f.topicTagIds, id],
    }));
  }

  function addContributor() {
    setForm((f) => ({ ...f, contributors: [...f.contributors, { profileId: "", role: "AUTHOR" }] }));
  }

  function removeContributor(i: number) {
    setForm((f) => ({ ...f, contributors: f.contributors.filter((_, idx) => idx !== i) }));
  }

  function updateContributor(i: number, field: keyof ContributorInput, value: string) {
    setForm((f) => ({
      ...f,
      contributors: f.contributors.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      excerpt: form.excerpt || null,
      thumbnail: form.thumbnail || null,
      imageAlt: form.imageAlt || null,
      imageCaption: form.imageCaption || null,
      imageCredit: form.imageCredit || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      audioUrl: form.audioUrl || null,
      videoUrl: form.videoUrl || null,
      embedUrl: form.embedUrl || null,
      contributors: form.contributors.filter((c) => c.profileId),
    };

    try {
      const isEdit = !!initialData?.id;
      const res = await fetch(
        isEdit ? `/api/content/${initialData!.id}` : "/api/content",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push("/admin/content");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
            placeholder="Enter title"
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={inputClass}
            placeholder="auto-generated"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Content Type *</label>
          <select
            required
            value={form.contentTypeId}
            onChange={(e) => set("contentTypeId", e.target.value)}
            className={inputClass}
          >
            <option value="">Select type</option>
            {contentTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputClass}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          className={inputClass}
          rows={2}
          placeholder="Short summary (max 500 chars)"
          maxLength={500}
        />
      </div>

      <div>
        <label className={labelClass}>Body *</label>
        <RichTextEditor
          value={form.body}
          onChange={(html) => set("body", html)}
          placeholder="Write your content here…"
          minHeight={400}
        />
      </div>

      <ImageUploader
        value={form.thumbnail}
        onChange={(url) => set("thumbnail", url)}
        label="Thumbnail / Featured Image"
        previewRatios={[
          { label: "Content card (16:11)", ratio: 16 / 11 },
          { label: "Article header (16:9)", ratio: 16 / 9 },
          { label: "Modal cover (3:4)", ratio: 3 / 4 },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className={labelClass}>Image Alt Text</label>
          <input value={form.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} className={inputClass} placeholder="Describe the image" />
        </div>
        <div>
          <label className={labelClass}>Image Caption</label>
          <input value={form.imageCaption} onChange={(e) => set("imageCaption", e.target.value)} className={inputClass} placeholder="Caption below image" />
        </div>
        <div>
          <label className={labelClass}>Image Credit</label>
          <input value={form.imageCredit} onChange={(e) => set("imageCredit", e.target.value)} className={inputClass} placeholder="Photographer / Source" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Topic Tags</label>
        <div className="flex flex-wrap gap-2">
          {topicTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                form.topicTagIds.includes(tag.id)
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 text-stone-600 hover:border-stone-600"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Contributors</label>
        {form.contributors.map((c, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <select
              value={c.profileId}
              onChange={(e) => updateContributor(i, "profileId", e.target.value)}
              className={`${inputClass} flex-1`}
            >
              <option value="">Select person</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={c.role}
              onChange={(e) => updateContributor(i, "role", e.target.value)}
              className={`${inputClass} w-36`}
            >
              {CONTRIBUTOR_ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeContributor(i)}
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addContributor}
          className="mt-1 text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          + Add contributor
        </button>
      </div>

      <fieldset className="rounded-md border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-stone-700">Media / Embed (optional)</legend>
        <div className="flex flex-col gap-3 mt-2">
          {[
            ["audioUrl", "Audio URL (podcast)"],
            ["videoUrl", "Video URL"],
            ["embedUrl", "Embed URL / Code"],
          ].map(([key, placeholder]) => (
            <input
              key={key}
              type="url"
              value={form[key as keyof FormData] as string}
              onChange={(e) => set(key as keyof FormData, e.target.value)}
              className={inputClass}
              placeholder={placeholder}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-md border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-stone-700">SEO (optional)</legend>
        <div className="flex flex-col gap-3 mt-2">
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => set("seoTitle", e.target.value)}
            className={inputClass}
            placeholder="SEO Title (max 70 chars)"
            maxLength={70}
          />
          <textarea
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Meta description (max 160 chars)"
            maxLength={160}
          />
        </div>
      </fieldset>

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
