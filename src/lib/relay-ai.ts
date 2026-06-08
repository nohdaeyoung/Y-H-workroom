import "server-only";

const SYSTEM_PROMPT = `당신은 한국어로 짧은 산문/이야기를 함께 쓰는 협업자입니다.

규칙:
- 한 번에 한 문장만 적습니다 (마침표/물음표/느낌표로 끝나는 한 문장).
- 200자 이내. 가능하면 50~120자.
- 직전 문장과 자연스럽게 이어지도록. 시점·인물·시제를 일관되게.
- 시적이고 절제된 톤. 진부한 비유나 과한 형용사는 피하기.
- 메타 발언, 따옴표 안의 큰 따옴표 없이 본문만.
- 마지막에 마침표 같은 종결부호 포함.`;

type Msg = { role: "user" | "assistant"; content: string };

async function callAnthropic(messages: Msg[], system: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 200,
        system,
        messages,
      }),
    });
    if (!res.ok) {
      console.warn("[relay-ai] anthropic non-ok:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    return text || null;
  } catch (err) {
    console.warn("[relay-ai] anthropic failed:", err);
    return null;
  }
}

async function callOpenAI(messages: Msg[], system: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.warn("[relay-ai] openai failed:", err);
    return null;
  }
}

function sanitizeSentence(raw: string): string {
  // 한 문장만, 200자 이내.
  let s = raw.replace(/^["'\s]+|["'\s]+$/g, "").trim();
  // 첫 문장 종결 부호까지만.
  const m = s.match(/^[\s\S]*?[.!?。!?…]+/);
  if (m) s = m[0];
  s = s.trim();
  if (s.length > 200) s = s.slice(0, 200);
  return s;
}

export type GenerateOpts = {
  title: string;
  /** 이전 문장들 (오래된 → 최신 순). 빈 배열이면 첫 문장 생성. */
  prior: { text: string; bySource: "human" | "ai" }[];
  /** 재생성용 — 거부할 직전 AI 문장이 있으면 전달. */
  rejectedDraft?: string;
};

export async function generateRelaySentence(
  opts: GenerateOpts
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const messages: Msg[] = [];

  const intro = `"${opts.title}"라는 제목의 짧은 글을 한 문장씩 번갈아 적습니다. 사람과 AI가 한 문장씩 이어갑니다.`;

  if (opts.prior.length === 0) {
    messages.push({
      role: "user",
      content: `${intro}\n\n첫 문장을 한 문장만 적어주세요.`,
    });
  } else {
    const history = opts.prior
      .map((p, i) => `${i + 1}. (${p.bySource === "ai" ? "AI" : "사람"}) ${p.text}`)
      .join("\n");
    messages.push({
      role: "user",
      content: `${intro}\n\n지금까지의 문장:\n${history}\n\n다음 문장 (한 문장만) 적어주세요.`,
    });
  }

  if (opts.rejectedDraft) {
    messages.push({ role: "assistant", content: opts.rejectedDraft });
    messages.push({
      role: "user",
      content: "방금 그 문장은 마음에 들지 않아요. 톤이나 방향을 다르게 한 문장으로 다시 적어주세요.",
    });
  }

  const text = (await callAnthropic(messages, SYSTEM_PROMPT)) ??
    (await callOpenAI(messages, SYSTEM_PROMPT));

  if (!text) {
    return { ok: false, error: "AI 응답을 받지 못했어요. 잠시 후 다시 시도하거나 직접 적어주세요." };
  }

  const clean = sanitizeSentence(text);
  if (!clean) {
    return { ok: false, error: "AI 응답이 비어 있어요. 다시 시도해 주세요." };
  }
  return { ok: true, text: clean };
}
