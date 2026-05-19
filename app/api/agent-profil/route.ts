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
    const { agent_id, biens_vendus, experience, google_rating, bio } = body

    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('agents')
      .update({
        biens_vendus: biens_vendus ? parseInt(biens_vendus) : null,
        experience: experience ? parseInt(experience) : null,
        google_rating: google_rating ? parseFloat(google_rating) : null,
        bio: bio || null,
      })
      .eq('id', agent_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}