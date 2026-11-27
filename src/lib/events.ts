export type EventCategory =
  | "concert" | "expo" | "popup" | "overseas" | "musical"
  | "market" | "saleoff" | "local" | "newstore" | "sports" | "etc";

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  concert: "콘서트", expo: "전시/박람회", popup: "팝업", overseas: "내한공연",
  musical: "뮤지컬", market: "플리마켓", saleoff: "브랜드세일", local: "지역행사",
  newstore: "신규매장", sports: "스포츠경기", etc: "기타",
};

export const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "popup", label: "팝업" },
  { value: "concert", label: "콘서트" },
  { value: "overseas", label: "내한공연" },
  { value: "expo", label: "전시/박람회" },
  { value: "musical", label: "뮤지컬" },
  { value: "market", label: "플리마켓" },
  { value: "saleoff", label: "브랜드세일" },
  { value: "local", label: "지역행사" },
  { value: "newstore", label: "신규매장" },
  { value: "sports", label: "스포츠경기" },
];

export const POSTER_COUNT = 6;

export interface EventRow {
  id: string;
  event_code: string | null;
  title: string;
  category: EventCategory;
  start_date: string | null;
  end_date: string | null;
  sido: string | null;
  sigungu: string | null;
  place: string | null;
  image_url: string | null;
  source_url: string | null;
  intro: string | null;
  verify_status: string | null;
  published: boolean;
  featured: boolean;
}

export function fmtPeriod(start: string | null, end: string | null): string {
  const short = (d: string) => {
    const [, m, day] = d.split("-");
    return `${Number(m)}.${Number(day)}`;
  };
  if (start && end && start === end) return short(start);
  if (start && end) return `${short(start)} – ${short(end)}`;
  return start ? short(start) : end ? short(end) : "";
}

export function fmtLocation(sido?: string | null, sigungu?: string | null, place?: string | null): string {
  return [sido, sigungu, place].filter(Boolean).join(" ").trim();
}

export function ddayInfo(start: string | null, end: string | null): string | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : s;
  if (e && !isNaN(e.getTime()) && now > e) return null; // already ended
  if (s && !isNaN(s.getTime()) && now < s) {
    const diffDays = Math.ceil((s.getTime() - now.getTime()) / 86400000);
    return `D-${diffDays}`;
  }
  return "진행중";
}

export function posterClassFor(index: number): string {
  return `poster-${(index % POSTER_COUNT) + 1}`;
}
