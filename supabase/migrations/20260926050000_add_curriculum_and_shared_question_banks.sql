create table if not exists public.curriculum_courses (
  id bigserial primary key,
  programme text not null,
  level text not null,
  code text not null,
  title text not null,
  units text not null default '',
  course_type text not null default '',
  source text not null default 'FUNAAB official curriculum research',
  created_at timestamptz not null default now(),
  unique(programme, level, code, title)
);
create index if not exists curriculum_courses_programme_level_idx on public.curriculum_courses(programme, level);
alter table public.curriculum_courses enable row level security;
drop policy if exists "Curriculum courses are readable by everyone" on public.curriculum_courses;
create policy "Curriculum courses are readable by everyone" on public.curriculum_courses for select using (true);
drop policy if exists "Authenticated users can seed curriculum courses" on public.curriculum_courses;
create policy "Authenticated users can seed curriculum courses" on public.curriculum_courses for insert to authenticated with check (true);

create table if not exists public.sprint_question_banks (
  id uuid primary key default gen_random_uuid(),
  programme text not null,
  level text not null,
  topic text not null,
  questions jsonb not null default '[]'::jsonb,
  question_count integer not null default 0 check (question_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(programme, level, topic)
);
create index if not exists sprint_question_banks_lookup_idx on public.sprint_question_banks(programme, level, topic);
alter table public.sprint_question_banks enable row level security;
drop policy if exists "Question banks are readable by everyone" on public.sprint_question_banks;
create policy "Question banks are readable by everyone" on public.sprint_question_banks for select using (true);
drop policy if exists "Authenticated users can cache question banks" on public.sprint_question_banks;
create policy "Authenticated users can cache question banks" on public.sprint_question_banks for insert to authenticated with check (true);
create or replace function public.touch_sprint_question_bank_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists sprint_question_banks_touch_updated_at on public.sprint_question_banks;
create trigger sprint_question_banks_touch_updated_at before update on public.sprint_question_banks for each row execute function public.touch_sprint_question_bank_updated_at();
