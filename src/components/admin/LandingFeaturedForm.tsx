"use client";

import { useState } from "react";

export interface FeaturedConfig {
  mode: "auto" | "content" | "news";
  contentId: string;
  newsId: string;
  overrideTitle: string;
  overrideDescription: string;
  ctaEnabled: boolean;
  ctaLabel: string;
  ctaUrl: string;
}

interface ContentOption {
  id: string;
  title: string;
  publishedAt: string | null;
  contentType: { name: string };
}

interface NewsOption {
  id: string;
  title: string;
  publishedAt: string | null;
  category: string;
}

interface Props {
  initial: FeaturedConfig;
  allContent: ContentOption[];
  allNews: NewsOption[];
}

const DEFAULT: FeaturedConfig = {
  mode: "auto",
  contentId: "",
  newsId: "",
  overrideTitle: "",
  overrideDescription: "",
  ctaEnabled: true,
  ctaLabel: "Read more",
  ctaUrl: "",
};

const input = "w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
const label = "block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1";

export function LandingFeaturedForm({ initial, allContent, allNews }: Props) {
  const [cfg, setCfg] = useState<FeaturedConfig>({ ...DEFAULT, ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<FeaturedConfig>) => {
    setCfg(c => ({ ...c, ...patch }));
    setSaved(false);
  };

  async function save() {
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/landing-featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!r.ok) throw new Error("Save failed");
      setSaved(true);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const cardClass = "bg-white border border-stone-200 rounded-xl p-5 space-y-4";
  const radioClass = (active: boolean) =>
    `flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${active ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-300"}`;

  const selectedContent = allContent.find(c => c.id === cfg.contentId);
  const selectedNews = allNews.find(n => n.id === cfg.newsId);

  return (
    <div className="space-y-5 max-w-2xl">
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

      {/* Source */}
      <div className={cardClass}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Source</h2>
        <p className="text-xs text-stone-400">Choose what appears in the Featured section on the homepage.</p>

        <div className="space-y-2">
          <label className={radioClass(cfg.mode === "auto")} onClick={() => set({ mode: "auto" })}>
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${cfg.mode === "auto" ? "border-stone-900" : "border-stone-300"}`}>
              {cfg.mode === "auto" && <div className="w-2 h-2 rounded-full bg-stone-900" />}
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">Auto — latest published content</div>
              <div className="text-xs text-stone-400 mt-0.5">Always shows the most recently published article, paper, or podcast.</div>
            </div>
          </label>

          <label className={radioClass(cfg.mode === "content")} onClick={() => set({ mode: "content" })}>
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${cfg.mode === "content" ? "border-stone-900" : "border-stone-300"}`}>
              {cfg.mode === "content" && <div className="w-2 h-2 rounded-full bg-stone-900" />}
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">Content item</div>
              <div className="text-xs text-stone-400 mt-0.5">Pin a specific article, discourse, podcast, or paper.</div>
            </div>
          </label>

          <label className={radioClass(cfg.mode === "news")} onClick={() => set({ mode: "news" })}>
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${cfg.mode === "news" ? "border-stone-900" : "border-stone-300"}`}>
              {cfg.mode === "news" && <div className="w-2 h-2 rounded-full bg-stone-900" />}
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">News / Announcement</div>
              <div className="text-xs text-stone-400 mt-0.5">Feature a news item — supports image, YouTube embed, tweet, or any media.</div>
            </div>
          </label>
        </div>

        {/* Content picker */}
        {cfg.mode === "content" && (
          <div className="pt-1">
            <label className={label}>Select content item</label>
            <select className={input} value={cfg.contentId} onChange={e => set({ contentId: e.target.value })}>
              <option value="">— choose —</option>
              {allContent.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.contentType.name}] {c.title}
                </option>
              ))}
            </select>
            {selectedContent && (
              <p className="text-xs text-stone-400 mt-1.5">
                {selectedContent.contentType.name} · {selectedContent.publishedAt ? new Date(selectedContent.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
              </p>
            )}
          </div>
        )}

        {/* News picker */}
        {cfg.mode === "news" && (
          <div className="pt-1">
            <label className={label}>Select news item</label>
            <select className={input} value={cfg.newsId} onChange={e => set({ newsId: e.target.value })}>
              <option value="">— choose —</option>
              {allNews.map(n => (
                <option key={n.id} value={n.id}>
                  [{n.category}] {n.title}
                </option>
              ))}
            </select>
            {selectedNews && (
              <p className="text-xs text-stone-400 mt-1.5">
                {selectedNews.category} · {selectedNews.publishedAt ? new Date(selectedNews.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Text overrides */}
      <div className={cardClass}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Text overrides <span className="font-normal normal-case text-stone-400">— optional</span></h2>
        <p className="text-xs text-stone-400">Leave blank to use the item's own title and description.</p>
        <div>
          <label className={label}>Title override</label>
          <input className={input} value={cfg.overrideTitle} onChange={e => set({ overrideTitle: e.target.value })} placeholder="Leave blank to use item title" />
        </div>
        <div>
          <label className={label}>Description override</label>
          <textarea className={input} rows={3} value={cfg.overrideDescription} onChange={e => set({ overrideDescription: e.target.value })} placeholder="Leave blank to use item excerpt / description" />
        </div>
      </div>

      {/* CTA */}
      <div className={cardClass}>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide">CTA Button</h2>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div onClick={() => set({ ctaEnabled: !cfg.ctaEnabled })}
            className={`relative w-10 h-6 rounded-full transition-colors ${cfg.ctaEnabled ? "bg-amber-400" : "bg-stone-300"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${cfg.ctaEnabled ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <span className="text-sm font-medium text-stone-700">Show CTA button</span>
        </label>

        {cfg.ctaEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Button label</label>
              <input className={input} value={cfg.ctaLabel} onChange={e => set({ ctaLabel: e.target.value })} placeholder="Read more" />
            </div>
            <div>
              <label className={label}>URL override <span className="font-normal normal-case text-stone-400">(optional)</span></label>
              <input className={input} value={cfg.ctaUrl} onChange={e => set({ ctaUrl: e.target.value })} placeholder="Leave blank to use item link" />
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-stone-700 transition disabled:opacity-50">
          {saving ? "Saving…" : "Save featured config"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>
    </div>
  );
}
