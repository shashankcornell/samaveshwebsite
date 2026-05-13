"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "./Toast";

export interface SimplePageData {
  heading: string;
  subheading: string;
  body: string;
  lastUpdated: string;
}

export function SimplePageForm({ slug, initial }: { slug: string; initial: SimplePageData }) {
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState<SimplePageData>(initial);

  const inp = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const lbl = "block text-sm font-medium text-stone-700 mb-1";

  async function save() {
    setSaving(true);
    try {
      const payload = { ...d, lastUpdated: new Date().toISOString() };
      const res = await fetch(`/api/page-configs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setD(payload);
      show("Saved", "success");
    } catch {
      show("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {ToastEl}
      <div>
        <label className={lbl}>Page heading</label>
        <input value={d.heading} onChange={e => setD(p => ({ ...p, heading: e.target.value }))} className={inp} />
      </div>
      <div>
        <label className={lbl}>Subheading / intro (optional)</label>
        <input value={d.subheading} onChange={e => setD(p => ({ ...p, subheading: e.target.value }))} className={inp} />
      </div>
      <div>
        <label className={lbl}>Body content</label>
        <RichTextEditor value={d.body} onChange={v => setD(p => ({ ...p, body: v }))} minHeight={400} />
      </div>
      <div className="pt-2 border-t border-stone-200">
        <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
          {saving ? "Saving…" : "Save page"}
        </button>
        {d.lastUpdated && (
          <span className="ml-4 text-xs text-stone-400">
            Last saved {new Date(d.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}
