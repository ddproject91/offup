import { getSupabaseAdmin } from "@/lib/supabase";
import type { EventRow } from "@/lib/events";
import { logoutAction } from "../login/actions";
import EventsEditor from "./EventsEditor";

export default async function AdminEventsPage() {
  const supabase = getSupabaseAdmin();
  let events: EventRow[] = [];
  let loadError: string | null = null;

  if (!supabase) {
    loadError = "Supabase 환경변수가 설정되지 않았습니다.";
  } else {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true, nullsFirst: false });
    if (error) loadError = error.message;
    else events = (data ?? []) as EventRow[];
  }

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <h1>OFF UP 행사 관리</h1>
        <form action={logoutAction}>
          <button type="submit" className="logout-btn">로그아웃</button>
        </form>
      </div>
      {loadError ? (
        <p className="admin-error">행사를 불러오지 못했어요: {loadError}</p>
      ) : (
        <EventsEditor initialEvents={events} />
      )}

      <style>{`
        .admin-wrap { max-width: 980px; margin: 0 auto; padding: 24px 20px 80px; font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; color: #17181A; }
        .admin-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .admin-topbar h1 { font-size: 20px; font-weight: 900; margin: 0; }
        .logout-btn { background: none; border: 1px solid #E1E1DD; border-radius: 999px; padding: 8px 16px; font-size: 13px; cursor: pointer; }
        .logout-btn:hover { border-color: #9A9C9F; }
        .admin-error { color: #E8380F; font-size: 14px; }
      `}</style>
    </div>
  );
}
