"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageCropModal } from "./ImageCropModal";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { generateSlug } from "@/lib/slug";

interface SectorForm {
  name: string;
  slug: string;
  description: string;
  longIntro: string;
  bgColor: string;
  image: string;       // hero background (3.6:1)
  sectorImage: string; // sector banner portrait (2:3)
  seoTitle: string;
  seoDescription: string;
}

interface SectorEditorFormProps {
  sectorId?: string;
  initialData?: Partial<SectorForm & { visible: boolean; featured: boolean }>;
  contentCount?: number;
}

type BgHeroMode = "same" | "new" | "color";

const DEFAULT_BG_COLOR = "#fefff6"; // --hero-cream, the site's pastel cream-yellow

const COLOR_SWATCHES = [
  { label: "Cream",  value: "#fefff6" },
  { label: "Sage",   value: "#e2edd0" },
  { label: "Sand",   value: "#ede0d0" },
  { label: "Sky",    value: "#d0e3ed" },
  { label: "Navy",   value: "#1a2b4a" },
  { label: "White",  value: "#ffffff" },
];

const CINEMATIC_STYLE: React.CSSProperties = {
  filter: "contrast(0.88) brightness(0.94) saturate(0.72) sepia(0.08) hue-rotate(-6deg)",
};

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return json.data.url;
}

