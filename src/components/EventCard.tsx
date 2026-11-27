import { CATEGORY_LABEL, fmtPeriod, fmtLocation, parseHashtags, type EventRow } from "@/lib/events";

export default function EventCard({
  ev,
  dday,
  posterClass,
  showFoot = false,
}: {
  ev: EventRow;
  dday: string;
  posterClass: string;
  showFoot?: boolean;
}) {
  const hashtags = parseHashtags(ev.hashtags);

  return (
    <div className="feed-card">
      <div
        className={ev.image_url ? "card-image poster" : `card-image poster ${posterClass}`}
        style={ev.image_url ? { backgroundImage: `url('${ev.image_url}')` } : undefined}
      />
      <div className="card-body">
        <div className="card-badges">
          <span className="card-cat-badge">{CATEGORY_LABEL[ev.category]}</span>
          <span className="card-dday-badge">{dday}</span>
        </div>
        <p className="card-period num">{fmtPeriod(ev.start_date, ev.end_date)}</p>
        <h3>{ev.title}</h3>
        <p className="card-meta">{fmtLocation(ev.sido, ev.sigungu, ev.place)}</p>
        {hashtags.length > 0 && (
          <p className="card-tags">{hashtags.map((t) => `#${t}`).join(" ")}</p>
        )}
        {showFoot && (
          <div className="card-foot">
            <span className="stat-mini">검수: {ev.verify_status || "확인 필요"}</span>
            {ev.source_url && (
              <a className="section-link" style={{ fontSize: 11 }} href={ev.source_url} target="_blank" rel="noopener noreferrer">출처 →</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
