"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export interface PreviewRatio {
  label: string;  // e.g. "Card (16:9)"
  ratio: number;  // e.g. 16/9
}

interface Props {
  src: string;
  previewRatios: PreviewRatio[];
  onConfirm: (croppedUrl: string) => void;
  onClose: () => void;
}

const RATIO_PRESETS = [
  { label: "Free",  ratio: undefined },
  { label: "3.6:1", ratio: 3.6 },
  { label: "16:9",  ratio: 16 / 9 },
  { label: "21:9",  ratio: 21 / 9 },
  { label: "4:3",   ratio: 4 / 3 },
  { label: "1:1",   ratio: 1 },
  { label: "2:3",   ratio: 2 / 3 },
  { label: "3:4",   ratio: 3 / 4 },
];

function drawCropToCanvas(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  targetWidth: number,
  targetHeight: number,
) {
  const scaleX = image.naturalWidth / image.clientWidth;
  const scaleY = image.naturalHeight / image.clientHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const pixelRatio = window.devicePixelRatio ?? 1;
  canvas.width = targetWidth * pixelRatio;
  canvas.height = targetHeight * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    targetWidth,
    targetHeight,
  );
}

/* Live preview thumbnail for a single ratio */
function RatioPreview({
  image,
  crop,
  ratio,
  label,
}: {
  image: HTMLImageElement | null;
  crop: PixelCrop | undefined;
  ratio: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!image || !crop || !canvasRef.current) return;
    const W = 200;
    const H = Math.round(W / ratio);
    drawCropToCanvas(image, canvasRef.current, crop, W, H);
  }, [image, crop, ratio]);

  return (
    <div>
      <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#999", marginBottom: 6, letterSpacing: "0.12em" }}>
        {label.toUpperCase()}
      </p>
      <div style={{
        width: "100%", aspectRatio: ratio, overflow: "hidden",
        background: "#f0efec", border: "1px solid #e0ddd8", borderRadius: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {crop ? (
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image?.src ?? ""}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
    </div>
  );
}

export function ImageCropModal({ src, previewRatios, onConfirm, onClose }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [lockedRatio, setLockedRatio] = useState<number | undefined>(
    previewRatios[0]?.ratio,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setImgEl(img);
    const { width, height } = img;
    const ratio = lockedRatio ?? 16 / 9;
    const c = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, ratio, width, height),
      width,
      height,
    );
    setCrop(c);
    // Set completedCrop immediately so the live preview renders on open
    setCompletedCrop({
      unit: "px",
      x: Math.round((c.x / 100) * width),
      y: Math.round((c.y / 100) * height),
      width: Math.round((c.width / 100) * width),
      height: Math.round((c.height / 100) * height),
    });
  }

  const applyRatioPreset = useCallback((ratio: number | undefined) => {
    setLockedRatio(ratio);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    if (ratio !== undefined) {
      const c = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, ratio, width, height),
        width,
        height,
      );
      setCrop(c);
    }
  }, []);

  async function handleConfirm() {
    if (!completedCrop || !imgRef.current) return;
    setUploading(true);
    setError("");
    try {
      const W = 1200;
      const H = lockedRatio ? Math.round(W / lockedRatio) : Math.round(completedCrop.height / completedCrop.width * W);
      const canvas = document.createElement("canvas");
      drawCropToCanvas(imgRef.current, canvas, completedCrop, W, H);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => (b ? res(b) : rej(new Error("Canvas error"))), "image/jpeg", 0.93),
      );
      const formData = new FormData();
      formData.append("file", blob, "cropped.jpg");
      const r = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? "Upload failed");
      onConfirm(json.data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto", padding: "32px 16px",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 8,
        width: "100%", maxWidth: 980,
        padding: "28px 28px 32px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em", color: "#111", margin: 0 }}>
            CROP &amp; ADJUST IMAGE
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>

        {/* Ratio presets */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#aaa", letterSpacing: "0.12em", alignSelf: "center", marginRight: 4 }}>RATIO:</span>
          {RATIO_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyRatioPreset(p.ratio)}
              style={{
                padding: "4px 12px", borderRadius: 999,
                border: `1px solid ${lockedRatio === p.ratio ? "#111" : "#ddd"}`,
                background: lockedRatio === p.ratio ? "#111" : "#fff",
                color: lockedRatio === p.ratio ? "#fff" : "#555",
                fontFamily: "var(--mono)", fontSize: 10, cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 24, alignItems: "start" }}>
          {/* Crop tool */}
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#aaa", letterSpacing: "0.12em", marginBottom: 8 }}>
              DRAG TO SELECT CROP — CLICK &amp; DRAG CORNERS TO RESIZE
            </p>
            <div style={{ background: "#1a1a1a", borderRadius: 4, overflow: "hidden", display: "flex", justifyContent: "center" }}>
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={lockedRatio}
                minWidth={40}
                style={{ maxWidth: "100%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={src}
                  alt="Crop source"
                  onLoad={onImageLoad}
                  style={{ maxWidth: "100%", maxHeight: "60vh", display: "block" }}
                />
              </ReactCrop>
            </div>
          </div>

          {/* Live previews */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#aaa", letterSpacing: "0.12em", margin: 0 }}>
              LIVE PREVIEWS
            </p>
            {previewRatios.map(pr => (
              <RatioPreview
                key={pr.label}
                image={imgEl}
                crop={completedCrop}
                ratio={pr.ratio}
                label={pr.label}
              />
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: "#c00", fontFamily: "var(--mono)", fontSize: 11, margin: 0 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", borderTop: "1px solid #f0efec", paddingTop: 20 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#aaa", letterSpacing: "0.1em", margin: 0, marginRight: "auto" }}>
            Crop is uploaded as a new image — original is preserved.
          </p>
          <button onClick={onClose}
            style={{ padding: "8px 20px", border: "1px solid #ddd", borderRadius: 6, background: "#fff", fontFamily: "var(--mono)", fontSize: 10, cursor: "pointer", letterSpacing: "0.08em" }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop || uploading}
            style={{
              padding: "8px 24px", background: "#111", color: "#fff",
              border: "none", borderRadius: 6, fontFamily: "var(--mono)", fontSize: 10,
              cursor: completedCrop && !uploading ? "pointer" : "not-allowed",
              opacity: !completedCrop || uploading ? 0.45 : 1,
              letterSpacing: "0.08em",
            }}
          >
            {uploading ? "UPLOADING…" : "APPLY CROP"}
          </button>
        </div>
      </div>
    </div>
  );
}
