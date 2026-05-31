-- ============================================================
-- Kongresová PWA — Počáteční schéma databáze
-- Spustit: npx supabase db push
-- ============================================================

-- Rozšíření
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABULKA: kongresy
-- ============================================================
create table public.kongresy (
  id                   uuid primary key default uuid_generate_v4(),
  nazev                text not null,
  slug                 text not null unique,
  popis                text,
  datum_zacatek        date not null,
  datum_konec          date,
  misto                text,
  aktivni              boolean not null default true,
  registrace_otevrena  boolean not null default true,
  created_at           timestamptz not null default now()
);

comment on table public.kongresy is 'Záznamy jednotlivých kongresů pořádaných agenturou';

-- Rychlé vyhledání podle slugu (URL)
create index kongresy_slug_idx on public.kongresy (slug);

-- ============================================================
-- TABULKA: program
-- ============================================================
create table public.program (
  id          uuid primary key default uuid_generate_v4(),
  kongres_id  uuid not null references public.kongresy(id) on delete cascade,
  cas_od      time not null,
  cas_do      time,
  nazev       text not null,
  priznak     text,          -- přednášející, místnost, typ bloku apod.
  poradi      integer not null default 0
);

create index program_kongres_idx on public.program (kongres_id, poradi);

-- ============================================================
-- TABULKA: registrace
-- ============================================================
create type public.registrace_stav as enum ('cekajici', 'potvrzena', 'zrusena');

create table public.registrace (
  id          uuid primary key default uuid_generate_v4(),
  kongres_id  uuid not null references public.kongresy(id) on delete restrict,
  jmeno       text not null,
  prijmeni    text not null,
  email       text not null,
  telefon     text,
  organizace  text,
  poznamka    text,
  stav        public.registrace_stav not null default 'cekajici',
  created_at  timestamptz not null default now(),

  -- Jeden email = jedna registrace na daný kongres
  unique (kongres_id, email)
);

create index registrace_kongres_idx on public.registrace (kongres_id);
create index registrace_email_idx   on public.registrace (email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.kongresy    enable row level security;
alter table public.program     enable row level security;
alter table public.registrace  enable row level security;

-- Kongresy — veřejně čitelné (aktivní)
create policy "Kongresy jsou veřejně čitelné"
  on public.kongresy for select
  using (aktivni = true);

-- Program — veřejně čitelný
create policy "Program je veřejně čitelný"
  on public.program for select
  using (true);

-- Registrace — vložit může kdokoli (veřejná registrace)
create policy "Kdokoli může vytvořit registraci"
  on public.registrace for insert
  with check (true);

-- Registrace — číst a editovat může jen admin (service role obchází RLS)
create policy "Admin může číst registrace"
  on public.registrace for select
  using (auth.role() = 'service_role');

-- ============================================================
-- DEMO DATA (volitelně — smazat před produkcí)
-- ============================================================
insert into public.kongresy (nazev, slug, popis, datum_zacatek, datum_konec, misto)
values (
  'Kardiologický kongres 2026',
  'kardiologie-2026',
  'Výroční kongres České kardiologické společnosti.',
  '2026-09-15',
  '2026-09-17',
  'Praha, Clarion Congress Hotel'
);
