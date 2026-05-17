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

    let slug = generateSlug(prenom, nom)

    const { data: existing } = await supabaseAdmin
      .from('agents')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
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

    return NextResponse.json({ success: true, agent, url: `https://go.kodeoo.fr/${slug}` })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}