-- OFF UP events table. Run this once in the Supabase SQL Editor.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_code text,
  title text not null,
  category text not null,
  start_date date,
  end_date date,
  sido text,
  sigungu text,
  place text,
  image_url text,
  source_url text,
  intro text,
  verify_status text default '확인 필요',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table events enable row level security;

-- Anyone can read published events (the public site uses the anon key).
create policy "public read published events"
  on events for select
  using (published = true);

-- No insert/update/delete policy for anon/authenticated: the admin pages
-- write through the service-role key (getSupabaseAdmin), which bypasses RLS.

-- Keep updated_at current on every write.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- Storage bucket for event images (public read).
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images bucket"
  on storage.objects for select
  using (bucket_id = 'images');
