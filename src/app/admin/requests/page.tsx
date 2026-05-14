import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  listPendingRequests,
  listResolvedRequests,
} from "@/lib/action-requests";
import RequestsList from "./RequestsList";

export const metadata = { title: "동의 요청 — 어드민" };
export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const session = await auth();
  const uid = session?.user?.id;
  if (uid !== "Y" && uid !== "H")
    redirect("/login?from=/admin/requests");

  const [pending, resolved] = await Promise.all([
    listPendingRequests(),
    listResolvedRequests(30),
  ]);
  const incoming = pending.filter((r) => r.requester !== uid);
  const outgoing = pending.filter((r) => r.requester === uid);
  const myResolved = resolved.filter((r) => r.requester === uid);

  return (
    <div className="container fade-in" style={{ maxWidth: 880 }}>
      <Link
        href="/admin"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
      >
        ← 어드민 홈
      </Link>

      <div style={{ marginBottom: 28 }}>
        <div className="hand" style={{ fontSize: 20, color: "var(--ink-3)" }}>
          requests
        </div>
        <h1 className="page-title">동의 요청</h1>
        <div className="serif" style={{ color: "var(--ink-2)", marginTop: 4 }}>
          함께 쓰는 컨텐츠의 삭제 / 상태 전환은 둘 다 동의해야 반영돼요.
        </div>
      </div>

      <RequestsList
        viewer={uid}
        incoming={incoming}
        outgoing={outgoing}
        resolvedOutgoing={myResolved}
      />
    </div>
  );
}
