// Automaticky generovat příkazem: npx supabase gen types typescript --project-id <ID> > src/types/database.ts
// Tento soubor je placeholder — po napojení Supabase přegenerovat

export type Database = {
  public: {
    Tables: {
      kongresy: {
        Row: {
          id: string
          nazev: string
          slug: string
          popis: string | null
          datum_zacatek: string
          datum_konec: string | null
          misto: string | null
          aktivni: boolean
          registrace_otevrena: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kongresy']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kongresy']['Insert']>
      }
      registrace: {
        Row: {
          id: string
          kongres_id: string
          jmeno: string
          prijmeni: string
          email: string
          telefon: string | null
          organizace: string | null
          poznamka: string | null
          stav: 'cekajici' | 'potvrzena' | 'zrusena'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['registrace']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['registrace']['Insert']>
      }
      program: {
        Row: {
          id: string
          kongres_id: string
          cas_od: string
          cas_do: string | null
          nazev: string
          priznak: string | null
          poradi: number
        }
        Insert: Omit<Database['public']['Tables']['program']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['program']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
