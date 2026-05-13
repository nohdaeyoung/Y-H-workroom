export const metadata = { title: "소개 — 영희네 작업실" };

// 추후 aboutContent Firestore 컬렉션에서 가져올 mock 데이터
const ABOUT = {
  header: {
    title: "영희네 작업실",
    body: "두 사람이 함께 쓰는 작은 공간",
  },
  greeting: {
    title: "여기는 영(Y)과 희(H), 두 사람만 글을 쓰는 작업실입니다.",
    body: "같은 시간, 다른 시선으로 쌓아가는 글과 사진이 있어요.\n누구든 들러 읽고, 한 마디 두고 갈 수 있어요. 빈 자리에 닉네임 하나 적어두면 그게 우리에겐 작은 편지가 됩니다.",
  },
  yProfile: {
    title: "영 · 대영",
    desc: "기록하는 사람",
    body: "마음에 남는 장면을 그날의 빛으로 적어두려고 합니다. 일기처럼, 편지처럼.",
  },
  hProfile: {
    title: "희 · 희서",
    desc: "사진 찍는 사람",
    body: "지나가는 풍경에 잠깐 멈춰 서는 일을 좋아합니다. 같은 자리에 두 번 가보는 일도요.",
  },
  story: {
    title: "왜 이런 곳을 만들었냐면",
    body: "두 사람의 글이 우연히 만나는 페이지를 갖고 싶었습니다. 따로 또 같이 쓰는 게 어떤 모양일지 궁금해서, 그저 그 모양을 한번 만들어보고 있는 중입니다.",
  },
  contact: {
    title: "혹시 하고 싶은 말이 있다면",
    body: "댓글로 남겨주세요. 닉네임만 적으면 충분해요.",
  },
};

export default function AboutPage() {
  return (
    <div className="container narrow fade-in">
      <div style={{ padding: "40px 0 32px", textAlign: "center" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          about
        </div>
        <h1 className="serif" style={{ fontSize: 36, marginTop: 4 }}>
          {ABOUT.header.title}
        </h1>
        <div
          className="serif"
          style={{ color: "var(--ink-2)", marginTop: 8 }}
        >
          {ABOUT.header.body}
        </div>
      </div>

      <div className="divider-dot" />

      <div className="prose" style={{ marginBottom: 40 }}>
        <h3 className="serif" style={{ fontSize: 22, marginBottom: 12 }}>
          {ABOUT.greeting.title}
        </h3>
        {ABOUT.greeting.body.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <div
          className="card y"
          style={{
            background:
              "linear-gradient(180deg, var(--y-soft) 0%, var(--paper-2) 80px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span
              className="avatar-mini y"
              style={{ width: 40, height: 40, fontSize: 16 }}
            >
              Y
            </span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
                {ABOUT.yProfile.title}
              </div>
              <div
                className="hand"
                style={{ fontSize: 17, color: "var(--y-deep)" }}
              >
                {ABOUT.yProfile.desc}
              </div>
            </div>
          </div>
          <div
            className="serif"
            style={{
              fontSize: 14.5,
              lineHeight: 1.8,
              color: "var(--ink-2)",
            }}
          >
            {ABOUT.yProfile.body}
          </div>
        </div>

        <div
          className="card h"
          style={{
            background:
              "linear-gradient(180deg, var(--h-soft) 0%, var(--paper-2) 80px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span
              className="avatar-mini h"
              style={{ width: 40, height: 40, fontSize: 16 }}
            >
              H
            </span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
                {ABOUT.hProfile.title}
              </div>
              <div
                className="hand"
                style={{ fontSize: 17, color: "var(--h-deep)" }}
              >
                {ABOUT.hProfile.desc}
              </div>
            </div>
          </div>
          <div
            className="serif"
            style={{
              fontSize: 14.5,
              lineHeight: 1.8,
              color: "var(--ink-2)",
            }}
          >
            {ABOUT.hProfile.body}
          </div>
        </div>
      </div>

      <div className="prose" style={{ marginBottom: 40 }}>
        <h3 className="serif" style={{ fontSize: 22, marginBottom: 12 }}>
          {ABOUT.story.title}
        </h3>
        <p>{ABOUT.story.body}</p>
      </div>

      <div
        className="card-flat"
        style={{
          background: "var(--paper-ink)",
          padding: 20,
          textAlign: "center",
        }}
      >
        <div className="hand" style={{ fontSize: 18, color: "var(--ink-3)" }}>
          {ABOUT.contact.title}
        </div>
        <div className="serif" style={{ fontSize: 18, marginTop: 4 }}>
          {ABOUT.contact.body}
        </div>
      </div>
    </div>
  );
}
