import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const DEFAULT_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const DEFAULT_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "align",
  "blockquote",
  "code-block",
  "link",
];

/**
 * Rich text editor for teachers (bold / italic / lists / etc.)
 */
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write here…",
  className = "",
  minHeight = 160,
}) {
  const modules = useMemo(() => DEFAULT_MODULES, []);

  return (
    <div className={`rich-editor ${className}`.trim()} style={{ "--rich-min-h": `${minHeight}px` }}>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={(html) => onChange?.(html)}
        modules={modules}
        formats={DEFAULT_FORMATS}
        placeholder={placeholder}
      />
    </div>
  );
}
