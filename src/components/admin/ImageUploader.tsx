"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageCropModal, type PreviewRatio } from "./ImageCropModal";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  previewRatios?: PreviewRatio[];
}

const DEFAULT_RATIOS: PreviewRatio[] = [{ label: "Preview", ratio: 16 / 9 }];

/* Inline style for the cinematic filter — mirrors the CSS class */
const CINEMATIC_STYLE: React.CSSProperties = {
  filter: "contrast(0.88) brightness(0.94) saturate(0.72) sepia(0.08) hue-rotate(-6deg)",
};

export function ImageUploader({
  value,
  onChange,
  label = "Image",
  previewRatios = DEFAULT_RATIOS,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [filterPreview, setFilterPreview] = useState(true); // default: show with filter

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
    <>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{label}</label>

        {value && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Filter toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => setFilterPreview(f => !f)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 999,
                  border: `1px solid ${filterPreview ? "#111" : "#ddd"}`,
                  background: filterPreview ? "#111" : "#fff",
                  color: filterPreview ? "#fff" : "#888",
                  fontFamily: "var(--mono)", fontSize: 9,
                  letterSpacing: "0.12em", cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                <span style={{ fontSize: 11 }}>◑</span>
                {filterPreview ? "WITH CINEMATIC FILTER" : "ORIGINAL"}
              </button>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#aaa", letterSpacing: "0.08em" }}>
                Toggle to compare
              </span>
            </div>

            {/* Ratio previews */}
            {previewRatios.map(pr => (
              <div key={pr.label}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.12em", color: "#aaa", marginBottom: 6 }}>
                  {pr.label.toUpperCase()}
                </p>
                <div style={{
                  position: "relative", width: "100%", aspectRatio: pr.ratio,
                  overflow: "hidden", background: "#f0efec",
                  borderRadius: 4, border: "1px solid #e0ddd8",
                  isolation: "isolate",
                }}>
                  <Image
                    src={value}
                    alt={pr.label}
                    fill
                    sizes="600px"
                    style={{
                      objectFit: "cover",
                      ...(filterPreview ? CINEMATIC_STYLE : {}),
                      transition: "filter 400ms ease",
                    }}
                  />
                  {/* Color grade overlay — only visible when filter is on */}
                  {filterPreview && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(148deg, rgba(55,78,118,0.14) 0%, rgba(35,52,82,0.08) 50%, rgba(68,90,108,0.13) 100%)",
                      mixBlendMode: "soft-light",
                      pointerEvents: "none",
                    }} />
                  )}
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setCropOpen(true)}
                style={{
                  padding: "6px 16px",
                  border: "1px solid #111", borderRadius: 6,
                  background: "#111", color: "#fff",
                  fontFamily: "var(--mono)", fontSize: 10,
                  letterSpacing: "0.1em", cursor: "pointer",
                }}
              >
                CROP / ADJUST ✂
              </button>
            </div>
          </div>
        )}

        {/* File input */}
        <div>
          <p className="text-xs text-stone-400 mb-1">{value ? "Replace image:" : "Upload image:"}</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-sm text-stone-600 file:mr-3 file:rounded file:border-0 file:bg-stone-100 file:px-3 file:py-1 file:text-sm file:font-medium hover:file:bg-stone-200"
          />
        </div>

        {/* URL paste */}
        <div>
          <p className="text-xs text-stone-400 mb-1">Or paste URL:</p>
          <input
            type="text"
            value={value ?? ""}
            onChange={e => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {loading && <p className="text-xs text-stone-400">Uploading…</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {cropOpen && value && (
        <ImageCropModal
          src={value}
          previewRatios={previewRatios}
          onConfirm={url => { onChange(url); setCropOpen(false); }}
          onClose={() => setCropOpen(false)}
        />
      )}
    </>
  );
}
