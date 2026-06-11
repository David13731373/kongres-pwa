import { Resend } from 'resend'

// Lazy inicializace - new Resend(undefined) vyhazuje chybu uz pri buildu,
// pokud RESEND_API_KEY neni nastaveno (napr. na Vercelu).
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

interface BaseParams {
  email: string
  jmeno: string
  prijmeni: string
  kongresNazev: string
  registraceId: string
}

export async function poslatPotvrzeniPrijeti(params: BaseParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY neni nastaveno')
    return
  }
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: `Registrace prijata - ${params.kongresNazev}`,
    html: `<h2>Dekujeme za registraci, ${params.jmeno} ${params.prijmeni}!</h2>
      <p>Vase registrace na kongres <strong>${params.kongresNazev}</strong> byla prijata a ceka na potvrzeni.</p>
      <p>O dalsim postupu Vas budeme informovat emailem.</p>
      <p style="color:#888;font-size:12px;">Cislo registrace: ${params.registraceId}</p>`,
  })
  if (error) console.error('Email - chyba (prijeti):', error)
}

export async function poslatPotvrzeniUcasti(params: BaseParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY neni nastaveno')
    return
  }
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: `Ucast potvrzena - ${params.kongresNazev}`,
    html: `<h2>Vase ucast byla potvrzena!</h2>
      <p>Tesime se na Vas, ${params.jmeno} ${params.prijmeni}, na kongresu <strong>${params.kongresNazev}</strong>.</p>
      <p>Vice informaci Vam zasleme pred konanim akce.</p>
      <p style="color:#888;font-size:12px;">Cislo registrace: ${params.registraceId}</p>`,
  })
  if (error) console.error('Email - chyba (potvrzeni):', error)
}

export async function poslatZruseniRegistrace(params: BaseParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY neni nastaveno')
    return
  }
  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.email,
    subject: `Registrace zrusena - ${params.kongresNazev}`,
    html: `<h2>Vase registrace byla zrusena</h2>
      <p>Registrace ${params.jmeno} ${params.prijmeni} na kongres <strong>${params.kongresNazev}</strong> byla zrusena.</p>
      <p>V pripade dotazu nas kontaktujte na emailu organizatora.</p>
      <p style="color:#888;font-size:12px;">Cislo registrace: ${params.registraceId}</p>`,
  })
  if (error) console.error('Email - chyba (zruseni):', error)
}
