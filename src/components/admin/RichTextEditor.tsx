"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useCallback, useState, useRef } from "react";

/* ── FontSize extension (adds fontSize to TextStyle span) ── */
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: { chain: () => { setMark: (mark: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: { chain: () => { setMark: (mark: string, attrs: Record<string, string | null>) => { unsetMark: (mark: string) => { run: () => boolean } } } }) =>
        chain().setMark("textStyle", { fontSize: null }).unsetMark("textStyle").run(),
    } as never;
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({ onClick, active, title, children, style }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={style}
      className={`px-2 py-1 text-sm rounded transition font-medium ${
        active ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() { return <div className="w-px h-5 bg-stone-200 mx-1" />; }

const FONT_SIZES = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "64px"];
const PRESET_COLORS = ["#111111", "#ffffff", "#6b7280", "#dc2626", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#db2777"];

function ColorPicker({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  const [hex, setHex] = useState(value ?? "#111111");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function apply(color: string) {
    setHex(color);
    onChange(color);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        title={label}
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        className="px-2 py-1 text-sm rounded transition text-stone-600 hover:bg-stone-100"
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 2, background: hex, border: "1px solid #ccc", display: "inline-block" }} />
        {label}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 12, width: 220,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Preset swatches */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => apply(c)}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  background: c, border: c === hex ? "2px solid #111" : "1px solid #ddd",
                  cursor: "pointer",
                }}
              />
            ))}
            {/* Remove color */}
            <button
              type="button"
              title="Remove color"
              onClick={() => { apply(""); onChange(""); setOpen(false); }}
              style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #ddd", cursor: "pointer", background: "linear-gradient(to bottom right, #fff 45%, #f00 45%, #f00 55%, #fff 55%)", fontSize: 0 }}
            />
          </div>

          {/* Native color picker */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, color: "#6b7280" }}>
            <input
              type="color"
              value={hex || "#111111"}
              onChange={(e) => setHex(e.target.value)}
              onBlur={(e) => apply(e.target.value)}
              style={{ width: 32, height: 32, border: "none", cursor: "pointer", borderRadius: 4 }}
            />
            Colour picker
          </label>

          {/* Hex input */}
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={hex}
              placeholder="#hex or rgb()"
              onChange={(e) => setHex(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { apply(hex); setOpen(false); } }}
              style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "monospace" }}
            />
            <button
              type="button"
              onClick={() => { apply(hex); setOpen(false); }}
              style={{ background: "#111", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder = "Write here…", minHeight = 320 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      ImageExt.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: { class: "prose prose-stone max-w-none focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string;
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const currentFontSize = editor?.getAttributes("textStyle").fontSize ?? "";
  const currentColor = editor?.getAttributes("textStyle").color ?? "";

  if (!editor) return null;

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-stone-200 bg-stone-50">

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarButton>
        <Divider />

        {/* Font size */}
        <select
          title="Font size"
          value={currentFontSize}
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          className="px-1 py-1 text-xs rounded border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
          style={{ minWidth: 72 }}
        >
          <option value="">Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace("px", "")}px</option>
          ))}
        </select>
        <Divider />

        {/* Inline marks */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><span className="underline">U</span></ToolbarButton>
        <Divider />

        {/* Color pickers */}
        <ColorPicker
          label="A"
          value={currentColor}
          onChange={(color) => {
            if (color) editor.chain().focus().setColor(color).run();
            else editor.chain().focus().unsetColor().run();
          }}
        />
        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">⬅</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centre">⬛</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">➡</ToolbarButton>
        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. List</ToolbarButton>
        <Divider />

        {/* Misc */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">❝</ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Insert link">🔗</ToolbarButton>
        <ToolbarButton onClick={addImage} active={false} title="Insert image">🖼</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">—</ToolbarButton>
        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="px-5 py-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-stone-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  );
}
