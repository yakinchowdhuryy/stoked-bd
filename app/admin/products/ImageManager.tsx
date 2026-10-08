"use client";

import { ChangeEvent, DragEvent, useState } from "react";

/*
 * One image in the manager.
 * existing = already saved in Supabase (has dbId)
 * new      = chosen from device, not uploaded yet (has file)
 */
export type ImgItem = {
  id: string;
  kind: "existing" | "new";
  url: string;
  dbId?: string;
  file?: File;
};

const MAX_IMAGES = 12;

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* free the browser memory used by local previews */
export function revokeNewPreviews(items: ImgItem[]) {
  items.forEach((item) => {
    if (item.kind === "new") URL.revokeObjectURL(item.url);
  });
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

type Props = {
  items: ImgItem[];
  onChange: (items: ImgItem[]) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

const btnBase: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: "30px",
  padding: 0,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.55)",
  color: "#fff",
  fontSize: "10px",
  letterSpacing: "0.08em",
  cursor: "pointer",
};

export default function ImageManager({
  items,
  onChange,
  onError,
  disabled = false,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  /* ADD */
  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    /* copy the files FIRST, then reset the input */
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (files.length === 0) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      onError?.("ALL FILES MUST BE IMAGES.");
      return;
    }

    /* ignore the exact same file picked twice */
    const knownKeys = new Set(
      items.filter((item) => item.file).map((item) => fileKey(item.file as File))
    );

    const fresh: File[] = [];

    for (const file of files) {
      const key = fileKey(file);
      if (knownKeys.has(key)) continue;
      knownKeys.add(key);
      fresh.push(file);
    }

    if (fresh.length < files.length) {
      onError?.("DUPLICATE IMAGE SKIPPED.");
    }

    const room = MAX_IMAGES - items.length;

    if (fresh.length > room) {
      onError?.(`MAXIMUM ${MAX_IMAGES} IMAGES ALLOWED.`);
    }

    const accepted = fresh.slice(0, Math.max(room, 0));

    if (accepted.length === 0) return;

    onChange([
      ...items,
      ...accepted.map(
        (file): ImgItem => ({
          id: makeId(),
          kind: "new",
          url: URL.createObjectURL(file),
          file,
        })
      ),
    ]);
  }

  /* REMOVE */
  function removeItem(id: string) {
    const target = items.find((item) => item.id === id);

    if (target?.kind === "new") URL.revokeObjectURL(target.url);

    onChange(items.filter((item) => item.id !== id));
  }

  /* MOVE */
  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;

    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);

    onChange(next);
  }

  /* DRAG AND DROP (desktop) */
  function onDragStart(index: number) {
    if (disabled) return;
    setDragIndex(index);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    if (overIndex !== index) setOverIndex(index);
  }

  function onDrop(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();

    if (dragIndex !== null) moveItem(dragIndex, index);

    setDragIndex(null);
    setOverIndex(null);
  }

  function onDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div style={{ width: "100%", marginTop: "12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 150px), 1fr))",
          gap: "12px",
        }}
      >
        {items.map((item, index) => {
          const isMain = index === 0;

          return (
            <div
              key={item.id}
              draggable={!disabled}
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                border: isMain
                  ? "1px solid rgba(255,45,45,0.85)"
                  : overIndex === index && dragIndex !== null
                  ? "1px dashed rgba(255,255,255,0.7)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
                opacity: dragIndex === index ? 0.4 : 1,
                cursor: disabled ? "default" : "grab",
                transition: "border-color 0.2s ease, opacity 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3 / 4",
                  overflow: "hidden",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={item.url}
                  alt={`Product image ${index + 1}`}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    pointerEvents: "none",
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    padding: "4px 8px",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                    background: isMain ? "#ff2d2d" : "rgba(0,0,0,0.7)",
                    color: "#fff",
                  }}
                >
                  {isMain ? "1 · MAIN" : index + 1}
                </span>

                {item.kind === "new" && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      padding: "4px 8px",
                      fontSize: "8px",
                      letterSpacing: "0.14em",
                      background: "rgba(255,255,255,0.9)",
                      color: "#000",
                    }}
                  >
                    NEW
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "4px", padding: "6px" }}>
                <button
                  type="button"
                  title="Move earlier"
                  disabled={disabled || index === 0}
                  onClick={() => moveItem(index, index - 1)}
                  style={{ ...btnBase, opacity: index === 0 ? 0.3 : 1 }}
                >
                  ←
                </button>

                <button
                  type="button"
                  title="Move later"
                  disabled={disabled || index === items.length - 1}
                  onClick={() => moveItem(index, index + 1)}
                  style={{
                    ...btnBase,
                    opacity: index === items.length - 1 ? 0.3 : 1,
                  }}
                >
                  →
                </button>

                <button
                  type="button"
                  title="Remove image"
                  disabled={disabled}
                  onClick={() => removeItem(item.id)}
                  style={{
                    ...btnBase,
                    color: "#ff4a4a",
                    border: "1px solid rgba(255,74,74,0.45)",
                  }}
                >
                  ✕
                </button>
              </div>

              {!isMain && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => moveItem(index, 0)}
                  style={{
                    ...btnBase,
                    flex: "none",
                    width: "calc(100% - 12px)",
                    margin: "0 6px 6px",
                    fontSize: "8px",
                    letterSpacing: "0.14em",
                  }}
                >
                  SET AS MAIN
                </button>
              )}
            </div>
          );
        })}

        {/* ADD TILE */}
        {items.length < MAX_IMAGES && (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "200px",
              border: "1px dashed rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.02)",
              cursor: disabled ? "not-allowed" : "pointer",
              textAlign: "center",
              padding: "16px",
              margin: 0,
              boxSizing: "border-box",
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={disabled}
              onChange={handleFiles}
              style={{ display: "none" }}
            />

            <strong style={{ fontSize: "12px", letterSpacing: "0.14em" }}>
              + ADD IMAGES
            </strong>

            <span
              style={{
                fontSize: "8px",
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              SELECT ONE OR MORE
            </span>
          </label>
        )}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "8px",
          letterSpacing: "0.14em",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        THE FIRST IMAGE IS THE MAIN THUMBNAIL. USE ← → OR DRAG AND DROP TO
        CHANGE THE ORDER. {items.length} / {MAX_IMAGES} IMAGES.
      </div>
    </div>
  );
}