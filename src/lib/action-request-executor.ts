import "server-only";
import { deleteRelay } from "@/lib/relays";
import type { ActionRequest } from "@/types/domain";

/**
 * ActionRequest 승인 시 실제 mutation 수행.
 * kind별 lib 함수 호출. 누락된 kind는 throw.
 */
export async function executeActionRequest(req: ActionRequest): Promise<void> {
  switch (req.kind) {
    case "delete-relay":
      await deleteRelay(req.targetId);
      return;
    case "delete-keyword": {
      const { deleteKeyword } = await import("@/lib/keywords");
      await deleteKeyword(req.targetId);
      return;
    }
    case "delete-photostory": {
      const { deletePhotostory } = await import("@/lib/photostories");
      await deletePhotostory(req.targetId);
      return;
    }
    case "delete-bookclub": {
      const { deleteBookclub } = await import("@/lib/bookclubs");
      await deleteBookclub(req.targetId);
      return;
    }
    case "set-bookclub-status": {
      const { setBookclubStatus, getBookclub } = await import("@/lib/bookclubs");
      const status = String(req.payload?.status ?? "");
      if (status !== "reading" && status !== "met" && status !== "finished")
        throw new Error("invalid status");
      const cur = await getBookclub(req.targetId);
      if (!cur || cur.status === status) return; // 이미 같은 상태 → no-op (멱등)
      await setBookclubStatus(req.targetId, status);
      return;
    }
    case "set-photostory-status": {
      const { setPhotostoryStatus, getPhotostory } = await import("@/lib/photostories");
      const status = String(req.payload?.status ?? "");
      if (status !== "waiting" && status !== "completed")
        throw new Error("invalid status");
      const cur = await getPhotostory(req.targetId);
      if (!cur || cur.status === status) return; // no-op
      await setPhotostoryStatus(req.targetId, status);
      return;
    }
    case "set-relay-status": {
      const { setRelayStatus, getRelayWithSentences } = await import("@/lib/relays");
      const status = String(req.payload?.status ?? "");
      if (status !== "ongoing" && status !== "completed")
        throw new Error("invalid status");
      const cur = await getRelayWithSentences(req.targetId);
      if (!cur || cur.status === status) return; // no-op
      await setRelayStatus(req.targetId, status);
      return;
    }
    default: {
      const exhaustive: never = req.kind;
      throw new Error(`unknown action request kind: ${exhaustive as string}`);
    }
  }
}
