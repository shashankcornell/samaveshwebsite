"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-base font-semibold text-stone-900 mb-2">{title}</h2>
        <p className="text-sm text-stone-600">{message}</p>
        {children && <div className="mt-3">{children}</div>}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="rounded-md border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-stone-900 hover:bg-stone-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
