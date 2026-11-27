"use client";

import { useEffect, useMemo, useRef } from "react";
import Icons from "@/components/Icons";
import {
  CATEGORY_LABEL, CATEGORY_OPTIONS, fmtPeriod, fmtLocation, ddayInfo, posterClassFor,
  type EventRow,
} from "@/lib/events";

export default function HomeClient({ events }: { events: EventRow[] }) {
  const live = useMemo(() => {
    return events
      .map((ev, i) => ({ ev, dday: ddayInfo(ev.start_date, ev.end_date), posterClass: posterClassFor(i) }))
      .filter((x): x is { ev: EventRow; dday: string; posterClass: string } => x.dday !== null);
  }, [events]);

  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const feedEmptyRef = useRef<HTMLParagraphElement>(null);

  // Carousel: autoplay + swipe-sync + dots (operates on the DOM after React renders the slides).
  useEffect(() => {
    const track = trackRef.current;
    const dotsWrap = dotsRef.current;
    const counter = counterRef.current;
    if (!track || !dotsWrap || !counter) return;

    const slides = Array.from(track.querySelectorAll<HTMLElement>(".slide"));
    const count = slides.length;
    if (!count) return;
    let current = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    dotsWrap.innerHTML = "";
    const dots: HTMLButtonElement[] = [];
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === 0 ? " on" : "");
      b.setAttribute("aria-label", `${i + 1}번째 슬라이드로 이동`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    const pad = (n: number) => (n < 10 ? "0" + n : String(n));
    function updateUI(i: number) {
      dots.forEach((d, idx) => d.classList.toggle("on", idx === i));
      if (counter) counter.textContent = `${pad(i + 1)} / ${pad(count)}`;
    }
    function goTo(i: number) {
      current = (i + count) % count;
      slides[current].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
      updateUI(current);
    }

    let timer: number | null = null;
    function startAuto() {
      if (reduceMotion) return;
      if (timer) clearInterval(timer);
      timer = window.setInterval(() => goTo(current + 1), 4500);
    }
    function stopAuto() { if (timer) clearInterval(timer); }

    track.addEventListener("pointerdown", stopAuto);
    track.addEventListener("pointerup", startAuto);
    track.addEventListener("mouseenter", stopAuto);
    track.addEventListener("mouseleave", startAuto);

    let scrollTimeout: number;
    const onScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        const trackRect = track.getBoundingClientRect();
        const center = trackRect.left + trackRect.width / 2;
        let closest = 0, minDist = Infinity;
        slides.forEach((s, idx) => {
          const r = s.getBoundingClientRect();
          const dist = Math.abs(r.left + r.width / 2 - center);
          if (dist < minDist) { minDist = dist; closest = idx; }
        });
        current = closest;
        updateUI(current);
      }, 100);
    };
    track.addEventListener("scroll", onScroll, { passive: true });

    updateUI(0);
    startAuto();

    return () => {
      stopAuto();
      track.removeEventListener("scroll", onScroll);
    };
  }, [live.length]);

  function handleModeClick(mode: "off" | "up") {
    document.querySelectorAll<HTMLElement>(".mode-switch").forEach((sw) => {
      sw.dataset.active = mode;
      sw.querySelectorAll<HTMLButtonElement>(".mode-btn").forEach((btn) => {
        btn.classList.toggle("on", btn.dataset.mode === mode);
      });
    });
    const off = document.getElementById("off");
    const up = document.getElementById("up");
    if (off) off.hidden = mode !== "off";
    if (up) up.hidden = mode !== "up";
  }

  function handleTabClick(category: string) {
    document.querySelectorAll<HTMLButtonElement>(".region-tab").forEach((t) => t.classList.remove("on"));
    const activeTab = document.querySelector<HTMLButtonElement>(`.region-tab[data-category="${category}"]`);
    activeTab?.classList.add("on");
    const cards = document.querySelectorAll<HTMLElement>(".feed-card");
    let visibleCount = 0;
    cards.forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.hidden = !show;
      if (show) visibleCount++;
    });
    if (feedEmptyRef.current) feedEmptyRef.current.hidden = visibleCount !== 0;
  }

  return (
    <>
      <Icons />

      <nav className="nav">
        <div className="wrap nav-row">
          <a href="/" className="brand">
            <svg viewBox="0 0 120 120"><use href="#cup" /></svg>
            OFF <span className="accent">UP</span>
          </a>
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><use href="#search" /></svg>
            <input type="text" placeholder="지역, 행사 이름, 테마로 검색해보세요" />
          </div>
          <div className="nav-cta">
            <a className="btn btn-ghost" href="#">로그인</a>
            <a className="btn btn-accent" href="#">회원가입</a>
          </div>
          <div className="mode-switch mode-switch-nav" data-active="off">
            <span className="mode-thumb" />
            <button className="mode-btn on" data-mode="off" onClick={() => handleModeClick("off")}>OFF</button>
            <button className="mode-btn" data-mode="up" onClick={() => handleModeClick("up")}>UP</button>
          </div>
        </div>
      </nav>

      <div className="wrap">
        <section className="hero">
          <p className="eyebrow">Platform concept · Demo</p>
          <h1>오프라인에서 지금<br />열리는 모든 것</h1>
          <p className="lede">팝업스토어, 지역 축제, 신규 브랜드 오픈, 오프라인 이벤트를 한 곳에 모았어요. 관심사를 등록하면 놓치기 전에 알림으로 알려드려요.</p>
          <div className="hero-actions">
            <a className="btn btn-accent" href="#">무료로 회원가입</a>
            <a className="btn btn-ghost" href="#off">행사 둘러보기</a>
          </div>

          <p className="mode-hint">오프라인 행사는 OFF, 핫딜·설문·소식 같은 온라인 정보는 UP에서 확인하세요 — 오른쪽 위 스위치로 전환할 수 있어요.</p>

          <div className="hero-carousel">
            <div className="carousel-track" ref={trackRef}>
              {live.map(({ ev, dday, posterClass }) => (
                <div key={ev.id} className="slide">
                  <div
                    className={ev.image_url ? "slide-media poster" : `slide-media poster ${posterClass}`}
                    style={ev.image_url ? { backgroundImage: `url('${ev.image_url}')` } : undefined}
                  >
                    <div className="poster-top">
                      <span className="poster-tag">{CATEGORY_LABEL[ev.category]}</span>
                      <span className="poster-dday">{dday}</span>
                    </div>
                  </div>
                  <div className="slide-content">
                    <p className="slide-period">{fmtPeriod(ev.start_date, ev.end_date)}</p>
                    <h3 className="slide-title">{ev.title}</h3>
                    <p className="slide-loc">{fmtLocation(ev.sido, ev.sigungu, ev.place)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-nav">
              <div className="dots" ref={dotsRef} />
              <span className="carousel-counter" ref={counterRef}>01 / {String(live.length).padStart(2, "0")}</span>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat"><div className="v num">27,412</div><div className="l">가입 회원</div></div>
            <div className="stat"><div className="v num">312</div><div className="l">이번 달 등록된 행사</div></div>
            <div className="stat"><div className="v num">18</div><div className="l">진행 중인 타임세일</div></div>
            <div className="stat"><div className="v num">94,208</div><div className="l">누적 알림 발송</div></div>
          </div>
          <p className="stats-note">* 가입 회원·누적 알림 수치는 데모용 가상 데이터입니다.</p>
        </section>

        <section className="section" id="off">
          <div className="section-head">
            <div>
              <p className="section-label">OFF · 오프라인</p>
              <h2 className="section-title">전국에서 지금 열리는 오프라인</h2>
            </div>
            <a className="section-link" href="#">전체 행사 보기 →</a>
          </div>

          <div className="region-tabs">
            <button className="region-tab on" data-category="all" onClick={() => handleTabClick("all")}>전체</button>
            {CATEGORY_OPTIONS.map((o) => (
              <button key={o.value} className="region-tab" data-category={o.value} onClick={() => handleTabClick(o.value)}>
                {o.label}
              </button>
            ))}
          </div>

          <div className="feed-grid">
            {live.map(({ ev, dday, posterClass }) => (
              <div key={ev.id} className="feed-card" data-category={ev.category}>
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
            <p className="feed-empty" ref={feedEmptyRef} hidden={live.length !== 0}>
              아직 등록된 행사가 없어요 — 곧 채워질 예정이에요.
            </p>
          </div>
        </section>

        <section className="section" id="up" hidden>
          <div className="section-head">
            <div>
              <p className="section-label">UP · 온라인</p>
              <h2 className="section-title">온라인에서 바로</h2>
            </div>
          </div>

          <div className="timesale">
            <div className="up-subhead" style={{ marginTop: 0 }}>
              <h3>핫딜 · 브랜드세일</h3>
              <span className="section-link">전체 보기 →</span>
            </div>

            <div className="sale-grid">
              <div className="sale-card">
                <span className="sale-tag">12시간 핫딜</span>
                <span className="sale-off">-40%</span>
                <span className="sale-brand">텐트공작소</span>
                <p className="sale-name">2인용 캠핑 텐트 시즌오프</p>
                <div className="sale-price"><span className="was num">289,000원</span><span className="now num">173,400원</span></div>
                <div className="sale-foot"><span>재고 12개</span><span className="clock num">07:22:07 남음</span></div>
              </div>
              <div className="sale-card">
                <span className="sale-tag">12시간 핫딜</span>
                <span className="sale-off">-30%</span>
                <span className="sale-brand">무신사 스탠다드</span>
                <p className="sale-name">홍대점 오픈 기념 후드 집업</p>
                <div className="sale-price"><span className="was num">79,000원</span><span className="now num">55,300원</span></div>
                <div className="sale-foot"><span>재고 41개</span><span className="clock num">02:48:51 남음</span></div>
              </div>
              <div className="sale-card">
                <span className="sale-tag">12시간 핫딜</span>
                <span className="sale-off">-40%</span>
                <span className="sale-brand">아더에러 × 카카오프렌즈</span>
                <p className="sale-name">협업 한정판 에코백 세트</p>
                <div className="sale-price"><span className="was num">45,000원</span><span className="now num">27,000원</span></div>
                <div className="sale-foot"><span>재고 8개</span><span className="clock num">04:11:36 남음</span></div>
              </div>
              <div className="sale-card">
                <span className="sale-tag">12시간 핫딜</span>
                <span className="sale-off">-40%</span>
                <span className="sale-brand">해운대 서핑페스타</span>
                <p className="sale-name">공식 기획전 래시가드</p>
                <div className="sale-price"><span className="was num">68,000원</span><span className="now num">40,800원</span></div>
                <div className="sale-foot"><span>재고 23개</span><span className="clock num">11:05:14 남음</span></div>
              </div>
              <div className="sale-card">
                <span className="sale-tag">브랜드세일</span>
                <span className="sale-off">-40%</span>
                <span className="sale-brand">나이키</span>
                <p className="sale-name">시즌오프 러닝화 라인</p>
                <div className="sale-price"><span className="was num">129,000원</span><span className="now num">77,400원</span></div>
                <div className="sale-foot"><span>재고 64개</span><span>~10.15까지</span></div>
              </div>
              <div className="sale-card">
                <span className="sale-tag">브랜드세일</span>
                <span className="sale-off">-20%</span>
                <span className="sale-brand">무신사 스탠다드</span>
                <p className="sale-name">가을 신상 전상품 쿠폰</p>
                <div className="sale-price"><span className="was num">59,000원</span><span className="now num">47,200원</span></div>
                <div className="sale-foot"><span>재고 다수</span><span>~10.20까지</span></div>
              </div>
            </div>

            <div className="up-subhead"><h3>설문조사</h3></div>
            <div className="survey-grid">
              <div className="survey-card">
                <p className="q">올해 가장 기대되는 지역축제는?</p>
                <p className="survey-lead">1위 · 대구 치맥페스티벌 42%</p>
                <div className="survey-bar"><span style={{ width: "42%" }} /></div>
                <div className="survey-meta"><span>참여 3,204명</span><span className="num">D-5 마감</span></div>
              </div>
              <div className="survey-card">
                <p className="q">선호하는 팝업 테마는?</p>
                <p className="survey-lead">1위 · 콜라보/굿즈 55%</p>
                <div className="survey-bar"><span style={{ width: "55%" }} /></div>
                <div className="survey-meta"><span>참여 1,890명</span><span className="num">D-12 마감</span></div>
              </div>
              <div className="survey-card">
                <p className="q">다음 시즌 콜라보 브랜드 추천</p>
                <p className="survey-lead">1위 · 아더에러 38%</p>
                <div className="survey-bar"><span style={{ width: "38%" }} /></div>
                <div className="survey-meta"><span>참여 940명</span><span className="num">D-3 마감</span></div>
              </div>
            </div>

            <div className="up-subhead"><h3>콜라보 소식</h3></div>
            <div className="news-list">
              <div className="news-item"><span className="date num">10.05</span><span className="ntag">콜라보</span><span className="headline">아더에러 × 카카오프렌즈, 2탄 라인업 공개 예고</span></div>
              <div className="news-item"><span className="date num">10.02</span><span className="ntag">신제품</span><span className="headline">텐트공작소 × 무신사 스탠다드, 캠핑 캡슐 컬렉션 출시</span></div>
              <div className="news-item"><span className="date num">09.29</span><span className="ntag">제휴</span><span className="headline">자라섬 재즈페스티벌, 공식 굿즈 온라인 단독 판매 시작</span></div>
              <div className="news-item"><span className="date num">09.26</span><span className="ntag">브랜드</span><span className="headline">나이키, 더현대 서울 시즌오프 팝업 다음 주 오픈 예고</span></div>
            </div>
          </div>
        </section>

        <section className="section" id="alerts">
          <div className="section-head">
            <div>
              <p className="section-label">관심사 알림</p>
              <h2 className="section-title">키워드를 등록하면, 놓치기 전에 알려드려요</h2>
            </div>
          </div>

          <div className="alerts-grid">
            <div className="alerts-col">
              <div className="panel">
                <p className="hint">관심 있는 카테고리를 선택하면, 일치하는 행사가 등록되거나 오픈일이 가까워질 때 알림을 보내드려요.</p>
                <div className="chip-row">
                  <span className="chip on">팝업스토어</span>
                  <span className="chip on">페스티벌</span>
                  <span className="chip on">캠핑/아웃도어</span>
                  <span className="chip">신규매장</span>
                  <span className="chip">플리마켓</span>
                  <span className="chip">전시·사진전</span>
                  <span className="chip">뮤지컬</span>
                  <span className="chip">스포츠경기</span>
                  <span className="chip">지역축제</span>
                  <span className="chip">핫딜</span>
                </div>
                <div className="keyword-follow">
                  <span className="who">현재 &ldquo;캠핑/아웃도어&rdquo;를 구독 중인 회원</span>
                  <b className="num">1,204명</b>
                </div>
              </div>

              <div className="panel">
                <div className="cal-head"><span>2026년 10월</span><span className="nav-btn num">‹ ›</span></div>
                <div className="cal-grid">
                  <span className="cal-dow">월</span><span className="cal-dow">화</span><span className="cal-dow">수</span><span className="cal-dow">목</span><span className="cal-dow">금</span><span className="cal-dow">토</span><span className="cal-dow">일</span>
                  <span className="cal-cell out">28</span><span className="cal-cell out">29</span><span className="cal-cell out">30</span><span className="cal-cell">1</span><span className="cal-cell">2</span><span className="cal-cell">3</span><span className="cal-cell">4</span>
                  <span className="cal-cell">5</span><span className="cal-cell">6</span><span className="cal-cell">7</span><span className="cal-cell evt">8</span><span className="cal-cell evt">9</span><span className="cal-cell">10</span><span className="cal-cell">11</span>
                  <span className="cal-cell evt">12</span><span className="cal-cell">13</span><span className="cal-cell evt">14</span><span className="cal-cell">15</span><span className="cal-cell">16</span><span className="cal-cell">17</span><span className="cal-cell">18</span>
                  <span className="cal-cell">19</span><span className="cal-cell">20</span><span className="cal-cell evt">21</span><span className="cal-cell">22</span><span className="cal-cell">23</span><span className="cal-cell">24</span><span className="cal-cell">25</span>
                  <span className="cal-cell">26</span><span className="cal-cell evt">27</span><span className="cal-cell evt">28</span><span className="cal-cell">29</span><span className="cal-cell">30</span><span className="cal-cell">31</span><span className="cal-cell out">1</span>
                </div>
                <p className="cal-note"><span className="dot" />찜한 행사가 있는 날 — 알림을 보내드려요</p>
              </div>
            </div>

            <div className="phone">
              <div className="phone-frame">
                <div className="phone-screen">
                  <p className="phone-time">오늘 오전 9:00</p>
                  <div className="notif">
                    <div className="notif-icon"><svg viewBox="0 0 120 120"><use href="#cup" /></svg></div>
                    <div className="notif-body">
                      <p className="app">OFF UP</p>
                      <p className="title">자라섬 재즈페스티벌 얼리버드 티켓 오늘 오픈</p>
                      <p className="desc">경기 가평 · 관심 키워드 &ldquo;페스티벌&rdquo;</p>
                    </div>
                  </div>
                  <div className="notif">
                    <div className="notif-icon"><svg viewBox="0 0 120 120"><use href="#cup" /></svg></div>
                    <div className="notif-body">
                      <p className="app">OFF UP</p>
                      <p className="title">나이키 시즌오프 핫딜, 12시간 남았어요</p>
                      <p className="desc">더현대 서울 · 관심 키워드 &ldquo;핫딜&rdquo;</p>
                    </div>
                  </div>
                  <div className="notif">
                    <div className="notif-icon"><svg viewBox="0 0 120 120"><use href="#cup" /></svg></div>
                    <div className="notif-body">
                      <p className="app">OFF UP</p>
                      <p className="title">찜한 팝업, 오늘이 마지막 날이에요</p>
                      <p className="desc">아더에러 × 카카오프렌즈 · 성수동 LCDC</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="cta-footer">
            <h2>알림 하나로,<br />오프라인을 놓치지 마세요</h2>
            <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="이메일 주소" required />
              <button className="btn btn-light" type="submit">무료로 알림받기</button>
            </form>
          </div>
        </section>
      </div>

      <footer>
        <p>OFF UP · 서비스 준비 중인 플랫폼입니다. 일부 수치는 서비스 소개를 위한 가상 데이터예요.</p>
      </footer>
    </>
  );
}
