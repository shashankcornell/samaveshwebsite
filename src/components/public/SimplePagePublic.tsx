import type { SimplePageData } from "@/components/admin/SimplePageForm";
import { Reveal } from "./Reveal";

export function SimplePagePublic({ data }: { data: SimplePageData }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "72px 0 48px", borderBottom: "1px solid var(--rule)" }}>
        <div className="samavesh-container">
          <Reveal>
            <h1 className="simple-page-title" style={{ fontFamily: "var(--serif)", fontSize: 72, lineHeight: 1.05, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
              {data.heading}
            </h1>
            {data.subheading && (
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, lineHeight: 1.55, maxWidth: 720, marginTop: 24, color: "var(--ink-soft)" }}>
                {data.subheading}
              </p>
            )}
            {data.lastUpdated && (
              <p style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--ink)", opacity: 0.35, marginTop: 20 }}>
                LAST UPDATED {new Date(data.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
              </p>
            )}
          </Reveal>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "56px 0 96px" }}>
        <div className="samavesh-container">
          <div style={{ maxWidth: 760 }}>
            <Reveal>
              <div
                className="samavesh-prose"
                style={{ fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.75 }}
                dangerouslySetInnerHTML={{ __html: data.body }}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
