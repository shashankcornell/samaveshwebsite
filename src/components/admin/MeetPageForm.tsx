"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "./Toast";

export type MeetSectionType = "stats" | "people" | "chapters" | "cta" | "text";
export type PeopleDisplayMode = "core" | "list" | "compact" | "dense" | "discussants";

export interface StatItem    { n: string; l: string }
export interface ChapterItem { city: string; count: string }

export interface MeetSection {
  id: string;
  type: MeetSectionType;
  visible: boolean;
  order: number;

  // header (all except stats/cta)
  sectionNumber?: string;  // e.g. "01 / CORE TEAM"
  title?: string;
  subtitle?: string;
  bgVariant?: "default" | "cream" | "paper";

  // people
  role?: string;
  displayMode?: PeopleDisplayMode;

  // stats
  stats?: StatItem[];

  // chapters
  chapters?: ChapterItem[];
  chaptersLabel?: string; // suffix after count, e.g. "DISCUSSANTS"

  // cta
  ctaHeading?: string;
  ctaBody?: string;
  ctaLabel?: string;
  ctaHref?: string;

  // text
  textBody?: string;
}

export interface MeetData {
  headingEyebrow: string;
  heading: string;
  subtitle: string;
  sections: MeetSection[];
}

const PROFILE_ROLES = [
  { value: "TEAM_MEMBER",    label: "Team Member" },
  { value: "ADVISORY_BOARD", label: "Advisory Board" },
  { value: "FELLOW",         label: "Fellow / Mentor" },
  { value: "PRESENTER",      label: "Presenter / Extern" },
  { value: "DISCUSSANT",     label: "Discussant" },
  { value: "ADMIN",          label: "Admin" },
];

const DISPLAY_MODES: { value: PeopleDisplayMode; label: string; desc: string }[] = [
  { value: "core",        label: "Core team",   desc: "4-col, 120px avatar, name + role + city" },
  { value: "list",        label: "List rows",   desc: "4-col, 56px avatar, name + role inline" },
  { value: "compact",     label: "Compact",     desc: "4-col, 48px avatar, name + role" },
  { value: "dense",       label: "Dense grid",  desc: "6-col, 48px avatar, name only" },
  { value: "discussants", label: "Discussants", desc: "Flex-wrap, 34px avatar + name tag" },
];

const BG_VARIANTS = [
  { value: "default", label: "White" },
  { value: "paper",   label: "Paper (off-white)" },
  { value: "cream",   label: "Cream (hero-cream)" },
];

