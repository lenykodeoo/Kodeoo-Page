import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const LEAD_MAGNETS = {
  guide_vendeur: 'Guide vendeur 2026',
  checklist_estimation: 'Checklist estimation',
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent_id = searchParams.get('agent_id')
    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    const { data: ressources, error } = await supabaseAdmin
      .from('ressources')
      .select('*')
      .eq('agent_id', agent_id)

    if (error) throw error

    return NextResponse.json({ success: true, ressources: ressources || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const agent_id = formData.get('agent_id') as string
    const lead_magnet_id = formData.get('lead_magnet_id') as string
    const file = formData.get('file') as File | null

    if (!agent_id || !lead_magnet_id) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    let pdf_url = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${agent_id}/${lead_magnet_id}.pdf`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('ressources')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseAdmin.storage
        .from('ressources')
        .getPublicUrl(fileName)

      pdf_url = urlData.publicUrl
    }

    // Upsert — crée ou met à jour
    const { data: existing } = await supabaseAdmin
      .from('ressources')
      .select('id')
      .eq('agent_id', agent_id)
      .eq('lead_magnet_id', lead_magnet_id)
      .single()

    if (existing) {
      const updateData: any = { actif: true }
      if (pdf_url) updateData.pdf_url = pdf_url

      await supabaseAdmin
        .from('ressources')
        .update(updateData)
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('ressources')
        .insert({ agent_id, lead_magnet_id, pdf_url, actif: true })
    }

    return NextResponse.json({ success: true, pdf_url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { agent_id, lead_magnet_id } = await req.json()

    await supabaseAdmin
      .from('ressources')
      .update({ actif: false })
      .eq('agent_id', agent_id)
      .eq('lead_magnet_id', lead_magnet_id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}