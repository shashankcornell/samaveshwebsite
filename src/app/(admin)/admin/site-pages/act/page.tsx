import { prisma } from "@/lib/prisma";
import { ActPageForm, ActData, ActTab } from "@/components/admin/ActPageForm";

const DEFAULT_TABS: ActTab[] = [
  {
    key: "Discourse Rules",
    eyebrow: "WEEKLY ONLINE DISCOURSES",
    title: "Sit at the table.",
    italic: "Every Saturday, 7:00 PM IST. Bring a question, leave with a brief.",
    body: "<p>Discourses are our weekly invite-by-question gatherings. Anyone can RSVP — researchers, practitioners, students, sceptics — but the floor follows ten ground rules drafted by our editorial team to keep the conversation rigorous and inclusive.</p><p>We open with a 12-minute brief from a domain mentor. The next 45 minutes are a structured exchange. We close by drafting a one-page synthesis the editor publishes on Tuesday.</p>",
    cta: "Read the ten rules",
    href: "mailto:hello@samavesh.in?subject=Discourse RSVP",
    sideKind: "list",
    list: ["Speak from your standpoint, not your seat","Disagree with the argument, never the person","Cite the source you're leaning on","If you bring a critique, bring a question","No anonymous quotes outside the room","Time-box: three minutes per turn","Give the floor before you take it","Specifics over slogans","What would change your mind?","Leave the room better than you found it"],
    stats: [],
    timeline: [],
    schedule: [],
    roles: [],
  },
  {
    key: "Local Chapter",
    eyebrow: "START A LOCAL CHAPTER",
    title: "Build the room where you live.",
    italic: "Eleven cities so far. We'll help you set up the twelfth.",
    body: "<p>A Samavesh chapter is a small, self-organising group that meets in person every fortnight. Chapters pick a sector (or three), invite local practitioners, and feed back into the discourse calendar.</p><p>We provide a starter kit, an editorial mentor, and an annual stipend for venue costs. You provide the convening energy and a willingness to keep showing up.</p>",
    cta: "Apply to convene a chapter",
    href: "mailto:hello@samavesh.in?subject=Local Chapter Interest",
    sideKind: "stat-grid",
    list: [],
    stats: [{ v: "11", l: "Cities" },{ v: "240+", l: "Members" },{ v: "82", l: "Discourses run" },{ v: "6", l: "Briefs to ministry" }],
    timeline: [],
    schedule: [],
    roles: [],
  },
  {
    key: "Externs",
    eyebrow: "EXTERNSHIP — 12 WEEKS",
    title: "Work alongside the editorial team.",
    italic: "For final-year students, early-career researchers, and curious practitioners.",
    body: "<p>Externs spend twelve weeks embedded with one of our sector mentors. You'll author one paper, co-host two discourses, and contribute editorially to the Tuesday brief.</p><p>We run two cohorts a year — winter (Jan–Mar) and monsoon (Jul–Sep). Stipend, mentor and a desk at our Saket office come included.</p>",
    cta: "Apply for the next cohort",
    href: "mailto:hello@samavesh.in?subject=Externship Application",
    sideKind: "timeline",
    list: [],
    stats: [],
    timeline: [{ w: "W 01–02", t: "Onboarding + literature scan with your mentor" },{ w: "W 03–06", t: "Field interviews & first draft of the paper" },{ w: "W 07–09", t: "Co-host two discourses on your sector" },{ w: "W 10–12", t: "Final draft, peer-review, public release" }],
    schedule: [],
    roles: [],
  },
  {
    key: "Annual Summit",
    eyebrow: "SAMAVESH SUMMIT",
    title: "Once a year, in one room.",
    italic: "December 2026 · Indian School of Public Policy, New Delhi.",
    body: "<p>Our annual two-day summit brings together the year's discourse threads, the chapters, the externs and a curated set of policymakers and field practitioners.</p><p>Day one is a closed-door working session — twelve sector tracks running in parallel. Day two is open to the public, with three plenaries and a reading of the year's most-cited briefs.</p>",
    cta: "See last year's programme",
    href: "mailto:hello@samavesh.in?subject=Summit Interest",
    sideKind: "schedule",
    list: [],
    stats: [],
    timeline: [],
    schedule: [{ day: "Day 1", t: "Closed working sessions", note: "12 parallel sector tracks" },{ day: "Day 2", t: "Public plenaries", note: "Three keynotes, two panels" },{ day: "Evening", t: "The Samavesh reading", note: "Year's most-cited briefs" }],
    roles: [],
  },
  {
    key: "Work with us",
    eyebrow: "WORK WITH US",
    title: "Roles, partnerships & commissions.",
    italic: "We hire slowly and partner carefully.",
    body: "<p>We're hiring across editorial, research and operations. We also commission long-form work from independent researchers, and partner with universities and civil society organisations on specific tracks.</p><p>If none of these fit, write to us anyway — we read every email and reply within a fortnight.</p>",
    cta: "See open roles",
    href: "mailto:hello@samavesh.in?subject=Open Roles",
    sideKind: "roles",
    list: [],
    stats: [],
    timeline: [],
    schedule: [],
    roles: [{ r: "Editorial Associate", l: "Full-time · Delhi" },{ r: "Sector Mentor — Climate", l: "Part-time · Remote" },{ r: "Research Lead — Health", l: "Full-time · Delhi" },{ r: "Communications Designer", l: "Contract · Remote" }],
  },
];

export default async function AdminActPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "act" } });
  const raw = (config?.data ?? {}) as Partial<ActData>;

  const initial: ActData = {
    heading: raw.heading ?? "Act.",
    subtitle: raw.subtitle ?? "<p>Five ways to step into the room — pick the one that fits the time you have.</p>",
    tabs: raw.tabs?.length ? raw.tabs : DEFAULT_TABS,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Act page</h1>
        <p className="text-sm text-stone-400 mt-0.5">Edit every tab, its body text, side panel content, and CTAs</p>
      </div>
      <ActPageForm initial={initial} />
    </div>
  );
}
