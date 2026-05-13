"use client";

import { useState } from "react";

export interface JobListing {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  applyLink: string;
}

export interface CareersData {
  heading: string;
  subtitle: string;
  isHiring: boolean;
  notHiringMessage: string;
  jobs: JobListing[];
}

const DEFAULT_DATA: CareersData = {
  heading: "Careers.",
  subtitle: "Join a community that believes policy should be decoded, debated, and democratised.",
  isHiring: false,
  notHiringMessage: "We are not hiring at the moment. We do, however, welcome motivated individuals to contribute through our externship and volunteer programmes.",
  jobs: [],
};

function newJob(): JobListing {
  return { id: crypto.randomUUID(), title: "", department: "", type: "Full-time", location: "New Delhi / Remote", description: "", applyLink: "" };
}

export function CareersPageForm({ slug, initial }: { slug: string; initial: CareersData }) {
  const [data, setData] = useState<CareersData>({ ...DEFAULT_DATA, ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<CareersData>) => { setData(d => ({ ...d, ...patch })); setSaved(false); };

  const updateJob = (id: string, patch: Partial<JobListing>) =>
    set({ jobs: data.jobs.map(j => j.id === id ? { ...j, ...patch } : j) });

  const removeJob = (id: string) => set({ jobs: data.jobs.filter(j => j.id !== id) });

  const save = async () => {
    setSaving(true);
    await fetch(`/api/page-configs/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    setSaved(true);
  };

  const input = "w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  const label = "block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1";
  const section = "bg-white border border-stone-200 rounded-xl p-6 space-y-4";

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Heading & subtitle */}
      <div className={section}>
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Page header</h2>
        <div>
          <label className={label}>Heading</label>
          <input className={input} value={data.heading} onChange={e => set({ heading: e.target.value })} />
        </div>
        <div>
          <label className={label}>Subtitle</label>
          <textarea className={input} rows={2} value={data.subtitle} onChange={e => set({ subtitle: e.target.value })} />
        </div>
      </div>

      {/* Hiring toggle */}
      <div className={section}>
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Hiring status</h2>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set({ isHiring: !data.isHiring })}
            className={`relative w-10 h-6 rounded-full transition-colors ${data.isHiring ? "bg-green-500" : "bg-stone-300"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${data.isHiring ? "translate-x-5" : "translate-x-1"}`} />
          </div>
          <span className="text-sm font-medium text-stone-700">{data.isHiring ? "Currently hiring" : "Not hiring"}</span>
        </label>

        <div>
          <label className={label}>Message shown when not hiring</label>
          <textarea className={input} rows={3} value={data.notHiringMessage} onChange={e => set({ notHiringMessage: e.target.value })} />
        </div>
      </div>

      {/* Job listings */}
      <div className={section}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Job listings</h2>
          <button onClick={() => set({ jobs: [...data.jobs, newJob()] })} className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition">
            + Add role
          </button>
        </div>

        {data.jobs.length === 0 && (
          <p className="text-sm text-stone-400 italic">No roles added yet. Toggle hiring on and add a role above.</p>
        )}

        {data.jobs.map((job, i) => (
          <div key={job.id} className="border border-stone-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Role {i + 1}</span>
              <button onClick={() => removeJob(job.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Job title</label>
                <input className={input} value={job.title} onChange={e => updateJob(job.id, { title: e.target.value })} placeholder="Policy Research Associate" />
              </div>
              <div>
                <label className={label}>Department</label>
                <input className={input} value={job.department} onChange={e => updateJob(job.id, { department: e.target.value })} placeholder="Research" />
              </div>
              <div>
                <label className={label}>Type</label>
                <select className={input} value={job.type} onChange={e => updateJob(job.id, { type: e.target.value })}>
                  {["Full-time", "Part-time", "Internship", "Volunteer", "Contract"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Location</label>
                <input className={input} value={job.location} onChange={e => updateJob(job.id, { location: e.target.value })} placeholder="New Delhi / Remote" />
              </div>
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea className={input} rows={3} value={job.description} onChange={e => updateJob(job.id, { description: e.target.value })} placeholder="What will this person do..." />
            </div>
            <div>
              <label className={label}>Apply link or email</label>
              <input className={input} value={job.applyLink} onChange={e => updateJob(job.id, { applyLink: e.target.value })} placeholder="mailto:jobs@samavesh.in or https://..." />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-stone-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-stone-700 transition disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  );
}
