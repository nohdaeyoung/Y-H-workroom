"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { googleSignInAction } from "@/app/login/actions";
import {
  updatePasswordAction,
  updateProfileAction,
  type AccountActionState,
} from "@/app/admin/account/actions";

const initial: AccountActionState = { error: "" };

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 6 }}>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28.4l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.4-.4-3.5z" />
  </svg>
);

type Props = {
  userId: "Y" | "H";
  userName: string;
  userDesc: string;
  userCls: "y" | "h";
  googleEnabled: boolean;
  userEmail: string;
};

export default function AdminAccountClient({
  userId,
  userName,
  userDesc,
  userCls,
  googleEnabled,
  userEmail,
}: Props) {
  return (
    <>
      <ProfileForm
        userId={userId}
        userName={userName}
        userDesc={userDesc}
        userCls={userCls}
      />

      <PasswordForm />

      <GoogleLinkSection
        googleEnabled={googleEnabled}
        userEmail={userEmail}
      />
    </>
  );
}

function ProfileForm({
  userId,
  userName,
  userDesc,
  userCls,
}: {
  userId: "Y" | "H";
  userName: string;
  userDesc: string;
  userCls: "y" | "h";
}) {
  const [state, action] = useFormState(updateProfileAction, initial);
  const [displayName, setDisplayName] = useState(userName);
  const [desc, setDesc] = useState(userDesc);

  return (
    <form action={action} className="card mb-16">
      <h3 className="section-title" style={{ marginBottom: 16 }}>
        프로필
      </h3>
      <div
        className="row gap-16"
        style={{ alignItems: "center", flexWrap: "wrap" }}
      >
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
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            required
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
          name="desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="작업실 안에서 보일 짧은 소개"
          maxLength={200}
        />
      </div>
      <div
        className="row-between"
        style={{ marginTop: 16, flexWrap: "wrap", gap: 8 }}
      >
        {state.error && (
          <span className="meta" style={{ color: "var(--danger)" }}>
            {state.error}
          </span>
        )}
        {state.ok && (
          <span className="meta" style={{ color: "var(--success)" }}>
            ✓ 프로필 저장됨
          </span>
        )}
        <ProfileSaveBtn />
      </div>
    </form>
  );
}

function ProfileSaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending}
      style={{ marginLeft: "auto" }}
    >
      {pending ? "저장 중…" : "프로필 저장"}
    </button>
  );
}

function PasswordForm() {
  const [state, action] = useFormState(updatePasswordAction, initial);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (state.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }, [state.ok]);

  return (
    <form action={action} className="card mb-16">
      <h3 className="section-title" style={{ marginBottom: 16 }}>
        비밀번호
      </h3>
      <div className="col gap-12">
        <div>
          <label className="label">현재 비밀번호</label>
          <input
            className="input"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div className="row gap-12" style={{ flexWrap: "wrap" }}>
          <div className="flex-1" style={{ minWidth: 160 }}>
            <label className="label">새 비밀번호 (4자 이상)</label>
            <input
              className="input"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={4}
            />
          </div>
          <div className="flex-1" style={{ minWidth: 160 }}>
            <label className="label">새 비밀번호 확인</label>
            <input
              className="input"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>
      </div>
      <div
        className="row-between"
        style={{ marginTop: 16, flexWrap: "wrap", gap: 8 }}
      >
        {state.error && (
          <span className="meta" style={{ color: "var(--danger)" }}>
            {state.error}
          </span>
        )}
        {state.ok && (
          <span className="meta" style={{ color: "var(--success)" }}>
            ✓ 비밀번호 변경됨
          </span>
        )}
        <PasswordSaveBtn />
      </div>
    </form>
  );
}

function PasswordSaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending}
      style={{ marginLeft: "auto" }}
    >
      {pending ? "변경 중…" : "비밀번호 변경"}
    </button>
  );
}

function GoogleLinkSection({
  googleEnabled,
  userEmail,
}: {
  googleEnabled: boolean;
  userEmail: string;
}) {
  return (
    <div className="card mb-16">
      <h3 className="section-title" style={{ marginBottom: 8 }}>
        구글 계정 연동
      </h3>
      <div className="meta" style={{ marginBottom: 16 }}>
        연동 후에는 구글 로그인도 사용할 수 있어요. 사전 등록된 Y/H 이메일만 허용됩니다.
      </div>

      {!googleEnabled ? (
        <div
          className="card-flat"
          style={{
            padding: 14,
            background: "var(--paper-ink)",
            border: "1px dashed var(--line-2)",
            fontSize: 13,
          }}
        >
          <span className="meta">
            GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 환경변수를 추가하면 활성화돼요.
          </span>
        </div>
      ) : userEmail ? (
        <div
          className="card-flat"
          style={{
            padding: 14,
            background: "var(--paper)",
            border: "1px solid var(--line)",
          }}
        >
          <div className="row" style={{ gap: 12 }}>
            <GoogleIcon />
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 500 }}>{userEmail}</div>
              <div className="meta">현재 세션에서 사용 중인 이메일</div>
            </div>
            <span
              className="chip live"
              style={{ alignSelf: "center", fontSize: 11 }}
            >
              연동됨
            </span>
          </div>
        </div>
      ) : (
        <form action={googleSignInAction}>
          <input type="hidden" name="callbackUrl" value="/admin/account" />
          <button type="submit" className="btn" style={{ width: "100%" }}>
            <GoogleIcon />
            구글 계정으로 로그인 (연동)
          </button>
        </form>
      )}
    </div>
  );
}
