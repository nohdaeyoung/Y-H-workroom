"use client";

import { useState } from "react";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 6 }}>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z"
    />
  </svg>
);

type Props = {
  userId: "Y" | "H";
  userName: string;
  userCls: "y" | "h";
};

export default function AdminAccountClient({ userId, userName, userCls }: Props) {
  const [displayName, setDisplayName] = useState(userName);
  const [desc, setDesc] = useState("");
  const [linked, setLinked] = useState(false);

  return (
    <>
      {/* 프로필 */}
      <div className="card mb-16">
        <h3 className="section-title" style={{ marginBottom: 16 }}>
          프로필
        </h3>
        <div className="row gap-16" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <span
            className={`avatar-mini ${userCls}`}
            style={{ width: 64, height: 64, fontSize: 22 }}
          >
            {userId}
          </span>
          <div className="flex-1" style={{ minWidth: 180 }}>
            <label className="label">표시 이름</label>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <button type="button" className="btn" disabled>
            이미지 변경
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="label">한 줄 설명</label>
          <input
            className="input"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="작업실 안에서 보일 짧은 소개"
          />
        </div>
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
          <button type="button" className="btn btn-primary" disabled>
            프로필 저장 (데모)
          </button>
        </div>
      </div>

      {/* 비밀번호 */}
      <div className="card mb-16">
        <h3 className="section-title" style={{ marginBottom: 16 }}>
          비밀번호
        </h3>
        <div className="col gap-12">
          <div>
            <label className="label">현재 비밀번호</label>
            <input className="input" type="password" autoComplete="current-password" />
          </div>
          <div className="row gap-12" style={{ flexWrap: "wrap" }}>
            <div className="flex-1" style={{ minWidth: 160 }}>
              <label className="label">새 비밀번호</label>
              <input className="input" type="password" autoComplete="new-password" />
            </div>
            <div className="flex-1" style={{ minWidth: 160 }}>
              <label className="label">새 비밀번호 확인</label>
              <input className="input" type="password" autoComplete="new-password" />
            </div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
          <button type="button" className="btn btn-primary" disabled>
            비밀번호 변경 (데모)
          </button>
        </div>
      </div>

      {/* 구글 연동 */}
      <div className="card mb-16">
        <h3 className="section-title" style={{ marginBottom: 8 }}>
          구글 계정 연동
        </h3>
        <div className="meta" style={{ marginBottom: 16 }}>
          연동 후에는 구글 로그인도 사용할 수 있어요. 사전 등록된 Y/H의 이메일만
          허용됩니다.
        </div>
        {linked ? (
          <div
            className="card-flat"
            style={{
              padding: 14,
              background: "var(--paper)",
              border: "1px solid var(--line)",
            }}
          >
            <div className="row-between" style={{ flexWrap: "wrap", gap: 8 }}>
              <div className="row gap-12">
                <GoogleIcon />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    yh.{userId.toLowerCase()}@gmail.com
                  </div>
                  <div className="meta">방금 연동</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setLinked(false)}
              >
                연동 해제
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn"
            style={{ width: "100%" }}
            onClick={() => setLinked(true)}
          >
            <GoogleIcon />
            구글 계정 연동하기 (데모)
          </button>
        )}
      </div>
    </>
  );
}
