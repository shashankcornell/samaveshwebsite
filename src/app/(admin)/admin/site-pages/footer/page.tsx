import { prisma } from "@/lib/prisma";
import { FooterPageForm } from "@/components/admin/FooterPageForm";
import { DEFAULT_FOOTER_DATA } from "@/lib/footerData";
import type { FooterData } from "@/lib/footerData";

export default async function AdminFooterPage() {
  const config = await prisma.pageConfig.findUnique({ where: { slug: "footer" } });
  const raw = (config?.data ?? {}) as Partial<FooterData>;

  const initial: FooterData = {
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Footer</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Edit the editorial strip, navigation columns, newsletter blurb, contact details, and legal bar
        </p>
      </div>
      <FooterPageForm initial={initial} />
    </div>
  );
}
