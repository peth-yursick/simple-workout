-- Invitation Codes Table
-- Allows athletes to generate a code that coaches can use to connect

-- Drop table if exists (for re-running this migration)
drop table if exists invitation_codes cascade;

-- Create invitation_codes table
create table if not exists invitation_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  athlete_id uuid not null references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null
);

-- Create index for fast lookups
create index if not exists invitation_codes_code_idx on invitation_codes(code);
create index if not exists invitation_codes_expires_at_idx on invitation_codes(expires_at);

-- Enable RLS
alter table invitation_codes enable row level security;

-- RLS Policies: Users can only manage their own invitation codes
create policy "Users can view own invitation codes"
  on invitation_codes for select
  using (auth.uid() = athlete_id);

create policy "Users can insert own invitation codes"
  on invitation_codes for insert
  with check (auth.uid() = athlete_id);

create policy "Users can delete own invitation codes"
  on invitation_codes for delete
  using (auth.uid() = athlete_id);

-- Comment
comment on table invitation_codes is 'Invitation codes that athletes can share with coaches';
