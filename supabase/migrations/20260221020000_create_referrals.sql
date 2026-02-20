-- Create referrals table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_username text not null,
  referred_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referred_user_id)
);

alter table public.referrals enable row level security;

-- Allow the referred user to insert their own referral once (server/client).
create policy "referred user can insert their own referral"
on public.referrals
for insert
to authenticated
with check (auth.uid() = referred_user_id);

-- Allow the referred user to read their own referral record
create policy "referred user can read their own referral"
on public.referrals
for select
to authenticated
using (auth.uid() = referred_user_id);
