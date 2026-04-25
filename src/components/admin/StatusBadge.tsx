import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  DRAFT: "bg-stone-100 text-stone-600",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  return (
    <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", STATUS_STYLES[status])}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
