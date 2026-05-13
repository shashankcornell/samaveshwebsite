"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import type { FooterData, FooterLink } from "@/lib/footerData";

const inp = "w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
const lbl = "block text-sm font-medium text-stone-700 mb-1";
const sectionHead = "text-xs font-semibold uppercase tracking-wide text-stone-400 mb-4";

function LinkListEditor({
  label, value, onChange,
}: { label: string; value: FooterLink[]; onChange: (v: FooterLink[]) => void }) {
  return (
    <div>
      <p className={sectionHead}>{label}</p>
      <div className="flex flex-col gap-2">
        {value.map((l, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={l.label} onChange={e => { const n = [...value]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }} placeholder="Label" className={inp} style={{ maxWidth: 180 }} />
            <input value={l.href}  onChange={e => { const n = [...value]; n[i] = { ...n[i], href: e.target.value };  onChange(n); }} placeholder="/path or https://…" className={inp} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs px-1 shrink-0">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, { label: "", href: "" }])} className="text-xs text-stone-500 hover:text-stone-900 self-start mt-1">+ Add link</button>
      </div>
    </div>
  );
}

export function FooterPageForm({ initial }: { initial: FooterData }) {
  const { show, ToastEl } = useToast();
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState<FooterData>(initial);

  const set = <K extends keyof FooterData>(k: K, v: FooterData[K]) => setD(prev => ({ ...prev, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/page-configs/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) throw new Error();
      show("Saved", "success");
    } catch {
      show("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {ToastEl}

      {/* Editorial strip */}
      <section>
        <h2 className={sectionHead}>Top editorial strip</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className={lbl}>Location text</label>
            <input value={d.stripLocation} onChange={e => set("stripLocation", e.target.value)} className={inp} placeholder="NEW DELHI · INDIA" />
          </div>
          <div>
            <label className={lbl}>Next discourse line</label>
            <input value={d.stripDiscourse} onChange={e => set("stripDiscourse", e.target.value)} className={inp} placeholder="NEXT DISCOURSE · THU 30 APR · 19:00 IST" />
          </div>
          <div>
            <label className={lbl}>Issue / gazette line</label>
            <input value={d.stripIssueLine} onChange={e => set("stripIssueLine", e.target.value)} className={inp} placeholder="VOL I · ISSUE 01 NOW READING" />
          </div>
        </div>
      </section>

      {/* Mission column */}
      <section className="border-t border-stone-100 pt-8">
        <h2 className={sectionHead}>Mission column</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className={lbl}>Tagline (mono caps)</label>
            <input value={d.tagline} onChange={e => set("tagline", e.target.value)} className={inp} placeholder="EST. 2022 — DECODING POLICIES" />
          </div>
          <div>
            <label className={lbl}>Italic quote</label>
            <textarea value={d.quote} onChange={e => set("quote", e.target.value)} className={inp} rows={3} placeholder="An inclusive community for policy discourses…" />
          </div>
        </div>
      </section>

      {/* Nav columns */}
      <section className="border-t border-stone-100 pt-8">
        <h2 className={sectionHead}>Navigation columns</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <LinkListEditor label="01 / Read" value={d.readLinks} onChange={v => set("readLinks", v)} />
          <LinkListEditor label="02 / Act" value={d.actLinks} onChange={v => set("actLinks", v)} />
          <LinkListEditor label="03 / Explore" value={d.exploreLinks} onChange={v => set("exploreLinks", v)} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-stone-100 pt-8">
        <h2 className={sectionHead}>04 / Newsletter column</h2>
        <div>
          <label className={lbl}>Newsletter blurb</label>
          <textarea value={d.newsletterBlurb} onChange={e => set("newsletterBlurb", e.target.value)} className={inp} rows={3} />
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-stone-100 pt-8">
        <h2 className={sectionHead}>Contact</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={lbl}>Address (shown under VISIT)</label>
            <textarea value={d.address} onChange={e => set("address", e.target.value)} className={inp} rows={3} placeholder="New Delhi, India" />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input value={d.email} onChange={e => set("email", e.target.value)} className={inp} placeholder="hello@samavesh.in" />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input value={d.phone} onChange={e => set("phone", e.target.value)} className={inp} placeholder="+91 99107 29116" />
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="border-t border-stone-100 pt-8">
        <LinkListEditor label="Social links (pills)" value={d.socialLinks} onChange={v => set("socialLinks", v)} />
      </section>

      {/* Legal */}
      <section className="border-t border-stone-100 pt-8">
        <h2 className={sectionHead}>Bottom legal bar</h2>
        <div className="flex flex-col gap-4">
          <LinkListEditor label="Legal links" value={d.legalLinks} onChange={v => set("legalLinks", v)} />
          <div>
            <label className={lbl}>Right tagline</label>
            <input value={d.legalTagline} onChange={e => set("legalTagline", e.target.value)} className={inp} placeholder="BUILT IN NEW DELHI" />
          </div>
        </div>
      </section>

      <div className="pt-2 border-t border-stone-200">
        <button onClick={save} disabled={saving} className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60 transition">
          {saving ? "Saving…" : "Save footer"}
        </button>
      </div>
    </div>
  );
}
