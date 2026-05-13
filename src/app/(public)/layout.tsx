import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ScrollProgress } from "@/components/public/ScrollProgress";
import { DEFAULT_FOOTER_DATA } from "@/lib/footerData";
import type { FooterData } from "@/lib/footerData";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "footer" } });
  const raw = (config?.data ?? {}) as Partial<FooterData>;

  const footerData: FooterData = {
    stripLocation:   raw.stripLocation   ?? DEFAULT_FOOTER_DATA.stripLocation,
    stripDiscourse:  raw.stripDiscourse  ?? DEFAULT_FOOTER_DATA.stripDiscourse,
    stripIssueLine:  raw.stripIssueLine  ?? DEFAULT_FOOTER_DATA.stripIssueLine,
    tagline:         raw.tagline         ?? DEFAULT_FOOTER_DATA.tagline,
    quote:           raw.quote           ?? DEFAULT_FOOTER_DATA.quote,
    readLinks:       raw.readLinks?.length    ? raw.readLinks    : DEFAULT_FOOTER_DATA.readLinks,
    actLinks:        raw.actLinks?.length     ? raw.actLinks     : DEFAULT_FOOTER_DATA.actLinks,
    exploreLinks:    raw.exploreLinks?.length ? raw.exploreLinks : DEFAULT_FOOTER_DATA.exploreLinks,
    newsletterBlurb: raw.newsletterBlurb ?? DEFAULT_FOOTER_DATA.newsletterBlurb,
    address:         raw.address         ?? DEFAULT_FOOTER_DATA.address,
    email:           raw.email           ?? DEFAULT_FOOTER_DATA.email,
    phone:           raw.phone           ?? DEFAULT_FOOTER_DATA.phone,
    socialLinks:     raw.socialLinks?.length  ? raw.socialLinks  : DEFAULT_FOOTER_DATA.socialLinks,
    legalLinks:      raw.legalLinks?.length   ? raw.legalLinks   : DEFAULT_FOOTER_DATA.legalLinks,
    legalTagline:    raw.legalTagline    ?? DEFAULT_FOOTER_DATA.legalTagline,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <ScrollProgress />
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer data={footerData} />
    </div>
  );
}
