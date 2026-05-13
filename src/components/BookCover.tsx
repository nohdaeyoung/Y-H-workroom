import Image from "next/image";

type BookCoverSize = "sm" | "md" | "lg";

type Props = {
  title: string;
  coverUrl?: string | null;
  size?: BookCoverSize;
};

const DIMENSIONS: Record<BookCoverSize, { w: number; h: number; fontSize: number }> = {
  sm: { w: 80, h: 110, fontSize: 11 },
  md: { w: 100, h: 140, fontSize: 14 },
  lg: { w: 120, h: 170, fontSize: 16 },
};

/**
 * 책 표지 시각화 — 커버 이미지가 있으면 표시, 없으면 제목 기반 hue 그라데이션으로 책등 느낌의 placeholder.
 */
export default function BookCover({ title, coverUrl, size = "md" }: Props) {
  const dim = DIMENSIONS[size];

  if (coverUrl) {
    return (
      <div
        style={{
          width: dim.w,
          height: dim.h,
          flexShrink: 0,
          borderRadius: "2px 6px 6px 2px",
          overflow: "hidden",
          boxShadow: "2px 2px 6px oklch(0.3 0.04 70 / 0.15)",
          position: "relative",
        }}
      >
        <Image
          src={coverUrl}
          alt={title}
          width={dim.w * 2}
          height={dim.h * 2}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          sizes={`${dim.w}px`}
        />
      </div>
    );
  }

  const hue = 30 + (title.charCodeAt(0) * 7) % 200;

  return (
    <div
      style={{
        width: dim.w,
        height: dim.h,
        flexShrink: 0,
        background: `linear-gradient(135deg, oklch(0.78 0.05 ${hue}), oklch(0.55 0.07 ${(hue + 30) % 360}))`,
        borderRadius: "2px 6px 6px 2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "2px 2px 6px oklch(0.3 0.04 70 / 0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 2,
          top: 0,
          bottom: 0,
          width: 4,
          background: "oklch(0.3 0.05 60 / 0.3)",
        }}
      />
      <div
        className="serif"
        style={{
          color: "oklch(0.98 0.01 80)",
          fontSize: dim.fontSize,
          padding: "0 8px",
          textAlign: "center",
          fontWeight: 500,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
    </div>
  );
}
