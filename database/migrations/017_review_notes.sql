-- v1 #3: module-scoped bidirectional review log (editor ↔ viewer)
-- Depends on: 003_db2_schema.sql (modules), 006_admin_role_and_rpc.sql (admin role)

create table if not exists public.review_notes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  author_id uuid references auth.users (id) on delete set null,
  author_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_notes_module_created_idx
  on public.review_notes (module_id, created_at asc);

comment on table public.review_notes is
  'Module-scoped review Q&A log. Web-only; survives Excel re-import. v1: append log per module.';

alter table public.review_notes enable row level security;

create policy "review_notes_select_authenticated"
  on public.review_notes for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('editor', 'viewer', 'admin')
    )
  );

create policy "review_notes_insert_authenticated"
  on public.review_notes for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('editor', 'viewer', 'admin')
    )
    and author_id = (select auth.uid())
  );

create policy "review_notes_update_authenticated"
  on public.review_notes for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('editor', 'viewer', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('editor', 'viewer', 'admin')
    )
    and char_length(trim(body)) > 0
  );

create policy "review_notes_delete_authenticated"
  on public.review_notes for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('editor', 'viewer', 'admin')
    )
  );

comment on policy "review_notes_insert_authenticated" on public.review_notes is
  'Editor, viewer, or admin may post review notes (immediate save; independent of flow save).';
comment on policy "review_notes_update_authenticated" on public.review_notes is
  'v1: any authenticated reviewer may edit any note on the module.';
comment on policy "review_notes_delete_authenticated" on public.review_notes is
  'v1: any authenticated reviewer may delete any note on the module.';
