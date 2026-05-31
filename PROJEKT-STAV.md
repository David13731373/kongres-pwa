# Kongres PWA — Stav projektu

Naposledy aktualizováno: 2026-05-31

---

## Co je hotovo

### Infrastruktura
- ✅ Next.js 15 (App Router, Turbopack) — běží lokálně na `localhost:3000`
- ✅ Supabase projekt "Kongresy" — ref: `rztbxaymitqblatiolbj`
- ✅ `.env.local` nakonfigurován (není v gitu)
- ✅ GitHub repo: https://github.com/David13731373/kongres-pwa
- ✅ next-pwa odstraněno (nekompatibilní s Next.js 15 + Turbopack)

### Databáze (Supabase)
- ✅ Tabulka `kongresy` (id, nazev, slug, datum_zacatek, datum_konec, misto, popis, aktivni, registrace_otevrena)
- ✅ Tabulka `program` (id, kongres_id, cas_od, nazev, priznak)
- ✅ Tabulka `registrace` (id, kongres_id, jmeno, prijmeni, email, telefon, organizace, poznamka, stav, vytvoreno)
- ✅ Testovací kongres vložen do DB a zobrazuje se
- ✅ Registrační formulář funguje — ukládá do DB (stav: `cekajici`)

### Funkční stránky
- ✅ `/kongresy` — seznam aktivních kongresů
- ✅ `/kongresy/[slug]` — detail kongresu + program + registrační formulář
- ✅ `/api/registrace` — POST endpoint pro registraci

---

## Technické dluhy (nutno vyřešit před nasazením)

### Kritické
- ⚠️ **RLS je vypnuté na tabulce `registrace`** — kdokoli může číst i mazat záznamy
  - Vypnuto příkazem: `alter table public.registrace disable row level security`
  - Správné řešení: nastavit RLS politiky až po implementaci admin autentizace

### Méně kritické
- 🧹 Debug `console.log` v `src/app/api/registrace/route.ts` (řádek 30) — smazat před deployem
- 🧹 V `RegistraceFormular.tsx` catch blok zobrazuje technický error message místo přívětivé hlášky

---

## Co zbývá (prioritní pořadí)

### 1. Admin panel (největší blok)
Správa kongresů a registrací přes přihlášené rozhraní.

**Subroute**: `/admin/*`

**Co implementovat:**
- [ ] Přihlašovací stránka (`/admin/login`) — Supabase Auth (email + heslo)
- [ ] Dashboard (`/admin`) — přehled kongresů
- [ ] Seznam registrací pro daný kongres (`/admin/kongresy/[id]/registrace`)
- [ ] Změna stavu registrace: `cekajici` → `potvrzena` / `zrusena`
- [ ] Middleware pro ochranu `/admin/*` routes
- [ ] Admin uživatel vytvořen v Supabase Auth

**Po implementaci admin auth:**
- [ ] Nastavit RLS politiky na `registrace`:
  - anonymous INSERT povolený (registrace bez přihlášení)
  - SELECT/UPDATE/DELETE pouze pro authenticated (admin)

### 2. Emaily (Resend)
- [ ] Potvrdit registraci emailem na adresu uchazeče
- [ ] `RESEND_API_KEY` do `.env.local` a Vercel env vars
- [ ] Šablona emailu (česky, jméno kongresu, ID registrace)

### 3. Nasazení (Vercel)
- [ ] Vytvořit projekt na https://vercel.com
- [ ] Napojit GitHub repo `David13731373/kongres-pwa`
- [ ] Přidat env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)
- [ ] Vercel automaticky buildí při každém push na `main`

### 4. Cleanup před deployem
- [ ] Smazat debug `console.log` z `route.ts`
- [ ] Opravit error hlášku v `RegistraceFormular.tsx`

---

## Klíčové soubory

| Soubor | Popis |
|--------|-------|
| `src/app/kongresy/page.tsx` | Seznam kongresů (SSR, Supabase) |
| `src/app/kongresy/[slug]/page.tsx` | Detail kongresu + formulář |
| `src/app/api/registrace/route.ts` | POST endpoint pro registraci |
| `src/components/kongres/RegistraceFormular.tsx` | React formulář (client component) |
| `src/lib/supabase/server.ts` | Supabase server klient (async cookies) |
| `src/lib/validace.ts` | Zod schéma pro registraci |
| `src/types/database.ts` | Typy generované ze Supabase |
| `supabase/migrations/001_initial.sql` | SQL migrace (tabulky + RLS) |
| `.env.local` | Env vars (není v gitu!) |

---

## Poznámky k prostředí

- **Node**: projekt funguje s Node 18+
- **Supabase klíče**: používat **legacy JWT klíče** (ne nový `sb_publishable_` formát — není kompatibilní s `supabase-js`)
  - Legacy klíče najdeš v: Supabase dashboard → Settings → API → "Legacy API Keys"
- **Next.js 15 breaking changes** (již vyřešeno v kódu):
  - `cookies()` je async — musíš `await cookies()`
  - `params` v page.tsx je `Promise<{slug}>` — musíš `await params`
- **Service role key**: NIKDY nesdílet v chatu, nepushovat do gitu

---

## Jak spustit lokálně

```bash
cd C:\Users\dvhv\Documents\Projekty\Ivanatour\kongres-pwa-fixed\kongres-pwa
npm run dev
```

App běží na: http://localhost:3000
