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
        Insert: {
          nazev: string
          slug: string
          popis?: string | null
          datum_zacatek: string
          datum_konec?: string | null
          misto?: string | null
          aktivni?: boolean
          registrace_otevrena?: boolean
        }
        Update: {
          nazev?: string
          slug?: string
          popis?: string | null
          datum_zacatek?: string
          datum_konec?: string | null
          misto?: string | null
          aktivni?: boolean
          registrace_otevrena?: boolean
        }
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
        Insert: {
          kongres_id: string
          jmeno: string
          prijmeni: string
          email: string
          telefon?: string | null
          organizace?: string | null
          poznamka?: string | null
          stav?: 'cekajici' | 'potvrzena' | 'zrusena'
        }
        Update: {
          kongres_id?: string
          jmeno?: string
          prijmeni?: string
          email?: string
          telefon?: string | null
          organizace?: string | null
          poznamka?: string | null
          stav?: 'cekajici' | 'potvrzena' | 'zrusena'
        }
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
        Insert: {
          kongres_id: string
          cas_od: string
          cas_do?: string | null
          nazev: string
          priznak?: string | null
          poradi: number
        }
        Update: {
          kongres_id?: string
          cas_od?: string
          cas_do?: string | null
          nazev?: string
          priznak?: string | null
          poradi?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
