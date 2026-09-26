drop policy if exists "Authenticated users can seed curriculum courses" on public.curriculum_courses;
create policy "Authenticated users can seed curriculum courses" on public.curriculum_courses for insert to authenticated with check (true);
