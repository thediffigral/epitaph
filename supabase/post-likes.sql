-- Epitaph post likes. Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.post_likes (
  post_id text not null,
  browser_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, browser_id)
);

alter table public.post_likes enable row level security;
revoke all on public.post_likes from anon, authenticated;

create or replace function public.get_post_likes(p_post_id text)
returns bigint
language sql
security definer
set search_path = ''
as $$
  select count(*) from public.post_likes where post_id = p_post_id;
$$;

create or replace function public.like_post(p_post_id text, p_browser_id text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_post_id is null or length(p_post_id) = 0 or length(p_post_id) > 200 then
    raise exception 'Invalid post id';
  end if;
  if p_browser_id is null or length(p_browser_id) < 16 or length(p_browser_id) > 100 then
    raise exception 'Invalid browser id';
  end if;

  insert into public.post_likes (post_id, browser_id)
  values (p_post_id, p_browser_id)
  on conflict (post_id, browser_id) do nothing;

  return (select count(*) from public.post_likes where post_id = p_post_id);
end;
$$;

revoke all on function public.get_post_likes(text) from public;
revoke all on function public.like_post(text, text) from public;
grant execute on function public.get_post_likes(text) to anon, authenticated;
grant execute on function public.like_post(text, text) to anon, authenticated;
