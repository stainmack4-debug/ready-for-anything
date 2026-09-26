create table if not exists public.student_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  programme text not null,
  level text not null default '',
  code text not null,
  title text not null default '',
  source text not null default 'student',
  created_at timestamptz not null default now(),
  unique(user_id, programme, level, code)
);
create index if not exists student_courses_user_programme_idx on public.student_courses(user_id, programme, level);
alter table public.student_courses enable row level security;
drop policy if exists "Students can read their own courses" on public.student_courses;
create policy "Students can read their own courses" on public.student_courses for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students can add their own courses" on public.student_courses;
create policy "Students can add their own courses" on public.student_courses for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Students can update their own courses" on public.student_courses;
create policy "Students can update their own courses" on public.student_courses for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Students can delete their own courses" on public.student_courses;
create policy "Students can delete their own courses" on public.student_courses for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.course_contributions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  programme text not null,
  level text not null default '',
  code text not null,
  title text not null default '',
  source_type text not null default 'student',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  votes integer not null default 1 check (votes >= 0),
  created_at timestamptz not null default now(),
  unique(submitted_by, programme, level, code)
);
create index if not exists course_contributions_lookup_idx on public.course_contributions(programme, level, code);
alter table public.course_contributions enable row level security;
drop policy if exists "Students can read approved contributions" on public.course_contributions;
create policy "Students can read approved contributions" on public.course_contributions for select to authenticated using (status = 'approved' or auth.uid() = submitted_by);
drop policy if exists "Students can submit course contributions" on public.course_contributions;
create policy "Students can submit course contributions" on public.course_contributions for insert to authenticated with check (auth.uid() = submitted_by);
drop policy if exists "Students can update their own pending contributions" on public.course_contributions;
create policy "Students can update their own pending contributions" on public.course_contributions for update to authenticated using (auth.uid() = submitted_by and status = 'pending') with check (auth.uid() = submitted_by and status = 'pending');
