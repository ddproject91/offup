"use client";

import { useState } from "react";
import type { UpPost } from "@/lib/upPosts";
import { saveUpPostAction, deleteUpPostAction, type UpPostInput } from "./actions";

const EMPTY: UpPostInput = {
  title: "",
  tag: "",
  description: "",
  link_url: "",
  post_date: "",
  published: true,
};

export default function UpPostsEditor({ initialPosts }: { initialPosts: UpPost[] }) {
  const [posts, setPosts] = useState<UpPost[]>(initialPosts);
  const [form, setForm] = useState<UpPostInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function startEdit(p: UpPost) {
    setEditingId(p.id);
    setForm({
      id: p.id,
      title: p.title,
      tag: p.tag ?? "",
      description: p.description ?? "",
      link_url: p.link_url ?? "",
      post_date: p.post_date ?? "",
      published: p.published,
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
    const result = await saveUpPostAction(editingId ? { ...form, id: editingId } : form);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 소식을 삭제할까요?")) return;
    const result = await deleteUpPostAction(id);
    if (!result.ok) {
      alert("삭제 실패: " + result.error);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <div className="form-card">
        <h2>{editingId ? "소식 수정" : "새 UP 소식 추가"}</h2>
        <div className="grid2">
          <label className="field">
            <span className="field-label">제목 *</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">태그</span>
            <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="예: 핫딜, 설문조사, 콜라보" />
          </label>
          <label className="field">
            <span className="field-label">날짜</span>
            <input type="date" value={form.post_date} onChange={(e) => setForm({ ...form, post_date: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">링크</span>
            <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
          </label>
        </div>

        <label className="field">
          <span className="field-label">설명</span>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </label>

        <label className="field checkbox-field">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          <span>사이트에 노출</span>
        </label>

        {saveError && <p className="field-error">{saveError}</p>}

        <div className="form-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : editingId ? "수정 저장" : "소식 추가"}
          </button>
          {editingId && (
            <button className="btn-cancel" onClick={resetForm} type="button">취소</button>
          )}
        </div>
      </div>

      <h2 className="list-title">전체 UP 소식 ({posts.length})</h2>
      <div className="event-list">
        {posts.length === 0 && <p className="empty">등록된 소식이 없어요.</p>}
        {posts.map((p) => (
          <div key={p.id} className="event-row">
            <div className="event-info">
              <p className="event-title">
                {p.title} {!p.published && <span className="badge-hidden">비공개</span>}
              </p>
              <p className="event-meta">
                {p.tag || "태그 없음"} · {p.post_date ?? "-"}
              </p>
            </div>
            <div className="event-actions">
              <button onClick={() => startEdit(p)}>수정</button>
              <button onClick={() => handleDelete(p.id)} className="danger">삭제</button>
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
        .field input[type="text"], .field input[type="date"], .field textarea {
          border: 1px solid #E1E1DD; border-radius: 10px; padding: 9px 12px; font-size: 13.5px; font-family: inherit; outline: none;
        }
        .field input, .field textarea { border: 1px solid #E1E1DD; border-radius: 10px; padding: 9px 12px; font-size: 13.5px; font-family: inherit; outline: none; }
        .field input:focus, .field textarea:focus { border-color: #FF4A2B; }
        .field-error { color: #E8380F; font-size: 12px; margin: 4px 0 0; }
        .checkbox-field { flex-direction: row; align-items: center; gap: 8px; }
        .form-actions { display: flex; gap: 10px; margin-top: 8px; }
        .btn-save { background: #17181A; color: #fff; border: none; border-radius: 999px; padding: 11px 22px; font-size: 13.5px; font-weight: 700; cursor: pointer; }
        .btn-save:disabled { opacity: 0.6; cursor: default; }
        .btn-cancel { background: none; border: 1px solid #E1E1DD; border-radius: 999px; padding: 11px 22px; font-size: 13.5px; cursor: pointer; }

        .list-title { font-size: 15px; font-weight: 900; margin: 0 0 12px; }
        .event-list { display: flex; flex-direction: column; gap: 10px; }
        .empty { color: #9A9C9F; font-size: 13px; }
        .event-row { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #E1E1DD; border-radius: 12px; padding: 10px 14px; }
        .event-info { flex: 1; min-width: 0; }
        .event-title { font-size: 14px; font-weight: 700; margin: 0; }
        .badge-hidden { font-size: 10px; font-weight: 700; color: #E8380F; background: #FFE2DA; padding: 2px 7px; border-radius: 999px; margin-left: 6px; }
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
