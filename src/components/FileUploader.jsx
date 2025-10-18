"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, File, ImageIcon, Trash2, Upload } from "lucide-react";

const ACCEPT_DEFAULT = [
  "image/*",
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
];

export default function FileUploader({
  label = "Upload files",
  hint = "JPG, PNG, PDF up to 5MB each",
  accept = ACCEPT_DEFAULT,
  maxSizeMB = 5,
  multiple = false,
  value,
  onChange,
  name,
}) {
  const inputId = useId();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (Array.isArray(value)) setFiles(value);
    else if (value) setFiles([value]);
    else setFiles([]);
  }, [value]);

  const validateFiles = useCallback(
    (list) => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const acceptList = Array.isArray(accept) ? accept : [accept];
      const next = [];
      const errs = [];
      for (const f of list) {
        const typeOk =
          acceptList.includes("*") ||
          acceptList.some((a) =>
            a.endsWith("/*")
              ? f.type.startsWith(a.replace("/*", "/"))
              : f.name.toLowerCase().endsWith(a.toLowerCase()) || f.type === a
          );
        if (!typeOk) {
          errs.push(`${f.name}: unsupported type`);
          continue;
        }
        if (f.size > maxBytes) {
          errs.push(`${f.name}: exceeds ${maxSizeMB}MB`);
          continue;
        }
        next.push(f);
      }
      return { next, errs };
    },
    [accept, maxSizeMB]
  );

  const update = useCallback(
    (nextFiles, errs = []) => {
      setFiles(nextFiles);
      setErrors(errs);
      if (onChange) {
        onChange(multiple ? nextFiles : nextFiles[0] || null);
      }
    },
    [onChange, multiple]
  );

  const handleFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      const { next, errs } = validateFiles(incoming);
      update(multiple ? [...files, ...next] : next.slice(0, 1), errs);
    },
    [files, multiple, update, validateFiles]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const openCamera = () => {
      fileInputRef.current?.setAttribute("capture", "environment");
      fileInputRef.current?.click();
  };

  const removeAt = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    update(next);
  };

  const isImage = (file) => file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);

  return (
    <div className="w-full">
  <label htmlFor={inputId} className="block text-sm font-semibold text-[color:var(--secondary)] mb-2">
        {label}
      </label>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--accent)] p-6 text-center outline-none transition-colors duration-[250ms] ease-in-out focus-within:bg-white focus:ring-2 focus:ring-[color:var(--secondary)] focus:ring-offset-2 hover:border-[color:var(--secondary)] ${
          files.length > 0 ? "bg-[color:var(--surface)]" : "bg-[color:var(--surface)]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload
          className={`h-6 w-6 transition-colors duration-[250ms] text-[color:var(--primary)] group-focus:text-[color:var(--primary)]`}
          aria-hidden
        />
        <p className={`text-sm transition-colors duration-[250ms] ${files.length > 0 ? "text-[color:var(--foreground)]" : "text-[color:var(--foreground)]"} group-focus:text-[color:var(--foreground)]`}>
          Drag & drop files here, or click to browse
        </p>
        <p className={`text-xs transition-colors duration-[250ms] ${files.length > 0 ? "text-[color:var(--muted)]" : "text-[color:var(--muted)]"} group-focus:text-[color:var(--muted)]`}>{hint}</p>
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
            onClick={() => fileInputRef.current?.click()}
          >
            <File className="h-4 w-4" /> Choose file
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-accent/60 transition-colors duration-200 hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
            onClick={openCamera}
          >
            <Camera className="h-4 w-4" /> Use camera
          </button>
        </div>
      </div>

      <input
        id={inputId}
        name={name}
        ref={fileInputRef}
        type="file"
        accept={Array.isArray(accept) ? accept.join(",") : accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-[color:var(--accent)]" aria-live="polite">
          {errors.map((er, i) => (
            <li key={i}>• {er}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((f, idx) => (
            <div key={idx} className="relative rounded-xl ring-1 ring-[color:var(--accent)] bg-white p-2 transition-colors duration-[250ms] ease-in-out">
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-[color:var(--foreground)] hover:text-rose-600 shadow ring-1 ring-[color:var(--accent)]"
                onClick={() => removeAt(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="aspect-video overflow-hidden rounded-md bg-[rgba(var(--accent-rgb),0.08)] flex items-center justify-center">
                {isImage(f) ? (
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[color:var(--muted)]">
                    <ImageIcon className="h-8 w-8 opacity-70" />
                    <span className="mt-1 text-xs truncate max-w-[8rem]">{f.name}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-[color:var(--foreground)] truncate" title={f.name}>
                {f.name}
              </div>
              <div className="text-[10px] text-[color:var(--muted)]">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
