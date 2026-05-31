-- Zapnout RLS na tabulce registrace
alter table public.registrace enable row level security;

-- Kdokoli (i anonymní uživatel) může vložit registraci
create policy "Anonymní INSERT registrace"
  on public.registrace
  for insert
  to anon, authenticated
  with check (true);

-- Pouze přihlášený admin může číst registrace
create policy "Authenticated SELECT registrace"
  on public.registrace
  for select
  to authenticated
  using (true);

-- Pouze přihlášený admin může měnit stav
create policy "Authenticated UPDATE registrace"
  on public.registrace
  for update
  to authenticated
  using (true)
  with check (true);

-- Pouze přihlášený admin může mazat
create policy "Authenticated DELETE registrace"
  on public.registrace
  for delete
  to authenticated
  using (true);
