import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent_id, titre, type, prix, surface, pieces, chambres, ville, description, photos, dpe, source_url } = body

    if (!agent_id || !titre) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { data: bien, error } = await supabaseAdmin
      .from('biens')
      .insert({
        agent_id,
        titre,
        prix,
        surface,
        pieces,
        chambres,
        ville: ville || '',
        description,
        photos: photos || [],
        dpe,
        statut: 'vente',
        source_url,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, bien })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent_id = searchParams.get('agent_id')

    if (!agent_id) {
      return NextResponse.json({ error: 'agent_id requis' }, { status: 400 })
    }

    const { data: biens, error } = await supabaseAdmin
      .from('biens')
      .select('*')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, biens })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { bien_id, agent_id } = await req.json()

    // Récupérer les photos avant suppression
    const { data: bien } = await supabaseAdmin
      .from('biens')
      .select('photos')
      .eq('id', bien_id)
      .single()

    // Supprimer les photos du Storage Supabase
    if (bien?.photos && bien.photos.length > 0) {
      const filePaths = bien.photos
        .filter((url: string) => url.includes('supabase.co/storage'))
        .map((url: string) => {
          const parts = url.split('/biens/')
          return parts[1] ? parts[1].split('?')[0] : null
        })
        .filter(Boolean)

      if (filePaths.length > 0) {
        await supabaseAdmin.storage.from('biens').remove(filePaths)
      }
    }

    const { error } = await supabaseAdmin
      .from('biens')
      .delete()
      .eq('id', bien_id)
      .eq('agent_id', agent_id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
