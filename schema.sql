-- Run this in the Supabase SQL Editor for your project.
-- Row Level Security ensures each learner can only read and change their own records.

create table if not exists public.learner_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'learner' check (role in ('learner','instructor','experienced')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null,
  score integer not null default 0 check (score >= 0),
  total integer not null default 0 check (total >= 0 and score <= total),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;
alter table public.learning_sessions enable row level security;

create policy "Learners can view their own profile"
on public.learner_profiles for select to authenticated
using (auth.uid() = id);

create policy "Learners can create their own profile"
on public.learner_profiles for insert to authenticated
with check (auth.uid() = id);

create policy "Learners can update their own profile"
on public.learner_profiles for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

create policy "Learners can view their own sessions"
on public.learning_sessions for select to authenticated
using (auth.uid() = user_id);

create policy "Learners can save their own sessions"
on public.learning_sessions for insert to authenticated
with check (auth.uid() = user_id);

create index if not exists learning_sessions_user_created_idx
on public.learning_sessions (user_id, created_at desc);

-- Create a learner profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.learner_profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'learner')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
