import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRelayWithSentences } from "@/lib/relays";
import RelayEditForm from "./RelayEditForm";

type Props = { params: { id: string } };

export const metadata = { title: "이어쓰기 수정 — 영이네 작업실" };
export const dynamic = "force-dynamic";

export default async function RelayEditPage({ params }: Props) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H") {
    redirect(`/login?from=/relay/${params.id}/edit`);
  }

  const relay = await getRelayWithSentences(params.id);
  if (!relay) notFound();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 720 }}>
      <Link
        href={`/relay/${relay.id}`}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
      >
        ← 이어쓰기로
      </Link>

      <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          edit relay
        </div>
        <h1 className="page-title">이어쓰기 수정</h1>
      </div>

      <RelayEditForm relay={relay} viewer={uid} />
    </div>
  );
}
