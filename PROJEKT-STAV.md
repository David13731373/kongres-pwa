# Kongres PWA — Stav projektu

Naposledy aktualizováno: 2026-05-31

---

## Co je hotovo a funguje (ověřeno v produkci)

### Infrastruktura
- ✅ Next.js (App Router) — deploy na Vercel: https://kongres-pwa.vercel.app
- ✅ Supabase projekt "Kongresy" — ref: `rztbxaymitqblatiolbj`
- ✅ GitHub repo: https://github.com/David13731373/kongres-pwa
- ✅ Vercel buildí automaticky při každém push na `main`
- ✅ `@supabase/ssr` pinnuto na `0.10.3` (jinak Vercel buildil s `0.3.0` = nekompatibilní cookie formát)

### Veřejné stránky
- ✅ `/` — úvodní stránka s tlačítky "Zobrazit kongresy" a "Admin"
- ✅ `/kongresy` — seznam aktivních kongresů (SSR ze Supabase)
- ✅ `/kongresy/kardiologie-2026` — detail kongresu + registrační formulář

### Admin panel
- ✅ `/admin/login` — přihlašovací stránka (email + heslo)
- ✅ `/admin` — dashboard se seznamem kongresů
- ✅ `/admin/kongresy/{uuid}/registrace` — seznam registrací s tlačítky Potvrdit / Zrušit
- ✅ Middleware chrání `/admin/*` — nepřihlášený uživatel je přesměrován na login
- ✅ Admin účet: `dvhv@seznam.cz` (heslo v Supabase Auth)

### API endpointy
- ✅ `POST /api/login` — přihlášení, nastavení session cookies přes `@supabase/ssr`
- ✅ `POST /api/registrace` — vytvoření registrace (ukládá do DB se stavem `cekajici`)
- ✅ `GET /api/debug-login` — diagnostický endpoint (ponechat pro debug, smazat před produkcí)
- ✅ `GET /api/test-post` — diagnostický endpoint (smazat před produkcí)

### Databáze
- ✅ Tabulka `kongresy` — funkční, testovací data vložena
- ✅ Tabulka `program` — existuje, ale prázdná (žádný program v DB)
- ✅ Tabulka `registrace` — funkční, testovací záznamy existují
- ✅ RLS zapnuté na všech tabulkách

---

## ❌ Aktuální blokující bug (vyřešit jako první příště)

### RLS blokuje veřejnou registraci
**Symptom:** Formulář na `/kongresy/kardiologie-2026` vrátí chybu:
> `Insert error: new row violates row-level security policy for table "registrace"`

**Příčina:** RLS politika "Kdokoli může vytvořit registraci" (`with check (true)`) je v migraci, ale v databázi pravděpodobně chybí nebo byla smazána. Někdy v historii bylo RLS na `registrace` vypnuto (`alter table public.registrace disable row level security`) a pak znovu zapnuto bez politiky.

**Jak opravit:**
Spustit v Supabase SQL editoru (https://supabase.com/dashboard → projekt → SQL Editor):
```sql
-- Zkontroluj existující politiky
select * from pg_policies where tablename = 'registrace';

-- Pokud chybí INSERT politika, přidej ji:
create policy "Kdokoli může vytvořit registraci"
  on public.registrace for insert
  with check (true);

-- Pokud je RLS vypnuté, zapni ho:
alter table public.registrace enable row level security;
```

---

## Co zbývá dokončit (pořadí priorit)

### 1. Opravit RLS (viz výše — blokující bug)

### 2. Emaily přes Resend
- `RESEND_API_KEY` přidat do Vercel Environment Variables
- Implementovat odeslání emailu po úspěšné registraci (soubor `src/lib/email.ts` existuje, ale pravděpodobně není napojený)
- Šablona: česky, jméno kongresu, jméno účastníka, potvrzení
- Zvážit email i při změně stavu (potvrzena / zrušena) z adminu

### 3. Cleanup debug endpointů
- Smazat `src/app/api/debug-login/route.ts` (obsahuje hardcoded heslo!)
- Smazat `src/app/api/test-post/route.ts`

### 4. Program kongresu
- Tabulka `program` je prázdná — vložit testovací data nebo přidat admin UI pro správu programu
- Stránka detailu kongresu program nezobrazuje (nebo zobrazuje prázdný stav)

### 5. Admin UI — správa stavů registrace
- Tlačítka Potvrdit / Zrušit jsou na stránce, ale ověřit že fungují správně

---

## Klíčové soubory

| Soubor | Popis |
|--------|-------|
| `src/app/page.tsx` | Úvodní stránka |
| `src/app/kongresy/page.tsx` | Seznam kongresů |
| `src/app/kongresy/[slug]/page.tsx` | Detail kongresu + formulář |
| `src/app/admin/login/page.tsx` | Login stránka (client component, volá /api/login) |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/admin/kongresy/[id]/registrace/page.tsx` | Seznam registrací |
| `src/app/api/login/route.ts` | Login API (SSR cookies via @supabase/ssr) |
| `src/app/api/registrace/route.ts` | Registrační API |
| `src/lib/supabase/server.ts` | Supabase server klient (createServerClient) |
| `middleware.ts` | Ochrana /admin/* routes |
| `supabase/migrations/001_initial.sql` | SQL schéma + RLS politiky |

---

## Technické poznámky

- **Supabase klíče**: používat **legacy JWT klíče** (ne `sb_publishable_` formát)
  - Najdeš v: Supabase dashboard → Settings → API → "Legacy API Keys"
- **Admin UUID kongresu**: `800446eb-dd75-4482-8ad7-0a37fbaac8d9`
- **`@supabase/ssr@0.3.0`** = starý cookie formát, nefunguje s `getUser()` v Server Components → musí být `0.10.3`
- **Debug-login heslo** je uloženo v `src/app/api/debug-login/route.ts` — smazat!

## Jak spustit lokálně

```bash
cd C:\Users\dvhv\Documents\Projekty\Ivanatour\kongres-pwa-fixed\kongres-pwa
npm run dev
# App běží na: http://localhost:3000
```
