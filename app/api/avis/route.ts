import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent_id = searchParams.get('agent_id')
    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    const { data: avis, error } = await supabaseAdmin
      .from('avis')
      .select('*')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, avis: avis || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, auteur, texte, note, date_avis } = body

    if (!agent_id || !auteur || !texte) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('avis')
      .insert({ agent_id, auteur, texte, note: note || 5, date_avis: date_avis || null, source: 'manuel' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, avis: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { avis_id, agent_id } = await req.json()
    const { error } = await supabaseAdmin
      .from('avis')
      .delete()
      .eq('id', avis_id)
      .eq('agent_id', agent_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}