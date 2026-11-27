-- Adds image + precise sale-period (date+time) fields to up_posts so the
-- homepage can show a live countdown to ends_at.
alter table up_posts add column if not exists image_url text;
alter table up_posts add column if not exists starts_at timestamptz;
alter table up_posts add column if not exists ends_at timestamptz;
