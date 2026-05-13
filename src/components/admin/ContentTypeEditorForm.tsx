"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { generateSlug } from "@/lib/slug";

interface ContentTypeForm {
  name: string;
  slug: string;
  description: string;
  thumbnailRatio: string;
  visible: boolean;
}

interface ContentTypeEditorFormProps {
  typeId?: string;
  initialData?: Partial<ContentTypeForm>;
  contentCount?: number;
  allTypes?: { id: string; name: string }[];
}

const RATIO_PRESETS = [
  { label: "3:4 — Tall card (article, paper, op-ed)", value: "3:4", w: 3, h: 4 },
  { label: "1:1 — Square card (discourse)", value: "1:1", w: 1, h: 1 },
  { label: "4:3 — Landscape (podcast, media)", value: "4:3", w: 4, h: 3 },
  { label: "16:9 — Widescreen", value: "16:9", w: 16, h: 9 },
  { label: "Custom", value: "custom", w: 0, h: 0 },
];

export function ContentTypeEditorForm({ typeId, initialData, contentCount = 0, allTypes = [] }: ContentTypeEditorFormProps) {
  const router = useRouter();
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replacementId, setReplacementId] = useState("");

  const [form, setForm] = useState<ContentTypeForm>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    thumbnailRatio: initialData?.thumbnailRatio ?? "3:4",
    visible: initialData?.visible ?? true,
  });

  function setF(key: keyof ContentTypeForm, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "name" && !initialData?.slug) updated.slug = generateSlug(value as string);
      return updated;
    });
  }

  const preset = RATIO_PRESETS.find((p) => p.value === form.thumbnailRatio);
  const isCustom = !RATIO_PRESETS.slice(0, -1).some((p) => p.value === form.thumbnailRatio);

  async function save() {
    setSaving(true);
    try {
      const ratio = form.thumbnailRatio;
      const parts = ratio.split(":");
      const w = parseInt(parts[0]) || 3;
      const h = parseInt(parts[1]) || 4;
      const payload = { ...form, thumbnailRatioW: w, thumbnailRatioH: h };
      const res = await fetch(typeId ? `/api/content-types/${typeId}` : "/api/content-types", {
        method: typeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      show(typeId ? "Content type updated" : "Content type created", "success");
      if (!typeId) router.push(`/admin/content-types/${json.id}/edit`);
      else router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteType() {
    if (!typeId) return;
    const url = contentCount > 0 && replacementId
      ? `/api/content-types/${typeId}?replacementId=${replacementId}`
      : `/api/content-types/${typeId}`;
    const res = await fetch(url, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) {
      router.push("/admin/content-types");
      router.refresh();
    } else {
      show(json.error ?? "Delete failed", "error");
      setConfirmDelete(false);
    }
  }

  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";
  const otherTypes = allTypes.filter((t) => t.id !== typeId);

  return (
    <div className="flex flex-col gap-6">
      {ToastEl}
      {confirmDelete && (
        <ConfirmDialog
          title={contentCount > 0 ? `Reassign ${contentCount} content item${contentCount > 1 ? "s" : ""} before deleting` : "Delete content type?"}
          message={
            contentCount > 0
              ? "This type has content. Choose a replacement type before deleting."
              : "This will permanently delete this content type. It has no content attached."
          }
          confirmLabel="Delete"
          destructive
          onConfirm={contentCount > 0 && !replacementId ? () => show("Please select a replacement type first", "error") : deleteType}
          onCancel={() => setConfirmDelete(false)}
        >
          {contentCount > 0 ? (
            <select
              value={replacementId}
              onChange={(e) => setReplacementId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select replacement type…</option>
              {otherTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          ) : null}
        </ConfirmDialog>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input required value={form.name} onChange={(e) => setF("name", e.target.value)} className={inputClass} placeholder="e.g. Article" />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={form.slug} onChange={(e) => setF("slug", e.target.value)} className={inputClass} placeholder="auto-generated" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} className={inputClass} rows={2} placeholder="Short description for editors" />
      </div>

      <div>
        <label className={labelClass}>Thumbnail Ratio</label>
        <select
          value={isCustom ? "custom" : form.thumbnailRatio}
          onChange={(e) => {
            const p = RATIO_PRESETS.find((x) => x.value === e.target.value);
            if (p && p.value !== "custom") setF("thumbnailRatio", p.value);
            else setF("thumbnailRatio", "");
          }}
          className={inputClass}
        >
          {RATIO_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {isCustom && (
          <input
            className={`${inputClass} mt-2`}
            value={form.thumbnailRatio}
            onChange={(e) => setF("thumbnailRatio", e.target.value)}
            placeholder="e.g. 5:3"
          />
        )}
        {preset && preset.value !== "custom" && (
          <p className="mt-1 text-xs text-stone-400">Preview aspect: {preset.w}:{preset.h} ({((preset.w / preset.h) * 100).toFixed(0)}% width / height)</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="visible" checked={form.visible} onChange={(e) => setF("visible", e.target.checked)} className="h-4 w-4 accent-stone-900" />
        <label htmlFor="visible" className="text-sm font-medium text-stone-700">Visible in filters and navigation</label>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-200">
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
            {saving ? "Saving…" : typeId ? "Update" : "Create"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border border-stone-200 px-6 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition">
            Cancel
          </button>
        </div>
        {typeId && (
          <button onClick={() => setConfirmDelete(true)} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
            Delete Type {contentCount > 0 && `(${contentCount} items)`}
          </button>
        )}
      </div>
    </div>
  );
}
