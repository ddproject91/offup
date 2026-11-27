"use client";

import { useState } from "react";
import { CATEGORY_OPTIONS, CATEGORY_LABEL, type EventRow } from "@/lib/events";
import ImageField from "@/components/ImageField";
import { saveEventAction, deleteEventAction, uploadImageAction, type EventInput } from "./actions";

const EMPTY: EventInput = {
  event_code: "",
  title: "",
  category: "popup",
  start_date: "",
  end_date: "",
  sido: "",
  sigungu: "",
  place: "",
  image_url: "",
  source_url: "",
  intro: "",
  verify_status: "확인 필요",
  published: true,
  featured: false,
};

export default function EventsEditor({ initialEvents }: { initialEvents: EventRow[] }) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [form, setForm] = useState<EventInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function startEdit(ev: EventRow) {
    setEditingId(ev.id);
    setForm({
      id: ev.id,
      event_code: ev.event_code ?? "",
      title: ev.title,
      category: ev.category,
      start_date: ev.start_date ?? "",
      end_date: ev.end_date ?? "",
      sido: ev.sido ?? "",
      sigungu: ev.sigungu ?? "",
      place: ev.place ?? "",
      image_url: ev.image_url ?? "",
      source_url: ev.source_url ?? "",
      intro: ev.intro ?? "",
      verify_status: ev.verify_status ?? "확인 필요",
      published: ev.published,
      featured: ev.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setSaveError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const result = await saveEventAction(editingId ? { ...form, id: editingId } : form);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 행사를 삭제할까요?")) return;
    const result = await deleteEventAction(id);
    if (!result.ok) {
      alert("삭제 실패: " + result.error);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <div className="form-card">
        <h2>{editingId ? "행사 수정" : "새 행사 추가"}</h2>
        <div className="grid2">
          <label className="field">
            <span className="field-label">행사명 *</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">카테고리</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventInput["category"] })}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">시작일</span>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">종료일</span>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">시/도</span>
            <input value={form.sido} onChange={(e) => setForm({ ...form, sido: e.target.value })} placeholder="예: 서울특별시" />
          </label>
          <label className="field">
            <span className="field-label">시/군/구</span>
            <input value={form.sigungu} onChange={(e) => setForm({ ...form, sigungu: e.target.value })} placeholder="예: 성동구" />
          </label>
          <label className="field">
            <span className="field-label">장소명</span>
            <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="예: 성수동 팝업 공간" />
          </label>
          <label className="field">
            <span className="field-label">출처 링크</span>
            <input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="https://..." />
          </label>
        </div>

        <ImageField value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} upload={uploadImageAction} />

        <label className="field">
          <span className="field-label">소개</span>
          <textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} rows={3} />
        </label>

        <div className="grid2">
          <label className="field">
            <span className="field-label">검수 상태</span>
            <select value={form.verify_status} onChange={(e) => setForm({ ...form, verify_status: e.target.value })}>
              <option value="확인 필요">확인 필요</option>
              <option value="부분 확인">부분 확인</option>
              <option value="확인">확인</option>
            </select>
          </label>
          <label className="field checkbox-field">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <span>사이트에 노출</span>
          </label>
          <label className="field checkbox-field">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span>상단 캐러셀에 추천 노출</span>
          </label>
        </div>

        {saveError && <p className="field-error">{saveError}</p>}

        <div className="form-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : editingId ? "수정 저장" : "행사 추가"}
          </button>
          {editingId && (
            <button className="btn-cancel" onClick={resetForm} type="button">취소</button>
          )}
        </div>
      </div>

      <h2 className="list-title">전체 행사 ({events.length})</h2>
      <div className="event-list">
        {events.length === 0 && <p className="empty">등록된 행사가 없어요.</p>}
        {events.map((ev) => (
          <div key={ev.id} className="event-row">
            <div className="event-thumb">
              {ev.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ev.image_url} alt="" />
              ) : (
                <span className="no-img">이미지 없음</span>
              )}
            </div>
            <div className="event-info">
              <p className="event-title">
                {ev.title} {!ev.published && <span className="badge-hidden">비공개</span>}
                {ev.featured && <span className="badge-featured">추천</span>}
              </p>
              <p className="event-meta">
                {CATEGORY_LABEL[ev.category]} · {[ev.sido, ev.sigungu, ev.place].filter(Boolean).join(" ")} · {ev.start_date ?? "-"}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ""}
              </p>
            </div>
            <div className="event-actions">
              <button onClick={() => startEdit(ev)}>수정</button>
              <button onClick={() => handleDelete(ev.id)} className="danger">삭제</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .form-card { background: #fff; border: 1px solid #E1E1DD; border-radius: 16px; padding: 24px; margin-bottom: 32px; }
        .form-card h2 { font-size: 16px; font-weight: 900; margin: 0 0 16px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .field-label { font-size: 12px; font-weight: 700; color: #5B5D61; }
        .field input[type="text"], .field input[type="date"], .field select, .field textarea {
          border: 1px solid #E1E1DD; border-radius: 10px; padding: 9px 12px; font-size: 13.5px; font-family: inherit; outline: none;
        }
        .field input:focus, .field select:focus, .field textarea:focus { border-color: #FF4A2B; }
        .field-error { color: #E8380F; font-size: 12px; margin: 4px 0 0; }
        .checkbox-field { flex-direction: row; align-items: center; gap: 8px; margin-top: 20px; }
        .image-row { display: flex; gap: 8px; }
        .image-row input { flex: 1; min-width: 0; }
        .upload-btn {
          flex: none; border: 1px solid #E1E1DD; border-radius: 10px; padding: 9px 14px; font-size: 12.5px;
          cursor: pointer; white-space: nowrap; background: #F5F5F2;
        }
        .upload-btn:hover { border-color: #9A9C9F; }
        .image-preview { margin-top: 8px; width: 160px; height: 120px; object-fit: cover; border-radius: 10px; border: 1px solid #E1E1DD; }
        .form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .btn-save { background: #17181A; color: #fff; border: none; border-radius: 999px; padding: 11px 22px; font-size: 13.5px; font-weight: 700; cursor: pointer; }
        .btn-save:disabled { opacity: 0.6; cursor: default; }
        .btn-cancel { background: none; border: 1px solid #E1E1DD; border-radius: 999px; padding: 11px 22px; font-size: 13.5px; cursor: pointer; }

        .list-title { font-size: 15px; font-weight: 900; margin: 0 0 12px; }
        .event-list { display: flex; flex-direction: column; gap: 10px; }
        .empty { color: #9A9C9F; font-size: 13px; }
        .event-row { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #E1E1DD; border-radius: 12px; padding: 10px 14px; }
        .event-thumb { width: 64px; height: 48px; flex: none; border-radius: 8px; overflow: hidden; background: #F5F5F2; display: flex; align-items: center; justify-content: center; }
        .event-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .no-img { font-size: 9px; color: #9A9C9F; text-align: center; }
        .event-info { flex: 1; min-width: 0; }
        .event-title { font-size: 14px; font-weight: 700; margin: 0; }
        .badge-hidden { font-size: 10px; font-weight: 700; color: #E8380F; background: #FFE2DA; padding: 2px 7px; border-radius: 999px; margin-left: 6px; }
        .badge-featured { font-size: 10px; font-weight: 700; color: #B85B00; background: #FFEFCF; padding: 2px 7px; border-radius: 999px; margin-left: 6px; }
        .event-meta { font-size: 12px; color: #5B5D61; margin: 2px 0 0; }
        .event-actions { display: flex; gap: 6px; flex: none; }
        .event-actions button { border: 1px solid #E1E1DD; background: #fff; border-radius: 8px; padding: 6px 12px; font-size: 12.5px; cursor: pointer; }
        .event-actions button:hover { border-color: #9A9C9F; }
        .event-actions button.danger { color: #E8380F; border-color: #FFE2DA; }
        .event-actions button.danger:hover { border-color: #E8380F; }
      `}</style>
    </div>
  );
}
