create table if not exists public.tutor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course text not null default '', title text not null default 'Tutor conversation',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tutor_messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('user','assistant')), content text not null, created_at timestamptz not null default now()
);
create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, file_name text not null, cards jsonb not null default '[]'::jsonb, known_cards jsonb not null default '[]'::jsonb, review_cards jsonb not null default '[]'::jsonb, current_position integer not null default 0 check (current_position >= 0), completed boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists tutor_conversations_user_updated_idx on public.tutor_conversations(user_id, updated_at desc);
create index if not exists tutor_messages_conversation_created_idx on public.tutor_messages(conversation_id, created_at);
create index if not exists flashcard_sets_user_updated_idx on public.flashcard_sets(user_id, updated_at desc);
alter table public.tutor_conversations enable row level security;
alter table public.tutor_messages enable row level security;
alter table public.flashcard_sets enable row level security;
drop policy if exists "Users can manage their tutor conversations" on public.tutor_conversations;
create policy "Users can manage their tutor conversations" on public.tutor_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can manage their tutor messages" on public.tutor_messages;
create policy "Users can manage their tutor messages" on public.tutor_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can manage their flashcard sets" on public.flashcard_sets;
create policy "Users can manage their flashcard sets" on public.flashcard_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists tutor_conversations_touch_updated_at on public.tutor_conversations;
create trigger tutor_conversations_touch_updated_at before update on public.tutor_conversations for each row execute function public.touch_updated_at();
drop trigger if exists flashcard_sets_touch_updated_at on public.flashcard_sets;
create trigger flashcard_sets_touch_updated_at before update on public.flashcard_sets for each row execute function public.touch_updated_at();
