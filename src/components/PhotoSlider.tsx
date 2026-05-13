"use client";

import { useState } from "react";
import PhotoPlaceholder from "./PhotoPlaceholder";

export default function PhotoSlider({
  photos,
  fallbackHue = 60,
  height = 460,
}: {
  photos: string[];
  fallbackHue?: number;
  height?: number;
}) {
  const [active, setActive] = useState(0);
  const hasPhotos = photos.length > 0;
  const count = hasPhotos ? photos.length : 1;

  return (
    <div>
      <div
        style={{
          height,
          borderRadius: "var(--r-md)",
          overflow: "hidden",
          background: "var(--paper-ink)",
        }}
      >
        {hasPhotos ? (
          <img
            src={photos[active]}
            alt={`사진 ${active + 1}`}
            loading={active === 0 ? "eager" : "lazy"}
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PhotoPlaceholder hue={fallbackHue} height={height} idx={active} />
        )}
      </div>
      {count > 1 && (
        <div
          className="row gap-8"
          style={{ marginTop: 10, justifyContent: "center" }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`사진 ${i + 1}번`}
              onClick={() => setActive(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === active ? "var(--ink)" : "var(--line-2)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
