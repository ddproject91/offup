-- Comma-separated hashtags shown on event cards (e.g. "굿즈, 포토존, 한정판").
alter table events add column if not exists hashtags text;
