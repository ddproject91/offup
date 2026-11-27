-- UP (online) content: unified single type for now (hot deals, surveys, collab news
-- all share this shape). Run once in the Supabase SQL Editor.

create table if not exists up_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text,
  description text,
  link_url text,
  post_date date,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table up_posts enable row level security;

create policy "public read published up_posts"
  on up_posts for select
  using (published = true);

-- Reuses the set_updated_at() function created by 2026-10-21_events.sql.
drop trigger if exists up_posts_set_updated_at on up_posts;
create trigger up_posts_set_updated_at
  before update on up_posts
  for each row execute function set_updated_at();
