"use client";

import { useState } from "react";

interface CitationBlockProps {
  citation: string;
}

export function CitationBlock({ citation }: CitationBlockProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{
      marginTop: 56,
      paddingTop: 32,
      borderTop: "1px solid var(--rule)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 14,
      }}>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--ink)",
          opacity: 0.4,
        }}>
          Cite this
        </span>
        <button
          onClick={copy}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: copied ? "var(--accent-blue)" : "var(--ink)",
            opacity: copied ? 1 : 0.45,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 200ms ease, opacity 200ms ease",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p style={{
        fontFamily: "var(--sans)",
        fontSize: 13,
        lineHeight: 1.75,
        color: "var(--ink)",
        opacity: 0.55,
        margin: 0,
        padding: "16px 20px",
        background: "var(--hero-cream)",
        borderLeft: "2px solid var(--rule)",
      }}>
        {citation}
      </p>
      <p style={{
        fontFamily: "var(--mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        color: "var(--ink)",
        opacity: 0.3,
        marginTop: 10,
      }}>
        APA 7th edition
      </p>
    </div>
  );
}
