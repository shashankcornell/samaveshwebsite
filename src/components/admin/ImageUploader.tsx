"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "Image" }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {value && (
        <div className="relative h-40 w-full overflow-hidden rounded-md border border-stone-200">
          <Image src={value} alt="Preview" fill className="object-cover" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="text-sm text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-stone-100 file:px-3 file:py-1 file:text-sm file:font-medium hover:file:bg-stone-200"
      />
      {loading && <p className="text-xs text-stone-400">Uploading…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded border border-stone-200 px-3 py-1.5 text-xs text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
          placeholder="Or paste image URL"
        />
      )}
      {!value && (
        <input
          type="text"
          onChange={(e) => onChange(e.target.value)}
          className="rounded border border-stone-200 px-3 py-1.5 text-xs text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
          placeholder="Or paste image URL"
        />
      )}
    </div>
  );
}
