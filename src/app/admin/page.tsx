import PageScaffold from "@/components/PageScaffold";

export const metadata = { title: "어드민 — 영희네 작업실" };

export default function AdminPage() {
  return (
    <PageScaffold
      icon="⚙️"
      title="어드민"
      subtitle="Y/H 운영 공간 (로그인 필요)"
      phase="Phase 6"
    />
  );
}
