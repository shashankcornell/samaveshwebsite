"use client";

import { useState, useEffect } from "react";
import { useToast } from "./Toast";

interface ContentOption {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  contentType: { name: string; slug: string };
}

interface SlotItem extends ContentOption {
  order: number;
}

interface LandingConfigFormProps {
  initialRowCount: number;
  initialIsManual: boolean;
  initialSlots: SlotItem[];
  allContent: ContentOption[];
}

export function LandingConfigForm({
  initialRowCount,
  initialIsManual,
  initialSlots,
  allContent,
}: LandingConfigFormProps) {
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [rowCount, setRowCount] = useState(initialRowCount);
  const [isManual, setIsManual] = useState(initialIsManual);
  const [slots, setSlots] = useState<SlotItem[]>(initialSlots);
  const [search, setSearch] = useState("");

  const limit = rowCount * 3;

  // Keep slots capped when rowCount changes
  useEffect(() => {
    setSlots((s) => s.slice(0, limit));
  }, [limit]);

  const slotIds = new Set(slots.map((s) => s.id));

  const filtered = allContent.filter(
    (c) =>
      !slotIds.has(c.id) &&
      (search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.contentType.name.toLowerCase().includes(search.toLowerCase()))
  );

  function addToSlot(item: ContentOption) {
    if (slots.length >= limit) {
      show(`Limit reached (${limit} cards for ${rowCount} rows)`, "error");
      return;
    }
    setSlots((s) => [...s, { ...item, order: s.length }]);
  }

  function removeSlot(id: string) {
    setSlots((s) =>
      s
        .filter((x) => x.id !== id)
        .map((x, i) => ({ ...x, order: i }))
    );
  }

  function moveSlot(idx: number, dir: "up" | "down") {
    setSlots((s) => {
      const next = [...s];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return s;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((x, i) => ({ ...x, order: i }));
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/landing-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowCount,
          isManual,
          ...(isManual ? { slots: slots.map((s) => ({ contentId: s.id, order: s.order })) } : {}),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      show("Landing page config saved", "success");
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

      {/* Settings */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Display Settings</h2>
        <div className="flex flex-col gap-4 max-w-sm">
          <div>
            <label className={labelClass}>Number of rows</label>
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className={inputClass}
            >
              {[8, 9, 10, 11, 12, 14, 16, 20].map((n) => (
                <option key={n} value={n}>{n} rows — {n * 3} cards</option>
              ))}
            </select>
            <p className="text-xs text-stone-400 mt-1">Minimum 8 rows (24 cards). Each row has 3 cards.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isManual"
              checked={isManual}
              onChange={(e) => setIsManual(e.target.checked)}
              className="h-4 w-4 accent-stone-900"
            />
            <label htmlFor="isManual" className="text-sm font-medium text-stone-700">
              Manual override — use my selected cards instead of auto-selection
            </label>
          </div>
        </div>
      </section>

      {/* Auto mode info */}
      {!isManual && (
        <section className="rounded-lg border border-stone-200 bg-stone-50 p-5">
          <p className="text-sm font-medium text-stone-700 mb-1">Auto-selection is active</p>
          <p className="text-sm text-stone-500">
            The system will automatically pick {limit} cards ensuring at least 3 per content type,
            filling remaining slots with the most recent content, then randomly shuffling the order.
            Enable manual override above to choose cards yourself.
          </p>
        </section>
      )}

      {/* Manual slot builder */}
      {isManual && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
              Selected Cards ({slots.length} / {limit})
            </h2>
            {slots.length > 0 && (
              <button
                onClick={() => setSlots([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selected slots */}
          {slots.length > 0 && (
            <div className="rounded-lg border border-stone-200 overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-stone-600 w-12">#</th>
                    <th className="px-4 py-2 text-left font-medium text-stone-600">Title</th>
                    <th className="px-4 py-2 text-left font-medium text-stone-600">Type</th>
                    <th className="px-4 py-2 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s, i) => (
                    <tr key={s.id} className="border-b border-stone-100">
                      <td className="px-4 py-2 text-stone-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-stone-800 truncate max-w-xs">{s.title}</td>
                      <td className="px-4 py-2 text-xs text-stone-500">{s.contentType.name}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => moveSlot(i, "up")} disabled={i === 0} className="text-stone-300 hover:text-stone-600 disabled:opacity-30 text-xs">▲</button>
                          <button onClick={() => moveSlot(i, "down")} disabled={i === slots.length - 1} className="text-stone-300 hover:text-stone-600 disabled:opacity-30 text-xs">▼</button>
                          <button onClick={() => removeSlot(s.id)} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {slots.length < limit && (
            <>
              <h3 className="text-sm font-medium text-stone-700 mb-2">
                Add content ({limit - slots.length} remaining)
              </h3>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} mb-3`}
                placeholder="Search by title or type…"
              />
              <div className="rounded-lg border border-stone-200 overflow-hidden max-h-96 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-stone-400 text-center">No results.</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                          <td className="px-4 py-2 font-medium text-stone-800">{c.title}</td>
                          <td className="px-4 py-2 text-xs text-stone-500">{c.contentType.name}</td>
                          <td className="px-4 py-2 text-xs text-stone-400">
                            {c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => addToSlot(c)}
                              className="text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded px-2 py-0.5 hover:border-stone-400 transition"
                            >
                              + Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <div className="pt-2 border-t border-stone-200">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition"
        >
          {saving ? "Saving…" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
