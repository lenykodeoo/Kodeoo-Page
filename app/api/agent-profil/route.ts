import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent_id = searchParams.get('agent_id')
    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, agent })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, biens_vendus, experience, google_rating, bio, prenom, nom, nom_agence, reseau, ville, telephone, email, instagram, tiktok, facebook, linkedin, youtube, site_web } = body

    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    const updateData: any = {
      biens_vendus: biens_vendus ? parseInt(biens_vendus) : null,
      experience: experience ? parseInt(experience) : null,
      google_rating: google_rating ? parseFloat(google_rating) : null,
      bio: bio || null,
      ville: ville || null,
      telephone: telephone || null,
      email: email || null,
      instagram: instagram || null,
      tiktok: tiktok || null,
      facebook: facebook || null,
      linkedin: linkedin || null,
      youtube: youtube || null,
      site_web: site_web || null,
      reseau: reseau || null,
    }

    if (prenom !== undefined) updateData.prenom = prenom
    if (nom !== undefined && !nom_agence) updateData.nom = nom
    if (nom_agence !== undefined && nom_agence) updateData.nom = nom_agence
    if (reseau !== undefined) updateData.reseau = reseau

    const { error } = await supabaseAdmin
      .from('agents')
      .update(updateData)
      .eq('id', agent_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { agent_id } = await req.json()
    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    await supabaseAdmin.from('biens').delete().eq('agent_id', agent_id)
    await supabaseAdmin.from('leads').delete().eq('agent_id', agent_id)
    await supabaseAdmin.from('ressources').delete().eq('agent_id', agent_id)
    await supabaseAdmin.from('avis').delete().eq('agent_id', agent_id)
    await supabaseAdmin.from('agents').update({ is_active: false }).eq('id', agent_id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}