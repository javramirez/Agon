import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'
import { Resend } from 'resend'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!resend) {
    return NextResponse.json(
      { error: 'Servicio de email no configurado (RESEND_API_KEY).' },
      { status: 503 }
    )
  }

  const agonista = await getCurrentAgonista()
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto asignado' }, { status: 400 })
  }

  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) {
    return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 })
  }
  if (reto.modo !== 'duelo') {
    return NextResponse.json({ error: 'Solo disponible en modo duelo' }, { status: 400 })
  }
  if (!reto.codigoInvitacion) {
    return NextResponse.json({ error: 'Sin código de invitación' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { emailRival } = body as { emailRival: string }
  if (!emailRival || typeof emailRival !== 'string' || !emailRival.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const linkInvitacion = `${appUrl.replace(/\/$/, '')}/unirse/${reto.codigoInvitacion}`
  const nombreSeguro = escapeHtml(agonista.nombre)
  const codigoSeguro = escapeHtml(reto.codigoInvitacion)

  try {
    await resend.emails.send({
      from: 'AGON <noreply@agon-psi.vercel.app>',
      to: emailRival.trim(),
      subject: `${agonista.nombre} te desafía al Gran Agon`,
      html: `
        <div style="background:#080808;color:#f5f5f5;font-family:sans-serif;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;">
          <h1 style="font-size:32px;font-weight:900;letter-spacing:8px;color:#F59E0B;margin:0 0 24px;">AGON</h1>
          <p style="font-size:16px;line-height:1.6;color:#a3a3a3;">
            <strong style="color:#f5f5f5;">${nombreSeguro}</strong> te ha lanzado un desafío.
            29 días. Siete pruebas diarias. Los dioses del Olimpo como testigos.
          </p>
          <p style="font-size:14px;color:#a3a3a3;margin-top:16px;">
            Usa este código para unirte:
          </p>
          <div style="background:#111;border:1px solid #333;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
            <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#F59E0B;">
              ${codigoSeguro}
            </span>
          </div>
          <a
            href="${linkInvitacion.replace(/"/g, '&quot;')}"
            style="display:block;background:#F59E0B;color:#000;text-align:center;padding:16px;border-radius:12px;font-weight:900;font-size:14px;letter-spacing:4px;text-decoration:none;margin-top:24px;"
          >
            ACEPTAR EL DESAFÍO
          </a>
          <p style="font-size:12px;color:#555;margin-top:32px;text-align:center;">
            El Altis registra todo. ¿Estás listo?
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error enviando invitación:', error)
    return NextResponse.json({ error: 'Error al enviar el email' }, { status: 500 })
  }
}
