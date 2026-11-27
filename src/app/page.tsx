import { getSupabasePublic } from "@/lib/supabasePublic";
import type { EventRow } from "@/lib/events";
import HomeClient from "./HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getSupabasePublic();
  let events: EventRow[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .order("start_date", { ascending: true, nullsFirst: false });
    events = (data ?? []) as EventRow[];
  }

  return <HomeClient events={events} />;
}
