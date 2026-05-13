import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRelayWithSentences } from "@/lib/relays";
import RelayEditForm from "./RelayEditForm";

type Props = { params: { id: string } };

export const metadata = { title: "이어쓰기 수정 — 영희네 작업실" };
export const dynamic = "force-dynamic";

export default async function RelayEditPage({ params }: Props) {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    redirect(`/login?from=/relay/${params.id}/edit`);

  const relay = await getRelayWithSentences(params.id);
  if (!relay) notFound();

  return (
    <div className="container narrow fade-in" style={{ maxWidth: 680 }}>
      <Link href={`/relay/${relay.id}`} className="btn btn-ghost btn-sm">
        ← 이어쓰기로
      </Link>
      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          edit relay
        </div>
        <h1 className="page-title" style={{ fontSize: 26 }}>
          이어쓰기 수정
        </h1>
        <div className="meta" style={{ marginTop: 4 }}>
          제목은 둘 다 수정 가능 · 문장은 본인이 쓴 것만 수정 가능
        </div>
      </div>

      <RelayEditForm relay={relay} viewer={uid} />
    </div>
  );
}
