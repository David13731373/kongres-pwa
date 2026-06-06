import { z } from 'zod'

const telefonRegex = /^[+]?[\d\s\-().]{9,20}$/

export const registraceSchema = z.object({
  kongres_id: z.string().uuid('Neplatne ID kongresu'),
  jmeno: z
    .string()
    .min(1, 'Jmeno je povinne')
    .max(100, 'Jmeno je prilis dlouhe'),
  prijmeni: z
    .string()
    .min(1, 'Prijmeni je povinne')
    .max(100, 'Prijmeni je prilis dlouhe'),
  email: z
    .string()
    .min(1, 'Email je povinny')
    .email('Zadejte platnou emailovou adresu (napr. jan.novak@email.cz)'),
  telefon: z
    .string()
    .regex(telefonRegex, 'Zadejte platne telefonni cislo (napr. +420 777 123 456)')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  organizace: z
    .string()
    .max(200, 'Nazev organizace je prilis dlouhy (max 200 znaku)')
    .optional(),
  poznamka: z
    .string()
    .max(1000, 'Poznamka je prilis dlouha (max 1000 znaku)')
    .optional(),
})

export type RegistraceInput = z.infer<typeof registraceSchema>
