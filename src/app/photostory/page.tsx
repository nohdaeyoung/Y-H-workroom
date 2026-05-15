import { auth } from "@/auth";
import { listPhotostories } from "@/lib/photostories";
import PhotostoryListClient from "@/components/PhotostoryListClient";

export const metadata = { title: "사진+글 — 영희네 작업실" };
export const dynamic = "force-dynamic";

export default async function PhotostoryListPage() {
  const session = await auth();
  const isYH = !!session?.user?.id;
  const items = await listPhotostories({ includeWaiting: isYH });
  return (
    <PhotostoryListClient items={items} canUpload={isYH} isYH={isYH} />
  );
}
