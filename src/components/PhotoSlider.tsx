"use client";

import { useState } from "react";
import PhotoPlaceholder from "./PhotoPlaceholder";

export default function PhotoSlider({
  hue,
  count,
  height = 460,
}: {
  hue: number;
  count: number;
  height?: number;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <PhotoPlaceholder hue={hue} height={height} idx={active} />
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
