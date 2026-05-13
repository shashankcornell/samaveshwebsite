"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { generateSlug } from "@/lib/slug";

interface ContentOption { id: string; title: string; slug: string; contentType: { name: string } }
interface Profile { id: string; name: string; title?: string | null }
interface Role { id: string; name: string }

interface ArticleItem { contentId: string; order: number; title: string; typeName: string }
interface BoardMember { id: string; profileId: string; roleId: string | null; order: number; name: string; roleName: string | null }

interface GazetteForm {
  name: string;
  slug: string;
  volumeNumber: string;
  editionName: string;
  isCurrent: boolean;
  publishedAt: string;
  place: string;
  subheading: string;
  description: string;
  coverImage: string;
  coverImageAlt: string;
  editorNote: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  disclaimer: string;
  credits: string;
  acknowledgements: string;
}

interface GazetteEditorFormProps {
  gazetteId?: string;
  initialForm?: Partial<GazetteForm>;
  initialArticles?: ArticleItem[];
  initialBoard?: BoardMember[];
  contentOptions: ContentOption[];
  profiles: Profile[];
  roles: Role[];
}

export function GazetteEditorForm({
  gazetteId,
  initialForm,
  initialArticles = [],
  initialBoard = [],
  contentOptions,
  profiles,
  roles,
}: GazetteEditorFormProps) {
  const router = useRouter();
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<GazetteForm>({
    name: initialForm?.name ?? "",
    slug: initialForm?.slug ?? "",
    volumeNumber: initialForm?.volumeNumber ?? "",
    editionName: initialForm?.editionName ?? "",
    isCurrent: initialForm?.isCurrent ?? false,
    publishedAt: initialForm?.publishedAt ?? "",
    place: initialForm?.place ?? "",
    subheading: initialForm?.subheading ?? "",
    description: initialForm?.description ?? "",
    coverImage: initialForm?.coverImage ?? "",
    coverImageAlt: initialForm?.coverImageAlt ?? "",
    editorNote: initialForm?.editorNote ?? "",
    status: initialForm?.status ?? "DRAFT",
    seoTitle: initialForm?.seoTitle ?? "",
    seoDescription: initialForm?.seoDescription ?? "",
    disclaimer: initialForm?.disclaimer ?? "",
    credits: initialForm?.credits ?? "",
    acknowledgements: initialForm?.acknowledgements ?? "",
  });

  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [board, setBoard] = useState<BoardMember[]>(initialBoard);
  const [addingArticle, setAddingArticle] = useState("");
  const [addingProfileId, setAddingProfileId] = useState("");
  const [addingRoleId, setAddingRoleId] = useState("");

  function setF(key: keyof GazetteForm, value: string | boolean) {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "name" && !initialForm?.slug) updated.slug = generateSlug(value as string);
      return updated;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        volumeNumber: form.volumeNumber ? parseInt(form.volumeNumber) : null,
        publishedAt: form.publishedAt || null,
        place: form.place || null,
        subheading: form.subheading || null,
        description: form.description || null,
        coverImage: form.coverImage || null,
        coverImageAlt: form.coverImageAlt || null,
        editorNote: form.editorNote || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        disclaimer: form.disclaimer || null,
        credits: form.credits || null,
        acknowledgements: form.acknowledgements || null,
      };
      const res = await fetch(gazetteId ? `/api/gazettes/${gazetteId}` : "/api/gazettes", {
        method: gazetteId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      if (!gazetteId) {
        router.push(`/admin/gazettes/${json.id}/edit`);
      } else {
        show("Gazette saved", "success");
        router.refresh();
      }
    } catch (err) {
      show(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function addArticle() {
    if (!gazetteId || !addingArticle) return;
    const res = await fetch(`/api/gazettes/${gazetteId}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: addingArticle }),
    });
    if (res.ok) {
      const opt = contentOptions.find((c) => c.id === addingArticle);
      if (opt) {
        setArticles((a) => [...a, { contentId: opt.id, order: a.length, title: opt.title, typeName: opt.contentType.name }]);
      }
      setAddingArticle("");
    }
  }

  async function removeArticle(contentId: string) {
    if (!gazetteId) return;
    await fetch(`/api/gazettes/${gazetteId}/articles`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId }),
    });
    setArticles((a) => a.filter((x) => x.contentId !== contentId));
  }

  async function addBoardMember() {
    if (!gazetteId || !addingProfileId) return;
    const res = await fetch(`/api/gazettes/${gazetteId}/editorial-board`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: addingProfileId, roleId: addingRoleId || null }),
    });
    const json = await res.json();
    if (res.ok) {
      const prof = profiles.find((p) => p.id === addingProfileId);
      const role = roles.find((r) => r.id === addingRoleId);
      setBoard((b) => [...b, { id: json.id, profileId: addingProfileId, roleId: addingRoleId || null, order: b.length, name: prof?.name ?? "", roleName: role?.name ?? null }]);
      setAddingProfileId("");
      setAddingRoleId("");
    }
  }

  async function removeBoardMember(memberId: string) {
    if (!gazetteId) return;
    await fetch(`/api/gazettes/${gazetteId}/editorial-board/${memberId}`, { method: "DELETE" });
    setBoard((b) => b.filter((x) => x.id !== memberId));
  }

  async function deleteGazette() {
    if (!gazetteId) return;
    const res = await fetch(`/api/gazettes/${gazetteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/gazettes");
      router.refresh();
    } else {
      show("Delete failed", "error");
    }
  }

  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";
  const usedContentIds = new Set(articles.map((a) => a.contentId));
  const usedProfileIds = new Set(board.map((b) => b.profileId));

  return (
    <div className="flex flex-col gap-8">
      {ToastEl}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete gazette?"
          message="This will permanently delete the gazette and all its article associations. Content pieces themselves will not be deleted."
          confirmLabel="Delete"
          destructive
          onConfirm={deleteGazette}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Core Info */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Gazette Details</h2>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name *</label>
              <input required value={form.name} onChange={(e) => setF("name", e.target.value)} className={inputClass} placeholder="e.g. The Gazette Vol. 1" />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input value={form.slug} onChange={(e) => setF("slug", e.target.value)} className={inputClass} placeholder="auto-generated" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Volume Number</label>
              <input type="number" value={form.volumeNumber} onChange={(e) => setF("volumeNumber", e.target.value)} className={inputClass} placeholder="1" />
            </div>
            <div>
              <label className={labelClass}>Edition Name</label>
              <input value={form.editionName} onChange={(e) => setF("editionName", e.target.value)} className={inputClass} placeholder="e.g. The Climate Edition" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setF("status", e.target.value)} className={inputClass}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Place / City</label>
              <input value={form.place} onChange={(e) => setF("place", e.target.value)} className={inputClass} placeholder="New Delhi" />
            </div>
            <div>
              <label className={labelClass}>Published Date</label>
              <input type="date" value={form.publishedAt} onChange={(e) => setF("publishedAt", e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isCurrent} onChange={(e) => setF("isCurrent", e.target.checked)} className="h-4 w-4 accent-stone-900" />
                <span className="text-sm font-medium text-stone-700">Mark as current edition</span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Subheading</label>
            <input value={form.subheading} onChange={(e) => setF("subheading", e.target.value)} className={inputClass} placeholder="Short subtitle for the gazette" />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} className={inputClass} rows={3} />
          </div>

          <ImageUploader value={form.coverImage} onChange={(url) => setF("coverImage", url)} label="Cover Image" />
          <div>
            <label className={labelClass}>Cover Image Alt Text</label>
            <input value={form.coverImageAlt} onChange={(e) => setF("coverImageAlt", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Editor Note */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Editor&apos;s Note</h2>
        <RichTextEditor value={form.editorNote} onChange={(html) => setF("editorNote", html)} placeholder="Write the editor's note…" minHeight={200} />
      </section>

      {/* Articles — only after gazette is saved */}
      {gazetteId && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Articles in this Gazette</h2>
          {articles.length > 0 && (
            <div className="rounded-lg border border-stone-200 overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-stone-600">Title</th>
                    <th className="px-4 py-2 text-left font-medium text-stone-600">Type</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.contentId} className="border-b border-stone-100">
                      <td className="px-4 py-2 font-medium text-stone-800">{a.title}</td>
                      <td className="px-4 py-2 text-stone-500 text-xs">{a.typeName}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeArticle(a.contentId)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2">
            <select value={addingArticle} onChange={(e) => setAddingArticle(e.target.value)} className={`${inputClass} flex-1`}>
              <option value="">Add an article…</option>
              {contentOptions.filter((c) => !usedContentIds.has(c.id)).map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c.contentType.name})</option>
              ))}
            </select>
            <button onClick={addArticle} disabled={!addingArticle} className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-40 transition whitespace-nowrap">
              Add Article
            </button>
          </div>
        </section>
      )}

      {/* Editorial Board — only after gazette is saved */}
      {gazetteId && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Editorial Board</h2>
          {board.length > 0 && (
            <div className="rounded-lg border border-stone-200 overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-stone-600">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-stone-600">Role</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((m) => (
                    <tr key={m.id} className="border-b border-stone-100">
                      <td className="px-4 py-2 font-medium text-stone-800">{m.name}</td>
                      <td className="px-4 py-2 text-stone-500 text-xs">{m.roleName ?? "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeBoardMember(m.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-2">
            <select value={addingProfileId} onChange={(e) => setAddingProfileId(e.target.value)} className={`${inputClass} flex-1`}>
              <option value="">Add a member…</option>
              {profiles.filter((p) => !usedProfileIds.has(p.id)).map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.title ? ` — ${p.title}` : ""}</option>
              ))}
            </select>
            <select value={addingRoleId} onChange={(e) => setAddingRoleId(e.target.value)} className={`${inputClass} w-48`}>
              <option value="">No role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button onClick={addBoardMember} disabled={!addingProfileId} className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-40 transition whitespace-nowrap">
              Add Member
            </button>
          </div>
        </section>
      )}

      {/* Credits / Legal */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Credits & Legal</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Disclaimer</label>
            <textarea value={form.disclaimer} onChange={(e) => setF("disclaimer", e.target.value)} className={inputClass} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Credits</label>
            <textarea value={form.credits} onChange={(e) => setF("credits", e.target.value)} className={inputClass} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Acknowledgements</label>
            <textarea value={form.acknowledgements} onChange={(e) => setF("acknowledgements", e.target.value)} className={inputClass} rows={3} />
          </div>
        </div>
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
            {saving ? "Saving…" : gazetteId ? "Update Gazette" : "Create Gazette"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border border-stone-200 px-6 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition">
            Cancel
          </button>
        </div>
        {gazetteId && (
          <button onClick={() => setConfirmDelete(true)} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
            Delete Gazette
          </button>
        )}
      </div>

      {!gazetteId && (
        <p className="text-xs text-stone-400 -mt-4">After creating, you&apos;ll be able to add articles and editorial board members.</p>
      )}
    </div>
  );
}
