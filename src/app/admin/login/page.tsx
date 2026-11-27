import { loginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="admin-login">
      <h1>OFF UP 관리자</h1>
      <p>비밀번호를 입력하면 행사 관리 화면으로 이동합니다.</p>
      <form action={loginAction}>
        <input type="hidden" name="next" value={sp.next ?? "/admin/events"} />
        <input
          type="password"
          name="password"
          placeholder="관리자 비밀번호"
          autoFocus
          required
        />
        {sp.error && <p className="error">비밀번호가 올바르지 않습니다.</p>}
        <button type="submit">로그인</button>
      </form>

      <style>{`
        .admin-login {
          max-width: 360px; margin: 0 auto; min-height: 70vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 24px; font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
        }
        .admin-login h1 { font-size: 20px; font-weight: 900; color: #17181A; margin: 0 0 4px; }
        .admin-login p { font-size: 13px; color: #5B5D61; margin: 0 0 24px; }
        .admin-login form { display: flex; flex-direction: column; gap: 12px; }
        .admin-login input[type="password"] {
          border: 1px solid #D8D9D7; border-radius: 12px; padding: 12px 16px; font-size: 14px; outline: none;
        }
        .admin-login input[type="password"]:focus { border-color: #FF4A2B; }
        .admin-login .error { font-size: 12px; font-weight: 700; color: #E8380F; margin: 0; }
        .admin-login button {
          border: none; border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 700;
          background: #17181A; color: #fff; cursor: pointer;
        }
        .admin-login button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
