"use client";

import { useEffect, useMemo, useState } from "react";
import Icons from "@/components/Icons";
import {
  CATEGORY_LABEL, CATEGORY_OPTIONS, fmtPeriod, fmtLocation, ddayInfo, posterClassFor,
  type EventRow,
} from "@/lib/events";

export default function EventsClient({ events }: { events: EventRow[] }) {
  const [category, setCategory] = useState("all");

  // Read ?category= after mount (plain browser API, not useSearchParams) so this
  // page stays statically prerendered instead of bailing to client-only render.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (fromUrl) setCategory(fromUrl);
  }, []);

  const live = useMemo(() => {
    return events
      .map((ev, i) => ({ ev, dday: ddayInfo(ev.start_date, ev.end_date), posterClass: posterClassFor(i) }))
      .filter((x): x is { ev: EventRow; dday: string; posterClass: string } => x.dday !== null);
  }, [events]);

  const filtered = useMemo(
    () => (category === "all" ? live : live.filter((x) => x.ev.category === category)),
    [live, category]
  );

  return (
    <>
      <Icons />

      <nav className="nav">
        <div className="wrap nav-row">
          <a href="/" className="brand">
            <svg viewBox="0 0 120 120"><use href="#cup" /></svg>
            OFF <span className="accent">UP</span>
          </a>
        </div>
      </nav>

      <div className="wrap">
        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-label">OFF · 오프라인</p>
              <h2 className="section-title">전체 행사 보기</h2>
            </div>
          </div>

          <div className="region-tabs">
            <button className={`region-tab${category === "all" ? " on" : ""}`} onClick={() => setCategory("all")}>전체</button>
            {CATEGORY_OPTIONS.map((o) => (
              <button key={o.value} className={`region-tab${category === o.value ? " on" : ""}`} onClick={() => setCategory(o.value)}>
                {o.label}
              </button>
            ))}
          </div>

          <div className="feed-grid">
            {filtered.map(({ ev, dday, posterClass }) => (
              <div key={ev.id} className="feed-card">
                <div
                  className={ev.image_url ? "card-image poster" : `card-image poster ${posterClass}`}
                  style={ev.image_url ? { backgroundImage: `url('${ev.image_url}')` } : undefined}
                >
                  <div className="poster-top">
                    <span className="poster-tag">{CATEGORY_LABEL[ev.category]}</span>
                    <span className="poster-dday">{dday}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3>{ev.title}</h3>
                  <p className="card-meta">
                    {fmtLocation(ev.sido, ev.sigungu, ev.place)}
                    {fmtLocation(ev.sido, ev.sigungu, ev.place) && fmtPeriod(ev.start_date, ev.end_date) ? " · " : ""}
                    {fmtPeriod(ev.start_date, ev.end_date)}
                  </p>
                  <div className="card-foot">
                    <span className="stat-mini">검수: {ev.verify_status || "확인 필요"}</span>
                    {ev.source_url && (
                      <a className="section-link" style={{ fontSize: 11 }} href={ev.source_url} target="_blank" rel="noopener noreferrer">출처 →</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="feed-empty">등록된 행사가 없어요.</p>
            )}
          </div>
        </section>
      </div>

      <footer>
        <p>OFF UP · 서비스 준비 중인 플랫폼입니다.</p>
      </footer>
    </>
  );
}
