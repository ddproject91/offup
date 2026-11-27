"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Icons from "@/components/Icons";

export default function MyPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="mypage">
      <Icons />
      <nav className="nav">
        <div className="wrap nav-row">
          <a href="/" className="brand">
            <svg viewBox="0 0 120 120"><use href="#cup" /></svg>
            OFF <span className="accent">UP</span>
          </a>
          <div className="nav-cta">
            <button type="button" className="btn btn-ghost" onClick={() => logout()}>로그아웃</button>
          </div>
        </div>
      </nav>

      <div className="wrap mypage-wrap">
        <p className="section-label">MY</p>
        <h1>{user.nickname || user.email}님, 반가워요</h1>
        <p className="lede">찜한 행사와 작성한 후기는 곧 여기서 모아보실 수 있어요.</p>
      </div>

      <style>{`
        .mypage-wrap { padding-block: 48px 100px; }
        .mypage-wrap h1 { font-size: 26px; margin: 8px 0 12px; }
        .mypage-wrap .lede { font-size: 14px; color: var(--text-soft); }
      `}</style>
    </div>
  );
}
