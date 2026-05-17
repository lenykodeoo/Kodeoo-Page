import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Clé secrète partagée entre WordPress et Next.js
// On la mettra dans .env.local
const SECRET = process.env.AUTH_SECRET || 'kodeoo-secret-2026'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const member_id = searchParams.get('member_id')
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect') || '/dashboard'

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

    // Créer la réponse avec cookie de session
    const destination = agent ? '/dashboard' : '/onboarding'
    const response = NextResponse.redirect(new URL(destination, req.url))

    // Stocker l'info membre dans un cookie
    response.cookies.set('kodeoo_member_id', member_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/',
    })

    if (agent) {
      response.cookies.set('kodeoo_agent_id', agent.id, {
        httpOnly: true,
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
