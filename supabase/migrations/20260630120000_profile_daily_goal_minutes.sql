-- Meta de foco diária configurável (minutos). Existentes: 5h; novos cadastros: 3h.

alter table public.profiles
  add column if not exists daily_goal_minutes integer;

update public.profiles
set daily_goal_minutes = 300
where daily_goal_minutes is null;

alter table public.profiles
  alter column daily_goal_minutes set default 180,
  alter column daily_goal_minutes set not null;

comment on column public.profiles.daily_goal_minutes is 'Meta de foco diária em minutos (padrão 180 para novos usuários)';
