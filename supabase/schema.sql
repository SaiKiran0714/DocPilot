create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  sender text,
  category text not null check (category in ('Invoice', 'Contract', 'Information', 'Other')),
  urgency_level text not null check (urgency_level in ('High', 'Medium', 'Low')),
  key_dates jsonb not null default '[]'::jsonb,
  categorized_info jsonb not null default '[]'::jsonb,
  structured_fields jsonb not null default '[]'::jsonb,
  important_information jsonb not null default '[]'::jsonb,
  translated_text text not null default '',
  ai_overview text not null default '',
  image_data_url text,
  extracted_text text not null,
  original_file_name text,
  created_at timestamptz not null default now()
);

create index if not exists letters_provider_idx on public.letters (provider);
create index if not exists letters_created_at_idx on public.letters (created_at desc);

alter table if exists public.letters
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table if exists public.letters
  add column if not exists categorized_info jsonb not null default '[]'::jsonb;

alter table if exists public.letters
  add column if not exists structured_fields jsonb not null default '[]'::jsonb;

alter table if exists public.letters
  add column if not exists important_information jsonb not null default '[]'::jsonb;

alter table if exists public.letters
  add column if not exists translated_text text not null default '';

alter table if exists public.letters
  add column if not exists ai_overview text not null default '';

alter table if exists public.letters
  add column if not exists image_data_url text;

create index if not exists letters_user_id_idx on public.letters (user_id);

alter table public.letters enable row level security;

drop policy if exists "Letters are readable by anon users" on public.letters;
drop policy if exists "Users can read their own letters" on public.letters;

create policy "Letters are readable by anon users"
  on public.letters for select
  to anon
  using (false);

create policy "Users can read their own letters"
  on public.letters for select
  to authenticated
  using (auth.uid() = user_id);
