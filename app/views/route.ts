import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent_id = searchParams.get('agent_id')
    if (!agent_id) return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count: total } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent_id)

    const { count: today } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent_id)
      .gte('created_at', todayStart)

    const { count: month } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent_id)
      .gte('created_at', monthStart)

    return NextResponse.json({
      success: true,
      views: {
        today: today || 0,
        month: month || 0,
        total: total || 0,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}