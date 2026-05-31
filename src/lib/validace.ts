import { z } from 'zod'

export const registraceSchema = z.object({
  kongres_id: z.string().uuid('Neplatné ID kongresu'),
  jmeno: z.string().min(1, 'Jméno je povinné').max(100),
  prijmeni: z.string().min(1, 'Příjmení je povinné').max(100),
  email: z.string().email('Neplatný email'),
  telefon: z.string().optional(),
  organizace: z.string().optional(),
  poznamka: z.string().max(1000).optional(),
})

export type RegistraceInput = z.infer<typeof registraceSchema>
