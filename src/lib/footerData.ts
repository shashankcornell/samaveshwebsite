export interface FooterLink { label: string; href: string }

export interface FooterData {
  stripLocation: string;
  stripDiscourse: string;
  stripIssueLine: string;
  tagline: string;
  quote: string;
  readLinks: FooterLink[];
  actLinks: FooterLink[];
  exploreLinks: FooterLink[];
  newsletterBlurb: string;
  address: string;
  email: string;
  phone: string;
  socialLinks: FooterLink[];
  legalLinks: FooterLink[];
  legalTagline: string;
}

export const DEFAULT_FOOTER_DATA: FooterData = {
  stripLocation: "NEW DELHI · INDIA",
  stripDiscourse: "NEXT DISCOURSE · COMING SOON",
  stripIssueLine: "VOL I · ISSUE 01 NOW READING",
  tagline: "EST. 2022 — DECODING POLICIES",
  quote: "An inclusive community for policy discourses — a sounding board for solutions to the wicked challenges of our times.",
  readLinks: [
    { label: "The Index", href: "/blogs" },
    { label: "The Gazette", href: "/gazette" },
    { label: "Discourse Papers", href: "/blogs?type=discourse-paper" },
    { label: "Op-eds & Essays", href: "/blogs?type=essay" },
  ],
  actLinks: [
    { label: "Submit an idea", href: "/act" },
    { label: "Externships", href: "/act" },
    { label: "Annual summit", href: "/act" },
    { label: "Start a chapter", href: "/act" },
    { label: "Partner with us", href: "/act" },
  ],
  exploreLinks: [
    { label: "All topics", href: "/topics" },
    { label: "Health", href: "/topics/health" },
    { label: "Education", href: "/topics/education" },
    { label: "Urbanisation", href: "/topics/urbanisation" },
    { label: "Meet the community", href: "/community" },
    { label: "Newsroom", href: "/news" },
  ],
  newsletterBlurb: "A short read, every other Sunday. What we published, what we're working on, and what's worth your time.",
  address: "New Delhi, India",
  email: "hello@samavesh.in",
  phone: "",
  socialLinks: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "WhatsApp", href: "#" },
  ],
  legalLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Code of Conduct", href: "/conduct" },
    { label: "Editorial Policy", href: "/editorial-policy" },
    { label: "Press", href: "/press" },
    { label: "Careers", href: "/careers" },
  ],
  legalTagline: "BUILT IN NEW DELHI",
};
