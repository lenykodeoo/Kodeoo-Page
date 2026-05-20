import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'kodeoo-webhook-secret-2026'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Vérifier la clé secrète
    const secret = req.headers.get('x-webhook-secret') || body.secret
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'ID membre WordPress
    const member_id = body.member_id || body.user_id || body.id
    if (!member_id) {
      return NextResponse.json({ error: 'member_id manquant' }, { status: 400 })
    }

    // Désactiver la page du membre
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('id, slug')
      .eq('kodeoo_member_id', String(member_id))
      .single()

    if (!agent) {
      return NextResponse.json({ success: true, message: 'Aucune page trouvée pour ce membre' })
    }

    await supabaseAdmin
      .from('agents')
      .update({ is_active: false })
      .eq('id', agent.id)

    return NextResponse.json({ 
      success: true, 
      message: `Page ${agent.slug} désactivée pour le membre ${member_id}` 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}