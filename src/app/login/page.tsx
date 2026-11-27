"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Icons from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const { login, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) router.push("/");
  }

  return (
    <div className="auth-page">
      <Icons />
      <div className="wrap auth-wrap">
        <a href="/" className="brand">
          <svg viewBox="0 0 120 120"><use href="#cup" /></svg>
          OFF <span className="accent">UP</span>
        </a>
        <h1>로그인</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">이메일</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">비밀번호</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {authError && <p className="auth-error">{authError}</p>}

          <button type="submit" className="btn btn-accent" disabled={submitting} style={{ justifyContent: "center" }}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>

          <p className="auth-switch">
            아직 계정이 없으신가요? <a href="/signup">회원가입</a>
          </p>
        </form>
      </div>

      <style>{`
        .auth-page { min-height: 100dvh; display: flex; align-items: center; background: var(--bg); }
        .auth-wrap { max-width: 400px; width: 100%; margin-inline: auto; padding-block: 60px; }
        .auth-wrap h1 { font-size: 24px; margin: 24px 0 24px; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 12.5px; font-weight: 700; color: var(--text-soft); }
        .field input {
          border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; font-size: 14px;
          font-family: var(--font-body); outline: none; background: var(--surface); color: var(--text);
        }
        .field input:focus { border-color: var(--accent); }
        .auth-error { color: var(--accent-deep); font-size: 13px; margin: 0; }
        .auth-switch { text-align: center; font-size: 13px; color: var(--text-soft); margin: 4px 0 0; }
        .auth-switch a { color: var(--accent-deep); font-weight: 700; text-decoration: none; }
      `}</style>
    </div>
  );
}
