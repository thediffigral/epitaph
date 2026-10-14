-- Epitaph moderated post comments.
-- Run once in Supabase Dashboard > SQL Editor.
create table if not exists public.post_comments (
  id bigint generated always as identity primary key,
  post_id text not null,
  display_name text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists post_comments_approved_idx
  on public.post_comments (post_id, created_at desc)
  where status = 'approved';

alter table public.post_comments enable row level security;
revoke all on public.post_comments from anon, authenticated;

create or replace function public.get_approved_comments(p_post_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'id', c.id,
      'display_name', c.display_name,
      'body', c.body,
      'created_at', c.created_at
    ) order by c.created_at desc),
    '[]'::jsonb
  )
  from public.post_comments c
  where c.post_id = p_post_id and c.status = 'approved';
$$;

create or replace function public.submit_post_comment(
  p_post_id text,
  p_display_name text,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  if p_post_id is null or length(trim(p_post_id)) = 0 or length(p_post_id) > 200 then
    raise exception 'Invalid post';
  end if;
  if p_display_name is null or length(trim(p_display_name)) = 0 or length(trim(p_display_name)) > 80 then
    raise exception 'Name must be between 1 and 80 characters';
  end if;
  if p_body is null or length(trim(p_body)) = 0 or length(trim(p_body)) > 3000 then
    raise exception 'Comment must be between 1 and 3000 characters';
  end if;

  -- Basic project-wide throttle to reduce accidental floods.
  select count(*) into recent_count
  from public.post_comments
  where created_at > now() - interval '1 minute';

  if recent_count >= 30 then
    raise exception 'Comments are temporarily rate limited';
  end if;

  insert into public.post_comments (post_id, display_name, body, status)
  values (trim(p_post_id), trim(p_display_name), trim(p_body), 'pending');

  return jsonb_build_object('submitted', true, 'status', 'pending');
end;
$$;

revoke all on function public.get_approved_comments(text) from public;
revoke all on function public.submit_post_comment(text, text, text) from public;
grant execute on function public.get_approved_comments(text) to anon, authenticated;
grant execute on function public.submit_post_comment(text, text, text) to anon, authenticated;

-- Review pending comments in the Supabase Table Editor.
-- To approve one, change its status from 'pending' to 'approved'.
-- To reject one, change its status to 'rejected'.
