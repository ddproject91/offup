import { getSupabasePublic } from "@/lib/supabasePublic";
import type { EventRow } from "@/lib/events";
import type { UpPost } from "@/lib/upPosts";
import HomeClient from "./HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = getSupabasePublic();
  let events: EventRow[] = [];
  let upPosts: UpPost[] = [];

  if (supabase) {
    const [eventsRes, upRes] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("start_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("up_posts")
        .select("*")
        .eq("published", true)
        .order("post_date", { ascending: false, nullsFirst: false }),
    ]);
    events = (eventsRes.data ?? []) as EventRow[];
    upPosts = (upRes.data ?? []) as UpPost[];
  }

  return <HomeClient events={events} upPosts={upPosts} />;
}
