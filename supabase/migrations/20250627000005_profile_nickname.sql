-- Editable app nickname separate from signup display_name.

alter table public.profiles
  add column if not exists nickname text;

comment on column public.profiles.display_name is 'Nome informado no cadastro (identidade)';
comment on column public.profiles.nickname is 'Nome exibido no app, editável pelo usuário';
