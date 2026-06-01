import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function generateSlug(prenom: string, nom: string): string {
  return (prenom + '-' + nom)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { kodeoo_member_id, prenom, nom, email, telephone, reseau, ville, bio, instagram, tiktok, facebook, linkedin } = body

    if (!prenom || !nom || !email) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Vérifier si le membre a déjà une page
    const { data: existing } = await supabaseAdmin
      .from('agents')
      .select('id, slug')
      .eq('kodeoo_member_id', kodeoo_member_id)
      .single()

    if (existing) {
      // Le membre existe déjà — retourner ses infos
      const response = NextResponse.json({
        success: true,
        agent: existing,
        url: `https://go.kodeoo.fr/${existing.slug}`,
        already_exists: true
      })

      response.cookies.set('kodeoo_agent_id', existing.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      response.cookies.set('kodeoo_slug', existing.slug, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      return response
    }

    // Créer un nouveau slug
    let slug = generateSlug(prenom, nom)

    const { data: slugExists } = await supabaseAdmin
      .from('agents')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (slugExists) {
      slug = slug + '-' + Math.floor(Math.random() * 999)
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        kodeoo_member_id,
        slug,
        prenom,
        nom,
        email,
        telephone,
        reseau,
        ville,
        bio,
        instagram,
        tiktok,
        facebook,
        linkedin,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    const response = NextResponse.json({
      success: true,
      agent,
      url: `https://go.kodeoo.fr/${slug}`
    })

    response.cookies.set('kodeoo_agent_id', agent.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    response.cookies.set('kodeoo_slug', slug, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const agent_id = searchParams.get('agent_id')

    if (!slug && !agent_id) {
      return NextResponse.json({ error: 'slug ou agent_id requis' }, { status: 400 })
    }

    let query = supabaseAdmin.from('agents').select('id, slug, is_active')
    if (slug) query = query.eq('slug', slug)
    if (agent_id) query = query.eq('id', agent_id)

    const { data: agent, error } = await query.single()

    if (error || !agent) {
      return NextResponse.json({ success: false, active: false })
    }

    return NextResponse.json({ success: true, active: agent.is_active, agent })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}