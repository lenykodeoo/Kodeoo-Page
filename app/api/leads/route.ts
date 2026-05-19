import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, type, nom, email, telephone, message, lead_magnet } = body

    if (!agent_id || !email || !type) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Sauvegarder le lead
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert({
        agent_id,
        type,
        nom: nom || 'Anonyme',
        email,
        telephone: telephone || null,
        message: message || null,
        lead_magnet: lead_magnet || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    // Récupérer l'email de l'agent
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('email, prenom, nom, type')
      .eq('id', agent_id)
      .single()

    // Envoyer l'email à l'agent
    if (agent?.email) {
      const agentName = agent.type === 'agence' ? agent.nom : `${agent.prenom} ${agent.nom}`
      const typeLabels: Record<string, string> = {
        contact: 'Nouveau message',
        estimation: 'Demande d\'estimation',
        lead_magnet: 'Téléchargement de ressource',
      }
      const typeLabel = typeLabels[type] || 'Nouveau lead'

      await resend.emails.send({
        from: 'Kodeoo <notifications@kodeoo.fr>',
        to: agent.email,
        subject: `🔔 ${typeLabel} — ${nom || 'Nouveau prospect'}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1C1C1E">
            <div style="margin-bottom:24px">
              <img src="https://kodeoo.fr/wp-content/uploads/2025/logo.png" alt="Kodeoo" height="28" style="height:28px" />
            </div>
            <div style="background:#fff;border:1px solid #E8E8E8;border-radius:12px;padding:24px;margin-bottom:16px">
              <div style="font-size:13px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">${typeLabel}</div>
              <div style="font-size:22px;font-weight:700;color:#1C1C1E;margin-bottom:20px;letter-spacing:-0.3px">${nom || 'Nouveau prospect'}</div>
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#8E8E93;width:120px">Email</td>
                  <td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#1C1C1E;font-weight:500">${email}</td>
                </tr>
                ${telephone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#8E8E93">Téléphone</td><td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#1C1C1E;font-weight:500">${telephone}</td></tr>` : ''}
                ${message ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#8E8E93;vertical-align:top">Message</td><td style="padding:8px 0;border-bottom:1px solid #F5F5F5;font-size:13px;color:#1C1C1E;line-height:1.6">${message}</td></tr>` : ''}
                ${lead_magnet ? `<tr><td style="padding:8px 0;font-size:13px;color:#8E8E93">Ressource</td><td style="padding:8px 0;font-size:13px;color:#1C1C1E;font-weight:500">${lead_magnet}</td></tr>` : ''}
              </table>
            </div>
            <a href="https://go.kodeoo.fr/dashboard" style="display:inline-flex;align-items:center;height:44px;padding:0 20px;background:#1C1C1E;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
              Voir mes leads →
            </a>
            <div style="margin-top:24px;font-size:12px;color:#C7C7CC;line-height:1.6">
              Vous recevez cet email car vous avez un Kodeoo Link actif.<br>
              <a href="https://kodeoo.fr" style="color:#C7C7CC">kodeoo.fr</a>
            </div>
          </div>
        `
      })
    }

    return NextResponse.json({ success: true, lead })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent_id = searchParams.get('agent_id')

    if (!agent_id) {
      return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })
    }

    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, leads })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}