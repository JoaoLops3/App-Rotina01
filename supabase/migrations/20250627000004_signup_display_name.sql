-- Persist display_name from signup metadata into profiles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_name text := nullif(trim(new.raw_user_meta_data->>'display_name'), '');
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(signup_name, 'Alex')
  );

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
