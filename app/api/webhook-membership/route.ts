import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const event = body.type || ''
    const data = body.data?.object || body

    const customerEmail = 
      data.customer?.email || 
      data.email || 
      body.customer?.email ||
      null

    if (!customerEmail) {
      return NextResponse.json({ success: true, message: 'Pas d\'email trouvé' })
    }

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('id, slug')
      .eq('email', customerEmail)
      .single()

    if (!agent) {
      return NextResponse.json({ success: true, message: 'Aucune page trouvée pour ' + customerEmail })
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