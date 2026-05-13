"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "./Toast";

export interface ActStat { v: string; l: string }
export interface ActTimeline { w: string; t: string }
export interface ActSchedule { day: string; t: string; note: string }
export interface ActRole { r: string; l: string }

export type ActSideKind = "list" | "stat-grid" | "timeline" | "schedule" | "roles";

export interface ActTab {
  key: string;
  eyebrow: string;
  title: string;
  italic: string;
  body: string;
  cta: string;
  href: string;
  sideKind: ActSideKind;
  list: string[];
  stats: ActStat[];
  timeline: ActTimeline[];
  schedule: ActSchedule[];
  roles: ActRole[];
}

export interface ActData {
  heading: string;
  subtitle: string;
  tabs: ActTab[];
}

const EMPTY_TAB: ActTab = {
  key: "New Tab",
  eyebrow: "",
  title: "",
  italic: "",
  body: "<p></p>",
  cta: "",
  href: "",
  sideKind: "list",
  list: [""],
  stats: [{ v: "", l: "" }],
  timeline: [{ w: "", t: "" }],
  schedule: [{ day: "", t: "", note: "" }],
  roles: [{ r: "", l: "" }],
};

function StringListEditor({ items, onChange, labelA, labelB }: {
  items: string[];
  onChange: (items: string[]) => void;
  labelA?: string;
  labelB?: string;
}) {
  const inputClass = "flex-1 rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  void labelB;
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-xs text-stone-400 w-5 text-right">{i + 1}.</span>
          <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} className={inputClass} placeholder={labelA ?? "Item"} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="text-xs text-stone-500 hover:text-stone-900 self-start mt-1">+ Add item</button>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PairListEditor<T = any>({
  items, onChange, fields,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: { key: string; label: string; flex?: number }[];
}) {
  const inputClass = "rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const empty = Object.fromEntries(fields.map((f) => [f.key, ""])) as T;
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-xs text-stone-400 w-5 text-right">{i + 1}.</span>
          {fields.map((f) => (
            <input
              key={f.key}
              value={((item as Record<string, unknown>)[f.key] as string) ?? ""}
              placeholder={f.label}
              onChange={(e) => { const n = [...items]; n[i] = { ...(n[i] as object), [f.key]: e.target.value } as T; onChange(n); }}
              className={inputClass}
              style={{ flex: f.flex ?? 1 }}
            />
          ))}
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { ...empty }])} className="text-xs text-stone-500 hover:text-stone-900 self-start mt-1">+ Add row</button>
    </div>
  );
}

