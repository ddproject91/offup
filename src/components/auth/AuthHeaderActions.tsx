"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthHeaderActions() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="nav-cta" />;

  if (user) {
    return (
      <div className="nav-cta">
        <a className="btn btn-ghost" href="/mypage">{user.nickname || user.email} 님</a>
        <button type="button" className="btn btn-ghost" onClick={() => logout()}>로그아웃</button>
      </div>
    );
  }

  return (
    <div className="nav-cta">
      <a className="btn btn-ghost" href="/login">로그인</a>
      <a className="btn btn-accent" href="/signup">회원가입</a>
    </div>
  );
}
