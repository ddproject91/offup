export interface UpPost {
  id: string;
  title: string;
  tag: string | null;
  description: string | null;
  link_url: string | null;
  post_date: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  published: boolean;
}

export function fmtPostDate(d: string | null): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${Number(m)}.${Number(day)}`;
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}.${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtPeriodRange(start: string | null, end: string | null): string {
  if (start && end) return `${fmtDateTime(start)} ~ ${fmtDateTime(end)}`;
  if (start) return `${fmtDateTime(start)} 시작`;
  if (end) return `${fmtDateTime(end)}까지`;
  return "";
}

// <input type="datetime-local"> works in local time with no timezone suffix,
// while Supabase stores/returns UTC ISO strings — convert between the two.
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
