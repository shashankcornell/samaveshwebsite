"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { generateSlug } from "@/lib/slug";

interface SectionData {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  data: Record<string, unknown>;
}

interface PageForm {
  title: string;
  slug: string;
  heroHeading: string;
  heroSubtitle: string;
  bgColor: string;
  textColor: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
}

interface CmsPageEditorFormProps {
  pageId?: string;
  initialForm?: Partial<PageForm>;
  initialSections?: SectionData[];
}

const SECTION_TYPES = [
  { value: "rich_text", label: "Rich Text" },
  { value: "image", label: "Image" },
  { value: "two_col", label: "Two Columns" },
  { value: "quote", label: "Pull Quote" },
  { value: "cta", label: "Call to Action" },
  { value: "divider", label: "Divider" },
  { value: "content_list", label: "Content List" },
  { value: "team_grid", label: "Team Grid" },
];

function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  section: SectionData;
  onUpdate: (id: string, data: Partial<SectionData>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(true);
  const d = section.data;
  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-xs font-medium text-stone-500 mb-1";

  function setData(key: string, value: unknown) {
    onUpdate(section.id, { data: { ...section.data, [key]: value } });
  }

  return (
    <div className={`rounded-lg border ${section.visible ? "border-stone-200" : "border-dashed border-stone-300 opacity-60"} bg-white`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMoveUp(section.id)} disabled={isFirst} className="text-stone-300 hover:text-stone-600 disabled:opacity-30 text-xs leading-none">▲</button>
          <button onClick={() => onMoveDown(section.id)} disabled={isLast} className="text-stone-300 hover:text-stone-600 disabled:opacity-30 text-xs leading-none">▼</button>
        </div>
        <span className="flex-1 text-sm font-medium text-stone-700">
          {SECTION_TYPES.find((t) => t.value === section.type)?.label ?? section.type}
        </span>
        <button
          onClick={() => onUpdate(section.id, { visible: !section.visible })}
          className={`text-xs px-2 py-0.5 rounded ${section.visible ? "text-emerald-600 bg-emerald-50" : "text-stone-400 bg-stone-100"}`}
        >
          {section.visible ? "Visible" : "Hidden"}
        </button>
        <button onClick={() => setOpen((v) => !v)} className="text-stone-400 hover:text-stone-700 text-xs px-2">
          {open ? "Collapse" : "Expand"}
        </button>
        <button onClick={() => onDelete(section.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
      </div>

      {open && (
        <div className="p-4">
          {section.type === "rich_text" && (
            <RichTextEditor
              value={(d.content as string) ?? ""}
              onChange={(html) => setData("content", html)}
              placeholder="Write section content…"
              minHeight={200}
            />
          )}

          {section.type === "image" && (
            <div className="flex flex-col gap-3">
              <ImageUploader value={(d.url as string) ?? ""} onChange={(url) => setData("url", url)} label="Image" />
              <div>
                <label className={labelClass}>Caption</label>
                <input value={(d.caption as string) ?? ""} onChange={(e) => setData("caption", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Alt Text</label>
                <input value={(d.alt as string) ?? ""} onChange={(e) => setData("alt", e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          {section.type === "two_col" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Left Column</label>
                <RichTextEditor value={(d.left as string) ?? ""} onChange={(html) => setData("left", html)} minHeight={150} />
              </div>
              <div>
                <label className={labelClass}>Right Column</label>
                <RichTextEditor value={(d.right as string) ?? ""} onChange={(html) => setData("right", html)} minHeight={150} />
              </div>
            </div>
          )}

          {section.type === "quote" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Quote Text</label>
                <textarea value={(d.text as string) ?? ""} onChange={(e) => setData("text", e.target.value)} className={inputClass} rows={3} />
              </div>
              <div>
                <label className={labelClass}>Attribution</label>
                <input value={(d.attribution as string) ?? ""} onChange={(e) => setData("attribution", e.target.value)} className={inputClass} placeholder="— Name, Title" />
              </div>
            </div>
          )}

          {section.type === "cta" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Heading</label>
                <input value={(d.heading as string) ?? ""} onChange={(e) => setData("heading", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Body</label>
                <textarea value={(d.body as string) ?? ""} onChange={(e) => setData("body", e.target.value)} className={inputClass} rows={2} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Button Label</label>
                  <input value={(d.buttonLabel as string) ?? ""} onChange={(e) => setData("buttonLabel", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Button URL</label>
                  <input value={(d.buttonUrl as string) ?? ""} onChange={(e) => setData("buttonUrl", e.target.value)} className={inputClass} placeholder="/path or https://…" />
                </div>
              </div>
            </div>
          )}

          {section.type === "divider" && (
            <p className="text-xs text-stone-400 italic">Horizontal rule — no content needed.</p>
          )}

          {section.type === "content_list" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Section Heading</label>
                <input value={(d.heading as string) ?? ""} onChange={(e) => setData("heading", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Filter by Topic Slug (optional)</label>
                <input value={(d.topicSlug as string) ?? ""} onChange={(e) => setData("topicSlug", e.target.value)} className={inputClass} placeholder="e.g. health-policy" />
              </div>
              <div>
                <label className={labelClass}>Limit</label>
                <input type="number" value={(d.limit as number) ?? 6} onChange={(e) => setData("limit", parseInt(e.target.value))} className={inputClass} />
              </div>
            </div>
          )}

          {section.type === "team_grid" && (
            <div>
              <label className={labelClass}>Section Heading</label>
              <input value={(d.heading as string) ?? ""} onChange={(e) => setData("heading", e.target.value)} className={inputClass} />
              <p className="mt-2 text-xs text-stone-400">Renders all visible profiles from the community.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CmsPageEditorForm({ pageId, initialForm, initialSections = [] }: CmsPageEditorFormProps) {
  const router = useRouter();
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingType, setAddingType] = useState("rich_text");

  const [form, setForm] = useState<PageForm>({
    title: initialForm?.title ?? "",
    slug: initialForm?.slug ?? "",
    heroHeading: initialForm?.heroHeading ?? "",
    heroSubtitle: initialForm?.heroSubtitle ?? "",
    bgColor: initialForm?.bgColor ?? "#ffffff",
    textColor: initialForm?.textColor ?? "#111111",
    status: initialForm?.status ?? "DRAFT",
    seoTitle: initialForm?.seoTitle ?? "",
    seoDescription: initialForm?.seoDescription ?? "",
  });

  const [sections, setSections] = useState<SectionData[]>(initialSections);
  const [sectionsDirty, setSectionsDirty] = useState(false);

  function setF(key: keyof PageForm, value: string) {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "title" && !initialForm?.slug) updated.slug = generateSlug(value);
      return updated;
    });
  }

  function updateSection(id: string, patch: Partial<SectionData>) {
    setSections((s) => s.map((sec) => sec.id === id ? { ...sec, ...patch } : sec));
    setSectionsDirty(true);
  }

  function deleteSection(id: string) {
    setSections((s) => s.filter((sec) => sec.id !== id));
    setSectionsDirty(true);
  }

  function moveSection(id: string, dir: "up" | "down") {
    setSections((s) => {
      const idx = s.findIndex((sec) => sec.id === id);
      if (idx < 0) return s;
      const next = [...s];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return s;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((sec, i) => ({ ...sec, order: i }));
    });
    setSectionsDirty(true);
  }

  async function addSection() {
    if (!pageId) { show("Save the page first, then add sections", "info"); return; }
    const res = await fetch(`/api/cms-pages/${pageId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: addingType, data: {} }),
    });
    const json = await res.json();
    if (res.ok) {
      setSections((s) => [...s, { id: json.id, type: json.type, order: json.order, visible: json.visible, data: json.data }]);
    } else {
      show(json.error ?? "Failed to add section", "error");
    }
  }

  async function saveSections() {
    if (!pageId) return;
    const res = await fetch(`/api/cms-pages/${pageId}/sections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: sections.map(({ id, type, order, visible, data }) => ({ id, type, order, visible, data })) }),
    });
    if (!res.ok) { show("Failed to save sections", "error"); return; }
    setSectionsDirty(false);
  }

  async function saveSectionContent(sectionId: string) {
    if (!pageId) return;
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    await fetch(`/api/cms-pages/${pageId}/sections/${sectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: sec.type, visible: sec.visible, data: sec.data }),
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        heroHeading: form.heroHeading || null,
        heroSubtitle: form.heroSubtitle || null,
        bgColor: form.bgColor || null,
        textColor: form.textColor || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
      };
      const res = await fetch(pageId ? `/api/cms-pages/${pageId}` : "/api/cms-pages", {
        method: pageId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");

      if (sectionsDirty && pageId) await saveSections();
      if (sectionsDirty && pageId) {
        for (const sec of sections) await saveSectionContent(sec.id);
      }

      show("Page saved", "success");
      if (!pageId) router.push(`/admin/pages/${json.id}/edit`);
      else router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deletePage() {
    if (!pageId) return;
    const res = await fetch(`/api/cms-pages/${pageId}`, { method: "DELETE" });
    if (res.ok) { router.push("/admin/pages"); router.refresh(); }
    else show("Delete failed", "error");
  }

  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <div className="flex flex-col gap-8">
      {ToastEl}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete page?"
          message="This will permanently delete the page and all its sections."
          confirmLabel="Delete"
          destructive
          onConfirm={deletePage}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Page Settings */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Page Settings</h2>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Title *</label>
              <input required value={form.title} onChange={(e) => setF("title", e.target.value)} className={inputClass} placeholder="Page title" />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input value={form.slug} onChange={(e) => setF("slug", e.target.value)} className={inputClass} placeholder="auto-generated" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setF("status", e.target.value)} className={inputClass}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Background Color</label>
              <input type="text" value={form.bgColor} onChange={(e) => setF("bgColor", e.target.value)} className={inputClass} placeholder="#ffffff" />
            </div>
            <div>
              <label className={labelClass}>Text Color</label>
              <input type="text" value={form.textColor} onChange={(e) => setF("textColor", e.target.value)} className={inputClass} placeholder="#111111" />
            </div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Hero</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Hero Heading</label>
            <input value={form.heroHeading} onChange={(e) => setF("heroHeading", e.target.value)} className={inputClass} placeholder="Large heading shown at top of page" />
          </div>
          <div>
            <label className={labelClass}>Hero Subtitle</label>
            <textarea value={form.heroSubtitle} onChange={(e) => setF("heroSubtitle", e.target.value)} className={inputClass} rows={2} placeholder="Optional subtitle or intro text" />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Content Sections</h2>
          {sectionsDirty && pageId && (
            <button onClick={saveSections} className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1 hover:bg-amber-100 transition">
              Save section order ↑
            </button>
          )}
        </div>

        {sections.length === 0 && (
          <p className="text-sm text-stone-400 mb-4">{pageId ? "No sections yet. Add one below." : "Save the page first to add sections."}</p>
        )}

        <div className="flex flex-col gap-3 mb-4">
          {sections.map((sec, i) => (
            <SectionEditor
              key={sec.id}
              section={sec}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onMoveUp={(id) => moveSection(id, "up")}
              onMoveDown={(id) => moveSection(id, "down")}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
            />
          ))}
        </div>

        {pageId && (
          <div className="flex gap-2">
            <select value={addingType} onChange={(e) => setAddingType(e.target.value)} className={`${inputClass} flex-1`}>
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button onClick={addSection} className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 transition whitespace-nowrap">
              + Add Section
            </button>
          </div>
        )}
      </section>

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
            {saving ? "Saving…" : pageId ? "Update Page" : "Create Page"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border border-stone-200 px-6 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition">
            Cancel
          </button>
        </div>
        {pageId && (
          <button onClick={() => setConfirmDelete(true)} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
            Delete Page
          </button>
        )}
      </div>
    </div>
  );
}
