import { getAboutContent, sectionByKey } from "@/lib/about";
import SafeHtml from "@/components/SafeHtml";

export const metadata = { title: "소개 — 영희네 작업실" };
// admin/about/actions에서 revalidatePath("/about") 호출하므로 5분 stale 허용 안전
export const revalidate = 300;

export default async function AboutPage() {
  const content = await getAboutContent();
  const s = (key: string) => sectionByKey(content.sections, key);

  const header = s("header");
  const greeting = s("greeting");
  const yProfile = s("y_profile");
  const hProfile = s("h_profile");
  const story = s("story");
  const contact = s("contact");

  return (
    <div className="container narrow fade-in">
      <div style={{ padding: "40px 0 32px", textAlign: "center" }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink-3)" }}>
          about
        </div>
        <h1 className="serif" style={{ fontSize: 36, marginTop: 4 }}>
          {header?.title ?? "영희네 작업실"}
        </h1>
        {header?.body && (
          <SafeHtml
            html={header.body}
            className="serif"
          />
        )}
      </div>

      <div className="divider-dot" />

      {greeting && (
        <div className="prose" style={{ marginBottom: 40 }}>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 12 }}>
            {greeting.title}
          </h3>
          <SafeHtml html={greeting.body} />
        </div>
      )}

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
              style={{ width: 40, height: 40, fontSize: 16, overflow: "hidden" }}
            >
              {yProfile?.imageUrl ? (
                <img
                  src={yProfile.imageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "Y"
              )}
            </span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
                Y
              </div>
              <div
                className="hand"
                style={{ fontSize: 17, color: "var(--y-deep)" }}
              >
                {yProfile?.subtitle?.trim() || "기록하는 사람"}
              </div>
            </div>
          </div>
          {yProfile?.body && (
            <SafeHtml
              html={yProfile.body}
              className="serif"
            />
          )}
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
              style={{ width: 40, height: 40, fontSize: 16, overflow: "hidden" }}
            >
              {hProfile?.imageUrl ? (
                <img
                  src={hProfile.imageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "H"
              )}
            </span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
                H
              </div>
              <div
                className="hand"
                style={{ fontSize: 17, color: "var(--h-deep)" }}
              >
                {hProfile?.subtitle?.trim() || "사진 찍는 사람"}
              </div>
            </div>
          </div>
          {hProfile?.body && (
            <SafeHtml html={hProfile.body} className="serif" />
          )}
        </div>
      </div>

      {story && (
        <div className="prose" style={{ marginBottom: 40 }}>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 12 }}>
            {story.title}
          </h3>
          <SafeHtml html={story.body} />
        </div>
      )}

      {contact && (
        <div
          className="card-flat"
          style={{
            background: "var(--paper-ink)",
            padding: 20,
            textAlign: "center",
          }}
        >
          <div className="hand" style={{ fontSize: 18, color: "var(--ink-3)" }}>
            {contact.title}
          </div>
          <SafeHtml html={contact.body} className="serif" />
        </div>
      )}
    </div>
  );
}
