"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { generateSlug } from "@/lib/slug";

interface SectorForm {
  name: string;
  slug: string;
  description: string;
  longIntro: string;
  bgColor: string;
  image: string;        // background image
  sectorImage: string;  // hero/banner image (portrait crop)
  seoTitle: string;
  seoDescription: string;
}

interface SectorEditorFormProps {
  sectorId?: string;
  initialData?: Partial<SectorForm & { visible: boolean; featured: boolean }>;
  contentCount?: number;
}

const BG_PRESETS = [
  { label: "Blue (hero)",   value: "#f6fcff" },
  { label: "Cream (hero)",  value: "#fefff6" },
  { label: "Stone 50",      value: "#fafaf9" },
  { label: "Dark navy",     value: "#1a2b4a" },
  { label: "White",         value: "#ffffff" },
  { label: "Custom",        value: "custom" },
];

export function SectorEditorForm({ sectorId, initialData, contentCount = 0 }: SectorEditorFormProps) {
  const router = useRouter();
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<SectorForm>({
    name:             initialData?.name ?? "",
    slug:             initialData?.slug ?? "",
    description:      initialData?.description ?? "",
    longIntro:        initialData?.longIntro ?? "",
    bgColor:          initialData?.bgColor ?? "",
    image:            initialData?.image ?? "",
    sectorImage:      initialData?.sectorImage ?? "",
    seoTitle:         initialData?.seoTitle ?? "",
    seoDescription:   initialData?.seoDescription ?? "",
  });

  // "color" | "image" — which background mode the admin is using
  const [bgMode, setBgMode] = useState<"color" | "image">(
    initialData?.image ? "image" : "color"
  );

  function setF(key: keyof SectorForm, value: string) {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "name" && !initialData?.slug) updated.slug = generateSlug(value);
      return updated;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        // preserve existing visible/featured in DB — we just don't expose them in UI
        visible:          initialData?.visible  ?? true,
        featured:         initialData?.featured ?? false,
        description:      form.description      || null,
        longIntro:        form.longIntro        || null,
        bgColor:          bgMode === "color" ? (form.bgColor || null) : null,
        image:            bgMode === "image" ? (form.image || null) : null,
        sectorImage:      form.sectorImage      || null,
        seoTitle:         form.seoTitle         || null,
        seoDescription:   form.seoDescription   || null,
      };
      const res = await fetch(sectorId ? `/api/sectors/${sectorId}` : "/api/sectors", {
        method: sectorId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      show(sectorId ? "Sector updated" : "Sector created", "success");
      if (!sectorId) router.push(`/admin/sectors/${json.id}/edit`);
      else router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSector() {
    if (!sectorId) return;
    const res = await fetch(`/api/sectors/${sectorId}`, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) {
      if (json.archived) show("Sector archived (has content)", "info");
      router.push("/admin/sectors");
      router.refresh();
    } else {
      show(json.error ?? "Delete failed", "error");
      setConfirmDelete(false);
    }
  }

  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";
  const isCustomBg = form.bgColor && !BG_PRESETS.slice(0, -1).some((p) => p.value === form.bgColor);

  return (
    <div className="flex flex-col gap-6">
      {ToastEl}
      {confirmDelete && (
        <ConfirmDialog
          title={contentCount > 0 ? "Archive sector?" : "Delete sector?"}
          message={
            contentCount > 0
              ? `This sector has ${contentCount} content item${contentCount > 1 ? "s" : ""}. It will be archived (hidden) instead of deleted.`
              : "This will permanently delete this sector."
          }
          confirmLabel={contentCount > 0 ? "Archive" : "Delete"}
          destructive
          onConfirm={deleteSector}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Name & slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input required value={form.name} onChange={(e) => setF("name", e.target.value)} className={inputClass} placeholder="e.g. Health Policy" />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={form.slug} onChange={(e) => setF("slug", e.target.value)} className={inputClass} placeholder="auto-generated" />
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} className={inputClass} rows={2} placeholder="Shown in topic lists and cards" />
      </div>
      <div>
        <label className={labelClass}>Long Introduction</label>
        <textarea value={form.longIntro} onChange={(e) => setF("longIntro", e.target.value)} className={inputClass} rows={5} placeholder="Shown on the sector landing page" />
      </div>

      {/* ── Background ── */}
      <div className="rounded-lg border border-stone-200 p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 mb-3">Hero Background</p>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setBgMode("color")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${bgMode === "color" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"}`}
            >
              Color
            </button>
            <button
              type="button"
              onClick={() => setBgMode("image")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${bgMode === "image" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"}`}
            >
              Use image
            </button>
          </div>

          {/* Color mode */}
          {bgMode === "color" && (
            <div className="flex flex-col gap-2">
              <select
                value={isCustomBg ? "custom" : (form.bgColor || "")}
                onChange={(e) => {
                  if (e.target.value === "custom") setF("bgColor", "");
                  else setF("bgColor", e.target.value);
                }}
                className={inputClass}
              >
                <option value="">Default (site blue)</option>
                {BG_PRESETS.slice(0, -1).map((p) => (
                  <option key={p.value} value={p.value}>{p.label} — {p.value}</option>
                ))}
                <option value="custom">Custom hex</option>
              </select>
              {(isCustomBg || form.bgColor === "") ? null : (
                <div style={{ width: 40, height: 24, borderRadius: 4, border: "1px solid #e0ddd8", background: form.bgColor }} />
              )}
              {isCustomBg && (
                <input className={inputClass} value={form.bgColor} onChange={(e) => setF("bgColor", e.target.value)} placeholder="#rrggbb" />
              )}
            </div>
          )}

          {/* Image mode */}
          {bgMode === "image" && (
            <ImageUploader
              value={form.image}
              onChange={(url) => setF("image", url)}
              label="Background image"
              previewRatios={[
                { label: "Desktop hero (3.6:1)", ratio: 3.6 },
                { label: "Mobile (2:3)",         ratio: 2 / 3 },
              ]}
            />
          )}
        </div>
      </div>

      {/* Hero / Banner image (portrait) */}
      <ImageUploader
        value={form.sectorImage}
        onChange={(url) => setF("sectorImage", url)}
        label="Sector Hero / Banner Image"
        previewRatios={[{ label: "Sector hero banner (2:3)", ratio: 2 / 3 }]}
      />

      {/* SEO */}
      <fieldset className="rounded-md border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-stone-700">SEO (optional)</legend>
        <div className="flex flex-col gap-3 mt-2">
          <input value={form.seoTitle} onChange={(e) => setF("seoTitle", e.target.value)} className={inputClass} placeholder="SEO Title" maxLength={70} />
          <textarea value={form.seoDescription} onChange={(e) => setF("seoDescription", e.target.value)} className={inputClass} rows={2} placeholder="Meta description" maxLength={160} />
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-200">
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
            {saving ? "Saving…" : sectorId ? "Update Sector" : "Create Sector"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border border-stone-200 px-6 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition">
            Cancel
          </button>
        </div>
        {sectorId && (
          <button onClick={() => setConfirmDelete(true)} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
            {contentCount > 0 ? "Archive Sector" : "Delete Sector"}
          </button>
        )}
      </div>
    </div>
  );
}
