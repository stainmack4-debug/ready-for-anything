-- Study plans: one saved plan + timetable per student, used as the tutor's long-term memory.
create table if not exists public.study_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.study_plans enable row level security;
drop policy if exists "study_plans_select_own" on public.study_plans;
drop policy if exists "study_plans_insert_own" on public.study_plans;
drop policy if exists "study_plans_update_own" on public.study_plans;
drop policy if exists "study_plans_delete_own" on public.study_plans;
create policy "study_plans_select_own" on public.study_plans for select to authenticated using (auth.uid() = user_id);
create policy "study_plans_insert_own" on public.study_plans for insert to authenticated with check (auth.uid() = user_id);
create policy "study_plans_update_own" on public.study_plans for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_plans_delete_own" on public.study_plans for delete to authenticated using (auth.uid() = user_id);
drop trigger if exists study_plans_touch_updated_at on public.study_plans;
create trigger study_plans_touch_updated_at before update on public.study_plans for each row execute function public.touch_updated_at();
grant select, insert, update, delete on public.study_plans to authenticated;
