
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  vibe text default 'Just vibing in the neon...',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are readable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));
  if base_username = '' or base_username is null then base_username := 'user'; end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, coalesce(new.raw_user_meta_data->>'display_name', final_username));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Friendships (one row per pair, requester_id < addressee_id sorted at app level via friend_request)
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sender_id, recipient_id),
  check (sender_id <> recipient_id)
);
alter table public.friend_requests enable row level security;

create policy "Users see their own requests"
  on public.friend_requests for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Users can send requests"
  on public.friend_requests for insert to authenticated
  with check (auth.uid() = sender_id);
create policy "Recipient can update status"
  on public.friend_requests for update to authenticated
  using (auth.uid() = recipient_id or auth.uid() = sender_id);
create policy "Either party can delete"
  on public.friend_requests for delete to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create index on public.friend_requests (recipient_id, status);
create index on public.friend_requests (sender_id, status);

-- Helper function: are two users friends?
create or replace function public.are_friends(_a uuid, _b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friend_requests
    where status = 'accepted'
      and ((sender_id = _a and recipient_id = _b) or (sender_id = _b and recipient_id = _a))
  );
$$;

-- Invite links
create table public.invite_links (
  token text primary key,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
alter table public.invite_links enable row level security;

create policy "Anyone authenticated can read invite links"
  on public.invite_links for select to authenticated using (true);
create policy "Users can create own invite links"
  on public.invite_links for insert to authenticated with check (auth.uid() = creator_id);
create policy "Creator can delete invite link"
  on public.invite_links for delete to authenticated using (auth.uid() = creator_id);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) between 1 and 4000),
  kind text not null default 'text' check (kind in ('text','sticker')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

create policy "Read own messages"
  on public.messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Send to friends only"
  on public.messages for insert to authenticated
  with check (auth.uid() = sender_id and public.are_friends(sender_id, recipient_id));
create policy "Recipient marks read"
  on public.messages for update to authenticated
  using (auth.uid() = recipient_id);

create index on public.messages (sender_id, recipient_id, created_at desc);
create index on public.messages (recipient_id, sender_id, created_at desc);

alter publication supabase_realtime add table public.messages;
alter table public.messages replica identity full;

-- Locations: one row per user, latest position
create table public.locations (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  accuracy double precision,
  updated_at timestamptz not null default now()
);
alter table public.locations enable row level security;

create policy "Users can read friends locations"
  on public.locations for select to authenticated
  using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));
create policy "Users can upsert own location"
  on public.locations for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own location"
  on public.locations for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own location"
  on public.locations for delete to authenticated using (auth.uid() = user_id);

alter publication supabase_realtime add table public.locations;
alter table public.locations replica identity full;
alter publication supabase_realtime add table public.friend_requests;
alter table public.friend_requests replica identity full;
