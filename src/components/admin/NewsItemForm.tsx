"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";

export type NewsCategory = "POLICY" | "COMMUNITY" | "ANNOUNCEMENT" | "MEDIA" | "EVENT" | "HIRING" | "RESEARCH";
export type EmbedType = "" | "youtube" | "twitter" | "instagram" | "linkedin" | "custom";

export interface NewsItemData {
  id?: string;
  title: string;
  category: NewsCategory;
  description: string;
  image: string;
  externalUrl: string;
  sourceName: string;
  embedType: EmbedType;
  embedUrl: string;
  embedCode: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string;
}

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  POLICY:       "Policy News",
  COMMUNITY:    "Community",
  ANNOUNCEMENT: "Announcement",
  MEDIA:        "In the Media",
  EVENT:        "Event",
  HIRING:       "Hiring",
  RESEARCH:     "Research",
};

const EMBED_LABELS: Record<EmbedType, string> = {
  "":          "No embed",
  youtube:     "YouTube video",
  twitter:     "Tweet / X post",
  instagram:   "Instagram post",
  linkedin:    "LinkedIn post",
  custom:      "Custom HTML embed (iframe, etc.)",
};

export function NewsItemForm({ initial, isNew }: { initial: NewsItemData; isNew: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<NewsItemData>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<NewsItemData>) => setData(d => ({ ...d, ...patch }));

  const save = async (status?: "DRAFT" | "PUBLISHED") => {
    if (!data.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    const payload = { ...data, status: status ?? data.status };
    try {
      if (isNew) {
        const r = await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const created = await r.json();
        router.push(`/admin/news/${created.id}`);
      } else {
        await fetch(`/api/news/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        router.refresh();
        set({ status: status ?? data.status });
      }
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this item permanently?")) return;
    setDeleting(true);
    await fetch(`/api/news/${data.id}`, { method: "DELETE" });
    router.push("/admin/news");
  };

  const input = "w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const label = "block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1";
  const card  = "bg-white border border-stone-200 rounded-xl p-5 space-y-4";

  return (
    <div className="space-y-5 max-w-2xl pb-16">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      {/* Core */}
      <div className={card}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Core</h2>
        <div>
          <label className={label}>Title *</label>
          <input className={input} value={data.title} onChange={e => set({ title: e.target.value })} placeholder="Policy Budget 2025 Analysis" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Category</label>
            <select className={input} value={data.category} onChange={e => set({ category: e.target.value as NewsCategory })}>
              {(Object.keys(CATEGORY_LABELS) as NewsCategory[]).map(k => (
                <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Source / Author</label>
            <input className={input} value={data.sourceName} onChange={e => set({ sourceName: e.target.value })} placeholder="The Hindu / @username" />
          </div>
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea className={input} rows={3} value={data.description} onChange={e => set({ description: e.target.value })} placeholder="A short summary of this item…" />
        </div>
      </div>

      {/* Media */}
      <div className={card}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Media &amp; links</h2>
        <ImageUploader
          label="Cover image"
          value={data.image || null}
          onChange={url => set({ image: url })}
          previewRatios={[
            { label: "Card (16:9)", ratio: 16 / 9 },
            { label: "Featured card (21:9)", ratio: 21 / 9 },
          ]}
        />
        <div>
          <label className={label}>External link (article / post / speech)</label>
          <input className={input} value={data.externalUrl} onChange={e => set({ externalUrl: e.target.value })} placeholder="https://..." />
        </div>
      </div>

      {/* Embed */}
      <div className={card}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Embed</h2>
        <div>
          <label className={label}>Embed type</label>
          <select className={input} value={data.embedType} onChange={e => set({ embedType: e.target.value as EmbedType, embedUrl: "", embedCode: "" })}>
            {(Object.keys(EMBED_LABELS) as EmbedType[]).map(k => (
              <option key={k} value={k}>{EMBED_LABELS[k]}</option>
            ))}
          </select>
        </div>

        {(data.embedType === "youtube" || data.embedType === "twitter" || data.embedType === "instagram" || data.embedType === "linkedin") && (
          <div>
            <label className={label}>
              {data.embedType === "youtube"   && "YouTube URL"}
              {data.embedType === "twitter"   && "Tweet / X post URL"}
              {data.embedType === "instagram" && "Instagram post URL"}
              {data.embedType === "linkedin"  && "LinkedIn post URL"}
            </label>
            <input className={input} value={data.embedUrl} onChange={e => set({ embedUrl: e.target.value })}
              placeholder={
                data.embedType === "youtube"   ? "https://www.youtube.com/watch?v=... or https://youtu.be/..." :
                data.embedType === "twitter"   ? "https://x.com/username/status/123..." :
                data.embedType === "instagram" ? "https://www.instagram.com/p/ABC123/" :
                                                 "https://www.linkedin.com/posts/..."
              }
            />
            <p className="text-xs text-stone-400 mt-1">
              {data.embedType === "youtube"   && "Paste the full YouTube video URL. The video will be embedded with a click-to-play thumbnail."}
              {data.embedType === "twitter"   && "Paste the full URL of the tweet. It will render as a live embedded tweet on the public page."}
              {data.embedType === "instagram" && "Paste the full URL of the Instagram post (e.g. /p/ABC123/). It will render as an embedded Instagram post."}
              {data.embedType === "linkedin"  && "Paste the LinkedIn post URL. Shown as a styled card (LinkedIn does not support direct embedding)."}
            </p>
          </div>
        )}

        {data.embedType === "custom" && (
          <div>
            <label className={label}>Custom HTML / iframe code</label>
            <textarea className={input} rows={5} value={data.embedCode} onChange={e => set({ embedCode: e.target.value })}
              placeholder='<iframe src="..." />' style={{ fontFamily: "monospace", fontSize: 13 }} />
            <p className="text-xs text-stone-400 mt-1">Paste any embed snippet. Will be sanitised before display.</p>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className={card}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Settings</h2>
        <div>
          <label className={label}>Publish date</label>
          <input type="datetime-local" className={input} value={data.publishedAt}
            onChange={e => set({ publishedAt: e.target.value })} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div onClick={() => set({ featured: !data.featured })}
            className={`relative w-10 h-6 rounded-full transition-colors ${data.featured ? "bg-amber-400" : "bg-stone-300"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${data.featured ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <span className="text-sm font-medium text-stone-700">Featured — pins this item to the top of the newsroom</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => save("PUBLISHED")} disabled={saving}
          className="bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-stone-700 transition disabled:opacity-50">
          {saving ? "Saving…" : data.status === "PUBLISHED" ? "Save" : "Publish"}
        </button>
        {data.status !== "DRAFT" && (
          <button onClick={() => save("DRAFT")} disabled={saving}
            className="text-sm font-medium px-5 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition">
            Revert to draft
          </button>
        )}
        {data.status === "DRAFT" && !isNew && (
          <button onClick={() => save("DRAFT")} disabled={saving}
            className="text-sm font-medium px-5 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition">
            Save draft
          </button>
        )}
        {!isNew && (
          <button onClick={del} disabled={deleting}
            className="ml-auto text-sm text-red-500 hover:text-red-700 transition">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
