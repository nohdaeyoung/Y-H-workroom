import { auth } from "@/auth";
import { MOCK_PHOTOSTORIES } from "@/lib/mock-photostories";
import PhotostoryListClient from "@/components/PhotostoryListClient";

export const metadata = { title: "사진+글 — 영희네 작업실" };

export default async function PhotostoryListPage() {
  const session = await auth();
  return (
    <PhotostoryListClient
      items={MOCK_PHOTOSTORIES}
      canUpload={!!session?.user?.id}
    />
  );
}
