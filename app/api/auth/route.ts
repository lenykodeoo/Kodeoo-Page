import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const SECRET = process.env.AUTH_SECRET || 'kodeoo-secret-2026'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const member_id = searchParams.get('member_id')
    const token = searchParams.get('token')

    if (!member_id || !token) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // Vérifier le token
    const expectedToken = Buffer.from(`${member_id}:${SECRET}`).toString('base64').slice(0, 32)
    if (token !== expectedToken) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // Chercher si l'agent existe déjà
    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('id, slug')
      .eq('kodeoo_member_id', member_id)
      .single()

    const destination = agent ? '/dashboard' : '/onboarding'
    const response = NextResponse.redirect(new URL(destination, req.url))

    // Toujours créer le cookie member_id
    response.cookies.set('kodeoo_member_id', member_id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    // Si agent existe, créer aussi le cookie agent_id
    if (agent) {
      response.cookies.set('kodeoo_agent_id', agent.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
      response.cookies.set('kodeoo_slug', agent.slug, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    return response

  } catch (error: any) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
}