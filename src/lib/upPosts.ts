export interface UpPost {
  id: string;
  title: string;
  tag: string | null;
  description: string | null;
  link_url: string | null;
  post_date: string | null;
  published: boolean;
}

export function fmtPostDate(d: string | null): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${Number(m)}.${Number(day)}`;
}
