type Props = {
  hue?: number;
  height?: number;
  idx?: number;
  label?: string;
};

export default function PhotoPlaceholder({
  hue = 60,
  height = 220,
  idx = 0,
}: Props) {
  const base = `oklch(0.85 0.05 ${hue})`;
  const accent = `oklch(0.72 0.07 ${(hue + 30) % 360})`;
  const deep = `oklch(0.55 0.06 ${(hue + 60) % 360})`;
  const variant = (idx * 37) % 100;
  return (
    <div
      className="photo"
      style={{
        height,
        background: `linear-gradient(${135 + variant}deg, ${base} 0%, ${accent} 55%, ${deep} 100%)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.25,
        }}
      >
        <circle
          cx={20 + variant / 5}
          cy={30}
          r={8}
          fill="oklch(1 0 0 / 0.5)"
        />
        <path
          d={`M0,${70 + (idx % 3) * 4} Q30,${55 + (idx % 4) * 3} 60,${65} T100,${60}`}
          stroke="oklch(0.3 0.05 60 / 0.5)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d={`M0,${85} Q40,${75 + (idx % 3) * 2} 100,${82}`}
          stroke="oklch(0.3 0.05 60 / 0.3)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <span style={{ position: "relative", zIndex: 1, opacity: 0.6 }}>📷</span>
    </div>
  );
}
