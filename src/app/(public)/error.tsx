"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "4rem", textAlign: "center" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h2>
      <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", cursor: "pointer" }}>
        Try again
      </button>
    </div>
  );
}
