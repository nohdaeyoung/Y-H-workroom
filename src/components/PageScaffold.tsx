type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  phase: string;
};

export default function PageScaffold({ icon, title, subtitle, phase }: Props) {
  return (
    <div className="container-prose pt-16 pb-24 text-center">
      <div className="text-5xl mb-6">{icon}</div>
      <h1 className="font-serif text-3xl md:text-4xl font-medium">{title}</h1>
      {subtitle && (
        <p className="mt-3 text-ink-soft font-serif">{subtitle}</p>
      )}
      <div className="mt-12 inline-block card-paper">
        <p className="hand text-ink-soft text-lg">
          ＿ {phase} 에서 만나요 ＿
        </p>
      </div>
    </div>
  );
}
