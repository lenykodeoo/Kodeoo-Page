import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, type, nom, email, telephone, message, lead_magnet } = body

    if (!agent_id || !email || !type) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

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