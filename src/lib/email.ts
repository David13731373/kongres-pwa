import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface PotvrzeniParams {
  email: string
  jmeno: string
  kongresNazev: string
  registraceId: string
}

export async function poslatPotvrzeni({ email, jmeno, kongresNazev, registraceId }: PotvrzeniParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY není nastaveno — email neodeslán')
    return
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
    to: email,
    subject: `Potvrzení registrace — ${kongresNazev}`,
    html: `
      <h2>Děkujeme za registraci, ${jmeno}!</h2>
      <p>Vaše registrace na kongres <strong>${kongresNazev}</strong> byla přijata.</p>
      <p>Číslo registrace: <code>${registraceId}</code></p>
      <p>O dalším postupu Vás budeme informovat emailem.</p>
    `,
  })

  if (error) {
    console.error('Chyba při odesílání emailu:', error)
  }
}
