import { redirect } from "next/navigation";
import { auth } from "@/auth";
import WriteForm from "./WriteForm";

export const metadata = { title: "새 에세이 — 영희네 작업실" };

export default async function WritePage() {
  const session = await auth();
  const id = session?.user?.id;
  if (id !== "Y" && id !== "H") {
    redirect("/login?from=/essay/write");
  }

  return (
    <WriteForm
      authorId={id}
      displayName={session?.user?.displayName || id}
    />
  );
}
