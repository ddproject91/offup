-- Adds the "featured" flag used to pin events to the homepage hero carousel.
alter table events add column if not exists featured boolean not null default false;
