"use client";

import { useEffect, useMemo, useState } from "react";
import Icons from "@/components/Icons";
import EventCard from "@/components/EventCard";
import {
  CATEGORY_OPTIONS, ddayInfo, posterClassFor,
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
              <EventCard key={ev.id} ev={ev} dday={dday} posterClass={posterClass} showFoot />
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
