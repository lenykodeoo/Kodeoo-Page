import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const WEBHOOK_SECRET = 'kodeoo-webhook-secret-2026'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Vérifier le secret
    if (body.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const memberId = body.member_id || null

    if (!memberId) {
      return NextResponse.json({ success: true, message: 'Pas de member_id trouvé' })
    }

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('id, slug')
      .eq('kodeoo_member_id', String(memberId))
      .single()

    if (!agent) {
      return NextResponse.json({ success: true, message: 'Aucune page trouvée pour member_id ' + memberId })
    }

    await supabaseAdmin
      .from('agents')
      .update({ is_active: false })
      .eq('id', agent.id)

    return NextResponse.json({ success: true, message: `Page ${agent.slug} désactivée` })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}