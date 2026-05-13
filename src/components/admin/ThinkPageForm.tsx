"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "./Toast";

interface ThinkData {
  heading: string;
  subtitle: string;
  perPage: number;
}

export function ThinkPageForm({ initial }: { initial: ThinkData }) {
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ThinkData>(initial);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/page-configs/think", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      show("Saved", "success");
    } catch {
      show("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <div className="flex flex-col gap-8">
      {ToastEl}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Hero</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Heading</label>
            <input value={data.heading} onChange={e => setData(d => ({ ...d, heading: e.target.value }))} className={inputClass} placeholder="Think." />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <RichTextEditor value={data.subtitle} onChange={v => setData(d => ({ ...d, subtitle: v }))} placeholder="Long-form research, fortnightly op-eds…" minHeight={120} />
          </div>
        </div>
      </section>

      <section className="border-t border-stone-100 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Pagination</h2>
        <div style={{ maxWidth: 200 }}>
          <label className={labelClass}>Items per page</label>
          <input
            type="number" min={6} max={120} step={6}
            value={data.perPage}
            onChange={e => setData(d => ({ ...d, perPage: Math.max(6, parseInt(e.target.value) || 30) }))}
            className={inputClass}
          />
          <p className="text-xs text-stone-400 mt-1">Default: 30. Must be a multiple of 3 for clean rows.</p>
        </div>
      </section>

      <div className="pt-2 border-t border-stone-200">
        <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
          {saving ? "Saving…" : "Save Think page"}
        </button>
      </div>
    </div>
  );
}
