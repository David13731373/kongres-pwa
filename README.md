# Kongresová PWA

PWA aplikace pro správu a registraci na kongresy.

## Rychlý start

### 1. Klonuj repozitář

```bash
git clone <repo-url> kongres-pwa
cd kongres-pwa
npm install
```

### 2. Nastav prostředí

```bash
cp .env.example .env.local
# Otevři .env.local a vyplň hodnoty (viz níže)
```

### 3. Nastav Supabase

1. Jdi na [supabase.com](https://supabase.com) → vytvoř nový projekt
2. Zkopíruj **Project URL** a **anon key** z Settings → API
3. Zkopíruj **service_role key** (pozor — jen na serveru!)
4. Spusť migrace:

```bash
npx supabase login
npx supabase link --project-ref <TVOJE_PROJECT_REF>
npx supabase db push
```

### 4. Nastav Resend (emaily)

1. Jdi na [resend.com](https://resend.com) → vytvoř API key
2. Přidej a ověř svoji doménu
3. Vlož klíč do `.env.local`

### 5. Spusť lokálně

```bash
npm run dev
# → http://localhost:3000
```

### 6. Deploy na Vercel

```bash
# Napojit GitHub repo na Vercel (nebo přes vercel.com UI)
vercel --prod

# Environment variables nastav v Vercel Dashboard → Settings → Environment Variables
```

## Struktura projektu

```
src/
  app/
    kongresy/          # Seznam a detail kongresů (veřejné)
    admin/             # Správa (chráněno přihlášením)
    api/registrace/    # POST endpoint pro registraci
  components/
    kongres/           # Komponenty pro účastníky
    admin/             # Admin komponenty
    ui/                # Sdílené UI prvky
  lib/
    supabase/          # Klient (browser + server)
    email.ts           # Odesílání emailů přes Resend
    validace.ts        # Zod schémata
  types/
    database.ts        # Typy generované ze Supabase
supabase/
  migrations/          # SQL migrace
```

## Měsíční náklady (produkce)

| Služba | Cena |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Resend | $0 (do 3 000 emailů) |
| Doména | ~30 Kč |
| **Celkem** | **~1 050 Kč/měsíc** |

## Přegenerování TypeScript typů ze Supabase

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
```