export function SectorEditorForm({ sectorId, initialData, contentCount = 0 }: SectorEditorFormProps) {
  const router = useRouter();
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<SectorForm>({
    name:           initialData?.name ?? "",
    slug:           initialData?.slug ?? "",
    description:    initialData?.description ?? "",
    longIntro:      initialData?.longIntro ?? "",
    bgColor:        initialData?.bgColor ?? DEFAULT_BG_COLOR,
    image:          initialData?.image ?? "",
    sectorImage:    initialData?.sectorImage ?? "",
    seoTitle:       initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
  });

  const [bgHeroMode, setBgHeroMode] = useState<BgHeroMode>(() =>
    initialData?.image ? "new" : "color"
  );
  const [filterPreview, setFilterPreview] = useState(true);

  // Crop modal states — each holds the src to crop (non-null = modal open)
  const [bannerCropSrc, setBannerCropSrc]   = useState<string | null>(null);
  const [bgSameCropOpen, setBgSameCropOpen] = useState(false);
  const [bgNewCropSrc, setBgNewCropSrc]     = useState<string | null>(null);

  const [bannerUploading, setBannerUploading] = useState(false);
  const [bgUploading, setBgUploading]         = useState(false);

  function setF(key: keyof SectorForm, value: string) {
    setForm(f => {
      const updated = { ...f, [key]: value };
      if (key === "name" && !initialData?.slug) updated.slug = generateSlug(value);
      return updated;
    });
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadFile(file);
      setF("sectorImage", url);
      setBannerCropSrc(url); // auto-open crop
    } catch (err) {
      show(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setBannerUploading(false);
      e.target.value = "";
    }
  }

  async function handleBgNewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(true);
    try {
      const url = await uploadFile(file);
      setF("image", url);
      setBgNewCropSrc(url); // auto-open crop
    } catch (err) {
      show(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setBgUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        visible:        initialData?.visible  ?? true,
        featured:       initialData?.featured ?? false,
        description:    form.description    || null,
        longIntro:      form.longIntro      || null,
        bgColor:        bgHeroMode === "color" ? (form.bgColor || null) : null,
        image:          bgHeroMode !== "color" ? (form.image  || null) : null,
        sectorImage:    form.sectorImage    || null,
        seoTitle:       form.seoTitle       || null,
        seoDescription: form.seoDescription || null,
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
      if (json.kept?.length) show("Some images kept — used elsewhere on the site", "info");
      router.push("/admin/sectors");
      router.refresh();
    } else {
      show(json.error ?? "Delete failed", "error");
      setConfirmDelete(false);
    }
  }

  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";
  const monoSm: React.CSSProperties = { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", color: "#aaa" };

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

      {/* Name & Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input required value={form.name} onChange={e => setF("name", e.target.value)} className={inputClass} placeholder="e.g. Health Policy" />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={form.slug} onChange={e => setF("slug", e.target.value)} className={inputClass} placeholder="auto-generated" />
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea value={form.description} onChange={e => setF("description", e.target.value)} className={inputClass} rows={2} placeholder="Shown in topic lists and cards" />
      </div>
      <div>
        <label className={labelClass}>Long Introduction</label>
        <textarea value={form.longIntro} onChange={e => setF("longIntro", e.target.value)} className={inputClass} rows={4} placeholder="Shown on the sector landing page" />
      </div>

      {/* ── Section 1: Sector Banner Image (2:3) ── */}
      <div className="rounded-lg border border-stone-200 p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 mb-0.5">Sector Banner Image</p>
          <p className="text-xs text-stone-400">Portrait image shown in the sector page hero. Crop ratio: 2:3.</p>
        </div>

        {form.sectorImage && (
          <button
            type="button"
            onClick={() => setFilterPreview(f => !f)}
            style={{
              alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999,
              border: `1px solid ${filterPreview ? "#111" : "#ddd"}`,
              background: filterPreview ? "#111" : "#fff",
              color: filterPreview ? "#fff" : "#888",
              fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer",
              transition: "all 140ms ease",
            }}
          >
            <span style={{ fontSize: 11 }}>◑</span>
            {filterPreview ? "WITH CINEMATIC FILTER" : "ORIGINAL"}
          </button>
        )}

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Small preview */}
          {form.sectorImage && (
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={monoSm}>PREVIEW (2:3)</p>
              <div style={{ position: "relative", width: 90, height: 135, overflow: "hidden", borderRadius: 4, border: "1px solid #e0ddd8", background: "#f0efec", isolation: "isolate" }}>
                <Image src={form.sectorImage} alt="Banner" fill sizes="90px"
                  style={{ objectFit: "cover", ...(filterPreview ? CINEMATIC_STYLE : {}), transition: "filter 400ms ease" }} />
                {filterPreview && (
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(148deg, rgba(55,78,118,0.14) 0%, rgba(35,52,82,0.08) 50%, rgba(68,90,108,0.13) 100%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
                )}
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <p className="text-xs text-stone-500 mb-1">{form.sectorImage ? "Replace image:" : "Upload image:"}</p>
              <input
                type="file" accept="image/*"
                onChange={handleBannerUpload}
                disabled={bannerUploading}
                className="text-sm text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-stone-100 file:px-3 file:py-1 file:text-sm file:font-medium hover:file:bg-stone-200"
              />
              {bannerUploading && <p className="text-xs text-stone-400 mt-1">Uploading…</p>}
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Or paste URL:</p>
              <input type="text" value={form.sectorImage} onChange={e => setF("sectorImage", e.target.value)} placeholder="https://…" className={inputClass} />
            </div>
            {form.sectorImage && (
              <button
                type="button"
                onClick={() => setBannerCropSrc(form.sectorImage)}
                style={{ alignSelf: "flex-start", padding: "5px 14px", border: "1px solid #111", borderRadius: 6, background: "#111", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}
              >
                CROP / ADJUST ✂
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Hero Background ── */}
      <div className="rounded-lg border border-stone-200 p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 mb-0.5">Hero Background</p>
          <p className="text-xs text-stone-400">Full-width background behind the sector heading on the public page.</p>
        </div>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["same", "new", "color"] as BgHeroMode[]).map(m => {
            const labels: Record<BgHeroMode, string> = {
              same:  "Use banner image",
              new:   "Upload different image",
              color: "Solid colour",
            };
            return (
              <button
                key={m} type="button"
                onClick={() => setBgHeroMode(m)}
                style={{
                  padding: "6px 16px", borderRadius: 999,
                  border: `1px solid ${bgHeroMode === m ? "#111" : "#e0ddd8"}`,
                  background: bgHeroMode === m ? "#111" : "#fff",
                  color: bgHeroMode === m ? "#fff" : "#666",
                  fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.06em",
                  cursor: "pointer", transition: "all 140ms ease",
                }}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>

        {/* ── Same image mode ── */}
        {bgHeroMode === "same" && (
          <div>
            {!form.sectorImage ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 inline-block">
                Upload a banner image first (section above), then crop it here for the background.
              </p>
            ) : (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={monoSm}>{form.image ? "BACKGROUND CROP (3.6:1)" : "SOURCE — BANNER IMAGE"}</p>
                  <div style={{ position: "relative", width: 260, height: 72, overflow: "hidden", borderRadius: 4, border: "1px solid #e0ddd8", background: "#f0efec", isolation: "isolate" }}>
                    <Image src={form.image || form.sectorImage} alt="Background" fill sizes="260px"
                      style={{ objectFit: "cover", ...(filterPreview ? CINEMATIC_STYLE : {}), transition: "filter 400ms ease" }} />
                    {filterPreview && (
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(148deg, rgba(55,78,118,0.14) 0%, rgba(35,52,82,0.08) 50%, rgba(68,90,108,0.13) 100%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 22 }}>
                  <button
                    type="button"
                    onClick={() => setBgSameCropOpen(true)}
                    style={{ padding: "5px 14px", border: "1px solid #111", borderRadius: 6, background: "#111", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}
                  >
                    {form.image ? "RE-CROP ✂" : "CROP FOR BACKGROUND ✂"}
                  </button>
                  <p style={{ ...monoSm, letterSpacing: "0.07em" }}>Crops banner image at 3.6:1 for the background</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── New image mode ── */}
        {bgHeroMode === "new" && (
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {form.image && (
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={monoSm}>BACKGROUND PREVIEW (3.6:1)</p>
                <div style={{ position: "relative", width: 260, height: 72, overflow: "hidden", borderRadius: 4, border: "1px solid #e0ddd8", background: "#f0efec", isolation: "isolate" }}>
                  <Image src={form.image} alt="Background" fill sizes="260px"
                    style={{ objectFit: "cover", ...(filterPreview ? CINEMATIC_STYLE : {}), transition: "filter 400ms ease" }} />
                  {filterPreview && (
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(148deg, rgba(55,78,118,0.14) 0%, rgba(35,52,82,0.08) 50%, rgba(68,90,108,0.13) 100%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
                  )}
                </div>
              </div>
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <p className="text-xs text-stone-500 mb-1">{form.image ? "Replace image:" : "Upload background image:"}</p>
                <input
                  type="file" accept="image/*"
                  onChange={handleBgNewUpload}
                  disabled={bgUploading}
                  className="text-sm text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-stone-100 file:px-3 file:py-1 file:text-sm file:font-medium hover:file:bg-stone-200"
                />
                {bgUploading && <p className="text-xs text-stone-400 mt-1">Uploading…</p>}
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Or paste URL:</p>
                <input type="text" value={form.image} onChange={e => setF("image", e.target.value)} placeholder="https://…" className={inputClass} />
              </div>
              {form.image && (
                <button
                  type="button"
                  onClick={() => setBgNewCropSrc(form.image)}
                  style={{ alignSelf: "flex-start", padding: "5px 14px", border: "1px solid #111", borderRadius: 6, background: "#111", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}
                >
                  CROP / ADJUST ✂
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Solid colour mode ── */}
        {bgHeroMode === "color" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Swatches */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {COLOR_SWATCHES.map(s => (
                <button
                  key={s.value} type="button"
                  onClick={() => setF("bgColor", s.value)}
                  title={`${s.label} — ${s.value}`}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: s.value,
                    border: form.bgColor === s.value ? "2.5px solid #111" : "1px solid #e0ddd8",
                    cursor: "pointer", transition: "border 120ms ease",
                  }}
                />
              ))}
            </div>
            {/* Selected colour label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 20, borderRadius: 4, background: form.bgColor || DEFAULT_BG_COLOR, border: "1px solid #e0ddd8", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#666" }}>
                {COLOR_SWATCHES.find(s => s.value === form.bgColor)?.label ?? "Custom"}
                {" — "}{form.bgColor || DEFAULT_BG_COLOR}
              </span>
            </div>
            {/* Custom hex */}
            <div style={{ maxWidth: 200 }}>
              <p className="text-xs text-stone-400 mb-1">Custom hex:</p>
              <input
                type="text" value={form.bgColor}
                onChange={e => setF("bgColor", e.target.value)}
                placeholder={DEFAULT_BG_COLOR}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* SEO */}
      <fieldset className="rounded-md border border-stone-200 p-4">
        <legend className="px-1 text-sm font-medium text-stone-700">SEO (optional)</legend>
        <div className="flex flex-col gap-3 mt-2">
          <input value={form.seoTitle} onChange={e => setF("seoTitle", e.target.value)} className={inputClass} placeholder="SEO Title" maxLength={70} />
          <textarea value={form.seoDescription} onChange={e => setF("seoDescription", e.target.value)} className={inputClass} rows={2} placeholder="Meta description" maxLength={160} />
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

      {/* ── Crop Modals ── */}

      {/* Banner image crop (2:3) — auto-opens after upload */}
      {bannerCropSrc && (
        <ImageCropModal
          src={bannerCropSrc}
          previewRatios={[{ label: "Sector banner (2:3)", ratio: 2 / 3 }]}
          onConfirm={url => { setF("sectorImage", url); setBannerCropSrc(null); }}
          onClose={() => setBannerCropSrc(null)}
        />
      )}

      {/* Background crop from same image (3.6:1) */}
      {bgSameCropOpen && form.sectorImage && (
        <ImageCropModal
          src={form.sectorImage}
          previewRatios={[{ label: "Hero background (3.6:1)", ratio: 3.6 }]}
          onConfirm={url => { setF("image", url); setBgSameCropOpen(false); }}
          onClose={() => setBgSameCropOpen(false)}
        />
      )}

      {/* Background crop from new image (3.6:1) — auto-opens after upload */}
      {bgNewCropSrc && (
        <ImageCropModal
          src={bgNewCropSrc}
          previewRatios={[{ label: "Hero background (3.6:1)", ratio: 3.6 }]}
          onConfirm={url => { setF("image", url); setBgNewCropSrc(null); }}
          onClose={() => setBgNewCropSrc(null)}
        />
      )}
    </div>
  );
}
