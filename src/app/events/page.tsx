import { getSupabasePublic } from "@/lib/supabasePublic";
import type { EventRow } from "@/lib/events";
import EventsClient from "./EventsClient";

export const revalidate = 60;

export default async function EventsPage() {
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

  return <EventsClient events={events} />;
}