const SECTION_TYPE_LABELS: Record<MeetSectionType, string> = {
  stats:    "Stats strip",
  people:   "People section",
  chapters: "City chapters",
  cta:      "Join / CTA",
  text:     "Rich text",
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function SectionRow({
  section, onChange, onDelete, onMove, isFirst, isLast,
}: {
  section: MeetSection;
  onChange: (s: MeetSection) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof MeetSection>(k: K, v: MeetSection[K]) => onChange({ ...section, [k]: v });

  const inp = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const lbl = "block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1";

  return (
    <div className={`border rounded-lg overflow-hidden ${section.visible ? "border-stone-200" : "border-stone-100 opacity-55"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 select-none">
        <div className="flex flex-col gap-0.5">
          <button type="button" disabled={isFirst} onClick={() => onMove(-1)} className="text-stone-400 hover:text-stone-700 disabled:opacity-20 text-xs">▲</button>
          <button type="button" disabled={isLast}  onClick={() => onMove(1)}  className="text-stone-400 hover:text-stone-700 disabled:opacity-20 text-xs">▼</button>
        </div>
        <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <span className="text-xs font-mono px-2 py-0.5 bg-stone-200 rounded text-stone-600">{SECTION_TYPE_LABELS[section.type]}</span>
          <span className="text-sm font-medium text-stone-700 truncate">
            {section.type === "stats"    ? "Stats strip"
           : section.type === "cta"     ? (section.ctaHeading ?? "CTA")
           : section.type === "chapters" ? "City chapters"
           : (section.sectionNumber ?? section.title ?? "Untitled")}
          </span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={section.visible} onChange={e => set("visible", e.target.checked)} className="h-4 w-4 accent-stone-900" />
          <span className="text-xs text-stone-500">{section.visible ? "Visible" : "Hidden"}</span>
        </label>
        <button type="button" onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
        <button type="button" onClick={() => setOpen(o => !o)} className="text-stone-400 text-sm w-5">{open ? "▲" : "▼"}</button>
      </div>

      {open && (
        <div className="p-5 border-t border-stone-100 flex flex-col gap-4">

          {/* Background variant (all except stats) */}
          {section.type !== "stats" && (
            <div>
              <label className={lbl}>Background</label>
              <select value={section.bgVariant ?? "default"} onChange={e => set("bgVariant", e.target.value as MeetSection["bgVariant"])} className={`${inp} max-w-xs`}>
                {BG_VARIANTS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          )}

          {/* ── STATS ── */}
          {section.type === "stats" && (
            <div>
              <label className={lbl}>Stats (number + label)</label>
              {(section.stats ?? []).map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={s.n} onChange={e => { const ss = [...(section.stats ?? [])]; ss[i] = { ...ss[i], n: e.target.value }; set("stats", ss); }} placeholder="240+" className={inp} style={{ maxWidth: 100 }} />
                  <input value={s.l} onChange={e => { const ss = [...(section.stats ?? [])]; ss[i] = { ...ss[i], l: e.target.value }; set("stats", ss); }} placeholder="Active discussants" className={inp} />
                  <button type="button" onClick={() => set("stats", (section.stats ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => set("stats", [...(section.stats ?? []), { n: "", l: "" }])} className="text-xs text-stone-500 hover:text-stone-900 mt-1">+ Add stat</button>
            </div>
          )}

          {/* ── PEOPLE ── */}
          {section.type === "people" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={lbl}>Section number label</label>
                  <input value={section.sectionNumber ?? ""} onChange={e => set("sectionNumber", e.target.value)} className={inp} placeholder="01 / CORE TEAM" />
                </div>
                <div>
                  <label className={lbl}>Filter by role</label>
                  <select value={section.role ?? ""} onChange={e => set("role", e.target.value)} className={inp}>
                    <option value="">All roles</option>
                    {PROFILE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Section heading</label>
                <input value={section.title ?? ""} onChange={e => set("title", e.target.value)} className={inp} placeholder="The people who keep the calendar." />
              </div>
              <div>
                <label className={lbl}>Section subtext</label>
                <input value={section.subtitle ?? ""} onChange={e => set("subtitle", e.target.value)} className={inp} placeholder="Programme, editorial, operations…" />
              </div>
              <div>
                <label className={lbl}>Display mode</label>
                <div className="flex flex-col gap-2">
                  {DISPLAY_MODES.map(m => (
                    <label key={m.value} className="flex items-start gap-2 cursor-pointer">
                      <input type="radio" name={`dm-${section.id}`} value={m.value} checked={(section.displayMode ?? "core") === m.value} onChange={() => set("displayMode", m.value)} className="mt-0.5 accent-stone-900" />
                      <span>
                        <span className="text-sm font-medium text-stone-700">{m.label}</span>
                        <span className="text-xs text-stone-400 ml-2">{m.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── CHAPTERS ── */}
          {section.type === "chapters" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={lbl}>Section number label</label>
                  <input value={section.sectionNumber ?? ""} onChange={e => set("sectionNumber", e.target.value)} className={inp} placeholder="05 / CITY CHAPTERS" />
                </div>
                <div>
                  <label className={lbl}>Count suffix</label>
                  <input value={section.chaptersLabel ?? "DISCUSSANTS"} onChange={e => set("chaptersLabel", e.target.value)} className={inp} placeholder="DISCUSSANTS" />
                </div>
              </div>
              <div>
                <label className={lbl}>Section heading</label>
                <input value={section.title ?? ""} onChange={e => set("title", e.target.value)} className={inp} placeholder="Where the discourse happens." />
              </div>
              <div>
                <label className={lbl}>Section subtext</label>
                <input value={section.subtitle ?? ""} onChange={e => set("subtitle", e.target.value)} className={inp} placeholder="Local conveners run a monthly reading…" />
              </div>
              <div>
                <label className={lbl}>Cities</label>
                {(section.chapters ?? []).map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={c.city} onChange={e => { const cc = [...(section.chapters ?? [])]; cc[i] = { ...cc[i], city: e.target.value }; set("chapters", cc); }} placeholder="Delhi" className={inp} />
                    <input value={c.count} onChange={e => { const cc = [...(section.chapters ?? [])]; cc[i] = { ...cc[i], count: e.target.value }; set("chapters", cc); }} placeholder="42" className={inp} style={{ maxWidth: 80 }} />
                    <button type="button" onClick={() => set("chapters", (section.chapters ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => set("chapters", [...(section.chapters ?? []), { city: "", count: "" }])} className="text-xs text-stone-500 hover:text-stone-900 mt-1">+ Add city</button>
              </div>
            </>
          )}

          {/* ── CTA ── */}
          {section.type === "cta" && (
            <>
              <div>
                <label className={lbl}>Heading</label>
                <input value={section.ctaHeading ?? ""} onChange={e => set("ctaHeading", e.target.value)} className={inp} placeholder="Want to join the room?" />
              </div>
              <div>
                <label className={lbl}>Body</label>
                <RichTextEditor value={section.ctaBody ?? ""} onChange={v => set("ctaBody", v)} placeholder="We open externships twice a year…" minHeight={120} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={lbl}>CTA label</label>
                  <input value={section.ctaLabel ?? ""} onChange={e => set("ctaLabel", e.target.value)} className={inp} placeholder="See ways to act" />
                </div>
                <div>
                  <label className={lbl}>CTA URL</label>
                  <input value={section.ctaHref ?? ""} onChange={e => set("ctaHref", e.target.value)} className={inp} placeholder="/act" />
                </div>
              </div>
            </>
          )}

          {/* ── TEXT ── */}
          {section.type === "text" && (
            <>
              <div>
                <label className={lbl}>Title (optional)</label>
                <input value={section.title ?? ""} onChange={e => set("title", e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Content</label>
                <RichTextEditor value={section.textBody ?? ""} onChange={v => set("textBody", v)} minHeight={160} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function MeetPageForm({ initial }: { initial: MeetData }) {
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<MeetData>(initial);

  const setTop = <K extends keyof Pick<MeetData, "headingEyebrow" | "heading" | "subtitle">>(k: K, v: string) =>
    setData(d => ({ ...d, [k]: v }));

  function updateSection(i: number, s: MeetSection) {
    setData(d => { const ss = [...d.sections]; ss[i] = s; return { ...d, sections: ss }; });
  }
  function deleteSection(i: number) {
    setData(d => ({ ...d, sections: d.sections.filter((_, j) => j !== i) }));
  }
  function moveSection(i: number, dir: -1 | 1) {
    setData(d => {
      const ss = [...d.sections];
      const j = i + dir;
      if (j < 0 || j >= ss.length) return d;
      [ss[i], ss[j]] = [ss[j], ss[i]];
      return { ...d, sections: ss.map((s, idx) => ({ ...s, order: idx })) };
    });
  }

  const DEFAULTS: Record<MeetSectionType, Partial<MeetSection>> = {
    stats:    { stats: [{ n: "", l: "" }] },
    people:   { sectionNumber: "", title: "", subtitle: "", role: "TEAM_MEMBER", displayMode: "core", bgVariant: "default" },
    chapters: { sectionNumber: "", title: "", subtitle: "", chapters: [{ city: "", count: "" }], chaptersLabel: "DISCUSSANTS", bgVariant: "cream" },
    cta:      { ctaHeading: "Want to join the room?", ctaBody: "", ctaLabel: "See ways to act", ctaHref: "/act", bgVariant: "default" },
    text:     { title: "", textBody: "", bgVariant: "default" },
  };

  function addSection(type: MeetSectionType) {
    setData(d => ({
      ...d,
      sections: [...d.sections, { id: uid(), type, visible: true, order: d.sections.length, ...DEFAULTS[type] } as MeetSection],
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/page-configs/meet", {
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

  const inp = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const lbl = "block text-sm font-medium text-stone-700 mb-1";

  return (
    <div className="flex flex-col gap-8">
      {ToastEl}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">Hero</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={lbl}>Eyebrow (mono caps)</label>
            <input value={data.headingEyebrow} onChange={e => setTop("headingEyebrow", e.target.value)} className={inp} placeholder="THE COMMUNITY" />
          </div>
          <div>
            <label className={lbl}>Heading</label>
            <textarea value={data.heading} onChange={e => setTop("heading", e.target.value)} className={inp} rows={3} placeholder="We are not an institution. We are a room." />
          </div>
          <div>
            <label className={lbl}>Subtitle</label>
            <RichTextEditor value={data.subtitle} onChange={v => setTop("subtitle", v)} placeholder="Samavesh is held up by a small core…" minHeight={100} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Sections</h2>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(SECTION_TYPE_LABELS) as MeetSectionType[]).map(type => (
              <button key={type} type="button" onClick={() => addSection(type)}
                className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition">
                + {SECTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {data.sections.length === 0 && (
            <p className="text-sm text-stone-400 py-6 text-center border border-dashed border-stone-200 rounded-lg">
              No sections — add one above.
            </p>
          )}
          {data.sections.map((s, i) => (
            <SectionRow key={s.id} section={s} onChange={u => updateSection(i, u)}
              onDelete={() => deleteSection(i)} onMove={dir => moveSection(i, dir)}
              isFirst={i === 0} isLast={i === data.sections.length - 1} />
          ))}
        </div>
      </section>

      <div className="pt-2 border-t border-stone-200">
        <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
          {saving ? "Saving…" : "Save Meet page"}
        </button>
      </div>
    </div>
  );
}
