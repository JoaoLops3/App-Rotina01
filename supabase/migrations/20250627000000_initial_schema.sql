-- App-Rotina initial schema: profiles, tasks, history, notifications + RLS

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.task_status as enum (
  'active',
  'pending',
  'paused',
  'completed'
);

create type public.task_priority as enum (
  'low',
  'medium',
  'high'
);

create type public.notification_type as enum (
  'task_upcoming',
  'task_completed',
  'daily_goal_reached',
  'streak_milestone',
  'streak_at_risk',
  'task_overdue',
  'timer_finished'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.notification_preferences (user_id, prefs)
  values (
    new.id,
    jsonb_build_object(
      'leadMinutes', 10,
      'enabled', jsonb_build_object(
        'task_upcoming', true,
        'task_completed', true,
        'daily_goal_reached', true,
        'streak_milestone', true,
        'streak_at_risk', true,
        'task_overdue', true,
        'timer_finished', true
      )
    )
  );

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Alex',
  avatar_seed text,
  avatar_style text not null default 'toon-head',
  local_import_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_avatar_style_check check (avatar_style = 'toon-head')
);

create table public.tasks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  duration integer not null default 0 check (duration >= 0),
  elapsed integer not null default 0 check (elapsed >= 0),
  status public.task_status not null default 'pending',
  priority public.task_priority not null default 'medium',
  scheduled_time text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_user_id_status_idx on public.tasks (user_id, status);

create table public.day_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  tasks_completed integer not null default 0 check (tasks_completed >= 0),
  focus_seconds integer not null default 0 check (focus_seconds >= 0),
  primary key (user_id, date)
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  dedup_key text not null,
  task_id text,
  constraint notifications_user_dedup_unique unique (user_id, dedup_key)
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.day_history enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;

-- profiles (ownership via id = auth.uid())
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- tasks
create policy tasks_select_own
  on public.tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy tasks_insert_own
  on public.tasks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy tasks_update_own
  on public.tasks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy tasks_delete_own
  on public.tasks
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- day_history
create policy day_history_select_own
  on public.day_history
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy day_history_insert_own
  on public.day_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy day_history_update_own
  on public.day_history
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy day_history_delete_own
  on public.day_history
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- notification_preferences
create policy notification_preferences_select_own
  on public.notification_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy notification_preferences_insert_own
  on public.notification_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy notification_preferences_update_own
  on public.notification_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy notification_preferences_delete_own
  on public.notification_preferences
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- notifications
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy notifications_insert_own
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy notifications_update_own
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy notifications_delete_own
  on public.notifications
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Grants (authenticated only — anon has no table policies)
-- ---------------------------------------------------------------------------

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant all on all sequences in schema public to postgres, service_role;
grant usage on all sequences in schema public to authenticated;