function TabEditor({ tab, onChange, onDelete, canDelete }: {
  tab: ActTab;
  onChange: (tab: ActTab) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof ActTab, val: ActTab[keyof ActTab]) => onChange({ ...tab, [key]: val });
  const inputClass = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const labelClass = "block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wide";

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-stone-50 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-stone-700">{tab.key || "Untitled tab"}</span>
          <span className="text-xs text-stone-400">{tab.eyebrow || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-xs text-red-400 hover:text-red-600 px-2">Delete</button>
          )}
          <span className="text-stone-400 text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div className="p-5 flex flex-col gap-5 border-t border-stone-100">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Tab label</label>
              <input value={tab.key} onChange={(e) => set("key", e.target.value)} className={inputClass} placeholder="Tab name" />
            </div>
            <div>
              <label className={labelClass}>Eyebrow (mono caps label)</label>
              <input value={tab.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className={inputClass} placeholder="WEEKLY ONLINE DISCOURSES" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Title</label>
            <input value={tab.title} onChange={(e) => set("title", e.target.value)} className={inputClass} placeholder="Sit at the table." />
          </div>

          <div>
            <label className={labelClass}>Italic subtitle</label>
            <input value={tab.italic} onChange={(e) => set("italic", e.target.value)} className={inputClass} placeholder="Every Saturday, 7:00 PM IST." />
          </div>

          <div>
            <label className={labelClass}>Body text</label>
            <RichTextEditor value={tab.body} onChange={(v) => set("body", v)} placeholder="Describe this section…" minHeight={160} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>CTA label</label>
              <input value={tab.cta} onChange={(e) => set("cta", e.target.value)} className={inputClass} placeholder="Read the ten rules" />
            </div>
            <div>
              <label className={labelClass}>CTA URL or mailto</label>
              <input value={tab.href} onChange={(e) => set("href", e.target.value)} className={inputClass} placeholder="mailto:hello@samavesh.in" />
            </div>
          </div>

          {/* Side panel */}
          <div>
            <label className={labelClass}>Side panel type</label>
            <select
              value={tab.sideKind}
              onChange={(e) => set("sideKind", e.target.value as ActSideKind)}
              className={`${inputClass} w-48`}
            >
              <option value="list">Numbered list</option>
              <option value="stat-grid">Stat grid (2×2)</option>
              <option value="timeline">Timeline</option>
              <option value="schedule">Schedule</option>
              <option value="roles">Roles / jobs</option>
            </select>
          </div>

          {tab.sideKind === "list" && (
            <div>
              <label className={labelClass}>List items</label>
              <StringListEditor items={tab.list} onChange={(v) => set("list", v)} labelA="List item" />
            </div>
          )}
          {tab.sideKind === "stat-grid" && (
            <div>
              <label className={labelClass}>Stats (value + label)</label>
              <PairListEditor<ActStat>
                items={tab.stats}
                onChange={(v) => set("stats", v)}
                fields={[{ key: "v", label: "Value e.g. 11", flex: 0.6 }, { key: "l", label: "Label e.g. Cities" }]}
              />
            </div>
          )}
          {tab.sideKind === "timeline" && (
            <div>
              <label className={labelClass}>Timeline items</label>
              <PairListEditor<ActTimeline>
                items={tab.timeline}
                onChange={(v) => set("timeline", v)}
                fields={[{ key: "w", label: "Week e.g. W 01–02", flex: 0.8 }, { key: "t", label: "Description" }]}
              />
            </div>
          )}
          {tab.sideKind === "schedule" && (
            <div>
              <label className={labelClass}>Schedule items</label>
              <PairListEditor<ActSchedule>
                items={tab.schedule}
                onChange={(v) => set("schedule", v)}
                fields={[{ key: "day", label: "Day", flex: 0.5 }, { key: "t", label: "Title" }, { key: "note", label: "Note" }]}
              />
            </div>
          )}
          {tab.sideKind === "roles" && (
            <div>
              <label className={labelClass}>Roles</label>
              <PairListEditor<ActRole>
                items={tab.roles}
                onChange={(v) => set("roles", v)}
                fields={[{ key: "r", label: "Role name" }, { key: "l", label: "Location / type", flex: 0.7 }]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ActPageForm({ initial }: { initial: ActData }) {
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ActData>(initial);

  function setTop(key: keyof Pick<ActData, "heading" | "subtitle">, val: string) {
    setData((d) => ({ ...d, [key]: val }));
  }

  function updateTab(i: number, tab: ActTab) {
    setData((d) => { const tabs = [...d.tabs]; tabs[i] = tab; return { ...d, tabs }; });
  }

  function deleteTab(i: number) {
    setData((d) => ({ ...d, tabs: d.tabs.filter((_, j) => j !== i) }));
  }

  function addTab() {
    setData((d) => ({ ...d, tabs: [...d.tabs, { ...EMPTY_TAB, key: `Tab ${d.tabs.length + 1}` }] }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/page-configs/act", {
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
            <input value={data.heading} onChange={(e) => setTop("heading", e.target.value)} className={inputClass} placeholder="Act." />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <RichTextEditor value={data.subtitle} onChange={(v) => setTop("subtitle", v)} placeholder="Five ways to step into the room…" minHeight={100} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Tabs</h2>
        <div className="flex flex-col gap-3">
          {data.tabs.map((tab, i) => (
            <TabEditor
              key={i}
              tab={tab}
              onChange={(t) => updateTab(i, t)}
              onDelete={() => deleteTab(i)}
              canDelete={data.tabs.length > 1}
            />
          ))}
          <button type="button" onClick={addTab} className="rounded-md border border-dashed border-stone-300 px-4 py-2 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition">
            + Add tab
          </button>
        </div>
      </section>

      <div className="pt-2 border-t border-stone-200">
        <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
          {saving ? "Saving…" : "Save Act page"}
        </button>
      </div>
    </div>
  );
}
