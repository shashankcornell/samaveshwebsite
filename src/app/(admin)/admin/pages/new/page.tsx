import { CmsPageEditorForm } from "@/components/admin/CmsPageEditorForm";
import Link from "next/link";

export default function NewCmsPagePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pages" className="text-sm text-stone-400 hover:text-stone-900">← Pages</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">New Page</h1>
      </div>
      <CmsPageEditorForm />
    </div>
  );
}
