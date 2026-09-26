import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Eraser,
  Eye,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Minus,
  Palette,
  Highlighter,
} from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  id?: string;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Write tournament specifications, ground dimensions, equipment requirements, match duration, and discipline rules...",
  minHeight = "160px",
  id = "wysiwyg-editor",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Keep contentEditable in sync if value changed externally
  useEffect(() => {
    if (editorRef.current && mode === "visual") {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, mode]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt("Enter web link URL (e.g. https://rules.org/standard):");
    if (url) {
      exec("createLink", url);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin:10px 0; border:1px solid #cbd5e1; font-size:0.88rem;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #cbd5e1; padding:6px 10px; text-align:left;">Specification</th>
            <th style="border:1px solid #cbd5e1; padding:6px 10px; text-align:left;">Standard Requirement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:6px 10px;">Field / Court Dimensions</td>
            <td style="border:1px solid #cbd5e1; padding:6px 10px;">Official competition size</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:6px 10px;">Match Duration / Over Quota</td>
            <td style="border:1px solid #cbd5e1; padding:6px 10px;">Standard regulation periods</td>
          </tr>
          <tr>
            <td style="border:1px solid #cbd5e1; padding:6px 10px;">Gear & Apparel</td>
            <td style="border:1px solid #cbd5e1; padding:6px 10px;">Matching team uniforms required</td>
          </tr>
        </tbody>
      </table><p></p>
    `;
    exec("insertHTML", tableHtml);
  };

  const colors = ["#0f172a", "#059669", "#0284c7", "#d97706", "#dc2626", "#7c3aed"];
  const highlights = ["#fef08a", "#bbf7d0", "#bae6fd", "#fed7aa", "#fecdd3", "transparent"];

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        background: "#ffffff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
      className="wysiwyg-container"
    >
      {/* Kitchen-Sink Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "3px",
          padding: "6px 8px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          userSelect: "none",
        }}
      >
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => exec("undo")}
          title="Undo (Ctrl+Z)"
          style={toolbarBtnStyle}
        >
          <Undo size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("redo")}
          title="Redo (Ctrl+Y)"
          style={toolbarBtnStyle}
        >
          <Redo size={14} />
        </button>

        <span style={dividerStyle} />

        {/* Headings */}
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h1>")}
          title="Heading 1"
          style={toolbarBtnStyle}
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h2>")}
          title="Heading 2"
          style={toolbarBtnStyle}
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h3>")}
          title="Heading 3"
          style={toolbarBtnStyle}
        >
          <Heading3 size={15} />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<p>")}
          title="Paragraph Text"
          style={toolbarBtnStyle}
        >
          <span style={{ fontSize: "12px", fontWeight: 700 }}>P</span>
        </button>

        <span style={dividerStyle} />

        {/* Text Styling */}
        <button
          type="button"
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
          style={toolbarBtnStyle}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
          style={toolbarBtnStyle}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
          style={toolbarBtnStyle}
        >
          <Underline size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
          style={toolbarBtnStyle}
        >
          <Strikethrough size={14} />
        </button>

        <span style={dividerStyle} />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => exec("justifyLeft")}
          title="Align Left"
          style={toolbarBtnStyle}
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyCenter")}
          title="Align Center"
          style={toolbarBtnStyle}
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyRight")}
          title="Align Right"
          style={toolbarBtnStyle}
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("justifyFull")}
          title="Justify"
          style={toolbarBtnStyle}
        >
          <AlignJustify size={14} />
        </button>

        <span style={dividerStyle} />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
          style={toolbarBtnStyle}
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          style={toolbarBtnStyle}
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<blockquote>")}
          title="Blockquote"
          style={toolbarBtnStyle}
        >
          <Quote size={14} />
        </button>

        <span style={dividerStyle} />

        {/* Insert Elements */}
        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Web Link"
          style={toolbarBtnStyle}
        >
          <LinkIcon size={14} />
        </button>
        <button
          type="button"
          onClick={handleInsertTable}
          title="Insert Kitchen Sink Rules Table"
          style={toolbarBtnStyle}
        >
          <TableIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => exec("insertHorizontalRule")}
          title="Insert Horizontal Divider"
          style={toolbarBtnStyle}
        >
          <Minus size={14} />
        </button>

        <span style={dividerStyle} />

        {/* Text Color Picker */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            title="Font Color"
            style={toolbarBtnStyle}
          >
            <Palette size={14} />
          </button>
          {showColorPicker && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 50,
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px",
                display: "flex",
                gap: "5px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    exec("foreColor", c);
                    setShowColorPicker(false);
                  }}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: c,
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            title="Highlight Color"
            style={toolbarBtnStyle}
          >
            <Highlighter size={14} />
          </button>
          {showHighlightPicker && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 50,
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px",
                display: "flex",
                gap: "5px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {highlights.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    exec("hiliteColor", h);
                    setShowHighlightPicker(false);
                  }}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    background: h === "transparent" ? "#fff" : h,
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                    fontSize: "9px",
                    lineHeight: "16px",
                  }}
                  title={h === "transparent" ? "None" : h}
                >
                  {h === "transparent" ? "✕" : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => exec("removeFormat")}
          title="Clear Formatting"
          style={toolbarBtnStyle}
        >
          <Eraser size={14} />
        </button>

        {/* Mode Toggle */}
        <button
          type="button"
          onClick={() => setMode(mode === "visual" ? "html" : "visual")}
          title={mode === "visual" ? "Switch to HTML source code" : "Switch to Visual Editor"}
          style={{
            ...toolbarBtnStyle,
            marginLeft: "auto",
            background: mode === "html" ? "#e0f2fe" : "#f1f5f9",
            color: mode === "html" ? "#0284c7" : "#475569",
            fontWeight: 600,
          }}
        >
          {mode === "visual" ? (
            <>
              <Code size={13} style={{ marginRight: 4 }} />
              <span style={{ fontSize: "11px" }}>HTML</span>
            </>
          ) : (
            <>
              <Eye size={13} style={{ marginRight: 4 }} />
              <span style={{ fontSize: "11px" }}>Visual</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      {mode === "visual" ? (
        <div
          id={id}
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          style={{
            minHeight,
            padding: "12px 14px",
            fontSize: "0.92rem",
            lineHeight: 1.65,
            color: "#0f172a",
            background: "#ffffff",
            outline: "none",
            overflowY: "auto",
          }}
          className="wysiwyg-content"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Enter HTML formatted rules and specifications...</p>"
          style={{
            minHeight,
            padding: "12px 14px",
            fontSize: "0.85rem",
            fontFamily: "monospace",
            lineHeight: 1.5,
            color: "#0f172a",
            background: "#f8fafc",
            border: "none",
            outline: "none",
            resize: "vertical",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
};

const toolbarBtnStyle: React.CSSProperties = {
  border: "1px solid transparent",
  background: "transparent",
  color: "#334155",
  borderRadius: "5px",
  padding: "4px 6px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.8rem",
  transition: "all 0.15s ease",
};

const dividerStyle: React.CSSProperties = {
  width: "1px",
  height: "18px",
  background: "#cbd5e1",
  margin: "0 2px",
};
