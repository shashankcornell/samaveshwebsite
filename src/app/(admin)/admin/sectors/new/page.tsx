import { SectorEditorForm } from "@/components/admin/SectorEditorForm";
import Link from "next/link";

export default function NewSectorPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/sectors" className="text-sm text-stone-400 hover:text-stone-900">← Sectors</Link>
        <span className="text-stone-200">/</span>
        <h1 className="text-2xl font-bold text-stone-900">New Sector</h1>
      </div>
      <SectorEditorForm />
    </div>
  );
}
